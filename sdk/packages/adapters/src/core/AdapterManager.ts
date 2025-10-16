/**
 * @fileoverview Platform adapter manager - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */

import { MPLPEventManager } from './MPLPEventManager';
import {
  IAdapterManager,
  IPlatformAdapter,
  ContentItem,
  ActionResult,
  ContentMetrics,
  AdapterEvents
} from './types';

/**
 * Platform adapter manager - 基于MPLP V1.0 Alpha事件架构
 */
export class AdapterManager implements IAdapterManager {
  private eventManager: MPLPEventManager;
  private _adapters = new Map<string, IPlatformAdapter>();

  constructor() {
    this.eventManager = new MPLPEventManager();
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
   * Get all adapters
   */
  public get adapters(): Map<string, IPlatformAdapter> {
    return new Map(this._adapters);
  }

  /**
   * Add adapter to manager
   */
  public async addAdapter(name: string, adapter: IPlatformAdapter): Promise<void> {
    try {
      // Initialize adapter
      await adapter.initialize();
      
      // Authenticate if credentials are provided
      if (adapter.config.auth.credentials && Object.keys(adapter.config.auth.credentials).length > 0) {
        await adapter.authenticate();
      }

      // Setup event forwarding
      this.setupAdapterEvents(name, adapter);

      // Add to collection
      this._adapters.set(name, adapter);

      this.emit('adapter:added', name, adapter);
    } catch (error) {
      this.emit('adapter:error', name, error);
      throw error;
    }
  }

  /**
   * Remove adapter from manager
   */
  public async removeAdapter(name: string): Promise<void> {
    const adapter = this._adapters.get(name);
    if (!adapter) {
      return;
    }

    try {
      // Stop monitoring if active
      await adapter.stopMonitoring();
      
      // Disconnect adapter
      await adapter.disconnect();

      // Remove event listeners
      adapter.removeAllListeners();

      // Remove from collection
      this._adapters.delete(name);

      this.emit('adapter:removed', name);
    } catch (error) {
      this.emit('adapter:error', name, error);
      throw error;
    }
  }

  /**
   * Get adapter by name
   */
  public getAdapter(name: string): IPlatformAdapter | undefined {
    return this._adapters.get(name);
  }

  /**
   * Get adapters by platform
   */
  public getAdaptersByPlatform(platform: string): IPlatformAdapter[] {
    return Array.from(this._adapters.values()).filter(
      adapter => adapter.config.platform === platform
    );
  }

  /**
   * Post content to all adapters
   */
  public async postToAll(content: ContentItem, platforms?: string[]): Promise<Map<string, ActionResult>> {
    const results = new Map<string, ActionResult>();
    const targetAdapters = platforms 
      ? Array.from(this._adapters.entries()).filter(([name]) => platforms.includes(name))
      : Array.from(this._adapters.entries());

    // Post to all adapters in parallel
    const promises = targetAdapters.map(async ([name, adapter]) => {
      try {
        if (!adapter.capabilities.canPost) {
          return [name, {
            success: false,
            error: `Platform ${adapter.config.platform} does not support posting`,
            timestamp: new Date()
          }] as const;
        }

        const result = await adapter.post(content);
        return [name, result] as const;
      } catch (error) {
        return [name, {
          success: false,
          error: (error as Error).message,
          timestamp: new Date()
        }] as const;
      }
    });

    const resolvedResults = await Promise.all(promises);
    resolvedResults.forEach(([name, result]) => {
      results.set(name, result);
    });

    this.emit('bulk:post:complete', results);
    return results;
  }

  /**
   * Post content to multiple specific adapters
   */
  public async postToMultiple(content: ContentItem, platforms: string[]): Promise<Map<string, ActionResult>> {
    return this.postToAll(content, platforms);
  }

  /**
   * Start monitoring on all adapters
   */
  public async startMonitoringAll(): Promise<void> {
    const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
      try {
        await adapter.startMonitoring();
      } catch (error) {
        this.emit('adapter:error', name, error);
      }
    });

