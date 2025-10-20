/**
 * DialogSecurityService测试
 * 
 * @description 测试Dialog安全服务的功能
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import {
  DialogSecurityService,
  ISecurityScanner,
  IPermissionManager,
  IAuditLogger,
  ScanDialogSecurityRequest,
  ValidateDialogPermissionsRequest,
  GenerateSecurityReportRequest,
  DialogSecurityScanResult,
  SecurityScanResult,
  PermissionCheckResult,
  ThreatDetectionResult,
  PermissionValidationResult
} from '../../../../src/modules/dialog/application/services/dialog-security.service';
import { DialogRepository } from '../../../../src/modules/dialog/domain/repositories/dialog.repository';
import { DialogEntity } from '../../../../src/modules/dialog/domain/entities/dialog.entity';
import { UUID } from '../../../../src/modules/dialog/types';

// Mock DialogRepository
const mockDialogRepository: jest.Mocked<DialogRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  findByParticipant: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  count: jest.fn(),
  search: jest.fn(),
  findActiveDialogs: jest.fn(),
  findByCapability: jest.fn()
};

// Mock SecurityScanner
const mockSecurityScanner: jest.Mocked<ISecurityScanner> = {
  performSecurityScan: jest.fn(),
  checkPermissions: jest.fn(),
  validateContent: jest.fn(),
  detectThreats: jest.fn()
};

// Mock PermissionManager
const mockPermissionManager: jest.Mocked<IPermissionManager> = {
  validatePermissions: jest.fn(),
  enforcePermissions: jest.fn(),
  auditPermissionUsage: jest.fn()
};

// Mock AuditLogger
const mockAuditLogger: jest.Mocked<IAuditLogger> = {
  logSecurityEvent: jest.fn(),
  logPermissionEvent: jest.fn(),
  logComplianceEvent: jest.fn()
};

describe('DialogSecurityService测试', () => {
  let service: DialogSecurityService;
  const testDialogId = 'dialog-test-001' as UUID;
  const testUserId = 'user-test-001' as UUID;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 创建服务实例
    service = new DialogSecurityService(
      mockDialogRepository,
      mockSecurityScanner,
      mockPermissionManager,
      mockAuditLogger
    );
  });

  const createMockDialog = (): DialogEntity => ({
    dialogId: testDialogId,
    name: 'Test Dialog',
    description: 'Test dialog for security',
    participants: ['user-001', 'agent-001'],
    capabilities: {
      basic: { enabled: true },
      intelligentControl: { enabled: true, settings: {} },
      criticalThinking: { enabled: false },
      knowledgeSearch: { enabled: true, settings: {} },
      multimodal: { enabled: false },
      contextAwareness: { enabled: true, settings: {} },
      emotionalIntelligence: { enabled: false },
      creativeGeneration: { enabled: false },
      ethicalReasoning: { enabled: false },
      adaptiveLearning: { enabled: false }
    },
    strategy: {
      type: 'adaptive',
      settings: {
        maxTurns: 50,
        timeout: 1800,
        exitConditions: ['goal_achieved', 'timeout']
      }
    },
    context: {
      sessionId: 'session-001',
      environment: 'production',
      metadata: {}
    },
    configuration: {
      settings: {},
      environment: {},
      resources: {
        memory: 100,
        cpu: 50,
        storage: 1000,
        network: 10
      },
      dependencies: [],
      integrations: []
    },
    metadata: {},
    auditTrail: {
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedBy: 'system',
      updatedAt: new Date().toISOString(),
      version: 1,
      changes: []
    },
    monitoringIntegration: {
      healthCheckEndpoint: '/health',
      metricsEndpoint: '/metrics',
      loggingLevel: 'info',
      alerting: {
        enabled: true,
        thresholds: {
          errorRate: 0.05,
          responseTime: 1000,
          memoryUsage: 90,
          cpuUsage: 80
        }
      }
    },
    performanceMetrics: {
      responseTime: 85,
      throughput: 100,
      errorRate: 0.02,
      resourceUsage: {
        memory: 65,
        cpu: 45,
        network: 30,
        storage: 500
      }
    },
    versionHistory: [],
    searchMetadata: {
      keywords: ['test', 'security'],
      categories: ['testing'],
      popularity: 0,
      rating: 0,
      downloadCount: 0
    },
    dialogOperation: 'start',
    dialogDetails: {
      currentTurn: 1,
      totalTurns: 0,
      status: 'active',
      lastActivity: new Date().toISOString(),
      participants: ['user-001', 'agent-001']
    },
    eventIntegration: {
      publishedEvents: [],
      subscribedEvents: [],
      eventHandlers: []
    },
    protocolVersion: '1.0.0',
    timestamp: new Date().toISOString()
  });

  describe('scanDialogSecurity', () => {
    it('应该成功执行安全扫描', async () => {
      // Arrange
      const mockDialog = createMockDialog();
      const request: ScanDialogSecurityRequest = {
        dialogId: testDialogId,
        scanType: 'full',
        includeContent: true,
        userId: testUserId
      };

      const mockScanResult: SecurityScanResult = {
        riskLevel: 'low',
        vulnerabilities: [],
        recommendations: ['继续保持良好的安全实践']
      };

      const mockPermissionResult: PermissionCheckResult = {
        hasPermission: true,
        missingPermissions: [],
        warnings: []
      };

      const mockThreatResult: ThreatDetectionResult = {
        threatsDetected: false,
        threats: [],
        riskScore: 10
      };

      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockSecurityScanner.performSecurityScan.mockResolvedValue(mockScanResult);
      mockSecurityScanner.checkPermissions.mockResolvedValue(mockPermissionResult);
      mockSecurityScanner.detectThreats.mockResolvedValue(mockThreatResult);
      mockAuditLogger.logSecurityEvent.mockResolvedValue();

      // Act
      const result = await service.scanDialogSecurity(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.dialogId).toBe(testDialogId);
      expect(result.scanType).toBe('full');
      expect(result.status).toBe('completed');
      expect(result.overallRisk).toBe('low');
      expect(mockDialogRepository.findById).toHaveBeenCalledWith(testDialogId);
      expect(mockSecurityScanner.performSecurityScan).toHaveBeenCalledWith(mockDialog);
      expect(mockSecurityScanner.checkPermissions).toHaveBeenCalledWith(mockDialog, testUserId);
      expect(mockSecurityScanner.detectThreats).toHaveBeenCalledWith(mockDialog);
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalled();
    });

    it('应该在对话不存在时抛出错误', async () => {
      // Arrange
      const request: ScanDialogSecurityRequest = {
        dialogId: testDialogId,
        scanType: 'quick'
      };

      mockDialogRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.scanDialogSecurity(request))
        .rejects.toThrow(`Dialog ${testDialogId} not found`);
    });

    it('应该处理扫描失败的情况', async () => {
      // Arrange
      const mockDialog = createMockDialog();
      const request: ScanDialogSecurityRequest = {
        dialogId: testDialogId,
        scanType: 'full'
      };

      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockSecurityScanner.performSecurityScan.mockRejectedValue(new Error('Scan failed'));
      mockAuditLogger.logSecurityEvent.mockResolvedValue();

      // Act
      const result = await service.scanDialogSecurity(request);

      // Assert
      expect(result.status).toBe('failed');
      expect(result.overallRisk).toBe('high');
      expect(result.recommendations).toContain('扫描失败，建议手动检查对话安全性');
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'security_scan',
          severity: 'high',
          description: expect.stringContaining('Security scan failed')
        })
      );
    });
  });

  describe('validateDialogPermissions', () => {
    it('应该成功验证对话权限', async () => {
      // Arrange
      const mockDialog = createMockDialog();
      const request: ValidateDialogPermissionsRequest = {
        dialogId: testDialogId,
        userId: testUserId,
        requestedOperations: ['read', 'write']
      };

      const mockValidationResult: PermissionValidationResult = {
        isValid: true,
        violations: [],
        warnings: [],
        recommendations: []
      };

      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockPermissionManager.validatePermissions.mockResolvedValue(mockValidationResult);
      mockAuditLogger.logPermissionEvent.mockResolvedValue();

      // Act
      const result = await service.validateDialogPermissions(request);

      // Assert
      expect(result).toEqual(mockValidationResult);
      expect(mockDialogRepository.findById).toHaveBeenCalledWith(testDialogId);
      expect(mockPermissionManager.validatePermissions).toHaveBeenCalledTimes(2); // read + write
      expect(mockAuditLogger.logPermissionEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          dialogId: testDialogId,
          userId: testUserId,
          operation: 'read,write',
          granted: true
        })
      );
    });

    it('应该处理权限验证失败的情况', async () => {
      // Arrange
      const mockDialog = createMockDialog();
      const request: ValidateDialogPermissionsRequest = {
        dialogId: testDialogId,
        userId: testUserId,
        requestedOperations: ['admin']
      };

      const mockValidationResult: PermissionValidationResult = {
        isValid: false,
        violations: [
          {
            operation: 'admin',
            reason: 'Insufficient privileges',
            severity: 'high',
            remediation: 'Request admin privileges from system administrator'
          }
        ],
        warnings: ['Admin operations require special authorization'],
        recommendations: ['Contact system administrator for elevated permissions']
      };

      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockPermissionManager.validatePermissions.mockResolvedValue(mockValidationResult);
      mockAuditLogger.logPermissionEvent.mockResolvedValue();

      // Act
      const result = await service.validateDialogPermissions(request);

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].operation).toBe('admin');
      expect(mockAuditLogger.logPermissionEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          granted: false,
          reason: 'Permission violations detected'
        })
      );
    });
  });

  describe('enforcePermissions', () => {
    it('应该成功强制执行权限检查', async () => {
      // Arrange
      const mockDialog = createMockDialog();
      const operation = 'read';

      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockPermissionManager.enforcePermissions.mockResolvedValue(true);
      mockPermissionManager.auditPermissionUsage.mockResolvedValue();
      mockAuditLogger.logPermissionEvent.mockResolvedValue();

      // Act
      const result = await service.enforcePermissions(testDialogId, testUserId, operation);

      // Assert
      expect(result).toBe(true);
      expect(mockDialogRepository.findById).toHaveBeenCalledWith(testDialogId);
      expect(mockPermissionManager.enforcePermissions).toHaveBeenCalledWith(testDialogId, testUserId, operation);
      expect(mockPermissionManager.auditPermissionUsage).toHaveBeenCalledWith(testDialogId, testUserId, operation);
      expect(mockAuditLogger.logPermissionEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          dialogId: testDialogId,
          userId: testUserId,
          operation,
          granted: true,
          reason: 'Permission granted'
        })
      );
    });

    it('应该拒绝未授权的操作', async () => {
      // Arrange
      const mockDialog = createMockDialog();
      const operation = 'delete';

      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockPermissionManager.enforcePermissions.mockResolvedValue(false);
      mockPermissionManager.auditPermissionUsage.mockResolvedValue();
      mockAuditLogger.logPermissionEvent.mockResolvedValue();

      // Act
      const result = await service.enforcePermissions(testDialogId, testUserId, operation);

      // Assert
      expect(result).toBe(false);
      expect(mockAuditLogger.logPermissionEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          granted: false,
          reason: 'Permission denied'
        })
      );
    });
  });

  describe('generateSecurityReport', () => {
    it('应该生成综合安全报告', async () => {
      // Arrange
      const mockDialog = createMockDialog();
      const request: GenerateSecurityReportRequest = {
        dialogId: testDialogId,
        reportType: 'comprehensive',
        includeRecommendations: true
      };

      // Mock所有扫描结果
      mockDialogRepository.findById.mockResolvedValue(mockDialog);
      mockSecurityScanner.performSecurityScan.mockResolvedValue({
        riskLevel: 'low',
        vulnerabilities: [],
        recommendations: []
      });
      mockSecurityScanner.detectThreats.mockResolvedValue({
        threatsDetected: false,
        threats: [],
        riskScore: 5
      });

      // Act
      const result = await service.generateSecurityReport(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.dialogId).toBe(testDialogId);
      expect(result.reportType).toBe('comprehensive');
      expect(result.summary).toBeDefined();
      expect(result.summary.overallRisk).toBe('low');
      expect(result.findings).toBeDefined();
      expect(result.complianceStatus).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });
  });
});
