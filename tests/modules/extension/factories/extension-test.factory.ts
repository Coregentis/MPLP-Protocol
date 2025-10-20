/**
 * Extension模块测试数据工厂
 * 基于MPLP统一测试标准v1.0
 * 
 * @description 提供标准化的Extension测试数据生成
 * @version 1.0.0
 * @standard MPLP统一测试标准
 */

import { ExtensionEntity } from '../../../../src/modules/extension/domain/entities/extension.entity';
import { ExtensionEntityData, ExtensionType, ExtensionStatus } from '../../../../src/modules/extension/types';
import { UUID } from '../../../../src/shared/types';

export class ExtensionTestFactory {
  /**
   * 创建标准Extension实体用于测试
   */
  static createExtensionEntity(overrides: Partial<ExtensionEntityData> = {}): ExtensionEntity {
    const defaultData: ExtensionEntityData = {
      // 基础协议字段
      protocolVersion: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z',
      extensionId: 'ext-test-001' as UUID,
      contextId: 'ctx-test-001' as UUID,

      // 扩展核心字段
      name: 'Test Extension',
      displayName: 'Test Extension Display',
      description: 'Test extension for unit testing',
      version: '1.0.0',
      extensionType: 'plugin' as ExtensionType,
      status: 'active' as ExtensionStatus,
      
      // 兼容性配置
      compatibility: {
        mplpVersion: '>=1.0.0',
        nodeVersion: '>=16.0.0',
        platforms: ['linux', 'darwin', 'win32'],
        dependencies: {
          required: [],
          optional: [],
          conflicts: []
        }
      },
      
      // 配置
      configuration: {
        enabled: true,
        settings: {
          timeout: 30000,
          retries: 3
        },
        schema: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            settings: {
              type: 'object',
              properties: {
                timeout: { type: 'number', default: 30000 },
                retries: { type: 'number', default: 3 }
              }
            }
          }
        }
      },
      
      // 扩展点
      extensionPoints: [],
      apiExtensions: [],
      eventSubscriptions: [],
      
      // 生命周期
      lifecycle: {
        hooks: {
          install: {
            script: 'npm install',
            timeout: 300000
          },
          activate: {
            script: 'npm run activate',
            timeout: 60000
          },
          deactivate: {
            script: 'npm run deactivate',
            timeout: 30000
          },
          uninstall: {
            script: 'npm uninstall',
            timeout: 120000
          }
        },
        state: 'active',
        history: []
      },

      // 安全配置
      security: {
        permissions: ['read', 'write'],
        sandboxed: true,
        trustedSources: ['test-registry'],
        signature: {
          algorithm: 'RSA-SHA256',
          value: 'test-signature',
          certificate: 'test-cert'
        }
      },

      // 元数据
      metadata: {
        author: {
          name: 'Test Factory',
          email: 'test@example.com'
        },
        license: {
          type: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        },
        homepage: 'https://test.example.com',
        repository: {
          type: 'git',
          url: 'https://github.com/test/extension'
        },
        keywords: ['test', 'extension', 'mplp'],
        category: 'development',
        screenshots: []
      },
      
      // 审计追踪
      auditTrail: {
        enabled: true,
        retentionDays: 90,
        events: []
      },

      // 企业级功能字段
      performanceMetrics: {},
      monitoringIntegration: {},
      versionHistory: {},
      searchMetadata: {},
      eventIntegration: {}
    };

    return new ExtensionEntity({ ...defaultData, ...overrides });
  }

  /**
   * 创建Extension Schema格式数据 (snake_case)
   */
  static createExtensionSchema(overrides: Partial<any> = {}) {
    const defaultSchema = {
      protocol_version: '1.0.0',
      timestamp: '2025-01-01T00:00:00.000Z',
      extension_id: 'ext-test-001',
      context_id: 'ctx-test-001',
      name: 'Test Extension',
      display_name: 'Test Extension Display',
      description: 'Test extension for unit testing',
      version: '1.0.0',
      extension_type: 'plugin',
      status: 'active',
      lifecycle_stage: 'deployed',
      metadata: {
        author: 'Test Factory',
        license: 'MIT',
        homepage: 'https://test.example.com',
        repository: 'https://github.com/test/extension',
        keywords: ['test', 'extension', 'mplp'],
        category: 'development',
        subcategory: 'testing'
      },
      audit_trail: {
        enabled: true,
        retention_days: 90,
        events: []
      }
    };

    return { ...defaultSchema, ...overrides };
  }

  /**
   * 创建批量Extension实体数组
   */
  static createExtensionEntityArray(count: number = 3): ExtensionEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createExtensionEntity({
        extensionId: `ext-test-${String(index + 1).padStart(3, '0')}` as UUID,
        name: `Test Extension ${index + 1}`,
        contextId: `ctx-test-${String(index + 1).padStart(3, '0')}` as UUID
      })
    );
  }

  /**
   * 创建性能测试用的大量数据
   */
  static createPerformanceTestData(count: number = 1000): ExtensionEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createExtensionEntity({
        extensionId: `ext-perf-${String(index + 1).padStart(6, '0')}` as UUID,
        name: `Performance Test Extension ${index + 1}`,
        contextId: `ctx-perf-${String(index + 1).padStart(6, '0')}` as UUID
      })
    );
  }

  /**
   * 创建边界条件测试数据
   */
  static createBoundaryTestData() {
    return {
      minimalExtension: this.createExtensionEntity({
        name: 'Min',
        dependencies: {
          required: [],
          optional: [],
          conflicts: [],
          provides: []
        },
        configuration: {}
      }),
      maximalExtension: this.createExtensionEntity({
        name: 'A'.repeat(255),
        description: 'X'.repeat(1000),
        dependencies: {
          required: Array.from({ length: 50 }, (_, i) => `dep-${i}`),
          optional: Array.from({ length: 25 }, (_, i) => `opt-dep-${i}`),
          conflicts: Array.from({ length: 10 }, (_, i) => `conflict-${i}`),
          provides: Array.from({ length: 20 }, (_, i) => `capability-${i}`)
        }
      })
    };
  }
}
