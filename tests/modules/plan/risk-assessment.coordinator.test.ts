/**
 * 风险评估协调管理器测试
 * 
 * 测试RiskAssessmentCoordinator的风险识别和评估功能
 * 验证≥95%风险识别准确率
 * 
 * @version 1.0.0
 * @created 2025-08-17
 */

import { RiskAssessmentCoordinator, RiskType, RiskLevel } from '../../../src/modules/plan/application/coordinators/risk-assessment.coordinator';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanStatus, ExecutionStrategy, Priority } from '../../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('RiskAssessmentCoordinator', () => {
  let coordinator: RiskAssessmentCoordinator;
  let testPlan: Plan;

  beforeEach(() => {
    coordinator = new RiskAssessmentCoordinator();
    
    // 创建基础测试计划
    testPlan = new Plan({
      planId: uuidv4(),
      contextId: uuidv4(),
      name: 'Risk Assessment Test Plan',
      description: 'Plan for testing risk assessment functionality',
      status: PlanStatus.DRAFT,
      goals: ['Test Risk Assessment'],
      tasks: [
        {
          taskId: 'task-1',
          name: 'Complex Development Task',
          description: 'High complexity development task',
          status: 'pending',
          priority: 'high',
          type: 'development',
          dependencies: [],
          estimatedDuration: { value: 36000, unit: 'seconds' }, // 10 hours - high complexity
          progress: 0,
          resourceRequirements: [
            { resourceId: 'cpu-resource-1', type: 'cpu', quantity: 80, availability: 'high' } // High resource demand
          ],
          metadata: {}
        },
        {
          taskId: 'task-2',
          name: 'Data Processing Task',
          description: 'Process sensitive data',
          status: 'pending',
          priority: 'medium',
          type: 'data_processing',
          dependencies: ['task-1'],
          estimatedDuration: { value: 7200, unit: 'seconds' }, // 2 hours
          progress: 0,
          resourceRequirements: [
            { resourceId: 'memory-resource-1', type: 'memory', quantity: 500, availability: 'high' } // High memory demand
          ],
          metadata: {}
        },
        {
          taskId: 'task-3',
          name: 'Production Deployment',
          description: 'Deploy to production environment',
          status: 'pending',
          priority: 'high',
          type: 'deployment',
          dependencies: ['task-2'],
          estimatedDuration: { value: 3600, unit: 'seconds' }, // 1 hour
          progress: 0,
          resourceRequirements: [],
          metadata: {}
        }
      ],
      dependencies: [],
      executionStrategy: ExecutionStrategy.SEQUENTIAL,
      priority: Priority.HIGH,
      createdBy: 'test-user'
    });
  });

  describe('基础风险评估', () => {
    it('should successfully assess risks', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      expect(result.planId).toBe(testPlan.planId);
      expect(result.overallRiskLevel).toBeDefined();
      expect(result.overallRiskScore).toBeGreaterThanOrEqual(0);
      expect(result.overallRiskScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.riskItems)).toBe(true);
      expect(result.performance.assessmentTime).toBeGreaterThan(0);
    });

    it('should achieve ≥95% identification accuracy', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      expect(result.performance.identificationAccuracy).toBeGreaterThanOrEqual(95);
      expect(result.performance.algorithmsUsed).toContain('risk_identification');
      expect(result.performance.algorithmsUsed).toContain('probability_analysis');
      expect(result.performance.algorithmsUsed).toContain('impact_assessment');
      expect(result.performance.algorithmsUsed).toContain('mitigation_planning');
    });

    it('should provide comprehensive risk summary', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      expect(result.riskSummary.totalRisks).toBeGreaterThan(0);
      expect(typeof result.riskSummary.risksByLevel).toBe('object');
      expect(typeof result.riskSummary.risksByType).toBe('object');
      expect(Array.isArray(result.riskSummary.highPriorityRisks)).toBe(true);
    });
  });

  describe('技术风险识别', () => {
    it('should identify high complexity technical risks', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      const technicalRisks = result.riskItems.filter(risk => risk.type === RiskType.TECHNICAL);
      expect(technicalRisks.length).toBeGreaterThan(0);
      
      // 应该识别出复杂度风险
      const complexityRisk = technicalRisks.find(risk => 
        risk.title.includes('Complexity') || risk.title.includes('complexity')
      );
      expect(complexityRisk).toBeDefined();
      expect(complexityRisk?.detectionConfidence).toBeGreaterThanOrEqual(85);
      expect(complexityRisk?.affectedTasks).toContain('task-1');
    });

    it('should provide technical mitigation strategies', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      const technicalRisks = result.riskItems.filter(risk => risk.type === RiskType.TECHNICAL);
      if (technicalRisks.length > 0) {
        const technicalRisk = technicalRisks[0];
        expect(technicalRisk.mitigationStrategies.length).toBeGreaterThan(0);
        expect(technicalRisk.contingencyPlans.length).toBeGreaterThan(0);
        
        const mitigation = technicalRisk.mitigationStrategies[0];
        expect(mitigation.effectiveness).toBeGreaterThan(0);
        expect(mitigation.steps.length).toBeGreaterThan(0);
      }
    });
  });

  describe('资源风险识别', () => {
    it('should identify resource over-allocation risks', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      const resourceRisks = result.riskItems.filter(risk => risk.type === RiskType.RESOURCE);
      expect(resourceRisks.length).toBeGreaterThan(0);
      
      // 应该识别出CPU和内存资源风险
      const cpuRisk = resourceRisks.find(risk => 
        risk.title.includes('cpu') || risk.affectedResources.includes('cpu')
      );
      const memoryRisk = resourceRisks.find(risk => 
        risk.title.includes('memory') || risk.affectedResources.includes('memory')
      );
      
      expect(cpuRisk || memoryRisk).toBeDefined();
    });

    it('should calculate accurate resource utilization', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      const resourceRisks = result.riskItems.filter(risk => risk.type === RiskType.RESOURCE);
      resourceRisks.forEach(risk => {
        expect(risk.probability).toBeGreaterThan(0);
        expect(risk.probability).toBeLessThanOrEqual(100);
        expect(risk.impact).toBeGreaterThan(0);
        expect(risk.impact).toBeLessThanOrEqual(100);
        expect(risk.riskScore).toBe(risk.probability * risk.impact / 100);
      });
    });
  });

  describe('进度风险识别', () => {
    it('should identify schedule risks from long tasks', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      const scheduleRisks = result.riskItems.filter(risk => risk.type === RiskType.SCHEDULE);
      expect(scheduleRisks.length).toBeGreaterThan(0);
      
      const criticalPathRisk = scheduleRisks.find(risk => 
        risk.title.includes('Schedule') || risk.title.includes('Critical Path')
      );
      expect(criticalPathRisk).toBeDefined();
      expect(criticalPathRisk?.affectedTasks).toContain('task-1'); // 10小时的长任务
    });
  });

  describe('安全风险识别', () => {
    it('should identify data security risks', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      const securityRisks = result.riskItems.filter(risk => risk.type === RiskType.SECURITY);
      expect(securityRisks.length).toBeGreaterThan(0);
      
      // 应该识别出数据处理安全风险
      const dataSecurityRisk = securityRisks.find(risk => 
        risk.title.includes('Data Security') || risk.title.includes('data')
      );
      expect(dataSecurityRisk).toBeDefined();
      expect(dataSecurityRisk?.affectedTasks).toContain('task-2'); // 数据处理任务
      expect(dataSecurityRisk?.level).toBe(RiskLevel.HIGH);
    });
  });

  describe('合规风险识别', () => {
    it('should identify regulatory compliance risks', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      const complianceRisks = result.riskItems.filter(risk => risk.type === RiskType.COMPLIANCE);
      expect(complianceRisks.length).toBeGreaterThan(0);
      
      // 应该识别出生产部署合规风险
      const regulatoryRisk = complianceRisks.find(risk => 
        risk.title.includes('Compliance') || risk.title.includes('Regulatory')
      );
      expect(regulatoryRisk).toBeDefined();
      expect(regulatoryRisk?.affectedTasks).toContain('task-3'); // 部署任务
    });
  });

  describe('运营风险识别', () => {
    it('should identify operational readiness risks', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      const operationalRisks = result.riskItems.filter(risk => risk.type === RiskType.OPERATIONAL);
      expect(operationalRisks.length).toBeGreaterThan(0);
      
      // 应该识别出运营准备风险
      const readinessRisk = operationalRisks.find(risk => 
        risk.title.includes('Operational') || risk.title.includes('Readiness')
      );
      expect(readinessRisk).toBeDefined();
      expect(readinessRisk?.affectedTasks).toContain('task-3'); // 部署任务
    });
  });

  describe('风险等级和分数计算', () => {
    it('should calculate accurate risk scores', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      result.riskItems.forEach(risk => {
        // 验证风险分数计算
        const expectedScore = risk.probability * risk.impact / 100;
        expect(risk.riskScore).toBeCloseTo(expectedScore, 2);
        
        // 验证风险等级合理性
        expect(Object.values(RiskLevel)).toContain(risk.level);
        
        // 验证概率和影响范围
        expect(risk.probability).toBeGreaterThanOrEqual(0);
        expect(risk.probability).toBeLessThanOrEqual(100);
        expect(risk.impact).toBeGreaterThanOrEqual(0);
        expect(risk.impact).toBeLessThanOrEqual(100);
      });
    });

    it('should calculate overall risk appropriately', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      expect(result.overallRiskScore).toBeGreaterThan(0);
      expect(result.overallRiskScore).toBeLessThanOrEqual(100);
      expect(Object.values(RiskLevel)).toContain(result.overallRiskLevel);
      
      // 整体风险应该反映个别风险的综合影响
      if (result.riskItems.length > 0) {
        const maxRiskScore = Math.max(...result.riskItems.map(r => r.riskScore));
        expect(result.overallRiskScore).toBeGreaterThanOrEqual(maxRiskScore * 0.3);
      }
    });
  });

  describe('缓解策略和应急计划', () => {
    it('should provide comprehensive mitigation strategies', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      result.riskItems.forEach(risk => {
        expect(risk.mitigationStrategies.length).toBeGreaterThan(0);
        
        risk.mitigationStrategies.forEach(strategy => {
          expect(strategy.name).toBeDefined();
          expect(strategy.description).toBeDefined();
          expect(['preventive', 'corrective', 'detective']).toContain(strategy.type);
          expect(strategy.effectiveness).toBeGreaterThan(0);
          expect(strategy.effectiveness).toBeLessThanOrEqual(100);
          expect(strategy.steps.length).toBeGreaterThan(0);
        });
      });
    });

    it('should provide actionable contingency plans', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      result.riskItems.forEach(risk => {
        expect(risk.contingencyPlans.length).toBeGreaterThan(0);
        
        risk.contingencyPlans.forEach(plan => {
          expect(plan.name).toBeDefined();
          expect(plan.description).toBeDefined();
          expect(plan.triggerConditions.length).toBeGreaterThan(0);
          expect(plan.actions.length).toBeGreaterThan(0);
          expect(plan.responsibleParties.length).toBeGreaterThan(0);
          expect(plan.estimatedDuration).toBeGreaterThan(0);
          expect(plan.successCriteria.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('风险建议生成', () => {
    it('should generate actionable recommendations', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      
      result.recommendations.forEach(rec => {
        expect(['immediate_action', 'monitoring', 'planning', 'resource_allocation']).toContain(rec.type);
        expect(['low', 'medium', 'high', 'critical']).toContain(rec.priority);
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.expectedBenefit).toBeDefined();
        expect(rec.estimatedEffort).toBeGreaterThan(0);
        expect(rec.deadline).toBeDefined();
        expect(rec.relatedRisks.length).toBeGreaterThan(0);
      });
    });

    it('should prioritize critical risks for immediate action', async () => {
      // 创建包含关键风险的计划
      const criticalRiskPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Critical Risk Plan',
        description: 'Plan with critical risks',
        status: PlanStatus.DRAFT,
        goals: ['Test Critical Risks'],
        tasks: [
          {
            taskId: 'critical-task',
            name: 'Extremely Complex Task',
            description: 'Task with extreme complexity and resource demands',
            status: 'pending',
            priority: 'critical',
            type: 'legacy_migration',
            dependencies: [],
            estimatedDuration: { value: 86400, unit: 'seconds' }, // 24 hours - extremely long
            progress: 0,
            resourceRequirements: [
              { resource_type: 'cpu', amount: 95, unit: 'cores' }, // Near maximum
              { resource_type: 'memory', unit: 'GB', amount: 950 } // Near maximum
            ],
            metadata: {}
          }
        ],
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.CRITICAL,
        createdBy: 'test-user'
      });

      const result = await coordinator.assessRisks(criticalRiskPlan);

      expect(result.success).toBe(true);
      
      // 应该有立即行动的建议
      const immediateActions = result.recommendations.filter(rec => 
        rec.type === 'immediate_action'
      );
      expect(immediateActions.length).toBeGreaterThan(0);
      
      // 关键优先级建议应该有短期截止时间
      const criticalRecs = result.recommendations.filter(rec => 
        rec.priority === 'critical'
      );
      if (criticalRecs.length > 0) {
        const criticalRec = criticalRecs[0];
        const deadline = new Date(criticalRec.deadline);
        const now = new Date();
        const timeDiff = deadline.getTime() - now.getTime();
        expect(timeDiff).toBeLessThan(48 * 60 * 60 * 1000); // 48小时内
      }
    });
  });

  describe('性能和边界条件', () => {
    it('should handle empty plans gracefully', async () => {
      const emptyPlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Empty Plan',
        description: 'Plan with no tasks',
        status: PlanStatus.DRAFT,
        goals: [],
        tasks: [],
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.MEDIUM,
        createdBy: 'test-user'
      });

      const result = await coordinator.assessRisks(emptyPlan);

      expect(result.success).toBe(true);
      expect(result.riskItems).toHaveLength(0);
      expect(result.overallRiskLevel).toBe(RiskLevel.VERY_LOW);
      expect(result.overallRiskScore).toBe(0);
      expect(result.performance.identificationAccuracy).toBe(100);
    });

    it('should complete assessment within reasonable time', async () => {
      const startTime = Date.now();
      const result = await coordinator.assessRisks(testPlan);
      const totalTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(totalTime).toBeLessThan(2000); // 应该在2秒内完成
      expect(result.performance.assessmentTime).toBeLessThan(2000);
      expect(result.performance.memoryUsage).toBeGreaterThan(0);
    });

    it('should handle large plans efficiently', async () => {
      // 创建大型计划
      const largeTasks = Array.from({ length: 50 }, (_, i) => ({
        taskId: `large-task-${i}`,
        name: `Large Task ${i}`,
        description: `Large scale task ${i}`,
        status: 'pending' as const,
        priority: 'medium' as const,
        type: i % 5 === 0 ? 'data_processing' : 'development' as const,
        dependencies: i > 0 ? [`large-task-${i - 1}`] : [],
        estimatedDuration: { value: 3600 + (i * 100), unit: 'seconds' },
        progress: 0,
        resourceRequirements: [
          { resource_type: 'cpu', amount: Math.min(90, 10 + i), unit: 'cores' }
        ],
        metadata: {}
      }));

      const largePlan = new Plan({
        planId: uuidv4(),
        contextId: uuidv4(),
        name: 'Large Risk Assessment Plan',
        description: 'Plan with many tasks for risk assessment',
        status: PlanStatus.DRAFT,
        goals: ['Test Large Plan Risk Assessment'],
        tasks: largeTasks,
        dependencies: [],
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        priority: Priority.HIGH,
        createdBy: 'test-user'
      });

      const startTime = Date.now();
      const result = await coordinator.assessRisks(largePlan);
      const totalTime = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(totalTime).toBeLessThan(5000); // 应该在5秒内完成
      expect(result.riskItems.length).toBeGreaterThan(0);
      expect(result.performance.identificationAccuracy).toBeGreaterThanOrEqual(95);
    });
  });

  describe('风险类型覆盖', () => {
    it('should identify multiple risk types', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      const identifiedTypes = new Set(result.riskItems.map(risk => risk.type));
      
      // 应该识别出多种风险类型
      expect(identifiedTypes.size).toBeGreaterThan(3);
      expect(identifiedTypes.has(RiskType.TECHNICAL)).toBe(true);
      expect(identifiedTypes.has(RiskType.RESOURCE)).toBe(true);
      expect(identifiedTypes.has(RiskType.SECURITY)).toBe(true);
    });

    it('should provide comprehensive risk type coverage', async () => {
      const result = await coordinator.assessRisks(testPlan);

      expect(result.success).toBe(true);
      
      // 验证风险摘要包含所有类型的统计
      Object.values(RiskType).forEach(riskType => {
        expect(result.riskSummary.risksByType).toHaveProperty(riskType);
        expect(typeof result.riskSummary.risksByType[riskType]).toBe('number');
      });
      
      // 验证风险等级统计
      Object.values(RiskLevel).forEach(riskLevel => {
        expect(result.riskSummary.risksByLevel).toHaveProperty(riskLevel);
        expect(typeof result.riskSummary.risksByLevel[riskLevel]).toBe('number');
      });
    });
  });
});
