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
    client.address ? `Known address: ${client.address}` : "",
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

function normalizeText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function boolFlag(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  const text = String(value).toLowerCase();
  return text === "true" || text === "1" || text === "on" || text === "yes";
}

const validAssessmentPurposes = new Set([
  "base_recurring",
  "one_off_extra_work",
  "deep_clean",
  "follow_up",
  "complaint_review",
  "unknown"
]);

const purposeFallbackMap = {
  existing_client_extra: "one_off_extra_work",
  new_property_existing_client: "one_off_extra_work",
  cleaner_follow_up: "follow_up",
  complaint_review: "complaint_review",
  after_builders: "one_off_extra_work",
  after_party: "one_off_extra_work",
  spring_clean: "one_off_extra_work",
  bnb_turnover: "one_off_extra_work",
  other: "one_off_extra_work"
};

async function safeFirst(db, sql, binds = []) {
  try {
    return await db.prepare(sql).bind(...binds).first();
  } catch {
    return null;
  }
}

async function loadClientContext(db, clientId) {
  const client = await db
    .prepare(
      `SELECT id, lead_id AS leadId, assessment_quote_id AS primaryAssessmentId,
              customer_name AS name, phone, email, area, address
       FROM clients
       WHERE id = ?
       LIMIT 1`
    )
    .bind(clientId)
    .first();

  if (!client) return null;

  let lead = null;
  if (client.leadId) {
    lead = await safeFirst(
      db,
      `SELECT postcode, property_type AS propertyType, bedrooms, bathrooms,
              priorities, property_condition AS propertyCondition,
              service_type AS serviceType, product_preferences AS productPreferences
       FROM leads
       WHERE id = ?
       LIMIT 1`,
      [client.leadId]
    );
  }

  let primaryAssessment = null;
  if (client.primaryAssessmentId) {
    primaryAssessment = await safeFirst(
      db,
      `SELECT service_type AS serviceType, frequency, property_type AS propertyType,
              bedrooms, bathrooms, property_condition AS propertyCondition,
              priorities, pets, parking, product_preferences AS productPreferences,
              notes AS assessmentNotes
       FROM assessment_quotes
       WHERE id = ?
       LIMIT 1`,
      [client.primaryAssessmentId]
    );
  }

  const clientDetail = await safeFirst(
    db,
    `SELECT access_notes AS accessNotes, parking_notes AS parkingNotes,
            pet_type AS petType, pet_notes AS petNotes,
            product_preference AS productPreference,
            surface_notes AS surfaceNotes, internal_notes AS notes
     FROM clients
     WHERE id = ?
     LIMIT 1`,
    [client.id]
  );

  const cleaningPlan = await safeFirst(
    db,
    `SELECT frequency, special_instructions AS specialInstructions
     FROM cleaning_plans
     WHERE client_id = ? AND is_active = 1
     ORDER BY updated_at DESC, id DESC
     LIMIT 1`,
    [client.id]
  );

  return {
    client: {
      ...client,
      accessNotes: clientDetail?.accessNotes || null,
      parkingNotes: clientDetail?.parkingNotes || null,
      petType: clientDetail?.petType || null,
      petNotes: clientDetail?.petNotes || null,
      productPreference: clientDetail?.productPreference || null,
      surfaceNotes: clientDetail?.surfaceNotes || null,
      notes: clientDetail?.notes || null
    },
    lead,
    primaryAssessment,
    cleaningPlan
  };
}

