/**
 * @fileoverview Studio Application - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构和管理器模式
 */
import { MPLPEventManager } from './MPLPEventManager';
import { StudioConfig, StudioState, Project, IStudioManager, StudioPreferences } from '../types/studio';
/**
 * Studio应用程序主控制器 - 基于MPLP V1.0 Alpha架构
 */
export declare class StudioApplication implements IStudioManager {
    private eventManager;
    private config;
    private state;
    private projectManager;
    private workspaceManager;
    private _isInitialized;
    constructor(config?: Partial<StudioConfig>);
    /**
     * EventEmitter兼容的on方法
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * EventEmitter兼容的off方法
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event?: string): this;
    /**
     * 初始化Studio应用程序
     */
    initialize(): Promise<void>;
    /**
     * 关闭Studio应用程序
     */
    shutdown(): Promise<void>;
    /**
     * 获取状态
     */
    getStatus(): string;
    /**
     * 创建新项目
     */
    createProject(name: string, template?: string): Promise<Project>;
    /**
     * 打开项目
     */
    openProject(projectPath: string): Promise<Project>;
    /**
     * 关闭项目
     */
    closeProject(projectId: string): Promise<void>;
    /**
     * 保存当前项目
     */
    saveCurrentProject(): Promise<void>;
    /**
     * 保存所有项目
     */
    saveAllProjects(): Promise<void>;
    /**
     * 获取配置
     */
    getConfig(): StudioConfig;
    /**
     * 获取事件管理器
     */
    getEventManager(): MPLPEventManager;
    /**
     * 更新配置
     */
    updateConfig(updates: Partial<StudioConfig>): void;
    /**
     * 获取状态
     */
    getState(): StudioState;
    /**
     * 切换项目
     */
    switchToProject(projectId: string): void;
    /**
     * 更新偏好设置
     */
    updatePreferences(preferences: Partial<StudioPreferences>): void;
    /**
     * 创建默认配置
     */
    private createDefaultConfig;
    /**
     * 创建初始状态
     */
    private createInitialState;
    /**
     * 设置事件处理器 - 基于MPLP V1.0 Alpha事件处理模式
     */
    private setupEventHandlers;
    /**
     * 发射Studio事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    private emitStudioEvent;
}
//# sourceMappingURL=StudioApplication.d.ts.map