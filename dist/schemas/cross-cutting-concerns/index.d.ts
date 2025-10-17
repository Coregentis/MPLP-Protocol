import SecuritySchema from './mplp-security.json';
import PerformanceSchema from './mplp-performance.json';
import EventBusSchema from './mplp-event-bus.json';
import ErrorHandlingSchema from './mplp-error-handling.json';
import CoordinationSchema from './mplp-coordination.json';
import OrchestrationSchema from './mplp-orchestration.json';
import StateSyncSchema from './mplp-state-sync.json';
import TransactionSchema from './mplp-transaction.json';
import ProtocolVersionSchema from './mplp-protocol-version.json';
export { SecuritySchema, PerformanceSchema, EventBusSchema, ErrorHandlingSchema, CoordinationSchema, OrchestrationSchema, StateSyncSchema, TransactionSchema, ProtocolVersionSchema };
export declare const CrossCuttingConcernsSchemaMap: {
    readonly security: {
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
            module_type: {
                type: string;
                enum: string[];
                description: string;
            };
            security_level: {
                type: string;
                enum: string[];
                description: string;
            };
            authentication_method: {
                type: string;
                enum: string[];
                description: string;
            };
            encryption_algorithm: {
                type: string;
                enum: string[];
                description: string;
            };
            user_identity: {
                type: string;
                properties: {
                    user_id: {
                        type: string;
                    };
                    username: {
                        type: string;
                    };
                    email: {
                        type: string;
                        format: string;
                    };
                    display_name: {
                        type: string;
                    };
                    user_type: {
                        type: string;
                        enum: string[];
                    };
                    organization: {
                        type: string;
                    };
                    department: {
                        type: string;
                    };
                    roles: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    groups: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    attributes: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            };
            permission: {
                type: string;
                properties: {
                    permission_id: {
                        $ref: string;
                    };
                    resource_type: {
                        type: string;
                        enum: string[];
                    };
                    resource_identifier: {
                        type: string;
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
                            time_restrictions: {
                                type: string;
                                properties: {
                                    start_time: {
                                        $ref: string;
                                    };
                                    end_time: {
                                        $ref: string;
                                    };
                                    allowed_hours: {
                                        type: string;
                                        items: {
                                            type: string;
                                            minimum: number;
                                            maximum: number;
                                        };
                                    };
                                    allowed_days: {
                                        type: string;
                                        items: {
                                            type: string;
                                            minimum: number;
                                            maximum: number;
                                        };
                                    };
                                };
                            };
                            ip_restrictions: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            context_requirements: {
                                type: string;
                                description: string;
                            };
                        };
                    };
                    granted_at: {
                        $ref: string;
                    };
                    expires_at: {
                        $ref: string;
                    };
                    granted_by: {
                        type: string;
                    };
                };
                required: string[];
            };
            encryption_info: {
                type: string;
                properties: {
                    algorithm: {
                        $ref: string;
                    };
                    key_id: {
                        type: string;
                    };
                    key_version: {
                        type: string;
                    };
                    initialization_vector: {
                        type: string;
                    };
                    key_derivation: {
                        type: string;
                        properties: {
                            method: {
                                type: string;
                                enum: string[];
                            };
                            iterations: {
                                type: string;
                                minimum: number;
                            };
                            salt: {
                                type: string;
                            };
                        };
                    };
                    signature: {
                        type: string;
                    };
                    certificate_chain: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
                required: string[];
            };
            audit_entry: {
                type: string;
                properties: {
                    audit_id: {
                        $ref: string;
                    };
                    event_type: {
                        type: string;
                        enum: string[];
                    };
                    user_identity: {
                        $ref: string;
                    };
                    resource_accessed: {
                        type: string;
                    };
                    action_performed: {
                        type: string;
                    };
                    result: {
                        type: string;
                        enum: string[];
                    };
                    source_ip: {
                        type: string;
                    };
                    user_agent: {
                        type: string;
                    };
                    session_id: {
                        $ref: string;
                    };
                    request_id: {
                        $ref: string;
                    };
                    additional_data: {
                        type: string;
                    };
                    risk_score: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    timestamp: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            security_context: {
                type: string;
                properties: {
                    context_id: {
                        $ref: string;
                    };
                    session_id: {
                        $ref: string;
                    };
                    user_identity: {
                        $ref: string;
                    };
                    authentication_token: {
                        type: string;
                        properties: {
                            token_type: {
                                type: string;
                                enum: string[];
                            };
                            token_value: {
                                type: string;
                            };
                            issued_at: {
                                $ref: string;
                            };
                            expires_at: {
                                $ref: string;
                            };
                            issuer: {
                                type: string;
                            };
                            audience: {
                                type: string;
                            };
                            scopes: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                        required: string[];
                    };
                    permissions: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    security_level: {
                        $ref: string;
                    };
                    encryption_info: {
                        $ref: string;
                    };
                    audit_trail: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    security_policies: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                policy_id: {
                                    type: string;
                                };
                                policy_name: {
                                    type: string;
                                };
                                policy_version: {
                                    type: string;
                                };
                                enforcement_level: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    threat_indicators: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                indicator_type: {
                                    type: string;
                                    enum: string[];
                                };
                                severity: {
                                    type: string;
                                    enum: string[];
                                };
                                description: {
                                    type: string;
                                };
                                detected_at: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    created_at: {
                        $ref: string;
                    };
                    updated_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            security_event: {
                type: string;
                properties: {
                    event_id: {
                        $ref: string;
                    };
                    event_type: {
                        type: string;
                        enum: string[];
                    };
                    severity: {
                        type: string;
                        enum: string[];
                    };
                    source_module: {
                        $ref: string;
                    };
                    affected_resources: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    security_context: {
                        $ref: string;
                    };
                    event_details: {
                        type: string;
                        description: string;
                    };
                    mitigation_actions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                action_type: {
                                    type: string;
                                    enum: string[];
                                };
                                action_description: {
                                    type: string;
                                };
                                automated: {
                                    type: string;
                                };
                                executed_at: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    investigation_status: {
                        type: string;
                        enum: string[];
                    };
                    occurred_at: {
                        $ref: string;
                    };
                    resolved_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            security_policy: {
                type: string;
                properties: {
                    policy_id: {
                        $ref: string;
                    };
                    policy_name: {
                        type: string;
                    };
                    policy_version: {
                        type: string;
                    };
                    policy_type: {
                        type: string;
                        enum: string[];
                    };
                    target_modules: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    policy_rules: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                rule_id: {
                                    type: string;
                                };
                                rule_name: {
                                    type: string;
                                };
                                condition: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                    enum: string[];
                                };
                                parameters: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    enforcement_level: {
                        type: string;
                        enum: string[];
                    };
                    compliance_frameworks: {
                        type: string;
                        items: {
                            type: string;
                            enum: string[];
                        };
                    };
                    effective_date: {
                        $ref: string;
                    };
                    expiration_date: {
                        $ref: string;
                    };
                    created_by: {
                        type: string;
                    };
                    approved_by: {
                        type: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                    updated_at: {
                        $ref: string;
                    };
                };
                required: string[];
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
            security_context: {
                $ref: string;
            };
            security_event: {
                $ref: string;
            };
            security_policy: {
                $ref: string;
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
                                security_operation: {
                                    type: string;
                                };
                                security_level: {
                                    $ref: string;
                                };
                                authentication_method: {
                                    $ref: string;
                                };
                                encryption_algorithm: {
                                    $ref: string;
                                };
                                source_module: {
                                    $ref: string;
                                };
                                target_resource: {
                                    type: string;
                                };
                                security_details: {
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
                            security_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            security_data_logging: {
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
                            security_monitoring_api: {
                                type: string;
                                format: string;
                            };
                            threat_analysis_api: {
                                type: string;
                                format: string;
                            };
                            compliance_monitoring_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    security_metrics: {
                        type: string;
                        properties: {
                            track_security_monitoring: {
                                type: string;
                            };
                            track_threat_analysis: {
                                type: string;
                            };
                            track_compliance_monitoring: {
                                type: string;
                            };
                            track_access_control: {
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
                            security_check_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            authentication_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            authorization_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            threat_detection_accuracy_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            compliance_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_sessions_count: {
                                type: string;
                                minimum: number;
                            };
                            security_violations_count: {
                                type: string;
                                minimum: number;
                            };
                            failed_authentications_count: {
                                type: string;
                                minimum: number;
                            };
                            average_encryption_time_ms: {
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
                                    max_security_check_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_authentication_success_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_authorization_success_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_threat_detection_accuracy_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_security_violations_count: {
                                        type: string;
                                        minimum: number;
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
                                security_snapshot: {
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
                            version_on_policy_change: {
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
                    security_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_security_data: {
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
                            index_new_security_events: {
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
            security_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            security_details: {
                type: string;
                properties: {
                    security_level: {
                        type: string;
                        enum: string[];
                    };
                    encryption_algorithm: {
                        type: string;
                        enum: string[];
                    };
                    authentication_method: {
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
        oneOf: {
            required: string[];
        }[];
    };
    readonly performance: {
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
            module_type: {
                type: string;
                enum: string[];
                description: string;
            };
            metric_type: {
                type: string;
                enum: string[];
                description: string;
            };
            alert_level: {
                type: string;
                enum: string[];
                description: string;
            };
            sla_status: {
                type: string;
                enum: string[];
                description: string;
            };
            performance_baseline: {
                type: string;
                properties: {
                    baseline_id: {
                        $ref: string;
                    };
                    baseline_name: {
                        type: string;
                    };
                    module_name: {
                        $ref: string;
                    };
                    baseline_period: {
                        type: string;
                        properties: {
                            start_time: {
                                $ref: string;
                            };
                            end_time: {
                                $ref: string;
                            };
                            duration_hours: {
                                type: string;
                                minimum: number;
                            };
                        };
                        required: string[];
                    };
                    baseline_metrics: {
                        type: string;
                        properties: {
                            response_time_p50: {
                                type: string;
                            };
                            response_time_p95: {
                                type: string;
                            };
                            response_time_p99: {
                                type: string;
                            };
                            throughput_avg: {
                                type: string;
                            };
                            throughput_peak: {
                                type: string;
                            };
                            error_rate: {
                                type: string;
                            };
                            cpu_usage_avg: {
                                type: string;
                            };
                            memory_usage_avg: {
                                type: string;
                            };
                            disk_io_avg: {
                                type: string;
                            };
                            network_io_avg: {
                                type: string;
                            };
                        };
                    };
                    confidence_level: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                    };
                    sample_size: {
                        type: string;
                        minimum: number;
                    };
                    created_at: {
                        $ref: string;
                    };
                    created_by: {
                        type: string;
                    };
                };
                required: string[];
            };
            sla_definition: {
                type: string;
                properties: {
                    sla_id: {
                        $ref: string;
                    };
                    sla_name: {
                        type: string;
                    };
                    module_name: {
                        $ref: string;
                    };
                    sla_type: {
                        type: string;
                        enum: string[];
                    };
                    target_value: {
                        type: string;
                    };
                    target_unit: {
                        type: string;
                    };
                    measurement_period: {
                        type: string;
                        enum: string[];
                    };
                    calculation_method: {
                        type: string;
                        enum: string[];
                    };
                    violation_threshold: {
                        type: string;
                        properties: {
                            warning_percentage: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            critical_percentage: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            consecutive_violations: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                    business_impact: {
                        type: string;
                        enum: string[];
                    };
                    penalty_clauses: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                violation_level: {
                                    type: string;
                                };
                                penalty_type: {
                                    type: string;
                                    enum: string[];
                                };
                                penalty_amount: {
                                    type: string;
                                };
                                penalty_description: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    effective_date: {
                        $ref: string;
                    };
                    expiration_date: {
                        $ref: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            performance_alert: {
                type: string;
                properties: {
                    alert_id: {
                        $ref: string;
                    };
                    alert_name: {
                        type: string;
                    };
                    alert_type: {
                        type: string;
                        enum: string[];
                    };
                    alert_level: {
                        $ref: string;
                    };
                    module_name: {
                        $ref: string;
                    };
                    metric_name: {
                        type: string;
                    };
                    current_value: {
                        type: string;
                    };
                    threshold_value: {
                        type: string;
                    };
                    deviation_percentage: {
                        type: string;
                    };
                    alert_condition: {
                        type: string;
                    };
                    alert_description: {
                        type: string;
                    };
                    affected_operations: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    impact_assessment: {
                        type: string;
                        properties: {
                            user_impact: {
                                type: string;
                                enum: string[];
                            };
                            business_impact: {
                                type: string;
                                enum: string[];
                            };
                            estimated_affected_users: {
                                type: string;
                            };
                            estimated_revenue_impact: {
                                type: string;
                            };
                        };
                    };
                    recommended_actions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                action_type: {
                                    type: string;
                                    enum: string[];
                                };
                                action_description: {
                                    type: string;
                                };
                                priority: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                estimated_time_minutes: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    alert_status: {
                        type: string;
                        enum: string[];
                    };
                    triggered_at: {
                        $ref: string;
                    };
                    acknowledged_at: {
                        $ref: string;
                    };
                    resolved_at: {
                        $ref: string;
                    };
                    acknowledged_by: {
                        type: string;
                    };
                    resolved_by: {
                        type: string;
                    };
                };
                required: string[];
            };
            performance_report: {
                type: string;
                properties: {
                    report_id: {
                        $ref: string;
                    };
                    report_name: {
                        type: string;
                    };
                    report_type: {
                        type: string;
                        enum: string[];
                    };
                    report_period: {
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
                    modules_covered: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    performance_summary: {
                        type: string;
                        properties: {
                            overall_availability: {
                                type: string;
                            };
                            average_response_time: {
                                type: string;
                            };
                            peak_throughput: {
                                type: string;
                            };
                            total_requests: {
                                type: string;
                            };
                            total_errors: {
                                type: string;
                            };
                            error_rate: {
                                type: string;
                            };
                            sla_compliance_rate: {
                                type: string;
                            };
                        };
                    };
                    module_performance: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                module_name: {
                                    $ref: string;
                                };
                                availability: {
                                    type: string;
                                };
                                response_time_p95: {
                                    type: string;
                                };
                                throughput_avg: {
                                    type: string;
                                };
                                error_rate: {
                                    type: string;
                                };
                                sla_status: {
                                    $ref: string;
                                };
                                key_incidents: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                    sla_compliance: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                sla_name: {
                                    type: string;
                                };
                                target_value: {
                                    type: string;
                                };
                                actual_value: {
                                    type: string;
                                };
                                compliance_percentage: {
                                    type: string;
                                };
                                status: {
                                    $ref: string;
                                };
                                violations_count: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    trends_analysis: {
                        type: string;
                        properties: {
                            performance_trend: {
                                type: string;
                                enum: string[];
                            };
                            trend_confidence: {
                                type: string;
                            };
                            key_observations: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            recommendations: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                    generated_at: {
                        $ref: string;
                    };
                    generated_by: {
                        type: string;
                    };
                    report_format: {
                        type: string;
                        enum: string[];
                    };
                };
                required: string[];
            };
            capacity_planning: {
                type: string;
                properties: {
                    planning_id: {
                        $ref: string;
                    };
                    planning_name: {
                        type: string;
                    };
                    module_name: {
                        $ref: string;
                    };
                    current_capacity: {
                        type: string;
                        properties: {
                            max_throughput: {
                                type: string;
                            };
                            max_concurrent_users: {
                                type: string;
                            };
                            cpu_cores: {
                                type: string;
                            };
                            memory_gb: {
                                type: string;
                            };
                            storage_gb: {
                                type: string;
                            };
                            network_bandwidth_mbps: {
                                type: string;
                            };
                        };
                    };
                    usage_patterns: {
                        type: string;
                        properties: {
                            peak_usage_times: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            seasonal_variations: {
                                type: string;
                            };
                            growth_rate_monthly: {
                                type: string;
                            };
                            usage_distribution: {
                                type: string;
                            };
                        };
                    };
                    capacity_projections: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                projection_period: {
                                    type: string;
                                };
                                projected_load: {
                                    type: string;
                                };
                                required_capacity: {
                                    type: string;
                                };
                                capacity_gap: {
                                    type: string;
                                };
                                scaling_recommendations: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                    scaling_strategies: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                strategy_name: {
                                    type: string;
                                };
                                strategy_type: {
                                    type: string;
                                    enum: string[];
                                };
                                trigger_conditions: {
                                    type: string;
                                };
                                scaling_actions: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                estimated_cost: {
                                    type: string;
                                };
                                implementation_time: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    created_at: {
                        $ref: string;
                    };
                    updated_at: {
                        $ref: string;
                    };
                };
                required: string[];
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
                            monitoring_overhead_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            performance_analysis_accuracy_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            sla_compliance_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            capacity_prediction_accuracy_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            performance_optimization_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_monitors_count: {
                                type: string;
                                minimum: number;
                            };
                            alert_frequency_per_hour: {
                                type: string;
                                minimum: number;
                            };
                            false_positive_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            average_response_time_ms: {
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
                                    max_monitoring_overhead_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_performance_analysis_accuracy_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_sla_compliance_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_capacity_prediction_accuracy_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_false_positive_rate_percent: {
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
            performance_baseline: {
                $ref: string;
            };
            sla_definition: {
                $ref: string;
            };
            performance_alert: {
                $ref: string;
            };
            performance_report: {
                $ref: string;
            };
            capacity_planning: {
                $ref: string;
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
                                performance_operation: {
                                    type: string;
                                };
                                metric_name: {
                                    type: string;
                                };
                                metric_value: {
                                    type: string;
                                };
                                alert_level: {
                                    $ref: string;
                                };
                                sla_status: {
                                    $ref: string;
                                };
                                source_module: {
                                    $ref: string;
                                };
                                performance_details: {
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
                            performance_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            performance_data_logging: {
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
                            performance_monitoring_api: {
                                type: string;
                                format: string;
                            };
                            performance_analysis_api: {
                                type: string;
                                format: string;
                            };
                            sla_monitoring_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    performance_metrics: {
                        type: string;
                        properties: {
                            track_performance_monitoring: {
                                type: string;
                            };
                            track_performance_analysis: {
                                type: string;
                            };
                            track_sla_monitoring: {
                                type: string;
                            };
                            track_capacity_planning: {
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
                                performance_snapshot: {
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
                            version_on_baseline_change: {
                                type: string;
                            };
                            version_on_sla_change: {
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
                    performance_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_performance_data: {
                                type: string;
                            };
                            index_enterprise_performance_metrics: {
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
                            index_new_metrics: {
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
            performance_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            performance_details: {
                type: string;
                properties: {
                    collection_strategy: {
                        type: string;
                        enum: string[];
                    };
                    aggregation_level: {
                        type: string;
                        enum: string[];
                    };
                    retention_policy: {
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
        oneOf: {
            required: string[];
        }[];
    };
    readonly eventBus: {
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
            module_type: {
                type: string;
                enum: string[];
                description: string;
            };
            event_type: {
                type: string;
                enum: string[];
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
            delivery_mode: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
            routing_strategy: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
            event_message: {
                type: string;
                properties: {
                    event_id: {
                        $ref: string;
                    };
                    event_type: {
                        $ref: string;
                    };
                    event_name: {
                        type: string;
                        description: string;
                    };
                    source_module: {
                        $ref: string;
                    };
                    target_modules: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    payload: {
                        type: string;
                        description: string;
                    };
                    routing_key: {
                        type: string;
                        description: string;
                    };
                    headers: {
                        type: string;
                        description: string;
                    };
                    priority: {
                        $ref: string;
                    };
                    delivery_mode: {
                        $ref: string;
                    };
                    ttl_ms: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                        description: string;
                    };
                    correlation_id: {
                        $ref: string;
                        description: string;
                    };
                    reply_to: {
                        type: string;
                        description: string;
                    };
                    trace_context: {
                        type: string;
                        properties: {
                            trace_id: {
                                $ref: string;
                            };
                            span_id: {
                                $ref: string;
                            };
                            parent_span_id: {
                                $ref: string;
                            };
                        };
                        description: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                    expires_at: {
                        $ref: string;
                    };
                    event_bus_details: {
                        type: string;
                        properties: {
                            bus_topology: {
                                type: string;
                                enum: string[];
                            };
                            message_ordering: {
                                type: string;
                                enum: string[];
                            };
                            delivery_guarantee: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
                required: string[];
            };
            event_subscription: {
                type: string;
                properties: {
                    subscription_id: {
                        $ref: string;
                    };
                    subscriber_module: {
                        $ref: string;
                    };
                    event_patterns: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                event_type: {
                                    $ref: string;
                                };
                                event_name_pattern: {
                                    type: string;
                                    description: string;
                                };
                                source_modules: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                    description: string;
                                };
                                routing_key_pattern: {
                                    type: string;
                                    description: string;
                                };
                                filter_conditions: {
                                    type: string;
                                    description: string;
                                };
                            };
                            required: string[];
                        };
                        minItems: number;
                    };
                    delivery_options: {
                        type: string;
                        properties: {
                            max_retry_count: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                default: number;
                            };
                            retry_delay_ms: {
                                type: string;
                                minimum: number;
                                default: number;
                            };
                            dead_letter_enabled: {
                                type: string;
                                default: boolean;
                            };
                            batch_size: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                default: number;
                            };
                            batch_timeout_ms: {
                                type: string;
                                minimum: number;
                                default: number;
                            };
                        };
                    };
                    active: {
                        type: string;
                        default: boolean;
                        description: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                    updated_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            event_delivery_receipt: {
                type: string;
                properties: {
                    receipt_id: {
                        $ref: string;
                    };
                    event_id: {
                        $ref: string;
                    };
                    subscription_id: {
                        $ref: string;
                    };
                    delivery_status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    delivery_attempt: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    processing_time_ms: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    error_info: {
                        type: string;
                        properties: {
                            error_code: {
                                type: string;
                                pattern: string;
                            };
                            error_message: {
                                type: string;
                            };
                            error_details: {
                                type: string;
                            };
                        };
                    };
                    delivered_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            event_bus_metrics: {
                type: string;
                properties: {
                    metric_id: {
                        $ref: string;
                    };
                    time_window_start: {
                        $ref: string;
                    };
                    time_window_end: {
                        $ref: string;
                    };
                    throughput_metrics: {
                        type: string;
                        properties: {
                            events_published: {
                                type: string;
                            };
                            events_delivered: {
                                type: string;
                            };
                            events_failed: {
                                type: string;
                            };
                            average_latency_ms: {
                                type: string;
                            };
                            p95_latency_ms: {
                                type: string;
                            };
                            p99_latency_ms: {
                                type: string;
                            };
                        };
                    };
                    resource_metrics: {
                        type: string;
                        properties: {
                            memory_usage_mb: {
                                type: string;
                            };
                            cpu_usage_percent: {
                                type: string;
                            };
                            network_io_mb: {
                                type: string;
                            };
                            queue_depth: {
                                type: string;
                            };
                        };
                    };
                    error_metrics: {
                        type: string;
                        properties: {
                            error_rate: {
                                type: string;
                            };
                            timeout_rate: {
                                type: string;
                            };
                            dead_letter_rate: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
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
            event_message: {
                $ref: string;
            };
            event_subscription: {
                $ref: string;
            };
            event_delivery_receipt: {
                $ref: string;
            };
            event_bus_metrics: {
                $ref: string;
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
                                event_bus_operation: {
                                    type: string;
                                };
                                message_id: {
                                    $ref: string;
                                };
                                topic_name: {
                                    type: string;
                                };
                                subscriber_id: {
                                    $ref: string;
                                };
                                delivery_details: {
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
                            event_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            message_content_logging: {
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
                            event_throughput_api: {
                                type: string;
                                format: string;
                            };
                            message_latency_api: {
                                type: string;
                                format: string;
                            };
                            queue_status_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    event_bus_metrics: {
                        type: string;
                        properties: {
                            track_event_throughput: {
                                type: string;
                            };
                            track_message_latency: {
                                type: string;
                            };
                            track_queue_status: {
                                type: string;
                            };
                            track_subscription_health: {
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
                            event_throughput_per_second: {
                                type: string;
                                minimum: number;
                            };
                            message_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            queue_depth_count: {
                                type: string;
                                minimum: number;
                            };
                            delivery_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            subscription_health_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_subscribers_count: {
                                type: string;
                                minimum: number;
                            };
                            failed_deliveries_count: {
                                type: string;
                                minimum: number;
                            };
                            dead_letter_queue_size: {
                                type: string;
                                minimum: number;
                            };
                            average_processing_time_ms: {
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
                                    min_throughput_per_second: {
                                        type: string;
                                        minimum: number;
                                    };
                                    max_message_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    max_queue_depth_count: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_delivery_success_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_dead_letter_queue_size: {
                                        type: string;
                                        minimum: number;
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
                                event_bus_snapshot: {
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
                            version_on_topic_change: {
                                type: string;
                            };
                            version_on_subscription_change: {
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
                    event_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_message_content: {
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
                            index_new_events: {
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
            event_bus_details: {
                type: string;
                properties: {
                    bus_topology: {
                        type: string;
                        enum: string[];
                    };
                    message_ordering: {
                        type: string;
                        enum: string[];
                    };
                    delivery_guarantee: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            event_bus_operation: {
                type: string;
                enum: string[];
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
        oneOf: {
            required: string[];
        }[];
    };
    readonly errorHandling: {
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
            module_type: {
                type: string;
                enum: string[];
                description: string;
            };
            error_code: {
                type: string;
                pattern: string;
                description: string;
            };
            error_category: {
                type: string;
                enum: string[];
                description: string;
            };
            error_severity: {
                type: string;
                enum: string[];
                description: string;
            };
            recovery_strategy: {
                type: string;
                enum: string[];
                description: string;
            };
            stack_frame: {
                type: string;
                properties: {
                    module: {
                        $ref: string;
                    };
                    function_name: {
                        type: string;
                    };
                    file_path: {
                        type: string;
                    };
                    line_number: {
                        type: string;
                        minimum: number;
                    };
                    column_number: {
                        type: string;
                        minimum: number;
                    };
                    source_code: {
                        type: string;
                    };
                    error_handling_operation: {
                        type: string;
                        enum: string[];
                    };
                    error_handling_details: {
                        type: string;
                        properties: {
                            error_category: {
                                type: string;
                            };
                            recovery_strategy: {
                                type: string;
                            };
                            escalation_level: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                };
                required: string[];
            };
            error_context: {
                type: string;
                properties: {
                    request_id: {
                        $ref: string;
                    };
                    session_id: {
                        $ref: string;
                    };
                    user_id: {
                        type: string;
                    };
                    operation: {
                        type: string;
                    };
                    input_parameters: {
                        type: string;
                    };
                    environment: {
                        type: string;
                        enum: string[];
                    };
                    system_state: {
                        type: string;
                    };
                    correlation_data: {
                        type: string;
                    };
                };
            };
            error_info: {
                type: string;
                properties: {
                    error_id: {
                        $ref: string;
                    };
                    error_code: {
                        $ref: string;
                    };
                    error_category: {
                        $ref: string;
                    };
                    error_severity: {
                        $ref: string;
                    };
                    error_message: {
                        type: string;
                        description: string;
                    };
                    technical_message: {
                        type: string;
                        description: string;
                    };
                    error_details: {
                        type: string;
                        description: string;
                    };
                    source_module: {
                        $ref: string;
                    };
                    source_function: {
                        type: string;
                    };
                    stack_trace: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    inner_errors: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    context: {
                        $ref: string;
                    };
                    recovery_suggestions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                strategy: {
                                    $ref: string;
                                };
                                description: {
                                    type: string;
                                };
                                automated: {
                                    type: string;
                                };
                                success_probability: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                            };
                            required: string[];
                        };
                    };
                    occurred_at: {
                        $ref: string;
                    };
                    resolved_at: {
                        $ref: string;
                    };
                    resolution_notes: {
                        type: string;
                    };
                };
                required: string[];
            };
            error_propagation: {
                type: string;
                properties: {
                    propagation_id: {
                        $ref: string;
                    };
                    original_error: {
                        $ref: string;
                    };
                    propagation_chain: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                module: {
                                    $ref: string;
                                };
                                function: {
                                    type: string;
                                };
                                transformation: {
                                    type: string;
                                    enum: string[];
                                };
                                added_context: {
                                    type: string;
                                };
                                timestamp: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    final_error: {
                        $ref: string;
                    };
                    propagation_rules: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                rule_name: {
                                    type: string;
                                };
                                condition: {
                                    type: string;
                                };
                                action: {
                                    type: string;
                                    enum: string[];
                                };
                                transformation_template: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            error_recovery: {
                type: string;
                properties: {
                    recovery_id: {
                        $ref: string;
                    };
                    error_id: {
                        $ref: string;
                    };
                    recovery_strategy: {
                        $ref: string;
                    };
                    recovery_attempts: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                attempt_number: {
                                    type: string;
                                    minimum: number;
                                };
                                strategy_used: {
                                    $ref: string;
                                };
                                attempt_timestamp: {
                                    $ref: string;
                                };
                                success: {
                                    type: string;
                                };
                                duration_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                result_data: {
                                    type: string;
                                };
                                failure_reason: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    final_outcome: {
                        type: string;
                        enum: string[];
                    };
                    recovery_metadata: {
                        type: string;
                        properties: {
                            total_attempts: {
                                type: string;
                            };
                            total_duration_ms: {
                                type: string;
                            };
                            resources_consumed: {
                                type: string;
                            };
                            side_effects: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                    completed_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            error_monitoring: {
                type: string;
                properties: {
                    monitoring_id: {
                        $ref: string;
                    };
                    time_window: {
                        type: string;
                        properties: {
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
                        };
                        required: string[];
                    };
                    error_statistics: {
                        type: string;
                        properties: {
                            total_errors: {
                                type: string;
                                minimum: number;
                            };
                            errors_by_category: {
                                type: string;
                                additionalProperties: {
                                    type: string;
                                };
                            };
                            errors_by_severity: {
                                type: string;
                                additionalProperties: {
                                    type: string;
                                };
                            };
                            errors_by_module: {
                                type: string;
                                additionalProperties: {
                                    type: string;
                                };
                            };
                            error_rate: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                            recovery_success_rate: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    trending_data: {
                        type: string;
                        properties: {
                            error_trend: {
                                type: string;
                                enum: string[];
                            };
                            trend_confidence: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            predicted_next_hour: {
                                type: string;
                            };
                            anomaly_detected: {
                                type: string;
                            };
                            anomaly_description: {
                                type: string;
                            };
                        };
                    };
                    alert_thresholds: {
                        type: string;
                        properties: {
                            error_rate_threshold: {
                                type: string;
                            };
                            critical_error_threshold: {
                                type: string;
                            };
                            recovery_failure_threshold: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
            };
            error_notification: {
                type: string;
                properties: {
                    notification_id: {
                        $ref: string;
                    };
                    error_id: {
                        $ref: string;
                    };
                    notification_type: {
                        type: string;
                        enum: string[];
                    };
                    recipients: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                recipient_type: {
                                    type: string;
                                    enum: string[];
                                };
                                recipient_id: {
                                    type: string;
                                };
                                notification_method: {
                                    type: string;
                                    enum: string[];
                                };
                                priority: {
                                    type: string;
                                    enum: string[];
                                };
                            };
                            required: string[];
                        };
                    };
                    notification_content: {
                        type: string;
                        properties: {
                            subject: {
                                type: string;
                            };
                            summary: {
                                type: string;
                            };
                            detailed_message: {
                                type: string;
                            };
                            action_items: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            attachments: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        name: {
                                            type: string;
                                        };
                                        type: {
                                            type: string;
                                        };
                                        content: {
                                            type: string;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                        };
                    };
                    delivery_status: {
                        type: string;
                        properties: {
                            sent_at: {
                                $ref: string;
                            };
                            delivery_attempts: {
                                type: string;
                            };
                            successful_deliveries: {
                                type: string;
                            };
                            failed_deliveries: {
                                type: string;
                            };
                            delivery_errors: {
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
            error_info: {
                $ref: string;
            };
            error_propagation: {
                $ref: string;
            };
            error_recovery: {
                $ref: string;
            };
            error_monitoring: {
                $ref: string;
            };
            error_notification: {
                $ref: string;
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
                                error_operation: {
                                    type: string;
                                };
                                error_code: {
                                    $ref: string;
                                };
                                error_category: {
                                    $ref: string;
                                };
                                error_severity: {
                                    $ref: string;
                                };
                                source_module: {
                                    $ref: string;
                                };
                                recovery_strategy: {
                                    $ref: string;
                                };
                                error_details: {
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
                            error_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            error_data_logging: {
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
                            error_handling_api: {
                                type: string;
                                format: string;
                            };
                            exception_analysis_api: {
                                type: string;
                                format: string;
                            };
                            system_stability_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    error_metrics: {
                        type: string;
                        properties: {
                            track_error_handling: {
                                type: string;
                            };
                            track_exception_analysis: {
                                type: string;
                            };
                            track_system_stability: {
                                type: string;
                            };
                            track_recovery_success: {
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
                            error_handling_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            error_frequency_per_hour: {
                                type: string;
                                minimum: number;
                            };
                            recovery_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            system_stability_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            exception_analysis_accuracy_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_errors_count: {
                                type: string;
                                minimum: number;
                            };
                            critical_errors_count: {
                                type: string;
                                minimum: number;
                            };
                            escalation_frequency_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            average_recovery_time_ms: {
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
                                    max_error_handling_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    max_error_frequency_per_hour: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_recovery_success_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_system_stability_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_critical_errors_count: {
                                        type: string;
                                        minimum: number;
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
                                error_handling_snapshot: {
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
                            version_on_strategy_change: {
                                type: string;
                            };
                            version_on_pattern_change: {
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
                    error_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_error_data: {
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
                            index_new_errors: {
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
            error_handling_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            error_handling_details: {
                type: string;
                properties: {
                    error_category: {
                        type: string;
                    };
                    recovery_strategy: {
                        type: string;
                    };
                    escalation_level: {
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
        oneOf: {
            required: string[];
        }[];
    };
    readonly coordination: {
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
            module_type: {
                type: string;
                enum: string[];
                description: string;
            };
            coordination_type: {
                type: string;
                enum: string[];
                description: string;
            };
            priority: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
            response_status: {
                type: string;
                enum: string[];
                description: string;
            };
            error_info: {
                type: string;
                properties: {
                    error_code: {
                        type: string;
                        pattern: string;
                        description: string;
                    };
                    error_message: {
                        type: string;
                        description: string;
                    };
                    error_details: {
                        type: string;
                        description: string;
                    };
                    stack_trace: {
                        type: string;
                        items: {
                            type: string;
                        };
                        description: string;
                    };
                };
                required: string[];
            };
            coordination_request: {
                type: string;
                properties: {
                    request_id: {
                        $ref: string;
                    };
                    source_module: {
                        $ref: string;
                    };
                    target_module: {
                        $ref: string;
                    };
                    coordination_type: {
                        $ref: string;
                    };
                    operation: {
                        type: string;
                        description: string;
                    };
                    payload: {
                        type: string;
                        description: string;
                    };
                    priority: {
                        $ref: string;
                    };
                    timeout_ms: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                        description: string;
                    };
                    retry_count: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                        description: string;
                    };
                    correlation_id: {
                        $ref: string;
                        description: string;
                    };
                    context: {
                        type: string;
                        description: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            coordination_response: {
                type: string;
                properties: {
                    request_id: {
                        $ref: string;
                    };
                    response_id: {
                        $ref: string;
                    };
                    status: {
                        $ref: string;
                    };
                    result: {
                        type: string;
                        description: string;
                    };
                    error: {
                        $ref: string;
                    };
                    execution_time_ms: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    metadata: {
                        type: string;
                        description: string;
                    };
                    completed_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            coordination_notification: {
                type: string;
                properties: {
                    notification_id: {
                        $ref: string;
                    };
                    source_module: {
                        $ref: string;
                    };
                    target_modules: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        minItems: number;
                        description: string;
                    };
                    event_type: {
                        type: string;
                        description: string;
                    };
                    payload: {
                        type: string;
                        description: string;
                    };
                    priority: {
                        $ref: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                };
                required: string[];
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
            coordination_request: {
                $ref: string;
            };
            coordination_response: {
                $ref: string;
            };
            coordination_notification: {
                $ref: string;
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
                                coordination_operation: {
                                    type: string;
                                };
                                source_module: {
                                    $ref: string;
                                };
                                target_module: {
                                    $ref: string;
                                };
                                coordination_details: {
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
                            coordination_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            synchronization_logging: {
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
                            coordination_efficiency_api: {
                                type: string;
                                format: string;
                            };
                            synchronization_performance_api: {
                                type: string;
                                format: string;
                            };
                            conflict_resolution_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    coordination_metrics: {
                        type: string;
                        properties: {
                            track_coordination_efficiency: {
                                type: string;
                            };
                            track_synchronization_performance: {
                                type: string;
                            };
                            track_conflict_resolution: {
                                type: string;
                            };
                            track_state_consistency: {
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
                            coordination_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            synchronization_efficiency_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            conflict_resolution_time_ms: {
                                type: string;
                                minimum: number;
                            };
                            state_consistency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            coordination_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_coordinations_count: {
                                type: string;
                                minimum: number;
                            };
                            failed_coordinations_count: {
                                type: string;
                                minimum: number;
                            };
                            lock_contention_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            average_sync_time_ms: {
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
                                    max_coordination_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_synchronization_efficiency_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_conflict_resolution_time_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_state_consistency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_coordination_success_rate_percent: {
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
                                coordination_snapshot: {
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
                            version_on_module_change: {
                                type: string;
                            };
                            version_on_strategy_change: {
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
                    coordination_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_coordination_data: {
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
                            index_new_coordinations: {
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
            coordination_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            coordination_details: {
                type: string;
                properties: {
                    coordination_pattern: {
                        type: string;
                        enum: string[];
                    };
                    consensus_algorithm: {
                        type: string;
                        enum: string[];
                    };
                    conflict_resolution: {
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
        oneOf: {
            required: string[];
        }[];
    };
    readonly orchestration: {
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
            module_type: {
                type: string;
                enum: string[];
                description: string;
            };
            execution_mode: {
                type: string;
                enum: string[];
                description: string;
            };
            workflow_status: {
                type: string;
                enum: string[];
                description: string;
            };
            coordination_step: {
                type: string;
                properties: {
                    step_id: {
                        $ref: string;
                    };
                    step_name: {
                        type: string;
                        description: string;
                    };
                    target_module: {
                        $ref: string;
                    };
                    operation: {
                        type: string;
                        description: string;
                    };
                    input_data: {
                        type: string;
                        description: string;
                    };
                    dependencies: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    timeout_ms: {
                        type: string;
                        minimum: number;
                        default: number;
                        description: string;
                    };
                    retry_policy: {
                        type: string;
                        properties: {
                            max_retries: {
                                type: string;
                                minimum: number;
                                maximum: number;
                                default: number;
                            };
                            retry_delay_ms: {
                                type: string;
                                minimum: number;
                                default: number;
                            };
                            backoff_multiplier: {
                                type: string;
                                minimum: number;
                                default: number;
                            };
                        };
                    };
                    orchestration_details: {
                        type: string;
                        properties: {
                            orchestration_pattern: {
                                type: string;
                                enum: string[];
                            };
                            resource_allocation: {
                                type: string;
                                enum: string[];
                            };
                            failure_handling: {
                                type: string;
                                enum: string[];
                            };
                        };
                    };
                };
                required: string[];
            };
            coordination_plan: {
                type: string;
                properties: {
                    plan_id: {
                        $ref: string;
                    };
                    plan_name: {
                        type: string;
                        description: string;
                    };
                    steps: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        minItems: number;
                        description: string;
                    };
                    execution_mode: {
                        $ref: string;
                    };
                    global_timeout_ms: {
                        type: string;
                        minimum: number;
                        default: number;
                        description: string;
                    };
                    rollback_strategy: {
                        type: string;
                        enum: string[];
                        default: string;
                        description: string;
                    };
                };
                required: string[];
            };
            performance_requirements: {
                type: string;
                properties: {
                    max_execution_time_ms: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    max_memory_mb: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    min_success_rate: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                        description: string;
                    };
                    max_concurrent_steps: {
                        type: string;
                        minimum: number;
                        default: number;
                        description: string;
                    };
                };
            };
            orchestration_request: {
                type: string;
                properties: {
                    workflow_id: {
                        $ref: string;
                    };
                    workflow_name: {
                        type: string;
                        description: string;
                    };
                    coordination_plan: {
                        $ref: string;
                    };
                    global_context: {
                        type: string;
                        description: string;
                    };
                    performance_requirements: {
                        $ref: string;
                    };
                    priority: {
                        type: string;
                        enum: string[];
                        default: string;
                    };
                    created_by: {
                        type: string;
                        description: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            orchestration_response: {
                type: string;
                properties: {
                    workflow_id: {
                        $ref: string;
                    };
                    execution_id: {
                        $ref: string;
                    };
                    status: {
                        $ref: string;
                    };
                    progress: {
                        type: string;
                        properties: {
                            completed_steps: {
                                type: string;
                                minimum: number;
                            };
                            total_steps: {
                                type: string;
                                minimum: number;
                            };
                            current_step: {
                                $ref: string;
                            };
                            completion_percentage: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                        required: string[];
                    };
                    results: {
                        type: string;
                        description: string;
                    };
                    execution_metrics: {
                        type: string;
                        properties: {
                            start_time: {
                                $ref: string;
                            };
                            end_time: {
                                $ref: string;
                            };
                            total_execution_time_ms: {
                                type: string;
                                minimum: number;
                            };
                            memory_usage_mb: {
                                type: string;
                                minimum: number;
                            };
                            success_rate: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                    error_info: {
                        type: string;
                        properties: {
                            error_code: {
                                type: string;
                                pattern: string;
                            };
                            error_message: {
                                type: string;
                            };
                            failed_step: {
                                $ref: string;
                            };
                            error_details: {
                                type: string;
                            };
                        };
                    };
                    updated_at: {
                        $ref: string;
                    };
                };
                required: string[];
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
            orchestration_request: {
                $ref: string;
            };
            orchestration_response: {
                $ref: string;
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
                                orchestration_operation: {
                                    type: string;
                                };
                                workflow_id: {
                                    $ref: string;
                                };
                                step_id: {
                                    $ref: string;
                                };
                                execution_details: {
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
                            orchestration_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            workflow_logging: {
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
                            workflow_execution_api: {
                                type: string;
                                format: string;
                            };
                            resource_utilization_api: {
                                type: string;
                                format: string;
                            };
                            orchestration_efficiency_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    orchestration_metrics: {
                        type: string;
                        properties: {
                            track_workflow_execution: {
                                type: string;
                            };
                            track_resource_utilization: {
                                type: string;
                            };
                            track_orchestration_efficiency: {
                                type: string;
                            };
                            track_dependency_resolution: {
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
                            workflow_execution_time_ms: {
                                type: string;
                                minimum: number;
                            };
                            orchestration_efficiency_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            resource_utilization_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            step_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            dependency_resolution_time_ms: {
                                type: string;
                                minimum: number;
                            };
                            active_workflows_count: {
                                type: string;
                                minimum: number;
                            };
                            failed_workflows_count: {
                                type: string;
                                minimum: number;
                            };
                            rollback_frequency_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            average_step_execution_time_ms: {
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
                                    max_workflow_execution_time_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_orchestration_efficiency_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_resource_utilization_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_step_success_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_rollback_frequency_percent: {
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
                                orchestration_snapshot: {
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
                            version_on_workflow_change: {
                                type: string;
                            };
                            version_on_plan_change: {
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
                    orchestration_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_workflow_data: {
                                type: string;
                            };
                            index_execution_metrics: {
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
            orchestration_details: {
                type: string;
                properties: {
                    orchestration_pattern: {
                        type: string;
                        enum: string[];
                    };
                    resource_allocation: {
                        type: string;
                        enum: string[];
                    };
                    failure_handling: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            orchestration_operation: {
                type: string;
                enum: string[];
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
        oneOf: {
            required: string[];
        }[];
    };
    readonly stateSync: {
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
            module_type: {
                type: string;
                enum: string[];
                description: string;
            };
            sync_strategy: {
                type: string;
                enum: string[];
                description: string;
            };
            consistency_level: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
            conflict_resolution: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
            state_snapshot: {
                type: string;
                properties: {
                    snapshot_id: {
                        $ref: string;
                    };
                    module: {
                        $ref: string;
                    };
                    version: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    state_data: {
                        type: string;
                        description: string;
                    };
                    checksum: {
                        type: string;
                        description: string;
                    };
                    metadata: {
                        type: string;
                        properties: {
                            size_bytes: {
                                type: string;
                            };
                            compression: {
                                type: string;
                            };
                            encoding: {
                                type: string;
                            };
                        };
                    };
                    created_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            state_delta: {
                type: string;
                properties: {
                    delta_id: {
                        $ref: string;
                    };
                    base_version: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    target_version: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    operations: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                operation_type: {
                                    type: string;
                                    enum: string[];
                                };
                                path: {
                                    type: string;
                                    description: string;
                                };
                                old_value: {
                                    description: string;
                                };
                                new_value: {
                                    description: string;
                                };
                                timestamp: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    checksum: {
                        type: string;
                        description: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            state_sync_request: {
                type: string;
                properties: {
                    sync_id: {
                        $ref: string;
                    };
                    source_module: {
                        $ref: string;
                    };
                    target_modules: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        minItems: number;
                        description: string;
                    };
                    sync_strategy: {
                        $ref: string;
                    };
                    consistency_level: {
                        $ref: string;
                    };
                    sync_scope: {
                        type: string;
                        properties: {
                            include_paths: {
                                type: string;
                                items: {
                                    type: string;
                                };
                                description: string;
                            };
                            exclude_paths: {
                                type: string;
                                items: {
                                    type: string;
                                };
                                description: string;
                            };
                            filter_conditions: {
                                type: string;
                                description: string;
                            };
                        };
                    };
                    sync_options: {
                        type: string;
                        properties: {
                            use_delta: {
                                type: string;
                                default: boolean;
                                description: string;
                            };
                            compression_enabled: {
                                type: string;
                                default: boolean;
                            };
                            batch_size: {
                                type: string;
                                minimum: number;
                                default: number;
                            };
                            timeout_ms: {
                                type: string;
                                minimum: number;
                                default: number;
                            };
                            retry_count: {
                                type: string;
                                minimum: number;
                                default: number;
                            };
                        };
                    };
                    state_snapshot: {
                        $ref: string;
                    };
                    state_delta: {
                        $ref: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            state_sync_response: {
                type: string;
                properties: {
                    sync_id: {
                        $ref: string;
                    };
                    response_id: {
                        $ref: string;
                    };
                    target_module: {
                        $ref: string;
                    };
                    sync_status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    applied_version: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    conflicts: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                path: {
                                    type: string;
                                };
                                conflict_type: {
                                    type: string;
                                    enum: string[];
                                };
                                local_value: {
                                    description: string;
                                };
                                remote_value: {
                                    description: string;
                                };
                                resolution: {
                                    $ref: string;
                                };
                                resolved_value: {
                                    description: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    sync_metrics: {
                        type: string;
                        properties: {
                            records_processed: {
                                type: string;
                            };
                            records_applied: {
                                type: string;
                            };
                            records_skipped: {
                                type: string;
                            };
                            processing_time_ms: {
                                type: string;
                            };
                            data_size_bytes: {
                                type: string;
                            };
                        };
                    };
                    error_info: {
                        type: string;
                        properties: {
                            error_code: {
                                type: string;
                                pattern: string;
                            };
                            error_message: {
                                type: string;
                            };
                            error_details: {
                                type: string;
                            };
                        };
                    };
                    next_sync_version: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    completed_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            state_sync_subscription: {
                type: string;
                properties: {
                    subscription_id: {
                        $ref: string;
                    };
                    subscriber_module: {
                        $ref: string;
                    };
                    source_modules: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    sync_patterns: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                path_pattern: {
                                    type: string;
                                    description: string;
                                };
                                sync_strategy: {
                                    $ref: string;
                                };
                                sync_frequency_ms: {
                                    type: string;
                                    minimum: number;
                                    description: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    active: {
                        type: string;
                        default: boolean;
                    };
                    created_at: {
                        $ref: string;
                    };
                    updated_at: {
                        $ref: string;
                    };
                };
                required: string[];
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
            state_sync_request: {
                $ref: string;
            };
            state_sync_response: {
                $ref: string;
            };
            state_sync_subscription: {
                $ref: string;
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
                                state_sync_operation: {
                                    type: string;
                                };
                                source_module: {
                                    $ref: string;
                                };
                                target_module: {
                                    $ref: string;
                                };
                                sync_details: {
                                    type: string;
                                };
                                conflict_details: {
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
                            state_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            state_change_logging: {
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
                            sync_performance_api: {
                                type: string;
                                format: string;
                            };
                            consistency_analysis_api: {
                                type: string;
                                format: string;
                            };
                            conflict_resolution_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    state_sync_metrics: {
                        type: string;
                        properties: {
                            track_sync_performance: {
                                type: string;
                            };
                            track_consistency_analysis: {
                                type: string;
                            };
                            track_conflict_resolution: {
                                type: string;
                            };
                            track_state_integrity: {
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
                            sync_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            consistency_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            conflict_resolution_time_ms: {
                                type: string;
                                minimum: number;
                            };
                            sync_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            state_integrity_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_syncs_count: {
                                type: string;
                                minimum: number;
                            };
                            failed_syncs_count: {
                                type: string;
                                minimum: number;
                            };
                            rollback_frequency_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            average_sync_size_bytes: {
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
                                    max_sync_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_consistency_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_conflict_resolution_time_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_sync_success_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_state_integrity_score: {
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
                                state_sync_snapshot: {
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
                            version_on_pattern_change: {
                                type: string;
                            };
                            version_on_subscription_change: {
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
                    state_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_state_data: {
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
                            index_new_syncs: {
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
            state_sync_details: {
                type: string;
                properties: {
                    sync_strategy: {
                        type: string;
                        enum: string[];
                    };
                    conflict_resolution: {
                        type: string;
                        enum: string[];
                    };
                    consistency_level: {
                        type: string;
                        enum: string[];
                    };
                };
                description: string;
            };
            state_sync_operation: {
                type: string;
                enum: string[];
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
        oneOf: {
            required: string[];
        }[];
    };
    readonly transaction: {
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
            module_type: {
                type: string;
                enum: string[];
                description: string;
            };
            isolation_level: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
            transaction_state: {
                type: string;
                enum: string[];
                description: string;
            };
            rollback_strategy: {
                type: string;
                enum: string[];
                default: string;
                description: string;
            };
            participant_info: {
                type: string;
                properties: {
                    module: {
                        $ref: string;
                    };
                    participant_id: {
                        $ref: string;
                    };
                    resource_locks: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                resource_id: {
                                    type: string;
                                };
                                lock_type: {
                                    type: string;
                                    enum: string[];
                                };
                                acquired_at: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    state: {
                        $ref: string;
                    };
                    last_heartbeat: {
                        $ref: string;
                    };
                    compensation_data: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            };
            transaction_context: {
                type: string;
                properties: {
                    transaction_id: {
                        $ref: string;
                    };
                    parent_transaction_id: {
                        $ref: string;
                        description: string;
                    };
                    isolation_level: {
                        $ref: string;
                    };
                    participating_modules: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        minItems: number;
                        description: string;
                    };
                    participants: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    transaction_state: {
                        $ref: string;
                    };
                    timeout_ms: {
                        type: string;
                        minimum: number;
                        maximum: number;
                        default: number;
                        description: string;
                    };
                    rollback_strategy: {
                        $ref: string;
                    };
                    coordinator_module: {
                        $ref: string;
                        description: string;
                    };
                    metadata: {
                        type: string;
                        description: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                    updated_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            transaction_operation: {
                type: string;
                properties: {
                    operation_id: {
                        $ref: string;
                    };
                    transaction_id: {
                        $ref: string;
                    };
                    operation_type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    source_module: {
                        $ref: string;
                    };
                    target_module: {
                        $ref: string;
                    };
                    operation_data: {
                        type: string;
                        description: string;
                    };
                    timeout_ms: {
                        type: string;
                        minimum: number;
                        default: number;
                        description: string;
                    };
                    created_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            transaction_result: {
                type: string;
                properties: {
                    operation_id: {
                        $ref: string;
                    };
                    transaction_id: {
                        $ref: string;
                    };
                    result_status: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    result_data: {
                        type: string;
                        description: string;
                    };
                    error_info: {
                        type: string;
                        properties: {
                            error_code: {
                                type: string;
                                pattern: string;
                            };
                            error_message: {
                                type: string;
                            };
                            error_details: {
                                type: string;
                            };
                        };
                    };
                    execution_time_ms: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    resource_usage: {
                        type: string;
                        properties: {
                            memory_mb: {
                                type: string;
                            };
                            cpu_time_ms: {
                                type: string;
                            };
                            io_operations: {
                                type: string;
                            };
                        };
                    };
                    completed_at: {
                        $ref: string;
                    };
                };
                required: string[];
            };
            compensation_action: {
                type: string;
                properties: {
                    action_id: {
                        $ref: string;
                    };
                    transaction_id: {
                        $ref: string;
                    };
                    target_module: {
                        $ref: string;
                    };
                    compensation_operation: {
                        type: string;
                        description: string;
                    };
                    compensation_data: {
                        type: string;
                        description: string;
                    };
                    execution_order: {
                        type: string;
                        minimum: number;
                        description: string;
                    };
                    timeout_ms: {
                        type: string;
                        minimum: number;
                        default: number;
                    };
                    created_at: {
                        $ref: string;
                    };
                };
                required: string[];
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
            transaction_context: {
                $ref: string;
            };
            transaction_operation: {
                $ref: string;
            };
            transaction_result: {
                $ref: string;
            };
            compensation_action: {
                $ref: string;
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
                                transaction_operation: {
                                    type: string;
                                };
                                transaction_id: {
                                    $ref: string;
                                };
                                participant_modules: {
                                    type: string;
                                    items: {
                                        $ref: string;
                                    };
                                };
                                isolation_level: {
                                    $ref: string;
                                };
                                transaction_details: {
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
                            transaction_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            transaction_data_logging: {
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
                            transaction_performance_api: {
                                type: string;
                                format: string;
                            };
                            deadlock_detection_api: {
                                type: string;
                                format: string;
                            };
                            acid_compliance_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    transaction_metrics: {
                        type: string;
                        properties: {
                            track_transaction_performance: {
                                type: string;
                            };
                            track_deadlock_detection: {
                                type: string;
                            };
                            track_acid_compliance: {
                                type: string;
                            };
                            track_lock_contention: {
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
                            transaction_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            transaction_throughput_per_second: {
                                type: string;
                                minimum: number;
                            };
                            deadlock_frequency_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            acid_compliance_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            lock_contention_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_transactions_count: {
                                type: string;
                                minimum: number;
                            };
                            failed_transactions_count: {
                                type: string;
                                minimum: number;
                            };
                            rollback_frequency_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            average_lock_wait_time_ms: {
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
                                    max_transaction_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_transaction_throughput_per_second: {
                                        type: string;
                                        minimum: number;
                                    };
                                    max_deadlock_frequency_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_acid_compliance_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_lock_contention_rate_percent: {
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
                                transaction_snapshot: {
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
                            version_on_isolation_change: {
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
                                    $ref: string;
                                };
                                last_updated: {
                                    $ref: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    transaction_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_transaction_data: {
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
                            index_new_transactions: {
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
            transaction_details: {
                type: string;
                properties: {
                    isolation_level: {
                        type: string;
                        enum: string[];
                    };
                    timeout_seconds: {
                        type: string;
                        minimum: number;
                        maximum: number;
                    };
                    rollback_strategy: {
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
        oneOf: {
            required: string[];
        }[];
    };
    readonly protocolVersion: {
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
            compatibility_level: {
                type: string;
                enum: string[];
                description: string;
            };
            module_version_info: {
                type: string;
                properties: {
                    module_name: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    current_version: {
                        $ref: string;
                    };
                    supported_versions: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        description: string;
                    };
                    deprecated_versions: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version: {
                                    $ref: string;
                                };
                                deprecation_date: {
                                    $ref: string;
                                };
                                removal_date: {
                                    $ref: string;
                                };
                                migration_guide: {
                                    type: string;
                                    description: string;
                                };
                                protocol_version_operation: {
                                    type: string;
                                    enum: string[];
                                };
                                protocol_version_details: {
                                    type: string;
                                    properties: {
                                        compatibility_mode: {
                                            type: string;
                                            enum: string[];
                                        };
                                        migration_strategy: {
                                            type: string;
                                        };
                                        rollback_support: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                    breaking_changes: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                version: {
                                    $ref: string;
                                };
                                change_description: {
                                    type: string;
                                };
                                impact_level: {
                                    type: string;
                                    enum: string[];
                                };
                                migration_required: {
                                    type: string;
                                };
                                affected_apis: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            compatibility_matrix: {
                type: string;
                properties: {
                    matrix_version: {
                        $ref: string;
                    };
                    compatibility_rules: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                source_module: {
                                    type: string;
                                };
                                source_version: {
                                    $ref: string;
                                };
                                target_module: {
                                    type: string;
                                };
                                target_version_range: {
                                    type: string;
                                    description: string;
                                };
                                compatibility_level: {
                                    $ref: string;
                                };
                                notes: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    global_constraints: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                constraint_type: {
                                    type: string;
                                    enum: string[];
                                };
                                modules: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                version_constraint: {
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
            upgrade_path: {
                type: string;
                properties: {
                    path_id: {
                        $ref: string;
                    };
                    from_version: {
                        $ref: string;
                    };
                    to_version: {
                        $ref: string;
                    };
                    upgrade_steps: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                step_number: {
                                    type: string;
                                    minimum: number;
                                };
                                step_description: {
                                    type: string;
                                };
                                step_type: {
                                    type: string;
                                    enum: string[];
                                };
                                affected_modules: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                automation_script: {
                                    type: string;
                                    description: string;
                                };
                                manual_steps: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                validation_criteria: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                                rollback_procedure: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                    estimated_duration_minutes: {
                        type: string;
                        minimum: number;
                    };
                    risk_level: {
                        type: string;
                        enum: string[];
                    };
                    prerequisites: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    post_upgrade_validation: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
                required: string[];
            };
            deprecation_schedule: {
                type: string;
                properties: {
                    schedule_version: {
                        $ref: string;
                    };
                    deprecation_policies: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                policy_name: {
                                    type: string;
                                };
                                deprecation_period_months: {
                                    type: string;
                                    minimum: number;
                                };
                                notification_schedule: {
                                    type: string;
                                    items: {
                                        type: string;
                                        properties: {
                                            notification_type: {
                                                type: string;
                                                enum: string[];
                                            };
                                            months_before_removal: {
                                                type: string;
                                                minimum: number;
                                            };
                                        };
                                        required: string[];
                                    };
                                };
                                affected_features: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                };
                            };
                            required: string[];
                        };
                    };
                    scheduled_deprecations: {
                        type: string;
                        items: {
                            type: string;
                            properties: {
                                item_type: {
                                    type: string;
                                    enum: string[];
                                };
                                item_identifier: {
                                    type: string;
                                };
                                deprecation_date: {
                                    $ref: string;
                                };
                                removal_date: {
                                    $ref: string;
                                };
                                replacement: {
                                    type: string;
                                };
                                migration_guide: {
                                    type: string;
                                };
                                impact_assessment: {
                                    type: string;
                                };
                            };
                            required: string[];
                        };
                    };
                };
                required: string[];
            };
            protocol_version_info: {
                type: string;
                properties: {
                    protocol_suite_version: {
                        $ref: string;
                    };
                    protocol_suite_name: {
                        type: string;
                        const: string;
                    };
                    release_date: {
                        $ref: string;
                    };
                    module_versions: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                        minItems: number;
                    };
                    compatibility_matrix: {
                        $ref: string;
                    };
                    upgrade_paths: {
                        type: string;
                        items: {
                            $ref: string;
                        };
                    };
                    deprecation_schedule: {
                        $ref: string;
                    };
                    release_notes: {
                        type: string;
                        properties: {
                            new_features: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            improvements: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            bug_fixes: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            breaking_changes: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            security_updates: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                    };
                    metadata: {
                        type: string;
                        properties: {
                            maintainers: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            repository_url: {
                                type: string;
                                format: string;
                            };
                            documentation_url: {
                                type: string;
                                format: string;
                            };
                            support_contact: {
                                type: string;
                            };
                            license: {
                                type: string;
                            };
                        };
                    };
                };
                required: string[];
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
            protocol_version_info: {
                $ref: string;
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
                                version_operation: {
                                    type: string;
                                };
                                source_version: {
                                    $ref: string;
                                };
                                target_version: {
                                    $ref: string;
                                };
                                module_name: {
                                    type: string;
                                };
                                compatibility_result: {
                                    $ref: string;
                                };
                                version_details: {
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
                            version_audit_level: {
                                type: string;
                                enum: string[];
                            };
                            version_change_logging: {
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
                            version_management_api: {
                                type: string;
                                format: string;
                            };
                            compatibility_analysis_api: {
                                type: string;
                                format: string;
                            };
                            protocol_evolution_api: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                    version_metrics: {
                        type: string;
                        properties: {
                            track_version_management: {
                                type: string;
                            };
                            track_compatibility_analysis: {
                                type: string;
                            };
                            track_protocol_evolution: {
                                type: string;
                            };
                            track_migration_progress: {
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
                            version_check_latency_ms: {
                                type: string;
                                minimum: number;
                            };
                            compatibility_check_success_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            migration_completion_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            protocol_evolution_score: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            version_adoption_rate_percent: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            active_versions_count: {
                                type: string;
                                minimum: number;
                            };
                            deprecated_versions_count: {
                                type: string;
                                minimum: number;
                            };
                            compatibility_conflicts_count: {
                                type: string;
                                minimum: number;
                            };
                            average_migration_time_hours: {
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
                                    max_version_check_latency_ms: {
                                        type: string;
                                        minimum: number;
                                    };
                                    min_compatibility_check_success_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_migration_completion_rate_percent: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    min_protocol_evolution_score: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                    max_compatibility_conflicts_count: {
                                        type: string;
                                        minimum: number;
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
                                protocol_snapshot: {
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
                            version_on_protocol_change: {
                                type: string;
                            };
                            version_on_compatibility_change: {
                                type: string;
                            };
                            version_on_deprecation_change: {
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
                    version_indexing: {
                        type: string;
                        properties: {
                            enabled: {
                                type: string;
                            };
                            index_version_data: {
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
                            index_new_versions: {
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
            protocol_version_operation: {
                type: string;
                enum: string[];
                description: string;
            };
            protocol_version_details: {
                type: string;
                properties: {
                    compatibility_mode: {
                        type: string;
                        enum: string[];
                    };
                    migration_strategy: {
                        type: string;
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
    };
};
export type CrossCuttingConcernSchemaName = keyof typeof CrossCuttingConcernsSchemaMap;
export declare const SecurityInfrastructure: readonly ["security"];
export declare const PerformanceInfrastructure: readonly ["performance"];
export declare const EventsInfrastructure: readonly ["eventBus", "errorHandling"];
export declare const StorageInfrastructure: readonly ["stateSync", "transaction"];
export declare const CoordinationInfrastructure: readonly ["coordination", "orchestration"];
export declare const ProtocolManagementInfrastructure: readonly ["protocolVersion"];
export declare const AllCrossCuttingConcernsSchemas: ({
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
        module_type: {
            type: string;
            enum: string[];
            description: string;
        };
        security_level: {
            type: string;
            enum: string[];
            description: string;
        };
        authentication_method: {
            type: string;
            enum: string[];
            description: string;
        };
        encryption_algorithm: {
            type: string;
            enum: string[];
            description: string;
        };
        user_identity: {
            type: string;
            properties: {
                user_id: {
                    type: string;
                };
                username: {
                    type: string;
                };
                email: {
                    type: string;
                    format: string;
                };
                display_name: {
                    type: string;
                };
                user_type: {
                    type: string;
                    enum: string[];
                };
                organization: {
                    type: string;
                };
                department: {
                    type: string;
                };
                roles: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                groups: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                attributes: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        permission: {
            type: string;
            properties: {
                permission_id: {
                    $ref: string;
                };
                resource_type: {
                    type: string;
                    enum: string[];
                };
                resource_identifier: {
                    type: string;
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
                        time_restrictions: {
                            type: string;
                            properties: {
                                start_time: {
                                    $ref: string;
                                };
                                end_time: {
                                    $ref: string;
                                };
                                allowed_hours: {
                                    type: string;
                                    items: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                                allowed_days: {
                                    type: string;
                                    items: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                        };
                        ip_restrictions: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        context_requirements: {
                            type: string;
                            description: string;
                        };
                    };
                };
                granted_at: {
                    $ref: string;
                };
                expires_at: {
                    $ref: string;
                };
                granted_by: {
                    type: string;
                };
            };
            required: string[];
        };
        encryption_info: {
            type: string;
            properties: {
                algorithm: {
                    $ref: string;
                };
                key_id: {
                    type: string;
                };
                key_version: {
                    type: string;
                };
                initialization_vector: {
                    type: string;
                };
                key_derivation: {
                    type: string;
                    properties: {
                        method: {
                            type: string;
                            enum: string[];
                        };
                        iterations: {
                            type: string;
                            minimum: number;
                        };
                        salt: {
                            type: string;
                        };
                    };
                };
                signature: {
                    type: string;
                };
                certificate_chain: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
            };
            required: string[];
        };
        audit_entry: {
            type: string;
            properties: {
                audit_id: {
                    $ref: string;
                };
                event_type: {
                    type: string;
                    enum: string[];
                };
                user_identity: {
                    $ref: string;
                };
                resource_accessed: {
                    type: string;
                };
                action_performed: {
                    type: string;
                };
                result: {
                    type: string;
                    enum: string[];
                };
                source_ip: {
                    type: string;
                };
                user_agent: {
                    type: string;
                };
                session_id: {
                    $ref: string;
                };
                request_id: {
                    $ref: string;
                };
                additional_data: {
                    type: string;
                };
                risk_score: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                timestamp: {
                    $ref: string;
                };
            };
            required: string[];
        };
        security_context: {
            type: string;
            properties: {
                context_id: {
                    $ref: string;
                };
                session_id: {
                    $ref: string;
                };
                user_identity: {
                    $ref: string;
                };
                authentication_token: {
                    type: string;
                    properties: {
                        token_type: {
                            type: string;
                            enum: string[];
                        };
                        token_value: {
                            type: string;
                        };
                        issued_at: {
                            $ref: string;
                        };
                        expires_at: {
                            $ref: string;
                        };
                        issuer: {
                            type: string;
                        };
                        audience: {
                            type: string;
                        };
                        scopes: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                    required: string[];
                };
                permissions: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                };
                security_level: {
                    $ref: string;
                };
                encryption_info: {
                    $ref: string;
                };
                audit_trail: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                };
                security_policies: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            policy_id: {
                                type: string;
                            };
                            policy_name: {
                                type: string;
                            };
                            policy_version: {
                                type: string;
                            };
                            enforcement_level: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                threat_indicators: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            indicator_type: {
                                type: string;
                                enum: string[];
                            };
                            severity: {
                                type: string;
                                enum: string[];
                            };
                            description: {
                                type: string;
                            };
                            detected_at: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                created_at: {
                    $ref: string;
                };
                updated_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        security_event: {
            type: string;
            properties: {
                event_id: {
                    $ref: string;
                };
                event_type: {
                    type: string;
                    enum: string[];
                };
                severity: {
                    type: string;
                    enum: string[];
                };
                source_module: {
                    $ref: string;
                };
                affected_resources: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                security_context: {
                    $ref: string;
                };
                event_details: {
                    type: string;
                    description: string;
                };
                mitigation_actions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            action_type: {
                                type: string;
                                enum: string[];
                            };
                            action_description: {
                                type: string;
                            };
                            automated: {
                                type: string;
                            };
                            executed_at: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                investigation_status: {
                    type: string;
                    enum: string[];
                };
                occurred_at: {
                    $ref: string;
                };
                resolved_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        security_policy: {
            type: string;
            properties: {
                policy_id: {
                    $ref: string;
                };
                policy_name: {
                    type: string;
                };
                policy_version: {
                    type: string;
                };
                policy_type: {
                    type: string;
                    enum: string[];
                };
                target_modules: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                };
                policy_rules: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            rule_id: {
                                type: string;
                            };
                            rule_name: {
                                type: string;
                            };
                            condition: {
                                type: string;
                            };
                            action: {
                                type: string;
                                enum: string[];
                            };
                            parameters: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                enforcement_level: {
                    type: string;
                    enum: string[];
                };
                compliance_frameworks: {
                    type: string;
                    items: {
                        type: string;
                        enum: string[];
                    };
                };
                effective_date: {
                    $ref: string;
                };
                expiration_date: {
                    $ref: string;
                };
                created_by: {
                    type: string;
                };
                approved_by: {
                    type: string;
                };
                created_at: {
                    $ref: string;
                };
                updated_at: {
                    $ref: string;
                };
            };
            required: string[];
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
        security_context: {
            $ref: string;
        };
        security_event: {
            $ref: string;
        };
        security_policy: {
            $ref: string;
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
                            security_operation: {
                                type: string;
                            };
                            security_level: {
                                $ref: string;
                            };
                            authentication_method: {
                                $ref: string;
                            };
                            encryption_algorithm: {
                                $ref: string;
                            };
                            source_module: {
                                $ref: string;
                            };
                            target_resource: {
                                type: string;
                            };
                            security_details: {
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
                        security_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        security_data_logging: {
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
                        security_monitoring_api: {
                            type: string;
                            format: string;
                        };
                        threat_analysis_api: {
                            type: string;
                            format: string;
                        };
                        compliance_monitoring_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                security_metrics: {
                    type: string;
                    properties: {
                        track_security_monitoring: {
                            type: string;
                        };
                        track_threat_analysis: {
                            type: string;
                        };
                        track_compliance_monitoring: {
                            type: string;
                        };
                        track_access_control: {
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
                        security_check_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        authentication_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        authorization_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        threat_detection_accuracy_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        compliance_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_sessions_count: {
                            type: string;
                            minimum: number;
                        };
                        security_violations_count: {
                            type: string;
                            minimum: number;
                        };
                        failed_authentications_count: {
                            type: string;
                            minimum: number;
                        };
                        average_encryption_time_ms: {
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
                                max_security_check_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_authentication_success_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_authorization_success_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_threat_detection_accuracy_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_security_violations_count: {
                                    type: string;
                                    minimum: number;
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
                            security_snapshot: {
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
                        version_on_policy_change: {
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
                security_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_security_data: {
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
                        index_new_security_events: {
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
        security_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        security_details: {
            type: string;
            properties: {
                security_level: {
                    type: string;
                    enum: string[];
                };
                encryption_algorithm: {
                    type: string;
                    enum: string[];
                };
                authentication_method: {
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
    oneOf: {
        required: string[];
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
        module_type: {
            type: string;
            enum: string[];
            description: string;
        };
        metric_type: {
            type: string;
            enum: string[];
            description: string;
        };
        alert_level: {
            type: string;
            enum: string[];
            description: string;
        };
        sla_status: {
            type: string;
            enum: string[];
            description: string;
        };
        performance_baseline: {
            type: string;
            properties: {
                baseline_id: {
                    $ref: string;
                };
                baseline_name: {
                    type: string;
                };
                module_name: {
                    $ref: string;
                };
                baseline_period: {
                    type: string;
                    properties: {
                        start_time: {
                            $ref: string;
                        };
                        end_time: {
                            $ref: string;
                        };
                        duration_hours: {
                            type: string;
                            minimum: number;
                        };
                    };
                    required: string[];
                };
                baseline_metrics: {
                    type: string;
                    properties: {
                        response_time_p50: {
                            type: string;
                        };
                        response_time_p95: {
                            type: string;
                        };
                        response_time_p99: {
                            type: string;
                        };
                        throughput_avg: {
                            type: string;
                        };
                        throughput_peak: {
                            type: string;
                        };
                        error_rate: {
                            type: string;
                        };
                        cpu_usage_avg: {
                            type: string;
                        };
                        memory_usage_avg: {
                            type: string;
                        };
                        disk_io_avg: {
                            type: string;
                        };
                        network_io_avg: {
                            type: string;
                        };
                    };
                };
                confidence_level: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
                sample_size: {
                    type: string;
                    minimum: number;
                };
                created_at: {
                    $ref: string;
                };
                created_by: {
                    type: string;
                };
            };
            required: string[];
        };
        sla_definition: {
            type: string;
            properties: {
                sla_id: {
                    $ref: string;
                };
                sla_name: {
                    type: string;
                };
                module_name: {
                    $ref: string;
                };
                sla_type: {
                    type: string;
                    enum: string[];
                };
                target_value: {
                    type: string;
                };
                target_unit: {
                    type: string;
                };
                measurement_period: {
                    type: string;
                    enum: string[];
                };
                calculation_method: {
                    type: string;
                    enum: string[];
                };
                violation_threshold: {
                    type: string;
                    properties: {
                        warning_percentage: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        critical_percentage: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        consecutive_violations: {
                            type: string;
                            minimum: number;
                        };
                    };
                };
                business_impact: {
                    type: string;
                    enum: string[];
                };
                penalty_clauses: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            violation_level: {
                                type: string;
                            };
                            penalty_type: {
                                type: string;
                                enum: string[];
                            };
                            penalty_amount: {
                                type: string;
                            };
                            penalty_description: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                effective_date: {
                    $ref: string;
                };
                expiration_date: {
                    $ref: string;
                };
                created_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        performance_alert: {
            type: string;
            properties: {
                alert_id: {
                    $ref: string;
                };
                alert_name: {
                    type: string;
                };
                alert_type: {
                    type: string;
                    enum: string[];
                };
                alert_level: {
                    $ref: string;
                };
                module_name: {
                    $ref: string;
                };
                metric_name: {
                    type: string;
                };
                current_value: {
                    type: string;
                };
                threshold_value: {
                    type: string;
                };
                deviation_percentage: {
                    type: string;
                };
                alert_condition: {
                    type: string;
                };
                alert_description: {
                    type: string;
                };
                affected_operations: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                impact_assessment: {
                    type: string;
                    properties: {
                        user_impact: {
                            type: string;
                            enum: string[];
                        };
                        business_impact: {
                            type: string;
                            enum: string[];
                        };
                        estimated_affected_users: {
                            type: string;
                        };
                        estimated_revenue_impact: {
                            type: string;
                        };
                    };
                };
                recommended_actions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            action_type: {
                                type: string;
                                enum: string[];
                            };
                            action_description: {
                                type: string;
                            };
                            priority: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            estimated_time_minutes: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                alert_status: {
                    type: string;
                    enum: string[];
                };
                triggered_at: {
                    $ref: string;
                };
                acknowledged_at: {
                    $ref: string;
                };
                resolved_at: {
                    $ref: string;
                };
                acknowledged_by: {
                    type: string;
                };
                resolved_by: {
                    type: string;
                };
            };
            required: string[];
        };
        performance_report: {
            type: string;
            properties: {
                report_id: {
                    $ref: string;
                };
                report_name: {
                    type: string;
                };
                report_type: {
                    type: string;
                    enum: string[];
                };
                report_period: {
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
                modules_covered: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                };
                performance_summary: {
                    type: string;
                    properties: {
                        overall_availability: {
                            type: string;
                        };
                        average_response_time: {
                            type: string;
                        };
                        peak_throughput: {
                            type: string;
                        };
                        total_requests: {
                            type: string;
                        };
                        total_errors: {
                            type: string;
                        };
                        error_rate: {
                            type: string;
                        };
                        sla_compliance_rate: {
                            type: string;
                        };
                    };
                };
                module_performance: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            module_name: {
                                $ref: string;
                            };
                            availability: {
                                type: string;
                            };
                            response_time_p95: {
                                type: string;
                            };
                            throughput_avg: {
                                type: string;
                            };
                            error_rate: {
                                type: string;
                            };
                            sla_status: {
                                $ref: string;
                            };
                            key_incidents: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                        required: string[];
                    };
                };
                sla_compliance: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            sla_name: {
                                type: string;
                            };
                            target_value: {
                                type: string;
                            };
                            actual_value: {
                                type: string;
                            };
                            compliance_percentage: {
                                type: string;
                            };
                            status: {
                                $ref: string;
                            };
                            violations_count: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                trends_analysis: {
                    type: string;
                    properties: {
                        performance_trend: {
                            type: string;
                            enum: string[];
                        };
                        trend_confidence: {
                            type: string;
                        };
                        key_observations: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        recommendations: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
                generated_at: {
                    $ref: string;
                };
                generated_by: {
                    type: string;
                };
                report_format: {
                    type: string;
                    enum: string[];
                };
            };
            required: string[];
        };
        capacity_planning: {
            type: string;
            properties: {
                planning_id: {
                    $ref: string;
                };
                planning_name: {
                    type: string;
                };
                module_name: {
                    $ref: string;
                };
                current_capacity: {
                    type: string;
                    properties: {
                        max_throughput: {
                            type: string;
                        };
                        max_concurrent_users: {
                            type: string;
                        };
                        cpu_cores: {
                            type: string;
                        };
                        memory_gb: {
                            type: string;
                        };
                        storage_gb: {
                            type: string;
                        };
                        network_bandwidth_mbps: {
                            type: string;
                        };
                    };
                };
                usage_patterns: {
                    type: string;
                    properties: {
                        peak_usage_times: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        seasonal_variations: {
                            type: string;
                        };
                        growth_rate_monthly: {
                            type: string;
                        };
                        usage_distribution: {
                            type: string;
                        };
                    };
                };
                capacity_projections: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            projection_period: {
                                type: string;
                            };
                            projected_load: {
                                type: string;
                            };
                            required_capacity: {
                                type: string;
                            };
                            capacity_gap: {
                                type: string;
                            };
                            scaling_recommendations: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                        required: string[];
                    };
                };
                scaling_strategies: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            strategy_name: {
                                type: string;
                            };
                            strategy_type: {
                                type: string;
                                enum: string[];
                            };
                            trigger_conditions: {
                                type: string;
                            };
                            scaling_actions: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            estimated_cost: {
                                type: string;
                            };
                            implementation_time: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                created_at: {
                    $ref: string;
                };
                updated_at: {
                    $ref: string;
                };
            };
            required: string[];
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
                        monitoring_overhead_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        performance_analysis_accuracy_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        sla_compliance_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        capacity_prediction_accuracy_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        performance_optimization_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_monitors_count: {
                            type: string;
                            minimum: number;
                        };
                        alert_frequency_per_hour: {
                            type: string;
                            minimum: number;
                        };
                        false_positive_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        average_response_time_ms: {
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
                                max_monitoring_overhead_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_performance_analysis_accuracy_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_sla_compliance_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_capacity_prediction_accuracy_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_false_positive_rate_percent: {
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
        performance_baseline: {
            $ref: string;
        };
        sla_definition: {
            $ref: string;
        };
        performance_alert: {
            $ref: string;
        };
        performance_report: {
            $ref: string;
        };
        capacity_planning: {
            $ref: string;
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
                            performance_operation: {
                                type: string;
                            };
                            metric_name: {
                                type: string;
                            };
                            metric_value: {
                                type: string;
                            };
                            alert_level: {
                                $ref: string;
                            };
                            sla_status: {
                                $ref: string;
                            };
                            source_module: {
                                $ref: string;
                            };
                            performance_details: {
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
                        performance_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        performance_data_logging: {
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
                        performance_monitoring_api: {
                            type: string;
                            format: string;
                        };
                        performance_analysis_api: {
                            type: string;
                            format: string;
                        };
                        sla_monitoring_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                performance_metrics: {
                    type: string;
                    properties: {
                        track_performance_monitoring: {
                            type: string;
                        };
                        track_performance_analysis: {
                            type: string;
                        };
                        track_sla_monitoring: {
                            type: string;
                        };
                        track_capacity_planning: {
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
                            performance_snapshot: {
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
                        version_on_baseline_change: {
                            type: string;
                        };
                        version_on_sla_change: {
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
                performance_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_performance_data: {
                            type: string;
                        };
                        index_enterprise_performance_metrics: {
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
                        index_new_metrics: {
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
        performance_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        performance_details: {
            type: string;
            properties: {
                collection_strategy: {
                    type: string;
                    enum: string[];
                };
                aggregation_level: {
                    type: string;
                    enum: string[];
                };
                retention_policy: {
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
    oneOf: {
        required: string[];
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
        module_type: {
            type: string;
            enum: string[];
            description: string;
        };
        event_type: {
            type: string;
            enum: string[];
            description: string;
        };
        priority: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        delivery_mode: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        routing_strategy: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        event_message: {
            type: string;
            properties: {
                event_id: {
                    $ref: string;
                };
                event_type: {
                    $ref: string;
                };
                event_name: {
                    type: string;
                    description: string;
                };
                source_module: {
                    $ref: string;
                };
                target_modules: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                payload: {
                    type: string;
                    description: string;
                };
                routing_key: {
                    type: string;
                    description: string;
                };
                headers: {
                    type: string;
                    description: string;
                };
                priority: {
                    $ref: string;
                };
                delivery_mode: {
                    $ref: string;
                };
                ttl_ms: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                    description: string;
                };
                correlation_id: {
                    $ref: string;
                    description: string;
                };
                reply_to: {
                    type: string;
                    description: string;
                };
                trace_context: {
                    type: string;
                    properties: {
                        trace_id: {
                            $ref: string;
                        };
                        span_id: {
                            $ref: string;
                        };
                        parent_span_id: {
                            $ref: string;
                        };
                    };
                    description: string;
                };
                created_at: {
                    $ref: string;
                };
                expires_at: {
                    $ref: string;
                };
                event_bus_details: {
                    type: string;
                    properties: {
                        bus_topology: {
                            type: string;
                            enum: string[];
                        };
                        message_ordering: {
                            type: string;
                            enum: string[];
                        };
                        delivery_guarantee: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
            };
            required: string[];
        };
        event_subscription: {
            type: string;
            properties: {
                subscription_id: {
                    $ref: string;
                };
                subscriber_module: {
                    $ref: string;
                };
                event_patterns: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            event_type: {
                                $ref: string;
                            };
                            event_name_pattern: {
                                type: string;
                                description: string;
                            };
                            source_modules: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                                description: string;
                            };
                            routing_key_pattern: {
                                type: string;
                                description: string;
                            };
                            filter_conditions: {
                                type: string;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                    minItems: number;
                };
                delivery_options: {
                    type: string;
                    properties: {
                        max_retry_count: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            default: number;
                        };
                        retry_delay_ms: {
                            type: string;
                            minimum: number;
                            default: number;
                        };
                        dead_letter_enabled: {
                            type: string;
                            default: boolean;
                        };
                        batch_size: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            default: number;
                        };
                        batch_timeout_ms: {
                            type: string;
                            minimum: number;
                            default: number;
                        };
                    };
                };
                active: {
                    type: string;
                    default: boolean;
                    description: string;
                };
                created_at: {
                    $ref: string;
                };
                updated_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        event_delivery_receipt: {
            type: string;
            properties: {
                receipt_id: {
                    $ref: string;
                };
                event_id: {
                    $ref: string;
                };
                subscription_id: {
                    $ref: string;
                };
                delivery_status: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                delivery_attempt: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                processing_time_ms: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                error_info: {
                    type: string;
                    properties: {
                        error_code: {
                            type: string;
                            pattern: string;
                        };
                        error_message: {
                            type: string;
                        };
                        error_details: {
                            type: string;
                        };
                    };
                };
                delivered_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        event_bus_metrics: {
            type: string;
            properties: {
                metric_id: {
                    $ref: string;
                };
                time_window_start: {
                    $ref: string;
                };
                time_window_end: {
                    $ref: string;
                };
                throughput_metrics: {
                    type: string;
                    properties: {
                        events_published: {
                            type: string;
                        };
                        events_delivered: {
                            type: string;
                        };
                        events_failed: {
                            type: string;
                        };
                        average_latency_ms: {
                            type: string;
                        };
                        p95_latency_ms: {
                            type: string;
                        };
                        p99_latency_ms: {
                            type: string;
                        };
                    };
                };
                resource_metrics: {
                    type: string;
                    properties: {
                        memory_usage_mb: {
                            type: string;
                        };
                        cpu_usage_percent: {
                            type: string;
                        };
                        network_io_mb: {
                            type: string;
                        };
                        queue_depth: {
                            type: string;
                        };
                    };
                };
                error_metrics: {
                    type: string;
                    properties: {
                        error_rate: {
                            type: string;
                        };
                        timeout_rate: {
                            type: string;
                        };
                        dead_letter_rate: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
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
        event_message: {
            $ref: string;
        };
        event_subscription: {
            $ref: string;
        };
        event_delivery_receipt: {
            $ref: string;
        };
        event_bus_metrics: {
            $ref: string;
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
                            event_bus_operation: {
                                type: string;
                            };
                            message_id: {
                                $ref: string;
                            };
                            topic_name: {
                                type: string;
                            };
                            subscriber_id: {
                                $ref: string;
                            };
                            delivery_details: {
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
                        event_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        message_content_logging: {
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
                        event_throughput_api: {
                            type: string;
                            format: string;
                        };
                        message_latency_api: {
                            type: string;
                            format: string;
                        };
                        queue_status_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                event_bus_metrics: {
                    type: string;
                    properties: {
                        track_event_throughput: {
                            type: string;
                        };
                        track_message_latency: {
                            type: string;
                        };
                        track_queue_status: {
                            type: string;
                        };
                        track_subscription_health: {
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
                        event_throughput_per_second: {
                            type: string;
                            minimum: number;
                        };
                        message_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        queue_depth_count: {
                            type: string;
                            minimum: number;
                        };
                        delivery_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        subscription_health_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_subscribers_count: {
                            type: string;
                            minimum: number;
                        };
                        failed_deliveries_count: {
                            type: string;
                            minimum: number;
                        };
                        dead_letter_queue_size: {
                            type: string;
                            minimum: number;
                        };
                        average_processing_time_ms: {
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
                                min_throughput_per_second: {
                                    type: string;
                                    minimum: number;
                                };
                                max_message_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                max_queue_depth_count: {
                                    type: string;
                                    minimum: number;
                                };
                                min_delivery_success_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_dead_letter_queue_size: {
                                    type: string;
                                    minimum: number;
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
                            event_bus_snapshot: {
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
                        version_on_topic_change: {
                            type: string;
                        };
                        version_on_subscription_change: {
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
                event_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_message_content: {
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
                        index_new_events: {
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
        event_bus_details: {
            type: string;
            properties: {
                bus_topology: {
                    type: string;
                    enum: string[];
                };
                message_ordering: {
                    type: string;
                    enum: string[];
                };
                delivery_guarantee: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        event_bus_operation: {
            type: string;
            enum: string[];
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
    oneOf: {
        required: string[];
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
        module_type: {
            type: string;
            enum: string[];
            description: string;
        };
        error_code: {
            type: string;
            pattern: string;
            description: string;
        };
        error_category: {
            type: string;
            enum: string[];
            description: string;
        };
        error_severity: {
            type: string;
            enum: string[];
            description: string;
        };
        recovery_strategy: {
            type: string;
            enum: string[];
            description: string;
        };
        stack_frame: {
            type: string;
            properties: {
                module: {
                    $ref: string;
                };
                function_name: {
                    type: string;
                };
                file_path: {
                    type: string;
                };
                line_number: {
                    type: string;
                    minimum: number;
                };
                column_number: {
                    type: string;
                    minimum: number;
                };
                source_code: {
                    type: string;
                };
                error_handling_operation: {
                    type: string;
                    enum: string[];
                };
                error_handling_details: {
                    type: string;
                    properties: {
                        error_category: {
                            type: string;
                        };
                        recovery_strategy: {
                            type: string;
                        };
                        escalation_level: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
            };
            required: string[];
        };
        error_context: {
            type: string;
            properties: {
                request_id: {
                    $ref: string;
                };
                session_id: {
                    $ref: string;
                };
                user_id: {
                    type: string;
                };
                operation: {
                    type: string;
                };
                input_parameters: {
                    type: string;
                };
                environment: {
                    type: string;
                    enum: string[];
                };
                system_state: {
                    type: string;
                };
                correlation_data: {
                    type: string;
                };
            };
        };
        error_info: {
            type: string;
            properties: {
                error_id: {
                    $ref: string;
                };
                error_code: {
                    $ref: string;
                };
                error_category: {
                    $ref: string;
                };
                error_severity: {
                    $ref: string;
                };
                error_message: {
                    type: string;
                    description: string;
                };
                technical_message: {
                    type: string;
                    description: string;
                };
                error_details: {
                    type: string;
                    description: string;
                };
                source_module: {
                    $ref: string;
                };
                source_function: {
                    type: string;
                };
                stack_trace: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                inner_errors: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                context: {
                    $ref: string;
                };
                recovery_suggestions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            strategy: {
                                $ref: string;
                            };
                            description: {
                                type: string;
                            };
                            automated: {
                                type: string;
                            };
                            success_probability: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                        required: string[];
                    };
                };
                occurred_at: {
                    $ref: string;
                };
                resolved_at: {
                    $ref: string;
                };
                resolution_notes: {
                    type: string;
                };
            };
            required: string[];
        };
        error_propagation: {
            type: string;
            properties: {
                propagation_id: {
                    $ref: string;
                };
                original_error: {
                    $ref: string;
                };
                propagation_chain: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            module: {
                                $ref: string;
                            };
                            function: {
                                type: string;
                            };
                            transformation: {
                                type: string;
                                enum: string[];
                            };
                            added_context: {
                                type: string;
                            };
                            timestamp: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                final_error: {
                    $ref: string;
                };
                propagation_rules: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            rule_name: {
                                type: string;
                            };
                            condition: {
                                type: string;
                            };
                            action: {
                                type: string;
                                enum: string[];
                            };
                            transformation_template: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        error_recovery: {
            type: string;
            properties: {
                recovery_id: {
                    $ref: string;
                };
                error_id: {
                    $ref: string;
                };
                recovery_strategy: {
                    $ref: string;
                };
                recovery_attempts: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            attempt_number: {
                                type: string;
                                minimum: number;
                            };
                            strategy_used: {
                                $ref: string;
                            };
                            attempt_timestamp: {
                                $ref: string;
                            };
                            success: {
                                type: string;
                            };
                            duration_ms: {
                                type: string;
                                minimum: number;
                            };
                            result_data: {
                                type: string;
                            };
                            failure_reason: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                final_outcome: {
                    type: string;
                    enum: string[];
                };
                recovery_metadata: {
                    type: string;
                    properties: {
                        total_attempts: {
                            type: string;
                        };
                        total_duration_ms: {
                            type: string;
                        };
                        resources_consumed: {
                            type: string;
                        };
                        side_effects: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
                completed_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        error_monitoring: {
            type: string;
            properties: {
                monitoring_id: {
                    $ref: string;
                };
                time_window: {
                    type: string;
                    properties: {
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
                    };
                    required: string[];
                };
                error_statistics: {
                    type: string;
                    properties: {
                        total_errors: {
                            type: string;
                            minimum: number;
                        };
                        errors_by_category: {
                            type: string;
                            additionalProperties: {
                                type: string;
                            };
                        };
                        errors_by_severity: {
                            type: string;
                            additionalProperties: {
                                type: string;
                            };
                        };
                        errors_by_module: {
                            type: string;
                            additionalProperties: {
                                type: string;
                            };
                        };
                        error_rate: {
                            type: string;
                            minimum: number;
                            description: string;
                        };
                        recovery_success_rate: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                trending_data: {
                    type: string;
                    properties: {
                        error_trend: {
                            type: string;
                            enum: string[];
                        };
                        trend_confidence: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        predicted_next_hour: {
                            type: string;
                        };
                        anomaly_detected: {
                            type: string;
                        };
                        anomaly_description: {
                            type: string;
                        };
                    };
                };
                alert_thresholds: {
                    type: string;
                    properties: {
                        error_rate_threshold: {
                            type: string;
                        };
                        critical_error_threshold: {
                            type: string;
                        };
                        recovery_failure_threshold: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
        };
        error_notification: {
            type: string;
            properties: {
                notification_id: {
                    $ref: string;
                };
                error_id: {
                    $ref: string;
                };
                notification_type: {
                    type: string;
                    enum: string[];
                };
                recipients: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            recipient_type: {
                                type: string;
                                enum: string[];
                            };
                            recipient_id: {
                                type: string;
                            };
                            notification_method: {
                                type: string;
                                enum: string[];
                            };
                            priority: {
                                type: string;
                                enum: string[];
                            };
                        };
                        required: string[];
                    };
                };
                notification_content: {
                    type: string;
                    properties: {
                        subject: {
                            type: string;
                        };
                        summary: {
                            type: string;
                        };
                        detailed_message: {
                            type: string;
                        };
                        action_items: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        attachments: {
                            type: string;
                            items: {
                                type: string;
                                properties: {
                                    name: {
                                        type: string;
                                    };
                                    type: {
                                        type: string;
                                    };
                                    content: {
                                        type: string;
                                    };
                                };
                                required: string[];
                            };
                        };
                    };
                };
                delivery_status: {
                    type: string;
                    properties: {
                        sent_at: {
                            $ref: string;
                        };
                        delivery_attempts: {
                            type: string;
                        };
                        successful_deliveries: {
                            type: string;
                        };
                        failed_deliveries: {
                            type: string;
                        };
                        delivery_errors: {
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
        error_info: {
            $ref: string;
        };
        error_propagation: {
            $ref: string;
        };
        error_recovery: {
            $ref: string;
        };
        error_monitoring: {
            $ref: string;
        };
        error_notification: {
            $ref: string;
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
                            error_operation: {
                                type: string;
                            };
                            error_code: {
                                $ref: string;
                            };
                            error_category: {
                                $ref: string;
                            };
                            error_severity: {
                                $ref: string;
                            };
                            source_module: {
                                $ref: string;
                            };
                            recovery_strategy: {
                                $ref: string;
                            };
                            error_details: {
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
                        error_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        error_data_logging: {
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
                        error_handling_api: {
                            type: string;
                            format: string;
                        };
                        exception_analysis_api: {
                            type: string;
                            format: string;
                        };
                        system_stability_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                error_metrics: {
                    type: string;
                    properties: {
                        track_error_handling: {
                            type: string;
                        };
                        track_exception_analysis: {
                            type: string;
                        };
                        track_system_stability: {
                            type: string;
                        };
                        track_recovery_success: {
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
                        error_handling_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        error_frequency_per_hour: {
                            type: string;
                            minimum: number;
                        };
                        recovery_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        system_stability_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        exception_analysis_accuracy_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_errors_count: {
                            type: string;
                            minimum: number;
                        };
                        critical_errors_count: {
                            type: string;
                            minimum: number;
                        };
                        escalation_frequency_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        average_recovery_time_ms: {
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
                                max_error_handling_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                max_error_frequency_per_hour: {
                                    type: string;
                                    minimum: number;
                                };
                                min_recovery_success_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_system_stability_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_critical_errors_count: {
                                    type: string;
                                    minimum: number;
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
                            error_handling_snapshot: {
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
                        version_on_strategy_change: {
                            type: string;
                        };
                        version_on_pattern_change: {
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
                error_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_error_data: {
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
                        index_new_errors: {
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
        error_handling_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        error_handling_details: {
            type: string;
            properties: {
                error_category: {
                    type: string;
                };
                recovery_strategy: {
                    type: string;
                };
                escalation_level: {
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
    oneOf: {
        required: string[];
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
        module_type: {
            type: string;
            enum: string[];
            description: string;
        };
        coordination_type: {
            type: string;
            enum: string[];
            description: string;
        };
        priority: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        response_status: {
            type: string;
            enum: string[];
            description: string;
        };
        error_info: {
            type: string;
            properties: {
                error_code: {
                    type: string;
                    pattern: string;
                    description: string;
                };
                error_message: {
                    type: string;
                    description: string;
                };
                error_details: {
                    type: string;
                    description: string;
                };
                stack_trace: {
                    type: string;
                    items: {
                        type: string;
                    };
                    description: string;
                };
            };
            required: string[];
        };
        coordination_request: {
            type: string;
            properties: {
                request_id: {
                    $ref: string;
                };
                source_module: {
                    $ref: string;
                };
                target_module: {
                    $ref: string;
                };
                coordination_type: {
                    $ref: string;
                };
                operation: {
                    type: string;
                    description: string;
                };
                payload: {
                    type: string;
                    description: string;
                };
                priority: {
                    $ref: string;
                };
                timeout_ms: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                    description: string;
                };
                retry_count: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                    description: string;
                };
                correlation_id: {
                    $ref: string;
                    description: string;
                };
                context: {
                    type: string;
                    description: string;
                };
                created_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        coordination_response: {
            type: string;
            properties: {
                request_id: {
                    $ref: string;
                };
                response_id: {
                    $ref: string;
                };
                status: {
                    $ref: string;
                };
                result: {
                    type: string;
                    description: string;
                };
                error: {
                    $ref: string;
                };
                execution_time_ms: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                metadata: {
                    type: string;
                    description: string;
                };
                completed_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        coordination_notification: {
            type: string;
            properties: {
                notification_id: {
                    $ref: string;
                };
                source_module: {
                    $ref: string;
                };
                target_modules: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    minItems: number;
                    description: string;
                };
                event_type: {
                    type: string;
                    description: string;
                };
                payload: {
                    type: string;
                    description: string;
                };
                priority: {
                    $ref: string;
                };
                created_at: {
                    $ref: string;
                };
            };
            required: string[];
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
        coordination_request: {
            $ref: string;
        };
        coordination_response: {
            $ref: string;
        };
        coordination_notification: {
            $ref: string;
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
                            coordination_operation: {
                                type: string;
                            };
                            source_module: {
                                $ref: string;
                            };
                            target_module: {
                                $ref: string;
                            };
                            coordination_details: {
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
                        coordination_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        synchronization_logging: {
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
                        coordination_efficiency_api: {
                            type: string;
                            format: string;
                        };
                        synchronization_performance_api: {
                            type: string;
                            format: string;
                        };
                        conflict_resolution_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                coordination_metrics: {
                    type: string;
                    properties: {
                        track_coordination_efficiency: {
                            type: string;
                        };
                        track_synchronization_performance: {
                            type: string;
                        };
                        track_conflict_resolution: {
                            type: string;
                        };
                        track_state_consistency: {
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
                        coordination_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        synchronization_efficiency_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        conflict_resolution_time_ms: {
                            type: string;
                            minimum: number;
                        };
                        state_consistency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        coordination_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_coordinations_count: {
                            type: string;
                            minimum: number;
                        };
                        failed_coordinations_count: {
                            type: string;
                            minimum: number;
                        };
                        lock_contention_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        average_sync_time_ms: {
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
                                max_coordination_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_synchronization_efficiency_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_conflict_resolution_time_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_state_consistency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_coordination_success_rate_percent: {
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
                            coordination_snapshot: {
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
                        version_on_module_change: {
                            type: string;
                        };
                        version_on_strategy_change: {
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
                coordination_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_coordination_data: {
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
                        index_new_coordinations: {
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
        coordination_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        coordination_details: {
            type: string;
            properties: {
                coordination_pattern: {
                    type: string;
                    enum: string[];
                };
                consensus_algorithm: {
                    type: string;
                    enum: string[];
                };
                conflict_resolution: {
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
    oneOf: {
        required: string[];
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
        module_type: {
            type: string;
            enum: string[];
            description: string;
        };
        execution_mode: {
            type: string;
            enum: string[];
            description: string;
        };
        workflow_status: {
            type: string;
            enum: string[];
            description: string;
        };
        coordination_step: {
            type: string;
            properties: {
                step_id: {
                    $ref: string;
                };
                step_name: {
                    type: string;
                    description: string;
                };
                target_module: {
                    $ref: string;
                };
                operation: {
                    type: string;
                    description: string;
                };
                input_data: {
                    type: string;
                    description: string;
                };
                dependencies: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                timeout_ms: {
                    type: string;
                    minimum: number;
                    default: number;
                    description: string;
                };
                retry_policy: {
                    type: string;
                    properties: {
                        max_retries: {
                            type: string;
                            minimum: number;
                            maximum: number;
                            default: number;
                        };
                        retry_delay_ms: {
                            type: string;
                            minimum: number;
                            default: number;
                        };
                        backoff_multiplier: {
                            type: string;
                            minimum: number;
                            default: number;
                        };
                    };
                };
                orchestration_details: {
                    type: string;
                    properties: {
                        orchestration_pattern: {
                            type: string;
                            enum: string[];
                        };
                        resource_allocation: {
                            type: string;
                            enum: string[];
                        };
                        failure_handling: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
            };
            required: string[];
        };
        coordination_plan: {
            type: string;
            properties: {
                plan_id: {
                    $ref: string;
                };
                plan_name: {
                    type: string;
                    description: string;
                };
                steps: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    minItems: number;
                    description: string;
                };
                execution_mode: {
                    $ref: string;
                };
                global_timeout_ms: {
                    type: string;
                    minimum: number;
                    default: number;
                    description: string;
                };
                rollback_strategy: {
                    type: string;
                    enum: string[];
                    default: string;
                    description: string;
                };
            };
            required: string[];
        };
        performance_requirements: {
            type: string;
            properties: {
                max_execution_time_ms: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                max_memory_mb: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                min_success_rate: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                    description: string;
                };
                max_concurrent_steps: {
                    type: string;
                    minimum: number;
                    default: number;
                    description: string;
                };
            };
        };
        orchestration_request: {
            type: string;
            properties: {
                workflow_id: {
                    $ref: string;
                };
                workflow_name: {
                    type: string;
                    description: string;
                };
                coordination_plan: {
                    $ref: string;
                };
                global_context: {
                    type: string;
                    description: string;
                };
                performance_requirements: {
                    $ref: string;
                };
                priority: {
                    type: string;
                    enum: string[];
                    default: string;
                };
                created_by: {
                    type: string;
                    description: string;
                };
                created_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        orchestration_response: {
            type: string;
            properties: {
                workflow_id: {
                    $ref: string;
                };
                execution_id: {
                    $ref: string;
                };
                status: {
                    $ref: string;
                };
                progress: {
                    type: string;
                    properties: {
                        completed_steps: {
                            type: string;
                            minimum: number;
                        };
                        total_steps: {
                            type: string;
                            minimum: number;
                        };
                        current_step: {
                            $ref: string;
                        };
                        completion_percentage: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                    required: string[];
                };
                results: {
                    type: string;
                    description: string;
                };
                execution_metrics: {
                    type: string;
                    properties: {
                        start_time: {
                            $ref: string;
                        };
                        end_time: {
                            $ref: string;
                        };
                        total_execution_time_ms: {
                            type: string;
                            minimum: number;
                        };
                        memory_usage_mb: {
                            type: string;
                            minimum: number;
                        };
                        success_rate: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                    };
                };
                error_info: {
                    type: string;
                    properties: {
                        error_code: {
                            type: string;
                            pattern: string;
                        };
                        error_message: {
                            type: string;
                        };
                        failed_step: {
                            $ref: string;
                        };
                        error_details: {
                            type: string;
                        };
                    };
                };
                updated_at: {
                    $ref: string;
                };
            };
            required: string[];
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
        orchestration_request: {
            $ref: string;
        };
        orchestration_response: {
            $ref: string;
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
                            orchestration_operation: {
                                type: string;
                            };
                            workflow_id: {
                                $ref: string;
                            };
                            step_id: {
                                $ref: string;
                            };
                            execution_details: {
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
                        orchestration_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        workflow_logging: {
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
                        workflow_execution_api: {
                            type: string;
                            format: string;
                        };
                        resource_utilization_api: {
                            type: string;
                            format: string;
                        };
                        orchestration_efficiency_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                orchestration_metrics: {
                    type: string;
                    properties: {
                        track_workflow_execution: {
                            type: string;
                        };
                        track_resource_utilization: {
                            type: string;
                        };
                        track_orchestration_efficiency: {
                            type: string;
                        };
                        track_dependency_resolution: {
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
                        workflow_execution_time_ms: {
                            type: string;
                            minimum: number;
                        };
                        orchestration_efficiency_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        resource_utilization_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        step_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        dependency_resolution_time_ms: {
                            type: string;
                            minimum: number;
                        };
                        active_workflows_count: {
                            type: string;
                            minimum: number;
                        };
                        failed_workflows_count: {
                            type: string;
                            minimum: number;
                        };
                        rollback_frequency_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        average_step_execution_time_ms: {
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
                                max_workflow_execution_time_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_orchestration_efficiency_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_resource_utilization_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_step_success_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_rollback_frequency_percent: {
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
                            orchestration_snapshot: {
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
                        version_on_workflow_change: {
                            type: string;
                        };
                        version_on_plan_change: {
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
                orchestration_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_workflow_data: {
                            type: string;
                        };
                        index_execution_metrics: {
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
        orchestration_details: {
            type: string;
            properties: {
                orchestration_pattern: {
                    type: string;
                    enum: string[];
                };
                resource_allocation: {
                    type: string;
                    enum: string[];
                };
                failure_handling: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        orchestration_operation: {
            type: string;
            enum: string[];
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
    oneOf: {
        required: string[];
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
        module_type: {
            type: string;
            enum: string[];
            description: string;
        };
        sync_strategy: {
            type: string;
            enum: string[];
            description: string;
        };
        consistency_level: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        conflict_resolution: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        state_snapshot: {
            type: string;
            properties: {
                snapshot_id: {
                    $ref: string;
                };
                module: {
                    $ref: string;
                };
                version: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                state_data: {
                    type: string;
                    description: string;
                };
                checksum: {
                    type: string;
                    description: string;
                };
                metadata: {
                    type: string;
                    properties: {
                        size_bytes: {
                            type: string;
                        };
                        compression: {
                            type: string;
                        };
                        encoding: {
                            type: string;
                        };
                    };
                };
                created_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        state_delta: {
            type: string;
            properties: {
                delta_id: {
                    $ref: string;
                };
                base_version: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                target_version: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                operations: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            operation_type: {
                                type: string;
                                enum: string[];
                            };
                            path: {
                                type: string;
                                description: string;
                            };
                            old_value: {
                                description: string;
                            };
                            new_value: {
                                description: string;
                            };
                            timestamp: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                checksum: {
                    type: string;
                    description: string;
                };
                created_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        state_sync_request: {
            type: string;
            properties: {
                sync_id: {
                    $ref: string;
                };
                source_module: {
                    $ref: string;
                };
                target_modules: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    minItems: number;
                    description: string;
                };
                sync_strategy: {
                    $ref: string;
                };
                consistency_level: {
                    $ref: string;
                };
                sync_scope: {
                    type: string;
                    properties: {
                        include_paths: {
                            type: string;
                            items: {
                                type: string;
                            };
                            description: string;
                        };
                        exclude_paths: {
                            type: string;
                            items: {
                                type: string;
                            };
                            description: string;
                        };
                        filter_conditions: {
                            type: string;
                            description: string;
                        };
                    };
                };
                sync_options: {
                    type: string;
                    properties: {
                        use_delta: {
                            type: string;
                            default: boolean;
                            description: string;
                        };
                        compression_enabled: {
                            type: string;
                            default: boolean;
                        };
                        batch_size: {
                            type: string;
                            minimum: number;
                            default: number;
                        };
                        timeout_ms: {
                            type: string;
                            minimum: number;
                            default: number;
                        };
                        retry_count: {
                            type: string;
                            minimum: number;
                            default: number;
                        };
                    };
                };
                state_snapshot: {
                    $ref: string;
                };
                state_delta: {
                    $ref: string;
                };
                created_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        state_sync_response: {
            type: string;
            properties: {
                sync_id: {
                    $ref: string;
                };
                response_id: {
                    $ref: string;
                };
                target_module: {
                    $ref: string;
                };
                sync_status: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                applied_version: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                conflicts: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            path: {
                                type: string;
                            };
                            conflict_type: {
                                type: string;
                                enum: string[];
                            };
                            local_value: {
                                description: string;
                            };
                            remote_value: {
                                description: string;
                            };
                            resolution: {
                                $ref: string;
                            };
                            resolved_value: {
                                description: string;
                            };
                        };
                        required: string[];
                    };
                };
                sync_metrics: {
                    type: string;
                    properties: {
                        records_processed: {
                            type: string;
                        };
                        records_applied: {
                            type: string;
                        };
                        records_skipped: {
                            type: string;
                        };
                        processing_time_ms: {
                            type: string;
                        };
                        data_size_bytes: {
                            type: string;
                        };
                    };
                };
                error_info: {
                    type: string;
                    properties: {
                        error_code: {
                            type: string;
                            pattern: string;
                        };
                        error_message: {
                            type: string;
                        };
                        error_details: {
                            type: string;
                        };
                    };
                };
                next_sync_version: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                completed_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        state_sync_subscription: {
            type: string;
            properties: {
                subscription_id: {
                    $ref: string;
                };
                subscriber_module: {
                    $ref: string;
                };
                source_modules: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                sync_patterns: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            path_pattern: {
                                type: string;
                                description: string;
                            };
                            sync_strategy: {
                                $ref: string;
                            };
                            sync_frequency_ms: {
                                type: string;
                                minimum: number;
                                description: string;
                            };
                        };
                        required: string[];
                    };
                };
                active: {
                    type: string;
                    default: boolean;
                };
                created_at: {
                    $ref: string;
                };
                updated_at: {
                    $ref: string;
                };
            };
            required: string[];
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
        state_sync_request: {
            $ref: string;
        };
        state_sync_response: {
            $ref: string;
        };
        state_sync_subscription: {
            $ref: string;
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
                            state_sync_operation: {
                                type: string;
                            };
                            source_module: {
                                $ref: string;
                            };
                            target_module: {
                                $ref: string;
                            };
                            sync_details: {
                                type: string;
                            };
                            conflict_details: {
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
                        state_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        state_change_logging: {
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
                        sync_performance_api: {
                            type: string;
                            format: string;
                        };
                        consistency_analysis_api: {
                            type: string;
                            format: string;
                        };
                        conflict_resolution_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                state_sync_metrics: {
                    type: string;
                    properties: {
                        track_sync_performance: {
                            type: string;
                        };
                        track_consistency_analysis: {
                            type: string;
                        };
                        track_conflict_resolution: {
                            type: string;
                        };
                        track_state_integrity: {
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
                        sync_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        consistency_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        conflict_resolution_time_ms: {
                            type: string;
                            minimum: number;
                        };
                        sync_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        state_integrity_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_syncs_count: {
                            type: string;
                            minimum: number;
                        };
                        failed_syncs_count: {
                            type: string;
                            minimum: number;
                        };
                        rollback_frequency_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        average_sync_size_bytes: {
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
                                max_sync_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_consistency_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_conflict_resolution_time_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_sync_success_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_state_integrity_score: {
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
                            state_sync_snapshot: {
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
                        version_on_pattern_change: {
                            type: string;
                        };
                        version_on_subscription_change: {
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
                state_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_state_data: {
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
                        index_new_syncs: {
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
        state_sync_details: {
            type: string;
            properties: {
                sync_strategy: {
                    type: string;
                    enum: string[];
                };
                conflict_resolution: {
                    type: string;
                    enum: string[];
                };
                consistency_level: {
                    type: string;
                    enum: string[];
                };
            };
            description: string;
        };
        state_sync_operation: {
            type: string;
            enum: string[];
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
    oneOf: {
        required: string[];
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
        module_type: {
            type: string;
            enum: string[];
            description: string;
        };
        isolation_level: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        transaction_state: {
            type: string;
            enum: string[];
            description: string;
        };
        rollback_strategy: {
            type: string;
            enum: string[];
            default: string;
            description: string;
        };
        participant_info: {
            type: string;
            properties: {
                module: {
                    $ref: string;
                };
                participant_id: {
                    $ref: string;
                };
                resource_locks: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            resource_id: {
                                type: string;
                            };
                            lock_type: {
                                type: string;
                                enum: string[];
                            };
                            acquired_at: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                state: {
                    $ref: string;
                };
                last_heartbeat: {
                    $ref: string;
                };
                compensation_data: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
        transaction_context: {
            type: string;
            properties: {
                transaction_id: {
                    $ref: string;
                };
                parent_transaction_id: {
                    $ref: string;
                    description: string;
                };
                isolation_level: {
                    $ref: string;
                };
                participating_modules: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    minItems: number;
                    description: string;
                };
                participants: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                transaction_state: {
                    $ref: string;
                };
                timeout_ms: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                    description: string;
                };
                rollback_strategy: {
                    $ref: string;
                };
                coordinator_module: {
                    $ref: string;
                    description: string;
                };
                metadata: {
                    type: string;
                    description: string;
                };
                created_at: {
                    $ref: string;
                };
                updated_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        transaction_operation: {
            type: string;
            properties: {
                operation_id: {
                    $ref: string;
                };
                transaction_id: {
                    $ref: string;
                };
                operation_type: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                source_module: {
                    $ref: string;
                };
                target_module: {
                    $ref: string;
                };
                operation_data: {
                    type: string;
                    description: string;
                };
                timeout_ms: {
                    type: string;
                    minimum: number;
                    default: number;
                    description: string;
                };
                created_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        transaction_result: {
            type: string;
            properties: {
                operation_id: {
                    $ref: string;
                };
                transaction_id: {
                    $ref: string;
                };
                result_status: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                result_data: {
                    type: string;
                    description: string;
                };
                error_info: {
                    type: string;
                    properties: {
                        error_code: {
                            type: string;
                            pattern: string;
                        };
                        error_message: {
                            type: string;
                        };
                        error_details: {
                            type: string;
                        };
                    };
                };
                execution_time_ms: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                resource_usage: {
                    type: string;
                    properties: {
                        memory_mb: {
                            type: string;
                        };
                        cpu_time_ms: {
                            type: string;
                        };
                        io_operations: {
                            type: string;
                        };
                    };
                };
                completed_at: {
                    $ref: string;
                };
            };
            required: string[];
        };
        compensation_action: {
            type: string;
            properties: {
                action_id: {
                    $ref: string;
                };
                transaction_id: {
                    $ref: string;
                };
                target_module: {
                    $ref: string;
                };
                compensation_operation: {
                    type: string;
                    description: string;
                };
                compensation_data: {
                    type: string;
                    description: string;
                };
                execution_order: {
                    type: string;
                    minimum: number;
                    description: string;
                };
                timeout_ms: {
                    type: string;
                    minimum: number;
                    default: number;
                };
                created_at: {
                    $ref: string;
                };
            };
            required: string[];
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
        transaction_context: {
            $ref: string;
        };
        transaction_operation: {
            $ref: string;
        };
        transaction_result: {
            $ref: string;
        };
        compensation_action: {
            $ref: string;
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
                            transaction_operation: {
                                type: string;
                            };
                            transaction_id: {
                                $ref: string;
                            };
                            participant_modules: {
                                type: string;
                                items: {
                                    $ref: string;
                                };
                            };
                            isolation_level: {
                                $ref: string;
                            };
                            transaction_details: {
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
                        transaction_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        transaction_data_logging: {
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
                        transaction_performance_api: {
                            type: string;
                            format: string;
                        };
                        deadlock_detection_api: {
                            type: string;
                            format: string;
                        };
                        acid_compliance_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                transaction_metrics: {
                    type: string;
                    properties: {
                        track_transaction_performance: {
                            type: string;
                        };
                        track_deadlock_detection: {
                            type: string;
                        };
                        track_acid_compliance: {
                            type: string;
                        };
                        track_lock_contention: {
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
                        transaction_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        transaction_throughput_per_second: {
                            type: string;
                            minimum: number;
                        };
                        deadlock_frequency_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        acid_compliance_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        lock_contention_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_transactions_count: {
                            type: string;
                            minimum: number;
                        };
                        failed_transactions_count: {
                            type: string;
                            minimum: number;
                        };
                        rollback_frequency_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        average_lock_wait_time_ms: {
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
                                max_transaction_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_transaction_throughput_per_second: {
                                    type: string;
                                    minimum: number;
                                };
                                max_deadlock_frequency_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_acid_compliance_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_lock_contention_rate_percent: {
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
                            transaction_snapshot: {
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
                        version_on_isolation_change: {
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
                                $ref: string;
                            };
                            last_updated: {
                                $ref: string;
                            };
                        };
                        required: string[];
                    };
                };
                transaction_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_transaction_data: {
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
                        index_new_transactions: {
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
        transaction_details: {
            type: string;
            properties: {
                isolation_level: {
                    type: string;
                    enum: string[];
                };
                timeout_seconds: {
                    type: string;
                    minimum: number;
                    maximum: number;
                };
                rollback_strategy: {
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
    oneOf: {
        required: string[];
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
        compatibility_level: {
            type: string;
            enum: string[];
            description: string;
        };
        module_version_info: {
            type: string;
            properties: {
                module_name: {
                    type: string;
                    enum: string[];
                    description: string;
                };
                current_version: {
                    $ref: string;
                };
                supported_versions: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    description: string;
                };
                deprecated_versions: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version: {
                                $ref: string;
                            };
                            deprecation_date: {
                                $ref: string;
                            };
                            removal_date: {
                                $ref: string;
                            };
                            migration_guide: {
                                type: string;
                                description: string;
                            };
                            protocol_version_operation: {
                                type: string;
                                enum: string[];
                            };
                            protocol_version_details: {
                                type: string;
                                properties: {
                                    compatibility_mode: {
                                        type: string;
                                        enum: string[];
                                    };
                                    migration_strategy: {
                                        type: string;
                                    };
                                    rollback_support: {
                                        type: string;
                                    };
                                };
                            };
                        };
                        required: string[];
                    };
                };
                breaking_changes: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            version: {
                                $ref: string;
                            };
                            change_description: {
                                type: string;
                            };
                            impact_level: {
                                type: string;
                                enum: string[];
                            };
                            migration_required: {
                                type: string;
                            };
                            affected_apis: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        compatibility_matrix: {
            type: string;
            properties: {
                matrix_version: {
                    $ref: string;
                };
                compatibility_rules: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            source_module: {
                                type: string;
                            };
                            source_version: {
                                $ref: string;
                            };
                            target_module: {
                                type: string;
                            };
                            target_version_range: {
                                type: string;
                                description: string;
                            };
                            compatibility_level: {
                                $ref: string;
                            };
                            notes: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                global_constraints: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            constraint_type: {
                                type: string;
                                enum: string[];
                            };
                            modules: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            version_constraint: {
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
        upgrade_path: {
            type: string;
            properties: {
                path_id: {
                    $ref: string;
                };
                from_version: {
                    $ref: string;
                };
                to_version: {
                    $ref: string;
                };
                upgrade_steps: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            step_number: {
                                type: string;
                                minimum: number;
                            };
                            step_description: {
                                type: string;
                            };
                            step_type: {
                                type: string;
                                enum: string[];
                            };
                            affected_modules: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            automation_script: {
                                type: string;
                                description: string;
                            };
                            manual_steps: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            validation_criteria: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                            rollback_procedure: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
                estimated_duration_minutes: {
                    type: string;
                    minimum: number;
                };
                risk_level: {
                    type: string;
                    enum: string[];
                };
                prerequisites: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                post_upgrade_validation: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
            };
            required: string[];
        };
        deprecation_schedule: {
            type: string;
            properties: {
                schedule_version: {
                    $ref: string;
                };
                deprecation_policies: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            policy_name: {
                                type: string;
                            };
                            deprecation_period_months: {
                                type: string;
                                minimum: number;
                            };
                            notification_schedule: {
                                type: string;
                                items: {
                                    type: string;
                                    properties: {
                                        notification_type: {
                                            type: string;
                                            enum: string[];
                                        };
                                        months_before_removal: {
                                            type: string;
                                            minimum: number;
                                        };
                                    };
                                    required: string[];
                                };
                            };
                            affected_features: {
                                type: string;
                                items: {
                                    type: string;
                                };
                            };
                        };
                        required: string[];
                    };
                };
                scheduled_deprecations: {
                    type: string;
                    items: {
                        type: string;
                        properties: {
                            item_type: {
                                type: string;
                                enum: string[];
                            };
                            item_identifier: {
                                type: string;
                            };
                            deprecation_date: {
                                $ref: string;
                            };
                            removal_date: {
                                $ref: string;
                            };
                            replacement: {
                                type: string;
                            };
                            migration_guide: {
                                type: string;
                            };
                            impact_assessment: {
                                type: string;
                            };
                        };
                        required: string[];
                    };
                };
            };
            required: string[];
        };
        protocol_version_info: {
            type: string;
            properties: {
                protocol_suite_version: {
                    $ref: string;
                };
                protocol_suite_name: {
                    type: string;
                    const: string;
                };
                release_date: {
                    $ref: string;
                };
                module_versions: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    minItems: number;
                };
                compatibility_matrix: {
                    $ref: string;
                };
                upgrade_paths: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                };
                deprecation_schedule: {
                    $ref: string;
                };
                release_notes: {
                    type: string;
                    properties: {
                        new_features: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        improvements: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        bug_fixes: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        breaking_changes: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        security_updates: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                    };
                };
                metadata: {
                    type: string;
                    properties: {
                        maintainers: {
                            type: string;
                            items: {
                                type: string;
                            };
                        };
                        repository_url: {
                            type: string;
                            format: string;
                        };
                        documentation_url: {
                            type: string;
                            format: string;
                        };
                        support_contact: {
                            type: string;
                        };
                        license: {
                            type: string;
                        };
                    };
                };
            };
            required: string[];
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
        protocol_version_info: {
            $ref: string;
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
                            version_operation: {
                                type: string;
                            };
                            source_version: {
                                $ref: string;
                            };
                            target_version: {
                                $ref: string;
                            };
                            module_name: {
                                type: string;
                            };
                            compatibility_result: {
                                $ref: string;
                            };
                            version_details: {
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
                        version_audit_level: {
                            type: string;
                            enum: string[];
                        };
                        version_change_logging: {
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
                        version_management_api: {
                            type: string;
                            format: string;
                        };
                        compatibility_analysis_api: {
                            type: string;
                            format: string;
                        };
                        protocol_evolution_api: {
                            type: string;
                            format: string;
                        };
                    };
                };
                version_metrics: {
                    type: string;
                    properties: {
                        track_version_management: {
                            type: string;
                        };
                        track_compatibility_analysis: {
                            type: string;
                        };
                        track_protocol_evolution: {
                            type: string;
                        };
                        track_migration_progress: {
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
                        version_check_latency_ms: {
                            type: string;
                            minimum: number;
                        };
                        compatibility_check_success_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        migration_completion_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        protocol_evolution_score: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        version_adoption_rate_percent: {
                            type: string;
                            minimum: number;
                            maximum: number;
                        };
                        active_versions_count: {
                            type: string;
                            minimum: number;
                        };
                        deprecated_versions_count: {
                            type: string;
                            minimum: number;
                        };
                        compatibility_conflicts_count: {
                            type: string;
                            minimum: number;
                        };
                        average_migration_time_hours: {
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
                                max_version_check_latency_ms: {
                                    type: string;
                                    minimum: number;
                                };
                                min_compatibility_check_success_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_migration_completion_rate_percent: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                min_protocol_evolution_score: {
                                    type: string;
                                    minimum: number;
                                    maximum: number;
                                };
                                max_compatibility_conflicts_count: {
                                    type: string;
                                    minimum: number;
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
                            protocol_snapshot: {
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
                        version_on_protocol_change: {
                            type: string;
                        };
                        version_on_compatibility_change: {
                            type: string;
                        };
                        version_on_deprecation_change: {
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
                version_indexing: {
                    type: string;
                    properties: {
                        enabled: {
                            type: string;
                        };
                        index_version_data: {
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
                        index_new_versions: {
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
        protocol_version_operation: {
            type: string;
            enum: string[];
            description: string;
        };
        protocol_version_details: {
            type: string;
            properties: {
                compatibility_mode: {
                    type: string;
                    enum: string[];
                };
                migration_strategy: {
                    type: string;
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
})[];
export declare const CrossCuttingConcernNames: Array<keyof typeof CrossCuttingConcernsSchemaMap>;
export declare const L3ManagerMapping: {
    readonly 'Security Infrastructure': {
        readonly manager: "MLPPSecurityManager";
        readonly location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly concerns: readonly ["security"];
        readonly description: "Identity authentication, authorization, security audit, data protection";
    };
    readonly 'Performance Infrastructure': {
        readonly manager: "MLPPPerformanceMonitor";
        readonly location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly concerns: readonly ["performance"];
        readonly description: "Performance monitoring, SLA management, resource optimization, caching";
    };
    readonly 'Events Infrastructure': {
        readonly manager: "MLPPEventBusManager";
        readonly location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly concerns: readonly ["eventBus", "errorHandling"];
        readonly description: "Event publishing/subscription, asynchronous messaging, error handling";
    };
    readonly 'Storage Infrastructure': {
        readonly manager: "MLPPStateSyncManager";
        readonly location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly concerns: readonly ["stateSync", "transaction"];
        readonly description: "Data storage abstraction, state synchronization, transaction management";
    };
};
export declare function getInfrastructureCategory(concernName: CrossCuttingConcernSchemaName): string;
export declare function getL3Manager(concernName: CrossCuttingConcernSchemaName): string;
export declare function getL3Location(concernName: CrossCuttingConcernSchemaName): string;
export declare const CrossCuttingConcernInfo: {
    readonly security: {
        readonly category: "Security Infrastructure";
        readonly description: "Identity authentication, authorization, security audit, data protection";
        readonly l3Location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly l3Manager: "MLPPSecurityManager";
    };
    readonly performance: {
        readonly category: "Performance Infrastructure";
        readonly description: "Performance monitoring, SLA management, resource optimization, caching";
        readonly l3Location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly l3Manager: "MLPPPerformanceMonitor";
    };
    readonly eventBus: {
        readonly category: "Events Infrastructure";
        readonly description: "Event publishing/subscription, asynchronous messaging, event routing";
        readonly l3Location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly l3Manager: "MLPPEventBusManager";
    };
    readonly errorHandling: {
        readonly category: "Events Infrastructure";
        readonly description: "Error capturing, recovery strategies, error classification";
        readonly l3Location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly l3Manager: "MLPPErrorHandler";
    };
    readonly coordination: {
        readonly category: "Coordination Infrastructure";
        readonly description: "Module coordination, dependency management, state synchronization";
        readonly l3Location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly l3Manager: "MLPPCoordinationManager";
    };
    readonly orchestration: {
        readonly category: "Coordination Infrastructure";
        readonly description: "Workflow orchestration, step management, conditional execution";
        readonly l3Location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly l3Manager: "MLPPOrchestrationManager";
    };
    readonly stateSync: {
        readonly category: "Storage Infrastructure";
        readonly description: "Distributed state, consistency guarantee, conflict resolution";
        readonly l3Location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly l3Manager: "MLPPStateSyncManager";
    };
    readonly transaction: {
        readonly category: "Storage Infrastructure";
        readonly description: "Transaction management, ACID guarantee, rollback mechanism";
        readonly l3Location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly l3Manager: "MLPPTransactionManager";
    };
    readonly protocolVersion: {
        readonly category: "Protocol Management Infrastructure";
        readonly description: "Version negotiation, compatibility check, upgrade management";
        readonly l3Location: "src/core/protocols/cross-cutting-concerns.ts";
        readonly l3Manager: "MLPPProtocolVersionManager";
    };
};
//# sourceMappingURL=index.d.ts.map