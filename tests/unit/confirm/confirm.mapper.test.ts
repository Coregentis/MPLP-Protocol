/**
 * Confirm Mapper单元测试
 * 
 * 测试Schema-TypeScript双重命名约定映射的正确性
 * 验证企业级审批工作流映射功能
 * 
 * @version 1.0.0
 * @created 2025-08-18
 */

import { ConfirmMapper, ConfirmSchema, ConfirmEntityData } from '../../../src/modules/confirm/api/mappers/confirm.mapper';

describe('ConfirmMapper单元测试', () => {
  describe('Schema验证', () => {
    it('应该验证有效的Schema数据', () => {
      const validSchema = ConfirmMapper.createDefaultSchema();
      expect(ConfirmMapper.validateSchema(validSchema)).toBe(true);
    });

    it('应该拒绝无效的Schema数据', () => {
      expect(ConfirmMapper.validateSchema(null)).toBe(false);
      expect(ConfirmMapper.validateSchema(undefined)).toBe(false);
      expect(ConfirmMapper.validateSchema({})).toBe(false);
      expect(ConfirmMapper.validateSchema('invalid')).toBe(false);
    });

    it('应该验证必需字段', () => {
      const incompleteSchema = {
        confirm_id: 'test-id',
        context_id: 'test-context',
        // 缺少其他必需字段
      };
      expect(ConfirmMapper.validateSchema(incompleteSchema)).toBe(false);
    });
  });

  describe('Schema到TypeScript映射', () => {
    it('应该正确映射基础字段', () => {
      const schema = ConfirmMapper.createDefaultSchema({
        confirm_id: 'test-confirm-123',
        context_id: 'test-context-456',
        confirmation_type: 'plan_approval',
        status: 'pending',
        priority: 'high',
      });

      const result = ConfirmMapper.fromSchema(schema);

      expect(result.confirmId).toBe('test-confirm-123');
      expect(result.contextId).toBe('test-context-456');
      expect(result.confirmationType).toBe('plan_approval');
      expect(result.status).toBe('pending');
      expect(result.priority).toBe('high');
    });

    it('应该正确映射时间字段', () => {
      const testDate = '2025-08-18T10:00:00.000Z';
      const schema = ConfirmMapper.createDefaultSchema({
        timestamp: testDate,
        created_at: testDate,
        updated_at: testDate,
        expires_at: testDate,
      });

      const result = ConfirmMapper.fromSchema(schema);

      expect(result.timestamp).toEqual(new Date(testDate));
      expect(result.createdAt).toEqual(new Date(testDate));
      expect(result.updatedAt).toEqual(new Date(testDate));
      expect(result.expiresAt).toEqual(new Date(testDate));
    });

    it('应该正确映射审批工作流', () => {
      const schema = ConfirmMapper.createDefaultSchema({
        approval_workflow: {
          workflow_type: 'sequential',
          current_step: 2,
          total_steps: 3,
          steps: [
            {
              step_id: 'step-1',
              step_name: 'Initial Review',
              approver_id: 'approver-1',
              approver_name: 'John Doe',
              approver_role: 'manager',
              status: 'approved',
              decision_deadline: '2025-08-20T10:00:00.000Z',
              comments: 'Approved with conditions',
              decided_at: '2025-08-18T15:00:00.000Z',
            },
          ],
          escalation_rules: {
            enabled: true,
            escalation_levels: [
              {
                level: 1,
                trigger_after_hours: 24,
                escalate_to_user_id: 'escalation-user-1',
                escalate_to_role: 'senior_manager',
              },
            ],
          },
        },
      });

      const result = ConfirmMapper.fromSchema(schema);

      expect(result.approvalWorkflow.workflowType).toBe('sequential');
      expect(result.approvalWorkflow.currentStep).toBe(2);
      expect(result.approvalWorkflow.totalSteps).toBe(3);
      expect(result.approvalWorkflow.steps).toHaveLength(1);
      
      const step = result.approvalWorkflow.steps[0];
      expect(step.stepId).toBe('step-1');
      expect(step.stepName).toBe('Initial Review');
      expect(step.approverId).toBe('approver-1');
      expect(step.approverName).toBe('John Doe');
      expect(step.approverRole).toBe('manager');
      expect(step.status).toBe('approved');
      expect(step.decisionDeadline).toEqual(new Date('2025-08-20T10:00:00.000Z'));
      expect(step.comments).toBe('Approved with conditions');
      expect(step.decidedAt).toEqual(new Date('2025-08-18T15:00:00.000Z'));

      expect(result.approvalWorkflow.escalationRules?.enabled).toBe(true);
      expect(result.approvalWorkflow.escalationRules?.escalationLevels).toHaveLength(1);
      
      const escalationLevel = result.approvalWorkflow.escalationRules!.escalationLevels[0];
      expect(escalationLevel.level).toBe(1);
      expect(escalationLevel.triggerAfterHours).toBe(24);
      expect(escalationLevel.escalateToUserId).toBe('escalation-user-1');
      expect(escalationLevel.escalateToRole).toBe('senior_manager');
    });

    it('应该正确映射AI集成接口', () => {
      const schema = ConfirmMapper.createDefaultSchema({
        ai_integration_interface: {
          enabled: true,
          ai_provider: 'openai',
          model_configuration: {
            model_name: 'gpt-4',
            temperature: 0.7,
            max_tokens: 1000,
            custom_parameters: { top_p: 0.9 },
          },
          ai_features: {
            approval_recommendation: true,
            risk_analysis: true,
            compliance_check: false,
            stakeholder_suggestion: true,
          },
          ai_responses: [
            {
              feature: 'approval_recommendation',
              response: { recommendation: 'approve', confidence: 0.85 },
              confidence_score: 0.85,
              timestamp: '2025-08-18T10:00:00.000Z',
            },
          ],
        },
      });

      const result = ConfirmMapper.fromSchema(schema);

      expect(result.aiIntegrationInterface.enabled).toBe(true);
      expect(result.aiIntegrationInterface.aiProvider).toBe('openai');
      expect(result.aiIntegrationInterface.modelConfiguration.modelName).toBe('gpt-4');
      expect(result.aiIntegrationInterface.modelConfiguration.temperature).toBe(0.7);
      expect(result.aiIntegrationInterface.modelConfiguration.maxTokens).toBe(1000);
      expect(result.aiIntegrationInterface.modelConfiguration.customParameters).toEqual({ top_p: 0.9 });
      
      expect(result.aiIntegrationInterface.aiFeatures.approvalRecommendation).toBe(true);
      expect(result.aiIntegrationInterface.aiFeatures.riskAnalysis).toBe(true);
      expect(result.aiIntegrationInterface.aiFeatures.complianceCheck).toBe(false);
      expect(result.aiIntegrationInterface.aiFeatures.stakeholderSuggestion).toBe(true);
      
      expect(result.aiIntegrationInterface.aiResponses).toHaveLength(1);
      const aiResponse = result.aiIntegrationInterface.aiResponses![0];
      expect(aiResponse.feature).toBe('approval_recommendation');
      expect(aiResponse.response).toEqual({ recommendation: 'approve', confidence: 0.85 });
      expect(aiResponse.confidenceScore).toBe(0.85);
      expect(aiResponse.timestamp).toEqual(new Date('2025-08-18T10:00:00.000Z'));
    });
  });

  describe('TypeScript到Schema映射', () => {
    it('应该正确映射实体数据到Schema', () => {
      const entityData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'test-confirm-123',
        contextId: 'test-context-456',
        confirmationType: 'plan_approval',
        status: 'pending',
        priority: 'high',
      });

      const result = ConfirmMapper.toSchema(entityData);

      expect(result.confirm_id).toBe('test-confirm-123');
      expect(result.context_id).toBe('test-context-456');
      expect(result.confirmation_type).toBe('plan_approval');
      expect(result.status).toBe('pending');
      expect(result.priority).toBe('high');
    });
  });

  describe('批量转换', () => {
    it('应该正确处理Schema数组转换', () => {
      const schemas = [
        ConfirmMapper.createDefaultSchema({ confirm_id: 'test-1' }),
        ConfirmMapper.createDefaultSchema({ confirm_id: 'test-2' }),
      ];

      const results = ConfirmMapper.fromSchemaArray(schemas);

      expect(results).toHaveLength(2);
      expect(results[0].confirmId).toBe('test-1');
      expect(results[1].confirmId).toBe('test-2');
    });

    it('应该正确处理实体数组转换', () => {
      const entities = [
        ConfirmMapper.createDefaultEntityData({ confirmId: 'test-1' }),
        ConfirmMapper.createDefaultEntityData({ confirmId: 'test-2' }),
      ];

      const results = ConfirmMapper.toSchemaArray(entities);

      expect(results).toHaveLength(2);
      expect(results[0].confirm_id).toBe('test-1');
      expect(results[1].confirm_id).toBe('test-2');
    });
  });

  describe('默认数据创建', () => {
    it('应该创建有效的默认Schema', () => {
      const defaultSchema = ConfirmMapper.createDefaultSchema();
      expect(ConfirmMapper.validateSchema(defaultSchema)).toBe(true);
    });

    it('应该创建有效的默认EntityData', () => {
      const defaultData = ConfirmMapper.createDefaultEntityData();
      expect(defaultData.confirmId).toBeDefined();
      expect(defaultData.contextId).toBeDefined();
      expect(defaultData.confirmationType).toBe('plan_approval');
      expect(defaultData.status).toBe('pending');
      expect(defaultData.priority).toBe('medium');  // 修复：使用正确的枚举值
    });

    it('应该支持覆盖默认值', () => {
      const customData = ConfirmMapper.createDefaultEntityData({
        confirmationType: 'emergency_approval',
        priority: 'critical',
      });
      
      expect(customData.confirmationType).toBe('emergency_approval');
      expect(customData.priority).toBe('critical');
    });
  });
});
