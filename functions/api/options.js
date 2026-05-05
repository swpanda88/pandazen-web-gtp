import { error, json, readJson, requireDb } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const { results } = await db
      .prepare(
        `SELECT g.key AS groupKey, g.label AS groupLabel, g.allow_other AS allowOther,
                o.id, o.value, o.label, o.sort_order AS sortOrder, o.is_active AS isActive
         FROM option_groups g
         LEFT JOIN options o ON o.group_key = g.key
         ORDER BY g.sort_order, g.label, o.sort_order, o.label`
      )
      .all();

    const groups = {};
    for (const row of results) {
      if (!groups[row.groupKey]) {
        groups[row.groupKey] = {
          key: row.groupKey,
          label: row.groupLabel,
          allowOther: Boolean(row.allowOther),
          options: []
        };
      }
      if (row.id) {
        groups[row.groupKey].options.push({
          id: row.id,
          value: row.value,
          label: row.label,
          sortOrder: row.sortOrder,
          isActive: Boolean(row.isActive)
        });
      }
    }

    return json({ groups: Object.values(groups) });
  } catch (err) {
    return error(err.message, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const db = requireDb(env);
    const body = await readJson(request);
    if (!body.groupKey || !body.label) {
      return error("groupKey and label are required.");
    }

    const value = body.value || body.label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    await db
      .prepare(
        `INSERT INTO options (group_key, value, label, sort_order)
         VALUES (?, ?, ?, COALESCE((SELECT MAX(sort_order) + 10 FROM options WHERE group_key = ?), 10))`
      )
      .bind(body.groupKey, value, body.label, body.groupKey)
      .run();

    return json({ ok: true });
  } catch (err) {
    return error(err.message, 500);
  }
}
