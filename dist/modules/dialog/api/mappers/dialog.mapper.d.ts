import { DialogSchema } from '../../types';
import { DialogEntity } from '../../domain/entities/dialog.entity';
export declare class DialogMapper {
    static toSchema(entity: DialogEntity): DialogSchema;
    static fromSchema(schema: DialogSchema): DialogEntity;
    private static auditTrailFromSchema;
    private static monitoringFromSchema;
    private static performanceFromSchema;
    private static versionHistoryFromSchema;
    private static searchMetadataFromSchema;
    private static eventIntegrationFromSchema;
    private static configurationFromSchema;
    private static dialogDetailsFromSchema;
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
    static fromSchemaArray(schemas: DialogSchema[]): DialogEntity[];
    static toSchemaArray(entities: DialogEntity[]): DialogSchema[];
}
//# sourceMappingURL=dialog.mapper.d.ts.map