import { error, json, readJson, requireDb } from "../../_util.js";
import { ensurePrimaryProperty, propertyDisplayLabel } from "../clients/[clientId]/properties.js";

// ---------------------------------------------------------------------------
// PATCH /api/admin/properties/:id
// Update an existing property. Separate route for patching by property ID
// without needing to scope through clientId in the URL.
// ---------------------------------------------------------------------------
export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const propIdNum = Number(params.id);
    if (!propIdNum) return error("Property ID is required.");

    const existing = await db
      .prepare(`SELECT id, client_id FROM properties WHERE id = ? LIMIT 1`)
      .bind(propIdNum)
      .first();
    if (!existing) return error("Property not found.", 404);

    // If marking as primary, demote existing primary for same client
    if (body.isPrimary === true || body.isPrimary === 1) {
      await db
        .prepare(
          `UPDATE properties SET is_primary = 0, updated_at = CURRENT_TIMESTAMP
           WHERE client_id = ? AND is_primary = 1 AND id != ?`
        )
        .bind(existing.client_id, propIdNum)
        .run();
    }

    const updatableFields = [
      ["label", "label"],
      ["address", "address"],
      ["area", "area"],
      ["postcode", "postcode"],
      ["propertyType", "property_type"],
      ["bedrooms", "bedrooms"],
      ["bathrooms", "bathrooms"],
      ["propertyCondition", "property_condition"],
      ["accessNotes", "access_notes"],
      ["parkingNotes", "parking_notes"],
      ["petNotes", "pet_notes"],
      ["surfaceNotes", "surface_notes"],
      ["notes", "notes"],
      ["isPrimary", "is_primary"],
      ["isActive", "is_active"]
    ];

    const setClauses = [];
    const binds = [];

    for (const [bodyKey, dbCol] of updatableFields) {
      if (bodyKey in body) {
        setClauses.push(`${dbCol} = ?`);
        let val = body[bodyKey];
        if (bodyKey === "isPrimary" || bodyKey === "isActive") {
          val = val ? 1 : 0;
        } else if (val === "") {
          val = null;
        }
        binds.push(val ?? null);
      }
    }

    if (!setClauses.length) return json({ ok: true, unchanged: true });

    setClauses.push("updated_at = CURRENT_TIMESTAMP");
    binds.push(propIdNum);

    await db
      .prepare(`UPDATE properties SET ${setClauses.join(", ")} WHERE id = ?`)
      .bind(...binds)
      .run();

    return json({ ok: true });
  } catch (err) {
    return error(err.message, 500);
  }
}

// Re-export helpers so other API modules can import from this central location
// without needing to know the exact route file path.
export { ensurePrimaryProperty, propertyDisplayLabel };
