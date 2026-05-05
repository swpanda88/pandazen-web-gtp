import { error, json, labelFor, optionMap, readJson, requireDb } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const labels = await optionMap(db);
    const { results } = await db
      .prepare(
        `SELECT c.id, c.lead_id AS leadId, c.customer_name AS name, c.phone, c.email, c.area, c.address,
                c.preferred_contact AS preferredContact, c.access_method AS accessMethod, c.access_notes AS accessNotes,
                c.parking_notes AS parkingNotes, c.pet_type AS petType, c.pet_notes AS petNotes,
                c.product_preference AS productPreference, c.surface_notes AS surfaceNotes,
                c.internal_notes AS notes, c.status,
                cp.frequency, cp.default_man_hours AS manHours,
                s.display_name AS mainCleaner, h.display_name AS helper
         FROM clients c
         LEFT JOIN cleaning_plans cp ON cp.client_id = c.id AND cp.is_active = 1
         LEFT JOIN staff s ON s.id = cp.main_cleaner_id
         LEFT JOIN staff h ON h.id = cp.helper_id
         ORDER BY c.customer_name`
      )
      .all();

    return json({
      clients: results.map((client) => ({
        ...client,
        frequencyLabel: labelFor(labels, "frequency", client.frequency),
        productLabel: labelFor(labels, "product_preference", client.productPreference),
        accessLabel: labelFor(labels, "access_method", client.accessMethod),
        petLabel: labelFor(labels, "pet_type", client.petType),
        helper: client.helper || "Optional"
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
    if (!body.name) return error("Client name is required.");

    const result = await db
      .prepare(
        `INSERT INTO clients (lead_id, customer_name, phone, email, area, address, preferred_contact,
                              access_method, access_other, access_notes, parking_notes, pet_type, pet_other,
                              pet_notes, product_preference, product_other, surface_notes, internal_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        body.leadId || null,
        body.name,
        body.phone || null,
        body.email || null,
        body.area || null,
        body.address || null,
        body.preferredContact || "phone",
        body.accessMethod || null,
        body.accessOther || null,
        body.accessNotes || null,
        body.parkingNotes || null,
        body.petType || "none",
        body.petOther || null,
        body.petNotes || null,
        body.productPreference || null,
        body.productOther || null,
        body.surfaceNotes || null,
        body.notes || null
      )
      .run();

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
