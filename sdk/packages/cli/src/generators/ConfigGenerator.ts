/**
 * @fileoverview Configuration code generator
 */

import { BaseGenerator, GenerationOptions, GeneratedFile } from './CodeGeneratorManager';

/**
 * Configuration generator
 */
export class ConfigGenerator extends BaseGenerator {
  /**
   * Generate configuration files
   */
  public async generateFiles(options: GenerationOptions): Promise<GeneratedFile[]> {
    const context = this.getContext(options);
    const files: GeneratedFile[] = [];

    // Main configuration file
    const configTemplate = this.getConfigTemplate(options.template);
    const configContent = this.renderTemplate(configTemplate, context);
    const configFilename = `${options.name}.${context.fileExtension}`;
    
    files.push({
      path: this.getOutputPath(options, configFilename),
      content: configContent,
      description: `Main configuration file`
    });

    // Environment-specific configurations
    if (options.template !== 'basic') {
      const environments = ['development', 'production', 'test'];
      
      for (const env of environments) {
        const envTemplate = this.getEnvironmentConfigTemplate(env, options.template);
        const envContent = this.renderTemplate(envTemplate, { ...context, environment: env });
        const envFilename = `${options.name}.${env}.${context.fileExtension}`;
        
        files.push({
          path: this.getOutputPath(options, envFilename),
          content: envContent,
          description: `${env.charAt(0).toUpperCase() + env.slice(1)} environment configuration`
        });
      }
    }

    // Schema validation file for TypeScript
    if (options.useTypeScript) {
      const schemaTemplate = this.getConfigSchemaTemplate();
      const schemaContent = this.renderTemplate(schemaTemplate, context);
      const schemaFilename = `${options.name}.schema.ts`;
      
      files.push({
        path: this.getOutputPath(options, schemaFilename),
        content: schemaContent,
        description: `Configuration schema and validation`
      });
    }

    return files;
  }

  /**
   * Generate test files
   */
  public async generateTestFiles(options: GenerationOptions): Promise<GeneratedFile[]> {
    const context = this.getContext(options);
    const files: GeneratedFile[] = [];

    // Main test file
    const testTemplate = this.getConfigTestTemplate(options.template);
    const testContent = this.renderTemplate(testTemplate, context);
    const testFilename = `${options.name}.${context.testExtension}`;
    
    files.push({
      path: this.getTestOutputPath(options, testFilename),
      content: testContent,
      description: `Configuration validation tests`
    });

    return files;
  }

  /**
   * Generate documentation files
   */
  public async generateDocumentationFiles(options: GenerationOptions): Promise<GeneratedFile[]> {
    const context = this.getContext(options);
    const files: GeneratedFile[] = [];

    // README file
    const readmeTemplate = this.getConfigReadmeTemplate();
    const readmeContent = this.renderTemplate(readmeTemplate, context);
    
    files.push({
      path: this.getDocsOutputPath(options, `${options.name}.md`),
      content: readmeContent,
      description: `Configuration documentation`
    });

    return files;
  }

  /**
   * Get configuration template based on complexity
   */
  private getConfigTemplate(template: string): string {
    switch (template) {
      case 'basic':
        return this.getBasicConfigTemplate();
      case 'advanced':
        return this.getAdvancedConfigTemplate();
      case 'enterprise':
        return this.getEnterpriseConfigTemplate();
      default:
        return this.getBasicConfigTemplate();
    }
  }

  /**
   * Get basic configuration template
   */
  private getBasicConfigTemplate(): string {
    return `/**
 * @fileoverview {{name}} configuration
 * Generated on {{date}}
 */

{{#useTypeScript}}
/**
 * {{name}} configuration interface
 */
export interface {{name}}Config {
  // Application settings
  name: string;
  version: string;
  description: string;
  
  // Server settings
  port: number;
  host: string;
  
  // Feature flags
  enableLogging: boolean;
  enableMetrics: boolean;
  
  // Custom settings
  [key: string]: any;
}
{{/useTypeScript}}

/**
 * Default {{name}} configuration
 */
export const {{name}}{{#useTypeScript}}: {{name}}Config{{/useTypeScript}} = {
  // Application settings
  name: '{{kebabCaseName}}',
  version: '1.0.0',
  description: '{{description}}',
  
  // Server settings
  port: 3000,
  host: 'localhost',
  
  // Feature flags
  enableLogging: true,
  enableMetrics: false,
  
  // Environment variables
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Custom settings - add your configuration here
  customSetting: 'default-value'
};

export default {{name}};
`;
  }

