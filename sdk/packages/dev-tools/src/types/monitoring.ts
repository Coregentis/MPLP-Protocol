/**
 * @fileoverview Monitoring Types - Type definitions for monitoring tools
 * @version 1.1.0-beta
 * @author MPLP Team
 */

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  enabled?: boolean;
  interval?: number;
  alerts?: AlertConfig[];
  dashboards?: DashboardConfig[];
  exporters?: ExporterConfig[];
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown?: number;
  actions?: AlertAction[];
}

/**
 * Alert action
 */
export interface AlertAction {
  type: 'email' | 'webhook' | 'log' | 'custom';
  config: Record<string, any>;
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  name: string;
  description: string;
  panels: DashboardPanel[];
  refreshInterval: number;
  enabled: boolean;
}

/**
 * Dashboard panel
 */
export interface DashboardPanel {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'metric' | 'log';
  query: string;
  config: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Exporter configuration
 */
export interface ExporterConfig {
  type: 'prometheus' | 'influxdb' | 'elasticsearch' | 'custom';
  endpoint: string;
  interval: number;
  enabled: boolean;
  config: Record<string, any>;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  duration: number;
  message?: string;
  details?: Record<string, any>;
}

/**
 * System health
 */
export interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  checks: HealthCheckResult[];
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
}

/**
 * Monitoring alert
 */
export interface MonitoringAlert {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'suppressed';
  message: string;
  source: string;
  timestamp: Date;
  resolvedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Real-time monitor data
 */
export interface RealTimeMonitorData {
  timestamp: Date;
  metrics: Record<string, number>;
  events: MonitoringEvent[];
  alerts: MonitoringAlert[];
  health: SystemHealth;
}

/**
 * Monitoring event
 */
export interface MonitoringEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  message: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  metadata?: Record<string, any>;
}

/**
 * Dashboard data
 */
export interface DashboardData {
  panels: Record<string, PanelData>;
  timestamp: Date;
  refreshInterval: number;
}

/**
 * Panel data
 */
export interface PanelData {
  type: string;
  data: any;
  timestamp: Date;
  error?: string;
}

/**
 * Monitoring statistics
 */
export interface MonitoringStatistics {
  uptime: number;
  totalEvents: number;
  activeAlerts: number;
  healthChecks: number;
  dashboards: number;
  exporters: number;
  lastUpdate: Date;
}
