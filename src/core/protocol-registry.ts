/**
 * MPLP Protocol Registry
 * @description 协议注册表，管理所有已注册的协议和操作
 * @author MPLP Team
 * @version 1.0.0
 */

import { Logger } from '../public/utils/logger';
import { EventBus } from './event-bus';
import {
  ProtocolDefinition,
  OperationDefinition,
  ProtocolStats,
  ExecutionStats,
  ProtocolDiscoveryResult,
  OperationDiscoveryResult,
  CompatibilityCheckResult,
  ProtocolType,
  ProtocolMaturity,
  ProtocolStatus,
} from './protocol-types';

// 注册表条目
interface RegistryEntry {
  protocol: ProtocolDefinition;
  status: ProtocolStatus;
  registeredAt: string;
  lastUsed?: string;
  stats: ProtocolStats;
}

// 操作注册表条目
interface OperationEntry {
  protocolId: string;
  operation: OperationDefinition;
  stats: ExecutionStats;
}

// 注册表配置
export interface ProtocolRegistryConfig {
  enableVersioning: boolean;
  enableStats: boolean;
  enableCompatibilityCheck: boolean;
  maxVersionsPerProtocol: number;
  statsRetentionDays: number;
}

/**
 * 协议注册表类
 */
export class ProtocolRegistry {
  private protocols = new Map<string, RegistryEntry>();
  private operations = new Map<string, OperationEntry>();
  private versionMap = new Map<string, Set<string>>(); // protocolName -> versions
  private dependencyGraph = new Map<string, Set<string>>(); // protocolId -> dependencies
  private reverseDependencyGraph = new Map<string, Set<string>>(); // protocolId -> dependents
  private logger: Logger;

  constructor(
    private config: ProtocolRegistryConfig,
    private eventBus?: EventBus
  ) {
    this.logger = new Logger('ProtocolRegistry');
    this.logger.info('Protocol registry initialized', { config });
  }

  /**
   * 注册协议
   */
  async register(protocol: ProtocolDefinition): Promise<void> {
    const protocolId = protocol.id;

    // 检查协议是否已存在
    if (this.protocols.has(protocolId)) {
      if (!this.config.enableVersioning) {
        throw new Error(`Protocol already registered: ${protocolId}`);
      }

      // 版本控制检查
      await this.handleVersioning(protocol);
    }

    // 验证依赖关系
    if (protocol.dependencies) {
      await this.validateDependencies(protocol.dependencies);
    }

    // 创建注册表条目
    const entry: RegistryEntry = {
      protocol,
      status: 'registered',
      registeredAt: new Date().toISOString(),
      stats: {
        registrationTime: new Date().toISOString(),
        operationCount: Object.keys(protocol.operations).length,
        executionStats: {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          averageExecutionTime: 0,
          minExecutionTime: 0,
          maxExecutionTime: 0,
        },
        errorCount: 0,
      },
    };

    // 注册协议
    this.protocols.set(protocolId, entry);

    // 注册操作
    for (const [operationName, operation] of Object.entries(
      protocol.operations
    )) {
      const operationKey = `${protocolId}:${operationName}`;
      this.operations.set(operationKey, {
        protocolId,
        operation,
        stats: {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          averageExecutionTime: 0,
          minExecutionTime: 0,
          maxExecutionTime: 0,
        },
      });
    }

    // 更新版本映射
    this.updateVersionMapping(protocol);

    // 更新依赖图
    this.updateDependencyGraph(protocol);

    // 发布事件
    this.eventBus?.publish('protocol:registered', {
      protocolId,
      protocol,
      timestamp: new Date().toISOString(),
    });

    this.logger.info('Protocol registered', {
      protocolId,
      name: protocol.name,
      version: protocol.version,
      type: protocol.type,
      operationCount: Object.keys(protocol.operations).length,
    });
  }

