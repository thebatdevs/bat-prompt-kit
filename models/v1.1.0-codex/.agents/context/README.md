# Persistent Context Guide

## Purpose and Boundary

Persistent context records curated, repository-specific current facts that affect business behavior, domain terminology,
entities, or feature workflows. Commit it so maintainers and activated agents share reviewable repository memory.

Context describes what this repository currently means or must do. It must not duplicate:

- Architecture, project layout, supported profiles, or stack declarations owned by `.agents/metadata/`
- Coding, framework, layering, or testing requirements owned by `.agents/rules/`
- Internal package, API, integration, or infrastructure references owned by `.agents/docs/`
- Implementation shapes owned by `.agents/examples/`
- Task history, status, decisions in progress, or execution details owned by `.agents/plans/` or version control
- Generated, session-local, or temporary information owned by `.agents/runtime/`

Link to an authoritative source instead of copying content owned elsewhere. Context may explain the repository-specific
business consequence of that source.

## Naming and Scope

Name context files:

```text
<domain>.<topic>.context.md
```

Use lowercase kebab-case for both segments, for example `billing.invoice-status.context.md`. One file should cover one
cohesive domain topic. Split a file when parts have different owners, sources, freshness schedules, or selection scopes.

Do not use generic names such as `notes.context.md`, `misc.context.md`, or `project.context.md`.

`README.md` and `_template.context.md` are reserved maintenance files, not selectable repository context.

## Required Format

Every context file must begin with YAML frontmatter containing:

```yaml
---
title: Human-readable topic
domain: lowercase-kebab-case
summary: One sentence describing when this context is relevant.
owners:
  - team-or-maintainer
sources:
  - path-or-stable-reference
last_verified: YYYY-MM-DD
review_by: YYYY-MM-DD
status: current
---
```

Required fields mean:

- `title`: clear name for the business or domain topic.
- `domain`: repository-specific selection scope matching the filename's first segment.
- `summary`: relevance signal; state the affected entity, behavior, or workflow.
- `owners`: one or more maintainers responsible for accuracy and review.
- `sources`: one or more authoritative repository paths or stable external references from which the facts can be
  verified.
- `last_verified`: date an owner checked the full file against every listed source.
- `review_by`: next date by which freshness must be reviewed.
- `status`: `current` for usable context or `retired` only during the removal workflow below.

After frontmatter, use these sections:

1. `## Applies When` — task intents, features, entities, or paths that make the file relevant.
2. `## Current Rules` — current business facts and behavior only.
3. `## Sources` — how each frontmatter source supports or can verify the rules.

Add `## Examples` or `## Open Questions` only when needed. Examples are explanatory and cannot introduce rules absent
from `Current Rules`. An open question is not an instruction; material uncertainty requires clarification.

## Selection

For each task:

1. Inspect context filenames and frontmatter `domain` and `summary`.
2. Select only files matching the affected domain, entity, behavior, workflow, or repository paths.
3. Confirm `status` is `current` and the current date is not later than `review_by`.
4. Read the selected files completely and verify material facts against their sources when the task depends on them.
5. Stop when the applicable business behavior is supported; do not load unrelated context for background.

A matching word alone does not establish relevance. Do not select a file when its `Applies When` scope excludes the
task.

## Creation and Validation

Create context only when a stable, repository-specific fact is expected to guide future work and has an authoritative
source and accountable owner. Do not create context from a single implementation session, an unapproved proposal,
speculation, or information already owned by another `.agents/` source class.

Before committing a context file, verify:

- Its filename and required fields follow this guide.
- Owners and sources are real and sufficiently specific.
- Every rule is supported by a listed source.
- Dates are valid and `review_by` is later than or equal to `last_verified`.
- It does not duplicate metadata, rules, docs, examples, plans, runtime output, or implementation history.
- Another current context file does not already own the topic.

The repository's normal review and validation workflow still applies.

## Freshness and Updates

Owners must review a context file on or before `review_by`, whenever a listed source changes materially, or when
implementation evidence contradicts it.

- If all facts remain current, update `last_verified` and set an appropriate future `review_by`.
- Replace changed or stale facts in place and update the supporting sources and verification dates.
- Append only a new current fact within the same topic, ownership, source, and freshness scope.
- Create a separate file when the new fact has a different topic, owner, source, or review cadence.
- Never preserve superseded facts as a changelog. Version control owns implementation and context history.

When a selected file is past `review_by`, treat it as stale. Verify it against its sources before relying on it. If
verification is not possible and the fact materially affects the task, report the stale context and request
clarification.

## Conflicts

When context conflicts with its listed source, repository behavior, or another applicable context file:

1. Do not merge or silently choose facts.
2. Identify the conflicting statements, sources, owners, and freshness dates.
3. Prefer the authoritative current source only when its ownership is unambiguous.
4. Ask the responsible owner to resolve any material ambiguity.
5. Replace the stale context after resolution and validate all affected context files.

The canonical instruction priority in `.agents/info.md` still governs conflicts between source classes.

## Retirement

Retire context when its behavior is removed, its source is no longer authoritative, or its content moves to the correct
metadata, rule, documentation, or example owner:

1. Set `status: retired` while preparing the change.
2. Identify and update incoming links or dependent context.
3. Move any still-current facts to the correct owner without duplicating them.
4. Delete the retired file in the same reviewed change.

Do not keep a retired-context archive under `.agents/context/`; version control preserves history.

## Template

Use [`_template.context.md`](_template.context.md) only as an authoring scaffold. It is non-normative, contains
placeholders rather than repository facts, and cannot add requirements beyond this guide.
