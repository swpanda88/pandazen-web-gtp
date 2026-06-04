(function () {
  const data = window.CLEANOPS_DATA;
  const state = {
    selectedJobId: null,
    setupModalOpen: false,
    completeModalSjId: null
  };

  // Data helpers
  function jobs() { return data.jobs || []; }
  function scheduledJobs() { return data.scheduledJobs || []; }
  function jobReports() { return data.jobReports || []; }
  function billableEvents() { return data.billableEvents || []; }
  function clients() { return data.clients || []; }
  function properties() { return clients().flatMap(c => (c.properties || [])); }
  function checklistTemplates() { return data.checklistTemplates || []; }

  function findClient(id) { return clients().find(c => c.id === id); }
  function findProperty(id) { return properties().find(p => p.id === id); }

  function escapeHtml(str) { return window.CleanOpsShell?.escapeHtml?.(str) || String(str || "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]); }
  function iconSvg(name) { return window.CleanOpsShell?.iconSvg?.(name) || ""; }
  function button(label, action, variant = "", icon = "") {
    if (variant === "secondary") variant = "";
    const classes = ["button", ...variant.split(" ")].filter(Boolean).join(" ");
    return `<button class="${classes}" type="button" data-job-action="${escapeHtml(action)}">${icon}${escapeHtml(label)}</button>`;
  }
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
    const job = jobs().find(j => j.id === state.selectedJobId);
    let html = job ? renderDetail(job) : renderList();
    if (state.setupModalOpen) html += renderSetupModal();
    if (state.completeModalSjId) html += renderCompleteModal();
    return html;
  }

  function renderChecklistPreview(job) {
    const tplReg = checklistTemplates().find(t => t.id === job.checklist_template_id);
    const tplDeep = checklistTemplates().find(t => t.id === job.initial_checklist_template_id);
    if (!tplReg && !tplDeep) return '';

    let html = `<article class="panel pad" style="margin-top: 16px;"><h2>Checklist Preview</h2>`;
    
    if (tplDeep) {
      html += `<div style="margin-top: 16px;"><h3 style="font-size:14px; margin-bottom:8px;">Initial Clean: ${escapeHtml(tplDeep.name)}</h3>`;
      html += tplDeep.sections.map(s => `
        <div style="margin-bottom:8px;">
          <strong style="font-size:13px;">${escapeHtml(s.name)}</strong>
          <ul style="margin: 4px 0 0 16px; font-size:13px;" class="muted">
            ${s.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}
          </ul>
        </div>
      `).join("");
      html += `</div>`;
    }

    if (tplReg) {
      html += `<div style="margin-top: 16px; ${tplDeep ? 'padding-top:16px; border-top:1px dashed var(--border);' : ''}"><h3 style="font-size:14px; margin-bottom:8px;">Regular Clean: ${escapeHtml(tplReg.name)}</h3>`;
      html += tplReg.sections.map(s => `
        <div style="margin-bottom:8px;">
          <strong style="font-size:13px;">${escapeHtml(s.name)}</strong>
          <ul style="margin: 4px 0 0 16px; font-size:13px;" class="muted">
            ${s.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}
          </ul>
        </div>
      `).join("");
      html += `</div>`;
    }

    html += `</article>`;
    return html;
  }

  function renderSetupModal() {
    const job = jobs().find(j => j.id === state.selectedJobId);
    if (!job) return '';
    return `
      <div class="quote-modal-backdrop" data-job-action="close-setup-modal" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; justify-content:flex-end;">
        <div style="background:var(--bg); width:400px; height:100%; padding:24px; box-shadow:-5px 0 20px rgba(0,0,0,0.1); overflow-y:auto;" data-job-modal="true" onclick="event.stopPropagation()">
          <h2 style="margin-bottom:24px;">Job Setup / Edit</h2>
          <div class="field-row" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Service Type</label>
            <input type="text" class="inputish" style="width:100%;" value="${escapeHtml(job.service_type)}">
          </div>
          <div class="field-row" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Recurrence</label>
            <select class="selectish" style="width:100%;">
              <option>Weekly</option><option>Fortnightly</option><option>Monthly</option><option>One-off</option>
            </select>
          </div>
          <div class="field-row" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Day/Time</label>
            <input type="text" class="inputish" style="width:100%;" value="${escapeHtml(job.recurrence?.day || '')} ${escapeHtml(job.recurrence?.start_time || '')}">
          </div>
          <div class="field-row" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Duration (mins)</label>
            <input type="number" class="inputish" style="width:100%;" value="${job.default_duration_minutes}">
          </div>
          <div class="field-row" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Default Team</label>
            <input type="text" class="inputish" style="width:100%;" value="${escapeHtml(job.default_staff || '')}">
          </div>
          <div class="field-row" style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Regular Checklist</label>
            <select class="selectish" style="width:100%;">
              <option value="tpl-reg" ${job.checklist_template_id==='tpl-reg'?'selected':''}>Regular domestic clean</option>
              <option value="tpl-deep" ${job.checklist_template_id==='tpl-deep'?'selected':''}>Initial deep clean</option>
              <option value="tpl-eot" ${job.checklist_template_id==='tpl-eot'?'selected':''}>End of tenancy clean</option>
            </select>
          </div>
          <div style="margin-top:32px; display:flex; gap:8px;">
            ${button("Cancel", "close-setup-modal", "ghost")}
            ${button("Save", "save-setup", "primary")}
          </div>
        </div>
      </div>
    `;
  }

  function renderCompleteModal() {
    const sj = scheduledJobs().find(s => s.id === state.completeModalSjId);
    if (!sj) return '';
    return `
      <div class="quote-modal-backdrop" data-job-action="close-complete-modal" style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:100; display:flex; align-items:center; justify-content:center;">
        <div style="background:var(--bg); border-radius:8px; width:400px; padding:24px; box-shadow:0 10px 30px rgba(0,0,0,0.2);" data-job-modal="true" onclick="event.stopPropagation()">
          <h2 style="margin-bottom:16px;">Complete with note</h2>
          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Cleaner remarks</label>
            <textarea id="mock-cleaner-note" class="inputish" style="width:100%; height:60px;" placeholder="e.g. Oven took longer than expected."></textarea>
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Severity</label>
            <select id="mock-severity" class="selectish" style="width:100%;">
              <option value="Note">Note</option>
              <option value="Extra time">Extra time</option>
              <option value="Access issue">Access issue</option>
              <option value="Complaint">Complaint</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div style="margin-bottom:24px;">
            <label style="display:block; font-size:12px; margin-bottom:4px;">Checklist status</label>
            <select id="mock-checklist-status" class="selectish" style="width:100%;">
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            ${button("Cancel", "close-complete-modal", "ghost")}
            ${button("Submit", \`submit-complete-note:\${sj.id}\`, "primary")}
          </div>
        </div>
      </div>
    `;
  }

  function renderList() {
    return `
      ${window.CleanOpsShell?.pageHead?.("Jobs", "Manage accepted work, cleaning plans, reports, and billing readiness.", button("New job", "open-new-job", "primary")) || `
        <div class="page-head">
          <div>
            <h1>Jobs</h1>
            <p class="muted" style="margin-top:10px">Manage accepted work, cleaning plans, reports, and billing readiness.</p>
          </div>
          <div class="page-actions">${button("New job", "open-new-job", "primary")}</div>
        </div>
      `}

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
    `;
  }

  function renderActionPanel() {
    const setupJobs = jobs().filter(j => j.status === "setup" || !j.setup_complete);
    const reportsToReview = jobReports().filter(r => r.review_status === "needs_review");
    const billable = billableEvents().filter(b => b.status === "ready_to_bill");

    const renderRow = (title, meta, context, chipHtml, action) => `
      <tr class="job-row" tabindex="0" role="button" data-job-action="${action}">
        <td>
          <strong style="display: block; font-size: 13px; margin-bottom: 4px;">${escapeHtml(title)}</strong>
          <span class="muted" style="font-size: 12px; display: block; margin-bottom: 6px;">${escapeHtml(meta)}</span>
          <span style="font-size: 12px; display: block; margin-bottom: 8px;">${escapeHtml(context)}</span>
          ${chipHtml}
        </td>
      </tr>
    `;

    const renderPanel = (title, count, itemsHtml) => `
      <article class="panel">
        <div class="panel-head">
          <h2 class="panel-title">${escapeHtml(title)}</h2>
          <span style="background:var(--bg); padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; border: 1px solid var(--line);">${count}</span>
        </div>
        <div class="table-wrapper">
          <table class="table">
            <tbody>
              ${itemsHtml || `<tr><td class="muted" style="text-align:center; padding: 24px;">No items</td></tr>`}
            </tbody>
          </table>
        </div>
      </article>
    `;

    return `
      <div class="jobs-action-grid">
        ${renderPanel("Needs setup", setupJobs.length, setupJobs.map(j => {
            const reasons = [];
            if (!j.checklist_template_id) reasons.push("Checklist missing");
            if (!j.default_staff) reasons.push("Team missing");
            if (!j.pricing_items || j.pricing_items.length === 0) reasons.push("Pricing missing");
            if (reasons.length === 0) reasons.push("Setup unconfirmed");

            return renderRow(
              j.display_name,
              `${findClient(j.client_id)?.display_name || ""} · ${j.service_type}`,
              reasons.join(", "),
              chip("Setup required", "warning"),
              `open-job:${j.id}`
            );
          }).join("")
        )}

        ${renderPanel("Needs review", reportsToReview.length, reportsToReview.map(r => {
            const j = jobs().find(job => job.id === r.job_id);
            const sj = scheduledJobs().find(s => s.id === r.scheduled_job_id);
            return renderRow(
              j?.display_name || "Unknown Job",
              `Report from ${escapeHtml(r.completed_by)} on ${sj?.date || ''}`,
              r.cleaner_remarks || r.client_remarks || "Review requested",
              chip(r.severity || "Note", r.severity === "Extra time" || r.severity === "Note" ? "warning" : "danger"),
              `open-job:${r.job_id}`
            );
          }).join("")
        )}

        ${renderPanel("Ready to bill", billable.length, billable.map(b => {
            const j = jobs().find(job => job.id === b.source_job_id);
            return renderRow(
              `£${b.amount.toFixed(2)}`,
              b.description,
              j?.display_name || "Unknown Job",
              chip("Ready", "success"),
              `open-job:${b.source_job_id}`
            );
          }).join("")
        )}
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
      const priceLabel = job.pricing_items && job.pricing_items.length > 0 ? job.pricing_items.map(p => `£${p.amount}`).join(" + ") : "Unpriced";

      return `
        <tr>
          <td>
            <strong style="display: block; font-size: 14px; margin-bottom: 2px;">${escapeHtml(job.display_name)}</strong>
            <span class="muted" style="font-size: 13px;">${escapeHtml(client?.display_name || "")} · ${escapeHtml(job.service_type)} · ${job.job_type}</span>
          </td>
          <td>
            <div style="font-size: 13px;">${escapeHtml(nextText)}</div>
            <div class="muted" style="font-size: 13px; margin-top: 4px;">${escapeHtml(priceLabel)} · ${escapeHtml(reportText)}</div>
          </td>
          <td>${chip(job.status, getJobStatusTone(job.status))}</td>
          <td style="text-align: right;">${button("Open workspace", `open-job:${job.id}`, "small ghost")}</td>
        </tr>
      `;
    });

    return table(["Job / Client", "Details", "Status", "Action"], rows);
  }

  function renderDetail(job) {
    const client = findClient(job.client_id);
    const sjs = scheduledJobs().filter(sj => sj.job_id === job.id);
    const reports = jobReports().filter(r => r.job_id === job.id).slice(-3);
    const bills = billableEvents().filter(b => b.source_job_id === job.id);

    return `
      <div class="client-breadcrumb">
        <span>PandaZen</span>
        <span>/</span>
        <button type="button" data-job-action="close-workspace">Jobs</button>
        <span>/</span>
        <strong>${escapeHtml(job.display_name)}</strong>
      </div>

      <div class="page-head">
        <div class="title-row">
          <h1>${escapeHtml(job.display_name)}</h1>
        </div>
        <p class="muted" style="margin-top: 4px;">· ${escapeHtml(client?.display_name || "")} · ${escapeHtml(job.service_type)}</p>
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          ${chip(job.status, getJobStatusTone(job.status))}
          ${chip(job.job_type, "neutral")}
          ${chip(job.billing_basis, "neutral")}
        </div>
        <div class="page-actions" style="margin-top: -30px; float: right;">
          ${button("Edit job", "edit-job")}
          ${button("Close", "close-workspace")}
        </div>
      </div>

      <section class="grid-detail">
        <!-- Left Column -->
        <div class="stack">
          <!-- Setup -->
            <article class="panel pad">
              <h2 style="margin-bottom: 16px;">Cleaning Plan / Setup</h2>
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
            </article>

            <!-- Checklist Preview -->
            ${renderChecklistPreview(job)}

            <!-- Scheduled Jobs Table -->
            <article class="panel">
              <div class="panel-head"><h2>Generated Scheduled Cleans</h2></div>
              <div class="table-wrapper">
                ${table(
                  ["Date", "Time", "Clean Type", "Duration", "Cleaner / Team", "Status", "Note", "Actions"],
                  sjs.map(sj => {
                    const pricing = job.pricing_items?.find(p => p.id === sj.pricing_item_id);
                    const amountLabel = pricing ? \`£\${pricing.amount.toFixed(2)}\` : "-";
                    return \`
                    <tr>
                      <td>\${escapeHtml(sj.date)}</td>
                      <td>\${escapeHtml(sj.start_time)}</td>
                      <td>\${chip(sj.clean_type || "regular", sj.clean_type === "initial" ? "warning" : "info")}</td>
                      <td>\${escapeHtml(sj.duration_minutes)}m<br><span class="muted" style="font-size:11px;">\${amountLabel}</span></td>
                      <td>\${escapeHtml(sj.assigned_staff)}</td>
                      <td>\${chip(sj.status, getSJTone(sj.status))}</td>
                      <td class="muted">\${escapeHtml(sj.skip_reason || "-")}</td>
                      <td>
                        \${sj.status === "planned" ? \`
                          <div style="display: flex; gap: 4px; flex-wrap:wrap;">
                            \${button("All good", \`fast-complete:\${sj.id}\`, "small ghost")}
                            \${button("With note", \`open-complete-modal:\${sj.id}\`, "small ghost")}
                            \${button("Skip", \`skip-sj:\${sj.id}\`, "small ghost danger")}
                          </div>
                        \` : "-"}
                      </td>
                    </tr>
                  \`})
                )}
              </div>
            </article>

            <!-- Recent Reports -->
            <article class="panel pad">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px;">
                <h2>Recent Reports</h2>
                <span class="muted" style="font-size: 13px;">Showing last ${reports.length}</span>
              </div>
              <div class="stack" style="gap: 16px;">
                ${reports.length === 0 ? `<div class="muted">No reports available.</div>` :
                  reports.map(r => `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 16px; border: 1px solid var(--border); border-radius: 6px;">
                      <div>
                        <div style="font-weight: 500; font-size: 14px; margin-bottom: 4px;">Report from ${escapeHtml(r.completed_by)}</div>
                        <div class="muted" style="font-size: 12px; margin-bottom: 8px;">${r.completed_at.replace("T", " ").replace("Z", "")}</div>
                        ${r.cleaner_remarks ? `<div style="font-size: 13px; margin-top: 4px;"><strong>Note:</strong> ${escapeHtml(r.cleaner_remarks)}</div>` : ""}
                      </div>
                      <div style="display: flex; gap: 8px; align-items: center; flex-wrap:wrap; justify-content:flex-end;">
                        ${r.severity ? chip(r.severity, "danger") : chip("All good", "success")}
                        ${r.review_status === "needs_review" ? `
                          ${button("Mark reviewed", \`review-report:\${r.id}\`, "small primary")}
                          ${button("Not billable", \`toast:Marked not billable\`, "small ghost")}
                          ${button("Revisit", \`toast:Revisit created\`, "small ghost")}
                          ${button("Escalate", \`toast:Escalated to management\`, "small ghost danger")}
                        ` : chip("Reviewed", "neutral")}
                      </div>
                    </div>
                  `).join("")
                }
              </div>
            </article>

          </div>

          <!-- Right Column -->
          <aside class="stack">
            <!-- Billing Readiness -->
            <article class="panel pad">
              <h2>Billing Readiness</h2>
              <div style="margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                  <h3 style="font-size:13px; margin-bottom:0;">Ready to bill</h3>
                  <strong style="font-size: 13px;">${bills.filter(b => b.status === "ready_to_bill").length} events</strong>
                </div>
                ${bills.filter(b => b.status === "ready_to_bill").map(b => `
                  <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; padding-bottom:4px; border-bottom:1px solid var(--border);">
                    <div>£${b.amount.toFixed(2)} — ${escapeHtml(b.description)}</div>
                  </div>
                `).join("") || '<div class="muted" style="font-size:13px;">None</div>'}
              </div>
              <div style="margin-top: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                  <h3 style="font-size:13px; margin-bottom:0;">Draft / Needs review</h3>
                  <strong style="font-size: 13px;">${bills.filter(b => b.status === "draft").length} events</strong>
                </div>
                ${bills.filter(b => b.status === "draft").map(b => `
                  <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px; padding-bottom:4px; border-bottom:1px solid var(--border);">
                    <div>£${b.amount.toFixed(2)} — ${escapeHtml(b.description)}</div>
                  </div>
                `).join("") || '<div class="muted" style="font-size:13px;">None</div>'}
              </div>
            </article>

            <!-- Internal Notes -->
            <article class="panel pad">
              <h2>Internal Notes</h2>
              <p class="muted" style="margin-top:8px">Only visible to your team.</p>
              <div class="inputish" style="height:auto; min-height:86px; margin-top:14px; align-items:flex-start; padding-top:10px">${escapeHtml(job.notes?.internal || "None")}</div>
            </article>
          </aside>
      </section>
    `;
  }

  function handleClick(event) {
    const actionTarget = event.target.closest("[data-job-action]");
    if (!actionTarget) return;

    const action = actionTarget.getAttribute("data-job-action");

    if (action.startsWith("toast:")) {
      const msg = action.split(":")[1];
      if (window.CleanOpsShell?.toast) window.CleanOpsShell.toast(msg);
      return;
    }

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

    if (action === "close-setup-modal") {
      state.setupModalOpen = false;
      refresh();
      return;
    }

    if (action === "save-setup") {
      state.setupModalOpen = false;
      const job = jobs().find(j => j.id === state.selectedJobId);
      if (job) job.setup_complete = true;
      if (window.CleanOpsShell?.toast) window.CleanOpsShell.toast("Job setup saved and marked complete.");
      refresh();
      return;
    }

    if (action === "edit-job") {
      state.setupModalOpen = true;
      refresh();
      return;
    }

    if (action.startsWith("open-complete-modal:")) {
      state.completeModalSjId = action.split(":")[1];
      refresh();
      return;
    }

    if (action === "close-complete-modal") {
      state.completeModalSjId = null;
      refresh();
      return;
    }

    if (action.startsWith("submit-complete-note:")) {
      const id = action.split(":")[1];
      const sj = scheduledJobs().find(s => s.id === id);
      if (sj) {
        sj.status = "completed";
        const noteInput = document.getElementById("mock-cleaner-note");
        const severityInput = document.getElementById("mock-severity");
        const checklistInput = document.getElementById("mock-checklist-status");
        
        const note = noteInput ? noteInput.value : "";
        const severity = severityInput ? severityInput.value : "Note";
        const chkStatus = checklistInput ? checklistInput.value : "complete";

        const reportId = "REP-MOCK-" + Date.now();
        jobReports().push({
          id: reportId,
          scheduled_job_id: sj.id,
          job_id: sj.job_id,
          completed_at: new Date().toISOString(),
          completed_by: sj.assigned_staff || "System",
          checklist_status: chkStatus,
          cleaner_remarks: note,
          client_remarks: "",
          severity: severity === "Note" ? "" : severity,
          review_status: "needs_review",
          client_visible_summary: ""
        });

        const job = jobs().find(j => j.id === sj.job_id);
        const pricing = job?.pricing_items?.find(p => p.id === sj.pricing_item_id);
        const amount = pricing ? pricing.amount : 0;
        
        billableEvents().push({
          id: "BE-MOCK-" + Date.now(),
          source_job_id: sj.job_id,
          source_scheduled_job_id: sj.id,
          source_report_id: reportId,
          pricing_item_id: sj.pricing_item_id,
          pricing_type: sj.clean_type || "regular",
          description: `${pricing?.description || 'Cleaning'} - ${sj.date}`,
          amount: amount,
          status: "draft"
        });

        state.completeModalSjId = null;
        if (window.CleanOpsShell?.toast) window.CleanOpsShell.toast("Clean completed with note. Sent for review.");
        refresh();
      }
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
        const pricing = job?.pricing_items?.find(p => p.id === sj.pricing_item_id);
        const amount = pricing ? pricing.amount : 0;

        billableEvents().push({
          id: "BE-MOCK-" + Date.now(),
          source_job_id: sj.job_id,
          source_scheduled_job_id: sj.id,
          source_report_id: reportId,
          pricing_item_id: sj.pricing_item_id,
          pricing_type: sj.clean_type || "regular",
          description: `${pricing?.description || 'Cleaning'} - ${sj.date}`,
          amount: amount,
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
  }

  // Export
  window.CleanOpsJobs = { render };
})();
