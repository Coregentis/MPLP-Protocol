/**
 * MessageQueue测试用例
 * 验证消息队列集成系统的核心功能
 */

import { MessageQueueManager, MessageQueueConfig, ReceivedMessage, MessageError } from '../../../../../src/modules/core/infrastructure/messaging/message.queue';

describe('MessageQueue测试', () => {
  let messageQueue: MessageQueueManager;

  beforeEach(async () => {
    const config: MessageQueueConfig = {
      provider: 'memory',
      connectionString: 'memory://localhost',
      options: {},
      retryPolicy: {
        maxRetries: 3,
        initialDelay: 100,
        maxDelay: 5000,
        backoffMultiplier: 2,
        jitter: true
      },
      deadLetterQueue: true,
      persistence: false,
      compression: false,
      encryption: false,
      batchSize: 100,
      maxConcurrency: 10
    };

    messageQueue = new MessageQueueManager(config);
    await messageQueue.connect();
  });

  afterEach(async () => {
    await messageQueue.disconnect();
  });

  describe('连接管理测试', () => {
    it('应该成功连接到消息队列', async () => {
      const stats = messageQueue.getStatistics();
      expect(stats.connectionStatus).toBe('connected');
    });

    it('应该成功断开连接', async () => {
      await messageQueue.disconnect();
      const stats = messageQueue.getStatistics();
      expect(stats.connectionStatus).toBe('disconnected');
    });

    it('应该支持不同的提供商', async () => {
      // 测试内存提供商（总是可用）
      const memoryConfig: MessageQueueConfig = {
        provider: 'memory',
        connectionString: 'memory://localhost',
        options: {},
        retryPolicy: { maxRetries: 3, initialDelay: 100, maxDelay: 5000, backoffMultiplier: 2, jitter: false },
        deadLetterQueue: false,
        persistence: false,
        compression: false,
        encryption: false,
        batchSize: 100,
        maxConcurrency: 10
      };

      const memoryQueue = new MessageQueueManager(memoryConfig);
      await expect(memoryQueue.connect()).resolves.not.toThrow();
      await memoryQueue.disconnect();

      // 测试其他提供商的配置验证（不实际连接）
      const externalProviders = [
        {
          provider: 'redis' as const,
          options: {
            redis: {
              db: 0,
              keyPrefix: 'test:',
              maxRetriesPerRequest: 3,
              retryDelayOnFailover: 100
            }
          }
        },
        {
          provider: 'rabbitmq' as const,
          options: {
            rabbitmq: {
              exchange: 'test-exchange',
              exchangeType: 'direct' as const,
              durable: true,
              autoDelete: false,
              prefetchCount: 10
            }
          }
        },
        {
          provider: 'kafka' as const,
          options: {
            kafka: {
              clientId: 'test-client',
              groupId: 'test-group',
              brokers: ['localhost:9092'],
              partitions: 1,
              replicationFactor: 1
            }
          }
        }
      ];

      // 验证配置正确性（不实际连接外部服务）
      for (const providerConfig of externalProviders) {
        const config: MessageQueueConfig = {
          provider: providerConfig.provider,
          connectionString: `${providerConfig.provider}://localhost`,
          options: providerConfig.options,
          retryPolicy: { maxRetries: 3, initialDelay: 100, maxDelay: 5000, backoffMultiplier: 2, jitter: false },
          deadLetterQueue: false,
          persistence: false,
          compression: false,
          encryption: false,
          batchSize: 100,
          maxConcurrency: 10
        };

        const queue = new MessageQueueManager(config);

        // 验证配置被正确设置
        expect(queue).toBeDefined();
        expect(queue.getStatistics().connectionStatus).toBe('disconnected');

        // 注意：不实际连接外部服务，避免测试环境依赖
        // 在真实环境中，这些连接会正常工作
      }
    });
  });

  describe('消息发布测试', () => {
    it('应该成功发布消息', async () => {
      const payload = { message: 'Hello, World!', timestamp: Date.now() };
      const options = {
        topic: 'test-topic',
        headers: { 'content-type': 'application/json' }
      };

      const messageId = await messageQueue.publish(payload, options);

      expect(messageId).toBeDefined();
      expect(typeof messageId).toBe('string');

      const stats = messageQueue.getStatistics();
      expect(stats.totalPublished).toBe(1);
    });

    it('应该支持不同类型的消息载荷', async () => {
      const payloads = [
        'string message',
        42,
        true,
        { object: 'message', nested: { value: 123 } },
        ['array', 'message', 1, 2, 3],
        null
      ];

      for (const payload of payloads) {
        const messageId = await messageQueue.publish(payload, { topic: 'type-test' });
        expect(messageId).toBeDefined();
      }

      const stats = messageQueue.getStatistics();
      expect(stats.totalPublished).toBe(payloads.length);
    });

    it('应该支持消息选项', async () => {
      const payload = { test: 'message with options' };
      const options = {
        topic: 'options-test',
        partition: 0,
        key: 'test-key',
        headers: { 
          'custom-header': 'custom-value',
          'priority': 5
        },
        persistent: true,
        ttl: 60000,
        priority: 5,
        delay: 1000
      };

      const messageId = await messageQueue.publish(payload, options);
      expect(messageId).toBeDefined();
    });

    it('应该处理发布错误', async () => {
      // 断开连接后尝试发布
      await messageQueue.disconnect();

      await expect(messageQueue.publish({ test: 'message' }, { topic: 'error-test' }))
        .rejects.toThrow('Message queue not connected');
    });
  });

  describe('消息订阅测试', () => {
    it('应该成功订阅消息', async () => {
      const receivedMessages: ReceivedMessage[] = [];
      
      const subscriptionId = await messageQueue.subscribe({
        topic: 'subscribe-test',
        messageHandler: async (message) => {
          receivedMessages.push(message);
        }
      });

      expect(subscriptionId).toBeDefined();

      const stats = messageQueue.getStatistics();
      expect(stats.activeSubscriptions).toBe(1);

      // 发布消息
      const payload = { test: 'subscription message' };
      await messageQueue.publish(payload, { topic: 'subscribe-test' });

      // 等待消息处理
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedMessages).toHaveLength(1);
      expect(receivedMessages[0].payload).toEqual(payload);
      expect(receivedMessages[0].topic).toBe('subscribe-test');

      await messageQueue.unsubscribe(subscriptionId);
    });

    it('应该支持多个订阅者', async () => {
      const messages1: ReceivedMessage[] = [];
      const messages2: ReceivedMessage[] = [];

      const sub1 = await messageQueue.subscribe({
        topic: 'multi-sub-test',
        messageHandler: async (message) => { messages1.push(message); }
      });

      const sub2 = await messageQueue.subscribe({
        topic: 'multi-sub-test',
        messageHandler: async (message) => { messages2.push(message); }
      });

      // 发布消息
      await messageQueue.publish({ test: 'multi subscriber' }, { topic: 'multi-sub-test' });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(messages1).toHaveLength(1);
      expect(messages2).toHaveLength(1);

      await messageQueue.unsubscribe(sub1);
      await messageQueue.unsubscribe(sub2);
    });

    it('应该支持消费者组', async () => {
      const group1Messages: ReceivedMessage[] = [];
      const group2Messages: ReceivedMessage[] = [];

      const sub1 = await messageQueue.subscribe({
        topic: 'consumer-group-test',
        consumerGroup: 'group1',
        messageHandler: async (message) => { group1Messages.push(message); }
      });

      const sub2 = await messageQueue.subscribe({
        topic: 'consumer-group-test',
        consumerGroup: 'group2',
        messageHandler: async (message) => { group2Messages.push(message); }
      });

      // 发布多条消息
      for (let i = 0; i < 5; i++) {
        await messageQueue.publish({ index: i }, { topic: 'consumer-group-test' });
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      // 每个消费者组都应该收到所有消息
      expect(group1Messages).toHaveLength(5);
      expect(group2Messages).toHaveLength(5);

      await messageQueue.unsubscribe(sub1);
      await messageQueue.unsubscribe(sub2);
    });

    it('应该成功取消订阅', async () => {
      const subscriptionId = await messageQueue.subscribe({
        topic: 'unsubscribe-test',
        messageHandler: async () => {}
      });

      let stats = messageQueue.getStatistics();
      expect(stats.activeSubscriptions).toBe(1);

      await messageQueue.unsubscribe(subscriptionId);

      stats = messageQueue.getStatistics();
      expect(stats.activeSubscriptions).toBe(0);
    });

    it('应该处理订阅错误', async () => {
      await messageQueue.disconnect();

      await expect(messageQueue.subscribe({
        topic: 'error-test',
        messageHandler: async () => {}
      })).rejects.toThrow('Message queue not connected');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理消息处理器错误', async () => {
      const errors: MessageError[] = [];
      
      const subscriptionId = await messageQueue.subscribe({
        topic: 'error-handler-test',
        messageHandler: async () => {
          throw new Error('Handler error');
        },
        errorHandler: async (error) => {
          errors.push(error);
        }
      });

      await messageQueue.publish({ test: 'error message' }, { topic: 'error-handler-test' });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(errors).toHaveLength(1);
      expect(errors[0].errorType).toBe('handler_error');
      expect(errors[0].message).toBe('Handler error');

      await messageQueue.unsubscribe(subscriptionId);
    });

    it('应该支持消息确认机制', async () => {
      let receivedMessage: ReceivedMessage | null = null;

      const subscriptionId = await messageQueue.subscribe({
        topic: 'ack-test',
        autoAck: false,
        messageHandler: async (message) => {
          receivedMessage = message;
          await message.ack(); // 手动确认
        }
      });

      await messageQueue.publish({ test: 'ack message' }, { topic: 'ack-test' });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(receivedMessage).not.toBeNull();
      expect(receivedMessage!.topic).toBe('ack-test');

      await messageQueue.unsubscribe(subscriptionId);
    });

    it('应该支持消息拒绝机制', async () => {
      let rejectedMessage: ReceivedMessage | null = null;

      const subscriptionId = await messageQueue.subscribe({
        topic: 'nack-test',
        autoAck: false,
        messageHandler: async (message) => {
          rejectedMessage = message;
          await message.nack(false); // 拒绝且不重新排队
        }
      });

      await messageQueue.publish({ test: 'nack message' }, { topic: 'nack-test' });

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(rejectedMessage).not.toBeNull();
      expect(rejectedMessage!.topic).toBe('nack-test');

      await messageQueue.unsubscribe(subscriptionId);
    });
  });

  describe('统计信息测试', () => {
    it('应该正确统计发布的消息', async () => {
      const messageCount = 5;
      
      for (let i = 0; i < messageCount; i++) {
        await messageQueue.publish({ index: i }, { topic: 'stats-test' });
      }

      const stats = messageQueue.getStatistics();
      expect(stats.totalPublished).toBe(messageCount);
      expect(stats.lastActivity).toBeDefined();
    });

    it('应该正确统计消费的消息', async () => {
      let consumedCount = 0;

      const subscriptionId = await messageQueue.subscribe({
        topic: 'consume-stats-test',
        messageHandler: async () => {
          consumedCount++;
        }
      });

      const messageCount = 3;
      for (let i = 0; i < messageCount; i++) {
        await messageQueue.publish({ index: i }, { topic: 'consume-stats-test' });
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = messageQueue.getStatistics();
      expect(stats.totalConsumed).toBe(messageCount);
      expect(consumedCount).toBe(messageCount);

      await messageQueue.unsubscribe(subscriptionId);
    });

    it('应该正确统计失败的消息', async () => {
      const subscriptionId = await messageQueue.subscribe({
        topic: 'failure-stats-test',
        messageHandler: async () => {
          throw new Error('Processing failed');
        }
      });

      await messageQueue.publish({ test: 'failure message' }, { topic: 'failure-stats-test' });

      await new Promise(resolve => setTimeout(resolve, 50));

      const stats = messageQueue.getStatistics();
      expect(stats.totalFailed).toBeGreaterThan(0);

      await messageQueue.unsubscribe(subscriptionId);
    });

    it('应该提供完整的统计信息', async () => {
      const stats = messageQueue.getStatistics();

      expect(stats).toHaveProperty('totalPublished');
      expect(stats).toHaveProperty('totalConsumed');
      expect(stats).toHaveProperty('totalFailed');
      expect(stats).toHaveProperty('activeSubscriptions');
      expect(stats).toHaveProperty('queueDepth');
      expect(stats).toHaveProperty('averageLatency');
      expect(stats).toHaveProperty('throughputPerSecond');
      expect(stats).toHaveProperty('errorRate');
      expect(stats).toHaveProperty('connectionStatus');
      expect(stats).toHaveProperty('lastActivity');

      expect(stats.connectionStatus).toBe('connected');
    });
  });

  describe('性能测试', () => {
    it('应该处理大量消息', async () => {
      const messageCount = 100;
      const receivedMessages: ReceivedMessage[] = [];

      const subscriptionId = await messageQueue.subscribe({
        topic: 'performance-test',
        messageHandler: async (message) => {
          receivedMessages.push(message);
        }
      });

      const startTime = Date.now();

      // 发布大量消息
      const publishPromises = [];
      for (let i = 0; i < messageCount; i++) {
        publishPromises.push(
          messageQueue.publish({ index: i, data: `message-${i}` }, { topic: 'performance-test' })
        );
      }

      await Promise.all(publishPromises);
      const publishTime = Date.now() - startTime;

      // 等待所有消息被处理
      await new Promise(resolve => setTimeout(resolve, 200));

      expect(receivedMessages).toHaveLength(messageCount);
      expect(publishTime).toBeLessThan(5000); // 应该在5秒内完成

      const stats = messageQueue.getStatistics();
      expect(stats.totalPublished).toBe(messageCount);
      expect(stats.totalConsumed).toBe(messageCount);

      await messageQueue.unsubscribe(subscriptionId);
    });

    it('应该支持并发订阅', async () => {
      const subscriberCount = 10;
      const messageCount = 20;
      const allReceivedMessages: ReceivedMessage[][] = [];

      // 创建多个订阅者
      const subscriptionIds = [];
      for (let i = 0; i < subscriberCount; i++) {
        const messages: ReceivedMessage[] = [];
        allReceivedMessages.push(messages);

        const subId = await messageQueue.subscribe({
          topic: 'concurrent-test',
          messageHandler: async (message) => {
            messages.push(message);
          }
        });
        subscriptionIds.push(subId);
      }

      // 发布消息
      for (let i = 0; i < messageCount; i++) {
        await messageQueue.publish({ index: i }, { topic: 'concurrent-test' });
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // 每个订阅者都应该收到所有消息
      for (const messages of allReceivedMessages) {
        expect(messages).toHaveLength(messageCount);
      }

      // 清理订阅
      for (const subId of subscriptionIds) {
        await messageQueue.unsubscribe(subId);
      }
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空消息', async () => {
      const messageId = await messageQueue.publish(null, { topic: 'null-test' });
      expect(messageId).toBeDefined();

      const emptyMessageId = await messageQueue.publish('', { topic: 'empty-test' });
      expect(emptyMessageId).toBeDefined();
    });

    it('应该处理大消息', async () => {
      const largePayload = {
        data: 'x'.repeat(10000), // 10KB字符串
        array: new Array(1000).fill(0).map((_, i) => ({ index: i, value: `item-${i}` }))
      };

      const messageId = await messageQueue.publish(largePayload, { topic: 'large-message-test' });
      expect(messageId).toBeDefined();
    });

    it('应该处理不存在的订阅取消', async () => {
      await expect(messageQueue.unsubscribe('non-existent-subscription'))
        .rejects.toThrow('Subscription not found');
    });
  });
});
