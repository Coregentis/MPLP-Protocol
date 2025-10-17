"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogStateManager = void 0;
class DialogStateManager {
    states = new Map();
    stateHistory = new Map();
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
    async updateState(dialogId, message, currentState) {
        const isValidTransition = await this.validateStateTransition(currentState, { message });
        if (!isValidTransition) {
            throw new Error(`Invalid state transition for dialog ${dialogId}`);
        }
        const newState = await this.calculateNewState(currentState, message);
        this.states.set(dialogId, newState);
        this.recordStateHistory(dialogId, newState);
        return newState;
    }
    async getState(dialogId) {
        const state = this.states.get(dialogId);
        if (!state) {
            throw new Error(`State not found for dialog ${dialogId}`);
        }
        return { ...state };
    }
    async validateStateTransition(currentState, newState) {
        const currentStatus = currentState.status;
        const newStatus = newState.status;
        if (!newStatus || currentStatus === newStatus) {
            return true;
        }
        const validTransitions = {
            'active': ['paused', 'completed', 'cancelled', 'error'],
            'paused': ['active', 'completed', 'cancelled'],
            'completed': [],
            'cancelled': [],
            'error': ['active', 'cancelled']
        };
        const allowedTransitions = validTransitions[currentStatus] || [];
        return allowedTransitions.includes(newStatus);
    }
    async calculateNewState(currentState, message) {
        const newState = { ...currentState };
        newState.messageCount = (currentState.messageCount || 0) + 1;
        newState.lastActivity = new Date().toISOString();
        newState.lastMessageId = message.messageId;
        newState.lastSenderId = message.senderId;
        const participants = currentState.participants || [];
        if (!participants.includes(message.senderId)) {
            newState.participants = [...participants, message.senderId];
        }
        const context = currentState.context || {};
        newState.context = {
            ...context,
            lastMessageType: message.type,
            lastMessageLength: message.content.length,
            hasQuestion: message.content.includes('?'),
            hasCommand: message.content.startsWith('/'),
            sentiment: await this.analyzeSentiment(message.content)
        };
        const flags = currentState.flags || {};
        newState.flags = {
            ...flags,
            hasRecentActivity: true,
            needsResponse: this.needsResponse(message),
            isInteractive: this.isInteractiveMessage(message),
            complexityLevel: this.calculateComplexity(message)
        };
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
        if (history.length > 100) {
            history.shift();
        }
        this.stateHistory.set(dialogId, history);
    }
    async analyzeSentiment(content) {
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
        return messageCount > 50 ||
            (Boolean(context?.hasCommand) && (context?.lastMessageType === 'command'));
    }
    shouldPauseDialog(state) {
        const lastActivity = new Date(state.lastActivity);
        const now = new Date();
        const inactiveMinutes = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
        return inactiveMinutes > 30;
    }
    async getStateHistory(dialogId, limit = 10) {
        const history = this.stateHistory.get(dialogId) || [];
        return history.slice(-limit);
    }
    async cleanupExpiredStates(maxAge = 24 * 60 * 60 * 1000) {
        const now = Date.now();
        const expiredDialogs = [];
        for (const [dialogId, state] of this.states.entries()) {
            const lastActivity = new Date(state.lastActivity).getTime();
            if (now - lastActivity > maxAge) {
                expiredDialogs.push(dialogId);
            }
        }
        for (const dialogId of expiredDialogs) {
            this.states.delete(dialogId);
            this.stateHistory.delete(dialogId);
        }
    }
    async resetState(dialogId, newState) {
        await this.initializeState(dialogId, newState);
    }
}
exports.DialogStateManager = DialogStateManager;
