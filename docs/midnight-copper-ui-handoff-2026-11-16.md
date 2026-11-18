# Midnight & Copper UI — Phase 1 handoff

Updated 18 November 2026. **UI implemented and available for BK review; exhaustive acceptance remains open.**

## Authority and sequence

BK's consolidated brief and subsequently supplied Midnight & Copper homepage image supersede the missing-reference blocker recorded on 16 November. Read the full [decision record](https://app.notion.com/p/41a750c67d4581c49a49eb76d65472e6?pvs=204) alongside the updated brief. The image supplies palette, hierarchy and card direction; the existing showroom supplies the scene and assets. Do not replace the showroom with the mockup photograph or its illustrative vehicles, prices or text wordmark.

Locked gates: Phase 1 UI/type → functional/visual QA → BK approval; Phase 2 existing agreed feature completion → BK approval; Phase 3 motion → separate performance/accessibility QA. No push, merge, deployment, production configuration or real messages authorized here.

## Checkout and protected work

- Branch: `feat/veltrenne-connected-workspace`; starting HEAD `39324f06e534aece6d937891446f693303749d99`.
- Existing untracked `docs/veltrenne-build-report-for-dave-2026-11-16.md` preserved and excluded from this change.
- Read global supplied AGENTS, studio playbook, frontend AGENTS and local Next.js CSS guidance. Existing route/role responsibilities retained.
- Owner preview: http://localhost:3003 (API 5050, existing owner data). No owner-data mutation used for this task.
- Isolated QA: http://127.0.0.1:3021 (proxy 5082, API 5081, loopback MongoDB 27029, synthetic fixtures). Source copied into the existing temporary QA checkout. This is not production or customer validation.
- Gold logo SVGs, showroom scene implementations, Porsche assets, category sheet and supplied vehicle photography remain unchanged. SHA-256 baseline/check of all `public/logo/veltrenne/*` and `public/brand/discovery/*` files passed. Scene components have no source diff.

## Implemented treatment

Shared tokens are in `src/app/globals.css`. Navy navigation, hero framing, footer and dealer feature area; porcelain inventory, decision/comparison, information and workspace reading areas; copper actions. Existing non-homepage grids, sidebar structure, permissions, API contracts, ownership and routes remain intact. CSS modules consume tokens directly so styles do not depend on cross-route import ordering.

Typography reuses Helvetica Neue / Arial / sans-serif from the system; no font files, network font requests or redistribution added. Display/heading/body/label/metadata tokens, stronger headings, tabular numbers, supporting labels raised to at least 12px in migrated modules. No logo typography edit.

Homepage keeps the existing emblem/Porsche switching, rotation/pause code, reduced-motion rules and image sources. Only static framing, spacing, hierarchy, search and reading surfaces changed. Primary search no longer offers the inactive motorcycle or lease modes; existing roadmap handling remains in code. Cars still switches to the Porsche scene. Help me choose links to the existing guided disclosure on `/cars#help-me-choose`. No discovery backend feature was added.

Inventory cards have tighter spacing, stronger names/prices, aligned prices and bottom actions without excess title spacing, readable facts and persistent sample disclosures. Inquiry restrictions remain unchanged. Existing save/compare controls are retained.

## Contrast decisions

Calculated sRGB contrast ratios (not a substitute for pixel inspection of composited states):

| Pair | Ratio |
| --- | ---: |
| Navy `#101C2D` on porcelain `#F3F0E9` | 15.05:1 |
| Muted `#556170` on porcelain | 5.54:1 |
| White on anchor copper `#B96543` | 4.20:1 — insufficient for normal text |
| White on functional action `#A34E2E` | 5.70:1 |
| Link copper `#99482C` on porcelain | 5.56:1 |
| Light copper `#E2A384` on navy | 8.00:1 |
| Muted dark-surface text `#BEC7D2` on `#18283D` | 8.72:1 |
| Control border `#7E858C` on raised surface `#FFFDF8` | 3.68:1 |
| Error `#AB3038` on porcelain | 5.75:1 |
| Success `#236341` on porcelain | 6.29:1 |
| Warning `#80580C` on porcelain | 5.56:1 |

Hover/active copper shades, light/dark focus, selected and disabled roles are explicit tokens. Status colours remain distinct. Photo and logo colours are not recoloured.

## Verification evidence and open gate

