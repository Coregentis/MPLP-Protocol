/**
 * @fileoverview MPLPAgent tests
 * @version 1.1.0-beta
 */

import { MPLPAgent } from '../MPLPAgent';
import { PlatformAdapterRegistry } from '../../adapters/PlatformAdapterRegistry';
import { TestPlatformAdapter } from '../../adapters/TestPlatformAdapter';
import { AgentConfig, AgentStatus, AgentCapability } from '../../types';
import { AgentLifecycleError, AgentStateError, MessageSendError } from '../../types/errors';

describe('MPLPAgent测试', () => {
  let registry: PlatformAdapterRegistry;
  let basicConfig: AgentConfig;
  let platformConfig: AgentConfig;

  beforeEach(() => {
    registry = PlatformAdapterRegistry.createInstance();
    registry.register('test', TestPlatformAdapter);

    basicConfig = {
      id: 'test-agent-1',
      name: 'TestAgent',
      capabilities: ['communication' as AgentCapability],
      description: 'Test agent for unit tests'
    };

    platformConfig = {
      id: 'platform-agent-1',
      name: 'PlatformAgent',
      capabilities: ['social_media_posting' as AgentCapability],
      platform: 'test',
      platformConfig: {
        simulateLatency: false,
        simulateErrors: false,
        connectionDelay: 10,
        messageDelay: 5
      }
    };
  });

  afterEach(() => {
    registry.clear();
  });

  describe('基础功能', () => {
    it('应该创建agent实例', () => {
      const agent = new MPLPAgent(basicConfig, registry);

      expect(agent.id).toBe('test-agent-1');
      expect(agent.name).toBe('TestAgent');
      expect(agent.capabilities).toEqual(['communication']);
      expect(agent.status).toBe(AgentStatus.IDLE);
    });

    it('应该提供只读配置', () => {
      const agent = new MPLPAgent(basicConfig, registry);
      const config = agent.getConfig();

      expect(config).toEqual(basicConfig);
      expect(config).not.toBe(basicConfig); // Should be a copy
    });

    it('应该提供状态信息', () => {
      const agent = new MPLPAgent(basicConfig, registry);
      const status = agent.getStatus();

      expect(status.status).toBe(AgentStatus.IDLE);
      expect(status.errorCount).toBe(0);
      expect(status.messageCount).toBe(0);
      expect(status.startTime).toBeUndefined();
      expect(status.uptime).toBeUndefined();
    });
  });

  describe('生命周期管理', () => {
    it('应该启动agent', async () => {
      const agent = new MPLPAgent(basicConfig, registry);
      const startedSpy = jest.fn();
      agent.on('started', startedSpy);

      await agent.start();

      expect(agent.status).toBe(AgentStatus.RUNNING);
      expect(startedSpy).toHaveBeenCalled();

      // 等待一小段时间确保uptime > 0
      await new Promise(resolve => setTimeout(resolve, 10));

      const status = agent.getStatus();
      expect(status.startTime).toBeDefined();
      expect(typeof status.uptime).toBe('number');
      expect(status.uptime).toBeGreaterThanOrEqual(0);
    });

    it('应该停止agent', async () => {
      const agent = new MPLPAgent(basicConfig, registry);
      const stoppedSpy = jest.fn();
      agent.on('stopped', stoppedSpy);

      await agent.start();
      await agent.stop();

      expect(agent.status).toBe(AgentStatus.STOPPED);
      expect(stoppedSpy).toHaveBeenCalled();
    });

    it('应该处理重复启动', async () => {
      const agent = new MPLPAgent(basicConfig, registry);

      await agent.start();
      await agent.start(); // Should not throw

      expect(agent.status).toBe(AgentStatus.RUNNING);
    });

    it('应该处理重复停止', async () => {
      const agent = new MPLPAgent(basicConfig, registry);

      await agent.start();
      await agent.stop();
      await agent.stop(); // Should not throw

      expect(agent.status).toBe(AgentStatus.STOPPED);
    });

    it('应该销毁agent', async () => {
      const agent = new MPLPAgent(basicConfig, registry);
      const destroyedSpy = jest.fn();
      agent.on('destroyed', destroyedSpy);

      await agent.start();
      await agent.destroy();

      expect(agent.status).toBe(AgentStatus.DESTROYED);
      expect(agent.isDestroyed()).toBe(true);
      expect(destroyedSpy).toHaveBeenCalled();
    });

    it('应该拒绝对已销毁agent的操作', async () => {
      const agent = new MPLPAgent(basicConfig, registry);

      await agent.destroy();

      await expect(agent.start()).rejects.toThrow(AgentStateError);
      await expect(agent.stop()).rejects.toThrow(AgentStateError);
      await expect(agent.sendMessage('test')).rejects.toThrow(AgentStateError);
      await expect(agent.updateConfig({})).rejects.toThrow(AgentStateError);
    });
  });

  describe('平台适配器集成', () => {
    it('应该初始化平台适配器', async () => {
      const agent = new MPLPAgent(platformConfig, registry);

      await agent.start();

      expect(agent.status).toBe(AgentStatus.RUNNING);
      const adapter = agent.getPlatformAdapter();
      expect(adapter).toBeDefined();
      expect(adapter?.name).toBe('test');
    });

    it('应该通过适配器发送消息', async () => {
      const agent = new MPLPAgent(platformConfig, registry);
      const messageSentSpy = jest.fn();
      agent.on('message-sent', messageSentSpy);

      await agent.start();
      await agent.sendMessage({ text: 'Hello, World!' });

      expect(messageSentSpy).toHaveBeenCalledWith({ text: 'Hello, World!' });

      const status = agent.getStatus();
      expect(status.messageCount).toBe(1);
    });

    it('应该处理适配器消息', async () => {
      const agent = new MPLPAgent(platformConfig, registry);
      const messageReceivedSpy = jest.fn();
      agent.on('message-received', messageReceivedSpy);

      await agent.start();

      const adapter = agent.getPlatformAdapter() as TestPlatformAdapter;
      adapter.simulateIncomingMessage({ text: 'Incoming message' });

      expect(messageReceivedSpy).toHaveBeenCalledWith({ text: 'Incoming message' });
    });

    it('应该在停止时断开适配器', async () => {
      const agent = new MPLPAgent(platformConfig, registry);

      await agent.start();
      const adapter = agent.getPlatformAdapter();
      expect(adapter?.status).toBe('connected');

      await agent.stop();
      expect(adapter?.status).toBe('disconnected');
    });
  });

  describe('行为处理', () => {
    it('应该调用启动行为', async () => {
      const onStart = jest.fn();
      const configWithBehavior = {
        ...basicConfig,
        behavior: { onStart }
      };

      const agent = new MPLPAgent(configWithBehavior, registry);
      await agent.start();

      expect(onStart).toHaveBeenCalled();
    });

    it('应该调用停止行为', async () => {
      const onStop = jest.fn();
      const configWithBehavior = {
        ...basicConfig,
        behavior: { onStop }
      };

      const agent = new MPLPAgent(configWithBehavior, registry);
      await agent.start();
      await agent.stop();

      expect(onStop).toHaveBeenCalled();
    });

    it('应该调用消息行为', async () => {
      const onMessage = jest.fn();
      const configWithBehavior = {
        ...platformConfig,
        behavior: { onMessage }
      };

      const agent = new MPLPAgent(configWithBehavior, registry);
      await agent.start();

      const adapter = agent.getPlatformAdapter() as TestPlatformAdapter;
      adapter.simulateIncomingMessage({ text: 'Test message' });

      expect(onMessage).toHaveBeenCalledWith({ text: 'Test message' });
    });

    it('应该调用错误行为', async () => {
      const onError = jest.fn();
      const configWithBehavior = {
        ...basicConfig,
        behavior: { onError }
      };

      const agent = new MPLPAgent(configWithBehavior, registry);
      const testError = new Error('Test error');

      agent.emit('error', testError);

      expect(onError).toHaveBeenCalledWith(testError);
    });
  });

  describe('错误处理', () => {
    it('应该处理启动错误', async () => {
      const invalidConfig = {
        ...platformConfig,
        platform: 'nonexistent'
      };

      const agent = new MPLPAgent(invalidConfig, registry);

      await expect(agent.start()).rejects.toThrow(AgentLifecycleError);
      expect(agent.status).toBe(AgentStatus.ERROR);
    });

    it('应该处理消息发送错误', async () => {
      const agent = new MPLPAgent(basicConfig, registry);

      await expect(agent.sendMessage('test')).rejects.toThrow(AgentStateError);
    });

    it('应该跟踪错误计数', async () => {
      const agent = new MPLPAgent(basicConfig, registry);
      const testError = new Error('Test error');

      agent.emit('error', testError);
      agent.emit('error', testError);

      const status = agent.getStatus();
      expect(status.errorCount).toBe(2);
    });
  });

  describe('配置更新', () => {
    it('应该更新agent配置', async () => {
      const agent = new MPLPAgent(basicConfig, registry);
      const newMetadata = { updated: true };

      await agent.updateConfig({ metadata: newMetadata });

      const config = agent.getConfig();
      expect(config.metadata).toEqual(newMetadata);
    });

    it('应该拒绝更改名称和ID', async () => {
      const agent = new MPLPAgent(basicConfig, registry);

      await expect(agent.updateConfig({ name: 'NewName' })).rejects.toThrow(AgentLifecycleError);
      await expect(agent.updateConfig({ id: 'new-id' })).rejects.toThrow(AgentLifecycleError);
    });
  });

  describe('状态变更事件', () => {
    it('应该发出状态变更事件', async () => {
      const agent = new MPLPAgent(basicConfig, registry);
      const statusChangedSpy = jest.fn();
      agent.on('status-changed', statusChangedSpy);

      await agent.start();

      expect(statusChangedSpy).toHaveBeenCalledWith(AgentStatus.STARTING, AgentStatus.IDLE);
      expect(statusChangedSpy).toHaveBeenCalledWith(AgentStatus.RUNNING, AgentStatus.STARTING);
    });
  });
});
