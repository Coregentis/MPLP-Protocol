/**
 * Collab协议工厂
 * 
 * @description Collab模块的协议工厂实现，提供标准化的协议创建和依赖注入
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 * @pattern 基于Context/Plan/Confirm/Trace/Extension模块的IDENTICAL工厂模式
 */

import { CollabProtocol } from '../protocols/collab.protocol';
import { CollabManagementService } from '../../application/services/collab-management.service';
import { CollabRepositoryImpl } from '../repositories/collab.repository.impl';
import { ICollabRepository } from '../../domain/repositories/collab.repository';
import { CrossCuttingConcernsFactory } from '../../../../core/protocols/cross-cutting-concerns/factory';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
import { IMemberManager } from '../../domain/interfaces/member-manager.interface';
import { ITaskAllocator } from '../../domain/interfaces/task-allocator.interface';
import { ILogger } from '../../domain/interfaces/logger.interface';

/**
 * Collab协议工厂配置
 */
export interface CollabProtocolFactoryConfig {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  repositoryType?: 'memory' | 'database' | 'file';
  maxParticipants?: number;
  defaultCoordinationType?: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
  defaultDecisionMaking?: 'consensus' | 'majority' | 'weighted' | 'coordinator';
  crossCuttingConcerns?: {
    security?: { enabled: boolean };
    performance?: { enabled: boolean };
    eventBus?: { enabled: boolean };
    errorHandler?: { enabled: boolean };
    coordination?: { enabled: boolean };
    orchestration?: { enabled: boolean };
    stateSync?: { enabled: boolean };
    transaction?: { enabled: boolean };
    protocolVersion?: { enabled: boolean };
  };
}

/**
 * Collab协议工厂
 * 
 * @description 提供Collab协议的标准化创建和配置，基于其他5个模块的成功工厂模式
 */
export class CollabProtocolFactory {
  private static instance: CollabProtocolFactory | null = null;
  private protocol: CollabProtocol | null = null;

  private constructor() {}

  /**
   * 获取工厂单例实例
   */
  static getInstance(): CollabProtocolFactory {
    if (!CollabProtocolFactory.instance) {
      CollabProtocolFactory.instance = new CollabProtocolFactory();
    }
    return CollabProtocolFactory.instance;
  }

  /**
   * 创建Collab协议实例
   */
  async createProtocol(config: CollabProtocolFactoryConfig = {}): Promise<IMLPPProtocol> {
    if (this.protocol) {
      return this.protocol;
    }

    // 创建横切关注点管理器
    const crossCuttingFactory = CrossCuttingConcernsFactory.getInstance();
    const managers = crossCuttingFactory.createManagers({
      security: { enabled: config.crossCuttingConcerns?.security?.enabled ?? true },
      performance: { enabled: config.crossCuttingConcerns?.performance?.enabled ?? (config.enableMetrics ?? true) },
      eventBus: { enabled: config.crossCuttingConcerns?.eventBus?.enabled ?? true },
      errorHandler: { enabled: config.crossCuttingConcerns?.errorHandler?.enabled ?? true },
      coordination: { enabled: config.crossCuttingConcerns?.coordination?.enabled ?? true },
      orchestration: { enabled: config.crossCuttingConcerns?.orchestration?.enabled ?? true },
      stateSync: { enabled: config.crossCuttingConcerns?.stateSync?.enabled ?? true },
      transaction: { enabled: config.crossCuttingConcerns?.transaction?.enabled ?? true },
      protocolVersion: { enabled: config.crossCuttingConcerns?.protocolVersion?.enabled ?? true }
    });

    // 创建核心组件
    const repository = new CollabRepositoryImpl();

    // 创建临时Mock实现以满足重构后的依赖注入要求
    const mockMemberManager = {} as IMemberManager; // TODO: 实现真正的MemberManager
    const mockTaskAllocator = {} as ITaskAllocator; // TODO: 实现真正的TaskAllocator
    const mockLogger = {} as ILogger; // TODO: 实现真正的Logger

    const collabManagementService = new CollabManagementService(
      repository as unknown as ICollabRepository,
      mockMemberManager,
      mockTaskAllocator,
      mockLogger
    );

    // 创建协议实例
    this.protocol = new CollabProtocol(
      collabManagementService,
      managers.security,
      managers.performance,
      managers.eventBus,
      managers.errorHandler,
      managers.coordination,
      managers.orchestration,
      managers.stateSync,
      managers.transaction,
      managers.protocolVersion
    );

    return this.protocol;
  }

