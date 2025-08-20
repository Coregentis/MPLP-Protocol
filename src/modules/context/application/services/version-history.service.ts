/**
 * 版本历史服务
 * 
 * 基于Schema字段: version_history (versions, auto_versioning)
 * 实现版本管理、自动版本控制、版本比较等功能
 */

import { UUID } from '../../types';

/**
 * 变更类型
 */
export type ChangeType = 
  | 'context_created' 
  | 'configuration_updated' 
  | 'state_modified' 
  | 'cache_updated' 
  | 'sync_configured';

/**
 * 版本信息接口
 */
export interface Version {
  versionId: UUID;
  versionNumber: number;
  createdAt: Date;
  createdBy: string;
  changeSummary?: string;
  contextSnapshot: Record<string, unknown>;
  changeType: ChangeType;
}

/**
 * 自动版本控制配置接口
 */
export interface AutoVersioningConfig {
  enabled: boolean;
  versionOnConfigChange: boolean;
  versionOnStateChange: boolean;
  versionOnCacheChange: boolean;
}

/**
 * 版本历史配置接口
 */
export interface VersionHistoryConfig {
  enabled: boolean;
  maxVersions: number;
  versions?: Version[];
  autoVersioning?: AutoVersioningConfig;
}

/**
 * 版本比较结果接口
 */
export interface VersionComparison {
  fromVersion: Version;
  toVersion: Version;
  changes: VersionChange[];
  summary: string;
}

/**
 * 版本变更接口
 */
export interface VersionChange {
  field: string;
  changeType: 'added' | 'modified' | 'removed';
  oldValue?: unknown;
  newValue?: unknown;
}

/**
 * 创建版本请求接口
 */
export interface CreateVersionRequest {
  contextId: UUID;
  createdBy: string;
  changeSummary?: string;
  contextSnapshot: Record<string, unknown>;
  changeType: ChangeType;
}

/**
 * 版本历史服务
 */
export class VersionHistoryService {
  private versions = new Map<string, Version[]>();
  private config: VersionHistoryConfig;

  constructor(config?: Partial<VersionHistoryConfig>) {
    this.config = {
      enabled: true,
      maxVersions: 50,
      autoVersioning: {
        enabled: true,
        versionOnConfigChange: true,
        versionOnStateChange: true,
        versionOnCacheChange: false
      },
      ...config
    };
  }

  /**
   * 创建新版本
   */
  async createVersion(request: CreateVersionRequest): Promise<Version | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      const contextVersions = this.versions.get(request.contextId) || [];
      const nextVersionNumber = contextVersions.length + 1;

      const version: Version = {
        versionId: this.generateVersionId(),
        versionNumber: nextVersionNumber,
        createdAt: new Date(),
        createdBy: request.createdBy,
        changeSummary: request.changeSummary,
        contextSnapshot: { ...request.contextSnapshot },
        changeType: request.changeType
      };

      // 添加到版本列表
      contextVersions.push(version);

      this.versions.set(request.contextId, contextVersions);

      return version;
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取版本列表
   */
  async getVersions(contextId: UUID, limit?: number): Promise<Version[]> {
    const versions = this.versions.get(contextId) || [];
    
    // 按版本号降序排序（最新的在前）
    const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
    
    if (limit) {
      return sortedVersions.slice(0, limit);
    }
    
    return sortedVersions;
  }

  /**
   * 获取特定版本
   */
  async getVersion(contextId: UUID, versionNumber: number): Promise<Version | null> {
    const versions = this.versions.get(contextId) || [];
    return versions.find(v => v.versionNumber === versionNumber) || null;
  }

  /**
   * 获取最新版本
   */
  async getLatestVersion(contextId: UUID): Promise<Version | null> {
    const versions = await this.getVersions(contextId, 1);
    return versions.length > 0 ? versions[0] : null;
  }

  /**
   * 比较两个版本
   */
  async compareVersions(
    contextId: UUID, 
    fromVersionNumber: number, 
    toVersionNumber: number
  ): Promise<VersionComparison | null> {
    const fromVersion = await this.getVersion(contextId, fromVersionNumber);
    const toVersion = await this.getVersion(contextId, toVersionNumber);

    if (!fromVersion || !toVersion) {
      return null;
    }

    const changes = this.calculateChanges(fromVersion.contextSnapshot, toVersion.contextSnapshot);
    const summary = this.generateChangeSummary(changes);

    return {
      fromVersion,
      toVersion,
      changes,
      summary
    };
  }

  /**
   * 恢复到指定版本
   */
  async revertToVersion(contextId: UUID, versionNumber: number): Promise<Record<string, unknown> | null> {
    const version = await this.getVersion(contextId, versionNumber);
    if (!version) {
      return null;
    }

    // 创建恢复版本
    await this.createVersion({
      contextId,
      createdBy: 'system',
      changeSummary: `Reverted to version ${versionNumber}`,
      contextSnapshot: version.contextSnapshot,
      changeType: 'configuration_updated'
    });

    return version.contextSnapshot;
  }

  /**
   * 自动创建版本（如果启用）
   */
  async autoCreateVersion(
    contextId: UUID,
    changeType: ChangeType,
    contextSnapshot: Record<string, unknown>,
    createdBy: string
  ): Promise<Version | null> {
    if (!this.config.autoVersioning?.enabled) {
      return null;
    }

    const shouldCreateVersion = this.shouldAutoCreateVersion(changeType);
    if (!shouldCreateVersion) {
      return null;
    }

    return this.createVersion({
      contextId,
      createdBy,
      changeSummary: `Auto-generated version for ${changeType}`,
      contextSnapshot,
      changeType
    });
  }

