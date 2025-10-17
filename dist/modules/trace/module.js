"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTraceModule = void 0;
exports.initializeTraceModule = initializeTraceModule;
const trace_module_adapter_1 = require("./infrastructure/adapters/trace-module.adapter");
const trace_controller_1 = require("./api/controllers/trace.controller");
const trace_management_service_1 = require("./application/services/trace-management.service");
const trace_analytics_service_1 = require("./application/services/trace-analytics.service");
const trace_security_service_1 = require("./application/services/trace-security.service");
const trace_repository_1 = require("./infrastructure/repositories/trace.repository");
async function initializeTraceModule(options = {}) {
    try {
        const config = {
            enableLogging: options.enableLogging ?? true,
            enableCaching: options.enableCaching ?? true,
            enableMetrics: options.enableMetrics ?? true,
            repositoryType: options.repositoryType ?? 'memory',
            maxCacheSize: options.maxCacheSize ?? 1000,
            cacheTimeout: options.cacheTimeout ?? 300000,
            traceRetentionDays: options.traceRetentionDays ?? 30,
            samplingRate: options.samplingRate ?? 1.0,
            enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? true,
            enableErrorTracking: options.enableErrorTracking ?? true,
            enableDecisionLogging: options.enableDecisionLogging ?? true,
            dataSource: options.dataSource
        };
        const traceRepository = new trace_repository_1.TraceRepository();
        const traceManagementService = new trace_management_service_1.TraceManagementService(traceRepository);
        const traceAnalyticsService = new trace_analytics_service_1.TraceAnalyticsService(traceRepository);
        const traceSecurityService = new trace_security_service_1.TraceSecurityService(traceRepository);
        const traceController = new trace_controller_1.TraceController(traceManagementService);
        const adapterConfig = {
            enableLogging: config.enableLogging,
            enableCaching: config.enableCaching,
            enableMetrics: config.enableMetrics,
            maxTraceRetentionDays: config.traceRetentionDays,
            enableRealTimeMonitoring: config.enablePerformanceMonitoring,
            enableCorrelationAnalysis: config.enableErrorTracking,
            enableDistributedTracing: config.enableDecisionLogging
        };
        const traceModuleAdapter = new trace_module_adapter_1.TraceModuleAdapter(adapterConfig);
        const healthCheck = async () => {
            try {
                const health = await traceManagementService.getHealthStatus();
                return health.status === 'healthy';
            }
            catch (error) {
                return false;
            }
        };
        const shutdown = async () => {
        };
        const getStatistics = async () => {
            try {
                const traceCount = await traceManagementService.getTraceCount();
                const health = await traceManagementService.getHealthStatus();
                return {
                    totalTraces: traceCount,
                    healthStatus: health.status,
                    moduleVersion: '1.0.0',
                    protocolVersion: '1.0.0',
                    configuration: {
                        enableLogging: config.enableLogging,
                        enableCaching: config.enableCaching,
                        enableMetrics: config.enableMetrics,
                        repositoryType: config.repositoryType,
                        traceRetentionDays: config.traceRetentionDays,
                        samplingRate: config.samplingRate
                    },
                    timestamp: new Date().toISOString()
                };
            }
            catch (error) {
                return {
                    error: 'Failed to retrieve statistics',
                    timestamp: new Date().toISOString()
                };
            }
        };
        const getTraceMetrics = async () => {
            try {
                const totalTraces = await traceManagementService.getTraceCount();
                const errorTraces = await traceManagementService.getTraceCount({ hasErrors: true });
                const decisionTraces = await traceManagementService.getTraceCount({ hasDecisions: true });
                return {
                    totalTraces,
                    errorTraces,
                    decisionTraces,
                    errorRate: totalTraces > 0 ? (errorTraces / totalTraces) * 100 : 0,
                    decisionRate: totalTraces > 0 ? (decisionTraces / totalTraces) * 100 : 0,
                    samplingRate: config.samplingRate,
                    retentionDays: config.traceRetentionDays,
                    timestamp: new Date().toISOString()
                };
            }
            catch (error) {
                return {
                    error: 'Failed to retrieve metrics',
                    timestamp: new Date().toISOString()
                };
            }
        };
        const result = {
            traceController,
            traceManagementService,
            traceAnalyticsService,
            traceSecurityService,
            traceRepository,
            traceModuleAdapter,
            healthCheck,
            shutdown,
            getStatistics,
            getTraceMetrics
        };
        return result;
    }
    catch (error) {
        throw new Error(`Trace module initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
exports.defaultTraceModule = {
    initialize: () => initializeTraceModule(),
    initializeForProduction: () => initializeTraceModule({
        enableLogging: true,
        enableCaching: true,
        enableMetrics: true,
        repositoryType: 'database',
        traceRetentionDays: 90,
        samplingRate: 0.1,
        enablePerformanceMonitoring: true,
        enableErrorTracking: true,
        enableDecisionLogging: true
    }),
    initializeForDevelopment: () => initializeTraceModule({
        enableLogging: true,
        enableCaching: false,
        enableMetrics: true,
        repositoryType: 'memory',
        traceRetentionDays: 7,
        samplingRate: 1.0,
        enablePerformanceMonitoring: true,
        enableErrorTracking: true,
        enableDecisionLogging: true
    }),
    initializeForTesting: () => initializeTraceModule({
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory',
        traceRetentionDays: 1,
        samplingRate: 1.0,
        enablePerformanceMonitoring: false,
        enableErrorTracking: true,
        enableDecisionLogging: true
    })
};
__exportStar(require("./types"), exports);
__exportStar(require("./api/dto/trace.dto"), exports);
__exportStar(require("./api/controllers/trace.controller"), exports);
__exportStar(require("./application/services/trace-management.service"), exports);
__exportStar(require("./application/services/trace-analytics.service"), exports);
__exportStar(require("./application/services/trace-security.service"), exports);
__exportStar(require("./infrastructure/repositories/trace.repository"), exports);
__exportStar(require("./infrastructure/adapters/trace-module.adapter"), exports);
