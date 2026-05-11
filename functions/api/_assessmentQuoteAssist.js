const RATE_PENCE = 3000;
const MINIMUM_BOOKING_HOURS = 2;

function toNumber(value) {
  const match = String(value || "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function includesAny(values, words) {
  const haystack = Array.isArray(values) ? values.join(" ").toLowerCase() : String(values || "").toLowerCase();
  return words.some((word) => haystack.includes(word));
}

function pushUnique(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

function roundHalf(value) {
  return Math.round(value * 2) / 2;
}

export function runAssessmentQuoteAssist(record) {
  const positives = [];
  const risks = [];
  let score = 55;

  const service = record.serviceType || record.service_type;
  const frequency = record.frequency;
  const area = String(record.area || record.postcode || "").toLowerCase();
  const priorities = record.priorities || "";
  const notes = [record.notes, record.assessmentNotes, record.quoteNotes].filter(Boolean).join(" ");
  const parking = record.parking || "";
  const pets = record.pets || "";
  const bedrooms = toNumber(record.bedrooms);
  const bathrooms = toNumber(record.bathrooms);
  const givenMin = Number(record.estimatedHoursMin || 0);
  const givenMax = Number(record.estimatedHoursMax || 0);

  if (frequency === "weekly" || frequency === "fortnightly") {
    score += 18;
    pushUnique(positives, "Regular recurring work");
  }
  if (service === "regular_cleaning") {
    score += 10;
    pushUnique(positives, "Regular cleaning scope");
  }
  if (includesAny([priorities, notes], ["trust", "reliable", "same cleaner", "consistency", "safety"])) {
    score += 12;
    pushUnique(positives, "Values trust and reliability");
  }
  if (includesAny(area, ["durham", "dh1", "dh7", "esh", "shincliffe", "aykley"])) {
    score += 6;
    pushUnique(positives, "Looks within target service area");
  }
  if (parking === "driveway" || includesAny(parking, ["driveway", "easy", "private"])) {
    score += 5;
    pushUnique(positives, "Parking looks straightforward");
  }
  if (record.assessmentNotes || record.quoteNotes || givenMin || givenMax) {
    score += 6;
    pushUnique(positives, "Q&A record has useful working detail");
  }

  if (service === "one_off_cleaning") {
    score -= 8;
    pushUnique(risks, "One-off work may need tighter quote boundaries");
  }
  if (service === "deep_cleaning") {
    score -= 3;
    pushUnique(risks, "Deep clean scope needs careful expectation setting");
  }
  if (service === "end_of_tenancy") {
    score -= 6;
    pushUnique(risks, "End-of-tenancy work needs clear scope and photos");
  }
  if (includesAny([priorities, notes], ["cheap", "cheapest", "lowest price", "budget"])) {
    score -= 28;
    pushUnique(risks, "Possible price-shopper language");
  }
  if (includesAny([record.propertyCondition, notes], ["heavy", "very dirty", "mould", "hoarder", "bad condition"])) {
    score -= 8;
    pushUnique(risks, "Property condition may increase first-clean effort");
  }
  if (!record.area && !record.postcode) {
    score -= 10;
    pushUnique(risks, "Location detail missing");
  }
  if (!bedrooms && !bathrooms && !givenMin && !givenMax) {
    score -= 10;
    pushUnique(risks, "Property size or hour estimate missing");
  }
  if (pets && pets !== "none") {
    pushUnique(risks, "Pets may affect access, products or time planning");
  }
  if (!parking) {
    pushUnique(risks, "Parking/access detail not recorded yet");
  }

  const baseRecurring = Math.max(
    MINIMUM_BOOKING_HOURS,
    givenMin || bedrooms * 0.75 + bathrooms * 0.5 + 0.8 || MINIMUM_BOOKING_HOURS
  );
  const conditionMultiplier = includesAny(record.propertyCondition, ["heavy", "deep", "reset"]) ? 1.25 : 1;
  const recurringMin = roundHalf(Math.max(MINIMUM_BOOKING_HOURS, baseRecurring * conditionMultiplier));
  const recurringMax = roundHalf(Math.max(givenMax || 0, recurringMin + (bedrooms >= 4 || bathrooms >= 3 ? 1 : 0.5)));
  const firstMultiplier = service === "deep_cleaning" || service === "end_of_tenancy" ? 2 : service === "one_off_cleaning" ? 1.6 : 1.35;
  const firstMin = roundHalf(Math.max(MINIMUM_BOOKING_HOURS, recurringMin * firstMultiplier));
  const firstMax = roundHalf(Math.max(firstMin + 0.5, recurringMax * firstMultiplier + 0.5));

  const suggestedPriceMin = Math.round(firstMin * RATE_PENCE);
  const suggestedPriceMax = Math.round(firstMax * RATE_PENCE);
  const minimumRecommendedPrice = Math.max(MINIMUM_BOOKING_HOURS * RATE_PENCE, suggestedPriceMin);
  const priceRisk = includesAny([priorities, notes], ["cheap", "cheapest", "lowest price", "budget"]) ? "High" : risks.length >= 3 ? "Medium" : "Low";
  const travelSuitability = includesAny(area, ["durham", "dh1", "dh7", "esh", "shincliffe", "aykley"]) ? "Good" : area ? "Review" : "Unknown";
  const confidence = (bedrooms || givenMin) && (bathrooms || givenMax) && service ? (record.assessmentNotes || record.quoteNotes ? "High" : "Medium") : "Low";
  score = Math.max(0, Math.min(100, score));

  let nextAction = "Review Q&A record and confirm scope before quoting";
  if (score >= 78 && frequency !== "one_off") nextAction = "Strong fit - prepare quote or arrange final scope call";
  if (score >= 60 && service === "one_off_cleaning") nextAction = "Quote carefully from Q&A detail and request photos if needed";
  if (service === "end_of_tenancy") nextAction = "Request photos or detailed scope before quoting";
  if (score < 45) nextAction = "Review fit and boundaries before offering availability";

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
    explanation: "Rule-based Q&A assist using service, frequency, property size, condition, location, parking, priorities and Q&A notes. Internal guide only; admin judgement required.",
    riskFlags: risks,
    positiveFlags: positives,
    ruleVersion: "assessment-quote-assist-v1"
  };
}
