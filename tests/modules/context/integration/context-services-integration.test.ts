/**
 * Context服务集成测试 - GLFB反馈循环验证
 * 
 * @description 基于GLFB反馈循环机制，验证3个核心服务的集成效果和协作正确性
 * 验证：ContextManagementService、ContextAnalyticsService、ContextSecurityService的协作
 * @version 2.0.0
 * @layer 测试层 - 集成测试
 * @refactor 17→3服务简化后的集成验证
 */

import { ContextManagementService } from '../../../../src/modules/context/application/services/context-management.service';
import { ContextAnalyticsService } from '../../../../src/modules/context/application/services/context-analytics.service';
import { ContextSecurityService } from '../../../../src/modules/context/application/services/context-security.service';
import { ContextEntity } from '../../../../src/modules/context/domain/entities/context.entity';
import { IContextRepository } from '../../../../src/modules/context/domain/repositories/context-repository.interface';
import { UUID } from '../../../../src/shared/types';

// ===== Mock接口实现 =====
const mockContextRepository: jest.Mocked<IContextRepository> = {
  findById: jest.fn(),
  findByName: jest.fn(),
  findByNames: jest.fn(),
  findByFilter: jest.fn(),
  findByTimeRange: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countByFilter: jest.fn(),
  healthCheck: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn()
};

const mockVersionManager = {
  createVersion: jest.fn(),
  getVersionHistory: jest.fn(),
  getVersion: jest.fn(),
  compareVersions: jest.fn()
};

const mockAnalyticsEngine = {
  analyzeUsage: jest.fn(),
  analyzePatterns: jest.fn(),
  generateInsights: jest.fn()
};

const mockSearchEngine = {
  search: jest.fn(),
  indexDocument: jest.fn(),
  updateIndex: jest.fn(),
  deleteFromIndex: jest.fn()
};

const mockMetricsCollector = {
  getContextMetrics: jest.fn(),
  getUsageMetrics: jest.fn(),
  recordMetric: jest.fn()
};

const mockSecurityManager = {
  getUserContext: jest.fn(),
  getUserRoles: jest.fn(),
  getContextPermissions: jest.fn(),
  hasPermission: jest.fn(),
  getEncryptionKey: jest.fn(),
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  applyPolicy: jest.fn(),
  validateRequest: jest.fn()
};

const mockAuditLogger = {
  logSecurityEvent: jest.fn(),
  logAccessAttempt: jest.fn(),
  logDataOperation: jest.fn(),
  logComplianceCheck: jest.fn(),
  logPolicyChange: jest.fn(),
  logThreatDetection: jest.fn()
};

const mockComplianceChecker = {
  check: jest.fn()
};

const mockThreatDetector = {
  scan: jest.fn()
};

