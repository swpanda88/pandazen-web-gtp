import { error, json, readJson, requireDb } from "../../_util.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const status = body.status;
    const closedStatuses = ["lost", "no_response", "not_suitable", "declined"];
    const fields = {
      customer_name: body.name,
      phone: body.phone,
      email: body.email,
      area: body.area,
      service_type: body.serviceType,
      preferred_contact: body.preferredContact,
      preferred_days: body.preferredDays,
      status,
      notes: body.notes,
      lost_reason: body.lostReason,
      closed_at: closedStatuses.includes(status) ? new Date().toISOString() : body.closedAt,
      anonymise_after: closedStatuses.includes(status)
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        : body.anonymiseAfter
    };

    const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
    if (!entries.length) return error("No fields to update.");

    const setSql = entries.map(([key]) => `${key} = ?`).join(", ");
    await db
      .prepare(`UPDATE leads SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(...entries.map(([, value]) => value), params.id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return error(err.message, 500);
  }
}
