/**
 * Extension模块适配器
 * 
 * @description Extension模块的基础设施适配器，提供模块间通信和协调功能
 * @version 1.0.0
 * @layer Infrastructure层 - 适配器
 * @pattern 适配器模式 + 依赖注入 + 协议适配
 */

import { UUID } from '../../../../shared/types';
import { ExtensionEntityData, ExtensionType, ExtensionStatus } from '../../types';
import { ExtensionManagementService } from '../../application/services/extension-management.service';

/**
 * Extension模块适配器接口
 */
export interface IExtensionModuleAdapter {
  // 扩展生命周期管理
  createExtension(request: CreateExtensionRequest): Promise<ExtensionEntityData>;
  getExtension(extensionId: UUID): Promise<ExtensionEntityData | null>;
  updateExtension(extensionId: UUID, updates: Partial<ExtensionEntityData>): Promise<ExtensionEntityData | null>;
  deleteExtension(extensionId: UUID): Promise<boolean>;
  
  // 扩展状态管理
  activateExtension(extensionId: UUID): Promise<boolean>;
  deactivateExtension(extensionId: UUID): Promise<boolean>;
  
  // 扩展查询和列表
  listExtensions(options: ExtensionQueryOptions): Promise<ExtensionListResult>;
  queryExtensions(criteria: ExtensionQueryCriteria): Promise<ExtensionEntityData[]>;
  
  // 扩展协调功能
  getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
  getExtensionsByType(extensionType: ExtensionType): Promise<ExtensionEntityData[]>;
  
  // 健康检查和监控
  getHealthStatus(): Promise<ExtensionHealthStatus>;
  getPerformanceMetrics(): Promise<ExtensionPerformanceMetrics>;
}

// 导入服务层的接口定义
import {
  CreateExtensionRequest as ServiceCreateExtensionRequest,
  UpdateExtensionRequest as ServiceUpdateExtensionRequest,
  ExtensionActivationRequest as ServiceExtensionActivationRequest
} from '../../application/services/extension-management.service';
import {
  ExtensionConfiguration,
  ExtensionCompatibility,
  ExtensionSecurity,
  ExtensionMetadata
} from '../../types';

/**
 * 创建扩展请求接口 (适配器层)
 */
export interface CreateExtensionRequest {
  contextId: UUID;
  name: string;
  displayName: string;
  description: string;
  version: string;
  extensionType: ExtensionType;
  configuration?: ExtensionConfiguration;
  security?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  compatibility?: ExtensionCompatibility;
}

/**
 * 更新扩展请求接口 (适配器层)
 */
export interface UpdateExtensionRequest {
  extensionId: UUID;
  name?: string;
  displayName?: string;
  description?: string;
  version?: string;
  extensionType?: ExtensionType;
  status?: ExtensionStatus;
  configuration?: Record<string, unknown>;
  security?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * 扩展激活请求接口 (适配器层)
 */
export interface ExtensionActivationRequest {
  extensionId: UUID;
  contextId?: UUID;
  activationOptions?: Record<string, unknown>;
}

/**
 * 扩展查询选项接口
 */
export interface ExtensionQueryOptions {
  contextId?: UUID;
  extensionType?: ExtensionType;
  status?: ExtensionStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 扩展查询条件接口
 */
export interface ExtensionQueryCriteria {
  name?: string;
  displayName?: string;
  extensionType?: ExtensionType;
  status?: ExtensionStatus;
  tags?: string[];
  category?: string;
}

/**
 * 扩展列表结果接口
 */
export interface ExtensionListResult {
  extensions: ExtensionEntityData[];
  totalCount: number;
  hasMore: boolean;
  nextPage?: number;
}

/**
 * 扩展健康状态接口
 */
export interface ExtensionHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration?: number;
  }>;
  metrics: {
    totalExtensions: number;
    activeExtensions: number;
    errorCount: number;
    averageResponseTime: number;
  };
}

/**
 * 扩展性能指标接口
 */
export interface ExtensionPerformanceMetrics {
  activationLatency: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  errorRate: number;
  throughput: number;
  responseTime: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
  alerts: Array<{
    type: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
  }>;
}

/**
 * Extension模块适配器实现
 */
export class ExtensionModuleAdapter implements IExtensionModuleAdapter {
  constructor(
    private readonly extensionManagementService: ExtensionManagementService
  ) {}

