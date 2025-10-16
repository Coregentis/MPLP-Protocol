/**
 * @fileoverview Code generator manager for creating code from templates
 */

import * as path from 'path';
import * as fs from 'fs-extra';
const mustache = require('mustache');

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
export class CodeGeneratorManager {
  constructor() {
    // Generators will be imported dynamically to avoid circular dependencies
  }

  /**
   * Generate code based on options
   */
  public async generateCode(options: GenerationOptions): Promise<void> {
    const generator = await this.getGenerator(options.type);
    const files = await generator.generateFiles(options);

    for (const file of files) {
      await this.writeFile(file);
    }
  }

  /**
   * Generate test files
   */
  public async generateTests(options: GenerationOptions): Promise<void> {
    const generator = await this.getGenerator(options.type);
    const testFiles = await generator.generateTestFiles(options);

    for (const file of testFiles) {
      await this.writeFile(file);
    }
  }

  /**
   * Generate documentation
   */
  public async generateDocumentation(options: GenerationOptions): Promise<void> {
    const generator = await this.getGenerator(options.type);
    const docFiles = await generator.generateDocumentationFiles(options);

    for (const file of docFiles) {
      await this.writeFile(file);
    }
  }

  /**
   * Get list of files that would be generated (for dry run)
   */
  public async getGeneratedFiles(options: GenerationOptions): Promise<Array<{ path: string; description?: string }>> {
    const generator = await this.getGenerator(options.type);
    const files: Array<{ path: string; description?: string }> = [];
    
    // Main files
    const mainFiles = await generator.generateFiles(options);
    files.push(...mainFiles.map(f => ({ path: f.path, description: f.description })));
    
    // Test files
    if (options.generateTest) {
      const testFiles = await generator.generateTestFiles(options);
      files.push(...testFiles.map(f => ({ path: f.path, description: f.description })));
    }
    
    // Documentation files
    if (options.generateDocs) {
      const docFiles = await generator.generateDocumentationFiles(options);
      files.push(...docFiles.map(f => ({ path: f.path, description: f.description })));
    }
    
    return files;
  }

  /**
   * Get appropriate generator for type
   */
  private async getGenerator(type: string): Promise<BaseGenerator> {
    switch (type) {
      case 'agent': {
        const { AgentGenerator } = await import('./AgentGenerator');
        return new AgentGenerator();
      }
      case 'workflow': {
        const { WorkflowGenerator } = await import('./WorkflowGenerator');
        return new WorkflowGenerator();
      }
      case 'config': {
        const { ConfigGenerator } = await import('./ConfigGenerator');
        return new ConfigGenerator();
      }
      default:
        throw new Error(`Unknown generator type: ${type}`);
    }
  }

  /**
   * Write file to disk
   */
  private async writeFile(file: GeneratedFile): Promise<void> {
    const fullPath = path.resolve(file.path);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.ensureDir(dir);
    
    // Write file
    await fs.writeFile(fullPath, file.content, 'utf8');
    
    // Set executable permission if needed
    if (file.executable) {
      await fs.chmod(fullPath, 0o755);
    }
  }

  /**
   * Render template with context
   */
  public static renderTemplate(template: string, context: any): string {
    return mustache.render(template, context);
  }

  /**
   * Get template context for generation
   */
  public static getTemplateContext(options: GenerationOptions): any {
    const now = new Date();
    
    return {
      name: options.name,
      description: options.description,
      template: options.template,
      capabilities: options.capabilities,
      steps: options.steps,
      useTypeScript: options.useTypeScript,
      fileExtension: options.useTypeScript ? 'ts' : 'js',
      testExtension: options.useTypeScript ? 'test.ts' : 'test.js',
      date: now.toISOString().split('T')[0],
      year: now.getFullYear(),
      className: options.name,
      camelCaseName: this.toCamelCase(options.name),
      kebabCaseName: this.toKebabCase(options.name),
      constantName: this.toConstantCase(options.name),
      directory: options.directory || this.getDefaultDirectory(options.type)
    };
  }

  /**
   * Convert string to camelCase
   */
  private static toCamelCase(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Convert string to kebab-case
   */
  private static toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Convert string to CONSTANT_CASE
   */
  private static toConstantCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
  }

  /**
   * Get default directory for type
   */
  private static getDefaultDirectory(type: string): string {
    switch (type) {
      case 'agent':
        return 'agents';
      case 'workflow':
        return 'workflows';
      case 'config':
        return 'config';
      default:
        return '';
    }
  }
}

/**
 * Base generator interface
 */
export abstract class BaseGenerator {
  /**
   * Generate main files
   */
  public abstract generateFiles(options: GenerationOptions): Promise<GeneratedFile[]>;

  /**
   * Generate test files
   */
  public abstract generateTestFiles(options: GenerationOptions): Promise<GeneratedFile[]>;

  /**
   * Generate documentation files
   */
  public abstract generateDocumentationFiles(options: GenerationOptions): Promise<GeneratedFile[]>;

  /**
   * Get template context
   */
  protected getContext(options: GenerationOptions): any {
    return CodeGeneratorManager.getTemplateContext(options);
  }

  /**
   * Render template
   */
  protected renderTemplate(template: string, context: any): string {
    return CodeGeneratorManager.renderTemplate(template, context);
  }

  /**
   * Get output path
   */
  protected getOutputPath(options: GenerationOptions, filename: string): string {
    const baseDir = 'src';
    const typeDir = options.directory || CodeGeneratorManager['getDefaultDirectory'](options.type);
    return path.join(baseDir, typeDir, filename);
  }

  /**
   * Get test output path
   */
  protected getTestOutputPath(options: GenerationOptions, filename: string): string {
    const baseDir = 'src';
    const typeDir = options.directory || CodeGeneratorManager['getDefaultDirectory'](options.type);
    return path.join(baseDir, typeDir, '__tests__', filename);
  }

  /**
   * Get docs output path
   */
  protected getDocsOutputPath(options: GenerationOptions, filename: string): string {
    const baseDir = 'docs';
    const typeDir = options.directory || CodeGeneratorManager['getDefaultDirectory'](options.type);
    return path.join(baseDir, typeDir, filename);
  }
}
