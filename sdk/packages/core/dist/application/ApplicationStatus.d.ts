/**
 * Application Status Enumeration
 *
 * Defines all possible states of an MPLP application during its lifecycle.
 * This enum provides type safety and clear state management for applications.
 */
export declare enum ApplicationStatus {
    /**
     * Application has been created but not yet initialized
     * This is the initial state when an MPLPApplication instance is created
     */
    CREATED = "created",
    /**
     * Application is currently being initialized
     * Configuration is being validated and core services are being set up
     */
    INITIALIZING = "initializing",
    /**
     * Application has been successfully initialized
     * All core services are ready and modules can be registered
     */
    INITIALIZED = "initialized",
    /**
     * Application is currently starting up
     * Modules are being started and the application is preparing to run
     */
    STARTING = "starting",
    /**
     * Application is running normally
     * All modules are active and the application is operational
     */
    RUNNING = "running",
    /**
     * Application is currently stopping
     * Modules are being gracefully shut down
     */
    STOPPING = "stopping",
    /**
     * Application has been stopped
     * All modules have been shut down and resources have been cleaned up
     */
    STOPPED = "stopped",
    /**
     * Application is in an error state
     * An unrecoverable error has occurred and the application cannot continue
     */
    ERROR = "error",
    /**
     * Application is paused
     * The application is temporarily suspended but can be resumed
     */
    PAUSED = "paused",
    /**
     * Application is being restarted
     * The application is going through a restart cycle
     */
    RESTARTING = "restarting"
}
/**
 * Application Status Utilities
 * Provides helper functions for working with application status
 */
export declare class ApplicationStatusUtils {
    /**
     * Checks if the application is in a transitional state
     *
     * @param status - Application status to check
     * @returns True if the status represents a transitional state
     */
    static isTransitional(status: ApplicationStatus): boolean;
    /**
     * Checks if the application is in a stable state
     *
     * @param status - Application status to check
     * @returns True if the status represents a stable state
     */
    static isStable(status: ApplicationStatus): boolean;
    /**
     * Checks if the application is operational
     *
     * @param status - Application status to check
     * @returns True if the application can handle requests
     */
    static isOperational(status: ApplicationStatus): boolean;
    /**
     * Checks if the application can be started
     *
     * @param status - Application status to check
     * @returns True if the application can be started
     */
    static canStart(status: ApplicationStatus): boolean;
    /**
     * Checks if the application can be stopped
     *
     * @param status - Application status to check
     * @returns True if the application can be stopped
     */
    static canStop(status: ApplicationStatus): boolean;
    /**
     * Checks if the application can be paused
     *
     * @param status - Application status to check
     * @returns True if the application can be paused
     */
    static canPause(status: ApplicationStatus): boolean;
    /**
     * Checks if the application can be resumed
     *
     * @param status - Application status to check
     * @returns True if the application can be resumed
     */
    static canResume(status: ApplicationStatus): boolean;
    /**
     * Checks if the application can be restarted
     *
     * @param status - Application status to check
     * @returns True if the application can be restarted
     */
    static canRestart(status: ApplicationStatus): boolean;
    /**
     * Gets a human-readable description of the application status
     *
     * @param status - Application status
     * @returns Human-readable description
     */
    static getDescription(status: ApplicationStatus): string;
    /**
     * Gets the next valid states from the current state
     *
     * @param status - Current application status
     * @returns Array of valid next states
     */
    static getValidTransitions(status: ApplicationStatus): ApplicationStatus[];
    /**
     * Validates if a status transition is valid
     *
     * @param from - Current status
     * @param to - Target status
     * @returns True if the transition is valid
     */
    static isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean;
}
/**
 * Application Status Change Event
 * Represents a status change event with metadata
 */
export interface ApplicationStatusChangeEvent {
    /**
     * Previous status
     */
    from: ApplicationStatus;
    /**
     * New status
     */
    to: ApplicationStatus;
    /**
     * Timestamp of the change
     */
    timestamp: Date;
    /**
     * Optional reason for the change
     */
    reason?: string;
    /**
     * Optional error if the change was due to an error
     */
    error?: Error;
}
/**
 * Application Status History
 * Tracks the history of status changes for an application
 */
export declare class ApplicationStatusHistory {
    private history;
    private maxHistorySize;
    constructor(maxHistorySize?: number);
    /**
     * Records a status change
     *
     * @param event - Status change event
     */
    record(event: ApplicationStatusChangeEvent): void;
    /**
     * Gets the complete status history
     *
     * @returns Array of status change events
     */
    getHistory(): ApplicationStatusChangeEvent[];
    /**
     * Gets the most recent status change
     *
     * @returns Most recent status change event or undefined
     */
    getLatest(): ApplicationStatusChangeEvent | undefined;
    /**
     * Gets status changes within a time range
     *
     * @param from - Start time
     * @param to - End time
     * @returns Array of status change events within the time range
     */
    getInTimeRange(from: Date, to: Date): ApplicationStatusChangeEvent[];
    /**
     * Clears the status history
     */
    clear(): void;
}
//# sourceMappingURL=ApplicationStatus.d.ts.map