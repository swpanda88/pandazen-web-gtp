import { error, json, readJson, requireDb } from "../../../_util.js";

// ---------------------------------------------------------------------------
// Property display label helper
// Returns label if set; otherwise computes a clean display string from
// address/area/postcode. Never auto-populates the stored label column.
// ---------------------------------------------------------------------------
export function propertyDisplayLabel(property) {
  if (!property) return "";
  if (property.label) return property.label;
  const parts = [
    property.address,
    property.area,
    property.postcode
  ].filter(Boolean);
  // Deduplicate parts that are substrings of others
  const deduped = parts.filter((part, i) =>
    !parts.some(
      (other, j) =>
        i !== j &&
        other.toLowerCase().includes(part.toLowerCase()) &&
        other.length > part.length
    )
  );
  return deduped.join(", ") || "Property";
}

// ---------------------------------------------------------------------------
// ensurePrimaryProperty
// Idempotent: returns existing primary property_id if one already exists.
// If none exists, creates one from the best available data on the client
// record (plus optional override fields from a source assessment row).
//
// IMPORTANT: Must only be called at safe creation/conversion points
// (e.g., when creating a new Assessment from an existing client, or on
// quote acceptance). Do NOT call on every read — it is a write operation.
// ---------------------------------------------------------------------------
export async function ensurePrimaryProperty(db, clientId, sourceData = {}) {
  const clientIdNum = Number(clientId);
  if (!clientIdNum) return null;

  // Check for an existing primary property
  const existing = await db
    .prepare(
      `SELECT id FROM properties
       WHERE client_id = ? AND is_primary = 1 AND is_active = 1
       ORDER BY id ASC
       LIMIT 1`
    )
    .bind(clientIdNum)
    .first();

  if (existing) return existing.id;

  // Load client for fallback address data
  const client = await db
    .prepare(`SELECT address, area FROM clients WHERE id = ? LIMIT 1`)
    .bind(clientIdNum)
    .first();

  if (!client) return null;

  // Build property row from best available data.
  // Priority order: sourceData > client flat fields.
  const address = sourceData.address || sourceData.propertyAddress || client.address || null;
  const area = sourceData.area || client.area || null;
  const postcode = sourceData.postcode || null;
  const propertyType = sourceData.propertyType || null;
  const bedrooms = sourceData.bedrooms || null;
  const bathrooms = sourceData.bathrooms || null;
  const propertyCondition = sourceData.propertyCondition || null;
  const parkingNotes = sourceData.parkingNotes || null;
  const petNotes = sourceData.petNotes || null;
  const surfaceNotes = sourceData.surfaceNotes || null;
  const accessNotes = sourceData.accessNotes || null;
  const notes = sourceData.notes || null;

  const result = await db
    .prepare(
      `INSERT INTO properties
         (client_id, address, area, postcode, property_type, bedrooms, bathrooms,
          property_condition, access_notes, parking_notes, pet_notes, surface_notes,
          notes, is_primary, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`
    )
    .bind(
      clientIdNum,
      address,
      area,
      postcode,
      propertyType,
      bedrooms,
      bathrooms,
      propertyCondition,
      accessNotes,
      parkingNotes,
      petNotes,
      surfaceNotes,
      notes
    )
    .run();

  return result.meta.last_row_id || null;
}

// ---------------------------------------------------------------------------
// Format a property DB row into a clean API response object
// ---------------------------------------------------------------------------
function propertyToResponse(row) {
  return {
    id: row.id,
    clientId: row.clientId ?? row.client_id,
    label: row.label || null,
    displayLabel: propertyDisplayLabel(row),
    address: row.address || null,
    area: row.area || null,
    postcode: row.postcode || null,
    propertyType: row.propertyType ?? row.property_type ?? null,
    bedrooms: row.bedrooms || null,
    bathrooms: row.bathrooms || null,
    propertyCondition: row.propertyCondition ?? row.property_condition ?? null,
    accessNotes: row.accessNotes ?? row.access_notes ?? null,
    parkingNotes: row.parkingNotes ?? row.parking_notes ?? null,
    petNotes: row.petNotes ?? row.pet_notes ?? null,
    surfaceNotes: row.surfaceNotes ?? row.surface_notes ?? null,
    notes: row.notes || null,
    isPrimary: Boolean(row.isPrimary ?? row.is_primary),
    isActive: Boolean(row.isActive ?? row.is_active),
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at
  };
}

