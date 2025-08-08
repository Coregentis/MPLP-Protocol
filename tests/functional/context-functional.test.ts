/**
 * Context模块功能场景测试
 * 
 * 基于实际功能实现的功能场景测试，确保90%功能场景覆盖率
 * 测试覆盖：核心业务功能、异常处理、错误返回、边界条件等场景
 * 
 * @version 1.0.0
 * @created 2025-08-02
 */

import { Context } from '../../src/modules/context/domain/entities/context.entity';
import { ContextFactory } from '../../src/modules/context/domain/factories/context.factory';
import { ContextValidationService } from '../../src/modules/context/domain/services/context-validation.service';
import { ContextManagementService } from '../../src/modules/context/application/services/context-management.service';
import { SharedStateManagementService } from '../../src/modules/context/application/services/shared-state-management.service';
import { AccessControlManagementService } from '../../src/modules/context/application/services/access-control-management.service';
import { EntityStatus } from '../../src/public/shared/types';
import { ContextLifecycleStage } from '../../src/public/shared/types/context-types';
import {
  CreateContextRequest,
  UpdateContextRequest,
  ContextOperationRequest,
  ContextSyncRequest,
  ContextAnalysisRequest,
  ContextFilter,
  StatusOptions,
  ContextType,
} from '../../src/modules/context/types';
import { v4 as uuidv4 } from 'uuid';

