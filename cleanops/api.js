// cleanops/api.js

function buildQuery(options) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(options)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  const queryString = params.toString();
  return queryString ? "?" + queryString : "";
}

async function fetchJson(path, options = {}) {
  const url = path + buildQuery(options);
  const response = await fetch(url);
  let json = null;

  try {
    json = await response.json();
  } catch (err) {
    json = null;
  }
  
  if (!response.ok) {
    const message = json?.error || "HTTP error: " + response.status + " " + response.statusText;
    throw new Error(message);
  }
  
  if (json && json.ok === false) {
    throw new Error(json.error || "API error");
  }
  
  return json.data;
}

async function postJson(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  let json = null;

  try {
    json = await response.json();
  } catch (err) {
    json = null;
  }

  if (!response.ok) {
    const message = json?.error || "HTTP error: " + response.status + " " + response.statusText;
    throw new Error(message);
  }

  if (json && json.ok === false) {
    throw new Error(json.error || "API error");
  }

  return json.data;
}

async function patchJson(path, payload) {
  const response = await fetch(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  let json = null;

  try {
    json = await response.json();
  } catch (err) {
    json = null;
  }

  if (!response.ok) {
    const message = json?.error || "HTTP error: " + response.status + " " + response.statusText;
    throw new Error(message);
  }

  if (json && json.ok === false) {
    throw new Error(json.error || "API error");
  }

  return json.data;
}

export async function fetchCustomers(options = {}) {
  return fetchJson("/api/cleanops/customers", options);
}

export async function fetchCatalogue(options = {}) {
  return fetchJson("/api/cleanops/catalogue", options);
}

export async function fetchRequests(options = {}) {
  return fetchJson("/api/cleanops/requests", options);
}

export async function createRequest(payload) {
  return postJson("/api/cleanops/requests", payload);
}

export async function updateRequest(id, payload) {
  return patchJson("/api/cleanops/requests/" + encodeURIComponent(id), payload);
}

export async function fetchQuotes(options = {}) {
  return fetchJson("/api/cleanops/quotes", options);
}

export async function fetchJobs(options = {}) {
  return fetchJson("/api/cleanops/jobs", options);
}

export async function fetchVisits(options = {}) {
  return fetchJson("/api/cleanops/visits", options);
}

export async function fetchInvoices(options = {}) {
  return fetchJson("/api/cleanops/invoices", options);
}

export async function fetchBillableEvents(options = {}) {
  return fetchJson("/api/cleanops/billable-events", options);
}

export async function fetchPayments(options = {}) {
  return fetchJson("/api/cleanops/payments", options);
}

// Convenience helpers
export async function fetchQuoteById(id) {
  return fetchJson("/api/cleanops/quotes", { id });
}

export async function fetchQuoteByDisplayRef(displayRef) {
  return fetchJson("/api/cleanops/quotes", { displayRef });
}

export async function fetchInvoiceById(id) {
  return fetchJson("/api/cleanops/invoices", { id });
}

export async function fetchInvoiceByNumber(invoiceNumber) {
  return fetchJson("/api/cleanops/invoices", { invoiceNumber });
}
