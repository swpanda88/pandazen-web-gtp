// functions/db/utils.js

export function toPence(value) {
  if (value === null || value === undefined || value === "") return 0;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function fromPence(pence) {
  if (pence === null || pence === undefined || isNaN(pence)) return 0;
  return Number((pence / 100).toFixed(2));
}

export function normaliseVatCode(vatCode, businessVatStatus) {
  if (businessVatStatus === 'not_registered') {
    return 'not_applicable';
  }
  return vatCode || 'not_applicable';
}

export function calculateLineTotals({ quantity, unitPricePence, vatCode, businessVatStatus }) {
  const safeQty = typeof quantity === "number" ? quantity : parseFloat(quantity || 0);
  const netAmountPence = Math.round(safeQty * unitPricePence);
  const code = normaliseVatCode(vatCode, businessVatStatus);
  
  let vatAmountPence = 0;
  if (businessVatStatus !== 'not_registered') {
    // TODO: Full VAT logic later. For now, we support the not_registered case.
    vatAmountPence = 0;
  }
  
  const grossAmountPence = netAmountPence + vatAmountPence;
  return {
    netAmountPence,
    vatAmountPence,
    grossAmountPence,
    vatCode: code
  };
}

export function calculateDocumentTotals(lines) {
  let netTotalPence = 0;
  let vatTotalPence = 0;
  let grossTotalPence = 0;
  
  for (const line of lines) {
    netTotalPence += line.netAmountPence || 0;
    vatTotalPence += line.vatAmountPence || 0;
    grossTotalPence += line.grossAmountPence || 0;
  }
  
  return { netTotalPence, vatTotalPence, grossTotalPence };
}

export function serializeSnapshot(value) {
  if (value === null || value === undefined) return null;
  try {
    return JSON.stringify(value);
  } catch (err) {
    return null;
  }
}

export function parseSnapshot(value) {
  if (value === null || value === undefined || value === "") return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
}

export function boolFromDb(value) {
  return value === 1;
}

export function boolToDb(value) {
  return value ? 1 : 0;
}
