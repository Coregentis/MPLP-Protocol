import { NetworkEntity } from '../../domain/entities/network.entity';
import { NetworkDto } from '../dto/network.dto';
export interface NetworkSchema {
    network_id: string;
    protocol_version: string;
    timestamp: string;
    context_id: string;
    name: string;
    description?: string;
    topology: string;
    nodes: Array<{
        node_id: string;
        agent_id: string;
        node_type: string;
        status: string;
        capabilities: string[];
        address?: {
            host: string;
            port: number;
            protocol: string;
        };
        metadata: {
            [key: string]: unknown;
        };
    }>;
    edges?: Array<{
        edge_id: string;
        source_node_id: string;
        target_node_id: string;
        edge_type: string;
        direction: string;
        status: string;
        weight: number;
        metadata: {
            [key: string]: unknown;
        };
    }>;
    discovery_mechanism: {
        type: string;
        enabled: boolean;
        configuration: {
            [key: string]: unknown;
        };
    };
    routing_strategy: {
        algorithm: string;
        load_balancing: string;
        configuration: {
            [key: string]: unknown;
        };
    };
    status: string;
    created_at: string;
    updated_at?: string;
    created_by: string;
    audit_trail: Array<{
        timestamp: string;
        action: string;
        actor: string;
        details: {
            [key: string]: unknown;
        };
    }>;
    monitoring_integration: {
        enabled: boolean;
        endpoints: string[];
        configuration: {
            [key: string]: unknown;
        };
    };
    performance_metrics: {
        enabled: boolean;
        collection_interval_seconds: number;
        metrics: {
            [key: string]: unknown;
        };
    };
    version_history: Array<{
        version: string;
        timestamp: string;
        changes: string[];
        author: string;
    }>;
    search_metadata: {
        tags: string[];
        keywords: string[];
        categories: string[];
        indexed: boolean;
    };
    network_operation: string;
    event_integration: {
        enabled: boolean;
        event_types: string[];
        configuration: {
            [key: string]: unknown;
        };
    };
}
export declare class NetworkMapper {
    static toSchema(entity: NetworkEntity): NetworkSchema;
    static fromSchema(schema: NetworkSchema): NetworkEntity;
    static toDto(entity: NetworkEntity): NetworkDto;
    static validateSchema(schema: unknown): schema is NetworkSchema;
    static toSchemaArray(entities: NetworkEntity[]): NetworkSchema[];
    static fromSchemaArray(schemas: NetworkSchema[]): NetworkEntity[];
    static toDtoArray(entities: NetworkEntity[]): NetworkDto[];
}
//# sourceMappingURL=network.mapper.d.ts.map