import { UUID } from '../../../../shared/types';
import { ExtensionManagementService } from '../../application/services/extension-management.service';
import { ExtensionType, ExtensionStatus } from '../../types';
import { ExtensionResponseDto, ExtensionListResponseDto, HealthStatusResponseDto, ExtensionPerformanceMetricsDto } from '../dto/extension.dto';
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: unknown;
    };
}
export interface ExtensionListOptions {
    contextId?: UUID;
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    page?: number;
    limit?: number;
}
export interface ExtensionQueryCriteria {
    extensionType?: ExtensionType;
    status?: ExtensionStatus;
    name?: string;
    category?: string;
}
export interface HttpRequest {
    params: Record<string, string>;
    query: Record<string, string>;
    body: unknown;
    headers: Record<string, string>;
}
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
export declare class ExtensionController {
    private readonly extensionManagementService;
    constructor(extensionManagementService: ExtensionManagementService);
    createExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    getExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    updateExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    deleteExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    queryExtensionsHttp(request: HttpRequest): Promise<HttpResponse>;
    activateExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    deactivateExtensionHttp(request: HttpRequest): Promise<HttpResponse>;
    private validateCreateExtensionDto;
    private validateUpdateExtensionDto;
    private parseQueryExtensionsDto;
    private handleError;
    createExtension(dto: CreateExtensionDto): Promise<ApiResponse<ExtensionResponseDto>>;
    getExtension(extensionId: UUID): Promise<ApiResponse<ExtensionResponseDto>>;
    updateExtension(extensionId: UUID, dto: UpdateExtensionDto): Promise<ApiResponse<ExtensionResponseDto>>;
    deleteExtension(extensionId: UUID): Promise<ApiResponse<boolean>>;
    activateExtension(extensionId: UUID): Promise<ApiResponse<boolean>>;
    deactivateExtension(extensionId: UUID): Promise<ApiResponse<boolean>>;
    queryExtensions(criteria: ExtensionQueryCriteria): Promise<ApiResponse<ExtensionResponseDto[]>>;
    listExtensions(options: ExtensionListOptions): Promise<ApiResponse<ExtensionListResponseDto>>;
    getHealthStatus(): Promise<ApiResponse<HealthStatusResponseDto>>;
    getPerformanceMetrics(): Promise<ApiResponse<ExtensionPerformanceMetricsDto>>;
}
//# sourceMappingURL=extension.controller.d.ts.map