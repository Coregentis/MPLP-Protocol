import { PlanManagementService } from '../../application/services/plan-management.service';
import { CreatePlanDto, UpdatePlanDto, PlanQueryDto, PlanResponseDto, PaginatedPlanResponseDto, PlanOperationResultDto, PlanExecutionDto, PlanOptimizationDto, PlanValidationDto } from '../dto/plan.dto.js';
import { UUID } from '../../../../shared/types';
import { PaginationParams } from '../../../../shared/types';
export declare class PlanController {
    private readonly planManagementService;
    constructor(planManagementService: PlanManagementService);
    createPlan(dto: CreatePlanDto): Promise<PlanOperationResultDto>;
    getPlanById(planId: UUID): Promise<PlanResponseDto | null>;
    getPlanByName(name: string): Promise<PlanResponseDto | null>;
    updatePlan(planId: UUID, dto: UpdatePlanDto): Promise<PlanOperationResultDto>;
    deletePlan(planId: UUID): Promise<PlanOperationResultDto>;
    queryPlans(query: PlanQueryDto, pagination?: PaginationParams): Promise<PaginatedPlanResponseDto>;
    executePlan(planId: UUID, dto?: PlanExecutionDto): Promise<PlanOperationResultDto>;
    optimizePlan(planId: UUID, dto?: PlanOptimizationDto): Promise<PlanOperationResultDto>;
    validatePlan(planId: UUID, dto?: PlanValidationDto): Promise<PlanOperationResultDto>;
    private validateCreateDto;
    private validateUpdateDto;
    private validateQueryDto;
    private validatePaginationParams;
    private isValidUUID;
    private dataToResponseDto;
}
//# sourceMappingURL=plan.controller.d.ts.map