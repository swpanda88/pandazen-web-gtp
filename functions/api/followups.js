import { error, json, readJson, requireDb } from "./_util.js";

export async function onRequestGet({ request, env }) {
  try {
    const db = requireDb(env);
    const url = new URL(request.url);
    const clientId = url.searchParams.get("clientId");
    const jobId = url.searchParams.get("jobId");
    const status = url.searchParams.get("status") || "open";

    let sql = `
      SELECT f.id, f.client_id AS clientId, c.customer_name AS client,
             f.source_job_id AS sourceJobId, f.target_job_id AS targetJobId,
             f.note, f.status, f.created_by AS createdBy, f.created_at AS createdAt,
             f.resolved_at AS resolvedAt
      FROM job_followups f
      JOIN clients c ON c.id = f.client_id
      WHERE f.status = ?`;
    const bindings = [status];

    if (clientId) {
      sql += " AND f.client_id = ?";
      bindings.push(clientId);
    }
    if (jobId) {
      sql += " AND (f.target_job_id = ? OR f.target_job_id IS NULL)";
      bindings.push(jobId);
    }

    sql += " ORDER BY f.created_at DESC, f.id DESC";
    const { results } = await db.prepare(sql).bind(...bindings).all();
    return json({ followups: results });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (!body.clientId || !body.note) {
      return error("clientId and note are required.");
    }

    const result = await db
      .prepare(
        `INSERT INTO job_followups (client_id, source_job_id, target_job_id, note, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        body.clientId,
        body.sourceJobId || null,
        body.targetJobId || null,
        body.note,
        body.status || "open",
        body.createdBy || null
      )
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
