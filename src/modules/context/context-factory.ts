/**
 * MPLP Context模块工厂函数
 * 
 * Context模块初始化和配置管理
 * 严格按照 context-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T17:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配context-protocol.json Schema定义
 * @schema_path src/schemas/context-protocol.json
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  ContextProtocol,
  CreateContextRequest,
  ContextConfiguration,
  ContextStatus,
  ContextLifecycleStage,
  AccessControl,
  SharedState,
  ContextError,
  ValidationError,
  TimeoutSettings,
  PersistenceSettings,
  NotificationSettings,
  ResourceManagement,
  ContextDependency,
  ContextGoal,
  ContextOwner,
  ContextPermission
} from './types';
import { ContextService, IContextRepository, IContextValidator } from './context-service';
import { ContextManager, ContextManagerConfig } from './context-manager';
import { ContextController } from './context.controller';
import { logger } from '../../utils/logger';

/**
 * Context模块工厂配置选项
 */
export interface ContextFactoryOptions {
  repository: IContextRepository;
  validator: IContextValidator;
  defaultConfiguration?: Partial<ContextConfiguration>;
  enablePerformanceMonitoring?: boolean;
  enableAuditLogging?: boolean;
}

/**
 * Context模块初始化结果
 */
export interface ContextModuleComponents {
  service: ContextService;
  manager: ContextManager;
  controller: ContextController;
  moduleInfo: {
    name: string;
    version: string;
    initialized_at: string;
    configuration: ContextConfiguration;
  };
}

/**
 * 创建默认的Context配置
 */
export function createDefaultContextConfiguration(): ContextConfiguration {
  const timeoutSettings: TimeoutSettings = {
      default_timeout: 300,
      max_timeout: 3600,
      cleanup_timeout: 60
  };

  const persistenceSettings: PersistenceSettings = {
      enabled: true,
      storage_backend: 'database',
      retention_policy: {
        duration: '30d',
        max_versions: 10
      }
  };

  const notificationSettings: NotificationSettings = {
    enabled: false,
    channels: [],
    events: []
  };

  return {
    timeout_settings: timeoutSettings,
    notification_settings: notificationSettings,
    persistence: persistenceSettings
  };
}

/**
 * 创建默认的访问控制配置
 */
export function createDefaultAccessControl(
  ownerUserId: string,
  ownerRole: string = 'admin'
): AccessControl {
  const owner: ContextOwner = {
      user_id: ownerUserId,
      role: ownerRole
  };

  const permissions: ContextPermission[] = [
      {
        principal: ownerUserId,
        principal_type: 'user',
        resource: '*',
        actions: ['read', 'write', 'execute', 'delete', 'admin']
      }
  ];

  return {
    owner,
    permissions,
    policies: []
  };
}

/**
 * 创建默认的共享状态
 */
export function createDefaultSharedState(): SharedState {
  const resources: ResourceManagement = {
    allocated: {},
    requirements: {}
  };

  const dependencies: ContextDependency[] = [];
  const goals: ContextGoal[] = [];

  return {
    variables: {},
    resources,
    dependencies,
    goals
  };
}

/**
 * Context工厂类
 */
export class ContextFactory {
  private repository: IContextRepository;
  private validator: IContextValidator;
  private defaultConfiguration: ContextConfiguration;
  private performanceMonitoringEnabled: boolean;
  private auditLoggingEnabled: boolean;

  constructor(options: ContextFactoryOptions) {
    this.repository = options.repository;
    this.validator = options.validator;
    this.defaultConfiguration = {
      ...createDefaultContextConfiguration(),
      ...options.defaultConfiguration
    };
    this.performanceMonitoringEnabled = options.enablePerformanceMonitoring ?? true;
    this.auditLoggingEnabled = options.enableAuditLogging ?? true;

    logger.info('Context工厂初始化完成', {
      performance_monitoring: this.performanceMonitoringEnabled,
      audit_logging: this.auditLoggingEnabled
    });
  }

