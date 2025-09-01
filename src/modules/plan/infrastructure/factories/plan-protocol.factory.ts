/**
 * Plan协议工厂
 * 
 * @description Plan模块的协议工厂实现，提供标准化的协议创建和依赖注入
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 */

import { PlanProtocol } from '../protocols/plan.protocol';

import { CrossCuttingConcernsFactory } from '../../../../core/protocols/cross-cutting-concerns/factory';
import { IMLPPProtocol, ProtocolMetadata, HealthStatus } from '../../../../core/protocols/mplp-protocol-base';
import { PlanRequestEntity, PlanResultEntity, PlanStatus } from '../../application/services/plan-protocol.service';

/**
 * Plan协议工厂配置
 */
export interface PlanProtocolFactoryConfig {
  enableLogging?: boolean;
  enableMetrics?: boolean;
  enableCaching?: boolean;
  repositoryType?: 'memory' | 'database' | 'file';
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
 * Plan协议工厂
 * 
 * @description 提供Plan协议的标准化创建和配置
 */
export class PlanProtocolFactory {
  private static instance: PlanProtocolFactory;
  private protocol: PlanProtocol | null = null;

  private constructor() {}

  /**
   * 获取工厂单例实例
   */
  static getInstance(): PlanProtocolFactory {
    if (!PlanProtocolFactory.instance) {
      PlanProtocolFactory.instance = new PlanProtocolFactory();
    }
    return PlanProtocolFactory.instance;
  }

  /**
   * 创建Plan协议实例
   */
  async createProtocol(config: PlanProtocolFactoryConfig = {}): Promise<IMLPPProtocol> {
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

    // 核心组件已集成到3个企业级服务中

    // 创建简单的日志记录器
    const logger = {
      info: (message: string, meta?: Record<string, unknown>) => {
        if (process.env.NODE_ENV !== 'test') {
          // eslint-disable-next-line no-console
          console.log(`[INFO] ${message}`, meta);
        }
      },
      warn: (message: string, meta?: Record<string, unknown>) => {
        if (process.env.NODE_ENV !== 'test') {
          // eslint-disable-next-line no-console
          console.warn(`[WARN] ${message}`, meta);
        }
      },
      error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
        if (process.env.NODE_ENV !== 'test') {
          // eslint-disable-next-line no-console
          console.error(`[ERROR] ${message}`, error, meta);
        }
      },
      debug: (message: string, meta?: Record<string, unknown>) => {
        if (process.env.NODE_ENV !== 'test') {
          // eslint-disable-next-line no-console
          console.debug(`[DEBUG] ${message}`, meta);
        }
      }
    };

    // 创建Plan仓储 (简化版本)
    const planRepository = {
      savePlanRequest: async (request: PlanRequestEntity): Promise<PlanRequestEntity> => ({
        ...request,
        requestId: request.requestId || `plan-req-${Date.now()}`,
        planType: request.planType,
        parameters: request.parameters || {},
        constraints: request.constraints || {},
        status: request.status || ('pending' as PlanStatus),
        createdAt: request.createdAt || new Date(),
        updatedAt: request.updatedAt
      }),
      findPlanRequest: async (requestId: string) => ({
        requestId,
        planType: 'task_planning' as const,
        parameters: {},
        constraints: {},
        status: 'pending' as const,
        createdAt: new Date()
      }),
      updatePlanRequestStatus: async () => undefined,
      savePlanResult: async (result: PlanResultEntity): Promise<PlanResultEntity> => ({
        ...result,
        resultId: `plan-res-${Date.now()}`,
        planData: result.planData || {},
        confidence: result.confidence || 0.8,
        metadata: result.metadata || { processingTime: 100 },
        status: result.status || 'completed' as const,
        createdAt: new Date()
      }),
      findPlanResult: async (requestId: string) => ({
        requestId,
        resultId: `plan-res-${Date.now()}`,
        planData: {},
        confidence: 0.8,
        metadata: { processingTime: 100 },
        status: 'completed' as const,
        createdAt: new Date()
      }),
      findById: async () => null,
      save: async (entity: Record<string, unknown>) => entity,
      update: async (entity: Record<string, unknown>) => entity
    };

