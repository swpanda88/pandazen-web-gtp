# 02: Product Architecture

This document describes the high-level technical architecture of PandaZen CleanOps.

## Overview
PandaZen is split into two primary repositories (and domains):
1. **PandaZen Public Site** (Temporary/Marketing): A static site used for customer acquisition and contact forms.
2. **PandaZen CleanOps (`pandazen-web-gtp`)**: The internal CRM and Field Service management tool used by staff to run the business. This is our primary focus.

## CleanOps Tech Stack
- **Frontend**: HTML5, Vanilla JavaScript (ES6 Modules), Vanilla CSS. No SPA frameworks (React, Vue, etc.). No utility CSS frameworks (Tailwind, Bootstrap).
- **Backend**: Cloudflare Pages Functions (Serverless). APIs are written in plain JavaScript/Node environment running on Cloudflare edge workers.
- **Database**: Cloudflare D1 (Serverless SQLite).
- **Hosting**: Cloudflare Pages.

## Directory Structure
- `/cleanops/`: Contains all frontend assets (HTML, JS, CSS) for the CleanOps dashboard.
  - `/cleanops/index.html`: The main entry point.
  - `/cleanops/styles.css`: The global stylesheet.
  - `/cleanops/app.js`: The main routing and initialization script.
  - `/cleanops/*.js`: Feature-specific modules (e.g., `clients.js`, `requests.js`) that handle their own DOM rendering and state management.
- `/functions/`: Cloudflare Pages Functions backend.
  - `/functions/api/`: API endpoints. Follows file-based routing (`/api/cleanops/customers.js` maps to `/api/cleanops/customers`).
  - `/functions/db/`: Database access objects. SQL queries are centralized here to keep route handlers clean.
- `/migrations/`: SQLite `.sql` files for schema changes.
- `/docs/`: Permanent project knowledge.

## Frontend Architecture
The frontend is built on a simple "State -> Render" loop pattern.
1. **State**: Each module maintains a local `state` object (e.g., in `clients.js`).
2. **Render**: A central `render()` function injects HTML literal strings into a designated DOM container based on the current state.
3. **Events**: Global event delegation (using `data-action` attributes) or specific event listeners are attached to handle user interactions, update state, and re-call `render()` or `refresh()`.

## Backend Architecture
- **Stateless APIs**: Functions act as simple REST-ish endpoints.
- **File-Based Routing**: Provided by Cloudflare Pages (`functions/` directory).
- **Database Abstraction**: Route handlers in `api/` import functions from `db/` to execute queries. The route handlers handle HTTP validation and JSON responses.

For API specific standards, see `05-api-standards.md`.
For Database specific standards, see `06-database-standards.md`.
