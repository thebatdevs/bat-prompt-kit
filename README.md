# `bat-peasant`

> `bat-peasant` is a personalized coding-agent memory system packaged as a reusable project template.

The goal of this project is to help AI coding agents understand a repository before they modify it. Instead of acting
like a generic AI coding tool, `bat-peasant` gives the agent structured access to project context, engineering
standards, workflow rules, implementation examples, technical decisions, and maintenance guides.

`bat-peasant` is designed to be language-agnostic. It can be used for TypeScript, Python, or any other codebase as long
as the repository-specific rules are documented inside the `code/.bat-peasant/` folder.

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

Instead, it separates agent memory into focused files and folders.

The `code/AGENTS.md` file acts as the entrypoint. It tells the agent how to use the `code/.bat-peasant/` folder.

The `code/.bat-peasant/workflow/` files define task-specific execution flows. Each workflow file is responsible for
listing which context, standards, examples, docs, prompts, and decisions should be read for that task.

## Folder Structure

```txt
code/
├── .bat-peasant/
│   ├── context/ # Project-specific business, domain, and product context
│   ├── decisions/ # Architecture and technical decisions
│   ├── docs/ # Internal package, tool, framework, and integration documentation
│   ├── examples/ # Reference examples of preferred implementation patterns
│   ├── maintenance/ # Guides for keeping memory files accurate and up to date
│   ├── metadata/ # Memory-system metadata
│   ├── prompts/ # Reusable task prompts
│   ├── standards/ # Coding, naming, project structure, testing, and review standards
│   ├── testing/ # Test framework setup, test patterns, and test examples
│   └── workflow/ # Step-by-step workflows for common engineering tasks
├── .github/
│   └── copilot-instructions.md
└── AGENTS.md

docs/
markdown/
prompt/
README.md
```

## How It Works

The agent starts from `code/AGENTS.md`.

Then it identifies the task type and reads the matching workflow file from `code/.bat-peasant/workflow/`.

For example:

```txt
New feature -> code/.bat-peasant/workflow/new-feature.workflow.md
Bug fix -> code/.bat-peasant/workflow/debug.workflow.md
Small refactor -> code/.bat-peasant/workflow/local-refactor.worflow.md
Large refactor -> code/.bat-peasant/workflow/external-refactor.workflow.md
Testing feature -> code/.bat-peasant/workflow/testing.workflow.md
```

The workflow file then tells the agent which supporting memory files to read before making changes.

This keeps `code/AGENTS.md` small and reusable while allowing each repository to define its own detailed behavior.

## Memory File Responsibilities

### `context/`

Stores project-specific context.

Use this for:

- Business rules
- Domain logic
- Product behavior
- Important project assumptions
- Repository-specific behavior

### `decisions/`

Stores architecture and technical decisions.

Use this for:

- Architecture decisions
- Tradeoff explanations
- Deprecated patterns
- Chosen technical direction
- Reasons behind important implementation choices

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

### `maintanence/`

Stores guides for keeping the memory system accurate.

Use this for:

- Checking whether code follows standards
- Syncing business logic documentation
- Updating memory files after code changes
- Preventing `code/.bat-peasant/` from becoming outdated

### `prompts/`

Stores reusable prompts for common agent tasks.

Use this for:

- New feature prompts
- Debugging prompts
- Refactor prompts
- Documentation prompts
- Review prompts

### `standards/`

Stores repository-wide engineering standards.

Use this for:

- Naming standards
- Function standards
- Project structure standards
- Testing standards
- Error handling standards
- Review standards

### `testing/`

Stores testing-specific rules and examples.

Use this for:

- Test framework setup
- Mocking rules
- Integration test patterns
- Unit test patterns
- Test data conventions

### `workflow/`

Stores task-specific workflows.

Use this for:

- New feature workflow
- Debug workflow
- Local refactor workflow
- External refactor workflow
- Code review workflow
- Documentation workflow

## Design Principles

`bat-peasant` follows these principles:

- Keep `code/AGENTS.md` small and language-agnostic.
- Put task-specific instructions inside workflow files.
- Put language-specific rules inside standards or docs.
- Put implementation style inside examples.
- Put business behavior inside context.
- Put architecture reasoning inside decisions.
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

- Start from `code/AGENTS.md`
- Read the relevant workflow file
- Follow the workflow instructions
- Inspect existing code before editing
- Use project examples before inventing new patterns
- Follow documented standards
- Respect existing architecture decisions
- Make the smallest safe change
- Update `code/.bat-peasant/` memory when future agent behavior would be affected
- Clearly summarize changes, validation, risks, and assumptions

## Memory Update Rule

When code changes affect future agent behavior, the related `code/.bat-peasant` memory file should be updated.

Examples:

```txt
Business/domain behavior changed -> code/.bat-peasant/context/
Architecture decision changed -> code/.bat-peasant/decisions/
Reusable package behavior changed -> code/.bat-peasant/docs/
Preferred implementation pattern added -> code/.bat-peasant/examples/
Repository standard changed -> code/.bat-peasant/standards/
Testing pattern changed -> code/.bat-peasant/testing/
Workflow changed -> code/.bat-peasant/workflow/
```

The `code/.bat-peasant` folder should describe the current repository, not an idealized or outdated version of it.

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
