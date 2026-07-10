(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedRequestId: null,
    newRequestOpen: false,
    reviewRequestOpen: false,
    moreOpen: false
  };

  let dbRequests = null;
  let apiFailed = false;
  let loadPromise = null;

  async function loadApiRequests(force = false) {
    if (force) {
      dbRequests = null;
      loadPromise = null;
    }
    if (dbRequests || apiFailed || loadPromise) return loadPromise;
    loadPromise = (async () => {
      try {
        const api = await import('./api.js');
        const raw = await api.fetchRequests();
        raw.forEach(mergeApiLinkedRecord);
        dbRequests = raw.map(mapApiRequestToFrontend);
        refresh();
      } catch (e) {
        console.warn("CleanOps API failed to load requests, falling back to mock data.", e);
        apiFailed = true;
        toast("Using offline demo data. Backend connection failed.");
        refresh();
      }
    })();
    return loadPromise;
  }

  function mapStatus(apiStatus) {
    const map = {
      "new": "new_enquiry",
      "contacted": "contacted",
      "assessment": "assessment_needed",
      "quote_needed": "quote_required",
      "quote-prep": "quote_required",
      "quoted": "quote_sent",
      "quote-sent": "quote_sent",
      "won": "won",
      "lost": "lost",
      "archived": "archived"
    };
    return map[apiStatus] || "new_enquiry";
  }

  function apiStatus(status) {
    const map = {
      new_enquiry: "new",
      quote_required: "quote_needed",
      quote_sent: "quoted"
    };
    return map[status] || status || "new";
  }

  function cleanSelectValue(value) {
    if (!value || value === "unknown" || value === "to_confirm") return null;
    return value;
  }

  function mapApiRequestToFrontend(apiReq) {
    return {
      id: apiReq.id,
      number: `RQ-${apiReq.id.slice(-4).toUpperCase()}`,
      title: apiReq.customerMessage ? apiReq.customerMessage.split('\n')[0].slice(0, 50) : `${requestTypeLabels[apiReq.requestType] || "Cleaning"} enquiry`,
      client_id: apiReq.customerId,
      property_id: apiReq.propertyId,
      request_type: apiReq.requestType || "regular_domestic_clean",
      status: mapStatus(apiReq.status),
      source: apiReq.sourceType,
      preferred_cadence: apiReq.cadence || null,
      how_soon: apiReq.howSoon || null,
      preferred_day: apiReq.preferredDay || null,
      preferred_time_window: apiReq.preferredTimeWindow || null,
      approx_size: apiReq.approxSize || null,
      photos_helpful: apiReq.photosHelpful || null,
      pricing_basis: apiReq.pricingBasis || null,
      estimated_regular_duration_minutes: apiReq.estimatedRegularDurationMinutes || "",
      estimated_initial_duration_minutes: apiReq.estimatedInitialDurationMinutes || "",
      estimated_team_size: apiReq.estimatedTeamSize || "",
      scope_confidence: apiReq.scopeConfidence || null,
      main_priorities: Array.isArray(apiReq.mainPriorities) ? apiReq.mainPriorities : [],
      quote_considerations: Array.isArray(apiReq.quoteConsiderations) ? apiReq.quoteConsiderations : [],
      setup_confirmed: apiReq.setupConfirmed || false,
      short_scoping_note: apiReq.shortScopingNote || "",
      property_notes: apiReq.propertyNotes || "",
      cleaning_notes: apiReq.cleaningNotes || "",
      received_at: apiReq.createdAt ? new Date(apiReq.createdAt).toLocaleDateString() : "To confirm",
      updated_at: apiReq.updatedAt ? new Date(apiReq.updatedAt).toLocaleDateString() : "",
      next_action: "Review request",
      intake_property_type: apiReq.propertyType || null,
      bedrooms: apiReq.bedrooms || null,
      bathrooms: apiReq.bathrooms || null,
      pets_present: apiReq.petsPresent || null,
      parking: apiReq.parking || null,
      cleaning_products: apiReq.cleaningProducts || null,
      vacuum_hoover: apiReq.vacuumHoover || null,
      mop: apiReq.mop || null,
      assessment_required: apiReq.assessmentRequired || null,
      initial_clean_required: apiReq.initialCleanRequired || null,
      quote_readiness: apiReq.quoteReadiness || "missing_scope",
      internal_notes: apiReq.internalNotes || apiReq.notes || "",
      customer_message: apiReq.customerMessage || apiReq.notes || "",
      api_customer_name: apiReq.customerName,
      api_customer_email: apiReq.email,
      api_customer_phone: apiReq.phone,
      api_property_label: apiReq.propertyLabel || apiReq.propertyAddressLine1,
      api_property_line1: apiReq.propertyAddressLine1,
      api_property_line2: apiReq.propertyAddressLine2,
      api_property_city: apiReq.propertyCity,
      api_property_postcode: apiReq.propertyPostcode,
      api_property_area: [apiReq.propertyCity, apiReq.propertyPostcode].filter(Boolean).join(" ")
    };
  }

  function mergeApiLinkedRecord(apiReq) {
    if (!apiReq.customerId) return;
    let client = clients().find((item) => item.id === apiReq.customerId);
    if (!client) {
      client = {
        id: apiReq.customerId,
        api_backed: true,
        display_name: apiReq.customerName || "Unlinked client",
        name: apiReq.customerName || "Unlinked client",
        first_name: apiReq.firstName || "",
        last_name: apiReq.lastName || "",
        company_name: apiReq.companyName || "",
        status: "lead",
        email: apiReq.email || "",
        phone: apiReq.phone || "",
        mainProperty: apiReq.propertyLabel || apiReq.propertyAddressLine1 || "Property to confirm",
        area: [apiReq.propertyCity, apiReq.propertyPostcode].filter(Boolean).join(" "),
        properties: []
      };
      clients().unshift(client);
    } else {
      client.api_backed = true;
      client.email = client.email || apiReq.email || "";
      client.phone = client.phone || apiReq.phone || "";
    }

    if (!apiReq.propertyId) return;
    client.properties = client.properties || [];
    if (client.properties.some((property) => property.id === apiReq.propertyId)) return;
    client.properties.push({
      id: apiReq.propertyId,
      api_backed: true,
      client_id: apiReq.customerId,
      label: apiReq.propertyLabel || apiReq.propertyAddressLine1 || "Property to confirm",
      name: apiReq.propertyLabel || apiReq.propertyAddressLine1 || "Property to confirm",
      addressLine1: apiReq.propertyAddressLine1 || "",
      addressLine2: apiReq.propertyAddressLine2 || "",
      city: apiReq.propertyCity || "",
      area: apiReq.propertyCity || "",
      postcode: apiReq.propertyPostcode || "",
      property_type: apiReq.propertyType || null,
      bedrooms: apiReq.bedrooms || null,
      bathrooms: apiReq.bathrooms || null,
      pets_present: apiReq.petsPresent || null,
      parking: apiReq.parking || null
    });
  }

  const requestStatusLabels = {
    new: "New enquiry",
    contacted: "Contacted",
    waiting_customer: "Waiting customer",
    assessment_needed: "Assessment needed",
    quote_required: "Quote required",
    quote_sent: "Quote sent",
    won: "Won",
    lost: "Lost",
    archived: "Archived"
  };

  const requestStatusTones = {
    new: "success",
    contacted: "info",
    waiting_customer: "warning",
    assessment_needed: "warning",
    quote_required: "warning",
    quote_sent: "info",
    won: "success",
    lost: "danger",
    archived: "muted"
  };

  const requestTypeLabels = {
    regular_domestic_clean: "Regular domestic clean",
    regular_cleaning: "Regular cleaning",
    deep_clean: "Deep clean",
    deep_cleaning: "Deep cleaning",
    end_of_tenancy: "End of tenancy",
    commercial_clean: "Commercial clean",
    holiday_let_turnaround: "Holiday let turnaround",
    one_off_clean: "One-off clean",
    one_off_cleaning: "One-off cleaning",
    kitchen_bathroom_detailing: "Kitchen and bathroom detailing",
    ironing: "Ironing services",
    issue_revisit: "Issue / revisit",
    other: "Other",
    not_sure: "Not sure"
  };

  const requestTypeClasses = {
    regular_domestic_clean: "type-cleaning-visit",
    regular_cleaning: "type-cleaning-visit",
    deep_clean: "type-cleaning-visit",
    deep_cleaning: "type-cleaning-visit",
    end_of_tenancy: "type-cleaning-visit",
    holiday_let_turnaround: "type-commercial-special",
    one_off_clean: "type-cleaning-visit",
    one_off_cleaning: "type-cleaning-visit",
    kitchen_bathroom_detailing: "type-cleaning-visit",
    ironing: "type-cleaning-visit",
    commercial_clean: "type-commercial-special",
    issue_revisit: "type-issue-revisit",
    other: "type-task-reminder",
    not_sure: "type-task-reminder"
  };

  const sourceLabels = {
    website_enquiry: "Website enquiry",
    phone: "Phone",
    email: "Email",
    referral: "Referral",
    manual: "Manual",
    repeat_customer: "Repeat customer",
    other: "Other"
  };

  const propertyTypeLabels = {
    domestic_house: "Domestic house",
    house: "House",
    flat_apartment: "Flat / apartment",
    studio_annexe: "Studio / annexe",
    bungalow: "Bungalow",
    townhouse: "Townhouse",
    commercial_office: "Commercial office",
    commercial_unit: "Commercial unit",
    holiday_let_airbnb: "Holiday let / Airbnb",
    other: "Other",
    unknown: "To confirm"
  };

  const bedroomsLabels = {
    studio: "Studio",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5_plus": "5+",
    not_applicable: "Not applicable",
    unknown: "To confirm"
  };

  const bathroomsLabels = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4_plus": "4+",
    not_applicable: "Not applicable",
    unknown: "To confirm"
  };

  const cadenceLabels = {
    one_off: "One-off",
    weekly: "Weekly",
    fortnightly: "Fortnightly",
    four_weekly: "Four-weekly",
    monthly: "Monthly",
    as_requested: "As requested",
    not_sure: "Not sure",
    to_confirm: "To confirm"
  };

  const dayLabels = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    flexible: "Flexible",
    to_confirm: "To confirm"
  };

  const timeWindowLabels = {
    morning: "Morning",
    midday: "Midday",
    afternoon: "Afternoon",
    evening: "Evening",
    flexible: "Flexible",
    to_confirm: "To confirm"
  };

  const supplyLabels = {
    client_provides: "Client provides",
    pandazen_provides: "PandaZen provides",
    mixed_specific_products_required: "Mixed / specific products",
    to_confirm: "To confirm"
  };

  const equipmentLabels = {
    client_provides: "Client provides",
    pandazen_brings: "PandaZen brings",
    not_required: "Not required",
    to_confirm: "To confirm"
  };

  const howSoonLabels = {
    asap: "As soon as possible",
    this_week: "This week",
    next_week: "Next week",
    this_month: "This month",
    specific_date: "Specific date",
    flexible: "Flexible",
    to_confirm: "To confirm"
  };

  const approxSizeLabels = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    very_large: "Very large",
    commercial_small: "Small commercial",
    commercial_medium: "Medium commercial",
    commercial_large: "Large commercial",
    not_sure: "Not sure",
    unknown: "To confirm"
  };

  const petsLabels = {
    none: "No pets",
    dog: "Dog",
    cat: "Cat",
    multiple: "Multiple pets",
    multiple_pets: "Multiple pets",
    other: "Other pets",
    not_applicable: "Not applicable",
    unknown: "To confirm"
  };

  const parkingLabels = {
    driveway: "Driveway",
    street: "Street parking",
    street_parking: "Street parking",
    permit_paid: "Permit or paid parking",
    permit_required: "Permit required",
    paid_parking: "Paid parking",
    staff_bays: "Staff bays",
    no_parking: "No parking",
    not_applicable: "Not applicable",
    no_easy_parking: "No parking",
    not_sure: "Not sure",
    unknown: "To confirm"
  };

  const photoHelpLabels = {
    yes: "Photos would help",
    no: "Photos not needed",
    requested: "Photos requested",
    to_confirm: "To confirm"
  };

  const priorityLabels = {
    kitchen: "Kitchen",
    bathrooms: "Bathrooms",
    floors: "Floors",
    dusting: "Dusting",
    inside_windows: "Inside windows",
    oven: "Oven",
    fridge: "Fridge",
    limescale: "Limescale",
    washrooms: "Washrooms",
    common_areas: "Common areas",
    access: "Access",
    move_out_standard: "Move-out standard"
  };

  const quoteReadinessLabels = {
    ready_to_quote: "Ready to quote",
    needs_contact: "Needs contact",
    needs_assessment: "Needs assessment",
    missing_scope: "Missing scope",
    quote_created: "Quote created"
  };

  const quoteReadinessTones = {
    ready_to_quote: "success",
    needs_contact: "warning",
    needs_assessment: "warning",
    missing_scope: "danger",
    quote_created: "info"
  };

  const assessmentLabels = {
    yes: "Assessment required",
    no: "No assessment needed",
    optional: "Optional assessment",
    completed: "Assessment completed",
    to_confirm: "To confirm"
  };

  const initialCleanLabels = {
    yes: "Initial clean required",
    no: "No initial clean",
    to_confirm: "To confirm",
    not_applicable: "Not applicable"
  };

  const pricingBasisLabels = {
    fixed_per_visit: "Fixed per visit",
    one_off_fixed: "One-off fixed price",
    monthly_contract: "Monthly contract",
    hourly_estimate: "Hourly estimate",
    to_confirm: "To confirm"
  };

  const scopeConfidenceLabels = {
    to_confirm: "To confirm",
    low: "Low confidence",
    medium: "Medium confidence",
    high: "High confidence"
  };

  const prepStateLabels = {
    suggested: "Suggested",
    confirmed: "Confirmed",
    to_confirm: "To confirm",
    not_estimated: "To confirm"
  };

  const quoteConsiderationLabels = {
    eco_products_preferred: "Eco products preferred",
    photos_requested: "Photos requested",
    initial_deep_clean: "Initial deep clean",
    commercial_consumables_option: "Consumables option",
    key_holder_access: "Key holder access",
    parking_permit_needed: "Parking permit needed",
    access_to_confirm: "Access to confirm",
    oven_windows_to_confirm: "Oven/windows to confirm"
  };

  const clientStatusLabels = {
    lead: "Lead",
    prospect: "Prospect",
    active_client: "Active client",
    commercial: "Commercial",
    paused: "Paused",
    inactive: "Inactive",
    archived: "Archived"
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function chip(label, tone) {
    const toneClass = tone && tone !== "success" ? ` ${tone}` : "";
    return `<span class="chip${toneClass}"><span class="dot"></span>${escapeHtml(label)}</span>`;
  }

  function button(label, action, variant = "") {
    const classes = ["button", variant].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-request-action="${escapeHtml(action)}">${escapeHtml(label)}</button>`;
  }

  function toast(message) {
    window.CleanOpsShell?.toast?.(message);
  }

  function labelFrom(map, value, fallback = "To confirm") {
    if (!value) return fallback;
    if (map[value]) return map[value];

    let cleaned = value.toString().replace(/_/g, ' ').toLowerCase();
    cleaned = cleaned.replace(/\bmon\b/g, 'Monday');
    cleaned = cleaned.replace(/\btue\b/g, 'Tuesday');
    cleaned = cleaned.replace(/\bwed\b/g, 'Wednesday');
    cleaned = cleaned.replace(/\bthu\b/g, 'Thursday');
    cleaned = cleaned.replace(/\bfri\b/g, 'Friday');
    cleaned = cleaned.replace(/\bsat\b/g, 'Saturday');
    cleaned = cleaned.replace(/\bsun\b/g, 'Sunday');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  function clients() {
    if (!Array.isArray(data.clients)) data.clients = [];
    return data.clients;
  }

  function requests() {
    if (dbRequests) return dbRequests;
    loadApiRequests();
    if (!apiFailed) return [];
    if (!Array.isArray(data.requests)) data.requests = [];
    return data.requests;
  }

  function requestsLoading() {
    return !dbRequests && !apiFailed;
  }

  function displayName(client, requestFallback) {
    if (client) return client.display_name || client.name || [client.first_name, client.last_name].filter(Boolean).join(" ") || "Unlinked client";
    if (requestFallback && requestFallback.api_customer_name) return requestFallback.api_customer_name;
    return "Unlinked client";
  }

  function propertyLabel(property, requestFallback) {
    if (property) return property.label || property.name || "To confirm";
    if (requestFallback && requestFallback.api_property_label) return requestFallback.api_property_label;
    return "To confirm";
  }

  function propertyLine1(property, requestFallback) {
    if (property?.addressLine1) return property.addressLine1;
    if (property?.address_line1) return property.address_line1;
    if (property?.address) return property.address.split(",")[0].trim();
    if (requestFallback?.api_property_line1) return requestFallback.api_property_line1;
    if (requestFallback?.api_property_label) return requestFallback.api_property_label;
    return "";
  }

  function propertyLine2(property, requestFallback) {
    return property?.addressLine2 || property?.address_line2 || requestFallback?.api_property_line2 || "";
  }

  function propertyCity(property, requestFallback) {
    return property?.city || property?.area || requestFallback?.api_property_city || "";
  }

  function propertyPostcode(property, requestFallback) {
    return property?.postcode || requestFallback?.api_property_postcode || "";
  }

  function propertyAddressText(property, requestFallback) {
    return [propertyLine1(property, requestFallback), propertyLine2(property, requestFallback), propertyCity(property, requestFallback), propertyPostcode(property, requestFallback)]
      .filter(Boolean)
      .join(", ") || "To confirm";
  }

  function propertyTypeValue(property) {
    return property?.property_type || property?.propertyType || null;
  }

  function propertyPetsValue(property) {
    return property?.pets_present || property?.petsPresent || null;
  }

  function findClient(id) {
    return clients().find((client) => client.id === id);
  }

  function findProperty(clientId, propertyId) {
    const client = findClient(clientId);
    return client?.properties?.find((property) => property.id === propertyId);
  }

  function findAnyProperty(propertyId) {
    for (const client of clients()) {
      const property = client.properties?.find((item) => item.id === propertyId);
      if (property) return { client, property };
    }
    return { client: null, property: null };
  }

  function selectedRequest() {
    return state.selectedRequestId ? requests().find((request) => request.id === state.selectedRequestId) : null;
  }

  function requestStatusLabel(request) {
    return labelFrom(requestStatusLabels, request.status, "New enquiry");
  }

  function requestTypeLabel(request) {
    return labelFrom(requestTypeLabels, request.request_type, "Other");
  }

  function requestDisplayTitle(request, client, property) {
    const serviceType = requestTypeLabel(request);
    let suffix = displayName(client, request);
    
    if (!suffix || suffix === "Unlinked client" || suffix === "To confirm") {
      suffix = propertyArea(property, request);
    }
    
    if (!suffix || suffix === "To confirm" || suffix === "Unlinked client") {
      return `${serviceType} enquiry`;
    }
    return `${serviceType} enquiry — ${suffix}`;
  }

  function requestTypeChip(request) {
    return chip(requestTypeLabel(request), "info");
  }

  function requestStatusChip(request) {
    return chip(requestStatusLabel(request), requestStatusTones[request.status] || "info");
  }

  function quoteReadinessChip(request) {
    const readiness = request.quote_readiness || deriveQuoteReadiness(request);
    return chip(labelFrom(quoteReadinessLabels, readiness, "Missing scope"), quoteReadinessTones[readiness] || "warning");
  }

  function deriveQuoteReadiness(request) {
    if (request.status === "quote_sent") return "quote_created";
    if (request.assessment_required === "yes" || request.assessment_required === "to_confirm") return "needs_assessment";
    if (!request.customer_message || !request.request_type || needsValue(request.preferred_cadence)) return "missing_scope";
    if (request.status === "new_enquiry" || request.status === "waiting_customer") return "needs_contact";
    return "ready_to_quote";
  }

  function quoteBlocker(request) {
    const readiness = request.quote_readiness || deriveQuoteReadiness(request);
    if (readiness === "ready_to_quote") return "";
    const missing = missingChecklist(request);
    const headline = readiness === "needs_assessment"
      ? "This request needs contact or assessment before it is ready to quote."
      : "This request is not ready to quote yet.";
    const firstMissing = missing[0] ? ` Missing: ${missing[0]}.` : "";
    return `${headline}${firstMissing} Review request before creating a quote.`;
  }

  function minutesLabel(value, fallback = "To confirm") {
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes <= 0) return fallback;
    const hours = minutes / 60;
    if (minutes % 60 === 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    const whole = Math.floor(hours);
    const rest = minutes % 60;
    return whole ? `${whole}h ${rest}m` : `${rest} minutes`;
  }

  function teamSizeLabel(value) {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) return "To confirm";
    return `${size} ${size === 1 ? "cleaner" : "cleaners"}`;
  }

  function prepValue(label, state = "to_confirm") {
    if (!label) return "To confirm";
    if (label === "To confirm") return labelFrom(prepStateLabels, state, "To confirm");
    if (state === "confirmed") return `Confirmed - ${label}`;
    if (state === "suggested") return `Suggested - ${label}`;
    if (state === "not_estimated") return label;
    if (state === "to_confirm") return label;
    return label;
  }

  function prepMinutesLabel(value, state = "not_estimated") {
    return prepValue(minutesLabel(value, ""), state);
  }

  function prepTeamSizeLabel(value, state = "not_estimated") {
    return prepValue(teamSizeLabel(value) === "To confirm" ? "" : teamSizeLabel(value), state);
  }

  function inlineConfirmation(label, confirmed) {
    if (!label || label === "To confirm") return "To confirm";
    const state = confirmed ? "Confirmed" : "To confirm";
    return `${label || "To confirm"} - ${state}`;
  }

  function priorityChips(request) {
    const items = Array.isArray(request.main_priorities) ? request.main_priorities : [];
    if (!items.length) return chip("To confirm", "muted");
    return items.map((item) => chip(labelFrom(priorityLabels, item, item), "info")).join("");
  }

  function considerationChips(request) {
    const items = Array.isArray(request.quote_considerations) ? request.quote_considerations : [];
    if (!items.length) return chip("To confirm", "muted");
    return items
      .map((item) => chip(labelFrom(quoteConsiderationLabels, item, item), "info"))
      .join("");
  }

  function needsValue(value) {
    return value === undefined || value === null || value === "" || value === "to_confirm" || value === "unknown";
  }

  function missingChecklist(request) {
    const missing = [];
    if ((request.quote_readiness || deriveQuoteReadiness(request)) !== "ready_to_quote") missing.push("Set quote readiness when review is complete");
    if (needsValue(request.initial_clean_required)) missing.push("Confirm initial clean requirement");
    if (needsValue(request.cleaning_products) || needsValue(request.vacuum_hoover) || needsValue(request.mop) || !request.setup_confirmed) missing.push("Confirm products and equipment source");
    if (!request.estimated_regular_duration_minutes || request.regular_duration_state === "not_estimated") missing.push("Estimate regular visit duration");
    if (request.initial_clean_required === "yes" && (!request.estimated_initial_duration_minutes || request.initial_duration_state === "not_estimated")) missing.push("Estimate initial clean duration");
    if (needsValue(request.how_soon)) missing.push("Confirm preferred start date");
    if (needsValue(request.assessment_required)) missing.push("Confirm whether assessment is needed");
    if (needsValue(request.parking) || (request.quote_considerations || []).includes("access_to_confirm")) missing.push("Confirm access and parking details");
    return Array.from(new Set(missing)).slice(0, 6);
  }

  function renderMissingChecklist(request) {
    const items = missingChecklist(request);
    if (!items.length) {
      return `<div class="empty mini"><div class="empty-icon">OK</div><div><h3>Ready for quote</h3><p class="muted">Core quote-prep fields look complete for this request.</p></div></div>`;
    }
    return `<ul class="request-checklist">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }

  function suggestedQuestions(request) {
    const questions = [];
    if (needsValue(request.initial_clean_required)) questions.push("Would you like us to include an initial deep clean before regular visits?");
    if (needsValue(request.cleaning_products) || request.cleaning_products === "mixed_specific_products_required") questions.push("Do you want PandaZen to bring products or use your preferred products?");
    if (needsValue(request.how_soon) || needsValue(request.preferred_day)) questions.push("Is your preferred day fixed, or are other days possible?");
    if (!request.main_priorities?.length) questions.push("Are there any rooms or surfaces needing special attention?");
    if (request.photos_helpful === "yes" || request.photos_helpful === "requested") questions.push("Could you send a few photos so we can scope the clean accurately?");
    if ((request.quote_considerations || []).includes("parking_permit_needed")) questions.push("Will parking be available, or should we allow time/cost for parking?");
    return questions.slice(0, 4);
  }

  function renderQuoteAssist(request) {
    const questions = suggestedQuestions(request);
    return `
      <article class="panel pad quote-assist">
        <div class="side-section">
          <div class="button-row" style="justify-content:space-between">
            <h2>Quote Assist</h2>
            ${quoteReadinessChip(request)}
          </div>
          <p class="muted">Internal guidance only. Use Review request to confirm missing fields before quoting.</p>
        </div>
        <div class="side-section">
          <h2>Missing before quote</h2>
          ${renderMissingChecklist(request)}
        </div>
        <div class="side-section">
          <h2>Suggested next action</h2>
          <p><strong>${escapeHtml(request.next_action || "Review request")}</strong></p>
        </div>
        <div class="side-section">
          <h2>Suggested questions</h2>
          ${questions.length ? `<ul class="request-checklist">${questions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : `<p class="muted">No obvious client questions from current mock data.</p>`}
        </div>
        <div>
          <h2>Quote considerations</h2>
          <div class="button-row request-considerations" style="justify-content:flex-start">${considerationChips(request)}</div>
        </div>
      </article>
    `;
  }

  function propertyArea(property, requestFallback) {
    if (property) return [propertyCity(property), propertyPostcode(property)].filter(Boolean).join(" ") || "To confirm";
    if (requestFallback && requestFallback.api_property_area) return requestFallback.api_property_area;
    return "To confirm";
  }

  function table(headers, rows) {
    return `
      <table>
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    `;
  }

  function render() {
    const request = selectedRequest();
    return `
      <section class="requests-root" data-requests-root="true">
        ${request ? renderDetail(request) : renderList()}
        ${state.newRequestOpen ? renderNewRequestModal() : ""}
        ${state.reviewRequestOpen && request ? renderReviewRequestModal(request) : ""}
      </section>
    `;
  }

  function renderList() {
    const rows = requestsLoading() ? [
      `<tr><td colspan="4"><div class="empty mini"><div class="empty-icon">...</div><div><h3>Loading requests</h3><p class="muted">Fetching current CleanOps request data.</p></div></div></td></tr>`
    ] : requests().map((request) => {
      const client = findClient(request.client_id);
      const property = findProperty(request.client_id, request.property_id) || findAnyProperty(request.property_id).property;
      
      const sourceLabel = labelFrom(sourceLabels, request.source, "Manual");
      const statusLabel = requestStatusLabel(request);
      const readiness = request.quote_readiness || deriveQuoteReadiness(request);
      const readinessLabel = labelFrom(quoteReadinessLabels, readiness, "Missing scope");
      
      return `
        <tr class="request-row" data-request-id="${escapeHtml(request.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(requestDisplayTitle(request, client, property))}">
          <td><strong>${escapeHtml(requestDisplayTitle(request, client, property))}</strong><br><span class="muted">${escapeHtml(request.number)} &middot; ${escapeHtml(sourceLabel)} &middot; ${escapeHtml(statusLabel)}</span></td>
          <td><strong>${escapeHtml(propertyLabel(property, request))}</strong><br><span class="muted">${escapeHtml(propertyAddressText(property, request))}</span></td>
          <td>${escapeHtml(readinessLabel)} &middot; <span class="muted">${escapeHtml(request.next_action || "Review request")}</span></td>
          <td>${escapeHtml(request.received_at || "To confirm")}<br><span class="muted">${escapeHtml(request.updated_at ? `Updated ${request.updated_at}` : "")}</span></td>
        </tr>
      `;
    });

    return `
      <div class="page-head">
        <div>
          <div class="title-row"><h1>Requests</h1></div>
          <p class="muted" style="margin-top:10px">Track enquiries, assessments, and work requests before they become quotes or jobs.</p>
        </div>
        <div class="page-actions">${button("New Request", "open-new-request", "primary")}</div>
      </div>

      <section class="grid-detail requests-list-layout">
        <article class="panel">
          <div class="filters">
            <span class="inputish">Search requests</span>
            <span class="selectish">All statuses</span>
            <span class="selectish">All request types</span>
            <span class="selectish">Next action</span>
          </div>
          ${table(["Request", "Property / area", "Readiness / next action", "Received / updated"], rows)}
        </article>

        <aside class="panel pad">
          <div class="side-section">
            <h2>Request workspace</h2>
            <p class="muted">Requests hold the enquiry and early scoping need. Clients and properties stay as reusable records.</p>
          </div>
          <div class="side-section">
            <h2>Typical flow</h2>
            <div class="client-model-list">
              <span>Enquiry received</span>
              <span>Client/property shell</span>
              <span>Assessment or scoping</span>
              <span>Quote or job</span>
            </div>
          </div>
          <div>
            <h2>Current mix</h2>
            <div class="request-summary-counts">
              ${summaryCount("New", "new_enquiry")}
              ${summaryCount("Needs quote", "quote_required")}
              ${summaryCount("Waiting", "waiting_customer")}
            </div>
          </div>
        </aside>
      </section>
    `;
  }

  function summaryCount(label, status) {
    const count = requests().filter((request) => request.status === status).length;
    return `<div class="field-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(count)}</strong></div>`;
  }

  function renderDetail(request) {
    const client = findClient(request.client_id);
    const property = findProperty(request.client_id, request.property_id) || findAnyProperty(request.property_id).property;

    return `
      <div class="request-breadcrumb">
        <span>PandaZen</span>
        <span>/</span>
        <button type="button" data-request-action="back-to-list">Requests</button>
        <span>/</span>
        <strong>${escapeHtml(request.number)}</strong>
      </div>

      <div class="page-head">
        <div>
          <div class="title-row">
            <span class="chip muted" style="font-family:monospace; font-size:16px;">${escapeHtml(request.number)}</span>
            <h1>${escapeHtml(requestDisplayTitle(request, client, property))}</h1>
            ${requestStatusChip(request)}
          </div>
          <div class="button-row request-title-chips" style="justify-content:flex-start">${requestTypeChip(request)} ${quoteReadinessChip(request)} ${chip(labelFrom(sourceLabels, request.source, "Manual"), "info")}</div>
        </div>
        <div class="page-actions">
          ${button("Review request", "open-review-request", "primary")}
          ${button("Contact customer", "contact-customer", "primary")}
          ${button("Create quote", "create-quote")}
          ${button("Create job", "create-job")}
          ${button("Schedule assessment", "schedule-assessment")}
          <div class="client-more-wrap">
            ${button("More actions", "toggle-more")}
            ${state.moreOpen ? renderMoreMenu(request, client, property) : ""}
          </div>
        </div>
      </div>

      <section class="grid-detail">
        <div class="stack">
          <article class="panel">
            <div class="panel-head"><h2>Request summary</h2>${button("Mark lost", "mark-lost", "small")}</div>
            <div class="panel-body request-summary-grid">
              <div>
                <h3>Linked records</h3>
                <div class="field-row"><span>Client</span><strong>${escapeHtml(displayName(client, request))}</strong></div>
                <div class="field-row"><span>Client status</span><strong>${escapeHtml(labelFrom(clientStatusLabels, client?.status, "Lead"))}</strong></div>
                <div class="field-row"><span>Property</span><strong>${escapeHtml(propertyLabel(property, request))}</strong></div>
                <div class="field-row"><span>Area</span><strong>${escapeHtml(propertyArea(property, request))}</strong></div>
              </div>
              <div>
                <h3>Request state</h3>
                <div class="field-row"><span>Request number</span><strong>${escapeHtml(request.number)}</strong></div>
                <div class="field-row"><span>Received</span><strong>${escapeHtml(request.received_at || "To confirm")}</strong></div>
                <div class="field-row"><span>Updated</span><strong>${escapeHtml(request.updated_at || "To confirm")}</strong></div>
                <div class="field-row"><span>Next action</span><strong>${escapeHtml(request.next_action || "Review request")}</strong></div>
                <div class="field-row"><span>Quote readiness</span><strong>${escapeHtml(labelFrom(quoteReadinessLabels, request.quote_readiness || deriveQuoteReadiness(request), "Missing scope"))}</strong></div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-head"><h2>Client enquiry</h2></div>
            <div class="panel-body request-summary-grid">
              <div>
                <h3>What the client asked for</h3>
                <div class="field-row"><span>Service</span><strong>${escapeHtml(requestTypeLabel(request))}</strong></div>
                <div class="field-row"><span>Frequency</span><strong>${escapeHtml(labelFrom(cadenceLabels, request.preferred_cadence, "To confirm"))}</strong></div>
                <div class="field-row"><span>How soon</span><strong>${escapeHtml(labelFrom(howSoonLabels, request.how_soon, "To confirm"))}</strong></div>
                <div class="field-row"><span>Preferred days</span><strong>${escapeHtml(labelFrom(dayLabels, request.preferred_day, "To confirm"))}</strong></div>
                <div class="field-row"><span>Preferred times</span><strong>${escapeHtml(labelFrom(timeWindowLabels, request.preferred_time_window, "To confirm"))}</strong></div>
              </div>
              <div>
                <h3>Property snapshot from intake</h3>
                <div class="field-row"><span>Property type</span><strong>${escapeHtml(labelFrom(propertyTypeLabels, request.intake_property_type || propertyTypeValue(property), "To confirm"))}</strong></div>
                <div class="field-row"><span>Approx size</span><strong>${escapeHtml(labelFrom(approxSizeLabels, request.approx_size, "To confirm"))}</strong></div>
                <div class="field-row"><span>Bedrooms</span><strong>${escapeHtml(labelFrom(bedroomsLabels, request.bedrooms || property?.bedrooms, "To confirm"))}</strong></div>
                <div class="field-row"><span>Bathrooms</span><strong>${escapeHtml(labelFrom(bathroomsLabels, request.bathrooms || property?.bathrooms, "To confirm"))}</strong></div>
                <div class="field-row"><span>Pets</span><strong>${escapeHtml(labelFrom(petsLabels, request.pets_present || propertyPetsValue(property), "To confirm"))}</strong></div>
                <div class="field-row"><span>Parking / access</span><strong>${escapeHtml(labelFrom(parkingLabels, request.parking || property?.parking, "To confirm"))}</strong></div>
              </div>
              <div class="wide">
                <h3>Main priorities</h3>
                <div class="button-row request-considerations" style="justify-content:flex-start">${priorityChips(request)}</div>
              </div>
              <div>
                <h3>Products, equipment and photos</h3>
                <div class="field-row"><span>Cleaning products / preference</span><strong>${escapeHtml(inlineConfirmation(labelFrom(supplyLabels, request.cleaning_products, "To confirm"), request.cleaning_products_state === "confirmed" || request.setup_confirmed))}</strong></div>
                <div class="field-row"><span>Vacuum / hoover</span><strong>${escapeHtml(inlineConfirmation(labelFrom(equipmentLabels, request.vacuum_hoover, "To confirm"), request.setup_confirmed))}</strong></div>
                <div class="field-row"><span>Mop</span><strong>${escapeHtml(inlineConfirmation(labelFrom(equipmentLabels, request.mop, "To confirm"), request.setup_confirmed))}</strong></div>
                <div class="field-row"><span>Would photos help?</span><strong>${escapeHtml(labelFrom(photoHelpLabels, request.photos_helpful, "To confirm"))}</strong></div>
              </div>
              <div class="wide">
                <h3>Customer message</h3>
                <p class="muted">${escapeHtml(request.customer_message || "To confirm")}</p>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-head"><h2>Internal quote prep</h2>${button("Create quote", "create-quote", "small primary")}</div>
            <div class="panel-body request-summary-grid">
              <div>
                <h3>Readiness</h3>
                <div class="field-row"><span>Quote readiness</span><strong>${escapeHtml(labelFrom(quoteReadinessLabels, request.quote_readiness || deriveQuoteReadiness(request), "Missing scope"))}</strong></div>
                <div class="field-row"><span>Assessment requirement</span><strong>${escapeHtml(prepValue(labelFrom(assessmentLabels, request.assessment_required, ""), request.assessment_state || "to_confirm"))}</strong></div>
                <div class="field-row"><span>Pricing basis</span><strong>${escapeHtml(prepValue(labelFrom(pricingBasisLabels, request.pricing_basis, ""), request.pricing_basis_state || "to_confirm"))}</strong></div>
                <div class="field-row"><span>Initial clean required</span><strong>${escapeHtml(prepValue(labelFrom(initialCleanLabels, request.initial_clean_required, ""), request.initial_clean_state || "to_confirm"))}</strong></div>
              </div>
              <div>
                <h3>Estimates</h3>
                <div class="field-row"><span>Regular duration</span><strong>${escapeHtml(prepMinutesLabel(request.estimated_regular_duration_minutes, request.regular_duration_state || "not_estimated"))}</strong></div>
                <div class="field-row"><span>Initial duration</span><strong>${escapeHtml(prepMinutesLabel(request.estimated_initial_duration_minutes, request.initial_duration_state || "not_estimated"))}</strong></div>
                <div class="field-row"><span>Team size</span><strong>${escapeHtml(prepTeamSizeLabel(request.estimated_team_size, request.team_size_state || "not_estimated"))}</strong></div>
                <div class="field-row"><span>Scope confidence</span><strong>${escapeHtml(labelFrom(scopeConfidenceLabels, request.scope_confidence, "To confirm"))}</strong></div>
              </div>
              <div class="wide">
                <h3>Short scoping note</h3>
                <p class="muted">${escapeHtml(request.short_scoping_note || request.service_summary || "To confirm")}</p>
              </div>
              <div class="wide">
                <h3>Quote considerations</h3>
                <div class="button-row request-considerations" style="justify-content:flex-start">${considerationChips(request)}</div>
              </div>
              <div class="wide">
                <h3>Missing before quote</h3>
                ${renderMissingChecklist(request)}
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-head"><h2>Notes and communication</h2>${button("Add note", "add-note", "small")}</div>
            <div class="panel-body request-note-grid">
              ${noteBlock("Property notes", request.property_notes)}
              ${noteBlock("Cleaning notes", request.cleaning_notes)}
              ${noteBlock("Internal notes", request.internal_notes)}
              <div class="empty mini wide"><div class="empty-icon">TL</div><div><h3>Timeline placeholder</h3><p class="muted">Calls, emails, assessment notes, and quote activity will appear here later.</p></div></div>
            </div>
          </article>
        </div>

        <aside class="stack">
          ${renderQuoteAssist(request)}
          <article class="panel pad">
            <div class="side-section">
              <h2>Client</h2>
              <div class="field-row"><span>Name</span><strong>${escapeHtml(displayName(client, request))}</strong></div>
              <div class="field-row"><span>Email</span><strong>${escapeHtml(client?.email || request.api_customer_email || "To confirm")}</strong></div>
              <div class="field-row"><span>Phone</span><strong>${escapeHtml(client?.phone || request.api_customer_phone || "To confirm")}</strong></div>
            </div>
            <div class="side-section">
              <h2>Property setup</h2>
              <div class="field-row"><span>Address</span><strong>${escapeHtml(propertyAddressText(property, request))}</strong></div>
              <div class="field-row"><span>Type</span><strong>${escapeHtml(labelFrom(propertyTypeLabels, propertyTypeValue(property) || request.intake_property_type, "To confirm"))}</strong></div>
              <div class="field-row"><span>Bedrooms</span><strong>${escapeHtml(labelFrom(bedroomsLabels, property?.bedrooms || request.bedrooms, "To confirm"))}</strong></div>
              <div class="field-row"><span>Bathrooms</span><strong>${escapeHtml(labelFrom(bathroomsLabels, property?.bathrooms || request.bathrooms, "To confirm"))}</strong></div>
            </div>
            <div>
              <h2>Actions</h2>
              <div class="stack request-side-actions">
                ${button("Schedule assessment/visit", "schedule-assessment", "primary")}
                ${button("Create quote", "create-quote")}
                ${button("Create job", "create-job")}
              </div>
            </div>
          </article>
        </aside>
      </section>
    `;
  }

  function noteBlock(title, copy) {
    return `
      <div class="request-note-block">
        <h3>${escapeHtml(title)}</h3>
        <p class="muted">${escapeHtml(copy || "To confirm")}</p>
      </div>
    `;
  }

  function renderMoreMenu(request, client, property) {
    const items = ["Duplicate request", "Attach file/photo", "Create task", "Archive request"];
    return `
      <div class="client-more-menu" role="menu">
        <p class="eyebrow">Request tools</p>
        ${items.map((item) => `<button type="button" data-request-more="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
        <p class="muted menu-context">Context: ${escapeHtml(request.number)} / ${escapeHtml(displayName(client, request))}${(property || request.api_property_label) ? ` / ${escapeHtml(propertyLabel(property, request))}` : ""}</p>
      </div>
    `;
  }

  function optionList(map, selected) {
    return Object.entries(map)
      .map(([value, label]) => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`)
      .join("");
  }

  function propertyOptions(clientId = "") {
    const options = [];
    if (!clientId) return "";
    const list = clientId ? clients().filter((client) => client.id === clientId) : clients();
    list.forEach((client) => {
      (client.properties || []).forEach((property) => {
        const label = clientId ? propertyLabel(property) : `${displayName(client)} - ${propertyLabel(property)}`;
        options.push(`<option value="${escapeHtml(property.id)}">${escapeHtml(label)}</option>`);
      });
    });
    return options.join("");
  }

  function checkedAttr(items, key) {
    return Array.isArray(items) && items.includes(key) ? " checked" : "";
  }

  function renderReviewRequestModal(request) {
    const property = findProperty(request.client_id, request.property_id) || findAnyProperty(request.property_id).property || {};
    return `
      <div class="request-modal-backdrop" data-review-backdrop="true">
        <section class="request-modal" role="dialog" aria-modal="true" aria-label="Review Request" data-review-modal="true">
          <div class="drawer-header">
            <div>
              <p class="eyebrow">Complete missing information</p>
              <h2>Review request</h2>
            </div>
            <button class="icon-button" type="button" data-request-action="close-review-request" aria-label="Close review request" title="Close"><span>X</span></button>
          </div>

          <div class="request-form-section">
            <h3>Client enquiry</h3>
            <div class="request-form-grid">
              <label class="client-field">Service type <select id="review-request-type">${optionList(requestTypeLabels, request.request_type || "regular_domestic_clean")}</select></label>
              <label class="client-field">Status <select id="review-request-status">${optionList(requestStatusLabels, request.status || "new_enquiry")}</select></label>
              <label class="client-field">Frequency <select id="review-request-cadence">${optionList(cadenceLabels, request.preferred_cadence || "to_confirm")}</select></label>
              <label class="client-field">How soon <select id="review-request-how-soon">${optionList(howSoonLabels, request.how_soon || "to_confirm")}</select></label>
              <label class="client-field">Preferred day <select id="review-request-day">${optionList(dayLabels, request.preferred_day || "to_confirm")}</select></label>
              <label class="client-field">Preferred time <select id="review-request-time">${optionList(timeWindowLabels, request.preferred_time_window || "to_confirm")}</select></label>
              <label class="client-field">Approx size <select id="review-request-approx-size">${optionList(approxSizeLabels, request.approx_size || "unknown")}</select></label>
              <label class="client-field">Would photos help? <select id="review-request-photos">${optionList(photoHelpLabels, request.photos_helpful || "to_confirm")}</select></label>
              <label class="client-field wide">Customer message <textarea id="review-request-message" rows="3">${escapeHtml(request.customer_message || "")}</textarea></label>
              <label class="schedule-check wide"><input id="review-priority-kitchen" type="checkbox"${checkedAttr(request.main_priorities, "kitchen")}><span>Kitchen priority</span></label>
              <label class="schedule-check wide"><input id="review-priority-bathrooms" type="checkbox"${checkedAttr(request.main_priorities, "bathrooms")}><span>Bathrooms priority</span></label>
              <label class="schedule-check wide"><input id="review-priority-floors" type="checkbox"${checkedAttr(request.main_priorities, "floors")}><span>Floors priority</span></label>
              <label class="schedule-check wide"><input id="review-priority-oven" type="checkbox"${checkedAttr(request.main_priorities, "oven")}><span>Oven / appliance priority</span></label>
              <label class="schedule-check wide"><input id="review-priority-washrooms" type="checkbox"${checkedAttr(request.main_priorities, "washrooms")}><span>Washrooms priority</span></label>
              <label class="schedule-check wide"><input id="review-priority-common-areas" type="checkbox"${checkedAttr(request.main_priorities, "common_areas")}><span>Common areas priority</span></label>
            </div>
          </div>

          <div class="request-form-section">
            <h3>Property details</h3>
            <div class="request-form-grid">
              <label class="client-field">Address line 1 <input id="review-property-address-line-1" type="text" autocomplete="off" value="${escapeHtml(propertyLine1(property, request))}"></label>
              <label class="client-field">Address line 2 <input id="review-property-address-line-2" type="text" autocomplete="off" value="${escapeHtml(propertyLine2(property, request))}"></label>
              <label class="client-field">Town / city <input id="review-property-city" type="text" autocomplete="off" value="${escapeHtml(propertyCity(property, request))}"></label>
              <label class="client-field">Postcode <input id="review-property-postcode" type="text" autocomplete="off" value="${escapeHtml(propertyPostcode(property, request))}"></label>
              <label class="client-field">Property type <select id="review-property-type">${optionList(propertyTypeLabels, request.intake_property_type || propertyTypeValue(property) || "unknown")}</select></label>
              <label class="client-field">Bedrooms <select id="review-bedrooms">${optionList(bedroomsLabels, request.bedrooms || property.bedrooms || "unknown")}</select></label>
              <label class="client-field">Bathrooms <select id="review-bathrooms">${optionList(bathroomsLabels, request.bathrooms || property.bathrooms || "unknown")}</select></label>
              <label class="client-field">Pets <select id="review-pets">${optionList(petsLabels, request.pets_present || propertyPetsValue(property) || "unknown")}</select></label>
              <label class="client-field">Parking / access <select id="review-parking">${optionList(parkingLabels, request.parking || property.parking || "unknown")}</select></label>
            </div>
          </div>

          <div class="request-form-section">
            <h3>Practical setup</h3>
            <div class="request-form-grid">
              <label class="client-field">Products preference / cleaning products <select id="review-products">${optionList(supplyLabels, request.cleaning_products || "to_confirm")}</select></label>
              <label class="client-field">Vacuum / hoover supplied by <select id="review-vacuum">${optionList(equipmentLabels, request.vacuum_hoover || "to_confirm")}</select></label>
              <label class="client-field">Mop supplied by <select id="review-mop">${optionList(equipmentLabels, request.mop || "to_confirm")}</select></label>
              <label class="schedule-check wide"><input id="review-setup-confirmed" type="checkbox"${request.setup_confirmed ? " checked" : ""}><span>Products and equipment setup confirmed</span></label>
            </div>
          </div>

          <div class="request-form-section">
            <h3>Internal quote prep</h3>
            <div class="request-form-grid">
              <label class="client-field">Quote readiness <select id="review-quote-readiness">${optionList(quoteReadinessLabels, request.quote_readiness || deriveQuoteReadiness(request))}</select></label>
              <label class="client-field">Assessment requirement <select id="review-assessment">${optionList(assessmentLabels, request.assessment_required || "to_confirm")}</select></label>
              <label class="client-field">Pricing basis <select id="review-pricing-basis">${optionList(pricingBasisLabels, request.pricing_basis || "to_confirm")}</select></label>
              <label class="client-field">Initial clean required <select id="review-initial-clean">${optionList(initialCleanLabels, request.initial_clean_required || "to_confirm")}</select></label>
              <label class="client-field">Estimated regular duration <input id="review-regular-duration" type="number" min="0" step="30" value="${escapeHtml(request.estimated_regular_duration_minutes || "")}"></label>
              <label class="client-field">Estimated initial duration <input id="review-initial-duration" type="number" min="0" step="30" value="${escapeHtml(request.estimated_initial_duration_minutes || "")}"></label>
              <label class="client-field">Team size <input id="review-team-size" type="number" min="1" step="1" value="${escapeHtml(request.estimated_team_size || "")}"></label>
              <label class="client-field">Scope confidence <select id="review-scope-confidence">${optionList(scopeConfidenceLabels, request.scope_confidence || "to_confirm")}</select></label>
              <label class="client-field wide">Short scoping note <textarea id="review-scoping-note" rows="2">${escapeHtml(request.short_scoping_note || request.service_summary || "")}</textarea></label>
              <label class="schedule-check wide"><input id="review-consider-eco" type="checkbox"${checkedAttr(request.quote_considerations, "eco_products_preferred")}><span>Eco products preferred</span></label>
              <label class="schedule-check wide"><input id="review-consider-photos" type="checkbox"${checkedAttr(request.quote_considerations, "photos_requested")}><span>Photos requested/helpful</span></label>
              <label class="schedule-check wide"><input id="review-consider-initial" type="checkbox"${checkedAttr(request.quote_considerations, "initial_deep_clean")}><span>Initial deep clean may be needed</span></label>
              <label class="schedule-check wide"><input id="review-consider-consumables" type="checkbox"${checkedAttr(request.quote_considerations, "commercial_consumables_option")}><span>Commercial consumables option</span></label>
              <label class="schedule-check wide"><input id="review-consider-parking" type="checkbox"${checkedAttr(request.quote_considerations, "parking_permit_needed")}><span>Parking permit may affect quote</span></label>
              <label class="schedule-check wide"><input id="review-consider-access" type="checkbox"${checkedAttr(request.quote_considerations, "access_to_confirm")}><span>Access still needs confirmation</span></label>
            </div>
          </div>

          <div class="request-form-section">
            <h3>Notes</h3>
            <div class="request-form-grid">
              <label class="client-field wide">Property notes <textarea id="review-property-notes" rows="2">${escapeHtml(request.property_notes || "")}</textarea></label>
              <label class="client-field wide">Cleaning notes <textarea id="review-cleaning-notes" rows="2">${escapeHtml(request.cleaning_notes || "")}</textarea></label>
              <label class="client-field wide">Internal notes <textarea id="review-internal-notes" rows="2">${escapeHtml(request.internal_notes || "")}</textarea></label>
            </div>
          </div>

          <div class="drawer-actions">
            <button class="button primary" type="button" data-request-action="save-review-request">Save review</button>
            <button class="button ghost" type="button" data-request-action="close-review-request">Cancel</button>
          </div>
        </section>
      </div>
    `;
  }

  function renderNewRequestModal() {
    return `
      <div class="request-modal-backdrop" data-request-backdrop="true">
        <section class="request-modal" role="dialog" aria-modal="true" aria-label="New Request" data-request-modal="true">
          <div class="drawer-header">
            <div>
              <p class="eyebrow">Enquiry / work need</p>
              <h2>New Request</h2>
            </div>
            <button class="icon-button" type="button" data-request-action="close-new-request" aria-label="Close new request form" title="Close"><span>X</span></button>
          </div>

          <div class="request-form-section">
            <h3>Client</h3>
            <div class="request-form-grid">
              <label class="client-field wide">Existing client
                <select id="new-request-client">
                  <option value="">Create a new client shell</option>
                  ${clients().map((client) => `<option value="${escapeHtml(client.id)}">${escapeHtml(displayName(client))}</option>`).join("")}
                </select>
              </label>
              <label class="client-field">New client name <input id="new-request-client-name" type="text" autocomplete="off"></label>
              <label class="client-field">Phone <input id="new-request-phone" type="tel" autocomplete="off"></label>
              <label class="client-field">Email <input id="new-request-email" type="email" autocomplete="off"></label>
            </div>
          </div>

          <div class="request-form-section">
            <h3>Property</h3>
            <div class="request-form-grid">
              <label class="client-field wide">Existing property
                <select id="new-request-property">
                  <option value="">Create a new property</option>
                  ${propertyOptions()}
                </select>
              </label>
              <label class="client-field">Address line 1 <input id="new-request-property-address-line-1" type="text" autocomplete="off"></label>
              <label class="client-field">Address line 2 <input id="new-request-property-address-line-2" type="text" autocomplete="off"></label>
              <label class="client-field">Town / city <input id="new-request-property-city" type="text" autocomplete="off"></label>
              <label class="client-field">Postcode <input id="new-request-property-postcode" type="text" autocomplete="off"></label>
              <label class="client-field">Property type <select id="new-request-property-type">${optionList(propertyTypeLabels, "unknown")}</select></label>
              <label class="client-field">Bedrooms <select id="new-request-bedrooms">${optionList(bedroomsLabels, "unknown")}</select></label>
              <label class="client-field">Bathrooms <select id="new-request-bathrooms">${optionList(bathroomsLabels, "unknown")}</select></label>
            </div>
          </div>

          <div class="request-form-section">
            <h3>Client enquiry</h3>
            <div class="request-form-grid">
              <label class="client-field">Service <select id="new-request-type">${optionList(requestTypeLabels, "regular_domestic_clean")}</select></label>
              <label class="client-field">Status <select id="new-request-status">${optionList(requestStatusLabels, "new_enquiry")}</select></label>
              <label class="client-field">Frequency <select id="new-request-cadence">${optionList(cadenceLabels, "to_confirm")}</select></label>
              <label class="client-field">How soon <select id="new-request-how-soon">${optionList(howSoonLabels, "to_confirm")}</select></label>
              <label class="client-field">Preferred days <select id="new-request-day">${optionList(dayLabels, "to_confirm")}</select></label>
              <label class="client-field">Preferred times <select id="new-request-time">${optionList(timeWindowLabels, "to_confirm")}</select></label>
              <label class="client-field">Approx size <select id="new-request-approx-size">${optionList(approxSizeLabels, "unknown")}</select></label>
              <label class="client-field">Pets <select id="new-request-pets">${optionList(petsLabels, "unknown")}</select></label>
              <label class="client-field">Parking / access <select id="new-request-parking">${optionList(parkingLabels, "unknown")}</select></label>
              <label class="client-field">Would photos help? <select id="new-request-photos">${optionList(photoHelpLabels, "to_confirm")}</select></label>
              <label class="client-field">Next action <input id="new-request-next-action" type="text" value="Contact customer"></label>
              <label class="schedule-check wide"><input id="new-request-priority-kitchen" type="checkbox"><span>Kitchen priority</span></label>
              <label class="schedule-check wide"><input id="new-request-priority-bathrooms" type="checkbox"><span>Bathrooms priority</span></label>
              <label class="schedule-check wide"><input id="new-request-priority-floors" type="checkbox"><span>Floors priority</span></label>
              <label class="schedule-check wide"><input id="new-request-priority-oven" type="checkbox"><span>Oven / appliance priority</span></label>
              <label class="client-field wide">Customer message <textarea id="new-request-message" rows="3"></textarea></label>
            </div>
          </div>

          <div class="request-form-section">
            <h3>Practical cleaning setup</h3>
            <div class="request-form-grid">
              <label class="client-field">Cleaning products supplied by <select id="new-request-products">${optionList(supplyLabels, "to_confirm")}</select></label>
              <label class="client-field">Vacuum / hoover supplied by <select id="new-request-vacuum">${optionList(equipmentLabels, "to_confirm")}</select></label>
              <label class="client-field">Mop supplied by <select id="new-request-mop">${optionList(equipmentLabels, "to_confirm")}</select></label>
            </div>
          </div>

          <div class="request-form-section">
            <h3>Internal quote prep</h3>
            <div class="request-form-grid">
              <label class="client-field">Quote readiness <select id="new-request-quote-readiness">${optionList(quoteReadinessLabels, "needs_contact")}</select></label>
              <label class="client-field">Assessment required <select id="new-request-assessment">${optionList(assessmentLabels, "to_confirm")}</select></label>
              <label class="client-field">Initial clean <select id="new-request-initial-clean">${optionList(initialCleanLabels, "to_confirm")}</select></label>
              <label class="client-field">Pricing basis <select id="new-request-pricing-basis">${optionList(pricingBasisLabels, "to_confirm")}</select></label>
              <label class="client-field">Regular duration (minutes) <input id="new-request-regular-duration" type="number" min="0" step="30" placeholder="180"></label>
              <label class="client-field">Initial duration (minutes) <input id="new-request-initial-duration" type="number" min="0" step="30" placeholder="300"></label>
              <label class="client-field">Team size <input id="new-request-team-size" type="number" min="1" step="1" placeholder="1"></label>
              <label class="client-field">Scope confidence <select id="new-request-scope-confidence">${optionList(scopeConfidenceLabels, "to_confirm")}</select></label>
              <label class="client-field wide">Short scoping note <textarea id="new-request-scoping-note" rows="2"></textarea></label>
              <label class="schedule-check wide"><input id="new-request-consider-eco" type="checkbox"><span>Eco products preferred</span></label>
              <label class="schedule-check wide"><input id="new-request-consider-initial" type="checkbox"><span>Initial deep clean may be needed</span></label>
              <label class="schedule-check wide"><input id="new-request-consider-consumables" type="checkbox"><span>Commercial consumables option may be needed</span></label>
              <label class="schedule-check wide"><input id="new-request-consider-parking" type="checkbox"><span>Parking permit may affect quote</span></label>
            </div>
          </div>

          <div class="request-form-section">
            <h3>Notes</h3>
            <div class="request-form-grid">
              <label class="client-field wide">Property notes <textarea id="new-request-property-notes" rows="2"></textarea></label>
              <label class="client-field wide">Cleaning notes <textarea id="new-request-cleaning-notes" rows="2"></textarea></label>
              <label class="client-field wide">Internal notes <textarea id="new-request-internal-notes" rows="2"></textarea></label>
            </div>
          </div>

          <div class="drawer-actions">
            <button class="button primary" type="button" data-request-action="save-new-request">Save request</button>
            <button class="button ghost" type="button" data-request-action="close-new-request">Cancel</button>
          </div>
        </section>
      </div>
    `;
  }

  function refresh() {
    const root = document.getElementById("page-root");
    if (root?.querySelector("[data-requests-root]")) root.innerHTML = render();
  }

  function value(id) {
    const el = document.getElementById(id);
    if (!el) return "";
    if (el.tagName === "SELECT") {
      return el.options[el.selectedIndex]?.value || "";
    }
    return el.value.trim();
  }

  function numericValue(id) {
    const raw = value(id);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function checked(id) {
    return Boolean(document.getElementById(id)?.checked);
  }

  function selectedQuoteConsiderations() {
    const considerations = [
      checked("new-request-consider-eco") ? "eco_products_preferred" : "",
      checked("new-request-consider-initial") ? "initial_deep_clean" : "",
      checked("new-request-consider-consumables") ? "commercial_consumables_option" : "",
      checked("new-request-consider-parking") ? "parking_permit_needed" : ""
    ].filter(Boolean);
    if (value("new-request-photos") === "yes" || value("new-request-photos") === "requested") considerations.push("photos_requested");
    if (value("new-request-products") === "mixed_specific_products_required") considerations.push("eco_products_preferred");
    if (value("new-request-parking") === "permit_required") considerations.push("parking_permit_needed");
    return Array.from(new Set(considerations));
  }

  function selectedMainPriorities() {
    return [
      checked("new-request-priority-kitchen") ? "kitchen" : "",
      checked("new-request-priority-bathrooms") ? "bathrooms" : "",
      checked("new-request-priority-floors") ? "floors" : "",
      checked("new-request-priority-oven") ? "oven" : ""
    ].filter(Boolean);
  }

  function selectedReviewPriorities() {
    return [
      checked("review-priority-kitchen") ? "kitchen" : "",
      checked("review-priority-bathrooms") ? "bathrooms" : "",
      checked("review-priority-floors") ? "floors" : "",
      checked("review-priority-oven") ? "oven" : "",
      checked("review-priority-washrooms") ? "washrooms" : "",
      checked("review-priority-common-areas") ? "common_areas" : ""
    ].filter(Boolean);
  }

  function selectedReviewConsiderations() {
    const considerations = [
      checked("review-consider-eco") ? "eco_products_preferred" : "",
      checked("review-consider-photos") ? "photos_requested" : "",
      checked("review-consider-initial") ? "initial_deep_clean" : "",
      checked("review-consider-consumables") ? "commercial_consumables_option" : "",
      checked("review-consider-parking") ? "parking_permit_needed" : "",
      checked("review-consider-access") ? "access_to_confirm" : ""
    ].filter(Boolean);
    if (value("review-photos") === "yes" || value("review-photos") === "requested") considerations.push("photos_requested");
    if (value("review-products") === "mixed_specific_products_required") considerations.push("eco_products_preferred");
    if (value("review-parking") === "permit_required") considerations.push("parking_permit_needed");
    return Array.from(new Set(considerations));
  }

  function prepStateFor(valueToCheck, suggestedState = "suggested") {
    return valueToCheck && valueToCheck !== "to_confirm" ? suggestedState : "to_confirm";
  }

  function estimateStateFor(valueToCheck) {
    return valueToCheck ? "suggested" : "not_estimated";
  }

  function initials(name) {
    return String(name || "CL")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CL";
  }

  function statusTone(status) {
    const tones = {
      lead: "info",
      prospect: "warning",
      active_client: "success",
      commercial: "info",
      paused: "warning",
      inactive: "info",
      archived: "danger"
    };
    return tones[status] || "info";
  }

  function createClientShell() {
    const name = value("new-request-client-name");
    const phone = value("new-request-phone");
    const email = value("new-request-email");
    if (!name) {
      toast("Choose an existing client or add a new client name.");
      return null;
    }
    if (!phone && !email) {
      toast("Add phone or email for the new client shell.");
      return null;
    }

    const client = {
      id: `client-${Date.now()}`,
      initials: initials(name),
      display_name: name,
      name,
      company: "",
      client_type: "individual",
      company_name: "",
      first_name: name.split(/\s+/)[0] || "",
      last_name: name.split(/\s+/).slice(1).join(" "),
      status: "lead",
      statusTone: statusTone("lead"),
      lead_source: "manual",
      email,
      phone,
      balance: "GBP 0.00",
      mainProperty: "Property to confirm",
      area: "",
      activeSummary: "Request open",
      lastCommunication: "Just now",
      internalNote: "Created from a manual CleanOps request.",
      internal_notes: "Created from a manual CleanOps request.",
      billingAddress: "",
      properties: [],
      activeWork: [],
      requests: [],
      quotes: [],
      jobs: [],
      invoices: [],
      billingHistory: [
        { invoice: "No billing history", detail: "This client has not been billed yet", amount: "GBP 0.00" }
      ]
    };
    data.clients.unshift(client);
    return client;
  }

  function createPropertyShell(client) {
    const addressLine1 = value("new-request-property-address-line-1");
    const addressLine2 = value("new-request-property-address-line-2");
    const city = value("new-request-property-city");
    const postcode = value("new-request-property-postcode");
    const address = [addressLine1, addressLine2, city, postcode].filter(Boolean).join(", ");
    const property = {
      id: `PROP-${Date.now()}`,
      client_id: client.id,
      label: address || "Property to confirm",
      name: address || "Property to confirm",
      addressLine1,
      addressLine2,
      address,
      area: city,
      postcode,
      property_type: value("new-request-property-type") || "unknown",
      bedrooms: value("new-request-bedrooms") || "unknown",
      bathrooms: value("new-request-bathrooms") || "unknown",
      default_service_type: value("new-request-type") || "to_confirm",
      default_cadence: value("new-request-cadence") || "to_confirm",
      preferred_day: value("new-request-day") || "to_confirm",
      preferred_time_window: value("new-request-time") || "to_confirm",
      access_method: "to_arrange",
      parking: value("new-request-parking") || "unknown",
      pets_present: value("new-request-pets") || "unknown",
      cleaning_products: value("new-request-products") || "to_confirm",
      vacuum_hoover: value("new-request-vacuum") || "to_confirm",
      mop: value("new-request-mop") || "to_confirm",
      property_notes: value("new-request-property-notes"),
      cleaning_notes: value("new-request-cleaning-notes"),
      next_action: "Review request details"
    };
    client.properties = client.properties || [];
    client.properties.push(property);
    client.mainProperty = client.mainProperty === "Property to confirm" ? property.label : client.mainProperty;
    client.area = client.area || property.address;
    return property;
  }

  async function saveNewRequest() {
    const api = await import('./api.js');

    const clientName = value("new-request-client-name");
    const nameParts = clientName.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const phone = value("new-request-phone");
    const email = value("new-request-email");
    const customerMessage = value("new-request-message");
    const selectedClient = findClient(value("new-request-client"));
    const selectedProperty = findProperty(value("new-request-client"), value("new-request-property")) || findAnyProperty(value("new-request-property")).property;
    const useExistingCustomer = selectedClient?.api_backed ? selectedClient.id : "";
    const useExistingProperty = selectedProperty?.api_backed ? selectedProperty.id : "";

    if (!useExistingCustomer && !firstName && !lastName && !phone && !email && !customerMessage) {
      toast("Please provide at least a name, contact info, or a message.");
      return;
    }

    const payload = {
      sourceType: "manual",
      customerId: useExistingCustomer,
      propertyId: useExistingProperty,
      firstName,
      lastName,
      email,
      phone,
      propertyAddressLine1: value("new-request-property-address-line-1"),
      propertyAddressLine2: value("new-request-property-address-line-2"),
      propertyCity: value("new-request-property-city"),
      propertyPostcode: value("new-request-property-postcode"),
      propertyType: cleanSelectValue(value("new-request-property-type")),
      bedrooms: cleanSelectValue(value("new-request-bedrooms")),
      bathrooms: cleanSelectValue(value("new-request-bathrooms")),
      requestType: value("new-request-type"),
      status: apiStatus(value("new-request-status")),
      cadence: cleanSelectValue(value("new-request-cadence")),
      howSoon: cleanSelectValue(value("new-request-how-soon")),
      preferredDay: cleanSelectValue(value("new-request-day")),
      preferredTimeWindow: cleanSelectValue(value("new-request-time")),
      approxSize: cleanSelectValue(value("new-request-approx-size")),
      petsPresent: cleanSelectValue(value("new-request-pets")),
      parking: cleanSelectValue(value("new-request-parking")),
      photosHelpful: cleanSelectValue(value("new-request-photos")),
      customerMessage: customerMessage,
      cleaningProducts: cleanSelectValue(value("new-request-products")),
      vacuumHoover: cleanSelectValue(value("new-request-vacuum")),
      mop: cleanSelectValue(value("new-request-mop")),
      quoteReadiness: value("new-request-quote-readiness"),
      assessmentRequired: cleanSelectValue(value("new-request-assessment")),
      initialCleanRequired: cleanSelectValue(value("new-request-initial-clean")),
      pricingBasis: cleanSelectValue(value("new-request-pricing-basis")),
      estimatedRegularDurationMinutes: numericValue("new-request-regular-duration"),
      estimatedInitialDurationMinutes: numericValue("new-request-initial-duration"),
      estimatedTeamSize: numericValue("new-request-team-size"),
      scopeConfidence: cleanSelectValue(value("new-request-scope-confidence")),
      shortScopingNote: value("new-request-scoping-note"),
      propertyNotes: value("new-request-property-notes"),
      cleaningNotes: value("new-request-cleaning-notes"),
      internalNotes: value("new-request-internal-notes"),
      mainPriorities: selectedMainPriorities(),
      quoteConsiderations: selectedQuoteConsiderations()
    };

    try {
      const response = await api.createRequest(payload);
      if (response) {
        state.selectedRequestId = response.id;
        state.newRequestOpen = false;
        state.moreOpen = false;
        toast(`Created ${response.number || 'new request'}.`);
        await loadApiRequests(true);
      } else {
        toast(response?.error || "Failed to create request.");
      }
    } catch (e) {
      toast(e?.message || "Error creating request.");
    }
  }

  async function saveReviewRequest() {
    const api = await import('./api.js');
    const request = selectedRequest();
    if (!request) return;

    const payload = {
      requestType: value("review-request-type"),
      status: apiStatus(value("review-request-status")),
      cadence: cleanSelectValue(value("review-request-cadence")),
      howSoon: cleanSelectValue(value("review-request-how-soon")),
      preferredDay: cleanSelectValue(value("review-request-day")),
      preferredTimeWindow: cleanSelectValue(value("review-request-time")),
      approxSize: cleanSelectValue(value("review-request-approx-size")),
      photosHelpful: cleanSelectValue(value("review-request-photos")),
      customerMessage: value("review-request-message"),
      mainPriorities: selectedReviewPriorities(),

      propertyAddressLine1: value("review-property-address-line-1"),
      propertyAddressLine2: value("review-property-address-line-2"),
      propertyCity: value("review-property-city"),
      propertyPostcode: value("review-property-postcode"),
      propertyType: cleanSelectValue(value("review-property-type")),
      bedrooms: cleanSelectValue(value("review-bedrooms")),
      bathrooms: cleanSelectValue(value("review-bathrooms")),
      petsPresent: cleanSelectValue(value("review-pets")),
      parking: cleanSelectValue(value("review-parking")),

      cleaningProducts: cleanSelectValue(value("review-products")),
      vacuumHoover: cleanSelectValue(value("review-vacuum")),
      mop: cleanSelectValue(value("review-mop")),
      setupConfirmed: checked("review-setup-confirmed") ? 1 : 0,

      quoteReadiness: value("review-quote-readiness"),
      assessmentRequired: cleanSelectValue(value("review-assessment")),
      pricingBasis: cleanSelectValue(value("review-pricing-basis")),
      initialCleanRequired: cleanSelectValue(value("review-initial-clean")),
      estimatedRegularDurationMinutes: numericValue("review-regular-duration"),
      estimatedInitialDurationMinutes: numericValue("review-initial-duration"),
      estimatedTeamSize: numericValue("review-team-size"),
      scopeConfidence: cleanSelectValue(value("review-scope-confidence")),
      shortScopingNote: value("review-scoping-note"),
      quoteConsiderations: selectedReviewConsiderations(),

      propertyNotes: value("review-property-notes"),
      cleaningNotes: value("review-cleaning-notes"),
      internalNotes: value("review-internal-notes")
    };

    try {
      const response = await api.updateRequest(request.id, payload);
      if (response) {
        state.reviewRequestOpen = false;
        toast("Request saved.");
        await loadApiRequests(true);
      } else {
        toast(response?.error || "Failed to save request.");
      }
    } catch (e) {
      toast(e?.message || "Error saving request.");
    }
  }

  function setInputValue(id, nextValue) {
    const element = document.getElementById(id);
    if (element) element.value = nextValue || "";
  }

  function selectedOption(selectId) {
    return document.getElementById(selectId)?.value || "";
  }

  function populateClientFields(client) {
    if (!client) return;
    setInputValue("new-request-client-name", displayName(client));
    setInputValue("new-request-phone", client.phone || "");
    setInputValue("new-request-email", client.email || "");
  }

  function populatePropertyFields(property) {
    if (!property) return;
    setInputValue("new-request-property-address-line-1", propertyLine1(property));
    setInputValue("new-request-property-address-line-2", propertyLine2(property));
    setInputValue("new-request-property-city", propertyCity(property));
    setInputValue("new-request-property-postcode", propertyPostcode(property));
    setInputValue("new-request-property-type", propertyTypeValue(property) || "unknown");
    setInputValue("new-request-bedrooms", property.bedrooms || "unknown");
    setInputValue("new-request-bathrooms", property.bathrooms || "unknown");
    setInputValue("new-request-pets", propertyPetsValue(property) || "unknown");
    setInputValue("new-request-parking", property.parking || "unknown");
  }

  function refreshPropertySelectForClient(clientId) {
    const select = document.getElementById("new-request-property");
    if (!select) return;
    select.innerHTML = `<option value="">Create a new property</option>${propertyOptions(clientId)}`;
  }

  function handleChange(event) {
    const target = event.target;
    if (!target) return false;

    if (target.id === "new-request-client") {
      const client = findClient(target.value);
      refreshPropertySelectForClient(client?.id || "");
      populateClientFields(client);
      return true;
    }

    if (target.id === "new-request-property") {
      const clientId = selectedOption("new-request-client");
      const property = findProperty(clientId, target.value);
      populatePropertyFields(property);
      return true;
    }

    return false;
  }

  function handleClick(event) {
    const routeTarget = event.target.closest("[data-route='requests']");
    if (routeTarget) {
      state.selectedRequestId = null;
      state.reviewRequestOpen = false;
      state.moreOpen = false;
      return false;
    }

    const modal = event.target.closest("[data-request-modal]");
    if (event.target.closest("[data-request-backdrop]") && !modal) {
      state.newRequestOpen = false;
      refresh();
      return true;
    }
    const reviewModal = event.target.closest("[data-review-modal]");
    if (event.target.closest("[data-review-backdrop]") && !reviewModal) {
      state.reviewRequestOpen = false;
      refresh();
      return true;
    }

    const requestId = event.target.closest("[data-request-id]")?.dataset.requestId;
    if (requestId) {
      state.selectedRequestId = requestId;
      state.reviewRequestOpen = false;
      state.moreOpen = false;
      refresh();
      return true;
    }

    const moreAction = event.target.closest("[data-request-more]")?.dataset.requestMore;
    if (moreAction) {
      const request = selectedRequest();
      state.moreOpen = false;
      if (moreAction === "Archive request" && request) {
        if (confirm("Archive this request?")) {
          toast("Archiving request...");
          import('./api.js').then(api => {
            api.updateRequest(request.id, { status: "archived" }).then(res => {
              if (res) {
                toast(`Request ${request.number} archived.`);
                loadApiRequests(true);
              } else {
                toast(res?.error || "Failed to archive request.");
              }
            });
          });
        }
        refresh();
        return true;
      }
      toast(`${moreAction} is mocked for ${request?.number || "request"}.`);
      refresh();
      return true;
    }

    const actionTarget = event.target.closest("[data-request-action]");
    if (!actionTarget) return false;

    const action = actionTarget.dataset.requestAction;
    if (action === "open-new-request") {
      state.newRequestOpen = true;
      refresh();
      return true;
    }
    if (action === "close-new-request") {
      state.newRequestOpen = false;
      refresh();
      return true;
    }
    if (action === "save-new-request") {
      saveNewRequest();
      return true;
    }
    if (action === "open-review-request") {
      state.reviewRequestOpen = true;
      refresh();
      return true;
    }
    if (action === "close-review-request") {
      if (confirm("Cancel and discard any unsaved changes?")) {
        state.reviewRequestOpen = false;
        refresh();
      }
      return true;
    }
    if (action === "save-review-request") {
      saveReviewRequest();
      return true;
    }
    if (action === "back-to-list") {
      state.selectedRequestId = null;
      state.reviewRequestOpen = false;
      state.moreOpen = false;
      refresh();
      return true;
    }
    if (action === "toggle-more") {
      state.moreOpen = !state.moreOpen;
      refresh();
      return true;
    }
    if (action === "create-quote") {
      const request = selectedRequest();
      const blocker = request ? quoteBlocker(request) : "";
      if (blocker) {
        toast(blocker);
        return true;
      }
      if (request && window.CleanOpsQuotes?.openFromRequest?.(request.id)) {
        window.CleanOpsShell?.navigate?.("quotes");
        toast(`Quote opened for ${request.number}.`);
        return true;
      }
      toast(`Create quote workflow is coming in the next backend stage.`);
      return true;
    }
    if (action === "create-job" || action === "schedule-assessment") {
      toast(`${action.replace(/-/g, " ")} workflow is coming in the next backend stage.`);
      return true;
    }
    if (action === "contact-customer") {
      const request = selectedRequest();
      const client = findClient(request?.client_id);
      if (client?.email || request?.api_customer_email) {
        window.location.href = `mailto:${client?.email || request.api_customer_email}`;
      } else if (client?.phone || request?.api_customer_phone) {
        window.location.href = `tel:${client?.phone || request.api_customer_phone}`;
      } else {
        toast("No contact information available.");
      }
      return true;
    }
    if (action === "add-note") {
      state.reviewRequestOpen = true;
      refresh();
      setTimeout(() => {
        const el = document.getElementById("review-internal-notes");
        if (el) el.focus();
      }, 0);
      return true;
    }
    if (action === "mark-lost") {
      const request = selectedRequest();
      if (request && confirm("Mark this request as lost?")) {
        toast("Marking request as lost...");
        import('./api.js').then(api => {
          api.updateRequest(request.id, { status: "lost" }).then(res => {
            if (res) {
              toast(`Request ${request.number} marked as lost.`);
              loadApiRequests(true);
            } else {
              toast(res?.error || "Failed to mark request as lost.");
            }
          });
        });
      }
      return true;
    }

    const request = selectedRequest();
    toast(`${action.replace(/-/g, " ")} is mocked for ${request?.number || "request"}.`);
    return true;
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);

  function openRequest(id) {
    state.selectedRequestId = id;
    state.detailTab = "active";
    state.moreOpen = false;
    refresh();
    // Use shell to navigate to requests if available
    if (window.CleanOpsShell?.navigate) {
      window.CleanOpsShell.navigate("requests");
    } else {
      window.location.hash = "requests";
    }
  }

  window.CleanOpsRequests = {
    render,
    handleClick,
    load: loadApiRequests,
    openRequest,
    labels: {
      requestStatusLabels,
      requestStatusTones,
      requestTypeLabels
    }
  };
})();