  /**
   * Get advanced configuration template
   */
  private getAdvancedConfigTemplate(): string {
    return `/**
 * @fileoverview {{name}} advanced configuration
 * Generated on {{date}}
 */

{{#useTypeScript}}
/**
 * Database configuration
 */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  pool: {
    min: number;
    max: number;
  };
}

/**
 * Redis configuration
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  outputs: string[];
}

/**
 * {{name}} advanced configuration interface
 */
export interface {{name}}Config {
  // Application settings
  name: string;
  version: string;
  description: string;
  environment: string;
  
  // Server settings
  server: {
    port: number;
    host: string;
    cors: {
      enabled: boolean;
      origins: string[];
    };
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      max: number;
    };
  };
  
  // Database configuration
  database: DatabaseConfig;
  
  // Cache configuration
  cache: RedisConfig;
  
  // Logging configuration
  logging: LoggingConfig;
  
  // Security settings
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
  };
  
  // Feature flags
  features: {
    enableMetrics: boolean;
    enableHealthCheck: boolean;
    enableSwagger: boolean;
  };
  
  // Custom settings
  [key: string]: any;
}
{{/useTypeScript}}

/**
 * Load configuration from environment
 */
function loadFromEnvironment(){{#useTypeScript}}: Partial<{{name}}Config>{{/useTypeScript}} {
  return {
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || 'localhost',
      cors: {
        enabled: process.env.CORS_ENABLED === 'true',
        origins: process.env.CORS_ORIGINS?.split(',') || ['*']
      },
      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED === 'true',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
      }
    },
    database: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || '{{kebabCaseName}}',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2', 10),
        max: parseInt(process.env.DB_POOL_MAX || '10', 10)
      }
    },
    cache: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10)
    },
    logging: {
      level: (process.env.LOG_LEVEL as any) || 'info',
      format: (process.env.LOG_FORMAT as any) || 'json',
      outputs: process.env.LOG_OUTPUTS?.split(',') || ['console']
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10)
    },
    features: {
      enableMetrics: process.env.ENABLE_METRICS === 'true',
      enableHealthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false',
      enableSwagger: process.env.ENABLE_SWAGGER === 'true'
    }
  };
}

/**
 * Default {{name}} configuration
 */
export const {{name}}{{#useTypeScript}}: {{name}}Config{{/useTypeScript}} = {
  // Application settings
  name: '{{kebabCaseName}}',
  version: '1.0.0',
  description: '{{description}}',
  environment: process.env.NODE_ENV || 'development',
  
  // Server settings
  server: {
    port: 3000,
    host: 'localhost',
    cors: {
      enabled: true,
      origins: ['*']
    },
    rateLimit: {
      enabled: false,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100
    }
  },
  
  // Database configuration
  database: {
    host: 'localhost',
    port: 5432,
    database: '{{kebabCaseName}}',
    username: 'postgres',
    password: '',
    ssl: false,
    pool: {
      min: 2,
      max: 10
    }
  },
  
  // Cache configuration
  cache: {
    host: 'localhost',
    port: 6379,
    db: 0
  },
  
  // Logging configuration
  logging: {
    level: 'info',
    format: 'json',
    outputs: ['console']
  },
  
  // Security settings
  security: {
    jwtSecret: 'your-secret-key',
    jwtExpiresIn: '24h',
    bcryptRounds: 10
  },
  
  // Feature flags
  features: {
    enableMetrics: false,
    enableHealthCheck: true,
    enableSwagger: false
  },
  
  // Merge environment variables
  ...loadFromEnvironment()
};

export default {{name}};
`;
  }

