/**
 * Core映射器单元测试
 * 测试Schema(snake_case) ↔ TypeScript(camelCase)双重命名约定映射
 * 遵循MPLP零技术债务和完全类型安全原则
 */

import { CoreMapper } from '../../../../../src/modules/core/api/mappers/core.mapper';
import {
  CoreEntity,
  CoreSchema,
  WorkflowStageType,
  WorkflowStatusType,
  ExecutionMode,
  Priority,
  AuditEventType,
  MonitoringProvider,
  ExportFormat,
  ChangeType,
  IndexingStrategy,
  SearchableField,
  PublishedEvent,
  SubscribedEvent,
  CoreOperation
} from '../../../../../src/modules/core/types';

describe('CoreMapper测试', () => {
  // ===== 测试数据工厂 =====
  
  const createValidCoreEntity = (): CoreEntity => ({
    protocolVersion: '1.0.0',
    timestamp: '2025-01-27T10:00:00.000Z',
    workflowId: '550e8400-e29b-41d4-a716-446655440001',
    orchestratorId: '550e8400-e29b-41d4-a716-446655440002',
    workflowConfig: {
      stages: ['context' as WorkflowStageType, 'plan' as WorkflowStageType],
      parallelExecution: false,
      timeoutMs: 300000,
      retryPolicy: {
        maxAttempts: 3,
        delayMs: 1000,
        backoffFactor: 2
      },
      priority: Priority.MEDIUM,
      executionMode: ExecutionMode.SEQUENTIAL
    },
    executionContext: {
      userId: '550e8400-e29b-41d4-a716-446655440004',
      sessionId: '550e8400-e29b-41d4-a716-446655440005',
      requestId: '550e8400-e29b-41d4-a716-446655440006',
      priority: Priority.MEDIUM,
      metadata: {
        source: 'unit-test',
        version: '1.0.0'
      },
      variables: {
        testVar: 'testValue'
      }
    },
    executionStatus: {
      status: 'running' as WorkflowStatusType,
      currentStage: 'context' as WorkflowStageType,
      completedStages: ['context' as WorkflowStageType],
      stageResults: {
        context: {
          status: 'completed',
          startTime: '2025-01-27T10:00:00.000Z',
          endTime: '2025-01-27T10:01:00.000Z',
          durationMs: 60000,
          result: { success: true }
        }
      },
      startTime: '2025-01-27T10:00:00.000Z',
      endTime: '2025-01-27T10:01:00.000Z',
      durationMs: 60000,
      retryCount: 0
    },
    auditTrail: {
      enabled: true,
      retentionDays: 365,
      auditEvents: [{
        eventId: '550e8400-e29b-41d4-a716-446655440003',
        eventType: 'workflow_started' as AuditEventType,
        timestamp: '2025-01-27T10:00:00.000Z',
        userId: '550e8400-e29b-41d4-a716-446655440004',
        action: 'start_workflow',
        resource: 'workflow'
      }],
      complianceSettings: {
        gdprEnabled: true,
        hipaaEnabled: false,
        customCompliance: []
      }
    },
    monitoringIntegration: {
      enabled: true,
      supportedProviders: ['prometheus' as MonitoringProvider],
      exportFormats: ['prometheus' as ExportFormat]
    },
    performanceMetrics: {
      enabled: true,
      collectionIntervalSeconds: 60
    },
    versionHistory: {
      enabled: true,
      maxVersions: 10,
      versions: [{
        versionId: '550e8400-e29b-41d4-a716-446655440007',
        versionNumber: 1,
        createdAt: '2025-01-27T10:00:00.000Z',
        createdBy: 'system',
        changeSummary: 'Initial version',
        changeType: 'system_initialized' as ChangeType
      }]
    },
    searchMetadata: {
      enabled: true,
      indexingStrategy: 'full_text' as IndexingStrategy,
      searchableFields: ['workflow_id' as SearchableField, 'execution_status' as SearchableField]
    },
    coreOperation: 'workflow_execution' as CoreOperation,
    eventIntegration: {
      enabled: true,
      publishedEvents: ['workflow_executed' as PublishedEvent],
      subscribedEvents: ['context_updated' as SubscribedEvent]
    }
  });

  const createValidCoreSchema = (): CoreSchema => ({
    protocol_version: '1.0.0',
    timestamp: '2025-01-27T10:00:00.000Z',
    workflow_id: '550e8400-e29b-41d4-a716-446655440001',
    orchestrator_id: '550e8400-e29b-41d4-a716-446655440002',
    workflow_config: {
      stages: ['context', 'plan'],
      parallel_execution: false,
      timeout_ms: 300000,
      retry_policy: {
        max_attempts: 3,
        delay_ms: 1000,
        backoff_factor: 2
      },
      priority: 'medium',
      execution_mode: 'sequential'
    },
    execution_context: {
      user_id: '550e8400-e29b-41d4-a716-446655440004',
      session_id: '550e8400-e29b-41d4-a716-446655440005',
      request_id: '550e8400-e29b-41d4-a716-446655440006',
      priority: 'medium',
      metadata: {
        source: 'unit-test',
        version: '1.0.0'
      },
      variables: {
        testVar: 'testValue'
      }
    },
    execution_status: {
      current_stage: 'context',
      status: 'running',
      start_time: '2025-01-27T10:00:00.000Z',
      end_time: '2025-01-27T10:01:00.000Z',
      duration_ms: 60000,
      retry_count: 0,
      completed_stages: ['context'],
      stage_results: {
        context: {
          status: 'completed',
          start_time: '2025-01-27T10:00:00.000Z',
          end_time: '2025-01-27T10:01:00.000Z',
          duration_ms: 60000,
          result: { success: true }
        }
      }
    },
    audit_trail: {
      enabled: true,
      retention_days: 365,
      audit_events: [{
        event_id: '550e8400-e29b-41d4-a716-446655440003',
        event_type: 'workflow_started',
        timestamp: '2025-01-27T10:00:00.000Z',
        user_id: '550e8400-e29b-41d4-a716-446655440004',
        action: 'start_workflow',
        resource: 'workflow',
        workflow_id: '550e8400-e29b-41d4-a716-446655440001'
      }],
      compliance_settings: {
        gdpr_enabled: true,
        hipaa_enabled: false,
        custom_compliance: []
      }
    },
    monitoring_integration: {
      enabled: true,
      supported_providers: ['prometheus'],
      export_formats: ['prometheus']
    },
    performance_metrics: {
      enabled: true,
      collection_interval_seconds: 60
    },
    version_history: {
      enabled: true,
      max_versions: 10,
      versions: [{
        version_id: '550e8400-e29b-41d4-a716-446655440007',
        version_number: 1,
        created_at: '2025-01-27T10:00:00.000Z',
        created_by: 'system',
        change_summary: 'Initial version',
        change_type: 'system_initialized'
      }]
    },
    search_metadata: {
      enabled: true,
      indexing_strategy: 'full_text',
      searchable_fields: ['workflow_id', 'execution_status']
    },
    core_operation: 'workflow_execution',
    event_integration: {
      enabled: true,
      published_events: ['workflow_executed'],
      subscribed_events: ['context_updated']
    }
  });

  // ===== toSchema映射测试 =====

  describe('toSchema映射', () => {
    it('应该正确将CoreEntity映射为CoreSchema', () => {
      const entity = createValidCoreEntity();
      
      const schema = CoreMapper.toSchema(entity);
      
      // 验证基础字段映射
      expect(schema.protocol_version).toBe(entity.protocolVersion);
      expect(schema.timestamp).toBe(entity.timestamp);
      expect(schema.workflow_id).toBe(entity.workflowId);
      expect(schema.orchestrator_id).toBe(entity.orchestratorId);
      expect(schema.core_operation).toBe(entity.coreOperation);
      
      // 验证嵌套对象映射
      expect(schema.workflow_config.parallel_execution).toBe(entity.workflowConfig.parallelExecution);
      expect(schema.workflow_config.timeout_ms).toBe(entity.workflowConfig.timeoutMs);
      expect(schema.workflow_config.execution_mode).toBe(entity.workflowConfig.executionMode);
      
      expect(schema.execution_context.user_id).toBe(entity.executionContext.userId);
      expect(schema.execution_context.session_id).toBe(entity.executionContext.sessionId);
      expect(schema.execution_context.request_id).toBe(entity.executionContext.requestId);
      expect(schema.execution_context.priority).toBe(entity.executionContext.priority);
      
      expect(schema.execution_status.current_stage).toBe(entity.executionStatus.currentStage);
      expect(schema.execution_status.start_time).toBe(entity.executionStatus.startTime);
      expect(schema.execution_status.stage_results?.context?.start_time).toBe(entity.executionStatus.stageResults?.context?.startTime);
      expect(schema.execution_status.stage_results?.context?.end_time).toBe(entity.executionStatus.stageResults?.context?.endTime);
    });

    it('应该正确处理可选字段', () => {
      const entity = createValidCoreEntity();
      entity.moduleCoordination = undefined;
      entity.eventHandling = undefined;
      entity.coreDetails = undefined;
      
      const schema = CoreMapper.toSchema(entity);
      
      expect(schema.module_coordination).toBeUndefined();
      expect(schema.event_handling).toBeUndefined();
      expect(schema.core_details).toBeUndefined();
    });

    it('应该正确映射数组字段', () => {
      const entity = createValidCoreEntity();
      
      const schema = CoreMapper.toSchema(entity);
      
      expect(schema.workflow_config.stages).toEqual(['context', 'plan']);
      expect(schema.monitoring_integration.supported_providers).toEqual(['prometheus']);
      expect(schema.monitoring_integration.export_formats).toEqual(['prometheus']);
      expect(schema.search_metadata.searchable_fields).toEqual(['workflow_id', 'execution_status']);
      expect(schema.event_integration.published_events).toEqual(['workflow_executed']);
      expect(schema.event_integration.subscribed_events).toEqual(['context_updated']);
    });
  });

  // ===== fromSchema映射测试 =====

  describe('fromSchema映射', () => {
    it('应该正确将CoreSchema映射为CoreEntity', () => {
      const schema = createValidCoreSchema();
      
      const entity = CoreMapper.fromSchema(schema);
      
      // 验证基础字段映射
      expect(entity.protocolVersion).toBe(schema.protocol_version);
      expect(entity.timestamp).toBe(schema.timestamp);
      expect(entity.workflowId).toBe(schema.workflow_id);
      expect(entity.orchestratorId).toBe(schema.orchestrator_id);
      expect(entity.coreOperation).toBe(schema.core_operation);
      
      // 验证嵌套对象映射
      expect(entity.workflowConfig.parallelExecution).toBe(schema.workflow_config.parallel_execution);
      expect(entity.workflowConfig.timeoutMs).toBe(schema.workflow_config.timeout_ms);
      expect(entity.workflowConfig.executionMode).toBe(schema.workflow_config.execution_mode);
      
      expect(entity.executionContext.userId).toBe(schema.execution_context.user_id);
      expect(entity.executionContext.sessionId).toBe(schema.execution_context.session_id);
      expect(entity.executionContext.requestId).toBe(schema.execution_context.request_id);
      expect(entity.executionContext.priority).toBe(schema.execution_context.priority);
      
      expect(entity.executionStatus.currentStage).toBe(schema.execution_status.current_stage);
      expect(entity.executionStatus.startTime).toBe(schema.execution_status.start_time);
      expect(entity.executionStatus.stageResults?.context?.startTime).toBe(schema.execution_status.stage_results?.context?.start_time);
      expect(entity.executionStatus.stageResults?.context?.endTime).toBe(schema.execution_status.stage_results?.context?.end_time);
    });

    it('应该正确处理可选字段', () => {
      const schema = createValidCoreSchema();
      schema.module_coordination = undefined;
      schema.event_handling = undefined;
      schema.core_details = undefined;
      
      const entity = CoreMapper.fromSchema(schema);
      
      expect(entity.moduleCoordination).toBeUndefined();
      expect(entity.eventHandling).toBeUndefined();
      expect(entity.coreDetails).toBeUndefined();
    });
  });

  // ===== 双向映射一致性测试 =====

  describe('双向映射一致性', () => {
    it('应该保持Entity -> Schema -> Entity的一致性', () => {
      const originalEntity = createValidCoreEntity();
      
      const schema = CoreMapper.toSchema(originalEntity);
      const mappedEntity = CoreMapper.fromSchema(schema);
      
      expect(mappedEntity).toEqual(originalEntity);
    });

    it('应该保持Schema -> Entity -> Schema的一致性', () => {
      const originalSchema = createValidCoreSchema();
      
      const entity = CoreMapper.fromSchema(originalSchema);
      const mappedSchema = CoreMapper.toSchema(entity);
      
      expect(mappedSchema).toEqual(originalSchema);
    });
  });

  // ===== validateSchema验证测试 =====

  // ===== 批量映射测试 =====

  describe('批量映射功能', () => {
    it('应该正确批量转换Entity数组为Schema数组', () => {
      const entities = [
        createValidCoreEntity(),
        createValidCoreEntity()
      ];

      const schemas = CoreMapper.toSchemaArray(entities);

      expect(schemas).toHaveLength(2);
      expect(schemas[0].protocol_version).toBe(entities[0].protocolVersion);
      expect(schemas[1].protocol_version).toBe(entities[1].protocolVersion);
    });

    it('应该正确批量转换Schema数组为Entity数组', () => {
      const schemas = [
        createValidCoreSchema(),
        createValidCoreSchema()
      ];

      const entities = CoreMapper.fromSchemaArray(schemas);

      expect(entities).toHaveLength(2);
      expect(entities[0].protocolVersion).toBe(schemas[0].protocol_version);
      expect(entities[1].protocolVersion).toBe(schemas[1].protocol_version);
    });

    it('应该处理空数组', () => {
      expect(CoreMapper.toSchemaArray([])).toEqual([]);
      expect(CoreMapper.fromSchemaArray([])).toEqual([]);
    });

    it('应该处理大数据量批量转换', () => {
      const entities = Array(100).fill(null).map(() => createValidCoreEntity());

      const startTime = Date.now();
      const schemas = CoreMapper.toSchemaArray(entities);
      const endTime = Date.now();

      expect(schemas).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });

  // ===== Schema验证测试 =====

  describe('Schema验证', () => {
    it('应该验证有效的Schema', () => {
      const validSchema = createValidCoreSchema();

      expect(() => CoreMapper.validateSchema(validSchema)).not.toThrow();
    });

    it('应该拒绝无效的Schema', () => {
      const invalidSchema = createValidCoreSchema();
      // @ts-expect-error - 故意删除必需字段进行测试
      delete invalidSchema.protocol_version;

      expect(() => CoreMapper.validateSchema(invalidSchema)).toThrow();
    });

    it('应该验证字段类型', () => {
      const invalidSchema = createValidCoreSchema();
      // @ts-expect-error - 故意使用错误类型进行测试
      invalidSchema.workflow_config.timeout_ms = 'invalid';

      expect(() => CoreMapper.validateSchema(invalidSchema)).toThrow();
    });

    it('应该验证枚举值', () => {
      const invalidSchema = createValidCoreSchema();
      (invalidSchema.workflow_config as any).execution_mode = 'invalid_mode';

      expect(() => CoreMapper.validateSchema(invalidSchema)).toThrow('execution_mode must be one of');
    });

    it('应该验证UUID格式', () => {
      const invalidSchema = createValidCoreSchema();
      invalidSchema.workflow_id = 'invalid-uuid';

      expect(() => CoreMapper.validateSchema(invalidSchema)).toThrow('Invalid UUID format');
    });

    it('应该验证execution_status字段', () => {
      const invalidSchema = createValidCoreSchema();
      // @ts-expect-error - 故意使用错误类型进行测试
      invalidSchema.execution_status.duration_ms = 'invalid';

      expect(() => CoreMapper.validateSchema(invalidSchema)).toThrow('duration_ms must be a number');
    });

    it('应该验证core_operation枚举', () => {
      const invalidSchema = createValidCoreSchema();
      (invalidSchema as any).core_operation = 'invalid_operation';

      expect(() => CoreMapper.validateSchema(invalidSchema)).toThrow('core_operation must be one of');
    });
  });

  // ===== 性能优化测试 =====

  describe('性能优化功能', () => {
    beforeEach(() => {
      CoreMapper.resetPerformanceMetrics();
    });

    it('应该提供性能监控指标', () => {
      const entity = createValidCoreEntity();

      // 执行一些映射操作
      CoreMapper.toSchema(entity);
      CoreMapper.fromSchema(CoreMapper.toSchema(entity));

      const metrics = CoreMapper.getPerformanceMetrics();

      expect(metrics.toSchemaCount).toBeGreaterThan(0);
      expect(metrics.fromSchemaCount).toBeGreaterThan(0);
      expect(metrics.averageToSchemaTime).toBeGreaterThanOrEqual(0);
      expect(metrics.averageFromSchemaTime).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
    });

    it('应该能够重置性能指标', () => {
      const entity = createValidCoreEntity();

      // 执行一些操作
      CoreMapper.toSchema(entity);

      // 重置指标
      CoreMapper.resetPerformanceMetrics();

      const metrics = CoreMapper.getPerformanceMetrics();
      expect(metrics.toSchemaCount).toBe(0);
      expect(metrics.fromSchemaCount).toBe(0);
      expect(metrics.totalToSchemaTime).toBe(0);
      expect(metrics.totalFromSchemaTime).toBe(0);
    });

    it('应该在大数据量处理时保持良好性能', () => {
      const entities = Array(50).fill(null).map(() => createValidCoreEntity());

      const startTime = Date.now();
      const schemas = CoreMapper.toSchemaArray(entities);
      const backToEntities = CoreMapper.fromSchemaArray(schemas);
      const endTime = Date.now();

      expect(schemas).toHaveLength(50);
      expect(backToEntities).toHaveLength(50);
      expect(endTime - startTime).toBeLessThan(2000); // 应该在2秒内完成

      const metrics = CoreMapper.getPerformanceMetrics();
      expect(metrics.toSchemaCount).toBe(50);
      expect(metrics.fromSchemaCount).toBe(50);
    });
  });

  // ===== 错误处理测试 =====

  describe('错误处理功能', () => {
    it('应该处理null entity输入', () => {
      expect(() => CoreMapper.toSchema(null as any)).toThrow('CoreEntity cannot be null or undefined');
    });

    it('应该处理缺少必填字段的entity', () => {
      const invalidEntity = createValidCoreEntity();
      delete (invalidEntity as any).protocolVersion;

      expect(() => CoreMapper.toSchema(invalidEntity)).toThrow('CoreEntity.protocolVersion is required');
    });

    it('应该处理null schema输入', () => {
      expect(() => CoreMapper.fromSchema(null as any)).toThrow('CoreSchema cannot be null or undefined');
    });

    it('应该处理缺少必填字段的schema', () => {
      const invalidSchema = createValidCoreSchema();
      delete (invalidSchema as any).protocol_version;

      expect(() => CoreMapper.fromSchema(invalidSchema)).toThrow('CoreSchema.protocol_version is required');
    });

    it('应该在批量映射中处理错误', () => {
      const entities = [createValidCoreEntity(), null as any, createValidCoreEntity()];

      expect(() => CoreMapper.toSchemaArray(entities)).toThrow('CoreEntity cannot be null or undefined');
    });

    it('应该提供详细的错误信息', () => {
      try {
        CoreMapper.toSchema(null as any);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Failed to convert CoreEntity to Schema');
      }
    });
  });
});
