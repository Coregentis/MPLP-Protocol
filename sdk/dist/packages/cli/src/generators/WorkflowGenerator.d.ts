/**
 * @fileoverview Workflow code generator
 */
import { BaseGenerator, GenerationOptions, GeneratedFile } from './CodeGeneratorManager';
/**
 * Workflow generator
 */
export declare class WorkflowGenerator extends BaseGenerator {
    /**
     * Generate workflow files
     */
    generateFiles(options: GenerationOptions): Promise<GeneratedFile[]>;
    /**
     * Generate test files
     */
    generateTestFiles(options: GenerationOptions): Promise<GeneratedFile[]>;
    /**
     * Generate documentation files
     */
    generateDocumentationFiles(options: GenerationOptions): Promise<GeneratedFile[]>;
    /**
     * Get workflow template based on complexity
     */
    private getWorkflowTemplate;
    /**
     * Get basic workflow template
     */
    private getBasicWorkflowTemplate;
    /**
     * Get advanced workflow template
     */
    private getAdvancedWorkflowTemplate;
    /**
     * Get enterprise workflow template
     */
    private getEnterpriseWorkflowTemplate;
    /**
     * Get workflow configuration template
     */
    private getWorkflowConfigTemplate;
    /**
     * Get workflow types template
     */
    private getWorkflowTypesTemplate;
    /**
     * Get workflow test template
     */
    private getWorkflowTestTemplate;
    /**
     * Get workflow README template
     */
    private getWorkflowReadmeTemplate;
}
//# sourceMappingURL=WorkflowGenerator.d.ts.map