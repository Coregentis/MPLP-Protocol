/**
 * MPLP事件管理器 - Studio包版本
 *
 * @description 继承MPLP V1.0 Alpha的成功事件架构，提供EventEmitter兼容的API
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha MLPPEventBusManager
 * @package @mplp/studio
 */
/**
 * MPLP事件接口 - 继承V1.0 Alpha标准
 */
export interface MPLPEvent {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    payload: Record<string, unknown>;
}
/**
 * 事件处理器类型
 */
export type MPLPEventHandler = (event: MPLPEvent) => Promise<void> | void;
/**
 * EventEmitter兼容的事件处理器
 */
export type EventEmitterHandler = (...args: any[]) => void;
/**
 * EventEmitter兼容接口 - 基于MPLP V1.0 Alpha架构
 */
export interface MPLPEventEmitter {
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    off(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
}
/**
 * MPLP事件管理器 - EventEmitter兼容版本
 *
 * @description 基于MPLP V1.0 Alpha的MLPPEventBusManager，提供EventEmitter兼容的API
 */
export declare class MPLPEventManager implements MPLPEventEmitter {
    private handlers;
    private mplpHandlers;
    private eventIdCounter;
    /**
     * EventEmitter兼容的on方法
     */
    on(event: string, listener: EventEmitterHandler): this;
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * EventEmitter兼容的off方法
     */
    off(event: string, listener: EventEmitterHandler): this;
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event?: string): this;
    /**
     * MPLP V1.0 Alpha兼容的subscribe方法
     */
    subscribe(eventType: string, handler: MPLPEventHandler): void;
    /**
     * MPLP V1.0 Alpha兼容的publish方法
     */
    publish(event: MPLPEvent): Promise<void>;
    /**
     * MPLP V1.0 Alpha兼容的unsubscribe方法
     */
    unsubscribe(eventType: string, handler: MPLPEventHandler): void;
    /**
     * 创建MPLP事件
     */
    createMPLPEvent(type: string, source: string, payload: Record<string, unknown>): MPLPEvent;
    /**
     * 混合发布 - 同时支持EventEmitter和MPLP事件
     */
    emitMPLP(type: string, source: string, payload: Record<string, unknown>): void;
    /**
     * 健康检查 - 继承V1.0 Alpha标准
     */
    healthCheck(): Promise<boolean>;
    /**
     * 获取事件统计
     */
    getEventStats(): {
        eventEmitterEvents: number;
        mplpEvents: number;
    };
}
//# sourceMappingURL=MPLPEventManager.d.ts.map