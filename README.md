# `bat-peasant`

> `bat-peasant` is a personalized coding-agent memory system packaged as a reusable project template.

This README documents the Bat-Peasant `v1.1.0-codex` persistent-context and activation contract.

The goal of this project is to help AI coding agents understand a repository before they modify it. Instead of acting
like a generic AI coding tool, `bat-peasant` gives the agent structured access to project context, engineering
standards, workflow rules, implementation examples, and technical documentation.

`bat-peasant` is designed to be language-agnostic. It can be used for TypeScript, Python, or any other codebase as long
as the repository-specific rules are documented inside the `.agents/` folder.

## Purpose

The main purpose of `bat-peasant` is to improve development speed, consistency, and reliability by giving an AI agent a
clear memory structure for each repository.

It should help with tasks such as:

- Implementing new features
- Fixing bugs
- Refactoring existing code
- Writing tests
- Generating documentation
- Reviewing code quality
- Understanding business logic
- Following repository-specific workflows
- Preserving existing architecture and coding patterns

## Core Idea

`bat-peasant` does not try to put every rule inside one huge prompt.

Instead, it separates persistent context into focused files and folders.

The root `AGENTS.md` file is the activation and routing entry point. Bat-Peasant activates only when a task contains the
exact marker `##bat-peasant`; tasks without this marker use normal agent behavior.

When activated, the agent reads detailed workflow guidance from `.agents/info.md` and selectively loads the relevant
context, rules, examples, docs, prompts, and metadata from `.agents/`.

## Folder Structure

```txt
.agents/
├── context/    # Business rules, domain flows, and shared behavior
├── docs/       # Internal libraries, APIs, tools, and technical references
├── examples/   # Canonical implementation examples
├── metadata/   # Architecture, project structure, stack, and version
├── plans/      # Generated implementation plans
├── prompts/    # Task-specific workflows and prompt templates
├── rules/      # Coding, layering, language, framework, and testing rules
└── skills/     # Available agent capabilities and skill metadata
AGENTS.md          # Activation and routing entry point
README.md
```

## How It Works

The agent starts from the root `AGENTS.md`. If the task contains the exact activation marker `##bat-peasant`, it reads
`.agents/info.md`, identifies the task type, and selectively loads the relevant files from `.agents/`.

For example:

```txt
Project structure -> .agents/metadata/
Business behavior -> .agents/context/
Implementation constraints -> .agents/rules/
Preferred patterns -> .agents/examples/
Task workflow -> .agents/prompts/
Complex-task plan -> .agents/plans/<task-name>.plan.md
```

The workflow guidance tells the agent which supporting persistent-context files to read before making changes.

This keeps `AGENTS.md` small and reusable while allowing each repository to define its own detailed behavior.

## Memory File Responsibilities

### `context/`

Stores project-specific context.

Use this for:

- Business rules
- Domain logic
- Product behavior
- Important project assumptions
- Repository-specific behavior

### `docs/`

Stores documentation for internal tools, packages, frameworks, and integrations.

Use this for:

- Internal package usage
- API client behavior
- Third-party integration notes
- Framework-specific instructions
- Repository-specific helper documentation

### `examples/`

Stores reference examples of good implementation patterns.

Use this for:

- Good service examples
- Good repository examples
- Good handler/controller examples
- Good test examples
- Bad patterns to avoid

### `prompts/`

Stores reusable prompts for common agent tasks.

Use this for:

- New feature prompts
- Debugging prompts
- Refactor prompts
- Documentation prompts
- Review prompts

### `rules/`

Stores repository-wide engineering standards.

Use this for:

- Naming standards
- Function standards
- Project structure standards
- Testing standards
- Error handling standards
- Review standards

### `metadata/`

Stores architecture, project structure, stack, and version information.

Use this for:

- Architecture metadata
- Repository structure
- Technology stack
- Bat-Peasant version information

### `plans/`

Stores generated implementation plans for complex tasks.

Use this for:

- Goals and scope
- Files to change
- Decisions and trade-offs
- Risks and dependencies
- Execution order
- Validation considerations

### `skills/`

Stores available agent capabilities and skill metadata.

## Design Principles

`bat-peasant` follows these principles:

- Keep `AGENTS.md` small and language-agnostic.
- Put task-specific instructions inside prompts.
- Put language-specific rules inside rules or docs.
- Put implementation style inside examples.
- Put business behavior inside context.
- Put architecture and project structure inside metadata.
- Keep memory files focused and easy to update.
- Prefer repository-specific knowledge over generic AI assumptions.
- Make the agent inspect before editing.
- Make the agent preserve existing project patterns.

## What `bat-peasant` Is Not

`bat-peasant` is not a full autonomous coding agent by itself.

- It is not tied to one programming language.
- It is language-agnostic, but it is not language-neutral.
- It is not only for Serverless projects.
- It is not a replacement for code review.
- It is not a place to dump random notes.
- It is a structured memory system that helps coding agents behave more consistently inside a repository.

## Expected Agent Behavior

A coding agent using `bat-peasant` should:

- Start from the root `AGENTS.md`
- Activate only when the task contains the exact marker `##bat-peasant`
- Read `.agents/info.md` and the relevant prompt files
- Follow the workflow instructions
- Inspect existing code before editing
- Use project examples before inventing new patterns
- Follow documented standards
- Respect existing architecture decisions
- Make the smallest safe change
- Suggest an update to `.agents/` when future agent behavior would be affected; do not modify it unless the task
  explicitly includes documentation maintenance
- Clearly summarize changes, validation, risks, and assumptions

## Memory Update Rule

When code changes affect future agent behavior, the related `.agents/` persistent-context file should be considered for
an explicit documentation-maintenance update.

Examples:

```txt
Business/domain behavior changed -> .agents/context/
Architecture or project structure changed -> .agents/metadata/
Reusable package behavior changed -> .agents/docs/
Preferred implementation pattern added -> .agents/examples/
Repository or testing rule changed -> .agents/rules/
Workflow changed -> .agents/prompts/
```

The `.agents/` folder should describe the current repository, not an idealized or outdated version of it.

## Goal

The long-term goal of `bat-peasant` is to make coding agents more useful by giving them a reliable, repository-aware
memory system.

A good `bat-peasant` setup should help an agent answer:

- What is this project?
- How should I work in this repository?
- What workflow should I follow for this task?
- What standards should I obey?
- What examples should I copy?
- What decisions should I respect?
- What files should I update if the system behavior changes?

When maintained properly, `bat-peasant` should make AI-assisted development faster, safer, and more consistent across
different codebases.
