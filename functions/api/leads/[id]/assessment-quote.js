import { error, json, requireDb } from "../../_util.js";

async function findAssessmentQuote(db, leadId) {
  return db
    .prepare(
      `SELECT id, lead_id AS leadId, status, quote_stage AS quoteStage, customer_name AS customerName,
              phone, email, area, postcode, service_type AS serviceType, frequency,
              property_type AS propertyType, bedrooms, bathrooms, property_condition AS propertyCondition,
              pets, parking, priorities, product_preferences AS productPreferences, notes,
              created_at AS createdAt, updated_at AS updatedAt
       FROM assessment_quotes
       WHERE lead_id = ?
       ORDER BY id ASC
       LIMIT 1`
    )
    .bind(leadId)
    .first();
}

export async function onRequestPost({ env, params }) {
  try {
    const db = requireDb(env);
    const lead = await db
      .prepare(
        `SELECT id, customer_name AS customerName, phone, email, area, postcode, service_type AS serviceType,
                frequency, property_type AS propertyType, bedrooms, bathrooms,
                property_condition AS propertyCondition, pets, parking, priorities,
                product_preferences AS productPreferences, notes, status
         FROM leads
         WHERE id = ?`
      )
      .bind(params.id)
      .first();

    if (!lead) return error("Lead not found.", 404);

    const existing = await findAssessmentQuote(db, lead.id);
    if (existing) {
      return json({ ok: true, id: existing.id, assessmentQuote: existing, alreadyExists: true });
    }

    const result = await db
      .prepare(
        `INSERT INTO assessment_quotes (
          lead_id, status, assessment_type, quote_stage, customer_name, phone, email, area, postcode,
          service_type, frequency, property_type, bedrooms, bathrooms, property_condition, pets, parking,
          priorities, product_preferences, notes
        )
        VALUES (?, 'draft', 'lead_enquiry', 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        lead.id,
        lead.customerName,
        lead.phone || null,
        lead.email || null,
        lead.area || null,
        lead.postcode || null,
        lead.serviceType || null,
        lead.frequency || null,
        lead.propertyType || null,
        lead.bedrooms || null,
        lead.bathrooms || null,
        lead.propertyCondition || null,
        lead.pets || null,
        lead.parking || null,
        lead.priorities || null,
        lead.productPreferences || null,
        lead.notes || null
      )
      .run();

    await db
      .prepare(
        `UPDATE leads
         SET status = 'assessment_created', updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND status NOT IN ('rejected', 'not_suitable', 'converted')`
      )
      .bind(lead.id)
      .run();

    const created = await findAssessmentQuote(db, lead.id);
    return json({ ok: true, id: result.meta.last_row_id, assessmentQuote: created, alreadyExists: false }, { status: 201 });
  } catch (err) {
    const message = String(err.message || "");
    if (message.includes("assessment_quotes.lead_id") || message.includes("idx_assessment_quotes_lead_unique")) {
      const db = requireDb(env);
      const existing = await findAssessmentQuote(db, params.id);
      if (existing) return json({ ok: true, id: existing.id, assessmentQuote: existing, alreadyExists: true });
    }
    return error(err.message, 500);
  }
}