  /**
   * 注销协议
   */
  async unregister(protocolId: string): Promise<boolean> {
    const entry = this.protocols.get(protocolId);
    if (!entry) {
      return false;
    }

    // 检查是否有其他协议依赖此协议
    const dependents = this.reverseDependencyGraph.get(protocolId);
    if (dependents && dependents.size > 0) {
      throw new Error(
        `Cannot unregister protocol ${protocolId}: it has dependents: ${Array.from(
          dependents
        ).join(', ')}`
      );
    }

    // 移除操作
    for (const operationName of Object.keys(entry.protocol.operations)) {
      const operationKey = `${protocolId}:${operationName}`;
      this.operations.delete(operationKey);
    }

    // 移除协议
    this.protocols.delete(protocolId);

    // 更新版本映射
    this.removeFromVersionMapping(entry.protocol);

    // 更新依赖图
    this.removeDependencyGraph(protocolId);

    // 发布事件
    this.eventBus?.publish('protocol:unregistered', {
      protocolId,
      timestamp: new Date().toISOString(),
    });

    this.logger.info('Protocol unregistered', { protocolId });
    return true;
  }

  /**
   * 获取协议
   */
  getProtocol(protocolId: string): ProtocolDefinition | undefined {
    const entry = this.protocols.get(protocolId);
    return entry?.protocol;
  }

  /**
   * 获取协议状态
   */
  getProtocolStatus(protocolId: string): ProtocolStatus | undefined {
    const entry = this.protocols.get(protocolId);
    return entry?.status;
  }

  /**
   * 设置协议状态
   */
  setProtocolStatus(protocolId: string, status: ProtocolStatus): boolean {
    const entry = this.protocols.get(protocolId);
    if (!entry) {
      return false;
    }

    entry.status = status;
    this.logger.debug('Protocol status updated', { protocolId, status });
    return true;
  }

  /**
   * 获取操作定义
   */
  getOperation(
    protocolId: string,
    operationName: string
  ): OperationDefinition | undefined {
    const operationKey = `${protocolId}:${operationName}`;
    const entry = this.operations.get(operationKey);
    return entry?.operation;
  }

  /**
   * 检查协议是否存在
   */
  hasProtocol(protocolId: string): boolean {
    return this.protocols.has(protocolId);
  }

  /**
   * 检查操作是否存在
   */
  hasOperation(protocolId: string, operationName: string): boolean {
    const operationKey = `${protocolId}:${operationName}`;
    return this.operations.has(operationKey);
  }

  /**
   * 获取所有协议
   */
  getAllProtocols(): ProtocolDefinition[] {
    return Array.from(this.protocols.values()).map(entry => entry.protocol);
  }

  /**
   * 按类型获取协议
   */
  getProtocolsByType(type: ProtocolType): ProtocolDefinition[] {
    return Array.from(this.protocols.values())
      .filter(entry => entry.protocol.type === type)
      .map(entry => entry.protocol);
  }

  /**
   * 按成熟度获取协议
   */
  getProtocolsByMaturity(maturity: ProtocolMaturity): ProtocolDefinition[] {
    return Array.from(this.protocols.values())
      .filter(entry => entry.protocol.metadata?.maturity === maturity)
      .map(entry => entry.protocol);
  }

