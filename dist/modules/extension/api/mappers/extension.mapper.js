"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionMapper = void 0;
class ExtensionMapper {
    static toSchema(entity) {
        return {
            protocol_version: entity.protocolVersion,
            timestamp: entity.timestamp,
            extension_id: entity.extensionId,
            context_id: entity.contextId,
            name: entity.name,
            display_name: entity.displayName,
            description: entity.description,
            version: entity.version,
            extension_type: entity.extensionType,
            status: entity.status,
            compatibility: this.compatibilityToSchema(entity.compatibility),
            configuration: this.configurationToSchema(entity.configuration),
            extension_points: this.extensionPointsToSchema(entity.extensionPoints),
            api_extensions: this.apiExtensionsToSchema(entity.apiExtensions),
            event_subscriptions: this.eventSubscriptionsToSchema(entity.eventSubscriptions),
            lifecycle: this.lifecycleToSchema(entity.lifecycle),
            security: this.securityToSchema(entity.security),
            metadata: this.metadataToSchema(entity.metadata),
            audit_trail: this.auditTrailToSchema(entity.auditTrail),
            performance_metrics: this.performanceMetricsToSchema(entity.performanceMetrics),
            monitoring_integration: this.monitoringIntegrationToSchema(entity.monitoringIntegration),
            version_history: this.versionHistoryToSchema(entity.versionHistory),
            search_metadata: this.searchMetadataToSchema(entity.searchMetadata),
            event_integration: this.eventIntegrationToSchema(entity.eventIntegration)
        };
    }
    static fromSchema(schema) {
        return {
            protocolVersion: schema.protocol_version,
            timestamp: schema.timestamp,
            extensionId: schema.extension_id,
            contextId: schema.context_id,
            name: schema.name,
            displayName: schema.display_name,
            description: schema.description,
            version: schema.version,
            extensionType: schema.extension_type,
            status: schema.status,
            compatibility: this.compatibilityFromSchema(schema.compatibility),
            configuration: this.configurationFromSchema(schema.configuration),
            extensionPoints: this.extensionPointsFromSchema(schema.extension_points),
            apiExtensions: this.apiExtensionsFromSchema(schema.api_extensions),
            eventSubscriptions: this.eventSubscriptionsFromSchema(schema.event_subscriptions),
            lifecycle: this.lifecycleFromSchema(schema.lifecycle),
            security: this.securityFromSchema(schema.security),
            metadata: this.metadataFromSchema(schema.metadata),
            auditTrail: this.auditTrailFromSchema(schema.audit_trail),
            performanceMetrics: this.performanceMetricsFromSchema(schema.performance_metrics),
            monitoringIntegration: this.monitoringIntegrationFromSchema(schema.monitoring_integration),
            versionHistory: this.versionHistoryFromSchema(schema.version_history),
            searchMetadata: this.searchMetadataFromSchema(schema.search_metadata),
            eventIntegration: this.eventIntegrationFromSchema(schema.event_integration)
        };
    }
    static validateSchema(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid extension schema: data must be an object');
        }
        const schema = data;
        const requiredFields = [
            'protocol_version', 'timestamp', 'extension_id', 'context_id',
            'name', 'display_name', 'description', 'version', 'extension_type', 'status'
        ];
        for (const field of requiredFields) {
            if (!schema[field]) {
                throw new Error(`Invalid extension schema: missing required field '${field}'`);
            }
        }
        if (typeof schema.protocol_version !== 'string') {
            throw new Error('Invalid extension schema: protocol_version must be a string');
        }
        if (typeof schema.extension_id !== 'string') {
            throw new Error('Invalid extension schema: extension_id must be a string');
        }
        if (typeof schema.context_id !== 'string') {
            throw new Error('Invalid extension schema: context_id must be a string');
        }
        const validExtensionTypes = ['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer'];
        if (!validExtensionTypes.includes(schema.extension_type)) {
            throw new Error(`Invalid extension schema: extension_type must be one of ${validExtensionTypes.join(', ')}`);
        }
        const validStatuses = ['installed', 'active', 'inactive', 'disabled', 'error', 'updating', 'uninstalling'];
        if (!validStatuses.includes(schema.status)) {
            throw new Error(`Invalid extension schema: status must be one of ${validStatuses.join(', ')}`);
        }
        return schema;
    }
    static toSchemaArray(entities) {
        return entities.map(entity => this.toSchema(entity));
    }
    static fromSchemaArray(schemas) {
        return schemas.map(schema => this.fromSchema(schema));
    }
    static compatibilityToSchema(compatibility) {
        return {
            mplp_version: compatibility.mplpVersion,
            required_modules: compatibility.requiredModules.map(module => ({
                module,
                min_version: undefined,
                max_version: undefined
            })),
            dependencies: compatibility.dependencies.map(dep => ({
                extension_id: `dep-${dep.name}`,
                name: dep.name,
                version_range: dep.version,
                optional: dep.optional
            })),
            conflicts: compatibility.conflicts.map(conflict => ({
                extension_id: `conflict-${conflict.name}`,
                name: conflict.name,
                reason: conflict.reason
            }))
        };
    }
    static compatibilityFromSchema(schema) {
        return {
            mplpVersion: schema.mplp_version,
            requiredModules: schema.required_modules?.map(module => module.module) || [],
            dependencies: schema.dependencies?.map(dep => ({
                name: dep.name,
                version: dep.version_range,
                optional: dep.optional || false,
                reason: 'Dependency requirement'
            })) || [],
            conflicts: schema.conflicts?.map(conflict => ({
                name: conflict.name,
                version: '1.0.0',
                reason: conflict.reason
            })) || []
        };
    }
    static configurationToSchema(configuration) {
        return {
            schema: configuration.schema,
            current_config: configuration.currentConfig,
            default_config: configuration.defaultConfig,
            validation_rules: configuration.validationRules.map(rule => ({
                rule: `${rule.field}:${rule.type}`,
                message: `Validation failed for ${rule.field}`,
                severity: rule.required ? 'error' : 'warning'
            }))
        };
    }
    static configurationFromSchema(schema) {
        return {
            schema: schema.schema,
            currentConfig: schema.current_config,
            defaultConfig: schema.default_config || {},
            validationRules: schema.validation_rules?.map(rule => ({
                field: rule.rule.split(':')[0] || 'unknown',
                type: rule.rule.split(':')[1] || 'string',
                required: rule.severity === 'error',
                pattern: undefined,
                minLength: undefined,
                maxLength: undefined,
                minimum: undefined,
                maximum: undefined,
                enum: undefined
            })) || []
        };
    }
    static extensionPointsToSchema(points) {
        return points.map(point => ({
            point_id: point.id,
            name: point.name,
            type: point.type,
            target_module: 'extension',
            event_name: point.description,
            execution_order: point.executionOrder,
            enabled: true,
            handler: {
                function_name: 'defaultHandler',
                parameters: Array.isArray(point.parameters)
                    ? point.parameters.reduce((acc, param) => {
                        acc[param.name] = param.defaultValue;
                        return acc;
                    }, {})
                    : {},
                timeout_ms: point.timeout,
                retry_policy: point.retryPolicy ? {
                    max_retries: point.retryPolicy.maxAttempts,
                    retry_delay_ms: point.retryPolicy.initialDelay,
                    backoff_strategy: point.retryPolicy.backoffStrategy
                } : undefined
            },
            conditions: point.conditionalExecution ? {
                when: point.conditionalExecution.condition,
                required_permissions: [],
                context_filters: point.conditionalExecution.parameters
            } : undefined
        }));
    }
    static extensionPointsFromSchema(schemas) {
        if (!schemas || !Array.isArray(schemas)) {
            return [];
        }
        return schemas.map(schema => ({
            id: schema.point_id,
            name: schema.name,
            type: schema.type,
            description: schema.event_name,
            parameters: [],
            returnType: 'void',
            async: true,
            timeout: schema.handler.timeout_ms,
            executionOrder: schema.execution_order,
            retryPolicy: schema.handler.retry_policy ? {
                maxAttempts: schema.handler.retry_policy.max_retries || 3,
                backoffStrategy: schema.handler.retry_policy.backoff_strategy || 'exponential',
                initialDelay: schema.handler.retry_policy.retry_delay_ms || 1000,
                maxDelay: (schema.handler.retry_policy.retry_delay_ms || 1000) * 10,
                retryableErrors: []
            } : undefined,
            conditionalExecution: schema.conditions ? {
                condition: schema.conditions.when || 'true',
                parameters: schema.conditions.context_filters || {}
            } : undefined
        }));
    }
    static apiExtensionsToSchema(extensions) {
        return extensions.map(ext => ({
            endpoint_id: `api-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            path: ext.endpoint,
            method: ext.method.toLowerCase(),
            description: ext.documentation?.description,
            handler: ext.handler,
            middleware: ext.middleware,
            authentication_required: ext.authentication.required,
            required_permissions: ext.authentication.permissions,
            rate_limit: ext.rateLimit.enabled ? {
                requests_per_minute: ext.rateLimit.requestsPerMinute,
                burst_size: ext.rateLimit.burstSize
            } : undefined,
            request_schema: ext.validation.requestSchema,
            response_schema: ext.validation.responseSchema
        }));
    }
    static apiExtensionsFromSchema(schemas) {
        return schemas.map(schema => ({
            endpoint: schema.path,
            method: schema.method.toUpperCase(),
            handler: schema.handler,
            middleware: schema.middleware || [],
            authentication: {
                required: schema.authentication_required,
                schemes: ['bearer'],
                permissions: schema.required_permissions || []
            },
            rateLimit: {
                enabled: !!schema.rate_limit,
                requestsPerMinute: schema.rate_limit?.requests_per_minute || 100,
                burstSize: schema.rate_limit?.burst_size || 10,
                keyGenerator: 'ip'
            },
            validation: {
                requestSchema: schema.request_schema,
                responseSchema: schema.response_schema,
                strictMode: true
            },
            documentation: {
                summary: schema.description || '',
                description: schema.description,
                tags: [],
                examples: []
            }
        }));
    }
    static eventSubscriptionsToSchema(subscriptions) {
        return subscriptions.map(sub => ({
            subscription_id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            event_pattern: sub.eventPattern,
            source_module: 'extension',
            handler: sub.handler,
            filter_conditions: sub.filterConditions.reduce((acc, condition) => {
                acc[condition.field] = {
                    operator: condition.operator,
                    value: condition.value
                };
                return acc;
            }, {}),
            delivery_guarantees: sub.deliveryGuarantee,
            dead_letter_queue: sub.deadLetterQueue.enabled
        }));
    }
    static eventSubscriptionsFromSchema(schemas) {
        return schemas.map(schema => ({
            eventPattern: schema.event_pattern,
            handler: schema.handler,
            filterConditions: Object.entries(schema.filter_conditions || {}).map(([field, condition]) => ({
                field,
                operator: (typeof condition === 'object' && condition !== null && 'operator' in condition
                    ? condition.operator
                    : 'eq'),
                value: (typeof condition === 'object' && condition !== null && 'value' in condition
                    ? condition.value
                    : condition)
            })),
            deliveryGuarantee: schema.delivery_guarantees,
            deadLetterQueue: {
                enabled: schema.dead_letter_queue || false,
                maxRetries: 3,
                retentionPeriod: 86400
            },
            retryPolicy: {
                maxAttempts: 3,
                backoffStrategy: 'exponential',
                initialDelay: 1000,
                maxDelay: 10000,
                retryableErrors: []
            },
            batchProcessing: {
                enabled: false,
                batchSize: 10,
                flushInterval: 5000
            }
        }));
    }
    static lifecycleToSchema(lifecycle) {
        return {
            install_date: lifecycle.installDate,
            last_update: lifecycle.lastUpdate,
            activation_count: lifecycle.activationCount,
            error_count: lifecycle.errorCount,
            last_error: undefined,
            performance_metrics: {
                average_execution_time_ms: lifecycle.performanceMetrics.averageResponseTime,
                total_executions: lifecycle.activationCount,
                success_rate: 1 - lifecycle.performanceMetrics.errorRate,
                memory_usage_mb: lifecycle.performanceMetrics.memoryUsage
            },
            health_check: {
                endpoint: lifecycle.healthCheck.endpoint,
                interval_seconds: Math.floor(lifecycle.healthCheck.interval / 1000),
                timeout_ms: lifecycle.healthCheck.timeout,
                failure_threshold: lifecycle.healthCheck.unhealthyThreshold
            }
        };
    }
    static lifecycleFromSchema(schema) {
        return {
            installDate: schema.install_date,
            lastUpdate: schema.last_update || schema.install_date,
            activationCount: schema.activation_count,
            errorCount: schema.error_count,
            performanceMetrics: {
                averageResponseTime: schema.performance_metrics?.average_execution_time_ms || 0,
                throughput: schema.performance_metrics?.total_executions || 0,
                errorRate: schema.performance_metrics ? 1 - (schema.performance_metrics.success_rate || 1) : 0,
                memoryUsage: schema.performance_metrics?.memory_usage_mb || 0,
                cpuUsage: 0,
                lastMeasurement: new Date().toISOString()
            },
            healthCheck: {
                enabled: !!schema.health_check,
                interval: (schema.health_check?.interval_seconds || 60) * 1000,
                timeout: schema.health_check?.timeout_ms || 5000,
                endpoint: schema.health_check?.endpoint,
                expectedStatus: 200,
                healthyThreshold: 3,
                unhealthyThreshold: schema.health_check?.failure_threshold || 3
            }
        };
    }
    static securityToSchema(security) {
        return {
            sandbox_enabled: security.sandboxEnabled,
            resource_limits: {
                max_memory_mb: Math.floor(security.resourceLimits.maxMemory / (1024 * 1024)),
                max_cpu_percent: security.resourceLimits.maxCpu,
                max_file_size_mb: Math.floor(security.resourceLimits.maxFileSize / (1024 * 1024)),
                network_access: security.resourceLimits.allowedHosts?.length > 0 || false,
                file_system_access: 'sandbox'
            },
            code_signing: {
                required: security.codeSigning.required,
                signature: '',
                certificate: '',
                timestamp: new Date().toISOString()
            },
            permissions: Object.entries(security.permissions).flatMap(([category, perms]) => {
                if (typeof perms === 'object' && perms !== null) {
                    if (Array.isArray(perms)) {
                        return perms.map(perm => ({
                            permission: `${category}:${perm}`,
                            justification: `Required for ${category} operations`,
                            approved: true,
                            approved_by: 'system',
                            approval_date: new Date().toISOString()
                        }));
                    }
                    else {
                        return Object.entries(perms).map(([subCategory, _subPerms]) => ({
                            permission: `${category}:${subCategory}`,
                            justification: `Required for ${category} ${subCategory} operations`,
                            approved: true,
                            approved_by: 'system',
                            approval_date: new Date().toISOString()
                        }));
                    }
                }
                return [];
            })
        };
    }
    static securityFromSchema(schema) {
        return {
            sandboxEnabled: schema.sandbox_enabled,
            resourceLimits: {
                maxMemory: (schema.resource_limits.max_memory_mb || 100) * 1024 * 1024,
                maxCpu: schema.resource_limits.max_cpu_percent || 50,
                maxFileSize: (schema.resource_limits.max_file_size_mb || 10) * 1024 * 1024,
                maxNetworkConnections: 10,
                allowedDomains: [],
                blockedDomains: [],
                allowedHosts: [],
                allowedPorts: [80, 443],
                protocols: ['http', 'https']
            },
            codeSigning: {
                required: schema.code_signing?.required || false,
                trustedSigners: [],
                verificationEndpoint: undefined
            },
            permissions: {
                fileSystem: { read: [], write: [], execute: [] },
                network: { allowedHosts: [], allowedPorts: [], protocols: [] },
                database: { read: [], write: [], admin: [] },
                api: { endpoints: [], methods: [], rateLimit: 100 }
            }
        };
    }
    static metadataToSchema(metadata) {
        return {
            author: metadata.author.name,
            organization: metadata.organization?.name,
            license: metadata.license.type,
            homepage: metadata.homepage,
            repository: metadata.repository?.url,
            documentation: metadata.documentation,
            support_contact: metadata.support?.email,
            keywords: metadata.keywords,
            categories: [metadata.category],
            screenshots: metadata.screenshots.map(url => ({ url, caption: undefined }))
        };
    }
    static metadataFromSchema(schema) {
        return {
            author: {
                name: schema.author || 'Unknown',
                email: undefined,
                url: undefined
            },
            organization: schema.organization ? {
                name: schema.organization,
                url: undefined,
                email: undefined
            } : undefined,
            license: {
                type: schema.license || 'MIT',
                url: undefined
            },
            homepage: schema.homepage,
            repository: schema.repository ? {
                type: 'git',
                url: schema.repository,
                directory: undefined
            } : undefined,
            documentation: schema.documentation,
            support: schema.support_contact ? {
                email: schema.support_contact,
                url: undefined,
                issues: undefined
            } : undefined,
            keywords: schema.keywords || [],
            category: schema.categories?.[0] || 'general',
            screenshots: schema.screenshots?.map(s => s.url) || []
        };
    }
    static auditTrailToSchema(auditTrail) {
        return {
            enabled: true,
            retention_days: auditTrail.complianceSettings.retentionPeriod,
            audit_events: auditTrail.events.map(event => ({
                event_id: event.id,
                event_type: event.eventType,
                timestamp: event.timestamp,
                user_id: event.userId || 'system',
                user_role: undefined,
                action: event.eventType,
                resource: 'extension',
                extension_operation: event.eventType,
                extension_id: undefined,
                extension_name: undefined,
                extension_type: undefined,
                extension_version: undefined,
                lifecycle_stage: undefined,
                extension_status: undefined,
                extension_details: event.details,
                ip_address: event.ipAddress,
                user_agent: event.userAgent,
                session_id: undefined,
                correlation_id: undefined
            })),
            compliance_settings: {
                gdpr_enabled: auditTrail.complianceSettings.encryptionEnabled,
                hipaa_enabled: false,
                sox_enabled: false,
                extension_audit_level: 'detailed',
                extension_data_logging: auditTrail.complianceSettings.accessLogging,
                custom_compliance: []
            }
        };
    }
    static auditTrailFromSchema(schema) {
        return {
            events: schema.audit_events?.map(event => ({
                id: event.event_id,
                timestamp: event.timestamp,
                eventType: event.event_type,
                userId: event.user_id,
                details: event.extension_details || {},
                ipAddress: event.ip_address,
                userAgent: event.user_agent
            })) || [],
            complianceSettings: {
                retentionPeriod: schema.retention_days,
                encryptionEnabled: schema.compliance_settings?.gdpr_enabled || false,
                accessLogging: schema.compliance_settings?.extension_data_logging || false,
                dataClassification: 'internal'
            }
        };
    }
    static performanceMetricsToSchema(metrics) {
        return {
            enabled: true,
            collection_interval_seconds: 60,
            metrics: {
                extension_activation_latency_ms: metrics.activationLatency,
                extension_lifecycle_efficiency_score: metrics.efficiencyScore,
                extension_ecosystem_health_score: metrics.healthStatus === 'healthy' ? 1.0 : 0.5,
                extension_compatibility_percent: metrics.availability,
                extension_management_efficiency_score: metrics.efficiencyScore,
                active_extensions_count: 1,
                extension_operations_per_second: metrics.throughput,
                extension_memory_usage_mb: metrics.memoryFootprint,
                average_extension_complexity_score: 0.5
            },
            health_status: {
                status: metrics.healthStatus === 'healthy' ? 'healthy' : 'degraded',
                last_check: new Date().toISOString(),
                checks: metrics.alerts.map(alert => ({
                    check_name: alert.type,
                    status: alert.resolved ? 'pass' : 'fail',
                    message: alert.message,
                    duration_ms: undefined
                }))
            },
            alerting: {
                enabled: metrics.alerts.length > 0,
                thresholds: {
                    max_extension_activation_latency_ms: 1000,
                    min_extension_lifecycle_efficiency_score: 0.8,
                    min_extension_ecosystem_health_score: 0.9,
                    min_extension_compatibility_percent: 0.95,
                    min_extension_management_efficiency_score: 0.8
                },
                notification_channels: ['email']
            }
        };
    }
    static performanceMetricsFromSchema(schema) {
        return {
            activationLatency: schema.metrics?.extension_activation_latency_ms || 0,
            executionTime: 0,
            memoryFootprint: schema.metrics?.extension_memory_usage_mb || 0,
            cpuUtilization: 0,
            networkLatency: 0,
            errorRate: 0,
            throughput: schema.metrics?.extension_operations_per_second || 0,
            availability: schema.metrics?.extension_compatibility_percent || 1.0,
            efficiencyScore: schema.metrics?.extension_lifecycle_efficiency_score || 1.0,
            healthStatus: schema.health_status?.status === 'healthy' ? 'healthy' : 'degraded',
            alerts: schema.health_status?.checks?.map(check => ({
                id: `alert-${Date.now()}`,
                type: check.check_name,
                severity: check.status === 'fail' ? 'high' : 'low',
                message: check.message || '',
                timestamp: new Date().toISOString(),
                threshold: 0,
                currentValue: 0,
                resolved: check.status === 'pass'
            })) || []
        };
    }
    static monitoringIntegrationToSchema(integration) {
        return {
            enabled: integration.providers.length > 0,
            supported_providers: integration.providers,
            integration_endpoints: {
                metrics_api: integration.endpoints[0]?.url,
                extension_lifecycle_api: undefined,
                performance_metrics_api: undefined,
                security_events_api: undefined
            },
            extension_metrics: {
                track_lifecycle_events: true,
                track_performance_impact: true,
                track_usage_statistics: true,
                track_security_events: true
            },
            export_formats: ['prometheus']
        };
    }
    static monitoringIntegrationFromSchema(schema) {
        return {
            providers: schema.supported_providers,
            endpoints: schema.integration_endpoints?.metrics_api ? [{
                    provider: schema.supported_providers[0] || 'prometheus',
                    url: schema.integration_endpoints.metrics_api,
                    credentials: undefined,
                    metrics: []
                }] : [],
            dashboards: [],
            alerting: {
                enabled: false,
                channels: [],
                rules: []
            }
        };
    }
    static versionHistoryToSchema(history) {
        return {
            enabled: true,
            max_versions: 10,
            versions: history.versions.map((version, index) => ({
                version_id: `v-${index}`,
                version_number: index + 1,
                created_at: version.releaseDate,
                created_by: 'system',
                change_summary: version.changelog,
                extension_snapshot: {},
                change_type: 'updated'
            })),
            auto_versioning: {
                enabled: history.autoVersioning?.enabled ?? false,
                version_on_install: true,
                version_on_update: true,
                version_on_config_change: false
            }
        };
    }
    static versionHistoryFromSchema(schema) {
        return {
            versions: schema.versions?.map(version => ({
                version: `${version.version_number}.0.0`,
                releaseDate: version.created_at,
                changelog: version.change_summary || '',
                breaking: false,
                deprecated: [],
                migration: undefined
            })) || [],
            autoVersioning: {
                enabled: schema.auto_versioning?.enabled || false,
                strategy: 'semantic',
                prerelease: false,
                buildMetadata: false
            }
        };
    }
    static searchMetadataToSchema(metadata) {
        return {
            enabled: true,
            indexing_strategy: 'full_text',
            searchable_fields: ['extension_id', 'name', 'type', 'description'],
            search_indexes: (metadata.facets || []).map((facet, index) => ({
                index_id: `idx-${index}`,
                index_name: facet.field,
                fields: [facet.field],
                index_type: 'btree',
                created_at: new Date().toISOString(),
                last_updated: new Date().toISOString()
            })),
            auto_indexing: {
                enabled: true,
                index_new_extensions: true,
                reindex_interval_hours: 24
            }
        };
    }
    static searchMetadataFromSchema(schema) {
        return {
            indexedFields: schema.searchable_fields || [],
            searchStrategies: [{
                    name: 'default',
                    type: schema.indexing_strategy === 'full_text' ? 'fuzzy' : 'exact',
                    weight: 1.0,
                    fields: schema.searchable_fields || []
                }],
            facets: schema.search_indexes?.map(index => ({
                field: index.index_name,
                type: 'terms',
                size: 10
            })) || []
        };
    }
    static eventIntegrationToSchema(integration) {
        return {
            enabled: true,
            event_bus_connection: {
                bus_type: integration.eventBus?.provider === 'custom' ? 'kafka' : (integration.eventBus?.provider || 'memory'),
                connection_string: integration.eventBus?.connectionString || '',
                topic_prefix: 'extension',
                consumer_group: 'extension-group'
            },
            published_events: ['extension_installed', 'extension_activated', 'extension_deactivated'],
            subscribed_events: ['context_updated', 'plan_executed'],
            event_routing: {
                routing_rules: (integration.eventRouting?.rules || []).map((rule, index) => ({
                    rule_id: `rule-${index}`,
                    condition: rule.condition || 'true',
                    target_topic: rule.destination,
                    enabled: true
                }))
            }
        };
    }
    static eventIntegrationFromSchema(schema) {
        return {
            eventBus: {
                provider: schema.event_bus_connection?.bus_type || 'custom',
                connectionString: schema.event_bus_connection?.connection_string || '',
                credentials: undefined,
                topics: []
            },
            eventRouting: {
                rules: schema.event_routing?.routing_rules?.map(rule => ({
                    pattern: rule.condition,
                    destination: rule.target_topic,
                    transformation: undefined,
                    condition: rule.condition
                })) || [],
                defaultRoute: undefined,
                errorHandling: {
                    strategy: 'retry',
                    maxRetries: 3,
                    backoffStrategy: 'exponential',
                    deadLetterTopic: undefined
                }
            },
            eventTransformation: {
                enabled: false,
                transformers: []
            }
        };
    }
}
exports.ExtensionMapper = ExtensionMapper;
