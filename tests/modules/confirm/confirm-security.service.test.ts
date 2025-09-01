/**
 * MPLP Confirm Module - Security Service Tests
 * @description 企业级审批工作流安全服务测试 - 严格基于Schema驱动开发
 * @version 1.0.0
 * @module ConfirmSecurityServiceTest
 */

import { ConfirmSecurityService, ISecurityManager, IAuditLogger, PermissionValidationResult, SecurityAuditEntry, ComplianceCheckResult, SuspiciousActivityResult } from '../../../src/modules/confirm/application/services/confirm-security.service';
import { IConfirmRepository } from '../../../src/modules/confirm/domain/repositories/confirm-repository.interface';
import { ConfirmEntity } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import { UUID } from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData } from './test-data-factory';

// Mock Repository
const mockRepository: jest.Mocked<IConfirmRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByFilter: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  findByContextId: jest.fn(),
  findByPlanId: jest.fn(),
  findByRequesterId: jest.fn(),
  findByApproverId: jest.fn(),
  findByStatus: jest.fn(),
  findByPriority: jest.fn(),
  findByType: jest.fn(),
  findByDateRange: jest.fn(),
  updateBatch: jest.fn(),
  deleteBatch: jest.fn(),
  clear: jest.fn(),
  getStatistics: jest.fn()
} as any;

// Mock Security Manager
const mockSecurityManager: jest.Mocked<ISecurityManager> = {
  validateUserPermissions: jest.fn(),
  logSecurityEvent: jest.fn(),
  checkCompliance: jest.fn(),
  detectSuspiciousActivity: jest.fn()
};

// Mock Audit Logger
const mockAuditLogger: jest.Mocked<IAuditLogger> = {
  logApprovalAction: jest.fn(),
  logAccessAttempt: jest.fn(),
  logSecurityViolation: jest.fn(),
  logSecurityEvent: jest.fn(),
  getAuditTrail: jest.fn()
};

