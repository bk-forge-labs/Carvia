# Buyer experience file manifest

All paths are relative to the repository. No dependency or production asset/configuration changes.

| File | Purpose |
|---|---|
| `car-platform-web/src/app/(public)/cars/page.tsx` | Add optional discovery, shortlist access and browse-position restoration. |
| `car-platform-web/src/components/cars/BrowsePosition.tsx` | Capture and restore browse scroll for existing result queries. |
| `car-platform-web/src/components/cars/CarCard.tsx` | Expose actual preference facts and unavailable saved-listing state. |
| `car-platform-web/src/components/cars/CarGallery.tsx` | Group only explicitly labelled authentic images. |
| `car-platform-web/src/components/cars/DecisionSpace.module.css` | Responsive comparison and private-note composition. |
| `car-platform-web/src/components/cars/DecisionSpace.tsx` | Three-car comparison and bounded owner-private versioned notes. |
| `car-platform-web/src/components/cars/FavoriteButton.tsx` | Immediate saved feedback with reserved layout space. |
| `car-platform-web/src/components/cars/GuidedDiscovery.tsx` | Optional anonymous guidance mapped to supported search filters. |
| `car-platform-web/src/components/cars/SavedVehicles.tsx` | Integrate the existing favorites decision space. |
| `car-platform-web/src/components/cars/SellerEnquiry.tsx` | Explain the supported reply and appointment journey. |
| `car-platform-web/src/components/cars/VehicleDetail.tsx` | Prioritize essentials, missing/source/charges disclosure and server-derived eligibility. |
| `car-platform-web/src/components/dealer/DealerAppointmentActions.tsx` | Actionable pending and upcoming buyer commitments. |
| `car-platform-web/src/components/dealer/DealerCarImagesManager.tsx` | Integrate explicit dealer photo labeling. |
| `car-platform-web/src/components/dealer/DealerEnquiryOverview.tsx` | Surface appointments and actual unanswered conversations. |
| `car-platform-web/src/components/dealer/DealerVehicleForm.tsx` | Edit explicit eligibility, condition report and charges. |
| `car-platform-web/src/components/dealer/PhotoLabels.tsx` | Label existing owned images without inference. |
| `car-platform-web/src/components/enquiries/ConnectedConversation.tsx` | Participant replies, request lifecycle, history pagination and test confirmation action. |
| `car-platform-web/src/components/enquiries/EnquiryInbox.tsx` | Embed connected conversations, retain editors across refresh, narrow context safely. |
| `car-platform-web/src/components/workspace/Calendar.tsx` | Route buyer-request changes through the authorized connected lifecycle. |
| `car-platform-web/src/components/workspace/Operations.module.css` | Provide readable conversation spacing within existing tokens. |
| `car-platform-web/src/components/workspace/shared.tsx` | Represent buyer requests and fix queued native-dialog close during Strict Mode. |
| `car-platform-web/src/lib/api/dealerCars.browser.ts` | Extend create/update contracts with approved vehicle fields. |
| `car-platform-web/src/types/car.ts` | Extend public/dealer vehicle and eligibility types. |
| `docs/buyer-experience-checklist-2026-11-15.md` | Maintain scope, approval, evidence and handoff traceability. |
| `docs/buyer-experience-design-proposal-2026-11-15.md` | Maintain scope, approval, evidence and handoff traceability. |
| `docs/buyer-experience-handoff-2026-11-15.md` | Maintain scope, approval, evidence and handoff traceability. |
| `server/app.js` | Mount buyer decisions and test-drive request routes. |
| `server/controllers/carController.js` | Publish choice enforcement and derived public eligibility. |
| `server/controllers/enquiryController.js` | Scoped replies/context, approved seller eligibility and unanswered counts. |
| `server/controllers/favoriteController.js` | Retain unavailable favorites without revealing hidden listings. |
| `server/models/Appointment.js` | Extend existing appointments with buyer lifecycle/public fields and original reservations. |
| `server/models/BuyerDecision.js` | Unique owner/vehicle private-note record with optimistic concurrency. |
| `server/models/Car.js` | Persist explicit eligibility, sold state, authentic labels and supplied confidence fields. |
| `server/models/Enquiry.js` | Persist bounded participant reply history. |
| `server/routes/buyerDecisionRoutes.js` | Validate scoped note batches and optimistic writes. |
| `server/routes/carDealerRoutes.js` | Authorize versioned photo metadata updates on owned images. |
| `server/routes/enquiryRoutes.js` | Expose participant reply endpoint. |
| `server/routes/testDriveRoutes.js` | Authorize request lifecycle, conflicts, idempotency, eligibility and dealer actions. |
| `server/routes/workspaceRoutes.js` | Reuse calendar locking, honor reservations, guard buyer-request edits and test-only mail. |
| `server/services/calendarLock.js` | Reuse transactional owner locks and retained-reservation overlap checks. |
| `server/services/testDriveEligibility.js` | Central explicit availability and publication/seller checks. |
| `server/tests/buyer-journey.integration.test.js` | Disposable database privacy, lifecycle, conflict and concurrency integration. |
| `server/tests/test-drive-eligibility.test.js` | Strict booleans and legacy/unavailable/sold eligibility units. |
| `server/utils/publicationQuality.js` | Include supplied confidence fields in publication-review invalidation. |
| `server/validations/car.validations.js` | Strict boolean and bounded supplied condition/charges validation. |

Evidence files in `docs/evidence/buyer-experience-2026-11-15/` preserve the final backend/frontend tests, build and lint outputs. The file manifest itself records changed-file responsibility.
