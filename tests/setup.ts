/**
 * Jest全局测试设置
 * 
 * 用于配置Jest测试环境，包括全局模拟、自定义匹配器等
 * 
 * @version v1.0.0
 * @created 2025-08-21T14:00:00+08:00
 */

import { jest } from '@jest/globals';

// 全局环境设置
process.env.NODE_ENV = 'test';

// 增加全局匹配器
expect.extend({
  toBeValidUUID(received) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false
      };
    }
  },
  
  toHaveSucceeded(response) {
    const pass = response && response.success === true;
    
    if (pass) {
      return {
        message: () => `expected response not to have succeeded, but it did`,
        pass: true
      };
    } else {
      return {
        message: () => `expected response to have succeeded, but it failed with: ${JSON.stringify(response?.error)}`,
        pass: false
      };
    }
  }
});

// 全局模拟
jest.mock('../src/public/utils/logger', () => {
  return {
    Logger: jest.fn().mockImplementation(() => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      setLevel: jest.fn(),
      getLevel: jest.fn(),
      createSubLogger: jest.fn()
    }))
  };
});

// 监听未关闭的处理程序
afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
}); 