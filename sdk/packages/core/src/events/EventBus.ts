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
  priority?: number; // Higher numbers = higher priority
  once?: boolean;
  async?: boolean;
  timeout?: number; // in milliseconds
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
export class EventBus extends EventEmitter {
  private logger?: Logger;
  private middleware: EventMiddleware[] = [];
  private eventFilters: Map<string, EventFilter[]> = new Map();
  private handlerOptions: Map<Function, EventSubscriptionOptions> = new Map();
  private eventHistory: EventMetadata[] = [];
  private persistence?: EventPersistence;
  private stats: EventStats = {
    totalEvents: 0,
    processedEvents: 0,
    failedEvents: 0,
    averageProcessingTime: 0,
    eventsByType: {},
  };
  private processingQueue: Map<string, EventMetadata[]> = new Map();
  private retryQueue: EventMetadata[] = [];
  private retryTimer?: NodeJS.Timeout;

  constructor(
    options: {
      logger?: Logger;
      persistence?: EventPersistence;
      maxListeners?: number;
      enableHistory?: boolean;
      historyLimit?: number;
    } = {}
  ) {
    super();

    this.logger = options.logger;
    this.persistence = options.persistence;
    this.setMaxListeners(options.maxListeners || 100);

    // Setup retry processing
    this.setupRetryProcessing();

    if (options.enableHistory !== false) {
      this.setupEventHistory(options.historyLimit || 1000);
    }

    // Handle uncaught errors in event listeners
    this.on('error', error => {
      this.logger?.error('Uncaught error in event listener:', error);
    });
  }

  /**
   * Adds middleware to the event processing pipeline
   */
  use(middleware: EventMiddleware): void {
    this.middleware.push(middleware);
    this.logger?.debug(`Added event middleware (total: ${this.middleware.length})`);
  }

  /**
   * Adds an event filter for a specific event type
   */
  addFilter(event: string, filter: EventFilter): void {
    if (!this.eventFilters.has(event)) {
      this.eventFilters.set(event, []);
    }
    this.eventFilters.get(event)!.push(filter);
    this.logger?.debug(`Added filter for event: ${event}`);
  }

  /**
   * Removes an event filter
   */
  removeFilter(event: string, filter: EventFilter): void {
    const filters = this.eventFilters.get(event);
    if (filters) {
      const index = filters.indexOf(filter);
      if (index > -1) {
        filters.splice(index, 1);
        this.logger?.debug(`Removed filter for event: ${event}`);
      }
    }
  }

