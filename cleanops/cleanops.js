(function () {
  const data = window.CLEANOPS_DATA;
  const pageRoot = document.getElementById("page-root");
  const navRoot = document.getElementById("nav-list");
  const breadcrumb = document.getElementById("breadcrumb-title");
  const toast = document.getElementById("toast");
  const drawer = document.getElementById("action-drawer");
  const drawerTitle = document.getElementById("drawer-title");
  const drawerCopy = document.getElementById("drawer-copy");

  const titles = {
    home: "Home",
    schedule: "Schedule",
    clients: "Clients",
    requests: "Requests",
    quotes: "Quotes",
    jobs: "Jobs",
    invoices: "Invoices",
    team: "Team",
    reports: "Reports",
    settings: "Settings",
    mobile: "Mobile",
    portal: "Client Portal"
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
    return `<button class="${classes}" type="button" data-action="${escapeHtml(action || label)}">${escapeHtml(label)}</button>`;
  }

  function metricCard(item) {
    return `
      <article class="metric">
        <p class="muted">${escapeHtml(item.label)}</p>
        <div class="metric-value">${escapeHtml(item.value)}</div>
        ${chip(item.chip, item.tone)}
      </article>
    `;
  }

  function table(headers, rows) {
    return `
      <table>
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    `;
  }

  function pageHead(title, subtitle, actions, avatarText) {
    return `
      <div class="page-head">
        <div>
          <div class="title-row">
            ${avatarText ? `<div class="avatar">${escapeHtml(avatarText)}</div>` : ""}
            <h1>${escapeHtml(title)}</h1>
          </div>
          ${subtitle ? `<p class="muted" style="margin-top:10px">${escapeHtml(subtitle)}</p>` : ""}
        </div>
        <div class="page-actions">${actions || ""}</div>
      </div>
    `;
  }

  function renderNav(activeId) {
    navRoot.innerHTML = data.navItems
      .map((item) => `
        <button class="nav-item${item.divider ? " is-divided" : ""}${item.id === activeId ? " active" : ""}" type="button" data-route="${item.id}">
          <span class="nav-icon">${escapeHtml(item.icon)}</span>
          <span>${escapeHtml(item.label)}</span>
        </button>
      `)
      .join("");
  }

  function renderHome() {
    const queueRows = data.workQueue.map((item) => `
      <tr>
        <td>${escapeHtml(item.action)}</td>
        <td>${escapeHtml(item.client)}</td>
        <td>${escapeHtml(item.due)}</td>
        <td>${chip(item.status, item.tone)}</td>
      </tr>
    `);

    const routeCards = data.routeVisits.map((visit) => `
      <article class="visit-card ${escapeHtml(visit.tone)}">
        <strong>${escapeHtml(visit.time)} - ${escapeHtml(visit.client)}</strong>
        <span class="muted">${escapeHtml(visit.property)}</span>
        <span class="muted">${escapeHtml(visit.service)}</span>
        ${chip(visit.status, visit.tone)}
      </article>
    `).join("");

    return `
      ${pageHead(
        "Today at CleanOps",
        "Tuesday, 2 June. Exceptions first, schedule second.",
        `${button("New request", "Open new request drawer")} ${button("New quote", "Open new quote drawer")} ${button("New job", "Open new job drawer", "primary")}`,
        "CO"
      )}

      <section class="grid-4">${data.metrics.map(metricCard).join("")}</section>

      <section class="grid-detail" style="margin-top:18px">
        <div class="stack">
          <article class="panel">
            <div class="panel-head"><h2>Work queue</h2>${button("View all", "View all work queue items", "small")}</div>
            ${table(["Action", "Client", "Due", "Status"], queueRows)}
          </article>

          <article class="panel">
            <div class="panel-head"><h2>Today's route</h2>${button("Open schedule", "Open schedule screen", "small")}</div>
            <div class="panel-body route-strip">${routeCards}</div>
          </article>
        </div>

        <aside class="stack">
          <article class="panel pad">
            <div class="side-section">
              <h2>Revenue snapshot</h2>
              <div class="field-row"><span>This month</span><strong>GBP 24,860</strong></div>
              <div class="field-row"><span>Recurring</span><strong>GBP 14,120</strong></div>
              <div class="field-row"><span>Overdue</span><strong>GBP 930</strong></div>
            </div>
            <div class="side-section">
              <h2>Staff today</h2>
              <div class="field-row"><span>Available</span><strong>8</strong></div>
              <div class="field-row"><span>On visits</span><strong>5</strong></div>
              <div class="field-row"><span>Absent</span><strong>1</strong></div>
            </div>
          </article>
        </aside>
      </section>
    `;
  }

  function renderClients() {
    const client = data.selectedClient;
    const properties = client.properties.map((property, index) => `
      <article class="property-card${index === 0 ? " selected" : ""}">
        <div class="button-row" style="justify-content:space-between">
          <strong>${escapeHtml(property.name)}</strong>
          ${index === 0 ? chip("Selected", "success") : chip("Secondary", "info")}
        </div>
        <p class="muted">${escapeHtml(property.address)}</p>
        <div class="field-row"><span>Type</span><strong>${escapeHtml(property.type)}</strong></div>
        <div class="field-row"><span>Layout</span><strong>${escapeHtml(property.layout)}</strong></div>
      </article>
    `).join("");

    const activeWork = client.activeWork.map((item) => `
      <article class="work-card">
        <div class="button-row" style="justify-content:space-between">
          <strong>${escapeHtml(item.type)} - ${escapeHtml(item.title)}</strong>
          ${chip(item.status, item.tone)}
        </div>
      </article>
    `).join("");

    const selectedProperty = client.properties[0];

    return `
      <div class="page-head">
        <div class="title-row">
          <div class="avatar">JS</div>
          <h1>${escapeHtml(client.name)}</h1>
          ${chip(client.status, "info")}
        </div>
        <div class="page-actions">
          ${button("Email", "Email client", "primary")}
          ${button("Edit", "Edit client")}
          ${button("More actions", "Open client actions")}
        </div>
      </div>

      <section class="grid-detail">
        <div class="stack">
          <article class="panel">
            <div class="panel-head"><h2>Properties</h2>${button("New property", "Add new property", "small")}</div>
            <div class="panel-body property-grid">${properties}</div>
          </article>

          <article class="panel property-workspace">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Selected property workspace</p>
                <h2>${escapeHtml(selectedProperty.name)}</h2>
              </div>
              ${button("Create quote", "Create quote for selected property", "small primary")}
            </div>
            <div class="panel-body grid-2">
              <div>
                <h3>Operational profile</h3>
                <div class="field-row"><span>Address</span><strong>${escapeHtml(selectedProperty.address)}</strong></div>
                <div class="field-row"><span>Service</span><strong>${escapeHtml(selectedProperty.service)}</strong></div>
                <div class="field-row"><span>Cadence</span><strong>${escapeHtml(selectedProperty.cadence)}</strong></div>
              </div>
              <div>
                <h3>Cleaning context</h3>
                <div class="field-row"><span>Access</span><strong>${escapeHtml(selectedProperty.access)}</strong></div>
                <div class="field-row"><span>Risk</span><strong>${escapeHtml(selectedProperty.risk)}</strong></div>
                <div class="field-row"><span>Next action</span><strong>${escapeHtml(selectedProperty.nextAction)}</strong></div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-head"><h2>Overview</h2>${button("New", "Create active work", "small")}</div>
            <div class="tabs">
              <div class="tab active">Active work</div>
              <div class="tab">Requests</div>
              <div class="tab">Quotes</div>
              <div class="tab">Jobs</div>
              <div class="tab">Invoices</div>
            </div>
            <div class="panel-body stack">${activeWork}</div>
          </article>
        </div>

        <aside class="stack">
          <article class="panel pad">
            <div class="side-section">
              <h2>Contact info</h2>
              <div class="field-row"><span>Email</span><strong>${escapeHtml(client.email)}</strong></div>
              <div class="field-row"><span>Phone</span><strong>${escapeHtml(client.phone)}</strong></div>
              <div class="field-row"><span>Lead source</span><strong>${escapeHtml(client.source)}</strong></div>
            </div>
            <div class="side-section">
              <h2>Tags</h2>
              <div class="button-row" style="justify-content:flex-start">${client.tags.map((tag) => chip(tag, "info")).join("")}</div>
            </div>
            <div class="side-section">
              <h2>Last client communication</h2>
              <p class="muted">${escapeHtml(client.lastCommunication)}</p>
            </div>
          </article>

          <article class="panel">
            <div class="panel-head"><h2>Billing history</h2>${button("New", "Create invoice for client", "small")}</div>
            <div class="panel-body empty">
              <div class="empty-icon">I</div>
              <div>
                <h3>${escapeHtml(client.billingHistory[0].invoice)}</h3>
                <p class="muted">${escapeHtml(client.billingHistory[0].detail)}</p>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; background:var(--green-soft); padding:10px 14px; font-weight:950">
              <span>Current balance</span><span>${escapeHtml(client.balance)}</span>
            </div>
          </article>

          <article class="panel pad">
            <h2>Internal notes</h2>
            <p class="muted" style="margin-top:8px">Only visible to your team.</p>
            <div class="inputish" style="height:auto; min-height:86px; margin-top:14px; align-items:flex-start; padding-top:10px">${escapeHtml(client.internalNote)}</div>
          </article>
        </aside>
      </section>
    `;
  }

  function renderRequests() {
    const rows = data.requests.map((request) => `
      <tr>
        <td>${escapeHtml(request.number)}</td>
        <td>${escapeHtml(request.client)}</td>
        <td><strong>${escapeHtml(request.service)}</strong><br><span class="muted">${escapeHtml(request.property)}</span></td>
        <td>${escapeHtml(request.preferred)}</td>
        <td>${chip(request.status, request.tone)}</td>
        <td>${escapeHtml(request.owner)}</td>
      </tr>
    `);
    return `
      ${pageHead("Requests", "New enquiries and repeat work requests.", button("New request", "Open new request drawer", "primary"))}
      <article class="panel">
        <div class="filters">
          <span class="inputish">Search requests</span>
          <span class="selectish">All statuses</span>
          <span class="selectish">All services</span>
          <span class="selectish">Assigned owner</span>
        </div>
        ${table(["Request", "Client", "Service / property", "Preferred", "Status", "Owner"], rows)}
      </article>
    `;
  }

  function renderQuotes() {
    const rows = data.quotes.map((quote) => `
      <tr>
        <td>${escapeHtml(quote.number)}</td>
        <td>${escapeHtml(quote.client)}</td>
        <td><strong>${escapeHtml(quote.service)}</strong><br><span class="muted">${escapeHtml(quote.property)}</span></td>
        <td>${escapeHtml(quote.total)}</td>
        <td>${chip(quote.status, quote.tone)}</td>
        <td>${escapeHtml(quote.validUntil)}</td>
      </tr>
    `);

    return `
      ${pageHead("Quotes", "Build, send, and track cleaning quotes.", button("New quote", "Open new quote drawer", "primary"))}
      <section class="grid-detail">
        <article class="panel">
          <div class="filters">
            <span class="inputish">Search quotes</span>
            <span class="selectish">All statuses</span>
            <span class="selectish">This month</span>
          </div>
          ${table(["Quote", "Client", "Service / property", "Total", "Status", "Valid until"], rows)}
        </article>
        <aside class="panel pad">
          <h2>Quote builder preview</h2>
          <p class="muted" style="margin-top:8px">A compact builder for service templates, optional extras, deposits, and client preview.</p>
          <div class="stack" style="margin-top:14px">
            <div class="field-row"><span>Template</span><strong>End-of-tenancy</strong></div>
            <div class="field-row"><span>Deposit</span><strong>50%</strong></div>
            <div class="field-row"><span>Optional extras</span><strong>4 selected</strong></div>
            ${button("Preview as client", "Preview quote as client", "primary")}
          </div>
        </aside>
      </section>
    `;
  }

  function renderJobs() {
    const lanes = data.jobLanes.map((lane) => `
      <section class="lane">
        <h2>${escapeHtml(lane.title)}</h2>
        ${lane.jobs.map((job) => `
          <article class="job-card">
            <strong>${escapeHtml(job.title)}</strong>
            <span class="muted">${escapeHtml(job.meta)}</span>
            <span class="muted">${escapeHtml(job.service)} - ${escapeHtml(job.date)}</span>
            ${chip(job.status, job.tone)}
          </article>
        `).join("")}
      </section>
    `).join("");

    return `
      ${pageHead("Jobs", "One-off jobs, recurring contracts, revisits, and assessments.", button("New job", "Open new job drawer", "primary"))}
      <div class="kanban">${lanes}</div>
    `;
  }

  function renderSchedule() {
    const header = `<div class="day-head"></div>${data.scheduleDays.map((day) => `<div class="day-head">${escapeHtml(day)}</div>`).join("")}`;
    const rows = data.scheduleRows.map((row) => `
      <div class="slot time-cell">${escapeHtml(row.time)}</div>
      ${row.visits.map((visit) => `
        <div class="slot">
          ${visit ? `
            <article class="visit-card ${escapeHtml(visit.tone)}">
              <strong>${escapeHtml(visit.client)}</strong>
              <span class="muted">${escapeHtml(visit.property)}</span>
              <span class="muted">${escapeHtml(visit.service)}</span>
            </article>
          ` : ""}
        </div>
      `).join("")}
    `).join("");

    return `
      ${pageHead("Schedule", "Readable week and team view with cleaning-specific warnings.", button("New visit", "Open new visit drawer", "primary"))}
      <article class="panel">
        <div class="filters">
          <button class="button small" type="button" data-action="Show today">Today</button>
          <span class="selectish">Week of 2 Jun</span>
          <span class="selectish">All teams</span>
          <span class="selectish">All services</span>
          <span class="selectish">Warnings only</span>
        </div>
        <div class="schedule-grid">${header}${rows}</div>
      </article>
    `;
  }

  function renderInvoices() {
    const rows = data.invoices.map((invoice) => `
      <tr>
        <td>${escapeHtml(invoice.number)}</td>
        <td>${escapeHtml(invoice.client)}</td>
        <td>${escapeHtml(invoice.amount)}</td>
        <td>${escapeHtml(invoice.due)}</td>
        <td>${chip(invoice.status, invoice.tone)}</td>
        <td>${button(invoice.action, `${invoice.action} ${invoice.number}`, "small")}</td>
      </tr>
    `);

    return `
      ${pageHead("Invoices", "Draft, sent, paid, and overdue billing.", button("Create invoice", "Open create invoice drawer", "primary"))}
      <article class="panel">
        <div class="filters">
          <span class="inputish">Search invoices</span>
          <span class="selectish">Open invoices</span>
          <span class="selectish">Due date</span>
          ${button("Send reminders", "Send invoice reminders", "small")}
        </div>
        ${table(["Invoice", "Client", "Amount", "Due", "Status", "Action"], rows)}
      </article>
    `;
  }

  function renderTeam() {
    return `
      ${pageHead("Team", "Staff, roles, availability, and timesheets.", button("Add team member", "Open add team member drawer", "primary"))}
      <section class="grid-4">
        ${data.team.map((member) => `
          <article class="team-card">
            <div class="title-row">
              <div class="avatar">${escapeHtml(member.initials)}</div>
              <div>
                <h2>${escapeHtml(member.name)}</h2>
                <p class="muted" style="margin-top:6px">${escapeHtml(member.role)}</p>
              </div>
            </div>
            <div>${chip(member.status, member.tone)}</div>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderReports() {
    const rows = data.serviceRevenue.map((item) => `
      <tr>
        <td>${escapeHtml(item.service)}</td>
        <td>${escapeHtml(item.jobs)}</td>
        <td>${escapeHtml(item.revenue)}</td>
        <td>${escapeHtml(item.hours)}</td>
        <td>${chip(item.signal, item.tone)}</td>
      </tr>
    `);

    return `
      ${pageHead("Reports", "Light management insight without dashboard clutter.", button("Export", "Export report"))}
      <section class="grid-4">${data.reportMetrics.map(metricCard).join("")}</section>
      <article class="panel" style="margin-top:18px">
        <div class="panel-head"><h2>Service revenue</h2>${button("This month", "Change report range", "small")}</div>
        ${table(["Service", "Jobs", "Revenue", "Labour hours", "Margin signal"], rows)}
      </article>
    `;
  }

  function renderSettings() {
    return `
      ${pageHead("Settings", "Company defaults, templates, services, VAT, and payment placeholders.", button("Save changes", "Save settings prototype", "primary"))}
      <section class="settings-grid">
        ${data.settings.map((section) => `
          <article class="panel pad">
            <h2>${escapeHtml(section.title)}</h2>
            <div class="stack" style="margin-top:14px">
              ${section.rows.map((row) => `<div class="field-row"><span>${escapeHtml(row[0])}</span><strong>${escapeHtml(row[1])}</strong></div>`).join("")}
            </div>
          </article>
        `).join("")}
      </section>
    `;
  }

  function renderMobile() {
    const cards = data.mobileVisits.map((visit) => `
      <article class="mobile-card">
        <strong>${escapeHtml(visit.time)} ${escapeHtml(visit.client)}</strong>
        <span class="muted">${escapeHtml(visit.service)}, ${escapeHtml(visit.property)}</span>
        ${chip(visit.status, visit.tone)}
      </article>
    `).join("");

    return `
      ${pageHead("Cleaner mobile mock", "Mobile-first view for assigned visits, protected access, checklist, and visit actions.", "")}
      <section class="mobile-wrap">
        <article class="phone">
          <div class="phone-head"><span>Today</span>${chip("3 visits", "success")}</div>
          <div class="phone-body">
            ${cards}
            ${button("Open next visit", "Open cleaner visit", "primary")}
          </div>
          <div class="phone-nav"><span>Today</span><span>Upcoming</span><span>Time</span><span>Me</span></div>
        </article>

        <article class="phone">
          <div class="phone-head"><span>Smith visit</span><span>08:30</span></div>
          <div class="phone-body">
            <section class="panel pad">
              <h3>Access</h3>
              <p class="muted" style="margin-top:8px">Key safe details are protected and reveal logged.</p>
              <div style="margin-top:12px">${button("Reveal access", "Reveal protected access")}</div>
            </section>
            <section class="panel pad">
              <h3>Checklist</h3>
              <div class="field-row"><span>Kitchen</span><strong>Done</strong></div>
              <div class="field-row"><span>Bathrooms</span><strong>Required</strong></div>
              <div class="field-row"><span>Floors</span><strong>Required</strong></div>
            </section>
            ${button("Start visit", "Start cleaner visit", "primary")}
            ${button("Report issue", "Report cleaner issue")}
            ${button("Complete visit", "Complete cleaner visit")}
          </div>
          <div class="phone-nav"><span>Visit</span><span>Notes</span><span>Photos</span><span>Done</span></div>
        </article>
      </section>
    `;
  }

  function renderPortal() {
    const portal = data.portal;

    return `
      ${pageHead("Client portal mock", "Simple client-facing direction for quotes, visits, invoices, and messages.", "")}
      <section class="portal-frame">
        <div class="portal-hero">
          <div>
            <h1>Your cleaning service</h1>
            <p class="muted" style="margin-top:8px">${escapeHtml(portal.client)}, ${escapeHtml(portal.property)}</p>
          </div>
          ${button("Request work", "Client requests work", "primary")}
        </div>
        <div class="portal-body grid-2">
          <article class="panel pad">
            <h2>Upcoming visit</h2>
            <p class="muted" style="margin-top:10px">${escapeHtml(portal.upcoming)}</p>
            <div style="margin-top:14px">${button("Send message", "Client sends message")}</div>
          </article>
          <article class="panel pad">
            <h2>Quote awaiting approval</h2>
            <p class="muted" style="margin-top:10px">${escapeHtml(portal.quote)}</p>
            <div style="margin-top:14px">${button("Review quote", "Client reviews quote", "primary")}</div>
          </article>
          <article class="panel pad">
            <h2>Invoices</h2>
            <div class="field-row"><span>Current balance</span><strong>${escapeHtml(portal.balance)}</strong></div>
            <div class="field-row"><span>Last receipt</span><strong>${escapeHtml(portal.receipt)}</strong></div>
          </article>
          <article class="panel pad">
            <h2>Contact us</h2>
            <p class="muted" style="margin-top:10px">Questions about your clean, invoice, or booking.</p>
            <div style="margin-top:14px">${button("Message office", "Client messages office")}</div>
          </article>
        </div>
      </section>
    `;
  }

  const renderers = {
    home: renderHome,
    schedule: renderSchedule,
    clients: renderClients,
    requests: renderRequests,
    quotes: renderQuotes,
    jobs: renderJobs,
    invoices: renderInvoices,
    team: renderTeam,
    reports: renderReports,
    settings: renderSettings,
    mobile: renderMobile,
    portal: renderPortal
  };

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("visible"), 2200);
  }

  function openDrawer(title) {
    drawerTitle.textContent = title;
    drawerCopy.textContent = "This first-pass prototype keeps the action visible without connecting to D1, payments, email, SMS, auth, or external services yet.";
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  function navigate(route) {
    const safeRoute = renderers[route] ? route : "home";
    renderNav(safeRoute);
    breadcrumb.textContent = titles[safeRoute];
    pageRoot.innerHTML = renderers[safeRoute]();
    window.location.hash = safeRoute;
  }

  function handleDocumentClick(event) {
    const routeTarget = event.target.closest("[data-route]");
    if (routeTarget) {
      event.preventDefault();
      navigate(routeTarget.dataset.route);
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      const action = actionTarget.dataset.action;
      if (/new|create|add|edit|preview|reveal|start|complete|report|request|message|email|save/i.test(action)) {
        openDrawer(action);
      } else {
        showToast(`${action} is mocked for this prototype.`);
      }
    }
  }

  document.addEventListener("click", handleDocumentClick);
  document.getElementById("drawer-close").addEventListener("click", closeDrawer);
  document.getElementById("drawer-secondary").addEventListener("click", closeDrawer);
  document.getElementById("drawer-primary").addEventListener("click", () => {
    showToast("Prototype action acknowledged.");
    closeDrawer();
  });

  document.getElementById("global-search").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      showToast(`Search is mocked: ${event.target.value || "empty query"}`);
    }
  });

  const initialRoute = window.location.hash.replace("#", "");
  navigate(initialRoute || "home");
})();
