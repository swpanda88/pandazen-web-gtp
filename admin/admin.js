const data = {
  leads: [
    {
      id: "lead-1",
      name: "Mrs Harwood",
      area: "Neville's Cross",
      status: "New enquiry",
      source: "Leaflet",
      service: "Regular cleaning",
      contact: "07700 900111",
      note: "Large family home. Wants weekly help and prefers Friday morning.",
      quoteAssist: {
        fitScore: 86,
        priceShopperRisk: "Low",
        estimatedFirstCleanHoursMin: 5,
        estimatedFirstCleanHoursMax: 6.5,
        suggestedPriceLabel: "GBP 150.00-195.00",
        recommendedNextAction: "Strong lead - call and consider home visit",
        confidence: "Medium",
        positiveFlags: ["Regular recurring work", "Values reliability and continuity"],
        riskFlags: []
      }
    },
    {
      id: "lead-2",
      name: "Dr Patel",
      area: "Durham City",
      status: "Contacted",
      source: "Website",
      service: "Deep cleaning",
      contact: "hello@example.com",
      note: "Asked about kitchen and bathroom detailing before guests arrive."
    },
    {
      id: "lead-3",
      name: "Mrs Ellison",
      area: "Shincliffe",
      status: "Assessment booked",
      source: "Referral",
      service: "Regular cleaning",
      contact: "07700 900222",
      note: "Assessment booked Thursday 10:30. Has one friendly dog."
    },
    {
      id: "lead-4",
      name: "Mr Green",
      area: "Bowburn",
      status: "Quote sent",
      source: "Facebook",
      service: "One-off cleaning",
      contact: "07700 900333",
      note: "Quote sent for 5 man-hours one-off clean."
    },
    {
      id: "lead-5",
      name: "Mrs Knowles",
      area: "Aykley Heads",
      status: "Accepted",
      source: "Referral",
      service: "Regular cleaning",
      contact: "07700 900444",
      note: "Accepted weekly Tuesday clean. Convert to client."
    }
  ],
  assessments: [
    {
      id: "assessment-1",
      client: "Mrs Ellison",
      date: "Thu 9 May",
      time: "10:30",
      area: "Shincliffe",
      rooms: "Kitchen, 2 bathrooms, 4 bedrooms, living areas",
      estimate: "4 man-hours weekly",
      notes: "Dog at home. Client prefers fragrance-free products upstairs."
    },
    {
      id: "assessment-2",
      client: "Mrs Turner",
      date: "Fri 10 May",
      time: "14:00",
      area: "Framwellgate Moor",
      rooms: "3 bedroom semi-detached",
      estimate: "3 man-hours fortnightly",
      notes: "Parking on drive. Focus bathrooms and kitchen."
    }
  ],
  clients: [
    {
      id: "client-1",
      name: "Mrs Knowles",
      area: "Aykley Heads",
      frequency: "Weekly Tuesday",
      manHours: "4",
      mainCleaner: "Anna",
      helper: "Optional",
      price: "Bespoke quote",
      notes: "Client values same cleaner. Introduce helper gradually for cover."
    },
    {
      id: "client-2",
      name: "Mrs Ellison",
      area: "Shincliffe",
      frequency: "Pending quote",
      manHours: "4",
      mainCleaner: "Anna",
      helper: "Sam when tight",
      price: "Quote after assessment",
      notes: "Friendly dog. Products preference to confirm."
    }
  ],
  jobs: [
    {
      id: "job-1",
      clientId: 1,
      client: "Mrs Knowles",
      date: "2026-05-12",
      time: "09:00",
      status: "Scheduled",
      type: "Regular clean",
      manHours: "4",
      mainCleaner: "Anna",
      helper: "None",
      instructions: "Focus kitchen and guest bedroom this week. Use client product on marble.",
      checklist: [
        "Kitchen worktops, hob and sink",
        "Bathroom basins, toilets and shower glass",
        "Dust living room surfaces",
        "Vacuum bedrooms and hallway",
        "Mop kitchen and bathroom floors"
      ],
      followups: [
        {
          id: "followup-1",
          clientId: 1,
          sourceJobId: "job-1",
          note: "Follow up next visit: check study shelves if extra kitchen time runs over.",
          status: "open",
          createdBy: "Anna"
        }
      ]
    },
    {
      id: "job-2",
      clientId: 2,
      client: "Mrs Ellison",
      date: "2026-05-14",
      time: "10:30",
      status: "Assessment",
      type: "Home assessment",
      manHours: "1",
      mainCleaner: "Sam",
      helper: "Anna optional",
      instructions: "Measure scope, pets, surfaces, parking and product preferences.",
      checklist: [
        "Confirm rooms and bathrooms",
        "Check pets and access notes",
        "Estimate weekly man-hours",
        "Agree products preference",
        "Prepare quote notes"
      ],
      followups: []
    }
  ],
  invoices: [
    {
      id: "invoice-1",
      number: "PZ-2026-0001",
      client: "Mrs Knowles",
      date: "31 May",
      amount: "GBP 184",
      status: "Draft",
      paid: "-"
    },
    {
      id: "invoice-2",
      number: "PZ-2026-0002",
      client: "Mr Green",
      date: "12 May",
      amount: "GBP 246",
      status: "Sent",
      paid: "-"
    }
  ],
  tasks: [
    {
      id: "task-1",
      title: "Follow up quote request: Mrs Harwood",
      notes: "Call back and qualify regular weekly clean.",
      taskType: "Lead follow-up",
      status: "Open",
      priority: "High",
      dueAt: "2026-05-10T10:00:00Z",
      linkedType: "lead",
      linkedId: "lead-1",
      assignedTo: "admin"
    }
  ]
};

const state = {
  view: "dashboard",
  role: "admin",
  apiReady: false,
  options: {},
  scheduleMonth: null,
  activeDrawerType: null,
  expandedWorkspaces: {
    assessments: null,
    clients: null
  },
  workspaceDrawerMode: {
    assessments: "collapsed",
    clients: "collapsed"
  }
};

const titles = {
  dashboard: "Today",
  leads: "Leads",
  tasks: "Tasks",
  assessments: "Assessments",
  clients: "Clients",
  schedule: "Schedule",
  jobs: "Jobs",
  invoices: "Invoices",
  exports: "Exports"
};

const leadStatuses = ["New enquiry", "Contacted", "Assessment booked", "Quote sent", "Accepted"];
const activeLeadStatusValues = new Set(["new", "contacted", "waiting_customer", "assessment_needed"]);
const closedLeadStatuses = new Set(["rejected", "not_suitable"]);
const convertibleLeadStatuses = new Set(["accepted", "booked", "quote_accepted", "converted"]);
const assessmentHistoryStatuses = new Set(["converted", "rejected", "not_proceeding", "expired", "closed", "cancelled", "lost"]);
const workspaceFirstViews = new Set(["assessments", "clients"]);

const viewTitle = document.querySelector("[data-view-title]");
const drawer = document.querySelector("[data-drawer]");
const backendStatus = document.querySelector("[data-backend-status]");

async function apiGet(path) {
  const response = await fetch(path, {
    headers: { accept: "application/json" }
  });
  if (!response.ok) throw new Error(`API ${path} failed`);
  return response.json();
}

async function apiPost(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`API ${path} failed`);
  return response.json();
}

async function apiPatch(path, body) {
  const response = await fetch(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(`API ${path} failed`);
  return response.json();
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  return node;
}

function setView(view) {
  const previousView = state.view;
  state.view = view;
  viewTitle.textContent = titles[view];
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === view);
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  if (view === "schedule") {
    renderSchedule();
  }
  if (isWorkspaceFirstView(view) && previousView !== view) {
    state.workspaceDrawerMode[view] = "collapsed";
  }
  if (isWorkspaceFirstView(view) && state.activeDrawerType && state.activeDrawerType !== recordTypeForView(view)) {
    resetDrawer();
    return;
  }
  syncWorkspaceFirstLayout();
}

function setRole(role) {
  state.role = role;
  document.body.classList.toggle("cleaner-mode", role === "cleaner");
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });
  if (role === "cleaner") setView("jobs");
}

function formatDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "";
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function parseDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const mondayOffset = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - mondayOffset);
  return start;
}

