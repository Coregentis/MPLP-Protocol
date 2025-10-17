import { UUID } from '../../../../shared/types';
import { CollabEntity } from '../../domain/entities/collab.entity';
import { CollabListQuery, CollabListResult, CollabSearchQuery, CollabSearchResult } from '../../domain/repositories/collab.repository';
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
    private createEntityFromData;
    private convertEntityToEntityData;
}
//# sourceMappingURL=collab.repository.impl.d.ts.map