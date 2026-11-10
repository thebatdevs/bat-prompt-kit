# Task record: <task-name>

Status: pending

## Objective and boundaries

- Requested behavior and failure cases: <verified requirements>
- Scope/exclusions: <packages, paths, external effects>
- Baseline: <starting revision and pre-existing working-tree changes>
- Shared contracts and decisions: <inputs, outputs, invariants, authoritative sources>
- Missing facts/assumptions: <consequences and independent work available>
- Test generation authorized: <yes with request reference, or no>

## Loop settings

- Active items: 1
- Maximum repair attempts per item: 2
- Continuation: automatic within authorized scope
- Overrides and reasons: <none or explicit changes>

## Requirement coverage

| Requirement   | Work items | Verification method | Final evidence/status |
| ------------- | ---------- | ------------------- | --------------------- |
| R1: <outcome> | T1         | <check or review>   | pending               |

## Work queue

Statuses: pending → active → reviewing → repairing → reviewing → passed; unresolved prerequisites or exhausted repairs →
blocked. Reopen invalidated items with the reason and retained history.

| ID  | Responsibility   | Dependencies | Status  | Repair attempts |
| --- | ---------------- | ------------ | ------- | --------------- |
| T1  | <bounded change> | none         | pending | 0/2             |

## T1: <title>

- Requirements: <IDs>
- Allowed files/symbols: <paths and symbols>
- Context and applicable rules: <exact paths and sections>
- Inputs/outputs and relevant failures: <contracts>
- Prerequisites: <dependencies, tools, environment>
- Acceptance criteria: <observable checks>
- Implementation evidence: <changed symbols/diff references>

### Function review

| File / symbol   | Applicable rule | Behavior/structure evidence | JSDoc coverage or exemption     | Result  |
| --------------- | --------------- | --------------------------- | ------------------------------- | ------- |
| <path / symbol> | <section>       | <review evidence>           | <operations matched; omissions> | pending |

### Findings and repairs

| ID  | Criterion/rule | Location and observed defect | Required correction | Attempt | Status and closure evidence |
| --- | -------------- | ---------------------------- | ------------------- | ------- | --------------------------- |
| F1  | <reference>    | <path/symbol and defect>     | <correction>        | 0       | open                        |

Remove the illustrative finding row if no findings were observed. Duplicate this item section for each real work item.

### Checks

| Command or review                      | Working directory / scope | Result and supporting output      | Limitations |
| -------------------------------------- | ------------------------- | --------------------------------- | ----------- |
| <actual invocation or semantic review> | <scope>                   | <not run / pass / fail / blocked> | <reason>    |

## Final feature gate

- Requirement coverage: <evidence for each outcome>
- Cross-layer contracts and failure/recovery flow: <evidence>
- Relevant feature-level checks: <commands/results>
- Final diff and context consistency: <evidence>
- Reopened items and reasons: <none or IDs>
- Unresolved findings/prerequisites: <none or details>
- Result: <pending / passed / blocked>

## Continuation handoff

- Last completed item: <ID or none>
- Active/next ready item: <ID and dependency status>
- Changes since last review that invalidate evidence: <details or none>
- Next action: <concrete action>
- Metrics: <first-pass findings; repair rounds; unresolved findings; elapsed time if measured>
