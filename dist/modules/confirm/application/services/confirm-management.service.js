"use strict";
/**
 * Confirm管理服务
 *
 * @description Confirm模块的核心应用服务，处理业务逻辑和协调
 * @version 1.0.0
 * @layer 应用层 - 服务
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmManagementService = void 0;
const confirm_entity_1 = require("../../domain/entities/confirm.entity");
/**
 * Confirm管理服务
 *
 * @description 提供Confirm模块的核心业务逻辑，包括审批工作流管理
 */
class ConfirmManagementService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * 创建确认
     */
    async createConfirm(request) {
        // 生成确认ID
        const confirmId = this.generateUUID();
        // 创建确认实体
        const confirm = new confirm_entity_1.ConfirmEntity({
            protocolVersion: '1.0.0',
            timestamp: new Date(),
            confirmId,
            contextId: request.contextId,
            planId: request.planId,
            confirmationType: request.confirmationType,
            status: 'pending',
            priority: request.priority,
            requester: request.requester,
            approvalWorkflow: {
                ...request.approvalWorkflow,
                steps: request.approvalWorkflow.steps.map(step => ({
                    ...step,
                    status: 'pending'
                }))
            },
            subject: request.subject,
            riskAssessment: request.riskAssessment
        });
        // 保存到仓库
        const saved = await this.repository.create(confirm);
        return this.entityToData(saved);
    }
    /**
     * 审批确认
     */
    async approveConfirm(confirmId, approverId, comments) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        if (!confirm.canApprove(approverId)) {
            throw new Error(`User ${approverId} cannot approve this confirmation`);
        }
        // 更新审批步骤
        const updatedSteps = confirm.approvalWorkflow.steps.map(step => {
            if (step.approver.userId === approverId && step.status === 'pending') {
                return {
                    ...step,
                    status: 'approved',
                    decision: {
                        outcome: 'approve',
                        comments,
                        timestamp: new Date()
                    }
                };
            }
            return step;
        });
        // 检查是否所有必需步骤都已完成
        const allRequiredApproved = updatedSteps
            .filter(step => step.approver.isRequired)
            .every(step => step.status === 'approved');
        const newStatus = allRequiredApproved ? 'approved' : 'in_review';
        // 更新确认
        const updated = await this.repository.update(confirmId, {
            status: newStatus,
            approvalWorkflow: {
                ...confirm.approvalWorkflow,
                steps: updatedSteps
            }
        });
        return this.entityToData(updated);
    }
    /**
     * 拒绝确认
     */
    async rejectConfirm(confirmId, approverId, reason) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        if (!confirm.canReject(approverId)) {
            throw new Error(`User ${approverId} cannot reject this confirmation`);
        }
        // 更新审批步骤
        const updatedSteps = confirm.approvalWorkflow.steps.map(step => {
            if (step.approver.userId === approverId && step.status === 'pending') {
                return {
                    ...step,
                    status: 'rejected',
                    decision: {
                        outcome: 'reject',
                        comments: reason,
                        timestamp: new Date()
                    }
                };
            }
            return step;
        });
        // 更新确认状态为拒绝
        const updated = await this.repository.update(confirmId, {
            status: 'rejected',
            approvalWorkflow: {
                ...confirm.approvalWorkflow,
                steps: updatedSteps
            }
        });
        return this.entityToData(updated);
    }
    /**
     * 委派确认
     */
    async delegateConfirm(confirmId, fromApproverId, toApproverId, reason) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        if (!confirm.canDelegate(fromApproverId)) {
            throw new Error(`User ${fromApproverId} cannot delegate this confirmation`);
        }
        // 更新审批步骤
        const updatedSteps = confirm.approvalWorkflow.steps.map(step => {
            if (step.approver.userId === fromApproverId && step.status === 'pending') {
                return {
                    ...step,
                    status: 'delegated',
                    approver: {
                        ...step.approver,
                        userId: toApproverId
                    },
                    decision: {
                        outcome: 'delegate',
                        comments: reason,
                        timestamp: new Date()
                    }
                };
            }
            return step;
        });
        // 更新确认
        const updated = await this.repository.update(confirmId, {
            approvalWorkflow: {
                ...confirm.approvalWorkflow,
                steps: updatedSteps
            }
        });
        return this.entityToData(updated);
    }
    /**
     * 升级确认
     */
    async escalateConfirm(confirmId, _reason) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        // TODO: 实现升级逻辑
        // 这里应该根据升级规则找到下一级审批者
        const updated = await this.repository.update(confirmId, {
            status: 'in_review'
        });
        return this.entityToData(updated);
    }
    /**
     * 更新确认
     */
    async updateConfirm(confirmId, updates) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        // 转换更新请求为实体更新格式
        const entityUpdates = {};
        if (updates.confirmationType) {
            entityUpdates.confirmationType = updates.confirmationType;
        }
        if (updates.priority) {
            entityUpdates.priority = updates.priority;
        }
        if (updates.status) {
            entityUpdates.status = updates.status;
        }
        const updated = await this.repository.update(confirmId, entityUpdates);
        return this.entityToData(updated);
    }
    /**
     * 删除确认
     */
    async deleteConfirm(confirmId) {
        const exists = await this.repository.exists(confirmId);
        if (!exists) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        await this.repository.delete(confirmId);
    }
    /**
     * 获取确认
     */
    async getConfirm(confirmId) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        return this.entityToData(confirm);
    }
    /**
     * 列出确认
     */
    async listConfirms(pagination) {
        const result = await this.repository.findAll(pagination);
        return {
            ...result,
            items: result.items.map(item => this.entityToData(item))
        };
    }
    /**
     * 查询确认
     */
    async queryConfirms(filter, pagination) {
        const result = await this.repository.findByFilter(filter, pagination);
        return {
            ...result,
            items: result.items.map(item => this.entityToData(item))
        };
    }
    /**
     * 获取统计信息
     */
    async getStatistics() {
        return await this.repository.getStatistics();
    }
    /**
     * 实体转换为数据对象
     */
    entityToData(entity) {
        return {
            protocolVersion: entity.protocolVersion,
            timestamp: entity.timestamp,
            confirmId: entity.confirmId,
            contextId: entity.contextId,
            planId: entity.planId,
            confirmationType: entity.confirmationType,
            status: entity.status,
            priority: entity.priority,
            requester: entity.requester,
            approvalWorkflow: entity.approvalWorkflow,
            subject: entity.subject,
            riskAssessment: entity.riskAssessment
        };
    }
    /**
     * 生成UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    // ===== MPLP CONFIRM COORDINATION RESERVED INTERFACES =====
    // Embody Confirm module as "Enterprise Approval Workflow Coordinator" core positioning
    // Parameters use underscore prefix, waiting for CoreOrchestrator activation
    /**
     * Core coordination interfaces (4 deep integration modules)
     * These are the most critical cross-module coordination capabilities
     */
    /**
     * Validate confirm coordination permission - Role module coordination
     * @param _userId - User requesting coordination access
     * @param _confirmId - Target confirmation for coordination
     * @param _coordinationContext - Coordination context data
     * @returns Promise<boolean> - Whether coordination is permitted
     */
    async validateConfirmCoordinationPermission(_userId, _confirmId, _coordinationContext) {
        // TODO: Wait for CoreOrchestrator activation Role module coordination permission validation
        // Integration with security cross-cutting concern
        // const securityValidation = await this.securityManager.validateCrossModuleAccess(...);
        // Temporary implementation: Allow all coordination operations
        return true;
    }
    /**
     * Get confirm coordination context - Context module coordination environment
     * @param _contextId - Associated context ID
     * @param _confirmType - Type of confirmation for context retrieval
     * @returns Promise<Record<string, unknown>> - Coordination context data
     */
    async getConfirmCoordinationContext(_contextId, _confirmType) {
        // TODO: Wait for CoreOrchestrator activation Context module coordination environment retrieval
        // Integration with coordination cross-cutting concern
        // const coordinationContext = await this.coordinationManager.getCrossModuleContext(...);
        // Temporary implementation: Return basic context
        return {
            contextId: _contextId,
            confirmType: _confirmType,
            coordinationMode: 'confirm_coordination',
            timestamp: new Date().toISOString(),
            coordinationLevel: 'standard'
        };
    }
    /**
     * Record confirm coordination metrics - Trace module coordination monitoring
     * @param _confirmId - Confirmation ID for metrics recording
     * @param _metrics - Coordination metrics data
     * @returns Promise<void> - Metrics recording completion
     */
    async recordConfirmCoordinationMetrics(_confirmId, _metrics) {
        // TODO: Wait for CoreOrchestrator activation Trace module coordination monitoring recording
        // Integration with performance cross-cutting concern
        // await this.performanceMonitor.recordCrossModuleMetrics(...);
        // Temporary implementation: Log to console (should send to Trace module)
        // console.log(`Confirm coordination metrics recorded for ${_confirmId}:`, _metrics);
    }
    /**
     * Manage confirm extension coordination - Extension module coordination management
     * @param _confirmId - Confirmation ID for extension coordination
     * @param _extensions - Extension coordination data
     * @returns Promise<boolean> - Whether extension coordination succeeded
     */
    async manageConfirmExtensionCoordination(_confirmId, _extensions) {
        // TODO: Wait for CoreOrchestrator activation Extension module coordination management
        // Integration with orchestration cross-cutting concern
        // const orchestrationResult = await this.orchestrationManager.coordinateExtensions(...);
        // Temporary implementation: Allow all extension coordination
        return true;
    }
    /**
     * Extended coordination interfaces (4 additional modules)
     * These provide broader ecosystem integration capabilities
     */
    /**
     * Request confirm plan coordination - Plan module planning coordination
     * @param _planId - Plan ID for confirmation coordination
     * @param _confirmConfig - Confirmation configuration for planning
     * @returns Promise<boolean> - Whether plan coordination was successful
     */
    async requestConfirmPlanCoordination(_planId, _confirmConfig) {
        // TODO: Wait for CoreOrchestrator activation Plan module planning coordination
        // Integration with event bus cross-cutting concern
        // await this.eventBusManager.publish({...});
        // Temporary implementation: Allow all plan coordination
        return true;
    }
    /**
     * Coordinate collaborative confirm management - Collab module collaboration coordination
     * @param _collabId - Collaboration ID for confirm management
     * @param _confirmConfig - Confirmation configuration for collaboration
     * @returns Promise<boolean> - Whether collaboration coordination succeeded
     */
    async coordinateCollabConfirmManagement(_collabId, _confirmConfig) {
        // TODO: Wait for CoreOrchestrator activation Collab module collaboration coordination
        // Integration with state sync cross-cutting concern
        // await this.stateSyncManager.syncState(...);
        // Temporary implementation: Allow all collaboration coordination
        return true;
    }
    /**
     * Enable dialog-driven confirm coordination - Dialog module conversation coordination
     * @param _dialogId - Dialog ID for confirm coordination
     * @param _confirmParticipants - Confirmation participants for dialog coordination
     * @returns Promise<boolean> - Whether dialog coordination succeeded
     */
    async enableDialogDrivenConfirmCoordination(_dialogId, _confirmParticipants) {
        // TODO: Wait for CoreOrchestrator activation Dialog module conversation coordination
        // Integration with event bus cross-cutting concern
        // await this.eventBusManager.publish({...});
        // Temporary implementation: Allow all dialog coordination
        return true;
    }
    /**
     * Coordinate confirm across network - Network module distributed coordination
     * @param _networkId - Network ID for confirm coordination
     * @param _confirmConfig - Confirmation configuration for network coordination
     * @returns Promise<boolean> - Whether network coordination succeeded
     */
    async coordinateConfirmAcrossNetwork(_networkId, _confirmConfig) {
        // TODO: Wait for CoreOrchestrator activation Network module distributed coordination
        // Integration with transaction cross-cutting concern
        // const distributedTransaction = await this.transactionManager.beginDistributedTransaction(...);
        // Temporary implementation: Allow all network coordination
        return true;
    }
}
exports.ConfirmManagementService = ConfirmManagementService;
//# sourceMappingURL=confirm-management.service.js.map