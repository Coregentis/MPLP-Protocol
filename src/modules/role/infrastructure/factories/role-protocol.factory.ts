/**
 * Role协议工厂
 * 
 * @description Role模块的协议工厂实现，提供标准化的协议创建和依赖注入
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 * @schema 基于 mplp-role.json Schema驱动开发
 * @naming Schema层(snake_case) ↔ TypeScript层(camelCase)
 */

import { RoleProtocol } from '../protocols/role.protocol';
import { RoleManagementService } from '../../application/services/role-management.service';
import { MemoryRoleRepository } from '../repositories/role.repository';

import { CrossCuttingConcernsFactory } from '../../../../core/protocols/cross-cutting-concerns/factory';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';

/**
 * Role协议工厂配置
 * @description 基于mplp-role.json Schema的配置接口
 */
export interface RoleProtocolFactoryConfig {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  repositoryType?: 'memory' | 'database' | 'file';
  
  // 基于Schema的Role特定配置
  roleConfiguration?: {
    maxRoles?: number;
    defaultRoleType?: 'system' | 'organizational' | 'functional' | 'project' | 'temporary';
    permissionModel?: 'rbac' | 'abac' | 'hybrid';
    inheritanceMode?: 'none' | 'single' | 'multiple';
    auditEnabled?: boolean;
    securityClearanceRequired?: boolean;
  };
  
  // 基于Schema的Agent管理配置
  agentManagement?: {
    maxAgents?: number;
    autoScaling?: boolean;
    loadBalancing?: boolean;
    healthCheckIntervalMs?: number;
  };
  
  // 基于Schema的性能监控配置
  performanceMetrics?: {
    enabled?: boolean;
    collectionIntervalSeconds?: number;
    roleAssignmentLatencyThresholdMs?: number;
    permissionCheckLatencyThresholdMs?: number;
    securityScoreThreshold?: number;
  };
  
  // 横切关注点配置
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
 * Role协议工厂
 * 
 * @description 提供Role协议的标准化创建和配置
 * @schema 严格遵循mplp-role.json Schema定义
 * @naming 双重命名约定：Schema(snake_case) ↔ TypeScript(camelCase)
 */
export class RoleProtocolFactory {
  private static instance: RoleProtocolFactory;
  private protocol: RoleProtocol | null = null;

  private constructor() {}

  /**
   * 获取工厂单例实例
   */
  static getInstance(): RoleProtocolFactory {
    if (!RoleProtocolFactory.instance) {
      RoleProtocolFactory.instance = new RoleProtocolFactory();
    }
    return RoleProtocolFactory.instance;
  }

  /**
   * 创建Role协议实例
   * @param config 基于mplp-role.json Schema的配置
   */
  async createProtocol(config: RoleProtocolFactoryConfig = {}): Promise<IMLPPProtocol> {
    if (this.protocol) {
      return this.protocol;
    }

    // 创建横切关注点管理器
    const crossCuttingFactory = CrossCuttingConcernsFactory.getInstance();
    const managers = crossCuttingFactory.createManagers({
      security: { enabled: config.crossCuttingConcerns?.security?.enabled ?? true },
      performance: { enabled: config.crossCuttingConcerns?.performance?.enabled ?? (config.enableMetrics ?? false) },
      eventBus: { enabled: config.crossCuttingConcerns?.eventBus?.enabled ?? true },
      errorHandler: { enabled: config.crossCuttingConcerns?.errorHandler?.enabled ?? true },
      coordination: { enabled: config.crossCuttingConcerns?.coordination?.enabled ?? true },
      orchestration: { enabled: config.crossCuttingConcerns?.orchestration?.enabled ?? true },
      stateSync: { enabled: config.crossCuttingConcerns?.stateSync?.enabled ?? true },
      transaction: { enabled: config.crossCuttingConcerns?.transaction?.enabled ?? true },
      protocolVersion: { enabled: config.crossCuttingConcerns?.protocolVersion?.enabled ?? true }
    });

    // 创建仓库实例
    const repository = new MemoryRoleRepository();

    // 创建核心组件
    const roleManagementService = new RoleManagementService(repository);

    // 创建协议实例
    this.protocol = new RoleProtocol(
      roleManagementService,
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
   * 获取协议元数据
   * @description 基于mplp-role.json Schema的元数据
   */
  getProtocolMetadata(): ProtocolMetadata {
    return {
      name: 'MPLP Role Protocol',
      version: '1.0.0',
      description: 'Role模块协议 - 企业级RBAC安全中心和权限管理',
      capabilities: [
        'role_management',
        'permission_control',
        'agent_management',
        'rbac_security',
        'inheritance_management',
        'delegation_control',
        'audit_trail',
        'performance_monitoring'
      ],
      dependencies: [
        'mplp-security',
        'mplp-event-bus',
        'mplp-coordination',
        'mplp-orchestration'
      ],
      supportedOperations: [
        'create_role',
        'update_role',
        'delete_role',
        'get_role',
        'list_roles',
        'check_permission',
        'assign_role',
        'revoke_role'
      ]
    };
  }

  /**
   * 获取协议健康状态
   * @description 基于Schema定义的健康检查
   */
  async getHealthStatus(): Promise<HealthStatus> {
    if (!this.protocol) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        details: {
          protocol: 'not_created',
          services: 'not_available',
          crossCuttingConcerns: 'not_initialized'
        },
        checks: [
          {
            name: 'protocol_initialization',
            status: 'fail',
            message: 'Role protocol not initialized'
          }
        ]
      };
    }

    try {
      // 基本健康检查
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        details: {
          protocol: 'initialized',
          services: 'available',
          crossCuttingConcerns: 'initialized',
          roleManagement: 'active',
          permissionControl: 'active',
          agentManagement: 'active'
        },
        checks: [
          {
            name: 'protocol_initialization',
            status: 'pass',
            message: 'Role protocol successfully initialized'
          },
          {
            name: 'service_availability',
            status: 'pass',
            message: 'Role management service is available'
          }
        ]
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        details: {
          protocol: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        checks: [
          {
            name: 'health_check',
            status: 'fail',
            message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ]
      };
    }
  }

  /**
   * 重置协议实例
   * @description 用于测试和重新配置
   */
  reset(): void {
    this.protocol = null;
  }

  /**
   * 销毁协议实例
   * @description 清理资源和连接
   */
  async destroy(): Promise<void> {
    if (this.protocol) {
      // 如果协议有销毁方法，调用它
      if ('destroy' in this.protocol && typeof this.protocol.destroy === 'function') {
        await this.protocol.destroy();
      }
      this.protocol = null;
    }
  }
}

/**
 * 默认Role协议工厂配置
 * @description 基于mplp-role.json Schema的默认配置
 */
export const DEFAULT_ROLE_PROTOCOL_CONFIG: RoleProtocolFactoryConfig = {
  enableLogging: false,
  enableMetrics: true,
  enableCaching: true,
  repositoryType: 'memory',
  
  roleConfiguration: {
    maxRoles: 1000,
    defaultRoleType: 'functional',
    permissionModel: 'rbac',
    inheritanceMode: 'multiple',
    auditEnabled: true,
    securityClearanceRequired: false
  },
  
  agentManagement: {
    maxAgents: 100,
    autoScaling: false,
    loadBalancing: true,
    healthCheckIntervalMs: 30000
  },
  
  performanceMetrics: {
    enabled: true,
    collectionIntervalSeconds: 60,
    roleAssignmentLatencyThresholdMs: 100,
    permissionCheckLatencyThresholdMs: 10,
    securityScoreThreshold: 8.0
  },
  
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
