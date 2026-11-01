# AGENTS.md

This repository uses bat-prompt-kit `v1.2.0-codex`

Activate bat-prompt-kit only when the task contains:

```text
@bat-kit
```

Otherwise, use normal agent behavior.

When activated

1. Read `.agents/info.md`.
2. Load only the context, rules, examples, metadata, and documentation relevant to the task.
3. Execute small, isolated tasks directly.
4. Create `.agents/plans/<three-digit-num>.<task-name>.plan.md` before complex or multi-file work.
5. Do not implement a plan until approved unless immediate execution was explicitly requested.
6. Follow the priority, applicability, and conflict rules in `.agents/info.md`.
7. Prefer applicable repository evidence over assumptions.
8. Keep changes focused and report actual validation performed.

> Context-first, plan-when-complex, execute-precisely.
