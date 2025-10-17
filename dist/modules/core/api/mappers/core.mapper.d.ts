import { CoreEntity, CoreSchema } from '../../types';
export declare class CoreMapper {
    private static readonly mappingCache;
    private static readonly cacheMaxSize;
    private static readonly cacheEnabled;
    private static performanceMetrics;
    private static generateCacheKey;
    private static getCachedResult;
    private static setCachedResult;
    static getPerformanceMetrics(): {
        averageToSchemaTime: number;
        averageFromSchemaTime: number;
        cacheHitRate: number;
        toSchemaCount: number;
        fromSchemaCount: number;
        totalToSchemaTime: number;
        totalFromSchemaTime: number;
        cacheHits: number;
        cacheMisses: number;
    };
    static resetPerformanceMetrics(): void;
    static toSchema(entity: CoreEntity): CoreSchema;
    static fromSchema(schema: CoreSchema): CoreEntity;
    static validateSchema(data: unknown): {
        isValid: boolean;
        errors: string[];
    };
    private static workflowConfigToSchema;
    private static workflowConfigFromSchema;
    private static executionContextToSchema;
    private static executionContextFromSchema;
    private static executionStatusToSchema;
    private static executionStatusFromSchema;
    private static moduleCoordinationToSchema;
    private static moduleCoordinationFromSchema;
    private static eventHandlingToSchema;
    private static eventHandlingFromSchema;
    private static auditTrailToSchema;
    private static auditTrailFromSchema;
    private static monitoringIntegrationToSchema;
    private static monitoringIntegrationFromSchema;
    private static performanceMetricsToSchema;
    private static performanceMetricsFromSchema;
    private static versionHistoryToSchema;
    private static versionHistoryFromSchema;
    private static searchMetadataToSchema;
    private static searchMetadataFromSchema;
    private static coreDetailsToSchema;
    private static coreDetailsFromSchema;
    private static eventIntegrationToSchema;
    private static eventIntegrationFromSchema;
    static toSchemaArray(entities: CoreEntity[]): CoreSchema[];
    static fromSchemaArray(schemas: CoreSchema[]): CoreEntity[];
}
//# sourceMappingURL=core.mapper.d.ts.map