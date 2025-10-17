export interface ConfigManagerConfig {
    provider: 'memory' | 'file' | 'consul' | 'etcd';
    environment: string;
    encryptionEnabled: boolean;
    auditEnabled: boolean;
    cacheEnabled: boolean;
    cacheTtl: number;
    watchEnabled: boolean;
    backupEnabled: boolean;
    configPath?: string;
    endpoints?: string[];
}
export interface ConfigValue {
    key: string;
    value: any;
    version: number;
    timestamp: number;
    encrypted: boolean;
}
export interface ConfigChangeEvent {
    key: string;
    oldValue: any;
    newValue: any;
    timestamp: number;
    changeType?: 'create' | 'update' | 'delete';
}
export type ConfigChangeListener = (event: ConfigChangeEvent) => void;
export declare class ConfigManager {
    private config;
    private configStore;
    private listeners;
    private cache;
    private version;
    private versionHistory;
    private patternWatchers;
    private keyVersions;
    constructor(config: ConfigManagerConfig);
    initialize(): Promise<void>;
    get<T = any>(key: string): Promise<T | undefined>;
    set(key: string, value: any, encrypted?: boolean): Promise<void>;
    delete(key: string): Promise<boolean>;
    watch(key: string, listener: ConfigChangeListener): void;
    unwatch(key: string, listener: ConfigChangeListener): void;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
    close(): Promise<void>;
    destroy(): void;
    setPermission(permission: any): void;
    setConfig(key: string, value: any, userId?: string): Promise<void>;
    getConfig(key: string, userId?: string): Promise<any>;
    watchConfig(pattern: string, listener: ConfigChangeListener): string;
    unwatchConfig(watcherId: string): void;
    getConfigVersion(key: string): Promise<number>;
    rollbackConfig(key: string, version: number, userId?: string): Promise<void>;
    getConfigVersions(key: string): ConfigValue[];
    private loadFromFile;
    private connectToDistributedStore;
    private disconnectFromDistributedStore;
    private startWatching;
    private encrypt;
    private decrypt;
    private notifyListeners;
    private auditLog;
    private backup;
}
//# sourceMappingURL=config.manager.d.ts.map