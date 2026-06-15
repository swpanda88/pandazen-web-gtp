(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedInvoiceId: null,
    editorOpen: false,
    previewOpen: false,
    createMode: null,
    selectedEventIds: [],
    rowMenuId: null,
    rowMenuPosition: null,
    modal: null,
    pendingBillingDetails: null,
    partPaidInvoiceId: null,
    invoicesLoading: true,
    invoicesError: false,
    apiInvoices: [],
    eventsLoading: true,
    eventsError: false,
    apiBillableEvents: [],
    paymentsLoading: true,
    paymentsError: false,
    apiPayments: []
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

  function formatDate(value) {
    if (!value) return "";
    const [year, month, day] = String(value).split("-").map(Number);
    if (!year || !month || !day) return value;
    return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
      .format(new Date(Date.UTC(year, month - 1, day)));
  }

  function formatVisitDate(clean) {
    if (!clean?.date) return "Date not linked";
    return `${formatDate(clean.date)}${clean.start_time ? ` ${clean.start_time}` : ""}`;
  }

  function cleanTypeLabel(value) {
    const labels = {
      initial: "Initial clean",
      regular: "Regular domestic clean",
      extra: "Extra clean",
      one_off: "One-off clean"
    };
    return labels[value] || value || "Cleaning service";
  }

  function invoices() {
    return state.apiInvoices && state.apiInvoices.length ? state.apiInvoices : source().invoices;
  }

  function financeSettings() {
    return source().financeSettings;
  }

  function billingSetups() {
    return source().billingSetups;
  }

  function billableEvents() {
    return state.apiBillableEvents && state.apiBillableEvents.length ? state.apiBillableEvents : (jobsSource().billableEvents || []);
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

  function ensureBillingSetupForInvoice(invoice) {
    if (!invoice || invoice.client_id === "manual") return null;
    let setup = findBillingSetup(invoice.client_id, invoice.property_id)
      || billingSetups().find((item) => item.id === invoice.billing_setup_id)
      || null;
    if (!setup) {
      setup = {
        id: `billing-${Date.now()}`,
        client_id: invoice.client_id,
        property_id: invoice.property_id,
        delivery_method: "Email",
        grouping_rule: "Manual grouping",
        extras_handling: "Review manually"
      };
      billingSetups().push(setup);
      invoice.billing_setup_id = setup.id;
    }
    return setup;
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

  function invoiceServiceAddress(invoice) {
    return invoice?.manual_billing?.service_address || displayProperty(invoice?.client_id, invoice?.property_id);
  }

  function invoiceBillingSetup(invoice) {
    return invoice.manual_billing
      || findBillingSetup(invoice.client_id, invoice.property_id)
      || billingSetups().find((item) => item.id === invoice.billing_setup_id)
      || {};
  }

  function billingDetailsFromSetup(setup = {}, invoice = {}) {
    return {
      billing_name: setup.billing_name || invoice.manual_billing?.billing_name || displayClientById(invoice.client_id) || "Billing name not set",
      invoice_email: setup.invoice_email || invoice.manual_billing?.invoice_email || "invoice@example.test",
      billing_address: setup.billing_address || invoice.manual_billing?.billing_address || "Billing address not set",
      service_address: setup.service_address || invoice.manual_billing?.service_address || invoiceServiceAddress(invoice),
      payment_terms: invoice.payment_terms || setup.payment_terms || `${financeSettings().default_payment_terms_days || 14} days`,
      due_date: invoice.due_date || addDays(todayIso(), financeSettings().default_payment_terms_days || 14),
      invoice_date: invoice.invoice_date || todayIso(),
      reference: invoice.reference || setup.po_reference || setup.reference || "",
      vat_label: financeSettings().vat_label || "VAT: Not applicable"
    };
  }

  function readBillingDetails(prefix) {
    return {
      billing_name: document.getElementById(`${prefix}-bill-to`)?.value || "Billing name not set",
      invoice_email: document.getElementById(`${prefix}-email`)?.value || "invoice@example.test",
      billing_address: document.getElementById(`${prefix}-billing-address`)?.value || "Billing address not set",
      service_address: document.getElementById(`${prefix}-service-address`)?.value || "Service address not set",
      payment_terms: document.getElementById(`${prefix}-terms`)?.value || `${financeSettings().default_payment_terms_days || 14} days`,
      due_date: document.getElementById(`${prefix}-due-date`)?.value || addDays(todayIso(), financeSettings().default_payment_terms_days || 14),
      invoice_date: document.getElementById(`${prefix}-invoice-date`)?.value || todayIso(),
      reference: document.getElementById(`${prefix}-reference`)?.value || "",
      vat_label: financeSettings().vat_label || "VAT: Not applicable"
    };
  }

  function applyBillingDetailsToInvoice(invoice, details) {
    if (!invoice || !details) return;
    invoice.manual_billing = {
      ...(invoice.manual_billing || {}),
      billing_name: details.billing_name,
      invoice_email: details.invoice_email,
      billing_address: details.billing_address,
      service_address: details.service_address
    };
    invoice.payment_terms = details.payment_terms;
    invoice.due_date = details.due_date;
    invoice.invoice_date = details.invoice_date || invoice.invoice_date;
    invoice.reference = details.reference;
  }

  function applyBillingDetailsToSetup(setup, details) {
    if (!setup || !details) return;
    setup.billing_name = details.billing_name;
    setup.invoice_email = details.invoice_email;
    setup.billing_address = details.billing_address;
    setup.service_address = details.service_address;
    setup.payment_terms = details.payment_terms;
    setup.po_reference = details.reference;
  }

  function manualCustomerOptions() {
    const options = [];
    clients().forEach((client) => {
      const properties = client.properties?.length ? client.properties : [{ id: "", label: client.mainProperty || "Service address", address: client.billingAddress || "" }];
      properties.forEach((property) => {
        options.push({
          value: `${client.id}|${property.id || ""}`,
          client,
          property,
          label: `${displayClientById(client.id)} - ${property.label || property.name || property.address || "Service address"}`
        });
      });
    });
    options.push({ value: "new_customer", label: "+ New customer" });
    return options;
  }

  function manualSelectionParts(value) {
    if (!value || value === "new_customer") return { clientId: "manual", propertyId: "" };
    const [clientId, propertyId = ""] = value.split("|");
    return { clientId, propertyId };
  }

  function manualBillingDetailsForSelection(value) {
    if (value === "new_customer") {
      return {
        client_id: "manual",
        property_id: "",
        billing_name: "",
        invoice_email: "",
        phone: "",
        billing_address: "",
        service_address: "",
        payment_terms: "",
        delivery_method: "Email",
        reference: "",
        vat_label: financeSettings().vat_label || "VAT: Not applicable"
      };
    }
    const { clientId, propertyId } = manualSelectionParts(value);
    const client = findClient(clientId) || {};
    const property = client.properties?.find((item) => item.id === propertyId) || client.properties?.[0] || {};
    const setup = findBillingSetup(clientId, propertyId) || {};
    return {
      client_id: clientId,
      property_id: propertyId,
      billing_name: setup.billing_name || displayClientById(clientId),
      invoice_email: setup.invoice_email || client.email || "",
      phone: client.phone || "",
      billing_address: setup.billing_address || client.billingAddress || property.address || "",
      service_address: setup.service_address || property.address || client.mainProperty || "",
      payment_terms: setup.payment_terms || `${financeSettings().default_payment_terms_days || 14} days`,
      delivery_method: setup.delivery_method || "Email",
      reference: setup.po_reference || setup.reference || "",
      vat_label: financeSettings().vat_label || "VAT: Not applicable"
    };
  }

  function writeManualBillingFields(details) {
    const map = {
      "invoice-manual-bill-to": details.billing_name,
      "invoice-manual-email": details.invoice_email,
      "invoice-manual-phone": details.phone,
      "invoice-manual-billing-address": details.billing_address,
      "invoice-manual-service-address": details.service_address,
      "invoice-manual-terms": details.payment_terms,
      "invoice-manual-reference": details.reference
    };
    Object.entries(map).forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (field) field.value = value || "";
    });
    const delivery = document.getElementById("invoice-manual-delivery-method");
    if (delivery) delivery.value = details.delivery_method || "Email";
  }

  function invoiceTotal(invoice) {
    if (invoice?.isApiBacked) {
      if (invoice.grossTotal !== undefined && invoice.grossTotal !== null) return Number(invoice.grossTotal || 0);
      if (invoice.grossTotalPence !== undefined && invoice.grossTotalPence !== null) return Number(invoice.grossTotalPence || 0) / 100;
    }
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

  function needsActionItems() {
    const invoiceItems = invoices()
      .filter((invoice) => {
        const status = invoiceStatus(invoice);
        return status === "ready_to_send" || status === "draft" || status === "part_paid";
      })
      .map((invoice) => ({ type: "invoice", invoice }));
    const eventItems = billingReviewEvents().map((event) => ({ type: "billable_event", event }));
    return [...invoiceItems, ...eventItems];
  }

  function invoiceStatus(invoice) {
    if (!invoice) return "draft";
    if (invoice.isApiBacked) {
      return invoice.paymentState || invoice.invoiceStatus || invoice.status || "unknown";
    }
    if (invoice.status === "sent" && invoice.due_date && invoice.due_date < todayIso() && invoiceBalance(invoice) > 0) return "overdue";
    return invoice.status || "draft";
  }

  function statusChip(invoice) {
    const status = invoiceStatus(invoice);
    return chip(statusLabels[status] || status, statusTones[status] || "info");
  }

  function lineMeta(line, invoice) {
    const sourceEventId = line.source_billable_event_id || line.source_billable_event_ids?.[0];
    const sourceEvent = sourceEventId ? findBillable(sourceEventId) : null;
    const sourceContext = sourceEvent ? eventContext(sourceEvent) : {};
    const sourceDate = sourceContext.clean?.date || sourceContext.report?.completed_at?.slice(0, 10) || "";
    const dates = (line.service_dates || []).length ? line.service_dates.map(formatDate).join(", ") : (line.service_date ? formatDate(line.service_date) : (sourceDate ? formatDate(sourceDate) : ""));
    const parts = [
      dates,
      line.property_label || sourceContext.job?.address_label || invoiceServiceAddress(invoice),
      line.service_type || cleanTypeLabel(sourceContext.clean?.clean_type),
      line.source_reference ? `Source: ${line.source_reference}` : (sourceEvent ? `Source: ${sourceEvent.source_report_id || sourceEvent.source_scheduled_job_id || sourceEvent.id}` : "")
    ].filter(Boolean);
    return parts.join(" - ");
  }

  function lineCell(line, invoice) {
    const meta = lineMeta(line, invoice);
    return `<strong>${escapeHtml(line.description || "Invoice line")}</strong>${meta ? `<br><span class="muted">${escapeHtml(meta)}</span>` : ""}`;
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
    const { job, clean, report } = eventContext(event);
    const serviceDate = clean?.date || report?.completed_at?.slice(0, 10) || "";
    const property = job?.address_label || (job ? displayProperty(job.client_id, job.property_id) : "");
    const serviceType = cleanTypeLabel(clean?.clean_type) || job?.service_type || "Cleaning service";
    return {
      id: `line-${Date.now()}-${event.id}`,
      type: event.billing_type === "extra" ? "extra" : "service",
      source_billable_event_id: event.id,
      source_billable_event_ids: [event.id],
      description: event.description || serviceType || "Billable event",
      service_date: serviceDate,
      service_dates: serviceDate ? [serviceDate] : [],
      property_label: property,
      service_type: serviceType,
      source_reference: event.source_report_id || event.source_scheduled_job_id || "",
      quantity: 1,
      rate: Number(event.amount || 0),
      amount: Number(event.amount || 0)
    };
  }

  function linesFromEvents(events) {
    return events.map(lineFromEvent);
  }

  function createInvoiceFromEvents(scope = "invoice_only") {
    const events = selectedEvents();
    if (!events.length) return null;
    const first = eventContext(events[0]);
    const setup = first.setup || billingSetups()[0] || {};
    const settings = financeSettings();
    const billingDetails = state.pendingBillingDetails || billingDetailsFromSetup(setup, {
      client_id: first.job?.client_id || setup.client_id || "",
      property_id: first.job?.property_id || setup.property_id || ""
    });
    const invoice = {
      id: `inv-${Date.now()}`,
      invoice_ref: nextInvoiceRef(),
      client_id: first.job?.client_id || setup.client_id || "",
      property_id: first.job?.property_id || setup.property_id || "",
      billing_setup_id: setup.id || "",
      manual_billing: {
        billing_name: billingDetails.billing_name,
        invoice_email: billingDetails.invoice_email,
        billing_address: billingDetails.billing_address,
        service_address: billingDetails.service_address
      },
      status: "draft",
      source: "billable_events",
      period: "Selected billable events",
      invoice_date: billingDetails.invoice_date || todayIso(),
      issued_date: "",
      due_date: billingDetails.due_date || addDays(todayIso(), settings.default_payment_terms_days || 14),
      paid_date: "",
      paid_amount: 0,
      payment_terms: billingDetails.payment_terms || `${settings.default_payment_terms_days || 14} days`,
      reference: billingDetails.reference || "",
      notes: "Draft created from ready billable events.",
      source_billable_event_ids: events.map((event) => event.id),
      lines: linesFromEvents(events)
    };
    if (scope === "update_setup") applyBillingDetailsToSetup(setup.id ? setup : ensureBillingSetupForInvoice(invoice), billingDetails);
    invoices().unshift(invoice);
    settings.next_invoice_number = Number(settings.next_invoice_number || 3052) + 1;
    state.selectedInvoiceId = invoice.id;
    state.createMode = null;
    state.selectedEventIds = [];
    state.pendingBillingDetails = null;
    state.editorOpen = true;
    toast("Invoice draft created from billable events.");
    return invoice;
  }

  function createManualInvoice() {
    const selection = document.getElementById("invoice-manual-customer")?.value || manualCustomerOptions()[0]?.value || "new_customer";
    const { clientId, propertyId } = manualSelectionParts(selection);
    const setup = findBillingSetup(clientId, propertyId) || {};
    const settings = financeSettings();
    const billTo = document.getElementById("invoice-manual-bill-to")?.value || (clientId === "manual" ? "Manual customer" : displayClientById(clientId));
    const manualPhone = document.getElementById("invoice-manual-phone")?.value || "";
    const deliveryMethod = document.getElementById("invoice-manual-delivery-method")?.value || setup.delivery_method || "Email";
    const invoice = {
      id: `inv-${Date.now()}`,
      invoice_ref: nextInvoiceRef(),
      client_id: clientId,
      property_id: propertyId,
      billing_setup_id: setup.id || "",
      manual_billing: {
        billing_name: billTo,
        billing_address: document.getElementById("invoice-manual-billing-address")?.value || setup.billing_address || "Manual billing address",
        invoice_email: document.getElementById("invoice-manual-email")?.value || setup.invoice_email || "manual@example.test",
        service_address: document.getElementById("invoice-manual-service-address")?.value || displayProperty(clientId, propertyId)
      },
      status: "draft",
      source: "manual",
      period: "Manual invoice draft",
      invoice_date: document.getElementById("invoice-manual-date")?.value || todayIso(),
      issued_date: "",
      due_date: document.getElementById("invoice-manual-due-date")?.value || addDays(todayIso(), settings.default_payment_terms_days || 14),
      paid_date: "",
      paid_amount: 0,
      payment_terms: document.getElementById("invoice-manual-terms")?.value || `${settings.default_payment_terms_days || 14} days`,
      reference: document.getElementById("invoice-manual-reference")?.value || "",
      notes: "Manual invoice draft. Add invoice lines in the editor.",
      source_billable_event_ids: [],
      lines: []
    };
    invoice.manual_billing.phone = manualPhone;
    invoice.manual_billing.delivery_method = deliveryMethod;
    invoices().unshift(invoice);
    settings.next_invoice_number = Number(settings.next_invoice_number || 3052) + 1;
    state.selectedInvoiceId = invoice.id;
    state.createMode = null;
    state.editorOpen = true;
    toast("Manual invoice draft created.");
    return invoice;
  }

  function kpis() {
    const isApiBackedInvoices = invoices().some(invoice => invoice.isApiBacked);
    if (isApiBackedInvoices) {
      const sentUnpaid = invoices().filter((invoice) => ["sent", "part_paid"].includes(invoiceStatus(invoice))).reduce((total, invoice) => total + invoiceBalance(invoice), 0);
      const overdue = invoices().filter((invoice) => invoiceStatus(invoice) === "overdue").reduce((total, invoice) => total + invoiceBalance(invoice), 0);
      return [
        { label: "Ready to invoice", value: money(0) },
        { label: "Sent / unpaid", value: money(sentUnpaid) },
        { label: "Overdue", value: money(overdue) },
        { label: "Next 30 days forecast", value: money(0) }
      ];
    }

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
      { label: "Ready to invoice", value: money(ready) },
      { label: "Sent / unpaid", value: money(sentUnpaid) },
      { label: "Overdue", value: money(overdue) },
      { label: "Next 30 days forecast", value: money(forecast) }
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
    if (state.invoicesLoading || state.eventsLoading || state.paymentsLoading) return `<div class="pad" data-invoices-root="true"><span class="muted">Loading financial data...</span></div>`;
    if (state.invoicesError || state.eventsError || state.paymentsError) return `<div class="pad" data-invoices-root="true"><span class="muted">Could not load financial data.</span></div>`;
    if (invoices().length === 0 && billableEvents().length === 0 && (state.apiPayments || []).length === 0) return `<div class="pad" data-invoices-root="true"><span class="muted">No invoices, billable events, or payments found.</span></div>`;

    return `
      <section class="invoices-root" data-invoices-root="true">
        ${pageHead()}
        ${renderKpis()}
        ${renderActionPanel()}
        ${renderRegister()}
        ${renderPaymentsRegister()}
        ${state.createMode ? renderCreateLayer() : ""}
        ${state.editorOpen && selectedInvoice() ? renderEditor(selectedInvoice()) : ""}
        ${state.previewOpen && selectedInvoice() ? renderPreview(selectedInvoice()) : ""}
        ${state.modal ? renderModal() : ""}
        ${renderRowMenuOverlay()}
      </section>
    `;
  }

  function renderPaymentsRegister() {
    const apiPayments = state.apiPayments || [];
    if (apiPayments.length === 0) return "";

    const rows = apiPayments.map(payment => {
      const amount = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format((Number(payment.amountPence) || 0) / 100);
      const dateStr = payment.paidAt ? payment.paidAt.split("T")[0] : "-";
      const clientName = payment.customerName || "-";
      const invoiceRef = payment.invoiceDisplayRef || payment.invoiceId || "-";
      return `
        <tr>
          <td><strong>${escapeHtml(payment.reference || payment.id)}</strong><br><span class="muted">${escapeHtml(payment.paymentMethod || "-")}</span></td>
          <td>${escapeHtml(invoiceRef)}</td>
          <td>${escapeHtml(clientName)}</td>
          <td>${escapeHtml(amount)}</td>
          <td>${chip(payment.status || "Unknown", "info")}</td>
          <td>${escapeHtml(dateStr)}</td>
          <td><div class="row-menu-wrap"><span class="muted">Read-only</span></div></td>
        </tr>
      `;
    }).join("");

    return `
      <section class="invoice-register-panel panel pad" style="margin-top:24px;">
        <div class="panel-head compact-head">
          <div><h2>Payments</h2><p class="muted">Payments loaded from API.</p></div>
        </div>
        <table class="jobs-scheduled-table invoices-register-table">
          <thead><tr><th>Payment ref</th><th>Invoice ID</th><th>Client</th><th>Amount</th><th>Status</th><th>Paid date</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    `;
  }

  function pageHead() {
    const isApiBackedInvoices = invoices().some(invoice => invoice.isApiBacked);
    return `
      <div class="page-head">
        <div>
          <div class="title-row"><h1>Invoices</h1></div>
          <p class="muted" style="margin-top:10px">Create invoices from ready billable events, review draft documents, and track payment status.</p>
        </div>
        <div class="page-actions">${isApiBackedInvoices ? "" : `${button("New invoice", "open-create", "primary")} ${button("Finance settings", "finance-settings")}`}</div>
      </div>
    `;
  }

  function renderKpis() {
    return `<section class="grid-4 invoice-kpis">${kpis().map((item) => `
      <article class="metric invoice-kpi-card">
        <div class="invoice-kpi-main">
          <span class="muted">${escapeHtml(item.label)}</span>
          <strong>${escapeHtml(item.value)}</strong>
        </div>
      </article>
    `).join("")}</section>`;
  }

  function renderActionPanel() {
    const isApiBackedInvoices = invoices().some(invoice => invoice.isApiBacked);
    if (isApiBackedInvoices) {
      return `
        <section class="panel pad" style="margin-bottom: 24px;">
          <p class="muted">API invoices are read-only in this stage.</p>
        </section>
      `;
    }
    return `
      <section class="jobs-action-panel invoice-action-panel">
        ${renderActionColumn("Ready to invoice", groupedReadyCards(), renderReadyCard)}
        ${renderActionColumn("Needs action", needsActionItems(), renderNeedsActionCard)}
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

  function renderNeedsActionCard(item) {
    if (item.type === "invoice") return renderInvoiceActionCard(item.invoice);
    return renderReviewCard(item.event);
  }

  function renderInvoiceActionCard(invoice) {
    const status = invoiceStatus(invoice);
    const labels = {
      ready_to_send: "Ready to send",
      draft: "Draft needs review",
      part_paid: "Part-paid follow-up"
    };
    return `
      <button class="job-action-card" type="button" data-invoice-action="open-editor:${escapeHtml(invoice.id)}">
        <strong>${escapeHtml(invoice.invoice_ref)}</strong>
        <span>${escapeHtml(displayClientById(invoice.client_id))} - ${escapeHtml(invoiceServiceAddress(invoice))}</span>
        <span class="muted">${escapeHtml(`${money(invoiceTotal(invoice))} - ${labels[status] || statusLabels[status] || status}`)}</span>
        ${chip(labels[status] || statusLabels[status] || "Action", status === "ready_to_send" ? "info" : "warning")}
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
        <span>${escapeHtml(displayClientById(invoice.client_id))} - ${escapeHtml(invoiceServiceAddress(invoice))}</span>
        <span class="muted">${escapeHtml(`${money(invoiceBalance(invoice))} outstanding, due ${invoice.due_date || "not set"}`)}</span>
        ${chip("Chase", "danger")}
      </button>
    `;
  }

  function renderRegister() {
    const active = invoices().filter((invoice) => !["paid", "void"].includes(invoiceStatus(invoice)));
    const closed = invoices().filter((invoice) => ["paid", "void"].includes(invoiceStatus(invoice)));
    return `
      <section class="stack invoices-register-stack">
        ${renderInvoiceRegisterSection("Active invoices", "Draft, ready-to-send, sent, part-paid, and overdue invoices needing live tracking.", active, "primary")}
        ${renderInvoiceRegisterSection("Closed invoices", "Paid and void invoices remain available as history.", closed, "secondary")}
      </section>
    `;
  }

  function renderInvoiceRegisterSection(title, description, items, tone = "primary") {
    const rows = items.map((invoice) => {
      if (invoice.isApiBacked) {
        const nameParts = [invoice.firstName, invoice.lastName].filter(Boolean).join(" ");
        const clientName = invoice.customerName || invoice.companyName || nameParts || "Unknown customer";
        const propertyName = invoice.propertyLabel || invoice.propertyAddressLine1 || "Property pending";
        const total = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format((Number(invoice.grossTotalPence) || 0) / 100);
        const sourceLabel = invoice.sourceType === "manual" ? "Manual" : (invoice.incomeCategory || "Billable events").replace(/_/g, " ");
        const status = invoice.paymentState || invoice.invoiceStatus || "unknown";
        const dateStr = invoice.createdAt ? invoice.createdAt.split("T")[0] : "Draft";
        const dueDateStr = invoice.dueDate ? invoice.dueDate.split("T")[0] : "Not set";

        return `
          <tr data-invoice-row="${escapeHtml(invoice.id)}" tabindex="0" role="button">
            <td><strong>${escapeHtml(invoice.invoiceNumber || invoice.invoiceDisplayRef)}</strong><br><span class="muted">${escapeHtml(sourceLabel)}</span></td>
            <td>${escapeHtml(clientName)}<br><span class="muted">${escapeHtml(propertyName)}</span></td>
            <td>${escapeHtml("Current period")}</td>
            <td>${escapeHtml(total)}</td>
            <td>${chip(statusLabels[status] || status, statusTones[status] || "info")}</td>
            <td>${escapeHtml(dateStr)}</td>
            <td>${escapeHtml(dueDateStr)}</td>
            <td>${escapeHtml(invoice.paymentState === "paid" ? "Paid" : "-")}</td>
            <td>
              <div class="row-menu-wrap">
                <span class="muted">Read-only</span>
              </div>
            </td>
          </tr>
        `;
      }

      return `
      <tr data-invoice-row="${escapeHtml(invoice.id)}" data-invoice-action="open-editor:${escapeHtml(invoice.id)}" tabindex="0" role="button">
        <td><strong>${escapeHtml(invoice.invoice_ref)}</strong><br><span class="muted">${escapeHtml(invoice.source === "manual" ? "Manual" : "Billable events")}</span></td>
        <td>${escapeHtml(displayClientById(invoice.client_id))}<br><span class="muted">${escapeHtml(invoiceServiceAddress(invoice))}</span></td>
        <td>${escapeHtml(invoice.period || "Current period")}</td>
        <td>${escapeHtml(money(invoiceTotal(invoice)))}</td>
        <td>${statusChip(invoice)}</td>
        <td>${escapeHtml(invoice.issued_date || invoice.invoice_date || "Draft")}</td>
        <td>${escapeHtml(invoice.due_date || "Not set")}</td>
        <td>${escapeHtml(invoice.paid_date || (invoice.paid_amount ? "Part-paid" : "-"))}</td>
        <td>
          <div class="row-menu-wrap">
            <button class="button small" type="button" data-invoice-action="toggle-row-menu:${escapeHtml(invoice.id)}">Actions v</button>
          </div>
        </td>
      </tr>
      `;
    }).join("");
    return `
      <article class="panel invoices-register-panel${tone === "secondary" ? " secondary-register" : ""}">
        <div class="panel-head">
          <div><h2>${escapeHtml(title)}</h2><p class="muted">${escapeHtml(description)} Search/filter/sort/page-ready.</p></div>
          ${chip(`${items.length} invoices`, tone === "secondary" ? "muted" : "info")}
        </div>
        <div class="filters">
          <span class="inputish">Search invoices</span>
          <span class="selectish">${tone === "secondary" ? "Paid / void" : "Active statuses"}</span>
          <span class="selectish">Sort: due date</span>
          <span class="selectish">Page size: 25</span>
          <span class="selectish">Prev / Next</span>
        </div>
        <div class="quote-table-scroll">
          <table class="jobs-scheduled-table invoices-register-table">
            <thead><tr><th>Invoice ref</th><th>Client / property</th><th>Period / source</th><th>Amount</th><th>Status</th><th>Issued</th><th>Due</th><th>Paid</th><th>Actions</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="9"><span class="muted">No ${escapeHtml(title.toLowerCase())}.</span></td></tr>`}</tbody>
          </table>
        </div>
      </article>
    `;
  }

  function renderRowMenu(invoice) {
    const locked = invoice.status === "void";
    const apiBacked = !!invoice.isApiBacked;
    return `
      <div class="client-more-menu job-row-menu invoice-row-menu">
        <button type="button" data-invoice-action="open-editor:${escapeHtml(invoice.id)}">Open editor</button>
        <button type="button" data-invoice-action="preview:${escapeHtml(invoice.id)}">Preview document</button>
        ${!locked && !apiBacked ? `<button type="button" data-invoice-action="confirm-ready:${escapeHtml(invoice.id)}">Mark ready to send</button>` : ""}
        ${!locked && !apiBacked ? `<button type="button" data-invoice-action="confirm-sent:${escapeHtml(invoice.id)}">Mark sent</button>` : ""}
        ${!locked && !apiBacked ? `<button type="button" data-invoice-action="confirm-paid:${escapeHtml(invoice.id)}">Mark paid</button>` : ""}
        ${!locked && !apiBacked ? `<button type="button" data-invoice-action="part-paid:${escapeHtml(invoice.id)}">Mark part-paid</button>` : ""}
        ${!locked && !apiBacked ? `<button type="button" data-invoice-action="confirm-void:${escapeHtml(invoice.id)}">Void</button>` : ""}
        <button type="button" data-invoice-action="mock:Duplicate invoice">Duplicate mock</button>
      </div>
    `;
  }

  function renderRowMenuOverlay() {
    const invoice = state.rowMenuId ? findInvoice(state.rowMenuId) : null;
    if (!invoice) return "";
    const position = state.rowMenuPosition || {};
    const top = Number(position.top || 0);
    const left = Number(position.left || 0);
    return `
      <div class="invoice-row-menu-layer" style="top:${escapeHtml(top)}px;left:${escapeHtml(left)}px">
        ${renderRowMenu(invoice)}
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
      <section class="invoice-route-grid job-layer-content">
        <article class="panel pad invoice-route-card">
          <h2>Create from billable events</h2>
          <p class="muted" style="margin-top:8px">Select completed/approved billable events and create a draft invoice document.</p>
          <div class="request-note-block"><strong>Best for</strong><span>Recurring cleans, completed one-offs, approved extras, and reviewed reports.</span></div>
          <div class="button-row" style="margin-top:14px">${button("Select billable events", "create-events", "primary")}</div>
        </article>
        <article class="panel pad invoice-route-card">
          <h2>Manual invoice</h2>
          <p class="muted" style="margin-top:8px">Create a draft for a manual charge, deposit, correction, sundry work, or work without a quote/job.</p>
          <div class="request-note-block"><strong>Best for</strong><span>Non-cleaning charges, deposits, corrections, sundry work, or owner-approved manual billing.</span></div>
          <div class="button-row" style="margin-top:14px">${button("Start manual invoice", "create-manual")}</div>
        </article>
      </section>
    `;
  }

  function renderEventSelection() {
    const ready = readyBillableEvents();
    const previewEvents = state.selectedEventIds.length ? selectedEvents() : ready;
    const previewContext = previewEvents[0] ? eventContext(previewEvents[0]) : {};
    const previewSetup = previewContext.setup || billingSetups()[0] || {};
    const billingDefaults = billingDetailsFromSetup(previewSetup, {
      client_id: previewContext.job?.client_id || previewSetup.client_id || "",
      property_id: previewContext.job?.property_id || previewSetup.property_id || ""
    });
    const rows = ready.map((event) => {
      const context = eventContext(event);
      const checked = state.selectedEventIds.includes(event.id);
      return `
        <tr>
          <td><input type="checkbox" data-invoice-event="${escapeHtml(event.id)}"${checked ? " checked" : ""}></td>
          <td>${escapeHtml(context.clean ? formatVisitDate(context.clean) : "Completed work")}</td>
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
        <article class="panel pad">
          <h2>Billing / invoice details</h2>
          <p class="muted" style="margin-top:6px">Review or edit these details before creating the draft. Changes are not pushed back to the client/property unless you choose that in the confirmation.</p>
          <div class="job-plan-grid" style="margin-top:12px">
            <label class="client-field"><span>Bill-to name</span><input id="invoice-create-bill-to" value="${escapeHtml(billingDefaults.billing_name)}"></label>
            <label class="client-field"><span>Invoice email/contact</span><input id="invoice-create-email" value="${escapeHtml(billingDefaults.invoice_email)}"></label>
            <label class="client-field wide"><span>Billing address</span><input id="invoice-create-billing-address" value="${escapeHtml(billingDefaults.billing_address)}"></label>
            <label class="client-field wide"><span>Service address / work location</span><input id="invoice-create-service-address" value="${escapeHtml(billingDefaults.service_address)}"></label>
            <label class="client-field"><span>Invoice date</span><input id="invoice-create-invoice-date" type="date" value="${escapeHtml(billingDefaults.invoice_date)}"></label>
            <label class="client-field"><span>Due date</span><input id="invoice-create-due-date" type="date" value="${escapeHtml(billingDefaults.due_date)}"></label>
            <label class="client-field"><span>Payment terms</span><input id="invoice-create-terms" value="${escapeHtml(billingDefaults.payment_terms)}"></label>
            <label class="client-field"><span>Reference / PO / source</span><input id="invoice-create-reference" value="${escapeHtml(billingDefaults.reference)}"></label>
            <div class="request-note-block"><strong>Delivery</strong><span>${escapeHtml(previewSetup.delivery_method || "Email")}</span></div>
            <div class="request-note-block"><strong>Grouping</strong><span>${escapeHtml(previewSetup.grouping_rule || "Manual grouping")}</span></div>
            <div class="request-note-block wide"><strong>VAT status</strong><span>${escapeHtml(billingDefaults.vat_label)}</span></div>
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
    const options = manualCustomerOptions();
    const defaultValue = options[0]?.value || "new_customer";
    const defaultBilling = manualBillingDetailsForSelection(defaultValue);
    const customerOptions = options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("");
    return `
      <section class="job-layer-content">
        <article class="panel pad">
          <h2>Manual invoice setup</h2>
          <p class="muted" style="margin-top:6px">Choose an existing customer/property or + New customer, then review billing details before opening the editor.</p>
          <div class="job-plan-grid" style="margin-top:14px">
            <label class="client-field wide"><span>Customer / property</span><select id="invoice-manual-customer" data-invoice-manual-customer="true">${customerOptions}</select></label>
            <label class="client-field"><span>Bill-to / customer name</span><input id="invoice-manual-bill-to" value="${escapeHtml(defaultBilling.billing_name)}"></label>
            <label class="client-field"><span>Invoice email / contact</span><input id="invoice-manual-email" value="${escapeHtml(defaultBilling.invoice_email)}"></label>
            <label class="client-field"><span>Phone optional</span><input id="invoice-manual-phone" value="${escapeHtml(defaultBilling.phone)}"></label>
            <label class="client-field wide"><span>Service address / work location</span><input id="invoice-manual-service-address" value="${escapeHtml(defaultBilling.service_address)}"></label>
            <label class="client-field wide"><span>Billing address</span><input id="invoice-manual-billing-address" value="${escapeHtml(defaultBilling.billing_address)}"></label>
            <label class="client-field"><span>Payment terms</span><input id="invoice-manual-terms" value="${escapeHtml(defaultBilling.payment_terms)}"></label>
            <label class="client-field"><span>Delivery method</span><select id="invoice-manual-delivery-method"><option${defaultBilling.delivery_method === "Email" ? " selected" : ""}>Email</option><option${defaultBilling.delivery_method === "Print / post later" ? " selected" : ""}>Print / post later</option><option${defaultBilling.delivery_method === "Customer portal later" ? " selected" : ""}>Customer portal later</option></select></label>
            <label class="client-field"><span>Reference / PO if needed</span><input id="invoice-manual-reference" value="${escapeHtml(defaultBilling.reference)}"></label>
            <div class="request-note-block"><strong>VAT status</strong><span>${escapeHtml(financeSettings().vat_label || "VAT: Not applicable")}</span></div>
          </div>
          <div class="request-note-block" style="margin-top:14px"><strong>Line items happen next</strong><span>This setup creates a blank manual draft. Add service lines, discounts, adjustments, or cancellation fees in the invoice editor.</span></div>
        </article>
        <div class="job-editor-actions">
          ${button("Back", "open-create")}
          ${button("Create manual draft", "confirm-create-manual", "primary")}
        </div>
      </section>
    `;
  }

  function renderEditor(invoice) {
    const setup = invoiceBillingSetup(invoice);
    return `
      <div class="job-layer-backdrop">
        <article class="job-layer-shell invoice-layer-shell" role="dialog" aria-modal="true">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Invoice editor</p>
              <h2>${escapeHtml(invoice.invoice_ref)}</h2>
              <p class="muted" style="margin-top:6px">${escapeHtml(displayClientById(invoice.client_id))} - ${escapeHtml(invoiceServiceAddress(invoice))}</p>
            </div>
            ${button("Close", "close-editor")}
          </div>
          <section class="grid-detail job-layer-content">
            <div class="stack">
              <article class="panel pad">
                <div class="panel-head compact-head">
                  <h2>Client / billing details</h2>
                  ${button("Edit billing details", `edit-billing:${invoice.id}`, "small")}
                </div>
                <div class="job-plan-grid" style="margin-top:12px">
                  <div class="request-note-block"><strong>Bill to</strong><span>${escapeHtml(setup.billing_name || displayClientById(invoice.client_id))}</span></div>
                  <div class="request-note-block"><strong>Invoice email</strong><span>${escapeHtml(setup.invoice_email || "Not set")}</span></div>
                  <div class="request-note-block wide"><strong>Billing address</strong><span>${escapeHtml(setup.billing_address || "Billing address not set")}</span></div>
                  <div class="request-note-block wide"><strong>Service address</strong><span>${escapeHtml(setup.service_address || invoiceServiceAddress(invoice))}</span></div>
                  <div class="request-note-block"><strong>Payment terms</strong><span>${escapeHtml(invoice.payment_terms || setup.payment_terms || "14 days")}</span></div>
                  <div class="request-note-block"><strong>Due date</strong><span>${escapeHtml(invoice.due_date || "Not set")}</span></div>
                  <div class="request-note-block"><strong>Reference / PO</strong><span>${escapeHtml(invoice.reference || setup.po_reference || "Not set")}</span></div>
                  <div class="request-note-block"><strong>VAT status</strong><span>${escapeHtml(financeSettings().vat_label || "VAT: Not applicable")}</span></div>
                </div>
              </article>
              <article class="panel">
                <div class="panel-head">
                  <div><h2>Invoice lines</h2><p class="muted">Each billable event stays traceable as its own invoice line.</p></div>
                  ${chip(`${(invoice.lines || []).length} lines`, "info")}
                </div>
                <div class="filters">
                  ${button("Add line", "mock:Add invoice line", "small")}
                  ${button("Add discount", "mock:Add invoice discount", "small")}
                  ${button("Add adjustment", "mock:Add invoice adjustment", "small")}
                  ${button("Add cancellation fee", "mock:Add cancellation fee", "small")}
                </div>
                <div class="quote-table-scroll">
                  <table class="jobs-scheduled-table">
                    <thead><tr><th>Type</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
                    <tbody>${(invoice.lines || []).map((line) => `
                      <tr>
                        <td>${escapeHtml(lineTypeLabels[line.type] || line.type || "Line")}</td>
                        <td>${lineCell(line, invoice)}</td>
                        <td>${escapeHtml(line.quantity || 1)}</td>
                        <td>${escapeHtml(money(line.rate))}</td>
                        <td>${escapeHtml(money(line.amount))}</td>
                      </tr>
                    `).join("") || `<tr><td colspan="5"><span class="muted">No invoice lines yet. Add a line to build this invoice.</span></td></tr>`}</tbody>
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
            ${invoice.status !== "void" && !invoice.isApiBacked ? button("Mark ready to send", `confirm-ready:${invoice.id}`) : ""}
            ${invoice.status !== "void" && !invoice.isApiBacked ? button("Mark sent mock", `confirm-sent:${invoice.id}`, "primary") : ""}
            ${button("Close", "close-editor")}
          </div>
        </article>
      </div>
    `;
  }

  function renderPreview(invoice) {
    const setup = invoiceBillingSetup(invoice);
    const settings = financeSettings();
    return `
      <div class="a4-document-backdrop">
        <div class="invoice-preview-shell">
          <div class="invoice-preview-toolbar no-print">
            <div>
              <p class="eyebrow">Invoice preview</p>
              <h2>${escapeHtml(invoice.invoice_ref)}</h2>
            </div>
            <div class="button-row">
              ${button("Print/export later", "mock:Print/export invoice document")}
              ${button("Close", "close-preview", "primary")}
            </div>
          </div>
        <article class="a4-document invoice-document-preview">
          <div class="a4-header">
            <div>
              <h1>${escapeHtml(settings.trading_name || "PandaZen Cleaning")}</h1>
              <p>${escapeHtml(settings.registered_address || "")}</p>
              <p>${escapeHtml(settings.email || "")} - ${escapeHtml(settings.phone || "")}</p>
              <p>${escapeHtml(settings.legal_name || "")}${settings.company_number ? ` - Company no. ${escapeHtml(settings.company_number)}` : ""}</p>
            </div>
            <div class="invoice-preview-meta">
              <h2>Invoice</h2>
              <p><strong>${escapeHtml(invoice.invoice_ref)}</strong></p>
              <p>Invoice date: ${escapeHtml(invoice.invoice_date || todayIso())}</p>
              <p>Due date: ${escapeHtml(invoice.due_date || "Not set")}</p>
            </div>
          </div>
          <div class="a4-client-block">
            <div>
              <h3>Bill to</h3>
              <p>${escapeHtml(setup.billing_name || displayClientById(invoice.client_id))}</p>
              <p>${escapeHtml(setup.billing_address || displayProperty(invoice.client_id, invoice.property_id))}</p>
              <p>${escapeHtml(setup.invoice_email || "")}</p>
            </div>
            <div>
              <h3>Service address / reference</h3>
              <p>${escapeHtml(invoiceServiceAddress(invoice))}</p>
              <p>${escapeHtml(invoice.period || "Current period")}</p>
              <p>${escapeHtml(invoice.source === "manual" ? "Manual invoice" : "From approved billable events")}</p>
            </div>
          </div>
          <table class="invoice-preview-lines">
            <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>${(invoice.lines || []).map((line) => `<tr><td>${lineCell(line, invoice)}</td><td>${escapeHtml(line.quantity || 1)}</td><td>${escapeHtml(money(line.rate))}</td><td>${escapeHtml(money(line.amount))}</td></tr>`).join("")}</tbody>
          </table>
          <div class="invoice-preview-totals">
            <div class="field-row"><span>Subtotal</span><strong>${escapeHtml(money(invoiceTotal(invoice)))}</strong></div>
            <div class="field-row"><span>VAT</span><strong>${escapeHtml(settings.vat_label || "VAT: Not applicable")}</strong></div>
            <div class="field-row"><span>Total</span><strong>${escapeHtml(money(invoiceTotal(invoice)))}</strong></div>
          </div>
          <section class="invoice-preview-payment">
            <h3>Payment instructions</h3>
            <p>${escapeHtml(settings.payment_instructions || "Payment instructions not set")}</p>
          </section>
          <p class="invoice-preview-footer">${escapeHtml(settings.footer_text || "")}</p>
        </article>
        </div>
      </div>
    `;
  }

  function renderModal() {
    const modal = state.modal;
    if (modal.type === "partPaid") return renderPartPaidModal(modal.invoiceId);
    if (modal.type === "billingChoice") return renderBillingChoiceModal(modal);
    if (modal.type === "billingEdit") return renderBillingEditModal(modal);
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

  function renderBillingChoiceModal(modal) {
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal" role="dialog" aria-modal="true">
          <h2>${escapeHtml(modal.title || "Use edited billing details?")}</h2>
          <p class="muted" style="margin-top:8px">${escapeHtml(modal.copy || "Choose whether these mock billing details apply to this invoice only or also update the client/property billing setup mock.")}</p>
          <div class="request-note-block" style="margin-top:14px"><strong>Boundary</strong><span>No backend or real client/property record is updated in Invoices v0.</span></div>
          <div class="button-row" style="margin-top:16px">
            ${button("Cancel", "close-modal")}
            ${button("Use for this invoice only", `${modal.invoiceOnlyAction}`, "primary")}
            ${button("Update client/property billing setup mock", `${modal.updateSetupAction}`)}
          </div>
        </article>
      </div>
    `;
  }

  function renderBillingEditModal(modal) {
    const invoice = findInvoice(modal.invoiceId);
    const details = billingDetailsFromSetup(invoice ? invoiceBillingSetup(invoice) : {}, invoice || {});
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal invoice-billing-modal" role="dialog" aria-modal="true">
          <h2>Edit billing details</h2>
          <p class="muted" style="margin-top:8px">Mock edit only. Choose whether changes apply to this invoice or also update the client/property billing setup mock.</p>
          <div class="job-plan-grid" style="margin-top:14px">
            <label class="client-field"><span>Bill-to</span><input id="invoice-edit-bill-to" value="${escapeHtml(details.billing_name)}"></label>
            <label class="client-field"><span>Invoice email</span><input id="invoice-edit-email" value="${escapeHtml(details.invoice_email)}"></label>
            <label class="client-field wide"><span>Billing address</span><input id="invoice-edit-billing-address" value="${escapeHtml(details.billing_address)}"></label>
            <label class="client-field wide"><span>Service address</span><input id="invoice-edit-service-address" value="${escapeHtml(details.service_address)}"></label>
            <label class="client-field"><span>Invoice date</span><input id="invoice-edit-invoice-date" type="date" value="${escapeHtml(details.invoice_date)}"></label>
            <label class="client-field"><span>Due date</span><input id="invoice-edit-due-date" type="date" value="${escapeHtml(details.due_date)}"></label>
            <label class="client-field"><span>Payment terms</span><input id="invoice-edit-terms" value="${escapeHtml(details.payment_terms)}"></label>
            <label class="client-field"><span>Reference / PO</span><input id="invoice-edit-reference" value="${escapeHtml(details.reference)}"></label>
            <div class="request-note-block wide"><strong>VAT status</strong><span>${escapeHtml(details.vat_label)}</span></div>
          </div>
          <div class="button-row" style="margin-top:16px">
            ${button("Cancel", "close-modal")}
            ${button("Apply to this invoice only", `apply-billing-invoice:${escapeHtml(modal.invoiceId)}`, "primary")}
            ${button("Update client/property billing setup mock", `apply-billing-setup:${escapeHtml(modal.invoiceId)}`)}
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

  function rowMenuPositionFor(target) {
    const rect = target?.getBoundingClientRect?.();
    if (!rect) return { top: 0, left: 0 };
    const menuWidth = 220;
    const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 1200;
    const left = Math.max(8, Math.min(rect.right - menuWidth, viewportWidth - menuWidth - 8));
    return { top: Math.round(rect.bottom + 6), left: Math.round(left) };
  }

  function closeRowMenu() {
    state.rowMenuId = null;
    state.rowMenuPosition = null;
  }

  function handleClick(event) {
    const row = event.target.closest("[data-invoice-row]");
    if (row && !event.target.closest("[data-invoice-action]")) {
      const invoiceId = row.dataset.invoiceRow;
      const invoice = invoices().find(i => String(i.id) === String(invoiceId));
      if (invoice && invoice.isApiBacked) {
        toast("API invoices are read-only in this view.");
        return true;
      }
      state.selectedInvoiceId = invoiceId;
      state.editorOpen = true;
      closeRowMenu();
      refresh();
      event.preventDefault();
      return true;
    }

    const target = event.target.closest("[data-invoice-action]");
    if (!target) {
      if (state.rowMenuId) {
        closeRowMenu();
        refresh();
      }
      return false;
    }
    const action = target.dataset.invoiceAction;
    event.preventDefault();

    if (action.includes(":")) {
      const parts = action.split(":");
      const prefix = parts[0] + ":";
      const iId = parts.slice(1).join(":");
      const guardedPrefixes = [
        "open-editor:",
        "preview:",
        "confirm-ready:",
        "confirm-sent:",
        "confirm-paid:",
        "part-paid:",
        "confirm-void:",
        "duplicate-invoice:"
      ];
      if (guardedPrefixes.includes(prefix)) {
        const i = invoices().find(x => String(x.id) === String(iId));
        if (i && i.isApiBacked) {
          toast("API invoices are read-only in this view.");
          return true;
        }
      }
    }
    event.stopPropagation();

    if (!action.startsWith("toggle-row-menu:") && state.rowMenuId) {
      closeRowMenu();
    }

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
      state.pendingBillingDetails = null;
      refresh();
      return true;
    }
    if (action === "confirm-create-events") {
      readSelectedEvents();
      if (!state.selectedEventIds.length) {
        state.modal = {
          type: "mock",
          title: "Select billable events first",
          copy: "Choose one or more ready billable events before creating an invoice draft.",
          detail: "Invoices v0 keeps selection manual so one billable event cannot accidentally be placed on two active invoices."
        };
        refresh();
        return true;
      }
      state.pendingBillingDetails = readBillingDetails("invoice-create");
      state.modal = {
        type: "billingChoice",
        title: "Use edited billing details?",
        copy: `Create one invoice draft from ${state.selectedEventIds.length} selected billable event${state.selectedEventIds.length === 1 ? "" : "s"} using the billing details currently shown.`,
        invoiceOnlyAction: "create-events-draft:invoice_only",
        updateSetupAction: "create-events-draft:update_setup"
      };
      refresh();
      return true;
    }
    if (action.startsWith("create-events-draft")) {
      const scope = action.split(":")[1] || "invoice_only";
      createInvoiceFromEvents(scope);
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
      const events = readyBillableEvents().filter((event) => groupKeyForEvent(event) === key);
      if (events.some(event => event.isApiBacked)) {
        toast("API billable events are read-only and cannot be invoiced yet.");
        return true;
      }
      state.createMode = "events";
      state.selectedEventIds = events.map((event) => event.id);
      refresh();
      return true;
    }
    if (action.startsWith("review-event:")) {
      const eventItem = findBillable(action.split(":")[1]);
      if (eventItem && eventItem.isApiBacked) {
        toast("API billable events are read-only in this view.");
        return true;
      }
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
      if (state.rowMenuId === id) {
        closeRowMenu();
      } else {
        state.rowMenuId = id;
        state.rowMenuPosition = rowMenuPositionFor(target);
      }
      refresh();
      return true;
    }
    if (action.startsWith("open-editor:")) {
      state.selectedInvoiceId = action.split(":")[1];
      state.editorOpen = true;
      state.previewOpen = false;
      closeRowMenu();
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
    if (action.startsWith("edit-billing:")) {
      state.modal = { type: "billingEdit", invoiceId: action.split(":")[1] };
      refresh();
      return true;
    }
    if (action.startsWith("apply-billing-invoice:")) {
      const invoice = findInvoice(action.split(":")[1]);
      applyBillingDetailsToInvoice(invoice, readBillingDetails("invoice-edit"));
      state.modal = null;
      toast("Billing details applied to this invoice only.");
      refresh();
      return true;
    }
    if (action.startsWith("apply-billing-setup:")) {
      const invoice = findInvoice(action.split(":")[1]);
      const details = readBillingDetails("invoice-edit");
      applyBillingDetailsToInvoice(invoice, details);
      if (invoice) applyBillingDetailsToSetup(ensureBillingSetupForInvoice(invoice), details);
      state.modal = null;
      toast("Billing details applied to this invoice and billing setup mock.");
      refresh();
      return true;
    }
    if (action.startsWith("preview:")) {
      state.selectedInvoiceId = action.split(":")[1];
      state.previewOpen = true;
      closeRowMenu();
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

  function handleChange(event) {
    const target = event.target;
    if (target?.matches?.("[data-invoice-manual-customer]")) {
      writeManualBillingFields(manualBillingDetailsForSelection(target.value));
      return true;
    }
    return false;
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);

  window.CleanOpsInvoices = {
    render,
    handleClick,
    handleChange
  };

  async function loadInvoices() {
    try {
      const api = await import("./api.js");
      const fetched = await api.fetchInvoices();
      state.apiInvoices = fetched.map(inv => {
        return {
          ...inv,
          isApiBacked: true,
          status: inv.paymentState || inv.invoiceStatus || "unknown",
          invoice_ref: inv.invoiceNumber,
          client_id: inv.customerId,
          property_id: inv.propertyId,
          invoice_date: inv.createdAt ? inv.createdAt.substring(0, 10) : "",
          issued_date: inv.createdAt ? inv.createdAt.substring(0, 10) : "",
          due_date: inv.dueDate || "",
          paid_date: (inv.paymentState === "paid" || inv.invoiceStatus === "paid") ? (inv.updatedAt ? inv.updatedAt.substring(0, 10) : "") : "",
          paid_amount: (inv.paymentState === "paid" || inv.invoiceStatus === "paid") ? (inv.grossTotal !== undefined ? Number(inv.grossTotal || 0) : Number(inv.grossTotalPence || 0) / 100) : 0,
          lines: []
        };
      });
      state.invoicesError = false;
    } catch (err) {
      console.error("Failed to load invoices", err);
      state.invoicesError = true;
      state.apiInvoices = [];
    } finally {
      state.invoicesLoading = false;
      const root = document.querySelector("[data-invoices-root]");
      if (root) {
        root.outerHTML = render();
      }
    }
  }

  async function loadBillableEvents() {
    try {
      const api = await import("./api.js");
      const fetched = await api.fetchBillableEvents();
      state.apiBillableEvents = fetched.map(event => {
        return {
          ...event,
          isApiBacked: true,
          status: event.status || "draft",
          amount: event.amount !== undefined ? Number(event.amount || 0) : Number(event.amountPence || 0) / 100,
          description: event.description || "API Billable Event",
          source_job_id: event.jobId,
          source_report_id: event.reportId,
          source_scheduled_job_id: event.visitId
        };
      });
      state.eventsError = false;
    } catch (err) {
      console.error("Failed to load billable events", err);
      state.eventsError = true;
      state.apiBillableEvents = [];
    } finally {
      state.eventsLoading = false;
      const root = document.querySelector("[data-invoices-root]");
      if (root) {
        root.outerHTML = render();
      }
    }
  }

  async function loadPayments() {
    try {
      const api = await import("./api.js");
      const fetched = await api.fetchPayments();
      state.apiPayments = fetched.map(payment => {
        return {
          ...payment,
          isApiBacked: true
        };
      });
      state.paymentsError = false;
    } catch (err) {
      console.error("Failed to load payments", err);
      state.paymentsError = true;
      state.apiPayments = [];
    } finally {
      state.paymentsLoading = false;
      const root = document.querySelector("[data-invoices-root]");
      if (root) {
        root.outerHTML = render();
      }
    }
  }

  loadInvoices();
  loadBillableEvents();
  loadPayments();
})();
