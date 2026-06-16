import { error, json, readJson, requireDb } from "../_util.js";
import { runQuoteAssist } from "../_quoteAssist.js";
import { getCustomerByEmail, createCustomer, createProperty } from "../../db/customers.js";
import { createRequest } from "../../db/requests.js";

const PRIVACY_VERSION = "privacy-2026-05";

const LIMITS = {
  name: 80,
  phone: 40,
  email: 120,
  area: 120,
  contactTime: 80,
  preferredTimes: 160,
  message: 1000
};

const ALLOWED = {
  contactMethod: ["Phone", "Text message", "WhatsApp", "Email", ""],
  service: ["Regular cleaning", "Deep cleaning", "One-off cleaning", "End of tenancy cleaning", "Kitchen and bathroom detailing", "Ironing services", "Not sure yet", ""],
  frequency: ["Weekly", "Fortnightly", "Monthly", "One-off", "Not sure yet", ""],
  urgency: ["Flexible", "This month", "As soon as possible", "Specific date needed", ""],
  propertyType: ["House", "Flat or apartment", "Bungalow", "Townhouse", "Other", ""],
  propertySize: ["Small", "Medium", "Large", "Not sure", ""],
  bedrooms: ["0", "1", "2", "3", "4", "5+", ""],
  bathrooms: ["1", "2", "3", "4+", ""],
  pets: ["No pets", "Dog", "Cat", "Multiple pets", "Other", ""],
  parking: ["Driveway or easy parking", "Street parking", "Permit or paid parking", "Not sure", ""],
  products: ["Panda Zen products", "Client products", "Eco or fragrance-free preferred", "Not sure", ""],
  photosAvailable: ["Not needed", "Yes, I can send photos by WhatsApp if requested", "Yes, I can send photos by email if requested", "Not sure", ""]
};

const MAPS = {
  contactMethod: {
    Phone: "phone",
    "Text message": "sms",
    WhatsApp: "whatsapp",
    Email: "email"
  },
  service: {
    "Regular cleaning": "regular_cleaning",
    "Deep cleaning": "deep_cleaning",
    "One-off cleaning": "one_off_cleaning",
    "End of tenancy cleaning": "end_of_tenancy",
    "Kitchen and bathroom detailing": "kitchen_bathroom_detailing",
    "Ironing services": "ironing",
    "Not sure yet": "not_sure"
  },
  frequency: {
    Weekly: "weekly",
    Fortnightly: "fortnightly",
    Monthly: "monthly",
    "One-off": "one_off",
    "Not sure yet": "not_sure"
  },
  urgency: {
    Flexible: "flexible",
    "This month": "this_month",
    "As soon as possible": "asap",
    "Specific date needed": "specific_date"
  },
  propertyType: {
    House: "house",
    "Flat or apartment": "flat_apartment",
    Bungalow: "bungalow",
    Townhouse: "townhouse",
    Other: "other"
  },
  propertySize: {
    Small: "small",
    Medium: "medium",
    Large: "large",
    "Not sure": "not_sure"
  },
  pets: {
    "No pets": "none",
    Dog: "dog",
    Cat: "cat",
    "Multiple pets": "multiple",
    Other: "other"
  },
  parking: {
    "Driveway or easy parking": "driveway",
    "Street parking": "street",
    "Permit or paid parking": "permit_paid",
    "Not sure": "not_sure"
  },
  products: {
    "Panda Zen products": "pandazen_supplied",
    "Client products": "client_supplied",
    "Eco or fragrance-free preferred": "eco_fragrance_free",
    "Not sure": "not_sure"
  },
  photosAvailable: {
    "Not needed": "not_needed",
    "Yes, I can send photos by WhatsApp if requested": "whatsapp_if_requested",
    "Yes, I can send photos by email if requested": "email_if_requested",
    "Not sure": "not_sure"
  }
};

