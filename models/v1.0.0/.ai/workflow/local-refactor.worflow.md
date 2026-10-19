# Local Refactor Workflow

Use when refactoring existing code in this repository.

## Input

User should provide one or more:

- File path
- Function/module name
- Current problem
- Expected outcome

Preserve current behavior unless the user explicitly approves behavior changes. Record unclear behavior as open
questions.

## Read First

1. Target files/functions
2. Direct callers/dependencies
3. Relevant `.bat-peasant/context/*.business-logic.md` if behavior may change
4. `.bat-peasant/standards/code-writing.standard.md`
5. `.bat-peasant/standards/project-structure.standard.md`
6. Matching `.bat-peasant/examples/` if useful
7. Existing tests if available

## Safety Check

Before coding, identify:

- Current behavior
- Inputs/outputs
- Side effects
- Error/logging behavior
- External dependencies
- Callers
- Existing tests
- Behavior-change risks

Do not code during this step.

## Plan File

Create/update:

```sh
.bat-peasant/history/<kebab-task-name>/local-refactor-plan.md
```

Plan must contain exactly:

## Current Behavior

- Target files/functions
- Responsibility
- Inputs/outputs
- Side effects
- Error/logging behavior
- Callers/tests
- Behavior to preserve
- Open questions

## Refactor Plan

- Files to update/create
- Functions to update/create
- Types/schemas to update
- Duplication to remove
- Naming/layer-boundary improvements
- Error/logging improvements
- Tests needed
- Implementation order
- Risks

## Approval Rule

After writing the plan, ask for approval.

Do not implement until user clearly approves:

```sh
approved
go implement
confirmed
proceed
```

If changes are requested, update the same plan and ask again.

## Implementation Rules

After approval:

1. Follow the approved plan only.
2. Preserve business behavior.
3. Keep changes minimal and local.
4. Follow repo standards/patterns.
5. Do not rename public APIs, change contracts, DB shape, validation, or behavior unless approved.
6. If new required scope appears, stop, update the plan, and ask for re-approval.
7. After implementation, ask for review.

## Quality Rule

Refactor must improve at least one:

- Readability
- Naming
- Type safety
- Error/logging clarity
- Dependency boundaries
- Duplication
- Function size
- Testability
- Schema consistency

Avoid style-only refactors that increase complexity.

## Post-Implementation Changes

If user requests changes after implementation:

1. Append under `Post-Implementation Update` in the same plan.
2. Keep scope precise.
3. Implement only the approved update.
4. Ask for review.

## Testing

After review, ask:

```sh
Does this local refactor need tests?
```

If yes:

1. Read `.bat-peasant/standards/testing.standard.md` if present.
2. Inspect existing tests.
3. Add focused tests for preserved behavior.
4. Follow existing test structure.
5. Ask for final review.

## Response Rules

Planning response:

- Plan file path
- Target summary
- Refactor summary
- Open questions
- Approval request

Implementation response:

- Plan file path
- Changed files
- Refactor summary
- Behavior preservation notes
- Test status
- Risks/manual checks
