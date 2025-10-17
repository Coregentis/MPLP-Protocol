/**
 * @fileoverview Project Manager - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha项目管理架构
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig, Project, IStudioManager } from '../types/studio';
/**
 * 项目管理器 - 基于MPLP V1.0 Alpha管理器架构
 */
export declare class ProjectManager implements IStudioManager {
    private eventManager;
    private config;
    private projects;
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
     * 初始化项目管理器
     */
    initialize(): Promise<void>;
    /**
     * 关闭项目管理器
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
     * 保存项目
     */
    saveProject(project: Project): Promise<void>;
    /**
     * 删除项目
     */
    deleteProject(projectId: string): Promise<void>;
    /**
     * 获取所有项目
     */
    getProjects(): Project[];
    /**
     * 获取项目
     */
    getProject(projectId: string): Project | undefined;
    /**
     * 生成项目ID
     */
    private generateProjectId;
    /**
     * 创建默认元数据
     */
    private createDefaultMetadata;
    /**
     * 确保项目目录存在
     */
    private ensureProjectDirectories;
    /**
     * 加载现有项目
     */
    private loadExistingProjects;
    /**
     * 创建项目目录结构
     */
    private createProjectStructure;
    /**
     * 保存所有项目
     */
    private saveAllProjects;
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    private emitEvent;
}
//# sourceMappingURL=ProjectManager.d.ts.map