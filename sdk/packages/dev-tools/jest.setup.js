/**
 * Jest setup file for MPLP Dev Tools
 */

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup global test utilities
global.testUtils = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  createMockConfig: () => ({
    enabled: true,
    logLevel: 'info',
    port: 3002
  }),
  
  createMockMetric: (name = 'test-metric', value = 100) => ({
    name,
    value,
    timestamp: new Date(),
    tags: { test: 'true' }
  })
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
