// Jest setup file for workflow-automation example

// Set test timeout
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
const originalConsole = global.console;

beforeEach(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: originalConsole.error, // Keep error for debugging
  };
});

afterEach(() => {
  global.console = originalConsole;
});

// Global test utilities
global.createMockTicket = (overrides = {}) => ({
  id: 'TICKET-001',
  customerId: 'CUST-12345',
  content: 'Test ticket content',
  priority: 'medium',
  status: 'open',
  createdAt: new Date(),
  ...overrides
});

global.createMockCustomer = (overrides = {}) => ({
  id: 'CUST-12345',
  name: 'Test Customer',
  email: 'test@example.com',
  tier: 'standard',
  ...overrides
});
