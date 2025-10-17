/**
 * @fileoverview Base Platform Adapter implementation
 * @version 1.1.0-beta
 */
import { MPLPEventManager } from '../core/MPLPEventManager';
import { IPlatformAdapter, PlatformConfig } from '../types';
/**
 * Base implementation for platform adapters - 基于MPLP V1.0 Alpha事件架构
 */
export declare abstract class BasePlatformAdapter implements IPlatformAdapter {
    protected eventManager: MPLPEventManager;
    abstract readonly name: string;
    abstract readonly version: string;
    protected _status: 'disconnected' | 'connecting' | 'connected' | 'error';
    protected _config?: PlatformConfig;
    protected _lastActivity?: Date;
    protected _errorCount: number;
    protected _messageCount: number;
    protected _initialized: boolean;
    protected _destroyed: boolean;
    constructor();
    /**
     * EventEmitter兼容的on方法
     */
    on(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的emit方法
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * EventEmitter兼容的off方法
     */
    off(event: string, listener: (...args: any[]) => void): this;
    /**
     * EventEmitter兼容的removeAllListeners方法
     */
    removeAllListeners(event?: string): this;
    /**
     * Get current adapter status
     */
    get status(): 'disconnected' | 'connecting' | 'connected' | 'error';
    /**
     * Initialize the platform adapter
     */
    initialize(config: PlatformConfig): Promise<void>;
    /**
     * Connect to the platform
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the platform
     */
    disconnect(): Promise<void>;
    /**
     * Send a message through the platform
     */
    sendMessage(message: unknown): Promise<void>;
    /**
     * Get current adapter status
     */
    getStatus(): {
        status: string;
        connected: boolean;
        lastActivity?: Date | undefined;
        errorCount: number;
        messageCount: number;
    };
    /**
     * Cleanup resources
     */
    destroy(): Promise<void>;
    /**
     * Check if adapter is destroyed
     */
    isDestroyed(): boolean;
    /**
     * Check if adapter is initialized
     */
    isInitialized(): boolean;
    /**
     * Get adapter configuration (read-only)
     */
    getConfig(): Readonly<PlatformConfig> | undefined;
    /**
     * Set adapter status and emit event
     */
    protected _setStatus(newStatus: 'disconnected' | 'connecting' | 'connected' | 'error'): void;
    /**
     * Handle incoming messages
     */
    protected _handleMessage(message: unknown): void;
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
//# sourceMappingURL=BasePlatformAdapter.d.ts.map