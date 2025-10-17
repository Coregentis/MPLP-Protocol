import { IDialogFlowEngine, DialogFlow, FlowExecutionResult, FlowStatus, DialogMessage, UUID } from '../../types';
export declare class DialogFlowEngine implements IDialogFlowEngine {
    private flows;
    private flowTemplates;
    constructor();
    initializeFlow(dialogId: UUID, flowTemplate?: string): Promise<DialogFlow>;
    executeStep(flowId: string, currentStep: string, message: DialogMessage): Promise<FlowExecutionResult>;
    getFlowStatus(flowId: string): Promise<FlowStatus>;
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