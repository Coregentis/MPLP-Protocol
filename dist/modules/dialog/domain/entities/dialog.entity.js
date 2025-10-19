"use strict";
/**
 * Dialog Domain Entity
 * @description Dialog模块领域实体 - TypeScript层(camelCase)
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogEntity = void 0;
// ===== Dialog领域实体类 =====
class DialogEntity {
    constructor(dialogId, name, participants, capabilities, auditTrail, monitoringIntegration, performanceMetrics, versionHistory, searchMetadata, dialogOperation, eventIntegration, protocolVersion = '1.0.0', timestamp = new Date().toISOString(), description, strategy, context, configuration, metadata, dialogDetails) {
        this._domainEvents = [];
        // 基于Schema驱动开发 - 验证必需字段
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
        // 添加创建事件
        this.addDomainEvent({
            eventType: 'DialogCreated',
            aggregateId: this.dialogId,
            timestamp: this.timestamp,
            data: { name: this.name, participants: this.participants }
        });
    }
    // ===== 业务方法 =====
    /**
     * 检查对话是否启用了智能控制
     */
    hasIntelligentControl() {
        return this.capabilities.intelligentControl?.enabled === true;
    }
    /**
     * 检查对话是否启用了批判性思维
     */
    hasCriticalThinking() {
        return this.capabilities.criticalThinking?.enabled === true;
    }
    /**
     * 检查对话是否启用了知识搜索
     */
    hasKnowledgeSearch() {
        return this.capabilities.knowledgeSearch?.enabled === true;
    }
    /**
     * 检查对话是否启用了多模态交互
     */
    hasMultimodal() {
        return this.capabilities.multimodal?.enabled === true;
    }
    /**
     * 获取参与者数量
     */
    getParticipantCount() {
        return this.participants.length;
    }
    /**
     * 检查是否达到最大参与者数量
     */
    isAtMaxParticipants() {
        if (!this.configuration?.maxParticipants)
            return false;
        return this.participants.length >= this.configuration.maxParticipants;
    }
    /**
     * 检查对话是否健康
     */
    isHealthy() {
        return this.performanceMetrics.healthStatus?.status === 'healthy';
    }
    /**
     * 获取对话复杂度评分
     */
    getComplexityScore() {
        return this.performanceMetrics.metrics?.averageDialogComplexityScore || 0;
    }
    // ===== 状态管理方法 =====
    /**
     * 继续对话
     */
    continueDialog() {
        this.dialogOperation = 'continue';
    }
    /**
     * 暂停对话
     */
    pauseDialog() {
        if (this.dialogOperation === 'end') {
            throw new Error('Cannot pause ended dialog');
        }
        this.dialogOperation = 'pause';
    }
    /**
     * 恢复对话
     */
    resumeDialog() {
        if (this.dialogOperation !== 'pause') {
            throw new Error('Cannot resume non-paused dialog');
        }
        this.dialogOperation = 'resume';
    }
    /**
     * 结束对话
     */
    endDialog() {
        this.dialogOperation = 'end';
    }
    /**
     * 检查对话是否活跃
     */
    isActive() {
        return this.dialogOperation === 'start' || this.dialogOperation === 'continue' || this.dialogOperation === 'resume';
    }
    /**
     * 检查对话是否暂停
     */
    isPaused() {
        return this.dialogOperation === 'pause';
    }
    /**
     * 检查对话是否结束
     */
    isEnded() {
        return this.dialogOperation === 'end';
    }
    /**
     * 检查是否可以暂停对话
     */
    canPause() {
        return this.dialogOperation !== 'pause' && this.dialogOperation !== 'end';
    }
    /**
     * 检查是否可以恢复对话
     */
    canResume() {
        return this.dialogOperation === 'pause';
    }
    /**
     * 检查是否可以结束对话
     */
    canEnd() {
        return this.dialogOperation !== 'end';
    }
    /**
     * 检查是否可以开始对话
     */
    canStart() {
        return this.dialogOperation !== 'end';
    }
    // ===== 参与者管理方法 =====
    /**
     * 添加参与者
     */
    addParticipant(participantId) {
        if (!this.participants) {
            throw new Error('Participants array not initialized');
        }
        if (this.participants.includes(participantId)) {
            throw new Error('Participant already exists');
        }
        this.participants.push(participantId);
    }
    /**
     * 移除参与者
     */
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
    /**
     * 检查参与者是否存在
     */
    hasParticipant(participantId) {
        if (!this.participants) {
            return false;
        }
        return this.participants.includes(participantId);
    }
    // ===== 更新方法 =====
    /**
     * 更新对话信息
     */
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
        // 添加更新事件
        this.addDomainEvent({
            eventType: 'DialogUpdated',
            aggregateId: this.dialogId,
            timestamp: new Date().toISOString(),
            data: updates
        });
    }
    /**
     * 更新能力配置
     */
    updateCapabilities(capabilities) {
        if (!capabilities.basic?.enabled) {
            throw new Error('Basic capabilities must be enabled');
        }
        this.capabilities = capabilities;
    }
    /**
     * 验证策略配置
     */
    validateStrategy(strategy) {
        if (strategy.rounds && strategy.rounds.min !== undefined && strategy.rounds.min < 0) {
            return false;
        }
        if (strategy.exitCriteria && strategy.exitCriteria.completenessThreshold !== undefined && strategy.exitCriteria.completenessThreshold > 1.0) {
            return false;
        }
        return true;
    }
    // ===== 快照和事件方法 =====
    /**
     * 创建对话快照
     */
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
    /**
     * 获取领域事件
     */
    getDomainEvents() {
        return [...this._domainEvents];
    }
    /**
     * 清除领域事件
     */
    clearDomainEvents() {
        this._domainEvents = [];
    }
    /**
     * 添加领域事件
     */
    addDomainEvent(event) {
        this._domainEvents.push(event);
    }
}
exports.DialogEntity = DialogEntity;
//# sourceMappingURL=dialog.entity.js.map