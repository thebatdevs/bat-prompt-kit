# Mono-Project Business Logic Context Standard

Purpose: document only the business logic needed for AI agents to safely modify a mono-project without loading the full
repository.

## File Rule

Store business logic context files in:

```txt
.bat-peasant/context/
```

For small projects, use one file:

```txt
.bat-peasant/context/context.business-logic.md
```

For medium or large projects, use one file per service/entity:

```txt
.bat-peasant/context/withdraw-request.business-logic.md
.bat-peasant/context/custom-config.business-logic.md
.bat-peasant/context/user-payment-address.business-logic.md
```

Do not create a separate `business-logic/` subfolder.

## Split Rule

Use one `context.business-logic.md` file when:

- the project has fewer than 3 service entities
- business logic is simple
- most flows are tightly related
- the file can stay under 300 lines

Split by service/entity when:

- the project has many service folders
- business flows are independent
- one context file becomes too large
- the agent usually works on one service at a time

Example service/entity split:

```txt
src/services/withdraw-request/
src/services/custom-config/
src/services/user-payment-address/

.bat-peasant/context/withdraw-request.business-logic.md
.bat-peasant/context/custom-config.business-logic.md
.bat-peasant/context/user-payment-address.business-logic.md
```

## Include Only

Document:

- service/entity purpose
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

- generic TypeScript rules
- code style rules
- full folder structure
- full API documentation
- full schema definitions
- obvious implementation details
- line-by-line code behavior

## Required Template

Use this format for every mono-project business logic file.

```md
# <service-or-project> Business Logic

Path: `<service/project path>`

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

| Field        | Rule                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Path         | Use the real project path, for example `src/services/withdraw-request`. Use `.` for whole-project context. |
| Purpose      | One sentence only.                                                                                         |
| Entities     | Real business concepts only, not every type/schema.                                                        |
| Flows        | Business behavior, not code internals.                                                                     |
| Steps        | Short, business-focused, ordered.                                                                          |
| Repositories | List only repository functions relevant to the flow.                                                       |
| Side effects | Include DynamoDB writes, Lambda invokes, external API calls, notifications, or `none`.                     |
| Statuses     | Document only statuses used by this service/entity.                                                        |
| Rules        | Preserve business invariants.                                                                              |
| Errors       | Include meaningful business errors only.                                                                   |
| Agent Notes  | Add warnings that prevent unsafe agent changes.                                                            |

## Compact Example

```md
# withdraw-request Business Logic

Path: `src/services/withdraw-request`

Purpose: Manages user withdrawal request creation and status changes.

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
2. Load withdrawal config.
3. Check user restriction and KYC status.
4. Validate amount and payout address.
5. Create request with `PENDING` status.

Side effects: DynamoDB create; Lambda invoke for user eligibility check

Statuses:

- `PENDING`: request created and waiting for processing

Rules:

- User cannot withdraw if restriction or KYC check fails.
- Amount must be within configured min/max limits.
- Repository functions must not contain business validation.
- Status transitions must be explicit.

Errors:

- `CONFIG_NOT_FOUND`: required withdrawal config is missing
- `USER_NOT_ALLOWED`: user failed restriction or KYC validation
- `INVALID_AMOUNT`: amount violates configured limits

## External Dependencies

- `restriction-check`: verifies whether user can withdraw
- `KYC service`: verifies user identity approval

## Agent Notes

- Do not move business validation into repositories.
- Do not change status transitions without updating this file.
```

## Update Rule

Update the related business logic context file when changing:

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
