"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextEntity = void 0;
const utils_1 = require("../../../../shared/utils");
class ContextEntity {
    data;
    constructor(data) {
        this.data = this.initializeData(data);
        this.validateInvariants();
    }
    get contextId() {
        return this.data.contextId;
    }
    get name() {
        return this.data.name;
    }
    get description() {
        return this.data.description;
    }
    get status() {
        return this.data.status;
    }
    get lifecycleStage() {
        return this.data.lifecycleStage;
    }
    get protocolVersion() {
        return this.data.protocolVersion;
    }
    get timestamp() {
        return this.data.timestamp;
    }
    get sharedState() {
        const defaultState = {
            variables: {},
            resources: { allocated: {}, limits: {} },
            dependencies: [],
            goals: []
        };
        if (!this.data.sharedState)
            return defaultState;
        return {
            variables: this.data.sharedState.variables || {},
            resources: this.data.sharedState.resources || { allocated: {}, limits: {} },
            dependencies: this.data.sharedState.dependencies || [],
            goals: this.data.sharedState.goals || []
        };
    }
    get accessControl() {
        const defaultAccess = {
            owner: { userId: '', role: '' },
            permissions: []
        };
        if (!this.data.accessControl)
            return defaultAccess;
        return {
            owner: this.data.accessControl.owner || { userId: '', role: '' },
            permissions: this.data.accessControl.permissions || [],
            policies: this.data.accessControl.policies
        };
    }
    get configuration() {
        const defaultConfig = {
            timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 },
            persistence: { enabled: true, storageBackend: 'memory' }
        };
        if (!this.data.configuration)
            return defaultConfig;
        return {
            timeoutSettings: this.data.configuration.timeoutSettings || { defaultTimeout: 30000, maxTimeout: 300000 },
            persistence: this.data.configuration.persistence || { enabled: true, storageBackend: 'memory' },
            notificationSettings: this.data.configuration.notificationSettings
        };
    }
    get auditTrail() {
        return this.data.auditTrail;
    }
    get createdAt() {
        return this.data.createdAt;
    }
    get updatedAt() {
        return this.data.updatedAt;
    }
    get version() {
        return this.data.version;
    }
    get tags() {
        return this.data.tags;
    }
    updateName(newName) {
        if (!newName || newName.trim().length === 0) {
            throw new Error('Context name cannot be empty');
        }
        if (newName.length > 255) {
            throw new Error('Context name cannot exceed 255 characters');
        }
        this.data.name = newName.trim();
        this.updateTimestamp();
    }
    updateDescription(newDescription) {
        if (newDescription && newDescription.length > 1000) {
            throw new Error('Context description cannot exceed 1000 characters');
        }
        this.data.description = newDescription;
        this.updateTimestamp();
    }
    changeStatus(newStatus) {
        if (!this.isValidStatusTransition(this.data.status, newStatus)) {
            throw new Error(`Invalid status transition from ${this.data.status} to ${newStatus}`);
        }
        this.data.status = newStatus;
        this.updateTimestamp();
    }
    advanceLifecycleStage(newStage) {
        if (!this.isValidLifecycleTransition(this.data.lifecycleStage, newStage)) {
            throw new Error(`Invalid lifecycle transition from ${this.data.lifecycleStage} to ${newStage}`);
        }
        this.data.lifecycleStage = newStage;
        this.updateTimestamp();
    }
    updateSharedState(updates) {
        this.data.sharedState = {
            ...this.data.sharedState,
            ...updates
        };
        this.updateTimestamp();
    }
    updateAccessControl(updates) {
        this.data.accessControl = {
            ...this.data.accessControl,
            ...updates
        };
        this.updateTimestamp();
    }
    updateConfiguration(updates) {
        this.data.configuration = {
            ...this.data.configuration,
            ...updates
        };
        this.updateTimestamp();
    }
    canBeDeleted() {
        return this.data.status === 'terminated' || this.data.status === 'completed';
    }
    isActive() {
        return this.data.status === 'active';
    }
    toData() {
        return { ...this.data };
    }
    initializeData(data) {
        const now = (0, utils_1.getCurrentTimestamp)();
        return {
            protocolVersion: data.protocolVersion || '1.0.0',
            timestamp: data.timestamp || now,
            contextId: data.contextId || (0, utils_1.generateUUID)(),
            name: data.name || 'Unnamed Context',
            description: data.description,
            status: data.status || 'active',
            lifecycleStage: data.lifecycleStage || 'planning',
            sharedState: data.sharedState || {
                variables: {},
                resources: { allocated: {}, limits: {} },
                dependencies: [],
                goals: []
            },
            accessControl: data.accessControl || {
                owner: { userId: 'system', role: 'admin' },
                permissions: []
            },
            configuration: data.configuration || {
                timeoutSettings: { defaultTimeout: 30000, maxTimeout: 300000 },
                persistence: { enabled: true, storageBackend: 'memory' }
            },
            auditTrail: data.auditTrail || {
                enabled: true,
                retentionDays: 90,
                auditEvents: []
            },
            monitoringIntegration: data.monitoringIntegration || { enabled: false },
            performanceMetrics: data.performanceMetrics || { enabled: false },
            versionHistory: data.versionHistory || { enabled: false, maxVersions: 10 },
            searchMetadata: data.searchMetadata || { enabled: false, indexingStrategy: 'basic' },
            cachingPolicy: data.cachingPolicy || { enabled: false, cacheStrategy: 'lru' },
            syncConfiguration: data.syncConfiguration || { enabled: false, syncStrategy: 'manual' },
            errorHandling: data.errorHandling || { enabled: true, errorPolicies: [] },
            integrationEndpoints: data.integrationEndpoints || { enabled: false },
            eventIntegration: data.eventIntegration || { enabled: false }
        };
    }
    validateInvariants() {
        if (!this.data.contextId) {
            throw new Error('Context ID is required');
        }
        if (!this.data.name || this.data.name.trim().length === 0) {
            throw new Error('Context name is required');
        }
        if (this.data.name.length > 255) {
            throw new Error('Context name cannot exceed 255 characters');
        }
        if (this.data.description && this.data.description.length > 1000) {
            throw new Error('Context description cannot exceed 1000 characters');
        }
    }
    update(updateData) {
        const updatedData = {
            ...this.data,
            ...updateData,
            timestamp: (0, utils_1.getCurrentTimestamp)()
        };
        return new ContextEntity(updatedData);
    }
    updateTimestamp() {
        this.data.timestamp = (0, utils_1.getCurrentTimestamp)();
    }
    isValidStatusTransition(from, to) {
        const validTransitions = {
            'active': ['suspended', 'completed', 'terminated'],
            'suspended': ['active', 'terminated'],
            'completed': ['terminated'],
            'terminated': []
        };
        return validTransitions[from]?.includes(to) || false;
    }
    isValidLifecycleTransition(from, to) {
        const validTransitions = {
            'planning': ['executing'],
            'executing': ['monitoring', 'completed'],
            'monitoring': ['executing', 'completed'],
            'completed': []
        };
        return validTransitions[from]?.includes(to) || false;
    }
}
exports.ContextEntity = ContextEntity;
