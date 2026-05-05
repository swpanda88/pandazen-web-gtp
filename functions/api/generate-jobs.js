import { copyPlanChecklistToJob, error, json, readJson, requireDb } from "./_util.js";

const dayIndex = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

function toDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function iso(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function intervalFor(frequency) {
  if (frequency === "fortnightly") return 14;
  if (frequency === "monthly") return 28;
  return 7;
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const start = toDate(body.startDate);
    const end = toDate(body.endDate);
    if (!start || !end) return error("startDate and endDate are required as YYYY-MM-DD.");

    const { results: schedules } = await db
      .prepare(
        `SELECT id, client_id AS clientId, cleaning_plan_id AS cleaningPlanId, frequency, day_of_week AS dayOfWeek,
                start_date AS startDate, end_date AS endDate, default_time AS defaultTime,
                default_man_hours AS defaultManHours, main_cleaner_id AS mainCleanerId, helper_id AS helperId,
                notes
         FROM recurring_schedules
         WHERE status = 'active'`
      )
      .all();

    let created = 0;
    for (const schedule of schedules) {
      const targetDay = dayIndex[schedule.dayOfWeek] ?? start.getUTCDay();
      let cursor = new Date(start);
      const offset = (targetDay - cursor.getUTCDay() + 7) % 7;
      cursor = addDays(cursor, offset);
      const interval = intervalFor(schedule.frequency);

      while (cursor <= end) {
        const dateText = iso(cursor);
        if (!schedule.startDate || dateText >= schedule.startDate) {
          if (!schedule.endDate || dateText <= schedule.endDate) {
            const existing = await db
              .prepare(
                `SELECT id FROM jobs
                 WHERE recurring_schedule_id = ? AND scheduled_date = ?
                 LIMIT 1`
              )
              .bind(schedule.id, dateText)
              .first();

            if (!existing) {
              const result = await db
                .prepare(
                  `INSERT INTO jobs (client_id, recurring_schedule_id, cleaning_plan_id, job_type, status,
                                     scheduled_date, scheduled_time, man_hours, main_cleaner_id, helper_id,
                                     special_instructions)
                   VALUES (?, ?, ?, 'regular_clean', 'scheduled', ?, ?, ?, ?, ?, ?)`
                )
                .bind(
                  schedule.clientId,
                  schedule.id,
                  schedule.cleaningPlanId,
                  dateText,
                  schedule.defaultTime,
                  schedule.defaultManHours,
                  schedule.mainCleanerId,
                  schedule.helperId,
                  schedule.notes
                )
                .run();

              if (schedule.cleaningPlanId) {
                await copyPlanChecklistToJob(db, schedule.cleaningPlanId, result.meta.last_row_id);
              }
              created += 1;
            }
          }
        }
        cursor = addDays(cursor, interval);
      }
    }

    return json({ ok: true, created });
  } catch (err) {
    return error(err.message, 500);
  }
}
