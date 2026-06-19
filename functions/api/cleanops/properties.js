import { json, error, requireDb } from "../_util.js";
import { createProperty } from "../../db/customers.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return error("Method Not Allowed", 405);
  }

  try {
    const db = requireDb(context.env);
    const body = await context.request.json().catch(() => ({}));

    if (!body.customerId) {
      return error("Bad Request: customerId is required to create a property.", 400);
    }

    const id = `prop-${crypto.randomUUID()}`;
    const newProp = await createProperty(db, {
      id,
      ...body
    });

    return json({ ok: true, data: newProp }, 201);
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
