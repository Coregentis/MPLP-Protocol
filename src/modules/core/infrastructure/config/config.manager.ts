/**
 * ConfigManager - 集中化配置管理系统
 * 支持动态配置更新、环境隔离、配置版本管理
 * 包括配置加密、权限控制和审计日志
 *
 * 基于SCTM+GLFB+ITCM增强框架设计
 */

/// <reference types="node" />
import { UUID, Timestamp } from '../../types';

// ===== 配置管理配置接口 =====

export interface ConfigManagerConfig {
  provider: ConfigProvider;
  environment: string;
  encryptionEnabled: boolean;
  encryptionKey?: string;
  auditEnabled: boolean;
  cacheEnabled: boolean;
  cacheTtl: number;
  watchEnabled: boolean;
  backupEnabled: boolean;
  backupInterval: number;
}

export type ConfigProvider = 'memory' | 'file' | 'etcd' | 'consul' | 'database';

// ===== 配置项接口 =====

export interface ConfigItem {
  key: string;
  value: unknown;
  type: ConfigType;
  environment: string;
  version: number;
  encrypted: boolean;
  metadata: ConfigMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

export type ConfigType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'secret';

export interface ConfigMetadata {
  description?: string;
  tags: string[];
  category: string;
  sensitive: boolean;
  required: boolean;
  defaultValue?: unknown;
  validation?: ConfigValidation;
}

export interface ConfigValidation {
  type: 'regex' | 'range' | 'enum' | 'custom';
  rule: string | number[] | string[] | ((value: unknown) => boolean);
  message?: string;
}

// ===== 配置版本接口 =====

export interface ConfigVersion {
  versionId: UUID;
  configKey: string;
  version: number;
  value: unknown;
  changeType: ChangeType;
  changeSummary: string;
  createdAt: Timestamp;
  createdBy: string;
  rollbackable: boolean;
}

export type ChangeType = 'create' | 'update' | 'delete' | 'rollback';

// ===== 配置监听接口 =====

export interface ConfigWatcher {
  watcherId: UUID;
  pattern: string;
  callback: ConfigChangeCallback;
  environment?: string;
  active: boolean;
  createdAt: Timestamp;
}

export type ConfigChangeCallback = (change: ConfigChange) => void | Promise<void>;

export interface ConfigChange {
  key: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: ChangeType;
  version: number;
  timestamp: Timestamp;
  changedBy: string;
}

// ===== 权限控制接口 =====

export interface ConfigPermission {
  userId: string;
  role: ConfigRole;
  permissions: ConfigAction[];
  environments: string[];
  keyPatterns: string[];
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export type ConfigRole = 'admin' | 'editor' | 'viewer' | 'operator';

export type ConfigAction = 'read' | 'write' | 'delete' | 'rollback' | 'encrypt' | 'decrypt';

// ===== 审计日志接口 =====

export interface ConfigAuditLog {
  logId: UUID;
  action: ConfigAction;
  configKey: string;
  oldValue?: unknown;
  newValue?: unknown;
  userId: string;
  userRole: string;
  environment: string;
  success: boolean;
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp;
}

// ===== 配置备份接口 =====

export interface ConfigBackup {
  backupId: UUID;
  environment: string;
  configCount: number;
  backupSize: number;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  metadata: BackupMetadata;
}

export interface BackupMetadata {
  version: string;
  description?: string;
  tags: string[];
  automated: boolean;
}

// ===== 配置管理器实现 =====

export class ConfigManager {
  private config: ConfigManagerConfig;
  private configItems = new Map<string, ConfigItem>();
  private configVersions = new Map<string, ConfigVersion[]>();
  private watchers = new Map<UUID, ConfigWatcher>();
  private permissions = new Map<string, ConfigPermission>();
  private auditLogs: ConfigAuditLog[] = [];
  private configCache = new Map<string, { value: unknown; expiresAt: number }>();
  private backupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<ConfigManagerConfig> = {}) {
    this.config = {
      provider: 'memory',
      environment: 'development',
      encryptionEnabled: false,
      auditEnabled: true,
      cacheEnabled: true,
      cacheTtl: 300000, // 5分钟
      watchEnabled: true,
      backupEnabled: true,
      backupInterval: 3600000, // 1小时
      ...config
    };

    this.startBackupScheduler();
  }

