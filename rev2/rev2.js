const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const forms = document.querySelectorAll("[data-proto-form]");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMenu() {
  menu?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  header?.classList.remove("is-open");
}

function setService(form, service) {
  form.dataset.activeService = service;
  form.querySelectorAll("[data-tab]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.tab === service));
  });
  const message = form.querySelector("[data-message]");
  if (message) {
    message.placeholder = service === "cleaning"
      ? "Tell us about the rooms, routine, priorities, frequency and anything useful about the home."
      : "Tell us about the work, property context, timing, access, number of items and whether photos would help.";
  }
}

function setupForms() {
  forms.forEach((form) => {
    setService(form, form.dataset.defaultTab || "cleaning");
    form.querySelectorAll("[data-tab]").forEach((button) => {
      button.addEventListener("click", () => setService(form, button.dataset.tab));
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get("name") || "there";
      const label = form.dataset.activeService === "works" ? "Home Works" : "Cleaning";
      form.querySelector("[data-form-status]").textContent = `Thanks ${name}. This is a preview-only ${label} enquiry pattern and has not been sent to the live PandaZen workflow.`;
    });
  });
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

function setupCinematicStacks() {
  document.querySelectorAll("[data-cinematic-stack]").forEach((stack) => {
    const images = Array.from(stack.querySelectorAll("[data-stack-image]"));
    const panels = Array.from(stack.querySelectorAll("[data-stack-panel]"));
    if (!images.length || !panels.length) return;

    function activate(index) {
      images.forEach((image, imageIndex) => {
        image.classList.toggle("is-active", imageIndex === index);
      });
    }

    if (!("IntersectionObserver" in window)) {
      activate(0);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number(entry.target.dataset.imageIndex || 0);
        activate(index);
      });
    }, {
      rootMargin: "-38% 0px -38% 0px",
      threshold: 0.01
    });

    panels.forEach((panel) => observer.observe(panel));
    activate(0);
  });
}

menuToggle?.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  header.classList.toggle("is-open", isOpen);
});

menu?.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeMenu();
});

setupForms();
setupReveal();
setupCinematicStacks();
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
