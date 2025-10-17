"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogFlowEngine = void 0;
class DialogFlowEngine {
    flows = new Map();
    flowTemplates = new Map();
    constructor() {
        this.initializeDefaultTemplates();
    }
    async initializeFlow(dialogId, flowTemplate) {
        const template = flowTemplate || 'default';
        const steps = this.flowTemplates.get(template) || this.getDefaultSteps();
        const flow = {
            flowId: this.generateFlowId(),
            dialogId,
            template,
            currentStep: steps[0]?.stepId || 'initial',
            steps,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.flows.set(flow.flowId, flow);
        return flow;
    }
    async executeStep(flowId, currentStep, message) {
        const flow = this.flows.get(flowId);
        if (!flow) {
            return {
                success: false,
                nextStep: currentStep,
                errors: [`Flow ${flowId} not found`]
            };
        }
        const step = flow.steps.find(s => s.stepId === currentStep);
        if (!step) {
            return {
                success: false,
                nextStep: currentStep,
                errors: [`Step ${currentStep} not found in flow`]
            };
        }
        try {
            const result = await this.processStep(step, message, flow);
            flow.currentStep = result.nextStep;
            flow.updatedAt = new Date().toISOString();
            if (this.isFlowCompleted(flow, result.nextStep)) {
                flow.status = 'completed';
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                nextStep: currentStep,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getFlowStatus(flowId) {
        const flow = this.flows.get(flowId);
        if (!flow) {
            throw new Error(`Flow ${flowId} not found`);
        }
        const progress = this.calculateProgress(flow);
        return {
            flowId,
            status: flow.status,
            currentStep: flow.currentStep,
            progress,
            startTime: flow.createdAt,
            lastActivity: flow.updatedAt
        };
    }
    async updateFlowStep(flowId, newStep) {
        const flow = this.flows.get(flowId);
        if (!flow) {
            throw new Error(`Flow ${flowId} not found`);
        }
        const stepExists = flow.steps.some(s => s.stepId === newStep);
        if (!stepExists) {
            throw new Error(`Step ${newStep} not found in flow`);
        }
        flow.currentStep = newStep;
        flow.updatedAt = new Date().toISOString();
    }
    initializeDefaultTemplates() {
        this.flowTemplates.set('default', [
            {
                stepId: 'initial',
                name: 'Initial Step',
                type: 'input',
                nextSteps: ['process']
            },
            {
                stepId: 'process',
                name: 'Process Message',
                type: 'process',
                nextSteps: ['decision']
            },
            {
                stepId: 'decision',
                name: 'Decision Point',
                type: 'decision',
                conditions: { requiresResponse: true },
                nextSteps: ['output', 'complete']
            },
            {
                stepId: 'output',
                name: 'Generate Output',
                type: 'output',
                nextSteps: ['process', 'complete']
            },
            {
                stepId: 'complete',
                name: 'Complete Dialog',
                type: 'output',
                nextSteps: []
            }
        ]);
        this.flowTemplates.set('qa', [
            {
                stepId: 'question',
                name: 'Receive Question',
                type: 'input',
                nextSteps: ['analyze']
            },
            {
                stepId: 'analyze',
                name: 'Analyze Question',
                type: 'process',
                nextSteps: ['answer']
            },
            {
                stepId: 'answer',
                name: 'Provide Answer',
                type: 'output',
                nextSteps: ['followup', 'complete']
            },
            {
                stepId: 'followup',
                name: 'Handle Follow-up',
                type: 'decision',
                nextSteps: ['question', 'complete']
            },
            {
                stepId: 'complete',
                name: 'Complete Q&A',
                type: 'output',
                nextSteps: []
            }
        ]);
    }
    async processStep(step, message, flow) {
        switch (step.type) {
            case 'input':
                return this.processInputStep(step, message);
            case 'process':
                return this.processProcessStep(step, message);
            case 'decision':
                return this.processDecisionStep(step, message, flow);
            case 'output':
                return this.processOutputStep(step, message);
            default:
                return {
                    success: false,
                    nextStep: step.stepId,
                    errors: [`Unknown step type: ${step.type}`]
                };
        }
    }
    async processInputStep(step, _message) {
        const nextStep = step.nextSteps?.[0] || 'complete';
        return {
            success: true,
            nextStep,
            suggestions: ['Message received and processed'],
            metadata: { stepType: 'input', processed: true }
        };
    }
    async processProcessStep(step, message) {
        const nextStep = step.nextSteps?.[0] || 'complete';
        return {
            success: true,
            nextStep,
            suggestions: [`Processed message: ${message.content.substring(0, 50)}...`],
            metadata: { stepType: 'process', messageLength: message.content.length }
        };
    }
    async processDecisionStep(step, message, _flow) {
        const conditions = step.conditions || {};
        let nextStep = step.nextSteps?.[0] || 'complete';
        if (conditions.requiresResponse && message.content.includes('?')) {
            nextStep = step.nextSteps?.[0] || 'output';
        }
        else {
            nextStep = step.nextSteps?.[1] || 'complete';
        }
        return {
            success: true,
            nextStep,
            suggestions: ['Decision made based on message content'],
            metadata: { stepType: 'decision', decision: nextStep }
        };
    }
    async processOutputStep(step, _message) {
        const nextStep = step.nextSteps?.[0] || 'complete';
        return {
            success: true,
            nextStep,
            suggestions: ['Output generated successfully'],
            metadata: { stepType: 'output', generated: true }
        };
    }
    isFlowCompleted(flow, currentStep) {
        const step = flow.steps.find(s => s.stepId === currentStep);
        return step?.stepId === 'complete' || (step?.nextSteps?.length || 0) === 0;
    }
    calculateProgress(flow) {
        const totalSteps = flow.steps.length;
        const currentIndex = flow.steps.findIndex(s => s.stepId === flow.currentStep);
        if (currentIndex === -1)
            return 0;
        return Math.round(((currentIndex + 1) / totalSteps) * 100);
    }
    generateFlowId() {
        return `flow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    getDefaultSteps() {
        return this.flowTemplates.get('default') || [];
    }
}
exports.DialogFlowEngine = DialogFlowEngine;
