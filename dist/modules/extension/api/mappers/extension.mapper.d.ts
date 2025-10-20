/**
 * Extension模块映射器
 *
 * @description 实现Schema层(snake_case)与TypeScript层(camelCase)之间的双向映射
 * @version 1.0.0
 * @layer API层 - 映射器
 * @pattern 双重命名约定 + Schema驱动开发
 */
import { ExtensionEntityData, ExtensionSchema } from '../../types';
/**
 * Extension映射器类
 * 实现完整的双重命名约定映射
 */
export declare class ExtensionMapper {
    /**
     * 将TypeScript实体转换为Schema格式
     * @param entity - TypeScript格式的扩展实体数据
     * @returns Schema格式的扩展数据
     */
    static toSchema(entity: ExtensionEntityData): ExtensionSchema;
    /**
     * 将Schema格式转换为TypeScript实体
     * @param schema - Schema格式的扩展数据
     * @returns TypeScript格式的扩展实体数据
     */
    static fromSchema(schema: ExtensionSchema): ExtensionEntityData;
    /**
     * 验证Schema数据格式
     * @param data - 待验证的数据
     * @returns 验证后的Schema数据
     * @throws 验证失败时抛出错误
     */
    static validateSchema(data: unknown): ExtensionSchema;
    /**
     * 批量转换为Schema格式
     * @param entities - TypeScript格式的扩展实体数组
     * @returns Schema格式的扩展数据数组
     */
    static toSchemaArray(entities: ExtensionEntityData[]): ExtensionSchema[];
    /**
     * 批量从Schema格式转换
     * @param schemas - Schema格式的扩展数据数组
     * @returns TypeScript格式的扩展实体数组
     */
    static fromSchemaArray(schemas: ExtensionSchema[]): ExtensionEntityData[];
    /**
     * 兼容性信息映射 - 转换为Schema
     */
    private static compatibilityToSchema;
    /**
     * 兼容性信息映射 - 从Schema转换
     */
    private static compatibilityFromSchema;
    /**
     * 配置信息映射 - 转换为Schema
     */
    private static configurationToSchema;
    /**
     * 配置信息映射 - 从Schema转换
     */
    private static configurationFromSchema;
    /**
     * 扩展点映射 - 转换为Schema
     */
    private static extensionPointsToSchema;
    /**
     * 扩展点映射 - 从Schema转换
     */
    private static extensionPointsFromSchema;
    /**
     * API扩展映射 - 转换为Schema
     */
    private static apiExtensionsToSchema;
    /**
     * API扩展映射 - 从Schema转换
     */
    private static apiExtensionsFromSchema;
    /**
     * 事件订阅映射 - 转换为Schema
     */
    private static eventSubscriptionsToSchema;
    /**
     * 事件订阅映射 - 从Schema转换
     */
    private static eventSubscriptionsFromSchema;
    /**
     * 生命周期映射 - 转换为Schema
     */
    private static lifecycleToSchema;
    /**
     * 生命周期映射 - 从Schema转换
     */
    private static lifecycleFromSchema;
    /**
     * 安全配置映射 - 转换为Schema
     */
    private static securityToSchema;
    /**
     * 安全配置映射 - 从Schema转换
     */
    private static securityFromSchema;
    /**
     * 元数据映射 - 转换为Schema
     */
    private static metadataToSchema;
    /**
     * 元数据映射 - 从Schema转换
     */
    private static metadataFromSchema;
    /**
     * 审计跟踪映射 - 转换为Schema
     */
    private static auditTrailToSchema;
    /**
     * 审计跟踪映射 - 从Schema转换
     */
    private static auditTrailFromSchema;
    /**
     * 性能指标映射 - 转换为Schema
     */
    private static performanceMetricsToSchema;
    /**
     * 性能指标映射 - 从Schema转换
     */
    private static performanceMetricsFromSchema;
    /**
     * 监控集成映射 - 转换为Schema
     */
    private static monitoringIntegrationToSchema;
    /**
     * 监控集成映射 - 从Schema转换
     */
    private static monitoringIntegrationFromSchema;
    /**
     * 版本历史映射 - 转换为Schema
     */
    private static versionHistoryToSchema;
    /**
     * 版本历史映射 - 从Schema转换
     */
    private static versionHistoryFromSchema;
    /**
     * 搜索元数据映射 - 转换为Schema
     */
    private static searchMetadataToSchema;
    /**
     * 搜索元数据映射 - 从Schema转换
     */
    private static searchMetadataFromSchema;
    /**
     * 事件集成映射 - 转换为Schema
     */
    private static eventIntegrationToSchema;
    /**
     * 事件集成映射 - 从Schema转换
     */
    private static eventIntegrationFromSchema;
}
//# sourceMappingURL=extension.mapper.d.ts.map