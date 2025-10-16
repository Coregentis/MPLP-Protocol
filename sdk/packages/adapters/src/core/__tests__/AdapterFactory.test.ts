/**
 * @fileoverview AdapterFactory tests
 */

import { AdapterFactory } from '../AdapterFactory';
import { TwitterAdapter } from '../../platforms/twitter/TwitterAdapter';
import { LinkedInAdapter } from '../../platforms/linkedin/LinkedInAdapter';
import { GitHubAdapter } from '../../platforms/github/GitHubAdapter';
import { AdapterConfig } from '../types';

describe('AdapterFactory测试', () => {
  let factory: AdapterFactory;

  beforeEach(() => {
    factory = AdapterFactory.getInstance();
  });

  describe('单例模式测试', () => {
    it('应该返回相同的实例', () => {
      const factory1 = AdapterFactory.getInstance();
      const factory2 = AdapterFactory.getInstance();
      
      expect(factory1).toBe(factory2);
    });
  });

  describe('适配器创建测试', () => {
    it('应该创建Twitter适配器', () => {
      const config: AdapterConfig = {
        platform: 'twitter',
        name: 'Test Twitter',
        version: '1.0.0',
        enabled: true,
        auth: {
          type: 'oauth1',
          credentials: {
            apiKey: 'test',
            apiSecret: 'test',
            accessToken: 'test',
            accessTokenSecret: 'test'
          }
        }
      };

      const adapter = factory.createAdapter('twitter', config);
      expect(adapter).toBeInstanceOf(TwitterAdapter);
      expect(adapter.config).toEqual(config);
    });

    it('应该创建LinkedIn适配器', () => {
      const config: AdapterConfig = {
        platform: 'linkedin',
        name: 'Test LinkedIn',
        version: '1.0.0',
        enabled: true,
        auth: {
          type: 'oauth2',
          credentials: {
            clientId: 'test',
            clientSecret: 'test',
            accessToken: 'test'
          }
        }
      };

      const adapter = factory.createAdapter('linkedin', config);
      expect(adapter).toBeInstanceOf(LinkedInAdapter);
      expect(adapter.config).toEqual(config);
    });

    it('应该创建GitHub适配器', () => {
      const config: AdapterConfig = {
        platform: 'github',
        name: 'Test GitHub',
        version: '1.0.0',
        enabled: true,
        auth: {
          type: 'bearer',
          credentials: {
            token: 'test-token'
          }
        }
      };

      const adapter = factory.createAdapter('github', config);
      expect(adapter).toBeInstanceOf(GitHubAdapter);
      expect(adapter.config).toEqual(config);
    });

    it('应该为不支持的平台抛出错误', () => {
      const config: AdapterConfig = {
        platform: 'unsupported' as any,
        name: 'Test',
        version: '1.0.0',
        enabled: true,
        auth: {
          type: 'bearer',
          credentials: {}
        }
      };

      expect(() => factory.createAdapter('unsupported' as any, config))
        .toThrow('Unsupported platform: unsupported');
    });
  });

  describe('支持的平台测试', () => {
    it('应该返回支持的平台列表', () => {
      const platforms = factory.getSupportedPlatforms();
      
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('linkedin');
      expect(platforms).toContain('github');
      expect(platforms).toContain('discord');
      expect(platforms).toContain('slack');
      expect(platforms).toContain('reddit');
      expect(platforms).toContain('medium');
      expect(platforms).toHaveLength(7);
    });
  });

  describe('默认配置测试', () => {
    it('应该返回Twitter的默认配置', () => {
      const config = factory.getDefaultConfig('twitter');
      
      expect(config.platform).toBe('twitter');
      expect(config.auth?.type).toBe('oauth1');
      expect(config.rateLimit?.requests).toBe(300);
    });

    it('应该返回LinkedIn的默认配置', () => {
      const config = factory.getDefaultConfig('linkedin');
      
      expect(config.platform).toBe('linkedin');
      expect(config.auth?.type).toBe('oauth2');
      expect(config.rateLimit?.requests).toBe(100);
    });

    it('应该返回GitHub的默认配置', () => {
      const config = factory.getDefaultConfig('github');
      
      expect(config.platform).toBe('github');
      expect(config.auth?.type).toBe('bearer');
      expect(config.rateLimit?.requests).toBe(5000);
    });
  });

  describe('配置验证测试', () => {
    it('应该验证有效的Twitter配置', () => {
      const config: AdapterConfig = {
        platform: 'twitter',
        name: 'Test',
        version: '1.0.0',
        enabled: true,
        auth: {
          type: 'oauth1',
          credentials: {
            apiKey: 'test',
            apiSecret: 'test',
            accessToken: 'test',
            accessTokenSecret: 'test'
          }
        }
      };

      expect(factory.validateConfig(config)).toBe(true);
    });

    it('应该拒绝无效的Twitter配置', () => {
      const config: AdapterConfig = {
        platform: 'twitter',
        name: 'Test',
        version: '1.0.0',
        enabled: true,
        auth: {
          type: 'oauth1',
          credentials: {
            apiKey: 'test'
            // Missing required credentials
          }
        }
      };

      expect(factory.validateConfig(config)).toBe(false);
    });

    it('应该验证有效的LinkedIn配置', () => {
      const config: AdapterConfig = {
        platform: 'linkedin',
        name: 'Test',
        version: '1.0.0',
        enabled: true,
        auth: {
          type: 'oauth2',
          credentials: {
            clientId: 'test',
            clientSecret: 'test',
            accessToken: 'test'
          }
        }
      };

      expect(factory.validateConfig(config)).toBe(true);
    });

    it('应该验证有效的GitHub配置', () => {
      const config: AdapterConfig = {
        platform: 'github',
        name: 'Test',
        version: '1.0.0',
        enabled: true,
        auth: {
          type: 'bearer',
          credentials: {
            token: 'test-token'
          }
        }
      };

      expect(factory.validateConfig(config)).toBe(true);
    });

    it('应该拒绝缺少基本字段的配置', () => {
      const config: Partial<AdapterConfig> = {
        platform: 'twitter'
        // Missing name, version, auth
      };

      expect(factory.validateConfig(config as AdapterConfig)).toBe(false);
    });
  });

  describe('配置模板测试', () => {
    it('应该返回Twitter配置模板', () => {
      const template = factory.getConfigTemplate('twitter');
      
      expect(template.auth.type).toBe('oauth1');
      expect(template.auth.credentials).toHaveProperty('apiKey');
      expect(template.auth.credentials).toHaveProperty('apiSecret');
      expect(template.settings).toHaveProperty('enableRetweets');
    });

    it('应该返回LinkedIn配置模板', () => {
      const template = factory.getConfigTemplate('linkedin');
      
      expect(template.auth.type).toBe('oauth2');
      expect(template.auth.credentials).toHaveProperty('clientId');
      expect(template.auth.credentials).toHaveProperty('clientSecret');
      expect(template.settings).toHaveProperty('defaultVisibility');
    });

    it('应该返回GitHub配置模板', () => {
      const template = factory.getConfigTemplate('github');
      
      expect(template.auth.type).toBe('bearer');
      expect(template.auth.credentials).toHaveProperty('token');
      expect(template.settings).toHaveProperty('defaultRepository');
    });
  });

  describe('平台能力测试', () => {
    it('应该返回Twitter平台能力', () => {
      const capabilities = factory.getPlatformCapabilities('twitter');
      
      expect(capabilities.platform).toBe('twitter');
      expect(capabilities.features.posting).toBe(true);
      expect(capabilities.features.commenting).toBe(true);
      expect(capabilities.limits.maxContentLength).toBe(280);
    });

    it('应该返回LinkedIn平台能力', () => {
      const capabilities = factory.getPlatformCapabilities('linkedin');
      
      expect(capabilities.platform).toBe('linkedin');
      expect(capabilities.features.posting).toBe(true);
      expect(capabilities.limits.maxContentLength).toBe(3000);
    });

    it('应该返回GitHub平台能力', () => {
      const capabilities = factory.getPlatformCapabilities('github');
      
      expect(capabilities.platform).toBe('github');
      expect(capabilities.features.posting).toBe(true);
      expect(capabilities.features.sharing).toBe(false); // GitHub doesn't have direct sharing
      expect(capabilities.limits.maxContentLength).toBe(65536);
    });
  });

  describe('批量创建测试', () => {
    it('应该从配置创建多个适配器', () => {
      const configs = {
        twitter: {
          platform: 'twitter' as const,
          name: 'Twitter',
          version: '1.0.0',
          enabled: true,
          auth: {
            type: 'oauth1' as const,
            credentials: {
              apiKey: 'test',
              apiSecret: 'test',
              accessToken: 'test',
              accessTokenSecret: 'test'
            }
          }
        },
        github: {
          platform: 'github' as const,
          name: 'GitHub',
          version: '1.0.0',
          enabled: true,
          auth: {
            type: 'bearer' as const,
            credentials: {
              token: 'test-token'
            }
          }
        }
      };

      const adapters = factory.createAdaptersFromConfig(configs);
      
      expect(adapters.size).toBe(2);
      expect(adapters.get('twitter')).toBeInstanceOf(TwitterAdapter);
      expect(adapters.get('github')).toBeInstanceOf(GitHubAdapter);
    });

    it('应该跳过无效配置', () => {
      const configs = {
        valid: {
          platform: 'twitter' as const,
          name: 'Twitter',
          version: '1.0.0',
          enabled: true,
          auth: {
            type: 'oauth1' as const,
            credentials: {
              apiKey: 'test',
              apiSecret: 'test',
              accessToken: 'test',
              accessTokenSecret: 'test'
            }
          }
        },
        invalid: {
          platform: 'twitter' as const,
          name: 'Invalid',
          version: '1.0.0',
          enabled: true,
          auth: {
            type: 'oauth1' as const,
            credentials: {
              // Missing required credentials
            }
          }
        }
      };

      const adapters = factory.createAdaptersFromConfig(configs);
      
      expect(adapters.size).toBe(1);
      expect(adapters.get('valid')).toBeInstanceOf(TwitterAdapter);
      expect(adapters.get('invalid')).toBeUndefined();
    });
  });

  describe('适配器信息测试', () => {
    it('应该返回完整的适配器信息', () => {
      const info = factory.getAdapterInfo('twitter');
      
      expect(info.platform).toBe('twitter');
      expect(info.name).toBe('Twitter Adapter');
      expect(info.version).toBe('1.0.0');
      expect(info.capabilities).toBeDefined();
      expect(info.configTemplate).toBeDefined();
      expect(info.documentation).toContain('twitter');
    });
  });
});
