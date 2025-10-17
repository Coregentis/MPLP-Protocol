"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmEntity = void 0;
class ConfirmEntity {
    protocolVersion;
    timestamp;
    confirmId;
    contextId;
    planId;
    confirmationType;
    status;
    priority;
    requester;
    approvalWorkflow;
    subject;
    riskAssessment;
    approvals;
    auditTrail;
    notifications;
    integrations;
    constructor(data) {
        this.protocolVersion = data.protocolVersion;
        this.timestamp = data.timestamp;
        this.confirmId = data.confirmId;
        this.contextId = data.contextId;
        this.planId = data.planId;
        this.confirmationType = data.confirmationType;
        this.status = data.status;
        this.priority = data.priority;
        this.requester = data.requester;
        this.approvalWorkflow = data.approvalWorkflow;
        this.subject = data.subject;
        this.riskAssessment = data.riskAssessment;
        this.approvals = data.approvals || [];
        this.auditTrail = data.auditTrail || [];
        this.notifications = data.notifications || {
            channels: [],
            recipients: [],
            templates: {
                pending: 'default-pending-template',
                approved: 'default-approved-template',
                rejected: 'default-rejected-template'
            }
        };
        this.integrations = data.integrations || {
            externalSystems: [],
            webhooks: []
        };
        this.validate();
    }
    validate() {
        if (!this.confirmId) {
            throw new Error('Confirm ID is required');
        }
        if (!this.contextId) {
            throw new Error('Context ID is required');
        }
        if (!this.subject.title) {
            throw new Error('Subject title is required');
        }
        if (!this.requester.userId) {
            throw new Error('Requester user ID is required');
        }
        if (this.approvalWorkflow.steps && this.approvalWorkflow.steps.length === 0 && process.env.NODE_ENV === 'production') {
            throw new Error('At least one approval step is required');
        }
    }
    canApprove(userId) {
        if (this.status !== 'pending' && this.status !== 'in_review') {
            return false;
        }
        return this.approvalWorkflow.steps.some(step => step.approver.userId === userId && step.status === 'pending');
    }
    canReject(userId) {
        return this.canApprove(userId);
    }
    canDelegate(userId) {
        if (this.status !== 'pending' && this.status !== 'in_review') {
            return false;
        }
        return this.approvalWorkflow.steps.some(step => step.approver.userId === userId &&
            step.status === 'pending' &&
            step.approver.delegationAllowed === true);
    }
    getCurrentStep() {
        return this.approvalWorkflow.steps.find(step => step.status === 'pending') || null;
    }
    getCompletedStepsCount() {
        return this.approvalWorkflow.steps.filter(step => step.status === 'approved' || step.status === 'rejected').length;
    }
    areAllRequiredStepsCompleted() {
        const requiredSteps = this.approvalWorkflow.steps.filter(step => step.approver.isRequired);
        return requiredSteps.every(step => step.status === 'approved');
    }
    updateTimestamp() {
        this.timestamp = new Date();
    }
    addApproval(approval) {
        this.approvals.push(approval);
        this.updateTimestamp();
    }
    updateStatus(newStatus) {
        if (this.status === 'approved' && newStatus === 'pending') {
            throw new Error('Invalid status transition');
        }
        if (this.status === 'rejected' && newStatus === 'pending') {
            throw new Error('Invalid status transition');
        }
        Object.assign(this, { status: newStatus });
        this.updateTimestamp();
    }
    addAuditEvent(auditEvent) {
        this.auditTrail.push(auditEvent);
    }
    getCurrentApprovalCount() {
        return this.approvals ? this.approvals.length : 0;
    }
    toEntityData() {
        return {
            protocolVersion: this.protocolVersion,
            timestamp: this.timestamp,
            confirmId: this.confirmId,
            contextId: this.contextId,
            planId: this.planId,
            confirmationType: this.confirmationType,
            status: this.status,
            priority: this.priority,
            requester: this.requester,
            subject: this.subject,
            riskAssessment: this.riskAssessment,
            approvalWorkflow: this.approvalWorkflow,
            approvals: this.approvals,
            auditTrail: this.auditTrail,
            notifications: this.notifications,
            integrations: this.integrations
        };
    }
}
exports.ConfirmEntity = ConfirmEntity;
