export function json(data, init = {}) {
  const options = typeof init === "number" ? { status: init } : init;
  return Response.json(data, {
    headers: {
      "cache-control": "no-store",
      ...(options.headers || {})
    },
    status: options.status || 200
  });
}

export function error(message, status = 400) {
  return json({ error: message }, { status });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function requireDb(env) {
  if (!env.DB) {
    throw new Error("D1 binding DB is not configured.");
  }
  return env.DB;
}

export function asMoney(amountPence) {
  const amount = Number(amountPence || 0) / 100;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP"
  }).format(amount);
}

export async function optionMap(db) {
  const { results } = await db
    .prepare(
      `SELECT group_key, value, label
       FROM options
       WHERE is_active = 1
       ORDER BY group_key, sort_order, label`
    )
    .all();

  return results.reduce((map, option) => {
    map[`${option.group_key}:${option.value}`] = option.label;
    return map;
  }, {});
}

export function labelFor(labels, group, value) {
  if (!value) return "";
  return labels[`${group}:${value}`] || value;
}

export async function getJobChecklist(db, jobId) {
  const { results } = await db
    .prepare(
      `SELECT id, section, label, is_required AS isRequired, sort_order AS sortOrder,
              completed, completed_at AS completedAt, completion_note AS completionNote
       FROM job_checklist_items
       WHERE job_id = ?
       ORDER BY sort_order, id`
    )
    .bind(jobId)
    .all();

  return results.map((item) => ({
    ...item,
    isRequired: Boolean(item.isRequired),
    completed: Boolean(item.completed)
  }));
}

export async function copyPlanChecklistToJob(db, cleaningPlanId, jobId) {
  await db
    .prepare(
      `INSERT INTO job_checklist_items (job_id, section, label, is_required, sort_order)
       SELECT ?, section, label, is_required, sort_order
       FROM cleaning_plan_items
       WHERE cleaning_plan_id = ?
       ORDER BY sort_order, id`
    )
    .bind(jobId, cleaningPlanId)
    .run();
}

export function csv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          if (/[",\n]/.test(text)) {
            return `"${text.replace(/"/g, '""')}"`;
          }
          return text;
        })
        .join(",")
    )
    .join("\n");
}
