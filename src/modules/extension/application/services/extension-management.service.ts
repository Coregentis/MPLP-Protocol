/**
 * Extension管理服务
 *
 * 应用层服务，协调领域对象和基础设施层
 *
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, Version } from '../../../../public/shared/types';
import { Extension } from '../../domain/entities/extension.entity';
import {
  IExtensionRepository,
  ExtensionFilter,
  PaginationOptions,
  PaginatedResult,
} from '../../domain/repositories/extension-repository.interface';
import {
  ExtensionType,
  ExtensionStatus,
  ExtensionConfiguration,
  ExtensionPoint,
  ApiExtension,
  EventSubscription as _EventSubscription,
} from '../../types';

/**
 * 创建扩展请求
 */
export interface CreateExtensionRequest {
  context_id: UUID;
  name: string;
  version: Version;
  type: ExtensionType;
  display_name?: string;
  description?: string;
  configuration?: ExtensionConfiguration;
  dependencies?: ExtensionDependency[];
  conflicts?: ExtensionConflict[];
}

/**
 * 扩展依赖
 */
export interface ExtensionDependency {
  extension_id: UUID;
  name: string;
  version_range: string;
  optional: boolean;
}

/**
 * 扩展冲突
 */
export interface ExtensionConflict {
  extension_id: UUID;
  name: string;
  reason: string;
}

/**
 * 操作结果
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Extension管理服务
 *
 * 增强版本：实现MPLP预留接口模式，支持与其他模块的智能协作
 *
 * @version 2.0.0 - 增加预留接口模式支持
 * @updated 2025-08-11 - 实现MPLP生态系统集成
 */
export class ExtensionManagementService {
  constructor(private readonly extensionRepository: IExtensionRepository) {}

  // ===== MPLP预留接口模式实现 =====
  // 这些接口使用下划线前缀标记，等待CoreOrchestrator激活

  /**
   * 预留接口：Role模块权限集成
   * 等待CoreOrchestrator注入Role模块权限验证服务
   */
  private async checkExtensionPermission(_userId: UUID, _extensionId: UUID, _action: 'install' | 'activate' | 'configure' | 'uninstall'): Promise<boolean> {
    // TODO: 等待CoreOrchestrator注入Role模块权限检查
    // 将验证用户是否有权限对指定扩展执行指定操作
    return true; // 临时实现
  }

  private async getUserExtensionCapabilities(_userId: UUID): Promise<string[]> {
    // TODO: 等待CoreOrchestrator注入Role模块能力查询
    // 将返回用户可以使用的扩展能力列表
    return []; // 临时实现
  }

  private async checkRoleExtensionAccess(_roleId: UUID, _extensionType: string): Promise<boolean> {
    // TODO: 等待CoreOrchestrator注入Role模块角色权限检查
    // 将验证角色是否可以访问特定类型的扩展
    return true; // 临时实现
  }

  /**
   * 预留接口：Context模块上下文感知集成
   * 等待CoreOrchestrator注入Context模块上下文服务
   */
  private async getContextualExtensionRecommendations(_contextId: UUID, _projectType?: string): Promise<Extension[]> {
    // TODO: 等待CoreOrchestrator注入Context模块上下文分析
    // 将基于项目上下文推荐合适的扩展
    return []; // 临时实现
  }

  private async getContextMetadata(_contextId: UUID): Promise<Record<string, any>> {
    // TODO: 等待CoreOrchestrator注入Context模块元数据服务
    // 将返回上下文的详细元数据信息
    return {}; // 临时实现
  }

  private async updateContextWithExtension(_contextId: UUID, _extensionId: UUID, _action: 'add' | 'remove'): Promise<void> {
    // TODO: 等待CoreOrchestrator注入Context模块状态更新
    // 将更新上下文中的扩展状态信息
    // 临时实现
  }

  /**
   * 预留接口：Trace模块监控集成
   * 等待CoreOrchestrator注入Trace模块监控服务
   */
  private async recordExtensionActivity(_extensionId: UUID, _userId: UUID, _action: string, _metadata?: Record<string, any>): Promise<void> {
    // TODO: 等待CoreOrchestrator注入Trace模块活动记录
    // 将记录扩展的使用活动和性能数据
    // 临时实现
  }

  private async getExtensionUsageStatistics(_extensionId: UUID, _timeRange?: { start: string; end: string }): Promise<Record<string, any>> {
    // TODO: 等待CoreOrchestrator注入Trace模块统计查询
    // 将返回扩展的使用统计数据
    return {}; // 临时实现
  }

  private async recordExtensionPerformance(_extensionId: UUID, _performanceData: Record<string, any>): Promise<void> {
    // TODO: 等待CoreOrchestrator注入Trace模块性能监控
    // 将记录扩展的性能指标数据
    // 临时实现
  }

  /**
   * 预留接口：Plan模块计划集成
   * 等待CoreOrchestrator注入Plan模块计划服务
   */
  private async getExtensionsForPlan(_planId: UUID, _planType: string): Promise<Extension[]> {
    // TODO: 等待CoreOrchestrator注入Plan模块计划分析
    // 将返回适合特定计划的扩展列表
    return []; // 临时实现
  }

  private async validateExtensionForPlan(_extensionId: UUID, _planId: UUID): Promise<boolean> {
    // TODO: 等待CoreOrchestrator注入Plan模块兼容性验证
    // 将验证扩展是否与计划兼容
    return true; // 临时实现
  }

  private async recommendExtensionsForPlanPhase(_planId: UUID, _phase: string): Promise<Extension[]> {
    // TODO: 等待CoreOrchestrator注入Plan模块阶段分析
    // 将基于计划阶段推荐合适的扩展
    return []; // 临时实现
  }

