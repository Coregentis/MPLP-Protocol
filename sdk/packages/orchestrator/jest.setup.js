// Jest setup file for @mplp/orchestrator
// Global test configuration and utilities

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
const originalConsole = { ...console };

beforeEach(() => {
  // Reset console mocks before each test
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.info = jest.fn();
  console.debug = jest.fn();
});

afterEach(() => {
  // Restore console after each test
  Object.assign(console, originalConsole);
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  // Create a delay for testing async operations
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create a mock function that can be awaited
  createAsyncMock: (returnValue, delay = 0) => {
    return jest.fn().mockImplementation(async (...args) => {
      if (delay > 0) {
        await global.testUtils.delay(delay);
      }
      return returnValue;
    });
  },
  
  // Create a mock function that throws an error
  createErrorMock: (error, delay = 0) => {
    return jest.fn().mockImplementation(async (...args) => {
      if (delay > 0) {
        await global.testUtils.delay(delay);
      }
      throw error;
    });
  }
};
