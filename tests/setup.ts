import 'reflect-metadata';
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);

// Mock Date for consistent testing
const MOCK_DATE = new Date('2024-01-01T00:00:00.000Z');
const originalDate = Date;

beforeEach(() => {
  // Mock Date.now() and new Date()
  const mockDate = jest.spyOn(global, 'Date').mockImplementation(((...args: any[]) => {
    if (args.length === 0) {
      return MOCK_DATE as any;
    }
    return new originalDate(...(args as ConstructorParameters<typeof Date>)) as any;
  }) as any);
  
  mockDate.now = jest.fn(() => MOCK_DATE.getTime()) as any;
  mockDate.UTC = originalDate.UTC as any;
  mockDate.parse = originalDate.parse as any;
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllTimers();
});

// Mock external services
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
  })),
}));

// Mock database connection
jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  createConnection: jest.fn(),
  getConnection: jest.fn(),
  getRepository: jest.fn(),
}));

// Mock external HTTP requests
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  })),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
}));

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidTimestamp(): R;
      toMatchMPLPProtocol(): R;
    }
  }
}

// Custom Jest matchers for MPLP
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },
  
  toBeValidTimestamp(received: string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime()) && received.includes('T') && received.includes('Z');
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ISO timestamp`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ISO timestamp`,
        pass: false,
      };
    }
  },
  
  toMatchMPLPProtocol(received: any) {
    const hasVersion = received.version && typeof received.version === 'string';
    const hasTimestamp = received.timestamp && typeof received.timestamp === 'string';
    const pass = hasVersion && hasTimestamp;
    
    if (pass) {
      return {
        message: () => `expected object not to match MPLP protocol structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected object to have version and timestamp properties`,
        pass: false,
      };
    }
  },
});

// Silence console output during tests (unless LOG_TESTS=true)
if (process.env.LOG_TESTS !== 'true') {
  const mockConsole = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
  
  Object.assign(global.console, mockConsole);
} 