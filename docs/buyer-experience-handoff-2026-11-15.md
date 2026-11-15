# Buyer experience — implementation and verification handoff

Status: **local implementation checkpoint; full scope remains unfinished. No release approval.**

Implementation checkpoint: `8a6f032` (local only; no push).

Started from clean `feat/veltrenne-connected-workspace` at `7c70192`. Both connected workspace and buyer screen compositions were explicitly approved by the owner. The [consolidated requirement checklist](buyer-experience-checklist-2026-11-15.md) remains the source of scope and acceptance status. Every row is required; implemented does not mean fully verified.

## Implemented

Dealer drafts store an explicit test-drive choice without making legacy listings eligible. Dealer publication requires a boolean choice. Buyer submission rechecks publication, seller approval, demo/hold/sold status and eligibility in a transaction. The persisted sold timestamp is supported by the request contract; there is no new dealer sale-management interface. Disabling eligibility preserves existing commitments.

Existing Appointment now carries buyer requests and public messages/outcomes, separate from private notes. Request, confirmation, decline, proposed reschedule, acceptance, cancellation and completion use owner calendar locking and optimistic versions. A confirmed slot remains reserved during a proposed reschedule until accepted or explicitly cancelled/declined. Public conflict errors reveal no private appointment detail. Existing calendar conflict checks include these reservations. Pending requests are distinct from confirmed appointments.

Enquiry participant replies are persisted and idempotent. Private follow-up tasks retain their existing owner permissions. Dealer overview surfaces pending/upcoming appointments and unanswered conversations based on the last reply. Vehicle and enquiry query links narrow the authorized inbox. No cross-role access is added.

Favorites remain the decision-space source. Buyers compare up to three cars, choose a priority, see differing/reference values, and save private concerns/questions. Tablet/phone show one compared vehicle with switch controls. Private-note updates use the version from the editing session, so background refresh cannot silently authorize an overwrite. Retrieval is bounded in batches of visible saved vehicles. Unavailable saved listings remain as tombstones without exposing hidden listing details.

Optional anonymous guided discovery maps supported preferences into normal filters. Listing/detail links retain query state and record the browse scroll position. Save feedback reserves space. Detail pages retain the approved public design, expose unknowns, condition/charges and dealer-source disclosure. Photo categories require dealer-supplied labels on actual owned images; no category is inferred. **Public document intake/approval/visibility infrastructure remains unfinished.** The page explicitly says no approved public documents are supplied; private dealer documents are not reused.

## Evidence actually observed

Native Chrome, synthetic local accounts/data only:

- Selected three saved cars; switched tablet/phone comparison vehicles; observed reference values. Tablet wrap defect corrected with switch layout at 900px.
- Saved a private concern and observed persistence after reload.
- Submitted the vehicle enquiry; dealer observed it and sent a reply; buyer observed that reply.
- Created a linked dealer task with a private note; buyer conversation did not expose that note.
- Requested 20 November 2026, 14:00–15:00 Europe/Berlin. Observed pending state before dealer confirmation, then the same confirmed state for the buyer at 1440, 768 and 390 CSS widths.
- Opened 20 November in the dealer calendar and inspected the same BMW i4 record at 14:00–15:00 CET. Used Tab and Enter to follow the conversation link.
- Escape dismissed the appointment editor and returned focus to its trigger. Fixed a development Strict Mode queued-close event that prematurely dismissed seeded dialogs; task creation then succeeded.
- Explicit test confirmation returned `provider-accepted`. The local SMTP sink recorded the message. This is not delivery evidence. No real mail was sent.
- Inspected conversation top and lower content screenshots at desktop/tablet/phone widths. This is not a complete state matrix or motion audit.

The final attempted native outcome action was interrupted by browser control reporting that the user changed Chrome. A fresh state showed Google Translate. No action was taken on that site. Stable browser access is needed to resume the remaining checks; prior permission to audit is already recorded and does not need repeating.

Automated evidence is in [the evidence folder](evidence/buyer-experience-2026-11-15/): 68 backend tests, zero skipped; 7 existing frontend tests; full lint zero errors with three pre-existing image warnings. Production build and TypeScript pass using `next build --webpack` in an isolated copy with explicit local API variables. Default Turbopack remains environment-blocked by `binding to a port: Operation not permitted`, including the escalated attempt. Webpack success does not establish that the default Turbopack build works here.

Backend integration includes private-note ownership and version conflicts, scoped/idempotent replies, request duplicates, persisted sold rejection, disable-with-existing-commitment preservation, confirmation/decline/reschedule/accept/cancel/outcome, terminal and stale transitions, DST gap rejection, private conflict redaction and two simultaneous dealer confirmations with exactly one success. Existing workspace integration also tests task persistence, concurrency and SMTP accepted/failed/unknown/deduplicated behavior.

## Remaining required work

1. Finish native outcome, reschedule/accept/decline/cancel, failed-send/retry and exact context-link checks on the latest source. Late reservation, pagination, stale-note recovery and reply-count changes have automated coverage but no final native regression.
2. Finish guided-discovery, filters/sorting/pagination/scroll Back/Forward, unavailable/empty/error/loading states, save feedback, keyboard drawer/focus and reduced-motion/temporal/performance inspection. Do not treat static screenshots or API checks as substitutes.
3. Revisit every affected page/state at desktop/tablet/phone and intermediate widths, including the four inconclusive bookings observations from the previous audit. Calendar, email, tasks and dashboard rollout remain explicitly unfinished until this passes.
4. Complete public-document visibility infrastructure and tests before claiming that evidence-document workflow. No approved public document fixture or existing authorization contract was found. Retain the explicit missing-information state meanwhile.
5. Expand specific eligibility publish/ownership/racing-disable and media-label browser checks. Existing permission/publication regression tests passing does not prove every new field's native flow.
6. Real-user validation is separate: the checklist includes the three-car test scenario, but no participants have been observed and no customer validation is claimed.

## Local environment and changes

Preview: `http://127.0.0.1:3021`, API 5081, QA proxy 5082, Mongo replica set 27029, SMTP sink 2527. All records are synthetic in the named `veltrenne_workspace_preview` database. Test databases are separately guarded `veltrenne_review_test`, `veltrenne_workspace_test`, and `veltrenne_buyer_test`. Node 24.19.0 was used. These temporary processes can expire. The preview proxy currently mishandles binary uploads as text; correct that QA harness before evaluating fixture photo rendering. Do not modify product image handling to hide that harness defect.

Database additions: BuyerDecision plus indexes; additive Car eligibility/confidence/photo-label/sold fields; Enquiry replies; Appointment public request and retained reservation fields. Existing Appointment/calendar/task/mail infrastructure is reused. No production migration was run. No dependencies, approved product assets or production configuration changed. Synthetic preview assets exist only under temporary QA storage.

[File-by-file purpose manifest](buyer-experience-file-manifest-2026-11-15.md). Local commits are checkpoints, not acceptance. No push, merge, deployment, production sending, external calendar sync or volume deletion is authorized or performed by this work. Next gate is complete engineering/browser evidence, then owner acceptance; production remains separately gated.
