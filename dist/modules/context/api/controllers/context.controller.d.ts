/**
 * Context控制器
 *
 * @description Context模块的API控制器，处理HTTP请求和响应
 * @version 1.0.0
 * @layer API层 - 控制器
 */
import { ContextManagementService } from '../../application/services/context-management.service';
import { CreateContextDto, UpdateContextDto, ContextQueryDto, ContextResponseDto, PaginatedContextResponseDto, ContextOperationResultDto } from '../dto/context.dto';
import { UUID } from '../../../../shared/types';
import { PaginationParams } from '../../../../shared/types';
/**
 * Context API控制器
 *
 * @description 提供Context的RESTful API接口
 */
export declare class ContextController {
    private readonly contextManagementService;
    constructor(contextManagementService: ContextManagementService);
    /**
     * 创建新Context
     * POST /contexts
     */
    createContext(dto: CreateContextDto): Promise<ContextOperationResultDto>;
    /**
     * 根据ID获取Context
     * GET /contexts/:id
     */
    getContextById(contextId: UUID): Promise<ContextResponseDto | null>;
    /**
     * 根据名称获取Context
     * GET /contexts/by-name/:name
     */
    getContextByName(name: string): Promise<ContextResponseDto | null>;
    /**
     * 更新Context
     * PUT /contexts/:id
     */
    updateContext(contextId: UUID, dto: UpdateContextDto): Promise<ContextOperationResultDto>;
    /**
     * 删除Context
     * DELETE /contexts/:id
     */
    deleteContext(contextId: UUID): Promise<ContextOperationResultDto>;
    /**
     * 查询Context列表
     * GET /contexts
     */
    queryContexts(query?: ContextQueryDto, pagination?: PaginationParams): Promise<PaginatedContextResponseDto>;
    /**
     * 搜索Context
     * GET /contexts/search
     */
    searchContexts(namePattern: string, pagination?: PaginationParams): Promise<PaginatedContextResponseDto>;
    /**
     * 获取Context统计信息
     * GET /contexts/statistics
     */
    getContextStatistics(): Promise<Record<string, unknown>>;
    /**
     * 健康检查
     * GET /contexts/health
     */
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
    /**
     * 实体转换为响应DTO
     */
    private entityToResponseDto;
    /**
     * 验证UUID格式
     */
    private isValidUUID;
    /**
     * 验证创建DTO
     */
    private validateCreateDto;
    /**
     * 验证更新DTO
     */
    private validateUpdateDto;
    /**
     * 验证查询DTO
     */
    private validateQueryDto;
    /**
     * 验证分页参数
     */
    private validatePaginationParams;
}
//# sourceMappingURL=context.controller.d.ts.map