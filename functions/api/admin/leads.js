import { asMoney, error, json, labelFor, optionMap, readJson, requireDb } from "../_util.js";

function parseJsonList(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function quoteAssistRow(row) {
  if (!row?.quoteAssistId) return null;
  return {
    id: row.quoteAssistId,
    fitScore: row.fitScore,
    priceShopperRisk: row.priceShopperRisk,
    travelSuitability: row.travelSuitability,
    estimatedFirstCleanHoursMin: row.estimatedFirstCleanHoursMin,
    estimatedFirstCleanHoursMax: row.estimatedFirstCleanHoursMax,
    estimatedRecurringHoursMin: row.estimatedRecurringHoursMin,
    estimatedRecurringHoursMax: row.estimatedRecurringHoursMax,
    suggestedPriceMin: row.suggestedPriceMin,
    suggestedPriceMax: row.suggestedPriceMax,
    minimumRecommendedPrice: row.minimumRecommendedPrice,
    suggestedPriceLabel:
      row.suggestedPriceMin && row.suggestedPriceMax
        ? `${asMoney(row.suggestedPriceMin)}-${asMoney(row.suggestedPriceMax)}`
        : "Review manually",
    recommendedNextAction: row.recommendedNextAction,
    confidence: row.confidence,
    explanation: row.explanation,
    riskFlags: parseJsonList(row.riskFlags),
    positiveFlags: parseJsonList(row.positiveFlags),
    ruleVersion: row.ruleVersion
  };
}

function leadFromRow(row, labels) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    area: row.area,
    postcode: row.postcode,
    source: row.source,
    sourceLabel: labelFor(labels, "lead_source", row.source),
    serviceType: row.serviceType,
    serviceLabel: labelFor(labels, "service_type", row.serviceType),
    preferredContact: row.preferredContact,
    preferredContactLabel: labelFor(labels, "preferred_contact", row.preferredContact),
    bestContactTime: row.bestContactTime,
    preferredDays: row.preferredDays,
    frequency: row.frequency,
    frequencyLabel: labelFor(labels, "frequency", row.frequency),
    urgency: row.urgency,
    propertyType: row.propertyType,
    propertySize: row.propertySize,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    priorities: parseJsonList(row.priorities),
    pets: row.pets,
    parking: row.parking,
    productPreferences: row.productPreferences,
    photoAvailable: row.photoAvailable,
    status: row.status,
    statusLabel: labelFor(labels, "lead_status", row.status),
    notes: row.notes,
    contact: row.phone || row.email || "",
    privacyPolicyAccepted: Boolean(row.privacyPolicyAccepted),
    marketingOptIn: Boolean(row.marketingOptIn),
    lostReason: row.lostReason,
    anonymiseAfter: row.anonymiseAfter,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    quoteAssist: quoteAssistRow(row)
  };
}

async function listLeads(db, labels) {
  const { results } = await db
    .prepare(
      `SELECT l.id, l.customer_name AS name, l.phone, l.email, l.area, l.postcode, l.source,
              l.service_type AS serviceType, l.preferred_contact AS preferredContact,
              l.best_contact_time AS bestContactTime, l.preferred_days AS preferredDays,
              l.frequency, l.urgency, l.property_type AS propertyType, l.property_size AS propertySize,
              l.bedrooms, l.bathrooms, l.priorities, l.pets, l.parking,
              l.product_preferences AS productPreferences, l.photo_available AS photoAvailable,
              l.status, l.notes, l.privacy_policy_accepted AS privacyPolicyAccepted,
              l.marketing_opt_in AS marketingOptIn, l.lost_reason AS lostReason,
              l.anonymise_after AS anonymiseAfter, l.created_at AS createdAt, l.updated_at AS updatedAt,
              qa.id AS quoteAssistId, qa.fit_score AS fitScore, qa.price_shopper_risk AS priceShopperRisk,
              qa.travel_suitability AS travelSuitability,
              qa.estimated_first_clean_hours_min AS estimatedFirstCleanHoursMin,
              qa.estimated_first_clean_hours_max AS estimatedFirstCleanHoursMax,
              qa.estimated_recurring_hours_min AS estimatedRecurringHoursMin,
              qa.estimated_recurring_hours_max AS estimatedRecurringHoursMax,
              qa.suggested_price_min AS suggestedPriceMin, qa.suggested_price_max AS suggestedPriceMax,
              qa.minimum_recommended_price AS minimumRecommendedPrice,
              qa.recommended_next_action AS recommendedNextAction, qa.confidence,
              qa.explanation, qa.risk_flags AS riskFlags, qa.positive_flags AS positiveFlags,
              qa.rule_version AS ruleVersion
       FROM leads l
       LEFT JOIN lead_quote_assist qa ON qa.lead_id = l.id
       ORDER BY l.updated_at DESC, l.id DESC`
    )
    .all();

  return results.map((row) => leadFromRow(row, labels));
}

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const labels = await optionMap(db);
    return json({ leads: await listLeads(db, labels) });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (!body.name) return error("Customer name is required.");

    const result = await db
      .prepare(
        `INSERT INTO leads (customer_name, phone, email, area, source, service_type, preferred_contact, preferred_days, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        body.name,
        body.phone || null,
        body.email || null,
        body.area || null,
        body.source || "website",
        body.serviceType || "regular_cleaning",
        body.preferredContact || "phone",
        body.preferredDays || null,
        body.status || "new",
        body.notes || null
      )
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
