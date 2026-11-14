# Veltrenne logo integration — 19 September 2026

Preview: http://localhost:3001/ (Node 24.19.0). Existing unrelated dirty work retained; no commit, deployment or database changes.

## Changes
- Added public/logo/veltrenne/{emblem,horizontal,stacked,endorsed}-gold.svg from the approved editable identity.
- Added src/app/icon.svg with a gold emblem on a contrasting square.
- Updated PublicHeader.tsx, DashboardHeader.tsx, and HomeClosing.tsx to use the gold horizontal logo.
- Updated visible brand copy in DiscoveryExperience.tsx, DealerInvitation.tsx, FeaturedCarsSection.tsx, HowCarviaWorks.tsx, LatestArrivals.tsx, ShowroomHero.tsx and homepage/footer/header metadata. Source identifiers, storage keys and routes remain stable. This is not a complete repository-wide naming migration.
- CvShowroom.tsx replaces only CV meshes with extruded VE SVG geometry, keeping the original GLB platform and HDR environment. Gold material remains #bda47e, metalness .92, roughness .3. Rotation remains negative Y, one revolution per 24 seconds. New static gold emblem replaces old CV fallback. Updated deprecated renderer APIs in this component.

## Verification
- TypeScript: pass.
- Scoped ESLint: zero errors; existing internal-navigation warning in DiscoveryExperience.tsx.
- Live desktop: header, gold 3D geometry from multiple rotation angles, pause/resume, footer identity inspected.
- Mobile at 390 × 844: inspected header, hero, sculpture and controls; document width 390, no horizontal overflow.
- Selecting Cars still replaces the logo scene with the original car showroom motion. Reload restores initial logo scene.
- No browser console errors observed. Earlier renderer warnings were corrected; logged warnings from before the correction remain in the tab history.

## Limits / approval
Awaiting owner approval of the local application. No frame-rate benchmark, authenticated dealer/admin visual session, reduced-motion device test, production build or full marketplace regression suite run for this scoped identity change. Reduced-motion/save-data fallback retained, with the new static emblem. Trademark/legal clearance remains a separate launch gate.
