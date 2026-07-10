import { json, error, requireDb } from "../_util.js";
import { listCustomers, listPropertiesForCustomer, createCustomer } from "../../db/customers.js";

export async function onRequest(context) {
  const method = context.request.method;
  if (method !== "GET" && method !== "POST") {
    return error("Method Not Allowed", 405);
  }

  try {
    const db = requireDb(context.env);

    if (method === "GET") {
      const url = new URL(context.request.url);
      const options = {
        type: url.searchParams.get("type") || undefined,
        sourceType: url.searchParams.get("sourceType") || url.searchParams.get("source_type") || undefined,
        search: url.searchParams.get("search") || undefined,
        limit: url.searchParams.has("limit") ? parseInt(url.searchParams.get("limit"), 10) : undefined,
        offset: url.searchParams.has("offset") ? parseInt(url.searchParams.get("offset"), 10) : undefined
      };

      const data = await listCustomers(db, options);
      // Attach properties for UI summary
      for (const cust of data) {
        cust.properties = await listPropertiesForCustomer(db, cust.id);
      }
      return json({ ok: true, data });
    }

    if (method === "POST") {
      const body = await context.request.json().catch(() => ({}));
      const hasName = body.firstName || body.lastName || body.companyName || body.name;
      const hasContact = body.email || body.phone;
      if (!hasName && !hasContact) {
        return error("Bad Request: Please provide at least a name or contact info.", 400);
      }

      const id = `cust-${crypto.randomUUID()}`;

      // Handle "name" fallback
      let firstName = body.firstName;
      let lastName = body.lastName;
      if (body.name && !firstName && !lastName) {
        const parts = body.name.split(/\s+/);
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      }

      const newCust = await createCustomer(db, {
        id,
        type: body.type || body.client_type || 'individual',
        sourceType: body.sourceType || body.lead_source || 'manual',
        firstName,
        lastName,
        companyName: body.companyName || body.company,
        email: body.email,
        phone: body.phone,
        status: body.status,
        billingAddress: body.billingAddress,
        internalNote: body.internalNote
      });
      return json({ ok: true, data: newCust }, 201);
    }
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
