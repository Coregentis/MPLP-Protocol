/**
 * @fileoverview Hot reload manager implementation
 */

import { EventEmitter } from 'events';
import { MPLPEventManager } from '../core/MPLPEventManager';
import { DevServerConfig, IHotReloadManager, WebSocketMessage } from './types';

/**
 * Hot reload manager implementation
 */
export class HotReloadManager extends EventEmitter implements IHotReloadManager {
  private eventManager: MPLPEventManager;
  private readonly config: DevServerConfig;
  private clients: Set<any> = new Set();
  private _isEnabled = false;

  constructor(config: DevServerConfig) {
    super();
    this.eventManager = new MPLPEventManager();
    this.config = config;
  }

  // ===== EventEmitter兼容方法 =====
  public on(event: string, listener: (...args: any[]) => void): this { this.eventManager.on(event, listener); return this; }
  public emit(event: string, ...args: any[]): boolean { return this.eventManager.emit(event, ...args); }
  public off(event: string, listener: (...args: any[]) => void): this { this.eventManager.off(event, listener); return this; }
  public removeAllListeners(event?: string): this { this.eventManager.removeAllListeners(event); return this; }

  /**
   * Get enabled status
   */
  public get isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Get connected clients count
   */
  public get connectedClients(): number {
    return this.clients.size;
  }

  /**
   * Enable hot reload
   */
  public enable(): void {
    this._isEnabled = true;
    this.emit('hotreload:enable');
  }

  /**
   * Disable hot reload
   */
  public disable(): void {
    this._isEnabled = false;
    this.clients.clear();
    this.emit('hotreload:disable');
  }

  /**
   * Reload all clients
   */
  public reload(files?: string[]): void {
    if (!this._isEnabled) {
      return;
    }

    const message: WebSocketMessage = {
      type: 'hot-reload',
      data: {
        action: 'reload',
        files: files || [],
        timestamp: Date.now()
      }
    };

    this.broadcast(message);
    this.emit('hotreload:reload', files);
  }

  /**
   * Update specific files
   */
  public update(files: string[]): void {
    if (!this._isEnabled) {
      return;
    }

    const message: WebSocketMessage = {
      type: 'hot-reload',
      data: {
        action: 'update',
        files,
        timestamp: Date.now()
      }
    };

    this.broadcast(message);
    this.emit('hotreload:update', files);
  }

  /**
   * Add client
   */
  public addClient(client: any): void {
    this.clients.add(client);
    this.emit('client:connect', client);
  }

  /**
   * Remove client
   */
  public removeClient(client: any): void {
    this.clients.delete(client);
    this.emit('client:disconnect', client);
  }

  /**
   * Broadcast message to all clients
   */
  public broadcast(message: WebSocketMessage): void {
    if (!this._isEnabled) {
      return;
    }

    // In a real implementation, this would send WebSocket messages
    // For now, we'll just emit an event
    this.emit('broadcast', message);
    
    // Simulate sending to clients
    for (const client of this.clients) {
      try {
        // client.send(JSON.stringify(message));
      } catch (error) {
        // Remove disconnected clients
        this.clients.delete(client);
      }
    }
  }
}
