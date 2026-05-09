import { error, json, readJson, requireDb } from "../../../_util.js";

export async function onRequestPost({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (!body.note) return error("Note is required.");

    const result = await db
      .prepare(
        `INSERT INTO lead_notes (lead_id, note, note_type, created_by)
         VALUES (?, ?, ?, ?)`
      )
      .bind(params.id, body.note, body.noteType || "general", body.createdBy || "admin")
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
