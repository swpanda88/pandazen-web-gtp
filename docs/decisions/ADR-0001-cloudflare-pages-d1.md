# ADR-0001: Cloudflare Pages and D1 for Hosting and Database

**Status:** Accepted  

## Context
PandaZen requires a reliable, fast, and low-maintenance backend. We need to avoid managing complex server infrastructure (like AWS EC2 or RDS) while maintaining rapid deployment cycles and low latency.

## Decision
We chose Cloudflare Pages for hosting the frontend and serverless API endpoints (`functions/api/`). We chose Cloudflare D1 (serverless SQLite) for the database.

## Consequences
- **Pros:** Zero-config deployments, extremely low latency (edge execution), native SQLite support, very cheap scaling.
- **Cons:** D1 requires local migration files and strict syncing. We cannot easily use traditional ORMs. File-based routing restricts complex middleware chains.
