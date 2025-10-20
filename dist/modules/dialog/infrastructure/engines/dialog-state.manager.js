"use strict";
/**
 * Dialog State Manager Implementation
 * @description 对话状态管理器实现 - 按指南第80行要求
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogStateManager = void 0;
/**
 * 对话状态管理器实现
 * 职责：管理对话状态、状态转换、状态验证
 */
class DialogStateManager {
    constructor() {
        this.states = new Map();
        this.stateHistory = new Map();
    }
    /**
     * 初始化对话状态
     * @param dialogId 对话ID
     * @param initialState 初始状态
     */
    async initializeState(dialogId, initialState) {
        const defaultState = {
            status: 'active',
            messageCount: 0,
            lastActivity: new Date().toISOString(),
            participants: [],
            context: {},
            flags: {},
            ...initialState
        };
        this.states.set(dialogId, defaultState);
        this.recordStateHistory(dialogId, defaultState);
    }
    /**
     * 更新对话状态
     * @param dialogId 对话ID
     * @param message 消息
     * @param currentState 当前状态
     * @returns 新状态
     */
    async updateState(dialogId, message, currentState) {
        // 验证状态转换
        const isValidTransition = await this.validateStateTransition(currentState, { message });
        if (!isValidTransition) {
            throw new Error(`Invalid state transition for dialog ${dialogId}`);
        }
        // 计算新状态
        const newState = await this.calculateNewState(currentState, message);
        // 更新状态
        this.states.set(dialogId, newState);
        this.recordStateHistory(dialogId, newState);
        return newState;
    }
    /**
     * 获取对话状态
     * @param dialogId 对话ID
     * @returns 对话状态
     */
    async getState(dialogId) {
        const state = this.states.get(dialogId);
        if (!state) {
            throw new Error(`State not found for dialog ${dialogId}`);
        }
        return { ...state }; // 返回副本
    }
    /**
     * 验证状态转换
     * @param currentState 当前状态
     * @param newState 新状态
     * @returns 是否有效
     */
    async validateStateTransition(currentState, newState) {
        const currentStatus = currentState.status;
        const newStatus = newState.status;
        // 如果没有状态变更，允许
        if (!newStatus || currentStatus === newStatus) {
            return true;
        }
        // 定义有效的状态转换
        const validTransitions = {
            'active': ['paused', 'completed', 'cancelled', 'error'],
            'paused': ['active', 'completed', 'cancelled'],
            'completed': [], // 完成状态不能转换
            'cancelled': [], // 取消状态不能转换
            'error': ['active', 'cancelled'] // 错误状态可以恢复或取消
        };
        const allowedTransitions = validTransitions[currentStatus] || [];
        return allowedTransitions.includes(newStatus);
    }
    // ===== 私有方法 =====
    async calculateNewState(currentState, message) {
        const newState = { ...currentState };
        // 更新基本信息
        newState.messageCount = (currentState.messageCount || 0) + 1;
        newState.lastActivity = new Date().toISOString();
        newState.lastMessageId = message.messageId;
        newState.lastSenderId = message.senderId;
        // 更新参与者列表
        const participants = currentState.participants || [];
        if (!participants.includes(message.senderId)) {
            newState.participants = [...participants, message.senderId];
        }
        // 更新上下文信息
        const context = currentState.context || {};
        newState.context = {
            ...context,
            lastMessageType: message.type,
            lastMessageLength: message.content.length,
            hasQuestion: message.content.includes('?'),
            hasCommand: message.content.startsWith('/'),
            sentiment: await this.analyzeSentiment(message.content)
        };
        // 更新标志
        const flags = currentState.flags || {};
        newState.flags = {
            ...flags,
            hasRecentActivity: true,
            needsResponse: this.needsResponse(message),
            isInteractive: this.isInteractiveMessage(message),
            complexityLevel: this.calculateComplexity(message)
        };
        // 检查是否需要状态转换
        if (this.shouldCompleteDialog(newState)) {
            newState.status = 'completed';
            newState.completedAt = new Date().toISOString();
        }
        else if (this.shouldPauseDialog(newState)) {
            newState.status = 'paused';
            newState.pausedAt = new Date().toISOString();
        }
        return newState;
    }
    recordStateHistory(dialogId, state) {
        const history = this.stateHistory.get(dialogId) || [];
        history.push({
            state: { ...state },
            timestamp: new Date().toISOString()
        });
        // 保留最近100个状态记录
        if (history.length > 100) {
            history.shift();
        }
        this.stateHistory.set(dialogId, history);
    }
    async analyzeSentiment(content) {
        // 简单的情感分析
        const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'like'];
        const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'angry', 'sad'];
        const lowerContent = content.toLowerCase();
        const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
        const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
        if (positiveCount > negativeCount)
            return 'positive';
        if (negativeCount > positiveCount)
            return 'negative';
        return 'neutral';
    }
    needsResponse(message) {
        return message.content.includes('?') ||
            message.content.toLowerCase().includes('help') ||
            message.type === 'question';
    }
    isInteractiveMessage(message) {
        return message.type === 'question' ||
            message.content.includes('?') ||
            message.content.startsWith('/');
    }
    calculateComplexity(message) {
        const length = message.content.length;
        const wordCount = message.content.split(' ').length;
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(message.content);
        if (length > 500 || wordCount > 100 || hasSpecialChars) {
            return 'high';
        }
        else if (length > 100 || wordCount > 20) {
            return 'medium';
        }
        else {
            return 'low';
        }
    }
    shouldCompleteDialog(state) {
        const messageCount = state.messageCount;
        const context = state.context;
        // 简单的完成条件
        return messageCount > 50 ||
            (Boolean(context?.hasCommand) && (context?.lastMessageType === 'command'));
    }
    shouldPauseDialog(state) {
        const lastActivity = new Date(state.lastActivity);
        const now = new Date();
        const inactiveMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
        // 如果超过30分钟无活动，考虑暂停
        return inactiveMinutes > 30;
    }
    /**
     * 获取状态历史
     * @param dialogId 对话ID
     * @param limit 限制数量
     * @returns 状态历史
     */
    async getStateHistory(dialogId, limit = 10) {
        const history = this.stateHistory.get(dialogId) || [];
        return history.slice(-limit);
    }
    /**
     * 清理过期状态
     * @param maxAge 最大年龄（毫秒）
     */
    async cleanupExpiredStates(maxAge = 24 * 60 * 60 * 1000) {
        const now = Date.now();
        const expiredDialogs = [];
        for (const [dialogId, state] of this.states.entries()) {
            const lastActivity = new Date(state.lastActivity).getTime();
            if (now - lastActivity > maxAge) {
                expiredDialogs.push(dialogId);
            }
        }
        // 清理过期状态
        for (const dialogId of expiredDialogs) {
            this.states.delete(dialogId);
            this.stateHistory.delete(dialogId);
        }
    }
    /**
     * 重置对话状态
     * @param dialogId 对话ID
     * @param newState 新状态
     */
    async resetState(dialogId, newState) {
        await this.initializeState(dialogId, newState);
    }
}
exports.DialogStateManager = DialogStateManager;
//# sourceMappingURL=dialog-state.manager.js.map