"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const events_1 = require("events");
/**
 * Enhanced Event Bus
 *
 * Advanced event system with filtering, async processing, persistence,
 * error recovery, middleware support, and comprehensive monitoring.
 */
class EventBus extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.middleware = [];
        this.eventFilters = new Map();
        this.handlerOptions = new Map();
        this.eventHistory = [];
        this.stats = {
            totalEvents: 0,
            processedEvents: 0,
            failedEvents: 0,
            averageProcessingTime: 0,
            eventsByType: {},
        };
        this.processingQueue = new Map();
        this.retryQueue = [];
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
    use(middleware) {
        this.middleware.push(middleware);
        this.logger?.debug(`Added event middleware (total: ${this.middleware.length})`);
    }
    /**
     * Adds an event filter for a specific event type
     */
    addFilter(event, filter) {
        if (!this.eventFilters.has(event)) {
            this.eventFilters.set(event, []);
        }
        this.eventFilters.get(event).push(filter);
        this.logger?.debug(`Added filter for event: ${event}`);
    }
    /**
     * Removes an event filter
     */
    removeFilter(event, filter) {
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
    emit(event, ...args) {
        if (typeof event !== 'string') {
            return super.emit(event, ...args);
        }
        const eventData = args.length === 1 ? args[0] : args;
        const eventId = this.generateEventId();
        // Create event metadata
        const metadata = {
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
        const listeners = this.listeners(event);
        const hasListeners = listeners.length > 0;
        // Execute each listener individually with error handling
        for (const listener of listeners) {
            try {
                listener(...args);
            }
            catch (error) {
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
    on(event, listener, options) {
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
    once(event, listener, options) {
        if (typeof event !== 'string') {
            return super.once(event, listener);
        }
        const onceOptions = { ...options, once: true };
        return this.on(event, listener, onceOptions);
    }
    /**
     * Subscribes to events with advanced filtering and processing options
     */
    subscribe(event, listener, options = {}) {
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
    subscribeToMany(events, listener, options) {
        const unsubscribeFunctions = events.map(event => this.subscribe(event, listener, options));
        return () => {
            unsubscribeFunctions.forEach(unsub => unsub());
        };
    }
    /**
     * Emits an event asynchronously with middleware processing
     */
    async emitAsync(event, ...args) {
        const eventData = args.length === 1 ? args[0] : args;
        const eventId = this.generateEventId();
        // Create event metadata
        const metadata = {
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
        }
        catch (error) {
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
    async emitAndWait(event, ...args) {
        const listeners = this.listeners(event);
        const results = [];
        for (const listener of listeners) {
            try {
                const result = await listener(...args);
                results.push(result);
            }
            catch (error) {
                this.logger?.error(`Error in listener for event ${event}:`, error);
                throw error;
            }
        }
        return results;
    }
    /**
     * Removes an event listener
     */
    off(event, listener) {
        // Clean up handler options
        this.handlerOptions.delete(listener);
        return super.off(event, listener);
    }
    /**
     * Gets event statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Gets event history
     */
    getEventHistory(limit) {
        return limit ? this.eventHistory.slice(-limit) : [...this.eventHistory];
    }
    /**
     * Clears event history
     */
    clearHistory() {
        this.eventHistory = [];
        this.logger?.debug('Event history cleared');
    }
    /**
     * Gets events from persistence storage
     */
    async getPersistedEvents(filter) {
        if (!this.persistence) {
            throw new Error('Event persistence not configured');
        }
        return this.persistence.load(filter);
    }
    /**
     * Replays events from persistence or history
     */
    async replayEvents(filter) {
        let events;
        if (this.persistence) {
            events = await this.persistence.load(filter);
        }
        else {
            events = filter ? this.eventHistory.filter(filter) : this.eventHistory;
        }
        let replayedCount = 0;
        for (const event of events) {
            try {
                // Spread the data array if it's an array, otherwise pass as single argument
                if (Array.isArray(event.data)) {
                    this.emit(event.event, ...event.data);
                }
                else {
                    this.emit(event.event, event.data);
                }
                replayedCount++;
            }
            catch (error) {
                this.logger?.error(`Failed to replay event ${event.id}:`, error);
            }
        }
        this.logger?.info(`Replayed ${replayedCount} events`);
        return replayedCount;
    }
    /**
     * Private helper methods
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    createWrappedListener(listener, options) {
        let hasBeenCalled = false;
        return (...args) => {
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
    passesFilters(event, data) {
        const filters = this.eventFilters.get(event);
        if (!filters || filters.length === 0) {
            return true;
        }
        return filters.every(filter => {
            try {
                return filter(event, data);
            }
            catch (error) {
                this.logger?.error(`Error in event filter for ${event}:`, error);
                return false;
            }
        });
    }
    async processEventWithMiddleware(metadata) {
        let index = 0;
        const next = async () => {
            if (index >= this.middleware.length) {
                return;
            }
            const middleware = this.middleware[index++];
            await middleware(metadata.event, metadata.data, next);
        };
        await next();
    }
    wrapListener(listener, options) {
        return async (...args) => {
            const startTime = Date.now();
            try {
                // Apply filter if specified
                if (options?.filter && !options.filter(args[0], args.slice(1))) {
                    return;
                }
                // Handle timeout
                if (options?.timeout) {
                    await this.executeWithTimeout(listener, args, options.timeout);
                }
                else {
                    await listener(...args);
                }
                // Update processing time stats
                const processingTime = Date.now() - startTime;
                this.updateProcessingTime(processingTime);
            }
            catch (error) {
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
    async executeWithTimeout(listener, args, timeoutMs) {
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
    updateStats(event) {
        this.stats.totalEvents++;
        this.stats.eventsByType[event] = (this.stats.eventsByType[event] || 0) + 1;
        this.stats.lastEventTime = new Date();
    }
    updateProcessingTime(processingTime) {
        const totalTime = this.stats.averageProcessingTime * (this.stats.processedEvents - 1) + processingTime;
        this.stats.averageProcessingTime = totalTime / this.stats.processedEvents;
    }
    setupEventHistory(limit) {
        // Override emit to capture all events for history
        const originalEmit = this.emit.bind(this);
        this.emit = (event, ...args) => {
            try {
                const result = originalEmit(event, ...args);
                // Only record string events in history
                if (typeof event === 'string') {
                    const metadata = {
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
            }
            catch (error) {
                // Handle errors from listeners
                this.logger?.error('Error in event listener:', error);
                // Don't re-throw the error to prevent it from bubbling up
                return false;
            }
        };
    }
    setupRetryProcessing() {
        this.retryTimer = setInterval(() => {
            this.processRetryQueue();
        }, 5000); // Process retry queue every 5 seconds
    }
    addToRetryQueue(metadata) {
        const options = Array.from(this.handlerOptions.values()).find(opt => opt.retries && opt.retries > 0);
        if (options && metadata.retryCount < options.retries) {
            metadata.retryCount = (metadata.retryCount || 0) + 1;
            this.retryQueue.push(metadata);
            this.logger?.debug(`Added event ${metadata.id} to retry queue (attempt ${metadata.retryCount})`);
        }
    }
    async processRetryQueue() {
        const eventsToRetry = this.retryQueue.splice(0); // Take all events
        for (const event of eventsToRetry) {
            try {
                this.emit(event.event, event.data);
                this.logger?.debug(`Successfully retried event ${event.id}`);
            }
            catch (error) {
                this.logger?.error(`Retry failed for event ${event.id}:`, error);
                // Add back to queue if more retries available
                const options = Array.from(this.handlerOptions.values()).find(opt => opt.retries && opt.retries > 0);
                if (options && event.retryCount < options.retries) {
                    this.addToRetryQueue(event);
                }
            }
        }
    }
    /**
     * Cleanup resources
     */
    destroy() {
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
    removeAllListeners(event) {
        return super.removeAllListeners(event);
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=EventBus.js.map