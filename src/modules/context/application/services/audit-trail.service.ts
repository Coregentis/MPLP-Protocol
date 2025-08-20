/**
 * 审计跟踪服务
 * 
 * 基于Schema字段: audit_trail (audit_events, compliance_settings)
 * 实现审计事件记录、合规性管理、事件查询等功能
 */

import { UUID } from '../../types';

/**
 * 审计事件类型
 */
export type AuditEventType = 
  | 'context_created' 
  | 'context_updated' 
  | 'context_deleted' 
  | 'context_accessed' 
  | 'context_shared' 
  | 'permission_changed' 
  | 'state_changed' 
  | 'cache_updated' 
  | 'sync_executed';

/**
 * 审计级别
 */
export type AuditLevel = 'basic' | 'detailed' | 'comprehensive';

/**
 * 审计事件接口
 */
export interface AuditEvent {
  eventId: UUID;
  eventType: AuditEventType;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  contextOperation?: string;
  contextId?: UUID;
  contextName?: string;
  lifecycleStage?: string;
  sharedStateKeys?: string[];
  accessLevel?: string;
  contextDetails?: Record<string, unknown>;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: UUID;
}

/**
 * 合规性设置接口
 */
export interface ComplianceSettings {
  gdprEnabled: boolean;
  hipaaEnabled: boolean;
  soxEnabled: boolean;
  contextAuditLevel: AuditLevel;
  contextDataLogging: boolean;
  customCompliance: string[];
}

/**
 * 审计跟踪配置接口
 */
export interface AuditTrailConfig {
  enabled: boolean;
  retentionDays: number;
  auditEvents?: AuditEvent[];
  complianceSettings?: ComplianceSettings;
}

/**
 * 审计查询条件接口
 */
export interface AuditQueryOptions {
  contextId?: UUID;
  userId?: string;
  eventType?: AuditEventType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * 审计统计接口
 */
export interface AuditStatistics {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByUser: Record<string, number>;
  eventsByContext: Record<string, number>;
  complianceViolations: number;
}

/**
 * 审计跟踪服务
 */
export class AuditTrailService {
  private auditEvents = new Map<string, AuditEvent[]>();
  private config: AuditTrailConfig;

  constructor(config?: Partial<AuditTrailConfig>) {
    this.config = {
      enabled: true,
      retentionDays: 365,
      complianceSettings: {
        gdprEnabled: false,
        hipaaEnabled: false,
        soxEnabled: false,
        contextAuditLevel: 'basic',
        contextDataLogging: true,
        customCompliance: []
      },
      ...config
    };
  }

  /**
   * 记录审计事件
   */
  async recordEvent(event: Omit<AuditEvent, 'eventId' | 'timestamp'>): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }

