import { error, json, readJson, requireDb } from "../_util.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const fields = {
      job_type: body.type,
      status: body.status,
      scheduled_date: body.date,
      scheduled_time: body.time,
      man_hours: body.manHours,
      main_cleaner_id: body.mainCleanerId,
      helper_id: body.helperId,
      special_instructions: body.instructions,
      completion_notes: body.completionNotes,
      completed_at: body.completedAt,
      cancelled_reason: body.cancelledReason
    };

    const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
    if (!entries.length) return error("No fields to update.");

    const setSql = entries.map(([key]) => `${key} = ?`).join(", ");
    await db
      .prepare(`UPDATE jobs SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(...entries.map(([, value]) => value), params.id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return error(err.message, 500);
  }
}
