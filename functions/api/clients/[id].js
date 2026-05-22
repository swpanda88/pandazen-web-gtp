import { error, json, readJson, requireDb } from "../_util.js";

const contactAccessFields = [
  ["name", "customer_name", "Client name"],
  ["phone", "phone", "Phone"],
  ["email", "email", "Email"],
  ["preferredContact", "preferred_contact", "Preferred contact"],
  ["accessMethod", "access_method", "Access method"],
  ["accessOther", "access_other", "Access method (other)"],
  ["accessNotes", "access_notes", "Access notes"],
  ["parkingNotes", "parking_notes", "Parking notes"],
  ["petType", "pet_type", "Pets"],
  ["petOther", "pet_other", "Pets (other)"],
  ["petNotes", "pet_notes", "Pet notes"],
  ["productPreference", "product_preference", "Product preferences"],
  ["productOther", "product_other", "Product preferences (other)"],
  ["surfaceNotes", "surface_notes", "Surface notes"],
  ["notes", "internal_notes", "Internal notes"]
];

const homeDetailsFields = [
  ["area", "area", "Area"],
  ["address", "address", "Address"]
];

const cleaningPlanFields = [
  ["frequency", "frequency", "Frequency"],
  ["manHours", "default_man_hours", "Default man-hours"],
  ["specialInstructions", "special_instructions", "Special instructions"]
];

function normalizeValue(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function normalizeManHours(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function diffSummary(existing, updates, fields, normalizers = {}) {
  return fields
    .map(([apiKey, dbKey, label]) => {
      const normalize = normalizers[apiKey] || normalizeValue;
      const before = normalize(existing[dbKey]);
      const after = normalize(updates[apiKey]);
      if (before === after) return null;
      return `${label}: "${before || "blank"}" -> "${after || "blank"}"`;
    })
    .filter(Boolean);
}

async function writeLeadAuditNote(db, leadId, sourceArea, changes) {
  if (!leadId || !changes.length) return;
  const note = `${sourceArea} updated by admin: ${changes.join("; ")}`;
  await db
    .prepare(
      `INSERT INTO lead_notes (lead_id, note, note_type, created_by)
       VALUES (?, ?, ?, ?)`
    )
    .bind(leadId, note, "admin_update", "admin")
    .run();
}

async function loadClient(db, clientId) {
  return db
    .prepare(
      `SELECT id, lead_id, customer_name, phone, email, preferred_contact, area, address,
              access_method, access_other, access_notes, parking_notes, pet_type, pet_other, pet_notes,
              product_preference, product_other, surface_notes, internal_notes, status
       FROM clients
       WHERE id = ?
       LIMIT 1`
    )
    .bind(clientId)
    .first();
}

async function handleContactAccessUpdate(db, clientId, body) {
  const existing = await loadClient(db, clientId);
  if (!existing) return error("Client & Home record not found.", 404);

  const payload = {};
  contactAccessFields.forEach(([apiKey]) => {
    payload[apiKey] = normalizeValue(body[apiKey]);
  });

  const changes = diffSummary(existing, payload, contactAccessFields);
  if (!changes.length) return json({ ok: true, unchanged: true });

  await db
    .prepare(
      `UPDATE clients
       SET customer_name = ?,
           phone = ?,
           email = ?,
           preferred_contact = ?,
           access_method = ?,
           access_other = ?,
           access_notes = ?,
           parking_notes = ?,
           pet_type = ?,
           pet_other = ?,
           pet_notes = ?,
           product_preference = ?,
           product_other = ?,
           surface_notes = ?,
           internal_notes = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      payload.name,
      payload.phone,
      payload.email,
      payload.preferredContact,
      payload.accessMethod,
      payload.accessOther,
      payload.accessNotes,
      payload.parkingNotes,
      payload.petType,
      payload.petOther,
      payload.petNotes,
      payload.productPreference,
      payload.productOther,
      payload.surfaceNotes,
      payload.notes,
      clientId
    )
    .run();

  await writeLeadAuditNote(db, existing.lead_id, "Client & Home - Contact / Access", changes);
  return json({ ok: true, updatedFields: changes.length });
}

async function handleHomeDetailsUpdate(db, clientId, body) {
  const existing = await loadClient(db, clientId);
  if (!existing) return error("Client & Home record not found.", 404);

  const payload = {};
  homeDetailsFields.forEach(([apiKey]) => {
    payload[apiKey] = normalizeValue(body[apiKey]);
  });

  const changes = diffSummary(existing, payload, homeDetailsFields);
  if (!changes.length) return json({ ok: true, unchanged: true });

  await db
    .prepare(
      `UPDATE clients
       SET area = ?,
           address = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(payload.area, payload.address, clientId)
    .run();

  await writeLeadAuditNote(db, existing.lead_id, "Client & Home - Home Details", changes);
  return json({ ok: true, updatedFields: changes.length });
}

async function handleCleaningPlanUpdate(db, clientId, body) {
  const existingClient = await loadClient(db, clientId);
  if (!existingClient) return error("Client & Home record not found.", 404);

  const plan = await db
    .prepare(
      `SELECT id, frequency, default_man_hours, special_instructions
       FROM cleaning_plans
       WHERE client_id = ? AND is_active = 1
       ORDER BY updated_at DESC, id DESC
       LIMIT 1`
    )
    .bind(clientId)
    .first();

  if (!plan) {
    return error("No active cleaning plan exists for this client yet.");
  }

  const payload = {
    frequency: normalizeValue(body.frequency),
    manHours: normalizeManHours(body.manHours),
    specialInstructions: normalizeValue(body.specialInstructions)
  };

  const changes = diffSummary(plan, payload, cleaningPlanFields, { manHours: normalizeManHours });
  if (!changes.length) return json({ ok: true, unchanged: true });

  await db
    .prepare(
      `UPDATE cleaning_plans
       SET frequency = ?,
           default_man_hours = ?,
           special_instructions = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(payload.frequency, payload.manHours, payload.specialInstructions, plan.id)
    .run();

  await writeLeadAuditNote(db, existingClient.lead_id, "Client & Home - Cleaning Plan", changes);
  return json({ ok: true, updatedFields: changes.length });
}

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);

    if (body.action === "update_contact_access") {
      return handleContactAccessUpdate(db, params.id, body);
    }
    if (body.action === "update_home_details") {
      return handleHomeDetailsUpdate(db, params.id, body);
    }
    if (body.action === "update_cleaning_plan") {
      return handleCleaningPlanUpdate(db, params.id, body);
    }

    return error("Unsupported client update action.");
  } catch (err) {
    return error(err.message, 500);
  }
}
