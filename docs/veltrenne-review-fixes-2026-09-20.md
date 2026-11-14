# Veltrenne review fixes — implementation handoff

20 September 2026. Existing checkout: `/Users/basheerkattan/car-platform`. Current preview: http://localhost:3000. API: http://localhost:5050. Review reference: the 19 September website/frontend/backend review.

## Result and boundaries

Applied the actionable code and design corrections below. This is **not a public-launch or comprehensive 10/10 approval**. Existing dirty work was preserved; nothing was committed, pushed or deployed. Existing marketplace user, dealer and vehicle records were not edited, approved, deleted or reclassified. No email was sent to a real recipient. The API has account-token/index schema additions; startup initializes the token collection/indexes. Transactional writes were tested in a separate temporary loopback-only MongoDB replica set that was stopped after testing.

## Review finding resolution

| Finding | Result |
| --- | --- |
| 1 Publication race | Query updates compare the exact `__v` read during publication validation; a lost race returns 409. Real MongoDB concurrent edit/publish regression passes. |
| 2 Approved identity changes | Changed approved company/contact/address details return the dealer to pending review and withdraw published stock in one transaction; records an identity-change event. Unchanged details do not remove approval. Publication remains a separate explicit action after approval. |
| 3 Recovery and verification | Added hashed single-use reset/verification tokens, expiry, SMTP integration, rate limits, password reset/change UI, and session-version invalidation. New passwords require 12 characters and respect bcrypt's 72-byte limit. **Email transport is not configured or externally verified.** |
| 4 Sample inventory | Homepage sample badges, accurate listing-count wording, and production API/favourites exclusion of `isDemo:true`; same database retained. **The one unmarked listing and legacy business contact data still require an owner review before launch.** |
| 5 Moderation disclosure | Dealer read/update responses share an explicit public-to-owner serializer and omit internal review history and reviewer IDs. |
| 6 Vehicle fields | Fuel, transmission and location supported in create/edit form, request types, validation, update allowlist and review fingerprint. Existing catalogue values checked for compatibility. Persistence tested in isolated MongoDB. |
| 7 File cleanup | Future listing/photo deletion removes unreferenced owned upload files, preserves shared references, validates paths and tolerates already-missing files. Existing orphan files were not purged. |
| 8 Favourite toggle | Homepage uses explicit PUT/DELETE intent, matching other saved-vehicle controls. |
| 9 Hanging auth | Shared browser/server requests have bounded deadlines. Hydration distinguishes 401 from connection failure, shows retry feedback and avoids private-route redirect during a failed session check. |
| 10 Health | `/api/live` is liveness; `/api/health` requires a bounded database ping and returns 503 when unavailable. Current live readiness returns 200. A real outage of the marketplace database was not induced. |
| 11 Image validation | Sharp fully decodes/re-encodes uploads, strips metadata, rejects malformed/mismatched/animated/oversized images and stages files privately before public placement. Truncated signatures are rejected in tests. |
| 12 Design/brand consistency | Registration shares the premium auth styles; visible old brand text corrected across touched flows. Internal historical component/asset identifiers preserved. |
| 13 Unfinished routes | `/services`, `/bookings`, `/test` return not-found; unsupported motorcycle/leasing modes say Coming soon before selection. These products were not built as part of this correction. |
| 14 Metadata | Vehicle titles/descriptions/share data and canonical URLs, robots policy, and sample-excluding dynamic sitemap. Public indexing requires `NEXT_PUBLIC_SITE_URL`; no invented domain. Docker passes the configured public origin. |
| 15 Admin prioritisation | Live pending-dealer/held-listing counts, direct pending filter link, company search, useful empty state, legacy-approval provenance warning and suppression of links to failed photographs. |

Additional corrections: homepage makes come from the API; homepage cards show company names; owned vehicle detail fetches one record instead of the entire inventory; catalogue/dealer query indexes declared; directly affected API errors no longer expose raw server details.

## Verification performed

- Backend normal suite: **52 passed, 0 failed**. The database-dependent test is skipped in this default run unless an explicit isolated test URI is supplied.
- Isolated real MongoDB integration: **1 passed, 0 failed**, covering conflicting publication, transactional dealer identity re-review and stock withdrawal, technical field persistence, token hashing, wrong-purpose/expired/reused-token rejection, concurrent reset (exactly one succeeds), verification, password change, invalidation of old sessions and reference-aware photo cleanup.
- Frontend routing suite: **4 passed**.
- TypeScript: passes.
- ESLint: **0 errors; 3 existing image-element warnings**. The internal navigation warning was fixed.
- Isolated webpack production build: passes. Existing middleware convention/Edge import warnings remain. Default Turbopack/Docker deployment build and actual hosting were not certified.
- `git diff --check`: clean.
- Read-only live API: readiness 200; catalogue still has 26 records; company label returns Leen Group; 12 makes returned.
- Browser: desktop and 390px mobile registration; recovery missing-provider error; homepage sample badges, dynamic makes and dealership labels; admin live counts (0 pending, 4 holds), pending-filter navigation, Leen company search, account security display. Browser console for homepage/registration had no errors. No real password or moderation action was submitted.
- Viewport override restored. Preview is the existing port 3000 server; attempted extra servers were stopped rather than replacing the owner's running preview.

