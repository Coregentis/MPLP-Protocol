import { ExtensionEntityData, ExtensionSchema } from '../../types';
export declare class ExtensionMapper {
    static toSchema(entity: ExtensionEntityData): ExtensionSchema;
    static fromSchema(schema: ExtensionSchema): ExtensionEntityData;
    static validateSchema(data: unknown): ExtensionSchema;
    static toSchemaArray(entities: ExtensionEntityData[]): ExtensionSchema[];
    static fromSchemaArray(schemas: ExtensionSchema[]): ExtensionEntityData[];
    private static compatibilityToSchema;
    private static compatibilityFromSchema;
    private static configurationToSchema;
    private static configurationFromSchema;
    private static extensionPointsToSchema;
    private static extensionPointsFromSchema;
    private static apiExtensionsToSchema;
    private static apiExtensionsFromSchema;
    private static eventSubscriptionsToSchema;
    private static eventSubscriptionsFromSchema;
    private static lifecycleToSchema;
    private static lifecycleFromSchema;
    private static securityToSchema;
    private static securityFromSchema;
    private static metadataToSchema;
    private static metadataFromSchema;
    private static auditTrailToSchema;
    private static auditTrailFromSchema;
    private static performanceMetricsToSchema;
    private static performanceMetricsFromSchema;
    private static monitoringIntegrationToSchema;
    private static monitoringIntegrationFromSchema;
    private static versionHistoryToSchema;
    private static versionHistoryFromSchema;
    private static searchMetadataToSchema;
    private static searchMetadataFromSchema;
    private static eventIntegrationToSchema;
    private static eventIntegrationFromSchema;
}
//# sourceMappingURL=extension.mapper.d.ts.map