  /**
   * Get enterprise configuration template
   */
  private getEnterpriseConfigTemplate(): string {
    return `/**
 * @fileoverview {{name}} enterprise configuration
 * Generated on {{date}}
 */

{{#useTypeScript}}
/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  prometheus: {
    enabled: boolean;
    port: number;
    path: string;
  };
  jaeger: {
    enabled: boolean;
    endpoint: string;
    serviceName: string;
  };
  healthCheck: {
    enabled: boolean;
    path: string;
    interval: number;
  };
}

/**
 * Security configuration
 */
export interface SecurityConfig {
  authentication: {
    enabled: boolean;
    providers: string[];
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  authorization: {
    enabled: boolean;
    rbac: boolean;
    policies: string[];
  };
  encryption: {
    algorithm: string;
    keyRotation: boolean;
    keyRotationInterval: number;
  };
}

/**
 * Scaling configuration
 */
export interface ScalingConfig {
  cluster: {
    enabled: boolean;
    workers: number;
  };
  loadBalancer: {
    enabled: boolean;
    algorithm: 'round-robin' | 'least-connections' | 'ip-hash';
  };
  autoScaling: {
    enabled: boolean;
    minInstances: number;
    maxInstances: number;
    targetCpuUtilization: number;
  };
}

/**
 * {{name}} enterprise configuration interface
 */
export interface {{name}}Config {
  // Application settings
  name: string;
  version: string;
  description: string;
  environment: string;
  
  // Server settings
  server: {
    port: number;
    host: string;
    cors: {
      enabled: boolean;
      origins: string[];
    };
    rateLimit: {
      enabled: boolean;
      windowMs: number;
      max: number;
    };
    compression: {
      enabled: boolean;
      level: number;
    };
  };
  
  // Database configuration
  database: {
    primary: DatabaseConfig;
    replica?: DatabaseConfig;
    migrations: {
      enabled: boolean;
      directory: string;
    };
  };
  
  // Cache configuration
  cache: {
    redis: RedisConfig;
    memcached?: {
      servers: string[];
    };
    strategy: 'redis' | 'memcached' | 'memory';
  };
  
  // Message queue configuration
  messageQueue: {
    provider: 'redis' | 'rabbitmq' | 'kafka';
    redis?: RedisConfig;
    rabbitmq?: {
      url: string;
      exchange: string;
    };
    kafka?: {
      brokers: string[];
      clientId: string;
    };
  };
  
  // Monitoring configuration
  monitoring: MonitoringConfig;
  
  // Security configuration
  security: SecurityConfig;
  
  // Scaling configuration
  scaling: ScalingConfig;
  
  // Logging configuration
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
    outputs: string[];
    structured: boolean;
    sampling: {
      enabled: boolean;
      rate: number;
    };
  };
  
  // Feature flags
  features: {
    [key: string]: boolean;
  };
  
  // Custom settings
  [key: string]: any;
}
{{/useTypeScript}}

/**
 * Configuration validator
 */
export class ConfigValidator {
  /**
   * Validate configuration
   */
  public static validate(config{{#useTypeScript}}: {{name}}Config{{/useTypeScript}}){{#useTypeScript}}: { valid: boolean; errors: string[] }{{/useTypeScript}} {
    const errors{{#useTypeScript}}: string[]{{/useTypeScript}} = [];
    
    // Validate required fields
    if (!config.name) errors.push('name is required');
    if (!config.version) errors.push('version is required');
    if (!config.server.port || config.server.port < 1 || config.server.port > 65535) {
      errors.push('server.port must be between 1 and 65535');
    }
    
    // Validate database configuration
    if (!config.database.primary.host) errors.push('database.primary.host is required');
    if (!config.database.primary.database) errors.push('database.primary.database is required');
    
    // Validate security configuration
    if (config.security.authentication.enabled && !config.security.authentication.jwtSecret) {
      errors.push('security.authentication.jwtSecret is required when authentication is enabled');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Configuration loader
 */
export class ConfigLoader {
  /**
   * Load configuration for environment
   */
  public static async load(environment{{#useTypeScript}}?: string{{/useTypeScript}}){{#useTypeScript}}: Promise<{{name}}Config>{{/useTypeScript}} {
    const env = environment || process.env.NODE_ENV || 'development';
    
    // Load base configuration
    let config = { ...{{name}} };
    
    // Load environment-specific configuration
    try {
      const envConfig = await import(\`./{{name}}.\${env}\`);
      config = { ...config, ...envConfig.default };
    } catch (error) {
      console.warn(\`No environment-specific configuration found for \${env}\`);
    }
    
    // Validate configuration
    const validation = ConfigValidator.validate(config);
    if (!validation.valid) {
      throw new Error(\`Configuration validation failed: \${validation.errors.join(', ')}\`);
    }
    
    return config;
  }
}

/**
 * Default {{name}} configuration
 */
export const {{name}}{{#useTypeScript}}: {{name}}Config{{/useTypeScript}} = {
  // Application settings
  name: '{{kebabCaseName}}',
  version: '1.0.0',
  description: '{{description}}',
  environment: process.env.NODE_ENV || 'development',
  
  // Server settings
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    cors: {
      enabled: process.env.CORS_ENABLED !== 'false',
      origins: process.env.CORS_ORIGINS?.split(',') || ['*']
    },
    rateLimit: {
      enabled: process.env.RATE_LIMIT_ENABLED === 'true',
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10)
    },
    compression: {
      enabled: process.env.COMPRESSION_ENABLED !== 'false',
      level: parseInt(process.env.COMPRESSION_LEVEL || '6', 10)
    }
  },
  
  // Database configuration
  database: {
    primary: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || '{{kebabCaseName}}',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      ssl: process.env.DB_SSL === 'true',
      pool: {
        min: parseInt(process.env.DB_POOL_MIN || '2', 10),
        max: parseInt(process.env.DB_POOL_MAX || '10', 10)
      }
    },
    migrations: {
      enabled: process.env.DB_MIGRATIONS_ENABLED !== 'false',
      directory: process.env.DB_MIGRATIONS_DIR || './migrations'
    }
  },
  
  // Cache configuration
  cache: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10)
    },
    strategy: (process.env.CACHE_STRATEGY as any) || 'redis'
  },
  
  // Message queue configuration
  messageQueue: {
    provider: (process.env.MQ_PROVIDER as any) || 'redis',
    redis: {
      host: process.env.MQ_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.MQ_REDIS_PORT || process.env.REDIS_PORT || '6379', 10),
      password: process.env.MQ_REDIS_PASSWORD || process.env.REDIS_PASSWORD,
      db: parseInt(process.env.MQ_REDIS_DB || '1', 10)
    }
  },
  
  // Monitoring configuration
  monitoring: {
    prometheus: {
      enabled: process.env.PROMETHEUS_ENABLED === 'true',
      port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
      path: process.env.PROMETHEUS_PATH || '/metrics'
    },
    jaeger: {
      enabled: process.env.JAEGER_ENABLED === 'true',
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
      serviceName: process.env.JAEGER_SERVICE_NAME || '{{kebabCaseName}}'
    },
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
      path: process.env.HEALTH_CHECK_PATH || '/health',
      interval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10)
    }
  },
  
  // Security configuration
  security: {
    authentication: {
      enabled: process.env.AUTH_ENABLED === 'true',
      providers: process.env.AUTH_PROVIDERS?.split(',') || ['jwt'],
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    authorization: {
      enabled: process.env.AUTHZ_ENABLED === 'true',
      rbac: process.env.RBAC_ENABLED === 'true',
      policies: process.env.AUTHZ_POLICIES?.split(',') || []
    },
    encryption: {
      algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
      keyRotation: process.env.KEY_ROTATION_ENABLED === 'true',
      keyRotationInterval: parseInt(process.env.KEY_ROTATION_INTERVAL || '86400000', 10)
    }
  },
  
  // Scaling configuration
  scaling: {
    cluster: {
      enabled: process.env.CLUSTER_ENABLED === 'true',
      workers: parseInt(process.env.CLUSTER_WORKERS || '0', 10) || require('os').cpus().length
    },
    loadBalancer: {
      enabled: process.env.LOAD_BALANCER_ENABLED === 'true',
      algorithm: (process.env.LOAD_BALANCER_ALGORITHM as any) || 'round-robin'
    },
    autoScaling: {
      enabled: process.env.AUTO_SCALING_ENABLED === 'true',
      minInstances: parseInt(process.env.AUTO_SCALING_MIN || '1', 10),
      maxInstances: parseInt(process.env.AUTO_SCALING_MAX || '10', 10),
      targetCpuUtilization: parseInt(process.env.AUTO_SCALING_CPU_TARGET || '70', 10)
    }
  },
  
  // Logging configuration
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    format: (process.env.LOG_FORMAT as any) || 'json',
    outputs: process.env.LOG_OUTPUTS?.split(',') || ['console'],
    structured: process.env.LOG_STRUCTURED !== 'false',
    sampling: {
      enabled: process.env.LOG_SAMPLING_ENABLED === 'true',
      rate: parseFloat(process.env.LOG_SAMPLING_RATE || '0.1')
    }
  },
  
  // Feature flags
  features: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableTracing: process.env.ENABLE_TRACING === 'true',
    enableProfiling: process.env.ENABLE_PROFILING === 'true',
    enableSwagger: process.env.ENABLE_SWAGGER === 'true'
  }
};

export default {{name}};
`;
  }

