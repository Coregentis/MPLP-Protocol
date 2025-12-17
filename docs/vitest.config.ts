import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.ts'],
    },
    esbuild: {
        // Bypass Docusaurus tsconfig, use ES2020 directly
        target: 'es2020',
    },
});
