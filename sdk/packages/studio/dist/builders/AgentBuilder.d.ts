/**
 * @fileoverview Agent Builder - 可视化Agent构建器
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha Agent架构
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { Agent, AgentConfig, Component, Connection, StudioConfig, IStudioManager } from '../types/studio';
/**
 * Agent构建器 - 基于MPLP V1.0 Alpha Agent构建模式
 * 提供拖拽式的可视化Agent设计和配置功能
 */
export declare class AgentBuilder implements IStudioManager {
    private eventManager;
    private config;
    private _isInitialized;
    private agents;
    private components;
    private connections;
    constructor(config: StudioConfig, eventManager: MPLPEventManager);
    /**
     * 获取状态
     */
    getStatus(): string;
    /**
     * 事件监听 - 委托给eventManager
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * 发射事件 - 委托给eventManager
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * 移除事件监听器 - 委托给eventManager
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * 移除所有事件监听器 - 委托给eventManager
     */
    removeAllListeners(event?: string): this;
    /**
     * 初始化Agent构建器
     */
    initialize(): Promise<void>;
    /**
     * 关闭Agent构建器
     */
    shutdown(): Promise<void>;
    /**
     * 创建新Agent
     */
    createAgent(name: string, config?: Partial<AgentConfig>): Promise<Agent>;
    /**
     * 获取Agent
     */
    getAgent(agentId: string): Agent | undefined;
    /**
     * 更新Agent
     */
    updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent>;
    /**
     * 删除Agent
     */
    deleteAgent(agentId: string): Promise<void>;
    /**
     * 获取所有Agent
     */
    getAllAgents(): Agent[];
    /**
     * 添加组件到Agent
     */
    addComponentToAgent(agentId: string, component: Component): Promise<void>;
    /**
     * 创建组件连接
     */
    createConnection(connection: Connection): Promise<void>;
    /**
     * 加载默认组件库
     */
    private loadDefaultComponents;
    /**
     * 发射事件 - 基于MPLP V1.0 Alpha事件发射模式
     */
    private emitEvent;
}
//# sourceMappingURL=AgentBuilder.d.ts.map