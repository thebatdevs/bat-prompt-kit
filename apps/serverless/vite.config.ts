import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    env: { AWS_REGION: 'ap-southeast-1', EXAMPLE_TABLE_NAME: 'bat-peasant-test-example-table' },
  },
});
