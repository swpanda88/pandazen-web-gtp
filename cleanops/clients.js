(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedClientId: null,
    selectedPropertyByClient: {},
    detailTab: "active",
    newClientOpen: false,
    moreOpen: false
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

  const clientStatusLabels = {
    lead: "Lead",
    prospect: "Prospect",
    active_client: "Active client",
    commercial: "Commercial",
    paused: "Paused",
    inactive: "Inactive",
    archived: "Archived"
  };

  const clientTypeLabels = {
    individual: "Individual",
    company: "Company"
  };

  const leadSourceLabels = {
    website_enquiry: "Website enquiry",
    phone: "Phone",
    email: "Email",
    referral: "Referral",
    manual: "Manual",
    repeat_customer: "Repeat customer",
    other: "Other"
  };

  const propertyTypeLabels = {
    domestic_house: "Domestic house",
    flat_apartment: "Flat / apartment",
    studio_annexe: "Studio / annexe",
    commercial_office: "Commercial office",
    commercial_unit: "Commercial unit",
    holiday_let_airbnb: "Holiday let / Airbnb",
    unknown: "To confirm",
    other: "Other"
  };

  const bedroomsLabels = {
    studio: "Studio",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5_plus": "5+",
    not_applicable: "N/A",
    unknown: "Unknown"
  };

  const bathroomsLabels = {
    "1": "1",
    "2": "2",
    "3": "3",
    "4_plus": "4+",
    not_applicable: "N/A",
    unknown: "Unknown"
  };

  const serviceLabels = {
    regular_domestic_clean: "Regular domestic clean",
    deep_clean: "Deep clean",
    end_of_tenancy: "End-of-tenancy",
    commercial_clean: "Commercial clean",
    holiday_let_turnaround: "Holiday let turnaround",
    one_off_clean: "One-off clean",
    other: "Other",
    to_confirm: "To confirm"
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

  const accessLabels = {
    client_home: "Client home",
    key_held: "Key held",
    lockbox: "Lockbox",
    concierge_reception: "Concierge / reception",
    agent_landlord_access: "Agent / landlord access",
    staff_opens: "Staff opens",
    to_arrange: "To arrange",
    unknown: "Unknown"
  };

  const parkingLabels = {
    driveway: "Driveway",
    street_parking: "Street parking",
    permit_required: "Permit required",
    paid_parking: "Paid parking",
    staff_bays: "Staff bays",
    no_easy_parking: "No easy parking",
    unknown: "Unknown"
  };

  const petsLabels = {
    none: "No pets",
    dog: "Dog",
    cat: "Cat",
    multiple_pets: "Multiple pets",
    other: "Other pets",
    not_applicable: "N/A",
    unknown: "Unknown"
  };

  const supplyLabels = {
    client_provides: "Client provides",
    pandazen_provides: "PandaZen provides",
    mixed_specific_products_required: "Specific products",
    pandazen_brings: "PandaZen brings",
    not_required: "Not required",
    to_confirm: "To confirm"
  };

  function labelFrom(map, value, fallback = "Not set") {
    if (!value) return fallback;
    return map[value] || value;
  }

  function displayName(client) {
    return client.display_name || client.name || [client.first_name, client.last_name].filter(Boolean).join(" ") || "Unnamed client";
  }

  function statusLabel(client) {
    return labelFrom(clientStatusLabels, client.status, "Lead");
  }

  function sourceLabel(client) {
    return labelFrom(leadSourceLabels, client.lead_source || client.source, "Manual");
  }

  function propertyLabel(property) {
    return property?.label || property?.name || "Property";
  }

  function propertyTypeLabel(property) {
    return labelFrom(propertyTypeLabels, property?.property_type || property?.type, "Property");
  }

  function propertyArea(property) {
    return property?.postcode || property?.area || "";
  }

  function defaultServiceLabel(property) {
    return labelFrom(serviceLabels, property?.default_service_type || property?.service, "To confirm");
  }

  function cadenceLabel(property) {
    return labelFrom(cadenceLabels, property?.default_cadence || property?.cadence, "To confirm");
  }

  function compactServiceChip(property) {
    const cadence = labelFrom(cadenceLabels, property?.default_cadence, "");
    const service = labelFrom(serviceLabels, property?.default_service_type, "");
    if (cadence && service && service !== "To confirm") return `${cadence} clean`;
    return cadence || service || "To confirm";
  }

  function derivedClientChips(client) {
    const property = client.properties?.[0];
    const chips = [
      chip(statusLabel(client), client.statusTone || statusTone(client.status)),
      client.client_type ? chip(labelFrom(clientTypeLabels, client.client_type), "info") : "",
      property ? chip(propertyTypeLabel(property).startsWith("Commercial") ? "Commercial" : "Domestic", "info") : "",
      propertyArea(property) ? chip(propertyArea(property), "info") : "",
      property?.access_method === "key_held" ? chip("Key held", "success") : "",
      property?.default_cadence && property.default_cadence !== "to_confirm" ? chip(compactServiceChip(property), "success") : ""
    ].filter(Boolean);
    return chips.slice(0, 5).join("");
  }

  function button(label, action, variant = "") {
    const classes = ["button", variant].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-client-action="${escapeHtml(action)}">${escapeHtml(label)}</button>`;
  }

  function toast(message) {
    window.CleanOpsShell?.toast?.(message);
  }

  function clients() {
    if (!Array.isArray(data.clients) || !data.clients.length) {
      data.clients = data.selectedClient ? [data.selectedClient] : [];
    }
    return data.clients;
  }

  function findClient(id) {
    return clients().find((client) => client.id === id) || clients()[0];
  }

  function selectedClient() {
    return state.selectedClientId ? findClient(state.selectedClientId) : null;
  }

  function selectedProperty(client) {
    if (!client?.properties?.length) return null;
    const selectedId = state.selectedPropertyByClient[client.id] || client.properties[0].id;
    return client.properties.find((property) => property.id === selectedId) || client.properties[0];
  }

  function statusTone(status) {
    const tones = {
      lead: "info",
      Lead: "info",
      active_client: "success",
      "Active client": "success",
      prospect: "warning",
      Prospect: "warning",
      commercial: "info",
      Commercial: "info",
      paused: "warning",
      Paused: "warning",
      inactive: "info",
      Inactive: "info",
      archived: "danger",
      Archived: "danger"
    };
    return tones[status] || "info";
  }

  function initials(name) {
    return String(name || "CN")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "CN";
  }

  function table(headers, rows) {
    return `
      <table>
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    `;
  }

  function render() {
    const client = selectedClient();
    return `
      <section class="clients-root" data-clients-root="true">
        ${client ? renderDetail(client) : renderList()}
        ${state.newClientOpen ? renderNewClientModal() : ""}
      </section>
    `;
  }

  function renderList() {
    const rows = clients().map((client) => `
      <tr class="client-row" data-client-id="${escapeHtml(client.id)}" tabindex="0" role="button" aria-label="Open ${escapeHtml(displayName(client))}">
        <td>
          <div class="client-cell">
            <div class="avatar small">${escapeHtml(client.initials || initials(displayName(client)))}</div>
            <div>
              <strong>${escapeHtml(displayName(client))}</strong>
              ${client.company ? `<span class="muted">${escapeHtml(client.company)}</span>` : `<span class="muted">${escapeHtml(client.email || client.phone || "No contact method")}</span>`}
            </div>
          </div>
        </td>
        <td><strong>${escapeHtml(client.mainProperty || "No property yet")}</strong><br><span class="muted">${escapeHtml(client.area || "")}</span></td>
        <td>${chip(statusLabel(client), client.statusTone || statusTone(client.status))}</td>
        <td>${escapeHtml(client.activeSummary || "No active work")}</td>
        <td>${escapeHtml(client.balance || "GBP 0.00")}</td>
        <td>${escapeHtml(client.lastCommunication || "No contact yet")}</td>
      </tr>
    `);

    return `
      <div class="page-head">
        <div>
          <div class="title-row"><h1>Clients</h1></div>
          <p class="muted" style="margin-top:10px">Manage customers, properties, and active work.</p>
        </div>
        <div class="page-actions">${button("New Client", "open-new-client", "primary")}</div>
      </div>

      <section class="grid-detail clients-list-layout">
        <article class="panel">
          <div class="filters">
            <span class="inputish">Search clients</span>
            <span class="selectish">All statuses</span>
            <span class="selectish">Active work</span>
            <span class="selectish">Balance</span>
          </div>
          ${table(["Client", "Main property / area", "Status", "Active work", "Balance", "Last contact"], rows)}
        </article>

        <aside class="panel pad">
          <div class="side-section">
            <h2>Client records</h2>
            <p class="muted">A client is the contact and billing container. Requests, quotes, jobs, visits, and invoices attach later.</p>
          </div>
          <div class="side-section">
            <h2>Quick model</h2>
            <div class="client-model-list">
              <span>Client</span>
              <span>Property</span>
              <span>Request / assessment</span>
              <span>Quote</span>
              <span>Job / visit</span>
              <span>Invoice</span>
            </div>
          </div>
          <div>
            <h2>Manual client</h2>
            <p class="muted">Use New Client for a contact shell. Cleaning scope belongs in Requests.</p>
          </div>
        </aside>
      </section>
    `;
  }

  function renderDetail(client) {
    const property = selectedProperty(client);
    const properties = (client.properties || []).map((item) => `
      <button class="property-card property-button${property?.id === item.id ? " selected" : ""}" type="button" data-client-property-id="${escapeHtml(item.id)}">
        <div class="button-row" style="justify-content:space-between">
          <strong>${escapeHtml(propertyLabel(item))}</strong>
          ${property?.id === item.id ? chip("Selected", "success") : chip("Secondary", "info")}
        </div>
        <p class="muted">${escapeHtml(item.address || "No address yet")}</p>
        <div class="field-row"><span>Type</span><strong>${escapeHtml(propertyTypeLabel(item))}</strong></div>
        <div class="field-row"><span>Cadence</span><strong>${escapeHtml(cadenceLabel(item))}</strong></div>
      </button>
    `).join("");

    return `
      <div class="client-breadcrumb">
        <span>PandaZen</span>
        <span>/</span>
        <button type="button" data-client-action="back-to-list">Clients</button>
        <span>/</span>
        <strong>${escapeHtml(displayName(client))}</strong>
      </div>

      <div class="page-head">
        <div class="title-row">
          <div class="avatar">${escapeHtml(client.initials || initials(displayName(client)))}</div>
          <h1>${escapeHtml(displayName(client))}</h1>
          ${chip(statusLabel(client), client.statusTone || statusTone(client.status))}
        </div>
        <div class="page-actions">
          ${button("Email", "email-client", "primary")}
          ${button("Edit", "edit-client")}
          <div class="client-more-wrap">
            ${button("More actions", "toggle-more")}
            ${state.moreOpen ? renderMoreMenu(client, property) : ""}
          </div>
        </div>
      </div>

      <section class="grid-detail">
        <div class="stack">
          <article class="panel">
            <div class="panel-head"><h2>Properties</h2>${button("New property", "create-property", "small")}</div>
            <div class="panel-body property-grid">${properties || renderNoProperties()}</div>
          </article>

          ${renderPropertyWorkspace(property)}

          <article class="panel">
            <div class="panel-head"><h2>Overview</h2>${button("New", "create-active-work", "small")}</div>
            <div class="tabs">
              ${renderTab("active", "Active work")}
              ${renderTab("requests", "Requests")}
              ${renderTab("quotes", "Quotes")}
              ${renderTab("jobs", "Jobs")}
              ${renderTab("invoices", "Invoices")}
            </div>
            <div class="panel-body stack">${renderTabContent(client)}</div>
          </article>
        </div>

        <aside class="stack">
          <article class="panel pad">
            <div class="side-section">
              <h2>Contact info</h2>
              <div class="field-row"><span>Email</span><strong>${escapeHtml(client.email || "Not set")}</strong></div>
              <div class="field-row"><span>Phone</span><strong>${escapeHtml(client.phone || "Not set")}</strong></div>
              <div class="field-row"><span>Lead source</span><strong>${escapeHtml(sourceLabel(client))}</strong></div>
            </div>
            <div class="side-section">
              <h2>Labels</h2>
              <div class="button-row" style="justify-content:flex-start">${derivedClientChips(client) || chip("No labels", "info")}</div>
            </div>
            <div class="side-section">
              <h2>Last client communication</h2>
              <p class="muted">${escapeHtml(client.lastCommunication || "No contact yet")}</p>
            </div>
          </article>

          <article class="panel">
            <div class="panel-head"><h2>Billing history</h2>${button("New", "create-invoice", "small")}</div>
            <div class="panel-body empty">
              <div class="empty-icon">I</div>
              <div>
                <h3>${escapeHtml(client.billingHistory?.[0]?.invoice || "No billing history")}</h3>
                <p class="muted">${escapeHtml(client.billingHistory?.[0]?.detail || "This client has not been billed yet")}</p>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; background:var(--green-soft); padding:10px 14px; font-weight:950">
              <span>Current balance</span><span>${escapeHtml(client.balance || "GBP 0.00")}</span>
            </div>
          </article>

          <article class="panel pad">
            <h2>Internal notes</h2>
            <p class="muted" style="margin-top:8px">Only visible to your team.</p>
            <div class="inputish" style="height:auto; min-height:86px; margin-top:14px; align-items:flex-start; padding-top:10px">${escapeHtml(client.internalNote || "No internal note yet.")}</div>
          </article>
        </aside>
      </section>
    `;
  }

  function renderNoProperties() {
    return `<div class="empty mini"><div class="empty-icon">P</div><div><h3>No properties yet</h3><p class="muted">Add a property when a physical location is known.</p></div></div>`;
  }

  function renderPropertyWorkspace(property) {
    if (!property) {
      return `
        <article class="panel property-workspace">
          <div class="panel-head"><div><p class="eyebrow">Selected property workspace</p><h2>No property selected</h2></div></div>
          <div class="panel-body empty"><div class="empty-icon">P</div><div><h3>Property optional</h3><p class="muted">Create a client first, then attach a property when location details are known.</p></div></div>
        </article>
      `;
    }

    return `
      <article class="panel property-workspace">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Selected property workspace</p>
            <h2>${escapeHtml(propertyLabel(property))}</h2>
          </div>
          ${button("Create request", "create-request", "small primary")}
        </div>
        <div class="panel-body grid-2">
          <div>
            <h3>Property setup</h3>
            <div class="field-row"><span>Address</span><strong>${escapeHtml(property.address || "Not set")}</strong></div>
            <div class="field-row"><span>Property type</span><strong>${escapeHtml(propertyTypeLabel(property))}</strong></div>
            <div class="field-row"><span>Bedrooms</span><strong>${escapeHtml(labelFrom(bedroomsLabels, property.bedrooms, "Unknown"))}</strong></div>
            <div class="field-row"><span>Bathrooms</span><strong>${escapeHtml(labelFrom(bathroomsLabels, property.bathrooms, "Unknown"))}</strong></div>
            <div class="field-row"><span>Default service</span><strong>${escapeHtml(defaultServiceLabel(property))}</strong></div>
            <div class="field-row"><span>Cadence</span><strong>${escapeHtml(cadenceLabel(property))}</strong></div>
            <div class="field-row"><span>Preferred day</span><strong>${escapeHtml(labelFrom(dayLabels, property.preferred_day, "To confirm"))}</strong></div>
            <div class="field-row"><span>Time window</span><strong>${escapeHtml(labelFrom(timeWindowLabels, property.preferred_time_window, "To confirm"))}</strong></div>
          </div>
          <div>
            <h3>Practical details</h3>
            <div class="field-row"><span>Access</span><strong>${escapeHtml(labelFrom(accessLabels, property.access_method || property.access, "To arrange"))}</strong></div>
            <div class="field-row"><span>Parking</span><strong>${escapeHtml(labelFrom(parkingLabels, property.parking, "Unknown"))}</strong></div>
            <div class="field-row"><span>Pets</span><strong>${escapeHtml(labelFrom(petsLabels, property.pets_present, "Unknown"))}</strong></div>
            <div class="field-row"><span>Products</span><strong>${escapeHtml(labelFrom(supplyLabels, property.cleaning_products, "To confirm"))}</strong></div>
            <div class="field-row"><span>Vacuum / hoover</span><strong>${escapeHtml(labelFrom(supplyLabels, property.vacuum_hoover, "To confirm"))}</strong></div>
            <div class="field-row"><span>Mop</span><strong>${escapeHtml(labelFrom(supplyLabels, property.mop, "To confirm"))}</strong></div>
            <div class="field-row"><span>Property notes</span><strong>${escapeHtml(property.property_notes || "None")}</strong></div>
            <div class="field-row"><span>Cleaning notes</span><strong>${escapeHtml(property.cleaning_notes || "None")}</strong></div>
            <div class="field-row"><span>Next action</span><strong>${escapeHtml(property.next_action || property.nextAction || "No next action")}</strong></div>
          </div>
        </div>
      </article>
    `;
  }

  function renderTab(id, label) {
    return `<button class="tab${state.detailTab === id ? " active" : ""}" type="button" data-client-tab="${id}">${escapeHtml(label)}</button>`;
  }

  function renderWorkCard(item) {
    return `
      <article class="work-card">
        <div class="button-row" style="justify-content:space-between">
          <strong>${escapeHtml(item.type || item.number || "Item")} - ${escapeHtml(item.title)}</strong>
          ${chip(item.status, item.tone)}
        </div>
        ${item.amount ? `<span class="muted">${escapeHtml(item.amount)}</span>` : ""}
      </article>
    `;
  }

  function renderTabContent(client) {
    const tab = state.detailTab;
    if (tab === "active") return (client.activeWork || []).map(renderWorkCard).join("") || emptyWork("No active work", "Requests, quotes, jobs, and invoices will appear here.");
    if (tab === "requests") {
      const linkedRequests = (data.requests || []).filter((request) => request.client_id === client.id);
      if (linkedRequests.length) {
        const statusLabels = window.CleanOpsRequests?.labels?.requestStatusLabels || {};
        const statusTones = window.CleanOpsRequests?.labels?.requestStatusTones || {};
        return linkedRequests.map((request) => renderWorkCard({
          type: "Request",
          title: request.title,
          status: statusLabels[request.status] || request.status,
          tone: statusTones[request.status] || "info",
          number: request.number
        })).join("");
      }
      return (client.requests || []).map((item) => renderWorkCard({ ...item, type: "Request" })).join("") || emptyWork("No requests", "Manual requests from this client will attach here.");
    }
    if (tab === "quotes") return (client.quotes || []).map((item) => renderWorkCard({ ...item, type: "Quote" })).join("") || emptyWork("No quotes", "Quotes can be created from a known client and property.");
    if (tab === "jobs") return (client.jobs || []).map((item) => renderWorkCard({ ...item, type: "Job" })).join("") || emptyWork("No jobs", "Accepted work will appear here.");
    return (client.invoices || []).map((item) => renderWorkCard({ ...item, type: "Invoice", title: `${item.number} - ${item.title}` })).join("") ||
      emptyWork("No invoices", "Uninvoiced work and billable events will be introduced here later.");
  }

  function emptyWork(title, copy) {
    return `<div class="empty mini"><div class="empty-icon">OK</div><div><h3>${escapeHtml(title)}</h3><p class="muted">${escapeHtml(copy)}</p></div></div>`;
  }

  function renderMoreMenu(client, property) {
    const createItems = ["Request", "Quote", "Job", "Invoice", "Task", "Calendar event", "Property"];
    const toolItems = ["Show on map", "Archive client", "Download/export client"];
    const itemButton = (label) => `<button type="button" data-client-more="${escapeHtml(label)}">${escapeHtml(label)}</button>`;
    return `
      <div class="client-more-menu" role="menu">
        <p class="eyebrow">Create new</p>
        ${createItems.map(itemButton).join("")}
        <p class="eyebrow">Client tools</p>
        ${toolItems.map(itemButton).join("")}
        <p class="muted menu-context">Context: ${escapeHtml(displayName(client))}${property ? ` / ${escapeHtml(propertyLabel(property))}` : ""}</p>
      </div>
    `;
  }

  function renderNewClientModal() {
    return `
      <div class="client-modal-backdrop" data-client-backdrop="true">
        <section class="client-modal" role="dialog" aria-modal="true" aria-label="New Client" data-client-modal="true">
          <div class="drawer-header">
            <div>
              <p class="eyebrow">Manual client shell</p>
              <h2>New Client</h2>
            </div>
            <button class="icon-button" type="button" data-client-action="close-new-client" aria-label="Close new client form" title="Close"><span>X</span></button>
          </div>

          <div class="client-form-grid">
            <label class="client-field">Client name <input id="new-client-name" type="text" autocomplete="off" required></label>
            <label class="client-field">Company name <input id="new-client-company" type="text" autocomplete="off"></label>
            <label class="client-field">Phone <input id="new-client-phone" type="tel" autocomplete="off"></label>
            <label class="client-field">Email <input id="new-client-email" type="email" autocomplete="off"></label>
            <label class="client-field">Lead source
              <select id="new-client-source">
                <option value="manual">Manual</option>
                <option value="website_enquiry">Website enquiry</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="referral">Referral</option>
                <option value="repeat_customer">Repeat customer</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label class="client-field">Client status
              <select id="new-client-status">
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="active_client">Active client</option>
                <option value="commercial">Commercial</option>
                <option value="paused">Paused</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label class="client-field wide">Billing address <input id="new-client-billing" type="text" autocomplete="off"></label>
            <label class="schedule-check wide"><input id="new-client-billing-same" type="checkbox" checked><span>Billing same as main address if a property is added</span></label>
            <label class="client-field wide">Internal note <textarea id="new-client-note" rows="3"></textarea></label>
          </div>

          <div class="client-form-section">
            <label class="schedule-check"><input id="new-client-add-property" type="checkbox"><span>Add first property?</span></label>
            <div class="client-form-grid">
              <label class="client-field">Property name / label <input id="new-property-name" type="text" autocomplete="off"></label>
              <label class="client-field">Property type
                <select id="new-property-type">
                  <option value="unknown">To confirm</option>
                  <option value="domestic_house">Domestic house</option>
                  <option value="flat_apartment">Flat / apartment</option>
                  <option value="studio_annexe">Studio / annexe</option>
                  <option value="commercial_office">Commercial office</option>
                  <option value="commercial_unit">Commercial unit</option>
                  <option value="holiday_let_airbnb">Holiday let / Airbnb</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label class="client-field wide">Property address <input id="new-property-address" type="text" autocomplete="off"></label>
              <label class="client-field wide">Property notes <textarea id="new-property-notes" rows="2"></textarea></label>
            </div>
          </div>

          <div class="drawer-actions">
            <button class="button primary" type="button" data-client-action="save-new-client">Save client</button>
            <button class="button ghost" type="button" data-client-action="close-new-client">Cancel</button>
          </div>
        </section>
      </div>
    `;
  }

  function refresh() {
    const root = document.getElementById("page-root");
    if (root?.querySelector("[data-clients-root]")) root.innerHTML = render();
  }

  function value(id) {
    return document.getElementById(id)?.value?.trim() || "";
  }

  function saveNewClient() {
    const name = value("new-client-name");
    const phone = value("new-client-phone");
    const email = value("new-client-email");
    if (!name) {
      toast("Client name is required.");
      return;
    }
    if (!phone && !email) {
      toast("Add at least one contact method.");
      return;
    }

    const addProperty = document.getElementById("new-client-add-property")?.checked;
    const propertyName = value("new-property-name");
    const propertyAddress = value("new-property-address");
    const propertyType = value("new-property-type");
    const propertyId = `PROP-${Date.now()}`;
    const properties = addProperty ? [{
      id: propertyId,
      label: propertyName || propertyAddress || "Main property",
      address: propertyAddress,
      area: "",
      postcode: "",
      property_type: propertyType || "unknown",
      bedrooms: "unknown",
      bathrooms: "unknown",
      default_service_type: "to_confirm",
      default_cadence: "to_confirm",
      preferred_day: "to_confirm",
      preferred_time_window: "to_confirm",
      access_method: "to_arrange",
      parking: "unknown",
      pets_present: "unknown",
      cleaning_products: "to_confirm",
      vacuum_hoover: "to_confirm",
      mop: "to_confirm",
      property_notes: value("new-property-notes"),
      cleaning_notes: "",
      next_action: "Create request if service scope is needed"
    }] : [];
    const status = value("new-client-status") || "lead";
    const billingSame = document.getElementById("new-client-billing-same")?.checked;
    const client = {
      id: `client-${Date.now()}`,
      initials: initials(name),
      display_name: name,
      name,
      client_type: value("new-client-company") ? "company" : "individual",
      company_name: value("new-client-company"),
      company: value("new-client-company"),
      first_name: name.split(/\s+/)[0] || "",
      last_name: name.split(/\s+/).slice(1).join(" "),
      status,
      statusTone: statusTone(status),
      lead_source: value("new-client-source") || "manual",
      email,
      phone,
      balance: "GBP 0.00",
      mainProperty: properties[0]?.label || "No property yet",
      area: properties[0]?.address || "",
      activeSummary: "Client shell",
      lastCommunication: "Just now",
      internalNote: value("new-client-note") || "Manual client created in CleanOps prototype.",
      billingAddress: value("new-client-billing") || (billingSame ? properties[0]?.address || "" : ""),
      properties,
      activeWork: [],
      requests: [],
      quotes: [],
      jobs: [],
      invoices: [],
      billingHistory: [
        { invoice: "No billing history", detail: "This client has not been billed yet", amount: "GBP 0.00" }
      ]
    };

    data.clients.unshift(client);
    state.selectedClientId = client.id;
    state.selectedPropertyByClient[client.id] = properties[0]?.id;
    state.detailTab = "active";
    state.newClientOpen = false;
    state.moreOpen = false;
    toast(`Created ${displayName(client)}.`);
    refresh();
  }

  function handleClick(event) {
    const routeTarget = event.target.closest("[data-route='clients']");
    if (routeTarget) {
      state.selectedClientId = null;
      state.moreOpen = false;
      return false;
    }

    const modal = event.target.closest("[data-client-modal]");
    const actionTarget = event.target.closest("[data-client-action]");
    if (event.target.closest("[data-client-backdrop]") && !modal) {
      state.newClientOpen = false;
      refresh();
      return true;
    }

    const clientId = event.target.closest("[data-client-id]")?.dataset.clientId;
    if (clientId) {
      state.selectedClientId = clientId;
      state.detailTab = "active";
      state.moreOpen = false;
      refresh();
      return true;
    }

    const propertyId = event.target.closest("[data-client-property-id]")?.dataset.clientPropertyId;
    if (propertyId) {
      const client = selectedClient();
      if (client) state.selectedPropertyByClient[client.id] = propertyId;
      refresh();
      return true;
    }

    const tab = event.target.closest("[data-client-tab]")?.dataset.clientTab;
    if (tab) {
      state.detailTab = tab;
      refresh();
      return true;
    }

    const moreAction = event.target.closest("[data-client-more]")?.dataset.clientMore;
    if (moreAction) {
      const client = selectedClient();
      const property = selectedProperty(client);
      state.moreOpen = false;
      toast(`${moreAction} is mocked for ${client ? displayName(client) : "client"}${property ? ` / ${propertyLabel(property)}` : ""}.`);
      refresh();
      return true;
    }

    if (!actionTarget) return false;
    const action = actionTarget.dataset.clientAction;
    if (action === "open-new-client") {
      state.newClientOpen = true;
      refresh();
      return true;
    }
    if (action === "close-new-client") {
      state.newClientOpen = false;
      refresh();
      return true;
    }
    if (action === "save-new-client") {
      saveNewClient();
      return true;
    }
    if (action === "back-to-list") {
      state.selectedClientId = null;
      state.moreOpen = false;
      refresh();
      return true;
    }
    if (action === "toggle-more") {
      state.moreOpen = !state.moreOpen;
      refresh();
      return true;
    }

    const client = selectedClient();
    const property = selectedProperty(client);
    toast(`${action.replace(/-/g, " ")} is mocked for ${client ? displayName(client) : "client"}${property ? ` / ${propertyLabel(property)}` : ""}.`);
    return true;
  }

  document.addEventListener("click", handleClick);

  window.CleanOpsClients = {
    render,
    handleClick
  };
})();
