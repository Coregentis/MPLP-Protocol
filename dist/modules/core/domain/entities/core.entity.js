"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreEntity = void 0;
class CoreEntity {
    protocolVersion;
    timestamp;
    workflowId;
    orchestratorId;
    workflowConfig;
    executionContext;
    executionStatus;
    moduleCoordination;
    eventHandling;
    auditTrail;
    monitoringIntegration;
    performanceMetrics;
    versionHistory;
    searchMetadata;
    coreOperation;
    coreDetails;
    eventIntegration;
    constructor(data) {
        this.validateRequiredFields(data);
        this.protocolVersion = data.protocolVersion;
        this.timestamp = data.timestamp;
        this.workflowId = data.workflowId;
        this.orchestratorId = data.orchestratorId;
        this.workflowConfig = data.workflowConfig;
        this.executionContext = data.executionContext;
        this.executionStatus = data.executionStatus;
        this.moduleCoordination = data.moduleCoordination;
        this.eventHandling = data.eventHandling;
        this.auditTrail = data.auditTrail;
        this.monitoringIntegration = data.monitoringIntegration;
        this.performanceMetrics = data.performanceMetrics;
        this.versionHistory = data.versionHistory;
        this.searchMetadata = data.searchMetadata;
        this.coreOperation = data.coreOperation;
        this.coreDetails = data.coreDetails;
        this.eventIntegration = data.eventIntegration;
    }
    validateRequiredFields(data) {
        const requiredFields = [
            'protocolVersion',
            'timestamp',
            'workflowId',
            'orchestratorId'
        ];
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        if (!data.workflowConfig) {
            data.workflowConfig = {};
        }
        if (!data.executionContext) {
            data.executionContext = {};
        }
        if (!data.executionStatus) {
            data.executionStatus = {};
        }
        if (!data.auditTrail) {
            data.auditTrail = {};
        }
        if (!data.monitoringIntegration) {
            data.monitoringIntegration = {};
        }
        if (!data.performanceMetrics) {
            data.performanceMetrics = {};
        }
        if (!data.versionHistory) {
            data.versionHistory = {};
        }
        if (!data.searchMetadata) {
            data.searchMetadata = {};
        }
        if (!data.coreOperation) {
            data.coreOperation = {};
        }
        if (!data.eventIntegration) {
            data.eventIntegration = {};
        }
        if (data.protocolVersion !== '1.0.0') {
            throw new Error('Invalid protocol version, must be "1.0.0"');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
        if (!uuidRegex.test(data.workflowId)) {
            throw new Error('Invalid workflowId UUID format');
        }
        if (!uuidRegex.test(data.orchestratorId)) {
            throw new Error('Invalid orchestratorId UUID format');
        }
        const date = new Date(data.timestamp);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid timestamp format');
        }
    }
    updateWorkflowConfig(config) {
        this.workflowConfig = config;
    }
    updateExecutionStatus(status) {
        this.executionStatus = status;
    }
    addAuditEvent(event) {
        if (!this.auditTrail.auditEvents) {
            this.auditTrail.auditEvents = [];
        }
        this.auditTrail.auditEvents.push(event);
    }
    isWorkflowCompleted() {
        return this.executionStatus.status === 'completed';
    }
    isWorkflowFailed() {
        return this.executionStatus.status === 'failed';
    }
    isWorkflowInProgress() {
        return this.executionStatus.status === 'in_progress';
    }
    getCurrentStage() {
        return this.executionStatus.currentStage;
    }
    getCompletedStages() {
        return this.executionStatus.completedStages || [];
    }
    getWorkflowDuration() {
        return this.executionStatus.durationMs;
    }
    isAuditEnabled() {
        return this.auditTrail.enabled;
    }
    isMonitoringEnabled() {
        return this.monitoringIntegration.enabled;
    }
    isPerformanceMetricsEnabled() {
        return this.performanceMetrics.enabled;
    }
    isVersionHistoryEnabled() {
        return this.versionHistory.enabled;
    }
    isSearchMetadataEnabled() {
        return this.searchMetadata.enabled;
    }
    isEventIntegrationEnabled() {
        return this.eventIntegration.enabled;
    }
    toJSON() {
        return {
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp,
            workflowId: this.workflowId,
            orchestratorId: this.orchestratorId,
            workflowConfig: this.workflowConfig,
            executionContext: this.executionContext,
            executionStatus: this.executionStatus,
            moduleCoordination: this.moduleCoordination,
            eventHandling: this.eventHandling,
            auditTrail: this.auditTrail,
            monitoringIntegration: this.monitoringIntegration,
            performanceMetrics: this.performanceMetrics,
            versionHistory: this.versionHistory,
            searchMetadata: this.searchMetadata,
            coreOperation: this.coreOperation,
            coreDetails: this.coreDetails,
            eventIntegration: this.eventIntegration
        };
    }
    clone() {
        return new CoreEntity({
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp,
            workflowId: this.workflowId,
            orchestratorId: this.orchestratorId,
            workflowConfig: { ...this.workflowConfig },
            executionContext: { ...this.executionContext },
            executionStatus: { ...this.executionStatus },
            moduleCoordination: this.moduleCoordination ? { ...this.moduleCoordination } : undefined,
            eventHandling: this.eventHandling ? { ...this.eventHandling } : undefined,
            auditTrail: { ...this.auditTrail },
            monitoringIntegration: { ...this.monitoringIntegration },
            performanceMetrics: { ...this.performanceMetrics },
            versionHistory: { ...this.versionHistory },
            searchMetadata: { ...this.searchMetadata },
            coreOperation: this.coreOperation,
            coreDetails: this.coreDetails ? { ...this.coreDetails } : undefined,
            eventIntegration: { ...this.eventIntegration }
        });
    }
}
exports.CoreEntity = CoreEntity;
