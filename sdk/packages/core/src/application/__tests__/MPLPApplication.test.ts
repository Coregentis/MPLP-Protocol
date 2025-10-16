import { MPLPApplication } from '../MPLPApplication';
import { ApplicationConfig } from '../ApplicationConfig';
import { ApplicationStatus } from '../ApplicationStatus';

describe('MPLPApplication', () => {
  let app: MPLPApplication;
  let config: ApplicationConfig;

  beforeEach(() => {
    config = {
      name: 'TestApp',
      version: '1.0.0',
      description: 'Test application for MPLP SDK',
    };
  });

  afterEach(async () => {
    if (app && app.getStatus() === ApplicationStatus.RUNNING) {
      await app.stop();
    }
  });

  describe('构造函数', () => {
    it('应该成功创建应用实例', () => {
      app = new MPLPApplication(config);
      
      expect(app).toBeInstanceOf(MPLPApplication);
      expect(app.getId()).toBeDefined();
      expect(app.getStatus()).toBe(ApplicationStatus.CREATED);
      expect(app.getConfig().name).toBe('TestApp');
      expect(app.getConfig().version).toBe('1.0.0');
    });

    it('应该生成唯一的应用ID', () => {
      const app1 = new MPLPApplication(config);
      const app2 = new MPLPApplication(config);
      
      expect(app1.getId()).not.toBe(app2.getId());
    });

    it('应该正确设置配置', () => {
      app = new MPLPApplication(config);
      const appConfig = app.getConfig();
      
      expect(appConfig.name).toBe(config.name);
      expect(appConfig.version).toBe(config.version);
      expect(appConfig.description).toBe(config.description);
    });
  });

  describe('初始化', () => {
    beforeEach(() => {
      app = new MPLPApplication(config);
    });

    it('应该成功初始化应用', async () => {
      await app.initialize();
      
      expect(app.getStatus()).toBe(ApplicationStatus.INITIALIZED);
    });

    it('应该在初始化过程中触发事件', async () => {
      const initializingHandler = jest.fn();
      const initializedHandler = jest.fn();
      
      app.on('initializing', initializingHandler);
      app.on('initialized', initializedHandler);
      
      await app.initialize();
      
      expect(initializingHandler).toHaveBeenCalled();
      expect(initializedHandler).toHaveBeenCalled();
    });

    it('应该在重复初始化时抛出错误', async () => {
      await app.initialize();
      
      await expect(app.initialize()).rejects.toThrow(
        'Cannot initialize application in status: initialized'
      );
    });

    it('应该在配置无效时抛出错误', async () => {
      const invalidConfig = { name: '', version: '1.0.0' };

      expect(() => {
        new MPLPApplication(invalidConfig);
      }).toThrow('Application name is required and must be a string');
    });
  });

  describe('启动和停止', () => {
    beforeEach(async () => {
      app = new MPLPApplication(config);
      await app.initialize();
    });

    it('应该成功启动应用', async () => {
      await app.start();

      // Wait a bit to ensure uptime is recorded
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(app.getStatus()).toBe(ApplicationStatus.RUNNING);
      expect(app.getUptime()).toBeGreaterThan(0);
    });

    it('应该在启动过程中触发事件', async () => {
      const startingHandler = jest.fn();
      const startedHandler = jest.fn();
      
      app.on('starting', startingHandler);
      app.on('started', startedHandler);
      
      await app.start();
      
      expect(startingHandler).toHaveBeenCalled();
      expect(startedHandler).toHaveBeenCalled();
    });

    it('应该成功停止运行中的应用', async () => {
      await app.start();
      await app.stop();
      
      expect(app.getStatus()).toBe(ApplicationStatus.STOPPED);
    });

    it('应该在停止过程中触发事件', async () => {
      await app.start();
      
      const stoppingHandler = jest.fn();
      const stoppedHandler = jest.fn();
      
      app.on('stopping', stoppingHandler);
      app.on('stopped', stoppedHandler);
      
      await app.stop();
      
      expect(stoppingHandler).toHaveBeenCalled();
      expect(stoppedHandler).toHaveBeenCalled();
    });

    it('应该在未初始化时启动失败', async () => {
      const uninitializedApp = new MPLPApplication(config);
      
      await expect(uninitializedApp.start()).rejects.toThrow(
        'Cannot start application in status: created'
      );
    });

    it('应该在未运行时停止失败', async () => {
      await expect(app.stop()).rejects.toThrow(
        'Cannot stop application in status: initialized'
      );
    });
  });

  describe('统计信息', () => {
    beforeEach(async () => {
      app = new MPLPApplication(config);
      await app.initialize();
    });

    it('应该返回正确的统计信息', () => {
      const stats = app.getStats();
      
      expect(stats.id).toBe(app.getId());
      expect(stats.name).toBe(config.name);
      expect(stats.version).toBe(config.version);
      expect(stats.status).toBe(ApplicationStatus.INITIALIZED);
      expect(stats.moduleCount).toBe(0);
      expect(stats.modules).toEqual([]);
    });

    it('应该在运行时显示正确的运行时间', async () => {
      await app.start();
      
      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const uptime = app.getUptime();
      expect(uptime).toBeGreaterThan(0);
    });

    it('应该在停止后保持运行时间', async () => {
      await app.start();
      await new Promise(resolve => setTimeout(resolve, 10));
      await app.stop();
      
      const uptime = app.getUptime();
      expect(uptime).toBeGreaterThan(0);
    });
  });

  describe('健康检查', () => {
    beforeEach(async () => {
      app = new MPLPApplication(config);
      await app.initialize();
    });

    it('应该返回健康状态', async () => {
      const healthStatus = await app.getHealthStatus();
      
      expect(healthStatus).toBeDefined();
      // 具体的健康检查逻辑将在HealthChecker类中实现
    });
  });

  describe('错误处理', () => {
    it('应该在初始化失败时设置错误状态', async () => {
      // 创建一个会导致初始化失败的配置
      const badConfig = { name: '', version: 'invalid-version' };

      expect(() => {
        new MPLPApplication(badConfig);
      }).toThrow('Application name is required and must be a string');
    });
  });
});

describe('ApplicationConfig验证', () => {
  it('应该接受有效的配置', () => {
    const validConfig: ApplicationConfig = {
      name: 'TestApp',
      version: '1.0.0',
    };
    
    expect(() => new MPLPApplication(validConfig)).not.toThrow();
  });

  it('应该在缺少名称时抛出错误', () => {
    const invalidConfig = { name: '', version: '1.0.0' } as ApplicationConfig;

    expect(() => {
      new MPLPApplication(invalidConfig);
    }).toThrow('Application name is required and must be a string');
  });

  it('应该在缺少版本时抛出错误', () => {
    const invalidConfig = { name: 'TestApp', version: '' } as ApplicationConfig;

    expect(() => {
      new MPLPApplication(invalidConfig);
    }).toThrow('Application version is required and must be a string');
  });
});
