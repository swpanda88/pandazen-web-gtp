import { asMoney, error, json, requireDb } from "./_util.js";
import { listQuotes } from "./_quotes.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const results = await listQuotes(db);

    return json({
      quotes: results.map((quote) => ({
        ...quote,
        totalPriceLabel: quote.totalPrice ? asMoney(quote.totalPrice) : "",
        recurringPriceLabel: quote.recurringPrice ? asMoney(quote.recurringPrice) : ""
      }))
    });
  } catch (err) {
    return error(err.message, 500);
  }
}