function monthLabel(date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function monthInputValue(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function addMonths(date, count) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
}

function optionLabel(groupKey, value) {
  const group = state.options[groupKey];
  return group?.options?.find((option) => option.value === value)?.label || value || "";
}

const leadStaticOptions = {
  urgency: [
    { value: "", label: "Select" },
    { value: "flexible", label: "Flexible" },
    { value: "this_month", label: "This month" },
    { value: "asap", label: "As soon as possible" },
    { value: "specific_date", label: "Specific date needed" }
  ],
  propertyType: [
    { value: "", label: "Select" },
    { value: "house", label: "House" },
    { value: "flat_apartment", label: "Flat or apartment" },
    { value: "bungalow", label: "Bungalow" },
    { value: "townhouse", label: "Townhouse" },
    { value: "other", label: "Other" }
  ],
  propertySize: [
    { value: "", label: "Select" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "not_sure", label: "Not sure" }
  ],
  parking: [
    { value: "", label: "Select" },
    { value: "driveway", label: "Driveway or easy parking" },
    { value: "street", label: "Street parking" },
    { value: "permit_paid", label: "Permit or paid parking" },
    { value: "not_sure", label: "Not sure" }
  ],
  photoAvailable: [
    { value: "", label: "Select" },
    { value: "not_needed", label: "Not needed" },
    { value: "whatsapp_if_requested", label: "Yes, I can send photos by WhatsApp if requested" },
    { value: "email_if_requested", label: "Yes, I can send photos by email if requested" },
    { value: "not_sure", label: "Not sure" }
  ],
  bedrooms: [
    { value: "", label: "Select" },
    { value: "0", label: "0" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5+", label: "5+" }
  ],
  bathrooms: [
    { value: "", label: "Select" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4+", label: "4+" }
  ]
};

function staticOptionLabel(groupKey, value) {
  return leadStaticOptions[groupKey]?.find((option) => option.value === value)?.label || "";
}

function leadValueLabel(key, value) {
  if (value === null || value === undefined || value === "") return "";
  const mappedGroups = {
    source: "lead_source",
    serviceType: "service_type",
    preferredContact: "preferred_contact",
    frequency: "frequency",
    propertyCondition: "condition_level",
    productPreferences: "product_preference",
    pets: "pet_type"
  };
  const groupKey = mappedGroups[key];
  return groupKey ? optionLabel(groupKey, value) : staticOptionLabel(key, value) || value;
}

function renderSelect(name, groupKey, currentValue) {
  const group = state.options[groupKey];
  if (!group) {
    return `<input name="${name}" value="${currentValue || ""}">`;
  }
  return `
    <select name="${name}" data-group="${groupKey}">
      ${group.options
        .map((option) => `<option value="${option.value}" ${option.value === currentValue ? "selected" : ""}>${option.label}</option>`)
        .join("")}
    </select>
    <input class="other-field" name="${name}Other" value="" placeholder="Describe other" hidden>
  `;
}

function leadFitScore(lead) {
  return lead.quoteAssist?.fitScore || lead.fitScore || "";
}

function leadRisk(lead) {
  return lead.quoteAssist?.priceShopperRisk || lead.priceShopperRisk || "Review";
}

function leadHours(lead) {
  const assist = lead.quoteAssist;
  if (!assist?.estimatedFirstCleanHoursMin) return "";
  return `${assist.estimatedFirstCleanHoursMin}-${assist.estimatedFirstCleanHoursMax}h`;
}

function leadPrice(lead) {
  return lead.quoteAssist?.suggestedPriceLabel || lead.suggestedPriceLabel || "";
}

function compactMeta(items) {
  return items.filter(Boolean).join(" - ");
}

function parseListValue(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function activeLeads() {
  return data.leads.filter((lead) => {
    const status = String(lead.statusValue || lead.status || "").toLowerCase();
    return activeLeadStatusValues.has(status);
  });
}

function leadHistory() {
  return data.leads.filter((lead) => {
    const status = String(lead.statusValue || lead.status || "").toLowerCase();
    return !activeLeadStatusValues.has(status);
  });
}

function isActiveLead(record) {
  const status = String(record.statusValue || record.status || "").toLowerCase();
  return activeLeadStatusValues.has(status);
}

function fullLead(record) {
  return data.leads.find((lead) => String(lead.id) === String(record.id)) || record;
}

function clientForLead(record) {
  return (data.clients || []).find((client) => String(client.leadId) === String(record.id));
}

function assessmentQuoteForLead(record) {
  return (data.assessments || []).find((assessment) => String(assessment.leadId) === String(record.id));
}

function isConvertibleLead(record) {
  return convertibleLeadStatuses.has(String(record.statusValue || record.status || "").toLowerCase());
}

function canCreateAssessmentQuote(record) {
  const status = String(record.statusValue || record.status || "").toLowerCase();
  return activeLeadStatusValues.has(status);
}

function isHistoryAssessment(record) {
  if (!record) return false;
  if (record.convertedClientId || record.isConverted) return true;
  const status = String(record.status || "").toLowerCase();
  const quoteStage = String(record.quoteStage || "").toLowerCase();
  return assessmentHistoryStatuses.has(status) || assessmentHistoryStatuses.has(quoteStage);
}

function isActiveAssessment(record) {
  return !isHistoryAssessment(record);
}

function assessmentStatusDisplay(record) {
  return record.quoteStageLabel || record.quoteStage || record.statusLabel || record.status || "Draft";
}

function clientStatusDisplay(record) {
  return record.status || (record.convertedAt ? "Converted" : "Active");
}

function expandedWorkspaceState(view) {
  return state.expandedWorkspaces?.[view] || null;
}

function isWorkspaceExpanded(view, record) {
  const workspace = expandedWorkspaceState(view);
  return Boolean(workspace && String(workspace.id) === String(record.id));
}

function setExpandedWorkspace(view, recordId, tab = "overview") {
  if (!state.expandedWorkspaces[view]) {
    state.expandedWorkspaces[view] = { id: recordId, tab };
  } else {
    state.expandedWorkspaces[view] = { id: recordId, tab: tab || state.expandedWorkspaces[view].tab || "overview" };
  }
  renderTables();
  syncWorkspaceFirstLayout();
}

function toggleExpandedWorkspace(view, recordId, defaultTab = "overview") {
  const current = expandedWorkspaceState(view);
  if (current && String(current.id) === String(recordId)) {
    state.expandedWorkspaces[view] = null;
  } else {
    state.expandedWorkspaces[view] = { id: recordId, tab: defaultTab };
    if (isWorkspaceFirstView(view)) {
      state.workspaceDrawerMode[view] = "collapsed";
    }
  }
  renderTables();
  syncWorkspaceFirstLayout();
}

function setWorkspaceTab(view, recordId, tab) {
  state.expandedWorkspaces[view] = { id: recordId, tab };
  renderTables();
  syncWorkspaceFirstLayout();
}

function isWorkspaceFirstView(view = state.view) {
  return workspaceFirstViews.has(view);
}

function recordTypeForView(view = state.view) {
  if (view === "assessments") return "assessment";
  if (view === "clients") return "client";
  return null;
}

function workspaceDrawerMode(view = state.view) {
  return state.workspaceDrawerMode[view] || "collapsed";
}

function setWorkspaceDrawerMode(mode, view = state.view) {
  if (!isWorkspaceFirstView(view)) return;
  state.workspaceDrawerMode[view] = mode;
  syncWorkspaceFirstLayout();
}

function toggleWorkspaceDrawerMode() {
  if (!isWorkspaceFirstView()) return;
  setWorkspaceDrawerMode(workspaceDrawerMode() === "collapsed" ? "expanded" : "collapsed");
}

function syncWorkspaceFirstLayout() {
  const workspaceFirst = isWorkspaceFirstView();
  const hasExpandedWorkspace = workspaceFirst && Boolean(expandedWorkspaceState(state.view));
  const drawerCollapsed = workspaceFirst && workspaceDrawerMode() === "collapsed";
  document.body.classList.toggle("workspace-first-view", workspaceFirst);
  document.body.classList.toggle("workspace-first-drawer-collapsed", workspaceFirst && drawerCollapsed);
  document.body.classList.toggle("workspace-first-drawer-expanded", workspaceFirst && !drawerCollapsed);
  document.body.classList.toggle("workspace-first-has-expanded-workspace", hasExpandedWorkspace);
  drawer.classList.toggle("workspace-first-drawer", workspaceFirst);
  drawer.classList.toggle("is-collapsed", workspaceFirst && drawerCollapsed);
  drawer.classList.toggle("is-expanded", workspaceFirst && !drawerCollapsed);
}

function clientServiceLabel(record) {
  return record.qaServiceLabel || record.originalServiceLabel || record.serviceLabel || record.service || record.originalServiceType || "";
}

function clientFrequencyLabel(record) {
  return record.frequencyLabel || record.frequency || record.qaFrequencyLabel || record.qaFrequency || record.requestedFrequencyLabel || record.requestedFrequency || "";
}

function clientOriginalLeadId(record) {
  return record.originalLeadId || record.leadId || "";
}

function leadStatusOptions() {
  const options = state.options.lead_status?.options;
  if (options?.length) return options.filter((option) => activeLeadStatusValues.has(option.value));
  const seen = new Set();
  return activeLeads().reduce((items, lead) => {
    const value = lead.statusValue || lead.status || "new";
    if (seen.has(value)) return items;
    seen.add(value);
    items.push({ value, label: lead.statusLabel || lead.status || "New enquiry" });
    return items;
  }, []);
}

function emptyState(title, message) {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function detailValue(value, type = "text") {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "";
  if (type === "boolean") return value ? "Yes" : "No";
  if (type === "money" && typeof value === "number") {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value / 100);
  }
  return value ?? "";
}

function formatMoneyPence(amountPence) {
  if (amountPence === null || amountPence === undefined || amountPence === "") return "";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(amountPence) / 100);
}

function detailRows(fields) {
  return `
    <div class="detail-grid">
      ${fields
        .map(([label, value, type = "text"]) => {
          const rendered = detailValue(value, type);
          const className = `detail-value ${type === "badge" ? "badge" : ""} ${type === "boolean" ? "boolean" : ""} ${rendered ? "" : "empty"}`.trim();
          return `
            <div class="detail-row">
              <div class="detail-label">${escapeHtml(label)}</div>
              <div class="${className}">${escapeHtml(rendered || "Not selected")}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function placeholderPanel(message) {
  return `<div class="workspace-placeholder"><p>${escapeHtml(message)}</p></div>`;
}

function listSummary(items, emptyMessage, renderer, className = "workspace-list compact") {
  if (!items.length) return placeholderPanel(emptyMessage);
  return `<div class="${className}">${items.map(renderer).join("")}</div>`;
}

function workspaceSummaryRows(fields) {
  return `
    <div class="workspace-summary-grid">
      ${fields
        .map(([label, value]) => {
          const rendered = detailValue(value);
          return `
            <div class="workspace-summary-row">
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(rendered || "Not available")}</strong>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function noteSummary(notes, emptyMessage) {
  if (!notes.length) return placeholderPanel(emptyMessage);
  return `
    <div class="workspace-list compact">
      ${notes
        .map((note) => `
          <article class="workspace-list-item">
            <strong>${escapeHtml(formatDateTime(note.createdAt) || "Saved note")}</strong>
            <p>${escapeHtml(note.note || note.text || "")}</p>
            <small>${escapeHtml(compactMeta([note.noteType, note.createdBy]))}</small>
          </article>
        `)
        .join("")}
    </div>
  `;
}

function renderEditableSelect({ name, groupKey, currentValue, otherValue = "", staticOptions = null }) {
  const group = groupKey ? state.options[groupKey] : null;
  const allowOther = Boolean(group?.allowOther || staticOptions?.some((option) => option.value === "other"));
  const rawOptions = group
    ? [{ value: "", label: "Select" }, ...group.options.map((option) => ({ value: option.value, label: option.label }))]
    : staticOptions || [];
  if (currentValue && !rawOptions.some((option) => option.value === currentValue)) {
    rawOptions.push({
      value: currentValue,
      label: optionLabel(groupKey, currentValue) || staticOptionLabel(name, currentValue) || currentValue
    });
  }
  const seen = new Set();
  const options = rawOptions.filter((option) => {
    const key = `${option.value}|${option.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return `
    <select name="${escapeHtml(name)}" data-group="${escapeHtml(groupKey || name)}">
      ${options
        .map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === (currentValue || "") ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
        .join("")}
    </select>
    ${
      allowOther
        ? `<input class="other-field" name="${escapeHtml(name)}Other" value="${escapeHtml(otherValue || "")}" placeholder="Describe other" hidden>`
        : ""
    }
  `;
}

function renderEditableInput(label, markup, className = "") {
  return `
    <label class="${escapeHtml(className)}">
      <span>${escapeHtml(label)}</span>
      ${markup}
    </label>
  `;
}

function leadEditDraft(record) {
  return {
    id: record.id,
    name: record.name || "",
    phone: record.phone || "",
    email: record.email || "",
    area: record.area || "",
    address: record.address || "",
    postcode: record.postcode || "",
    preferredContact: record.preferredContact || "",
    source: record.source || "",
    sourceOther: record.sourceOther || "",
    serviceType: record.serviceType || "",
    serviceOther: record.serviceOther || "",
    preferredDays: record.preferredDays || "",
    bestContactTime: record.bestContactTime || "",
    frequency: record.frequency || "",
    urgency: record.urgency || "",
    propertyType: record.propertyType || "",
    bedrooms: record.bedrooms || "",
    bathrooms: record.bathrooms || "",
    receptionRooms: record.receptionRooms || "",
    kitchenSize: record.kitchenSize || "",
    propertySize: record.propertySize || "",
    propertyCondition: record.propertyCondition || "",
    priorities: Array.isArray(record.priorities) ? record.priorities.join(", ") : (parseListValue(record.priorities).join(", ") || record.priorities || ""),
    pets: record.pets || "",
    parking: record.parking || "",
    productPreferences: record.productPreferences || "",
    photoAvailable: record.photoAvailable || "",
    notes: record.notes || ""
  };
}

function renderCollapsibleSection(title, content, open = false) {
  return `
    <details class="drawer-collapsible" ${open ? "open" : ""}>
      <summary>${escapeHtml(title)}</summary>
      <div class="drawer-collapsible-body">
        ${content}
      </div>
    </details>
  `;
}

function renderLeadStatusForm(record) {
  const current = record.statusValue || record.status || "new";
  if (!activeLeadStatusValues.has(String(current).toLowerCase())) return "";
  const options = leadStatusOptions();
  if (!options.length) return "";
  return `
    <div class="lead-action-group">
      <h4>Update status</h4>
      <form class="lead-action-form compact" data-lead-status-form>
        <label>
          Status
          <select name="status">
            ${options
              .map((option) => `<option value="${escapeHtml(option.value)}" ${option.value === current ? "selected" : ""}>${escapeHtml(option.label)}</option>`)
              .join("")}
          </select>
        </label>
        <button class="primary lead-action-primary" type="submit">Save status</button>
      </form>
    </div>
  `;
}

function renderLeadNotes(record) {
  const notes = record.leadNotes || [];
  const [latestNote, ...olderNotes] = notes;
  return `
    <section class="drawer-section">
      <h3>Lead notes</h3>
      ${
        latestNote
          ? `<div class="note-list compact">
              <article class="note-item latest">
                <strong>${escapeHtml(formatDateTime(latestNote.createdAt) || "Saved note")}</strong>
                <p>${escapeHtml(latestNote.note)}</p>
                <small>${escapeHtml(compactMeta([latestNote.noteType, latestNote.createdBy]))}</small>
              </article>
            </div>
            ${
              olderNotes.length
                ? renderCollapsibleSection(
                    `Older notes (${olderNotes.length})`,
                    `<div class="note-list compact">
                      ${olderNotes
                        .map((note) => `
                          <article class="note-item">
                            <strong>${escapeHtml(formatDateTime(note.createdAt) || "Saved note")}</strong>
                            <p>${escapeHtml(note.note)}</p>
                            <small>${escapeHtml(compactMeta([note.noteType, note.createdBy]))}</small>
                          </article>
                        `)
                        .join("")}
                    </div>`
                  )
                : ""
            }`
          : `<p class="record-sub">No notes yet.</p>`
      }
      <form class="lead-action-form compact" data-lead-note-form>
        <label>
          Add note
          <textarea name="note" rows="3" placeholder="Add call outcome, client preference or next step."></textarea>
        </label>
        <button class="primary" type="submit">Save note</button>
      </form>
      <p class="record-sub" data-lead-action-status></p>
    </section>
  `;
}

function renderOriginalLeadNotes(record) {
  const notes = record.originalLeadNotes || [];
  if (!clientOriginalLeadId(record)) return "";
  return `
    <section class="drawer-section">
      <h3>Original lead notes</h3>
      ${
        notes.length
          ? `<div class="note-list">
              ${notes
                .map((note) => `
                  <article class="note-item">
                    <strong>${escapeHtml(formatDateTime(note.createdAt) || "Saved note")}</strong>
                    <p>${escapeHtml(note.note)}</p>
                    <small>${escapeHtml(compactMeta([note.noteType, note.createdBy]))}</small>
                  </article>
                `)
                .join("")}
            </div>`
          : `<p class="record-sub">No linked lead history notes yet.</p>`
      }
    </section>
  `;
}

function renderLeadOutcomeActions(record) {
  if (!isActiveLead(record)) return "";
  if (assessmentQuoteForLead(record)) {
    return `
      <div class="lead-action-group">
        <h4>Close Lead</h4>
        <p class="record-sub">This lead already has a linked Q&A / Assessment, so close-out should continue from that stage rather than the original Lead record.</p>
      </div>
    `;
  }

  return `
    <div class="lead-action-group">
      <h4>Close Lead</h4>
      <div class="drawer-actions compact split">
        <button class="ghost" type="button" data-close-lead-status="rejected">Rejected</button>
        <button class="ghost" type="button" data-close-lead-status="not_suitable">Not suitable</button>
      </div>
      <p class="record-sub" data-lead-close-status></p>
    </div>
  `;
}

function renderClientAccountingQuote(record) {
  const quote = record.accountingQuote;
  if (!quote && !record.assessmentQuoteId) return "";
  return `
    <section class="drawer-section">
      <h3>Linked quote</h3>
      ${
        quote
          ? detailRows([
              ["Reference", quote.displayReference],
              ["Status", quote.status],
              ["Total", formatMoneyPence(quote.totalPrice)],
              ["Recurring", formatMoneyPence(quote.recurringPrice)],
              ["Source Q&A", record.assessmentQuoteId ? `#${record.assessmentQuoteId}` : ""]
            ])
          : `<p class="record-sub">No linked accounting quote has been created from this Q&A yet.</p>`
      }
    </section>
  `;
}

function renderLinkedLeadNotes(record) {
  const notes = record.linkedLeadNotes || [];
  if (!record.leadId) return "";
  return `
    <section class="drawer-section">
      <h3>Linked lead notes</h3>
      ${
        notes.length
          ? `<div class="note-list">
              ${notes
                .map((note) => `
                  <article class="note-item">
                    <strong>${escapeHtml(formatDateTime(note.createdAt) || "Saved note")}</strong>
                    <p>${escapeHtml(note.note)}</p>
                    <small>${escapeHtml(compactMeta([note.noteType, note.createdBy]))}</small>
                  </article>
                `)
                .join("")}
            </div>`
          : `<p class="record-sub">No linked lead notes yet.</p>`
      }
    </section>
  `;
}

function assistHourRange(assist, prefix) {
  const min = assist?.[`${prefix}Min`];
  const max = assist?.[`${prefix}Max`];
  if (!min && !max) return "";
  if (min && max) return `${min}-${max}h`;
  return `${min || max}h`;
}

function renderAssessmentQuoteAssist(record) {
  const assist = record.quoteAssist;
  return `
    <section class="drawer-section">
      <h3>Quote Assist</h3>
      ${
        assist
          ? detailRows([
              ["Fit score", `${assist.fitScore}/100`],
              ["Risk", assist.priceShopperRisk],
              ["Travel", assist.travelSuitability],
              ["First clean", assistHourRange(assist, "estimatedFirstCleanHours")],
              ["Recurring", assistHourRange(assist, "estimatedRecurringHours")],
              ["Suggested range", assist.suggestedPriceLabel || `${formatMoneyPence(assist.suggestedPriceMin)}-${formatMoneyPence(assist.suggestedPriceMax)}`],
              ["Minimum price", assist.minimumRecommendedPriceLabel || formatMoneyPence(assist.minimumRecommendedPrice)],
              ["Next action", assist.recommendedNextAction],
              ["Confidence", assist.confidence],
              ["Explanation", assist.explanation],
              ["Risk flags", (assist.riskFlags || []).join("; ")],
              ["Positive flags", (assist.positiveFlags || []).join("; ")],
              ["Rule version", assist.ruleVersion],
              ["Last run", formatDateTime(assist.updatedAt || assist.createdAt)]
            ])
          : `<p class="record-sub">No Quote Assist result yet. Run it from this Q&A record when the available detail is ready.</p>`
      }
      <div class="drawer-actions">
        <button class="primary" type="button" data-run-quote-assist="${escapeHtml(record.id)}">Run Quote Assist</button>
      </div>
      <p class="record-sub" data-assessment-action-status></p>
    </section>
  `;
}

function renderAssessmentAccountingQuote(record) {
  const quote = record.accountingQuote;
  return `
    <section class="drawer-section">
      <h3>Accounting quote</h3>
      ${
        quote
          ? detailRows([
              ["Reference", quote.displayReference],
              ["Status", quote.status],
              ["Version", quote.versionNumber],
              ["Total", quote.totalPriceLabel || formatMoneyPence(quote.totalPrice)],
              ["Recurring", quote.recurringPriceLabel || formatMoneyPence(quote.recurringPrice)],
              ["Valid until", quote.validUntil],
              ["Updated", formatDateTime(quote.updatedAt || quote.createdAt)]
            ])
          : `<p class="record-sub">No draft Accounting quote has been created from this Q&A yet.</p>`
      }
      <div class="drawer-actions">
        ${
          quote
            ? `<button class="ghost" type="button" disabled aria-disabled="true">Draft quote linked</button>`
            : `<button class="primary" type="button" data-create-accounting-quote="${escapeHtml(record.id)}">Create Draft Quote</button>`
        }
      </div>
      <p class="record-sub" data-assessment-quote-status></p>
    </section>
  `;
}

function clientForAssessmentQuote(record) {
  return (data.clients || []).find((client) => String(client.assessmentQuoteId) === String(record.id))
    || (record.convertedClientId ? (data.clients || []).find((client) => String(client.id) === String(record.convertedClientId)) : null);
}

function renderAssessmentQuoteConversion(record) {
  const client = clientForAssessmentQuote(record);
  return `
    <section class="drawer-section">
      <h3>Client & Home</h3>
      <div class="drawer-actions">
        ${
          client
            ? `<button class="primary" type="button" data-open-qa-client="${escapeHtml(client.id)}">Open Client & Home</button>`
            : `<button class="primary" type="button" data-convert-assessment-quote="${escapeHtml(record.id)}">Accept & Convert to Client & Home</button>`
        }
      </div>
      <p class="record-sub">${
        client
          ? `Converted to Client & Home #${escapeHtml(client.id)}`
          : "Marks this Q&A as accepted and creates a linked Client & Home record."
      }</p>
      <p class="record-sub" data-assessment-conversion-status></p>
    </section>
  `;
}

function leadTasks(record) {
  return (data.tasks || []).filter((task) => task.linkedType === "lead" && String(task.linkedId) === String(record.id));
}

function renderLeadTasks(record) {
  const tasks = leadTasks(record);
  const openTasks = tasks.filter((task) => String(task.status || "").toLowerCase() !== "done");
  const doneTasks = tasks.filter((task) => String(task.status || "").toLowerCase() === "done");
  return `
    <section class="drawer-section">
      <h3>Linked tasks</h3>
      ${
        openTasks.length
          ? `<div class="linked-task-list compact">
              ${openTasks
                .map((task) => `
                  <article class="linked-task-item">
                    <div>
                      <strong>${escapeHtml(task.title)}</strong>
                      <small>${escapeHtml(compactMeta([task.status, task.priority, formatDateTime(task.dueAt)]))}</small>
                    </div>
                    ${
                      task.status === "Open"
                        ? `<button class="ghost" type="button" data-task-done="${escapeHtml(task.id)}">Done</button>`
                        : ""
                    }
                  </article>
                `)
                .join("")}
            </div>`
          : `<p class="record-sub">No linked tasks yet.</p>`
      }
      ${
        doneTasks.length
          ? renderCollapsibleSection(
              `Done tasks (${doneTasks.length})`,
              `<div class="linked-task-list compact">
                ${doneTasks
                  .map((task) => `
                    <article class="linked-task-item">
                      <div>
                        <strong>${escapeHtml(task.title)}</strong>
                        <small>${escapeHtml(compactMeta([task.status, task.priority, formatDateTime(task.dueAt)]))}</small>
                      </div>
                    </article>
                  `)
                  .join("")}
              </div>`
            )
          : ""
      }
    </section>
  `;
}

function renderLeadConversion(record) {
  const client = clientForLead(record);
  if (!client) return "";
  return `
    <div class="lead-action-group">
      <h4>Client & Home</h4>
      <div class="drawer-actions compact">
        <button class="primary lead-action-primary" type="button" data-open-client="${escapeHtml(client.id)}">Open Client & Home</button>
      </div>
      <p class="record-sub">Linked to client #${escapeHtml(client.id)}</p>
    </div>
  `;
}

function renderLeadAssessmentQuote(record) {
  const assessmentQuote = assessmentQuoteForLead(record);
  if (!assessmentQuote && !canCreateAssessmentQuote(record)) return "";
  return `
    <div class="lead-action-group">
      <h4>Assessment / Quote</h4>
      <div class="drawer-actions compact">
        ${
          assessmentQuote
            ? `<button class="primary lead-action-primary" type="button" data-open-assessment-quote="${escapeHtml(assessmentQuote.id)}">Open Assessment / Quote</button>`
            : `<button class="primary lead-action-primary" type="button" data-create-assessment-quote="${escapeHtml(record.id)}">Create Assessment / Quote</button>`
        }
      </div>
      ${
        assessmentQuote
          ? `<p class="record-sub">Linked Q&A #${escapeHtml(assessmentQuote.id)} - ${escapeHtml(assessmentQuote.quoteStageLabel || assessmentQuote.quoteStage || assessmentQuote.statusLabel || assessmentQuote.status || "Draft")}</p>`
          : ""
      }
    </div>
  `;
}

function renderLeadLinkedRecords(record) {
  const assessmentQuote = assessmentQuoteForLead(record);
  const client = clientForLead(record);
  if (!assessmentQuote && !client) return "";
  return `
    <section class="drawer-section">
      <div class="lead-action-stack">
        ${assessmentQuote ? renderLeadAssessmentQuote(record) : ""}
        ${client ? renderLeadConversion(record) : ""}
      </div>
    </section>
  `;
}

function renderLeadIntakeDetails(record) {
  const priorityValue = Array.isArray(record.priorities)
    ? record.priorities.join(", ")
    : parseListValue(record.priorities).join(", ") || record.priorities;
  return detailRows([
    ["Address", record.address],
    ["Postcode", record.postcode],
    ["Preferred days", record.preferredDays],
    ["Best contact time", record.bestContactTime],
    ["Frequency", record.frequencyLabel || leadValueLabel("frequency", record.frequency)],
    ["Urgency", leadValueLabel("urgency", record.urgency)],
    ["Property type", leadValueLabel("propertyType", record.propertyType)],
    ["Bedrooms", record.bedrooms],
    ["Bathrooms", record.bathrooms],
    ["Reception rooms", record.receptionRooms],
    ["Kitchen size", record.kitchenSize],
    ["Property size", leadValueLabel("propertySize", record.propertySize)],
    ["Condition", leadValueLabel("propertyCondition", record.propertyCondition)],
    ["Priorities", priorityValue],
    ["Pets", leadValueLabel("pets", record.pets)],
    ["Parking", leadValueLabel("parking", record.parking)],
    ["Products", leadValueLabel("productPreferences", record.productPreferences)],
    ["Photos available", leadValueLabel("photoAvailable", record.photoAvailable)],
    ["Privacy accepted", record.privacyPolicyAccepted, "boolean"],
    ["Marketing opt-in", record.marketingOptIn, "boolean"],
    ["Lead notes", record.notes],
    ["Lost reason", record.lostReason],
    ["Closed", formatDateTime(record.closedAt)]
  ]);
}

function renderLeadContactSection(record, isEditing, draft) {
  if (!isEditing) {
    return `
      <section class="drawer-section">
        <div class="drawer-section-head">
          <h3>Contact</h3>
          <div class="drawer-actions compact drawer-section-tools">
            <button class="ghost" type="button" data-edit-lead-details>Edit details</button>
          </div>
        </div>
        ${detailRows([
          ["Name", record.name],
          ["Area", record.area],
          ["Phone", record.phone],
          ["Email", record.email],
          ["Contact", record.preferredContactLabel || record.preferredContact || record.contact],
          ["Source", record.sourceLabel || record.source]
        ])}
      </section>
    `;
  }

  return `
    <section class="drawer-section">
        <div class="drawer-section-head">
          <h3>Contact</h3>
          <div class="drawer-actions compact drawer-section-tools">
            <button class="ghost" type="button" data-cancel-lead-details>Cancel</button>
            <button class="primary lead-action-primary lead-edit-save" type="submit">Save</button>
          </div>
        </div>
      <div class="field-grid lead-edit-grid">
        ${renderEditableInput("Customer name", `<input name="name" value="${escapeHtml(draft.name)}">`)}
        ${renderEditableInput("Phone", `<input name="phone" value="${escapeHtml(draft.phone)}">`)}
        ${renderEditableInput("Email", `<input name="email" type="email" value="${escapeHtml(draft.email)}">`)}
        ${renderEditableInput("Area", `<input name="area" value="${escapeHtml(draft.area)}">`)}
        ${renderEditableInput("Address", `<input name="address" value="${escapeHtml(draft.address)}">`, "field-span-2")}
        ${renderEditableInput("Postcode", `<input name="postcode" value="${escapeHtml(draft.postcode)}">`)}
        ${renderEditableInput("Preferred contact", renderEditableSelect({ name: "preferredContact", groupKey: "preferred_contact", currentValue: draft.preferredContact }))}
        ${renderEditableInput("Source", renderEditableSelect({ name: "source", groupKey: "lead_source", currentValue: draft.source, otherValue: draft.sourceOther }))}
      </div>
      <p class="record-sub" data-lead-details-status></p>
    </section>
  `;
}

function renderLeadEditIntakeFields(draft) {
  return `
    <div class="field-grid lead-edit-grid">
      ${renderEditableInput("Service type", renderEditableSelect({ name: "serviceType", groupKey: "service_type", currentValue: draft.serviceType, otherValue: draft.serviceOther }))}
      ${renderEditableInput("Frequency", renderEditableSelect({ name: "frequency", groupKey: "frequency", currentValue: draft.frequency }))}
      ${renderEditableInput("Preferred days", `<input name="preferredDays" value="${escapeHtml(draft.preferredDays)}" placeholder="e.g. Tuesday morning">`)}
      ${renderEditableInput("Best contact time", `<input name="bestContactTime" value="${escapeHtml(draft.bestContactTime)}" placeholder="e.g. after 6pm">`)}
      ${renderEditableInput("Urgency", renderEditableSelect({ name: "urgency", currentValue: draft.urgency, staticOptions: leadStaticOptions.urgency }))}
      ${renderEditableInput("Property type", renderEditableSelect({ name: "propertyType", currentValue: draft.propertyType, staticOptions: leadStaticOptions.propertyType }))}
      ${renderEditableInput("Bedrooms", renderEditableSelect({ name: "bedrooms", currentValue: draft.bedrooms, staticOptions: leadStaticOptions.bedrooms }))}
      ${renderEditableInput("Bathrooms", renderEditableSelect({ name: "bathrooms", currentValue: draft.bathrooms, staticOptions: leadStaticOptions.bathrooms }))}
      ${renderEditableInput("Reception rooms", `<input name="receptionRooms" type="number" min="0" step="1" value="${escapeHtml(draft.receptionRooms)}">`)}
      ${renderEditableInput("Kitchen size", `<input name="kitchenSize" value="${escapeHtml(draft.kitchenSize)}">`)}
      ${renderEditableInput("Property size", renderEditableSelect({ name: "propertySize", currentValue: draft.propertySize, staticOptions: leadStaticOptions.propertySize }))}
      ${renderEditableInput("Property condition", renderEditableSelect({ name: "propertyCondition", groupKey: "condition_level", currentValue: draft.propertyCondition }))}
      ${renderEditableInput("Pets", renderEditableSelect({ name: "pets", groupKey: "pet_type", currentValue: draft.pets }))}
      ${renderEditableInput("Parking", renderEditableSelect({ name: "parking", currentValue: draft.parking, staticOptions: leadStaticOptions.parking }))}
      ${renderEditableInput("Product preferences", renderEditableSelect({ name: "productPreferences", groupKey: "product_preference", currentValue: draft.productPreferences }))}
      ${renderEditableInput("Photos available", renderEditableSelect({ name: "photoAvailable", currentValue: draft.photoAvailable, staticOptions: leadStaticOptions.photoAvailable }))}
      ${renderEditableInput("Priorities", `<textarea name="priorities" rows="2" placeholder="Trust, same cleaner, kitchen focus">${escapeHtml(draft.priorities)}</textarea>`, "field-span-2")}
      ${renderEditableInput("Notes", `<textarea name="notes" rows="4" placeholder="Key enquiry notes for admin review.">${escapeHtml(draft.notes)}</textarea>`, "field-span-2")}
    </div>
  `;
}

let leadDetailsEditState = null;

function isEditingLeadDetails(record) {
  return Boolean(leadDetailsEditState && String(leadDetailsEditState.id) === String(record.id));
}

function renderLeadDetailSections(record) {
  const isEditing = isEditingLeadDetails(record);
  const draft = isEditing ? leadDetailsEditState : leadEditDraft(record);
  const contactSection = renderLeadContactSection(record, isEditing, draft);
  const intakeContent = isEditing ? renderLeadEditIntakeFields(draft) : renderLeadIntakeDetails(record);
  const intakeOpen = isEditing;
  const intakeSection = `
    <section class="drawer-section">
      ${renderCollapsibleSection("Full enquiry / intake details", intakeContent, intakeOpen)}
    </section>
  `;

  if (!isEditing) {
    return `${contactSection}${intakeSection}`;
  }

  return `
    <form data-lead-details-form>
      ${contactSection}
      ${intakeSection}
    </form>
  `;
}

function renderLeadWorkingSection(record) {
  if (!isActiveLead(record)) return "";
  return `
    <section class="drawer-section">
      <div class="lead-action-stack">
        ${renderLeadStatusForm(record)}
        ${renderLeadAssessmentQuote(record)}
        ${renderLeadConversion(record)}
        ${renderLeadOutcomeActions(record)}
      </div>
      <p class="record-sub" data-lead-action-status></p>
    </section>
  `;
}

function compactDrawerLabel(parts) {
  return parts.filter(Boolean).join(" - ");
}

function renderDrawerTitlebar({ eyebrow, title, subtitle, compactTitle, showDrawerToggle = false }) {
  return `
    <div class="drawer-titlebar">
      <div class="drawer-titlebar-main">
        <div class="drawer-title-copy">
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(subtitle || "")}</p>
        </div>
        <div class="drawer-titlebar-compact">${escapeHtml(compactTitle || title)}</div>
      </div>
      <div class="drawer-titlebar-tools">
        ${
          showDrawerToggle
            ? `<button class="drawer-toggle" type="button" data-toggle-workspace-drawer aria-label="${workspaceDrawerMode() === "collapsed" ? "Open detail drawer" : "Minimise detail drawer"}">${workspaceDrawerMode() === "collapsed" ? "Open drawer" : "Minimise"}</button>`
            : ""
        }
        <button class="drawer-close" type="button" data-close-drawer aria-label="Close detail panel">Close</button>
      </div>
    </div>
  `;
}

let drawerScrollHandler = null;

function renderDrawerFrame({ titlebar, body, bodyTag = "div", bodyAttrs = "", frameClass = "" }) {
  return `
    <div class="drawer-frame ${frameClass}">
      <div class="drawer-header">
        ${titlebar}
      </div>
      <${bodyTag} class="drawer-body" ${bodyAttrs}>
        <div class="drawer-content">
          ${body}
        </div>
      </${bodyTag}>
    </div>
  `;
}

function setupDrawerChrome() {
  if (drawerScrollHandler) {
    drawer.querySelector(".drawer-body")?.removeEventListener("scroll", drawerScrollHandler);
    drawerScrollHandler = null;
  }

  const titlebar = drawer.querySelector(".drawer-titlebar");
  const drawerHeader = drawer.querySelector(".drawer-header");
  const drawerBody = drawer.querySelector(".drawer-body");
  if (!titlebar || !drawerBody) return;

  drawerBody.scrollTop = 0;
  let isCompact = false;
  drawerScrollHandler = () => {
    const scrollTop = drawerBody.scrollTop;
    const shouldCompact = isCompact ? scrollTop > 10 : scrollTop > 24;
    if (shouldCompact !== isCompact) {
      isCompact = shouldCompact;
      titlebar.classList.toggle("is-scrolled", isCompact);
      drawerHeader?.classList.toggle("is-scrolled", isCompact);
    }
  };

  drawerBody.addEventListener("scroll", drawerScrollHandler, { passive: true });
  drawerScrollHandler();
  drawer.querySelector("[data-close-drawer]")?.addEventListener("click", resetDrawer);
  drawer.querySelector("[data-toggle-workspace-drawer]")?.addEventListener("click", toggleWorkspaceDrawerMode);
  syncWorkspaceFirstLayout();
}

function renderLeadDrawer(record) {
  const title = record.name || "New lead";
  const subtitle = record.serviceLabel || record.service || "Customer enquiry";
  const titlebar = renderDrawerTitlebar({
    eyebrow: "Lead",
    title,
    subtitle,
    compactTitle: compactDrawerLabel([title, "Lead", subtitle, record.statusLabel || record.status])
  });
  const body = `
      ${renderLeadDetailSections(record)}

      ${renderLeadWorkingSection(record)}
      ${renderLeadLinkedRecords(record)}
      ${renderLeadTasks(record)}
      ${renderLeadNotes(record)}

      <section class="drawer-section">
        <h3>Progress</h3>
        ${detailRows([
          ["Status", record.statusLabel || record.status],
          ["Service", record.serviceLabel || record.service],
          ["Created", formatDateTime(record.createdAt)],
          ["Updated", formatDateTime(record.updatedAt)]
        ])}
      </section>
  `;
  return renderDrawerFrame({
    titlebar,
    body,
    frameClass: "lead-drawer"
  });
}

function leadDrawerTools(type, record) {
  if (type !== "lead" || !state.apiReady || !record.id) return "";
  return `${renderLeadStatusForm(record)}${renderLeadAssessmentQuote(record)}${renderLeadOutcomeActions(record)}${renderLeadConversion(record)}${renderLeadTasks(record)}${renderLeadNotes(record)}`;
}

async function refreshLeadDrawer(leadId) {
  await loadApiData();
  const updated = data.leads.find((lead) => String(lead.id) === String(leadId));
  if (updated) openDrawer("lead", updated);
}

function setLeadActionStatus(message) {
  const status = drawer.querySelector("[data-lead-action-status]");
  if (status) status.textContent = message;
}

function setLeadCloseStatus(message) {
  const status = drawer.querySelector("[data-lead-close-status]");
  if (status) status.textContent = message;
}

function setLeadDetailStatus(message) {
  const status = drawer.querySelector("[data-lead-details-status]");
  if (status) status.textContent = message;
}

function openAssessmentQuoteFromLead(assessmentQuoteId) {
  const assessmentQuote = data.assessments.find((item) => String(item.id) === String(assessmentQuoteId));
  if (!assessmentQuote) {
    setLeadActionStatus("Assessment / Quote is not available in the current D1 data.");
    return false;
  }
  setView("assessments");
  openDrawer("assessment", assessmentQuote);
  return true;
}

function normaliseLeadDetailsPayload(formData) {
  const raw = Object.fromEntries(formData.entries());
  const trimmed = (value) => {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text ? text : null;
  };

  return {
    name: trimmed(raw.name),
    phone: trimmed(raw.phone),
    email: trimmed(raw.email),
    area: trimmed(raw.area),
    address: trimmed(raw.address),
    postcode: trimmed(raw.postcode),
    preferredContact: trimmed(raw.preferredContact),
    source: trimmed(raw.source),
    sourceOther: raw.source === "other" ? trimmed(raw.sourceOther) : null,
    serviceType: trimmed(raw.serviceType),
    serviceOther: raw.serviceType === "other" ? trimmed(raw.serviceTypeOther) : null,
    preferredDays: trimmed(raw.preferredDays),
    bestContactTime: trimmed(raw.bestContactTime),
    frequency: trimmed(raw.frequency),
    urgency: trimmed(raw.urgency),
    propertyType: trimmed(raw.propertyType),
    bedrooms: trimmed(raw.bedrooms),
    bathrooms: trimmed(raw.bathrooms),
    receptionRooms: trimmed(raw.receptionRooms),
    kitchenSize: trimmed(raw.kitchenSize),
    propertySize: trimmed(raw.propertySize),
    propertyCondition: trimmed(raw.propertyCondition),
    priorities: trimmed(raw.priorities),
    pets: trimmed(raw.pets),
    parking: trimmed(raw.parking),
    productPreferences: trimmed(raw.productPreferences),
    photoAvailable: trimmed(raw.photoAvailable),
    notes: trimmed(raw.notes)
  };
}

function setupLeadDrawerActions(record) {
  if (!record.id) return;

  drawer.querySelector("[data-edit-lead-details]")?.addEventListener("click", () => {
    leadDetailsEditState = leadEditDraft(record);
    openDrawer("lead", fullLead(record));
  });

  drawer.querySelector("[data-cancel-lead-details]")?.addEventListener("click", () => {
    leadDetailsEditState = null;
    openDrawer("lead", fullLead(record));
  });

  const detailsForm = drawer.querySelector("[data-lead-details-form]");
  detailsForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      setLeadDetailStatus("Saving details...");
      const payload = normaliseLeadDetailsPayload(new FormData(detailsForm));
      if (state.apiReady) {
        await apiPatch(`/api/leads/${record.id}`, payload);
      } else {
        const lead = data.leads.find((item) => String(item.id) === String(record.id));
        if (lead) {
          Object.assign(lead, payload, {
            sourceLabel: payload.source ? leadValueLabel("source", payload.source) : lead.sourceLabel,
            serviceLabel: payload.serviceType ? leadValueLabel("serviceType", payload.serviceType) : lead.serviceLabel,
            preferredContactLabel: payload.preferredContact ? leadValueLabel("preferredContact", payload.preferredContact) : lead.preferredContactLabel,
            frequencyLabel: payload.frequency ? leadValueLabel("frequency", payload.frequency) : lead.frequencyLabel,
            contact: payload.phone || payload.email || "",
            updatedAt: new Date().toISOString()
          });
        }
      }
      leadDetailsEditState = null;
      if (state.apiReady) {
        await refreshLeadDrawer(record.id);
      } else {
        renderAll();
        openDrawer("lead", fullLead(record));
      }
    } catch (err) {
      setLeadDetailStatus(`Could not save details. ${err.message}`);
    }
  });

  if (!state.apiReady) return;

  drawer.querySelector("[data-create-assessment-quote]")?.addEventListener("click", async () => {
    try {
      setLeadActionStatus("Creating Assessment / Quote...");
      const result = await apiPost(`/api/leads/${record.id}/assessment-quote`, {});
      await loadApiData();
      const assessmentQuoteId = result.assessmentQuote?.id || result.id;
      if (openAssessmentQuoteFromLead(assessmentQuoteId)) return;
      setLeadActionStatus("Assessment / Quote was created, but it was not returned by the current data load.");
    } catch (err) {
      setLeadActionStatus(`Could not create Assessment / Quote. ${err.message}`);
    }
  });

  drawer.querySelector("[data-open-assessment-quote]")?.addEventListener("click", (event) => {
    openAssessmentQuoteFromLead(event.currentTarget.dataset.openAssessmentQuote);
  });

  drawer.querySelectorAll("[data-close-lead-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      const status = button.dataset.closeLeadStatus;
      try {
        setLeadCloseStatus("Saving lead outcome...");
        await apiPatch(`/api/leads/${record.id}`, { status, lostReason: status });
        await refreshLeadDrawer(record.id);
      } catch (err) {
        setLeadCloseStatus(`Could not close lead. ${err.message}`);
      }
    });
  });

  drawer.querySelector("[data-convert-lead]")?.addEventListener("click", async () => {
    try {
      setLeadActionStatus("Converting lead...");
      const result = await apiPost(`/api/leads/${record.id}/convert`, { convertedBy: "admin" });
      await loadApiData();
      const client = data.clients.find((item) => String(item.id) === String(result.id));
      if (client) {
        setView("clients");
        openDrawer("client", client);
        return;
      }
      setLeadActionStatus("Converted, but the linked client record was not returned by the current data load.");
    } catch (err) {
      setLeadActionStatus(`Could not convert lead. ${err.message}`);
    }
  });

  drawer.querySelector("[data-open-client]")?.addEventListener("click", (event) => {
    const client = data.clients.find((item) => String(item.id) === String(event.currentTarget.dataset.openClient));
    if (client) {
      setView("clients");
      openDrawer("client", client);
      return;
    }
    setLeadActionStatus("Linked Client & Home record is not available in the current data.");
  });

  drawer.querySelectorAll("[data-task-done]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        setLeadActionStatus("Marking task done...");
        await apiPatch(`/api/admin/tasks/${button.dataset.taskDone}`, { status: "Done" });
        await refreshLeadDrawer(record.id);
      } catch (err) {
        setLeadActionStatus(`Could not update task. ${err.message}`);
      }
    });
  });

  const statusForm = drawer.querySelector("[data-lead-status-form]");
  statusForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = new FormData(statusForm).get("status");
    try {
      setLeadActionStatus("Saving status...");
      await apiPatch(`/api/leads/${record.id}`, { status });
      await refreshLeadDrawer(record.id);
    } catch (err) {
      setLeadActionStatus(`Could not save status. ${err.message}`);
    }
  });

  const noteForm = drawer.querySelector("[data-lead-note-form]");
  noteForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const note = new FormData(noteForm).get("note")?.trim();
    if (!note) {
      setLeadActionStatus("Add a note before saving.");
      return;
    }

    try {
      setLeadActionStatus("Saving note...");
      await apiPost(`/api/leads/${record.id}/notes`, { note, noteType: "general", createdBy: "admin" });
      await refreshLeadDrawer(record.id);
    } catch (err) {
      setLeadActionStatus(`Could not save note. ${err.message}`);
    }
  });
}

function setDrawerActionStatus(message) {
  const status = drawer.querySelector("[data-drawer-action-status]");
  if (status) status.textContent = message;
}

function renderDrawerAction(type, record, action) {
  const isDisabled =
    type === "task" && (action === "Reschedule" || (action === "Mark done" && record.status === "Done"));
  return `<button class="ghost" type="button" data-drawer-action="${escapeHtml(action)}" ${isDisabled ? "disabled aria-disabled=\"true\"" : ""}>${escapeHtml(action)}</button>`;
}

async function refreshTaskDrawer(taskId) {
  await loadApiData();
  const updated = data.tasks.find((task) => String(task.id) === String(taskId));
  if (updated) openDrawer("task", updated);
}

function setupTaskDrawerActions(record) {
  if (!state.apiReady || !record.id) return;

  drawer.querySelector('[data-drawer-action="Mark done"]')?.addEventListener("click", async () => {
    try {
      setDrawerActionStatus("Marking task done...");
      await apiPatch(`/api/admin/tasks/${record.id}`, { status: "Done" });
      await refreshTaskDrawer(record.id);
    } catch (err) {
      setDrawerActionStatus(`Could not mark task done. ${err.message}`);
    }
  });

  drawer.querySelector('[data-drawer-action="Open linked record"]')?.addEventListener("click", () => {
    if (record.linkedType !== "lead") {
      setDrawerActionStatus("This task is not linked to a lead.");
      return;
    }

    const lead = data.leads.find((item) => String(item.id) === String(record.linkedId));
    if (!lead) {
      setDrawerActionStatus("Linked lead is not available in the current D1 data.");
      return;
    }

    openDrawer("lead", lead);
  });
}

async function refreshAssessmentDrawer(assessmentId) {
  await loadApiData();
  const updated = data.assessments.find((assessment) => String(assessment.id) === String(assessmentId));
  if (updated) openDrawer("assessment", updated);
}

function setAssessmentActionStatus(message) {
  const status = drawer.querySelector("[data-assessment-action-status]");
  if (status) status.textContent = message;
}

function setAssessmentQuoteStatus(message) {
  const status = drawer.querySelector("[data-assessment-quote-status]");
  if (status) status.textContent = message;
}

function setAssessmentConversionStatus(message) {
  const status = drawer.querySelector("[data-assessment-conversion-status]");
  if (status) status.textContent = message;
}

function openClientFromAssessment(clientId) {
  const client = data.clients.find((item) => String(item.id) === String(clientId));
  if (!client) {
    setAssessmentConversionStatus("Client & Home record is not available in the current D1 data.");
    return false;
  }
  setView("clients");
  openDrawer("client", client);
  return true;
}

function setupAssessmentDrawerActions(record) {
  if (!state.apiReady || !record.id) return;

  drawer.querySelector("[data-run-quote-assist]")?.addEventListener("click", async () => {
    try {
      setAssessmentActionStatus("Running Quote Assist...");
      await apiPost(`/api/assessment-quotes/${record.id}/assist`, {});
      await refreshAssessmentDrawer(record.id);
    } catch (err) {
      setAssessmentActionStatus(`Could not run Quote Assist. ${err.message}`);
    }
  });

  drawer.querySelector("[data-create-accounting-quote]")?.addEventListener("click", async () => {
    try {
      setAssessmentQuoteStatus("Creating draft Accounting quote...");
      await apiPost(`/api/assessment-quotes/${record.id}/quote`, {});
      await refreshAssessmentDrawer(record.id);
    } catch (err) {
      setAssessmentQuoteStatus(`Could not create draft quote. ${err.message}`);
    }
  });

  drawer.querySelector("[data-convert-assessment-quote]")?.addEventListener("click", async () => {
    try {
      setAssessmentConversionStatus("Converting to Client & Home...");
      const result = await apiPost(`/api/assessment-quotes/${record.id}/convert`, { convertedBy: "admin" });
      await loadApiData();
      if (openClientFromAssessment(result.id)) return;
      setAssessmentConversionStatus("Converted, but the Client & Home record was not returned by the current data load.");
    } catch (err) {
      setAssessmentConversionStatus(`Could not convert Q&A. ${err.message}`);
    }
  });

  drawer.querySelector("[data-open-qa-client]")?.addEventListener("click", (event) => {
    openClientFromAssessment(event.currentTarget.dataset.openQaClient);
  });
}

function resetDrawer() {
  state.activeDrawerType = null;
  leadDetailsEditState = null;
  if (drawerScrollHandler) {
    drawer.querySelector(".drawer-body")?.removeEventListener("scroll", drawerScrollHandler);
    drawerScrollHandler = null;
  }
  drawer.innerHTML = `
    <div class="drawer-empty">
      <p class="eyebrow">Detail panel</p>
      <h2>Select a record</h2>
      <p>Click a lead, task, job or invoice to review details here.</p>
    </div>
  `;
  syncWorkspaceFirstLayout();
}

function openDrawer(type, record = {}) {
  state.activeDrawerType = type;
  if (type !== "lead") leadDetailsEditState = null;
  if (type === "lead") {
    drawer.innerHTML = renderLeadDrawer(record);
    setupDrawerChrome();
    setupLeadDrawerActions(record);
    return;
  }

  const templates = {
    task: {
      title: record.title || "New task",
      subtitle: record.taskType || "Admin task",
      sections: [
        ["Task", [["Status", record.status], ["Priority", record.priority], ["Due", formatDateTime(record.dueAt)], ["Assigned to", record.assignedTo]]],
        ["Notes", [["Details", record.notes]]]
      ],
      actions: ["Mark done", "Reschedule", "Open linked record"]
    },
    assessment: {
      title: record.customerName || record.client || "Assessment / quote",
      subtitle: compactMeta([record.area, record.serviceLabel || record.serviceType, record.quoteStageLabel || record.quoteStage]),
      sections: [
        [
          "Contact",
          [
            ["Name", record.customerName || record.client],
            ["Phone", record.phone],
            ["Email", record.email],
            ["Area", record.area],
            ["Postcode", record.postcode]
          ]
        ],
        [
          "Linked lead",
          [
            ["Original lead ID", record.leadId],
            ["Lead name", record.leadName],
            ["Lead status", record.leadStatusLabel || record.leadStatus],
            ["Lead source", record.leadSourceLabel || record.leadSource],
            ["Lead submitted", formatDateTime(record.leadCreatedAt)]
          ]
        ],
        [
          "Property / scope",
          [
            ["Service", record.serviceLabel || record.serviceType],
            ["Frequency", record.frequencyLabel || record.frequency],
            ["Property type", record.propertyType],
            ["Bedrooms", record.bedrooms],
            ["Bathrooms", record.bathrooms],
            ["Condition", record.propertyCondition],
            ["Pets", record.pets],
            ["Parking", record.parking],
            ["Priorities", record.priorities],
            ["Products", record.productPreferences]
          ]
        ],
        [
          "Assessment",
          [
            ["Assessment type", record.assessmentType],
            ["Estimated hours", record.estimate],
            ["Assessment notes", record.assessmentNotes]
          ]
        ],
        [
          "Quote",
          [
            ["Suggested range", record.quoteRange],
            ["Quoted price", record.quotedPriceLabel || formatMoneyPence(record.quotedPrice)],
            ["Quote sent", formatDateTime(record.quoteSentAt)],
            ["Accepted", formatDateTime(record.quoteAcceptedAt)],
            ["Rejected", formatDateTime(record.quoteRejectedAt)],
            ["Lost reason", record.lostReason],
            ["Quote notes", record.quoteNotes]
          ]
        ],
        [
          "Status / next action",
          [
            ["Status", record.statusLabel || record.status],
            ["Quote stage", record.quoteStageLabel || record.quoteStage],
            ["Converted client ID", record.convertedClientId],
            ["Created", formatDateTime(record.createdAt)],
            ["Updated", formatDateTime(record.updatedAt)]
          ]
        ],
        ["Notes", [["Internal notes", record.notes]]]
      ],
      actions: []
    },
    client: {
      title: record.name || "New client",
      subtitle: compactMeta([record.area, clientServiceLabel(record), record.status]),
      sections: [
        [
          "Contact",
          [
            ["Name", record.name],
            ["Phone", record.phone],
            ["Email", record.email],
            ["Preferred contact", record.preferredContactLabel || record.preferredContact],
            ["Best contact time", record.bestContactTime],
            ["Client status", record.status]
          ]
        ],
        [
          "Home / property",
          [
            ["Area", record.area],
            ["Address", record.address],
            ["Postcode", record.postcode],
            ["Property type", record.propertyType],
            ["Bedrooms", record.bedrooms],
            ["Bathrooms", record.bathrooms],
            ["Reception rooms", record.receptionRooms],
            ["Kitchen size", record.kitchenSize],
            ["Property size", record.propertySize],
            ["Condition", record.propertyCondition]
          ]
        ],
        [
          "Service",
          [
            ["Requested service", clientServiceLabel(record)],
            ["Current frequency", record.frequencyLabel || record.frequency],
            ["Requested frequency", record.requestedFrequencyLabel || record.requestedFrequency],
            ["Preferred days", record.preferredDays],
            ["Urgency", record.urgency],
            ["Man-hours", record.manHours],
            ["Main cleaner", record.mainCleaner],
            ["Helper", record.helper]
          ]
        ],
        [
          "Preferences / access",
          [
            ["Access method", record.accessLabel || record.accessMethod],
            ["Access notes", record.accessNotes],
            ["Parking notes", record.parkingNotes || record.leadParking],
            ["Pets", record.petLabel || record.petType || record.leadPets],
            ["Pet notes", record.petNotes],
            ["Products", record.productLabel || record.productPreference || record.leadProductPreferences],
            ["Surface notes", record.surfaceNotes],
            ["Priorities", record.priorities],
            ["Photos", record.photoAvailable]
          ]
        ],
        [
          "Notes",
          [
            ["Client notes", record.notes],
            ["Q&A notes", record.qaNotes],
            ["Assessment notes", record.qaAssessmentNotes],
            ["Quote notes", record.qaQuoteNotes],
            ["Original lead summary", record.originalLeadNote]
          ]
        ],
        [
          "Original lead",
          [
            ["Original lead ID", clientOriginalLeadId(record)],
            ["Assessment / Quote ID", record.assessmentQuoteId],
            ["Q&A stage", record.assessmentQuoteStage],
            ["Q&A accepted", formatDateTime(record.qaQuoteAcceptedAt)],
            ["Lead status", record.originalLeadStatus],
            ["Lead source", record.originalLeadSourceLabel || record.originalLeadSource],
            ["Lead submitted", formatDateTime(record.originalLeadCreatedAt)],
            ["Converted", formatDateTime(record.convertedAt)],
            ["Converted by", record.convertedBy]
          ]
        ]
      ],
      actions: []
    },
    job: {
      title: record.client || "New work order",
      subtitle: record.date ? `${record.date} at ${record.time}` : "Scheduled job",
      sections: [
        ["Job", [["Type", record.type], ["Status", record.status], ["Man-hours", record.manHours], ["Main cleaner", record.mainCleaner], ["Helper", record.helper]]],
        ["Instructions", [["Special instructions", record.instructions]]],
        ["Follow-ups", (record.followups || []).length ? record.followups.map((item, index) => [`Follow-up ${index + 1}`, item.note]) : [["Open follow-ups", "None"]]],
        ["Checklist", (record.checklist || []).map((item, index) => [`Item ${index + 1}`, typeof item === "string" ? item : item.label])]
      ],
      actions: ["Reschedule", "Cancel job", "Mark complete"]
    },
    invoice: {
      title: record.number || "New invoice record",
      subtitle: record.client || "Invoice tracker",
      sections: [
        ["Invoice", [["Client", record.client], ["Date", record.date], ["Amount", record.amount], ["Status", record.status], ["Paid date", record.paid]]]
      ],
      actions: ["Mark sent", "Mark paid", "Export CSV"]
    }
  };

  const template = templates[type];
  const compactType = type === "assessment"
    ? "Q&A"
    : type === "client"
      ? "Client"
      : type.charAt(0).toUpperCase() + type.slice(1);
  const nextAction = type === "task"
      ? record.notes || "Review task and update status"
      : "";
  const titlebar = renderDrawerTitlebar({
    eyebrow: type === "assessment" ? "Q&A / Assessment" : compactType,
    title: template.title,
    subtitle: template.subtitle,
    compactTitle: compactDrawerLabel([
      template.title,
      compactType,
      record.quoteStageLabel || record.quoteStage || record.statusLabel || record.status || template.subtitle
    ]),
    showDrawerToggle: isWorkspaceFirstView() && type === recordTypeForView()
  });
  const body = `
      ${
        nextAction
          ? `<section class="next-action-strip">
              <span>Recommended next action</span>
              <strong>${escapeHtml(nextAction)}</strong>
              <div>
                <button class="ghost" type="button">Generate reply</button>
                <button class="primary" type="button">Request photos</button>
                <button class="ghost" type="button">Mark contacted</button>
                <button class="ghost" type="button">Add note</button>
                <button class="ghost" type="button">Snooze</button>
              </div>
            </section>`
          : ""
      }
      ${template.sections
        .map(([title, fields]) => `
          <section class="drawer-section">
            <h3>${title}</h3>
            ${detailRows(fields)}
          </section>
        `)
        .join("")}
      ${type === "assessment" ? renderAssessmentQuoteAssist(record) : ""}
      ${type === "assessment" ? renderAssessmentAccountingQuote(record) : ""}
      ${type === "assessment" ? renderAssessmentQuoteConversion(record) : ""}
      ${type === "assessment" ? renderLinkedLeadNotes(record) : ""}
      ${type === "client" ? renderClientAccountingQuote(record) : ""}
      ${type === "client" ? renderOriginalLeadNotes(record) : ""}
      ${leadDrawerTools(type, record)}
      ${
        template.actions.length
          ? `<section class="drawer-section">
              <h3>Actions</h3>
              <div class="drawer-actions">
                ${template.actions.map((action) => renderDrawerAction(type, record, action)).join("")}
              </div>
              <p class="record-sub" data-drawer-action-status></p>
            </section>`
          : ""
      }
      ${
        type === "job"
          ? `<section class="drawer-section">
              <h3>Add follow-up</h3>
              <form class="followup-form" data-followup-form>
                <textarea name="note" rows="3" placeholder="e.g. Follow up next visit: clean study shelves."></textarea>
                <button class="primary" type="submit">Save follow-up</button>
              </form>
            </section>`
          : ""
      }
  `;
  drawer.innerHTML = renderDrawerFrame({ titlebar, body });

  drawer.querySelectorAll("select[data-group]").forEach((select) => {
    const other = select.parentElement.querySelector(".other-field");
    const update = () => {
      if (other) other.hidden = select.value !== "other";
    };
    select.addEventListener("change", update);
    update();
  });

  setupDrawerChrome();
  setupLeadDrawerActions(record);
  if (type === "task") setupTaskDrawerActions(record);
  if (type === "assessment") setupAssessmentDrawerActions(record);

  const followupForm = drawer.querySelector("[data-followup-form]");
  if (followupForm) {
    followupForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const note = new FormData(followupForm).get("note")?.trim();
      if (!note) return;

      const followup = {
        id: `local-followup-${Date.now()}`,
        clientId: record.clientId,
        sourceJobId: record.id,
        note,
        status: "open",
        createdBy: state.role === "cleaner" ? "Cleaner" : "Admin"
      };

      if (state.apiReady) {
        await apiPost("/api/followups", followup);
        await loadApiData();
      } else {
        const original = data.jobs.find((job) => job.id === record.id);
        if (original) original.followups = [followup, ...(original.followups || [])];
        renderAll();
      }

      openDrawer("job", {
        ...record,
        followups: [followup, ...(record.followups || [])]
      });
    });
  }
}

function openLeadForm() {
  const titlebar = renderDrawerTitlebar({
    eyebrow: "Lead",
    title: "New lead",
    subtitle: "Add the first enquiry details. Dropdowns keep typing low; choose Other when needed.",
    compactTitle: "New lead - Lead form"
  });
  const body = `
    <section class="drawer-section">
      <h3>Contact</h3>
      <div class="field-grid">
        <label>Name<input name="name" required></label>
        <label>Phone<input name="phone"></label>
        <label>Email<input name="email" type="email"></label>
        <label>Area<input name="area"></label>
      </div>
    </section>
    <section class="drawer-section">
      <h3>Enquiry</h3>
      <div class="field-grid">
        <label>Source${renderSelect("source", "lead_source", "website")}</label>
        <label>Service${renderSelect("serviceType", "service_type", "regular_cleaning")}</label>
        <label>Preferred contact${renderSelect("preferredContact", "preferred_contact", "phone")}</label>
        <label>Preferred days<input name="preferredDays" placeholder="e.g. Tuesday morning"></label>
        <label>Status${renderSelect("status", "lead_status", "new")}</label>
        <label>Notes<textarea name="notes" rows="3"></textarea></label>
      </div>
    </section>
    <section class="drawer-section">
      <div class="drawer-actions">
        <button class="primary" type="submit">Save lead</button>
        <button class="ghost" type="button" data-close-drawer>Cancel</button>
      </div>
    </section>
  `;
  drawer.innerHTML = renderDrawerFrame({
    titlebar,
    body,
    bodyTag: "form",
    bodyAttrs: 'data-lead-form'
  });

  const form = drawer.querySelector("[data-lead-form]");
  setupDrawerChrome();
  form.querySelectorAll("select[data-group]").forEach((select) => {
    const other = select.parentElement.querySelector(".other-field");
    const update = () => {
      if (other) other.hidden = select.value !== "other";
    };
    select.addEventListener("change", update);
    update();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const lead = Object.fromEntries(formData.entries());
    if (state.apiReady) {
      await apiPost("/api/leads", lead);
      await loadApiData();
      setView("leads");
      return;
    }

    data.leads.unshift({
      id: `lead-${Date.now()}`,
      name: lead.name,
      area: lead.area,
      status: optionLabel("lead_status", lead.status),
      statusValue: lead.status,
      source: optionLabel("lead_source", lead.source),
      sourceValue: lead.source,
      service: optionLabel("service_type", lead.serviceType),
      serviceType: lead.serviceType,
      serviceLabel: optionLabel("service_type", lead.serviceType),
      contact: lead.phone || lead.email,
      note: lead.notes,
      notes: lead.notes
    });
    renderAll();
    setView("leads");
  });
}

function renderDashboard() {
  const metrics = data.dashboard?.metrics;
  if (metrics) {
    const cards = document.querySelectorAll(".metric-grid article");
    cards[0].querySelector("strong").textContent = metrics.newEnquiries;
    cards[1].querySelector("strong").textContent = Math.max(1, metrics.assessmentsThisWeek || 0);
    cards[2].querySelector("strong").textContent = metrics.scheduledJobs;
    cards[3].querySelector("strong").textContent = (data.tasks || []).filter((task) => task.status === "Open").length || 1;
  }

  const list = document.querySelector("[data-dashboard-list]");
  list.innerHTML = "";
  const taskAttention = (data.tasks || []).filter((task) => task.status === "Open").slice(0, 3);
  taskAttention.forEach((task) => {
    const card = el("article", "attention-row");
    card.innerHTML = `
      <button type="button">
        <span class="row-token">Task</span>
        <span>
          <strong>${task.title}</strong>
          <small>${[task.taskType, formatDateTime(task.dueAt) || "No due date"].filter(Boolean).join(" - ")}</small>
        </span>
        <mark class="${task.priority === "High" ? "rose" : ""}">${task.priority || "Normal"}</mark>
      </button>
    `;
    card.querySelector("button").addEventListener("click", () => openDrawer("task", task));
    list.append(card);
  });

  const attention = data.dashboard?.attention || activeLeads().slice(0, 4);
  attention.slice(0, Math.max(1, 4 - taskAttention.length)).forEach((lead) => {
    lead = fullLead(lead);
    const card = el("article", "attention-row");
    const score = leadFitScore(lead);
    card.innerHTML = `
      <button type="button">
        <span class="row-token">Lead</span>
        <span>
          <strong>${escapeHtml(compactMeta([lead.name, lead.area]))}</strong>
          <small>${escapeHtml(compactMeta([lead.serviceLabel || lead.service, lead.contact, score ? `Fit ${score}` : "Needs review", formatDateTime(lead.createdAt)]))}</small>
        </span>
        <mark>${escapeHtml(lead.quoteAssist?.recommendedNextAction ? "Request photos" : lead.statusLabel || lead.status)}</mark>
      </button>
    `;
    card.querySelector("button").addEventListener("click", () => openDrawer("lead", lead));
    list.append(card);
  });

  if (!list.children.length) {
    list.innerHTML = emptyState("No leads need attention", "New enquiries from D1 will appear here after they are submitted.");
  }

  const today = data.dashboard?.today || data.jobs[0];
  if (!today) {
    document.querySelector("[data-today-card]").innerHTML = "<p>No jobs scheduled.</p>";
    return;
  }
  document.querySelector("[data-today-card]").innerHTML = `
    ${data.jobs.slice(0, 5).map((job) => `
      <button class="schedule-row" type="button" data-dashboard-job="${job.id}">
        <span>${job.time || "--:--"}</span>
        <strong>${job.client}</strong>
        <small>${compactMeta([job.manHours ? `${job.manHours}h` : "", job.typeLabel || job.type, job.statusLabel || job.status])}</small>
      </button>
    `).join("")}
  `;

  document.querySelectorAll("[data-dashboard-job]").forEach((button) => {
    button.addEventListener("click", () => {
      const job = data.jobs.find((item) => String(item.id) === button.dataset.dashboardJob);
      if (job) openDrawer("job", job);
    });
  });
}

function renderPriorityList(selector = "[data-priority-list]") {
  const host = document.querySelector(selector);
  if (!host) return;
  const isLeadView = selector === "[data-lead-list]";
  const leads = [...activeLeads()].sort((a, b) => (leadFitScore(b) || 0) - (leadFitScore(a) || 0));
  const visibleLeads = isLeadView ? leads : leads.slice(0, 5);
  const countNode = isLeadView ? document.querySelector("[data-lead-list-count]") : null;

  if (!visibleLeads.length) {
    host.innerHTML = emptyState("No active leads yet", "Submit a test enquiry and it will appear in this list.");
    if (countNode) countNode.textContent = "0 active leads";
    return;
  }

  host.innerHTML = visibleLeads.map((lead) => `
    <button class="priority-row" type="button" data-priority-lead="${lead.id}">
      <span>
        <strong>${escapeHtml(lead.name)}</strong>
        <small>${escapeHtml(compactMeta([lead.area, lead.contact]))}</small>
      </span>
      <span>
        <strong>${escapeHtml(lead.serviceLabel || lead.service || "Enquiry")}</strong>
        <small>${escapeHtml(compactMeta([lead.frequencyLabel || lead.frequency, formatDateTime(lead.createdAt)]))}</small>
      </span>
      <mark>${escapeHtml(compactMeta([leadFitScore(lead), leadRisk(lead), leadHours(lead), leadPrice(lead)]) || "Review")}</mark>
      <mark class="status">${escapeHtml(lead.statusLabel || lead.status || "New")}</mark>
    </button>
  `).join("");

  if (countNode) countNode.textContent = `${visibleLeads.length} active lead${visibleLeads.length === 1 ? "" : "s"}`;

  host.querySelectorAll("[data-priority-lead]").forEach((button) => {
    button.addEventListener("click", () => {
      const lead = data.leads.find((item) => String(item.id) === button.dataset.priorityLead);
      if (lead) openDrawer("lead", lead);
    });
  });
}

function renderLeadHistory() {
  const host = document.querySelector("[data-lead-history]");
  const countNode = document.querySelector("[data-lead-history-count]");
  if (!host) return;
  const leads = [...leadHistory()].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))).slice(0, 12);
  if (!leads.length) {
    host.innerHTML = emptyState("No lead history yet", "Rejected, unsuitable, or moved-to-Q&A leads will remain visible here for traceability.");
    if (countNode) countNode.textContent = "0 history leads";
    return;
  }

  host.innerHTML = leads.map((lead) => `
    <button class="priority-row" type="button" data-history-lead="${lead.id}">
      <span>
        <strong>${escapeHtml(lead.name)}</strong>
        <small>${escapeHtml(compactMeta([lead.area, lead.contact]))}</small>
      </span>
      <span>
        <strong>${escapeHtml(lead.serviceLabel || lead.service || "Enquiry")}</strong>
        <small>${escapeHtml(compactMeta([lead.statusLabel || lead.status, formatDateTime(lead.updatedAt || lead.createdAt)]))}</small>
      </span>
      <mark class="${closedLeadStatuses.has(String(lead.statusValue || lead.status || '').toLowerCase()) ? "rose" : "blue"}">${escapeHtml(lead.statusLabel || lead.status || "History")}</mark>
    </button>
  `).join("");

  if (countNode) countNode.textContent = `${leads.length} history lead${leads.length === 1 ? "" : "s"}`;

  host.querySelectorAll("[data-history-lead]").forEach((button) => {
    button.addEventListener("click", () => {
      const lead = data.leads.find((item) => String(item.id) === button.dataset.historyLead);
      if (lead) openDrawer("lead", lead);
    });
  });
}

function groupedJobs(jobs = data.jobs) {
  return jobs.reduce((groups, job) => {
    const key = job.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(job);
    return groups;
  }, {});
}

function jobSummary(job) {
  return `${job.time || ""} ${job.client} - ${job.typeLabel || job.type}`;
}

function popoverFor(dayJobs) {
  if (!dayJobs.length) return "";
  return `
    <div class="day-popover">
      <h3>${dayJobs.length} item${dayJobs.length === 1 ? "" : "s"}</h3>
      ${dayJobs.map((job) => `<p>${jobSummary(job)} (${job.mainCleaner || "Unassigned"})</p>`).join("")}
    </div>
  `;
}

function renderMiniCalendar() {
  const host = document.querySelector("[data-mini-calendar]");
  if (!host) return;
  const datedJobs = data.jobs.filter((job) => parseDate(job.date));
  const today = new Date();
  const start = startOfWeek(today);
  const byDay = groupedJobs(datedJobs);
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const todayKey = dateKey(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())));
  host.innerHTML = weekdays.map((day) => `<div class="mini-weekday">${day}</div>`).join("");

  for (let i = 0; i < 28; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = dateKey(day);
    const dayJobs = byDay[key] || [];
    const node = el("div", `mini-day ${dayJobs.length ? "has-jobs" : ""} ${key === todayKey ? "today" : ""}`);
    node.innerHTML = `
      <strong>${day.getUTCDate()}</strong>
      ${dayJobs.length ? `<span>${dayJobs.length}</span>` : ""}
      ${popoverFor(dayJobs)}
    `;
    host.append(node);
  }
}

function uniqueOptions(values) {
  return ["All", ...Array.from(new Set(values.filter(Boolean))).sort()];
}

function setFilterOptions(selector, values) {
  const select = document.querySelector(selector);
  const current = select.value || "All";
  select.innerHTML = uniqueOptions(values).map((value) => `<option value="${value}">${value}</option>`).join("");
  select.value = uniqueOptions(values).includes(current) ? current : "All";
}

function filteredScheduleJobs() {
  const client = document.querySelector('[data-filter="client"]')?.value || "All";
  const cleaner = document.querySelector('[data-filter="cleaner"]')?.value || "All";
  const status = document.querySelector('[data-filter="status"]')?.value || "All";
  return data.jobs.filter((job) => {
    if (client !== "All" && job.client !== client) return false;
    if (cleaner !== "All" && job.mainCleaner !== cleaner && job.helper !== cleaner) return false;
    if (status !== "All" && (job.statusLabel || job.status) !== status) return false;
    return true;
  });
}

function renderSchedule() {
  const host = document.querySelector("[data-schedule-calendar]");
  if (!host) return;

  setFilterOptions('[data-filter="client"]', data.jobs.map((job) => job.client));
  setFilterOptions('[data-filter="cleaner"]', data.jobs.flatMap((job) => [job.mainCleaner, job.helper === "None" ? "" : job.helper]));
  setFilterOptions('[data-filter="status"]', data.jobs.map((job) => job.statusLabel || job.status));

  const jobs = filteredScheduleJobs().filter((job) => parseDate(job.date));
  if (!state.scheduleMonth) {
    const base = jobs[0] ? parseDate(jobs[0].date) : new Date();
    state.scheduleMonth = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
  }
  const monthStart = state.scheduleMonth;
  const start = new Date(monthStart);
  const mondayOffset = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - mondayOffset);
  const byDay = groupedJobs(jobs);
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  host.innerHTML = weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join("");
  const heading = document.querySelector('[data-view-panel="schedule"] .panel-head h2');
  if (heading) heading.textContent = `Schedule - ${monthLabel(monthStart)}`;
  const monthInput = document.querySelector("[data-schedule-month]");
  if (monthInput) monthInput.value = monthInputValue(monthStart);

  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    const key = dateKey(day);
    const dayJobs = byDay[key] || [];
    const outside = day.getUTCMonth() !== monthStart.getUTCMonth();
    const cell = el("div", `calendar-day ${outside ? "outside" : ""}`);
    cell.innerHTML = `
      <div class="calendar-day-number">
        <span>${day.getUTCDate()}</span>
        ${dayJobs.length ? `<span class="calendar-count">${dayJobs.length}</span>` : ""}
      </div>
      ${dayJobs
        .slice(0, 3)
        .map((job) => `
          <button class="calendar-job ${job.type === "assessment" ? "assessment" : ""} ${job.status === "cancelled" ? "cancelled" : ""}" type="button" data-job-id="${job.id}">
            ${job.time || ""} ${job.client}
          </button>
        `)
        .join("")}
      ${dayJobs.length > 3 ? `<span class="record-sub">+${dayJobs.length - 3} more</span>` : ""}
      ${popoverFor(dayJobs)}
    `;
    cell.querySelectorAll("[data-job-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const job = data.jobs.find((item) => String(item.id) === button.dataset.jobId);
        if (job) openDrawer("job", job);
      });
    });
    host.append(cell);
  }
}

function renderLeadBoard() {
  const board = document.querySelector("[data-lead-board]");
  board.innerHTML = "";
  const leadQueue = activeLeads();
  if (!leadQueue.length) {
    board.innerHTML = emptyState("No active lead pipeline", "Real D1 leads will show here once enquiries are submitted.");
    return;
  }
  const statuses = state.apiReady
    ? leadStatusOptions()
    : leadStatuses.map((status) => ({ value: status, label: status }));

  statuses.forEach((statusOption) => {
    const leads = leadQueue.filter((lead) => (lead.statusValue || lead.status) === statusOption.value || lead.status === statusOption.label);
    const column = el("section", "board-column");
    column.innerHTML = `<h2>${statusOption.label}<span>${leads.length}</span></h2>`;
    leads.forEach((lead) => {
      const card = el("article", "board-card");
      card.innerHTML = `
        <button type="button">
          <h3>${escapeHtml(lead.name)}</h3>
          <p>${escapeHtml(compactMeta([lead.area, lead.serviceLabel || lead.service]))}</p>
          <div class="tag-row">
            <span class="pill">${escapeHtml(lead.sourceLabel || lead.source || "")}</span>
            <span class="pill blue">${escapeHtml(lead.contact)}</span>
            <span class="pill">${escapeHtml(formatDateTime(lead.createdAt))}</span>
          </div>
        </button>
      `;
      card.querySelector("button").addEventListener("click", () => openDrawer("lead", lead));
      column.append(card);
    });
    board.append(column);
  });
}

function recordRow(type, record, cells) {
  const row = el("article", "record-row");
  row.innerHTML = `
    <button class="record-open" type="button">
      ${cells.map((cell) => `<div>${cell}</div>`).join("")}
    </button>
  `;
  row.querySelector("button").addEventListener("click", () => openDrawer(type, record));
  return row;
}

function workspaceRow(view, type, record, cells, defaultTab = "overview") {
  const row = el("article", "record-row workspace-row");
  const expanded = isWorkspaceExpanded(view, record);
  row.innerHTML = `
    <button class="record-open" type="button">
      ${cells.map((cell) => `<div>${cell}</div>`).join("")}
    </button>
    <button class="ghost row-expand-button" type="button" aria-expanded="${expanded ? "true" : "false"}">
      ${expanded ? "Collapse" : "Expand"}
    </button>
  `;
  row.querySelector(".record-open").addEventListener("click", () => openDrawer(type, record));
  row.querySelector(".row-expand-button").addEventListener("click", (event) => {
    event.stopPropagation();
    toggleExpandedWorkspace(view, record.id, defaultTab);
  });
  return row;
}

function workspaceTabs(view, recordId, tabs) {
  const activeTab = expandedWorkspaceState(view)?.tab || tabs[0].key;
  return `
    <div class="workspace-tabs" role="tablist" aria-label="Workspace modules">
      ${tabs
        .map((tab) => `
          <button
            class="workspace-tab ${tab.key === activeTab ? "active" : ""}"
            type="button"
            role="tab"
            aria-selected="${tab.key === activeTab ? "true" : "false"}"
            data-workspace-tab="${escapeHtml(tab.key)}"
            data-workspace-view="${escapeHtml(view)}"
            data-workspace-id="${escapeHtml(recordId)}"
          >
            ${escapeHtml(tab.label)}
          </button>
        `)
        .join("")}
    </div>
  `;
}

function renderExpandableWorkspace({ view, record, eyebrow, title, subtitle, status, meta, tabs, content }) {
  return `
    <section class="expandable-workspace" data-workspace="${escapeHtml(view)}" data-workspace-id="${escapeHtml(record.id)}">
      <div class="workspace-shell">
        <div class="workspace-header">
          <div class="workspace-header-main">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(compactMeta([eyebrow, subtitle, status, meta]))}</p>
          </div>
          <button class="ghost workspace-collapse" type="button" data-workspace-collapse="${escapeHtml(view)}" data-workspace-id="${escapeHtml(record.id)}">Collapse</button>
        </div>
        ${workspaceTabs(view, record.id, tabs)}
        <div class="workspace-panel">
          ${content}
        </div>
      </div>
    </section>
  `;
}

function linkedAssessmentTasks(record) {
  const byAssessment = (data.tasks || []).filter((task) => task.linkedType === "assessment" && String(task.linkedId) === String(record.id));
  const byLead = record.leadId
    ? (data.tasks || []).filter((task) => task.linkedType === "lead" && String(task.linkedId) === String(record.leadId))
    : [];
  const seen = new Set();
  return [...byAssessment, ...byLead].filter((task) => {
    if (seen.has(String(task.id))) return false;
    seen.add(String(task.id));
    return true;
  });
}

function assessmentWorkspaceTabs() {
  return [
    { key: "overview", label: "Overview" },
    { key: "details", label: "Details" },
    { key: "quote-assist", label: "Quote Assist" },
    { key: "quotes", label: "Quotes" },
    { key: "notes-tasks", label: "Notes / Tasks" }
  ];
}

function renderAssessmentWorkspaceTab(record, tab) {
  if (tab === "details") {
    return detailRows([
      ["Property type", record.propertyType],
      ["Bedrooms", record.bedrooms],
      ["Bathrooms", record.bathrooms],
      ["Reception rooms", record.receptionRooms],
      ["Kitchen size", record.kitchenSize],
      ["Property size", record.propertySize],
      ["Condition", record.propertyCondition],
      ["Pets", record.pets],
      ["Parking", record.parking],
      ["Priorities", record.priorities],
      ["Products", record.productPreferences],
      ["Assessment notes", record.assessmentNotes],
      ["Quote notes", record.quoteNotes],
      ["Internal notes", record.notes]
    ]);
  }

  if (tab === "quote-assist") {
    const assist = record.quoteAssist;
    return assist
      ? detailRows([
          ["Fit score", `${assist.fitScore}/100`],
          ["Price shopper risk", assist.priceShopperRisk],
          ["Travel suitability", assist.travelSuitability],
          ["First clean hours", assistHourRange(assist, "estimatedFirstCleanHours")],
          ["Recurring hours", assistHourRange(assist, "estimatedRecurringHours")],
          ["Suggested range", assist.suggestedPriceLabel || `${formatMoneyPence(assist.suggestedPriceMin)}-${formatMoneyPence(assist.suggestedPriceMax)}`],
          ["Minimum price", assist.minimumRecommendedPriceLabel || formatMoneyPence(assist.minimumRecommendedPrice)],
          ["Recommended next action", assist.recommendedNextAction],
          ["Confidence", assist.confidence],
          ["Explanation", assist.explanation],
          ["Risk flags", (assist.riskFlags || []).join("; ")],
          ["Positive flags", (assist.positiveFlags || []).join("; ")],
          ["Last run", formatDateTime(assist.updatedAt || assist.createdAt)]
        ])
      : placeholderPanel("No Quote Assist result saved yet. Use the drawer action when this Q&A has enough detail.");
  }

  if (tab === "quotes") {
    const quote = record.accountingQuote;
    return quote
      ? detailRows([
          ["Reference", quote.displayReference],
          ["Status", quote.status],
          ["Total", quote.totalPriceLabel || formatMoneyPence(quote.totalPrice)],
          ["Recurring", quote.recurringPriceLabel || formatMoneyPence(quote.recurringPrice)],
          ["Valid until", quote.validUntil],
          ["Created", formatDateTime(quote.createdAt)],
          ["Updated", formatDateTime(quote.updatedAt)]
        ]) + `<div class="workspace-placeholder muted"><p>Document editor coming later. This workspace keeps the quote record visible until the dedicated commercial editor exists.</p></div>`
      : placeholderPanel("No linked accounting quote yet. Create Draft Quote from the drawer when the commercial record is ready.");
  }

  if (tab === "notes-tasks") {
    const notes = record.linkedLeadNotes || [];
    const tasks = linkedAssessmentTasks(record);
    return `
      <div class="workspace-stack">
        <section>
          <h4>Linked notes</h4>
          ${noteSummary(notes, "No linked notes yet for this Q&A record.")}
        </section>
        <section>
          <h4>Linked tasks</h4>
          ${listSummary(
            tasks,
            "Notes / activity tasks module is planned here. Linked admin tasks will appear in this tab as the workflow grows.",
            (task) => `
              <article class="workspace-list-item">
                <strong>${escapeHtml(task.title)}</strong>
                <p>${escapeHtml(task.notes || "")}</p>
                <small>${escapeHtml(compactMeta([task.status, task.priority, formatDateTime(task.dueAt)]))}</small>
              </article>
            `
          )}
        </section>
      </div>
    `;
  }

  return workspaceSummaryRows([
    ["Customer", record.customerName || record.client],
    ["Phone", record.phone],
    ["Email", record.email],
    ["Area / postcode", compactMeta([record.area, record.postcode])],
    ["Service", record.serviceLabel || record.serviceType],
    ["Frequency", record.frequencyLabel || record.frequency],
    ["Status", record.statusLabel || record.status],
    ["Quote stage", record.quoteStageLabel || record.quoteStage],
    ["Linked lead", record.leadId ? `#${record.leadId}` : ""],
    ["Linked client", record.convertedClientId ? `#${record.convertedClientId}` : ""],
    ["Linked quote", record.accountingQuote?.displayReference],
    ["Updated", formatDateTime(record.updatedAt)]
  ]);
}

function renderAssessmentWorkspace(record) {
  const tabs = assessmentWorkspaceTabs();
  const activeTab = expandedWorkspaceState("assessments")?.tab || tabs[0].key;
  return renderExpandableWorkspace({
    view: "assessments",
    record,
    eyebrow: "Q&A / Assessment",
    title: record.customerName || record.client || `Q&A #${record.id}`,
    subtitle: compactMeta([record.serviceLabel || record.serviceType, record.area]),
    status: assessmentStatusDisplay(record),
    meta: record.accountingQuote?.displayReference,
    tabs,
    content: renderAssessmentWorkspaceTab(record, activeTab)
  });
}

function linkedClientTasks(record) {
  const leadId = clientOriginalLeadId(record);
  return (data.tasks || []).filter((task) => {
    if (task.linkedType === "client" && String(task.linkedId) === String(record.id)) return true;
    if (leadId && task.linkedType === "lead" && String(task.linkedId) === String(leadId)) return true;
    return false;
  });
}

function clientWorkspaceTabs() {
  return [
    { key: "overview", label: "Overview" },
    { key: "contact-access", label: "Contact / Access" },
    { key: "home-details", label: "Home details" },
    { key: "cleaning-plan", label: "Cleaning plan" },
    { key: "schedule-jobs", label: "Schedule / Jobs" },
    { key: "quotes-invoices", label: "Quotes / Invoices" },
    { key: "notes-tasks", label: "Notes / Tasks" }
  ];
}

function renderClientWorkspaceTab(record, tab) {
  if (tab === "contact-access") {
    return detailRows([
      ["Preferred contact", record.preferredContactLabel || record.preferredContact],
      ["Best contact time", record.bestContactTime],
      ["Access method", record.accessLabel || record.accessMethod],
      ["Access notes", record.accessNotes],
      ["Parking notes", record.parkingNotes || record.leadParking],
      ["Pets", record.petLabel || record.petType || record.leadPets],
      ["Pet notes", record.petNotes],
      ["Products", record.productLabel || record.productPreference || record.leadProductPreferences],
      ["Surface notes", record.surfaceNotes],
      ["Internal notes", record.notes]
    ]);
  }

  if (tab === "home-details") {
    const hasHomeData = [record.propertyType, record.bedrooms, record.bathrooms, record.propertySize, record.propertyCondition].some(Boolean);
    return hasHomeData
      ? detailRows([
          ["Area", record.area],
          ["Address", record.address],
          ["Postcode", record.postcode],
          ["Property type", record.propertyType],
          ["Bedrooms", record.bedrooms],
          ["Bathrooms", record.bathrooms],
          ["Reception rooms", record.receptionRooms],
          ["Kitchen size", record.kitchenSize],
          ["Property size", record.propertySize],
          ["Condition", record.propertyCondition]
        ])
      : placeholderPanel("Home details module planned - this will hold property, rooms, surfaces, pets, products and access details.");
  }

  if (tab === "cleaning-plan") {
    const hasPlan = [clientFrequencyLabel(record), record.manHours, record.mainCleaner, record.helper, record.priorities].some(Boolean);
    return hasPlan
      ? detailRows([
          ["Service", clientServiceLabel(record)],
          ["Frequency", clientFrequencyLabel(record)],
          ["Requested frequency", record.requestedFrequencyLabel || record.requestedFrequency],
          ["Preferred days", record.preferredDays],
          ["Man-hours", record.manHours],
          ["Main cleaner", record.mainCleaner],
          ["Helper", record.helper],
          ["Priorities", record.priorities]
        ])
      : placeholderPanel("Cleaning plan module planned - confirmed after assessment and early live service setup.");
  }

  if (tab === "schedule-jobs") {
    const jobs = (data.jobs || []).filter((job) => String(job.clientId) === String(record.id));
    return listSummary(
      jobs,
      "Schedule and jobs module planned - linked client work orders will appear here when available.",
      (job) => `
        <article class="workspace-list-item">
          <strong>${escapeHtml(job.type || "Job")}</strong>
          <p>${escapeHtml(compactMeta([formatDate(job.date), job.time, `${job.manHours} man-hours`]))}</p>
          <small>${escapeHtml(compactMeta([job.statusLabel || job.status, job.mainCleaner, job.helper]))}</small>
        </article>
      `
    );
  }

  if (tab === "quotes-invoices") {
    const quote = record.accountingQuote;
    const invoices = (data.invoices || []).filter((invoice) => String(invoice.client || "").toLowerCase() === String(record.name || "").toLowerCase());
    return `
      <div class="workspace-stack">
        <section>
          <h4>Linked quote</h4>
          ${
            quote
              ? detailRows([
                  ["Reference", quote.displayReference],
                  ["Status", quote.status],
                  ["Total", quote.totalPriceLabel || formatMoneyPence(quote.totalPrice)],
                  ["Recurring", quote.recurringPriceLabel || formatMoneyPence(quote.recurringPrice)],
                  ["Updated", formatDateTime(quote.updatedAt || quote.createdAt)]
                ])
              : placeholderPanel("No linked accounting quote is available for this client record yet.")
          }
        </section>
        <section>
          <h4>Invoices</h4>
          ${listSummary(
            invoices,
            "Invoice module planned - commercial documents will surface here as the accounting layer grows.",
            (invoice) => `
              <article class="workspace-list-item">
                <strong>${escapeHtml(invoice.number)}</strong>
                <p>${escapeHtml(invoice.amount)}</p>
                <small>${escapeHtml(compactMeta([invoice.status, invoice.date]))}</small>
              </article>
            `
          )}
        </section>
      </div>
    `;
  }

  if (tab === "notes-tasks") {
    const notes = record.originalLeadNotes || [];
    const tasks = linkedClientTasks(record);
    return `
      <div class="workspace-stack">
        <section>
          <h4>Lead history notes</h4>
          ${noteSummary(notes, "No original lead notes are linked to this client yet.")}
        </section>
        <section>
          <h4>Linked tasks</h4>
          ${listSummary(
            tasks,
            "Notes / tasks module planned - linked admin follow-ups will appear here when present.",
            (task) => `
              <article class="workspace-list-item">
                <strong>${escapeHtml(task.title)}</strong>
                <p>${escapeHtml(task.notes || "")}</p>
                <small>${escapeHtml(compactMeta([task.status, task.priority, formatDateTime(task.dueAt)]))}</small>
              </article>
            `
          )}
        </section>
      </div>
    `;
  }

  return workspaceSummaryRows([
    ["Client", record.name],
    ["Phone", record.phone],
    ["Email", record.email],
    ["Area / address", compactMeta([record.area, record.address])],
    ["Status", clientStatusDisplay(record)],
    ["Linked lead", clientOriginalLeadId(record) ? `#${clientOriginalLeadId(record)}` : ""],
    ["Linked Q&A", record.assessmentQuoteId ? `#${record.assessmentQuoteId}` : ""],
    ["Linked quote", record.accountingQuote?.displayReference],
    ["Converted", formatDateTime(record.convertedAt)]
  ]);
}

function renderClientWorkspace(record) {
  const tabs = clientWorkspaceTabs();
  const activeTab = expandedWorkspaceState("clients")?.tab || tabs[0].key;
  return renderExpandableWorkspace({
    view: "clients",
    record,
    eyebrow: "Client & Home",
    title: record.name || `Client #${record.id}`,
    subtitle: compactMeta([record.area, clientServiceLabel(record)]),
    status: clientStatusDisplay(record),
    meta: record.accountingQuote?.displayReference,
    tabs,
    content: renderClientWorkspaceTab(record, activeTab)
  });
}

function populateWorkspaceTable({ table, records, view, type, defaultTab, emptyTitle, emptyMessage, cells, renderWorkspace, countTarget, countLabel }) {
  table.innerHTML = "";
  if (countTarget) countTarget.textContent = `${records.length} ${countLabel}`;
  if (!records.length) {
    table.innerHTML = emptyState(emptyTitle, emptyMessage);
    return;
  }
  records.forEach((record) => {
    table.append(workspaceRow(view, type, record, cells(record), defaultTab));
    if (isWorkspaceExpanded(view, record)) {
      const workspaceRowEl = el("div", "workspace-row-slot");
      workspaceRowEl.innerHTML = renderWorkspace(record);
      table.append(workspaceRowEl);
    }
  });
  table.querySelectorAll("[data-workspace-collapse]").forEach((button) => {
    button.addEventListener("click", () => toggleExpandedWorkspace(button.dataset.workspaceCollapse, button.dataset.workspaceId));
  });
  table.querySelectorAll("[data-workspace-tab]").forEach((button) => {
    button.addEventListener("click", () => setWorkspaceTab(button.dataset.workspaceView, button.dataset.workspaceId, button.dataset.workspaceTab));
  });
}

function renderTables() {
  const assessmentActiveTable = document.querySelector("[data-assessment-active-table]");
  const assessmentHistoryTable = document.querySelector("[data-assessment-history-table]");
  const assessmentActiveCount = document.querySelector("[data-assessment-active-count]");
  const assessmentHistoryCount = document.querySelector("[data-assessment-history-count]");
  const activeAssessments = (data.assessments || []).filter(isActiveAssessment);
  const historyAssessments = (data.assessments || []).filter(isHistoryAssessment);
  populateWorkspaceTable({
    table: assessmentActiveTable,
    records: activeAssessments,
    view: "assessments",
    type: "assessment",
    defaultTab: "overview",
    emptyTitle: "No active Q&A records",
    emptyMessage: "Create one from a suitable lead when an enquiry is worth assessing further.",
    countTarget: assessmentActiveCount,
    countLabel: "active",
    cells: (assessment) => [
      `<div class="record-main">${escapeHtml(assessment.customerName || assessment.client || "")}</div><div class="record-sub">${escapeHtml(compactMeta([assessment.area, assessment.postcode]))}</div>`,
      `${escapeHtml(assessment.serviceLabel || assessment.serviceType || "")}<div class="record-sub">${escapeHtml(assessment.frequencyLabel || assessment.frequency || "")}</div>`,
      `${escapeHtml(assessment.estimate || "Estimate pending")}<div class="record-sub">${escapeHtml(compactMeta([assessment.quoteRange || "", assessment.accountingQuote?.displayReference || ""]))}</div>`,
      `<span class="pill warn">${escapeHtml(assessment.quoteStageLabel || assessment.quoteStage || assessment.statusLabel || assessment.status || "Draft")}</span>`
    ],
    renderWorkspace: renderAssessmentWorkspace
  });
  populateWorkspaceTable({
    table: assessmentHistoryTable,
    records: historyAssessments,
    view: "assessments",
    type: "assessment",
    defaultTab: "overview",
    emptyTitle: "No Q&A history yet",
    emptyMessage: "Converted and closed Q&A records will remain visible here for traceability.",
    countTarget: assessmentHistoryCount,
    countLabel: "history",
    cells: (assessment) => [
      `<div class="record-main">${escapeHtml(assessment.customerName || assessment.client || "")}</div><div class="record-sub">${escapeHtml(compactMeta([assessment.area, assessment.postcode]))}</div>`,
      `${escapeHtml(assessment.serviceLabel || assessment.serviceType || "")}<div class="record-sub">${escapeHtml(assessment.frequencyLabel || assessment.frequency || "")}</div>`,
      `${escapeHtml(assessment.estimate || "Estimate pending")}<div class="record-sub">${escapeHtml(compactMeta([assessment.quoteRange || "", assessment.accountingQuote?.displayReference || ""]))}</div>`,
      `<span class="pill blue">${escapeHtml(assessment.isConverted || assessment.convertedClientId ? "Converted" : assessment.quoteStageLabel || assessment.quoteStage || assessment.statusLabel || assessment.status || "Closed")}</span>`
    ],
    renderWorkspace: renderAssessmentWorkspace
  });

  const clientTable = document.querySelector("[data-client-table]");
  const clientCount = document.querySelector("[data-client-count]");
  populateWorkspaceTable({
    table: clientTable,
    records: data.clients || [],
    view: "clients",
    type: "client",
    defaultTab: "overview",
    emptyTitle: "No Client & Home records yet",
    emptyMessage: "Converted accepted Q&A records will appear here as the client base grows.",
    countTarget: clientCount,
    countLabel: "records",
    cells: (client) => [
      `<div class="record-main">${escapeHtml(client.name || "")}</div><div class="record-sub">${escapeHtml(compactMeta([client.area, client.address]))}</div>`,
      `${escapeHtml(clientServiceLabel(client) || "Service pending")}<div class="record-sub">${escapeHtml(clientFrequencyLabel(client) || "")}</div>`,
      `${escapeHtml(client.manHours ? `${client.manHours} man-hours` : "Plan pending")}<div class="record-sub">${escapeHtml(compactMeta([client.mainCleaner, client.helper]))}</div>`,
      `<span class="pill">${escapeHtml(clientStatusDisplay(client))}</span>`
    ],
    renderWorkspace: renderClientWorkspace
  });

  const jobTable = document.querySelector("[data-job-table]");
  jobTable.innerHTML = "";
  data.jobs.forEach((job) => {
    jobTable.append(recordRow("job", job, [
      `<div class="record-main">${job.client}</div><div class="record-sub">${job.type}</div>`,
      `${formatDate(job.date)}<div class="record-sub">${job.time || ""}</div>`,
      `${job.manHours} man-hours`,
      `<span class="pill ${job.status === "assessment" ? "blue" : ""}">${job.statusLabel || job.status}</span>`
    ]));
  });

  const invoiceTable = document.querySelector("[data-invoice-table]");
  invoiceTable.innerHTML = "";
  data.invoices.forEach((invoice) => {
    invoiceTable.append(recordRow("invoice", invoice, [
      `<div class="record-main">${invoice.number}</div><div class="record-sub">${invoice.client}</div>`,
      `${invoice.date}`,
      `${invoice.amount}`,
      `<span class="pill ${invoice.status === "Sent" ? "warn" : ""}">${invoice.status}</span>`
    ]));
  });

  const taskTable = document.querySelector("[data-task-table]");
  if (taskTable) {
    taskTable.innerHTML = "";
    (data.tasks || []).forEach((task) => {
      taskTable.append(recordRow("task", task, [
        `<div class="record-main">${task.title}</div><div class="record-sub">${task.notes || ""}</div>`,
        `${task.taskType || "Task"}<div class="record-sub">${formatDateTime(task.dueAt) || "No due date"}</div>`,
        `${task.priority || "Normal"}`,
        `<span class="pill ${task.priority === "High" ? "warn" : ""}">${task.status || "Open"}</span>`
      ]));
    });
  }
}

function renderCleanerPhone() {
  const job = data.jobs[0];
  if (!job) {
    document.querySelector("[data-cleaner-phone]").innerHTML = "<p>No checklist available.</p>";
    return;
  }
  const phone = document.querySelector("[data-cleaner-phone]");
  phone.innerHTML = `
    <div class="phone-top">
      <div>
        <p class="eyebrow">Today</p>
        <h3>${job.client}</h3>
      </div>
      <span class="pill">${job.time}</span>
    </div>
    <div class="meta-list">
      <div><span>Address</span><strong>Aykley Heads</strong></div>
      <div><span>Man-hours</span><strong>${job.manHours}</strong></div>
      <div><span>Helper</span><strong>${job.helper}</strong></div>
    </div>
    <p><strong>Special:</strong> ${job.instructions}</p>
    ${
      (job.followups || []).length
        ? `<div class="followup-list">
            ${(job.followups || []).map((item) => `<div class="followup-item"><p>${item.note}</p></div>`).join("")}
          </div>`
        : ""
    }
    <div class="checklist">
      ${job.checklist
        .map((item, index) => `
          <label class="check-item">
            <input type="checkbox" data-checklist-id="${typeof item === "string" ? "" : item.id}" ${typeof item === "string" ? (index < 2 ? "checked" : "") : item.completed ? "checked" : ""}>
            <span>${typeof item === "string" ? item : item.label}</span>
          </label>
        `)
        .join("")}
    </div>
    <form class="followup-form" data-cleaner-followup>
      <textarea name="note" rows="2" placeholder="Follow up next visit..."></textarea>
      <button class="ghost" type="submit">Add follow-up note</button>
    </form>
    <a class="primary" href="forms/job-report.html?job=${job.id}" style="width:100%; margin-top:14px;">Open full report</a>
  `;

  phone.querySelectorAll("[data-checklist-id]").forEach((checkbox) => {
    checkbox.addEventListener("change", async () => {
      if (!state.apiReady || !checkbox.dataset.checklistId) return;
      await apiPatch(`/api/checklist/${checkbox.dataset.checklistId}`, {
        completed: checkbox.checked
      });
    });
  });

  const form = phone.querySelector("[data-cleaner-followup]");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const note = new FormData(form).get("note")?.trim();
    if (!note) return;
    const followup = {
      id: `local-followup-${Date.now()}`,
      clientId: job.clientId,
      sourceJobId: job.id,
      note,
      status: "open",
      createdBy: "Cleaner"
    };
    if (state.apiReady) {
      await apiPost("/api/followups", followup);
      await loadApiData();
    } else {
      job.followups = [followup, ...(job.followups || [])];
      renderAll();
    }
  });
}

