// Jest setup file for CLI usage examples

// Set test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Optionally suppress console output during tests
  if (process.env.SUPPRESS_CONSOLE === 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  mockProcess: {
    exit: jest.fn(),
    cwd: jest.fn(() => process.cwd()),
    env: { ...process.env }
  }
};
