import { TraceModuleAdapter } from './infrastructure/adapters/trace-module.adapter';
import { TraceController } from './api/controllers/trace.controller';
import { TraceManagementService } from './application/services/trace-management.service';
import { TraceAnalyticsService } from './application/services/trace-analytics.service';
import { TraceSecurityService } from './application/services/trace-security.service';
import { TraceRepository } from './infrastructure/repositories/trace.repository';
export interface TraceModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
    traceRetentionDays?: number;
    samplingRate?: number;
    enablePerformanceMonitoring?: boolean;
    enableErrorTracking?: boolean;
    enableDecisionLogging?: boolean;
}
export interface TraceModuleResult {
    traceController: TraceController;
    traceManagementService: TraceManagementService;
    traceAnalyticsService: TraceAnalyticsService;
    traceSecurityService: TraceSecurityService;
    traceRepository: TraceRepository;
    traceModuleAdapter: TraceModuleAdapter;
    healthCheck: () => Promise<boolean>;
    shutdown: () => Promise<void>;
    getStatistics: () => Promise<Record<string, unknown>>;
    getTraceMetrics: () => Promise<Record<string, unknown>>;
}
export declare function initializeTraceModule(options?: TraceModuleOptions): Promise<TraceModuleResult>;
export declare const defaultTraceModule: {
    initialize: () => Promise<TraceModuleResult>;
    initializeForProduction: () => Promise<TraceModuleResult>;
    initializeForDevelopment: () => Promise<TraceModuleResult>;
    initializeForTesting: () => Promise<TraceModuleResult>;
};
export * from './types';
export * from './api/dto/trace.dto';
export * from './api/controllers/trace.controller';
export * from './application/services/trace-management.service';
export * from './application/services/trace-analytics.service';
export * from './application/services/trace-security.service';
export * from './infrastructure/repositories/trace.repository';
export * from './infrastructure/adapters/trace-module.adapter';
//# sourceMappingURL=module.d.ts.map