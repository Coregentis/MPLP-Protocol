/**
 * Confirm模块主入口
 *
 * @description Confirm模块的统一导出入口，基于Context和Plan模块的企业级标准
 * @version 1.0.0
 * @standardized MPLP协议模块标准化规范 v1.0.0
 */
export * from './api/controllers/confirm.controller';
export * from './api/mappers/confirm.mapper';
export * from './application/services/confirm-management.service';
export * from './application/services/confirm-analytics.service';
export * from './application/services/confirm-security.service';
export * from './domain/entities/confirm.entity';
export * from './domain/repositories/confirm-repository.interface';
export * from './infrastructure/repositories/confirm.repository';
export * from './infrastructure/protocols/confirm.protocol';
export * from './infrastructure/factories/confirm-protocol.factory';
export { ConfirmModuleAdapter } from './infrastructure/adapters/confirm-module.adapter';
export * from './module';
export type { UUID, Priority, ConfirmationType, ConfirmationStatus, WorkflowType, StepStatus, DecisionOutcome, RiskLevel, ImpactLevel, BusinessImpact, TechnicalImpact, NotificationEvent, NotificationChannel, AuditEventType, HealthStatus, CheckStatus, AIProvider, AuthenticationType, FallbackBehavior, ConfirmOperation, CreateConfirmRequest, UpdateConfirmRequest } from './types';
/**
 * Confirm模块信息
 */
export declare const CONFIRM_MODULE_INFO: {
    readonly name: "confirm";
    readonly version: "1.0.0";
    readonly description: "MPLP企业级审批工作流管理模块";
    readonly layer: "L2";
    readonly status: "implementing";
    readonly features: readonly ["企业级审批工作流管理", "风险评估和合规跟踪", "多步骤审批流程", "委派和升级支持", "审计追踪和合规报告", "决策支持和AI集成", "性能监控和分析", "事件驱动架构", "横切关注点集成", "基于协议的通信"];
    readonly capabilities: readonly ["approval_workflow_management", "risk_assessment", "compliance_tracking", "audit_trail", "decision_support", "escalation_management", "notification_system", "performance_monitoring", "ai_integration"];
    readonly dependencies: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "stateSync", "transaction", "protocolVersion"];
    readonly supportedOperations: readonly ["create", "approve", "reject", "delegate", "escalate", "update", "delete", "get", "list", "query"];
    readonly crossCuttingConcerns: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "stateSync", "transaction", "protocolVersion"];
};
/**
 * Confirm模块快速启动指南
 */
export declare const CONFIRM_MODULE_QUICK_START: {
    readonly installation: {
        readonly description: "Confirm模块已集成在MPLP平台中";
        readonly usage: "import { initializeConfirmModule } from \"@mplp/confirm\";";
    };
    readonly basicUsage: {
        readonly description: "基本使用方法";
        readonly example: "\n// 1. 初始化模块\nconst confirmModule = await initializeConfirmModule();\n\n// 2. 获取控制器\nconst controller = confirmModule.confirmController;\n\n// 3. 创建审批请求\nconst result = await controller.createConfirm({\n  contextId: 'context-123',\n  confirmationType: 'approval',\n  priority: 'high',\n  requester: {\n    userId: 'user-123',\n    role: 'developer',\n    requestReason: 'Deploy to production'\n  },\n  // ... 其他配置\n});\n\n// 4. 审批请求\nawait controller.approveConfirm('confirm-123', 'approver-456', 'Approved for deployment');\n    ";
    };
    readonly advancedFeatures: {
        readonly description: "高级功能";
        readonly features: readonly ["多步骤审批工作流", "风险评估和合规检查", "委派和升级机制", "AI驱动的决策支持", "实时性能监控", "完整的审计追踪"];
    };
    readonly configuration: {
        readonly description: "配置选项";
        readonly options: {
            readonly enableLogging: "boolean - 启用日志记录";
            readonly enableCaching: "boolean - 启用缓存";
            readonly enableMetrics: "boolean - 启用性能监控";
            readonly repositoryType: "string - 存储类型 (memory|database|file)";
            readonly maxCacheSize: "number - 最大缓存大小";
            readonly cacheTimeout: "number - 缓存超时时间";
        };
    };
};
/**
 * Confirm模块架构信息
 */
export declare const CONFIRM_MODULE_ARCHITECTURE: {
    readonly pattern: "DDD (Domain-Driven Design)";
    readonly layers: {
        readonly api: {
            readonly description: "API层 - 处理HTTP请求和响应";
            readonly components: readonly ["ConfirmController", "ConfirmMapper"];
        };
        readonly application: {
            readonly description: "应用层 - 业务逻辑协调";
            readonly components: readonly ["ConfirmManagementService"];
        };
        readonly domain: {
            readonly description: "领域层 - 核心业务逻辑";
            readonly components: readonly ["ConfirmEntity", "IConfirmRepository"];
        };
        readonly infrastructure: {
            readonly description: "基础设施层 - 技术实现";
            readonly components: readonly ["ConfirmRepository", "ConfirmProtocol", "ConfirmModuleAdapter"];
        };
    };
    readonly crossCuttingConcerns: {
        readonly description: "横切关注点 - L3管理器集成";
        readonly managers: readonly ["MLPPSecurityManager", "MLPPPerformanceMonitor", "MLPPEventBusManager", "MLPPErrorHandler", "MLPPCoordinationManager", "MLPPOrchestrationManager", "MLPPStateSyncManager", "MLPPTransactionManager", "MLPPProtocolVersionManager"];
    };
    readonly protocols: {
        readonly description: "MPLP协议集成";
        readonly interfaces: readonly ["IMLPPProtocol"];
        readonly standards: readonly ["MLPPRequest", "MLPPResponse", "ProtocolMetadata", "HealthStatus"];
    };
};
/**
 * 获取Confirm模块完整信息
 */