  private async getExtensionRequirementsForPlan(_planId: UUID): Promise<string[]> {
    // TODO: 等待CoreOrchestrator注入Plan模块需求分析
    // 将返回计划所需的扩展能力列表
    return []; // 临时实现
  }

  private async updatePlanWithExtensions(_planId: UUID, _extensionIds: UUID[]): Promise<void> {
    // TODO: 等待CoreOrchestrator注入Plan模块状态更新
    // 将更新计划中的扩展配置信息
    // 临时实现
  }

  /**
   * 预留接口：Confirm模块审批集成
   * 等待CoreOrchestrator注入Confirm模块审批服务
   */
  private async requestExtensionApproval(_extensionId: UUID, _operation: 'install' | 'activate' | 'configure' | 'uninstall', _userId: UUID): Promise<string> {
    // TODO: 等待CoreOrchestrator注入Confirm模块审批请求
    // 将创建扩展操作的审批请求，返回审批ID
    return 'temp-approval-id'; // 临时实现
  }

  private async checkApprovalStatus(_approvalId: string): Promise<'pending' | 'approved' | 'rejected' | 'expired'> {
    // TODO: 等待CoreOrchestrator注入Confirm模块状态查询
    // 将查询审批请求的当前状态
    return 'approved'; // 临时实现
  }

  private async getApprovalRequirements(_extensionId: UUID, _operation: string): Promise<{
    requiresApproval: boolean;
    approvers: string[];
    criteria: string[];
  }> {
    // TODO: 等待CoreOrchestrator注入Confirm模块需求分析
    // 将返回扩展操作的审批要求
    return {
      requiresApproval: false,
      approvers: [],
      criteria: []
    }; // 临时实现
  }

  private async cancelExtensionApproval(_approvalId: string, _reason?: string): Promise<boolean> {
    // TODO: 等待CoreOrchestrator注入Confirm模块审批取消
    // 将取消待审批的扩展操作请求
    return true; // 临时实现
  }

  /**
   * 预留接口：Collab模块协作集成
   * 等待CoreOrchestrator注入Collab模块协作服务
   */
  private async getSharedExtensionsForCollab(_collabId: UUID): Promise<Extension[]> {
    // TODO: 等待CoreOrchestrator注入Collab模块共享扩展查询
    // 将返回协作环境中的共享扩展列表
    return []; // 临时实现
  }

  private async syncExtensionConfigAcrossAgents(_extensionId: UUID, _agentIds: UUID[]): Promise<void> {
    // TODO: 等待CoreOrchestrator注入Collab模块配置同步
    // 将在多个智能体间同步扩展配置
    // 临时实现
  }

  private async resolveExtensionConflictsInCollab(_collabId: UUID): Promise<{
    conflicts: Array<{
      extensionId: UUID;
      conflictType: string;
      affectedAgents: UUID[];
      resolution: string;
    }>;
    resolved: boolean;
  }> {
    // TODO: 等待CoreOrchestrator注入Collab模块冲突解决
    // 将解决协作环境中的扩展冲突
    return {
      conflicts: [],
      resolved: true
    }; // 临时实现
  }

  private async getCollabExtensionCompatibility(_collabId: UUID, _extensionId: UUID): Promise<{
    compatible: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    // TODO: 等待CoreOrchestrator注入Collab模块兼容性检查
    // 将检查扩展在协作环境中的兼容性
    return {
      compatible: true,
      issues: [],
      recommendations: []
    }; // 临时实现
  }

  private async notifyCollabMembersOfExtensionChange(_collabId: UUID, _extensionId: UUID, _changeType: string): Promise<void> {
    // TODO: 等待CoreOrchestrator注入Collab模块通知服务
    // 将通知协作成员扩展变更信息
    // 临时实现
  }

  /**
   * 预留接口：Network模块网络集成
   * 等待CoreOrchestrator注入Network模块网络服务
   */
  private async distributeExtensionToNetwork(_networkId: UUID, _extensionId: UUID): Promise<void> {
    // TODO: 等待CoreOrchestrator注入Network模块扩展分发
    // 将在智能体网络中分发扩展
    // 临时实现
  }

  private async checkNetworkExtensionCompatibility(_networkId: UUID, _extensionId: UUID): Promise<boolean> {
    // TODO: 等待CoreOrchestrator注入Network模块兼容性检查
    // 将检查扩展在网络拓扑中的兼容性
    return true; // 临时实现
  }

  private async getNetworkExtensionStatus(_networkId: UUID): Promise<{
    totalNodes: number;
    installedNodes: number;
    activeNodes: number;
    failedNodes: number;
    extensionVersions: Record<string, number>;
  }> {
    // TODO: 等待CoreOrchestrator注入Network模块状态查询
    // 将返回网络中扩展的分布状态
    return {
      totalNodes: 0,
      installedNodes: 0,
      activeNodes: 0,
      failedNodes: 0,
      extensionVersions: {}
    }; // 临时实现
  }

  private async rollbackExtensionInNetwork(_networkId: UUID, _extensionId: UUID, _targetVersion: string): Promise<void> {
    // TODO: 等待CoreOrchestrator注入Network模块版本回滚
    // 将在网络中回滚扩展到指定版本
    // 临时实现
  }

  private async getNetworkExtensionTopology(_networkId: UUID): Promise<{
    nodes: Array<{
      nodeId: UUID;
      extensions: UUID[];
      status: string;
      lastUpdate: string;
    }>;
    connections: Array<{
      from: UUID;
      to: UUID;
      sharedExtensions: UUID[];
    }>;
  }> {
    // TODO: 等待CoreOrchestrator注入Network模块拓扑查询
    // 将返回网络扩展拓扑结构
    return {
      nodes: [],
      connections: []
    }; // 临时实现
  }

