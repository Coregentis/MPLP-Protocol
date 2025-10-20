/**
 * Collab Module Performance Tests - Based on Actual Source Code Implementation
 * @description 基于实际源代码实现的性能基准测试
 * @version 1.0.0
 * @author MPLP Development Team
 */

import { CollabManagementService } from '../../../../src/modules/collab/application/services/collab-management.service';
import { CollabAnalyticsService } from '../../../../src/modules/collab/application/services/collab-analytics.service';
import { CollabSecurityService } from '../../../../src/modules/collab/application/services/collab-security.service';
import { CollabTestFactory } from '../factories/collab-test.factory';
import { CollabMapper } from '../../../../src/modules/collab/api/mappers/collab.mapper';
import { ICollabRepository } from '../../../../src/modules/collab/domain/repositories/collab.repository';
import { ITaskAllocator } from '../../../../src/modules/collab/domain/interfaces/task-allocator.interface';
import { ILogger } from '../../../../src/modules/collab/domain/interfaces/logger.interface';
import { IAnalyticsEngine } from '../../../../src/modules/collab/domain/interfaces/analytics-engine.interface';
import { IPerformanceAnalyzer } from '../../../../src/modules/collab/domain/interfaces/performance-analyzer.interface';
import { SecurityManager } from '../../../../src/modules/collab/domain/services/security-manager.service';
import { IGovernanceEngine } from '../../../../src/modules/collab/domain/interfaces/governance-engine.interface';
import { IAuditLogger } from '../../../../src/modules/collab/domain/interfaces/audit-logger.interface';