    await Promise.all(promises);
    this.emit('monitoring:started:all');
  }

  /**
   * Stop monitoring on all adapters
   */
  public async stopMonitoringAll(): Promise<void> {
    const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
      try {
        await adapter.stopMonitoring();
      } catch (error) {
        this.emit('adapter:error', name, error);
      }
    });

    await Promise.all(promises);
    this.emit('monitoring:stopped:all');
  }

  /**
   * Get aggregated analytics for a post across all platforms
   */
  public async getAggregatedAnalytics(postId: string): Promise<Map<string, ContentMetrics>> {
    const analytics = new Map<string, ContentMetrics>();

    const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
      try {
        if (!adapter.capabilities.supportsAnalytics) {
          return [name, {}] as const;
        }

        const metrics = await adapter.getAnalytics(postId);
        return [name, metrics] as const;
      } catch (error) {
        // Ignore errors for individual adapters
        return [name, {}] as const;
      }
    });

    const results = await Promise.all(promises);
    results.forEach(([name, metrics]) => {
      analytics.set(name, metrics);
    });

    return analytics;
  }

  /**
   * Bulk follow operation across platforms
   */
  public async followOnAll(userId: string, platforms?: string[]): Promise<Map<string, ActionResult>> {
    const results = new Map<string, ActionResult>();
    const targetAdapters = platforms 
      ? Array.from(this._adapters.entries()).filter(([name]) => platforms.includes(name))
      : Array.from(this._adapters.entries());

    const promises = targetAdapters.map(async ([name, adapter]) => {
      try {
        if (!adapter.capabilities.canFollow) {
          return [name, {
            success: false,
            error: `Platform ${adapter.config.platform} does not support following`,
            timestamp: new Date()
          }] as const;
        }

        const result = await adapter.follow(userId);
        return [name, result] as const;
      } catch (error) {
        return [name, {
          success: false,
          error: (error as Error).message,
          timestamp: new Date()
        }] as const;
      }
    });

    const resolvedResults = await Promise.all(promises);
    resolvedResults.forEach(([name, result]) => {
      results.set(name, result);
    });

    return results;
  }

  /**
   * Search across all platforms
   */
  public async searchAll(query: string, options?: any): Promise<Map<string, ContentItem[]>> {
    const results = new Map<string, ContentItem[]>();

    const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
      try {
        const items = await adapter.search(query, options);
        return [name, items] as const;
      } catch (error) {
        return [name, []] as const;
      }
    });

    const resolvedResults = await Promise.all(promises);
    resolvedResults.forEach(([name, items]) => {
      results.set(name, items as ContentItem[]);
    });

    return results;
  }

  /**
   * Get status of all adapters
   */
  public getAdapterStatuses(): Map<string, any> {
    const statuses = new Map<string, any>();

    this._adapters.forEach((adapter, name) => {
      statuses.set(name, {
        platform: adapter.config.platform,
        enabled: adapter.config.enabled,
        authenticated: adapter.isAuthenticated,
        rateLimitInfo: adapter.rateLimitInfo,
        capabilities: adapter.capabilities
      });
    });

    return statuses;
  }

  /**
   * Disconnect all adapters
   */
  public async disconnectAll(): Promise<void> {
    const promises = Array.from(this._adapters.entries()).map(async ([name, adapter]) => {
      try {
        await adapter.disconnect();
      } catch (error) {
        this.emit('adapter:error', name, error);
      }
    });

    await Promise.all(promises);
    this._adapters.clear();
    this.emit('adapters:disconnected:all');
  }

  /**
   * Setup event forwarding for adapter
   */
  private setupAdapterEvents(name: string, adapter: IPlatformAdapter): void {
    // Forward all adapter events with adapter name
    const events: (keyof AdapterEvents)[] = [
      'adapter:ready',
      'adapter:error',
      'adapter:ratelimit',
      'content:posted',
      'content:liked',
      'content:shared',
      'content:commented',
      'webhook:received',
      'mention:received',
      'message:received'
    ];

    events.forEach(event => {
      adapter.on(event, (...args: any[]) => {
        this.emit(event, name, ...args);
      });
    });

    // Setup custom events
    adapter.on('authenticated', () => {
      this.emit('adapter:authenticated', name, adapter);
    });

    adapter.on('disconnected', () => {
      this.emit('adapter:disconnected', name, adapter);
    });

    adapter.on('monitoring:started', () => {
      this.emit('adapter:monitoring:started', name, adapter);
    });

    adapter.on('monitoring:stopped', () => {
      this.emit('adapter:monitoring:stopped', name, adapter);
    });
  }

  /**
   * Get adapter count by platform
   */
  public getAdapterCountByPlatform(): Map<string, number> {
    const counts = new Map<string, number>();

    this._adapters.forEach(adapter => {
      const platform = adapter.config.platform;
      counts.set(platform, (counts.get(platform) || 0) + 1);
    });

    return counts;
  }

  /**
   * Get authenticated adapters
   */
  public getAuthenticatedAdapters(): Map<string, IPlatformAdapter> {
    const authenticated = new Map<string, IPlatformAdapter>();

    this._adapters.forEach((adapter, name) => {
      if (adapter.isAuthenticated) {
        authenticated.set(name, adapter);
      }
    });

    return authenticated;
  }

  /**
   * Validate all adapter configurations
   */
  public validateAllConfigurations(): Map<string, boolean> {
    const validations = new Map<string, boolean>();

    this._adapters.forEach((adapter, name) => {
      try {
        // Basic validation - check if required fields are present
        const isValid = !!(
          adapter.config.platform &&
          adapter.config.name &&
          adapter.config.version &&
          adapter.config.auth
        );
        validations.set(name, isValid);
      } catch (error) {
        validations.set(name, false);
      }
    });

    return validations;
  }
}
