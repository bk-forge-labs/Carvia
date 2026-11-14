# Dealer inventory and enquiries — 14 November 2026

Approved scope: extend the accepted dealer dashboard direction to inventory and enquiries. Charcoal/gold palette, restrained surfaces, consistent typography and explicit actions. Existing dirty checkout preserved; no commit or deployment.

## Modified files
- car-platform-web/src/app/(dashboard)/dealer/cars/page.tsx: shared dashboard heading/summary styles; inventory totals; GET search for make/model/title combined with status tabs; results count, clear-search and no-match state. Search is limited to the existing dealer-authorized inventory response. Search input remounts on URL changes to prevent stale text after clearing.
- car-platform-web/src/components/dealer/DealerWorkspace.module.css: inventory-scoped card, tab, search and action styling. Listing detail/editor styles remain outside this new scope.
- car-platform-web/src/components/enquiries/EnquiryInbox.tsx: dealer-only heading, existing summary endpoint/new count, total and guidance; status data attribute. Existing save logic, conflict handling, pagination, identity scoping and buyer layout retained.
- car-platform-web/src/components/enquiries/EnquiryInbox.module.css: dealer-only summary, desktop buyer/message composition, status styling and responsive card/control layout.

## Checks
TypeScript noEmit passed (final run with incremental disabled to avoid restricted cache-file writes). Targeted ESLint passed. Scoped diff whitespace check passed.

Chrome signed in as existing Leen Group at localhost:3003. Desktop and 390px responsive screenshots inspected for both pages, including lower card actions. Inventory data: 31 total, 26 published, 5 drafts. BMW search returned 4; Drafts with BMW returned zero and a useful no-match state; clearing search retained Drafts and returned 5. Fixed stale search input discovered during QA, then confirmed mobile clear-search removes input text and restores all 31 when in All.

Enquiries loaded one existing contacted enquiry and zero new. Buyer name, email, vehicle, message, status selector and disabled-until-changed Save status remain visible. No database records or enquiry statuses were changed. No emails sent, listings published or deleted. No assets changed.

## Limits and next gate
No physical-device or production build test in this scope. Browser has extension runtime errors and existing Next image sizing/loading warnings; not a claim of a globally clean console. Empty/error paths are retained; enquiry errors were not deliberately injected. Existing backend mutation handlers were preserved rather than exercised against the owner's records. Search uses the existing full inventory response and is not a new paginated server-search endpoint.

Desktop mode restored, DevTools closed, enquiries page left open. Ready for owner approval at http://localhost:3003/dealer/cars and http://localhost:3003/dealer/enquiries.
