(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedQuoteId: null,
    newQuoteOpen: false,
    previewQuoteId: null,
    newQuoteRequestId: ""
  };

  const quoteStatusLabels = {
    draft: "Draft",
    ready_to_send: "Ready to send",
    sent: "Sent",
    viewed: "Viewed",
    accepted: "Accepted",
    rejected: "Rejected",
    expired: "Expired",
    converted_to_job: "Converted to job"
  };

  const quoteStatusTones = {
    draft: "info",
    ready_to_send: "success",
    sent: "info",
    viewed: "warning",
    accepted: "success",
    rejected: "danger",
    expired: "danger",
    converted_to_job: "success"
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

  const quoteReadinessLabels = {
    ready_to_quote: "Ready to quote",
    needs_contact: "Needs contact",
    needs_assessment: "Needs assessment",
    missing_scope: "Missing scope",
    quote_created: "Quote created"
  };

  const scopeConfidenceLabels = {
    low: "Low confidence",
    medium: "Medium confidence",
    high: "High confidence"
  };

  const pricingBasisLabels = {
    fixed_per_visit: "Fixed per visit",
    one_off_fixed: "One-off fixed price",
    monthly_contract: "Monthly contract",
    hourly_estimate: "Hourly estimate",
    to_confirm: "To confirm"
  };

  const itemTypeLabels = {
    one_off: "One-off",
    recurring: "Recurring",
    monthly: "Monthly",
    optional: "Optional"
  };

  const considerationLabels = {
    eco_products_preferred: "Eco products preferred",
    include_initial_deep_clean: "Initial clean likely",
    initial_deep_clean: "Initial clean likely",
    commercial_consumables_option: "Commercial consumables option",
    key_holder_access: "Key-holder access",
    parking_permit_needed: "Parking permit needed",
    photos_requested: "Photos may help",
    access_to_confirm: "Access to confirm",
    oven_windows_to_confirm: "Oven/windows to confirm"
  };

  function quotes() {
    return data.quotes || [];
  }

  function requests() {
    return data.requests || [];
  }

  function clients() {
    return data.clients || [];
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function toast(message) {
    window.CleanOpsShell?.toast?.(message);
  }

  function labelFrom(map, value, fallback = "Not set") {
    return map[value] || fallback;
  }

  function chip(label, tone = "info") {
    return `<span class="chip ${tone}">${escapeHtml(label)}</span>`;
  }

  function button(label, action, variant = "") {
    return `<button class="button ${variant}" type="button" data-quote-action="${escapeHtml(action)}">${escapeHtml(label)}</button>`;
  }

  function iconButton(label, action) {
    return `<button class="icon-button" type="button" data-quote-action="${escapeHtml(action)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">X</button>`;
  }

  function optionList(map, selected) {
    return Object.entries(map).map(([value, label]) => `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`).join("");
  }

  function quoteId(quote) {
    return quote.quote_id || quote.id || quote.number;
  }

  function quoteNumber(quote) {
    return quote.quote_number || quote.number || "Draft quote";
  }

  function selectedQuote() {
    return state.selectedQuoteId ? quotes().find((quote) => quoteId(quote) === state.selectedQuoteId) : null;
  }

  function findClient(clientId) {
    return clients().find((client) => client.id === clientId) || null;
  }

  function findProperty(propertyId, clientId) {
    const scopedClients = clientId ? clients().filter((client) => client.id === clientId) : clients();
    for (const client of scopedClients) {
      const property = client.properties?.find((item) => item.id === propertyId);
      if (property) return property;
    }
    return null;
  }

  function findRequest(requestId) {
    return requests().find((request) => request.id === requestId) || null;
  }

  function requestClient(request) {
    return request ? findClient(request.client_id) : null;
  }

  function requestProperty(request) {
    return request ? findProperty(request.property_id, request.client_id) : null;
  }

  function money(value) {
    const number = Number(value) || 0;
    return `£${number.toFixed(2)}`;
  }

  function minutesLabel(value, fallback = "To confirm") {
    const minutes = Number(value);
    if (!Number.isFinite(minutes) || minutes <= 0) return fallback;
    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  function listText(items, fallback = "None set") {
    if (!Array.isArray(items) || !items.length) return fallback;
    return items.map((item) => considerationLabels[item] || item.replace(/_/g, " ")).join(", ");
  }

  function lineList(items) {
    if (Array.isArray(items)) return items.join("\n");
    return String(items || "");
  }

  function parseLines(value) {
    return String(value || "").split(/\n+/).map((item) => item.trim()).filter(Boolean);
  }

  function quoteStatusChip(quote) {
    return chip(labelFrom(quoteStatusLabels, quote.status, "Draft"), quoteStatusTones[quote.status] || "info");
  }

  function itemAmount(item) {
    const qty = Number(item.quantity_or_hours) || 0;
    const rate = Number(item.rate) || 0;
    return Math.round(qty * rate * 100) / 100;
  }

  function recalcItem(item) {
    item.amount = itemAmount(item);
    return item.amount;
  }

  function calculateTotals(quote) {
    const totals = {
      oneOff: 0,
      recurring: 0,
      monthly: 0,
      optional: 0
    };

    for (const item of quote.quote_items || []) {
      if (item.included === false) continue;
      const amount = Number(item.amount ?? itemAmount(item)) || 0;
      if (item.optional || item.type === "optional") {
        totals.optional += amount;
      } else if (item.type === "monthly") {
        totals.monthly += amount;
      } else if (item.type === "recurring") {
        totals.recurring += amount;
      } else {
        totals.oneOff += amount;
      }
    }

    totals.monthlyEstimate = totals.monthly || (totals.recurring ? Math.round(totals.recurring * 4.33 * 100) / 100 : 0);
    return totals;
  }

  function primaryTotalLabel(quote) {
    const totals = calculateTotals(quote);
    if (totals.monthly) return `${money(totals.monthly)} / month`;
    if (totals.recurring) return `${money(totals.recurring)} / visit`;
    return money(totals.oneOff + totals.optional);
  }

  function updateQuoteCompatibility(quote) {
    const client = findClient(quote.client_id);
    const property = findProperty(quote.property_id, quote.client_id);
    quote.number = quoteNumber(quote);
    quote.client = client?.display_name || quote.client || "Client to confirm";
    quote.property = property?.label || property?.address || quote.property || "Property to confirm";
    quote.service = quote.service || (quote.request_id ? requestTypeLabel(findRequest(quote.request_id)) : "Quote draft");
    quote.total = primaryTotalLabel(quote);
    quote.validUntil = quote.valid_until || quote.validUntil || "To confirm";
    quote.tone = quoteStatusTones[quote.status] || "info";
  }

  function requestTypeLabel(request) {
    return labelFrom(requestTypeLabels, request?.request_type, "Other");
  }

  function quoteReadiness(request) {
    return request?.quote_readiness || "missing_scope";
  }

  function quoteReadinessChip(request) {
    const readiness = quoteReadiness(request);
    const tone = readiness === "ready_to_quote" ? "success" : readiness === "missing_scope" ? "danger" : "warning";
    return chip(labelFrom(quoteReadinessLabels, readiness, "Missing scope"), tone);
  }

  function sourceSummary(quote) {
    const request = findRequest(quote.request_id);
    const client = findClient(quote.client_id) || requestClient(request);
    const property = findProperty(quote.property_id, quote.client_id) || requestProperty(request);
    return { request, client, property };
  }

  function quoteAssist(quote) {
    const { request } = sourceSummary(quote);
    if (!request) {
      return {
        ready: false,
        headline: "Blank quote",
        structure: ["Add quote items manually", "Set pricing basis before sending"],
        estimates: ["No request estimates linked"],
        considerations: ["Link a request if this quote came from an enquiry"],
        warning: "No source request is linked yet."
      };
    }

    const ready = quoteReadiness(request) === "ready_to_quote";
    const structure = [];
    if (request.request_type === "commercial_clean" || request.pricing_basis === "monthly_contract") {
      structure.push("Monthly commercial contract");
      structure.push("Optional consumables line if required");
    } else if (request.preferred_cadence && request.preferred_cadence !== "one_off") {
      if (request.initial_clean_required === "yes" || request.initial_clean_required === "to_confirm") structure.push("Initial clean + recurring visit");
      structure.push(`${labelFrom(cadenceLabels, request.preferred_cadence, "Recurring")} domestic visit`);
    } else {
      structure.push("One-off service line");
    }

    const estimates = [
      `Initial clean: ${minutesLabel(request.estimated_initial_duration_minutes, "Not estimated yet")}`,
      `Regular visit: ${minutesLabel(request.estimated_regular_duration_minutes, "Not estimated yet")}`,
      `Team: ${request.estimated_team_size || "To confirm"} ${Number(request.estimated_team_size) === 1 ? "cleaner" : "cleaners"}`
    ];

    const considerations = (request.quote_considerations || []).map((item) => considerationLabels[item] || item.replace(/_/g, " "));
    if (request.scope_confidence) considerations.push(labelFrom(scopeConfidenceLabels, request.scope_confidence, "Scope confidence to confirm"));
    if (request.preferred_day && request.preferred_day !== "to_confirm") considerations.push(`${labelFrom(dayLabels, request.preferred_day)} ${labelFrom(timeWindowLabels, request.preferred_time_window, "")}`.trim());

    return {
      ready,
      headline: ready ? "Ready to quote" : "Review request before sending",
      structure,
      estimates,
      considerations: considerations.length ? considerations : ["No extra considerations yet"],
      warning: ready ? "" : "This request is not ready to quote yet. Review the request before sending."
    };
  }

  function render() {
    quotes().forEach(updateQuoteCompatibility);
    return `<div data-quotes-root>${renderInner()}</div>`;
  }

  function renderInner() {
    const quote = selectedQuote();
    return quote ? renderDetail(quote) : renderList();
  }

  function renderList() {
    const rows = quotes().map((quote) => {
      const id = quoteId(quote);
      return `
        <tr class="quote-row" data-quote-id="${escapeHtml(id)}" tabindex="0">
          <td><strong>${escapeHtml(quoteNumber(quote))}</strong></td>
          <td>${escapeHtml(quote.client)}</td>
          <td><strong>${escapeHtml(quote.service)}</strong><br><span class="muted">${escapeHtml(quote.property)}</span></td>
          <td>${escapeHtml(quote.total)}</td>
          <td>${quoteStatusChip(quote)}</td>
          <td>${escapeHtml(quote.validUntil)}</td>
        </tr>
      `;
    }).join("");

    const readyRequests = requests().filter((request) => request.quote_readiness === "ready_to_quote");

    return `
      <div class="page-head">
        <div>
          <h1>Quotes</h1>
          <p>Build, send, and track cleaning quotes.</p>
        </div>
        ${button("New quote", "open-new-quote", "primary")}
      </div>
      <section class="grid-detail quotes-list-layout">
        <article class="panel">
          <div class="filters">
            <span class="inputish">Search quotes</span>
            <span class="selectish">All statuses</span>
            <span class="selectish">This month</span>
          </div>
          <table>
            <thead><tr><th>Quote</th><th>Client</th><th>Service / property</th><th>Total</th><th>Status</th><th>Valid until</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </article>
        <aside class="panel pad">
          <h2>Quote builder preview</h2>
          <p class="muted" style="margin-top:8px">Draft commercial offers from request context, editable scope items, totals, and client-facing wording.</p>
          <div class="stack" style="margin-top:14px">
            <div class="field-row"><span>Ready requests</span><strong>${readyRequests.length}</strong></div>
            <div class="field-row"><span>Draft quotes</span><strong>${quotes().filter((quote) => quote.status === "draft").length}</strong></div>
            <div class="field-row"><span>Ready to send</span><strong>${quotes().filter((quote) => quote.status === "ready_to_send").length}</strong></div>
            ${button("Start from request", "open-new-quote", "primary")}
          </div>
        </aside>
      </section>
      ${state.newQuoteOpen ? renderNewQuoteModal() : ""}
    `;
  }

  function renderDetail(quote) {
    updateQuoteCompatibility(quote);
    const { request, client, property } = sourceSummary(quote);
    const assist = quoteAssist(quote);
    const totals = calculateTotals(quote);

    return `
      <div class="request-breadcrumb">
        <button class="link-button" type="button" data-quote-action="back-to-list">PandaZen</button>
        <span>/</span>
        <button class="link-button" type="button" data-quote-action="back-to-list">Quotes</button>
        <span>/</span>
        <strong>${escapeHtml(quoteNumber(quote))}</strong>
      </div>

      <div class="page-head">
        <div>
          <div class="request-title-chips">${quoteStatusChip(quote)} ${request ? quoteReadinessChip(request) : chip("No request linked", "warning")}</div>
          <h1>${escapeHtml(quoteNumber(quote))} - ${escapeHtml(quote.service || "Quote draft")}</h1>
          <p>${escapeHtml(client?.display_name || quote.client || "Client to confirm")} - ${escapeHtml(property?.address || quote.property || "Property to confirm")}</p>
        </div>
        <div class="button-row">
          ${button("Save draft", "save-draft")}
          ${button("Preview as client", "preview-client")}
          ${button("Mark ready", "mark-ready", "primary")}
          ${button("More actions", "more-actions")}
        </div>
      </div>

      <section class="quote-builder-grid">
        <div class="stack">
          ${renderSourceRequestCard(quote, request, client, property)}
          ${renderQuoteAssistCard(assist)}
          ${renderQuoteItemsTable(quote)}
          ${renderClientTextCard(quote)}
        </div>
        <aside class="stack">
          ${renderSummaryPanel(quote, request, client, property, totals)}
        </aside>
      </section>
      ${state.previewQuoteId === quoteId(quote) ? renderPreviewModal(quote) : ""}
      ${state.newQuoteOpen ? renderNewQuoteModal() : ""}
    `;
  }

  function renderSourceRequestCard(quote, request, client, property) {
    if (!request) {
      return `
        <article class="panel pad">
          <div class="panel-head flush"><h2>Source request</h2>${chip("Not linked", "warning")}</div>
          <p class="muted" style="margin-top:10px">This draft is not linked to a request. Add quote items manually or start from a ready request.</p>
        </article>
      `;
    }

    return `
      <article class="panel pad">
        <div class="panel-head flush"><h2>Source request</h2>${chip(request.number || "Request", "info")}</div>
        <div class="request-summary-grid quote-source-grid" style="margin-top:12px">
          <div class="field-row"><span>Client</span><strong>${escapeHtml(client?.display_name || request.client || "Client")}</strong></div>
          <div class="field-row"><span>Property</span><strong>${escapeHtml(property?.address || request.property || "Property")}</strong></div>
          <div class="field-row"><span>Service</span><strong>${escapeHtml(requestTypeLabel(request))}</strong></div>
          <div class="field-row"><span>Frequency</span><strong>${escapeHtml(labelFrom(cadenceLabels, request.preferred_cadence, "To confirm"))}</strong></div>
          <div class="field-row"><span>Preferred time</span><strong>${escapeHtml(`${labelFrom(dayLabels, request.preferred_day, "To confirm")} / ${labelFrom(timeWindowLabels, request.preferred_time_window, "To confirm")}`)}</strong></div>
          <div class="field-row"><span>Property type</span><strong>${escapeHtml(labelFrom(propertyTypeLabels, property?.property_type || request.property_type, "To confirm"))}</strong></div>
          <div class="field-row"><span>Bedrooms / bathrooms</span><strong>${escapeHtml(`${request.bedrooms || property?.bedrooms || "?"} / ${request.bathrooms || property?.bathrooms || "?"}`)}</strong></div>
          <div class="field-row"><span>Products</span><strong>${escapeHtml(labelFrom(supplyLabels, request.cleaning_products, "To confirm"))}</strong></div>
          <div class="field-row"><span>Vacuum / mop</span><strong>${escapeHtml(`${labelFrom(equipmentLabels, request.vacuum_hoover, "To confirm")} / ${labelFrom(equipmentLabels, request.mop, "To confirm")}`)}</strong></div>
          <div class="field-row"><span>Quote readiness</span><strong>${escapeHtml(labelFrom(quoteReadinessLabels, request.quote_readiness, "Missing scope"))}</strong></div>
          <div class="field-row"><span>Scope confidence</span><strong>${escapeHtml(labelFrom(scopeConfidenceLabels, request.scope_confidence, "To confirm"))}</strong></div>
          <div class="request-note-block wide">
            <span class="muted">Main priorities</span>
            <strong>${escapeHtml(listText(request.main_priorities, "No priorities set"))}</strong>
          </div>
          <div class="request-note-block wide">
            <span class="muted">Internal scoping note</span>
            <strong>${escapeHtml(request.short_scoping_note || request.service_summary || "No internal scoping note yet.")}</strong>
          </div>
        </div>
      </article>
    `;
  }

  function renderQuoteAssistCard(assist) {
    return `
      <article class="panel pad quote-assist">
        <div class="panel-head flush"><h2>Quote Assist</h2>${chip(assist.headline, assist.ready ? "success" : "warning")}</div>
        ${assist.warning ? `<p class="notice warning">${escapeHtml(assist.warning)}</p>` : ""}
        <div class="quote-assist-grid">
          <div class="side-section">
            <h2>Suggested structure</h2>
            <ul class="request-checklist">${assist.structure.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div class="side-section">
            <h2>Suggested estimates</h2>
            <ul class="request-checklist">${assist.estimates.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div class="side-section wide">
            <h2>Considerations</h2>
            <div class="button-row" style="justify-content:flex-start">${assist.considerations.map((item) => chip(item, "info")).join("")}</div>
          </div>
        </div>
      </article>
    `;
  }

  function renderQuoteItemsTable(quote) {
    const rows = (quote.quote_items || []).map((item) => `
      <tr data-quote-item-id="${escapeHtml(item.item_id)}">
        <td>
          <label class="schedule-check compact"><input type="checkbox" data-quote-item-field="included"${item.included !== false ? " checked" : ""}><span></span></label>
        </td>
        <td><input class="quote-input" data-quote-item-field="name" value="${escapeHtml(item.name)}"></td>
        <td><textarea class="quote-input quote-textarea" data-quote-item-field="description">${escapeHtml(item.description)}</textarea></td>
        <td><input class="quote-input mini" type="number" min="0" step="0.25" data-quote-item-field="quantity_or_hours" value="${escapeHtml(item.quantity_or_hours)}"></td>
        <td><input class="quote-input mini" type="number" min="0" step="0.5" data-quote-item-field="rate" value="${escapeHtml(item.rate)}"></td>
        <td><strong>${money(item.amount ?? itemAmount(item))}</strong></td>
        <td><select class="quote-input" data-quote-item-field="type">${optionList(itemTypeLabels, item.type || "one_off")}</select></td>
        <td>
          <label class="schedule-check compact"><input type="checkbox" data-quote-item-field="optional"${item.optional ? " checked" : ""}><span>Yes</span></label>
        </td>
        <td>${button("Remove", `remove-item:${item.item_id}`, "small ghost")}</td>
      </tr>
    `).join("");

    const totals = calculateTotals(quote);

    return `
      <article class="panel quote-items-panel">
        <div class="panel-head">
          <h2>Quote items</h2>
          ${button("Add row", "add-item", "small primary")}
        </div>
        <div class="quote-table-scroll">
          <table class="quote-items-table">
            <thead>
              <tr><th>Use</th><th>Item</th><th>Description</th><th>Qty / hours</th><th>Rate</th><th>Amount</th><th>Type</th><th>Optional</th><th>Actions</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="quote-totals-footer">
          <div><span>One-off / initial</span><strong>${money(totals.oneOff)}</strong></div>
          <div><span>Recurring visit</span><strong>${money(totals.recurring)}</strong></div>
          <div><span>Monthly estimate</span><strong>${money(totals.monthlyEstimate)}</strong></div>
          <div><span>Optional extras</span><strong>${money(totals.optional)}</strong></div>
        </div>
      </article>
    `;
  }

  function renderClientTextCard(quote) {
    return `
      <article class="panel pad">
        <div class="panel-head flush"><h2>Client-facing quote text</h2>${chip("Internal notes stay separate", "info")}</div>
        <div class="request-form-grid" style="margin-top:12px">
          <label class="client-field wide">Quote summary
            <textarea rows="3" data-quote-field="client_facing_summary">${escapeHtml(quote.client_facing_summary || "")}</textarea>
          </label>
          <label class="client-field">Included scope
            <textarea rows="6" data-quote-field="included_scope">${escapeHtml(lineList(quote.included_scope))}</textarea>
          </label>
          <label class="client-field">Exclusions / not included
            <textarea rows="6" data-quote-field="exclusions">${escapeHtml(lineList(quote.exclusions))}</textarea>
          </label>
          <label class="client-field">Special notes for client
            <textarea rows="4" data-quote-field="special_notes">${escapeHtml(quote.special_notes || "")}</textarea>
          </label>
          <label class="client-field">Terms / assumptions
            <textarea rows="4" data-quote-field="terms">${escapeHtml(quote.terms || "")}</textarea>
          </label>
          <label class="client-field">Valid until
            <input type="text" data-quote-field="valid_until" value="${escapeHtml(quote.valid_until || "")}">
          </label>
          <label class="client-field">Internal notes
            <textarea rows="4" data-quote-field="internal_notes">${escapeHtml(quote.internal_notes || "")}</textarea>
          </label>
        </div>
      </article>
    `;
  }

  function renderSummaryPanel(quote, request, client, property, totals) {
    return `
      <article class="panel pad quote-summary-panel">
        <h2>Quote summary</h2>
        <div class="stack" style="margin-top:12px">
          <div class="field-row"><span>Status</span><strong>${escapeHtml(labelFrom(quoteStatusLabels, quote.status, "Draft"))}</strong></div>
          <div class="field-row"><span>Client</span><strong>${escapeHtml(client?.display_name || quote.client || "To confirm")}</strong></div>
          <div class="field-row"><span>Property</span><strong>${escapeHtml(property?.label || property?.address || quote.property || "To confirm")}</strong></div>
          <div class="field-row"><span>Linked request</span><strong>${escapeHtml(request?.number || "Not linked")}</strong></div>
          <div class="field-row"><span>Pricing basis</span><strong>${escapeHtml(labelFrom(pricingBasisLabels, quote.pricing_basis || request?.pricing_basis, "To confirm"))}</strong></div>
          <div class="field-row"><span>Valid until</span><strong>${escapeHtml(quote.valid_until || "To confirm")}</strong></div>
        </div>
        <div class="quote-side-totals">
          <div><span>One-off / initial</span><strong>${money(totals.oneOff)}</strong></div>
          <div><span>Recurring visit</span><strong>${money(totals.recurring)}</strong></div>
          <div><span>Monthly estimate</span><strong>${money(totals.monthlyEstimate)}</strong></div>
          <div><span>Optional extras</span><strong>${money(totals.optional)}</strong></div>
        </div>
        <div class="stack" style="margin-top:14px">
          ${button("Save draft", "save-draft", "primary")}
          ${button("Preview as client", "preview-client")}
          ${button("Mark ready to send", "mark-ready")}
          ${button("Convert to job", "convert-to-job")}
          ${button("More actions", "more-actions")}
        </div>
      </article>
    `;
  }

  function renderPreviewModal(quote) {
    const { client, property } = sourceSummary(quote);
    const totals = calculateTotals(quote);

    let totalsHtml = "";
    if (totals.oneOff) totalsHtml += `<div><span>Initial / one-off clean</span><strong>${money(totals.oneOff)}</strong></div>`;
    if (totals.recurring) totalsHtml += `<div><span>Recurring clean</span><strong>${money(totals.recurring)} per visit</strong></div>`;
    if (totals.monthly) totalsHtml += `<div><span>Monthly estimate</span><strong>${money(totals.monthly)} per month</strong></div>`;
    if (totals.optional) totalsHtml += `<div><span>Optional extras</span><strong>${money(totals.optional)}</strong></div>`;

    return `
      <div class="quote-modal-backdrop" data-quote-action="close-preview">
        <article class="quote-modal quote-preview" role="dialog" aria-modal="true" aria-label="Client quote preview" data-quote-modal>
          <div class="panel-head flush">
            <div>
              <p class="eyebrow">Client preview</p>
              <h2>${escapeHtml(quoteNumber(quote))}</h2>
            </div>
            ${iconButton("Close preview", "close-preview")}
          </div>
          <div class="quote-preview-body">
            <h1>${escapeHtml(client?.display_name || quote.client || "Client")}</h1>
            <p class="muted">${escapeHtml(property?.address || quote.property || "Property")}</p>
            <p>${escapeHtml(quote.client_facing_summary || "Quote summary to confirm.")}</p>
            <h3>Included</h3>
            <ul>${parseLines(lineList(quote.included_scope)).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            <h3>Not included</h3>
            <ul>${parseLines(lineList(quote.exclusions)).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            <div class="quote-side-totals" style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border)">
              ${totalsHtml}
              <div><span>Valid until</span><strong>${escapeHtml(quote.valid_until || "To confirm")}</strong></div>
            </div>
            <p class="muted" style="margin-top: 12px;">${escapeHtml(quote.terms || "")}</p>
            <div style="margin-top: 24px;">
              <button class="button primary" style="width: 100%; justify-content: center; font-size: 14px; padding: 10px;">Reply to confirm acceptance or ask any questions.</button>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function renderNewQuoteModal() {
    const readyRequests = requests().filter((request) => request.quote_readiness === "ready_to_quote");
    const options = readyRequests.map((request) => {
      const client = requestClient(request);
      return `<option value="${escapeHtml(request.id)}"${request.id === state.newQuoteRequestId ? " selected" : ""}>${escapeHtml(`${request.number} - ${client?.display_name || request.client || "Client"} - ${requestTypeLabel(request)}`)}</option>`;
    }).join("");

    return `
      <div class="quote-modal-backdrop" data-quote-action="close-new-quote">
        <article class="quote-modal" role="dialog" aria-modal="true" aria-label="New quote" data-quote-modal>
          <div class="panel-head flush">
            <div>
              <p class="eyebrow">New quote</p>
              <h2>Start a quote draft</h2>
            </div>
            ${iconButton("Close new quote", "close-new-quote")}
          </div>
          <div class="request-form-section">
            <label class="client-field wide">Ready request
              <select data-new-quote-request>
                <option value="">Choose a ready request</option>
                ${options}
              </select>
            </label>
            <p class="muted">For v0, request-led quoting keeps the commercial offer separate from intake and scoping.</p>
            <div class="button-row">
              ${button("Create from request", "create-from-selected-request", "primary")}
              ${button("Open blank draft", "create-blank-quote")}
              ${button("Cancel", "close-new-quote", "ghost")}
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function refresh() {
    quotes().forEach(updateQuoteCompatibility);
    const root = document.querySelector("[data-quotes-root]");
    if (root) root.innerHTML = renderInner();
  }

  function newItem(overrides = {}) {
    return {
      item_id: `quote-item-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      name: "New quote item",
      description: "Client-facing description",
      quantity_or_hours: 1,
      rate: 0,
      amount: 0,
      type: "one_off",
      optional: false,
      included: true,
      ...overrides
    };
  }

  function buildItemsFromRequest(request) {
    const regularHours = Math.max(1, Math.round((Number(request.estimated_regular_duration_minutes) || 180) / 60 * 4) / 4);
    const initialHours = Math.max(1, Math.round((Number(request.estimated_initial_duration_minutes) || Number(request.estimated_regular_duration_minutes) || 300) / 60 * 4) / 4);
    const hourlyRate = request.request_type === "commercial_clean" ? 35 : 30;

    if (request.request_type === "commercial_clean" || request.pricing_basis === "monthly_contract") {
      return [
        newItem({
          name: "Commercial cleaning contract",
          description: "Monthly commercial cleaning covering washrooms, common areas, touchpoints, and agreed office zones.",
          quantity_or_hours: 1,
          rate: 650,
          amount: 650,
          type: "monthly"
        }),
        newItem({
          name: "Commercial consumables option",
          description: "Optional monthly allowance for reviewed commercial washroom consumables.",
          quantity_or_hours: 1,
          rate: 125,
          amount: 125,
          type: "optional",
          optional: true
        })
      ];
    }

    if (request.preferred_cadence && request.preferred_cadence !== "one_off" && request.preferred_cadence !== "to_confirm") {
      const items = [];
      if (request.initial_clean_required === "yes" || request.initial_clean_required === "to_confirm") {
        items.push(newItem({
          name: "Initial deep clean",
          description: "First clean to bring the home up to regular maintenance standard.",
          quantity_or_hours: initialHours,
          rate: hourlyRate,
          amount: initialHours * hourlyRate,
          type: "one_off"
        }));
      }
      items.push(newItem({
        name: `${labelFrom(cadenceLabels, request.preferred_cadence, "Recurring")} domestic clean`,
        description: "Regular visit covering agreed priority areas.",
        quantity_or_hours: regularHours,
        rate: hourlyRate,
        amount: regularHours * hourlyRate,
        type: "recurring"
      }));
      if ((request.main_priorities || []).includes("oven")) {
        items.push(newItem({
          name: "Oven clean add-on",
          description: "Optional oven clean add-on.",
          quantity_or_hours: 1,
          rate: 45,
          amount: 45,
          type: "optional",
          optional: true
        }));
      }
      return items;
    }

    return [
      newItem({
        name: requestTypeLabel(request),
        description: "One-off cleaning service based on the request scope.",
        quantity_or_hours: initialHours,
        rate: hourlyRate,
        amount: initialHours * hourlyRate,
        type: "one_off"
      })
    ];
  }

  function createQuoteFromRequest(requestId) {
    const request = findRequest(requestId);
    if (!request) return null;

    const existing = quotes().find((quote) => quote.request_id === requestId);
    if (existing) {
      state.selectedQuoteId = quoteId(existing);
      state.newQuoteOpen = false;
      return existing;
    }

    const client = requestClient(request);
    const property = requestProperty(request);
    const nextNumber = `Q-${2090 + quotes().length}`;
    const quote = {
      quote_id: `quote-${Date.now()}`,
      id: `quote-${Date.now()}`,
      quote_number: nextNumber,
      number: nextNumber,
      status: "draft",
      client_id: request.client_id,
      property_id: request.property_id,
      request_id: request.id,
      pricing_basis: request.pricing_basis || "to_confirm",
      valid_until: "To confirm",
      client: client?.display_name || request.client || "Client",
      property: property?.label || property?.address || request.property || "Property",
      service: requestTypeLabel(request),
      quote_items: buildItemsFromRequest(request),
      client_facing_summary: `${requestTypeLabel(request)} for ${property?.label || request.property || "the property"}, based on the request details provided.`,
      included_scope: ["Agreed priority areas", "General cleaning within quoted time", "Products and equipment as confirmed"],
      exclusions: ["Extra specialist tasks unless listed", "Heavy descaling beyond agreed scope", "Waste removal"],
      special_notes: request.preferred_day && request.preferred_day !== "to_confirm" ? `${labelFrom(dayLabels, request.preferred_day)} ${labelFrom(timeWindowLabels, request.preferred_time_window, "")}`.trim() : "",
      terms: "Quote is based on current request information and may be updated if scope changes.",
      internal_notes: request.short_scoping_note || "",
      created_at: "2026-06-03",
      updated_at: "2026-06-03"
    };
    quotes().unshift(quote);
    updateQuoteCompatibility(quote);
    state.selectedQuoteId = quoteId(quote);
    state.newQuoteOpen = false;
    return quote;
  }

  function createBlankQuote() {
    const client = clients()[0];
    const property = client?.properties?.[0];
    const quote = {
      quote_id: `quote-${Date.now()}`,
      id: `quote-${Date.now()}`,
      quote_number: `Q-${2090 + quotes().length}`,
      number: `Q-${2090 + quotes().length}`,
      status: "draft",
      client_id: client?.id || "",
      property_id: property?.id || "",
      request_id: "",
      pricing_basis: "to_confirm",
      valid_until: "To confirm",
      quote_items: [newItem()],
      client_facing_summary: "",
      included_scope: [],
      exclusions: [],
      special_notes: "",
      terms: "",
      internal_notes: ""
    };
    quotes().unshift(quote);
    updateQuoteCompatibility(quote);
    state.selectedQuoteId = quoteId(quote);
    state.newQuoteOpen = false;
    return quote;
  }

  function saveQuoteField(target) {
    const quote = selectedQuote();
    if (!quote) return;
    const field = target.dataset.quoteField;
    if (!field) return;
    if (field === "included_scope" || field === "exclusions") quote[field] = parseLines(target.value);
    else quote[field] = target.value;
    quote.updated_at = "2026-06-03";
    updateQuoteCompatibility(quote);
  }

  function saveQuoteItemField(target) {
    const quote = selectedQuote();
    if (!quote) return;
    const row = target.closest("[data-quote-item-id]");
    const field = target.dataset.quoteItemField;
    const item = quote.quote_items?.find((entry) => entry.item_id === row?.dataset.quoteItemId);
    if (!item || !field) return;
    if (field === "included" || field === "optional") item[field] = target.checked;
    else if (field === "quantity_or_hours" || field === "rate") item[field] = Number(target.value) || 0;
    else item[field] = target.value;
    recalcItem(item);
    quote.updated_at = "2026-06-03";
    updateQuoteCompatibility(quote);
    refresh();
  }

  function handleClick(event) {
    const row = event.target.closest("[data-quote-id]");
    if (row) {
      event.preventDefault();
      event.stopPropagation();
      state.selectedQuoteId = row.dataset.quoteId;
      refresh();
      return true;
    }

    if (event.target.closest("[data-quote-modal]") && !event.target.closest("[data-quote-action]")) return false;

    const target = event.target.closest("[data-quote-action]");
    if (!target) return false;
    event.preventDefault();
    event.stopPropagation();

    const action = target.dataset.quoteAction;
    const quote = selectedQuote();

    if (action === "back-to-list") {
      state.selectedQuoteId = null;
      state.previewQuoteId = null;
      state.newQuoteOpen = false;
      refresh();
      return true;
    }
    if (action === "open-new-quote") {
      state.newQuoteOpen = true;
      refresh();
      return true;
    }
    if (action === "close-new-quote") {
      state.newQuoteOpen = false;
      refresh();
      return true;
    }
    if (action === "create-from-selected-request") {
      const requestId = state.newQuoteRequestId || document.querySelector("[data-new-quote-request]")?.value;
      const created = createQuoteFromRequest(requestId);
      toast(created ? `Draft opened for ${quoteNumber(created)}.` : "Choose a ready request first.");
      refresh();
      return true;
    }
    if (action === "create-blank-quote") {
      const created = createBlankQuote();
      toast(`Blank draft opened for ${quoteNumber(created)}.`);
      refresh();
      return true;
    }
    if (action === "add-item" && quote) {
      quote.quote_items = quote.quote_items || [];
      quote.quote_items.push(newItem());
      toast("Quote item added.");
      refresh();
      return true;
    }
    if (action.startsWith("remove-item:") && quote) {
      const itemId = action.split(":")[1];
      quote.quote_items = (quote.quote_items || []).filter((item) => item.item_id !== itemId);
      toast("Quote item removed.");
      refresh();
      return true;
    }
    if (action === "preview-client" && quote) {
      state.previewQuoteId = quoteId(quote);
      refresh();
      return true;
    }
    if (action === "close-preview") {
      state.previewQuoteId = null;
      refresh();
      return true;
    }
    if (action === "mark-ready" && quote) {
      quote.status = "ready_to_send";
      updateQuoteCompatibility(quote);
      toast(`${quoteNumber(quote)} marked ready to send.`);
      refresh();
      return true;
    }
    if (action === "save-draft" && quote) {
      quote.status = quote.status === "ready_to_send" ? quote.status : "draft";
      updateQuoteCompatibility(quote);
      toast(`${quoteNumber(quote)} saved as draft.`);
      refresh();
      return true;
    }
    if (action === "convert-to-job") {
      toast("Convert to job is mocked for this prototype.");
      return true;
    }
    if (action === "more-actions") {
      toast("Quote actions are mocked for this prototype.");
      return true;
    }

    return false;
  }

  function handleChange(event) {
    const target = event.target;
    if (target.matches("[data-new-quote-request]")) {
      state.newQuoteRequestId = target.value;
      return;
    }
    if (target.matches("[data-quote-field]")) {
      saveQuoteField(target);
      return;
    }
    if (target.matches("[data-quote-item-field]")) {
      saveQuoteItemField(target);
    }
  }

  function openFromRequest(requestId) {
    return Boolean(createQuoteFromRequest(requestId));
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);

  window.CleanOpsQuotes = {
    render,
    handleClick,
    openFromRequest,
    labels: {
      quoteStatusLabels,
      quoteStatusTones
    }
  };
})();