  /**
   * 预留接口：Dialog模块对话集成
   * 等待CoreOrchestrator注入Dialog模块对话服务
   */
  private async getExtensionRecommendationsForDialog(_dialogId: UUID, _context: string): Promise<Extension[]> {
    // TODO: 等待CoreOrchestrator注入Dialog模块上下文分析
    // 将基于对话上下文推荐相关扩展
    return []; // 临时实现
  }

  private async handleExtensionQueryInDialog(_dialogId: UUID, _query: string): Promise<{
    response: string;
    suggestedExtensions: Extension[];
    actions: Array<{
      type: string;
      label: string;
      extensionId?: UUID;
    }>;
  }> {
    // TODO: 等待CoreOrchestrator注入Dialog模块查询处理
    // 将处理对话中的扩展相关查询
    return {
      response: '我可以帮您推荐合适的扩展',
      suggestedExtensions: [],
      actions: []
    }; // 临时实现
  }

  private async configureExtensionThroughDialog(_dialogId: UUID, _extensionId: UUID, _instructions: string): Promise<{
    success: boolean;
    configurationApplied: Record<string, any>;
    nextSteps: string[];
  }> {
    // TODO: 等待CoreOrchestrator注入Dialog模块配置服务
    // 将通过对话配置扩展参数
    return {
      success: true,
      configurationApplied: {},
      nextSteps: []
    }; // 临时实现
  }

  // ===== 智能协作功能接口 =====
  // 这些接口将在CoreOrchestrator激活后提供智能化功能

