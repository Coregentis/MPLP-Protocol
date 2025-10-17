import { EventEmitter } from 'events';
import { Logger } from '../logging/Logger';
/**
 * Event filter function type
 */
export type EventFilter = (event: string, data: any) => boolean;
/**
 * Event handler function type
 */
export type EventHandler = (...args: any[]) => void | Promise<void>;
/**
 * Event middleware function type
 */
export type EventMiddleware = (event: string, data: any, next: () => void) => void | Promise<void>;
/**
 * Event subscription options
 */
export interface EventSubscriptionOptions {
    filter?: EventFilter;
    priority?: number;
    once?: boolean;
    async?: boolean;
    timeout?: number;
    retries?: number;
    tags?: string[];
}
/**
 * Event metadata
 */
export interface EventMetadata {
    id: string;
    event: string;
    timestamp: Date;
    source?: string;
    tags?: string[];
    data: any;
    processed: boolean;
    retryCount?: number;
    error?: string;
}
/**
 * Event statistics
 */
export interface EventStats {
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    averageProcessingTime: number;
    eventsByType: Record<string, number>;
    lastEventTime?: Date;
}
/**
 * Event persistence interface
 */
export interface EventPersistence {
    save(event: EventMetadata): Promise<void>;
    load(filter?: (event: EventMetadata) => boolean): Promise<EventMetadata[]>;
    remove(eventId: string): Promise<void>;
    clear(): Promise<void>;
}
/**
 * Enhanced Event Bus
 *
 * Advanced event system with filtering, async processing, persistence,
 * error recovery, middleware support, and comprehensive monitoring.
 */
export declare class EventBus extends EventEmitter {
    private logger?;
    private middleware;
    private eventFilters;
    private handlerOptions;
    private eventHistory;
    private persistence?;
    private stats;
    private processingQueue;
    private retryQueue;
    private retryTimer?;
    constructor(options?: {
        logger?: Logger;
        persistence?: EventPersistence;
        maxListeners?: number;
        enableHistory?: boolean;
        historyLimit?: number;
    });
    /**
     * Adds middleware to the event processing pipeline
     */
    use(middleware: EventMiddleware): void;
    /**
     * Adds an event filter for a specific event type
     */
    addFilter(event: string, filter: EventFilter): void;
    /**
     * Removes an event filter
     */
    removeFilter(event: string, filter: EventFilter): void;
    /**
     * Enhanced emit with filtering, middleware, and persistence
     */
    emit(event: string | symbol, ...args: any[]): boolean;
    /**
     * Registers an event listener with options
     */
    on(event: string | symbol, listener: EventHandler, options?: EventSubscriptionOptions): this;
    /**
     * Registers a one-time event listener with options
     */
    once(event: string | symbol, listener: EventHandler, options?: EventSubscriptionOptions): this;
    /**
     * Subscribes to events with advanced filtering and processing options
     */
    subscribe(event: string, listener: EventHandler, options?: EventSubscriptionOptions): () => void;
    /**
     * Subscribes to multiple events with the same handler
     */
    subscribeToMany(events: string[], listener: EventHandler, options?: EventSubscriptionOptions): () => void;
    /**
     * Emits an event asynchronously with middleware processing
     */
    emitAsync(event: string, ...args: any[]): Promise<void>;
    /**
     * Emits an event and waits for all async listeners to complete
     */
    emitAndWait(event: string, ...args: any[]): Promise<any[]>;
    /**
     * Removes an event listener
     */
    off(event: string | symbol, listener: EventHandler): this;
    /**
     * Gets event statistics
     */
    getStats(): EventStats;
    /**
     * Gets event history
     */
    getEventHistory(limit?: number): EventMetadata[];
    /**
     * Clears event history
     */
    clearHistory(): void;
    /**
     * Gets events from persistence storage
     */
    getPersistedEvents(filter?: (event: EventMetadata) => boolean): Promise<EventMetadata[]>;
    /**
     * Replays events from persistence or history
     */
    replayEvents(filter?: (event: EventMetadata) => boolean): Promise<number>;
    /**
     * Private helper methods
     */
    private generateEventId;
    private createWrappedListener;
    private passesFilters;
    private processEventWithMiddleware;
    private wrapListener;
    private executeWithTimeout;
    private updateStats;
    private updateProcessingTime;
    private setupEventHistory;
    private setupRetryProcessing;
    private addToRetryQueue;
    private processRetryQueue;
    /**
     * Cleanup resources
     */
    destroy(): void;
    /**
     * Removes all listeners for an event
     *
     * @param event - Event name (optional)
     */
    removeAllListeners(event?: string | symbol): this;
}
//# sourceMappingURL=EventBus.d.ts.map