"use strict";
/**
 * @fileoverview Workspace Manager - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha工作空间管理架构
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
exports.WorkspaceManager = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
/**
 * 工作空间管理器 - 基于MPLP V1.0 Alpha管理器架构
 */
class WorkspaceManager {
    constructor(config, eventManager) {
        this.currentWorkspace = null;
        this.recentWorkspaces = [];
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
     * 初始化工作空间管理器
     */
    async initialize() {
        if (this._isInitialized) {
            return;
        }
        try {
            // 确保工作空间目录存在
            await this.ensureWorkspaceDirectories();
            // 加载最近的工作空间
            await this.loadRecentWorkspaces();
            // 尝试打开默认工作空间
            await this.openDefaultWorkspace();
            this._isInitialized = true;
            this.emitEvent('initialized', { module: 'WorkspaceManager' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'WorkspaceManager',
                context: 'initialization'
            });
            throw error;
        }
    }
    /**
     * 关闭工作空间管理器
     */
    async shutdown() {
        if (!this._isInitialized) {
            return;
        }
        try {
            // 保存当前工作空间
            if (this.currentWorkspace) {
                await this.saveWorkspace(this.currentWorkspace);
            }
            // 保存最近的工作空间列表
            await this.saveRecentWorkspaces();
            this.currentWorkspace = null;
            this._isInitialized = false;
            this.emitEvent('shutdown', { module: 'WorkspaceManager' });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'WorkspaceManager',
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
    // ===== 工作空间管理方法 - 基于MPLP V1.0 Alpha工作空间管理模式 =====
    /**
     * 创建新工作空间
     */
    async createWorkspace(name, workspacePath) {
        if (!this._isInitialized) {
            throw new Error('WorkspaceManager not initialized');
        }
        const workspace = {
            name,
            path: workspacePath,
            projects: [],
            settings: this.createDefaultSettings(),
            recentFiles: [],
            bookmarks: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // 创建工作空间目录
        await fs_1.promises.mkdir(workspacePath, { recursive: true });
        // 保存工作空间配置
        await this.saveWorkspace(workspace);
        this.emitEvent('workspaceCreated', {
            workspaceName: workspace.name,
            workspacePath: workspace.path
        });
        return workspace;
    }
    /**
     * 打开工作空间
     */
    async openWorkspace(workspacePath) {
        if (!this._isInitialized) {
            throw new Error('WorkspaceManager not initialized');
        }
        try {
            const configPath = path.join(workspacePath, '.mplp', 'workspace.json');
            const configContent = await fs_1.promises.readFile(configPath, 'utf-8');
            const workspace = JSON.parse(configContent);
            // 转换日期字符串为Date对象
            workspace.createdAt = new Date(workspace.createdAt);
            workspace.updatedAt = new Date(workspace.updatedAt);
            this.currentWorkspace = workspace;
            this.addToRecentWorkspaces(workspacePath);
            this.emitEvent('workspaceOpened', {
                workspaceName: workspace.name,
                workspacePath: workspace.path
            });
            return workspace;
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'WorkspaceManager',
                context: 'openWorkspace',
                workspacePath
            });
            throw new Error(`Failed to open workspace: ${error.message}`);
        }
    }
    /**
     * 保存工作空间
     */
    async saveWorkspace(workspace) {
        if (!this._isInitialized) {
            throw new Error('WorkspaceManager not initialized');
        }
        try {
            workspace.updatedAt = new Date();
            const configDir = path.join(workspace.path, '.mplp');
            const configPath = path.join(configDir, 'workspace.json');
            await fs_1.promises.mkdir(configDir, { recursive: true });
            await fs_1.promises.writeFile(configPath, JSON.stringify(workspace, null, 2));
            this.emitEvent('workspaceSaved', {
                workspaceName: workspace.name,
                workspacePath: workspace.path
            });
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'WorkspaceManager',
                context: 'saveWorkspace',
                workspaceName: workspace.name
            });
            throw new Error(`Failed to save workspace: ${error.message}`);
        }
    }
    /**
     * 切换工作空间
     */
    async switchWorkspace(workspacePath) {
        // 保存当前工作空间
        if (this.currentWorkspace) {
            await this.saveWorkspace(this.currentWorkspace);
        }
        // 打开新工作空间
        const workspace = await this.openWorkspace(workspacePath);
        this.emitEvent('workspaceChanged', {
            previousWorkspace: this.currentWorkspace?.name,
            currentWorkspace: workspace.name
        });
        return workspace;
    }
    /**
     * 获取当前工作空间
     */
    getCurrentWorkspace() {
        return this.currentWorkspace;
    }
    /**
     * 获取最近的工作空间
     */
    getRecentWorkspaces() {
        return [...this.recentWorkspaces];
    }
    /**
     * 添加项目到工作空间
     */
    addProjectToWorkspace(projectPath) {
        if (!this.currentWorkspace) {
            throw new Error('No current workspace');
        }
        if (!this.currentWorkspace.projects.includes(projectPath)) {
            this.currentWorkspace.projects.push(projectPath);
            this.currentWorkspace.updatedAt = new Date();
            this.emitEvent('projectAddedToWorkspace', {
                projectPath,
                workspaceName: this.currentWorkspace.name
            });
        }
    }
    /**
     * 从工作空间移除项目
     */
    removeProjectFromWorkspace(projectPath) {
        if (!this.currentWorkspace) {
            throw new Error('No current workspace');
        }
        const index = this.currentWorkspace.projects.indexOf(projectPath);
        if (index > -1) {
            this.currentWorkspace.projects.splice(index, 1);
            this.currentWorkspace.updatedAt = new Date();
            this.emitEvent('projectRemovedFromWorkspace', {
                projectPath,
                workspaceName: this.currentWorkspace.name
            });
        }
    }
    /**
     * 添加最近文件
     */
    addRecentFile(filePath, fileName, fileType) {
        if (!this.currentWorkspace) {
            return;
        }
        const recentFile = {
            path: filePath,
            name: fileName,
            type: fileType,
            lastOpened: new Date()
        };
        // 移除已存在的文件
        this.currentWorkspace.recentFiles = this.currentWorkspace.recentFiles.filter((file) => file.path !== filePath);
        // 添加到开头
        this.currentWorkspace.recentFiles.unshift(recentFile);
        // 限制最大数量
        if (this.currentWorkspace.recentFiles.length > this.config.workspace.maxRecentFiles) {
            this.currentWorkspace.recentFiles = this.currentWorkspace.recentFiles.slice(0, this.config.workspace.maxRecentFiles);
        }
        this.currentWorkspace.updatedAt = new Date();
    }
    /**
     * 更新工作空间设置
     */
    updateWorkspaceSettings(settings) {
        if (!this.currentWorkspace) {
            throw new Error('No current workspace');
        }
        this.currentWorkspace.settings = { ...this.currentWorkspace.settings, ...settings };
        this.currentWorkspace.updatedAt = new Date();
        this.emitEvent('workspaceSettingsUpdated', {
            settings: this.currentWorkspace.settings,
            workspaceName: this.currentWorkspace.name
        });
    }
    // ===== 私有方法 =====
    /**
     * 创建默认设置
     */
    createDefaultSettings() {
        return {
            theme: 'dark',
            fontSize: 14,
            tabSize: 2,
            wordWrap: true,
            showLineNumbers: true,
            showMinimap: true,
            autoSave: true,
            autoSaveDelay: 1000
        };
    }
    /**
     * 确保工作空间目录存在
     */
    async ensureWorkspaceDirectories() {
        const workspaceDir = this.config.workspace.defaultPath;
        await fs_1.promises.mkdir(workspaceDir, { recursive: true });
        const configDir = path.join(workspaceDir, '.mplp');
        await fs_1.promises.mkdir(configDir, { recursive: true });
    }
    /**
     * 加载最近的工作空间
     */
    async loadRecentWorkspaces() {
        try {
            const configPath = path.join(this.config.workspace.defaultPath, '.mplp', 'recent-workspaces.json');
            const content = await fs_1.promises.readFile(configPath, 'utf-8');
            this.recentWorkspaces = JSON.parse(content);
        }
        catch {
            // 文件不存在或无法读取，使用空数组
            this.recentWorkspaces = [];
        }
    }
    /**
     * 保存最近的工作空间
     */
    async saveRecentWorkspaces() {
        try {
            const configPath = path.join(this.config.workspace.defaultPath, '.mplp', 'recent-workspaces.json');
            await fs_1.promises.writeFile(configPath, JSON.stringify(this.recentWorkspaces, null, 2));
        }
        catch (error) {
            this.emitEvent('error', {
                error: error instanceof Error ? error.message : String(error),
                module: 'WorkspaceManager',
                context: 'saveRecentWorkspaces'
            });
        }
    }
    /**
     * 打开默认工作空间
     */
    async openDefaultWorkspace() {
        const defaultPath = this.config.workspace.defaultPath;
        try {
            // 尝试打开现有工作空间
            await this.openWorkspace(defaultPath);
        }
        catch {
            // 创建默认工作空间
            try {
                await this.createWorkspace('Default Workspace', defaultPath);
                await this.openWorkspace(defaultPath);
            }
            catch (error) {
                this.emitEvent('error', {
                    error: error instanceof Error ? error.message : String(error),
                    module: 'WorkspaceManager',
                    context: 'openDefaultWorkspace'
                });
            }
        }
    }
    /**
     * 添加到最近工作空间列表
     */
    addToRecentWorkspaces(workspacePath) {
        // 移除已存在的路径
        this.recentWorkspaces = this.recentWorkspaces.filter(path => path !== workspacePath);
        // 添加到开头
        this.recentWorkspaces.unshift(workspacePath);
        // 限制最大数量
        if (this.recentWorkspaces.length > 10) {
            this.recentWorkspaces = this.recentWorkspaces.slice(0, 10);
        }
    }
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    emitEvent(type, data) {
        this.eventManager.emitMPLP(type, 'WorkspaceManager', data);
    }
}
exports.WorkspaceManager = WorkspaceManager;
//# sourceMappingURL=WorkspaceManager.js.map