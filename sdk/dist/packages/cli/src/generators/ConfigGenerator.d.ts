/**
 * @fileoverview Configuration code generator
 */
import { BaseGenerator, GenerationOptions, GeneratedFile } from './CodeGeneratorManager';
/**
 * Configuration generator
 */
export declare class ConfigGenerator extends BaseGenerator {
    /**
     * Generate configuration files
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
     * Get configuration template based on complexity
     */
    private getConfigTemplate;
    /**
     * Get basic configuration template
     */
    private getBasicConfigTemplate;
    /**
     * Get advanced configuration template
     */
    private getAdvancedConfigTemplate;
    /**
     * Get enterprise configuration template
     */
    private getEnterpriseConfigTemplate;
    /**
     * Get environment configuration template
     */
    private getEnvironmentConfigTemplate;
    /**
     * Get configuration schema template
     */
    private getConfigSchemaTemplate;
    /**
     * Get configuration test template
     */
    private getConfigTestTemplate;
    /**
     * Get configuration README template
     */
    private getConfigReadmeTemplate;
}
//# sourceMappingURL=ConfigGenerator.d.ts.map