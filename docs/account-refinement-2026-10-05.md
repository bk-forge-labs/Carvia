# Account refinement — 5 October 2026

Preview: http://localhost:3000/account. Owner requested account as the next page.

Changed files:
- car-platform-web/src/app/(public)/account/page.tsx: private-page metadata and title.
- car-platform-web/src/components/auth/AccountSettings.tsx: identity summary, role links, direct sign-out using existing logout/cache cleanup, help links and connection-error state distinct from signed-out state.
- car-platform-web/src/components/auth/AccountSecurity.tsx: expandable password form, show/hide control, separate initial-loading/retry states, duplicate-request lock, password byte-limit check and query-cache cleanup after password change.
- car-platform-web/src/components/auth/AccountSettings.module.css: responsive profile summary, layout and controls.

Checks: TypeScript and targeted ESLint passed; git diff --check passed. Existing signed-in dealer Chrome session inspected; Leen Kattan account shown. Security endpoint reports email unverified and delivery unavailable. Password disclosure and show/hide toggled without entering credentials. Mobile 390px security panel and desktop composition inspected; viewport reset. Signed-out state seen in separate in-app browser. No actual profile/password/sign-out mutation performed; buyer/admin authenticated variants not exercised. Existing backend reused, no database/assets changes or deployment. Screenshot /tmp/veltrenne-account-desktop.jpg.

Next gate: owner account-page approval. Email delivery remains incomplete. Public support address remains unconfirmed: owner's 'Leen Group' answer identifies their dealer account, not an email address; no personal account email was repurposed for public support.
