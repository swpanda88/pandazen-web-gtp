const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");

function valueOrNotSelected(value) {
  return value || "Not selected";
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

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(contactForm);
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
      "",
      `Notes:`,
      form.get("message") || ""
    ].join("\n")
  );
  window.location.href = `mailto:hello.pandazen@gmail.com?subject=${subject}&body=${body}`;
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
