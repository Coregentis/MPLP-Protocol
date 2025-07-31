/**
 * Jest Mock工具
 * @description 提供Jest测试框架的Mock工具函数
 * @author MPLP Team
 * @version 1.0.1
 */

/**
 * 创建安全的异步Mock函数
 */
export function createSafeAsyncMock<T = any>(
  returnValue?: T,
  shouldReject: boolean = false,
  delay: number = 0
): jest.MockedFunction<(...args: any[]) => Promise<T>> {
  const mockFn = jest.fn();
  
  mockFn.mockImplementation(async (..._args: any[]) => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    if (shouldReject) {
      throw new Error('Mock function rejected');
    }
    
    return returnValue;
  });
  
  return mockFn as jest.MockedFunction<(...args: any[]) => Promise<T>>;
}

/**
 * 创建同步Mock函数
 */
export function createSafeSyncMock<T = any>(
  returnValue?: T,
  shouldThrow: boolean = false
): jest.MockedFunction<(...args: any[]) => T> {
  const mockFn = jest.fn();

  mockFn.mockImplementation((..._args: any[]) => {
    if (shouldThrow) {
      throw new Error('Mock function threw error');
    }

    return returnValue;
  });

  return mockFn as jest.MockedFunction<(...args: any[]) => T>;
}

/**
 * 创建安全Mock对象
 */
export function createSafeMock<T = any>(
  mockImplementation?: Partial<T>
): T {
  const mock = {} as any;

  if (mockImplementation) {
    Object.assign(mock, mockImplementation);
  }

  return mock as T;
}

/**
 * 创建Mock类
 */
export function createMockClass<T extends new (...args: any[]) => any>(
  constructor: T,
  mockMethods: Partial<Record<keyof InstanceType<T>, any>> = {}
): jest.MockedClass<T> {
  const MockedClass = jest.fn().mockImplementation(() => {
    const instance: any = {};
    
    // 添加原型方法的Mock
    const prototype = constructor.prototype;
    const propertyNames = Object.getOwnPropertyNames(prototype);
    
    propertyNames.forEach(name => {
      if (name !== 'constructor' && typeof prototype[name] === 'function') {
        instance[name] = mockMethods[name] || jest.fn();
      }
    });
    
    // 添加自定义Mock方法
    Object.keys(mockMethods).forEach(key => {
      if (!instance[key]) {
        instance[key] = mockMethods[key];
      }
    });
    
    return instance;
  });
  
  return MockedClass as unknown as jest.MockedClass<T>;
}

/**
 * 创建Mock模块
 */
export function createMockModule(
  modulePath: string,
  mockExports: Record<string, any>
): void {
  jest.doMock(modulePath, () => mockExports);
}

/**
 * 创建部分Mock对象
 */
export function createPartialMock<T extends Record<string, any>>(
  original: T,
  overrides: Partial<T> = {}
): T {
  const mock: any = {};
  
  // 复制原始对象的所有属性
  Object.keys(original).forEach(key => {
    if (typeof original[key] === 'function') {
      mock[key] = jest.fn().mockImplementation(original[key]);
    } else {
      mock[key] = original[key];
    }
  });
  
  // 应用覆盖
  Object.keys(overrides).forEach(key => {
    mock[key] = overrides[key];
  });
  
  return mock as T;
}

/**
 * 验证Mock函数调用
 */
export function expectMockToHaveBeenCalledWith(
  mockFn: jest.MockedFunction<any>,
  ...expectedArgs: any[]
): void {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
}

/**
 * 验证Mock函数调用次数
 */
export function expectMockToHaveBeenCalledTimes(
  mockFn: jest.MockedFunction<any>,
  times: number
): void {
  expect(mockFn).toHaveBeenCalledTimes(times);
}

/**
 * 验证异步Mock函数
 */
export async function expectAsyncMockToResolve<T>(
  mockFn: any,
  ...args: any[]
): Promise<T> {
  const result = await (mockFn as any)(...args);
  expect(mockFn).toHaveBeenCalledWith(...args);
  return result;
}

/**
 * 验证异步Mock函数抛出错误
 */
export async function expectAsyncMockToReject(
  mockFn: any,
  ...args: any[]
): Promise<void> {
  await expect((mockFn as any)(...args)).rejects.toThrow();
}

/**
 * 重置Mock函数
 */
export function resetMock(mockFn: any): void {
  if (mockFn && typeof mockFn.mockReset === 'function') {
    mockFn.mockReset();
  }
}

/**
 * 清除Mock函数调用历史
 */
export function clearMock(mockFn: any): void {
  if (mockFn && typeof mockFn.mockClear === 'function') {
    mockFn.mockClear();
  }
}

/**
 * 恢复Mock函数
 */
export function restoreMock(mockFn: any): void {
  if (mockFn && typeof mockFn.mockRestore === 'function') {
    mockFn.mockRestore();
  }
}

/**
 * 创建Mock定时器
 */
export function createMockTimers(): void {
  jest.useFakeTimers();
}

/**
 * 恢复真实定时器
 */
export function restoreTimers(): void {
  jest.useRealTimers();
}

/**
 * 快进定时器
 */
export function advanceTimers(ms: number): void {
  jest.advanceTimersByTime(ms);
}

/**
 * 运行所有定时器
 */
export function runAllTimers(): void {
  jest.runAllTimers();
}

/**
 * 创建Mock Promise
 */
export function createMockPromise<T>(
  resolveValue?: T,
  rejectValue?: any
): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
} {
  let resolve: (value: T) => void;
  let reject: (reason: any) => void;
  
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
    
    if (resolveValue !== undefined) {
      setTimeout(() => res(resolveValue), 0);
    }
    
    if (rejectValue !== undefined) {
      setTimeout(() => rej(rejectValue), 0);
    }
  });
  
  return {
    promise,
    resolve: resolve!,
    reject: reject!
  };
}