  /**
   * 获取配置项
   */
  async getConfig<T = unknown>(key: string, userId?: string): Promise<T | null> {
    try {
      // 权限检查
      if (userId && !this.hasPermission(userId, 'read', key)) {
        await this.logAudit('read', key, undefined, undefined, userId, false, 'Permission denied');
        throw new Error(`Permission denied for key: ${key}`);
      }

      // 缓存检查
      if (this.config.cacheEnabled) {
        const cached = this.configCache.get(key);
        if (cached && cached.expiresAt > Date.now()) {
          return cached.value as T;
        }
      }

      // 获取配置
      const configItem = await this.loadConfig(key);
      if (!configItem) {
        return null;
      }

      // 解密
      let value = configItem.value;
      if (configItem.encrypted && this.config.encryptionEnabled) {
        value = await this.decryptValue(value as string);
      }

      // 更新缓存
      if (this.config.cacheEnabled) {
        this.configCache.set(key, {
          value,
          expiresAt: Date.now() + this.config.cacheTtl
        });
      }

      // 审计日志
      if (userId) {
        await this.logAudit('read', key, undefined, value, userId, true);
      }

      return value as T;

    } catch (error) {
      if (userId) {
        await this.logAudit('read', key, undefined, undefined, userId, false, 
          error instanceof Error ? error.message : 'Unknown error');
      }
      throw error;
    }
  }

  /**
   * 设置配置项
   */
  async setConfig(
    key: string, 
    value: unknown, 
    userId: string, 
    metadata?: Partial<ConfigMetadata>
  ): Promise<void> {
    try {
      // 权限检查
      if (!this.hasPermission(userId, 'write', key)) {
        await this.logAudit('write', key, undefined, value, userId, false, `Permission denied for key: ${key}`);
        throw new Error(`Permission denied for key: ${key}`);
      }

      // 验证配置值
      await this.validateConfig(key, value);

      // 获取旧值
      const oldConfig = await this.loadConfig(key);
      const oldValue = oldConfig?.value;

      // 加密敏感配置
      let finalValue = value;
      let encrypted = false;
      if (metadata?.sensitive && this.config.encryptionEnabled) {
        finalValue = await this.encryptValue(value);
        encrypted = true;
      }

      // 创建配置项
      const configItem: ConfigItem = {
        key,
        value: finalValue,
        type: this.inferConfigType(value),
        environment: this.config.environment,
        version: (oldConfig?.version || 0) + 1,
        encrypted,
        metadata: {
          description: metadata?.description,
          tags: metadata?.tags || [],
          category: metadata?.category || 'general',
          sensitive: metadata?.sensitive || false,
          required: metadata?.required || false,
          defaultValue: metadata?.defaultValue,
          validation: metadata?.validation
        },
        createdAt: oldConfig?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: oldConfig?.createdBy || userId,
        updatedBy: userId
      };

      // 保存配置
      await this.saveConfig(configItem);

      // 创建版本记录
      await this.createVersion(key, configItem.version, finalValue, 
        oldConfig ? 'update' : 'create', userId);

      // 清除缓存
      this.configCache.delete(key);

      // 通知监听器
      if (this.config.watchEnabled) {
        await this.notifyWatchers({
          key,
          oldValue,
          newValue: value,
          changeType: oldConfig ? 'update' : 'create',
          version: configItem.version,
          timestamp: new Date().toISOString(),
          changedBy: userId
        });
      }

      // 审计日志
      await this.logAudit('write', key, oldValue, value, userId, true);

    } catch (error) {
      // 只有非权限错误才记录审计日志（权限错误已经在权限检查时记录了）
      if (!(error instanceof Error && error.message.startsWith('Permission denied'))) {
        await this.logAudit('write', key, undefined, value, userId, false,
          error instanceof Error ? error.message : 'Unknown error');
      }
      throw error;
    }
  }

