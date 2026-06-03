# PandaZen Website

Static one-page website for PandaZen, a boutique home cleaning service in Durham and the surrounding areas.

Open `index.html` in a browser, or serve this folder with any static web server.

> [!IMPORTANT]
> **New Operational App**: Development has pivoted to the Jobber-inspired `/cleanops` application. See `docs/cleanops-architecture-and-data.md` for architecture and data rules.
> The `/admin/` cockpit is legacy and serves as fallback/reference only.

## Current Progress (CleanOps v0)
* **Schedule v0**: Built and refined.
* **Clients / Properties v0**: Built and refined.
* **Requests v0**: Active/Completed. Separates client enquiry from internal quote prep, includes Quote Assist and readiness flow.
* **Quotes v0**: Active/Completed. Quote register with overlay editor, catalogue items, templates, and document status flow.

Backend setup notes are in `docs/pr2-cloudflare-backend.md`.

Security setup notes are in `docs/security.md`. Protect `/admin/*`, `/cleanops/*` and `/api/*` with Cloudflare Access before entering real customer data.
