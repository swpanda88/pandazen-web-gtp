import { json, error, requireDb } from "../_util.js";
import { listJobs } from "../../db/jobs.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return error("Method Not Allowed", 405);
  }
  try {
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const options = {
      status: url.searchParams.get("status") || undefined,
      customerId: url.searchParams.get("customerId") || undefined,
      propertyId: url.searchParams.get("propertyId") || undefined,
      quoteId: url.searchParams.get("quoteId") || undefined,
      search: url.searchParams.get("search") || undefined,
      limit: url.searchParams.has("limit") ? parseInt(url.searchParams.get("limit"), 10) : undefined,
      offset: url.searchParams.has("offset") ? parseInt(url.searchParams.get("offset"), 10) : undefined
    };

    const data = await listJobs(db, options);
    return json({ ok: true, data });
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
