// functions/db/catalogue.js
import { fromPence, boolFromDb } from './utils.js';

function mapCatalogueItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    itemType: row.item_type,
    incomeCategory: row.income_category,
    name: row.name,
    description: row.description,
    defaultUnit: row.default_unit,
    defaultRatePence: row.default_rate_pence,
    defaultRate: fromPence(row.default_rate_pence),
    defaultVatCode: row.default_vat_code,
    isActive: boolFromDb(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listCatalogueItems(db, options = {}) {
  let query = `SELECT * FROM catalogue_items WHERE 1=1`;
  const params = [];

  if (options.isActive !== undefined) {
    query += ` AND is_active = ?`;
    params.push(options.isActive ? 1 : 0);
  }
  if (options.incomeCategory) {
    query += ` AND income_category = ?`;
    params.push(options.incomeCategory);
  }
  if (options.itemType) {
    query += ` AND item_type = ?`;
    params.push(options.itemType);
  }

  query += ` ORDER BY name`;

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapCatalogueItem);
}

export async function listActiveCatalogueItems(db, options = {}) {
  return listCatalogueItems(db, { ...options, isActive: true });
}

export async function getCatalogueItemById(db, itemId) {
  const row = await db.prepare(`SELECT * FROM catalogue_items WHERE id = ?`).bind(itemId).first();
  return mapCatalogueItem(row);
}
