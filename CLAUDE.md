# CLAUDE.md

## Commands

- Install dependencies: `npm install`
- Run tests: `npm test`
- Type-check/build: `npm run build`
- Lint: `npm run lint`

## Workflow

- Do not push changes unless explicitly asked.
- Do not use `--no-verify`.
- Do not run destructive git commands such as `git reset --hard`, `git clean -fd`, or force-push without confirmation.
- Keep diffs focused on the requested task.
- Add or update tests for behavior changes.
- Report the exact commands run and their results before finishing.

## Architecture

- Routes/controllers should only handle HTTP mapping and input parsing.
- Services own business rules.
- Repositories own in-memory persistence and query details.
- Audit logs should be written by services, not routes.
- Tenant isolation is mandatory: never return or mutate data from another tenant.
- Prefer existing patterns before introducing new abstractions or dependencies.
