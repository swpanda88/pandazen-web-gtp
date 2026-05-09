const RATE_PENCE = 3000;

function toNumber(value) {
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function includesAny(values, words) {
  const haystack = Array.isArray(values) ? values.join(" ").toLowerCase() : String(values || "").toLowerCase();
  return words.some((word) => haystack.includes(word));
}

function pushUnique(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

export function runQuoteAssist(lead) {
  const positives = [];
  const risks = [];
  let score = 55;

  const service = lead.serviceType || lead.service_type;
  const frequency = lead.frequency;
  const urgency = lead.urgency;
  const priorities = lead.priorities || "";
  const parking = lead.parking || "";
  const area = String(lead.area || lead.postcode || "").toLowerCase();
  const bedrooms = toNumber(lead.bedrooms);
  const bathrooms = toNumber(lead.bathrooms);

  if (frequency === "weekly" || frequency === "fortnightly") {
    score += 18;
    pushUnique(positives, "Regular recurring work");
  }
  if (service === "regular_cleaning") {
    score += 10;
    pushUnique(positives, "Regular cleaning enquiry");
  }
  if (includesAny(priorities, ["trust", "reliability", "same cleaner", "regular schedule"])) {
    score += 12;
    pushUnique(positives, "Values reliability and continuity");
  }
  if (parking === "driveway" || includesAny(parking, ["driveway", "easy"])) {
    score += 5;
    pushUnique(positives, "Parking looks straightforward");
  }
  if (lead.photoAvailable || lead.photo_available) {
    score += 3;
    pushUnique(positives, "Photos may be available if useful");
  }
  if (includesAny(area, ["durham", "dh1", "dh7", "esh", "shincliffe", "aykley"])) {
    score += 6;
    pushUnique(positives, "Looks within target service area");
  }

  if (service === "one_off_cleaning") {
    score -= 8;
    pushUnique(risks, "One-off work may need tighter pricing");
  }
  if (service === "end_of_tenancy") {
    score -= 5;
    pushUnique(risks, "End-of-tenancy work may need photos or a careful quote boundary");
  }
  if (urgency === "asap" || urgency === "specific_date") {
    score -= 8;
    pushUnique(risks, "Timing may be urgent or constrained");
  }
  if (includesAny(priorities, ["cheapest"])) {
    score -= 28;
    pushUnique(risks, "Possible price-shopper language");
  }
  if (!lead.area && !lead.postcode) {
    score -= 10;
    pushUnique(risks, "Location detail missing");
  }
  if (!lead.preferredDays && !lead.preferred_days_times) {
    score -= 4;
    pushUnique(risks, "Preferred time not provided");
  }

  const baseRecurring = Math.max(2, bedrooms * 0.75 + bathrooms * 0.45 + 0.8);
  const conditionMultiplier = lead.propertyCondition === "deep_clean_first" ? 1.3 : lead.propertyCondition === "busy_home_reset" ? 1.2 : 1;
  const recurringMin = Math.max(2, Math.round(baseRecurring * conditionMultiplier * 2) / 2);
  const recurringMax = recurringMin + (bedrooms >= 4 || bathrooms >= 3 ? 1 : 0.5);
  const firstMultiplier = service === "deep_cleaning" || service === "end_of_tenancy" ? 2 : service === "one_off_cleaning" ? 1.6 : 1.35;
  const firstMin = Math.round(recurringMin * firstMultiplier * 2) / 2;
  const firstMax = Math.round((recurringMax * firstMultiplier + 0.5) * 2) / 2;
  const suggestedPriceMin = Math.round(firstMin * RATE_PENCE);
  const suggestedPriceMax = Math.round(firstMax * RATE_PENCE);
  const minimumRecommendedPrice = Math.max(6000, suggestedPriceMin);

  const priceRisk = includesAny(priorities, ["cheapest"]) ? "High" : risks.length >= 3 ? "Medium" : "Low";
  const travelSuitability = includesAny(area, ["durham", "dh1", "dh7", "esh", "shincliffe", "aykley"]) ? "Good" : area ? "Review" : "Unknown";
  const confidence = bedrooms && bathrooms && service ? "Medium" : "Low";
  score = Math.max(0, Math.min(100, score));

  let nextAction = "Arrange follow-up call";
  if (score >= 78 && frequency !== "one_off") nextAction = "Strong lead - call and consider home visit";
  if (score >= 60 && service === "one_off_cleaning") nextAction = "Quote carefully from form/call, request photos if needed";
  if (service === "end_of_tenancy") nextAction = "Request photos or detailed call before quoting";
  if (score < 45) nextAction = "Review fit before offering availability";

  return {
    fitScore: score,
    priceShopperRisk: priceRisk,
    travelSuitability,
    estimatedFirstCleanHoursMin: firstMin,
    estimatedFirstCleanHoursMax: firstMax,
    estimatedRecurringHoursMin: recurringMin,
    estimatedRecurringHoursMax: recurringMax,
    suggestedPriceMin,
    suggestedPriceMax,
    minimumRecommendedPrice,
    recommendedNextAction: nextAction,
    confidence,
    explanation: `Rule-based first pass using property size, service type, frequency, urgency, priorities and parking. Internal guide only; admin judgement required.`,
    riskFlags: risks,
    positiveFlags: positives,
    ruleVersion: "quote-assist-v1"
  };
}
