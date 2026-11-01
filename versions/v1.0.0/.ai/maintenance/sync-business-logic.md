# Sync Business Logic Context

You are syncing business logic documentation for this repository’s `.bat-peasant/context/*.business-logic.md` files.

## Goal

Scan the project and create or update minimal business logic context files for AI coding agents.

Use the existing business logic context standard in this repo:

- Monorepo: use `.bat-peasant/standards/context-documentation-monorepo.standard.md`.
- Mono-project: use `.bat-peasant/standards/context-documentation-single.standard.md`.

If both exist, choose based on repository shape:

- Multiple apps/stacks/packages/deployable scopes = monorepo.
- Single deployable/project = mono-project.

## Standard Paths

Business logic context files must be created directly under:

```sh
.bat-peasant/context/
```

Do not create:

```sh
.bat-peasant/context/business-logic/
```

## Rules

Document business behavior only.

Include:

- purpose
- entities
- main flows
- service responsibilities
- repository responsibilities
- statuses
- business rules
- side effects
- external dependencies
- agent warnings

Do not include:

- generic TypeScript style
- full folder structure docs
- full API docs
- full schema definitions
- line-by-line code behavior
- obvious implementation details
- test-only behavior unless it reveals business rules

## Scan Order

1. Inspect repository structure.
2. Identify whether this is monorepo or mono-project.
3. Read the matching business logic context standard.
4. Find business scopes:
   - monorepo: stacks, apps, packages, services, bounded modules
   - mono-project: main business services/modules
5. For each scope, inspect only relevant files:
   - function metadata
   - handlers/controllers
   - services
   - repositories
   - schemas/types only when needed for business meaning
   - external integration clients only when needed for side effects
6. Create or update the matching context file.

## Output Files

For monorepo, create/update one file per scope:

```sh
.bat-peasant/context/<scope>.business-logic.md
```

Examples:

```sh
.bat-peasant/context/client-withdraw.business-logic.md
.bat-peasant/context/admin-pay-to-pay.business-logic.md
.bat-peasant/context/bank-deposit-service.business-logic.md
```

For mono-project, create/update one compact project-level file by default:

```sh
.bat-peasant/context/project.business-logic.md
```

If the mono-project has clearly separated business services, create one file per service instead:

```sh
.bat-peasant/context/<service-name>.business-logic.md
```

Examples:

```sh
.bat-peasant/context/withdraw-request.business-logic.md
.bat-peasant/context/payment.business-logic.md
.bat-peasant/context/user-payment-address.business-logic.md
```

## Documentation Requirements

Each business logic file must be compact and use the matching standard template.

Keep each flow short:

- Entry
- Service
- Repositories
- ordered business steps
- side effects
- statuses
- rules
- business errors

Prefer exact function names when useful, but do not over-document implementation internals.

## Accuracy Rules

- Do not guess business rules.
- If a rule is unclear, write `Unknown from current code`.
- If a status exists but transition is unclear, document only confirmed usage.
- If an external dependency is called, document why it is used.
- If repository code contains business validation, note it as an agent warning.
- Preserve existing useful context; update only what changed or what is missing.
- Remove stale logic only when code clearly proves it is obsolete.

## Agent Warnings

Add warnings for anything future agents must not casually change, such as:

- status transitions
- validation rules
- money/amount calculation rules
- permission/KYC/restriction checks
- external API request semantics
- idempotency behavior
- repository/service boundary rules

## Final Response

After syncing, return only:

1. Files created
2. Files updated
3. Important business rules discovered
4. Unclear areas that need human confirmation

Keep the response short.
