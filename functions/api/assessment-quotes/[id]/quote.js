import { error, json, requireDb } from "../../_util.js";

function displayReference(quoteNumber, versionNumber) {
  return `Q-${String(quoteNumber).padStart(5, "0")}/${String(versionNumber).padStart(2, "0")}`;
}

async function findQuoteForAssessment(db, assessmentQuoteId) {
  return db
    .prepare(
      `SELECT id, quote_number AS quoteNumber, version_number AS versionNumber,
              display_reference AS displayReference, assessment_quote_id AS assessmentQuoteId,
              lead_id AS leadId, client_id AS clientId, status, scope_of_work AS scopeOfWork,
              included_items AS includedItems, excluded_items AS excludedItems, assumptions,
              price_lines AS priceLines, pricing_notes AS pricingNotes, total_price AS totalPrice,
              recurring_price AS recurringPrice, valid_until AS validUntil,
              client_notes AS clientNotes, internal_notes AS internalNotes,
              sent_at AS sentAt, accepted_at AS acceptedAt, rejected_at AS rejectedAt,
              created_at AS createdAt, updated_at AS updatedAt
       FROM accounting_quotes
       WHERE assessment_quote_id = ?
       ORDER BY version_number ASC, id ASC
       LIMIT 1`
    )
    .bind(assessmentQuoteId)
    .first();
}

function scopeFromQuote(quote) {
  return [
    quote.serviceType ? `Service: ${quote.serviceType}` : "",
    quote.frequency ? `Frequency: ${quote.frequency}` : "",
    quote.propertyType ? `Property: ${quote.propertyType}` : "",
    quote.bedrooms || quote.bathrooms ? `Rooms: ${quote.bedrooms || "?"} bed / ${quote.bathrooms || "?"} bath` : "",
    quote.priorities ? `Priorities: ${quote.priorities}` : ""
  ].filter(Boolean).join("\n");
}

function notesFromQuote(quote) {
  return [
    quote.notes,
    quote.assessmentNotes ? `Assessment notes: ${quote.assessmentNotes}` : "",
    quote.quoteNotes ? `Q&A quote notes: ${quote.quoteNotes}` : ""
  ].filter(Boolean).join("\n\n");
}

export async function onRequestPost({ env, params }) {
  try {
    const db = requireDb(env);
    const assessmentQuoteId = params.id;
    const quote = await db
      .prepare(
        `SELECT aq.id, aq.lead_id AS leadId, aq.customer_name AS customerName,
                aq.service_type AS serviceType, aq.frequency, aq.property_type AS propertyType,
                aq.bedrooms, aq.bathrooms, aq.priorities, aq.notes,
                aq.assessment_notes AS assessmentNotes, aq.quote_notes AS quoteNotes,
                aq.suggested_price_min AS suggestedPriceMin, aq.suggested_price_max AS suggestedPriceMax,
                aq.quoted_price AS quotedPrice
         FROM assessment_quotes aq
         WHERE aq.id = ?`
      )
      .bind(assessmentQuoteId)
      .first();

    if (!quote) return error("Assessment / Quote not found.", 404);

    const existing = await findQuoteForAssessment(db, assessmentQuoteId);
    if (existing) {
      return json({ ok: true, id: existing.id, accountingQuote: existing, alreadyExists: true });
    }

    const versionNumber = 1;
    const result = await db
      .prepare(
        `INSERT INTO accounting_quotes (
          version_number, assessment_quote_id, lead_id, client_id, status,
          scope_of_work, pricing_notes, total_price, internal_notes
        )
        VALUES (?, ?, ?, NULL, 'draft', ?, ?, ?, ?)`
      )
      .bind(
        versionNumber,
        quote.id,
        quote.leadId || null,
        scopeFromQuote(quote) || null,
        quote.quoteNotes || null,
        quote.quotedPrice || quote.suggestedPriceMax || quote.suggestedPriceMin || null,
        notesFromQuote(quote) || null
      )
      .run();

    const quoteId = result.meta.last_row_id;
    const reference = displayReference(quoteId, versionNumber);
    await db
      .prepare(
        `UPDATE accounting_quotes
         SET quote_number = ?, display_reference = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(quoteId, reference, quoteId)
      .run();

    const created = await findQuoteForAssessment(db, assessmentQuoteId);
    return json({ ok: true, id: quoteId, accountingQuote: created, alreadyExists: false }, { status: 201 });
  } catch (err) {
    const message = String(err.message || "");
    if (message.includes("idx_accounting_quotes_assessment_version") || message.includes("UNIQUE constraint failed")) {
      const db = requireDb(env);
      const existing = await findQuoteForAssessment(db, params.id);
      if (existing) return json({ ok: true, id: existing.id, accountingQuote: existing, alreadyExists: true });
    }
    return error(err.message, 500);
  }
}