    // 创建AI服务适配器 (简化版本)
    const aiServiceAdapter = {
      executePlanning: async () => ({ requestId: '', planData: {}, confidence: 0.8, metadata: { processingTime: 100 }, status: 'completed' as const }),
      optimizePlan: async () => ({ requestId: '', planData: {}, confidence: 0.8, metadata: { processingTime: 100 }, status: 'completed' as const }),
      validatePlan: async () => ({ isValid: true, violations: [], recommendations: [] }),
      getServiceInfo: () => ({ name: 'Mock AI Service', version: '1.0.0', capabilities: [], supportedAlgorithms: [], maxRequestSize: 1024, averageResponseTime: 100 }),
      healthCheck: async () => true
    };

    // 创建3个企业级服务
    const { PlanProtocolService } = await import('../../application/services/plan-protocol.service');

    const planProtocolService = new PlanProtocolService(planRepository, aiServiceAdapter, logger);

    // 创建PlanIntegrationService和PlanValidationService
    const { PlanIntegrationService } = await import('../../application/services/plan-integration.service');
    const { PlanValidationService } = await import('../../application/services/plan-validation.service');

    const planIntegrationService = new PlanIntegrationService(planRepository, { coordinateOperation: async () => ({}), healthCheck: async () => true }, logger);
    const planValidationService = new PlanValidationService({ validatePlanType: () => true, validateParameters: () => ({ isValid: true, errors: [], warnings: [] }), validateConstraints: () => ({ isValid: true, errors: [], warnings: [] }) }, { checkPlanQuality: async () => ({ score: 0.85, issues: [] }), checkDataIntegrity: async () => ({ isValid: true, issues: [] }) }, logger);

    // 创建协议实例 (集成3个企业级服务)
    this.protocol = new PlanProtocol(
      planProtocolService,
      planIntegrationService,
      planValidationService,
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
   */
  getProtocolMetadata(): ProtocolMetadata {
    return {
      name: 'plan',
      version: '1.0.0',
      description: 'MPLP Plan Protocol - Intelligent Task Planning and Coordination',
      capabilities: [
        'plan_creation',
        'plan_management',
        'task_coordination',
        'plan_execution',
        'plan_optimization',
        'plan_validation',
        'resource_allocation',
        'risk_management',
        'milestone_tracking',
        'progress_monitoring'
      ],
      dependencies: [
        'context',
        'confirm',
        'trace',
        'role',
        'extension'
      ],
      supportedOperations: [
        'create',
        'get',
        'update',
        'delete',
        'execute',
        'optimize',
        'validate',
        'healthCheck'
      ]
    };
  }

  /**
   * 获取协议健康状态
   */
  async getHealthStatus(): Promise<HealthStatus> {
    if (!this.protocol) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: [
          {
            name: 'protocol_instance',
            status: 'fail',
            message: 'Protocol not initialized'
          }
        ],
        metadata: {
          protocolName: 'plan',
          version: '1.0.0'
        }
      };
    }

    return await this.protocol.healthCheck();
  }

  /**
   * 重置协议实例
   */
  reset(): void {
    this.protocol = null;
  }

  /**
   * 销毁协议实例
   */
  async destroy(): Promise<void> {
    if (this.protocol) {
      // 执行清理操作
      this.protocol = null;
    }
  }

  /**
   * 获取当前协议实例
   */
  getCurrentProtocol(): PlanProtocol | null {
    return this.protocol;
  }

  /**
   * 检查协议是否已初始化
   */
  isInitialized(): boolean {
    return this.protocol !== null;
  }

  /**
   * 创建协议的便捷方法
   */
  static async create(config: PlanProtocolFactoryConfig = {}): Promise<IMLPPProtocol> {
    const factory = PlanProtocolFactory.getInstance();
    return await factory.createProtocol(config);
  }

  /**
   * 获取默认配置
   */
  static getDefaultConfig(): PlanProtocolFactoryConfig {
    return {
      enableLogging: true,
      enableMetrics: true,
      enableCaching: true,
      repositoryType: 'memory',
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
   * 创建开发环境配置
   */
  static getDevelopmentConfig(): PlanProtocolFactoryConfig {
    return {
      enableLogging: true,
      enableMetrics: false,
      enableCaching: false,
      repositoryType: 'memory',
      crossCuttingConcerns: {
        security: { enabled: false },
        performance: { enabled: false },
        eventBus: { enabled: true },
        errorHandler: { enabled: true },
        coordination: { enabled: true },
        orchestration: { enabled: true },
        stateSync: { enabled: false },
        transaction: { enabled: false },
        protocolVersion: { enabled: true }
      }
    };
  }

  /**
   * 创建生产环境配置
   */
  static getProductionConfig(): PlanProtocolFactoryConfig {
    return {
      enableLogging: true,
      enableMetrics: true,
      enableCaching: true,
      repositoryType: 'database',
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
}
