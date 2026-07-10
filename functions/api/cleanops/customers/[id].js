import { json, error, requireDb } from "../../_util.js";
import { getCustomerById, updateCustomer, listPropertiesForCustomer } from "../../../db/customers.js";
import { listRequests } from "../../../db/requests.js";

export async function onRequest(context) {
  const method = context.request.method;
  if (method !== "GET" && method !== "PATCH") {
    return error("Method Not Allowed", 405);
  }

  try {
    const db = requireDb(context.env);
    const customerId = context.params.id;

    if (!customerId) return error("Missing customer ID", 400);

    if (method === "GET") {
      const customer = await getCustomerById(db, customerId);
      if (!customer) return error("Customer not found", 404);

      customer.properties = await listPropertiesForCustomer(db, customerId);
      customer.requests = await listRequests(db, { customerId });

      return json({ ok: true, data: customer });
    }

    if (method === "PATCH") {
      const body = await context.request.json().catch(() => ({}));

      let firstName = body.firstName;
      let lastName = body.lastName;
      if (body.name !== undefined && firstName === undefined && lastName === undefined) {
        const parts = body.name.split(/\s+/);
        firstName = parts[0];
        lastName = parts.slice(1).join(" ");
      }

      const updates = {
        type: body.type,
        firstName: firstName !== undefined ? firstName : body.firstName,
        lastName: lastName !== undefined ? lastName : body.lastName,
        companyName: body.companyName !== undefined ? body.companyName : body.company,
        email: body.email,
        phone: body.phone,
        sourceType: body.sourceType,
        status: body.status,
        billingAddress: body.billingAddress,
        internalNote: body.internalNote
      };

      // Clean undefined
      for (const key in updates) {
        if (updates[key] === undefined) delete updates[key];
      }

      const updatedCust = await updateCustomer(db, customerId, updates);
      if (!updatedCust) return error("Customer not found", 404);

      return json({ ok: true, data: updatedCust });
    }

  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
