# Veltrenne connected workspace — design proposal

Status: **calendar, task and email composition approved by the owner on 15 November 2026** in response to the concrete review question. Implementation verification remains separate; outstanding browser checks are tracked in the connected handoff. Existing shared-shell approval is preserved.

Review locally at:
- http://127.0.0.1:3021/calendar
- http://127.0.0.1:3021/tasks
- http://127.0.0.1:3021/email

The preview uses isolated synthetic data. Sign in as `connected-dealer@example.invalid` with the disposable QA password provided in the task handoff. No real customer is contacted.

## Concrete proposal

Keep the approved charcoal/green surfaces, champagne-gold actions, Arial workspace typography, persistent sidebar, account menu, responsive drawer, rounded panels and visible keyboard focus. Add Calendar, Follow-up tasks and Email history only for dealer/admin accounts. Buyer and public navigation remain separate.

### Calendar
Top: page title and private-calendar context, New appointment, Month/Week/Day controls. Next row: Previous/Today/Next and date picker. Display timezone remains explicit and independently changeable.

Month: Monday-first seven-column date grid with counts and short event titles; selecting a day exposes its full appointment agenda below. Phone cells retain dates/counts and move event detail to that agenda. Arrow keys move between dates.

Week: seven day groups on wide workspaces, vertical day groups on tablet/phone. Day: a chronological appointment agenda. Event buttons open a native modal editor. Forms use two columns where space allows and one on phones, with visible timezone, DST occurrence controls, authorized links, private notes and status/outcome.

### Follow-up tasks
A status filter and New task action lead to a chronological due-date list. Each record shows title, status, due time plus timezone, notes and relevant links. An editor handles due dates, status and authorized enquiry/vehicle/appointment links. Tasks remain personal; no team-assignment model is implied.

### Email history
A chronological list of server-generated appointment confirmation records. Each shows recipient, appointment version, attempt count and accurate acceptance/failure state. Expandable message content allows inspection. Only definitely failed messages expose retry; uncertain acceptance explicitly blocks resend. No “delivered” badge is fabricated.

## Precise design decision requested

Accept this information hierarchy and responsive composition for the three new screens: **month grid plus selected-day agenda; grouped week/day agendas; task list with modal editor; email history with expandable recorded messages**.

This approval concerns presentation and interaction organization, not launch approval or production email activation. Functional tests and visual corrections continue independently. If a different approved specification exists, provide it before these compositions are treated as final.
