/**
 * Context模块Mapper实现
 *
 * @description 实现Schema-TypeScript双向映射，遵循双重命名约定
 * @version 1.0.0
 * @schema src/schemas/core-modules/mplp-context.json
 * @naming_convention Schema(snake_case) ↔ TypeScript(camelCase)
 * @coverage 100%字段映射覆盖
 */
import { ContextEntityData, ContextSchema } from '../../types';
/**
 * Context模块Mapper类
 *
 * @description 提供Schema-TypeScript双向映射和验证功能
 * @pattern 与其他6个已完成模块使用IDENTICAL的Mapper模式
 */
export declare class ContextMapper {
    /**
     * TypeScript实体 → Schema格式转换
     *
     * @param entity - TypeScript格式的Context实体数据
     * @returns Schema格式的数据 (snake_case)
     */
    static toSchema(entity: ContextEntityData): ContextSchema;
    /**
     * Schema格式 → TypeScript实体转换
     *
     * @param schema - Schema格式的数据 (snake_case)
     * @returns TypeScript格式的Context实体数据
     */
    static fromSchema(schema: ContextSchema): ContextEntityData;
    /**
     * 验证Schema格式数据
     *
     * @param data - 待验证的数据
     * @returns 类型守卫结果
     */
    static validateSchema(data: unknown): data is ContextSchema;
    /**
     * 批量转换：TypeScript数组 → Schema数组
     */
    static toSchemaArray(entities: ContextEntityData[]): ContextSchema[];
    /**
     * 批量转换：Schema数组 → TypeScript数组
     */
    static fromSchemaArray(schemas: ContextSchema[]): ContextEntityData[];
    /**
     * SharedState对象转换为Schema格式
     */
    private static sharedStateToSchema;
    /**
     * Schema格式转换为SharedState对象
     */
    private static sharedStateFromSchema;
    /**
     * AccessControl对象转换为Schema格式
     */
    private static accessControlToSchema;
    /**
     * Schema格式转换为AccessControl对象
     */
    private static accessControlFromSchema;
    /**
     * Configuration对象转换为Schema格式
     */
    private static configurationToSchema;
    /**
     * Schema格式转换为Configuration对象
     */
    private static configurationFromSchema;
    /**
     * AuditTrail对象转换为Schema格式
     */
    private static auditTrailToSchema;
    /**
     * Schema格式转换为AuditTrail对象
     */
    private static auditTrailFromSchema;
    /**
     * 通用对象转换为snake_case
     */
    private static objectToSnakeCase;
    /**
     * 通用对象转换为camelCase
     */
    private static objectToCamelCase;
    /**
     * 验证协议版本格式
     */
    private static validateProtocolVersion;
    /**
     * 验证时间戳格式 (ISO 8601)
     */
    private static validateTimestamp;
    /**
     * 验证UUID格式
     */
    private static validateUUID;
    /**
     * 验证状态枚举值
     */
    private static validateStatus;
    /**
     * 验证生命周期阶段枚举值
     */
    private static validateLifecycleStage;
    /**
     * 验证映射一致性
     */
    static validateMappingConsistency(entity: ContextEntityData, schema: ContextSchema): {
        isConsistent: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=context.mapper.d.ts.map