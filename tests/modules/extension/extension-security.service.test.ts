/**
 * ExtensionSecurityService测试
 * 
 * @description 测试Extension安全服务的功能
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import {
  ExtensionSecurityService,
  ISecurityScanner,
  IPermissionManager,
  IAuditLogger,
  ScanExtensionRequest,
  SecurityScanResult,
  ValidatePermissionsRequest,
  PermissionValidationResult,
  GenerateSecurityReportRequest,
  SecurityReport,
  StaticAnalysisResult,
  DependencySecurityResult,
  MalwareDetectionResult,
  CodeSignatureResult
} from '../../../src/modules/extension/application/services/extension-security.service';
import { IExtensionRepository } from '../../../src/modules/extension/domain/repositories/extension.repository.interface';
import { ExtensionEntityData, ExtensionPermissions } from '../../../src/modules/extension/types';
import { UUID } from '../../../src/shared/types';

// Mock ExtensionRepository
const mockExtensionRepository: jest.Mocked<IExtensionRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByFilter: jest.fn(),
  findByContextId: jest.fn(),
  findByName: jest.fn(),
  search: jest.fn(),
  count: jest.fn(),
  exists: jest.fn(),
  nameExists: jest.fn(),
  getStatistics: jest.fn(),
  findRecentlyUpdatedExtensions: jest.fn(),
  createBatch: jest.fn(),
  updateBatch: jest.fn(),
  deleteBatch: jest.fn(),
  optimize: jest.fn()
};

// Mock SecurityScanner
const mockSecurityScanner: jest.Mocked<ISecurityScanner> = {
  performStaticAnalysis: jest.fn(),
  checkDependencies: jest.fn(),
  detectMalware: jest.fn(),
  validateCodeSignature: jest.fn()
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

describe('ExtensionSecurityService测试', () => {
  let service: ExtensionSecurityService;
  const testExtensionId = 'ext-test-001' as UUID;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();
    
    // 创建服务实例
    service = new ExtensionSecurityService(
      mockExtensionRepository,
      mockSecurityScanner,
      mockPermissionManager,
      mockAuditLogger
    );
  });

  const createMockExtension = (): ExtensionEntityData => ({
    extensionId: testExtensionId,
    name: 'Test Extension',
    version: '1.0.0',
    status: 'enabled',
    extensionType: 'api',
    contextId: 'ctx-001' as UUID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    protocolVersion: '1.0.0',
    description: 'Test extension',
    author: 'Test Author',
    tags: ['test'],
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
      extensionPoints: [],
      apiExtensions: [],
      eventSubscriptions: []
    },
    security: {
      sandboxEnabled: true,
      resourceLimits: {
        maxMemory: 100,
        maxCpu: 50,
        maxFileSize: 1000,
        maxNetworkConnections: 10,
        allowedDomains: [],
        blockedDomains: [],
        allowedHosts: [],
        allowedPorts: [],
        protocols: []
      },
      codeSigning: {
        required: false,
        trustedSigners: []
      },
      permissions: {
        fileSystem: { read: [], write: [], execute: [] },
        network: { allowedHosts: [], allowedPorts: [], protocols: [] },
        database: { read: [], write: [], admin: [] },
        api: { endpoints: [], methods: [], rateLimit: 100 }
      }
    },
    performanceMetrics: {
      responseTime: 50,
      throughput: 100,
      errorRate: 0.01,
      resourceUsage: {
        memory: 80,
        cpu: 30,
        network: 5,
        storage: 500
      }
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
    versionHistory: [],
    searchMetadata: {
      keywords: ['test'],
      categories: ['testing'],
      popularity: 0,
      rating: 0,
      downloadCount: 0
    },
    eventIntegration: {
      publishedEvents: [],
      subscribedEvents: [],
      eventHandlers: []
    }
  });

  describe('scanExtensionSecurity', () => {
    it('应该成功执行安全扫描', async () => {
      // Arrange
      const mockExtension = createMockExtension();
      const request: ScanExtensionRequest = {
        extensionId: testExtensionId,
        scanType: 'full',
        includeCompliance: true,
        userId: 'user-001' as UUID
      };

      const mockStaticAnalysis: StaticAnalysisResult = {
        codeQuality: 85,
        vulnerabilities: [],
        suspiciousPatterns: [],
        riskScore: 10
      };

      const mockDependencyCheck: DependencySecurityResult = {
        vulnerableDependencies: [],
        outdatedDependencies: [],
        riskScore: 5
      };

      const mockMalwareCheck: MalwareDetectionResult = {
        isMalicious: false,
        confidence: 95,
        detectedPatterns: [],
        riskScore: 0
      };

      const mockSignatureCheck: CodeSignatureResult = {
        isValid: true,
        signer: 'Test Signer',
        signedAt: new Date().toISOString(),
        trustLevel: 'trusted'
      };

      const mockPermissionValidation: PermissionValidationResult = {
        isValid: true,
        violations: [],
        warnings: [],
        recommendations: []
      };

      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockSecurityScanner.performStaticAnalysis.mockResolvedValue(mockStaticAnalysis);
      mockSecurityScanner.checkDependencies.mockResolvedValue(mockDependencyCheck);
      mockSecurityScanner.detectMalware.mockResolvedValue(mockMalwareCheck);
      mockSecurityScanner.validateCodeSignature.mockResolvedValue(mockSignatureCheck);
      mockPermissionManager.validatePermissions.mockResolvedValue(mockPermissionValidation);
      mockAuditLogger.logSecurityEvent.mockResolvedValue();

      // Act
      const result = await service.scanExtensionSecurity(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.extensionId).toBe(testExtensionId);
      expect(result.scanType).toBe('full');
      expect(result.status).toBe('completed');
      expect(result.overallRisk).toBe('low');
      expect(mockExtensionRepository.findById).toHaveBeenCalledWith(testExtensionId);
      expect(mockSecurityScanner.performStaticAnalysis).toHaveBeenCalledWith(mockExtension);
      expect(mockSecurityScanner.checkDependencies).toHaveBeenCalledWith(mockExtension);
      expect(mockSecurityScanner.detectMalware).toHaveBeenCalledWith(mockExtension);
      expect(mockSecurityScanner.validateCodeSignature).toHaveBeenCalledWith(mockExtension);
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalled();
    });

    it('应该在扩展不存在时抛出错误', async () => {
      // Arrange
      const request: ScanExtensionRequest = {
        extensionId: testExtensionId,
        scanType: 'quick'
      };

      mockExtensionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.scanExtensionSecurity(request))
        .rejects.toThrow(`Extension ${testExtensionId} not found`);
    });

    it('应该处理扫描失败的情况', async () => {
      // Arrange
      const mockExtension = createMockExtension();
      const request: ScanExtensionRequest = {
        extensionId: testExtensionId,
        scanType: 'full'
      };

      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockSecurityScanner.performStaticAnalysis.mockRejectedValue(new Error('Scan failed'));
      mockAuditLogger.logSecurityEvent.mockResolvedValue();

      // Act
      const result = await service.scanExtensionSecurity(request);

      // Assert
      expect(result.status).toBe('failed');
      expect(result.overallRisk).toBe('high');
      expect(result.recommendations).toContain('扫描失败，建议手动检查扩展安全性');
      expect(mockAuditLogger.logSecurityEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'scan',
          severity: 'high',
          description: expect.stringContaining('Security scan failed')
        })
      );
    });
  });

  describe('validateExtensionPermissions', () => {
    it('应该成功验证扩展权限', async () => {
      // Arrange
      const mockExtension = createMockExtension();
      const requestedPermissions: ExtensionPermissions = {
        fileSystem: { read: ['/tmp'], write: [], execute: [] },
        network: { allowedHosts: ['api.example.com'], allowedPorts: [443], protocols: ['https'] },
        database: { read: ['users'], write: [], admin: [] },
        api: { endpoints: ['/api/data'], methods: ['GET'], rateLimit: 100 }
      };

      const request: ValidatePermissionsRequest = {
        extensionId: testExtensionId,
        requestedPermissions,
        userId: 'user-001' as UUID
      };

      const mockValidationResult: PermissionValidationResult = {
        isValid: true,
        violations: [],
        warnings: [],
        recommendations: []
      };

      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockPermissionManager.validatePermissions.mockResolvedValue(mockValidationResult);
      mockAuditLogger.logPermissionEvent.mockResolvedValue();

      // Act
      const result = await service.validateExtensionPermissions(request);

      // Assert
      expect(result).toEqual(mockValidationResult);
      expect(mockExtensionRepository.findById).toHaveBeenCalledWith(testExtensionId);
      expect(mockPermissionManager.validatePermissions).toHaveBeenCalledWith(testExtensionId, requestedPermissions);
      expect(mockAuditLogger.logPermissionEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          extensionId: testExtensionId,
          userId: request.userId,
          operation: 'permission_validation',
          granted: true
        })
      );
    });

    it('应该处理权限验证失败的情况', async () => {
      // Arrange
      const mockExtension = createMockExtension();
      const requestedPermissions: ExtensionPermissions = {
        fileSystem: { read: ['/etc'], write: ['/etc'], execute: ['/bin/sh'] },
        network: { allowedHosts: ['*'], allowedPorts: [22, 23], protocols: ['ssh', 'telnet'] },
        database: { read: ['*'], write: ['*'], admin: ['*'] },
        api: { endpoints: ['*'], methods: ['*'], rateLimit: 0 }
      };

      const request: ValidatePermissionsRequest = {
        extensionId: testExtensionId,
        requestedPermissions
      };

      const mockValidationResult: PermissionValidationResult = {
        isValid: false,
        violations: [
          {
            permission: 'fileSystem.write',
            reason: 'Write access to system directories not allowed',
            severity: 'high',
            remediation: 'Request write access to user directories only'
          }
        ],
        warnings: ['Excessive network permissions requested'],
        recommendations: ['Limit permissions to minimum required']
      };

      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockPermissionManager.validatePermissions.mockResolvedValue(mockValidationResult);
      mockAuditLogger.logPermissionEvent.mockResolvedValue();

      // Act
      const result = await service.validateExtensionPermissions(request);

      // Assert
      expect(result).toEqual(mockValidationResult);
      expect(result.isValid).toBe(false);
      expect(result.violations).toHaveLength(1);
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
      const mockExtension = createMockExtension();
      const operation = 'read_file';
      const userId = 'user-001' as UUID;

      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockPermissionManager.enforcePermissions.mockResolvedValue(true);
      mockPermissionManager.auditPermissionUsage.mockResolvedValue();
      mockAuditLogger.logPermissionEvent.mockResolvedValue();

      // Act
      const result = await service.enforcePermissions(testExtensionId, operation, userId);

      // Assert
      expect(result).toBe(true);
      expect(mockExtensionRepository.findById).toHaveBeenCalledWith(testExtensionId);
      expect(mockPermissionManager.enforcePermissions).toHaveBeenCalledWith(testExtensionId, operation);
      expect(mockPermissionManager.auditPermissionUsage).toHaveBeenCalledWith(testExtensionId, operation, userId);
      expect(mockAuditLogger.logPermissionEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          extensionId: testExtensionId,
          userId,
          operation,
          permission: operation,
          granted: true,
          reason: 'Permission granted'
        })
      );
    });

    it('应该拒绝未授权的操作', async () => {
      // Arrange
      const mockExtension = createMockExtension();
      const operation = 'write_system_file';
      const userId = 'user-001' as UUID;

      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockPermissionManager.enforcePermissions.mockResolvedValue(false);
      mockPermissionManager.auditPermissionUsage.mockResolvedValue();
      mockAuditLogger.logPermissionEvent.mockResolvedValue();

      // Act
      const result = await service.enforcePermissions(testExtensionId, operation, userId);

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
      const mockExtension = createMockExtension();
      const request: GenerateSecurityReportRequest = {
        extensionId: testExtensionId,
        reportType: 'comprehensive',
        includeRecommendations: true
      };

      // Mock所有扫描结果
      mockExtensionRepository.findById.mockResolvedValue(mockExtension);
      mockSecurityScanner.performStaticAnalysis.mockResolvedValue({
        codeQuality: 85,
        vulnerabilities: [],
        suspiciousPatterns: [],
        riskScore: 10
      });
      mockSecurityScanner.checkDependencies.mockResolvedValue({
        vulnerableDependencies: [],
        outdatedDependencies: [],
        riskScore: 5
      });
      mockSecurityScanner.detectMalware.mockResolvedValue({
        isMalicious: false,
        confidence: 95,
        detectedPatterns: [],
        riskScore: 0
      });
      mockSecurityScanner.validateCodeSignature.mockResolvedValue({
        isValid: true,
        signer: 'Test Signer',
        signedAt: new Date().toISOString(),
        trustLevel: 'trusted'
      });
      mockPermissionManager.validatePermissions.mockResolvedValue({
        isValid: true,
        violations: [],
        warnings: [],
        recommendations: []
      });
      mockAuditLogger.logSecurityEvent.mockResolvedValue();

      // Act
      const result = await service.generateSecurityReport(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.extensionId).toBe(testExtensionId);
      expect(result.reportType).toBe('comprehensive');
      expect(result.summary).toBeDefined();
      expect(result.summary.overallRisk).toBe('low');
      expect(result.findings).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.complianceStatus).toBeDefined();
    });
  });
});
