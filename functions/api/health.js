import { error, json, requireDb } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const leads = await db.prepare("SELECT COUNT(*) AS count FROM leads").first();
    const jobs = await db.prepare("SELECT COUNT(*) AS count FROM jobs").first();
    const invoices = await db.prepare("SELECT COUNT(*) AS count FROM invoices").first();

    return json({
      ok: true,
      database: "connected",
      counts: {
        leads: leads.count,
        jobs: jobs.count,
        invoices: invoices.count
      }
    });
  } catch (err) {
    return error(err.message, 500);
  }
}
