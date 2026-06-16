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
  submitStatus.classList.remove("error");
  if (!payload.name) {
    submitStatus.classList.add("error");
    submitStatus.textContent = "Please add your name.";
    return;
  }
  if (!payload.phone && !payload.email) {
    submitStatus.classList.add("error");
    submitStatus.textContent = "Please add a phone number or email address.";
    return;
  }
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    submitStatus.classList.add("error");
    submitStatus.textContent = "Please add a valid email address.";
    return;
  }
  if (!payload.area) {
    submitStatus.classList.add("error");
    submitStatus.textContent = "Please add your area or postcode.";
    return;
  }
  if (!payload.service) {
    submitStatus.classList.add("error");
    submitStatus.textContent = "Please choose a service type.";
    return;
  }
  if (!payload.privacyAcknowledgement) {
    submitStatus.classList.add("error");
    submitStatus.textContent = "Please confirm you have read the Privacy Policy.";
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
        submitStatus.classList.add("error");
        submitStatus.textContent = result.error || result.message || "Please check the highlighted details and try again.";
        return;
      }
      contactForm.reset();
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
