/**
 * @fileoverview Debug Manager - Central debugging coordinator
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { MPLPEventManager } from '../utils/MPLPEventManager';
import { AgentDebugger } from './AgentDebugger';
import { WorkflowDebugger } from './WorkflowDebugger';
import { ProtocolInspector } from './ProtocolInspector';
import { StateInspector } from './StateInspector';
import { DebugConfig, DebugSession, DebugEvent } from '../types/debug';

/**
 * Central debugging coordinator for MPLP applications
 */
export class DebugManager {
  private eventManager: MPLPEventManager;
  private config: DebugConfig;
  private sessions: Map<string, DebugSession> = new Map();
  private agentDebugger: AgentDebugger;
  private workflowDebugger: WorkflowDebugger;
  private protocolInspector: ProtocolInspector;
  private stateInspector: StateInspector;
  private isActive = false;

  // 企业级功能
  private remoteConnections: Map<string, any> = new Map();
  private alertRules: Array<any> = [];
  private performanceThresholds: Map<string, number> = new Map();
  private auditLog: Array<any> = [];
  private configBackups: Array<any> = [];
  private plugins: Map<string, any> = new Map();
  private batchOperations: Array<any> = [];
  private securityPolicies: Array<any> = [];

  constructor(config: DebugConfig = {}) {
    this.eventManager = new MPLPEventManager();
    this.config = {
      enabled: true,
      logLevel: 'info',
      breakpoints: [],
      watchExpressions: [],
      ...config
    };

    this.agentDebugger = new AgentDebugger(this.config);
    this.workflowDebugger = new WorkflowDebugger(this.config);
    this.protocolInspector = new ProtocolInspector(this.config);
    this.stateInspector = new StateInspector(this.config);

    this.setupEventHandlers();
    this.initializeEnterpriseFeatures();
  }

  // EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Start debugging session
   */
  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    try {
      await this.agentDebugger.start();
      await this.workflowDebugger.start();
      await this.protocolInspector.start();
      await this.stateInspector.start();

      this.isActive = true;
      this.emit('started');
      
      console.log('🐛 Debug Manager started');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop debugging session
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    try {
      await this.agentDebugger.stop();
      await this.workflowDebugger.stop();
      await this.protocolInspector.stop();
      await this.stateInspector.stop();

      this.sessions.clear();
      this.isActive = false;
      this.emit('stopped');
      
      console.log('🐛 Debug Manager stopped');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create new debug session
   */
  createSession(sessionId: string, target: any): DebugSession {
    if (this.sessions.has(sessionId)) {
      throw new Error(`Debug session '${sessionId}' already exists`);
    }

    const session: DebugSession = {
      id: sessionId,
      target,
      startTime: new Date(),
      breakpoints: [],
      watchExpressions: [],
      isActive: true,
      events: []
    };

    this.sessions.set(sessionId, session);
    this.emit('sessionCreated', session);
    
    return session;
  }

  /**
   * Get debug session
   */
  getSession(sessionId: string): DebugSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * End debug session
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.endTime = new Date();
      this.sessions.delete(sessionId);
      this.emit('sessionEnded', session);
    }
  }

