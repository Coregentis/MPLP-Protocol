/**
 * ConfigManager测试用例
 * 验证配置管理系统的核心功能
 */

import { ConfigManager, ConfigPermission } from '../../../../../src/modules/core/infrastructure/config/config.manager';

describe('ConfigManager测试', () => {
  let configManager: ConfigManager;
  const testUserId = 'test-user-001';

  beforeEach(() => {
    configManager = new ConfigManager({
      provider: 'memory',
      environment: 'test',
      encryptionEnabled: true,
      auditEnabled: true,
      cacheEnabled: true,
      cacheTtl: 1000,
      watchEnabled: true
    });

    // 设置测试用户权限
    const permission: ConfigPermission = {
      userId: testUserId,
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'rollback', 'encrypt', 'decrypt'],
      environments: ['test', 'development'],
      keyPatterns: ['*'],
      createdAt: new Date().toISOString()
    };
    configManager.setPermission(permission);
  });

  afterEach(() => {
    configManager.destroy();
  });

  describe('基础配置操作测试', () => {
    it('应该成功设置和获取配置', async () => {
      const key = 'app.name';
      const value = 'Test Application';

      await configManager.setConfig(key, value, testUserId);
      const result = await configManager.getConfig<string>(key, testUserId);

      expect(result).toBe(value);
    });

    it('应该支持不同类型的配置值', async () => {
      const configs = [
        { key: 'app.debug', value: true, type: 'boolean' },
        { key: 'app.port', value: 3000, type: 'number' },
        { key: 'app.features', value: ['auth', 'api'], type: 'array' },
        { key: 'app.database', value: { host: 'localhost', port: 5432 }, type: 'object' }
      ];

      for (const config of configs) {
        await configManager.setConfig(config.key, config.value, testUserId);
        const result = await configManager.getConfig(config.key, testUserId);
        expect(result).toEqual(config.value);
      }
    });

    it('应该成功删除配置', async () => {
      const key = 'temp.config';
      const value = 'temporary value';

      await configManager.setConfig(key, value, testUserId);
      let result = await configManager.getConfig(key, testUserId);
      expect(result).toBe(value);

      await configManager.deleteConfig(key, testUserId);
      result = await configManager.getConfig(key, testUserId);
      expect(result).toBeNull();
    });

    it('应该处理不存在的配置键', async () => {
      const result = await configManager.getConfig('non.existent.key', testUserId);
      expect(result).toBeNull();
    });
  });

  describe('配置加密测试', () => {
    it('应该加密敏感配置', async () => {
      const key = 'database.password';
      const value = 'super-secret-password';

      await configManager.setConfig(key, value, testUserId, {
        sensitive: true,
        description: 'Database password'
      });

      const result = await configManager.getConfig<string>(key, testUserId);
      expect(result).toBe(value);
    });

    it('应该正确处理加密配置的缓存', async () => {
      const key = 'api.secret';
      const value = 'secret-api-key';

      await configManager.setConfig(key, value, testUserId, { sensitive: true });

      // 第一次获取
      const result1 = await configManager.getConfig<string>(key, testUserId);
      expect(result1).toBe(value);

      // 第二次获取（应该从缓存获取）
      const result2 = await configManager.getConfig<string>(key, testUserId);
      expect(result2).toBe(value);
    });
  });

  describe('配置版本管理测试', () => {
    it('应该创建配置版本历史', async () => {
      const key = 'app.version';
      
      await configManager.setConfig(key, '1.0.0', testUserId);
      await configManager.setConfig(key, '1.1.0', testUserId);
      await configManager.setConfig(key, '1.2.0', testUserId);

      const versions = configManager.getConfigVersions(key);
      expect(versions).toHaveLength(3);
      expect(versions[0].version).toBe(1);
      expect(versions[1].version).toBe(2);
      expect(versions[2].version).toBe(3);
    });

    it('应该支持配置回滚', async () => {
      const key = 'app.config';
      const value1 = 'config-v1';
      const value2 = 'config-v2';
      const value3 = 'config-v3';

      await configManager.setConfig(key, value1, testUserId);
      await configManager.setConfig(key, value2, testUserId);
      await configManager.setConfig(key, value3, testUserId);

      // 回滚到版本1
      await configManager.rollbackConfig(key, 1, testUserId);
      
      const result = await configManager.getConfig<string>(key, testUserId);
      expect(result).toBe(value1);

      // 验证版本历史
      const versions = configManager.getConfigVersions(key);
      expect(versions.length).toBeGreaterThan(3); // 回滚会创建新版本
    });

    it('应该拒绝回滚到不存在的版本', async () => {
      const key = 'test.rollback';
      await configManager.setConfig(key, 'value', testUserId);

      await expect(configManager.rollbackConfig(key, 999, testUserId))
        .rejects.toThrow('Version 999 not found or not rollbackable');
    });
  });

  describe('配置监听测试', () => {
    it('应该监听配置变化', async () => {
      const changes: any[] = [];
      const watcherId = configManager.watchConfig('app.*', (change) => {
        changes.push(change);
      });

      const key = 'app.test';
      const value1 = 'initial';
      const value2 = 'updated';

      await configManager.setConfig(key, value1, testUserId);
      await configManager.setConfig(key, value2, testUserId);
      await configManager.deleteConfig(key, testUserId);

      // 等待异步回调
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(changes).toHaveLength(3);
      expect(changes[0].changeType).toBe('create');
      expect(changes[1].changeType).toBe('update');
      expect(changes[2].changeType).toBe('delete');

      configManager.unwatchConfig(watcherId);
    });

    it('应该支持模式匹配监听', async () => {
      const databaseChanges: any[] = [];
      const apiChanges: any[] = [];

      configManager.watchConfig('database.*', (change) => {
        databaseChanges.push(change);
      });

      configManager.watchConfig('api.*', (change) => {
        apiChanges.push(change);
      });

      await configManager.setConfig('database.host', 'localhost', testUserId);
      await configManager.setConfig('api.key', 'secret', testUserId);
      await configManager.setConfig('app.name', 'test', testUserId);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(databaseChanges).toHaveLength(1);
      expect(apiChanges).toHaveLength(1);
    });
  });

  describe('权限控制测试', () => {
    it('应该拒绝无权限用户的操作', async () => {
      const unauthorizedUser = 'unauthorized-user';

      await expect(configManager.getConfig('test.key', unauthorizedUser))
        .rejects.toThrow('Permission denied');

      await expect(configManager.setConfig('test.key', 'value', unauthorizedUser))
        .rejects.toThrow('Permission denied');
    });

    it('应该支持基于角色的权限控制', async () => {
      const viewerUser = 'viewer-user';
      const viewerPermission: ConfigPermission = {
        userId: viewerUser,
        role: 'viewer',
        permissions: ['read'],
        environments: ['test'],
        keyPatterns: ['*'],
        createdAt: new Date().toISOString()
      };

      configManager.setPermission(viewerPermission);

      // 设置一个配置（使用管理员用户）
      await configManager.setConfig('test.readonly', 'value', testUserId);

      // 查看者可以读取
      const result = await configManager.getConfig('test.readonly', viewerUser);
      expect(result).toBe('value');

      // 查看者不能写入
      await expect(configManager.setConfig('test.readonly', 'new-value', viewerUser))
        .rejects.toThrow('Permission denied');
    });

    it('应该支持基于键模式的权限控制', async () => {
      const limitedUser = 'limited-user';
      const limitedPermission: ConfigPermission = {
        userId: limitedUser,
        role: 'editor',
        permissions: ['read', 'write'],
        environments: ['test'],
        keyPatterns: ['app.*'], // 只能访问app.*的配置
        createdAt: new Date().toISOString()
      };

      configManager.setPermission(limitedPermission);

      // 可以访问app.*配置
      await configManager.setConfig('app.name', 'test-app', limitedUser);
      const result = await configManager.getConfig('app.name', limitedUser);
      expect(result).toBe('test-app');

      // 不能访问其他配置
      await expect(configManager.setConfig('database.host', 'localhost', limitedUser))
        .rejects.toThrow('Permission denied');
    });
  });

  describe('审计日志测试', () => {
    it('应该记录配置操作的审计日志', async () => {
      const key = 'audit.test';
      const value = 'test-value';

      await configManager.setConfig(key, value, testUserId);
      await configManager.getConfig(key, testUserId);
      await configManager.deleteConfig(key, testUserId);

      const auditLogs = configManager.getAuditLogs();
      expect(auditLogs.length).toBeGreaterThanOrEqual(3);

      const writeLog = auditLogs.find(log => log.action === 'write' && log.configKey === key);
      const readLog = auditLogs.find(log => log.action === 'read' && log.configKey === key);
      const deleteLog = auditLogs.find(log => log.action === 'delete' && log.configKey === key);

      expect(writeLog).toBeDefined();
      expect(readLog).toBeDefined();
      expect(deleteLog).toBeDefined();

      expect(writeLog!.success).toBe(true);
      expect(readLog!.success).toBe(true);
      expect(deleteLog!.success).toBe(true);
    });

    it('应该记录失败操作的审计日志', async () => {
      const unauthorizedUser = 'unauthorized-user';

      try {
        await configManager.setConfig('test.key', 'value', unauthorizedUser);
      } catch (error) {
        // 预期的错误
      }

      const auditLogs = configManager.getAuditLogs({ userId: unauthorizedUser });
      expect(auditLogs).toHaveLength(1);
      expect(auditLogs[0].success).toBe(false);
      expect(auditLogs[0].errorMessage).toBe('Permission denied for key: test.key');
    });

    it('应该支持审计日志过滤', async () => {
      const key1 = 'filter.test1';
      const key2 = 'filter.test2';

      await configManager.setConfig(key1, 'value1', testUserId);
      await configManager.setConfig(key2, 'value2', testUserId);

      // 按用户过滤
      const userLogs = configManager.getAuditLogs({ userId: testUserId });
      expect(userLogs.length).toBeGreaterThanOrEqual(2);

      // 按操作过滤
      const writeLogs = configManager.getAuditLogs({ action: 'write' });
      expect(writeLogs.length).toBeGreaterThanOrEqual(2);

      // 按键过滤
      const key1Logs = configManager.getAuditLogs({ key: key1 });
      expect(key1Logs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('配置验证测试', () => {
    it('应该支持正则表达式验证', async () => {
      const key = 'email.pattern';
      
      // 先设置一个有效的邮箱
      await configManager.setConfig(key, 'test@example.com', testUserId, {
        validation: {
          type: 'regex',
          rule: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
          message: 'Invalid email format'
        }
      });

      // 尝试设置无效的邮箱
      await expect(configManager.setConfig(key, 'invalid-email', testUserId))
        .rejects.toThrow('Invalid email format');
    });

    it('应该支持数值范围验证', async () => {
      const key = 'port.number';
      
      await configManager.setConfig(key, 8080, testUserId, {
        validation: {
          type: 'range',
          rule: [1000, 9999],
          message: 'Port must be between 1000 and 9999'
        }
      });

      await expect(configManager.setConfig(key, 500, testUserId))
        .rejects.toThrow('Port must be between 1000 and 9999');
    });

    it('应该支持枚举值验证', async () => {
      const key = 'log.level';
      
      await configManager.setConfig(key, 'info', testUserId, {
        validation: {
          type: 'enum',
          rule: ['debug', 'info', 'warn', 'error'],
          message: 'Invalid log level'
        }
      });

      await expect(configManager.setConfig(key, 'invalid', testUserId))
        .rejects.toThrow('Invalid log level');
    });
  });

  describe('缓存测试', () => {
    it('应该缓存配置值', async () => {
      const key = 'cache.test';
      const value = 'cached-value';

      await configManager.setConfig(key, value, testUserId);

      // 第一次获取
      const result1 = await configManager.getConfig(key, testUserId);
      expect(result1).toBe(value);

      // 第二次获取（应该从缓存获取）
      const result2 = await configManager.getConfig(key, testUserId);
      expect(result2).toBe(value);
    });

    it('应该在配置更新时清除缓存', async () => {
      const key = 'cache.update.test';
      const value1 = 'initial-value';
      const value2 = 'updated-value';

      await configManager.setConfig(key, value1, testUserId);
      await configManager.getConfig(key, testUserId); // 缓存初始值

      await configManager.setConfig(key, value2, testUserId); // 应该清除缓存
      const result = await configManager.getConfig(key, testUserId);
      
      expect(result).toBe(value2);
    });
  });

  describe('备份测试', () => {
    it('应该创建配置备份', async () => {
      // 设置一些配置
      await configManager.setConfig('backup.test1', 'value1', testUserId);
      await configManager.setConfig('backup.test2', 'value2', testUserId);

      const backup = await configManager.createBackup('Test backup');

      expect(backup.backupId).toBeDefined();
      expect(backup.environment).toBe('test');
      expect(backup.configCount).toBe(2);
      expect(backup.metadata.description).toBe('Test backup');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理删除不存在的配置', async () => {
      await expect(configManager.deleteConfig('non.existent', testUserId))
        .rejects.toThrow('Config not found: non.existent');
    });

    it('应该处理监听器回调错误', async () => {
      // 注册一个会抛出错误的监听器
      configManager.watchConfig('error.*', () => {
        throw new Error('Callback error');
      });

      // 设置配置不应该因为监听器错误而失败
      await expect(configManager.setConfig('error.test', 'value', testUserId))
        .resolves.not.toThrow();
    });
  });

  describe('清理测试', () => {
    it('应该正确清理资源', () => {
      configManager.destroy();
      
      // 验证清理后的状态
      expect(() => configManager.destroy()).not.toThrow();
    });
  });
});
