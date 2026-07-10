import { json, error, requireDb } from "../_util.js";
import { listQuotes, getQuoteById, getQuoteByDisplayRef, createQuote } from "../../db/quotes.js";
import { getRequestById } from "../../db/requests.js";
import { getNextDocumentNumber, formatQuoteNumber, formatQuoteDisplayRef } from "../../db/sequences.js";

export async function onRequest(context) {
  if (context.request.method !== "GET" && context.request.method !== "POST") {
    return error("Method Not Allowed", 405);
  }
  try {
    const db = requireDb(context.env);
    const url = new URL(context.request.url);

    if (context.request.method === "POST") {
      const body = await context.request.json();

      if (body.requestId) {
        const existingQuotes = await listQuotes(db, { requestId: body.requestId });
        if (existingQuotes.length > 0) {
          return json({ ok: false, error: "A quote already exists for this request", quoteId: existingQuotes[0].id }, 409);
        }

        const request = await getRequestById(db, body.requestId);
        if (!request) {
          return json({ ok: false, error: "Request not found" }, 400);
        }
        if (body.customerId && request.customerId !== body.customerId) {
          return json({ ok: false, error: "Customer ID does not match the request" }, 400);
        }
        if (body.propertyId && request.propertyId !== body.propertyId) {
          return json({ ok: false, error: "Property ID does not match the request" }, 400);
        }

        // Derive if missing
        body.customerId = body.customerId || request.customerId;
        body.propertyId = body.propertyId || request.propertyId;
      }

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
      if (!data) return error("Not found", 404);
      return json({ ok: true, data });
    }

    const displayRef = url.searchParams.get("displayRef");
    if (displayRef) {
      const data = await getQuoteByDisplayRef(db, displayRef);
      if (!data) return error("Not found", 404);
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
    return error(err.message || "Internal error", 500);
  }
}
