"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleError = void 0;
const MPLPError_1 = require("./MPLPError");
/**
 * Module Error
 *
 * Represents errors that occur in module operations.
 * These include module loading, initialization, and lifecycle errors.
 */
class ModuleError extends MPLPError_1.MPLPError {
    constructor(message, cause) {
        super(message, 'MODULE_ERROR', cause);
        this.name = 'ModuleError';
    }
}
exports.ModuleError = ModuleError;
//# sourceMappingURL=ModuleError.js.map