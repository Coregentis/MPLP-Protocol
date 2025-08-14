/**
 * ExtensionEntity真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 
 * @version 1.0.0
 * @created 2025-08-11
 */

import { Extension } from '../../../src/modules/extension/domain/entities/extension.entity';
import {
  ExtensionType,
  ExtensionStatus,
  ExtensionCompatibility,
  ExtensionConfiguration,
  ExtensionPoint,
  ApiExtension,
  EventSubscription,
  ExtensionLifecycle,
  ExtensionSecurity,
  ExtensionMetadata,
} from '../../../src/modules/extension/types';
import { ExtensionProtocolSchema } from '../../../src/modules/extension/api/mappers/extension.mapper';
import { v4 as uuidv4 } from 'uuid';

describe('ExtensionEntity真实实现单元测试', () => {
  
  // 辅助函数：创建有效的Extension实例
  const createValidExtension = (overrides: {
    extensionId?: string;
    contextId?: string;
    protocolVersion?: string;
    name?: string;
    version?: string;
    type?: ExtensionType;
    status?: ExtensionStatus;
    timestamp?: string;
    createdAt?: string;
    updatedAt?: string;
    displayName?: string;
    description?: string;
    compatibility?: ExtensionCompatibility;
    configuration?: ExtensionConfiguration;
    extensionPoints?: ExtensionPoint[];
    apiExtensions?: ApiExtension[];
    eventSubscriptions?: EventSubscription[];
    lifecycle?: ExtensionLifecycle;
    security?: ExtensionSecurity;
    metadata?: ExtensionMetadata;
  } = {}): Extension => {
    const now = new Date().toISOString();
    
    const schemaData: ExtensionProtocolSchema = {
      protocol_version: overrides.protocolVersion || '1.0.1',
      timestamp: overrides.timestamp || now,
      extension_id: overrides.extensionId || uuidv4(),
      context_id: overrides.contextId || uuidv4(),
      name: overrides.name || 'test-extension',
      display_name: overrides.displayName || 'Test Extension',
      description: overrides.description || 'Test extension description',
      version: overrides.version || '1.0.0',
      extension_type: overrides.type || 'plugin',
      status: overrides.status || 'installed',
      compatibility: overrides.compatibility || {
        mplp_version: '1.0.0',
        required_modules: [],
        dependencies: [],
        conflicts: [],
      },
      configuration: overrides.configuration || {
        schema: {},
        current_config: {},
      },
      extension_points: overrides.extensionPoints || [],
      api_extensions: overrides.apiExtensions || [],
      event_subscriptions: overrides.eventSubscriptions || [],
      lifecycle: overrides.lifecycle || {
        install_date: now,
        activation_count: 0,
        error_count: 0,
        auto_start: false,
        load_priority: 0,
      },
      security: overrides.security || {
        sandbox_enabled: true,
        resource_limits: {},
        permissions: [],
      },
      metadata: overrides.metadata || {
        author: 'Test Author',
        license: 'MIT',
        homepage: 'https://test.com',
        repository: 'https://github.com/test/test',
        keywords: ['test'],
        category: 'utility',
      },
    };

    return Extension.fromSchema(schemaData);
  };

  describe('构造函数和基本属性', () => {
    it('应该正确创建Extension实例', () => {
      const extension = createValidExtension();

      expect(extension).toBeInstanceOf(Extension);
      expect(extension.name).toBe('test-extension');
      expect(extension.version).toBe('1.0.0');
      expect(extension.type).toBe('plugin');
      expect(extension.status).toBe('installed');
    });

    it('应该正确设置所有必需属性', () => {
      const extensionId = uuidv4();
      const contextId = uuidv4();
      const extension = createValidExtension({
        extensionId,
        contextId,
        name: 'custom-extension',
        version: '2.0.0',
        type: 'adapter',
        status: 'active',
      });

      expect(extension.extensionId).toBe(extensionId);
      expect(extension.contextId).toBe(contextId);
      expect(extension.name).toBe('custom-extension');
      expect(extension.version).toBe('2.0.0');
      expect(extension.type).toBe('adapter');
      expect(extension.status).toBe('active');
    });

    it('应该正确设置可选属性', () => {
      const extension = createValidExtension({
        displayName: 'Custom Display Name',
        description: 'Custom description',
      });

      expect(extension.displayName).toBe('Custom Display Name');
      expect(extension.description).toBe('Custom description');
    });
  });

  describe('状态转换方法', () => {
    describe('activate()', () => {
      it('应该能够激活已安装的扩展', () => {
        const extension = createValidExtension({ status: 'installed' });
        
        extension.activate();
        
        expect(extension.status).toBe('active');
      });

      it('应该能够激活非活跃的扩展', () => {
        const extension = createValidExtension({ status: 'inactive' });
        
        extension.activate();
        
        expect(extension.status).toBe('active');
      });

      it('应该在激活时更新updatedAt时间戳', () => {
        const extension = createValidExtension({ status: 'installed' });
        const originalUpdatedAt = extension.updatedAt;
        
        // 等待一毫秒确保时间戳不同
        setTimeout(() => {
          extension.activate();
          expect(extension.updatedAt).not.toBe(originalUpdatedAt);
        }, 1);
      });

      it('应该拒绝激活已激活的扩展', () => {
        const extension = createValidExtension({ status: 'active' });
        
        expect(() => extension.activate()).toThrow('无法激活状态为 active 的扩展');
      });

      it('应该拒绝激活错误状态的扩展', () => {
        const extension = createValidExtension({ status: 'error' });
        
        expect(() => extension.activate()).toThrow('无法激活状态为 error 的扩展');
      });
    });

    describe('deactivate()', () => {
      it('应该能够停用已激活的扩展', () => {
        const extension = createValidExtension({ status: 'active' });
        
        extension.deactivate();
        
        expect(extension.status).toBe('inactive');
      });

      it('应该在停用时更新updatedAt时间戳', () => {
        const extension = createValidExtension({ status: 'active' });
        const originalUpdatedAt = extension.updatedAt;
        
        setTimeout(() => {
          extension.deactivate();
          expect(extension.updatedAt).not.toBe(originalUpdatedAt);
        }, 1);
      });

      it('应该拒绝停用非激活状态的扩展', () => {
        const extension = createValidExtension({ status: 'installed' });
        
        expect(() => extension.deactivate()).toThrow('无法停用状态为 installed 的扩展');
      });
    });
  });

  describe('状态检查方法', () => {
    describe('isActive()', () => {
      it('应该对激活状态返回true', () => {
        const extension = createValidExtension({ status: 'active' });
        
        expect(extension.isActive()).toBe(true);
      });

      it('应该对非激活状态返回false', () => {
        const extension = createValidExtension({ status: 'installed' });
        
        expect(extension.isActive()).toBe(false);
      });
    });

    describe('canUninstall()', () => {
      it('应该允许卸载已安装状态的扩展', () => {
        const extension = createValidExtension({ status: 'installed' });
        
        expect(extension.canUninstall()).toBe(true);
      });

      it('应该允许卸载非活跃状态的扩展', () => {
        const extension = createValidExtension({ status: 'inactive' });
        
        expect(extension.canUninstall()).toBe(true);
      });

      it('应该允许卸载禁用状态的扩展', () => {
        const extension = createValidExtension({ status: 'disabled' });
        
        expect(extension.canUninstall()).toBe(true);
      });

      it('应该允许卸载错误状态的扩展', () => {
        const extension = createValidExtension({ status: 'error' });
        
        expect(extension.canUninstall()).toBe(true);
      });

      it('应该拒绝卸载激活状态的扩展', () => {
        const extension = createValidExtension({ status: 'active' });
        
        expect(extension.canUninstall()).toBe(false);
      });
    });
  });

  describe('扩展点管理', () => {
    describe('addExtensionPoint()', () => {
      it('应该能够添加新的扩展点', () => {
        const extension = createValidExtension();
        const extensionPoint: ExtensionPoint = {
          name: 'test-point',
          type: 'hook',
          description: 'Test extension point',
          interface_definition: {},
        };

        extension.addExtensionPoint(extensionPoint);

        expect(extension.extensionPoints).toHaveLength(1);
        expect(extension.extensionPoints[0]).toEqual(extensionPoint);
      });

      it('应该防止添加重复的扩展点', () => {
        const extension = createValidExtension();
        const extensionPoint: ExtensionPoint = {
          name: 'test-point',
          type: 'hook',
          description: 'Test extension point',
          interface_definition: {},
        };

        extension.addExtensionPoint(extensionPoint);
        extension.addExtensionPoint(extensionPoint);

        expect(extension.extensionPoints).toHaveLength(1);
      });

      it('应该在添加扩展点时更新updatedAt时间戳', () => {
        const extension = createValidExtension();
        const originalUpdatedAt = extension.updatedAt;
        const extensionPoint: ExtensionPoint = {
          name: 'test-point',
          type: 'hook',
          description: 'Test extension point',
          interface_definition: {},
        };

        setTimeout(() => {
          extension.addExtensionPoint(extensionPoint);
          expect(extension.updatedAt).not.toBe(originalUpdatedAt);
        }, 1);
      });
    });

    describe('removeExtensionPoint()', () => {
      it('应该能够移除存在的扩展点', () => {
        const extension = createValidExtension();
        const extensionPoint: ExtensionPoint = {
          name: 'test-point',
          type: 'hook',
          description: 'Test extension point',
          interface_definition: {},
        };

        extension.addExtensionPoint(extensionPoint);
        extension.removeExtensionPoint('test-point');

        expect(extension.extensionPoints).toHaveLength(0);
      });

      it('应该在移除扩展点时更新updatedAt时间戳', () => {
        const extension = createValidExtension();
        const extensionPoint: ExtensionPoint = {
          name: 'test-point',
          type: 'hook',
          description: 'Test extension point',
          interface_definition: {},
        };

        extension.addExtensionPoint(extensionPoint);
        const originalUpdatedAt = extension.updatedAt;

        setTimeout(() => {
          extension.removeExtensionPoint('test-point');
          expect(extension.updatedAt).not.toBe(originalUpdatedAt);
        }, 1);
      });

      it('应该忽略移除不存在的扩展点', () => {
        const extension = createValidExtension();
        const originalUpdatedAt = extension.updatedAt;

        extension.removeExtensionPoint('non-existent');

        expect(extension.extensionPoints).toHaveLength(0);
        expect(extension.updatedAt).toBe(originalUpdatedAt);
      });
    });
  });

  describe('API扩展管理', () => {
    describe('addApiExtension()', () => {
      it('应该能够添加新的API扩展', () => {
        const extension = createValidExtension();
        const apiExtension: ApiExtension = {
          endpoint_id: 'test-endpoint',
          path: '/api/test',
          method: 'GET',
          handler: 'testHandler',
          middleware: [],
          authentication_required: false,
        };

        extension.addApiExtension(apiExtension);

        expect(extension.apiExtensions).toHaveLength(1);
        expect(extension.apiExtensions[0]).toEqual(apiExtension);
      });

      it('应该防止添加重复的API扩展', () => {
        const extension = createValidExtension();
        const apiExtension: ApiExtension = {
          endpoint_id: 'test-endpoint',
          path: '/api/test',
          method: 'GET',
          handler: 'testHandler',
          middleware: [],
          authentication_required: false,
        };

        extension.addApiExtension(apiExtension);
        extension.addApiExtension(apiExtension);

        expect(extension.apiExtensions).toHaveLength(1);
      });

      it('应该在添加API扩展时更新updatedAt时间戳', () => {
        const extension = createValidExtension();
        const originalUpdatedAt = extension.updatedAt;
        const apiExtension: ApiExtension = {
          endpoint_id: 'test-endpoint',
          path: '/api/test',
          method: 'GET',
          handler: 'testHandler',
          middleware: [],
          authentication_required: false,
        };

        setTimeout(() => {
          extension.addApiExtension(apiExtension);
          expect(extension.updatedAt).not.toBe(originalUpdatedAt);
        }, 1);
      });
    });
  });

  describe('事件订阅管理', () => {
    describe('addEventSubscription()', () => {
      it('应该能够添加新的事件订阅', () => {
        const extension = createValidExtension();
        const eventSubscription: EventSubscription = {
          event_pattern: 'test.event.*',
          handler: 'testEventHandler',
          priority: 1,
          filter_conditions: {},
        };

        extension.addEventSubscription(eventSubscription);

        expect(extension.eventSubscriptions).toHaveLength(1);
        expect(extension.eventSubscriptions[0]).toEqual(eventSubscription);
      });

      it('应该防止添加重复的事件订阅', () => {
        const extension = createValidExtension();
        const eventSubscription: EventSubscription = {
          event_pattern: 'test.event.*',
          handler: 'testEventHandler',
          priority: 1,
          filter_conditions: {},
        };

        extension.addEventSubscription(eventSubscription);
        extension.addEventSubscription(eventSubscription);

        expect(extension.eventSubscriptions).toHaveLength(1);
      });

      it('应该在添加事件订阅时更新updatedAt时间戳', () => {
        const extension = createValidExtension();
        const originalUpdatedAt = extension.updatedAt;
        const eventSubscription: EventSubscription = {
          event_pattern: 'test.event.*',
          handler: 'testEventHandler',
          priority: 1,
          filter_conditions: {},
        };

        setTimeout(() => {
          extension.addEventSubscription(eventSubscription);
          expect(extension.updatedAt).not.toBe(originalUpdatedAt);
        }, 1);
      });
    });
  });

  describe('版本兼容性检查', () => {
    describe('isCompatibleWith()', () => {
      it('应该对兼容版本返回true', () => {
        const extension = createValidExtension({
          compatibility: {
            mplp_version: '1.0.0',
            required_modules: [],
            dependencies: [],
            conflicts: [],
          },
        });

        expect(extension.isCompatibleWith('1.0.0')).toBe(true);
      });

      it('应该对没有兼容性信息的扩展返回true', () => {
        const extension = createValidExtension({
          compatibility: undefined,
        });

        expect(extension.isCompatibleWith('1.0.0')).toBe(true);
      });
    });
  });

  describe('Schema转换', () => {
    describe('toSchema()', () => {
      it('应该正确转换为Schema格式', () => {
        const extension = createValidExtension({
          name: 'test-extension',
          version: '1.0.0',
          type: 'plugin',
          status: 'installed',
        });

        const schema = extension.toSchema();

        expect(schema.name).toBe('test-extension');
        expect(schema.version).toBe('1.0.0');
        expect(schema.extension_type).toBe('plugin');
        expect(schema.status).toBe('installed');
        expect(schema.protocol_version).toBe('1.0.1');
      });

      it('应该包含所有必需的Schema字段', () => {
        const extension = createValidExtension();
        const schema = extension.toSchema();

        expect(schema).toHaveProperty('protocol_version');
        expect(schema).toHaveProperty('timestamp');
        expect(schema).toHaveProperty('extension_id');
        expect(schema).toHaveProperty('context_id');
        expect(schema).toHaveProperty('name');
        expect(schema).toHaveProperty('version');
        expect(schema).toHaveProperty('extension_type');
        expect(schema).toHaveProperty('status');
        expect(schema).toHaveProperty('compatibility');
        expect(schema).toHaveProperty('configuration');
        expect(schema).toHaveProperty('extension_points');
        expect(schema).toHaveProperty('api_extensions');
        expect(schema).toHaveProperty('event_subscriptions');
        expect(schema).toHaveProperty('lifecycle');
        expect(schema).toHaveProperty('security');
        expect(schema).toHaveProperty('metadata');
      });
    });

    describe('fromSchema()', () => {
      it('应该正确从Schema创建Extension实例', () => {
        const schemaData: ExtensionProtocolSchema = {
          protocol_version: '1.0.1',
          timestamp: new Date().toISOString(),
          extension_id: uuidv4(),
          context_id: uuidv4(),
          name: 'schema-test-extension',
          version: '2.0.0',
          extension_type: 'adapter',
          status: 'active',
          compatibility: {
            mplp_version: '1.0.0',
            required_modules: [],
            dependencies: [],
            conflicts: [],
          },
          configuration: {
            schema: {},
            current_config: {},
          },
          extension_points: [],
          api_extensions: [],
          event_subscriptions: [],
          lifecycle: {
            install_date: new Date().toISOString(),
            activation_count: 0,
            error_count: 0,
            auto_start: false,
            load_priority: 0,
          },
          security: {
            sandbox_enabled: true,
            resource_limits: {},
            permissions: [],
          },
          metadata: {
            author: 'Schema Author',
            license: 'MIT',
            homepage: 'https://schema.com',
            repository: 'https://github.com/schema/schema',
            keywords: ['schema'],
            category: 'utility',
          },
        };

        const extension = Extension.fromSchema(schemaData);

        expect(extension.name).toBe('schema-test-extension');
        expect(extension.version).toBe('2.0.0');
        expect(extension.type).toBe('adapter');
        expect(extension.status).toBe('active');
        expect(extension.extensionId).toBe(schemaData.extension_id);
        expect(extension.contextId).toBe(schemaData.context_id);
      });
    });
  });

  describe('数据完整性和不变性', () => {
    it('应该返回扩展点的副本而不是原始数组', () => {
      const extension = createValidExtension();
      const extensionPoint: ExtensionPoint = {
        name: 'test-point',
        type: 'hook',
        description: 'Test extension point',
        interface_definition: {},
      };

      extension.addExtensionPoint(extensionPoint);
      const points = extension.extensionPoints;
      points.push({
        name: 'malicious-point',
        type: 'hook',
        description: 'Malicious point',
        interface_definition: {},
      });

      expect(extension.extensionPoints).toHaveLength(1);
    });

    it('应该返回API扩展的副本而不是原始数组', () => {
      const extension = createValidExtension();
      const apiExtension: ApiExtension = {
        endpoint_id: 'test-endpoint',
        path: '/api/test',
        method: 'GET',
        handler: 'testHandler',
        middleware: [],
        authentication_required: false,
      };

      extension.addApiExtension(apiExtension);
      const extensions = extension.apiExtensions;
      extensions.push({
        endpoint_id: 'malicious-endpoint',
        path: '/api/malicious',
        method: 'POST',
        handler: 'maliciousHandler',
        middleware: [],
        authentication_required: false,
      });

      expect(extension.apiExtensions).toHaveLength(1);
    });

    it('应该返回事件订阅的副本而不是原始数组', () => {
      const extension = createValidExtension();
      const eventSubscription: EventSubscription = {
        event_pattern: 'test.event.*',
        handler: 'testEventHandler',
        priority: 1,
        filter_conditions: {},
      };

      extension.addEventSubscription(eventSubscription);
      const subscriptions = extension.eventSubscriptions;
      subscriptions.push({
        event_pattern: 'malicious.event.*',
        handler: 'maliciousHandler',
        priority: 1,
        filter_conditions: {},
      });

      expect(extension.eventSubscriptions).toHaveLength(1);
    });
  });
});