function renderExports(type) {
  const preview = document.querySelector("[data-export-preview]");
  if (state.apiReady) {
    fetch(`/api/export/${type}`)
      .then((response) => response.text())
      .then((text) => {
        preview.textContent = text;
      })
      .catch(() => {
        preview.textContent = "Export failed. Check the Cloudflare function and D1 binding.";
      });
    return;
  }
  const rows = {
    invoices: [
      ["number", "client", "date", "amount", "status", "paid_date"],
      ...data.invoices.map((invoice) => [invoice.number, invoice.client, invoice.date, invoice.amount, invoice.status, invoice.paid])
    ],
    jobs: [
      ["client", "date", "time", "type", "man_hours", "main_cleaner", "helper", "status"],
      ...data.jobs.map((job) => [job.client, job.date, job.time, job.type, job.manHours, job.mainCleaner, job.helper, job.status])
    ],
    clients: [
      ["name", "area", "frequency", "man_hours", "main_cleaner", "helper"],
      ...data.clients.map((client) => [client.name, client.area, client.frequency, client.manHours, client.mainCleaner, client.helper])
    ]
  };
  preview.textContent = rows[type].map((row) => row.join(",")).join("\n");
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  document.querySelectorAll("[data-view-link]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.viewLink));
  });

  document.querySelectorAll(".metric-card[data-view-link]").forEach((card) => {
    card.addEventListener("click", () => setView(card.dataset.viewLink));
  });

  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => setRole(button.dataset.role));
  });

  document.querySelectorAll("[data-open-drawer]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.openDrawer === "lead") {
        openLeadForm();
      } else {
        openDrawer(button.dataset.openDrawer);
      }
    });
  });

  document.querySelector("[data-generate-jobs]").addEventListener("click", async () => {
    if (state.apiReady) {
      const now = new Date();
      const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
      const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 0));
      await apiPost("/api/generate-jobs", {
        startDate: startDate.toISOString().slice(0, 10),
        endDate: endDate.toISOString().slice(0, 10)
      });
      await loadApiData();
      setView("jobs");
      return;
    }

    data.jobs.push({
      id: `job-${data.jobs.length + 1}`,
      client: "Mrs Knowles",
      date: "2026-06-02",
      time: "09:00",
      status: "Scheduled",
      type: "Regular clean",
      manHours: "4",
      mainCleaner: "Anna",
      helper: "Sam optional",
      instructions: "Generated preview job for monthly review.",
      checklist: data.jobs[0].checklist
    });
    renderTables();
    renderCleanerPhone();
    openDrawer("job", data.jobs[data.jobs.length - 1]);
  });

  document.querySelectorAll("[data-export]").forEach((button) => {
    button.addEventListener("click", () => renderExports(button.dataset.export));
  });

  document.querySelectorAll("[data-filter]").forEach((select) => {
    select.addEventListener("change", renderSchedule);
  });

  document.querySelector("[data-schedule-prev]").addEventListener("click", () => {
    state.scheduleMonth = addMonths(state.scheduleMonth || new Date(), -1);
    renderSchedule();
  });

  document.querySelector("[data-schedule-next]").addEventListener("click", () => {
    state.scheduleMonth = addMonths(state.scheduleMonth || new Date(), 1);
    renderSchedule();
  });

  document.querySelector("[data-schedule-today]").addEventListener("click", () => {
    const now = new Date();
    state.scheduleMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    renderSchedule();
  });

  document.querySelector("[data-schedule-month]").addEventListener("change", (event) => {
    const [year, month] = event.target.value.split("-").map(Number);
    if (year && month) {
      state.scheduleMonth = new Date(Date.UTC(year, month - 1, 1));
      renderSchedule();
    }
  });
}