  /**
   * Get environment configuration template
   */
  private getEnvironmentConfigTemplate(environment: string, template: string): string {
    const envName = environment.toUpperCase();
    
    return `/**
 * @fileoverview {{name}} ${environment} environment configuration
 * Generated on {{date}}
 */

{{#useTypeScript}}
import { {{name}}Config } from './{{name}}';
{{/useTypeScript}}

/**
 * ${environment.charAt(0).toUpperCase() + environment.slice(1)} environment configuration
 */
export const {{name}}${environment.charAt(0).toUpperCase() + environment.slice(1)}{{#useTypeScript}}: Partial<{{name}}Config>{{/useTypeScript}} = {
  environment: '${environment}',
  
${environment === 'development' ? `  // Development-specific settings
  server: {
    port: 3000,
    host: 'localhost'
  },
  
  logging: {
    level: 'debug',
    format: 'text'
  },
  
  features: {
    enableSwagger: true,
    enableMetrics: false
  }` : environment === 'production' ? `  // Production-specific settings
  server: {
    port: parseInt(process.env.PORT || '8080', 10),
    host: '0.0.0.0'
  },
  
  logging: {
    level: 'info',
    format: 'json',
    structured: true
  },
  
  features: {
    enableMetrics: true,
    enableTracing: true,
    enableSwagger: false
  },
  
  security: {
    authentication: {
      enabled: true
    },
    authorization: {
      enabled: true,
      rbac: true
    }
  }` : `  // Test-specific settings
  server: {
    port: 0, // Random port
    host: 'localhost'
  },
  
  database: {
    primary: {
      database: '{{kebabCaseName}}_test'
    }
  },
  
  logging: {
    level: 'warn',
    outputs: []
  },
  
  features: {
    enableMetrics: false,
    enableSwagger: false
  }`}
};

export default {{name}}${environment.charAt(0).toUpperCase() + environment.slice(1)};
`;
  }

