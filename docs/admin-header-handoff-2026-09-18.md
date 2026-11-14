# Admin header — 18 September 2026

Scope: replace the legacy white admin navbar with the approved Carvia identity and account controls.

Files:
- car-platform-web/src/components/layout/DashboardHeader.tsx: admin-specific header with champagne logo, Overview, Dealer reviews, Inventory review, Marketplace and shared AccountMenu. Dealer/buyer branches preserved.
- car-platform-web/src/components/layout/AdminHeader.module.css: dark sticky header, current-route styling, focus outlines and responsive navigation. Selectors avoid overriding account dropdown styles.

Checks: targeted ESLint, TypeScript and diff whitespace check passed. Viewed actual authenticated admin dealer detail in Chrome on localhost:3000; dark header and account dropdown visually inspected. Opened Manage account, confirmed administrator account page, returned through Admin workspace. Overview navigation rendered correctly. Sign out uses the existing shared implementation; deliberately did not end the owner's active session. Responsive rules implemented but mobile admin session not visually checked.

No account, approval, database or asset changes. Existing approved dealer record was only viewed. No commit, push or deployment.

Next gate: owner header acceptance; full admin mobile and live moderation workflow verification remain separate.
