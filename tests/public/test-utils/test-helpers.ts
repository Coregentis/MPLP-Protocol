/**
 * 测试助手工具
 * 
 * 提供通用的测试辅助功能，包括异步测试、错误测试、性能测试等
 * 
 * @version 1.0.0
 * @created 2025-01-28T16:00:00+08:00
 */

import { jest } from '@jest/globals';

/**
 * 异步测试助手
 */
export class AsyncTestHelper {
  /**
   * 等待指定时间
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 等待条件满足
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const result = await condition();
      if (result) {
        return;
      }
      await this.wait(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * 测试异步操作的超时
   */
  static async expectTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = 1000
  ): Promise<void> {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Expected timeout')), timeoutMs);
    });

    try {
      await Promise.race([promise, timeoutPromise]);
      throw new Error('Expected operation to timeout');
    } catch (error) {
      if (error instanceof Error && error.message === 'Expected timeout') {
        return; // 期望的超时
      }
      throw error;
    }
  }
}

/**
 * 错误测试助手
 */
export class ErrorTestHelper {
  /**
   * 测试函数抛出特定错误
   */
  static async expectError<T>(
    fn: () => Promise<T> | T,
    expectedError: string | RegExp | Error
  ): Promise<void> {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (typeof expectedError === 'string') {
        expect(error).toHaveProperty('message', expectedError);
      } else if (expectedError instanceof RegExp) {
        expect(error).toHaveProperty('message');
        expect((error as Error).message).toMatch(expectedError);
      } else if (expectedError instanceof Error) {
        expect(error).toEqual(expectedError);
      }
    }
  }

  /**
   * 测试函数不抛出错误
   */
  static async expectNoError<T>(fn: () => Promise<T> | T): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw new Error(`Expected function not to throw, but got: ${error}`);
    }
  }
}

/**
 * 性能测试助手
 */
export class PerformanceTestHelper {
  /**
   * 测量函数执行时间
   */
  static async measureTime<T>(fn: () => Promise<T> | T): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return { result, duration };
  }

  /**
   * 测试函数执行时间是否在预期范围内
   */
  static async expectExecutionTime<T>(
    fn: () => Promise<T> | T,
    maxDurationMs: number
  ): Promise<T> {
    const { result, duration } = await this.measureTime(fn);
    
    expect(duration).toBeLessThan(maxDurationMs);
    
    return result;
  }

  /**
   * 批量性能测试
   */
  static async batchPerformanceTest<T>(
    fn: () => Promise<T> | T,
    iterations: number = 100
  ): Promise<{ 
    results: T[]; 
    averageDuration: number; 
    minDuration: number; 
    maxDuration: number; 
  }> {
    const results: T[] = [];
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const { result, duration } = await this.measureTime(fn);
      results.push(result);
      durations.push(duration);
    }

    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);

    return {
      results,
      averageDuration,
      minDuration,
      maxDuration
    };
  }
}

/**
 * Mock测试助手
 */
export class MockTestHelper {
  /**
   * 验证Mock函数被调用
   */
  static expectMockCalled(mockFn: jest.MockedFunction<any>, times?: number): void {
    if (times !== undefined) {
      expect(mockFn).toHaveBeenCalledTimes(times);
    } else {
      expect(mockFn).toHaveBeenCalled();
    }
  }

  /**
   * 验证Mock函数被调用时的参数
   */
  static expectMockCalledWith(mockFn: jest.MockedFunction<any>, ...args: any[]): void {
    expect(mockFn).toHaveBeenCalledWith(...args);
  }
}

/**
 * 分支覆盖测试助手
 */
export class BranchCoverageHelper {
  /**
   * 确保所有分支都被测试
   */
  static async testAllBranches<T>(
    testCases: T[],
    testFunction: (testCase: T) => Promise<void> | void
  ): Promise<void> {
    if (testCases.length === 0) {
      throw new Error('测试用例不能为空，必须覆盖所有分支');
    }

    for (const testCase of testCases) {
      await testFunction(testCase);
    }
  }

  /**
   * 测试边界条件
   */
  static async testBoundaryConditions<T>(
    boundaryTests: Array<{
      name: string;
      input: T;
      expectedResult?: any;
      expectedError?: string | RegExp;
    }>,
    testFunction: (input: T) => Promise<any> | any
  ): Promise<void> {
    for (const test of boundaryTests) {
      if (test.expectedError) {
        await ErrorTestHelper.expectError(
          () => testFunction(test.input),
          test.expectedError
        );
      } else {
        const result = await testFunction(test.input);
        if (test.expectedResult !== undefined) {
          expect(result).toEqual(test.expectedResult);
        }
      }
    }
  }
}

/**
 * 测试环境助手
 */
export class TestEnvironmentHelper {
  /**
   * 设置测试环境变量
   */
  static setEnvVar(key: string, value: string): void {
    process.env[key] = value;
  }

  /**
   * 清理测试环境变量
   */
  static cleanupEnvVar(key: string): void {
    delete process.env[key];
  }

  /**
   * 临时设置环境变量
   */
  static withEnvVar<T>(
    key: string,
    value: string,
    fn: () => Promise<T> | T
  ): Promise<T> | T {
    const originalValue = process.env[key];
    this.setEnvVar(key, value);
    
    try {
      const result = fn();
      if (result instanceof Promise) {
        return result.finally(() => {
          if (originalValue !== undefined) {
            this.setEnvVar(key, originalValue);
          } else {
            this.cleanupEnvVar(key);
          }
        });
      } else {
        if (originalValue !== undefined) {
          this.setEnvVar(key, originalValue);
        } else {
          this.cleanupEnvVar(key);
        }
        return result;
      }
    } catch (error) {
      if (originalValue !== undefined) {
        this.setEnvVar(key, originalValue);
      } else {
        this.cleanupEnvVar(key);
      }
      throw error;
    }
  }
}

/**
 * 统一测试助手导出
 */
export const TestHelpers = {
  Async: AsyncTestHelper,
  Error: ErrorTestHelper,
  Performance: PerformanceTestHelper,
  Mock: MockTestHelper,
  BranchCoverage: BranchCoverageHelper,
  Environment: TestEnvironmentHelper
};
