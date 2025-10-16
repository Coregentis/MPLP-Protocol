/**
 * @fileoverview Workspace Manager - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha工作空间管理架构
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { MPLPEventManager } from '../core/MPLPEventManager';
import { 
  StudioConfig, 
  WorkspaceConfig, 
  WorkspaceSettings,
  RecentFile,
  IStudioManager
} from '../types/studio';

/**
 * 工作空间管理器 - 基于MPLP V1.0 Alpha管理器架构
 */
export class WorkspaceManager implements IStudioManager {
  private eventManager: MPLPEventManager;
  private config: StudioConfig;
  private currentWorkspace: WorkspaceConfig | null = null;
  private recentWorkspaces: string[] = [];
  private _isInitialized = false;

  constructor(config: StudioConfig, eventManager: MPLPEventManager) {
    this.config = config;
    this.eventManager = eventManager;
  }

  // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====

  /**
   * EventEmitter兼容的on方法
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的emit方法
   */
  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  /**
   * EventEmitter兼容的off方法
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的removeAllListeners方法
   */
  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  // ===== 核心生命周期方法 - 基于MPLP V1.0 Alpha生命周期模式 =====

  /**
   * 初始化工作空间管理器
   */
  public async initialize(): Promise<void> {
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
    } catch (error) {
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
  public async shutdown(): Promise<void> {
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
    } catch (error) {
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
  public getStatus(): string {
    return this._isInitialized ? 'initialized' : 'not_initialized';
  }

  // ===== 工作空间管理方法 - 基于MPLP V1.0 Alpha工作空间管理模式 =====

  /**
   * 创建新工作空间
   */
  public async createWorkspace(name: string, workspacePath: string): Promise<WorkspaceConfig> {
    if (!this._isInitialized) {
      throw new Error('WorkspaceManager not initialized');
    }

    const workspace: WorkspaceConfig = {
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
    await fs.mkdir(workspacePath, { recursive: true });
    
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
  public async openWorkspace(workspacePath: string): Promise<WorkspaceConfig> {
    if (!this._isInitialized) {
      throw new Error('WorkspaceManager not initialized');
    }

    try {
      const configPath = path.join(workspacePath, '.mplp', 'workspace.json');
      const configContent = await fs.readFile(configPath, 'utf-8');
      const workspace: WorkspaceConfig = JSON.parse(configContent);
      
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
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error.message : String(error),
        module: 'WorkspaceManager',
        context: 'openWorkspace',
        workspacePath 
      });
      throw new Error(`Failed to open workspace: ${(error as Error).message}`);
    }
  }

  /**
   * 保存工作空间
   */
  public async saveWorkspace(workspace: WorkspaceConfig): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('WorkspaceManager not initialized');
    }

    try {
      workspace.updatedAt = new Date();
      
      const configDir = path.join(workspace.path, '.mplp');
      const configPath = path.join(configDir, 'workspace.json');
      
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(configPath, JSON.stringify(workspace, null, 2));
      
      this.emitEvent('workspaceSaved', { 
        workspaceName: workspace.name,
        workspacePath: workspace.path 
      });
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error.message : String(error),
        module: 'WorkspaceManager',
        context: 'saveWorkspace',
        workspaceName: workspace.name 
      });
      throw new Error(`Failed to save workspace: ${(error as Error).message}`);
    }
  }

  /**
   * 切换工作空间
   */
  public async switchWorkspace(workspacePath: string): Promise<WorkspaceConfig> {
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
  public getCurrentWorkspace(): WorkspaceConfig | null {
    return this.currentWorkspace;
  }

  /**
   * 获取最近的工作空间
   */
  public getRecentWorkspaces(): string[] {
    return [...this.recentWorkspaces];
  }

  /**
   * 获取所有工作空间（当前实现返回最近的工作空间）
   */
  public getWorkspaces(): { current: WorkspaceConfig | null; recent: string[] } {
    return {
      current: this.currentWorkspace,
      recent: this.getRecentWorkspaces()
    };
  }

  /**
   * 添加项目到工作空间
   */
  public addProjectToWorkspace(projectPath: string): void {
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
  public removeProjectFromWorkspace(projectPath: string): void {
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
  public addRecentFile(filePath: string, fileName: string, fileType: RecentFile['type']): void {
    if (!this.currentWorkspace) {
      return;
    }

    const recentFile: RecentFile = {
      path: filePath,
      name: fileName,
      type: fileType,
      lastOpened: new Date()
    };

    // 移除已存在的文件
    this.currentWorkspace.recentFiles = this.currentWorkspace.recentFiles.filter(
      (file: RecentFile) => file.path !== filePath
    );

    // 添加到开头
    this.currentWorkspace.recentFiles.unshift(recentFile);

    // 限制最大数量
    if (this.currentWorkspace.recentFiles.length > this.config.workspace.maxRecentFiles) {
      this.currentWorkspace.recentFiles = this.currentWorkspace.recentFiles.slice(
        0, 
        this.config.workspace.maxRecentFiles
      );
    }

    this.currentWorkspace.updatedAt = new Date();
  }

  /**
   * 更新工作空间设置
   */
  public updateWorkspaceSettings(settings: Partial<WorkspaceSettings>): void {
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
  private createDefaultSettings(): WorkspaceSettings {
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
  private async ensureWorkspaceDirectories(): Promise<void> {
    const workspaceDir = this.config.workspace.defaultPath;
    await fs.mkdir(workspaceDir, { recursive: true });
    
    const configDir = path.join(workspaceDir, '.mplp');
    await fs.mkdir(configDir, { recursive: true });
  }

  /**
   * 加载最近的工作空间
   */
  private async loadRecentWorkspaces(): Promise<void> {
    try {
      const configPath = path.join(this.config.workspace.defaultPath, '.mplp', 'recent-workspaces.json');
      const content = await fs.readFile(configPath, 'utf-8');
      this.recentWorkspaces = JSON.parse(content);
    } catch {
      // 文件不存在或无法读取，使用空数组
      this.recentWorkspaces = [];
    }
  }

  /**
   * 保存最近的工作空间
   */
  private async saveRecentWorkspaces(): Promise<void> {
    try {
      const configPath = path.join(this.config.workspace.defaultPath, '.mplp', 'recent-workspaces.json');
      await fs.writeFile(configPath, JSON.stringify(this.recentWorkspaces, null, 2));
    } catch (error) {
      this.emitEvent('error', { 
        error: error instanceof Error ? error.message : String(error),
        module: 'WorkspaceManager',
        context: 'saveRecentWorkspaces'
      });
    }
  }

  /**
   * 直接创建工作空间（用于初始化期间）
   */
  private async createWorkspaceDirect(name: string, workspacePath: string): Promise<WorkspaceConfig> {
    const workspace: WorkspaceConfig = {
      name,
      path: workspacePath,
      projects: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        theme: 'light',
        fontSize: 14,
        tabSize: 2,
        wordWrap: true,
        showLineNumbers: true,
        showMinimap: false,
        autoSave: true,
        autoSaveDelay: 30000
      },
      recentFiles: [],
      bookmarks: []
    };

    try {
      // 创建工作空间目录结构
      await this.createWorkspaceStructure(workspace);

      // 保存工作空间配置
      const configPath = path.join(workspacePath, '.mplp', 'workspace.json');
      await fs.writeFile(configPath, JSON.stringify(workspace, null, 2));

      this.emitEvent('workspaceCreated', {
        workspaceName: name,
        workspacePath
      });

      return workspace;
    } catch (error) {
      this.emitEvent('error', {
        error: error instanceof Error ? error.message : String(error),
        module: 'WorkspaceManager',
        context: 'createWorkspaceDirect',
        workspacePath
      });
      throw new Error(`Failed to create workspace: ${(error as Error).message}`);
    }
  }

  /**
   * 直接打开工作空间（用于初始化期间）
   */
  private async openWorkspaceDirect(workspacePath: string): Promise<WorkspaceConfig> {
    try {
      const configPath = path.join(workspacePath, '.mplp', 'workspace.json');
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config: WorkspaceConfig = JSON.parse(configContent);

      // 转换日期字符串为Date对象
      config.createdAt = new Date(config.createdAt);
      config.updatedAt = new Date(config.updatedAt);

      this.currentWorkspace = config;
      this.emitEvent('workspaceOpened', {
        workspaceName: config.name,
        workspacePath
      });

      return config;
    } catch (error) {
      this.emitEvent('error', {
        error: error instanceof Error ? error.message : String(error),
        module: 'WorkspaceManager',
        context: 'openWorkspaceDirect',
        workspacePath
      });
      throw new Error(`Failed to open workspace: ${(error as Error).message}`);
    }
  }

  /**
   * 打开默认工作空间
   */
  private async openDefaultWorkspace(): Promise<void> {
    const defaultPath = this.config.workspace.defaultPath;
    
    try {
      // 尝试打开现有工作空间
      await this.openWorkspaceDirect(defaultPath);
    } catch {
      // 创建默认工作空间
      try {
        await this.createWorkspaceDirect('Default Workspace', defaultPath);
        await this.openWorkspaceDirect(defaultPath);
      } catch (error) {
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
  private addToRecentWorkspaces(workspacePath: string): void {
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
   * 创建工作空间目录结构
   */
  private async createWorkspaceStructure(workspace: WorkspaceConfig): Promise<void> {
    const dirs = [
      workspace.path,
      path.join(workspace.path, '.mplp'),
      path.join(workspace.path, 'projects'),
      path.join(workspace.path, 'templates'),
      path.join(workspace.path, 'settings')
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
   */
  private emitEvent(type: string, data: Record<string, any>): void {
    this.eventManager.emitMPLP(type, 'WorkspaceManager', data);
  }
}
