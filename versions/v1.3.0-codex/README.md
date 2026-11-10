# bat-prompt-kit v1.3.0-codex

A TypeScript serverless coding-agent bundle with sequential work items and explicit review/repair gates.

## Install

1. Merge this folder's `AGENTS.md` into the target repository's applicable instructions. Preserve existing instructions
   and resolve scope conflicts.
2. Copy this folder's `.agents/` contents into the target `.agents/`, merging existing files deliberately. Include
   `workflows/`, `templates/`, and `plans/` as well as the existing rules and selected skills.
3. Complete [the project profile](.agents/rules/project-profile.md) with verified repository facts, commands,
   references, and scoped exceptions. Its template values are not executable instructions.
4. Verify local paths and commands in the target repository. Retain the target's actual tooling and package manager.

The included [engineering standard](.agents/rules/ts.engineering-standard.md) remains authoritative for engineering
details. Its own version is independent of the bundle version. The
[workflow](.agents/workflows/sequential-implementation.md) defines how to execute and review work; it does not replace
those rules.

## Run a task

```text
Implement <behavior> in <package>.
Acceptance criteria: <observable outcomes and important failure cases>.
Use the sequential implementation workflow. Create a task record, execute one
bounded item at a time, review and repair it, then continue automatically within
this authorized scope. Run relevant existing checks. Report unresolved gates.
```

No activation marker is required for the backend scope covered by the entry point. Ordinary implementation requests do
not authorize generating tests; explicit requests to add tests do. Small isolated tasks may use one work item with the
same gates.

## Contents

- [Implementation plan](IMPLEMENTATION-PLAN.md): release scope and acceptance criteria.
- [Sequential workflow](.agents/workflows/sequential-implementation.md): states, review passes, repair budget, and final
  gate.
- [Task record template](.agents/templates/task-record.template.md): persistent progress and evidence.
- [Worked example](.agents/examples/sequential-task.example.md): a JSDoc omission and focused repair.
- [Adoption guide](.agents/rules/usage.md): engineering-standard setup.

Existing skills can implement the active item. Do not invoke a broad skill to perform future items ahead of their
dependencies. Skills remain subject to applicable instructions and review gates.

## Tune and resume

Start with one responsibility per item and two repair attempts. Record task-specific overrides before execution. Keep
tightly coupled contract changes together when separating them would leave an incoherent intermediate state. Split an
item when repeated findings show independent responsibilities; preserve requirement coverage and dependency links.

To resume, ask the agent to read `.agents/plans/<task-name>.md`, inspect the current diff, revalidate recorded evidence
against changes, and continue the first ready item. Review a completed item again when a later change invalidates its
assumptions or contracts.

Track first-pass findings, repairs per item, unresolved findings, and elapsed time across comparable tasks. This is an
instruction-driven loop in one session: Markdown cannot guarantee enforcement, separate fresh contexts, or correctness.
An external runner and deterministic rule checks are future extensions.

## Migration from v1.2.0

Keep the existing standard, project profile, and selected skills. Merge the updated entry point and adoption guide, and
add the workflow, task template, examples, and plans directory. Review scoped instruction changes before activation.

## Migration from v1.1.0

Merge rather than replace project context. Replace marker-based routing with the scoped entry point after reviewing
existing activation needs. Map applicable old rules and metadata into the standard and project profile; retain business
context and approved examples at their current paths and link them. Copy the workflow and template, preserve existing
plans, and verify references. Do not remove old guidance until conflicts and needed context are reconciled.
