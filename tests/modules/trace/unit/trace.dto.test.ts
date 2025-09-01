/**
 * Trace DTO单元测试
 * 
 * @description 测试Trace模块的API DTOs，确保Schema驱动开发和双重命名约定的正确性
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @pattern 基于Context模块的IDENTICAL企业级测试模式
 */

import {
  CreateTraceDto,
  UpdateTraceDto,
  TraceQueryDto,
  EventObjectDto,
  ContextSnapshotDto,
  ErrorInformationDto,
  DecisionLogDto,
  TraceDetailsDto,
  TraceResponseDto,
  TraceQueryResultDto,
  TraceOperationResultDto,
  BatchOperationResultDto,
  HealthStatusDto
} from '../../../../src/modules/trace/api/dto/trace.dto';
import { TraceTestFactory } from '../factories/trace-test.factory';

describe('Trace DTO测试', () => {
  
  describe('CreateTraceDto', () => {
    it('应该正确实现CreateTraceRequest接口', () => {
      const dto = new CreateTraceDto();
      const testData = TraceTestFactory.createTraceRequest();
      
      // 设置必需字段
      dto.contextId = testData.contextId;
      dto.traceType = testData.traceType;
      dto.severity = testData.severity;
      dto.event = testData.event;
      dto.traceOperation = testData.traceOperation;
      
      // 验证必需字段
      expect(dto.contextId).toBe(testData.contextId);
      expect(dto.traceType).toBe(testData.traceType);
      expect(dto.severity).toBe(testData.severity);
      expect(dto.event).toEqual(testData.event);
      expect(dto.traceOperation).toBe(testData.traceOperation);
    });

    it('应该支持可选字段', () => {
      const dto = new CreateTraceDto();
      const testData = TraceTestFactory.createTraceRequest();
      
      // 设置可选字段
      dto.planId = testData.planId;
      dto.taskId = testData.taskId;
      dto.contextSnapshot = testData.contextSnapshot;
      dto.errorInformation = testData.errorInformation;
      dto.decisionLog = testData.decisionLog;
      dto.traceDetails = testData.traceDetails;
      
      // 验证可选字段
      expect(dto.planId).toBe(testData.planId);
      expect(dto.taskId).toBe(testData.taskId);
      expect(dto.contextSnapshot).toEqual(testData.contextSnapshot);
      expect(dto.errorInformation).toEqual(testData.errorInformation);
      expect(dto.decisionLog).toEqual(testData.decisionLog);
      expect(dto.traceDetails).toEqual(testData.traceDetails);
    });
  });

  describe('UpdateTraceDto', () => {
    it('应该正确实现UpdateTraceRequest接口', () => {
      const dto = new UpdateTraceDto();
      const testData = TraceTestFactory.createUpdateTraceRequest('test-trace-id');
      
      // 设置必需字段
      dto.traceId = testData.traceId;
      
      // 验证必需字段
      expect(dto.traceId).toBe(testData.traceId);
    });

    it('应该支持可选更新字段', () => {
      const dto = new UpdateTraceDto();
      const testData = TraceTestFactory.createUpdateTraceRequest('test-trace-id');
      
      // 设置可选字段
      dto.severity = testData.severity;
      dto.event = testData.event;
      dto.contextSnapshot = testData.contextSnapshot;
      dto.errorInformation = testData.errorInformation;
      dto.decisionLog = testData.decisionLog;
      dto.traceDetails = testData.traceDetails;
      
      // 验证可选字段
      expect(dto.severity).toBe(testData.severity);
      expect(dto.event).toEqual(testData.event);
      expect(dto.contextSnapshot).toEqual(testData.contextSnapshot);
      expect(dto.errorInformation).toEqual(testData.errorInformation);
      expect(dto.decisionLog).toEqual(testData.decisionLog);
      expect(dto.traceDetails).toEqual(testData.traceDetails);
    });
  });

  describe('TraceQueryDto', () => {
    it('应该正确实现TraceQueryFilter接口', () => {
      const dto = new TraceQueryDto();
      const testFilter = TraceTestFactory.createTraceQueryFilter();
      
      // 设置查询字段
      dto.contextId = testFilter.contextId;
      dto.planId = testFilter.planId;
      dto.taskId = testFilter.taskId;
      dto.traceType = testFilter.traceType;
      dto.severity = testFilter.severity;
      dto.eventCategory = testFilter.eventCategory;
      dto.createdAfter = testFilter.createdAfter;
      dto.createdBefore = testFilter.createdBefore;
      dto.hasErrors = testFilter.hasErrors;
      dto.hasDecisions = testFilter.hasDecisions;
      
      // 验证查询字段
      expect(dto.contextId).toBe(testFilter.contextId);
      expect(dto.planId).toBe(testFilter.planId);
      expect(dto.taskId).toBe(testFilter.taskId);
      expect(dto.traceType).toBe(testFilter.traceType);
      expect(dto.severity).toBe(testFilter.severity);
      expect(dto.eventCategory).toBe(testFilter.eventCategory);
      expect(dto.createdAfter).toBe(testFilter.createdAfter);
      expect(dto.createdBefore).toBe(testFilter.createdBefore);
      expect(dto.hasErrors).toBe(testFilter.hasErrors);
      expect(dto.hasDecisions).toBe(testFilter.hasDecisions);
    });

    it('应该支持数组类型的过滤器', () => {
      const dto = new TraceQueryDto();
      
      // 设置数组类型字段
      dto.traceType = ['execution', 'performance'];
      dto.severity = ['error', 'warn'];
      
      // 验证数组类型字段
      expect(dto.traceType).toEqual(['execution', 'performance']);
      expect(dto.severity).toEqual(['error', 'warn']);
    });
  });

  describe('EventObjectDto', () => {
    it('应该正确实现EventObject接口', () => {
      const dto = new EventObjectDto();
      const testEvent = TraceTestFactory.createEventObject();
      
      // 设置必需字段
      dto.type = testEvent.type;
      dto.name = testEvent.name;
      dto.category = testEvent.category;
      dto.source = testEvent.source;
      
      // 验证必需字段
      expect(dto.type).toBe(testEvent.type);
      expect(dto.name).toBe(testEvent.name);
      expect(dto.category).toBe(testEvent.category);
      expect(dto.source).toEqual(testEvent.source);
    });

    it('应该支持可选字段', () => {
      const dto = new EventObjectDto();
      const testEvent = TraceTestFactory.createEventObject();
      
      // 设置可选字段
      dto.description = testEvent.description;
      dto.data = testEvent.data;
      
      // 验证可选字段
      expect(dto.description).toBe(testEvent.description);
      expect(dto.data).toEqual(testEvent.data);
    });
  });

  describe('ErrorInformationDto', () => {
    it('应该正确实现ErrorInformation接口', () => {
      const dto = new ErrorInformationDto();
      
      // 设置必需字段
      dto.errorCode = 'ERR_001';
      dto.errorMessage = 'Test error message';
      dto.errorType = 'system';
      
      // 验证必需字段
      expect(dto.errorCode).toBe('ERR_001');
      expect(dto.errorMessage).toBe('Test error message');
      expect(dto.errorType).toBe('system');
    });

    it('应该支持错误类型枚举', () => {
      const dto = new ErrorInformationDto();
      
      // 测试所有错误类型
      const errorTypes = ['system', 'business', 'validation', 'network', 'timeout', 'security'] as const;
      
      errorTypes.forEach(errorType => {
        dto.errorType = errorType;
        expect(dto.errorType).toBe(errorType);
      });
    });

    it('应该支持恢复操作枚举', () => {
      const dto = new ErrorInformationDto();
      
      // 设置恢复操作
      dto.recoveryActions = [
        {
          action: 'retry',
          description: 'Retry the operation',
          parameters: { maxRetries: 3 }
        },
        {
          action: 'fallback',
          description: 'Use fallback method'
        }
      ];
      
      // 验证恢复操作
      expect(dto.recoveryActions).toHaveLength(2);
      expect(dto.recoveryActions![0].action).toBe('retry');
      expect(dto.recoveryActions![1].action).toBe('fallback');
    });
  });

  describe('TraceResponseDto', () => {
    it('应该包含所有必需字段', () => {
      const dto = new TraceResponseDto();
      const testTrace = TraceTestFactory.createTraceEntityData();
      
      // 设置所有必需字段
      dto.traceId = testTrace.traceId;
      dto.contextId = testTrace.contextId;
      dto.traceType = testTrace.traceType;
      dto.severity = testTrace.severity;
      dto.event = testTrace.event;
      dto.timestamp = testTrace.timestamp;
      dto.traceOperation = testTrace.traceOperation;
      dto.protocolVersion = testTrace.protocolVersion;
      
      // 验证所有必需字段
      expect(dto.traceId).toBe(testTrace.traceId);
      expect(dto.contextId).toBe(testTrace.contextId);
      expect(dto.traceType).toBe(testTrace.traceType);
      expect(dto.severity).toBe(testTrace.severity);
      expect(dto.event).toEqual(testTrace.event);
      expect(dto.timestamp).toBe(testTrace.timestamp);
      expect(dto.traceOperation).toBe(testTrace.traceOperation);
      expect(dto.protocolVersion).toBe(testTrace.protocolVersion);
    });

    it('应该使用camelCase命名约定', () => {
      const dto = new TraceResponseDto();
      
      // 验证camelCase字段存在
      expect('traceId' in dto).toBe(true);
      expect('contextId' in dto).toBe(true);
      expect('traceType' in dto).toBe(true);
      expect('traceOperation' in dto).toBe(true);
      expect('protocolVersion' in dto).toBe(true);
      expect('contextSnapshot' in dto).toBe(true);
      expect('errorInformation' in dto).toBe(true);
      expect('decisionLog' in dto).toBe(true);
      expect('traceDetails' in dto).toBe(true);
      
      // 验证snake_case字段不存在
      expect('trace_id' in dto).toBe(false);
      expect('context_id' in dto).toBe(false);
      expect('trace_type' in dto).toBe(false);
      expect('trace_operation' in dto).toBe(false);
      expect('protocol_version' in dto).toBe(false);
    });
  });

  describe('TraceOperationResultDto', () => {
    it('应该支持成功结果', () => {
      const dto = new TraceOperationResultDto();
      const testTrace = TraceTestFactory.createTraceEntityData();
      
      // 设置成功结果
      dto.success = true;
      dto.traceId = testTrace.traceId;
      dto.message = 'Operation successful';
      dto.data = testTrace as any;
      
      // 验证成功结果
      expect(dto.success).toBe(true);
      expect(dto.traceId).toBe(testTrace.traceId);
      expect(dto.message).toBe('Operation successful');
      expect(dto.data).toEqual(testTrace);
    });

    it('应该支持失败结果', () => {
      const dto = new TraceOperationResultDto();
      
      // 设置失败结果
      dto.success = false;
      dto.message = 'Operation failed';
      dto.error = 'Test error message';
      
      // 验证失败结果
      expect(dto.success).toBe(false);
      expect(dto.message).toBe('Operation failed');
      expect(dto.error).toBe('Test error message');
    });
  });

  describe('HealthStatusDto', () => {
    it('应该支持所有健康状态', () => {
      const dto = new HealthStatusDto();
      
      // 测试所有健康状态
      const statuses = ['healthy', 'degraded', 'unhealthy'] as const;
      
      statuses.forEach(status => {
        dto.status = status;
        expect(dto.status).toBe(status);
      });
    });

    it('应该包含详细信息', () => {
      const dto = new HealthStatusDto();
      
      // 设置详细信息
      dto.status = 'healthy';
      dto.timestamp = new Date().toISOString();
      dto.details = {
        service: 'TraceManagementService',
        version: '1.0.0',
        repository: {
          status: 'healthy',
          recordCount: 100,
          lastOperation: 'query'
        }
      };
      
      // 验证详细信息
      expect(dto.details?.service).toBe('TraceManagementService');
      expect(dto.details?.version).toBe('1.0.0');
      expect(dto.details?.repository.status).toBe('healthy');
      expect(dto.details?.repository.recordCount).toBe(100);
      expect(dto.details?.repository.lastOperation).toBe('query');
    });
  });
});
