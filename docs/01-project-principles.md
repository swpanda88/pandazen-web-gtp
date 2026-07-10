# 01: Project Principles

These principles guide all decisions made by AI agents and humans on PandaZen. If you encounter a situation not explicitly documented, fall back to these rules.

## 1. Reuse Existing Architecture
- **Do not invent new patterns** if an existing one works.
- If we have a way of rendering dropdowns, saving forms, or authenticating, copy that exact pattern.
- Do not introduce new libraries, frameworks, or dependencies without an explicit ADR and human approval.

## 2. Do Not Duplicate Functionality
- If a helper function exists for formatting currency, dates, or creating UUIDs, use it.
- Keep logic centralized.

## 3. Frontend First
- Always start with the UI and user experience.
- The UI drives the API requirements, not the other way around.
- Build the DOM structures, wire up state, and then conform the API endpoint to serve exactly what the frontend needs.

## 4. Business Workflow First
- Understand the real-world business workflow (`03-business-workflow.md`) before writing code.
- CleanOps is an operations tool; the software must map directly to how the business actually operates on the ground.

## 5. Practical Over Clever
- Simple `fetch` calls, basic DOM manipulation, and flat SQL tables are preferred over complex abstractions, ORMs, or reactive state management libraries.
- Vanilla JS, Vanilla CSS, SQLite. Simple is maintainable.

## 6. Preserve Approved UI
- If the human user has approved a CSS layout, do not alter it when wiring up backend logic.
- Do not remove visible controls or fields just because they aren't wired to the backend yet. Leave them as placeholders so the design intent is preserved.

## 7. One Source of Truth
- Data should live in one place. Avoid syncing data across multiple tables if a join or a single query can solve it.
- In documentation, do not duplicate rules across files. Cross-link instead.

## 8. Avoid Free Text Where Structured Data is Better
- If a field has a limited set of known values (e.g., status, property type, access type), use a structured ENUM or string constraint in the DB and a `<select>` in the UI.
- Only use free text for genuine notes and descriptions.

## 9. Rule Proposals
- **Agents must not invent rules.** If an agent believes a new principle is needed based on recurring feedback, they must propose adding it to this file explicitly.
