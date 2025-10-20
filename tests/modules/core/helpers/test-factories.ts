/**
 * Core模块测试工厂函数
 * 
 * @description 基于实际类型定义创建测试数据
 * @version 1.0.0
 * @layer 测试辅助工具
 */

import { CoreEntity as CoreEntityClass } from '../../../../src/modules/core/domain/entities/core.entity';
import {
  CoreEntity,
  CoreSchema,
  UUID,
  Timestamp,
  Version,
  WorkflowConfig,
  ExecutionContext,
  ExecutionStatus,
  AuditTrail,
  MonitoringIntegration,
  PerformanceMetricsConfig,
  VersionHistory,
  SearchMetadata,
  EventIntegration,
  CoreOperation,
  Priority,
  ExecutionMode,
  WorkflowStatusType,
  AuditEventType
} from '../../../../src/modules/core/types';



/**
 * 创建有效的CoreEntity测试数据
 */
export function createTestCoreEntity(overrides?: Partial<CoreEntity>): CoreEntityClass {
  // 生成符合UUID v4格式的ID
  const generateUUIDv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const data = {
    protocolVersion: '1.0.0' as Version,
    timestamp: '2025-09-01T16:50:00.000Z' as Timestamp,
    workflowId: generateUUIDv4() as UUID,
    orchestratorId: generateUUIDv4() as UUID,
    workflowConfig: {
      name: 'test-workflow',
      description: 'Test workflow for Core module',
      stages: ['context', 'plan'],
      executionMode: ExecutionMode.SEQUENTIAL,
      parallelExecution: false,
      timeoutMs: 300000,
      priority: Priority.MEDIUM,
      retryPolicy: {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 2
      }
    } as WorkflowConfig,
    executionContext: {
      userId: 'user-test-001',
      sessionId: 'session-test-001',
      requestId: 'request-test-001' as UUID,
      priority: Priority.MEDIUM,
      metadata: {
        source: 'test',
        environment: 'testing'
      },
      variables: {
        testMode: true
      }
    } as ExecutionContext,
    executionStatus: {
      status: 'created',
      startTime: '2025-09-01T16:50:00.000Z',
      endTime: undefined,
      durationMs: 0,
      currentStage: 'context',
      completedStages: [],
      stageResults: {},
      retryCount: 0
    } as ExecutionStatus,
    auditTrail: {
      enabled: true,
      retentionDays: 90,
      auditEvents: []
    } as AuditTrail,
    monitoringIntegration: {
      enabled: true,
      supportedProviders: ['prometheus', 'grafana']
    } as MonitoringIntegration,
    performanceMetrics: {
      enabled: true,
      collectionIntervalSeconds: 60
    } as PerformanceMetricsConfig,
    versionHistory: {
      enabled: true,
      maxVersions: 10
    } as VersionHistory,
    searchMetadata: {
      enabled: true,
      indexingStrategy: 'full_text'
    } as SearchMetadata,
    coreOperation: 'workflow_execution' as CoreOperation,
    eventIntegration: {
      enabled: true
    } as EventIntegration,
    ...(overrides || {})
  };

  return new CoreEntityClass(data);
}

/**
 * 创建有效的CoreSchema测试数据
 */
export function createTestCoreSchema(): CoreSchema {
  return {
    protocol_version: '1.0.0',
    timestamp: '2025-09-01T16:50:00.000Z',
    workflow_id: '12345678-1234-4123-8123-123456789012',
    orchestrator_id: '87654321-4321-4321-8321-210987654321',
    workflow_config: {
      name: 'test-workflow',
      description: 'Test workflow for Core module',
      stages: ['context', 'plan'],
      execution_mode: 'sequential',
      parallel_execution: false,
      timeout_ms: 300000,
      priority: 'medium',
      retry_policy: {
        max_attempts: 3,
        delay_ms: 1000,
        backoff_factor: 2
      }
    },
    execution_context: {
      user_id: 'user-test-001',
      session_id: 'session-test-001',
      request_id: 'request-test-001',
      priority: 'medium',
      metadata: {
        source: 'test',
        environment: 'testing'
      },
      variables: {
        testMode: true
      }
    },
    execution_status: {
      status: 'pending',
      start_time: '2025-09-01T16:50:00.000Z',
      duration_ms: 0,
      current_stage: 'context',
      completed_stages: [],
      stage_results: {}
    },
    audit_trail: {
      enabled: true,
      retention_days: 90,
      audit_events: []
    },
    monitoring_integration: {
      enabled: true,
      supported_providers: ['prometheus', 'grafana']
    },
    performance_metrics: {
      enabled: true,
      collection_interval_seconds: 60
    },
    version_history: {
      enabled: true,
      max_versions: 10
    },
    search_metadata: {
      enabled: true,
      indexing_strategy: 'full'
    },
    core_operation: 'workflow_execution',
    event_integration: {
      enabled: true
    }
  };
}

