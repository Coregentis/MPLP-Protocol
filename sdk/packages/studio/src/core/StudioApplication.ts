/**
 * @fileoverview Studio Application - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构和管理器模式
 */

import { MPLPEventManager } from './MPLPEventManager';
import { 
  StudioConfig, 
  StudioState, 
  Project, 
  IStudioManager,
  StudioEventType,
  StudioPreferences
} from '../types/studio';
import { ProjectManager } from '../project/ProjectManager';
import { WorkspaceManager } from '../workspace/WorkspaceManager';

/**
 * Studio应用程序主控制器 - 基于MPLP V1.0 Alpha架构
 */
export class StudioApplication implements IStudioManager {
  private eventManager: MPLPEventManager;
  private config: StudioConfig;
  private state: StudioState;
  private projectManager: ProjectManager;
  private workspaceManager: WorkspaceManager;
  private _isInitialized = false;

  constructor(config: Partial<StudioConfig> = {}) {
    this.eventManager = new MPLPEventManager();
    this.config = this.createDefaultConfig(config);
    this.state = this.createInitialState();
    
    // 初始化管理器 - 基于MPLP V1.0 Alpha依赖注入模式
    this.projectManager = new ProjectManager(this.config, this.eventManager);
    this.workspaceManager = new WorkspaceManager(this.config, this.eventManager);

    this.setupEventHandlers();
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
   * 初始化Studio应用程序
   */
  public async initialize(): Promise<void> {
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
    } catch (error) {
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
  public async shutdown(): Promise<void> {
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
    } catch (error) {
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
  public getStatus(): string {
    if (!this._isInitialized) return 'not_initialized';
    if (!this.state.isRunning) return 'stopped';
    return 'running';
  }

  // ===== 项目管理方法 - 基于MPLP V1.0 Alpha项目管理模式 =====

  /**
   * 创建新项目
   */
  public async createProject(name: string, template?: string): Promise<Project> {
    const project = await this.projectManager.createProject(name, template);
    this.state.openProjects.push(project);
    this.emitStudioEvent('projectCreated', { projectId: project.id, projectName: project.name });
    return project;
  }

  /**
   * 打开项目
   */
  public async openProject(projectPath: string): Promise<Project> {
    const project = await this.projectManager.openProject(projectPath);
    
    // 添加到打开的项目列表
    const existingIndex = this.state.openProjects.findIndex(p => p.id === project.id);
    if (existingIndex === -1) {
      this.state.openProjects.push(project);
    } else {
      this.state.openProjects[existingIndex] = project;
    }
    
    this.state.currentProject = project;
    this.emitStudioEvent('projectOpened', { projectId: project.id, projectName: project.name });
    return project;
  }

  /**
   * 关闭项目
   */
  public async closeProject(projectId: string): Promise<void> {
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
  public async saveCurrentProject(): Promise<void> {
    if (!this.state.currentProject) {
      throw new Error('No current project to save');
    }
    
    await this.projectManager.saveProject(this.state.currentProject);
    this.emitStudioEvent('projectSaved', { projectId: this.state.currentProject.id });
  }

  /**
   * 保存所有项目
   */
  public async saveAllProjects(): Promise<void> {
    const savePromises = this.state.openProjects.map(project =>
      this.projectManager.saveProject(project)
    );

    await Promise.all(savePromises);
    this.emitStudioEvent('allProjectsSaved', { count: this.state.openProjects.length });
  }

  /**
   * 获取项目管理器
   */
  public getProjectManager(): ProjectManager {
    return this.projectManager;
  }

  /**
   * 获取工作空间管理器
   */
  public getWorkspaceManager(): WorkspaceManager {
    return this.workspaceManager;
  }

  // ===== 配置和状态管理 - 基于MPLP V1.0 Alpha配置模式 =====

  /**
   * 获取配置
   */
  public getConfig(): StudioConfig {
    return { ...this.config };
  }

  /**
   * 获取事件管理器
   */
  public getEventManager(): MPLPEventManager {
    return this.eventManager;
  }

  /**
   * 更新配置
   */
  public updateConfig(updates: Partial<StudioConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emitStudioEvent('configUpdated', { updates });
  }

  /**
   * 获取状态
   */
  public getState(): StudioState {
    return { ...this.state };
  }

  /**
   * 切换项目
   */
  public switchToProject(projectId: string): void {
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
  public updatePreferences(preferences: Partial<StudioPreferences>): void {
    this.state.preferences = { ...this.state.preferences, ...preferences };
    this.emitStudioEvent('preferencesUpdated', { preferences: this.state.preferences });
  }

  // ===== 私有方法 =====

  /**
   * 创建默认配置
   */
  private createDefaultConfig(config: Partial<StudioConfig>): StudioConfig {
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
  private createInitialState(): StudioState {
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
  private setupEventHandlers(): void {
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
      } catch (emitError) {
        console.error('Failed to emit error event:', emitError);
      }
    });
  }

  /**
   * 发射Studio事件 - 基于MPLP V1.0 Alpha事件发射模式
   */
  private emitStudioEvent(type: StudioEventType, data: Record<string, any>): void {
    this.eventManager.emitMPLP(type, 'StudioApplication', data);
  }
}
