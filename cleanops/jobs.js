(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedJobId: null,
    editorOpen: false,
    layer: null,
    layerId: null,
    modal: null,
    rowMenuId: null,
    visitWizard: null
  };

  const serviceTypeLabels = {
    "Regular domestic clean": "Regular domestic clean",
    "End of tenancy clean": "End of tenancy clean",
    "Commercial cleaning": "Commercial cleaning",
    "Monthly deep clean": "Monthly deep clean",
    "Oven clean extra": "Oven clean extra"
  };

  const statusLabels = {
    setup: "Needs setup",
    active: "Active",
    paused: "Paused",
    completed: "Completed",
    cancelled: "Cancelled",
    planned: "Planned",
    needs_review: "Needs review",
    skipped: "Skipped",
    ready_to_bill: "Ready to bill",
    draft: "Draft",
    invoiced: "Invoiced",
    not_billable: "Not billable"
  };

  const statusTones = {
    setup: "warning",
    active: "success",
    paused: "warning",
    completed: "muted",
    cancelled: "danger",
    planned: "info",
    needs_review: "warning",
    skipped: "muted",
    ready_to_bill: "success",
    draft: "warning",
    invoiced: "muted",
    not_billable: "muted"
  };

  const severityTones = {
    Note: "info",
    "Extra time": "warning",
    "Access issue": "warning",
    Complaint: "danger",
    Urgent: "danger"
  };

  function source() {
    if (!data.jobsV0) {
      data.jobsV0 = { jobPlans: [], scheduledJobs: [], checklistTemplates: [], jobReports: [], billableEvents: [] };
    }
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
    return `<button class="${classes}" type="button" data-job-action="${escapeHtml(action)}">${escapeHtml(label)}</button>`;
  }

  function iconButton(label, action) {
    return `<button class="icon-button" type="button" data-job-action="${escapeHtml(action)}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">X</button>`;
  }

  function toast(message) {
    window.CleanOpsShell?.toast?.(message);
  }

  function jobs() {
    return source().jobPlans || [];
  }

  function scheduledJobs() {
    return source().scheduledJobs || [];
  }

  function reports() {
    return source().jobReports || [];
  }

  function billableEvents() {
    return source().billableEvents || [];
  }

  function templates() {
    return source().checklistTemplates || [];
  }

  function clients() {
    return data.clients || [];
  }

  function quotes() {
    return data.quotes || [];
  }

  function requests() {
    return data.requests || [];
  }

  function findJob(id) {
    return jobs().find((job) => job.id === id) || null;
  }

  function selectedJob() {
    return state.selectedJobId ? findJob(state.selectedJobId) : null;
  }

  function findClient(id) {
    return clients().find((client) => client.id === id) || null;
  }

  function findProperty(clientId, propertyId) {
    const client = findClient(clientId);
    return client?.properties?.find((property) => property.id === propertyId) || null;
  }

  function findQuote(id) {
    return quotes().find((quote) => quote.id === id || quote.quote_id === id) || null;
  }

  function findRequest(id) {
    return requests().find((request) => request.id === id) || null;
  }

  function findScheduled(id) {
    return scheduledJobs().find((clean) => clean.id === id) || null;
  }

  function findTemplate(id) {
    return templates().find((template) => template.id === id) || null;
  }

  function findReport(id) {
    return reports().find((report) => report.id === id) || null;
  }

  function findReportForScheduled(scheduledId) {
    return reports().find((report) => report.scheduled_job_id === scheduledId) || null;
  }

  function reportBillable(report) {
    if (!report) return null;
    return billableEvents().find((event) => event.source_report_id === report.id)
      || findBillableForScheduled(report.scheduled_job_id)
      || null;
  }

  function findBillable(id) {
    return billableEvents().find((event) => event.id === id) || null;
  }

  function findBillableForScheduled(scheduledId) {
    return billableEvents().find((event) => event.source_scheduled_job_id === scheduledId) || null;
  }

  function jobClient(job) {
    return findClient(job.client_id);
  }

  function jobProperty(job) {
    return findProperty(job.client_id, job.property_id);
  }

  function jobScheduled(jobId) {
    return scheduledJobs().filter((clean) => clean.job_id === jobId);
  }

  function jobReports(jobId) {
    return reports().filter((report) => report.job_id === jobId);
  }

  function visibleScheduledForWorkspace(jobId) {
    const all = jobScheduled(jobId).sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`));
    const active = all.filter((clean) => clean.status !== "completed");
    const latestCompleted = all
      .filter((clean) => clean.status === "completed")
      .sort((a, b) => `${b.date} ${b.start_time}`.localeCompare(`${a.date} ${a.start_time}`))[0];
    return latestCompleted ? [...active, latestCompleted].sort((a, b) => `${a.date} ${a.start_time}`.localeCompare(`${b.date} ${b.start_time}`)) : active;
  }

  function hiddenCompletedCount(jobId) {
    const completed = jobScheduled(jobId).filter((clean) => clean.status === "completed").length;
    return Math.max(0, completed - 1);
  }

  function recentReportItems(jobId) {
    return jobReports(jobId)
      .sort((a, b) => String(b.completed_at || "").localeCompare(String(a.completed_at || "")))
      .slice(0, 5);
  }

  function jobBillables(jobId) {
    return billableEvents().filter((event) => event.source_job_id === jobId);
  }

  function money(value) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP"
    }).format(Number(value || 0));
  }

  function moneyText(value) {
    return String(value || "")
      .replace(/\u00c2\u00a3/g, "\u00a3")
      .replace(/\bGBP\s*([0-9]+(?:\.[0-9]{1,2})?)/g, (_, amount) => money(amount));
  }

  function minutesLabel(value) {
    const minutes = Number(value || 0);
    if (!minutes) return "To confirm";
    if (minutes % 60 === 0) {
      const hours = minutes / 60;
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  }

  function statusChip(value) {
    return chip(statusLabels[value] || value || "To confirm", statusTones[value] || "info");
  }

  function cleanTypeLabel(value) {
    const labels = {
      initial: "Initial clean",
      regular: "Regular clean",
      extra: "Extra",
      one_off: "One-off clean"
    };
    return labels[value] || value || "Clean";
  }

  function jobTypeLabel(value) {
    const labels = {
      one_off: "One-off",
      recurring: "Recurring",
      commercial: "Commercial"
    };
    return labels[value] || value || "Job";
  }

  function displayClient(client) {
    return client?.display_name || client?.name || "Client not linked";
  }

  function displayProperty(property) {
    return property?.label || property?.name || property?.address || "Property not linked";
  }

  function priceFor(job, pricingItemId) {
    return job.pricing_items?.find((item) => item.id === pricingItemId) || null;
  }

  function isoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function parseDate(value) {
    const [year, month, day] = String(value || isoDate(new Date())).split("-").map(Number);
    if (!year || !month || !day) return new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
    return new Date(Date.UTC(year, month - 1, day));
  }

  function addDays(value, days) {
    const next = parseDate(value);
    next.setUTCDate(next.getUTCDate() + days);
    return isoDate(next);
  }

  function addMonths(value, months) {
    const next = parseDate(value);
    next.setUTCMonth(next.getUTCMonth() + months);
    return isoDate(next);
  }

  function dayNameFromDate(value) {
    return parseDate(value).toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" });
  }

  function shortDayName(value) {
    return parseDate(value).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
  }

  function visitDateLabel(date, time = "") {
    return `${date} - ${shortDayName(date)}${time ? ` - ${time}` : ""}`;
  }

  function alignDateToDay(value, dayName) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const target = days.indexOf(dayName);
    if (target < 0) return value;
    const date = parseDate(value);
    const current = date.getUTCDay();
    const offset = (target - current + 7) % 7;
    date.setUTCDate(date.getUTCDate() + offset);
    return isoDate(date);
  }

  function frequencyDays(value) {
    const days = { weekly: 7, fortnightly: 14, "4-weekly": 28, monthly: 30, one_off: 0 };
    return days[value] ?? 7;
  }

  function frequencyForJob(job) {
    return job?.recurrence?.toLowerCase().includes("fortnight")
      ? "fortnightly"
      : job?.recurrence?.toLowerCase().includes("4-week")
        ? "4-weekly"
        : job?.recurrence?.toLowerCase().includes("month")
          ? "monthly"
          : "weekly";
  }

  function nextDateForFrequency(value, frequency) {
    return frequency === "monthly" ? addMonths(value, 1) : addDays(value, frequencyDays(frequency) || 7);
  }

  function latestScheduled(jobId) {
    return jobScheduled(jobId).sort((a, b) => `${b.date} ${b.start_time}`.localeCompare(`${a.date} ${a.start_time}`))[0] || null;
  }

  function defaultTemplateFor(job, cleanType = "regular") {
    const preferred = job.checklist_template_ids?.map(findTemplate).find((template) => template?.clean_type === cleanType);
    return preferred || job.checklist_template_ids?.map(findTemplate).filter(Boolean)[0] || null;
  }

  function defaultPricingFor(job, cleanType = "regular") {
    return job.pricing_items?.find((item) => item.billing_type === "recurring" || item.billing_type === cleanType) || job.pricing_items?.[0] || null;
  }

  function initVisitWizard(job, mode = "recurring") {
    const last = latestScheduled(job.id);
    const defaultStart = last ? addDays(last.date, job.job_type === "recurring" ? 7 : 1) : isoDate(new Date());
    const cleanType = mode === "one_off" || job.job_type === "one_off" ? "one_off" : "regular";
    const template = defaultTemplateFor(job, cleanType);
    const pricing = defaultPricingFor(job, cleanType);
    state.visitWizard = {
      step: 1,
      mode,
      startDate: defaultStart,
      startTime: last?.start_time || "09:00",
      frequency: mode === "one_off" || job.job_type === "one_off" ? "one_off" : frequencyForJob(job),
      dayOfWeek: dayNameFromDate(defaultStart),
      duration: job.default_duration_minutes || 120,
      team: job.default_staff || "Unassigned",
      window: mode === "one_off" ? "one_off" : "next_1_month",
      customEndDate: addMonths(defaultStart, 1),
      attachChecklist: true,
      usePricing: true,
      checklistTemplateId: template?.id || "",
      pricingItemId: pricing?.id || "",
      preview: []
    };
    return state.visitWizard;
  }

  function wizardFromDom() {
    const current = state.visitWizard || {};
    const value = (name, fallback = "") => document.querySelector(`[data-visit-wizard="${name}"]`)?.value || current[name] || fallback;
    const checked = (name) => Boolean(document.querySelector(`[data-visit-wizard="${name}"]`)?.checked);
    state.visitWizard = {
      ...current,
      startDate: value("startDate", isoDate(new Date())),
      startTime: value("startTime", "09:00"),
      frequency: value("frequency", "weekly"),
      dayOfWeek: value("dayOfWeek", "Friday"),
      duration: Number(value("duration", "120")) || 120,
      team: value("team", "Unassigned"),
      window: value("window", "next_1_month"),
      customEndDate: value("customEndDate", addMonths(value("startDate", isoDate(new Date())), 1)),
      attachChecklist: checked("attachChecklist"),
      usePricing: checked("usePricing")
    };
    return state.visitWizard;
  }

  function mockFlagsForVisit(job, date, index) {
    const flags = [];
    if (date.endsWith("-12")) flags.push("Already booked");
    if (date.endsWith("-25") || date.endsWith("-26")) flags.push("Bank holiday");
    if (job.default_staff === "Unassigned" || index === 2) flags.push("Team unavailable");
    if ((state.visitWizard?.startTime || "").startsWith("18")) flags.push("Outside normal hours");
    if (index === 3) flags.push("Client holiday note");
    return flags;
  }

  function buildVisitPreview(job) {
    const wizard = state.visitWizard || initVisitWizard(job);
    const cleanType = wizard.frequency === "one_off" ? "one_off" : "regular";
    const template = wizard.attachChecklist ? findTemplate(wizard.checklistTemplateId) || defaultTemplateFor(job, cleanType) : null;
    const pricing = wizard.usePricing ? priceFor(job, wizard.pricingItemId) || defaultPricingFor(job, cleanType) : null;
    const stepDays = frequencyDays(wizard.frequency);
    const limit = wizard.frequency === "one_off"
      ? 1
      : wizard.window === "next_3_months"
        ? 12
        : wizard.window === "custom"
          ? 16
          : 5;
    const endDate = wizard.window === "custom" ? wizard.customEndDate : addMonths(wizard.startDate, wizard.window === "next_3_months" ? 3 : 1);
    const visits = [];
    let date = wizard.frequency === "one_off" ? wizard.startDate : alignDateToDay(wizard.startDate, wizard.dayOfWeek);
    for (let index = 0; index < limit; index += 1) {
      if (wizard.window === "custom" && date > endDate) break;
      visits.push({
        index,
        date,
        start_time: wizard.startTime,
        clean_type: cleanType,
        assigned_staff: wizard.team,
        duration_minutes: wizard.duration,
        checklist_template_id: template?.id || "",
        checklist_label: template?.name || "No checklist attached",
        pricing_item_id: pricing?.id || "",
        pricing_label: pricing?.label || "No pricing item",
        flags: mockFlagsForVisit(job, date, index),
        skip: false,
        reason: ""
      });
      if (!stepDays) break;
      date = wizard.frequency === "monthly" ? addMonths(date, 1) : addDays(date, stepDays);
    }
    return visits;
  }

  function readGeneratedVisitDecisions() {
    const wizard = state.visitWizard;
    if (!wizard?.preview) return [];
    return wizard.preview.map((visit) => {
      const skip = Boolean(document.querySelector(`[data-generated-skip="${visit.index}"]`)?.checked);
      const reason = document.querySelector(`[data-generated-reason="${visit.index}"]`)?.value || "";
      return { ...visit, skip, reason };
    });
  }

  function addGeneratedVisits(job, visits) {
    const created = [];
    visits.forEach((visit) => {
      const record = {
        id: `clean-${job.id}-${Date.now()}-${visit.index}`,
        job_id: job.id,
        clean_type: visit.clean_type,
        date: visit.date,
        start_time: visit.start_time,
        duration_minutes: visit.duration_minutes,
        assigned_staff: visit.assigned_staff,
        status: visit.skip ? "skipped" : "planned",
        checklist_template_id: visit.checklist_template_id,
        checklist_source: visit.checklist_template_id ? "job_plan_master" : "none",
        visit_overrides: visit.skip ? `Skipped in generation preview: ${visit.reason || "No reason"}` : "",
        pricing_item_id: visit.pricing_item_id,
        skip_reason: visit.skip ? visit.reason || "Skipped in generation preview" : "",
        report_id: "",
        billable_event_id: ""
      };
      scheduledJobs().push(record);
      created.push(record);
    });
    return created;
  }

  function suggestNextVisits(job, clean, months = 0) {
    const baseDate = latestScheduled(job.id)?.date || clean?.date || isoDate(new Date());
    const frequency = frequencyForJob(job);
    const startDate = nextDateForFrequency(baseDate, frequency);
    const wizard = {
      startDate,
      startTime: clean?.start_time || "09:00",
      frequency,
      dayOfWeek: dayNameFromDate(startDate),
      duration: job.default_duration_minutes || clean?.duration_minutes || 120,
      team: job.default_staff || clean?.assigned_staff || "Unassigned",
      window: months ? "next_1_month" : "one_off",
      customEndDate: addMonths(startDate, months || 1),
      attachChecklist: true,
      usePricing: true,
      checklistTemplateId: defaultTemplateFor(job, "regular")?.id || "",
      pricingItemId: defaultPricingFor(job, "regular")?.id || "",
      preview: []
    };
    state.visitWizard = wizard;
    const preview = buildVisitPreview(job);
    return months ? preview : preview.slice(0, 1);
  }

  function createBillableFromScheduled(clean, status = "ready_to_bill") {
    const existing = findBillableForScheduled(clean.id);
    if (existing) {
      existing.status = status;
      clean.billable_event_id = existing.id;
      return existing;
    }
    const job = findJob(clean.job_id);
    const pricing = job ? priceFor(job, clean.pricing_item_id) : null;
    const event = {
      id: `bill-${Date.now()}`,
      source_job_id: clean.job_id,
      source_scheduled_job_id: clean.id,
      source_report_id: clean.report_id || "",
      pricing_item_id: clean.pricing_item_id,
      description: `${pricing?.label || cleanTypeLabel(clean.clean_type)} - ${job?.address_label || "Clean"}`,
      amount: pricing?.amount || 0,
      status,
      billing_type: pricing?.billing_type || clean.clean_type
    };
    billableEvents().push(event);
    clean.billable_event_id = event.id;
    return event;
  }

  function createReviewedReport(clean) {
    const existing = findReportForScheduled(clean.id);
    if (existing) {
      existing.review_status = "reviewed";
      existing.checklist_status = "complete";
      existing.cleaner_remarks = "";
      existing.client_remarks = "";
      clean.report_id = existing.id;
      return existing;
    }
    const report = {
      id: `report-${Date.now()}`,
      scheduled_job_id: clean.id,
      job_id: clean.job_id,
      completed_at: "Just now",
      completed_by: clean.assigned_staff || "Assigned team",
      checklist_status: "complete",
      cleaner_remarks: "",
      client_remarks: "",
      severity: "Note",
      review_status: "reviewed"
    };
    reports().push(report);
    clean.report_id = report.id;
    return report;
  }

  function render() {
    return `
      <section class="jobs-root" data-jobs-root="true">
        ${state.selectedJobId ? renderWorkspace(selectedJob()) : renderList()}
        ${state.editorOpen && selectedJob() ? renderEditor(selectedJob()) : ""}
        ${state.layer ? renderLayer() : ""}
        ${state.modal ? renderModal() : ""}
      </section>
    `;
  }

  function pageHead() {
    return `
      <div class="page-head">
        <div>
          <div class="title-row"><h1>Jobs</h1></div>
          <p class="muted" style="margin-top:10px">Manage accepted work, cleaning plans, reports, and billing readiness.</p>
        </div>
        <div class="page-actions">${button("New job plan", "open-new-job", "primary")}</div>
      </div>
    `;
  }

  function needsSetupItems() {
    return jobs().filter((job) => job.status === "setup" || !job.setup_complete);
  }

  function needsReviewItems() {
    return reports()
      .filter((report) => report.review_status === "needs_review")
      .map((report) => ({ report, clean: findScheduled(report.scheduled_job_id), job: findJob(report.job_id) }))
      .filter((item) => item.clean && item.job);
  }

  function readyToBillItems() {
    return billableEvents()
      .filter((event) => event.status === "ready_to_bill")
      .map((event) => ({ event, clean: findScheduled(event.source_scheduled_job_id), job: findJob(event.source_job_id) }))
      .filter((item) => item.job);
  }

  function renderList() {
    return `
      ${pageHead()}
      ${renderActionPanel()}
      ${renderJobsRegister()}
    `;
  }

  function renderActionPanel() {
    return `
      <section class="jobs-action-panel">
        ${renderActionColumn("Needs setup", needsSetupItems(), renderSetupCard)}
        ${renderActionColumn("Needs review", needsReviewItems(), renderReviewCard)}
        ${renderActionColumn("Ready to bill", readyToBillItems(), renderBillCard)}
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

  function renderSetupCard(job) {
    const client = jobClient(job);
    const property = jobProperty(job);
    return `
      <button class="job-action-card" type="button" data-job-open="${escapeHtml(job.id)}">
        <strong>${escapeHtml(job.address_label || displayProperty(property))}</strong>
        <span>${escapeHtml(displayClient(client))} - ${escapeHtml(job.service_type)}</span>
        <span class="muted">${escapeHtml(job.missing_setup_items?.[0] || "Setup needs review")}</span>
        ${chip(`${job.missing_setup_items?.length || 0} missing`, "warning")}
      </button>
    `;
  }

  function renderReviewCard(item) {
    const client = jobClient(item.job);
    return `
      <button class="job-action-card" type="button" data-job-open="${escapeHtml(item.job.id)}" data-job-layer-open="scheduled:${escapeHtml(item.clean.id)}">
        <strong>${escapeHtml(item.job.address_label)}</strong>
        <span>${escapeHtml(displayClient(client))} - ${escapeHtml(cleanTypeLabel(item.clean.clean_type))}</span>
        <span class="muted">${escapeHtml(item.report.cleaner_remarks || item.report.client_remarks || "Review report")}</span>
        ${chip(item.report.severity, severityTones[item.report.severity] || "warning")}
      </button>
    `;
  }

  function renderBillCard(item) {
    const client = jobClient(item.job);
    return `
      <button class="job-action-card" type="button" data-job-open="${escapeHtml(item.job.id)}">
        <strong>${escapeHtml(item.job.address_label)}</strong>
        <span>${escapeHtml(displayClient(client))} - ${escapeHtml(item.event.description)}</span>
        <span class="muted">${escapeHtml(item.clean ? `${item.clean.date} ${item.clean.start_time}` : "Completed work")}</span>
        ${chip(money(item.event.amount), "success")}
      </button>
    `;
  }

  function renderJobsRegister() {
    const sortHeader = (label, action) => `
      <button class="job-sort-button" type="button" data-job-action="mock-layer:Sort All Job Plans by ${escapeHtml(action)}" title="Mock sort control">
        ${escapeHtml(label)} <span aria-hidden="true">sort</span>
      </button>
    `;
    const rows = jobs().map((job) => {
      const client = jobClient(job);
      const property = jobProperty(job);
      const nextClean = jobScheduled(job.id).find((clean) => clean.status === "planned") || jobScheduled(job.id)[0];
      return `
        <tr class="job-register-row" data-job-open="${escapeHtml(job.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(job.display_name)}">
          <td><strong>${escapeHtml(job.address_label || displayProperty(property))}</strong><br><span class="muted">${escapeHtml(job.display_name)}</span></td>
          <td>${escapeHtml(displayClient(client))}</td>
          <td>${escapeHtml(job.service_type)}<br><span class="muted">${escapeHtml(jobTypeLabel(job.job_type))}</span></td>
          <td>${escapeHtml(job.recurrence)}<br><span class="muted">${escapeHtml(minutesLabel(job.default_duration_minutes))}</span></td>
          <td>${nextClean ? escapeHtml(visitDateLabel(nextClean.date, nextClean.start_time)) : "No scheduled cleans"}<br><span class="muted">${escapeHtml(nextClean?.assigned_staff || "")}</span></td>
          <td>${statusChip(job.status)} ${job.setup_complete ? chip("Setup complete", "success") : chip("Setup needed", "warning")}</td>
          <td>
            <div class="row-menu-wrap">
              <button class="button small" type="button" data-job-action="toggle-row-menu:${escapeHtml(job.id)}">Actions v</button>
              ${state.rowMenuId === job.id ? renderRowMenu(job) : ""}
            </div>
          </td>
        </tr>
      `;
    });
    return `
      <article class="panel jobs-register-panel">
        <div class="panel-head">
          <div>
            <h2>All Job Plans</h2>
            <p class="muted">Every accepted work package stays visible here, including normal active recurring jobs.</p>
          </div>
          ${chip(`${jobs().length} jobs`, "info")}
        </div>
        <div class="filters">
          <span class="inputish">Search jobs</span>
          <span class="selectish">All statuses</span>
          <span class="selectish">All services</span>
          <span class="selectish">All properties</span>
          <span class="muted">Static v0 controls. Ready for real search/filter wiring.</span>
        </div>
        <table>
          <thead><tr><th>${sortHeader("Address / job", "address")}</th><th>${sortHeader("Client", "client")}</th><th>${sortHeader("Service", "service")}</th><th>Plan</th><th>${sortHeader("Next clean", "next clean")}</th><th>${sortHeader("Status", "status")}</th><th>Action</th></tr></thead>
          <tbody>${rows.join("")}</tbody>
        </table>
        <div class="job-register-footer">
          <span class="muted">Showing 1-${jobs().length} of ${jobs().length} mock job plans</span>
          <div class="button-row">
            <span class="selectish">Page size: 25</span>
            ${button("Previous", "mock-layer:Previous Jobs register page", "small")}
            ${button("Next", "mock-layer:Next Jobs register page", "small")}
          </div>
        </div>
      </article>
    `;
  }

  function renderRowMenu(job) {
    return `
      <div class="client-more-menu job-row-menu">
        <button type="button" data-job-action="open-job:${escapeHtml(job.id)}">Open workspace</button>
        <button type="button" data-job-action="edit-job:${escapeHtml(job.id)}">Edit setup</button>
        <button type="button" data-job-action="open-checklist:${escapeHtml(job.id)}">Open checklist builder</button>
        <button type="button" data-job-action="mock-unavailable:Duplicate job plan">Duplicate</button>
      </div>
    `;
  }

  function renderWorkspace(job) {
    if (!job) {
      state.selectedJobId = null;
      return renderList();
    }
    const client = jobClient(job);
    const property = jobProperty(job);
    return `
      <div class="client-breadcrumb">
        <button type="button" data-job-action="back-to-jobs">Jobs</button>
        <span>/</span>
        <strong>${escapeHtml(job.address_label)}</strong>
      </div>
      <div class="job-workspace-head">
        <div>
          <div class="title-row">
            <h1>${escapeHtml(job.address_label)}</h1>
            ${statusChip(job.status)}
            ${job.setup_complete ? chip("Setup complete", "success") : chip("Setup needed", "warning")}
          </div>
          <p class="muted" style="margin-top:10px">${escapeHtml(displayClient(client))} - ${escapeHtml(job.service_type)} - ${escapeHtml(job.recurrence)}</p>
        </div>
        <div class="page-actions">
          ${button("Edit job", "edit-selected-job")}
          ${button("Close", "back-to-jobs")}
        </div>
      </div>
      <section class="grid-detail">
        <div class="stack">
          ${renderPlanSetup(job)}
          ${renderScheduledCleans(job)}
          ${renderRecentReports(job)}
          ${renderChecklistSummary(job)}
        </div>
        <aside class="stack">
          ${renderJobContext(job, client, property)}
          ${renderBillingReadiness(job)}
          ${renderInternalNotes(job)}
        </aside>
      </section>
    `;
  }

  function renderPlanSetup(job) {
    return `
      <article class="panel">
        <div class="panel-head">
          <div><h2>Cleaning Plan / Setup</h2><p class="muted">${escapeHtml(job.setup_note || "Operational setup")}</p></div>
          ${job.setup_complete ? chip("Ready to run", "success") : button("Mark setup complete", "confirm-setup-complete", "small primary")}
        </div>
        <div class="panel-body job-plan-grid">
          <div class="request-note-block"><strong>Service</strong><span>${escapeHtml(job.service_type)}</span></div>
          <div class="request-note-block"><strong>Plan type</strong><span>${escapeHtml(jobTypeLabel(job.job_type))}</span></div>
          <div class="request-note-block"><strong>Recurrence</strong><span>${escapeHtml(job.recurrence)}</span></div>
          <div class="request-note-block"><strong>Default duration</strong><span>${escapeHtml(minutesLabel(job.default_duration_minutes))}</span></div>
          <div class="request-note-block"><strong>Cleaner/team</strong><span>${escapeHtml(job.default_staff)}</span></div>
          <div class="request-note-block"><strong>Products/equipment</strong><span>${escapeHtml(job.products_equipment_notes)}</span></div>
          ${job.missing_setup_items?.length ? `<div class="request-note-block wide warning-block"><strong>Missing setup</strong><ul>${job.missing_setup_items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
        </div>
      </article>
    `;
  }

  function renderScheduledCleans(job) {
    const allCount = jobScheduled(job.id).length;
    const hiddenCount = hiddenCompletedCount(job.id);
    const rows = visibleScheduledForWorkspace(job.id).map((clean) => {
      const template = findTemplate(clean.checklist_template_id);
      const pricing = priceFor(job, clean.pricing_item_id);
      return `
        <tr data-job-layer-open="scheduled:${escapeHtml(clean.id)}" tabindex="0" role="button">
          <td><strong>${escapeHtml(cleanTypeLabel(clean.clean_type))}</strong><br><span class="muted">${escapeHtml(clean.id)}</span></td>
          <td>${escapeHtml(visitDateLabel(clean.date, clean.start_time))}</td>
          <td>${escapeHtml(minutesLabel(clean.duration_minutes))}</td>
          <td>${escapeHtml(clean.assigned_staff)}</td>
          <td>${escapeHtml(template?.name || "Master checklist to confirm")}<br><span class="muted">${escapeHtml(clean.visit_overrides ? "Visit overrides" : "Job Plan master checklist")}</span></td>
          <td>${escapeHtml(pricing?.label || "Pricing to confirm")}<br><span class="muted">${escapeHtml(money(pricing?.amount || 0))}</span></td>
          <td>${statusChip(clean.status)}</td>
          <td>${button("Open", `open-scheduled:${clean.id}`, "small")}</td>
        </tr>
      `;
    });
    return `
      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Generated Scheduled Cleans</h2>
            <p class="muted">Upcoming and active scheduled occurrences. Recent completed work is summarised below in Recent Reports.</p>
          </div>
          <div class="button-row">
            ${button("Preview / generate visits", "open-generate-visits", "small primary")}
            ${button("Add one-off clean", "open-one-off-visit", "small")}
            ${chip(`${rows.length} shown`, "info")}
          </div>
        </div>
        ${hiddenCount ? `<div class="panel-body" style="padding-bottom:0"><div class="request-note-block"><strong>Completed history</strong><span>${escapeHtml(`${hiddenCount} older completed visit${hiddenCount === 1 ? "" : "s"} hidden here. Older completed visits are shown in Recent Reports / Reports history later.`)}</span></div></div>` : ""}
        <div class="quote-table-scroll">
          <table class="jobs-scheduled-table">
            <thead><tr><th>Clean type</th><th>Date/time</th><th>Duration</th><th>Team</th><th>Checklist source</th><th>Pricing source</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>${rows.length ? rows.join("") : `<tr><td colspan="8"><span class="muted">No upcoming or active scheduled cleans yet. Use Preview / generate visits to add mock scheduled work.</span></td></tr>`}</tbody>
          </table>
        </div>
        <div class="job-register-footer"><span class="muted">Showing ${rows.length} active/context rows from ${allCount} scheduled occurrence${allCount === 1 ? "" : "s"}.</span><span class="muted">Full completed history belongs in Reports later.</span></div>
      </article>
    `;
  }

  function renderRecentReports(job) {
    const allReports = jobReports(job.id);
    const items = recentReportItems(job.id);
    const hidden = Math.max(0, allReports.length - items.length);
    return `
      <article class="panel">
        <div class="panel-head">
          <div>
            <h2>Recent Reports</h2>
            <p class="muted">Completed visit history summary. Full searchable history belongs in Reports later.</p>
          </div>
          ${chip(`${items.length}`, items.length ? "info" : "muted")}
        </div>
        <div class="panel-body stack">
          ${items.length ? items.map((report) => {
            const clean = findScheduled(report.scheduled_job_id);
            return `<article class="work-card">
              <div class="button-row" style="justify-content:space-between">
                <strong>${escapeHtml(clean ? `${cleanTypeLabel(clean.clean_type)} - ${visitDateLabel(clean.date, clean.start_time)}` : report.id)}</strong>
                ${chip(report.severity, severityTones[report.severity] || "info")}
              </div>
              <p class="muted">${escapeHtml(report.cleaner_remarks || report.client_remarks || "All good. Stored quietly.")}</p>
              <div class="button-row" style="justify-content:space-between">
                <span>${escapeHtml(report.completed_by)} - ${escapeHtml(report.completed_at)}</span>
                ${button("Open report", `open-report:${report.id}`, "small")}
              </div>
            </article>`;
          }).join("") : `<div class="empty mini"><div class="empty-icon">R</div><div><h3>No reports yet</h3><p class="muted">Completed scheduled cleans will appear here.</p></div></div>`}
          ${hidden ? `<div class="request-note-block"><strong>More reports</strong><span>${escapeHtml(`${hidden} older report${hidden === 1 ? "" : "s"} hidden in Jobs v0. View all reports later will open the full Reports history.`)}</span></div>` : ""}
          ${allReports.length > 5 ? `<div class="button-row" style="justify-content:flex-start">${button("View all reports later", "mock-layer:View all Reports history", "small")}</div>` : ""}
        </div>
      </article>
    `;
  }

  function renderChecklistSummary(job) {
    const list = job.checklist_template_ids?.map(findTemplate).filter(Boolean) || [];
    return `
      <article class="panel">
        <div class="panel-head"><h2>Checklist Summary</h2>${button("Open checklist builder", `open-checklist:${job.id}`, "small primary")}</div>
        <div class="panel-body stack">
          ${list.map((template) => `<article class="request-note-block">
            <strong>${escapeHtml(template.name)}</strong>
            <span>${escapeHtml(template.clean_type)} clean - ${escapeHtml(template.sections)} sections - ${escapeHtml(template.tasks)} tasks</span>
            <span class="muted">${escapeHtml(template.summary)}</span>
          </article>`).join("")}
        </div>
      </article>
    `;
  }

  function renderJobContext(job, client, property) {
    const quote = findQuote(job.source_quote_id);
    const request = findRequest(job.source_request_id);
    return `
      <article class="panel pad">
        <div class="side-section">
          <h2>Job Context</h2>
          <div class="field-row"><span>Client</span><strong>${escapeHtml(displayClient(client))}</strong></div>
          <div class="field-row"><span>Property</span><strong>${escapeHtml(displayProperty(property))}</strong></div>
          <div class="field-row"><span>Source quote</span><strong>${escapeHtml(quote?.quote_ref || quote?.number || "No quote")}</strong></div>
          <div class="field-row"><span>Source request</span><strong>${escapeHtml(request?.number || "No request")}</strong></div>
          <div class="field-row"><span>Service</span><strong>${escapeHtml(job.service_type)}</strong></div>
          <div class="field-row"><span>Pattern</span><strong>${escapeHtml(job.recurrence)}</strong></div>
        </div>
        <div class="side-section">
          <h2>Products / equipment</h2>
          <p class="muted">${escapeHtml(job.products_equipment_notes)}</p>
        </div>
        <div class="button-row" style="justify-content:flex-start">
          ${button("Open client", "preview-client", "small")}
          ${button("Open property", "preview-property", "small")}
          ${button("Open quote", "preview-quote", "small")}
          ${button("Open request", "preview-request", "small")}
        </div>
      </article>
    `;
  }

  function renderBillingReadiness(job) {
    const cleans = jobScheduled(job.id);
    const lines = cleans.map((clean) => {
      const pricing = priceFor(job, clean.pricing_item_id);
      const event = findBillableForScheduled(clean.id);
      const status = event?.status === "ready_to_bill"
        ? "Ready to bill"
        : event?.status === "draft"
          ? "Needs review"
          : clean.status === "skipped" || clean.status === "cancelled"
            ? "Not billable"
            : "Not billable yet";
      const tone = status === "Ready to bill" ? "success" : status === "Needs review" ? "warning" : "muted";
      return `
        <article class="billing-line">
          <strong>${escapeHtml(money(pricing?.amount || 0))} - ${escapeHtml(pricing?.label || cleanTypeLabel(clean.clean_type))}</strong>
          <span class="muted">${escapeHtml(clean.status === "completed" || clean.status === "needs_review" ? `completed ${clean.date}` : `planned ${clean.date}`)} - Source: ${escapeHtml(pricing?.label || "pricing item")}</span>
          ${chip(status, tone)}
        </article>
      `;
    });
    return `
      <article class="panel pad">
        <h2>Billing Readiness</h2>
        <div class="stack" style="margin-top:12px">${lines.join("")}</div>
      </article>
    `;
  }

  function renderInternalNotes(job) {
    return `
      <article class="panel pad">
        <h2>Internal Notes</h2>
        <p class="muted" style="margin-top:8px">${escapeHtml(job.internal_notes || "No internal notes yet.")}</p>
      </article>
    `;
  }

  function renderEditor(job) {
    return `
      <div class="job-layer-backdrop">
        <article class="job-editor-shell" role="dialog" aria-modal="true">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Job setup editor</p>
              <h2>${escapeHtml(job.address_label)}</h2>
            </div>
            ${iconButton("Close", "close-editor")}
          </div>
          <div class="job-editor-grid">
            <section class="panel pad">
              <h2>Operational setup</h2>
              <div class="job-form-grid">
                ${field("Service type", "service_type", job.service_type, "select", Object.keys(serviceTypeLabels))}
                ${field("Job type", "job_type", job.job_type, "select", ["one_off", "recurring", "commercial"])}
                ${field("Recurrence/day/time", "recurrence", job.recurrence)}
                ${field("Default duration", "default_duration_minutes", job.default_duration_minutes, "number")}
                ${field("Cleaner/team", "default_staff", job.default_staff)}
                ${field("Products/equipment notes", "products_equipment_notes", job.products_equipment_notes, "textarea")}
              </div>
            </section>
            <aside class="panel pad">
              <h2>Setup status</h2>
              <p class="muted" style="margin-top:8px">Mock editor only. These fields change frontend state for this spike.</p>
              <div class="side-section" style="margin-top:14px">
                <div class="field-row"><span>Status</span><strong>${escapeHtml(statusLabels[job.status] || job.status)}</strong></div>
                <div class="field-row"><span>Missing items</span><strong>${escapeHtml(job.missing_setup_items?.length || 0)}</strong></div>
                <div class="field-row"><span>Checklists</span><strong>${escapeHtml(job.checklist_template_ids?.length || 0)}</strong></div>
              </div>
              ${job.setup_complete ? chip("Setup complete", "success") : button("Mark setup complete", "confirm-setup-complete", "primary")}
            </aside>
          </div>
          <div class="job-editor-actions">
            ${button("Save mock setup", "save-editor", "primary")}
            ${button("Cancel", "close-editor")}
          </div>
        </article>
      </div>
    `;
  }

  function field(label, name, value, type = "text", options = []) {
    if (type === "textarea") {
      return `<label class="client-field wide"><span>${escapeHtml(label)}</span><textarea rows="4" data-job-field="${escapeHtml(name)}">${escapeHtml(value)}</textarea></label>`;
    }
    if (type === "select") {
      return `<label class="client-field"><span>${escapeHtml(label)}</span><select data-job-field="${escapeHtml(name)}">${options.map((option) => `<option value="${escapeHtml(option)}"${option === value ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`;
    }
    return `<label class="client-field"><span>${escapeHtml(label)}</span><input type="${escapeHtml(type)}" value="${escapeHtml(value)}" data-job-field="${escapeHtml(name)}"></label>`;
  }

  function renderLayer() {
    if (state.layer === "scheduled") return renderScheduledLayer(findScheduled(state.layerId));
    if (state.layer === "report") return renderReportLayer(findReport(state.layerId));
    if (state.layer === "checklist") return renderChecklistLayer(findJob(state.layerId));
    if (state.layer === "source") return renderSourcePreview(state.layerId);
    if (state.layer === "generate") return renderVisitWizard(findJob(state.layerId));
    return "";
  }

  function option(value, label, selected) {
    return `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
  }

  function renderVisitWizard(job) {
    if (!job) return "";
    const wizard = state.visitWizard || initVisitWizard(job);
    return `
      <div class="job-layer-backdrop">
        <article class="job-layer-shell" role="dialog" aria-modal="true">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Visit generation wizard</p>
              <h2>${escapeHtml(job.address_label)}</h2>
              <p class="muted" style="margin-top:6px">${escapeHtml(wizard.step === 2 ? "Step 2 of 2 - Preview generated visits" : "Step 1 of 2 - Generation setup")}</p>
            </div>
            ${button("Cancel", "close-layer")}
          </div>
          ${wizard.step === 2 ? renderVisitWizardPreview(job, wizard) : renderVisitWizardSetup(job, wizard)}
        </article>
      </div>
    `;
  }

  function renderVisitWizardSetup(job, wizard) {
    const templatesForJob = job.checklist_template_ids?.map(findTemplate).filter(Boolean) || [];
    return `
      <section class="grid-detail job-layer-content">
        <div class="stack">
          <article class="panel pad">
            <h2>Generation setup</h2>
            <div class="job-form-grid">
              <label class="client-field"><span>Start date</span><input type="date" data-visit-wizard="startDate" value="${escapeHtml(wizard.startDate)}"></label>
              <label class="client-field"><span>Start time</span><input type="time" data-visit-wizard="startTime" value="${escapeHtml(wizard.startTime)}"></label>
              <label class="client-field"><span>Frequency</span><select data-visit-wizard="frequency">
                ${option("weekly", "Weekly", wizard.frequency)}
                ${option("fortnightly", "Fortnightly", wizard.frequency)}
                ${option("4-weekly", "4-weekly", wizard.frequency)}
                ${option("monthly", "Monthly", wizard.frequency)}
                ${option("one_off", "One-off", wizard.frequency)}
              </select></label>
              <label class="client-field"><span>Day of week</span><select data-visit-wizard="dayOfWeek">
                ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => option(day, day, wizard.dayOfWeek)).join("")}
              </select></label>
              <label class="client-field"><span>Duration</span><input type="number" min="15" step="15" data-visit-wizard="duration" value="${escapeHtml(wizard.duration)}"></label>
              <label class="client-field"><span>Team / cleaner</span><select data-visit-wizard="team">
                ${["Flexible team", "Marta", "Daniel", "Amy + Marta", "Team 1", "Unassigned"].map((team) => option(team, team, wizard.team)).join("")}
              </select></label>
              <label class="client-field"><span>Generate window</span><select data-visit-wizard="window">
                ${option("next_1_month", "Next 1 month", wizard.window)}
                ${option("next_3_months", "Next 3 months", wizard.window)}
                ${option("custom", "Custom end date", wizard.window)}
                ${option("one_off", "One visit only", wizard.window)}
              </select></label>
              <label class="client-field"><span>Custom end date</span><input type="date" data-visit-wizard="customEndDate" value="${escapeHtml(wizard.customEndDate)}"></label>
              <label class="client-field"><span>Master checklist</span><select data-visit-wizard="checklistTemplateId">
                ${(templatesForJob.length ? templatesForJob : templates()).map((template) => option(template.id, template.name, wizard.checklistTemplateId)).join("")}
              </select></label>
              <label class="client-field"><span>Pricing item</span><select data-visit-wizard="pricingItemId">
                ${job.pricing_items?.map((item) => option(item.id, `${item.label} - ${money(item.amount)}`, wizard.pricingItemId)).join("") || option("", "No pricing item", wizard.pricingItemId)}
              </select></label>
              <label class="client-field"><span>Attach master checklist</span><span class="inputish"><input type="checkbox" data-visit-wizard="attachChecklist"${wizard.attachChecklist ? " checked" : ""}> Use Job Plan master checklist</span></label>
              <label class="client-field"><span>Use standard pricing</span><span class="inputish"><input type="checkbox" data-visit-wizard="usePricing"${wizard.usePricing ? " checked" : ""}> Use selected pricing item</span></label>
            </div>
          </article>
        </div>
        <aside class="stack">
          <article class="panel pad">
            <h2>Job Plan defaults</h2>
            <div class="field-row"><span>Recurrence</span><strong>${escapeHtml(job.recurrence)}</strong></div>
            <div class="field-row"><span>Default team</span><strong>${escapeHtml(job.default_staff)}</strong></div>
            <div class="field-row"><span>Default duration</span><strong>${escapeHtml(minutesLabel(job.default_duration_minutes))}</strong></div>
            <div class="field-row"><span>Master checklist</span><strong>${escapeHtml(templatesForJob.map((template) => template.name).join(", ") || "To confirm")}</strong></div>
          </article>
          <article class="panel pad">
            <h2>Schedule relationship</h2>
            <p class="muted" style="margin-top:8px">Generate recurring visits from the Job workspace. Schedule should mainly show planned work, changes, exceptions, one-offs, and capacity checks.</p>
          </article>
        </aside>
        <div class="job-editor-actions">
          ${button("Cancel", "close-layer")}
          ${button("Preview visits", "preview-generated-visits", "primary")}
        </div>
      </section>
    `;
  }

  function renderVisitWizardPreview(job, wizard) {
    const visits = wizard.preview || [];
    const reasons = ["", "Client holiday", "Staff unavailable", "Bank holiday", "Access issue", "Other"];
    return `
      <section class="job-layer-content">
        <article class="panel">
          <div class="panel-head">
            <div>
              <h2>Preview generated visits</h2>
              <p class="muted">Mock flags help spot exceptions before adding visits to this frontend-only Jobs state.</p>
            </div>
            ${chip(`${visits.length} visits`, "info")}
          </div>
          <div class="quote-table-scroll">
            <table class="jobs-scheduled-table">
              <thead><tr><th>Date</th><th>Time</th><th>Clean type</th><th>Team</th><th>Checklist source</th><th>Pricing source</th><th>Flags</th><th>Skip</th><th>Reason</th></tr></thead>
              <tbody>${visits.map((visit) => `
                <tr>
                  <td>${escapeHtml(`${visit.date} - ${shortDayName(visit.date)}`)}</td>
                  <td>${escapeHtml(visit.start_time)}</td>
                  <td>${escapeHtml(cleanTypeLabel(visit.clean_type))}</td>
                  <td>${escapeHtml(visit.assigned_staff)}</td>
                  <td>${escapeHtml(visit.checklist_label)}<br><span class="muted">Job Plan master checklist</span></td>
                  <td>${escapeHtml(visit.pricing_label)}</td>
                  <td>${visit.flags.length ? visit.flags.map((flag) => chip(flag, flag === "Bank holiday" || flag === "Team unavailable" ? "warning" : "info")).join(" ") : `<span class="muted">No flags</span>`}</td>
                  <td><input type="checkbox" data-generated-skip="${visit.index}"></td>
                  <td><select class="selectish" data-generated-reason="${visit.index}">${reasons.map((reason) => option(reason, reason || "No reason", visit.reason)).join("")}</select></td>
                </tr>
              `).join("")}</tbody>
            </table>
          </div>
        </article>
        <div class="job-editor-actions">
          ${button("Back", "back-generation-setup")}
          ${button("Generate visits", "confirm-generate-visits", "primary")}
        </div>
      </section>
    `;
  }

  function renderScheduledLayer(clean) {
    if (!clean) return "";
    const job = findJob(clean.job_id);
    const template = findTemplate(clean.checklist_template_id);
    const report = findReport(clean.report_id) || findReportForScheduled(clean.id);
    const event = findBillable(clean.billable_event_id) || findBillableForScheduled(clean.id);
    const pricing = job ? priceFor(job, clean.pricing_item_id) : null;
    return `
      <div class="job-layer-backdrop">
        <article class="job-layer-shell" role="dialog" aria-modal="true">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Scheduled clean detail</p>
              <h2>${escapeHtml(job?.address_label || "Scheduled clean")}</h2>
            </div>
            ${button("Back to job", "close-layer")}
          </div>
          <section class="grid-detail job-layer-content">
            <div class="stack">
              <article class="panel pad">
                <h2>${escapeHtml(cleanTypeLabel(clean.clean_type))}</h2>
                <div class="job-plan-grid" style="margin-top:12px">
                  <div class="request-note-block"><strong>Date/time</strong><span>${escapeHtml(visitDateLabel(clean.date, clean.start_time))}</span></div>
                  <div class="request-note-block"><strong>Duration</strong><span>${escapeHtml(minutesLabel(clean.duration_minutes))}</span></div>
                  <div class="request-note-block"><strong>Team</strong><span>${escapeHtml(clean.assigned_staff)}</span></div>
                  <div class="request-note-block"><strong>Status</strong><span>${statusChip(clean.status)}</span></div>
                  <div class="request-note-block"><strong>Checklist source</strong><span>${escapeHtml(template?.name || "Master checklist to confirm")} - Job Plan master checklist</span></div>
                  <div class="request-note-block"><strong>Visit overrides</strong><span>${escapeHtml(clean.visit_overrides || "None")}</span></div>
                  <div class="request-note-block"><strong>Billing source</strong><span>${escapeHtml(pricing?.label || "Pricing to confirm")} - ${escapeHtml(money(pricing?.amount || 0))}</span></div>
                </div>
              </article>
              <article class="panel pad">
                <h2>Report / completion</h2>
                <p class="muted" style="margin-top:8px">Completed reports store the frozen snapshot of what was actually completed, separate from later master checklist edits.</p>
                <div class="stack" style="margin-top:12px">
                  <div class="field-row"><span>Report status</span><strong>${escapeHtml(report?.review_status || "No report yet")}</strong></div>
                  <div class="field-row"><span>Checklist status</span><strong>${escapeHtml(report?.checklist_status || "Not completed")}</strong></div>
                  <div class="field-row"><span>Cleaner remarks</span><strong>${escapeHtml(report?.cleaner_remarks || "None")}</strong></div>
                  <div class="field-row"><span>Client remarks</span><strong>${escapeHtml(report?.client_remarks || "None")}</strong></div>
                </div>
              </article>
            </div>
            <aside class="stack">
              <article class="panel pad">
                <h2>Actions</h2>
                <div class="stack" style="margin-top:12px">
                  ${button("Complete all good", `confirm-complete:${clean.id}`, "primary")}
                  ${button("Complete with note", `open-note:${clean.id}`)}
                  ${button("Skip / cancel", `open-skip:${clean.id}`)}
                  ${button("Assign/change team", `mock-layer:Assign team for ${clean.id}`)}
                  ${button("Edit schedule details", `mock-layer:Edit schedule for ${clean.id}`)}
                  ${button("Open master checklist", `open-checklist:${clean.job_id}`)}
                  ${button("View billable details", `mock-layer:Billable details for ${clean.id}`)}
                  ${report?.review_status === "needs_review" ? button("Mark reviewed and billable", `confirm-reviewed:${report.id}`, "primary") : ""}
                </div>
              </article>
              <article class="panel pad">
                <h2>Billable status</h2>
                <div class="field-row"><span>Status</span><strong>${escapeHtml(event ? statusLabels[event.status] || event.status : "Not billable yet")}</strong></div>
                <div class="field-row"><span>Amount</span><strong>${escapeHtml(money(event?.amount || pricing?.amount || 0))}</strong></div>
                <div class="field-row"><span>Skip reason</span><strong>${escapeHtml(clean.skip_reason || "None")}</strong></div>
              </article>
            </aside>
          </section>
        </article>
      </div>
    `;
  }

  function renderReportLayer(report) {
    if (!report) return "";
    const clean = findScheduled(report.scheduled_job_id);
    const job = findJob(report.job_id || clean?.job_id);
    const client = job ? jobClient(job) : null;
    const property = job ? jobProperty(job) : null;
    const template = clean ? findTemplate(clean.checklist_template_id) : null;
    const event = reportBillable(report);
    const eventStatus = event ? statusLabels[event.status] || event.status : "No billable event";
    const eventCopy = event?.status === "ready_to_bill"
      ? "Will be available for invoice creation later."
      : event?.status === "draft"
        ? "Draft billable event pending report review."
        : event?.status === "not_billable"
          ? "Marked not billable."
          : "No chargeable event linked yet.";
    return `
      <div class="job-layer-backdrop">
        <article class="job-layer-shell" role="dialog" aria-modal="true">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Visit report preview</p>
              <h2>${escapeHtml(job?.address_label || "Completed visit report")}</h2>
              <p class="muted" style="margin-top:6px">Read-only report preview${report.review_status === "needs_review" ? " with review actions" : ""}.</p>
            </div>
            ${button("Back to job", "close-layer")}
          </div>
          <section class="grid-detail job-layer-content">
            <div class="stack">
              <article class="panel pad">
                <h2>Report summary</h2>
                <div class="job-plan-grid" style="margin-top:12px">
                  <div class="request-note-block"><strong>Client</strong><span>${escapeHtml(displayClient(client))}</span></div>
                  <div class="request-note-block"><strong>Property</strong><span>${escapeHtml(displayProperty(property))}</span></div>
                  <div class="request-note-block"><strong>Job</strong><span>${escapeHtml(job?.display_name || "No job linked")}</span></div>
                  <div class="request-note-block"><strong>Clean type</strong><span>${escapeHtml(cleanTypeLabel(clean?.clean_type))}</span></div>
                  <div class="request-note-block"><strong>Scheduled visit</strong><span>${escapeHtml(clean ? visitDateLabel(clean.date, clean.start_time) : "No scheduled visit")}</span></div>
                  <div class="request-note-block"><strong>Cleaner/team</strong><span>${escapeHtml(report.completed_by || clean?.assigned_staff || "No team")}</span></div>
                  <div class="request-note-block"><strong>Checklist source</strong><span>${escapeHtml(template?.name || "Master checklist to confirm")}</span></div>
                  <div class="request-note-block"><strong>Checklist status</strong><span>${escapeHtml(report.checklist_status || "No checklist status")}</span></div>
                </div>
              </article>
              <article class="panel pad">
                <h2>Remarks / snapshot</h2>
                <p class="muted" style="margin-top:8px">This report is the frozen completion snapshot for the scheduled visit.</p>
                <div class="stack" style="margin-top:12px">
                  <div class="field-row"><span>Cleaner remarks</span><strong>${escapeHtml(report.cleaner_remarks || "None")}</strong></div>
                  <div class="field-row"><span>Client remarks</span><strong>${escapeHtml(report.client_remarks || "None")}</strong></div>
                  <div class="field-row"><span>Severity</span><strong>${escapeHtml(report.severity || "Note")}</strong></div>
                  <div class="field-row"><span>Review status</span><strong>${escapeHtml(statusLabels[report.review_status] || report.review_status || "No review status")}</strong></div>
                </div>
              </article>
            </div>
            <aside class="stack">
              <article class="panel pad">
                <h2>Billing status</h2>
                <div class="field-row"><span>Billable event</span><strong>${escapeHtml(event?.id || "Not linked")}</strong></div>
                <div class="field-row"><span>Status</span><strong>${escapeHtml(eventStatus)}</strong></div>
                <div class="field-row"><span>Amount</span><strong>${escapeHtml(event ? money(event.amount) : "Not set")}</strong></div>
                <p class="muted" style="margin-top:10px">${escapeHtml(eventCopy)}</p>
              </article>
              <article class="panel pad">
                <h2>Actions</h2>
                <div class="stack" style="margin-top:12px">
                  ${report.review_status === "needs_review" ? `
                    ${button("Mark reviewed / billable", `confirm-reviewed:${report.id}`, "primary")}
                    ${button("Mark not billable", `confirm-not-billable:${report.id}`)}
                    ${button("Revisit required mock", `mock-layer:Revisit required for ${report.id}`)}
                  ` : `
                    ${button("View billable event", `view-billable:${report.id}`, "small primary")}
                    ${button("Print/export later", `mock-layer:Print or export report ${report.id}`, "small")}
                  `}
                </div>
              </article>
            </aside>
          </section>
        </article>
      </div>
    `;
  }

  function renderChecklistLayer(job) {
    if (!job) return "";
    const list = job.checklist_template_ids?.map(findTemplate).filter(Boolean) || [];
    const quote = findQuote(job.source_quote_id);
    const request = findRequest(job.source_request_id);
    return `
      <div class="job-layer-backdrop">
        <article class="job-layer-shell" role="dialog" aria-modal="true">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Checklist builder</p>
              <h2>${escapeHtml(job.address_label)}</h2>
            </div>
            ${button("Back to job", "close-layer")}
          </div>
          <section class="grid-detail job-layer-content">
            <div class="stack">
              <article class="panel pad">
                <h2>Checklist inputs</h2>
                <div class="job-plan-grid" style="margin-top:12px">
                  <div class="request-note-block"><strong>Template source</strong><span>${escapeHtml(list.map((item) => item.name).join(", ") || "Template to confirm")}</span></div>
                  <div class="request-note-block"><strong>Property notes</strong><span>${escapeHtml(jobProperty(job)?.cleaning_notes || "No cleaning notes")}</span></div>
                  <div class="request-note-block"><strong>Request details</strong><span>${escapeHtml(request?.short_scoping_note || request?.title || "No request linked")}</span></div>
                  <div class="request-note-block"><strong>Quote items/extras</strong><span>${escapeHtml(quote?.quote_items?.map((item) => item.name).join(", ") || "No quote items")}</span></div>
                </div>
              </article>
              <article class="panel pad">
                <h2>Initial checklist</h2>
                ${renderTemplateList(list.filter((template) => template.clean_type === "initial" || template.clean_type === "one_off"))}
              </article>
              <article class="panel pad">
                <h2>Regular checklist</h2>
                ${renderTemplateList(list.filter((template) => template.clean_type === "regular" || template.clean_type === "extra"))}
              </article>
            </div>
            <aside class="panel pad">
              <h2>Cleaner-facing / report basis</h2>
              <p class="muted" style="margin-top:8px">This mock builder shows how source data shapes the Job Plan master checklist. Visits use that master checklist by default; temporary changes belong in visit overrides, and completed reports store frozen snapshots.</p>
              <div class="stack" style="margin-top:14px">
                ${button("Mock add section", "mock-layer:Add checklist section")}
                ${button("Mock reorder tasks", "mock-layer:Reorder checklist tasks")}
                ${button("Mock save checklist", "mock-layer:Save checklist mock", "primary")}
              </div>
            </aside>
          </section>
        </article>
      </div>
    `;
  }

  function renderTemplateList(items) {
    if (!items.length) return `<p class="muted" style="margin-top:10px">No checklist template selected for this clean type.</p>`;
    return `<div class="stack" style="margin-top:12px">${items.map((template) => `<article class="request-note-block"><strong>${escapeHtml(template.name)}</strong><span>${escapeHtml(template.sections)} sections - ${escapeHtml(template.tasks)} tasks</span><span class="muted">${escapeHtml(template.summary)}</span></article>`).join("")}</div>`;
  }

  function renderSourcePreview(kind) {
    const job = selectedJob();
    if (!job) return "";
    const client = jobClient(job);
    const property = jobProperty(job);
    const quote = findQuote(job.source_quote_id);
    const request = findRequest(job.source_request_id);
    const configs = {
      client: {
        title: "Client preview",
        rows: [["Name", displayClient(client)], ["Phone", client?.phone || "No phone"], ["Email", client?.email || "No email"], ["Status", client?.status || "No status"], ["Billing address", client?.billingAddress || "No billing address"]]
      },
      property: {
        title: "Property preview",
        rows: [["Address", property?.address || "No address"], ["Type", property?.property_type || "No type"], ["Access", property?.access_method || "No access method"], ["Parking", property?.parking || "No parking"], ["Cleaning notes", property?.cleaning_notes || property?.property_notes || "No cleaning notes"]]
      },
      quote: {
        title: "Quote preview",
        rows: [["Reference", quote?.quote_ref || quote?.number || "No quote"], ["Service", quote?.service || "No service"], ["Total", moneyText(quote?.total) || "No total"], ["Status", quote?.status || "No status"], ["Items", quote?.quote_items?.map((item) => `${item.name} (${money(item.amount)})`).join(", ") || "No quote items"]]
      },
      request: {
        title: "Request preview",
        rows: [["Number", request?.number || "No request"], ["Title", request?.title || "No title"], ["Next action", request?.next_action || "No next action"], ["Scope", request?.short_scoping_note || request?.customer_message || "No scope"]]
      }
    };
    const config = configs[kind] || configs.client;
    return `
      <div class="job-layer-backdrop">
        <article class="job-source-preview" role="dialog" aria-modal="true">
          <div class="panel-head">
            <div><p class="eyebrow">Source preview</p><h2>${escapeHtml(config.title)}</h2></div>
            ${button("Back to job", "close-layer")}
          </div>
          <div class="panel-body stack">
            <div class="warning-block request-note-block">
              <strong>Read-only Jobs v0 preview</strong>
              <span>This mock preview shows linked source context only. Full editing stays in the source module when real data wiring is built.</span>
            </div>
            ${config.rows.map(([label, value]) => `<div class="field-row"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}
          </div>
        </article>
      </div>
    `;
  }

  function renderModal() {
    const modal = state.modal;
    if (!modal) return "";
    if (modal.type === "note") return renderNoteModal(modal.cleanId);
    if (modal.type === "skip") return renderSkipModal(modal.cleanId);
    if (modal.type === "newJob") return renderNewJobModal();
    if (modal.type === "mock") return renderMockModal(modal);
    if (modal.type === "nextVisit") return renderNextVisitModal(modal.cleanId);
    return renderConfirmModal(modal);
  }

  function renderNextVisitModal(cleanId) {
    const clean = findScheduled(cleanId);
    const job = clean ? findJob(clean.job_id) : selectedJob();
    if (!job) return "";
    const suggested = suggestNextVisits(job, clean, 0)[0];
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal" role="dialog" aria-modal="true">
          <h2>Generate next visit?</h2>
          <p class="muted" style="margin-top:8px">This mock prompt is based on the Job Plan recurrence and the latest scheduled clean date.</p>
          <div class="request-note-block" style="margin-top:14px">
            <strong>Suggested next visit</strong>
            <span>${escapeHtml(suggested ? visitDateLabel(suggested.date, suggested.start_time) : "No date")} - ${escapeHtml(suggested?.assigned_staff || "No team")} - ${escapeHtml(minutesLabel(suggested?.duration_minutes || 0))}</span>
          </div>
          <div class="button-row" style="margin-top:16px">
            ${button("Generate next visit", `generate-next-visit:${cleanId}`, "primary")}
            ${button("Generate next month", `generate-next-month:${cleanId}`)}
            ${button("Not now", "close-modal")}
          </div>
        </article>
      </div>
    `;
  }

  function renderNewJobModal() {
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal" role="dialog" aria-modal="true">
          <h2>New job plan</h2>
          <p class="muted" style="margin-top:8px">Jobs v0 is frontend/mock only. A real new job plan should start from an accepted quote once backend persistence is available.</p>
          <div class="stack" style="margin-top:14px">
            <div class="request-note-block"><strong>Recommended path</strong><span>Accepted quote -> Job Plan shell -> setup editor -> generated scheduled cleans.</span></div>
            <div class="request-note-block"><strong>Current spike</strong><span>Use the existing mock job plans to review setup, scheduled clean detail, report review, and billing readiness flows.</span></div>
          </div>
          <div class="button-row" style="margin-top:16px">
            ${button("Close", "close-modal")}
            ${button("Open Jobs register", "back-to-jobs", "primary")}
          </div>
        </article>
      </div>
    `;
  }

  function renderMockModal(modal) {
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal" role="dialog" aria-modal="true">
          <h2>${escapeHtml(modal.title || "Mock-only action")}</h2>
          <p class="muted" style="margin-top:8px">${escapeHtml(modal.copy || "This control is included to show the intended Jobs v0 workflow, but it is not wired to persistence in this spike.")}</p>
          <div class="request-note-block" style="margin-top:14px">
            <strong>What happens in the real module</strong>
            <span>${escapeHtml(modal.detail || "This opens a focused workspace or updates real job data once the backend exists.")}</span>
          </div>
          <div class="button-row" style="margin-top:16px">
            ${button("Close", "close-modal", "primary")}
          </div>
        </article>
      </div>
    `;
  }

  function renderConfirmModal(modal) {
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal" role="dialog" aria-modal="true">
          <h2>${escapeHtml(modal.title)}</h2>
          <p class="muted" style="margin-top:8px">${escapeHtml(modal.copy)}</p>
          <div class="button-row" style="margin-top:16px">
            ${button("Cancel", "close-modal")}
            ${button(modal.primaryLabel, modal.confirmAction, "primary")}
          </div>
        </article>
      </div>
    `;
  }

  function renderNoteModal(cleanId) {
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal note-modal" role="dialog" aria-modal="true">
          <h2>Complete with note</h2>
          <p class="muted" style="margin-top:8px">This will create a Needs review report and a draft billable event.</p>
          <div class="job-form-grid" style="margin-top:14px">
            <label class="client-field wide"><span>Cleaner remark</span><textarea rows="3" id="job-note-cleaner">Extra time needed or scope changed.</textarea></label>
            <label class="client-field wide"><span>Client remark</span><textarea rows="2" id="job-note-client"></textarea></label>
            <label class="client-field"><span>Severity</span><select id="job-note-severity"><option>Note</option><option>Extra time</option><option>Access issue</option><option>Complaint</option><option>Urgent</option></select></label>
            <label class="client-field"><span>Checklist status</span><select id="job-note-checklist"><option value="partial">Partial</option><option value="complete">Complete</option><option value="issue">Issue</option></select></label>
          </div>
          <div class="button-row" style="margin-top:16px">
            ${button("Cancel", "close-modal")}
            ${button("Save report", `save-note:${cleanId}`, "primary")}
          </div>
        </article>
      </div>
    `;
  }

  function renderSkipModal(cleanId) {
    return `
      <div class="job-modal-backdrop">
        <article class="job-confirm-modal" role="dialog" aria-modal="true">
          <h2>Skip or cancel this clean?</h2>
          <p class="muted" style="margin-top:8px">Skipped or cancelled cleans do not create billable events automatically.</p>
          <label class="client-field wide" style="margin-top:14px"><span>Reason</span><textarea rows="3" id="job-skip-reason">Client cancelled this clean.</textarea></label>
          <div class="button-row" style="margin-top:16px">
            ${button("Cancel", "close-modal")}
            ${button("Skip / cancel", `save-skip:${cleanId}`, "primary")}
          </div>
        </article>
      </div>
    `;
  }

  function refresh() {
    const root = document.getElementById("page-root");
    if (root?.querySelector("[data-jobs-root]")) root.innerHTML = render();
  }

  function updateEditorState() {
    const job = selectedJob();
    if (!job) return;
    document.querySelectorAll("[data-job-field]").forEach((field) => {
      const name = field.dataset.jobField;
      if (!name) return;
      job[name] = name === "default_duration_minutes" ? Number(field.value) || 0 : field.value;
    });
  }

  function handleClick(event) {
    const layerOpen = event.target.closest("[data-job-layer-open]");
    if (layerOpen) {
      const [kind, id] = layerOpen.dataset.jobLayerOpen.split(":");
      if (layerOpen.dataset.jobOpen) state.selectedJobId = layerOpen.dataset.jobOpen;
      state.layer = kind === "scheduled" ? "scheduled" : kind;
      state.layerId = id;
      refresh();
      event.preventDefault();
      return true;
    }

    const jobOpen = event.target.closest("[data-job-open]");
    if (jobOpen) {
      if (event.target.closest("[data-job-action]")) {
        // Let explicit row/menu buttons handle their own actions.
      } else {
        state.selectedJobId = jobOpen.dataset.jobOpen;
        state.rowMenuId = null;
        state.layer = null;
        refresh();
        event.preventDefault();
        return true;
      }
    }

    const actionTarget = event.target.closest("[data-job-action]");
    if (!actionTarget) return false;
    const action = actionTarget.dataset.jobAction;
    event.preventDefault();
    event.stopPropagation();

    if (action.startsWith("open-job:")) {
      state.selectedJobId = action.split(":")[1];
      state.rowMenuId = null;
      refresh();
      return true;
    }
    if (action.startsWith("toggle-row-menu:")) {
      const id = action.split(":")[1];
      state.rowMenuId = state.rowMenuId === id ? null : id;
      refresh();
      return true;
    }
    if (action === "back-to-jobs") {
      state.selectedJobId = null;
      state.editorOpen = false;
      state.layer = null;
      state.visitWizard = null;
      state.modal = null;
      state.rowMenuId = null;
      refresh();
      return true;
    }
    if (action === "edit-selected-job") {
      state.editorOpen = true;
      refresh();
      return true;
    }
    if (action.startsWith("edit-job:")) {
      state.selectedJobId = action.split(":")[1];
      state.editorOpen = true;
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
      updateEditorState();
      state.editorOpen = false;
      toast("Job setup saved in mock state.");
      refresh();
      return true;
    }
    if (action === "confirm-setup-complete") {
      state.modal = {
        title: "Mark setup complete?",
        copy: "This will remove the job from Needs setup and allow scheduled cleans to continue.",
        primaryLabel: "Mark setup complete",
        confirmAction: "mark-setup-complete"
      };
      refresh();
      return true;
    }
    if (action === "mark-setup-complete") {
      const job = selectedJob();
      if (job) {
        job.setup_complete = true;
        job.status = "active";
        job.missing_setup_items = [];
        state.modal = null;
        toast("Job setup marked complete.");
        refresh();
      }
      return true;
    }
    if (action.startsWith("open-scheduled:")) {
      state.layer = "scheduled";
      state.layerId = action.split(":")[1];
      state.visitWizard = null;
      refresh();
      return true;
    }
    if (action.startsWith("open-report:")) {
      state.layer = "report";
      state.layerId = action.split(":")[1];
      state.visitWizard = null;
      refresh();
      return true;
    }
    if (action.startsWith("open-checklist:")) {
      state.layer = "checklist";
      state.layerId = action.split(":")[1];
      state.rowMenuId = null;
      state.visitWizard = null;
      refresh();
      return true;
    }
    if (action === "preview-client" || action === "preview-property" || action === "preview-quote" || action === "preview-request") {
      state.layer = "source";
      state.layerId = action.replace("preview-", "");
      state.visitWizard = null;
      refresh();
      return true;
    }
    if (action === "close-layer") {
      state.layer = null;
      state.layerId = null;
      state.visitWizard = null;
      refresh();
      return true;
    }
    if (action === "open-generate-visits" || action === "open-one-off-visit") {
      const job = selectedJob();
      if (job) {
        state.layer = "generate";
        state.layerId = job.id;
        initVisitWizard(job, action === "open-one-off-visit" ? "one_off" : "recurring");
        refresh();
      }
      return true;
    }
    if (action === "preview-generated-visits") {
      const job = selectedJob();
      if (job) {
        wizardFromDom();
        state.visitWizard.step = 2;
        state.visitWizard.preview = buildVisitPreview(job);
        refresh();
      }
      return true;
    }
    if (action === "back-generation-setup") {
      if (state.visitWizard) state.visitWizard.step = 1;
      refresh();
      return true;
    }
    if (action === "confirm-generate-visits") {
      const visits = readGeneratedVisitDecisions();
      state.visitWizard.preview = visits;
      state.modal = {
        title: "Generate visits?",
        copy: `This will add ${visits.length} mock scheduled clean${visits.length === 1 ? "" : "s"} to this Job Plan. Skipped rows will be added as skipped visits with reasons.`,
        primaryLabel: "Generate visits",
        confirmAction: "generate-visits"
      };
      refresh();
      return true;
    }
    if (action === "generate-visits") {
      const job = selectedJob();
      const visits = state.visitWizard?.preview || [];
      if (job && visits.length) {
        addGeneratedVisits(job, visits);
        state.modal = null;
        state.layer = null;
        state.layerId = null;
        state.visitWizard = null;
        toast(`${visits.length} mock scheduled clean${visits.length === 1 ? "" : "s"} generated.`);
        refresh();
      }
      return true;
    }
    if (action.startsWith("confirm-complete:")) {
      const cleanId = action.split(":")[1];
      const clean = findScheduled(cleanId);
      const amount = money(priceFor(findJob(clean?.job_id), clean?.pricing_item_id)?.amount || 0);
      state.modal = {
        title: "Complete and bill this clean?",
        copy: `This will store an all-good report and create one ready-to-bill event for ${amount}.`,
        primaryLabel: "Complete all good",
        confirmAction: `complete-all-good:${cleanId}`
      };
      refresh();
      return true;
    }
    if (action.startsWith("complete-all-good:")) {
      const clean = findScheduled(action.split(":")[1]);
      if (clean) {
        const report = createReviewedReport(clean);
        clean.status = "completed";
        clean.report_id = report.id;
        createBillableFromScheduled(clean, "ready_to_bill");
        state.modal = { type: "nextVisit", cleanId: clean.id };
        toast("All-good report stored and one billable event created.");
        refresh();
      }
      return true;
    }
    if (action.startsWith("open-note:")) {
      state.modal = { type: "note", cleanId: action.split(":")[1] };
      refresh();
      return true;
    }
    if (action.startsWith("save-note:")) {
      saveNoteReport(action.split(":")[1]);
      return true;
    }
    if (action.startsWith("open-skip:")) {
      state.modal = { type: "skip", cleanId: action.split(":")[1] };
      refresh();
      return true;
    }
    if (action.startsWith("save-skip:")) {
      saveSkip(action.split(":")[1]);
      return true;
    }
    if (action.startsWith("confirm-reviewed:")) {
      const report = findReport(action.split(":")[1]);
      state.modal = {
        title: "Mark reviewed and billable?",
        copy: "This will move the report out of Needs review and mark the related billable event ready to bill.",
        primaryLabel: "Mark reviewed",
        confirmAction: `mark-reviewed:${report?.id || ""}`
      };
      refresh();
      return true;
    }
    if (action.startsWith("confirm-not-billable:")) {
      const report = findReport(action.split(":")[1]);
      state.modal = {
        title: "Mark report not billable?",
        copy: "This will mark the report reviewed and set the linked billable event to not billable. No invoice action will be created.",
        primaryLabel: "Mark not billable",
        confirmAction: `mark-not-billable:${report?.id || ""}`
      };
      refresh();
      return true;
    }
    if (action.startsWith("mark-reviewed:")) {
      markReviewed(action.split(":")[1]);
      return true;
    }
    if (action.startsWith("mark-not-billable:")) {
      markNotBillable(action.split(":")[1]);
      return true;
    }
    if (action.startsWith("view-billable:")) {
      const report = findReport(action.split(":")[1]);
      const event = reportBillable(report);
      state.modal = {
        type: "mock",
        title: event ? `Billable event ${event.id}` : "No billable event linked",
        copy: event
          ? `${event.description || "Billable event"} - ${money(event.amount)} - ${statusLabels[event.status] || event.status}.`
          : "This report does not have a linked billable event yet.",
        detail: event?.status === "ready_to_bill"
          ? "This ready billable event will be available for invoice creation later. Jobs does not issue invoices."
          : "Billable event editing and invoice grouping remain future Invoice/Reports scope."
      };
      refresh();
      return true;
    }
    if (action.startsWith("generate-next-visit:") || action.startsWith("generate-next-month:")) {
      const cleanId = action.split(":")[1];
      const clean = findScheduled(cleanId);
      const job = clean ? findJob(clean.job_id) : selectedJob();
      if (job) {
        const visits = suggestNextVisits(job, clean, action.startsWith("generate-next-month:") ? 1 : 0);
        addGeneratedVisits(job, visits);
        state.modal = null;
        state.layer = null;
        state.layerId = null;
        state.visitWizard = null;
        toast(`${visits.length} suggested visit${visits.length === 1 ? "" : "s"} generated.`);
        refresh();
      }
      return true;
    }
    if (action === "close-modal") {
      state.modal = null;
      state.visitWizard = state.layer === "generate" ? state.visitWizard : null;
      refresh();
      return true;
    }
    if (action.startsWith("mock-layer:")) {
      const label = action.split(":").slice(1).join(":") || "Mock action";
      state.modal = {
        type: "mock",
        title: label,
        copy: "This is a visible Jobs v0 mock control, not a silent dead button.",
        detail: "Future work should wire this to the appropriate layered workspace, editor, sorting control, or backend action."
      };
      refresh();
      return true;
    }
    if (action.startsWith("mock-unavailable:")) {
      const label = action.split(":").slice(1).join(":") || "Unavailable action";
      state.modal = {
        type: "mock",
        title: label,
        copy: "This action is intentionally unavailable in Jobs v0.",
        detail: "It is shown only to indicate a future row-action pattern. It does not change mock data or hide the current record."
      };
      refresh();
      return true;
    }
    if (action === "open-new-job") {
      state.modal = { type: "newJob" };
      refresh();
      return true;
    }
    return false;
  }

  function saveNoteReport(cleanId) {
    const clean = findScheduled(cleanId);
    if (!clean) return;
    const severity = document.getElementById("job-note-severity")?.value || "Note";
    const checklist = document.getElementById("job-note-checklist")?.value || "partial";
    const cleaner = document.getElementById("job-note-cleaner")?.value || "";
    const client = document.getElementById("job-note-client")?.value || "";
    const report = {
      id: `report-${Date.now()}`,
      scheduled_job_id: clean.id,
      job_id: clean.job_id,
      completed_at: "Just now",
      completed_by: clean.assigned_staff || "Assigned team",
      checklist_status: checklist,
      cleaner_remarks: cleaner,
      client_remarks: client,
      severity,
      review_status: "needs_review"
    };
    reports().push(report);
    clean.status = "needs_review";
    clean.report_id = report.id;
    const event = createBillableFromScheduled(clean, "draft");
    event.source_report_id = report.id;
    state.modal = null;
    toast("Needs review report created.");
    refresh();
  }

  function saveSkip(cleanId) {
    const clean = findScheduled(cleanId);
    if (!clean) return;
    clean.status = "skipped";
    clean.skip_reason = document.getElementById("job-skip-reason")?.value || "Skipped by office";
    clean.billable_event_id = "";
    state.modal = null;
    toast("Scheduled clean skipped without a billable event.");
    refresh();
  }

  function markReviewed(reportId) {
    const report = findReport(reportId);
    if (!report) return;
    const clean = findScheduled(report.scheduled_job_id);
    report.review_status = "reviewed";
    if (clean) {
      clean.status = "completed";
      const event = createBillableFromScheduled(clean, "ready_to_bill");
      event.source_report_id = report.id;
    }
    state.modal = clean ? { type: "nextVisit", cleanId: clean.id } : null;
    toast("Report reviewed and billable event is ready.");
    refresh();
  }

  function markNotBillable(reportId) {
    const report = findReport(reportId);
    if (!report) return;
    const clean = findScheduled(report.scheduled_job_id);
    report.review_status = "reviewed";
    if (clean) {
      clean.status = "completed";
      const event = reportBillable(report) || createBillableFromScheduled(clean, "not_billable");
      event.status = "not_billable";
      event.source_report_id = report.id;
      clean.billable_event_id = event.id;
    }
    state.modal = null;
    toast("Report reviewed and marked not billable.");
    refresh();
  }

  document.addEventListener("click", handleClick);

  window.CleanOpsJobs = {
    render,
    handleClick
  };
})();
