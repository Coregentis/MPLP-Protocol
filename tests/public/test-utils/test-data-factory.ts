/**
 * 测试数据工厂
 * 
 * 提供所有模块的测试数据生成功能，遵循Schema驱动原则
 * 
 * @version 1.0.0
 * @created 2025-01-28T16:00:00+08:00
 */

import { v4 as uuidv4 } from 'uuid';
import { UUID, Timestamp, EntityStatus } from '../../../src/public/shared/types';
import { ContextLifecycleStage } from '../../../src/public/shared/types/context-types';

/**
 * 测试数据清理管理器
 */
export class TestDataManager {
  private static createdIds: Set<string> = new Set();
  private static createdData: Map<string, any> = new Map();

  /**
   * 注册创建的测试数据
   */
  static register(id: string, data: any): void {
    this.createdIds.add(id);
    this.createdData.set(id, data);
  }

  /**
   * 清理所有测试数据
   */
  static async cleanup(): Promise<void> {
    this.createdIds.clear();
    this.createdData.clear();
  }

  /**
   * 获取所有创建的ID
   */
  static getCreatedIds(): string[] {
    return Array.from(this.createdIds);
  }
}

/**
 * 基础测试数据工厂
 */
export class BaseTestDataFactory {
  /**
   * 生成测试UUID
   */
  static generateUUID(): UUID {
    return uuidv4();
  }

  /**
   * 生成测试时间戳
   */
  static generateTimestamp(): Timestamp {
    return new Date().toISOString();
  }

  /**
   * 生成随机字符串
   */
  static generateRandomString(length: number = 8): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * 生成测试邮箱
   */
  static generateTestEmail(): string {
    return `test-${this.generateRandomString()}@example.com`;
  }
}

/**
 * Context模块测试数据工厂
 */
export class ContextTestDataFactory extends BaseTestDataFactory {
  /**
   * 创建测试Context数据
   */
  static createContextData(overrides: Partial<any> = {}): any {
    const contextId = this.generateUUID();
    const data = {
      contextId,
      name: `Test Context ${this.generateRandomString()}`,
      description: `Test context description ${this.generateRandomString()}`,
      lifecycleStage: ContextLifecycleStage.ACTIVE,
      status: EntityStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessionIds: [],
      sharedStateIds: [],
      configuration: {},
      metadata: {
        test: true,
        created_by: 'test-factory'
      },
      ...overrides
    };

    TestDataManager.register(contextId, data);
    return data;
  }

  /**
   * 创建Context创建请求数据
   */
  static createContextRequest(overrides: Partial<any> = {}): any {
    return {
      name: `Test Context ${this.generateRandomString()}`,
      description: `Test context description`,
      configuration: {},
      metadata: {
        test: true
      },
      ...overrides
    };
  }
}

/**
 * Plan模块测试数据工厂
 */
export class PlanTestDataFactory extends BaseTestDataFactory {
  /**
   * 创建测试Plan数据
   */
  static createPlanData(overrides: Partial<any> = {}): any {
    const planId = this.generateUUID();
    const contextId = overrides.context_id || this.generateUUID();
    
    const data = {
      plan_id: planId,
      context_id: contextId,
      name: `Test Plan ${this.generateRandomString()}`,
      description: `Test plan description`,
      goals: [`Goal 1`, `Goal 2`],
      tasks: [],
      dependencies: [],
      execution_strategy: 'sequential',
      priority: 'medium',
      estimated_duration: { value: 60, unit: 'minutes' },
      configuration: {},
      metadata: {
        test: true,
        created_by: 'test-factory'
      },
      ...overrides
    };

    TestDataManager.register(planId, data);
    return data;
  }

  /**
   * 创建Plan创建请求数据
   */
  static createPlanRequest(overrides: Partial<any> = {}): any {
    return {
      context_id: this.generateUUID(),
      name: `Test Plan ${this.generateRandomString()}`,
      description: `Test plan description`,
      goals: [`Test goal`],
      execution_strategy: 'sequential',
      priority: 'medium',
      ...overrides
    };
  }
}

/**
 * Confirm模块测试数据工厂
 */
export class ConfirmTestDataFactory extends BaseTestDataFactory {
  /**
   * 创建测试Confirm数据
   */
  static createConfirmData(overrides: Partial<any> = {}): any {
    const confirmId = this.generateUUID();
    const contextId = overrides.context_id || this.generateUUID();
    
    const data = {
      confirm_id: confirmId,
      context_id: contextId,
      subject: {
        title: `Test Confirmation ${this.generateRandomString()}`,
        description: `Test confirmation description`,
        type: 'plan_approval'
      },
      requester: {
        user_id: this.generateUUID(),
        role: 'user',
        timestamp: this.generateTimestamp()
      },
      status: 'pending',
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      metadata: {
        test: true,
        created_by: 'test-factory'
      },
      ...overrides
    };

    TestDataManager.register(confirmId, data);
    return data;
  }
}

/**
 * Trace模块测试数据工厂
 */
export class TraceTestDataFactory extends BaseTestDataFactory {
  /**
   * 创建测试Trace数据
   */
  static createTraceData(overrides: Partial<any> = {}): any {
    const traceId = this.generateUUID();
    const contextId = overrides.context_id || this.generateUUID();
    
    const data = {
      trace_id: traceId,
      context_id: contextId,
      execution_id: this.generateUUID(),
      trace_type: 'execution',
      name: `Test Trace ${this.generateRandomString()}`,
      severity: 'info',
      timestamp: this.generateTimestamp(),
      metadata: {
        test: true,
        created_by: 'test-factory'
      },
      ...overrides
    };

    TestDataManager.register(traceId, data);
    return data;
  }
}

/**
 * Role模块测试数据工厂
 */
export class RoleTestDataFactory extends BaseTestDataFactory {
  /**
   * 创建测试Role数据
   */
  static createRoleData(overrides: Partial<any> = {}): any {
    const roleId = this.generateUUID();
    const contextId = overrides.context_id || this.generateUUID();
    
    const data = {
      role_id: roleId,
      context_id: contextId,
      name: `Test Role ${this.generateRandomString()}`,
      role_type: 'user',
      status: 'active',
      permissions: [],
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      metadata: {
        test: true,
        created_by: 'test-factory'
      },
      ...overrides
    };

    TestDataManager.register(roleId, data);
    return data;
  }
}

/**
 * Extension模块测试数据工厂
 */
export class ExtensionTestDataFactory extends BaseTestDataFactory {
  /**
   * 创建测试Extension数据
   */
  static createExtensionData(overrides: Partial<any> = {}): any {
    const extensionId = this.generateUUID();
    const contextId = overrides.context_id || this.generateUUID();
    
    const data = {
      extension_id: extensionId,
      context_id: contextId,
      name: `Test Extension ${this.generateRandomString()}`,
      version: '1.0.0',
      type: 'plugin',
      status: 'active',
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      metadata: {
        test: true,
        created_by: 'test-factory'
      },
      ...overrides
    };

    TestDataManager.register(extensionId, data);
    return data;
  }
}

/**
 * 统一测试数据工厂导出
 */
export const TestDataFactory = {
  Base: BaseTestDataFactory,
  Context: ContextTestDataFactory,
  Plan: PlanTestDataFactory,
  Confirm: ConfirmTestDataFactory,
  Trace: TraceTestDataFactory,
  Role: RoleTestDataFactory,
  Extension: ExtensionTestDataFactory,
  Manager: TestDataManager
};
