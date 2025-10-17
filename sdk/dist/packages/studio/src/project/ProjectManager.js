"use strict";
/**
 * @fileoverview Project Manager - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha项目管理架构
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
exports.ProjectManager = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
/**
 * 项目管理器 - 基于MPLP V1.0 Alpha管理器架构
 */
class ProjectManager {
    constructor(config, eventManager) {
        this.projects = new Map();
        this._isInitialized = false;
        this.config = config;
        this.eventManager = eventManager;
    }
    // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====
    /**
     * EventEmitter兼容的on方法
     */
    on(event, listener) {
        this.eventManager.on(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event, ...args) {
        return this.eventManager.emit(event, ...args);
    }
    /**
     * EventEmitter兼容的off方法
     */
    off(event, listener) {
        this.eventManager.off(event, listener);
        return this;
    }
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event) {
        this.eventManager.removeAllListeners(event);
        return this;
    }
    // ===== 核心生命周期方法 - 基于MPLP V1.0 Alpha生命周期模式 =====
    /**
     * 初始化项目管理器
     */
    async initialize() {
        if (this._isInitialized) {
            return;
        }
        try {
            // 确保项目目录存在
            await this.ensureProjectDirectories();
            // 加载现有项目
            await this.loadExistingProjects();
            this._isInitialized = true;
            this.emitEvent('initialized', { module: 'ProjectManager' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'ProjectManager',
                context: 'initialization'
            });
            throw error;
        }
    }
    /**
     * 关闭项目管理器
     */
    async shutdown() {
        if (!this._isInitialized) {
            return;
        }
        try {
            // 保存所有项目
            await this.saveAllProjects();
            this.projects.clear();
            this._isInitialized = false;
            this.emitEvent('shutdown', { module: 'ProjectManager' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'ProjectManager',
                context: 'shutdown'
            });
            throw error;
        }
    }
    /**
     * 获取状态
     */
    getStatus() {
        return this._isInitialized ? 'initialized' : 'not_initialized';
    }
    // ===== 项目管理方法 - 基于MPLP V1.0 Alpha项目管理模式 =====
    /**
     * 创建新项目
     */
    async createProject(name, template = 'basic') {
        if (!this._isInitialized) {
            throw new Error('ProjectManager not initialized');
        }
        const projectId = this.generateProjectId();
        const projectPath = path.join(this.config.workspace.defaultPath, name);
        const project = {
            id: projectId,
            name,
            description: `MPLP Studio project: ${name}`,
            path: projectPath,
            template,
            version: '1.1.0-beta',
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: this.createDefaultMetadata(),
            agents: [],
            workflows: [],
            settings: {
                buildTarget: 'node',
                typescript: true,
                testing: {
                    framework: 'jest',
                    coverage: true,
                    e2e: false
                },
                linting: {
                    enabled: true,
                    rules: 'recommended'
                },
                formatting: {
                    enabled: true,
                    config: 'prettier'
                }
            }
        };
        // 创建项目目录结构
        await this.createProjectStructure(project);
        // 保存项目
        await this.saveProject(project);
        this.projects.set(project.id, project);
        this.emitEvent('projectCreated', {
            projectId: project.id,
            projectName: project.name,
            template
        });
        return project;
    }
    /**
     * 打开项目
     */
    async openProject(projectPath) {
        if (!this._isInitialized) {
            throw new Error('ProjectManager not initialized');
        }
        try {
            const projectConfigPath = path.join(projectPath, 'mplp.project.json');
            const configContent = await fs_1.promises.readFile(projectConfigPath, 'utf-8');
            const project = JSON.parse(configContent);
            // 转换日期字符串为Date对象
            project.createdAt = new Date(project.createdAt);
            project.updatedAt = new Date(project.updatedAt);
            this.projects.set(project.id, project);
            this.emitEvent('projectOpened', {
                projectId: project.id,
                projectName: project.name,
                projectPath
            });
            return project;
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'ProjectManager',
                context: 'openProject',
                projectPath
            });
            throw new Error(`Failed to open project: ${error.message}`);
        }
    }
    /**
     * 保存项目
     */
    async saveProject(project) {
        if (!this._isInitialized) {
            throw new Error('ProjectManager not initialized');
        }
        try {
            project.updatedAt = new Date();
            const projectConfigPath = path.join(project.path, 'mplp.project.json');
            await fs_1.promises.writeFile(projectConfigPath, JSON.stringify(project, null, 2));
            this.projects.set(project.id, project);
            this.emitEvent('projectSaved', {
                projectId: project.id,
                projectName: project.name
            });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'ProjectManager',
                context: 'saveProject',
                projectId: project.id
            });
            throw new Error(`Failed to save project: ${error.message}`);
        }
    }
    /**
     * 删除项目
     */
    async deleteProject(projectId) {
        const project = this.projects.get(projectId);
        if (!project) {
            throw new Error(`Project not found: ${projectId}`);
        }
        try {
            // 删除项目目录
            await fs_1.promises.rm(project.path, { recursive: true, force: true });
            this.projects.delete(projectId);
            this.emitEvent('projectDeleted', {
                projectId,
                projectName: project.name
            });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'ProjectManager',
                context: 'deleteProject',
                projectId
            });
            throw new Error(`Failed to delete project: ${error.message}`);
        }
    }
    /**
     * 获取所有项目
     */
    getProjects() {
        return Array.from(this.projects.values());
    }
    /**
     * 获取项目
     */
    getProject(projectId) {
        return this.projects.get(projectId);
    }
    // ===== 私有方法 =====
    /**
     * 生成项目ID
     */
    generateProjectId() {
        return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * 创建默认元数据
     */
    createDefaultMetadata() {
        return {
            author: 'MPLP Studio User',
            tags: ['mplp', 'studio'],
            category: 'general',
            license: 'MIT',
            dependencies: {
                '@mplp/core': '^1.1.0-beta'
            },
            devDependencies: {
                '@types/node': '^20.0.0',
                'typescript': '^5.0.0',
                'jest': '^29.0.0'
            },
            scripts: {
                'build': 'tsc',
                'test': 'jest',
                'start': 'node dist/index.js'
            }
        };
    }
    /**
     * 确保项目目录存在
     */
    async ensureProjectDirectories() {
        const workspaceDir = this.config.workspace.defaultPath;
        await fs_1.promises.mkdir(workspaceDir, { recursive: true });
    }
    /**
     * 加载现有项目
     */
    async loadExistingProjects() {
        try {
            const workspaceDir = this.config.workspace.defaultPath;
            const entries = await fs_1.promises.readdir(workspaceDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const projectPath = path.join(workspaceDir, entry.name);
                    const configPath = path.join(projectPath, 'mplp.project.json');
                    try {
                        await fs_1.promises.access(configPath);
                        await this.openProject(projectPath);
                    }
                    catch {
                        // 忽略没有配置文件的目录
                    }
                }
            }
        }
        catch (error) {
            // 工作空间目录不存在或无法访问，忽略错误
        }
    }
    /**
     * 创建项目目录结构
     */
    async createProjectStructure(project) {
        const dirs = [
            project.path,
            path.join(project.path, 'src'),
            path.join(project.path, 'src', 'agents'),
            path.join(project.path, 'src', 'workflows'),
            path.join(project.path, 'src', 'components'),
            path.join(project.path, 'tests'),
            path.join(project.path, 'docs')
        ];
        for (const dir of dirs) {
            await fs_1.promises.mkdir(dir, { recursive: true });
        }
        // 创建基础文件
        const files = [
            {
                path: path.join(project.path, 'package.json'),
                content: JSON.stringify({
                    name: project.name.toLowerCase().replace(/\s+/g, '-'),
                    version: '1.0.0',
                    description: project.description,
                    main: 'dist/index.js',
                    scripts: project.metadata.scripts,
                    dependencies: project.metadata.dependencies,
                    devDependencies: project.metadata.devDependencies
                }, null, 2)
            },
            {
                path: path.join(project.path, 'tsconfig.json'),
                content: JSON.stringify({
                    compilerOptions: {
                        target: 'ES2020',
                        module: 'commonjs',
                        outDir: './dist',
                        rootDir: './src',
                        strict: true,
                        esModuleInterop: true,
                        skipLibCheck: true,
                        forceConsistentCasingInFileNames: true
                    },
                    include: ['src/**/*'],
                    exclude: ['node_modules', 'dist', 'tests']
                }, null, 2)
            },
            {
                path: path.join(project.path, 'README.md'),
                content: `# ${project.name}\n\n${project.description}\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run build\nnpm start\n\`\`\`\n`
            }
        ];
        for (const file of files) {
            await fs_1.promises.writeFile(file.path, file.content);
        }
    }
    /**
     * 保存所有项目
     */
    async saveAllProjects() {
        const savePromises = Array.from(this.projects.values()).map(project => this.saveProject(project));
        await Promise.all(savePromises);
    }
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    emitEvent(type, data) {
        this.eventManager.emitMPLP(type, 'ProjectManager', data);
    }
}
exports.ProjectManager = ProjectManager;
//# sourceMappingURL=ProjectManager.js.map