  /**
   * 删除配置项
   */
  async deleteConfig(key: string, userId: string): Promise<void> {
    try {
      // 权限检查
      if (!this.hasPermission(userId, 'delete', key)) {
        await this.logAudit('delete', key, undefined, undefined, userId, false, 'Permission denied');
        throw new Error(`Permission denied for key: ${key}`);
      }

      // 获取配置
      const configItem = await this.loadConfig(key);
      if (!configItem) {
        throw new Error(`Config not found: ${key}`);
      }

      // 删除配置
      await this.removeConfig(key);

      // 创建版本记录
      await this.createVersion(key, configItem.version + 1, null, 'delete', userId);

      // 清除缓存
      this.configCache.delete(key);

      // 通知监听器
      if (this.config.watchEnabled) {
        await this.notifyWatchers({
          key,
          oldValue: configItem.value,
          newValue: null,
          changeType: 'delete',
          version: configItem.version + 1,
          timestamp: new Date().toISOString(),
          changedBy: userId
        });
      }

      // 审计日志
      await this.logAudit('delete', key, configItem.value, undefined, userId, true);

    } catch (error) {
      await this.logAudit('delete', key, undefined, undefined, userId, false,
        error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * 回滚配置
   */
  async rollbackConfig(key: string, targetVersion: number, userId: string): Promise<void> {
    try {
      // 权限检查
      if (!this.hasPermission(userId, 'rollback', key)) {
        await this.logAudit('rollback', key, undefined, undefined, userId, false, 'Permission denied');
        throw new Error(`Permission denied for key: ${key}`);
      }

      // 获取目标版本
      const versions = this.configVersions.get(key) || [];
      const targetVersionData = versions.find(v => v.version === targetVersion);
      
      if (!targetVersionData || !targetVersionData.rollbackable) {
        throw new Error(`Version ${targetVersion} not found or not rollbackable for key: ${key}`);
      }

      // 获取当前配置
      const currentConfig = await this.loadConfig(key);
      const oldValue = currentConfig?.value;

      // 执行回滚
      await this.setConfig(key, targetVersionData.value, userId, {
        description: `Rollback to version ${targetVersion}`
      });

      // 审计日志
      await this.logAudit('rollback', key, oldValue, targetVersionData.value, userId, true);

    } catch (error) {
      await this.logAudit('rollback', key, undefined, undefined, userId, false,
        error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * 监听配置变化
   */
  watchConfig(pattern: string, callback: ConfigChangeCallback, environment?: string): UUID {
    const watcherId = this.generateUUID();
    
    const watcher: ConfigWatcher = {
      watcherId,
      pattern,
      callback,
      environment: environment || this.config.environment,
      active: true,
      createdAt: new Date().toISOString()
    };

    this.watchers.set(watcherId, watcher);
    return watcherId;
  }

  /**
   * 停止监听
   */
  unwatchConfig(watcherId: UUID): void {
    this.watchers.delete(watcherId);
  }

  /**
   * 获取配置历史版本
   */
  getConfigVersions(key: string): ConfigVersion[] {
    return this.configVersions.get(key) || [];
  }

  /**
   * 获取审计日志
   */
  getAuditLogs(filters?: {
    userId?: string;
    action?: ConfigAction;
    key?: string;
    startTime?: Timestamp;
    endTime?: Timestamp;
  }): ConfigAuditLog[] {
    let logs = this.auditLogs;

    if (filters) {
      logs = logs.filter(log => {
        if (filters.userId && log.userId !== filters.userId) return false;
        if (filters.action && log.action !== filters.action) return false;
        if (filters.key && log.configKey !== filters.key) return false;
        if (filters.startTime && log.timestamp < filters.startTime) return false;
        if (filters.endTime && log.timestamp > filters.endTime) return false;
        return true;
      });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * 设置用户权限
   */
  setPermission(permission: ConfigPermission): void {
    this.permissions.set(permission.userId, permission);
  }

  /**
   * 创建配置备份
   */
  async createBackup(description?: string): Promise<ConfigBackup> {
    const backupId = this.generateUUID();
    const configCount = this.configItems.size;
    
    const backup: ConfigBackup = {
      backupId,
      environment: this.config.environment,
      configCount,
      backupSize: JSON.stringify(Array.from(this.configItems.entries())).length,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天
      metadata: {
        version: '1.0.0',
        description,
        tags: ['auto-backup'],
        automated: !description
      }
    };

    // 实际的备份逻辑会根据provider实现
    console.log(`Config backup created: ${backupId}`);
    
    return backup;
  }

  // ===== 私有方法 =====

  private async loadConfig(key: string): Promise<ConfigItem | null> {
    // 根据provider加载配置
    switch (this.config.provider) {
      case 'memory':
        return this.configItems.get(key) || null;
      case 'file':
      case 'etcd':
      case 'consul':
      case 'database':
        // 简化实现：从内存加载
        return this.configItems.get(key) || null;
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async saveConfig(configItem: ConfigItem): Promise<void> {
    // 根据provider保存配置
    switch (this.config.provider) {
      case 'memory':
        this.configItems.set(configItem.key, configItem);
        break;
      case 'file':
      case 'etcd':
      case 'consul':
      case 'database':
        // 简化实现：保存到内存
        this.configItems.set(configItem.key, configItem);
        break;
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private async removeConfig(key: string): Promise<void> {
    this.configItems.delete(key);
  }

  private async validateConfig(key: string, value: unknown): Promise<void> {
    const configItem = this.configItems.get(key);
    const validation = configItem?.metadata.validation;
    
    if (!validation) return;

    switch (validation.type) {
      case 'regex':
        if (typeof value === 'string' && typeof validation.rule === 'string') {
          const regex = new RegExp(validation.rule);
          if (!regex.test(value)) {
            throw new Error(validation.message || `Value does not match pattern: ${validation.rule}`);
          }
        }
        break;
      case 'range':
        if (typeof value === 'number' && Array.isArray(validation.rule) && validation.rule.length >= 2) {
          const [min, max] = validation.rule as number[];
          if (typeof min === 'number' && typeof max === 'number' && (value < min || value > max)) {
            throw new Error(validation.message || `Value must be between ${min} and ${max}`);
          }
        }
        break;
      case 'enum':
        if (Array.isArray(validation.rule) && !validation.rule.includes(value as never)) {
          throw new Error(validation.message || `Value must be one of: ${validation.rule.join(', ')}`);
        }
        break;
      case 'custom':
        if (typeof validation.rule === 'function' && !validation.rule(value)) {
          throw new Error(validation.message || 'Custom validation failed');
        }
        break;
    }
  }

  private inferConfigType(value: unknown): ConfigType {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  }

  private async encryptValue(value: unknown): Promise<string> {
    // 简化的加密实现
    const str = JSON.stringify(value);
    return Buffer.from(str).toString('base64');
  }

  private async decryptValue(encryptedValue: string): Promise<unknown> {
    // 简化的解密实现
    const str = Buffer.from(encryptedValue, 'base64').toString();
    return JSON.parse(str);
  }

  private async createVersion(
    key: string, 
    version: number, 
    value: unknown, 
    changeType: ChangeType, 
    userId: string
  ): Promise<void> {
    const configVersion: ConfigVersion = {
      versionId: this.generateUUID(),
      configKey: key,
      version,
      value,
      changeType,
      changeSummary: `${changeType} operation by ${userId}`,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      rollbackable: changeType !== 'delete'
    };

    const versions = this.configVersions.get(key) || [];
    versions.push(configVersion);
    this.configVersions.set(key, versions);
  }

  private async notifyWatchers(change: ConfigChange): Promise<void> {
    for (const watcher of this.watchers.values()) {
      if (!watcher.active) continue;

      if (watcher.environment && watcher.environment !== this.config.environment) continue;

      // 改进的模式匹配：支持通配符模式
      if (!this.matchesPattern(change.key, watcher.pattern)) continue;

      try {
        await watcher.callback(change);
      } catch (error) {
        console.error(`Watcher callback failed for ${watcher.watcherId}:`, error);
      }
    }
  }

  private matchesPattern(key: string, pattern: string): boolean {
    if (pattern === '*') return true;

    // 支持 "prefix.*" 模式
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return key.startsWith(prefix + '.');
    }

    // 支持 "*.suffix" 模式
    if (pattern.startsWith('*.')) {
      const suffix = pattern.slice(2);
      return key.endsWith('.' + suffix);
    }

    // 精确匹配
    return key === pattern;
  }

  private hasPermission(userId: string, action: ConfigAction, key: string): boolean {
    const permission = this.permissions.get(userId);
    if (!permission) return false;

    // 检查权限是否过期
    if (permission.expiresAt && new Date(permission.expiresAt) < new Date()) {
      return false;
    }

    // 检查环境权限
    if (!permission.environments.includes(this.config.environment)) {
      return false;
    }

    // 检查操作权限
    if (!permission.permissions.includes(action)) {
      return false;
    }

    // 检查键模式权限
    const hasKeyAccess = permission.keyPatterns.some(pattern => {
      return this.matchesPattern(key, pattern);
    });

    return hasKeyAccess;
  }

  private async logAudit(
    action: ConfigAction,
    configKey: string,
    oldValue: unknown,
    newValue: unknown,
    userId: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    if (!this.config.auditEnabled) return;

    const auditLog: ConfigAuditLog = {
      logId: this.generateUUID(),
      action,
      configKey,
      oldValue,
      newValue,
      userId,
      userRole: this.permissions.get(userId)?.role || 'unknown',
      environment: this.config.environment,
      success,
      errorMessage,
      ipAddress: '127.0.0.1', // 简化实现
      userAgent: 'ConfigManager',
      timestamp: new Date().toISOString()
    };

    this.auditLogs.push(auditLog);

    // 限制日志数量
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-5000);
    }
  }

  private startBackupScheduler(): void {
    if (!this.config.backupEnabled) return;

    this.backupInterval = setInterval(async () => {
      try {
        await this.createBackup('Automated backup');
      } catch (error) {
        console.error('Automated backup failed:', error);
      }
    }, this.config.backupInterval);
  }

  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 清理配置管理器
   */
  destroy(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
    
    this.configItems.clear();
    this.configVersions.clear();
    this.watchers.clear();
    this.permissions.clear();
    this.auditLogs.length = 0;
    this.configCache.clear();
  }
}
