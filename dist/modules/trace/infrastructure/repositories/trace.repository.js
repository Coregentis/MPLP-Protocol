"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceRepository = void 0;
const trace_entity_1 = require("../../domain/entities/trace.entity");
class TraceRepository {
    traces = new Map();
    config;
    constructor(config = {}) {
        this.config = {
            enableCaching: false,
            maxCacheSize: 1000,
            cacheTimeout: 300000,
            ...config
        };
    }
    async create(request) {
        this.validateCreateRequest(request);
        const traceEntity = this.buildTraceEntity(request);
        this.traces.set(traceEntity.traceId, traceEntity);
        return traceEntity;
    }
    validateCreateRequest(request) {
        if (!request.contextId) {
            throw new Error('Context ID is required');
        }
        if (!request.traceType) {
            throw new Error('Trace type is required');
        }
        if (!request.severity) {
            throw new Error('Severity is required');
        }
        if (!request.event || !request.event.name) {
            throw new Error('Event name is required');
        }
    }
    buildTraceEntity(request) {
        const now = new Date().toISOString();
        const traceId = this.generateTraceId();
        const traceEntity = {
            protocolVersion: '1.0.0',
            timestamp: now,
            traceId,
            contextId: request.contextId,
            planId: request.planId,
            taskId: request.taskId,
            traceType: request.traceType,
            severity: request.severity,
            event: this.buildEventObject(request.event),
            contextSnapshot: request.contextSnapshot,
            errorInformation: request.errorInformation ? this.buildCompleteErrorInformation(request.errorInformation) : undefined,
            decisionLog: request.decisionLog ? this.buildCompleteDecisionLog(request.decisionLog) : undefined,
            correlations: [],
            auditTrail: this.buildDefaultAuditTrail(),
            performanceMetrics: this.buildDefaultPerformanceMetrics(),
            monitoringIntegration: this.buildDefaultMonitoringIntegration(),
            versionHistory: this.buildDefaultVersionHistory(),
            searchMetadata: this.buildDefaultSearchMetadata(),
            traceOperation: request.traceOperation || 'start',
            traceDetails: request.traceDetails || this.buildDefaultTraceDetails(),
            eventIntegration: this.buildDefaultEventIntegration()
        };
        return traceEntity;
    }
    generateTraceId() {
        return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    buildEventObject(eventRequest) {
        return {
            type: eventRequest.type || 'start',
            name: eventRequest.name || 'Default Event',
            description: eventRequest.description,
            category: eventRequest.category || 'system',
            source: {
                component: eventRequest.source?.component || 'trace-repository',
                module: eventRequest.source?.module,
                function: eventRequest.source?.function,
                lineNumber: eventRequest.source?.lineNumber
            },
            data: eventRequest.data
        };
    }
    buildCompleteErrorInformation(partial) {
        return {
            errorCode: partial.errorCode || 'UNKNOWN_ERROR',
            errorMessage: partial.errorMessage || 'Unknown error occurred',
            errorType: partial.errorType || 'system',
            stackTrace: partial.stackTrace,
            recoveryActions: partial.recoveryActions
        };
    }
    buildCompleteDecisionLog(partial) {
        return {
            decisionPoint: partial.decisionPoint || 'Unknown decision point',
            optionsConsidered: partial.optionsConsidered || [],
            selectedOption: partial.selectedOption || 'default',
            decisionCriteria: partial.decisionCriteria,
            confidenceLevel: partial.confidenceLevel
        };
    }
    buildDefaultAuditTrail() {
        return {
            enabled: true,
            retentionDays: 90,
            auditEvents: [],
            complianceSettings: {
                gdprEnabled: false,
                hipaaEnabled: false,
                soxEnabled: false,
                traceAuditLevel: 'basic',
                traceDataLogging: true,
                customCompliance: []
            }
        };
    }
    buildDefaultPerformanceMetrics() {
        return {
            enabled: true,
            collectionIntervalSeconds: 60,
            metrics: {
                traceProcessingLatencyMs: 0,
                spanCollectionRatePerSecond: 0,
                traceAnalysisAccuracyPercent: 100,
                distributedTracingCoveragePercent: 100,
                traceMonitoringEfficiencyScore: 10,
                activeTracesCount: 1,
                traceOperationsPerSecond: 1,
                traceStorageUsageMb: 0.1,
                averageTraceComplexityScore: 5
            },
            healthStatus: {
                status: 'healthy',
                lastCheck: new Date().toISOString(),
                checks: []
            },
            alerting: {
                enabled: false,
                thresholds: {},
                notificationChannels: []
            }
        };
    }
    buildDefaultMonitoringIntegration() {
        return {
            enabled: false,
            supportedProviders: ['prometheus'],
            integrationEndpoints: {
                metricsApi: '',
                tracingApi: '',
                alertingApi: '',
                dashboardApi: ''
            },
            exportFormats: ['opentelemetry'],
            samplingConfig: {
                samplingRate: 1.0,
                adaptiveSampling: false,
                maxTracesPerSecond: 1000
            }
        };
    }
    buildDefaultVersionHistory() {
        return {
            enabled: true,
            maxVersions: 50,
            versions: [],
            autoVersioning: {
                enabled: true,
                versionOnUpdate: true,
                versionOnAnalysis: false
            }
        };
    }
    buildDefaultSearchMetadata() {
        return {
            enabled: true,
            indexingStrategy: 'keyword',
            searchableFields: ['trace_id', 'context_id', 'trace_type', 'severity'],
            searchIndexes: [],
            autoIndexing: {
                enabled: true,
                indexNewTraces: true,
                reindexIntervalHours: 24
            }
        };
    }
    buildDefaultTraceDetails() {
        return {
            traceLevel: 'basic',
            samplingRate: 1.0,
            retentionDays: 30
        };
    }
    buildDefaultEventIntegration() {
        return {
            enabled: false,
            eventBusConnection: {
                busType: 'kafka',
                connectionString: '',
                topicPrefix: 'mplp-trace',
                consumerGroup: 'trace-consumer'
            },
            publishedEvents: ['trace_created'],
            subscribedEvents: ['context_updated'],
            eventRouting: {
                routingRules: []
            }
        };
    }
    async findById(traceId) {
        return this.traces.get(traceId) || null;
    }
    async update(requestOrTrace) {
        if (requestOrTrace instanceof trace_entity_1.TraceEntity) {
            const traceData = requestOrTrace.toData();
            this.traces.set(traceData.traceId, traceData);
            return requestOrTrace;
        }
        const request = requestOrTrace;
        const existing = this.traces.get(request.traceId);
        if (!existing) {
            throw new Error(`Trace not found: ${request.traceId}`);
        }
        const updated = {
            ...existing,
            timestamp: new Date().toISOString(),
            ...(request.severity !== undefined && { severity: request.severity }),
            ...(request.event !== undefined && { event: this.buildEventObject(request.event) }),
            ...(request.contextSnapshot !== undefined && { contextSnapshot: request.contextSnapshot }),
            ...(request.errorInformation !== undefined && {
                errorInformation: this.buildCompleteErrorInformation(request.errorInformation)
            }),
            ...(request.decisionLog !== undefined && {
                decisionLog: this.buildCompleteDecisionLog(request.decisionLog)
            }),
            ...(request.traceDetails !== undefined && { traceDetails: request.traceDetails })
        };
        this.traces.set(request.traceId, updated);
        return updated;
    }
    async delete(traceId) {
        return this.traces.delete(traceId);
    }
    async query(filter, pagination) {
        let allTraces = Array.from(this.traces.values());
        allTraces = this.applyFilters(allTraces, filter);
        const total = allTraces.length;
        if (pagination) {
            const { page = 1, limit = 10 } = pagination;
            const offset = (page - 1) * limit;
            allTraces = allTraces.slice(offset, offset + limit);
        }
        return {
            traces: allTraces,
            total
        };
    }
    applyFilters(traces, filter) {
        return traces.filter(trace => {
            if (filter.contextId && trace.contextId !== filter.contextId) {
                return false;
            }
            if (filter.planId && trace.planId !== filter.planId) {
                return false;
            }
            if (filter.taskId && trace.taskId !== filter.taskId) {
                return false;
            }
            if (filter.traceType) {
                if (Array.isArray(filter.traceType)) {
                    if (!filter.traceType.includes(trace.traceType)) {
                        return false;
                    }
                }
                else {
                    if (trace.traceType !== filter.traceType) {
                        return false;
                    }
                }
            }
            if (filter.severity) {
                if (Array.isArray(filter.severity)) {
                    if (!filter.severity.includes(trace.severity)) {
                        return false;
                    }
                }
                else {
                    if (trace.severity !== filter.severity) {
                        return false;
                    }
                }
            }
            if (filter.createdAfter || filter.createdBefore) {
                const traceTime = new Date(trace.timestamp);
                if (filter.createdAfter && traceTime < new Date(filter.createdAfter)) {
                    return false;
                }
                if (filter.createdBefore && traceTime > new Date(filter.createdBefore)) {
                    return false;
                }
            }
            if (filter.eventCategory && trace.event.category !== filter.eventCategory) {
                return false;
            }
            if (filter.hasErrors !== undefined) {
                const hasErrors = !!trace.errorInformation;
                if (filter.hasErrors !== hasErrors) {
                    return false;
                }
            }
            if (filter.hasDecisions !== undefined) {
                const hasDecisions = !!trace.decisionLog;
                if (filter.hasDecisions !== hasDecisions) {
                    return false;
                }
            }
            return true;
        });
    }
    async exists(traceId) {
        return this.traces.has(traceId);
    }
    async count(filter) {
        if (!filter || Object.keys(filter).length === 0) {
            return this.traces.size;
        }
        const allTraces = Array.from(this.traces.values());
        const filteredTraces = this.applyFilters(allTraces, filter);
        return filteredTraces.length;
    }
    async createBatch(_requests) {
        const results = [];
        for (const request of _requests) {
            const trace = await this.create(request);
            results.push(trace);
        }
        return results;
    }
    async deleteBatch(traceIds) {
        let deletedCount = 0;
        for (const traceId of traceIds) {
            if (await this.delete(traceId)) {
                deletedCount++;
            }
        }
        return deletedCount;
    }
    async getHealthStatus() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            details: {
                repository: 'TraceRepository',
                version: '1.0.0',
                tracesCount: this.traces.size,
                config: this.config
            }
        };
    }
    async save(trace) {
        const traceData = trace.toData();
        this.traces.set(traceData.traceId, traceData);
        return trace;
    }
    async queryByTimeRange(timeRange, filters) {
        const allTraces = Array.from(this.traces.values());
        let filteredTraces = allTraces.filter(trace => {
            const traceTime = new Date(trace.timestamp);
            return traceTime >= timeRange.startTime && traceTime <= timeRange.endTime;
        });
        if (filters) {
            if (filters.contextId) {
                filteredTraces = filteredTraces.filter(trace => trace.contextId === filters.contextId);
            }
            if (filters.traceType) {
                filteredTraces = filteredTraces.filter(trace => trace.traceType === filters.traceType);
            }
            if (filters.severity) {
                filteredTraces = filteredTraces.filter(trace => trace.severity === filters.severity);
            }
        }
        return filteredTraces.map(traceData => new trace_entity_1.TraceEntity(traceData));
    }
    async getStorageStatistics() {
        const totalTraces = this.traces.size;
        let totalStorageSize = 0;
        for (const trace of this.traces.values()) {
            const traceJson = JSON.stringify(trace);
            totalStorageSize += Buffer.byteLength(traceJson, 'utf8');
        }
        const averageTraceSize = totalTraces > 0 ? totalStorageSize / totalTraces : 0;
        const compressionRatio = 0.7;
        return {
            totalTraces,
            totalStorageSize,
            averageTraceSize,
            compressionRatio
        };
    }
}
exports.TraceRepository = TraceRepository;