- TypeScript `tsc --noEmit`: passed with Node 24.19.0.
- Frontend `node --test tests/*.test.cjs`: 9/9 passed.
- ESLint `src`: 0 errors; three existing `no-img-element` warnings in unused legacy FavoriteCarCard and CarImageSlider.
- Backend suite: 68/68 passed using guarded isolated `veltrenne_review_test`, `veltrenne_workspace_test`, `veltrenne_buyer_test` databases on loopback 27029. Covers role boundaries, private evidence, inquiry/appointment lifecycle, concurrency, stale versions, task persistence, cancellation/outcomes and local SMTP acceptance/failure/deduplication.
- `next build --webpack`: passed in the isolated build checkout. An initial invocation omitted the required API-base environment variable; rerun with `NEXT_PUBLIC_API_BASE_URL` and `API_INTERNAL_BASE_URL` succeeded. Existing middleware deprecation/Next edge-runtime warnings remain. **No Turbopack pass claimed.**
- PostCSS parsed all 33 stylesheets; all referenced semantic tokens are defined (38 definitions).
- `git diff --check`: passed at the recorded check.
- Baseline native Chrome screenshots observed before editing: owner desktop homepage and isolated 1440/768/390 CSS-pixel homepage frames, showing original green/gold treatment and inactive choices.
- Native Chrome recovered after BK foregrounded the review window. Actual after-edit pixels inspected across the families below, using isolated responsive frames at 390, 768, 1024, 1440 and intermediate 900 CSS pixels. These are CSS viewport checks in Chrome, not physical-device testing.
- Browser findings corrected and re-inspected: dealer conversation spanned only the first grid column; it now spans the enquiry card. Excess card title space removed; price/action alignment retained. Disabled model controls use explicit disabled tokens rather than whole-control opacity.
- Final Webpack production build passed after these CSS corrections; PostCSS token check and protected-asset hashes passed again.
- Screenshots are in this task conversation; no standalone image artifacts saved. QA vehicle images/data are synthetic and are not production inventory.
- The Next development issue overlay identifies Grammarly-injected body attributes (`data-new-gr-c-s-check-loaded`, `data-gr-ext-installed`) causing a hydration mismatch. No extension/security settings were disabled and no suppression was added.

The existing Docker-backed QA database was reused. No Docker lifecycle command, volume deletion, schema migration or asset replacement occurred. Backend tests write only named isolated test databases; they do not target Atlas. Temporary QA/build copies and logs can expire. Test email remains local only. `rsync -a car-platform-web/src/ /private/tmp/veltrenne-connected-qa/web/src/` refreshes only the isolated UI source; it does not reset the persistent QA database. Build uses the existing isolated build checkout with its API environment variables and `next build --webpack`.

### Observed browser coverage

D/T/P below means 1440/768/390 unless widths are explicitly stated. This records observed coverage, not every permutation or a completed feature audit.

| Family | Actual after-edit evidence |
| --- | --- |
| Homepage | D/T/P emblem and Cars/Porsche scenes, search, recently viewed, arrivals/card prices, journey and dealer section. 1024/900 hero/search. Existing pause toggled to Play; advanced search drawer opened and Escape closed at 1024. |
| Catalogue | D/T/P and 1024/900 filters/cards; mobile collapsed filters; phone Help me choose expanded and budget submitted, producing zero matching listings and Clear filters. |
| Vehicle detail | D/T/P gallery, title, price, seller actions and at-a-glance panel; long dealer name wraps. |
| Buyer | D/T/P overview, favorites/private-note cards, enquiries with dealer answer and confirmed appointment; unavailable vehicle state. Desktop three-car comparison; phone two-car switch updates reference comparison. Phone appointment status dialog opens. |
| Dealer | D/T/P overview/action counts; inventory at 1440/1024/390; new listing form; listing review; image manager at 1024/768/390; edit form including price/history fields D/T/P. Enquiry conversation full-width fix inspected desktop/tablet and phone layout retained. |
| Onboarding | D/T/P onboarding form and rejected/needs-attention feedback with long name. |
| Admin | Overview 1440/1024/390; directory, dealer detail and empty publication-hold inventory D/T/P; vehicle moderation detail 1024/768/390. Legacy `/dealers` redirects to `/dealer`; admin use of that dealer-only route showed empty workspace, not a validated admin destination. |
| Account/auth | Account 1024/768/390; login D/T/P; registration and forgot-password 1024/768/390; reset and verify D/T/P initial forms. Phone workspace navigation opened; Tab focus visibly outlines Overview. |
| Connected workspace | Calendar D/T/P month, desktop week and phone day; phone appointment editor. Tasks D/T/P ready, deliberate error, empty and loading; phone task editor. Email 1024/768/390 and D/T/P, long subjects/IDs and phone message disclosure. Bookings empty state 1440/1024/390. |
| Information | Contact, privacy, legal and photo credits D/T/P; terms 1024/768/390. Existing draft legal notices remain visible. `/services` intentionally calls `notFound()` and shows the existing default 404. |

### Remaining acceptance evidence / findings