function renderAll() {
  renderDashboard();
  renderPriorityList();
  renderPriorityList("[data-lead-list]");
  renderLeadHistory();
  renderLeadBoard();
  renderTables();
  renderCleanerPhone();
  renderMiniCalendar();
  renderSchedule();
  syncWorkspaceFirstLayout();
}

function normalizeApiData(payloads) {
  const [options, dashboard, leads, tasks, assessments, clients, jobs, invoices] = payloads;
  state.options = Object.fromEntries(options.groups.map((group) => [group.key, group]));
  normalizeLeadData(leads);
  data.tasks = tasks.tasks || [];
  data.assessments = assessments.assessmentQuotes || assessments.assessments || [];
  data.clients = clients.clients;
  data.jobs = jobs.jobs.map((job) => ({
    ...job,
      type: job.typeLabel,
      statusValue: job.status,
      status: job.statusLabel,
      instructions: job.instructions || "",
      followups: job.followups || []
    }));
  data.invoices = invoices.invoices;
  data.dashboard = dashboard;
}

function normalizeLeadData(leads) {
  data.leads = (leads.leads || []).map((lead) => ({
    ...lead,
    statusValue: lead.status,
    status: lead.statusLabel,
    source: lead.sourceLabel,
    service: lead.serviceLabel,
    note: lead.notes,
    quoteAssist: lead.quoteAssist
  }));
}

