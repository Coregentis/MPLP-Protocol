import { TraceEntityData, TraceSchema, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter } from '../..';
export declare class TraceMapper {
    static toSchema(entity: TraceEntityData): TraceSchema;
    static fromSchema(schema: TraceSchema): TraceEntityData;
    static validateSchema(data: unknown): data is TraceSchema;
    static toSchemaArray(entities: TraceEntityData[]): TraceSchema[];
    static fromSchemaArray(schemas: TraceSchema[]): TraceEntityData[];
    static mapSecurityContextToSchema(securityContext: Record<string, unknown>): Record<string, unknown>;
    static mapSecurityContextFromSchema(securitySchema: Record<string, unknown>): Record<string, unknown>;
    static mapPerformanceMetricsToSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown>;
    static mapPerformanceMetricsFromSchema(performanceSchema: Record<string, unknown>): Record<string, unknown>;
    static mapEventBusToSchema(eventBus: Record<string, unknown>): Record<string, unknown>;
    static mapEventBusFromSchema(eventBusSchema: Record<string, unknown>): Record<string, unknown>;
    static mapErrorHandlingToSchema(errorHandling: Record<string, unknown>): Record<string, unknown>;
    static mapErrorHandlingFromSchema(errorHandlingSchema: Record<string, unknown>): Record<string, unknown>;
    static mapCoordinationToSchema(coordination: Record<string, unknown>): Record<string, unknown>;
    static mapCoordinationFromSchema(coordinationSchema: Record<string, unknown>): Record<string, unknown>;
    static mapOrchestrationToSchema(orchestration: Record<string, unknown>): Record<string, unknown>;
    static mapOrchestrationFromSchema(orchestrationSchema: Record<string, unknown>): Record<string, unknown>;
    static mapStateSyncToSchema(stateSync: Record<string, unknown>): Record<string, unknown>;
    static mapStateSyncFromSchema(stateSyncSchema: Record<string, unknown>): Record<string, unknown>;
    static mapTransactionToSchema(transaction: Record<string, unknown>): Record<string, unknown>;
    static mapTransactionFromSchema(transactionSchema: Record<string, unknown>): Record<string, unknown>;
    static mapProtocolVersionToSchema(protocolVersion: Record<string, unknown>): Record<string, unknown>;
    static mapProtocolVersionFromSchema(protocolVersionSchema: Record<string, unknown>): Record<string, unknown>;
    static createRequestToSchema(request: CreateTraceRequest): Partial<TraceSchema>;
    static updateRequestToSchema(request: UpdateTraceRequest): Partial<TraceSchema>;
    static queryFilterToSchema(filter: TraceQueryFilter): Record<string, unknown>;
}
//# sourceMappingURL=trace.mapper.d.ts.map