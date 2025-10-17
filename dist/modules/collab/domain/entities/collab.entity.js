"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabEntity = exports.CollabCoordinationStrategy = exports.CollabParticipant = void 0;
const utils_1 = require("../../../../shared/utils");
class CollabParticipant {
    participantId;
    agentId;
    roleId;
    status;
    capabilities;
    joinedAt;
    lastActivity;
    constructor(participantId, agentId, roleId, status, capabilities = [], joinedAt = new Date(), lastActivity) {
        this.participantId = participantId;
        this.agentId = agentId;
        this.roleId = roleId;
        this.status = status;
        this.capabilities = capabilities;
        this.joinedAt = joinedAt;
        this.lastActivity = lastActivity;
    }
    activate() {
        this.status = 'active';
        this.lastActivity = new Date();
    }
    deactivate() {
        this.status = 'inactive';
        this.lastActivity = new Date();
    }
    suspend() {
        this.status = 'suspended';
        this.lastActivity = new Date();
    }
    updateActivity() {
        this.lastActivity = new Date();
    }
    hasCapability(capability) {
        return this.capabilities.includes(capability);
    }
    isActive() {
        return this.status === 'active';
    }
}
exports.CollabParticipant = CollabParticipant;
class CollabCoordinationStrategy {
    type;
    decisionMaking;
    coordinatorId;
    constructor(type, decisionMaking, coordinatorId) {
        this.type = type;
        this.decisionMaking = decisionMaking;
        this.coordinatorId = coordinatorId;
    }
    requiresCoordinator() {
        return this.type === 'centralized' || this.type === 'hierarchical';
    }
    supportsDecisionMaking(mechanism) {
        const supportedMechanisms = {
            centralized: ['coordinator'],
            distributed: ['consensus', 'majority', 'weighted'],
            hierarchical: ['coordinator', 'majority'],
            peer_to_peer: ['consensus', 'majority']
        };
        return supportedMechanisms[this.type].includes(mechanism);
    }
    validateConfiguration() {
        if (this.requiresCoordinator() && !this.coordinatorId) {
            return false;
        }
        return this.supportsDecisionMaking(this.decisionMaking);
    }
}
exports.CollabCoordinationStrategy = CollabCoordinationStrategy;
class CollabEntity {
    _id;
    _protocolVersion = '1.0.0';
    _timestamp;
    _contextId;
    _planId;
    _name;
    _description;
    _mode;
    _status = 'draft';
    _participants = [];
    _coordinationStrategy;
    _createdBy;
    _updatedBy;
    _domainEvents = [];
    constructor(_id, contextId, planId, name, mode, coordinationStrategy, createdBy, description) {
        this._id = _id;
        this._timestamp = new Date();
        this._contextId = contextId;
        this._planId = planId;
        this._name = name;
        this._description = description;
        this._mode = mode;
        this._coordinationStrategy = coordinationStrategy;
        this._createdBy = createdBy;
        if (coordinationStrategy && typeof coordinationStrategy.validateConfiguration === 'function') {
            try {
                if (!coordinationStrategy.validateConfiguration()) {
                    if (!coordinationStrategy.type || !coordinationStrategy.decisionMaking) {
                        throw new Error('Invalid coordination strategy configuration');
                    }
                }
            }
            catch (error) {
                if (!coordinationStrategy.type || !coordinationStrategy.decisionMaking) {
                    throw new Error('Invalid coordination strategy configuration');
                }
            }
        }
        else {
            if (!coordinationStrategy.type || !coordinationStrategy.decisionMaking) {
                throw new Error('Invalid coordination strategy configuration');
            }
        }
        this.addDomainEvent({
            type: 'CollabCreated',
            collaborationId: this._id,
            name: this._name,
            mode: this._mode,
            participantCount: this._participants.length,
            timestamp: (0, utils_1.getCurrentTimestamp)()
        });
    }
    get id() { return this._id; }
    get protocolVersion() { return this._protocolVersion; }
    get timestamp() { return this._timestamp; }
    get contextId() { return this._contextId; }
    get planId() { return this._planId; }
    get name() { return this._name; }
    get description() { return this._description; }
    get mode() { return this._mode; }
    get status() { return this._status; }
    get participants() { return [...this._participants]; }
    get coordinationStrategy() { return this._coordinationStrategy; }
    get createdBy() { return this._createdBy; }
    get updatedBy() { return this._updatedBy; }
    get domainEvents() { return [...this._domainEvents]; }
    updateName(name, updatedBy) {
        if (!name || name.trim().length === 0) {
            throw new Error('Collaboration name cannot be empty');
        }
        this._name = name.trim();
        this._updatedBy = updatedBy;
        this.touch();
    }
    updateDescription(description, updatedBy) {
        this._description = description;
        this._updatedBy = updatedBy;
        this.touch();
    }
    changeMode(mode, updatedBy) {
        if (this._status === 'active') {
            throw new Error('Cannot change mode of active collaboration');
        }
        this._mode = mode;
        this._updatedBy = updatedBy;
        this.touch();
    }
    changeStatus(newStatus, updatedBy) {
        const oldStatus = this._status;
        this._status = newStatus;
        this._updatedBy = updatedBy;
        this.touch();
        this.addDomainEvent({
            type: 'CollabStatusChanged',
            collaborationId: this._id,
            oldStatus,
            newStatus,
            timestamp: (0, utils_1.getCurrentTimestamp)()
        });
    }
    addParticipant(participant, updatedBy) {
        if (this._participants.some(p => p.participantId === participant.participantId)) {
            throw new Error('Participant already exists in collaboration');
        }
        if (this._participants.length >= 100) {
            throw new Error('Maximum number of participants reached');
        }
        this._participants.push(participant);
        this._updatedBy = updatedBy;
        this.touch();
        this.addDomainEvent({
            type: 'CollabParticipantAdded',
            collaborationId: this._id,
            participantId: participant.participantId,
            agentId: participant.agentId,
            roleId: participant.roleId,
            timestamp: (0, utils_1.getCurrentTimestamp)()
        });
    }
    removeParticipant(participantId, updatedBy, reason) {
        const participantIndex = this._participants.findIndex(p => p.participantId === participantId);
        if (participantIndex === -1) {
            throw new Error('Participant not found in collaboration');
        }
        if (this._participants.length <= 2) {
            throw new Error('Cannot remove participant: minimum 2 participants required');
        }
        this._participants.splice(participantIndex, 1);
        this._updatedBy = updatedBy;
        this.touch();
        this.addDomainEvent({
            type: 'CollabParticipantRemoved',
            collaborationId: this._id,
            participantId,
            reason,
            timestamp: (0, utils_1.getCurrentTimestamp)()
        });
    }
    updateCoordinationStrategy(strategy, updatedBy) {
        if (strategy && typeof strategy.validateConfiguration === 'function') {
            try {
                if (!strategy.validateConfiguration()) {
                    if (!strategy.type || !strategy.decisionMaking) {
                        throw new Error('Invalid coordination strategy configuration');
                    }
                }
            }
            catch (error) {
                if (!strategy.type || !strategy.decisionMaking) {
                    throw new Error('Invalid coordination strategy configuration');
                }
            }
        }
        else {
            if (!strategy.type || !strategy.decisionMaking) {
                throw new Error('Invalid coordination strategy configuration');
            }
        }
        const oldStrategy = this._coordinationStrategy;
        this._coordinationStrategy = strategy;
        this._updatedBy = updatedBy;
        this.touch();
        this.addDomainEvent({
            type: 'CollabCoordinationStrategyChanged',
            collaborationId: this._id,
            oldStrategy,
            newStrategy: strategy,
            timestamp: (0, utils_1.getCurrentTimestamp)()
        });
    }
    getParticipant(participantId) {
        return this._participants.find(p => p.participantId === participantId);
    }
    getActiveParticipants() {
        return this._participants.filter(p => p.isActive());
    }
    getParticipantsByCapability(capability) {
        return this._participants.filter(p => p.hasCapability(capability));
    }
    canStart() {
        if (this._status !== 'draft' || this._participants.length < 2) {
            return false;
        }
        if (this._coordinationStrategy && typeof this._coordinationStrategy.validateConfiguration === 'function') {
            try {
                return this._coordinationStrategy.validateConfiguration();
            }
            catch (error) {
                return !!(this._coordinationStrategy.type && this._coordinationStrategy.decisionMaking);
            }
        }
        else {
            return !!(this._coordinationStrategy.type && this._coordinationStrategy.decisionMaking);
        }
    }
    canStop() {
        return this._status === 'active';
    }
    touch() {
        this._timestamp = new Date();
    }
    addDomainEvent(event) {
        this._domainEvents.push(event);
    }
    clearDomainEvents() {
        this._domainEvents = [];
    }
}
exports.CollabEntity = CollabEntity;
