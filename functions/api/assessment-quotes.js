import { error, json, labelFor, optionMap, requireDb } from "./_util.js";

function moneyLabel(amountPence) {
  if (amountPence === null || amountPence === undefined || amountPence === "") return "";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(Number(amountPence) / 100);
}

function hourRange(min, max) {
  if (!min && !max) return "";
  if (min && max) return `${min}-${max}h`;
  return `${min || max}h`;
}

function quoteRange(min, max) {
  if (!min && !max) return "";
  if (min && max) return `${moneyLabel(min)}-${moneyLabel(max)}`;
  return moneyLabel(min || max);
}

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const labels = await optionMap(db);
    const { results } = await db
      .prepare(
        `SELECT aq.id, aq.lead_id AS leadId, aq.status, aq.assessment_type AS assessmentType,
                aq.quote_stage AS quoteStage, aq.customer_name AS customerName, aq.phone, aq.email,
                aq.area, aq.postcode, aq.service_type AS serviceType, aq.frequency,
                aq.property_type AS propertyType, aq.bedrooms, aq.bathrooms,
                aq.property_condition AS propertyCondition, aq.pets, aq.parking, aq.priorities,
                aq.product_preferences AS productPreferences, aq.notes,
                aq.assessment_notes AS assessmentNotes, aq.quote_notes AS quoteNotes,
                aq.estimated_hours_min AS estimatedHoursMin, aq.estimated_hours_max AS estimatedHoursMax,
                aq.suggested_price_min AS suggestedPriceMin, aq.suggested_price_max AS suggestedPriceMax,
                aq.quoted_price AS quotedPrice, aq.quote_sent_at AS quoteSentAt,
                aq.quote_accepted_at AS quoteAcceptedAt, aq.quote_rejected_at AS quoteRejectedAt,
                aq.lost_reason AS lostReason, aq.converted_client_id AS convertedClientId,
                aq.created_at AS createdAt, aq.updated_at AS updatedAt,
                l.customer_name AS leadName, l.status AS leadStatus, l.source AS leadSource,
                l.source_other AS leadSourceOther, l.created_at AS leadCreatedAt
         FROM assessment_quotes aq
         LEFT JOIN leads l ON l.id = aq.lead_id
         ORDER BY aq.updated_at DESC, aq.id DESC`
      )
      .all();

    const leadIds = results.map((record) => record.leadId).filter(Boolean);
    const notesByLead = {};
    if (leadIds.length) {
      const placeholders = leadIds.map(() => "?").join(", ");
      const notes = await db
        .prepare(
          `SELECT id, lead_id AS leadId, note, note_type AS noteType, created_by AS createdBy,
                  created_at AS createdAt
           FROM lead_notes
           WHERE lead_id IN (${placeholders})
           ORDER BY created_at DESC, id DESC`
        )
        .bind(...leadIds)
        .all();

      notes.results.forEach((note) => {
        if (!notesByLead[note.leadId]) notesByLead[note.leadId] = [];
        notesByLead[note.leadId].push(note);
      });
    }

    const assessmentQuotes = results.map((record) => ({
      ...record,
      client: record.customerName,
      statusLabel: labelFor(labels, "assessment_quote_status", record.status),
      quoteStageLabel: labelFor(labels, "quote_stage", record.quoteStage),
      serviceLabel: labelFor(labels, "service_type", record.serviceType),
      frequencyLabel: labelFor(labels, "frequency", record.frequency),
      leadStatusLabel: labelFor(labels, "lead_status", record.leadStatus),
      leadSourceLabel: labelFor(labels, "lead_source", record.leadSource),
      estimate: hourRange(record.estimatedHoursMin, record.estimatedHoursMax),
      quoteRange: quoteRange(record.suggestedPriceMin, record.suggestedPriceMax),
      quotedPriceLabel: moneyLabel(record.quotedPrice),
      linkedLeadNotes: notesByLead[record.leadId] || []
    }));

    return json({ assessmentQuotes, assessments: assessmentQuotes });
  } catch (err) {
    return error(err.message, 500);
  }
}