  /**
   * Get configuration schema template
   */
  private getConfigSchemaTemplate(): string {
    return `/**
 * @fileoverview {{name}} configuration schema and validation
 * Generated on {{date}}
 */

import Joi from 'joi';
import { {{name}}Config } from './{{name}}';

/**
 * Configuration validation schema
 */
export const {{name}}Schema = Joi.object<{{name}}Config>({
  name: Joi.string().required(),
  version: Joi.string().required(),
  description: Joi.string().required(),
  environment: Joi.string().valid('development', 'production', 'test').required(),
  
  server: Joi.object({
    port: Joi.number().port().required(),
    host: Joi.string().required(),
    cors: Joi.object({
      enabled: Joi.boolean().required(),
      origins: Joi.array().items(Joi.string()).required()
    }).required(),
    rateLimit: Joi.object({
      enabled: Joi.boolean().required(),
      windowMs: Joi.number().positive().required(),
      max: Joi.number().positive().required()
    }).required()
  }).required(),
  
  // Add more schema validation as needed
}).unknown(true);

/**
 * Validate configuration
 */
export function validateConfig(config: any): { error?: Error; value?: {{name}}Config } {
  const { error, value } = {{name}}Schema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: false
  });
  
  return { error, value };
}

/**
 * Configuration type guards
 */
export function isValidConfig(config: any): config is {{name}}Config {
  const { error } = validateConfig(config);
  return !error;
}
`;
  }

