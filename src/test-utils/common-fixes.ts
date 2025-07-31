/**
 * 通用测试修复工具
 * @description 提供测试中常用的修复和设置功能
 * @author MPLP Team
 * @version 1.0.1
 */

import { Logger } from '../public/utils/logger';

/**
 * 设置通用测试模式
 */
export function setupCommonTestPatterns(): void {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
  
  // 禁用控制台输出（除了错误）
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  
  // 保存原始方法以便恢复
  (global as any).__originalConsole = {
    log: originalConsoleLog,
    info: originalConsoleInfo,
    warn: originalConsoleWarn
  };
}

/**
 * 清理通用测试模式
 */
export function cleanupCommonTestPatterns(): void {
  // 恢复控制台输出
  if ((global as any).__originalConsole) {
    console.log = (global as any).__originalConsole.log;
    console.info = (global as any).__originalConsole.info;
    console.warn = (global as any).__originalConsole.warn;
    delete (global as any).__originalConsole;
  }
  
  // 清理环境变量
  delete process.env.LOG_LEVEL;
}

/**
 * 创建测试用的Logger
 */
export function createTestLogger(name: string = 'TestLogger'): Logger {
  return new Logger(name);
}

/**
 * 等待指定时间
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 创建测试用的异步函数包装器
 */
export function createAsyncTestWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  timeout: number = 5000
): T {
  return ((...args: any[]) => {
    return Promise.race([
      fn(...args),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
      )
    ]);
  }) as T;
}

/**
 * 验证对象结构
 */
export function validateObjectStructure(
  obj: any, 
  expectedKeys: string[], 
  allowExtraKeys: boolean = false
): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  const objKeys = Object.keys(obj);
  
  // 检查必需的键
  for (const key of expectedKeys) {
    if (!objKeys.includes(key)) {
      return false;
    }
  }
  
  // 如果不允许额外的键，检查是否有多余的键
  if (!allowExtraKeys) {
    for (const key of objKeys) {
      if (!expectedKeys.includes(key)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * 创建测试用的错误对象
 */
export function createTestError(message: string, code?: string): Error {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
}

/**
 * 模拟异步操作
 */
export async function mockAsyncOperation<T>(
  result: T, 
  delay: number = 100, 
  shouldFail: boolean = false
): Promise<T> {
  await sleep(delay);
  
  if (shouldFail) {
    throw createTestError('Mock async operation failed');
  }
  
  return result;
}

/**
 * 创建测试用的配置对象
 */
export function createTestConfig(overrides: Record<string, any> = {}): Record<string, any> {
  const defaultConfig = {
    environment: 'test',
    logging: {
      level: 'error',
      enabled: false
    },
    database: {
      type: 'memory',
      synchronize: true
    },
    cache: {
      enabled: false
    }
  };
  
  return { ...defaultConfig, ...overrides };
}

/**
 * 验证测试结果
 */
export function validateTestResult(
  result: any,
  expectedType: string,
  requiredProperties: string[] = []
): boolean {
  if (typeof result !== expectedType) {
    return false;
  }
  
  if (expectedType === 'object' && result !== null) {
    return validateObjectStructure(result, requiredProperties, true);
  }
  
  return true;
}

/**
 * 创建测试用的时间戳
 */
export function createTestTimestamp(offsetMs: number = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

/**
 * 清理测试数据
 */
export function cleanupTestData(): void {
  // 清理全局变量
  const globalKeys = Object.keys(global).filter(key => key.startsWith('__test_'));
  globalKeys.forEach(key => delete (global as any)[key]);

  // 清理进程环境变量
  const envKeys = Object.keys(process.env).filter(key => key.startsWith('TEST_'));
  envKeys.forEach(key => delete process.env[key]);
}

/**
 * 创建事件数据
 */
export function createEventData<T = any>(data: T): T & { timestamp: string; source: string } {
  return {
    ...data,
    timestamp: new Date().toISOString(),
    source: 'test'
  };
}
