/**
 * Logger
 *
 * Simple logging implementation for MPLP SDK.
 * In a production environment, this would integrate with winston or another logging library.
 */
export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
    VERBOSE = 4
}
export declare class Logger {
    private name;
    private level;
    constructor(name: string, level?: LogLevel);
    /**
     * Sets the log level
     */
    setLevel(level: LogLevel): void;
    /**
     * Logs an error message
     */
    error(message: string, ...args: any[]): void;
    /**
     * Logs a warning message
     */
    warn(message: string, ...args: any[]): void;
    /**
     * Logs an info message
     */
    info(message: string, ...args: any[]): void;
    /**
     * Logs a debug message
     */
    debug(message: string, ...args: any[]): void;
    /**
     * Logs a verbose message
     */
    verbose(message: string, ...args: any[]): void;
}
//# sourceMappingURL=Logger.d.ts.map