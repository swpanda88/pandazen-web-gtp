const form = document.querySelector("[data-pz-form]");
const statusNode = document.querySelector("[data-form-status]");
const steps = Array.from(document.querySelectorAll("[data-form-step]"));
let activeStep = 0;

function storageKey() {
  return `pandazen-draft-${form?.dataset.formName || location.pathname}`;
}

function setStatus(message) {
  document.querySelectorAll("[data-form-status]").forEach((node) => {
    node.textContent = message;
  });
}

function showResult(message, isError = false) {
  const result = document.querySelector("[data-form-success]");
  if (!result) return;
  result.textContent = message;
  result.hidden = false;
  result.dataset.state = isError ? "error" : "success";
}

function showStep(index) {
  activeStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => {
    step.classList.toggle("active", stepIndex === activeStep);
  });
  document.querySelectorAll("[data-step-count]").forEach((node) => {
    node.textContent = `${activeStep + 1} of ${steps.length}`;
  });
}

function formDataObject() {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (data[key]) {
      data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
      return;
    }
    data[key] = value;
  });
  return data;
}

function saveDraft(message = "Draft saved on this device.") {
  localStorage.setItem(storageKey(), JSON.stringify(formDataObject()));
  setStatus(message);
}

function clearDraft() {
  localStorage.removeItem(storageKey());
}

function loadDraft() {
  const raw = localStorage.getItem(storageKey());
  if (!raw) return;
  const data = JSON.parse(raw);
  Object.entries(data).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];
    const fields = Array.from(form.elements).filter((field) => field.name === key);
    fields.forEach((field) => {
      if (field.type === "checkbox" || field.type === "radio") {
        field.checked = values.includes(field.value);
      } else {
        field.value = values[0] || "";
      }
      field.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
  setStatus("Draft loaded from this device.");
}

function setupOtherFields(scope = document) {
  scope.querySelectorAll("[data-other-select]").forEach((select) => {
    const other = scope.querySelector(`[data-other-for="${select.name}"]`);
    const update = () => {
      if (other) other.hidden = select.value !== "other";
    };
    select.addEventListener("change", update);
    update();
  });
}

function setupRepeatables() {
  document.querySelectorAll("[data-add-row]").forEach((button) => {
    button.addEventListener("click", () => {
      const list = document.querySelector(button.dataset.addRow);
      const template = document.querySelector(button.dataset.template);
      if (!list || !template) return;
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector("[data-remove-row]")?.addEventListener("click", () => row.remove());
      list.append(row);
      setupOtherFields(row);
    });
  });

  document.querySelectorAll("[data-remove-row]").forEach((button) => {
    button.addEventListener("click", () => button.closest("[data-row]")?.remove());
  });
}

function setupBack() {
  document.querySelectorAll("[data-back]").forEach((button) => {
    button.addEventListener("click", () => {
      if (history.length > 1) {
        history.back();
        return;
      }
      location.href = "../index.html";
    });
  });
}

function setupSteps() {
  document.querySelectorAll("[data-next-step]").forEach((button) => {
    button.addEventListener("click", () => showStep(activeStep + 1));
  });
  document.querySelectorAll("[data-prev-step]").forEach((button) => {
    button.addEventListener("click", () => showStep(activeStep - 1));
  });
  showStep(0);
}

function cleanText(value) {
  return String(value || "").trim();
}

function intakePayload(data) {
  return {
    name: cleanText(data.customerName),
    area: cleanText(data.area),
    phone: cleanText(data.phone),
    email: cleanText(data.email),
    preferredContact: cleanText(data.preferredContact) || "phone",
    source: cleanText(data.source) || "website",
    sourceOther: data.source === "other" ? cleanText(data.sourceOther) : "",
    serviceType: cleanText(data.serviceType) || "regular_cleaning",
    serviceOther: data.serviceType === "other" ? cleanText(data.serviceTypeOther) : "",
    preferredDays: cleanText(data.preferredTimes),
    urgency: cleanText(data.urgency),
    status: "new",
    notes: cleanText(data.notes)
  };
}

async function submitIntake() {
  const payload = intakePayload(formDataObject());
  saveDraft("Submitting to database...");
  showResult("Submitting intake...", false);

  const response = await fetch("/api/leads", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || `Submit failed with status ${response.status}.`);
  }

  clearDraft();
  form.reset();
  setupOtherFields();
  setStatus("Submitted to database. Draft cleared.");
  showResult(`Lead saved to the database${body.id ? ` as #${body.id}` : ""}. Local draft cleared.`, false);
}

function setupSubmit() {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.dataset.formName !== "intake") {
      saveDraft();
      showResult("Saved locally as a draft preview.", false);
      return;
    }

    try {
      await submitIntake();
    } catch (err) {
      saveDraft("Submit failed. Draft kept on this device.");
      showResult(`Could not submit to the database. Draft kept locally. ${err.message}`, true);
    }
  });

  document.querySelectorAll("[data-save-draft]").forEach((button) => {
    button.addEventListener("click", saveDraft);
  });
}

if (form) {
  setupBack();
  setupSteps();
  setupOtherFields();
  setupRepeatables();
  setupSubmit();
  loadDraft();
}
