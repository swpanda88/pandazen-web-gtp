import { json, error, requireDb } from "../_util.js";
import { listQuotes, getQuoteById, getQuoteByDisplayRef } from "../../db/quotes.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return error("Method Not Allowed", 405);
  }
  try {
    const db = requireDb(context.env);
    const url = new URL(context.request.url);

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
