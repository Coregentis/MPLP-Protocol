/**
 * Dialog Schema-TypeScript Mapper
 * @description 双重命名约定映射器 - Schema(snake_case) ↔ TypeScript(camelCase)
 * @version 1.0.0
 */
import { DialogSchema } from '../../types';
import { DialogEntity } from '../../domain/entities/dialog.entity';
/**
 * Dialog主映射器类
 * 实现Schema层(snake_case)与TypeScript层(camelCase)的双向映射
 */
export declare class DialogMapper {
    /**
     * 将TypeScript实体转换为Schema格式
     * @param entity Dialog实体对象
     * @returns Schema格式的对话数据
     */
    static toSchema(entity: DialogEntity): DialogSchema;
    /**
     * 将Schema格式转换为TypeScript实体
     * @param schema Schema格式的对话数据
     * @returns Dialog实体对象
     */
    static fromSchema(schema: DialogSchema): DialogEntity;
    private static auditTrailFromSchema;
    private static monitoringFromSchema;
    private static performanceFromSchema;
    private static versionHistoryFromSchema;
    private static searchMetadataFromSchema;
    private static eventIntegrationFromSchema;
    private static configurationFromSchema;
    private static dialogDetailsFromSchema;
    /**
     * 验证Schema数据的有效性
     * @param schema Schema格式的对话数据
     * @returns 验证结果
     */
    static validateSchema(schema: DialogSchema): {
        isValid: boolean;
        errors: string[];
    };
    private static capabilitiesToSchema;
    private static capabilitiesFromSchema;
    private static strategyToSchema;
    private static strategyFromSchema;
    private static contextToSchema;
    private static contextFromSchema;
    /**
     * 批量转换Schema数组到Entity数组
     * @param schemas Schema格式的对话数据数组
     * @returns Dialog实体对象数组
     */
    static fromSchemaArray(schemas: DialogSchema[]): DialogEntity[];
    /**
     * 批量转换Entity数组到Schema数组
     * @param entities Dialog实体对象数组
     * @returns Schema格式的对话数据数组
     */
    static toSchemaArray(entities: DialogEntity[]): DialogSchema[];
}
//# sourceMappingURL=dialog.mapper.d.ts.map