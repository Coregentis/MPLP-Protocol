/**
 * @fileoverview Utility functions tests
 * @version 1.1.0-beta
 */

import {
  generateAgentId,
  validateAgentConfig,
  validatePlatformConfig,
  deepClone,
  deepMerge,
  isPlainObject,
  sanitizeAgentName,
  calculateUptime,
  formatUptime,
  delay,
  retryWithBackoff
} from '../index';
import { AgentConfig, AgentCapability, PlatformConfig } from '../../types';
import { AgentConfigurationError } from '../../types/errors';

describe('工具函数测试', () => {
  describe('generateAgentId', () => {
    it('应该生成唯一的agent ID', () => {
      const id1 = generateAgentId();
      const id2 = generateAgentId();

      expect(id1).toMatch(/^agent-[0-9a-f-]{36}$/);
      expect(id2).toMatch(/^agent-[0-9a-f-]{36}$/);
      expect(id1).not.toBe(id2);
    });

    it('应该生成以"agent-"开头的ID', () => {
      const id = generateAgentId();
      expect(id).toMatch(/^agent-/);
    });
  });

  describe('validateAgentConfig', () => {
    const validConfig: AgentConfig = {
      id: 'test-agent',
      name: 'TestAgent',
      capabilities: ['communication' as AgentCapability]
    };

    it('应该验证有效配置', () => {
      expect(() => validateAgentConfig(validConfig)).not.toThrow();
    });

    it('应该拒绝空名称', () => {
      const config = { ...validConfig, name: '' };
      expect(() => validateAgentConfig(config)).toThrow(AgentConfigurationError);
    });

    it('应该拒绝非字符串名称', () => {
      const config = { ...validConfig, name: 123 as any };
      expect(() => validateAgentConfig(config)).toThrow(AgentConfigurationError);
    });

    it('应该拒绝空能力数组', () => {
      const config = { ...validConfig, capabilities: [] };
      expect(() => validateAgentConfig(config)).toThrow(AgentConfigurationError);
    });

    it('应该拒绝非数组能力', () => {
      const config = { ...validConfig, capabilities: 'invalid' as any };
      expect(() => validateAgentConfig(config)).toThrow(AgentConfigurationError);
    });

    it('应该拒绝无效能力', () => {
      const config = { ...validConfig, capabilities: ['invalid_capability' as any] };
      expect(() => validateAgentConfig(config)).toThrow(AgentConfigurationError);
    });

    it('应该要求平台配置当指定平台时', () => {
      const config = { ...validConfig, platform: 'test' };
      expect(() => validateAgentConfig(config)).toThrow(AgentConfigurationError);
    });
  });

  describe('validatePlatformConfig', () => {
    const validConfig: PlatformConfig = {
      apiKey: 'test-key',
      timeout: 5000,
      retries: 3
    };

    it('应该验证有效配置', () => {
      expect(() => validatePlatformConfig('test', validConfig)).not.toThrow();
    });

    it('应该拒绝空平台名称', () => {
      expect(() => validatePlatformConfig('', validConfig)).toThrow(AgentConfigurationError);
    });

    it('应该拒绝非对象配置', () => {
      expect(() => validatePlatformConfig('test', 'invalid' as any)).toThrow(AgentConfigurationError);
    });

    it('应该验证超时值', () => {
      const config = { ...validConfig, timeout: -1 };
      expect(() => validatePlatformConfig('test', config)).toThrow(AgentConfigurationError);
    });

    it('应该验证重试次数', () => {
      const config = { ...validConfig, retries: -1 };
      expect(() => validatePlatformConfig('test', config)).toThrow(AgentConfigurationError);

      const config2 = { ...validConfig, retries: 1.5 };
      expect(() => validatePlatformConfig('test', config2)).toThrow(AgentConfigurationError);
    });
  });

  describe('deepClone', () => {
    it('应该克隆基本类型', () => {
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
      expect(deepClone(42)).toBe(42);
      expect(deepClone('test')).toBe('test');
      expect(deepClone(true)).toBe(true);
    });

    it('应该克隆日期对象', () => {
      const date = new Date();
      const cloned = deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });

    it('应该克隆数组', () => {
      const array = [1, 2, { nested: 'value' }];
      const cloned = deepClone(array);

      expect(cloned).toEqual(array);
      expect(cloned).not.toBe(array);
      expect(cloned[2]).not.toBe(array[2]);
    });

    it('应该克隆对象', () => {
      const obj = {
        string: 'value',
        number: 42,
        nested: {
          deep: 'value'
        }
      };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.nested).not.toBe(obj.nested);
    });
  });

  describe('deepMerge', () => {
    it('应该合并简单对象', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
      expect(result).not.toBe(target);
    });

    it('应该深度合并嵌套对象', () => {
      const target = {
        nested: {
          a: 1,
          b: 2
        },
        other: 'value'
      };
      const source = {
        nested: {
          a: 1, // Keep existing property
          b: 3,
          c: 4
        }
      };
      const result = deepMerge(target, source);

      expect(result).toEqual({
        nested: {
          a: 1,
          b: 3,
          c: 4
        },
        other: 'value'
      });
    });

    it('应该处理数组替换', () => {
      const target = { array: [1, 2, 3] };
      const source = { array: [4, 5] };
      const result = deepMerge(target, source);

      expect(result.array).toEqual([4, 5]);
    });
  });

  describe('isPlainObject', () => {
    it('应该识别普通对象', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ key: 'value' })).toBe(true);
    });

    it('应该拒绝非普通对象', () => {
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject(/regex/)).toBe(false);
      expect(isPlainObject(new Error())).toBe(false);
      expect(isPlainObject('string')).toBe(false);
      expect(isPlainObject(42)).toBe(false);
    });
  });

  describe('sanitizeAgentName', () => {
    it('应该清理agent名称', () => {
      expect(sanitizeAgentName('My Agent Name')).toBe('my-agent-name');
      expect(sanitizeAgentName('  Spaced  ')).toBe('spaced');
      expect(sanitizeAgentName('Special@#$Characters')).toBe('special-characters');
      expect(sanitizeAgentName('Multiple---Dashes')).toBe('multiple-dashes');
      expect(sanitizeAgentName('-Leading-Trailing-')).toBe('leading-trailing');
    });

    it('应该处理空字符串', () => {
      expect(sanitizeAgentName('')).toBe('');
      expect(sanitizeAgentName('   ')).toBe('');
    });
  });

  describe('calculateUptime', () => {
    it('应该计算正确的运行时间', () => {
      const startTime = new Date(Date.now() - 5000); // 5 seconds ago
      const uptime = calculateUptime(startTime);

      expect(uptime).toBeGreaterThanOrEqual(4900);
      expect(uptime).toBeLessThanOrEqual(5100);
    });
  });

  describe('formatUptime', () => {
    it('应该格式化秒', () => {
      expect(formatUptime(30000)).toBe('30s');
    });

    it('应该格式化分钟', () => {
      expect(formatUptime(90000)).toBe('1m 30s');
    });

    it('应该格式化小时', () => {
      expect(formatUptime(3690000)).toBe('1h 1m 30s');
    });

    it('应该格式化天', () => {
      expect(formatUptime(90090000)).toBe('1d 1h 1m 30s');
    });
  });

  describe('delay', () => {
    it('应该延迟指定时间', async () => {
      const start = Date.now();
      await delay(100);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(90);
      expect(elapsed).toBeLessThanOrEqual(150);
    });
  });

  describe('retryWithBackoff', () => {
    it('应该在成功时返回结果', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn, 3);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该重试失败的函数', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(fn, 3, 10);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('应该在最大重试后抛出错误', async () => {
      const error = new Error('Persistent failure');
      const fn = jest.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('Persistent failure');
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});
