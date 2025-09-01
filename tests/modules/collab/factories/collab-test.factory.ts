/**
 * Collab Test Factory - 基于实际Schema的企业级测试数据生成
 * @description 严格基于src/schemas/core-modules/mplp-collab.json的测试数据工厂
 * @version 1.0.0
 * @author MPLP Development Team
 *
 * CRITICAL: 所有字段名称和结构严格遵循实际Schema定义
 * Schema层: snake_case (collaboration_id, created_at, protocol_version)
 * TypeScript层: camelCase (collaborationId, createdAt, protocolVersion)
 */

import { generateUUID } from '../../../../src/shared/utils';
import { CollabMapper } from '../../../../src/modules/collab/api/mappers/collab.mapper';
import { CollabEntity, CollabCoordinationStrategy, CollabParticipant } from '../../../../src/modules/collab/domain/entities/collab.entity';

/**
 * 基于实际mplp-collab.json Schema的企业级测试数据工厂
 * 严格遵循Schema定义的字段名称、类型和结构
 */
export class CollabTestFactory {

  /**
   * 创建基于实际Schema的协作实体数据
   * 基于mplp-collab.json中的required字段和结构
   */
  static createCollabSchemaData(overrides?: Partial<any>): any {
    const participants = overrides?.participants || [
      this.createParticipantSchemaData({
        agent_id: generateUUID(),
        role_id: generateUUID(),
        status: 'active'
      }),
      this.createParticipantSchemaData({
        agent_id: generateUUID(),
        role_id: generateUUID(),
        status: 'active'
      })
    ];

    const baseData = {
      // 基于Schema的required字段 (snake_case)
      collaboration_id: generateUUID(),
      protocol_version: '1.0.0',
      timestamp: new Date().toISOString(),
      context_id: generateUUID(),
      plan_id: generateUUID(),
      name: 'Test Collaboration',
      description: 'A comprehensive test collaboration for enterprise testing',
      mode: 'parallel',
      participants,
      coordination_strategy: {
        type: 'distributed',
        decision_making: 'consensus'
        // coordinator_id 对于distributed类型是可选的
      },
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: generateUUID(),

      // 基于Schema的required复杂字段
      audit_trail: this.createAuditTrailData(),
      monitoring_integration: this.createMonitoringIntegrationData(),
      performance_metrics: this.createPerformanceMetricsData(),
      version_history: this.createVersionHistoryData(),
      search_metadata: this.createSearchMetadataData(),
      collab_operation: this.createOperationData(),
      event_integration: this.createEventIntegrationData(),

      ...overrides
    };

    return baseData;
  }

  /**
   * 创建基于实际Schema的参与者数据
   * 严格遵循Schema中participants数组项的结构
   */
  static createParticipantSchemaData(overrides?: Partial<any>): any {
    return {
      // 基于Schema的required字段 (snake_case)
      participant_id: generateUUID(),
      agent_id: generateUUID(),
      role_id: generateUUID(),
      status: 'active', // 基于entityStatus枚举

      // 基于Schema的optional字段
      capabilities: ['typescript', 'testing', 'collaboration'],
      priority: 50, // 0-100范围
      weight: 0.5, // 0-1范围
      joined_at: new Date().toISOString(),

      ...overrides
    };
  }

  /**
   * 创建审计跟踪数据 - 基于Schema的audit_trail字段
   */
  static createAuditTrailData(): any {
    return {
      enabled: true,
      retention_days: 365,
      events: [] // 基于实际Schema结构
    };
  }

  /**
   * 创建监控集成数据 - 基于Schema的monitoring_integration字段
   */
  static createMonitoringIntegrationData(): any {
    return {
      enabled: true,
      trace_id: generateUUID(),
      metrics_collection: true,
      alerting: {
        enabled: true,
        thresholds: {
          max_response_time_ms: 1000,
          min_success_rate: 0.95
        }
      }
    };
  }

