/**
 * @fileoverview Platform adapter factory
 */
import { IAdapterFactory, IPlatformAdapter, PlatformType, AdapterConfig } from './types';
/**
 * Platform adapter factory
 */
export declare class AdapterFactory implements IAdapterFactory {
    private static instance?;
    /**
     * Get singleton instance
     */
    static getInstance(): AdapterFactory;
    /**
     * Create platform adapter
     */
    createAdapter(platform: PlatformType, config: AdapterConfig): IPlatformAdapter;
    /**
     * Get supported platforms
     */
    getSupportedPlatforms(): PlatformType[];
    /**
     * Get default configuration for platform
     */
    getDefaultConfig(platform: PlatformType): Partial<AdapterConfig>;
    /**
     * Validate adapter configuration
     */
    validateConfig(config: AdapterConfig): boolean;
    /**
     * Validate Twitter configuration
     */
    private validateTwitterConfig;
    /**
     * Validate LinkedIn configuration
     */
    private validateLinkedInConfig;
    /**
     * Validate GitHub configuration
     */
    private validateGitHubConfig;
    /**
     * Create adapter with validation
     */
    createValidatedAdapter(platform: PlatformType, config: AdapterConfig): IPlatformAdapter;
    /**
     * Get platform-specific configuration template
     */
    getConfigTemplate(platform: PlatformType): Record<string, any>;
    /**
     * Get platform capabilities
     */
    getPlatformCapabilities(platform: PlatformType): Record<string, any>;
    /**
     * Create multiple adapters from configuration
     */
    createAdaptersFromConfig(configs: Record<string, AdapterConfig>): Map<string, IPlatformAdapter>;
    /**
     * Get adapter information
     */
    getAdapterInfo(platform: PlatformType): Record<string, any>;
}
//# sourceMappingURL=AdapterFactory.d.ts.map