  /**
   * 删除版本
   */
  async deleteVersion(contextId: UUID, versionNumber: number): Promise<boolean> {
    try {
      const versions = this.versions.get(contextId) || [];
      const filteredVersions = versions.filter(v => v.versionNumber !== versionNumber);
      
      if (filteredVersions.length === versions.length) {
        return false; // 版本不存在
      }

      this.versions.set(contextId, filteredVersions);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 清理旧版本
   */
  async cleanupOldVersions(contextId: UUID): Promise<number> {
    const versions = this.versions.get(contextId) || [];
    const originalCount = versions.length;

    if (versions.length > this.config.maxVersions) {
      // 保留最新的版本，删除最老的
      versions.sort((a, b) => b.versionNumber - a.versionNumber);
      versions.splice(this.config.maxVersions);
      this.versions.set(contextId, versions);
    }

    return originalCount - versions.length;
  }

  /**
   * 获取版本统计
   */
  async getVersionStatistics(contextId: UUID): Promise<{
    totalVersions: number;
    versionsByType: Record<ChangeType, number>;
    versionsByUser: Record<string, number>;
    oldestVersion?: Version;
    newestVersion?: Version;
  }> {
    const versions = this.versions.get(contextId) || [];
    
    const statistics = {
      totalVersions: versions.length,
      versionsByType: {} as Record<ChangeType, number>,
      versionsByUser: {} as Record<string, number>,
      oldestVersion: undefined as Version | undefined,
      newestVersion: undefined as Version | undefined
    };

    // 初始化变更类型统计
    const changeTypes: ChangeType[] = [
      'context_created', 'configuration_updated', 'state_modified', 
      'cache_updated', 'sync_configured'
    ];
    
    changeTypes.forEach(type => {
      statistics.versionsByType[type] = 0;
    });

    // 统计版本
    versions.forEach(version => {
      // 按类型统计
      statistics.versionsByType[version.changeType]++;

      // 按用户统计
      statistics.versionsByUser[version.createdBy] = 
        (statistics.versionsByUser[version.createdBy] || 0) + 1;
    });

    // 找到最老和最新的版本
    if (versions.length > 0) {
      const sortedVersions = [...versions].sort((a, b) => a.versionNumber - b.versionNumber);
      statistics.oldestVersion = sortedVersions[0];
      statistics.newestVersion = sortedVersions[sortedVersions.length - 1];
    }

    return statistics;
  }

  /**
   * 更新自动版本控制配置
   */
  async updateAutoVersioningConfig(config: Partial<AutoVersioningConfig>): Promise<boolean> {
    try {
      this.config.autoVersioning = {
        ...this.config.autoVersioning!,
        ...config
      };
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): VersionHistoryConfig {
    return {
      enabled: true,
      maxVersions: 50,
      autoVersioning: {
        enabled: true,
        versionOnConfigChange: true,
        versionOnStateChange: true,
        versionOnCacheChange: false
      }
    };
  }

  // 私有方法
  private generateVersionId(): UUID {
    return `version-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as UUID;
  }

  private applyVersionLimit(versions: Version[]): void {
    if (versions.length > this.config.maxVersions) {
      // 保留最新的版本，删除最老的
      versions.sort((a, b) => b.versionNumber - a.versionNumber);
      const _removed = versions.splice(this.config.maxVersions); // TODO: 记录删除的版本数量
      return; // 返回删除的数量在cleanupOldVersions中处理
    }
  }

  private shouldAutoCreateVersion(changeType: ChangeType): boolean {
    const autoConfig = this.config.autoVersioning!;
    
    switch (changeType) {
      case 'configuration_updated':
        return autoConfig.versionOnConfigChange;
      case 'state_modified':
        return autoConfig.versionOnStateChange;
      case 'cache_updated':
        return autoConfig.versionOnCacheChange;
      default:
        return true; // 默认为其他类型创建版本
    }
  }

  private calculateChanges(oldSnapshot: Record<string, unknown>, newSnapshot: Record<string, unknown>): VersionChange[] {
    const changes: VersionChange[] = [];
    const allKeys = new Set([...Object.keys(oldSnapshot), ...Object.keys(newSnapshot)]);

    for (const key of allKeys) {
      const oldValue = oldSnapshot[key];
      const newValue = newSnapshot[key];

      if (!(key in oldSnapshot)) {
        changes.push({
          field: key,
          changeType: 'added',
          newValue
        });
      } else if (!(key in newSnapshot)) {
        changes.push({
          field: key,
          changeType: 'removed',
          oldValue
        });
      } else if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          changeType: 'modified',
          oldValue,
          newValue
        });
      }
    }

    return changes;
  }

  private generateChangeSummary(changes: VersionChange[]): string {
    if (changes.length === 0) {
      return 'No changes detected';
    }

    const addedCount = changes.filter(c => c.changeType === 'added').length;
    const modifiedCount = changes.filter(c => c.changeType === 'modified').length;
    const removedCount = changes.filter(c => c.changeType === 'removed').length;

    const parts: string[] = [];
    if (addedCount > 0) parts.push(`${addedCount} added`);
    if (modifiedCount > 0) parts.push(`${modifiedCount} modified`);
    if (removedCount > 0) parts.push(`${removedCount} removed`);

    return `${changes.length} changes: ${parts.join(', ')}`;
  }
}
