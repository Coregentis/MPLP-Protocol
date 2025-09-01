/**
 * Dialog测试工厂
 * 
 * @description Dialog模块的测试数据工厂，提供标准化的测试数据生成
 * @version 1.0.0
 * @schema 基于 mplp-dialog.json Schema驱动开发
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

import { DialogEntity } from '../../../src/modules/dialog/domain/entities/dialog.entity';
import {
  DialogSchema,
  DialogCapabilities,
  DialogStrategy,
  DialogContext,
  DialogConfiguration,
  DialogAuditTrail,
  DialogMonitoringIntegration,
  DialogPerformanceMetrics,
  DialogVersionHistory,
  DialogSearchMetadata,
  DialogEventIntegration,
  DialogDetails,
  UUID
} from '../../../src/modules/dialog/types';

/**
 * Dialog测试工厂类
 * 
 * @description 提供Dialog相关的测试数据生成方法
 */
export class DialogTestFactory {
  /**
   * 生成测试用的UUID v4格式
   */
  static generateTestId(): UUID {
    // 生成符合UUID v4格式的测试ID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 创建基础的Dialog能力配置
   */
  static createBasicCapabilities(): DialogCapabilities {
    return {
      basic: {
        enabled: true,
        messageHistory: true,
        participantManagement: true
      },
      intelligentControl: {
        enabled: true,
        adaptiveRounds: true,
        dynamicStrategy: true,
        completenessEvaluation: true
      },
      criticalThinking: {
        enabled: true,
        analysisDepth: 'moderate',
        questionGeneration: true,
        logicValidation: true
      },
      knowledgeSearch: {
        enabled: true,
        realTimeSearch: true,
        knowledgeValidation: true,
        sourceVerification: true
      },
      multimodal: {
        enabled: true,
        supportedModalities: ['text', 'audio', 'image'],
        crossModalTranslation: true
      }
    };
  }

  /**
   * 创建Dialog策略配置
   */
  static createDialogStrategy(): DialogStrategy {
    return {
      type: 'adaptive',
      rounds: {
        min: 1,
        max: 10,
        target: 5
      },
      exitCriteria: {
        completenessThreshold: 0.8,
        userSatisfactionThreshold: 0.85,
        timeLimit: 3600
      }
    };
  }

  /**
   * 创建Dialog上下文
   */
  static createDialogContext(): DialogContext {
    return {
      sessionId: `session-${Date.now()}`,
      contextId: `context-${Date.now()}`,
      knowledgeBase: 'default-kb',
      previousDialogs: []
    };
  }

  /**
   * 创建Dialog配置
   */
  static createDialogConfiguration(): DialogConfiguration {
    return {
      timeout: 3600,
      maxParticipants: 10,
      retryPolicy: {
        maxRetries: 3,
        backoffMs: 1000
      },
      security: {
        encryption: true,
        authentication: true,
        auditLogging: true
      }
    };
  }

  /**
   * 创建审计追踪配置
   */
  static createAuditTrail(): DialogAuditTrail {
    return {
      enabled: true,
      retentionDays: 90,
      auditEvents: [],
      complianceSettings: {
        gdprEnabled: true,
        hipaaEnabled: false,
        soxEnabled: false,
        dialogAuditLevel: 'detailed',
        dialogDataLogging: true,
        contentRetentionPolicy: '90-days',
        privacyProtection: true,
        customCompliance: []
      }
    };
  }

  /**
   * 创建监控集成配置
   */
  static createMonitoringIntegration(): DialogMonitoringIntegration {
    return {
      enabled: true,
      supportedProviders: ['prometheus', 'grafana'],
      integrationEndpoints: {
        metricsApi: 'http://localhost:9090/metrics',
        dialogQualityApi: 'http://localhost:3000/quality',
        responseTimeApi: 'http://localhost:3000/response-time',
        satisfactionApi: 'http://localhost:3000/satisfaction'
      },
      dialogMetrics: {
        trackResponseTimes: true,
        trackDialogQuality: true,
        trackUserSatisfaction: true,
        trackContentModeration: true
      },
      exportFormats: ['prometheus', 'opentelemetry']
    };
  }

  /**
   * 创建性能指标配置
   */
  static createPerformanceMetrics(): DialogPerformanceMetrics {
    return {
      enabled: true,
      collectionIntervalSeconds: 60,
      metrics: {
        dialogResponseLatencyMs: 50,
        dialogCompletionRatePercent: 95,
        dialogQualityScore: 0.9,
        userExperienceSatisfactionPercent: 88,
        dialogInteractionEfficiencyScore: 0.85,
        activeDialogsCount: 10,
        dialogOperationsPerSecond: 100,
        dialogMemoryUsageMb: 256,
        averageDialogComplexityScore: 0.7
      },
      healthStatus: {
        status: 'healthy',
        lastCheck: new Date(),
        checks: [
          {
            checkName: 'response_time',
            status: 'pass',
            message: 'Response time within acceptable range',
            durationMs: 45
          }
        ]
      },
      alerting: {
        enabled: true,
        thresholds: {
          maxDialogResponseLatencyMs: 100,
          minDialogCompletionRatePercent: 90,
          minDialogQualityScore: 0.8,
          minUserExperienceSatisfactionPercent: 80,
          minDialogInteractionEfficiencyScore: 0.75
        },
        notificationChannels: ['email', 'slack']
      }
    };
  }

  /**
   * 创建版本历史配置
   */
  static createVersionHistory(): DialogVersionHistory {
    return {
      enabled: true,
      maxVersions: 10,
      versions: [],
      autoVersioning: {
        enabled: true,
        versionOnConfigChange: true,
        versionOnParticipantChange: true
      }
    };
  }

  /**
   * 创建搜索元数据配置
   */
  static createSearchMetadata(): DialogSearchMetadata {
    return {
      enabled: true,
      indexingStrategy: 'full_text',
      searchableFields: ['dialog_id', 'name', 'participants', 'messages'],
      searchIndexes: [],
      contentIndexing: {
        enabled: true,
        indexMessageContent: true,
        privacyFiltering: true,
        sensitiveDataMasking: true
      },
      autoIndexing: {
        enabled: true,
        indexNewDialogs: true,
        reindexIntervalHours: 24
      }
    };
  }

  /**
   * 创建事件集成配置
   */
  static createEventIntegration(): DialogEventIntegration {
    return {
      enabled: true,
      eventBusConnection: {
        busType: 'kafka',
        connectionString: 'localhost:9092',
        topicPrefix: 'mplp-dialog',
        consumerGroup: 'dialog-consumers'
      },
      publishedEvents: ['dialog_started', 'dialog_ended', 'message_sent'],
      subscribedEvents: ['context_updated', 'plan_executed'],
      eventRouting: {
        routingRules: []
      }
    };
  }

  /**
   * 创建Dialog详细配置
   */
  static createDialogDetails(): DialogDetails {
    return {
      dialogType: 'interactive',
      turnManagement: 'flexible',
      contextRetention: 'session'
    };
  }

  /**
   * 创建完整的Dialog实体数据
   */
  static createDialogEntityData(overrides: Partial<DialogEntity> = {}): DialogEntity {
    const defaultData: DialogEntity = {
      protocolVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      dialogId: this.generateTestId(),
      name: 'Test Dialog',
      description: 'A test dialog for unit testing',
      participants: ['user-1', 'user-2'],
      capabilities: this.createBasicCapabilities(),
      strategy: this.createDialogStrategy(),
      context: this.createDialogContext(),
      configuration: this.createDialogConfiguration(),
      metadata: { testFlag: true },
      auditTrail: this.createAuditTrail(),
      monitoringIntegration: this.createMonitoringIntegration(),
      performanceMetrics: this.createPerformanceMetrics(),
      versionHistory: this.createVersionHistory(),
      searchMetadata: this.createSearchMetadata(),
      dialogOperation: 'start',
      dialogDetails: this.createDialogDetails(),
      eventIntegration: this.createEventIntegration()
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * 创建Dialog Schema数据
   */
  static createDialogSchemaData(overrides: Partial<DialogSchema> = {}): DialogSchema {
    const entityData = this.createDialogEntityData();
    const { DialogMapper } = require('../../../src/modules/dialog/api/mappers/dialog.mapper');
    const schemaData = DialogMapper.toSchema(entityData);
    
    return { ...schemaData, ...overrides };
  }

  /**
   * 创建多个Dialog实体
   */
  static createMultipleDialogEntities(count: number, baseOverrides: Partial<DialogEntity> = {}): DialogEntity[] {
    const dialogs: DialogEntity[] = [];
    
    for (let i = 0; i < count; i++) {
      const overrides = {
        ...baseOverrides,
        dialogId: this.generateTestId(),
        name: `Test Dialog ${i + 1}`,
        participants: [`user-${i + 1}`, `user-${i + 2}`]
      };
      
      dialogs.push(this.createDialogEntityData(overrides));
    }
    
    return dialogs;
  }

  /**
   * 创建简化的Dialog实体（用于性能测试）
   */
  static createSimpleDialogEntity(overrides: Partial<DialogEntity> = {}): DialogEntity {
    const basicData: DialogEntity = {
      protocolVersion: '1.0.0',
      timestamp: new Date().toISOString(),
      dialogId: this.generateTestId(),
      name: 'Simple Dialog',
      participants: ['user-1'],
      capabilities: {
        basic: {
          enabled: true,
          messageHistory: true,
          participantManagement: true
        }
      },
      auditTrail: {
        enabled: false,
        retentionDays: 30
      },
      monitoringIntegration: {
        enabled: false,
        supportedProviders: []
      },
      performanceMetrics: {
        enabled: false,
        collectionIntervalSeconds: 300
      },
      versionHistory: {
        enabled: false,
        maxVersions: 5
      },
      searchMetadata: {
        enabled: false,
        indexingStrategy: 'keyword'
      },
      dialogOperation: 'start',
      eventIntegration: {
        enabled: false
      }
    };

    return { ...basicData, ...overrides };
  }

  /**
   * 创建无效的Dialog数据（用于验证测试）
   */
  static createInvalidDialogData(): Partial<DialogEntity> {
    return {
      dialogId: '', // 无效的ID
      name: '', // 无效的名称
      participants: [], // 无效的参与者列表
      capabilities: undefined as any // 无效的能力配置
    };
  }

  /**
   * 创建边界值测试数据
   */
  static createBoundaryTestData(): {
    maxParticipants: DialogEntity;
    maxNameLength: DialogEntity;
    minimalValid: DialogEntity;
  } {
    return {
      maxParticipants: this.createDialogEntityData({
        participants: Array.from({ length: 100 }, (_, i) => `user-${i + 1}`)
      }),
      maxNameLength: this.createDialogEntityData({
        name: 'A'.repeat(255)
      }),
      minimalValid: this.createDialogEntityData({
        name: 'A',
        participants: ['user-1'],
        description: undefined,
        strategy: undefined,
        context: undefined,
        configuration: undefined,
        metadata: undefined,
        dialogDetails: undefined
      })
    };
  }

  /**
   * 创建DialogEntity实例 - 基于实际构造函数
   */
  static createDialogEntity(overrides: Partial<DialogEntity> = {}): DialogEntity {
    const data = this.createDialogEntityData(overrides);

    return new DialogEntity(
      data.dialogId,
      data.name,
      data.participants,
      data.capabilities,
      data.auditTrail,
      data.monitoringIntegration,
      data.performanceMetrics,
      data.versionHistory,
      data.searchMetadata,
      data.dialogOperation,
      data.eventIntegration,
      data.protocolVersion,
      data.timestamp,
      data.description,
      data.strategy,
      data.context,
      data.configuration,
      data.metadata,
      data.dialogDetails
    );
  }

  /**
   * 创建Dialog消息数据
   */
  static createDialogMessage(overrides: any = {}): any {
    return {
      messageId: this.generateTestId(),
      senderId: 'user-1',
      content: 'Test message content',
      timestamp: new Date().toISOString(),
      messageType: 'text',
      ...overrides
    };
  }

  /**
   * 创建Dialog Schema数据
   */
  static createDialogSchema(overrides: Partial<DialogSchema> = {}): DialogSchema {
    const entityData = this.createDialogEntityData();

    return {
      protocol_version: entityData.protocolVersion,
      timestamp: entityData.timestamp,
      dialog_id: entityData.dialogId,
      name: entityData.name,
      description: entityData.description,
      participants: entityData.participants,
      capabilities: this.convertCapabilitiesToSchema(entityData.capabilities),
      strategy: entityData.strategy ? this.convertStrategyToSchema(entityData.strategy) : undefined,
      context: entityData.context ? this.convertContextToSchema(entityData.context) : undefined,
      configuration: entityData.configuration ? this.convertConfigurationToSchema(entityData.configuration) : undefined,
      metadata: entityData.metadata,
      audit_trail: this.convertAuditTrailToSchema(entityData.auditTrail),
      monitoring_integration: this.convertMonitoringToSchema(entityData.monitoringIntegration),
      performance_metrics: this.convertPerformanceMetricsToSchema(entityData.performanceMetrics),
      version_history: this.convertVersionHistoryToSchema(entityData.versionHistory),
      search_metadata: this.convertSearchMetadataToSchema(entityData.searchMetadata),
      dialog_operation: entityData.dialogOperation,
      dialog_details: entityData.dialogDetails ? this.convertDialogDetailsToSchema(entityData.dialogDetails) : undefined,
      event_integration: this.convertEventIntegrationToSchema(entityData.eventIntegration),
      ...overrides
    };
  }

  // Schema转换辅助方法
  private static convertCapabilitiesToSchema(capabilities: DialogCapabilities): any {
    return capabilities; // 简化实现，实际应该转换为snake_case
  }

  private static convertStrategyToSchema(strategy: DialogStrategy): any {
    return strategy; // 简化实现
  }

  private static convertContextToSchema(context: DialogContext): any {
    return context; // 简化实现
  }

  private static convertConfigurationToSchema(configuration: DialogConfiguration): any {
    return configuration; // 简化实现
  }

  private static convertAuditTrailToSchema(auditTrail: DialogAuditTrail): any {
    return auditTrail; // 简化实现
  }

  private static convertMonitoringToSchema(monitoring: DialogMonitoringIntegration): any {
    return monitoring; // 简化实现
  }

  private static convertPerformanceMetricsToSchema(metrics: DialogPerformanceMetrics): any {
    return metrics; // 简化实现
  }

  private static convertVersionHistoryToSchema(versionHistory: DialogVersionHistory): any {
    return versionHistory; // 简化实现
  }

  private static convertSearchMetadataToSchema(searchMetadata: DialogSearchMetadata): any {
    return searchMetadata; // 简化实现
  }

  private static convertDialogDetailsToSchema(dialogDetails: DialogDetails): any {
    return dialogDetails; // 简化实现
  }

  private static convertEventIntegrationToSchema(eventIntegration: DialogEventIntegration): any {
    return eventIntegration; // 简化实现
  }

  /**
   * 创建Schema相关的工厂方法
   */
  static createDialogStrategySchema(): any {
    return this.convertStrategyToSchema(this.createDialogStrategy());
  }

  static createDialogContextSchema(): any {
    return this.convertContextToSchema(this.createDialogContext());
  }

  static createDialogConfigurationSchema(): any {
    return this.convertConfigurationToSchema(this.createDialogConfiguration());
  }

  static createDialogDetailsSchema(): any {
    return this.convertDialogDetailsToSchema(this.createDialogDetails());
  }
}
