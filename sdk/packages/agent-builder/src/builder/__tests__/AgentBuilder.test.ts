/**
 * @fileoverview AgentBuilder tests
 * @version 1.1.0-beta
 */

import { AgentBuilder } from '../AgentBuilder';
import { PlatformAdapterRegistry } from '../../adapters/PlatformAdapterRegistry';
import { TestPlatformAdapter } from '../../adapters/TestPlatformAdapter';
import { AgentConfigurationError, AgentBuildError, PlatformAdapterNotFoundError } from '../../types/errors';
import { AgentCapability, AgentStatus } from '../../types';

describe('AgentBuilder测试', () => {
  let registry: PlatformAdapterRegistry;
  let builder: AgentBuilder;

  beforeEach(() => {
    registry = PlatformAdapterRegistry.createInstance();
    registry.register('test', TestPlatformAdapter);
    builder = AgentBuilder.createWithRegistry(registry) as AgentBuilder;
  });

  afterEach(() => {
    registry.clear();
  });

  describe('基础构建功能', () => {
    it('应该创建基本的agent', () => {
      const agent = builder
        .withName('TestAgent')
        .withCapability('communication')
        .build();

      expect(agent.name).toBe('TestAgent');
      expect(agent.capabilities).toContain('communication');
      expect(agent.status).toBe(AgentStatus.IDLE);
      expect(agent.id).toBeDefined();
    });

    it('应该支持链式调用', () => {
      const result = builder
        .withName('ChainAgent')
        .withCapability('social_media_posting')
        .withCapability('content_generation')
        .withDescription('Test chain agent')
        .withMetadata({ test: true });

      expect(result).toBe(builder);
    });

    it('应该生成唯一的agent ID', () => {
      const agent1 = builder.withName('Agent1').withCapability('communication').build();
      const agent2 = builder.reset().withName('Agent2').withCapability('communication').build();

      expect(agent1.id).toBeDefined();
      expect(agent2.id).toBeDefined();
      expect(agent1.id).not.toBe(agent2.id);
    });

    it('应该支持自定义agent ID', () => {
      const customId = 'custom-agent-123';
      const agent = builder
        .withId(customId)
        .withName('CustomAgent')
        .withCapability('communication')
        .build();

      expect(agent.id).toBe(customId);
    });
  });

  describe('名称配置', () => {
    it('应该设置agent名称', () => {
      builder.withName('MyAgent');
      const config = builder.getConfig();
      expect(config.name).toBe('MyAgent');
    });

    it('应该拒绝空名称', () => {
      expect(() => builder.withName('')).toThrow(AgentConfigurationError);
      expect(() => builder.withName('   ')).toThrow(AgentConfigurationError);
    });

    it('应该拒绝非字符串名称', () => {
      expect(() => builder.withName(null as any)).toThrow(AgentConfigurationError);
      expect(() => builder.withName(123 as any)).toThrow(AgentConfigurationError);
    });

    it('应该修剪名称空白字符', () => {
      builder.withName('  SpacedAgent  ');
      const config = builder.getConfig();
      expect(config.name).toBe('SpacedAgent');
    });
  });

  describe('能力配置', () => {
    it('应该添加单个能力', () => {
      builder.withCapability('social_media_posting');
      const config = builder.getConfig();
      expect(config.capabilities).toContain('social_media_posting');
    });

    it('应该添加多个能力', () => {
      builder
        .withCapability('social_media_posting')
        .withCapability('content_generation')
        .withCapability('data_analysis');

      const config = builder.getConfig();
      expect(config.capabilities).toHaveLength(3);
      expect(config.capabilities).toContain('social_media_posting');
      expect(config.capabilities).toContain('content_generation');
      expect(config.capabilities).toContain('data_analysis');
    });

    it('应该支持批量添加能力', () => {
      const capabilities: AgentCapability[] = ['communication', 'monitoring', 'custom'];
      builder.withCapabilities(capabilities);

      const config = builder.getConfig();
      expect(config.capabilities).toHaveLength(3);
      capabilities.forEach(cap => {
        expect(config.capabilities).toContain(cap);
      });
    });

    it('应该避免重复能力', () => {
      builder
        .withCapability('communication')
        .withCapability('communication')
        .withCapability('monitoring');

      const config = builder.getConfig();
      expect(config.capabilities).toHaveLength(2);
      expect(config.capabilities).toContain('communication');
      expect(config.capabilities).toContain('monitoring');
    });

    it('应该拒绝非数组的批量能力', () => {
      expect(() => builder.withCapabilities('invalid' as any)).toThrow(AgentConfigurationError);
    });
  });

  describe('平台配置', () => {
    it('应该设置平台和配置', () => {
      const platformConfig = { apiKey: 'test-key', timeout: 5000 };
      builder.withPlatform('test', platformConfig);

      const config = builder.getConfig();
      expect(config.platform).toBe('test');
      expect(config.platformConfig).toEqual(platformConfig);
    });

    it('应该拒绝未注册的平台', () => {
      expect(() => {
        builder.withPlatform('unknown', { apiKey: 'test' });
      }).toThrow(PlatformAdapterNotFoundError);
    });

    it('应该验证平台配置', () => {
      expect(() => {
        builder.withPlatform('', { apiKey: 'test' });
      }).toThrow(AgentConfigurationError);

      expect(() => {
        builder.withPlatform('test', null as any);
      }).toThrow(AgentConfigurationError);
    });

    it('应该深度克隆平台配置', () => {
      const originalConfig = { apiKey: 'test', nested: { value: 123 } };
      builder.withPlatform('test', originalConfig);

      const config = builder.getConfig();
      expect(config.platformConfig).toEqual(originalConfig);
      expect(config.platformConfig).not.toBe(originalConfig);
    });
  });

  describe('行为配置', () => {
    it('应该设置agent行为', () => {
      const behavior = {
        onStart: jest.fn(),
        onStop: jest.fn(),
        onMessage: jest.fn()
      };

      builder.withBehavior(behavior);
      const config = builder.getConfig();
      expect(config.behavior).toEqual(behavior);
    });

    it('应该合并多个行为配置', () => {
      const behavior1 = { onStart: jest.fn() };
      const behavior2 = { onStop: jest.fn(), onMessage: jest.fn() };

      builder.withBehavior(behavior1).withBehavior(behavior2);
      const config = builder.getConfig();

      expect(config.behavior).toHaveProperty('onStart');
      expect(config.behavior).toHaveProperty('onStop');
      expect(config.behavior).toHaveProperty('onMessage');
    });

    it('应该拒绝无效的行为配置', () => {
      expect(() => builder.withBehavior(null as any)).toThrow(AgentConfigurationError);
      expect(() => builder.withBehavior('invalid' as any)).toThrow(AgentConfigurationError);
    });
  });

  describe('元数据配置', () => {
    it('应该设置元数据', () => {
      const metadata = { version: '1.0', environment: 'test' };
      builder.withMetadata(metadata);

      const config = builder.getConfig();
      expect(config.metadata).toEqual(metadata);
    });

    it('应该合并多个元数据', () => {
      builder
        .withMetadata({ key1: 'value1' })
        .withMetadata({ key2: 'value2' });

      const config = builder.getConfig();
      expect(config.metadata).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('应该拒绝无效的元数据', () => {
      expect(() => builder.withMetadata(null as any)).toThrow(AgentConfigurationError);
      expect(() => builder.withMetadata([] as any)).toThrow(AgentConfigurationError);
    });
  });

  describe('构建验证', () => {
    it('应该要求agent名称', () => {
      expect(() => {
        builder.withCapability('communication').build();
      }).toThrow(AgentBuildError);
    });

    it('应该要求至少一个能力', () => {
      expect(() => {
        builder.withName('TestAgent').build();
      }).toThrow(AgentBuildError);
    });

    it('应该构建完整的agent', () => {
      const agent = builder
        .withName('CompleteAgent')
        .withCapability('communication')
        .withDescription('A complete test agent')
        .withMetadata({ test: true })
        .build();

      expect(agent).toBeDefined();
      expect(agent.name).toBe('CompleteAgent');
      expect(agent.capabilities).toContain('communication');
    });
  });

  describe('构建器管理', () => {
    it('应该重置构建器状态', () => {
      builder
        .withName('TestAgent')
        .withCapability('communication')
        .withMetadata({ test: true });

      builder.reset();
      const config = builder.getConfig();

      expect(config.name).toBeUndefined();
      expect(config.capabilities).toHaveLength(0);
      expect(config.metadata).toBeUndefined();
    });

    it('应该克隆构建器', () => {
      builder
        .withName('OriginalAgent')
        .withCapability('communication');

      const cloned = builder.clone();
      const originalConfig = builder.getConfig();
      const clonedConfig = cloned.getConfig();

      expect(clonedConfig).toEqual(originalConfig);
      expect(clonedConfig).not.toBe(originalConfig);
    });

    it('应该创建静态构建器实例', () => {
      const staticBuilder = AgentBuilder.create('StaticAgent');
      const config = staticBuilder.getConfig();
      expect(config.name).toBe('StaticAgent');
    });
  });

  describe('错误处理', () => {
    it('应该处理构建错误', () => {
      expect(() => {
        builder.withName('').withCapability('communication').build();
      }).toThrow();
    });
  });
});
