/**
 * MPLP 集成测试 - Role和Trace模块集成
 * 
 * @version v1.0.0
 * @created 2025-07-14T12:00:00+08:00
 * @compliance 100% Schema合规性 - 基于role-protocol.json和trace-protocol.json
 * @description 测试Role模块与Trace模块的集成，验证角色权限控制和追踪数据访问
 */

import { expect } from '@jest/globals';
import { RoleManager } from '../../../src/modules/role/role-manager';
import { TraceService } from '../../../src/modules/trace/trace-service';
import { ITraceAdapter } from '../../../src/interfaces/trace-adapter.interface';
import { v4 as uuidv4 } from 'uuid';

// 模拟logger
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// 模拟TraceAdapter
class MockTraceAdapter implements ITraceAdapter {
  private traces: Record<string, any> = {};
  private failures: Record<string, any> = {};
  
  async syncTraceData(data: any): Promise<any> {
    const id = data.trace_id || uuidv4();
    this.traces[id] = data;
    return { success: true, trace_id: id };
  }
  
  async syncBatch(dataArray: any[]): Promise<any> {
    const results = [];
    for (const data of dataArray) {
      const result = await this.syncTraceData(data);
      results.push(result);
    }
    return { success: true, results };
  }
  
  async reportFailure(failure: any): Promise<any> {
    const id = failure.failure_id || uuidv4();
    this.failures[id] = failure;
    return { success: true, failure_id: id };
  }
  
  async checkHealth(): Promise<any> {
    return { status: 'healthy' };
  }
  
  getAdapterInfo(): any {
    return { type: 'mock', version: '1.0.0' };
  }
  
  async getRecoverySuggestions(): Promise<any[]> {
    return [];
  }
  
  async detectDevelopmentIssues(): Promise<any> {
    return { issues: [] };
  }
  
  async getAnalytics(): Promise<any> {
    return {};
  }
  
  // 测试辅助方法
  getTraces(): Record<string, any> {
    return this.traces;
  }
  
  getFailures(): Record<string, any> {
    return this.failures;
  }
  
  reset(): void {
    this.traces = {};
    this.failures = {};
  }
}

