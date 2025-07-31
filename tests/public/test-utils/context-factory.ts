/**
 * Context测试数据工厂
 * 
 * 提供创建测试用Context数据的工具函数
 * 
 * @version v1.0.1
 * @created 2025-08-26T10:00:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配context-protocol.json Schema定义
 */

import { v4 as uuidv4 } from 'uuid';

// 导出常用类型定义
export type UUID = string;
export type Timestamp = string;
export type Version = string;

// Context状态和生命周期阶段
export type ContextStatus = 'active' | 'suspended' | 'completed' | 'terminated';
export type ContextLifecycleStage = 'planning' | 'executing' | 'monitoring' | 'completed';

// 共享状态定义
export interface SharedState {
  variables: Record<string, unknown>;
  resources: {
    allocated: Record<string, {
      type: string;
      amount: number;
      unit: string;
      status: 'available' | 'allocated' | 'exhausted';
    }>;
    requirements: Record<string, {
      minimum: number;
      optimal?: number;
      maximum?: number;
      unit: string;
    }>;
  };
  dependencies: Array<{
    id: UUID;
    type: 'context' | 'plan' | 'external';
    name: string;
    version?: Version;
    status: 'pending' | 'resolved' | 'failed';
  }>;
  goals?: Array<{
    id: UUID;
    name: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'active' | 'completed' | 'failed';
    success_criteria?: Array<{
      metric: string;
      operator: string;
      value: number | string;
      unit?: string;
    }>;
  }>;
}

// 访问控制定义
export interface AccessControl {
  owner: {
    user_id: string;
    role: string;
  };
  permissions: Array<{
    role_id: string;
    actions: string[];
  }>;
}

// Context配置定义
export interface ContextConfiguration {
  timeout_settings: {
    default_timeout: number;
    max_timeout: number;
    cleanup_timeout?: number;
  };
  notification_settings?: {
    enabled: boolean;
    channels?: Array<'email' | 'webhook' | 'sms' | 'push'>;
    events?: Array<'created' | 'updated' | 'completed' | 'failed' | 'timeout'>;
  };
  persistence: {
    enabled: boolean;
    storage_backend: 'memory' | 'database' | 'file' | 'redis';
    retention_policy?: {
      duration?: string;
      max_versions?: number;
    };
  };
}

// Context协议主体定义
export interface ContextProtocol {
  protocol_version: Version;
  timestamp: Timestamp;
  context_id: UUID;
  name: string;
  description?: string;
  status: ContextStatus;
  lifecycle_stage: ContextLifecycleStage;
  shared_state: SharedState;
  access_control: AccessControl;
  configuration: ContextConfiguration;
}

/**
 * 创建测试Context对象
 * 
 * @param override 可选的覆盖默认值的对象
 * @returns 完整的ContextProtocol对象
 */
export function createTestContext(override?: Partial<ContextProtocol>): ContextProtocol {
  const context: ContextProtocol = {
    protocol_version: '1.0.1',
    timestamp: new Date().toISOString(),
    context_id: uuidv4(),
    name: 'Test Context',
    description: 'This is a test context for unit testing',
    status: 'active',
    lifecycle_stage: 'planning',
    shared_state: createTestSharedState(),
    access_control: createTestAccessControl(),
    configuration: createTestContextConfig()
  };
  
  return { ...context, ...override };
}

/**
 * 创建测试Context配置对象
 * 
 * @param override 可选的覆盖默认值的对象
 * @returns Context配置对象
 */
export function createTestContextConfig(override?: Partial<ContextConfiguration>): ContextConfiguration {
  const config: ContextConfiguration = {
    timeout_settings: {
      default_timeout: 3600,
      max_timeout: 86400,
      cleanup_timeout: 300
    },
    notification_settings: {
      enabled: true,
      channels: ['email', 'webhook'],
      events: ['created', 'updated', 'completed', 'failed']
    },
    persistence: {
      enabled: true,
      storage_backend: 'database',
      retention_policy: {
        duration: 'P90D',
        max_versions: 10
      }
    }
  };
  
  return { ...config, ...override };
}

/**
 * 创建测试共享状态对象
 * 
 * @param override 可选的覆盖默认值的对象
 * @returns 共享状态对象
 */
export function createTestSharedState(override?: Partial<SharedState>): SharedState {
  const sharedState: SharedState = {
    variables: {
      testVar1: 'test value',
      testVar2: 123,
      testVar3: { nestedKey: 'nested value' }
    },
    resources: {
      allocated: {
        'cpu': {
          type: 'compute',
          amount: 4,
          unit: 'cores',
          status: 'available'
        },
        'memory': {
          type: 'memory',
          amount: 16,
          unit: 'GB',
          status: 'available'
        }
      },
      requirements: {
        'storage': {
          minimum: 100,
          optimal: 500,
          maximum: 1000,
          unit: 'GB'
        }
      }
    },
    dependencies: [
      {
        id: uuidv4(),
        type: 'plan',
        name: 'Test Plan',
        version: '1.0.0',
        status: 'resolved'
      }
    ],
    goals: [
      {
        id: uuidv4(),
        name: 'Complete test goal',
        priority: 'high',
        status: 'active',
        success_criteria: [
          {
            metric: 'test_coverage',
            operator: '>=',
            value: 90,
            unit: '%'
          }
        ]
      }
    ]
  };
  
  return { ...sharedState, ...override };
}

/**
 * 创建测试访问控制对象
 * 
 * @param override 可选的覆盖默认值的对象
 * @returns 访问控制对象
 */
export function createTestAccessControl(override?: Partial<AccessControl>): AccessControl {
  const accessControl: AccessControl = {
    owner: {
      user_id: 'test-user-123',
      role: 'admin'
    },
    permissions: [
      {
        role_id: 'admin-role',
        actions: ['read', 'write', 'delete', 'manage']
      },
      {
        role_id: 'viewer-role',
        actions: ['read']
      }
    ]
  };
  
  return { ...accessControl, ...override };
} 