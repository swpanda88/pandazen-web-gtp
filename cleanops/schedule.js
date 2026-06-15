(function () {
  const source = window.CLEANOPS_DATA.scheduleV0;
  // Mock Settings hook: later this will be controlled from CleanOps Settings.
  const scheduleSettings = {
    dayStartHour: 6,
    dayEndHour: 18,
    ...(source.scheduleSettings || {})
  };
  const startHour = scheduleSettings.dayStartHour;
  const endHour = scheduleSettings.dayEndHour;
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
    selectedDay: null,
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
    popoverDrag: null,
    workloadGroup: "cleaner",
    workloadSort: "start",
    collapsedGroups: new Set(),
    visitsLoading: true,
    visitsError: false,
    apiVisits: []
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

  function shortScheduleNote(item) {
    const note = normaliseWarning(item.warnings?.[0] || "");
    if (!note || ["No cleaner", "Unassigned", "Overdue", "Completed"].includes(note)) return "";
    if (note === item.type || note === item.status || note === item.statusGroup) return "";
    return note.length > 54 ? `${note.slice(0, 51).trim()}...` : note;
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
    if (item.statusGroup === "Issue / warning") return chip("Issue", "warning");
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

  function visitDay(visit) {
    return source.days.find((day) => day.index === visit.dayIndex);
  }

  function dayNumber(day) {
    return day?.label?.match(/\d+/)?.[0] || "";
  }

  function monthDayLabel(monthDay) {
    const firstKnownDay = source.days[0];
    const firstKnownDate = firstKnownDay?.date ? new Date(`${firstKnownDay.date}T00:00:00Z`) : null;
    const firstKnownNumber = Number(dayNumber(firstKnownDay)) || 1;
    if (!firstKnownDate || Number.isNaN(firstKnownDate.getTime())) return `Day ${monthDay}`;
    const date = new Date(firstKnownDate);
    date.setUTCDate(firstKnownDate.getUTCDate() + Number(monthDay) - firstKnownNumber);
    const short = date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" });
    return `${short} ${monthDay}`;
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
    return `
      <div class="schedule-toolbar">
        <div class="schedule-toolbar-group">
          ${button("Today", "today", "small")}
          <button class="button small icon-only-button" type="button" data-schedule-action="previous" aria-label="Previous date range" title="Previous date range">&lt;</button>
          <button class="button small icon-only-button" type="button" data-schedule-action="next" aria-label="Next date range" title="Next date range">&gt;</button>
          <button class="button small schedule-date-button" type="button" data-schedule-action="date-range" title="Date range">${escapeHtml(state.rangeLabel)}</button>
        </div>
        <div class="schedule-toolbar-group">
          ${viewSwitch()}
          <div class="schedule-menu-wrap">
            <button class="button small" type="button" data-schedule-action="toggle-filters" aria-expanded="${state.filtersOpen}" title="Schedule filters">Filters ${chip(filtersActiveLabel(), "success")} <span aria-hidden="true">v</span></button>
            ${state.filtersOpen ? filtersMenu() : ""}
          </div>
          <div class="schedule-menu-wrap">
            <button class="button small" type="button" data-schedule-action="toggle-more-menu" aria-expanded="${state.moreMenuOpen}" title="More actions">More actions <span aria-hidden="true">v</span></button>
            ${state.moreMenuOpen ? moreMenu() : ""}
          </div>
          ${state.visits.some(v => v.isApiBacked) ? "" : button("New visit", "new-visit", "small primary")}
        </div>
      </div>
    `;
  }

  function filtersActiveLabel() {
    return state.showWeekends ? "On" : "Weekdays";
  }

  function viewSwitch() {
    return `
      <div class="schedule-view-switch" aria-label="Schedule view">
        ${["month", "week", "day", "workload"].map((view) => `
          <button type="button" class="${state.view === view ? "selected" : ""}" data-schedule-view="${view}" aria-pressed="${state.view === view}">
            ${escapeHtml(view.charAt(0).toUpperCase() + view.slice(1))}
          </button>
        `).join("")}
      </div>
    `;
  }

  function viewMenu() {
    return `
      <div class="schedule-dropdown compact" role="menu">
        ${["month", "week", "day", "workload", "map", "list"].map((view) => `
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
    const note = shortScheduleNote(item);
    return `
      <article class="unscheduled-card ${escapeHtml(scheduleItemClasses(item))}" draggable="true" data-unscheduled-id="${escapeHtml(item.id)}" title="Drag into schedule">
        <div class="queue-card-main">
          <strong>${escapeHtml(item.client)}</strong>
          <span>${escapeHtml(item.property)}</span>
        </div>
        <div class="queue-card-tags">
          ${typePill(item.type)}
          ${status}
        </div>
        ${note ? `<div class="queue-card-note">${escapeHtml(note)}</div>` : ""}
      </article>
    `;
  }

  function scheduledCard(visit, mode = "week", layout = { columnIndex: 0, columnCount: 1 }) {
    const top = Math.max(0, (timeToMinutes(visit.start) - startHour * 60) * minuteHeight);
    const height = Math.max(34, visit.duration * minuteHeight - 4);
    const sizeClass = height <= 46 ? "card-small" : height <= 78 ? "card-medium" : "card-large";
    const overlapStyle = layout.columnCount > 1
      ? `left:calc(8px + ${layout.columnIndex} * ((100% - 16px) / ${layout.columnCount}));width:calc((100% - 16px) / ${layout.columnCount} - 4px);right:auto;`
      : "left:8px;right:8px;";
    const status = gridStatusChip(visit);
    const extraLine = visit.team && !isUnassigned(visit) ? visit.team : "";
    return `
      <article class="schedule-visit-card ${escapeHtml(scheduleItemClasses(visit))} ${mode} ${sizeClass}" draggable="true"
        data-visit-id="${escapeHtml(visit.id)}"
        data-overlap-count="${layout.columnCount}"
        style="top:${top}px;height:${height}px;${overlapStyle}"
        title="${escapeHtml(visit.client)} ${escapeHtml(timeRange(visit))}">
        <div class="schedule-card-top">
          <strong>${escapeHtml(timeRange(visit))}</strong>
          ${status}
        </div>
        <span class="schedule-card-title">${escapeHtml(visit.client)}</span>
        ${extraLine ? `<span class="schedule-card-extra">${escapeHtml(extraLine)}</span>` : ""}
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
    const day = state.selectedDay || source.days.find((item) => item.index === state.selectedDayIndex) || source.days[3];
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
          <div class="month-title">
            <div>
              <h2>Month overview</h2>
              <span class="muted">Clean count, appointment mix, and unscheduled work at a glance.</span>
            </div>
            ${chip(`${visibleUnscheduled().length} unscheduled`, "info")}
          </div>
          <div class="month-grid" style="--month-cols:${weekdays.length}">
            ${weekdays.map((day) => `<div class="month-weekday">${day}</div>`).join("")}
            ${cells.map((day) => {
              const item = monthItems.get(day);
              return `<div class="month-cell ${day === 11 ? "today" : ""} is-clickable" data-month-day="${day}">
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

  function workloadView() {
    const allVisits = visibleVisits();
    const unscheduledItems = visibleUnscheduled();
    const scheduledUnassigned = allVisits.filter(v => isUnassigned(v) || !v.start || !v.dayIndex);
    const scheduledNormal = allVisits.filter(v => !isUnassigned(v) && v.start && v.dayIndex);

    const needsScheduling = [...unscheduledItems, ...scheduledUnassigned];

    const groups = new Map();
    scheduledNormal.forEach(visit => {
      let key = "Other";
      if (state.workloadGroup === "cleaner") key = visit.team || "Unknown Team";
      else if (state.workloadGroup === "day") {
        const day = source.days.find(d => d.index === visit.dayIndex);
        key = day ? day.label : "Unknown Day";
      } else if (state.workloadGroup === "client") {
        key = visit.client || "Unknown Client";
      }
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(visit);
    });

    const sortByStart = (a, b) => timeToMinutes(a.start || "00:00") - timeToMinutes(b.start || "00:00");
    needsScheduling.sort(sortByStart);
    for (let [key, items] of groups.entries()) {
      items.sort(sortByStart);
    }

    const days = visibleDays();
    const workHours = [];
    for (let h = startHour; h <= endHour; h++) workHours.push(h);
    const HOUR_WIDTH = 30;
    const DAY_WIDTH = workHours.length * HOUR_WIDTH;
    const TOTAL_TIMELINE_WIDTH = days.length * DAY_WIDTH;

    function renderGroupHeader(groupKey, items, isNeedsAction = false) {
      const isCollapsed = state.collapsedGroups.has(groupKey);
      const bookedMinutes = items.reduce((sum, v) => sum + (v.duration || 0), 0);
      const bookedHours = (bookedMinutes / 60).toFixed(1).replace(".0", "");
      let summary = `${items.length} visit${items.length === 1 ? "" : "s"}`;
      if (bookedMinutes > 0) summary += ` · ${bookedHours}h`;

      return `
        <tr class="gantt-row workload-group-header ${isNeedsAction ? "needs-action" : ""} ${isCollapsed ? "collapsed" : ""}" data-schedule-action="toggle-workload-group" data-group-key="${escapeHtml(groupKey)}">
          <td class="gantt-left">
            <div class="workload-group-header-text">
              <span class="group-chevron" aria-hidden="true">${isCollapsed ? "›" : "v"}</span>
              <span class="${isNeedsAction ? "text-danger" : ""}">${escapeHtml(groupKey)}</span>
              <span class="workload-group-meta">${escapeHtml(summary)}</span>
            </div>
          </td>
          <td style="padding:0; background:var(--surface);"></td>
        </tr>
      `;
    }

    function renderRows(items) {
      return items.map(job => {
        const day = visitDay(job);
        const dayStr = day ? day.short : "Unscheduled";
        const timeStr = job.start ? `${job.start}–${minutesToTime(timeToMinutes(job.start) + (job.duration || 0))}` : "";
        const dateTimeStr = (dayStr !== "Unscheduled" || timeStr) ? `${dayStr} ${timeStr}` : "Unscheduled";

        let timelineBarsHtml = "";
        const dayIndexInVisible = days.findIndex(d => d.index === job.dayIndex);
        if (dayIndexInVisible !== -1 && job.start) {
          const dayOffset = dayIndexInVisible * DAY_WIDTH;
          const leftOffset = dayOffset + ((timeToMinutes(job.start) - startHour * 60) / 60) * HOUR_WIDTH;
          const width = ((job.duration || 30) / 60) * HOUR_WIDTH;

          timelineBarsHtml = `
            <button type="button" class="workload-bar ${escapeHtml(typeClass(job.type))}"
                 data-visit-id="${escapeHtml(job.id)}"
                 style="left: ${leftOffset}px; width: ${width}px;"
                 title="${escapeHtml(job.client)} | ${escapeHtml(job.start)}">
            </button>
          `;
        }

        return `
          <tr class="gantt-row workload-item-row" data-visit-id="${escapeHtml(job.id)}">
            <td class="gantt-left">
              <div class="left-grid">
                <div class="left-cell" title="${escapeHtml(job.service || job.title)}">
                  <span class="chip ${escapeHtml(typeClass(job.type))}" title="${escapeHtml(job.type)}"></span>
                  ${escapeHtml(job.client)}
                </div>
                <div class="left-cell" title="${escapeHtml(job.property)}">${escapeHtml(job.property)}</div>
                <div class="left-cell ${isUnassigned(job) ? "text-danger" : ""}" title="${escapeHtml(job.team || "Unassigned")}">${escapeHtml(job.team || "Unassigned")}</div>
                <div class="left-cell muted" style="font-size:11px;">${escapeHtml(dateTimeStr)}</div>
              </div>
            </td>
            <td class="timeline-cell" style="width: ${TOTAL_TIMELINE_WIDTH}px;">
              <div class="timeline-bg"></div><div class="timeline-bg-hours"></div>
              <div class="bars-container">${timelineBarsHtml}</div>
            </td>
          </tr>
        `;
      }).join("");
    }

    let tableHtml = `
      <div class="workload-planner">
        <div class="planner-controls">
          <div class="control-group">
            <select data-workload-select="group" aria-label="Group by">
              <option value="cleaner" ${state.workloadGroup === "cleaner" ? "selected" : ""}>Group by Cleaner</option>
              <option value="day" ${state.workloadGroup === "day" ? "selected" : ""}>Group by Day</option>
              <option value="client" ${state.workloadGroup === "client" ? "selected" : ""}>Group by Client</option>
            </select>
            <select data-workload-select="sort" aria-label="Sort by">
              <option value="start" ${state.workloadSort === "start" ? "selected" : ""}>Sort: Start Time</option>
            </select>
          </div>
          <div class="planner-meta">
            Needs scheduling · ${needsScheduling.length}
          </div>
        </div>

        <div class="gantt-scroll">
          <table class="gantt-table">
            <thead>
              <tr>
                <th class="gantt-left">
                  <div class="left-grid left-header">
                    <div class="left-cell">Job / Visit</div>
                    <div class="left-cell">Location</div>
                    <div class="left-cell">Cleaner / Team</div>
                    <div class="left-cell">Date / Time</div>
                  </div>
                </th>
                <th style="padding:0; border-bottom:none;">
                  <div class="timeline-header-container" style="width: ${TOTAL_TIMELINE_WIDTH}px;">
                    ${days.map(d => `
                      <div class="day-block" style="width: ${DAY_WIDTH}px;">
                        <div class="day-label">${escapeHtml(d.label)}</div>
                        <div class="hours-row">
                          ${workHours.map(h => `<div class="hour-tick" style="width:${HOUR_WIDTH}px">${h}</div>`).join("")}
                        </div>
                      </div>
                    `).join("")}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
    `;

    if (needsScheduling.length > 0) {
      tableHtml += renderGroupHeader("Needs scheduling", needsScheduling, true);
      if (!state.collapsedGroups.has("Needs scheduling")) {
        tableHtml += renderRows(needsScheduling);
      }
    }

    const sortedGroups = Array.from(groups.keys()).sort();
    sortedGroups.forEach(key => {
      const items = groups.get(key);
      tableHtml += renderGroupHeader(key, items);
      if (!state.collapsedGroups.has(key)) {
        tableHtml += renderRows(items);
      }
    });

    tableHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    return `
      <section class="panel workload-panel">
        ${controls()}
        ${tableHtml}
      </section>
      <div id="schedule-popover-root"></div>
    `;
  }

  function render() {
    if (state.visitsLoading) return `<div class="pad schedule-main" data-schedule-root="true"><span class="muted">Loading schedule...</span></div>`;
    if (state.visitsError) return `<div class="pad schedule-main" data-schedule-root="true"><span class="muted">Could not load schedule.</span></div>`;

    if (state.view === "workload") return workloadView();
    if (state.view === "month") return monthView();
    if (state.view === "day") return dayView();
    if (state.view === "list") return listView();
    if (state.view === "map") return mapView();
    return weekView();
  }

  function refresh() {
    const root = document.getElementById("page-root");
    if (!root || (!root.querySelector(".schedule-toolbar") && !root.querySelector("[data-schedule-root]"))) return;
    root.innerHTML = render();
  }

  function findVisit(id) {
    return state.visits.find((visit) => visit.id === id) || state.unscheduled.find((visit) => visit.id === id);
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

  function monthDayToScheduleDay(monthDay) {
    const matchedDay = source.days.find((day) => dayNumber(day) === String(monthDay));
    if (matchedDay) return matchedDay;
    return {
      index: `month-${monthDay}`,
      short: monthDayLabel(monthDay).split(" ")[0],
      label: monthDayLabel(monthDay),
      date: "",
      weekend: false
    };
  }

  function fieldValue(...values) {
    return values.find((value) => String(value || "").trim()) || "";
  }

  function dispatchValue(value, fallback = "Not available") {
    return escapeHtml(fieldValue(value, fallback));
  }

  function schedulingAccess(visit) {
    const access = fieldValue(visit.access, visit.accessMethod, visit.access_method);
    if (access) return access;
    const accessWarning = (visit.warnings || []).find((warning) => /access|key|gate|lockbox/i.test(warning));
    return accessWarning || "";
  }

  function schedulingParking(visit) {
    return fieldValue(visit.parking, visit.parking_notes, visit.parkingNote);
  }

  function schedulingProducts(visit) {
    return fieldValue(visit.productsEquipment, visit.products_equipment_notes, visit.cleaning_products, visit.equipment);
  }

  function schedulingNote(visit) {
    return fieldValue(visit.schedulingNote, visit.property_notes, visit.propertyNote, shortScheduleNote(visit));
  }

  function dispatchDateTime(visit) {
    const day = visitDay(visit);
    if (!day || !visit.start) return "Unscheduled / needs time";
    return `${day.label} ${timeRange(visit)}`;
  }

  function dispatchMissingItems(visit) {
    const missing = [];
    if (!visitDay(visit) || !visit.start) missing.push("Needs date/time");
    if (isUnassigned(visit)) missing.push("Needs cleaner/team");
    if (!schedulingAccess(visit)) missing.push("Access missing");
    if (!schedulingParking(visit)) missing.push("Parking unknown");
    return missing;
  }

  function openPopover(visitId, target) {
    const visit = findVisit(visitId);
    const root = document.getElementById("schedule-popover-root");
    if (!visit || !root || !target) return;
    const statusChips = visitPopoverChips(visit);
    const rect = target.getBoundingClientRect();
    const left = Math.min(rect.left + window.scrollX + 12, window.scrollX + window.innerWidth - 374);
    const top = rect.top + window.scrollY - 10;
    const access = schedulingAccess(visit);
    const parking = schedulingParking(visit);
    const products = schedulingProducts(visit);
    const note = schedulingNote(visit);
    const missingItems = dispatchMissingItems(visit);
    const readiness = missingItems.length
      ? `<ul class="popover-missing-list">${missingItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : `<div class="popover-ready">Scheduling ready</div>`;
    root.innerHTML = `
      <aside class="visit-popover" style="left:${Math.max(12, left)}px;top:${Math.max(74, top)}px" role="dialog" aria-label="${escapeHtml(visit.client)} visit">
        <div class="visit-popover-bar" data-popover-drag="true">
          <div class="visit-popover-title">
            <strong>${escapeHtml(visit.client || visit.title || "Scheduled work")}</strong>
            <span>${escapeHtml(visit.property || "Location not set")}</span>
          </div>
          <button type="button" data-popover-close="true" aria-label="Close visit popover" title="Close">X</button>
        </div>
        <div class="visit-popover-body">
          ${statusChips ? `<div class="button-row popover-chip-row">${statusChips}</div>` : ""}
          <div class="field-row"><span>Client</span><strong>${dispatchValue(visit.client)}</strong></div>
          <div class="field-row"><span>Property</span><strong>${dispatchValue(visit.property)}</strong></div>
          <div class="field-row"><span>Location / address</span><strong>${dispatchValue(visit.address, visit.property)}</strong></div>
          <div class="field-row"><span>Work type</span><strong>${typePill(visit.type)}</strong></div>
          <div class="field-row"><span>Date / time</span><strong>${escapeHtml(dispatchDateTime(visit))}</strong></div>
          <div class="field-row"><span>Cleaner / team</span><strong>${dispatchValue(visit.team, "Unassigned")}</strong></div>
          <div class="field-row"><span>Duration</span><strong>${escapeHtml(visit.duration ? `${visit.duration} min` : "Duration missing")}</strong></div>
          <div class="popover-section">
            <strong>Practical scheduling</strong>
            <div class="field-row"><span>Access</span><strong>${dispatchValue(access, "Access missing")}</strong></div>
            <div class="field-row"><span>Parking</span><strong>${dispatchValue(parking, "Parking unknown")}</strong></div>
            ${products ? `<div class="field-row"><span>Products/equipment</span><strong>${escapeHtml(products)}</strong></div>` : ""}
            ${note ? `<p class="popover-note">${escapeHtml(note)}</p>` : ""}
          </div>
          <div class="popover-section">
            <strong>Scheduling readiness</strong>
            ${readiness}
          </div>
          <div class="button-row">
            ${button("Edit time", "edit-time")}
            ${button("Assign cleaner/team", "assign-cleaner-team")}
            ${button("Open details", "open-details", "primary")}
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
    const scheduleRoot = event.target.closest(".schedule-toolbar, .schedule-main, .workload-panel, .unscheduled-panel, .visit-popover, .map-shell");
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
      if (state.view !== "day") state.selectedDay = null;
      state.viewMenuOpen = false;
      state.filtersOpen = false;
      state.moreMenuOpen = false;
      refresh();
      return;
    }

    const monthDay = event.target.closest("[data-month-day]");
    if (monthDay) {
      const selected = monthDayToScheduleDay(monthDay.dataset.monthDay);
      if (selected) {
        state.selectedDay = selected;
        state.selectedDayIndex = selected.index;
        state.view = "day";
        toast(`${selected.label} opened in Day view`);
        refresh();
      } else {
        toast("Month day preview is mocked for Schedule v0.");
      }
      return;
    }

    const visitTarget = event.target.closest("[data-visit-id]");
    if (visitTarget && !event.target.closest(".resize-handle")) {
      const visit = findVisit(visitTarget.dataset.visitId);
      if (visit && visit.isApiBacked) {
        toast("API visits are read-only in this view.");
        return;
      }
      openPopover(visitTarget.dataset.visitId, visitTarget);
      return;
    }

    const unscheduledTarget = event.target.closest("[data-unscheduled-id]");
    if (unscheduledTarget) {
      const visit = findVisit(unscheduledTarget.dataset.unscheduledId);
      if (visit && visit.isApiBacked) {
        toast("API visits are read-only in this view.");
        return;
      }
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
      handleAction(action.dataset.scheduleAction, event);
      return;
    }

  }

  function handleAction(action, event) {
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
    if (action === "toggle-workload-group") {
      const groupKey = event.target.closest("[data-group-key]").dataset.groupKey;
      if (state.collapsedGroups.has(groupKey)) state.collapsedGroups.delete(groupKey);
      else state.collapsedGroups.add(groupKey);
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

    const workloadSelect = event.target.closest("[data-workload-select]");
    if (workloadSelect) {
      if (workloadSelect.dataset.workloadSelect === "group") state.workloadGroup = workloadSelect.value;
      if (workloadSelect.dataset.workloadSelect === "sort") state.workloadSort = workloadSelect.value;
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
    const visitTarget = event.target.closest("[data-visit-id]");
    const unscheduledTarget = event.target.closest("[data-unscheduled-id]");
    if (visitTarget) {
      const visit = findVisit(visitTarget.dataset.visitId);
      if (visit && visit.isApiBacked) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", JSON.stringify({ kind: "visit", id: visitTarget.dataset.visitId }));
    } else if (unscheduledTarget) {
      const visit = findVisit(unscheduledTarget.dataset.unscheduledId);
      if (visit && visit.isApiBacked) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", JSON.stringify({ kind: "unscheduled", id: unscheduledTarget.dataset.unscheduledId }));
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

  async function loadVisits() {
    try {
      const api = await import("./api.js");
      const fetched = await api.fetchVisits();
      state.apiVisits = fetched.map(visit => {
        return {
          ...visit,
          isApiBacked: true,
          date: visit.scheduledStart ? (visit.scheduledStart.split(" ")[0] || visit.scheduledStart.split("T")[0]) : null,
          client: [visit.firstName, visit.lastName].filter(Boolean).join(" ") || visit.companyName || "API Customer",
          property: [visit.propertyAddressLine1, visit.propertyCity].filter(Boolean).join(", ") || "Property pending",
          address: [visit.propertyAddressLine1, visit.propertyCity].filter(Boolean).join(", "),
          status: visit.status || "Scheduled",
          statusGroup: visit.status === "completed" ? "Completed" : "Scheduled",
          type: "Cleaning visit",
          start: visit.scheduledStart ? (visit.scheduledStart.split(" ")[1] || visit.scheduledStart.split("T")[1])?.substring(0, 5) : undefined,
          duration: 60,
          team: visit.assignedTeam || "Unassigned"
        };
      });
      if (state.apiVisits.length > 0) {
        state.visits = state.apiVisits.filter(v => v.start && v.date);
        state.unscheduled = state.apiVisits.filter(v => !v.start || !v.date);
      }
      state.visitsError = false;
    } catch (err) {
      console.error("Failed to load visits", err);
      state.visitsError = true;
      state.apiVisits = [];
    } finally {
      state.visitsLoading = false;
      refresh();
    }
  }

  loadVisits();
})();
