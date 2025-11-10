/**
 * 文档验证测试 - Quick Start
 * 
 * @description 确保Quick Start文档中的所有代码示例都能正常运行
 * @version 1.1.0-beta
 * @created 2025-10-21
 * 
 * 这个测试文件的目的是验证文档与代码的一致性
 * 所有测试都应该使用文档中的实际代码示例
 */

describe('Quick Start Documentation Examples', () => {
  describe('Example 1: Basic Installation and Initialization', () => {
    it('should work as documented - using constructor', async () => {
      // 从文档复制的代码
      const { MPLP } = await import('../../src/core/mplp');
      
      const mplp = new MPLP({
        environment: 'development',
        logLevel: 'info'
      });
      
      await mplp.initialize();
      
      // 验证
      expect(mplp.isInitialized()).toBe(true);
      expect(mplp.getAvailableModules().length).toBe(10);
    });

    it('should work as documented - using factory function', async () => {
      // 从文档复制的代码
      const { createMPLP } = await import('../../src/core/factory');
      
      const mplp = await createMPLP({
        environment: 'development',
        logLevel: 'info'
      });
      
      // 验证
      expect(mplp.isInitialized()).toBe(true);
    });

    it('should work as documented - using quickStart', async () => {
      // 从文档复制的代码
      const { quickStart } = await import('../../src/core/factory');
      
      const mplp = await quickStart();
      
      // 验证
      expect(mplp.isInitialized()).toBe(true);
      expect(mplp.getAvailableModules().length).toBe(10);
    });
  });

  describe('Example 2: Getting Modules', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码
      const { quickStart } = await import('../../src/core/factory');
      
      const mplp = await quickStart();
      const contextModule = mplp.getModule('context');
      const planModule = mplp.getModule('plan');
      
      // 验证
      expect(contextModule).toBeDefined();
      expect(planModule).toBeDefined();
    });
  });

  describe('Example 3: Checking Available Modules', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码
      const { quickStart } = await import('../../src/core/factory');
      
      const mplp = await quickStart();
      const modules = mplp.getAvailableModules();
      
      console.log('Available modules:', modules);
      
      // 验证
      expect(modules).toContain('context');
      expect(modules).toContain('plan');
      expect(modules).toContain('role');
      expect(modules.length).toBe(10);
    });
  });

  describe('Example 4: Production Environment', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码
      const { createProductionMPLP } = await import('../../src/core/factory');
      
      const mplp = await createProductionMPLP();
      
      // 验证
      const config = mplp.getConfig();
      expect(config.environment).toBe('production');
      expect(config.logLevel).toBe('error');
    });
  });

  describe('Example 5: Test Environment', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码
      const { createTestMPLP } = await import('../../src/core/factory');
      
      const mplp = await createTestMPLP();
      
      // 验证
      const config = mplp.getConfig();
      expect(config.environment).toBe('test');
      expect(config.logLevel).toBe('warn');
    });
  });

  describe('Example 6: Custom Module Selection', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码
      const { createMPLP } = await import('../../src/core/factory');
      
      const mplp = await createMPLP({
        modules: ['context', 'plan', 'role']
      });
      
      // 验证
      const modules = mplp.getAvailableModules();
      expect(modules).toEqual(['context', 'plan', 'role']);
    });
  });

  describe('Example 7: Checking Initialization Status', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码
      const { MPLP } = await import('../../src/core/mplp');
      
      const mplp = new MPLP();
      
      if (mplp.isInitialized()) {
        console.log('MPLP is ready to use');
      } else {
        console.log('MPLP needs initialization');
        await mplp.initialize();
      }
      
      // 验证
      expect(mplp.isInitialized()).toBe(true);
    });
  });

  describe('Example 8: Getting Configuration', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码
      const { quickStart } = await import('../../src/core/factory');
      
      const mplp = await quickStart();
      const config = mplp.getConfig();
      
      console.log('Environment:', config.environment);
      console.log('Log Level:', config.logLevel);
      console.log('Protocol Version:', config.protocolVersion);
      
      // 验证
      expect(config.environment).toBe('development');
      expect(config.logLevel).toBe('info');
      expect(config.protocolVersion).toBe('1.1.0-beta');
    });
  });

  describe('Example 9: Error Handling - Module Not Found', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码
      const { quickStart } = await import('../../src/core/factory');
      
      const mplp = await quickStart();
      
      try {
        mplp.getModule('invalid-module');
      } catch (error: any) {
        console.log('Error:', error.message);
        expect(error.message).toContain('not found');
        expect(error.message).toContain('Available modules:');
      }
    });
  });

  describe('Example 10: Error Handling - Not Initialized', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码
      const { MPLP } = await import('../../src/core/mplp');
      
      const mplp = new MPLP();
      
      try {
        mplp.getModule('context');
      } catch (error: any) {
        console.log('Error:', error.message);
        expect(error.message).toContain('not initialized');
        expect(error.message).toContain('Call initialize() first');
      }
    });
  });

  describe('Example 11: Complete Workflow', () => {
    it('should work as documented', async () => {
      // 从文档复制的代码 - 完整工作流
      const { quickStart } = await import('../../src/core/factory');
      
      // 1. 初始化MPLP
      const mplp = await quickStart();
      console.log('✅ MPLP initialized');
      
      // 2. 检查可用模块
      const modules = mplp.getAvailableModules();
      console.log('✅ Available modules:', modules.length);
      
      // 3. 获取Context模块
      const contextModule = mplp.getModule('context');
      console.log('✅ Context module loaded');
      
      // 4. 获取Plan模块
      const planModule = mplp.getModule('plan');
      console.log('✅ Plan module loaded');
      
      // 5. 获取配置
      const config = mplp.getConfig();
      console.log('✅ Config:', config.environment);
      
      // 验证
      expect(mplp.isInitialized()).toBe(true);
      expect(modules.length).toBe(10);
      expect(contextModule).toBeDefined();
      expect(planModule).toBeDefined();
      expect(config.environment).toBe('development');
    });
  });

  describe('README.md Examples', () => {
    it('should match README installation verification example', async () => {
      // 从README复制的代码
      const mplp = await import('../../src/index');
      console.log('MPLP Version:', mplp.MPLP_VERSION);
      
      // 验证
      expect(mplp.MPLP_VERSION).toBe('1.1.0-beta');
    });

    it('should match README quick start example', async () => {
      // 从README复制的代码
      const { quickStart } = await import('../../src/index');
      
      const mplp = await quickStart();
      const contextModule = mplp.getModule('context');
      
      // 验证
      expect(mplp.isInitialized()).toBe(true);
      expect(contextModule).toBeDefined();
    });
  });

  describe('TypeScript Type Definitions', () => {
    it('should have correct type exports', async () => {
      // 验证类型导出
      const { MPLP, MPLPConfig } = await import('../../src/core/mplp');
      const { createMPLP, quickStart } = await import('../../src/core/factory');
      
      expect(MPLP).toBeDefined();
      expect(createMPLP).toBeDefined();
      expect(quickStart).toBeDefined();
      
      // MPLPConfig应该是一个类型，不是值
      expect(typeof MPLPConfig).toBe('undefined');
    });

    it('should work with TypeScript type annotations', async () => {
      const { MPLP, MPLPConfig } = await import('../../src/core/mplp');
      
      // 使用类型注解
      const config: MPLPConfig = {
        environment: 'development',
        logLevel: 'info'
      };
      
      const mplp: MPLP = new MPLP(config);
      await mplp.initialize();
      
      // 验证
      expect(mplp.isInitialized()).toBe(true);
    });
  });
});

