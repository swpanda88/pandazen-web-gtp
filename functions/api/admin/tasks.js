import { error, json, readJson, requireDb } from "../_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const { results } = await db
      .prepare(
        `SELECT id, title, notes, task_type AS taskType, status, priority, due_at AS dueAt,
                linked_type AS linkedType, linked_id AS linkedId, assigned_to AS assignedTo,
                repeat_rule AS repeatRule, created_at AS createdAt, completed_at AS completedAt
         FROM admin_tasks
         ORDER BY
           CASE status WHEN 'Open' THEN 0 WHEN 'Scheduled' THEN 1 ELSE 2 END,
           due_at IS NULL,
           due_at,
           created_at DESC`
      )
      .all();

    return json({ tasks: results });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (!body.title) return error("Task title is required.");

    const result = await db
      .prepare(
        `INSERT INTO admin_tasks (title, notes, task_type, status, priority, due_at, linked_type, linked_id, assigned_to)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        body.title,
        body.notes || null,
        body.taskType || "Other",
        body.status || "Open",
        body.priority || "Normal",
        body.dueAt || null,
        body.linkedType || null,
        body.linkedId || null,
        body.assignedTo || "admin"
      )
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
