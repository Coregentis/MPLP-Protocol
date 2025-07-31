/**
 * 测试数据工厂
 * 为测试提供标准化的测试数据
 * 
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid';

export class TestDataFactory {
  /**
   * 生成测试用的UUID
   */
  static generateUUID(): string {
    return uuidv4();
  }

  /**
   * 生成测试用的时间戳
   */
  static generateTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * 生成测试用的配置
   */
  static generateTestConfig() {
    return {
      default_workflow: {
        stages: ['context', 'plan', 'confirm', 'trace'],
        timeout_ms: 30000
      },
      module_timeout_ms: 5000,
      max_concurrent_executions: 10,
      enable_performance_monitoring: true,
      enable_event_logging: true
    };
  }

  /**
   * 生成测试用的上下文数据
   */
  static generateContextData() {
    return {
      id: this.generateUUID(),
      name: `test-context-${Date.now()}`,
      description: 'Test context for unit testing',
      metadata: {
        test: true,
        created_by: 'test-factory'
      },
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp()
    };
  }

  /**
   * 生成测试用的模块接口
   */
  static generateMockModule() {
    return {
      name: 'test-module',
      version: '1.0.0',
      execute: jest.fn().mockResolvedValue({
        success: true,
        data: { result: 'test-success' },
        duration_ms: 100
      }),
      initialize: jest.fn().mockResolvedValue(true),
      shutdown: jest.fn().mockResolvedValue(true)
    };
  }

  /**
   * 生成性能测试数据
   */
  static generatePerformanceTestData(count: number = 10) {
    return Array.from({ length: count }, (_, i) => ({
      id: this.generateUUID(),
      execution_time: Math.random() * 1000 + 100, // 100-1100ms
      memory_usage: Math.random() * 100 + 50, // 50-150MB
      success: Math.random() > 0.1, // 90% success rate
      timestamp: this.generateTimestamp()
    }));
  }

  /**
   * 生成批量测试上下文
   */
  static generateBatchContexts(count: number = 5) {
    return Array.from({ length: count }, () => this.generateContextData());
  }

  /**
   * 延迟函数（用于模拟异步操作）
   */
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成随机字符串
   */
  static generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成测试错误
   */
  static generateTestError(message: string = 'Test error') {
    return new Error(message);
  }

  /**
   * 清理测试数据
   */
  static cleanup() {
    // 清理任何全局测试状态
    jest.clearAllMocks();
  }
}
