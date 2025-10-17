import { ContextEntity } from '../../domain/entities/context.entity';
import { IContextRepository } from '../../domain/repositories/context-repository.interface';
import { LifecycleStage, StateUpdates, CreateContextData, UpdateContextData, ContextFilter, SearchQuery } from '../../types';
import { UUID } from '../../../../shared/types';
import { PaginatedResult, PaginationParams } from '../../../../shared/types';
export interface ICacheManager {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}
export interface IVersionManager {
    createVersion(context: ContextEntity): Promise<string>;
    getVersionHistory(contextId: UUID): Promise<ContextVersion[]>;
    getVersion(contextId: UUID, version: string): Promise<ContextEntity | null>;
    compareVersions(contextId: UUID, version1: string, version2: string): Promise<VersionDiff>;
}
export interface ContextVersion {
    versionId: string;
    contextId: UUID;
    version: string;
    createdAt: Date;
    changes: Record<string, unknown>;
    createdBy?: UUID;
}
export interface VersionDiff {
    added: Record<string, unknown>;
    modified: Record<string, unknown>;
    removed: string[];
}
export interface ILogger {
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void;
}
export declare class ContextManagementService {
    private readonly contextRepository;
    private readonly logger;
    private readonly cacheManager;
    private readonly versionManager;
    constructor(contextRepository: IContextRepository, logger: ILogger, cacheManager: ICacheManager, versionManager: IVersionManager);
    createContext(data: CreateContextData): Promise<ContextEntity>;
    getContext(contextId: UUID): Promise<ContextEntity | null>;
    getContextById(contextId: UUID): Promise<ContextEntity | null>;
    getContextByName(name: string): Promise<ContextEntity | null>;
    queryContexts(filter?: ContextFilter, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    searchContexts(query: SearchQuery | string, pagination?: PaginationParams): Promise<PaginatedResult<ContextEntity>>;
    getContextStatistics(): Promise<Record<string, unknown>>;
    createMultipleContexts(requests: CreateContextData[]): Promise<ContextEntity[]>;
    updateContext(contextId: UUID, data: UpdateContextData): Promise<ContextEntity>;
    deleteContext(contextId: UUID): Promise<boolean>;
    transitionLifecycleStage(contextId: UUID, newStage: LifecycleStage): Promise<ContextEntity>;
    activateContext(contextId: UUID): Promise<ContextEntity>;
    deactivateContext(contextId: UUID): Promise<ContextEntity>;
    syncSharedState(contextId: UUID, stateUpdates: StateUpdates): Promise<void>;
    getStateHistory(contextId: UUID): Promise<ContextVersion[]>;
    compareStateVersions(contextId: UUID, version1: string, version2: string): Promise<VersionDiff>;
    createContexts(requests: CreateContextData[]): Promise<ContextEntity[]>;
    listContexts(filter: ContextFilter): Promise<ContextEntity[]>;
    countContexts(filter: ContextFilter): Promise<number>;
    healthCheck(): Promise<boolean>;
    private generateContextId;
    private validateCreateData;
    private validateUpdateData;
    private validateLifecycleTransition;
    private getStatusForLifecycleStage;
    private canBeDeleted;
    private mergeSharedState;
    private publishStateChangeEvent;
    private incrementVersion;
    private isSimpleFilter;
    private handleContextLifecycleEvent;
}
//# sourceMappingURL=context-management.service.d.ts.map