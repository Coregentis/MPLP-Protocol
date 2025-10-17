"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionEntity = void 0;
class ExtensionEntity {
    extensionId;
    contextId;
    protocolVersion;
    _name;
    _displayName;
    _description;
    _version;
    _extensionType;
    _status;
    _timestamp;
    _compatibility;
    _configuration;
    _extensionPoints;
    _apiExtensions;
    _eventSubscriptions;
    _lifecycle;
    _security;
    _metadata;
    _auditTrail;
    _performanceMetrics;
    _monitoringIntegration;
    _versionHistory;
    _searchMetadata;
    _eventIntegration;
    constructor(data) {
        this.validateRequiredFields(data);
        this.extensionId = data.extensionId;
        this.contextId = data.contextId;
        this.protocolVersion = data.protocolVersion;
        this._name = data.name;
        this._displayName = data.displayName;
        this._description = data.description;
        this._version = data.version;
        this._extensionType = data.extensionType;
        this._status = data.status;
        this._timestamp = data.timestamp;
        this._compatibility = data.compatibility;
        this._configuration = data.configuration;
        this._extensionPoints = data.extensionPoints;
        this._apiExtensions = data.apiExtensions;
        this._eventSubscriptions = data.eventSubscriptions;
        this._lifecycle = data.lifecycle;
        this._security = data.security;
        this._metadata = data.metadata;
        this._auditTrail = data.auditTrail;
        this._performanceMetrics = data.performanceMetrics;
        this._monitoringIntegration = data.monitoringIntegration;
        this._versionHistory = data.versionHistory;
        this._searchMetadata = data.searchMetadata;
        this._eventIntegration = data.eventIntegration;
    }
    get name() { return this._name; }
    get displayName() { return this._displayName; }
    get description() { return this._description; }
    get version() { return this._version; }
    get extensionType() { return this._extensionType; }
    get status() { return this._status; }
    get timestamp() { return this._timestamp; }
    get compatibility() { return this._compatibility; }
    get configuration() { return this._configuration; }
    get extensionPoints() { return [...this._extensionPoints]; }
    get apiExtensions() { return [...this._apiExtensions]; }
    get eventSubscriptions() { return [...this._eventSubscriptions]; }
    get lifecycle() { return this._lifecycle; }
    get security() { return this._security; }
    get metadata() { return this._metadata; }
    get auditTrail() { return this._auditTrail; }
    get performanceMetrics() { return this._performanceMetrics; }
    get monitoringIntegration() { return this._monitoringIntegration; }
    get versionHistory() { return this._versionHistory; }
    get searchMetadata() { return this._searchMetadata; }
    get eventIntegration() { return this._eventIntegration; }
    activate(userId) {
        if (this._status === 'active') {
            return true;
        }
        if (this._status !== 'installed' && this._status !== 'inactive') {
            throw new Error(`Cannot activate extension in status: ${this._status}`);
        }
        if (!this.isCompatible()) {
            throw new Error('Extension is not compatible with current MPLP version');
        }
        this._status = 'active';
        this._timestamp = new Date().toISOString();
        this._lifecycle = {
            ...this._lifecycle,
            activationCount: this._lifecycle.activationCount + 1
        };
        this.addAuditEvent('activate', userId, {
            previousStatus: this._status,
            newStatus: 'active'
        });
        return true;
    }
    deactivate(userId) {
        if (this._status === 'inactive') {
            return true;
        }
        if (this._status !== 'active') {
            throw new Error(`Cannot deactivate extension in status: ${this._status}`);
        }
        const previousStatus = this._status;
        this._status = 'inactive';
        this._timestamp = new Date().toISOString();
        this.addAuditEvent('deactivate', userId, {
            previousStatus,
            newStatus: 'inactive'
        });
        return true;
    }
    markAsError(error, userId) {
        const previousStatus = this._status;
        this._status = 'error';
        this._timestamp = new Date().toISOString();
        this._lifecycle = {
            ...this._lifecycle,
            errorCount: this._lifecycle.errorCount + 1
        };
        this.addAuditEvent('error', userId, {
            previousStatus,
            newStatus: 'error',
            error: error || 'Unknown error'
        });
    }
    validate() {
        try {
            if (!this.extensionId || !this.contextId || !this.name || !this.version) {
                return false;
            }
            const validTypes = ['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer'];
            if (!validTypes.includes(this.extensionType)) {
                return false;
            }
            const validStatuses = ['installed', 'active', 'inactive', 'disabled', 'error', 'updating', 'uninstalling'];
            if (!validStatuses.includes(this.status)) {
                return false;
            }
            if (!this._configuration || typeof this._configuration !== 'object') {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    updateConfiguration(newConfig, userId) {
        this.validateConfiguration(newConfig);
        const previousConfig = { ...this._configuration.currentConfig };
        this._configuration = {
            ...this._configuration,
            currentConfig: newConfig
        };
        this._timestamp = new Date().toISOString();
        this.addAuditEvent('configure', userId, {
            previousConfig,
            newConfig
        });
    }
    updateVersion(newVersion, changelog, userId) {
        if (!this.isValidVersion(newVersion)) {
            throw new Error(`Invalid version format: ${newVersion}`);
        }
        const previousVersion = this._version;
        this._version = newVersion;
        this._timestamp = new Date().toISOString();
        this._versionHistory = {
            ...this._versionHistory,
            versions: [
                ...this._versionHistory.versions,
                {
                    version: newVersion,
                    releaseDate: new Date().toISOString(),
                    changelog,
                    breaking: this.isBreakingChange(previousVersion, newVersion),
                    deprecated: []
                }
            ]
        };
        this.addAuditEvent('update', userId, {
            previousVersion,
            newVersion,
            changelog
        });
    }
    addExtensionPoint(extensionPoint, userId) {
        if (this._extensionPoints.some(ep => ep.id === extensionPoint.id)) {
            throw new Error(`Extension point with ID '${extensionPoint.id}' already exists`);
        }
        this._extensionPoints = [...this._extensionPoints, extensionPoint];
        this._timestamp = new Date().toISOString();
        this.addAuditEvent('configure', userId, {
            action: 'add_extension_point',
            extensionPointId: extensionPoint.id,
            extensionPointType: extensionPoint.type
        });
    }
    removeExtensionPoint(extensionPointId, userId) {
        const index = this._extensionPoints.findIndex(ep => ep.id === extensionPointId);
        if (index === -1) {
            throw new Error(`Extension point with ID '${extensionPointId}' not found`);
        }
        this._extensionPoints = this._extensionPoints.filter(ep => ep.id !== extensionPointId);
        this._timestamp = new Date().toISOString();
        this.addAuditEvent('configure', userId, {
            action: 'remove_extension_point',
            extensionPointId
        });
    }
    updatePerformanceMetrics(metrics) {
        this._lifecycle = {
            ...this._lifecycle,
            performanceMetrics: {
                ...this._lifecycle.performanceMetrics,
                ...metrics
            }
        };
        this._performanceMetrics = {
            ...this._performanceMetrics,
            ...metrics,
            healthStatus: this.calculateHealthStatus(metrics)
        };
        this._timestamp = new Date().toISOString();
    }
    isActive() {
        return this._status === 'active';
    }
    hasError() {
        return this._status === 'error' || this._lifecycle.errorCount > 0;
    }
    isCompatible() {
        return true;
    }
    getHealthStatus() {
        return this._performanceMetrics.healthStatus;
    }
    hasExtensionPointType(type) {
        return this._extensionPoints.some(ep => ep.type === type);
    }
    getExtensionPointsByType(type) {
        return this._extensionPoints.filter(ep => ep.type === type);
    }
    toData() {
        return {
            protocolVersion: this.protocolVersion,
            timestamp: this._timestamp,
            extensionId: this.extensionId,
            contextId: this.contextId,
            name: this._name,
            displayName: this._displayName,
            description: this._description,
            version: this._version,
            extensionType: this._extensionType,
            status: this._status,
            compatibility: this._compatibility,
            configuration: this._configuration,
            extensionPoints: [...this._extensionPoints],
            apiExtensions: [...this._apiExtensions],
            eventSubscriptions: [...this._eventSubscriptions],
            lifecycle: this._lifecycle,
            security: this._security,
            metadata: this._metadata,
            auditTrail: this._auditTrail,
            performanceMetrics: this._performanceMetrics,
            monitoringIntegration: this._monitoringIntegration,
            versionHistory: this._versionHistory,
            searchMetadata: this._searchMetadata,
            eventIntegration: this._eventIntegration
        };
    }
    validateRequiredFields(data) {
        const requiredFields = ['extensionId', 'contextId', 'name', 'version', 'extensionType'];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }
    validateConfiguration(config) {
        if (!config || typeof config !== 'object') {
            throw new Error('Invalid configuration: must be an object');
        }
    }
    isValidVersion(version) {
        const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?(\+[a-zA-Z0-9-]+)?$/;
        return semverRegex.test(version);
    }
    isBreakingChange(oldVersion, newVersion) {
        const oldMajor = parseInt(oldVersion.split('.')[0]);
        const newMajor = parseInt(newVersion.split('.')[0]);
        return newMajor > oldMajor;
    }
    calculateHealthStatus(metrics) {
        const errorRate = metrics.errorRate ?? this._performanceMetrics.errorRate;
        const availability = metrics.availability ?? this._performanceMetrics.availability;
        if (errorRate > 0.1 || availability < 0.9) {
            return 'unhealthy';
        }
        else if (errorRate > 0.05 || availability < 0.95) {
            return 'degraded';
        }
        else {
            return 'healthy';
        }
    }
    addAuditEvent(eventType, userId, details) {
        const auditEvent = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date().toISOString(),
            eventType,
            userId,
            details: details || {},
            ipAddress: undefined,
            userAgent: undefined
        };
        this._auditTrail = {
            ...this._auditTrail,
            events: [...this._auditTrail.events, auditEvent]
        };
    }
}
exports.ExtensionEntity = ExtensionEntity;
