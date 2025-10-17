export interface StateSyncEvent {
    id: string;
    sourceModule: string;
    stateKey: string;
    oldValue: unknown;
    newValue: unknown;
    timestamp: string;
    version: number;
}
export interface StateSubscriber {
    module: string;
    stateKey: string;
    callback: (event: StateSyncEvent) => Promise<void> | void;
}
export declare class MLPPStateSyncManager {
    private state;
    private subscribers;
    private syncEvents;
    setState(_module: string, _stateKey: string, _value: unknown): Promise<void>;
    getState(_module: string, _stateKey: string): unknown;
    subscribeToState(_module: string, _stateKey: string, _callback: (event: StateSyncEvent) => Promise<void> | void): void;
    getSyncEvents(_filter?: {
        module?: string;
        stateKey?: string;
    }): StateSyncEvent[];
    private notifySubscribers;
    validateStateConsistency(): Promise<boolean>;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=state-sync-manager.d.ts.map