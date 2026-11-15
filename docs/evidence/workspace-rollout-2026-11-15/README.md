# Workspace rollout evidence

These files document local verification after main `167da19` (which contains `096e547`). They are not production fixtures and must not be wired into a deployment.

- `render-matrix.json`: 318 browser DOM observations of the actual Next app, 106 role/route/state cases at 1440/768/390 CSS px, with 900px iframe height. Captures resolved URL, heading, landmarks, navigation, alert/status text and bounds findings. Zero measured horizontal-overflow findings. A loading label describes injected API delay, not proof that the snapshot captured a transient frame; inspect recorded heading/status.
- `workflow-results.json`: eleven successful groups against the real application and disposable local replica set. A result summary, not a browser interaction trace.
- `fixture-api.cjs`: synthetic HTTP contract fixture; in-memory writes only, no database, real emails or customer credentials. Auth cookies simulate identity and are **not** a security implementation. Real permissions were checked separately against Express.
- `render-suite.html`: responsive render harness used in Chrome. It reloads between groups to limit browser memory.
- `visual-audit.html`: three actual app iframes for visual comparisons. Final version uses 900px desktop/tablet and 844px phone heights. Earlier comparisons used taller frames; the handoff distinguishes this evidence.
- Earlier screenshot `../workspace-shell-desktop.png` is historical shell evidence. Current browser inspections are documented in the handoff/session; screenshots for every matrix row are not stored.

## Reproduce fixture rendering

Use a temporary copy of the frontend, excluding environment files and build output. Copy the fixture there and place the HTML files in the temporary `public` directory as `suite.html` and `visual.html`. Keep them out of the product's public directory.

Run the fixture with Node 22 or newer:

```sh
node fixture-api.cjs
```

Start the temporary Next app with explicitly local configuration:

```sh
NEXT_PUBLIC_API_BASE_URL=http://localhost:5067/api \
API_INTERNAL_BASE_URL=http://127.0.0.1:5067/api \
NEXT_PUBLIC_API_ORIGIN=http://localhost:5067 \
node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3017
```

Open `http://localhost:3017/suite.html` and run the audit, or `visual.html?role=dealer&route=/dealer`. The suite appends rows to `audit.jsonl` beside the copied fixture. Validate headings/statuses/redirects as well as dimensions. Fixture totals and pagination are synthetic; long text and a missing photograph intentionally exercise fallbacks.

## Real database regression

Existing `server/tests/review-fixes.integration.test.js` requires a disposable MongoDB replica set and checks its database-name guard. This rollout used `VELTRENNE_TEST_MONGO_URI=mongodb://127.0.0.1:27029/veltrenne_review_test?replicaSet=qa`. Never substitute an owner/customer database. The ordinary backend suite skips it without this variable.

For observed checks, remaining manual coverage, unfinished features and launch boundaries, read [the handoff](../../workspace-shell-2026-11-15.md).
