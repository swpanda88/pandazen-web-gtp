import { error, json, labelFor, optionMap, readJson, requireDb } from "./_util.js";

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

function inferAssessmentSource(record) {
  if (record.sourceType) return record.sourceType;
  if (record.clientId) return "existing_client";
  if (record.leadId) return "new_prospect";
  return "unknown";
}

function inferAssessmentPurpose(record) {
  if (record.assessmentPurpose) return record.assessmentPurpose;
  const serviceType = String(record.serviceType || "").toLowerCase();
  const frequency = String(record.frequency || "").toLowerCase();
  if (serviceType.includes("deep")) return "deep_clean";
  if (record.clientId) return "one_off_extra_work";
  if (frequency.includes("one") || serviceType.includes("one_off")) return "one_off_extra_work";
  return "base_recurring";
}

function summarizeClientContext(client) {
  const parts = [
    client.assessmentNotes ? `Primary assessment notes: ${client.assessmentNotes}` : "",
    client.accessNotes ? `Access notes: ${client.accessNotes}` : "",
    client.parkingNotes ? `Parking notes: ${client.parkingNotes}` : "",
    client.petNotes ? `Pet notes: ${client.petNotes}` : "",
    client.surfaceNotes ? `Surface notes: ${client.surfaceNotes}` : "",
    client.notes ? `Client internal notes: ${client.notes}` : "",
    client.specialInstructions ? `Cleaning plan notes: ${client.specialInstructions}` : ""
  ].filter(Boolean);
  return parts.join("\n\n") || null;
}

const validAssessmentPurposes = new Set([
  "base_recurring",
  "one_off_extra_work",
  "deep_clean",
  "follow_up",
  "complaint_review",
  "unknown"
]);

