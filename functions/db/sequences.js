// functions/db/sequences.js

export function formatQuoteNumber(number) {
  return `Q-\${String(number).padStart(5, '0')}`;
}

export function formatQuoteDisplayRef(quoteNumber, version) {
  const v = String(version).padStart(2, '0');
  return `\${quoteNumber}/\${v}`;
}

export function formatInvoiceNumber(number) {
  return `INV-\${String(number).padStart(5, '0')}`;
}

/**
 * Gets the next document number for a given sequence ID ('quote', 'invoice').
 * 
 * TODO: D1 does not have explicit SELECT ... FOR UPDATE row locks. 
 * To implement safely in a high-concurrency environment, you should use D1 batching 
 * where the sequence increment is bundled into the same transaction as the document insert, 
 * or use an optimistic concurrency model.
 * 
 * For Stage 2A, this is a skeleton implementation using SQLite's RETURNING clause.
 */
export async function getNextDocumentNumber(db, sequenceId) {
  const result = await db.prepare(`
    UPDATE document_sequences 
    SET next_number = next_number + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING next_number - 1 AS assigned_number
  `).bind(sequenceId).first();

  if (!result || !result.assigned_number) {
    throw new Error(`Sequence '\${sequenceId}' not found or failed to increment.`);
  }

  return result.assigned_number;
}
