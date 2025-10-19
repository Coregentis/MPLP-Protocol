/**
 * MessageQueue - 消息队列集成系统
 * 支持多种消息队列：Redis、RabbitMQ、Apache Kafka
 * 包括消息发布、订阅、持久化和错误处理
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */
import { UUID, Timestamp } from '../../types';
export interface MessageQueueConfig {
    provider: MessageQueueProvider;
    connectionString: string;
    options: ProviderOptions;
    retryPolicy: RetryPolicy;
    deadLetterQueue: boolean;
    persistence: boolean;
    compression: boolean;
    encryption: boolean;
    batchSize: number;
    maxConcurrency: number;
}
export type MessageQueueProvider = 'redis' | 'rabbitmq' | 'kafka' | 'memory';
export interface ProviderOptions {
    redis?: RedisOptions;
    rabbitmq?: RabbitMQOptions;
    kafka?: KafkaOptions;
}
export interface RedisOptions {
    db: number;
    keyPrefix: string;
    maxRetriesPerRequest: number;
    retryDelayOnFailover: number;
}
export interface RabbitMQOptions {
    exchange: string;
    exchangeType: 'direct' | 'topic' | 'fanout' | 'headers';
    durable: boolean;
    autoDelete: boolean;
    prefetchCount: number;
}
export interface KafkaOptions {
    groupId: string;
    partitions: number;
    replicationFactor: number;
    acks: 'all' | '1' | '0';
    compression: 'gzip' | 'snappy' | 'lz4' | 'zstd' | 'none';
}
export interface RetryPolicy {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
}
export interface Message {
    messageId: UUID;
    topic: string;
    payload: unknown;
    headers: MessageHeaders;
    metadata: MessageMetadata;
    createdAt: Timestamp;
    expiresAt?: Timestamp;
}
export interface MessageHeaders {
    contentType: string;
    contentEncoding?: string;
    correlationId?: UUID;
    replyTo?: string;
    priority?: number;
    userId?: string;
    appId?: string;
    clusterId?: string;
    [key: string]: unknown;
}
export interface MessageMetadata {
    source: string;
    version: string;
    traceId?: UUID;
    spanId?: UUID;
    retryCount: number;
    maxRetries: number;
    tags: string[];
    properties: Record<string, unknown>;
}
export interface PublishOptions {
    topic: string;
    partition?: number;
    key?: string;
    headers?: Record<string, unknown>;
    persistent?: boolean;
    ttl?: number;
    priority?: number;
    delay?: number;
}
export interface SubscribeOptions {
    topic: string;
    consumerGroup?: string;
    autoAck?: boolean;
    prefetchCount?: number;
    startFromBeginning?: boolean;
    messageHandler: MessageHandler;
    errorHandler?: ErrorHandler;
}
export type MessageHandler = (message: ReceivedMessage) => Promise<void> | void;
export type ErrorHandler = (error: MessageError, message?: ReceivedMessage) => Promise<void> | void;
export interface ReceivedMessage extends Message {
    deliveryTag?: string;
    redelivered: boolean;
    receivedAt: Timestamp;
    ack: () => Promise<void>;
    nack: (requeue?: boolean) => Promise<void>;
    reject: (requeue?: boolean) => Promise<void>;
}
export interface MessageError {
    errorId: UUID;
    errorType: MessageErrorType;
    message: string;
    originalError?: Error;
    messageId?: UUID;
    topic?: string;
    retryCount: number;
    timestamp: Timestamp;
    context?: Record<string, unknown>;
}
export type MessageErrorType = 'connection_error' | 'serialization_error' | 'deserialization_error' | 'handler_error' | 'timeout_error' | 'authentication_error' | 'authorization_error' | 'quota_exceeded' | 'topic_not_found' | 'consumer_error';
export interface MessageQueueStatistics {
    totalPublished: number;
    totalConsumed: number;
    totalFailed: number;
    activeSubscriptions: number;
    queueDepth: number;
    averageLatency: number;
    throughputPerSecond: number;
    errorRate: number;
    connectionStatus: ConnectionStatus;
    lastActivity: Timestamp;
}
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';
export declare class MessageQueueManager {
    private config;
    private provider;
    private connection;
    private subscriptions;
    private statistics;
    private reconnectTimer;
    constructor(config: MessageQueueConfig);
    /**
     * 连接到消息队列
     */
    connect(): Promise<void>;
    /**
     * 断开连接
     */
    disconnect(): Promise<void>;
    /**
     * 发布消息
     */
    publish(payload: unknown, options: PublishOptions): Promise<string>;
    /**
     * 订阅消息
     */
    subscribe(options: SubscribeOptions): Promise<string>;
    /**
     * 取消订阅
     */
    unsubscribe(subscriptionId: string): Promise<void>;
    /**
     * 获取统计信息
     */
    getStatistics(): MessageQueueStatistics;
    private connectRedis;
    private connectRabbitMQ;
    private connectKafka;
    private connectMemory;
    private disconnectProvider;
    private publishMessage;
    private publishToRedis;
    private publishToRabbitMQ;
    private publishToKafka;
    private publishToMemory;
    private subscribeToTopic;
    private subscribeToRedis;
    private subscribeToRabbitMQ;
    private subscribeToKafka;
    private subscribeToMemory;
    private unsubscribeFromTopic;
    private deliverMessage;
    private handleError;
    private calculateRetryDelay;
    private updatePublishStatistics;
    private simulateConnection;
    private simulateDisconnection;
    private simulateNetworkCall;
    private generateUUID;
    /**
     * 从连接字符串中提取主机名
     */
    private extractHostFromConnectionString;
    /**
     * 从连接字符串中提取端口号
     */
    private extractPortFromConnectionString;
    /**
     * 获取默认端口号
     */
    private getDefaultPort;
}
//# sourceMappingURL=message.queue.d.ts.map