import { asMoney, error, json, readJson, requireDb } from "../_util.js";
import { getQuoteById } from "../_quotes.js";

const validStatuses = new Set(["draft", "sent", "accepted", "rejected", "expired", "void", "superseded"]);

function withMoneyLabels(quote) {
  return {
    ...quote,
    totalPriceLabel: quote.totalPrice ? asMoney(quote.totalPrice) : "",
    recurringPriceLabel: quote.recurringPrice ? asMoney(quote.recurringPrice) : ""
  };
}

async function linkedClientIdForAssessment(db, assessmentQuoteId) {
  const client = await db
    .prepare("SELECT id FROM clients WHERE assessment_quote_id = ? LIMIT 1")
    .bind(assessmentQuoteId)
    .first();
  return client?.id || null;
}

async function supersedeSiblingSentQuotes(db, assessmentQuoteId, currentQuoteId) {
  await db
    .prepare(
      `UPDATE accounting_quotes
       SET status = 'superseded',
           superseded_by_quote_id = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE assessment_quote_id = ?
         AND id <> ?
         AND status = 'sent'`
    )
    .bind(currentQuoteId, assessmentQuoteId, currentQuoteId)
    .run();
}

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    const nextStatus = String(body.status || "").trim();
    if (!validStatuses.has(nextStatus)) {
      return error("Unsupported quote status.");
    }

    const current = await getQuoteById(db, params.id);
    if (!current) return error("Quote not found.", 404);
    if (current.status === nextStatus) {
      return json({ ok: true, quote: withMoneyLabels(current) });
    }
    if (nextStatus === "void" && current.status !== "draft") {
      return error("Only draft quotes can be voided.", 409);
    }

    const linkedClientId = (nextStatus === "accepted" && !current.clientId)
      ? await linkedClientIdForAssessment(db, current.assessmentQuoteId)
      : current.clientId;

    await db
      .prepare(
        `UPDATE accounting_quotes
         SET status = ?,
             client_id = COALESCE(?, client_id),
             sent_at = CASE WHEN ? = 'sent' THEN COALESCE(sent_at, CURRENT_TIMESTAMP) ELSE sent_at END,
             accepted_at = CASE WHEN ? = 'accepted' THEN COALESCE(accepted_at, CURRENT_TIMESTAMP) ELSE accepted_at END,
             rejected_at = CASE WHEN ? = 'rejected' THEN COALESCE(rejected_at, CURRENT_TIMESTAMP) ELSE rejected_at END,
             expired_at = CASE WHEN ? = 'expired' THEN COALESCE(expired_at, CURRENT_TIMESTAMP) ELSE expired_at END,
             voided_at = CASE WHEN ? = 'void' THEN COALESCE(voided_at, CURRENT_TIMESTAMP) ELSE voided_at END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(nextStatus, linkedClientId || null, nextStatus, nextStatus, nextStatus, nextStatus, nextStatus, params.id)
      .run();

    if (nextStatus === "sent" || nextStatus === "accepted") {
      await supersedeSiblingSentQuotes(db, current.assessmentQuoteId, params.id);
    }

    const updated = await getQuoteById(db, params.id);
    return json({ ok: true, quote: withMoneyLabels(updated) });
  } catch (err) {
    return error(err.message, 500);
  }
}
