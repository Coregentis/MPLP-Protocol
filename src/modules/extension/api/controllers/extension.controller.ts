/**
 * Extension控制器
 *
 * API层控制器，处理HTTP请求
 *
 * @version 1.0.0
 * @created 2025-09-16
 */

import {
  ExtensionManagementService,
  CreateExtensionRequest,
} from '../../application/services/extension-management.service';
import { ExtensionFilter } from '../../domain/repositories/extension-repository.interface';
import { ExtensionPoint, ApiExtension } from '../../types';

/**
 * HTTP请求接口 - 企业级类型安全
 */
export interface HttpRequest {
  params: Record<string, string>;
  body: unknown;
  query: Record<string, string>;
  user?: {
    id: string;
    role: string;
  };
}

/**
 * HTTP响应接口 - 企业级类型安全
 */
export interface HttpResponse {
  status: number;
  data?: unknown;
  error?: string;
  message?: string;
}

/**
 * Extension控制器
 */
export class ExtensionController {
  constructor(
    private readonly extensionManagementService: ExtensionManagementService
  ) {}

  /**
   * 创建扩展
   * POST /api/v1/extensions
   */
  async createExtension(req: HttpRequest): Promise<HttpResponse> {
    try {
      // 类型安全的请求体验证
      if (!req.body || typeof req.body !== 'object') {
        return { status: 400, error: 'Invalid request body' };
      }
      
      const createRequest: CreateExtensionRequest = req.body as CreateExtensionRequest;
      const result = await this.extensionManagementService.createExtension(
        createRequest
      );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 201,
        data: result.data?.toProtocol(),
        message: '扩展创建成功',
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 获取扩展详情
   * GET /api/v1/extensions/:id
   */
  async getExtensionById(req: HttpRequest): Promise<HttpResponse> {
    try {
      const extensionId = req.params.id;
      const result = await this.extensionManagementService.getExtensionById(
        extensionId
      );

      if (!result.success) {
        return {
          status: 404,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 激活扩展
   * PUT /api/v1/extensions/:id/activate
   */
  async activateExtension(req: HttpRequest): Promise<HttpResponse> {
    try {
      const extensionId = req.params.id;
      const result = await this.extensionManagementService.activateExtension(
        extensionId
      );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '扩展激活成功',
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 停用扩展
   * PUT /api/v1/extensions/:id/deactivate
   */
  async deactivateExtension(req: HttpRequest): Promise<HttpResponse> {
    try {
      const extensionId = req.params.id;
      const result = await this.extensionManagementService.deactivateExtension(
        extensionId
      );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '扩展停用成功',
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 更新扩展状态
   * PUT /api/v1/extensions/:id/status
   */
  async updateExtensionStatus(req: HttpRequest): Promise<HttpResponse> {
    try {
      const extensionId = req.params.id;
      
      // 类型安全的请求体验证
      if (!req.body || typeof req.body !== 'object') {
        return { status: 400, error: 'Invalid request body' };
      }
      
      const body = req.body as { status?: string };
      const { status } = body;

      if (!status) {
        return { status: 400, error: 'Status is required' };
      }

      // 验证status是有效的ExtensionStatus
      const validStatuses = ['active', 'inactive', 'suspended', 'error'];
      if (!validStatuses.includes(status)) {
        return { status: 400, error: 'Invalid status value' };
      }

      const result =
        await this.extensionManagementService.updateExtensionStatus(
          extensionId,
          status as any // 临时类型断言，已验证status有效性
        );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '扩展状态更新成功',
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 添加扩展点
   * POST /api/v1/extensions/:id/extension-points
   */
  async addExtensionPoint(req: HttpRequest): Promise<HttpResponse> {
    try {
      const extensionId = req.params.id;
      
      // 类型安全的请求体验证
      if (!req.body || typeof req.body !== 'object') {
        return { status: 400, error: 'Invalid request body' };
      }
      
      const extensionPoint: ExtensionPoint = req.body as ExtensionPoint;

      const result = await this.extensionManagementService.addExtensionPoint(
        extensionId,
        extensionPoint
      );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '扩展点添加成功',
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 添加API扩展
   * POST /api/v1/extensions/:id/api-extensions
   */
  async addApiExtension(req: HttpRequest): Promise<HttpResponse> {
    try {
      const extensionId = req.params.id;
      
      // 类型安全的请求体验证
      if (!req.body || typeof req.body !== 'object') {
        return { status: 400, error: 'Invalid request body' };
      }
      
      const apiExtension: ApiExtension = req.body as ApiExtension;

      const result = await this.extensionManagementService.addApiExtension(
        extensionId,
        apiExtension
      );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: 'API扩展添加成功',
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 查询扩展列表
   * GET /api/v1/extensions
   */
  async queryExtensions(req: HttpRequest): Promise<HttpResponse> {
    try {
      // 类型安全的过滤器构建
      const filter: ExtensionFilter = {
        context_id: req.query.contextId,
        name_pattern: req.query.name_pattern,
        version: req.query.version,
        is_active: req.query.is_active === 'true',
        has_api_extensions: req.query.has_api_extensions === 'true',
        has_extension_points: req.query.has_extension_points === 'true',
        created_after: req.query.created_after,
        created_before: req.query.created_before,
      };

      // 验证和设置type（如果提供）
      if (req.query.type) {
        const validTypes = ['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer'];
        if (validTypes.includes(req.query.type)) {
          filter.type = req.query.type as any; // 已验证有效性
        }
      }

      // 验证和设置status（如果提供）
      if (req.query.status) {
        const validStatuses = ['active', 'inactive', 'suspended', 'error'];
        if (validStatuses.includes(req.query.status)) {
          filter.status = req.query.status as any; // 已验证有效性
        }
      }

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order as 'asc' | 'desc',
      };

      const result = await this.extensionManagementService.queryExtensions(
        filter,
        pagination
      );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: {
          ...result.data,
          items: result.data?.items.map(ext => ext.toProtocol()),
        },
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 获取活跃扩展
   * GET /api/v1/extensions/active
   */
  async getActiveExtensions(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId;
      const result = await this.extensionManagementService.getActiveExtensions(
        contextId
      );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data?.map(ext => ext.toProtocol()),
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 卸载扩展
   * DELETE /api/v1/extensions/:id
   */
  async uninstallExtension(req: HttpRequest): Promise<HttpResponse> {
    try {
      const extensionId = req.params.id;
      const result = await this.extensionManagementService.uninstallExtension(
        extensionId
      );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        message: '扩展卸载成功',
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 获取统计信息
   * GET /api/v1/extensions/statistics
   */
  async getStatistics(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId;
      const result = await this.extensionManagementService.getStatistics(
        contextId
      );

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data,
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 更新扩展
   * PUT /api/v1/extensions/:id
   */
  async updateExtension(req: HttpRequest): Promise<HttpResponse> {
    try {
      const extensionId = req.params.id;
      const updateData = req.body;

      const result = await this.extensionManagementService.updateExtension(
        extensionId,
        updateData
      );

      if (!result.success) {
        // 根据错误类型返回不同的状态码
        const status = result.error?.includes('not found') ? 404 : 400;
        return {
          status,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '扩展更新成功',
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 获取扩展依赖
   * GET /api/v1/extensions/:id/dependencies
   */
  async getExtensionDependencies(req: HttpRequest): Promise<HttpResponse> {
    try {
      const extensionId = req.params.id;
      const result =
        await this.extensionManagementService.getExtensionDependencies(
          extensionId
        );

      if (!result.success) {
        return {
          status: 404,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data,
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }

  /**
   * 获取上下文的扩展列表
   * GET /api/v1/contexts/:contextId/extensions
   */
  async getExtensionsByContext(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.params.contextId;
      const result =
        await this.extensionManagementService.getExtensionsByContext(contextId);

      if (!result.success) {
        return {
          status: 400,
          error: result.error,
        };
      }

      return {
        status: 200,
        data: result.data?.map(ext => ext.toProtocol()),
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
      };
    }
  }
}
