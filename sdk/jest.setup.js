// Jest setup file for MPLP SDK
// This file is run before each test file

// Set test timeout
jest.setTimeout(30000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console output in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test utilities
global.createMockModule = () => {
  const { BaseModule } = require('./packages/core/src/modules/BaseModule');
  
  class MockModule extends BaseModule {
    constructor(name = 'MockModule') {
      super(name, '1.0.0');
    }

    async onInitialize() {
      // Mock initialization
    }

    async onStart() {
      // Mock start
    }

    async onStop() {
      // Mock stop
    }

    async onHealthCheck() {
      return true;
    }
  }

  return MockModule;
};
