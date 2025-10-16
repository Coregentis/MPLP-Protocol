import { MPLPError } from './MPLPError';

/**
 * Application Error
 *
 * Represents errors that occur at the application level.
 * These are typically configuration, initialization, or lifecycle errors.
 */
export class ApplicationError extends MPLPError {
  constructor(message: string, cause?: Error) {
    super(message, 'APPLICATION_ERROR', cause);
    this.name = 'ApplicationError';
  }
}
