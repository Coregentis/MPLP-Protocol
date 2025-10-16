module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/adapters', '<rootDir>/examples', '<rootDir>/tools'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    'adapters/*/src/**/*.ts',
    'tools/*/src/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  moduleNameMapping: {
    '^@mplp/sdk-core$': '<rootDir>/packages/core/src',
    '^@mplp/agent-builder$': '<rootDir>/packages/agent-builder/src',
    '^@mplp/orchestrator$': '<rootDir>/packages/orchestrator/src',
    '^@mplp/cli$': '<rootDir>/packages/cli/src',
    '^@mplp/studio$': '<rootDir>/packages/studio/src',
    '^@mplp/dev-tools$': '<rootDir>/packages/dev-tools/src',
    '^@mplp/adapter-(.*)$': '<rootDir>/adapters/$1/src',
    '^@mplp/testing$': '<rootDir>/tools/testing/src'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  verbose: true,
  projects: [
    {
      displayName: 'core',
      testMatch: ['<rootDir>/packages/core/**/*.test.ts']
    },
    {
      displayName: 'agent-builder',
      testMatch: ['<rootDir>/packages/agent-builder/**/*.test.ts']
    },
    {
      displayName: 'orchestrator',
      testMatch: ['<rootDir>/packages/orchestrator/**/*.test.ts']
    },
    {
      displayName: 'cli',
      testMatch: ['<rootDir>/packages/cli/**/*.test.ts']
    },
    {
      displayName: 'adapters',
      testMatch: ['<rootDir>/adapters/**/*.test.ts']
    },
    {
      displayName: 'examples',
      testMatch: ['<rootDir>/examples/**/*.test.ts']
    }
  ]
};
