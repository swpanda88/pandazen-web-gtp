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
  const subject = encodeURIComponent("Panda Zen cleaning enquiry");
  const body = encodeURIComponent(
    `Name: ${form.get("name")}\nContact: ${form.get("contact")}\nService: ${form.get("service")}\n\nMessage:\n${form.get("message") || ""}`
  );
  window.location.href = `mailto:hello.pandazen@gmail.com?subject=${subject}&body=${body}`;
});

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
