/**
 * 核心测试工具
 * @description 提供核心模块测试所需的Mock对象和工具函数
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../public/utils/logger';
import { AdapterConfig, AdapterHealth, IAdapter } from '../core/adapter-registry';

/**
 * 创建Mock追踪适配器
 */
export function createMockTraceAdapter(): IAdapter {
  return {
    getAdapterInfo: () => ({
      type: 'trace',
      version: '1.0.0',
      name: 'mock-trace-adapter',
      status: 'active',
      capabilities: ['trace', 'monitor', 'log']
    }),
    
    initialize: async (config: AdapterConfig) => {
      // Mock initialization
    },
    
    checkHealth: async (): Promise<AdapterHealth> => ({
      status: 'healthy',
      message: 'Mock trace adapter is healthy',
      last_check: new Date().toISOString()
    }),
    
    close: async () => {
      // Mock close
    }
  };
}

/**
 * 创建Mock计划适配器
 */
export function createMockPlanAdapter(): IAdapter {
  return {
    getAdapterInfo: () => ({
      type: 'plan',
      version: '1.0.0',
      name: 'mock-plan-adapter',
      status: 'active',
      capabilities: ['plan', 'schedule', 'optimize']
    }),
    
    initialize: async (config: AdapterConfig) => {
      // Mock initialization
    },
    
    checkHealth: async (): Promise<AdapterHealth> => ({
      status: 'healthy',
      message: 'Mock plan adapter is healthy',
      last_check: new Date().toISOString()
    }),
    
    close: async () => {
      // Mock close
    }
  };
}

/**
 * 创建Mock确认适配器
 */
export function createMockConfirmAdapter(): IAdapter {
  return {
    getAdapterInfo: () => ({
      type: 'confirm',
      version: '1.0.0',
      name: 'mock-confirm-adapter',
      status: 'active',
      capabilities: ['confirm', 'approve', 'validate']
    }),
    
    initialize: async (config: AdapterConfig) => {
      // Mock initialization
    },
    
    checkHealth: async (): Promise<AdapterHealth> => ({
      status: 'healthy',
      message: 'Mock confirm adapter is healthy',
      last_check: new Date().toISOString()
    }),
    
    close: async () => {
      // Mock close
    }
  };
}

/**
 * 创建Mock扩展适配器
 */
export function createMockExtensionAdapter(): IAdapter {
  return {
    getAdapterInfo: () => ({
      type: 'extension',
      version: '1.0.0',
      name: 'mock-extension-adapter',
      status: 'active',
      capabilities: ['extend', 'plugin', 'integrate']
    }),
    
    initialize: async (config: AdapterConfig) => {
      // Mock initialization
    },
    
    checkHealth: async (): Promise<AdapterHealth> => ({
      status: 'healthy',
      message: 'Mock extension adapter is healthy',
      last_check: new Date().toISOString()
    }),
    
    close: async () => {
      // Mock close
    }
  };
}

/**
 * 创建Mock适配器配置
 */
export function createMockAdapterConfig(
  name: string = 'mock-adapter',
  version: string = '1.0.0',
  options: Record<string, any> = {}
): AdapterConfig {
  return {
    name,
    version,
    enabled: true,
    options: {
      timeout: 5000,
      retries: 3,
      ...options
    }
  };
}

/**
 * 创建Mock Logger
 */
export function createMockLogger(name: string = 'MockLogger'): Logger {
  return new Logger(name);
}

/**
 * 创建Mock数据源
 */
export function createMockDataSource() {
  return {
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [],
    migrations: [],
    subscribers: [],
    
    initialize: async () => {
      return Promise.resolve();
    },
    
    destroy: async () => {
      return Promise.resolve();
    },
    
    getRepository: (entity: any) => ({
      save: async (data: any) => ({ ...data, id: 'mock-id' }),
      findOne: async () => null,
      find: async () => [],
      remove: async (data: any) => data,
      createQueryBuilder: () => ({
        where: () => ({ getMany: async () => [] }),
        orderBy: () => ({ getMany: async () => [] })
      })
    }),
    
    isInitialized: true,
    options: {}
  };
}

/**
 * 创建Mock HTTP请求对象
 */
export function createMockRequest(overrides: Record<string, any> = {}): any {
  return {
    method: 'GET',
    url: '/test',
    path: '/test',
    headers: {},
    query: {},
    params: {},
    body: {},
    ...overrides
  };
}

/**
 * 创建Mock HTTP响应对象
 */
export function createMockResponse(): any {
  const res: any = {
    statusCode: 200,
    headers: {},
    
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    
    json: function(data: any) {
      this.body = data;
      return this;
    },
    
    send: function(data: any) {
      this.body = data;
      return this;
    },
    
    setHeader: function(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    
    on: function(event: string, callback: Function) {
      // Mock event listener
      if (event === 'finish') {
        setTimeout(() => callback(), 0);
      }
      return this;
    }
  };
  
  return res;
}

/**
 * 创建Mock Next函数
 */
export function createMockNext(): any {
  return jest.fn();
}

/**
 * 验证Mock对象调用
 */
export function validateMockCalls(mockFn: any, expectedCalls: number = 1): boolean {
  return mockFn.mock && mockFn.mock.calls.length === expectedCalls;
}

/**
 * 重置所有Mock对象
 */
export function resetAllMocks(): void {
  if (jest && jest.clearAllMocks) {
    jest.clearAllMocks();
  }
}
