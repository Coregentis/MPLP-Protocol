/**
 * @fileoverview Simple EventEmitter implementation
 * Temporary implementation until eventemitter3 dependency is resolved
 */
export declare class SimpleEventEmitter {
    private events;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    removeAllListeners(event?: string): this;
    listenerCount(event: string): number;
    eventNames(): string[];
}
//# sourceMappingURL=EventEmitter.d.ts.map