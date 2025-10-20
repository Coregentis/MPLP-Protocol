/**
 * Dialog State Manager Implementation
 * @description 对话状态管理器实现 - 按指南第80行要求
 * @version 1.0.0
 */
import { IDialogStateManager, DialogMessage, UUID } from '../../types';
/**
 * 对话状态管理器实现
 * 职责：管理对话状态、状态转换、状态验证
 */
export declare class DialogStateManager implements IDialogStateManager {
    private states;
    private stateHistory;
    /**
     * 初始化对话状态
     * @param dialogId 对话ID
     * @param initialState 初始状态
     */
    initializeState(dialogId: UUID, initialState?: Record<string, unknown>): Promise<void>;
    /**
     * 更新对话状态
     * @param dialogId 对话ID
     * @param message 消息
     * @param currentState 当前状态
     * @returns 新状态
     */
    updateState(dialogId: UUID, message: DialogMessage, currentState: Record<string, unknown>): Promise<Record<string, unknown>>;
    /**
     * 获取对话状态
     * @param dialogId 对话ID
     * @returns 对话状态
     */
    getState(dialogId: UUID): Promise<Record<string, unknown>>;
    /**
     * 验证状态转换
     * @param currentState 当前状态
     * @param newState 新状态
     * @returns 是否有效
     */
    validateStateTransition(currentState: Record<string, unknown>, newState: Record<string, unknown>): Promise<boolean>;
    private calculateNewState;
    private recordStateHistory;
    private analyzeSentiment;
    private needsResponse;
    private isInteractiveMessage;
    private calculateComplexity;
    private shouldCompleteDialog;
    private shouldPauseDialog;
    /**
     * 获取状态历史
     * @param dialogId 对话ID
     * @param limit 限制数量
     * @returns 状态历史
     */
    getStateHistory(dialogId: UUID, limit?: number): Promise<Array<{
        state: Record<string, unknown>;
        timestamp: string;
    }>>;
    /**
     * 清理过期状态
     * @param maxAge 最大年龄（毫秒）
     */
    cleanupExpiredStates(maxAge?: number): Promise<void>;
    /**
     * 重置对话状态
     * @param dialogId 对话ID
     * @param newState 新状态
     */
    resetState(dialogId: UUID, newState?: Record<string, unknown>): Promise<void>;
}
//# sourceMappingURL=dialog-state.manager.d.ts.map