describe('Context服务集成测试 - GLFB反馈循环验证', () => {
  let managementService: ContextManagementService;
  let analyticsService: ContextAnalyticsService;
  let securityService: ContextSecurityService;
  let testContext: ContextEntity;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();

    // 创建服务实例
    managementService = new ContextManagementService(
      mockContextRepository,
      mockLogger,
      mockCacheManager,
      mockVersionManager
    );

    analyticsService = new ContextAnalyticsService(
      mockContextRepository,
      mockAnalyticsEngine,
      mockSearchEngine,
      mockMetricsCollector,
      mockLogger
    );

    securityService = new ContextSecurityService(
      mockContextRepository,
      mockSecurityManager,
      mockAuditLogger,
      mockComplianceChecker,
      mockThreatDetector,
      mockLogger
    );

    // 创建测试上下文
    testContext = new ContextEntity({
      contextId: 'test-context-001' as UUID,
      name: 'Test Context',
      description: 'Integration test context',
      status: 'active',
      lifecycleStage: 'planning',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    });
  });

  describe('🌐 全局反馈验证 - 服务协作流程', () => {
    it('应该完成完整的上下文生命周期管理流程', async () => {
      // 1. 创建上下文 (Management Service)
      mockContextRepository.findByName.mockResolvedValue(null);
      mockContextRepository.save.mockResolvedValue(testContext);
      mockCacheManager.set.mockResolvedValue(undefined);
      mockVersionManager.createVersion.mockResolvedValue('v1.0.0');

      const createdContext = await managementService.createContext({
        name: 'Test Context',
        description: 'Integration test context'
      });

      expect(createdContext).toBeDefined();
      expect(mockContextRepository.save).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(mockVersionManager.createVersion).toHaveBeenCalled();

      // 2. 分析上下文 (Analytics Service)
      mockContextRepository.findById.mockResolvedValue(testContext);
      mockMetricsCollector.getContextMetrics.mockResolvedValue({
        avgResponseTime: 50,
        p95ResponseTime: 80,
        p99ResponseTime: 120,
        requestsPerSecond: 100,
        peakThroughput: 200,
        memoryUsage: 0.6,
        cpuUsage: 0.4,
        storageUsage: 0.3,
        cacheHitRate: 0.85,
        cacheMissRate: 0.15,
        cacheEvictionRate: 0.05,
        totalAccess: 150,
        lastAccessTime: new Date().toISOString(),
        avgSessionDuration: 300,
        peakUsageTime: '14:00',
        uniqueUsers: 25
      });

      mockAnalyticsEngine.analyzePatterns.mockResolvedValue({
        userBehaviorPatterns: [],
        dataAccessPatterns: [],
        performancePatterns: []
      });

      mockAnalyticsEngine.generateInsights.mockResolvedValue({
        recommendations: ['Optimize cache strategy'],
        optimizationSuggestions: ['Increase cache TTL'],
        riskAssessment: 'low',
        healthScore: 85
      });

      const analysis = await analyticsService.analyzeContext(testContext.contextId);

      expect(analysis).toBeDefined();
      expect(analysis.contextId).toBe(testContext.contextId);
      expect(analysis.performance.responseTime.average).toBe(50);
      expect(analysis.insights.healthScore).toBe(85);

      // 3. 安全验证 (Security Service)
      mockSecurityManager.getUserContext.mockResolvedValue({
        userId: 'user-001' as UUID,
        roles: ['admin'],
        permissions: ['read', 'write']
      });

      mockSecurityManager.getUserRoles.mockResolvedValue(['admin']);
      mockSecurityManager.getContextPermissions.mockResolvedValue([
        { resource: 'context', action: 'read', conditions: {} }
      ]);
      mockSecurityManager.hasPermission.mockResolvedValue(true);

      const hasAccess = await securityService.validateAccess(
        testContext.contextId,
        'user-001' as UUID,
        'read'
      );

      expect(hasAccess).toBe(true);
      expect(mockAuditLogger.logAccessAttempt).toHaveBeenCalled();

      // 4. 生命周期转换 (Management Service)
      mockContextRepository.findById.mockResolvedValue(testContext);
      mockContextRepository.update.mockResolvedValue({
        ...testContext,
        lifecycleStage: 'executing'
      });

      const transitionedContext = await managementService.transitionLifecycleStage(
        testContext.contextId,
        'executing'
      );

      expect(transitionedContext.lifecycleStage).toBe('executing');
      expect(mockVersionManager.createVersion).toHaveBeenCalledTimes(2); // 创建时1次，转换时1次
    });

    it('应该正确处理跨服务的错误传播', async () => {
      // 模拟Management Service错误
      mockContextRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      // Analytics Service应该优雅处理错误
      await expect(analyticsService.analyzeContext('invalid-context' as UUID))
        .rejects.toThrow('Database connection failed');

      // Security Service应该优雅处理错误
      await expect(securityService.performSecurityAudit('invalid-context' as UUID))
        .rejects.toThrow('Database connection failed');

      // 验证错误日志记录
      expect(mockLogger.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('🔍 局部实现质量验证 - 服务独立性', () => {
    it('应该验证ContextManagementService的独立功能', async () => {
      mockContextRepository.findByName.mockResolvedValue(null);
      mockContextRepository.save.mockResolvedValue(testContext);
      mockCacheManager.set.mockResolvedValue(undefined);
      mockVersionManager.createVersion.mockResolvedValue('v1.0.0');

      const context = await managementService.createContext({
        name: 'Independent Test',
        description: 'Testing service independence'
      });

      expect(context).toBeDefined();
      expect(context.name).toBe('Test Context');
      
      // 验证缓存和版本管理集成
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `context:${context.contextId}`,
        context,
        3600
      );
      expect(mockVersionManager.createVersion).toHaveBeenCalledWith(context);
    });

    it('应该验证ContextAnalyticsService的独立功能', async () => {
      mockContextRepository.findById.mockResolvedValue(testContext);
      mockMetricsCollector.getUsageMetrics.mockResolvedValue({
        totalAccess: 100,
        lastAccessTime: new Date().toISOString(),
        avgSessionDuration: 250,
        peakUsageTime: '15:00',
        uniqueUsers: 20
      });

      const usage = await (analyticsService as any).analyzeUsage(testContext);

      expect(usage).toBeDefined();
      expect(usage.accessCount).toBe(0);
      expect(usage.userCount).toBe(0);
    });

    it('应该验证ContextSecurityService的独立功能', async () => {
      mockSecurityManager.getEncryptionKey.mockResolvedValue('test-key');
      mockSecurityManager.encrypt.mockResolvedValue('encrypted-data');

      const encryptedData = await securityService.encryptSensitiveData(
        testContext.contextId,
        { sensitive: 'data' }
      );

      expect(encryptedData).toBe('encrypted-data');
      expect(mockAuditLogger.logDataOperation).toHaveBeenCalledWith({
        type: 'encryption',
        contextId: testContext.contextId,
        dataType: 'object',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('🔄 反馈循环机制验证 - 性能和一致性', () => {
    it('应该验证服务间的性能协调', async () => {
      // 模拟高负载场景
      const contextIds = Array.from({ length: 10 }, (_, i) => `context-${i}` as UUID);
      
      // Management Service批量操作
      mockContextRepository.findByNames.mockResolvedValue([]);
      mockContextRepository.saveMany.mockResolvedValue(
        contextIds.map(id => ({ ...testContext, contextId: id }))
      );

      const startTime = Date.now();
      const contexts = await managementService.createContexts(
        contextIds.map(id => ({
          name: `Context ${id}`,
          description: `Batch test context ${id}`
        }))
      );
      const endTime = Date.now();

      expect(contexts).toHaveLength(10);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成

      // 验证缓存批量操作
      expect(mockCacheManager.set).toHaveBeenCalledTimes(10);
    });

    it('应该验证错误处理的一致性', async () => {
      const errorMessage = 'Simulated service error';
      
      // 所有服务都应该有一致的错误处理
      mockContextRepository.findById.mockRejectedValue(new Error(errorMessage));

      await expect(managementService.getContext('test' as UUID))
        .rejects.toThrow(errorMessage);
      
      await expect(analyticsService.analyzeContext('test' as UUID))
        .rejects.toThrow(errorMessage);
      
      await expect(securityService.performSecurityAudit('test' as UUID))
        .rejects.toThrow(errorMessage);

      // 验证所有服务都记录了错误
      expect(mockLogger.error).toHaveBeenCalledTimes(3);
    });

    it('应该验证日志记录的一致性', async () => {
      mockContextRepository.findById.mockResolvedValue(testContext);
      
      // 执行各种操作
      await managementService.getContext(testContext.contextId);
      
      mockMetricsCollector.getContextMetrics.mockResolvedValue({} as any);
      await analyticsService.analyzePerformance(testContext.contextId);
      
      mockSecurityManager.getUserContext.mockResolvedValue({
        userId: 'user-001' as UUID,
        roles: ['user'],
        permissions: []
      });
      await securityService.validateAccess(testContext.contextId, 'user-001' as UUID, 'read');

      // 验证日志记录的一致性
      expect(mockLogger.debug).toHaveBeenCalled(); // Management Service
      expect(mockLogger.info).toHaveBeenCalled(); // Security Service
    });
  });
});
