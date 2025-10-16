// Jest setup file for @mplp/agent-builder

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific log levels during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock agent for testing
  createMockAgent: () => ({
    id: 'test-agent-id',
    name: 'TestAgent',
    capabilities: ['test_capability'],
    status: 'idle',
    start: jest.fn(),
    stop: jest.fn(),
    destroy: jest.fn(),
  }),
  
  // Mock platform adapter for testing
  createMockPlatformAdapter: () => ({
    name: 'test-platform',
    version: '1.0.0',
    initialize: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    sendMessage: jest.fn(),
    onMessage: jest.fn(),
    getStatus: jest.fn(),
  }),
};

// Setup and teardown
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  jest.clearAllTimers();
});
