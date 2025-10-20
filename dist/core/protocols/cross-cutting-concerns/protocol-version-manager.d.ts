/**
 * MPLP协议版本管理器
 *
 * @description L3层统一版本管理，提供协议版本控制和兼容性检查
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
/**
 * 版本信息接口
 */
export interface VersionInfo {
    version: string;
    releaseDate: string;
    features: string[];
    deprecations?: string[];
    breakingChanges?: string[];
}
/**
 * 兼容性检查结果
 */
export interface CompatibilityResult {
    compatible: boolean;
    warnings: string[];
    errors: string[];
    recommendations: string[];
}
/**
 * MPLP协议版本管理器
 *
 * @description 统一的版本管理实现，等待CoreOrchestrator激活
 */
export declare class MLPPProtocolVersionManager {
    private readonly currentVersion;
    private supportedVersions;
    /**
     * 获取当前协议版本
     */
    getCurrentVersion(): string;
    /**
     * 获取支持的版本列表
     */
    getSupportedVersions(): VersionInfo[];
    /**
     * 检查版本兼容性
     */
    checkCompatibility(_requestedVersion: string): CompatibilityResult;
    /**
     * 验证协议版本格式
     */
    validateVersionFormat(_version: string): boolean;
    /**
     * 获取版本信息
     */
    getVersionInfo(_version: string): VersionInfo | null;
    /**
     * 注册新版本
     */
    registerVersion(_versionInfo: VersionInfo): boolean;
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=protocol-version-manager.d.ts.map