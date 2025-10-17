/**
 * @fileoverview MPLP Event Manager - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
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
 * MPLP Event Manager - 统一事件管理系统
 * 基于MPLP V1.0 Alpha的MLPPEventBusManager架构设计
 */
export declare class MPLPEventManager implements MPLPEventEmitter {
    private handlers;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    removeAllListeners(event?: string): this;
    listenerCount(event: string): number;
    eventNames(): string[];
}
//# sourceMappingURL=EventEmitter.d.ts.map