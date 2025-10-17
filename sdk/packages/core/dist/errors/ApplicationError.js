"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationError = void 0;
const MPLPError_1 = require("./MPLPError");
/**
 * Application Error
 *
 * Represents errors that occur at the application level.
 * These are typically configuration, initialization, or lifecycle errors.
 */
class ApplicationError extends MPLPError_1.MPLPError {
    constructor(message, cause) {
        super(message, 'APPLICATION_ERROR', cause);
        this.name = 'ApplicationError';
    }
}
exports.ApplicationError = ApplicationError;
//# sourceMappingURL=ApplicationError.js.map