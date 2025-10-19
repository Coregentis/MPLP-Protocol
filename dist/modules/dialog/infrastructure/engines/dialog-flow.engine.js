"use strict";
/**
 * Dialog Flow Engine Implementation
 * @description 对话流程引擎实现 - 按指南第75行要求
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogFlowEngine = void 0;
/**
 * 对话流程引擎实现
 * 职责：管理对话流程、执行流程步骤、状态转换
 */
class DialogFlowEngine {
    constructor() {
        this.flows = new Map();
        this.flowTemplates = new Map();
        this.initializeDefaultTemplates();
    }
    /**
     * 初始化对话流程
     * @param dialogId 对话ID
     * @param flowTemplate 流程模板名称
     * @returns 对话流程
     */
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
    /**
     * 执行流程步骤
     * @param flowId 流程ID
     * @param currentStep 当前步骤
     * @param message 消息
     * @returns 执行结果
     */
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
            // 执行步骤逻辑
            const result = await this.processStep(step, message, flow);
            // 更新流程状态
            flow.currentStep = result.nextStep;
            flow.updatedAt = new Date().toISOString();
            // 检查是否完成
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
    /**
     * 获取流程状态
     * @param flowId 流程ID
     * @returns 流程状态
     */
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
    /**
     * 更新流程步骤
     * @param flowId 流程ID
     * @param newStep 新步骤
     */
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
    // ===== 私有方法 =====
    initializeDefaultTemplates() {
        // 默认对话流程模板
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
        // 问答流程模板
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
        // 处理输入步骤
        const nextStep = step.nextSteps?.[0] || 'complete';
        return {
            success: true,
            nextStep,
            suggestions: ['Message received and processed'],
            metadata: { stepType: 'input', processed: true }
        };
    }
    async processProcessStep(step, message) {
        // 处理消息处理步骤
        const nextStep = step.nextSteps?.[0] || 'complete';
        return {
            success: true,
            nextStep,
            suggestions: [`Processed message: ${message.content.substring(0, 50)}...`],
            metadata: { stepType: 'process', messageLength: message.content.length }
        };
    }
    async processDecisionStep(step, message, _flow) {
        // 处理决策步骤
        const conditions = step.conditions || {};
        let nextStep = step.nextSteps?.[0] || 'complete';
        // 简单的决策逻辑
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
        // 处理输出步骤
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
//# sourceMappingURL=dialog-flow.engine.js.map