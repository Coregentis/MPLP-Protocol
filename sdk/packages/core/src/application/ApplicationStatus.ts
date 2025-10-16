/**
 * Application Status Enumeration
 *
 * Defines all possible states of an MPLP application during its lifecycle.
 * This enum provides type safety and clear state management for applications.
 */

export enum ApplicationStatus {
  /**
   * Application has been created but not yet initialized
   * This is the initial state when an MPLPApplication instance is created
   */
  CREATED = 'created',

  /**
   * Application is currently being initialized
   * Configuration is being validated and core services are being set up
   */
  INITIALIZING = 'initializing',

  /**
   * Application has been successfully initialized
   * All core services are ready and modules can be registered
   */
  INITIALIZED = 'initialized',

  /**
   * Application is currently starting up
   * Modules are being started and the application is preparing to run
   */
  STARTING = 'starting',

  /**
   * Application is running normally
   * All modules are active and the application is operational
   */
  RUNNING = 'running',

  /**
   * Application is currently stopping
   * Modules are being gracefully shut down
   */
  STOPPING = 'stopping',

  /**
   * Application has been stopped
   * All modules have been shut down and resources have been cleaned up
   */
  STOPPED = 'stopped',

  /**
   * Application is in an error state
   * An unrecoverable error has occurred and the application cannot continue
   */
  ERROR = 'error',

  /**
   * Application is paused
   * The application is temporarily suspended but can be resumed
   */
  PAUSED = 'paused',

  /**
   * Application is being restarted
   * The application is going through a restart cycle
   */
  RESTARTING = 'restarting',
}

/**
 * Application Status Utilities
 * Provides helper functions for working with application status
 */
export class ApplicationStatusUtils {
  /**
   * Checks if the application is in a transitional state
   *
   * @param status - Application status to check
   * @returns True if the status represents a transitional state
   */
  static isTransitional(status: ApplicationStatus): boolean {
    return [
      ApplicationStatus.INITIALIZING,
      ApplicationStatus.STARTING,
      ApplicationStatus.STOPPING,
      ApplicationStatus.RESTARTING,
    ].includes(status);
  }

  /**
   * Checks if the application is in a stable state
   *
   * @param status - Application status to check
   * @returns True if the status represents a stable state
   */
  static isStable(status: ApplicationStatus): boolean {
    return [
      ApplicationStatus.CREATED,
      ApplicationStatus.INITIALIZED,
      ApplicationStatus.RUNNING,
      ApplicationStatus.STOPPED,
      ApplicationStatus.PAUSED,
    ].includes(status);
  }

  /**
   * Checks if the application is operational
   *
   * @param status - Application status to check
   * @returns True if the application can handle requests
   */
  static isOperational(status: ApplicationStatus): boolean {
    return [ApplicationStatus.RUNNING, ApplicationStatus.PAUSED].includes(status);
  }

  /**
   * Checks if the application can be started
   *
   * @param status - Application status to check
   * @returns True if the application can be started
   */
  static canStart(status: ApplicationStatus): boolean {
    return [ApplicationStatus.INITIALIZED, ApplicationStatus.STOPPED].includes(status);
  }

  /**
   * Checks if the application can be stopped
   *
   * @param status - Application status to check
   * @returns True if the application can be stopped
   */
  static canStop(status: ApplicationStatus): boolean {
    return [ApplicationStatus.RUNNING, ApplicationStatus.PAUSED].includes(status);
  }

  /**
   * Checks if the application can be paused
   *
   * @param status - Application status to check
   * @returns True if the application can be paused
   */
  static canPause(status: ApplicationStatus): boolean {
    return status === ApplicationStatus.RUNNING;
  }

  /**
   * Checks if the application can be resumed
   *
   * @param status - Application status to check
   * @returns True if the application can be resumed
   */
  static canResume(status: ApplicationStatus): boolean {
    return status === ApplicationStatus.PAUSED;
  }

  /**
   * Checks if the application can be restarted
   *
   * @param status - Application status to check
   * @returns True if the application can be restarted
   */
  static canRestart(status: ApplicationStatus): boolean {
    return [
      ApplicationStatus.RUNNING,
      ApplicationStatus.STOPPED,
      ApplicationStatus.ERROR,
      ApplicationStatus.PAUSED,
    ].includes(status);
  }

