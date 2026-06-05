(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedInvoiceId: null,
    editorOpen: false,
    previewOpen: false,
    createMode: null,
    selectedEventIds: [],
    rowMenuId: null,
    modal: null,
    partPaidInvoiceId: null
  };

  const statusLabels = {
    draft: "Draft",
    ready_to_send: "Ready to send",
    sent: "Sent",
    part_paid: "Part-paid",
    paid: "Paid",
    overdue: "Overdue",
    void: "Void"
  };

  const statusTones = {
    draft: "warning",
    ready_to_send: "info",
    sent: "info",
    part_paid: "warning",
    paid: "success",
    overdue: "danger",
    void: "muted"
  };

  const lineTypeLabels = {
    service: "Service",
    extra: "Extra",
    discount: "Discount",
    adjustment: "Adjustment",
    cancellation_fee: "Cancellation fee",
    manual: "Manual",
    correction: "Correction"
  };

  function source() {
    if (!data.invoicesV0) {
      data.invoicesV0 = { financeSettings: {}, billingSetups: [], invoices: [] };
    }
    if (!data.invoicesV0.financeSettings) data.invoicesV0.financeSettings = {};
    if (!data.invoicesV0.billingSetups) data.invoicesV0.billingSetups = [];
    if (!data.invoicesV0.invoices) data.invoicesV0.invoices = [];
    return data.invoicesV0;
  }

  function jobsSource() {
    if (!data.jobsV0) data.jobsV0 = { jobPlans: [], scheduledJobs: [], checklistTemplates: [], jobReports: [], billableEvents: [] };
    return data.jobsV0;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function chip(label, tone = "info") {
    const toneClass = tone && tone !== "success" ? ` ${tone}` : "";
    return `<span class="chip${toneClass}"><span class="dot"></span>${escapeHtml(label)}</span>`;
  }

  function button(label, action, variant = "") {
    const classes = ["button", variant].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-invoice-action="${escapeHtml(action)}">${escapeHtml(label)}</button>`;
  }

  function iconButton(label, action) {
    return `<button class="icon-button" type="button" data-invoice-action="${escapeHtml(action)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">X</button>`;
  }

  function toast(message) {
    window.CleanOpsShell?.toast?.(message);
  }

  function money(value) {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0));
  }

  function todayIso() {
    return "2026-06-05";
  }

  function addDays(value, days) {
    const [year, month, day] = String(value || todayIso()).split("-").map(Number);
    const next = new Date(Date.UTC(year || 2026, (month || 6) - 1, day || 5));
    next.setUTCDate(next.getUTCDate() + days);
    return next.toISOString().slice(0, 10);
  }

  function invoices() {
    return source().invoices;
  }

  function financeSettings() {
    return source().financeSettings;
  }

  function billingSetups() {
    return source().billingSetups;
  }

  function billableEvents() {
    return jobsSource().billableEvents || [];
  }

  function jobs() {
    return jobsSource().jobPlans || [];
  }

  function scheduledJobs() {
    return jobsSource().scheduledJobs || [];
  }

  function reports() {
    return jobsSource().jobReports || [];
  }

  function clients() {
    return data.clients || [];
  }

  function quotes() {
    return data.quotes || [];
  }

  function selectedInvoice() {
    return invoices().find((invoice) => invoice.id === state.selectedInvoiceId) || invoices()[0] || null;
  }

  function findInvoice(id) {
    return invoices().find((invoice) => invoice.id === id) || null;
  }

  function findClient(id) {
    return clients().find((client) => client.id === id) || null;
  }

  function findJob(id) {
    return jobs().find((job) => job.id === id) || null;
  }

  function findScheduled(id) {
    return scheduledJobs().find((clean) => clean.id === id) || null;
  }

  function findReport(id) {
    return reports().find((report) => report.id === id) || null;
  }

  function findBillable(id) {
    return billableEvents().find((event) => event.id === id) || null;
  }

  function findQuote(id) {
    return quotes().find((quote) => (quote.quote_id || quote.id || quote.number) === id) || null;
  }

  function findBillingSetup(clientId, propertyId) {
    return billingSetups().find((setup) => setup.client_id === clientId && setup.property_id === propertyId)
      || billingSetups().find((setup) => setup.client_id === clientId)
      || null;
  }

  function displayClientById(id) {
    const client = findClient(id);
    return client?.display_name || client?.name || client?.company_name || client?.company || "Manual customer";
  }

  function displayProperty(clientId, propertyId) {
    const client = findClient(clientId);
    const property = client?.properties?.find((item) => item.id === propertyId);
    return property?.label || property?.name || property?.address || "Property not linked";
  }

  function invoiceTotal(invoice) {
    return (invoice?.lines || []).reduce((total, line) => total + Number(line.amount ?? (Number(line.quantity || 0) * Number(line.rate || 0))), 0);
  }

  function invoiceBalance(invoice) {
    return Math.max(0, invoiceTotal(invoice) - Number(invoice?.paid_amount || 0));
  }

  function activeInvoiceEventIds() {
    return new Set(invoices()
      .filter((invoice) => invoice.status !== "void")
      .flatMap((invoice) => invoice.source_billable_event_ids || []));
  }

  function readyBillableEvents() {
    const linked = activeInvoiceEventIds();
    return billableEvents().filter((event) => event.status === "ready_to_bill" && !linked.has(event.id));
  }

  function billingReviewEvents() {
    const linked = activeInvoiceEventIds();
    return billableEvents().filter((event) => {
      if (linked.has(event.id)) return false;
      return event.status === "draft" || event.status === "not_billable" || !event.amount || !event.source_job_id;
    });
  }

  function invoiceStatus(invoice) {
    if (!invoice) return "draft";
    if (invoice.status === "sent" && invoice.due_date && invoice.due_date < todayIso() && invoiceBalance(invoice) > 0) return "overdue";
    return invoice.status || "draft";
  }

  function statusChip(invoice) {
    const status = invoiceStatus(invoice);
    return chip(statusLabels[status] || status, statusTones[status] || "info");
  }

  function nextInvoiceRef() {
    const settings = financeSettings();
    return `${settings.invoice_prefix || "INV"}-${settings.next_invoice_number || 3052}`;
  }

  function groupKeyForEvent(event) {
    const job = findJob(event.source_job_id);
    return `${job?.client_id || "manual"}:${job?.property_id || "none"}:${job?.id || "manual"}`;
  }

  function eventContext(event) {
    const job = findJob(event.source_job_id);
    const clean = findScheduled(event.source_scheduled_job_id);
    const report = findReport(event.source_report_id);
    const setup = job ? findBillingSetup(job.client_id, job.property_id) : null;
    return { job, clean, report, setup };
  }

  function selectedEvents() {
    return state.selectedEventIds.map(findBillable).filter(Boolean);
  }

  function lineFromEvent(event) {
    return {
      id: `line-${Date.now()}-${event.id}`,
      type: event.billing_type === "extra" ? "extra" : "service",
      source_billable_event_id: event.id,
      description: event.description || "Billable event",
      quantity: 1,
      rate: Number(event.amount || 0),
      amount: Number(event.amount || 0)
    };
  }

  function createInvoiceFromEvents() {
    const events = selectedEvents();
    if (!events.length) return null;
    const first = eventContext(events[0]);
    const setup = first.setup || billingSetups()[0] || {};
    const settings = financeSettings();
    const invoice = {
      id: `inv-${Date.now()}`,
      invoice_ref: nextInvoiceRef(),
      client_id: first.job?.client_id || setup.client_id || "",
      property_id: first.job?.property_id || setup.property_id || "",
      billing_setup_id: setup.id || "",
      status: "draft",
      source: "billable_events",
      period: "Selected billable events",
      invoice_date: todayIso(),
      issued_date: "",
      due_date: addDays(todayIso(), settings.default_payment_terms_days || 14),
      paid_date: "",
      paid_amount: 0,
      payment_terms: `${settings.default_payment_terms_days || 14} days`,
      notes: "Draft created from ready billable events.",
      source_billable_event_ids: events.map((event) => event.id),
      lines: events.map(lineFromEvent)
    };
    invoices().unshift(invoice);
    settings.next_invoice_number = Number(settings.next_invoice_number || 3052) + 1;
    state.selectedInvoiceId = invoice.id;
    state.createMode = null;
    state.selectedEventIds = [];
    state.editorOpen = true;
    toast("Invoice draft created from billable events.");
    return invoice;
  }

  function createManualInvoice() {
    const clientId = document.getElementById("invoice-manual-client")?.value || "manual";
    const client = findClient(clientId);
    const propertyId = client?.properties?.[0]?.id || "";
    const setup = findBillingSetup(clientId, propertyId) || {};
    const settings = financeSettings();
    const invoice = {
      id: `inv-${Date.now()}`,
      invoice_ref: nextInvoiceRef(),
      client_id: clientId,
      property_id: propertyId,
      billing_setup_id: setup.id || "",
      status: "draft",
      source: "manual",
      period: document.getElementById("invoice-manual-period")?.value || "Manual invoice",
      invoice_date: todayIso(),
      issued_date: "",
      due_date: addDays(todayIso(), settings.default_payment_terms_days || 14),
      paid_date: "",
      paid_amount: 0,
      payment_terms: `${settings.default_payment_terms_days || 14} days`,
      notes: "Manual invoice draft.",
      source_billable_event_ids: [],
      lines: [
        { id: `line-${Date.now()}-manual`, type: "manual", source_billable_event_id: "", description: document.getElementById("invoice-manual-description")?.value || "Manual service charge", quantity: 1, rate: Number(document.getElementById("invoice-manual-amount")?.value || 120), amount: Number(document.getElementById("invoice-manual-amount")?.value || 120) }
      ]
    };
    invoices().unshift(invoice);
    settings.next_invoice_number = Number(settings.next_invoice_number || 3052) + 1;
    state.selectedInvoiceId = invoice.id;
    state.createMode = null;
    state.editorOpen = true;
    toast("Manual invoice draft created.");
    return invoice;
  }

  function kpis() {
    const ready = readyBillableEvents().reduce((total, event) => total + Number(event.amount || 0), 0);
    const sentUnpaid = invoices().filter((invoice) => ["sent", "part_paid"].includes(invoice.status)).reduce((total, invoice) => total + invoiceBalance(invoice), 0);
    const overdue = invoices().filter((invoice) => invoiceStatus(invoice) === "overdue").reduce((total, invoice) => total + invoiceBalance(invoice), 0);
    const horizonEnd = addDays(todayIso(), 30);
    const forecast = scheduledJobs()
      .filter((clean) => clean.date >= todayIso() && clean.date <= horizonEnd && !["skipped", "cancelled"].includes(clean.status))
      .reduce((total, clean) => {
        const job = findJob(clean.job_id);
        const item = job?.pricing_items?.find((pricing) => pricing.id === clean.pricing_item_id);
        return total + Number(item?.amount || 0);
      }, 0);
    return [
      { label: "Ready to invoice", value: money(ready), chip: `${readyBillableEvents().length} events`, tone: "success" },
      { label: "Sent / unpaid", value: money(sentUnpaid), chip: "Manual chase", tone: "info" },
      { label: "Overdue", value: money(overdue), chip: `${overdueItems().length} invoices`, tone: overdue ? "danger" : "muted" },
      { label: "Next 30 days forecast", value: money(forecast), chip: "From scheduled cleans", tone: "info" }
    ];
  }

  function overdueItems() {
    return invoices().filter((invoice) => invoiceStatus(invoice) === "overdue" && invoiceBalance(invoice) > 0);
  }

  function groupedReadyCards() {
    const groups = new Map();
    readyBillableEvents().forEach((event) => {
      const context = eventContext(event);
      const key = groupKeyForEvent(event);
      const group = groups.get(key) || { key, job: context.job, setup: context.setup, events: [] };
      group.events.push(event);
      groups.set(key, group);
    });
    return Array.from(groups.values());
  }

  function render() {
    return `
      <section class="invoices-root" data-invoices-root="true">
        ${pageHead()}
        ${renderKpis()}
        ${renderActionPanel()}
        ${renderRegister()}
        ${state.createMode ? renderCreateLayer() : ""}
        ${state.editorOpen && selectedInvoice() ? renderEditor(selectedInvoice()) : ""}
        ${state.previewOpen && selectedInvoice() ? renderPreview(selectedInvoice()) : ""}
        ${state.modal ? renderModal() : ""}
      </section>
    `;
  }

  function pageHead() {
    return `
      <div class="page-head">
        <div>
          <div class="title-row"><h1>Invoices</h1></div>
          <p class="muted" style="margin-top:10px">Create invoices from ready billable events, review draft documents, and track payment status.</p>
        </div>
        <div class="page-actions">${button("New invoice", "open-create", "primary")} ${button("Finance settings", "finance-settings")}</div>
      </div>
    `;
  }

  function renderKpis() {
    return `<section class="grid-4 invoice-kpis">${kpis().map((item) => `
      <article class="metric">
        <p class="muted">${escapeHtml(item.label)}</p>
        <div class="metric-value">${escapeHtml(item.value)}</div>
        ${chip(item.chip, item.tone)}
      </article>
    `).join("")}</section>`;
  }

  function renderActionPanel() {
    return `
      <section class="jobs-action-panel invoice-action-panel">
        ${renderActionColumn("Ready to invoice", groupedReadyCards(), renderReadyCard)}
        ${renderActionColumn("Needs billing review", billingReviewEvents(), renderReviewCard)}
        ${renderActionColumn("Overdue / chase", overdueItems(), renderOverdueCard)}
      </section>
    `;
  }

  function renderActionColumn(title, items, renderer) {
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

  function renderReadyCard(group) {
    const total = group.events.reduce((sum, event) => sum + Number(event.amount || 0), 0);
    return `
      <button class="job-action-card" type="button" data-invoice-action="create-from-group:${escapeHtml(group.key)}">
        <strong>${escapeHtml(group.job?.address_label || group.setup?.billing_name || "Ready billable work")}</strong>
        <span>${escapeHtml(group.setup?.billing_name || displayClientById(group.job?.client_id))}</span>
        <span class="muted">${escapeHtml(`${group.events.length} item${group.events.length === 1 ? "" : "s"} ready. Suggested: ${group.setup?.invoice_timing || "review before invoicing"}`)}</span>
        ${chip(`${money(total)} ready`, "success")}
      </button>
    `;
  }

  function renderReviewCard(event) {
    const context = eventContext(event);
    return `
      <button class="job-action-card" type="button" data-invoice-action="review-event:${escapeHtml(event.id)}">
        <strong>${escapeHtml(context.job?.address_label || "Billing review")}</strong>
        <span>${escapeHtml(event.description || "Billable event")}</span>
        <span class="muted">${escapeHtml(event.status === "draft" ? "Draft billable event needs approval" : !event.amount ? "Missing price" : "Review billing status")}</span>
        ${chip(event.status === "not_billable" ? "No charge" : "Review", event.status === "not_billable" ? "muted" : "warning")}
      </button>
    `;
  }

  function renderOverdueCard(invoice) {
    return `
      <button class="job-action-card" type="button" data-invoice-action="open-editor:${escapeHtml(invoice.id)}">
        <strong>${escapeHtml(invoice.invoice_ref)}</strong>
        <span>${escapeHtml(displayClientById(invoice.client_id))} - ${escapeHtml(displayProperty(invoice.client_id, invoice.property_id))}</span>
        <span class="muted">${escapeHtml(`${money(invoiceBalance(invoice))} outstanding, due ${invoice.due_date || "not set"}`)}</span>
        ${chip("Chase", "danger")}
      </button>
    `;
  }

  function renderRegister() {
    const rows = invoices().map((invoice) => `
      <tr data-invoice-row="${escapeHtml(invoice.id)}" data-invoice-action="open-editor:${escapeHtml(invoice.id)}" tabindex="0" role="button">
        <td><strong>${escapeHtml(invoice.invoice_ref)}</strong><br><span class="muted">${escapeHtml(invoice.source === "manual" ? "Manual" : "Billable events")}</span></td>
        <td>${escapeHtml(displayClientById(invoice.client_id))}<br><span class="muted">${escapeHtml(displayProperty(invoice.client_id, invoice.property_id))}</span></td>
        <td>${escapeHtml(invoice.period || "Current period")}</td>
        <td>${escapeHtml(money(invoiceTotal(invoice)))}</td>
        <td>${statusChip(invoice)}</td>
        <td>${escapeHtml(invoice.issued_date || invoice.invoice_date || "Draft")}</td>
        <td>${escapeHtml(invoice.due_date || "Not set")}</td>
        <td>${escapeHtml(invoice.paid_date || (invoice.paid_amount ? "Part-paid" : "-"))}</td>
        <td>
          <div class="row-actions">
            <button class="button small" type="button" data-invoice-action="toggle-row-menu:${escapeHtml(invoice.id)}">Actions v</button>
            ${state.rowMenuId === invoice.id ? renderRowMenu(invoice) : ""}
          </div>
        </td>
      </tr>
    `).join("");
    return `
      <article class="panel invoices-register-panel">
        <div class="panel-head">
          <div><h2>Invoice register</h2><p class="muted">Search/filter/sort/page-ready register for all invoice documents.</p></div>
          ${chip(`${invoices().length} invoices`, "info")}
        </div>
        <div class="filters">
          <span class="inputish">Search invoices</span>
          <span class="selectish">All statuses</span>
          <span class="selectish">Sort: due date</span>
          <span class="selectish">Page size: 25</span>
          <span class="selectish">Prev / Next</span>
        </div>
        <div class="quote-table-scroll">
          <table class="jobs-scheduled-table invoices-register-table">
            <thead><tr><th>Invoice ref</th><th>Client / property</th><th>Period / source</th><th>Amount</th><th>Status</th><th>Issued</th><th>Due</th><th>Paid</th><th>Actions</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </article>
    `;
  }

  function renderRowMenu(invoice) {
    const locked = invoice.status === "void";
    return `
      <div class="row-action-menu">
        <button type="button" data-invoice-action="open-editor:${escapeHtml(invoice.id)}">Open editor</button>
        <button type="button" data-invoice-action="preview:${escapeHtml(invoice.id)}">Preview document</button>
        ${!locked ? `<button type="button" data-invoice-action="confirm-ready:${escapeHtml(invoice.id)}">Mark ready to send</button>` : ""}
        ${!locked ? `<button type="button" data-invoice-action="confirm-sent:${escapeHtml(invoice.id)}">Mark sent</button>` : ""}
        ${!locked ? `<button type="button" data-invoice-action="confirm-paid:${escapeHtml(invoice.id)}">Mark paid</button>` : ""}
        ${!locked ? `<button type="button" data-invoice-action="part-paid:${escapeHtml(invoice.id)}">Mark part-paid</button>` : ""}
        ${!locked ? `<button type="button" data-invoice-action="confirm-void:${escapeHtml(invoice.id)}">Void</button>` : ""}
        <button type="button" data-invoice-action="mock:Duplicate invoice">Duplicate mock</button>
      </div>
    `;
  }

  function renderCreateLayer() {
    return `
      <div class="job-layer-backdrop">
        <article class="job-layer-shell invoice-layer-shell" role="dialog" aria-modal="true">
          <div class="panel-head">
            <div>
              <p class="eyebrow">New invoice</p>
              <h2>${state.createMode === "manual" ? "Manual invoice" : state.createMode === "events" ? "Create from billable events" : "Choose invoice route"}</h2>
            </div>
            ${button("Close", "close-create")}
          </div>
          ${state.createMode === "events" ? renderEventSelection() : state.createMode === "manual" ? renderManualInvoice() : renderCreateLauncher()}
        </article>
      </div>
    `;
  }

  function renderCreateLauncher() {
    return `
      <section class="grid-detail job-layer-content">
        <article class="panel pad">
          <h2>Create from billable events</h2>
          <p class="muted" style="margin-top:8px">Select completed/approved billable events and create a draft invoice document.</p>
          <div class="button-row" style="margin-top:14px">${button("Select billable events", "create-events", "primary")}</div>
        </article>
        <article class="panel pad">
          <h2>Manual invoice</h2>
          <p class="muted" style="margin-top:8px">Create a draft for a manual charge, deposit, correction, sundry work, or work without a quote/job.</p>
          <div class="button-row" style="margin-top:14px">${button("Start manual invoice", "create-manual")}</div>
        </article>
      </section>
    `;
  }

  function renderEventSelection() {
    const ready = readyBillableEvents();
    const rows = ready.map((event) => {
      const context = eventContext(event);
      const checked = state.selectedEventIds.includes(event.id);
      return `
        <tr>
          <td><input type="checkbox" data-invoice-event="${escapeHtml(event.id)}"${checked ? " checked" : ""}></td>
          <td>${escapeHtml(context.clean ? `${context.clean.date} ${context.clean.start_time}` : "Completed work")}</td>
          <td>${escapeHtml(context.job?.address_label || "No job")}<br><span class="muted">${escapeHtml(displayClientById(context.job?.client_id))}</span></td>
          <td>${escapeHtml(event.description)}</td>
          <td>${escapeHtml(money(event.amount))}</td>
          <td>${escapeHtml(event.source_report_id || event.source_scheduled_job_id || "Manual source")}</td>
          <td>${chip("Ready", "success")}</td>
        </tr>
      `;
    }).join("");
    return `
      <section class="job-layer-content stack">
        <article class="panel">
          <div class="panel-head">
            <div><h2>Ready billable events</h2><p class="muted">One billable event can only belong to one active invoice.</p></div>
            ${chip(`${ready.length} available`, ready.length ? "success" : "muted")}
          </div>
          <div class="filters">
            <span class="inputish">Grouped by client / property / job</span>
            <span class="selectish">Ready to bill only</span>
            <span class="selectish">Page size: 25</span>
          </div>
          <div class="quote-table-scroll">
            <table class="jobs-scheduled-table">
              <thead><tr><th>Select</th><th>Date</th><th>Job / property</th><th>Description</th><th>Amount</th><th>Source</th><th>Status</th></tr></thead>
              <tbody>${rows || `<tr><td colspan="7"><span class="muted">No un-invoiced ready billable events.</span></td></tr>`}</tbody>
            </table>
          </div>
        </article>
        <div class="job-editor-actions">
          ${button("Back", "open-create")}
          ${button("Create invoice draft", "confirm-create-events", "primary")}
        </div>
      </section>
    `;
  }

  function renderManualInvoice() {
    const clientOptions = clients().map((client) => `<option value="${escapeHtml(client.id)}">${escapeHtml(displayClientById(client.id))}</option>`).join("");
    return `
      <section class="job-layer-content">
        <article class="panel pad">
          <h2>Manual invoice setup</h2>
          <div class="job-plan-grid" style="margin-top:14px">
            <label class="client-field"><span>Client / customer</span><select id="invoice-manual-client">${clientOptions}<option value="manual">Manual customer</option></select></label>
            <label class="client-field"><span>Period / source</span><input id="invoice-manual-period" value="Manual charge"></label>
            <label class="client-field wide"><span>Line description</span><input id="invoice-manual-description" value="Manual service charge"></label>
            <label class="client-field"><span>Amount</span><input id="invoice-manual-amount" type="number" value="120"></label>
            <label class="client-field"><span>Line type</span><select><option>Manual</option><option>Correction</option><option>Deposit</option><option>Cancellation fee</option></select></label>
          </div>
          <div class="request-note-block" style="margin-top:14px"><strong>Manual route</strong><span>For non-cleaning one-off service, sundry work, deposits, corrections, or work without quote/job.</span></div>
        </article>
        <div class="job-editor-actions">
          ${button("Back", "open-create")}
          ${button("Create manual draft", "confirm-create-manual", "primary")}
        </div>
      </section>
    `;
  }

  function renderEditor(invoice) {
    const setup = findBillingSetup(invoice.client_id, invoice.property_id) || billingSetups().find((item) => item.id === invoice.billing_setup_id) || {};
    return `
      <div class="job-layer-backdrop">
        <article class="job-layer-shell invoice-layer-shell" role="dialog" aria-modal="true">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Invoice editor</p>
              <h2>${escapeHtml(invoice.invoice_ref)}</h2>
              <p class="muted" style="margin-top:6px">${escapeHtml(displayClientById(invoice.client_id))} - ${escapeHtml(displayProperty(invoice.client_id, invoice.property_id))}</p>
            </div>
            ${button("Close", "close-editor")}
          </div>
          <section class="grid-detail job-layer-content">
            <div class="stack">
              <article class="panel pad">
                <h2>Client / billing details</h2>
                <div class="job-plan-grid" style="margin-top:12px">
                  <div class="request-note-block"><strong>Bill to</strong><span>${escapeHtml(setup.billing_name || displayClientById(invoice.client_id))}</span></div>
                  <div class="request-note-block"><strong>Invoice email</strong><span>${escapeHtml(setup.invoice_email || "Not set")}</span></div>
                  <div class="request-note-block wide"><strong>Billing address</strong><span>${escapeHtml(setup.billing_address || "Billing address not set")}</span></div>
                  <div class="request-note-block"><strong>Payment terms</strong><span>${escapeHtml(invoice.payment_terms || setup.payment_terms || "14 days")}</span></div>
                  <div class="request-note-block"><strong>VAT status</strong><span>${escapeHtml(financeSettings().vat_label || "VAT: Not applicable")}</span></div>
                </div>
              </article>
              <article class="panel">
                <div class="panel-head"><h2>Invoice lines</h2>${chip(`${(invoice.lines || []).length} lines`, "info")}</div>
                <div class="quote-table-scroll">
                  <table class="jobs-scheduled-table">
                    <thead><tr><th>Type</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                    <tbody>${(invoice.lines || []).map((line) => `
                      <tr>
                        <td>${escapeHtml(lineTypeLabels[line.type] || line.type || "Line")}</td>
                        <td>${escapeHtml(line.description)}</td>
                        <td>${escapeHtml(line.quantity || 1)}</td>
                        <td>${escapeHtml(money(line.rate))}</td>
                        <td>${escapeHtml(money(line.amount))}</td>
                      </tr>
                    `).join("")}</tbody>
                  </table>
                </div>
              </article>
              <article class="panel pad">
                <h2>Totals / notes</h2>
                <div class="stack" style="margin-top:12px">
                  <div class="field-row"><span>Subtotal</span><strong>${escapeHtml(money(invoiceTotal(invoice)))}</strong></div>
                  <div class="field-row"><span>VAT</span><strong>${escapeHtml(financeSettings().vat_label || "VAT: Not applicable")}</strong></div>
                  <div class="field-row"><span>Total</span><strong>${escapeHtml(money(invoiceTotal(invoice)))}</strong></div>
                  <div class="field-row"><span>Paid</span><strong>${escapeHtml(money(invoice.paid_amount || 0))}</strong></div>
                  <div class="field-row"><span>Balance</span><strong>${escapeHtml(money(invoiceBalance(invoice)))}</strong></div>
                  <div class="request-note-block"><strong>Notes</strong><span>${escapeHtml(invoice.notes || "No notes")}</span></div>
                </div>
              </article>
            </div>
            <aside class="stack">
              <article class="panel pad">
                <h2>Source billable events</h2>
                <div class="stack" style="margin-top:12px">
                  ${(invoice.source_billable_event_ids || []).length ? invoice.source_billable_event_ids.map((id) => {
                    const event = findBillable(id);
                    return `<div class="request-note-block"><strong>${escapeHtml(event?.description || id)}</strong><span>${escapeHtml(event ? `${money(event.amount)} - ${event.status}` : "Source not found")}</span></div>`;
                  }).join("") : `<div class="request-note-block"><strong>Manual invoice</strong><span>No billable events linked.</span></div>`}
                </div>
              </article>
              <article class="panel pad">
                <h2>Billing setup</h2>
                <div class="field-row"><span>Delivery</span><strong>${escapeHtml(setup.delivery_method || "Email")}</strong></div>
                <div class="field-row"><span>PO required</span><strong>${escapeHtml(setup.po_required ? "Yes" : "No")}</strong></div>
                <div class="field-row"><span>Grouping</span><strong>${escapeHtml(setup.grouping_rule || "Manual grouping")}</strong></div>
                <div class="field-row"><span>Extras</span><strong>${escapeHtml(setup.extras_handling || "Review manually")}</strong></div>
              </article>
              <article class="panel pad">
                <h2>Payment status</h2>
                <div class="field-row"><span>Status</span><strong>${escapeHtml(statusLabels[invoiceStatus(invoice)] || invoice.status)}</strong></div>
                <div class="field-row"><span>Balance</span><strong>${escapeHtml(money(invoiceBalance(invoice)))}</strong></div>
                <div class="field-row"><span>Paid date</span><strong>${escapeHtml(invoice.paid_date || "Not paid")}</strong></div>
              </article>
            </aside>
          </section>
          <div class="job-editor-actions">
            ${button("Save draft", "save-editor")}
            ${button("Preview document", `preview:${invoice.id}`)}
            ${invoice.status !== "void" ? button("Mark ready to send", `confirm-ready:${invoice.id}`) : ""}
            ${invoice.status !== "void" ? button("Mark sent mock", `confirm-sent:${invoice.id}`, "primary") : ""}
            ${button("Close", "close-editor")}
          </div>
        </article>
      </div>
    `;
  }

  function renderPreview(invoice) {
    const setup = findBillingSetup(invoice.client_id, invoice.property_id) || {};
    const settings = financeSettings();
    return `
      <div class="a4-document-backdrop">
        <article class="a4-document invoice-document-preview">
          <div class="a4-header">
            <div>
              <h1>${escapeHtml(settings.trading_name || "PandaZen Cleaning")}</h1>
              <p>${escapeHtml(settings.registered_address || "")}</p>
              <p>${escapeHtml(settings.email || "")} - ${escapeHtml(settings.phone || "")}</p>
            </div>
            <div>
              <h2>Invoice</h2>
              <p><strong>${escapeHtml(invoice.invoice_ref)}</strong></p>
              <p>Date: ${escapeHtml(invoice.invoice_date || todayIso())}</p>
              <p>Due: ${escapeHtml(invoice.due_date || "Not set")}</p>
            </div>
          </div>
          <div class="a4-client-block">
            <div>
              <h3>Bill to</h3>
              <p>${escapeHtml(setup.billing_name || displayClientById(invoice.client_id))}</p>
              <p>${escapeHtml(setup.billing_address || displayProperty(invoice.client_id, invoice.property_id))}</p>
            </div>
            <div>
              <h3>Service address / reference</h3>
              <p>${escapeHtml(displayProperty(invoice.client_id, invoice.property_id))}</p>
              <p>${escapeHtml(invoice.period || "Current period")}</p>
            </div>
          </div>
          <table>
            <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>${(invoice.lines || []).map((line) => `<tr><td>${escapeHtml(line.description)}</td><td>${escapeHtml(line.quantity || 1)}</td><td>${escapeHtml(money(line.rate))}</td><td>${escapeHtml(money(line.amount))}</td></tr>`).join("")}</tbody>
          </table>
          <div class="invoice-preview-totals">
            <div class="field-row"><span>Subtotal</span><strong>${escapeHtml(money(invoiceTotal(invoice)))}</strong></div>
            <div class="field-row"><span>VAT</span><strong>${escapeHtml(settings.vat_label || "VAT: Not applicable")}</strong></div>
            <div class="field-row"><span>Total</span><strong>${escapeHtml(money(invoiceTotal(invoice)))}</strong></div>
          </div>
          <div class="request-note-block"><strong>Payment instructions</strong><span>${escapeHtml(settings.payment_instructions || "Payment instructions not set")}</span></div>
          <p class="muted" style="margin-top:14px">${escapeHtml(settings.footer_text || "")}</p>
          <div class="button-row" style="justify-content:flex-end; margin-top:18px">
            ${button("Print/export later", "mock:Print/export invoice document")}
            ${button("Close", "close-preview", "primary")}
          </div>
        </article>
      </div>
    `;
  }

  function renderModal() {
    const modal = state.modal;
    if (modal.type === "partPaid") return renderPartPaidModal(modal.invoiceId);
    if (modal.type === "mock") return renderMockModal(modal);
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal" role="dialog" aria-modal="true">
          <h2>${escapeHtml(modal.title)}</h2>
          <p class="muted" style="margin-top:8px">${escapeHtml(modal.copy)}</p>
          <div class="button-row" style="margin-top:16px">
            ${button("Cancel", "close-modal")}
            ${button(modal.primaryLabel || "Confirm", modal.confirmAction, "primary")}
          </div>
        </article>
      </div>
    `;
  }

  function renderPartPaidModal(invoiceId) {
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal" role="dialog" aria-modal="true">
          <h2>Record part payment</h2>
          <p class="muted" style="margin-top:8px">Mock/manual payment tracking only. No bank reconciliation or payment link is created.</p>
          <label class="client-field wide" style="margin-top:14px"><span>Amount paid</span><input id="invoice-part-paid-amount" type="number" value="45"></label>
          <label class="client-field wide" style="margin-top:10px"><span>Date paid</span><input id="invoice-part-paid-date" type="date" value="${todayIso()}"></label>
          <div class="button-row" style="margin-top:16px">
            ${button("Cancel", "close-modal")}
            ${button("Record part payment", `mark-part-paid:${invoiceId}`, "primary")}
          </div>
        </article>
      </div>
    `;
  }

  function renderMockModal(modal) {
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal" role="dialog" aria-modal="true">
          <h2>${escapeHtml(modal.title)}</h2>
          <p class="muted" style="margin-top:8px">${escapeHtml(modal.copy)}</p>
          ${modal.detail ? `<div class="request-note-block" style="margin-top:14px"><strong>V0 boundary</strong><span>${escapeHtml(modal.detail)}</span></div>` : ""}
          <div class="button-row" style="margin-top:16px">${button("Close", "close-modal", "primary")}</div>
        </article>
      </div>
    `;
  }

  function renderFinanceSettingsModal() {
    const settings = financeSettings();
    state.modal = {
      type: "mock",
      title: "Finance settings",
      copy: `${settings.invoice_prefix || "INV"} next number ${settings.next_invoice_number || 0}. ${settings.vat_label || "VAT: Not applicable"}.`,
      detail: `${settings.trading_name || "Company"} - ${settings.payment_instructions || "Payment instructions not set"}`
    };
  }

  function refresh() {
    const root = document.getElementById("page-root");
    if (root?.querySelector("[data-invoices-root]")) root.innerHTML = render();
  }

  function readSelectedEvents() {
    state.selectedEventIds = Array.from(document.querySelectorAll("[data-invoice-event]:checked")).map((input) => input.dataset.invoiceEvent);
  }

  function confirmTransition(invoiceId, title, copy, label, action) {
    state.modal = { title, copy, primaryLabel: label, confirmAction: `${action}:${invoiceId}` };
    refresh();
  }

  function setInvoiceStatus(invoiceId, status) {
    const invoice = findInvoice(invoiceId);
    if (!invoice) return;
    invoice.status = status;
    if (status === "sent") {
      invoice.issued_date = invoice.issued_date || todayIso();
      invoice.due_date = invoice.due_date || addDays(todayIso(), financeSettings().default_payment_terms_days || 14);
    }
    if (status === "paid") {
      invoice.paid_amount = invoiceTotal(invoice);
      invoice.paid_date = todayIso();
    }
    if (status === "void") {
      invoice.source_billable_event_ids?.forEach((id) => {
        const event = findBillable(id);
        if (event) event.status = "ready_to_bill";
      });
    }
    state.modal = null;
    toast(`Invoice ${statusLabels[status] || status}.`);
    refresh();
  }

  function handleClick(event) {
    const row = event.target.closest("[data-invoice-row]");
    if (row && !event.target.closest("[data-invoice-action]")) {
      state.selectedInvoiceId = row.dataset.invoiceRow;
      state.editorOpen = true;
      state.rowMenuId = null;
      refresh();
      event.preventDefault();
      return true;
    }

    const target = event.target.closest("[data-invoice-action]");
    if (!target) return false;
    const action = target.dataset.invoiceAction;
    event.preventDefault();
    event.stopPropagation();

    if (action === "open-create") {
      state.createMode = "choose";
      state.editorOpen = false;
      state.previewOpen = false;
      refresh();
      return true;
    }
    if (action === "create-events") {
      state.createMode = "events";
      state.selectedEventIds = [];
      refresh();
      return true;
    }
    if (action === "create-manual") {
      state.createMode = "manual";
      refresh();
      return true;
    }
    if (action === "close-create") {
      state.createMode = null;
      state.selectedEventIds = [];
      refresh();
      return true;
    }
    if (action === "confirm-create-events") {
      readSelectedEvents();
      state.modal = {
        title: "Create invoice draft?",
        copy: `This will create one invoice draft from ${state.selectedEventIds.length} selected billable event${state.selectedEventIds.length === 1 ? "" : "s"}.`,
        primaryLabel: "Create draft",
        confirmAction: "create-events-draft"
      };
      refresh();
      return true;
    }
    if (action === "create-events-draft") {
      createInvoiceFromEvents();
      state.modal = null;
      refresh();
      return true;
    }
    if (action === "confirm-create-manual") {
      state.modal = {
        title: "Create manual invoice draft?",
        copy: "This creates a manual draft only. No quote, job, billable event, email, PDF storage, or payment link is created.",
        primaryLabel: "Create manual draft",
        confirmAction: "create-manual-draft"
      };
      refresh();
      return true;
    }
    if (action === "create-manual-draft") {
      createManualInvoice();
      state.modal = null;
      refresh();
      return true;
    }
    if (action.startsWith("create-from-group:")) {
      const key = action.replace("create-from-group:", "");
      state.createMode = "events";
      state.selectedEventIds = readyBillableEvents().filter((event) => groupKeyForEvent(event) === key).map((event) => event.id);
      refresh();
      return true;
    }
    if (action.startsWith("review-event:")) {
      const eventItem = findBillable(action.split(":")[1]);
      state.modal = {
        type: "mock",
        title: "Needs billing review",
        copy: eventItem ? `${eventItem.description} - ${money(eventItem.amount)} - ${eventItem.status}.` : "Billable event not found.",
        detail: "Billing review decisions remain in Jobs/Reports v0. Invoices only consumes ready billable events."
      };
      refresh();
      return true;
    }
    if (action.startsWith("toggle-row-menu:")) {
      const id = action.split(":")[1];
      state.rowMenuId = state.rowMenuId === id ? null : id;
      refresh();
      return true;
    }
    if (action.startsWith("open-editor:")) {
      state.selectedInvoiceId = action.split(":")[1];
      state.editorOpen = true;
      state.previewOpen = false;
      state.rowMenuId = null;
      refresh();
      return true;
    }
    if (action === "close-editor") {
      state.editorOpen = false;
      refresh();
      return true;
    }
    if (action === "save-editor") {
      toast("Invoice draft saved in mock state.");
      refresh();
      return true;
    }
    if (action.startsWith("preview:")) {
      state.selectedInvoiceId = action.split(":")[1];
      state.previewOpen = true;
      state.rowMenuId = null;
      refresh();
      return true;
    }
    if (action === "close-preview") {
      state.previewOpen = false;
      refresh();
      return true;
    }
    if (action.startsWith("confirm-ready:")) {
      confirmTransition(action.split(":")[1], "Mark ready to send?", "This marks the draft as ready for customer sending. No email is sent in v0.", "Mark ready", "mark-ready");
      return true;
    }
    if (action.startsWith("confirm-sent:")) {
      confirmTransition(action.split(":")[1], "Mark invoice sent?", "This records sent status only. No real email is sent.", "Mark sent", "mark-sent");
      return true;
    }
    if (action.startsWith("confirm-paid:")) {
      confirmTransition(action.split(":")[1], "Mark invoice paid?", "This records a manual full payment in mock state. No bank reconciliation is performed.", "Mark paid", "mark-paid");
      return true;
    }
    if (action.startsWith("confirm-void:")) {
      confirmTransition(action.split(":")[1], "Void invoice?", "This will void the invoice and return linked billable events to Ready to bill. The invoice cannot be sent or paid after voiding.", "Void invoice", "mark-void");
      return true;
    }
    if (action.startsWith("part-paid:")) {
      state.modal = { type: "partPaid", invoiceId: action.split(":")[1] };
      refresh();
      return true;
    }
    if (action.startsWith("mark-ready:")) {
      setInvoiceStatus(action.split(":")[1], "ready_to_send");
      return true;
    }
    if (action.startsWith("mark-sent:")) {
      setInvoiceStatus(action.split(":")[1], "sent");
      return true;
    }
    if (action.startsWith("mark-paid:")) {
      setInvoiceStatus(action.split(":")[1], "paid");
      return true;
    }
    if (action.startsWith("mark-void:")) {
      setInvoiceStatus(action.split(":")[1], "void");
      return true;
    }
    if (action.startsWith("mark-part-paid:")) {
      const invoice = findInvoice(action.split(":")[1]);
      if (invoice) {
        invoice.status = "part_paid";
        invoice.paid_amount = Number(document.getElementById("invoice-part-paid-amount")?.value || 0);
        invoice.paid_date = document.getElementById("invoice-part-paid-date")?.value || todayIso();
      }
      state.modal = null;
      toast("Part payment recorded in mock state.");
      refresh();
      return true;
    }
    if (action === "finance-settings") {
      renderFinanceSettingsModal();
      refresh();
      return true;
    }
    if (action.startsWith("mock:")) {
      state.modal = {
        type: "mock",
        title: action.replace("mock:", ""),
        copy: "This is intentionally mock-only in Invoices v0.",
        detail: "Real sending, PDF storage, payment links, accounting export, and reminder automation are future scope."
      };
      refresh();
      return true;
    }
    if (action === "close-modal") {
      state.modal = null;
      refresh();
      return true;
    }
    return false;
  }

  document.addEventListener("click", handleClick);

  window.CleanOpsInvoices = {
    render,
    handleClick
  };
})();
