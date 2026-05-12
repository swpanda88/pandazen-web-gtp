import { error, json, readJson, requireDb } from "../_util.js";

const closedStatuses = new Set(["lost", "no_response", "not_suitable", "declined", "rejected", "spam"]);

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const status = body.status;
    if (status && closedStatuses.has(status)) {
      const linkedAssessment = await db
        .prepare("SELECT id FROM assessment_quotes WHERE lead_id = ? LIMIT 1")
        .bind(params.id)
        .first();
      if (linkedAssessment) {
        return error("This lead already has a linked Q&A / Assessment. Close it from the Q&A flow instead of the Lead stage.", 409);
      }
    }

    const fields = {
      customer_name: body.name,
      phone: body.phone,
      email: body.email,
      area: body.area,
      address: body.address,
      source: body.source,
      source_other: body.sourceOther,
      service_type: body.serviceType,
      service_other: body.serviceOther,
      preferred_contact: body.preferredContact,
      preferred_days: body.preferredDays,
      status,
      notes: body.notes,
      lost_reason: closedStatuses.has(status) ? (body.lostReason || status) : body.lostReason,
      closed_at: closedStatuses.has(status) ? new Date().toISOString() : body.closedAt,
      anonymise_after: closedStatuses.has(status)
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
