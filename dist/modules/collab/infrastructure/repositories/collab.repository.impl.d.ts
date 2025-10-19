/**
 * Collab Repository Implementation - Infrastructure Layer
 * @description Concrete implementation of Collab repository with cross-cutting concerns integration
 * @version 1.0.0
 * @author MPLP Development Team
 */
import { UUID } from '../../../../shared/types';
import { CollabEntity } from '../../domain/entities/collab.entity';
import { CollabListQuery, CollabListResult, CollabSearchQuery, CollabSearchResult } from '../../domain/repositories/collab.repository';
/**
 * Collab Repository Implementation
 * Implements persistence operations with full cross-cutting concerns integration
 */
export declare class CollabRepositoryImpl {
    private readonly collabStorage;
    findById(id: UUID): Promise<CollabEntity | null>;
    findByIds(ids: UUID[]): Promise<CollabEntity[]>;
    save(entity: CollabEntity): Promise<CollabEntity>;
    update(entity: CollabEntity): Promise<CollabEntity>;
    delete(id: UUID): Promise<void>;
    exists(id: UUID): Promise<boolean>;
    list(query: CollabListQuery): Promise<CollabListResult>;
    search(query: CollabSearchQuery): Promise<CollabSearchResult>;
    count(filters?: Partial<CollabListQuery>): Promise<number>;
    /**
     * Create CollabEntity from entity data
     * This helper creates a proper entity instance from data
     */
    private createEntityFromData;
    /**
     * Convert CollabEntity to CollabEntityData for mapping
     * This is a temporary helper until we have proper entity data extraction
     */
    private convertEntityToEntityData;
}
//# sourceMappingURL=collab.repository.impl.d.ts.map