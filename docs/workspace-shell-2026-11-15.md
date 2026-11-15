# Persistent dealer/admin workspace — 15 November 2026

Current continuation: [connected workspace handoff](workspace-connected-2026-11-15.md), including local calendar/tasks/email implementation and outstanding verification/approval gates.

Status: **Shared workspace expanded locally; verification evidence below. Not a completed operations suite or release approval.**

The rollout update below supersedes the original milestone’s scope and delivery status. The original record is retained after it.

## Rollout update — local main after 096e547

### Baseline and boundaries
Work started with a clean checkout at `167da19cf0a84d32b4d94a323454a65b73e7b708`, containing the imported and pushed shell commit `096e5471c4f1522fb648c8c064baf58895acaff5`. The earlier bundle-delivery limitation at the end of this document is historical: the bundle was subsequently imported and main pushed. This rollout was subsequently preserved and committed locally as `94591a7` on `feat/veltrenne-connected-workspace`. No deployment, production configuration change, live customer mutation, database migration, dependency or product asset change was made.

### What changed
- The persistent shell now derives navigation from the authenticated role across dealer, admin, buyer, account and bookings. Account and saved vehicles moved from the public route group into the dashboard route group without changing their URLs. Public marketplace layout, header and identity remain intact.
- Buyer overview now provides saved vehicles, enquiries and existing service booking records. The buyer layout enforces the buyer role. Admin retains review destinations; dealer retains inventory and enquiries. Dealer bookings remain unavailable because the existing API does not grant that permission.
- `/bookings` now reads existing buyer-owned or administrator booking records from the existing protected endpoints. It supports status filtering, pagination, local-time dates, notes, cancellation reasons, missing-service/account fallbacks, loading, error/retry and empty states. It does not schedule appointments or approve/cancel/complete bookings.
- Nested forms, galleries, reviews, inboxes and account panels respond to the actual space beside the sidebar through scoped container queries. Form fields, detail sidebars, cards, long names, controls and pagination stack at narrow widths. Public collection styling changes apply only within the named workspace container.
- Dashboard route loading screens share one themed component and errors expose retry/account recovery. `/dealers` redirects to the existing guarded dealer entry. Safe sign-in return destinations include buyer overview and bookings.
- Page finder clears old searches and explicitly focuses its input. Account highlighting uses the shared destinations. Sidebar state survives client navigation.
- Real isolated booking creation exposed `schema.saveParse` in backend validation. Corrected it to Zod's `safeParse` and added acceptance/rejection regression tests. Singular booking/publication-hold labels were corrected after inspection.

### Evidence and actual checks
- [Responsive render matrix](evidence/workspace-rollout-2026-11-15/render-matrix.json): 318 actual Next.js render observations at 1440, 768 and 390 CSS px; document width and visible descendant bounds recorded, with zero recorded horizontal-overflow findings. Includes all affected route families, ordinary/empty/error/delayed/missing/unavailable states where applicable, dealer status variants, account security variants, guest redirects and wrong-role redirects. This is a DOM render audit, not 318 individually reviewed screenshots.
- Server-rendered delayed cases can finish before measurement; their recorded headings show the resolved state. They do not prove every transient route-loading frame. Client loading statuses are recorded where observed.
- Native Chrome visual inspection compared all three widths for dealer overview, inventory, listing detail, published edit, new listing, photo management, enquiries, application and rejected status; admin overview, dealer directory/detail and inventory review directory/detail; buyer overview, collection and unavailable-listing enquiries; account and security-error panels; buyer bookings and administrator missing-service bookings. Long-form edit sections were scrolled through; earlier tall-frame comparisons were supplemented with 900px-high desktop/tablet and 844px-high phone checks.
- Native keyboard/UI checks observed Cmd+K input focus, no-match feedback, keyboard result navigation to bookings, Escape focus return, collapsed sidebar retention after navigation, actual phone drawer open/link/close, account menu role links, and sign-out returning to `/login?next=%2Fbookings`. Admin release-hold evidence form expansion and cancellation were observed without changing a real record.
- [Real workflow results](evidence/workspace-rollout-2026-11-15/workflow-results.json): 11 passing groups using the real Express/Mongoose application and a disposable localhost MongoDB replica set: role logins/denials, dealer application/approval, draft ownership, real image upload/readiness/publication, favorites, enquiry status/badge/stale conflict, own profile/privilege rejection, buyer/admin booking read contract, evidence-based hold release/stale repeat, reconnect persistence. The actual buyer sign-in and persisted booking were also observed in Chrome. These API/database checks are separate from fixture rendering. The disposable database container was stopped and removed after verification; its test data is not retained.
- Final backend suite: 58 passed, zero failed, one database-only test skipped in the ordinary run. That integration test was run separately against the disposable replica set and passed 1/1. An initial repeat failed because the temporary container had stopped; after recreation the test passed. Existing Mongoose option deprecation warnings remain.
- Frontend auth-return tests: 4/4. Final route type generation, TypeScript, focused ESLint and `git diff --check` passed. Final default Turbopack production build passed and generated 34 static pages. Existing Next middleware convention warning remains.
- Chrome's development hydration warning identified Grammarly-added body attributes. It was not hidden or patched around. Deliberately injected API failures also generate expected development errors. There is no blanket clean-console claim.

