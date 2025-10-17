export interface VersionInfo {
    version: string;
    releaseDate: string;
    features: string[];
    deprecations?: string[];
    breakingChanges?: string[];
}
export interface CompatibilityResult {
    compatible: boolean;
    warnings: string[];
    errors: string[];
    recommendations: string[];
}
export declare class MLPPProtocolVersionManager {
    private readonly currentVersion;
    private supportedVersions;
    getCurrentVersion(): string;
    getSupportedVersions(): VersionInfo[];
    checkCompatibility(_requestedVersion: string): CompatibilityResult;
    validateVersionFormat(_version: string): boolean;
    getVersionInfo(_version: string): VersionInfo | null;
    registerVersion(_versionInfo: VersionInfo): boolean;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=protocol-version-manager.d.ts.map