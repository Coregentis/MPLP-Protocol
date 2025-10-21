/**
 * Core模块映射器
 * 实现Schema(snake_case) ↔ TypeScript(camelCase)双重命名约定映射
 * 严格遵循mplp-core.json Schema定义
 * 零any类型使用，完全类型安全
 */
import { CoreEntity, CoreSchema } from '../../types';
/**
 * Core模块映射器类
 * 提供Schema与TypeScript实体间的双向转换
 */
export declare class CoreMapper {
    private static readonly mappingCache;
    private static performanceMetrics;
    /**
     * 将TypeScript实体转换为Schema格式
     * @param entity Core实体
     * @returns Schema格式数据
     */
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
    /**
     * 将Schema格式转换为TypeScript实体
     * @param schema Schema格式数据
     * @returns Core实体
     */
    static fromSchema(schema: CoreSchema): CoreEntity;
    /**
     * 验证Schema数据格式
     * @param data 待验证数据
     * @returns 验证结果
     */
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
    /**
     * 批量转换实体数组为Schema数组
     * @param entities 实体数组
     * @returns Schema数组
     */
    static toSchemaArray(entities: CoreEntity[]): CoreSchema[];
    /**
     * 批量转换Schema数组为实体数组
     * @param schemas Schema数组
     * @returns 实体数组
     */
    static fromSchemaArray(schemas: CoreSchema[]): CoreEntity[];
}
//# sourceMappingURL=core.mapper.d.ts.map