describe('🚀 Collab模块性能基准测试 - 基于实际实现', () => {
  let collabManagementService: CollabManagementService;
  let collabAnalyticsService: CollabAnalyticsService;
  let collabSecurityService: CollabSecurityService;
  let mockRepository: jest.Mocked<ICollabRepository>;

  beforeEach(() => {
    // 基于实际接口创建Mock
    mockRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      search: jest.fn(),
      count: jest.fn(),
      exists: jest.fn()
    };

    const mockTaskAllocator: jest.Mocked<ITaskAllocator> = {
      allocateTask: jest.fn(),
      allocateResource: jest.fn(),
      deallocateTask: jest.fn(),
      deallocateResource: jest.fn(),
      getTaskAllocation: jest.fn(),
      getResourceAllocation: jest.fn()
    };

    const mockLogger: jest.Mocked<ILogger> = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };

    const mockAnalyticsEngine: jest.Mocked<IAnalyticsEngine> = {
      predict: jest.fn(),
      analyze: jest.fn(),
      train: jest.fn()
    };

    const mockPerformanceAnalyzer: jest.Mocked<IPerformanceAnalyzer> = {
      analyzePerformance: jest.fn(),
      generateReport: jest.fn(),
      getMetrics: jest.fn()
    };

    const mockSecurityManager: jest.Mocked<SecurityManager> = {
      validatePermission: jest.fn().mockResolvedValue(true), // Always allow access in tests
      checkAccess: jest.fn().mockResolvedValue(true),
      auditAccess: jest.fn().mockResolvedValue(undefined)
    } as any;

    const mockGovernanceEngine: jest.Mocked<IGovernanceEngine> = {
      validateCompliance: jest.fn(),
      checkPolicy: jest.fn(),
      generateReport: jest.fn()
    };

    const mockAuditLogger: jest.Mocked<IAuditLogger> = {
      logAccessGranted: jest.fn(),
      logAccessDenied: jest.fn(),
      logComplianceCheck: jest.fn(),
      logSecurityEvent: jest.fn()
    };

    // 初始化服务
    collabManagementService = new CollabManagementService(
      mockRepository,
      mockTaskAllocator,
      mockLogger
    );

    collabAnalyticsService = new CollabAnalyticsService(
      mockRepository,
      mockAnalyticsEngine,
      mockPerformanceAnalyzer
    );

    collabSecurityService = new CollabSecurityService(
      mockRepository,
      mockSecurityManager,
      mockGovernanceEngine,
      mockAuditLogger
    );
  });

  describe('📊 核心服务性能基准', () => {
    /**
     * 基于实际的createCollaboration方法测试
     * 性能要求: 协作创建响应时间<200ms
     */
    it('应该在200ms内完成协作创建', async () => {
      // 🎯 Arrange - 使用实际的测试工厂
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);
      
      mockRepository.save.mockResolvedValue(entityData);

      // 🎯 Act & Measure
      const startTime = performance.now();
      const collaboration = await collabManagementService.createCollaboration(entityData);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // ✅ Assert Performance Requirement
      expect(responseTime).toBeLessThan(200); // <200ms requirement
      expect(collaboration).toBeDefined();
      expect(collaboration.id).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
      
      console.log(`📈 协作创建性能: ${responseTime.toFixed(2)}ms (要求: <200ms)`);
    });

    /**
     * 基于实际的getCollaboration方法测试
     * 性能要求: 协作查询响应时间<100ms
     */
    it('应该在100ms内完成协作查询', async () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);
      
      mockRepository.findById.mockResolvedValue(entityData);

      // 🎯 Act & Measure
      const startTime = performance.now();
      const collaboration = await collabManagementService.getCollaboration(entityData.id);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // ✅ Assert Performance Requirement
      expect(responseTime).toBeLessThan(100); // <100ms requirement
      expect(collaboration).toBeDefined();
      expect(collaboration!.id).toBe(entityData.id);
      expect(mockRepository.findById).toHaveBeenCalledWith(entityData.id);
      
      console.log(`📈 协作查询性能: ${responseTime.toFixed(2)}ms (要求: <100ms)`);
    });

    /**
     * 基于实际的updateCollaboration方法测试
     * 性能要求: 协作更新响应时间<150ms
     */
    it('应该在150ms内完成协作更新', async () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);

      // Create a real CollabEntity instance for proper method testing
      const realEntity = new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabEntity(
        entityData.id,
        entityData.contextId,
        entityData.planId,
        entityData.name,
        entityData.mode,
        new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabCoordinationStrategy(
          entityData.coordinationStrategy.type,
          entityData.coordinationStrategy.decisionMaking,
          entityData.coordinationStrategy.coordinatorId
        ),
        entityData.createdBy || 'test-user',
        entityData.description
      );

      const updatedEntity = { ...realEntity, name: 'Updated Collaboration' };

      mockRepository.findById.mockResolvedValue(realEntity);
      mockRepository.update.mockResolvedValue(updatedEntity);

      // 🎯 Act & Measure
      const startTime = performance.now();
      const collaboration = await collabManagementService.updateCollaboration(
        entityData.id,
        { name: 'Updated Collaboration' }
      );
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // ✅ Assert Performance Requirement
      expect(responseTime).toBeLessThan(150); // <150ms requirement
      expect(collaboration).toBeDefined();
      expect(mockRepository.update).toHaveBeenCalled();

      console.log(`📈 协作更新性能: ${responseTime.toFixed(2)}ms (要求: <150ms)`);
    });

    /**
     * 基于实际的listCollaborations方法测试
     * 性能要求: 协作列表响应时间<200ms
     */
    it('应该在200ms内完成协作列表查询', async () => {
      // 🎯 Arrange
      const schemaDataList = [
        CollabTestFactory.createCollabSchemaData(),
        CollabTestFactory.createCollabSchemaData()
      ];
      const entityDataList = schemaDataList.map(data => CollabMapper.fromSchema(data));
      
      mockRepository.list.mockResolvedValue({
        items: entityDataList,
        total: entityDataList.length,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });

      // 🎯 Act & Measure
      const startTime = performance.now();
      const result = await collabManagementService.listCollaborations({
        page: 1,
        pageSize: 10
      });
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // ✅ Assert Performance Requirement
      expect(responseTime).toBeLessThan(200); // <200ms requirement
      expect(result).toBeDefined();
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockRepository.list).toHaveBeenCalled();
      
      console.log(`📈 协作列表性能: ${responseTime.toFixed(2)}ms (要求: <200ms)`);
    });
  });

  describe('📈 分析服务性能测试', () => {
    /**
     * 基于实际的analyzeCollaborationEffectiveness方法测试
     */
    it('应该在合理时间内完成协作效果分析', async () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);
      
      mockRepository.findById.mockResolvedValue(entityData);

      // 🎯 Act & Measure
      const startTime = performance.now();
      const effectiveness = await collabAnalyticsService.analyzeCollaborationEffectiveness(entityData.id);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // ✅ Assert Performance and Functionality
      expect(responseTime).toBeLessThan(500); // Reasonable response time
      expect(effectiveness).toBeDefined();
      expect(effectiveness.collaborationId).toBe(entityData.id);
      expect(effectiveness.overview).toBeDefined();
      expect(effectiveness.performance).toBeDefined();
      expect(effectiveness.collaboration).toBeDefined();
      expect(effectiveness.insights).toBeDefined();
      
      console.log(`📈 协作效果分析性能: ${responseTime.toFixed(2)}ms`);
    });

    /**
     * 基于实际的analyzeCollaborationPatterns方法测试
     */
    it('应该在合理时间内完成协作模式分析', async () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);
      
      mockRepository.findById.mockResolvedValue(entityData);

      // 🎯 Act & Measure
      const startTime = performance.now();
      const patterns = await collabAnalyticsService.analyzeCollaborationPatterns(entityData.id);
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // ✅ Assert Performance and Functionality
      expect(responseTime).toBeLessThan(300); // Reasonable response time
      expect(patterns).toBeDefined();
      expect(patterns.collaborationId).toBe(entityData.id);
      expect(patterns.communicationPatterns).toBeDefined();
      expect(patterns.collaborationPatterns).toBeDefined();
      expect(patterns.performancePatterns).toBeDefined();
      
      console.log(`📈 协作模式分析性能: ${responseTime.toFixed(2)}ms`);
    });
  });

  describe('🔒 安全服务性能测试', () => {
    /**
     * 基于实际的validateCollaborationAccess方法测试
     * 性能要求: 安全验证响应时间<50ms
     */
    it('应该在50ms内完成访问权限验证', async () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);
      const userId = entityData.participants[0].agentId;

      // Create a real CollabEntity with proper participants
      const realEntity = new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabEntity(
        entityData.id,
        entityData.contextId,
        entityData.planId,
        entityData.name,
        entityData.mode,
        new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabCoordinationStrategy(
          entityData.coordinationStrategy.type,
          entityData.coordinationStrategy.decisionMaking,
          entityData.coordinationStrategy.coordinatorId
        ),
        entityData.createdBy || 'test-user',
        entityData.description
      );

      // Add participants to the real entity
      for (const participantData of entityData.participants) {
        const participant = new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabParticipant(
          participantData.participantId,
          participantData.agentId,
          participantData.roleId,
          participantData.status,
          participantData.capabilities || [],
          participantData.joinedAt
        );
        realEntity.addParticipant(participant, 'test-user');
      }

      mockRepository.findById.mockResolvedValue(realEntity);

      // Debug: Check participants
      console.log('Debug - userId:', userId);
      console.log('Debug - realEntity.participants:', realEntity.participants.map(p => ({ agentId: p.agentId, status: p.status })));

      // 🎯 Act & Measure
      const startTime = performance.now();
      const result = await collabSecurityService.validateAccess(
        'view',
        entityData.id,
        userId
      );
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Debug: Check result
      console.log('Debug - result:', result);

      // ✅ Assert Performance Requirement
      expect(responseTime).toBeLessThan(50); // <50ms requirement
      expect(result).toBeDefined();
      expect(result.isAllowed).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(entityData.id);

      console.log(`📈 访问权限验证性能: ${responseTime.toFixed(2)}ms (要求: <50ms)`);
    });

    /**
     * 基于实际的performGovernanceCheck方法测试
     * 性能要求: 治理检查响应时间<1s
     */
    it('应该在1秒内完成治理检查', async () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);

      // Create a real CollabEntity
      const realEntity = new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabEntity(
        entityData.id,
        entityData.contextId,
        entityData.planId,
        entityData.name,
        entityData.mode,
        new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabCoordinationStrategy(
          entityData.coordinationStrategy.type,
          entityData.coordinationStrategy.decisionMaking,
          entityData.coordinationStrategy.coordinatorId
        ),
        entityData.createdBy || 'test-user',
        entityData.description
      );

      mockRepository.findById.mockResolvedValue(realEntity);

      // 🎯 Act & Measure
      const startTime = performance.now();
      const governanceResult = await collabSecurityService.performGovernanceCheck(
        entityData.id,
        'compliance',
        { auditType: 'performance_test' }
      );
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // ✅ Assert Performance Requirement
      expect(responseTime).toBeLessThan(1000); // <1s requirement
      expect(governanceResult).toBeDefined();
      expect(governanceResult.collaborationId).toBe(entityData.id);

      console.log(`📈 治理检查性能: ${responseTime.toFixed(2)}ms (要求: <1000ms)`);
    });
  });

  describe('🔄 批量操作性能测试', () => {
    /**
     * 批量协作创建性能测试
     */
    it('应该支持高效的批量协作创建', async () => {
      const batchSize = 10;
      const collaborations: any[] = [];

      // 🎯 Act & Measure
      const startTime = performance.now();

      for (let i = 0; i < batchSize; i++) {
        const schemaData = CollabTestFactory.createCollabSchemaData();
        const entityData = CollabMapper.fromSchema(schemaData);

        // Create a real CollabEntity for the mock
        const realEntity = new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabEntity(
          entityData.id,
          entityData.contextId,
          entityData.planId,
          entityData.name,
          entityData.mode,
          new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabCoordinationStrategy(
            entityData.coordinationStrategy.type,
            entityData.coordinationStrategy.decisionMaking,
            entityData.coordinationStrategy.coordinatorId
          ),
          entityData.createdBy || 'test-user',
          entityData.description
        );

        mockRepository.save.mockResolvedValue(realEntity);

        const collaboration = await collabManagementService.createCollaboration(entityData);
        collaborations.push(collaboration);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / batchSize;

      // ✅ Assert Batch Performance
      expect(collaborations).toHaveLength(batchSize);
      expect(averageTime).toBeLessThan(200); // Average should still meet individual requirement

      console.log(`📈 批量创建性能: 总时间${totalTime.toFixed(2)}ms, 平均${averageTime.toFixed(2)}ms/个`);
    });

    /**
     * 并发访问验证性能测试
     */
    it('应该支持高效的并发访问验证', async () => {
      // 🎯 Arrange
      const schemaData = CollabTestFactory.createCollabSchemaData();
      const entityData = CollabMapper.fromSchema(schemaData);

      // Create a real CollabEntity with proper participants
      const realEntity = new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabEntity(
        entityData.id,
        entityData.contextId,
        entityData.planId,
        entityData.name,
        entityData.mode,
        new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabCoordinationStrategy(
          entityData.coordinationStrategy.type,
          entityData.coordinationStrategy.decisionMaking,
          entityData.coordinationStrategy.coordinatorId
        ),
        entityData.createdBy || 'test-user',
        entityData.description
      );

      // Add participants to the real entity
      for (const participantData of entityData.participants) {
        const participant = new (await import('../../../../src/modules/collab/domain/entities/collab.entity')).CollabParticipant(
          participantData.participantId,
          participantData.agentId,
          participantData.roleId,
          participantData.status,
          participantData.capabilities || [],
          participantData.joinedAt
        );
        realEntity.addParticipant(participant, 'test-user');
      }

      mockRepository.findById.mockResolvedValue(realEntity);

      const concurrentRequests = 20;
      const promises: Promise<any>[] = [];

      // 🎯 Act & Measure
      const startTime = performance.now();

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          collabSecurityService.validateAccess(
            'view',
            entityData.id,
            entityData.participants[0].agentId
          )
        );
      }

      const results = await Promise.all(promises);
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / concurrentRequests;

      // ✅ Assert Concurrent Performance
      expect(results).toHaveLength(concurrentRequests);
      expect(results.every(result => result.isAllowed === true)).toBe(true);
      expect(averageTime).toBeLessThan(50); // Should be faster due to concurrency

      console.log(`📈 并发访问验证性能: 总时间${totalTime.toFixed(2)}ms, 平均${averageTime.toFixed(2)}ms/个`);
    });
  });
});
