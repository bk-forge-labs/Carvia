# Review fixes — 16 November 2026

Base: 8374887 on feat/veltrenne-connected-workspace. Owner authorized fixing the review findings. The owner subsequently authorized committing and pushing this fix set on 16 November. No deployment is authorized. Approved public marketplace composition is unchanged.

| Review finding | Correction / dependency | Verification | Status |
|---|---|---|---|
| Internal moderation history in dealer vehicle responses | Explicit dealer field allowlist applied to single/list and all document-returning dealer writes. Admin review responses retain their permissions. | Actual suspension writes synthetic internal note; authenticated single/list/photo-category responses omit it. Buyer access remains denied. | Fixed; integration verified |
| Owner preview using stale API | Identified Node 20 process serving old routes on 5050; attempted current source under supported Node 24 with unchanged .env. | Startup fails connecting to Atlas. Separate Node 22 and 24 connection probes both report MongooseServerSelectionError / ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR / TLS alert 80. Atlas connector reports AI access disabled. | Blocked; owner API currently unavailable |
| Original confirmed slot missing during proposed reschedule | Calendar range includes either interval. Calendar entries display original reserved and proposed slots separately, sort by displayed time, and open the original record. Conflict details show the interval actually blocking the booking. | Integration verifies original-day retrieval across months, private owner scope, and correct conflict interval. Frontend tests verify timezone boundaries, same-day distinct identities and midnight endings. | Fixed; automated checks pass; final native calendar inspection open |
| Expired proposal cannot be replaced | Dealer can propose a replacement while reschedule-proposed. Original reservation survives. Role, version, future-time and conflict checks remain enforced. | Integration expires a proposal, rejects buyer acceptance/proposal and stale dealer version, then replaces and accepts the valid proposal. | Fixed; integration verified |
| Enquiry/task scheduling creates buyer-invisible appointments | Enquiry action targets the same conversation's connected request controls; task action links to the exact enquiry and conversation. Generic calendar editor explicitly says the entry is private, does not create a buyer appointment, and links to the connected conversation. | TypeScript, lint and production build pass. Existing private-calendar and connected-lifecycle integration passes. Final native dealer navigation check was interrupted. | Fixed in source; final native navigation check unverified |
| Original buyer appointment message omitted | Render original message in request card and inspector separately from later public updates; preserve wrapping and newlines. | API integration asserts message contract. Native buyer conversation and inspector show the original synthetic message. Escape returns focus to Inspect request. | Fixed; API and native check verified |

## Actual checks

- [Backend](evidence/review-fixes-2026-11-16/backend.txt): 68/68 passing, zero skipped, including expanded integration assertions. Only guarded disposable loopback test databases.
- [Frontend](evidence/review-fixes-2026-11-16/frontend.txt): 9/9 passing (two new calendar cases).
- TypeScript `tsc --noEmit`: exit 0, no diagnostics.
- [Lint](evidence/review-fixes-2026-11-16/lint.txt): zero errors; three existing image warnings.
- [Build](evidence/review-fixes-2026-11-16/build.txt): isolated current-source `next build --webpack` passes. Default Turbopack was not repeated; its prior environment permission blocker remains open.
- Native Chrome: buyer original message visible in card and dialog; Escape focus restoration observed. Three-width QA harness loaded at 1440/768/390; full changed-state inspection was interrupted by `noWindowsAvailable`. Loading the harness alone does not establish responsive acceptance. No new motion/performance verdict.
- Isolated API 5081 health: HTTP 200 after refreshing source. QA preview: http://127.0.0.1:3021. Synthetic preview database only. Existing tunnel snapshot not updated.

## Files and responsibilities

- `server/utils/dealerCarView.js` (added): allowlisted dealer vehicle response.
- `server/controllers/carController.js`, `server/routes/carDealerRoutes.js`: apply the safe response to reads and writes.
- `server/routes/testDriveRoutes.js`: versioned replacement of pending proposals.
- `server/routes/workspaceRoutes.js`: reservation-aware range and conflict details.
- `server/tests/buyer-journey.integration.test.js`: real privacy, calendar, expiry, role/version and message regressions.
- `car-platform-web/src/lib/workspace/calendarEntries.ts` (added), `car-platform-web/tests/calendar-entries.test.cjs` (added): display entries for both intervals with timezone regression coverage.
- `car-platform-web/src/components/workspace/Calendar.tsx`, `shared.tsx`: render reservation/proposal entries; clarify private scheduling.
- `car-platform-web/src/components/enquiries/ConnectedConversation.tsx`: original message and replacement-proposal control.
- `car-platform-web/src/components/enquiries/EnquiryInbox.tsx`, `car-platform-web/src/components/workspace/Tasks.tsx`: connected appointment navigation.
- `docs/buyer-experience-handoff-2026-11-15.md`, `docs/buyer-experience-checklist-2026-11-15.md`, this report and evidence files: status, verification and remaining gates.

No schema migrations or asset changes. No owner database records edited. Disposable test records were created and cleaned by the existing guarded harness. Existing isolated preview source/API was refreshed; owner .env and frontend API target were not changed. No production mail, security weakening or deployment.

## Remaining gate

Restore owner Atlas connectivity, restart the current API on 5050 and confirm authenticated dashboard/message/decision/request routes. Do not substitute the synthetic database. Complete native dealer navigation and reserved/proposed calendar checks on desktop/tablet/phone. The broader public-document infrastructure, calendar/email/tasks/dashboard state audit, delivery tracking, performance/motion and real-user validation remain explicitly unfinished in the consolidated checklist. These five bug fixes are not a claim that the full buyer rollout is complete.


### Atlas reconnection follow-up — 16 November

After the owner reconnected Atlas, a fresh Node 24 connection and database ping succeeded. The current API was restarted on 5050 using the existing .env. `/api/health` returns 200; `/api/test-drives/summary`, `/api/buyer/decisions` and `/api/workspace/messages` each return 401 without credentials, confirming the routes exist and authentication remains enforced. This supersedes the earlier unavailable-API blocker. No security configuration or database target was changed.

Signed-in browser verification remains open: native Chrome capture failed with ScreenCaptureKit error -3811 (audio/video capture failure). Route availability is verified; authenticated workflow/visual acceptance is not newly claimed. No commit, push or deployment in this follow-up.
