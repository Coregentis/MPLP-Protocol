// Jest setup file for Agent Orchestrator tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// Mock external dependencies that might not be available in test environment
jest.mock('@mplp/sdk-core', () => ({
  MPLPApplication: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined)
  })),
  Logger: jest.fn().mockImplementation((name) => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }))
}));

jest.mock('@mplp/orchestrator', () => ({
  MultiAgentOrchestrator: jest.fn().mockImplementation(() => ({
    registerAgent: jest.fn().mockResolvedValue(undefined),
    unregisterAgent: jest.fn().mockResolvedValue(undefined),
    executeWorkflow: jest.fn().mockResolvedValue('mock-execution-id')
  }))
}));

jest.mock('@mplp/agent-builder', () => ({
  AgentBuilder: jest.fn().mockImplementation((id) => ({
    withName: jest.fn().mockReturnThis(),
    withCapability: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({
      id,
      name: 'Mock Agent',
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      getStatus: jest.fn().mockReturnValue('running')
    })
  }))
}));

// Global test utilities
global.createMockLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
});

global.createMockConfig = () => ({
  name: 'Test Orchestrator',
  version: '1.1.0-beta',
  description: 'Test configuration',
  agents: [],
  workflows: [],
  orchestration: {
    maxConcurrentWorkflows: 5,
    maxConcurrentAgents: 10,
    resourceAllocation: {
      strategy: 'fair',
      priorities: {},
      limits: {
        cpu: 4,
        memory: 8192,
        storage: 51200,
        network: 1000
      }
    },
    failureHandling: {
      strategy: 'retry',
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential',
        baseDelay: 1000,
        maxDelay: 30000,
        jitter: true
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 5,
        recoveryTimeout: 60000,
        halfOpenMaxCalls: 3
      },
      failover: {
        enabled: false,
        strategy: 'active_passive',
        healthCheckInterval: 30000,
        switchoverTimeout: 10000
      }
    },
    communication: {
      protocol: 'http',
      serialization: 'json',
      compression: false,
      encryption: false,
      messageQueue: {
        type: 'redis',
        connection: {},
        topics: []
      }
    }
  },
  monitoring: {
    enabled: false,
    metrics: {
      enabled: false,
      interval: 60,
      retention: 86400,
      exporters: []
    },
    logging: {
      level: 'error',
      format: 'json',
      outputs: [],
      rotation: {
        enabled: false,
        maxSize: 100,
        maxFiles: 10,
        maxAge: 7
      }
    },
    alerting: {
      enabled: false,
      rules: [],
      channels: []
    },
    tracing: {
      enabled: false,
      sampler: {
        type: 'never',
        config: {}
      },
      exporters: []
    }
  },
  scaling: {
    enabled: false,
    strategy: 'manual',
    horizontal: {
      minReplicas: 1,
      maxReplicas: 5,
      targetCPU: 70,
      targetMemory: 80,
      scaleUpCooldown: 300,
      scaleDownCooldown: 600
    },
    vertical: {
      minCPU: 0.1,
      maxCPU: 2,
      minMemory: 128,
      maxMemory: 2048,
      scalingFactor: 1.5
    },
    predictive: {
      algorithm: 'linear_regression',
      lookbackPeriod: 3600,
      forecastPeriod: 1800,
      confidence: 0.8
    }
  },
  security: {
    authentication: {
      enabled: false,
      providers: [],
      tokenExpiry: 3600,
      refreshTokens: false
    },
    authorization: {
      enabled: false,
      model: 'rbac',
      roles: [],
      policies: []
    },
    encryption: {
      enabled: false,
      algorithm: 'AES-256-GCM',
      keyManagement: {
        provider: 'local',
        rotation: false,
        rotationInterval: 86400
      },
      dataEncryption: {
        atRest: false,
        inTransit: false,
        inMemory: false
      }
    },
    audit: {
      enabled: false,
      events: [],
      storage: {
        type: 'file',
        config: {}
      },
      retention: 2592000
    }
  }
});

// Increase timeout for integration tests
jest.setTimeout(30000);
