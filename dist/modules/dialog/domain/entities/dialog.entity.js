"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogEntity = void 0;
class DialogEntity {
    protocolVersion;
    timestamp;
    dialogId;
    name;
    description;
    participants;
    capabilities;
    strategy;
    context;
    configuration;
    metadata;
    auditTrail;
    monitoringIntegration;
    performanceMetrics;
    versionHistory;
    searchMetadata;
    dialogOperation;
    dialogDetails;
    eventIntegration;
    constructor(dialogId, name, participants, capabilities, auditTrail, monitoringIntegration, performanceMetrics, versionHistory, searchMetadata, dialogOperation, eventIntegration, protocolVersion = '1.0.0', timestamp = new Date().toISOString(), description, strategy, context, configuration, metadata, dialogDetails) {
        if (!dialogId)
            throw new Error('dialogId is required');
        if (!name || name.trim().length === 0)
            throw new Error('name is required and cannot be empty');
        if (!participants || participants.length === 0)
            throw new Error('participants is required and cannot be empty');
        if (!capabilities || !capabilities.basic?.enabled)
            throw new Error('basic capabilities must be enabled');
        this.protocolVersion = protocolVersion;
        this.timestamp = timestamp;
        this.dialogId = dialogId;
        this.name = name;
        this.description = description;
        this.participants = participants;
        this.capabilities = capabilities;
        this.strategy = strategy;
        this.context = context;
        this.configuration = configuration;
        this.metadata = metadata;
        this.auditTrail = auditTrail;
        this.monitoringIntegration = monitoringIntegration;
        this.performanceMetrics = performanceMetrics;
        this.versionHistory = versionHistory;
        this.searchMetadata = searchMetadata;
        this.dialogOperation = dialogOperation;
        this.dialogDetails = dialogDetails;
        this.eventIntegration = eventIntegration;
        this.addDomainEvent({
            eventType: 'DialogCreated',
            aggregateId: this.dialogId,
            timestamp: this.timestamp,
            data: { name: this.name, participants: this.participants }
        });
    }
    hasIntelligentControl() {
        return this.capabilities.intelligentControl?.enabled === true;
    }
    hasCriticalThinking() {
        return this.capabilities.criticalThinking?.enabled === true;
    }
    hasKnowledgeSearch() {
        return this.capabilities.knowledgeSearch?.enabled === true;
    }
    hasMultimodal() {
        return this.capabilities.multimodal?.enabled === true;
    }
    getParticipantCount() {
        return this.participants.length;
    }
    isAtMaxParticipants() {
        if (!this.configuration?.maxParticipants)
            return false;
        return this.participants.length >= this.configuration.maxParticipants;
    }
    isHealthy() {
        return this.performanceMetrics.healthStatus?.status === 'healthy';
    }
    getComplexityScore() {
        return this.performanceMetrics.metrics?.averageDialogComplexityScore || 0;
    }
    continueDialog() {
        this.dialogOperation = 'continue';
    }
    pauseDialog() {
        if (this.dialogOperation === 'end') {
            throw new Error('Cannot pause ended dialog');
        }
        this.dialogOperation = 'pause';
    }
    resumeDialog() {
        if (this.dialogOperation !== 'pause') {
            throw new Error('Cannot resume non-paused dialog');
        }
        this.dialogOperation = 'resume';
    }
    endDialog() {
        this.dialogOperation = 'end';
    }
    isActive() {
        return this.dialogOperation === 'start' || this.dialogOperation === 'continue' || this.dialogOperation === 'resume';
    }
    isPaused() {
        return this.dialogOperation === 'pause';
    }
    isEnded() {
        return this.dialogOperation === 'end';
    }
    canPause() {
        return this.dialogOperation !== 'pause' && this.dialogOperation !== 'end';
    }
    canResume() {
        return this.dialogOperation === 'pause';
    }
    canEnd() {
        return this.dialogOperation !== 'end';
    }
    canStart() {
        return this.dialogOperation !== 'end';
    }
    addParticipant(participantId) {
        if (!this.participants) {
            throw new Error('Participants array not initialized');
        }
        if (this.participants.includes(participantId)) {
            throw new Error('Participant already exists');
        }
        this.participants.push(participantId);
    }
    removeParticipant(participantId) {
        if (!this.participants) {
            throw new Error('Participants array not initialized');
        }
        const index = this.participants.indexOf(participantId);
        if (index === -1) {
            throw new Error('Participant not found');
        }
        if (this.participants.length <= 1) {
            throw new Error('Cannot remove last participant');
        }
        this.participants.splice(index, 1);
    }
    hasParticipant(participantId) {
        if (!this.participants) {
            return false;
        }
        return this.participants.includes(participantId);
    }
    updateDialog(updates) {
        if (updates.name !== undefined) {
            if (!updates.name || updates.name.trim().length === 0) {
                throw new Error('Name cannot be empty');
            }
            if (updates.name.length > 255) {
                throw new Error('Name too long');
            }
            this.name = updates.name;
        }
        if (updates.description !== undefined) {
            if (updates.description && updates.description.length > 1000) {
                throw new Error('Description too long');
            }
            this.description = updates.description;
        }
        this.addDomainEvent({
            eventType: 'DialogUpdated',
            aggregateId: this.dialogId,
            timestamp: new Date().toISOString(),
            data: updates
        });
    }
    updateCapabilities(capabilities) {
        if (!capabilities.basic?.enabled) {
            throw new Error('Basic capabilities must be enabled');
        }
        this.capabilities = capabilities;
    }
    validateStrategy(strategy) {
        if (strategy.rounds && strategy.rounds.min !== undefined && strategy.rounds.min < 0) {
            return false;
        }
        if (strategy.exitCriteria && strategy.exitCriteria.completenessThreshold !== undefined && strategy.exitCriteria.completenessThreshold > 1.0) {
            return false;
        }
        return true;
    }
    toSnapshot() {
        return {
            dialogId: this.dialogId,
            name: this.name,
            description: this.description,
            participants: [...this.participants],
            capabilities: this.capabilities,
            strategy: this.strategy,
            context: this.context,
            configuration: this.configuration,
            metadata: this.metadata,
            dialogOperation: this.dialogOperation,
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp
        };
    }
    _domainEvents = [];
    getDomainEvents() {
        return [...this._domainEvents];
    }
    clearDomainEvents() {
        this._domainEvents = [];
    }
    addDomainEvent(event) {
        this._domainEvents.push(event);
    }
}
exports.DialogEntity = DialogEntity;
