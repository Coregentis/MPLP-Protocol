/**
 * Trace Entity单元测试
 * 
 * @description 测试Trace模块的Domain Entity，确保业务逻辑和不变量的正确性
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @pattern 基于Context模块的IDENTICAL企业级测试模式
 */

import { TraceEntity } from '../../../../src/modules/trace/domain/entities/trace.entity';
import { TraceTestFactory } from '../factories/trace-test.factory';
import { UUID } from '../../../../src/shared/types';

describe('TraceEntity测试', () => {

  describe('构造函数', () => {
    it('应该成功创建Trace实体', () => {
      // 📋 Arrange
      const testData = TraceTestFactory.createTraceEntityData();

      // 🎬 Act
      const entity = new TraceEntity(testData);

      // ✅ Assert
      expect(entity.traceId).toBe(testData.traceId);
      expect(entity.contextId).toBe(testData.contextId);
      expect(entity.traceType).toBe(testData.traceType);
      expect(entity.severity).toBe(testData.severity);
      expect(entity.event).toEqual(testData.event);
      expect(entity.timestamp).toBeDefined(); // Entity会重新生成时间戳
      expect(entity.traceOperation).toBe(testData.traceOperation);
    });

    it('应该使用默认值初始化缺失字段', () => {
      // 📋 Arrange
      const minimalData = {
        contextId: 'test-context-id' as UUID,
        traceType: 'execution' as const,
        severity: 'info' as const,
        event: {
          type: 'start' as const,
          name: 'Test Event',
          category: 'system' as const,
          source: { component: 'test' }
        },
        traceOperation: 'start' as const
      };

      // 🎬 Act
      const entity = new TraceEntity(minimalData);

      // ✅ Assert
      expect(entity.traceId).toBeDefined();
      expect(entity.timestamp).toBeDefined();
      expect(entity.contextId).toBe(minimalData.contextId);
      expect(entity.traceType).toBe(minimalData.traceType);
      expect(entity.severity).toBe(minimalData.severity);
    });

    it('应该验证必需字段', () => {
      // 📋 Arrange
      const invalidData = {};

      // 🎬 Act & Assert
      expect(() => new TraceEntity(invalidData)).toThrow('Context ID is required');
    });

    it('应该验证事件名称', () => {
      // 📋 Arrange
      const invalidData = {
        contextId: 'test-context-id' as UUID,
        event: {
          type: 'start' as const,
          name: '', // 空名称
          category: 'system' as const,
          source: { component: 'test' }
        }
      };

      // 🎬 Act & Assert
      expect(() => new TraceEntity(invalidData)).toThrow('Event name is required');
    });
  });

  describe('业务方法', () => {
    let entity: TraceEntity;

    beforeEach(() => {
      const testData = TraceTestFactory.createTraceEntityData();
      entity = new TraceEntity(testData);
    });

    describe('updateSeverity', () => {
      it('应该成功更新严重程度', () => {
        // 📋 Arrange
        const originalSeverity = entity.severity;

        // 🎬 Act
        entity.updateSeverity('error');

        // ✅ Assert
        expect(entity.severity).toBe('error');
        expect(entity.severity).not.toBe(originalSeverity);
        expect(entity.timestamp).toBeDefined(); // 时间戳应该存在
      });

      it('应该验证严重程度值', () => {
        // 🎬 Act & Assert
        expect(() => entity.updateSeverity('invalid' as any)).toThrow('Invalid severity: invalid');
      });

      it('应该支持所有有效的严重程度', () => {
        // 📋 Arrange
        const validSeverities = ['debug', 'info', 'warn', 'error', 'critical'] as const;

        // 🎬 Act & Assert
        validSeverities.forEach(severity => {
          expect(() => entity.updateSeverity(severity)).not.toThrow();
          expect(entity.severity).toBe(severity);
        });
      });
    });

    describe('addErrorInformation', () => {
      it('应该成功添加错误信息', () => {
        // 📋 Arrange
        const errorInfo = {
          errorCode: 'ERR_001',
          errorMessage: 'Test error',
          errorType: 'system' as const
        };

        // 🎬 Act
        entity.addErrorInformation(errorInfo);

        // ✅ Assert
        expect(entity.errorInformation).toEqual(errorInfo);
        expect(entity.severity).toBe('error'); // 应该自动提升严重程度
      });

      it('应该验证错误信息', () => {
        // 📋 Arrange
        const invalidErrorInfo = {
          errorCode: '',
          errorMessage: 'Test error',
          errorType: 'system' as const
        };

        // 🎬 Act & Assert
        expect(() => entity.addErrorInformation(invalidErrorInfo)).toThrow('Error code and message are required');
      });
    });

    describe('addDecisionLog', () => {
      it('应该成功添加决策日志', () => {
        // 📋 Arrange
        const decisionLog = {
          decisionPoint: 'test-decision',
          optionsConsidered: [
            { option: 'option1', score: 0.8 },
            { option: 'option2', score: 0.6 }
          ],
          selectedOption: 'option1'
        };

        // 🎬 Act
        entity.addDecisionLog(decisionLog);

        // ✅ Assert
        expect(entity.decisionLog).toEqual(decisionLog);
      });

      it('应该验证决策日志', () => {
        // 📋 Arrange
        const invalidDecisionLog = {
          decisionPoint: '',
          optionsConsidered: [],
          selectedOption: 'option1'
        };

        // 🎬 Act & Assert
        expect(() => entity.addDecisionLog(invalidDecisionLog)).toThrow('Decision point and selected option are required');
      });
    });

    describe('updateContextSnapshot', () => {
      it('应该成功更新上下文快照', () => {
        // 📋 Arrange
        const snapshot = {
          variables: { key: 'value' },
          callStack: [
            { function: 'testFunction', file: 'test.ts', line: 10 }
          ]
        };

        // 🎬 Act
        entity.updateContextSnapshot(snapshot);

        // ✅ Assert
        expect(entity.contextSnapshot).toEqual(snapshot);
      });
    });

    describe('isError', () => {
      it('应该正确识别错误追踪', () => {
        // 📋 Arrange
        entity.updateSeverity('error');

        // 🎬 Act & Assert
        expect(entity.isError()).toBe(true);
      });

      it('应该正确识别有错误信息的追踪', () => {
        // 📋 Arrange
        const errorInfo = {
          errorCode: 'ERR_001',
          errorMessage: 'Test error',
          errorType: 'system' as const
        };
        entity.addErrorInformation(errorInfo);

        // 🎬 Act & Assert
        expect(entity.isError()).toBe(true);
      });

      it('应该正确识别非错误追踪', () => {
        // 📋 Arrange
        const cleanData = {
          contextId: 'test-context-id' as UUID,
          traceType: 'execution' as const,
          severity: 'info' as const,
          event: {
            type: 'start' as const,
            name: 'Test Event',
            category: 'system' as const,
            source: { component: 'test' }
          },
          traceOperation: 'start' as const
        };
        const cleanEntity = new TraceEntity(cleanData);

        // 🎬 Act & Assert
        expect(cleanEntity.isError()).toBe(false);
      });
    });

    describe('hasDecision', () => {
      it('应该正确识别包含决策的追踪', () => {
        // 📋 Arrange
        const decisionLog = {
          decisionPoint: 'test-decision',
          optionsConsidered: [{ option: 'option1', score: 0.8 }],
          selectedOption: 'option1'
        };
        entity.addDecisionLog(decisionLog);

        // 🎬 Act & Assert
        expect(entity.hasDecision()).toBe(true);
      });

      it('应该正确识别不包含决策的追踪', () => {
        // 📋 Arrange
        const cleanData = {
          contextId: 'test-context-id' as UUID,
          traceType: 'execution' as const,
          severity: 'info' as const,
          event: {
            type: 'start' as const,
            name: 'Test Event',
            category: 'system' as const,
            source: { component: 'test' }
          },
          traceOperation: 'start' as const
        };
        const cleanEntity = new TraceEntity(cleanData);

        // 🎬 Act & Assert
        expect(cleanEntity.hasDecision()).toBe(false);
      });
    });

    describe('getDuration', () => {
      it('应该计算追踪持续时间', () => {
        // 📋 Arrange
        const testData = TraceTestFactory.createTraceEntityData({
          traceDetails: { samplingRate: 1.0 }
        });
        const entity = new TraceEntity(testData);

        // 🎬 Act
        const duration = entity.getDuration();

        // ✅ Assert
        expect(duration).toBeGreaterThanOrEqual(0);
        expect(typeof duration).toBe('number');
      });

      it('应该在没有采样率时返回undefined', () => {
        // 📋 Arrange
        const cleanData = {
          contextId: 'test-context-id' as UUID,
          traceType: 'execution' as const,
          severity: 'info' as const,
          event: {
            type: 'start' as const,
            name: 'Test Event',
            category: 'system' as const,
            source: { component: 'test' }
          },
          traceOperation: 'start' as const
          // 没有traceDetails.samplingRate
        };
        const cleanEntity = new TraceEntity(cleanData);

        // 🎬 Act
        const duration = cleanEntity.getDuration();

        // ✅ Assert
        expect(duration).toBeUndefined();
      });
    });

    describe('toData', () => {
      it('应该返回完整的数据对象', () => {
        // 🎬 Act
        const data = entity.toData();

        // ✅ Assert
        expect(data.traceId).toBe(entity.traceId);
        expect(data.contextId).toBe(entity.contextId);
        expect(data.traceType).toBe(entity.traceType);
        expect(data.severity).toBe(entity.severity);
        expect(data.event).toEqual(entity.event);
        expect(data.timestamp).toBe(entity.timestamp);
        expect(data.traceOperation).toBe(entity.traceOperation);
      });

      it('应该返回数据的副本而不是引用', () => {
        // 🎬 Act
        const data1 = entity.toData();
        const data2 = entity.toData();

        // ✅ Assert
        expect(data1).not.toBe(data2); // 不同的对象引用
        expect(data1).toEqual(data2); // 但内容相同
      });
    });
  });

  describe('不变量验证', () => {
    it('应该验证追踪类型', () => {
      // 📋 Arrange
      const invalidData = {
        contextId: 'test-context-id' as UUID,
        traceType: 'invalid' as any,
        severity: 'info' as const,
        event: {
          type: 'start' as const,
          name: 'Test Event',
          category: 'system' as const,
          source: { component: 'test' }
        },
        traceOperation: 'start' as const
      };

      // 🎬 Act & Assert
      expect(() => new TraceEntity(invalidData)).toThrow('Invalid trace type: invalid');
    });

    it('应该支持所有有效的追踪类型', () => {
      // 📋 Arrange
      const validTraceTypes = ['execution', 'monitoring', 'audit', 'performance', 'error', 'decision'] as const;

      // 🎬 Act & Assert
      validTraceTypes.forEach(traceType => {
        const data = {
          contextId: 'test-context-id' as UUID,
          traceType,
          severity: 'info' as const,
          event: {
            type: 'start' as const,
            name: 'Test Event',
            category: 'system' as const,
            source: { component: 'test' }
          },
          traceOperation: 'start' as const
        };

        expect(() => new TraceEntity(data)).not.toThrow();
      });
    });
  });

  describe('ID生成', () => {
    it('应该生成唯一的追踪ID', () => {
      // 📋 Arrange
      const data1 = { contextId: 'test-context-id-1' as UUID };
      const data2 = { contextId: 'test-context-id-2' as UUID };

      // 🎬 Act
      const entity1 = new TraceEntity(data1);
      const entity2 = new TraceEntity(data2);

      // ✅ Assert
      expect(entity1.traceId).not.toBe(entity2.traceId);
      expect(entity1.traceId).toMatch(/^trace-\d+-[a-z0-9]+$/);
      expect(entity2.traceId).toMatch(/^trace-\d+-[a-z0-9]+$/);
    });
  });
});
