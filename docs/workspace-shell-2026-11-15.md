# Persistent dealer/admin workspace — 15 November 2026

Status: **Ready for owner review; not release approval.**

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
