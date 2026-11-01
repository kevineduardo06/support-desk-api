# Support Desk API

A compact multi-tenant support desk API originally structured for coding-assistant development exercises. It models tenants, users, tickets, comments, SLA deadlines, assignments, audit logs and operational reports.

The project intentionally uses in-memory repositories to keep setup fast while preserving realistic service boundaries and business rules.

## Setup

```bash
npm install
npm test
npm run build
npm run dev
```

## Domain Rules

- Every user and ticket belongs to exactly one tenant.
- Tenant isolation is mandatory across listing, updates, comments, reports and audit logs.
- Tickets may be `open`, `pending_customer`, `resolved`, or `closed`.
- Priority controls SLA target hours:
  - low: 72h
  - normal: 24h
  - high: 8h
  - urgent: 2h
- Closed tickets cannot receive new comments or be reassigned.
- Resolving a ticket requires an assignee.
- Reopening a resolved/closed ticket clears resolution data and recalculates SLA from the reopen time.
- SLA breach reports should only count tickets that are not resolved before their SLA deadline.

## Useful Endpoints

- `GET /health`
- `POST /tenants`
- `POST /users`
- `POST /tickets`
- `GET /tickets?tenantId=...&status=...&priority=...&assigneeId=...`
- `PATCH /tickets/:id/assign`
- `PATCH /tickets/:id/status`
- `POST /tickets/:id/comments`
- `GET /reports/tenant/:tenantId/summary`
- `GET /audit?tenantId=...`

## Good Task Ideas

- Fix SLA breach report for reopened tickets.
- Prevent cross-tenant assignment or comments.
- Refactor duplicated ticket filtering between listing and reports.
- Add escalation logic for urgent tickets near SLA breach.
- Debug why closed tickets are still showing in active ticket reports.


## Current limitations and future development

This is a personal development prototype, not a production deployment. Repositories currently use in-memory storage. Planned enhancements and estimated work are documented in [ROADMAP.md](ROADMAP.md). No production users or deployments are claimed.

## License

MIT; see [LICENSE](LICENSE).