## Email and public setup still needed

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM`, and `PUBLIC_WEB_URL` through environment secrets. Templates are included; no credentials were inserted. `PUBLIC_WEB_URL` must use HTTPS in production. SMTP uses TLS; tokens are emailed in a fragment so routine URL request logs do not contain them. No raw token is returned by the API or written to logs.

Production always requires verified email before a buyer sends an enquiry. Development keeps the existing local enquiry flow available; `REQUIRE_VERIFIED_EMAIL=true` enables the same gate locally once mail is configured. This distinction is explicit and must be included in launch rehearsal. SMTP failure/availability does not pretend that delivery has been proven.

The owner was asked for provider and verified sender address; no reply was available at handoff. Real delivery, expiry-link UX from an inbox and provider deliverability remain unverified. Do not deploy before these are checked.

Also still needed before public launch: reconcile legacy approvals and actual business details; verify real vehicle identity/photos and public availability; fill authentic operator/contact/legal information; confirm name/asset rights; configure the domain; verify production storage, restore/backups, HTTPS and deployment. No historical approval evidence or legal identity was fabricated.

No fresh signed-in buyer/dealer browser write flow was performed. Backend persistence/security evidence is isolated-database evidence, not an assertion that every production workflow has been exercised.

## Changed files

Core implementation and configuration files for this pass are listed below. Additional visible-copy corrections were made in the existing car error/loading/empty states, dealer workspace/publish copy, buyer copy, homepage explanatory sections, recent vehicles and enquiry UI; filenames and legacy storage keys were retained. The repository already contained unrelated pending changes before this pass; the whole current git diff must not be attributed to this task.

- [car-platform-web/Dockerfile](</Users/basheerkattan/car-platform/car-platform-web/Dockerfile>)
- [car-platform-web/src/app/(auth)/forgot-password/page.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/app/(auth)/forgot-password/page.tsx>)
- [car-platform-web/src/app/(auth)/login/page.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/app/(auth)/login/page.tsx>)
- [car-platform-web/src/app/(auth)/register/page.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/app/(auth)/register/page.tsx>)
- [car-platform-web/src/app/(auth)/reset-password/page.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/app/(auth)/reset-password/page.tsx>)
- [car-platform-web/src/app/(auth)/verify-email/page.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/app/(auth)/verify-email/page.tsx>)
- [car-platform-web/src/app/(dashboard)/admin/dealers/page.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/app/(dashboard)/admin/dealers/page.tsx>)
- [car-platform-web/src/app/(dashboard)/admin/page.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/app/(dashboard)/admin/page.tsx>)
- [car-platform-web/src/app/(public)/cars/[id]/page.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/app/(public)/cars/[id]/page.tsx>)
- [car-platform-web/src/app/(public)/cars/page.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/app/(public)/cars/page.tsx>)
- [car-platform-web/src/app/robots.ts](</Users/basheerkattan/car-platform/car-platform-web/src/app/robots.ts>)
- [car-platform-web/src/app/sitemap.ts](</Users/basheerkattan/car-platform/car-platform-web/src/app/sitemap.ts>)
- [car-platform-web/src/components/admin/AdminOverview.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/admin/AdminOverview.tsx>)
- [car-platform-web/src/components/admin/DealerDirectory.module.css](</Users/basheerkattan/car-platform/car-platform-web/src/components/admin/DealerDirectory.module.css>)
- [car-platform-web/src/components/admin/DealerDirectory.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/admin/DealerDirectory.tsx>)
- [car-platform-web/src/components/admin/InventoryReview.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/admin/InventoryReview.tsx>)
- [car-platform-web/src/components/auth/AccountSecurity.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/auth/AccountSecurity.tsx>)
- [car-platform-web/src/components/auth/AccountSettings.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/auth/AccountSettings.tsx>)
- [car-platform-web/src/components/auth/AuthHydrator.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/auth/AuthHydrator.tsx>)
- [car-platform-web/src/components/auth/RecoveryForm.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/auth/RecoveryForm.tsx>)
- [car-platform-web/src/components/auth/RequireAuth.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/auth/RequireAuth.tsx>)
- [car-platform-web/src/components/cars/Collection.module.css](</Users/basheerkattan/car-platform/car-platform-web/src/components/cars/Collection.module.css>)
- [car-platform-web/src/components/cars/VehiclePhoto.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/cars/VehiclePhoto.tsx>)
- [car-platform-web/src/components/dealer/DealerVehicleForm.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/dealer/DealerVehicleForm.tsx>)
- [car-platform-web/src/components/home/DiscoveryExperience.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/home/DiscoveryExperience.tsx>)
- [car-platform-web/src/components/home/LatestArrivals.module.css](</Users/basheerkattan/car-platform/car-platform-web/src/components/home/LatestArrivals.module.css>)
- [car-platform-web/src/components/home/LatestArrivals.tsx](</Users/basheerkattan/car-platform/car-platform-web/src/components/home/LatestArrivals.tsx>)
- [car-platform-web/src/lib/api/browser.ts](</Users/basheerkattan/car-platform/car-platform-web/src/lib/api/browser.ts>)
- [car-platform-web/src/lib/api/dealerCars.browser.ts](</Users/basheerkattan/car-platform/car-platform-web/src/lib/api/dealerCars.browser.ts>)
- [car-platform-web/src/lib/api/dealerCars.server.ts](</Users/basheerkattan/car-platform/car-platform-web/src/lib/api/dealerCars.server.ts>)
- [car-platform-web/src/lib/api/server.ts](</Users/basheerkattan/car-platform/car-platform-web/src/lib/api/server.ts>)
- [car-platform-web/src/lib/store/auth.ts](</Users/basheerkattan/car-platform/car-platform-web/src/lib/store/auth.ts>)
- [car-platform-web/src/types/car.ts](</Users/basheerkattan/car-platform/car-platform-web/src/types/car.ts>)
- [deploy/.env.example](</Users/basheerkattan/car-platform/deploy/.env.example>)
- [deploy/compose.yaml](</Users/basheerkattan/car-platform/deploy/compose.yaml>)
- [server/.env.example](</Users/basheerkattan/car-platform/server/.env.example>)
- [server/app.js](</Users/basheerkattan/car-platform/server/app.js>)
- [server/controllers/accountSecurityController.js](</Users/basheerkattan/car-platform/server/controllers/accountSecurityController.js>)
- [server/controllers/adminController.js](</Users/basheerkattan/car-platform/server/controllers/adminController.js>)
- [server/controllers/authController.js](</Users/basheerkattan/car-platform/server/controllers/authController.js>)
- [server/controllers/carController.js](</Users/basheerkattan/car-platform/server/controllers/carController.js>)
- [server/controllers/enquiryController.js](</Users/basheerkattan/car-platform/server/controllers/enquiryController.js>)
- [server/controllers/favoriteController.js](</Users/basheerkattan/car-platform/server/controllers/favoriteController.js>)
- [server/middleware/authMiddleware.js](</Users/basheerkattan/car-platform/server/middleware/authMiddleware.js>)
- [server/middleware/errorMiddleware.js](</Users/basheerkattan/car-platform/server/middleware/errorMiddleware.js>)
- [server/middleware/ownerShipMiddleware.js](</Users/basheerkattan/car-platform/server/middleware/ownerShipMiddleware.js>)
- [server/models/AccountToken.js](</Users/basheerkattan/car-platform/server/models/AccountToken.js>)
- [server/models/Car.js](</Users/basheerkattan/car-platform/server/models/Car.js>)
- [server/models/User.js](</Users/basheerkattan/car-platform/server/models/User.js>)
- [server/package-lock.json](</Users/basheerkattan/car-platform/server/package-lock.json>)
- [server/package.json](</Users/basheerkattan/car-platform/server/package.json>)
- [server/routes/authRoutes.js](</Users/basheerkattan/car-platform/server/routes/authRoutes.js>)
- [server/routes/carDealerRoutes.js](</Users/basheerkattan/car-platform/server/routes/carDealerRoutes.js>)
- [server/services/accountMail.js](</Users/basheerkattan/car-platform/server/services/accountMail.js>)
- [server/services/accountSecurity.js](</Users/basheerkattan/car-platform/server/services/accountSecurity.js>)
- [server/tests/auth-input.test.js](</Users/basheerkattan/car-platform/server/tests/auth-input.test.js>)
- [server/tests/review-fixes.integration.test.js](</Users/basheerkattan/car-platform/server/tests/review-fixes.integration.test.js>)
- [server/tests/review-fixes.test.js](</Users/basheerkattan/car-platform/server/tests/review-fixes.test.js>)
- [server/utils/authInput.js](</Users/basheerkattan/car-platform/server/utils/authInput.js>)
- [server/utils/publicInventory.js](</Users/basheerkattan/car-platform/server/utils/publicInventory.js>)
- [server/utils/publicationQuality.js](</Users/basheerkattan/car-platform/server/utils/publicationQuality.js>)
- [server/utils/removeUnusedUploads.js](</Users/basheerkattan/car-platform/server/utils/removeUnusedUploads.js>)
- [server/utils/validateImage.js](</Users/basheerkattan/car-platform/server/utils/validateImage.js>)
- [server/validations/car.validations.js](</Users/basheerkattan/car-platform/server/validations/car.validations.js>)

## Next acceptance gate

Owner review of the updated local registration, account-security and admin screens. Configure mail and verify real delivery before declaring account recovery operational. Resolve the real-data/business launch checklist before deployment. No additional approval is needed merely to inspect these local changes.
