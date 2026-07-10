# 07: Coding Standards

PandaZen prioritizes readability, simplicity, and vanilla web technologies.

## 1. General Javascript
- Use ES6 modules (`import`/`export`).
- Prefer `const` and `let` over `var`.
- Use async/await for asynchronous operations. Avoid deep `.then()` chains.
- Avoid classes unless modeling a complex state machine. Prefer pure functions or closures.

## 2. Frontend Specifics
- No bundlers (Webpack, Vite) are required for the local dev cycle of CleanOps. We use native browser ES modules.
- **State Management**: Keep state in a simple top-level `state` object within the module.
- **Rendering**: Use JS template literals for HTML generation.
  - ALWAYS use `escapeHtml(value)` when interpolating dynamic data into HTML to prevent XSS.
- **Event Handling**: Prefer global event delegation on the root container.
  ```javascript
  document.body.addEventListener('click', e => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'save') handleSave();
  });
  ```

## 3. Backend Specifics
- Use standard Cloudflare Pages Functions (`export async function onRequest(context)`).
- Extract query parameters safely (`url.searchParams.get()`).
- Always try/catch database queries and return a 500 JSON error if they fail unexpectedly, rather than crashing the worker silently.

## 4. CSS Standards
- Vanilla CSS only. No Tailwind. No SCSS.
- Rely on semantic class names (e.g., `.panel`, `.button`, `.drawer-header`).
- Avoid deeply nested selectors.

## 5. Commenting
- Do not write comments explaining *what* the code does (the code should be self-evident).
- Write comments explaining *why* the code does it, especially if there is a non-obvious business rule or an intentional workaround.
