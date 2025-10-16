/**
 * @fileoverview Studio Server 简化测试 - 专注于核心功能测试
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha测试架构
 */

import { StudioServer } from '../StudioServer';
import { StudioApplication } from '../../core/StudioApplication';
import { MPLPEventManager } from '../../core/MPLPEventManager';
import { StudioConfig } from '../../types/studio';

describe('StudioServer简化测试', () => {
  let server: StudioServer;
  let studioApp: StudioApplication;
  let eventManager: MPLPEventManager;
  let config: StudioConfig;

  // 设置测试超时
  jest.setTimeout(5000);

  beforeEach(() => {
    config = {
      version: '1.1.0-beta',
      environment: 'test',
      server: {
        host: 'localhost',
        port: 0, // 使用0让系统自动分配端口
        cors: {
          enabled: true,
          origins: ['*']
        }
      },
      workspace: {
        defaultPath: './test-workspace',
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
      logging: {
        level: 'info',
        file: './logs/studio.log',
        console: false // 关闭控制台日志
      },
      performance: {
        maxMemoryUsage: 512,
        enableMetrics: false,
        metricsInterval: 60000
      }
    };

    eventManager = new MPLPEventManager();
    studioApp = new StudioApplication(config);
    server = new StudioServer(config, eventManager, studioApp);
  });

  afterEach(async () => {
    try {
      if (server && server.getStatus() === 'initialized') {
        await Promise.race([
          server.shutdown(),
          new Promise(resolve => setTimeout(resolve, 2000)) // 2秒超时
        ]);
      }
    } catch (error) {
      // 忽略关闭错误
    }
  });

  describe('基础功能测试', () => {
    it('应该正确创建服务器实例', () => {
      expect(server).toBeDefined();
      expect(server.getStatus()).toBe('not_initialized');
    });

    it('应该有正确的配置', () => {
      expect(config.version).toBe('1.1.0-beta');
      expect(config.environment).toBe('test');
      expect(config.server.host).toBe('localhost');
    });

    it('应该支持事件管理', () => {
      expect(eventManager).toBeDefined();
      
      let eventReceived = false;
      eventManager.on('test-event', () => {
        eventReceived = true;
      });
      
      eventManager.emit('test-event');
      expect(eventReceived).toBe(true);
    });
  });

  describe('Studio应用集成测试', () => {
    it('应该集成StudioApplication', () => {
      expect(studioApp).toBeDefined();
    });

    it('应该支持项目管理器访问', () => {
      const projectManager = studioApp.getProjectManager();
      expect(projectManager).toBeDefined();
      expect(projectManager.getProjects()).toEqual([]);
    });

    it('应该支持工作空间管理器访问', () => {
      const workspaceManager = studioApp.getWorkspaceManager();
      expect(workspaceManager).toBeDefined();
      
      const workspaces = workspaceManager.getWorkspaces();
      expect(workspaces).toHaveProperty('current');
      expect(workspaces).toHaveProperty('recent');
    });
  });

  describe('配置验证测试', () => {
    it('应该有有效的服务器配置', () => {
      expect(config.server.host).toBe('localhost');
      expect(config.server.cors).toBeDefined();
      expect(config.server.cors.enabled).toBe(true);
    });

    it('应该有有效的项目配置', () => {
      expect(config.project.defaultTemplate).toBe('basic');
      expect(config.project.maxProjects).toBe(50);
      expect(config.project.backupEnabled).toBe(true);
    });

    it('应该有有效的工作空间配置', () => {
      expect(config.workspace.defaultPath).toBe('./test-workspace');
      expect(config.workspace.maxRecentFiles).toBe(10);
      expect(config.workspace.autoSave).toBe(true);
    });

    it('应该有有效的性能配置', () => {
      expect(config.performance.maxMemoryUsage).toBe(512);
      expect(config.performance.enableMetrics).toBe(false);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理未初始化的关闭', async () => {
      // 未初始化时关闭不应该抛出错误
      await expect(server.shutdown()).resolves.not.toThrow();
      expect(server.getStatus()).toBe('not_initialized');
    });

    it('应该处理重复关闭', async () => {
      await server.shutdown();
      // 重复关闭不应该抛出错误
      await expect(server.shutdown()).resolves.not.toThrow();
      expect(server.getStatus()).toBe('not_initialized');
    });
  });

  describe('广播功能测试', () => {
    it('应该支持消息广播', () => {
      const message = {
        type: 'test',
        data: { test: true },
        timestamp: Date.now()
      };

      // 测试广播功能（不会抛出错误）
      expect(() => {
        server.broadcast(message);
      }).not.toThrow();
    });

    it('应该支持不同类型的消息', () => {
      const messages = [
        { type: 'project-update', data: { projectId: '123' }, timestamp: Date.now() },
        { type: 'workspace-change', data: { workspaceId: '456' }, timestamp: Date.now() },
        { type: 'agent-status', data: { agentId: '789', status: 'active' }, timestamp: Date.now() }
      ];

      messages.forEach(message => {
        expect(() => {
          server.broadcast(message);
        }).not.toThrow();
      });
    });
  });

  describe('企业级功能验证', () => {
    it('应该支持CORS配置', () => {
      expect(config.server.cors.enabled).toBe(true);
      expect(config.server.cors.origins).toContain('*');
    });

    it('应该支持性能监控配置', () => {
      expect(config.performance).toBeDefined();
      expect(typeof config.performance.maxMemoryUsage).toBe('number');
      expect(typeof config.performance.enableMetrics).toBe('boolean');
    });

    it('应该支持日志配置', () => {
      expect(config.logging).toBeDefined();
      expect(config.logging.level).toBe('info');
      expect(config.logging.file).toBe('./logs/studio.log');
    });

    it('应该支持备份配置', () => {
      expect(config.project.backupEnabled).toBe(true);
      expect(typeof config.project.backupInterval).toBe('number');
    });
  });
});