  /**
   * Add breakpoint
   */
  addBreakpoint(sessionId: string, location: string, condition?: string): void {
    const session = this.getSession(sessionId);
    if (session) {
      const breakpoint = {
        id: `bp_${Date.now()}`,
        location,
        condition,
        enabled: true,
        hitCount: 0
      };
      
      session.breakpoints.push(breakpoint);
      this.emit('breakpointAdded', { sessionId, breakpoint });
    }
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(sessionId: string, breakpointId: string): void {
    const session = this.getSession(sessionId);
    if (session) {
      const index = session.breakpoints.findIndex(bp => bp.id === breakpointId);
      if (index !== -1) {
        const breakpoint = session.breakpoints.splice(index, 1)[0];
        this.emit('breakpointRemoved', { sessionId, breakpoint });
      }
    }
  }

  /**
   * Add watch expression
   */
  addWatchExpression(sessionId: string, expression: string): void {
    const session = this.getSession(sessionId);
    if (session) {
      const watch = {
        id: `watch_${Date.now()}`,
        expression,
        enabled: true,
        lastValue: undefined,
        lastEvaluated: new Date()
      };
      
      session.watchExpressions.push(watch);
      this.emit('watchAdded', { sessionId, watch });
    }
  }

  /**
   * Get debugging statistics
   */
  getStatistics(): any {
    return {
      isActive: this.isActive,
      activeSessions: this.sessions.size,
      totalBreakpoints: Array.from(this.sessions.values())
        .reduce((total, session) => total + session.breakpoints.length, 0),
      totalWatchExpressions: Array.from(this.sessions.values())
        .reduce((total, session) => total + session.watchExpressions.length, 0),
      debuggers: {
        agent: this.agentDebugger.getStatistics(),
        workflow: this.workflowDebugger.getStatistics(),
        protocol: this.protocolInspector.getStatistics(),
        state: this.stateInspector.getStatistics()
      }
    };
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    // Forward events from sub-debuggers
    this.agentDebugger.on('event', (event: DebugEvent) => {
      this.emit('debugEvent', { source: 'agent', ...event });
    });

    this.workflowDebugger.on('event', (event: DebugEvent) => {
      this.emit('debugEvent', { source: 'workflow', ...event });
    });

    this.protocolInspector.on('event', (event: DebugEvent) => {
      this.emit('debugEvent', { source: 'protocol', ...event });
    });

    this.stateInspector.on('event', (event: DebugEvent) => {
      this.emit('debugEvent', { source: 'state', ...event });
    });
  }

  /**
   * Get current configuration
   */
  getConfig(): DebugConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  /**
   * Initialize enterprise features
   */
  private initializeEnterpriseFeatures(): void {
    // 设置默认性能阈值
    this.performanceThresholds.set('cpu', 80);
    this.performanceThresholds.set('memory', 85);
    this.performanceThresholds.set('responseTime', 1000);

    // 设置默认安全策略
    this.securityPolicies.push({
      id: 'default-access',
      name: 'Default Access Policy',
      rules: ['authenticated_users_only', 'audit_all_actions']
    });
  }

  /**
   * 远程调试连接管理
   */
  async connectRemoteDebugger(connectionId: string, config: any): Promise<void> {
    if (this.remoteConnections.has(connectionId)) {
      throw new Error(`Remote connection ${connectionId} already exists`);
    }

    const connection = {
      id: connectionId,
      config,
      connected: true,
      connectedAt: new Date(),
      lastActivity: new Date()
    };

    this.remoteConnections.set(connectionId, connection);
    this.addAuditLogEntry('remote_connection_established', { connectionId, config });
    this.emit('remoteConnectionEstablished', connection);
  }

  async disconnectRemoteDebugger(connectionId: string): Promise<void> {
    const connection = this.remoteConnections.get(connectionId);
    if (!connection) {
      throw new Error(`Remote connection ${connectionId} not found`);
    }

    this.remoteConnections.delete(connectionId);
    this.addAuditLogEntry('remote_connection_closed', { connectionId });
    this.emit('remoteConnectionClosed', { connectionId });
  }

  getRemoteConnections(): Array<any> {
    return Array.from(this.remoteConnections.values());
  }

  /**
   * 告警规则管理
   */
  addAlertRule(rule: any): void {
    const alertRule = {
      id: rule.id || `alert_${Date.now()}`,
      name: rule.name,
      condition: rule.condition,
      action: rule.action,
      enabled: rule.enabled !== false,
      createdAt: new Date()
    };

    this.alertRules.push(alertRule);
    this.addAuditLogEntry('alert_rule_added', { rule: alertRule });
    this.emit('alertRuleAdded', alertRule);
  }

  removeAlertRule(ruleId: string): void {
    const index = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (index === -1) {
      throw new Error(`Alert rule ${ruleId} not found`);
    }

    const removedRule = this.alertRules.splice(index, 1)[0];
    this.addAuditLogEntry('alert_rule_removed', { ruleId });
    this.emit('alertRuleRemoved', { ruleId, rule: removedRule });
  }

  getAlertRules(): Array<any> {
    return [...this.alertRules];
  }

  /**
   * 性能阈值管理
   */
  setPerformanceThreshold(metric: string, threshold: number): void {
    this.performanceThresholds.set(metric, threshold);
    this.addAuditLogEntry('performance_threshold_updated', { metric, threshold });
    this.emit('performanceThresholdUpdated', { metric, threshold });
  }

  getPerformanceThreshold(metric: string): number | undefined {
    return this.performanceThresholds.get(metric);
  }

  getAllPerformanceThresholds(): Record<string, number> {
    return Object.fromEntries(this.performanceThresholds);
  }

  /**
   * 审计日志管理
   */
  private addAuditLogEntry(action: string, details: any): void {
    const entry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      details,
      timestamp: new Date(),
      user: 'system' // 在实际应用中应该是当前用户
    };

    this.auditLog.push(entry);

    // 限制审计日志数量
    if (this.auditLog.length > 1000) {
      this.auditLog.splice(0, this.auditLog.length - 1000);
    }

    this.emit('auditLogEntry', entry);
  }

