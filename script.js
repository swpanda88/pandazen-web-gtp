const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const submitStatus = document.querySelector("[data-form-submit-status]");

if (contactForm) contactForm.noValidate = true;

function valueOrNotSelected(value) {
  return value || "Not selected";
}

function formPayload(form) {
  return {
    website: form.get("website") || "",
    name: form.get("name") || "",
    phone: form.get("phone") || "",
    email: form.get("email") || "",
    contactMethod: form.get("contactMethod") || "",
    contactTime: form.get("contactTime") || "",
    area: form.get("area") || "",
    service: form.get("service") || "",
    frequency: form.get("frequency") || "",
    urgency: form.get("urgency") || "",
    preferredTimes: form.get("preferredTimes") || "",
    propertyType: form.get("propertyType") || "",
    propertySize: form.get("propertySize") || "",
    bedrooms: form.get("bedrooms") || "",
    bathrooms: form.get("bathrooms") || "",
    pets: form.get("pets") || "",
    parking: form.get("parking") || "",
    products: form.get("products") || "",
    photosAvailable: form.get("photosAvailable") || "",
    priorities: form.getAll("priorities"),
    message: form.get("message") || "",
    privacyAcknowledgement: Boolean(form.get("privacyAcknowledgement")),
    marketingConsent: Boolean(form.get("marketingConsent"))
  };
}

const fieldMessages = {
  name: "Please enter your name.",
  contact: "Please enter either an email address or a phone number.",
  email: "Please enter a valid email address.",
  area: "Please enter your area or postcode.",
  service: "Please choose a cleaning service.",
  privacyAcknowledgement: "Please confirm the privacy notice."
};

function fieldControl(name) {
  return contactForm?.querySelector(`[name="${name}"]`);
}

function clearFormErrors() {
  contactForm.querySelectorAll(".field-error-message").forEach((item) => item.remove());
  contactForm.querySelectorAll(".field-error-control").forEach((item) => {
    item.classList.remove("field-error-control");
    item.removeAttribute("aria-invalid");
    item.removeAttribute("aria-describedby");
  });
  contactForm.querySelectorAll(".field-error-label").forEach((item) => item.classList.remove("field-error-label"));
}

function markField(name, message, descriptionId = null) {
  const control = fieldControl(name);
  if (!control) return;
  const label = control.closest("label");
  const messageId = `field-error-${name}`;
  control.classList.add("field-error-control");
  control.setAttribute("aria-invalid", "true");

  if (message) {
    control.setAttribute("aria-describedby", messageId);
    label?.classList.add("field-error-label");

    const errorText = document.createElement("span");
    errorText.id = messageId;
    errorText.className = "field-error-message";
    errorText.textContent = message;
    label?.appendChild(errorText);
  } else if (descriptionId) {
    control.setAttribute("aria-describedby", descriptionId);
    label?.classList.add("field-error-label");
  }
}

function showFormErrors(errors) {
  clearFormErrors();
  const entries = Object.entries(errors).filter(([, message]) => message);
  entries.forEach(([field, message]) => {
    if (field === "contact") {
      markField("email", message);
      markField("phone", null, "field-error-email");
      return;
    }
    markField(field, message);
  });

  submitStatus.classList.add("error");
  submitStatus.textContent = entries.map(([, message]) => message).join(" ");

  const firstField = entries[0]?.[0] === "contact" ? "email" : entries[0]?.[0];
  fieldControl(firstField)?.focus();
}

function frontendErrors(payload) {
  const errors = {};
  if (!payload.name) errors.name = fieldMessages.name;
  if (!payload.phone && !payload.email) errors.contact = fieldMessages.contact;
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = fieldMessages.email;
  if (!payload.area) errors.area = fieldMessages.area;
  if (!payload.service) errors.service = fieldMessages.service;
  if (!payload.privacyAcknowledgement) errors.privacyAcknowledgement = fieldMessages.privacyAcknowledgement;
  return errors;
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  header.classList.toggle("is-open", isOpen);
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    header.classList.remove("is-open");
  }
});

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(contactForm);
  const payload = formPayload(form);
  clearFormErrors();
  submitStatus.classList.remove("error");
  const errors = frontendErrors(payload);
  if (Object.keys(errors).length) {
    showFormErrors(errors);
    return;
  }
  submitStatus.textContent = "Sending your request...";

  if (window.location.protocol !== "file:") {
    try {
      const response = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const backendErrors = result.fields && typeof result.fields === "object"
          ? result.fields
          : { form: result.error || result.message || "Please check the highlighted details and try again." };
        showFormErrors(backendErrors);
        return;
      }
      contactForm.reset();
      clearFormErrors();
      submitStatus.textContent = result.message || "Thanks, your request has been received.";
      return;
    } catch {
      submitStatus.classList.add("error");
      submitStatus.textContent = "Sorry, the form could not send just now. Please call or email Panda Zen.";
      return;
    }
  }

  const priorities = form.getAll("priorities").join(", ") || "Not specified";
  const subject = encodeURIComponent("Panda Zen quote request");
  const body = encodeURIComponent(
    [
      `Name: ${form.get("name")}`,
      `Phone: ${form.get("phone")}`,
      `Email: ${form.get("email") || ""}`,
      `Preferred contact: ${valueOrNotSelected(form.get("contactMethod"))}`,
      `Best time to contact: ${form.get("contactTime") || ""}`,
      `Area/postcode: ${form.get("area") || ""}`,
      "",
      `Service: ${valueOrNotSelected(form.get("service"))}`,
      `Frequency: ${valueOrNotSelected(form.get("frequency"))}`,
      `How soon: ${valueOrNotSelected(form.get("urgency"))}`,
      `Preferred days/times: ${form.get("preferredTimes") || ""}`,
      "",
      `Property type: ${valueOrNotSelected(form.get("propertyType"))}`,
      `Approx size: ${valueOrNotSelected(form.get("propertySize"))}`,
      `Bedrooms: ${valueOrNotSelected(form.get("bedrooms"))}`,
      `Bathrooms: ${valueOrNotSelected(form.get("bathrooms"))}`,
      `Pets: ${valueOrNotSelected(form.get("pets"))}`,
      `Parking: ${valueOrNotSelected(form.get("parking"))}`,
      `Products: ${valueOrNotSelected(form.get("products"))}`,
      "",
      `Priorities: ${priorities}`,
      `Photos available: ${valueOrNotSelected(form.get("photosAvailable"))}`,
      `Privacy acknowledgement: ${form.get("privacyAcknowledgement") ? "Yes" : "No"}`,
      `Marketing consent: ${form.get("marketingConsent") ? "Yes" : "No"}`,
      "",
      `Notes:`,
      form.get("message") || ""
    ].join("\n")
  );
  window.location.href = `mailto:hello.pandazen@gmail.com?subject=${subject}&body=${body}`;
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
