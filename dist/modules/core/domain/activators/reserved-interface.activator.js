"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservedInterfaceActivator = void 0;
class ReservedInterfaceActivator {
    orchestrationService;
    static MODULE_INTERFACE_MAPPINGS = [
        {
            moduleId: 'context',
            interfaces: [
                {
                    interfaceId: 'user_context_sync',
                    name: 'User Context Synchronization',
                    description: '用户上下文同步接口',
                    parameters: [
                        { name: 'userId', type: 'string', required: true, description: '用户ID' },
                        { name: 'contextId', type: 'string', required: true, description: '上下文ID' },
                        { name: 'metadata', type: 'object', required: false, description: '元数据' }
                    ],
                    activationType: 'sync'
                },
                {
                    interfaceId: 'context_state_management',
                    name: 'Context State Management',
                    description: '上下文状态管理接口',
                    parameters: [
                        { name: 'stateId', type: 'string', required: true, description: '状态ID' },
                        { name: 'stateData', type: 'object', required: true, description: '状态数据' }
                    ],
                    activationType: 'async'
                }
            ]
        },
        {
            moduleId: 'plan',
            interfaces: [
                {
                    interfaceId: 'ai_service_integration',
                    name: 'AI Service Integration',
                    description: 'AI服务集成接口',
                    parameters: [
                        { name: 'planId', type: 'string', required: true, description: '计划ID' },
                        { name: 'aiServiceEndpoint', type: 'string', required: true, description: 'AI服务端点' },
                        { name: 'apiKey', type: 'string', required: false, description: 'API密钥' }
                    ],
                    activationType: 'async'
                },
                {
                    interfaceId: 'dynamic_planning',
                    name: 'Dynamic Planning',
                    description: '动态规划接口',
                    parameters: [
                        { name: 'planningContext', type: 'object', required: true, description: '规划上下文' },
                        { name: 'constraints', type: 'array', required: false, description: '约束条件' }
                    ],
                    activationType: 'sync'
                }
            ]
        },
        {
            moduleId: 'role',
            interfaces: [
                {
                    interfaceId: 'permission_validation',
                    name: 'Permission Validation',
                    description: '权限验证接口',
                    parameters: [
                        { name: 'userId', type: 'string', required: true, description: '用户ID' },
                        { name: 'roleId', type: 'string', required: true, description: '角色ID' },
                        { name: 'securityLevel', type: 'string', required: false, description: '安全级别', defaultValue: 'standard' }
                    ],
                    activationType: 'sync'
                },
                {
                    interfaceId: 'dynamic_role_assignment',
                    name: 'Dynamic Role Assignment',
                    description: '动态角色分配接口',
                    parameters: [
                        { name: 'assignmentContext', type: 'object', required: true, description: '分配上下文' },
                        { name: 'roleHierarchy', type: 'object', required: false, description: '角色层次结构' }
                    ],
                    activationType: 'async'
                }
            ]
        },
        {
            moduleId: 'confirm',
            interfaces: [
                {
                    interfaceId: 'approval_workflow_integration',
                    name: 'Approval Workflow Integration',
                    description: '审批工作流集成接口',
                    parameters: [
                        { name: 'approvalId', type: 'string', required: true, description: '审批ID' },
                        { name: 'workflowConfig', type: 'object', required: true, description: '工作流配置' },
                        { name: 'approvers', type: 'array', required: true, description: '审批人列表' }
                    ],
                    activationType: 'async'
                }
            ]
        },
        {
            moduleId: 'trace',
            interfaces: [
                {
                    interfaceId: 'execution_monitoring',
                    name: 'Execution Monitoring',
                    description: '执行监控接口',
                    parameters: [
                        { name: 'executionId', type: 'string', required: true, description: '执行ID' },
                        { name: 'monitoringLevel', type: 'string', required: false, description: '监控级别', defaultValue: 'standard' }
                    ],
                    activationType: 'event_driven'
                }
            ]
        },
        {
            moduleId: 'extension',
            interfaces: [
                {
                    interfaceId: 'dynamic_extension_loading',
                    name: 'Dynamic Extension Loading',
                    description: '动态扩展加载接口',
                    parameters: [
                        { name: 'extensionId', type: 'string', required: true, description: '扩展ID' },
                        { name: 'loadingContext', type: 'object', required: true, description: '加载上下文' }
                    ],
                    activationType: 'async'
                }
            ]
        },
        {
            moduleId: 'dialog',
            interfaces: [
                {
                    interfaceId: 'conversation_context_sync',
                    name: 'Conversation Context Sync',
                    description: '对话上下文同步接口',
                    parameters: [
                        { name: 'conversationId', type: 'string', required: true, description: '对话ID' },
                        { name: 'contextData', type: 'object', required: true, description: '上下文数据' }
                    ],
                    activationType: 'sync'
                }
            ]
        },
        {
            moduleId: 'collab',
            interfaces: [
                {
                    interfaceId: 'collaboration_coordination',
                    name: 'Collaboration Coordination',
                    description: '协作协调接口',
                    parameters: [
                        { name: 'collaborationId', type: 'string', required: true, description: '协作ID' },
                        { name: 'participants', type: 'array', required: true, description: '参与者列表' }
                    ],
                    activationType: 'async'
                }
            ]
        },
        {
            moduleId: 'network',
            interfaces: [
                {
                    interfaceId: 'network_topology_sync',
                    name: 'Network Topology Sync',
                    description: '网络拓扑同步接口',
                    parameters: [
                        { name: 'networkId', type: 'string', required: true, description: '网络ID' },
                        { name: 'topologyData', type: 'object', required: true, description: '拓扑数据' }
                    ],
                    activationType: 'event_driven'
                }
            ]
        }
    ];
    constructor(orchestrationService) {
        this.orchestrationService = orchestrationService;
    }
    async activateContextInterfaces(contextId, userId) {
        const results = [];
        const userContextResult = await this.orchestrationService.activateReservedInterface('context', 'user_context_sync', {
            parameters: {
                contextId,
                userId: userId || contextId.split('-')[1] || 'default-user',
                metadata: {
                    activatedBy: 'CoreOrchestrator',
                    activationTime: new Date().toISOString()
                }
            }
        });
        results.push(userContextResult);
        const stateManagementResult = await this.orchestrationService.activateReservedInterface('context', 'context_state_management', {
            parameters: {
                stateId: `state-${contextId}`,
                stateData: {
                    contextId,
                    status: 'active',
                    lastUpdated: new Date().toISOString()
                }
            }
        });
        results.push(stateManagementResult);
        return results;
    }
    async activatePlanInterfaces(planId, aiServiceEndpoint) {
        const results = [];
        const aiIntegrationResult = await this.orchestrationService.activateReservedInterface('plan', 'ai_service_integration', {
            parameters: {
                planId,
                aiServiceEndpoint: aiServiceEndpoint || process.env.AI_SERVICE_URL || 'http://localhost:8080/ai',
                apiKey: process.env.AI_API_KEY
            },
            configuration: {
                timeout: 30000,
                retryAttempts: 3
            }
        });
        results.push(aiIntegrationResult);
        const dynamicPlanningResult = await this.orchestrationService.activateReservedInterface('plan', 'dynamic_planning', {
            parameters: {
                planningContext: {
                    planId,
                    planningMode: 'adaptive',
                    optimizationLevel: 'high'
                },
                constraints: [
                    { type: 'time', value: 300000 },
                    { type: 'resources', value: 'medium' }
                ]
            }
        });
        results.push(dynamicPlanningResult);
        return results;
    }
    async activateRoleInterfaces(userId, roleId, securityLevel) {
        const results = [];
        const permissionResult = await this.orchestrationService.activateReservedInterface('role', 'permission_validation', {
            parameters: {
                userId,
                roleId,
                securityLevel: securityLevel || 'enterprise'
            },
            configuration: {
                validationMode: 'strict',
                cacheResults: true
            }
        });
        results.push(permissionResult);
        const roleAssignmentResult = await this.orchestrationService.activateReservedInterface('role', 'dynamic_role_assignment', {
            parameters: {
                assignmentContext: {
                    userId,
                    roleId,
                    assignmentType: 'temporary',
                    duration: 3600000
                },
                roleHierarchy: {
                    parentRole: 'user',
                    childRoles: [roleId]
                }
            }
        });
        results.push(roleAssignmentResult);
        return results;
    }
    async activateConfirmInterfaces(approvalId, approvers) {
        const results = [];
        const approvalResult = await this.orchestrationService.activateReservedInterface('confirm', 'approval_workflow_integration', {
            parameters: {
                approvalId,
                workflowConfig: {
                    approvalType: 'sequential',
                    timeout: 86400000,
                    escalationRules: true
                },
                approvers
            },
            configuration: {
                notificationEnabled: true,
                reminderInterval: 3600000
            }
        });
        results.push(approvalResult);
        return results;
    }
    async activateTraceInterfaces(executionId, monitoringLevel) {
        const results = [];
        const monitoringResult = await this.orchestrationService.activateReservedInterface('trace', 'execution_monitoring', {
            parameters: {
                executionId,
                monitoringLevel: monitoringLevel || 'detailed'
            },
            configuration: {
                realTimeMonitoring: true,
                alertThresholds: {
                    executionTime: 300000,
                    errorRate: 0.05
                }
            }
        });
        results.push(monitoringResult);
        return results;
    }
    async activateExtensionInterfaces(extensionId) {
        const results = [];
        const extensionResult = await this.orchestrationService.activateReservedInterface('extension', 'dynamic_extension_loading', {
            parameters: {
                extensionId,
                loadingContext: {
                    loadingMode: 'lazy',
                    dependencies: [],
                    securityLevel: 'standard'
                }
            }
        });
        results.push(extensionResult);
        return results;
    }
    async activateDialogInterfaces(conversationId, contextData) {
        const results = [];
        const dialogResult = await this.orchestrationService.activateReservedInterface('dialog', 'conversation_context_sync', {
            parameters: {
                conversationId,
                contextData
            }
        });
        results.push(dialogResult);
        return results;
    }
    async activateCollabInterfaces(collaborationId, participants) {
        const results = [];
        const collabResult = await this.orchestrationService.activateReservedInterface('collab', 'collaboration_coordination', {
            parameters: {
                collaborationId,
                participants
            },
            configuration: {
                coordinationMode: 'real_time',
                conflictResolution: 'automatic'
            }
        });
        results.push(collabResult);
        return results;
    }
    async activateNetworkInterfaces(networkId, topologyData) {
        const results = [];
        const networkResult = await this.orchestrationService.activateReservedInterface('network', 'network_topology_sync', {
            parameters: {
                networkId,
                topologyData
            }
        });
        results.push(networkResult);
        return results;
    }
    async activateAllModuleInterfaces(activationContext) {
        const results = {};
        try {
            const [contextResults, planResults, roleResults, confirmResults, traceResults, extensionResults, dialogResults, collabResults, networkResults] = await Promise.all([
                this.activateContextInterfaces(activationContext.contextId, activationContext.userId),
                this.activatePlanInterfaces(activationContext.planId),
                this.activateRoleInterfaces(activationContext.userId, activationContext.roleId),
                this.activateConfirmInterfaces(`approval-${activationContext.executionId}`, [activationContext.userId]),
                this.activateTraceInterfaces(activationContext.executionId),
                this.activateExtensionInterfaces(`ext-${activationContext.executionId}`),
                this.activateDialogInterfaces(`dialog-${activationContext.executionId}`, { userId: activationContext.userId }),
                this.activateCollabInterfaces(`collab-${activationContext.executionId}`, [activationContext.userId]),
                this.activateNetworkInterfaces(`network-${activationContext.executionId}`, { nodeId: 'primary' })
            ]);
            results.context = contextResults;
            results.plan = planResults;
            results.role = roleResults;
            results.confirm = confirmResults;
            results.trace = traceResults;
            results.extension = extensionResults;
            results.dialog = dialogResults;
            results.collab = collabResults;
            results.network = networkResults;
            return results;
        }
        catch (error) {
            throw new Error(`Failed to activate module interfaces: ${error.message}`);
        }
    }
    async activateModuleInterfaces(moduleId) {
        let results = [];
        switch (moduleId) {
            case 'context':
                results = await this.activateContextInterfaces(`ctx-${Date.now()}`, `user-${Date.now()}`);
                break;
            case 'plan':
                results = await this.activatePlanInterfaces(`plan-${Date.now()}`);
                break;
            case 'role':
                results = await this.activateRoleInterfaces(`user-${Date.now()}`, `role-${Date.now()}`);
                break;
            case 'confirm':
                results = await this.activateConfirmInterfaces(`approval-${Date.now()}`, [`user-${Date.now()}`]);
                break;
            case 'trace':
                results = await this.activateTraceInterfaces(`exec-${Date.now()}`);
                break;
            case 'extension':
                results = await this.activateExtensionInterfaces(`ext-${Date.now()}`);
                break;
            case 'dialog':
                results = await this.activateDialogInterfaces(`dialog-${Date.now()}`, { test: true });
                break;
            case 'collab':
                results = await this.activateCollabInterfaces(`collab-${Date.now()}`, [`user-${Date.now()}`]);
                break;
            case 'network':
                results = await this.activateNetworkInterfaces(`network-${Date.now()}`, { nodeId: 'test' });
                break;
            default:
                throw new Error(`Module not found: ${moduleId}`);
        }
        return {
            success: true,
            moduleId,
            activatedInterfaces: results.length,
            results
        };
    }
    getModuleInterfaceDefinitions(moduleId) {
        if (moduleId) {
            return ReservedInterfaceActivator.MODULE_INTERFACE_MAPPINGS.filter(mapping => mapping.moduleId === moduleId);
        }
        return ReservedInterfaceActivator.MODULE_INTERFACE_MAPPINGS;
    }
    validateActivationParameters(moduleId, interfaceId, parameters) {
        const errors = [];
        const moduleMapping = ReservedInterfaceActivator.MODULE_INTERFACE_MAPPINGS.find(m => m.moduleId === moduleId);
        if (!moduleMapping) {
            errors.push(`Unknown module: ${moduleId}`);
            return { isValid: false, errors };
        }
        const interfaceDefinition = moduleMapping.interfaces.find(i => i.interfaceId === interfaceId);
        if (!interfaceDefinition) {
            errors.push(`Unknown interface: ${interfaceId} in module: ${moduleId}`);
            return { isValid: false, errors };
        }
        for (const paramDef of interfaceDefinition.parameters) {
            if (paramDef.required && !(paramDef.name in parameters)) {
                errors.push(`Missing required parameter: ${paramDef.name}`);
            }
        }
        return { isValid: errors.length === 0, errors };
    }
}
exports.ReservedInterfaceActivator = ReservedInterfaceActivator;
