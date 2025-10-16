/**
 * MPLP Error Base Class
 *
 * Base error class for all MPLP SDK errors.
 * Provides common error handling functionality and error categorization.
 */
export class MPLPError extends Error {
  public readonly code: string;
  public readonly cause?: Error;
  public readonly timestamp: Date;

  constructor(message: string, code: string = 'MPLP_ERROR', cause?: Error) {
    super(message);

    this.name = 'MPLPError';
    this.code = code;
    this.cause = cause;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MPLPError);
    }
  }

  /**
   * Returns a JSON representation of the error
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause: this.cause
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : undefined,
    };
  }

  /**
   * Returns a string representation of the error
   */
  override toString(): string {
    let result = `${this.name}: ${this.message} (${this.code})`;

    if (this.cause) {
      result += `\nCaused by: ${this.cause.toString()}`;
    }

    return result;
  }
}