  /**
   * Gets a human-readable description of the application status
   *
   * @param status - Application status
   * @returns Human-readable description
   */
  static getDescription(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.CREATED:
        return 'Application has been created and is ready for initialization';
      case ApplicationStatus.INITIALIZING:
        return 'Application is being initialized';
      case ApplicationStatus.INITIALIZED:
        return 'Application has been initialized and is ready to start';
      case ApplicationStatus.STARTING:
        return 'Application is starting up';
      case ApplicationStatus.RUNNING:
        return 'Application is running normally';
      case ApplicationStatus.STOPPING:
        return 'Application is shutting down';
      case ApplicationStatus.STOPPED:
        return 'Application has been stopped';
      case ApplicationStatus.ERROR:
        return 'Application is in an error state';
      case ApplicationStatus.PAUSED:
        return 'Application is paused';
      case ApplicationStatus.RESTARTING:
        return 'Application is restarting';
      default:
        return 'Unknown application status';
    }
  }

  /**
   * Gets the next valid states from the current state
   *
   * @param status - Current application status
   * @returns Array of valid next states
   */
  static getValidTransitions(status: ApplicationStatus): ApplicationStatus[] {
    switch (status) {
      case ApplicationStatus.CREATED:
        return [ApplicationStatus.INITIALIZING, ApplicationStatus.ERROR];
      case ApplicationStatus.INITIALIZING:
        return [ApplicationStatus.INITIALIZED, ApplicationStatus.ERROR];
      case ApplicationStatus.INITIALIZED:
        return [ApplicationStatus.STARTING, ApplicationStatus.ERROR];
      case ApplicationStatus.STARTING:
        return [ApplicationStatus.RUNNING, ApplicationStatus.ERROR];
      case ApplicationStatus.RUNNING:
        return [
          ApplicationStatus.STOPPING,
          ApplicationStatus.PAUSED,
          ApplicationStatus.RESTARTING,
          ApplicationStatus.ERROR,
        ];
      case ApplicationStatus.STOPPING:
        return [ApplicationStatus.STOPPED, ApplicationStatus.ERROR];
      case ApplicationStatus.STOPPED:
        return [ApplicationStatus.STARTING, ApplicationStatus.RESTARTING];
      case ApplicationStatus.PAUSED:
        return [
          ApplicationStatus.RUNNING,
          ApplicationStatus.STOPPING,
          ApplicationStatus.RESTARTING,
          ApplicationStatus.ERROR,
        ];
      case ApplicationStatus.RESTARTING:
        return [ApplicationStatus.STARTING, ApplicationStatus.ERROR];
      case ApplicationStatus.ERROR:
        return [ApplicationStatus.RESTARTING, ApplicationStatus.STOPPED];
      default:
        return [];
    }
  }

  /**
   * Validates if a status transition is valid
   *
   * @param from - Current status
   * @param to - Target status
   * @returns True if the transition is valid
   */
  static isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
    return this.getValidTransitions(from).includes(to);
  }
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
export class ApplicationStatusHistory {
  private history: ApplicationStatusChangeEvent[] = [];
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Records a status change
   *
   * @param event - Status change event
   */
  record(event: ApplicationStatusChangeEvent): void {
    this.history.push(event);

    // Keep history size within limits
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Gets the complete status history
   *
   * @returns Array of status change events
   */
  getHistory(): ApplicationStatusChangeEvent[] {
    return [...this.history];
  }

  /**
   * Gets the most recent status change
   *
   * @returns Most recent status change event or undefined
   */
  getLatest(): ApplicationStatusChangeEvent | undefined {
    return this.history[this.history.length - 1];
  }

  /**
   * Gets status changes within a time range
   *
   * @param from - Start time
   * @param to - End time
   * @returns Array of status change events within the time range
   */
  getInTimeRange(from: Date, to: Date): ApplicationStatusChangeEvent[] {
    return this.history.filter(event => event.timestamp >= from && event.timestamp <= to);
  }

  /**
   * Clears the status history
   */
  clear(): void {
    this.history = [];
  }
}
