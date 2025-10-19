/**
 * Collab模块导出
 *
 * @description Collab模块的统一导出入口，与其他6个已完成模块保持IDENTICAL架构
 * @version 1.0.0
 * @author MPLP Development Team
 */
export { default as CollabModule } from './module';
export * from './types';
export { CollabController } from './api/controllers/collab.controller';
export { CollabMapper } from './api/mappers/collab.mapper';
export * from './api/dto/collab.dto';
export { CollabManagementService } from './application/services/collab-management.service';
export { CollabEntity, CollabParticipant, CollabCoordinationStrategy } from './domain/entities/collab.entity';
export { CollabCoordinationService } from './domain/services/collab-coordination.service';
export type { ICollabRepository } from './domain/repositories/collab.repository';
export { CollabRepositoryImpl } from './infrastructure/repositories/collab.repository.impl';
export { CollabModuleAdapter } from './infrastructure/adapters/collab-module.adapter';
export { CollabProtocol } from './infrastructure/protocols/collab.protocol';
export { CollabProtocolFactory } from './infrastructure/factories/collab-protocol.factory';
export type { UUID, CollabMode, CollabStatus, ParticipantStatus, CoordinationType, DecisionMaking, CollabParticipantData, CollabCoordinationStrategyData, CollabEntityData, CreateCollabRequest, UpdateCollabRequest, CollabQueryFilter, CollabSortOptions, PaginationParams, PaginatedResult, CollabListResult, CollabSearchResult, CollabStatistics, CollabHealthMetrics, CollabCoordinationRecommendations, CollabOperationResult, CollabDomainEventData, CollabAuditEntry, CollabPerformanceMetrics, CollabModuleConfig } from './types';
export { default } from './module';
//# sourceMappingURL=index.d.ts.map