async function createAssessmentFromClient(db, body) {
  const clientId = Number(body.clientId || 0);
  if (!clientId) return error("Client ID is required.");

  const client = await db
    .prepare(
      `SELECT c.id, c.lead_id AS leadId, c.customer_name AS name, c.phone, c.email, c.area, c.address,
              c.access_notes AS accessNotes, c.parking_notes AS parkingNotes,
              c.pet_type AS petType, c.pet_other AS petOther, c.pet_notes AS petNotes,
              c.product_preference AS productPreference, c.product_other AS productOther,
              c.surface_notes AS surfaceNotes, c.internal_notes AS notes,
              c.assessment_quote_id AS primaryAssessmentId,
              cp.frequency, cp.default_man_hours AS manHours, cp.special_instructions AS specialInstructions,
              l.postcode, l.property_type AS leadPropertyType, l.bedrooms AS leadBedrooms,
              l.bathrooms AS leadBathrooms, l.priorities AS leadPriorities, l.property_condition AS leadPropertyCondition,
              l.service_type AS leadServiceType, l.product_preferences AS leadProductPreferences,
              aq.service_type AS assessmentServiceType, aq.frequency AS assessmentFrequency,
              aq.property_type AS assessmentPropertyType, aq.bedrooms AS assessmentBedrooms,
              aq.bathrooms AS assessmentBathrooms, aq.property_condition AS assessmentPropertyCondition,
              aq.priorities AS assessmentPriorities, aq.pets AS assessmentPets, aq.parking AS assessmentParking,
              aq.product_preferences AS assessmentProductPreferences, aq.notes AS assessmentNotes
       FROM clients c
       LEFT JOIN cleaning_plans cp ON cp.client_id = c.id AND cp.is_active = 1
       LEFT JOIN leads l ON l.id = c.lead_id
       LEFT JOIN assessment_quotes aq ON aq.id = c.assessment_quote_id
       WHERE c.id = ?
       LIMIT 1`
    )
    .bind(clientId)
    .first();

  if (!client) return error("Client & Home record not found.", 404);

  const requestedPurpose = String(body.purpose || "one_off_extra_work").trim() || "one_off_extra_work";
  const purpose = validAssessmentPurposes.has(requestedPurpose) ? requestedPurpose : "one_off_extra_work";
  const assessmentType = purpose === "deep_clean" ? "client_follow_up" : "client_request";
  const notes = summarizeClientContext(client);

  const result = await db
    .prepare(
      `INSERT INTO assessment_quotes (
        lead_id, client_id, source_type, assessment_purpose, status, assessment_type, quote_stage,
        customer_name, phone, email, area, postcode, service_type, frequency,
        property_type, bedrooms, bathrooms, property_condition, pets, parking,
        priorities, product_preferences, notes
      )
      VALUES (?, ?, 'existing_client', ?, 'draft', ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      client.leadId || null,
      client.id,
      purpose,
      assessmentType,
      client.name,
      client.phone || null,
      client.email || null,
      client.area || null,
      client.postcode || null,
      client.assessmentServiceType || client.leadServiceType || null,
      client.assessmentFrequency || client.frequency || null,
      client.assessmentPropertyType || client.leadPropertyType || null,
      client.assessmentBedrooms || client.leadBedrooms || null,
      client.assessmentBathrooms || client.leadBathrooms || null,
      client.assessmentPropertyCondition || client.leadPropertyCondition || null,
      client.assessmentPets || client.petType || null,
      client.assessmentParking || client.parkingNotes || null,
      client.assessmentPriorities || client.leadPriorities || null,
      client.assessmentProductPreferences || client.productPreference || client.leadProductPreferences || null,
      notes
    )
    .run();

  return json({
    ok: true,
    id: result.meta.last_row_id,
    assessmentQuoteId: result.meta.last_row_id,
    clientId: client.id
  }, { status: 201 });
}

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const labels = await optionMap(db);
    const { results } = await db
      .prepare(
        `SELECT aq.id, aq.lead_id AS leadId, aq.client_id AS clientId, aq.source_type AS sourceType,
                aq.assessment_purpose AS assessmentPurpose, aq.status, aq.assessment_type AS assessmentType,
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
                aq.lost_reason AS lostReason, COALESCE(aq.converted_client_id, c_converted.id) AS convertedClientId,
                aq.created_at AS createdAt, aq.updated_at AS updatedAt,
                l.customer_name AS leadName, l.status AS leadStatus, l.source AS leadSource,
                l.source_other AS leadSourceOther, l.created_at AS leadCreatedAt,
                COALESCE(c_link.customer_name, c_converted.customer_name) AS linkedClientName,
                qa.fit_score AS assistFitScore, qa.price_shopper_risk AS assistPriceShopperRisk,
                qa.travel_suitability AS assistTravelSuitability,
                qa.estimated_first_clean_hours_min AS assistFirstMin,
                qa.estimated_first_clean_hours_max AS assistFirstMax,
                qa.estimated_recurring_hours_min AS assistRecurringMin,
                qa.estimated_recurring_hours_max AS assistRecurringMax,
                qa.suggested_price_min AS assistPriceMin, qa.suggested_price_max AS assistPriceMax,
                qa.minimum_recommended_price AS assistMinimumPrice,
                qa.recommended_next_action AS assistNextAction, qa.confidence AS assistConfidence,
                qa.explanation AS assistExplanation, qa.risk_flags AS assistRiskFlags,
                qa.positive_flags AS assistPositiveFlags, qa.rule_version AS assistRuleVersion,
                qa.created_at AS assistCreatedAt, qa.updated_at AS assistUpdatedAt,
                q.id AS quoteRecordId, q.quote_number AS quoteNumber,
                q.version_number AS quoteVersionNumber, q.display_reference AS quoteDisplayReference,
                q.status AS quoteRecordStatus, q.total_price AS quoteTotalPrice,
                q.recurring_price AS quoteRecurringPrice, q.valid_until AS quoteValidUntil,
                q.created_at AS quoteRecordCreatedAt, q.updated_at AS quoteRecordUpdatedAt
         FROM assessment_quotes aq
         LEFT JOIN leads l ON l.id = aq.lead_id
         LEFT JOIN assessment_quote_assist qa ON qa.assessment_quote_id = aq.id
         LEFT JOIN clients c_converted ON c_converted.assessment_quote_id = aq.id
         LEFT JOIN clients c_link ON c_link.id = aq.client_id
         LEFT JOIN accounting_quotes q ON q.assessment_quote_id = aq.id AND q.version_number = 1
         ORDER BY CASE
             WHEN COALESCE(aq.converted_client_id, c_converted.id) IS NOT NULL OR aq.status = 'converted' THEN 1
             ELSE 0
           END,
           aq.updated_at DESC,
           aq.id DESC`
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
      sourceType: inferAssessmentSource(record),
      assessmentPurpose: inferAssessmentPurpose(record),
      statusLabel: labelFor(labels, "assessment_quote_status", record.status),
      quoteStageLabel: labelFor(labels, "quote_stage", record.quoteStage),
      serviceLabel: labelFor(labels, "service_type", record.serviceType),
      frequencyLabel: labelFor(labels, "frequency", record.frequency),
      leadStatusLabel: labelFor(labels, "lead_status", record.leadStatus),
      leadSourceLabel: labelFor(labels, "lead_source", record.leadSource),
      estimate: hourRange(record.estimatedHoursMin, record.estimatedHoursMax),
      quoteRange: quoteRange(record.suggestedPriceMin, record.suggestedPriceMax),
      quotedPriceLabel: moneyLabel(record.quotedPrice),
      isConverted: Boolean(record.convertedClientId) || String(record.status || "").toLowerCase() === "converted",
      linkedLeadNotes: notesByLead[record.leadId] || [],
      accountingQuote: record.quoteRecordId
        ? {
            id: record.quoteRecordId,
            quoteNumber: record.quoteNumber,
            versionNumber: record.quoteVersionNumber,
            displayReference: record.quoteDisplayReference,
            status: record.quoteRecordStatus,
            totalPrice: record.quoteTotalPrice,
            totalPriceLabel: moneyLabel(record.quoteTotalPrice),
            recurringPrice: record.quoteRecurringPrice,
            recurringPriceLabel: moneyLabel(record.quoteRecurringPrice),
            validUntil: record.quoteValidUntil,
            createdAt: record.quoteRecordCreatedAt,
            updatedAt: record.quoteRecordUpdatedAt
          }
        : null,
      quoteAssist: record.assistFitScore === null || record.assistFitScore === undefined
        ? null
        : {
            fitScore: record.assistFitScore,
            priceShopperRisk: record.assistPriceShopperRisk,
            travelSuitability: record.assistTravelSuitability,
            estimatedFirstCleanHoursMin: record.assistFirstMin,
            estimatedFirstCleanHoursMax: record.assistFirstMax,
            estimatedRecurringHoursMin: record.assistRecurringMin,
            estimatedRecurringHoursMax: record.assistRecurringMax,
            suggestedPriceMin: record.assistPriceMin,
            suggestedPriceMax: record.assistPriceMax,
            suggestedPriceLabel: quoteRange(record.assistPriceMin, record.assistPriceMax),
            minimumRecommendedPrice: record.assistMinimumPrice,
            minimumRecommendedPriceLabel: moneyLabel(record.assistMinimumPrice),
            recommendedNextAction: record.assistNextAction,
            confidence: record.assistConfidence,
            explanation: record.assistExplanation,
            riskFlags: JSON.parse(record.assistRiskFlags || "[]"),
            positiveFlags: JSON.parse(record.assistPositiveFlags || "[]"),
            ruleVersion: record.assistRuleVersion,
            createdAt: record.assistCreatedAt,
            updatedAt: record.assistUpdatedAt
          }
    }));

    return json({ assessmentQuotes, assessments: assessmentQuotes });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);

    if (body.action === "create_from_client") {
      return createAssessmentFromClient(db, body);
    }

    return error("Unsupported assessment create action.");
  } catch (err) {
    return error(err.message, 500);
  }
}
