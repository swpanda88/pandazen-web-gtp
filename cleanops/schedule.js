(function () {
  const source = window.CLEANOPS_DATA.scheduleV0;
  const startHour = 6;
  const endHour = 18;
  const minuteHeight = 1.05;
  const minDuration = 30;
  const scheduleTypes = [
    { label: "Cleaning visit", className: "type-cleaning-visit" },
    { label: "Quote / assessment", className: "type-quote-assessment" },
    { label: "Request / enquiry", className: "type-request-enquiry" },
    { label: "Task / reminder", className: "type-task-reminder" },
    { label: "Issue / revisit", className: "type-issue-revisit" },
    { label: "Commercial / special", className: "type-commercial-special" }
  ];
  const statusOptions = ["Scheduled", "Completed", "Unassigned", "Overdue", "Issue / warning"];
  const state = {
    view: "week",
    rangeLabel: source.rangeLabel,
    selectedDayIndex: source.selectedDayIndex,
    showWeekends: true,
    filtersOpen: false,
    viewMenuOpen: false,
    moreMenuOpen: false,
    activeTypes: new Set(typeLabels()),
    activeStatuses: new Set(statusOptions),
    activeTeams: new Set(teamOptions()),
    visits: structuredCloneSafe(source.scheduledVisits),
    unscheduled: structuredCloneSafe(source.unscheduled),
    resizing: null,
    popoverDrag: null
  };

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

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

  function typeLabels() {
    return scheduleTypes.map((type) => type.label);
  }

  function typeDefinition(label) {
    return scheduleTypes.find((type) => type.label === label) || scheduleTypes[0];
  }

  function typeClass(label) {
    return typeDefinition(label).className;
  }

  function isCompleted(item) {
    return item.completed || item.statusGroup === "Completed" || item.status === "Completed";
  }

  function hasRiskAccent(item) {
    return !isCompleted(item) && (
      item.statusGroup === "Unassigned" ||
      item.statusGroup === "Overdue" ||
      item.status === "Unassigned" ||
      item.status === "Overdue" ||
      item.team === "Unassigned"
    );
  }

  function isUnassigned(item) {
    const team = String(item.team || "").trim().toLowerCase();
    return !team || team === "unassigned" || team === "team needed";
  }

  function scheduleItemClasses(item) {
    const classes = [typeClass(item.type)];
    if (isCompleted(item)) classes.push("status-completed");
    if (hasRiskAccent(item)) classes.push("status-risk");
    return classes.join(" ");
  }

  function typeLegend(label) {
    return `
      <span class="type-filter-label">
        <span class="schedule-type-dot ${escapeHtml(typeClass(label))}" aria-hidden="true"></span>
        <span>${escapeHtml(label)}</span>
      </span>
    `;
  }

  function typePill(label) {
    return `<span class="type-pill ${escapeHtml(typeClass(label))}">${escapeHtml(label)}</span>`;
  }

  function normaliseWarning(warning) {
    return String(warning || "").trim() === "No cleaner" ? "Unassigned" : String(warning || "").trim();
  }

  function visitPopoverChips(visit) {
    const chips = [];
    const seen = new Set();
    const addChip = (label, tone) => {
      const cleanLabel = normaliseWarning(label);
      if (!cleanLabel || seen.has(cleanLabel)) return;
      seen.add(cleanLabel);
      chips.push(chip(cleanLabel, tone));
    };

    if (isCompleted(visit)) {
      addChip("Completed", "muted");
    } else {
      if (visit.statusGroup === "Overdue" || visit.status === "Overdue") addChip("Overdue", "danger");
      if (isUnassigned(visit) || visit.statusGroup === "Unassigned" || visit.status === "Unassigned") {
        addChip("Unassigned", "danger");
      }
      if (visit.type === "Issue / revisit") {
        addChip("Issue / revisit", "danger");
      } else if (visit.statusGroup === "Issue / warning") {
        addChip("Issue", "warning");
      }
    }

    (visit.warnings || []).some((warning) => {
      if (chips.length >= 3) return true;
      const cleanWarning = normaliseWarning(warning);
      if (cleanWarning === visit.type || cleanWarning === visit.status || cleanWarning === visit.statusGroup) return false;
      if (cleanWarning === "Request" || cleanWarning === "No cleaner") return false;
      addChip(cleanWarning, cleanWarning === "Unassigned" ? "danger" : "warning");
      return false;
    });

    return chips.join("");
  }

  function cardStatusChip(item) {
    if (isCompleted(item)) return chip("Completed", "muted");
    if (item.statusGroup === "Overdue" || item.status === "Overdue") return chip("Overdue", "danger");
    if (isUnassigned(item) || item.statusGroup === "Unassigned" || item.status === "Unassigned") return chip("Unassigned", "danger");
    if (item.type === "Issue / revisit") return chip("Issue", "danger");
    if (item.statusGroup === "Issue / warning") return chip(normaliseWarning(item.warnings?.[0] || item.status || "Check"), "warning");
    return "";
  }

  function gridStatusChip(item) {
    if (isCompleted(item)) return chip("Completed", "muted");
    if (item.statusGroup === "Overdue" || item.status === "Overdue") return chip("Overdue", "danger");
    if (isUnassigned(item) || item.statusGroup === "Unassigned" || item.status === "Unassigned") return chip("Unassigned", "danger");
    if (item.type === "Issue / revisit" || item.statusGroup === "Issue / warning") return chip("Issue", "danger");
    return "";
  }

  function button(label, action, variant = "") {
    const classes = ["button", variant].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-schedule-action="${escapeHtml(action || label)}">${escapeHtml(label)}</button>`;
  }

  function toast(message) {
    window.CleanOpsShell?.toast?.(message);
  }

  function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  function displayTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    const suffix = hours >= 12 ? "pm" : "am";
    const hour = hours % 12 || 12;
    return `${hour}:${String(minutes).padStart(2, "0")}${suffix}`;
  }

  function timeRange(visit) {
    const start = timeToMinutes(visit.start);
    return `${displayTime(visit.start)} - ${displayTime(minutesToTime(start + visit.duration))}`;
  }

  function visibleDays() {
    return source.days.filter((day) => state.showWeekends || !day.weekend);
  }

  function visitMatches(visit) {
    return state.activeTypes.has(visit.type) &&
      state.activeStatuses.has(visit.statusGroup) &&
      state.activeTeams.has(visit.team || "Unassigned");
  }

  function visibleVisits() {
    return state.visits.filter(visitMatches);
  }

  function visibleUnscheduled() {
    return state.unscheduled.filter((visit) =>
      state.activeTypes.has(visit.type) && state.activeStatuses.has(visit.statusGroup)
    );
  }

  function teamOptions() {
    const teams = [...source.scheduledVisits, ...source.unscheduled]
      .map((visit) => visit.team || "Unassigned");
    return Array.from(new Set(teams)).sort((a, b) => a.localeCompare(b));
  }

  function slotTimes() {
    const times = [];
    for (let minutes = startHour * 60; minutes <= endHour * 60; minutes += 30) {
      times.push(minutesToTime(minutes));
    }
    return times;
  }

  function layoutVisitsForDay(visits) {
    const sorted = [...visits].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    const clusters = [];
    let current = [];
    let clusterEnd = -1;

    sorted.forEach((visit) => {
      const start = timeToMinutes(visit.start);
      const end = start + visit.duration;
      if (!current.length || start < clusterEnd) {
        current.push(visit);
        clusterEnd = Math.max(clusterEnd, end);
      } else {
        clusters.push(current);
        current = [visit];
        clusterEnd = end;
      }
    });
    if (current.length) clusters.push(current);

    const layout = new Map();
    clusters.forEach((cluster) => {
      const columns = [];
      cluster.forEach((visit) => {
        const start = timeToMinutes(visit.start);
        const end = start + visit.duration;
        let columnIndex = columns.findIndex((columnEnd) => columnEnd <= start);
        if (columnIndex === -1) {
          columnIndex = columns.length;
          columns.push(end);
        } else {
          columns[columnIndex] = end;
        }
        layout.set(visit.id, { columnIndex, columnCount: 1 });
      });
      const columnCount = Math.max(1, columns.length);
      cluster.forEach((visit) => {
        layout.get(visit.id).columnCount = columnCount;
      });
    });

    return layout;
  }

  function controls() {
    const viewLabel = state.view.charAt(0).toUpperCase() + state.view.slice(1);
    return `
      <div class="schedule-toolbar">
        <div class="schedule-toolbar-group">
          ${button("Today", "today", "small")}
          <button class="button small icon-only-button" type="button" data-schedule-action="previous" aria-label="Previous date range" title="Previous date range">&lt;</button>
          <button class="button small icon-only-button" type="button" data-schedule-action="next" aria-label="Next date range" title="Next date range">&gt;</button>
          <button class="button small schedule-date-button" type="button" data-schedule-action="date-range" title="Date range">${escapeHtml(state.rangeLabel)}</button>
        </div>
        <div class="schedule-toolbar-group">
          <div class="schedule-menu-wrap">
            <button class="button small" type="button" data-schedule-action="toggle-view-menu" aria-expanded="${state.viewMenuOpen}" title="Choose schedule view">${escapeHtml(viewLabel)} <span aria-hidden="true">v</span></button>
            ${state.viewMenuOpen ? viewMenu() : ""}
          </div>
          <div class="schedule-menu-wrap">
            <button class="button small" type="button" data-schedule-action="toggle-filters" aria-expanded="${state.filtersOpen}" title="Schedule filters">Filters ${chip(filtersActiveLabel(), "success")} <span aria-hidden="true">v</span></button>
            ${state.filtersOpen ? filtersMenu() : ""}
          </div>
          <div class="schedule-menu-wrap">
            <button class="button small" type="button" data-schedule-action="toggle-more-menu" aria-expanded="${state.moreMenuOpen}" title="More actions">More actions <span aria-hidden="true">v</span></button>
            ${state.moreMenuOpen ? moreMenu() : ""}
          </div>
          ${button("New visit", "new-visit", "small primary")}
        </div>
      </div>
    `;
  }

  function filtersActiveLabel() {
    return state.showWeekends ? "On" : "Weekdays";
  }

  function viewMenu() {
    return `
      <div class="schedule-dropdown compact" role="menu">
        ${["month", "week", "day", "map", "list"].map((view) => `
          <button type="button" class="${state.view === view ? "selected" : ""}" data-schedule-view="${view}">
            ${escapeHtml(view.charAt(0).toUpperCase() + view.slice(1))}
          </button>
        `).join("")}
      </div>
    `;
  }

  function moreMenu() {
    return `
      <div class="schedule-dropdown compact" role="menu">
        <button type="button" data-schedule-action="route-placeholder">Route preview</button>
        <button type="button" data-schedule-action="print-placeholder">Print schedule</button>
        <button type="button" data-schedule-action="settings-placeholder">Schedule settings</button>
      </div>
    `;
  }

  function filtersMenu() {
    const typeOptions = typeLabels();
    return `
      <div class="schedule-dropdown filters-menu" role="menu">
        <div class="filters-menu-head">
          <strong>Filters</strong>
          <button type="button" data-schedule-action="clear-filters">Clear filters</button>
        </div>
        <div class="filter-section">
          <p class="eyebrow">Types</p>
          <button type="button" class="filter-all-button" data-schedule-action="all-types">All types</button>
          ${typeOptions.map((type) => filterOption("type", type, state.activeTypes.has(type))).join("")}
        </div>
        <div class="filter-section">
          <p class="eyebrow">Status</p>
          <button type="button" class="filter-all-button" data-schedule-action="all-statuses">All statuses</button>
          ${statusOptions.map((status) => filterOption("status", status, state.activeStatuses.has(status))).join("")}
        </div>
        <div class="filter-section">
          <p class="eyebrow">Assigned person / team</p>
          <button type="button" class="filter-all-button" data-schedule-action="all-teams">All teams</button>
          ${teamOptions().map((team) => filterOption("team", team, state.activeTeams.has(team))).join("")}
          <p class="muted filter-note">The Unscheduled rail keeps all matching unscheduled work visible so office staff can still place it.</p>
        </div>
        <div class="filter-section">
          <p class="eyebrow">Days</p>
          <label class="schedule-check">
            <input type="checkbox" data-schedule-filter="weekends" ${state.showWeekends ? "checked" : ""}>
            <span>Show/hide weekends</span>
          </label>
        </div>
      </div>
    `;
  }

  function filterOption(group, value, checked) {
    const label = group === "type" ? typeLegend(value) : `<span>${escapeHtml(value)}</span>`;
    return `
      <div class="filter-option-row">
        <label class="schedule-check">
          <input type="checkbox" data-schedule-filter="${group}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}>
          ${label}
        </label>
        <button type="button" data-schedule-filter-only="${escapeHtml(group)}" data-schedule-filter-value="${escapeHtml(value)}">Only</button>
      </div>
    `;
  }

  function unscheduledPanel() {
    const items = visibleUnscheduled();
    return `
      <aside class="unscheduled-panel" data-unscheduled-drop="true">
        <div class="unscheduled-head">
          <div>
            <p class="eyebrow">Schedule queue</p>
            <h2>Unscheduled work</h2>
          </div>
          ${chip(`${items.length}`, "info")}
        </div>
        <p class="muted">Mock holding area for work that still needs a date, time, or team.</p>
        <div class="unscheduled-list">
          ${items.map((item) => unscheduledCard(item)).join("") || `<div class="empty mini"><div class="empty-icon">OK</div><div><h3>No unscheduled work</h3><p class="muted">Everything visible is placed.</p></div></div>`}
        </div>
      </aside>
    `;
  }

  function unscheduledCard(item) {
    const status = cardStatusChip(item);
    return `
      <article class="unscheduled-card ${escapeHtml(scheduleItemClasses(item))}" draggable="true" data-unscheduled-id="${escapeHtml(item.id)}" title="Drag into schedule">
        <div class="schedule-card-top">
          <strong>${escapeHtml(item.client)}</strong>
          ${status || chip(item.status, item.tone)}
        </div>
        <span class="schedule-card-location">${escapeHtml(item.property)}</span>
        <div class="schedule-card-meta">
          ${typePill(item.type)}
          <span>${escapeHtml(item.service)}</span>
        </div>
        ${item.warnings?.length ? `<div class="schedule-card-warning">${escapeHtml(normaliseWarning(item.warnings[0]))}</div>` : ""}
      </article>
    `;
  }

  function scheduledCard(visit, mode = "week", layout = { columnIndex: 0, columnCount: 1 }) {
    const top = Math.max(0, (timeToMinutes(visit.start) - startHour * 60) * minuteHeight);
    const height = Math.max(34, visit.duration * minuteHeight - 4);
    const overlapStyle = layout.columnCount > 1
      ? `left:calc(8px + ${layout.columnIndex} * ((100% - 16px) / ${layout.columnCount}));width:calc((100% - 16px) / ${layout.columnCount} - 4px);right:auto;`
      : "left:8px;right:8px;";
    const status = gridStatusChip(visit);
    return `
      <article class="schedule-visit-card ${escapeHtml(scheduleItemClasses(visit))} ${mode}" draggable="true"
        data-visit-id="${escapeHtml(visit.id)}"
        data-overlap-count="${layout.columnCount}"
        style="top:${top}px;height:${height}px;${overlapStyle}"
        title="${escapeHtml(visit.client)} ${escapeHtml(timeRange(visit))}">
        <div class="schedule-card-top">
          <strong>${escapeHtml(timeRange(visit))}</strong>
          ${status}
        </div>
        <span class="schedule-card-title">${escapeHtml(visit.client)}</span>
        <span class="schedule-card-location">${escapeHtml(visit.property)}</span>
        <span class="schedule-card-meta">${escapeHtml(visit.service)}</span>
        ${visit.warnings?.length && !status ? `<span class="schedule-card-warning">${escapeHtml(normaliseWarning(visit.warnings[0]))}</span>` : ""}
        <span class="resize-handle top" data-resize-id="${escapeHtml(visit.id)}" data-resize-edge="top" title="Resize start time" aria-hidden="true"></span>
        <span class="resize-handle bottom" data-resize-id="${escapeHtml(visit.id)}" data-resize-edge="bottom" title="Resize end time" aria-hidden="true"></span>
      </article>
    `;
  }

  function weekView() {
    const days = visibleDays();
    return `
      <div class="schedule-layout">
        <section class="schedule-main panel">
          ${controls()}
          <div class="week-calendar" style="--day-count:${days.length}">
            <div class="week-head time-spacer"></div>
            ${days.map((day) => `<div class="week-head ${day.today ? "today" : ""}"><strong>${escapeHtml(day.short)}</strong><span>${escapeHtml(day.label.split(" ")[1])}</span></div>`).join("")}
            <div class="time-rail">
              ${slotTimes().map((time) => `<div class="time-label ${time.endsWith(":30") ? "half-hour" : ""}">${time.endsWith(":00") ? displayTime(time) : ""}</div>`).join("")}
            </div>
            ${days.map((day) => dayColumn(day, "week")).join("")}
          </div>
        </section>
        ${unscheduledPanel()}
      </div>
      <div id="schedule-popover-root"></div>
    `;
  }

  function dayColumn(day, mode) {
    const visits = visibleVisits().filter((visit) => visit.dayIndex === day.index);
    const layout = layoutVisitsForDay(visits);
    return `
      <div class="schedule-day-column ${day.today ? "today" : ""}" data-day-index="${day.index}">
        ${slotTimes().map((time) => `<div class="schedule-drop-slot ${time.endsWith(":30") ? "half-hour" : ""}" data-day-index="${day.index}" data-time="${time}" title="${escapeHtml(day.short)} ${escapeHtml(time)}"></div>`).join("")}
        ${visits.map((visit) => scheduledCard(visit, mode, layout.get(visit.id))).join("")}
      </div>
    `;
  }

  function dayView() {
    const day = source.days.find((item) => item.index === state.selectedDayIndex) || source.days[3];
    return `
      <div class="schedule-layout">
        <section class="schedule-main panel">
          ${controls()}
          <div class="day-calendar">
            <div class="day-title"><h2>${escapeHtml(day.label)}</h2><span class="muted">Team timeline</span></div>
            <div class="day-grid">
              <div class="time-rail">${slotTimes().map((time) => `<div class="time-label ${time.endsWith(":30") ? "half-hour" : ""}">${time.endsWith(":00") ? displayTime(time) : ""}</div>`).join("")}</div>
              ${dayColumn(day, "day")}
            </div>
          </div>
        </section>
        ${unscheduledPanel()}
      </div>
      <div id="schedule-popover-root"></div>
    `;
  }

  function monthView() {
    const monthItems = new Map(source.month.map((item) => [item.day, item]));
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].filter((_, index) => state.showWeekends || index < 5);
    const cells = Array.from({ length: 35 }, (_, index) => index + 1)
      .filter((day) => state.showWeekends || ((day - 1) % 7) < 5);
    return `
      <div class="schedule-layout">
        <section class="schedule-main panel">
          ${controls()}
          <div class="month-grid" style="--month-cols:${weekdays.length}">
            ${weekdays.map((day) => `<div class="month-weekday">${day}</div>`).join("")}
            ${cells.map((day) => {
              const item = monthItems.get(day);
              return `<div class="month-cell ${day === 11 ? "today" : ""}">
                <strong>${day}</strong>
                ${item ? `<div class="month-summary ${escapeHtml(typeClass(item.type))}"><span>${escapeHtml(item.text)}</span>${item.count > 1 ? chip(`${item.count}`, "info") : ""}</div>` : ""}
              </div>`;
            }).join("")}
          </div>
        </section>
        ${unscheduledPanel()}
      </div>
    `;
  }

  function listView() {
    const visitById = new Map(state.visits.map((visit) => [visit.id, visit]));
    return `
      <section class="panel">
        ${controls()}
        <div class="schedule-list">
          ${source.listGroups.map((group) => {
            const visits = group.ids.map((id) => visitById.get(id)).filter(Boolean).filter(visitMatches);
            return `
              <section class="list-group">
                <h2>${escapeHtml(group.label)}</h2>
                ${visits.length ? listTable(visits) : `<p class="muted">No visible items in this group.</p>`}
              </section>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }

  function listTable(visits) {
    return `
      <table>
        <thead><tr><th></th><th>Client</th><th>Property</th><th>Service</th><th>Date/time</th><th>Team</th><th>Status</th></tr></thead>
        <tbody>
          ${visits.map((visit) => {
            const day = source.days.find((item) => item.index === visit.dayIndex);
            return `<tr class="${escapeHtml(scheduleItemClasses(visit))}">
              <td><input type="checkbox" ${visit.completed ? "checked" : ""} data-schedule-complete="${escapeHtml(visit.id)}" aria-label="Complete ${escapeHtml(visit.client)}"></td>
              <td>${escapeHtml(visit.client)}</td>
              <td>${escapeHtml(visit.property)}</td>
              <td><div class="type-cell">${typePill(visit.type)}<span>${escapeHtml(visit.service)}</span></div></td>
              <td>${escapeHtml(day?.label || "")} ${escapeHtml(timeRange(visit))}</td>
              <td>${escapeHtml(visit.team)}</td>
              <td>${chip(visit.status, visit.tone)}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  function mapView() {
    const visits = visibleVisits();
    return `
      <section class="panel">
        ${controls()}
        <div class="map-shell">
          <aside class="map-list">
            <h2>Visits</h2>
            ${visits.map((visit) => `
              <button type="button" class="${escapeHtml(scheduleItemClasses(visit))}" data-visit-id="${escapeHtml(visit.id)}">
                <strong>${escapeHtml(visit.client)}</strong>
                <span>${escapeHtml(visit.property)}</span>
                ${typePill(visit.type)}
                ${chip(visit.status, visit.tone)}
              </button>
            `).join("")}
          </aside>
          <div class="mock-map" aria-label="Mock map view">
            <div class="mock-map-grid"></div>
            ${visits.map((visit, index) => `<button class="map-pin ${escapeHtml(scheduleItemClasses(visit))}" style="left:${visit.map?.x || 40}%;top:${visit.map?.y || 40}%" data-visit-id="${escapeHtml(visit.id)}" title="${escapeHtml(visit.client)}">${index + 1}</button>`).join("")}
            <div class="map-note">
              <strong>Mock map</strong>
              <span>No map API connected in v0.</span>
            </div>
          </div>
          <aside class="map-legend">
            <h2>Assignment</h2>
            <div class="field-row"><span>Visible visits</span><strong>${visits.length}</strong></div>
            <div class="field-row"><span>Unscheduled</span><strong>${visibleUnscheduled().length}</strong></div>
            <div class="field-row"><span>Route optimisation</span><strong>Later</strong></div>
          </aside>
        </div>
      </section>
      <div id="schedule-popover-root"></div>
    `;
  }

  function render() {
    if (state.view === "month") return monthView();
    if (state.view === "day") return dayView();
    if (state.view === "list") return listView();
    if (state.view === "map") return mapView();
    return weekView();
  }

  function refresh() {
    const root = document.getElementById("page-root");
    if (!root || !root.querySelector(".schedule-toolbar")) return;
    root.innerHTML = render();
  }

  function findVisit(id) {
    return state.visits.find((visit) => visit.id === id);
  }

  function scheduleUnscheduled(id, dayIndex, time) {
    const index = state.unscheduled.findIndex((item) => item.id === id);
    if (index < 0) return;
    const [item] = state.unscheduled.splice(index, 1);
    state.visits.push({
      ...item,
      id: `sv-${Date.now()}`,
      dayIndex: Number(dayIndex),
      start: time,
      status: "Scheduled",
      statusGroup: item.statusGroup === "Issue / warning" ? "Issue / warning" : "Scheduled",
      map: { x: 48, y: 48 }
    });
    toast(`Scheduled ${item.client} for ${dayLabel(dayIndex)} ${time}`);
    refresh();
  }

  function moveVisit(id, dayIndex, time) {
    const visit = findVisit(id);
    if (!visit) return;
    visit.dayIndex = Number(dayIndex);
    visit.start = time;
    toast(`Visit moved to ${dayLabel(dayIndex)} ${time}`);
    refresh();
  }

  function moveVisitToUnscheduled(id) {
    const index = state.visits.findIndex((visit) => visit.id === id);
    if (index < 0) return;
    const [visit] = state.visits.splice(index, 1);
    state.unscheduled.unshift({
      ...visit,
      id: `uv-${Date.now()}`,
      status: visit.statusGroup === "Issue / warning" ? visit.status : "Unscheduled",
      statusGroup: visit.statusGroup === "Issue / warning" ? "Issue / warning" : "Unassigned",
      dayIndex: undefined,
      start: undefined,
      map: undefined
    });
    toast("Visit moved to Unscheduled");
    refresh();
  }

  function dayLabel(dayIndex) {
    return source.days.find((day) => day.index === Number(dayIndex))?.short || "day";
  }

  function openPopover(visitId, target) {
    const visit = findVisit(visitId);
    const root = document.getElementById("schedule-popover-root");
    if (!visit || !root || !target) return;
    const statusChips = visitPopoverChips(visit);
    const rect = target.getBoundingClientRect();
    const left = Math.min(rect.left + window.scrollX + 12, window.scrollX + window.innerWidth - 310);
    const top = rect.top + window.scrollY - 10;
    root.innerHTML = `
      <aside class="visit-popover" style="left:${Math.max(12, left)}px;top:${Math.max(74, top)}px" role="dialog" aria-label="${escapeHtml(visit.client)} visit">
        <div class="visit-popover-bar" data-popover-drag="true">
          <strong>${escapeHtml(visit.client)}</strong>
          <button type="button" data-popover-close="true" aria-label="Close visit popover" title="Close">X</button>
        </div>
        <div class="visit-popover-body">
          <label class="schedule-check"><input type="checkbox" data-schedule-complete="${escapeHtml(visit.id)}" ${visit.completed ? "checked" : ""}><span>Completed</span></label>
          <div class="field-row"><span>Type</span><strong>${typePill(visit.type)}</strong></div>
          <div class="field-row"><span>Details</span><strong>${escapeHtml(visit.service)}</strong></div>
          <div class="field-row"><span>Team</span><strong>${escapeHtml(visit.team)}</strong></div>
          <div class="field-row"><span>Location</span><strong>${escapeHtml(visit.property)}</strong></div>
          <div class="field-row"><span>Starts</span><strong>${escapeHtml(displayTime(visit.start))}</strong></div>
          <div class="field-row"><span>Ends</span><strong>${escapeHtml(displayTime(minutesToTime(timeToMinutes(visit.start) + visit.duration)))}</strong></div>
          ${statusChips ? `<div class="button-row popover-chip-row">${statusChips}</div>` : ""}
          <div class="button-row">
            ${button("Edit", "edit-visit")}
            ${button("View details", "view-details", "primary")}
          </div>
        </div>
      </aside>
    `;
  }

  function closePopover() {
    const root = document.getElementById("schedule-popover-root");
    if (root) root.innerHTML = "";
    state.popoverDrag = null;
  }

  function startResize(visitId, edge, event) {
    const visit = findVisit(visitId);
    if (!visit) return;
    event.preventDefault();
    event.stopPropagation();
    const originalStart = timeToMinutes(visit.start);
    state.resizing = {
      visitId,
      edge,
      startY: event.clientY,
      originalStart,
      originalDuration: visit.duration,
      originalEnd: originalStart + visit.duration
    };
    document.body.classList.add("schedule-resizing");
  }

  function handleResizeMove(event) {
    if (state.popoverDrag) {
      const popover = document.querySelector(".visit-popover");
      if (!popover) return;
      const left = Math.max(8, event.clientX + window.scrollX - state.popoverDrag.offsetX);
      const top = Math.max(62, event.clientY + window.scrollY - state.popoverDrag.offsetY);
      popover.style.left = `${left}px`;
      popover.style.top = `${top}px`;
      return;
    }
    if (!state.resizing) return;
    const visit = findVisit(state.resizing.visitId);
    if (!visit) return;
    const deltaMinutes = Math.round((event.clientY - state.resizing.startY) / (minuteHeight * 30)) * 30;
    if (state.resizing.edge === "top") {
      const earliestStart = startHour * 60;
      const latestStart = state.resizing.originalEnd - minDuration;
      const newStart = Math.min(latestStart, Math.max(earliestStart, state.resizing.originalStart + deltaMinutes));
      visit.start = minutesToTime(newStart);
      visit.duration = state.resizing.originalEnd - newStart;
    } else {
      const latestEnd = endHour * 60 + 120;
      const newEnd = Math.max(
        state.resizing.originalStart + minDuration,
        Math.min(latestEnd, state.resizing.originalEnd + deltaMinutes)
      );
      visit.duration = newEnd - state.resizing.originalStart;
    }
    const card = document.querySelector(`[data-visit-id="${state.resizing.visitId}"]`);
    if (card) {
      card.style.top = `${Math.max(0, (timeToMinutes(visit.start) - startHour * 60) * minuteHeight)}px`;
      card.style.height = `${Math.max(34, visit.duration * minuteHeight - 4)}px`;
      card.title = `${visit.client} ${timeRange(visit)}`;
      const range = card.querySelector("strong");
      if (range) range.textContent = timeRange(visit);
    }
  }

  function finishResize() {
    if (state.popoverDrag) {
      state.popoverDrag = null;
      return;
    }
    if (!state.resizing) return;
    const visit = findVisit(state.resizing.visitId);
    if (visit) toast(`${visit.client} now ${timeRange(visit)}`);
    state.resizing = null;
    document.body.classList.remove("schedule-resizing");
    refresh();
  }

  function onDocumentClick(event) {
    const scheduleRoot = event.target.closest(".schedule-toolbar, .schedule-main, .unscheduled-panel, .visit-popover, .map-shell");
    if (!scheduleRoot) {
      const needsRefresh = state.filtersOpen || state.viewMenuOpen || state.moreMenuOpen;
      closePopover();
      state.filtersOpen = false;
      state.viewMenuOpen = false;
      state.moreMenuOpen = false;
      if (needsRefresh) refresh();
      return;
    }

    const viewButton = event.target.closest("[data-schedule-view]");
    if (viewButton) {
      state.view = viewButton.dataset.scheduleView;
      state.viewMenuOpen = false;
      refresh();
      return;
    }

    if (event.target.closest("[data-popover-close]")) {
      closePopover();
      return;
    }

    const onlyFilterButton = event.target.closest("[data-schedule-filter-only]");
    if (onlyFilterButton) {
      const group = onlyFilterButton.dataset.scheduleFilterOnly;
      const value = onlyFilterButton.dataset.scheduleFilterValue;
      setOnlyFilter(group, value);
      toast(`Showing only ${value}`);
      refresh();
      return;
    }

    const action = event.target.closest("[data-schedule-action]");
    if (action) {
      handleAction(action.dataset.scheduleAction);
      return;
    }

    const visitTarget = event.target.closest("[data-visit-id]");
    if (visitTarget && !event.target.closest(".resize-handle")) {
      openPopover(visitTarget.dataset.visitId, visitTarget);
    }
  }

  function handleAction(action) {
    if (action === "toggle-view-menu") {
      state.viewMenuOpen = !state.viewMenuOpen;
      state.filtersOpen = false;
      state.moreMenuOpen = false;
      refresh();
      return;
    }
    if (action === "toggle-filters") {
      state.filtersOpen = !state.filtersOpen;
      state.viewMenuOpen = false;
      state.moreMenuOpen = false;
      refresh();
      return;
    }
    if (action === "toggle-more-menu") {
      state.moreMenuOpen = !state.moreMenuOpen;
      state.viewMenuOpen = false;
      state.filtersOpen = false;
      refresh();
      return;
    }
    if (action === "previous" || action === "next" || action === "today") {
      state.rangeLabel = action === "today" ? source.rangeLabel : `${action === "previous" ? "Previous" : "Next"} mock range`;
      toast(action === "today" ? "Returned to this week" : `${state.rangeLabel} selected`);
      refresh();
      return;
    }
    if (action === "clear-filters") {
      state.activeTypes = new Set(typeLabels());
      state.activeStatuses = new Set(statusOptions);
      state.activeTeams = new Set(teamOptions());
      state.showWeekends = true;
      toast("Schedule filters cleared");
      refresh();
      return;
    }
    if (action === "all-types") {
      state.activeTypes = new Set(typeLabels());
      toast("Showing all types");
      refresh();
      return;
    }
    if (action === "all-statuses") {
      state.activeStatuses = new Set(statusOptions);
      toast("Showing all statuses");
      refresh();
      return;
    }
    if (action === "all-teams") {
      state.activeTeams = new Set(teamOptions());
      toast("Showing all teams");
      refresh();
      return;
    }
    toast(`${action.replace(/-/g, " ")} is mocked for Schedule v0.`);
  }

  function setOnlyFilter(group, value) {
    if (group === "type") {
      state.activeTypes = new Set([value]);
      return;
    }
    if (group === "team") {
      state.activeTeams = new Set([value]);
      return;
    }
    state.activeStatuses = new Set([value]);
  }

  function onDocumentChange(event) {
    const filter = event.target.closest("[data-schedule-filter]");
    if (filter) {
      if (filter.dataset.scheduleFilter === "weekends") {
        state.showWeekends = filter.checked;
      } else {
        const set = filter.dataset.scheduleFilter === "type"
          ? state.activeTypes
          : filter.dataset.scheduleFilter === "team"
            ? state.activeTeams
            : state.activeStatuses;
        if (filter.checked) set.add(filter.value);
        else set.delete(filter.value);
      }
      refresh();
      return;
    }

    const complete = event.target.closest("[data-schedule-complete]");
    if (complete) {
      const visit = findVisit(complete.dataset.scheduleComplete);
      if (visit) {
        visit.completed = complete.checked;
        visit.status = complete.checked ? "Completed" : "Scheduled";
        visit.statusGroup = complete.checked ? "Completed" : "Scheduled";
        toast(`${visit.client} marked ${complete.checked ? "completed" : "scheduled"}`);
        refresh();
      }
    }
  }

  function onDragStart(event) {
    const visit = event.target.closest("[data-visit-id]");
    const unscheduled = event.target.closest("[data-unscheduled-id]");
    if (visit) {
      event.dataTransfer.setData("text/plain", JSON.stringify({ kind: "visit", id: visit.dataset.visitId }));
    } else if (unscheduled) {
      event.dataTransfer.setData("text/plain", JSON.stringify({ kind: "unscheduled", id: unscheduled.dataset.unscheduledId }));
    }
  }

  function onDragOver(event) {
    if (event.target.closest(".schedule-drop-slot, [data-unscheduled-drop]")) {
      event.preventDefault();
    }
  }

  function onDrop(event) {
    const unscheduledDrop = event.target.closest("[data-unscheduled-drop]");
    const slot = event.target.closest(".schedule-drop-slot");
    if (!slot && !unscheduledDrop) return;
    event.preventDefault();
    let payload;
    try {
      payload = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (error) {
      return;
    }
    if (unscheduledDrop && payload.kind === "visit") {
      moveVisitToUnscheduled(payload.id);
      return;
    }
    if (!slot) return;
    if (payload.kind === "visit") moveVisit(payload.id, slot.dataset.dayIndex, slot.dataset.time);
    if (payload.kind === "unscheduled") scheduleUnscheduled(payload.id, slot.dataset.dayIndex, slot.dataset.time);
  }

  function onPointerDown(event) {
    const popoverBar = event.target.closest("[data-popover-drag]");
    if (popoverBar && !event.target.closest("[data-popover-close]")) {
      const popover = popoverBar.closest(".visit-popover");
      const rect = popover.getBoundingClientRect();
      state.popoverDrag = {
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
      };
      event.preventDefault();
      return;
    }
    const handle = event.target.closest("[data-resize-id]");
    if (handle) startResize(handle.dataset.resizeId, handle.dataset.resizeEdge || "bottom", event);
  }

  function afterRender() {
    closePopover();
  }

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("change", onDocumentChange);
  document.addEventListener("dragstart", onDragStart);
  document.addEventListener("dragover", onDragOver);
  document.addEventListener("drop", onDrop);
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", handleResizeMove);
  document.addEventListener("pointerup", finishResize);

  window.CleanOpsSchedule = {
    render,
    afterRender
  };
})();
