"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
class ConfigManager {
    config;
    configStore;
    listeners;
    cache;
    version;
    versionHistory;
    patternWatchers;
    keyVersions;
    constructor(config) {
        this.config = config;
        this.configStore = new Map();
        this.listeners = new Map();
        this.cache = new Map();
        this.version = 0;
        this.versionHistory = new Map();
        this.patternWatchers = new Map();
        this.keyVersions = new Map();
    }
    async initialize() {
        switch (this.config.provider) {
            case 'memory':
                break;
            case 'file':
                await this.loadFromFile();
                break;
            case 'consul':
            case 'etcd':
                await this.connectToDistributedStore();
                break;
        }
        if (this.config.watchEnabled) {
            this.startWatching();
        }
    }
    async get(key) {
        if (this.config.cacheEnabled) {
            const cached = this.cache.get(key);
            if (cached && cached.expiry > Date.now()) {
                return cached.value;
            }
        }
        const configValue = this.configStore.get(key);
        if (!configValue) {
            return undefined;
        }
        let value = configValue.value;
        if (configValue.encrypted && this.config.encryptionEnabled) {
            value = this.decrypt(value);
        }
        if (this.config.cacheEnabled) {
            this.cache.set(key, {
                value,
                expiry: Date.now() + this.config.cacheTtl
            });
        }
        return value;
    }
    async set(key, value, encrypted = false) {
        const oldValue = this.configStore.get(key);
        let finalValue = value;
        if (encrypted && this.config.encryptionEnabled) {
            finalValue = this.encrypt(value);
        }
        const keyVersion = (this.keyVersions.get(key) || 0) + 1;
        this.keyVersions.set(key, keyVersion);
        const configValue = {
            key,
            value: finalValue,
            version: keyVersion,
            timestamp: Date.now(),
            encrypted
        };
        this.configStore.set(key, configValue);
        if (!this.versionHistory.has(key)) {
            this.versionHistory.set(key, []);
        }
        this.versionHistory.get(key).push(configValue);
        if (this.config.cacheEnabled) {
            this.cache.delete(key);
        }
        this.notifyListeners(key, oldValue?.value, value);
        if (this.config.auditEnabled) {
            this.auditLog('SET', key, value);
        }
        if (this.config.backupEnabled) {
            await this.backup();
        }
    }
    async delete(key) {
        const existed = this.configStore.has(key);
        if (existed) {
            const oldValue = this.configStore.get(key);
            this.configStore.delete(key);
            if (this.config.cacheEnabled) {
                this.cache.delete(key);
            }
            if (oldValue) {
                this.notifyListeners(key, oldValue.value, undefined);
            }
            if (this.config.auditEnabled) {
                this.auditLog('DELETE', key, undefined);
            }
        }
        return existed;
    }
    watch(key, listener) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(listener);
    }
    unwatch(key, listener) {
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.delete(listener);
            if (keyListeners.size === 0) {
                this.listeners.delete(key);
            }
        }
    }
    async keys() {
        return Array.from(this.configStore.keys());
    }
    async clear() {
        this.configStore.clear();
        this.cache.clear();
        this.listeners.clear();
        if (this.config.auditEnabled) {
            this.auditLog('CLEAR', '*', undefined);
        }
    }
    async close() {
        this.listeners.clear();
        this.cache.clear();
        switch (this.config.provider) {
            case 'consul':
            case 'etcd':
                await this.disconnectFromDistributedStore();
                break;
        }
    }
    destroy() {
        this.listeners.clear();
        this.cache.clear();
        this.configStore.clear();
    }
    setPermission(permission) {
        const key = `permission:${permission.userId}`;
        this.configStore.set(key, {
            key,
            value: permission,
            version: ++this.version,
            timestamp: Date.now(),
            encrypted: false
        });
    }
    async setConfig(key, value, userId) {
        await this.set(key, value, false);
    }
    async getConfig(key, userId) {
        return await this.get(key);
    }
    watchConfig(pattern, listener) {
        const watcherId = `watcher_${Date.now()}_${Math.random()}`;
        const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        this.patternWatchers.set(watcherId, { pattern: regex, listener });
        return watcherId;
    }
    unwatchConfig(watcherId) {
    }
    async getConfigVersion(key) {
        const configValue = this.configStore.get(key);
        return configValue ? configValue.version : 0;
    }
    async rollbackConfig(key, version, userId) {
        const history = this.versionHistory.get(key);
        if (!history || history.length === 0) {
            throw new Error(`No version history found for key: ${key}`);
        }
        const targetVersion = history.find(v => v.version === version);
        if (!targetVersion) {
            throw new Error(`Version ${version} not found for key: ${key}`);
        }
        const configValue = {
            key,
            value: targetVersion.value,
            version: targetVersion.version,
            timestamp: Date.now(),
            encrypted: targetVersion.encrypted
        };
        this.configStore.set(key, configValue);
        if (this.config.cacheEnabled) {
            this.cache.delete(key);
        }
        if (this.config.auditEnabled) {
            this.auditLog('ROLLBACK', key, targetVersion.value);
        }
    }
    getConfigVersions(key) {
        return this.versionHistory.get(key) || [];
    }
    async loadFromFile() {
    }
    async connectToDistributedStore() {
    }
    async disconnectFromDistributedStore() {
    }
    startWatching() {
    }
    encrypt(value) {
        return Buffer.from(JSON.stringify(value)).toString('base64');
    }
    decrypt(encrypted) {
        try {
            return JSON.parse(Buffer.from(encrypted, 'base64').toString());
        }
        catch {
            return encrypted;
        }
    }
    notifyListeners(key, oldValue, newValue) {
        let changeType;
        if (oldValue === undefined && newValue !== undefined) {
            changeType = 'create';
        }
        else if (oldValue !== undefined && newValue === undefined) {
            changeType = 'delete';
        }
        else {
            changeType = 'update';
        }
        const event = {
            key,
            oldValue,
            newValue,
            timestamp: Date.now(),
            changeType
        };
        const keyListeners = this.listeners.get(key);
        if (keyListeners) {
            keyListeners.forEach(listener => {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error(`Error in config change listener for key ${key}:`, error);
                }
            });
        }
        this.patternWatchers.forEach((watcher, watcherId) => {
            if (watcher.pattern.test(key)) {
                try {
                    watcher.listener(event);
                }
                catch (error) {
                    console.error(`Error in pattern watcher ${watcherId} for key ${key}:`, error);
                }
            }
        });
    }
    auditLog(operation, key, value) {
        console.log(`[ConfigManager Audit] ${operation} ${key} at ${new Date().toISOString()}`);
    }
    async backup() {
    }
}
exports.ConfigManager = ConfigManager;
