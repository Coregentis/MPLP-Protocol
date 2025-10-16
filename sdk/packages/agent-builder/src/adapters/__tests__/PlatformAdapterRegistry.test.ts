/**
 * @fileoverview PlatformAdapterRegistry tests
 * @version 1.1.0-beta
 */

import { PlatformAdapterRegistry } from '../PlatformAdapterRegistry';
import { TestPlatformAdapter } from '../TestPlatformAdapter';
import { BasePlatformAdapter } from '../BasePlatformAdapter';
import { PlatformConfig } from '../../types';
import { PlatformAdapterRegistrationError, PlatformAdapterNotFoundError } from '../../types/errors';

// Using imported TestPlatformAdapter

// Invalid adapter class for testing
class InvalidAdapter {
  // Missing required methods and properties
}

describe('PlatformAdapterRegistry测试', () => {
  let registry: PlatformAdapterRegistry;

  beforeEach(() => {
    registry = PlatformAdapterRegistry.createInstance();
  });

  afterEach(() => {
    registry.clear();
  });

  describe('单例模式', () => {
    it('应该返回相同的实例', () => {
      const instance1 = PlatformAdapterRegistry.getInstance();
      const instance2 = PlatformAdapterRegistry.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('应该创建独立的测试实例', () => {
      const testInstance = PlatformAdapterRegistry.createInstance();
      const singleton = PlatformAdapterRegistry.getInstance();

      expect(testInstance).not.toBe(singleton);
    });
  });

  describe('适配器注册', () => {
    it('应该注册适配器', () => {
      registry.register('test', TestPlatformAdapter);

      expect(registry.has('test')).toBe(true);
      expect(registry.getRegisteredPlatforms()).toContain('test');
    });

    it('应该注册多个适配器', () => {
      registry.register('test', TestPlatformAdapter);
      registry.register('test2', TestPlatformAdapter);

      expect(registry.size()).toBe(2);
      expect(registry.getRegisteredPlatforms()).toContain('test');
      expect(registry.getRegisteredPlatforms()).toContain('test2');
    });

    it('应该标准化平台名称', () => {
      registry.register('TEST', TestPlatformAdapter);
      registry.register('  Test2  ', TestPlatformAdapter);

      expect(registry.has('test')).toBe(true);
      expect(registry.has('test2')).toBe(true);
      expect(registry.has('TEST')).toBe(true);
      expect(registry.has('  Test2  ')).toBe(true);
    });

    it('应该拒绝重复注册', () => {
      registry.register('test', TestPlatformAdapter);

      expect(() => {
        registry.register('test', TestPlatformAdapter);
      }).toThrow(PlatformAdapterRegistrationError);
    });

    it('应该拒绝无效的平台名称', () => {
      expect(() => {
        registry.register('', TestPlatformAdapter);
      }).toThrow(PlatformAdapterRegistrationError);

      expect(() => {
        registry.register('   ', TestPlatformAdapter);
      }).toThrow(PlatformAdapterRegistrationError);

      expect(() => {
        registry.register(null as any, TestPlatformAdapter);
      }).toThrow(PlatformAdapterRegistrationError);
    });

    it('应该拒绝无效的适配器类', () => {
      expect(() => {
        registry.register('invalid', null as any);
      }).toThrow(PlatformAdapterRegistrationError);

      expect(() => {
        registry.register('invalid', 'not-a-class' as any);
      }).toThrow(PlatformAdapterRegistrationError);

      expect(() => {
        registry.register('invalid', InvalidAdapter as any);
      }).toThrow(PlatformAdapterRegistrationError);
    });
  });

  describe('适配器检索', () => {
    beforeEach(() => {
      registry.register('test', TestPlatformAdapter);
      registry.register('test2', TestPlatformAdapter);
    });

    it('应该获取已注册的适配器', () => {
      const AdapterClass = registry.get('test');
      expect(AdapterClass).toBe(TestPlatformAdapter);
    });

    it('应该返回undefined对于未注册的适配器', () => {
      const AdapterClass = registry.get('nonexistent');
      expect(AdapterClass).toBeUndefined();
    });

    it('应该处理大小写不敏感的查询', () => {
      const AdapterClass = registry.get('TEST');
      expect(AdapterClass).toBe(TestPlatformAdapter);
    });

    it('应该检查适配器存在性', () => {
      expect(registry.has('test')).toBe(true);
      expect(registry.has('TEST')).toBe(true);
      expect(registry.has('nonexistent')).toBe(false);
    });

    it('应该获取所有注册的平台', () => {
      const platforms = registry.getRegisteredPlatforms();
      expect(platforms).toHaveLength(2);
      expect(platforms).toContain('test');
      expect(platforms).toContain('test2');
    });
  });

  describe('适配器创建', () => {
    beforeEach(() => {
      registry.register('test', TestPlatformAdapter);
      registry.register('test2', TestPlatformAdapter);
    });

    it('应该创建适配器实例', () => {
      const adapter = registry.createAdapter('test');
      expect(adapter).toBeInstanceOf(TestPlatformAdapter);
      expect(adapter.name).toBe('test');
    });

    it('应该为未注册的适配器抛出错误', () => {
      expect(() => {
        registry.createAdapter('nonexistent');
      }).toThrow(PlatformAdapterNotFoundError);
    });

    it('应该创建不同的实例', () => {
      const adapter1 = registry.createAdapter('test');
      const adapter2 = registry.createAdapter('test');

      expect(adapter1).not.toBe(adapter2);
      expect(adapter1).toBeInstanceOf(TestPlatformAdapter);
      expect(adapter2).toBeInstanceOf(TestPlatformAdapter);
    });
  });

  describe('批量操作', () => {
    it('应该批量注册适配器', () => {
      const adapters = {
        test: TestPlatformAdapter,
        test2: TestPlatformAdapter
      };

      registry.registerMultiple(adapters);

      expect(registry.size()).toBe(2);
      expect(registry.has('test')).toBe(true);
      expect(registry.has('test2')).toBe(true);
    });

    it('应该处理批量注册错误', () => {
      const adapters = {
        test: TestPlatformAdapter,
        invalid: InvalidAdapter as any
      };

      expect(() => {
        registry.registerMultiple(adapters);
      }).toThrow(PlatformAdapterRegistrationError);

      // Should not register any adapters if one fails
      expect(registry.size()).toBe(0);
    });
  });

  describe('适配器信息', () => {
    beforeEach(() => {
      registry.register('test', TestPlatformAdapter);
      registry.register('test2', TestPlatformAdapter);
    });

    it('应该获取适配器信息', () => {
      const info = registry.getAdapterInfo('test');
      expect(info).toEqual({
        name: 'test',
        registered: true,
        className: 'TestPlatformAdapter'
      });
    });

    it('应该获取未注册适配器信息', () => {
      const info = registry.getAdapterInfo('nonexistent');
      expect(info).toEqual({
        name: 'nonexistent',
        registered: false,
        className: undefined
      });
    });

    it('应该获取所有适配器信息', () => {
      const allInfo = registry.getAllAdapterInfo();
      expect(allInfo).toHaveLength(2);

      const testInfo = allInfo.find(info => info.name === 'test');
      const test2Info = allInfo.find(info => info.name === 'test2');

      expect(testInfo).toEqual({
        name: 'test',
        className: 'TestPlatformAdapter'
      });

      expect(test2Info).toEqual({
        name: 'test2',
        className: 'TestPlatformAdapter'
      });
    });
  });

  describe('注册表管理', () => {
    beforeEach(() => {
      registry.register('test', TestPlatformAdapter);
      registry.register('test2', TestPlatformAdapter);
    });

    it('应该注销适配器', () => {
      const result = registry.unregister('test');
      expect(result).toBe(true);
      expect(registry.has('test')).toBe(false);
      expect(registry.size()).toBe(1);
    });

    it('应该处理注销不存在的适配器', () => {
      const result = registry.unregister('nonexistent');
      expect(result).toBe(false);
      expect(registry.size()).toBe(2);
    });

    it('应该清空所有适配器', () => {
      registry.clear();
      expect(registry.size()).toBe(0);
      expect(registry.getRegisteredPlatforms()).toHaveLength(0);
    });

    it('应该检查注册表是否为空', () => {
      expect(registry.size()).toBe(2);
      registry.clear();
      expect(registry.size()).toBe(0);
    });
  });
});
