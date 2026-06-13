import { json, error, requireDb } from "../_util.js";
import { listCatalogueItems } from "../../db/catalogue.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return error("Method Not Allowed", 405);
  }
  try {
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const options = {
      activeOnly: url.searchParams.get("activeOnly") === "true" || url.searchParams.get("activeOnly") === "1",
      incomeCategory: url.searchParams.get("incomeCategory") || undefined,
      itemType: url.searchParams.get("itemType") || undefined,
      limit: url.searchParams.has("limit") ? parseInt(url.searchParams.get("limit"), 10) : undefined,
      offset: url.searchParams.has("offset") ? parseInt(url.searchParams.get("offset"), 10) : undefined
    };

    const data = await listCatalogueItems(db, options);
    return json({ ok: true, data });
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
