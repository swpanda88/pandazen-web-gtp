import { asMoney, error, json, readJson, requireDb } from "./_util.js";
import { createDraftQuote, listQuotes } from "./_quotes.js";

function withMoneyLabels(quote) {
  return {
    ...quote,
    totalPriceLabel: quote.totalPrice ? asMoney(quote.totalPrice) : "",
    recurringPriceLabel: quote.recurringPrice ? asMoney(quote.recurringPrice) : ""
  };
}

export async function onRequestGet({ request, env }) {
  try {
    const db = requireDb(env);
    const url = new URL(request.url);
    const quotes = await listQuotes(db, {
      assessmentQuoteId: url.searchParams.get("assessment_quote_id"),
      leadId: url.searchParams.get("lead_id"),
      clientId: url.searchParams.get("client_id")
    });

    return json({ quotes: quotes.map(withMoneyLabels) });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (!body.assessmentQuoteId) {
      return error("assessmentQuoteId is required.");
    }

    const result = await createDraftQuote(db, body.assessmentQuoteId);
    return json(
      {
        ok: true,
        id: result.quote.id,
        quote: withMoneyLabels(result.quote),
        alreadyExists: result.alreadyExists
      },
      { status: result.alreadyExists ? 200 : 201 }
    );
  } catch (err) {
    if (String(err.message || "") === "Assessment / Quote not found.") {
      return error(err.message, 404);
    }
    return error(err.message, 500);
  }
}
