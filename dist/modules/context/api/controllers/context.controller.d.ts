import { ContextManagementService } from '../../application/services/context-management.service';
import { CreateContextDto, UpdateContextDto, ContextQueryDto, ContextResponseDto, PaginatedContextResponseDto, ContextOperationResultDto } from '../dto/context.dto';
import { UUID } from '../../../../shared/types';
import { PaginationParams } from '../../../../shared/types';
export declare class ContextController {
    private readonly contextManagementService;
    constructor(contextManagementService: ContextManagementService);
    createContext(dto: CreateContextDto): Promise<ContextOperationResultDto>;
    getContextById(contextId: UUID): Promise<ContextResponseDto | null>;
    getContextByName(name: string): Promise<ContextResponseDto | null>;
    updateContext(contextId: UUID, dto: UpdateContextDto): Promise<ContextOperationResultDto>;
    deleteContext(contextId: UUID): Promise<ContextOperationResultDto>;
    queryContexts(query?: ContextQueryDto, pagination?: PaginationParams): Promise<PaginatedContextResponseDto>;
    searchContexts(namePattern: string, pagination?: PaginationParams): Promise<PaginatedContextResponseDto>;
    getContextStatistics(): Promise<Record<string, unknown>>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
    private entityToResponseDto;
    private isValidUUID;
    private validateCreateDto;
    private validateUpdateDto;
    private validateQueryDto;
    private validatePaginationParams;
}
//# sourceMappingURL=context.controller.d.ts.map