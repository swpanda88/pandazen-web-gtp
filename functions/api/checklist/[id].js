import { error, json, readJson, requireDb } from "../_util.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    await db
      .prepare(
        `UPDATE job_checklist_items
         SET completed = ?, completed_at = CASE WHEN ? = 1 THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE NULL END,
             completion_note = COALESCE(?, completion_note),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(body.completed ? 1 : 0, body.completed ? 1 : 0, body.completionNote || null, params.id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return error(err.message, 500);
  }
}
