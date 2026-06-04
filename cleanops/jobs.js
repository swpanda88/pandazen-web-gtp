(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedJobId: null
  };

  // Data helpers
  function jobs() { return data.jobs || []; }
  function scheduledJobs() { return data.scheduledJobs || []; }
  function jobReports() { return data.jobReports || []; }
  function billableEvents() { return data.billableEvents || []; }
  function clients() { return data.clients || []; }
  function properties() { return clients().flatMap(c => (c.properties || [])); }

  function findClient(id) { return clients().find(c => c.id === id); }
  function findProperty(id) { return properties().find(p => p.id === id); }

  function escapeHtml(str) { return window.CleanOpsShell?.escapeHtml?.(str) || String(str || "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]); }
  function iconSvg(name) { return window.CleanOpsShell?.iconSvg?.(name) || ""; }
  function button(label, action, type = "secondary", icon = "") { return `<button class="btn btn-${type}" data-job-action="${action}">${icon}${label}</button>`; }
  function chip(label, tone = "info") { return `<span class="chip ${tone}">${escapeHtml(label)}</span>`; }
  function table(headers, rows) {
    if (!rows.length) return `<div class="banner">No records found.</div>`;
    return `
      <div class="table-wrapper">
        <table class="table">
          <thead><tr>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
          <tbody>${rows.join("")}</tbody>
        </table>
      </div>`;
  }

  function getJobStatusTone(status) {
    const tones = { setup: "warning", active: "success", paused: "info", needs_review: "warning", completed: "success", cancelled: "danger" };
    return tones[status] || "info";
  }

  function getSJTone(status) {
    const tones = { planned: "info", completed: "success", skipped: "warning", cancelled: "danger" };
    return tones[status] || "info";
  }

  let eventBound = false;
  // Render main route
  function render() {
    if (!eventBound) {
      document.addEventListener("click", handleClick);
      eventBound = true;
    }
    return `<div data-jobs-root>${renderInner()}</div>`;
  }

  function refresh() {
    const root = document.querySelector("[data-jobs-root]");
    if (root) root.innerHTML = renderInner();
  }

  function renderInner() {
    return `
      ${window.CleanOpsShell?.pageHead?.("Jobs", "Manage accepted work, cleaning plans, reports, and billing readiness.", button("New job", "open-new-job", "primary")) || ""}

      <div style="margin-bottom: 32px;">
        ${renderActionPanel()}
      </div>

      <section class="grid-detail">
        <article class="panel">
          <div class="panel-head">
            <h2 class="panel-title">All Job Plans</h2>
          </div>
          <div class="filters">
            <span class="inputish">Search jobs</span>
            <span class="selectish">All statuses</span>
          </div>
          ${renderJobsList()}
        </article>
      </section>

      ${state.selectedJobId ? renderJobWorkspaceModal() : ""}
    `;
  }

  function renderActionPanel() {
    const setupJobs = jobs().filter(j => j.status === "setup" || !j.setup_complete);

    // Needs review: reports where review_status is needs_review
    const reportsToReview = jobReports().filter(r => r.review_status === "needs_review");

    // Ready to bill: billable events that are ready_to_bill
    const billable = billableEvents().filter(b => b.status === "ready_to_bill");

    const renderCard = (title, meta, context, chipHtml, action) => `
      <div class="jobs-action-card" data-job-action="${action}">
        <strong>${escapeHtml(title)}</strong>
        <div class="meta">${escapeHtml(meta)}</div>
        <div class="context">${escapeHtml(context)}</div>
        <div>${chipHtml}</div>
      </div>
    `;

    return `
      <div class="jobs-action-grid">
        <!-- Needs Setup -->
        <div class="jobs-action-column">
          <h3>
            <span>Needs setup</span>
            <span class="muted">${setupJobs.length}</span>
          </h3>
          <div>
            ${setupJobs.length === 0 ? `<div class="muted" style="font-size: 13px;">No jobs need setup.</div>` :
              setupJobs.map(j => renderCard(
                j.display_name,
                `${findClient(j.client_id)?.display_name || ""} · ${j.service_type}`,
                "Missing plan / recurrence details",
                chip("Setup required", "warning"),
                `open-job:${j.id}`
              )).join("")
            }
          </div>
        </div>

        <!-- Needs Review -->
        <div class="jobs-action-column">
          <h3>
            <span>Needs review</span>
            <span class="muted">${reportsToReview.length}</span>
          </h3>
          <div>
            ${reportsToReview.length === 0 ? `<div class="muted" style="font-size: 13px;">No reports to review.</div>` :
              reportsToReview.map(r => {
                const j = jobs().find(job => job.id === r.job_id);
                return renderCard(
                  j?.display_name || "Unknown Job",
                  `Report from ${escapeHtml(r.completed_by)}`,
                  r.cleaner_remarks || r.client_remarks || "Review requested",
                  chip(r.severity || "Note", r.severity === "Extra time" || r.severity === "Note" ? "warning" : "danger"),
                  `open-job:${r.job_id}`
                );
              }).join("")
            }
          </div>
        </div>

        <!-- Ready to Bill -->
        <div class="jobs-action-column">
          <h3>
            <span>Ready to bill</span>
            <span class="muted">${billable.length}</span>
          </h3>
          <div>
            ${billable.length === 0 ? `<div class="muted" style="font-size: 13px;">Nothing ready to bill.</div>` :
              billable.map(b => {
                const j = jobs().find(job => job.id === b.source_job_id);
                return renderCard(
                  j?.display_name || "Unknown Job",
                  `£${b.amount.toFixed(2)}`,
                  b.description,
                  chip("Ready", "success"),
                  `open-job:${b.source_job_id}`
                );
              }).join("")
            }
          </div>
        </div>
      </div>
    `;
  }

  function renderJobsList() {
    const list = jobs();
    const rows = list.map(job => {
      const client = findClient(job.client_id);
      const nextSJ = scheduledJobs().find(sj => sj.job_id === job.id && sj.status === "planned");
      const latestReports = jobReports().filter(r => r.job_id === job.id).slice(-1);

      const nextText = nextSJ ? `Next: ${nextSJ.date} ${nextSJ.start_time} · ${nextSJ.assigned_staff}` : "No planned schedule";
      const reportText = latestReports.length ? (latestReports[0].severity ? `Recent: ${latestReports[0].severity}` : "Recent: All good") : "No reports yet";

      return `
        <tr>
          <td>
            <strong style="display: block; font-size: 14px; margin-bottom: 2px;">${escapeHtml(job.display_name)}</strong>
            <span class="muted" style="font-size: 13px;">${escapeHtml(client?.display_name || "")} · ${escapeHtml(job.service_type)} · ${job.job_type}</span>
          </td>
          <td>
            <div style="font-size: 13px;">${escapeHtml(nextText)}</div>
            <div class="muted" style="font-size: 13px; margin-top: 4px;">${escapeHtml(job.billing_basis)} · ${escapeHtml(reportText)}</div>
          </td>
          <td>${chip(job.status, getJobStatusTone(job.status))}</td>
          <td style="text-align: right;">${button("Open workspace", `open-job:${job.id}`, "small ghost")}</td>
        </tr>
      `;
    });

    return table(["Job / Client", "Details", "Status", "Action"], rows);
  }

  function renderJobWorkspaceModal() {
    const job = jobs().find(j => j.id === state.selectedJobId);
    if (!job) return "";

    const client = findClient(job.client_id);
    const sjs = scheduledJobs().filter(sj => sj.job_id === job.id);
    const reports = jobReports().filter(r => r.job_id === job.id).slice(-3);
    const bills = billableEvents().filter(b => b.source_job_id === job.id);

    return `
      <div class="quote-modal-backdrop" data-job-action="close-workspace" style="display: flex; justify-content: flex-end; padding: 0; background: rgba(0,0,0,0.3);">
        <div class="quote-editor-modal" role="dialog" aria-modal="true" data-job-modal style="width: 90vw; max-width: 900px; height: 100vh; margin: 0; border-radius: 0; display: flex; flex-direction: column; background: var(--bg); box-shadow: -4px 0 24px rgba(0,0,0,0.15);">

          <header class="panel-head" style="background: var(--surface-soft); border-bottom: 1px solid var(--border); padding: 24px; flex-shrink: 0; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h2 style="margin: 0; font-size: 24px;">${escapeHtml(job.display_name)}</h2>
              <div class="muted" style="margin-top: 4px; font-size: 14px;">${escapeHtml(client?.display_name || "")} · ${escapeHtml(job.service_type)}</div>
              <div style="margin-top: 12px; display: flex; gap: 8px;">
                ${chip(job.status, getJobStatusTone(job.status))}
                ${chip(job.job_type, "neutral")}
                ${chip(job.billing_basis, "neutral")}
              </div>
            </div>
            <div style="display: flex; gap: 8px;">
              ${button("Edit job", "edit-job", "secondary")}
              ${button("Close", "close-workspace", "secondary")}
            </div>
          </header>

          <div style="flex: 1; overflow-y: auto; padding: 32px; display: flex; flex-direction: column; gap: 40px;">

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px;">

              <!-- Setup -->
              <div class="stack">
                <h3 style="font-size: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">Cleaning Plan / Setup</h3>
                <div class="job-section-card">
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                    <div>
                      <div class="muted" style="font-size: 12px;">Recurrence</div>
                      <div style="font-size: 14px;">${job.recurrence ? `${job.recurrence.frequency} on ${job.recurrence.day}` : "One-off"}</div>
                    </div>
                    <div>
                      <div class="muted" style="font-size: 12px;">Time & Duration</div>
                      <div style="font-size: 14px;">${job.recurrence?.start_time || "TBD"} (${job.default_duration_minutes} mins)</div>
                    </div>
                    <div>
                      <div class="muted" style="font-size: 12px;">Default Team</div>
                      <div style="font-size: 14px;">${escapeHtml(job.default_staff || "Unassigned")}</div>
                    </div>
                    <div>
                      <div class="muted" style="font-size: 12px;">Checklist</div>
                      <div style="font-size: 14px;">${escapeHtml(job.checklist_template_id || "None selected")}</div>
                    </div>
                  </div>
                  <div style="margin-top: 16px; padding-top: 16px; border-top: 1px dashed var(--border);">
                    <div class="muted" style="font-size: 12px; margin-bottom: 4px;">Cleaning notes</div>
                    <div style="font-size: 14px;">${escapeHtml(job.notes?.cleaning || "None")}</div>
                  </div>
                  <div style="margin-top: 24px;">
                    ${job.setup_complete
                      ? chip("Setup complete", "success")
                      : button("Mark setup complete", `complete-setup:${job.id}`, "primary")}
                  </div>
                </div>
              </div>

              <!-- Billing / Notes -->
              <div class="stack">
                <h3 style="font-size: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; color: transparent;">-</h3>
                <div class="job-section-card">
                  <h4>Billing Readiness</h4>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span class="muted" style="font-size: 13px;">Ready to bill</span>
                    <strong style="font-size: 13px;">${bills.filter(b => b.status === "ready_to_bill").length} events</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span class="muted" style="font-size: 13px;">Draft / Needs review</span>
                    <strong style="font-size: 13px;">${bills.filter(b => b.status === "draft").length} events</strong>
                  </div>
                </div>

                <div class="job-section-card">
                  <h4>Internal Notes</h4>
                  <div style="font-size: 13px;">${escapeHtml(job.notes?.internal || "None")}</div>
                </div>
              </div>
            </div>

            <!-- Scheduled Jobs Table -->
            <div class="stack">
              <h3 style="font-size: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px;">Generated Scheduled Cleans</h3>
              <div style="background: var(--bg); border-radius: 8px; border: 1px solid var(--border); overflow: hidden;">
                ${table(
                  ["Date", "Time", "Cleaner / Team", "Status", "Note / Reason", "Actions"],
                  sjs.map(sj => `
                    <tr>
                      <td>${escapeHtml(sj.date)}</td>
                      <td>${escapeHtml(sj.start_time)}</td>
                      <td>${escapeHtml(sj.assigned_staff)}</td>
                      <td>${chip(sj.status, getSJTone(sj.status))}</td>
                      <td class="muted">${escapeHtml(sj.skip_reason || "-")}</td>
                      <td>
                        ${sj.status === "planned" ? `
                          <div style="display: flex; gap: 4px;">
                            ${button("Complete (Fast)", `fast-complete:${sj.id}`, "small ghost")}
                            ${button("Skip", `skip-sj:${sj.id}`, "small ghost danger")}
                          </div>
                        ` : "-"}
                      </td>
                    </tr>
                  `)
                )}
              </div>
            </div>

            <!-- Recent Reports -->
            <div class="stack">
              <h3 style="font-size: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; display: flex; justify-content: space-between;">
                <span>Recent Reports</span>
                <span class="muted" style="font-size: 13px;">Showing last ${reports.length}</span>
              </h3>
              <div class="stack" style="gap: 16px;">
                ${reports.length === 0 ? `<div class="muted">No reports available.</div>` :
                  reports.map(r => `
                    <div class="job-section-card" style="display: flex; justify-content: space-between; align-items: flex-start; padding: 16px;">
                      <div>
                        <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px;">Report from ${escapeHtml(r.completed_by)}</div>
                        <div class="muted" style="font-size: 12px; margin-bottom: 8px;">${r.completed_at.replace("T", " ").replace("Z", "")}</div>
                        ${r.cleaner_remarks ? `<div style="font-size: 13px; margin-top: 4px;"><strong>Note:</strong> ${escapeHtml(r.cleaner_remarks)}</div>` : ""}
                      </div>
                      <div style="display: flex; gap: 8px; align-items: center;">
                        ${r.severity ? chip(r.severity, "danger") : chip("All good", "success")}
                        ${r.review_status === "needs_review" ? button("Mark reviewed", `review-report:${r.id}`, "small primary") : chip("Reviewed", "neutral")}
                      </div>
                    </div>
                  `).join("")
                }
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  }

  function handleClick(event) {
    const actionTarget = event.target.closest("[data-job-action]");
    const modalTarget = event.target.closest("[data-job-modal]");

    // Close modal if clicking outside
    if (!actionTarget && !modalTarget && state.selectedJobId) {
      if (event.target.classList.contains("quote-modal-backdrop")) {
        state.selectedJobId = null;
        refresh();
      }
      return;
    }

    if (!actionTarget) return;

    const action = actionTarget.getAttribute("data-job-action");

    if (action.startsWith("open-job:")) {
      state.selectedJobId = action.split(":")[1];
      refresh();
      return;
    }

    if (action === "close-workspace") {
      state.selectedJobId = null;
      refresh();
      return;
    }

    if (action.startsWith("complete-setup:")) {
      const id = action.split(":")[1];
      const job = jobs().find(j => j.id === id);
      if (job) job.setup_complete = true;
      if (window.CleanOpsShell?.toast) window.CleanOpsShell.toast("Job setup marked complete.");
      refresh();
      return;
    }

    if (action.startsWith("skip-sj:")) {
      const id = action.split(":")[1];
      const sj = scheduledJobs().find(s => s.id === id);
      if (sj) {
        sj.status = "skipped";
        sj.skip_reason = "Mock action: skipped via UI";
        if (window.CleanOpsShell?.toast) window.CleanOpsShell.toast("Scheduled clean skipped.");
        refresh();
      }
      return;
    }

    if (action.startsWith("fast-complete:")) {
      const id = action.split(":")[1];
      const sj = scheduledJobs().find(s => s.id === id);
      if (sj) {
        sj.status = "completed";
        // Create mock report and billable event
        const reportId = "REP-MOCK-" + Date.now();
        jobReports().push({
          id: reportId,
          scheduled_job_id: sj.id,
          job_id: sj.job_id,
          completed_at: new Date().toISOString(),
          completed_by: sj.assigned_staff || "System",
          checklist_status: "complete",
          cleaner_remarks: "",
          client_remarks: "",
          severity: "",
          review_status: "reviewed",
          client_visible_summary: "Completed normally."
        });

        const job = jobs().find(j => j.id === sj.job_id);
        billableEvents().push({
          id: "BE-MOCK-" + Date.now(),
          source_job_id: sj.job_id,
          source_scheduled_job_id: sj.id,
          source_report_id: reportId,
          catalogue_item_id: "cat-1",
          description: `${job?.service_type || 'Cleaning'} - ${sj.date}`,
          amount: parseFloat((job?.billing_basis || "0").replace(/[^0-9.]/g, "")) || 0,
          status: "ready_to_bill"
        });

        if (window.CleanOpsShell?.toast) window.CleanOpsShell.toast("Clean completed (All-good fast path).");
        refresh();
      }
      return;
    }

    if (action.startsWith("review-report:")) {
      const id = action.split(":")[1];
      const r = jobReports().find(rep => rep.id === id);
      if (r) {
        r.review_status = "reviewed";
        // also mark the associated billable event as ready
        const b = billableEvents().find(be => be.source_report_id === r.id);
        if (b) b.status = "ready_to_bill";

        if (window.CleanOpsShell?.toast) window.CleanOpsShell.toast("Report marked as reviewed.");
        refresh();
      }
      return;
    }

    if (action === "open-new-job") {
      if (window.CleanOpsShell?.toast) window.CleanOpsShell.toast("New job setup drawer (Mock)");
      return;
    }

    if (action === "edit-job") {
      if (window.CleanOpsShell?.toast) window.CleanOpsShell.toast("Edit job drawer (Mock)");
      return;
    }
  }

  // Export
  window.CleanOpsJobs = { render };
})();
