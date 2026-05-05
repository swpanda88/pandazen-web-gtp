# Panda Zen Admin MVP Preview

This is PR1 for the Panda Zen operations system.

It is intentionally a static prototype with fake data only. The goal is to review the admin and cleaner workflow before wiring it to Cloudflare Access, D1, R2, and real enquiry data.

Review path:

1. Open `/admin/`.
2. Check the Asana-style sidebar, dashboard, lead board, records tables, and right detail drawer.
3. Switch `Preview role` from `Admin` to `Cleaner`.
4. Review the mobile-style cleaner checklist on the Jobs screen.
5. Try `Generate June jobs` to preview manual monthly work order generation.
6. Check Exports to preview CSV output shapes.
7. Open focused forms from the main buttons:
   - `/admin/forms/intake.html`
   - `/admin/forms/assessment.html`
   - `/admin/forms/cleaning-plan.html`
   - `/admin/forms/job-report.html`
   - `/admin/forms/invoice.html`

Form pages deliberately show only one task at a time. They currently save preview drafts to the browser on that device. Database submit wiring is a later step.

Things to decide after review:

- Are the labels clear enough for daily use?
- Is the cleaner view simple enough?
- Are the lead/job/invoice statuses right?
- What fields are missing from the assessment/client/job detail panel?
- Are the focused forms easier and safer than editing inside the main admin screen?
