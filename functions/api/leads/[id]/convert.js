import { error, json, readJson, requireDb } from "../../_util.js";
import { ensurePrimaryProperty } from "../../../admin/clients/[clientId]/properties.js";

const CONVERTIBLE_STATUSES = new Set(["accepted", "booked", "quote_accepted", "converted"]);

export async function onRequestPost({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const lead = await db
      .prepare(
        `SELECT id, customer_name AS name, phone, email, area, address, postcode, preferred_contact AS preferredContact,
                service_type AS serviceType, status, notes,
                property_type AS propertyType, bedrooms, bathrooms,
                property_condition AS propertyCondition, pets, parking
         FROM leads
         WHERE id = ?`
      )
      .bind(params.id)
      .first();

    if (!lead) return error("Lead not found.", 404);
    if (!CONVERTIBLE_STATUSES.has(String(lead.status || "").toLowerCase())) {
      return error("Lead must be accepted or booked before conversion.");
    }

    const existing = await db
      .prepare("SELECT id FROM clients WHERE lead_id = ? LIMIT 1")
      .bind(lead.id)
      .first();

    if (existing) {
      return json({ ok: true, id: existing.id, alreadyConverted: true });
    }

    const result = await db
      .prepare(
        `INSERT INTO clients (
          lead_id, customer_name, phone, email, area, address, preferred_contact,
          product_preference, internal_notes, converted_at, converted_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`
      )
      .bind(
        lead.id,
        lead.name,
        lead.phone || null,
        lead.email || null,
        lead.area || null,
        lead.address || null,
        lead.preferredContact || "phone",
        null,
        lead.notes || null,
        body.convertedBy || "admin"
      )
      .run();

    await db
      .prepare("UPDATE leads SET status = 'converted', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(lead.id)
      .run();

    await ensurePrimaryProperty(db, result.meta.last_row_id, {
      address: lead.address || lead.postcode || null,
      area: lead.area || null,
      postcode: lead.postcode || null,
      propertyType: lead.propertyType || null,
      bedrooms: lead.bedrooms || null,
      bathrooms: lead.bathrooms || null,
      propertyCondition: lead.propertyCondition || null,
      parkingNotes: lead.parking || null,
      petNotes: lead.pets && lead.pets !== "none" ? lead.pets : null
    });

    return json({ ok: true, id: result.meta.last_row_id, alreadyConverted: false }, { status: 201 });
  } catch (err) {
    const message = String(err.message || "");
    if (message.includes("idx_clients_lead_unique") || message.includes("clients.lead_id") || message.includes("UNIQUE constraint failed")) {
      const db = requireDb(env);
      const existing = await db
        .prepare("SELECT id FROM clients WHERE lead_id = ? LIMIT 1")
        .bind(params.id)
        .first();
      if (existing) return json({ ok: true, id: existing.id, alreadyConverted: true });
    }
    return error(err.message, 500);
  }
}
