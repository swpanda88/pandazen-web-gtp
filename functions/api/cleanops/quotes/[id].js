import { json, error, requireDb } from "../../_util.js";
import { getQuoteById, updateQuote, updateQuoteStatus } from "../../../db/quotes.js";

export async function onRequest(context) {
  if (context.request.method !== "GET" && context.request.method !== "PATCH") {
    return error("Method Not Allowed", 405);
  }

  try {
    const db = requireDb(context.env);
    const id = context.params.id;

    if (context.request.method === "GET") {
      const data = await getQuoteById(db, id);
      if (!data) return error("Not found", 404);
      return json({ ok: true, data });
    }

    if (context.request.method === "PATCH") {
      const body = await context.request.json();

      const existing = await getQuoteById(db, id);
      if (!existing) return error("Not found", 404);

      await updateQuote(db, id, body);

      const updated = await getQuoteById(db, id);
      return json({ ok: true, data: updated });
    }

  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