  /**
   * Get configuration test template
   */
  private getConfigTestTemplate(template: string): string {
    return `/**
 * @fileoverview Tests for {{name}} configuration
 * Generated on {{date}}
 */

{{#useTypeScript}}
import { {{name}} } from '../{{name}}';
{{#template}}
import { ConfigValidator, ConfigLoader } from '../{{name}}';
{{/template}}
{{/useTypeScript}}

describe('{{name}} Configuration', () => {
  describe('基本配置', () => {
    it('应该有有效的默认配置', () => {
      expect({{name}}).toBeDefined();
      expect({{name}}.name).toBe('{{kebabCaseName}}');
      expect({{name}}.version).toBeDefined();
      expect({{name}}.description).toBe('{{description}}');
    });

    it('应该有服务器配置', () => {
      expect({{name}}.server).toBeDefined();
      expect({{name}}.server.port).toBeGreaterThan(0);
      expect({{name}}.server.host).toBeDefined();
    });

    it('应该有日志配置', () => {
      expect({{name}}.logging).toBeDefined();
      expect(['debug', 'info', 'warn', 'error']).toContain({{name}}.logging.level);
    });
  });

{{#template}}
  describe('配置验证', () => {
    it('应该验证有效配置', () => {
      const validation = ConfigValidator.validate({{name}});
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应该检测无效配置', () => {
      const invalidConfig = {
        ...{{name}},
        name: '', // Invalid: empty name
        server: {
          ...{{name}}.server,
          port: -1 // Invalid: negative port
        }
      };

      const validation = ConfigValidator.validate(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('配置加载', () => {
    it('应该加载开发环境配置', async () => {
      const config = await ConfigLoader.load('development');
      expect(config).toBeDefined();
      expect(config.environment).toBe('development');
    });

    it('应该加载生产环境配置', async () => {
      const config = await ConfigLoader.load('production');
      expect(config).toBeDefined();
      expect(config.environment).toBe('production');
    });

    it('应该加载测试环境配置', async () => {
      const config = await ConfigLoader.load('test');
      expect(config).toBeDefined();
      expect(config.environment).toBe('test');
    });
  });
{{/template}}

  describe('环境变量', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('应该从环境变量读取端口', () => {
      process.env.PORT = '8080';
      
      // Re-import to get updated config
      delete require.cache[require.resolve('../{{name}}')];
      const { {{name}} } = require('../{{name}}');
      
      expect({{name}}.server.port).toBe(8080);
    });

    it('应该从环境变量读取主机', () => {
      process.env.HOST = '0.0.0.0';
      
      // Re-import to get updated config
      delete require.cache[require.resolve('../{{name}}')];
      const { {{name}} } = require('../{{name}}');
      
      expect({{name}}.server.host).toBe('0.0.0.0');
    });
  });

  describe('功能标志', () => {
    it('应该有功能标志配置', () => {
      expect({{name}}.features).toBeDefined();
      expect(typeof {{name}}.features).toBe('object');
    });

    it('应该支持启用/禁用功能', () => {
      const features = {{name}}.features;
      
      // Check that feature flags are boolean values
      Object.values(features).forEach(value => {
        expect(typeof value).toBe('boolean');
      });
    });
  });
});
`;
  }

