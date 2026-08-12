# Test rule prompt

```markdown
You are creating reusable testing rule templates for the `bat-prompt-kit` tool used by an AI coding agent (Codex).

### Goal

Produce a single, consistent, machine-readable testing rule structure that works for ANY testing library (Vitest, Jest, Playwright, Cypress, Mocha, etc.). The structure must be identical across libraries so the agent always generates persistent, predictable output.

### Process

1. First create a generic **Testing Rule Template**.
2. Then instantiate that template for **Vitest** as a concrete example.

### Required sections in the template (every rule must contain these in this order)

1. **Library Identification**
   - Name + version range
   - Primary purpose (unit, integration, e2e, component, etc.)

2. **File Location Conventions**
   - Where test files must live (e.g. `*.test.ts`, `__tests__/`, `tests/`, co-located, etc.)
   - Naming patterns
   - What is forbidden

3. **Required Setup Before Running Tests**
   - Dependencies / packages that must be installed
   - Config files that must exist
   - Environment variables or mocks that must be present
   - Project structure prerequisites

4. **Configuration**
   - Canonical config file name(s) and location
   - Minimal recommended configuration (with comments)
   - Key options the agent should always set or check

5. **How to Write Tests**
   - Import style
   - Test structure (describe / it / test blocks)
   - Assertion style
   - Mocking / stubbing conventions
   - Async handling
   - Snapshot / visual testing rules (if applicable)

6. **How to Run Tests**
   - Exact CLI commands (watch, coverage, specific file, etc.)
   - Recommended scripts for package.json
   - CI considerations

7. **Agent Behavior Rules**
   - When the agent should create new test files vs update existing ones
   - What the agent must never do
   - How the agent should respond when the user asks to “add tests” or “write tests for X”

8. **Output Format (strict)**
   The final rule must be emitted as a single Markdown block with the exact heading hierarchy above so it can be saved and reused consistently.

### Constraints

- The template itself must be library-agnostic.
- Every concrete rule (starting with Vitest) must strictly follow the same section order and heading names.
- Prefer concise, actionable, copy-pasteable guidance over long explanations.
- Assume a modern TypeScript/JavaScript project unless specified otherwise.

Start by outputting the generic Testing Rule Template, then immediately produce the filled-in Vitest version using that template.
```