function clean(value, max = 200) {
  return String(value || "").trim().slice(0, max);
}

function mapped(group, value) {
  const cleaned = clean(value, 160);
  return MAPS[group]?.[cleaned] || null;
}

function generic() {
  return json({
    ok: true,
    message: "Thanks, your request has been received. Panda Zen will review it and reply as soon as practical."
  });
}

async function sha256(value, salt) {
  if (!value) return null;
  const data = new TextEncoder().encode(`${salt}:${String(value).toLowerCase().trim()}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function recordAttempt(db, { ipHash, contactHash, userAgentHash, outcome, reason }) {
  try {
    await db
      .prepare(
        `INSERT INTO public_submission_attempts (ip_hash, contact_hash, user_agent_hash, outcome, reason)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(ipHash, contactHash, userAgentHash, outcome, reason || null)
      .run();
  } catch (e) {
    // Gracefully degrade if table is missing locally
    console.warn("Could not record submission attempt. Missing table?", e.message);
  }
}

async function isRateLimited(db, ipHash, contactHash) {
  try {
    if (ipHash) {
      const hourly = await db
        .prepare(
          `SELECT COUNT(*) AS count
           FROM public_submission_attempts
           WHERE ip_hash = ? AND outcome = 'accepted' AND created_at > datetime('now', '-1 hour')`
        )
        .bind(ipHash)
        .first();
      if (hourly && hourly.count >= 3) return "Too many recent submissions.";

      const daily = await db
        .prepare(
          `SELECT COUNT(*) AS count
           FROM public_submission_attempts
           WHERE ip_hash = ? AND outcome = 'accepted' AND created_at > datetime('now', '-1 day')`
        )
        .bind(ipHash)
        .first();
      if (daily && daily.count >= 8) return "Daily submission limit reached.";
    }

    if (contactHash) {
      const contactDaily = await db
        .prepare(
          `SELECT COUNT(*) AS count
           FROM public_submission_attempts
           WHERE contact_hash = ? AND outcome = 'accepted' AND created_at > datetime('now', '-1 day')`
        )
        .bind(contactHash)
        .first();
      if (contactDaily && contactDaily.count >= 2) return "Contact submission limit reached.";
    }
  } catch (e) {
    // Gracefully degrade if table is missing locally
    console.warn("Could not check rate limit. Missing table?", e.message);
  }

  return "";
}

function validate(body) {
  const errors = [];
  const required = {
    name: clean(body.name, LIMITS.name),
    area: clean(body.area, LIMITS.area),
    service: clean(body.service, 80)
  };
  const phone = clean(body.phone, LIMITS.phone);
  const email = clean(body.email, LIMITS.email);

  if (!required.name) errors.push("Name is required.");
  if (!phone && !email) errors.push("Phone or email is required.");
  if (!required.area) errors.push("Area or postcode is required.");
  if (!required.service) errors.push("Service type is required.");
  if (!body.privacyAcknowledgement) errors.push("Privacy Policy acknowledgement is required.");

  Object.entries(LIMITS).forEach(([key, max]) => {
    if (String(body[key] || "").length > max) errors.push(`${key} is too long.`);
  });

  Object.entries(ALLOWED).forEach(([key, allowed]) => {
    const value = clean(body[key], 160);
    if (!allowed.includes(value)) errors.push(`${key} has an invalid value.`);
  });

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email address looks invalid.");

  return errors;
}