  getAuditLog(limit?: number): Array<any> {
    const logs = [...this.auditLog].reverse();
    return limit ? logs.slice(0, limit) : logs;
  }

  clearAuditLog(): void {
    this.auditLog.length = 0;
    this.addAuditLogEntry('audit_log_cleared', {});
  }

  /**
   * 配置备份管理
   */
  createConfigBackup(name?: string): void {
    const backup = {
      id: `backup_${Date.now()}`,
      name: name || `Backup ${new Date().toISOString()}`,
      config: { ...this.config },
      createdAt: new Date()
    };

    this.configBackups.push(backup);

    // 限制备份数量
    if (this.configBackups.length > 10) {
      this.configBackups.splice(0, this.configBackups.length - 10);
    }

    this.addAuditLogEntry('config_backup_created', { backupId: backup.id, name: backup.name });
    this.emit('configBackupCreated', backup);
  }

  restoreConfigBackup(backupId: string): void {
    const backup = this.configBackups.find(b => b.id === backupId);
    if (!backup) {
      throw new Error(`Config backup ${backupId} not found`);
    }

    this.config = { ...backup.config };
    this.addAuditLogEntry('config_backup_restored', { backupId, name: backup.name });
    this.emit('configBackupRestored', { backupId, config: this.config });
  }

  getConfigBackups(): Array<any> {
    return [...this.configBackups];
  }

  deleteConfigBackup(backupId: string): void {
    const index = this.configBackups.findIndex(b => b.id === backupId);
    if (index === -1) {
      throw new Error(`Config backup ${backupId} not found`);
    }

    const deletedBackup = this.configBackups.splice(index, 1)[0];
    this.addAuditLogEntry('config_backup_deleted', { backupId, name: deletedBackup.name });
    this.emit('configBackupDeleted', { backupId });
  }

  /**
   * 企业级运行模式
   */
  async runWithEnterpriseFeatures(): Promise<any> {
    const startTime = Date.now();

    try {
      // 启动所有企业级功能
      await this.start();

      // 记录运行指标
      const metrics = {
        startTime: new Date(startTime),
        duration: Date.now() - startTime,
        activeConnections: this.remoteConnections.size,
        alertRules: this.alertRules.length,
        auditLogEntries: this.auditLog.length,
        configBackups: this.configBackups.length,
        securityPolicies: this.securityPolicies.length
      };

      this.addAuditLogEntry('enterprise_mode_started', metrics);
      this.emit('enterpriseModeStarted', metrics);

      return metrics;
    } catch (error) {
      this.addAuditLogEntry('enterprise_mode_failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * 获取企业级统计信息
   */
  getEnterpriseStatistics(): any {
    const baseStats = this.getStatistics();

    return {
      ...baseStats,
      enterprise: {
        remoteConnections: this.remoteConnections.size,
        alertRules: this.alertRules.length,
        performanceThresholds: this.performanceThresholds.size,
        auditLogEntries: this.auditLog.length,
        configBackups: this.configBackups.length,
        securityPolicies: this.securityPolicies.length
      }
    };
  }
}
