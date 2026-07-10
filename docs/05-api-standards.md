# 05: API Standards

The CleanOps API is built on Cloudflare Pages Functions. This document details our conventions for creating and consuming endpoints.

## 1. REST-ish Conventions
- Use standard HTTP methods: `GET`, `POST`, `PATCH`, `DELETE`.
- Resource names should be plural (e.g., `/api/cleanops/customers`, `/api/cleanops/requests`).
- Sub-resources follow the parent path (e.g., `/api/cleanops/customers/[id]/properties`).

## 2. Response Format
All API endpoints must return a standardized JSON envelope:

**Success:**
```json
{
  "ok": true,
  "data": { ... } // or array
}
```

**Error:**
```json
{
  "ok": false,
  "error": "Error message description here"
}
```
HTTP status codes should reflect the error (400 Bad Request, 404 Not Found, 500 Internal Error).

## 3. PATCH Behavior (Updates)
- `PATCH` endpoints should only update the fields provided in the payload.
- Undefined fields in the payload should be ignored, not written as `null`.
- Explicit `null` in the payload means "clear this field".
- Always return the fully updated entity in the `data` payload.

## 4. Null Handling
- In the database, use true `NULL` for missing data, not empty strings `""` or string `"null"`.
- When serializing from DB to JSON, pass `null` directly.
- The frontend should handle `null` gracefully using `||` fallbacks or default labels.

## 5. File-Based Routing
Cloudflare Pages uses file-based routing:
- `functions/api/cleanops/customers.js` handles `/api/cleanops/customers` (usually GET list and POST create).
- `functions/api/cleanops/customers/[id].js` handles `/api/cleanops/customers/123` (usually GET single, PATCH update, DELETE).

## 6. DB Abstraction
Do not write SQL directly in the `functions/api/` route handlers.
- Route handlers extract the request, validate it, and format the response.
- SQL queries live in `functions/db/` (e.g., `functions/db/customers.js`).
- This keeps the HTTP logic separate from the data access logic.
