const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMenu() {
  menu?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  header?.classList.remove("is-open");
}

function setupForms() {
  document.querySelectorAll("[data-service-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const name = data.get("name") || "there";
      const label = form.dataset.serviceLabel || "PandaZen";
      const status = form.querySelector("[data-form-status]");
      if (status) {
        status.textContent = `Thanks ${name}. Please call or email PandaZen to complete your ${label} enquiry.`;
      }
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
        activate(Number(entry.target.dataset.imageIndex || 0));
      });
    }, {
      rootMargin: "-38% 0px -38% 0px",
      threshold: 0.01
    });

    panels.forEach((panel) => observer.observe(panel));
    activate(0);
  });
}

function setupProjectShowcase() {
  const showcase = document.querySelector("[data-project-showcase]");
  if (!showcase) return;

  const projects = [
    {
      image: "assets/bathroom-finish.png",
      alt: "Warm bathroom with green tile, brass fittings and stone vanity",
      location: "Durham home",
      title: "Bathroom finish and fittings",
      description: "A refined bathroom update with careful fitting, sealing, surface protection and finishing details around existing materials.",
      tags: "Bathroom works / finishing / fittings",
      quote: "Careful sequencing and a calm finish for a room that needed to remain practical throughout the work."
    },
    {
      image: "assets/joinery-detail.png",
      alt: "Detailed built-in shelves and cabinetry",
      location: "Residential interior",
      title: "Bespoke joinery detail",
      description: "Fitted storage and shelving designed to feel integrated with the room, with close attention to proportion, lines and usable space.",
      tags: "Joinery / bespoke installation / storage",
      quote: "A practical improvement made to look settled, intentional and part of the home."
    },
    {
      image: "assets/home-works-living.png",
      alt: "Elegant living space with completed built-in joinery and warm detailing",
      location: "Family living space",
      title: "Living room improvement",
      description: "Interior improvements, repairs and finishing work brought together so the room feels more resolved and easier to live with.",
      tags: "Interior improvements / repairs / finishing",
      quote: "The final details matter because they are the part clients live with every day."
    }
  ];

  const image = showcase.querySelector("[data-project-image]");
  const location = showcase.querySelector("[data-project-location]");
  const title = showcase.querySelector("[data-project-title]");
  const description = showcase.querySelector("[data-project-description]");
  const tags = showcase.querySelector("[data-project-tags]");
  const quote = showcase.querySelector("[data-project-quote]");
  const thumbs = Array.from(showcase.querySelectorAll("[data-project-thumb]"));
  const previous = showcase.querySelector("[data-project-prev]");
  const next = showcase.querySelector("[data-project-next]");
  let activeIndex = 0;

  function setProject(index) {
    activeIndex = (index + projects.length) % projects.length;
    const project = projects[activeIndex];
    image?.classList.add("is-changing");
    window.setTimeout(() => {
      if (image) {
        image.src = project.image;
        image.alt = project.alt;
        image.classList.remove("is-changing");
      }
      if (location) location.textContent = project.location;
      if (title) title.textContent = project.title;
      if (description) description.textContent = project.description;
      if (tags) tags.textContent = project.tags;
      if (quote) quote.textContent = project.quote;
      thumbs.forEach((thumb, thumbIndex) => {
        thumb.setAttribute("aria-pressed", String(thumbIndex === activeIndex));
      });
    }, 120);
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => setProject(Number(thumb.dataset.index || 0)));
  });
  previous?.addEventListener("click", () => setProject(activeIndex - 1));
  next?.addEventListener("click", () => setProject(activeIndex + 1));
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
setupProjectShowcase();
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
