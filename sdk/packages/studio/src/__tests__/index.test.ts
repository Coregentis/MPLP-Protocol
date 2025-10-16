/**
 * @fileoverview MPLP Studio main module tests
 * @version 1.1.0-beta
 */

import {
  STUDIO_VERSION,
  STUDIO_NAME,
  STUDIO_DESCRIPTION,
  STUDIO_MODULE_STATUS,
  DEFAULT_STUDIO_CONFIG,
  createDefaultStudioConfig,
  validateStudioConfig,
  getStudioInfo
} from '../index';

describe('MPLP Studio 主模块测试', () => {
  describe('版本信息', () => {
    it('应该有正确的版本信息', () => {
      expect(STUDIO_VERSION).toBe('1.1.0-beta');
      expect(STUDIO_NAME).toBe('MPLP Studio');
      expect(STUDIO_DESCRIPTION).toBe('Visual Development Environment for MPLP');
    });

    it('应该有完整的模块状态信息', () => {
      expect(STUDIO_MODULE_STATUS).toBeDefined();
      expect(STUDIO_MODULE_STATUS.core).toBeDefined();
      expect(STUDIO_MODULE_STATUS.managers).toBeDefined();
      expect(STUDIO_MODULE_STATUS.types).toBeDefined();
      expect(STUDIO_MODULE_STATUS.builders).toBeDefined();
      expect(STUDIO_MODULE_STATUS.server).toBeDefined();
      expect(STUDIO_MODULE_STATUS.ui).toBeDefined();
      expect(STUDIO_MODULE_STATUS.overall).toBe('100% completed - 完整的可视化IDE实现');
    });
  });

  describe('默认配置', () => {
    it('应该有有效的默认配置', () => {
      expect(DEFAULT_STUDIO_CONFIG).toBeDefined();
      expect(DEFAULT_STUDIO_CONFIG.version).toBe('1.1.0-beta');
      expect(DEFAULT_STUDIO_CONFIG.environment).toBe('development');
      expect(DEFAULT_STUDIO_CONFIG.server?.port).toBe(3000);
      expect(DEFAULT_STUDIO_CONFIG.server?.host).toBe('localhost');
    });

    it('应该创建默认配置', () => {
      const config = createDefaultStudioConfig();
      expect(config.version).toBe('1.1.0-beta');
      expect(config.server?.port).toBe(3000);
    });

    it('应该支持配置覆盖', () => {
      const config = createDefaultStudioConfig({
        server: {
          port: 4000,
          host: '0.0.0.0',
          cors: {
            enabled: true,
            origins: ['http://localhost:4000']
          }
        }
      });
      expect(config.server?.port).toBe(4000);
      expect(config.server?.host).toBe('0.0.0.0');
    });
  });

  describe('配置验证', () => {
    it('应该验证有效配置', () => {
      const errors = validateStudioConfig({
        server: {
          port: 3000,
          host: 'localhost',
          cors: { enabled: true, origins: [] }
        },
        workspace: {
          defaultPath: './workspace',
          maxRecentFiles: 10,
          autoSave: true,
          autoSaveInterval: 30000
        },
        project: {
          defaultTemplate: 'basic',
          maxProjects: 50,
          backupEnabled: true,
          backupInterval: 300000
        },
        performance: {
          enableMetrics: true,
          metricsInterval: 60000,
          maxMemoryUsage: 512 * 1024 * 1024
        }
      });
      expect(errors).toHaveLength(0);
    });

    it('应该检测无效的端口', () => {
      const errors = validateStudioConfig({
        server: {
          port: 70000,
          host: 'localhost',
          cors: { enabled: true, origins: [] }
        }
      });
      expect(errors).toContain('Server port must be between 1 and 65535');
    });

    it('应该检测无效的最大最近文件数', () => {
      const errors = validateStudioConfig({
        workspace: {
          defaultPath: './workspace',
          maxRecentFiles: 0,
          autoSave: true,
          autoSaveInterval: 30000
        }
      });
      expect(errors).toContain('Max recent files must be at least 1');
    });

    it('应该检测无效的最大项目数', () => {
      const errors = validateStudioConfig({
        project: {
          defaultTemplate: 'basic',
          maxProjects: 0,
          backupEnabled: true,
          backupInterval: 300000
        }
      });
      expect(errors).toContain('Max projects must be at least 1');
    });

    it('应该检测无效的最大内存使用量', () => {
      const errors = validateStudioConfig({
        performance: {
          enableMetrics: true,
          metricsInterval: 60000,
          maxMemoryUsage: 1000
        }
      });
      expect(errors).toContain('Max memory usage must be at least 1MB');
    });
  });

  describe('Studio信息', () => {
    it('应该返回完整的Studio信息', () => {
      const info = getStudioInfo();
      expect(info.name).toBe(STUDIO_NAME);
      expect(info.version).toBe(STUDIO_VERSION);
      expect(info.description).toBe(STUDIO_DESCRIPTION);
      expect(info.basedOn).toBe('MPLP V1.0 Alpha');
      expect(info.features).toBeInstanceOf(Array);
      expect(info.features.length).toBeGreaterThan(0);
      expect(info.status).toBeDefined();
      expect(info.status.implemented).toBeInstanceOf(Array);
      expect(info.status.inProgress).toBeInstanceOf(Array);
      expect(info.status.planned).toBeInstanceOf(Array);
    });

    it('应该包含预期的功能特性', () => {
      const info = getStudioInfo();
      expect(info.features).toContain('Visual Agent Builder');
      expect(info.features).toContain('Workflow Designer');
      expect(info.features).toContain('Project Management');
      expect(info.features).toContain('Workspace Management');
    });

    it('应该包含实现状态信息', () => {
      const info = getStudioInfo();
      expect(info.status.implemented).toContain('Core Event System');
      expect(info.status.implemented).toContain('Studio Application');
      expect(info.status.implemented).toContain('Project Manager');
      expect(info.status.implemented).toContain('Workspace Manager');
    });
  });

  describe('模块导出', () => {
    it('应该导出核心组件', () => {
      expect(() => require('../core/MPLPEventManager')).not.toThrow();
      expect(() => require('../core/StudioApplication')).not.toThrow();
    });

    it('应该导出管理器组件', () => {
      expect(() => require('../project/ProjectManager')).not.toThrow();
      expect(() => require('../workspace/WorkspaceManager')).not.toThrow();
    });

    it('应该导出构建器组件', () => {
      expect(() => require('../builders/AgentBuilder')).not.toThrow();
      expect(() => require('../builders/WorkflowDesigner')).not.toThrow();
      expect(() => require('../builders/ComponentLibrary')).not.toThrow();
    });

    it('应该导出服务器组件', () => {
      expect(() => require('../server/StudioServer')).not.toThrow();
    });

    it('应该导出UI组件', () => {
      expect(() => require('../ui/index')).not.toThrow();
    });

    it('应该导出类型定义', () => {
      expect(() => require('../types/studio')).not.toThrow();
    });
  });

  describe('工厂函数', () => {
    it('应该能够创建Studio应用程序', () => {
      // 注意：这里我们只测试函数存在性，不实际创建实例
      // 因为StudioApplication可能需要复杂的初始化
      const { createStudioApplication } = require('../index');
      expect(typeof createStudioApplication).toBe('function');
    });
  });

  describe('类型安全性', () => {
    it('应该有正确的TypeScript类型', () => {
      // 这个测试通过TypeScript编译器验证
      // 如果类型定义有问题，编译会失败
      const config = createDefaultStudioConfig();
      expect(typeof config.version).toBe('string');
      expect(typeof config.environment).toBe('string');
      
      if (config.server) {
        expect(typeof config.server.port).toBe('number');
        expect(typeof config.server.host).toBe('string');
      }
    });
  });
});
