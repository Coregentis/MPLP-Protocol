/**
 * Jest配置文件
 */
module.exports = {
  moduleNameMapper: {
    '^@public/(.*)$': '<rootDir>/src/public/$1',
    '^@internal/(.*)$': '<rootDir>/src/internal/$1',
    '^@core/(.*)$': '<rootDir>/src/public/modules/core/$1',
    '^@performance/(.*)$': '<rootDir>/src/public/performance/$1',
    '^@shared/(.*)$': '<rootDir>/src/public/shared/$1',
    '^@utils/(.*)$': '<rootDir>/src/public/utils/$1',
    '^@tests/(.*)$': '<rootDir>/tests/public/$1'
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      // isolatedModules已移至tsconfig.json (deprecated in ts-jest config)
      diagnostics: {
        warnOnly: true
      }
    }]
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  // 忽略工具文件，这些不是实际的测试文件
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'mock-typeorm-results\\.(ts|js)',
    'test-utils\\.(ts|js)'
  ],
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**/*',
    '!src/schemas/**/*',
    '!src/**/*.interface.ts'
  ]
};