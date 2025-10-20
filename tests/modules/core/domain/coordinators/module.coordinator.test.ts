/**
 * ModuleCoordinator测试用例
 * 验证模块协调器的核心功能
 */

import { ModuleCoordinator, ModuleInfo, ServiceInfo } from '../../../../../src/core/orchestrator/module.coordinator';

describe('ModuleCoordinator测试', () => {
  let coordinator: ModuleCoordinator;

  beforeEach(() => {
    coordinator = new ModuleCoordinator(5000);
  });

  describe('模块注册测试', () => {
    it('应该成功注册有效模块', async () => {
      const moduleInfo: ModuleInfo = {
        moduleId: 'context',
        moduleName: 'Context Module',
        version: '1.0.0',
        status: 'inactive',
        services: [
          {
            serviceId: 'getContext',
            serviceName: 'Get Context',
            inputSchema: { contextId: 'string' },
            outputSchema: { context: 'object' },
            timeout: 5000,
            retryPolicy: {
              maxRetries: 3,
              retryDelay: 1000,
              backoffStrategy: 'exponential',
              retryableErrors: ['timeout']
            }
          }
        ],
        endpoints: [
          {
            endpointId: 'main',
            url: 'http://localhost:3001/context',
            method: 'POST'
          }
        ],
        healthCheck: {
          endpoint: '/health',
          interval: 30000,
          timeout: 5000,
          retries: 3
        },
        metadata: {
          capabilities: ['context_management'],
          dependencies: [],
          resources: {
            cpuCores: 1,
            memoryMb: 256,
            diskSpaceMb: 100,
            networkBandwidth: 10
          },
          tags: { type: 'core', layer: 'L2' }
        },
        registeredAt: '',
        lastHeartbeat: ''
      };

      await coordinator.registerModule(moduleInfo);

      const modules = await coordinator.discoverModules();
      expect(modules).toHaveLength(1);
      expect(modules[0].moduleId).toBe('context');
      expect(modules[0].status).toBe('active');
    });

    it('应该拒绝无效模块注册', async () => {
      const invalidModule: ModuleInfo = {
        moduleId: '', // 无效：空ID
        moduleName: '',
        version: '1.0.0',
        status: 'inactive',
        services: [], // 无效：没有服务
        endpoints: [],
        healthCheck: {
          endpoint: '/health',
          interval: 30000,
          timeout: 5000,
          retries: 3
        },
        metadata: {
          capabilities: [],
          dependencies: [],
          resources: {
            cpuCores: 1,
            memoryMb: 256,
            diskSpaceMb: 100,
            networkBandwidth: 10
          },
          tags: {}
        },
        registeredAt: '',
        lastHeartbeat: ''
      };

      await expect(coordinator.registerModule(invalidModule))
        .rejects.toThrow('Module ID is required');
    });
  });

  describe('服务发现测试', () => {
    beforeEach(async () => {
      // 注册测试模块
      const contextModule: ModuleInfo = {
        moduleId: 'context',
        moduleName: 'Context Module',
        version: '1.0.0',
        status: 'inactive',
        services: [
          {
            serviceId: 'getContext',
            serviceName: 'Get Context',
            inputSchema: {},
            outputSchema: {},
            timeout: 5000,
            retryPolicy: {
              maxRetries: 3,
              retryDelay: 1000,
              backoffStrategy: 'exponential',
              retryableErrors: []
            }
          }
        ],
        endpoints: [{ endpointId: 'main', url: 'http://localhost:3001', method: 'POST' }],
        healthCheck: { endpoint: '/health', interval: 30000, timeout: 5000, retries: 3 },
        metadata: {
          capabilities: [],
          dependencies: [],
          resources: { cpuCores: 1, memoryMb: 256, diskSpaceMb: 100, networkBandwidth: 10 },
          tags: {}
        },
        registeredAt: '',
        lastHeartbeat: ''
      };

      const planModule: ModuleInfo = {
        ...contextModule,
        moduleId: 'plan',
        moduleName: 'Plan Module',
        services: [
          {
            serviceId: 'createPlan',
            serviceName: 'Create Plan',
            inputSchema: {},
            outputSchema: {},
            timeout: 5000,
            retryPolicy: {
              maxRetries: 3,
              retryDelay: 1000,
              backoffStrategy: 'exponential',
              retryableErrors: []
            }
          }
        ]
      };

      await coordinator.registerModule(contextModule);
      await coordinator.registerModule(planModule);
    });

    it('应该发现所有活跃模块', async () => {
      const modules = await coordinator.discoverModules();
      
      expect(modules).toHaveLength(2);
      expect(modules.map(m => m.moduleId)).toContain('context');
      expect(modules.map(m => m.moduleId)).toContain('plan');
      expect(modules.every(m => m.status === 'active')).toBe(true);
    });
  });

  describe('服务调用测试', () => {
    beforeEach(async () => {
      const testModule: ModuleInfo = {
        moduleId: 'test',
        moduleName: 'Test Module',
        version: '1.0.0',
        status: 'inactive',
        services: [
          {
            serviceId: 'testService',
            serviceName: 'Test Service',
            inputSchema: { param1: 'string' },
            outputSchema: { result: 'string' },
            timeout: 5000,
            retryPolicy: {
              maxRetries: 3,
              retryDelay: 1000,
              backoffStrategy: 'exponential',
              retryableErrors: ['timeout']
            }
          }
        ],
        endpoints: [{ endpointId: 'main', url: 'http://localhost:3002', method: 'POST' }],
        healthCheck: { endpoint: '/health', interval: 30000, timeout: 5000, retries: 3 },
        metadata: {
          capabilities: ['testing'],
          dependencies: [],
          resources: { cpuCores: 1, memoryMb: 256, diskSpaceMb: 100, networkBandwidth: 10 },
          tags: { type: 'test' }
        },
        registeredAt: '',
        lastHeartbeat: ''
      };

      await coordinator.registerModule(testModule);
    });

    it('应该成功调用模块服务', async () => {
      const result = await coordinator.invokeModuleService(
        'test',
        'testService',
        { param1: 'test_value' }
      );

      expect(result.status).toBe('success');
      expect(result.moduleId).toBe('test');
      expect(result.serviceId).toBe('testService');
      expect(result.result).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.requestId).toBeDefined();
    });

    it('应该处理未注册模块的调用', async () => {
      await expect(coordinator.invokeModuleService('unknown', 'service', {}))
        .rejects.toThrow('Module unknown not registered');
    });

    it('应该处理不存在服务的调用', async () => {
      await expect(coordinator.invokeModuleService('test', 'unknownService', {}))
        .rejects.toThrow('Service unknownService not found in module test');
    });
  });

  describe('模块协调测试', () => {
    beforeEach(async () => {
      // 注册多个测试模块
      const modules = ['context', 'plan', 'role'].map(id => ({
        moduleId: id,
        moduleName: `${id.charAt(0).toUpperCase() + id.slice(1)} Module`,
        version: '1.0.0',
        status: 'inactive' as const,
        services: [
          {
            serviceId: 'testOperation',
            serviceName: 'Test Operation',
            inputSchema: {},
            outputSchema: {},
            timeout: 5000,
            retryPolicy: {
              maxRetries: 3,
              retryDelay: 1000,
              backoffStrategy: 'exponential' as const,
              retryableErrors: []
            }
          }
        ],
        endpoints: [{ endpointId: 'main', url: `http://localhost:300${id.length}`, method: 'POST' as const }],
        healthCheck: { endpoint: '/health', interval: 30000, timeout: 5000, retries: 3 },
        metadata: {
          capabilities: [id],
          dependencies: [],
          resources: { cpuCores: 1, memoryMb: 256, diskSpaceMb: 100, networkBandwidth: 10 },
          tags: { type: 'test' }
        },
        registeredAt: '',
        lastHeartbeat: ''
      }));

      for (const module of modules) {
        await coordinator.registerModule(module);
      }
    });

    it('应该成功协调多个模块', async () => {
      const result = await coordinator.coordinateModules(
        ['context', 'plan', 'role'],
        'testOperation'
      );

      expect(result.status).toBe('success');
      expect(result.results).toHaveLength(3);
      expect(result.results.every(r => r.status === 'success')).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('应该处理部分模块失败的情况', async () => {
      // 协调包含未注册模块的列表
      const result = await coordinator.coordinateModules(
        ['context', 'unknown', 'plan'],
        'testOperation'
      );

      expect(result.status).toBe('partial_success');
      expect(result.results).toHaveLength(3);
      expect(result.results.filter(r => r.status === 'success')).toHaveLength(2);
      expect(result.results.filter(r => r.status === 'error')).toHaveLength(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('错误处理测试', () => {
    it('应该正确处理超时错误', async () => {
      const timeoutError = {
        errorId: 'error-001',
        moduleId: 'test',
        serviceId: 'slowService',
        errorType: 'timeout' as const,
        message: 'Service call timed out',
        timestamp: new Date().toISOString()
      };

      const result = await coordinator.handleModuleError(timeoutError);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('retry');
      expect(result.retryAfter).toBe(2000);
    });

    it('应该正确处理连接错误', async () => {
      const connectionError = {
        errorId: 'error-002',
        moduleId: 'test',
        serviceId: 'service',
        errorType: 'connection' as const,
        message: 'Connection failed',
        timestamp: new Date().toISOString()
      };

      const result = await coordinator.handleModuleError(connectionError);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('retry');
      expect(result.retryAfter).toBe(5000);
    });

    it('应该正确处理验证错误', async () => {
      const validationError = {
        errorId: 'error-003',
        moduleId: 'test',
        serviceId: 'service',
        errorType: 'validation' as const,
        message: 'Invalid parameters',
        timestamp: new Date().toISOString()
      };

      const result = await coordinator.handleModuleError(validationError);

      expect(result.handled).toBe(true);
      expect(result.action).toBe('abort');
    });
  });

  describe('重试机制测试', () => {
    it('应该成功重试失败的操作', async () => {
      const failedOperation = {
        operationId: 'op-001',
        moduleId: 'test',
        serviceId: 'retryService',
        parameters: { test: 'value' },
        error: {
          errorId: 'error-001',
          moduleId: 'test',
          serviceId: 'retryService',
          errorType: 'timeout' as const,
          message: 'Timeout',
          timestamp: new Date().toISOString()
        },
        retryCount: 0,
        maxRetries: 3,
        lastAttempt: new Date().toISOString()
      };

      // 先注册模块
      const testModule: ModuleInfo = {
        moduleId: 'test',
        moduleName: 'Test Module',
        version: '1.0.0',
        status: 'inactive',
        services: [
          {
            serviceId: 'retryService',
            serviceName: 'Retry Service',
            inputSchema: {},
            outputSchema: {},
            timeout: 5000,
            retryPolicy: {
              maxRetries: 3,
              retryDelay: 1000,
              backoffStrategy: 'exponential',
              retryableErrors: []
            }
          }
        ],
        endpoints: [{ endpointId: 'main', url: 'http://localhost:3003', method: 'POST' }],
        healthCheck: { endpoint: '/health', interval: 30000, timeout: 5000, retries: 3 },
        metadata: {
          capabilities: [],
          dependencies: [],
          resources: { cpuCores: 1, memoryMb: 256, diskSpaceMb: 100, networkBandwidth: 10 },
          tags: {}
        },
        registeredAt: '',
        lastHeartbeat: ''
      };

      await coordinator.registerModule(testModule);

      const result = await coordinator.retryOperation(failedOperation);

      expect(result.operationId).toBe('op-001');
      expect(result.status).toBe('success');
      expect(result.totalRetries).toBe(1);
      expect(result.result).toBeDefined();
    });

    it('应该在达到最大重试次数后停止重试', async () => {
      const failedOperation = {
        operationId: 'op-002',
        moduleId: 'test',
        serviceId: 'failService',
        parameters: {},
        error: {
          errorId: 'error-002',
          moduleId: 'test',
          serviceId: 'failService',
          errorType: 'execution' as const,
          message: 'Execution failed',
          timestamp: new Date().toISOString()
        },
        retryCount: 3, // 已达到最大重试次数
        maxRetries: 3,
        lastAttempt: new Date().toISOString()
      };

      const result = await coordinator.retryOperation(failedOperation);

      expect(result.operationId).toBe('op-002');
      expect(result.status).toBe('max_retries_exceeded');
      expect(result.totalRetries).toBe(3);
    });
  });
});
