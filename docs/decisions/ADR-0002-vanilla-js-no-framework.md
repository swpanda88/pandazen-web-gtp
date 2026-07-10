# ADR-0002: Vanilla JS and CSS Without Frameworks

**Status:** Accepted  

## Context
Modern frontend development often defaults to large frameworks (React, Vue) or utility libraries (Tailwind). However, PandaZen CleanOps requires rapid AI development, minimal build steps, and straightforward logic without abstract layers.

## Decision
We chose to build the entire CleanOps frontend using pure HTML, Vanilla ES6 JavaScript modules, and Vanilla CSS. We use a simple `state -> render -> innerHTML` pattern rather than a virtual DOM.

## Consequences
- **Pros:** No build step (`npm run build` is unnecessary for local dev). Instant refresh. AI agents can easily understand and modify standard DOM APIs without learning complex React hooks or state libraries. Maximum control over styling.
- **Cons:** DOM updates are fully destructive (`innerHTML`), which can lose focus or scroll state if not managed carefully. We have to manually bind and re-bind global event listeners.
