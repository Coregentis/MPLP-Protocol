/**
 * Extension模块测试数据工厂
 *
 * @description 为Extension模块测试提供标准化的测试数据生成工具
 * @version 1.0.0
 * @layer 测试层 - 数据工厂
 * @pattern 与Context、Plan、Role、Confirm模块使用IDENTICAL的数据工厂模式
 */

import { 
  ExtensionEntityData, 
  ExtensionType, 
  ExtensionStatus,
  ExtensionCompatibility,
  ExtensionConfiguration,
  ExtensionPoint,
  ApiExtension,
  EventSubscription,
  ExtensionLifecycle,
  ExtensionSecurity,
  ExtensionMetadata,
  CreateExtensionRequest,
  UpdateExtensionRequest
} from '../../../src/modules/extension/types';
import { UUID } from '../../../src/shared/types';

/**
 * 生成测试用的UUID
 */
export function generateTestUUID(prefix: string = 'test'): UUID {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as UUID;
}

/**
 * 创建Schema格式的Extension测试数据 (snake_case)
 * 用于测试Controller返回的Schema格式数据
 */
export function createMockExtensionSchema(overrides: any = {}): any {
  const baseSchema = {
    extension_id: generateTestUUID('ext'),
    context_id: generateTestUUID('ctx'),
    name: 'test-extension',
    display_name: 'Test Extension',
    description: 'Test extension for unit testing',
    version: '1.0.0',
    extension_type: 'plugin',
    status: 'inactive',
    protocol_version: '1.0.0',
    timestamp: new Date().toISOString(),
    ...overrides
  };

  return baseSchema;
}

/**
 * 创建基础的ExtensionEntityData测试数据
 */
