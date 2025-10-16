import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { ApplicationConfig } from './ApplicationConfig';
import { ApplicationStatus } from './ApplicationStatus';
import { ModuleManager } from '../modules/ModuleManager';
import { HealthChecker } from '../health/HealthChecker';
import { EventBus } from '../events/EventBus';
import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../logging/Logger';
import { ApplicationError } from '../errors/ApplicationError';
import { BaseModule } from '../modules/BaseModule';

/**
 * MPLPApplication - Core application class for MPLP SDK
 *
 * This class provides the main entry point for creating and managing
 * multi-agent applications using the MPLP protocol.
 *
 * Features:
 * - Application lifecycle management
 * - Module registration and management
 * - Health monitoring
 * - Event-driven architecture
 * - Configuration management
 * - Logging and error handling
 *
 * @example
 * ```typescript
 * const app = new MPLPApplication({
 *   name: 'MyBot',
 *   version: '1.0.0'
 * });
 *
 * await app.initialize();
 * await app.registerModule('context', new ContextModule());
 * await app.start();
 * ```
 */
export class MPLPApplication extends EventEmitter {
  private readonly id: string;
  private readonly config: ApplicationConfig;
  private readonly moduleManager: ModuleManager;
  private readonly healthChecker: HealthChecker;
  private readonly eventBus: EventBus;
  private readonly configManager: ConfigManager;
  private readonly logger: Logger;

  private status: ApplicationStatus = ApplicationStatus.CREATED;
  private startTime?: Date;
  private stopTime?: Date;

  /**
   * Creates a new MPLP application instance
   *
   * @param config - Application configuration
   */
  constructor(config: ApplicationConfig) {
    super();

    this.id = uuidv4();
    this.config = { ...config };

    // Initialize core components
    this.logger = new Logger(config.name || 'MPLPApplication');
    this.eventBus = new EventBus();
    this.configManager = new ConfigManager(config);
    this.moduleManager = new ModuleManager(this.eventBus, this.logger);
    this.healthChecker = new HealthChecker(this.moduleManager, this.logger);

    this.logger.info(`MPLP Application created: ${this.config.name} (${this.id})`);
  }

  /**
   * Gets the application ID
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Gets the application configuration
   */
  public getConfig(): ApplicationConfig {
    return { ...this.config };
  }

  /**
   * Gets the current application status
   */
  public getStatus(): ApplicationStatus {
    return this.status;
  }

  /**
   * Gets application uptime in milliseconds
   */
  public getUptime(): number {
    if (!this.startTime) return 0;
    const endTime = this.stopTime || new Date();
    return endTime.getTime() - this.startTime.getTime();
  }

