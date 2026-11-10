# v1.3.0-codex implementation plan

Status: implemented; behavioral task trials remain future evaluation.

## Goal

Make engineering-standard compliance reviewable through a sequential implementation, review, and repair loop. Preserve
the existing standard, project profile, skills, and explicit-test-generation policy.

## Delivery steps

1. Inspect the existing bundle and resolve its actual instruction paths. Use the bundled standard, not the different
   playground draft, as the rule authority.
2. Define bounded work items, dependency ordering, acceptance criteria, rule references, and evidence requirements.
3. Add a sequential workflow with separate behavioral and engineering review passes, bounded repairs, blocked states,
   and a final feature gate.
4. Supply a reusable task record and an illustrative task showing how to detect incomplete JSDoc.
5. Route the entry point and adoption guide to the workflow. Document installation, tuning, continuation, and
   limitations.
6. Check Markdown formatting, local links, diff consistency, and available repository checks. Record actual results in
   the delivery report.

## Acceptance criteria

- One item is active at a time; dependent items cannot advance through failed gates.
- Every requested requirement maps to a work item and final verification evidence.
- Changed functions are reviewed individually against applicable rules and actual behavior.
- Repair attempts have a finite limit and preserve unresolved findings.
- A resumed thread can recover scope, progress, dependencies, findings, and check results from the task record.
- Existing skills remain available without bypassing the work-item gates.
- Installation includes every required workflow/template file and retains target repository instructions.
- The documentation distinguishes instruction-driven execution from an enforced external runner.

## Scope and evaluation

This release adds Markdown orchestration; it does not implement an external controller, automated semantic JSDoc
validation, or new application tests. Assess quality later using comparable tasks: a small fix, multi-layer feature,
incomplete JSDoc, missing prerequisite, and exhausted repair budget. Compare first-pass omissions, repair rounds,
unresolved findings, and elapsed time against the current workflow. Documentation checks alone do not establish improved
coding performance.
