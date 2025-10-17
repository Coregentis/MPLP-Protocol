"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLPPErrorHandler = void 0;
class MLPPErrorHandler {
    errors = [];
    async logError(level, message, source, error, metadata) {
        const mlppError = {
            id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            level,
            message,
            timestamp: new Date().toISOString(),
            source,
            stack: error?.stack,
            metadata
        };
        this.errors.push(mlppError);
        if (this.errors.length > 1000) {
            this.errors = this.errors.slice(-500);
        }
    }
    getErrors(filter) {
        if (!filter)
            return this.errors;
        return this.errors.filter(error => {
            if (filter.level && error.level !== filter.level)
                return false;
            if (filter.source && error.source !== filter.source)
                return false;
            return true;
        });
    }
    async handleUncaughtError(error, source) {
        await this.logError('fatal', error.message, source, error);
    }
    async healthCheck() {
        return true;
    }
}
exports.MLPPErrorHandler = MLPPErrorHandler;
