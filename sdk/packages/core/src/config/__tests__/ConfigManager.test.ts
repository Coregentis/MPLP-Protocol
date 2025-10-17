import { ConfigManager, ConfigTemplate, ConfigValidationRule } from '../ConfigManager';
import { ApplicationConfig } from '../../application/ApplicationConfig';

describe('ConfigManager增强功能测试', () => {
  let baseConfig: ApplicationConfig;

  beforeEach(() => {
    baseConfig = {
      name: 'TestApp',
      version: '1.0.0',
      description: 'Test application'
    };
  });

  describe('基础功能', () => {
    it('应该正确初始化配置管理器', () => {
      const configManager = new ConfigManager(baseConfig);
      
      expect(configManager.get('name')).toBe('TestApp');
      expect(configManager.get('version')).toBe('1.0.0');
      expect(configManager.has('name')).toBe(true);
      expect(configManager.has('nonexistent')).toBe(false);
    });

    it('应该支持点号路径访问', () => {
      const config = {
        ...baseConfig,
        database: {
          host: 'localhost',
          port: 5432,
          credentials: {
            username: 'admin',
            password: 'secret'
          }
        }
      };

      const configManager = new ConfigManager(config);
      
      expect(configManager.get('database.host')).toBe('localhost');
      expect(configManager.get('database.port')).toBe(5432);
      expect(configManager.get('database.credentials.username')).toBe('admin');
      expect(configManager.get('nonexistent.key', 'default')).toBe('default');
    });

    it('应该支持设置和获取配置值', () => {
      const configManager = new ConfigManager(baseConfig);
      
      configManager.set('newKey', 'newValue');
      expect(configManager.get('newKey')).toBe('newValue');
      
      configManager.set('nested.deep.value', 42);
      expect(configManager.get('nested.deep.value')).toBe(42);
    });
  });

  describe('环境变量处理', () => {
    beforeEach(() => {
      process.env.TEST_HOST = 'test.example.com';
      process.env.TEST_PORT = '8080';
      process.env.TEST_DEBUG = 'true';
    });

    afterEach(() => {
      delete process.env.TEST_HOST;
      delete process.env.TEST_PORT;
      delete process.env.TEST_DEBUG;
    });

    it('应该处理环境变量替换', () => {
      const config = {
        ...baseConfig,
        server: {
          host: '${TEST_HOST}',
          port: '${TEST_PORT}',
          debug: '${TEST_DEBUG}',
          fallback: '${NONEXISTENT:default_value}'
        }
      };

      const configManager = new ConfigManager(config, {
        enableEnvironmentVariables: true
      });

      expect(configManager.get('server.host')).toBe('test.example.com');
      expect(configManager.get('server.port')).toBe('8080');
      expect(configManager.get('server.debug')).toBe('true');
      expect(configManager.get('server.fallback')).toBe('default_value');
    });

    it('应该跟踪环境变量来源', () => {
      const config = {
        ...baseConfig,
        host: '${TEST_HOST}'
      };

      const configManager = new ConfigManager(config, {
        enableEnvironmentVariables: true
      });

      expect(configManager.getSource('TEST_HOST')).toBe('environment');
    });
  });

  describe('配置验证', () => {
    it('应该支持添加验证规则', () => {
      const configManager = new ConfigManager(baseConfig);
      
      const rule: ConfigValidationRule = {
        key: 'port',
        validator: (value) => typeof value === 'number' && value > 0 && value < 65536,
        message: 'Port must be a number between 1 and 65535'
      };

      configManager.addValidationRule(rule);
      
      // Valid value should work
      configManager.set('port', 8080);
      expect(configManager.get('port')).toBe(8080);
      
      // Invalid value should throw
      expect(() => {
        configManager.set('port', -1);
      }).toThrow('Port must be a number between 1 and 65535');
    });

    it('应该验证整个配置', () => {
      const configManager = new ConfigManager(baseConfig);
      
      configManager.addValidationRule({
        key: 'email',
        validator: (value) => typeof value === 'string' && value.includes('@'),
        message: 'Email must be a valid email address'
      });

      expect(() => {
        configManager.set('email', 'invalid-email');
      }).toThrow('Email must be a valid email address');
    });
  });

  describe('配置模板', () => {
    it('应该支持应用配置模板', () => {
      const template: ConfigTemplate = {
        name: 'database',
        description: 'Database configuration template',
        config: {
          database: {
            host: '{{host}}',
            port: '{{port}}',
            name: '{{dbname}}',
            ssl: '{{ssl}}'
          }
        },
        variables: {
          host: { type: 'string', required: true },
          port: { type: 'number', default: 5432 },
          dbname: { type: 'string', required: true },
          ssl: { type: 'boolean', default: false }
        }
      };

      const configManager = new ConfigManager(baseConfig, {
        templates: [template]
      });

      configManager.applyTemplate('database', {
        host: 'db.example.com',
        dbname: 'myapp',
        ssl: true
      });

      expect(configManager.get('database.host')).toBe('db.example.com');
      expect(configManager.get('database.port')).toBe('5432'); // default value as string
      expect(configManager.get('database.name')).toBe('myapp');
      expect(configManager.get('database.ssl')).toBe('true'); // template returns string
    });

    it('应该验证模板变量', () => {
      const template: ConfigTemplate = {
        name: 'test',
        config: { value: '{{required_var}}' },
        variables: {
          required_var: { type: 'string', required: true }
        }
      };

      const configManager = new ConfigManager(baseConfig, {
        templates: [template]
      });

      expect(() => {
        configManager.applyTemplate('test', {}); // Missing required variable
      }).toThrow("Required template variable 'required_var' is missing");
    });
  });

  describe('变更跟踪', () => {
    it('应该跟踪配置变更历史', () => {
      const configManager = new ConfigManager(baseConfig);
      
      configManager.set('key1', 'value1');
      configManager.set('key2', 'value2');
      configManager.set('key1', 'updated_value1');

      const history = configManager.getChangeHistory();
      
      expect(history).toHaveLength(3);
      expect(history[0].key).toBe('key1');
      expect(history[0].newValue).toBe('value1');
      expect(history[2].key).toBe('key1');
      expect(history[2].oldValue).toBe('value1');
      expect(history[2].newValue).toBe('updated_value1');
    });

    it('应该发出配置变更事件', (done) => {
      const configManager = new ConfigManager(baseConfig);
      
      configManager.on('configChanged', (event) => {
        expect(event.key).toBe('testKey');
        expect(event.oldValue).toBeUndefined();
        expect(event.newValue).toBe('testValue');
        expect(event.source).toBe('runtime');
        done();
      });

      configManager.set('testKey', 'testValue');
    });
  });

  describe('快照和恢复', () => {
    it('应该创建和恢复配置快照', () => {
      const configManager = new ConfigManager(baseConfig);
      
      configManager.set('key1', 'value1');
      configManager.set('key2', 'value2');
      
      const snapshot = configManager.createSnapshot();
      
      configManager.set('key1', 'modified');
      configManager.set('key3', 'new');
      
      expect(configManager.get('key1')).toBe('modified');
      expect(configManager.get('key3')).toBe('new');
      
      configManager.restoreSnapshot(snapshot);
      
      expect(configManager.get('key1')).toBe('value1');
      expect(configManager.get('key2')).toBe('value2');
      expect(configManager.get('key3')).toBeUndefined();
    });

    it('应该重置配置到初始状态', () => {
      const configManager = new ConfigManager(baseConfig);
      
      configManager.set('newKey', 'newValue');
      expect(configManager.get('newKey')).toBe('newValue');
      
      configManager.reset();
      expect(configManager.get('newKey')).toBeUndefined();
      expect(configManager.get('name')).toBe('TestApp'); // Original value preserved
    });
  });

  describe('导入导出', () => {
    it('应该导出配置为JSON', () => {
      const configManager = new ConfigManager(baseConfig);
      configManager.set('additionalKey', 'additionalValue');
      
      const exported = configManager.export();
      const parsed = JSON.parse(exported);
      
      expect(parsed.name).toBe('TestApp');
      expect(parsed.version).toBe('1.0.0');
      // additionalKey should not be in export (only original config)
      expect(parsed.additionalKey).toBeUndefined();
    });

    it('应该导出包含默认值的完整配置', () => {
      const configManager = new ConfigManager(baseConfig);
      configManager.set('additionalKey', 'additionalValue');
      
      const exported = configManager.export(true);
      const parsed = JSON.parse(exported);
      
      expect(parsed.name).toBe('TestApp');
      expect(parsed.additionalKey).toBe('additionalValue');
    });
  });

  describe('资源清理', () => {
    it('应该正确清理资源', async () => {
      const configManager = new ConfigManager(baseConfig);
      
      const destroyListener = jest.fn();
      configManager.on('destroyed', destroyListener);

      configManager.destroy();

      // Give some time for the event to be emitted
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(destroyListener).toHaveBeenCalled();
    });
  });
});
