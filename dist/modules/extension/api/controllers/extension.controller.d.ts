/**
 * Extension API控制器
 *
 * @description Extension模块的REST API控制器，提供完整的HTTP接口
 * @version 1.0.0
 * @layer API层 - 控制器
 * @pattern REST API + DTO验证 + 错误处理
 */
import { UUID } from '../../../../shared/types';
import { ExtensionManagementService } from '../../application/services/extension-management.service';
import { ExtensionType, ExtensionStatus } from '../../types';
import { ExtensionResponseDto, ExtensionListResponseDto, HealthStatusResponseDto, ExtensionPerformanceMetricsDto } from '../dto/extension.dto';
/**
 * 标准化的API响应接口
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: unknown;
    };
}
/**
 * 扩展查询选项接口
 */
export interface ExtensionListOptions {
    contextId?: UUID;
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    page?: number;
    limit?: number;
}
/**
 * 扩展查询条件接口
 */
export interface ExtensionQueryCriteria {
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    name?: string;
    category?: string;
}
/**
 * HTTP请求接口
 */
export interface HttpRequest {
    params: Record<string, string>;
    query: Record<string, string>;
    body: unknown;
    headers: Record<string, string>;
}
/**
 * HTTP响应接口
 */
export interface HttpResponse {
    status: number;
    data?: unknown;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    headers?: Record<string, string>;
}
/**
 * 创建扩展请求DTO
 */
export interface CreateExtensionDto {
    contextId: UUID;
    name: string;
    displayName: string;
    description: string;
    version: string;
    extensionType: ExtensionType;
    compatibility?: {
        mplpVersion: string;
        requiredModules?: string[];
        dependencies?: Array<{
            name: string;
            version: string;
            optional?: boolean;
        }>;
    };
    configuration?: {
        schema?: Record<string, unknown>;
        currentConfig?: Record<string, unknown>;
        defaultConfig?: Record<string, unknown>;
    };
    security?: {
        sandboxEnabled?: boolean;
        resourceLimits?: {
            maxMemory?: number;
            maxCpu?: number;
            maxFileSize?: number;
        };
    };
    metadata?: {
        author?: string;
        license?: string;
        keywords?: string[];
        category?: string;
    };
}
/**
 * 更新扩展请求DTO
 */
export interface UpdateExtensionDto {
    displayName?: string;
    description?: string;
    configuration?: Record<string, unknown>;
    metadata?: {
        author?: string;
        license?: string;
        keywords?: string[];
        category?: string;
    };
}
/**
 * 查询扩展请求DTO
 */
export interface QueryExtensionsDto {
    contextId?: UUID;
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    name?: string;
    author?: string;
    category?: string;
    keywords?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
/**
 * Extension API控制器类
 * 提供完整的REST API端点
 */
export declare class ExtensionController {
    private readonly extensionManagementService;
    constructor(extensionManagementService: ExtensionManagementService);
    /**
     * 创建扩展 (HTTP版本)
     * POST /api/extensions
     */
    createExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    /**
     * 获取扩展详情 (HTTP版本)
     * GET /api/extensions/:id
     */
    getExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    /**
     * 更新扩展 (HTTP版本)
     * PUT /api/extensions/:id
     */
    updateExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    /**
     * 删除扩展 (HTTP版本)
     * DELETE /api/extensions/:id
     */
    deleteExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    /**
     * 查询扩展列表 (HTTP版本)
     * GET /api/extensions
     */
    queryExtensionsHttp(request: HttpRequest): Promise<HttpResponse>;
    /**
     * 激活扩展 (HTTP版本)
     * POST /api/extensions/:id/activate
     */
    activateExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    /**
     * 停用扩展 (HTTP版本)
     * POST /api/extensions/:id/deactivate
     */
    deactivateExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    /**
     * 验证创建扩展DTO
     */
    private validateCreateExtensionDto;
    /**
     * 验证更新扩展DTO
     */
    private validateUpdateExtensionDto;
    /**
     * 解析查询扩展DTO
     */
    private parseQueryExtensionsDto;
    /**
     * 处理错误
     */
    private handleError;
    /**
     * 创建扩展 (直接调用版本)
     */
    createExtension(dto: CreateExtensionDto): Promise<ApiResponse<ExtensionResponseDto>>;
    /**
     * 获取扩展 (直接调用版本)
     */
    getExtension(extensionId: UUID): Promise<ApiResponse<ExtensionResponseDto>>;
    /**
     * 更新扩展 (直接调用版本)
     */
    updateExtension(extensionId: UUID, dto: UpdateExtensionDto): Promise<ApiResponse<ExtensionResponseDto>>;
    /**
     * 删除扩展 (直接调用版本)
     */
    deleteExtension(extensionId: UUID): Promise<ApiResponse<boolean>>;
    /**
     * 激活扩展 (直接调用版本)
     */
    activateExtension(extensionId: UUID): Promise<ApiResponse<boolean>>;
    /**
     * 停用扩展 (直接调用版本)
     */
    deactivateExtension(extensionId: UUID): Promise<ApiResponse<boolean>>;
    /**
     * 查询扩展 (直接调用版本)
     */
    queryExtensions(criteria: ExtensionQueryCriteria): Promise<ApiResponse<ExtensionResponseDto[]>>;
    /**
     * 列出扩展 (直接调用版本)
     */
    listExtensions(options: ExtensionListOptions): Promise<ApiResponse<ExtensionListResponseDto>>;
    /**
     * 获取健康状态 (直接调用版本)
     */
    getHealthStatus(): Promise<ApiResponse<HealthStatusResponseDto>>;
    /**
     * 获取性能指标 (直接调用版本)
     */
    getPerformanceMetrics(): Promise<ApiResponse<ExtensionPerformanceMetricsDto>>;
}
//# sourceMappingURL=extension.controller.d.ts.map