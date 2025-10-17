"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageQueueManager = void 0;
class MessageQueueManager {
    config;
    provider;
    connection = null;
    subscriptions = new Map();
    statistics;
    reconnectTimer = null;
    constructor(config) {
        this.config = config;
        this.provider = config.provider;
        this.statistics = {
            totalPublished: 0,
            totalConsumed: 0,
            totalFailed: 0,
            activeSubscriptions: 0,
            queueDepth: 0,
            averageLatency: 0,
            throughputPerSecond: 0,
            errorRate: 0,
            connectionStatus: 'disconnected',
            lastActivity: new Date().toISOString()
        };
    }
    async connect() {
        try {
            switch (this.provider) {
                case 'redis':
                    await this.connectRedis();
                    break;
                case 'rabbitmq':
                    await this.connectRabbitMQ();
                    break;
                case 'kafka':
                    await this.connectKafka();
                    break;
                case 'memory':
                    await this.connectMemory();
                    break;
                default:
                    throw new Error(`Unsupported provider: ${this.provider}`);
            }
            this.statistics.connectionStatus = 'connected';
            console.log(`Connected to ${this.provider} message queue`);
        }
        catch (error) {
            this.statistics.connectionStatus = 'error';
            throw new Error(`Failed to connect to ${this.provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async disconnect() {
        try {
            for (const [subscriptionId] of this.subscriptions) {
                await this.unsubscribe(subscriptionId);
            }
            if (this.connection) {
                await this.disconnectProvider();
                this.connection = null;
            }
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            this.statistics.connectionStatus = 'disconnected';
            console.log(`Disconnected from ${this.provider} message queue`);
        }
        catch (error) {
            console.error(`Error disconnecting from ${this.provider}:`, error);
        }
    }
    async publish(payload, options) {
        if (this.statistics.connectionStatus !== 'connected') {
            throw new Error('Message queue not connected');
        }
        const messageId = this.generateUUID();
        const message = {
            messageId,
            topic: options.topic,
            payload,
            headers: {
                contentType: 'application/json',
                correlationId: this.generateUUID(),
                ...options.headers
            },
            metadata: {
                source: 'MessageQueueManager',
                version: '1.0.0',
                retryCount: 0,
                maxRetries: this.config.retryPolicy.maxRetries,
                tags: [],
                properties: {}
            },
            createdAt: new Date().toISOString(),
            expiresAt: options.ttl ? new Date(Date.now() + options.ttl).toISOString() : undefined
        };
        try {
            const startTime = Date.now();
            await this.publishMessage(message, options);
            const latency = Date.now() - startTime;
            this.updatePublishStatistics(latency);
            console.log(`Message published: ${messageId} to topic: ${options.topic}`);
            return messageId;
        }
        catch (error) {
            this.statistics.totalFailed++;
            const messageError = {
                errorId: this.generateUUID(),
                errorType: 'handler_error',
                message: error instanceof Error ? error.message : 'Unknown publish error',
                originalError: error instanceof Error ? error : undefined,
                messageId,
                topic: options.topic,
                retryCount: 0,
                timestamp: new Date().toISOString()
            };
            await this.handleError(messageError);
            throw error;
        }
    }
    async subscribe(options) {
        if (this.statistics.connectionStatus !== 'connected') {
            throw new Error('Message queue not connected');
        }
        const subscriptionId = this.generateUUID();
        const subscription = {
            subscriptionId,
            topic: options.topic,
            consumerGroup: options.consumerGroup,
            messageHandler: options.messageHandler,
            errorHandler: options.errorHandler,
            options,
            active: true,
            createdAt: new Date().toISOString(),
            messageCount: 0,
            errorCount: 0
        };
        try {
            await this.subscribeToTopic(subscription);
            this.subscriptions.set(subscriptionId, subscription);
            this.statistics.activeSubscriptions++;
            console.log(`Subscribed to topic: ${options.topic} with ID: ${subscriptionId}`);
            return subscriptionId;
        }
        catch (error) {
            const messageError = {
                errorId: this.generateUUID(),
                errorType: 'consumer_error',
                message: error instanceof Error ? error.message : 'Unknown subscribe error',
                originalError: error instanceof Error ? error : undefined,
                topic: options.topic,
                retryCount: 0,
                timestamp: new Date().toISOString()
            };
            await this.handleError(messageError);
            throw error;
        }
    }
    async unsubscribe(subscriptionId) {
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error(`Subscription not found: ${subscriptionId}`);
        }
        try {
            await this.unsubscribeFromTopic(subscription);
            this.subscriptions.delete(subscriptionId);
            this.statistics.activeSubscriptions--;
            console.log(`Unsubscribed from topic: ${subscription.topic} with ID: ${subscriptionId}`);
        }
        catch (error) {
            console.error(`Error unsubscribing from ${subscription.topic}:`, error);
            throw error;
        }
    }
    getStatistics() {
        return { ...this.statistics };
    }
    async connectRedis() {
        try {
            const redisOptions = this.config.options.redis;
            if (!redisOptions) {
                throw new Error('Redis options not configured');
            }
            console.log('Connecting to Redis...');
            const connectionParams = {
                host: this.extractHostFromConnectionString(),
                port: this.extractPortFromConnectionString(),
                db: redisOptions.db,
                keyPrefix: redisOptions.keyPrefix,
                maxRetriesPerRequest: redisOptions.maxRetriesPerRequest,
                retryDelayOnFailover: redisOptions.retryDelayOnFailover
            };
            if (!connectionParams.host || !connectionParams.port) {
                throw new Error('Invalid Redis connection string');
            }
            await this.simulateConnection();
            this.connection = {
                type: 'redis',
                connected: true,
                config: connectionParams
            };
            console.log(`Connected to Redis at ${connectionParams.host}:${connectionParams.port}`);
        }
        catch (error) {
            throw new Error(`Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async connectRabbitMQ() {
        try {
            const rabbitmqOptions = this.config.options.rabbitmq;
            if (!rabbitmqOptions) {
                throw new Error('RabbitMQ options not configured');
            }
            console.log('Connecting to RabbitMQ...');
            if (!this.config.connectionString.startsWith('amqp://') && !this.config.connectionString.startsWith('amqps://')) {
                throw new Error('Invalid RabbitMQ connection string format');
            }
            const connectionParams = {
                url: this.config.connectionString,
                exchange: rabbitmqOptions.exchange,
                exchangeType: rabbitmqOptions.exchangeType,
                durable: rabbitmqOptions.durable,
                autoDelete: rabbitmqOptions.autoDelete,
                prefetchCount: rabbitmqOptions.prefetchCount
            };
            await this.simulateConnection();
            this.connection = {
                type: 'rabbitmq',
                connected: true,
                config: connectionParams
            };
            console.log(`Connected to RabbitMQ exchange: ${connectionParams.exchange}`);
        }
        catch (error) {
            throw new Error(`RabbitMQ connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async connectKafka() {
        try {
            const kafkaOptions = this.config.options.kafka;
            if (!kafkaOptions) {
                throw new Error('Kafka options not configured');
            }
            console.log('Connecting to Kafka...');
            const brokers = this.config.connectionString.split(',').map(broker => broker.trim());
            if (!brokers.length) {
                throw new Error('No Kafka brokers configured');
            }
            for (const broker of brokers) {
                if (!broker.includes(':')) {
                    throw new Error(`Invalid Kafka broker format: ${broker}`);
                }
            }
            const connectionParams = {
                brokers,
                groupId: kafkaOptions.groupId,
                partitions: kafkaOptions.partitions,
                replicationFactor: kafkaOptions.replicationFactor,
                acks: kafkaOptions.acks,
                compression: kafkaOptions.compression
            };
            await this.simulateConnection();
            this.connection = {
                type: 'kafka',
                connected: true,
                config: connectionParams
            };
            console.log(`Connected to Kafka brokers: ${connectionParams.brokers.join(', ')}`);
        }
        catch (error) {
            throw new Error(`Kafka connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async connectMemory() {
        this.connection = {
            type: 'memory',
            connected: true,
            topics: new Map(),
            subscribers: new Map()
        };
    }
    async disconnectProvider() {
        switch (this.provider) {
            case 'redis':
            case 'rabbitmq':
            case 'kafka':
                await this.simulateDisconnection();
                break;
            case 'memory':
                if (this.connection?.topics && this.connection?.subscribers) {
                    this.connection.topics.clear();
                    this.connection.subscribers.clear();
                }
                break;
        }
    }
    async publishMessage(message, options) {
        switch (this.provider) {
            case 'redis':
                await this.publishToRedis(message, options);
                break;
            case 'rabbitmq':
                await this.publishToRabbitMQ(message, options);
                break;
            case 'kafka':
                await this.publishToKafka(message, options);
                break;
            case 'memory':
                await this.publishToMemory(message, options);
                break;
        }
    }
    async publishToRedis(_message, options) {
        await this.simulateNetworkCall();
        console.log(`Published to Redis topic: ${options.topic}`);
    }
    async publishToRabbitMQ(_message, options) {
        await this.simulateNetworkCall();
        console.log(`Published to RabbitMQ topic: ${options.topic}`);
    }
    async publishToKafka(_message, options) {
        await this.simulateNetworkCall();
        console.log(`Published to Kafka topic: ${options.topic}`);
    }
    async publishToMemory(message, options) {
        if (!this.connection?.topics || !this.connection?.subscribers) {
            return;
        }
        const topics = this.connection.topics;
        if (!topics.has(options.topic)) {
            topics.set(options.topic, []);
        }
        topics.get(options.topic).push(message);
        const subscribers = this.connection.subscribers.get(options.topic) || [];
        for (const subscription of subscribers) {
            if (subscription.active) {
                await this.deliverMessage(message, subscription);
            }
        }
    }
    async subscribeToTopic(subscription) {
        switch (this.provider) {
            case 'redis':
                await this.subscribeToRedis(subscription);
                break;
            case 'rabbitmq':
                await this.subscribeToRabbitMQ(subscription);
                break;
            case 'kafka':
                await this.subscribeToKafka(subscription);
                break;
            case 'memory':
                await this.subscribeToMemory(subscription);
                break;
        }
    }
    async subscribeToRedis(subscription) {
        await this.simulateNetworkCall();
        console.log(`Subscribed to Redis topic: ${subscription.topic}`);
    }
    async subscribeToRabbitMQ(subscription) {
        await this.simulateNetworkCall();
        console.log(`Subscribed to RabbitMQ topic: ${subscription.topic}`);
    }
    async subscribeToKafka(subscription) {
        await this.simulateNetworkCall();
        console.log(`Subscribed to Kafka topic: ${subscription.topic}`);
    }
    async subscribeToMemory(subscription) {
        if (!this.connection?.subscribers || !this.connection?.topics) {
            return;
        }
        const subscribers = this.connection.subscribers;
        if (!subscribers.has(subscription.topic)) {
            subscribers.set(subscription.topic, []);
        }
        subscribers.get(subscription.topic).push(subscription);
        const messages = this.connection.topics.get(subscription.topic) || [];
        for (const message of messages) {
            await this.deliverMessage(message, subscription);
        }
    }
    async unsubscribeFromTopic(subscription) {
        subscription.active = false;
        if (this.provider === 'memory' && this.connection?.subscribers) {
            const subscribers = this.connection.subscribers.get(subscription.topic) || [];
            const index = subscribers.findIndex((s) => s.subscriptionId === subscription.subscriptionId);
            if (index >= 0) {
                subscribers.splice(index, 1);
            }
        }
    }
    async deliverMessage(message, subscription) {
        const receivedMessage = {
            ...message,
            deliveryTag: this.generateUUID(),
            redelivered: false,
            receivedAt: new Date().toISOString(),
            ack: async () => { },
            nack: async (_requeue = true) => { },
            reject: async (_requeue = false) => { }
        };
        try {
            await subscription.messageHandler(receivedMessage);
            subscription.messageCount++;
            this.statistics.totalConsumed++;
            this.statistics.lastActivity = new Date().toISOString();
        }
        catch (error) {
            subscription.errorCount++;
            this.statistics.totalFailed++;
            const messageError = {
                errorId: this.generateUUID(),
                errorType: 'handler_error',
                message: error instanceof Error ? error.message : 'Message handler error',
                originalError: error instanceof Error ? error : undefined,
                messageId: message.messageId,
                topic: message.topic,
                retryCount: message.metadata.retryCount,
                timestamp: new Date().toISOString()
            };
            if (subscription.errorHandler) {
                await subscription.errorHandler(messageError, receivedMessage);
            }
            else {
                await this.handleError(messageError, receivedMessage);
            }
        }
    }
    async handleError(error, message) {
        console.error(`Message queue error [${error.errorType}]:`, error.message);
        if (message && error.retryCount < this.config.retryPolicy.maxRetries) {
            const delay = this.calculateRetryDelay(error.retryCount);
            setTimeout(async () => {
                try {
                    message.metadata.retryCount++;
                }
                catch (retryError) {
                    console.error('Retry failed:', retryError);
                }
            }, delay);
        }
    }
    calculateRetryDelay(retryCount) {
        const { initialDelay, maxDelay, backoffMultiplier, jitter } = this.config.retryPolicy;
        let delay = initialDelay * Math.pow(backoffMultiplier, retryCount);
        delay = Math.min(delay, maxDelay);
        if (jitter) {
            delay *= (0.5 + Math.random() * 0.5);
        }
        return delay;
    }
    updatePublishStatistics(latency) {
        this.statistics.totalPublished++;
        this.statistics.lastActivity = new Date().toISOString();
        const totalMessages = this.statistics.totalPublished + this.statistics.totalConsumed;
        this.statistics.averageLatency =
            (this.statistics.averageLatency * (totalMessages - 1) + latency) / totalMessages;
    }
    async simulateConnection() {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    async simulateDisconnection() {
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    async simulateNetworkCall() {
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    extractHostFromConnectionString() {
        try {
            if (this.config.connectionString.includes('://')) {
                const url = new URL(this.config.connectionString);
                return url.hostname;
            }
            else {
                const parts = this.config.connectionString.split(':');
                return parts[0] || 'localhost';
            }
        }
        catch (error) {
            return 'localhost';
        }
    }
    extractPortFromConnectionString() {
        try {
            if (this.config.connectionString.includes('://')) {
                const url = new URL(this.config.connectionString);
                return url.port ? parseInt(url.port, 10) : this.getDefaultPort();
            }
            else {
                const parts = this.config.connectionString.split(':');
                return parts[1] ? parseInt(parts[1], 10) : this.getDefaultPort();
            }
        }
        catch (error) {
            return this.getDefaultPort();
        }
    }
    getDefaultPort() {
        switch (this.provider) {
            case 'redis':
                return 6379;
            case 'rabbitmq':
                return 5672;
            case 'kafka':
                return 9092;
            default:
                return 0;
        }
    }
}
exports.MessageQueueManager = MessageQueueManager;
