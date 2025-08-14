/**
 * ExtensionMapper真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 验证双重命名约定转换的正确性
 * 
 * @version 1.0.0
 * @created 2025-08-11
 */

import { ExtensionMapper, ExtensionProtocolSchema } from '../../../src/modules/extension/api/mappers/extension.mapper';
import {
  ExtensionResponseDto,
  ExtensionTypeDto,
  ExtensionStatusDto,
  ExtensionCompatibilityDto,
  ExtensionConfigurationDto,
  ExtensionPointDto,
  ApiExtensionDto,
  EventSubscriptionDto,
  ExtensionLifecycleDto,
  ExtensionSecurityDto,
  ExtensionMetadataDto,
} from '../../../src/modules/extension/api/dto/extension.dto';
import { v4 as uuidv4 } from 'uuid';

describe('ExtensionMapper真实实现单元测试', () => {
  
  // 辅助函数：创建有效的ExtensionResponseDto
  const createValidExtensionResponseDto = (overrides: Partial<ExtensionResponseDto> = {}): ExtensionResponseDto => {
    const now = new Date().toISOString();
    
    return {
      protocolVersion: '1.0.1',
      timestamp: now,
      extensionId: uuidv4(),
      contextId: uuidv4(),
      name: 'test-extension',
      displayName: 'Test Extension',
      description: 'Test extension description',
      version: '1.0.0',
      extensionType: 'plugin' as ExtensionTypeDto,
      status: 'installed' as ExtensionStatusDto,
      compatibility: {
        mplpVersion: '1.0.0',
        requiredModules: [],
        dependencies: [],
        conflicts: [],
      } as ExtensionCompatibilityDto,
      configuration: {
        schema: {},
        currentConfig: {},
      } as ExtensionConfigurationDto,
      extensionPoints: [] as ExtensionPointDto[],
      apiExtensions: [] as ApiExtensionDto[],
      eventSubscriptions: [] as EventSubscriptionDto[],
      lifecycle: {
        installDate: now,
        activationCount: 0,
        errorCount: 0,
        autoStart: false,
        loadPriority: 0,
      } as ExtensionLifecycleDto,
      security: {
        sandboxEnabled: true,
        resourceLimits: {
          maxMemoryMb: 512,
          maxCpuPercent: 50,
          maxFileSizeMb: 1024,
          maxNetworkConnections: 50,
        },
        permissions: [],
      } as ExtensionSecurityDto,
      metadata: {
        author: 'Test Author',
        license: 'MIT',
        homepage: 'https://test.com',
        repository: 'https://github.com/test/test',
        keywords: ['test'],
        category: 'utility',
      } as ExtensionMetadataDto,
      ...overrides,
    };
  };

  // 辅助函数：创建有效的ExtensionProtocolSchema
  const createValidExtensionProtocolSchema = (overrides: Partial<ExtensionProtocolSchema> = {}): ExtensionProtocolSchema => {
    const now = new Date().toISOString();
    
    return {
      protocol_version: '1.0.1',
      timestamp: now,
      extension_id: uuidv4(),
      context_id: uuidv4(),
      name: 'test-extension',
      display_name: 'Test Extension',
      description: 'Test extension description',
      version: '1.0.0',
      extension_type: 'plugin',
      status: 'installed',
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
        install_date: now,
        activation_count: 0,
        error_count: 0,
        auto_start: false,
        load_priority: 0,
      },
      security: {
        sandbox_enabled: true,
        resource_limits: {
          max_memory_mb: 512,
          max_cpu_percent: 50,
          max_file_size_mb: 1024,
          max_network_connections: 50,
        },
        permissions: [],
      },
      metadata: {
        author: 'Test Author',
        license: 'MIT',
        homepage: 'https://test.com',
        repository: 'https://github.com/test/test',
        keywords: ['test'],
        category: 'utility',
      },
      ...overrides,
    };
  };

  describe('toSchema() - TypeScript → Schema转换', () => {
    it('应该正确转换基本字段（camelCase → snake_case）', () => {
      const dto = createValidExtensionResponseDto({
        extensionId: 'ext-123',
        contextId: 'ctx-456',
        protocolVersion: '1.0.1',
        extensionType: 'adapter',
        displayName: 'Custom Extension',
      });

      const schema = ExtensionMapper.toSchema(dto);

      expect(schema.extension_id).toBe('ext-123');
      expect(schema.context_id).toBe('ctx-456');
      expect(schema.protocol_version).toBe('1.0.1');
      expect(schema.extension_type).toBe('adapter');
      expect(schema.display_name).toBe('Custom Extension');
    });

    it('应该正确转换兼容性信息', () => {
      const dto = createValidExtensionResponseDto({
        compatibility: {
          mplpVersion: '2.0.0',
          requiredModules: [
            { module: 'core', minVersion: '1.0.0', optional: false }
          ],
          dependencies: [
            { extensionId: 'dep-1', name: 'dependency-1', versionRange: '^1.0.0', optional: false }
          ],
          conflicts: [
            { extensionId: 'conf-1', name: 'conflict-1', reason: 'incompatible' }
          ],
        },
      });

      const schema = ExtensionMapper.toSchema(dto);

      expect(schema.compatibility.mplp_version).toBe('2.0.0');
      expect(schema.compatibility.required_modules).toHaveLength(1);
      expect(schema.compatibility.required_modules[0].min_version).toBe('1.0.0');
      expect(schema.compatibility.dependencies).toHaveLength(1);
      expect(schema.compatibility.dependencies[0].extension_id).toBe('dep-1');
      expect(schema.compatibility.dependencies[0].version_range).toBe('^1.0.0');
      expect(schema.compatibility.conflicts).toHaveLength(1);
      expect(schema.compatibility.conflicts[0].extension_id).toBe('conf-1');
    });

    it('应该正确转换配置信息', () => {
      const dto = createValidExtensionResponseDto({
        configuration: {
          schema: { type: 'object' },
          currentConfig: { setting1: 'value1' },
          defaultConfig: { setting1: 'default' },
          validationRules: [
            { rule: 'required', level: 'error', message: 'Setting1 is required' }
          ],
        },
      });

      const schema = ExtensionMapper.toSchema(dto);

      expect(schema.configuration.current_config).toEqual({ setting1: 'value1' });
      expect(schema.configuration.default_config).toEqual({ setting1: 'default' });
      expect(schema.configuration.validation_rules).toHaveLength(1);
      expect(schema.configuration.validation_rules[0].rule).toBe('required');
    });

    it('应该正确转换生命周期信息', () => {
      const dto = createValidExtensionResponseDto({
        lifecycle: {
          installDate: '2025-01-01T00:00:00.000Z',
          lastUpdate: '2025-01-02T00:00:00.000Z',
          activationCount: 5,
          errorCount: 2,
          lastError: 'Test error',
          autoStart: true,
          loadPriority: 10,
        },
      });

      const schema = ExtensionMapper.toSchema(dto);

      expect(schema.lifecycle.install_date).toBe('2025-01-01T00:00:00.000Z');
      expect(schema.lifecycle.last_update).toBe('2025-01-02T00:00:00.000Z');
      expect(schema.lifecycle.activation_count).toBe(5);
      expect(schema.lifecycle.error_count).toBe(2);
      expect(schema.lifecycle.last_error).toBe('Test error');
      expect(schema.lifecycle.auto_start).toBe(true);
      expect(schema.lifecycle.load_priority).toBe(10);
    });

    it('应该正确转换安全信息', () => {
      const dto = createValidExtensionResponseDto({
        security: {
          sandboxEnabled: false,
          resourceLimits: {
            maxMemoryMb: 1024,
            maxCpuPercent: 75,
            maxFileSizeMb: 2048,
            maxNetworkConnections: 100,
          },
          permissions: [
            { name: 'read', description: 'Read permission', required: true },
            { name: 'write', description: 'Write permission', required: false }
          ],
        },
      });

      const schema = ExtensionMapper.toSchema(dto);

      expect(schema.security.sandbox_enabled).toBe(false);
      expect(schema.security.resource_limits.max_memory_mb).toBe(1024);
      expect(schema.security.resource_limits.max_cpu_percent).toBe(75);
      expect(schema.security.resource_limits.max_file_size_mb).toBe(2048);
      expect(schema.security.resource_limits.max_network_connections).toBe(100);
      expect(schema.security.permissions).toHaveLength(2);
      expect(schema.security.permissions[0].name).toBe('read');
      expect(schema.security.permissions[1].name).toBe('write');
    });
  });

  describe('fromSchema() - Schema → TypeScript转换', () => {
    it('应该正确转换基本字段（snake_case → camelCase）', () => {
      const schema = createValidExtensionProtocolSchema({
        extension_id: 'ext-123',
        context_id: 'ctx-456',
        protocol_version: '1.0.1',
        extension_type: 'adapter',
        display_name: 'Custom Extension',
      });

      const dto = ExtensionMapper.fromSchema(schema);

      expect(dto.extensionId).toBe('ext-123');
      expect(dto.contextId).toBe('ctx-456');
      expect(dto.protocolVersion).toBe('1.0.1');
      expect(dto.extensionType).toBe('adapter');
      expect(dto.displayName).toBe('Custom Extension');
    });

    it('应该正确转换兼容性信息', () => {
      const schema = createValidExtensionProtocolSchema({
        compatibility: {
          mplp_version: '2.0.0',
          required_modules: [
            { module: 'core', min_version: '1.0.0', optional: false }
          ],
          dependencies: [
            { extension_id: 'dep-1', name: 'dependency-1', version_range: '^1.0.0', optional: false }
          ],
          conflicts: [
            { extension_id: 'conf-1', name: 'conflict-1', reason: 'incompatible' }
          ],
        },
      });

      const dto = ExtensionMapper.fromSchema(schema);

      expect(dto.compatibility.mplpVersion).toBe('2.0.0');
      expect(dto.compatibility.requiredModules).toHaveLength(1);
      expect(dto.compatibility.requiredModules[0].minVersion).toBe('1.0.0');
      expect(dto.compatibility.dependencies).toHaveLength(1);
      expect(dto.compatibility.dependencies[0].extensionId).toBe('dep-1');
      expect(dto.compatibility.dependencies[0].versionRange).toBe('^1.0.0');
      expect(dto.compatibility.conflicts).toHaveLength(1);
      expect(dto.compatibility.conflicts[0].extensionId).toBe('conf-1');
    });

    it('应该正确转换配置信息', () => {
      const schema = createValidExtensionProtocolSchema({
        configuration: {
          schema: { type: 'object' },
          current_config: { setting1: 'value1' },
          default_config: { setting1: 'default' },
          validation_rules: [
            { rule: 'required', level: 'error', message: 'Setting1 is required' }
          ],
        },
      });

      const dto = ExtensionMapper.fromSchema(schema);

      expect(dto.configuration.currentConfig).toEqual({ setting1: 'value1' });
      expect(dto.configuration.defaultConfig).toEqual({ setting1: 'default' });
      expect(dto.configuration.validationRules).toHaveLength(1);
      expect(dto.configuration.validationRules[0].rule).toBe('required');
    });

    it('应该正确转换生命周期信息', () => {
      const schema = createValidExtensionProtocolSchema({
        lifecycle: {
          install_date: '2025-01-01T00:00:00.000Z',
          last_update: '2025-01-02T00:00:00.000Z',
          activation_count: 5,
          error_count: 2,
          last_error: 'Test error',
          auto_start: true,
          load_priority: 10,
        },
      });

      const dto = ExtensionMapper.fromSchema(schema);

      expect(dto.lifecycle.installDate).toBe('2025-01-01T00:00:00.000Z');
      expect(dto.lifecycle.lastUpdate).toBe('2025-01-02T00:00:00.000Z');
      expect(dto.lifecycle.activationCount).toBe(5);
      expect(dto.lifecycle.errorCount).toBe(2);
      expect(dto.lifecycle.lastError).toBe('Test error');
      expect(dto.lifecycle.autoStart).toBe(true);
      expect(dto.lifecycle.loadPriority).toBe(10);
    });

    it('应该正确转换安全信息', () => {
      const schema = createValidExtensionProtocolSchema({
        security: {
          sandbox_enabled: false,
          resource_limits: {
            max_memory_mb: 1024,
            max_cpu_percent: 75,
            max_file_size_mb: 2048,
            max_network_connections: 100,
          },
          permissions: [
            { name: 'read', description: 'Read permission', required: true },
            { name: 'write', description: 'Write permission', required: false }
          ],
        },
      });

      const dto = ExtensionMapper.fromSchema(schema);

      expect(dto.security.sandboxEnabled).toBe(false);
      expect(dto.security.resourceLimits.maxMemoryMb).toBe(1024);
      expect(dto.security.resourceLimits.maxCpuPercent).toBe(75);
      expect(dto.security.resourceLimits.maxFileSizeMb).toBe(2048);
      expect(dto.security.resourceLimits.maxNetworkConnections).toBe(100);
      expect(dto.security.permissions).toHaveLength(2);
      expect(dto.security.permissions[0].name).toBe('read');
      expect(dto.security.permissions[1].name).toBe('write');
    });
  });

  describe('validateSchema() - Schema验证', () => {
    it('应该验证有效的Schema数据', () => {
      const validSchema = createValidExtensionProtocolSchema();

      const isValid = ExtensionMapper.validateSchema(validSchema);

      expect(isValid).toBe(true);
    });

    it('应该拒绝null或undefined数据', () => {
      expect(ExtensionMapper.validateSchema(null)).toBe(false);
      expect(ExtensionMapper.validateSchema(undefined)).toBe(false);
    });

    it('应该拒绝非对象数据', () => {
      expect(ExtensionMapper.validateSchema('string')).toBe(false);
      expect(ExtensionMapper.validateSchema(123)).toBe(false);
      expect(ExtensionMapper.validateSchema([])).toBe(false);
    });

    it('应该拒绝缺少必需字段的数据', () => {
      const invalidSchema = {
        protocol_version: '1.0.1',
        // 缺少其他必需字段
      };

      const isValid = ExtensionMapper.validateSchema(invalidSchema);

      expect(isValid).toBe(false);
    });
  });

  describe('批量转换方法', () => {
    describe('toSchemaArray()', () => {
      it('应该正确转换DTO数组为Schema数组', () => {
        const dtos = [
          createValidExtensionResponseDto({ name: 'ext1' }),
          createValidExtensionResponseDto({ name: 'ext2' }),
        ];

        const schemas = ExtensionMapper.toSchemaArray(dtos);

        expect(schemas).toHaveLength(2);
        expect(schemas[0].name).toBe('ext1');
        expect(schemas[1].name).toBe('ext2');
        // 验证转换为snake_case
        expect(schemas[0]).toHaveProperty('extension_id');
        expect(schemas[0]).toHaveProperty('context_id');
      });

      it('应该处理空数组', () => {
        const schemas = ExtensionMapper.toSchemaArray([]);

        expect(schemas).toEqual([]);
      });
    });

    describe('fromSchemaArray()', () => {
      it('应该正确转换Schema数组为DTO数组', () => {
        const schemas = [
          createValidExtensionProtocolSchema({ name: 'ext1' }),
          createValidExtensionProtocolSchema({ name: 'ext2' }),
        ];

        const dtos = ExtensionMapper.fromSchemaArray(schemas);

        expect(dtos).toHaveLength(2);
        expect(dtos[0].name).toBe('ext1');
        expect(dtos[1].name).toBe('ext2');
        // 验证转换为camelCase
        expect(dtos[0]).toHaveProperty('extensionId');
        expect(dtos[0]).toHaveProperty('contextId');
      });

      it('应该处理空数组', () => {
        const dtos = ExtensionMapper.fromSchemaArray([]);

        expect(dtos).toEqual([]);
      });
    });
  });

  describe('双向转换一致性', () => {
    it('应该保持DTO → Schema → DTO的数据一致性', () => {
      const originalDto = createValidExtensionResponseDto({
        name: 'consistency-test',
        extensionType: 'transformer',
        status: 'active',
      });

      const schema = ExtensionMapper.toSchema(originalDto);
      const convertedDto = ExtensionMapper.fromSchema(schema);

      expect(convertedDto.name).toBe(originalDto.name);
      expect(convertedDto.extensionType).toBe(originalDto.extensionType);
      expect(convertedDto.status).toBe(originalDto.status);
      expect(convertedDto.extensionId).toBe(originalDto.extensionId);
      expect(convertedDto.contextId).toBe(originalDto.contextId);
    });

    it('应该保持Schema → DTO → Schema的数据一致性', () => {
      const originalSchema = createValidExtensionProtocolSchema({
        name: 'consistency-test',
        extension_type: 'transformer',
        status: 'active',
      });

      const dto = ExtensionMapper.fromSchema(originalSchema);
      const convertedSchema = ExtensionMapper.toSchema(dto);

      expect(convertedSchema.name).toBe(originalSchema.name);
      expect(convertedSchema.extension_type).toBe(originalSchema.extension_type);
      expect(convertedSchema.status).toBe(originalSchema.status);
      expect(convertedSchema.extension_id).toBe(originalSchema.extension_id);
      expect(convertedSchema.context_id).toBe(originalSchema.context_id);
    });
  });

  describe('命名约定验证', () => {
    it('应该确保Schema使用snake_case命名', () => {
      const dto = createValidExtensionResponseDto();
      const schema = ExtensionMapper.toSchema(dto);

      // 验证所有字段都使用snake_case
      expect(schema).toHaveProperty('protocol_version');
      expect(schema).toHaveProperty('extension_id');
      expect(schema).toHaveProperty('context_id');
      expect(schema).toHaveProperty('display_name');
      expect(schema).toHaveProperty('extension_type');
      expect(schema.compatibility).toHaveProperty('mplp_version');
      expect(schema.compatibility).toHaveProperty('required_modules');
      expect(schema.configuration).toHaveProperty('current_config');
      expect(schema.configuration).toHaveProperty('default_config');
      expect(schema.lifecycle).toHaveProperty('install_date');
      expect(schema.lifecycle).toHaveProperty('last_update');
      expect(schema.lifecycle).toHaveProperty('activation_count');
      expect(schema.lifecycle).toHaveProperty('error_count');
      expect(schema.lifecycle).toHaveProperty('auto_start');
      expect(schema.lifecycle).toHaveProperty('load_priority');
      expect(schema.security).toHaveProperty('sandbox_enabled');
      expect(schema.security.resource_limits).toHaveProperty('max_memory_mb');
      expect(schema.security.resource_limits).toHaveProperty('max_cpu_percent');

      // 验证不包含camelCase字段
      expect(schema).not.toHaveProperty('protocolVersion');
      expect(schema).not.toHaveProperty('extensionId');
      expect(schema).not.toHaveProperty('contextId');
      expect(schema).not.toHaveProperty('displayName');
      expect(schema).not.toHaveProperty('extensionType');
    });

    it('应该确保DTO使用camelCase命名', () => {
      const schema = createValidExtensionProtocolSchema();
      const dto = ExtensionMapper.fromSchema(schema);

      // 验证所有字段都使用camelCase
      expect(dto).toHaveProperty('protocolVersion');
      expect(dto).toHaveProperty('extensionId');
      expect(dto).toHaveProperty('contextId');
      expect(dto).toHaveProperty('displayName');
      expect(dto).toHaveProperty('extensionType');
      expect(dto.compatibility).toHaveProperty('mplpVersion');
      expect(dto.compatibility).toHaveProperty('requiredModules');
      expect(dto.configuration).toHaveProperty('currentConfig');
      expect(dto.configuration).toHaveProperty('defaultConfig');
      expect(dto.lifecycle).toHaveProperty('installDate');
      expect(dto.lifecycle).toHaveProperty('lastUpdate');
      expect(dto.lifecycle).toHaveProperty('activationCount');
      expect(dto.lifecycle).toHaveProperty('errorCount');
      expect(dto.lifecycle).toHaveProperty('autoStart');
      expect(dto.lifecycle).toHaveProperty('loadPriority');
      expect(dto.security).toHaveProperty('sandboxEnabled');
      expect(dto.security.resourceLimits).toHaveProperty('maxMemoryMb');
      expect(dto.security.resourceLimits).toHaveProperty('maxCpuPercent');

      // 验证不包含snake_case字段
      expect(dto).not.toHaveProperty('protocol_version');
      expect(dto).not.toHaveProperty('extension_id');
      expect(dto).not.toHaveProperty('context_id');
      expect(dto).not.toHaveProperty('display_name');
      expect(dto).not.toHaveProperty('extension_type');
    });
  });
});