  /**
   * 创建带配置的协议实例
   */
  async createConfiguredProtocol(config: CollabProtocolFactoryConfig): Promise<IMLPPProtocol> {
    // 重置现有实例以应用新配置
    this.protocol = null;
    return this.createProtocol(config);
  }

  /**
   * 获取协议元数据
   */
  getProtocolMetadata(): ProtocolMetadata {
    return {
      name: 'collab',
      version: '1.0.0',
      description: 'Multi-Agent Collaboration management protocol with enterprise-grade features',
      capabilities: [
        'collaboration_creation',
        'collaboration_management',
        'participant_management',
        'coordination_strategy',
        'lifecycle_management',
        'performance_monitoring',
        'event_publishing'
      ],
      dependencies: [
        'security',
        'performance',
        'eventBus',
        'errorHandler',
        'coordination',
        'orchestration',
        'stateSync',
        'transaction',
        'protocolVersion'
      ],
      supportedOperations: [
        'create',
        'update',
        'delete',
        'get',
        'list',
        'start',
        'stop',
        'add_participant',
        'remove_participant'
      ]
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const checks: HealthStatus['checks'] = [];

    try {
      // 检查协议实例
      if (this.protocol) {
        const protocolHealth = await this.protocol.healthCheck();
        checks.push({
          name: 'protocol',
          status: protocolHealth.status === 'healthy' ? 'pass' : 'fail',
          message: protocolHealth.status === 'healthy' ? 'Protocol is healthy' : 'Protocol is unhealthy'
        });
      } else {
        checks.push({
          name: 'protocol',
          status: 'warn',
          message: 'Protocol not yet created'
        });
      }

      // 检查工厂状态
      checks.push({
        name: 'factory',
        status: 'pass',
        message: 'Factory is operational'
      });

      const allHealthy = checks.every(check => check.status === 'pass');

      return {
        status: allHealthy ? 'healthy' : (checks.some(check => check.status === 'fail') ? 'unhealthy' : 'degraded'),
        timestamp,
        checks
      };
    } catch (error) {
      checks.push({
        name: 'healthCheck',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error during health check'
      });

      return {
        status: 'unhealthy',
        timestamp,
        checks
      };
    }
  }

  /**
   * 重置工厂状态
   */
  reset(): void {
    this.protocol = null;
  }

  /**
   * 销毁工厂实例
   */
  static destroy(): void {
    if (CollabProtocolFactory.instance) {
      CollabProtocolFactory.instance.reset();
      CollabProtocolFactory.instance = null;
    }
  }

  /**
   * 获取默认配置
   */
  static getDefaultConfig(): CollabProtocolFactoryConfig {
    return {
      enableLogging: true,
      enableMetrics: true,
      enableCaching: false,
      repositoryType: 'memory',
      maxParticipants: 100,
      defaultCoordinationType: 'distributed',
      defaultDecisionMaking: 'consensus',
      crossCuttingConcerns: {
        security: { enabled: true },
        performance: { enabled: true },
        eventBus: { enabled: true },
        errorHandler: { enabled: true },
        coordination: { enabled: true },
        orchestration: { enabled: true },
        stateSync: { enabled: true },
        transaction: { enabled: true },
        protocolVersion: { enabled: true }
      }
    };
  }

  /**
   * 验证配置
   */
  static validateConfig(config: CollabProtocolFactoryConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.maxParticipants && (config.maxParticipants < 2 || config.maxParticipants > 1000)) {
      errors.push('maxParticipants must be between 2 and 1000');
    }

    if (config.repositoryType && !['memory', 'database', 'file'].includes(config.repositoryType)) {
      errors.push('repositoryType must be one of: memory, database, file');
    }

    if (config.defaultCoordinationType && !['centralized', 'distributed', 'hierarchical', 'peer_to_peer'].includes(config.defaultCoordinationType)) {
      errors.push('defaultCoordinationType must be one of: centralized, distributed, hierarchical, peer_to_peer');
    }

    if (config.defaultDecisionMaking && !['consensus', 'majority', 'weighted', 'coordinator'].includes(config.defaultDecisionMaking)) {
      errors.push('defaultDecisionMaking must be one of: consensus, majority, weighted, coordinator');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
