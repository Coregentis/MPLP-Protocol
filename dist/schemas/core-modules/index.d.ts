import ContextSchema from './mplp-context.json';
import PlanSchema from './mplp-plan.json';
import ConfirmSchema from './mplp-confirm.json';
import TraceSchema from './mplp-trace.json';
import RoleSchema from './mplp-role.json';
import ExtensionSchema from './mplp-extension.json';
import CoreSchema from './mplp-core.json';
import CollabSchema from './mplp-collab.json';
import DialogSchema from './mplp-dialog.json';
import NetworkSchema from './mplp-network.json';
export { ContextSchema, PlanSchema, ConfirmSchema, TraceSchema, RoleSchema, ExtensionSchema, CoreSchema, CollabSchema, DialogSchema, NetworkSchema };
export declare const CoreModulesSchemaMap: {
    readonly context: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        properties: {
            protocol_version: {
                $ref: string;
                description: string;
                const: string;
            };
            timestamp: {
                $ref: string;
                description: string;
            };
            context_id: {
                $ref: string;
                description: string;
            };
            name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            description: {
                type: string;
                maxLength: number;
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            lifecycle_stage: {
                type: string;
                enum: string[];
                description: string;
            };
            shared_state: {
                type: string;
                properties: {
                    variables: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                    resources: {
                        type: string;
                        properties: {
                            allocated: {
                                type: string;
                                additionalProperties: {
                                    type: string;
                                    properties: {
                                        type: {
                                            type: string;
                                        };
                                        amount: {
                                            type: string;
                                        };
                                        unit: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                    };
                                    required: string[];
                                };
                            };
                            requirements: {
                                type: string;
                                additionalProperties: {
                                    type: string;
                                    properties: {
                                        minimum: {
                                            type: string;
                                        };
                                        optimal: {
                                            type: string;
                                        };
                                        maximum: {
                                            type: string;
                                        };
                                        unit: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                        required: string[];
                    };
                    dependencies: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                id: {
                                    $ref: string;
                                };
                                type: {
                                    type: string;
                                    enum: string[];
                                };
                                name: {
                                    type: string;
                                };
                                version: {
                                    $ref: string;
                                };
                                status: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    goals: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                id: {
                                    $ref: string;
                                };
                                name: {
                                    type: string;
                                };
                                description: {
                                    type: string;
                                };
                                priority: {
                                    $ref: string;
                                };
                                status: {
                                    type: string;
                                    enum: string[];
                                };
                                success_criteria: {
                                    type: string;
                                    items: {
                                        type: string;
                                        properties: {
                                            metric: {
                                                type: string;
                                            };
                                            operator: {
                                                type: string;
                                                enum: string[];
                                            };
                                            value: {
                                                type: string[];
                                            };
                                            unit: {
                                                type: string;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            access_control: {
                type: string;
                properties: {
                    owner: {
                        type: string;
                        properties: {
                            user_id: {
                                type: string;
                            };
                            role: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                    permissions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                principal: {
                                    type: string;
                                };
                                principal_type: {
                                    type: string;
                                    enum: string[];
                                };
                                resource: {
                                    type: string;
                                };
                                actions: {
                                    type: string;
                                    items: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                                conditions: {
                                    type: string;
                                    additionalProperties: boolean;
                                };
                            };
                            required: string[];
                        };
                    };
                    policies: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                id: {
                                    $ref: string;
                                };
                                name: {
                                    type: string;
                                };
                                type: {
                                    type: string;
                                    enum: string[];
                                };
                                rules: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                enforcement: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            configuration: {
                type: string;
                properties: {
                    timeout_settings: {
                        type: string;
                        properties: {
                            default_timeout: {
                                type: string;
                                minimum: number;
                            };
                            max_timeout: {
                                type: string;
                                minimum: number;
                            };
                            cleanup_timeout: {
                                type: string;
                                minimum: number;
                            };
                        };
                        required: string[];
                    };
                    notification_settings: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            events: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                        required: string[];
                    };
                    persistence: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            storage_backend: {
                                type: string;
                                enum: string[];
                            };
                            retention_policy: {
                                type: string;
                                properties: {
                                    duration: {
                                        type: string;
                                    };
                                    max_versions: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                };
                required: string[];
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    $ref: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                context_operation: {
                                    type: string;
                                };
                                context_id: {
                                    $ref: string;
                                };
                                context_name: {
                                    type: string;
                                };
                                lifecycle_stage: {
                                    type: string;
                                };
                                shared_state_keys: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                access_level: {
                                    type: string;
                                };
                                context_details: {
                                    type: string;
                                };
                                old_value: {
                                    type: string;
                                };
                                new_value: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            context_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            context_data_logging: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            context_state_api: {
                                type: string;
                                format: string;
                            };
                            cache_metrics_api: {
                                type: string;
                                format: string;
                            };
                            sync_metrics_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    context_metrics: {
                        type: string;
                        properties: {
                            track_state_changes: {
                                type: string;
                            };
                            track_cache_performance: {
                                type: string;
                            };
                            track_sync_operations: {
                                type: string;
                            };
                            track_access_patterns: {
                                type: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                required: string[];
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            context_access_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            context_update_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            cache_hit_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            context_sync_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            context_state_consistency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_contexts_count: {
                                type: string;
                                minimum: number;
                            };
                            context_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            context_memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_context_size_bytes: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                $ref: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_context_access_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    max_context_update_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_cache_hit_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_context_sync_success_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_context_state_consistency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    $ref: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                context_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_config_change: {
                                type: string;
                            };
                            version_on_state_change: {
                                type: string;
                            };
                            version_on_cache_change: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    context_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_context_data: {
                                type: string;
                            };
                            index_performance_metrics: {
                                type: string;
                            };
                            index_audit_logs: {
                                type: string;
                            };
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_contexts: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            caching_policy: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    cache_strategy: {
                        type: string;
                        enum: string[];
                    };
                    cache_levels: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                level: {
                                    type: string;
                                };
                                backend: {
                                    type: string;
                                    enum: string[];
                                };
                                ttl_seconds: {
                                    type: string;
                                    minimum: number;
                                };
                                max_size_mb: {
                                    type: string;
                                    minimum: number;
                                };
                                eviction_policy: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    cache_warming: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            strategies: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            sync_configuration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    sync_strategy: {
                        type: string;
                        enum: string[];
                    };
                    sync_targets: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                target_id: {
                                    type: string;
                                };
                                target_type: {
                                    type: string;
                                    enum: string[];
                                };
                                sync_frequency: {
                                    type: string;
                                };
                                conflict_resolution: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    replication: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            replication_factor: {
                                type: string;
                                minimum: number;
                            };
                            consistency_level: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
                required: string[];
            };
            error_handling: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    error_policies: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                error_type: {
                                    type: string;
                                };
                                severity: {
                                    type: string;
                                    enum: string[];
                                };
                                action: {
                                    type: string;
                                    enum: string[];
                                };
                                retry_config: {
                                    type: string;
                                    properties: {
                                        max_attempts: {
                                            type: string;
                                            minimum: number;
                                        };
                                        backoff_strategy: {
                                            type: string;
                                            enum: string[];
                                        };
                                        base_delay_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                    circuit_breaker: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            failure_threshold: {
                                type: string;
                                minimum: number;
                            };
                            timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                            reset_timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                    recovery_strategy: {
                        type: string;
                        properties: {
                            auto_recovery: {
                                type: string;
                            };
                            backup_sources: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            rollback_enabled: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            integration_endpoints: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    webhooks: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                webhook_id: {
                                    $ref: string;
                                };
                                url: {
                                    type: string;
                                    format: string;
                                };
                                events: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                authentication: {
                                    type: string;
                                    properties: {
                                        type: {
                                            type: string;
                                            enum: string[];
                                        };
                                        credentials: {
                                            type: string;
                                        };
                                    };
                                };
                                retry_policy: {
                                    type: string;
                                    properties: {
                                        max_attempts: {
                                            type: string;
                                        };
                                        backoff_ms: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                    api_endpoints: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                endpoint_id: {
                                    type: string;
                                };
                                path: {
                                    type: string;
                                };
                                method: {
                                    type: string;
                                    enum: string[];
                                };
                                authentication_required: {
                                    type: string;
                                };
                                rate_limit: {
                                    type: string;
                                    properties: {
                                        requests_per_minute: {
                                            type: string;
                                        };
                                        burst_limit: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            context_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            context_details: {
                type: string;
                properties: {
                    context_scope: {
                        type: string;
                        enum: string[];
                    };
                    persistence_level: {
                        type: string;
                        enum: string[];
                    };
                    sharing_policy: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
        examples: {
            protocol_version: string;
            timestamp: string;
            context_id: string;
            name: string;
            description: string;
            status: string;
            lifecycle_stage: string;
            shared_state: {
                variables: {
                    environment: string;
                    region: string;
                    feature_flags: {
                        new_ui: boolean;
                        beta_features: boolean;
                    };
                };
                resources: {
                    allocated: {
                        memory: {
                            type: string;
                            amount: number;
                            unit: string;
                            status: string;
                        };
                        cpu: {
                            type: string;
                            amount: number;
                            unit: string;
                            status: string;
                        };
                    };
                    requirements: {
                        storage: {
                            minimum: number;
                            optimal: number;
                            maximum: number;
                            unit: string;
                        };
                    };
                };
                dependencies: {
                    id: string;
                    type: string;
                    name: string;
                    version: string;
                    status: string;
                }[];
                goals: {
                    id: string;
                    name: string;
                    priority: string;
                    status: string;
                    success_criteria: {
                        metric: string;
                        operator: string;
                        value: number;
                        unit: string;
                    }[];
                }[];
            };
            access_control: {
                owner: {
                    user_id: string;
                    role: string;
                };
                permissions: {
                    principal: string;
                    principal_type: string;
                    resource: string;
                    actions: string[];
                }[];
            };
            configuration: {
                timeout_settings: {
                    default_timeout: number;
                    max_timeout: number;
                };
                notification_settings: {
                    enabled: boolean;
                    channels: string[];
                    events: string[];
                };
                persistence: {
                    enabled: boolean;
                    storage_backend: string;
                    retention_policy: {
                        duration: string;
                        max_versions: number;
                    };
                };
            };
        }[];
    };
    readonly plan: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
            failure_resolver: {
                type: string;
                description: string;
                properties: {
                    enabled: {
                        type: string;
                        description: string;
                    };
                    strategies: {
                        type: string;
                        description: string;
                        items: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                    };
                    retry_config: {
                        type: string;
                        description: string;
                        properties: {
                            max_attempts: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            delay_ms: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            backoff_factor: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            max_delay_ms: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                    rollback_config: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                                description: string;
                            };
                            checkpoint_frequency: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            max_rollback_depth: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                    manual_intervention_config: {
                        type: string;
                        description: string;
                        properties: {
                            timeout_ms: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            escalation_levels: {
                                type: string;
                                items: {
                                    type: string;
                                };
                                description: string;
                            };
                            approval_required: {
                                type: string;
                                description: string;
                            };
                        };
                    };
                    notification_channels: {
                        type: string;
                        items: {
                            type: string;
                        };
                        description: string;
                    };
                    performance_thresholds: {
                        type: string;
                        description: string;
                        properties: {
                            max_execution_time_ms: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            max_memory_usage_mb: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            max_cpu_usage_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                        };
                    };
                    diagnostic_integration: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                                description: string;
                            };
                            supported_diagnostic_providers: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                description: string;
                            };
                            diagnostic_endpoints: {
                                type: string;
                                properties: {
                                    failure_analysis_api: {
                                        type: string;
                                        format: string;
                                    };
                                    pattern_detection_api: {
                                        type: string;
                                        format: string;
                                    };
                                    recommendation_api: {
                                        type: string;
                                        format: string;
                                    };
                                };
                            };
                            request_format: {
                                type: string;
                                properties: {
                                    input_schema: {
                                        type: string;
                                    };
                                    output_schema: {
                                        type: string;
                                    };
                                    timeout_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                    vendor_integration: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                                description: string;
                            };
                            sync_frequency_ms: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            data_retention_days: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            sync_detailed_diagnostics: {
                                type: string;
                                description: string;
                            };
                            receive_suggestions: {
                                type: string;
                                description: string;
                            };
                            auto_apply_suggestions: {
                                type: string;
                                description: string;
                            };
                        };
                    };
                    proactive_prevention: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                                description: string;
                            };
                            prediction_confidence_threshold: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            auto_prevention_enabled: {
                                type: string;
                                description: string;
                            };
                            prevention_strategies: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                description: string;
                            };
                            monitoring_interval_ms: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                    learning_integration: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                                description: string;
                            };
                            supported_learning_providers: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                                description: string;
                            };
                            learning_endpoints: {
                                type: string;
                                properties: {
                                    feedback_collection_api: {
                                        type: string;
                                        format: string;
                                    };
                                    pattern_learning_api: {
                                        type: string;
                                        format: string;
                                    };
                                    strategy_optimization_api: {
                                        type: string;
                                        format: string;
                                    };
                                };
                            };
                            data_sharing: {
                                type: string;
                                properties: {
                                    anonymization_enabled: {
                                        type: string;
                                    };
                                    data_retention_days: {
                                        type: string;
                                        minimum: number;
                                    };
                                    sharing_scope: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                    external_integrations: {
                        type: string;
                        description: string;
                        properties: {
                            diagnostic_systems: {
                                type: string;
                                description: string;
                            };
                            prediction_services: {
                                type: string;
                                description: string;
                            };
                            recovery_automation: {
                                type: string;
                                description: string;
                            };
                            optimization_engines: {
                                type: string;
                                description: string;
                            };
                            monitoring_platforms: {
                                type: string;
                                description: string;
                            };
                            recommendation_services: {
                                type: string;
                                description: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            recovery_suggestion: {
                type: string;
                description: string;
                minLength: number;
                maxLength: number;
            };
            development_issue: {
                type: string;
                description: string;
                properties: {
                    id: {
                        type: string;
                        description: string;
                        pattern: string;
                        minLength: number;
                        maxLength: number;
                    };
                    type: {
                        type: string;
                        description: string;
                        enum: string[];
                    };
                    severity: {
                        type: string;
                        description: string;
                        enum: string[];
                    };
                    title: {
                        type: string;
                        description: string;
                        minLength: number;
                        maxLength: number;
                    };
                    file_path: {
                        type: string;
                        description: string;
                        pattern: string;
                    };
                    line_number: {
                        type: string;
                        description: string;
                        minimum: number;
                    };
                    description: {
                        type: string;
                        description: string;
                        maxLength: number;
                    };
                    suggested_fix: {
                        type: string;
                        description: string;
                        maxLength: number;
                    };
                    detected_at: {
                        $ref: string;
                        description: string;
                    };
                    status: {
                        type: string;
                        description: string;
                        enum: string[];
                    };
                    dependencies: {
                        type: string;
                        description: string;
                        items: {
                            type: string;
                        };
                    };
                    confidence_score: {
                        type: string;
                        description: string;
                        minimum: number;
                        maximum: number;
                    };
                };
                required: string[];
            };
        };
        properties: {
            protocol_version: {
                $ref: string;
                description: string;
                const: string;
            };
            timestamp: {
                $ref: string;
                description: string;
            };
            plan_id: {
                $ref: string;
                description: string;
            };
            context_id: {
                $ref: string;
                description: string;
            };
            name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            description: {
                type: string;
                maxLength: number;
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            priority: {
                $ref: string;
                description: string;
            };
            timeline: {
                type: string;
                properties: {
                    start_date: {
                        $ref: string;
                    };
                    end_date: {
                        $ref: string;
                    };
                    estimated_duration: {
                        type: string;
                        properties: {
                            value: {
                                type: string;
                                minimum: number;
                            };
                            unit: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                    actual_duration: {
                        type: string;
                        properties: {
                            value: {
                                type: string;
                                minimum: number;
                            };
                            unit: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                required: string[];
            };
            tasks: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        task_id: {
                            $ref: string;
                        };
                        name: {
                            type: string;
                            minLength: number;
                            maxLength: number;
                        };
                        description: {
                            type: string;
                            maxLength: number;
                        };
                        type: {
                            type: string;
                            enum: string[];
                        };
                        status: {
                            type: string;
                            enum: string[];
                        };
                        priority: {
                            $ref: string;
                        };
                        assignee: {
                            type: string;
                            properties: {
                                user_id: {
                                    type: string;
                                };
                                role: {
                                    type: string;
                                };
                                team: {
                                    type: string;
                                };
                            };
                        };
                        estimated_effort: {
                            type: string;
                            properties: {
                                value: {
                                    type: string;
                                    minimum: number;
                                };
                                unit: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                        actual_effort: {
                            type: string;
                            properties: {
                                value: {
                                    type: string;
                                    minimum: number;
                                };
                                unit: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                        resources_required: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    resource_type: {
                                        type: string;
                                    };
                                    amount: {
                                        type: string;
                                        minimum: number;
                                    };
                                    unit: {
                                        type: string;
                                    };
                                    availability: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                                required: string[];
                            };
                        };
                        acceptance_criteria: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    id: {
                                        $ref: string;
                                    };
                                    description: {
                                        type: string;
                                    };
                                    type: {
                                        type: string;
                                        enum: string[];
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    verification_method: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                                required: string[];
                            };
                        };
                        sub_tasks: {
                            type: string;
                            items: {
                                $ref: string;
                            };
                        };
                        metadata: {
                            type: string;
                            properties: {
                                tags: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                category: {
                                    type: string;
                                };
                                source: {
                                    type: string;
                                };
                                complexity_score: {
                                    type: string;
                                    minimum: number;
                                };
                                risk_level: {
                                    type: string;
                                };
                                automation_level: {
                                    type: string;
                                };
                                retry_count: {
                                    type: string;
                                    minimum: number;
                                };
                                max_retry_count: {
                                    type: string;
                                    minimum: number;
                                };
                                intervention_required: {
                                    type: string;
                                };
                                intervention_reason: {
                                    type: string;
                                };
                                intervention_requested_at: {
                                    $ref: string;
                                };
                                rollback_reason: {
                                    type: string;
                                };
                                rollback_target: {
                                    $ref: string;
                                };
                                skip_reason: {
                                    type: string;
                                };
                                skip_dependents: {
                                    type: string;
                                };
                                recovery_suggestions: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                    description: string;
                                    maxItems: number;
                                    uniqueItems: boolean;
                                };
                                development_issues: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                    description: string;
                                    maxItems: number;
                                    uniqueItems: boolean;
                                };
                            };
                        };
                        started_at: {
                            $ref: string;
                        };
                        completed_at: {
                            $ref: string;
                        };
                        progress_percentage: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        actual_duration_minutes: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        error_message: {
                            type: string;
                            description: string;
                        };
                        result_data: {
                            type: string;
                            description: string;
                            additionalProperties: boolean;
                        };
                    };
                    required: string[];
                };
            };
            dependencies: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        id: {
                            $ref: string;
                        };
                        source_task_id: {
                            $ref: string;
                        };
                        target_task_id: {
                            $ref: string;
                        };
                        dependency_type: {
                            type: string;
                            enum: string[];
                        };
                        lag: {
                            type: string;
                            properties: {
                                value: {
                                    type: string;
                                };
                                unit: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                        criticality: {
                            type: string;
                            enum: string[];
                        };
                        condition: {
                            type: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            milestones: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        id: {
                            $ref: string;
                        };
                        name: {
                            type: string;
                        };
                        description: {
                            type: string;
                        };
                        target_date: {
                            $ref: string;
                        };
                        status: {
                            type: string;
                            enum: string[];
                        };
                        success_criteria: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    metric: {
                                        type: string;
                                    };
                                    target_value: {
                                        type: string[];
                                    };
                                    actual_value: {
                                        type: string[];
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                    required: string[];
                };
            };
            optimization: {
                type: string;
                properties: {
                    strategy: {
                        type: string;
                        enum: string[];
                    };
                    constraints: {
                        type: string;
                        properties: {
                            max_duration: {
                                type: string;
                                properties: {
                                    value: {
                                        type: string;
                                        minimum: number;
                                    };
                                    unit: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                                required: string[];
                            };
                            max_cost: {
                                type: string;
                                minimum: number;
                            };
                            min_quality: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            available_resources: {
                                type: string;
                                additionalProperties: boolean;
                            };
                        };
                    };
                    parameters: {
                        type: string;
                        additionalProperties: boolean;
                    };
                };
                required: string[];
            };
            risk_assessment: {
                type: string;
                properties: {
                    overall_risk_level: {
                        type: string;
                        enum: string[];
                    };
                    risks: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                id: {
                                    $ref: string;
                                };
                                name: {
                                    type: string;
                                };
                                description: {
                                    type: string;
                                };
                                level: {
                                    type: string;
                                    enum: string[];
                                };
                                category: {
                                    type: string;
                                    enum: string[];
                                };
                                probability: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                impact: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                status: {
                                    type: string;
                                    enum: string[];
                                };
                                mitigation_plan: {
                                    type: string;
                                };
                                contingency_plan: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            failure_resolver: {
                $ref: string;
                description: string;
            };
            configuration: {
                type: string;
                properties: {
                    auto_scheduling_enabled: {
                        type: string;
                    };
                    dependency_validation_enabled: {
                        type: string;
                    };
                    risk_monitoring_enabled: {
                        type: string;
                    };
                    failure_recovery_enabled: {
                        type: string;
                    };
                    performance_tracking_enabled: {
                        type: string;
                    };
                    notification_settings: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            channels: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            events: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            task_completion: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                    optimization_settings: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            strategy: {
                                type: string;
                                enum: string[];
                            };
                            auto_reoptimize: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                    timeout_settings: {
                        type: string;
                        properties: {
                            default_task_timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                            plan_execution_timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                            dependency_resolution_timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                    parallel_execution_limit: {
                        type: string;
                        minimum: number;
                    };
                };
            };
            metadata: {
                type: string;
                additionalProperties: boolean;
                description: string;
            };
            created_at: {
                $ref: string;
                description: string;
            };
            updated_at: {
                $ref: string;
                description: string;
            };
            created_by: {
                type: string;
                description: string;
            };
            updated_by: {
                type: string;
                description: string;
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    $ref: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                plan_operation: {
                                    type: string;
                                };
                                plan_id: {
                                    $ref: string;
                                };
                                plan_name: {
                                    type: string;
                                };
                                plan_status: {
                                    type: string;
                                };
                                task_ids: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                                execution_stage: {
                                    type: string;
                                };
                                plan_details: {
                                    type: string;
                                };
                                old_value: {
                                    type: string;
                                };
                                new_value: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            plan_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            plan_data_logging: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            plan_execution_api: {
                                type: string;
                                format: string;
                            };
                            task_metrics_api: {
                                type: string;
                                format: string;
                            };
                            resource_metrics_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    plan_metrics: {
                        type: string;
                        properties: {
                            track_execution_progress: {
                                type: string;
                            };
                            track_task_performance: {
                                type: string;
                            };
                            track_resource_usage: {
                                type: string;
                            };
                            track_failure_recovery: {
                                type: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                required: string[];
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            plan_execution_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            task_completion_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            plan_optimization_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            dependency_resolution_accuracy_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            plan_execution_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_plans_count: {
                                type: string;
                                minimum: number;
                            };
                            plan_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            plan_memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_plan_complexity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                $ref: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                        required: string[];
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_plan_execution_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_task_completion_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_plan_optimization_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_dependency_resolution_accuracy_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_plan_execution_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    $ref: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                plan_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_config_change: {
                                type: string;
                            };
                            version_on_task_change: {
                                type: string;
                            };
                            version_on_dependency_change: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    plan_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_plan_data: {
                                type: string;
                            };
                            index_performance_metrics: {
                                type: string;
                            };
                            index_audit_logs: {
                                type: string;
                            };
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_plans: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            caching_policy: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    cache_strategy: {
                        type: string;
                        enum: string[];
                    };
                    cache_levels: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                level: {
                                    type: string;
                                };
                                backend: {
                                    type: string;
                                    enum: string[];
                                };
                                ttl_seconds: {
                                    type: string;
                                    minimum: number;
                                };
                                max_size_mb: {
                                    type: string;
                                    minimum: number;
                                };
                                eviction_policy: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    cache_warming: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            strategies: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            plan_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            plan_details: {
                type: string;
                properties: {
                    planning_strategy: {
                        type: string;
                        enum: string[];
                    };
                    execution_mode: {
                        type: string;
                        enum: string[];
                    };
                    rollback_support: {
                        type: string;
                    };
                };
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    readonly confirm: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        properties: {
            protocol_version: {
                $ref: string;
                description: string;
                const: string;
            };
            timestamp: {
                $ref: string;
                description: string;
            };
            confirm_id: {
                $ref: string;
                description: string;
            };
            context_id: {
                $ref: string;
                description: string;
            };
            plan_id: {
                $ref: string;
                description: string;
            };
            confirmation_type: {
                type: string;
                enum: string[];
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            priority: {
                $ref: string;
                description: string;
            };
            requester: {
                type: string;
                properties: {
                    user_id: {
                        type: string;
                    };
                    role: {
                        type: string;
                    };
                    department: {
                        type: string;
                    };
                    request_reason: {
                        type: string;
                        maxLength: number;
                    };
                };
                required: string[];
            };
            approval_workflow: {
                type: string;
                properties: {
                    workflow_type: {
                        type: string;
                        enum: string[];
                    };
                    steps: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                step_id: {
                                    $ref: string;
                                };
                                step_order: {
                                    type: string;
                                    minimum: number;
                                };
                                approver: {
                                    type: string;
                                    properties: {
                                        user_id: {
                                            type: string;
                                        };
                                        role: {
                                            type: string;
                                        };
                                        is_required: {
                                            type: string;
                                        };
                                        delegation_allowed: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                                approval_criteria: {
                                    type: string;
                                    items: {
                                        type: string;
                                        properties: {
                                            criterion: {
                                                type: string;
                                            };
                                            required: {
                                                type: string;
                                            };
                                            weight: {
                                                type: string;
                                                minimum: number;
                                                maximum: number;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                                status: {
                                    type: string;
                                    enum: string[];
                                };
                                decision: {
                                    type: string;
                                    properties: {
                                        outcome: {
                                            type: string;
                                            enum: string[];
                                        };
                                        comments: {
                                            type: string;
                                            maxLength: number;
                                        };
                                        conditions: {
                                            type: string;
                                            items: {
                                                type: string;
                                            };
                                        };
                                        timestamp: {
                                            $ref: string;
                                        };
                                        signature: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                                timeout: {
                                    type: string;
                                    properties: {
                                        duration: {
                                            type: string;
                                            minimum: number;
                                        };
                                        unit: {
                                            type: string;
                                            enum: string[];
                                        };
                                        action_on_timeout: {
                                            type: string;
                                            enum: string[];
                                        };
                                    };
                                    required: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    escalation_rules: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                trigger: {
                                    type: string;
                                    enum: string[];
                                };
                                escalate_to: {
                                    type: string;
                                    properties: {
                                        user_id: {
                                            type: string;
                                        };
                                        role: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                                notification_delay: {
                                    type: string;
                                    minimum: number;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            subject: {
                type: string;
                properties: {
                    title: {
                        type: string;
                        maxLength: number;
                    };
                    description: {
                        type: string;
                        maxLength: number;
                    };
                    impact_assessment: {
                        type: string;
                        properties: {
                            scope: {
                                type: string;
                                enum: string[];
                            };
                            affected_systems: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            affected_users: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            business_impact: {
                                type: string;
                                enum: string[];
                            };
                            technical_impact: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                    attachments: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                file_id: {
                                    type: string;
                                };
                                filename: {
                                    type: string;
                                };
                                mime_type: {
                                    type: string;
                                };
                                size: {
                                    type: string;
                                    minimum: number;
                                };
                                description: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            risk_assessment: {
                type: string;
                properties: {
                    overall_risk_level: {
                        type: string;
                        enum: string[];
                    };
                    risk_factors: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                factor: {
                                    type: string;
                                };
                                description: {
                                    type: string;
                                };
                                probability: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                impact: {
                                    type: string;
                                    enum: string[];
                                };
                                mitigation: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_requirements: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                regulation: {
                                    type: string;
                                };
                                requirement: {
                                    type: string;
                                };
                                compliance_status: {
                                    type: string;
                                    enum: string[];
                                };
                                evidence: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            notification_settings: {
                type: string;
                properties: {
                    notify_on_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    notification_channels: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    stakeholders: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                user_id: {
                                    type: string;
                                };
                                role: {
                                    type: string;
                                };
                                notification_preference: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    $ref: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                confirm_operation: {
                                    type: string;
                                };
                                confirm_id: {
                                    $ref: string;
                                };
                                confirmation_type: {
                                    type: string;
                                };
                                confirm_status: {
                                    type: string;
                                };
                                approval_step: {
                                    type: string;
                                };
                                decision_reason: {
                                    type: string;
                                };
                                approver_ids: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                confirm_details: {
                                    type: string;
                                };
                                old_value: {
                                    type: string;
                                };
                                new_value: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            confirm_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            confirm_data_logging: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            approval_metrics_api: {
                                type: string;
                                format: string;
                            };
                            workflow_metrics_api: {
                                type: string;
                                format: string;
                            };
                            compliance_metrics_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    approval_metrics: {
                        type: string;
                        properties: {
                            track_approval_times: {
                                type: string;
                            };
                            track_workflow_performance: {
                                type: string;
                            };
                            track_decision_patterns: {
                                type: string;
                            };
                            track_compliance_metrics: {
                                type: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                required: string[];
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            confirm_processing_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            approval_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            confirm_workflow_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            decision_accuracy_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            confirm_compliance_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_confirmations_count: {
                                type: string;
                                minimum: number;
                            };
                            confirm_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            confirm_memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_approval_complexity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                $ref: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_confirm_processing_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_approval_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_confirm_workflow_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_decision_accuracy_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_confirm_compliance_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    $ref: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                confirm_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_config_change: {
                                type: string;
                            };
                            version_on_workflow_change: {
                                type: string;
                            };
                            version_on_status_change: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    confirm_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_confirm_data: {
                                type: string;
                            };
                            index_performance_metrics: {
                                type: string;
                            };
                            index_audit_logs: {
                                type: string;
                            };
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_confirmations: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            ai_integration_interface: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            decision_support_api: {
                                type: string;
                                format: string;
                            };
                            recommendation_api: {
                                type: string;
                                format: string;
                            };
                            risk_assessment_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    request_format: {
                        type: string;
                        properties: {
                            input_schema: {
                                type: string;
                            };
                            output_schema: {
                                type: string;
                            };
                            authentication: {
                                type: string;
                                properties: {
                                    type: {
                                        type: string;
                                        enum: string[];
                                    };
                                    config: {
                                        type: string;
                                    };
                                };
                            };
                        };
                    };
                    response_handling: {
                        type: string;
                        properties: {
                            timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                            retry_policy: {
                                type: string;
                                properties: {
                                    max_attempts: {
                                        type: string;
                                        minimum: number;
                                    };
                                    backoff_strategy: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                            };
                            fallback_behavior: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
                required: string[];
            };
            decision_support_interface: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    external_decision_engines: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                engine_id: {
                                    type: string;
                                };
                                engine_name: {
                                    type: string;
                                };
                                engine_type: {
                                    type: string;
                                    enum: string[];
                                };
                                endpoint: {
                                    type: string;
                                    format: string;
                                };
                                priority: {
                                    type: string;
                                    minimum: number;
                                };
                                enabled: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    decision_criteria: {
                        type: string;
                        properties: {
                            supported_criteria: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            criteria_weights: {
                                type: string;
                                additionalProperties: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                    };
                    fallback_strategy: {
                        type: string;
                        properties: {
                            when_engines_unavailable: {
                                type: string;
                                enum: string[];
                            };
                            when_engines_disagree: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
                required: string[];
            };
            confirm_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            confirm_details: {
                type: string;
                properties: {
                    approval_level: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    timeout_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    escalation_policy: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    readonly trace: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        properties: {
            protocol_version: {
                $ref: string;
                description: string;
                const: string;
            };
            timestamp: {
                $ref: string;
                description: string;
            };
            trace_id: {
                $ref: string;
                description: string;
            };
            context_id: {
                $ref: string;
                description: string;
            };
            plan_id: {
                $ref: string;
                description: string;
            };
            task_id: {
                $ref: string;
                description: string;
            };
            trace_type: {
                type: string;
                enum: string[];
                description: string;
            };
            severity: {
                type: string;
                enum: string[];
                description: string;
            };
            event: {
                type: string;
                properties: {
                    type: {
                        type: string;
                        enum: string[];
                    };
                    name: {
                        type: string;
                        maxLength: number;
                    };
                    description: {
                        type: string;
                        maxLength: number;
                    };
                    category: {
                        type: string;
                        enum: string[];
                    };
                    source: {
                        type: string;
                        properties: {
                            component: {
                                type: string;
                            };
                            module: {
                                type: string;
                            };
                            function: {
                                type: string;
                            };
                            line_number: {
                                type: string;
                                minimum: number;
                            };
                        };
                        required: string[];
                    };
                    data: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                };
                required: string[];
            };
            context_snapshot: {
                type: string;
                properties: {
                    variables: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                    environment: {
                        type: string;
                        properties: {
                            os: {
                                type: string;
                            };
                            platform: {
                                type: string;
                            };
                            runtime_version: {
                                type: string;
                            };
                            environment_variables: {
                                type: string;
                                additionalProperties: {
                                    type: string;
                                };
                            };
                        };
                    };
                    call_stack: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                function: {
                                    type: string;
                                };
                                file: {
                                    type: string;
                                };
                                line: {
                                    type: string;
                                    minimum: number;
                                };
                                arguments: {
                                    type: string;
                                    additionalProperties: boolean;
                                };
                            };
                            required: string[];
                        };
                    };
                };
            };
            error_information: {
                type: string;
                properties: {
                    error_code: {
                        type: string;
                    };
                    error_message: {
                        type: string;
                        maxLength: number;
                    };
                    error_type: {
                        type: string;
                        enum: string[];
                    };
                    stack_trace: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                file: {
                                    type: string;
                                };
                                function: {
                                    type: string;
                                };
                                line: {
                                    type: string;
                                    minimum: number;
                                };
                                column: {
                                    type: string;
                                    minimum: number;
                                };
                            };
                            required: string[];
                        };
                    };
                    recovery_actions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                action: {
                                    type: string;
                                    enum: string[];
                                };
                                description: {
                                    type: string;
                                };
                                parameters: {
                                    type: string;
                                    additionalProperties: boolean;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            decision_log: {
                type: string;
                properties: {
                    decision_point: {
                        type: string;
                    };
                    options_considered: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                option: {
                                    type: string;
                                };
                                score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                rationale: {
                                    type: string;
                                };
                                risk_factors: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                    selected_option: {
                        type: string;
                    };
                    decision_criteria: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                criterion: {
                                    type: string;
                                };
                                weight: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                evaluation: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    confidence_level: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                };
                required: string[];
            };
            correlations: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        correlation_id: {
                            $ref: string;
                        };
                        type: {
                            type: string;
                            enum: string[];
                        };
                        related_trace_id: {
                            $ref: string;
                        };
                        strength: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        description: {
                            type: string;
                        };
                    };
                    required: string[];
                };
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    $ref: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                trace_operation: {
                                    type: string;
                                };
                                trace_id: {
                                    $ref: string;
                                };
                                trace_type: {
                                    type: string;
                                };
                                severity: {
                                    type: string;
                                };
                                span_ids: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                                trace_status: {
                                    type: string;
                                };
                                trace_details: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            trace_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            trace_data_logging: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            trace_processing_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            span_collection_rate_per_second: {
                                type: string;
                                minimum: number;
                            };
                            trace_analysis_accuracy_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            distributed_tracing_coverage_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            trace_monitoring_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_traces_count: {
                                type: string;
                                minimum: number;
                            };
                            trace_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            trace_storage_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_trace_complexity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                $ref: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_trace_processing_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_span_collection_rate_per_second: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_trace_analysis_accuracy_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_distributed_tracing_coverage_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_trace_monitoring_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            tracing_api: {
                                type: string;
                                format: string;
                            };
                            alerting_api: {
                                type: string;
                                format: string;
                            };
                            dashboard_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    sampling_config: {
                        type: string;
                        properties: {
                            sampling_rate: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            adaptive_sampling: {
                                type: string;
                            };
                            max_traces_per_second: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    $ref: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                trace_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_update: {
                                type: string;
                            };
                            version_on_analysis: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_traces: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            trace_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            trace_details: {
                type: string;
                properties: {
                    trace_level: {
                        type: string;
                        enum: string[];
                    };
                    sampling_rate: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                };
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    readonly role: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
            agent_type: {
                type: string;
                enum: string[];
                description: string;
            };
            agent_status: {
                type: string;
                enum: string[];
                description: string;
            };
            expertise_level: {
                type: string;
                enum: string[];
                description: string;
            };
            communication_style: {
                type: string;
                enum: string[];
                description: string;
            };
            conflict_resolution_strategy: {
                type: string;
                enum: string[];
                description: string;
            };
            agent: {
                type: string;
                description: string;
                properties: {
                    agent_id: {
                        $ref: string;
                    };
                    name: {
                        type: string;
                        minLength: number;
                    };
                    type: {
                        $ref: string;
                    };
                    domain: {
                        type: string;
                        minLength: number;
                    };
                    status: {
                        $ref: string;
                    };
                    capabilities: {
                        $ref: string;
                    };
                    configuration: {
                        $ref: string;
                    };
                    performance_metrics: {
                        $ref: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                    updated_at: {
                        $ref: string;
                    };
                    created_by: {
                        type: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            agent_capabilities: {
                type: string;
                description: string;
                properties: {
                    core: {
                        type: string;
                        properties: {
                            critical_thinking: {
                                type: string;
                            };
                            scenario_validation: {
                                type: string;
                            };
                            ddsc_dialog: {
                                type: string;
                            };
                            mplp_protocols: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                        required: string[];
                    };
                    specialist: {
                        type: string;
                        properties: {
                            domain: {
                                type: string;
                            };
                            expertise_level: {
                                $ref: string;
                            };
                            knowledge_areas: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            tools: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                        required: string[];
                    };
                    collaboration: {
                        type: string;
                        properties: {
                            communication_style: {
                                $ref: string;
                            };
                            conflict_resolution: {
                                $ref: string;
                            };
                            decision_weight: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            trust_level: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                        required: string[];
                    };
                    learning: {
                        type: string;
                        properties: {
                            experience_accumulation: {
                                type: string;
                            };
                            pattern_recognition: {
                                type: string;
                            };
                            adaptation_mechanism: {
                                type: string;
                            };
                            performance_optimization: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            agent_configuration: {
                type: string;
                description: string;
                properties: {
                    basic: {
                        type: string;
                        properties: {
                            max_concurrent_tasks: {
                                type: string;
                                minimum: number;
                            };
                            timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                            retry_policy: {
                                $ref: string;
                            };
                            priority_level: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                    communication: {
                        type: string;
                        properties: {
                            protocols: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            message_format: {
                                type: string;
                            };
                            encryption_enabled: {
                                type: string;
                            };
                            compression_enabled: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                    security: {
                        type: string;
                        properties: {
                            authentication_required: {
                                type: string;
                            };
                            authorization_level: {
                                type: string;
                            };
                            audit_logging: {
                                type: string;
                            };
                            data_encryption: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            performance_metrics: {
                type: string;
                description: string;
                properties: {
                    response_time_ms: {
                        type: string;
                        minimum: number;
                    };
                    throughput_ops_per_sec: {
                        type: string;
                        minimum: number;
                    };
                    success_rate: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    error_rate: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    last_updated: {
                        $ref: string;
                    };
                };
                additionalProperties: boolean;
            };
            retry_policy: {
                type: string;
                description: string;
                properties: {
                    max_retries: {
                        type: string;
                        minimum: number;
                    };
                    backoff_ms: {
                        type: string;
                        minimum: number;
                    };
                    backoff_multiplier: {
                        type: string;
                        minimum: number;
                    };
                    max_backoff_ms: {
                        type: string;
                        minimum: number;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
        };
        properties: {
            protocol_version: {
                $ref: string;
                description: string;
                const: string;
            };
            timestamp: {
                $ref: string;
                description: string;
            };
            role_id: {
                $ref: string;
                description: string;
            };
            context_id: {
                $ref: string;
                description: string;
            };
            name: {
                type: string;
                pattern: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            display_name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            description: {
                type: string;
                maxLength: number;
                description: string;
            };
            role_type: {
                type: string;
                enum: string[];
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            scope: {
                type: string;
                properties: {
                    level: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    context_ids: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    plan_ids: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    resource_constraints: {
                        type: string;
                        properties: {
                            max_contexts: {
                                type: string;
                                minimum: number;
                            };
                            max_plans: {
                                type: string;
                                minimum: number;
                            };
                            allowed_resource_types: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
                description: string;
            };
            permissions: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        permission_id: {
                            $ref: string;
                        };
                        resource_type: {
                            type: string;
                            enum: string[];
                        };
                        resource_id: {
                            oneOf: ({
                                $ref: string;
                                type?: undefined;
                                const?: undefined;
                            } | {
                                type: string;
                                const: string;
                                $ref?: undefined;
                            })[];
                            description: string;
                        };
                        actions: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                            minItems: number;
                        };
                        conditions: {
                            type: string;
                            properties: {
                                time_based: {
                                    type: string;
                                    properties: {
                                        start_time: {
                                            type: string;
                                            format: string;
                                        };
                                        end_time: {
                                            type: string;
                                            format: string;
                                        };
                                        timezone: {
                                            type: string;
                                        };
                                        days_of_week: {
                                            type: string;
                                            items: {
                                                type: string;
                                                minimum: number;
                                                maximum: number;
                                            };
                                        };
                                    };
                                };
                                location_based: {
                                    type: string;
                                    properties: {
                                        allowed_ip_ranges: {
                                            type: string;
                                            items: {
                                                type: string;
                                            };
                                        };
                                        geo_restrictions: {
                                            type: string;
                                            items: {
                                                type: string;
                                            };
                                        };
                                    };
                                };
                                context_based: {
                                    type: string;
                                    properties: {
                                        required_attributes: {
                                            type: string;
                                        };
                                        forbidden_attributes: {
                                            type: string;
                                        };
                                    };
                                };
                                approval_required: {
                                    type: string;
                                    properties: {
                                        for_actions: {
                                            type: string;
                                            items: {
                                                type: string;
                                            };
                                        };
                                        approval_threshold: {
                                            type: string;
                                            minimum: number;
                                        };
                                        approver_roles: {
                                            type: string;
                                            items: {
                                                type: string;
                                            };
                                        };
                                    };
                                };
                            };
                        };
                        grant_type: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        expiry: {
                            $ref: string;
                            description: string;
                        };
                    };
                    required: string[];
                };
            };
            inheritance: {
                type: string;
                properties: {
                    parent_roles: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                role_id: {
                                    $ref: string;
                                };
                                inheritance_type: {
                                    type: string;
                                    enum: string[];
                                };
                                excluded_permissions: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                                conditions: {
                                    type: string;
                                    additionalProperties: boolean;
                                };
                            };
                            required: string[];
                        };
                    };
                    child_roles: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                role_id: {
                                    $ref: string;
                                };
                                delegation_level: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                can_further_delegate: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    inheritance_rules: {
                        type: string;
                        properties: {
                            merge_strategy: {
                                type: string;
                                enum: string[];
                            };
                            conflict_resolution: {
                                type: string;
                                enum: string[];
                            };
                            max_inheritance_depth: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                        required: string[];
                    };
                };
            };
            delegation: {
                type: string;
                properties: {
                    can_delegate: {
                        type: string;
                    };
                    delegatable_permissions: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    delegation_constraints: {
                        type: string;
                        properties: {
                            max_delegation_depth: {
                                type: string;
                                minimum: number;
                            };
                            time_limit: {
                                type: string;
                                minimum: number;
                            };
                            require_approval: {
                                type: string;
                            };
                            revocable: {
                                type: string;
                            };
                        };
                    };
                    active_delegations: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                delegation_id: {
                                    $ref: string;
                                };
                                delegated_to: {
                                    type: string;
                                };
                                permissions: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                                start_time: {
                                    $ref: string;
                                };
                                end_time: {
                                    $ref: string;
                                };
                                status: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            attributes: {
                type: string;
                properties: {
                    security_clearance: {
                        type: string;
                        enum: string[];
                    };
                    department: {
                        type: string;
                    };
                    seniority_level: {
                        type: string;
                        enum: string[];
                    };
                    certification_requirements: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                certification: {
                                    type: string;
                                };
                                level: {
                                    type: string;
                                };
                                expiry: {
                                    $ref: string;
                                };
                                issuer: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    custom_attributes: {
                        type: string;
                        additionalProperties: {
                            oneOf: {
                                type: string;
                            }[];
                        };
                    };
                };
            };
            validation_rules: {
                type: string;
                properties: {
                    assignment_rules: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                rule_id: {
                                    $ref: string;
                                };
                                condition: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                    enum: string[];
                                };
                                message: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    separation_of_duties: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                conflicting_roles: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                                severity: {
                                    type: string;
                                    enum: string[];
                                };
                                exception_approval_required: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
            };
            audit_settings: {
                type: string;
                properties: {
                    audit_enabled: {
                        type: string;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    retention_period: {
                        type: string;
                    };
                    compliance_frameworks: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
                required: string[];
            };
            agents: {
                type: string;
                description: string;
                items: {
                    $ref: string;
                };
            };
            agent_management: {
                type: string;
                description: string;
                properties: {
                    max_agents: {
                        type: string;
                        minimum: number;
                    };
                    auto_scaling: {
                        type: string;
                    };
                    load_balancing: {
                        type: string;
                    };
                    health_check_interval_ms: {
                        type: string;
                        minimum: number;
                    };
                    default_agent_config: {
                        $ref: string;
                    };
                };
            };
            team_configuration: {
                type: string;
                description: string;
                properties: {
                    max_team_size: {
                        type: string;
                        minimum: number;
                    };
                    collaboration_rules: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                rule_name: {
                                    type: string;
                                };
                                rule_type: {
                                    type: string;
                                    enum: string[];
                                };
                                rule_config: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    decision_mechanism: {
                        type: string;
                        properties: {
                            type: {
                                type: string;
                                enum: string[];
                            };
                            threshold: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                        };
                        required: string[];
                    };
                };
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            role_assignment_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            permission_check_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            role_security_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            permission_accuracy_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            role_management_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_roles_count: {
                                type: string;
                                minimum: number;
                            };
                            role_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            role_memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_role_complexity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                $ref: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_role_assignment_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    max_permission_check_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_role_security_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_permission_accuracy_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_role_management_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            role_access_api: {
                                type: string;
                                format: string;
                            };
                            permission_metrics_api: {
                                type: string;
                                format: string;
                            };
                            security_events_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    role_metrics: {
                        type: string;
                        properties: {
                            track_role_usage: {
                                type: string;
                            };
                            track_permission_checks: {
                                type: string;
                            };
                            track_access_patterns: {
                                type: string;
                            };
                            track_security_events: {
                                type: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    $ref: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                role_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_permission_change: {
                                type: string;
                            };
                            version_on_status_change: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_roles: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            role_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            role_details: {
                type: string;
                properties: {
                    role_type: {
                        type: string;
                        enum: string[];
                    };
                    inheritance_mode: {
                        type: string;
                        enum: string[];
                    };
                    permission_model: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    $ref: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                role_operation: {
                                    type: string;
                                };
                                role_id: {
                                    $ref: string;
                                };
                                role_name: {
                                    type: string;
                                };
                                role_type: {
                                    type: string;
                                };
                                permission_ids: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                role_status: {
                                    type: string;
                                };
                                role_details: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            role_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            role_data_logging: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    readonly extension: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        properties: {
            protocol_version: {
                $ref: string;
                description: string;
                const: string;
            };
            timestamp: {
                $ref: string;
                description: string;
            };
            extension_id: {
                $ref: string;
                description: string;
            };
            context_id: {
                $ref: string;
                description: string;
            };
            name: {
                type: string;
                pattern: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            display_name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            description: {
                type: string;
                maxLength: number;
                description: string;
            };
            version: {
                $ref: string;
                description: string;
            };
            extension_type: {
                type: string;
                enum: string[];
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            compatibility: {
                type: string;
                properties: {
                    mplp_version: {
                        type: string;
                        description: string;
                    };
                    required_modules: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                module: {
                                    type: string;
                                    enum: string[];
                                };
                                min_version: {
                                    $ref: string;
                                };
                                max_version: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    dependencies: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                extension_id: {
                                    $ref: string;
                                };
                                name: {
                                    type: string;
                                };
                                version_range: {
                                    type: string;
                                };
                                optional: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    conflicts: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                extension_id: {
                                    $ref: string;
                                };
                                name: {
                                    type: string;
                                };
                                reason: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            configuration: {
                type: string;
                properties: {
                    schema: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                    current_config: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                    default_config: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                    validation_rules: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                rule: {
                                    type: string;
                                };
                                message: {
                                    type: string;
                                };
                                severity: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            extension_points: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        point_id: {
                            $ref: string;
                        };
                        name: {
                            type: string;
                        };
                        type: {
                            type: string;
                            enum: string[];
                        };
                        target_module: {
                            type: string;
                            enum: string[];
                        };
                        event_name: {
                            type: string;
                        };
                        execution_order: {
                            type: string;
                            minimum: number;
                        };
                        enabled: {
                            type: string;
                        };
                        handler: {
                            type: string;
                            properties: {
                                function_name: {
                                    type: string;
                                };
                                parameters: {
                                    type: string;
                                    additionalProperties: boolean;
                                };
                                timeout_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                retry_policy: {
                                    type: string;
                                    properties: {
                                        max_retries: {
                                            type: string;
                                            minimum: number;
                                        };
                                        retry_delay_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                        backoff_strategy: {
                                            type: string;
                                            enum: string[];
                                        };
                                    };
                                };
                            };
                            required: string[];
                        };
                        conditions: {
                            type: string;
                            properties: {
                                when: {
                                    type: string;
                                    description: string;
                                };
                                required_permissions: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                context_filters: {
                                    type: string;
                                    additionalProperties: boolean;
                                };
                            };
                        };
                    };
                    required: string[];
                };
            };
            api_extensions: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        endpoint_id: {
                            $ref: string;
                        };
                        path: {
                            type: string;
                            pattern: string;
                        };
                        method: {
                            type: string;
                            enum: string[];
                        };
                        description: {
                            type: string;
                        };
                        handler: {
                            type: string;
                        };
                        middleware: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        authentication_required: {
                            type: string;
                        };
                        required_permissions: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        rate_limit: {
                            type: string;
                            properties: {
                                requests_per_minute: {
                                    type: string;
                                    minimum: number;
                                };
                                burst_size: {
                                    type: string;
                                    minimum: number;
                                };
                            };
                        };
                        request_schema: {
                            type: string;
                            description: string;
                            additionalProperties: boolean;
                        };
                        response_schema: {
                            type: string;
                            description: string;
                            additionalProperties: boolean;
                        };
                    };
                    required: string[];
                };
            };
            event_subscriptions: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        subscription_id: {
                            $ref: string;
                        };
                        event_pattern: {
                            type: string;
                        };
                        source_module: {
                            type: string;
                            enum: string[];
                        };
                        handler: {
                            type: string;
                        };
                        filter_conditions: {
                            type: string;
                            additionalProperties: boolean;
                        };
                        delivery_guarantees: {
                            type: string;
                            enum: string[];
                        };
                        dead_letter_queue: {
                            type: string;
                        };
                    };
                    required: string[];
                };
            };
            lifecycle: {
                type: string;
                properties: {
                    install_date: {
                        $ref: string;
                    };
                    last_update: {
                        $ref: string;
                    };
                    activation_count: {
                        type: string;
                        minimum: number;
                    };
                    error_count: {
                        type: string;
                        minimum: number;
                    };
                    last_error: {
                        type: string;
                        properties: {
                            timestamp: {
                                $ref: string;
                            };
                            error_type: {
                                type: string;
                            };
                            message: {
                                type: string;
                            };
                            stack_trace: {
                                type: string;
                            };
                        };
                    };
                    performance_metrics: {
                        type: string;
                        properties: {
                            average_execution_time_ms: {
                                type: string;
                                minimum: number;
                            };
                            total_executions: {
                                type: string;
                                minimum: number;
                            };
                            success_rate: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                    health_check: {
                        type: string;
                        properties: {
                            endpoint: {
                                type: string;
                            };
                            interval_seconds: {
                                type: string;
                                minimum: number;
                            };
                            timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                            failure_threshold: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            security: {
                type: string;
                properties: {
                    sandbox_enabled: {
                        type: string;
                    };
                    resource_limits: {
                        type: string;
                        properties: {
                            max_memory_mb: {
                                type: string;
                                minimum: number;
                            };
                            max_cpu_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            max_file_size_mb: {
                                type: string;
                                minimum: number;
                            };
                            network_access: {
                                type: string;
                            };
                            file_system_access: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                    code_signing: {
                        type: string;
                        properties: {
                            required: {
                                type: string;
                            };
                            signature: {
                                type: string;
                            };
                            certificate: {
                                type: string;
                            };
                            timestamp: {
                                $ref: string;
                            };
                        };
                    };
                    permissions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                permission: {
                                    type: string;
                                };
                                justification: {
                                    type: string;
                                };
                                approved: {
                                    type: string;
                                };
                                approved_by: {
                                    type: string;
                                };
                                approval_date: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            metadata: {
                type: string;
                properties: {
                    author: {
                        type: string;
                    };
                    organization: {
                        type: string;
                    };
                    license: {
                        type: string;
                    };
                    homepage: {
                        type: string;
                        format: string;
                    };
                    repository: {
                        type: string;
                        format: string;
                    };
                    documentation: {
                        type: string;
                        format: string;
                    };
                    support_contact: {
                        type: string;
                    };
                    keywords: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    categories: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    screenshots: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                url: {
                                    type: string;
                                    format: string;
                                };
                                caption: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    $ref: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                extension_operation: {
                                    type: string;
                                };
                                extension_id: {
                                    $ref: string;
                                };
                                extension_name: {
                                    type: string;
                                };
                                extension_type: {
                                    type: string;
                                };
                                extension_version: {
                                    type: string;
                                };
                                lifecycle_stage: {
                                    type: string;
                                };
                                extension_status: {
                                    type: string;
                                };
                                extension_details: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            extension_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            extension_data_logging: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            extension_activation_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            extension_lifecycle_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            extension_ecosystem_health_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            extension_compatibility_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            extension_management_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_extensions_count: {
                                type: string;
                                minimum: number;
                            };
                            extension_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            extension_memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_extension_complexity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                $ref: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_extension_activation_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_extension_lifecycle_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_extension_ecosystem_health_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_extension_compatibility_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_extension_management_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            extension_lifecycle_api: {
                                type: string;
                                format: string;
                            };
                            performance_metrics_api: {
                                type: string;
                                format: string;
                            };
                            security_events_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    extension_metrics: {
                        type: string;
                        properties: {
                            track_lifecycle_events: {
                                type: string;
                            };
                            track_performance_impact: {
                                type: string;
                            };
                            track_usage_statistics: {
                                type: string;
                            };
                            track_security_events: {
                                type: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    $ref: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                extension_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_install: {
                                type: string;
                            };
                            version_on_update: {
                                type: string;
                            };
                            version_on_config_change: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_extensions: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            extension_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            extension_details: {
                type: string;
                properties: {
                    extension_type: {
                        type: string;
                        enum: string[];
                    };
                    compatibility_mode: {
                        type: string;
                        enum: string[];
                    };
                    security_level: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    readonly core: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                description: string;
            };
            workflow_stage: {
                type: string;
                enum: string[];
                description: string;
            };
            workflow_status: {
                type: string;
                enum: string[];
                description: string;
            };
            execution_mode: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        properties: {
            protocol_version: {
                $ref: string;
                description: string;
                const: string;
            };
            timestamp: {
                $ref: string;
                description: string;
            };
            workflow_id: {
                $ref: string;
                description: string;
            };
            orchestrator_id: {
                $ref: string;
                description: string;
            };
            workflow_config: {
                type: string;
                description: string;
                properties: {
                    name: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    description: {
                        type: string;
                        maxLength: number;
                        description: string;
                    };
                    stages: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        minItems: number;
                        uniqueItems: boolean;
                        description: string;
                    };
                    execution_mode: {
                        $ref: string;
                        description: string;
                    };
                    timeout_ms: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                    max_concurrent_executions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                    retry_policy: {
                        type: string;
                        properties: {
                            max_attempts: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            delay_ms: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            backoff_factor: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            execution_context: {
                type: string;
                description: string;
                properties: {
                    user_id: {
                        type: string;
                        description: string;
                    };
                    session_id: {
                        $ref: string;
                        description: string;
                    };
                    request_id: {
                        $ref: string;
                        description: string;
                    };
                    priority: {
                        $ref: string;
                        description: string;
                    };
                    metadata: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                    variables: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                };
                additionalProperties: boolean;
            };
            execution_status: {
                type: string;
                description: string;
                properties: {
                    status: {
                        $ref: string;
                        description: string;
                    };
                    current_stage: {
                        $ref: string;
                        description: string;
                    };
                    completed_stages: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    stage_results: {
                        type: string;
                        description: string;
                        additionalProperties: {
                            type: string;
                            properties: {
                                status: {
                                    type: string;
                                    enum: string[];
                                };
                                start_time: {
                                    $ref: string;
                                };
                                end_time: {
                                    $ref: string;
                                };
                                duration_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                result: {
                                    type: string;
                                    description: string;
                                };
                                error: {
                                    type: string;
                                    properties: {
                                        code: {
                                            type: string;
                                        };
                                        message: {
                                            type: string;
                                        };
                                        details: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                    start_time: {
                        $ref: string;
                        description: string;
                    };
                    end_time: {
                        $ref: string;
                        description: string;
                    };
                    duration_ms: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    retry_count: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            module_coordination: {
                type: string;
                description: string;
                properties: {
                    module_adapters: {
                        type: string;
                        description: string;
                        additionalProperties: {
                            type: string;
                            properties: {
                                adapter_type: {
                                    type: string;
                                    description: string;
                                };
                                config: {
                                    type: string;
                                    description: string;
                                    additionalProperties: boolean;
                                };
                                timeout_ms: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                    description: string;
                                };
                                retry_policy: {
                                    type: string;
                                    properties: {
                                        max_attempts: {
                                            type: string;
                                            minimum: number;
                                            maximum: number;
                                        };
                                        delay_ms: {
                                            type: string;
                                            minimum: number;
                                            maximum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                            required: string[];
                            additionalProperties: boolean;
                        };
                    };
                    data_flow: {
                        type: string;
                        description: string;
                        properties: {
                            input_mappings: {
                                type: string;
                                description: string;
                                additionalProperties: {
                                    type: string;
                                    properties: {
                                        source_stage: {
                                            $ref: string;
                                        };
                                        source_field: {
                                            type: string;
                                        };
                                        target_field: {
                                            type: string;
                                        };
                                        transformation: {
                                            type: string;
                                            description: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                            output_mappings: {
                                type: string;
                                description: string;
                                additionalProperties: {
                                    type: string;
                                    properties: {
                                        target_stage: {
                                            $ref: string;
                                        };
                                        source_field: {
                                            type: string;
                                        };
                                        target_field: {
                                            type: string;
                                        };
                                        transformation: {
                                            type: string;
                                            description: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                        additionalProperties: boolean;
                    };
                };
                additionalProperties: boolean;
            };
            event_handling: {
                type: string;
                description: string;
                properties: {
                    event_listeners: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_type: {
                                    type: string;
                                    enum: string[];
                                    description: string;
                                };
                                handler: {
                                    type: string;
                                    description: string;
                                };
                                config: {
                                    type: string;
                                    description: string;
                                    additionalProperties: boolean;
                                };
                            };
                            required: string[];
                            additionalProperties: boolean;
                        };
                        description: string;
                    };
                    event_routing: {
                        type: string;
                        description: string;
                        properties: {
                            default_handler: {
                                type: string;
                                description: string;
                            };
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        condition: {
                                            type: string;
                                            description: string;
                                        };
                                        handler: {
                                            type: string;
                                            description: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                        additionalProperties: boolean;
                    };
                };
                additionalProperties: boolean;
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    $ref: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                system_operation: {
                                    type: string;
                                };
                                workflow_id: {
                                    $ref: string;
                                };
                                orchestrator_id: {
                                    $ref: string;
                                };
                                core_operation: {
                                    type: string;
                                };
                                core_status: {
                                    type: string;
                                };
                                module_ids: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                core_details: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            core_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            core_data_logging: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            system_health_api: {
                                type: string;
                                format: string;
                            };
                            workflow_metrics_api: {
                                type: string;
                                format: string;
                            };
                            resource_metrics_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    system_metrics: {
                        type: string;
                        properties: {
                            track_workflow_execution: {
                                type: string;
                            };
                            track_module_coordination: {
                                type: string;
                            };
                            track_resource_usage: {
                                type: string;
                            };
                            track_system_health: {
                                type: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                required: string[];
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            core_orchestration_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            workflow_coordination_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            system_reliability_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            module_integration_success_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            core_management_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_workflows_count: {
                                type: string;
                                minimum: number;
                            };
                            core_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            core_memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_workflow_complexity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                $ref: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_core_orchestration_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_workflow_coordination_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_system_reliability_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_module_integration_success_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_core_management_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    $ref: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                system_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_config_change: {
                                type: string;
                            };
                            version_on_deployment: {
                                type: string;
                            };
                            version_on_scaling: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    system_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_workflow_data: {
                                type: string;
                            };
                            index_system_metrics: {
                                type: string;
                            };
                            index_audit_logs: {
                                type: string;
                            };
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_workflows: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            core_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            core_details: {
                type: string;
                properties: {
                    orchestration_mode: {
                        type: string;
                        enum: string[];
                    };
                    resource_allocation: {
                        type: string;
                        enum: string[];
                    };
                    fault_tolerance: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    readonly collab: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            entityStatus: {
                type: string;
                enum: string[];
                description: string;
            };
            decision_algorithm: {
                type: string;
                enum: string[];
                description: string;
            };
            voting_mechanism: {
                type: string;
                description: string;
                properties: {
                    anonymity: {
                        type: string;
                        description: string;
                    };
                    transparency: {
                        type: string;
                        description: string;
                    };
                    revision_allowed: {
                        type: string;
                        description: string;
                    };
                    time_limit_ms: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            weighting_strategy: {
                type: string;
                description: string;
                properties: {
                    strategy: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    weights: {
                        type: string;
                        additionalProperties: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            consensus_requirements: {
                type: string;
                description: string;
                properties: {
                    threshold: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                    quorum: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    unanimity_required: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
        };
        properties: {
            collaboration_id: {
                $ref: string;
                description: string;
            };
            protocol_version: {
                type: string;
                const: string;
                description: string;
            };
            timestamp: {
                $ref: string;
                description: string;
            };
            context_id: {
                $ref: string;
                description: string;
            };
            plan_id: {
                $ref: string;
                description: string;
            };
            name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            description: {
                type: string;
                maxLength: number;
                description: string;
            };
            mode: {
                type: string;
                enum: string[];
                description: string;
            };
            participants: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        participant_id: {
                            $ref: string;
                            description: string;
                        };
                        agent_id: {
                            $ref: string;
                            description: string;
                        };
                        role_id: {
                            $ref: string;
                            description: string;
                        };
                        status: {
                            $ref: string;
                            description: string;
                        };
                        capabilities: {
                            type: string;
                            items: {
                                type: string;
                            };
                            maxItems: number;
                            description: string;
                        };
                        priority: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        weight: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        joined_at: {
                            $ref: string;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                minItems: number;
                maxItems: number;
                description: string;
            };
            coordination_strategy: {
                type: string;
                properties: {
                    type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    coordinator_id: {
                        $ref: string;
                        description: string;
                    };
                    decision_making: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
                description: string;
            };
            status: {
                $ref: string;
                description: string;
            };
            created_at: {
                $ref: string;
                description: string;
            };
            updated_at: {
                $ref: string;
                description: string;
            };
            created_by: {
                $ref: string;
                description: string;
            };
            decision_making: {
                type: string;
                description: string;
                properties: {
                    enabled: {
                        type: string;
                        description: string;
                    };
                    algorithm: {
                        $ref: string;
                    };
                    voting: {
                        $ref: string;
                    };
                    weighting: {
                        $ref: string;
                    };
                    consensus: {
                        $ref: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            council_configuration: {
                type: string;
                description: string;
                properties: {
                    council_type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    session_management: {
                        type: string;
                        properties: {
                            max_session_duration_ms: {
                                type: string;
                                minimum: number;
                            };
                            quorum_enforcement: {
                                type: string;
                            };
                            automatic_adjournment: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                    voting_rules: {
                        type: string;
                        properties: {
                            multiple_rounds_allowed: {
                                type: string;
                            };
                            abstention_allowed: {
                                type: string;
                            };
                            delegation_allowed: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                additionalProperties: boolean;
            };
            metadata: {
                type: string;
                additionalProperties: boolean;
                description: string;
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    $ref: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                collaboration_operation: {
                                    type: string;
                                };
                                collab_id: {
                                    $ref: string;
                                };
                                collab_name: {
                                    type: string;
                                };
                                collab_type: {
                                    type: string;
                                };
                                participant_ids: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                collab_status: {
                                    type: string;
                                };
                                participant_id: {
                                    $ref: string;
                                };
                                task_details: {
                                    type: string;
                                };
                                decision_details: {
                                    type: string;
                                };
                                collab_details: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            collab_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            collab_data_logging: {
                                type: string;
                            };
                            decision_logging: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            collaboration_efficiency_api: {
                                type: string;
                                format: string;
                            };
                            team_performance_api: {
                                type: string;
                                format: string;
                            };
                            task_coordination_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    collaboration_metrics: {
                        type: string;
                        properties: {
                            track_collaboration_efficiency: {
                                type: string;
                            };
                            track_team_performance: {
                                type: string;
                            };
                            track_task_coordination: {
                                type: string;
                            };
                            track_decision_quality: {
                                type: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                required: string[];
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            collab_coordination_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            team_collaboration_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            collaboration_quality_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            participant_engagement_satisfaction_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            collab_management_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_collaborations_count: {
                                type: string;
                                minimum: number;
                            };
                            collab_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            collab_memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_collaboration_complexity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                $ref: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_collab_coordination_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_team_collaboration_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_collaboration_quality_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_participant_engagement_satisfaction_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_collab_management_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    $ref: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                collaboration_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_participant_change: {
                                type: string;
                            };
                            version_on_strategy_change: {
                                type: string;
                            };
                            version_on_permission_change: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    collaboration_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_task_data: {
                                type: string;
                            };
                            index_decision_data: {
                                type: string;
                            };
                            index_performance_metrics: {
                                type: string;
                            };
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_collaborations: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            collab_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            collab_details: {
                type: string;
                properties: {
                    collaboration_type: {
                        type: string;
                        enum: string[];
                    };
                    participant_limit: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    coordination_strategy: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            task_assignment_data: {
                type: string;
                properties: {
                    task_id: {
                        $ref: string;
                        description: string;
                    };
                    collaboration_id: {
                        $ref: string;
                        description: string;
                    };
                    assignee_id: {
                        $ref: string;
                        description: string;
                    };
                    task_name: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    task_description: {
                        type: string;
                        maxLength: number;
                        description: string;
                    };
                    task_type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    priority: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    assigned_at: {
                        $ref: string;
                        description: string;
                    };
                    due_date: {
                        $ref: string;
                        description: string;
                    };
                    estimated_duration_ms: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    dependencies: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
                description: string;
            };
            resource_allocation_data: {
                type: string;
                properties: {
                    allocation_id: {
                        $ref: string;
                        description: string;
                    };
                    collaboration_id: {
                        $ref: string;
                        description: string;
                    };
                    resource_type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    resource_name: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                        description: string;
                    };
                    allocated_to: {
                        $ref: string;
                        description: string;
                    };
                    allocation_amount: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    allocation_unit: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    allocation_status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    allocated_at: {
                        $ref: string;
                        description: string;
                    };
                    expires_at: {
                        $ref: string;
                        description: string;
                    };
                    priority: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
                description: string;
            };
            collaboration_effectiveness_analysis: {
                type: string;
                properties: {
                    analysis_id: {
                        $ref: string;
                        description: string;
                    };
                    collaboration_id: {
                        $ref: string;
                        description: string;
                    };
                    effectiveness_score: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                    efficiency_metrics: {
                        type: string;
                        properties: {
                            task_completion_rate: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            average_response_time_ms: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            resource_utilization_rate: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            participant_engagement_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                    quality_metrics: {
                        type: string;
                        properties: {
                            decision_quality_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            communication_effectiveness: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            conflict_resolution_rate: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                    analyzed_at: {
                        $ref: string;
                        description: string;
                    };
                    recommendations: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                recommendation_id: {
                                    $ref: string;
                                };
                                category: {
                                    type: string;
                                    enum: string[];
                                };
                                priority: {
                                    type: string;
                                    enum: string[];
                                };
                                description: {
                                    type: string;
                                    maxLength: number;
                                };
                                expected_impact: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                            required: string[];
                        };
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
                description: string;
            };
            collaboration_pattern_analysis: {
                type: string;
                properties: {
                    analysis_id: {
                        $ref: string;
                        description: string;
                    };
                    time_range: {
                        type: string;
                        properties: {
                            start_time: {
                                $ref: string;
                            };
                            end_time: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                    identified_patterns: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                pattern_id: {
                                    $ref: string;
                                };
                                pattern_type: {
                                    type: string;
                                    enum: string[];
                                };
                                pattern_name: {
                                    type: string;
                                    maxLength: number;
                                };
                                frequency: {
                                    type: string;
                                    minimum: number;
                                    description: string;
                                };
                                confidence_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                    description: string;
                                };
                                impact_assessment: {
                                    type: string;
                                    properties: {
                                        positive_impact: {
                                            type: string;
                                            minimum: number;
                                            maximum: number;
                                        };
                                        negative_impact: {
                                            type: string;
                                            minimum: number;
                                            maximum: number;
                                        };
                                        overall_impact: {
                                            type: string;
                                            minimum: number;
                                            maximum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    trend_analysis: {
                        type: string;
                        properties: {
                            collaboration_frequency_trend: {
                                type: string;
                                enum: string[];
                            };
                            efficiency_trend: {
                                type: string;
                                enum: string[];
                            };
                            participant_engagement_trend: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                    analyzed_at: {
                        $ref: string;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
                description: string;
            };
            governance_check_result: {
                type: string;
                properties: {
                    check_id: {
                        $ref: string;
                        description: string;
                    };
                    collaboration_id: {
                        $ref: string;
                        description: string;
                    };
                    check_type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    check_status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    compliance_score: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                    violations: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                violation_id: {
                                    $ref: string;
                                };
                                violation_type: {
                                    type: string;
                                    enum: string[];
                                };
                                severity: {
                                    type: string;
                                    enum: string[];
                                };
                                description: {
                                    type: string;
                                    maxLength: number;
                                };
                                remediation_required: {
                                    type: string;
                                };
                                remediation_steps: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                    checked_at: {
                        $ref: string;
                        description: string;
                    };
                    next_check_due: {
                        $ref: string;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
    readonly dialog: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            dialog_capabilities: {
                type: string;
                description: string;
                properties: {
                    basic: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                                const: boolean;
                            };
                            message_history: {
                                type: string;
                            };
                            participant_management: {
                                type: string;
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                    };
                    intelligent_control: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            adaptive_rounds: {
                                type: string;
                            };
                            dynamic_strategy: {
                                type: string;
                            };
                            completeness_evaluation: {
                                type: string;
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                    };
                    critical_thinking: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            analysis_depth: {
                                type: string;
                                enum: string[];
                            };
                            question_generation: {
                                type: string;
                            };
                            logic_validation: {
                                type: string;
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                    };
                    knowledge_search: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            real_time_search: {
                                type: string;
                            };
                            knowledge_validation: {
                                type: string;
                            };
                            source_verification: {
                                type: string;
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                    };
                    multimodal: {
                        type: string;
                        description: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            supported_modalities: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            cross_modal_translation: {
                                type: string;
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            dialog_strategy: {
                type: string;
                description: string;
                properties: {
                    type: {
                        type: string;
                        enum: string[];
                    };
                    rounds: {
                        type: string;
                        properties: {
                            min: {
                                type: string;
                                minimum: number;
                            };
                            max: {
                                type: string;
                                minimum: number;
                            };
                            target: {
                                type: string;
                                minimum: number;
                            };
                        };
                        additionalProperties: boolean;
                    };
                    exit_criteria: {
                        type: string;
                        properties: {
                            completeness_threshold: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            user_satisfaction_threshold: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            time_limit: {
                                type: string;
                                minimum: number;
                            };
                        };
                        additionalProperties: boolean;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            dialog_content: {
                type: string;
                description: string;
                properties: {
                    text: {
                        type: string;
                    };
                    multimodal: {
                        type: string;
                        properties: {
                            audio: {
                                type: string;
                            };
                            image: {
                                type: string;
                            };
                            video: {
                                type: string;
                            };
                            file: {
                                type: string;
                            };
                        };
                        additionalProperties: boolean;
                    };
                    type: {
                        type: string;
                        enum: string[];
                    };
                    priority: {
                        type: string;
                        enum: string[];
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
        };
        properties: {
            protocol_version: {
                type: string;
                const: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            dialog_id: {
                $ref: string;
                description: string;
            };
            name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            description: {
                type: string;
                maxLength: number;
                description: string;
            };
            participants: {
                type: string;
                items: {
                    type: string;
                };
                minItems: number;
                maxItems: number;
                description: string;
            };
            capabilities: {
                $ref: string;
                description: string;
            };
            strategy: {
                $ref: string;
                description: string;
            };
            context: {
                type: string;
                description: string;
                properties: {
                    session_id: {
                        type: string;
                    };
                    context_id: {
                        type: string;
                    };
                    knowledge_base: {
                        type: string;
                    };
                    previous_dialogs: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
                additionalProperties: boolean;
            };
            configuration: {
                type: string;
                description: string;
                properties: {
                    timeout: {
                        type: string;
                        minimum: number;
                    };
                    max_participants: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    retry_policy: {
                        type: string;
                        properties: {
                            max_retries: {
                                type: string;
                                minimum: number;
                            };
                            backoff_ms: {
                                type: string;
                                minimum: number;
                            };
                        };
                        additionalProperties: boolean;
                    };
                    security: {
                        type: string;
                        properties: {
                            encryption: {
                                type: string;
                            };
                            authentication: {
                                type: string;
                            };
                            audit_logging: {
                                type: string;
                            };
                        };
                        additionalProperties: boolean;
                    };
                };
                additionalProperties: boolean;
            };
            metadata: {
                type: string;
                additionalProperties: boolean;
                description: string;
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    type: string;
                                    format: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                dialog_operation: {
                                    type: string;
                                };
                                dialog_id: {
                                    $ref: string;
                                };
                                dialog_name: {
                                    type: string;
                                };
                                dialog_type: {
                                    type: string;
                                };
                                participant_ids: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                dialog_status: {
                                    type: string;
                                };
                                content_hash: {
                                    type: string;
                                };
                                dialog_details: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            dialog_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            dialog_data_logging: {
                                type: string;
                            };
                            content_retention_policy: {
                                type: string;
                            };
                            privacy_protection: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            dialog_quality_api: {
                                type: string;
                                format: string;
                            };
                            response_time_api: {
                                type: string;
                                format: string;
                            };
                            satisfaction_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    dialog_metrics: {
                        type: string;
                        properties: {
                            track_response_times: {
                                type: string;
                            };
                            track_dialog_quality: {
                                type: string;
                            };
                            track_user_satisfaction: {
                                type: string;
                            };
                            track_content_moderation: {
                                type: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                required: string[];
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            dialog_response_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            dialog_completion_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            dialog_quality_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            user_experience_satisfaction_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            dialog_interaction_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_dialogs_count: {
                                type: string;
                                minimum: number;
                            };
                            dialog_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            dialog_memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_dialog_complexity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                type: string;
                                format: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_dialog_response_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_dialog_completion_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_dialog_quality_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_user_experience_satisfaction_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_dialog_interaction_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    type: string;
                                    format: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                dialog_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_config_change: {
                                type: string;
                            };
                            version_on_participant_change: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    type: string;
                                    format: string;
                                };
                                last_updated: {
                                    type: string;
                                    format: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    content_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_message_content: {
                                type: string;
                            };
                            privacy_filtering: {
                                type: string;
                            };
                            sensitive_data_masking: {
                                type: string;
                            };
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_dialogs: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            dialog_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            dialog_details: {
                type: string;
                properties: {
                    dialog_type: {
                        type: string;
                        enum: string[];
                    };
                    turn_management: {
                        type: string;
                        enum: string[];
                    };
                    context_retention: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
        examples: ({
            dialog_id: string;
            name: string;
            participants: string[];
            capabilities: {
                basic: {
                    enabled: boolean;
                    message_history: boolean;
                    participant_management: boolean;
                };
                intelligent_control?: undefined;
                critical_thinking?: undefined;
                knowledge_search?: undefined;
            };
            strategy?: undefined;
        } | {
            dialog_id: string;
            name: string;
            participants: string[];
            capabilities: {
                basic: {
                    enabled: boolean;
                    message_history: boolean;
                    participant_management: boolean;
                };
                intelligent_control: {
                    enabled: boolean;
                    adaptive_rounds: boolean;
                    dynamic_strategy: boolean;
                    completeness_evaluation: boolean;
                };
                critical_thinking: {
                    enabled: boolean;
                    analysis_depth: string;
                    question_generation: boolean;
                    logic_validation: boolean;
                };
                knowledge_search: {
                    enabled: boolean;
                    real_time_search: boolean;
                    knowledge_validation: boolean;
                    source_verification: boolean;
                };
            };
            strategy: {
                type: string;
                rounds: {
                    min: number;
                    max: number;
                    target: number;
                };
                exit_criteria: {
                    completeness_threshold: number;
                    user_satisfaction_threshold: number;
                };
            };
        })[];
    };
    readonly network: {
        $schema: string;
        $id: string;
        title: string;
        description: string;
        type: string;
        $defs: {
            uuid: {
                type: string;
                pattern: string;
                description: string;
            };
            timestamp: {
                type: string;
                format: string;
                description: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            entityStatus: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        properties: {
            network_id: {
                $ref: string;
                description: string;
            };
            protocol_version: {
                type: string;
                const: string;
                description: string;
            };
            timestamp: {
                $ref: string;
                description: string;
            };
            context_id: {
                $ref: string;
                description: string;
            };
            name: {
                type: string;
                minLength: number;
                maxLength: number;
                description: string;
            };
            description: {
                type: string;
                maxLength: number;
                description: string;
            };
            topology: {
                type: string;
                enum: string[];
                description: string;
            };
            nodes: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        node_id: {
                            $ref: string;
                            description: string;
                        };
                        agent_id: {
                            $ref: string;
                            description: string;
                        };
                        node_type: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        status: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        capabilities: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                            maxItems: number;
                            description: string;
                        };
                        address: {
                            type: string;
                            properties: {
                                host: {
                                    type: string;
                                    description: string;
                                };
                                port: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                    description: string;
                                };
                                protocol: {
                                    type: string;
                                    enum: string[];
                                    description: string;
                                };
                            };
                            required: string[];
                            additionalProperties: boolean;
                            description: string;
                        };
                        metadata: {
                            type: string;
                            additionalProperties: boolean;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                minItems: number;
                maxItems: number;
                description: string;
            };
            edges: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        edge_id: {
                            $ref: string;
                            description: string;
                        };
                        source_node_id: {
                            $ref: string;
                            description: string;
                        };
                        target_node_id: {
                            $ref: string;
                            description: string;
                        };
                        edge_type: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        direction: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                        status: {
                            $ref: string;
                            description: string;
                        };
                        weight: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        metadata: {
                            type: string;
                            additionalProperties: boolean;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                maxItems: number;
                description: string;
            };
            discovery_mechanism: {
                type: string;
                properties: {
                    type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    registry_config: {
                        type: string;
                        properties: {
                            endpoint: {
                                type: string;
                                format: string;
                                description: string;
                            };
                            authentication: {
                                type: string;
                                default: boolean;
                                description: string;
                            };
                            refresh_interval: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                        };
                        additionalProperties: boolean;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
                description: string;
            };
            routing_strategy: {
                type: string;
                properties: {
                    algorithm: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    load_balancing: {
                        type: string;
                        properties: {
                            method: {
                                type: string;
                                enum: string[];
                                description: string;
                            };
                        };
                        additionalProperties: boolean;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
                description: string;
            };
            status: {
                $ref: string;
                description: string;
            };
            created_at: {
                $ref: string;
                description: string;
            };
            updated_at: {
                $ref: string;
                description: string;
            };
            created_by: {
                $ref: string;
                description: string;
            };
            metadata: {
                type: string;
                additionalProperties: boolean;
                description: string;
            };
            audit_trail: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    retention_days: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    audit_events: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_id: {
                                    $ref: string;
                                };
                                event_type: {
                                    type: string;
                                    enum: string[];
                                };
                                timestamp: {
                                    $ref: string;
                                };
                                user_id: {
                                    type: string;
                                };
                                user_role: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                };
                                resource: {
                                    type: string;
                                };
                                network_operation: {
                                    type: string;
                                };
                                network_id: {
                                    $ref: string;
                                };
                                network_name: {
                                    type: string;
                                };
                                network_type: {
                                    type: string;
                                };
                                node_ids: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                network_status: {
                                    type: string;
                                };
                                node_id: {
                                    $ref: string;
                                };
                                connection_details: {
                                    type: string;
                                };
                                network_details: {
                                    type: string;
                                };
                                ip_address: {
                                    type: string;
                                };
                                user_agent: {
                                    type: string;
                                };
                                session_id: {
                                    type: string;
                                };
                                correlation_id: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    compliance_settings: {
                        type: string;
                        properties: {
                            gdpr_enabled: {
                                type: string;
                            };
                            hipaa_enabled: {
                                type: string;
                            };
                            sox_enabled: {
                                type: string;
                            };
                            network_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            network_data_logging: {
                                type: string;
                            };
                            traffic_logging: {
                                type: string;
                            };
                            custom_compliance: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            monitoring_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    supported_providers: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    integration_endpoints: {
                        type: string;
                        properties: {
                            metrics_api: {
                                type: string;
                                format: string;
                            };
                            network_performance_api: {
                                type: string;
                                format: string;
                            };
                            traffic_analysis_api: {
                                type: string;
                                format: string;
                            };
                            connection_status_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    network_metrics: {
                        type: string;
                        properties: {
                            track_network_performance: {
                                type: string;
                            };
                            track_traffic_flow: {
                                type: string;
                            };
                            track_connection_status: {
                                type: string;
                            };
                            track_security_events: {
                                type: string;
                            };
                        };
                    };
                    export_formats: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                required: string[];
            };
            performance_metrics: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    collection_interval_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    metrics: {
                        type: string;
                        properties: {
                            network_communication_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            network_topology_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            network_reliability_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            connection_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            network_management_efficiency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_connections_count: {
                                type: string;
                                minimum: number;
                            };
                            network_operations_per_second: {
                                type: string;
                                minimum: number;
                            };
                            network_memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            average_network_complexity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    health_status: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            last_check: {
                                $ref: string;
                            };
                            checks: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        check_name: {
                                            type: string;
                                        };
                                        status: {
                                            type: string;
                                            enum: string[];
                                        };
                                        message: {
                                            type: string;
                                        };
                                        duration_ms: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    alerting: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            thresholds: {
                                type: string;
                                properties: {
                                    max_network_communication_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_network_topology_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_network_reliability_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_connection_success_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_network_management_efficiency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            notification_channels: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
            version_history: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    max_versions: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version_id: {
                                    $ref: string;
                                };
                                version_number: {
                                    type: string;
                                    minimum: number;
                                };
                                created_at: {
                                    $ref: string;
                                };
                                created_by: {
                                    type: string;
                                };
                                change_summary: {
                                    type: string;
                                };
                                network_snapshot: {
                                    type: string;
                                };
                                change_type: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    auto_versioning: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            version_on_topology_change: {
                                type: string;
                            };
                            version_on_node_change: {
                                type: string;
                            };
                            version_on_routing_change: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            search_metadata: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    indexing_strategy: {
                        type: string;
                        enum: string[];
                    };
                    searchable_fields: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    search_indexes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                index_id: {
                                    type: string;
                                };
                                index_name: {
                                    type: string;
                                };
                                fields: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                index_type: {
                                    type: string;
                                    enum: string[];
                                };
                                created_at: {
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    network_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_topology_data: {
                                type: string;
                            };
                            index_performance_metrics: {
                                type: string;
                            };
                            index_audit_logs: {
                                type: string;
                            };
                        };
                    };
                    auto_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_new_networks: {
                                type: string;
                            };
                            reindex_interval_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            network_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            network_details: {
                type: string;
                properties: {
                    network_topology: {
                        type: string;
                        enum: string[];
                    };
                    protocol_type: {
                        type: string;
                        enum: string[];
                    };
                    security_mode: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            event_integration: {
                type: string;
                properties: {
                    enabled: {
                        type: string;
                    };
                    event_bus_connection: {
                        type: string;
                        properties: {
                            bus_type: {
                                type: string;
                                enum: string[];
                            };
                            connection_string: {
                                type: string;
                            };
                            topic_prefix: {
                                type: string;
                            };
                            consumer_group: {
                                type: string;
                            };
                        };
                    };
                    published_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    subscribed_events: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    event_routing: {
                        type: string;
                        properties: {
                            routing_rules: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        rule_id: {
                                            type: string;
                                        };
                                        condition: {
                                            type: string;
                                        };
                                        target_topic: {
                                            type: string;
                                        };
                                        enabled: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        required: string[];
        additionalProperties: boolean;
    };
};
export type CoreModuleSchemaName = keyof typeof CoreModulesSchemaMap;
export declare const ProductionReadyModules: readonly ["context", "plan", "confirm"];
export declare const EnterpriseStandardModules: readonly ["trace", "role", "extension", "core"];
export declare const PendingModules: readonly ["collab", "dialog", "network"];
export declare const AllCoreModulesSchemas: ({
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        priority: {
            type: string;
            enum: string[];
            description: string;
        };
    };
    properties: {
        protocol_version: {
            $ref: string;
            description: string;
            const: string;
        };
        timestamp: {
            $ref: string;
            description: string;
        };
        context_id: {
            $ref: string;
            description: string;
        };
        name: {
            type: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        description: {
            type: string;
            maxLength: number;
            description: string;
        };
        status: {
            type: string;
            enum: string[];
            description: string;
        };
        lifecycle_stage: {
            type: string;
            enum: string[];
            description: string;
        };
        shared_state: {
            type: string;
            properties: {
                variables: {
                    type: string;
                    description: string;
                    additionalProperties: boolean;
                };
                resources: {
                    type: string;
                    properties: {
                        allocated: {
                            type: string;
                            additionalProperties: {
                                type: string;
                                properties: {
                                    type: {
                                        type: string;
                                    };
                                    amount: {
                                        type: string;
                                    };
                                    unit: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                                required: string[];
                            };
                        };
                        requirements: {
                            type: string;
                            additionalProperties: {
                                type: string;
                                properties: {
                                    minimum: {
                                        type: string;
                                    };
                                    optimal: {
                                        type: string;
                                    };
                                    maximum: {
                                        type: string;
                                    };
                                    unit: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                    required: string[];
                };
                dependencies: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            id: {
                                $ref: string;
                            };
                            type: {
                                type: string;
                                enum: string[];
                            };
                            name: {
                                type: string;
                            };
                            version: {
                                $ref: string;
                            };
                            status: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                goals: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            id: {
                                $ref: string;
                            };
                            name: {
                                type: string;
                            };
                            description: {
                                type: string;
                            };
                            priority: {
                                $ref: string;
                            };
                            status: {
                                type: string;
                                enum: string[];
                            };
                            success_criteria: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        metric: {
                                            type: string;
                                        };
                                        operator: {
                                            type: string;
                                            enum: string[];
                                        };
                                        value: {
                                            type: string[];
                                        };
                                        unit: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        access_control: {
            type: string;
            properties: {
                owner: {
                    type: string;
                    properties: {
                        user_id: {
                            type: string;
                        };
                        role: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                permissions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            principal: {
                                type: string;
                            };
                            principal_type: {
                                type: string;
                                enum: string[];
                            };
                            resource: {
                                type: string;
                            };
                            actions: {
                                type: string;
                                items: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            conditions: {
                                type: string;
                                additionalProperties: boolean;
                            };
                        };
                        required: string[];
                    };
                };
                policies: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            id: {
                                $ref: string;
                            };
                            name: {
                                type: string;
                            };
                            type: {
                                type: string;
                                enum: string[];
                            };
                            rules: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            enforcement: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        configuration: {
            type: string;
            properties: {
                timeout_settings: {
                    type: string;
                    properties: {
                        default_timeout: {
                            type: string;
                            minimum: number;
                        };
                        max_timeout: {
                            type: string;
                            minimum: number;
                        };
                        cleanup_timeout: {
                            type: string;
                            minimum: number;
                        };
                    };
                    required: string[];
                };
                notification_settings: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                        events: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                    required: string[];
                };
                persistence: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        storage_backend: {
                            type: string;
                            enum: string[];
                        };
                        retention_policy: {
                            type: string;
                            properties: {
                                duration: {
                                    type: string;
                                };
                                max_versions: {
                                    type: string;
                                    minimum: number;
                                };
                            };
                        };
                    };
                    required: string[];
                };
            };
            required: string[];
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                $ref: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            context_operation: {
                                type: string;
                            };
                            context_id: {
                                $ref: string;
                            };
                            context_name: {
                                type: string;
                            };
                            lifecycle_stage: {
                                type: string;
                            };
                            shared_state_keys: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            access_level: {
                                type: string;
                            };
                            context_details: {
                                type: string;
                            };
                            old_value: {
                                type: string;
                            };
                            new_value: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        context_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        context_data_logging: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        context_state_api: {
                            type: string;
                            format: string;
                        };
                        cache_metrics_api: {
                            type: string;
                            format: string;
                        };
                        sync_metrics_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                context_metrics: {
                    type: string;
                    properties: {
                        track_state_changes: {
                            type: string;
                        };
                        track_cache_performance: {
                            type: string;
                        };
                        track_sync_operations: {
                            type: string;
                        };
                        track_access_patterns: {
                            type: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            required: string[];
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        context_access_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        context_update_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        cache_hit_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        context_sync_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        context_state_consistency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_contexts_count: {
                            type: string;
                            minimum: number;
                        };
                        context_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        context_memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_context_size_bytes: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            $ref: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_context_access_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                max_context_update_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_cache_hit_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_context_sync_success_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_context_state_consistency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                $ref: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            context_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_config_change: {
                            type: string;
                        };
                        version_on_state_change: {
                            type: string;
                        };
                        version_on_cache_change: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                context_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_context_data: {
                            type: string;
                        };
                        index_performance_metrics: {
                            type: string;
                        };
                        index_audit_logs: {
                            type: string;
                        };
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_contexts: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        caching_policy: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                cache_strategy: {
                    type: string;
                    enum: string[];
                };
                cache_levels: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            level: {
                                type: string;
                            };
                            backend: {
                                type: string;
                                enum: string[];
                            };
                            ttl_seconds: {
                                type: string;
                                minimum: number;
                            };
                            max_size_mb: {
                                type: string;
                                minimum: number;
                            };
                            eviction_policy: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                cache_warming: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        strategies: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        sync_configuration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                sync_strategy: {
                    type: string;
                    enum: string[];
                };
                sync_targets: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            target_id: {
                                type: string;
                            };
                            target_type: {
                                type: string;
                                enum: string[];
                            };
                            sync_frequency: {
                                type: string;
                            };
                            conflict_resolution: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                replication: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        replication_factor: {
                            type: string;
                            minimum: number;
                        };
                        consistency_level: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
            };
            required: string[];
        };
        error_handling: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                error_policies: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            error_type: {
                                type: string;
                            };
                            severity: {
                                type: string;
                                enum: string[];
                            };
                            action: {
                                type: string;
                                enum: string[];
                            };
                            retry_config: {
                                type: string;
                                properties: {
                                    max_attempts: {
                                        type: string;
                                        minimum: number;
                                    };
                                    backoff_strategy: {
                                        type: string;
                                        enum: string[];
                                    };
                                    base_delay_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                };
                circuit_breaker: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        failure_threshold: {
                            type: string;
                            minimum: number;
                        };
                        timeout_ms: {
                            type: string;
                            minimum: number;
                        };
                        reset_timeout_ms: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
                recovery_strategy: {
                    type: string;
                    properties: {
                        auto_recovery: {
                            type: string;
                        };
                        backup_sources: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        rollback_enabled: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        integration_endpoints: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                webhooks: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            webhook_id: {
                                $ref: string;
                            };
                            url: {
                                type: string;
                                format: string;
                            };
                            events: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            authentication: {
                                type: string;
                                properties: {
                                    type: {
                                        type: string;
                                        enum: string[];
                                    };
                                    credentials: {
                                        type: string;
                                    };
                                };
                            };
                            retry_policy: {
                                type: string;
                                properties: {
                                    max_attempts: {
                                        type: string;
                                    };
                                    backoff_ms: {
                                        type: string;
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                };
                api_endpoints: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            endpoint_id: {
                                type: string;
                            };
                            path: {
                                type: string;
                            };
                            method: {
                                type: string;
                                enum: string[];
                            };
                            authentication_required: {
                                type: string;
                            };
                            rate_limit: {
                                type: string;
                                properties: {
                                    requests_per_minute: {
                                        type: string;
                                    };
                                    burst_limit: {
                                        type: string;
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        context_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        context_details: {
            type: string;
            properties: {
                context_scope: {
                    type: string;
                    enum: string[];
                };
                persistence_level: {
                    type: string;
                    enum: string[];
                };
                sharing_policy: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
    examples: {
        protocol_version: string;
        timestamp: string;
        context_id: string;
        name: string;
        description: string;
        status: string;
        lifecycle_stage: string;
        shared_state: {
            variables: {
                environment: string;
                region: string;
                feature_flags: {
                    new_ui: boolean;
                    beta_features: boolean;
                };
            };
            resources: {
                allocated: {
                    memory: {
                        type: string;
                        amount: number;
                        unit: string;
                        status: string;
                    };
                    cpu: {
                        type: string;
                        amount: number;
                        unit: string;
                        status: string;
                    };
                };
                requirements: {
                    storage: {
                        minimum: number;
                        optimal: number;
                        maximum: number;
                        unit: string;
                    };
                };
            };
            dependencies: {
                id: string;
                type: string;
                name: string;
                version: string;
                status: string;
            }[];
            goals: {
                id: string;
                name: string;
                priority: string;
                status: string;
                success_criteria: {
                    metric: string;
                    operator: string;
                    value: number;
                    unit: string;
                }[];
            }[];
        };
        access_control: {
            owner: {
                user_id: string;
                role: string;
            };
            permissions: {
                principal: string;
                principal_type: string;
                resource: string;
                actions: string[];
            }[];
        };
        configuration: {
            timeout_settings: {
                default_timeout: number;
                max_timeout: number;
            };
            notification_settings: {
                enabled: boolean;
                channels: string[];
                events: string[];
            };
            persistence: {
                enabled: boolean;
                storage_backend: string;
                retention_policy: {
                    duration: string;
                    max_versions: number;
                };
            };
        };
    }[];
} | {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        priority: {
            type: string;
            enum: string[];
            description: string;
        };
        failure_resolver: {
            type: string;
            description: string;
            properties: {
                enabled: {
                    type: string;
                    description: string;
                };
                strategies: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                };
                retry_config: {
                    type: string;
                    description: string;
                    properties: {
                        max_attempts: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        delay_ms: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        backoff_factor: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        max_delay_ms: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                    };
                    required: string[];
                };
                rollback_config: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                            description: string;
                        };
                        checkpoint_frequency: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        max_rollback_depth: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                    };
                    required: string[];
                };
                manual_intervention_config: {
                    type: string;
                    description: string;
                    properties: {
                        timeout_ms: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        escalation_levels: {
                            type: string;
                            items: {
                                type: string;
                            };
                            description: string;
                        };
                        approval_required: {
                            type: string;
                            description: string;
                        };
                    };
                };
                notification_channels: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
                performance_thresholds: {
                    type: string;
                    description: string;
                    properties: {
                        max_execution_time_ms: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        max_memory_usage_mb: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        max_cpu_usage_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                    };
                };
                diagnostic_integration: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                            description: string;
                        };
                        supported_diagnostic_providers: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                            description: string;
                        };
                        diagnostic_endpoints: {
                            type: string;
                            properties: {
                                failure_analysis_api: {
                                    type: string;
                                    format: string;
                                };
                                pattern_detection_api: {
                                    type: string;
                                    format: string;
                                };
                                recommendation_api: {
                                    type: string;
                                    format: string;
                                };
                            };
                        };
                        request_format: {
                            type: string;
                            properties: {
                                input_schema: {
                                    type: string;
                                };
                                output_schema: {
                                    type: string;
                                };
                                timeout_ms: {
                                    type: string;
                                    minimum: number;
                                };
                            };
                        };
                    };
                    required: string[];
                };
                vendor_integration: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                            description: string;
                        };
                        sync_frequency_ms: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        data_retention_days: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        sync_detailed_diagnostics: {
                            type: string;
                            description: string;
                        };
                        receive_suggestions: {
                            type: string;
                            description: string;
                        };
                        auto_apply_suggestions: {
                            type: string;
                            description: string;
                        };
                    };
                };
                proactive_prevention: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                            description: string;
                        };
                        prediction_confidence_threshold: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        auto_prevention_enabled: {
                            type: string;
                            description: string;
                        };
                        prevention_strategies: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                            description: string;
                        };
                        monitoring_interval_ms: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                    };
                    required: string[];
                };
                learning_integration: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                            description: string;
                        };
                        supported_learning_providers: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                            description: string;
                        };
                        learning_endpoints: {
                            type: string;
                            properties: {
                                feedback_collection_api: {
                                    type: string;
                                    format: string;
                                };
                                pattern_learning_api: {
                                    type: string;
                                    format: string;
                                };
                                strategy_optimization_api: {
                                    type: string;
                                    format: string;
                                };
                            };
                        };
                        data_sharing: {
                            type: string;
                            properties: {
                                anonymization_enabled: {
                                    type: string;
                                };
                                data_retention_days: {
                                    type: string;
                                    minimum: number;
                                };
                                sharing_scope: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                    };
                    required: string[];
                };
                external_integrations: {
                    type: string;
                    description: string;
                    properties: {
                        diagnostic_systems: {
                            type: string;
                            description: string;
                        };
                        prediction_services: {
                            type: string;
                            description: string;
                        };
                        recovery_automation: {
                            type: string;
                            description: string;
                        };
                        optimization_engines: {
                            type: string;
                            description: string;
                        };
                        monitoring_platforms: {
                            type: string;
                            description: string;
                        };
                        recommendation_services: {
                            type: string;
                            description: string;
                        };
                    };
                };
            };
            required: string[];
        };
        recovery_suggestion: {
            type: string;
            description: string;
            minLength: number;
            maxLength: number;
        };
        development_issue: {
            type: string;
            description: string;
            properties: {
                id: {
                    type: string;
                    description: string;
                    pattern: string;
                    minLength: number;
                    maxLength: number;
                };
                type: {
                    type: string;
                    description: string;
                    enum: string[];
                };
                severity: {
                    type: string;
                    description: string;
                    enum: string[];
                };
                title: {
                    type: string;
                    description: string;
                    minLength: number;
                    maxLength: number;
                };
                file_path: {
                    type: string;
                    description: string;
                    pattern: string;
                };
                line_number: {
                    type: string;
                    description: string;
                    minimum: number;
                };
                description: {
                    type: string;
                    description: string;
                    maxLength: number;
                };
                suggested_fix: {
                    type: string;
                    description: string;
                    maxLength: number;
                };
                detected_at: {
                    $ref: string;
                    description: string;
                };
                status: {
                    type: string;
                    description: string;
                    enum: string[];
                };
                dependencies: {
                    type: string;
                    description: string;
                    items: {
                        type: string;
                    };
                };
                confidence_score: {
                    type: string;
                    description: string;
                    minimum: number;
                    maximum: number;
                };
            };
            required: string[];
        };
    };
    properties: {
        protocol_version: {
            $ref: string;
            description: string;
            const: string;
        };
        timestamp: {
            $ref: string;
            description: string;
        };
        plan_id: {
            $ref: string;
            description: string;
        };
        context_id: {
            $ref: string;
            description: string;
        };
        name: {
            type: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        description: {
            type: string;
            maxLength: number;
            description: string;
        };
        status: {
            type: string;
            enum: string[];
            description: string;
        };
        priority: {
            $ref: string;
            description: string;
        };
        timeline: {
            type: string;
            properties: {
                start_date: {
                    $ref: string;
                };
                end_date: {
                    $ref: string;
                };
                estimated_duration: {
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            minimum: number;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                        };
                    };
                    required: string[];
                };
                actual_duration: {
                    type: string;
                    properties: {
                        value: {
                            type: string;
                            minimum: number;
                        };
                        unit: {
                            type: string;
                            enum: string[];
                        };
                    };
                    required: string[];
                };
            };
            required: string[];
        };
        tasks: {
            type: string;
            items: {
                type: string;
                properties: {
                    task_id: {
                        $ref: string;
                    };
                    name: {
                        type: string;
                        minLength: number;
                        maxLength: number;
                    };
                    description: {
                        type: string;
                        maxLength: number;
                    };
                    type: {
                        type: string;
                        enum: string[];
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    priority: {
                        $ref: string;
                    };
                    assignee: {
                        type: string;
                        properties: {
                            user_id: {
                                type: string;
                            };
                            role: {
                                type: string;
                            };
                            team: {
                                type: string;
                            };
                        };
                    };
                    estimated_effort: {
                        type: string;
                        properties: {
                            value: {
                                type: string;
                                minimum: number;
                            };
                            unit: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                    actual_effort: {
                        type: string;
                        properties: {
                            value: {
                                type: string;
                                minimum: number;
                            };
                            unit: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                    resources_required: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                resource_type: {
                                    type: string;
                                };
                                amount: {
                                    type: string;
                                    minimum: number;
                                };
                                unit: {
                                    type: string;
                                };
                                availability: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    acceptance_criteria: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                id: {
                                    $ref: string;
                                };
                                description: {
                                    type: string;
                                };
                                type: {
                                    type: string;
                                    enum: string[];
                                };
                                status: {
                                    type: string;
                                    enum: string[];
                                };
                                verification_method: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    sub_tasks: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    metadata: {
                        type: string;
                        properties: {
                            tags: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            category: {
                                type: string;
                            };
                            source: {
                                type: string;
                            };
                            complexity_score: {
                                type: string;
                                minimum: number;
                            };
                            risk_level: {
                                type: string;
                            };
                            automation_level: {
                                type: string;
                            };
                            retry_count: {
                                type: string;
                                minimum: number;
                            };
                            max_retry_count: {
                                type: string;
                                minimum: number;
                            };
                            intervention_required: {
                                type: string;
                            };
                            intervention_reason: {
                                type: string;
                            };
                            intervention_requested_at: {
                                $ref: string;
                            };
                            rollback_reason: {
                                type: string;
                            };
                            rollback_target: {
                                $ref: string;
                            };
                            skip_reason: {
                                type: string;
                            };
                            skip_dependents: {
                                type: string;
                            };
                            recovery_suggestions: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                                description: string;
                                maxItems: number;
                                uniqueItems: boolean;
                            };
                            development_issues: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                                description: string;
                                maxItems: number;
                                uniqueItems: boolean;
                            };
                        };
                    };
                    started_at: {
                        $ref: string;
                    };
                    completed_at: {
                        $ref: string;
                    };
                    progress_percentage: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                    actual_duration_minutes: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    error_message: {
                        type: string;
                        description: string;
                    };
                    result_data: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                };
                required: string[];
            };
        };
        dependencies: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        $ref: string;
                    };
                    source_task_id: {
                        $ref: string;
                    };
                    target_task_id: {
                        $ref: string;
                    };
                    dependency_type: {
                        type: string;
                        enum: string[];
                    };
                    lag: {
                        type: string;
                        properties: {
                            value: {
                                type: string;
                            };
                            unit: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                    criticality: {
                        type: string;
                        enum: string[];
                    };
                    condition: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            };
        };
        milestones: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        $ref: string;
                    };
                    name: {
                        type: string;
                    };
                    description: {
                        type: string;
                    };
                    target_date: {
                        $ref: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                    };
                    success_criteria: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                metric: {
                                    type: string;
                                };
                                target_value: {
                                    type: string[];
                                };
                                actual_value: {
                                    type: string[];
                                };
                                status: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
        };
        optimization: {
            type: string;
            properties: {
                strategy: {
                    type: string;
                    enum: string[];
                };
                constraints: {
                    type: string;
                    properties: {
                        max_duration: {
                            type: string;
                            properties: {
                                value: {
                                    type: string;
                                    minimum: number;
                                };
                                unit: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                        max_cost: {
                            type: string;
                            minimum: number;
                        };
                        min_quality: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        available_resources: {
                            type: string;
                            additionalProperties: boolean;
                        };
                    };
                };
                parameters: {
                    type: string;
                    additionalProperties: boolean;
                };
            };
            required: string[];
        };
        risk_assessment: {
            type: string;
            properties: {
                overall_risk_level: {
                    type: string;
                    enum: string[];
                };
                risks: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            id: {
                                $ref: string;
                            };
                            name: {
                                type: string;
                            };
                            description: {
                                type: string;
                            };
                            level: {
                                type: string;
                                enum: string[];
                            };
                            category: {
                                type: string;
                                enum: string[];
                            };
                            probability: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            impact: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            status: {
                                type: string;
                                enum: string[];
                            };
                            mitigation_plan: {
                                type: string;
                            };
                            contingency_plan: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        failure_resolver: {
            $ref: string;
            description: string;
        };
        configuration: {
            type: string;
            properties: {
                auto_scheduling_enabled: {
                    type: string;
                };
                dependency_validation_enabled: {
                    type: string;
                };
                risk_monitoring_enabled: {
                    type: string;
                };
                failure_recovery_enabled: {
                    type: string;
                };
                performance_tracking_enabled: {
                    type: string;
                };
                notification_settings: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        channels: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        events: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        task_completion: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                optimization_settings: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        strategy: {
                            type: string;
                            enum: string[];
                        };
                        auto_reoptimize: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                timeout_settings: {
                    type: string;
                    properties: {
                        default_task_timeout_ms: {
                            type: string;
                            minimum: number;
                        };
                        plan_execution_timeout_ms: {
                            type: string;
                            minimum: number;
                        };
                        dependency_resolution_timeout_ms: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
                parallel_execution_limit: {
                    type: string;
                    minimum: number;
                };
            };
        };
        metadata: {
            type: string;
            additionalProperties: boolean;
            description: string;
        };
        created_at: {
            $ref: string;
            description: string;
        };
        updated_at: {
            $ref: string;
            description: string;
        };
        created_by: {
            type: string;
            description: string;
        };
        updated_by: {
            type: string;
            description: string;
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                $ref: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            plan_operation: {
                                type: string;
                            };
                            plan_id: {
                                $ref: string;
                            };
                            plan_name: {
                                type: string;
                            };
                            plan_status: {
                                type: string;
                            };
                            task_ids: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                            };
                            execution_stage: {
                                type: string;
                            };
                            plan_details: {
                                type: string;
                            };
                            old_value: {
                                type: string;
                            };
                            new_value: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        plan_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        plan_data_logging: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        plan_execution_api: {
                            type: string;
                            format: string;
                        };
                        task_metrics_api: {
                            type: string;
                            format: string;
                        };
                        resource_metrics_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                plan_metrics: {
                    type: string;
                    properties: {
                        track_execution_progress: {
                            type: string;
                        };
                        track_task_performance: {
                            type: string;
                        };
                        track_resource_usage: {
                            type: string;
                        };
                        track_failure_recovery: {
                            type: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            required: string[];
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        plan_execution_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        task_completion_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        plan_optimization_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        dependency_resolution_accuracy_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        plan_execution_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_plans_count: {
                            type: string;
                            minimum: number;
                        };
                        plan_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        plan_memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_plan_complexity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            $ref: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                    required: string[];
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_plan_execution_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_task_completion_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_plan_optimization_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_dependency_resolution_accuracy_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_plan_execution_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                $ref: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            plan_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_config_change: {
                            type: string;
                        };
                        version_on_task_change: {
                            type: string;
                        };
                        version_on_dependency_change: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                plan_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_plan_data: {
                            type: string;
                        };
                        index_performance_metrics: {
                            type: string;
                        };
                        index_audit_logs: {
                            type: string;
                        };
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_plans: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        caching_policy: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                cache_strategy: {
                    type: string;
                    enum: string[];
                };
                cache_levels: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            level: {
                                type: string;
                            };
                            backend: {
                                type: string;
                                enum: string[];
                            };
                            ttl_seconds: {
                                type: string;
                                minimum: number;
                            };
                            max_size_mb: {
                                type: string;
                                minimum: number;
                            };
                            eviction_policy: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                cache_warming: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        strategies: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        plan_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        plan_details: {
            type: string;
            properties: {
                planning_strategy: {
                    type: string;
                    enum: string[];
                };
                execution_mode: {
                    type: string;
                    enum: string[];
                };
                rollback_support: {
                    type: string;
                };
            };
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
} | {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        priority: {
            type: string;
            enum: string[];
            description: string;
        };
    };
    properties: {
        protocol_version: {
            $ref: string;
            description: string;
            const: string;
        };
        timestamp: {
            $ref: string;
            description: string;
        };
        confirm_id: {
            $ref: string;
            description: string;
        };
        context_id: {
            $ref: string;
            description: string;
        };
        plan_id: {
            $ref: string;
            description: string;
        };
        confirmation_type: {
            type: string;
            enum: string[];
            description: string;
        };
        status: {
            type: string;
            enum: string[];
            description: string;
        };
        priority: {
            $ref: string;
            description: string;
        };
        requester: {
            type: string;
            properties: {
                user_id: {
                    type: string;
                };
                role: {
                    type: string;
                };
                department: {
                    type: string;
                };
                request_reason: {
                    type: string;
                    maxLength: number;
                };
            };
            required: string[];
        };
        approval_workflow: {
            type: string;
            properties: {
                workflow_type: {
                    type: string;
                    enum: string[];
                };
                steps: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            step_id: {
                                $ref: string;
                            };
                            step_order: {
                                type: string;
                                minimum: number;
                            };
                            approver: {
                                type: string;
                                properties: {
                                    user_id: {
                                        type: string;
                                    };
                                    role: {
                                        type: string;
                                    };
                                    is_required: {
                                        type: string;
                                    };
                                    delegation_allowed: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                            approval_criteria: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        criterion: {
                                            type: string;
                                        };
                                        required: {
                                            type: string;
                                        };
                                        weight: {
                                            type: string;
                                            minimum: number;
                                            maximum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                            status: {
                                type: string;
                                enum: string[];
                            };
                            decision: {
                                type: string;
                                properties: {
                                    outcome: {
                                        type: string;
                                        enum: string[];
                                    };
                                    comments: {
                                        type: string;
                                        maxLength: number;
                                    };
                                    conditions: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    timestamp: {
                                        $ref: string;
                                    };
                                    signature: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                            timeout: {
                                type: string;
                                properties: {
                                    duration: {
                                        type: string;
                                        minimum: number;
                                    };
                                    unit: {
                                        type: string;
                                        enum: string[];
                                    };
                                    action_on_timeout: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                                required: string[];
                            };
                        };
                        required: string[];
                    };
                };
                escalation_rules: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            trigger: {
                                type: string;
                                enum: string[];
                            };
                            escalate_to: {
                                type: string;
                                properties: {
                                    user_id: {
                                        type: string;
                                    };
                                    role: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                            notification_delay: {
                                type: string;
                                minimum: number;
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        subject: {
            type: string;
            properties: {
                title: {
                    type: string;
                    maxLength: number;
                };
                description: {
                    type: string;
                    maxLength: number;
                };
                impact_assessment: {
                    type: string;
                    properties: {
                        scope: {
                            type: string;
                            enum: string[];
                        };
                        affected_systems: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        affected_users: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        business_impact: {
                            type: string;
                            enum: string[];
                        };
                        technical_impact: {
                            type: string;
                            enum: string[];
                        };
                    };
                    required: string[];
                };
                attachments: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            file_id: {
                                type: string;
                            };
                            filename: {
                                type: string;
                            };
                            mime_type: {
                                type: string;
                            };
                            size: {
                                type: string;
                                minimum: number;
                            };
                            description: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        risk_assessment: {
            type: string;
            properties: {
                overall_risk_level: {
                    type: string;
                    enum: string[];
                };
                risk_factors: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            factor: {
                                type: string;
                            };
                            description: {
                                type: string;
                            };
                            probability: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            impact: {
                                type: string;
                                enum: string[];
                            };
                            mitigation: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_requirements: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            regulation: {
                                type: string;
                            };
                            requirement: {
                                type: string;
                            };
                            compliance_status: {
                                type: string;
                                enum: string[];
                            };
                            evidence: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        notification_settings: {
            type: string;
            properties: {
                notify_on_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                notification_channels: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                stakeholders: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            user_id: {
                                type: string;
                            };
                            role: {
                                type: string;
                            };
                            notification_preference: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                $ref: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            confirm_operation: {
                                type: string;
                            };
                            confirm_id: {
                                $ref: string;
                            };
                            confirmation_type: {
                                type: string;
                            };
                            confirm_status: {
                                type: string;
                            };
                            approval_step: {
                                type: string;
                            };
                            decision_reason: {
                                type: string;
                            };
                            approver_ids: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            confirm_details: {
                                type: string;
                            };
                            old_value: {
                                type: string;
                            };
                            new_value: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        confirm_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        confirm_data_logging: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        approval_metrics_api: {
                            type: string;
                            format: string;
                        };
                        workflow_metrics_api: {
                            type: string;
                            format: string;
                        };
                        compliance_metrics_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                approval_metrics: {
                    type: string;
                    properties: {
                        track_approval_times: {
                            type: string;
                        };
                        track_workflow_performance: {
                            type: string;
                        };
                        track_decision_patterns: {
                            type: string;
                        };
                        track_compliance_metrics: {
                            type: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            required: string[];
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        confirm_processing_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        approval_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        confirm_workflow_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        decision_accuracy_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        confirm_compliance_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_confirmations_count: {
                            type: string;
                            minimum: number;
                        };
                        confirm_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        confirm_memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_approval_complexity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            $ref: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_confirm_processing_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_approval_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_confirm_workflow_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_decision_accuracy_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_confirm_compliance_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                $ref: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            confirm_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_config_change: {
                            type: string;
                        };
                        version_on_workflow_change: {
                            type: string;
                        };
                        version_on_status_change: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                confirm_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_confirm_data: {
                            type: string;
                        };
                        index_performance_metrics: {
                            type: string;
                        };
                        index_audit_logs: {
                            type: string;
                        };
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_confirmations: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        ai_integration_interface: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        decision_support_api: {
                            type: string;
                            format: string;
                        };
                        recommendation_api: {
                            type: string;
                            format: string;
                        };
                        risk_assessment_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                request_format: {
                    type: string;
                    properties: {
                        input_schema: {
                            type: string;
                        };
                        output_schema: {
                            type: string;
                        };
                        authentication: {
                            type: string;
                            properties: {
                                type: {
                                    type: string;
                                    enum: string[];
                                };
                                config: {
                                    type: string;
                                };
                            };
                        };
                    };
                };
                response_handling: {
                    type: string;
                    properties: {
                        timeout_ms: {
                            type: string;
                            minimum: number;
                        };
                        retry_policy: {
                            type: string;
                            properties: {
                                max_attempts: {
                                    type: string;
                                    minimum: number;
                                };
                                backoff_strategy: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                        };
                        fallback_behavior: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
            };
            required: string[];
        };
        decision_support_interface: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                external_decision_engines: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            engine_id: {
                                type: string;
                            };
                            engine_name: {
                                type: string;
                            };
                            engine_type: {
                                type: string;
                                enum: string[];
                            };
                            endpoint: {
                                type: string;
                                format: string;
                            };
                            priority: {
                                type: string;
                                minimum: number;
                            };
                            enabled: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                decision_criteria: {
                    type: string;
                    properties: {
                        supported_criteria: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                        criteria_weights: {
                            type: string;
                            additionalProperties: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                };
                fallback_strategy: {
                    type: string;
                    properties: {
                        when_engines_unavailable: {
                            type: string;
                            enum: string[];
                        };
                        when_engines_disagree: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
            };
            required: string[];
        };
        confirm_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        confirm_details: {
            type: string;
            properties: {
                approval_level: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                timeout_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                escalation_policy: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
} | {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        priority: {
            type: string;
            enum: string[];
            description: string;
        };
    };
    properties: {
        protocol_version: {
            $ref: string;
            description: string;
            const: string;
        };
        timestamp: {
            $ref: string;
            description: string;
        };
        trace_id: {
            $ref: string;
            description: string;
        };
        context_id: {
            $ref: string;
            description: string;
        };
        plan_id: {
            $ref: string;
            description: string;
        };
        task_id: {
            $ref: string;
            description: string;
        };
        trace_type: {
            type: string;
            enum: string[];
            description: string;
        };
        severity: {
            type: string;
            enum: string[];
            description: string;
        };
        event: {
            type: string;
            properties: {
                type: {
                    type: string;
                    enum: string[];
                };
                name: {
                    type: string;
                    maxLength: number;
                };
                description: {
                    type: string;
                    maxLength: number;
                };
                category: {
                    type: string;
                    enum: string[];
                };
                source: {
                    type: string;
                    properties: {
                        component: {
                            type: string;
                        };
                        module: {
                            type: string;
                        };
                        function: {
                            type: string;
                        };
                        line_number: {
                            type: string;
                            minimum: number;
                        };
                    };
                    required: string[];
                };
                data: {
                    type: string;
                    description: string;
                    additionalProperties: boolean;
                };
            };
            required: string[];
        };
        context_snapshot: {
            type: string;
            properties: {
                variables: {
                    type: string;
                    description: string;
                    additionalProperties: boolean;
                };
                environment: {
                    type: string;
                    properties: {
                        os: {
                            type: string;
                        };
                        platform: {
                            type: string;
                        };
                        runtime_version: {
                            type: string;
                        };
                        environment_variables: {
                            type: string;
                            additionalProperties: {
                                type: string;
                            };
                        };
                    };
                };
                call_stack: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            function: {
                                type: string;
                            };
                            file: {
                                type: string;
                            };
                            line: {
                                type: string;
                                minimum: number;
                            };
                            arguments: {
                                type: string;
                                additionalProperties: boolean;
                            };
                        };
                        required: string[];
                    };
                };
            };
        };
        error_information: {
            type: string;
            properties: {
                error_code: {
                    type: string;
                };
                error_message: {
                    type: string;
                    maxLength: number;
                };
                error_type: {
                    type: string;
                    enum: string[];
                };
                stack_trace: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            file: {
                                type: string;
                            };
                            function: {
                                type: string;
                            };
                            line: {
                                type: string;
                                minimum: number;
                            };
                            column: {
                                type: string;
                                minimum: number;
                            };
                        };
                        required: string[];
                    };
                };
                recovery_actions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            action: {
                                type: string;
                                enum: string[];
                            };
                            description: {
                                type: string;
                            };
                            parameters: {
                                type: string;
                                additionalProperties: boolean;
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        decision_log: {
            type: string;
            properties: {
                decision_point: {
                    type: string;
                };
                options_considered: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            option: {
                                type: string;
                            };
                            score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            rationale: {
                                type: string;
                            };
                            risk_factors: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                        required: string[];
                    };
                };
                selected_option: {
                    type: string;
                };
                decision_criteria: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            criterion: {
                                type: string;
                            };
                            weight: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            evaluation: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                confidence_level: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
            };
            required: string[];
        };
        correlations: {
            type: string;
            items: {
                type: string;
                properties: {
                    correlation_id: {
                        $ref: string;
                    };
                    type: {
                        type: string;
                        enum: string[];
                    };
                    related_trace_id: {
                        $ref: string;
                    };
                    strength: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    description: {
                        type: string;
                    };
                };
                required: string[];
            };
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                $ref: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            trace_operation: {
                                type: string;
                            };
                            trace_id: {
                                $ref: string;
                            };
                            trace_type: {
                                type: string;
                            };
                            severity: {
                                type: string;
                            };
                            span_ids: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                            };
                            trace_status: {
                                type: string;
                            };
                            trace_details: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        trace_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        trace_data_logging: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        trace_processing_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        span_collection_rate_per_second: {
                            type: string;
                            minimum: number;
                        };
                        trace_analysis_accuracy_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        distributed_tracing_coverage_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        trace_monitoring_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_traces_count: {
                            type: string;
                            minimum: number;
                        };
                        trace_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        trace_storage_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_trace_complexity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            $ref: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_trace_processing_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_span_collection_rate_per_second: {
                                    type: string;
                                    minimum: number;
                                };
                                min_trace_analysis_accuracy_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_distributed_tracing_coverage_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_trace_monitoring_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        tracing_api: {
                            type: string;
                            format: string;
                        };
                        alerting_api: {
                            type: string;
                            format: string;
                        };
                        dashboard_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                sampling_config: {
                    type: string;
                    properties: {
                        sampling_rate: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        adaptive_sampling: {
                            type: string;
                        };
                        max_traces_per_second: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                $ref: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            trace_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_update: {
                            type: string;
                        };
                        version_on_analysis: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_traces: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        trace_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        trace_details: {
            type: string;
            properties: {
                trace_level: {
                    type: string;
                    enum: string[];
                };
                sampling_rate: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
            };
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
} | {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        priority: {
            type: string;
            enum: string[];
            description: string;
        };
        agent_type: {
            type: string;
            enum: string[];
            description: string;
        };
        agent_status: {
            type: string;
            enum: string[];
            description: string;
        };
        expertise_level: {
            type: string;
            enum: string[];
            description: string;
        };
        communication_style: {
            type: string;
            enum: string[];
            description: string;
        };
        conflict_resolution_strategy: {
            type: string;
            enum: string[];
            description: string;
        };
        agent: {
            type: string;
            description: string;
            properties: {
                agent_id: {
                    $ref: string;
                };
                name: {
                    type: string;
                    minLength: number;
                };
                type: {
                    $ref: string;
                };
                domain: {
                    type: string;
                    minLength: number;
                };
                status: {
                    $ref: string;
                };
                capabilities: {
                    $ref: string;
                };
                configuration: {
                    $ref: string;
                };
                performance_metrics: {
                    $ref: string;
                };
                created_at: {
                    $ref: string;
                };
                updated_at: {
                    $ref: string;
                };
                created_by: {
                    type: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        agent_capabilities: {
            type: string;
            description: string;
            properties: {
                core: {
                    type: string;
                    properties: {
                        critical_thinking: {
                            type: string;
                        };
                        scenario_validation: {
                            type: string;
                        };
                        ddsc_dialog: {
                            type: string;
                        };
                        mplp_protocols: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                    required: string[];
                };
                specialist: {
                    type: string;
                    properties: {
                        domain: {
                            type: string;
                        };
                        expertise_level: {
                            $ref: string;
                        };
                        knowledge_areas: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        tools: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                    required: string[];
                };
                collaboration: {
                    type: string;
                    properties: {
                        communication_style: {
                            $ref: string;
                        };
                        conflict_resolution: {
                            $ref: string;
                        };
                        decision_weight: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        trust_level: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                    required: string[];
                };
                learning: {
                    type: string;
                    properties: {
                        experience_accumulation: {
                            type: string;
                        };
                        pattern_recognition: {
                            type: string;
                        };
                        adaptation_mechanism: {
                            type: string;
                        };
                        performance_optimization: {
                            type: string;
                        };
                    };
                    required: string[];
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        agent_configuration: {
            type: string;
            description: string;
            properties: {
                basic: {
                    type: string;
                    properties: {
                        max_concurrent_tasks: {
                            type: string;
                            minimum: number;
                        };
                        timeout_ms: {
                            type: string;
                            minimum: number;
                        };
                        retry_policy: {
                            $ref: string;
                        };
                        priority_level: {
                            $ref: string;
                        };
                    };
                    required: string[];
                };
                communication: {
                    type: string;
                    properties: {
                        protocols: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        message_format: {
                            type: string;
                        };
                        encryption_enabled: {
                            type: string;
                        };
                        compression_enabled: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                security: {
                    type: string;
                    properties: {
                        authentication_required: {
                            type: string;
                        };
                        authorization_level: {
                            type: string;
                        };
                        audit_logging: {
                            type: string;
                        };
                        data_encryption: {
                            type: string;
                        };
                    };
                    required: string[];
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        performance_metrics: {
            type: string;
            description: string;
            properties: {
                response_time_ms: {
                    type: string;
                    minimum: number;
                };
                throughput_ops_per_sec: {
                    type: string;
                    minimum: number;
                };
                success_rate: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                error_rate: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                last_updated: {
                    $ref: string;
                };
            };
            additionalProperties: boolean;
        };
        retry_policy: {
            type: string;
            description: string;
            properties: {
                max_retries: {
                    type: string;
                    minimum: number;
                };
                backoff_ms: {
                    type: string;
                    minimum: number;
                };
                backoff_multiplier: {
                    type: string;
                    minimum: number;
                };
                max_backoff_ms: {
                    type: string;
                    minimum: number;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
    };
    properties: {
        protocol_version: {
            $ref: string;
            description: string;
            const: string;
        };
        timestamp: {
            $ref: string;
            description: string;
        };
        role_id: {
            $ref: string;
            description: string;
        };
        context_id: {
            $ref: string;
            description: string;
        };
        name: {
            type: string;
            pattern: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        display_name: {
            type: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        description: {
            type: string;
            maxLength: number;
            description: string;
        };
        role_type: {
            type: string;
            enum: string[];
            description: string;
        };
        status: {
            type: string;
            enum: string[];
            description: string;
        };
        scope: {
            type: string;
            properties: {
                level: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                context_ids: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                plan_ids: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                resource_constraints: {
                    type: string;
                    properties: {
                        max_contexts: {
                            type: string;
                            minimum: number;
                        };
                        max_plans: {
                            type: string;
                            minimum: number;
                        };
                        allowed_resource_types: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
            description: string;
        };
        permissions: {
            type: string;
            items: {
                type: string;
                properties: {
                    permission_id: {
                        $ref: string;
                    };
                    resource_type: {
                        type: string;
                        enum: string[];
                    };
                    resource_id: {
                        oneOf: ({
                            $ref: string;
                            type?: undefined;
                            const?: undefined;
                        } | {
                            type: string;
                            const: string;
                            $ref?: undefined;
                        })[];
                        description: string;
                    };
                    actions: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                        minItems: number;
                    };
                    conditions: {
                        type: string;
                        properties: {
                            time_based: {
                                type: string;
                                properties: {
                                    start_time: {
                                        type: string;
                                        format: string;
                                    };
                                    end_time: {
                                        type: string;
                                        format: string;
                                    };
                                    timezone: {
                                        type: string;
                                    };
                                    days_of_week: {
                                        type: string;
                                        items: {
                                            type: string;
                                            minimum: number;
                                            maximum: number;
                                        };
                                    };
                                };
                            };
                            location_based: {
                                type: string;
                                properties: {
                                    allowed_ip_ranges: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    geo_restrictions: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                            context_based: {
                                type: string;
                                properties: {
                                    required_attributes: {
                                        type: string;
                                    };
                                    forbidden_attributes: {
                                        type: string;
                                    };
                                };
                            };
                            approval_required: {
                                type: string;
                                properties: {
                                    for_actions: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                    approval_threshold: {
                                        type: string;
                                        minimum: number;
                                    };
                                    approver_roles: {
                                        type: string;
                                        items: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    grant_type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    expiry: {
                        $ref: string;
                        description: string;
                    };
                };
                required: string[];
            };
        };
        inheritance: {
            type: string;
            properties: {
                parent_roles: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            role_id: {
                                $ref: string;
                            };
                            inheritance_type: {
                                type: string;
                                enum: string[];
                            };
                            excluded_permissions: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                            };
                            conditions: {
                                type: string;
                                additionalProperties: boolean;
                            };
                        };
                        required: string[];
                    };
                };
                child_roles: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            role_id: {
                                $ref: string;
                            };
                            delegation_level: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            can_further_delegate: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                inheritance_rules: {
                    type: string;
                    properties: {
                        merge_strategy: {
                            type: string;
                            enum: string[];
                        };
                        conflict_resolution: {
                            type: string;
                            enum: string[];
                        };
                        max_inheritance_depth: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                    required: string[];
                };
            };
        };
        delegation: {
            type: string;
            properties: {
                can_delegate: {
                    type: string;
                };
                delegatable_permissions: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                };
                delegation_constraints: {
                    type: string;
                    properties: {
                        max_delegation_depth: {
                            type: string;
                            minimum: number;
                        };
                        time_limit: {
                            type: string;
                            minimum: number;
                        };
                        require_approval: {
                            type: string;
                        };
                        revocable: {
                            type: string;
                        };
                    };
                };
                active_delegations: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            delegation_id: {
                                $ref: string;
                            };
                            delegated_to: {
                                type: string;
                            };
                            permissions: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                            };
                            start_time: {
                                $ref: string;
                            };
                            end_time: {
                                $ref: string;
                            };
                            status: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        attributes: {
            type: string;
            properties: {
                security_clearance: {
                    type: string;
                    enum: string[];
                };
                department: {
                    type: string;
                };
                seniority_level: {
                    type: string;
                    enum: string[];
                };
                certification_requirements: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            certification: {
                                type: string;
                            };
                            level: {
                                type: string;
                            };
                            expiry: {
                                $ref: string;
                            };
                            issuer: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                custom_attributes: {
                    type: string;
                    additionalProperties: {
                        oneOf: {
                            type: string;
                        }[];
                    };
                };
            };
        };
        validation_rules: {
            type: string;
            properties: {
                assignment_rules: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            rule_id: {
                                $ref: string;
                            };
                            condition: {
                                type: string;
                            };
                            action: {
                                type: string;
                                enum: string[];
                            };
                            message: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                separation_of_duties: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            conflicting_roles: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                            };
                            severity: {
                                type: string;
                                enum: string[];
                            };
                            exception_approval_required: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
        };
        audit_settings: {
            type: string;
            properties: {
                audit_enabled: {
                    type: string;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                retention_period: {
                    type: string;
                };
                compliance_frameworks: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
            };
            required: string[];
        };
        agents: {
            type: string;
            description: string;
            items: {
                $ref: string;
            };
        };
        agent_management: {
            type: string;
            description: string;
            properties: {
                max_agents: {
                    type: string;
                    minimum: number;
                };
                auto_scaling: {
                    type: string;
                };
                load_balancing: {
                    type: string;
                };
                health_check_interval_ms: {
                    type: string;
                    minimum: number;
                };
                default_agent_config: {
                    $ref: string;
                };
            };
        };
        team_configuration: {
            type: string;
            description: string;
            properties: {
                max_team_size: {
                    type: string;
                    minimum: number;
                };
                collaboration_rules: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            rule_name: {
                                type: string;
                            };
                            rule_type: {
                                type: string;
                                enum: string[];
                            };
                            rule_config: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                decision_mechanism: {
                    type: string;
                    properties: {
                        type: {
                            type: string;
                            enum: string[];
                        };
                        threshold: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        timeout_ms: {
                            type: string;
                            minimum: number;
                        };
                    };
                    required: string[];
                };
            };
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        role_assignment_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        permission_check_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        role_security_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        permission_accuracy_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        role_management_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_roles_count: {
                            type: string;
                            minimum: number;
                        };
                        role_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        role_memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_role_complexity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            $ref: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_role_assignment_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                max_permission_check_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_role_security_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_permission_accuracy_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_role_management_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        role_access_api: {
                            type: string;
                            format: string;
                        };
                        permission_metrics_api: {
                            type: string;
                            format: string;
                        };
                        security_events_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                role_metrics: {
                    type: string;
                    properties: {
                        track_role_usage: {
                            type: string;
                        };
                        track_permission_checks: {
                            type: string;
                        };
                        track_access_patterns: {
                            type: string;
                        };
                        track_security_events: {
                            type: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                $ref: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            role_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_permission_change: {
                            type: string;
                        };
                        version_on_status_change: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_roles: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        role_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        role_details: {
            type: string;
            properties: {
                role_type: {
                    type: string;
                    enum: string[];
                };
                inheritance_mode: {
                    type: string;
                    enum: string[];
                };
                permission_model: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                $ref: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            role_operation: {
                                type: string;
                            };
                            role_id: {
                                $ref: string;
                            };
                            role_name: {
                                type: string;
                            };
                            role_type: {
                                type: string;
                            };
                            permission_ids: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            role_status: {
                                type: string;
                            };
                            role_details: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        role_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        role_data_logging: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
} | {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        priority: {
            type: string;
            enum: string[];
            description: string;
        };
    };
    properties: {
        protocol_version: {
            $ref: string;
            description: string;
            const: string;
        };
        timestamp: {
            $ref: string;
            description: string;
        };
        extension_id: {
            $ref: string;
            description: string;
        };
        context_id: {
            $ref: string;
            description: string;
        };
        name: {
            type: string;
            pattern: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        display_name: {
            type: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        description: {
            type: string;
            maxLength: number;
            description: string;
        };
        version: {
            $ref: string;
            description: string;
        };
        extension_type: {
            type: string;
            enum: string[];
            description: string;
        };
        status: {
            type: string;
            enum: string[];
            description: string;
        };
        compatibility: {
            type: string;
            properties: {
                mplp_version: {
                    type: string;
                    description: string;
                };
                required_modules: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            module: {
                                type: string;
                                enum: string[];
                            };
                            min_version: {
                                $ref: string;
                            };
                            max_version: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                dependencies: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            extension_id: {
                                $ref: string;
                            };
                            name: {
                                type: string;
                            };
                            version_range: {
                                type: string;
                            };
                            optional: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                conflicts: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            extension_id: {
                                $ref: string;
                            };
                            name: {
                                type: string;
                            };
                            reason: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        configuration: {
            type: string;
            properties: {
                schema: {
                    type: string;
                    description: string;
                    additionalProperties: boolean;
                };
                current_config: {
                    type: string;
                    description: string;
                    additionalProperties: boolean;
                };
                default_config: {
                    type: string;
                    description: string;
                    additionalProperties: boolean;
                };
                validation_rules: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            rule: {
                                type: string;
                            };
                            message: {
                                type: string;
                            };
                            severity: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        extension_points: {
            type: string;
            items: {
                type: string;
                properties: {
                    point_id: {
                        $ref: string;
                    };
                    name: {
                        type: string;
                    };
                    type: {
                        type: string;
                        enum: string[];
                    };
                    target_module: {
                        type: string;
                        enum: string[];
                    };
                    event_name: {
                        type: string;
                    };
                    execution_order: {
                        type: string;
                        minimum: number;
                    };
                    enabled: {
                        type: string;
                    };
                    handler: {
                        type: string;
                        properties: {
                            function_name: {
                                type: string;
                            };
                            parameters: {
                                type: string;
                                additionalProperties: boolean;
                            };
                            timeout_ms: {
                                type: string;
                                minimum: number;
                            };
                            retry_policy: {
                                type: string;
                                properties: {
                                    max_retries: {
                                        type: string;
                                        minimum: number;
                                    };
                                    retry_delay_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    backoff_strategy: {
                                        type: string;
                                        enum: string[];
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                    conditions: {
                        type: string;
                        properties: {
                            when: {
                                type: string;
                                description: string;
                            };
                            required_permissions: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            context_filters: {
                                type: string;
                                additionalProperties: boolean;
                            };
                        };
                    };
                };
                required: string[];
            };
        };
        api_extensions: {
            type: string;
            items: {
                type: string;
                properties: {
                    endpoint_id: {
                        $ref: string;
                    };
                    path: {
                        type: string;
                        pattern: string;
                    };
                    method: {
                        type: string;
                        enum: string[];
                    };
                    description: {
                        type: string;
                    };
                    handler: {
                        type: string;
                    };
                    middleware: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    authentication_required: {
                        type: string;
                    };
                    required_permissions: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    rate_limit: {
                        type: string;
                        properties: {
                            requests_per_minute: {
                                type: string;
                                minimum: number;
                            };
                            burst_size: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                    request_schema: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                    response_schema: {
                        type: string;
                        description: string;
                        additionalProperties: boolean;
                    };
                };
                required: string[];
            };
        };
        event_subscriptions: {
            type: string;
            items: {
                type: string;
                properties: {
                    subscription_id: {
                        $ref: string;
                    };
                    event_pattern: {
                        type: string;
                    };
                    source_module: {
                        type: string;
                        enum: string[];
                    };
                    handler: {
                        type: string;
                    };
                    filter_conditions: {
                        type: string;
                        additionalProperties: boolean;
                    };
                    delivery_guarantees: {
                        type: string;
                        enum: string[];
                    };
                    dead_letter_queue: {
                        type: string;
                    };
                };
                required: string[];
            };
        };
        lifecycle: {
            type: string;
            properties: {
                install_date: {
                    $ref: string;
                };
                last_update: {
                    $ref: string;
                };
                activation_count: {
                    type: string;
                    minimum: number;
                };
                error_count: {
                    type: string;
                    minimum: number;
                };
                last_error: {
                    type: string;
                    properties: {
                        timestamp: {
                            $ref: string;
                        };
                        error_type: {
                            type: string;
                        };
                        message: {
                            type: string;
                        };
                        stack_trace: {
                            type: string;
                        };
                    };
                };
                performance_metrics: {
                    type: string;
                    properties: {
                        average_execution_time_ms: {
                            type: string;
                            minimum: number;
                        };
                        total_executions: {
                            type: string;
                            minimum: number;
                        };
                        success_rate: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
                health_check: {
                    type: string;
                    properties: {
                        endpoint: {
                            type: string;
                        };
                        interval_seconds: {
                            type: string;
                            minimum: number;
                        };
                        timeout_ms: {
                            type: string;
                            minimum: number;
                        };
                        failure_threshold: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        security: {
            type: string;
            properties: {
                sandbox_enabled: {
                    type: string;
                };
                resource_limits: {
                    type: string;
                    properties: {
                        max_memory_mb: {
                            type: string;
                            minimum: number;
                        };
                        max_cpu_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        max_file_size_mb: {
                            type: string;
                            minimum: number;
                        };
                        network_access: {
                            type: string;
                        };
                        file_system_access: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                code_signing: {
                    type: string;
                    properties: {
                        required: {
                            type: string;
                        };
                        signature: {
                            type: string;
                        };
                        certificate: {
                            type: string;
                        };
                        timestamp: {
                            $ref: string;
                        };
                    };
                };
                permissions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            permission: {
                                type: string;
                            };
                            justification: {
                                type: string;
                            };
                            approved: {
                                type: string;
                            };
                            approved_by: {
                                type: string;
                            };
                            approval_date: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        metadata: {
            type: string;
            properties: {
                author: {
                    type: string;
                };
                organization: {
                    type: string;
                };
                license: {
                    type: string;
                };
                homepage: {
                    type: string;
                    format: string;
                };
                repository: {
                    type: string;
                    format: string;
                };
                documentation: {
                    type: string;
                    format: string;
                };
                support_contact: {
                    type: string;
                };
                keywords: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                categories: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                screenshots: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            url: {
                                type: string;
                                format: string;
                            };
                            caption: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                $ref: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            extension_operation: {
                                type: string;
                            };
                            extension_id: {
                                $ref: string;
                            };
                            extension_name: {
                                type: string;
                            };
                            extension_type: {
                                type: string;
                            };
                            extension_version: {
                                type: string;
                            };
                            lifecycle_stage: {
                                type: string;
                            };
                            extension_status: {
                                type: string;
                            };
                            extension_details: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        extension_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        extension_data_logging: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        extension_activation_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        extension_lifecycle_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        extension_ecosystem_health_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        extension_compatibility_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        extension_management_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_extensions_count: {
                            type: string;
                            minimum: number;
                        };
                        extension_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        extension_memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_extension_complexity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            $ref: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_extension_activation_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_extension_lifecycle_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_extension_ecosystem_health_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_extension_compatibility_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_extension_management_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        extension_lifecycle_api: {
                            type: string;
                            format: string;
                        };
                        performance_metrics_api: {
                            type: string;
                            format: string;
                        };
                        security_events_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                extension_metrics: {
                    type: string;
                    properties: {
                        track_lifecycle_events: {
                            type: string;
                        };
                        track_performance_impact: {
                            type: string;
                        };
                        track_usage_statistics: {
                            type: string;
                        };
                        track_security_events: {
                            type: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                $ref: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            extension_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_install: {
                            type: string;
                        };
                        version_on_update: {
                            type: string;
                        };
                        version_on_config_change: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_extensions: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        extension_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        extension_details: {
            type: string;
            properties: {
                extension_type: {
                    type: string;
                    enum: string[];
                };
                compatibility_mode: {
                    type: string;
                    enum: string[];
                };
                security_level: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
} | {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        priority: {
            type: string;
            enum: string[];
            description: string;
        };
        workflow_stage: {
            type: string;
            enum: string[];
            description: string;
        };
        workflow_status: {
            type: string;
            enum: string[];
            description: string;
        };
        execution_mode: {
            type: string;
            enum: string[];
            description: string;
        };
    };
    properties: {
        protocol_version: {
            $ref: string;
            description: string;
            const: string;
        };
        timestamp: {
            $ref: string;
            description: string;
        };
        workflow_id: {
            $ref: string;
            description: string;
        };
        orchestrator_id: {
            $ref: string;
            description: string;
        };
        workflow_config: {
            type: string;
            description: string;
            properties: {
                name: {
                    type: string;
                    minLength: number;
                    maxLength: number;
                    description: string;
                };
                description: {
                    type: string;
                    maxLength: number;
                    description: string;
                };
                stages: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    minItems: number;
                    uniqueItems: boolean;
                    description: string;
                };
                execution_mode: {
                    $ref: string;
                    description: string;
                };
                timeout_ms: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
                max_concurrent_executions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
                retry_policy: {
                    type: string;
                    properties: {
                        max_attempts: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        delay_ms: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        backoff_factor: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        execution_context: {
            type: string;
            description: string;
            properties: {
                user_id: {
                    type: string;
                    description: string;
                };
                session_id: {
                    $ref: string;
                    description: string;
                };
                request_id: {
                    $ref: string;
                    description: string;
                };
                priority: {
                    $ref: string;
                    description: string;
                };
                metadata: {
                    type: string;
                    description: string;
                    additionalProperties: boolean;
                };
                variables: {
                    type: string;
                    description: string;
                    additionalProperties: boolean;
                };
            };
            additionalProperties: boolean;
        };
        execution_status: {
            type: string;
            description: string;
            properties: {
                status: {
                    $ref: string;
                    description: string;
                };
                current_stage: {
                    $ref: string;
                    description: string;
                };
                completed_stages: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                stage_results: {
                    type: string;
                    description: string;
                    additionalProperties: {
                        type: string;
                        properties: {
                            status: {
                                type: string;
                                enum: string[];
                            };
                            start_time: {
                                $ref: string;
                            };
                            end_time: {
                                $ref: string;
                            };
                            duration_ms: {
                                type: string;
                                minimum: number;
                            };
                            result: {
                                type: string;
                                description: string;
                            };
                            error: {
                                type: string;
                                properties: {
                                    code: {
                                        type: string;
                                    };
                                    message: {
                                        type: string;
                                    };
                                    details: {
                                        type: string;
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                };
                start_time: {
                    $ref: string;
                    description: string;
                };
                end_time: {
                    $ref: string;
                    description: string;
                };
                duration_ms: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                retry_count: {
                    type: string;
                    minimum: number;
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        module_coordination: {
            type: string;
            description: string;
            properties: {
                module_adapters: {
                    type: string;
                    description: string;
                    additionalProperties: {
                        type: string;
                        properties: {
                            adapter_type: {
                                type: string;
                                description: string;
                            };
                            config: {
                                type: string;
                                description: string;
                                additionalProperties: boolean;
                            };
                            timeout_ms: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            retry_policy: {
                                type: string;
                                properties: {
                                    max_attempts: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    delay_ms: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                    };
                };
                data_flow: {
                    type: string;
                    description: string;
                    properties: {
                        input_mappings: {
                            type: string;
                            description: string;
                            additionalProperties: {
                                type: string;
                                properties: {
                                    source_stage: {
                                        $ref: string;
                                    };
                                    source_field: {
                                        type: string;
                                    };
                                    target_field: {
                                        type: string;
                                    };
                                    transformation: {
                                        type: string;
                                        description: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                        output_mappings: {
                            type: string;
                            description: string;
                            additionalProperties: {
                                type: string;
                                properties: {
                                    target_stage: {
                                        $ref: string;
                                    };
                                    source_field: {
                                        type: string;
                                    };
                                    target_field: {
                                        type: string;
                                    };
                                    transformation: {
                                        type: string;
                                        description: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                    additionalProperties: boolean;
                };
            };
            additionalProperties: boolean;
        };
        event_handling: {
            type: string;
            description: string;
            properties: {
                event_listeners: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_type: {
                                type: string;
                                enum: string[];
                                description: string;
                            };
                            handler: {
                                type: string;
                                description: string;
                            };
                            config: {
                                type: string;
                                description: string;
                                additionalProperties: boolean;
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                    };
                    description: string;
                };
                event_routing: {
                    type: string;
                    description: string;
                    properties: {
                        default_handler: {
                            type: string;
                            description: string;
                        };
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    condition: {
                                        type: string;
                                        description: string;
                                    };
                                    handler: {
                                        type: string;
                                        description: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                    additionalProperties: boolean;
                };
            };
            additionalProperties: boolean;
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                $ref: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            system_operation: {
                                type: string;
                            };
                            workflow_id: {
                                $ref: string;
                            };
                            orchestrator_id: {
                                $ref: string;
                            };
                            core_operation: {
                                type: string;
                            };
                            core_status: {
                                type: string;
                            };
                            module_ids: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            core_details: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        core_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        core_data_logging: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        system_health_api: {
                            type: string;
                            format: string;
                        };
                        workflow_metrics_api: {
                            type: string;
                            format: string;
                        };
                        resource_metrics_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                system_metrics: {
                    type: string;
                    properties: {
                        track_workflow_execution: {
                            type: string;
                        };
                        track_module_coordination: {
                            type: string;
                        };
                        track_resource_usage: {
                            type: string;
                        };
                        track_system_health: {
                            type: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            required: string[];
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        core_orchestration_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        workflow_coordination_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        system_reliability_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        module_integration_success_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        core_management_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_workflows_count: {
                            type: string;
                            minimum: number;
                        };
                        core_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        core_memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_workflow_complexity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            $ref: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_core_orchestration_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_workflow_coordination_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_system_reliability_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_module_integration_success_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_core_management_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                $ref: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            system_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_config_change: {
                            type: string;
                        };
                        version_on_deployment: {
                            type: string;
                        };
                        version_on_scaling: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                system_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_workflow_data: {
                            type: string;
                        };
                        index_system_metrics: {
                            type: string;
                        };
                        index_audit_logs: {
                            type: string;
                        };
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_workflows: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        core_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        core_details: {
            type: string;
            properties: {
                orchestration_mode: {
                    type: string;
                    enum: string[];
                };
                resource_allocation: {
                    type: string;
                    enum: string[];
                };
                fault_tolerance: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
} | {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        entityStatus: {
            type: string;
            enum: string[];
            description: string;
        };
        decision_algorithm: {
            type: string;
            enum: string[];
            description: string;
        };
        voting_mechanism: {
            type: string;
            description: string;
            properties: {
                anonymity: {
                    type: string;
                    description: string;
                };
                transparency: {
                    type: string;
                    description: string;
                };
                revision_allowed: {
                    type: string;
                    description: string;
                };
                time_limit_ms: {
                    type: string;
                    minimum: number;
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        weighting_strategy: {
            type: string;
            description: string;
            properties: {
                strategy: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                weights: {
                    type: string;
                    additionalProperties: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        consensus_requirements: {
            type: string;
            description: string;
            properties: {
                threshold: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
                quorum: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                unanimity_required: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
    };
    properties: {
        collaboration_id: {
            $ref: string;
            description: string;
        };
        protocol_version: {
            type: string;
            const: string;
            description: string;
        };
        timestamp: {
            $ref: string;
            description: string;
        };
        context_id: {
            $ref: string;
            description: string;
        };
        plan_id: {
            $ref: string;
            description: string;
        };
        name: {
            type: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        description: {
            type: string;
            maxLength: number;
            description: string;
        };
        mode: {
            type: string;
            enum: string[];
            description: string;
        };
        participants: {
            type: string;
            items: {
                type: string;
                properties: {
                    participant_id: {
                        $ref: string;
                        description: string;
                    };
                    agent_id: {
                        $ref: string;
                        description: string;
                    };
                    role_id: {
                        $ref: string;
                        description: string;
                    };
                    status: {
                        $ref: string;
                        description: string;
                    };
                    capabilities: {
                        type: string;
                        items: {
                            type: string;
                        };
                        maxItems: number;
                        description: string;
                    };
                    priority: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                    weight: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                    joined_at: {
                        $ref: string;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            minItems: number;
            maxItems: number;
            description: string;
        };
        coordination_strategy: {
            type: string;
            properties: {
                type: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                coordinator_id: {
                    $ref: string;
                    description: string;
                };
                decision_making: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
            description: string;
        };
        status: {
            $ref: string;
            description: string;
        };
        created_at: {
            $ref: string;
            description: string;
        };
        updated_at: {
            $ref: string;
            description: string;
        };
        created_by: {
            $ref: string;
            description: string;
        };
        decision_making: {
            type: string;
            description: string;
            properties: {
                enabled: {
                    type: string;
                    description: string;
                };
                algorithm: {
                    $ref: string;
                };
                voting: {
                    $ref: string;
                };
                weighting: {
                    $ref: string;
                };
                consensus: {
                    $ref: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        council_configuration: {
            type: string;
            description: string;
            properties: {
                council_type: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                session_management: {
                    type: string;
                    properties: {
                        max_session_duration_ms: {
                            type: string;
                            minimum: number;
                        };
                        quorum_enforcement: {
                            type: string;
                        };
                        automatic_adjournment: {
                            type: string;
                        };
                    };
                    required: string[];
                };
                voting_rules: {
                    type: string;
                    properties: {
                        multiple_rounds_allowed: {
                            type: string;
                        };
                        abstention_allowed: {
                            type: string;
                        };
                        delegation_allowed: {
                            type: string;
                        };
                    };
                    required: string[];
                };
            };
            additionalProperties: boolean;
        };
        metadata: {
            type: string;
            additionalProperties: boolean;
            description: string;
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                $ref: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            collaboration_operation: {
                                type: string;
                            };
                            collab_id: {
                                $ref: string;
                            };
                            collab_name: {
                                type: string;
                            };
                            collab_type: {
                                type: string;
                            };
                            participant_ids: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            collab_status: {
                                type: string;
                            };
                            participant_id: {
                                $ref: string;
                            };
                            task_details: {
                                type: string;
                            };
                            decision_details: {
                                type: string;
                            };
                            collab_details: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        collab_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        collab_data_logging: {
                            type: string;
                        };
                        decision_logging: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        collaboration_efficiency_api: {
                            type: string;
                            format: string;
                        };
                        team_performance_api: {
                            type: string;
                            format: string;
                        };
                        task_coordination_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                collaboration_metrics: {
                    type: string;
                    properties: {
                        track_collaboration_efficiency: {
                            type: string;
                        };
                        track_team_performance: {
                            type: string;
                        };
                        track_task_coordination: {
                            type: string;
                        };
                        track_decision_quality: {
                            type: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            required: string[];
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        collab_coordination_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        team_collaboration_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        collaboration_quality_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        participant_engagement_satisfaction_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        collab_management_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_collaborations_count: {
                            type: string;
                            minimum: number;
                        };
                        collab_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        collab_memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_collaboration_complexity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            $ref: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_collab_coordination_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_team_collaboration_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_collaboration_quality_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_participant_engagement_satisfaction_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_collab_management_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                $ref: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            collaboration_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_participant_change: {
                            type: string;
                        };
                        version_on_strategy_change: {
                            type: string;
                        };
                        version_on_permission_change: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                collaboration_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_task_data: {
                            type: string;
                        };
                        index_decision_data: {
                            type: string;
                        };
                        index_performance_metrics: {
                            type: string;
                        };
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_collaborations: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        collab_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        collab_details: {
            type: string;
            properties: {
                collaboration_type: {
                    type: string;
                    enum: string[];
                };
                participant_limit: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                coordination_strategy: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        task_assignment_data: {
            type: string;
            properties: {
                task_id: {
                    $ref: string;
                    description: string;
                };
                collaboration_id: {
                    $ref: string;
                    description: string;
                };
                assignee_id: {
                    $ref: string;
                    description: string;
                };
                task_name: {
                    type: string;
                    minLength: number;
                    maxLength: number;
                    description: string;
                };
                task_description: {
                    type: string;
                    maxLength: number;
                    description: string;
                };
                task_type: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                priority: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                status: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                assigned_at: {
                    $ref: string;
                    description: string;
                };
                due_date: {
                    $ref: string;
                    description: string;
                };
                estimated_duration_ms: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                dependencies: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
            description: string;
        };
        resource_allocation_data: {
            type: string;
            properties: {
                allocation_id: {
                    $ref: string;
                    description: string;
                };
                collaboration_id: {
                    $ref: string;
                    description: string;
                };
                resource_type: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                resource_name: {
                    type: string;
                    minLength: number;
                    maxLength: number;
                    description: string;
                };
                allocated_to: {
                    $ref: string;
                    description: string;
                };
                allocation_amount: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                allocation_unit: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                allocation_status: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                allocated_at: {
                    $ref: string;
                    description: string;
                };
                expires_at: {
                    $ref: string;
                    description: string;
                };
                priority: {
                    type: string;
                    enum: string[];
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
            description: string;
        };
        collaboration_effectiveness_analysis: {
            type: string;
            properties: {
                analysis_id: {
                    $ref: string;
                    description: string;
                };
                collaboration_id: {
                    $ref: string;
                    description: string;
                };
                effectiveness_score: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
                efficiency_metrics: {
                    type: string;
                    properties: {
                        task_completion_rate: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        average_response_time_ms: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        resource_utilization_rate: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        participant_engagement_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                    };
                    required: string[];
                };
                quality_metrics: {
                    type: string;
                    properties: {
                        decision_quality_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        communication_effectiveness: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                        conflict_resolution_rate: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            description: string;
                        };
                    };
                    required: string[];
                };
                analyzed_at: {
                    $ref: string;
                    description: string;
                };
                recommendations: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            recommendation_id: {
                                $ref: string;
                            };
                            category: {
                                type: string;
                                enum: string[];
                            };
                            priority: {
                                type: string;
                                enum: string[];
                            };
                            description: {
                                type: string;
                                maxLength: number;
                            };
                            expected_impact: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                        required: string[];
                    };
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
            description: string;
        };
        collaboration_pattern_analysis: {
            type: string;
            properties: {
                analysis_id: {
                    $ref: string;
                    description: string;
                };
                time_range: {
                    type: string;
                    properties: {
                        start_time: {
                            $ref: string;
                        };
                        end_time: {
                            $ref: string;
                        };
                    };
                    required: string[];
                };
                identified_patterns: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            pattern_id: {
                                $ref: string;
                            };
                            pattern_type: {
                                type: string;
                                enum: string[];
                            };
                            pattern_name: {
                                type: string;
                                maxLength: number;
                            };
                            frequency: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            confidence_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            impact_assessment: {
                                type: string;
                                properties: {
                                    positive_impact: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    negative_impact: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    overall_impact: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                        required: string[];
                    };
                };
                trend_analysis: {
                    type: string;
                    properties: {
                        collaboration_frequency_trend: {
                            type: string;
                            enum: string[];
                        };
                        efficiency_trend: {
                            type: string;
                            enum: string[];
                        };
                        participant_engagement_trend: {
                            type: string;
                            enum: string[];
                        };
                    };
                    required: string[];
                };
                analyzed_at: {
                    $ref: string;
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
            description: string;
        };
        governance_check_result: {
            type: string;
            properties: {
                check_id: {
                    $ref: string;
                    description: string;
                };
                collaboration_id: {
                    $ref: string;
                    description: string;
                };
                check_type: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                check_status: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                compliance_score: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    description: string;
                };
                violations: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            violation_id: {
                                $ref: string;
                            };
                            violation_type: {
                                type: string;
                                enum: string[];
                            };
                            severity: {
                                type: string;
                                enum: string[];
                            };
                            description: {
                                type: string;
                                maxLength: number;
                            };
                            remediation_required: {
                                type: string;
                            };
                            remediation_steps: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                        required: string[];
                    };
                };
                checked_at: {
                    $ref: string;
                    description: string;
                };
                next_check_due: {
                    $ref: string;
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
} | {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        dialog_capabilities: {
            type: string;
            description: string;
            properties: {
                basic: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                            const: boolean;
                        };
                        message_history: {
                            type: string;
                        };
                        participant_management: {
                            type: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                intelligent_control: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        adaptive_rounds: {
                            type: string;
                        };
                        dynamic_strategy: {
                            type: string;
                        };
                        completeness_evaluation: {
                            type: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                critical_thinking: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        analysis_depth: {
                            type: string;
                            enum: string[];
                        };
                        question_generation: {
                            type: string;
                        };
                        logic_validation: {
                            type: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                knowledge_search: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        real_time_search: {
                            type: string;
                        };
                        knowledge_validation: {
                            type: string;
                        };
                        source_verification: {
                            type: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
                multimodal: {
                    type: string;
                    description: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        supported_modalities: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                        cross_modal_translation: {
                            type: string;
                        };
                    };
                    required: string[];
                    additionalProperties: boolean;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        dialog_strategy: {
            type: string;
            description: string;
            properties: {
                type: {
                    type: string;
                    enum: string[];
                };
                rounds: {
                    type: string;
                    properties: {
                        min: {
                            type: string;
                            minimum: number;
                        };
                        max: {
                            type: string;
                            minimum: number;
                        };
                        target: {
                            type: string;
                            minimum: number;
                        };
                    };
                    additionalProperties: boolean;
                };
                exit_criteria: {
                    type: string;
                    properties: {
                        completeness_threshold: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        user_satisfaction_threshold: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        time_limit: {
                            type: string;
                            minimum: number;
                        };
                    };
                    additionalProperties: boolean;
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
        dialog_content: {
            type: string;
            description: string;
            properties: {
                text: {
                    type: string;
                };
                multimodal: {
                    type: string;
                    properties: {
                        audio: {
                            type: string;
                        };
                        image: {
                            type: string;
                        };
                        video: {
                            type: string;
                        };
                        file: {
                            type: string;
                        };
                    };
                    additionalProperties: boolean;
                };
                type: {
                    type: string;
                    enum: string[];
                };
                priority: {
                    type: string;
                    enum: string[];
                };
            };
            required: string[];
            additionalProperties: boolean;
        };
    };
    properties: {
        protocol_version: {
            type: string;
            const: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        dialog_id: {
            $ref: string;
            description: string;
        };
        name: {
            type: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        description: {
            type: string;
            maxLength: number;
            description: string;
        };
        participants: {
            type: string;
            items: {
                type: string;
            };
            minItems: number;
            maxItems: number;
            description: string;
        };
        capabilities: {
            $ref: string;
            description: string;
        };
        strategy: {
            $ref: string;
            description: string;
        };
        context: {
            type: string;
            description: string;
            properties: {
                session_id: {
                    type: string;
                };
                context_id: {
                    type: string;
                };
                knowledge_base: {
                    type: string;
                };
                previous_dialogs: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
            };
            additionalProperties: boolean;
        };
        configuration: {
            type: string;
            description: string;
            properties: {
                timeout: {
                    type: string;
                    minimum: number;
                };
                max_participants: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                retry_policy: {
                    type: string;
                    properties: {
                        max_retries: {
                            type: string;
                            minimum: number;
                        };
                        backoff_ms: {
                            type: string;
                            minimum: number;
                        };
                    };
                    additionalProperties: boolean;
                };
                security: {
                    type: string;
                    properties: {
                        encryption: {
                            type: string;
                        };
                        authentication: {
                            type: string;
                        };
                        audit_logging: {
                            type: string;
                        };
                    };
                    additionalProperties: boolean;
                };
            };
            additionalProperties: boolean;
        };
        metadata: {
            type: string;
            additionalProperties: boolean;
            description: string;
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                type: string;
                                format: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            dialog_operation: {
                                type: string;
                            };
                            dialog_id: {
                                $ref: string;
                            };
                            dialog_name: {
                                type: string;
                            };
                            dialog_type: {
                                type: string;
                            };
                            participant_ids: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            dialog_status: {
                                type: string;
                            };
                            content_hash: {
                                type: string;
                            };
                            dialog_details: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        dialog_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        dialog_data_logging: {
                            type: string;
                        };
                        content_retention_policy: {
                            type: string;
                        };
                        privacy_protection: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        dialog_quality_api: {
                            type: string;
                            format: string;
                        };
                        response_time_api: {
                            type: string;
                            format: string;
                        };
                        satisfaction_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                dialog_metrics: {
                    type: string;
                    properties: {
                        track_response_times: {
                            type: string;
                        };
                        track_dialog_quality: {
                            type: string;
                        };
                        track_user_satisfaction: {
                            type: string;
                        };
                        track_content_moderation: {
                            type: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            required: string[];
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        dialog_response_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        dialog_completion_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        dialog_quality_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        user_experience_satisfaction_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        dialog_interaction_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_dialogs_count: {
                            type: string;
                            minimum: number;
                        };
                        dialog_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        dialog_memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_dialog_complexity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            type: string;
                            format: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_dialog_response_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_dialog_completion_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_dialog_quality_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_user_experience_satisfaction_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_dialog_interaction_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                type: string;
                                format: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            dialog_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_config_change: {
                            type: string;
                        };
                        version_on_participant_change: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                type: string;
                                format: string;
                            };
                            last_updated: {
                                type: string;
                                format: string;
                            };
                        };
                        required: string[];
                    };
                };
                content_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_message_content: {
                            type: string;
                        };
                        privacy_filtering: {
                            type: string;
                        };
                        sensitive_data_masking: {
                            type: string;
                        };
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_dialogs: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        dialog_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        dialog_details: {
            type: string;
            properties: {
                dialog_type: {
                    type: string;
                    enum: string[];
                };
                turn_management: {
                    type: string;
                    enum: string[];
                };
                context_retention: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
    examples: ({
        dialog_id: string;
        name: string;
        participants: string[];
        capabilities: {
            basic: {
                enabled: boolean;
                message_history: boolean;
                participant_management: boolean;
            };
            intelligent_control?: undefined;
            critical_thinking?: undefined;
            knowledge_search?: undefined;
        };
        strategy?: undefined;
    } | {
        dialog_id: string;
        name: string;
        participants: string[];
        capabilities: {
            basic: {
                enabled: boolean;
                message_history: boolean;
                participant_management: boolean;
            };
            intelligent_control: {
                enabled: boolean;
                adaptive_rounds: boolean;
                dynamic_strategy: boolean;
                completeness_evaluation: boolean;
            };
            critical_thinking: {
                enabled: boolean;
                analysis_depth: string;
                question_generation: boolean;
                logic_validation: boolean;
            };
            knowledge_search: {
                enabled: boolean;
                real_time_search: boolean;
                knowledge_validation: boolean;
                source_verification: boolean;
            };
        };
        strategy: {
            type: string;
            rounds: {
                min: number;
                max: number;
                target: number;
            };
            exit_criteria: {
                completeness_threshold: number;
                user_satisfaction_threshold: number;
            };
        };
    })[];
} | {
    $schema: string;
    $id: string;
    title: string;
    description: string;
    type: string;
    $defs: {
        uuid: {
            type: string;
            pattern: string;
            description: string;
        };
        timestamp: {
            type: string;
            format: string;
            description: string;
        };
        version: {
            type: string;
            pattern: string;
            description: string;
        };
        entityStatus: {
            type: string;
            enum: string[];
            description: string;
        };
    };
    properties: {
        network_id: {
            $ref: string;
            description: string;
        };
        protocol_version: {
            type: string;
            const: string;
            description: string;
        };
        timestamp: {
            $ref: string;
            description: string;
        };
        context_id: {
            $ref: string;
            description: string;
        };
        name: {
            type: string;
            minLength: number;
            maxLength: number;
            description: string;
        };
        description: {
            type: string;
            maxLength: number;
            description: string;
        };
        topology: {
            type: string;
            enum: string[];
            description: string;
        };
        nodes: {
            type: string;
            items: {
                type: string;
                properties: {
                    node_id: {
                        $ref: string;
                        description: string;
                    };
                    agent_id: {
                        $ref: string;
                        description: string;
                    };
                    node_type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    capabilities: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                        maxItems: number;
                        description: string;
                    };
                    address: {
                        type: string;
                        properties: {
                            host: {
                                type: string;
                                description: string;
                            };
                            port: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                description: string;
                            };
                            protocol: {
                                type: string;
                                enum: string[];
                                description: string;
                            };
                        };
                        required: string[];
                        additionalProperties: boolean;
                        description: string;
                    };
                    metadata: {
                        type: string;
                        additionalProperties: boolean;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            minItems: number;
            maxItems: number;
            description: string;
        };
        edges: {
            type: string;
            items: {
                type: string;
                properties: {
                    edge_id: {
                        $ref: string;
                        description: string;
                    };
                    source_node_id: {
                        $ref: string;
                        description: string;
                    };
                    target_node_id: {
                        $ref: string;
                        description: string;
                    };
                    edge_type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    direction: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    status: {
                        $ref: string;
                        description: string;
                    };
                    weight: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        description: string;
                    };
                    metadata: {
                        type: string;
                        additionalProperties: boolean;
                        description: string;
                    };
                };
                required: string[];
                additionalProperties: boolean;
            };
            maxItems: number;
            description: string;
        };
        discovery_mechanism: {
            type: string;
            properties: {
                type: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                registry_config: {
                    type: string;
                    properties: {
                        endpoint: {
                            type: string;
                            format: string;
                            description: string;
                        };
                        authentication: {
                            type: string;
                            default: boolean;
                            description: string;
                        };
                        refresh_interval: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                    };
                    additionalProperties: boolean;
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
            description: string;
        };
        routing_strategy: {
            type: string;
            properties: {
                algorithm: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                load_balancing: {
                    type: string;
                    properties: {
                        method: {
                            type: string;
                            enum: string[];
                            description: string;
                        };
                    };
                    additionalProperties: boolean;
                    description: string;
                };
            };
            required: string[];
            additionalProperties: boolean;
            description: string;
        };
        status: {
            $ref: string;
            description: string;
        };
        created_at: {
            $ref: string;
            description: string;
        };
        updated_at: {
            $ref: string;
            description: string;
        };
        created_by: {
            $ref: string;
            description: string;
        };
        metadata: {
            type: string;
            additionalProperties: boolean;
            description: string;
        };
        audit_trail: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                retention_days: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                audit_events: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_id: {
                                $ref: string;
                            };
                            event_type: {
                                type: string;
                                enum: string[];
                            };
                            timestamp: {
                                $ref: string;
                            };
                            user_id: {
                                type: string;
                            };
                            user_role: {
                                type: string;
                            };
                            action: {
                                type: string;
                            };
                            resource: {
                                type: string;
                            };
                            network_operation: {
                                type: string;
                            };
                            network_id: {
                                $ref: string;
                            };
                            network_name: {
                                type: string;
                            };
                            network_type: {
                                type: string;
                            };
                            node_ids: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            network_status: {
                                type: string;
                            };
                            node_id: {
                                $ref: string;
                            };
                            connection_details: {
                                type: string;
                            };
                            network_details: {
                                type: string;
                            };
                            ip_address: {
                                type: string;
                            };
                            user_agent: {
                                type: string;
                            };
                            session_id: {
                                type: string;
                            };
                            correlation_id: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                compliance_settings: {
                    type: string;
                    properties: {
                        gdpr_enabled: {
                            type: string;
                        };
                        hipaa_enabled: {
                            type: string;
                        };
                        sox_enabled: {
                            type: string;
                        };
                        network_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        network_data_logging: {
                            type: string;
                        };
                        traffic_logging: {
                            type: string;
                        };
                        custom_compliance: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        monitoring_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                supported_providers: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                integration_endpoints: {
                    type: string;
                    properties: {
                        metrics_api: {
                            type: string;
                            format: string;
                        };
                        network_performance_api: {
                            type: string;
                            format: string;
                        };
                        traffic_analysis_api: {
                            type: string;
                            format: string;
                        };
                        connection_status_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                network_metrics: {
                    type: string;
                    properties: {
                        track_network_performance: {
                            type: string;
                        };
                        track_traffic_flow: {
                            type: string;
                        };
                        track_connection_status: {
                            type: string;
                        };
                        track_security_events: {
                            type: string;
                        };
                    };
                };
                export_formats: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            required: string[];
        };
        performance_metrics: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                collection_interval_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                metrics: {
                    type: string;
                    properties: {
                        network_communication_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        network_topology_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        network_reliability_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        connection_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        network_management_efficiency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_connections_count: {
                            type: string;
                            minimum: number;
                        };
                        network_operations_per_second: {
                            type: string;
                            minimum: number;
                        };
                        network_memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        average_network_complexity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                health_status: {
                    type: string;
                    properties: {
                        status: {
                            type: string;
                            enum: string[];
                        };
                        last_check: {
                            $ref: string;
                        };
                        checks: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    check_name: {
                                        type: string;
                                    };
                                    status: {
                                        type: string;
                                        enum: string[];
                                    };
                                    message: {
                                        type: string;
                                    };
                                    duration_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                alerting: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        thresholds: {
                            type: string;
                            properties: {
                                max_network_communication_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_network_topology_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_network_reliability_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_connection_success_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_network_management_efficiency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                        };
                        notification_channels: {
                            type: string;
                            items: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
        version_history: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                max_versions: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version_id: {
                                $ref: string;
                            };
                            version_number: {
                                type: string;
                                minimum: number;
                            };
                            created_at: {
                                $ref: string;
                            };
                            created_by: {
                                type: string;
                            };
                            change_summary: {
                                type: string;
                            };
                            network_snapshot: {
                                type: string;
                            };
                            change_type: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                auto_versioning: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        version_on_topology_change: {
                            type: string;
                        };
                        version_on_node_change: {
                            type: string;
                        };
                        version_on_routing_change: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        search_metadata: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                indexing_strategy: {
                    type: string;
                    enum: string[];
                };
                searchable_fields: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                search_indexes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            index_id: {
                                type: string;
                            };
                            index_name: {
                                type: string;
                            };
                            fields: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            index_type: {
                                type: string;
                                enum: string[];
                            };
                            created_at: {
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                network_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_topology_data: {
                            type: string;
                        };
                        index_performance_metrics: {
                            type: string;
                        };
                        index_audit_logs: {
                            type: string;
                        };
                    };
                };
                auto_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_new_networks: {
                            type: string;
                        };
                        reindex_interval_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        network_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        network_details: {
            type: string;
            properties: {
                network_topology: {
                    type: string;
                    enum: string[];
                };
                protocol_type: {
                    type: string;
                    enum: string[];
                };
                security_mode: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        event_integration: {
            type: string;
            properties: {
                enabled: {
                    type: string;
                };
                event_bus_connection: {
                    type: string;
                    properties: {
                        bus_type: {
                            type: string;
                            enum: string[];
                        };
                        connection_string: {
                            type: string;
                        };
                        topic_prefix: {
                            type: string;
                        };
                        consumer_group: {
                            type: string;
                        };
                    };
                };
                published_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                subscribed_events: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                event_routing: {
                    type: string;
                    properties: {
                        routing_rules: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    rule_id: {
                                        type: string;
                                    };
                                    condition: {
                                        type: string;
                                    };
                                    target_topic: {
                                        type: string;
                                    };
                                    enabled: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
            };
            required: string[];
        };
    };
    required: string[];
    additionalProperties: boolean;
})[];
export declare const CoreModuleNames: Array<keyof typeof CoreModulesSchemaMap>;
export declare function isProductionReady(moduleName: string): moduleName is typeof ProductionReadyModules[number];
export declare function isEnterpriseStandard(moduleName: string): moduleName is typeof EnterpriseStandardModules[number];
export declare function isPending(moduleName: string): moduleName is typeof PendingModules[number];
export declare function getModuleStatus(moduleName: CoreModuleSchemaName): 'production-ready' | 'enterprise-standard' | 'pending' | 'unknown';
export declare const ModuleInfo: {
    readonly context: {
        readonly status: "production-ready";
        readonly description: "Context Management Hub";
        readonly features: "14 functional domains, 16 specialized services";
    };
    readonly plan: {
        readonly status: "production-ready";
        readonly description: "Intelligent Task Planning Coordinator";
        readonly features: "5 advanced coordinators, 8 MPLP module reserved interfaces";
    };
    readonly confirm: {
        readonly status: "production-ready";
        readonly description: "Enterprise Approval Workflow";
        readonly features: "4 advanced coordinators, enterprise approval workflows";
    };
    readonly trace: {
        readonly status: "enterprise-standard";
        readonly description: "Full-Chain Monitoring Hub";
        readonly features: "100% test pass rate (107/107), zero flaky tests";
    };
    readonly role: {
        readonly status: "enterprise-standard";
        readonly description: "Enterprise RBAC Security Hub";
        readonly features: "75.31% coverage, 333 tests, <10ms permission verification";
    };
    readonly extension: {
        readonly status: "enterprise-standard";
        readonly description: "Multi-Agent Protocol Platform";
        readonly features: "54 functional tests, 8 MPLP interfaces, AI-driven recommendations";
    };
    readonly core: {
        readonly status: "enterprise-standard";
        readonly description: "Workflow Orchestration Hub";
        readonly features: "CoreOrchestrator infrastructure, workflow orchestration";
    };
    readonly collab: {
        readonly status: "pending";
        readonly description: "Collaboration Management Hub";
        readonly features: "Multi-person collaboration, real-time sync";
    };
    readonly dialog: {
        readonly status: "pending";
        readonly description: "Dialog Interaction Hub";
        readonly features: "Intelligent dialog, multi-modal interaction";
    };
    readonly network: {
        readonly status: "pending";
        readonly description: "Network Communication Hub";
        readonly features: "Distributed architecture, network coordination";
    };
};
//# sourceMappingURL=index.d.ts.map