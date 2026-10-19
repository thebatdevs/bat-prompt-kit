import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
  },
  fmt: {
    printWidth: 120,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: true,
    proseWrap: 'always',
    embeddedLanguageFormatting: 'auto',
    endOfLine: 'lf',
    sortPackageJson: false,
    ignorePatterns: [],
  },
});
