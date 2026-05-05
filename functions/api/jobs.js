import { copyPlanChecklistToJob, error, getJobChecklist, json, labelFor, optionMap, readJson, requireDb } from "./_util.js";

async function listJobs(db, labels) {
  const { results } = await db
    .prepare(
      `SELECT j.id, j.client_id AS clientId, c.customer_name AS client, j.recurring_schedule_id AS recurringScheduleId,
              j.cleaning_plan_id AS cleaningPlanId, j.job_type AS type, j.status, j.scheduled_date AS date,
              j.scheduled_time AS time, j.man_hours AS manHours, s.display_name AS mainCleaner,
              h.display_name AS helper, j.special_instructions AS instructions,
              j.completion_notes AS completionNotes, j.completed_at AS completedAt, j.cancelled_reason AS cancelledReason
       FROM jobs j
       JOIN clients c ON c.id = j.client_id
       LEFT JOIN staff s ON s.id = j.main_cleaner_id
       LEFT JOIN staff h ON h.id = j.helper_id
       ORDER BY j.scheduled_date, j.scheduled_time, j.id`
    )
    .all();

  return Promise.all(
    results.map(async (job) => {
      const followups = await db
        .prepare(
          `SELECT id, note, status, created_by AS createdBy, created_at AS createdAt,
                  source_job_id AS sourceJobId, target_job_id AS targetJobId
           FROM job_followups
           WHERE client_id = ? AND status = 'open' AND (target_job_id = ? OR target_job_id IS NULL)
           ORDER BY created_at DESC, id DESC`
        )
        .bind(job.clientId, job.id)
        .all();

      return {
        ...job,
        typeLabel: labelFor(labels, "job_type", job.type),
        statusLabel: labelFor(labels, "job_status", job.status),
        helper: job.helper || "None",
        checklist: await getJobChecklist(db, job.id),
        followups: followups.results
      };
    })
  );
}

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const labels = await optionMap(db);
    return json({ jobs: await listJobs(db, labels) });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (!body.clientId || !body.date) return error("clientId and date are required.");

    const result = await db
      .prepare(
        `INSERT INTO jobs (client_id, recurring_schedule_id, cleaning_plan_id, job_type, status, scheduled_date,
                           scheduled_time, man_hours, main_cleaner_id, helper_id, special_instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        body.clientId,
        body.recurringScheduleId || null,
        body.cleaningPlanId || null,
        body.type || "regular_clean",
        body.status || "scheduled",
        body.date,
        body.time || null,
        body.manHours || null,
        body.mainCleanerId || null,
        body.helperId || null,
        body.instructions || null
      )
      .run();

    const jobId = result.meta.last_row_id;
    if (body.cleaningPlanId) {
      await copyPlanChecklistToJob(db, body.cleaningPlanId, jobId);
    }

    return json({ ok: true, id: jobId }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
