"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAEL = void 0;
/**
 * InMemoryAEL
 *
 * Reference implementation used for tests and examples.
 * It does NOT call any real external systems.
 */
class InMemoryAEL {
    async executeAction(params) {
        // For now, simply echo the input as output.
        return {
            output: params.input,
            events: []
        };
    }
}
exports.InMemoryAEL = InMemoryAEL;
