const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const form = document.querySelector("[data-maintenance-form]");
const formStatus = document.querySelector("[data-form-status]");

const projects = [
  {
    title: "Joinery-led kitchen detailing",
    image: "../assets/kitchen.jpg",
    alt: "Refined kitchen with detailed cabinetry and brass handles",
    tags: ["Joinery", "Installations", "Finishing"],
    copy: "A composed kitchen setting used here to represent fitted work, careful alignment, material sensitivity and a standard of finish beyond everyday repair.",
    quote: "Placeholder reference: The work was planned carefully and finished with real attention to the detail of the room."
  },
  {
    title: "Bathroom finish and repair thinking",
    image: "../assets/bathroom.jpg",
    alt: "Bright bathroom with careful interior finish",
    tags: ["Bathrooms", "Repairs", "Detailing"],
    copy: "Bathroom-related maintenance often depends on small details being handled cleanly: edges, sealants, fittings, surfaces and the surrounding finish.",
    quote: "Placeholder reference: The space was left calm, tidy and ready to use, with the practical issue properly resolved."
  },
  {
    title: "Living-space problem solving",
    image: "../assets/living.jpg",
    alt: "Elegant living and dining space with artwork and layered details",
    tags: ["Interior improvements", "Problem solving", "Occupied homes"],
    copy: "Maintenance and improvement work should feel integrated with the home rather than imposed on it. The approach is thoughtful, practical and visually aware.",
    quote: "Placeholder reference: Communication was clear and the work respected the way the home is lived in."
  }
];

let activeProject = 0;

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeNav() {
  nav?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  header?.classList.remove("is-open");
}

function renderProject(index) {
  const showcase = document.querySelector("[data-project-showcase]");
  if (!showcase) return;

  activeProject = (index + projects.length) % projects.length;
  const project = projects[activeProject];
  const media = showcase.querySelector(".project-media");
  const image = showcase.querySelector("[data-project-image]");
  const title = showcase.querySelector("[data-project-title]");
  const copy = showcase.querySelector("[data-project-copy]");
  const quote = showcase.querySelector("[data-project-quote]");
  const tags = showcase.querySelector("[data-project-tags]");
  const counter = showcase.querySelector("[data-project-counter]");

  media?.classList.add("is-changing");
  window.setTimeout(() => {
    image.src = project.image;
    image.alt = project.alt;
    title.textContent = project.title;
    copy.textContent = project.copy;
    quote.textContent = project.quote;
    tags.replaceChildren(...project.tags.map((tag) => {
      const item = document.createElement("span");
      item.textContent = tag;
      return item;
    }));
    counter.textContent = `${String(activeProject + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
    document.querySelectorAll("[data-project-thumb]").forEach((button, thumbIndex) => {
      button.setAttribute("aria-current", String(thumbIndex === activeProject));
    });
    media?.classList.remove("is-changing");
  }, 120);
}

function setupProjects() {
  const showcase = document.querySelector("[data-project-showcase]");
  if (!showcase) return;

  const thumbs = showcase.querySelector("[data-project-thumbs]");
  thumbs.replaceChildren(...projects.map((project, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.projectThumb = String(index);
    button.setAttribute("aria-label", `Show project: ${project.title}`);
    button.innerHTML = `<img src="${project.image}" alt="">`;
    button.addEventListener("click", () => renderProject(index));
    return button;
  }));

  showcase.querySelector("[data-project-prev]")?.addEventListener("click", () => renderProject(activeProject - 1));
  showcase.querySelector("[data-project-next]")?.addEventListener("click", () => renderProject(activeProject + 1));
  renderProject(0);
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

navToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  header.classList.toggle("is-open", isOpen);
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeNav();
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name") || "there";
  formStatus.textContent = `Thanks ${name}. This is a preview-only maintenance enquiry pattern and has not been sent to the live PandaZen Cleaning workflow.`;
});

setupProjects();
setupReveal();
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });
