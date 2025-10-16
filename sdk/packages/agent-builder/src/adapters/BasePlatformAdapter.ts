/**
 * @fileoverview Base Platform Adapter implementation
 * @version 1.1.0-beta
 */

import { MPLPEventManager } from '../core/MPLPEventManager';
import { IPlatformAdapter, PlatformConfig, PlatformAdapterEvents } from '../types';
import { PlatformAdapterError, PlatformConnectionError } from '../types/errors';
import { retryWithBackoff } from '../utils';

/**
 * Base implementation for platform adapters - 基于MPLP V1.0 Alpha事件架构
 */
export abstract class BasePlatformAdapter implements IPlatformAdapter {
  protected eventManager: MPLPEventManager;
  public abstract readonly name: string;
  public abstract readonly version: string;

  protected _status: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  protected _config?: PlatformConfig;
  protected _lastActivity?: Date;
  protected _errorCount: number = 0;
  protected _messageCount: number = 0;
  protected _initialized: boolean = false;
  protected _destroyed: boolean = false;

  constructor() {
    this.eventManager = new MPLPEventManager();

    // Set up error handling
    this.on('error', () => {
      this._errorCount++;
      this._lastActivity = new Date();
      this._setStatus('error');
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
   * Get current adapter status
   */
  public get status(): 'disconnected' | 'connecting' | 'connected' | 'error' {
    return this._status;
  }

  /**
   * Initialize the platform adapter
   */
  public async initialize(config: PlatformConfig): Promise<void> {
    if (this._destroyed) {
      throw new PlatformAdapterError('Cannot initialize destroyed adapter');
    }

    if (this._initialized) {
      throw new PlatformAdapterError('Adapter is already initialized');
    }

    try {
      await this._validateConfig(config);
      this._config = { ...config };
      await this._doInitialize(config);
      this._initialized = true;
    } catch (error) {
      const adapterError = new PlatformAdapterError(
        `Failed to initialize ${this.name} adapter: ${error instanceof Error ? error.message : String(error)}`,
        { platform: this.name, originalError: error }
      );
      this.emit('error', adapterError);
      throw adapterError;
    }
  }

  /**
   * Connect to the platform
   */
  public async connect(): Promise<void> {
    if (this._destroyed) {
      throw new PlatformAdapterError('Cannot connect destroyed adapter');
    }

    if (!this._initialized) {
      throw new PlatformAdapterError('Adapter must be initialized before connecting');
    }

    if (this._status === 'connected') {
      return; // Already connected
    }

    if (this._status === 'connecting') {
      throw new PlatformConnectionError('Adapter is already connecting');
    }

    try {
      this._setStatus('connecting');
      
      await retryWithBackoff(
        async () => {
          await this._doConnect();
        },
        this._config?.retries || 3,
        1000,
        10000
      );

      this._setStatus('connected');
      this._lastActivity = new Date();
      this.emit('connected');

    } catch (error) {
      this._setStatus('error');
      const connectionError = new PlatformConnectionError(
        `Failed to connect to ${this.name}: ${error instanceof Error ? error.message : String(error)}`,
        { platform: this.name, originalError: error }
      );
      this.emit('error', connectionError);
      throw connectionError;
    }
  }

  /**
   * Disconnect from the platform
   */
  public async disconnect(): Promise<void> {
    if (this._destroyed) {
      return; // Already destroyed
    }

    if (this._status === 'disconnected') {
      return; // Already disconnected
    }

    try {
      await this._doDisconnect();
      this._setStatus('disconnected');
      this.emit('disconnected');
    } catch (error) {
      const adapterError = new PlatformAdapterError(
        `Failed to disconnect from ${this.name}: ${error instanceof Error ? error.message : String(error)}`,
        { platform: this.name, originalError: error }
      );
      this.emit('error', adapterError);
      throw adapterError;
    }
  }

  /**
   * Send a message through the platform
   */
  public async sendMessage(message: unknown): Promise<void> {
    if (this._destroyed) {
      throw new PlatformAdapterError('Cannot send message from destroyed adapter');
    }

    if (this._status !== 'connected') {
      throw new PlatformAdapterError(`Cannot send message when adapter status is '${this._status}'`);
    }

    try {
      await this._doSendMessage(message);
      this._messageCount++;
      this._lastActivity = new Date();
    } catch (error) {
      const adapterError = new PlatformAdapterError(
        `Failed to send message via ${this.name}: ${error instanceof Error ? error.message : String(error)}`,
        { platform: this.name, message, originalError: error }
      );
      this.emit('error', adapterError);
      throw adapterError;
    }
  }

  /**
   * Get current adapter status
   */
  public getStatus(): {
    status: string;
    connected: boolean;
    lastActivity?: Date | undefined;
    errorCount: number;
    messageCount: number;
  } {
    return {
      status: this._status,
      connected: this._status === 'connected',
      lastActivity: this._lastActivity,
      errorCount: this._errorCount,
      messageCount: this._messageCount
    };
  }

  /**
   * Cleanup resources
   */
  public async destroy(): Promise<void> {
    if (this._destroyed) {
      return; // Already destroyed
    }

    try {
      // Disconnect if connected
      if (this._status === 'connected' || this._status === 'connecting') {
        await this.disconnect();
      }

      // Cleanup implementation-specific resources
      await this._doDestroy();

      this._destroyed = true;
      this._initialized = false;
      
      // Remove all listeners
      this.removeAllListeners();

    } catch (error) {
      const adapterError = new PlatformAdapterError(
        `Failed to destroy ${this.name} adapter: ${error instanceof Error ? error.message : String(error)}`,
        { platform: this.name, originalError: error }
      );
      this.emit('error', adapterError);
      throw adapterError;
    }
  }

  /**
   * Check if adapter is destroyed
   */
  public isDestroyed(): boolean {
    return this._destroyed;
  }

  /**
   * Check if adapter is initialized
   */
  public isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Get adapter configuration (read-only)
   */
  public getConfig(): Readonly<PlatformConfig> | undefined {
    return this._config ? { ...this._config } : undefined;
  }

  /**
   * Set adapter status and emit event
   */
  protected _setStatus(newStatus: 'disconnected' | 'connecting' | 'connected' | 'error'): void {
    const previousStatus = this._status;
    this._status = newStatus;
    if (previousStatus !== newStatus) {
      this.emit('status-changed', newStatus);
    }
  }

  /**
   * Handle incoming messages
   */
  protected _handleMessage(message: unknown): void {
    this._lastActivity = new Date();
    this.emit('message', message);
  }

  // Abstract methods that must be implemented by concrete adapters

  /**
   * Validate adapter configuration
   */
  protected abstract _validateConfig(config: PlatformConfig): Promise<void>;

  /**
   * Initialize adapter with configuration
   */
  protected abstract _doInitialize(config: PlatformConfig): Promise<void>;

  /**
   * Connect to the platform
   */
  protected abstract _doConnect(): Promise<void>;

  /**
   * Disconnect from the platform
   */
  protected abstract _doDisconnect(): Promise<void>;

  /**
   * Send a message through the platform
   */
  protected abstract _doSendMessage(message: unknown): Promise<void>;

  /**
   * Cleanup implementation-specific resources
   */
  protected abstract _doDestroy(): Promise<void>;
}
