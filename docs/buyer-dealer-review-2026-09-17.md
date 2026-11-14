# Buyer-to-dealer journey review — 17 September 2026

Verdict: ready for owner approval for the locally tested journey. This is not a full-site or production-readiness verdict.

## Finding and correction
Major usability defect: after a filtered BMW/ascending-price search, choosing Clear filters or Explore all cars restored the full catalogue but left Make and Sort showing their old selections. Corrected the filter form in `car-platform-web/src/app/(public)/cars/page.tsx` by keying it to the current query. Browser retest confirmed All makes and Newest arrivals after clearing.

## Verified browser journey
- Desktop 1280px: make filtering, ascending price order (four BMW results at 38,900 / 46,900 / 52,900 / 72,900 euros), maximum-price empty results, recovery and corrected filter reset.
- Guest Save action leads to sign-in and returns to catalogue.
- Disposable buyer saved a vehicle; saved state survived reload and appeared in the collection. Detail route preserved collection return link.
- Three-photo gallery: next photo, enlarge, Escape close.
- Buyer submitted an enquiry through the real form; confirmation linked to the buyer inbox and the original message appeared there.
- Separate disposable dealer signed in: new-enquiry badge 1 appeared in header and dashboard shortcut; inbox showed buyer name and email.
- Dealer selected Contacted: badge disappeared; enquiry stayed in inbox. Closed survived reload.
- Buyer signed back in and saw Closed for the same message.
- Buyer removed saved vehicle: empty collection and focus restoration to collection heading confirmed.
- Mobile 390x844: dealer inbox, buyer inbox, catalogue cards and collapsed filters inspected. Body-style SUV search yielded 12 matches. Pagination moved from page 1 to page 2.
- No browser console errors captured during this review.

## API and persistence evidence
- Backend suite: 40 tests passed.
- Live verification script passed: authenticated HTTP flow, role restrictions, cross-account isolation, concurrent duplicate prevention, stale update conflict, new-count transitions, and persistence after database reconnect. Script fixtures removed and absence checked.
- Browser fixture persistence checked directly: exactly one enquiry, status Closed, empty buyer favourites after removal.
- Frontend focused ESLint, TypeScript noEmit, and git diff whitespace checks passed.

## Data and file changes
- Modified: `car-platform-web/src/app/(public)/cars/page.tsx`.
- Added: this report.
- Created temporary buyer, dealer, approved dealer profile and clearly labelled verification listing using existing uploaded image references. All associated enquiry/account/profile/listing records removed and absence verified. No assets added/deleted, no existing customer records changed.
- Previous uncommitted work preserved. No commit, push or deployment. The pre-existing generated next-env.d.ts development path change was not part of the functional correction.

## Limits
- Local development evidence only, localhost:3001 and API localhost:5050.
- No actual email sent; contact links open the user's email client. Automated email delivery and in-app replies remain outside this journey's current implementation.
- No production/load testing, measured performance audit, full assistive-technology audit, password recovery or exhaustive device/browser matrix in this review.
- Existing sample vehicle facts are demonstration data, not verified sale inventory. This review did not validate all catalogue facts or image provenance.

Next approval gate: owner checks the corrected search behaviour and reviewed buyer/dealer journey. Then choose the next bounded completion area.
