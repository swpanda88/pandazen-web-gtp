import { error, json, labelFor, optionMap, readJson, requireDb } from "./_util.js";

function labelWithOther(labels, group, value, otherValue) {
  const label = labelFor(labels, group, value);
  if (value === "other" && otherValue) return `${label}: ${otherValue}`;
  return label;
}

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const labels = await optionMap(db);
    const { results } = await db
      .prepare(
        `SELECT c.id, c.lead_id AS leadId, c.customer_name AS name, c.phone, c.email, c.area, c.address,
                c.preferred_contact AS preferredContact, c.access_method AS accessMethod, c.access_other AS accessOther,
                c.access_notes AS accessNotes, c.parking_notes AS parkingNotes,
                c.pet_type AS petType, c.pet_other AS petOther, c.pet_notes AS petNotes,
                c.product_preference AS productPreference, c.product_other AS productOther, c.surface_notes AS surfaceNotes,
                c.internal_notes AS notes, c.status, c.converted_at AS convertedAt, c.converted_by AS convertedBy,
                c.created_at AS createdAt, c.updated_at AS updatedAt,
                cp.frequency, cp.default_man_hours AS manHours,
                s.display_name AS mainCleaner, h.display_name AS helper,
                l.status AS originalLeadStatus, l.source AS originalLeadSource, l.source_other AS originalLeadSourceOther,
                l.service_type AS originalServiceType, l.service_other AS originalServiceOther,
                l.preferred_days AS preferredDays, l.best_contact_time AS bestContactTime, l.postcode,
                l.frequency AS requestedFrequency, l.urgency, l.property_type AS propertyType,
                l.bedrooms, l.bathrooms, l.reception_rooms AS receptionRooms, l.kitchen_size AS kitchenSize,
                l.property_size AS propertySize, l.property_condition AS propertyCondition,
                l.priorities, l.pets AS leadPets, l.parking AS leadParking,
                l.product_preferences AS leadProductPreferences, l.photo_available AS photoAvailable,
                l.notes AS originalLeadNotes, l.created_at AS originalLeadCreatedAt
         FROM clients c
         LEFT JOIN cleaning_plans cp ON cp.client_id = c.id AND cp.is_active = 1
         LEFT JOIN staff s ON s.id = cp.main_cleaner_id
         LEFT JOIN staff h ON h.id = cp.helper_id
         LEFT JOIN leads l ON l.id = c.lead_id
         ORDER BY c.customer_name`
      )
      .all();

    return json({
      clients: results.map((client) => ({
        ...client,
        originalLeadId: client.leadId,
        frequencyLabel: labelFor(labels, "frequency", client.frequency),
        requestedFrequencyLabel: labelFor(labels, "frequency", client.requestedFrequency),
        productLabel: labelWithOther(labels, "product_preference", client.productPreference, client.productOther),
        accessLabel: labelWithOther(labels, "access_method", client.accessMethod, client.accessOther),
        petLabel: labelWithOther(labels, "pet_type", client.petType, client.petOther),
        preferredContactLabel: labelFor(labels, "preferred_contact", client.preferredContact),
        originalServiceLabel: labelWithOther(labels, "service_type", client.originalServiceType, client.originalServiceOther),
        originalLeadSourceLabel: labelWithOther(labels, "lead_source", client.originalLeadSource, client.originalLeadSourceOther),
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
