/**
 * Confirm模块主入口
 * 
 * @description Confirm模块的统一导出入口，基于Context和Plan模块的企业级标准
 * @version 1.0.0
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */

// ===== DDD架构层导出 ===== (MANDATORY SECTION)

// API层 (MANDATORY)
export * from './api/controllers/confirm.controller';
export * from './api/mappers/confirm.mapper';

// 应用层 (MANDATORY)
export * from './application/services/confirm-management.service';
export * from './application/services/confirm-analytics.service';
export * from './application/services/confirm-security.service';

// 领域层 (MANDATORY)
export * from './domain/entities/confirm.entity';
export * from './domain/repositories/confirm-repository.interface';

// 基础设施层 (MANDATORY)
export * from './infrastructure/repositories/confirm.repository';
export * from './infrastructure/protocols/confirm.protocol';
export * from './infrastructure/factories/confirm-protocol.factory';

// ===== 适配器导出 ===== (MANDATORY SECTION)
export { ConfirmModuleAdapter } from './infrastructure/adapters/confirm-module.adapter';

// ===== 模块集成 ===== (MANDATORY SECTION)
export * from './module';

// ===== 类型定义导出 ===== (MANDATORY SECTION)
export type {
  UUID,
  Priority,
  ConfirmationType,
  ConfirmationStatus,
  WorkflowType,
  StepStatus,
  DecisionOutcome,
  RiskLevel,
  ImpactLevel,
  BusinessImpact,
  TechnicalImpact,
  NotificationEvent,
  NotificationChannel,
  AuditEventType,
  HealthStatus,
  CheckStatus,
  AIProvider,
  AuthenticationType,
  FallbackBehavior,
  ConfirmOperation,
  CreateConfirmRequest,
  UpdateConfirmRequest
} from './types';

/**
 * Confirm模块信息
 */
export const CONFIRM_MODULE_INFO = {
  name: 'confirm',
  version: '1.0.0',
  description: 'MPLP企业级审批工作流管理模块',
  layer: 'L2',
  status: 'implementing',
  features: [
    '企业级审批工作流管理',
    '风险评估和合规跟踪',
    '多步骤审批流程',
    '委派和升级支持',
    '审计追踪和合规报告',
    '决策支持和AI集成',
    '性能监控和分析',
    '事件驱动架构',
    '横切关注点集成',
    '基于协议的通信'
  ],
  capabilities: [
    'approval_workflow_management',
    'risk_assessment',
    'compliance_tracking',
    'audit_trail',
    'decision_support',
    'escalation_management',
    'notification_system',
    'performance_monitoring',
    'ai_integration'
  ],
  dependencies: [
    'security',
    'performance', 
    'eventBus',
    'errorHandler',
    'coordination',
    'orchestration',
    'stateSync',
    'transaction',
    'protocolVersion'
  ],
  supportedOperations: [
    'create',
    'approve',
    'reject',
    'delegate',
    'escalate',
    'update',
    'delete',
    'get',
    'list',
    'query'
  ],
  crossCuttingConcerns: [
    'security',
    'performance',
    'eventBus',
    'errorHandler',
    'coordination',
    'orchestration',
    'stateSync',
    'transaction',
    'protocolVersion'
  ]
} as const;

/**
 * Confirm模块快速启动指南
 */
export const CONFIRM_MODULE_QUICK_START = {
  installation: {
    description: 'Confirm模块已集成在MPLP平台中',
    usage: 'import { initializeConfirmModule } from "@mplp/confirm";'
  },
  basicUsage: {
    description: '基本使用方法',
    example: `
// 1. 初始化模块
const confirmModule = await initializeConfirmModule();

// 2. 获取控制器
const controller = confirmModule.confirmController;

// 3. 创建审批请求
const result = await controller.createConfirm({
  contextId: 'context-123',
  confirmationType: 'approval',
  priority: 'high',
  requester: {
    userId: 'user-123',
    role: 'developer',
    requestReason: 'Deploy to production'
  },
  // ... 其他配置
});

// 4. 审批请求
await controller.approveConfirm('confirm-123', 'approver-456', 'Approved for deployment');
    `
  },
  advancedFeatures: {
    description: '高级功能',
    features: [
      '多步骤审批工作流',
      '风险评估和合规检查',
      '委派和升级机制',
      'AI驱动的决策支持',
      '实时性能监控',
      '完整的审计追踪'
    ]
  },
  configuration: {
    description: '配置选项',
    options: {
      enableLogging: 'boolean - 启用日志记录',
      enableCaching: 'boolean - 启用缓存',
      enableMetrics: 'boolean - 启用性能监控',
      repositoryType: 'string - 存储类型 (memory|database|file)',
      maxCacheSize: 'number - 最大缓存大小',
      cacheTimeout: 'number - 缓存超时时间'
    }
  }
} as const;

/**
 * Confirm模块架构信息
 */
export const CONFIRM_MODULE_ARCHITECTURE = {
  pattern: 'DDD (Domain-Driven Design)',
  layers: {
    api: {
      description: 'API层 - 处理HTTP请求和响应',
      components: ['ConfirmController', 'ConfirmMapper']
    },
    application: {
      description: '应用层 - 业务逻辑协调',
      components: ['ConfirmManagementService']
    },
    domain: {
      description: '领域层 - 核心业务逻辑',
      components: ['ConfirmEntity', 'IConfirmRepository']
    },
    infrastructure: {
      description: '基础设施层 - 技术实现',
      components: ['ConfirmRepository', 'ConfirmProtocol', 'ConfirmModuleAdapter']
    }
  },
  crossCuttingConcerns: {
    description: '横切关注点 - L3管理器集成',
    managers: [
      'MLPPSecurityManager',
      'MLPPPerformanceMonitor',
      'MLPPEventBusManager',
      'MLPPErrorHandler',
      'MLPPCoordinationManager',
      'MLPPOrchestrationManager',
      'MLPPStateSyncManager',
      'MLPPTransactionManager',
      'MLPPProtocolVersionManager'
    ]
  },
  protocols: {
    description: 'MPLP协议集成',
    interfaces: ['IMLPPProtocol'],
    standards: ['MLPPRequest', 'MLPPResponse', 'ProtocolMetadata', 'HealthStatus']
  }
} as const;

/**
 * 获取Confirm模块完整信息
 */
export function getConfirmModuleFullInfo() {
  return {
    info: CONFIRM_MODULE_INFO,
    quickStart: CONFIRM_MODULE_QUICK_START,
    architecture: CONFIRM_MODULE_ARCHITECTURE
  };
}

/**
 * Confirm模块版本兼容性
 */
export const CONFIRM_MODULE_COMPATIBILITY = {
  mplpVersion: '1.0.0',
  nodeVersion: '>=16.0.0',
  typescriptVersion: '>=5.0.0',
  dependencies: {
    required: [
      '@mplp/core',
      '@mplp/shared'
    ],
    optional: [
      '@mplp/context',
      '@mplp/plan'
    ]
  }
} as const;
