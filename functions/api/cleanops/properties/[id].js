import { json, error, requireDb } from "../../_util.js";
import { updateProperty } from "../../../db/customers.js";

export async function onRequest(context) {
  if (context.request.method !== "PATCH") {
    return error("Method Not Allowed", 405);
  }

  try {
    const db = requireDb(context.env);
    const propertyId = context.params.id;
    if (!propertyId) return error("Missing property ID", 400);

    const body = await context.request.json().catch(() => ({}));

    // Remove undefined
    for (const key in body) {
      if (body[key] === undefined) delete body[key];
    }

    const updatedProp = await updateProperty(db, propertyId, body);
    if (!updatedProp) return error("Property not found", 404);

    return json({ ok: true, data: updatedProp });
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
