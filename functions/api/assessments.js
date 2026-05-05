import { error, json, labelFor, optionMap, readJson, requireDb } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const labels = await optionMap(db);
    const { results } = await db
      .prepare(
        `SELECT a.id, a.lead_id AS leadId, a.client_id AS clientId, a.customer_name AS client,
                a.scheduled_date AS date, a.scheduled_time AS time, a.area, a.address, a.status,
                a.service_type AS serviceType, a.frequency, a.estimated_man_hours AS estimate,
                a.product_preference AS productPreference, a.summary_notes AS notes, a.quote_notes AS quoteNotes,
                s.display_name AS mainCleaner, h.display_name AS helper
         FROM assessments a
         LEFT JOIN staff s ON s.id = a.main_cleaner_id
         LEFT JOIN staff h ON h.id = a.helper_id
         ORDER BY a.scheduled_date, a.scheduled_time`
      )
      .all();

    return json({
      assessments: results.map((assessment) => ({
        ...assessment,
        statusLabel: labelFor(labels, "assessment_status", assessment.status),
        serviceLabel: labelFor(labels, "service_type", assessment.serviceType),
        frequencyLabel: labelFor(labels, "frequency", assessment.frequency),
        productLabel: labelFor(labels, "product_preference", assessment.productPreference),
        estimate: assessment.estimate ? `${assessment.estimate} man-hours` : ""
      }))
    });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (!body.client && !body.customerName) return error("Customer name is required.");

    const result = await db
      .prepare(
        `INSERT INTO assessments (lead_id, client_id, customer_name, scheduled_date, scheduled_time, area, address,
                                  status, service_type, frequency, estimated_man_hours, main_cleaner_id,
                                  helper_id, product_preference, summary_notes, quote_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        body.leadId || null,
        body.clientId || null,
        body.client || body.customerName,
        body.date || null,
        body.time || null,
        body.area || null,
        body.address || null,
        body.status || "booked",
        body.serviceType || "regular_cleaning",
        body.frequency || "weekly",
        body.estimatedManHours || null,
        body.mainCleanerId || null,
        body.helperId || null,
        body.productPreference || null,
        body.notes || null,
        body.quoteNotes || null
      )
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