- **Owner-data runtime blocked:** read-only `http://127.0.0.1:5050/api/health` returned HTTP 503 with `{"ok":false,"service":"api"}` on 18 November. Earlier owner homepage showed account/inventory connection errors. No production configuration or security change made. This prevents owner-data workflow sign-off; isolated QA is separate.
- **Unverified:** every route/state at every width, full gallery/lightbox/evidence interactions, all onboarding/moderation statuses, auth saving/success and invalid-token flows, full mobile menu/dialog focus restoration, Back/Forward scroll restoration, exhaustive mutation/stale-version UI, OS reduced-motion render, measured layout shift/performance and physical-device behavior. Existing code/reduced-motion rules are preserved; no comprehensive pass claimed for these items.
- Existing task error state shows two query error panels when the proxy rejects both requests. Existing additional-charges field shares condition-description placeholder wording. Track these in the Phase 2 audit rather than interpreting the palette migration as feature completion.
- Legal/operator information is still explicitly draft. Services remain unavailable; no fake service control added.
- Core contract regression evidence remains 68 backend tests plus 9 frontend tests, while the browser checks above primarily verify treatment and existing navigation/read states. This is not a complete fresh end-to-end mutation journey or customer validation.

## Later phases remain tracked

- Calendar/email/tasks/dashboard exhaustive native coverage remains unfinished; do not relabel it completed based on this palette change.
- Public vehicle-document intake/approval/visibility workflow remains recorded as unfinished in the buyer checklist; no implementation added in Phase 1.
- Phase 2 must verify the existing approved discovery/comparison/private-notes/evidence/charges/conversation/eligibility/appointment/onboarding/publication/admin scope against the buyer checklist. New evidence-request/companion/shared-shortlist/alerts/cost-comparison ideas still require scope agreement.
- Phase 3 only after approvals: prototype immediate vehicle focus, optional brief emblem moment, controlled rotation settling three-quarter, optional user rotation, immediate search/category response and purposeful action feedback. No exact choreography approved or implemented here.
- Real-user validation, production mail and launch readiness are not established by this work.

## Changed-file manifest

All paths below are under `car-platform-web/src` unless prefixed with `docs/`.

- `app/(public)/cars/error.tsx` — Apply semantic colours to page framing or loading/error feedback.
- `app/(public)/cars/results.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `app/(public)/page.tsx` — Apply semantic colours to page framing or loading/error feedback.
- `app/(public)/services/loading.tsx` — Apply semantic colours to page framing or loading/error feedback.
- `app/globals.css` — Define shared colour/type/state tokens, system font and numeric defaults.
- `components/admin/DealerDirectory.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/auth/AccountMenu.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/auth/AccountSettings.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/auth/AuthHydrator.tsx` — Apply semantic colours to page framing or loading/error feedback.
- `components/cars/CarCard.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/cars/CarCard.tsx` — Move sample disclosure presentation into the card stylesheet.
- `components/cars/Collection.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/cars/DecisionSpace.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/cars/GuidedDiscovery.tsx` — Add stable fragment target for existing Help me choose disclosure.
- `components/cars/VehicleDetail.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/cars/VehicleFilters.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/dealer/DealerApplication.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/dealer/DealerCarCreateForm.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/dealer/DealerCarImagesManager.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/dealer/DealerCommandCenter.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/dealer/DealerListingReview.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/dealer/DealerWorkspace.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/enquiries/EnquiryCount.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/enquiries/EnquiryInbox.module.css` — Apply semantic treatment and fix the connected conversation occupying only the first dealer enquiry grid column.
- `components/home/DealerInvitation.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/home/DiscoveryExperience.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/home/DiscoveryExperience.tsx` — Remove inactive primary search choices and link the existing guided-discovery section.
- `components/home/HomeClosing.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/home/HowCarviaWorks.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/home/LatestArrivals.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/information/Information.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/layout/AdminHeader.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/layout/PublicHeader.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/layout/WorkspacePages.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/layout/WorkspaceShell.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `components/workspace/Operations.module.css` — Migrate this screen/component to semantic palette, readable type and state treatment; retain existing layout responsibilities.
- `docs/midnight-copper-ui-handoff-2026-11-16.md` — Replace superseded preflight blocker with current implementation, evidence, manifest and remaining gates.

## Documentation sync

Asana UI tasks 1/4, 2/4, 3/4 and 4/4 track implementation and evidence. Browser recovery supersedes the earlier capture blocker. Keep acceptance open for the remaining matrix and BK review; no comments/messages sent.

## Delivery status

Local UI implementation is technically checked and visually inspected to the explicit coverage above. **Available for BK design review; not a complete Phase 1 acceptance or launch-readiness claim.** The commit containing this handoff records the validated UI checkpoint. No push, merge or deployment. Remaining acceptance evidence and BK approval are required; Phase 2 and Phase 3 must not start automatically.
