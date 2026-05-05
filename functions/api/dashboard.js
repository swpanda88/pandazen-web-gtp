import { asMoney, error, json, labelFor, optionMap, requireDb } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const labels = await optionMap(db);

    const [newLeads, assessments, jobs, unpaid, attention, today] = await Promise.all([
      db.prepare("SELECT COUNT(*) AS count FROM leads WHERE status IN ('new', 'contacted')").first(),
      db.prepare("SELECT COUNT(*) AS count FROM assessments WHERE status = 'booked'").first(),
      db.prepare("SELECT COUNT(*) AS count FROM jobs WHERE status = 'scheduled'").first(),
      db.prepare("SELECT COALESCE(SUM(amount_pence), 0) AS amount FROM invoices WHERE status IN ('sent', 'overdue')").first(),
      db
        .prepare(
          `SELECT id, customer_name AS name, area, status, service_type AS serviceType, notes
           FROM leads
           WHERE status IN ('new', 'contacted', 'assessment_booked', 'quote_sent')
           ORDER BY updated_at DESC
           LIMIT 5`
        )
        .all(),
      db
        .prepare(
          `SELECT j.id, c.customer_name AS client, j.job_type AS type, j.scheduled_date AS date,
                  j.scheduled_time AS time, j.man_hours AS manHours, s.display_name AS mainCleaner,
                  h.display_name AS helper
           FROM jobs j
           JOIN clients c ON c.id = j.client_id
           LEFT JOIN staff s ON s.id = j.main_cleaner_id
           LEFT JOIN staff h ON h.id = j.helper_id
           WHERE j.status = 'scheduled'
           ORDER BY j.scheduled_date, j.scheduled_time
           LIMIT 1`
        )
        .first()
    ]);

    return json({
      metrics: {
        newEnquiries: newLeads.count,
        assessmentsThisWeek: assessments.count,
        scheduledJobs: jobs.count,
        unpaidInvoices: asMoney(unpaid.amount)
      },
      attention: attention.results.map((lead) => ({
        ...lead,
        statusLabel: labelFor(labels, "lead_status", lead.status),
        serviceLabel: labelFor(labels, "service_type", lead.serviceType)
      })),
      today: today
        ? {
            ...today,
            typeLabel: labelFor(labels, "job_type", today.type),
            helper: today.helper || "None"
          }
        : null
    });
  } catch (err) {
    return error(err.message, 500);
  }
}