  /**
   * 创建完整的Context模块组件
   */
  public async createContextModule(): Promise<ContextModuleComponents> {
    try {
      logger.info('开始创建Context模块组件');

      // 创建服务层
      const service = new ContextService(this.repository, this.validator);

      // 创建管理器层 - 修复构造函数参数
      const managerConfig: ContextManagerConfig = {
        autoInitialize: true,
        enablePerformanceMonitoring: this.performanceMonitoringEnabled,
        defaultTimeout: this.defaultConfiguration.timeout_settings.default_timeout,
        maxConcurrentOperations: 10,
        cacheStrategy: 'memory',
        autoCleanupEnabled: true,
        cleanupIntervalSeconds: 300
      };
      
      const manager = new ContextManager(this.repository, this.validator, managerConfig);

      // 创建控制器层
      const controller = new ContextController(service);

      // 模块信息
      const moduleInfo = {
        name: 'Context',
        version: '1.0.2',
        initialized_at: new Date().toISOString(),
        configuration: this.defaultConfiguration
      };

      logger.info('Context模块组件创建完成', {
        module: 'ContextFactory',
        components: ['service', 'manager', 'controller']
      });

      return {
        service,
        manager,
        controller,
        moduleInfo
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Context模块创建失败', { error: message });
      throw new ContextError(`Failed to create Context module: ${message}`, 'FACTORY_ERROR', { originalError: error });
    }
  }

  /**
   * 创建Context实例的便捷方法
   */
  public async createContextInstance(request: CreateContextRequest): Promise<ContextProtocol> {
    try {
      // 验证创建请求 - 修复方法名
      const validationResult = await this.validator.validateCreate(request);
      if (!validationResult.valid) {
        const errors = validationResult.errors || [];
        throw new ValidationError(`Invalid create request: ${errors.join(', ')}`, { validationErrors: errors });
      }

      // 生成Context ID和时间戳
      const contextId = uuidv4();
      const timestamp = new Date().toISOString();

      // 处理共享状态 - 确保完整结构
      const sharedState: SharedState = request.shared_state ? 
        this.mergeWithDefaultSharedState(request.shared_state) : 
        createDefaultSharedState();

      // 处理访问控制 - 确保完整结构
      const accessControl: AccessControl = request.access_control ?
        this.mergeWithDefaultAccessControl(request.access_control, 'system', 'admin') :
        createDefaultAccessControl('system', 'admin');

      // 创建Context协议对象
      const context: ContextProtocol = {
        protocol_version: '1.0.1',
        timestamp,
        context_id: contextId,
        name: request.name,
        description: request.description,
        status: 'active',
        lifecycle_stage: 'planning',
        shared_state: sharedState,
        access_control: accessControl,
        configuration: {
          ...this.defaultConfiguration,
          ...request.configuration
        }
      };

      // 保存到仓库
      await this.repository.save(context);

      logger.info('Context实例创建成功', {
        context_id: contextId,
        name: request.name
      });

      return context;

    } catch (error) {
      if (error instanceof ValidationError || error instanceof ContextError) {
        throw error;
      }
      
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Context实例创建失败', { error: message });
      throw new ContextError(`Failed to create Context instance: ${message}`, 'INSTANCE_CREATION_ERROR', { originalError: error });
    }
  }

  /**
   * 合并部分共享状态到默认结构
   */
  private mergeWithDefaultSharedState(partial: Partial<SharedState>): SharedState {
    const defaultState = createDefaultSharedState();
    
    return {
      variables: { ...defaultState.variables, ...partial.variables },
      resources: {
        allocated: { ...defaultState.resources.allocated, ...partial.resources?.allocated },
        requirements: { ...defaultState.resources.requirements, ...partial.resources?.requirements }
      },
      dependencies: partial.dependencies ?? defaultState.dependencies,
      goals: partial.goals ?? defaultState.goals
    };
  }

  /**
   * 合并部分访问控制到默认结构
   */
  private mergeWithDefaultAccessControl(
    partial: Partial<AccessControl>, 
    defaultUserId: string, 
    defaultRole: string
  ): AccessControl {
    const defaultAccess = createDefaultAccessControl(defaultUserId, defaultRole);
    
    return {
      owner: partial.owner ?? defaultAccess.owner,
      permissions: partial.permissions ?? defaultAccess.permissions,
      policies: partial.policies ?? defaultAccess.policies
    };
  }

  /**
   * 批量创建Context实例
   */
  public async createContextBatch(requests: CreateContextRequest[]): Promise<{
    successful: ContextProtocol[];
    failed: { request: CreateContextRequest; error: string }[];
  }> {
    const successful: ContextProtocol[] = [];
    const failed: { request: CreateContextRequest; error: string }[] = [];

    for (const request of requests) {
      try {
        const context = await this.createContextInstance(request);
        successful.push(context);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        failed.push({
          request,
          error: errorMessage
        });
      }
    }

    logger.info('Context批量创建完成', {
      total: requests.length,
      successful: successful.length,
      failed: failed.length
    });

    return { successful, failed };
  }

  /**
   * 验证Context模块配置
   */
  public validateConfiguration(config: ContextConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证超时设置
    if (!config.timeout_settings) {
      errors.push('Missing timeout_settings');
    } else {
      if (config.timeout_settings.default_timeout <= 0) {
        errors.push('default_timeout must be greater than 0');
      }
      if (config.timeout_settings.max_timeout <= config.timeout_settings.default_timeout) {
        errors.push('max_timeout must be greater than default_timeout');
      }
      // 修复可能为undefined的问题
      if (config.timeout_settings.cleanup_timeout !== undefined && config.timeout_settings.cleanup_timeout <= 0) {
        errors.push('cleanup_timeout must be greater than 0');
      }
    }

    // 验证持久化设置
    if (!config.persistence) {
      errors.push('Missing persistence settings');
    } else {
      const validBackends = ['database', 'file', 'memory', 'redis'];
      if (!validBackends.includes(config.persistence.storage_backend)) {
        errors.push(`Invalid storage_backend: ${config.persistence.storage_backend}`);
      }
      
      // 修复可能为undefined的问题
      if (config.persistence.retention_policy?.max_versions !== undefined && config.persistence.retention_policy.max_versions <= 0) {
        errors.push('max_versions must be greater than 0');
      }
    }

    // 验证通知设置
    if (config.notification_settings && config.notification_settings.enabled) {
      if (!config.notification_settings.channels || config.notification_settings.channels.length === 0) {
        errors.push('notification_settings.channels cannot be empty when notifications are enabled');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 更新默认配置
   */
  public updateDefaultConfiguration(updates: Partial<ContextConfiguration>): void {
    this.defaultConfiguration = {
      ...this.defaultConfiguration,
      ...updates
    };

    logger.info('默认配置已更新', { updates });
  }

  /**
   * 获取当前默认配置
   */
  public getDefaultConfiguration(): ContextConfiguration {
    return { ...this.defaultConfiguration };
  }

  /**
   * 获取工厂统计信息
   */
  public getFactoryStats(): {
    performance_monitoring: boolean;
    audit_logging: boolean;
    default_configuration: ContextConfiguration;
  } {
    return {
      performance_monitoring: this.performanceMonitoringEnabled,
      audit_logging: this.auditLoggingEnabled,
      default_configuration: this.getDefaultConfiguration()
    };
  }
}

/**
 * 创建Context工厂实例的便捷函数
 */
export function createContextFactory(options: ContextFactoryOptions): ContextFactory {
  return new ContextFactory(options);
}

/**
 * 创建简单的Context模块（无工厂依赖）
 */
export async function createSimpleContextModule(
  repository: IContextRepository,
  validator: IContextValidator
): Promise<Pick<ContextModuleComponents, 'service' | 'controller'>> {
  const service = new ContextService(repository, validator);
  const controller = new ContextController(service);

  return { service, controller };
} 