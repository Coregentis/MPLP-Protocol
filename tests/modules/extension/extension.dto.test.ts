/**
 * Extension DTO单元测试
 *
 * @description 基于实际Extension DTO定义的完整测试套件
 * @version 1.0.0
 * @layer 测试层 - DTO验证测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context、Plan、Role、Confirm模块使用IDENTICAL的DTO测试模式
 */

import {
  CreateExtensionDto,
  UpdateExtensionDto,
  ExtensionQueryDto,
  ExtensionResponseDto,
  ExtensionListResponseDto,
  ExtensionCompatibilityDto,
  ExtensionConfigurationDto,
  ExtensionPointDto,
  ApiExtensionDto,
  EventSubscriptionDto,
  ExtensionLifecycleDto,
  ExtensionSecurityDto,
  ExtensionMetadataDto,
  AuthenticationConfigDto,
  RateLimitConfigDto,
  ValidationConfigDto,
  ApiDocumentationDto,
  ResourceLimitsDto,
  CodeSigningDto,
  PermissionsDto,
  ConditionalExecutionDto
} from '../../../src/modules/extension/api/dto/extension.dto';
import { ExtensionType, ExtensionStatus } from '../../../src/modules/extension/types';
import { UUID } from '../../../src/shared/types';
import { generateTestUUID } from './test-data-factory';

