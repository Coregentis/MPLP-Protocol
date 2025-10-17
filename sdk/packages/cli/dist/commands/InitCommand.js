"use strict";
/**
 * @fileoverview Init command for creating new MPLP projects
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
exports.InitCommand = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const BaseCommand_1 = require("./BaseCommand");
const types_1 = require("../core/types");
const ProjectTemplateManager_1 = require("../templates/ProjectTemplateManager");
const PackageManagerDetector_1 = require("../utils/PackageManagerDetector");
const GitOperations_1 = require("../utils/GitOperations");
/**
 * Init command for creating new MPLP projects
 */
class InitCommand extends BaseCommand_1.BaseCommand {
    constructor(context) {
        super(context);
        this.name = 'init';
        this.description = 'Create a new MPLP project';
        this.aliases = ['create', 'new'];
        this.arguments = [
            {
                name: 'project-name',
                description: 'Name of the project to create',
                required: false
            }
        ];
        this.options = [
            {
                flags: '-t, --template <template>',
                description: 'Project template to use',
                defaultValue: 'basic',
                choices: ['basic', 'advanced', 'enterprise']
            },
            {
                flags: '-d, --directory <directory>',
                description: 'Directory to create the project in'
            },
            {
                flags: '--description <description>',
                description: 'Project description'
            },
            {
                flags: '--author <author>',
                description: 'Project author'
            },
            {
                flags: '--license <license>',
                description: 'Project license',
                defaultValue: 'MIT'
            },
            {
                flags: '--no-git',
                description: 'Skip Git repository initialization'
            },
            {
                flags: '--no-install',
                description: 'Skip dependency installation'
            },
            {
                flags: '--typescript',
                description: 'Use TypeScript template'
            },
            {
                flags: '--eslint',
                description: 'Include ESLint configuration'
            },
            {
                flags: '--prettier',
                description: 'Include Prettier configuration'
            }
        ];
        this.examples = [
            'mplp init my-agent',
            'mplp init my-agent --template advanced',
            'mplp init my-agent --template enterprise --typescript --eslint',
            'mplp init --directory ./projects/my-agent'
        ];
        this.templateManager = new ProjectTemplateManager_1.ProjectTemplateManager();
        this.packageManager = new PackageManagerDetector_1.PackageManagerDetector();
        this.gitOps = new GitOperations_1.GitOperations();
    }
    /**
     * Execute the init command
     */
    async execute(args) {
        try {
            // Get project options
            const options = await this.getProjectOptions(args);
            // Validate options
            this.validateProjectOptions(options);
            // Create project
            await this.createProject(options);
            // Show success message
            this.showSuccessMessage(options);
        }
        catch (error) {
            throw new types_1.ProjectCreationError(error.message, error);
        }
    }
    /**
     * Get project options from arguments and prompts
     */
    async getProjectOptions(args) {
        let projectName = this.getArgument(args, 0);
        // Prompt for project name if not provided
        if (!projectName) {
            projectName = await this.prompt('Project name:', 'my-mplp-project');
        }
        // Get template
        const template = this.getOption(args, 'template', 'basic');
        // Validate template
        if (!this.templateManager.hasTemplate(template)) {
            const availableTemplates = this.templateManager.getAvailableTemplates();
            throw new Error(`Template '${template}' not found. Available templates: ${availableTemplates.join(', ')}`);
        }
        // Get other options
        const directory = this.getOption(args, 'directory') || projectName;
        const description = this.getOption(args, 'description') || `A new MPLP project created with ${template} template`;
        const author = this.getOption(args, 'author') || await this.getDefaultAuthor();
        const license = this.getOption(args, 'license', 'MIT');
        const git = !this.hasOption(args, 'no-git');
        const install = !this.hasOption(args, 'no-install');
        const typescript = this.hasOption(args, 'typescript');
        const eslint = this.hasOption(args, 'eslint');
        const prettier = this.hasOption(args, 'prettier');
        return {
            name: projectName,
            template,
            directory,
            description,
            author,
            license,
            git,
            install,
            typescript,
            eslint,
            prettier
        };
    }
    /**
     * Validate project options
     */
    validateProjectOptions(options) {
        // Validate project name
        if (!options.name || options.name.trim().length === 0) {
            throw new Error('Project name cannot be empty');
        }
        // Validate project name format
        if (!/^[a-zA-Z0-9-_]+$/.test(options.name)) {
            throw new Error('Project name can only contain letters, numbers, hyphens, and underscores');
        }
        // Check if directory already exists
        const targetPath = path.resolve(options.directory || options.name);
        if (fs.existsSync(targetPath)) {
            const files = fs.readdirSync(targetPath);
            if (files.length > 0) {
                throw new Error(`Directory '${targetPath}' already exists and is not empty`);
            }
        }
    }
    /**
     * Create the project
     */
    async createProject(options) {
        const targetPath = path.resolve(options.directory || options.name);
        this.logger.header(`Creating MPLP project: ${options.name}`);
        this.logger.info(`Template: ${options.template}`);
        this.logger.info(`Directory: ${targetPath}`);
        this.logger.newline();
        // Create project from template
        await this.executeWithSpinner(() => this.templateManager.createProject(options, targetPath), 'Creating project structure...', 'Project structure created');
        // Initialize Git repository
        if (options.git) {
            await this.executeWithSpinner(() => this.initializeGit(targetPath), 'Initializing Git repository...', 'Git repository initialized');
        }
        // Install dependencies
        if (options.install) {
            await this.executeWithSpinner(() => this.installDependencies(targetPath), 'Installing dependencies...', 'Dependencies installed');
        }
    }
    /**
     * Initialize Git repository
     */
    async initializeGit(projectPath) {
        if (!this.gitOps.isRepository(projectPath)) {
            await this.gitOps.init(projectPath);
            // Create initial commit
            await this.gitOps.add(projectPath, ['.']);
            await this.gitOps.commit(projectPath, 'Initial commit');
        }
    }
    /**
     * Install dependencies
     */
    async installDependencies(projectPath) {
        const packageManager = await this.packageManager.detect(projectPath);
        await packageManager.install(projectPath);
    }
    /**
     * Get default author from Git config
     */
    async getDefaultAuthor() {
        try {
            const name = await this.gitOps.getConfig('user.name');
            const email = await this.gitOps.getConfig('user.email');
            if (name && email) {
                return `${name} <${email}>`;
            }
            else if (name) {
                return name;
            }
        }
        catch {
            // Ignore errors
        }
        return 'Unknown Author';
    }
    /**
     * Show success message
     */
    showSuccessMessage(options) {
        const projectPath = path.resolve(options.directory || options.name);
        this.logger.newline();
        this.success('Project created successfully!');
        this.logger.newline();
        this.logger.subheader('Next steps:');
        this.logger.commands([
            { command: `cd ${options.name}`, description: 'Navigate to project directory' },
            { command: 'mplp --help', description: 'See available commands' },
            { command: 'npm run dev', description: 'Start development server (if available)' },
            { command: 'npm test', description: 'Run tests' }
        ]);
        this.logger.newline();
        this.logger.info('For more information, visit: https://mplp.dev/docs');
    }
}
exports.InitCommand = InitCommand;
//# sourceMappingURL=InitCommand.js.map