  /**
   * 创建性能指标数据 - 基于Schema的performance_metrics字段
   */
  static createPerformanceMetricsData(): any {
    return {
      enabled: true,
      collection_interval_seconds: 60,
      metrics: {
        coordination_latency_ms: 50.5,
        participant_response_time_ms: 100.0,
        success_rate_percent: 95.0,
        throughput_operations_per_second: 10.5
      }
    };
  }

  /**
   * 创建版本历史数据 - 基于Schema的version_history字段
   */
  static createVersionHistoryData(): any {
    return {
      enabled: true,
      max_versions: 50,
      versions: [
        {
          version_id: generateUUID(),
          version_number: '1.0.0',
          created_at: new Date().toISOString(),
          created_by: 'test-user',
          changes: ['Initial collaboration creation']
        }
      ]
    };
  }

  /**
   * 创建搜索元数据 - 基于Schema的search_metadata字段
   */
  static createSearchMetadataData(): any {
    return {
      enabled: true,
      indexed_fields: ['collaboration_id', 'name', 'participants'],
      search_tags: ['collaboration', 'test'],
      full_text_search: true
    };
  }

  /**
   * 创建操作数据 - 基于Schema的collab_operation字段
   */
  static createOperationData(): any {
    return {
      operation_id: generateUUID(),
      operation_type: 'initiate',
      status: 'active',
      started_at: new Date().toISOString(),
      completed_at: undefined,
      result: undefined
    };
  }

  /**
   * 创建事件集成数据 - 基于Schema的event_integration字段
   */
  static createEventIntegrationData(): any {
    return {
      enabled: true,
      subscribed_events: ['context_updated', 'plan_executed', 'role_assigned'],
      published_events: ['collaboration_started', 'collaboration_ended', 'participant_joined'],
      event_routing: {
        routing_rules: [
          {
            rule_id: 'default_routing',
            condition: 'event_type == "collaboration_started"',
            target_topic: 'mplp.collab.started',
            enabled: true
          }
        ]
      }
    };
  }

  /**
   * 创建具有特定协调策略的协作数据 - 基于Schema
   */
  static createCollabWithStrategy(
    strategyType: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer',
    decisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator',
    participantCount: number = 3
  ): any {
    const participants = Array.from({ length: participantCount }, (_, index) =>
      this.createParticipantSchemaData({
        agent_id: generateUUID(),
        role_id: generateUUID(),
        status: 'active',
        capabilities: [`capability-${index + 1}`, 'collaboration', 'testing']
      })
    );

    // 确保需要coordinator的策略类型有coordinator_id
    const coordinator_id = (strategyType === 'centralized' || strategyType === 'hierarchical')
      ? participants[0].agent_id
      : (decisionMaking === 'coordinator' ? participants[0].agent_id : undefined);

    return this.createCollabSchemaData({
      name: `${strategyType} ${decisionMaking} Collaboration`,
      description: `Test collaboration with ${strategyType} coordination and ${decisionMaking} decision making`,
      coordination_strategy: {
        type: strategyType,
        decision_making: decisionMaking,
        coordinator_id
      },
      participants
    });
  }

  /**
   * 创建具有特定模式的协作数据 - 基于Schema
   */
  static createCollabWithMode(
    mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh',
    participantCount: number = 4
  ): any {
    const participants = Array.from({ length: participantCount }, (_, index) =>
      this.createParticipantSchemaData({
        agent_id: generateUUID(),
        role_id: generateUUID(),
        status: 'active',
        capabilities: [`${mode}-capability`, 'collaboration', 'testing']
      })
    );

    // 根据模式选择适当的协调策略
    let coordination_strategy;
    switch (mode) {
      case 'sequential':
      case 'pipeline':
        coordination_strategy = {
          type: 'centralized',
          decision_making: 'coordinator',
          coordinator_id: participants[0].agent_id
        };
        break;
      case 'parallel':
        coordination_strategy = {
          type: 'distributed',
          decision_making: 'consensus'
        };
        break;
      case 'mesh':
        coordination_strategy = {
          type: 'peer_to_peer',
          decision_making: 'consensus'
        };
        break;
      case 'hybrid':
      default:
        coordination_strategy = {
          type: 'hierarchical',
          decision_making: 'majority',
          coordinator_id: participants[0].agent_id
        };
        break;
    }

    return this.createCollabSchemaData({
      name: `${mode} Mode Collaboration`,
      description: `Test collaboration with ${mode} execution mode`,
      mode,
      coordination_strategy,
      participants
    });
  }

