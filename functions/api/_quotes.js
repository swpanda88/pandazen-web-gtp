export function displayReference(quoteNumber, versionNumber) {
  return `Q-${String(quoteNumber).padStart(5, "0")}/${String(versionNumber).padStart(2, "0")}`;
}

const baseQuoteSelect = `SELECT q.id, q.quote_number AS quoteNumber, q.version_number AS versionNumber,
        q.display_reference AS displayReference, q.assessment_quote_id AS assessmentQuoteId,
        q.lead_id AS leadId, q.client_id AS clientId, q.status,
        q.scope_of_work AS scopeOfWork, q.included_items AS includedItems,
        q.excluded_items AS excludedItems, q.assumptions, q.price_lines AS priceLines,
        q.pricing_notes AS pricingNotes, q.total_price AS totalPrice,
        q.recurring_price AS recurringPrice, q.valid_until AS validUntil,
        q.client_notes AS clientNotes, q.internal_notes AS internalNotes,
        q.sent_at AS sentAt, q.accepted_at AS acceptedAt, q.rejected_at AS rejectedAt,
        q.expired_at AS expiredAt, q.voided_at AS voidedAt,
        q.superseded_by_quote_id AS supersededByQuoteId,
        q.created_at AS createdAt, q.updated_at AS updatedAt,
        aq.customer_name AS customerName, aq.area, aq.postcode,
        aq.service_type AS serviceType, aq.frequency,
        c.customer_name AS clientName
 FROM accounting_quotes q
 LEFT JOIN assessment_quotes aq ON aq.id = q.assessment_quote_id
 LEFT JOIN clients c ON c.id = q.client_id`;

export async function getQuoteById(db, quoteId) {
  return db
    .prepare(
      `${baseQuoteSelect}
       WHERE q.id = ?`
    )
    .bind(quoteId)
    .first();
}

export async function listQuotes(db, filters = {}) {
  const clauses = [];
  const values = [];

  if (filters.id !== undefined && filters.id !== null) {
    clauses.push("q.id = ?");
    values.push(filters.id);
  }
  if (filters.assessmentQuoteId !== undefined && filters.assessmentQuoteId !== null) {
    clauses.push("q.assessment_quote_id = ?");
    values.push(filters.assessmentQuoteId);
  }
  if (filters.leadId !== undefined && filters.leadId !== null) {
    clauses.push("q.lead_id = ?");
    values.push(filters.leadId);
  }
  if (filters.clientId !== undefined && filters.clientId !== null) {
    clauses.push("q.client_id = ?");
    values.push(filters.clientId);
  }

  const whereSql = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const { results } = await db
    .prepare(
      `${baseQuoteSelect}
       ${whereSql}
       ORDER BY COALESCE(q.quote_number, q.id) DESC, q.version_number DESC, q.id DESC`
    )
    .bind(...values)
    .all();

  return results;
}

async function findDraftQuoteForAssessment(db, assessmentQuoteId) {
  return db
    .prepare(
      `${baseQuoteSelect}
       WHERE q.assessment_quote_id = ?
         AND q.status = 'draft'
       ORDER BY q.version_number DESC, q.id DESC
       LIMIT 1`
    )
    .bind(assessmentQuoteId)
    .first();
}

async function quoteSeedForAssessment(db, assessmentQuoteId) {
  return db
    .prepare(
      `SELECT aq.id, aq.lead_id AS leadId, aq.converted_client_id AS convertedClientId,
              aq.customer_name AS customerName, aq.service_type AS serviceType, aq.frequency,
              aq.property_type AS propertyType, aq.bedrooms, aq.bathrooms, aq.priorities, aq.notes,
              aq.assessment_notes AS assessmentNotes, aq.quote_notes AS quoteNotes,
              aq.suggested_price_min AS suggestedPriceMin, aq.suggested_price_max AS suggestedPriceMax,
              aq.quoted_price AS quotedPrice
       FROM assessment_quotes aq
       WHERE aq.id = ?`
    )
    .bind(assessmentQuoteId)
    .first();
}

async function existingClientIdForAssessment(db, assessmentQuoteId, convertedClientId) {
  if (convertedClientId) return convertedClientId;
  const client = await db
    .prepare("SELECT id FROM clients WHERE assessment_quote_id = ? LIMIT 1")
    .bind(assessmentQuoteId)
    .first();
  return client?.id || null;
}

function scopeFromAssessment(assessment) {
  return [
    assessment.serviceType ? `Service: ${assessment.serviceType}` : "",
    assessment.frequency ? `Frequency: ${assessment.frequency}` : "",
    assessment.propertyType ? `Property: ${assessment.propertyType}` : "",
    assessment.bedrooms || assessment.bathrooms
      ? `Rooms: ${assessment.bedrooms || "?"} bed / ${assessment.bathrooms || "?"} bath`
      : "",
    assessment.priorities ? `Priorities: ${assessment.priorities}` : ""
  ].filter(Boolean).join("\n");
}

function notesFromAssessment(assessment) {
  return [
    assessment.notes,
    assessment.assessmentNotes ? `Assessment notes: ${assessment.assessmentNotes}` : "",
    assessment.quoteNotes ? `Q&A quote notes: ${assessment.quoteNotes}` : ""
  ].filter(Boolean).join("\n\n");
}

export async function createDraftQuote(db, assessmentQuoteId) {
  const seed = await quoteSeedForAssessment(db, assessmentQuoteId);
  if (!seed) {
    throw new Error("Assessment / Quote not found.");
  }

  const existingDraft = await findDraftQuoteForAssessment(db, assessmentQuoteId);
  if (existingDraft) {
    return { quote: existingDraft, alreadyExists: true };
  }

  const existingQuotes = await listQuotes(db, { assessmentQuoteId });
  const highestVersion = existingQuotes.reduce((max, quote) => Math.max(max, Number(quote.versionNumber) || 0), 0);
  const versionNumber = highestVersion + 1;
  const quoteNumber = existingQuotes.reduce((current, quote) => {
    if (current) return current;
    return quote.quoteNumber || null;
  }, null);
  const clientId = await existingClientIdForAssessment(db, assessmentQuoteId, seed.convertedClientId);

  const result = await db
    .prepare(
      `INSERT INTO accounting_quotes (
        quote_number, version_number, assessment_quote_id, lead_id, client_id, status,
        scope_of_work, pricing_notes, total_price, internal_notes
      )
      VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?)`
    )
    .bind(
      quoteNumber,
      versionNumber,
      seed.id,
      seed.leadId || null,
      clientId,
      scopeFromAssessment(seed) || null,
      seed.quoteNotes || null,
      seed.quotedPrice || seed.suggestedPriceMax || seed.suggestedPriceMin || null,
      notesFromAssessment(seed) || null
    )
    .run();

  const quoteId = result.meta.last_row_id;
  const resolvedQuoteNumber = quoteNumber || quoteId;
  const reference = displayReference(resolvedQuoteNumber, versionNumber);

  await db
    .prepare(
      `UPDATE accounting_quotes
       SET quote_number = ?, display_reference = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(resolvedQuoteNumber, reference, quoteId)
    .run();

  const created = await getQuoteById(db, quoteId);
  return { quote: created, alreadyExists: false };
}