### Evidence limits and remaining verification
The matrix plus page inspections provide substantially broader evidence than overview samples. They do not establish a complete manual visual/keyboard traversal of every mutation confirmation, saving/toast, stale-conflict, retry and pagination combination at every width. Some lower sections and transient server loading frames still need that manual pass before an exhaustive audit can be claimed. Reduced-motion and hover styles were inspected in code; temporal motion, physical devices, screen-reader testing, measured performance and hosted behavior remain unassessed. These limitations are retained rather than marking the entire requested audit complete.

### Explicitly unfinished product scope
- **Calendar / appointments / meetings / test drives:** scheduling model, timezone rules, ownership, conflicts, permissions and reminder behavior remain unfinished.
- **Integrated email:** provider setup, persisted history, retries, delivery/failure status and inbox integration remain unfinished. Existing email links and account security screens do not complete that scope. QA disabled real email delivery.
- **Tasks / follow-ups / team responsibilities:** persistent tasks, assignments, due dates and permission rules remain unfinished.
- **Booking actions:** scheduling and approve/cancel/complete interfaces remain unfinished. This rollout supplies existing-record views only.

### Changed files
- Shell/navigation: `WorkspaceShell.tsx`, `WorkspaceShell.module.css`, new `WorkspaceLoading.tsx` and `WorkspacePages.module.css`, under `src/components/layout`.
- Routes: moved `(public)/account/page.tsx` and `(public)/buyer/favorites/page.tsx` into `(dashboard)`; added buyer role layout and dashboard error boundary; changed buyer overview, bookings and dealers alias pages; replaced root/admin/admin-cars/buyer/dealer/dealer-cars/bookings loading files with the shared loading export.
- Nested layout fixes: `DealerDirectory.module.css`, `AccountSettings.module.css`, `Collection.module.css`, `DealerApplication.module.css`, `DealerCarCreateForm.module.css`, `DealerCarImagesManager.module.css`, `DealerCommandCenter.module.css`, `DealerWorkspace.module.css`, `EnquiryInbox.module.css`. Singular hold copy in `AdminOverview.tsx`.
- Booking view: new `src/components/bookings/Bookings.tsx`.
- Contracts/tests: `src/lib/auth/returnTo.ts`, `tests/auth-return.test.cjs`, `server/middleware/validate.js`, new `server/tests/booking-validation.test.js`.
- Handoff/evidence: this document and `docs/evidence/workspace-rollout-2026-11-15/`. Generated `next-env.d.ts` restored to its pre-task content.

