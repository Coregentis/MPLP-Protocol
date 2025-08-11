/**
 * 测试配置
 * 
 * 统一的测试配置管理，包括超时时间、性能阈值、测试环境设置等
 * 
 * @version 1.0.0
 * @created 2025-01-28T16:00:00+08:00
 */

/**
 * 性能测试阈值配置
 */
export const PERFORMANCE_THRESHOLDS = {
  // 单元测试性能阈值 (毫秒)
  UNIT_TEST: {
    CONTEXT_CREATION: 50,
    PLAN_CREATION: 50,
    CONFIRM_CREATION: 50,
    TRACE_CREATION: 50,
    ROLE_CREATION: 50,
    EXTENSION_CREATION: 50,
    SERVICE_OPERATION: 100,
    ENTITY_VALIDATION: 20,
    FACTORY_CREATION: 10
  },

  // 集成测试性能阈值 (毫秒)
  INTEGRATION_TEST: {
    MODULE_INTERACTION: 200,
    WORKFLOW_STEP: 300,
    EVENT_PROPAGATION: 100,
    DATA_PERSISTENCE: 150,
    CACHE_OPERATION: 50
  },

  // Repository性能阈值 (毫秒)
  REPOSITORY_BATCH_SAVE_MS: 1000,

  // 端到端测试性能阈值 (毫秒)
  E2E_TEST: {
    COMPLETE_WORKFLOW: 2000,
    API_RESPONSE: 500,
    BATCH_OPERATION: 1000,
    SYSTEM_STARTUP: 3000
  }
} as const;

/**
 * 测试超时配置
 */
export const TEST_TIMEOUTS = {
  // 单元测试超时 (毫秒)
  UNIT: 5000,
  
  // 集成测试超时 (毫秒)
  INTEGRATION: 10000,
  
  // 端到端测试超时 (毫秒)
  E2E: 30000,
  
  // 异步操作超时 (毫秒)
  ASYNC_OPERATION: 5000,
  
  // 数据库操作超时 (毫秒)
  DATABASE_OPERATION: 3000
} as const;

/**
 * 测试数据配置
 */
export const TEST_DATA_CONFIG = {
  // 批量测试数据量
  BATCH_SIZES: {
    SMALL: 10,
    MEDIUM: 50,
    LARGE: 100
  },

  // 测试字符串长度
  STRING_LENGTHS: {
    SHORT: 10,
    MEDIUM: 50,
    LONG: 200,
    VERY_LONG: 1000
  },

  // 测试数组大小
  ARRAY_SIZES: {
    EMPTY: 0,
    SMALL: 5,
    MEDIUM: 20,
    LARGE: 100
  }
} as const;

/**
 * 测试环境配置
 */
export const TEST_ENVIRONMENT = {
  // 测试数据库配置
  DATABASE: {
    HOST: 'localhost',
    PORT: 5432,
    NAME: 'mplp_test',
    USER: 'test_user',
    PASSWORD: 'test_password'
  },

  // 测试缓存配置
  CACHE: {
    HOST: 'localhost',
    PORT: 6379,
    DB: 1
  },

  // 测试API配置
  API: {
    HOST: 'localhost',
    PORT: 3000,
    BASE_URL: 'http://localhost:3000/api'
  }
} as const;

/**
 * 分支覆盖测试配置
 */
export const BRANCH_COVERAGE_CONFIG = {
  // 覆盖率要求
  REQUIRED_COVERAGE: {
    BRANCHES: 100,
    FUNCTIONS: 90,
    LINES: 90,
    STATEMENTS: 90
  },

  // 边界条件测试用例
  BOUNDARY_CONDITIONS: {
    STRINGS: ['', ' ', 'a', 'a'.repeat(1000), null, undefined],
    NUMBERS: [0, -1, 1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, NaN, Infinity],
    ARRAYS: [[], [1], Array(100).fill(1), null, undefined],
    OBJECTS: [{}, { key: 'value' }, null, undefined]
  }
} as const;

/**
 * 错误测试配置
 */
