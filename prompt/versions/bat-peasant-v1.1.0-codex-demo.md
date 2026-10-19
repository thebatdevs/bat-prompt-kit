# Bat-peasant `v1.1.0-codex` workflow

I have $20 ChatGPT plus subscription. That makes me able to use Codex as my coding agent tool.

So I have this idea that try to make codex work like me.

Current problem is that codex is not writing code like me. I work with typescript, python, java and go with lot of
different project structure with different standards. And when i ask codex to write a code it writes a proper functional
code. However its not suitable for that exact codebases style.

So i decided to create `/.agent` folder with following information for example

```text
.agents/
├── context/                   # Core business rules and domain logic memory
│   ├── create-entity.md
│   ├── update-entity.md
│   └── common-patterns.md
├── docs/                             # Documentation and technical references, library, other required references.
│   ├── dynamo-command-builder.md
│   ├── libs-package.md
│   ├── schemas-package.md
│   └── custom-axios.md
├── examples/                         # Code examples and usage patterns
│   ├── dynamo-client.md
│   ├── dynamo-repository.md
│   ├── dynamo-service.md
│   └── patterns.md
├── metadata/                         # Project information and configuration
│   ├── project-structure.md
│   ├── tech-stack.md
│   └── version.json
├── prompts/                          # AI prompt templates for development tasks
│   ├── feature/
│   │   ├── implement-new.md
│   │   └── update-existing.md
│   ├── maintenance/
│   │   ├── debug.md
│   │   ├── context-documentation.md
│   │   ├── refactor.md
│   │   └── migration.md
│   ├── review-pull-request.md
│   └── templates/
├── rules/                            # Coding standards and project rules
│   ├── service-layer-standard.md
│   ├── repository-layer-standard.md
│   ├── typescript-coding-standards.md
│   ├── typescript-testing.md
│   ├── typescript.md
│   └── typescript-serverless.md
└── skills/                           # Tools and capabilities
    └── skill-manifest.json
AGENTS.md                         # Main agent documentation & index
```

The `.agent` folder contains a group of markdowns that tells codex about my preference for this repository. All this
markdown files must be language agnostic, which means each of the markdowns might be used with other programming
languages and other type of repository. The current example above is for serverless stack's `.agent` folder example. So
this setup must work with python project (if we change the /rules/typescript.md and tech-stack)\*

## Example use case of this project

Lets assume i asked codex to do TASK_A. Codex then determines if it needs planning or not. If the task is small (just
one function.. etc), codex executes the task directly. And if the task updates multiple functions, multiple files, or if
it asks to implement new feature, codex must first create an executable step by step plan .mn in `.agents/plan` folders
and ask to user to review it. After user's approval codex executes the exact plan with additional context from
`.agents/rules` folder's context.

Every implementation does not require testing and testing will be implemented in another codex thread.

## List of most frequent use cases

- Implementing new feature
- Update the existing feature
- Fix and debug existing new feature
- Review pull request for the codebase
- Refactor the existing codebase section (Local refactor, migration refactor, small function refactor, whole project
  refactor)
- Refactor the external repository to the current codebase
- Analyzing the current flow
- Write a test for certain piece of codebase.
- Write a small utility function.

Please let me know if this idea is valid and worth to implement
