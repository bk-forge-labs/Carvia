# Dealer onboarding gate — 18 September 2026

Implemented the next bounded gate: dealer application and status guidance in Carvia's existing dark/champagne workspace design.

## Changes
- `car-platform-web/src/components/dealer/DealerOnboardingForm.tsx`: styled business application, trimmed required fields and submission lock.
- `car-platform-web/src/components/dealer/DealerApplicationStatus.tsx` and `DealerApplication.module.css`: responsive pending, rejected and suspended guidance, rejection feedback and manual status refresh.
- `car-platform-web/src/lib/api/dealerProfile.server.ts`: uncached authenticated profile lookup and approval route guards.
- Dealer dashboard, new-listing, onboarding and pending route pages: correct routing for missing profiles, pending approval and approved profiles.
- `car-platform-web/src/lib/auth/returnTo.ts` and `tests/auth-return.test.cjs`: safe sign-in destinations include onboarding and pending.
- `server/controllers/dealerController.js`: fixed company-name projection; owner response includes status-specific rejection reason without moderator identity or private audit history.
- `server/tests/dealer-profile.test.js`: regression coverage for projection and safe status data.

## Verification
- Targeted ESLint and TypeScript checks passed.
- Existing 40 backend tests passed, including moderation tests; new profile regression passed separately.
- Three auth return-path tests passed.
- Actual browser: isolated dealer sign-in routed to application; submitted company, phone and address persisted; pending status displayed those values; new-listing URL redirected to pending; status refresh worked.
- Live API: pending account could not create a listing (403), and profile returned correct company name, pending status and disabled posting permission.
- Visually inspected desktop application and 390px mobile pending screen; no browser error logs on inspected flow.
- Temporary dealer and profile deleted; database absence verified. No cars, media or existing account statuses changed.

## Limits and next gate
Live admin transitions were not performed. Automatic approval review rejected creation of a privileged temporary administrator as an access change without specific authorization. No workaround was used. Moderation remains covered by automated tests; rejected/suspended/approved screens still need a live administrator-driven browser pass. No comprehensive 10/10 claim, deployment, push or commit.

Owner approval gate: review dealer application/status design, then finish live admin transition verification with an authorized administrator session.