describe('Extension DTO测试', () => {

  describe('CreateExtensionDto - 创建扩展DTO', () => {
    it('应该正确定义CreateExtensionDto的必需字段', () => {
      // 📋 Arrange - 基于实际CreateExtensionDto接口
      const createDto: CreateExtensionDto = {
        contextId: generateTestUUID('ctx'),
        name: 'test-extension',
        displayName: 'Test Extension',
        description: 'A test extension for DTO validation',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType
      };

      // ✅ Assert - 验证必需字段
      expect(createDto.contextId).toBeDefined();
      expect(createDto.name).toBe('test-extension');
      expect(createDto.displayName).toBe('Test Extension');
      expect(createDto.description).toBe('A test extension for DTO validation');
      expect(createDto.version).toBe('1.0.0');
      expect(createDto.extensionType).toBe('plugin');

      // 验证字段类型
      expect(typeof createDto.contextId).toBe('string');
      expect(typeof createDto.name).toBe('string');
      expect(typeof createDto.displayName).toBe('string');
      expect(typeof createDto.description).toBe('string');
      expect(typeof createDto.version).toBe('string');
      expect(typeof createDto.extensionType).toBe('string');
    });

    it('应该正确定义CreateExtensionDto的可选字段', () => {
      // 📋 Arrange - 包含可选字段的CreateExtensionDto
      const createDto: CreateExtensionDto = {
        contextId: generateTestUUID('ctx'),
        name: 'test-extension',
        displayName: 'Test Extension',
        description: 'A test extension',
        version: '1.0.0',
        extensionType: 'adapter' as ExtensionType,
        compatibility: {
          mplpVersion: '1.0.0',
          requiredModules: ['context', 'plan'],
          dependencies: [{
            name: 'test-dependency',
            version: '1.0.0',
            optional: false
          }]
        },
        configuration: {
          schema: { type: 'object', properties: {} },
          currentConfig: { enabled: true },
          defaultConfig: { enabled: false }
        },
        security: {
          sandboxEnabled: true,
          resourceLimits: {
            maxMemory: 100 * 1024 * 1024,
            maxCpu: 50,
            maxFileSize: 10 * 1024 * 1024
          }
        },
        metadata: {
          author: 'Test Author',
          license: 'MIT',
          keywords: ['test', 'extension'],
          category: 'testing'
        }
      };

      // ✅ Assert - 验证可选字段
      expect(createDto.compatibility).toBeDefined();
      expect(createDto.compatibility?.mplpVersion).toBe('1.0.0');
      expect(createDto.compatibility?.requiredModules).toEqual(['context', 'plan']);
      expect(createDto.compatibility?.dependencies).toHaveLength(1);

      expect(createDto.configuration).toBeDefined();
      expect(createDto.configuration?.schema).toEqual({ type: 'object', properties: {} });
      expect(createDto.configuration?.currentConfig).toEqual({ enabled: true });

      expect(createDto.security).toBeDefined();
      expect(createDto.security?.sandboxEnabled).toBe(true);
      expect(createDto.security?.resourceLimits?.maxMemory).toBe(100 * 1024 * 1024);

      expect(createDto.metadata).toBeDefined();
      expect(createDto.metadata?.author).toBe('Test Author');
      expect(createDto.metadata?.license).toBe('MIT');
      expect(createDto.metadata?.keywords).toEqual(['test', 'extension']);
    });
  });

  describe('UpdateExtensionDto - 更新扩展DTO', () => {
    it('应该正确定义UpdateExtensionDto的可选字段', () => {
      // 📋 Arrange - 基于实际UpdateExtensionDto接口
      const updateDto: UpdateExtensionDto = {
        displayName: 'Updated Test Extension',
        description: 'Updated description for test extension',
        status: 'active' as ExtensionStatus,
        configuration: {
          currentConfig: { enabled: true, debug: true }
        }
      };

      // ✅ Assert - 验证更新字段
      expect(updateDto.displayName).toBe('Updated Test Extension');
      expect(updateDto.description).toBe('Updated description for test extension');
      expect(updateDto.status).toBe('active');
      expect(updateDto.configuration).toBeDefined();
      expect(updateDto.configuration?.currentConfig).toEqual({ enabled: true, debug: true });

      // 验证所有字段都是可选的
      const minimalUpdateDto: UpdateExtensionDto = {};
      expect(minimalUpdateDto).toBeDefined();
    });

    it('应该支持部分更新字段', () => {
      // 📋 Arrange - 只更新部分字段
      const partialUpdateDto: UpdateExtensionDto = {
        status: 'disabled' as ExtensionStatus
      };

      // ✅ Assert - 验证部分更新
      expect(partialUpdateDto.status).toBe('disabled');
      expect(partialUpdateDto.displayName).toBeUndefined();
      expect(partialUpdateDto.description).toBeUndefined();
      expect(partialUpdateDto.configuration).toBeUndefined();
    });
  });

  describe('ExtensionQueryDto - 查询扩展DTO', () => {
    it('应该正确定义ExtensionQueryDto的查询字段', () => {
      // 📋 Arrange - 基于实际ExtensionQueryDto接口
      const queryDto: ExtensionQueryDto = {
        contextId: generateTestUUID('ctx'),
        extensionType: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus,
        name: 'test-extension',
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc'
      };

      // ✅ Assert - 验证查询字段
      expect(queryDto.contextId).toBeDefined();
      expect(queryDto.extensionType).toBe('plugin');
      expect(queryDto.status).toBe('active');
      expect(queryDto.name).toBe('test-extension');
      expect(queryDto.page).toBe(1);
      expect(queryDto.limit).toBe(10);
      expect(queryDto.sortBy).toBe('name');
      expect(queryDto.sortOrder).toBe('asc');
    });

    it('应该支持空查询条件', () => {
      // 📋 Arrange - 空查询条件
      const emptyQueryDto: ExtensionQueryDto = {};

      // ✅ Assert - 验证空查询
      expect(emptyQueryDto).toBeDefined();
      expect(Object.keys(emptyQueryDto)).toHaveLength(0);
    });
  });

  describe('ExtensionResponseDto - 扩展响应DTO', () => {
    it('应该正确定义ExtensionResponseDto的响应字段', () => {
      // 📋 Arrange - 基于实际ExtensionResponseDto接口
      const responseDto: ExtensionResponseDto = {
        extensionId: generateTestUUID('ext'),
        contextId: generateTestUUID('ctx'),
        name: 'response-test-extension',
        displayName: 'Response Test Extension',
        description: 'Extension for response DTO testing',
        version: '1.0.0',
        extensionType: 'connector' as ExtensionType,
        status: 'active' as ExtensionStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // ✅ Assert - 验证响应字段
      expect(responseDto.extensionId).toBeDefined();
      expect(responseDto.contextId).toBeDefined();
      expect(responseDto.name).toBe('response-test-extension');
      expect(responseDto.displayName).toBe('Response Test Extension');
      expect(responseDto.description).toBe('Extension for response DTO testing');
      expect(responseDto.version).toBe('1.0.0');
      expect(responseDto.extensionType).toBe('connector');
      expect(responseDto.status).toBe('active');
      expect(responseDto.createdAt).toBeDefined();
      expect(responseDto.updatedAt).toBeDefined();

      // 验证时间戳格式
      expect(new Date(responseDto.createdAt).toISOString()).toBe(responseDto.createdAt);
      expect(new Date(responseDto.updatedAt).toISOString()).toBe(responseDto.updatedAt);
    });
  });

  describe('ExtensionListResponseDto - 扩展列表响应DTO', () => {
    it('应该正确定义ExtensionListResponseDto的列表响应字段', () => {
      // 📋 Arrange - 基于实际ExtensionListResponseDto接口
      const listResponseDto: ExtensionListResponseDto = {
        extensions: [
          {
            extensionId: generateTestUUID('ext1'),
            contextId: generateTestUUID('ctx'),
            name: 'extension-1',
            displayName: 'Extension 1',
            description: 'First extension',
            version: '1.0.0',
            extensionType: 'plugin' as ExtensionType,
            status: 'active' as ExtensionStatus,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            extensionId: generateTestUUID('ext2'),
            contextId: generateTestUUID('ctx'),
            name: 'extension-2',
            displayName: 'Extension 2',
            description: 'Second extension',
            version: '1.1.0',
            extensionType: 'adapter' as ExtensionType,
            status: 'inactive' as ExtensionStatus,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        totalCount: 2,
        page: 1,
        limit: 10,
        hasMore: false
      };

      // ✅ Assert - 验证列表响应字段
      expect(listResponseDto.extensions).toHaveLength(2);
      expect(listResponseDto.totalCount).toBe(2);
      expect(listResponseDto.page).toBe(1);
      expect(listResponseDto.limit).toBe(10);
      expect(listResponseDto.hasMore).toBe(false);

      // 验证扩展项目
      expect(listResponseDto.extensions[0].name).toBe('extension-1');
      expect(listResponseDto.extensions[0].extensionType).toBe('plugin');
      expect(listResponseDto.extensions[0].status).toBe('active');

      expect(listResponseDto.extensions[1].name).toBe('extension-2');
      expect(listResponseDto.extensions[1].extensionType).toBe('adapter');
      expect(listResponseDto.extensions[1].status).toBe('inactive');
    });

    it('应该支持空列表响应', () => {
      // 📋 Arrange - 空列表响应
      const emptyListResponseDto: ExtensionListResponseDto = {
        extensions: [],
        totalCount: 0,
        page: 1,
        limit: 10,
        hasMore: false
      };

      // ✅ Assert - 验证空列表响应
      expect(emptyListResponseDto.extensions).toHaveLength(0);
      expect(emptyListResponseDto.totalCount).toBe(0);
      expect(emptyListResponseDto.hasMore).toBe(false);
    });
  });

  describe('嵌套DTO结构测试', () => {
    it('应该正确定义ExtensionCompatibilityDto', () => {
      // 📋 Arrange - 兼容性DTO
      const compatibilityDto: ExtensionCompatibilityDto = {
        mplpVersion: '1.0.0',
        requiredModules: ['context', 'plan', 'role'],
        dependencies: [
          {
            name: 'lodash',
            version: '^4.17.21',
            optional: false
          },
          {
            name: 'moment',
            version: '^2.29.0',
            optional: true
          }
        ]
      };

      // ✅ Assert - 验证兼容性DTO
      expect(compatibilityDto.mplpVersion).toBe('1.0.0');
      expect(compatibilityDto.requiredModules).toEqual(['context', 'plan', 'role']);
      expect(compatibilityDto.dependencies).toHaveLength(2);
      expect(compatibilityDto.dependencies?.[0].name).toBe('lodash');
      expect(compatibilityDto.dependencies?.[0].optional).toBe(false);
      expect(compatibilityDto.dependencies?.[1].name).toBe('moment');
      expect(compatibilityDto.dependencies?.[1].optional).toBe(true);
    });

    it('应该正确定义ApiExtensionDto', () => {
      // 📋 Arrange - API扩展DTO
      const apiExtensionDto: ApiExtensionDto = {
        endpoint: '/api/test',
        method: 'POST',
        handler: 'handleTestRequest',
        middleware: ['auth', 'validation'],
        authentication: {
          required: true,
          schemes: ['bearer'],
          permissions: ['test:create']
        },
        rateLimit: {
          enabled: true,
          requestsPerMinute: 100,
          burstSize: 10,
          keyGenerator: 'ip'
        },
        validation: {
          requestSchema: { type: 'object' },
          responseSchema: { type: 'object' }
        },
        documentation: {
          summary: 'Test API endpoint',
          description: 'Creates a test resource'
        }
      };

      // ✅ Assert - 验证API扩展DTO
      expect(apiExtensionDto.endpoint).toBe('/api/test');
      expect(apiExtensionDto.method).toBe('POST');
      expect(apiExtensionDto.handler).toBe('handleTestRequest');
      expect(apiExtensionDto.middleware).toEqual(['auth', 'validation']);
      expect(apiExtensionDto.authentication.required).toBe(true);
      expect(apiExtensionDto.authentication.schemes).toEqual(['bearer']);
      expect(apiExtensionDto.rateLimit.enabled).toBe(true);
      expect(apiExtensionDto.rateLimit.requestsPerMinute).toBe(100);
      expect(apiExtensionDto.validation.requestSchema).toEqual({ type: 'object' });
      expect(apiExtensionDto.documentation.summary).toBe('Test API endpoint');
    });
  });
});
