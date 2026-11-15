# Veltrenne connected workspace — local handoff

Status: **implemented and locally committed; composition owner approved; final browser verification pending. Not dashboard completion or release approval.**

## Repository and preservation

Repository: `/Users/basheerkattan/Developer/BK-CODE/car-platform`. Work began on main at `167da19cf0a84d32b4d94a323454a65b73e7b708` with the prior rollout uncommitted. Those changes were preserved on `feat/veltrenne-connected-workspace` and committed as `94591a7`. Main has not moved. Backend implementation is `33f2c35`; connected screens are `0a032fc`; repeatable test cleanup and guarded preview seeding are `440d110`. No push, merge or deployment was performed. Product remains Veltrenne; infrastructure paths remain unchanged.

## Implemented scope

The role-aware shared workspace covers dealer and admin nested screens, buyer overview/favorites/enquiries, account and existing service bookings. The public marketplace design is preserved. Dealer booking access was not broadened. Calendar, tasks and email are no longer absent features, but remain unfinished rollout scope until the gates below pass.

Calendar provides month/week/day views, timezone-aware meeting/test-drive creation, inspection, edits/rescheduling, explicit conflict override, cancellation and recorded completion outcome. UTC instants and named IANA zones persist; impossible dates and DST gaps are rejected and repeated hours require a choice. Serialized transactional owner locking prevents concurrent overlap checks from racing. Version checks reject stale updates. Terminal records cannot reopen. Optional vehicle/enquiry/customer links are authorized server-side; customer derives from the enquiry. Admin scheduling is private to its owner and grants no access to dealer enquiries or private calendar data.

Tasks persist owner, due instant/zone, status, notes and authorized links. Enquiry-to-task-to-appointment linking is transactional and idempotent; no team/delegation model was invented. Existing service Booking remains separate because it represents purchased services, not dealer appointments.

Confirmation email uses existing SMTP configuration through a shared transport factory. Explicit dealer sending derives recipient/content from an owned appointment and currently assigned buyer enquiry. Private notes are excluded. Unique appointment-version records, atomic send claims and retry tokens prevent duplicate sends. States distinguish queued, sending, provider-accepted, failed and unknown; acceptance never means delivered. Uncertain SMTP acknowledgement is not automatically retried. Recorded outcomes can be sent explicitly. No reminders or real customer emails were sent. Production delivery receipts/provider webhook contract remains unimplemented; do not label accepted mail delivered.

New collections are Appointment, FollowUpTask and WorkspaceMessage, plus the private WorkspaceCalendarLock collection for transactional owner locking; indexes and transaction behavior were exercised only on disposable local databases. No dependency, product asset or production configuration changes were needed.

## Verification and limits

[Evidence index](evidence/workspace-connected-2026-11-15/README.md) and [machine-readable checks](evidence/workspace-connected-2026-11-15/checks.json).

- Backend: final 65/65, zero skipped, including real isolated MongoDB/Express/SMTP integration. A legacy fixed-email test leaked fixtures on repeat; corrected cleanup and unique identities, then repeated successfully.
- Frontend: 7/7 tests, TypeScript passed, focused lint passed; full lint zero errors and three pre-existing image warnings.
- Production build: passed in an isolated temporary copy, 37 static pages. Existing middleware convention deprecation remains.
- Existing real workflows: 11 groups passed, covering roles, dealer approval, vehicle ownership/publication/photo upload, favorites, enquiries/stale updates, profile privilege rejection, bookings and moderation evidence.
- Connected integration covers DST, authorization/isolation, concurrent conflict checks, stale edits, cancellation/outcome, task linking/replay, persistence and actual loopback SMTP acceptance/rejection/uncertain acknowledgement/deduplication.
- 406 responsive DOM observations recorded at seven widths with zero measured horizontal overflow. Four buyer-bookings observations (162–165) are inconclusive and need rechecking. This is not 406 screenshot reviews.
- Native Chrome observed disposable login, desktop month/week, editor links, duplicate confirmation protection, persisted follow-up creation, expanded saved email without private notes, and Escape dismissal. Prior shared-shell visual audit is retained separately in the older handoff.

**Remaining gate:** Chrome control failed with `cgWindowNotFound` and `browser access host is unavailable`, including reconnect attempts. Phone/tablet/intermediate visual inspection of new screens, browser calendar create/reschedule/cancel/outcome, Back/Forward, final drawer/focus checks, and four inconclusive bookings observations remain unverified. Do not bypass this gate using the DOM measurements or API tests.

The [concrete connected-screen design proposal](workspace-connected-design-proposal-2026-11-15.md) awaits owner approval. The current screens are reviewable proposals; silence is not approval. Approval and remaining browser evidence are required before declaring the dashboard finished. Production SMTP activation/delivery tracking and future reminder policy require a separate explicit scope decision. No deployment is authorized.

## Local review and reproducibility

Current isolated review: http://127.0.0.1:3021/calendar, `/tasks`, `/email`. API 5081, QA-only proxy 5082, loopback SMTP sink 2527; MongoDB replica set 27029. These processes and synthetic preview data are temporary and may need restarting. Never point these tests at an owner or production database. Login `connected-dealer@example.invalid` (or connected-admin / connected-buyer at the same domain), password `isolated QA login password`; these are disposable fixtures only.

Use Node >=22 (verified Node 24.19.0). Reproducible backend checks from the repository root with the disposable replica set running:

```sh
VELTRENNE_TEST_MONGO_URI='mongodb://127.0.0.1:27029/veltrenne_review_test?replicaSet=qa' VELTRENNE_WORKSPACE_TEST_MONGO_URI='mongodb://127.0.0.1:27029/veltrenne_workspace_test?replicaSet=qa' node --test server/tests/*.test.js
VELTRENNE_WORKSPACE_PREVIEW_URI='mongodb://127.0.0.1:27029/veltrenne_workspace_preview?replicaSet=qa' node server/scripts/seed-workspace-preview.js
```

The second command seeds only the explicitly named loopback preview database, preserves existing fixtures and sends no mail. Start the sink with `node server/scripts/workspace-mail-sink.js`; configure its loopback port explicitly to match the backend. `WORKSPACE_MAIL_SINK=true` is honored only outside production and only for loopback SMTP. For the frontend run the scripts in car-platform-web/package.json; local QA API variables must point to the disposable backend. Existing owner previews were not modified.

## Files and external handoff

[Every changed file and its purpose](workspace-connected-file-manifest-2026-11-15.md) includes the preserved rollout and connected implementation. [Prepared external update](workspace-connected-external-update-2026-11-15.md) is ready for the established project destination. No specific authorized Figma/Notion/Asana destination was established, so external synchronization is pending and no external write is claimed.

## Owner approval and resumed browser audit

The owner explicitly approved the proposed calendar/tasks/email composition on 15 November 2026. This supersedes the pending-design statements above. Chrome access was restored, superseding the earlier access failure. Native inspection observed the calendar header/month layout at 1440, 768 and 390 CSS px, plus the scrolled phone grid and selected-day agenda: controls and long appointment title remained within the visible panel. Tasks loaded with the two persisted fixtures. The attempted navigation to email was interrupted by a user tab change; Chrome reported the change and showed Vercel. No action was taken on Vercel. Further UI actions were paused to avoid interference. Remaining state, intermediate-width, calendar mutation, Back/Forward and drawer/focus checks are still open; no full audit completion is claimed.