export const ERROR_TEST_CONFIG = {
  // 常见错误类型
  ERROR_TYPES: {
    VALIDATION_ERROR: 'ValidationError',
    NOT_FOUND_ERROR: 'NotFoundError',
    PERMISSION_ERROR: 'PermissionError',
    TIMEOUT_ERROR: 'TimeoutError',
    NETWORK_ERROR: 'NetworkError',
    DATABASE_ERROR: 'DatabaseError'
  },

  // 错误消息模式
  ERROR_PATTERNS: {
    REQUIRED_FIELD: /required/i,
    INVALID_FORMAT: /invalid.*format/i,
    NOT_FOUND: /not found/i,
    PERMISSION_DENIED: /permission.*denied/i,
    TIMEOUT: /timeout/i
  }
} as const;

/**
 * Mock配置
 */
export const MOCK_CONFIG = {
  // 默认Mock返回值
  DEFAULT_RETURNS: {
    SUCCESS_RESPONSE: { success: true, data: null },
    ERROR_RESPONSE: { success: false, error: 'Mock error' },
    EMPTY_ARRAY: [],
    EMPTY_OBJECT: {},
    UUID: '12345678-1234-4000-8000-123456789abc',
    TIMESTAMP: '2025-01-28T16:00:00.000Z'
  },

  // Mock延迟配置 (毫秒)
  DELAYS: {
    FAST: 10,
    NORMAL: 50,
    SLOW: 200,
    VERY_SLOW: 1000
  }
} as const;

/**
 * 测试标签配置
 */
export const TEST_TAGS = {
  // 测试类型标签
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  PERFORMANCE: 'performance',

  // 模块标签
  CONTEXT: 'context',
  PLAN: 'plan',
  CONFIRM: 'confirm',
  TRACE: 'trace',
  ROLE: 'role',
  EXTENSION: 'extension',
  CORE: 'core',

  // 功能标签
  CRUD: 'crud',
  VALIDATION: 'validation',
  ERROR_HANDLING: 'error-handling',
  ASYNC: 'async',
  CACHE: 'cache',
  WORKFLOW: 'workflow'
} as const;

/**
 * 测试报告配置
 */
export const TEST_REPORTING = {
  // 报告格式
  FORMATS: ['text', 'json', 'html', 'lcov'],

  // 报告输出目录
  OUTPUT_DIR: 'coverage',

  // 详细程度
  VERBOSITY: {
    SILENT: 0,
    NORMAL: 1,
    VERBOSE: 2,
    DEBUG: 3
  }
} as const;

/**
 * 获取当前测试环境配置
 */
export function getTestConfig() {
  const env = process.env.NODE_ENV || 'test';
  
  return {
    environment: env,
    isTest: env === 'test',
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    performanceThresholds: PERFORMANCE_THRESHOLDS,
    timeouts: TEST_TIMEOUTS,
    dataConfig: TEST_DATA_CONFIG,
    environmentConfig: TEST_ENVIRONMENT,
    branchCoverage: BRANCH_COVERAGE_CONFIG,
    errorConfig: ERROR_TEST_CONFIG,
    mockConfig: MOCK_CONFIG,
    tags: TEST_TAGS,
    reporting: TEST_REPORTING
  };
}

/**
 * 验证测试配置
 */
export function validateTestConfig(): boolean {
  try {
    const config = getTestConfig();
    
    // 验证必要的配置项
    if (!config.isTest) {
      console.warn('Warning: Not running in test environment');
    }

    // 验证性能阈值配置
    Object.values(PERFORMANCE_THRESHOLDS).forEach(thresholds => {
      Object.values(thresholds).forEach(threshold => {
        if (typeof threshold !== 'number' || threshold <= 0) {
          throw new Error('Invalid performance threshold configuration');
        }
      });
    });

    // 验证超时配置
    Object.values(TEST_TIMEOUTS).forEach(timeout => {
      if (typeof timeout !== 'number' || timeout <= 0) {
        throw new Error('Invalid timeout configuration');
      }
    });

    return true;
  } catch (error) {
    console.error('Test configuration validation failed:', error);
    return false;
  }
}

// 导出默认配置
export default getTestConfig();