export async function onRequestPost({ request, env }) {
  const db = requireDb(env);
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return error("JSON body required.", 415);

  const body = await readJson(request);
  const salt = env.RATE_LIMIT_SALT || "pandazen-local-dev-salt";
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "local";
  const contact = body.email || body.phone || "";
  const [ipHash, contactHash, userAgentHash] = await Promise.all([
    sha256(ip, salt),
    sha256(contact, salt),
    sha256(request.headers.get("user-agent") || "", salt)
  ]);

  if (clean(body.website, 120)) {
    await recordAttempt(db, { ipHash, contactHash, userAgentHash, outcome: "honeypot", reason: "Honeypot field populated." });
    return generic();
  }

  const limitedReason = await isRateLimited(db, ipHash, contactHash);
  if (limitedReason) {
    await recordAttempt(db, { ipHash, contactHash, userAgentHash, outcome: "rate_limited", reason: limitedReason });
    return generic();
  }

  const errors = validate(body);
  if (errors.length) {
    await recordAttempt(db, { ipHash, contactHash, userAgentHash, outcome: "validation_failed", reason: errors.join(" ") });
    return error(errors[0], 400);
  }

  const priorities = Array.isArray(body.priorities) ? body.priorities.map((item) => clean(item, 80)).filter(Boolean) : [];
  const lead = {
    name: clean(body.name, LIMITS.name),
    phone: clean(body.phone, LIMITS.phone),
    email: clean(body.email, LIMITS.email),
    area: clean(body.area, LIMITS.area),
    source: "website_enquiry",
    serviceType: mapped("service", body.service),
    preferredContact: mapped("contactMethod", body.contactMethod),
    bestContactTime: clean(body.contactTime, LIMITS.contactTime),
    frequency: mapped("frequency", body.frequency),
    urgency: mapped("urgency", body.urgency),
    preferredDays: clean(body.preferredTimes, LIMITS.preferredTimes),
    propertyType: mapped("propertyType", body.propertyType),
    propertySize: mapped("propertySize", body.propertySize),
    bedrooms: clean(body.bedrooms, 8),
    bathrooms: clean(body.bathrooms, 8),
    priorities: JSON.stringify(priorities),
    pets: mapped("pets", body.pets),
    parking: mapped("parking", body.parking),
    productPreferences: mapped("products", body.products),
    photoAvailable: mapped("photosAvailable", body.photosAvailable),
    notes: clean(body.message, LIMITS.message),
    marketingOptIn: Boolean(body.marketingConsent)
  };

  try {
    const result = await db
      .prepare(
        `INSERT INTO leads (
          customer_name, phone, email, area, source, service_type, preferred_contact, preferred_days, status, notes,
          best_contact_time, frequency, urgency, property_type, bedrooms, bathrooms, property_size, priorities,
          pets, parking, product_preferences, photo_available, privacy_policy_accepted, privacy_policy_version,
          privacy_policy_accepted_at, marketing_opt_in, marketing_opt_in_at, marketing_source
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, CURRENT_TIMESTAMP, ?, ?, ?)`
      )
      .bind(
        lead.name,
        lead.phone || null,
        lead.email || null,
        lead.area,
        lead.source,
        lead.serviceType,
        lead.preferredContact,
        lead.preferredDays || null,
        lead.notes || null,
        lead.bestContactTime || null,
        lead.frequency,
        lead.urgency,
        lead.propertyType,
        lead.bedrooms || null,
        lead.bathrooms || null,
        lead.propertySize,
        lead.priorities,
        lead.pets,
        lead.parking,
        lead.productPreferences,
        lead.photoAvailable,
        PRIVACY_VERSION,
        lead.marketingOptIn ? 1 : 0,
        lead.marketingOptIn ? new Date().toISOString() : null,
        lead.marketingOptIn ? "quote_form" : null
      )
      .run();

    const leadId = result.meta.last_row_id;
    const assist = runQuoteAssist(lead);

    await db
      .prepare(
        `INSERT INTO lead_quote_assist (
          lead_id, fit_score, price_shopper_risk, travel_suitability,
          estimated_first_clean_hours_min, estimated_first_clean_hours_max,
          estimated_recurring_hours_min, estimated_recurring_hours_max,
          suggested_price_min, suggested_price_max, minimum_recommended_price,
          recommended_next_action, confidence, explanation, risk_flags, positive_flags, rule_version
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        leadId,
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

    await db
      .prepare(
        `INSERT INTO admin_tasks (title, notes, task_type, status, priority, due_at, linked_type, linked_id, assigned_to)
         VALUES (?, ?, 'Lead follow-up', 'Open', 'High', datetime('now', '+1 day'), 'lead', ?, 'admin')`
      )
      .bind(`Follow up quote request: ${lead.name}`, assist.recommendedNextAction, leadId)
      .run();
  } catch (e) {
    console.warn("Could not insert into legacy leads table. Skipping legacy insert.", e.message);
  }

  // Map into new CleanOps DB Schema
  let customer = null;
  if (lead.email) {
    customer = await getCustomerByEmail(db, lead.email);
  }

  const nameParts = (lead.name || "").split(/\s+/);
  const firstName = nameParts[0] || null;
  const lastName = nameParts.slice(1).join(" ") || null;

  if (!customer) {
    customer = await createCustomer(db, {
      id: `cust-${crypto.randomUUID()}`,
      type: 'individual',
      sourceType: lead.source,
      firstName: firstName,
      lastName: lastName,
      companyName: null,
      email: lead.email || null,
      phone: lead.phone || null
    });
  }

  let property = null;
  if (lead.area || lead.propertyType || lead.bedrooms || lead.bathrooms || lead.pets || lead.parking) {
    property = await createProperty(db, {
      id: `prop-${crypto.randomUUID()}`,
      customerId: customer.id,
      addressLine1: null,
      city: lead.area || null,
      postcode: null,
      accessNotes: null,
      propertyType: lead.propertyType || null,
      bedrooms: lead.bedrooms || null,
      bathrooms: lead.bathrooms || null,
      petsPresent: lead.pets || null,
      parking: lead.parking || null
    });
  }

  const quoteConsiderations = [];
  if (lead.photoAvailable === "whatsapp_if_requested" || lead.photoAvailable === "email_if_requested") {
    quoteConsiderations.push("photos_requested");
  }
  if (lead.productPreferences === "eco_fragrance_free") {
    quoteConsiderations.push("eco_products_preferred");
  }

  let cleaningProducts = null;
  if (lead.productPreferences === "pandazen_supplied") cleaningProducts = "pandazen_provides";
  else if (lead.productPreferences === "client_supplied") cleaningProducts = "client_provides";

  await createRequest(db, {
    id: `req-${crypto.randomUUID()}`,
    customerId: customer.id,
    propertyId: property ? property.id : null,
    sourceType: lead.source,
    status: 'new',
    notes: lead.notes || null,
    requestType: lead.serviceType || null,
    cadence: lead.frequency || null,
    howSoon: lead.urgency || null,
    preferredDay: null,
    preferredTimeWindow: lead.preferredDays || null,
    approxSize: lead.propertySize || null,
    photosHelpful: lead.photoAvailable !== "not_needed" && lead.photoAvailable !== "not_sure" && lead.photoAvailable ? "yes" : null,
    quoteReadiness: 'needs_contact',
    assessmentRequired: null,
    initialCleanRequired: null,
    pricingBasis: null,
    estimatedRegularDurationMinutes: null,
    estimatedInitialDurationMinutes: null,
    estimatedTeamSize: null,
    scopeConfidence: null,
    mainPriorities: priorities,
    quoteConsiderations: quoteConsiderations.length ? quoteConsiderations : null,
    cleaningProducts: cleaningProducts,
    vacuumHoover: null,
    mop: null,
    setupConfirmed: false,
    customerMessage: lead.notes || null,
    shortScopingNote: null,
    propertyNotes: null,
    cleaningNotes: null,
    internalNotes: `Submitted via website form. Best contact: ${lead.preferredContact || 'any'}, ${lead.bestContactTime || 'anytime'}`
  });

  await recordAttempt(db, { ipHash, contactHash, userAgentHash, outcome: "accepted", reason: null });
  return generic();
}