  /**
   * Initializes the application
   *
   * This method prepares the application for use by:
   * - Validating configuration
   * - Setting up core services
   * - Preparing module registry
   *
   * @throws {ApplicationError} If initialization fails
   */
  public async initialize(): Promise<void> {
    if (this.status !== ApplicationStatus.CREATED) {
      throw new ApplicationError(`Cannot initialize application in status: ${this.status}`);
    }

    try {
      this.status = ApplicationStatus.INITIALIZING;
      this.emit('initializing');

      this.logger.info('Initializing MPLP Application...');

      // Validate configuration
      this.validateConfig();

      // Initialize core components
      await this.configManager.initialize();
      await this.moduleManager.initialize();
      await this.healthChecker.initialize();

      this.status = ApplicationStatus.INITIALIZED;
      this.emit('initialized');

      this.logger.info('MPLP Application initialized successfully');
    } catch (error) {
      this.status = ApplicationStatus.ERROR;
      this.emit('error', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCause = error instanceof Error ? error : undefined;
      throw new ApplicationError(`Failed to initialize application: ${errorMessage}`, errorCause);
    }
  }

  /**
   * Registers a module with the application
   *
   * @param name - Module name
   * @param module - Module instance
   * @throws {ApplicationError} If registration fails
   */
  public async registerModule<T extends BaseModule>(name: string, module: T): Promise<void> {
    if (this.status === ApplicationStatus.RUNNING) {
      throw new ApplicationError('Cannot register modules while application is running');
    }

    try {
      this.logger.info(`Registering module: ${name}`);
      await this.moduleManager.registerModule(name, module);
      this.emit('moduleRegistered', { name, module });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCause = error instanceof Error ? error : undefined;
      throw new ApplicationError(`Failed to register module ${name}: ${errorMessage}`, errorCause);
    }
  }

  /**
   * Gets a registered module by name
   *
   * @param name - Module name
   * @returns Module instance or undefined if not found
   */
  public getModule<T extends BaseModule>(name: string): T | undefined {
    return this.moduleManager.getModule<T>(name);
  }

  /**
   * Gets all registered modules
   */
  public getModules(): Map<string, BaseModule> {
    return this.moduleManager.getModules();
  }

  /**
   * Starts the application
   *
   * This method:
   * - Starts all registered modules
   * - Begins health monitoring
   * - Sets application status to running
   *
   * @throws {ApplicationError} If start fails
   */
  public async start(): Promise<void> {
    if (this.status !== ApplicationStatus.INITIALIZED) {
      throw new ApplicationError(`Cannot start application in status: ${this.status}`);
    }

    try {
      this.status = ApplicationStatus.STARTING;
      this.emit('starting');

      this.logger.info('Starting MPLP Application...');

      // Start all modules
      await this.moduleManager.startAll();

      // Start health monitoring
      await this.healthChecker.start();

      this.startTime = new Date();
      this.status = ApplicationStatus.RUNNING;
      this.emit('started');

      this.logger.info('MPLP Application started successfully');
    } catch (error) {
      this.status = ApplicationStatus.ERROR;
      this.emit('error', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCause = error instanceof Error ? error : undefined;
      throw new ApplicationError(`Failed to start application: ${errorMessage}`, errorCause);
    }
  }

  /**
   * Stops the application gracefully
   *
   * @throws {ApplicationError} If stop fails
   */
  public async stop(): Promise<void> {
    if (this.status !== ApplicationStatus.RUNNING) {
      throw new ApplicationError(`Cannot stop application in status: ${this.status}`);
    }

    try {
      this.status = ApplicationStatus.STOPPING;
      this.emit('stopping');

      this.logger.info('Stopping MPLP Application...');

      // Stop health monitoring
      await this.healthChecker.stop();

      // Stop all modules
      await this.moduleManager.stopAll();

      this.stopTime = new Date();
      this.status = ApplicationStatus.STOPPED;
      this.emit('stopped');

      this.logger.info('MPLP Application stopped successfully');
    } catch (error) {
      this.status = ApplicationStatus.ERROR;
      this.emit('error', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCause = error instanceof Error ? error : undefined;
      throw new ApplicationError(`Failed to stop application: ${errorMessage}`, errorCause);
    }
  }

  /**
   * Gets the current health status of the application
   */
  public async getHealthStatus(): Promise<any> {
    return await this.healthChecker.getHealthStatus();
  }

  /**
   * Gets application statistics
   */
  public getStats(): any {
    return {
      id: this.id,
      name: this.config.name,
      version: this.config.version,
      status: this.status,
      uptime: this.getUptime(),
      startTime: this.startTime,
      stopTime: this.stopTime,
      moduleCount: this.moduleManager.getModules().size,
      modules: Array.from(this.moduleManager.getModules().keys()),
    };
  }

  /**
   * Validates the application configuration
   *
   * @private
   * @throws {ApplicationError} If configuration is invalid
   */
  private validateConfig(): void {
    if (!this.config.name) {
      throw new ApplicationError('Application name is required');
    }

    if (!this.config.version) {
      throw new ApplicationError('Application version is required');
    }

    // Additional validation can be added here
  }
}
