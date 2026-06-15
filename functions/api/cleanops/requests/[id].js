import { json, error, requireDb } from "../../_util.js";
import { getRequestById, updateRequest } from "../../../db/requests.js";
import { updateCustomer, updateProperty, createProperty } from "../../../db/customers.js";

function extractSection(text, title) {
  if (!text) return undefined;
  const parts = text.split('\n\n');
  for (const part of parts) {
    if (part.startsWith(title + ':\n')) {
      return part.substring(title.length + 2).trim();
    }
  }
  return undefined;
}

function extractSingleLine(text, prefix) {
  if (!text) return undefined;
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith(prefix)) {
      return line.substring(prefix.length).trim();
    }
  }
  return undefined;
}

export async function onRequest(context) {
  const method = context.request.method;
  
  if (method !== "PATCH") {
    return error("Method Not Allowed", 405);
  }

  try {
    const db = requireDb(context.env);
    const requestId = context.params.id;

    if (!requestId) {
      return error("Request ID required", 400);
    }

    const existingRequest = await getRequestById(db, requestId);
    if (!existingRequest) {
      return error("Request not found", 404);
    }

    const body = await context.request.json().catch(() => ({}));
    if (Object.keys(body).length === 0) {
      return error("Bad Request: Please provide fields to update.", 400);
    }

    // Validation for status
    const validStatuses = ['new', 'quoted', 'won', 'lost', 'cancelled'];
    if (body.status !== undefined && !validStatuses.includes(body.status)) {
      return error("Bad Request: Invalid status.", 400);
    }

    // Determine final source type safely
    let finalSourceType = body.sourceType !== undefined ? body.sourceType : existingRequest.sourceType;
    let validSourceTypes = ['request', 'assessment', 'job', 'visit', 'billable_event', 'manual', 'manual_quote', 'manual_invoice', 'imported', 'other'];
    if (!validSourceTypes.includes(finalSourceType)) {
      finalSourceType = 'other';
    }

    // Format notes if relevant fields are provided
    const noteFields = ['notes', 'propertyNotes', 'cleaningNotes', 'internalNotes', 'cleaningProductsSuppliedBy', 'vacuumSuppliedBy', 'mopSuppliedBy', 'sourceType'];
    const hasNoteUpdates = noteFields.some(f => body[f] !== undefined);
    
    let newFormattedNotes = undefined;

    if (hasNoteUpdates) {
      const notesBlocks = [];
      const oldNotes = existingRequest.notes || "";
      
      const leadSource = body.sourceType !== undefined ? body.sourceType : extractSingleLine(oldNotes, 'Lead source: ');
      if (leadSource) notesBlocks.push(`Lead source: ${leadSource}`);

      const enq = body.notes !== undefined ? body.notes : extractSection(oldNotes, 'Customer enquiry');
      if (enq) notesBlocks.push(`Customer enquiry:\n${enq}`);

      const prop = body.propertyNotes !== undefined ? body.propertyNotes : extractSection(oldNotes, 'Property notes');
      if (prop) notesBlocks.push(`Property notes:\n${prop}`);

      const clean = body.cleaningNotes !== undefined ? body.cleaningNotes : extractSection(oldNotes, 'Cleaning notes');
      if (clean) notesBlocks.push(`Cleaning notes:\n${clean}`);

      const int = body.internalNotes !== undefined ? body.internalNotes : extractSection(oldNotes, 'Internal notes');
      if (int) notesBlocks.push(`Internal notes:\n${int}`);
      
      const prod = body.cleaningProductsSuppliedBy !== undefined ? body.cleaningProductsSuppliedBy : extractSingleLine(oldNotes, '* Cleaning products supplied by: ');
      const vac = body.vacuumSuppliedBy !== undefined ? body.vacuumSuppliedBy : extractSingleLine(oldNotes, '* Vacuum supplied by: ');
      const mop = body.mopSuppliedBy !== undefined ? body.mopSuppliedBy : extractSingleLine(oldNotes, '* Mop supplied by: ');

      const setupBlocks = [];
      if (prod) setupBlocks.push(`* Cleaning products supplied by: ${prod}`);
      if (vac) setupBlocks.push(`* Vacuum supplied by: ${vac}`);
      if (mop) setupBlocks.push(`* Mop supplied by: ${mop}`);

      if (setupBlocks.length > 0) {
        notesBlocks.push(`Setup:\n${setupBlocks.join('\n')}`);
      }

      newFormattedNotes = notesBlocks.join('\n\n') || null;
    }

    // Update Customer if fields provided
    if (existingRequest.customerId && (
        body.customerType !== undefined || 
        body.firstName !== undefined || 
        body.lastName !== undefined || 
        body.companyName !== undefined || 
        body.email !== undefined || 
        body.phone !== undefined
    )) {
      await updateCustomer(db, existingRequest.customerId, {
        type: body.customerType,
        firstName: body.firstName,
        lastName: body.lastName,
        companyName: body.companyName,
        email: body.email,
        phone: body.phone
      });
    }

    // Update Property if fields provided
    let newPropertyId = undefined;
    if (
        body.propertyAddressLine1 !== undefined ||
        body.propertyCity !== undefined ||
        body.propertyPostcode !== undefined
    ) {
      if (existingRequest.propertyId) {
        await updateProperty(db, existingRequest.propertyId, {
          addressLine1: body.propertyAddressLine1,
          city: body.propertyCity,
          postcode: body.propertyPostcode
        });
      } else if (existingRequest.customerId) {
        const createdProperty = await createProperty(db, {
          id: `prop-${crypto.randomUUID()}`,
          customerId: existingRequest.customerId,
          addressLine1: body.propertyAddressLine1,
          city: body.propertyCity,
          postcode: body.propertyPostcode,
          accessNotes: body.propertyNotes
        });
        newPropertyId = createdProperty.id;
      }
    }

    // Update Request
    await updateRequest(db, requestId, {
      status: body.status,
      notes: newFormattedNotes,
      sourceType: finalSourceType,
      propertyId: newPropertyId
    });

    const enrichedRequest = await getRequestById(db, requestId);
    return json({ ok: true, data: enrichedRequest });
  } catch (err) {
    return error(err.message || "Internal error", 500);
  }
}
