import { error, json, requireDb } from "../../_util.js";
import { createDraftQuote } from "../../_quotes.js";

export async function onRequestPost({ env, params }) {
  try {
    const db = requireDb(env);
    const result = await createDraftQuote(db, params.id);
    return json(
      { ok: true, id: result.quote.id, accountingQuote: result.quote, alreadyExists: result.alreadyExists },
      { status: result.alreadyExists ? 200 : 201 }
    );
  } catch (err) {
    if (String(err.message || "") === "Assessment not found.") {
      return error(err.message, 404);
    }
    return error(err.message, 500);
  }
}
