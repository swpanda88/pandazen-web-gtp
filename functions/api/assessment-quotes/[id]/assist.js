import { runAssessmentQuoteAssist } from "../../_assessmentQuoteAssist.js";
import { error, json, requireDb } from "../../_util.js";

function storedPayload(row) {
  return {
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
    recommendedNextAction: row.recommendedNextAction,
    confidence: row.confidence,
    explanation: row.explanation,
    riskFlags: JSON.parse(row.riskFlags || "[]"),
    positiveFlags: JSON.parse(row.positiveFlags || "[]"),
    ruleVersion: row.ruleVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function onRequestPost({ env, params }) {
  try {
    const db = requireDb(env);
    const record = await db
      .prepare(
        `SELECT id, area, postcode, service_type AS serviceType, frequency,
                property_type AS propertyType, bedrooms, bathrooms,
                property_condition AS propertyCondition, pets, parking, priorities,
                product_preferences AS productPreferences, notes,
                assessment_notes AS assessmentNotes, quote_notes AS quoteNotes,
                estimated_hours_min AS estimatedHoursMin, estimated_hours_max AS estimatedHoursMax
         FROM assessment_quotes
         WHERE id = ?`
      )
      .bind(params.id)
      .first();

    if (!record) return error("Assessment not found.", 404);

    const assist = runAssessmentQuoteAssist(record);
    await db
      .prepare(
        `INSERT INTO assessment_quote_assist (
          assessment_quote_id, fit_score, price_shopper_risk, travel_suitability,
          estimated_first_clean_hours_min, estimated_first_clean_hours_max,
          estimated_recurring_hours_min, estimated_recurring_hours_max,
          suggested_price_min, suggested_price_max, minimum_recommended_price,
          recommended_next_action, confidence, explanation, risk_flags, positive_flags, rule_version
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(assessment_quote_id) DO UPDATE SET
          fit_score = excluded.fit_score,
          price_shopper_risk = excluded.price_shopper_risk,
          travel_suitability = excluded.travel_suitability,
          estimated_first_clean_hours_min = excluded.estimated_first_clean_hours_min,
          estimated_first_clean_hours_max = excluded.estimated_first_clean_hours_max,
          estimated_recurring_hours_min = excluded.estimated_recurring_hours_min,
          estimated_recurring_hours_max = excluded.estimated_recurring_hours_max,
          suggested_price_min = excluded.suggested_price_min,
          suggested_price_max = excluded.suggested_price_max,
          minimum_recommended_price = excluded.minimum_recommended_price,
          recommended_next_action = excluded.recommended_next_action,
          confidence = excluded.confidence,
          explanation = excluded.explanation,
          risk_flags = excluded.risk_flags,
          positive_flags = excluded.positive_flags,
          rule_version = excluded.rule_version,
          updated_at = CURRENT_TIMESTAMP`
      )
      .bind(
        record.id,
        assist.fitScore,
        assist.priceShopperRisk,
        assist.travelSuitability,
        assist.estimatedFirstCleanHoursMin,
        assist.estimatedFirstCleanHoursMax,
        assist.estimatedRecurringHoursMin,
        assist.estimatedRecurringHoursMax,
        assist.suggestedPriceMin,
        assist.suggestedPriceMax,
        assist.minimumRecommendedPrice,
        assist.recommendedNextAction,
        assist.confidence,
        assist.explanation,
        JSON.stringify(assist.riskFlags),
        JSON.stringify(assist.positiveFlags),
        assist.ruleVersion
      )
      .run();

    const stored = await db
      .prepare(
        `SELECT fit_score AS fitScore, price_shopper_risk AS priceShopperRisk,
                travel_suitability AS travelSuitability,
                estimated_first_clean_hours_min AS estimatedFirstCleanHoursMin,
                estimated_first_clean_hours_max AS estimatedFirstCleanHoursMax,
                estimated_recurring_hours_min AS estimatedRecurringHoursMin,
                estimated_recurring_hours_max AS estimatedRecurringHoursMax,
                suggested_price_min AS suggestedPriceMin, suggested_price_max AS suggestedPriceMax,
                minimum_recommended_price AS minimumRecommendedPrice,
                recommended_next_action AS recommendedNextAction, confidence, explanation,
                risk_flags AS riskFlags, positive_flags AS positiveFlags, rule_version AS ruleVersion,
                created_at AS createdAt, updated_at AS updatedAt
         FROM assessment_quote_assist
         WHERE assessment_quote_id = ?`
      )
      .bind(record.id)
      .first();

    return json({ ok: true, quoteAssist: storedPayload(stored) });
  } catch (err) {
    return error(err.message, 500);
  }
}
