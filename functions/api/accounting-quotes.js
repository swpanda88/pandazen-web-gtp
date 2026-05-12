import { asMoney, error, json, requireDb } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const { results } = await db
      .prepare(
        `SELECT q.id, q.quote_number AS quoteNumber, q.version_number AS versionNumber,
                q.display_reference AS displayReference, q.assessment_quote_id AS assessmentQuoteId,
                q.lead_id AS leadId, q.client_id AS clientId, q.status,
                q.scope_of_work AS scopeOfWork, q.included_items AS includedItems,
                q.excluded_items AS excludedItems, q.assumptions, q.price_lines AS priceLines,
                q.pricing_notes AS pricingNotes, q.total_price AS totalPrice,
                q.recurring_price AS recurringPrice, q.valid_until AS validUntil,
                q.client_notes AS clientNotes, q.internal_notes AS internalNotes,
                q.sent_at AS sentAt, q.accepted_at AS acceptedAt, q.rejected_at AS rejectedAt,
                q.created_at AS createdAt, q.updated_at AS updatedAt,
                aq.customer_name AS customerName, aq.area, aq.postcode,
                aq.service_type AS serviceType, aq.frequency
         FROM accounting_quotes q
         LEFT JOIN assessment_quotes aq ON aq.id = q.assessment_quote_id
         ORDER BY q.updated_at DESC, q.id DESC`
      )
      .all();

    return json({
      quotes: results.map((quote) => ({
        ...quote,
        totalPriceLabel: quote.totalPrice ? asMoney(quote.totalPrice) : "",
        recurringPriceLabel: quote.recurringPrice ? asMoney(quote.recurringPrice) : ""
      }))
    });
  } catch (err) {
    return error(err.message, 500);
  }
}