async function loadApiData() {
  const payloads = await Promise.allSettled([
    apiGet("/api/options"),
    apiGet("/api/dashboard"),
    apiGet("/api/leads"),
    apiGet("/api/admin/tasks"),
    apiGet("/api/assessment-quotes"),
    apiGet("/api/clients"),
    apiGet("/api/jobs"),
    apiGet("/api/invoices")
  ]);

  const [options, dashboard, leads, tasks, assessments, clients, jobs, invoices] = payloads;
  if (leads.status !== "fulfilled") throw leads.reason || new Error("API /api/leads failed");

  if (options.status === "fulfilled") {
    state.options = Object.fromEntries(options.value.groups.map((group) => [group.key, group]));
  } else {
    state.options = {};
  }

  normalizeLeadData(leads.value);
  data.dashboard = dashboard.status === "fulfilled" ? dashboard.value : null;
  data.tasks = tasks.status === "fulfilled" ? tasks.value.tasks || [] : [];
  data.assessments = assessments.status === "fulfilled" ? assessments.value.assessmentQuotes || assessments.value.assessments || [] : [];
  data.clients = clients.status === "fulfilled" ? clients.value.clients || [] : [];
  data.jobs = jobs.status === "fulfilled"
    ? jobs.value.jobs.map((job) => ({
        ...job,
        type: job.typeLabel,
        statusValue: job.status,
        status: job.statusLabel,
        instructions: job.instructions || "",
        followups: job.followups || []
      }))
    : [];
  data.invoices = invoices.status === "fulfilled" ? invoices.value.invoices || [] : [];

  state.apiReady = true;
  const failedCount = payloads.filter((result) => result.status === "rejected").length;
  backendStatus.textContent = failedCount
    ? "Connected to Cloudflare D1 leads. Some admin datasets failed to load, but real leads are shown."
    : "Connected to Cloudflare D1. Protect /admin/* and /api/* with Cloudflare Access before real customer data.";
  renderAll();
}

async function boot() {
  bindEvents();
  if (window.location.protocol === "file:") {
    state.apiReady = false;
    backendStatus.textContent = "Using local demo data. Deploy with D1 and protect /admin/* plus /api/* before real customer data.";
    renderAll();
    return;
  }

  try {
    await loadApiData();
  } catch {
    state.apiReady = false;
    backendStatus.textContent = "Using local demo data. Deploy with D1 and protect /admin/* plus /api/* before real customer data.";
    renderAll();
  }
}

boot();

