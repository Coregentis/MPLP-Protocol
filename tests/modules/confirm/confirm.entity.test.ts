/**
 * Confirm实体单元测试
 * 
 * 基于Schema驱动测试原则，测试Confirm实体的所有领域行为
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T17:00:00+08:00
 */

import { Confirm } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import {
  ConfirmationType,
  ConfirmStatus,
  Priority,
  ConfirmDecision,
  ConfirmSubject,
  Requester,
  ApprovalWorkflow,
  ConfirmMetadata,
  ImpactAssessment
} from '../../../src/modules/confirm/types';

import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('Confirm Entity', () => {

  // 辅助函数：创建有效的ConfirmSubject
  const createValidSubject = (title: string = 'Test Confirmation', description: string = 'Test'): ConfirmSubject => ({
    title,
    description,
    impact_assessment: {
      scope: 'project',
      business_impact: 'medium',
      technical_impact: 'low'
    } as ImpactAssessment
  });

  // 辅助函数：创建有效的Requester
  const createValidRequester = (userId: string = 'user-123'): Requester => ({
    user_id: userId,
    role: 'manager',
    request_reason: 'Testing purposes'
  });

  // 辅助函数：创建有效的ApprovalWorkflow
  const createValidWorkflow = (): ApprovalWorkflow => ({
    workflow_type: 'sequential',
    steps: [
      {
        step_id: TestDataFactory.Base.generateUUID(),
        step_name: 'Initial Review',
        step_order: 1,
        approver: { user_id: 'approver-1', role: 'supervisor', is_required: true },
        status: 'pending'
      }
    ]
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
  });

  describe('构造函数', () => {
    it('应该正确创建Confirm实例', async () => {
      // 基于实际Schema创建测试数据
      const confirmParams = {
        confirm_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        plan_id: TestDataFactory.Base.generateUUID(),
        protocol_version: '1.0.0',
        confirmation_type: 'plan_approval' as ConfirmationType,
        status: 'pending' as ConfirmStatus,
        priority: 'medium' as Priority,
        subject: createValidSubject('Test Confirmation', 'Test confirmation description'),
        requester: createValidRequester('user-123'),
        approval_workflow: createValidWorkflow(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        decision: undefined,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          source: 'test',
          tags: ['test', 'unit'],
          custom_fields: { test: true }
        } as ConfirmMetadata
      };

      // 执行测试
      const confirm = await TestHelpers.Performance.expectExecutionTime(
        () => new Confirm(
          confirmParams.confirm_id,
          confirmParams.context_id,
          confirmParams.protocol_version,
          confirmParams.confirmation_type,
          confirmParams.status,
          confirmParams.priority,
          confirmParams.subject,
          confirmParams.requester,
          confirmParams.approval_workflow,
          confirmParams.created_at,
          confirmParams.updated_at,
          confirmParams.plan_id,
          confirmParams.decision,
          confirmParams.expires_at,
          confirmParams.metadata
        ),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.ENTITY_VALIDATION
      );

      // 验证结果 - 基于实际getter方法
      expect(confirm.confirm_id).toBe(confirmParams.confirm_id);
      expect(confirm.context_id).toBe(confirmParams.context_id);
      expect(confirm.plan_id).toBe(confirmParams.plan_id);
      expect(confirm.protocol_version).toBe(confirmParams.protocol_version);
      expect(confirm.confirmation_type).toBe(confirmParams.confirmation_type);
      expect(confirm.status).toBe(confirmParams.status);
      expect(confirm.priority).toBe(confirmParams.priority);
      expect(confirm.subject).toEqual(confirmParams.subject);
      expect(confirm.requester).toEqual(confirmParams.requester);
      expect(confirm.approval_workflow).toEqual(confirmParams.approval_workflow);
      expect(confirm.decision).toBe(confirmParams.decision);
      expect(confirm.created_at).toBe(confirmParams.created_at);
      expect(confirm.updated_at).toBe(confirmParams.updated_at);
      expect(confirm.expires_at).toBe(confirmParams.expires_at);
      expect(confirm.metadata).toEqual(confirmParams.metadata);
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '空字符串标题',
          input: { title: '', description: 'Test' },
          expectedError: '确认主题标题不能为空'
        },
        {
          name: '超长标题',
          input: { title: 'a'.repeat(10000), description: 'Test' },
          expectedError: undefined
        },
        {
          name: '空描述',
          input: { title: 'Valid Title', description: '' },
          expectedError: undefined
        },
        {
          name: '无效用户ID',
          input: { title: 'Valid Title', description: 'Test', user_id: '' },
          expectedError: '请求者用户ID不能为空'
        }
      ];

      for (const test of boundaryTests) {
        if (test.expectedError) {
          // 对于期望错误的测试，直接创建无效数据
          const subject = test.input.title === '' ?
            { title: '', description: 'Test', impact_assessment: { scope: 'project', business_impact: 'medium', technical_impact: 'low' } } :
            createValidSubject(test.input.title, test.input.description || 'Default description');

          const requester = test.input.user_id === '' ?
            { user_id: '', role: 'manager', request_reason: 'Test' } :
            createValidRequester(test.input.user_id || 'valid-user-id');

          expect(() => {
            new Confirm(
              TestDataFactory.Base.generateUUID(),
              TestDataFactory.Base.generateUUID(),
              '1.0.0',
              'plan_approval',
              'pending',
              'medium',
              subject as any,
              requester as any,
              createValidWorkflow(),
              new Date().toISOString(),
              new Date().toISOString()
            );
          }).toThrow(test.expectedError);
        } else {
          // 对于正常测试，创建有效数据
          const subject = createValidSubject(test.input.title, test.input.description || 'Default description');
          const requester = createValidRequester(test.input.user_id || 'valid-user-id');

          const confirm = new Confirm(
            TestDataFactory.Base.generateUUID(),
            TestDataFactory.Base.generateUUID(),
            '1.0.0',
            'plan_approval',
            'pending',
            'medium',
            subject,
            requester,
            createValidWorkflow(),
            new Date().toISOString(),
            new Date().toISOString()
          );

          expect(confirm.subject.title).toBe(test.input.title);
          expect(confirm.subject.description).toBe(test.input.description || 'Default description');
        }
      }
    });
  });

  describe('updateStatus', () => {
    it('应该成功更新状态', async () => {
      // 准备测试数据
      const confirm = new Confirm(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'plan_approval',
        'pending',
        'medium',
        createValidSubject('Test Confirmation', 'Test'),
        createValidRequester('user-123'),
        createValidWorkflow(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const originalUpdatedAt = confirm.updated_at;
      
      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      confirm.updateStatus('in_review');

      // 验证结果
      expect(confirm.status).toBe('in_review');
      expect(confirm.updated_at).not.toBe(originalUpdatedAt);
    });

    it('应该测试所有有效状态转换', () => {
      const statusTransitions = [
        { from: 'pending', to: 'in_review' },
        { from: 'in_review', to: 'approved' },
        { from: 'in_review', to: 'rejected' },
        { from: 'pending', to: 'cancelled' }
      ];

      statusTransitions.forEach(({ from, to }) => {
        const confirm = new Confirm(
          TestDataFactory.Base.generateUUID(),
          TestDataFactory.Base.generateUUID(),
          '1.0.0',
          'plan_approval',
          from as ConfirmStatus,
          'medium',
          createValidSubject('Test Confirmation', 'Test'),
          createValidRequester('user-123'),
          createValidWorkflow(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        confirm.updateStatus(to as ConfirmStatus);
        expect(confirm.status).toBe(to);
      });
    });
  });

  describe('setDecision', () => {
    it('应该成功设置决策', async () => {
      // 准备测试数据
      const confirm = new Confirm(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'plan_approval',
        'in_review',
        'medium',
        createValidSubject('Test Confirmation', 'Test'),
        createValidRequester('user-123'),
        createValidWorkflow(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const originalUpdatedAt = confirm.updated_at;
      
      // 等待足够时间确保时间差异
      await TestHelpers.Async.wait(10);

      // 执行测试
      confirm.setDecision('approved');

      // 验证结果
      expect(confirm.decision).toBe('approved');
      expect(confirm.updated_at).not.toBe(originalUpdatedAt);
    });

    it('应该测试所有决策类型', () => {
      const decisions: ConfirmDecision[] = ['approved', 'rejected', 'escalated'];

      decisions.forEach(decision => {
        const confirm = new Confirm(
          TestDataFactory.Base.generateUUID(),
          TestDataFactory.Base.generateUUID(),
          '1.0.0',
          'plan_approval',
          'in_review',
          'medium',
          createValidSubject('Test Confirmation', 'Test'),
          createValidRequester('user-123'),
          createValidWorkflow(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        confirm.setDecision(decision);
        expect(confirm.decision).toBe(decision);
      });
    });
  });

  describe('canCancel', () => {
    it('应该正确识别可取消的状态', () => {
      const cancellableStatuses: ConfirmStatus[] = ['pending', 'in_review'];
      const nonCancellableStatuses: ConfirmStatus[] = ['approved', 'rejected', 'cancelled', 'expired'];

      // 测试可取消状态
      cancellableStatuses.forEach(status => {
        const confirm = new Confirm(
          TestDataFactory.Base.generateUUID(),
          TestDataFactory.Base.generateUUID(),
          '1.0.0',
          'plan_approval',
          status,
          'medium',
          createValidSubject('Test Confirmation', 'Test'),
          createValidRequester('user-123'),
          createValidWorkflow(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        expect(confirm.canCancel()).toBe(true);
      });

      // 测试不可取消状态
      nonCancellableStatuses.forEach(status => {
        const confirm = new Confirm(
          TestDataFactory.Base.generateUUID(),
          TestDataFactory.Base.generateUUID(),
          '1.0.0',
          'plan_approval',
          status,
          'medium',
          createValidSubject('Test Confirmation', 'Test'),
          createValidRequester('user-123'),
          createValidWorkflow(),
          new Date().toISOString(),
          new Date().toISOString()
        );

        expect(confirm.canCancel()).toBe(false);
      });
    });
  });

  describe('cancel', () => {
    it('应该成功取消可取消的确认', async () => {
      // 准备测试数据
      const confirm = new Confirm(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'plan_approval',
        'pending',
        'medium',
        createValidSubject('Test Confirmation', 'Test'),
        createValidRequester('user-123'),
        createValidWorkflow(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const originalUpdatedAt = confirm.updated_at;

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      confirm.cancel();

      // 验证结果
      expect(confirm.status).toBe('cancelled');
      expect(new Date(confirm.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());
    });

    it('应该拒绝取消不可取消的确认', () => {
      // 准备测试数据
      const confirm = new Confirm(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'plan_approval',
        'approved',
        'medium',
        createValidSubject('Test Confirmation', 'Test'),
        createValidRequester('user-123'),
        createValidWorkflow(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 执行测试并验证异常
      expect(() => {
        confirm.cancel();
      }).toThrow('无法取消状态为 approved 的确认');
    });
  });
});
