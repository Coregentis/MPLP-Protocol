/**
 * CoreOrchestrator统一入口测试套件
 * 
 * @description 基于实际源代码实现的统一入口测试，验证初始化和配置功能
 * @version 1.0.0
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的统一入口测试模式
 */

import {
  initializeCoreOrchestrator,
  quickInitializeCoreOrchestrator,
  initializeProductionCoreOrchestrator,
  initializeTestCoreOrchestrator,
  createCoreOrchestratorConfig,
  validateCoreOrchestratorConfig,
  DEFAULT_CORE_ORCHESTRATOR_CONFIG,
  CoreOrchestratorOptions,
  CoreOrchestratorResult
} from '../../../src/modules/core/orchestrator';
import { CoreOrchestratorFactory } from '../../../src/modules/core/infrastructure/factories/core-orchestrator.factory';

// ===== 测试套件 =====

describe('CoreOrchestrator统一入口测试', () => {
  beforeEach(() => {
    // 重置工厂实例
    CoreOrchestratorFactory.resetInstance();
  });

  afterEach(() => {
    // 清理工厂实例
    CoreOrchestratorFactory.resetInstance();
  });

  describe('initializeCoreOrchestrator函数测试', () => {
    it('应该使用默认选项初始化CoreOrchestrator', async () => {
      const result: CoreOrchestratorResult = await initializeCoreOrchestrator();
      
      // 验证返回结构
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      expect(result.interfaceActivator).toBeDefined();
      expect(result.healthCheck).toBeInstanceOf(Function);
      expect(result.shutdown).toBeInstanceOf(Function);
      expect(result.getStatistics).toBeInstanceOf(Function);
      expect(result.getModuleInfo).toBeInstanceOf(Function);
      
      // 清理
      await result.shutdown();
    });

    it('应该使用自定义选项初始化CoreOrchestrator', async () => {
      const options: CoreOrchestratorOptions = {
        environment: 'testing',
        enableLogging: false,
        enableMetrics: false,
        maxConcurrentWorkflows: 10,
        workflowTimeout: 30000
      };
      
      const result = await initializeCoreOrchestrator(options);
      
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      
      // 清理
      await result.shutdown();
    });

    it('应该使用自定义配置初始化CoreOrchestrator', async () => {
      const options: CoreOrchestratorOptions = {
        customConfig: {
          enableLogging: true,
          enableMetrics: true,
          repositoryType: 'memory',
          maxConcurrentWorkflows: 50
        }
      };
      
      const result = await initializeCoreOrchestrator(options);
      
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      
      // 清理
      await result.shutdown();
    });
  });

  describe('预设初始化函数测试', () => {
    it('应该快速初始化CoreOrchestrator', async () => {
      const result = await quickInitializeCoreOrchestrator();
      
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      
      // 清理
      await result.shutdown();
    });

    it('应该初始化生产环境CoreOrchestrator', async () => {
      const result = await initializeProductionCoreOrchestrator();
      
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      
      // 清理
      await result.shutdown();
    });

    it('应该初始化测试环境CoreOrchestrator', async () => {
      const result = await initializeTestCoreOrchestrator();
      
      expect(result).toBeDefined();
      expect(result.orchestrator).toBeDefined();
      
      // 清理
      await result.shutdown();
    });
  });

  describe('getStatistics函数测试', () => {
    it('应该返回统计信息', async () => {
      const result = await initializeCoreOrchestrator();
      const statistics = await result.getStatistics();
      
      // 验证统计信息结构
      expect(statistics).toBeDefined();
      expect(typeof statistics.activeWorkflows).toBe('number');
      expect(typeof statistics.completedWorkflows).toBe('number');
      expect(typeof statistics.failedWorkflows).toBe('number');
      expect(typeof statistics.averageExecutionTime).toBe('number');
      expect(typeof statistics.resourceUtilization).toBe('number');
      expect(typeof statistics.moduleCoordinationCount).toBe('number');
      expect(typeof statistics.interfaceActivationCount).toBe('number');
      
      // 清理
      await result.shutdown();
    });
  });

  describe('getModuleInfo函数测试', () => {
    it('应该返回模块信息', async () => {
      const result = await initializeCoreOrchestrator();
      const moduleInfo = result.getModuleInfo();
      
      // 验证模块信息结构
      expect(moduleInfo).toBeDefined();
      expect(moduleInfo.name).toBe('CoreOrchestrator');
      expect(moduleInfo.version).toBe('1.0.0');
      expect(moduleInfo.description).toContain('MPLP生态系统中央协调器');
      expect(moduleInfo.layer).toBe('L3');
      expect(moduleInfo.status).toBe('active');
      expect(Array.isArray(moduleInfo.capabilities)).toBe(true);
      expect(Array.isArray(moduleInfo.supportedModules)).toBe(true);
      
      // 验证支持的模块
      expect(moduleInfo.supportedModules).toContain('context');
      expect(moduleInfo.supportedModules).toContain('plan');
      expect(moduleInfo.supportedModules).toContain('role');
      expect(moduleInfo.supportedModules).toContain('confirm');
      expect(moduleInfo.supportedModules).toContain('trace');
      expect(moduleInfo.supportedModules).toContain('extension');
      expect(moduleInfo.supportedModules).toContain('dialog');
      expect(moduleInfo.supportedModules).toContain('collab');
      expect(moduleInfo.supportedModules).toContain('network');
      
      // 清理
      await result.shutdown();
    });
  });

  describe('createCoreOrchestratorConfig函数测试', () => {
    it('应该创建minimal预设配置', () => {
      const config = createCoreOrchestratorConfig('minimal');
      
      expect(config).toBeDefined();
      expect(config.environment).toBe('development');
      expect(config.enableLogging).toBe(false);
      expect(config.enableMetrics).toBe(false);
      expect(config.maxConcurrentWorkflows).toBe(5);
      expect(config.enableReservedInterfaces).toBe(false);
    });

    it('应该创建standard预设配置', () => {
      const config = createCoreOrchestratorConfig('standard');
      
      expect(config).toBeDefined();
      expect(config.environment).toBe('development');
      expect(config.enableLogging).toBe(true);
      expect(config.enableMetrics).toBe(true);
      expect(config.maxConcurrentWorkflows).toBe(50);
      expect(config.enableReservedInterfaces).toBe(true);
    });

    it('应该创建enterprise预设配置', () => {
      const config = createCoreOrchestratorConfig('enterprise');
      
      expect(config).toBeDefined();
      expect(config.environment).toBe('production');
      expect(config.enableLogging).toBe(true);
      expect(config.enableMetrics).toBe(true);
      expect(config.enableCaching).toBe(true);
      expect(config.maxConcurrentWorkflows).toBe(1000);
      expect(config.enableReservedInterfaces).toBe(true);
    });

    it('应该在未知预设时抛出错误', () => {
      expect(() => {
        createCoreOrchestratorConfig('unknown' as 'minimal' | 'standard' | 'enterprise');
      }).toThrow('Unknown preset: unknown');
    });
  });

  describe('validateCoreOrchestratorConfig函数测试', () => {
    it('应该验证有效配置', () => {
      const validConfig: CoreOrchestratorOptions = {
        environment: 'development',
        enableLogging: true,
        maxConcurrentWorkflows: 100,
        workflowTimeout: 300000
      };
      
      const validation = validateCoreOrchestratorConfig(validConfig);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应该检测无效的maxConcurrentWorkflows', () => {
      const invalidConfig: CoreOrchestratorOptions = {
        maxConcurrentWorkflows: 0
      };
      
      const validation = validateCoreOrchestratorConfig(invalidConfig);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('maxConcurrentWorkflows must be at least 1');
    });

    it('应该对高并发数量发出警告', () => {
      const configWithWarning: CoreOrchestratorOptions = {
        maxConcurrentWorkflows: 15000
      };
      
      const validation = validateCoreOrchestratorConfig(configWithWarning);
      
      expect(validation.warnings).toContain('maxConcurrentWorkflows is very high, consider system resources');
    });

    it('应该对短超时时间发出警告', () => {
      const configWithWarning: CoreOrchestratorOptions = {
        workflowTimeout: 500
      };
      
      const validation = validateCoreOrchestratorConfig(configWithWarning);
      
      expect(validation.warnings).toContain('workflowTimeout is very short, workflows may timeout prematurely');
    });

    it('应该对生产环境未启用指标发出警告', () => {
      const configWithWarning: CoreOrchestratorOptions = {
        environment: 'production',
        enableMetrics: false
      };
      
      const validation = validateCoreOrchestratorConfig(configWithWarning);
      
      expect(validation.warnings).toContain('Metrics should be enabled in production environment');
    });
  });

  describe('DEFAULT_CORE_ORCHESTRATOR_CONFIG常量测试', () => {
    it('应该包含正确的默认配置', () => {
      expect(DEFAULT_CORE_ORCHESTRATOR_CONFIG).toBeDefined();
      expect(DEFAULT_CORE_ORCHESTRATOR_CONFIG.environment).toBe('development');
      expect(DEFAULT_CORE_ORCHESTRATOR_CONFIG.enableLogging).toBe(true);
      expect(DEFAULT_CORE_ORCHESTRATOR_CONFIG.enableMetrics).toBe(true);
      expect(DEFAULT_CORE_ORCHESTRATOR_CONFIG.enableCaching).toBe(false);
      expect(DEFAULT_CORE_ORCHESTRATOR_CONFIG.maxConcurrentWorkflows).toBe(100);
      expect(DEFAULT_CORE_ORCHESTRATOR_CONFIG.workflowTimeout).toBe(300000);
      expect(DEFAULT_CORE_ORCHESTRATOR_CONFIG.enableReservedInterfaces).toBe(true);
      expect(DEFAULT_CORE_ORCHESTRATOR_CONFIG.enableModuleCoordination).toBe(true);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理初始化过程中的错误', async () => {
      // 测试错误恢复能力
      const options: CoreOrchestratorOptions = {
        environment: 'development'
      };
      
      // 即使在某些配置下，初始化也应该成功
      const result = await initializeCoreOrchestrator(options);
      expect(result).toBeDefined();
      
      // 清理
      await result.shutdown();
    });
  });
});
