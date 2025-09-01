/**
 * Core领域实体测试
 * 
 * @description 测试Core模块的核心领域实体
 * @version 1.0.0
 * @layer 领域层测试 - 实体
 */

import { CoreEntity } from '../../../../../src/modules/core/domain/entities/core.entity';
import {
  createTestCoreEntity,
  createMinimalCoreEntity,
  createMaximalCoreEntity,
  createTestAuditEvent,
  createTestWorkflowConfig,
  createTestExecutionStatus
} from '../../helpers/test-factories';
import {
  UUID,
  Timestamp,
  Version,
  WorkflowConfig,
  ExecutionStatus,
  Priority,
  ExecutionMode,
  WorkflowStatusType
} from '../../../../../src/modules/core/types';

describe('CoreEntity测试', () => {
  describe('构造函数测试', () => {
    it('应该成功创建有效的CoreEntity实例', () => {
      const data = createTestCoreEntity();
      const entity = new CoreEntity(data);

      expect(entity).toBeDefined();
      expect(entity).toBeInstanceOf(CoreEntity);
      expect(entity.protocolVersion).toBe(data.protocolVersion);
      expect(entity.timestamp).toBe(data.timestamp);
      expect(entity.workflowId).toBe(data.workflowId);
      expect(entity.orchestratorId).toBe(data.orchestratorId);
      expect(entity.coreOperation).toBe(data.coreOperation);
    });

    it('应该正确设置所有属性', () => {
      const data = createTestCoreEntity();
      const entity = new CoreEntity(data);

      expect(entity.workflowConfig).toEqual(data.workflowConfig);
      expect(entity.executionContext).toEqual(data.executionContext);
      expect(entity.executionStatus).toEqual(data.executionStatus);
      expect(entity.auditTrail).toEqual(data.auditTrail);
      expect(entity.monitoringIntegration).toEqual(data.monitoringIntegration);
      expect(entity.performanceMetrics).toEqual(data.performanceMetrics);
      expect(entity.versionHistory).toEqual(data.versionHistory);
      expect(entity.searchMetadata).toEqual(data.searchMetadata);
      expect(entity.eventIntegration).toEqual(data.eventIntegration);
    });
  });

  describe('字段验证测试', () => {
    it('应该验证必需字段存在', () => {
      const data = createTestCoreEntity();
      delete (data as any).protocolVersion;

      expect(() => new CoreEntity(data)).toThrow('Missing required field: protocolVersion');
    });

    it('应该验证协议版本格式', () => {
      // 直接创建无效数据而不是修改现有实体
      const invalidData = {
        ...createTestCoreEntity(),
        protocolVersion: '2.0.0' as Version
      };

      expect(() => new CoreEntity(invalidData)).toThrow('Invalid protocol version, must be "1.0.0"');
    });

    it('应该验证UUID格式', () => {
      const invalidData = {
        ...createTestCoreEntity(),
        workflowId: 'invalid-uuid' as UUID
      };

      expect(() => new CoreEntity(invalidData)).toThrow('Invalid workflowId UUID format');
    });

    it('应该验证时间戳格式', () => {
      const invalidData = {
        ...createTestCoreEntity(),
        timestamp: 'invalid-timestamp' as Timestamp
      };

      expect(() => new CoreEntity(invalidData)).toThrow('Invalid timestamp format');
    });
  });

  describe('updateWorkflowConfig方法测试', () => {
    it('应该成功更新工作流配置', () => {
      const data = createTestCoreEntity();
      const entity = new CoreEntity(data);

      const newConfig: WorkflowConfig = {
        name: 'updated-workflow',
        description: 'Updated workflow configuration',
        stages: ['context', 'plan', 'confirm'],
        executionMode: ExecutionMode.PARALLEL,
        parallelExecution: true,
        timeoutMs: 600000,
        priority: Priority.HIGH,
        retryPolicy: {
          maxAttempts: 5,
          delayMs: 2000,
          backoffFactor: 1
        }
      };

      entity.updateWorkflowConfig(newConfig);

      expect(entity.workflowConfig).toEqual(newConfig);
      expect(entity.workflowConfig.name).toBe('updated-workflow');
      expect(entity.workflowConfig.stages).toHaveLength(3);
      expect(entity.workflowConfig.priority).toBe(Priority.HIGH);
    });
  });

  describe('updateExecutionStatus方法测试', () => {
    it('应该成功更新执行状态', () => {
      const data = createTestCoreEntity();
      const entity = new CoreEntity(data);

      const newStatus: ExecutionStatus = {
        status: 'in_progress',
        startTime: '2025-09-01T17:00:00.000Z',
        endTime: undefined,
        durationMs: 60000,
        currentStage: 'plan',
        completedStages: ['context'],
        stageResults: {
          context: { status: 'completed', durationMs: 30000 }
        },
        retryCount: 0
      };

      entity.updateExecutionStatus(newStatus);

      expect(entity.executionStatus).toEqual(newStatus);
      expect(entity.executionStatus.status).toBe('in_progress');
      expect(entity.executionStatus.currentStage).toBe('plan');
    });
  });

  describe('addAuditEvent方法测试', () => {
    it('应该成功添加审计事件', () => {
      const data = createTestCoreEntity();
      const entity = new CoreEntity(data);

      const auditEvent = createTestAuditEvent();

      entity.addAuditEvent(auditEvent);

      expect(entity.auditTrail.auditEvents).toHaveLength(1);
      expect(entity.auditTrail.auditEvents![0]).toEqual(auditEvent);
    });

    it('应该处理多个审计事件', () => {
      const data = createTestCoreEntity();
      const entity = new CoreEntity(data);

      const event1 = createTestAuditEvent();
      const event2 = createTestAuditEvent();
      event2.eventId = '33333333-3333-4333-8333-333333333333' as UUID;

      entity.addAuditEvent(event1);
      entity.addAuditEvent(event2);

      expect(entity.auditTrail.auditEvents).toHaveLength(2);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理最小有效配置', () => {
      const entity = createMinimalCoreEntity();

      expect(entity.workflowConfig.stages).toHaveLength(1);
      expect(entity.workflowConfig.priority).toBe(Priority.LOW);
    });

    it('应该处理最大配置', () => {
      const entity = createMaximalCoreEntity();

      expect(entity.workflowConfig.stages).toHaveLength(9);
      expect(entity.workflowConfig.priority).toBe(Priority.CRITICAL);
    });
  });
});
