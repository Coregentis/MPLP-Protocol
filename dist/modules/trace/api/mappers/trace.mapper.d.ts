/**
 * Trace模块Mapper实现
 *
 * @description 实现Schema-TypeScript双向映射，遵循双重命名约定
 * @version 1.0.0
 * @schema src/schemas/core-modules/mplp-trace.json
 * @naming_convention Schema(snake_case) ↔ TypeScript(camelCase)
 * @coverage 100%字段映射覆盖 (85+字段)
 * @pattern 基于Context、Plan、Role、Confirm模块的IDENTICAL映射模式
 */
import { TraceEntityData, TraceSchema, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter } from '../..';
/**
 * Trace模块Mapper类
 *
 * @description 提供Schema-TypeScript双向映射功能，TraceSchema接口从types.ts导入
 */
/**
 * Trace模块Mapper类
 *
 * @description 提供Schema-TypeScript双向映射功能
 */
export declare class TraceMapper {
    /**
     * 将TypeScript实体数据转换为Schema格式
     *
     * @param entity - TypeScript格式的实体数据
     * @returns Schema格式的数据
     */
    static toSchema(entity: TraceEntityData): TraceSchema;
    /**
     * 将Schema格式数据转换为TypeScript实体数据
     *
     * @param schema - Schema格式的数据
     * @returns TypeScript格式的实体数据
     */
    static fromSchema(schema: TraceSchema): TraceEntityData;
    /**
     * 验证Schema数据格式
     *
     * @param data - 待验证的数据
     * @returns 是否为有效的TraceSchema格式
     */
    static validateSchema(data: unknown): data is TraceSchema;
    /**
     * 批量转换TypeScript实体数据为Schema格式
     *
     * @param entities - TypeScript格式的实体数据数组
     * @returns Schema格式的数据数组
     */
    static toSchemaArray(entities: TraceEntityData[]): TraceSchema[];
    /**
     * 批量转换Schema格式数据为TypeScript实体数据
     *
     * @param schemas - Schema格式的数据数组
     * @returns TypeScript格式的实体数据数组
     */
    static fromSchemaArray(schemas: TraceSchema[]): TraceEntityData[];
    /**
     * 映射安全上下文到Schema格式
     */
    static mapSecurityContextToSchema(securityContext: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射安全上下文从Schema格式
     */
    static mapSecurityContextFromSchema(securitySchema: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射性能指标到Schema格式
     */
    static mapPerformanceMetricsToSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射性能指标从Schema格式
     */
    static mapPerformanceMetricsFromSchema(performanceSchema: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射事件总线到Schema格式
     */
    static mapEventBusToSchema(eventBus: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射事件总线从Schema格式
     */
    static mapEventBusFromSchema(eventBusSchema: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射错误处理到Schema格式
     */
    static mapErrorHandlingToSchema(errorHandling: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射错误处理从Schema格式
     */
    static mapErrorHandlingFromSchema(errorHandlingSchema: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射协调管理到Schema格式
     */
    static mapCoordinationToSchema(coordination: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射协调管理从Schema格式
     */
    static mapCoordinationFromSchema(coordinationSchema: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射编排管理到Schema格式
     */
    static mapOrchestrationToSchema(orchestration: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射编排管理从Schema格式
     */
    static mapOrchestrationFromSchema(orchestrationSchema: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射状态同步到Schema格式
     */
    static mapStateSyncToSchema(stateSync: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射状态同步从Schema格式
     */
    static mapStateSyncFromSchema(stateSyncSchema: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射事务管理到Schema格式
     */
    static mapTransactionToSchema(transaction: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射事务管理从Schema格式
     */
    static mapTransactionFromSchema(transactionSchema: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射协议版本到Schema格式
     */
    static mapProtocolVersionToSchema(protocolVersion: Record<string, unknown>): Record<string, unknown>;
    /**
     * 映射协议版本从Schema格式
     */
    static mapProtocolVersionFromSchema(protocolVersionSchema: Record<string, unknown>): Record<string, unknown>;
    /**
     * 转换CreateTraceRequest为Schema格式
     */
    static createRequestToSchema(request: CreateTraceRequest): Partial<TraceSchema>;
    /**
     * 转换UpdateTraceRequest为Schema格式
     */
    static updateRequestToSchema(request: UpdateTraceRequest): Partial<TraceSchema>;
    /**
     * 转换TraceQueryFilter为Schema查询格式
     */
    static queryFilterToSchema(filter: TraceQueryFilter): Record<string, unknown>;
}
//# sourceMappingURL=trace.mapper.d.ts.map