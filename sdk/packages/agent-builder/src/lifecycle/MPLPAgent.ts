/**
 * @fileoverview MPLPAgent implementation with lifecycle management - MPLP V1.1.0 Beta
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha事件架构
 */

import { MPLPEventManager } from '../core/MPLPEventManager';
import { 
  IAgent, 
  AgentConfig, 
  AgentStatus, 
  AgentStatusInfo, 
  AgentCapability,
  IPlatformAdapter,
  AgentLifecycleEvents
} from '../types';
import { 
  AgentLifecycleError, 
  AgentStateError, 
  MessageSendError,
  PlatformAdapterNotFoundError 
} from '../types/errors';
import { calculateUptime, deepClone } from '../utils';
import { PlatformAdapterRegistry } from '../adapters/PlatformAdapterRegistry';

/**
 * MPLP Agent implementation with complete lifecycle management - 基于MPLP V1.0 Alpha事件架构
 */
export class MPLPAgent implements IAgent {
  private eventManager: MPLPEventManager;
  public readonly id: string;
  public readonly name: string;
  public readonly capabilities: AgentCapability[];

  private _status: AgentStatus = AgentStatus.IDLE;
  private _startTime?: Date;
  private _lastActivity?: Date;
  private _errorCount: number = 0;
  private _messageCount: number = 0;
  private _config: AgentConfig;
  private _platformAdapter?: IPlatformAdapter | undefined;
  private readonly _registry: PlatformAdapterRegistry;
  private _destroyed: boolean = false;

  constructor(config: AgentConfig, registry?: PlatformAdapterRegistry) {
    this.eventManager = new MPLPEventManager();

    this.id = config.id!;
    this.name = config.name;
    this.capabilities = [...config.capabilities];
    this._config = deepClone(config);
    this._registry = registry || PlatformAdapterRegistry.getInstance();

    // Set up error handling
    this.on('error', (error: Error) => {
      this._errorCount++;
      this._lastActivity = new Date();

      // Call behavior error handler if defined
      if (this._config.behavior?.onError) {
        try {
          void this._config.behavior.onError(error);
        } catch (behaviorError) {
          console.error('Error in behavior error handler:', behaviorError);
        }
      }
    });
  }

  // ===== EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构 =====

  /**
   * EventEmitter兼容的on方法
   */
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的emit方法
   */
  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  /**
   * EventEmitter兼容的off方法
   */
  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  /**
   * EventEmitter兼容的removeAllListeners方法
   */
  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Get current agent status
   */
  public get status(): AgentStatus {
    return this._status;
  }

  /**
   * Start the agent
   */
  public async start(): Promise<void> {
    if (this._destroyed) {
      throw new AgentStateError('Cannot start destroyed agent');
    }

    if (this._status === AgentStatus.RUNNING) {
      return; // Already running
    }

    if (this._status === AgentStatus.STARTING) {
      throw new AgentStateError('Agent is already starting');
    }

    try {
      this._setStatus(AgentStatus.STARTING);

      // Initialize platform adapter if configured
      if (this._config.platform && this._config.platformConfig) {
        await this._initializePlatformAdapter();
      }

      // Call behavior start handler if defined
      if (this._config.behavior?.onStart) {
        await this._config.behavior.onStart();
      }

      this._startTime = new Date();
      this._lastActivity = new Date();
      this._setStatus(AgentStatus.RUNNING);

      this.emit('started');

    } catch (error) {
      this._setStatus(AgentStatus.ERROR);
      const lifecycleError = new AgentLifecycleError(
        `Failed to start agent '${this.name}': ${error instanceof Error ? error.message : String(error)}`,
        { agentId: this.id, originalError: error }
      );
      this.emit('error', lifecycleError);
      throw lifecycleError;
    }
  }

  /**
   * Stop the agent
   */
  public async stop(): Promise<void> {
    if (this._destroyed) {
      throw new AgentStateError('Cannot stop destroyed agent');
    }

    if (this._status === AgentStatus.STOPPED || this._status === AgentStatus.IDLE) {
      return; // Already stopped
    }

    if (this._status === AgentStatus.STOPPING) {
      throw new AgentStateError('Agent is already stopping');
    }

    try {
      this._setStatus(AgentStatus.STOPPING);

      // Call behavior stop handler if defined
      if (this._config.behavior?.onStop) {
        await this._config.behavior.onStop();
      }

      // Disconnect platform adapter if connected
      if (this._platformAdapter) {
        await this._platformAdapter.disconnect();
      }

      this._setStatus(AgentStatus.STOPPED);
      this.emit('stopped');

    } catch (error) {
      this._setStatus(AgentStatus.ERROR);
      const lifecycleError = new AgentLifecycleError(
        `Failed to stop agent '${this.name}': ${error instanceof Error ? error.message : String(error)}`,
        { agentId: this.id, originalError: error }
      );
      this.emit('error', lifecycleError);
      throw lifecycleError;
    }
  }

