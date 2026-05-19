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

export async function onRequestGet({ env, params }) {
  try {
    const db = requireDb(env);
    const quote = await getQuoteById(db, params.id);
    if (!quote) return error("Quote not found.", 404);
    return json({ ok: true, quote: withMoneyLabels(quote) });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPatch({ request, env, params }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);

    const current = await getQuoteById(db, params.id);
    if (!current) return error("Quote not found.", 404);

    const contentFields = [
      "scopeOfWork",
      "includedItems",
      "excludedItems",
      "assumptions",
      "priceLines",
      "pricingNotes",
      "totalPrice",
      "recurringPrice",
      "validUntil",
      "clientNotes",
      "internalNotes"
    ];

    const hasContentEdits = contentFields.some((field) => body[field] !== undefined);
    if (hasContentEdits && current.status !== "draft") {
      return error("Only draft quotes can be edited.", 409);
    }

    const nextStatus = body.status !== undefined ? String(body.status || "").trim() : null;
    if (nextStatus && !validStatuses.has(nextStatus)) {
      return error("Unsupported quote status.");
    }

    const statusChanging = nextStatus !== null && nextStatus !== current.status;
    if (statusChanging && nextStatus === "void" && current.status !== "draft") {
      return error("Only draft quotes can be voided.", 409);
    }

    const updates = [];
    const values = [];

    const contentMap = {
      scopeOfWork: "scope_of_work",
      includedItems: "included_items",
      excludedItems: "excluded_items",
      assumptions: "assumptions",
      priceLines: "price_lines",
      pricingNotes: "pricing_notes",
      totalPrice: "total_price",
      recurringPrice: "recurring_price",
      validUntil: "valid_until",
      clientNotes: "client_notes",
      internalNotes: "internal_notes"
    };

    for (const [key, col] of Object.entries(contentMap)) {
      if (body[key] !== undefined) {
        updates.push(`${col} = ?`);
        values.push(body[key]);
      }
    }

    if (statusChanging) {
      updates.push("status = ?");
      values.push(nextStatus);

      updates.push("sent_at = CASE WHEN ? = 'sent' THEN COALESCE(sent_at, CURRENT_TIMESTAMP) ELSE sent_at END");
      values.push(nextStatus);
      updates.push("accepted_at = CASE WHEN ? = 'accepted' THEN COALESCE(accepted_at, CURRENT_TIMESTAMP) ELSE accepted_at END");
      values.push(nextStatus);
      updates.push("rejected_at = CASE WHEN ? = 'rejected' THEN COALESCE(rejected_at, CURRENT_TIMESTAMP) ELSE rejected_at END");
      values.push(nextStatus);
      updates.push("expired_at = CASE WHEN ? = 'expired' THEN COALESCE(expired_at, CURRENT_TIMESTAMP) ELSE expired_at END");
      values.push(nextStatus);
      updates.push("voided_at = CASE WHEN ? = 'void' THEN COALESCE(voided_at, CURRENT_TIMESTAMP) ELSE voided_at END");
      values.push(nextStatus);

      if (nextStatus === "accepted" && !current.clientId) {
        const linkedClientId = await linkedClientIdForAssessment(db, current.assessmentQuoteId);
        if (linkedClientId) {
          updates.push("client_id = ?");
          values.push(linkedClientId);
        }
      }
    }

    if (updates.length > 0) {
      updates.push("updated_at = CURRENT_TIMESTAMP");
      const sql = `UPDATE accounting_quotes SET ${updates.join(", ")} WHERE id = ?`;
      values.push(params.id);
      await db.prepare(sql).bind(...values).run();

      if (statusChanging && (nextStatus === "sent" || nextStatus === "accepted")) {
        await supersedeSiblingSentQuotes(db, current.assessmentQuoteId, params.id);
      }
    }

    const updated = await getQuoteById(db, params.id);
    return json({ ok: true, quote: withMoneyLabels(updated) });
  } catch (err) {
    return error(err.message, 500);
  }
}
