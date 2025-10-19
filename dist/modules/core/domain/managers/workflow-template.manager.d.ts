/**
 * 工作流模板管理器
 * 提供预定义的工作流模板和自定义模板支持
 * 实现企业级工作流模板管理功能
 */
import { WorkflowConfig, WorkflowStageType, ExecutionModeType, UUID, ExecutionMode } from '../../types';
export interface WorkflowTemplate {
    templateId: UUID;
    name: string;
    description: string;
    stages: WorkflowStageType[];
    executionMode: ExecutionModeType;
    timeout: number;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt?: Date;
    version: string;
    category: TemplateCategory;
    tags: string[];
    isActive: boolean;
}
export type TemplateCategory = 'standard' | 'enterprise' | 'collaboration' | 'security' | 'performance' | 'custom';
export interface CustomTemplateData {
    name: string;
    description: string;
    stages: WorkflowStageType[];
    executionMode: ExecutionMode;
    timeout: number;
    metadata?: Record<string, unknown>;
    category?: TemplateCategory;
    tags?: string[];
}
export interface TemplateValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface TemplateUsageStats {
    templateId: UUID;
    usageCount: number;
    successRate: number;
    averageExecutionTime: number;
    lastUsed: Date;
}
/**
 * 工作流模板管理器类
 * 提供完整的工作流模板管理功能
 */
export declare class WorkflowTemplateManager {
    private readonly customTemplates;
    private readonly templateUsageStats;
    static readonly STANDARD_TEMPLATES: Record<string, WorkflowTemplate>;
    /**
     * 获取所有可用的工作流模板
     */
    getAllTemplates(): WorkflowTemplate[];
    /**
     * 根据ID获取工作流模板
     */
    getTemplateById(templateId: UUID): WorkflowTemplate | null;
    /**
     * 根据类别获取工作流模板
     */
    getTemplatesByCategory(category: TemplateCategory): WorkflowTemplate[];
    /**
     * 根据标签搜索工作流模板
     */
    searchTemplatesByTags(tags: string[]): WorkflowTemplate[];
    /**
     * 创建自定义工作流模板
     */
    createCustomTemplate(templateData: CustomTemplateData): Promise<WorkflowTemplate>;
    /**
     * 更新自定义工作流模板
     */
    updateCustomTemplate(templateId: UUID, updates: Partial<CustomTemplateData>): Promise<WorkflowTemplate>;
    /**
     * 删除自定义工作流模板
     */
    deleteCustomTemplate(templateId: UUID): Promise<boolean>;
    /**
     * 从模板创建工作流配置
     */
    createWorkflowConfigFromTemplate(templateId: UUID, overrides?: Partial<WorkflowConfig>): WorkflowConfig;
    /**
     * 获取模板使用统计
     */
    getTemplateUsageStats(templateId?: UUID): TemplateUsageStats[];
    /**
     * 获取推荐模板
     */
    getRecommendedTemplates(context: {
        userRole?: string;
        useCase?: string;
        complexity?: 'low' | 'medium' | 'high';
        resourceConstraints?: 'low' | 'medium' | 'high';
    }): WorkflowTemplate[];
    /**
     * 验证模板数据
     */
    private validateTemplateData;
    /**
     * 生成模板ID
     */
    private generateTemplateId;
    /**
     * 递增版本号
     */
    private incrementVersion;
    /**
     * 记录模板使用
     */
    private recordTemplateUsage;
}
//# sourceMappingURL=workflow-template.manager.d.ts.map