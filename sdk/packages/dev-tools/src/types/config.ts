/**
 * @fileoverview Config Types - Type definitions for dev tools configuration
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { DebugConfig } from './debug';
import { PerformanceConfig } from './performance';
import { MonitoringConfig } from './monitoring';
import { LogConfig } from './logging';

/**
 * Development tools configuration
 */
export interface DevToolsConfig {
  server?: ServerConfig;
  debug?: DebugConfig;
  performance?: PerformanceConfig;
  monitoring?: MonitoringConfig;
  logging?: LogConfig;
  integrations?: IntegrationConfig[];
  ui?: UIConfig;
}

/**
 * Server configuration
 */
export interface ServerConfig {
  port?: number;
  host?: string;
  cors?: boolean | CorsConfig;
  ssl?: SSLConfig;
  compression?: boolean;
  rateLimit?: RateLimitConfig;
  auth?: AuthConfig;
}

/**
 * CORS configuration
 */
export interface CorsConfig {
  origin: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

/**
 * SSL configuration
 */
export interface SSLConfig {
  enabled: boolean;
  cert: string;
  key: string;
  ca?: string;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  enabled: boolean;
  type: 'basic' | 'bearer' | 'apikey' | 'oauth';
  config: Record<string, any>;
}

/**
 * Integration configuration
 */
export interface IntegrationConfig {
  name: string;
  type: 'webhook' | 'database' | 'message-queue' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
}

/**
 * UI configuration
 */
export interface UIConfig {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  refreshInterval?: number;
  autoSave?: boolean;
  notifications?: NotificationConfig;
}

/**
 * Notification configuration
 */
export interface NotificationConfig {
  enabled: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  duration: number;
  showProgress: boolean;
  types: {
    success: boolean;
    error: boolean;
    warning: boolean;
    info: boolean;
  };
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
  name: string;
  description?: string;
  variables: Record<string, string>;
  active: boolean;
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  name: string;
  version: string;
  enabled: boolean;
  config: Record<string, any>;
  dependencies?: string[];
}

/**
 * Workspace configuration
 */
export interface WorkspaceConfig {
  name: string;
  path: string;
  environments: EnvironmentConfig[];
  plugins: PluginConfig[];
  settings: Record<string, any>;
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  path: string;
  message: string;
  value?: any;
  expected?: any;
}

/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}
