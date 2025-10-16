import { ModuleManager, ModuleDependency, ModuleRegistrationOptions } from '../ModuleManager';
import { BaseModule } from '../BaseModule';
import { EventBus } from '../../events/EventBus';
import { Logger } from '../../logging/Logger';
import { ModuleError } from '../../errors/ModuleError';

// Mock modules for testing
class TestModule extends BaseModule {
  private _healthy: boolean = true;

  constructor(name: string, version: string = '1.0.0', healthy: boolean = true) {
    super(name, version);
    this._healthy = healthy;
  }

  protected async onInitialize(): Promise<void> {
    // Test initialization
  }

  protected async onStart(): Promise<void> {
    // Test start
  }

  protected async onStop(): Promise<void> {
    // Test stop
  }

  protected override async onHealthCheck(): Promise<boolean> {
    return this._healthy;
  }

  setHealthy(healthy: boolean): void {
    this._healthy = healthy;
  }
}

describe('ModuleManager增强功能测试', () => {
  let moduleManager: ModuleManager;
  let eventBus: EventBus;
  let logger: Logger;

  beforeEach(async () => {
    eventBus = new EventBus();
    logger = new Logger('TestLogger'); // Reduce log noise in tests
    moduleManager = new ModuleManager(eventBus, logger);
    await moduleManager.initialize();
  });

  describe('依赖管理', () => {
    it('应该支持模块依赖注册', async () => {
      const moduleA = new TestModule('ModuleA', '1.0.0');
      const moduleB = new TestModule('ModuleB', '1.0.0');

      // Register dependency first
      await moduleManager.registerModule('moduleA', moduleA);

      // Register dependent module
      const options: ModuleRegistrationOptions = {
        metadata: {
          name: 'ModuleB',
          version: '1.0.0',
          dependencies: [{ name: 'moduleA', version: '1.0.0' }]
        }
      };

      await moduleManager.registerModule('moduleB', moduleB, options);

      const dependencies = moduleManager.getModuleDependencies('moduleB');
      expect(dependencies).toContain('moduleA');

      const dependents = moduleManager.getModuleDependents('moduleA');
      expect(dependents).toContain('moduleB');
    });

    it('应该验证依赖版本兼容性', async () => {
      const moduleA = new TestModule('ModuleA', '1.0.0');
      const moduleB = new TestModule('ModuleB', '1.0.0');

      await moduleManager.registerModule('moduleA', moduleA, {
        metadata: { name: 'ModuleA', version: '1.0.0' }
      });

      const options: ModuleRegistrationOptions = {
        metadata: {
          name: 'ModuleB',
          version: '1.0.0',
          dependencies: [{ name: 'moduleA', version: '2.0.0' }] // Incompatible version
        }
      };

      await expect(
        moduleManager.registerModule('moduleB', moduleB, options)
      ).rejects.toThrow(ModuleError);
    });

    it('应该拒绝缺失的必需依赖', async () => {
      const moduleB = new TestModule('ModuleB', '1.0.0');

      const options: ModuleRegistrationOptions = {
        metadata: {
          name: 'ModuleB',
          version: '1.0.0',
          dependencies: [{ name: 'moduleA', optional: false }]
        }
      };

      await expect(
        moduleManager.registerModule('moduleB', moduleB, options)
      ).rejects.toThrow(ModuleError);
    });

    it('应该允许可选依赖缺失', async () => {
      const moduleB = new TestModule('ModuleB', '1.0.0');

      const options: ModuleRegistrationOptions = {
        metadata: {
          name: 'ModuleB',
          version: '1.0.0',
          dependencies: [{ name: 'moduleA', optional: true }]
        }
      };

      await expect(
        moduleManager.registerModule('moduleB', moduleB, options)
      ).resolves.not.toThrow();
    });

    it('应该检测循环依赖', async () => {
      const moduleA = new TestModule('ModuleA', '1.0.0');
      const moduleB = new TestModule('ModuleB', '1.0.0');

      // 先注册moduleA，不设置依赖
      await moduleManager.registerModule('moduleA', moduleA, {
        metadata: {
          name: 'ModuleA',
          version: '1.0.0'
        }
      });

      // 然后注册moduleB，依赖moduleA
      await moduleManager.registerModule('moduleB', moduleB, {
        metadata: {
          name: 'ModuleB',
          version: '1.0.0',
          dependencies: [{ name: 'moduleA' }]  // moduleB依赖moduleA
        }
      });

      // 现在更新moduleA的依赖，使其依赖moduleB，形成循环
      // 我们需要重新注册moduleA来更新其依赖，使用新的模块实例
      await moduleManager.unregisterModule('moduleA');
      const newModuleA = new TestModule('ModuleA', '1.0.0');
      await moduleManager.registerModule('moduleA', newModuleA, {
        metadata: {
          name: 'ModuleA',
          version: '1.0.0',
          dependencies: [{ name: 'moduleB' }]  // moduleA依赖moduleB，形成循环
        }
      });

      // 启动时应该检测到循环依赖
      await expect(moduleManager.startAll()).rejects.toThrow(ModuleError);
    });
  });

  describe('生命周期管理', () => {
    it('应该按依赖顺序启动模块', async () => {
      const startOrder: string[] = [];
      
      class OrderTestModule extends TestModule {
        constructor(name: string) {
          super(name, '1.0.0');
        }

        protected override async onStart(): Promise<void> {
          startOrder.push(this.getName());
        }
      }

      const moduleA = new OrderTestModule('ModuleA');
      const moduleB = new OrderTestModule('ModuleB');
      const moduleC = new OrderTestModule('ModuleC');

      // A -> B -> C dependency chain
      await moduleManager.registerModule('moduleA', moduleA);
      
      await moduleManager.registerModule('moduleB', moduleB, {
        metadata: {
          name: 'ModuleB',
          version: '1.0.0',
          dependencies: [{ name: 'moduleA' }]
        }
      });

      await moduleManager.registerModule('moduleC', moduleC, {
        metadata: {
          name: 'ModuleC',
          version: '1.0.0',
          dependencies: [{ name: 'moduleB' }]
        }
      });

      await moduleManager.startAll();

      expect(startOrder).toEqual(['ModuleA', 'ModuleB', 'ModuleC']);
    });

    it('应该支持单个模块启动', async () => {
      const moduleA = new TestModule('ModuleA', '1.0.0');
      const moduleB = new TestModule('ModuleB', '1.0.0');

      await moduleManager.registerModule('moduleA', moduleA);
      await moduleManager.registerModule('moduleB', moduleB, {
        metadata: {
          name: 'ModuleB',
          version: '1.0.0',
          dependencies: [{ name: 'moduleA' }]
        }
      });

      await moduleManager.startModule('moduleB');

      expect(moduleA.isStarted()).toBe(true);
      expect(moduleB.isStarted()).toBe(true);
    });

    it('应该支持自动启动选项', async () => {
      const module = new TestModule('TestModule', '1.0.0');

      await moduleManager.registerModule('testModule', module, {
        autoStart: true
      });

      expect(module.isStarted()).toBe(true);
    });
  });

  describe('状态和健康监控', () => {
    it('应该提供详细的模块状态信息', async () => {
      const module = new TestModule('TestModule', '1.0.0');

      await moduleManager.registerModule('testModule', module, {
        metadata: {
          name: 'TestModule',
          version: '1.0.0',
          description: 'Test module'
        }
      });

      await moduleManager.startModule('testModule');

      // 等待一小段时间确保uptime > 0
      await new Promise(resolve => setTimeout(resolve, 10));

      const status = moduleManager.getModuleStatus('testModule');

      expect(status).toBeDefined();
      expect(status!.name).toBe('testModule');
      expect(status!.version).toBe('1.0.0');
      expect(status!.uptime).toBeGreaterThan(0);
      expect(status!.metadata?.description).toBe('Test module');
    });

    it('应该提供详细的健康检查信息', async () => {
      const healthyModule = new TestModule('HealthyModule', '1.0.0', true);
      const unhealthyModule = new TestModule('UnhealthyModule', '1.0.0', false);

      await moduleManager.registerModule('healthy', healthyModule);
      await moduleManager.registerModule('unhealthy', unhealthyModule);

      const healthInfo = await moduleManager.getModuleHealthInfo();

      expect(healthInfo.healthy.healthy).toBe(true);
      expect(healthInfo.unhealthy.healthy).toBe(false);
      expect(healthInfo.healthy.checkDuration).toBeGreaterThanOrEqual(0);
      expect(healthInfo.unhealthy.checkDuration).toBeGreaterThanOrEqual(0);
    });

    it('应该提供依赖图信息', async () => {
      const moduleA = new TestModule('ModuleA', '1.0.0');
      const moduleB = new TestModule('ModuleB', '1.0.0');

      await moduleManager.registerModule('moduleA', moduleA);
      await moduleManager.registerModule('moduleB', moduleB, {
        metadata: {
          name: 'ModuleB',
          version: '1.0.0',
          dependencies: [{ name: 'moduleA' }]
        }
      });

      const graph = moduleManager.getDependencyGraph();
      
      expect(graph.moduleB).toContain('moduleA');
      expect(graph.moduleA).toEqual([]);
    });
  });

  describe('错误处理', () => {
    it('应该在模块初始化失败时清理', async () => {
      class FailingModule extends TestModule {
        protected override async onInitialize(): Promise<void> {
          throw new Error('Initialization failed');
        }
      }

      const module = new FailingModule('FailingModule', '1.0.0');

      await expect(
        moduleManager.registerModule('failing', module)
      ).rejects.toThrow(ModuleError);

      expect(moduleManager.getModule('failing')).toBeUndefined();
    });

    it('应该处理模块启动失败', async () => {
      class FailingModule extends TestModule {
        protected override async onStart(): Promise<void> {
          throw new Error('Start failed');
        }
      }

      const module = new FailingModule('FailingModule', '1.0.0');
      await moduleManager.registerModule('failing', module);

      await expect(
        moduleManager.startModule('failing')
      ).rejects.toThrow(ModuleError);
    });
  });
});
