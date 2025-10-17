"use strict";
/**
 * @fileoverview Code generator manager for creating code from templates
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGenerator = exports.CodeGeneratorManager = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const mustache = require('mustache');
/**
 * Code generator manager
 */
class CodeGeneratorManager {
    constructor() {
        // Generators will be imported dynamically to avoid circular dependencies
    }
    /**
     * Generate code based on options
     */
    async generateCode(options) {
        const generator = await this.getGenerator(options.type);
        const files = await generator.generateFiles(options);
        for (const file of files) {
            await this.writeFile(file);
        }
    }
    /**
     * Generate test files
     */
    async generateTests(options) {
        const generator = await this.getGenerator(options.type);
        const testFiles = await generator.generateTestFiles(options);
        for (const file of testFiles) {
            await this.writeFile(file);
        }
    }
    /**
     * Generate documentation
     */
    async generateDocumentation(options) {
        const generator = await this.getGenerator(options.type);
        const docFiles = await generator.generateDocumentationFiles(options);
        for (const file of docFiles) {
            await this.writeFile(file);
        }
    }
    /**
     * Get list of files that would be generated (for dry run)
     */
    async getGeneratedFiles(options) {
        const generator = await this.getGenerator(options.type);
        const files = [];
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
    async getGenerator(type) {
        switch (type) {
            case 'agent': {
                const { AgentGenerator } = await Promise.resolve().then(() => __importStar(require('./AgentGenerator')));
                return new AgentGenerator();
            }
            case 'workflow': {
                const { WorkflowGenerator } = await Promise.resolve().then(() => __importStar(require('./WorkflowGenerator')));
                return new WorkflowGenerator();
            }
            case 'config': {
                const { ConfigGenerator } = await Promise.resolve().then(() => __importStar(require('./ConfigGenerator')));
                return new ConfigGenerator();
            }
            default:
                throw new Error(`Unknown generator type: ${type}`);
        }
    }
    /**
     * Write file to disk
     */
    async writeFile(file) {
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
    static renderTemplate(template, context) {
        return mustache.render(template, context);
    }
    /**
     * Get template context for generation
     */
    static getTemplateContext(options) {
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
    static toCamelCase(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }
    /**
     * Convert string to kebab-case
     */
    static toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    /**
     * Convert string to CONSTANT_CASE
     */
    static toConstantCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    }
    /**
     * Get default directory for type
     */
    static getDefaultDirectory(type) {
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
exports.CodeGeneratorManager = CodeGeneratorManager;
/**
 * Base generator interface
 */
class BaseGenerator {
    /**
     * Get template context
     */
    getContext(options) {
        return CodeGeneratorManager.getTemplateContext(options);
    }
    /**
     * Render template
     */
    renderTemplate(template, context) {
        return CodeGeneratorManager.renderTemplate(template, context);
    }
    /**
     * Get output path
     */
    getOutputPath(options, filename) {
        const baseDir = 'src';
        const typeDir = options.directory || CodeGeneratorManager['getDefaultDirectory'](options.type);
        return path.join(baseDir, typeDir, filename);
    }
    /**
     * Get test output path
     */
    getTestOutputPath(options, filename) {
        const baseDir = 'src';
        const typeDir = options.directory || CodeGeneratorManager['getDefaultDirectory'](options.type);
        return path.join(baseDir, typeDir, '__tests__', filename);
    }
    /**
     * Get docs output path
     */
    getDocsOutputPath(options, filename) {
        const baseDir = 'docs';
        const typeDir = options.directory || CodeGeneratorManager['getDefaultDirectory'](options.type);
        return path.join(baseDir, typeDir, filename);
    }
}
exports.BaseGenerator = BaseGenerator;
//# sourceMappingURL=CodeGeneratorManager.js.map