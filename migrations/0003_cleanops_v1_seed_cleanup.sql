-- migrations/0003_cleanops_v1_seed_cleanup.sql
-- Idempotent seed cleanup to ensure read endpoints return meaningful data

-- 1. Fix visit-1 to have realistic scheduled times (it is completed but had NULL scheduled times)
UPDATE visits 
SET scheduled_start = '2026-06-10 09:00:00', 
    scheduled_end = '2026-06-10 11:00:00' 
WHERE id = 'visit-1';

-- 2. Add one realistic scheduled visit
INSERT OR IGNORE INTO visits (id, job_id, status, scheduled_start, scheduled_end, assigned_team)
VALUES ('visit-2', 'job-1', 'scheduled', '2026-06-20 09:00:00', '2026-06-20 11:00:00', 'Team Alpha');

-- 3. Add one unscheduled/pending visit
INSERT OR IGNORE INTO visits (id, job_id, status, scheduled_start, scheduled_end, assigned_team)
VALUES ('visit-3', 'job-1', 'pending', NULL, NULL, NULL);

-- 4. Add one payment record linked to an invoice
INSERT OR IGNORE INTO payment_records (id, invoice_id, amount_pence, payment_method, status, reference, paid_at)
VALUES ('pay-1', 'inv-2', 4500, 'card', 'recorded', 'stripe_ch_123', '2026-06-13 14:00:00');
