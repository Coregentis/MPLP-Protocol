"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmManagementService = void 0;
const confirm_entity_1 = require("../../domain/entities/confirm.entity");
class ConfirmManagementService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async createConfirm(request) {
        const confirmId = this.generateUUID();
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
        const saved = await this.repository.create(confirm);
        return this.entityToData(saved);
    }
    async approveConfirm(confirmId, approverId, comments) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        if (!confirm.canApprove(approverId)) {
            throw new Error(`User ${approverId} cannot approve this confirmation`);
        }
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
        const allRequiredApproved = updatedSteps
            .filter(step => step.approver.isRequired)
            .every(step => step.status === 'approved');
        const newStatus = allRequiredApproved ? 'approved' : 'in_review';
        const updated = await this.repository.update(confirmId, {
            status: newStatus,
            approvalWorkflow: {
                ...confirm.approvalWorkflow,
                steps: updatedSteps
            }
        });
        return this.entityToData(updated);
    }
    async rejectConfirm(confirmId, approverId, reason) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        if (!confirm.canReject(approverId)) {
            throw new Error(`User ${approverId} cannot reject this confirmation`);
        }
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
        const updated = await this.repository.update(confirmId, {
            status: 'rejected',
            approvalWorkflow: {
                ...confirm.approvalWorkflow,
                steps: updatedSteps
            }
        });
        return this.entityToData(updated);
    }
    async delegateConfirm(confirmId, fromApproverId, toApproverId, reason) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        if (!confirm.canDelegate(fromApproverId)) {
            throw new Error(`User ${fromApproverId} cannot delegate this confirmation`);
        }
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
        const updated = await this.repository.update(confirmId, {
            approvalWorkflow: {
                ...confirm.approvalWorkflow,
                steps: updatedSteps
            }
        });
        return this.entityToData(updated);
    }
    async escalateConfirm(confirmId, _reason) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        const updated = await this.repository.update(confirmId, {
            status: 'in_review'
        });
        return this.entityToData(updated);
    }
    async updateConfirm(confirmId, updates) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
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
    async deleteConfirm(confirmId) {
        const exists = await this.repository.exists(confirmId);
        if (!exists) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        await this.repository.delete(confirmId);
    }
    async getConfirm(confirmId) {
        const confirm = await this.repository.findById(confirmId);
        if (!confirm) {
            throw new Error(`Confirm with ID ${confirmId} not found`);
        }
        return this.entityToData(confirm);
    }
    async listConfirms(pagination) {
        const result = await this.repository.findAll(pagination);
        return {
            ...result,
            items: result.items.map(item => this.entityToData(item))
        };
    }
    async queryConfirms(filter, pagination) {
        const result = await this.repository.findByFilter(filter, pagination);
        return {
            ...result,
            items: result.items.map(item => this.entityToData(item))
        };
    }
    async getStatistics() {
        return await this.repository.getStatistics();
    }
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
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    async validateConfirmCoordinationPermission(_userId, _confirmId, _coordinationContext) {
        return true;
    }
    async getConfirmCoordinationContext(_contextId, _confirmType) {
        return {
            contextId: _contextId,
            confirmType: _confirmType,
            coordinationMode: 'confirm_coordination',
            timestamp: new Date().toISOString(),
            coordinationLevel: 'standard'
        };
    }
    async recordConfirmCoordinationMetrics(_confirmId, _metrics) {
    }
    async manageConfirmExtensionCoordination(_confirmId, _extensions) {
        return true;
    }
    async requestConfirmPlanCoordination(_planId, _confirmConfig) {
        return true;
    }
    async coordinateCollabConfirmManagement(_collabId, _confirmConfig) {
        return true;
    }
    async enableDialogDrivenConfirmCoordination(_dialogId, _confirmParticipants) {
        return true;
    }
    async coordinateConfirmAcrossNetwork(_networkId, _confirmConfig) {
        return true;
    }
}
exports.ConfirmManagementService = ConfirmManagementService;
