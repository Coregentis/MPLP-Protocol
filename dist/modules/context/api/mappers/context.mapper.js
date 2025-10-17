"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextMapper = void 0;
const utils_1 = require("../../../../shared/utils");
class ContextMapper {
    static toSchema(entity) {
        return {
            protocol_version: entity.protocolVersion,
            timestamp: entity.timestamp,
            context_id: entity.contextId,
            name: entity.name,
            description: entity.description,
            status: entity.status,
            lifecycle_stage: entity.lifecycleStage,
            shared_state: this.sharedStateToSchema(entity.sharedState),
            access_control: this.accessControlToSchema(entity.accessControl),
            configuration: this.configurationToSchema(entity.configuration),
            audit_trail: this.auditTrailToSchema(entity.auditTrail),
            monitoring_integration: this.objectToSnakeCase(entity.monitoringIntegration),
            performance_metrics: this.objectToSnakeCase(entity.performanceMetrics),
            version_history: this.objectToSnakeCase(entity.versionHistory),
            search_metadata: this.objectToSnakeCase(entity.searchMetadata),
            caching_policy: this.objectToSnakeCase(entity.cachingPolicy),
            sync_configuration: this.objectToSnakeCase(entity.syncConfiguration),
            error_handling: this.objectToSnakeCase(entity.errorHandling),
            integration_endpoints: this.objectToSnakeCase(entity.integrationEndpoints),
            event_integration: this.objectToSnakeCase(entity.eventIntegration)
        };
    }
    static fromSchema(schema) {
        return {
            protocolVersion: schema.protocol_version,
            timestamp: schema.timestamp,
            contextId: schema.context_id,
            name: schema.name,
            description: schema.description,
            status: schema.status,
            lifecycleStage: schema.lifecycle_stage,
            sharedState: this.sharedStateFromSchema(schema.shared_state),
            accessControl: this.accessControlFromSchema(schema.access_control),
            configuration: this.configurationFromSchema(schema.configuration),
            auditTrail: this.auditTrailFromSchema(schema.audit_trail),
            monitoringIntegration: this.objectToCamelCase(schema.monitoring_integration),
            performanceMetrics: this.objectToCamelCase(schema.performance_metrics),
            versionHistory: this.objectToCamelCase(schema.version_history),
            searchMetadata: this.objectToCamelCase(schema.search_metadata),
            cachingPolicy: this.objectToCamelCase(schema.caching_policy),
            syncConfiguration: this.objectToCamelCase(schema.sync_configuration),
            errorHandling: this.objectToCamelCase(schema.error_handling),
            integrationEndpoints: this.objectToCamelCase(schema.integration_endpoints),
            eventIntegration: this.objectToCamelCase(schema.event_integration)
        };
    }
    static validateSchema(data) {
        try {
            if (!data || typeof data !== 'object') {
                return false;
            }
            const schema = data;
            const requiredFields = [
                'protocol_version', 'timestamp', 'context_id', 'name', 'status', 'lifecycle_stage',
                'shared_state', 'access_control', 'configuration', 'audit_trail',
                'monitoring_integration', 'performance_metrics', 'version_history',
                'search_metadata', 'caching_policy', 'sync_configuration',
                'error_handling', 'integration_endpoints', 'event_integration'
            ];
            for (const field of requiredFields) {
                if (!(field in schema)) {
                    return false;
                }
            }
            if (typeof schema.protocol_version !== 'string' ||
                typeof schema.timestamp !== 'string' ||
                typeof schema.context_id !== 'string' ||
                typeof schema.name !== 'string' ||
                typeof schema.status !== 'string' ||
                typeof schema.lifecycle_stage !== 'string') {
                return false;
            }
            if (typeof schema.shared_state !== 'object' ||
                typeof schema.access_control !== 'object' ||
                typeof schema.configuration !== 'object' ||
                typeof schema.audit_trail !== 'object') {
                return false;
            }
            if (!this.validateProtocolVersion(schema.protocol_version)) {
                return false;
            }
            if (!this.validateTimestamp(schema.timestamp)) {
                return false;
            }
            if (!this.validateUUID(schema.context_id)) {
                return false;
            }
            if (!this.validateStatus(schema.status)) {
                return false;
            }
            if (!this.validateLifecycleStage(schema.lifecycle_stage)) {
                return false;
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static toSchemaArray(entities) {
        return entities.map(entity => this.toSchema(entity));
    }
    static fromSchemaArray(schemas) {
        return schemas.map(schema => this.fromSchema(schema));
    }
    static sharedStateToSchema(sharedState) {
        if (!sharedState) {
            return {
                variables: {},
                resources: { allocated: {}, requirements: {} },
                dependencies: [],
                goals: []
            };
        }
        return {
            variables: sharedState.variables || {},
            resources: {
                allocated: sharedState.resources?.allocated || {},
                limits: sharedState.resources?.limits || {}
            },
            dependencies: sharedState.dependencies || [],
            goals: sharedState.goals || []
        };
    }
    static sharedStateFromSchema(schema) {
        return {
            variables: schema.variables || {},
            resources: {
                allocated: schema.resources?.allocated || {},
                limits: schema.resources?.limits || {}
            },
            dependencies: schema.dependencies || [],
            goals: schema.goals || []
        };
    }
    static accessControlToSchema(accessControl) {
        if (!accessControl) {
            return {
                owner: { user_id: '', role: '' },
                permissions: [],
                policies: []
            };
        }
        return {
            owner: {
                user_id: accessControl.owner?.userId || '',
                role: accessControl.owner?.role || ''
            },
            permissions: (accessControl.permissions || []).map(perm => ({
                principal: perm.principal,
                principal_type: perm.principalType,
                resource: perm.resource,
                actions: perm.actions,
                conditions: perm.conditions
            })),
            policies: accessControl.policies?.map(policy => ({
                id: policy.id,
                name: policy.name,
                type: policy.type,
                rules: policy.rules,
                enforcement: policy.enforcement
            }))
        };
    }
    static accessControlFromSchema(schema) {
        const owner = schema.owner;
        return {
            owner: {
                userId: owner.user_id,
                role: owner.role
            },
            permissions: (schema.permissions || []).map((perm) => {
                const permObj = perm;
                return {
                    principal: permObj.principal,
                    principalType: permObj.principal_type,
                    resource: permObj.resource,
                    actions: permObj.actions,
                    conditions: permObj.conditions
                };
            }),
            policies: (schema.policies || []).map((policy) => {
                const policyObj = policy;
                return {
                    id: policyObj.id,
                    name: policyObj.name,
                    type: policyObj.type,
                    rules: policyObj.rules,
                    enforcement: policyObj.enforcement
                };
            })
        };
    }
    static configurationToSchema(configuration) {
        if (!configuration) {
            return {
                timeout_settings: { default_timeout: 30000, max_timeout: 300000 },
                persistence: { enabled: true, storage_backend: 'memory' }
            };
        }
        return {
            timeout_settings: {
                default_timeout: configuration.timeoutSettings?.defaultTimeout || 30000,
                max_timeout: configuration.timeoutSettings?.maxTimeout || 300000,
                cleanup_timeout: configuration.timeoutSettings?.cleanupTimeout
            },
            notification_settings: configuration.notificationSettings ? {
                enabled: configuration.notificationSettings.enabled,
                channels: configuration.notificationSettings.channels,
                events: configuration.notificationSettings.events
            } : undefined,
            persistence: {
                enabled: configuration.persistence?.enabled || true,
                storage_backend: configuration.persistence?.storageBackend || 'memory',
                retention_policy: configuration.persistence?.retentionPolicy ? {
                    duration: configuration.persistence.retentionPolicy.duration,
                    max_versions: configuration.persistence.retentionPolicy.maxVersions
                } : undefined
            }
        };
    }
    static configurationFromSchema(schema) {
        const timeoutSettings = schema.timeout_settings;
        const notificationSettings = schema.notification_settings;
        const persistence = schema.persistence;
        return {
            timeoutSettings: {
                defaultTimeout: timeoutSettings.default_timeout,
                maxTimeout: timeoutSettings.max_timeout,
                cleanupTimeout: timeoutSettings.cleanup_timeout
            },
            notificationSettings: notificationSettings ? {
                enabled: notificationSettings.enabled,
                channels: notificationSettings.channels,
                events: notificationSettings.events
            } : undefined,
            persistence: {
                enabled: persistence.enabled,
                storageBackend: persistence.storage_backend,
                retentionPolicy: persistence.retention_policy ? {
                    duration: persistence.retention_policy.duration,
                    maxVersions: persistence.retention_policy.max_versions
                } : undefined
            }
        };
    }
    static auditTrailToSchema(auditTrail) {
        return {
            enabled: auditTrail.enabled,
            retention_days: auditTrail.retentionDays,
            audit_events: auditTrail.auditEvents?.map(event => ({
                event_id: event.eventId,
                event_type: event.eventType,
                timestamp: event.timestamp,
                user_id: event.userId,
                user_role: event.userRole,
                action: event.action,
                resource: event.resource,
                context_operation: event.contextOperation,
                context_id: event.contextId,
                context_name: event.contextName,
                lifecycle_stage: event.lifecycleStage,
                shared_state_keys: event.sharedStateKeys,
                access_level: event.accessLevel,
                context_details: event.contextDetails,
                old_value: event.oldValue,
                new_value: event.newValue,
                ip_address: event.ipAddress,
                user_agent: event.userAgent,
                session_id: event.sessionId,
                correlation_id: event.correlationId
            })),
            compliance_settings: auditTrail.complianceSettings ? {
                gdpr_enabled: auditTrail.complianceSettings.gdprEnabled,
                hipaa_enabled: auditTrail.complianceSettings.hipaaEnabled,
                sox_enabled: auditTrail.complianceSettings.soxEnabled,
                context_audit_level: auditTrail.complianceSettings.contextAuditLevel,
                context_data_logging: auditTrail.complianceSettings.contextDataLogging,
                custom_compliance: auditTrail.complianceSettings.customCompliance
            } : undefined
        };
    }
    static auditTrailFromSchema(schema) {
        const complianceSettings = schema.compliance_settings;
        return {
            enabled: schema.enabled,
            retentionDays: schema.retention_days,
            auditEvents: (schema.audit_events || []).map((event) => {
                const eventObj = event;
                return {
                    eventId: eventObj.event_id,
                    eventType: eventObj.event_type,
                    timestamp: eventObj.timestamp,
                    userId: eventObj.user_id,
                    userRole: eventObj.user_role,
                    action: eventObj.action,
                    resource: eventObj.resource,
                    contextOperation: eventObj.context_operation,
                    contextId: eventObj.context_id,
                    contextName: eventObj.context_name,
                    lifecycleStage: eventObj.lifecycle_stage,
                    sharedStateKeys: eventObj.shared_state_keys,
                    accessLevel: eventObj.access_level,
                    contextDetails: eventObj.context_details,
                    oldValue: eventObj.old_value,
                    newValue: eventObj.new_value,
                    ipAddress: eventObj.ip_address,
                    userAgent: eventObj.user_agent,
                    sessionId: eventObj.session_id,
                    correlationId: eventObj.correlation_id
                };
            }),
            complianceSettings: complianceSettings ? {
                gdprEnabled: complianceSettings.gdpr_enabled,
                hipaaEnabled: complianceSettings.hipaa_enabled,
                soxEnabled: complianceSettings.sox_enabled,
                contextAuditLevel: complianceSettings.context_audit_level,
                contextDataLogging: complianceSettings.context_data_logging,
                customCompliance: complianceSettings.custom_compliance
            } : undefined
        };
    }
    static objectToSnakeCase(obj) {
        if (!obj || typeof obj !== 'object')
            return obj;
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const snakeKey = (0, utils_1.toSnakeCase)(key);
            if (Array.isArray(value)) {
                result[snakeKey] = value.map(item => typeof item === 'object' && item !== null ? this.objectToSnakeCase(item) : item);
            }
            else if (typeof value === 'object' && value !== null) {
                result[snakeKey] = this.objectToSnakeCase(value);
            }
            else {
                result[snakeKey] = value;
            }
        }
        return result;
    }
    static objectToCamelCase(obj) {
        if (!obj || typeof obj !== 'object')
            return obj;
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const camelKey = (0, utils_1.toCamelCase)(key);
            if (Array.isArray(value)) {
                result[camelKey] = value.map(item => typeof item === 'object' && item !== null ? this.objectToCamelCase(item) : item);
            }
            else if (typeof value === 'object' && value !== null) {
                result[camelKey] = this.objectToCamelCase(value);
            }
            else {
                result[camelKey] = value;
            }
        }
        return result;
    }
    static validateProtocolVersion(version) {
        const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
        return semverRegex.test(version);
    }
    static validateTimestamp(timestamp) {
        try {
            const date = new Date(timestamp);
            return date.toISOString() === timestamp;
        }
        catch {
            return false;
        }
    }
    static validateUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    static validateStatus(status) {
        const validStatuses = ['active', 'suspended', 'completed', 'terminated'];
        return validStatuses.includes(status);
    }
    static validateLifecycleStage(stage) {
        const validStages = ['planning', 'executing', 'monitoring', 'completed'];
        return validStages.includes(stage);
    }
    static validateMappingConsistency(entity, schema) {
        const errors = [];
        try {
            const convertedSchema = this.toSchema(entity);
            const convertedEntity = this.fromSchema(schema);
            if (entity.contextId !== convertedEntity.contextId) {
                errors.push('Context ID mapping inconsistency');
            }
            if (entity.name !== convertedEntity.name) {
                errors.push('Name mapping inconsistency');
            }
            if (entity.status !== convertedEntity.status) {
                errors.push('Status mapping inconsistency');
            }
            if (entity.lifecycleStage !== convertedEntity.lifecycleStage) {
                errors.push('Lifecycle stage mapping inconsistency');
            }
            if (schema.context_id !== convertedSchema.context_id) {
                errors.push('Schema context_id mapping inconsistency');
            }
            if (schema.name !== convertedSchema.name) {
                errors.push('Schema name mapping inconsistency');
            }
            return {
                isConsistent: errors.length === 0,
                errors
            };
        }
        catch (error) {
            errors.push(`Mapping validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                isConsistent: false,
                errors
            };
        }
    }
}
exports.ContextMapper = ContextMapper;
