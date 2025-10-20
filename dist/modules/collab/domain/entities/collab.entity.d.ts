/**
 * Collab Entity - Domain Layer
 * @description Multi-Agent Collaboration Scheduling and Coordination Entity
 * @version 1.0.0
 * @author MPLP Development Team
 */
import { UUID, Timestamp } from '../../../../shared/types';
export declare class CollabParticipant {
    readonly participantId: UUID;
    readonly agentId: UUID;
    readonly roleId: UUID;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    readonly capabilities: string[];
    readonly joinedAt: Date;
    lastActivity?: Date;
    constructor(participantId: UUID, agentId: UUID, roleId: UUID, status: 'active' | 'inactive' | 'pending' | 'suspended', capabilities?: string[], joinedAt?: Date, lastActivity?: Date);
    activate(): void;
    deactivate(): void;
    suspend(): void;
    updateActivity(): void;
    hasCapability(capability: string): boolean;
    isActive(): boolean;
}
export declare class CollabCoordinationStrategy {
    type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    decisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';
    coordinatorId?: UUID;
    constructor(type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer', decisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator', coordinatorId?: UUID);
    requiresCoordinator(): boolean;
    supportsDecisionMaking(mechanism: string): boolean;
    validateConfiguration(): boolean;
}
export interface CollabCreatedEvent {
    type: 'CollabCreated';
    collaborationId: UUID;
    name: string;
    mode: string;
    participantCount: number;
    timestamp: Timestamp;
}
export interface CollabParticipantAddedEvent {
    type: 'CollabParticipantAdded';
    collaborationId: UUID;
    participantId: UUID;
    agentId: UUID;
    roleId: UUID;
    timestamp: Timestamp;
}
export interface CollabParticipantRemovedEvent {
    type: 'CollabParticipantRemoved';
    collaborationId: UUID;
    participantId: UUID;
    reason?: string;
    timestamp: Timestamp;
}
export interface CollabStatusChangedEvent {
    type: 'CollabStatusChanged';
    collaborationId: UUID;
    oldStatus: string;
    newStatus: string;
    timestamp: Timestamp;
}
export interface CollabCoordinationStrategyChangedEvent {
    type: 'CollabCoordinationStrategyChanged';
    collaborationId: UUID;
    oldStrategy: CollabCoordinationStrategy;
    newStrategy: CollabCoordinationStrategy;
    timestamp: Timestamp;
}
export type CollabDomainEvent = CollabCreatedEvent | CollabParticipantAddedEvent | CollabParticipantRemovedEvent | CollabStatusChangedEvent | CollabCoordinationStrategyChangedEvent;
export declare class CollabEntity {
    private _id;
    private _protocolVersion;
    private _timestamp;
    private _contextId;
    private _planId;
    private _name;
    private _description?;
    private _mode;
    private _status;
    private _participants;
    private _coordinationStrategy;
    private _createdBy;
    private _updatedBy?;
    private _domainEvents;
    constructor(_id: UUID, contextId: UUID, planId: UUID, name: string, mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh', coordinationStrategy: CollabCoordinationStrategy, createdBy: string, description?: string);
    get id(): UUID;
    get protocolVersion(): string;
    get timestamp(): Date;
    get contextId(): UUID;
    get planId(): UUID;
    get name(): string;
    get description(): string | undefined;
    get mode(): 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
    get status(): string;
    get participants(): CollabParticipant[];
    get coordinationStrategy(): CollabCoordinationStrategy;
    get createdBy(): string;
    get updatedBy(): string | undefined;
    get domainEvents(): CollabDomainEvent[];
    updateName(name: string, updatedBy: string): void;
    updateDescription(description: string | undefined, updatedBy: string): void;
    changeMode(mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh', updatedBy: string): void;
    changeStatus(newStatus: string, updatedBy: string): void;
    addParticipant(participant: CollabParticipant, updatedBy: string): void;
    removeParticipant(participantId: UUID, updatedBy: string, reason?: string): void;
    updateCoordinationStrategy(strategy: CollabCoordinationStrategy, updatedBy: string): void;
    getParticipant(participantId: UUID): CollabParticipant | undefined;
    getActiveParticipants(): CollabParticipant[];
    getParticipantsByCapability(capability: string): CollabParticipant[];
    canStart(): boolean;
    canStop(): boolean;
    private touch;
    private addDomainEvent;
    clearDomainEvents(): void;
}
//# sourceMappingURL=collab.entity.d.ts.map