  /**
   * 创建性能测试数据 - 基于Schema
   */
  static createPerformanceTestData(participantCount: number): any {
    const participants = Array.from({ length: participantCount }, (_, index) =>
      this.createParticipantSchemaData({
        agent_id: generateUUID(),
        role_id: generateUUID(),
        status: 'active',
        capabilities: [
          `performance-capability-${index + 1}`,
          'high-throughput',
          'concurrent-processing',
          'load-testing'
        ]
      })
    );

    return this.createCollabSchemaData({
      name: `Performance Test Collaboration (${participantCount} participants)`,
      description: `Large-scale collaboration for performance testing with ${participantCount} participants`,
      mode: 'parallel',
      coordination_strategy: {
        type: participantCount > 10 ? 'hierarchical' : 'distributed',
        decision_making: participantCount > 10 ? 'majority' : 'consensus',
        coordinator_id: participantCount > 10 ? participants[0].agent_id : undefined
      },
      participants
    });
  }

  /**
   * 创建安全测试数据 - 基于Schema
   */
  static createSecurityTestData(): any {
    const participants = [
      this.createParticipantSchemaData({
        agent_id: 'security-admin-001',
        role_id: 'admin-role',
        status: 'active',
        capabilities: ['admin', 'security', 'audit']
      }),
      this.createParticipantSchemaData({
        agent_id: 'security-user-001',
        role_id: 'user-role',
        status: 'active',
        capabilities: ['read', 'write']
      }),
      this.createParticipantSchemaData({
        agent_id: 'security-guest-001',
        role_id: 'guest-role',
        status: 'active',
        capabilities: ['read']
      })
    ];

    return this.createCollabSchemaData({
      name: 'Security Test Collaboration',
      description: 'Collaboration for testing security and access control features',
      coordination_strategy: {
        type: 'centralized',
        decision_making: 'coordinator',
        coordinator_id: participants[0].agent_id // Admin as coordinator
      },
      participants
    });
  }

  /**
   * 创建集成测试数据 - 基于Schema
   */
  static createIntegrationTestData(): any {
    const participants = [
      this.createParticipantSchemaData({
        agent_id: 'integration-context-agent',
        role_id: 'context-role',
        status: 'active',
        capabilities: ['context-management', 'state-sync']
      }),
      this.createParticipantSchemaData({
        agent_id: 'integration-plan-agent',
        role_id: 'plan-role',
        status: 'active',
        capabilities: ['planning', 'strategy']
      }),
      this.createParticipantSchemaData({
        agent_id: 'integration-role-agent',
        role_id: 'role-management-role',
        status: 'active',
        capabilities: ['role-management', 'permissions']
      }),
      this.createParticipantSchemaData({
        agent_id: 'integration-trace-agent',
        role_id: 'trace-role',
        status: 'active',
        capabilities: ['monitoring', 'tracing']
      })
    ];

    return this.createCollabSchemaData({
      name: 'Integration Test Collaboration',
      description: 'Collaboration for testing integration with other MPLP modules',
      mode: 'hybrid',
      coordination_strategy: {
        type: 'hierarchical',
        decision_making: 'weighted',
        coordinator_id: participants[0].agent_id
      },
      participants
    });
  }

