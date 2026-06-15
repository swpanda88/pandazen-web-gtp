import { json, error, requireDb } from "../_util.js";
import { listBillableEvents } from "../../db/billable-events.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return error("Method Not Allowed", 405);
  }
  try {
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const options = {
      status: url.searchParams.get("status") || undefined,
      visitId: url.searchParams.get("visitId") || undefined,
      jobId: url.searchParams.get("jobId") || undefined,
      invoiceId: url.searchParams.get("invoiceId") || undefined,
      limit: url.searchParams.has("limit") ? parseInt(url.searchParams.get("limit"), 10) : undefined,
      offset: url.searchParams.has("offset") ? parseInt(url.searchParams.get("offset"), 10) : undefined
    };

    const data = await listBillableEvents(db, options);
    return json({ ok: true, data });
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
