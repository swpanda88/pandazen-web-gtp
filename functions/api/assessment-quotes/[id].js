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

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (body.status !== finalStatus) {
      return error("Only the Q&A not proceeding close-out is supported by this route.");
    }

    const existing = await db
      .prepare("SELECT id, quote_notes AS quoteNotes FROM assessment_quotes WHERE id = ? LIMIT 1")
      .bind(params.id)
      .first();

    if (!existing) {
      return error("Q&A / Assessment record not found.", 404);
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
      .bind(finalStatus, finalStatus, lostReason, stampedNote, lostReason, params.id)
      .run();

    return json({ ok: true });
  } catch (err) {
    return error(err.message, 500);
  }
}