export function createMockExtensionEntityData(overrides: Partial<ExtensionEntityData> = {}): ExtensionEntityData {
  const baseData: ExtensionEntityData = {
    extensionId: generateTestUUID('ext'),
    contextId: generateTestUUID('ctx'),
    name: 'test-extension',
    displayName: 'Test Extension',
    description: 'Test extension for unit testing',
    version: '1.0.0',
    extensionType: 'plugin' as ExtensionType,
    status: 'inactive' as ExtensionStatus,
    protocolVersion: '1.0.0',
    timestamp: new Date().toISOString(),
    compatibility: createMockExtensionCompatibility(),
    configuration: createMockExtensionConfiguration(),
    extensionPoints: [createMockExtensionPoint()],
    apiExtensions: [createMockApiExtension()],
    eventSubscriptions: [createMockEventSubscription()],
    lifecycle: createMockExtensionLifecycle(),
    security: createMockExtensionSecurity(),
    metadata: createMockExtensionMetadata(),
    auditTrail: {
      events: [],
      complianceSettings: {
        retentionPeriod: 365,
        encryptionRequired: false,
        auditLevel: 'standard'
      }
    },
    performanceMetrics: {
      activationLatency: 100,
      executionTime: 50,
      memoryFootprint: 1024,
      cpuUtilization: 5,
      networkLatency: 10,
      errorRate: 0,
      throughput: 100,
      availability: 99.9,
      efficiencyScore: 95,
      healthStatus: 'healthy',
      alerts: []
    },
    monitoringIntegration: {
      providers: ['prometheus'],
      endpoints: [],
      dashboards: [],
      alerting: {
        enabled: true,
        channels: ['email'],
        thresholds: {
          errorRate: 5,
          responseTime: 1000,
          availability: 95
        }
      }
    },
    versionHistory: {
      versions: [],
      autoVersioning: {
        enabled: false,
        strategy: 'semantic',
        triggers: ['api_change']
      }
    },
    searchMetadata: {
      indexedFields: ['name', 'description', 'keywords'],
      searchStrategies: [],
      facets: []
    },
    eventIntegration: {
      eventBus: {
        provider: 'internal',
        connectionString: '',
        topics: []
      },
      eventRouting: {
        rules: [],
        defaultRoute: 'default'
      },
      eventTransformation: {
        enabled: false,
        rules: []
      }
    }
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建ExtensionCompatibility测试数据
 */
export function createMockExtensionCompatibility(overrides: Partial<ExtensionCompatibility> = {}): ExtensionCompatibility {
  const baseData: ExtensionCompatibility = {
    mplpVersion: '1.0.0',
    requiredModules: ['context', 'plan'],
    dependencies: [
      {
        name: 'test-dependency',
        version: '1.0.0',
        optional: false,
        reason: 'Required for testing'
      }
    ],
    conflicts: []
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建ExtensionConfiguration测试数据
 */
export function createMockExtensionConfiguration(overrides: Partial<ExtensionConfiguration> = {}): ExtensionConfiguration {
  const baseData: ExtensionConfiguration = {
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        maxConnections: { type: 'number' }
      }
    },
    currentConfig: {
      enabled: true,
      maxConnections: 100
    },
    defaultConfig: {
      enabled: false,
      maxConnections: 50
    },
    validationRules: [
      {
        field: 'enabled',
        type: 'boolean',
        required: true
      },
      {
        field: 'maxConnections',
        type: 'number',
        required: false,
        minimum: 1,
        maximum: 1000
      }
    ]
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建ExtensionPoint测试数据
 */
export function createMockExtensionPoint(overrides: Partial<ExtensionPoint> = {}): ExtensionPoint {
  const baseData: ExtensionPoint = {
    id: 'test-hook',
    name: 'Test Hook',
    type: 'hook',
    description: 'Test extension point for unit testing',
    parameters: [
      {
        name: 'data',
        type: 'object',
        required: true,
        description: 'Test data parameter'
      },
      {
        name: 'options',
        type: 'object',
        required: false,
        description: 'Optional configuration',
        defaultValue: {}
      }
    ],
    returnType: 'boolean',
    async: false,
    timeout: 5000,
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: 'exponential',
      initialDelay: 1000,
      maxDelay: 10000,
      retryableErrors: ['TIMEOUT', 'CONNECTION_ERROR']
    },
    conditionalExecution: {
      condition: 'data.enabled === true',
      parameters: { enabled: true }
    },
    executionOrder: 1
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建ApiExtension测试数据
 */
export function createMockApiExtension(overrides: Partial<ApiExtension> = {}): ApiExtension {
  const baseData: ApiExtension = {
    endpoint: '/api/test',
    method: 'GET',
    handler: 'testHandler',
    middleware: ['auth', 'validation'],
    authentication: {
      required: true,
      schemes: ['bearer'],
      permissions: ['read:test']
    },
    rateLimit: {
      enabled: true,
      requestsPerMinute: 100,
      burstSize: 10,
      keyGenerator: 'ip'
    },
    validation: {
      requestSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      responseSchema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' }
        }
      },
      strictMode: true
    },
    documentation: {
      summary: 'Test API endpoint',
      description: 'Test API endpoint for unit testing',
      tags: ['test', 'api'],
      examples: [
        {
          name: 'Success Example',
          description: 'Successful API call',
          request: { id: 'test-123' },
          response: { success: true, data: { result: 'ok' } }
        }
      ]
    }
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建EventSubscription测试数据
 */
export function createMockEventSubscription(overrides: Partial<EventSubscription> = {}): EventSubscription {
  const baseData: EventSubscription = {
    eventPattern: 'test.*',
    handler: 'testEventHandler',
    filterConditions: [
      {
        field: 'type',
        operator: 'eq',
        value: 'test'
      },
      {
        field: 'priority',
        operator: 'gte',
        value: 'medium'
      }
    ],
    deliveryGuarantee: 'at_least_once',
    deadLetterQueue: {
      enabled: true,
      maxRetries: 3,
      retentionPeriod: 86400
    },
    retryPolicy: {
      maxAttempts: 3,
      backoffStrategy: 'exponential',
      initialDelay: 1000,
      maxDelay: 30000,
      retryableErrors: ['TIMEOUT', 'CONNECTION_ERROR', 'SERVICE_UNAVAILABLE']
    },
    batchProcessing: {
      enabled: true,
      batchSize: 10,
      flushInterval: 5000
    }
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建ExtensionLifecycle测试数据
 */
export function createMockExtensionLifecycle(overrides: Partial<ExtensionLifecycle> = {}): ExtensionLifecycle {
  const baseData: ExtensionLifecycle = {
    installDate: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    activationCount: 1,
    errorCount: 0,
    performanceMetrics: {
      averageResponseTime: 50,
      throughput: 100,
      errorRate: 0,
      memoryUsage: 1024,
      cpuUsage: 5,
      lastMeasurement: new Date().toISOString()
    },
    healthCheck: {
      enabled: true,
      interval: 30000,
      timeout: 5000,
      endpoint: '/health',
      expectedStatus: 200,
      healthyThreshold: 2,
      unhealthyThreshold: 3
    }
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建ExtensionSecurity测试数据
 */
export function createMockExtensionSecurity(overrides: Partial<ExtensionSecurity> = {}): ExtensionSecurity {
  const baseData: ExtensionSecurity = {
    sandboxEnabled: true,
    resourceLimits: {
      maxMemory: 100 * 1024 * 1024, // 100MB
      maxCpu: 50, // 50%
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxNetworkConnections: 10,
      allowedDomains: ['api.example.com', 'cdn.example.com'],
      blockedDomains: ['malicious.com']
    },
    codeSigning: {
      required: true,
      trustedSigners: ['trusted-signer-1', 'trusted-signer-2'],
      verificationEndpoint: 'https://verify.example.com/api/verify'
    },
    permissions: {
      fileSystem: {
        read: ['/tmp', '/var/log'],
        write: ['/tmp'],
        execute: []
      },
      network: {
        allowedHosts: ['api.example.com'],
        allowedPorts: [80, 443],
        protocols: ['http', 'https']
      },
      database: {
        read: ['public_data'],
        write: ['user_data'],
        admin: []
      },
      api: {
        endpoints: ['/api/public/*'],
        methods: ['GET', 'POST'],
        rateLimit: 100
      }
    }
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建ExtensionMetadata测试数据
 */
export function createMockExtensionMetadata(overrides: Partial<ExtensionMetadata> = {}): ExtensionMetadata {
  const baseData: ExtensionMetadata = {
    author: {
      name: 'Test Author',
      email: 'test@example.com',
      url: 'https://example.com/author'
    },
    organization: {
      name: 'Test Organization',
      url: 'https://example.com',
      email: 'contact@example.com'
    },
    license: {
      type: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    homepage: 'https://example.com/extension',
    repository: {
      type: 'git',
      url: 'https://github.com/example/extension.git',
      directory: 'packages/extension'
    },
    documentation: 'https://docs.example.com/extension',
    support: {
      email: 'support@example.com',
      url: 'https://support.example.com',
      issues: 'https://github.com/example/extension/issues'
    },
    keywords: ['test', 'extension', 'plugin'],
    category: 'testing',
    screenshots: [
      'https://example.com/screenshots/1.png',
      'https://example.com/screenshots/2.png'
    ]
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建CreateExtensionRequest测试数据
 */
export function createMockCreateExtensionRequest(overrides: Partial<CreateExtensionRequest> = {}): CreateExtensionRequest {
  const baseData: CreateExtensionRequest = {
    contextId: generateTestUUID('ctx'),
    name: 'test-extension',
    displayName: 'Test Extension',
    description: 'Test extension for unit testing',
    version: '1.0.0',
    extensionType: 'plugin' as ExtensionType,
    compatibility: createMockExtensionCompatibility(),
    configuration: createMockExtensionConfiguration(),
    extensionPoints: [createMockExtensionPoint()],
    apiExtensions: [createMockApiExtension()],
    eventSubscriptions: [createMockEventSubscription()],
    security: createMockExtensionSecurity(),
    metadata: createMockExtensionMetadata()
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建UpdateExtensionRequest测试数据
 */
export function createMockUpdateExtensionRequest(overrides: Partial<UpdateExtensionRequest> = {}): UpdateExtensionRequest {
  const baseData: UpdateExtensionRequest = {
    extensionId: generateTestUUID('ext'),
    displayName: 'Updated Test Extension',
    description: 'Updated test extension description',
    configuration: {
      enabled: false,
      maxConnections: 75
    },
    extensionPoints: [createMockExtensionPoint({ name: 'Updated Hook' })],
    apiExtensions: [createMockApiExtension({ endpoint: '/api/updated' })],
    eventSubscriptions: [createMockEventSubscription({ eventPattern: 'updated.*' })],
    metadata: {
      author: 'Updated Author',
      license: 'Apache-2.0',
      keywords: ['updated', 'test', 'extension'],
      category: 'updated-testing'
    }
  };

  return { ...baseData, ...overrides };
}

/**
 * 创建多个ExtensionEntityData测试数据的数组
 */
export function createMockExtensionEntityDataArray(count: number = 3): ExtensionEntityData[] {
  return Array.from({ length: count }, (_, index) => 
    createMockExtensionEntityData({
      extensionId: generateTestUUID(`ext-${index}`),
      name: `test-extension-${index}`,
      displayName: `Test Extension ${index + 1}`,
      extensionType: index % 2 === 0 ? 'plugin' as ExtensionType : 'adapter' as ExtensionType,
      status: index % 3 === 0 ? 'active' as ExtensionStatus : 'inactive' as ExtensionStatus
    })
  );
}

/**
 * 创建不同类型的扩展测试数据
 */
export function createMockExtensionByType(type: ExtensionType): ExtensionEntityData {
  const baseData = createMockExtensionEntityData();
  
  switch (type) {
    case 'plugin':
      return {
        ...baseData,
        extensionType: 'plugin' as ExtensionType,
        name: 'test-plugin',
        displayName: 'Test Plugin',
        extensionPoints: [
          createMockExtensionPoint({ type: 'hook', name: 'Plugin Hook' }),
          createMockExtensionPoint({ type: 'filter', name: 'Plugin Filter' })
        ]
      };

    case 'adapter':
      return {
        ...baseData,
        extensionType: 'adapter' as ExtensionType,
        name: 'test-adapter',
        displayName: 'Test Adapter',
        apiExtensions: [
          createMockApiExtension({ endpoint: '/api/adapter', method: 'GET' })
        ]
      };

    case 'connector':
      return {
        ...baseData,
        extensionType: 'connector' as ExtensionType,
        name: 'test-connector',
        displayName: 'Test Connector',
        configuration: createMockExtensionConfiguration({
          schema: {
            type: 'object',
            properties: {
              connectionString: { type: 'string' },
              timeout: { type: 'number' }
            }
          },
          currentConfig: {
            connectionString: 'test://localhost:3000',
            timeout: 5000
          }
        })
      };

    case 'middleware':
      return {
        ...baseData,
        extensionType: 'middleware' as ExtensionType,
        name: 'test-middleware',
        displayName: 'Test Middleware',
        extensionPoints: [
          createMockExtensionPoint({ type: 'action', name: 'Middleware Action' })
        ]
      };

    case 'hook':
      return {
        ...baseData,
        extensionType: 'hook' as ExtensionType,
        name: 'test-hook',
        displayName: 'Test Hook',
        extensionPoints: [
          createMockExtensionPoint({ type: 'hook', name: 'Custom Hook' })
        ]
      };

    case 'transformer':
      return {
        ...baseData,
        extensionType: 'transformer' as ExtensionType,
        name: 'test-transformer',
        displayName: 'Test Transformer',
        eventSubscriptions: [
          createMockEventSubscription({ eventPattern: 'transform.*' }),
          createMockEventSubscription({ eventPattern: 'data.*' })
        ]
      };

    default:
      return baseData;
  }
}
