import { HealthChecker, HealthCheckConfig, HealthStatus } from '../HealthChecker';
import { ModuleManager } from '../../modules/ModuleManager';
import { EventBus } from '../../events/EventBus';
import { Logger } from '../../logging/Logger';

// Mock dependencies
const mockModuleManager = {
  getModuleStatuses: jest.fn(),
  getModuleHealthInfo: jest.fn(),
  areAllModulesHealthy: jest.fn()
} as unknown as ModuleManager;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
} as unknown as Logger;

describe('HealthChecker增强功能测试', () => {
  let healthChecker: HealthChecker;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock returns
    (mockModuleManager.getModuleStatuses as jest.Mock).mockReturnValue({});
    (mockModuleManager.getModuleHealthInfo as jest.Mock).mockResolvedValue({});
    (mockModuleManager.areAllModulesHealthy as jest.Mock).mockResolvedValue(true);
    
    healthChecker = new HealthChecker(mockModuleManager, mockLogger);
  });

  afterEach(async () => {
    await healthChecker.stop();
    healthChecker.destroy();
  });

  describe('自定义健康检查', () => {
    it('应该支持注册自定义健康检查', () => {
      const config: HealthCheckConfig = {
        name: 'test-check',
        description: 'Test health check',
        checkFunction: async () => ({ healthy: true, message: 'OK' }),
        interval: 5000,
        critical: true
      };

      healthChecker.registerHealthCheck(config);
      
      const registeredConfig = healthChecker.getHealthCheckConfig('test-check');
      expect(registeredConfig).toBeDefined();
      expect(registeredConfig!.name).toBe('test-check');
      expect(registeredConfig!.critical).toBe(true);
    });

    it('应该支持注销健康检查', () => {
      const config: HealthCheckConfig = {
        name: 'test-check',
        checkFunction: async () => ({ healthy: true })
      };

      healthChecker.registerHealthCheck(config);
      expect(healthChecker.getHealthCheckConfig('test-check')).toBeDefined();
      
      healthChecker.unregisterHealthCheck('test-check');
      expect(healthChecker.getHealthCheckConfig('test-check')).toBeUndefined();
    });

    it('应该验证健康检查配置', () => {
      expect(() => {
        healthChecker.registerHealthCheck({
          name: '',
          checkFunction: async () => ({ healthy: true })
        });
      }).toThrow('Health check must have a name and check function');
    });

    it('应该执行自定义健康检查', async () => {
      const checkFunction = jest.fn().mockResolvedValue({
        healthy: true,
        message: 'Test passed',
        data: { value: 42 }
      });

      healthChecker.registerHealthCheck({
        name: 'custom-test',
        checkFunction
      });

      await healthChecker.initialize();
      
      const report = await healthChecker.getHealthReport();
      
      expect(checkFunction).toHaveBeenCalled();
      expect(report.checks['custom-test']).toBeDefined();
      expect(report.checks['custom-test'].healthy).toBe(true);
      expect(report.checks['custom-test'].message).toBe('Test passed');
    });
  });

  describe('健康状态报告', () => {
    it('应该生成详细的健康报告', async () => {
      // Register a test check
      healthChecker.registerHealthCheck({
        name: 'test-check',
        checkFunction: async () => ({ healthy: true, message: 'OK' }),
        critical: true
      });

      await healthChecker.initialize();
      const report = await healthChecker.getHealthReport();

      expect(report).toBeDefined();
      expect(report.status).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.uptime).toBeGreaterThanOrEqual(0);
      expect(report.checks).toBeDefined();
      expect(report.modules).toBeDefined();
      expect(report.system).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.summary).toBeDefined();
    });

    it('应该正确计算整体健康状态', async () => {
      // Register healthy check
      healthChecker.registerHealthCheck({
        name: 'healthy-check',
        checkFunction: async () => ({ healthy: true }),
        critical: true
      });

      // Register unhealthy critical check
      healthChecker.registerHealthCheck({
        name: 'unhealthy-critical',
        checkFunction: async () => ({ healthy: false, message: 'Failed' }),
        critical: true
      });

      await healthChecker.initialize();
      const report = await healthChecker.getHealthReport();

      expect(report.status).toBe(HealthStatus.UNHEALTHY);
      expect(report.summary.unhealthy).toBeGreaterThan(0);
    });

    it('应该提供系统信息', async () => {
      await healthChecker.initialize();
      const report = await healthChecker.getHealthReport();

      expect(report.system.memory).toBeDefined();
      expect(report.system.platform).toBeDefined();
      expect(report.system.nodeVersion).toBeDefined();
    });
  });

  describe('监控指标收集', () => {
    it('应该收集健康检查指标', async () => {
      let callCount = 0;
      healthChecker.registerHealthCheck({
        name: 'metric-test',
        checkFunction: async () => {
          callCount++;
          return { 
            healthy: callCount % 2 === 1, // Alternate between healthy/unhealthy
            message: `Call ${callCount}` 
          };
        }
      });

      await healthChecker.initialize();
      
      // Trigger multiple checks
      await healthChecker.getHealthReport();
      await healthChecker.getHealthReport();
      await healthChecker.getHealthReport();

      const metrics = healthChecker.getHealthCheckMetrics('metric-test');
      
      expect(metrics).toBeDefined();
      expect(metrics!.checkCount).toBeGreaterThan(0);
      expect(metrics!.successCount).toBeGreaterThan(0);
      expect(metrics!.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(metrics!.uptimePercentage).toBeGreaterThanOrEqual(0);
      expect(metrics!.lastCheckTime).toBeInstanceOf(Date);
    });

    it('应该提供所有指标的摘要', async () => {
      healthChecker.registerHealthCheck({
        name: 'test1',
        checkFunction: async () => ({ healthy: true })
      });

      healthChecker.registerHealthCheck({
        name: 'test2',
        checkFunction: async () => ({ healthy: false })
      });

      await healthChecker.initialize();
      await healthChecker.getHealthReport();

      const allMetrics = healthChecker.getAllMetrics();
      
      expect(Object.keys(allMetrics)).toContain('test1');
      expect(Object.keys(allMetrics)).toContain('test2');
      expect(allMetrics.test1.checkCount).toBeGreaterThan(0);
      expect(allMetrics.test2.checkCount).toBeGreaterThan(0);
    });
  });

  describe('错误处理和重试', () => {
    it('应该处理健康检查超时', async () => {
      healthChecker.registerHealthCheck({
        name: 'timeout-test',
        checkFunction: async () => {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
          return { healthy: true };
        },
        timeout: 50 // 50ms timeout
      });

      await healthChecker.initialize();
      const report = await healthChecker.getHealthReport();

      expect(report.checks['timeout-test']).toBeDefined();
      expect(report.checks['timeout-test'].healthy).toBe(false);
      expect(report.checks['timeout-test'].message).toContain('timed out');
    });

    it('应该支持重试机制', async () => {
      let attemptCount = 0;
      healthChecker.registerHealthCheck({
        name: 'retry-test',
        checkFunction: async () => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Temporary failure');
          }
          return { healthy: true, message: 'Success after retries' };
        },
        retries: 2 // 2 retries + 1 initial = 3 total attempts
      });

      // Call initialize which will perform the health check
      await healthChecker.initialize();

      expect(attemptCount).toBe(3); // Should be exactly 3 attempts

      // Get the cached report which should include the retry-test result
      const report = healthChecker.getLastHealthReport();

      expect(report).toBeDefined();
      expect(report!.checks['retry-test']).toBeDefined();
      expect(report!.checks['retry-test'].healthy).toBe(true);
    });

    it('应该处理健康检查异常', async () => {
      healthChecker.registerHealthCheck({
        name: 'error-test',
        checkFunction: async () => {
          throw new Error('Test error');
        }
      });

      await healthChecker.initialize();
      const report = await healthChecker.getHealthReport();

      expect(report.checks['error-test']).toBeDefined();
      expect(report.checks['error-test'].healthy).toBe(false);
      expect(report.checks['error-test'].message).toContain('Test error');
    });
  });

  describe('事件发射', () => {
    it('应该发射健康检查事件', async () => {
      let passedCount = 0;
      let failedCount = 0;

      healthChecker.on('healthCheckPassed', () => {
        passedCount++;
      });

      healthChecker.on('healthCheckFailed', () => {
        failedCount++;
      });

      healthChecker.registerHealthCheck({
        name: 'pass-test',
        checkFunction: async () => ({ healthy: true })
      });

      healthChecker.registerHealthCheck({
        name: 'fail-test',
        checkFunction: async () => ({ healthy: false })
      });

      await healthChecker.initialize();

      // Give some time for events to be emitted
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(passedCount).toBeGreaterThan(0);
      expect(failedCount).toBeGreaterThan(0);
    });

    it('应该发射关键健康检查失败事件', (done) => {
      healthChecker.on('criticalHealthCheckFailed', (event) => {
        expect(event.name).toBe('critical-fail');
        expect(event.result.healthy).toBe(false);
        done();
      });

      healthChecker.registerHealthCheck({
        name: 'critical-fail',
        checkFunction: async () => ({ healthy: false, message: 'Critical failure' }),
        critical: true
      });

      healthChecker.initialize();
    });
  });

  describe('默认系统检查', () => {
    it('应该包含默认的系统健康检查', async () => {
      await healthChecker.initialize();
      
      const checks = healthChecker.listHealthChecks();
      
      expect(checks).toContain('memory');
      expect(checks).toContain('eventLoop');
      expect(checks).toContain('modules');
    });

    it('应该执行内存使用检查', async () => {
      await healthChecker.initialize();
      const report = await healthChecker.getHealthReport();

      expect(report.checks.memory).toBeDefined();
      expect(report.checks.memory.data).toBeDefined();
      expect(report.checks.memory.data?.heapUsed).toBeGreaterThan(0);
    });
  });
});
