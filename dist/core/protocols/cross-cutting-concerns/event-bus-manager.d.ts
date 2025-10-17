export interface MLPPEvent {
    id: string;
    type: string;
    timestamp: string;
    source: string;
    payload: Record<string, unknown>;
}
export type EventHandler = (event: MLPPEvent) => Promise<void> | void;
export declare class MLPPEventBusManager {
    private handlers;
    subscribe(eventType: string, handler: EventHandler): void;
    publish(event: MLPPEvent): Promise<void>;
    unsubscribe(eventType: string, handler: EventHandler): void;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=event-bus-manager.d.ts.map