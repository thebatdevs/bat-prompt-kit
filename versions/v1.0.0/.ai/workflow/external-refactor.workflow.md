# External Refactor Workflow

Use this workflow when migrating or refactoring logic from a legacy repository into the current repository.

## Input Requirements

The user must provide a markdown summary of the legacy codebase containing:

- Business purpose
- Current behavior
- Relevant files/functions
- Data models
- Edge cases
- Known issues
- Expected outcome

Do not infer missing legacy behavior. If required behavior is unclear, record it as an open question in the plan.

## Required Reading

Before planning or coding, read:

1. User-provided legacy summary
2. Relevant `.bat-peasant/context/*.business-logic.md` files
3. `.bat-peasant/standards/code-writing.standard.md`
4. `.bat-peasant/standards/project-structure.standard.md`
5. Existing similar implementations in the current codebase
6. Matching files in `.bat-peasant/examples/` if available

## Compatibility Check

Compare legacy behavior with the current repository business logic and standards.

Identify:

- Compatible behavior
- Conflicting behavior
- Missing rules
- Deprecated rules
- Required schema/type changes
- Required repository changes
- Required service changes
- Required handler/API changes

Do not implement during compatibility checking.

## Plan File

Create or update:

```txt
.bat-peasant/history/<kebab-task-name>/external-refactor-plan.md
```

The plan must include exactly these sections:

## Business Logic Update

Document only business behavior changes.

Include:

- Legacy behavior being migrated
- Current behavior affected
- Final expected behavior
- Compatibility notes
- Edge cases
- Open questions
- Business logic files to update

## Development Plan

Document implementation steps without writing code.

Include:

- Files to create with exact paths
- Files to update with exact paths
- Functions to create with exact names
- Functions to update with exact names
- Schemas/types to create or update
- Repository changes
- Service changes
- Handler/API changes if needed
- Tests needed if obvious
- Implementation order

## Approval Rule

After creating the plan file, ask the user to review and approve it.

Do not implement until the user explicitly approves with clear intent, such as:

```txt
approved
go implement
confirmed
proceed
```

If the user requests changes, update the same plan file and ask for approval again.

## Implementation Rules

After approval:

1. Implement exactly the approved plan.
2. Follow all repository standards and existing patterns.
3. Keep changes minimal.
4. Do not introduce unrelated refactors.
5. Do not change business behavior outside the plan.
6. If a new required change is discovered, stop implementation.
7. Add the required change to the plan file.
8. Ask for re-approval before continuing.
9. After implementation, ask the user to review.

## Post-Implementation Updates

If the user requests changes after implementation:

1. Append the request to the existing plan file under `Post-Implementation Update`.
2. Keep the update precise and scoped.
3. Implement only the approved update.
4. Ask for review again.

## Testing Decision

After implementation review, ask:

```txt
Does this refactored code need tests?
```

If tests are required:

1. Read `.bat-peasant/standards/testing.standard.md` if it exists.
2. Inspect existing test patterns.
3. Add focused tests for migrated business behavior.
4. Follow existing test naming and structure.
5. Ask for final review.

## Response Rules

During planning, respond with:

- Plan file path
- Compatibility summary
- Open questions
- Approval request

After implementation, respond with:

- Plan file path
- Summary of business logic changes
- Changed files
- Implementation summary
- Test status
- Remaining risks or manual verification needed
