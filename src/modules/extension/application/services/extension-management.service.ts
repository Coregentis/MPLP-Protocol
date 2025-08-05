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
import { IExtensionRepository, ExtensionFilter, PaginationOptions, PaginatedResult } from '../../domain/repositories/extension-repository.interface';
import { 
  ExtensionType, 
  ExtensionStatus,
  ExtensionConfiguration,
  ExtensionPoint,
  ApiExtension,
  EventSubscription
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
 */
export class ExtensionManagementService {
  constructor(
    private readonly extensionRepository: IExtensionRepository
  ) {}

  /**
   * 创建扩展
   */
  async createExtension(request: CreateExtensionRequest): Promise<OperationResult<Extension>> {
    try {
      // 输入验证
      const validationError = this.validateCreateExtensionRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      // 验证扩展名称唯一性
      const isUnique = await this.extensionRepository.isNameUnique(request.name, request.context_id);
      if (!isUnique) {
        return {
          success: false,
          error: '扩展名称已存在'
        };
      }

      // 创建扩展实体
      const now = new Date().toISOString();
      const extension = new Extension(
        this.generateUUID(),
        request.context_id,
        '1.0.0',
        request.name,
        request.version,
        request.type,
        'inactive',
        now,
        now,
        now,
        request.display_name,
        request.description,
        undefined,
        request.configuration
      );

      // 保存到仓库
      await this.extensionRepository.save(extension);

      return {
        success: true,
        data: extension
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建扩展失败'
      };
    }
  }

  /**
   * 获取扩展详情
   */
  async getExtensionById(extensionId: UUID): Promise<OperationResult<Extension>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);
      
      if (!extension) {
        return {
          success: false,
          error: '扩展不存在'
        };
      }

      return {
        success: true,
        data: extension
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取扩展失败'
      };
    }
  }

  /**
   * 激活扩展
   */
  async activateExtension(extensionId: UUID): Promise<OperationResult<Extension>> {
    try {
      // 验证扩展ID
      const validationError = this.validateExtensionId(extensionId);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      const extension = await this.extensionRepository.findById(extensionId);
      
      if (!extension) {
        return {
          success: false,
          error: '扩展不存在'
        };
      }

      // 检查依赖
      const dependencyCheck = await this.extensionRepository.checkDependencies(extension);
      if (!dependencyCheck.satisfied) {
        return {
          success: false,
          error: `依赖不满足: ${dependencyCheck.missing.join(', ')}`
        };
      }

      extension.activate();
      await this.extensionRepository.update(extension);

      return {
        success: true,
        data: extension
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '激活扩展失败'
      };
    }
  }

  /**
   * 停用扩展
   */
  async deactivateExtension(extensionId: UUID): Promise<OperationResult<Extension>> {
    try {
      // 验证扩展ID
      const validationError = this.validateExtensionId(extensionId);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      const extension = await this.extensionRepository.findById(extensionId);
      
      if (!extension) {
        return {
          success: false,
          error: '扩展不存在'
        };
      }

      // 检查是否有其他扩展依赖此扩展
      const dependents = await this.extensionRepository.findDependents(extensionId);
      const activeDependents = dependents.filter(dep => dep.isActive());
      
      if (activeDependents.length > 0) {
        return {
          success: false,
          error: `无法停用，有其他活跃扩展依赖此扩展: ${activeDependents.map(d => d.name).join(', ')}`
        };
      }

      extension.deactivate();
      await this.extensionRepository.update(extension);

      return {
        success: true,
        data: extension
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '停用扩展失败'
      };
    }
  }

  /**
   * 更新扩展状态
   */
  async updateExtensionStatus(extensionId: UUID, status: ExtensionStatus): Promise<OperationResult<Extension>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);
      
      if (!extension) {
        return {
          success: false,
          error: '扩展不存在'
        };
      }

      extension.updateStatus(status);
      await this.extensionRepository.update(extension);

      return {
        success: true,
        data: extension
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新扩展状态失败'
      };
    }
  }

  /**
   * 添加扩展点
   */
  async addExtensionPoint(extensionId: UUID, extensionPoint: ExtensionPoint): Promise<OperationResult<Extension>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);
      
      if (!extension) {
        return {
          success: false,
          error: '扩展不存在'
        };
      }

      extension.addExtensionPoint(extensionPoint);
      await this.extensionRepository.update(extension);

      return {
        success: true,
        data: extension
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加扩展点失败'
      };
    }
  }

  /**
   * 添加API扩展
   */
  async addApiExtension(extensionId: UUID, apiExtension: ApiExtension): Promise<OperationResult<Extension>> {
    try {
      const extension = await this.extensionRepository.findById(extensionId);
      
      if (!extension) {
        return {
          success: false,
          error: '扩展不存在'
        };
      }

      extension.addApiExtension(apiExtension);
      await this.extensionRepository.update(extension);

      return {
        success: true,
        data: extension
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加API扩展失败'
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
      const result = await this.extensionRepository.findByFilter(filter, pagination);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '查询扩展列表失败'
      };
    }
  }

  /**
   * 获取活跃扩展
   */
  async getActiveExtensions(contextId?: UUID): Promise<OperationResult<Extension[]>> {
    try {
      const extensions = await this.extensionRepository.findActiveExtensions(contextId);
      
      return {
        success: true,
        data: extensions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取活跃扩展失败'
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
  ): Promise<OperationResult<{ items: Extension[], total: number, totalPages?: number }>> {
    try {
      const result = await this.queryExtensions(filter || {}, pagination);
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            items: result.data.items,
            total: result.data.total,
            totalPages: result.data.total_pages // 映射total_pages到totalPages
          }
        };
      } else {
        return {
          success: false,
          error: result.error || '获取扩展列表失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取扩展列表失败'
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
          error: validationError
        };
      }

      const extension = await this.extensionRepository.findById(extensionId);
      
      if (!extension) {
        return {
          success: false,
          error: '扩展不存在'
        };
      }

      if (!extension.canUninstall()) {
        return {
          success: false,
          error: `无法卸载状态为 ${extension.status} 的扩展`
        };
      }

      // 检查依赖
      const dependents = await this.extensionRepository.findDependents(extensionId);
      if (dependents.length > 0) {
        return {
          success: false,
          error: `无法卸载，有其他扩展依赖此扩展: ${dependents.map(d => d.name).join(', ')}`
        };
      }

      await this.extensionRepository.delete(extensionId);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '卸载扩展失败'
      };
    }
  }

  /**
   * 获取统计信息
   */
  async getStatistics(contextId?: UUID): Promise<OperationResult<any>> {
    try {
      const statistics = await this.extensionRepository.getStatistics(contextId);
      
      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取统计信息失败'
      };
    }
  }

  /**
   * 生成UUID
   */
  private generateUUID(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 验证创建扩展请求
   */
  private validateCreateExtensionRequest(request: CreateExtensionRequest): string | null {
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
      return '名称长度不能超过100个字符';
    }

    // 检查版本
    if (!request.version || request.version.trim() === '') {
      return '扩展版本不能为空';
    }

    // 检查扩展类型
    const validTypes: ExtensionType[] = ['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer'];
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
}
