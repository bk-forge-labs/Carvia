# Advanced vehicle filtering — 5 October 2026

Scope: first approved filter set. Homepage and results page have a More options dialog; desktop side panel, mobile full-width, native dialog focus handling, named colour checkboxes, reduced-motion styling, grouped year/mileage, fuel/transmission, colour, seats/doors. Fixed action row with debounced database match count and explicit fallback if counts fail. Make-dependent model suggestions are drawn from published listings; users can also type exact model names. URL filters survive pagination and the detail-page return link. Removing a selected-filter chip applies the remaining search immediately.

Backend: optional exteriorColor, seats and doors in vehicle schema, create/update validation and update allowlist. Dealer form accepts unknown/cleared fields, detail view displays supplied values. Existing records untouched, no migrations, no sample enrichment. Approval fingerprint unchanged for records without these new details; supplied changes participate in review invalidation. Search uses validated scalar/enumerated values, escaped literal make/model matches, bounded numeric ranges, OR between colours and AND between different fields. Published-only model metadata endpoint added. Unknown specifications do not satisfy selected filters.

Checks: 56 backend tests passed, one existing isolated-database test skipped (no test URI); includes four new filter/schema/review-fingerprint regressions. TypeScript and targeted ESLint pass. Diff whitespace check passed. Read-only live API: 26 catalogue records; Automatic + Electric yields 6, BMW + max 50,000km yields 4, Blue/Black and five seats/four doors yield 0. Verified BMW model metadata matches catalogue; reversed year range returns 400. Browser: combined filter apply, colour selection, mobile dialog and fixed action row, homepage make/model search, dealer new-listing options read without submitting. A responsive hidden-ancestor issue was found and corrected. No live dealer writes, production build, deployment or full assistive-technology audit claimed.

Files:
- server/models/Car.js
- server/validations/car.validations.js
- server/controllers/carController.js
- server/routes/carPublicRoutes.js
- server/utils/publicationQuality.js
- server/utils/vehicleSearch.js (new)
- server/tests/vehicle-search.test.js (new)
- car-platform-web/src/types/car.ts
- car-platform-web/src/lib/api/car.ts
- car-platform-web/src/lib/api/dealerCars.browser.ts
- car-platform-web/src/components/dealer/DealerVehicleForm.tsx
- car-platform-web/src/components/cars/VehicleFilters.tsx (new)
- car-platform-web/src/components/cars/VehicleFilters.module.css (new)
- car-platform-web/src/components/cars/VehicleDetail.tsx
- car-platform-web/src/components/home/DiscoveryExperience.tsx
- car-platform-web/src/app/(public)/cars/page.tsx
- car-platform-web/src/app/(public)/cars/[id]/page.tsx
- car-platform-web/src/app/(public)/cars/results.module.css

Preview http://localhost:3000/cars. Owner visual acceptance is next. Specialised equipment, electric battery filters, radius/geocoding and additional vehicle categories remain later scope. Existing smoking-history field retained separately from any future condition field. No purchases, commits, pushes or deployment.