describe('ConfirmSecurityService测试', () => {
  let securityService: ConfirmSecurityService;
  let mockConfirmEntity: ConfirmEntity;

  beforeEach(() => {
    securityService = new ConfirmSecurityService(mockRepository, mockSecurityManager, mockAuditLogger);
    
    const mockData = createMockConfirmEntityData({
      confirmId: 'confirm-security-001',
      status: 'pending'
    });
    mockConfirmEntity = new ConfirmEntity(mockData);
    
    jest.clearAllMocks();
  });

  describe('validateApprovalPermissions方法测试', () => {
    it('应该成功验证有效的审批权限', async () => {
      const userId = 'tech-lead-001'; // 这个用户在测试数据的审批工作流中
      const confirmId = 'confirm-security-001' as UUID;
      const action = 'approve';

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.validateUserPermissions.mockResolvedValue(true);

      const result = await securityService.validateApprovalPermissions(userId, confirmId, action);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockSecurityManager.validateUserPermissions).toHaveBeenCalledWith(userId, action, confirmId);
      expect(mockAuditLogger.logApprovalAction).toHaveBeenCalled();
      expect(result.isValid).toBe(true);
      expect(result.userId).toBe(userId);
      expect(result.violations).toHaveLength(0);
    });

    it('应该拒绝不存在的确认请求', async () => {
      const userId = 'user-001';
      const confirmId = 'non-existent' as UUID;
      const action = 'approve';

      mockRepository.findById.mockResolvedValue(null);

      const result = await securityService.validateApprovalPermissions(userId, confirmId, action);

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Confirm request non-existent not found');
    });

    it('应该拒绝未授权用户的审批请求', async () => {
      const userId = 'unauthorized-user';
      const confirmId = 'confirm-security-001' as UUID;
      const action = 'approve';

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);

      const result = await securityService.validateApprovalPermissions(userId, confirmId, action);

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('User not authorized for this approval workflow');
      expect(mockAuditLogger.logSecurityViolation).toHaveBeenCalled();
    });

    it('应该拒绝系统权限不足的用户', async () => {
      const userId = 'tech-lead-001';
      const confirmId = 'confirm-security-001' as UUID;
      const action = 'approve';

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.validateUserPermissions.mockResolvedValue(false);

      const result = await securityService.validateApprovalPermissions(userId, confirmId, action);

      expect(result.isValid).toBe(false);
      expect(result.violations).toContain('Insufficient system permissions');
    });
  });

  describe('performSecurityAudit方法测试', () => {
    it('应该成功执行安全审计', async () => {
      const confirmId = 'confirm-security-001' as UUID;
      const mockSuspiciousActivities: SuspiciousActivityResult[] = [];

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.detectSuspiciousActivity.mockResolvedValue(mockSuspiciousActivities);

      const result = await securityService.performSecurityAudit(confirmId);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockSecurityManager.detectSuspiciousActivity).toHaveBeenCalledWith(confirmId);
      expect(Array.isArray(result)).toBe(true);
    });

    it('应该处理不存在的确认请求', async () => {
      const confirmId = 'non-existent' as UUID;
      mockRepository.findById.mockResolvedValue(null);

      await expect(securityService.performSecurityAudit(confirmId))
        .rejects.toThrow('Confirm request non-existent not found');
    });

    it('应该记录可疑活动', async () => {
      const confirmId = 'confirm-security-001' as UUID;
      const mockSuspiciousActivities: SuspiciousActivityResult[] = [{
        confirmId,
        activityType: 'unusual_approval_pattern',
        severity: 'medium',
        description: 'Unusual approval pattern detected',
        timestamp: new Date(),
        userId: 'user-001',
        riskScore: 75,
        recommendedActions: ['Review approval pattern']
      }];

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.detectSuspiciousActivity.mockResolvedValue(mockSuspiciousActivities);

      const result = await securityService.performSecurityAudit(confirmId);

      expect(result.length).toBeGreaterThan(0);
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalled();
    });
  });

  describe('checkCompliance方法测试', () => {
    it('应该成功检查合规性', async () => {
      const confirmId = 'confirm-security-001' as UUID;
      const mockComplianceResult: ComplianceCheckResult = {
        confirmId,
        isCompliant: true,
        regulations: [{
          name: 'SOX',
          status: 'compliant',
          details: 'All requirements met'
        }],
        violations: [],
        recommendations: [],
        complianceScore: 95
      };

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.checkCompliance.mockResolvedValue(mockComplianceResult);

      const result = await securityService.checkCompliance(confirmId);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockSecurityManager.checkCompliance).toHaveBeenCalledWith(confirmId);
      expect(mockAuditLogger.logApprovalAction).toHaveBeenCalled();
      expect(result).toEqual(mockComplianceResult);
    });

    it('应该处理不合规的情况', async () => {
      const confirmId = 'confirm-security-001' as UUID;
      const mockComplianceResult: ComplianceCheckResult = {
        confirmId,
        isCompliant: false,
        regulations: [{
          name: 'GDPR',
          status: 'non-compliant',
          details: 'Missing data protection measures'
        }],
        violations: ['Data protection violation'],
        recommendations: ['Implement data encryption'],
        complianceScore: 45
      };

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.checkCompliance.mockResolvedValue(mockComplianceResult);

      const result = await securityService.checkCompliance(confirmId);

      expect(result.isCompliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.complianceScore).toBeLessThan(50);
    });
  });

  describe('monitorSuspiciousActivity方法测试', () => {
    it('应该成功监控可疑活动', async () => {
      const confirmId = 'confirm-security-001' as UUID;
      const mockSuspiciousActivities: SuspiciousActivityResult[] = [{
        confirmId,
        activityType: 'rapid_decisions',
        severity: 'high',
        description: 'Multiple rapid approval decisions',
        timestamp: new Date(),
        userId: 'user-001',
        riskScore: 85,
        recommendedActions: ['Review decision timeline', 'Verify user identity']
      }];

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.detectSuspiciousActivity.mockResolvedValue(mockSuspiciousActivities);

      const result = await securityService.monitorSuspiciousActivity(confirmId);

      expect(result).toEqual(mockSuspiciousActivities);
      expect(mockAuditLogger.logSecurityViolation).toHaveBeenCalled();
    });

    it('应该处理无可疑活动的情况', async () => {
      const confirmId = 'confirm-security-001' as UUID;

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.detectSuspiciousActivity.mockResolvedValue([]);

      const result = await securityService.monitorSuspiciousActivity(confirmId);

      expect(result).toHaveLength(0);
    });
  });

  describe('getSecurityAuditTrail方法测试', () => {
    it('应该成功获取安全审计跟踪', async () => {
      const confirmId = 'confirm-security-001' as UUID;
      const mockAuditTrail: SecurityAuditEntry[] = [{
        auditId: 'audit-001' as UUID,
        confirmId,
        userId: 'user-001',
        action: 'approval_approve',
        timestamp: new Date(),
        result: 'success',
        details: 'Approval granted',
        riskLevel: 'low'
      }];

      mockAuditLogger.getAuditTrail.mockResolvedValue(mockAuditTrail);

      const result = await securityService.getSecurityAuditTrail(confirmId);

      expect(mockAuditLogger.getAuditTrail).toHaveBeenCalledWith(confirmId);
      expect(result).toEqual(mockAuditTrail);
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内验证权限', async () => {
      const userId = 'tech-lead-001';
      const confirmId = 'confirm-security-001' as UUID;
      const action = 'approve';

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.validateUserPermissions.mockResolvedValue(true);

      const startTime = Date.now();
      await securityService.validateApprovalPermissions(userId, confirmId, action);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该在合理时间内执行安全审计', async () => {
      const confirmId = 'confirm-security-001' as UUID;

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockSecurityManager.detectSuspiciousActivity.mockResolvedValue([]);

      const startTime = Date.now();
      await securityService.performSecurityAudit(confirmId);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200); // 应该在200ms内完成
    });
  });
});