  /**
   * Get current agent status information
   */
  public getStatus(): AgentStatusInfo {
    const uptime = this._startTime && this._status === AgentStatus.RUNNING
      ? Date.now() - this._startTime.getTime()
      : undefined;

    return {
      status: this._status,
      startTime: this._startTime,
      uptime,
      lastActivity: this._lastActivity,
      errorCount: this._errorCount,
      messageCount: this._messageCount,
      metadata: this._config.metadata ? { ...this._config.metadata } : undefined
    };
  }

  /**
   * Send a message through the agent
   */
  public async sendMessage(message: unknown): Promise<void> {
    if (this._destroyed) {
      throw new AgentStateError('Cannot send message from destroyed agent');
    }

    if (this._status !== AgentStatus.RUNNING) {
      throw new AgentStateError(`Cannot send message when agent status is '${this._status}'`);
    }

    try {
      if (this._platformAdapter) {
        await this._platformAdapter.sendMessage(message);
      }

      this._messageCount++;
      this._lastActivity = new Date();
      this.emit('message-sent', message);

    } catch (error) {
      const sendError = new MessageSendError(
        `Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
        { agentId: this.id, message, originalError: error }
      );
      this.emit('error', sendError);
      throw sendError;
    }
  }

  /**
   * Update agent configuration
   */
  public async updateConfig(config: Partial<AgentConfig>): Promise<void> {
    if (this._destroyed) {
      throw new AgentStateError('Cannot update config of destroyed agent');
    }

    const newConfig = { ...this._config, ...config };
    
    // Validate the new configuration
    if (newConfig.name !== this._config.name) {
      throw new AgentLifecycleError('Cannot change agent name after creation');
    }

    if (newConfig.id !== this._config.id) {
      throw new AgentLifecycleError('Cannot change agent ID after creation');
    }

    // Update configuration
    this._config = newConfig;

    // If platform configuration changed and agent is running, reinitialize adapter
    if (this._status === AgentStatus.RUNNING && 
        (config.platform || config.platformConfig)) {
      await this._reinitializePlatformAdapter();
    }
  }

  /**
   * Cleanup and destroy the agent
   */
  public async destroy(): Promise<void> {
    if (this._destroyed) {
      return; // Already destroyed
    }

    try {
      // Stop the agent if running
      if (this._status === AgentStatus.RUNNING || this._status === AgentStatus.STARTING) {
        await this.stop();
      }

      // Cleanup platform adapter
      if (this._platformAdapter) {
        await this._platformAdapter.destroy();
        this._platformAdapter = undefined;
      }

      this._destroyed = true;
      this._setStatus(AgentStatus.DESTROYED);

      // Emit destroyed event before removing listeners
      this.emit('destroyed');

      // Remove all listeners
      this.removeAllListeners();

    } catch (error) {
      const lifecycleError = new AgentLifecycleError(
        `Failed to destroy agent '${this.name}': ${error instanceof Error ? error.message : String(error)}`,
        { agentId: this.id, originalError: error }
      );
      this.emit('error', lifecycleError);
      throw lifecycleError;
    }
  }

  /**
   * Check if agent is destroyed
   */
  public isDestroyed(): boolean {
    return this._destroyed;
  }

  /**
   * Get agent configuration (read-only)
   */
  public getConfig(): Readonly<AgentConfig> {
    return deepClone(this._config);
  }

  /**
   * Get platform adapter (if any)
   */
  public getPlatformAdapter(): IPlatformAdapter | undefined {
    return this._platformAdapter;
  }

  /**
   * Set agent status and emit event
   */
  private _setStatus(newStatus: AgentStatus): void {
    const previousStatus = this._status;
    this._status = newStatus;
    this.emit('status-changed', newStatus, previousStatus);
  }

  /**
   * Initialize platform adapter
   */
  private async _initializePlatformAdapter(): Promise<void> {
    if (!this._config.platform || !this._config.platformConfig) {
      return;
    }

    const AdapterClass = this._registry.get(this._config.platform);
    if (!AdapterClass) {
      throw new PlatformAdapterNotFoundError(this._config.platform);
    }

    this._platformAdapter = new AdapterClass();
    
    // Set up platform adapter event handlers
    this._platformAdapter.on('messageReceived', (data: { message: unknown }) => {
      this._lastActivity = new Date();
      this.emit('message-received', data.message);

      // Call behavior message handler if defined
      if (this._config.behavior?.onMessage) {
        void this._config.behavior.onMessage(data.message);
      }
    });

    this._platformAdapter.on('error', (error: Error) => {
      this.emit('error', error);
    });

    // Initialize and connect
    await this._platformAdapter.initialize(this._config.platformConfig);
    await this._platformAdapter.connect();
  }

  /**
   * Reinitialize platform adapter with new configuration
   */
  private async _reinitializePlatformAdapter(): Promise<void> {
    // Cleanup existing adapter
    if (this._platformAdapter) {
      await this._platformAdapter.destroy();
      this._platformAdapter = undefined;
    }

    // Initialize new adapter
    await this._initializePlatformAdapter();
  }
}
