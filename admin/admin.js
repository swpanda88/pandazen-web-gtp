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
  quotes: [],
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
  assessmentSetupClientId: null,
  editingAssessmentId: null,
  editingAssessmentTab: null,
  editingClientId: null,
  editingClientTab: null,
  scheduleMonth: null,
  activeDrawerType: null,
  expandedWorkspaces: {
    assessments: null,
    clients: null
  },
  workspaceDrawerMode: {
    assessments: "collapsed",
    clients: "collapsed"
  },
  workspaceDrawerRecord: {
    assessments: null,
    clients: null
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
const clientHistoryStatuses = new Set(["ended", "archived", "inactive", "cancelled", "lost", "closed"]);
const workspaceFirstViews = new Set(["assessments", "clients"]);
const assessmentCloseReasons = [
  { value: "customer_changed_mind", label: "Customer changed mind" },
  { value: "no_response", label: "No response" },
  { value: "not_suitable", label: "Not suitable" },
  { value: "fully_booked", label: "Fully booked" },
  { value: "outside_service_area", label: "Outside service area" },
  { value: "quote_rejected", label: "Quote rejected" },
  { value: "duplicate", label: "Duplicate" },
  { value: "test_or_error", label: "Test or error" },
  { value: "other", label: "Other" }
];
const assessmentReasonOptions = [
  { value: "existing_client_extra", label: "Existing client extra work" },
  { value: "new_property_existing_client", label: "New property for existing client" },
  { value: "cleaner_follow_up", label: "Cleaner follow-up" },
  { value: "complaint_review", label: "Complaint / Review" },
  { value: "other", label: "Other" }
];

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
  if (!response.ok) {
    let message = `API ${path} failed`;
    try {
      const text = await response.text();
      if (text) {
        try {
          const payload = JSON.parse(text);
          if (payload?.error) {
            message = payload.error;
          } else {
            message = text;
          }
        } catch {
          message = text;
        }
      }
    } catch {
      // Keep the generic fallback when the response has no JSON body.
    }
    throw new Error(message);
  }
  return response.json();
}

