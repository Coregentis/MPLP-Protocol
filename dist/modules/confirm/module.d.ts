/**
 * Confirm模块初始化
 *
 * @description Confirm模块的统一初始化和配置管理，基于Context和Plan模块的企业级标准
 * @version 1.0.0
 * @layer 模块层 - 初始化
 */
import { ConfirmModuleAdapter } from './infrastructure/adapters/confirm-module.adapter';
import { ConfirmController } from './api/controllers/confirm.controller';
import { ConfirmManagementService } from './application/services/confirm-management.service';
import { MemoryConfirmRepository } from './infrastructure/repositories/confirm.repository';
/**
 * Confirm模块选项
 */
export interface ConfirmModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
}
/**
 * Confirm模块初始化结果
 */
export interface ConfirmModuleResult {
    confirmController: ConfirmController;
    confirmManagementService: ConfirmManagementService;
    confirmRepository: MemoryConfirmRepository;
    confirmModuleAdapter: ConfirmModuleAdapter;
    healthCheck: () => Promise<{
        status: 'healthy' | 'unhealthy';
        details: Record<string, unknown>;
    }>;
    shutdown: () => Promise<void>;
    getStatistics: () => Record<string, unknown>;
}
/**
 * 初始化Confirm模块
 *
 * @description 创建和配置Confirm模块的所有组件，基于Context和Plan模块的企业级标准
 * @param options - 模块配置选项
 * @returns Promise<ConfirmModuleResult> - 初始化结果
 */
export declare function initializeConfirmModule(options?: ConfirmModuleOptions): Promise<ConfirmModuleResult>;
/**
 * 快速初始化Confirm模块（使用默认配置）
 *
 * @description 使用默认配置快速初始化Confirm模块
 * @returns Promise<ConfirmModuleResult> - 初始化结果
 */
export declare function quickInitializeConfirmModule(): Promise<ConfirmModuleResult>;
/**
 * 开发环境初始化Confirm模块
 *
 * @description 使用开发环境配置初始化Confirm模块
 * @returns Promise<ConfirmModuleResult> - 初始化结果
 */
export declare function developmentInitializeConfirmModule(): Promise<ConfirmModuleResult>;
/**
 * 生产环境初始化Confirm模块
 *
 * @description 使用生产环境配置初始化Confirm模块
 * @returns Promise<ConfirmModuleResult> - 初始化结果
 */
export declare function productionInitializeConfirmModule(): Promise<ConfirmModuleResult>;
/**
 * 测试环境初始化Confirm模块
 *
 * @description 使用测试环境配置初始化Confirm模块
 * @returns Promise<ConfirmModuleResult> - 初始化结果
 */
export declare function testInitializeConfirmModule(): Promise<ConfirmModuleResult>;
/**
 * Confirm模块版本信息
 */
export declare const ConfirmModuleInfo: {
    readonly name: "Confirm";
    readonly version: "1.0.0";
    readonly description: "MPLP Confirm Module - Multi-Agent Protocol Lifecycle Platform Approval Workflow Management";
    readonly author: "MPLP Team";
    readonly license: "MIT";
    readonly dependencies: {
        readonly typescript: "^5.0.0";
    };
    readonly features: readonly ["Enterprise approval workflow management", "Risk assessment and compliance tracking", "Multi-step approval processes", "Delegation and escalation support", "Audit trail and compliance reporting", "Decision support and AI integration", "Performance monitoring and analytics", "Event-driven architecture", "Cross-cutting concerns integration", "Protocol-based communication"];
    readonly capabilities: readonly ["approval_workflow_management", "risk_assessment", "compliance_tracking", "audit_trail", "decision_support", "escalation_management", "notification_system", "performance_monitoring", "ai_integration"];
    readonly supportedOperations: readonly ["create", "approve", "reject", "delegate", "escalate", "update", "delete", "get", "list", "query"];
    readonly crossCuttingConcerns: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "stateSync", "transaction", "protocolVersion"];
};
/**
 * 获取Confirm模块信息
 *
 * @returns Confirm模块的详细信息
 */
export declare function getConfirmModuleInfo(): {
    readonly name: "Confirm";
    readonly version: "1.0.0";
    readonly description: "MPLP Confirm Module - Multi-Agent Protocol Lifecycle Platform Approval Workflow Management";
    readonly author: "MPLP Team";
    readonly license: "MIT";
    readonly dependencies: {
        readonly typescript: "^5.0.0";
    };
    readonly features: readonly ["Enterprise approval workflow management", "Risk assessment and compliance tracking", "Multi-step approval processes", "Delegation and escalation support", "Audit trail and compliance reporting", "Decision support and AI integration", "Performance monitoring and analytics", "Event-driven architecture", "Cross-cutting concerns integration", "Protocol-based communication"];
    readonly capabilities: readonly ["approval_workflow_management", "risk_assessment", "compliance_tracking", "audit_trail", "decision_support", "escalation_management", "notification_system", "performance_monitoring", "ai_integration"];
    readonly supportedOperations: readonly ["create", "approve", "reject", "delegate", "escalate", "update", "delete", "get", "list", "query"];
    readonly crossCuttingConcerns: readonly ["security", "performance", "eventBus", "errorHandler", "coordination", "orchestration", "stateSync", "transaction", "protocolVersion"];
};
/**
 * 验证Confirm模块配置
 *
 * @param options - 模块配置选项
 * @returns 配置验证结果
 */
export declare function validateConfirmModuleOptions(options: ConfirmModuleOptions): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=module.d.ts.map