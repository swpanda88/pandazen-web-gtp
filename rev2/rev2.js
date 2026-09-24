const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const form = document.querySelector("[data-proto-form]");
const formStatus = document.querySelector("[data-form-status]");
const message = document.querySelector("[data-message]");
const tabButtons = document.querySelectorAll("[data-tab]");

let activeService = "cleaning";

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMenu() {
  menu?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  header?.classList.remove("is-open");
}

function setService(service) {
  activeService = service;
  tabButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.tab === service));
  });
  if (message) {
    message.placeholder = service === "cleaning"
      ? "Tell us about the rooms, routine or cleaning priorities."
      : "Tell us about the work, property context, timing, access and whether photos would help.";
  }
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  items.forEach((item) => observer.observe(item));
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  header.classList.toggle("is-open", isOpen);
});

menu?.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeMenu();
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => setService(button.dataset.tab));
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name") || "there";
  const label = activeService === "cleaning" ? "Cleaning" : "Home Works";
  formStatus.textContent = `Thanks ${name}. This is a preview-only ${label} enquiry pattern and has not been sent to the live PandaZen workflow.`;
});

setService(activeService);
setupReveal();
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