async function createAssessmentFromClient(db, body) {
  const clientId = Number(body.clientId || 0);
  if (!clientId) return error("Client ID is required.");

  const context = await loadClientContext(db, clientId);
  if (!context?.client) return error("Client & Home record not found.", 404);
  const { client, lead, primaryAssessment, cleaningPlan } = context;
  client.assessmentNotes = primaryAssessment?.assessmentNotes || null;
  client.specialInstructions = cleaningPlan?.specialInstructions || null;

  const propertyMode = normalizeText(body.propertyMode) || "existing_home";
  const prefill = {
    contact: true,
    homeContext: propertyMode === "existing_home",
    accessParking: boolFlag(body.prefill?.accessParking, true),
    petsProducts: boolFlag(body.prefill?.petsProducts, true),
    previousAssessmentNotes: boolFlag(body.prefill?.previousAssessmentNotes, false),
    cleaningPlanNotes: boolFlag(body.prefill?.cleaningPlanNotes, false)
  };

  const requestedPurpose = String(body.assessmentReason || body.purpose || "existing_client_extra").trim() || "existing_client_extra";
  const purpose = validAssessmentPurposes.has(requestedPurpose)
    ? requestedPurpose
    : (purposeFallbackMap[requestedPurpose] || "one_off_extra_work");
  const assessmentType = requestedPurpose === "cleaner_follow_up" || purpose === "follow_up"
    ? "client_follow_up"
    : requestedPurpose === "complaint_review" || purpose === "complaint_review"
      ? "client_review"
      : "client_request";

  const contactName = prefill.contact ? (normalizeText(body.clientName) || client.name) : (normalizeText(body.clientName) || client.name);
  const phone = prefill.contact ? (normalizeText(body.phone) || client.phone || null) : null;
  const email = prefill.contact ? (normalizeText(body.email) || client.email || null) : null;

  const resolvedArea = propertyMode === "another_address"
    ? normalizeText(body.area)
    : propertyMode === "existing_home"
      ? (normalizeText(body.area) || client.area || null)
      : normalizeText(body.area);
  const resolvedPostcode = propertyMode === "another_address"
    ? normalizeText(body.postcode)
    : propertyMode === "existing_home"
      ? (normalizeText(body.postcode) || lead?.postcode || null)
      : normalizeText(body.postcode);
  const resolvedAddress = propertyMode === "another_address"
    ? normalizeText(body.address)
    : propertyMode === "existing_home"
      ? (normalizeText(body.address) || client.address || null)
      : normalizeText(body.address);
  const propertyLabel = propertyMode === "unknown_address"
    ? (normalizeText(body.propertyLabel) || "Address TBC")
    : normalizeText(body.propertyLabel);
  const requestedWorkLabel = normalizeText(body.workLabel);
  const purposeLabel = normalizeText(body.assessmentReasonLabel || body.purposeLabel);
  const workLabel = requestedWorkLabel || (requestedPurpose !== purpose ? purposeLabel : null);
  const serviceType = normalizeText(body.serviceType) || primaryAssessment?.serviceType || lead?.serviceType || null;
  const frequency = normalizeText(body.frequency) || "one_off";
  const useExistingHomeContext = prefill.homeContext && propertyMode === "existing_home";
  const propertyType = propertyMode === "another_address"
    ? normalizeText(body.propertyType)
    : (useExistingHomeContext ? (primaryAssessment?.propertyType || lead?.propertyType || null) : null);
  const bedrooms = useExistingHomeContext ? (primaryAssessment?.bedrooms || lead?.bedrooms || null) : null;
  const bathrooms = useExistingHomeContext ? (primaryAssessment?.bathrooms || lead?.bathrooms || null) : null;
  const propertyCondition = useExistingHomeContext ? (primaryAssessment?.propertyCondition || lead?.propertyCondition || null) : null;
  const pets = prefill.petsProducts ? (normalizeText(body.pets) || primaryAssessment?.pets || client.petType || null) : null;
  const parking = prefill.accessParking ? (normalizeText(body.parking) || primaryAssessment?.parking || client.parkingNotes || null) : null;
  const priorities = useExistingHomeContext ? (primaryAssessment?.priorities || lead?.priorities || null) : null;
  const productPreferences = prefill.petsProducts ? (normalizeText(body.productPreference) || primaryAssessment?.productPreferences || client.productPreference || lead?.productPreferences || null) : null;
  const accessMethod = normalizeText(body.accessMethod);
  const accessNotes = normalizeText(body.accessNotes);
  const surfaceNotes = normalizeText(body.surfaceNotes);
  const initialScopeNotes = normalizeText(body.initialScopeNotes || body.initialNotes);
  const priorityTasks = normalizeText(body.priorityTasks);
  const includedAreas = normalizeText(body.includedAreas);
  const exclusions = normalizeText(body.exclusions);
  const specialRequirements = normalizeText(body.specialRequirements);
  const photosAvailable = normalizeText(body.photosAvailable);
  const internalNotes = normalizeText(body.internalNotes);
  const risksToCheck = normalizeText(body.risksToCheck);

  const noteBlocks = [];
  if (workLabel) noteBlocks.push(`Assessment title: ${workLabel}`);
  if (purposeLabel && purposeLabel !== requestedPurpose) noteBlocks.push(`Requested purpose: ${purposeLabel}`);
  if (propertyLabel) noteBlocks.push(`Property label: ${propertyLabel}`);
  if (propertyMode === "another_address" && resolvedAddress) noteBlocks.push(`Assessment address: ${resolvedAddress}`);
  if (propertyMode === "unknown_address") noteBlocks.push("Assessment address: Address not known yet.");
  if (accessMethod) noteBlocks.push(`Access method: ${accessMethod}`);
  if (accessNotes) noteBlocks.push(`Access notes: ${accessNotes}`);
  if (surfaceNotes) noteBlocks.push(`Surface notes: ${surfaceNotes}`);
  if (prefill.accessParking) {
    if (client.accessNotes) noteBlocks.push(`Access notes: ${client.accessNotes}`);
    if (client.parkingNotes) noteBlocks.push(`Parking notes: ${client.parkingNotes}`);
  }
  if (prefill.petsProducts) {
    if (client.petNotes) noteBlocks.push(`Pet notes: ${client.petNotes}`);
    if (client.surfaceNotes) noteBlocks.push(`Surface notes: ${client.surfaceNotes}`);
  }
  if (prefill.previousAssessmentNotes && client.assessmentNotes) {
    noteBlocks.push(`Previous assessment notes: ${client.assessmentNotes}`);
  }
  if (prefill.cleaningPlanNotes && client.specialInstructions) {
    noteBlocks.push(`Cleaning plan notes: ${client.specialInstructions}`);
  }
  if (internalNotes) noteBlocks.push(`Internal notes: ${internalNotes}`);

  const assessmentNoteBlocks = [
    initialScopeNotes ? `Initial scope notes: ${initialScopeNotes}` : "",
    priorityTasks ? `Priority tasks: ${priorityTasks}` : "",
    includedAreas ? `Areas included: ${includedAreas}` : "",
    specialRequirements ? `Special requirements: ${specialRequirements}` : "",
    risksToCheck ? `Risks / things to check: ${risksToCheck}` : "",
    photosAvailable ? `Photos available: ${photosAvailable}` : ""
  ].filter(Boolean);

  const quoteNoteBlocks = [
    exclusions ? `Exclusions / not included: ${exclusions}` : "",
    specialRequirements ? `Customer-facing special requirements: ${specialRequirements}` : ""
  ].filter(Boolean);

  const notes = noteBlocks.join("\n\n") || null;
  const assessmentNotes = assessmentNoteBlocks.join("\n\n") || null;
  const quoteNotes = quoteNoteBlocks.join("\n\n") || null;

  const result = await db
    .prepare(
      `INSERT INTO assessment_quotes (
        lead_id, client_id, source_type, assessment_purpose, status, assessment_type, quote_stage,
        customer_name, phone, email, area, postcode, service_type, frequency,
        work_label, property_label, property_address,
        property_type, bedrooms, bathrooms, property_condition, pets, parking,
        priorities, product_preferences, notes, assessment_notes, quote_notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      null,
      client.id,
      "existing_client",
      purpose,
      "draft",
      assessmentType,
      "new",
      contactName,
      phone,
      email,
      resolvedArea,
      resolvedPostcode,
      serviceType,
      frequency,
      workLabel,
      propertyLabel,
      resolvedAddress,
      propertyType,
      bedrooms,
      bathrooms,
      propertyCondition,
      pets,
      parking,
      priorities,
      productPreferences,
      notes,
      assessmentNotes,
      quoteNotes
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
                aq.work_label AS workLabel, aq.property_label AS propertyLabel, aq.property_address AS propertyAddress,
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
      return await createAssessmentFromClient(db, body);
    }

    return error("Unsupported assessment create action.");
  } catch (err) {
    return error(err.message, 500);
  }
}
