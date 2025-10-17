import { IDialogStateManager, DialogMessage, UUID } from '../../types';
export declare class DialogStateManager implements IDialogStateManager {
    private states;
    private stateHistory;
    initializeState(dialogId: UUID, initialState?: Record<string, unknown>): Promise<void>;
    updateState(dialogId: UUID, message: DialogMessage, currentState: Record<string, unknown>): Promise<Record<string, unknown>>;
    getState(dialogId: UUID): Promise<Record<string, unknown>>;
    validateStateTransition(currentState: Record<string, unknown>, newState: Record<string, unknown>): Promise<boolean>;
    private calculateNewState;
    private recordStateHistory;
    private analyzeSentiment;
    private needsResponse;
    private isInteractiveMessage;
    private calculateComplexity;
    private shouldCompleteDialog;
    private shouldPauseDialog;
    getStateHistory(dialogId: UUID, limit?: number): Promise<Array<{
        state: Record<string, unknown>;
        timestamp: string;
    }>>;
    cleanupExpiredStates(maxAge?: number): Promise<void>;
    resetState(dialogId: UUID, newState?: Record<string, unknown>): Promise<void>;
}
//# sourceMappingURL=dialog-state.manager.d.ts.map