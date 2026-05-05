import { asMoney, error, json, readJson, requireDb } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const { results } = await db
      .prepare(
        `SELECT i.id, i.client_id AS clientId, c.customer_name AS client, i.invoice_number AS number,
                i.invoice_date AS date, i.due_date AS dueDate, i.amount_pence AS amountPence,
                i.status, i.service_period_start AS servicePeriodStart,
                i.service_period_end AS servicePeriodEnd, i.notes, i.sent_at AS sentAt, i.paid_at AS paidAt
         FROM invoices i
         JOIN clients c ON c.id = i.client_id
         ORDER BY i.invoice_date DESC, i.id DESC`
      )
      .all();

    return json({
      invoices: results.map((invoice) => ({
        ...invoice,
        amount: asMoney(invoice.amountPence),
        paid: invoice.paidAt || "-"
      }))
    });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (!body.clientId || !body.invoiceNumber || !body.invoiceDate) {
      return error("clientId, invoiceNumber and invoiceDate are required.");
    }

    const result = await db
      .prepare(
        `INSERT INTO invoices (client_id, invoice_number, invoice_date, due_date, amount_pence, status,
                               service_period_start, service_period_end, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        body.clientId,
        body.invoiceNumber,
        body.invoiceDate,
        body.dueDate || null,
        body.amountPence || 0,
        body.status || "draft",
        body.servicePeriodStart || null,
        body.servicePeriodEnd || null,
        body.notes || null
      )
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
