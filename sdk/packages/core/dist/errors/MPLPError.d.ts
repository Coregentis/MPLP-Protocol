/**
 * MPLP Error Base Class
 *
 * Base error class for all MPLP SDK errors.
 * Provides common error handling functionality and error categorization.
 */
export declare class MPLPError extends Error {
    readonly code: string;
    readonly cause?: Error;
    readonly timestamp: Date;
    constructor(message: string, code?: string, cause?: Error);
    /**
     * Returns a JSON representation of the error
     */
    toJSON(): Record<string, any>;
    /**
     * Returns a string representation of the error
     */
    toString(): string;
}
//# sourceMappingURL=MPLPError.d.ts.map