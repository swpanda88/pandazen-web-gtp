import { error, json, readJson, requireDb } from "../_util.js";

const closedStatuses = new Set(["rejected", "not_suitable"]);

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const status = body.status;
    if (status && closedStatuses.has(status)) {
      const linkedAssessment = await db
        .prepare("SELECT id FROM assessment_quotes WHERE lead_id = ? LIMIT 1")
        .bind(params.id)
        .first();
      if (linkedAssessment) {
        return error("This lead already has a linked Assessment. Close it from the Assessment flow instead of the Lead stage.", 409);
      }
    }

    const fields = {
      customer_name: body.name,
      phone: body.phone,
      email: body.email,
      area: body.area,
      address: body.address,
      postcode: body.postcode,
      source: body.source,
      source_other: body.sourceOther,
      service_type: body.serviceType,
      service_other: body.serviceOther,
      preferred_contact: body.preferredContact,
      best_contact_time: body.bestContactTime,
      preferred_days: body.preferredDays,
      frequency: body.frequency,
      urgency: body.urgency,
      property_type: body.propertyType,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      reception_rooms: body.receptionRooms,
      kitchen_size: body.kitchenSize,
      property_size: body.propertySize,
      property_condition: body.propertyCondition,
      priorities: body.priorities,
      pets: body.pets,
      parking: body.parking,
      product_preferences: body.productPreferences,
      photo_available: body.photoAvailable,
      status,
      notes: body.notes,
      lost_reason: closedStatuses.has(status) ? (body.lostReason || status) : body.lostReason,
      closed_at: closedStatuses.has(status) ? new Date().toISOString() : body.closedAt,
      anonymise_after: closedStatuses.has(status)
        ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        : body.anonymiseAfter
    };

    const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
    if (!entries.length) return error("No fields to update.");

    const setSql = entries.map(([key]) => `${key} = ?`).join(", ");
    await db
      .prepare(`UPDATE leads SET ${setSql}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
      .bind(...entries.map(([, value]) => value), params.id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return error(err.message, 500);
  }
}
