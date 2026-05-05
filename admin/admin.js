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
      note: "Large family home. Wants weekly help and prefers Friday morning."
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
      client: "Mrs Knowles",
      date: "Tue 14 May",
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
      ]
    },
    {
      id: "job-2",
      client: "Mrs Ellison",
      date: "Thu 16 May",
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
      ]
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
  ]
};

const state = {
  view: "dashboard",
  role: "admin"
};

const titles = {
  dashboard: "Dashboard",
  leads: "Leads",
  assessments: "Assessments",
  clients: "Clients",
  jobs: "Jobs",
  invoices: "Invoices",
  exports: "Exports"
};

const leadStatuses = ["New enquiry", "Contacted", "Assessment booked", "Quote sent", "Accepted"];

const viewTitle = document.querySelector("[data-view-title]");
const drawer = document.querySelector("[data-drawer]");

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
}

function setRole(role) {
  state.role = role;
  document.body.classList.toggle("cleaner-mode", role === "cleaner");
  document.querySelectorAll("[data-role]").forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });
  if (role === "cleaner") setView("jobs");
}

function openDrawer(type, record = {}) {
  const templates = {
    lead: {
      title: record.name || "New lead",
      subtitle: record.service || "Customer enquiry",
      sections: [
        ["Contact", [["Name", record.name], ["Area", record.area], ["Contact", record.contact], ["Source", record.source]]],
        ["Progress", [["Status", record.status], ["Service", record.service]]],
        ["Notes", [["Internal note", record.note]]]
      ],
      actions: ["Book assessment", "Mark contacted", "Convert to client"]
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
        ["Checklist", (record.checklist || []).map((item, index) => [`Item ${index + 1}`, item])]
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
  drawer.innerHTML = `
    <div class="drawer-content">
      <p class="eyebrow">${type}</p>
      <h2>${template.title}</h2>
      <p>${template.subtitle}</p>
      ${template.sections
        .map(([title, fields]) => `
          <section class="drawer-section">
            <h3>${title}</h3>
            <div class="field-grid">
              ${fields
                .map(([label, value]) => `
                  <label>
                    ${label}
                    <textarea rows="${String(value || "").length > 70 ? 3 : 1}">${value || ""}</textarea>
                  </label>
                `)
                .join("")}
            </div>
          </section>
        `)
        .join("")}
      <section class="drawer-section">
        <h3>Actions</h3>
        <div class="drawer-actions">
          ${template.actions.map((action) => `<button class="ghost" type="button">${action}</button>`).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderDashboard() {
  const list = document.querySelector("[data-dashboard-list]");
  list.innerHTML = "";
  data.leads.slice(0, 4).forEach((lead) => {
    const card = el("article", "task-card");
    card.innerHTML = `
      <button type="button">
        <h3>${lead.name}</h3>
        <p>${lead.status} - ${lead.area} - ${lead.service}</p>
      </button>
    `;
    card.querySelector("button").addEventListener("click", () => openDrawer("lead", lead));
    list.append(card);
  });

  const today = data.jobs[0];
  document.querySelector("[data-today-card]").innerHTML = `
    <h3>${today.client}</h3>
    <p>${today.type} - ${today.date} at ${today.time}</p>
    <div class="meta-list">
      <div><span>Main cleaner</span><strong>${today.mainCleaner}</strong></div>
      <div><span>Man-hours</span><strong>${today.manHours}</strong></div>
      <div><span>Helper</span><strong>${today.helper}</strong></div>
    </div>
    <button class="primary" type="button" data-open-first-job>Open checklist</button>
  `;
  document.querySelector("[data-open-first-job]").addEventListener("click", () => {
    setView("jobs");
    openDrawer("job", today);
  });
}

function renderLeadBoard() {
  const board = document.querySelector("[data-lead-board]");
  board.innerHTML = "";
  leadStatuses.forEach((status) => {
    const leads = data.leads.filter((lead) => lead.status === status);
    const column = el("section", "board-column");
    column.innerHTML = `<h2>${status}<span>${leads.length}</span></h2>`;
    leads.forEach((lead) => {
      const card = el("article", "board-card");
      card.innerHTML = `
        <button type="button">
          <h3>${lead.name}</h3>
          <p>${lead.area} - ${lead.service}</p>
          <div class="tag-row">
            <span class="pill">${lead.source}</span>
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
      `${assessment.date}`,
      `${assessment.time}`,
      `<span class="pill warn">${assessment.estimate}</span>`
    ]));
  });

  const clientTable = document.querySelector("[data-client-table]");
  clientTable.innerHTML = "";
  data.clients.forEach((client) => {
    clientTable.append(recordRow("client", client, [
      `<div class="record-main">${client.name}</div><div class="record-sub">${client.area}</div>`,
      `${client.frequency}`,
      `${client.manHours} man-hours`,
      `<span class="pill">${client.mainCleaner}</span>`
    ]));
  });

  const jobTable = document.querySelector("[data-job-table]");
  jobTable.innerHTML = "";
  data.jobs.forEach((job) => {
    jobTable.append(recordRow("job", job, [
      `<div class="record-main">${job.client}</div><div class="record-sub">${job.type}</div>`,
      `${job.date}<div class="record-sub">${job.time}</div>`,
      `${job.manHours} man-hours`,
      `<span class="pill ${job.status === "Assessment" ? "blue" : ""}">${job.status}</span>`
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
}

function renderCleanerPhone() {
  const job = data.jobs[0];
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
    <div class="checklist">
      ${job.checklist
        .map((item, index) => `
          <label class="check-item">
            <input type="checkbox" ${index < 2 ? "checked" : ""}>
            <span>${item}</span>
          </label>
        `)
        .join("")}
    </div>
    <button class="primary" type="button" style="width:100%; margin-top:14px;">Mark job complete</button>
  `;
}

function renderExports(type) {
  const preview = document.querySelector("[data-export-preview]");
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

  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => setRole(button.dataset.role));
  });

  document.querySelectorAll("[data-open-drawer]").forEach((button) => {
    button.addEventListener("click", () => openDrawer(button.dataset.openDrawer));
  });

  document.querySelector("[data-generate-jobs]").addEventListener("click", () => {
    data.jobs.push({
      id: `job-${data.jobs.length + 1}`,
      client: "Mrs Knowles",
      date: "Tue 4 Jun",
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
}

renderDashboard();
renderLeadBoard();
renderTables();
renderCleanerPhone();
bindEvents();
