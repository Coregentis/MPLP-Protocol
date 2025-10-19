/**
 * Dialog Flow Engine Implementation
 * @description 对话流程引擎实现 - 按指南第75行要求
 * @version 1.0.0
 */
import { IDialogFlowEngine, DialogFlow, FlowExecutionResult, FlowStatus, DialogMessage, UUID } from '../../types';
/**
 * 对话流程引擎实现
 * 职责：管理对话流程、执行流程步骤、状态转换
 */
export declare class DialogFlowEngine implements IDialogFlowEngine {
    private flows;
    private flowTemplates;
    constructor();
    /**
     * 初始化对话流程
     * @param dialogId 对话ID
     * @param flowTemplate 流程模板名称
     * @returns 对话流程
     */
    initializeFlow(dialogId: UUID, flowTemplate?: string): Promise<DialogFlow>;
    /**
     * 执行流程步骤
     * @param flowId 流程ID
     * @param currentStep 当前步骤
     * @param message 消息
     * @returns 执行结果
     */
    executeStep(flowId: string, currentStep: string, message: DialogMessage): Promise<FlowExecutionResult>;
    /**
     * 获取流程状态
     * @param flowId 流程ID
     * @returns 流程状态
     */
    getFlowStatus(flowId: string): Promise<FlowStatus>;
    /**
     * 更新流程步骤
     * @param flowId 流程ID
     * @param newStep 新步骤
     */
    updateFlowStep(flowId: string, newStep: string): Promise<void>;
    private initializeDefaultTemplates;
    private processStep;
    private processInputStep;
    private processProcessStep;
    private processDecisionStep;
    private processOutputStep;
    private isFlowCompleted;
    private calculateProgress;
    private generateFlowId;
    private getDefaultSteps;
}
//# sourceMappingURL=dialog-flow.engine.d.ts.map