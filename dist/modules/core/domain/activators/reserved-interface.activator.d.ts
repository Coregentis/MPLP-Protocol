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
export declare class ReservedInterfaceActivator {
    private readonly orchestrationService;
    private static readonly MODULE_INTERFACE_MAPPINGS;
    constructor(orchestrationService: CoreOrchestrationService);
    activateContextInterfaces(contextId: string, userId?: string): Promise<ActivationResult[]>;
    activatePlanInterfaces(planId: string, aiServiceEndpoint?: string): Promise<ActivationResult[]>;
    activateRoleInterfaces(userId: string, roleId: string, securityLevel?: string): Promise<ActivationResult[]>;
    activateConfirmInterfaces(approvalId: string, approvers: string[]): Promise<ActivationResult[]>;
    activateTraceInterfaces(executionId: string, monitoringLevel?: string): Promise<ActivationResult[]>;
    activateExtensionInterfaces(extensionId: string): Promise<ActivationResult[]>;
    activateDialogInterfaces(conversationId: string, contextData: Record<string, unknown>): Promise<ActivationResult[]>;
    activateCollabInterfaces(collaborationId: string, participants: string[]): Promise<ActivationResult[]>;
    activateNetworkInterfaces(networkId: string, topologyData: Record<string, unknown>): Promise<ActivationResult[]>;
    activateAllModuleInterfaces(activationContext: {
        contextId: string;
        userId: string;
        planId: string;
        roleId: string;
        executionId: string;
        [key: string]: string;
    }): Promise<Record<string, ActivationResult[]>>;
    activateModuleInterfaces(moduleId: string): Promise<{
        success: boolean;
        moduleId: string;
        activatedInterfaces: number;
        results: ActivationResult[];
    }>;
    getModuleInterfaceDefinitions(moduleId?: string): ModuleInterfaceMapping[];
    validateActivationParameters(moduleId: string, interfaceId: string, parameters: Record<string, unknown>): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=reserved-interface.activator.d.ts.map