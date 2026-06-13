(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedQuoteId: null,
    newQuoteOpen: false,
    previewQuoteId: null,
    documentModalOpen: false,
    a4ViewOpen: false,
    actionsModalOpen: false,
    historyModalOpen: false,
    newQuoteRequestId: "",
    quoteRowMenuId: null
  };

  const quoteStatusLabels = {
    draft: "Draft",
    ready_to_send: "Ready to send",
    sent: "Sent",
    viewed: "Viewed",
    accepted: "Accepted",
    rejected: "Rejected",
    expired: "Expired",
    superseded: "Superseded",
    converted_to_job: "Converted to job"
  };

  const quoteStatusTones = {
    draft: "warning",
    ready_to_send: "info",
    sent: "info",
    viewed: "info",
    accepted: "success",
    declined: "danger",
    rejected: "danger",
    expired: "danger",
    superseded: "warning"
  };

  const documentStatusLabels = {
    not_generated: "Not generated",
    generated: "Generated",
    needs_update: "Needs update"
  };

  const documentStatusTones = {
    not_generated: "warning",
    generated: "success",
    needs_update: "danger"
  };

  function isQuoteLocked(quote) {
    return !["draft", "ready_to_send"].includes(quote.status);
  }

  function markDocumentNeedsUpdate(quote) {
    if (quote && quote.document_status === "generated") {
      quote.document_status = "needs_update";
    }
  }

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
    per_visit: "Per visit",
    monthly: "Monthly"
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
    return quote.quote_ref || quote.quote_number || quote.number || "Draft quote";
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
      } else if (item.type === "per_visit" || item.type === "recurring") {
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
      warning: ready ? "Based on request details and template rules." : "This request is not ready to quote yet. Review the request before sending."
    };
  }

  function render() {
    quotes().forEach(updateQuoteCompatibility);
    return `<div data-quotes-root>${renderInner()}</div>`;
  }

  function renderDocumentModal(quote) {
    return `
      <div class="quote-modal-backdrop" data-quote-action="close-document-modal">
        <article class="quote-modal" role="dialog" aria-modal="true" data-quote-modal>
          <div class="panel-head flush">
            <div>
              <p class="eyebrow">Document generation</p>
              <h2>Generate PDF document</h2>
            </div>
            ${iconButton("Close", "close-document-modal")}
          </div>
          <div class="panel-body stack">
            <p>Generate a formal A4 quote document for <strong>${escapeHtml(quote.client)}</strong>.</p>
            <p>The document will include:</p>
            <ul style="margin-left: 20px; margin-top: 8px;">
              <li>Company branding and contact details</li>
              <li>Client-facing quote summary</li>
              <li>Included scope and exclusions</li>
              <li>Clean pricing table and terms</li>
            </ul>
            <div class="button-row" style="margin-top: 14px;">
              ${button("Generate / update document", `generate-document-id:${quote.id}`, "primary")}
              ${button("Cancel", "close-document-modal")}
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function renderA4DocumentView(quote) {
    const { client, property } = sourceSummary(quote);
    const totals = calculateTotals(quote);

    return `
      <div class="a4-document-backdrop" data-quote-action="close-a4-view">
        <div class="a4-document-actions no-print" style="position: absolute; top: 16px; right: 16px; display: flex; gap: 8px;">
          ${button("Print document", "print-a4-view", "primary")}
          ${button("Close view", "close-a4-view")}
        </div>
        <article class="a4-document" data-quote-modal>
          <header class="a4-header">
            <div>
              <h1 style="font-size: 24px; margin-bottom: 4px;">PandaZen Cleaning</h1>
              <p class="muted">123 Clean Street, London, W1 1AA</p>
              <p class="muted">hello@pandazen.test | 020 7946 0000</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin:0; font-size: 28px; color: var(--text);">QUOTE</h2>
              <p style="margin-top:8px;"><strong>Ref:</strong> ${escapeHtml(quoteNumber(quote))}</p>
              <p><strong>Date:</strong> ${escapeHtml(quote.updated_at || quote.created_at || "Today")}</p>
              <p><strong>Valid until:</strong> ${escapeHtml(quote.valid_until || "To confirm")}</p>
            </div>
          </header>

          <div class="a4-client-block">
            <h3 style="margin-bottom: 4px;">Prepared for:</h3>
            <p><strong>${escapeHtml(client?.display_name || quote.client)}</strong></p>
            <p>${escapeHtml(property?.address || quote.property)}</p>
          </div>

          <section class="a4-section">
            <h3 style="margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">Scope of Work</h3>
            <p>${escapeHtml(quote.client_facing_summary || "")}</p>
          </section>

          <section class="a4-section" style="display:flex; gap: 40px; margin-top: 24px;">
            <div style="flex:1;">
              <h3 style="margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">Included</h3>
              <ul style="margin-left: 20px;">${parseLines(lineList(quote.included_scope)).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
            <div style="flex:1;">
              <h3 style="margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">Not included</h3>
              <ul style="margin-left: 20px;">${parseLines(lineList(quote.exclusions)).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </div>
          </section>

          <section class="a4-section" style="margin-top: 24px;">
            <h3 style="margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">Pricing Details</h3>
            <table class="a4-pricing-table" style="width: 100%; border-collapse: collapse; margin-top: 8px;">
              <thead>
                <tr>
                  <th style="text-align:left; padding: 8px 0; border-bottom: 1px solid var(--border);">Item</th>
                  <th style="text-align:right; padding: 8px 0; border-bottom: 1px solid var(--border);">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${(quote.quote_items || []).filter(i => i.included !== false).map(i => `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid var(--line);">
                      <strong>${escapeHtml(i.name)}</strong>
                      ${i.description ? `<div style="font-size:13px; color:var(--text-muted); margin-top:2px;">${escapeHtml(i.description)}</div>` : ''}
                    </td>
                    <td style="text-align:right; padding: 8px 0; border-bottom: 1px solid var(--line);">${money(i.amount)}</td>
                  </tr>
                `).join("")}
              </tbody>
              <tfoot>
                ${totals.oneOff ? `<tr><td style="text-align:right; padding-top: 12px;"><strong>Initial / one-off clean:</strong></td><td style="text-align:right; padding-top: 12px;"><strong>${money(totals.oneOff)}</strong></td></tr>` : ''}
                ${totals.recurring ? `<tr><td style="text-align:right; padding-top: 6px;"><strong>Recurring clean (per visit):</strong></td><td style="text-align:right; padding-top: 6px;"><strong>${money(totals.recurring)}</strong></td></tr>` : ''}
                ${totals.monthly ? `<tr><td style="text-align:right; padding-top: 6px;"><strong>Monthly estimate:</strong></td><td style="text-align:right; padding-top: 6px;"><strong>${money(totals.monthly)}</strong></td></tr>` : ''}
              </tfoot>
            </table>
          </section>

          <section class="a4-section" style="margin-top: 24px;">
            <h3 style="margin-bottom: 8px; border-bottom: 1px solid var(--border); padding-bottom: 4px;">Assumptions & Terms</h3>
            <p>${escapeHtml(quote.terms || "")}</p>
          </section>

          <footer class="a4-footer" style="margin-top: 40px; padding-top: 16px; border-top: 2px solid var(--border); text-align: center; color: var(--text-muted);">
            <p>Thank you for considering PandaZen Cleaning. To accept this quote or ask any questions, please reply to our email.</p>
          </footer>
        </article>
      </div>
    `;
  }

  function renderInner() {
    return renderDocumentControlPage();
  }

  function documentChip(quote) {
    const status = quote.document_status || "not_generated";
    return chip(documentStatusLabels[status] || "Not generated", documentStatusTones[status] || "warning");
  }

  function quoteKpis(allQuotes) {
    return [
      { label: "Draft quotes", value: String(allQuotes.filter((quote) => quote.status === "draft").length) },
      { label: "Sent / awaiting response", value: String(allQuotes.filter((quote) => ["sent", "viewed"].includes(quote.status)).length) },
      { label: "Accepted this month", value: String(allQuotes.filter((quote) => ["accepted", "converted_to_job"].includes(quote.status)).length) },
      { label: "Expiring soon", value: String(allQuotes.filter((quote) => ["sent", "viewed", "ready_to_send"].includes(quote.status) || quote.document_status === "needs_update").length) }
    ];
  }

  function quoteActionReason(quote) {
    if ((quote.document_status || "not_generated") === "not_generated") return "Document not generated";
    if (quote.document_status === "needs_update") return "Document needs update";
    if (quote.status === "draft") return "Needs completion";
    if (quote.status === "ready_to_send") return "Ready for customer action";
    if (["sent", "viewed"].includes(quote.status)) return `Follow up before ${quote.valid_until || "expiry"}`;
    return "Review quote";
  }

  function renderDocumentQuoteActionsMenu(quote) {
    const isOpen = state.quoteRowMenuId === quote.id;
    const actions = [];
    const editable = ["draft", "ready_to_send"].includes(quote.status);
    const sent = ["sent", "viewed"].includes(quote.status);
    const accepted = ["accepted", "converted_to_job"].includes(quote.status);

    actions.push(`<button type="button" data-quote-action="open-quote:${escapeHtml(quote.id)}">Open editor</button>`);
    actions.push(`<button type="button" data-quote-action="open-document-modal-id:${escapeHtml(quote.id)}">${quote.document_status === "generated" ? "Generate/update document" : "Generate document"}</button>`);
    actions.push(`<button type="button" data-quote-action="open-a4-view-id:${escapeHtml(quote.id)}">Preview</button>`);
    if (quote.status === "draft") actions.push(`<button type="button" data-quote-action="mark-ready:${escapeHtml(quote.id)}">Mark ready to send</button>`);
    if (quote.status === "ready_to_send") actions.push(`<button type="button" data-quote-action="send-quote-id:${escapeHtml(quote.id)}">Send quote</button>`);
    if (sent) {
      actions.push(`<button type="button" data-quote-action="mock:Follow up quote">Follow up</button>`);
      actions.push(`<button type="button" data-quote-action="mark-accepted:${escapeHtml(quote.id)}">Mark accepted</button>`);
      actions.push(`<button type="button" data-quote-action="mark-rejected:${escapeHtml(quote.id)}">Mark rejected</button>`);
      actions.push(`<button type="button" data-quote-action="create-alternative:${escapeHtml(quote.id)}">Revise / create new version</button>`);
    }
    if (accepted && quote.status === "accepted" && !quote.job_id) actions.push(`<button type="button" data-quote-action="convert-to-job:${escapeHtml(quote.id)}">Convert to job</button>`);
    actions.push(`<button type="button" data-quote-action="duplicate-quote:${escapeHtml(quote.id)}">Duplicate</button>`);
    if (!accepted) actions.push(`<button type="button" class="text-danger" data-quote-action="archive-quote:${escapeHtml(quote.id)}">Archive</button>`);
    if (!editable && !sent && !accepted) actions.push(`<button type="button" data-quote-action="restore-quote:${escapeHtml(quote.id)}">Restore</button>`);

    return `
      <div class="row-menu-wrap">
        ${button("Actions v", `toggle-row-menu:${quote.id}`, "small")}
        ${isOpen ? `<div class="client-more-menu job-row-menu invoice-row-menu quote-row-menu">${actions.join("")}</div>` : ""}
      </div>
    `;
  }

  function renderQuoteActionColumn(title, items, renderer) {
    return `
      <article class="panel jobs-action-column">
        <div class="panel-head">
          <h2>${escapeHtml(title)}</h2>
          ${chip(String(items.length), items.length ? "info" : "muted")}
        </div>
        <div class="panel-body jobs-action-list">
          ${items.length ? items.map(renderer).join("") : `<div class="empty mini"><div class="empty-icon">OK</div><div><h3>No items</h3><p class="muted">Nothing needs action here.</p></div></div>`}
        </div>
      </article>
    `;
  }

  function renderDraftActionCard(quote) {
    return `
      <button class="job-action-card" type="button" data-quote-action="open-quote:${escapeHtml(quote.id)}">
        <strong>${escapeHtml(quoteNumber(quote))}</strong>
        <span>${escapeHtml(quote.client)} - ${escapeHtml(quote.property)}</span>
        <span class="muted">${escapeHtml(`${quote.service} - ${quoteActionReason(quote)}`)}</span>
        ${documentChip(quote)}
      </button>
    `;
  }

  function renderReadyActionCard(quote) {
    const action = quote.document_status === "generated" ? `send-quote-id:${quote.id}` : `open-document-modal-id:${quote.id}`;
    return `
      <button class="job-action-card" type="button" data-quote-action="${escapeHtml(action)}">
        <strong>${escapeHtml(quoteNumber(quote))}</strong>
        <span>${escapeHtml(quote.client)} - ${escapeHtml(quote.property)}</span>
        <span class="muted">${escapeHtml(`${quote.total} - ${quoteActionReason(quote)}`)}</span>
        ${quote.document_status === "generated" ? quoteStatusChip(quote) : documentChip(quote)}
      </button>
    `;
  }

  function renderFollowUpActionCard(quote) {
    return `
      <button class="job-action-card" type="button" data-quote-action="open-quote:${escapeHtml(quote.id)}">
        <strong>${escapeHtml(quoteNumber(quote))}</strong>
        <span>${escapeHtml(quote.client)} - ${escapeHtml(quote.property)}</span>
        <span class="muted">${escapeHtml(`Valid until ${quote.valid_until || "to confirm"} - ${quoteActionReason(quote)}`)}</span>
        ${chip("Follow up", "warning")}
      </button>
    `;
  }

  function renderQuoteRegisterSection(title, description, items, tone = "primary") {
    const rows = items.map((quote) => `
      <tr class="quote-row" data-quote-id="${escapeHtml(quote.id)}" tabindex="0" role="button">
        <td><strong>${escapeHtml(quoteNumber(quote))}</strong><br><span class="muted">v${escapeHtml(quote.version || 1)}</span></td>
        <td>${escapeHtml(quote.client)}<br><span class="muted">${escapeHtml(quote.property)}</span></td>
        <td>${escapeHtml(quote.service)}</td>
        <td><strong>${escapeHtml(quote.total)}</strong></td>
        <td>${quoteStatusChip(quote)}</td>
        <td>${documentChip(quote)}</td>
        <td>${escapeHtml(quote.updated_at || quote.created_at || "Not set")}<br><span class="muted">${escapeHtml(quote.valid_until || "Valid date not set")}</span></td>
        <td>${renderDocumentQuoteActionsMenu(quote)}</td>
      </tr>
    `).join("");

    return `
      <article class="panel invoices-register-panel quotes-register-panel${tone === "secondary" ? " secondary-register" : ""}">
        <div class="panel-head">
          <div><h2>${escapeHtml(title)}</h2><p class="muted">${escapeHtml(description)} Search/filter/sort/page-ready.</p></div>
          ${chip(`${items.length} quotes`, tone === "secondary" ? "muted" : "info")}
        </div>
        <div class="filters">
          <span class="inputish">Search quotes</span>
          <span class="selectish">${tone === "secondary" ? "Closed statuses" : "Active statuses"}</span>
          <span class="selectish">Sort: updated / valid</span>
          <span class="selectish">Page size: 25</span>
          <span class="selectish">Prev / Next</span>
        </div>
        <div class="quote-table-scroll">
          <table class="jobs-scheduled-table invoices-register-table quotes-register-table">
            <thead><tr><th>Quote ref</th><th>Client / property</th><th>Scope</th><th>Total</th><th>Status</th><th>Document</th><th>Updated / valid until</th><th>Actions</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="8"><span class="muted">No ${escapeHtml(title.toLowerCase())}.</span></td></tr>`}</tbody>
          </table>
        </div>
      </article>
    `;
  }

  function renderDocumentControlPage() {
    const allQuotes = quotes();
    const closedStatuses = ["accepted", "converted_to_job", "rejected", "expired", "superseded", "archived"];
    const active = allQuotes.filter((quote) => !closedStatuses.includes(quote.status) && (["draft", "ready_to_send", "sent", "viewed"].includes(quote.status) || quote.document_status === "needs_update"));
    const closed = allQuotes.filter((quote) => closedStatuses.includes(quote.status));
    const drafts = active.filter((quote) => quote.status === "draft");
    const ready = active.filter((quote) => quote.status === "ready_to_send" || (quote.status !== "draft" && ["not_generated", "needs_update"].includes(quote.document_status || "not_generated")));
    const followUp = active.filter((quote) => ["sent", "viewed"].includes(quote.status));

    return `
      <div class="page-head">
        <div>
          <div class="title-row"><h1>Quotes</h1></div>
          <p class="muted" style="margin-top:10px">Prepare customer quote documents, track send status, and convert accepted work into jobs.</p>
        </div>
        <div class="page-actions">${button("New quote", "open-new-quote", "primary")}</div>
      </div>
      <section class="grid-4 invoice-kpis quote-kpis">
        ${quoteKpis(allQuotes).map((item) => `
          <article class="metric invoice-kpi-card">
            <div class="invoice-kpi-main">
              <span class="muted">${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
            </div>
          </article>
        `).join("")}
      </section>
      <section class="jobs-action-panel invoice-action-panel quote-action-panel">
        ${renderQuoteActionColumn("Drafts / needs completion", drafts, renderDraftActionCard)}
        ${renderQuoteActionColumn("Ready to send / needs document", ready, renderReadyActionCard)}
        ${renderQuoteActionColumn("Follow-up / expiring", followUp, renderFollowUpActionCard)}
      </section>
      <section class="stack invoices-register-stack quotes-register-stack">
        ${renderQuoteRegisterSection("Active quotes", "Draft, ready-to-send, sent, and needs-update quotes needing live tracking.", active)}
        ${renderQuoteRegisterSection("Closed / archive quotes", "Accepted, rejected, expired, superseded, and archived quotes remain available as history.", closed, "secondary")}
      </section>
      ${state.newQuoteOpen ? renderNewQuoteLauncherModal() : ""}
      ${state.selectedQuoteId ? renderQuoteEditorModal(selectedQuote()) : ""}
      ${state.documentModalId ? renderDocumentModal(quotes().find(q => q.id === state.documentModalId)) : ""}
      ${state.a4ViewId ? renderA4DocumentView(quotes().find(q => q.id === state.a4ViewId)) : ""}
    `;
  }

  function renderRowActionsMenu(quote) {
    const isOpen = state.quoteRowMenuId === quote.id;

    let actions = [];
    if (["draft", "ready_to_send"].includes(quote.status)) {
      actions.push(`<button class="quote-dropdown-item" data-quote-action="open-quote:${quote.id}">Edit draft</button>`);
      if (!quote.document_status || quote.document_status === "not_generated") {
        actions.push(`<button class="quote-dropdown-item" data-quote-action="open-document-modal-id:${quote.id}">Generate doc</button>`);
      } else {
        actions.push(`<button class="quote-dropdown-item" data-quote-action="open-a4-view-id:${quote.id}">Preview doc</button>`);
      }

      if (quote.status === "draft") {
        actions.push(`<button class="quote-dropdown-item" data-quote-action="mark-ready:${quote.id}">Mark ready to send</button>`);
      } else if (quote.status === "ready_to_send") {
        actions.push(`<button class="quote-dropdown-item" data-quote-action="send-quote-id:${quote.id}">Mark sent to customer</button>`);
      }

      actions.push(`<button class="quote-dropdown-item" data-quote-action="duplicate-quote:${quote.id}">Duplicate</button>`);
      actions.push(`<button class="quote-dropdown-item" data-quote-action="create-alternative:${quote.id}">Create alternative</button>`);
      actions.push(`<button class="quote-dropdown-item text-danger" data-quote-action="archive-quote:${quote.id}">Archive draft</button>`);
    } else if (["sent", "viewed"].includes(quote.status)) {
      actions.push(`<button class="quote-dropdown-item" data-quote-action="open-quote:${quote.id}">View / Revise</button>`);
      actions.push(`<button class="quote-dropdown-item" data-quote-action="open-a4-view-id:${quote.id}">Preview doc</button>`);
      actions.push(`<div class="quote-dropdown-divider"></div>`);
      actions.push(`<button class="quote-dropdown-item" data-quote-action="mark-accepted:${quote.id}">Mark accepted</button>`);
      actions.push(`<button class="quote-dropdown-item" data-quote-action="mark-rejected:${quote.id}">Mark rejected</button>`);
      actions.push(`<div class="quote-dropdown-divider"></div>`);
      actions.push(`<button class="quote-dropdown-item" data-quote-action="create-alternative:${quote.id}">Create alternative</button>`);
      actions.push(`<button class="quote-dropdown-item text-danger" data-quote-action="archive-quote:${quote.id}">Archive</button>`);
    } else if (["accepted", "converted_to_job"].includes(quote.status)) {
      actions.push(`<button class="quote-dropdown-item" data-quote-action="open-quote:${quote.id}">View</button>`);
      actions.push(`<button class="quote-dropdown-item" data-quote-action="open-a4-view-id:${quote.id}">Preview doc</button>`);
      if (quote.status === "accepted" && !quote.job_id) {
        actions.push(`<button class="quote-dropdown-item" data-quote-action="convert-to-job:${quote.id}">Convert to job</button>`);
      }
      actions.push(`<button class="quote-dropdown-item" data-quote-action="duplicate-quote:${quote.id}">Duplicate</button>`);
      actions.push(`<button class="quote-dropdown-item text-danger" data-quote-action="archive-quote:${quote.id}">Archive</button>`);
    } else {
      actions.push(`<button class="quote-dropdown-item" data-quote-action="open-quote:${quote.id}">View</button>`);
      actions.push(`<button class="quote-dropdown-item" data-quote-action="open-a4-view-id:${quote.id}">Preview doc</button>`);
      actions.push(`<button class="quote-dropdown-item" data-quote-action="duplicate-quote:${quote.id}">Duplicate</button>`);
      actions.push(`<button class="quote-dropdown-item" data-quote-action="restore-quote:${quote.id}">Restore</button>`);
    }

    return `
      <div style="position: relative;">
        ${button("Actions ▾", `toggle-row-menu:${quote.id}`, "small ghost")}
        ${isOpen ? `
          <div style="position: absolute; right: 0; top: 100%; margin-top: 4px; background: #fff; border: 1px solid var(--line); border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 100; min-width: 160px; padding: 4px 0; text-align: left;">
            ${actions.join("")}
          </div>
        ` : ""}
      </div>
    `;
  }

  function renderList() {
    const allQuotes = quotes();
    const drafts = allQuotes.filter(q => ["draft", "ready_to_send"].includes(q.status));
    const sent = allQuotes.filter(q => ["sent", "viewed"].includes(q.status));
    const accepted = allQuotes.filter(q => ["accepted", "converted_to_job"].includes(q.status));
    const archived = allQuotes.filter(q => ["rejected", "expired", "superseded", "archived"].includes(q.status));

    const rowMenuStyles = `
      <style>
        .quote-dropdown-item { padding: 8px 16px; display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer; font-size: 13px; color: var(--text); }
        .quote-dropdown-item:hover { background: var(--surface); }
        .quote-dropdown-item.text-danger { color: #dc2626; }
        .quote-dropdown-divider { height: 1px; background: var(--border); margin: 4px 0; }
        .quotes-group-table th { padding: 12px 8px; text-align: left; border-bottom: 2px solid var(--border); color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 600; }
        .quotes-group-table td { padding: 12px 8px; border-bottom: 1px solid var(--border); vertical-align: middle; }
      </style>
    `;

    const renderGroup = (title, list) => {
      if (list.length === 0) return "";
      const rows = list.map((quote) => {
        const isSuperseded = quote.status === "superseded" || quote.status === "archived";
        const style = isSuperseded ? "opacity: 0.6;" : "";
        const docLabel = documentStatusLabels[quote.document_status || "not_generated"];
        const docTone = documentStatusTones[quote.document_status || "not_generated"];

        return `
          <tr class="quote-row" tabindex="0" style="${style}">
            <td><strong>${escapeHtml(quoteNumber(quote))}</strong><br><span class="muted" style="font-size:12px;">v${escapeHtml(quote.version || 1)}</span></td>
            <td>${escapeHtml(quote.client)}<br><span class="muted" style="font-size:12px;">${escapeHtml(quote.property)}</span></td>
            <td>${escapeHtml(quote.service)}</td>
            <td><strong>${escapeHtml(quote.total)}</strong></td>
            <td>${quoteStatusChip(quote)}</td>
            <td>${chip(docLabel, docTone)}</td>
            <td>${escapeHtml(quote.valid_until || quote.updated_at || quote.created_at || "")}</td>
            <td style="text-align:right;">
              ${renderRowActionsMenu(quote)}
            </td>
          </tr>
        `;
      }).join("");

      return `
        <div style="margin-bottom: 48px; background: var(--surface); border: 1px solid var(--line); border-top: 3px solid var(--line-strong); border-radius: 8px; box-shadow: var(--shadow);">
          <h3 style="font-size: 15px; margin: 0; padding: 12px 16px; background: var(--surface-soft); border-bottom: 1px solid var(--line); color: var(--text); display: flex; align-items: center; gap: 8px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
            ${escapeHtml(title)}
            <span style="background:var(--bg); color:var(--text); padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; border: 1px solid var(--line);">${list.length}</span>
          </h3>
          <table class="quotes-group-table" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
              <tr>
                <th style="width: 12%;">Quote ref</th>
                <th style="width: 25%;">Client / Property</th>
                <th style="width: 18%;">Scope</th>
                <th style="width: 12%;">Total</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 10%;">Document</th>
                <th style="width: 10%;">Updated / Valid</th>
                <th style="width: 8%; text-align:right;">Actions</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    };

    return `
      <div class="page-head">
        <div>
          <h1>Quotes</h1>
          <p>Quote register and document tracking.</p>
        </div>
        ${button("New quote", "open-new-quote", "primary")}
      </div>
      <section class="grid-detail quotes-list-layout">
        <article class="panel pad" style="grid-column: span 12;">
          <div class="filters" style="margin-bottom: 24px;">
            <span class="inputish">Search quotes</span>
            <span class="selectish">All statuses</span>
            <span class="selectish">This month</span>
          </div>
          ${rowMenuStyles}
          ${renderGroup("Drafts", drafts)}
          ${renderGroup("Sent to customer", sent)}
          ${renderGroup("Accepted / Converted", accepted)}
          ${renderGroup("Archive", archived)}
          ${allQuotes.length === 0 ? `<div style="padding: 40px; text-align: center; color: var(--text-muted);">No quotes found.</div>` : ""}
        </article>
      </section>
      ${state.newQuoteOpen ? renderNewQuoteLauncherModal() : ""}
      ${state.selectedQuoteId ? renderQuoteEditorModal(selectedQuote()) : ""}
      ${state.documentModalId ? renderDocumentModal(quotes().find(q => q.id === state.documentModalId)) : ""}
      ${state.a4ViewId ? renderA4DocumentView(quotes().find(q => q.id === state.a4ViewId)) : ""}
    `;
  }

  function renderQuoteEditorModal(quote) {
    updateQuoteCompatibility(quote);
    const { request, client, property } = sourceSummary(quote);
    const assist = quoteAssist(quote);
    const totals = calculateTotals(quote);
    const locked = isQuoteLocked(quote);
    const dis = locked ? " disabled" : "";

    return `
      <div class="quote-modal-backdrop" data-quote-action="close-editor">
        <div class="quote-editor-modal" role="dialog" aria-modal="true" data-quote-modal style="width: 95vw; height: 95vh; max-width: 1400px; display: flex; flex-direction: column; background: var(--bg); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">

          <header class="panel-head" style="background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 24px; flex-shrink: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="margin: 0; font-size: 20px;">Quote ${escapeHtml(quoteNumber(quote))}</h2>
                <div class="request-title-chips" style="margin-top: 8px;">
                  ${quoteStatusChip(quote)}
                  ${chip("v" + (quote.version || 1), "info")}
                </div>
              </div>
            </div>
          </header>

          <div class="editor-body" style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: 1fr 320px; background: var(--bg);">

            <!-- MAIN DOCUMENT AREA -->
            <div style="padding: 40px; background: #fff; border-right: 1px solid var(--border); overflow-y: auto;">
              ${locked ? `
                <div class="banner warning" style="margin-bottom: 24px;">
                  <div style="font-weight:500; margin-bottom:8px;">This quote has already been used commercially. Create a revision to edit.</div>
                  <div class="button-row">
                    ${button("Create revision", "create-revision", "primary")}
                    ${button("Duplicate option", "duplicate-option")}
                  </div>
                </div>
              ` : ""}

              <!-- DOC HEADER -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
                <div>
                  <h1 style="margin: 0; font-size: 28px;">Quote</h1>
                  <p class="muted" style="margin-top: 4px;">${escapeHtml(quoteNumber(quote))}</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                  <label class="client-field">Quote Date
                    <input type="date" class="quote-input" data-quote-field="created_at" value="${escapeHtml(quote.created_at || "")}"${dis}>
                  </label>
                  <label class="client-field">Valid Until
                    <input type="date" class="quote-input" data-quote-field="valid_until" value="${escapeHtml(quote.valid_until && quote.valid_until !== 'To confirm' ? quote.valid_until : '')}"${dis}>
                  </label>
                </div>
              </div>

              <!-- DOC CLIENT DETAILS -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <label class="client-field">Client
                  <select class="quote-input" data-quote-field="client"${dis}>
                    <option value="">Select a client...</option>
                    ${data.clients.map(c => `<option value="${escapeHtml(c.display_name)}"${quote.client === c.display_name ? " selected" : ""}>${escapeHtml(c.display_name)}</option>`).join("")}
                  </select>
                </label>
                <label class="client-field">Property
                  <select class="quote-input" data-quote-field="property"${dis}>
                    <option value="">Select a property...</option>
                    ${clients().flatMap(c => (c.properties || []).map(p => ({ address: p.address, client_name: c.display_name }))).filter(p => !quote.client || p.client_name === quote.client).map(p => `<option value="${escapeHtml(p.address)}"${quote.property === p.address ? " selected" : ""}>${escapeHtml(p.address)}</option>`).join("")}
                  </select>
                </label>
              </div>

              <!-- DOC ITEMS TABLE -->
              <div style="margin-bottom: 40px;">
                ${renderUnifiedItemsTable(quote, locked)}
              </div>

              <!-- DOC FOOTER & TOTALS -->
              <div style="display: grid; grid-template-columns: 3fr 2fr; gap: 40px;">
                <div class="stack">
                  <label class="client-field wide">Message to client
                    <textarea rows="3" data-quote-field="client_facing_summary"${dis}>${escapeHtml(quote.client_facing_summary || "")}</textarea>
                  </label>
                  <label class="client-field wide">Terms & Conditions
                    <textarea rows="3" data-quote-field="terms"${dis}>${escapeHtml(quote.terms || "")}</textarea>
                  </label>
                </div>
                <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span>One-off / initial</span><strong>${money(totals.oneOff)}</strong></div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span>Recurring visit</span><strong>${money(totals.recurring)}</strong></div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span>Monthly estimate</span><strong>${money(totals.monthly)}</strong></div>
                  <hr style="margin: 16px 0;">
                  <div style="display: flex; justify-content: space-between; font-size: 18px;"><span><strong>Total (excl. recurring)</strong></span><strong>${money(totals.oneOff + totals.optional)}</strong></div>
                </div>
              </div>
            </div>

            <!-- SIDEBAR: INTERNAL CONTEXT -->
            <aside style="padding: 24px; background: var(--bg); overflow-y: auto;">
              <h3 style="margin-bottom: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted);">Request Context</h3>

              ${quote.request_id ? `
                ${renderSourceRequestCard(quote, request, client, property)}
                <div style="margin-top: 16px;"></div>
                ${assist.ready ? "" : renderQuoteAssistCard(assist)}
              ` : `
                <div class="panel pad" style="background: var(--surface); text-align: center; border: 1px dashed var(--border);">
                  <div style="margin-bottom: 8px;">${chip("Not linked", "default")}</div>
                  <p class="muted">Add items manually or start from a ready request.</p>
                </div>
              `}

              <div style="margin-top: 16px;"></div>
              <article class="panel pad" style="background: var(--surface);">
                <label class="client-field wide" style="margin:0;">Internal Notes
                  <textarea rows="4" data-quote-field="internal_notes"${dis}>${escapeHtml(quote.internal_notes || "")}</textarea>
                </label>
              </article>
            </aside>
          </div>

          <!-- STICKY ACTION BAR -->
          <footer style="background: var(--surface); border-top: 1px solid var(--border); padding: 16px 24px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; flex-shrink: 0;">
            <div style="display: flex; justify-content: flex-start;">
              ${button("Close", "close-editor", "ghost")}
            </div>
            <div style="display: flex; justify-content: center;">
              ${!locked ? button("Save draft", "save-draft") : ""}
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 8px;">
              ${button("Preview doc", "open-a4-view", "ghost")}
              ${(!quote.document_status || quote.document_status === "not_generated") ? button("Generate doc", `open-document-modal-id:${quote.id}`, "ghost") : ""}
              ${quote.status === "draft" ? button("Mark ready to send", "mark-ready", "primary") : ""}
              ${quote.status === "ready_to_send" ? button("Mark sent to customer", "send-quote", "primary") : ""}
              ${quote.status === "accepted" && !quote.job_id ? button("Convert to job", "convert-to-job", "primary") : ""}
              ${(quote.status === "converted_to_job" || quote.job_id) ? button("View job", "view-job-mock", "ghost") : ""}
            </div>
          </footer>

        </div>
      </div>
    `;
  }

  function renderUnifiedItemsTable(quote, locked) {
    const dis = locked ? " disabled" : "";
    const catalogueOptions = data.catalogue ? data.catalogue.map(cat => `<option value="${cat.item_id}">${escapeHtml(cat.name)} — ${money(cat.default_rate)}</option>`).join("") : "";

    const rows = (quote.quote_items || []).map((item) => `
      <tr data-quote-item-id="${escapeHtml(item.item_id)}" style="border-bottom: 1px solid var(--border);">
        <td style="padding: 12px 8px;">
          <input class="quote-input" data-quote-item-field="name" value="${escapeHtml(item.name)}"${dis} placeholder="Service or product name" style="font-weight: 500; margin-bottom: 4px;">
          <textarea class="quote-input quote-textarea" data-quote-item-field="description"${dis} rows="1" placeholder="Description">${escapeHtml(item.description)}</textarea>
        </td>
        <td style="padding: 12px 8px; vertical-align: top;"><input class="quote-input mini" type="number" min="0" step="0.25" data-quote-item-field="quantity_or_hours" value="${escapeHtml(item.quantity_or_hours)}"${dis}></td>
        <td style="padding: 12px 8px; vertical-align: top;"><input class="quote-input mini" type="number" min="0" step="0.5" data-quote-item-field="rate" value="${escapeHtml(item.rate)}"${dis}></td>
        <td style="padding: 12px 8px; vertical-align: top;"><strong>${money(item.amount ?? itemAmount(item))}</strong></td>
        <td style="padding: 12px 8px; vertical-align: top;"><select class="quote-input" data-quote-item-field="type"${dis}>${optionList(itemTypeLabels, item.type || "one_off")}</select></td>
        <td style="padding: 12px 8px; vertical-align: top;">
          <label class="schedule-check compact"><input type="checkbox" data-quote-item-field="optional"${item.optional ? " checked" : ""}${dis}><span>Optional</span></label>
        </td>
        <td style="padding: 12px 8px; vertical-align: top;">${!locked ? button("Remove", `remove-item:${item.item_id}`, "small ghost") : ""}</td>
      </tr>
    `).join("");

    return `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid var(--border); text-align: left; color: var(--text-muted); font-size: 13px; text-transform: uppercase;">
            <th style="padding: 8px;">Service / Product</th>
            <th style="padding: 8px; width: 80px;">Qty</th>
            <th style="padding: 8px; width: 100px;">Rate</th>
            <th style="padding: 8px; width: 100px;">Amount</th>
            <th style="padding: 8px; width: 120px;">Billing Type</th>
            <th style="padding: 8px; width: 100px;">Extras</th>
            <th style="padding: 8px; width: 60px;"></th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          ${!locked ? `
            <tr>
              <td colspan="7" style="padding: 16px 8px;">
                <div style="display:flex; gap:8px;">
                  <select class="selectish" data-quote-action="add-catalogue-item" style="max-width:250px;">
                    <option value="">+ Add from catalogue...</option>
                    ${catalogueOptions}
                  </select>
                  ${button("Add blank row", "add-item", "small ghost")}
                </div>
              </td>
            </tr>
          ` : ""}
        </tbody>
      </table>
    `;
  }

  function renderHistoryModal(quote) {
    const groupQuotes = quotes().filter(q => q.quote_group_id === quote.quote_group_id || q.request_id === quote.request_id).sort((a,b) => b.version - a.version);
    return `
      <div class="quote-modal-backdrop" data-quote-action="close-history-modal">
        <article class="quote-modal" role="dialog" aria-modal="true" data-quote-modal>
          <div class="panel-head flush">
            <h2>Quote history</h2>
            ${iconButton("Close", "close-history-modal")}
          </div>
          <div class="panel-body stack">
            <table class="history-table" style="width:100%; margin-top:12px; text-align: left; border-collapse: collapse;">
              <thead><tr style="border-bottom: 1px solid var(--border);"><th style="padding: 8px;">Ref</th><th style="padding: 8px;">Total</th><th style="padding: 8px;">Status</th><th style="padding: 8px;">Action</th></tr></thead>
              <tbody>
                ${groupQuotes.map(q => `
                  <tr style="${q.id === quote.id ? 'background: var(--bg); font-weight: 500;' : ''} border-bottom: 1px solid var(--border);">
                    <td style="padding: 8px;">${escapeHtml(q.quote_ref || q.number)}</td>
                    <td style="padding: 8px;">${escapeHtml(q.total)}</td>
                    <td style="padding: 8px;">${quoteStatusChip(q)}</td>
                    <td style="padding: 8px;">
                      ${q.id !== quote.id ? button("Open", `open-quote:${q.id}`) : "Current"}
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    `;
  }

  function renderNewQuoteLauncherModal() {
    const readyRequests = requests().filter((request) => request.quote_readiness === "ready_to_quote");
    const options = readyRequests.map((request) => {
      const client = requestClient(request);
      return `<option value="${escapeHtml(request.id)}"${request.id === state.newQuoteRequestId ? " selected" : ""}>${escapeHtml(`${request.number} - ${client?.display_name || request.client || "Client"} - ${requestTypeLabel(request)}`)}</option>`;
    }).join("");

    const templateOptions = (data.quoteTemplates || []).map(t => `<option value="${escapeHtml(t.id)}"${t.id === state.newQuoteTemplateId ? " selected" : ""}>${escapeHtml(t.name)}</option>`).join("");

    return `
      <div class="quote-modal-backdrop" data-quote-action="close-new-quote-launcher">
        <article class="quote-modal" role="dialog" aria-modal="true" aria-label="New quote launcher" data-quote-modal style="max-width: 500px;">
          <div class="panel-head flush" style="padding-bottom: 0;">
            <div>
              <p class="eyebrow">New quote</p>
              <h2>Select starting method</h2>
            </div>
            ${iconButton("Close", "close-new-quote-launcher")}
          </div>
          <div class="request-form-section stack" style="gap: 24px; padding-top: 16px;">

            <div style="background: var(--surface); padding: 16px; border-radius: 6px; border: 1px solid var(--border);">
              <h3 style="font-size: 15px; margin-bottom: 8px;">Start from request</h3>
              <p class="muted" style="margin-bottom: 12px;">Link this quote to an existing client enquiry or scoping request.</p>
              <select data-new-quote-request style="margin-bottom: 12px; width: 100%;">
                <option value="">Choose a ready request</option>
                ${options}
              </select>
              <select data-new-quote-template-for-request style="margin-bottom: 12px; width: 100%;">
                <option value="">(Optional) Choose a template to apply</option>
                ${templateOptions}
              </select>
              ${button("Start from request", "create-from-request", "primary")}
            </div>

            <div style="background: var(--surface); padding: 16px; border-radius: 6px; border: 1px solid var(--border);">
              <h3 style="font-size: 15px; margin-bottom: 8px;">Use template</h3>
              <p class="muted" style="margin-bottom: 12px;">Start a manual quote populated with standard items and terms.</p>
              <select data-new-quote-template style="margin-bottom: 12px; width: 100%;">
                <option value="">Choose a template</option>
                ${templateOptions}
              </select>
              ${button("Use template", "create-from-template")}
            </div>

            <div style="background: var(--surface); padding: 16px; border-radius: 6px; border: 1px solid var(--border);">
              <h3 style="font-size: 15px; margin-bottom: 8px;">Blank quote</h3>
              <p class="muted" style="margin-bottom: 12px;">Start completely from scratch with no pre-filled items.</p>
              ${button("Blank quote", "create-blank")}
            </div>

          </div>
        </article>
      </div>
    `;
  }

  function applyTemplate(quote, templateId) {
    if (!templateId || !data.quoteTemplates) return quote;
    const tpl = data.quoteTemplates.find(t => t.id === templateId);
    if (!tpl) return quote;

    quote.client_facing_summary = tpl.client_facing_summary || "";
    quote.included_scope = tpl.included_scope ? tpl.included_scope.split("\n") : [];
    quote.exclusions = tpl.exclusions ? tpl.exclusions.split("\n") : [];
    quote.terms = tpl.terms || "";

    if (tpl.items && data.catalogue) {
      quote.quote_items = tpl.items.map(ti => {
        const cat = data.catalogue.find(c => c.item_id === ti.catalogue_id);
        if (!cat) return null;
        return {
          item_id: `qi-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
          catalogue_id: cat.item_id,
          name: cat.name,
          description: cat.default_description,
          quantity_or_hours: ti.quantity_or_hours || 1,
          rate: cat.default_rate,
          amount: (cat.default_rate * (ti.quantity_or_hours || 1)),
          type: cat.default_pricing_type,
          included: ti.included,
          optional: ti.optional
        };
      }).filter(Boolean);
    }
    return quote;
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
        <div class="panel-head flush" style="margin-bottom: 8px;"><h2>Source request</h2>${chip(request.number || "Request", "info")}</div>
        <p class="muted" style="font-size: 13px; margin-bottom: 16px;">This provides internal context. Details are not visible to the customer unless added to the quote scope.</p>
        <div class="stack" style="gap:8px;">
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Client</span><strong>${escapeHtml(client?.display_name || request.client || "Client")}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Property</span><strong>${escapeHtml(property?.address || request.property || "Property")}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Service</span><strong>${escapeHtml(requestTypeLabel(request))}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Frequency</span><strong>${escapeHtml(labelFrom(cadenceLabels, request.preferred_cadence, "To confirm"))}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Preferred time</span><strong>${escapeHtml(`${labelFrom(dayLabels, request.preferred_day, "To confirm")} / ${labelFrom(timeWindowLabels, request.preferred_time_window, "To confirm")}`)}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Property type</span><strong>${escapeHtml(labelFrom(propertyTypeLabels, property?.property_type || request.property_type, "To confirm"))}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Bedrooms / bathrooms</span><strong>${escapeHtml(`${request.bedrooms || property?.bedrooms || "?"} / ${request.bathrooms || property?.bathrooms || "?"}`)}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Products</span><strong>${escapeHtml(labelFrom(supplyLabels, request.cleaning_products, "To confirm"))}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Vacuum / mop</span><strong>${escapeHtml(`${labelFrom(equipmentLabels, request.vacuum_hoover, "To confirm")} / ${labelFrom(equipmentLabels, request.mop, "To confirm")}`)}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Quote readiness</span><strong>${escapeHtml(labelFrom(quoteReadinessLabels, request.quote_readiness, "Missing scope"))}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px;"><span class="muted" style="font-size:12px; text-transform:uppercase;">Scope confidence</span><strong>${escapeHtml(labelFrom(scopeConfidenceLabels, request.scope_confidence, "To confirm"))}</strong></div>
          <div style="display:flex; flex-direction:column; gap:2px; margin-top:8px; padding-top:8px; border-top:1px dashed var(--border);">
            <span class="muted" style="font-size:12px; text-transform:uppercase;">Main priorities</span>
            <strong>${escapeHtml(listText(request.main_priorities, "No priorities set"))}</strong>
          </div>
          <div style="display:flex; flex-direction:column; gap:2px;">
            <span class="muted" style="font-size:12px; text-transform:uppercase;">Internal scoping note</span>
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
    const locked = isQuoteLocked(quote);
    const dis = locked ? " disabled" : "";
    const rows = (quote.quote_items || []).map((item) => `
      <tr data-quote-item-id="${escapeHtml(item.item_id)}">
        <td>
          <label class="schedule-check compact"><input type="checkbox" data-quote-item-field="included"${item.included !== false ? " checked" : ""}${dis}><span></span></label>
        </td>
        <td><input class="quote-input" data-quote-item-field="name" value="${escapeHtml(item.name)}"${dis}></td>
        <td><textarea class="quote-input quote-textarea" data-quote-item-field="description"${dis}>${escapeHtml(item.description)}</textarea></td>
        <td><input class="quote-input mini" type="number" min="0" step="0.25" data-quote-item-field="quantity_or_hours" value="${escapeHtml(item.quantity_or_hours)}"${dis}></td>
        <td><input class="quote-input mini" type="number" min="0" step="0.5" data-quote-item-field="rate" value="${escapeHtml(item.rate)}"${dis}></td>
        <td><strong>${money(item.amount ?? itemAmount(item))}</strong></td>
        <td><select class="quote-input" data-quote-item-field="type"${dis}>${optionList(itemTypeLabels, item.type || "one_off")}</select></td>
        <td>
          <label class="schedule-check compact"><input type="checkbox" data-quote-item-field="optional"${item.optional ? " checked" : ""}${dis}><span>Yes</span></label>
        </td>
        <td>${!locked ? button("Remove", `remove-item:${item.item_id}`, "small ghost") : ""}</td>
      </tr>
    `).join("");

    const totals = calculateTotals(quote);

    const catalogueOptions = data.catalogue ? data.catalogue.map(cat => `<option value="${cat.item_id}">${escapeHtml(cat.name)} — ${money(cat.default_rate)}</option>`).join("") : "";

    return `
      <article class="panel quote-items-panel">
        <div class="panel-head">
          <h2>Quote items</h2>
          ${!locked ? `
            <div style="display:flex; gap:8px;">
              <select class="selectish" data-quote-action="add-catalogue-item" style="max-width:200px;">
                <option value="">+ Add from catalogue...</option>
                ${catalogueOptions}
              </select>
              ${button("Add blank row", "add-item", "small ghost")}
            </div>
          ` : ""}
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
    const locked = isQuoteLocked(quote);
    const dis = locked ? " disabled" : "";
    return `
      <article class="panel pad">
        <div class="panel-head flush"><h2>Client-facing quote text</h2>${chip("Internal notes stay separate", "info")}</div>
        <div class="request-form-grid" style="margin-top:12px">
          <label class="client-field wide">Quote summary
            <textarea rows="3" data-quote-field="client_facing_summary"${dis}>${escapeHtml(quote.client_facing_summary || "")}</textarea>
          </label>
          <label class="client-field">Included scope
            <textarea rows="6" data-quote-field="included_scope"${dis}>${escapeHtml(lineList(quote.included_scope))}</textarea>
          </label>
          <label class="client-field">Exclusions / not included
            <textarea rows="6" data-quote-field="exclusions"${dis}>${escapeHtml(lineList(quote.exclusions))}</textarea>
          </label>
          <label class="client-field">Special notes for client
            <textarea rows="4" data-quote-field="special_notes"${dis}>${escapeHtml(quote.special_notes || "")}</textarea>
          </label>
          <label class="client-field">Terms / assumptions
            <textarea rows="4" data-quote-field="terms"${dis}>${escapeHtml(quote.terms || "")}</textarea>
          </label>
          <label class="client-field">Valid until
            <input type="text" data-quote-field="valid_until" value="${escapeHtml(quote.valid_until || "")}"${dis}>
          </label>
          <label class="client-field">Internal notes
            <textarea rows="4" data-quote-field="internal_notes"${dis}>${escapeHtml(quote.internal_notes || "")}</textarea>
          </label>
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
    const nextGroup = `qg-${Date.now()}`;
    const nextNumber = `Q-${2090 + quotes().length}`;
    const ref = `${nextNumber}/01`;

    let summaryText = `${requestTypeLabel(request)} for ${property?.address || property?.label || request.property || "the property"}`;
    if (request.preferred_cadence && request.preferred_cadence !== "to_confirm") {
      summaryText += `, ${request.preferred_cadence.replace(/_/g, " ")}`;
    }
    if (request.cleaning_notes) {
      summaryText += `, focused on: ${request.cleaning_notes}`;
    } else {
      summaryText += `, based on the request details provided.`;
    }

    let quote = {
      quote_id: `quote-${Date.now()}`,
      id: `quote-${Date.now()}`,
      quote_group_id: nextGroup,
      quote_number_base: nextNumber,
      version: 1,
      quote_ref: ref,
      quote_number: ref,
      number: ref,
      status: "draft",
      document_status: "not_generated",
      client_id: client?.id || "",
      property_id: property?.id || "",
      request_id: requestId,
      pricing_basis: request.pricing_basis || "to_confirm",
      valid_until: "To confirm",
      client: client?.display_name || request.client || "Client",
      property: property?.label || property?.address || request.property || "Property",
      service: requestTypeLabel(request),
      quote_items: buildItemsFromRequest(request),
      client_facing_summary: summaryText,
      included_scope: ["Kitchen surfaces and general clean", "Bathrooms", "Floors (vacuum and mop)", "Dusting of accessible surfaces", "Bedrooms and living areas as time allows"],
      exclusions: ["Inside cupboards and appliances (unless added as extra)", "Heavy descaling beyond agreed scope", "Waste removal", "Moving heavy furniture"],
      special_notes: request.preferred_day && request.preferred_day !== "to_confirm" ? `Preferred time: ${labelFrom(dayLabels, request.preferred_day)} ${labelFrom(timeWindowLabels, request.preferred_time_window, "")}`.trim() : "",
      terms: "Quote is based on information provided and may change if scope or condition changes upon arrival. Preferred day/time subject to availability.",
      internal_notes: request.short_scoping_note || "",
      created_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString().split("T")[0]
    };

    if (state.newQuoteTemplateId) {
      quote = applyTemplate(quote, state.newQuoteTemplateId);
    }

    quotes().unshift(quote);
    updateQuoteCompatibility(quote);
    state.selectedQuoteId = quote.id;
    state.newQuoteOpen = false;
    return quote;
  }

  function createBlankQuote() {
    const client = clients()[0];
    const property = client?.properties?.[0];
    const nextGroup = `qg-${Date.now()}`;
    const nextNumber = `Q-${2090 + quotes().length}`;
    const ref = `${nextNumber}/01`;
    let quote = {
      quote_id: `quote-${Date.now()}`,
      id: `quote-${Date.now()}`,
      quote_group_id: nextGroup,
      quote_number_base: nextNumber,
      version: 1,
      quote_ref: ref,
      quote_number: ref,
      number: ref,
      status: "draft",
      document_status: "not_generated",
      client_id: client?.id || "",
      property_id: property?.id || "",
      request_id: "",
      pricing_basis: "to_confirm",
      valid_until: "To confirm",
      client: client?.display_name || "Client",
      property: property?.label || property?.address || "Property",
      service: "General cleaning",
      quote_items: [newItem()],
      client_facing_summary: "",
      included_scope: [],
      exclusions: [],
      special_notes: "",
      terms: "",
      internal_notes: "",
      created_at: new Date().toISOString().split("T")[0],
      updated_at: new Date().toISOString().split("T")[0]
    };

    if (state.newQuoteTemplateId) {
      quote = applyTemplate(quote, state.newQuoteTemplateId);
    }

    quotes().unshift(quote);
    updateQuoteCompatibility(quote);
    state.selectedQuoteId = quote.id;
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
    markDocumentNeedsUpdate(quote);
    quote.updated_at = new Date().toISOString().split("T")[0];
    updateQuoteCompatibility(quote);
    if (field === "client") quote.property = "";
    if (field === "client" || field === "property" || field === "valid_until") refresh();
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
    markDocumentNeedsUpdate(quote);
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

    const actionTarget = event.target.closest("[data-quote-action]");
    const modalTarget = event.target.closest("[data-quote-modal]");

    // Ignore clicks inside the modal that don't hit a specific action button (they shouldn't trigger the backdrop)
    if (modalTarget && actionTarget && actionTarget.classList.contains("quote-modal-backdrop")) {
      return false;
    }

    if (!actionTarget) {
      if (state.quoteRowMenuId) {
        state.quoteRowMenuId = null;
        refresh();
      }
      return false;
    }
    
    event.preventDefault();
    event.stopPropagation();

    const action = actionTarget.dataset.quoteAction;

    if (!action.startsWith("toggle-row-menu:") && state.quoteRowMenuId) {
      state.quoteRowMenuId = null;
      // We do not refresh immediately here because the action handler will likely call refresh()
    }
    const quote = selectedQuote();

    if (action === "close-editor" || action === "back-to-list") {
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
    if (action === "close-new-quote-launcher") {
      state.newQuoteOpen = false;
      refresh();
      return true;
    }
    if (action === "create-from-request") {
      const requestId = state.newQuoteRequestId || document.querySelector("[data-new-quote-request]")?.value;
      const tplId = document.querySelector("[data-new-quote-template-for-request]")?.value;
      if (tplId) {
        state.newQuoteTemplateId = tplId;
      }
      const created = createQuoteFromRequest(requestId);
      if (created) {
        state.newQuoteOpen = false;
        toast(`Draft opened for ${quoteNumber(created)}.`);
      } else {
        toast("Choose a ready request first.");
      }
      refresh();
      return true;
    }
    if (action === "create-from-template") {
      const templateId = state.newQuoteTemplateId || document.querySelector("[data-new-quote-template]")?.value;
      if (!templateId) {
        toast("Choose a template first.");
        return true;
      }
      state.newQuoteTemplateId = templateId;
      state.newQuoteRequestId = null;
      const created = createBlankQuote();
      state.newQuoteOpen = false;
      toast(`Draft opened using template for ${quoteNumber(created)}.`);
      refresh();
      return true;
    }
    if (action === "create-blank") {
      state.newQuoteTemplateId = null;
      state.newQuoteRequestId = null;
      const created = createBlankQuote();
      state.newQuoteOpen = false;
      toast(`Blank draft opened for ${quoteNumber(created)}.`);
      refresh();
      return true;
    }
    if (action === "add-item" && quote) {
      quote.quote_items = quote.quote_items || [];
      quote.quote_items.push(newItem());
      markDocumentNeedsUpdate(quote);
      toast("Quote item added.");
      refresh();
      return true;
    }
    if (action.startsWith("remove-item:") && quote) {
      const itemId = action.split(":")[1];
      quote.quote_items = (quote.quote_items || []).filter((item) => item.item_id !== itemId);
      markDocumentNeedsUpdate(quote);
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
    if (action === "open-document-modal") {
      state.documentModalOpen = true;
      refresh();
      return true;
    }
    if (action === "close-document-modal") {
      state.documentModalOpen = false;
      state.documentModalId = null;
      refresh();
      return true;
    }
    if (action === "generate-document" && quote) {
      quote.document_status = "generated";
      state.documentModalOpen = false;
      state.documentModalId = null;
      toast(`Document generated for ${quoteNumber(quote)}.`);
      refresh();
      return true;
    }
    if (action.startsWith("generate-document-id:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        q.document_status = "generated";
        state.documentModalOpen = false;
        state.documentModalId = null;
        state.a4ViewId = q.id;
        toast(`Document generated for ${quoteNumber(q)}.`);
        refresh();
      }
      return true;
    }
    if (action === "open-a4-view") {
      state.a4ViewOpen = true;
      refresh();
      return true;
    }
    if (action === "close-a4-view") {
      state.a4ViewOpen = false;
      state.a4ViewId = null;
      refresh();
      return true;
    }
    if (action === "print-a4-view") {
      window.print();
      return true;
    }
    if (action === "mark-ready" && quote) {
      if (quote.document_status !== "generated") {
        toast("Warning: Document is not generated or needs update.");
      }
      quote.status = "ready_to_send";
      updateQuoteCompatibility(quote);
      toast(`${quoteNumber(quote)} marked ready to send.`);
      refresh();
      return true;
    }
    if (action.startsWith("mark-ready:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        q.status = "ready_to_send";
        state.quoteRowMenuId = null;
        toast(`${quoteNumber(q)} marked ready to send.`);
        refresh();
      }
      return true;
    }
    if (action === "send-quote" && quote) {
      quote.status = "sent";
      updateQuoteCompatibility(quote);
      toast(`Quote ${quoteNumber(quote)} marked sent to customer.`);
      refresh();
      return true;
    }
    if (action.startsWith("send-quote-id:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        q.status = "sent";
        state.quoteRowMenuId = null;
        toast(`Quote ${quoteNumber(q)} marked sent to customer.`);
        refresh();
      }
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
    if (action === "convert-to-invoice") {
      toast("Convert to invoice is mocked for this prototype.");
      return true;
    }
    if (action === "more-actions") {
      toast("Quote actions are mocked for this prototype.");
      return true;
    }
    if (action.startsWith("mock:")) {
      toast(`${action.replace("mock:", "")} is mocked for Quotes v0.`);
      refresh();
      return true;
    }
    if (action === "open-actions-modal") {
      state.actionsModalOpen = true;
      refresh();
      return true;
    }
    if (action === "close-actions-modal") {
      state.actionsModalOpen = false;
      refresh();
      return true;
    }
    if (action === "view-history") {
      state.actionsModalOpen = false;
      state.historyModalOpen = true;
      refresh();
      return true;
    }
    if (action === "close-history-modal") {
      state.historyModalOpen = false;
      refresh();
      return true;
    }
    if (action.startsWith("open-quote:")) {
      state.historyModalOpen = false;
      state.selectedQuoteId = action.split(":")[1];
      refresh();
      return true;
    }
    if (action === "create-revision" && quote) {
      const newVersion = quote.version ? quote.version + 1 : 2;
      const ref = `${quote.quote_number_base || quote.quote_number}/${newVersion.toString().padStart(2, "0")}`;

      const newQuote = {
        ...JSON.parse(JSON.stringify(quote)), // deep copy
        quote_id: `quote-${Date.now()}`,
        id: `quote-${Date.now()}`,
        version: newVersion,
        quote_ref: ref,
        quote_number: ref,
        number: ref,
        status: "draft",
        document_status: "not_generated",
        supersedes_quote_id: quote.id,
        created_at: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString().split("T")[0]
      };

      if (["sent", "viewed", "rejected", "expired"].includes(quote.status)) {
        quote.status = "superseded";
      }

      quotes().unshift(newQuote);
      state.selectedQuoteId = newQuote.id;
      state.actionsModalOpen = false;
      toast(`Created revision ${ref}`);
      refresh();
      return true;
    }
    if (action === "duplicate-option" && quote) {
      const nextGroup = `qg-${Date.now()}`;
      const nextNumberBase = `Q-${2090 + quotes().length}`;
      const ref = `${nextNumberBase}/01`;

      const newQuote = {
        ...JSON.parse(JSON.stringify(quote)),
        quote_id: `quote-${Date.now()}`,
        id: `quote-${Date.now()}`,
        quote_group_id: nextGroup,
        quote_number_base: nextNumberBase,
        version: 1,
        quote_ref: ref,
        quote_number: ref,
        number: ref,
        status: "draft",
        document_status: "not_generated",
        supersedes_quote_id: null,
        created_at: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString().split("T")[0]
      };

      quotes().unshift(newQuote);
      state.selectedQuoteId = newQuote.id;
      state.actionsModalOpen = false;
      toast(`Created new option ${ref}`);
      refresh();
      return true;
    }

    if (action.startsWith("toggle-row-menu:")) {
      const qId = action.split(":")[1];
      if (state.quoteRowMenuId === qId) {
        state.quoteRowMenuId = null;
      } else {
        state.quoteRowMenuId = qId;
      }
      refresh();
      return true;
    }
    if (action === "close-row-menu") {
      state.quoteRowMenuId = null;
      refresh();
      return true;
    }
    if (action.startsWith("open-document-modal-id:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        state.documentModalId = qId;
        state.quoteRowMenuId = null;
        refresh();
      }
      return true;
    }
    if (action.startsWith("open-a4-view-id:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        state.a4ViewId = qId;
        state.quoteRowMenuId = null;
        refresh();
      }
      return true;
    }
    if (action.startsWith("duplicate-quote:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        const nextGroup = `qg-${Date.now()}`;
        const nextNumberBase = `Q-${2090 + quotes().length}`;
        const ref = `${nextNumberBase}/01`;

        const newQuote = {
          ...JSON.parse(JSON.stringify(q)),
          quote_id: `quote-${Date.now()}`,
          id: `quote-${Date.now()}`,
          quote_group_id: nextGroup,
          quote_number_base: nextNumberBase,
          version: 1,
          quote_ref: ref,
          quote_number: ref,
          number: ref,
          status: "draft",
          document_status: "not_generated",
          supersedes_quote_id: null,
          created_at: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString().split("T")[0]
        };

        quotes().unshift(newQuote);
        state.quoteRowMenuId = null;
        toast(`Duplicated quote to draft ${ref}`);
        refresh();
      }
      return true;
    }
    if (action.startsWith("create-alternative:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        const newVersion = q.version ? q.version + 1 : 2;
        const ref = `${q.quote_number_base || q.quote_number}/${newVersion.toString().padStart(2, "0")}`;

        const newQuote = {
          ...JSON.parse(JSON.stringify(q)),
          quote_id: `quote-${Date.now()}`,
          id: `quote-${Date.now()}`,
          version: newVersion,
          quote_ref: ref,
          quote_number: ref,
          number: ref,
          status: "draft",
          document_status: "not_generated",
          supersedes_quote_id: q.id,
          created_at: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString().split("T")[0]
        };

        quotes().unshift(newQuote);
        state.quoteRowMenuId = null;
        state.selectedQuoteId = newQuote.id;
        toast(`Created alternative draft ${ref}`);
        refresh();
      }
      return true;
    }
    if (action.startsWith("archive-quote:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        q.status = "archived";
        state.quoteRowMenuId = null;
        toast(`Quote archived.`);
        refresh();
      }
      return true;
    }
    if (action.startsWith("mark-accepted:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        q.status = "accepted";
        state.quoteRowMenuId = null;
        toast(`Quote marked accepted.`);
        refresh();
      }
      return true;
    }
    if (action.startsWith("mark-rejected:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        q.status = "rejected";
        state.quoteRowMenuId = null;
        toast(`Quote marked rejected.`);
        refresh();
      }
      return true;
    }
    if (action.startsWith("restore-quote:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        q.status = "draft";
        state.quoteRowMenuId = null;
        toast(`Quote restored to draft.`);
        refresh();
      }
      return true;
    }
    if (action.startsWith("convert-to-job:")) {
      const qId = action.split(":")[1];
      const q = quotes().find(x => x.id === qId);
      if (q) {
        toast("Convert to job is mocked for this prototype.");
        state.quoteRowMenuId = null;
        refresh();
      }
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
    if (target.matches("[data-new-quote-template]")) {
      state.newQuoteTemplateId = target.value;
      return;
    }
    if (target.matches("[data-quote-action='add-catalogue-item']")) {
      const catId = target.value;
      if (!catId) return;

      const quote = selectedQuote();
      if (!quote) return;

      const catItem = window.CLEANOPS_DATA.catalogue.find(c => c.item_id === catId);
      if (catItem) {
        quote.quote_items = quote.quote_items || [];
        quote.quote_items.push({
          item_id: `qi-${Date.now()}`,
          catalogue_id: catItem.item_id,
          name: catItem.name,
          description: catItem.default_description,
          quantity_or_hours: 1,
          rate: catItem.default_rate,
          amount: catItem.default_rate,
          type: catItem.default_pricing_type,
          included: true,
          optional: false
        });
        updateQuoteCompatibility(quote);
        refresh();
      }
      target.value = "";
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
