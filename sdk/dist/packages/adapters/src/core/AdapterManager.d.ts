/**
 * @fileoverview Platform adapter manager - MPLP V1.1.0 Beta
 * @based_on MPLP V1.0 Alpha事件架构
 */
import { IAdapterManager, IPlatformAdapter, ContentItem, ActionResult, ContentMetrics } from './types';
/**
 * Platform adapter manager - 基于MPLP V1.0 Alpha事件架构
 */
export declare class AdapterManager implements IAdapterManager {
    private eventManager;
    private _adapters;
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
     * Get all adapters
     */
    get adapters(): Map<string, IPlatformAdapter>;
    /**
     * Add adapter to manager
     */
    addAdapter(name: string, adapter: IPlatformAdapter): Promise<void>;
    /**
     * Remove adapter from manager
     */
    removeAdapter(name: string): Promise<void>;
    /**
     * Get adapter by name
     */
    getAdapter(name: string): IPlatformAdapter | undefined;
    /**
     * Get adapters by platform
     */
    getAdaptersByPlatform(platform: string): IPlatformAdapter[];
    /**
     * Post content to all adapters
     */
    postToAll(content: ContentItem, platforms?: string[]): Promise<Map<string, ActionResult>>;
    /**
     * Post content to multiple specific adapters
     */
    postToMultiple(content: ContentItem, platforms: string[]): Promise<Map<string, ActionResult>>;
    /**
     * Start monitoring on all adapters
     */
    startMonitoringAll(): Promise<void>;
    /**
     * Stop monitoring on all adapters
     */
    stopMonitoringAll(): Promise<void>;
    /**
     * Get aggregated analytics for a post across all platforms
     */
    getAggregatedAnalytics(postId: string): Promise<Map<string, ContentMetrics>>;
    /**
     * Bulk follow operation across platforms
     */
    followOnAll(userId: string, platforms?: string[]): Promise<Map<string, ActionResult>>;
    /**
     * Search across all platforms
     */
    searchAll(query: string, options?: any): Promise<Map<string, ContentItem[]>>;
    /**
     * Get status of all adapters
     */
    getAdapterStatuses(): Map<string, any>;
    /**
     * Disconnect all adapters
     */
    disconnectAll(): Promise<void>;
    /**
     * Setup event forwarding for adapter
     */
    private setupAdapterEvents;
    /**
     * Get adapter count by platform
     */
    getAdapterCountByPlatform(): Map<string, number>;
    /**
     * Get authenticated adapters
     */
    getAuthenticatedAdapters(): Map<string, IPlatformAdapter>;
    /**
     * Validate all adapter configurations
     */
    validateAllConfigurations(): Map<string, boolean>;
}
//# sourceMappingURL=AdapterManager.d.ts.map