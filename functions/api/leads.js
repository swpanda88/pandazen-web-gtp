import { error, json, labelFor, optionMap, readJson, requireDb } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const labels = await optionMap(db);
    const { results } = await db
      .prepare(
        `SELECT id, customer_name AS name, phone, email, area, address, source, source_other AS sourceOther,
                service_type AS serviceType, service_other AS serviceOther, preferred_contact AS preferredContact,
                preferred_days AS preferredDays, urgency, status, notes, created_at AS createdAt, updated_at AS updatedAt
         FROM leads
         ORDER BY updated_at DESC, id DESC`
      )
      .all();

    return json({
      leads: results.map((lead) => ({
        ...lead,
        statusLabel: labelFor(labels, "lead_status", lead.status),
        sourceLabel: labelFor(labels, "lead_source", lead.source),
        serviceLabel: labelFor(labels, "service_type", lead.serviceType),
        contact: lead.phone || lead.email || ""
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
    if (!body.name) return error("Customer name is required.");

    const result = await db
      .prepare(
        `INSERT INTO leads (customer_name, phone, email, area, address, source, source_other,
                            service_type, service_other, preferred_contact, preferred_days, urgency, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        body.name,
        body.phone || null,
        body.email || null,
        body.area || null,
        body.address || null,
        body.source || "website",
        body.sourceOther || null,
        body.serviceType || "regular_cleaning",
        body.serviceOther || null,
        body.preferredContact || "phone",
        body.preferredDays || null,
        body.urgency || null,
        body.status || "new",
        body.notes || null
      )
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
