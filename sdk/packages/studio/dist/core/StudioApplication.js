"use strict";
/**
 * @fileoverview Studio Application - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构和管理器模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioApplication = void 0;
const MPLPEventManager_1 = require("./MPLPEventManager");
const ProjectManager_1 = require("../project/ProjectManager");
const WorkspaceManager_1 = require("../workspace/WorkspaceManager");
/**
 * Studio应用程序主控制器 - 基于MPLP V1.0 Alpha架构
 */
class StudioApplication {
    constructor(config = {}) {
        this._isInitialized = false;
        this.eventManager = new MPLPEventManager_1.MPLPEventManager();
        this.config = this.createDefaultConfig(config);
        this.state = this.createInitialState();
        // 初始化管理器 - 基于MPLP V1.0 Alpha依赖注入模式
        this.projectManager = new ProjectManager_1.ProjectManager(this.config, this.eventManager);
        this.workspaceManager = new WorkspaceManager_1.WorkspaceManager(this.config, this.eventManager);
        this.setupEventHandlers();
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
     * 初始化Studio应用程序
     */
    async initialize() {
        if (this._isInitialized) {
            return;
        }
        try {
            // 初始化管理器
            await this.projectManager.initialize();
            await this.workspaceManager.initialize();
            this._isInitialized = true;
            this.state.isInitialized = true;
            this.state.isRunning = true;
            this.emitStudioEvent('initialized', {
                version: this.config.version,
                environment: this.config.environment
            });
        }
        catch (error) {
            this.emitStudioEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                context: 'initialization'
            });
            throw error;
        }
    }
    /**
     * 关闭Studio应用程序
     */
    async shutdown() {
        if (!this._isInitialized) {
            return;
        }
        try {
            // 保存所有项目
            await this.saveAllProjects();
            // 关闭管理器
            await this.projectManager.shutdown();
            await this.workspaceManager.shutdown();
            this.state.isRunning = false;
            this._isInitialized = false;
            this.emitStudioEvent('shutdown', {
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.emitStudioEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                context: 'shutdown'
            });
            throw error;
        }
    }
    /**
     * 获取状态
     */
    getStatus() {
        if (!this._isInitialized)
            return 'not_initialized';
        if (!this.state.isRunning)
            return 'stopped';
        return 'running';
    }
    // ===== 项目管理方法 - 基于MPLP V1.0 Alpha项目管理模式 =====
    /**
     * 创建新项目
     */
    async createProject(name, template) {
        const project = await this.projectManager.createProject(name, template);
        this.state.openProjects.push(project);
        this.emitStudioEvent('projectCreated', { projectId: project.id, projectName: project.name });
        return project;
    }
    /**
     * 打开项目
     */
    async openProject(projectPath) {
        const project = await this.projectManager.openProject(projectPath);
        // 添加到打开的项目列表
        const existingIndex = this.state.openProjects.findIndex(p => p.id === project.id);
        if (existingIndex === -1) {
            this.state.openProjects.push(project);
        }
        else {
            this.state.openProjects[existingIndex] = project;
        }
        this.state.currentProject = project;
        this.emitStudioEvent('projectOpened', { projectId: project.id, projectName: project.name });
        return project;
    }
    /**
     * 关闭项目
     */
    async closeProject(projectId) {
        const project = this.state.openProjects.find(p => p.id === projectId);
        if (!project) {
            throw new Error(`Project not found: ${projectId}`);
        }
        // 保存项目
        await this.projectManager.saveProject(project);
        // 从打开的项目列表中移除
        this.state.openProjects = this.state.openProjects.filter(p => p.id !== projectId);
        // 如果是当前项目，清除当前项目
        if (this.state.currentProject?.id === projectId) {
            this.state.currentProject = this.state.openProjects[0] || null;
        }
        this.emitStudioEvent('projectClosed', { projectId, projectName: project.name });
    }
    /**
     * 保存当前项目
     */
    async saveCurrentProject() {
        if (!this.state.currentProject) {
            throw new Error('No current project to save');
        }
        await this.projectManager.saveProject(this.state.currentProject);
        this.emitStudioEvent('projectSaved', { projectId: this.state.currentProject.id });
    }
    /**
     * 保存所有项目
     */
    async saveAllProjects() {
        const savePromises = this.state.openProjects.map(project => this.projectManager.saveProject(project));
        await Promise.all(savePromises);
        this.emitStudioEvent('allProjectsSaved', { count: this.state.openProjects.length });
    }
    // ===== 配置和状态管理 - 基于MPLP V1.0 Alpha配置模式 =====
    /**
     * 获取配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 获取事件管理器
     */
    getEventManager() {
        return this.eventManager;
    }
    /**
     * 更新配置
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.emitStudioEvent('configUpdated', { updates });
    }
    /**
     * 获取状态
     */
    getState() {
        return { ...this.state };
    }
    /**
     * 切换项目
     */
    switchToProject(projectId) {
        const project = this.state.openProjects.find(p => p.id === projectId);
        if (!project) {
            throw new Error(`Project not found: ${projectId}`);
        }
        this.state.currentProject = project;
        this.emitStudioEvent('projectSwitched', { projectId, projectName: project.name });
    }
    /**
     * 更新偏好设置
     */
    updatePreferences(preferences) {
        this.state.preferences = { ...this.state.preferences, ...preferences };
        this.emitStudioEvent('preferencesUpdated', { preferences: this.state.preferences });
    }
    // ===== 私有方法 =====
    /**
     * 创建默认配置
     */
    createDefaultConfig(config) {
        return {
            version: '1.1.0-beta',
            environment: 'development',
            server: {
                port: 3000,
                host: 'localhost',
                cors: {
                    enabled: true,
                    origins: ['http://localhost:3000']
                }
            },
            workspace: {
                defaultPath: require('path').join(process.cwd(), 'workspace'),
                maxRecentFiles: 10,
                autoSave: true,
                autoSaveInterval: 30000
            },
            project: {
                defaultTemplate: 'basic',
                maxProjects: 50,
                backupEnabled: true,
                backupInterval: 300000
            },
            logging: {
                level: 'info',
                file: 'studio.log',
                console: true
            },
            performance: {
                enableMetrics: true,
                metricsInterval: 60000,
                maxMemoryUsage: 512 * 1024 * 1024 // 512MB
            },
            ...config
        };
    }
    /**
     * 创建初始状态
     */
    createInitialState() {
        return {
            isRunning: false,
            isInitialized: false,
            currentProject: null,
            currentWorkspace: null,
            openProjects: [],
            recentFiles: [],
            preferences: {
                theme: 'dark',
                fontSize: 14,
                tabSize: 2,
                wordWrap: true,
                showLineNumbers: true,
                showMinimap: true,
                autoComplete: true,
                livePreview: true
            },
            performance: {
                memoryUsage: 0,
                cpuUsage: 0,
                uptime: 0
            }
        };
    }
    /**
     * 设置事件处理器 - 基于MPLP V1.0 Alpha事件处理模式
     */
    setupEventHandlers() {
        // 项目管理器事件
        this.projectManager.on('projectCreated', (project) => {
            this.emit('projectCreated', project);
        });
        this.projectManager.on('projectSaved', (project) => {
            this.emit('projectSaved', project);
        });
        this.projectManager.on('error', (error) => {
            this.emit('error', error);
        });
        // 工作空间管理器事件
        this.workspaceManager.on('workspaceChanged', (workspace) => {
            this.emit('workspaceChanged', workspace);
        });
        this.workspaceManager.on('error', (error) => {
            this.emit('error', error);
        });
        // 错误处理
        process.on('uncaughtException', (error) => {
            try {
                this.emit('error', error);
            }
            catch (emitError) {
                console.error('Failed to emit error event:', emitError);
            }
        });
    }
    /**
     * 发射Studio事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    emitStudioEvent(type, data) {
        this.eventManager.emitMPLP(type, 'StudioApplication', data);
    }
}
exports.StudioApplication = StudioApplication;
//# sourceMappingURL=StudioApplication.js.map