export declare function getConfirmModuleFullInfo(): {
    info: {
        readonly name: "confirm";
        readonly version: "1.0.0";
        readonly description: "MPLP企业级审批工作流管理模块";
        readonly layer: "L2";
        readonly status: "implementing";
        readonly features: readonly ["企业级审批工作流管理", "风险评估和合规跟踪", "多步骤审批流程", "委派和升级支持", "审计追踪和合规报告", "决策支持和AI集成", "性能监控和分析", "事件驱动架构", "横切关注点集成", "基于协议的通信"];
        readonly capabilities: readonly ["approval_workflow_management", "risk_assessment", "compliance_tracking", "audit_trail", "decision_support", "escalation_management", "notification_system", "performance_monitoring", "ai_integration"];
        readonly dependencies: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "stateSync", "transaction", "protocolVersion"];
        readonly supportedOperations: readonly ["create", "approve", "reject", "delegate", "escalate", "update", "delete", "get", "list", "query"];
        readonly crossCuttingConcerns: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "stateSync", "transaction", "protocolVersion"];
    };
    quickStart: {
        readonly installation: {
            readonly description: "Confirm模块已集成在MPLP平台中";
            readonly usage: "import { initializeConfirmModule } from \"@mplp/confirm\";";
        };
        readonly basicUsage: {
            readonly description: "基本使用方法";
            readonly example: "\n// 1. 初始化模块\nconst confirmModule = await initializeConfirmModule();\n\n// 2. 获取控制器\nconst controller = confirmModule.confirmController;\n\n// 3. 创建审批请求\nconst result = await controller.createConfirm({\n  contextId: 'context-123',\n  confirmationType: 'approval',\n  priority: 'high',\n  requester: {\n    userId: 'user-123',\n    role: 'developer',\n    requestReason: 'Deploy to production'\n  },\n  // ... 其他配置\n});\n\n// 4. 审批请求\nawait controller.approveConfirm('confirm-123', 'approver-456', 'Approved for deployment');\n    ";
        };
        readonly advancedFeatures: {
            readonly description: "高级功能";
            readonly features: readonly ["多步骤审批工作流", "风险评估和合规检查", "委派和升级机制", "AI驱动的决策支持", "实时性能监控", "完整的审计追踪"];
        };
        readonly configuration: {
            readonly description: "配置选项";
            readonly options: {
                readonly enableLogging: "boolean - 启用日志记录";
                readonly enableCaching: "boolean - 启用缓存";
                readonly enableMetrics: "boolean - 启用性能监控";
                readonly repositoryType: "string - 存储类型 (memory|database|file)";
                readonly maxCacheSize: "number - 最大缓存大小";
                readonly cacheTimeout: "number - 缓存超时时间";
            };
        };
    };
    architecture: {
        readonly pattern: "DDD (Domain-Driven Design)";
        readonly layers: {
            readonly api: {
                readonly description: "API层 - 处理HTTP请求和响应";
                readonly components: readonly ["ConfirmController", "ConfirmMapper"];
            };
            readonly application: {
                readonly description: "应用层 - 业务逻辑协调";
                readonly components: readonly ["ConfirmManagementService"];
            };
            readonly domain: {
                readonly description: "领域层 - 核心业务逻辑";
                readonly components: readonly ["ConfirmEntity", "IConfirmRepository"];
            };
            readonly infrastructure: {
                readonly description: "基础设施层 - 技术实现";
                readonly components: readonly ["ConfirmRepository", "ConfirmProtocol", "ConfirmModuleAdapter"];
            };
        };
        readonly crossCuttingConcerns: {
            readonly description: "横切关注点 - L3管理器集成";
            readonly managers: readonly ["MLPPSecurityManager", "MLPPPerformanceMonitor", "MLPPEventBusManager", "MLPPErrorHandler", "MLPPCoordinationManager", "MLPPOrchestrationManager", "MLPPStateSyncManager", "MLPPTransactionManager", "MLPPProtocolVersionManager"];
        };
        readonly protocols: {
            readonly description: "MPLP协议集成";
            readonly interfaces: readonly ["IMLPPProtocol"];
            readonly standards: readonly ["MLPPRequest", "MLPPResponse", "ProtocolMetadata", "HealthStatus"];
        };
    };
};
/**
 * Confirm模块版本兼容性
 */
export declare const CONFIRM_MODULE_COMPATIBILITY: {
    readonly mplpVersion: "1.0.0";
    readonly nodeVersion: ">=16.0.0";
    readonly typescriptVersion: ">=5.0.0";
    readonly dependencies: {
        readonly required: readonly ["@mplp/core", "@mplp/shared"];
        readonly optional: readonly ["@mplp/context", "@mplp/plan"];
    };
};
//# sourceMappingURL=index.d.ts.map