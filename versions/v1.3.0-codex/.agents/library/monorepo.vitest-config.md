# Monorepo package `vitest-config`

- **Import:** `@motforex-monorepo-packages/vitest-config`
- **Version:** 1.0.0
- **Source:**
  [packages/vitest-config](/Users/thedashpuntsag/Documents/Repositories/motforex/serverless/stock-finance-sls-monorepo/packages/vitest-config)
- **Entry:** `src/index.ts`.
- **Verified snapshot:** 2026-11-21; see [package index](./monorepo.index.md).

## Function

| Function                | Input                             | Output                            | Behavior                                                                                                               |
| ----------------------- | --------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `defineStackTestConfig` | `options: StackTestConfigOptions` | `ViteUserConfig` from `vite-plus` | Builds shared Node/Vitest configuration with source resolution, stack alias, environment setup, and coverage settings. |

`StackTestConfigOptions` contains required `rootDir: string` and optional `include: string[]`, `setupFiles: string[]`,
`overrides: ViteUserConfig`.

## Defaults and override behavior

- Discovery: `test/**/*.test.ts`, `src/**/*.test.ts`; Node environment. Excludes node_modules, dist, .serverless,
  .build, and _warmup directories.
- Files matching `**/*.integration.test.ts` are excluded unless `VITEST_INTEGRATION === 'true'`. This flag is read at
  module import time.
- Alias `@` resolves to `<rootDir>/src`. Vite and SSR conditions include `@motforex/source`, `node`, and
  `development|production` so tests resolve workspace sources.
- Setup runs the bundled `src/setup-env.ts` build counterpart (`setup-env.js` URL), followed by supplied setup paths
  resolved relative to rootDir. Setup loads optional `.env.test` then `.env` from **process.cwd()**, preserving earlier
  environment values. It does not use rootDir for environment-file lookup.
- Coverage uses v8 with text/html reporters and excludes tests, type files, serverless.ts, vitest.config.ts, and
  build/dependency directories.
- Only `overrides.test`, `overrides.resolve`, and `overrides.ssr` are merged; other top-level Vite override fields are
  ignored by this function. Each section spreads last, so nested defaults such as alias/setupFiles can be replaced
  wholesale.

There are no other public functions. `src/setup-env.ts` runs setup side effects and is not a package export. Defining
this configuration does not itself run tests or invoke AWS; included integration tests may invoke real AWS when enabled.
