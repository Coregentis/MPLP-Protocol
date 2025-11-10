/**
 * MPLP核心API单元测试
 * 
 * @description 测试MPLP主类和工厂函数的功能
 * @version 1.1.0-beta
 * @created 2025-10-21
 */

import { MPLP, MPLPConfig } from '../../src/core/mplp';
import { createMPLP, quickStart, createProductionMPLP, createTestMPLP } from '../../src/core/factory';

describe('MPLP Core API', () => {
  describe('MPLP Class - Constructor', () => {
    it('should create instance with default config', () => {
      const mplp = new MPLP();
      expect(mplp).toBeInstanceOf(MPLP);
      expect(mplp.isInitialized()).toBe(false);
    });

    it('should create instance with custom config', () => {
      const mplp = new MPLP({
        environment: 'production',
        logLevel: 'error'
      });
      
      const config = mplp.getConfig();
      expect(config.environment).toBe('production');
      expect(config.logLevel).toBe('error');
    });

    it('should use default values for missing config', () => {
      const mplp = new MPLP({});
      
      const config = mplp.getConfig();
      expect(config.protocolVersion).toBe('1.1.0-beta');
      expect(config.environment).toBe('development');
      expect(config.logLevel).toBe('info');
      expect(config.modules).toHaveLength(10);
    });

    it('should accept custom modules list', () => {
      const mplp = new MPLP({
        modules: ['context', 'plan']
      });
      
      const config = mplp.getConfig();
      expect(config.modules).toEqual(['context', 'plan']);
    });
  });

  describe('MPLP Class - initialize()', () => {
    it('should load all default modules', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      
      expect(mplp.isInitialized()).toBe(true);
      
      const modules = mplp.getAvailableModules();
      expect(modules).toContain('context');
      expect(modules).toContain('plan');
      expect(modules).toContain('role');
      expect(modules).toContain('confirm');
      expect(modules).toContain('trace');
      expect(modules).toContain('extension');
      expect(modules).toContain('dialog');
      expect(modules).toContain('collab');
      expect(modules).toContain('core');
      expect(modules).toContain('network');
      expect(modules.length).toBe(10);
    });

    it('should load only specified modules', async () => {
      const mplp = new MPLP({
        modules: ['context', 'plan']
      });
      await mplp.initialize();
      
      const modules = mplp.getAvailableModules();
      expect(modules).toEqual(['context', 'plan']);
    });

    it('should throw if already initialized', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      
      await expect(mplp.initialize()).rejects.toThrow('already initialized');
    });

    it('should throw if invalid module name', async () => {
      const mplp = new MPLP({
        modules: ['invalid-module']
      });
      
      await expect(mplp.initialize()).rejects.toThrow('Failed to load');
    });

    it('should handle concurrent initialization calls', async () => {
      const mplp = new MPLP();
      
      // 同时调用多次initialize()
      const promises = [
        mplp.initialize(),
        mplp.initialize(),
        mplp.initialize()
      ];
      
      // 应该都成功完成
      await expect(Promise.all(promises)).resolves.toBeDefined();
      expect(mplp.isInitialized()).toBe(true);
    });
  });

  describe('MPLP Class - getModule()', () => {
    it('should return module after initialization', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      
      const contextModule = mplp.getModule('context');
      expect(contextModule).toBeDefined();
      expect(typeof contextModule).toBe('object');
    });

    it('should throw if not initialized', () => {
      const mplp = new MPLP();
      
      expect(() => mplp.getModule('context')).toThrow('not initialized');
    });

    it('should throw if module not found', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      
      expect(() => mplp.getModule('invalid')).toThrow('not found');
    });

    it('should provide helpful error message for missing module', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      
      try {
        mplp.getModule('invalid');
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Available modules:');
        expect(error.message).toContain('context');
      }
    });

    it('should return different modules', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      
      const contextModule = mplp.getModule('context');
      const planModule = mplp.getModule('plan');
      
      expect(contextModule).toBeDefined();
      expect(planModule).toBeDefined();
      // 应该是不同的模块
      expect(contextModule).not.toBe(planModule);
    });
  });

  describe('MPLP Class - getAvailableModules()', () => {
    it('should return empty array before initialization', () => {
      const mplp = new MPLP();
      
      const modules = mplp.getAvailableModules();
      expect(modules).toEqual([]);
    });

    it('should return all loaded modules after initialization', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      
      const modules = mplp.getAvailableModules();
      expect(modules.length).toBe(10);
    });

    it('should return only loaded modules', async () => {
      const mplp = new MPLP({
        modules: ['context', 'plan', 'role']
      });
      await mplp.initialize();
      
      const modules = mplp.getAvailableModules();
      expect(modules).toEqual(['context', 'plan', 'role']);
    });
  });

  describe('MPLP Class - isInitialized()', () => {
    it('should return false before initialization', () => {
      const mplp = new MPLP();
      expect(mplp.isInitialized()).toBe(false);
    });

    it('should return true after initialization', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      expect(mplp.isInitialized()).toBe(true);
    });
  });

  describe('MPLP Class - getConfig()', () => {
    it('should return config copy', () => {
      const mplp = new MPLP({
        environment: 'production'
      });
      
      const config = mplp.getConfig();
      expect(config.environment).toBe('production');
    });

    it('should return immutable config', () => {
      const mplp = new MPLP();
      const config = mplp.getConfig();
      
      // 尝试修改返回的配置
      (config as any).environment = 'production';
      
      // 原始配置不应该被修改
      const config2 = mplp.getConfig();
      expect(config2.environment).toBe('development');
    });
  });

  describe('MPLP Class - reset()', () => {
    it('should reset MPLP state', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      
      expect(mplp.isInitialized()).toBe(true);
      expect(mplp.getAvailableModules().length).toBe(10);
      
      mplp.reset();
      
      expect(mplp.isInitialized()).toBe(false);
      expect(mplp.getAvailableModules().length).toBe(0);
    });

    it('should allow reinitialization after reset', async () => {
      const mplp = new MPLP();
      await mplp.initialize();
      
      mplp.reset();
      
      // 应该可以重新初始化
      await expect(mplp.initialize()).resolves.toBeUndefined();
      expect(mplp.isInitialized()).toBe(true);
    });
  });

  describe('Factory Functions - createMPLP()', () => {
    it('should create and initialize MPLP', async () => {
      const mplp = await createMPLP();
      
      expect(mplp).toBeInstanceOf(MPLP);
      expect(mplp.isInitialized()).toBe(true);
    });

    it('should accept custom config', async () => {
      const mplp = await createMPLP({
        environment: 'production',
        logLevel: 'error'
      });
      
      const config = mplp.getConfig();
      expect(config.environment).toBe('production');
      expect(config.logLevel).toBe('error');
    });

    it('should be ready to use immediately', async () => {
      const mplp = await createMPLP();
      
      // 应该可以直接获取模块
      const contextModule = mplp.getModule('context');
      expect(contextModule).toBeDefined();
    });
  });

  describe('Factory Functions - quickStart()', () => {
    it('should create MPLP with default config', async () => {
      const mplp = await quickStart();
      
      expect(mplp).toBeInstanceOf(MPLP);
      expect(mplp.isInitialized()).toBe(true);
      
      const config = mplp.getConfig();
      expect(config.environment).toBe('development');
      expect(config.logLevel).toBe('info');
    });

    it('should load all modules', async () => {
      const mplp = await quickStart();
      
      const modules = mplp.getAvailableModules();
      expect(modules.length).toBe(10);
    });
  });

  describe('Factory Functions - createProductionMPLP()', () => {
    it('should create production MPLP', async () => {
      const mplp = await createProductionMPLP();
      
      const config = mplp.getConfig();
      expect(config.environment).toBe('production');
      expect(config.logLevel).toBe('error');
    });

    it('should accept additional config', async () => {
      const mplp = await createProductionMPLP({
        modules: ['context', 'plan']
      });
      
      const config = mplp.getConfig();
      expect(config.environment).toBe('production');
      expect(config.modules).toEqual(['context', 'plan']);
    });
  });

  describe('Factory Functions - createTestMPLP()', () => {
    it('should create test MPLP', async () => {
      const mplp = await createTestMPLP();
      
      const config = mplp.getConfig();
      expect(config.environment).toBe('test');
      expect(config.logLevel).toBe('warn');
    });
  });

  describe('MPLP Class - AVAILABLE_MODULES', () => {
    it('should have correct module list', () => {
      expect(MPLP.AVAILABLE_MODULES).toEqual([
        'context',
        'plan',
        'role',
        'confirm',
        'trace',
        'extension',
        'dialog',
        'collab',
        'core',
        'network'
      ]);
    });
  });
});

