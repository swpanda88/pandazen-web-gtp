const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");

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
      `Preferred contact: ${form.get("contactMethod")}`,
      `Best time to contact: ${form.get("contactTime") || ""}`,
      `Area/postcode: ${form.get("area") || ""}`,
      "",
      `Service: ${form.get("service")}`,
      `Frequency: ${form.get("frequency")}`,
      `How soon: ${form.get("urgency")}`,
      `Preferred days/times: ${form.get("preferredTimes") || ""}`,
      "",
      `Property type: ${form.get("propertyType")}`,
      `Approx size: ${form.get("propertySize")}`,
      `Bedrooms: ${form.get("bedrooms")}`,
      `Bathrooms: ${form.get("bathrooms")}`,
      `Pets: ${form.get("pets")}`,
      `Parking: ${form.get("parking")}`,
      `Products: ${form.get("products")}`,
      "",
      `Priorities: ${priorities}`,
      `Photos available: ${form.get("photosAvailable")}`,
      "",
      `Notes:`,
      form.get("message") || ""
    ].join("\n")
  );
  window.location.href = `mailto:hello.pandazen@gmail.com?subject=${subject}&body=${body}`;
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
