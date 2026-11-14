# Admin approval gate — 18 September 2026

Owner approved the dealer onboarding design. Continuing the live administrator approval gate.

## Changes
- `car-platform-web/src/lib/auth/returnTo.ts`: preserve only known admin dashboard, dealer and vehicle review destinations through sign-in; reject path normalization/traversal.
- `car-platform-web/tests/auth-return.test.cjs`: known admin paths and invalid routes regression coverage.
- `car-platform-web/src/app/(auth)/login/page.tsx`: Continue browsing leads to public vehicles when sign-in originated from a protected route, avoiding a redirect loop.

## Evidence
- Browser reproduced `/admin/dealers` incorrectly becoming `/login?next=%2Fcars`; after correction it became `/login?next=%2Fadmin%2Fdealers`.
- Four auth routing tests, 41 backend tests, targeted ESLint and TypeScript passed.
- Existing moderator transition, stale-record, suspension and publication safeguards inspected and regression tests passed.
- No database records, roles or media changed.

## Remaining gate
Live approve/reject/reopen/suspend browser verification awaits an existing administrator session. Asked the owner to sign in directly; no password requested. The prior denial of creating a privileged temporary account remains respected. Do not treat code/test coverage as live administrative verification. No deployment, push or commit.
