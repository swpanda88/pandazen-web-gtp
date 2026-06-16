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
      const hasContactOrNotes = body.email || body.phone || body.notes ||
                                body.customerMessage || body.propertyNotes ||
                                body.cleaningNotes || body.internalNotes ||
                                body.shortScopingNote;

      if (!hasName || !hasContactOrNotes) {
        return error("Bad Request: Please provide at least a name and contact info or notes.", 400);
      }

      // Format notes for legacy 'notes' column if needed
      // B2a: we keep requests.notes as a legacy/backward-compatible field.
      const notesBlocks = [];
      if (body.sourceType) notesBlocks.push(`Lead source: ${body.sourceType}`);

      const customerMessage = body.customerMessage !== undefined ? body.customerMessage : body.notes;
      if (customerMessage) notesBlocks.push(`Customer enquiry:\n${customerMessage}`);

      if (body.propertyNotes) notesBlocks.push(`Property notes:\n${body.propertyNotes}`);
      if (body.cleaningNotes) notesBlocks.push(`Cleaning notes:\n${body.cleaningNotes}`);
      if (body.internalNotes) notesBlocks.push(`Internal notes:\n${body.internalNotes}`);

      const setupBlocks = [];
      if (body.cleaningProducts) setupBlocks.push(`* Cleaning products supplied by: ${body.cleaningProducts}`);
      else if (body.cleaningProductsSuppliedBy) setupBlocks.push(`* Cleaning products supplied by: ${body.cleaningProductsSuppliedBy}`);

      if (body.vacuumHoover) setupBlocks.push(`* Vacuum supplied by: ${body.vacuumHoover}`);
      else if (body.vacuumSuppliedBy) setupBlocks.push(`* Vacuum supplied by: ${body.vacuumSuppliedBy}`);

      if (body.mop) setupBlocks.push(`* Mop supplied by: ${body.mop}`);
      else if (body.mopSuppliedBy) setupBlocks.push(`* Mop supplied by: ${body.mopSuppliedBy}`);

      if (setupBlocks.length > 0) {
        notesBlocks.push(`Setup:\n${setupBlocks.join('\n')}`);
      }

      const formattedNotes = notesBlocks.join('\n\n') || null;

      const validSourceTypes = ['request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'website_enquiry', 'other'];
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

      // Create property if address or property facts provided
      let property = null;
      if (
        body.propertyAddressLine1 || body.propertyCity || body.propertyPostcode ||
        body.propertyType || body.bedrooms || body.bathrooms || body.petsPresent || body.parking
      ) {
        property = await createProperty(db, {
          id: `prop-${crypto.randomUUID()}`,
          customerId: customer.id,
          addressLine1: body.propertyAddressLine1,
          city: body.propertyCity,
          postcode: body.propertyPostcode,
          accessNotes: body.accessNotes, // not propertyNotes! propertyNotes goes to request in B2a
          propertyType: body.propertyType,
          bedrooms: body.bedrooms,
          bathrooms: body.bathrooms,
          petsPresent: body.petsPresent,
          parking: body.parking
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
        notes: formattedNotes, // legacy field
        requestType: body.requestType,
        cadence: body.cadence,
        howSoon: body.howSoon,
        preferredDay: body.preferredDay,
        preferredTimeWindow: body.preferredTimeWindow,
        approxSize: body.approxSize,
        photosHelpful: body.photosHelpful,
        quoteReadiness: body.quoteReadiness,
        assessmentRequired: body.assessmentRequired,
        initialCleanRequired: body.initialCleanRequired,
        pricingBasis: body.pricingBasis,
        estimatedRegularDurationMinutes: body.estimatedRegularDurationMinutes,
        estimatedInitialDurationMinutes: body.estimatedInitialDurationMinutes,
        estimatedTeamSize: body.estimatedTeamSize,
        scopeConfidence: body.scopeConfidence,
        mainPriorities: body.mainPriorities,
        quoteConsiderations: body.quoteConsiderations,
        cleaningProducts: body.cleaningProducts || body.cleaningProductsSuppliedBy,
        vacuumHoover: body.vacuumHoover || body.vacuumSuppliedBy,
        mop: body.mop || body.mopSuppliedBy,
        setupConfirmed: body.setupConfirmed,
        customerMessage: body.customerMessage !== undefined ? body.customerMessage : body.notes,
        shortScopingNote: body.shortScopingNote,
        propertyNotes: body.propertyNotes,
        cleaningNotes: body.cleaningNotes,
        internalNotes: body.internalNotes
      });

      const enrichedRequest = await getRequestById(db, reqId);
      return json({ ok: true, data: enrichedRequest }, 201);
    }
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
