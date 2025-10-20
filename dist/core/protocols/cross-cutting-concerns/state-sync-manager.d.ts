/**
 * MPLP状态同步管理器
 *
 * @description L3层统一状态同步，提供跨模块状态一致性保证
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
/**
 * 状态同步事件接口
 */
export interface StateSyncEvent {
    id: string;
    sourceModule: string;
    stateKey: string;
    oldValue: unknown;
    newValue: unknown;
    timestamp: string;
    version: number;
}
/**
 * 状态订阅者接口
 */
export interface StateSubscriber {
    module: string;
    stateKey: string;
    callback: (event: StateSyncEvent) => Promise<void> | void;
}
/**
 * MPLP状态同步管理器
 *
 * @description 统一的状态同步实现，等待CoreOrchestrator激活
 */
export declare class MLPPStateSyncManager {
    private state;
    private subscribers;
    private syncEvents;
    /**
     * 设置状态值
     */
    setState(_module: string, _stateKey: string, _value: unknown): Promise<void>;
    /**
     * 获取状态值
     */
    getState(_module: string, _stateKey: string): unknown;
    /**
     * 订阅状态变化
     */
    subscribeToState(_module: string, _stateKey: string, _callback: (event: StateSyncEvent) => Promise<void> | void): void;
    /**
     * 获取同步事件历史
     */
    getSyncEvents(_filter?: {
        module?: string;
        stateKey?: string;
    }): StateSyncEvent[];
    /**
     * 通知订阅者
     */
    private notifySubscribers;
    /**
     * 验证状态一致性
     */
    validateStateConsistency(): Promise<boolean>;
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=state-sync-manager.d.ts.map