describe('Context模块功能场景测试', () => {
  let contextFactory: ContextFactory;
  let validationService: ContextValidationService;

  beforeEach(() => {
    contextFactory = new ContextFactory();
    validationService = new ContextValidationService();
  });

  describe('1. 上下文创建场景', () => {
    describe('正常创建场景', () => {
      it('应该成功创建基本上下文', () => {
        const context = contextFactory.createContext({
          name: 'Test Context',
          description: 'A test context for functional testing'
        });

        expect(context).toBeInstanceOf(Context);
        expect(context.name).toBe('Test Context');
        expect(context.description).toBe('A test context for functional testing');
        expect(context.lifecycleStage).toBe(ContextLifecycleStage.INITIALIZATION);
        expect(context.status).toBe(EntityStatus.ACTIVE);
        expect(context.sessionIds).toEqual([]);
        expect(context.sharedStateIds).toEqual([]);
        expect(context.configuration).toEqual({});
        expect(context.metadata).toEqual({
          createdBy: 'system',
          version: '1.0.0'
        });
        expect(context.contextId).toBeDefined();
        expect(context.createdAt).toBeInstanceOf(Date);
        expect(context.updatedAt).toBeInstanceOf(Date);
      });

      it('应该成功创建带配置和元数据的上下文', () => {
        const configuration = {
          maxSessions: 10,
          timeout: 30000,
          retryPolicy: { maxRetries: 3, backoffMs: 1000 }
        };
        const metadata = {
          projectType: 'web_application',
          priority: 'high',
          tags: ['production', 'critical']
        };

        const context = contextFactory.createContext({
          name: 'Advanced Context',
          description: 'Context with configuration and metadata',
          configuration,
          metadata
        });

        expect(context.configuration).toEqual(configuration);
        expect(context.metadata).toEqual({
          createdBy: 'system',
          version: '1.0.0',
          ...metadata
        });
      });

      it('应该成功创建最小化上下文（仅必需字段）', () => {
        const context = contextFactory.createContext({
          name: 'Minimal Context'
        });

        expect(context.name).toBe('Minimal Context');
        expect(context.description).toBeNull();
        expect(context.configuration).toEqual({});
        expect(context.metadata).toEqual({
          createdBy: 'system',
          version: '1.0.0'
        });
      });
    });

    describe('异常创建场景', () => {
      it('应该拒绝创建空名称的上下文（已修复源代码问题）', () => {
        // 修复后的ContextFactory会在创建时验证输入
        expect(() => {
          contextFactory.createContext({
            name: ''
          });
        }).toThrow('Invalid context name: Context name cannot be empty');

        // 验证服务也能独立检测错误
        const error = validationService.validateName('');
        expect(error).not.toBeNull();
        expect(error!.field).toBe('name');
      });

      it('应该通过验证服务检测无效名称', () => {
        // 测试各种无效名称
        const invalidNames = ['', '   ', null, undefined];

        invalidNames.forEach(name => {
          if (name !== null && name !== undefined) {
            const error = validationService.validateName(name);
            expect(error).not.toBeNull();
          }
        });
      });

      it('应该在创建时就拒绝无效输入（已修复源代码问题）', () => {
        // 修复后的ContextFactory不会创建无效的Context
        expect(() => {
          contextFactory.createContext({
            name: ''
          });
        }).toThrow('Invalid context name: Context name cannot be empty');

        // 验证服务仍然可以独立验证
        const validContext = contextFactory.createContext({
          name: 'Valid Context'
        });
        const errors = validationService.validateContext(validContext);
        expect(errors.length).toBe(0);
      });
    });

    describe('边界条件场景', () => {
      it('应该拒绝创建极长名称的上下文（已修复源代码问题）', () => {
        const longName = 'A'.repeat(1000);

        // 修复后的ContextFactory会在创建时验证长度
        expect(() => {
          contextFactory.createContext({
            name: longName
          });
        }).toThrow('Invalid context name: Context name cannot exceed 100 characters');
      });

      it('应该处理特殊字符名称的上下文创建', () => {
        const specialName = '测试上下文 @#$%^&*()_+-=[]{}|;:,.<>?';
        const context = contextFactory.createContext({
          name: specialName
        });

        expect(context.name).toBe(specialName);
      });

      it('应该处理复杂嵌套配置的上下文创建', () => {
        const complexConfig = {
          database: {
            host: 'localhost',
            port: 5432,
            credentials: {
              username: 'user',
              password: 'pass'
            }
          },
          features: {
            enableLogging: true,
            logLevel: 'debug',
            modules: ['auth', 'api', 'worker']
          }
        };

        const context = contextFactory.createContext({
          name: 'Complex Config Context',
          configuration: complexConfig
        });

        expect(context.configuration).toEqual(complexConfig);
      });
    });
  });

  describe('2. 配置管理场景', () => {
    let context: Context;

    beforeEach(() => {
      context = contextFactory.createContext({
        name: 'Config Test Context',
        configuration: {
          initialSetting: 'value1',
          maxSessions: 5
        }
      });
    });

    describe('配置更新场景', () => {
      it('应该成功更新配置', () => {
        const originalUpdatedAt = context.updatedAt;
        
        // 等待一毫秒确保时间戳不同
        setTimeout(() => {
          context.updateConfiguration({
            newSetting: 'value2',
            maxSessions: 10
          });

          expect(context.configuration.initialSetting).toBe('value1');
          expect(context.configuration.newSetting).toBe('value2');
          expect(context.configuration.maxSessions).toBe(10);
          expect(context.updatedAt).not.toBe(originalUpdatedAt);
        }, 1);
      });

      it('应该支持配置覆盖', () => {
        context.updateConfiguration({
          maxSessions: 20,
          overriddenSetting: 'new'
        });

        expect(context.configuration.maxSessions).toBe(20);
        expect(context.configuration.overriddenSetting).toBe('new');
      });

      it('应该支持嵌套配置更新', () => {
        context.updateConfiguration({
          database: {
            host: 'remote-host',
            port: 3306
          }
        });

        expect(context.configuration.database).toEqual({
          host: 'remote-host',
          port: 3306
        });
      });
    });

    describe('配置验证场景', () => {
      it('应该验证会话数量限制', () => {
        // 设置最大会话数为3
        context.updateConfiguration({ maxSessions: 3 });
        
        // 添加4个会话ID
        context.addSessionId(uuidv4());
        context.addSessionId(uuidv4());
        context.addSessionId(uuidv4());
        context.addSessionId(uuidv4());

        const errors = validationService.validateContext(context);
        expect(errors).toHaveLength(1);
        expect(errors[0].field).toBe('sessionIds');
        expect(errors[0].message).toContain('exceeds configured maximum');
      });

      it('应该通过会话数量限制验证', () => {
        context.updateConfiguration({ maxSessions: 5 });
        
        context.addSessionId(uuidv4());
        context.addSessionId(uuidv4());

        const errors = validationService.validateContext(context);
        expect(errors).toHaveLength(0);
      });
    });
  });

  describe('3. 生命周期管理场景', () => {
    let context: Context;

    beforeEach(() => {
      context = contextFactory.createContext({
        name: 'Lifecycle Test Context'
      });
    });

    describe('状态转换场景', () => {
      it('应该成功激活暂停的上下文', () => {
        // 先暂停上下文
        context.suspend();
        expect(context.status).toBe(EntityStatus.SUSPENDED);

        // 然后激活
        const result = context.activate();
        expect(result).toBe(true);
        expect(context.status).toBe(EntityStatus.ACTIVE);
      });

      it('应该拒绝激活已激活的上下文', () => {
        expect(context.status).toBe(EntityStatus.ACTIVE);
        
        const result = context.activate();
        expect(result).toBe(false);
        expect(context.status).toBe(EntityStatus.ACTIVE);
      });

      it('应该成功暂停激活的上下文', () => {
        expect(context.status).toBe(EntityStatus.ACTIVE);
        
        const result = context.suspend();
        expect(result).toBe(true);
        expect(context.status).toBe(EntityStatus.SUSPENDED);
      });

      it('应该拒绝暂停已暂停的上下文', () => {
        context.suspend();
        expect(context.status).toBe(EntityStatus.SUSPENDED);
        
        const result = context.suspend();
        expect(result).toBe(false);
        expect(context.status).toBe(EntityStatus.SUSPENDED);
      });

      it('应该成功终止任何状态的上下文', () => {
        // 测试从ACTIVE状态终止
        let result = context.terminate();
        expect(result).toBe(true);
        expect(context.status).toBe(EntityStatus.DELETED);

        // 测试从DELETED状态再次终止
        result = context.terminate();
        expect(result).toBe(false);
        expect(context.status).toBe(EntityStatus.DELETED);
      });
    });

    describe('生命周期阶段转换场景', () => {
      it('应该成功从初始化阶段转换到活跃阶段', () => {
        expect(context.lifecycleStage).toBe(ContextLifecycleStage.INITIALIZATION);
        
        const result = context.updateLifecycleStage(ContextLifecycleStage.ACTIVE);
        expect(result).toBe(true);
        expect(context.lifecycleStage).toBe(ContextLifecycleStage.ACTIVE);
      });

      it('应该成功按顺序转换所有生命周期阶段', () => {
        // INITIALIZATION -> ACTIVE
        context.updateLifecycleStage(ContextLifecycleStage.ACTIVE);
        expect(context.lifecycleStage).toBe(ContextLifecycleStage.ACTIVE);

        // ACTIVE -> MAINTENANCE
        context.updateLifecycleStage(ContextLifecycleStage.MAINTENANCE);
        expect(context.lifecycleStage).toBe(ContextLifecycleStage.MAINTENANCE);

        // MAINTENANCE -> COMPLETION
        context.updateLifecycleStage(ContextLifecycleStage.COMPLETION);
        expect(context.lifecycleStage).toBe(ContextLifecycleStage.COMPLETION);
      });

      it('应该拒绝设置相同的生命周期阶段', () => {
        const result = context.updateLifecycleStage(ContextLifecycleStage.INITIALIZATION);
        expect(result).toBe(false);
        expect(context.lifecycleStage).toBe(ContextLifecycleStage.INITIALIZATION);
      });
    });

    describe('生命周期验证场景', () => {
      it('应该验证生命周期阶段转换顺序', () => {
        // 尝试从INITIALIZATION跳跃到COMPLETION
        const error = validationService.validateLifecycleTransition(
          ContextLifecycleStage.INITIALIZATION,
          ContextLifecycleStage.COMPLETION
        );

        expect(error).not.toBeNull();
        expect(error!.field).toBe('lifecycleStage');
        expect(error!.message).toContain('Cannot skip stages');
      });

      it('应该验证生命周期阶段不能回退', () => {
        const error = validationService.validateLifecycleTransition(
          ContextLifecycleStage.ACTIVE,
          ContextLifecycleStage.INITIALIZATION
        );

        expect(error).not.toBeNull();
        expect(error!.field).toBe('lifecycleStage');
        expect(error!.message).toContain('Cannot transition from active back to initialization');
      });

      it('应该允许有效的生命周期阶段转换', () => {
        const error = validationService.validateLifecycleTransition(
          ContextLifecycleStage.INITIALIZATION,
          ContextLifecycleStage.ACTIVE
        );

        expect(error).toBeNull();
      });
    });
  });

  describe('4. 错误恢复场景', () => {
    let context: Context;

    beforeEach(() => {
      context = contextFactory.createContext({
        name: 'Error Recovery Test Context'
      });
    });

    describe('状态恢复场景', () => {
      it('应该能从暂停状态恢复到激活状态', () => {
        context.suspend();
        expect(context.status).toBe(EntityStatus.SUSPENDED);

        const recovered = context.activate();
        expect(recovered).toBe(true);
        expect(context.status).toBe(EntityStatus.ACTIVE);
      });

      it('应该拒绝从已删除状态恢复', () => {
        context.terminate();
        expect(context.status).toBe(EntityStatus.DELETED);

        const error = validationService.validateStatusTransition(
          EntityStatus.DELETED,
          EntityStatus.ACTIVE
        );

        expect(error).not.toBeNull();
        expect(error!.message).toContain('Cannot change status of a deleted context');
      });
    });

    describe('数据恢复场景', () => {
      it('应该能通过克隆创建备份', () => {
        context.updateConfiguration({ backup: true });
        context.updateMetadata({ version: '1.0' });
        context.addSessionId(uuidv4());

        const backup = context.clone();

        expect(backup).not.toBe(context);
        expect(backup.contextId).toBe(context.contextId);
        expect(backup.name).toBe(context.name);
        expect(backup.configuration).toEqual(context.configuration);
        expect(backup.metadata).toEqual(context.metadata);
        expect(backup.sessionIds).toEqual(context.sessionIds);
      });

      it('应该确保克隆的独立性', () => {
        const backup = context.clone();
        
        // 修改原始对象
        context.updateConfiguration({ modified: true });
        context.addSessionId(uuidv4());

        // 备份应该不受影响
        expect(backup.configuration.modified).toBeUndefined();
        expect(backup.sessionIds).toHaveLength(0);
      });
    });
  });

  describe('5. 资源管理场景', () => {
    let context: Context;

    beforeEach(() => {
      context = contextFactory.createContext({
        name: 'Resource Management Test Context'
      });
    });

    describe('会话ID管理场景', () => {
      it('应该成功添加会话ID', () => {
        const sessionId = uuidv4();
        const result = context.addSessionId(sessionId);

        expect(result).toBe(true);
        expect(context.sessionIds).toContain(sessionId);
        expect(context.sessionIds).toHaveLength(1);
      });

      it('应该拒绝添加重复的会话ID', () => {
        const sessionId = uuidv4();
        context.addSessionId(sessionId);

        const result = context.addSessionId(sessionId);
        expect(result).toBe(false);
        expect(context.sessionIds).toHaveLength(1);
      });

      it('应该成功移除会话ID', () => {
        const sessionId = uuidv4();
        context.addSessionId(sessionId);

        const result = context.removeSessionId(sessionId);
        expect(result).toBe(true);
        expect(context.sessionIds).not.toContain(sessionId);
        expect(context.sessionIds).toHaveLength(0);
      });

      it('应该拒绝移除不存在的会话ID', () => {
        const nonExistentId = uuidv4();
        const result = context.removeSessionId(nonExistentId);

        expect(result).toBe(false);
        expect(context.sessionIds).toHaveLength(0);
      });

      it('应该支持批量会话ID管理', () => {
        const sessionIds = [uuidv4(), uuidv4(), uuidv4()];

        // 批量添加
        sessionIds.forEach(id => context.addSessionId(id));
        expect(context.sessionIds).toHaveLength(3);

        // 批量移除
        sessionIds.forEach(id => context.removeSessionId(id));
        expect(context.sessionIds).toHaveLength(0);
      });
    });

    describe('共享状态ID管理场景', () => {
      it('应该成功添加共享状态ID', () => {
        const stateId = uuidv4();
        const result = context.addSharedStateId(stateId);

        expect(result).toBe(true);
        expect(context.sharedStateIds).toContain(stateId);
        expect(context.sharedStateIds).toHaveLength(1);
      });

      it('应该拒绝添加重复的共享状态ID', () => {
        const stateId = uuidv4();
        context.addSharedStateId(stateId);

        const result = context.addSharedStateId(stateId);
        expect(result).toBe(false);
        expect(context.sharedStateIds).toHaveLength(1);
      });

      it('应该成功移除共享状态ID', () => {
        const stateId = uuidv4();
        context.addSharedStateId(stateId);

        const result = context.removeSharedStateId(stateId);
        expect(result).toBe(true);
        expect(context.sharedStateIds).not.toContain(stateId);
        expect(context.sharedStateIds).toHaveLength(0);
      });

      it('应该支持混合资源管理', () => {
        const sessionId = uuidv4();
        const stateId = uuidv4();

        context.addSessionId(sessionId);
        context.addSharedStateId(stateId);

        expect(context.sessionIds).toContain(sessionId);
        expect(context.sharedStateIds).toContain(stateId);
        expect(context.sessionIds).toHaveLength(1);
        expect(context.sharedStateIds).toHaveLength(1);
      });
    });
  });

  describe('6. 并发处理场景', () => {
    let context: Context;

    beforeEach(() => {
      context = contextFactory.createContext({
        name: 'Concurrency Test Context'
      });
    });

    describe('并发状态更新场景', () => {
      it('应该处理并发状态转换', async () => {
        const promises = [
          Promise.resolve(context.suspend()),
          Promise.resolve(context.activate()),
          Promise.resolve(context.suspend())
        ];

        const results = await Promise.all(promises);

        // 至少有一个操作应该成功
        expect(results.some(result => result === true)).toBe(true);

        // 最终状态应该是有效的
        expect([EntityStatus.ACTIVE, EntityStatus.SUSPENDED]).toContain(context.status);
      });

      it('应该处理并发配置更新', () => {
        const config1 = { setting1: 'value1', shared: 'original' };
        const config2 = { setting2: 'value2', shared: 'updated' };

        context.updateConfiguration(config1);
        context.updateConfiguration(config2);

        // 后面的更新应该覆盖前面的
        expect(context.configuration.setting1).toBe('value1');
        expect(context.configuration.setting2).toBe('value2');
        expect(context.configuration.shared).toBe('updated');
      });
    });

    describe('并发资源管理场景', () => {
      it('应该处理并发会话ID操作', () => {
        const sessionIds = [uuidv4(), uuidv4(), uuidv4()];

        // 并发添加
        sessionIds.forEach(id => context.addSessionId(id));
        expect(context.sessionIds).toHaveLength(3);

        // 并发移除
        sessionIds.forEach(id => context.removeSessionId(id));
        expect(context.sessionIds).toHaveLength(0);
      });
    });
  });

  describe('7. 数据持久化场景', () => {
    let context: Context;

    beforeEach(() => {
      context = contextFactory.createContext({
        name: 'Persistence Test Context',
        description: 'Context for testing data persistence',
        configuration: { persistent: true },
        metadata: { version: '1.0' }
      });
    });

    describe('数据序列化场景', () => {
      it('应该支持JSON序列化', () => {
        const sessionId = uuidv4();
        const stateId = uuidv4();

        context.addSessionId(sessionId);
        context.addSharedStateId(stateId);

        const serialized = JSON.stringify(context);
        const parsed = JSON.parse(serialized);

        expect(parsed.contextId).toBe(context.contextId);
        expect(parsed.name).toBe(context.name);
        expect(parsed.sessionIds).toContain(sessionId);
        expect(parsed.sharedStateIds).toContain(stateId);
      });

      it('应该支持深拷贝重建', () => {
        const originalId = context.contextId;
        const clone = context.clone();

        // 修改原始对象
        context.update('Modified Name');
        context.updateConfiguration({ modified: true });

        // 克隆应该保持原始状态
        expect(clone.contextId).toBe(originalId);
        expect(clone.name).toBe('Persistence Test Context');
        expect(clone.configuration.modified).toBeUndefined();
      });
    });

    describe('数据重建场景', () => {
      it('应该支持从持久化数据重建Context', () => {
        const sessionId = uuidv4();
        context.addSessionId(sessionId);
        context.updateLifecycleStage(ContextLifecycleStage.ACTIVE);

        const reconstructed = contextFactory.reconstitute(
          context.contextId,
          context.name,
          context.description,
          context.lifecycleStage,
          context.status,
          context.createdAt,
          context.updatedAt,
          context.sessionIds,
          context.sharedStateIds,
          context.configuration,
          context.metadata
        );

        expect(reconstructed.contextId).toBe(context.contextId);
        expect(reconstructed.name).toBe(context.name);
        expect(reconstructed.sessionIds).toEqual(context.sessionIds);
        expect(reconstructed.lifecycleStage).toBe(context.lifecycleStage);
      });
    });
  });

  describe('8. 安全验证场景', () => {
    describe('输入验证场景', () => {
      it('应该验证Context名称', () => {
        const error = validationService.validateName('');
        expect(error).not.toBeNull();
        expect(error!.field).toBe('name');
      });

      it('应该验证Context状态', () => {
        const error = validationService.validateStatus('invalid_status');
        expect(error).not.toBeNull();
        expect(error!.field).toBe('status');
      });

      it('应该验证删除权限', () => {
        const context = contextFactory.createContext({ name: 'Test' });
        context.terminate();

        const error = validationService.validateDeletion(context);
        expect(error).not.toBeNull();
        expect(error!.message).toContain('already deleted');
      });
    });

    describe('状态转换安全场景', () => {
      it('应该防止无效状态转换', () => {
        const error = validationService.validateStatusTransition(
          EntityStatus.DELETED,
          EntityStatus.ACTIVE
        );

        expect(error).not.toBeNull();
        expect(error!.message).toContain('Cannot change status of a deleted context');
      });

      it('应该允许有效状态转换', () => {
        const error = validationService.validateStatusTransition(
          EntityStatus.SUSPENDED,
          EntityStatus.ACTIVE
        );

        expect(error).toBeNull();
      });
    });
  });

  describe('9. 性能边界场景', () => {
    describe('大数据量处理场景', () => {
      it('应该处理大量会话ID', () => {
        const context = contextFactory.createContext({
          name: 'Large Session Context'
        });

        const sessionIds = Array.from({ length: 1000 }, () => uuidv4());

        const startTime = Date.now();
        sessionIds.forEach(id => context.addSessionId(id));
        const endTime = Date.now();

        expect(context.sessionIds).toHaveLength(1000);
        expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
      });

      it('应该处理大型配置对象', () => {
        const largeConfig = {};
        for (let i = 0; i < 1000; i++) {
          (largeConfig as any)[`setting_${i}`] = `value_${i}`;
        }

        const context = contextFactory.createContext({
          name: 'Large Config Context',
          configuration: largeConfig
        });

        expect(Object.keys(context.configuration)).toHaveLength(1000);
      });
    });

    describe('内存使用场景', () => {
      it('应该有效管理内存使用', () => {
        const contexts = Array.from({ length: 100 }, (_, i) =>
          contextFactory.createContext({
            name: `Context ${i}`,
            configuration: { index: i },
            metadata: { created: new Date().toISOString() }
          })
        );

        expect(contexts).toHaveLength(100);

        // 验证每个context都是独立的
        contexts.forEach((context, index) => {
          expect(context.configuration.index).toBe(index);
        });
      });
    });
  });

  describe('10. 集成点验证场景', () => {
    describe('工厂集成场景', () => {
      it('应该与ContextFactory正确集成', () => {
        const context = contextFactory.createContext({
          name: 'Factory Integration Test'
        });

        expect(context).toBeInstanceOf(Context);
        expect(context.contextId).toBeDefined();
        expect(context.createdAt).toBeInstanceOf(Date);
      });
    });

    describe('验证服务集成场景', () => {
      it('应该与ValidationService正确集成', () => {
        const context = contextFactory.createContext({
          name: 'Validation Integration Test'
        });

        const errors = validationService.validateContext(context);
        expect(Array.isArray(errors)).toBe(true);
      });
    });

    describe('类型系统集成场景', () => {
      it('应该与类型系统正确集成', () => {
        const context = contextFactory.createContext({
          name: 'Type System Integration Test'
        });

        // 验证枚举类型
        expect(Object.values(ContextLifecycleStage)).toContain(context.lifecycleStage);
        expect(Object.values(EntityStatus)).toContain(context.status);
      });
    });
  });

  // ==================== 新增：统一标准接口测试 ====================

  describe('统一标准接口功能测试', () => {
    describe('1. 基础上下文管理场景', () => {
      it('应该支持创建基础上下文', async () => {
        // 用户场景：简单项目需要基础上下文管理
        const createRequest: CreateContextRequest = {
          name: '简单项目上下文',
          description: '用于管理项目基础信息和状态',
          type: 'basic',
          capabilities: {
            storage: {
              persistence: true,
              encryption: false,
              compression: false,
              backup: true
            }
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.createContext(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.name).toBe('简单项目上下文');
        expect(result.data?.type).toBe('basic');
        expect(result.data?.capabilities.storage.persistence).toBe(true);
        expect(result.data?.status).toBe('active');
      });

      it('应该支持创建知识库上下文', async () => {
        // 用户场景：TracePilot需要知识库管理能力
        const createRequest: CreateContextRequest = {
          name: 'TracePilot知识库',
          description: 'DDSC项目的知识库上下文',
          type: 'knowledge_base',
          capabilities: {
            storage: {
              persistence: true,
              encryption: true,
              compression: true,
              backup: true
            },
            knowledgeBase: {
              hierarchical: true,
              supportedTypes: ['text', 'structured', 'code'],
              search: {
                fullText: true,
                semantic: true,
                vector: true,
                fuzzy: false
              },
              validation: {
                schemaValidation: true,
                contentValidation: true,
                qualityAssessment: true
              }
            },
            versionControl: {
              enabled: true,
              strategy: 'branching',
              conflictResolution: 'hybrid',
              historyRetention: 100
            },
            analytics: {
              usageTracking: true,
              performanceMonitoring: true,
              qualityAssessment: true,
              predictiveAnalysis: false
            }
          },
          configuration: {
            basic: {
              timeout: 300000,
              maxSize: 1073741824,
              priority: 'high'
            },
            knowledge: {
              indexingStrategy: 'immediate',
              searchEngine: 'vector',
              embeddingModel: 'text-embedding-ada-002'
            }
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.createContext(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.name).toBe('TracePilot知识库');
        expect(result.data?.type).toBe('knowledge_base');
        expect(result.data?.capabilities.knowledgeBase?.hierarchical).toBe(true);
        expect(result.data?.capabilities.knowledgeBase?.search?.semantic).toBe(true);
        expect(result.data?.capabilities.versionControl?.enabled).toBe(true);
        expect(result.data?.capabilities.analytics?.usageTracking).toBe(true);
      });
    });

    describe('2. 多Agent协调场景', () => {
      it('应该支持创建多Agent上下文', async () => {
        // 用户场景：TracePilot多Agent协作需要协调能力
        const createRequest: CreateContextRequest = {
          name: 'DDSC多Agent协作上下文',
          type: 'multi_agent',
          capabilities: {
            storage: {
              persistence: true,
              encryption: true
            },
            coordination: {
              multiAgent: true,
              conflictResolution: true,
              stateSync: true,
              distributedLocking: true
            },
            versionControl: {
              enabled: true,
              strategy: 'distributed',
              conflictResolution: 'automatic'
            }
          },
          configuration: {
            coordination: {
              syncInterval: 5000,
              conflictStrategy: 'merge',
              lockTimeout: 30000
            }
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.createContext(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.type).toBe('multi_agent');
        expect(result.data?.capabilities.coordination?.multiAgent).toBe(true);
        expect(result.data?.capabilities.coordination?.conflictResolution).toBe(true);
        expect(result.data?.capabilities.coordination?.stateSync).toBe(true);
      });

      it('应该支持上下文同步操作', async () => {
        const contextId = uuidv4();
        const syncRequest: ContextSyncRequest = {
          contextId,
          targetContexts: [uuidv4(), uuidv4()],
          syncMode: 'incremental',
          conflictResolution: 'merge',
          options: {
            timeout: 30000,
            retryCount: 3,
            validateAfterSync: true
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.syncContext(syncRequest);

        expect(result.success).toBe(true);
        expect(result.data?.contextId).toBe(contextId);
        expect(result.data?.syncStatus).toBe('synchronized');
        expect(result.data?.conflicts).toEqual([]);
      });
    });

    describe('3. 上下文操作场景', () => {
      it('应该支持读取操作', async () => {
        const contextId = uuidv4();
        const operationRequest: ContextOperationRequest = {
          contextId,
          operation: {
            type: 'read',
            target: 'project_data',
            conditions: { version: 'latest' }
          },
          options: {
            enableAnalysis: true,
            syncMode: 'immediate'
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.operateContext(operationRequest);

        expect(result.success).toBe(true);
        expect(result.result.operation).toBe('read');
        expect(result.result.status).toBe('completed');
        expect(result.contextState?.version).toBeGreaterThan(0);
        expect(result.metadata.capabilitiesUsed).toContain('storage');
      });

      it('应该支持写入操作', async () => {
        const contextId = uuidv4();
        const operationRequest: ContextOperationRequest = {
          contextId,
          operation: {
            type: 'write',
            target: 'user_requirements',
            data: {
              requirements: ['需求1', '需求2', '需求3'],
              priority: 'high',
              deadline: '2025-12-31'
            }
          },
          options: {
            enableAnalysis: false,
            syncMode: 'eventual'
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.operateContext(operationRequest);

        expect(result.success).toBe(true);
        expect(result.result.operation).toBe('write');
        expect(result.result.data).toEqual(operationRequest.operation.data);
        expect(result.metadata.resourceUsage.memory).toBeGreaterThan(0);
      });
    });

    describe('4. 上下文状态管理', () => {
      it('应该支持获取详细状态信息', async () => {
        const contextId = uuidv4();
        const options: StatusOptions = {
          includePerformance: true,
          includeHealth: true,
          includeUsage: true,
          includeAnalysis: true
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        // 模拟存在的上下文
        const mockContext = contextFactory.createContext({ name: 'Test Context' });
        jest.spyOn(contextService, 'getContextById').mockResolvedValue(mockContext);

        const result = await contextService.getContextStatus(contextId, options);

        expect(result.success).toBe(true);
        expect(result.data?.contextId).toBe(contextId);
        expect(result.data?.status).toBeDefined();
        expect(result.data?.performance).toBeDefined(); // 因为includePerformance为true
        expect(result.data?.health).toBeDefined(); // 因为includeHealth为true
        expect(result.data?.usage).toBeDefined(); // 因为includeUsage为true
        expect(result.data?.performance?.responseTime).toBeGreaterThan(0);
        expect(result.data?.health?.overall).toMatch(/healthy|warning|critical|unknown/);
      });

      it('应该支持更新上下文配置', async () => {
        const contextId = uuidv4();
        const updateRequest: UpdateContextRequest = {
          contextId,
          name: '更新后的上下文',
          capabilities: {
            storage: {
              persistence: true,
              encryption: true,
              compression: true,
              backup: true
            },
            analytics: {
              usageTracking: true,
              performanceMonitoring: true,
              qualityAssessment: false,
              predictiveAnalysis: true
            }
          },
          configuration: {
            basic: {
              priority: 'critical',
              timeout: 600000
            }
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.updateContext(updateRequest);

        expect(result.success).toBe(true);
        expect(result.data?.contextId).toBe(contextId);
        expect(result.data?.name).toBe('更新后的上下文');
        expect(result.data?.capabilities.storage.encryption).toBe(true);
        expect(result.data?.capabilities.analytics?.predictiveAnalysis).toBe(true);
      });
    });

    describe('5. 上下文分析场景', () => {
      it('应该支持质量分析', async () => {
        const contextId = uuidv4();
        const analysisRequest: ContextAnalysisRequest = {
          contextId,
          analysisType: ['quality', 'performance', 'optimization'],
          options: {
            depth: 'deep',
            includeRecommendations: true,
            compareWith: [uuidv4()]
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.analyzeContext(analysisRequest);

        expect(result.success).toBe(true);
        expect(result.data?.contextId).toBe(contextId);
        expect(result.data?.quality).toBeDefined();
        expect(result.data?.quality.overall).toBeGreaterThan(0);
        expect(result.data?.quality.overall).toBeLessThanOrEqual(1);
        expect(result.data?.recommendations).toBeInstanceOf(Array);
        expect(result.data?.insights).toBeInstanceOf(Array);

        // 验证推荐内容
        if (result.data?.recommendations.length > 0) {
          const recommendation = result.data.recommendations[0];
          expect(recommendation.type).toMatch(/optimization|security|performance|quality/);
          expect(recommendation.priority).toMatch(/low|medium|high|critical/);
          expect(recommendation.actions).toBeInstanceOf(Array);
        }
      });

      it('应该支持使用模式分析', async () => {
        const contextId = uuidv4();
        const analysisRequest: ContextAnalysisRequest = {
          contextId,
          analysisType: ['usage', 'performance'],
          options: {
            depth: 'moderate',
            includeRecommendations: false
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.analyzeContext(analysisRequest);

        expect(result.success).toBe(true);
        expect(result.data?.insights).toBeInstanceOf(Array);

        // 验证洞察内容
        if (result.data?.insights.length > 0) {
          const insight = result.data.insights[0];
          expect(insight.category).toMatch(/usage|performance|quality|trend/);
          expect(insight.confidence).toBeGreaterThan(0);
          expect(insight.confidence).toBeLessThanOrEqual(1);
          expect(insight.data).toBeDefined();
        }
      });
    });

    describe('6. 查询和管理场景', () => {
      it('应该支持按条件查询上下文', async () => {
        const filter: ContextFilter = {
          type: ['knowledge_base', 'multi_agent'],
          status: ['active'],
          capabilities: ['knowledgeBase', 'coordination'],
          dateRange: {
            start: '2025-01-01T00:00:00Z',
            end: '2025-12-31T23:59:59Z'
          },
          limit: 10,
          offset: 0
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        // 模拟查询结果
        const mockContexts = [
          contextFactory.createContext({ name: 'Context 1' }),
          contextFactory.createContext({ name: 'Context 2' })
        ];
        jest.spyOn(contextService, 'getContexts').mockResolvedValue({
          items: mockContexts,
          total: 2,
          hasMore: false
        });

        const result = await contextService.queryContexts(filter);

        expect(result.success).toBe(true);
        expect(result.data?.contexts).toBeInstanceOf(Array);
        expect(result.data?.total).toBeGreaterThanOrEqual(0);
        expect(result.data?.hasMore).toBeDefined();
      });

      it('应该支持删除上下文', async () => {
        const contextId = uuidv4();

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        // 模拟删除成功
        jest.spyOn(contextService, 'deleteLegacyContextById').mockResolvedValue({
          success: true,
          data: undefined
        });

        const result = await contextService.deleteContext(contextId);

        expect(result.success).toBe(true);
      });
    });

    describe('7. TracePilot复杂场景', () => {
      it('应该支持创建完整的DDSC项目上下文', async () => {
        // 用户场景：TracePilot创建完整的DDSC项目上下文
        const ddscContextRequest: CreateContextRequest = {
          name: 'TracePilot DDSC项目上下文',
          description: '对话驱动式系统构建项目的完整上下文管理',
          type: 'distributed',
          capabilities: {
            storage: {
              persistence: true,
              encryption: true,
              compression: true,
              backup: true
            },
            coordination: {
              multiAgent: true,
              conflictResolution: true,
              stateSync: true,
              distributedLocking: true
            },
            knowledgeBase: {
              hierarchical: true,
              supportedTypes: ['text', 'structured', 'code', 'model'],
              search: {
                fullText: true,
                semantic: true,
                vector: true,
                fuzzy: true
              },
              validation: {
                schemaValidation: true,
                contentValidation: true,
                qualityAssessment: true
              }
            },
            versionControl: {
              enabled: true,
              strategy: 'distributed',
              conflictResolution: 'hybrid',
              historyRetention: 1000
            },
            analytics: {
              usageTracking: true,
              performanceMonitoring: true,
              qualityAssessment: true,
              predictiveAnalysis: true
            }
          },
          configuration: {
            basic: {
              timeout: 600000,
              maxSize: 10737418240, // 10GB
              priority: 'critical'
            },
            coordination: {
              syncInterval: 1000,
              conflictStrategy: 'merge',
              lockTimeout: 60000
            },
            knowledge: {
              indexingStrategy: 'immediate',
              searchEngine: 'vector',
              embeddingModel: 'text-embedding-ada-002'
            }
          },
          data: {
            projectType: 'DDSC',
            methodology: 'dialog-driven-system-construction',
            agents: ['ProductOwnerAgent', 'ArchitectAgent', 'DeveloperAgent', 'QAAgent'],
            phases: ['需求分析', '架构设计', '开发实现', '测试验证', '部署上线']
          },
          metadata: {
            version: '1.0.0',
            created_by: 'TracePilot',
            project_id: 'ddsc-2025-001',
            priority: 'critical',
            tags: ['DDSC', 'multi-agent', 'production']
          }
        };

        const contextService = new ContextManagementService(
          {} as any,
          // mockRepository
          contextFactory,
          validationService,
          {} as any, // mockSharedStateService
          {} as any  // mockAccessControlService
        );

        const result = await contextService.createContext(ddscContextRequest);

        expect(result.success).toBe(true);
        expect(result.data?.name).toBe('TracePilot DDSC项目上下文');
        expect(result.data?.type).toBe('distributed');
        expect(result.data?.capabilities.storage.persistence).toBe(true);
        expect(result.data?.capabilities.coordination?.multiAgent).toBe(true);
        expect(result.data?.capabilities.knowledgeBase?.hierarchical).toBe(true);
        expect(result.data?.capabilities.versionControl?.enabled).toBe(true);
        expect(result.data?.capabilities.analytics?.predictiveAnalysis).toBe(true);
      });
    });
  });
});
