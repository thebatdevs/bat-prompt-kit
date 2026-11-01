# New Feature Workflow

Use this workflow when implementing a new feature.

## Required Reading

Before changing code, read:

1. Relevant files in `.bat-peasant/context/`
2. `.bat-peasant/standards/code-writing.standard.md`
3. `.bat-peasant/standards/project-structure.standard.md`
4. `.bat-peasant/standards/tech-stack.typescript.standard.md`

If the feature changes business behavior, also read the matching context standard:

- Monorepo: `.bat-peasant/standards/context-documentation-monorepo.standard.md`
- Mono-project: `.bat-peasant/standards/context-documentation-single.standard.md`

## Example Pattern Reading

Before implementation, check `.bat-peasant/examples/` for a matching implementation pattern.

Read only examples relevant to the current feature.

Common examples:

```text
.bat-peasant/examples/dynamo-client.functions.md
.bat-peasant/examples/dynamo-repository.functions.md
.bat-peasant/examples/dynamo-service.functions.md
.bat-peasant/examples/service-layer-functions.md
.bat-peasant/examples/project-structure.example.md
.bat-peasant/examples/project-structure-brief.example.md
```

Use examples to match existing preferred patterns, but do not copy blindly.

## Task History Rule

Before asking for approval, write the implementation plan to:

```text
.bat-peasant/history/<task-name>/implementation-plan.md
```

Rules:

- Use a short kebab-case task name.
- Create the folder if it does not exist.
- Keep the plan concise.
- Update the same plan file if the user requests changes before approval.
- Do not create history files for tiny one-line fixes unless the user asks.

Example:

```text
.bat-peasant/history/add-withdraw-request-filter/implementation-plan.md
.bat-peasant/history/create-payment-callback-handler/implementation-plan.md
.bat-peasant/history/fix-user-kyc-validation/implementation-plan.md
```

## Workflow

1. Inspect the current project structure and related existing implementation.
2. Identify the related business scope, service, handler, repository, schemas, examples, and tests.
3. Create an implementation plan.
4. Save the plan to `.bat-peasant/history/<task-name>/implementation-plan.md`.
5. Ask for user approval before implementation.

   The plan must include:
   - **Objective**: what the feature must accomplish.
   - **Affected Files**: files likely to be created or changed.
   - **Relevant Context**: `.bat-peasant/context/` files used.
   - **Relevant Examples**: `.bat-peasant/examples/` files used, if any.
   - **Implementation Steps**: ordered technical steps.
   - **Data / Schema Changes**: new or updated schemas, types, tables, or fields.
   - **Business Rules**: validations, permissions, statuses, limits, and side effects.
   - **Testing Plan**: unit tests, integration tests, and important edge cases.
   - **Documentation Updates**: `.bat-peasant/context/*.business-logic.md` files that may need updates.

6. After approval, implement the feature using the project’s existing patterns.
7. Keep the layer boundary strict:
   - Function metadata: route/config only
   - Handler/controller: request parsing, auth, validation, service call
   - Service: business logic and orchestration
   - Repository: data access only
   - Schema/type files: validation and shared contracts

8. Add or update tests according to the approved testing plan.
9. Run relevant tests, type checks, and lint checks when available.
10. Update `.bat-peasant/context/*.business-logic.md` only if business behavior changed.
11. Return a concise final summary.

## Final Response

Return only:

1. What changed
2. Tests added or updated
3. Commands run and results
4. Business logic documentation updated
5. Relevant examples followed
6. Task history file created or updated
7. Any unclear or risky areas
