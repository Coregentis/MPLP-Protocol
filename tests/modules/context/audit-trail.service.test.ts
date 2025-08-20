/**
 * 审计跟踪服务测试
 */

import {
  AuditTrailService,
  AuditEvent,
  AuditEventType,
  AuditTrailConfig,
  ComplianceSettings,
  AuditQueryOptions,
  AuditLevel
} from '../../../src/modules/context/application/services/audit-trail.service';
import { UUID } from '../../../src/modules/context/types';

describe('AuditTrailService', () => {
  let service: AuditTrailService;
  let mockContextId: UUID;
  let mockUserId: string;

  beforeEach(() => {
    service = new AuditTrailService();
    mockContextId = 'context-123e4567-e89b-42d3-a456-426614174000' as UUID;
    mockUserId = 'user-123';
  });

  describe('getDefaultConfig', () => {
    it('应该返回默认审计配置', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig.enabled).toBe(true);
      expect(defaultConfig.retentionDays).toBe(365);
      expect(defaultConfig.complianceSettings?.gdprEnabled).toBe(false);
      expect(defaultConfig.complianceSettings?.hipaaEnabled).toBe(false);
      expect(defaultConfig.complianceSettings?.soxEnabled).toBe(false);
      expect(defaultConfig.complianceSettings?.contextAuditLevel).toBe('basic');
      expect(defaultConfig.complianceSettings?.contextDataLogging).toBe(true);
      expect(defaultConfig.complianceSettings?.customCompliance).toEqual([]);
    });
  });

  describe('recordEvent', () => {
    it('应该成功记录审计事件', async () => {
      const eventData = {
        eventType: 'context_created' as AuditEventType,
        userId: mockUserId,
        userRole: 'admin',
        action: 'create_context',
        resource: 'context',
        contextId: mockContextId,
        contextName: 'Test Context',
        ipAddress: '192.168.1.1'
      };

      const result = await service.recordEvent(eventData);

      expect(result).toBe(true);
    });

    it('应该在服务禁用时拒绝记录事件', async () => {
      const disabledService = new AuditTrailService({ enabled: false });
      
      const eventData = {
        eventType: 'context_created' as AuditEventType,
        userId: mockUserId,
        userRole: 'admin',
        action: 'create_context',
        resource: 'context'
      };

      const result = await disabledService.recordEvent(eventData);

      expect(result).toBe(false);
    });

    it('应该验证必需字段', async () => {
      const invalidEventData = {
        eventType: 'context_created' as AuditEventType,
        userRole: 'admin',
        // 缺少必需的userId, action, resource
      } as any;

      const result = await service.recordEvent(invalidEventData);

      expect(result).toBe(false);
    });

    it('应该自动生成事件ID和时间戳', async () => {
      const eventData = {
        eventType: 'context_updated' as AuditEventType,
        userId: mockUserId,
        userRole: 'user',
        action: 'update_context',
        resource: 'context',
        contextId: mockContextId
      };

      await service.recordEvent(eventData);
      
      const events = await service.queryEvents({ contextId: mockContextId });
      
      expect(events).toHaveLength(1);
      expect(events[0].eventId).toBeDefined();
      expect(events[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('queryEvents', () => {
    beforeEach(async () => {
      // 准备测试数据
      await service.recordEvent({
        eventType: 'context_created',
        userId: 'user1',
        userRole: 'admin',
        action: 'create',
        resource: 'context',
        contextId: mockContextId
      });

      await service.recordEvent({
        eventType: 'context_updated',
        userId: 'user2',
        userRole: 'user',
        action: 'update',
        resource: 'context',
        contextId: mockContextId
      });

      await service.recordEvent({
        eventType: 'context_accessed',
        userId: 'user1',
        userRole: 'admin',
        action: 'access',
        resource: 'context',
        contextId: 'other-context' as UUID
      });
    });

    it('应该查询所有事件', async () => {
      const events = await service.queryEvents();

      expect(events.length).toBeGreaterThanOrEqual(3);
    });

    it('应该按上下文ID过滤事件', async () => {
      const events = await service.queryEvents({ contextId: mockContextId });

      expect(events).toHaveLength(2);
      events.forEach(event => {
        expect(event.contextId).toBe(mockContextId);
      });
    });

    it('应该按用户ID过滤事件', async () => {
      const events = await service.queryEvents({ userId: 'user1' });

      expect(events.length).toBeGreaterThanOrEqual(2);
      events.forEach(event => {
        expect(event.userId).toBe('user1');
      });
    });

    it('应该按事件类型过滤事件', async () => {
      const events = await service.queryEvents({ eventType: 'context_created' });

      expect(events.length).toBeGreaterThanOrEqual(1);
      events.forEach(event => {
        expect(event.eventType).toBe('context_created');
      });
    });

    it('应该支持分页', async () => {
      const page1 = await service.queryEvents({ limit: 1, offset: 0 });
      const page2 = await service.queryEvents({ limit: 1, offset: 1 });

      expect(page1).toHaveLength(1);
      expect(page2).toHaveLength(1);
      expect(page1[0].eventId).not.toBe(page2[0].eventId);
    });

    it('应该按时间戳降序排序', async () => {
      const events = await service.queryEvents();

      for (let i = 1; i < events.length; i++) {
        expect(events[i-1].timestamp.getTime()).toBeGreaterThanOrEqual(
          events[i].timestamp.getTime()
        );
      }
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      // 准备测试数据
      await service.recordEvent({
        eventType: 'context_created',
        userId: 'user1',
        userRole: 'admin',
        action: 'create',
        resource: 'context',
        contextId: mockContextId
      });

      await service.recordEvent({
        eventType: 'context_created',
        userId: 'user2',
        userRole: 'user',
        action: 'create',
        resource: 'context',
        contextId: mockContextId
      });

      await service.recordEvent({
        eventType: 'context_updated',
        userId: 'user1',
        userRole: 'admin',
        action: 'update',
        resource: 'context',
        contextId: mockContextId
      });
    });

    it('应该返回正确的统计信息', async () => {
      const stats = await service.getStatistics();

      expect(stats.totalEvents).toBeGreaterThanOrEqual(3);
      expect(stats.eventsByType['context_created']).toBeGreaterThanOrEqual(2);
      expect(stats.eventsByType['context_updated']).toBeGreaterThanOrEqual(1);
      expect(stats.eventsByUser['user1']).toBeGreaterThanOrEqual(2);
      expect(stats.eventsByUser['user2']).toBeGreaterThanOrEqual(1);
    });

    it('应该支持按上下文过滤统计', async () => {
      const stats = await service.getStatistics(mockContextId);

      expect(stats.totalEvents).toBeGreaterThanOrEqual(3);
      expect(stats.eventsByContext[mockContextId]).toBeGreaterThanOrEqual(3);
    });

    it('应该包含所有事件类型的统计', async () => {
      const stats = await service.getStatistics();

      const expectedEventTypes: AuditEventType[] = [
        'context_created', 'context_updated', 'context_deleted',
        'context_accessed', 'context_shared', 'permission_changed',
        'state_changed', 'cache_updated', 'sync_executed'
      ];

      expectedEventTypes.forEach(eventType => {
        expect(stats.eventsByType).toHaveProperty(eventType);
        expect(typeof stats.eventsByType[eventType]).toBe('number');
      });
    });
  });

  describe('updateComplianceSettings', () => {
    it('应该成功更新合规性设置', async () => {
      const newSettings: Partial<ComplianceSettings> = {
        gdprEnabled: true,
        hipaaEnabled: true,
        contextAuditLevel: 'comprehensive'
      };

      const result = await service.updateComplianceSettings(newSettings);

      expect(result).toBe(true);
    });

    it('应该部分更新合规性设置', async () => {
      const partialSettings: Partial<ComplianceSettings> = {
        gdprEnabled: true
      };

      const result = await service.updateComplianceSettings(partialSettings);

      expect(result).toBe(true);
    });
  });

  describe('exportAuditLog', () => {
    beforeEach(async () => {
      await service.recordEvent({
        eventType: 'context_created',
        userId: mockUserId,
        userRole: 'admin',
        action: 'create',
        resource: 'context',
        contextId: mockContextId,
        ipAddress: '192.168.1.1'
      });
    });

    it('应该导出CSV格式的审计日志', async () => {
      const csvLog = await service.exportAuditLog();

      expect(csvLog).toContain('Event ID,Event Type,Timestamp');
      expect(csvLog).toContain('context_created');
      expect(csvLog).toContain(mockUserId);
      expect(csvLog).toContain('192.168.1.1');
    });

    it('应该支持过滤条件导出', async () => {
      const csvLog = await service.exportAuditLog({ 
        contextId: mockContextId,
        eventType: 'context_created'
      });

      expect(csvLog).toContain('context_created');
      expect(csvLog).not.toContain('context_updated');
    });
  });

  describe('cleanupExpiredEvents', () => {
    it('应该清理过期事件', async () => {
      // 创建一个保留期很短的服务
      const shortRetentionService = new AuditTrailService({ retentionDays: 0 });
      
      await shortRetentionService.recordEvent({
        eventType: 'context_created',
        userId: mockUserId,
        userRole: 'admin',
        action: 'create',
        resource: 'context'
      });

      // 等待一小段时间确保事件过期
      await new Promise(resolve => setTimeout(resolve, 10));

      const cleanedCount = await shortRetentionService.cleanupExpiredEvents();

      expect(cleanedCount).toBeGreaterThanOrEqual(1);
    });

    it('应该保留未过期的事件', async () => {
      await service.recordEvent({
        eventType: 'context_created',
        userId: mockUserId,
        userRole: 'admin',
        action: 'create',
        resource: 'context'
      });

      const cleanedCount = await service.cleanupExpiredEvents();

      expect(cleanedCount).toBe(0);
      
      const events = await service.queryEvents();
      expect(events.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('合规性过滤', () => {
    it('应该在GDPR启用时过滤敏感数据', async () => {
      const gdprService = new AuditTrailService({
        complianceSettings: {
          gdprEnabled: true,
          hipaaEnabled: false,
          soxEnabled: false,
          contextAuditLevel: 'basic',
          contextDataLogging: false,
          customCompliance: []
        }
      });

      await gdprService.recordEvent({
        eventType: 'context_updated',
        userId: mockUserId,
        userRole: 'user',
        action: 'update',
        resource: 'context',
        contextDetails: { sensitive: 'data' },
        oldValue: { old: 'value' },
        newValue: { new: 'value' }
      });

      const events = await gdprService.queryEvents();
      const event = events[0];

      expect(event.contextDetails).toBeUndefined();
      expect(event.oldValue).toBeUndefined();
      expect(event.newValue).toBeUndefined();
    });

    it('应该在HIPAA启用时过滤IP和用户代理', async () => {
      const hipaaService = new AuditTrailService({
        complianceSettings: {
          gdprEnabled: false,
          hipaaEnabled: true,
          soxEnabled: false,
          contextAuditLevel: 'basic',
          contextDataLogging: true,
          customCompliance: []
        }
      });

      await hipaaService.recordEvent({
        eventType: 'context_accessed',
        userId: mockUserId,
        userRole: 'user',
        action: 'access',
        resource: 'context',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      });

      const events = await hipaaService.queryEvents();
      const event = events[0];

      expect(event.ipAddress).toBeUndefined();
      expect(event.userAgent).toBeUndefined();
    });
  });
});
