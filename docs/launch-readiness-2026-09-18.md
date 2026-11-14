# Carvia launch-readiness audit — 18 September 2026

Verdict: substantial local engineering progress; **not cleared for public customer launch**. Owner confirmed a real marketplace, not a public demonstration. No deployment, commit, push, purchase, credential change or database mutation was performed in this audit.

## Fixed
- Authentication validates scalar email/password inputs before querying MongoDB, normalizes email, checks registration names and bcrypt input length, prevents role escalation and suppresses internal authentication errors.
- Login limited to 30 requests per 15 minutes per IP; registration 10/hour. Memory counters suit the planned single API instance, reset on restart, and require shared storage if scaled. Production trusts one proxy only, matching Caddy topology with no public API host port.
- Uploaded filenames now use supported MIME-derived extensions, not caller extensions. JPEG/PNG/WebP signatures checked; invalid batches removed. Signature checking is not a full decoder or malware scan; image re-encoding remains recommended before broader untrusted uploads.
- Helmet response headers enabled; cross-origin image embedding retained for local frontend/API separation.
- Updated vulnerable dependencies: Next.js/eslint config 16.3.5 and compatible frontend/backend transitive fixes. Added express-rate-limit. Both npm audits reported zero vulnerabilities after installation; this is time-bound advisory coverage, not a penetration test.
- Repaired full-lint errors: memo dependency/sort reset, Next links, typed API error parsing and CommonJS test-specific lint configuration.
- Replaced generic browser metadata with Carvia identity.

## Changed files in this audit
Backend: `server/app.js`, `server/controllers/authController.js`, `server/models/User.js`, `server/routes/authRoutes.js`, `server/middleware/uploadMiddleware.js`, new `server/middleware/authRateLimit.js`, new `server/utils/authInput.js`, new `server/utils/imageSignature.js`, new tests `auth-input.test.js`, `auth-rate-limit.test.js`, `image-signature.test.js`, package and lock files.
Frontend: package and lock files, `eslint.config.mjs`, `src/app/layout.tsx`, `src/components/cars/CarsFilters.tsx`, `src/components/layout/AppHeader.tsx`, `src/lib/api/browser.ts`, `src/lib/api/server.ts`, `src/middleware.ts`.
Prior approved work remains uncommitted alongside these changes.

## Evidence
- 46 backend tests passed with Node 24.19.0; 4 auth return-path tests passed.
- Whole-web lint: zero errors, four warnings (three legacy image elements and one internal location.assign).
- TypeScript passed with `--noEmit --incremental false`.
- Isolated Next.js 16.3.5 production build passed using webpack and Node 24, outside the active preview cache. Warnings remain for no-op middleware deprecation/Edge imports. Docker/Turbopack deployment build not verified.
- Temporary build served on localhost:3001. Actual browser catalogue showed 26 listings; phone viewport 390x844 inspected; filter expanded and BMW selection returned four matches. No captured browser errors. Viewport restored; temporary server stopped after checks.
- API live health 200; unauthenticated admin API 401; malformed object email rejected before credential query.
- Sample inventory marked not for sale and enquiries disabled; photo-credit page explicitly states fictional prices/specifications and links image sources/licences. Every source/licence was not independently cleared in this audit.
- Authenticated admin mobile/keyboard checks remain incomplete; native Chrome was being used for Tarek. Owner's prior desktop approval/release tests remain user-reported evidence, not a replacement for mobile verification.

## Launch blockers / remaining requirements
1. **Name conflict**: CarVia GmbH already operates in Germany's automotive sector. Official company imprint https://www.carvia.com/imprint and service site https://www.carvia.de/ show existing use. Third-party search surfaced EU trade mark 018190261, but its live official legal status was not verified. This is a preliminary conflict screen, not legal clearance. Recommend choosing another name or professional clearance before launch. DPMA advises checking registered and other earlier rights: https://www.dpma.de/english/trade_marks/trade_mark_search/ . No rebrand applied.
2. **Operator and legal/contact content**: owner says use BK Forge Labs, but exact legal operator name, public business address and complete support email were not found in this repo. No privacy/legal/contact routes found. Do not fabricate operator details or publish unfinished legal copy. Launch markets and operating model need confirmation for appropriate legal review.
3. **Customer account recovery**: no forgot-password/email-verification workflow found. Confirm production mail provider and implement supported recovery before real customer onboarding.
4. **Sale inventory**: replace or segregate fictional sample offers for a real customer launch; independently validate actual vehicle identity, seller authority, prices and image rights. Existing user-created listings were not altered.
5. **Mobile/accessibility**: finish authenticated admin phone/keyboard review, confirmation/cancel, and cross-device buyer/dealer regression after security/dependency changes.
6. **Operations**: choose host/domain, use supported Node runtime (system default is still 20.15), verify production Docker build, HTTPS/cookies, durable images, monitoring, off-host database plus photo backups and an isolated restore drill. No infrastructure provisioned. Development processes should be restarted with the updated dependencies and supported Node before the next full lifecycle rehearsal.
7. **Security follow-through**: verify logout/session revocation expectations, same-site request protection for chosen domains, full upload decoding and abuse controls under actual deployment. This audit is not a comprehensive penetration test.
8. **Release hygiene**: final regression, scoped commit review, then explicit deployment decision. Keep Tarek/Feldtmann separate.

Next owner decision: resolve naming direction and confirm the exact BK Forge Labs legal operator/contact details. Engineering can continue under the internal working name without asserting public brand clearance.
