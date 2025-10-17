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
export declare class WorkflowTemplateManager {
    private readonly customTemplates;
    private readonly templateUsageStats;
    static readonly STANDARD_TEMPLATES: Record<string, WorkflowTemplate>;
    getAllTemplates(): WorkflowTemplate[];
    getTemplateById(templateId: UUID): WorkflowTemplate | null;
    getTemplatesByCategory(category: TemplateCategory): WorkflowTemplate[];
    searchTemplatesByTags(tags: string[]): WorkflowTemplate[];
    createCustomTemplate(templateData: CustomTemplateData): Promise<WorkflowTemplate>;
    updateCustomTemplate(templateId: UUID, updates: Partial<CustomTemplateData>): Promise<WorkflowTemplate>;
    deleteCustomTemplate(templateId: UUID): Promise<boolean>;
    createWorkflowConfigFromTemplate(templateId: UUID, overrides?: Partial<WorkflowConfig>): WorkflowConfig;
    getTemplateUsageStats(templateId?: UUID): TemplateUsageStats[];
    getRecommendedTemplates(context: {
        userRole?: string;
        useCase?: string;
        complexity?: 'low' | 'medium' | 'high';
        resourceConstraints?: 'low' | 'medium' | 'high';
    }): WorkflowTemplate[];
    private validateTemplateData;
    private generateTemplateId;
    private incrementVersion;
    private recordTemplateUsage;
}
//# sourceMappingURL=workflow-template.manager.d.ts.map