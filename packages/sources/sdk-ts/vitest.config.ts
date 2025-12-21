import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        alias: {
            '@mplp/core': path.resolve(__dirname, 'src/core'),
            '@mplp/runtime': path.resolve(__dirname, 'src/runtime'),
            '@mplp/utils': path.resolve(__dirname, 'src/utils'),
            '@mplp/types': path.resolve(__dirname, 'src/types'),
            '@mplp/runtime-minimal': path.resolve(__dirname, 'src/runtime-minimal'),
            '@mplp/integration-tools-generic': path.resolve(__dirname, 'src/integration-tools-generic'),
            '@mplp/integration-storage-kv': path.resolve(__dirname, 'src/integration-storage-kv'),
            '@mplp/integration-storage-fs': path.resolve(__dirname, 'src/integration-storage-fs'),
            '@mplp/coordination': path.resolve(__dirname, 'src/coordination'),
            '@mplp/integration-llm-http': path.resolve(__dirname, 'src/integration-llm-http'),
            '@mplp/sdk-ts': path.resolve(__dirname, 'src')
        }
    },
});