// ---------------------------------------------------------------------------
// GET /api/admin/clients/[clientId]/properties
// List all active properties for a client.
// ---------------------------------------------------------------------------
async function handleList(db, clientId) {
  const { results } = await db
    .prepare(
      `SELECT id, client_id AS clientId, label, address, area, postcode,
              property_type AS propertyType, bedrooms, bathrooms,
              property_condition AS propertyCondition,
              access_notes AS accessNotes, parking_notes AS parkingNotes,
              pet_notes AS petNotes, surface_notes AS surfaceNotes,
              notes, is_primary AS isPrimary, is_active AS isActive,
              created_at AS createdAt, updated_at AS updatedAt
       FROM properties
       WHERE client_id = ? AND is_active = 1
       ORDER BY is_primary DESC, id ASC`
    )
    .bind(Number(clientId))
    .all();

  return json({ properties: results.map(propertyToResponse) });
}

// ---------------------------------------------------------------------------
// POST /api/admin/clients/[clientId]/properties
// Create a new property for a client.
//
// Primary logic:
//  - If body.isPrimary === true  → create as primary, demote existing primary.
//  - Else if client has no active properties → create as primary (first property).
//  - Else → create as non-primary.
//
// This avoids silently demoting the existing primary when a second property is
// added without the caller explicitly requesting it.
// ---------------------------------------------------------------------------
async function handleCreate(db, clientId, body) {
  const clientIdNum = Number(clientId);
  if (!clientIdNum) return error("Client ID is required.");

  // Validate client exists
  const client = await db
    .prepare(`SELECT id FROM clients WHERE id = ? LIMIT 1`)
    .bind(clientIdNum)
    .first();
  if (!client) return error("Client not found.", 404);

  // Determine whether this property should be primary
  let isPrimary;

  if (body.isPrimary === true) {
    // Caller explicitly requested primary: demote any existing primary first
    await db
      .prepare(
        `UPDATE properties SET is_primary = 0, updated_at = CURRENT_TIMESTAMP
         WHERE client_id = ? AND is_primary = 1 AND is_active = 1`
      )
      .bind(clientIdNum)
      .run();
    isPrimary = 1;
  } else {
    // No explicit primary request: check if the client has any active properties
    const existingCount = await db
      .prepare(
        `SELECT COUNT(*) AS cnt FROM properties
         WHERE client_id = ? AND is_active = 1`
      )
      .bind(clientIdNum)
      .first();
    // If no existing properties, this becomes primary automatically
    isPrimary = (existingCount?.cnt ?? 0) === 0 ? 1 : 0;
  }

  const result = await db
    .prepare(
      `INSERT INTO properties
         (client_id, label, address, area, postcode, property_type, bedrooms, bathrooms,
          property_condition, access_notes, parking_notes, pet_notes, surface_notes,
          notes, is_primary, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
    )
    .bind(
      clientIdNum,
      body.label || null,
      body.address || null,
      body.area || null,
      body.postcode || null,
      body.propertyType || null,
      body.bedrooms || null,
      body.bathrooms || null,
      body.propertyCondition || null,
      body.accessNotes || null,
      body.parkingNotes || null,
      body.petNotes || null,
      body.surfaceNotes || null,
      body.notes || null,
      isPrimary
    )
    .run();

  return json({ ok: true, id: result.meta.last_row_id, isPrimary: Boolean(isPrimary) }, { status: 201 });
}

// ---------------------------------------------------------------------------
// Route handlers — Cloudflare Pages Functions pattern
// Route: /api/admin/clients/[clientId]/properties
// PATCH lives in /api/admin/properties/[id].js — not duplicated here.
// ---------------------------------------------------------------------------
export async function onRequestGet({ env, params }) {
  try {
    const db = requireDb(env);
    return await handleList(db, params.clientId);
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    return await handleCreate(db, params.clientId, body);
  } catch (err) {
    return error(err.message, 500);
  }
}
