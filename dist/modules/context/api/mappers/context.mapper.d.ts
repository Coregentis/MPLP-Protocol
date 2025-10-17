import { ContextEntityData, ContextSchema } from '../../types';
export declare class ContextMapper {
    static toSchema(entity: ContextEntityData): ContextSchema;
    static fromSchema(schema: ContextSchema): ContextEntityData;
    static validateSchema(data: unknown): data is ContextSchema;
    static toSchemaArray(entities: ContextEntityData[]): ContextSchema[];
    static fromSchemaArray(schemas: ContextSchema[]): ContextEntityData[];
    private static sharedStateToSchema;
    private static sharedStateFromSchema;
    private static accessControlToSchema;
    private static accessControlFromSchema;
    private static configurationToSchema;
    private static configurationFromSchema;
    private static auditTrailToSchema;
    private static auditTrailFromSchema;
    private static objectToSnakeCase;
    private static objectToCamelCase;
    private static validateProtocolVersion;
    private static validateTimestamp;
    private static validateUUID;
    private static validateStatus;
    private static validateLifecycleStage;
    static validateMappingConsistency(entity: ContextEntityData, schema: ContextSchema): {
        isConsistent: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=context.mapper.d.ts.map