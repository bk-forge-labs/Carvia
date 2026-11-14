# Carvia enquiries — local implementation handoff

Implemented buyer submission, confirmation, private paginated inboxes, dealer contact link and new/contacted/closed status management. One saved enquiry per buyer and vehicle. Only the assigned dealer can change status; stale status changes return 409. Sample inventory remains unavailable for enquiries.

## Verification
- 38 backend tests passed.
- Focused ESLint on enquiry form/inbox and navigation passed.
- Production build and TypeScript passed. Existing middleware deprecation remains.
- Live authenticated HTTP checks: validation, anonymous rejection, buyer/dealer roles, cross-account isolation, sender/recipient spoof prevention, concurrent duplicate prevention, sample/unavailable listing rejection, dealer status, stale conflicts, persistence after database reconnect.
- Browser: disposable buyer signed in and returned to inbox, submitted on a published vehicle, saw confirmation and saved enquiry; existing dealer viewed it and saved Contacted; buyer reload showed Contacted.
- Buyer inbox visually inspected at 1280px and 390px; dealer inbox inspected in desktop Chrome. Full screen-reader, dealer mobile, pagination with more than 20 records, and sustained performance remain unassessed.
- Development hydration mismatch from stale output prompted cache-preserving restart on port 3000.

## Data and boundaries
New enquiries collection and unique buyer/car index in the existing database. All disposable test users and enquiries were removed and absence verified. Existing vehicles/accounts unchanged. No asset changes, external email delivery, deployment, or push. Dealer Email buyer opens an email draft; contact status does not send a message. Appointment scheduling and in-app replies are outside this step.

Preview: http://localhost:3000/dealer/enquiries and http://localhost:3000/buyer/enquiries.
Status: ready for owner inspection of this journey; no overall 10/10 claim. New changes remain uncommitted pending this gate.

## Changed files
- `car-platform-web/src/app/(dashboard)/buyer/page.tsx`
- `car-platform-web/src/components/cars/SellerEnquiry.tsx`
- `car-platform-web/src/components/cars/VehicleDetail.module.css`
- `car-platform-web/src/components/dealer/DealerCommandCenter.tsx`
- `car-platform-web/src/components/layout/DashboardHeader.tsx`
- `car-platform-web/src/components/layout/PublicHeader.tsx`
- `car-platform-web/src/lib/auth/returnTo.ts`
- `server/app.js`
- `car-platform-web/src/app/(dashboard)/buyer/enquiries/page.tsx`
- `car-platform-web/src/app/(dashboard)/dealer/enquiries/page.tsx`
- `car-platform-web/src/components/enquiries/EnquiryInbox.module.css`
- `car-platform-web/src/components/enquiries/EnquiryInbox.tsx`
- `server/controllers/enquiryController.js`
- `server/models/Enquiry.js`
- `server/routes/enquiryRoutes.js`
- `server/scripts/verify-enquiries.js`
- `server/services/enquiryService.js`
- `server/tests/enquiries.test.js`

## Follow-up: card actions
Added visible Save vehicle and Enquire actions to CarCard. Sample cars retain a clear enquiry-unavailable explanation. SavedVehicles retains its remove action and gains the enquiry link for real listings. FavoriteButton now shares an account-scoped query across cards/detail rather than fetching once per card. Collection removals invalidate this shared state.

Changed: CarCard.tsx, CarCard.module.css, FavoriteButton.tsx, SavedVehicles.tsx (under car-platform-web/src/components/cars).

Verified focused ESLint and TypeScript; browser guest save redirects to login and returns to results; signed-in card save persists after reload; detail page reflects saved status; removing there updates the card on back navigation; Enquire opens the message form; desktop and 390px mobile card controls inspected, including visible keyboard focus. Temporary buyer removed; existing accounts and favourites unchanged. No enquiry sent in this follow-up. No deployment or push.

## Dealer count and buyer identity follow-up
- Added `car-platform-web/src/components/enquiries/EnquiryCount.tsx` and `.module.css`: account-scoped shared query, total-count badge (99+ visual cap), 30-second foreground refresh, focus refresh, no misleading zero on failure.
- Modified `DashboardHeader.tsx`, `AccountMenu.tsx`, `DealerCommandCenter.tsx` to surface count at enquiry entry points.
- Modified `EnquiryInbox.tsx` and `.module.css`: dedicated Buyer label, prominent account name and email; foreground inbox refresh; count invalidation after status updates. Total includes all statuses, not unread count.
- Modified `server/controllers/enquiryController.js`, `server/routes/enquiryRoutes.js`: dealer-only `/api/enquiries/summary`, count scoped to authenticated dealer, no-store response.
- Extended `server/scripts/verify-enquiries.js`: summary authentication/role/ownership checks and dealer-visible buyer-name assertion.
- Verification: focused ESLint and TypeScript passed; 40 backend tests passed; live authenticated API verification passed with cleanup. Separate disposable dealer/buyer browser verification at 1280px and 390px confirmed badge 1 and buyer identity, plus account-menu badge. Fixtures removed and absence verified. Existing accounts/enquiries/assets unchanged.
- Local preview: http://localhost:3000/dealer/enquiries . Ready for owner approval. No commit, push, deployment, email notification or unread/read-tracking added.

## New-only badge correction
Supersedes total-count badge semantics above. Modified `server/controllers/enquiryController.js` summary to return authenticated dealer's `newCount` filtered by status=new. Modified `car-platform-web/src/components/enquiries/EnquiryCount.tsx` to show new count, label it accurately, and render no badge at zero. Existing status-save invalidation refreshes all badge instances; inbox retains total/history.
Extended `server/scripts/verify-enquiries.js` with new -> contacted, contacted -> closed, closed -> new, and new -> closed count assertions. All passed against disposable records; cleanup verified. Backend suite 40/40, focused ESLint, TypeScript and diff whitespace checks passed. This correction was verified through live API transitions and code checks; no additional browser visual pass. No existing enquiry data altered. Ready for owner check at http://localhost:3000/dealer/enquiries .
