/**
 * 错误处理接口
 */
export interface ErrorContext {
  operation: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ErrorHandler {
  handle(error: Error, context: ErrorContext): void;
}

export interface RecoverableError {
  canRecover(): boolean;
  recover(): Promise<void>;
}
