"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceEntity = void 0;
class TraceEntity {
    data;
    constructor(data) {
        this.data = this.initializeData(data);
        this.validateInvariants();
    }
    get traceId() {
        return this.data.traceId;
    }
    get contextId() {
        return this.data.contextId;
    }
    get planId() {
        return this.data.planId;
    }
    get taskId() {
        return this.data.taskId;
    }
    get traceType() {
        return this.data.traceType;
    }
    get severity() {
        return this.data.severity;
    }
    get event() {
        return this.data.event;
    }
    get timestamp() {
        return this.data.timestamp;
    }
    get status() {
        return this.data.traceOperation || 'active';
    }
    get duration() {
        return this.data.performanceMetrics?.metrics?.traceProcessingLatencyMs;
    }
    get spans() {
        return this.data.spans || [];
    }
    get containsSensitiveData() {
        return this.data.containsSensitiveData || false;
    }
    addSpan(span) {
        if (!this.data.spans) {
            this.data.spans = [];
        }
        this.data.spans.push(span);
    }
    end(endTime, finalStatus) {
        this.data.traceOperation = finalStatus;
        this.data.timestamp = endTime.toISOString();
        if (this.data.performanceMetrics) {
            const startTime = new Date(this.data.timestamp);
            if (!this.data.performanceMetrics.metrics) {
                this.data.performanceMetrics.metrics = {};
            }
            this.data.performanceMetrics.metrics.traceProcessingLatencyMs = endTime.getTime() - startTime.getTime();
        }
    }
    setStatistics(statistics) {
        this.data.statistics = statistics;
    }
    markAsSensitive() {
        this.data.containsSensitiveData = true;
    }
    get traceOperation() {
        return this.data.traceOperation;
    }
    get contextSnapshot() {
        return this.data.contextSnapshot;
    }
    get errorInformation() {
        return this.data.errorInformation;
    }
    get decisionLog() {
        return this.data.decisionLog;
    }
    get traceDetails() {
        return this.data.traceDetails;
    }
    updateSeverity(newSeverity) {
        this.validateSeverity(newSeverity);
        this.data.severity = newSeverity;
        this.updateTimestamp();
    }
    addErrorInformation(errorInfo) {
        this.validateErrorInformation(errorInfo);
        this.data.errorInformation = errorInfo;
        this.updateSeverity('error');
        this.updateTimestamp();
    }
    addDecisionLog(decisionLog) {
        this.validateDecisionLog(decisionLog);
        this.data.decisionLog = decisionLog;
        this.updateTimestamp();
    }
    updateContextSnapshot(snapshot) {
        this.data.contextSnapshot = snapshot;
        this.updateTimestamp();
    }
    isError() {
        return this.data.severity === 'error' || this.data.errorInformation !== undefined;
    }
    hasDecision() {
        return this.data.decisionLog !== undefined;
    }
    getDuration() {
        if (this.data.traceDetails?.samplingRate) {
            return Date.now() - new Date(this.data.timestamp).getTime();
        }
        return undefined;
    }
    toData() {
        return { ...this.data };
    }
    initializeData(data) {
        const now = new Date().toISOString();
        return {
            protocolVersion: '1.0.0',
            timestamp: now,
            traceId: data.traceId || this.generateTraceId(),
            contextId: data.contextId,
            traceType: data.traceType || 'execution',
            severity: data.severity || 'info',
            event: data.event || this.createDefaultEvent(),
            traceOperation: data.traceOperation || 'start',
            planId: data.planId,
            taskId: data.taskId,
            contextSnapshot: data.contextSnapshot,
            errorInformation: data.errorInformation,
            decisionLog: data.decisionLog,
            traceDetails: data.traceDetails,
            auditTrail: data.auditTrail || { enabled: true, retentionDays: 30 },
            performanceMetrics: data.performanceMetrics || { enabled: true, collectionIntervalSeconds: 60 },
            monitoringIntegration: data.monitoringIntegration || { enabled: true, supportedProviders: ['prometheus'] },
            versionHistory: data.versionHistory || { enabled: true, maxVersions: 10 },
            searchMetadata: data.searchMetadata || { enabled: true, indexingStrategy: 'keyword' },
            eventIntegration: data.eventIntegration || { enabled: true },
            correlations: data.correlations || []
        };
    }
    validateInvariants() {
        if (!this.data.contextId) {
            throw new Error('Context ID is required');
        }
        if (!this.data.event?.name) {
            throw new Error('Event name is required');
        }
        this.validateSeverity(this.data.severity);
        this.validateTraceType(this.data.traceType);
    }
    validateSeverity(severity) {
        const validSeverities = ['debug', 'info', 'warn', 'error', 'critical'];
        if (!validSeverities.includes(severity)) {
            throw new Error(`Invalid severity: ${severity}`);
        }
    }
    validateTraceType(traceType) {
        const validTypes = ['execution', 'monitoring', 'audit', 'performance', 'error', 'decision'];
        if (!validTypes.includes(traceType)) {
            throw new Error(`Invalid trace type: ${traceType}`);
        }
    }
    validateErrorInformation(errorInfo) {
        if (!errorInfo.errorCode || !errorInfo.errorMessage) {
            throw new Error('Error code and message are required');
        }
    }
    validateDecisionLog(decisionLog) {
        if (!decisionLog.decisionPoint || !decisionLog.selectedOption) {
            throw new Error('Decision point and selected option are required');
        }
    }
    generateTraceId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        return `trace-${timestamp}-${random}`;
    }
    createDefaultEvent() {
        return {
            type: 'start',
            name: 'Default Trace Event',
            category: 'system',
            source: {
                component: 'trace-entity'
            }
        };
    }
    updateTimestamp() {
        this.data.timestamp = new Date().toISOString();
    }
}
exports.TraceEntity = TraceEntity;
