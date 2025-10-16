import { EventEmitter } from 'events';

/**
 * Base Module Class
 *
 * Abstract base class that all MPLP modules must extend.
 * Provides common functionality and lifecycle management for modules.
 */
export abstract class BaseModule extends EventEmitter {
  protected name: string;
  protected version: string;
  protected status: string = 'created';
  protected initialized: boolean = false;
  protected started: boolean = false;

  constructor(name: string, version: string = '1.0.0') {
    super();
    this.name = name;
    this.version = version;
  }

  /**
   * Gets the module name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets the module version
   */
  getVersion(): string {
    return this.version;
  }

  /**
   * Gets the current module status
   */
  getStatus(): string {
    return this.status;
  }

  /**
   * Checks if the module is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Checks if the module is started
   */
  isStarted(): boolean {
    return this.started;
  }

  /**
   * Initializes the module
   * Subclasses should override this method to provide custom initialization logic
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error(`Module '${this.name}' is already initialized`);
    }

    this.status = 'initializing';
    this.emit('initializing');

    try {
      await this.onInitialize();
      this.initialized = true;
      this.status = 'initialized';
      this.emit('initialized');
    } catch (error) {
      this.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Starts the module
   * Subclasses should override this method to provide custom start logic
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error(`Module '${this.name}' must be initialized before starting`);
    }

    if (this.started) {
      throw new Error(`Module '${this.name}' is already started`);
    }

    this.status = 'starting';
    this.emit('starting');

    try {
      await this.onStart();
      this.started = true;
      this.status = 'running';
      this.emit('started');
    } catch (error) {
      this.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stops the module
   * Subclasses should override this method to provide custom stop logic
   */
  async stop(): Promise<void> {
    if (!this.started) {
      return; // Already stopped or never started
    }

    this.status = 'stopping';
    this.emit('stopping');

    try {
      await this.onStop();
      this.started = false;
      this.status = 'stopped';
      this.emit('stopped');
    } catch (error) {
      this.status = 'error';
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Restarts the module
   */
  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  /**
   * Checks if the module is healthy
   * Subclasses should override this method to provide custom health checks
   */
  async isHealthy(): Promise<boolean> {
    try {
      return await this.onHealthCheck();
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets module configuration
   * Subclasses can override this method to provide configuration information
   */
  getConfig(): Record<string, any> {
    return {
      name: this.name,
      version: this.version,
      status: this.status,
      initialized: this.initialized,
      started: this.started,
    };
  }

  /**
   * Gets module statistics
   * Subclasses can override this method to provide custom statistics
   */
  getStats(): Record<string, any> {
    return {
      name: this.name,
      version: this.version,
      status: this.status,
      uptime: this.started ? Date.now() : 0,
    };
  }

  // Abstract methods that subclasses must implement

  /**
   * Custom initialization logic
   * Subclasses must implement this method
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * Custom start logic
   * Subclasses must implement this method
   */
  protected abstract onStart(): Promise<void>;

  /**
   * Custom stop logic
   * Subclasses must implement this method
   */
  protected abstract onStop(): Promise<void>;

  /**
   * Custom health check logic
   * Subclasses can override this method (default returns true)
   */
  protected async onHealthCheck(): Promise<boolean> {
    return this.status === 'running';
  }
}
