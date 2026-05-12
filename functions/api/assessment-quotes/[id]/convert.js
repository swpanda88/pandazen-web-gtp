import { error, json, readJson, requireDb } from "../../_util.js";

async function findClientForQuote(db, quoteId) {
  return db
    .prepare("SELECT id FROM clients WHERE assessment_quote_id = ? LIMIT 1")
    .bind(quoteId)
    .first();
}

async function findClientForLead(db, leadId) {
  if (!leadId) return null;
  return db
    .prepare("SELECT id FROM clients WHERE lead_id = ? LIMIT 1")
    .bind(leadId)
    .first();
}

async function markQuoteConverted(db, quoteId, clientId) {
  await db
    .prepare(
      `UPDATE assessment_quotes
       SET converted_client_id = ?,
           quote_accepted_at = COALESCE(quote_accepted_at, CURRENT_TIMESTAMP),
           quote_stage = 'accepted',
           status = 'converted',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(clientId, quoteId)
    .run();
}

async function linkAccountingQuotesToClient(db, assessmentQuoteId, clientId) {
  await db
    .prepare(
      `UPDATE accounting_quotes
       SET client_id = ?,
           updated_at = CASE
             WHEN client_id IS NULL OR client_id = ? THEN CURRENT_TIMESTAMP
             ELSE updated_at
           END
       WHERE assessment_quote_id = ?
         AND (client_id IS NULL OR client_id = ?)`
    )
    .bind(clientId, clientId, assessmentQuoteId, clientId)
    .run();
}

export async function onRequestPost({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const quote = await db
      .prepare(
        `SELECT aq.id, aq.lead_id AS leadId, aq.converted_client_id AS convertedClientId,
                aq.customer_name AS customerName, aq.phone, aq.email, aq.area, aq.postcode,
                aq.service_type AS serviceType, aq.frequency, aq.property_type AS propertyType,
                aq.bedrooms, aq.bathrooms, aq.property_condition AS propertyCondition,
                aq.pets, aq.parking, aq.priorities, aq.product_preferences AS productPreferences,
                aq.notes, aq.assessment_notes AS assessmentNotes, aq.quote_notes AS quoteNotes,
                aq.quoted_price AS quotedPrice, aq.suggested_price_min AS suggestedPriceMin,
                aq.suggested_price_max AS suggestedPriceMax,
                l.customer_name AS leadName, l.phone AS leadPhone, l.email AS leadEmail,
                l.area AS leadArea, l.address AS leadAddress, l.preferred_contact AS preferredContact,
                l.notes AS leadNotes
         FROM assessment_quotes aq
         LEFT JOIN leads l ON l.id = aq.lead_id
         WHERE aq.id = ?`
      )
      .bind(params.id)
      .first();

    if (!quote) return error("Assessment / Quote not found.", 404);

    const existing = quote.convertedClientId
      ? { id: quote.convertedClientId }
      : await findClientForQuote(db, quote.id) || await findClientForLead(db, quote.leadId);
    if (existing) {
      await db
        .prepare("UPDATE clients SET assessment_quote_id = COALESCE(assessment_quote_id, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(quote.id, existing.id)
        .run();
      await linkAccountingQuotesToClient(db, quote.id, existing.id);
      await markQuoteConverted(db, quote.id, existing.id);
      return json({ ok: true, id: existing.id, alreadyConverted: true });
    }

    const internalNotes = [
      quote.notes,
      quote.assessmentNotes ? `Assessment: ${quote.assessmentNotes}` : "",
      quote.quoteNotes ? `Quote: ${quote.quoteNotes}` : "",
      quote.quotedPrice ? `Quoted price: ${quote.quotedPrice}` : "",
      quote.suggestedPriceMin || quote.suggestedPriceMax ? `Suggested range: ${quote.suggestedPriceMin || ""}-${quote.suggestedPriceMax || ""}` : "",
      quote.leadNotes ? `Original lead: ${quote.leadNotes}` : ""
    ].filter(Boolean).join("\n\n");

    const result = await db
      .prepare(
        `INSERT INTO clients (
          lead_id, assessment_quote_id, customer_name, phone, email, area, address, preferred_contact,
          parking_notes, pet_type, product_preference, internal_notes, converted_at, converted_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`
      )
      .bind(
        quote.leadId || null,
        quote.id,
        quote.customerName || quote.leadName,
        quote.phone || quote.leadPhone || null,
        quote.email || quote.leadEmail || null,
        quote.area || quote.leadArea || null,
        quote.leadAddress || quote.postcode || null,
        quote.preferredContact || "phone",
        quote.parking || null,
        quote.pets || "none",
        quote.productPreferences || null,
        internalNotes || null,
        body.convertedBy || "admin"
      )
      .run();

    const clientId = result.meta.last_row_id;
    await linkAccountingQuotesToClient(db, quote.id, clientId);
    await markQuoteConverted(db, quote.id, clientId);

    return json({ ok: true, id: clientId, alreadyConverted: false }, { status: 201 });
  } catch (err) {
    const message = String(err.message || "");
    if (message.includes("assessment_quote_id") || message.includes("idx_clients_assessment_quote_unique") || message.includes("clients.lead_id")) {
      const db = requireDb(env);
      const quote = await db.prepare("SELECT lead_id AS leadId FROM assessment_quotes WHERE id = ?").bind(params.id).first();
      const existing = await findClientForQuote(db, params.id) || await findClientForLead(db, quote?.leadId);
      if (existing) return json({ ok: true, id: existing.id, alreadyConverted: true });
    }
    return error(err.message, 500);
  }
}
