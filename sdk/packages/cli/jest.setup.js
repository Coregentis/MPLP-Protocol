/**
 * Jest setup file for @mplp/cli
 */

// Global test utilities
global.testUtils = {
  createMockFS: () => ({
    existsSync: jest.fn(),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
    mkdirSync: jest.fn(),
    readdirSync: jest.fn()
  }),
  
  createMockInquirer: () => ({
    prompt: jest.fn()
  }),
  
  createMockSpinner: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    succeed: jest.fn(),
    fail: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
  })
};

// Mock external dependencies that might cause issues in tests
jest.mock('ora', () => {
  return jest.fn(() => global.testUtils.createMockSpinner());
});

jest.mock('inquirer', () => global.testUtils.createMockInquirer());



// Suppress console output during tests unless explicitly needed
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Restore console for specific tests that need it
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Helper to create temporary directories for testing
global.createTempDir = () => {
  const os = require('os');
  const path = require('path');
  const fs = require('fs');
  
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mplp-cli-test-'));
  return tempDir;
};

// Cleanup helper
global.cleanup = (paths) => {
  const fs = require('fs');
  paths.forEach(path => {
    if (fs.existsSync(path)) {
      fs.rmSync(path, { recursive: true, force: true });
    }
  });
};
