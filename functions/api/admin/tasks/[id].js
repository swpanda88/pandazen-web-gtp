import { error, json, readJson, requireDb } from "../../_util.js";

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const fields = {
      title: body.title,
      notes: body.notes,
      task_type: body.taskType,
      status: body.status,
      priority: body.priority,
      due_at: body.dueAt,
      assigned_to: body.assignedTo,
      completed_at: body.status === "Done" ? new Date().toISOString() : body.completedAt
    };
    const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
    if (!entries.length) return error("No fields to update.");

    const setSql = entries.map(([key]) => `${key} = ?`).join(", ");
    await db
      .prepare(`UPDATE admin_tasks SET ${setSql} WHERE id = ?`)
      .bind(...entries.map(([, value]) => value), params.id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return error(err.message, 500);
  }
}
