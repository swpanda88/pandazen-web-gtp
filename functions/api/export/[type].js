import { csv, error, requireDb } from "../_util.js";

export async function onRequestGet({ env, params }) {
  try {
    const db = requireDb(env);
    const type = params.type;
    let rows;

    if (type === "invoices") {
      const { results } = await db
        .prepare(
          `SELECT i.invoice_number, c.customer_name, i.invoice_date, i.due_date, i.amount_pence,
                  i.status, i.paid_at
           FROM invoices i
           JOIN clients c ON c.id = i.client_id
           ORDER BY i.invoice_date, i.invoice_number`
        )
        .all();
      rows = [
        ["invoice_number", "client", "invoice_date", "due_date", "amount_pence", "status", "paid_at"],
        ...results.map((row) => [row.invoice_number, row.customer_name, row.invoice_date, row.due_date, row.amount_pence, row.status, row.paid_at])
      ];
    } else if (type === "jobs") {
      const { results } = await db
        .prepare(
          `SELECT c.customer_name, j.scheduled_date, j.scheduled_time, j.job_type, j.man_hours,
                  s.display_name AS main_cleaner, h.display_name AS helper, j.status, j.completed_at
           FROM jobs j
           JOIN clients c ON c.id = j.client_id
           LEFT JOIN staff s ON s.id = j.main_cleaner_id
           LEFT JOIN staff h ON h.id = j.helper_id
           ORDER BY j.scheduled_date, j.scheduled_time`
        )
        .all();
      rows = [
        ["client", "date", "time", "job_type", "man_hours", "main_cleaner", "helper", "status", "completed_at"],
        ...results.map((row) => [row.customer_name, row.scheduled_date, row.scheduled_time, row.job_type, row.man_hours, row.main_cleaner, row.helper, row.status, row.completed_at])
      ];
    } else if (type === "clients") {
      const { results } = await db
        .prepare(
          `SELECT customer_name, phone, email, area, preferred_contact, product_preference, status
           FROM clients
           ORDER BY customer_name`
        )
        .all();
      rows = [
        ["client", "phone", "email", "area", "preferred_contact", "product_preference", "status"],
        ...results.map((row) => [row.customer_name, row.phone, row.email, row.area, row.preferred_contact, row.product_preference, row.status])
      ];
    } else {
      return error("Unknown export type.", 404);
    }

    return new Response(csv(rows), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="pandazen-${type}.csv"`,
        "cache-control": "no-store"
      }
    });
  } catch (err) {
    return error(err.message, 500);
  }
}
