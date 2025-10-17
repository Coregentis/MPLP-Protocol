/**
 * @fileoverview Hot reload manager implementation
 */
import { EventEmitter } from 'events';
import { DevServerConfig, IHotReloadManager, WebSocketMessage } from './types';
/**
 * Hot reload manager implementation
 */
export declare class HotReloadManager extends EventEmitter implements IHotReloadManager {
    private eventManager;
    private readonly config;
    private clients;
    private _isEnabled;
    constructor(config: DevServerConfig);
    on(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    off(event: string, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string): this;
    /**
     * Get enabled status
     */
    get isEnabled(): boolean;
    /**
     * Get connected clients count
     */
    get connectedClients(): number;
    /**
     * Enable hot reload
     */
    enable(): void;
    /**
     * Disable hot reload
     */
    disable(): void;
    /**
     * Reload all clients
     */
    reload(files?: string[]): void;
    /**
     * Update specific files
     */
    update(files: string[]): void;
    /**
     * Add client
     */
    addClient(client: any): void;
    /**
     * Remove client
     */
    removeClient(client: any): void;
    /**
     * Broadcast message to all clients
     */
    broadcast(message: WebSocketMessage): void;
}
//# sourceMappingURL=HotReloadManager.d.ts.map