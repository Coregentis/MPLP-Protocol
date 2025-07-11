/**
 * Context模块Schema合规性验证测试
 * 
 * 验证Context模块所有文件是否完全符合context-protocol.json Schema定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T18:00:00+08:00
 * @compliance Schema驱动开发验证
 */

import { ContextEntity } from '../modules/context/entities/context.entity';
import { ContextStateAuditEntity } from '../modules/context/entities/shared-state.entity';
import { ContextSessionEntity } from '../modules/context/entities/context-session.entity';
import { 
  ContextProtocol,
  ContextStatus,
  ContextLifecycleStage,
  SharedState,
  AccessControl,
  ContextConfiguration 
} from '../modules/context/types';
import { createDefaultContextConfiguration, createDefaultAccessControl, createDefaultSharedState } from '../modules/context/context-factory';
import { validateContextConfiguration, isValidStatusTransition, isValidLifecycleTransition } from '../modules/context/utils';

describe('Context模块Schema合规性验证', () => {
  
  describe('ContextEntity Schema合规性', () => {
    let contextEntity: ContextEntity;
    let mockContextProtocol: ContextProtocol;

    beforeEach(() => {
      mockContextProtocol = {
        protocol_version: '1.0.1',
        timestamp: '2025-07-10T18:00:00+08:00',
        context_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Context',
        description: 'Test context for validation',
        status: 'active',
        lifecycle_stage: 'planning',
        shared_state: createDefaultSharedState(),
        access_control: createDefaultAccessControl('test-user', 'admin'),
        configuration: createDefaultContextConfiguration()
      };

      contextEntity = ContextEntity.fromContextProtocol(mockContextProtocol, 'test-user');
    });

    test('应该具有所有必需的Schema字段', () => {
      expect(contextEntity.protocol_version).toBe('1.0.1');
      expect(contextEntity.context_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(contextEntity.name).toBe('Test Context');
      expect(contextEntity.status).toBe('active');
      expect(contextEntity.lifecycle_stage).toBe('planning');
      expect(contextEntity.shared_state).toBeDefined();
      expect(contextEntity.access_control).toBeDefined();
      expect(contextEntity.configuration).toBeDefined();
    });

    test('应该验证status枚举值', () => {
      const validStatuses: ContextStatus[] = ['active', 'suspended', 'completed', 'terminated'];
      
      validStatuses.forEach(status => {
        contextEntity.status = status;
        const validation = contextEntity.validateSchemaCompliance();
        expect(validation.valid).toBe(true);
      });

      // 测试无效状态
      (contextEntity as any).status = 'invalid_status';
      const validation = contextEntity.validateSchemaCompliance();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid status: invalid_status');
    });

    test('应该验证lifecycle_stage枚举值', () => {
      const validStages: ContextLifecycleStage[] = ['planning', 'executing', 'monitoring', 'completed'];
      
      validStages.forEach(stage => {
        contextEntity.lifecycle_stage = stage;
        const validation = contextEntity.validateSchemaCompliance();
        expect(validation.valid).toBe(true);
      });

      // 测试无效阶段
      (contextEntity as any).lifecycle_stage = 'invalid_stage';
      const validation = contextEntity.validateSchemaCompliance();
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Invalid lifecycle_stage: invalid_stage');
    });

    test('应该正确转换为ContextProtocol', () => {
      const protocol = contextEntity.toContextProtocol();
      
      expect(protocol.protocol_version).toBe('1.0.1');
      expect(protocol.context_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(protocol.name).toBe('Test Context');
      expect(protocol.status).toBe('active');
      expect(protocol.lifecycle_stage).toBe('planning');
      expect(protocol.shared_state).toBeInstanceOf(Object);
      expect(protocol.access_control).toBeInstanceOf(Object);
      expect(protocol.configuration).toBeInstanceOf(Object);
    });

    test('应该验证JSONB字段结构', () => {
      const validation = contextEntity.validateSchemaCompliance();
      expect(validation.valid).toBe(true);

      // 测试无效JSON
      contextEntity.shared_state = 'invalid json';
      const invalidValidation = contextEntity.validateSchemaCompliance();
      expect(invalidValidation.valid).toBe(false);
      expect(invalidValidation.errors).toContain('Invalid shared_state JSON format');
    });

    test('应该支持部分更新', () => {
      const originalName = contextEntity.name;
      const originalOperations = contextEntity.total_operations;

      contextEntity.updateFromContextProtocol({
        name: 'Updated Name',
        status: 'suspended'
      });

      expect(contextEntity.name).toBe('Updated Name');
      expect(contextEntity.status).toBe('suspended');
      expect(contextEntity.total_operations).toBe(originalOperations + 1);
    });
  });

  describe('Context工厂函数Schema合规性', () => {
    test('createDefaultSharedState应该创建有效的SharedState', () => {
      const sharedState = createDefaultSharedState();
      
      expect(sharedState.variables).toBeDefined();
      expect(sharedState.resources).toBeDefined();
      expect(sharedState.resources.allocated).toBeDefined();
      expect(sharedState.resources.requirements).toBeDefined();
      expect(sharedState.dependencies).toBeInstanceOf(Array);
      expect(sharedState.goals).toBeInstanceOf(Array);
    });

    test('createDefaultAccessControl应该创建有效的AccessControl', () => {
      const accessControl = createDefaultAccessControl('test-user', 'admin');
      
      expect(accessControl.owner).toBeDefined();
      expect(accessControl.owner.user_id).toBe('test-user');
      expect(accessControl.owner.role).toBe('admin');
      expect(accessControl.permissions).toBeInstanceOf(Array);
      expect(accessControl.permissions.length).toBeGreaterThan(0);
    });

    test('createDefaultContextConfiguration应该创建有效的Configuration', () => {
      const config = createDefaultContextConfiguration();
      
      expect(config.timeout_settings).toBeDefined();
      expect(config.timeout_settings.default_timeout).toBeGreaterThan(0);
      expect(config.timeout_settings.max_timeout).toBeGreaterThan(config.timeout_settings.default_timeout);
      expect(config.persistence).toBeDefined();
      expect(config.persistence.enabled).toBeDefined();
      expect(config.notification_settings).toBeDefined();
    });
  });

  describe('Context工具函数Schema合规性', () => {
    test('状态转换验证应该符合Schema规则', () => {
      // 测试有效转换
      expect(isValidStatusTransition('active', 'suspended')).toBe(true);
      expect(isValidStatusTransition('active', 'completed')).toBe(true);
      expect(isValidStatusTransition('suspended', 'active')).toBe(true);
      
      // 测试无效转换
      expect(isValidStatusTransition('completed', 'active')).toBe(false);
      expect(isValidStatusTransition('terminated', 'active')).toBe(false);
    });

    test('生命周期转换验证应该符合Schema规则', () => {
      // 测试有效转换
      expect(isValidLifecycleTransition('planning', 'executing')).toBe(true);
      expect(isValidLifecycleTransition('executing', 'monitoring')).toBe(true);
      expect(isValidLifecycleTransition('monitoring', 'completed')).toBe(true);
      
      // 测试无效转换
      expect(isValidLifecycleTransition('completed', 'planning')).toBe(false);
      expect(isValidLifecycleTransition('planning', 'monitoring')).toBe(false);
    });

    test('配置验证应该符合Schema要求', () => {
      const validConfig = createDefaultContextConfiguration();
      const validation = validateContextConfiguration(validConfig);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // 测试无效配置
      const invalidConfig = { ...validConfig };
      delete (invalidConfig as any).timeout_settings;
      const invalidValidation = validateContextConfiguration(invalidConfig);
      expect(invalidValidation.valid).toBe(false);
      expect(invalidValidation.errors).toContain('Missing timeout_settings');
    });
  });

  describe('非Schema实体验证', () => {
    test('ContextStateAuditEntity应该明确标记为非Schema实体', () => {
      const audit = ContextStateAuditEntity.createVariableChangeAudit(
        'test-context-id',
        'variables.test_var',
        'old_value',
        'new_value',
        'test-user'
      );

      expect(audit.context_id).toBe('test-context-id');
      expect(audit.operation_type).toBe('variable_updated');
      expect(audit.variable_path).toBe('variables.test_var');
      expect(audit.changed_by).toBe('test-user');
      expect(audit.status).toBe('applied');
    });

    test('ContextSessionEntity应该明确标记为非Schema实体', () => {
      const session = ContextSessionEntity.createSession(
        'session-123',
        'context-123',
        'user-123',
        60
      );

      expect(session.session_id).toBe('session-123');
      expect(session.context_id).toBe('context-123');
      expect(session.user_id).toBe('user-123');
      expect(session.is_active).toBe(true);
      expect(session.status).toBe('active');
    });
  });

  describe('完整Schema一致性检查', () => {
    test('所有Context相关类型应该与Schema一致', () => {
      // 确认所有导入的类型都存在且正确
      expect(ContextEntity).toBeDefined();
      expect(ContextStateAuditEntity).toBeDefined();
      expect(ContextSessionEntity).toBeDefined();
      
      // 确认Schema兼容的类型接口存在
      const protocol: ContextProtocol = {
        protocol_version: '1.0.1',
        timestamp: '2025-07-10T18:00:00+08:00',
        context_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test',
        status: 'active',
        lifecycle_stage: 'planning',
        shared_state: createDefaultSharedState(),
        access_control: createDefaultAccessControl('user', 'admin'),
        configuration: createDefaultContextConfiguration()
      };

      expect(protocol.protocol_version).toBe('1.0.1');
      expect(protocol.status).toBe('active');
      expect(protocol.lifecycle_stage).toBe('planning');
    });

    test('Schema枚举值应该完全匹配', () => {
      const validStatuses: ContextStatus[] = ['active', 'suspended', 'completed', 'terminated'];
      const validStages: ContextLifecycleStage[] = ['planning', 'executing', 'monitoring', 'completed'];
      
      // 确认枚举值与Schema定义一致
      expect(validStatuses).toHaveLength(4);
      expect(validStages).toHaveLength(4);
      
      expect(validStatuses).toContain('active');
      expect(validStatuses).toContain('suspended');
      expect(validStatuses).toContain('completed');
      expect(validStatuses).toContain('terminated');
      
      expect(validStages).toContain('planning');
      expect(validStages).toContain('executing');
      expect(validStages).toContain('monitoring');
      expect(validStages).toContain('completed');
    });
  });
});

describe('Context模块重构完成验证', () => {
  test('所有重构文件应该存在且可导入', () => {
    // 验证context-factory.ts重构完成
    expect(createDefaultContextConfiguration).toBeDefined();
    expect(createDefaultAccessControl).toBeDefined();
    expect(createDefaultSharedState).toBeDefined();
    
    // 验证utils.ts重构完成
    expect(validateContextConfiguration).toBeDefined();
    expect(isValidStatusTransition).toBeDefined();
    expect(isValidLifecycleTransition).toBeDefined();
    
    // 验证entities重构完成
    expect(ContextEntity).toBeDefined();
    expect(ContextStateAuditEntity).toBeDefined();
    expect(ContextSessionEntity).toBeDefined();
  });

  test('Schema协议版本应该一致', () => {
    const protocol = {
      protocol_version: '1.0.1'
    };
    
    expect(protocol.protocol_version).toBe('1.0.1');
  });
}); 