async function apiPatch(path, body) {
  const response = await fetch(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    let message = `API ${path} failed`;
    try {
      const payload = await response.json();
      if (payload?.error) {
        message = payload.error;
      }
    } catch {
      // Keep the generic fallback when the response has no JSON body.
    }
    throw new Error(message);
  }
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
  if (previousView === "assessments" && view !== "assessments") {
    clearAssessmentWorkspaceEditState();
  }
  if (previousView === "clients" && view !== "clients") {
    clearClientWorkspaceEditState();
  }
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
  if (isWorkspaceFirstView(view) && !state.activeDrawerType) {
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

function humanizeToken(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function assessmentSourceDisplay(record) {
  const value = record?.sourceType || (record?.clientId ? "existing_client" : record?.leadId ? "new_prospect" : "unknown");
  const labels = {
    new_prospect: "New Prospect",
    existing_client: "Existing Client",
    manual_admin: "Manual / Admin",
    unknown: "Unknown"
  };
  return labels[value] || humanizeToken(value);
}

function assessmentPurposeDisplay(record) {
  const value = record?.assessmentPurpose || "unknown";
  const labels = {
    base_recurring: "Base Recurring",
    one_off_extra_work: "One-off / Extra Work",
    deep_clean: "Deep Clean",
    follow_up: "Follow-up",
    complaint_review: "Complaint / Review",
    unknown: "Unknown"
  };
  return labels[value] || humanizeToken(value);
}

function assessmentTitle(record) {
  return record?.workLabel || record?.customerName || record?.client || `Assessment #${record?.id || ""}`;
}

function assessmentPropertyContext(record) {
  return compactMeta([record?.propertyLabel, record?.propertyAddress, record?.area, record?.postcode]);
}

function setupServiceTypeOptions() {
  const fromState = (state.options.service_type?.options || []).map((option) => ({
    value: option.value,
    label: option.label
  }));
  const preferred = [
    { value: "", label: "Select service type" },
    { value: "regular_cleaning", label: "Regular cleaning" },
    { value: "one_off_cleaning", label: "One-off cleaning" },
    { value: "deep_cleaning", label: "Deep clean" },
    { value: "after_builders_cleaning", label: "After-builders clean" },
    { value: "end_of_tenancy_cleaning", label: "End of tenancy clean" },
    { value: "bnb_turnover", label: "B&B / Guest Turnover" },
    { value: "other", label: "Other" }
  ];
  const merged = [];
  const seen = new Set();
  [...preferred, ...fromState].forEach((option) => {
    const key = option.value;
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(option);
  });
  return merged;
}

function assessmentIdentityContext(record) {
  const titleDiffers = record?.workLabel && record?.customerName && record.workLabel !== record.customerName;
  return compactMeta([
    titleDiffers ? record.customerName : "",
    assessmentPropertyContext(record),
    assessmentSourceDisplay(record)
  ]);
}

function quoteStatusDisplay(quote) {
  return humanizeToken(quote?.status || "draft");
}

function sortQuotes(quotes) {
  return [...(quotes || [])].sort((left, right) => {
    const byNumber = (Number(right.quoteNumber || 0) - Number(left.quoteNumber || 0))
      || (Number(right.versionNumber || 0) - Number(left.versionNumber || 0))
      || (Number(right.id || 0) - Number(left.id || 0));
    return byNumber;
  });
}

function latestQuote(quotes) {
  return sortQuotes(quotes)[0] || null;
}

function quotesForAssessment(record) {
  const related = record?.quotes?.length
    ? record.quotes
    : (data.quotes || []).filter((quote) => String(quote.assessmentQuoteId) === String(record?.id));
  return sortQuotes(related);
}

function quotesForClient(record) {
  const byClient = (data.quotes || []).filter((quote) => String(quote.clientId || "") === String(record?.id));
  if (byClient.length) return sortQuotes(byClient);
  const byAssessment = record?.assessmentQuoteId
    ? (data.quotes || []).filter((quote) => String(quote.assessmentQuoteId) === String(record.assessmentQuoteId))
    : [];
  return sortQuotes(record?.quotes?.length ? record.quotes : byAssessment);
}

function assessmentsForClient(record) {
  const related = (data.assessments || []).filter((assessment) =>
    String(assessment.clientId || "") === String(record?.id)
    || String(assessment.convertedClientId || "") === String(record?.id)
    || (record?.assessmentQuoteId && String(assessment.id) === String(record.assessmentQuoteId))
  );
  return [...related].sort((left, right) => new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0));
}

function draftQuoteForAssessment(record) {
  return quotesForAssessment(record).find((quote) => String(quote.status || "").toLowerCase() === "draft") || null;
}

function canCreateNewQuoteVersion(record) {
  return !draftQuoteForAssessment(record);
}

function quoteSummaryMeta(quote) {
  return compactMeta([
    quoteStatusDisplay(quote),
    quote.totalPriceLabel || formatMoneyPence(quote.totalPrice),
    quote.recurringPriceLabel || formatMoneyPence(quote.recurringPrice),
    quote.validUntil ? `Valid ${formatDate(quote.validUntil)}` : ""
  ]);
}

function quoteActionButtons(quote, assessmentQuoteId) {
  const status = String(quote.status || "").toLowerCase();
  if (status === "draft") {
    return `
      <div class="drawer-actions compact">
        <button class="ghost" type="button" data-edit-draft-quote="${escapeHtml(quote.id)}">Edit draft</button>
        <a class="ghost button-link" href="forms/quote-preview.html?id=${escapeHtml(quote.id)}" target="_blank">Preview</a>
        <button class="ghost" type="button" data-update-quote-status="sent" data-quote-id="${escapeHtml(quote.id)}" data-assessment-quote-id="${escapeHtml(assessmentQuoteId)}">Mark sent</button>
        <button class="ghost" type="button" data-update-quote-status="void" data-quote-id="${escapeHtml(quote.id)}" data-assessment-quote-id="${escapeHtml(assessmentQuoteId)}">Void draft</button>
      </div>
    `;
  }

  if (status === "sent") {
    return `
      <div class="drawer-actions compact">
        <a class="ghost button-link" href="forms/quote-preview.html?id=${escapeHtml(quote.id)}" target="_blank">Preview</a>
        <button class="ghost" type="button" data-update-quote-status="accepted" data-quote-id="${escapeHtml(quote.id)}" data-assessment-quote-id="${escapeHtml(assessmentQuoteId)}">Mark accepted</button>
        <button class="ghost" type="button" data-update-quote-status="rejected" data-quote-id="${escapeHtml(quote.id)}" data-assessment-quote-id="${escapeHtml(assessmentQuoteId)}">Mark rejected</button>
        <button class="ghost" type="button" data-update-quote-status="expired" data-quote-id="${escapeHtml(quote.id)}" data-assessment-quote-id="${escapeHtml(assessmentQuoteId)}">Mark expired</button>
      </div>
    `;
  }

  return `
    <div class="drawer-actions compact">
      <a class="ghost button-link" href="forms/quote-preview.html?id=${escapeHtml(quote.id)}" target="_blank">Preview</a>
    </div>
  `;
}

function clientQuoteActionButtons(quote) {
  return `
    <div class="drawer-actions compact">
      <a class="ghost button-link" href="forms/quote-preview.html?id=${escapeHtml(quote.id)}" target="_blank">Preview</a>
      <a class="ghost button-link" href="forms/quote-preview.html?id=${escapeHtml(quote.id)}&print=true" target="_blank">Print</a>
    </div>
  `;
}

function renderQuoteRecordCard(quote, assessmentQuoteId) {
  return `
    <article class="workspace-list-item quote-record-item">
      <strong>${escapeHtml(quote.displayReference || `Quote #${quote.id}`)}</strong>
      <p>${escapeHtml(quoteSummaryMeta(quote) || quoteStatusDisplay(quote))}</p>
      <small>${escapeHtml(compactMeta([
        quote.clientName || quote.customerName,
        quote.updatedAt ? `Updated ${formatDateTime(quote.updatedAt)}` : ""
      ]))}</small>
      ${assessmentQuoteId ? quoteActionButtons(quote, assessmentQuoteId) : clientQuoteActionButtons(quote)}
    </article>
  `;
}

function mergeQuotesIntoRecords(assessments, clients, quotes) {
  const quotesByAssessment = new Map();
  const quotesByClient = new Map();

  quotes.forEach((quote) => {
    const assessmentKey = String(quote.assessmentQuoteId || "");
    const clientKey = String(quote.clientId || "");
    if (assessmentKey) {
      const existing = quotesByAssessment.get(assessmentKey) || [];
      existing.push(quote);
      quotesByAssessment.set(assessmentKey, existing);
    }
    if (clientKey) {
      const existing = quotesByClient.get(clientKey) || [];
      existing.push(quote);
      quotesByClient.set(clientKey, existing);
    }
  });

  const hydratedAssessments = (assessments || []).map((assessment) => {
    const relatedQuotes = sortQuotes(quotesByAssessment.get(String(assessment.id)) || []);
    return {
      ...assessment,
      quotes: relatedQuotes,
      accountingQuote: latestQuote(relatedQuotes) || assessment.accountingQuote || null
    };
  });

  const hydratedClients = (clients || []).map((client) => {
    const related = sortQuotes([
      ...(quotesByClient.get(String(client.id)) || []),
      ...((quotesByAssessment.get(String(client.assessmentQuoteId || "")) || []).filter(
        (quote) => !quote.clientId || String(quote.clientId) === String(client.id)
      ))
    ]);
    const uniqueQuotes = related.filter((quote, index, list) => list.findIndex((item) => String(item.id) === String(quote.id)) === index);
    return {
      ...client,
      quotes: uniqueQuotes,
      accountingQuote: latestQuote(uniqueQuotes) || client.accountingQuote || null
    };
  });

  return { hydratedAssessments, hydratedClients };
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

function isHistoryClient(record) {
  if (!record) return false;
  const status = String(record.status || "").toLowerCase();
  return status ? clientHistoryStatuses.has(status) : false;
}

function isActiveClient(record) {
  return !isHistoryClient(record);
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
  if (view === "assessments" && assessmentDetailsEditState && String(state.editingAssessmentId || "") !== String(recordId)) {
    clearAssessmentWorkspaceEditState();
  }
  if (view === "clients" && clientWorkspaceEditState && String(state.editingClientId || "") !== String(recordId)) {
    clearClientWorkspaceEditState();
  }
  if (current && String(current.id) === String(recordId)) {
    if (view === "assessments" && String(state.editingAssessmentId || "") === String(recordId)) {
      clearAssessmentWorkspaceEditState();
    }
    if (view === "clients" && String(state.editingClientId || "") === String(recordId)) {
      clearClientWorkspaceEditState();
    }
    state.expandedWorkspaces[view] = null;
  } else {
    state.expandedWorkspaces[view] = { id: recordId, tab: defaultTab };
    if (isWorkspaceFirstView(view)) {
      renderTables();
      renderWorkspaceDrawerClosedState(view);
      return;
    }
  }
  renderTables();
  syncWorkspaceFirstLayout();
}

function setWorkspaceTab(view, recordId, tab) {
  if (view === "assessments" && assessmentDetailsEditState && tab !== "details") {
    clearAssessmentWorkspaceEditState();
  }
  if (view === "clients" && clientWorkspaceEditState && tab !== state.editingClientTab) {
    clearClientWorkspaceEditState();
  }
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
  if (mode === "collapsed") {
    renderWorkspaceDrawerClosedState(view);
    return;
  }
  state.workspaceDrawerMode[view] = mode;
  syncWorkspaceFirstLayout();
}

function toggleWorkspaceDrawerMode() {
  if (!isWorkspaceFirstView()) return;
  if (workspaceDrawerMode() === "collapsed") {
    reopenWorkspaceDrawer();
    return;
  }
  resetDrawer();
}

function syncWorkspaceFirstLayout() {
  const workspaceFirst = isWorkspaceFirstView();
  const hasExpandedWorkspace = workspaceFirst && Boolean(expandedWorkspaceState(state.view));
  const drawerCollapsed = workspaceFirst && workspaceDrawerMode() === "collapsed";
  const drawerEmpty = workspaceFirst && !state.activeDrawerType;
  document.body.classList.toggle("workspace-first-view", workspaceFirst);
  document.body.classList.toggle("workspace-first-drawer-collapsed", workspaceFirst && drawerCollapsed);
  document.body.classList.toggle("workspace-first-drawer-expanded", workspaceFirst && !drawerCollapsed);
  document.body.classList.toggle("workspace-first-has-expanded-workspace", hasExpandedWorkspace);
  document.body.classList.toggle("workspace-first-drawer-empty", drawerEmpty);
  drawer.classList.toggle("workspace-first-drawer", workspaceFirst);
  drawer.classList.toggle("is-collapsed", workspaceFirst && drawerCollapsed);
  drawer.classList.toggle("is-expanded", workspaceFirst && !drawerCollapsed);
  drawer.classList.toggle("is-empty", drawerEmpty);
}

function recordsForType(type) {
  if (type === "assessment") return data.assessments || [];
  if (type === "client") return data.clients || [];
  if (type === "lead") return data.leads || [];
  if (type === "task") return data.tasks || [];
  if (type === "job") return data.jobs || [];
  if (type === "invoice") return data.invoices || [];
  return [];
}

function currentWorkspaceDrawerRecord(view = state.view) {
  if (!isWorkspaceFirstView(view)) return null;
  return state.workspaceDrawerRecord?.[view] || null;
}

function rememberWorkspaceDrawerRecord(type, record) {
  const view = type === "assessment" ? "assessments" : type === "client" ? "clients" : null;
  if (!view || !record?.id) return;
  state.workspaceDrawerRecord[view] = { type, id: record.id };
}

function reopenWorkspaceDrawer(view = state.view) {
  if (!isWorkspaceFirstView(view)) return;
  const stored = currentWorkspaceDrawerRecord(view);
  if (!stored?.id) {
    state.workspaceDrawerMode[view] = "expanded";
    state.activeDrawerType = null;
    drawer.innerHTML = renderWorkspaceEmptyDrawerShell(view);
    setupDrawerChrome();
    return;
  }
  const record = recordsForType(stored.type).find((item) => String(item.id) === String(stored.id));
  if (!record) {
    state.workspaceDrawerRecord[view] = null;
    state.workspaceDrawerMode[view] = "expanded";
    state.activeDrawerType = null;
    drawer.innerHTML = renderWorkspaceEmptyDrawerShell(view);
    setupDrawerChrome();
    return;
  }
  openDrawer(stored.type, record);
}

function renderWorkspaceDrawerRail() {
  return `
    <div class="drawer-rail">
      <button
        class="drawer-rail-button"
        type="button"
        data-open-workspace-drawer
        aria-label="Open detail drawer"
      >
        Open drawer
      </button>
    </div>
  `;
}

function attachWorkspaceDrawerRailHandler() {
  drawer.querySelector("[data-open-workspace-drawer]")?.addEventListener("click", () => reopenWorkspaceDrawer());
}

function renderWorkspaceDrawerClosedState(view = state.view) {
  state.activeDrawerType = null;
  leadDetailsEditState = null;
  if (isWorkspaceFirstView(view)) {
    state.workspaceDrawerMode[view] = "collapsed";
  }
  if (drawerScrollHandler) {
    drawer.querySelector(".drawer-body")?.removeEventListener("scroll", drawerScrollHandler);
    drawerScrollHandler = null;
  }
  drawer.innerHTML = renderWorkspaceDrawerRail();
  attachWorkspaceDrawerRailHandler();
  syncWorkspaceFirstLayout();
}

function selectWorkspaceDrawerContext(view, type, record) {
  rememberWorkspaceDrawerRecord(type, record);
  if (workspaceDrawerMode(view) === "expanded") {
    openDrawer(type, record);
    return;
  }
  renderWorkspaceDrawerClosedState(view);
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

function renderEditableSelect({ name, groupKey, currentValue, otherValue = "", staticOptions = null, allowOtherOverride = null }) {
  const group = groupKey ? state.options[groupKey] : null;
  const allowOther = allowOtherOverride === null
    ? Boolean(group?.allowOther || staticOptions?.some((option) => option.value === "other"))
    : Boolean(allowOtherOverride);
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
        <p class="record-sub">This lead already has a linked Assessment, so close-out should continue from that stage rather than the original Lead record.</p>
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
  const quotes = quotesForClient(record);
  const quote = latestQuote(quotes);
  if (!quote && !record.assessmentQuoteId) return "";
  return `
    <section class="drawer-section">
      <h3>Linked quotes</h3>
      ${
        quotes.length
          ? `<div class="workspace-list compact">
              ${quotes.map((item) => renderQuoteRecordCard(item)).join("")}
            </div>`
          : `<p class="record-sub">No linked accounting quote has been created from this Assessment yet.</p>`
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
          : `<p class="record-sub">No Quote Assist result yet. Run it from this Assessment when the available detail is ready.</p>`
      }
      <div class="drawer-actions">
        <button class="primary" type="button" data-run-quote-assist="${escapeHtml(record.id)}">Run Quote Assist</button>
      </div>
      <p class="record-sub" data-assessment-action-status></p>
    </section>
  `;
}

function renderAssessmentAccountingQuote(record) {
  const quotes = quotesForAssessment(record);
  const quote = latestQuote(quotes);
  const draftQuote = draftQuoteForAssessment(record);
  return `
    <section class="drawer-section">
      <h3>Quotes</h3>
      ${
        quotes.length
          ? `<div class="workspace-list compact">
              ${quotes.map((item) => renderQuoteRecordCard(item, record.id)).join("")}
            </div>`
          : `<p class="record-sub">No draft Accounting quote has been created from this Assessment yet.</p>`
      }
      <div class="drawer-actions">
        ${
          draftQuote
            ? `<button class="ghost" type="button" disabled aria-disabled="true">Draft quote linked</button>`
            : `<button class="primary" type="button" data-create-quote-for-assessment="${escapeHtml(record.id)}">${quotes.length ? "Create Revised Draft" : "Create Draft Quote"}</button>`
        }
      </div>
      <p class="record-sub" data-quote-action-status="${escapeHtml(record.id)}"></p>
    </section>
  `;
}

function clientForAssessmentQuote(record) {
  return (record.clientId ? (data.clients || []).find((client) => String(client.id) === String(record.clientId)) : null)
    || (data.clients || []).find((client) => String(client.assessmentQuoteId) === String(record.id))
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
          : record.clientId
            ? "Marks this Assessment as accepted and keeps it linked to the existing Client & Home record."
            : "Marks this Assessment as accepted and creates a linked Client & Home record."
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
      <h4>Assessment</h4>
      <div class="drawer-actions compact">
        ${
          assessmentQuote
            ? `<button class="primary lead-action-primary" type="button" data-open-assessment-quote="${escapeHtml(assessmentQuote.id)}">Open Assessment</button>`
            : `<button class="primary lead-action-primary" type="button" data-create-assessment-quote="${escapeHtml(record.id)}">Create Assessment</button>`
        }
      </div>
      ${
        assessmentQuote
          ? `<p class="record-sub">Linked Assessment #${escapeHtml(assessmentQuote.id)} - ${escapeHtml(assessmentQuote.quoteStageLabel || assessmentQuote.quoteStage || assessmentQuote.statusLabel || assessmentQuote.status || "Draft")}</p>`
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
let assessmentDetailsEditState = null;
let clientWorkspaceEditState = null;

function isEditingLeadDetails(record) {
  return Boolean(leadDetailsEditState && String(leadDetailsEditState.id) === String(record.id));
}

function isEditingAssessmentDetails(record) {
  return Boolean(
    assessmentDetailsEditState
    && String(state.editingAssessmentId || "") === String(record.id)
    && state.editingAssessmentTab === "details"
  );
}

function isEditingClientWorkspace(record, tab) {
  return Boolean(
    clientWorkspaceEditState
    && String(state.editingClientId || "") === String(record.id)
    && state.editingClientTab === tab
  );
}

function clearAssessmentWorkspaceEditState() {
  assessmentDetailsEditState = null;
  state.editingAssessmentId = null;
  state.editingAssessmentTab = null;
}

function clearClientWorkspaceEditState() {
  clientWorkspaceEditState = null;
  state.editingClientId = null;
  state.editingClientTab = null;
}

function assessmentDetailsDraft(record) {
  return {
    id: record.id,
    customerName: record.customerName || record.client || "",
    phone: record.phone || "",
    email: record.email || "",
    area: record.area || "",
    postcode: record.postcode || "",
    serviceType: record.serviceType || "",
    frequency: record.frequency || "",
    propertyType: record.propertyType || "",
    bedrooms: record.bedrooms || "",
    bathrooms: record.bathrooms || "",
    propertyCondition: record.propertyCondition || "",
    pets: record.pets || "",
    parking: record.parking || "",
    priorities: record.priorities || "",
    productPreferences: record.productPreferences || "",
    notes: record.notes || "",
    assessmentNotes: record.assessmentNotes || "",
    quoteNotes: record.quoteNotes || ""
  };
}

function clientContactAccessDraft(record) {
  return {
    id: record.id,
    name: record.name || "",
    phone: record.phone || "",
    email: record.email || "",
    preferredContact: record.preferredContact || "",
    accessMethod: record.accessMethod || "",
    accessOther: record.accessOther || "",
    accessNotes: record.accessNotes || "",
    parkingNotes: record.parkingNotes || "",
    petType: record.petType || "",
    petOther: record.petOther || "",
    petNotes: record.petNotes || "",
    productPreference: record.productPreference || "",
    productOther: record.productOther || "",
    surfaceNotes: record.surfaceNotes || "",
    notes: record.notes || ""
  };
}

function clientHomeDetailsDraft(record) {
  return {
    id: record.id,
    area: record.area || "",
    address: record.address || ""
  };
}

function clientCleaningPlanDraft(record) {
  return {
    id: record.id,
    cleaningPlanId: record.cleaningPlanId || "",
    frequency: record.frequency || "",
    manHours: record.manHours || "",
    specialInstructions: record.specialInstructions || ""
  };
}

function startAssessmentDetailsEdit(record) {
  assessmentDetailsEditState = assessmentDetailsDraft(record);
  state.editingAssessmentId = record.id;
  state.editingAssessmentTab = "details";
  setWorkspaceTab("assessments", record.id, "details");
}

function startClientWorkspaceEdit(record, tab) {
  const draftFactory = {
    "contact-access": clientContactAccessDraft,
    "home-details": clientHomeDetailsDraft,
    "cleaning-plan": clientCleaningPlanDraft
  }[tab];

  if (!draftFactory) return;
  clientWorkspaceEditState = draftFactory(record);
  state.editingClientId = record.id;
  state.editingClientTab = tab;
  setWorkspaceTab("clients", record.id, tab);
}

function workspaceEditHeader({
  title,
  helper = "",
  editing = false,
  editLabel = "Edit details",
  saveLabel = "Save changes",
  editAction = "",
  cancelAction = "",
  editButtonClass = "secondary workspace-edit-trigger"
}) {
  return `
    <div class="workspace-section-head workspace-edit-head">
      <div>
        <h4>${escapeHtml(title)}</h4>
        ${helper ? `<p>${escapeHtml(helper)}</p>` : ""}
      </div>
      <div class="drawer-actions compact workspace-edit-actions">
        ${
          editing
            ? `
              <button class="ghost workspace-cancel-trigger" type="button" ${cancelAction}>Cancel</button>
              <button class="primary workspace-save-trigger" type="submit">${escapeHtml(saveLabel)}</button>
            `
            : editAction
              ? `<button class="${escapeHtml(editButtonClass)}" type="button" ${editAction}>${escapeHtml(editLabel)}</button>`
              : ""
        }
      </div>
    </div>
  `;
}

function renderAssessmentEditableFields(draft) {
  return `
    <div class="field-grid workspace-edit-grid">
      ${renderEditableInput("Customer / prospect name", `<input name="customerName" value="${escapeHtml(draft.customerName)}">`)}
      ${renderEditableInput("Phone", `<input name="phone" value="${escapeHtml(draft.phone)}">`)}
      ${renderEditableInput("Email", `<input name="email" type="email" value="${escapeHtml(draft.email)}">`)}
      ${renderEditableInput("Area", `<input name="area" value="${escapeHtml(draft.area)}">`)}
      ${renderEditableInput("Postcode", `<input name="postcode" value="${escapeHtml(draft.postcode)}">`)}
      ${renderEditableInput("Service type", renderEditableSelect({ name: "serviceType", groupKey: "service_type", currentValue: draft.serviceType, allowOtherOverride: false }))}
      ${renderEditableInput("Frequency", renderEditableSelect({ name: "frequency", groupKey: "frequency", currentValue: draft.frequency }))}
      ${renderEditableInput("Property type", renderEditableSelect({ name: "propertyType", currentValue: draft.propertyType, staticOptions: leadStaticOptions.propertyType, allowOtherOverride: false }))}
      ${renderEditableInput("Bedrooms", renderEditableSelect({ name: "bedrooms", currentValue: draft.bedrooms, staticOptions: leadStaticOptions.bedrooms }))}
      ${renderEditableInput("Bathrooms", renderEditableSelect({ name: "bathrooms", currentValue: draft.bathrooms, staticOptions: leadStaticOptions.bathrooms }))}
      ${renderEditableInput("Property condition", renderEditableSelect({ name: "propertyCondition", groupKey: "condition_level", currentValue: draft.propertyCondition }))}
      ${renderEditableInput("Pets", renderEditableSelect({ name: "pets", groupKey: "pet_type", currentValue: draft.pets, allowOtherOverride: false }))}
      ${renderEditableInput("Parking", renderEditableSelect({ name: "parking", currentValue: draft.parking, staticOptions: leadStaticOptions.parking }))}
      ${renderEditableInput("Product preferences", renderEditableSelect({ name: "productPreferences", groupKey: "product_preference", currentValue: draft.productPreferences, allowOtherOverride: false }))}
      ${renderEditableInput("Priorities", `<textarea name="priorities" rows="3">${escapeHtml(draft.priorities)}</textarea>`, "field-span-2")}
      ${renderEditableInput("Assessment notes", `<textarea name="assessmentNotes" rows="4">${escapeHtml(draft.assessmentNotes)}</textarea>`, "field-span-2")}
      ${renderEditableInput("Quote notes", `<textarea name="quoteNotes" rows="4">${escapeHtml(draft.quoteNotes)}</textarea>`, "field-span-2")}
      ${renderEditableInput("Internal notes", `<textarea name="notes" rows="4">${escapeHtml(draft.notes)}</textarea>`, "field-span-2")}
    </div>
  `;
}

function renderClientContactAccessEditableFields(draft) {
  return `
    <div class="field-grid workspace-edit-grid">
      ${renderEditableInput("Client name", `<input name="name" value="${escapeHtml(draft.name)}">`)}
      ${renderEditableInput("Phone", `<input name="phone" value="${escapeHtml(draft.phone)}">`)}
      ${renderEditableInput("Email", `<input name="email" type="email" value="${escapeHtml(draft.email)}">`)}
      ${renderEditableInput("Preferred contact", renderEditableSelect({ name: "preferredContact", groupKey: "preferred_contact", currentValue: draft.preferredContact }))}
      ${renderEditableInput("Access method", renderEditableSelect({ name: "accessMethod", groupKey: "access_method", currentValue: draft.accessMethod, otherValue: draft.accessOther }))}
      ${renderEditableInput("Pets", renderEditableSelect({ name: "petType", groupKey: "pet_type", currentValue: draft.petType, otherValue: draft.petOther }))}
      ${renderEditableInput("Product preferences", renderEditableSelect({ name: "productPreference", groupKey: "product_preference", currentValue: draft.productPreference, otherValue: draft.productOther }))}
      ${renderEditableInput("Access notes", `<textarea name="accessNotes" rows="3">${escapeHtml(draft.accessNotes)}</textarea>`, "field-span-2")}
      ${renderEditableInput("Parking notes", `<textarea name="parkingNotes" rows="2">${escapeHtml(draft.parkingNotes)}</textarea>`, "field-span-2")}
      ${renderEditableInput("Pet notes", `<textarea name="petNotes" rows="2">${escapeHtml(draft.petNotes)}</textarea>`, "field-span-2")}
      ${renderEditableInput("Surface notes", `<textarea name="surfaceNotes" rows="3">${escapeHtml(draft.surfaceNotes)}</textarea>`, "field-span-2")}
      ${renderEditableInput("Internal notes", `<textarea name="notes" rows="4">${escapeHtml(draft.notes)}</textarea>`, "field-span-2")}
    </div>
  `;
}

function renderClientHomeEditableFields(draft, record) {
  return `
    <div class="field-grid workspace-edit-grid">
      ${renderEditableInput("Area", `<input name="area" value="${escapeHtml(draft.area)}">`)}
      ${renderEditableInput("Address", `<input name="address" value="${escapeHtml(draft.address)}">`, "field-span-2")}
    </div>
    ${detailRows([
      ["Postcode", record.postcode],
      ["Property type", record.propertyType],
      ["Bedrooms", record.bedrooms],
      ["Bathrooms", record.bathrooms],
      ["Reception rooms", record.receptionRooms],
      ["Kitchen size", record.kitchenSize],
      ["Property size", record.propertySize],
      ["Condition", record.propertyCondition]
    ])}
    <p class="record-sub workspace-edit-note">Property structure fields remain read-only here until they have clear Client &amp; Home ownership.</p>
  `;
}

function renderClientCleaningPlanEditableFields(draft, record) {
  return `
    <div class="field-grid workspace-edit-grid">
      ${renderEditableInput("Frequency", renderEditableSelect({ name: "frequency", groupKey: "frequency", currentValue: draft.frequency }))}
      ${renderEditableInput("Default man-hours", `<input name="manHours" type="number" step="0.25" min="0" value="${escapeHtml(draft.manHours)}">`)}
      ${renderEditableInput("Special instructions", `<textarea name="specialInstructions" rows="4">${escapeHtml(draft.specialInstructions)}</textarea>`, "field-span-2")}
    </div>
    ${detailRows([
      ["Service", clientServiceLabel(record)],
      ["Requested frequency", record.requestedFrequencyLabel || record.requestedFrequency],
      ["Preferred days", record.preferredDays],
      ["Main cleaner", record.mainCleaner],
      ["Helper", record.helper],
      ["Priorities", record.priorities]
    ])}
  `;
}

function normaliseAssessmentDetailsPayload(formData) {
  const raw = Object.fromEntries(formData.entries());
  const trimmed = (value) => {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text ? text : null;
  };

  return {
    action: "update_details",
    customerName: trimmed(raw.customerName),
    phone: trimmed(raw.phone),
    email: trimmed(raw.email),
    area: trimmed(raw.area),
    postcode: trimmed(raw.postcode),
    serviceType: trimmed(raw.serviceType),
    frequency: trimmed(raw.frequency),
    propertyType: trimmed(raw.propertyType),
    bedrooms: trimmed(raw.bedrooms),
    bathrooms: trimmed(raw.bathrooms),
    propertyCondition: trimmed(raw.propertyCondition),
    pets: trimmed(raw.pets),
    parking: trimmed(raw.parking),
    priorities: trimmed(raw.priorities),
    productPreferences: trimmed(raw.productPreferences),
    notes: trimmed(raw.notes),
    assessmentNotes: trimmed(raw.assessmentNotes),
    quoteNotes: trimmed(raw.quoteNotes)
  };
}

function normaliseClientContactAccessPayload(formData) {
  const raw = Object.fromEntries(formData.entries());
  const trimmed = (value) => {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text ? text : null;
  };

  return {
    action: "update_contact_access",
    name: trimmed(raw.name),
    phone: trimmed(raw.phone),
    email: trimmed(raw.email),
    preferredContact: trimmed(raw.preferredContact),
    accessMethod: trimmed(raw.accessMethod),
    accessOther: raw.accessMethod === "other" ? trimmed(raw.accessMethodOther) : null,
    accessNotes: trimmed(raw.accessNotes),
    parkingNotes: trimmed(raw.parkingNotes),
    petType: trimmed(raw.petType),
    petOther: raw.petType === "other" ? trimmed(raw.petTypeOther) : null,
    petNotes: trimmed(raw.petNotes),
    productPreference: trimmed(raw.productPreference),
    productOther: raw.productPreference === "other" ? trimmed(raw.productPreferenceOther) : null,
    surfaceNotes: trimmed(raw.surfaceNotes),
    notes: trimmed(raw.notes)
  };
}

function normaliseClientHomeDetailsPayload(formData) {
  const raw = Object.fromEntries(formData.entries());
  const trimmed = (value) => {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text ? text : null;
  };

  return {
    action: "update_home_details",
    area: trimmed(raw.area),
    address: trimmed(raw.address)
  };
}

function normaliseClientCleaningPlanPayload(formData, record) {
  const raw = Object.fromEntries(formData.entries());
  const trimmed = (value) => {
    if (value === undefined || value === null) return null;
    const text = String(value).trim();
    return text ? text : null;
  };

  return {
    action: "update_cleaning_plan",
    cleaningPlanId: record.cleaningPlanId || null,
    frequency: trimmed(raw.frequency),
    manHours: trimmed(raw.manHours),
    specialInstructions: trimmed(raw.specialInstructions)
  };
}

function findRecordByType(type, recordId) {
  return recordsForType(type).find((item) => String(item.id) === String(recordId)) || null;
}

async function refreshWorkspaceRecord(view, type, recordId, tab) {
  if (tab) {
    state.expandedWorkspaces[view] = { id: recordId, tab };
  }
  await loadApiData();
  const updated = findRecordByType(type, recordId);
  if (!updated) return;
  if (state.activeDrawerType === type && workspaceDrawerMode(view) === "expanded") {
    openDrawer(type, updated);
  }
}

function clientAssessmentServiceSuggestion(record) {
  return record.qaServiceType || record.originalServiceType || "";
}

function clientAssessmentFrequencyContext(record) {
  return record.frequencyLabel || record.frequency || record.requestedFrequencyLabel || record.requestedFrequency || "";
}

function clientAssessmentSetupBody(record) {
  const serviceType = clientAssessmentServiceSuggestion(record);
  const frequencyContext = clientAssessmentFrequencyContext(record);
  const serviceOptions = setupServiceTypeOptions();
  const currentAddress = compactMeta([record.address, record.area, record.postcode]) || "No current address is stored for this client yet.";
  return `
    <div class="modal-col-main assessment-setup-main">
      <section class="assessment-setup-hero">
        <div class="assessment-setup-client">
          <h3>New scoped work opportunity</h3>
          <div class="workspace-summary-grid">
            <div class="workspace-summary-row"><span>Client</span><strong>${escapeHtml(record.name || "")}</strong></div>
            <div class="workspace-summary-row"><span>Phone</span><strong>${escapeHtml(record.phone || "Not available")}</strong></div>
            <div class="workspace-summary-row"><span>Email</span><strong>${escapeHtml(record.email || "Not available")}</strong></div>
            <div class="workspace-summary-row"><span>Linked client ID</span><strong>#${escapeHtml(record.id || "")}</strong></div>
          </div>
        </div>
        <input type="hidden" name="clientId" value="${escapeHtml(record.id)}">
        <div class="workspace-edit-grid assessment-identity-grid">
          ${renderEditableInput("Assessment title / work label", '<input name="workLabel" data-assessment-work-label placeholder="e.g. After-builders clean - 22 Front Street">', "field-span-2")}
          ${renderEditableInput("Reason for opening this assessment", renderEditableSelect({ name: "assessmentReason", groupKey: null, currentValue: "existing_client_extra", staticOptions: assessmentReasonOptions }), "")}
          ${renderEditableInput("Service type", renderEditableSelect({ name: "serviceType", groupKey: null, currentValue: serviceType, staticOptions: serviceOptions, allowOtherOverride: false }), "")}
          ${renderEditableInput("Frequency", renderEditableSelect({ name: "frequency", groupKey: "frequency", currentValue: "one_off" }), "")}
        </div>
        <p class="record-sub">Current cleaning plan frequency is ${escapeHtml(frequencyContext || "not set")} and is shown here as context only.</p>
      </section>

      <section class="assessment-setup-section assessment-setup-card">
        <h3>Property / address</h3>
        <div class="workspace-edit-grid">
          ${renderEditableInput("Property setup", `
            <select name="propertyMode" data-assessment-property-mode>
              <option value="existing_home" selected>Use existing client/home address</option>
              <option value="another_address">Use another address for this client</option>
              <option value="unknown_address">Address not known yet</option>
            </select>
          `)}
          ${renderEditableInput("Property label", '<input name="propertyLabel" data-assessment-property-label placeholder="e.g. Holiday let, Flat 2, Annex">')}
        </div>
        <div class="assessment-mode-panel assessment-mode-panel-box" data-assessment-mode-panel="existing_home">
          <div class="workspace-summary-grid">
            <div class="workspace-summary-row"><span>Using current address</span><strong>${escapeHtml(currentAddress)}</strong></div>
          </div>
        </div>
        <div class="assessment-mode-panel assessment-mode-panel-box" data-assessment-mode-panel="another_address" hidden>
          <div class="workspace-edit-grid">
            ${renderEditableInput("Area", `<input name="area" value="${escapeHtml(record.area || "")}" placeholder="Area">`)}
            ${renderEditableInput("Postcode", `<input name="postcode" value="${escapeHtml(record.postcode || "")}" placeholder="Postcode">`)}
            ${renderEditableInput("Property type", renderEditableSelect({ name: "propertyType", groupKey: null, currentValue: "", staticOptions: leadStaticOptions.propertyType }), "")}
            ${renderEditableInput("Address", '<textarea name="address" rows="3" placeholder="Property address"></textarea>', "field-span-2")}
          </div>
        </div>
        <div class="assessment-mode-panel assessment-mode-panel-box" data-assessment-mode-panel="unknown_address" hidden>
          <div class="workspace-edit-grid">
            ${renderEditableInput("Area", `<input name="area" value="${escapeHtml(record.area || "")}" placeholder="Area if known">`)}
            <div class="workspace-placeholder muted field-span-2"><p>Address can stay blank for now. The new Assessment will be created with enough context to continue scoping the work.</p></div>
          </div>
        </div>
      </section>

      <section class="assessment-setup-section assessment-setup-card">
        <h3>Initial scope</h3>
        <div class="workspace-edit-grid">
          ${renderEditableInput("Initial scope notes", '<textarea name="initialNotes" rows="5" placeholder="Initial scope, customer request, commercial context, or anything admin should see first."></textarea>', "field-span-2")}
        </div>
      </section>
    </div>
    <aside class="modal-col-side assessment-setup-side">
      <section class="assessment-setup-section assessment-setup-card">
        <h3>Prefill options</h3>
        <div class="checkbox-stack">
          <label><input type="checkbox" name="prefillContact" checked> Pull contact details</label>
          <label><input type="checkbox" name="prefillHomeContext" checked> Pull existing address/home context</label>
          <label><input type="checkbox" name="prefillAccessParking" checked> Pull access/parking notes</label>
          <label><input type="checkbox" name="prefillPetsProducts" checked> Pull pets/product preferences</label>
          <label><input type="checkbox" name="prefillPreviousAssessmentNotes"> Pull previous assessment notes</label>
          <label><input type="checkbox" name="prefillCleaningPlanNotes"> Pull cleaning plan notes</label>
        </div>
      </section>
      <section class="assessment-setup-section assessment-setup-card">
        <h3>Current context</h3>
        <div class="workspace-summary-grid">
          <div class="workspace-summary-row"><span>Main service</span><strong>${escapeHtml(record.qaServiceLabel || record.originalServiceLabel || "Not set")}</strong></div>
          <div class="workspace-summary-row"><span>Current frequency</span><strong>${escapeHtml(frequencyContext || "Not set")}</strong></div>
          <div class="workspace-summary-row"><span>Address</span><strong>${escapeHtml(currentAddress)}</strong></div>
        </div>
      </section>
      <section class="assessment-setup-section assessment-setup-card">
        <h3>What happens next</h3>
        <div class="workspace-placeholder muted">
          <p>Create the Assessment first, then move into Details, Quote Assist, Quote Builder, and the linked Quote flow from the global Assessments queue.</p>
        </div>
      </section>
    </aside>
  `;
}

function updateAssessmentSetupMode() {
  const form = document.getElementById("assessment-setup-form");
  if (!form) return;
  const selected = form.querySelector('[name="propertyMode"]')?.value || "existing_home";
  form.querySelectorAll("[data-assessment-mode-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.assessmentModePanel !== selected;
  });
}

function suggestAssessmentWorkLabel(form) {
  if (!form) return;
  const workLabelInput = form.querySelector('[name="workLabel"]');
  if (!workLabelInput || workLabelInput.dataset.userEdited === "true") return;
  const serviceValue = form.querySelector('[name="serviceType"]')?.value || "";
  const serviceLabel = setupServiceTypeOptions().find((option) => option.value === serviceValue)?.label
    || optionLabel("service_type", serviceValue)
    || serviceValue;
  const propertyLabel = form.querySelector('[name="propertyLabel"]')?.value?.trim() || "";
  const propertyMode = form.querySelector('[name="propertyMode"]')?.value || "existing_home";
  const address = propertyMode === "another_address"
    ? (form.querySelector('[name="address"]')?.value?.trim() || form.querySelector('[name="area"]')?.value?.trim() || "")
    : propertyMode === "unknown_address"
      ? (propertyLabel || "Address TBC")
      : (form.dataset.clientAddress || "");
  workLabelInput.value = [serviceLabel, propertyLabel || address].filter(Boolean).join(" - ");
}

function openAssessmentSetupModal(clientId) {
  const client = findRecordByType("client", clientId);
  if (!client) throw new Error("Client & Home record not found.");
  state.assessmentSetupClientId = client.id;
  const modal = document.getElementById("assessment-setup-modal");
  const body = document.getElementById("assessment-setup-body");
  const status = document.getElementById("assessment-setup-status");
  if (!modal || !body) throw new Error("Assessment setup modal is not available.");
  body.innerHTML = clientAssessmentSetupBody(client);
  const form = document.getElementById("assessment-setup-form");
  if (form) {
    form.dataset.clientAddress = compactMeta([client.address, client.area, client.postcode]) || "";
  }
  if (status) {
    status.textContent = "";
    status.className = "status";
  }
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  updateAssessmentSetupMode();
  suggestAssessmentWorkLabel(form);
}

function closeAssessmentSetupModal() {
  state.assessmentSetupClientId = null;
  const modal = document.getElementById("assessment-setup-modal");
  const body = document.getElementById("assessment-setup-body");
  const status = document.getElementById("assessment-setup-status");
  if (body) body.innerHTML = "";
  if (status) {
    status.textContent = "";
    status.className = "status";
  }
  if (modal) modal.hidden = true;
  document.body.style.overflow = "";
}

async function createAssessmentFromClient(payload) {
  const result = await apiPost("/api/assessment-quotes", {
    action: "create_from_client",
    ...payload
  });
  await loadApiData();
  const created = findRecordByType("assessment", result.id || result.assessmentQuoteId);
  if (!created) return result;
  setView("assessments");
  state.expandedWorkspaces.assessments = { id: created.id, tab: "details" };
  state.workspaceDrawerMode.assessments = "collapsed";
  rememberWorkspaceDrawerRecord("assessment", created);
  renderAll();
  return result;
}

async function submitAssessmentSetup(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const raw = Object.fromEntries(new FormData(form).entries());
  const selectedReason = assessmentReasonOptions.find((option) => option.value === raw.assessmentReason);
  const payload = {
    clientId: raw.clientId || state.assessmentSetupClientId,
    propertyMode: raw.propertyMode || "existing_home",
    propertyLabel: raw.propertyLabel || "",
    area: raw.area || "",
    address: raw.address || "",
    postcode: raw.postcode || "",
    propertyType: raw.propertyType || "",
    assessmentReason: raw.assessmentReason || "existing_client_extra",
    assessmentReasonLabel: selectedReason?.label || raw.assessmentReason || "",
    serviceType: raw.serviceType || "",
    frequency: raw.frequency || "one_off",
    workLabel: raw.workLabel || "",
    initialNotes: raw.initialNotes || "",
    prefill: {
      contact: form.querySelector('[name="prefillContact"]')?.checked ?? true,
      homeContext: form.querySelector('[name="prefillHomeContext"]')?.checked ?? true,
      accessParking: form.querySelector('[name="prefillAccessParking"]')?.checked ?? true,
      petsProducts: form.querySelector('[name="prefillPetsProducts"]')?.checked ?? true,
      previousAssessmentNotes: form.querySelector('[name="prefillPreviousAssessmentNotes"]')?.checked ?? false,
      cleaningPlanNotes: form.querySelector('[name="prefillCleaningPlanNotes"]')?.checked ?? false
    }
  };

  const status = document.getElementById("assessment-setup-status");
  if (status) {
    status.textContent = "Creating Assessment...";
    status.className = "status";
  }

  try {
    await createAssessmentFromClient(payload);
    closeAssessmentSetupModal();
  } catch (err) {
    if (status) {
      status.textContent = err.message;
      status.className = "status error";
    }
  }
}

function applyAssessmentLocalUpdate(recordId, payload) {
  const record = data.assessments.find((item) => String(item.id) === String(recordId));
  if (!record) return;
  Object.assign(record, {
    customerName: payload.customerName,
    phone: payload.phone,
    email: payload.email,
    area: payload.area,
    postcode: payload.postcode,
    serviceType: payload.serviceType,
    frequency: payload.frequency,
    propertyType: payload.propertyType,
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    propertyCondition: payload.propertyCondition,
    pets: payload.pets,
    parking: payload.parking,
    priorities: payload.priorities,
    productPreferences: payload.productPreferences,
    notes: payload.notes,
    assessmentNotes: payload.assessmentNotes,
    quoteNotes: payload.quoteNotes,
    serviceLabel: payload.serviceType ? optionLabel("service_type", payload.serviceType) : record.serviceLabel,
    frequencyLabel: payload.frequency ? optionLabel("frequency", payload.frequency) : record.frequencyLabel,
    updatedAt: new Date().toISOString()
  });
}

function applyClientLocalUpdate(recordId, action, payload) {
  const record = data.clients.find((item) => String(item.id) === String(recordId));
  if (!record) return;

  if (action === "update_contact_access") {
    Object.assign(record, {
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      preferredContact: payload.preferredContact,
      accessMethod: payload.accessMethod,
      accessOther: payload.accessOther,
      accessNotes: payload.accessNotes,
      parkingNotes: payload.parkingNotes,
      petType: payload.petType,
      petOther: payload.petOther,
      petNotes: payload.petNotes,
      productPreference: payload.productPreference,
      productOther: payload.productOther,
      surfaceNotes: payload.surfaceNotes,
      notes: payload.notes,
      preferredContactLabel: payload.preferredContact ? optionLabel("preferred_contact", payload.preferredContact) : record.preferredContactLabel,
      accessLabel: payload.accessMethod ? payload.accessMethod === "other" && payload.accessOther ? `${optionLabel("access_method", payload.accessMethod)}: ${payload.accessOther}` : optionLabel("access_method", payload.accessMethod) : record.accessLabel,
      petLabel: payload.petType ? payload.petType === "other" && payload.petOther ? `${optionLabel("pet_type", payload.petType)}: ${payload.petOther}` : optionLabel("pet_type", payload.petType) : record.petLabel,
      productLabel: payload.productPreference ? payload.productPreference === "other" && payload.productOther ? `${optionLabel("product_preference", payload.productPreference)}: ${payload.productOther}` : optionLabel("product_preference", payload.productPreference) : record.productLabel,
      updatedAt: new Date().toISOString()
    });
  } else if (action === "update_home_details") {
    Object.assign(record, {
      area: payload.area,
      address: payload.address,
      updatedAt: new Date().toISOString()
    });
  } else if (action === "update_cleaning_plan") {
    Object.assign(record, {
      frequency: payload.frequency,
      manHours: payload.manHours,
      specialInstructions: payload.specialInstructions,
      frequencyLabel: payload.frequency ? optionLabel("frequency", payload.frequency) : record.frequencyLabel,
      updatedAt: new Date().toISOString()
    });
  }
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

function renderDrawerTitlebar({ eyebrow, title, subtitle, detailLine, compactTitle, showDrawerToggle = false }) {
  return `
    <div class="drawer-titlebar">
      <div class="drawer-titlebar-main">
        <div class="drawer-title-copy">
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h2>${escapeHtml(title)}</h2>
          <p>${escapeHtml(subtitle || "")}</p>
          ${detailLine ? `<p class="drawer-title-detail">${escapeHtml(detailLine)}</p>` : ""}
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

function renderAssessmentCloseout(record) {
  if (isHistoryAssessment(record)) return "";

  return `
    <section class="drawer-section">
      <h3>Close Assessment</h3>
      <form class="lead-action-form compact" data-assessment-close-form>
        <label>
          Reason
          <select name="closeReason" required>
            ${assessmentCloseReasons
              .map((reason) => `<option value="${escapeHtml(reason.value)}">${escapeHtml(reason.label)}</option>`)
              .join("")}
          </select>
        </label>
        <label>
          Note (optional)
          <textarea name="closeNote" rows="3" placeholder="Optional internal note about why this Assessment is not proceeding."></textarea>
        </label>
        <div class="drawer-actions">
          <button class="ghost" type="submit">Mark not proceeding</button>
        </div>
      </form>
      <p class="record-sub" data-assessment-close-status></p>
    </section>
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
    setLeadActionStatus("Assessment is not available in the current D1 data.");
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
      setLeadActionStatus("Creating Assessment...");
      const result = await apiPost(`/api/leads/${record.id}/assessment-quote`, {});
      await loadApiData();
      const assessmentQuoteId = result.assessmentQuote?.id || result.id;
      if (openAssessmentQuoteFromLead(assessmentQuoteId)) return;
      setLeadActionStatus("Assessment was created, but it was not returned by the current data load.");
    } catch (err) {
      setLeadActionStatus(`Could not create Assessment. ${err.message}`);
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

async function refreshQuoteLinkedViews(assessmentQuoteId, clientId = null) {
  await loadApiData();

  if (state.activeDrawerType === "assessment") {
    const updatedAssessment = data.assessments.find((assessment) => String(assessment.id) === String(assessmentQuoteId));
    if (updatedAssessment) openDrawer("assessment", updatedAssessment);
  }

  const resolvedClientId = clientId || data.clients.find((client) => String(client.assessmentQuoteId) === String(assessmentQuoteId))?.id;
  if (state.activeDrawerType === "client" && resolvedClientId) {
    const updatedClient = data.clients.find((client) => String(client.id) === String(resolvedClientId));
    if (updatedClient) openDrawer("client", updatedClient);
  }
}

function setAssessmentActionStatus(message) {
  const status = drawer.querySelector("[data-assessment-action-status]");
  if (status) status.textContent = message;
}

function setQuoteActionStatus(assessmentQuoteId, message) {
  document.querySelectorAll("[data-quote-action-status]").forEach((node) => {
    if (String(node.dataset.quoteActionStatus) === String(assessmentQuoteId)) {
      node.textContent = message;
    }
  });
}

function setAssessmentConversionStatus(message) {
  const status = drawer.querySelector("[data-assessment-conversion-status]");
  if (status) status.textContent = message;
}

function setAssessmentCloseStatus(message) {
  const status = drawer.querySelector("[data-assessment-close-status]");
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

  drawer.querySelector("[data-convert-assessment-quote]")?.addEventListener("click", async () => {
    try {
      setAssessmentConversionStatus("Converting to Client & Home...");
      const result = await apiPost(`/api/assessment-quotes/${record.id}/convert`, { convertedBy: "admin" });
      await loadApiData();
      if (openClientFromAssessment(result.id)) return;
      setAssessmentConversionStatus("Converted, but the Client & Home record was not returned by the current data load.");
    } catch (err) {
      setAssessmentConversionStatus(`Could not convert Assessment. ${err.message}`);
    }
  });

  drawer.querySelector("[data-open-qa-client]")?.addEventListener("click", (event) => {
    openClientFromAssessment(event.currentTarget.dataset.openQaClient);
  });

  drawer.querySelector("[data-assessment-close-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const lostReason = String(formData.get("closeReason") || "");
    const closeNote = String(formData.get("closeNote") || "").trim();

    try {
      setAssessmentCloseStatus("Marking Assessment as not proceeding...");
      if (state.expandedWorkspaces.assessments && String(state.expandedWorkspaces.assessments.id) === String(record.id)) {
        state.expandedWorkspaces.assessments = null;
      }
      await apiPatch(`/api/assessment-quotes/${record.id}`, {
        status: "not_proceeding",
        lostReason,
        closeNote
      });
      await refreshAssessmentDrawer(record.id);
      setAssessmentCloseStatus("Marked as not proceeding.");
    } catch (err) {
      setAssessmentCloseStatus(`Could not close Assessment. ${err.message}`);
    }
  });
}

function resetDrawer() {
  if (isWorkspaceFirstView()) {
    renderWorkspaceDrawerClosedState(state.view);
    return;
  }
  state.activeDrawerType = null;
  leadDetailsEditState = null;
  if (drawerScrollHandler) {
    drawer.querySelector(".drawer-body")?.removeEventListener("scroll", drawerScrollHandler);
    drawerScrollHandler = null;
  }
  drawer.innerHTML = isWorkspaceFirstView()
    ? renderWorkspaceDrawerRail()
    : `
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
  rememberWorkspaceDrawerRecord(type, record);
  if (isWorkspaceFirstView() && type === recordTypeForView()) {
    state.workspaceDrawerMode[state.view] = "expanded";
  }
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
      title: assessmentTitle(record),
      subtitle: compactMeta([assessmentPropertyContext(record), record.serviceLabel || record.serviceType, record.quoteStageLabel || record.quoteStage]),
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
            ["Source", assessmentSourceDisplay(record)],
            ["Purpose", assessmentPurposeDisplay(record)],
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
            ["Linked client ID", record.clientId || record.convertedClientId],
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
            ["Assessment internal notes", record.qaNotes],
            ["Assessment notes", record.qaAssessmentNotes],
            ["Quote notes", record.qaQuoteNotes],
            ["Original lead summary", record.originalLeadNote]
          ]
        ],
        [
          "Original lead",
          [
            ["Original lead ID", clientOriginalLeadId(record)],
            ["Assessment ID", record.assessmentQuoteId],
            ["Assessment stage", record.assessmentQuoteStage],
            ["Assessment accepted", formatDateTime(record.qaQuoteAcceptedAt)],
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
    ? "Assessment"
    : type === "client"
      ? "Client"
      : type.charAt(0).toUpperCase() + type.slice(1);
  const nextAction = type === "task"
    ? record.notes || "Review task and update status"
    : "";
  const detailSubtitle =
    type === "assessment"
      ? compactMeta([record.serviceLabel || record.serviceType, record.area, record.postcode])
      : type === "client"
        ? compactMeta([clientServiceLabel(record), record.area, record.address])
        : template.subtitle;
  const detailLine =
    type === "assessment" || type === "client"
      ? compactMeta([
          record.quoteStageLabel || record.quoteStage || record.statusLabel || record.status,
          record.accountingQuote?.displayReference
        ])
      : "";
  const titlebar = renderDrawerTitlebar({
    eyebrow: type === "assessment" ? "Assessment" : compactType,
    title: template.title,
    subtitle: detailSubtitle || template.subtitle,
    detailLine,
    compactTitle: compactDrawerLabel([
      template.title,
      compactType,
      record.quoteStageLabel || record.quoteStage || record.statusLabel || record.status || template.subtitle
    ]),
    showDrawerToggle: false
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
      ${type === "assessment" ? renderAssessmentCloseout(record) : ""}
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
    host.innerHTML = emptyState("No lead history yet", "Rejected, unsuitable, or moved-to-Assessment leads will remain visible here for traceability.");
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
  const expanded = isWorkspaceExpanded(view, record);
  const row = el("article", `record-row workspace-row ${expanded ? "is-expanded" : ""}`.trim());
  row.innerHTML = `
    <button class="record-open" type="button">
      ${cells.map((cell) => `<div>${cell}</div>`).join("")}
    </button>
    <button class="ghost row-expand-button" type="button" aria-expanded="${expanded ? "true" : "false"}">
      ${expanded ? "Collapse" : "Expand"}
    </button>
  `;
  row.querySelector(".record-open").addEventListener("click", () => selectWorkspaceDrawerContext(view, type, record));
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

function workspaceDrawerEyebrow(view = state.view) {
  return view === "clients" ? "Client & Home" : "Assessment";
}

function renderWorkspaceEmptyDrawerShell(view = state.view) {
  const titlebar = renderDrawerTitlebar({
    eyebrow: workspaceDrawerEyebrow(view),
    title: "Detail drawer",
    subtitle: "Use the selected record when you want the full detail panel.",
    compactTitle: "Detail drawer"
  });
  const body = `
    <section class="drawer-section drawer-shell-empty">
      <p>Pick a row, then open the drawer when you need the full record view.</p>
    </section>
  `;
  return renderDrawerFrame({
    titlebar,
    body,
    frameClass: "workspace-record-drawer"
  });
}

function renderExpandableWorkspace({ view, record, tabs, actions = "", content }) {
  return `
      <section class="expandable-workspace" data-workspace="${escapeHtml(view)}" data-workspace-id="${escapeHtml(record.id)}">
        <div class="workspace-shell">
          ${workspaceTabs(view, record.id, tabs)}
          ${actions ? `<div class="workspace-toolbar">${actions}</div>` : ""}
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

function assistHourRange(assist, prefix) {
  const min = assist[`${prefix}Min`] || assist[`${prefix}_min`] || assist[`${prefix}`];
  const max = assist[`${prefix}Max`] || assist[`${prefix}_max`] || assist[`${prefix}`];
  if (!min && !max) return "Not Specified";
  if (min && max) return `${min}-${max}h`;
  return `${min || max}h`;
}

function updateBuilderTotalsUI(assessmentId) {
  const builder = state.quoteBuilder[assessmentId];
  if (!builder) return;
  const selectedModules = builder.modules.filter(m => m.selected);
  const oneOffTotal = selectedModules.filter(m => !m.is_recurring).reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const recurringTotal = selectedModules.filter(m => m.is_recurring).reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const selectedCount = selectedModules.length;

  const oneOffEl = document.getElementById(`builder-oneoff-total-${assessmentId}`);
  if (oneOffEl) oneOffEl.textContent = `£${oneOffTotal.toFixed(2)}`;

  const recurringEl = document.getElementById(`builder-recurring-total-${assessmentId}`);
  if (recurringEl) recurringEl.textContent = `£${recurringTotal.toFixed(2)}`;

  const countEl = document.getElementById(`builder-selected-count-${assessmentId}`);
  if (countEl) countEl.textContent = selectedCount;
}

function setBuilderStatus(assessmentId, message) {
  const el = document.getElementById(`builder-status-msg-${assessmentId}`);
  if (el) el.textContent = message;
}

async function handleGenerateQuoteFromBuilder(assessmentId) {
  try {
    setBuilderStatus(assessmentId, "Locating or creating draft quote...");
    
    const assessment = data.assessments.find(a => String(a.id) === String(assessmentId));
    if (!assessment) throw new Error("Assessment not found");

    let draftQuote = draftQuoteForAssessment(assessment);
    if (!draftQuote) {
      setBuilderStatus(assessmentId, "Creating new draft quote version...");
      const response = await apiPost("/api/quotes", { assessmentQuoteId: assessmentId });
      draftQuote = response.quote;
      if (!draftQuote) {
        throw new Error("Failed to create draft quote record");
      }
    }

    const builder = state.quoteBuilder[assessmentId];
    if (!builder) throw new Error("No builder state found");

    const selectedModules = builder.modules.filter(m => m.selected);
    
    // 1. scopeOfWork
    let scopeOfWork = "";
    const service = (assessment.serviceLabel || assessment.serviceType || "domestic cleaning").toLowerCase();
    const frequency = (assessment.frequencyLabel || assessment.frequency || "").toLowerCase();
    const area = assessment.area || "";

    if (service.includes("deep") || service.includes("tenancy") || service.includes("end of tenancy")) {
      scopeOfWork = `One-off deep cleaning service for the property${area ? " in " + area : ""}, based on the details provided during enquiry.`;
    } else if (service.includes("regular") || frequency.includes("weekly") || frequency.includes("fortnightly") || frequency.includes("monthly") || frequency.includes("regular")) {
      scopeOfWork = `Initial reset clean followed by regular domestic cleaning visits for the property${area ? " in " + area : ""}, based on the agreed cleaning scope.`;
    } else if (service.includes("one-off") || service.includes("one off")) {
      scopeOfWork = `One-off domestic cleaning visit for the property${area ? " in " + area : ""}, based on the details provided during enquiry.`;
    } else {
      scopeOfWork = `Domestic cleaning service for the property${area ? " in " + area : ""}, based on the details provided during enquiry.`;
    }

    // 2. includedItems
    const includedItems = selectedModules.map(m => `• ${m.name}`).join("\n");
    // 3. assumptions
    const assumptions = [
      "Work is based on normal access and parking availability.",
      "Agreed scope of work as detailed in the included items list.",
      "Pricing assumes no major property condition changes since the initial assessment."
    ].join("\n");
    // 4. priceLines
    const priceLines = JSON.stringify(selectedModules.map(m => ({
      description: m.name,
      price: Math.round(Number(m.amount || 0) * 100)
    })));
    // 5. totalPrice
    const oneOffTotalPence = Math.round(selectedModules.filter(m => !m.is_recurring).reduce((sum, m) => sum + Number(m.amount || 0), 0) * 100);
    // 6. recurringPrice
    const recurringTotalPence = Math.round(selectedModules.filter(m => m.is_recurring).reduce((sum, m) => sum + Number(m.amount || 0), 0) * 100);
    
    const pricingNotes = `Generated from Assessment Quote Builder. Selected modules count: ${selectedModules.length}.`;
    const clientNotes = "This quote is based on the information provided and may be adjusted if the agreed scope changes.";

    setBuilderStatus(assessmentId, "Saving work modules content to draft quote...");

    await apiPatch(`/api/quotes/${draftQuote.id}`, {
      scopeOfWork,
      includedItems,
      excludedItems: "",
      assumptions,
      priceLines,
      totalPrice: oneOffTotalPence,
      recurringPrice: recurringTotalPence,
      pricingNotes,
      clientNotes
    });

    setBuilderStatus(assessmentId, "Refreshing view...");
    await refreshQuoteLinkedViews(assessmentId, draftQuote.clientId || null);
    
    setWorkspaceTab("assessments", assessmentId, "quotes");
    
    setTimeout(() => {
      setQuoteActionStatus(assessmentId, "Draft quote generated/updated successfully from Quote Builder.");
    }, 100);
  } catch (err) {
    setBuilderStatus(assessmentId, `Error generating quote: ${err.message}`);
  }
}

function renderAssessmentQuoteBuilder(record) {
  if (!state.quoteBuilder) {
    state.quoteBuilder = {};
  }
  if (!state.quoteBuilder[record.id]) {
    const service = record.serviceType || "regular_cleaning";
    const assist = record.quoteAssist || {};
    const rate = 30.00;
    const modules = [];

    if (service === "regular_cleaning") {
      const deepCleanHours = assist.estimatedFirstCleanHoursMin || 4;
      modules.push({
        id: "initial_deep_clean",
        name: "Initial clean / reset visit",
        type: "initial_deep_clean",
        client_description: "Initial deep clean to reset the home to standard cleaning condition.",
        internal_note: "Derived from first clean hours estimate.",
        hours: deepCleanHours,
        rate: rate,
        amount: deepCleanHours * rate,
        is_recurring: false,
        selected: true
      });

      const regularCleanHours = assist.estimatedRecurringHoursMin || 3;
      modules.push({
        id: "regular_clean",
        name: "Regular recurring clean",
        type: "regular_clean",
        client_description: "Standard regular cleaning visit matching the Assessment specification.",
        internal_note: "Standard recurring cleaning plan.",
        hours: regularCleanHours,
        rate: rate,
        amount: regularCleanHours * rate,
        is_recurring: true,
        selected: true
      });

      modules.push({
        id: "extra_task",
        name: "Optional extra task",
        type: "extra_task",
        client_description: "Optional extra task (e.g. oven clean, inside windows, fridge reset).",
        internal_note: "",
        hours: 1,
        rate: rate,
        amount: rate,
        is_recurring: false,
        selected: false
      });
    } else if (service === "deep_cleaning" || service === "end_of_tenancy") {
      const deepCleanHours = assist.estimatedFirstCleanHoursMin || 6;
      modules.push({
        id: "one_off_deep",
        name: "One-off deep clean",
        type: "initial_deep_clean",
        client_description: service === "end_of_tenancy" ? "End of tenancy move out deep cleaning." : "One-off deep clean to standard conditions.",
        internal_note: "",
        hours: deepCleanHours,
        rate: rate,
        amount: deepCleanHours * rate,
        is_recurring: false,
        selected: true
      });

      modules.push({
        id: "extra_task",
        name: "Optional extra task",
        type: "extra_task",
        client_description: "Optional extra task (e.g. oven clean, inside windows, fridge reset).",
        internal_note: "",
        hours: 1,
        rate: rate,
        amount: rate,
        is_recurring: false,
        selected: false
      });
    } else {
      // one_off_cleaning
      const hours = assist.estimatedFirstCleanHoursMin || 4;
      modules.push({
        id: "one_off_clean",
        name: "One-off clean",
        type: "one_off_clean",
        client_description: "One-off standard cleaning service.",
        internal_note: "",
        hours: hours,
        rate: rate,
        amount: hours * rate,
        is_recurring: false,
        selected: true
      });

      modules.push({
        id: "extra_task",
        name: "Optional extra task",
        type: "extra_task",
        client_description: "Optional extra task (e.g. oven clean, inside windows, fridge reset).",
        internal_note: "",
        hours: 1,
        rate: rate,
        amount: rate,
        is_recurring: false,
        selected: false
      });
    }

    // Common optional Travel/Access module
    modules.push({
      id: "travel_or_access",
      name: "Travel or travel time",
      type: "travel_or_access",
      client_description: "Travel expenses or travel time allowance.",
      internal_note: "",
      hours: 0,
      rate: 0,
      amount: 20.00,
      is_recurring: false,
      selected: false
    });

    state.quoteBuilder[record.id] = {
      modules
    };
  }

  const builder = state.quoteBuilder[record.id];
  const assist = record.quoteAssist || {};
  
  // Calculate Totals
  const selectedModules = builder.modules.filter(m => m.selected);
  const oneOffTotal = selectedModules.filter(m => !m.is_recurring).reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const recurringTotal = selectedModules.filter(m => m.is_recurring).reduce((sum, m) => sum + Number(m.amount || 0), 0);
  const selectedCount = selectedModules.length;

  return `
    <div class="quote-builder-workspace">
      <!-- 1. Source Context Panel -->
      <div class="builder-context-grid">
        <div class="builder-context-card font-small">
          <h4 style="margin:0 0 8px; font-size:0.9rem; color:var(--forest); border-bottom:1px solid var(--line); padding-bottom:4px;">Assessment Source Context</h4>
          <div class="context-details">
            <div><strong>Client:</strong> ${escapeHtml(record.customerName || record.client || "")}</div>
            <div><strong>Location:</strong> ${escapeHtml(compactMeta([record.area, record.postcode])) || "Not Specified"}</div>
            <div><strong>Service Type:</strong> ${escapeHtml(record.serviceLabel || record.serviceType || "")}</div>
            <div><strong>Frequency:</strong> ${escapeHtml(record.frequencyLabel || record.frequency || "")}</div>
            <div><strong>Property Details:</strong> ${escapeHtml(compactMeta([record.propertyType, record.bedrooms ? `${record.bedrooms} Bedrooms` : "", record.bathrooms ? `${record.bathrooms} Bathrooms` : ""]))}</div>
            <div><strong>Parking:</strong> ${escapeHtml(record.parking || "")}</div>
            <div><strong>Pets:</strong> ${escapeHtml(record.pets || "")}</div>
            <div><strong>Assessment Notes:</strong> <span class="notes-text">${escapeHtml(record.assessmentNotes || "")}</span></div>
            <div><strong>Assessment / Quote Notes:</strong> <span class="notes-text">${escapeHtml(record.quoteNotes || "")}</span></div>
          </div>
        </div>
        <div class="builder-context-card font-small">
          <h4 style="margin:0 0 8px; font-size:0.9rem; color:var(--forest); border-bottom:1px solid var(--line); padding-bottom:4px;">Quote Assist Recommendations</h4>
          ${assist.fitScore !== undefined ? `
            <div class="context-details">
              <div><strong>Suggested First Clean:</strong> ${escapeHtml(assistHourRange(assist, "estimatedFirstCleanHours"))}</div>
              <div><strong>Suggested Recurring:</strong> ${escapeHtml(assistHourRange(assist, "estimatedRecurringHours"))}</div>
              <div><strong>Suggested Price Range:</strong> ${escapeHtml(assist.suggestedPriceLabel || "")}</div>
              <div><strong>Minimum Recommended:</strong> ${escapeHtml(assist.minimumRecommendedPriceLabel || "")}</div>
              <div><strong>Confidence Level:</strong> ${escapeHtml(assist.confidence || "")}</div>
              <div><strong>Price Shopper Risk:</strong> ${escapeHtml(assist.priceShopperRisk || "")}</div>
              <div><strong>Travel Suitability:</strong> ${escapeHtml(assist.travelSuitability || "")}</div>
              <div><strong>Risk Flags:</strong> <span class="notes-text">${escapeHtml((assist.riskFlags || []).join("; "))}</span></div>
              <div><strong>Positive Flags:</strong> <span class="notes-text">${escapeHtml((assist.positiveFlags || []).join("; "))}</span></div>
            </div>
          ` : `<div class="placeholder-text text-muted">No Quote Assist recommendations available.</div>`}
        </div>
      </div>

      <!-- 2. Work Modules Workspace -->
      <div class="builder-modules-section">
        <h4 style="margin:0 0 10px; font-size:0.95rem; color:var(--ink);">Work Modules / Scope Items</h4>
        <div class="builder-modules-table-container">
          <table class="builder-modules-table">
            <thead>
              <tr>
                <th class="col-chk">Selected</th>
                <th class="col-mod-name">Module Name</th>
                <th class="col-desc">Client-Facing Description</th>
                <th class="col-num">Hours</th>
                <th class="col-num">Rate (£/h)</th>
                <th class="col-num">Amount (£)</th>
                <th class="col-recur">Recurring</th>
                <th class="col-del">Remove</th>
              </tr>
            </thead>
            <tbody data-builder-modules-body="${record.id}">
              ${builder.modules.map((mod, index) => {
                return `
                  <tr class="builder-module-row ${mod.selected ? "is-selected" : ""}" data-module-index="${index}">
                    <td class="col-chk text-center">
                      <input type="checkbox" class="mod-selected-chk" ${mod.selected ? "checked" : ""}>
                    </td>
                    <td class="col-mod-name">
                      <input type="text" class="mod-name-input input-clean" value="${escapeHtml(mod.name)}">
                    </td>
                    <td class="col-desc">
                      <textarea class="mod-desc-input input-clean" rows="1">${escapeHtml(mod.client_description || "")}</textarea>
                    </td>
                    <td class="col-num">
                      <input type="number" class="mod-hours-input input-clean text-right" step="0.25" min="0" value="${mod.hours || 0}">
                    </td>
                    <td class="col-num">
                      <input type="number" class="mod-rate-input input-clean text-right" step="0.5" min="0" value="${mod.rate || 0}">
                    </td>
                    <td class="col-num">
                      <input type="number" class="mod-amount-input input-clean text-right" step="0.01" min="0" value="${mod.amount || 0}">
                    </td>
                    <td class="col-recur text-center">
                      <select class="mod-recurring-sel select-clean">
                        <option value="false" ${!mod.is_recurring ? "selected" : ""}>No</option>
                        <option value="true" ${mod.is_recurring ? "selected" : ""}>Yes</option>
                      </select>
                    </td>
                    <td class="col-del text-center">
                      <button type="button" class="btn-module-delete font-large" title="Remove module">×</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
        <div class="builder-modules-actions">
          <button type="button" class="secondary" data-builder-add-custom="${record.id}">+ Add Custom Module</button>
        </div>
      </div>

      <!-- 3. Summary & Quote Generation Bar -->
      <div class="builder-summary-bar">
        <div class="summary-stats">
          <div class="stat-box">
            <span class="stat-label">One-off / Initial Total</span>
            <strong class="stat-value" id="builder-oneoff-total-${record.id}">£${oneOffTotal.toFixed(2)}</strong>
          </div>
          <div class="stat-box">
            <span class="stat-label">Recurring Visit Price</span>
            <strong class="stat-value" id="builder-recurring-total-${record.id}">£${recurringTotal.toFixed(2)}</strong>
          </div>
          <div class="stat-box">
            <span class="stat-label">Selected Modules</span>
            <span class="stat-value" id="builder-selected-count-${record.id}">${selectedCount}</span>
          </div>
        </div>
        <div class="summary-actions">
          <button type="button" class="primary" data-builder-generate-quote="${record.id}">Generate / Update Draft Quote</button>
        </div>
      </div>
      <p class="record-sub builder-status-message text-center" id="builder-status-msg-${record.id}"></p>
    </div>
  `;
}

function assessmentWorkspaceTabs() {
  return [
    { key: "overview", label: "Overview" },
    { key: "details", label: "Details" },
    { key: "quote-assist", label: "Quote Assist" },
    { key: "quote-builder", label: "Quote Builder" },
    { key: "quotes", label: "Quotes" },
    { key: "notes-tasks", label: "Notes / Tasks" }
  ];
}

function renderAssessmentWorkspaceTab(record, tab) {
  if (tab === "quote-builder") {
    return renderAssessmentQuoteBuilder(record);
  }

  if (tab === "details") {
    const isEditing = isEditingAssessmentDetails(record);
    const draft = isEditing ? assessmentDetailsEditState : assessmentDetailsDraft(record);
    const header = workspaceEditHeader({
      title: "Assessment details",
      helper: "These fields belong to this Assessment only. Saving here does not sync back to Leads or forward to Client & Home.",
      editing: isEditing,
      editLabel: "Edit details",
      editAction: `data-edit-assessment-details="${escapeHtml(record.id)}"`,
      cancelAction: "data-cancel-assessment-details"
    });

    if (isEditing) {
      return `
        <form data-assessment-details-form data-assessment-id="${escapeHtml(record.id)}">
          ${header}
          ${renderAssessmentEditableFields(draft)}
        </form>
      `;
    }

    return `
      ${header}
      ${detailRows([
        ["Customer / prospect", record.customerName || record.client],
        ["Phone", record.phone],
        ["Email", record.email],
        ["Area", record.area],
        ["Postcode", record.postcode],
        ["Service type", record.serviceLabel || record.serviceType],
        ["Frequency", record.frequencyLabel || record.frequency],
        ["Property type", leadValueLabel("propertyType", record.propertyType)],
        ["Bedrooms", record.bedrooms],
        ["Bathrooms", record.bathrooms],
        ["Reception rooms", record.receptionRooms],
        ["Kitchen size", record.kitchenSize],
        ["Property size", leadValueLabel("propertySize", record.propertySize)],
        ["Condition", leadValueLabel("propertyCondition", record.propertyCondition)],
        ["Pets", leadValueLabel("pets", record.pets)],
        ["Parking", leadValueLabel("parking", record.parking)],
        ["Priorities", record.priorities],
        ["Products", leadValueLabel("productPreferences", record.productPreferences)],
        ["Assessment notes", record.assessmentNotes],
        ["Quote notes", record.quoteNotes],
        ["Internal notes", record.notes]
      ])}
    `;
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
      : placeholderPanel("No Quote Assist result saved yet. Use the drawer action when this Assessment has enough detail.");
  }

  if (tab === "quotes") {
    const quotes = quotesForAssessment(record);
    const draftQuote = draftQuoteForAssessment(record);
    return `
      <div class="workspace-stack">
        <section>
          <h4>Linked quotes</h4>
          ${
            quotes.length
              ? `<div class="workspace-list compact">
                  ${quotes.map((quote) => renderQuoteRecordCard(quote, record.id)).join("")}
                </div>`
              : placeholderPanel("No linked accounting quote yet. Create Draft Quote when the commercial record is ready.")
          }
          <div class="drawer-actions">
            ${
              draftQuote
                ? `<button class="ghost" type="button" disabled aria-disabled="true">Draft quote linked</button>`
                : `<button class="primary" type="button" data-create-quote-for-assessment="${escapeHtml(record.id)}">${quotes.length ? "Create Revised Draft" : "Create Draft Quote"}</button>`
            }
          </div>
          <p class="record-sub" data-quote-action-status="${escapeHtml(record.id)}"></p>
        </section>
        <section>
          <div class="workspace-placeholder muted"><p>Use the linked quote cards to open the draft Quote Editor or Preview / Print the commercial document. This workspace keeps quote records visible and traceable alongside the Assessment.</p></div>
        </section>
      </div>
    `;
  }

  if (tab === "notes-tasks") {
    const notes = record.linkedLeadNotes || [];
    const tasks = linkedAssessmentTasks(record);
    return `
      <div class="workspace-stack">
        <section>
          <h4>Linked notes</h4>
          ${noteSummary(notes, "No linked notes yet for this Assessment.")}
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
    ["Assessment", assessmentTitle(record)],
    ["Customer", record.customerName || record.client],
    ["Property", assessmentPropertyContext(record)],
    ["Phone", record.phone],
    ["Email", record.email],
    ["Area / postcode", compactMeta([record.area, record.postcode])],
    ["Source", assessmentSourceDisplay(record)],
    ["Purpose", assessmentPurposeDisplay(record)],
    ["Service", record.serviceLabel || record.serviceType],
    ["Frequency", record.frequencyLabel || record.frequency],
    ["Status", record.statusLabel || record.status],
    ["Quote stage", record.quoteStageLabel || record.quoteStage],
    ["Linked lead", record.leadId ? `#${record.leadId}` : ""],
    ["Linked client", record.clientId ? `#${record.clientId}` : record.convertedClientId ? `#${record.convertedClientId}` : ""],
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
    tabs,
    actions: `
      <div class="drawer-actions compact workspace-toolbar-actions">
        <span class="record-sub">${escapeHtml(compactMeta([assessmentPropertyContext(record), assessmentSourceDisplay(record), assessmentPurposeDisplay(record), record.linkedClientName ? `Linked client: ${record.linkedClientName}` : ""]))}</span>
      </div>
    `,
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
    const isEditing = isEditingClientWorkspace(record, "contact-access");
    const draft = isEditing ? clientWorkspaceEditState : clientContactAccessDraft(record);
    const header = workspaceEditHeader({
      title: "Contact / Access",
      helper: "Updates stay on the Client & Home record only. They do not rewrite linked Lead or Assessment history.",
      editing: isEditing,
      editLabel: "Edit contact/access",
      editAction: `data-edit-client-workspace="${escapeHtml(record.id)}" data-client-workspace-tab="contact-access"`,
      cancelAction: "data-cancel-client-workspace"
    });

    if (isEditing) {
      return `
        <form data-client-contact-form data-client-id="${escapeHtml(record.id)}">
          ${header}
          ${renderClientContactAccessEditableFields(draft)}
        </form>
      `;
    }

    return `
      ${header}
      ${detailRows([
        ["Client name", record.name],
        ["Phone", record.phone],
        ["Email", record.email],
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
      ])}
    `;
  }

  if (tab === "home-details") {
    const isEditing = isEditingClientWorkspace(record, "home-details");
    const draft = isEditing ? clientWorkspaceEditState : clientHomeDetailsDraft(record);
    const hasHomeData = [record.propertyType, record.bedrooms, record.bathrooms, record.propertySize, record.propertyCondition].some(Boolean);
    const header = workspaceEditHeader({
      title: "Home details",
      helper: "Area and address are editable here. Property structure stays read-only until it has clear Client & Home ownership.",
      editing: isEditing,
      editLabel: "Edit home details",
      editAction: `data-edit-client-workspace="${escapeHtml(record.id)}" data-client-workspace-tab="home-details"`,
      cancelAction: "data-cancel-client-workspace"
    });
    if (!hasHomeData && !record.area && !record.address && !isEditing) {
      return `${header}${placeholderPanel("Home details module planned - this will hold property, rooms, surfaces, pets, products and access details.")}`;
    }
    if (isEditing) {
      return `
        <form data-client-home-form data-client-id="${escapeHtml(record.id)}">
          ${header}
          ${renderClientHomeEditableFields(draft, record)}
        </form>
      `;
    }
    return `
      ${header}
      ${detailRows([
        ["Area", record.area],
        ["Address", record.address],
        ["Postcode", record.postcode],
        ["Property type", leadValueLabel("propertyType", record.propertyType)],
        ["Bedrooms", record.bedrooms],
        ["Bathrooms", record.bathrooms],
        ["Reception rooms", record.receptionRooms],
        ["Kitchen size", record.kitchenSize],
        ["Property size", leadValueLabel("propertySize", record.propertySize)],
        ["Condition", leadValueLabel("propertyCondition", record.propertyCondition)]
      ])}
    `;
  }

  if (tab === "cleaning-plan") {
    const isEditing = isEditingClientWorkspace(record, "cleaning-plan");
    const draft = isEditing ? clientWorkspaceEditState : clientCleaningPlanDraft(record);
    const hasPlan = [clientFrequencyLabel(record), record.manHours, record.mainCleaner, record.helper, record.priorities].some(Boolean);
    const header = workspaceEditHeader({
      title: "Cleaning plan",
      helper: record.cleaningPlanId
        ? "This updates the active cleaning plan only. It does not sync back to Lead or Assessment."
        : "A live cleaning plan has not been created yet, so this section remains read-only for now.",
      editing: isEditing,
      editLabel: "Edit cleaning plan",
      editAction: record.cleaningPlanId ? `data-edit-client-workspace="${escapeHtml(record.id)}" data-client-workspace-tab="cleaning-plan"` : "",
      cancelAction: "data-cancel-client-workspace"
    });
    if (!hasPlan && !isEditing) {
      return `${header}${placeholderPanel("Cleaning plan module planned - confirmed after assessment and early live service setup.")}`;
    }
    if (isEditing) {
      return `
        <form data-client-plan-form data-client-id="${escapeHtml(record.id)}">
          ${header}
          ${renderClientCleaningPlanEditableFields(draft, record)}
        </form>
      `;
    }
    return `
      ${header}
      ${detailRows([
        ["Service", clientServiceLabel(record)],
        ["Frequency", clientFrequencyLabel(record)],
        ["Requested frequency", record.requestedFrequencyLabel || record.requestedFrequency],
        ["Preferred days", record.preferredDays],
        ["Man-hours", record.manHours],
        ["Special instructions", record.specialInstructions],
        ["Main cleaner", record.mainCleaner],
        ["Helper", record.helper],
        ["Priorities", record.priorities]
      ])}
    `;
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
    const quotes = quotesForClient(record);
    const invoices = (data.invoices || []).filter((invoice) => String(invoice.client || "").toLowerCase() === String(record.name || "").toLowerCase());
    return `
      <div class="workspace-stack">
        <section>
          <h4>Linked quotes</h4>
          ${
            quotes.length
              ? `<div class="workspace-list compact">
                  ${quotes.map((quote) => renderQuoteRecordCard(quote)).join("")}
                </div>`
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

  const linkedAssessments = assessmentsForClient(record);
  return `
    <div class="workspace-stack">
      ${workspaceSummaryRows([
        ["Client", record.name],
        ["Phone", record.phone],
        ["Email", record.email],
        ["Area / address", compactMeta([record.area, record.address])],
        ["Status", clientStatusDisplay(record)],
        ["Linked lead", clientOriginalLeadId(record) ? `#${clientOriginalLeadId(record)}` : ""],
        ["Primary Assessment", record.assessmentQuoteId ? `#${record.assessmentQuoteId}` : ""],
        ["Linked quote", record.accountingQuote?.displayReference],
        ["Converted", formatDateTime(record.convertedAt)]
      ])}
      <section>
        <h4>Linked Assessments</h4>
        ${listSummary(
          linkedAssessments,
          "Create a new Assessment when this client requests new scoped work, extra work, or a new quoteable piece of work.",
          (assessment) => `
            <article class="workspace-list-item">
              <strong>${escapeHtml(assessmentTitle(assessment))}</strong>
              <p>${escapeHtml(compactMeta([assessmentPropertyContext(assessment), assessmentPurposeDisplay(assessment), assessment.serviceLabel || assessment.serviceType]))}</p>
              <small>${escapeHtml(compactMeta([assessmentSourceDisplay(assessment), assessmentStatusDisplay(assessment), assessment.accountingQuote?.displayReference, formatDateTime(assessment.updatedAt)]))}</small>
            </article>
          `
        )}
      </section>
    </div>
  `;
}

function renderClientWorkspace(record) {
  const tabs = clientWorkspaceTabs();
  const activeTab = expandedWorkspaceState("clients")?.tab || tabs[0].key;
  return renderExpandableWorkspace({
    view: "clients",
    record,
    tabs,
    actions: `
      <div class="drawer-actions compact workspace-toolbar-actions">
        <button class="primary" type="button" data-create-assessment-from-client="${escapeHtml(record.id)}">+ New Assessment</button>
      </div>
    `,
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
    emptyTitle: "No active Assessments",
    emptyMessage: "Create one from a suitable lead or existing client when scoped work is worth assessing further.",
    countTarget: assessmentActiveCount,
    countLabel: "active",
    cells: (assessment) => [
      `<div class="record-main">${escapeHtml(assessmentTitle(assessment))}</div><div class="record-sub">${escapeHtml(assessmentIdentityContext(assessment))}</div>`,
      `${escapeHtml(assessment.serviceLabel || assessment.serviceType || "")}<div class="record-sub">${escapeHtml(compactMeta([assessment.frequencyLabel || assessment.frequency || "", assessmentPurposeDisplay(assessment), assessment.linkedClientName ? `Client: ${assessment.linkedClientName}` : ""]))}</div>`,
      `${escapeHtml(assessment.estimate || "Estimate pending")}<div class="record-sub">${escapeHtml(compactMeta([assessment.quoteRange || "", assessment.accountingQuote?.displayReference || "", assessment.linkedClientName ? `Client: ${assessment.linkedClientName}` : ""]))}</div>`,
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
    emptyTitle: "No Assessment history yet",
    emptyMessage: "Converted and closed Assessments remain visible here for traceability.",
    countTarget: assessmentHistoryCount,
    countLabel: "records",
    cells: (assessment) => [
      `<div class="record-main">${escapeHtml(assessmentTitle(assessment))}</div><div class="record-sub">${escapeHtml(assessmentIdentityContext(assessment))}</div>`,
      `${escapeHtml(assessment.serviceLabel || assessment.serviceType || "")}<div class="record-sub">${escapeHtml(compactMeta([assessment.frequencyLabel || assessment.frequency || "", assessmentPurposeDisplay(assessment), assessment.linkedClientName ? `Client: ${assessment.linkedClientName}` : ""]))}</div>`,
      `${escapeHtml(assessment.estimate || "Estimate pending")}<div class="record-sub">${escapeHtml(compactMeta([assessment.quoteRange || "", assessment.accountingQuote?.displayReference || "", assessment.linkedClientName ? `Client: ${assessment.linkedClientName}` : ""]))}</div>`,
      `<span class="pill blue">${escapeHtml(assessment.isConverted || assessment.convertedClientId ? "Converted" : assessment.quoteStageLabel || assessment.quoteStage || assessment.statusLabel || assessment.status || "Closed")}</span>`
    ],
    renderWorkspace: renderAssessmentWorkspace
  });

  const clientTable = document.querySelector("[data-client-table]");
  const clientHistoryTable = document.querySelector("[data-client-history-table]");
  const clientCount = document.querySelector("[data-client-count]");
  const clientHistoryCount = document.querySelector("[data-client-history-count]");
  const activeClients = (data.clients || []).filter(isActiveClient);
  const historyClients = (data.clients || []).filter(isHistoryClient);
  populateWorkspaceTable({
    table: clientTable,
    records: activeClients,
    view: "clients",
    type: "client",
    defaultTab: "overview",
    emptyTitle: "No active Client & Home records yet",
    emptyMessage: "Converted accepted Assessments will appear here as active client records.",
    countTarget: clientCount,
    countLabel: "active",
    cells: (client) => [
      `<div class="record-main">${escapeHtml(client.name || "")}</div><div class="record-sub">${escapeHtml(compactMeta([client.area, client.address]))}</div>`,
      `${escapeHtml(clientServiceLabel(client) || "Service pending")}<div class="record-sub">${escapeHtml(clientFrequencyLabel(client) || "")}</div>`,
      `${escapeHtml(client.manHours ? `${client.manHours} man-hours` : "Plan pending")}<div class="record-sub">${escapeHtml(compactMeta([client.mainCleaner, client.helper]))}</div>`,
      `<span class="pill">${escapeHtml(clientStatusDisplay(client))}</span>`
    ],
    renderWorkspace: renderClientWorkspace
  });
  populateWorkspaceTable({
    table: clientHistoryTable,
    records: historyClients,
    view: "clients",
    type: "client",
    defaultTab: "overview",
    emptyTitle: "No client history yet",
    emptyMessage: "Archived and inactive client records will remain visible here for traceability.",
    countTarget: clientHistoryCount,
    countLabel: "records",
    cells: (client) => [
      `<div class="record-main">${escapeHtml(client.name || "")}</div><div class="record-sub">${escapeHtml(compactMeta([client.area, client.address]))}</div>`,
      `${escapeHtml(clientServiceLabel(client) || "Service pending")}<div class="record-sub">${escapeHtml(clientFrequencyLabel(client) || "")}</div>`,
      `${escapeHtml(client.manHours ? `${client.manHours} man-hours` : "Plan pending")}<div class="record-sub">${escapeHtml(compactMeta([client.mainCleaner, client.helper]))}</div>`,
      `<span class="pill blue">${escapeHtml(clientStatusDisplay(client))}</span>`
    ],
    renderWorkspace: renderClientWorkspace
  });

  document.querySelectorAll(".expandable-workspace select[data-group]").forEach((select) => {
    const other = select.parentElement.querySelector(".other-field");
    if (!other) return;
    const update = () => {
      other.hidden = select.value !== "other";
    };
    select.addEventListener("change", update);
    update();
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

function updateTotalPriceFromLines() {
  const container = document.getElementById("editor-price-lines-list");
  let sum = 0;
  container.querySelectorAll(".price-line-row-tr").forEach((row) => {
    const amountVal = parseFloat(row.querySelector(".price-line-amount").value);
    if (!isNaN(amountVal)) {
      sum += amountVal;
    }
  });
  const totalInput = document.querySelector('#quote-editor-form input[name="totalPrice"]');
  if (totalInput) {
    totalInput.value = sum.toFixed(2);
  }
}

function createPriceLineRow(desc = "", amount = "") {
  const row = document.createElement("tr");
  row.className = "price-line-row-tr";
  
  const tdDesc = document.createElement("td");
  const descInput = document.createElement("input");
  descInput.type = "text";
  descInput.className = "price-line-desc";
  descInput.placeholder = "Item description";
  descInput.value = desc;
  tdDesc.appendChild(descInput);
  
  const tdAmount = document.createElement("td");
  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.step = "0.01";
  amountInput.className = "price-line-amount";
  amountInput.placeholder = "0.00";
  amountInput.value = amount;
  tdAmount.appendChild(amountInput);
  
  const tdAction = document.createElement("td");
  tdAction.className = "col-action";
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "price-line-remove-btn";
  removeBtn.innerHTML = "&times;";
  tdAction.appendChild(removeBtn);
  
  row.appendChild(tdDesc);
  row.appendChild(tdAmount);
  row.appendChild(tdAction);
  
  amountInput.addEventListener("input", updateTotalPriceFromLines);
  removeBtn.addEventListener("click", () => {
    row.remove();
    updateTotalPriceFromLines();
  });
  
  return row;
}

async function openQuoteEditor(quoteId) {
  const modal = document.getElementById("quote-editor-modal");
  const form = document.getElementById("quote-editor-form");
  const statusNode = document.getElementById("quote-editor-status");
  
  if (!modal || !form) return;
  
  statusNode.textContent = "Loading quote details...";
  statusNode.className = "status";
  modal.hidden = false;
  
  try {
    const res = await apiGet(`/api/quotes/${quoteId}`);
    if (!res || !res.quote) {
      throw new Error("Failed to load quote details.");
    }
    
    const quote = res.quote;
    const defaultAssumptions = [
      "Work is based on normal access and parking availability.",
      "Agreed scope of work as detailed in the included items list.",
      "Pricing assumes no major property condition changes since the initial assessment."
    ].join("\n");
    const defaultClientNotes = "This quote is based on the information provided and may be adjusted if the agreed scope changes.";

    form.elements.id.value = quote.id;
    form.elements.scopeOfWork.value = quote.scopeOfWork || "";
    form.elements.includedItems.value = quote.includedItems || "";
    form.elements.excludedItems.value = quote.excludedItems || "";
    form.elements.assumptions.value = quote.assumptions || defaultAssumptions;
    form.elements.pricingNotes.value = quote.pricingNotes || "";
    form.elements.clientNotes.value = quote.clientNotes || defaultClientNotes;
    form.elements.internalNotes.value = quote.internalNotes || "";
    
    form.elements.totalPrice.value = quote.totalPrice ? (quote.totalPrice / 100).toFixed(2) : "";
    form.elements.recurringPrice.value = quote.recurringPrice ? (quote.recurringPrice / 100).toFixed(2) : "";
    form.elements.validUntil.value = quote.validUntil ? quote.validUntil.slice(0, 10) : "";
    
    // Populate Context Banner
    document.getElementById("ctx-client-name").textContent = quote.clientName || quote.customerName || "N/A";
    document.getElementById("ctx-area").textContent = quote.area || "N/A";
    document.getElementById("ctx-service").textContent = quote.serviceType || "N/A";
    document.getElementById("ctx-frequency").textContent = quote.frequency || "N/A";
    document.getElementById("ctx-ref").textContent = quote.displayReference || "N/A";
    
    const badge = document.getElementById("ctx-status");
    badge.textContent = quote.status || "N/A";
    badge.className = `status-badge status-${String(quote.status).toLowerCase()}`;
    
    document.getElementById("ctx-qa-id").textContent = quote.assessmentQuoteId || "N/A";

    // Populate Context / Help Panel
    const helpRange = document.getElementById("help-suggested-range");
    if (quote.suggestedPriceMin || quote.suggestedPriceMax) {
      const minStr = quote.suggestedPriceMin ? ("£" + (quote.suggestedPriceMin / 100).toFixed(2)) : "£0.00";
      const maxStr = quote.suggestedPriceMax ? ("£" + (quote.suggestedPriceMax / 100).toFixed(2)) : "£0.00";
      helpRange.textContent = `${minStr} - ${maxStr}`;
    } else {
      helpRange.textContent = "No suggestion available";
    }

    const helpQaNotes = document.getElementById("help-qa-notes");
    helpQaNotes.textContent = quote.qaQuoteNotes || quote.qaNotes || "No notes available";
    
    const helpProperty = document.getElementById("help-property-summary");
    const summaryParts = [];
    if (quote.serviceType) summaryParts.push(`Service: ${quote.serviceType}`);
    if (quote.frequency) summaryParts.push(`Frequency: ${quote.frequency}`);
    if (quote.area) summaryParts.push(`Area: ${quote.area}`);
    if (quote.qaAssessmentNotes) summaryParts.push(`Assessment: ${quote.qaAssessmentNotes}`);
    helpProperty.textContent = summaryParts.join("\n") || "No summary available";
    
    const linesList = document.getElementById("editor-price-lines-list");
    linesList.innerHTML = "";
    
    let priceLines = [];
    if (quote.priceLines) {
      try {
        priceLines = JSON.parse(quote.priceLines);
      } catch (e) {
        console.error("Failed to parse priceLines JSON", e);
      }
    }
    
    if (Array.isArray(priceLines) && priceLines.length > 0) {
      priceLines.forEach((line) => {
        const amt = line.price !== undefined ? (line.price / 100).toFixed(2) : "";
        const row = createPriceLineRow(line.description || "", amt);
        linesList.appendChild(row);
      });
    } else {
      linesList.appendChild(createPriceLineRow());
    }
    
    statusNode.textContent = "";
  } catch (err) {
    statusNode.textContent = err.message;
    statusNode.className = "status error";
  }
}

function closeQuoteEditor() {
  const modal = document.getElementById("quote-editor-modal");
  if (modal) {
    modal.hidden = true;
  }
}

async function saveQuoteEditor(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const quoteId = form.elements.id.value;
  const statusNode = document.getElementById("quote-editor-status");
  
  statusNode.textContent = "Saving changes...";
  statusNode.className = "status";
  
  const payload = {
    scopeOfWork: form.elements.scopeOfWork.value,
    includedItems: form.elements.includedItems.value,
    excludedItems: form.elements.excludedItems.value,
    assumptions: form.elements.assumptions.value,
    pricingNotes: form.elements.pricingNotes.value,
    clientNotes: form.elements.clientNotes.value,
    internalNotes: form.elements.internalNotes.value,
  };
  
  payload.validUntil = form.elements.validUntil.value || null;
  
  const totalVal = parseFloat(form.elements.totalPrice.value);
  payload.totalPrice = isNaN(totalVal) ? null : Math.round(totalVal * 100);
  
  const recVal = parseFloat(form.elements.recurringPrice.value);
  payload.recurringPrice = isNaN(recVal) ? null : Math.round(recVal * 100);
  
  const linesList = document.getElementById("editor-price-lines-list");
  const priceLines = [];
  linesList.querySelectorAll(".price-line-row-tr").forEach((row) => {
    const desc = row.querySelector(".price-line-desc").value.trim();
    const amtVal = parseFloat(row.querySelector(".price-line-amount").value);
    const price = isNaN(amtVal) ? 0 : Math.round(amtVal * 100);
    if (desc || price > 0) {
      priceLines.push({ description: desc, price });
    }
  });
  payload.priceLines = JSON.stringify(priceLines);
  
  try {
    const res = await apiPatch(`/api/quotes/${quoteId}`, payload);
    if (!res || !res.ok) {
      throw new Error("Failed to save quote changes.");
    }
    
    const quote = res.quote || {};
    await refreshQuoteLinkedViews(quote.assessmentQuoteId, quote.clientId || null);
    
    closeQuoteEditor();
  } catch (err) {
    statusNode.textContent = err.message;
    statusNode.className = "status error";
  }
}

function bindEvents() {
  document.querySelectorAll("#assessment-setup-modal [data-close-assessment-setup]").forEach((btn) => {
    btn.addEventListener("click", closeAssessmentSetupModal);
  });
  document.getElementById("assessment-setup-form")?.addEventListener("submit", submitAssessmentSetup);
  document.getElementById("assessment-setup-form")?.addEventListener("change", (event) => {
    if (event.target?.name === "propertyMode") updateAssessmentSetupMode();
    if (["propertyMode", "propertyLabel", "area", "address", "serviceType"].includes(event.target?.name)) {
      suggestAssessmentWorkLabel(event.currentTarget);
    }
  });
  document.getElementById("assessment-setup-form")?.addEventListener("input", (event) => {
    if (event.target?.name === "workLabel") {
      event.target.dataset.userEdited = event.target.value.trim() ? "true" : "";
    }
    if (["propertyLabel", "area", "address"].includes(event.target?.name)) {
      suggestAssessmentWorkLabel(event.currentTarget);
    }
  });
  document.querySelectorAll("#quote-editor-modal [data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", closeQuoteEditor);
  });
  
  document.getElementById("quote-editor-form")?.addEventListener("submit", saveQuoteEditor);
  
  document.getElementById("editor-add-price-line")?.addEventListener("click", () => {
    document.getElementById("editor-price-lines-list").appendChild(createPriceLineRow());
  });
  
  document.querySelectorAll("#quote-editor-modal .date-quick-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const days = parseInt(btn.getAttribute("data-days"), 10);
      if (isNaN(days)) return;
      const d = new Date();
      d.setDate(d.getDate() + days);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const formatted = `${year}-${month}-${day}`;
      const input = document.querySelector('#quote-editor-form input[name="validUntil"]');
      if (input) {
        input.value = formatted;
      }
    });
  });

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

  document.addEventListener("click", async (event) => {
    const editAssessmentDetails = event.target.closest("[data-edit-assessment-details]");
    if (editAssessmentDetails) {
      const record = findRecordByType("assessment", editAssessmentDetails.dataset.editAssessmentDetails);
      if (record) startAssessmentDetailsEdit(record);
      return;
    }

    if (event.target.closest("[data-cancel-assessment-details]")) {
      clearAssessmentWorkspaceEditState();
      renderTables();
      syncWorkspaceFirstLayout();
      return;
    }

    const editClientWorkspace = event.target.closest("[data-edit-client-workspace]");
    if (editClientWorkspace) {
      const record = findRecordByType("client", editClientWorkspace.dataset.editClientWorkspace);
      const tab = editClientWorkspace.dataset.clientWorkspaceTab;
      if (record && tab) startClientWorkspaceEdit(record, tab);
      return;
    }

    if (event.target.closest("[data-cancel-client-workspace]")) {
      clearClientWorkspaceEditState();
      renderTables();
      syncWorkspaceFirstLayout();
      return;
    }

    const editDraftButton = event.target.closest("[data-edit-draft-quote]");
    if (editDraftButton) {
      const quoteId = editDraftButton.dataset.editDraftQuote;
      openQuoteEditor(quoteId);
      return;
    }

    const newAssessmentButton = event.target.closest("[data-create-assessment-from-client]");
    if (newAssessmentButton) {
      const clientId = newAssessmentButton.dataset.createAssessmentFromClient;
      try {
        openAssessmentSetupModal(clientId);
      } catch (err) {
        window.alert(`Could not create Assessment. ${err.message}`);
      }
      return;
    }

    const createQuoteButton = event.target.closest("[data-create-quote-for-assessment]");
    if (createQuoteButton) {
      const assessmentQuoteId = createQuoteButton.dataset.createQuoteForAssessment;
      try {
        setQuoteActionStatus(assessmentQuoteId, "Creating draft quote...");
        const result = await apiPost("/api/quotes", { assessmentQuoteId });
        await refreshQuoteLinkedViews(assessmentQuoteId, result.quote?.clientId || null);
        setQuoteActionStatus(
          assessmentQuoteId,
          result.alreadyExists ? "Using existing draft quote." : "Draft quote created."
        );
      } catch (err) {
        setQuoteActionStatus(assessmentQuoteId, `Could not create draft quote. ${err.message}`);
      }
      return;
    }

    const quoteStatusButton = event.target.closest("[data-update-quote-status]");
    if (quoteStatusButton) {
      const quoteId = quoteStatusButton.dataset.quoteId;
      const assessmentQuoteId = quoteStatusButton.dataset.assessmentQuoteId;
      const nextStatus = quoteStatusButton.dataset.updateQuoteStatus;
      try {
        setQuoteActionStatus(assessmentQuoteId, `Updating quote to ${quoteStatusDisplay({ status: nextStatus }).toLowerCase()}...`);
        const result = await apiPatch(`/api/quotes/${quoteId}`, { status: nextStatus });
        await refreshQuoteLinkedViews(assessmentQuoteId, result.quote?.clientId || null);
        setQuoteActionStatus(assessmentQuoteId, `Quote marked ${quoteStatusDisplay({ status: nextStatus }).toLowerCase()}.`);
      } catch (err) {
        setQuoteActionStatus(assessmentQuoteId, `Could not update quote. ${err.message}`);
      }
      return;
    }

    const addCustomBtn = event.target.closest("[data-builder-add-custom]");
    if (addCustomBtn) {
      const assessmentId = addCustomBtn.dataset.builderAddCustom;
      const builder = state.quoteBuilder[assessmentId];
      if (builder) {
        builder.modules.push({
          id: `custom_${Date.now()}`,
          name: "Custom task",
          type: "custom",
          client_description: "Custom task details.",
          internal_note: "",
          hours: 0,
          rate: 0,
          amount: 0.00,
          is_recurring: false,
          selected: true
        });
        setWorkspaceTab("assessments", assessmentId, "quote-builder");
      }
      return;
    }

    const deleteBtn = event.target.closest(".btn-module-delete");
    if (deleteBtn) {
      const row = deleteBtn.closest(".builder-module-row");
      const workspace = deleteBtn.closest(".expandable-workspace");
      if (row && workspace) {
        const assessmentId = workspace.dataset.workspaceId;
        const moduleIndex = parseInt(row.dataset.moduleIndex, 10);
        const builder = state.quoteBuilder[assessmentId];
        if (builder) {
          builder.modules.splice(moduleIndex, 1);
          setWorkspaceTab("assessments", assessmentId, "quote-builder");
        }
      }
      return;
    }

    const generateBtn = event.target.closest("[data-builder-generate-quote]");
    if (generateBtn) {
      const assessmentId = generateBtn.dataset.builderGenerateQuote;
      await handleGenerateQuoteFromBuilder(assessmentId);
      return;
    }
  });

  document.addEventListener("submit", async (event) => {
    const assessmentDetailsForm = event.target.closest("[data-assessment-details-form]");
    if (assessmentDetailsForm) {
      event.preventDefault();
      const assessmentId = assessmentDetailsForm.dataset.assessmentId;
      const payload = normaliseAssessmentDetailsPayload(new FormData(assessmentDetailsForm));
      try {
        if (state.apiReady) {
          await apiPatch(`/api/assessment-quotes/${assessmentId}`, payload);
        } else {
          applyAssessmentLocalUpdate(assessmentId, payload);
        }
        clearAssessmentWorkspaceEditState();
        if (state.apiReady) {
          await refreshWorkspaceRecord("assessments", "assessment", assessmentId, "details");
        } else {
          renderTables();
          syncWorkspaceFirstLayout();
          const updated = findRecordByType("assessment", assessmentId);
          if (updated && state.activeDrawerType === "assessment" && workspaceDrawerMode("assessments") === "expanded") {
            openDrawer("assessment", updated);
          }
        }
      } catch (err) {
        window.alert(`Could not save Assessment details. ${err.message}`);
      }
      return;
    }

    const clientContactForm = event.target.closest("[data-client-contact-form]");
    if (clientContactForm) {
      event.preventDefault();
      const clientId = clientContactForm.dataset.clientId;
      const payload = normaliseClientContactAccessPayload(new FormData(clientContactForm));
      try {
        if (state.apiReady) {
          await apiPatch(`/api/clients/${clientId}`, payload);
        } else {
          applyClientLocalUpdate(clientId, payload.action, payload);
        }
        clearClientWorkspaceEditState();
        if (state.apiReady) {
          await refreshWorkspaceRecord("clients", "client", clientId, "contact-access");
        } else {
          renderTables();
          syncWorkspaceFirstLayout();
          const updated = findRecordByType("client", clientId);
          if (updated && state.activeDrawerType === "client" && workspaceDrawerMode("clients") === "expanded") {
            openDrawer("client", updated);
          }
        }
      } catch (err) {
        window.alert(`Could not save Client & Home contact details. ${err.message}`);
      }
      return;
    }

    const clientHomeForm = event.target.closest("[data-client-home-form]");
    if (clientHomeForm) {
      event.preventDefault();
      const clientId = clientHomeForm.dataset.clientId;
      const payload = normaliseClientHomeDetailsPayload(new FormData(clientHomeForm));
      try {
        if (state.apiReady) {
          await apiPatch(`/api/clients/${clientId}`, payload);
        } else {
          applyClientLocalUpdate(clientId, payload.action, payload);
        }
        clearClientWorkspaceEditState();
        if (state.apiReady) {
          await refreshWorkspaceRecord("clients", "client", clientId, "home-details");
        } else {
          renderTables();
          syncWorkspaceFirstLayout();
          const updated = findRecordByType("client", clientId);
          if (updated && state.activeDrawerType === "client" && workspaceDrawerMode("clients") === "expanded") {
            openDrawer("client", updated);
          }
        }
      } catch (err) {
        window.alert(`Could not save Client & Home home details. ${err.message}`);
      }
      return;
    }

    const clientPlanForm = event.target.closest("[data-client-plan-form]");
    if (clientPlanForm) {
      event.preventDefault();
      const clientId = clientPlanForm.dataset.clientId;
      const record = findRecordByType("client", clientId);
      if (!record) return;
      const payload = normaliseClientCleaningPlanPayload(new FormData(clientPlanForm), record);
      try {
        if (state.apiReady) {
          await apiPatch(`/api/clients/${clientId}`, payload);
        } else {
          applyClientLocalUpdate(clientId, payload.action, payload);
        }
        clearClientWorkspaceEditState();
        if (state.apiReady) {
          await refreshWorkspaceRecord("clients", "client", clientId, "cleaning-plan");
        } else {
          renderTables();
          syncWorkspaceFirstLayout();
          const updated = findRecordByType("client", clientId);
          if (updated && state.activeDrawerType === "client" && workspaceDrawerMode("clients") === "expanded") {
            openDrawer("client", updated);
          }
        }
      } catch (err) {
        window.alert(`Could not save Client & Home cleaning plan. ${err.message}`);
      }
    }
  });

  document.addEventListener("input", (event) => {
    const row = event.target.closest(".builder-module-row");
    if (!row) return;
    const workspace = event.target.closest(".expandable-workspace");
    if (!workspace) return;
    const assessmentId = workspace.dataset.workspaceId;
    const moduleIndex = parseInt(row.dataset.moduleIndex, 10);
    const builder = state.quoteBuilder[assessmentId];
    if (!builder) return;
    const mod = builder.modules[moduleIndex];
    if (!mod) return;

    if (event.target.classList.contains("mod-name-input")) {
      mod.name = event.target.value;
    } else if (event.target.classList.contains("mod-desc-input")) {
      mod.client_description = event.target.value;
    } else if (event.target.classList.contains("mod-hours-input")) {
      mod.hours = parseFloat(event.target.value) || 0;
      if (mod.hours > 0 || mod.rate > 0) {
        mod.amount = Number((mod.hours * mod.rate).toFixed(2));
        const amountInput = row.querySelector(".mod-amount-input");
        if (amountInput) amountInput.value = mod.amount;
      }
      updateBuilderTotalsUI(assessmentId);
    } else if (event.target.classList.contains("mod-rate-input")) {
      mod.rate = parseFloat(event.target.value) || 0;
      if (mod.hours > 0 || mod.rate > 0) {
        mod.amount = Number((mod.hours * mod.rate).toFixed(2));
        const amountInput = row.querySelector(".mod-amount-input");
        if (amountInput) amountInput.value = mod.amount;
      }
      updateBuilderTotalsUI(assessmentId);
    } else if (event.target.classList.contains("mod-amount-input")) {
      mod.amount = parseFloat(event.target.value) || 0;
      updateBuilderTotalsUI(assessmentId);
    }
  });

  document.addEventListener("change", (event) => {
    const row = event.target.closest(".builder-module-row");
    if (!row) return;
    const workspace = event.target.closest(".expandable-workspace");
    if (!workspace) return;
    const assessmentId = workspace.dataset.workspaceId;
    const moduleIndex = parseInt(row.dataset.moduleIndex, 10);
    const builder = state.quoteBuilder[assessmentId];
    if (!builder) return;
    const mod = builder.modules[moduleIndex];
    if (!mod) return;

    if (event.target.classList.contains("mod-selected-chk")) {
      mod.selected = event.target.checked;
      row.classList.toggle("is-selected", mod.selected);
      updateBuilderTotalsUI(assessmentId);
    } else if (event.target.classList.contains("mod-recurring-sel")) {
      mod.is_recurring = event.target.value === "true";
      updateBuilderTotalsUI(assessmentId);
    }
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
    apiGet("/api/quotes"),
    apiGet("/api/jobs"),
    apiGet("/api/invoices")
  ]);

  const [options, dashboard, leads, tasks, assessments, clients, quotes, jobs, invoices] = payloads;
  if (leads.status !== "fulfilled") throw leads.reason || new Error("API /api/leads failed");

  if (options.status === "fulfilled") {
    state.options = Object.fromEntries(options.value.groups.map((group) => [group.key, group]));
  } else {
    state.options = {};
  }

  normalizeLeadData(leads.value);
  data.dashboard = dashboard.status === "fulfilled" ? dashboard.value : null;
  data.tasks = tasks.status === "fulfilled" ? tasks.value.tasks || [] : [];
  data.quotes = quotes.status === "fulfilled" ? quotes.value.quotes || [] : [];
  const rawAssessments = assessments.status === "fulfilled" ? assessments.value.assessmentQuotes || assessments.value.assessments || [] : [];
  const rawClients = clients.status === "fulfilled" ? clients.value.clients || [] : [];
  const hydrated = mergeQuotesIntoRecords(rawAssessments, rawClients, data.quotes);
  data.assessments = hydrated.hydratedAssessments;
  data.clients = hydrated.hydratedClients;
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

