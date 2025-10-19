/**
 * 预留接口激活器
 * 负责激活其他模块中以下划线前缀标记的预留接口
 * 实现CoreOrchestrator的预留接口激活功能
 */
import { CoreOrchestrationService } from '../../application/services/core-orchestration.service';
export interface InterfaceActivationData {
    parameters: Record<string, unknown>;
    configuration?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export interface ActivationResult {
    success: boolean;
    interfaceId: string;
    activatedAt: string;
    result?: Record<string, unknown>;
    error?: string;
}
export interface ModuleInterfaceMapping {
    moduleId: string;
    interfaces: InterfaceDefinition[];
}
export interface InterfaceDefinition {
    interfaceId: string;
    name: string;
    description: string;
    parameters: ParameterDefinition[];
    activationType: 'sync' | 'async' | 'event_driven';
}
export interface ParameterDefinition {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    description: string;
    defaultValue?: unknown;
}
/**
 * 预留接口激活器类
 * 实现MPLP生态系统中9个模块的预留接口激活
 */
export declare class ReservedInterfaceActivator {
    private readonly orchestrationService;
    private static readonly MODULE_INTERFACE_MAPPINGS;
    constructor(orchestrationService: CoreOrchestrationService);
    /**
     * 激活Context模块预留接口
     */
    activateContextInterfaces(contextId: string, userId?: string): Promise<ActivationResult[]>;
    /**
     * 激活Plan模块预留接口
     */
    activatePlanInterfaces(planId: string, aiServiceEndpoint?: string): Promise<ActivationResult[]>;
    /**
     * 激活Role模块预留接口
     */
    activateRoleInterfaces(userId: string, roleId: string, securityLevel?: string): Promise<ActivationResult[]>;
    /**
     * 激活Confirm模块预留接口
     */
    activateConfirmInterfaces(approvalId: string, approvers: string[]): Promise<ActivationResult[]>;
    /**
     * 激活Trace模块预留接口
     */
    activateTraceInterfaces(executionId: string, monitoringLevel?: string): Promise<ActivationResult[]>;
    /**
     * 激活Extension模块预留接口
     */
    activateExtensionInterfaces(extensionId: string): Promise<ActivationResult[]>;
    /**
     * 激活Dialog模块预留接口
     */
    activateDialogInterfaces(conversationId: string, contextData: Record<string, unknown>): Promise<ActivationResult[]>;
    /**
     * 激活Collab模块预留接口
     */
    activateCollabInterfaces(collaborationId: string, participants: string[]): Promise<ActivationResult[]>;
    /**
     * 激活Network模块预留接口
     */
    activateNetworkInterfaces(networkId: string, topologyData: Record<string, unknown>): Promise<ActivationResult[]>;
    /**
     * 批量激活所有模块的预留接口
     */
    activateAllModuleInterfaces(activationContext: {
        contextId: string;
        userId: string;
        planId: string;
        roleId: string;
        executionId: string;
        [key: string]: string;
    }): Promise<Record<string, ActivationResult[]>>;
    /**
     * 激活指定模块的所有预留接口
     * 这是测试中使用的统一接口方法
     */
    activateModuleInterfaces(moduleId: string): Promise<{
        success: boolean;
        moduleId: string;
        activatedInterfaces: number;
        results: ActivationResult[];
    }>;
    /**
     * 获取模块接口定义
     */
    getModuleInterfaceDefinitions(moduleId?: string): ModuleInterfaceMapping[];
    /**
     * 验证接口激活参数
     */
    validateActivationParameters(moduleId: string, interfaceId: string, parameters: Record<string, unknown>): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=reserved-interface.activator.d.ts.map