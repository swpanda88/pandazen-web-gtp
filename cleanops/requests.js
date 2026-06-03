(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedRequestId: null,
    newRequestOpen: false,
    moreOpen: false
  };

  const requestStatusLabels = {
    new_enquiry: "New enquiry",
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
    new_enquiry: "success",
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
    deep_clean: "Deep clean",
    end_of_tenancy: "End of tenancy",
    commercial_clean: "Commercial clean",
    holiday_let_turnaround: "Holiday let turnaround",
    one_off_clean: "One-off clean",
    issue_revisit: "Issue / revisit",
    other: "Other"
  };

  const requestTypeClasses = {
    regular_domestic_clean: "type-cleaning-visit",
    deep_clean: "type-cleaning-visit",
    end_of_tenancy: "type-cleaning-visit",
    holiday_let_turnaround: "type-commercial-special",
    one_off_clean: "type-cleaning-visit",
    commercial_clean: "type-commercial-special",
    issue_revisit: "type-issue-revisit",
    other: "type-task-reminder"
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
    flat_apartment: "Flat / apartment",
    studio_annexe: "Studio / annexe",
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
    not_applicable: "N/A",
    unknown: "Unknown"
  };

  const bathroomsLabels = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4_plus": "4+",
    not_applicable: "N/A",
    unknown: "Unknown"
  };

  const cadenceLabels = {
    one_off: "One-off",
    weekly: "Weekly",
    fortnightly: "Fortnightly",
    four_weekly: "Four-weekly",
    monthly: "Monthly",
    as_requested: "As requested",
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
    unknown: "Unknown"
  };

  const petsLabels = {
    none: "No pets",
    dog: "Dog",
    cat: "Cat",
    multiple_pets: "Multiple pets",
    other: "Other pets",
    not_applicable: "N/A",
    unknown: "Unknown"
  };

  const parkingLabels = {
    driveway: "Driveway",
    street_parking: "Street parking",
    permit_required: "Permit required",
    paid_parking: "Paid parking",
    staff_bays: "Staff bays",
    no_easy_parking: "No easy parking",
    unknown: "Unknown"
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
    not_applicable: "N/A"
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
    not_estimated: "Not estimated yet"
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

  function labelFrom(map, value, fallback = "Not set") {
    if (!value) return fallback;
    return map[value] || value;
  }

  function clients() {
    if (!Array.isArray(data.clients)) data.clients = [];
    return data.clients;
  }

  function requests() {
    if (!Array.isArray(data.requests)) data.requests = [];
    return data.requests;
  }

  function displayName(client) {
    return client?.display_name || client?.name || [client?.first_name, client?.last_name].filter(Boolean).join(" ") || "Unlinked client";
  }

  function propertyLabel(property) {
    return property?.label || property?.name || "Property to confirm";
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

  function requestTypeChip(request) {
    const typeClass = requestTypeClasses[request.request_type] || "type-task-reminder";
    return `<span class="type-pill ${typeClass}">${escapeHtml(requestTypeLabel(request))}</span>`;
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
    if (!request.customer_message || !request.request_type || request.preferred_cadence === "to_confirm") return "missing_scope";
    if (request.status === "new_enquiry" || request.status === "waiting_customer") return "needs_contact";
    return "ready_to_quote";
  }

  function quoteBlocker(request) {
    const readiness = request.quote_readiness || deriveQuoteReadiness(request);
    const blockers = {
      needs_contact: "Contact customer before preparing the quote.",
      needs_assessment: "Book or complete assessment before preparing the quote.",
      missing_scope: "Complete missing scope before preparing the quote.",
      quote_created: "A quote already exists for this request."
    };
    return readiness === "ready_to_quote" ? "" : blockers[readiness] || "Review quote inputs before preparing the quote.";
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
    if (!label) return state === "to_confirm" ? "To confirm" : "Not estimated yet";
    if (label === "To confirm") return labelFrom(prepStateLabels, state, "To confirm");
    if (state === "confirmed") return `Confirmed - ${label}`;
    if (state === "suggested") return `Suggested - ${label}`;
    if (state === "not_estimated") return "Not estimated yet";
    if (state === "to_confirm") return "To confirm";
    return label;
  }

  function prepMinutesLabel(value, state = "not_estimated") {
    return prepValue(minutesLabel(value, ""), state);
  }

  function prepTeamSizeLabel(value, state = "not_estimated") {
    return prepValue(teamSizeLabel(value) === "To confirm" ? "" : teamSizeLabel(value), state);
  }

  function priorityChips(request) {
    const items = Array.isArray(request.main_priorities) ? request.main_priorities : [];
    if (!items.length) return chip("No priorities supplied", "muted");
    return items.map((item) => chip(labelFrom(priorityLabels, item, item), "info")).join("");
  }

  function considerationChips(request) {
    const items = Array.isArray(request.quote_considerations) ? request.quote_considerations : [];
    if (!items.length) return chip("No quote considerations", "muted");
    return items
      .map((item) => chip(labelFrom(quoteConsiderationLabels, item, item), "info"))
      .join("");
  }

  function propertyArea(property) {
    return property?.postcode || property?.area || "Area to confirm";
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
      </section>
    `;
  }

  function renderList() {
    const rows = requests().map((request) => {
      const client = findClient(request.client_id);
      const property = findProperty(request.client_id, request.property_id) || findAnyProperty(request.property_id).property;
      return `
        <tr class="request-row" data-request-id="${escapeHtml(request.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(request.title)}">
          <td><strong>${escapeHtml(request.title)}</strong><br><span class="muted">${escapeHtml(request.number)}</span></td>
          <td>${escapeHtml(displayName(client))}</td>
          <td><strong>${escapeHtml(propertyLabel(property))}</strong><br><span class="muted">${escapeHtml(property?.address || propertyArea(property))}</span></td>
          <td>${requestTypeChip(request)}</td>
          <td>${requestStatusChip(request)}</td>
          <td>${escapeHtml(request.next_action || "Review request")}</td>
          <td>${escapeHtml(request.received_at || "Unknown")}<br><span class="muted">${escapeHtml(request.updated_at ? `Updated ${request.updated_at}` : "")}</span></td>
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
          ${table(["Request", "Client", "Property / area", "Type", "Status", "Next action", "Received / updated"], rows)}
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
        <strong>${escapeHtml(request.title)}</strong>
      </div>

      <div class="page-head">
        <div>
          <div class="title-row">
            <div class="avatar">${escapeHtml((request.number || "RQ").slice(-2))}</div>
            <h1>${escapeHtml(request.title)}</h1>
            ${requestStatusChip(request)}
          </div>
          <div class="button-row request-title-chips" style="justify-content:flex-start">${requestTypeChip(request)} ${quoteReadinessChip(request)} ${chip(labelFrom(sourceLabels, request.source, "Manual"), "info")}</div>
        </div>
        <div class="page-actions">
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
            <div class="panel-head"><h2>Request summary</h2>${button("Mark lost/archive", "mark-lost-archive", "small")}</div>
            <div class="panel-body request-summary-grid">
              <div>
                <h3>Linked records</h3>
                <div class="field-row"><span>Client</span><strong>${escapeHtml(displayName(client))}</strong></div>
                <div class="field-row"><span>Client status</span><strong>${escapeHtml(labelFrom(clientStatusLabels, client?.status, "Lead"))}</strong></div>
                <div class="field-row"><span>Property</span><strong>${escapeHtml(propertyLabel(property))}</strong></div>
                <div class="field-row"><span>Area</span><strong>${escapeHtml(propertyArea(property))}</strong></div>
              </div>
              <div>
                <h3>Request state</h3>
                <div class="field-row"><span>Request number</span><strong>${escapeHtml(request.number)}</strong></div>
                <div class="field-row"><span>Received</span><strong>${escapeHtml(request.received_at || "Unknown")}</strong></div>
                <div class="field-row"><span>Updated</span><strong>${escapeHtml(request.updated_at || "Unknown")}</strong></div>
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
                <div class="field-row"><span>Property type</span><strong>${escapeHtml(labelFrom(propertyTypeLabels, request.intake_property_type || property?.property_type, "To confirm"))}</strong></div>
                <div class="field-row"><span>Approx size</span><strong>${escapeHtml(labelFrom(approxSizeLabels, request.approx_size, "Unknown"))}</strong></div>
                <div class="field-row"><span>Bedrooms</span><strong>${escapeHtml(labelFrom(bedroomsLabels, request.bedrooms || property?.bedrooms, "Unknown"))}</strong></div>
                <div class="field-row"><span>Bathrooms</span><strong>${escapeHtml(labelFrom(bathroomsLabels, request.bathrooms || property?.bathrooms, "Unknown"))}</strong></div>
                <div class="field-row"><span>Pets</span><strong>${escapeHtml(labelFrom(petsLabels, request.pets_present || property?.pets_present, "Unknown"))}</strong></div>
                <div class="field-row"><span>Parking</span><strong>${escapeHtml(labelFrom(parkingLabels, request.parking || property?.parking, "Unknown"))}</strong></div>
              </div>
              <div class="wide">
                <h3>Main priorities</h3>
                <div class="button-row request-considerations" style="justify-content:flex-start">${priorityChips(request)}</div>
              </div>
              <div>
                <h3>Products and photos</h3>
                <div class="field-row"><span>Products preference</span><strong>${escapeHtml(labelFrom(supplyLabels, request.products_preference || request.cleaning_products, "To confirm"))}</strong></div>
                <div class="field-row"><span>Would photos help?</span><strong>${escapeHtml(labelFrom(photoHelpLabels, request.photos_helpful, "To confirm"))}</strong></div>
              </div>
              <div class="wide">
                <h3>Customer message</h3>
                <p class="muted">${escapeHtml(request.customer_message || "No customer message recorded.")}</p>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-head"><h2>Practical setup</h2></div>
            <div class="panel-body request-summary-grid">
              <div>
                <h3>Operational supplies</h3>
                <div class="field-row"><span>Cleaning products supplied by</span><strong>${escapeHtml(labelFrom(supplyLabels, request.cleaning_products, "To confirm"))}</strong></div>
                <div class="field-row"><span>Vacuum / hoover supplied by</span><strong>${escapeHtml(labelFrom(equipmentLabels, request.vacuum_hoover, "To confirm"))}</strong></div>
                <div class="field-row"><span>Mop supplied by</span><strong>${escapeHtml(labelFrom(equipmentLabels, request.mop, "To confirm"))}</strong></div>
              </div>
              <div>
                <h3>Confirmation state</h3>
                <div class="field-row"><span>Products source</span><strong>${escapeHtml(prepValue(labelFrom(supplyLabels, request.cleaning_products, ""), request.cleaning_products_state || "to_confirm"))}</strong></div>
                <div class="field-row"><span>Equipment source</span><strong>${escapeHtml(request.setup_confirmed ? "Confirmed" : "To confirm")}</strong></div>
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
                <p class="muted">${escapeHtml(request.short_scoping_note || request.service_summary || "No internal scoping note yet.")}</p>
              </div>
              <div class="wide">
                <h3>Quote considerations</h3>
                <div class="button-row request-considerations" style="justify-content:flex-start">${considerationChips(request)}</div>
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
          <article class="panel pad">
            <div class="side-section">
              <h2>Client</h2>
              <div class="field-row"><span>Name</span><strong>${escapeHtml(displayName(client))}</strong></div>
              <div class="field-row"><span>Email</span><strong>${escapeHtml(client?.email || "Not set")}</strong></div>
              <div class="field-row"><span>Phone</span><strong>${escapeHtml(client?.phone || "Not set")}</strong></div>
            </div>
            <div class="side-section">
              <h2>Property setup</h2>
              <div class="field-row"><span>Address</span><strong>${escapeHtml(property?.address || "To confirm")}</strong></div>
              <div class="field-row"><span>Type</span><strong>${escapeHtml(labelFrom(propertyTypeLabels, property?.property_type, "To confirm"))}</strong></div>
              <div class="field-row"><span>Bedrooms</span><strong>${escapeHtml(labelFrom(bedroomsLabels, property?.bedrooms, "Unknown"))}</strong></div>
              <div class="field-row"><span>Bathrooms</span><strong>${escapeHtml(labelFrom(bathroomsLabels, property?.bathrooms, "Unknown"))}</strong></div>
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
        <p class="muted">${escapeHtml(copy || "None recorded.")}</p>
      </div>
    `;
  }

  function renderMoreMenu(request, client, property) {
    const items = ["Duplicate request", "Attach file/photo", "Convert to quote", "Create task", "Archive request"];
    return `
      <div class="client-more-menu" role="menu">
        <p class="eyebrow">Request tools</p>
        ${items.map((item) => `<button type="button" data-request-more="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("")}
        <p class="muted menu-context">Context: ${escapeHtml(request.number)} / ${escapeHtml(displayName(client))}${property ? ` / ${escapeHtml(propertyLabel(property))}` : ""}</p>
      </div>
    `;
  }

  function optionList(map, selected) {
    return Object.entries(map)
      .map(([value, label]) => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`)
      .join("");
  }

  function propertyOptions() {
    const options = [];
    clients().forEach((client) => {
      (client.properties || []).forEach((property) => {
        options.push(`<option value="${escapeHtml(property.id)}">${escapeHtml(displayName(client))} - ${escapeHtml(propertyLabel(property))}</option>`);
      });
    });
    return options.join("");
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
                  <option value="">Create a new property shell</option>
                  ${propertyOptions()}
                </select>
              </label>
              <label class="client-field wide">New property address <input id="new-request-property-address" type="text" autocomplete="off"></label>
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
              <label class="client-field">Parking <select id="new-request-parking">${optionList(parkingLabels, "unknown")}</select></label>
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
    return document.getElementById(id)?.value?.trim() || "";
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
    const address = value("new-request-property-address");
    const property = {
      id: `PROP-${Date.now()}`,
      client_id: client.id,
      label: address || "Property to confirm",
      name: address || "Property to confirm",
      address,
      area: "",
      postcode: "",
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

  function saveNewRequest() {
    let client = findClient(value("new-request-client"));
    if (!client) client = createClientShell();
    if (!client) return;

    const existingPropertyId = value("new-request-property");
    let property = null;
    if (existingPropertyId) {
      const found = findAnyProperty(existingPropertyId);
      property = found.property;
      if (found.client && found.client.id !== client.id) client = found.client;
    }
    if (!property) property = createPropertyShell(client);

    const type = value("new-request-type") || "regular_domestic_clean";
    const pricingBasis = value("new-request-pricing-basis") || "to_confirm";
    const initialCleanRequired = value("new-request-initial-clean") || "to_confirm";
    const regularDuration = numericValue("new-request-regular-duration");
    const initialDuration = numericValue("new-request-initial-duration");
    const teamSize = numericValue("new-request-team-size");
    const requestNumber = `REQ-${1047 + requests().length}`;
    const request = {
      id: `request-${Date.now()}`,
      number: requestNumber,
      title: value("new-request-message").split(".")[0].slice(0, 56) || labelFrom(requestTypeLabels, type, "New request"),
      client_id: client.id,
      property_id: property.id,
      request_type: type,
      status: value("new-request-status") || "new_enquiry",
      source: "manual",
      received_at: "Just now",
      updated_at: "Just now",
      next_action: value("new-request-next-action") || "Contact customer",
      customer_message: value("new-request-message") || "Manual request created by the office.",
      service_summary: `${labelFrom(requestTypeLabels, type, "Request")} request. Confirm service scope before quote or job creation.`,
      short_scoping_note: value("new-request-scoping-note") || `${labelFrom(requestTypeLabels, type, "Request")} request. Internal scoping still needs confirmation before quote.`,
      preferred_cadence: value("new-request-cadence") || "to_confirm",
      how_soon: value("new-request-how-soon") || "to_confirm",
      preferred_day: value("new-request-day") || "to_confirm",
      preferred_time_window: value("new-request-time") || "to_confirm",
      intake_property_type: property.property_type || "unknown",
      approx_size: value("new-request-approx-size") || "unknown",
      bedrooms: property.bedrooms || "unknown",
      bathrooms: property.bathrooms || "unknown",
      pets_present: value("new-request-pets") || property.pets_present || "unknown",
      parking: value("new-request-parking") || property.parking || "unknown",
      main_priorities: selectedMainPriorities(),
      photos_helpful: value("new-request-photos") || "to_confirm",
      cleaning_products: value("new-request-products") || "to_confirm",
      vacuum_hoover: value("new-request-vacuum") || "to_confirm",
      mop: value("new-request-mop") || "to_confirm",
      quote_readiness: value("new-request-quote-readiness") || "needs_contact",
      assessment_required: value("new-request-assessment") || "to_confirm",
      assessment_state: prepStateFor(value("new-request-assessment")),
      initial_clean_required: initialCleanRequired,
      initial_clean_state: prepStateFor(initialCleanRequired),
      pricing_basis: pricingBasis,
      pricing_basis_state: prepStateFor(pricingBasis),
      estimated_regular_duration_minutes: regularDuration,
      regular_duration_state: estimateStateFor(regularDuration),
      estimated_initial_duration_minutes: initialDuration,
      initial_duration_state: estimateStateFor(initialDuration),
      estimated_team_size: teamSize,
      team_size_state: estimateStateFor(teamSize),
      scope_confidence: value("new-request-scope-confidence") || "to_confirm",
      quote_considerations: selectedQuoteConsiderations(),
      property_notes: value("new-request-property-notes") || property.property_notes || "",
      cleaning_notes: value("new-request-cleaning-notes") || property.cleaning_notes || "",
      internal_notes: value("new-request-internal-notes"),
      owner: "Office"
    };

    requests().unshift(request);
    client.requests = client.requests || [];
    client.requests.unshift({ number: request.number, title: request.title, status: requestStatusLabel(request), tone: requestStatusTones[request.status] || "info", propertyId: property.id });
    client.activeSummary = client.activeSummary || "Request open";
    client.lastCommunication = "Just now";

    state.selectedRequestId = request.id;
    state.newRequestOpen = false;
    state.moreOpen = false;
    toast(`Created ${request.number}.`);
    refresh();
  }

  function handleClick(event) {
    const routeTarget = event.target.closest("[data-route='requests']");
    if (routeTarget) {
      state.selectedRequestId = null;
      state.moreOpen = false;
      return false;
    }

    const modal = event.target.closest("[data-request-modal]");
    if (event.target.closest("[data-request-backdrop]") && !modal) {
      state.newRequestOpen = false;
      refresh();
      return true;
    }

    const requestId = event.target.closest("[data-request-id]")?.dataset.requestId;
    if (requestId) {
      state.selectedRequestId = requestId;
      state.moreOpen = false;
      refresh();
      return true;
    }

    const moreAction = event.target.closest("[data-request-more]")?.dataset.requestMore;
    if (moreAction) {
      const request = selectedRequest();
      state.moreOpen = false;
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
    if (action === "back-to-list") {
      state.selectedRequestId = null;
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
      toast(blocker || `Create quote is mocked for ${request?.number || "request"}.`);
      return true;
    }

    const request = selectedRequest();
    toast(`${action.replace(/-/g, " ")} is mocked for ${request?.number || "request"}.`);
    return true;
  }

  document.addEventListener("click", handleClick);

  window.CleanOpsRequests = {
    render,
    handleClick,
    labels: {
      requestStatusLabels,
      requestStatusTones,
      requestTypeLabels
    }
  };
})();