  /**
   * 创建扩展
   */
  async createExtension(request: CreateExtensionRequest): Promise<ExtensionEntityData> {
    // 转换适配器层请求到服务层请求
    const serviceRequest: ServiceCreateExtensionRequest = {
      contextId: request.contextId,
      name: request.name,
      displayName: request.displayName,
      description: request.description,
      version: request.version,
      extensionType: request.extensionType,
      compatibility: request.compatibility || {
        mplpVersion: '1.0.0',
        requiredModules: [],
        dependencies: [],
        conflicts: []
      },
      configuration: request.configuration || {
        schema: {},
        currentConfig: {},
        defaultConfig: {},
        validationRules: []
      },
      security: (request.security as unknown as ExtensionSecurity) || {
        sandboxEnabled: true,
        resourceLimits: {
          maxMemory: 512,
          maxCpu: 50,
          maxFileSize: 100,
          maxNetworkConnections: 10,
          allowedDomains: [],
          blockedDomains: [],
          allowedHosts: [],
          allowedPorts: [],
          protocols: ['https']
        },
        codeSigning: {
          required: false,
          trustedSigners: [],
          verificationEndpoint: undefined
        },
        permissions: {
          fileSystem: { read: [], write: [], execute: [] },
          network: { allowedHosts: [], allowedPorts: [], protocols: [] },
          database: { read: [], write: [], admin: [] },
          api: { endpoints: [], methods: [], rateLimit: 100 }
        }
      },
      metadata: (request.metadata as unknown as ExtensionMetadata) || {
        author: { name: 'Unknown' },
        license: { type: 'MIT' },
        keywords: [],
        category: 'general',
        screenshots: []
      }
    };

    return await this.extensionManagementService.createExtension(serviceRequest);
  }

  /**
   * 获取扩展
   */
  async getExtension(extensionId: UUID): Promise<ExtensionEntityData | null> {
    return await this.extensionManagementService.getExtensionById(extensionId);
  }

  /**
   * 更新扩展
   */
  async updateExtension(extensionId: UUID, updates: Partial<ExtensionEntityData>): Promise<ExtensionEntityData | null> {
    // 转换适配器层更新到服务层更新
    const serviceRequest: ServiceUpdateExtensionRequest = {
      extensionId,
      displayName: updates.displayName,
      description: updates.description,
      configuration: updates.configuration as unknown as Record<string, unknown>,
      metadata: updates.metadata as Partial<ExtensionEntityData['metadata']>
    };

    return await this.extensionManagementService.updateExtension(serviceRequest);
  }

  /**
   * 删除扩展
   */
  async deleteExtension(extensionId: UUID): Promise<boolean> {
    return await this.extensionManagementService.deleteExtension(extensionId);
  }

  /**
   * 激活扩展
   */
  async activateExtension(extensionId: UUID): Promise<boolean> {
    const activationRequest: ServiceExtensionActivationRequest = {
      extensionId,
      force: false
    };
    const result = await this.extensionManagementService.activateExtension(activationRequest);
    return result !== null;
  }

  /**
   * 停用扩展
   */
  async deactivateExtension(extensionId: UUID): Promise<boolean> {
    const result = await this.extensionManagementService.deactivateExtension(extensionId);
    return result !== null;
  }

  /**
   * 列出扩展
   */
  async listExtensions(options: ExtensionQueryOptions): Promise<ExtensionListResult> {
    // 使用分页参数调用服务
    const result = await this.extensionManagementService.queryExtensions(
      {
        extensionType: options.extensionType,
        status: options.status,
        contextId: options.contextId
      },
      {
        page: options.page,
        limit: options.limit || 10,
        offset: ((options.page || 1) - 1) * (options.limit || 10)
      }
    );

    return {
      extensions: result.extensions,
      totalCount: result.total,
      hasMore: result.hasMore || false,
      nextPage: result.hasMore ? (options.page || 1) + 1 : undefined
    };
  }

  /**
   * 查询扩展
   */
  async queryExtensions(criteria: ExtensionQueryCriteria): Promise<ExtensionEntityData[]> {
    const result = await this.extensionManagementService.queryExtensions({
      extensionType: criteria.extensionType,
      status: criteria.status,
      name: criteria.name,
      category: criteria.category
    });

    return result.extensions;
  }

  /**
   * 获取活跃扩展
   */
  async getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]> {
    return await this.extensionManagementService.getActiveExtensions(contextId);
  }

  /**
   * 根据类型获取扩展
   */
  async getExtensionsByType(extensionType: ExtensionType): Promise<ExtensionEntityData[]> {
    const result = await this.extensionManagementService.queryExtensions({
      extensionType
    });
    return result.extensions;
  }

  /**
   * 获取健康状态
   */
  async getHealthStatus(): Promise<ExtensionHealthStatus> {
    const healthStatus = await this.extensionManagementService.getHealthStatus();

    return {
      status: healthStatus.status as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: healthStatus.timestamp,
      checks: healthStatus.details?.repository ? [{
        name: 'repository',
        status: 'pass',
        message: `Repository status: ${healthStatus.details.repository.status}`,
        duration: 0
      }] : [],
      metrics: {
        totalExtensions: healthStatus.details?.repository?.extensionCount || 0,
        activeExtensions: healthStatus.details?.repository?.activeExtensions || 0,
        errorCount: 0,
        averageResponseTime: healthStatus.details?.performance?.averageResponseTime || 0
      }
    };
  }

  /**
   * 获取性能指标
   */
  async getPerformanceMetrics(): Promise<ExtensionPerformanceMetrics> {
    // TODO: 实现性能指标收集
    return {
      activationLatency: 100,
      memoryUsage: 50000000,
      cpuUsage: 25,
      networkRequests: 10,
      errorRate: 0,
      throughput: 1000,
      responseTime: 50,
      healthStatus: 'healthy',
      alerts: []
    };
  }
}
