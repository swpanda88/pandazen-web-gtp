import { json, error, requireDb } from "../_util.js";
import { listRequests, createRequest, getRequestById } from "../../db/requests.js";
import { getCustomerByEmail, createCustomer, createProperty } from "../../db/customers.js";

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
        status: url.searchParams.get("status") || undefined,
        sourceType: url.searchParams.get("sourceType") || undefined,
        customerId: url.searchParams.get("customerId") || undefined,
        propertyId: url.searchParams.get("propertyId") || undefined,
        search: url.searchParams.get("search") || undefined,
        limit: url.searchParams.has("limit") ? parseInt(url.searchParams.get("limit"), 10) : undefined,
        offset: url.searchParams.has("offset") ? parseInt(url.searchParams.get("offset"), 10) : undefined
      };

      const data = await listRequests(db, options);
      return json({ ok: true, data });
    }

    if (method === "POST") {
      const body = await context.request.json().catch(() => ({}));

      // Validation
      const hasName = body.firstName || body.lastName || body.companyName;
      const hasContactOrNotes = body.email || body.phone || body.notes;

      if (!hasName || !hasContactOrNotes) {
        return error("Bad Request: Please provide at least a name and contact info or notes.", 400);
      }

      // Format notes
      const notesBlocks = [];
      if (body.notes) notesBlocks.push(`Customer enquiry:\n${body.notes}`);
      if (body.propertyNotes) notesBlocks.push(`Property notes:\n${body.propertyNotes}`);
      if (body.cleaningNotes) notesBlocks.push(`Cleaning notes:\n${body.cleaningNotes}`);
      if (body.internalNotes) notesBlocks.push(`Internal notes:\n${body.internalNotes}`);
      
      const setupBlocks = [];
      if (body.cleaningProductsSuppliedBy) setupBlocks.push(`* Cleaning products supplied by: ${body.cleaningProductsSuppliedBy}`);
      if (body.vacuumSuppliedBy) setupBlocks.push(`* Vacuum supplied by: ${body.vacuumSuppliedBy}`);
      if (body.mopSuppliedBy) setupBlocks.push(`* Mop supplied by: ${body.mopSuppliedBy}`);

      if (setupBlocks.length > 0) {
        notesBlocks.push(`Setup:\n${setupBlocks.join('\n')}`);
      }

      const formattedNotes = notesBlocks.join('\n\n') || null;

      const validSourceTypes = ['request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'other'];
      const finalSourceType = body.sourceType && validSourceTypes.includes(body.sourceType) ? body.sourceType : 'other';

      // Check if customer exists by email
      let customer = null;
      if (body.email) {
        customer = await getCustomerByEmail(db, body.email);
      }
      
      if (!customer) {
        customer = await createCustomer(db, {
          id: `cust-${crypto.randomUUID()}`,
          type: body.customerType || 'individual',
          sourceType: finalSourceType,
          firstName: body.firstName,
          lastName: body.lastName,
          companyName: body.companyName,
          email: body.email,
          phone: body.phone
        });
      }

      // Create property if address provided
      let property = null;
      if (body.propertyAddressLine1 || body.propertyCity || body.propertyPostcode) {
        property = await createProperty(db, {
          id: `prop-${crypto.randomUUID()}`,
          customerId: customer.id,
          addressLine1: body.propertyAddressLine1,
          city: body.propertyCity,
          postcode: body.propertyPostcode,
          accessNotes: body.propertyNotes
        });
      }

      // Create request
      const reqId = `req-${crypto.randomUUID()}`;
      await createRequest(db, {
        id: reqId,
        customerId: customer.id,
        propertyId: property ? property.id : null,
        sourceType: finalSourceType,
        status: body.status || 'new',
        notes: formattedNotes
      });

      const enrichedRequest = await getRequestById(db, reqId);
      return json({ ok: true, data: enrichedRequest }, 201);
    }
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
