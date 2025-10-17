import { ConfirmModuleAdapter } from './infrastructure/adapters/confirm-module.adapter';
import { ConfirmController } from './api/controllers/confirm.controller';
import { ConfirmManagementService } from './application/services/confirm-management.service';
import { MemoryConfirmRepository } from './infrastructure/repositories/confirm.repository';
export interface ConfirmModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
}
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
export declare function initializeConfirmModule(options?: ConfirmModuleOptions): Promise<ConfirmModuleResult>;
export declare function quickInitializeConfirmModule(): Promise<ConfirmModuleResult>;
export declare function developmentInitializeConfirmModule(): Promise<ConfirmModuleResult>;
export declare function productionInitializeConfirmModule(): Promise<ConfirmModuleResult>;
export declare function testInitializeConfirmModule(): Promise<ConfirmModuleResult>;
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
export declare function validateConfirmModuleOptions(options: ConfirmModuleOptions): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=module.d.ts.map