import { json, error, requireDb } from "../_util.js";
import { listPaymentRecords } from "../../db/payments.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return error("Method Not Allowed", 405);
  }
  try {
    const db = requireDb(context.env);
    const url = new URL(context.request.url);
    const options = {
      invoiceId: url.searchParams.get("invoiceId") || undefined,
      status: url.searchParams.get("status") || undefined
    };

    const data = await listPaymentRecords(db, options);
    return json({ ok: true, data });
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
