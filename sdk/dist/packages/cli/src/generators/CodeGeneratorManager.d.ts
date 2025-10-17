/**
 * @fileoverview Code generator manager for creating code from templates
 */
/**
 * Code generation options
 */
export interface GenerationOptions {
    type: 'agent' | 'workflow' | 'config';
    name: string;
    directory?: string;
    template: 'basic' | 'advanced' | 'enterprise';
    description: string;
    capabilities: string[];
    steps: string[];
    generateTest: boolean;
    generateDocs: boolean;
    useTypeScript: boolean;
    dryRun?: boolean;
}
/**
 * Generated file information
 */
export interface GeneratedFile {
    path: string;
    content: string;
    description?: string;
    executable?: boolean;
}
/**
 * Code generator manager
 */
export declare class CodeGeneratorManager {
    constructor();
    /**
     * Generate code based on options
     */
    generateCode(options: GenerationOptions): Promise<void>;
    /**
     * Generate test files
     */
    generateTests(options: GenerationOptions): Promise<void>;
    /**
     * Generate documentation
     */
    generateDocumentation(options: GenerationOptions): Promise<void>;
    /**
     * Get list of files that would be generated (for dry run)
     */
    getGeneratedFiles(options: GenerationOptions): Promise<Array<{
        path: string;
        description?: string;
    }>>;
    /**
     * Get appropriate generator for type
     */
    private getGenerator;
    /**
     * Write file to disk
     */
    private writeFile;
    /**
     * Render template with context
     */
    static renderTemplate(template: string, context: any): string;
    /**
     * Get template context for generation
     */
    static getTemplateContext(options: GenerationOptions): any;
    /**
     * Convert string to camelCase
     */
    private static toCamelCase;
    /**
     * Convert string to kebab-case
     */
    private static toKebabCase;
    /**
     * Convert string to CONSTANT_CASE
     */
    private static toConstantCase;
    /**
     * Get default directory for type
     */
    private static getDefaultDirectory;
}
/**
 * Base generator interface
 */
export declare abstract class BaseGenerator {
    /**
     * Generate main files
     */
    abstract generateFiles(options: GenerationOptions): Promise<GeneratedFile[]>;
    /**
     * Generate test files
     */
    abstract generateTestFiles(options: GenerationOptions): Promise<GeneratedFile[]>;
    /**
     * Generate documentation files
     */
    abstract generateDocumentationFiles(options: GenerationOptions): Promise<GeneratedFile[]>;
    /**
     * Get template context
     */
    protected getContext(options: GenerationOptions): any;
    /**
     * Render template
     */
    protected renderTemplate(template: string, context: any): string;
    /**
     * Get output path
     */
    protected getOutputPath(options: GenerationOptions, filename: string): string;
    /**
     * Get test output path
     */
    protected getTestOutputPath(options: GenerationOptions, filename: string): string;
    /**
     * Get docs output path
     */
    protected getDocsOutputPath(options: GenerationOptions, filename: string): string;
}
//# sourceMappingURL=CodeGeneratorManager.d.ts.map