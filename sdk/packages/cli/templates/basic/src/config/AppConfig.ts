/**
 * Application Configuration
 */

/**
 * Application configuration interface
 */
export interface AppConfig {
  app: {
    name: string;
    version: string;
    description: string;
    environment: 'development' | 'production' | 'test';
  };
  
  agents: {
    greeting: {
      enabled: boolean;
      maxConcurrentRequests: number;
    };
  };
  
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    console: boolean;
    file?: string;
  };
  
  performance: {
    enableMetrics: boolean;
    metricsInterval: number;
  };
}

/**
 * Default application configuration
 */
export const defaultConfig: AppConfig = {
  app: {
    name: '{{name}}',
    version: '1.0.0',
    description: '{{description}}',
    environment: (process.env.NODE_ENV as any) || 'development'
  },
  
  agents: {
    greeting: {
      enabled: true,
      maxConcurrentRequests: 10
    }
  },
  
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    console: true,
    file: process.env.LOG_FILE
  },
  
  performance: {
    enableMetrics: process.env.NODE_ENV !== 'test',
    metricsInterval: 30000 // 30 seconds
  }
};

/**
 * Get configuration for current environment
 */
export function getConfig(): AppConfig {
  const environment = process.env.NODE_ENV || 'development';
  
  // You can extend this to load environment-specific configurations
  switch (environment) {
    case 'production':
      return {
        ...defaultConfig,
        logging: {
          ...defaultConfig.logging,
          level: 'info'
        },
        performance: {
          ...defaultConfig.performance,
          enableMetrics: true
        }
      };
      
    case 'test':
      return {
        ...defaultConfig,
        logging: {
          ...defaultConfig.logging,
          level: 'error',
          console: false
        },
        performance: {
          ...defaultConfig.performance,
          enableMetrics: false
        }
      };
      
    default: // development
      return defaultConfig;
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: AppConfig): void {
  if (!config.app.name || config.app.name.trim().length === 0) {
    throw new Error('App name is required');
  }
  
  if (!config.app.version || config.app.version.trim().length === 0) {
    throw new Error('App version is required');
  }
  
  if (!['development', 'production', 'test'].includes(config.app.environment)) {
    throw new Error('Invalid environment. Must be development, production, or test');
  }
  
  if (!['debug', 'info', 'warn', 'error'].includes(config.logging.level)) {
    throw new Error('Invalid logging level. Must be debug, info, warn, or error');
  }
}