  /**
   * Enhanced emit with filtering, middleware, and persistence
   */
  override emit(event: string | symbol, ...args: any[]): boolean {
    if (typeof event !== 'string') {
      return super.emit(event, ...args);
    }

    const eventData = args.length === 1 ? args[0] : args;
    const eventId = this.generateEventId();

    // Create event metadata
    const metadata: EventMetadata = {
      id: eventId,
      event,
      timestamp: new Date(),
      data: eventData,
      processed: false,
      retryCount: 0,
    };

    // Update statistics
    this.updateStats(event);

    // Apply filters
    if (!this.passesFilters(event, eventData)) {
      this.logger?.debug(`Event ${event} filtered out`);
      return false;
    }

    // Get all listeners for this event
    const listeners = this.listeners(event) as EventHandler[];
    const hasListeners = listeners.length > 0;

    // Execute each listener individually with error handling
    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        this.logger?.error('Error in event listener:', error);
        // Continue with other listeners
      }
    }

    // Mark as processed
    metadata.processed = true;
    this.stats.processedEvents++;

    // Persist if enabled (async)
    if (this.persistence) {
      this.persistence.save(metadata).catch(error => {
        this.logger?.error('Failed to persist event:', error);
      });
    }

    return hasListeners;
  }

  /**
   * Registers an event listener with options
   */
  override on(event: string | symbol, listener: EventHandler, options?: EventSubscriptionOptions): this {
    if (typeof event !== 'string') {
      return super.on(event, listener);
    }

    // Store options for this handler
    if (options) {
      this.handlerOptions.set(listener, options);
    }

    // Wrap listener for async processing and error handling
    const wrappedListener = this.wrapListener(listener, options);

    return super.on(event, wrappedListener);
  }

  /**
   * Registers a one-time event listener with options
   */
  override once(event: string | symbol, listener: EventHandler, options?: EventSubscriptionOptions): this {
    if (typeof event !== 'string') {
      return super.once(event, listener);
    }

    const onceOptions = { ...options, once: true };
    return this.on(event, listener, onceOptions);
  }

  /**
   * Subscribes to events with advanced filtering and processing options
   */
  subscribe(event: string, listener: EventHandler, options: EventSubscriptionOptions = {}): () => void {
    // Create wrapped listener with options
    const wrappedListener = this.createWrappedListener(listener, options);

    // Always use on() since we handle once logic in the wrapped listener
    this.on(event, wrappedListener);

    // Return unsubscribe function
    return () => {
      this.off(event, wrappedListener);
    };
  }

  /**
   * Subscribes to multiple events with the same handler
   */
  subscribeToMany(events: string[], listener: EventHandler, options?: EventSubscriptionOptions): () => void {
    const unsubscribeFunctions = events.map(event => this.subscribe(event, listener, options));

    return () => {
      unsubscribeFunctions.forEach(unsub => unsub());
    };
  }

  /**
   * Emits an event asynchronously with middleware processing
   */
  async emitAsync(event: string, ...args: any[]): Promise<void> {
    const eventData = args.length === 1 ? args[0] : args;
    const eventId = this.generateEventId();

    // Create event metadata
    const metadata: EventMetadata = {
      id: eventId,
      event,
      timestamp: new Date(),
      data: eventData,
      processed: false,
      retryCount: 0,
    };

    // Update statistics
    this.updateStats(event);

    // Apply filters
    if (!this.passesFilters(event, eventData)) {
      this.logger?.debug(`Event ${event} filtered out`);
      return;
    }

    try {
      // Process through middleware
      await this.processEventWithMiddleware(metadata);

      // Emit the actual event
      super.emit(event, ...args);

      // Mark as processed
      metadata.processed = true;
      this.stats.processedEvents++;

      // Persist if enabled
      if (this.persistence) {
        await this.persistence.save(metadata);
      }
    } catch (error) {
      this.logger?.error(`Error processing async event ${event}:`, error);
      metadata.error = error instanceof Error ? error.message : String(error);
      this.stats.failedEvents++;

      // Add to retry queue if retries are configured
      this.addToRetryQueue(metadata);

      throw error;
    }
  }

  /**
   * Emits an event and waits for all async listeners to complete
   */
  async emitAndWait(event: string, ...args: any[]): Promise<any[]> {
    const listeners = this.listeners(event) as EventHandler[];
    const results: any[] = [];

    for (const listener of listeners) {
      try {
        const result = await listener(...args);
        results.push(result);
      } catch (error) {
        this.logger?.error(`Error in listener for event ${event}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Removes an event listener
   */
  override off(event: string | symbol, listener: EventHandler): this {
    // Clean up handler options
    this.handlerOptions.delete(listener);
    return super.off(event, listener);
  }

  /**
   * Gets event statistics
   */
  getStats(): EventStats {
    return { ...this.stats };
  }

  /**
   * Gets event history
   */
  getEventHistory(limit?: number): EventMetadata[] {
    return limit ? this.eventHistory.slice(-limit) : [...this.eventHistory];
  }

  /**
   * Clears event history
   */
  clearHistory(): void {
    this.eventHistory = [];
    this.logger?.debug('Event history cleared');
  }

  /**
   * Gets events from persistence storage
   */
  async getPersistedEvents(filter?: (event: EventMetadata) => boolean): Promise<EventMetadata[]> {
    if (!this.persistence) {
      throw new Error('Event persistence not configured');
    }
    return this.persistence.load(filter);
  }

  /**
   * Replays events from persistence or history
   */
  async replayEvents(filter?: (event: EventMetadata) => boolean): Promise<number> {
    let events: EventMetadata[];

    if (this.persistence) {
      events = await this.persistence.load(filter);
    } else {
      events = filter ? this.eventHistory.filter(filter) : this.eventHistory;
    }

    let replayedCount = 0;
    for (const event of events) {
      try {
        // Spread the data array if it's an array, otherwise pass as single argument
        if (Array.isArray(event.data)) {
          this.emit(event.event, ...event.data);
        } else {
          this.emit(event.event, event.data);
        }
        replayedCount++;
      } catch (error) {
        this.logger?.error(`Failed to replay event ${event.id}:`, error);
      }
    }

    this.logger?.info(`Replayed ${replayedCount} events`);
    return replayedCount;
  }

  /**
   * Private helper methods
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private createWrappedListener(listener: EventHandler, options: EventSubscriptionOptions): EventHandler {
    let hasBeenCalled = false;

    return (...args: any[]) => {
      // Handle once option
      if (options.once && hasBeenCalled) {
        return;
      }

      // Apply filter if provided
      if (options.filter) {
        // For EventEmitter, args don't include event name, so we need to pass it separately
        // We'll use a placeholder event name for now
        const data = args.length === 1 ? args[0] : args;
        if (!options.filter('', data)) {
          return;
        }
      }

      // Mark as called for once option
      if (options.once) {
        hasBeenCalled = true;
      }

      // Apply timeout if provided
      if (options.timeout) {
        this.executeWithTimeout(listener, args, options.timeout).catch(error => {
          this.logger?.error('Error in event listener:', error);
        });
        return;
      }

      // Execute listener normally
      return listener(...args);
    };
  }

  private passesFilters(event: string, data: any): boolean {
    const filters = this.eventFilters.get(event);
    if (!filters || filters.length === 0) {
      return true;
    }

    return filters.every(filter => {
      try {
        return filter(event, data);
      } catch (error) {
        this.logger?.error(`Error in event filter for ${event}:`, error);
        return false;
      }
    });
  }

  private async processEventWithMiddleware(metadata: EventMetadata): Promise<void> {
    let index = 0;

    const next = async (): Promise<void> => {
      if (index >= this.middleware.length) {
        return;
      }

      const middleware = this.middleware[index++];
      await middleware(metadata.event, metadata.data, next);
    };

    await next();
  }

  private wrapListener(listener: EventHandler, options?: EventSubscriptionOptions): EventHandler {
    return async (...args: any[]) => {
      const startTime = Date.now();

      try {
        // Apply filter if specified
        if (options?.filter && !options.filter(args[0], args.slice(1))) {
          return;
        }

        // Handle timeout
        if (options?.timeout) {
          await this.executeWithTimeout(listener, args, options.timeout);
        } else {
          await listener(...args);
        }

        // Update processing time stats
        const processingTime = Date.now() - startTime;
        this.updateProcessingTime(processingTime);
      } catch (error) {
        this.logger?.error('Error in event listener:', error);

        // Handle retries
        if (options?.retries && options.retries > 0) {
          // Implement retry logic here
          this.logger?.info(`Retrying event listener (${options.retries} retries left)`);
        }

        throw error;
      }
    };
  }

  private async executeWithTimeout(listener: EventHandler, args: any[], timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let isResolved = false;

      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          reject(new Error(`Event listener timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      Promise.resolve(listener(...args))
        .then(() => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            resolve();
          }
        })
        .catch(error => {
          if (!isResolved) {
            isResolved = true;
            clearTimeout(timeout);
            reject(error);
          }
        });
    });
  }

  private updateStats(event: string): void {
    this.stats.totalEvents++;
    this.stats.eventsByType[event] = (this.stats.eventsByType[event] || 0) + 1;
    this.stats.lastEventTime = new Date();
  }

  private updateProcessingTime(processingTime: number): void {
    const totalTime = this.stats.averageProcessingTime * (this.stats.processedEvents - 1) + processingTime;
    this.stats.averageProcessingTime = totalTime / this.stats.processedEvents;
  }

  private setupEventHistory(limit: number): void {
    // Override emit to capture all events for history
    const originalEmit = this.emit.bind(this);
    this.emit = (event: string | symbol, ...args: any[]): boolean => {
      try {
        const result = originalEmit(event, ...args);

        // Only record string events in history
        if (typeof event === 'string') {
          const metadata: EventMetadata = {
            id: this.generateEventId(),
            event,
            timestamp: new Date(),
            data: args,
            processed: true,
          };

          this.eventHistory.push(metadata);

          // Maintain history limit
          if (this.eventHistory.length > limit) {
            this.eventHistory.shift();
          }
        }

        return result;
      } catch (error) {
        // Handle errors from listeners
        this.logger?.error('Error in event listener:', error);
        // Don't re-throw the error to prevent it from bubbling up
        return false;
      }
    };
  }

  private setupRetryProcessing(): void {
    this.retryTimer = setInterval(() => {
      this.processRetryQueue();
    }, 5000); // Process retry queue every 5 seconds
  }

  private addToRetryQueue(metadata: EventMetadata): void {
    const options = Array.from(this.handlerOptions.values()).find(opt => opt.retries && opt.retries > 0);
    if (options && metadata.retryCount! < options.retries!) {
      metadata.retryCount = (metadata.retryCount || 0) + 1;
      this.retryQueue.push(metadata);
      this.logger?.debug(`Added event ${metadata.id} to retry queue (attempt ${metadata.retryCount})`);
    }
  }

  private async processRetryQueue(): Promise<void> {
    const eventsToRetry = this.retryQueue.splice(0); // Take all events

    for (const event of eventsToRetry) {
      try {
        this.emit(event.event, event.data);
        this.logger?.debug(`Successfully retried event ${event.id}`);
      } catch (error) {
        this.logger?.error(`Retry failed for event ${event.id}:`, error);

        // Add back to queue if more retries available
        const options = Array.from(this.handlerOptions.values()).find(opt => opt.retries && opt.retries > 0);
        if (options && event.retryCount! < options.retries!) {
          this.addToRetryQueue(event);
        }
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = undefined;
    }

    this.removeAllListeners();
    this.middleware = [];
    this.eventFilters.clear();
    this.handlerOptions.clear();
    this.eventHistory = [];
    this.retryQueue = [];

    this.logger?.info('EventBus destroyed');
  }

  /**
   * Removes all listeners for an event
   *
   * @param event - Event name (optional)
   */
  override removeAllListeners(event?: string | symbol): this {
    return super.removeAllListeners(event);
  }
}
