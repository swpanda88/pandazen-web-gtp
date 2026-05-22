import { error, json, readJson, requireDb } from "../_util.js";

const finalStatus = "not_proceeding";
const validReasons = new Set([
  "customer_changed_mind",
  "no_response",
  "not_suitable",
  "fully_booked",
  "outside_service_area",
  "quote_rejected",
  "duplicate",
  "test_or_error",
  "other"
]);

const assessmentDetailFields = [
  ["customerName", "customer_name", "Customer / prospect name"],
  ["phone", "phone", "Phone"],
  ["email", "email", "Email"],
  ["area", "area", "Area"],
  ["postcode", "postcode", "Postcode"],
  ["serviceType", "service_type", "Service type"],
  ["frequency", "frequency", "Frequency"],
  ["propertyType", "property_type", "Property type"],
  ["bedrooms", "bedrooms", "Bedrooms"],
  ["bathrooms", "bathrooms", "Bathrooms"],
  ["propertyCondition", "property_condition", "Property condition"],
  ["pets", "pets", "Pets"],
  ["parking", "parking", "Parking / access"],
  ["priorities", "priorities", "Priorities"],
  ["productPreferences", "product_preferences", "Product preferences"],
  ["notes", "notes", "Internal notes"],
  ["assessmentNotes", "assessment_notes", "Assessment notes"],
  ["quoteNotes", "quote_notes", "Assessment / quote notes"]
];

function normalizeValue(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function diffSummary(existing, updates, fields) {
  return fields
    .map(([apiKey, dbKey, label]) => {
      const before = normalizeValue(existing[dbKey]);
      const after = normalizeValue(updates[apiKey]);
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

async function handleDetailsUpdate(db, body, assessmentId) {
  const existing = await db
    .prepare(
      `SELECT id, lead_id, customer_name, phone, email, area, postcode, service_type, frequency,
              property_type, bedrooms, bathrooms, property_condition, pets, parking, priorities,
              product_preferences, notes, assessment_notes, quote_notes
       FROM assessment_quotes
       WHERE id = ?
       LIMIT 1`
    )
    .bind(assessmentId)
    .first();

  if (!existing) {
    return error("Assessment record not found.", 404);
  }

  const payload = {};
  assessmentDetailFields.forEach(([apiKey]) => {
    payload[apiKey] = normalizeValue(body[apiKey]);
  });

  const changes = diffSummary(existing, payload, assessmentDetailFields);
  if (!changes.length) {
    return json({ ok: true, unchanged: true });
  }

  await db
    .prepare(
      `UPDATE assessment_quotes
       SET customer_name = ?,
           phone = ?,
           email = ?,
           area = ?,
           postcode = ?,
           service_type = ?,
           frequency = ?,
           property_type = ?,
           bedrooms = ?,
           bathrooms = ?,
           property_condition = ?,
           pets = ?,
           parking = ?,
           priorities = ?,
           product_preferences = ?,
           notes = ?,
           assessment_notes = ?,
           quote_notes = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      payload.customerName,
      payload.phone,
      payload.email,
      payload.area,
      payload.postcode,
      payload.serviceType,
      payload.frequency,
      payload.propertyType,
      payload.bedrooms,
      payload.bathrooms,
      payload.propertyCondition,
      payload.pets,
      payload.parking,
      payload.priorities,
      payload.productPreferences,
      payload.notes,
      payload.assessmentNotes,
      payload.quoteNotes,
      assessmentId
    )
    .run();

  await writeLeadAuditNote(db, existing.lead_id, "Assessment Details", changes);
  return json({ ok: true, updatedFields: changes.length });
}

async function handleCloseout(db, body, assessmentId) {
  if (body.status !== finalStatus) {
    return error("Only the Assessment not proceeding close-out is supported by this route.");
  }

  const existing = await db
    .prepare("SELECT id, quote_notes AS quoteNotes FROM assessment_quotes WHERE id = ? LIMIT 1")
    .bind(assessmentId)
    .first();

  if (!existing) {
    return error("Assessment record not found.", 404);
  }

  const lostReason = validReasons.has(body.lostReason) ? body.lostReason : "other";
  const note = String(body.closeNote || "").trim();
  const stampedNote = note
    ? `${existing.quoteNotes ? `${existing.quoteNotes}\n\n` : ""}Close-out note (${new Date().toISOString()}): ${note}`
    : existing.quoteNotes;

  await db
    .prepare(
      `UPDATE assessment_quotes
       SET status = ?,
           quote_stage = ?,
           lost_reason = ?,
           quote_notes = ?,
           quote_rejected_at = CASE WHEN ? = 'quote_rejected' THEN CURRENT_TIMESTAMP ELSE quote_rejected_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(finalStatus, finalStatus, lostReason, stampedNote, lostReason, assessmentId)
    .run();

  return json({ ok: true });
}

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);

    if (body.action === "update_details") {
      return handleDetailsUpdate(db, body, params.id);
    }

    return handleCloseout(db, body, params.id);
  } catch (err) {
    return error(err.message, 500);
  }
}