    try {
      const auditEvent: AuditEvent = {
        eventId: this.generateEventId(),
        timestamp: new Date(),
        ...event
      };

      // 验证事件数据
      const validation = this.validateEvent(auditEvent);
      if (!validation.isValid) {
        return false;
      }

      // 应用合规性过滤
      const filteredEvent = this.applyComplianceFiltering(auditEvent);

      // 存储事件
      const contextKey = event.contextId || 'global';
      const events = this.auditEvents.get(contextKey) || [];
      events.push(filteredEvent);
      
      // 应用保留策略
      this.applyRetentionPolicy(events);
      
      this.auditEvents.set(contextKey, events);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 查询审计事件
   */
  async queryEvents(options: AuditQueryOptions = {}): Promise<AuditEvent[]> {
    const allEvents: AuditEvent[] = [];

    // 收集所有相关事件
    for (const [contextKey, events] of this.auditEvents.entries()) {
      if (options.contextId && contextKey !== options.contextId) {
        continue;
      }
      allEvents.push(...events);
    }

    // 应用过滤条件
    const filteredEvents = allEvents.filter(event => {
      if (options.userId && event.userId !== options.userId) {
        return false;
      }
      if (options.eventType && event.eventType !== options.eventType) {
        return false;
      }
      if (options.startDate && event.timestamp < options.startDate) {
        return false;
      }
      if (options.endDate && event.timestamp > options.endDate) {
        return false;
      }
      return true;
    });

    // 按时间戳排序（最新的在前）
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 应用分页
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    
    return filteredEvents.slice(offset, offset + limit);
  }

  /**
   * 获取审计统计
   */
  async getStatistics(contextId?: UUID): Promise<AuditStatistics> {
    const events = contextId 
      ? (this.auditEvents.get(contextId) || [])
      : Array.from(this.auditEvents.values()).flat();

    const statistics: AuditStatistics = {
      totalEvents: events.length,
      eventsByType: {} as Record<AuditEventType, number>,
      eventsByUser: {},
      eventsByContext: {},
      complianceViolations: 0
    };

    // 初始化事件类型统计
    const eventTypes: AuditEventType[] = [
      'context_created', 'context_updated', 'context_deleted', 
      'context_accessed', 'context_shared', 'permission_changed', 
      'state_changed', 'cache_updated', 'sync_executed'
    ];
    
    eventTypes.forEach(type => {
      statistics.eventsByType[type] = 0;
    });

    // 统计事件
    events.forEach(event => {
      // 按类型统计
      statistics.eventsByType[event.eventType]++;

      // 按用户统计
      statistics.eventsByUser[event.userId] = 
        (statistics.eventsByUser[event.userId] || 0) + 1;

      // 按上下文统计
      if (event.contextId) {
        statistics.eventsByContext[event.contextId] = 
          (statistics.eventsByContext[event.contextId] || 0) + 1;
      }

      // 检查合规性违规
      if (this.isComplianceViolation(event)) {
        statistics.complianceViolations++;
      }
    });

    return statistics;
  }

  /**
   * 更新合规性设置
   */
  async updateComplianceSettings(settings: Partial<ComplianceSettings>): Promise<boolean> {
    try {
      this.config.complianceSettings = {
        ...this.config.complianceSettings!,
        ...settings
      };
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 导出审计日志
   */
  async exportAuditLog(options: AuditQueryOptions = {}): Promise<string> {
    const events = await this.queryEvents(options);
    
    // 转换为CSV格式
    const headers = [
      'Event ID', 'Event Type', 'Timestamp', 'User ID', 'User Role',
      'Action', 'Resource', 'Context ID', 'IP Address'
    ];
    
    const csvLines = [headers.join(',')];
    
    events.forEach(event => {
      const row = [
        event.eventId,
        event.eventType,
        event.timestamp.toISOString(),
        event.userId,
        event.userRole,
        event.action,
        event.resource,
        event.contextId || '',
        event.ipAddress || ''
      ];
      csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
  }

  /**
   * 清理过期事件
   */
  async cleanupExpiredEvents(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    
    let cleanedCount = 0;
    
    for (const [contextKey, events] of this.auditEvents.entries()) {
      const validEvents = events.filter(event => event.timestamp >= cutoffDate);
      cleanedCount += events.length - validEvents.length;
      this.auditEvents.set(contextKey, validEvents);
    }
    
    return cleanedCount;
  }

  /**
   * 获取默认配置
   */
  getDefaultConfig(): AuditTrailConfig {
    return {
      enabled: true,
      retentionDays: 365,
      complianceSettings: {
        gdprEnabled: false,
        hipaaEnabled: false,
        soxEnabled: false,
        contextAuditLevel: 'basic',
        contextDataLogging: true,
        customCompliance: []
      }
    };
  }

  // 私有方法
  private generateEventId(): UUID {
    return `audit-${Date.now()}-${Math.random().toString(36).substring(2, 11)}` as UUID;
  }

  private validateEvent(event: AuditEvent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!event.eventId) {
      errors.push('Event ID is required');
    }
    if (!event.userId) {
      errors.push('User ID is required');
    }
    if (!event.action) {
      errors.push('Action is required');
    }
    if (!event.resource) {
      errors.push('Resource is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private applyComplianceFiltering(event: AuditEvent): AuditEvent {
    const settings = this.config.complianceSettings!;
    const filteredEvent = { ...event };

    // GDPR合规性过滤
    if (settings.gdprEnabled && !settings.contextDataLogging) {
      delete filteredEvent.contextDetails;
      delete filteredEvent.oldValue;
      delete filteredEvent.newValue;
    }

    // HIPAA合规性过滤
    if (settings.hipaaEnabled) {
      delete filteredEvent.ipAddress;
      delete filteredEvent.userAgent;
    }

    return filteredEvent;
  }

  private applyRetentionPolicy(events: AuditEvent[]): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    
    // 移除过期事件
    const validEvents = events.filter(event => event.timestamp >= cutoffDate);
    events.length = 0;
    events.push(...validEvents);
  }

  private isComplianceViolation(event: AuditEvent): boolean {
    const settings = this.config.complianceSettings!;
    
    // 检查是否违反了合规性规则
    if (settings.gdprEnabled && event.contextDetails && !settings.contextDataLogging) {
      return true;
    }
    
    if (settings.hipaaEnabled && (event.ipAddress || event.userAgent)) {
      return true;
    }
    
    return false;
  }
}
