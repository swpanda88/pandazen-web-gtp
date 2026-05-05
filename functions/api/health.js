import { error, json, requireDb } from "./_util.js";

export async function onRequestGet({ env }) {
  try {
    const db = requireDb(env);
    const leads = await db.prepare("SELECT COUNT(*) AS count FROM leads").first();
    const jobs = await db.prepare("SELECT COUNT(*) AS count FROM jobs").first();
    const invoices = await db.prepare("SELECT COUNT(*) AS count FROM invoices").first();
    const followups = await db.prepare("SELECT COUNT(*) AS count FROM job_followups WHERE status = 'open'").first();

    return json({
      ok: true,
      database: "connected",
      counts: {
        leads: leads.count,
        jobs: jobs.count,
        invoices: invoices.count,
        openFollowups: followups.count
      }
    });
  } catch (err) {
    return error(err.message, 500);
  }
}