  /**
   * 创建特定测试场景的数据 - 基于Schema
   */
  static createScenarioTestData(scenario: string): any {
    switch (scenario) {
      case 'large_team':
        return this.createPerformanceTestData(25);

      case 'small_team':
        return this.createCollabWithMode('mesh', 2);

      case 'complex_hierarchy':
        return this.createCollabWithStrategy('hierarchical', 'weighted', 15);

      case 'simple_consensus':
        return this.createCollabWithStrategy('distributed', 'consensus', 5);

      case 'coordinator_led':
        return this.createCollabWithStrategy('centralized', 'coordinator', 8);

      case 'mesh_network':
        return this.createCollabWithMode('mesh', 6);

      case 'pipeline_flow':
        return this.createCollabWithMode('pipeline', 4);

      default:
        return this.createCollabSchemaData();
    }
  }

  /**
   * 创建CollabEntity实例 - 用于单元测试
   */
  static createCollabEntity(overrides?: Partial<any>): any {
    const schemaData = this.createCollabSchemaData(overrides);

    // 直接创建entityData，绕过CollabMapper问题
    const entityData = {
      // 基本协议字段
      id: schemaData.collaboration_id, // Add missing id field
      collaborationId: schemaData.collaboration_id,
      protocolVersion: schemaData.protocol_version,
      timestamp: new Date(schemaData.timestamp),
      contextId: schemaData.context_id,
      planId: schemaData.plan_id,
      name: schemaData.name,
      description: schemaData.description,
      mode: schemaData.mode,
      status: schemaData.status,

      // 协作特定字段
      participants: schemaData.participants.map(p => ({
        participantId: p.participant_id,
        agentId: p.agent_id,
        roleId: p.role_id,
        status: p.status,
        capabilities: p.capabilities,
        priority: p.priority,
        weight: p.weight,
        joinedAt: new Date(p.joined_at)
      })),

      coordinationStrategy: {
        type: schemaData.coordination_strategy.type,
        coordinatorId: schemaData.coordination_strategy.coordinator_id || schemaData.participants[0].participant_id,
        decisionMaking: schemaData.coordination_strategy.decision_making
      },

      // 横切关注点字段
      createdAt: new Date(schemaData.created_at),
      createdBy: schemaData.created_by,
      updatedAt: schemaData.updated_at ? new Date(schemaData.updated_at) : undefined,
      updatedBy: schemaData.updated_by
    };

    // 确保coordinationStrategy存在
    if (!entityData.coordinationStrategy) {
      const coordinatorId = entityData.participants?.[0]?.participantId || generateUUID();
      entityData.coordinationStrategy = {
        type: 'centralized',
        decisionMaking: 'coordinator',
        coordinatorId: coordinatorId
      };
    }

    // 创建正确的CollabCoordinationStrategy实例
    const coordinationStrategy = new CollabCoordinationStrategy(
      entityData.coordinationStrategy.type,
      entityData.coordinationStrategy.decisionMaking,
      entityData.coordinationStrategy.coordinatorId
    );

    const entity = new CollabEntity(
      schemaData.collaboration_id,
      entityData.contextId,
      entityData.planId,
      entityData.name,
      entityData.mode,
      coordinationStrategy,
      entityData.createdBy,
      entityData.description
    );

    // 添加参与者以满足canStart()的要求
    entityData.participants.forEach(participantData => {
      const participant = new CollabParticipant(
        participantData.participantId,
        participantData.agentId,
        participantData.roleId,
        participantData.status,
        participantData.capabilities
      );
      entity.addParticipant(participant, entityData.createdBy);
    });

    return entity;
  }

  /**
   * 创建参与者实体数据 - 用于单元测试
   */
  static createParticipantEntityData(overrides?: Partial<any>): any {
    const participantSchema = this.createParticipantSchemaData(overrides);
    const fullSchema = this.createCollabSchemaData({ participants: [participantSchema] });
    const entityData = CollabMapper.fromSchema(fullSchema);
    return entityData.participants[0];
  }

  /**
   * 创建协调策略实体数据 - 用于单元测试
   */
  static createCoordinationStrategyData(
    type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer',
    decisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator',
    coordinatorId?: string
  ): CollabCoordinationStrategy {
    return new CollabCoordinationStrategy(type, decisionMaking, coordinatorId);
  }
}
