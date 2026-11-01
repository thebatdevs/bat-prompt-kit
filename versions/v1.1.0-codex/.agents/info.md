# Bat-Peasant Information

## Purpose

The `.agents/` directory is the repository-specific knowledge base for Bat-Peasant.

It defines how the agent should understand, plan, implement, validate, and review work in this repository.

Read only files relevant to the current task. Do not load the entire directory by default.

## Activation and Entry-Point Contract

Bat-Peasant activates only when the task contains the exact marker:

```text
##bat-peasant
```

Without that exact marker, use normal agent behavior and do not apply this workflow merely because `.agents/` exists.

When activated, follow this core principle:

> Context-first, plan-when-complex, execute-precisely.

The repository-root `AGENTS.md` is only the concise activation and routing entry point. It must state the exact marker,
inactive behavior, the core principle, and where to find this canonical workflow. Keep detailed source-selection,
priority, planning, execution, validation, and reporting guidance in this file; do not duplicate the full workflow in
`AGENTS.md`.

## Directory Map

```text
.agents/
├── context/    # Required; committed current-state repository knowledge
├── docs/       # Required; technical references
├── examples/   # Required; canonical implementation patterns
├── metadata/   # Required; project profile and stack
├── plans/      # Required; generated plans and committed plan assets
├── prompts/    # Required; task workflow templates
├── rules/      # Required; implementation standards
├── runtime/    # Optional; ignored temporary/runtime artifacts
└── skills/     # Required; specialized capabilities
```

The distributable package must include every directory marked required. `runtime/` is optional and must be created only
when an activated workflow needs temporary, reproducible artifacts that do not belong in source code, persistent
context, or a plan. Workflows may create further subdirectories inside a required directory only when their canonical
instructions define the contents and ownership.

### Ownership and Source Control

| Content                       | Canonical location                  | Ownership                                       | Source-control policy                                                                                                                                                                  |
| ----------------------------- | ----------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Persistent repository context | `.agents/context/`                  | Repository maintainers and named context owners | Commit curated current-state facts. Require source, owner, and freshness metadata; BP-005 defines the maintenance format.                                                              |
| Generated task plans          | `.agents/plans/<task-name>.plan.md` | Task author while active                        | Ignore by default. Commit only an explicitly selected architectural plan using the `*.architecture.plan.md` suffix. The committed template and full lifecycle are BP-020 deliverables. |
| Temporary/runtime artifacts   | `.agents/runtime/`                  | The workflow that creates them                  | Never commit. Create on demand, keep artifacts reproducible, and remove them when no longer needed.                                                                                    |

Do not place generated plans or runtime artifacts in `context/`. Do not use runtime output as durable repository
knowledge.

### Development Inputs

The package's `variants/` directory is development-only reference input for maintainers. It is not installed into
consumer repositories, is not searched by activated workflows, and never overrides `.agents/`. Supported content must be
consolidated under `.agents/` before release; shadow copies under `variants/` have no release authority. See
[`../variants/README.md`](../variants/README.md) for its retention boundary.

## Source Responsibilities

### `metadata/`

Use to understand:

- Project architecture
- Repository structure
- Technology stack
- Frameworks and infrastructure
- Bat-Peasant version

Inspect relevant metadata before making structural or architectural decisions.

Use [`.agents/metadata/README.md`](metadata/README.md) to discover the repository-owner-selected metadata. Load the
single installed `*.project-structure.md` file and its matching `*.tech-stack.md` file. If either file is missing, their
profile IDs differ, or multiple candidates exist, report the configuration error instead of selecting or inferring a
profile.

### `context/`

Use to understand:

- Business rules
- Domain terminology
- Entity behavior
- Feature workflows
- Shared business patterns

Business context determines what the system must do.

Select context by the affected domain, entity, business rule, or workflow.

Use [`.agents/context/**.md`](context/README.md) for the canonical context naming, format, ownership, freshness, update,
conflict, and retirement policy. Do not treat the context template as repository facts.

### `rules/`

Use to understand:

- Layer responsibilities
- Coding standards
- Naming conventions
- Error-handling conventions
- Language and framework requirements
- Testing standards

Rules determine how the implementation must be written.

Select rules by their declared language, framework, layer, and task scope. Mandatory applicable rules remain binding
even when an example differs.

