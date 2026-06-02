(function () {
  const source = window.CLEANOPS_DATA.scheduleV0;
  const startHour = 6;
  const endHour = 18;
  const minuteHeight = 1.05;
  const minDuration = 30;
  const state = {
    view: "week",
    rangeLabel: source.rangeLabel,
    selectedDayIndex: source.selectedDayIndex,
    showWeekends: true,
    filtersOpen: false,
    viewMenuOpen: false,
    moreMenuOpen: false,
    activeTypes: new Set(["Visits", "Requests", "Tasks", "Reminders"]),
    activeStatuses: new Set(["Scheduled", "Completed", "Unassigned", "Issue / warning"]),
    visits: structuredCloneSafe(source.scheduledVisits),
    unscheduled: structuredCloneSafe(source.unscheduled),
    resizing: null
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
    return state.activeTypes.has(visit.type) && state.activeStatuses.has(visit.statusGroup);
  }

  function visibleVisits() {
    return state.visits.filter(visitMatches);
  }

  function visibleUnscheduled() {
    return state.unscheduled.filter(visitMatches);
  }

  function slotTimes() {
    const times = [];
    for (let hour = startHour; hour <= endHour; hour += 1) {
      times.push(`${String(hour).padStart(2, "0")}:00`);
    }
    return times;
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
    const typeOptions = ["Visits", "Requests", "Tasks", "Reminders"];
    const statusOptions = ["Scheduled", "Completed", "Unassigned", "Issue / warning"];
    return `
      <div class="schedule-dropdown filters-menu" role="menu">
        <div class="filters-menu-head">
          <strong>Filters</strong>
          <button type="button" data-schedule-action="clear-filters">Clear filters</button>
        </div>
        <div class="filter-section">
          <p class="eyebrow">Types</p>
          ${typeOptions.map((type) => filterOption("type", type, state.activeTypes.has(type))).join("")}
        </div>
        <div class="filter-section">
          <p class="eyebrow">Status</p>
          ${statusOptions.map((status) => filterOption("status", status, state.activeStatuses.has(status))).join("")}
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
    return `
      <label class="schedule-check">
        <input type="checkbox" data-schedule-filter="${group}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}>
        <span>${escapeHtml(value)}</span>
      </label>
    `;
  }

  function unscheduledPanel() {
    const items = visibleUnscheduled();
    return `
      <aside class="unscheduled-panel">
        <div class="unscheduled-head">
          <div>
            <p class="eyebrow">Right rail</p>
            <h2>Unscheduled</h2>
          </div>
          ${chip(`${items.length}`, "info")}
        </div>
        <p class="muted">Drag cards into a valid time slot to schedule them in this mock view.</p>
        <div class="unscheduled-list">
          ${items.map((item) => unscheduledCard(item)).join("") || `<div class="empty mini"><div class="empty-icon">OK</div><div><h3>No unscheduled work</h3><p class="muted">Everything visible is placed.</p></div></div>`}
        </div>
      </aside>
    `;
  }

  function unscheduledCard(item) {
    return `
      <article class="unscheduled-card" draggable="true" data-unscheduled-id="${escapeHtml(item.id)}" title="Drag into schedule">
        <div class="button-row" style="justify-content:space-between">
          <strong>${escapeHtml(item.client)}</strong>
          ${chip(item.status, item.tone)}
        </div>
        <span class="muted">${escapeHtml(item.property)}</span>
        <span>${escapeHtml(item.service)}</span>
        ${item.warnings?.length ? `<div class="button-row" style="justify-content:flex-start">${item.warnings.map((warning) => chip(warning, "warning")).join("")}</div>` : ""}
      </article>
    `;
  }

  function scheduledCard(visit, mode = "week") {
    const top = Math.max(0, (timeToMinutes(visit.start) - startHour * 60) * minuteHeight);
    const height = Math.max(34, visit.duration * minuteHeight - 4);
    return `
      <article class="schedule-visit-card ${escapeHtml(visit.tone)} ${mode}" draggable="true"
        data-visit-id="${escapeHtml(visit.id)}"
        style="top:${top}px;height:${height}px"
        title="${escapeHtml(visit.client)} ${escapeHtml(timeRange(visit))}">
        <strong>${escapeHtml(timeRange(visit))}</strong>
        <span>${escapeHtml(visit.client)}</span>
        <span class="muted">${escapeHtml(visit.property)}</span>
        <span class="muted">${escapeHtml(visit.service)}</span>
        ${visit.warnings?.length ? `<span class="schedule-warning">${escapeHtml(visit.warnings[0])}</span>` : ""}
        <span class="resize-handle" data-resize-id="${escapeHtml(visit.id)}" title="Resize duration" aria-hidden="true"></span>
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
              ${slotTimes().map((time) => `<div class="time-label">${displayTime(time)}</div>`).join("")}
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
    return `
      <div class="schedule-day-column ${day.today ? "today" : ""}" data-day-index="${day.index}">
        ${slotTimes().map((time) => `<div class="schedule-drop-slot" data-day-index="${day.index}" data-time="${time}"></div>`).join("")}
        ${visits.map((visit) => scheduledCard(visit, mode)).join("")}
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
              <div class="time-rail">${slotTimes().map((time) => `<div class="time-label">${displayTime(time)}</div>`).join("")}</div>
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
                ${item ? `<span>${escapeHtml(item.text)}</span>${item.count > 1 ? chip(`${item.count}`, "info") : ""}` : ""}
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
            return `<tr>
              <td><input type="checkbox" ${visit.completed ? "checked" : ""} data-schedule-complete="${escapeHtml(visit.id)}" aria-label="Complete ${escapeHtml(visit.client)}"></td>
              <td>${escapeHtml(visit.client)}</td>
              <td>${escapeHtml(visit.property)}</td>
              <td>${escapeHtml(visit.service)}</td>
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
              <button type="button" data-visit-id="${escapeHtml(visit.id)}">
                <strong>${escapeHtml(visit.client)}</strong>
                <span>${escapeHtml(visit.property)}</span>
                ${chip(visit.status, visit.tone)}
              </button>
            `).join("")}
          </aside>
          <div class="mock-map" aria-label="Mock map view">
            <div class="mock-map-grid"></div>
            ${visits.map((visit, index) => `<button class="map-pin ${escapeHtml(visit.tone)}" style="left:${visit.map?.x || 40}%;top:${visit.map?.y || 40}%" data-visit-id="${escapeHtml(visit.id)}" title="${escapeHtml(visit.client)}">${index + 1}</button>`).join("")}
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

  function dayLabel(dayIndex) {
    return source.days.find((day) => day.index === Number(dayIndex))?.short || "day";
  }

  function openPopover(visitId, target) {
    const visit = findVisit(visitId);
    const root = document.getElementById("schedule-popover-root");
    if (!visit || !root || !target) return;
    const rect = target.getBoundingClientRect();
    const left = Math.min(rect.left + window.scrollX + 12, window.scrollX + window.innerWidth - 310);
    const top = rect.top + window.scrollY - 10;
    root.innerHTML = `
      <aside class="visit-popover" style="left:${Math.max(12, left)}px;top:${Math.max(74, top)}px" role="dialog" aria-label="${escapeHtml(visit.client)} visit">
        <h3>${escapeHtml(visit.client)}</h3>
        <label class="schedule-check"><input type="checkbox" data-schedule-complete="${escapeHtml(visit.id)}" ${visit.completed ? "checked" : ""}><span>Completed</span></label>
        <div class="field-row"><span>Details</span><strong>${escapeHtml(visit.service)}</strong></div>
        <div class="field-row"><span>Team</span><strong>${escapeHtml(visit.team)}</strong></div>
        <div class="field-row"><span>Location</span><strong>${escapeHtml(visit.property)}</strong></div>
        <div class="field-row"><span>Starts</span><strong>${escapeHtml(displayTime(visit.start))}</strong></div>
        <div class="field-row"><span>Ends</span><strong>${escapeHtml(displayTime(minutesToTime(timeToMinutes(visit.start) + visit.duration)))}</strong></div>
        ${visit.warnings?.length ? `<div class="button-row" style="justify-content:flex-start">${visit.warnings.map((warning) => chip(warning, "warning")).join("")}</div>` : ""}
        <div class="button-row">
          ${button("Edit", "edit-visit")}
          ${button("View details", "view-details", "primary")}
        </div>
      </aside>
    `;
  }

  function closePopover() {
    const root = document.getElementById("schedule-popover-root");
    if (root) root.innerHTML = "";
  }

  function startResize(visitId, event) {
    const visit = findVisit(visitId);
    if (!visit) return;
    event.preventDefault();
    event.stopPropagation();
    state.resizing = {
      visitId,
      startY: event.clientY,
      originalDuration: visit.duration
    };
    document.body.classList.add("schedule-resizing");
  }

  function handleResizeMove(event) {
    if (!state.resizing) return;
    const visit = findVisit(state.resizing.visitId);
    if (!visit) return;
    const deltaMinutes = Math.round((event.clientY - state.resizing.startY) / (minuteHeight * 30)) * 30;
    visit.duration = Math.max(minDuration, state.resizing.originalDuration + deltaMinutes);
    const card = document.querySelector(`[data-visit-id="${state.resizing.visitId}"]`);
    if (card) card.style.height = `${Math.max(34, visit.duration * minuteHeight - 4)}px`;
  }

  function finishResize() {
    if (!state.resizing) return;
    const visit = findVisit(state.resizing.visitId);
    if (visit) toast(`${visit.client} duration updated to ${visit.duration} minutes`);
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
      state.activeTypes = new Set(["Visits", "Requests", "Tasks", "Reminders"]);
      state.activeStatuses = new Set(["Scheduled", "Completed", "Unassigned", "Issue / warning"]);
      state.showWeekends = true;
      toast("Schedule filters cleared");
      refresh();
      return;
    }
    toast(`${action.replace(/-/g, " ")} is mocked for Schedule v0.`);
  }

  function onDocumentChange(event) {
    const filter = event.target.closest("[data-schedule-filter]");
    if (filter) {
      if (filter.dataset.scheduleFilter === "weekends") {
        state.showWeekends = filter.checked;
      } else {
        const set = filter.dataset.scheduleFilter === "type" ? state.activeTypes : state.activeStatuses;
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
    if (event.target.closest(".schedule-drop-slot")) {
      event.preventDefault();
    }
  }

  function onDrop(event) {
    const slot = event.target.closest(".schedule-drop-slot");
    if (!slot) return;
    event.preventDefault();
    let payload;
    try {
      payload = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (error) {
      return;
    }
    if (payload.kind === "visit") moveVisit(payload.id, slot.dataset.dayIndex, slot.dataset.time);
    if (payload.kind === "unscheduled") scheduleUnscheduled(payload.id, slot.dataset.dayIndex, slot.dataset.time);
  }

  function onPointerDown(event) {
    const handle = event.target.closest("[data-resize-id]");
    if (handle) startResize(handle.dataset.resizeId, event);
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