  /**
   * 搜索协议
   */
  searchProtocols(query: string): ProtocolDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.protocols.values())
      .filter(entry => {
        const protocol = entry.protocol;
        return (
          protocol.name.toLowerCase().includes(lowerQuery) ||
          protocol.id.toLowerCase().includes(lowerQuery) ||
          protocol.metadata?.description?.toLowerCase().includes(lowerQuery) ||
          protocol.metadata?.tags?.some(tag =>
            tag.toLowerCase().includes(lowerQuery)
          )
        );
      })
      .map(entry => entry.protocol);
  }

  /**
   * 发现协议
   */
  discoverProtocols(filters?: {
    type?: ProtocolType;
    maturity?: ProtocolMaturity;
    tags?: string[];
  }): ProtocolDiscoveryResult {
    let protocols = Array.from(this.protocols.values());

    // 应用过滤器
    if (filters) {
      if (filters.type) {
        protocols = protocols.filter(
          entry => entry.protocol.type === filters.type
        );
      }
      if (filters.maturity) {
        protocols = protocols.filter(
          entry => entry.protocol.metadata?.maturity === filters.maturity
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        protocols = protocols.filter(entry => {
          const protocolTags = entry.protocol.metadata?.tags || [];
          return filters.tags!.some(tag => protocolTags.includes(tag));
        });
      }
    }

    return {
      protocols: protocols.map(entry => ({
        id: entry.protocol.id,
        name: entry.protocol.name,
        version: entry.protocol.version,
        type: entry.protocol.type,
        description: entry.protocol.metadata?.description,
        operations: Object.keys(entry.protocol.operations),
        dependencies: entry.protocol.dependencies || [],
        maturity: entry.protocol.metadata?.maturity || 'stable',
      })),
      totalCount: protocols.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 发现操作
   */
  discoverOperations(protocolId?: string): OperationDiscoveryResult {
    let operations = Array.from(this.operations.values());

    if (protocolId) {
      operations = operations.filter(entry => entry.protocolId === protocolId);
    }

    return {
      operations: operations.map(entry => ({
        protocolId: entry.protocolId,
        name: entry.operation.name,
        description: entry.operation.description,
        inputSchema: entry.operation.inputSchema,
        outputSchema: entry.operation.outputSchema,
        config: {
          timeout: entry.operation.timeout,
          retries: entry.operation.retries,
        },
      })),
      totalCount: operations.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 检查协议兼容性
   */
  checkCompatibility(
    protocolId: string,
    targetVersion: string
  ): CompatibilityCheckResult {
    const entry = this.protocols.get(protocolId);
    if (!entry) {
      throw new Error(`Protocol not found: ${protocolId}`);
    }

    const currentVersion = entry.protocol.version;

    // 简单的版本兼容性检查（实际实现会更复杂）
    const compatible = this.isVersionCompatible(currentVersion, targetVersion);

    return {
      compatible,
      version: currentVersion,
      targetVersion,
      issues: compatible
        ? []
        : [
            {
              type: 'breaking',
              message: `Version ${targetVersion} is not compatible with ${currentVersion}`,
            },
          ],
      recommendation: compatible
        ? undefined
        : `Upgrade to version ${targetVersion}`,
    };
  }

  /**
   * 获取协议统计
   */
  getProtocolStats(protocolId: string): ProtocolStats | undefined {
    const entry = this.protocols.get(protocolId);
    return entry?.stats;
  }

  /**
   * 更新执行统计
   */
  updateExecutionStats(
    protocolId: string,
    operationName: string,
    executionTime: number,
    success: boolean
  ): void {
    if (!this.config.enableStats) {
      return;
    }

    // 更新协议统计
    const protocolEntry = this.protocols.get(protocolId);
    if (protocolEntry) {
      protocolEntry.lastUsed = new Date().toISOString();
      this.updateStats(
        protocolEntry.stats.executionStats,
        executionTime,
        success
      );
      if (!success) {
        protocolEntry.stats.errorCount++;
      }
    }

    // 更新操作统计
    const operationKey = `${protocolId}:${operationName}`;
    const operationEntry = this.operations.get(operationKey);
    if (operationEntry) {
      this.updateStats(operationEntry.stats, executionTime, success);
    }
  }

  /**
   * 获取注册表统计
   */
  getRegistryStats() {
    return {
      totalProtocols: this.protocols.size,
      totalOperations: this.operations.size,
      protocolsByType: this.getProtocolCountByType(),
      protocolsByMaturity: this.getProtocolCountByMaturity(),
      protocolsByStatus: this.getProtocolCountByStatus(),
      dependencyCount: this.dependencyGraph.size,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.protocols.clear();
    this.operations.clear();
    this.versionMap.clear();
    this.dependencyGraph.clear();
    this.reverseDependencyGraph.clear();
    this.logger.info('Protocol registry cleared');
  }

  // 私有方法

  private async handleVersioning(protocol: ProtocolDefinition): Promise<void> {
    const protocolName = protocol.name;
    const versions = this.versionMap.get(protocolName) || new Set();

    if (versions.size >= this.config.maxVersionsPerProtocol) {
      throw new Error(
        `Maximum versions exceeded for protocol: ${protocolName}`
      );
    }
  }

  private async validateDependencies(dependencies: string[]): Promise<void> {
    for (const depId of dependencies) {
      if (!this.protocols.has(depId)) {
        throw new Error(`Missing dependency: ${depId}`);
      }
    }
  }

  private updateVersionMapping(protocol: ProtocolDefinition): void {
    const protocolName = protocol.name;
    if (!this.versionMap.has(protocolName)) {
      this.versionMap.set(protocolName, new Set());
    }
    this.versionMap.get(protocolName)!.add(protocol.version);
  }

  private removeFromVersionMapping(protocol: ProtocolDefinition): void {
    const protocolName = protocol.name;
    const versions = this.versionMap.get(protocolName);
    if (versions) {
      versions.delete(protocol.version);
      if (versions.size === 0) {
        this.versionMap.delete(protocolName);
      }
    }
  }

  private updateDependencyGraph(protocol: ProtocolDefinition): void {
    const protocolId = protocol.id;

    if (protocol.dependencies) {
      this.dependencyGraph.set(protocolId, new Set(protocol.dependencies));

      // 更新反向依赖图
      for (const depId of protocol.dependencies) {
        if (!this.reverseDependencyGraph.has(depId)) {
          this.reverseDependencyGraph.set(depId, new Set());
        }
        this.reverseDependencyGraph.get(depId)!.add(protocolId);
      }
    }
  }

  private removeDependencyGraph(protocolId: string): void {
    // 移除依赖关系
    const dependencies = this.dependencyGraph.get(protocolId);
    if (dependencies) {
      for (const depId of dependencies) {
        const dependents = this.reverseDependencyGraph.get(depId);
        if (dependents) {
          dependents.delete(protocolId);
          if (dependents.size === 0) {
            this.reverseDependencyGraph.delete(depId);
          }
        }
      }
      this.dependencyGraph.delete(protocolId);
    }
  }

  private updateStats(
    stats: ExecutionStats,
    executionTime: number,
    success: boolean
  ): void {
    stats.totalExecutions++;

    if (success) {
      stats.successfulExecutions++;
    } else {
      stats.failedExecutions++;
    }

    // 更新执行时间统计
    if (stats.totalExecutions === 1) {
      stats.minExecutionTime = executionTime;
      stats.maxExecutionTime = executionTime;
      stats.averageExecutionTime = executionTime;
    } else {
      stats.minExecutionTime = Math.min(stats.minExecutionTime, executionTime);
      stats.maxExecutionTime = Math.max(stats.maxExecutionTime, executionTime);

      const totalTime =
        stats.averageExecutionTime * (stats.totalExecutions - 1) +
        executionTime;
      stats.averageExecutionTime = totalTime / stats.totalExecutions;
    }

    stats.lastExecutionTime = new Date().toISOString();
  }

  private isVersionCompatible(
    currentVersion: string,
    targetVersion: string
  ): boolean {
    // 简化的版本兼容性检查
    const current = this.parseVersion(currentVersion);
    const target = this.parseVersion(targetVersion);

    // 主版本号相同则兼容
    return current.major === target.major;
  }

  private parseVersion(version: string): {
    major: number;
    minor: number;
    patch: number;
  } {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0,
    };
  }

  private getProtocolCountByType(): Record<ProtocolType, number> {
    const counts: Record<ProtocolType, number> = {
      core: 0,
      collab: 0,
      extension: 0,
    };
    for (const entry of this.protocols.values()) {
      counts[entry.protocol.type]++;
    }
    return counts;
  }

  private getProtocolCountByMaturity(): Record<ProtocolMaturity, number> {
    const counts: Record<ProtocolMaturity, number> = {
      experimental: 0,
      beta: 0,
      stable: 0,
      deprecated: 0,
    };
    for (const entry of this.protocols.values()) {
      const maturity = entry.protocol.metadata?.maturity || 'stable';
      counts[maturity]++;
    }
    return counts;
  }

  private getProtocolCountByStatus(): Record<ProtocolStatus, number> {
    const counts: Record<ProtocolStatus, number> = {
      registered: 0,
      active: 0,
      inactive: 0,
      deprecated: 0,
      unregistered: 0,
    };
    for (const entry of this.protocols.values()) {
      counts[entry.status]++;
    }
    return counts;
  }
}

/**
 * 创建默认协议注册表
 */
export function createProtocolRegistry(
  config: Partial<ProtocolRegistryConfig> = {}
): ProtocolRegistry {
  const defaultConfig: ProtocolRegistryConfig = {
    enableVersioning: true,
    enableStats: true,
    enableCompatibilityCheck: true,
    maxVersionsPerProtocol: 10,
    statsRetentionDays: 30,
  };

  return new ProtocolRegistry({ ...defaultConfig, ...config });
}