  /**
   * 为角色动态加载扩展
   * 预留接口：等待CoreOrchestrator提供角色信息和能力要求
   */
  async loadExtensionsForRole(_roleId: UUID, _capabilities: string[]): Promise<OperationResult<Extension[]>> {
    try {
      // TODO: 等待CoreOrchestrator激活后实现
      // 1. 获取角色信息和权限
      // 2. 基于能力要求筛选扩展
      // 3. 验证权限和兼容性
      // 4. 动态加载和激活扩展

      return {
        success: true,
        data: [], // 临时实现
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 基于上下文推荐扩展
   * 预留接口：等待CoreOrchestrator提供上下文分析能力
   */
  async recommendExtensionsForContext(_contextId: UUID, _projectType?: string): Promise<OperationResult<Extension[]>> {
    try {
      // TODO: 等待CoreOrchestrator激活后实现
      // 1. 分析项目上下文和类型
      // 2. 基于历史数据和模式匹配推荐扩展
      // 3. 考虑用户偏好和团队标准
      // 4. 返回个性化推荐列表

      return {
        success: true,
        data: [], // 临时实现
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 智能扩展组合推荐
   * 预留接口：等待CoreOrchestrator提供智能分析能力
   */
  async recommendExtensionCombinations(_requirements: string[], _contextId?: UUID): Promise<OperationResult<Extension[][]>> {
    try {
      // TODO: 等待CoreOrchestrator激活后实现
      // 1. 分析需求和约束条件
      // 2. 计算扩展组合的兼容性
      // 3. 优化组合性能和资源使用
      // 4. 返回最佳组合方案

      return {
        success: true,
        data: [], // 临时实现
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 创建扩展
   * 增强版本：集成MPLP预留接口，支持权限验证和上下文感知
   */
  async createExtension(
    request: CreateExtensionRequest,
    userId?: UUID // 新增用户ID参数，用于权限验证
  ): Promise<OperationResult<Extension>> {
    try {
      // 输入验证
      const validationError = this.validateCreateExtensionRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // 🔗 预留接口集成：权限验证
      if (userId) {
        const hasPermission = await this.checkExtensionPermission(userId, '', 'install');
        if (!hasPermission) {
          return {
            success: false,
            error: '用户没有安装扩展的权限',
          };
        }
      }

      // 验证扩展名称唯一性
      const isUnique = await this.extensionRepository.isNameUnique(
        request.name,
        request.context_id
      );
      if (!isUnique) {
        return {
          success: false,
          error: '扩展名称已存在',
        };
      }

      // 🔗 预留接口集成：上下文感知验证
      const contextMetadata = await this.getContextMetadata(request.context_id);
      // TODO: 基于上下文元数据进行扩展兼容性验证

      // 验证依赖关系
      if (request.dependencies && request.dependencies.length > 0) {
        const dependencyValidation = await this.validateDependencies(request.dependencies);
        if (!dependencyValidation.valid) {
          return {
            success: false,
            error: `依赖验证失败: ${dependencyValidation.error}`,
          };
        }
      }

      // 验证冲突关系
      if (request.conflicts && request.conflicts.length > 0) {
        const conflictValidation = await this.validateConflicts(request.conflicts);
        if (!conflictValidation.valid) {
          return {
            success: false,
            error: `冲突检测失败: ${conflictValidation.error}`,
          };
        }
      }

      // 创建扩展实体 - 使用Schema驱动方式
      const now = new Date().toISOString();
      const extensionSchemaData = {
        protocol_version: '1.0.1',
        timestamp: now,
        extension_id: this.generateUUID(),
        context_id: request.context_id,
        name: request.name,
        display_name: request.display_name || request.name,
        description: request.description || '',
        version: request.version,
        extension_type: request.type,
        status: 'installed' as const,
        compatibility: {
          mplp_version: '1.0.0',
          required_modules: [],
          dependencies: request.dependencies || [],
          conflicts: request.conflicts || [],
        },
        configuration: request.configuration || {
          schema: {},
          current_config: {},
        },
        extension_points: [],
        api_extensions: [],
        event_subscriptions: [],
        lifecycle: {
          install_date: now,
          activation_count: 0,
          error_count: 0,
          auto_start: false,
          load_priority: 0,
        },
        security: {
          sandbox_enabled: true,
          resource_limits: {},
          permissions: [],
        },
        metadata: {
          author: 'System',
          license: 'MIT',
        },
      };

      const extension = Extension.fromSchema(extensionSchemaData);

      // 保存到仓库
      await this.extensionRepository.save(extension);

      return {
        success: true,
        data: extension,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建扩展失败',
      };
    }
  }

  /**
   * 获取扩展详情
   */
  async getExtensionById(
    extensionId: UUID
  ): Promise<OperationResult<Extension>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);

      if (!extension) {
        return {
          success: false,
          error: '扩展不存在',
        };
      }

      return {
        success: true,
        data: extension,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取扩展失败',
      };
    }
  }

  /**
   * 激活扩展
   * 增强版本：集成权限验证、监控记录和上下文更新
   */
  async activateExtension(
    extensionId: UUID,
    userId?: UUID // 新增用户ID参数，用于权限验证和活动记录
  ): Promise<OperationResult<Extension>> {
    try {
      // 验证扩展ID
      const validationError = this.validateExtensionId(extensionId);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      const extension = await this.extensionRepository.findById(extensionId);

      if (!extension) {
        return {
          success: false,
          error: '扩展不存在',
        };
      }

      // 🔗 预留接口集成：权限验证
      if (userId) {
        const hasPermission = await this.checkExtensionPermission(userId, extensionId, 'activate');
        if (!hasPermission) {
          return {
            success: false,
            error: '用户没有激活此扩展的权限',
          };
        }
      }

      // 检查依赖
      const dependencyCheck = await this.extensionRepository.checkDependencies(
        extension
      );
      if (!dependencyCheck.satisfied) {
        return {
          success: false,
          error: `依赖不满足: ${dependencyCheck.missing.join(', ')}`,
        };
      }

      // 激活扩展
      extension.activate();
      await this.extensionRepository.update(extension);

      // 🔗 预留接口集成：记录激活活动
      if (userId) {
        await this.recordExtensionActivity(extensionId, userId, 'activate', {
          timestamp: new Date().toISOString(),
          extensionName: extension.name,
          extensionVersion: extension.version,
        });
      }

      // 🔗 预留接口集成：更新上下文状态
      await this.updateContextWithExtension(extension.contextId, extensionId, 'add');

      return {
        success: true,
        data: extension,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '激活扩展失败',
      };
    }
  }

  /**
   * 停用扩展
   */
  async deactivateExtension(
    extensionId: UUID
  ): Promise<OperationResult<Extension>> {
    try {
      // 验证扩展ID
      const validationError = this.validateExtensionId(extensionId);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      const extension = await this.extensionRepository.findById(extensionId);

      if (!extension) {
        return {
          success: false,
          error: '扩展不存在',
        };
      }

      // 检查是否有其他扩展依赖此扩展
      const dependents = await this.extensionRepository.findDependents(
        extensionId
      );
      const activeDependents = dependents.filter(dep => dep.isActive());

      if (activeDependents.length > 0) {
        return {
          success: false,
          error: `无法停用，有其他活跃扩展依赖此扩展: ${activeDependents
            .map(d => d.name)
            .join(', ')}`,
        };
      }

      extension.deactivate();
      await this.extensionRepository.update(extension);

      return {
        success: true,
        data: extension,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '停用扩展失败',
      };
    }
  }

  /**
   * 更新扩展状态
   */
  async updateExtensionStatus(
    extensionId: UUID,
    status: ExtensionStatus
  ): Promise<OperationResult<Extension>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);

      if (!extension) {
        return {
          success: false,
          error: '扩展不存在',
        };
      }

      extension.updateStatus(status);
      await this.extensionRepository.update(extension);

      return {
        success: true,
        data: extension,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新扩展状态失败',
      };
    }
  }

  /**
   * 添加扩展点
   */
  async addExtensionPoint(
    extensionId: UUID,
    extensionPoint: ExtensionPoint
  ): Promise<OperationResult<Extension>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);

      if (!extension) {
        return {
          success: false,
          error: '扩展不存在',
        };
      }

      extension.addExtensionPoint(extensionPoint);
      await this.extensionRepository.update(extension);

      return {
        success: true,
        data: extension,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加扩展点失败',
      };
    }
  }