/**
 * 创建审计事件测试数据
 */
export function createTestAuditEvent() {
  return {
    eventId: '22222222-2222-4222-8222-222222222222' as UUID,
    eventType: 'workflow_created' as AuditEventType,
    timestamp: '2025-09-01T17:00:00.000Z' as Timestamp,
    userId: 'user-test-001',
    userRole: 'admin',
    action: 'create_workflow',
    resource: 'workflow',
    systemOperation: 'workflow_creation',
    workflowId: '12345678-1234-4123-8123-123456789012' as UUID,
    orchestratorId: '87654321-4321-4321-8321-210987654321' as UUID,
    coreOperation: 'workflow_execution',
    coreStatus: 'pending'
  };
}

/**
 * 创建工作流配置测试数据
 */
export function createTestWorkflowConfig(): WorkflowConfig {
  return {
    name: 'test-workflow',
    description: 'Test workflow configuration',
    stages: ['context', 'plan', 'confirm'],
    executionMode: ExecutionMode.SEQUENTIAL,
    parallelExecution: false,
    timeoutMs: 300000,
    priority: Priority.MEDIUM,
    retryPolicy: {
      maxAttempts: 3,
      delayMs: 1000,
      backoffFactor: 2
    }
  };
}

/**
 * 创建执行上下文测试数据
 */
export function createTestExecutionContext(): ExecutionContext {
  return {
    userId: 'user-test-001',
    sessionId: 'session-test-001',
    requestId: 'request-test-001' as UUID,
    priority: Priority.MEDIUM,
    metadata: {
      source: 'test',
      environment: 'testing'
    },
    variables: {
      testMode: true,
      debugLevel: 'info'
    }
  };
}

/**
 * 创建执行状态测试数据
 */
export function createTestExecutionStatus(): ExecutionStatus {
  return {
    status: 'created',
    startTime: '2025-09-01T16:50:00.000Z',
    endTime: undefined,
    durationMs: 0,
    currentStage: 'context',
    completedStages: [],
    stageResults: {}
  };
}

/**
 * 创建最小有效的CoreEntity
 */
export function createMinimalCoreEntity(): CoreEntityClass {
  const entity = createTestCoreEntity();
  entity.workflowConfig = {
    name: 'minimal',
    stages: ['context'],
    executionMode: ExecutionMode.SEQUENTIAL,
    parallelExecution: false,
    timeoutMs: 60000,
    priority: Priority.LOW
  };
  return entity;
}

/**
 * 创建最大配置的CoreEntity
 */
export function createMaximalCoreEntity(): CoreEntityClass {
  const entity = createTestCoreEntity();
  entity.workflowConfig = {
    name: 'maximal-workflow-with-all-stages',
    description: 'A comprehensive workflow with all available stages and features',
    stages: ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'dialog', 'collab', 'network'],
    executionMode: ExecutionMode.PARALLEL,
    parallelExecution: true,
    timeoutMs: 3600000,
    priority: Priority.CRITICAL,
    retryPolicy: {
      maxAttempts: 5,
      delayMs: 2000,
      backoffFactor: 2
    }
  };
  return entity;
}

/**
 * 创建无效的CoreEntity数据（用于测试验证）
 */
export function createInvalidCoreEntityData() {
  return {
    protocolVersion: '2.0.0', // 无效版本
    timestamp: 'invalid-timestamp', // 无效时间戳
    workflowId: 'invalid-uuid', // 无效UUID
    orchestratorId: 'invalid-uuid', // 无效UUID
    // 缺少必需字段
  };
}
