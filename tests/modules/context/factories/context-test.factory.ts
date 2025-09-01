/**
 * Context模块测试数据工厂
 * 基于MPLP统一测试标准v1.0
 * 
 * @description 提供标准化的Context测试数据生成
 * @version 1.0.0
 * @standard MPLP统一测试标准
 */

import { ContextEntity } from '../../../../src/modules/context/domain/entities/context.entity';
import { ContextEntityData, ContextStatus, LifecycleStage } from '../../../../src/modules/context/types';
import { UUID, Timestamp } from '../../../../src/shared/types';
import { generateUUID } from '../../../../src/shared/utils';

export class ContextTestFactory {
  /**
   * 创建标准Context实体用于测试
   */
  static createContextEntity(overrides: Partial<ContextEntityData> = {}): ContextEntity {
    const defaultData: ContextEntityData = {
      // 基础协议字段
      protocolVersion: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z' as Timestamp,
      contextId: generateUUID() as UUID,
      name: 'Test Context',
      description: 'Test context for unit testing',
      status: 'active' as ContextStatus,
      lifecycleStage: 'executing' as LifecycleStage,

      // 核心功能字段
      sharedState: {
        data: {
          projectName: 'Test Project',
          environment: 'test'
        },
        metadata: {
          version: '1.0.0',
          lastModified: '2025-01-01T00:00:00.000Z' as Timestamp,
          modifiedBy: 'test-factory'
        }
      },
      accessControl: {
        owner: 'user-test-001',
        permissions: [{
          principal: 'user-test-001',
          principalType: 'user',
          permissions: ['read', 'write', 'execute']
        }],
        policies: []
      },
      configuration: {
        timeoutSettings: {
          executionTimeout: 30000,
          idleTimeout: 300000
        },
        persistence: {
          enabled: true,
          storageBackend: 'memory'
        }
      },

      // 企业级功能字段
      auditTrail: {
        enabled: true,
        retentionDays: 90,
        auditEvents: []
      },
      monitoringIntegration: {},
      performanceMetrics: {},
      versionHistory: {},
      searchMetadata: {},
      cachingPolicy: {},
      syncConfiguration: {},
      errorHandling: {},
      integrationEndpoints: {},
      eventIntegration: {}
    };

    return new ContextEntity({ ...defaultData, ...overrides });
  }

  /**
   * 创建Context Schema格式数据 (snake_case)
   */
  static createContextSchema(overrides: Partial<any> = {}) {
    const defaultSchema = {
      protocol_version: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z',
      context_id: 'ctx-test-001',
      name: 'Test Context',
      description: 'Test context for unit testing',
      status: 'active',
      lifecycle_stage: 'executing',
      shared_state: {
        data: {
          project_name: 'Test Project',
          environment: 'test'
        },
        metadata: {
          version: '1.0.0',
          last_modified: '2025-01-01T00:00:00.000Z',
          modified_by: 'test-factory'
        }
      },
      access_control: {
        owner: 'user-test-001',
        permissions: [{
          principal: 'user-test-001',
          principal_type: 'user',
          permissions: ['read', 'write', 'execute']
        }],
        policies: []
      },
      configuration: {
        timeout_settings: {
          execution_timeout: 30000,
          idle_timeout: 300000
        },
        persistence: {
          enabled: true,
          storage_backend: 'memory'
        }
      },
      audit_trail: {
        enabled: true,
        retention_days: 90,
        audit_events: []
      }
    };

    return { ...defaultSchema, ...overrides };
  }

  /**
   * 创建Context DTO数据
   */
  static createContextDto(overrides: Partial<any> = {}) {
    const defaultDto = {
      contextId: 'ctx-test-001',
      sessionId: 'session-test-001',
      userId: 'user-test-001',
      contextType: 'development',
      contextData: {
        projectName: 'Test Project',
        environment: 'test'
      },
      version: '1.0.0',
      isActive: true
    };

    return { ...defaultDto, ...overrides };
  }

  /**
   * 创建批量Context实体数组
   */
  static createContextEntityArray(count: number = 3): ContextEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createContextEntity({
        contextId: `ctx-test-${String(index + 1).padStart(3, '0')}` as UUID,
        contextData: {
          projectName: `Test Project ${index + 1}`,
          environment: 'test',
          metadata: {
            createdBy: 'test-factory',
            purpose: 'batch-testing',
            index: index + 1
          }
        }
      })
    );
  }

  /**
   * 创建批量Context Schema数组
   */
  static createContextSchemaArray(count: number = 3) {
    return Array.from({ length: count }, (_, index) => 
      this.createContextSchema({
        context_id: `ctx-test-${String(index + 1).padStart(3, '0')}`,
        context_data: {
          project_name: `Test Project ${index + 1}`,
          environment: 'test',
          metadata: {
            created_by: 'test-factory',
            purpose: 'batch-testing',
            index: index + 1
          }
        }
      })
    );
  }

  /**
   * 创建性能测试用的大量数据
   */
  static createPerformanceTestData(count: number = 1000): ContextEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createContextEntity({
        contextId: `ctx-perf-${String(index + 1).padStart(6, '0')}` as UUID,
        contextData: {
          projectName: `Performance Test ${index + 1}`,
          environment: 'performance',
          metadata: {
            createdBy: 'performance-factory',
            purpose: 'performance-testing',
            batchId: Math.floor(index / 100),
            index: index + 1
          }
        }
      })
    );
  }

  /**
   * 创建错误场景测试数据
   */
  static createInvalidContextData() {
    return {
      validContext: this.createContextEntity(),
      invalidContextId: this.createContextEntity({ contextId: '' }),
      invalidContextType: this.createContextEntity({ contextType: '' }),
      nullContextData: this.createContextEntity({ contextData: null }),
      undefinedFields: this.createContextEntity({ 
        contextId: undefined,
        sessionId: undefined 
      })
    };
  }

  /**
   * 创建边界条件测试数据
   */
  static createBoundaryTestData() {
    return {
      minimalContext: this.createContextEntity({
        contextData: { projectName: 'Min' }
      }),
      maximalContext: this.createContextEntity({
        contextData: {
          projectName: 'A'.repeat(255),
          environment: 'production',
          metadata: {
            createdBy: 'boundary-test',
            purpose: 'boundary-testing',
            largeData: 'X'.repeat(1000)
          }
        }
      }),
      emptyContext: this.createContextEntity({
        contextData: {}
      })
    };
  }
}
