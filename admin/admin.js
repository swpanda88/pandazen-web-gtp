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
        suggestedPriceLabel: "£150.00-£195.00",
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
      amount: "£184",
      status: "Draft",
      paid: "-"
    },
    {
      id: "invoice-2",
      number: "PZ-2026-0002",
      client: "Mr Green",
      date: "12 May",
      amount: "£246",
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
  scheduleMonth: null
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
  return items.filter(Boolean).join(" · ");
}

function detailValue(value, type = "text") {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "";
  if (type === "boolean") return value ? "Yes" : "No";
  if (type === "money" && typeof value === "number") {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value / 100);
  }
  return value ?? "";
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
              <div class="detail-label">${label}</div>
              <div class="${className}">${rendered || "Not selected"}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function resetDrawer() {
  drawer.innerHTML = `
    <div class="drawer-empty">
      <p class="eyebrow">Detail panel</p>
      <h2>Select a record</h2>
      <p>Click a lead, task, job or invoice to review details here.</p>
    </div>
  `;
}

function openDrawer(type, record = {}) {
  const templates = {
    lead: {
      title: record.name || "New lead",
      subtitle: record.service || "Customer enquiry",
      sections: [
        ["Contact", [["Name", record.name], ["Area", record.area], ["Contact", record.contact], ["Source", record.source]]],
        ["Progress", [["Status", record.statusLabel || record.status], ["Service", record.serviceLabel || record.service]]],
        [
          "Quote assist",
          record.quoteAssist
            ? [
                ["Fit score", `${record.quoteAssist.fitScore}/100`],
                ["Price-shopper risk", record.quoteAssist.priceShopperRisk],
                ["Estimated first clean", `${record.quoteAssist.estimatedFirstCleanHoursMin}-${record.quoteAssist.estimatedFirstCleanHoursMax} hours`],
                ["Suggested internal range", record.quoteAssist.suggestedPriceLabel],
                ["Next action", record.quoteAssist.recommendedNextAction],
                ["Confidence", record.quoteAssist.confidence],
                ["Flags", [...(record.quoteAssist.positiveFlags || []), ...(record.quoteAssist.riskFlags || [])].join("; ")]
              ]
            : [["Status", "Not generated yet"]]
        ],
        ["Notes", [["Internal note", record.note || record.notes]]]
      ],
      actions: ["Generate reply", "Request photos", "Mark contacted", "Add note", "Snooze", "Mark lost"]
    },
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
      title: record.client || "New assessment",
      subtitle: record.date ? `${record.date} at ${record.time}` : "Home visit",
      sections: [
        ["Visit", [["Area", record.area], ["Rooms", record.rooms], ["Estimate", record.estimate]]],
        ["Assessment notes", [["Notes", record.notes]]]
      ],
      actions: ["Create quote", "Create client", "Schedule follow-up"]
    },
    client: {
      title: record.name || "New client",
      subtitle: record.frequency || "Client record",
      sections: [
        ["Cleaning plan", [["Area", record.area], ["Frequency", record.frequency], ["Man-hours", record.manHours], ["Main cleaner", record.mainCleaner], ["Helper", record.helper]]],
        ["Quote", [["Price", record.price]]],
        ["Notes", [["Internal note", record.notes]]]
      ],
      actions: ["Generate jobs", "Edit cleaning plan", "Create invoice"]
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
  const nextAction = type === "lead"
    ? record.quoteAssist?.recommendedNextAction || "Review enquiry and choose next action"
    : type === "task"
      ? record.notes || "Review task and update status"
      : "";
  drawer.innerHTML = `
    <div class="drawer-content">
      <div class="drawer-titlebar">
        <div>
          <p class="eyebrow">${type}</p>
          <h2>${template.title}</h2>
          <p>${template.subtitle}</p>
        </div>
        <button class="drawer-close" type="button" data-close-drawer aria-label="Close detail panel">Close</button>
      </div>
      ${
        nextAction
          ? `<section class="next-action-strip">
              <span>Recommended next action</span>
              <strong>${nextAction}</strong>
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
      <section class="drawer-section">
        <h3>Actions</h3>
        <div class="drawer-actions">
          ${template.actions.map((action) => `<button class="ghost" type="button">${action}</button>`).join("")}
        </div>
      </section>
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
    </div>
  `;

  drawer.querySelectorAll("select[data-group]").forEach((select) => {
    const other = select.parentElement.querySelector(".other-field");
    const update = () => {
      if (other) other.hidden = select.value !== "other";
    };
    select.addEventListener("change", update);
    update();
  });

  drawer.querySelector("[data-close-drawer]")?.addEventListener("click", resetDrawer);

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
  drawer.innerHTML = `
    <form class="drawer-content" data-lead-form>
      <div class="drawer-titlebar">
        <div>
          <p class="eyebrow">Lead</p>
          <h2>New lead</h2>
          <p>Add the first enquiry details. Dropdowns keep typing low; choose Other when needed.</p>
        </div>
        <button class="drawer-close" type="button" data-close-drawer aria-label="Close new lead form">Close</button>
      </div>
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
    </form>
  `;

  const form = drawer.querySelector("[data-lead-form]");
  drawer.querySelectorAll("[data-close-drawer]").forEach((button) => {
    button.addEventListener("click", resetDrawer);
  });
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
      await apiPost("/api/admin/leads", lead);
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
          <small>${task.taskType} · ${formatDateTime(task.dueAt) || "No due date"}</small>
        </span>
        <mark class="${task.priority === "High" ? "rose" : ""}">${task.priority || "Normal"}</mark>
      </button>
    `;
    card.querySelector("button").addEventListener("click", () => openDrawer("task", task));
    list.append(card);
  });

  const attention = data.dashboard?.attention || data.leads.slice(0, 4);
  attention.slice(0, Math.max(1, 4 - taskAttention.length)).forEach((lead) => {
    const card = el("article", "attention-row");
    const score = leadFitScore(lead);
    card.innerHTML = `
      <button type="button">
        <span class="row-token">Lead</span>
        <span>
          <strong>${lead.name} · ${lead.area || ""}</strong>
          <small>${compactMeta([lead.serviceLabel || lead.service, lead.contact, score ? `Fit ${score}` : "Needs review"])}</small>
        </span>
        <mark>${lead.quoteAssist?.recommendedNextAction ? "Request photos" : lead.statusLabel || lead.status}</mark>
      </button>
    `;
    card.querySelector("button").addEventListener("click", () => openDrawer("lead", lead));
    list.append(card);
  });

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
  const leads = [...data.leads]
    .sort((a, b) => (leadFitScore(b) || 0) - (leadFitScore(a) || 0))
    .slice(0, 5);

  host.innerHTML = leads.map((lead) => `
    <button class="priority-row" type="button" data-priority-lead="${lead.id}">
      <span>
        <strong>${lead.name}</strong>
        <small>${compactMeta([lead.area, lead.contact])}</small>
      </span>
      <span>
        <strong>${lead.serviceLabel || lead.service || "Enquiry"}</strong>
        <small>${compactMeta([lead.frequency, lead.note?.includes("dog") ? "pets" : "", "prefers trust"])}</small>
      </span>
      <mark>${compactMeta([leadFitScore(lead), leadRisk(lead), leadHours(lead), leadPrice(lead)]) || "Review"}</mark>
      <mark class="status">${lead.statusLabel || lead.status || "New"}</mark>
    </button>
  `).join("");

  host.querySelectorAll("[data-priority-lead]").forEach((button) => {
    button.addEventListener("click", () => {
      const lead = data.leads.find((item) => String(item.id) === button.dataset.priorityLead);
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
  const statuses = state.apiReady
    ? (state.options.lead_status?.options || []).filter((option) => option.value !== "lost")
    : leadStatuses.map((status) => ({ value: status, label: status }));

  statuses.forEach((statusOption) => {
    const leads = data.leads.filter((lead) => (lead.statusValue || lead.status) === statusOption.value || lead.status === statusOption.label);
    const column = el("section", "board-column");
    column.innerHTML = `<h2>${statusOption.label}<span>${leads.length}</span></h2>`;
    leads.forEach((lead) => {
      const card = el("article", "board-card");
      card.innerHTML = `
        <button type="button">
          <h3>${lead.name}</h3>
          <p>${lead.area || ""} - ${lead.serviceLabel || lead.service || ""}</p>
          <div class="tag-row">
            <span class="pill">${lead.sourceLabel || lead.source || ""}</span>
            <span class="pill blue">${lead.contact}</span>
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
    <button type="button">
      ${cells.map((cell) => `<div>${cell}</div>`).join("")}
    </button>
  `;
  row.querySelector("button").addEventListener("click", () => openDrawer(type, record));
  return row;
}

function renderTables() {
  const assessmentTable = document.querySelector("[data-assessment-table]");
  assessmentTable.innerHTML = "";
  data.assessments.forEach((assessment) => {
    assessmentTable.append(recordRow("assessment", assessment, [
      `<div class="record-main">${assessment.client}</div><div class="record-sub">${assessment.area}</div>`,
      `${formatDate(assessment.date)}`,
      `${assessment.time}`,
      `<span class="pill warn">${assessment.estimate}</span>`
    ]));
  });

  const clientTable = document.querySelector("[data-client-table]");
  clientTable.innerHTML = "";
  data.clients.forEach((client) => {
    clientTable.append(recordRow("client", client, [
      `<div class="record-main">${client.name}</div><div class="record-sub">${client.area}</div>`,
      `${client.frequencyLabel || client.frequency || ""}`,
      `${client.manHours} man-hours`,
      `<span class="pill">${client.mainCleaner}</span>`
    ]));
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
  renderLeadBoard();
  renderTables();
  renderCleanerPhone();
  renderMiniCalendar();
  renderSchedule();
}

function normalizeApiData(payloads) {
  const [options, dashboard, leads, tasks, assessments, clients, jobs, invoices] = payloads;
  state.options = Object.fromEntries(options.groups.map((group) => [group.key, group]));
  data.leads = leads.leads.map((lead) => ({
    ...lead,
    statusValue: lead.status,
    status: lead.statusLabel,
    source: lead.sourceLabel,
    service: lead.serviceLabel,
    note: lead.notes,
    quoteAssist: lead.quoteAssist
  }));
  data.tasks = tasks.tasks || [];
  data.assessments = assessments.assessments;
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

async function loadApiData() {
  const payloads = await Promise.all([
    apiGet("/api/options"),
    apiGet("/api/dashboard"),
    apiGet("/api/admin/leads"),
    apiGet("/api/admin/tasks"),
    apiGet("/api/assessments"),
    apiGet("/api/clients"),
    apiGet("/api/jobs"),
    apiGet("/api/invoices")
  ]);
  normalizeApiData(payloads);
  state.apiReady = true;
  backendStatus.textContent = "Connected to Cloudflare D1. Protect /admin/* and /api/* with Cloudflare Access before real customer data.";
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
