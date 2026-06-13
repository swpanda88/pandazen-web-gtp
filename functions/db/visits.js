// functions/db/visits.js

function mapVisitRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    jobId: row.job_id,
    status: row.status,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    assignedTeam: row.assigned_team,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    // Joined context
    customerId: row.customer_id,
    propertyId: row.property_id,
    firstName: row.first_name,
    lastName: row.last_name,
    companyName: row.company_name,
    propertyAddressLine1: row.address_line1,
    propertyCity: row.city,
    propertyPostcode: row.postcode
  };
}

export async function listVisits(db, options = {}) {
  let query = "SELECT v.*, j.customer_id, j.property_id, c.first_name, c.last_name, c.company_name, p.address_line1, p.city, p.postcode FROM visits v LEFT JOIN jobs j ON j.id = v.job_id LEFT JOIN customers c ON c.id = j.customer_id LEFT JOIN properties p ON p.id = j.property_id WHERE 1=1";
  const params = [];

  if (options.status) {
    query += " AND v.status = ?";
    params.push(options.status);
  }
  if (options.jobId) {
    query += " AND v.job_id = ?";
    params.push(options.jobId);
  }
  if (options.customerId) {
    query += " AND j.customer_id = ?";
    params.push(options.customerId);
  }
  if (options.propertyId) {
    query += " AND j.property_id = ?";
    params.push(options.propertyId);
  }
  if (options.assignedTeam) {
    query += " AND v.assigned_team = ?";
    params.push(options.assignedTeam);
  }
  if (options.startDate) {
    query += " AND v.scheduled_start >= ?";
    params.push(options.startDate);
  }
  if (options.endDate) {
    query += " AND v.scheduled_start <= ?";
    params.push(options.endDate);
  }

  if (options.orderBy === "upcoming") {
    query += " ORDER BY v.scheduled_start ASC, v.id ASC";
  } else {
    query += " ORDER BY v.created_at DESC, v.id DESC";
  }

  if (options.limit) {
    query += " LIMIT ?";
    params.push(options.limit);
    if (options.offset) {
      query += " OFFSET ?";
      params.push(options.offset);
    }
  }

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapVisitRow);
}

export async function getVisitById(db, visitId) {
  const query = "SELECT v.*, j.customer_id, j.property_id, c.first_name, c.last_name, c.company_name, p.address_line1, p.city, p.postcode FROM visits v LEFT JOIN jobs j ON j.id = v.job_id LEFT JOIN customers c ON c.id = j.customer_id LEFT JOIN properties p ON p.id = j.property_id WHERE v.id = ?";
  const row = await db.prepare(query).bind(visitId).first();
  return mapVisitRow(row);
}

export async function listVisitsForJob(db, jobId) {
  return listVisits(db, { jobId });
}

export async function listUpcomingVisits(db, options = {}) {
  return listVisits(db, { ...options, orderBy: "upcoming" });
}

export async function listVisitsForDateRange(db, startDate, endDate, options = {}) {
  return listVisits(db, { ...options, startDate, endDate });
}

export async function createVisit(db, input) {
  if (!input.id || !input.jobId) {
    throw new Error("createVisit requires id and jobId to be provided.");
  }

  const query = "INSERT INTO visits (id, job_id, status, scheduled_start, scheduled_end, assigned_team) VALUES (?, ?, ?, ?, ?, ?) RETURNING *";
  const row = await db.prepare(query).bind(
    input.id,
    input.jobId,
    input.status || "scheduled",
    input.scheduledStart || null,
    input.scheduledEnd || null,
    input.assignedTeam || null
  ).first();

  return mapVisitRow(row);
}

export async function updateVisitStatus(db, visitId, status, options = {}) {
  const query = "UPDATE visits SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *";
  const row = await db.prepare(query).bind(status, visitId).first();
  return mapVisitRow(row);
}
