/**
 * Network映射器
 *
 * @description Network模块的Schema-TypeScript双向映射器，基于DDD架构
 * @version 1.0.0
 * @layer API层 - 映射器
 */
import { NetworkEntity } from '../../domain/entities/network.entity';
import { NetworkDto } from '../dto/network.dto';
/**
 * Network Schema接口 (snake_case) - 基于mplp-network.json
 */
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
/**
 * Network映射器类
 */
export declare class NetworkMapper {
    /**
     * 将NetworkEntity转换为Schema格式 (snake_case)
     */
    static toSchema(entity: NetworkEntity): NetworkSchema;
    /**
     * 将Schema格式转换为NetworkEntity (snake_case -> camelCase)
     */
    static fromSchema(schema: NetworkSchema): NetworkEntity;
    /**
     * 将NetworkEntity转换为DTO格式 (camelCase)
     */
    static toDto(entity: NetworkEntity): NetworkDto;
    /**
     * 验证Schema格式数据
     */
    static validateSchema(schema: unknown): schema is NetworkSchema;
    /**
     * 批量转换为Schema格式
     */
    static toSchemaArray(entities: NetworkEntity[]): NetworkSchema[];
    /**
     * 批量转换为Entity格式
     */
    static fromSchemaArray(schemas: NetworkSchema[]): NetworkEntity[];
    /**
     * 批量转换为DTO格式
     */
    static toDtoArray(entities: NetworkEntity[]): NetworkDto[];
}
//# sourceMappingURL=network.mapper.d.ts.map