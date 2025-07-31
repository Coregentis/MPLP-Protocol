/**
 * Extension实体单元测试
 * 
 * 基于Schema驱动测试原则，测试Extension实体的所有领域行为
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T19:00:00+08:00
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
  ExtensionPointType,
  TargetModule,
  HttpMethod,
  EventSource,
  DeliveryGuarantee
} from '../../../src/modules/extension/types';
import { UUID, Timestamp, Version } from '../../../src/public/shared/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('Extension Entity', () => {
  // 辅助函数：创建有效的ExtensionCompatibility
  const createValidCompatibility = (): ExtensionCompatibility => ({
    mplp_version: '1.0.0'
  });

  // 辅助函数：创建有效的ExtensionConfiguration
  const createValidConfiguration = (): ExtensionConfiguration => ({
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        debug: { type: 'boolean' },
        timeout: { type: 'number' }
      }
    },
    current_config: {
      enabled: true,
      debug: false,
      timeout: 5000
    },
    default_config: {
      enabled: true,
      debug: false,
      timeout: 3000
    }
  });

  // 辅助函数：创建有效的ExtensionPoint
  const createValidExtensionPoint = (): ExtensionPoint => ({
    point_id: TestDataFactory.Base.generateUUID(),
    name: 'test_hook',
    type: 'hook' as ExtensionPointType,
    target_module: 'context' as TargetModule,
    event_name: 'before_context_create',
    execution_order: 10,
    enabled: true,
    handler: {
      function_name: 'handleBeforeContextCreate',
      timeout_ms: 5000
    },
    conditions: {
      when: 'context.type === "project"',
      required_permissions: ['read:context'],
      context_filters: { type: 'project' }
    }
  });

  // 辅助函数：创建有效的ApiExtension
  const createValidApiExtension = (): ApiExtension => ({
    endpoint_id: TestDataFactory.Base.generateUUID(),
    path: '/api/v1/custom',
    method: 'GET' as HttpMethod,
    description: 'Custom API endpoint',
    handler: 'customHandler',
    middleware: ['auth', 'validation'],
    authentication_required: true,
    required_permissions: ['read:custom'],
    rate_limit: {
      requests_per_minute: 100,
      burst_size: 10
    },
    request_schema: { type: 'object' },
    response_schema: { type: 'object' }
  });

  // 辅助函数：创建有效的EventSubscription
  const createValidEventSubscription = (): EventSubscription => ({
    subscription_id: TestDataFactory.Base.generateUUID(),
    event_pattern: 'context.created',
    source_module: 'context' as EventSource,
    handler: 'handleContextCreated',
    filter_conditions: {
      status: 'active'
    },
    delivery_guarantees: 'at_least_once' as DeliveryGuarantee,
    dead_letter_queue: false
  });

  // 辅助函数：创建有效的ExtensionLifecycle
  const createValidLifecycle = (): ExtensionLifecycle => ({
    install_date: new Date().toISOString(),
    last_update: new Date().toISOString(),
    activation_count: 5,
    error_count: 0
  });

  // 辅助函数：创建有效的ExtensionSecurity
  const createValidSecurity = (): ExtensionSecurity => ({
    sandbox_enabled: true,
    resource_limits: {
      max_memory_mb: 256,
      max_cpu_percent: 50,
      max_file_size_mb: 100,
      network_access: true
    }
  });

  // 辅助函数：创建有效的ExtensionMetadata
  const createValidMetadata = (): ExtensionMetadata => ({
    author: 'Test Author',
    organization: 'Test Organization',
    license: 'MIT',
    homepage: 'https://example.com/extension',
    repository: 'https://github.com/test/extension'
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
  });

  describe('构造函数', () => {
    it('应该正确创建Extension实例', async () => {
      // 基于实际Schema创建测试数据
      const extensionParams = {
        extension_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        protocol_version: '1.0.0' as Version,
        name: 'test-extension',
        version: '1.0.0' as Version,
        type: 'plugin' as ExtensionType,
        status: 'installed' as ExtensionStatus,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_name: 'Test Extension',
        description: 'A test extension for MPLP',
        compatibility: createValidCompatibility(),
        configuration: createValidConfiguration(),
        extension_points: [createValidExtensionPoint()],
        api_extensions: [createValidApiExtension()],
        event_subscriptions: [createValidEventSubscription()],
        lifecycle: createValidLifecycle(),
        security: createValidSecurity(),
        metadata: createValidMetadata()
      };

      // 执行测试
      const extension = await TestHelpers.Performance.expectExecutionTime(
        () => new Extension(
          extensionParams.extension_id,
          extensionParams.context_id,
          extensionParams.protocol_version,
          extensionParams.name,
          extensionParams.version,
          extensionParams.type,
          extensionParams.status,
          extensionParams.timestamp,
          extensionParams.created_at,
          extensionParams.updated_at,
          extensionParams.display_name,
          extensionParams.description,
          extensionParams.compatibility,
          extensionParams.configuration,
          extensionParams.extension_points,
          extensionParams.api_extensions,
          extensionParams.event_subscriptions,
          extensionParams.lifecycle,
          extensionParams.security,
          extensionParams.metadata
        ),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.ENTITY_VALIDATION
      );

      // 验证结果 - 基于实际getter方法
      expect(extension.extension_id).toBe(extensionParams.extension_id);
      expect(extension.context_id).toBe(extensionParams.context_id);
      expect(extension.protocol_version).toBe(extensionParams.protocol_version);
      expect(extension.name).toBe(extensionParams.name);
      expect(extension.version).toBe(extensionParams.version);
      expect(extension.type).toBe(extensionParams.type);
      expect(extension.status).toBe(extensionParams.status);
      expect(extension.display_name).toBe(extensionParams.display_name);
      expect(extension.description).toBe(extensionParams.description);
      expect(extension.compatibility).toEqual(extensionParams.compatibility);
      expect(extension.configuration).toEqual(extensionParams.configuration);
      expect(extension.extension_points).toEqual(extensionParams.extension_points);
      expect(extension.api_extensions).toEqual(extensionParams.api_extensions);
      expect(extension.event_subscriptions).toEqual(extensionParams.event_subscriptions);
      expect(extension.lifecycle).toEqual(extensionParams.lifecycle);
      expect(extension.security).toEqual(extensionParams.security);
      expect(extension.metadata).toEqual(extensionParams.metadata);
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '最小必需参数',
          input: {
            extension_id: TestDataFactory.Base.generateUUID(),
            context_id: TestDataFactory.Base.generateUUID(),
            protocol_version: '1.0.0' as Version,
            name: 'minimal-extension',
            version: '1.0.0' as Version,
            type: 'plugin' as ExtensionType,
            status: 'installed' as ExtensionStatus,
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          expectedError: undefined
        },
        {
          name: '空扩展点数组',
          input: {
            extension_id: TestDataFactory.Base.generateUUID(),
            context_id: TestDataFactory.Base.generateUUID(),
            protocol_version: '1.0.0' as Version,
            name: 'empty-points-extension',
            version: '1.0.0' as Version,
            type: 'adapter' as ExtensionType,
            status: 'active' as ExtensionStatus,
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            extension_points: []
          },
          expectedError: undefined
        },
        {
          name: '包含所有可选参数',
          input: {
            extension_id: TestDataFactory.Base.generateUUID(),
            context_id: TestDataFactory.Base.generateUUID(),
            protocol_version: '1.0.0' as Version,
            name: 'full-featured-extension',
            version: '2.0.0' as Version,
            type: 'middleware' as ExtensionType,
            status: 'active' as ExtensionStatus,
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            display_name: 'Full Featured Extension',
            description: 'Complete extension with all features',
            compatibility: createValidCompatibility(),
            configuration: createValidConfiguration(),
            extension_points: [createValidExtensionPoint()],
            api_extensions: [createValidApiExtension()],
            event_subscriptions: [createValidEventSubscription()],
            lifecycle: createValidLifecycle(),
            security: createValidSecurity(),
            metadata: createValidMetadata()
          },
          expectedError: undefined
        }
      ];

      for (const test of boundaryTests) {
        const extension = new Extension(
          test.input.extension_id,
          test.input.context_id,
          test.input.protocol_version,
          test.input.name,
          test.input.version,
          test.input.type,
          test.input.status,
          test.input.timestamp,
          test.input.created_at,
          test.input.updated_at,
          test.input.display_name,
          test.input.description,
          test.input.compatibility,
          test.input.configuration,
          test.input.extension_points || [],
          test.input.api_extensions || [],
          test.input.event_subscriptions || [],
          test.input.lifecycle,
          test.input.security,
          test.input.metadata
        );

        expect(extension.extension_id).toBe(test.input.extension_id);
        expect(extension.context_id).toBe(test.input.context_id);
        expect(extension.name).toBe(test.input.name);
        expect(extension.version).toBe(test.input.version);
        expect(extension.type).toBe(test.input.type);
        expect(extension.status).toBe(test.input.status);
      }
    });
  });

  describe('activate', () => {
    it('应该成功激活扩展', async () => {
      // 准备测试数据
      const extension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const originalUpdatedAt = extension.updated_at;

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      extension.activate();

      // 验证结果
      expect(extension.status).toBe('active');
      expect(new Date(extension.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(originalUpdatedAt).getTime());
    });

    it('应该处理已激活的扩展', () => {
      // 准备测试数据
      const extension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 执行测试 - 应该抛出错误
      expect(() => {
        extension.activate();
      }).toThrow('无法激活状态为 active 的扩展');
    });
  });

  describe('deactivate', () => {
    it('应该成功停用扩展', async () => {
      // 准备测试数据
      const extension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const originalUpdatedAt = extension.updated_at;

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      extension.deactivate();

      // 验证结果
      expect(extension.status).toBe('inactive');
      expect(new Date(extension.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(originalUpdatedAt).getTime());
    });
  });

  describe('addExtensionPoint', () => {
    it('应该成功添加扩展点', async () => {
      // 准备测试数据
      const extension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const newExtensionPoint = createValidExtensionPoint();
      const originalUpdatedAt = extension.updated_at;

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      extension.addExtensionPoint(newExtensionPoint);

      // 验证结果
      expect(extension.extension_points).toContain(newExtensionPoint);
      expect(extension.extension_points.length).toBe(1);
      expect(new Date(extension.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(originalUpdatedAt).getTime());
    });

    it('应该不添加重复的扩展点', () => {
      // 准备测试数据
      const existingPoint = createValidExtensionPoint();
      const extension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        undefined,
        [existingPoint]
      );

      // 执行测试
      extension.addExtensionPoint(existingPoint);

      // 验证结果
      expect(extension.extension_points).toContain(existingPoint);
      expect(extension.extension_points.length).toBe(1);
    });
  });

  describe('removeExtensionPoint', () => {
    it('应该成功移除扩展点', async () => {
      // 准备测试数据
      const pointToRemove = createValidExtensionPoint();
      pointToRemove.name = 'point_to_remove';

      const otherPoint = createValidExtensionPoint();
      otherPoint.name = 'other_point';
      otherPoint.point_id = TestDataFactory.Base.generateUUID(); // 确保不同的ID

      const extension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        undefined,
        [pointToRemove, otherPoint]
      );

      const originalUpdatedAt = extension.updated_at;

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试 - 使用name而不是ID
      extension.removeExtensionPoint(pointToRemove.name);

      // 验证结果 - 检查name而不是ID
      const remainingNames = extension.extension_points.map(p => p.name);
      expect(remainingNames).not.toContain(pointToRemove.name);
      expect(remainingNames).toContain(otherPoint.name);
      expect(extension.extension_points.length).toBe(1);
      expect(new Date(extension.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(originalUpdatedAt).getTime());
    });

    it('应该处理移除不存在的扩展点', () => {
      // 准备测试数据
      const existingPoint = createValidExtensionPoint();
      existingPoint.name = 'existing_point';
      const nonExistentName = 'non_existent_point';

      const extension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        undefined,
        [existingPoint]
      );

      // 执行测试 - 使用不存在的name
      extension.removeExtensionPoint(nonExistentName);

      // 验证结果
      expect(extension.extension_points).toContain(existingPoint);
      expect(extension.extension_points.length).toBe(1);
    });
  });

  describe('updateConfiguration', () => {
    it('应该成功更新配置', async () => {
      // 准备测试数据
      const extension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString(),
        undefined,
        undefined,
        undefined,
        createValidConfiguration()
      );

      const newConfig = createValidConfiguration();
      newConfig.current_config.debug = true;
      newConfig.current_config.timeout = 10000;

      const originalUpdatedAt = extension.updated_at;

      // 等待一毫秒确保时间差异
      await TestHelpers.Async.wait(1);

      // 执行测试
      extension.updateConfiguration(newConfig);

      // 验证结果
      expect(extension.configuration).toEqual(newConfig);
      expect(extension.configuration?.current_config.debug).toBe(true);
      expect(extension.configuration?.current_config.timeout).toBe(10000);
      expect(new Date(extension.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(originalUpdatedAt).getTime());
    });
  });

  describe('isActive', () => {
    it('应该正确判断扩展是否激活', () => {
      // 测试激活状态
      const activeExtension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'active-extension',
        '1.0.0',
        'plugin',
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      expect(activeExtension.isActive()).toBe(true);

      // 测试非激活状态
      const inactiveExtension = new Extension(
        TestDataFactory.Base.generateUUID(),
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'inactive-extension',
        '1.0.0',
        'plugin',
        'inactive',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      expect(inactiveExtension.isActive()).toBe(false);
    });
  });

  describe('toProtocol', () => {
    it('应该正确序列化为协议格式', () => {
      // 准备测试数据
      const extensionParams = {
        extension_id: TestDataFactory.Base.generateUUID(),
        context_id: TestDataFactory.Base.generateUUID(),
        protocol_version: '1.0.0' as Version,
        name: 'test-extension',
        version: '1.0.0' as Version,
        type: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus,
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        display_name: 'Test Extension',
        description: 'A test extension',
        compatibility: createValidCompatibility(),
        configuration: createValidConfiguration(),
        extension_points: [createValidExtensionPoint()],
        api_extensions: [createValidApiExtension()],
        event_subscriptions: [createValidEventSubscription()],
        lifecycle: createValidLifecycle(),
        security: createValidSecurity(),
        metadata: createValidMetadata()
      };

      const extension = new Extension(
        extensionParams.extension_id,
        extensionParams.context_id,
        extensionParams.protocol_version,
        extensionParams.name,
        extensionParams.version,
        extensionParams.type,
        extensionParams.status,
        extensionParams.timestamp,
        extensionParams.created_at,
        extensionParams.updated_at,
        extensionParams.display_name,
        extensionParams.description,
        extensionParams.compatibility,
        extensionParams.configuration,
        extensionParams.extension_points,
        extensionParams.api_extensions,
        extensionParams.event_subscriptions,
        extensionParams.lifecycle,
        extensionParams.security,
        extensionParams.metadata
      );

      // 执行测试
      const protocol = extension.toProtocol();

      // 验证结果
      expect(protocol.extension_id).toBe(extensionParams.extension_id);
      expect(protocol.context_id).toBe(extensionParams.context_id);
      expect(protocol.protocol_version).toBe(extensionParams.protocol_version);
      expect(protocol.name).toBe(extensionParams.name);
      expect(protocol.version).toBe(extensionParams.version);
      expect(protocol.type).toBe(extensionParams.type);
      expect(protocol.status).toBe(extensionParams.status);
      expect(protocol.display_name).toBe(extensionParams.display_name);
      expect(protocol.description).toBe(extensionParams.description);
      expect(protocol.compatibility).toEqual(extensionParams.compatibility);
      expect(protocol.configuration).toEqual(extensionParams.configuration);
      expect(protocol.extension_points).toEqual(extensionParams.extension_points);
      expect(protocol.api_extensions).toEqual(extensionParams.api_extensions);
      expect(protocol.event_subscriptions).toEqual(extensionParams.event_subscriptions);
      expect(protocol.lifecycle).toEqual(extensionParams.lifecycle);
      expect(protocol.security).toEqual(extensionParams.security);
      expect(protocol.metadata).toEqual(extensionParams.metadata);
    });
  });
});
