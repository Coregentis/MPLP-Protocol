/**
 * NetworkClient - 网络通信和序列化机制
 * 支持多种协议：HTTP/REST、gRPC、WebSocket
 * 包括连接池管理、数据压缩和加密
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */
import { UUID, Timestamp } from '../../types';
export interface NetworkClientConfig {
    protocol: NetworkProtocol;
    baseUrl?: string;
    timeout: number;
    retries: number;
    compression: CompressionConfig;
    encryption: EncryptionConfig;
    connectionPool: ConnectionPoolConfig;
    serialization: SerializationConfig;
    headers: Record<string, string>;
    interceptors: InterceptorConfig;
}
export type NetworkProtocol = 'http' | 'https' | 'grpc' | 'websocket' | 'tcp' | 'udp';
export interface CompressionConfig {
    enabled: boolean;
    algorithm: 'gzip' | 'deflate' | 'brotli' | 'lz4';
    threshold: number;
    level: number;
}
export interface EncryptionConfig {
    enabled: boolean;
    algorithm: 'aes-256-gcm' | 'aes-128-gcm' | 'chacha20-poly1305';
    keyRotation: boolean;
    keyRotationInterval: number;
}
export interface ConnectionPoolConfig {
    maxConnections: number;
    maxIdleConnections: number;
    idleTimeout: number;
    connectionTimeout: number;
    keepAlive: boolean;
    keepAliveTimeout: number;
}
export interface SerializationConfig {
    format: SerializationFormat;
    options: SerializationOptions;
}
export type SerializationFormat = 'json' | 'protobuf' | 'msgpack' | 'avro' | 'xml';
export interface SerializationOptions {
    prettyPrint?: boolean;
    dateFormat?: 'iso' | 'timestamp' | 'custom';
    nullHandling?: 'omit' | 'explicit' | 'default';
    enumHandling?: 'string' | 'number';
}
export interface InterceptorConfig {
    request: RequestInterceptor[];
    response: ResponseInterceptor[];
    error: ErrorInterceptor[];
}
export interface NetworkRequest {
    requestId: UUID;
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
    params?: Record<string, string>;
    timeout?: number;
    retries?: number;
    metadata: RequestMetadata;
}
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
export interface RequestMetadata {
    timestamp: Timestamp;
    traceId?: UUID;
    spanId?: UUID;
    userId?: string;
    sessionId?: string;
    clientVersion?: string;
    tags: Record<string, string>;
}
export interface NetworkResponse<T = unknown> {
    requestId: UUID;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: T;
    metadata: ResponseMetadata;
}
export interface ResponseMetadata {
    timestamp: Timestamp;
    duration: number;
    size: number;
    compressed: boolean;
    encrypted: boolean;
    fromCache: boolean;
    serverVersion?: string;
}
export interface Connection {
    connectionId: UUID;
    protocol: NetworkProtocol;
    host: string;
    port: number;
    status: ConnectionStatus;
    createdAt: Timestamp;
    lastUsed: Timestamp;
    requestCount: number;
    errorCount: number;
    metadata: ConnectionMetadata;
}
export type ConnectionStatus = 'connecting' | 'connected' | 'idle' | 'busy' | 'error' | 'closed';
export interface ConnectionMetadata {
    ssl: boolean;
    version: string;
    keepAlive: boolean;
    maxRequests: number;
    currentRequests: number;
}
export type RequestInterceptor = (request: NetworkRequest) => Promise<NetworkRequest> | NetworkRequest;
export type ResponseInterceptor = <T>(response: NetworkResponse<T>) => Promise<NetworkResponse<T>> | NetworkResponse<T>;
export type ErrorInterceptor = (error: NetworkError) => Promise<NetworkError> | NetworkError | null;
export interface NetworkError {
    errorId: UUID;
    type: NetworkErrorType;
    message: string;
    code?: string | number;
    requestId?: UUID;
    url?: string;
    method?: HttpMethod;
    timestamp: Timestamp;
    retryable: boolean;
    details?: Record<string, unknown>;
}
export type NetworkErrorType = 'connection_error' | 'timeout_error' | 'serialization_error' | 'compression_error' | 'encryption_error' | 'protocol_error' | 'authentication_error' | 'authorization_error' | 'rate_limit_error' | 'server_error' | 'client_error';
export interface NetworkStatistics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    totalBytesTransferred: number;
    totalBytesReceived: number;
    compressionRatio: number;
    activeConnections: number;
    poolUtilization: number;
    errorRate: number;
    lastActivity: Timestamp;
}
export declare class NetworkClient {
    private config;
    private connectionPool;
    private serializer;
    private compressor;
    private encryptor;
    private statistics;
    private interceptors;
    constructor(config?: Partial<NetworkClientConfig>);
    /**
     * 发送HTTP请求
     */
    request<T = unknown>(request: Partial<NetworkRequest>): Promise<NetworkResponse<T>>;
    /**
     * GET请求
     */
    get<T = unknown>(url: string, params?: Record<string, string>, headers?: Record<string, string>): Promise<NetworkResponse<T>>;
    /**
     * POST请求
     */
    post<T = unknown>(url: string, body?: unknown, headers?: Record<string, string>): Promise<NetworkResponse<T>>;
    /**
     * PUT请求
     */
    put<T = unknown>(url: string, body?: unknown, headers?: Record<string, string>): Promise<NetworkResponse<T>>;
    /**
     * DELETE请求
     */
    delete<T = unknown>(url: string, headers?: Record<string, string>): Promise<NetworkResponse<T>>;
    /**
     * 添加请求拦截器
     */
    addRequestInterceptor(interceptor: RequestInterceptor): void;
    /**
     * 添加响应拦截器
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): void;
    /**
     * 添加错误拦截器
     */
    addErrorInterceptor(interceptor: ErrorInterceptor): void;
    /**
     * 获取统计信息
     */
    getStatistics(): NetworkStatistics;
    /**
     * 清理资源
     */
    destroy(): void;
    private applyRequestInterceptors;
    private applyResponseInterceptors;
    private applyErrorInterceptors;
    private sendRequest;
    private buildUrl;
    private extractHost;
    private extractPort;
    private calculateResponseSize;
    private createNetworkError;
    private updateStatistics;
    private generateUUID;
}
export declare class ConnectionPool {
    private config;
    private connections;
    private activeConnections;
    constructor(config: ConnectionPoolConfig);
    getConnection(host: string, port: number): Promise<Connection>;
    releaseConnection(connection: Connection): void;
    getActiveConnectionCount(): number;
    getUtilization(): number;
    destroy(): void;
    private generateUUID;
}
export declare class DataSerializer {
    private config;
    constructor(config: SerializationConfig);
    serialize(data: unknown): Promise<string>;
    deserialize<T>(data: string): Promise<T>;
}
export declare class DataCompressor {
    private config;
    constructor(config: CompressionConfig);
    compress(data: unknown): Promise<string>;
    decompress(data: string): Promise<string>;
}
export declare class DataEncryptor {
    private config;
    constructor(config: EncryptionConfig);
    encrypt(data: unknown): Promise<string>;
    decrypt(data: string): Promise<string>;
}
//# sourceMappingURL=network.client.d.ts.map