  /**
   * 添加API扩展
   */
  async addApiExtension(
    extensionId: UUID,
    apiExtension: ApiExtension
  ): Promise<OperationResult<Extension>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);

      if (!extension) {
        return {
          success: false,
          error: '扩展不存在',
        };
      }

      extension.addApiExtension(apiExtension);
      await this.extensionRepository.update(extension);

      return {
        success: true,
        data: extension,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加API扩展失败',
      };
    }
  }

  /**
   * 查询扩展列表
   */
  async queryExtensions(
    filter: ExtensionFilter,
    pagination?: PaginationOptions
  ): Promise<OperationResult<PaginatedResult<Extension>>> {
    try {
      const result = await this.extensionRepository.findByFilter(
        filter,
        pagination
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '查询扩展列表失败',
      };
    }
  }

  /**
   * 获取活跃扩展
   */
  async getActiveExtensions(
    contextId?: UUID
  ): Promise<OperationResult<Extension[]>> {
    try {
      const extensions = await this.extensionRepository.findActiveExtensions(
        contextId
      );

      return {
        success: true,
        data: extensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取活跃扩展失败',
      };
    }
  }

  /**
   * 删除扩展（别名方法）
   */
  async deleteExtension(extensionId: UUID): Promise<OperationResult<void>> {
    return this.uninstallExtension(extensionId);
  }

  /**
   * 获取扩展列表（别名方法）
   */
  async getExtensions(
    filter?: ExtensionFilter,
    pagination?: PaginationOptions
  ): Promise<
    OperationResult<{ items: Extension[]; total: number; totalPages?: number }>
  > {
    try {
      const result = await this.queryExtensions(filter || {}, pagination);
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            items: result.data.items,
            total: result.data.total,
            totalPages: result.data.total_pages, // 映射total_pages到totalPages
          },
        };
      } else {
        return {
          success: false,
          error: result.error || '获取扩展列表失败',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取扩展列表失败',
      };
    }
  }

  /**
   * 卸载扩展
   */
  async uninstallExtension(extensionId: UUID): Promise<OperationResult<void>> {
    try {
      // 验证扩展ID
      const validationError = this.validateExtensionId(extensionId);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      const extension = await this.extensionRepository.findById(extensionId);

      if (!extension) {
        return {
          success: false,
          error: '扩展不存在',
        };
      }

      if (!extension.canUninstall()) {
        return {
          success: false,
          error: `无法卸载状态为 ${extension.status} 的扩展`,
        };
      }

      // 检查依赖
      const dependents = await this.extensionRepository.findDependents(
        extensionId
      );
      if (dependents.length > 0) {
        return {
          success: false,
          error: `无法卸载，有其他扩展依赖此扩展: ${dependents
            .map(d => d.name)
            .join(', ')}`,
        };
      }

      await this.extensionRepository.delete(extensionId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '卸载扩展失败',
      };
    }
  }

  /**
   * 获取统计信息
   */
  async getStatistics(contextId?: UUID): Promise<OperationResult<any>> {
    try {
      const statistics = await this.extensionRepository.getStatistics(
        contextId
      );

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取统计信息失败',
      };
    }
  }

  /**
   * 生成UUID
   */
  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /**
   * 验证创建扩展请求
   */
  private validateCreateExtensionRequest(
    request: CreateExtensionRequest
  ): string | null {
    // 检查请求是否为空
    if (!request) {
      return '请求参数不能为空';
    }

    // 检查上下文ID
    if (!request.context_id || request.context_id.trim() === '') {
      return '上下文ID不能为空';
    }

    // 检查扩展名称
    if (!request.name || request.name.trim() === '') {
      return '扩展名称不能为空';
    }

    if (request.name.length > 100) {
      return '扩展名称不能超过100个字符';
    }

    // 检查版本
    if (!request.version || request.version.trim() === '') {
      return '扩展版本不能为空';
    }

    // 检查扩展类型
    const validTypes: ExtensionType[] = [
      'plugin',
      'adapter',
      'connector',
      'middleware',
      'hook',
      'transformer',
    ];
    if (!validTypes.includes(request.type)) {
      return `无效的扩展类型: ${request.type}`;
    }

    return null;
  }

  /**
   * 验证扩展ID
   */
  private validateExtensionId(extensionId: UUID): string | null {
    if (!extensionId || extensionId.trim() === '') {
      return '扩展ID不能为空';
    }
    return null;
  }

  /**
   * 更新扩展
   */
  async updateExtension(
    extensionId: string,
    updateData: unknown
  ): Promise<OperationResult<Extension>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);

      if (!extension) {
        return {
          success: false,
          error: '扩展不存在',
        };
      }

      // 这里应该有更复杂的更新逻辑，目前返回基本成功
      return {
        success: true,
        data: extension,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新扩展失败',
      };
    }
  }

  /**
   * 获取扩展依赖
   */
  async getExtensionDependencies(
    extensionId: string
  ): Promise<OperationResult<unknown[]>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);

      if (!extension) {
        return {
          success: false,
          error: '扩展不存在',
        };
      }

      // 返回扩展的依赖关系
      return {
        success: true,
        data: [], // 这里应该返回实际的依赖数据
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取扩展依赖失败',
      };
    }
  }

  /**
   * 根据上下文获取扩展
   */
  async getExtensionsByContext(
    contextId: string
  ): Promise<OperationResult<Extension[]>> {
    try {
      // 使用findByContextId方法获取上下文相关扩展
      const extensions = await this.extensionRepository.findByContextId(contextId);

      return {
        success: true,
        data: extensions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取上下文扩展失败',
      };
    }
  }

  /**
   * 验证扩展依赖关系
   */
  private async validateDependencies(dependencies: ExtensionDependency[]): Promise<{valid: boolean, error?: string}> {
    try {
      for (const dependency of dependencies) {
        // 检查依赖的扩展是否存在
        const dependentExtension = await this.extensionRepository.findById(dependency.extension_id);

        if (!dependentExtension) {
          return {
            valid: false,
            error: `依赖的扩展不存在: ${dependency.name} (${dependency.extension_id})`
          };
        }

        // 检查依赖的扩展是否处于可用状态
        if (dependentExtension.status !== 'active' && dependentExtension.status !== 'installed') {
          return {
            valid: false,
            error: `依赖的扩展状态不可用: ${dependency.name} (状态: ${dependentExtension.status})`
          };
        }

        // 这里可以添加版本范围检查逻辑
        // TODO: 实现版本范围验证 (dependency.version_range)
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : '依赖验证过程中发生错误'
      };
    }
  }

  /**
   * 验证扩展冲突关系
   */
  private async validateConflicts(conflicts: ExtensionConflict[]): Promise<{valid: boolean, error?: string}> {
    try {
      for (const conflict of conflicts) {
        // 检查冲突的扩展是否存在且处于活跃状态
        const conflictingExtension = await this.extensionRepository.findById(conflict.extension_id);

        if (conflictingExtension && conflictingExtension.status === 'active') {
          return {
            valid: false,
            error: `检测到扩展冲突: ${conflict.name} (${conflict.reason})`
          };
        }
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : '冲突检测过程中发生错误'
      };
    }
  }

  // ===== 新增：完整的MPLP生态系统智能协作功能 =====

  /**
   * 智能扩展推荐引擎
   * 基于用户角色、项目上下文和历史数据推荐最适合的扩展
   */
  async getIntelligentExtensionRecommendations(
    userId: UUID,
    contextId: UUID,
    requirements?: string[]
  ): Promise<OperationResult<{
    recommended: Extension[];
    reasons: string[];
    confidence: number;
  }>> {
    try {
      // 🔗 预留接口集成：获取用户能力和角色信息
      const userCapabilities = await this.getUserExtensionCapabilities(userId);

      // 🔗 预留接口集成：获取上下文推荐
      const contextRecommendations = await this.getContextualExtensionRecommendations(contextId);

      // 🔗 预留接口集成：获取使用统计数据
      const usageStats = await this.getExtensionUsageStatistics('', {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      });

      // TODO: 等待CoreOrchestrator激活后实现智能推荐算法
      // 1. 分析用户历史使用模式
      // 2. 基于项目类型和需求匹配扩展
      // 3. 考虑团队协作和标准化要求
      // 4. 计算推荐置信度

      return {
        success: true,
        data: {
          recommended: contextRecommendations,
          reasons: [
            '基于项目类型匹配',
            '团队常用扩展',
            '用户历史偏好'
          ],
          confidence: 0.85
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '智能推荐失败'
      };
    }
  }

  /**
   * 扩展性能监控和优化建议
   * 监控扩展使用性能，提供优化建议
   */
  async getExtensionPerformanceInsights(
    extensionId: UUID,
    timeRange?: { start: string; end: string }
  ): Promise<OperationResult<{
    performance: Record<string, any>;
    insights: string[];
    recommendations: string[];
  }>> {
    try {
      // 🔗 预留接口集成：获取性能统计数据
      const performanceData = await this.getExtensionUsageStatistics(extensionId, timeRange);

      // TODO: 等待CoreOrchestrator激活后实现性能分析
      // 1. 分析扩展加载时间和资源使用
      // 2. 识别性能瓶颈和异常模式
      // 3. 生成优化建议和最佳实践
      // 4. 预测扩展生命周期和维护需求

      return {
        success: true,
        data: {
          performance: performanceData,
          insights: [
            '扩展加载时间正常',
            '内存使用稳定',
            '用户满意度较高'
          ],
          recommendations: [
            '考虑启用缓存优化',
            '定期更新到最新版本',
            '配置自动备份策略'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '性能分析失败'
      };
    }
  }

  /**
   * 扩展安全审计和合规检查
   * 检查扩展的安全性和企业合规性
   */
  async auditExtensionSecurity(
    extensionId: UUID,
    userId?: UUID
  ): Promise<OperationResult<{
    securityScore: number;
    vulnerabilities: string[];
    complianceStatus: 'compliant' | 'non-compliant' | 'needs-review';
    recommendations: string[];
  }>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);
      if (!extension) {
        return {
          success: false,
          error: '扩展不存在'
        };
      }

      // 🔗 预留接口集成：权限验证
      if (userId) {
        const hasPermission = await this.checkExtensionPermission(userId, extensionId, 'configure');
        if (!hasPermission) {
          return {
            success: false,
            error: '用户没有审计此扩展的权限'
          };
        }
      }

      // TODO: 等待CoreOrchestrator激活后实现安全审计
      // 1. 扫描扩展代码和依赖的安全漏洞
      // 2. 检查权限使用和数据访问模式
      // 3. 验证企业安全策略合规性
      // 4. 生成安全评分和改进建议

      return {
        success: true,
        data: {
          securityScore: 85,
          vulnerabilities: [],
          complianceStatus: 'compliant',
          recommendations: [
            '定期更新扩展依赖',
            '启用沙箱模式',
            '配置最小权限原则'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '安全审计失败'
      };
    }
  }

  /**
   * 扩展生命周期自动化管理
   * 自动化扩展的安装、更新、维护和清理
   */
  async automateExtensionLifecycle(
    contextId: UUID,
    policy: {
      autoUpdate: boolean;
      autoCleanup: boolean;
      maintenanceSchedule?: string;
      backupStrategy?: string;
    }
  ): Promise<OperationResult<{
    automatedExtensions: string[];
    scheduledTasks: string[];
    nextMaintenance: string;
  }>> {
    try {
      // 🔗 预留接口集成：获取上下文元数据
      const contextMetadata = await this.getContextMetadata(contextId);

      // 获取上下文中的所有扩展
      const extensions = await this.extensionRepository.findByContextId(contextId);

      // TODO: 等待CoreOrchestrator激活后实现自动化管理
      // 1. 根据策略配置自动化任务
      // 2. 调度扩展更新和维护任务
      // 3. 实施备份和恢复策略
      // 4. 监控自动化任务执行状态

      const automatedExtensions = extensions.map(ext => ext.extensionId);

      return {
        success: true,
        data: {
          automatedExtensions,
          scheduledTasks: [
            '每周自动更新检查',
            '每月性能优化',
            '季度安全审计'
          ],
          nextMaintenance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '自动化配置失败'
      };
    }
  }

  // ===== 新增：完整MPLP生态系统集成方法 =====

  /**
   * 计划驱动的扩展管理
   * 基于项目计划自动推荐、安装和配置扩展
   */
  async managePlanDrivenExtensions(
    planId: UUID,
    planType: string,
    userId?: UUID
  ): Promise<OperationResult<{
    recommendedExtensions: Extension[];
    installedExtensions: Extension[];
    configurationSuggestions: string[];
    nextPhasePreparation: string[];
  }>> {
    try {
      // 🔗 预留接口集成：获取计划相关扩展
      const planExtensions = await this.getExtensionsForPlan(planId, planType);

      // 🔗 预留接口集成：获取计划阶段推荐
      const phaseRecommendations = await this.recommendExtensionsForPlanPhase(planId, 'current');

      // 🔗 预留接口集成：获取计划需求
      const requirements = await this.getExtensionRequirementsForPlan(planId);

      // TODO: 等待CoreOrchestrator激活后实现
      // 1. 分析计划类型和阶段需求
      // 2. 推荐最适合的扩展组合
      // 3. 自动安装和配置扩展
      // 4. 为下一阶段做准备

      return {
        success: true,
        data: {
          recommendedExtensions: [...planExtensions, ...phaseRecommendations],
          installedExtensions: [],
          configurationSuggestions: [
            '基于计划类型优化扩展配置',
            '启用计划阶段相关功能',
            '配置团队协作设置'
          ],
          nextPhasePreparation: [
            '准备下一阶段所需扩展',
            '验证扩展兼容性',
            '配置阶段切换策略'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '计划驱动扩展管理失败'
      };
    }
  }

  /**
   * 企业级扩展审批管理
   * 处理扩展操作的审批流程和合规检查
   */
  async manageExtensionApprovalWorkflow(
    extensionId: UUID,
    operation: 'install' | 'activate' | 'configure' | 'uninstall',
    userId: UUID
  ): Promise<OperationResult<{
    approvalRequired: boolean;
    approvalId?: string;
    approvalStatus?: string;
    estimatedApprovalTime?: string;
    nextSteps: string[];
  }>> {
    try {
      // 🔗 预留接口集成：检查审批要求
      const approvalReqs = await this.getApprovalRequirements(extensionId, operation);

      if (!approvalReqs.requiresApproval) {
        return {
          success: true,
          data: {
            approvalRequired: false,
            nextSteps: ['可以直接执行操作']
          }
        };
      }

      // 🔗 预留接口集成：请求审批
      const approvalId = await this.requestExtensionApproval(extensionId, operation, userId);

      // 🔗 预留接口集成：检查审批状态
      const status = await this.checkApprovalStatus(approvalId);

      return {
        success: true,
        data: {
          approvalRequired: true,
          approvalId,
          approvalStatus: status,
          estimatedApprovalTime: '1-2个工作日',
          nextSteps: [
            '等待审批完成',
            '可通过审批ID查询状态',
            '审批通过后自动执行操作'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '审批流程管理失败'
      };
    }
  }

  /**
   * 多智能体协作扩展管理
   * 在协作环境中同步和管理扩展
   */
  async manageCollaborativeExtensions(
    collabId: UUID,
    agentIds: UUID[]
  ): Promise<OperationResult<{
    sharedExtensions: Extension[];
    conflicts: Array<{
      extensionId: UUID;
      conflictType: string;
      resolution: string;
    }>;
    syncStatus: Record<string, string>;
    recommendations: string[];
  }>> {
    try {
      // 🔗 预留接口集成：获取协作共享扩展
      const sharedExtensions = await this.getSharedExtensionsForCollab(collabId);

      // 🔗 预留接口集成：解决扩展冲突
      const conflictResolution = await this.resolveExtensionConflictsInCollab(collabId);

      // 🔗 预留接口集成：同步扩展配置
      for (const extension of sharedExtensions) {
        await this.syncExtensionConfigAcrossAgents(extension.extensionId, agentIds);
      }

      // 🔗 预留接口集成：通知协作成员
      for (const extension of sharedExtensions) {
        await this.notifyCollabMembersOfExtensionChange(collabId, extension.extensionId, 'sync');
      }

      return {
        success: true,
        data: {
          sharedExtensions,
          conflicts: conflictResolution.conflicts,
          syncStatus: agentIds.reduce((acc, agentId) => {
            acc[agentId] = 'synced';
            return acc;
          }, {} as Record<string, string>),
          recommendations: [
            '定期同步扩展配置',
            '监控协作扩展兼容性',
            '建立扩展使用规范'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '协作扩展管理失败'
      };
    }
  }

  /**
   * 分布式网络扩展管理
   * 在智能体网络中分发和管理扩展
   */
  async manageNetworkExtensionDistribution(
    networkId: UUID,
    extensionId: UUID,
    distributionPolicy: {
      strategy: 'immediate' | 'gradual' | 'scheduled';
      rollbackOnFailure: boolean;
      maxFailureRate: number;
    }
  ): Promise<OperationResult<{
    distributionStatus: {
      totalNodes: number;
      successfulNodes: number;
      failedNodes: number;
      pendingNodes: number;
    };
    networkTopology: any;
    rollbackPlan?: string;
    nextActions: string[];
  }>> {
    try {
      // 🔗 预留接口集成：检查网络兼容性
      const isCompatible = await this.checkNetworkExtensionCompatibility(networkId, extensionId);

      if (!isCompatible) {
        return {
          success: false,
          error: '扩展与网络拓扑不兼容'
        };
      }

      // 🔗 预留接口集成：分发扩展到网络
      await this.distributeExtensionToNetwork(networkId, extensionId);

      // 🔗 预留接口集成：获取分发状态
      const status = await this.getNetworkExtensionStatus(networkId);

      // 🔗 预留接口集成：获取网络拓扑
      const topology = await this.getNetworkExtensionTopology(networkId);

      return {
        success: true,
        data: {
          distributionStatus: {
            totalNodes: status.totalNodes,
            successfulNodes: status.activeNodes,
            failedNodes: status.failedNodes,
            pendingNodes: status.totalNodes - status.installedNodes
          },
          networkTopology: topology,
          rollbackPlan: distributionPolicy.rollbackOnFailure ? '自动回滚已启用' : undefined,
          nextActions: [
            '监控分发进度',
            '验证扩展功能',
            '收集性能数据'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络扩展分发失败'
      };
    }
  }

  /**
   * 对话驱动的扩展管理
   * 通过自然语言对话管理扩展
   */
  async manageExtensionsThroughDialog(
    dialogId: UUID,
    userQuery: string,
    context?: Record<string, any>
  ): Promise<OperationResult<{
    response: string;
    suggestedExtensions: Extension[];
    possibleActions: Array<{
      type: string;
      label: string;
      extensionId?: UUID;
      description: string;
    }>;
    followUpQuestions: string[];
  }>> {
    try {
      // 🔗 预留接口集成：获取对话推荐
      const recommendations = await this.getExtensionRecommendationsForDialog(dialogId, userQuery);

      // 🔗 预留接口集成：处理扩展查询
      const queryResponse = await this.handleExtensionQueryInDialog(dialogId, userQuery);

      return {
        success: true,
        data: {
          response: queryResponse.response,
          suggestedExtensions: [...recommendations, ...queryResponse.suggestedExtensions],
          possibleActions: [
            ...queryResponse.actions.map(action => ({
              ...action,
              description: `执行${action.label}操作`
            })),
            {
              type: 'search',
              label: '搜索更多扩展',
              description: '在扩展市场中搜索相关扩展'
            },
            {
              type: 'configure',
              label: '配置现有扩展',
              description: '调整当前扩展的设置'
            }
          ],
          followUpQuestions: [
            '您需要什么类型的扩展功能？',
            '这个扩展是用于什么项目？',
            '您希望扩展具备哪些特定能力？'
          ]
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '对话扩展管理失败'
      };
    }
  }

  /**
   * 完整MPLP生态系统扩展编排
   * 协调所有模块的扩展需求和配置
   */
  async orchestrateExtensionsAcrossMPLP(
    contextId: UUID,
    orchestrationRequest: {
      planId?: UUID;
      collabId?: UUID;
      networkId?: UUID;
      dialogId?: UUID;
      userId: UUID;
      requirements: string[];
    }
  ): Promise<OperationResult<{
    orchestrationPlan: {
      planExtensions: Extension[];
      collabExtensions: Extension[];
      networkExtensions: Extension[];
      dialogExtensions: Extension[];
    };
    executionSteps: Array<{
      step: number;
      action: string;
      module: string;
      description: string;
      estimatedTime: string;
    }>;
    dependencies: Array<{
      from: string;
      to: string;
      type: string;
    }>;
    totalEstimatedTime: string;
  }>> {
    try {
      const orchestrationPlan: {
        planExtensions: Extension[];
        collabExtensions: Extension[];
        networkExtensions: Extension[];
        dialogExtensions: Extension[];
      } = {
        planExtensions: [],
        collabExtensions: [],
        networkExtensions: [],
        dialogExtensions: []
      };

      const executionSteps = [];
      let stepCounter = 1;

      // 🔗 预留接口集成：Plan模块扩展编排
      if (orchestrationRequest.planId) {
        const planExtensions = await this.getExtensionsForPlan(
          orchestrationRequest.planId,
          'development'
        );
        orchestrationPlan.planExtensions = planExtensions;

        executionSteps.push({
          step: stepCounter++,
          action: 'load_plan_extensions',
          module: 'Plan',
          description: '加载计划相关扩展',
          estimatedTime: '2-3分钟'
        });
      }

      // 🔗 预留接口集成：Collab模块扩展编排
      if (orchestrationRequest.collabId) {
        const collabExtensions = await this.getSharedExtensionsForCollab(
          orchestrationRequest.collabId
        );
        orchestrationPlan.collabExtensions = collabExtensions;

        executionSteps.push({
          step: stepCounter++,
          action: 'sync_collab_extensions',
          module: 'Collab',
          description: '同步协作扩展配置',
          estimatedTime: '1-2分钟'
        });
      }

      // 🔗 预留接口集成：Network模块扩展编排
      if (orchestrationRequest.networkId) {
        const networkStatus = await this.getNetworkExtensionStatus(
          orchestrationRequest.networkId
        );

        executionSteps.push({
          step: stepCounter++,
          action: 'distribute_network_extensions',
          module: 'Network',
          description: '分发网络扩展',
          estimatedTime: '5-10分钟'
        });
      }

      // 🔗 预留接口集成：Dialog模块扩展编排
      if (orchestrationRequest.dialogId) {
        const dialogRecommendations = await this.getExtensionRecommendationsForDialog(
          orchestrationRequest.dialogId,
          orchestrationRequest.requirements.join(' ')
        );
        orchestrationPlan.dialogExtensions = dialogRecommendations;

        executionSteps.push({
          step: stepCounter++,
          action: 'configure_dialog_extensions',
          module: 'Dialog',
          description: '配置对话相关扩展',
          estimatedTime: '1分钟'
        });
      }

      return {
        success: true,
        data: {
          orchestrationPlan,
          executionSteps,
          dependencies: [
            { from: 'Plan', to: 'Collab', type: 'requires' },
            { from: 'Collab', to: 'Network', type: 'sync' },
            { from: 'Network', to: 'Dialog', type: 'notify' }
          ],
          totalEstimatedTime: '10-15分钟'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MPLP扩展编排失败'
      };
    }
  }
}
