# Metadata Configuration

## Owner-Configured Installation

The repository owner selects metadata during installation. Based on the project's architecture and technology stack,
copy only the applicable metadata pair into the installed `.agents/metadata/` directory.

The agent does not infer, download, or choose a profile at runtime. Presence in the installed directory is the
configuration mechanism.

Files under `variants/` are development inputs and are never installed metadata.

## Required Pair

The installed directory must contain exactly one project-structure file and one technology-stack file:

```text
<profile-id>.project-structure.md
<profile-id>.tech-stack.md
```

`<profile-id>` must be lowercase kebab-case and identical for both files. For example:

```text
typescript-serverless-monorepo.project-structure.md
typescript-serverless-monorepo.tech-stack.md
```

`README.md`, `template.project-structure.md`, and `template.tech-stack.md` are authoring assets and do not count as
installed metadata.

## Runtime Discovery

When Bat-Peasant is activated:

1. List `*.project-structure.md` files, excluding `template.project-structure.md`.
2. Require exactly one result.
3. Derive its `<profile-id>` from the filename.
4. Require `<profile-id>.tech-stack.md` in the same directory.
5. Confirm there are no other `*.tech-stack.md` files except `template.tech-stack.md`.
6. Load both files completely and record their paths with the task's relevant sources.

Do not inspect repository dependencies or structure to replace the owner's selection. Existing source code may clarify
implementation details, but it does not authorize switching metadata profiles.

## Configuration Errors

Stop profile-dependent work and report a configuration error when:

- No project-structure file exists.
- No matching technology-stack file exists.
- The two filenames use different profile IDs.
- Multiple project-structure or technology-stack candidates exist.
- A selected file is empty or unreadable.

State the discovered filenames and the expected pair. Ask the repository owner to install or remove metadata as needed.
Do not silently use a near match, `variants/`, or generic agent knowledge as replacement metadata.

Work that does not depend on architecture, stack, placement, framework, or profile-specific instructions may continue
using explicit task requirements and verified repository evidence.

## Metadata Content Contract

Metadata describes the configured repository architecture and technology facts. It does not own reusable coding mandates
or task procedure.

A project-structure file must document:

- Profile identity
- Root and workspace/deployable-unit organization
- Architectural flow and dependency direction
- Layer locations and responsibilities
- Shared-code and type/schema placement
- Infrastructure and configuration locations
- Structural naming and placement conventions

A technology-stack file must document:

- Profile identity
- Runtime, language, framework, cloud, workspace, and task-runner constraints
- Infrastructure and external service categories
- Shared and application library roles
- Package manager, build, test, lint, format, and local-development tooling

When a fact belongs in both files, state it once in the more specific file and link to it from the other.

## Separation from Other Sources

- Put reusable mandatory implementation behavior in `.agents/rules/`; metadata may link to it but must not redefine it.
- Put task steps, required inputs, and completion procedure in `.agents/prompts/`; metadata must not prescribe a task
  workflow.
- Put business behavior in `.agents/context/`.
- Put internal API usage in `.agents/docs/`.
- Put illustrative code shapes in `.agents/examples/`.

Metadata may state structural constraints necessary to describe the configured profile, such as dependency direction or
canonical locations.

## Authoring New Metadata

Use [`template.project-structure.md`](template.project-structure.md) and
[`template.tech-stack.md`](template.tech-stack.md) to create metadata for another project structure or stack, such as a
single Serverless application or a Java application.

1. Copy both templates.
2. Choose one descriptive lowercase kebab-case profile ID, such as `typescript-serverless-single-app` or
   `java-spring-single-app`.
3. Rename the copies to `<profile-id>.project-structure.md` and `<profile-id>.tech-stack.md`.
4. Replace every placeholder and remove every instructional comment.
5. Check all content against the target repository.
6. Remove reusable rules, task procedures, business context, API documentation, and examples that belong elsewhere.
7. Install only the completed matching pair needed by the target repository.

The templates are non-normative authoring tools. They contain no repository facts and must never be loaded as configured
metadata.
