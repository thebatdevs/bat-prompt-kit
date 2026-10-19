# Monorepo Business Logic Context Standard

Purpose: document only the business logic needed for AI agents to safely modify a monorepo scope without loading the
full repository.

## File Rule

Create one file per monorepo scope:

```txt
.bat-peasant/context/<scope>.business-logic.md
```

Examples:

```txt
.bat-peasant/context/client-withdraw.business-logic.md
.bat-peasant/context/admin-pay-to-pay.business-logic.md
.bat-peasant/context/bank-deposit-service.business-logic.md
```

A scope can be a stack, package, service app, deployable project, or bounded business module.

Do not create a separate `business-logic/` subfolder.

## Include Only

Document:

- purpose
- entities
- main business flows
- service responsibilities
- repository responsibilities
- statuses
- business rules
- side effects
- external dependencies
- agent warnings

Do not document:

- generic TypeScript style
- folder structure explanations
- full API documentation
- full schema definitions
- obvious implementation details
- line-by-line code behavior

## Required Template

Use this format for every scope.

```md
# <scope> Business Logic

Path: `<scope path>`

Purpose: `<one sentence>`

Pattern: Function -> Handler -> Service -> Repository -> Storage/External API

## Entities

- `<entity>`: `<business meaning>`; storage=`<table/external/none>`

## Flows

### `<flow name>`

Entry: `<api/function/handler>` Service: `<main service function>` Repositories: `<important repository functions>`

Steps:

1. `<business step>`
2. `<business step>`
3. `<business step>`

Side effects: `<state change / external call / none>`

Statuses:

- `<STATUS>`: `<meaning>`

Rules:

- `<business invariant>`
- `<business invariant>`

Errors:

- `<ERROR_CODE>`: `<when it happens>`

## External Dependencies

- `<dependency>`: `<why used>`

## Agent Notes

- `<implementation warning>`
- `<what must not be changed casually>`
```

## Field Rules

| Field        | Rule                                                                                   |
| ------------ | -------------------------------------------------------------------------------------- |
| Path         | Use the real monorepo path, for example `stacks/client-withdraw`.                      |
| Purpose      | One sentence only.                                                                     |
| Entities     | Real business concepts only, not every type/schema.                                    |
| Flows        | Business behavior, not code internals.                                                 |
| Steps        | Short, business-focused, ordered.                                                      |
| Repositories | List only repository functions relevant to the flow.                                   |
| Side effects | Include DynamoDB writes, Lambda invokes, external API calls, notifications, or `none`. |
| Statuses     | Document only statuses used by this scope.                                             |
| Rules        | Preserve business invariants.                                                          |
| Errors       | Include meaningful business errors only.                                               |
| Agent Notes  | Add warnings that prevent unsafe agent changes.                                        |

## Compact Example

```md
# client-withdraw Business Logic

Path: `stacks/client-withdraw`

Purpose: Allows clients to create and track withdrawal requests.

Pattern: Function -> Handler -> Service -> Repository -> Storage/External API

## Entities

- `withdraw-request`: user withdrawal request; storage=`withdraw-request-table`
- `custom-config`: withdrawal limits and fee config; storage=`custom-config-table`
- `user-payment-address`: saved payout address; storage=`user-payment-address-table`

## Flows

### Create withdraw request

Entry: `POST /withdraw` Service: `createWithdrawRequest` Repositories: `createWithdrawRequest`, `getCustomConfigByKey`,
`getUserPaymentAddressById`

Steps:

1. Validate request body.
2. Check user restriction and KYC status.
3. Load withdrawal config.
4. Validate amount and payout address.
5. Create request with `PENDING` status.

Side effects: DynamoDB create; Lambda invoke for user eligibility check

Statuses:

- `PENDING`: request created and waiting for processing

Rules:

- User cannot withdraw if restriction or KYC check fails.
- Amount must be within configured min/max limits.
- Repository functions must not contain business validation.

Errors:

- `CONFIG_NOT_FOUND`: withdrawal config is missing
- `USER_NOT_ALLOWED`: user failed restriction or KYC validation
- `INVALID_AMOUNT`: amount violates limits

## External Dependencies

- `restriction-check`: verifies whether user can withdraw
- `KYC service`: verifies user identity approval

## Agent Notes

- Do not move business validation into repositories.
- Do not change status transitions without updating this file.
```

## Update Rule

Update the related `<scope>.business-logic.md` when changing:

- business rules
- status behavior
- entity meaning
- external integration behavior
- service flow
- repository responsibility
- validation that changes business behavior

Do not update it for:

- formatting changes
- internal refactors with no behavior change
- test-only changes
- local variable renames
- utility movement with no business impact
