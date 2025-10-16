import { MPLPError } from './MPLPError';

/**
 * Module Error
 *
 * Represents errors that occur in module operations.
 * These include module loading, initialization, and lifecycle errors.
 */
export class ModuleError extends MPLPError {
  constructor(message: string, cause?: Error) {
    super(message, 'MODULE_ERROR', cause);
    this.name = 'ModuleError';
  }
}
