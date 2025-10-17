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
    setLevel(level: LogLevel): void;
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    verbose(message: string, ...args: any[]): void;
}
//# sourceMappingURL=Logger.d.ts.map