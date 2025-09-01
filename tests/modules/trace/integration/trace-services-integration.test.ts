/**
 * Trace服务集成测试
 * 
 * @description 验证3个核心服务的正确集成
 * @version 1.0.0
 */

import { initializeTraceModule } from '../../../../src/modules/trace/module';

describe('Trace服务集成测试', () => {
  describe('模块初始化验证', () => {
    it('应该成功初始化3个核心服务', async () => {
      // 🎬 Act
      const traceModule = await initializeTraceModule({
        enableLogging: true,
        enableCaching: false,
        enableMetrics: true,
        repositoryType: 'memory',
        traceRetentionDays: 30,
        samplingRate: 1.0
      });

      // ✅ Assert - 验证所有3个服务都已正确初始化
      expect(traceModule.traceManagementService).toBeDefined();
      expect(traceModule.traceAnalyticsService).toBeDefined();
      expect(traceModule.traceSecurityService).toBeDefined();
      
      // 验证服务类型
      expect(traceModule.traceManagementService.constructor.name).toBe('TraceManagementService');
      expect(traceModule.traceAnalyticsService.constructor.name).toBe('TraceAnalyticsService');
      expect(traceModule.traceSecurityService.constructor.name).toBe('TraceSecurityService');

      // 验证其他组件
      expect(traceModule.traceController).toBeDefined();
      expect(traceModule.traceRepository).toBeDefined();
      expect(traceModule.traceModuleAdapter).toBeDefined();
      
      // 验证功能方法
      expect(traceModule.healthCheck).toBeDefined();
      expect(traceModule.shutdown).toBeDefined();
      expect(traceModule.getStatistics).toBeDefined();
      expect(traceModule.getTraceMetrics).toBeDefined();
    });

    it('应该通过适配器访问3个服务', async () => {
      // 🎬 Act
      const traceModule = await initializeTraceModule({
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory'
      });

      // 初始化适配器
      await traceModule.traceModuleAdapter.initialize();

      // ✅ Assert - 验证适配器可以访问所有服务
      const managementService = traceModule.traceModuleAdapter.getService();
      const analyticsService = traceModule.traceModuleAdapter.getAnalyticsService();
      const securityService = traceModule.traceModuleAdapter.getSecurityService();

      expect(managementService).toBeDefined();
      expect(analyticsService).toBeDefined();
      expect(securityService).toBeDefined();
      
      expect(managementService.constructor.name).toBe('TraceManagementService');
      expect(analyticsService.constructor.name).toBe('TraceAnalyticsService');
      expect(securityService.constructor.name).toBe('TraceSecurityService');
    });

    it('应该正确执行健康检查', async () => {
      // 🎬 Act
      const traceModule = await initializeTraceModule({
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory'
      });

      const healthStatus = await traceModule.healthCheck();

      // ✅ Assert
      expect(healthStatus).toBe(true);
    });

    it('应该正确获取统计信息', async () => {
      // 🎬 Act
      const traceModule = await initializeTraceModule({
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory'
      });

      const statistics = await traceModule.getStatistics();

      // ✅ Assert
      expect(statistics).toBeDefined();
      expect(statistics.totalTraces).toBeDefined();
      expect(statistics.healthStatus).toBeDefined();
      expect(statistics.moduleVersion).toBe('1.0.0');
      expect(statistics.protocolVersion).toBe('1.0.0');
    });

    it('应该正确获取追踪指标', async () => {
      // 🎬 Act
      const traceModule = await initializeTraceModule({
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory'
      });

      const metrics = await traceModule.getTraceMetrics();

      // ✅ Assert
      expect(metrics).toBeDefined();
      expect(metrics.totalTraces).toBeDefined();
      expect(metrics.errorTraces).toBeDefined();
      expect(metrics.decisionTraces).toBeDefined();
      expect(metrics.errorRate).toBeDefined();
      expect(metrics.decisionRate).toBeDefined();
    });
  });

  describe('服务功能验证', () => {
    let traceModule: any;

    beforeEach(async () => {
      traceModule = await initializeTraceModule({
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory'
      });
    });

    it('TraceManagementService应该具备核心功能', () => {
      const service = traceModule.traceManagementService;
      
      // 验证核心方法存在
      expect(typeof service.createTrace).toBe('function');
      expect(typeof service.getTraceById).toBe('function');
      expect(typeof service.updateTrace).toBe('function');
      expect(typeof service.deleteTrace).toBe('function');
      expect(typeof service.queryTraces).toBe('function');
    });

    it('TraceAnalyticsService应该具备分析功能', () => {
      const service = traceModule.traceAnalyticsService;
      
      // 验证分析方法存在
      expect(typeof service.analyzeTracePerformance).toBe('function');
      expect(typeof service.analyzeTraceTrends).toBe('function');
      expect(typeof service.detectAnomalies).toBe('function');
      expect(typeof service.generateAnalysisReport).toBe('function');
      expect(typeof service.getRealtimePerformanceMetrics).toBe('function');
    });

    it('TraceSecurityService应该具备安全功能', () => {
      const service = traceModule.traceSecurityService;
      
      // 验证安全方法存在
      expect(typeof service.validateTraceAccess).toBe('function');
      expect(typeof service.protectSensitiveData).toBe('function');
      expect(typeof service.performComplianceCheck).toBe('function');
      expect(typeof service.manageDataRetention).toBe('function');
      expect(typeof service.performSecurityAudit).toBe('function');
    });
  });
});
