/**
 * Plan控制器
 *
 * @description Plan模块的API控制器，处理HTTP请求和响应
 * @version 1.0.0
 * @layer API层 - 控制器
 */
import { PlanManagementService } from '../../application/services/plan-management.service';
import { CreatePlanDto, UpdatePlanDto, PlanQueryDto, PlanResponseDto, PaginatedPlanResponseDto, PlanOperationResultDto, PlanExecutionDto, PlanOptimizationDto, PlanValidationDto } from '../dto/plan.dto.js';
import { UUID } from '../../../../shared/types';
import { PaginationParams } from '../../../../shared/types';
/**
 * Plan API控制器
 *
 * @description 提供Plan的RESTful API接口
 */
export declare class PlanController {
    private readonly planManagementService;
    constructor(planManagementService: PlanManagementService);
    /**
     * 创建新Plan
     * POST /plans
     */
    createPlan(dto: CreatePlanDto): Promise<PlanOperationResultDto>;
    /**
     * 根据ID获取Plan
     * GET /plans/:id
     */
    getPlanById(planId: UUID): Promise<PlanResponseDto | null>;
    /**
     * 根据名称获取Plan
     * GET /plans/by-name/:name
     */
    getPlanByName(name: string): Promise<PlanResponseDto | null>;
    /**
     * 更新Plan
     * PUT /plans/:id
     */
    updatePlan(planId: UUID, dto: UpdatePlanDto): Promise<PlanOperationResultDto>;
    /**
     * 删除Plan
     * DELETE /plans/:id
     */
    deletePlan(planId: UUID): Promise<PlanOperationResultDto>;
    /**
     * 查询Plans
     * GET /plans
     */
    queryPlans(query: PlanQueryDto, pagination?: PaginationParams): Promise<PaginatedPlanResponseDto>;
    /**
     * 执行Plan
     * POST /plans/:id/execute
     */
    executePlan(planId: UUID, dto?: PlanExecutionDto): Promise<PlanOperationResultDto>;
    /**
     * 优化Plan
     * POST /plans/:id/optimize
     */
    optimizePlan(planId: UUID, dto?: PlanOptimizationDto): Promise<PlanOperationResultDto>;
    /**
     * 验证Plan
     * POST /plans/:id/validate
     */
    validatePlan(planId: UUID, dto?: PlanValidationDto): Promise<PlanOperationResultDto>;
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
    /**
     * 验证UUID格式
     */
    private isValidUUID;
    /**
     * 将数据转换为响应DTO
     */
    private dataToResponseDto;
}
//# sourceMappingURL=plan.controller.d.ts.map