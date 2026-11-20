# Monorepo package `ts-configs`

- **Package:** `@motforex-monorepo-packages/ts-configs`
- **Version:** 1.0.0
- **Source:**
  [packages/ts-configs](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/ts-configs)
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

This package exports **no functions**. It offers three JSON compiler configurations for use in tsconfig.json via
`extends`.

| Export path                                           | Purpose                         | Main settings                                                                                                                                                                                                                       |
| ----------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@motforex-monorepo-packages/ts-configs/base.json`    | Shared strict compiler baseline | ES2022 target/lib plus DOM, esnext modules, bundler resolution, Node types, JSON modules, strict mode, exact optional properties, unchecked-index access checks, override/return/fallthrough checks, isolatedModules, skipLibCheck. |
| `@motforex-monorepo-packages/ts-configs/library.json` | Buildable shared packages       | Extends base; composite build, declarations and declaration maps, ESNext/Bundler, emission enabled.                                                                                                                                 |
| `@motforex-monorepo-packages/ts-configs/stack.json`   | Lambda stacks                   | Extends base; emission/source maps enabled, declarations disabled, `customConditions: ['@motforex/source']`.                                                                                                                        |

```json
{
  "extends": "@motforex-monorepo-packages/ts-configs/library.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"]
}
```

The package exports only the three explicit JSON subpaths; use one of them rather than a root module import. Consumers
still configure their own source/output directories, include patterns, and project references. Compiler ES2022 targeting
and the Serverless Node.js 24 runtime/build target are separate settings.