  /**
   * Get configuration README template
   */
  private getConfigReadmeTemplate(): string {
    return `# {{name}} Configuration

{{description}}

## Overview

This configuration module provides a comprehensive configuration system for the {{name}} application with support for:

- Environment-specific configurations
- Environment variable overrides
- Configuration validation
- Type safety (TypeScript)
- Feature flags

## Usage

### Basic Usage

\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
import { {{name}} } from './{{name}}';

// Use the configuration
console.log('Server will run on port:', {{name}}.server.port);
console.log('Database host:', {{name}}.database.host);
\`\`\`

### Environment-Specific Configuration

\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
{{#template}}
import { ConfigLoader } from './{{name}}';

// Load configuration for specific environment
const config = await ConfigLoader.load('production');
{{/template}}
{{^template}}
// Environment-specific configurations are automatically loaded
// based on NODE_ENV environment variable
const config = {{name}};
{{/template}}
\`\`\`

## Configuration Structure

### Application Settings

- \`name\`: Application name
- \`version\`: Application version
- \`description\`: Application description
- \`environment\`: Current environment (development, production, test)

### Server Configuration

- \`server.port\`: Server port (default: 3000)
- \`server.host\`: Server host (default: localhost)
- \`server.cors\`: CORS configuration
- \`server.rateLimit\`: Rate limiting configuration

{{#template}}
### Database Configuration

- \`database.host\`: Database host
- \`database.port\`: Database port
- \`database.database\`: Database name
- \`database.username\`: Database username
- \`database.password\`: Database password
- \`database.ssl\`: Enable SSL connection
- \`database.pool\`: Connection pool settings

### Cache Configuration

- \`cache.host\`: Cache server host
- \`cache.port\`: Cache server port
- \`cache.password\`: Cache server password
- \`cache.db\`: Cache database number

### Logging Configuration

- \`logging.level\`: Log level (debug, info, warn, error)
- \`logging.format\`: Log format (json, text)
- \`logging.outputs\`: Log output destinations
{{#template}}
- \`logging.structured\`: Enable structured logging
- \`logging.sampling\`: Log sampling configuration
{{/template}}

{{#template}}
### Security Configuration

- \`security.authentication\`: Authentication settings
- \`security.authorization\`: Authorization settings
- \`security.encryption\`: Encryption settings

### Monitoring Configuration

- \`monitoring.prometheus\`: Prometheus metrics configuration
- \`monitoring.jaeger\`: Jaeger tracing configuration
- \`monitoring.healthCheck\`: Health check configuration

### Scaling Configuration

- \`scaling.cluster\`: Cluster mode settings
- \`scaling.loadBalancer\`: Load balancer configuration
- \`scaling.autoScaling\`: Auto-scaling settings
{{/template}}
{{/template}}

### Feature Flags

- \`features.enableMetrics\`: Enable metrics collection
{{#template}}
- \`features.enableTracing\`: Enable distributed tracing
- \`features.enableProfiling\`: Enable performance profiling
{{/template}}
- \`features.enableSwagger\`: Enable Swagger documentation

## Environment Variables

The configuration system supports the following environment variables:

### Server
- \`PORT\`: Server port
- \`HOST\`: Server host
- \`CORS_ENABLED\`: Enable CORS
- \`CORS_ORIGINS\`: Allowed CORS origins (comma-separated)

{{#template}}
### Database
- \`DB_HOST\`: Database host
- \`DB_PORT\`: Database port
- \`DB_NAME\`: Database name
- \`DB_USER\`: Database username
- \`DB_PASSWORD\`: Database password
- \`DB_SSL\`: Enable SSL connection

### Cache
- \`REDIS_HOST\`: Redis host
- \`REDIS_PORT\`: Redis port
- \`REDIS_PASSWORD\`: Redis password
- \`REDIS_DB\`: Redis database number

### Security
- \`JWT_SECRET\`: JWT secret key
- \`JWT_EXPIRES_IN\`: JWT expiration time
- \`AUTH_ENABLED\`: Enable authentication
- \`RBAC_ENABLED\`: Enable role-based access control
{{/template}}

### Logging
- \`LOG_LEVEL\`: Logging level
- \`LOG_FORMAT\`: Log format
- \`LOG_OUTPUTS\`: Log outputs (comma-separated)

### Features
- \`ENABLE_METRICS\`: Enable metrics
{{#template}}
- \`ENABLE_TRACING\`: Enable tracing
- \`ENABLE_PROFILING\`: Enable profiling
{{/template}}
- \`ENABLE_SWAGGER\`: Enable Swagger

## Environment-Specific Files

{{#template}}
The configuration system supports environment-specific configuration files:

- \`{{name}}.development.{{fileExtension}}\`: Development environment
- \`{{name}}.production.{{fileExtension}}\`: Production environment
- \`{{name}}.test.{{fileExtension}}\`: Test environment

These files are automatically loaded based on the \`NODE_ENV\` environment variable.
{{/template}}
{{^template}}
This is a basic configuration. For environment-specific configurations, consider upgrading to the advanced or enterprise template.
{{/template}}

## Validation

{{#template}}
The configuration includes built-in validation:

\`\`\`{{#useTypeScript}}typescript{{/useTypeScript}}{{^useTypeScript}}javascript{{/useTypeScript}}
import { ConfigValidator } from './{{name}}';

const validation = ConfigValidator.validate(config);
if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
\`\`\`
{{/template}}
{{^template}}
Basic validation is performed automatically when the configuration is loaded.
{{/template}}

## Testing

Run the configuration tests:

\`\`\`bash
npm test -- {{name}}.test.{{#useTypeScript}}ts{{/useTypeScript}}{{^useTypeScript}}js{{/useTypeScript}}
\`\`\`

## Development

1. Update the configuration structure in the main file
2. Add environment variables as needed
3. Update environment-specific configurations
4. Add validation rules for new configuration options
5. Update tests to cover new configuration options
6. Update this documentation

## Security Considerations

- Never commit sensitive configuration values to version control
- Use environment variables for secrets and sensitive data
- Rotate secrets regularly in production
- Use encrypted configuration files for highly sensitive data
- Implement proper access controls for configuration management

## License

Generated by MPLP CLI on {{date}}
`;
  }
}
