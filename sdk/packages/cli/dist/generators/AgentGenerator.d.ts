/**
 * @fileoverview Agent code generator
 */
import { BaseGenerator, GenerationOptions, GeneratedFile } from './CodeGeneratorManager';
/**
 * Agent generator
 */
export declare class AgentGenerator extends BaseGenerator {
    /**
     * Generate agent files
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
     * Get agent template based on complexity
     */
    private getAgentTemplate;
    /**
     * Get basic agent template
     */
    private getBasicAgentTemplate;
    /**
     * Get advanced agent template
     */
    private getAdvancedAgentTemplate;
    /**
     * Get enterprise agent template
     */
    private getEnterpriseAgentTemplate;
    /**
     * Get agent configuration template
     */
    private getAgentConfigTemplate;
    /**
     * Get agent types template
     */
    private getAgentTypesTemplate;
    /**
     * Get agent test template
     */
    private getAgentTestTemplate;
    /**
     * Get agent README template
     */
    private getAgentReadmeTemplate;
}
//# sourceMappingURL=AgentGenerator.d.ts.map