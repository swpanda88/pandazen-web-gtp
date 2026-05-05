import { error, json, readJson, requireDb } from "../_util.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const fields = {
      target_job_id: body.targetJobId,
      note: body.note,
      status: body.status,
      resolved_at: body.status && body.status !== "open" ? new Date().toISOString() : body.resolvedAt
    };

    const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
    if (!entries.length) return error("No fields to update.");

    const setSql = entries.map(([key]) => `${key} = ?`).join(", ");
    await db
      .prepare(`UPDATE job_followups SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(...entries.map(([, value]) => value), params.id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return error(err.message, 500);
  }
}
