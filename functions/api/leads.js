import { error, json, labelFor, optionMap, readJson, requireDb } from "./_util.js";

function leadPriority(urgency) {
  return urgency === "urgent" ? "High" : "Normal";
}

async function createLeadFollowUpTask(db, leadId, lead) {
  await db
    .prepare(
      `INSERT INTO admin_tasks (title, notes, task_type, status, priority, due_at, linked_type, linked_id, assigned_to)
       VALUES (?, ?, 'Lead follow-up', 'Open', ?, datetime('now', '+1 day'), 'lead', ?, 'admin')`
    )
    .bind(
      `Follow up lead: ${lead.name}`,
      lead.notes || "Review enquiry and contact the lead.",
      leadPriority(lead.urgency),
      leadId
    )
    .run();
}

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

    const leadIds = results.map((lead) => lead.id);
    const notesByLead = {};
    if (leadIds.length) {
      const placeholders = leadIds.map(() => "?").join(", ");
      const notes = await db
        .prepare(
          `SELECT id, lead_id AS leadId, note, note_type AS noteType, created_by AS createdBy,
                  created_at AS createdAt
           FROM lead_notes
           WHERE lead_id IN (${placeholders})
           ORDER BY created_at DESC, id DESC`
        )
        .bind(...leadIds)
        .all();

      notes.results.forEach((note) => {
        if (!notesByLead[note.leadId]) notesByLead[note.leadId] = [];
        notesByLead[note.leadId].push(note);
      });
    }

    return json({
      leads: results.map((lead) => ({
        ...lead,
        statusLabel: labelFor(labels, "lead_status", lead.status),
        sourceLabel: labelFor(labels, "lead_source", lead.source),
        serviceLabel: labelFor(labels, "service_type", lead.serviceType),
        contact: lead.phone || lead.email || "",
        leadNotes: notesByLead[lead.id] || []
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

    await createLeadFollowUpTask(db, result.meta.last_row_id, body);

    return json({ ok: true, id: result.meta.last_row_id }, { status: 201 });
  } catch (err) {
    return error(err.message, 500);
  }
}