### Review and continuation
Local synthetic preview: [responsive comparison](http://localhost:3017/visual.html?role=dealer&route=/dealer). It requires the temporary fixture runtime and is not customer data or a deployment. The evidence README describes the harness and isolation. Next gate: finish the remaining manual state traversal above, then owner acceptance of the shared workspace. Launch approval remains separate; do not deploy on the basis of this document.

## Original shell milestone (historical)

## Objective and reference
The owner asked to apply the persistent sidebar, top bar, rounded workspace surface and click/entry behaviour shown in the supplied 13.9-second Admin Dashboard V7 recording. The previous dashboard had improved page content but retained horizontal navigation. This milestone establishes the shared navigation shell with Veltrenne's existing charcoal, muted green and champagne-gold identity. It is an adaptation of the reference, not a claim of pixel-identical reproduction of its light chart cards or a complete operations suite.

## Implementation
- `car-platform-web/src/components/layout/WorkspaceShell.tsx`: persistent dealer/admin shell; distinct role destinations, collapsed desktop navigation, native modal mobile drawer, current-page highlighting, quick page finder with Ctrl/Cmd+K, Escape and focus return, route entry animation and heading-position reset. Existing AccountMenu and EnquiryCount reused. Destination search searches workspace pages only, not customer or vehicle records.
- `car-platform-web/src/components/layout/WorkspaceShell.module.css`: reference-driven shell surfaces, existing palette, responsive drawer below 900px, keyboard focus, reduced-motion support. Existing page interiors and assets retained.
- `car-platform-web/src/app/(dashboard)/layout.tsx`: compose the shell once around existing route children; server-rendered children stay server-rendered. Existing role guards and API permissions are unchanged.
- `car-platform-web/src/components/layout/DashboardHeader.tsx`: remove superseded dealer/admin horizontal navigation; retain public/buyer and general fallback headers.
- `docs/evidence/workspace-shell-desktop.png`: browser screenshot with explicitly synthetic preview data.

## Validation
- Final TypeScript (`tsc --noEmit --incremental false`), focused ESLint and `git diff --check` passed. Default Turbopack production build passed with non-secret localhost API configuration; all 34 static pages generated. Existing middleware deprecation warning remains.
- Actual Next.js application rendered against an isolated local fixture API, with no MongoDB access, email delivery, real credentials or account/listing mutations. This validates presentation/integration with fixture contracts, not production authorization or real database behaviour.
- Desktop dealer overview: visual inspection, collapse/expand, navigation to enquiries, state retained across navigation. Found and fixed route scroll preservation; new heading subsequently observed at y=164 with scrollY=0.
- Quick navigation: filtered results, no-match message, result navigation, Ctrl+K, Escape close and focus return checked.
- Responsive iframe browser QA: 390px phone dealer overview/drawer/enquiries, 768px inventory empty state, 1024px dealer overview, 1024px and 390px admin overview; mobile dealer and admin navigation exercised. Measured no horizontal overflow in the tested tablet inventory, tablet overview/admin and phone admin documents (classic scrollbars reduced some layout viewport widths by 15px). This is not physical-device QA or an exhaustive audit of every nested editor/review state.
- Existing account connection failure was visible when the fixture API was initially unavailable; normal content returned after fixing the isolated fixture runner.
- Reduced-motion behaviour inspected in CSS, not emulated in browser.
- Browser logs included extension metadata errors and pre-existing WebGL errors from an initial visit to the public homepage; no claim of a globally clean console. Existing text-arrow glyphs render poorly in this cloud browser; the new navigation icons use SVG.
- Local preview adapter, fixture API, temporary rewrite/environment and responsive harness are excluded from the change. Normal dev script and Next configuration restored in the deliverable repository. The isolated QA copy is not a deployment.

## Remaining product scope — explicitly retained
Calendar/meetings/test drives, integrated email delivery and history, customer follow-up/tasks, and team responsibilities remain requested scope. No dummy navigation entries or invented performance metrics were added. These features need persistent models, ownership/role permissions, validation, timezone/reminder handling, mail provider/delivery status and failure contracts. Their launch placement has not been silently deferred or approved out of V1.

## Next milestone and boundaries
Owner review of the shared shell, followed by connected calendar/appointment workflow definition and implementation. Real-data regression, full nested-screen visual QA, Figma synchronization/approval and broader launch gates remain outstanding. No deployment or main-branch merge. Figma/Notion/Asana records were not changed in this task; this repository handoff is implementation evidence, not a replacement for their approval records.

## Delivery
The session could clone/read GitHub but could not push: Git CLI had no HTTPS credential, and the GitHub connector returned 403 Resource not accessible by integration for blob creation. No remote branch was created. The local branch is delivered as a Git bundle requiring parent commit `9d7b4283675e2eb872d85f837caa6b889b18477a`, already on the owner's pushed main. Importing the bundle does not deploy or merge it.
