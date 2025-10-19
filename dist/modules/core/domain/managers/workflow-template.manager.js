"use strict";
/**
 * 工作流模板管理器
 * 提供预定义的工作流模板和自定义模板支持
 * 实现企业级工作流模板管理功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowTemplateManager = void 0;
const types_1 = require("../../types");
/**
 * 工作流模板管理器类
 * 提供完整的工作流模板管理功能
 */
class WorkflowTemplateManager {
    constructor() {
        this.customTemplates = new Map();
        this.templateUsageStats = new Map();
    }
    /**
     * 获取所有可用的工作流模板
     */
    getAllTemplates() {
        const standardTemplates = Object.values(WorkflowTemplateManager.STANDARD_TEMPLATES);
        const customTemplates = Array.from(this.customTemplates.values());
        return [...standardTemplates, ...customTemplates].filter(template => template.isActive);
    }
    /**
     * 根据ID获取工作流模板
     */
    getTemplateById(templateId) {
        // 先查找标准模板
        const standardTemplate = Object.values(WorkflowTemplateManager.STANDARD_TEMPLATES)
            .find(template => template.templateId === templateId);
        if (standardTemplate) {
            return standardTemplate;
        }
        // 再查找自定义模板
        return this.customTemplates.get(templateId) || null;
    }
    /**
     * 根据类别获取工作流模板
     */
    getTemplatesByCategory(category) {
        return this.getAllTemplates().filter(template => template.category === category);
    }
    /**
     * 根据标签搜索工作流模板
     */
    searchTemplatesByTags(tags) {
        return this.getAllTemplates().filter(template => tags.some(tag => template.tags.includes(tag)));
    }
    /**
     * 创建自定义工作流模板
     */
    async createCustomTemplate(templateData) {
        // 1. 验证模板数据
        const validation = await this.validateTemplateData(templateData);
        if (!validation.isValid) {
            throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
        }
        // 2. 生成模板ID
        const templateId = this.generateTemplateId();
        // 3. 创建模板
        const template = {
            templateId,
            name: templateData.name,
            description: templateData.description,
            stages: templateData.stages,
            executionMode: templateData.executionMode,
            timeout: templateData.timeout,
            metadata: templateData.metadata || {},
            createdAt: new Date(),
            version: '1.0.0',
            category: templateData.category || 'custom',
            tags: templateData.tags || [],
            isActive: true
        };
        // 4. 存储模板
        this.customTemplates.set(templateId, template);
        // 5. 初始化使用统计
        this.templateUsageStats.set(templateId, {
            templateId,
            usageCount: 0,
            successRate: 0,
            averageExecutionTime: 0,
            lastUsed: new Date()
        });
        return template;
    }
    /**
     * 更新自定义工作流模板
     */
    async updateCustomTemplate(templateId, updates) {
        const existingTemplate = this.customTemplates.get(templateId);
        if (!existingTemplate) {
            throw new Error(`Template not found: ${templateId}`);
        }
        // 验证更新数据
        if (updates.stages || updates.executionMode || updates.timeout) {
            const validation = await this.validateTemplateData({
                name: updates.name || existingTemplate.name,
                description: updates.description || existingTemplate.description,
                stages: updates.stages || existingTemplate.stages,
                executionMode: updates.executionMode || existingTemplate.executionMode,
                timeout: updates.timeout || existingTemplate.timeout
            });
            if (!validation.isValid) {
                throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
            }
        }
        // 更新模板
        const updatedTemplate = {
            ...existingTemplate,
            ...updates,
            updatedAt: new Date(),
            version: this.incrementVersion(existingTemplate.version)
        };
        this.customTemplates.set(templateId, updatedTemplate);
        return updatedTemplate;
    }
    /**
     * 删除自定义工作流模板
     */
    async deleteCustomTemplate(templateId) {
        const template = this.customTemplates.get(templateId);
        if (!template) {
            return false;
        }
        // 软删除：标记为不活跃
        template.isActive = false;
        template.updatedAt = new Date();
        this.customTemplates.set(templateId, template);
        return true;
    }
    /**
     * 从模板创建工作流配置
     */
    createWorkflowConfigFromTemplate(templateId, overrides) {
        const template = this.getTemplateById(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        // 记录模板使用
        this.recordTemplateUsage(templateId);
        return {
            name: overrides?.name || `Workflow from ${template.name}`,
            description: overrides?.description || template.description,
            stages: overrides?.stages || template.stages,
            executionMode: overrides?.executionMode || template.executionMode,
            parallelExecution: overrides?.parallelExecution || false,
            priority: overrides?.priority || types_1.Priority.MEDIUM,
            timeoutMs: overrides?.timeoutMs || template.timeout,
            maxConcurrentExecutions: overrides?.maxConcurrentExecutions || 1,
            retryPolicy: overrides?.retryPolicy
        };
    }
    /**
     * 获取模板使用统计
     */
    getTemplateUsageStats(templateId) {
        if (templateId) {
            const stats = this.templateUsageStats.get(templateId);
            return stats ? [stats] : [];
        }
        return Array.from(this.templateUsageStats.values());
    }
    /**
     * 获取推荐模板
     */
    getRecommendedTemplates(context) {
        const allTemplates = this.getAllTemplates();
        return allTemplates
            .filter(template => {
            // 根据复杂度过滤
            if (context.complexity) {
                const templateComplexity = template.metadata?.complexity;
                if (templateComplexity && templateComplexity !== context.complexity) {
                    return false;
                }
            }
            // 根据资源约束过滤
            if (context.resourceConstraints) {
                const resourceReq = template.metadata?.resourceRequirements;
                if (resourceReq === 'high' && context.resourceConstraints === 'low') {
                    return false;
                }
            }
            return true;
        })
            .sort((a, b) => {
            // 根据使用统计排序
            const statsA = this.templateUsageStats.get(a.templateId);
            const statsB = this.templateUsageStats.get(b.templateId);
            const scoreA = (statsA?.usageCount || 0) * (statsA?.successRate || 0);
            const scoreB = (statsB?.usageCount || 0) * (statsB?.successRate || 0);
            return scoreB - scoreA;
        })
            .slice(0, 5); // 返回前5个推荐模板
    }
    // ===== 私有辅助方法 =====
    /**
     * 验证模板数据
     */
    async validateTemplateData(templateData) {
        const errors = [];
        const warnings = [];
        // 验证基本字段
        if (!templateData.name || templateData.name.trim().length === 0) {
            errors.push('Template name is required');
        }
        if (!templateData.description || templateData.description.trim().length === 0) {
            errors.push('Template description is required');
        }
        if (!templateData.stages || templateData.stages.length === 0) {
            errors.push('Template must have at least one stage');
        }
        // 验证阶段有效性
        const validStages = [
            'context', 'plan', 'role', 'confirm', 'trace',
            'extension', 'dialog', 'collab', 'network'
        ];
        if (templateData.stages) {
            for (const stage of templateData.stages) {
                if (!validStages.includes(stage)) {
                    errors.push(`Invalid stage: ${stage}`);
                }
            }
        }
        // 验证执行模式
        const validExecutionModes = [types_1.ExecutionMode.SEQUENTIAL, types_1.ExecutionMode.PARALLEL, types_1.ExecutionMode.CONDITIONAL];
        if (templateData.executionMode && !validExecutionModes.includes(templateData.executionMode)) {
            errors.push(`Invalid execution mode: ${templateData.executionMode}`);
        }
        // 验证超时时间
        if (templateData.timeout && (templateData.timeout < 1000 || templateData.timeout > 3600000)) {
            warnings.push('Timeout should be between 1 second and 1 hour');
        }
        // 验证阶段组合的合理性
        if (templateData.stages && templateData.stages.length > 1) {
            if (templateData.stages.includes('context') && templateData.stages.indexOf('context') !== 0) {
                warnings.push('Context stage should typically be the first stage');
            }
            if (templateData.stages.includes('trace') && templateData.stages.indexOf('trace') !== templateData.stages.length - 1) {
                warnings.push('Trace stage should typically be the last stage');
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * 生成模板ID
     */
    generateTemplateId() {
        return `template-custom-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    /**
     * 递增版本号
     */
    incrementVersion(currentVersion) {
        const parts = currentVersion.split('.');
        const patch = parseInt(parts[2] || '0') + 1;
        return `${parts[0]}.${parts[1]}.${patch}`;
    }
    /**
     * 记录模板使用
     */
    recordTemplateUsage(templateId) {
        const stats = this.templateUsageStats.get(templateId);
        if (stats) {
            stats.usageCount++;
            stats.lastUsed = new Date();
        }
        else {
            this.templateUsageStats.set(templateId, {
                templateId,
                usageCount: 1,
                successRate: 0,
                averageExecutionTime: 0,
                lastUsed: new Date()
            });
        }
    }
}
exports.WorkflowTemplateManager = WorkflowTemplateManager;
// 标准工作流模板定义
WorkflowTemplateManager.STANDARD_TEMPLATES = {
    // 完整的MPLP工作流
    FULL_MPLP_WORKFLOW: {
        templateId: 'template-full-mplp-001',
        name: 'Full MPLP Workflow',
        description: '完整的MPLP生态系统工作流，包含所有9个模块的协调执行',
        stages: ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'dialog', 'collab', 'network'],
        executionMode: types_1.ExecutionMode.SEQUENTIAL,
        timeout: 600000, // 10 minutes
        metadata: {
            complexity: 'high',
            resourceRequirements: 'high',
            recommendedFor: ['enterprise', 'full_system_integration']
        },
        createdAt: new Date('2025-01-01'),
        version: '1.0.0',
        category: 'standard',
        tags: ['complete', 'enterprise', 'all-modules'],
        isActive: true
    },
    // 快速协作工作流
    QUICK_COLLABORATION: {
        templateId: 'template-quick-collab-001',
        name: 'Quick Collaboration',
        description: '快速多人协作工作流，适用于团队协作场景',
        stages: ['context', 'role', 'collab', 'trace'],
        executionMode: types_1.ExecutionMode.PARALLEL,
        timeout: 180000, // 3 minutes
        metadata: {
            complexity: 'medium',
            resourceRequirements: 'medium',
            recommendedFor: ['team_collaboration', 'real_time_work']
        },
        createdAt: new Date('2025-01-01'),
        version: '1.0.0',
        category: 'collaboration',
        tags: ['collaboration', 'quick', 'team'],
        isActive: true
    },
    // 安全审批工作流
    SECURE_APPROVAL: {
        templateId: 'template-secure-approval-001',
        name: 'Secure Approval',
        description: '安全审批工作流，包含完整的权限验证和审批流程',
        stages: ['context', 'role', 'confirm', 'trace'],
        executionMode: types_1.ExecutionMode.SEQUENTIAL,
        timeout: 300000, // 5 minutes
        metadata: {
            complexity: 'medium',
            resourceRequirements: 'low',
            recommendedFor: ['approval_processes', 'security_critical']
        },
        createdAt: new Date('2025-01-01'),
        version: '1.0.0',
        category: 'security',
        tags: ['security', 'approval', 'compliance'],
        isActive: true
    },
    // 性能监控工作流
    PERFORMANCE_MONITORING: {
        templateId: 'template-perf-monitor-001',
        name: 'Performance Monitoring',
        description: '性能监控工作流，专注于系统性能追踪和分析',
        stages: ['context', 'trace', 'extension'],
        executionMode: types_1.ExecutionMode.PARALLEL,
        timeout: 120000, // 2 minutes
        metadata: {
            complexity: 'low',
            resourceRequirements: 'low',
            recommendedFor: ['monitoring', 'performance_analysis']
        },
        createdAt: new Date('2025-01-01'),
        version: '1.0.0',
        category: 'performance',
        tags: ['monitoring', 'performance', 'analysis'],
        isActive: true
    },
    // 智能对话工作流
    INTELLIGENT_DIALOG: {
        templateId: 'template-intelligent-dialog-001',
        name: 'Intelligent Dialog',
        description: '智能对话工作流，集成AI对话和上下文管理',
        stages: ['context', 'plan', 'dialog', 'trace'],
        executionMode: types_1.ExecutionMode.SEQUENTIAL,
        timeout: 240000, // 4 minutes
        metadata: {
            complexity: 'medium',
            resourceRequirements: 'medium',
            recommendedFor: ['ai_interaction', 'conversational_ai']
        },
        createdAt: new Date('2025-01-01'),
        version: '1.0.0',
        category: 'standard',
        tags: ['ai', 'dialog', 'intelligent'],
        isActive: true
    },
    // 网络分布式工作流
    DISTRIBUTED_NETWORK: {
        templateId: 'template-distributed-network-001',
        name: 'Distributed Network',
        description: '分布式网络工作流，适用于多节点协调场景',
        stages: ['context', 'network', 'collab', 'trace'],
        executionMode: types_1.ExecutionMode.PARALLEL,
        timeout: 360000, // 6 minutes
        metadata: {
            complexity: 'high',
            resourceRequirements: 'high',
            recommendedFor: ['distributed_systems', 'multi_node']
        },
        createdAt: new Date('2025-01-01'),
        version: '1.0.0',
        category: 'enterprise',
        tags: ['distributed', 'network', 'multi-node'],
        isActive: true
    }
};
//# sourceMappingURL=workflow-template.manager.js.map