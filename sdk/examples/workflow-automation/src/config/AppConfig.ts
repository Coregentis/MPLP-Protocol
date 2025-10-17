/**
 * @fileoverview Application configuration for workflow automation
 * @version 1.1.0-beta
 */

import { config } from 'dotenv';

// Load environment variables
config();

export interface AppConfig {
  readonly app: {
    readonly nodeEnv: string;
    readonly logLevel: string;
    readonly port: number;
  };
  readonly workflow: {
    readonly timeout: number;
    readonly maxConcurrentWorkflows: number;
    readonly retryAttempts: number;
  };
  readonly agents: {
    readonly classificationConfidenceThreshold: number;
    readonly responseGenerationTimeout: number;
    readonly escalationThreshold: number;
  };
  readonly knowledgeBase: {
    readonly url: string;
    readonly apiKey: string;
  };
  readonly notifications: {
    readonly emailServiceUrl: string;
    readonly slackWebhookUrl: string;
  };
  readonly monitoring: {
    readonly enabled: boolean;
    readonly interval: number;
    readonly healthCheckInterval: number;
  };
  readonly database: {
    readonly url: string;
  };
  readonly externalServices: {
    readonly openaiApiKey?: string | undefined;
    readonly claudeApiKey?: string | undefined;
  };
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

function getEnvNumber(name: string, defaultValue?: number): number {
  const value = process.env[name];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return parsed;
}

function getEnvBoolean(name: string, defaultValue?: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value.toLowerCase() === 'true';
}

export const appConfig: AppConfig = {
  app: {
    nodeEnv: getEnvVar('NODE_ENV', 'development'),
    logLevel: getEnvVar('LOG_LEVEL', 'info'),
    port: getEnvNumber('PORT', 3000),
  },
  workflow: {
    timeout: getEnvNumber('WORKFLOW_TIMEOUT', 30000),
    maxConcurrentWorkflows: getEnvNumber('MAX_CONCURRENT_WORKFLOWS', 10),
    retryAttempts: getEnvNumber('RETRY_ATTEMPTS', 3),
  },
  agents: {
    classificationConfidenceThreshold: parseFloat(getEnvVar('CLASSIFICATION_CONFIDENCE_THRESHOLD', '0.8')),
    responseGenerationTimeout: getEnvNumber('RESPONSE_GENERATION_TIMEOUT', 5000),
    escalationThreshold: parseFloat(getEnvVar('ESCALATION_THRESHOLD', '0.7')),
  },
  knowledgeBase: {
    url: getEnvVar('KNOWLEDGE_BASE_URL', 'http://localhost:8080/api/kb'),
    apiKey: getEnvVar('KNOWLEDGE_BASE_API_KEY', 'default_kb_key'),
  },
  notifications: {
    emailServiceUrl: getEnvVar('EMAIL_SERVICE_URL', 'http://localhost:8081/api/email'),
    slackWebhookUrl: getEnvVar('SLACK_WEBHOOK_URL', ''),
  },
  monitoring: {
    enabled: getEnvBoolean('METRICS_ENABLED', true),
    interval: getEnvNumber('METRICS_INTERVAL', 60000),
    healthCheckInterval: getEnvNumber('HEALTH_CHECK_INTERVAL', 30000),
  },
  database: {
    url: getEnvVar('DATABASE_URL', 'sqlite://./data/workflow.db'),
  },
  externalServices: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    claudeApiKey: process.env.CLAUDE_API_KEY,
  },
};

export function validateConfig(config: AppConfig): void {
  // Validate confidence thresholds
  if (config.agents.classificationConfidenceThreshold < 0 || config.agents.classificationConfidenceThreshold > 1) {
    throw new Error('Classification confidence threshold must be between 0 and 1');
  }
  
  if (config.agents.escalationThreshold < 0 || config.agents.escalationThreshold > 1) {
    throw new Error('Escalation threshold must be between 0 and 1');
  }

  // Validate timeouts
  if (config.workflow.timeout <= 0) {
    throw new Error('Workflow timeout must be positive');
  }

  if (config.agents.responseGenerationTimeout <= 0) {
    throw new Error('Response generation timeout must be positive');
  }

  // Validate concurrency limits
  if (config.workflow.maxConcurrentWorkflows <= 0) {
    throw new Error('Max concurrent workflows must be positive');
  }

  // Validate retry attempts
  if (config.workflow.retryAttempts < 0) {
    throw new Error('Retry attempts must be non-negative');
  }
}
