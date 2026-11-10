# Sequential implementation workflow

## Authority and scope

Use for work within the applicable entry point's scope. Read the
[engineering standard](../rules/ts.engineering-standard.md) and [project profile](../rules/project-profile.md). Preserve
higher-priority instructions, explicit user requirements, and documented project exceptions. Load relevant rules and
context selectively, but do not omit cross-cutting security, contract, or integrity constraints. Review passes are
separate activities; they do not require separate agents or threads.

## 1. Prepare the task record

Copy the [template](../templates/task-record.template.md) into `.agents/plans/<task-name>.md` using a unique descriptive
name. Preserve existing records. Inspect the working tree and identify pre-existing changes before editing. Record
requested outcomes, exclusions, failure cases, contracts, and environment constraints. Map every requirement to at least
one work item and a verification method.

Create dependency-ordered items covering one responsibility or tightly coupled change. Specify allowed files/symbols,
relevant rule sections, inputs/outputs, acceptance criteria, existing checks, and prerequisites. Inspect consumers
before changing shared contracts. Define the full feature's contracts before implementing individual layers; preserve
those decisions in the record.

Defaults: one active item, two repair attempts per item, automatic continuation through passing gates. A repair attempt
is one focused edit pass followed by both review passes and affected checks; initial implementation/review does not
consume a repair attempt. Record justified overrides before execution. Do not silently increase the budget or reset it
by renaming an item.

Proceed within authorized scope without routine approval between items. An explicit request to plan only stops before
implementation. Clarify consequential missing business, security, data-integrity, or authorization decisions before
dependent changes. Continue independent supported work where possible.

## 2. Select and implement one item

Select a pending item only when its dependencies have passed. Mark it active and load its relevant rules, approved
examples, code, callers, configuration, and existing tests. Implement only this item. If another file is necessary,
record why and update scope and dependencies before editing it. Do not perform unrelated cleanup or begin future items.

Keep all applicable constraints during implementation; separate reviews are additional checks, not permission to ignore
documentation or error handling until later. Generate tests only when explicitly requested under the bundle policy. Run
applicable existing checks with verified commands and prerequisites.

## 3. Review behavior and contracts

Mark the item reviewing. Inspect its actual diff and affected flow rather than relying on the implementation summary.
Check every acceptance criterion, meaningful failure path, layer responsibility, consumer contract, and relevant
authorization, concurrency, persistence, idempotency, and external-effect requirement. Record findings with file/symbol,
violated criterion or rule, observed behavior, and required correction.

Record commands, working directories, results, and verification limits. A command that did not run, an empty test run,
or passing formatting cannot prove behavior. Do not execute deployment as verification or use unverified live-resource
targets.

## 4. Review engineering compliance

Inventory every added or behaviorally changed function, including relevant helpers and handlers. For each, record
applicable rule references and evidence for structure, naming, signatures, layer boundaries, errors/logging, and
documentation. Use the actual bundled standard: business services have required catch/log/rethrow behavior; other layers
have different catch guidance. Do not impose a blanket try/catch rule from another draft.

For each function requiring JSDoc, compare the implementation's meaningful operations and branches against its
documented responsibility, numbered process flow, parameters, result/effects, and meaningful failures. Explicitly
account for validation, lookups, decisions, side-effect ordering, recovery, and return behavior when present. Flag
missing behavior and incorrect ordering. Evaluate semantic coverage, not a minimum step count; do not pad simple
functions. For exempt helpers record the applicable exemption instead of inventing requirements.

Classify each criterion as pass, fail, blocked, or N/A with a reason and evidence. Syntax, lint, and types can establish
mechanical properties; semantic review remains necessary for business correctness and accurate comments. Self-review can
still miss defects.

## 5. Repair or advance

Any failed criterion prevents passage. Set status to repairing, retain concrete findings, and correct only those
findings and necessary consequences. Increment the repair count and repeat both reviews plus checks affected by the
repair. Retain finding history and closure evidence; do not replace it with a clean checklist.

After the repair limit, mark the item blocked and report remaining findings. Missing required verification also blocks
passage; distinguish completed implementation from unavailable verification. Do not advance dependent items. Independent
ready items may continue within scope, with only one active at a time. Never weaken acceptance criteria or silently mark
a failed requirement N/A to obtain a pass.

Mark passed only when every applicable criterion passes, findings are closed, and required checks have supporting
results. Record changed symbols and evidence, then select the next ready item. If new evidence invalidates a passed
item, reopen it and affected dependents, record the reason, and review/check them again; retain repair history.

## 6. Final feature gate

After local items pass, trace the whole requested flow across layers. Verify requirement coverage,
registration/configuration, shared contracts and consumers, relevant failure/recovery behavior, and absence of unrelated
changes. Run relevant feature-level existing checks; repeat earlier checks only when changes invalidate their results.
Review affected context/documentation.

Record final findings and create bounded repair items for cross-item issues. Use the same gates and finite budgets; do
not repeatedly create replacements for an exhausted finding. Report blocked work if no further authorized progress is
available.

The feature passes only when all required items and the final gate pass. Report outcome, actual checks/results, material
assumptions, unresolved findings, and record path. If code is implemented but required checks are unavailable, report
**implementation complete; verification blocked**. Do not claim measured reliability improvements without comparative
trials.