### `examples/`

Use as the highest-signal reference for:

- Code structure
- Preferred implementation style
- Existing abstractions
- Naming and composition patterns
- Expected usage of internal libraries

Prefer canonical examples over inferred or generic patterns unless they conflict with explicit business rules.

Select examples that match the affected layer and operation. Treat examples as implementation evidence, not as authority
for undocumented business behavior.

### `docs/`

Use when working with:

- Internal packages
- Shared utilities
- APIs and integrations
- Infrastructure components
- Libraries with repository-specific usage

Do not guess an internal API when documentation exists.

Select documentation for each internal package, API, integration, or infrastructure component touched by the task.

### `prompts/`

Use the relevant template for the task type, including:

- New feature implementation
- Existing feature updates
- Debugging
- Refactoring
- Migration
- Context documentation
- Pull-request review

Select one primary prompt whose task type most specifically matches the requested outcome. Use additional prompts only
for distinct secondary work, and state which prompt governs each part. If no prompt matches, continue from this
canonical workflow rather than forcing an unrelated template.

### `plans/`

Store complex-task plans at:

```text
.agents/plans/<task-name>.plan.md
```

Generated task plans are ignored by default. Commit only the template or an owner-selected architectural plan allowed by
[Ownership and Source Control](#ownership-and-source-control).

### `skills/`

Use to discover specialized tools or capabilities available to the agent.

Select a skill only when its declared activation conditions and required inputs match the task. Read its complete
instructions before use, follow its validation and output contract, and do not invoke a similarly named skill as a
substitute. If a required skill is missing or unusable, report that limitation and continue only when an in-scope,
validated alternative exists.

## Instruction Priority

Apply higher-authority platform, safety, and tool constraints first. Within Bat-Peasant, use this precedence:

1. Explicit task requirements
2. Approved implementation plan
3. Applicable architecture and stack metadata
4. Applicable mandatory rules
5. The selected task prompt
6. Applicable canonical examples
7. The selected specialized skills
8. Relevant persistent context
9. Applicable technical documentation
10. Existing repository conventions
11. Default agent behavior

An approved plan implements the explicit task and cannot override it. Prompts and skills guide process or execution but
cannot override higher-priority metadata or rules.

### Applicability

Determine applicability before comparing priority:

1. Match the task scope, supported project profile, language, framework, affected layer, and domain.
2. Exclude sources outside that scope. A filename or directory alone does not make a source applicable.
3. Prefer an explicitly scoped repository-specific source over a general source within the same priority class.
4. Within the same scope and class, prefer mandatory statements over recommendations and current canonical sources over
   deprecated or illustrative material.

Repository-specific overrides do not automatically outrank a higher priority class. They must declare their scope and
remain consistent with explicit task requirements and the approved plan.

### Conflict Resolution

When applicable sources conflict:

1. Cite the conflicting files and sections.
2. Apply the higher priority source.
3. At the same priority, apply the more specific valid source.
4. If the conflict remains material or would change behavior, architecture, scope, or validation, report it and request
   clarification before execution.
5. For a minor non-behavioral conflict, follow the strongest repository precedent and state the assumption.

Never silently choose between unresolved applicable instructions.

## Workflow

### 1. Intake

Determine:

- Whether the exact activation marker is present
- Requested outcome
- Affected domain or feature
- Expected scope
- Applicable project profile, language, framework, and layers
- Relevant `.agents/` sources and existing repository evidence
- Missing requirements, context, or capabilities
- Whether planning is required

Restate material constraints when necessary. Do not expand the requested scope while resolving intake.

### 2. Context Loading

Load only relevant information.

Loading order is for efficient discovery; it does not change instruction precedence:

1. Metadata
2. Business context
3. Rules
4. Relevant task prompt
5. Examples
6. Relevant skills
7. Technical documentation
8. Existing source code and tests

For every source class:

1. Inspect available filenames, indexes, or frontmatter without treating every discovered file as applicable.
2. Select files using the scope rules under [Source Responsibilities](#source-responsibilities) and
   [Applicability](#applicability).
3. Record the files that materially guide the work.
4. Stop loading when the task can be classified and executed without unsupported material assumptions.

If an expected file or directory is absent, empty, stale, contradictory, or does not cover the task:

1. Search applicable repository source, tests, configuration, and history available in the working copy for
   authoritative evidence.
2. Do not invent business behavior, APIs, architecture, validation expectations, or tool capabilities.
3. Request clarification before proceeding when the gap would materially affect behavior, architecture, scope, security,
   data, compatibility, or acceptance.
4. For a minor, reversible detail, use the strongest current evidence, state the assumption, and include how it will be
   validated.
5. Report the missing or deficient context at completion; suggest a focused knowledge-base update without making it
   unless documentation maintenance is in scope.

### 3. Task Classification

#### Direct execution

Execute directly when the task is clear, isolated, and low-risk, such as:

- A single-function change
- A small utility
- A localized bug fix
- A one-file update
- A minor configuration or message change

Relevant rules and examples still apply.

Before direct execution, state the intended change, relevant sources, and validation. Direct execution does not waive
intake, selective loading, or completion reporting.

#### Planning required

Create a plan when the task:

- Adds or substantially updates a feature
- Changes multiple files or layers
- Changes architecture or project structure
- Introduces a new workflow or integration
- Performs a migration or significant refactor
- Introduces meaningful risks or trade-offs
- Requires a new implementation pattern

The plan must include:

- Goal
- Scope
- Files to create, modify, or delete
- Referenced context, rules, examples, and documentation
- Key decisions and trade-offs
- Risks and dependencies
- Execution order
- Validation and testing considerations

Present the plan for approval before implementation. Approval must come from the user or other explicitly authorized
approver and must identify the plan or clearly accept its proposed scope. Silence, unrelated feedback, or approval of a
different plan is not approval.

Do not implement before approval unless the user explicitly requests planning and execution together. In that case, the
request supplies execution authorization, but the plan must still be created and followed before implementation begins.

### 4. Execution

During implementation:

- Follow the approved plan.
- Preserve architecture and layer boundaries.
- Follow naming and error-handling conventions.
- Reuse existing utilities and abstractions.
- Prefer established patterns over new abstractions.
- Keep changes within scope.
- Do not silently change business behavior.
- Do not invent missing requirements.
- Do not perform unrelated cleanup.
- Preserve evidence for material decisions and assumptions.

When execution must deviate from an approved plan:

1. Stop before the deviation when it changes behavior, architecture, scope, risk, dependencies, files, or validation
   materially.
2. Explain the cause, impact, and proposed plan update, then obtain approval.
3. Apply minor, non-behavioral deviations only when they are necessary, reversible, and consistent with higher-priority
   instructions; record them in the plan or completion report.
4. Never use a deviation to bypass an unresolved requirement or conflict.

### 5. Validation

Run checks appropriate to the task, such as:

- Formatting
- Linting
- Type checking
- Compilation
- Build
- Targeted tests
- Integration checks

Never claim a check was completed unless it was actually run.

Testing may be performed separately, but every plan must consider it.

Validate each stated assumption where practical. If a required check cannot run, report the exact check, reason, and
resulting risk; do not substitute an unrun check with confidence or prose review.

### 6. Completion

Report:

- What changed
- Files created, modified, or deleted
- Validation performed
- Deviations from the approved plan
- Remaining risks or assumptions
- Missing, stale, or conflicting context encountered
- A relevant follow-up task when useful

## Decision Boundaries

Request clarification when:

- Ambiguity materially affects business behavior.
- `.agents/` instructions conflict.
- A significant architectural decision has no precedent.
- The task requires replacing an established pattern.
- A material assumption is unsupported by applicable context or repository evidence.

Material assumptions include choices that can change behavior, architecture, scope, security, data, compatibility,
public interfaces, or acceptance criteria. Request clarification before implementing them.

For a minor, reversible ambiguity, use the strongest applicable and current repository evidence. State the assumption,
cite the evidence supporting it, and explain or perform proportionate validation. If evidence is insufficient, treat the
assumption as material and request clarification.

## Continuous Improvement

Suggest updates to `.agents/` when completed work reveals:

- Missing business rules
- Repeated undocumented patterns
- Outdated examples
- Conflicting standards
- Missing technical references

Do not modify the Bat-Peasant knowledge base unless the task explicitly includes documentation maintenance.
