import { error, json, readJson, requireDb } from "../_util.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
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
      status: body.status,
      notes: body.notes
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
