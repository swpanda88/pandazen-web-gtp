import { json, error, requireDb } from "../_util.js";
import { listQuotes, getQuoteById, getQuoteByDisplayRef, createQuote, validateQuoteLines, QuoteValidationError } from "../../db/quotes.js";
import { getRequestById } from "../../db/requests.js";
import { getNextDocumentNumber, formatQuoteNumber, formatQuoteDisplayRef } from "../../db/sequences.js";

const INELIGIBLE_REQUEST_STATUSES = new Set(["archived", "lost", "won", "not_suitable", "deleted"]);

export async function onRequest(context) {
  if (context.request.method !== "GET" && context.request.method !== "POST") {
    return error("Method Not Allowed", 405);
  }
  try {
    const db = requireDb(context.env);
    const url = new URL(context.request.url);

    if (context.request.method === "POST") {
      let body;
      try {
        body = await context.request.json();
      } catch {
        return error("Invalid JSON request body.", 400);
      }

      if (body.requestId) {
        const existingQuotes = await listQuotes(db, { requestId: body.requestId });
        if (existingQuotes.length > 0) {
          return json({ ok: false, error: "A quote already exists for this request", quoteId: existingQuotes[0].id }, 409);
        }

        const request = await getRequestById(db, body.requestId);
        if (!request) {
          return error("Request not found", 404);
        }
        if (INELIGIBLE_REQUEST_STATUSES.has(request.status)) {
          return error("This request cannot be quoted in its current status.", 422);
        }
        if (body.customerId && request.customerId !== body.customerId) {
          return error("Customer ID does not match the request", 422);
        }
        if (body.propertyId && request.propertyId !== body.propertyId) {
          return error("Property ID does not match the request", 422);
        }

        // Derive if missing
        body.customerId = body.customerId || request.customerId;
        body.propertyId = body.propertyId || request.propertyId;
      }

      validateQuoteLines(body.lines || [], body.businessVatStatusSnapshot || "not_registered");

      const seqNum = await getNextDocumentNumber(db, 'quote');
      const quoteNumber = formatQuoteNumber(seqNum);
      const version = 1;
      const displayRef = formatQuoteDisplayRef(quoteNumber, version);

      const id = crypto.randomUUID();
      try {
        const newQuote = await createQuote(db, {
          ...body,
          id,
          quoteNumber,
          version,
          displayRef,
          quoteStatus: "draft",
          documentStatus: "not_generated"
        });
        return json({ ok: true, data: newQuote });
      } catch (err) {
        if (err.message && err.message.includes("UNIQUE constraint failed")) {
          const existingQuotes = await listQuotes(db, { requestId: body.requestId });
          if (existingQuotes.length > 0) {
            return json({ ok: false, error: "A quote already exists for this request", quoteId: existingQuotes[0].id }, 409);
          }
        }
        throw err;
      }
    }


    const id = url.searchParams.get("id");
    if (id) {
      const data = await getQuoteById(db, id);
      if (!data) return error("Quote not found", 404);
      return json({ ok: true, data });
    }

    const displayRef = url.searchParams.get("displayRef");
    if (displayRef) {
      const data = await getQuoteByDisplayRef(db, displayRef);
      if (!data) return error("Quote not found", 404);
      return json({ ok: true, data });
    }

    const options = {
      quoteStatus: url.searchParams.get("quoteStatus") || undefined,
      customerId: url.searchParams.get("customerId") || undefined,
      propertyId: url.searchParams.get("propertyId") || undefined,
      requestId: url.searchParams.get("requestId") || undefined,
      incomeCategory: url.searchParams.get("incomeCategory") || undefined,
      documentStatus: url.searchParams.get("documentStatus") || undefined,
      search: url.searchParams.get("search") || undefined,
      limit: url.searchParams.has("limit") ? parseInt(url.searchParams.get("limit"), 10) : undefined,
      offset: url.searchParams.has("offset") ? parseInt(url.searchParams.get("offset"), 10) : undefined
    };

    const data = await listQuotes(db, options);
    return json({ ok: true, data });
  } catch (err) {
    if (err instanceof QuoteValidationError || err?.name === "QuoteValidationError") {
      return error(err.message, err.status);
    }
    console.error("Quote API error", err);
    return error("Quote could not be saved. Please try again.", 500);
  }
}
