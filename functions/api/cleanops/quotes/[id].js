import { json, error, requireDb } from "../../_util.js";
import { getQuoteById, updateQuote, QuoteValidationError } from "../../../db/quotes.js";

export async function onRequest(context) {
  if (context.request.method !== "GET" && context.request.method !== "PATCH") {
    return error("Method Not Allowed", 405);
  }

  try {
    const db = requireDb(context.env);
    const id = context.params.id;

    if (context.request.method === "GET") {
      const data = await getQuoteById(db, id);
      if (!data) return error("Quote not found", 404);
      return json({ ok: true, data });
    }

    if (context.request.method === "PATCH") {
      let body;
      try {
        body = await context.request.json();
      } catch {
        return error("Invalid JSON request body.", 400);
      }

      const existing = await getQuoteById(db, id);
      if (!existing) return error("Quote not found", 404);

      await updateQuote(db, id, body);

      const updated = await getQuoteById(db, id);
      return json({ ok: true, data: updated });
    }

  } catch (err) {
    if (err instanceof QuoteValidationError || err?.name === "QuoteValidationError") {
      return error(err.message, err.status);
    }
    console.error("Quote detail API error", err);
    return error("Quote could not be saved. Please try again.", 500);
  }
}
