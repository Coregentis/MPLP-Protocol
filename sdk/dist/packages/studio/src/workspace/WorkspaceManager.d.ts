/**
 * @fileoverview Workspace Manager - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha工作空间管理架构
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig, WorkspaceConfig, WorkspaceSettings, RecentFile, IStudioManager } from '../types/studio';
/**
 * 工作空间管理器 - 基于MPLP V1.0 Alpha管理器架构
 */
export declare class WorkspaceManager implements IStudioManager {
    private eventManager;
    private config;
    private currentWorkspace;
    private recentWorkspaces;
    private _isInitialized;
    constructor(config: StudioConfig, eventManager: MPLPEventManager);
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
     * 初始化工作空间管理器
     */
    initialize(): Promise<void>;
    /**
     * 关闭工作空间管理器
     */
    shutdown(): Promise<void>;
    /**
     * 获取状态
     */
    getStatus(): string;
    /**
     * 创建新工作空间
     */
    createWorkspace(name: string, workspacePath: string): Promise<WorkspaceConfig>;
    /**
     * 打开工作空间
     */
    openWorkspace(workspacePath: string): Promise<WorkspaceConfig>;
    /**
     * 保存工作空间
     */
    saveWorkspace(workspace: WorkspaceConfig): Promise<void>;
    /**
     * 切换工作空间
     */
    switchWorkspace(workspacePath: string): Promise<WorkspaceConfig>;
    /**
     * 获取当前工作空间
     */
    getCurrentWorkspace(): WorkspaceConfig | null;
    /**
     * 获取最近的工作空间
     */
    getRecentWorkspaces(): string[];
    /**
     * 添加项目到工作空间
     */
    addProjectToWorkspace(projectPath: string): void;
    /**
     * 从工作空间移除项目
     */
    removeProjectFromWorkspace(projectPath: string): void;
    /**
     * 添加最近文件
     */
    addRecentFile(filePath: string, fileName: string, fileType: RecentFile['type']): void;
    /**
     * 更新工作空间设置
     */
    updateWorkspaceSettings(settings: Partial<WorkspaceSettings>): void;
    /**
     * 创建默认设置
     */
    private createDefaultSettings;
    /**
     * 确保工作空间目录存在
     */
    private ensureWorkspaceDirectories;
    /**
     * 加载最近的工作空间
     */
    private loadRecentWorkspaces;
    /**
     * 保存最近的工作空间
     */
    private saveRecentWorkspaces;
    /**
     * 打开默认工作空间
     */
    private openDefaultWorkspace;
    /**
     * 添加到最近工作空间列表
     */
    private addToRecentWorkspaces;
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    private emitEvent;
}
//# sourceMappingURL=WorkspaceManager.d.ts.map