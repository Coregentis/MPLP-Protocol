import { DialogEntity } from '../entities/dialog.entity';
import { type UUID } from '../../types';
export interface DialogRepository {
    save(dialog: DialogEntity): Promise<DialogEntity>;
    findById(id: UUID): Promise<DialogEntity | null>;
    findByName(name: string): Promise<DialogEntity[]>;
    findByParticipant(participantId: string): Promise<DialogEntity[]>;
    findAll(limit?: number, offset?: number): Promise<DialogEntity[]>;
    update(id: UUID, dialog: DialogEntity): Promise<DialogEntity>;
    delete(id: UUID): Promise<void>;
    exists(id: UUID): Promise<boolean>;
    count(): Promise<number>;
    search(criteria: DialogSearchCriteria): Promise<DialogEntity[]>;
    findActiveDialogs(): Promise<DialogEntity[]>;
    findByCapability(capabilityType: string): Promise<DialogEntity[]>;
}
export interface DialogSearchCriteria {
    name?: string;
    participantIds?: string[];
    dialogType?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    hasIntelligentControl?: boolean;
    hasCriticalThinking?: boolean;
    hasKnowledgeSearch?: boolean;
    hasMultimodal?: boolean;
    healthStatus?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=dialog.repository.d.ts.map