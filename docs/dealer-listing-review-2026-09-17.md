# Dealer listing journey review — 17 September 2026

Verdict: ready for owner approval for the tested local listing lifecycle.

## Finding fixed
A signed-out dealer lost the intended listing destination when redirected to sign-in. The return-path allowlist also rejected dealer inventory/new/detail/edit/photo routes. RequireAuth now preserves a safe destination for signed-out users. The allowlist accepts only known dealer routes with valid 24-character vehicle IDs; external and unknown destinations remain rejected. Wrong-role users still take the existing role fallback.

## Changed files
- car-platform-web/src/components/auth/RequireAuth.tsx
- car-platform-web/src/lib/auth/returnTo.ts
- car-platform-web/tests/auth-return.test.cjs (new)
- This report (new)

## Actual checks
- Created disposable approved dealer/profile, then used browser form to create a vehicle. Blank submission showed required-field errors. Completed form saved a private draft and continued to photographs.
- Public API returned 404 for draft.
- Browser photo upload succeeded; gallery showed one photo selected as cover and saved confirmation. File-chooser automation took approximately six minutes; this was not measured as application upload latency.
- Review showed publication readiness; publish confirmation stayed disabled until acknowledgement.
- Browser publication succeeded; public API independently returned 200.
- Browser changed asking price from 38,900 to 37,900 euros and saved it.
- Browser unpublish succeeded; public API returned 404 again. Independent database connection confirmed private state, edited price and photo retention.
- Inspected review controls at 390px mobile width; form and publication workflow exercised at desktop width.
- Second temporary dealer was blocked from readiness access, editing, publishing and deleting the fixture (403/404); original fixture price/private state remained intact.
- Owner deletion endpoint returned 200 and database absence was verified.
- Browser regression: signed-out /dealer/cars/new redirected to /login?next=%2Fdealer%2Fcars%2Fnew, and signing in returned to the new-listing form.
- Three return-path regression tests passed, including external/unknown URL rejection and existing buyer/anchor support. Focused ESLint, TypeScript and diff whitespace checks passed.

## Cleanup and limits
All temporary accounts/profile/listing and the newly uploaded photo copy were removed and absence checked. Original photo and customer records unchanged. No deployment, push or commit.
This gate did not repeat multi-photo reordering, maximum-upload/error matrix, pending-dealer onboarding, production performance or a complete assistive-technology audit. Public images use the existing public uploads storage; draft privacy here means the listing/catalogue API routes, not confidentiality of a known image URL. The API deletion check did not exercise the browser's irreversible-delete confirmation.

Preview: http://localhost:3001/dealer/cars . Next gate is owner approval of the dealer listing lifecycle and sign-in return correction.
