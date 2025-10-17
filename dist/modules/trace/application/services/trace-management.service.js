"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceManagementService = void 0;
const trace_entity_1 = require("../../domain/entities/trace.entity");
class TraceManagementService {
    _repository;
    _dataCollector;
    _logger;
    constructor(_repository, _dataCollector, _logger) {
        this._repository = _repository;
        this._dataCollector = _dataCollector;
        this._logger = _logger;
    }
    async startTrace(data) {
        await this.validateTraceData(data);
        const traceData = {
            traceId: this.generateTraceId(),
            contextId: data.contextId,
            traceType: data.type,
            severity: 'info',
            event: {
                type: 'start',
                name: data.name,
                category: 'system',
                source: { component: 'trace-management' }
            },
            traceOperation: 'start'
        };
        const trace = new trace_entity_1.TraceEntity(traceData);
        const savedTrace = await this._repository.save(trace);
        if (this._dataCollector && data.collectionConfig) {
            await this._dataCollector.startCollection(savedTrace.traceId, data.collectionConfig);
        }
        return savedTrace;
    }
    async addSpan(traceId, spanData) {
        const traceData = await this._repository.findById(traceId);
        if (!traceData) {
            throw new Error(`Trace ${traceId} not found`);
        }
        const span = {
            spanId: this.generateSpanId(),
            traceId: traceId,
            parentSpanId: spanData.parentSpanId,
            operationName: spanData.operationName,
            startTime: spanData.startTime || new Date(),
            endTime: spanData.endTime,
            duration: spanData.duration,
            tags: spanData.tags || {},
            logs: spanData.logs || [],
            status: spanData.status || 'active'
        };
        const trace = new trace_entity_1.TraceEntity(traceData);
        trace.addSpan(span);
        await this._repository.save(trace);
        return span;
    }
    async endTrace(traceId, endData) {
        const traceData = await this._repository.findById(traceId);
        if (!traceData) {
            throw new Error(`Trace ${traceId} not found`);
        }
        const trace = new trace_entity_1.TraceEntity(traceData);
        trace.end(endData?.endTime || new Date(), endData?.finalStatus || 'completed');
        if (this._dataCollector) {
            await this._dataCollector.stopCollection(traceId);
        }
        const statistics = this.calculateTraceStatistics(trace);
        trace.setStatistics(statistics);
        const updatedTrace = await this._repository.save(trace);
        return updatedTrace;
    }
    async getTrace(traceId) {
        const traceData = await this._repository.findById(traceId);
        return traceData ? new trace_entity_1.TraceEntity(traceData) : null;
    }
    async queryTraces(queryOrFilter, pagination) {
        const isTraceQuery = 'limit' in queryOrFilter || 'offset' in queryOrFilter ||
            'startTime' in queryOrFilter || 'endTime' in queryOrFilter || 'tags' in queryOrFilter;
        if (isTraceQuery || !pagination) {
            const query = queryOrFilter;
            const filter = {
                contextId: query.contextId,
                traceType: Array.isArray(query.traceType) ? query.traceType[0] : query.traceType,
                severity: Array.isArray(query.severity) ? query.severity[0] : query.severity
            };
            const result = await this._repository.query(filter);
            return result.traces.map(traceData => new trace_entity_1.TraceEntity(traceData));
        }
        else {
            const filter = queryOrFilter;
            return await this._repository.query(filter, pagination);
        }
    }
    async getTraceStatistics(traceId) {
        const traceData = await this._repository.findById(traceId);
        if (!traceData) {
            throw new Error(`Trace ${traceId} not found`);
        }
        const trace = new trace_entity_1.TraceEntity(traceData);
        return this.calculateTraceStatistics(trace);
    }
    async deleteTrace(traceId) {
        if (this._dataCollector) {
            await this._dataCollector.stopCollection(traceId);
        }
        return await this._repository.delete(traceId);
    }
    async createTrace(request) {
        this.validateCreateRequest(request);
        const traceEntity = this.buildTraceEntity(request);
        const savedTrace = await this._repository.create(traceEntity);
        await this.recordAuditEvent('trace_created', savedTrace.traceId, {
            traceType: savedTrace.traceType,
            severity: savedTrace.severity,
            operation: savedTrace.traceOperation
        });
        return savedTrace;
    }
    async validateTraceData(data) {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Trace name is required');
        }
        if (!data.type) {
            throw new Error('Trace type is required');
        }
        if (!data.contextId) {
            throw new Error('Context ID is required');
        }
    }
    calculateTraceStatistics(trace) {
        const spans = trace.spans || [];
        return {
            totalSpans: spans.length,
            totalDuration: trace.duration || 0,
            averageSpanDuration: spans.length > 0 ?
                spans.reduce((sum, span) => sum + (span.duration || 0), 0) / spans.length : 0,
            errorCount: spans.filter(span => span.status === 'error').length,
            successRate: spans.length > 0 ?
                spans.filter(span => span.status === 'completed').length / spans.length : 1,
            criticalPath: this.calculateCriticalPath(spans),
            bottlenecks: this.identifyBottlenecks(spans)
        };
    }
    calculateCriticalPath(spans) {
        return spans
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))
            .slice(0, 5)
            .map(span => span.operationName);
    }
    identifyBottlenecks(spans) {
        if (spans.length === 0)
            return [];
        const avgDuration = spans.reduce((sum, span) => sum + (span.duration || 0), 0) / spans.length;
        return spans
            .filter(span => (span.duration || 0) > avgDuration * 2)
            .map(span => span.operationName);
    }
    generateTraceId() {
        return `trace-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    generateSpanId() {
        return `span-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
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
        return {
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
    }
    buildEventObject(eventRequest) {
        return {
            type: eventRequest.type || 'start',
            name: eventRequest.name || 'Default Event',
            description: eventRequest.description,
            category: eventRequest.category || 'system',
            source: {
                component: eventRequest.source?.component || 'trace-service',
                module: eventRequest.source?.module,
                function: eventRequest.source?.function,
                lineNumber: eventRequest.source?.lineNumber
            },
            data: eventRequest.data
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
    async recordAuditEvent(eventType, traceId, details) {
        void eventType;
        void traceId;
        void details;
    }
    async updateTrace(request) {
        return await this._repository.update(request);
    }
    async getTraceById(traceId) {
        return await this._repository.findById(traceId);
    }
    async traceExists(traceId) {
        return await this._repository.exists(traceId);
    }
    async getTraceCount(filter) {
        return await this._repository.count(filter);
    }
    async createTraceBatch(requests) {
        return await this._repository.createBatch(requests);
    }
    async deleteTraceBatch(traceIds) {
        return await this._repository.deleteBatch(traceIds);
    }
    async analyzeTrace(_traceId) {
        return {
            traceId: _traceId,
            analysisType: 'performance',
            results: {
                insights: ['Mock analysis insight'],
                recommendations: ['Mock recommendation'],
                anomalies: [],
                patterns: []
            },
            confidence: 0.8,
            analysisTime: 100
        };
    }
    async validateTrace(_traceData) {
        return {
            isValid: true,
            violations: [],
            warnings: [],
            recommendations: []
        };
    }
    async getHealthStatus() {
        const repositoryHealth = await this._repository.getHealthStatus();
        return {
            status: repositoryHealth.status === 'healthy' ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            details: {
                service: 'TraceManagementService',
                version: '1.0.0',
                repository: repositoryHealth
            }
        };
    }
}
exports.TraceManagementService = TraceManagementService;