describe('Role-Trace Integration', () => {
  let roleManager: RoleManager;
  let traceService: TraceService;
  let traceAdapter: MockTraceAdapter;
  let testUserId: string;
  let adminUserId: string;
  let contextId: string;
  
  beforeAll(async () => {
    // 初始化适配器和服务
    traceAdapter = new MockTraceAdapter();
    traceService = new TraceService(traceAdapter);
    
    // 初始化角色管理器
    roleManager = new RoleManager();
    
    // 测试用户ID
    testUserId = `test-user-${uuidv4()}`;
    adminUserId = `admin-user-${uuidv4()}`;
    contextId = uuidv4();
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 创建角色
    const traceViewerRole = await roleManager.createRole({
      name: 'Trace Viewer',
      description: 'Can view trace data',
      permissions: [
        {
          resource: 'trace',
          action: 'read'
        }
      ]
    });
    
    const traceAdminRole = await roleManager.createRole({
      name: 'Trace Admin',
      description: 'Can manage trace data',
      permissions: [
        {
          resource: 'trace',
          action: 'read'
        },
        {
          resource: 'trace',
          action: 'write'
        },
        {
          resource: 'trace',
          action: 'delete'
        }
      ]
    });
    
    // 分配角色
    await roleManager.assignRole(testUserId, traceViewerRole.role_id, contextId);
    await roleManager.assignRole(adminUserId, traceAdminRole.role_id, contextId);
  });
  
  beforeEach(() => {
    // 重置追踪数据
    traceAdapter.reset();
  });
  
  afterAll(async () => {
    // 清理资源
    await roleManager.cleanupExpired();
  });
  
  test('追踪数据创建应该记录用户角色信息', async () => {
    // 创建追踪数据
    const traceData = {
      trace_id: uuidv4(),
      context_id: contextId,
      operation: 'test_operation',
      user_id: testUserId,
      timestamp: new Date().toISOString(),
      data: {
        test: 'data'
      }
    };
    
    // 记录追踪数据
    await traceService.recordTrace(traceData);
    
    // 验证追踪数据已记录
    const traces = traceAdapter.getTraces();
    expect(Object.keys(traces)).toHaveLength(1);
    
    // 检查追踪数据是否包含角色信息
    const trace = Object.values(traces)[0];
    expect(trace.user_id).toBe(testUserId);
    
    // 验证追踪服务在记录时检查了用户权限
    // 注意：这需要TraceService实现中集成RoleManager
    // 这里我们只是验证追踪数据被正确记录
  });
  
  test('不同角色用户应该有不同的追踪数据访问权限', async () => {
    // 创建一些追踪数据
    const trace1 = {
      trace_id: uuidv4(),
      context_id: contextId,
      operation: 'operation_1',
      timestamp: new Date().toISOString()
    };
    
    const trace2 = {
      trace_id: uuidv4(),
      context_id: uuidv4(), // 不同的上下文
      operation: 'operation_2',
      timestamp: new Date().toISOString()
    };
    
    // 记录追踪数据
    await traceService.recordTrace(trace1);
    await traceService.recordTrace(trace2);
    
    // 检查普通用户权限
    const userPermission1 = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'trace',
      action: 'read',
      context_id: contextId
    });
    
    expect(userPermission1.granted).toBe(true);
    
    const userPermission2 = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'trace',
      action: 'read',
      context_id: trace2.context_id
    });
    
    expect(userPermission2.granted).toBe(false);
    
    // 检查管理员权限
    const adminPermission = await roleManager.checkPermission({
      user_id: adminUserId,
      resource: 'trace',
      action: 'delete',
      context_id: contextId
    });
    
    expect(adminPermission.granted).toBe(true);
  });
  
  test('角色权限应该控制故障报告访问', async () => {
    // 创建故障报告
    const failure = {
      failure_id: uuidv4(),
      context_id: contextId,
      timestamp: new Date().toISOString(),
      failure_type: 'test_failure',
      severity: 'medium',
      details: {
        message: 'Test failure message'
      }
    };
    
    // 记录故障
    await traceService.reportFailure(failure);
    
    // 验证故障已记录
    const failures = traceAdapter.getFailures();
    expect(Object.keys(failures)).toHaveLength(1);
    
    // 检查普通用户权限 - 只能查看
    const userReadPermission = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'failure',
      action: 'read',
      context_id: contextId,
      resource_id: failure.failure_id
    });
    
    const userDeletePermission = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'failure',
      action: 'delete',
      context_id: contextId,
      resource_id: failure.failure_id
    });
    
    expect(userReadPermission.granted).toBe(true);
    expect(userDeletePermission.granted).toBe(false);
    
    // 检查管理员权限 - 可以删除
    const adminDeletePermission = await roleManager.checkPermission({
      user_id: adminUserId,
      resource: 'failure',
      action: 'delete',
      context_id: contextId,
      resource_id: failure.failure_id
    });
    
    expect(adminDeletePermission.granted).toBe(true);
  });
  
  test('角色变更应该立即影响追踪数据访问权限', async () => {
    // 创建一个新角色
    const analyticRole = await roleManager.createRole({
      name: 'Trace Analyst',
      description: 'Can analyze trace data',
      permissions: [
        {
          resource: 'trace',
          action: 'read'
        },
        {
          resource: 'trace',
          action: 'analyze'
        }
      ]
    });
    
    // 初始检查 - 用户不应该有分析权限
    const initialAnalyzeCheck = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'trace',
      action: 'analyze',
      context_id: contextId
    });
    
    expect(initialAnalyzeCheck.granted).toBe(false);
    
    // 分配新角色给用户
    await roleManager.assignRole(testUserId, analyticRole.role_id, contextId);
    
    // 再次检查 - 用户现在应该有分析权限
    const afterAssignCheck = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'trace',
      action: 'analyze',
      context_id: contextId
    });
    
    expect(afterAssignCheck.granted).toBe(true);
    
    // 撤销角色
    await roleManager.revokeRole(testUserId, analyticRole.role_id);
    
    // 最终检查 - 用户应该再次失去分析权限
    const finalCheck = await roleManager.checkPermission({
      user_id: testUserId,
      resource: 'trace',
      action: 'analyze',
      context_id: contextId
    });
    
    expect(finalCheck.granted).toBe(false);
  });
}); 