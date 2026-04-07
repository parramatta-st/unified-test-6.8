# Success Tutoring v2 — Initial Implementation Backlog

## Sprint 1: Platform Skeleton

1. Add Prisma schema and generate first migration.
2. Provision managed Postgres for dev/staging.
3. Create seed script for campuses + tutors.
4. Add auth scaffolding (`/api/v2/auth/login`, `/logout`, `/me`).
5. Add audit event helper for all new v2 writes.

## Sprint 2: Print Job Backbone

1. Add `/api/v2/print-jobs` create endpoint (DB-first write).
2. Add print job status callback endpoint for Mac service.
3. Persist print item-level updates.
4. Add notification enqueue on terminal print statuses.
5. Add admin list endpoint for print jobs.

## Sprint 3: Portal Compatibility Bridge

1. Keep `/api/print-proxy` as transport while dual-writing v2 print jobs.
2. Keep `/api/send-feedback` and persist `feedback_events` in DB.
3. Preserve existing webhooks as secondary log outputs.
4. Add feature flag to route print page through v2 create endpoint.

## Sprint 4: Tutor App MVP Read APIs

1. `GET /api/v2/sessions/today`
2. `GET /api/v2/students/:id`
3. `GET /api/v2/notifications`
4. `POST /api/v2/notifications/:id/read`

## Definition of Done for Foundation Phase

- All print requests are represented by a `print_jobs` record.
- Print status transitions are callback-driven by Mac service.
- Tutors have unique accounts and device push tokens.
- Notification records are created for each major operational event.
- Existing portal still works without workflow regressions.
