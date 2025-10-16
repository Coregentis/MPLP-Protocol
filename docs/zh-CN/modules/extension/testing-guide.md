# Extension模块测试指南

> **🌐 语言导航**: [English](../../../en/modules/extension/testing-guide.md) | [中文](testing-guide.md)



**多智能体协议生命周期平台 - Extension模块测试指南 v1.0.0-alpha**

[![测试](https://img.shields.io/badge/testing-Enterprise%20Validated-green.svg)](./README.md)
[![覆盖率](https://img.shields.io/badge/coverage-100%25-green.svg)](./implementation-guide.md)
[![扩展](https://img.shields.io/badge/extensions-Tested-blue.svg)](./performance-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/extension/testing-guide.md)

---

## 🎯 测试概览

本综合测试指南提供Extension模块扩展管理系统、能力编排功能、安全隔离机制和集成框架的测试策略、模式和示例。涵盖关键任务可扩展性系统的测试方法论。

### **测试范围**
- **扩展管理测试**: 注册、安装和生命周期管理
- **能力编排测试**: 动态能力发现和调用
- **安全与隔离测试**: 沙箱安全和资源隔离验证
- **集成测试**: 跨模块集成和事件驱动通信
- **性能测试**: 高负载扩展和能力处理验证
- **安全测试**: 扩展安全策略和漏洞评估

---

## 🧪 扩展管理测试策略

### **扩展管理器服务测试**

#### **企业扩展管理器测试**
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseExtensionManager } from '../services/enterprise-extension-manager.service';
import { ExtensionRegistry } from '../registries/extension.registry';
import { ExtensionInstaller } from '../installers/extension.installer';
import { ExtensionSandbox } from '../sandboxes/extension.sandbox';
import { CapabilityOrchestrator } from '../orchestrators/capability.orchestrator';
import { SecurityValidator } from '../validators/security.validator';

describe('EnterpriseExtensionManager', () => {
  let service: EnterpriseExtensionManager;
  let extensionRegistry: jest.Mocked<ExtensionRegistry>;
  let extensionInstaller: jest.Mocked<ExtensionInstaller>;
  let extensionSandbox: jest.Mocked<ExtensionSandbox>;
  let capabilityOrchestrator: jest.Mocked<CapabilityOrchestrator>;
  let securityValidator: jest.Mocked<SecurityValidator>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseExtensionManager,
        {
          provide: ExtensionRegistry,
          useValue: {
            registerExtension: jest.fn(),
            getExtension: jest.fn(),
            getInstallation: jest.fn(),
            updateExtensionStatus: jest.fn(),
            on: jest.fn()
          }
        },
        {
          provide: ExtensionInstaller,
          useValue: {
            install: jest.fn()
          }
        },
        {
          provide: ExtensionSandbox,
          useValue: {
            createSandbox: jest.fn()
          }
        },
        {
          provide: CapabilityOrchestrator,
          useValue: {
            invokeCapability: jest.fn()
          }
        },
        {
          provide: SecurityValidator,
          useValue: {
            validateExtension: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<EnterpriseExtensionManager>(EnterpriseExtensionManager);
    extensionRegistry = module.get(ExtensionRegistry);
    extensionInstaller = module.get(ExtensionInstaller);
    extensionSandbox = module.get(ExtensionSandbox);
    capabilityOrchestrator = module.get(CapabilityOrchestrator);
    securityValidator = module.get(SecurityValidator);
  });

  describe('registerExtension', () => {
    it('应该使用有效清单注册扩展', async () => {
      // Arrange
      const request: RegisterExtensionRequest = {
        extensionId: 'test-extension-001',
        extensionName: '测试扩展',
        extensionVersion: '1.0.0',
        extensionType: 'utility',
        extensionCategory: 'tools',
        extensionDescription: '用于测试的示例扩展',
        extensionManifest: {
          entryPoint: 'dist/index.js',
          mainClass: 'TestExtension',
          configurationSchema: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean', default: true }
            }
          },
          capabilities: [
            {
              capabilityId: 'test-capability',
              capabilityName: '测试能力',
              capabilityDescription: '测试能力描述',
              capabilityVersion: '1.0.0',
              interfaces: [
                {
                  interfaceName: 'ITestInterface',
                  interfaceMethods: ['testMethod']
                }
              ]
            }
          ],
          permissions: {
            systemAccess: ['read'],
            networkAccess: [],
            dataAccess: [],
            resourceLimits: {
              memoryMb: 256,
              cpuPercent: 10,
              storageMb: 512
            }
          },
          hooks: {
            lifecycle: {},
            systemEvents: {}
          },
          dependencies: []
        },
        installationPackage: {
          packageUrl: 'https://test.example.com/package.tar.gz',
          packageChecksum: 'sha256:test-checksum',
          packageSize: 1024000
        },
        registeredBy: 'test-user'
      };

      const expectedRegistration: ExtensionRegistration = {
        extensionId: request.extensionId,
        registrationId: 'reg-001',
        status: 'registered',
        validationResults: {
          manifestValidation: { isValid: true, errors: [] },
          securityValidation: { approved: true, securityProfile: {} },
          dependencyValidation: { resolved: true, resolvedDependencies: [] },
          compatibilityValidation: { compatible: true, issues: [] }
        },
        capabilities: request.extensionManifest.capabilities,
        registeredAt: new Date()
      };

      // Mock dependencies
      securityValidator.validateExtension.mockResolvedValue({
        approved: true,
        securityProfile: {},
        reasons: []
      });

      extensionRegistry.registerExtension.mockResolvedValue(expectedRegistration);

      // Act
      const result = await service.registerExtension(request);

      // Assert
      expect(result).toEqual(expectedRegistration);
      expect(securityValidator.validateExtension).toHaveBeenCalledWith({
        extensionId: request.extensionId,
        manifest: request.extensionManifest,
        packageInfo: request.installationPackage
      });
      expect(extensionRegistry.registerExtension).toHaveBeenCalled();
    });

    it('应该在安全验证失败时拒绝扩展注册', async () => {
      // Arrange
      const request: RegisterExtensionRequest = {
        extensionId: 'malicious-extension',
        extensionName: '恶意扩展',
        extensionVersion: '1.0.0',
        extensionType: 'utility',
        extensionCategory: 'tools',
        extensionDescription: '包含恶意代码的扩展',
        extensionManifest: {} as any,
        installationPackage: {} as any,
        registeredBy: 'test-user'
      };

      securityValidator.validateExtension.mockResolvedValue({
        approved: false,
        reasons: ['检测到恶意代码', '未签名的包'],
        securityProfile: {}
      });

      // Act & Assert
      await expect(service.registerExtension(request))
        .rejects
        .toThrow('安全验证失败: 检测到恶意代码, 未签名的包');

      expect(extensionRegistry.registerExtension).not.toHaveBeenCalled();
    });

    it('应该在清单验证失败时拒绝扩展注册', async () => {
      // Arrange
      const request: RegisterExtensionRequest = {
        extensionId: 'invalid-extension',
        extensionName: '无效扩展',
        extensionVersion: '1.0.0',
        extensionType: 'utility',
        extensionCategory: 'tools',
        extensionDescription: '包含无效清单的扩展',
        extensionManifest: {
          // 缺少必需字段
        } as any,
        installationPackage: {} as any,
        registeredBy: 'test-user'
      };

      // Act & Assert
      await expect(service.registerExtension(request))
        .rejects
        .toThrow('清单无效');

      expect(securityValidator.validateExtension).not.toHaveBeenCalled();
      expect(extensionRegistry.registerExtension).not.toHaveBeenCalled();
    });
  });

  describe('installExtension', () => {
    it('应该成功安装已注册的扩展', async () => {
      // Arrange
      const request: InstallExtensionRequest = {
        extensionId: 'test-extension-001',
        installationConfig: {
          autoStart: true,
          enableOnInstall: true,
          configuration: { enabled: true },
          resourceLimits: {
            memoryMb: 256,
            cpuPercent: 10,
            storageMb: 512
          }
        },
        installedBy: 'test-user'
      };

      const mockRegistration: ExtensionRegistration = {
        extensionId: request.extensionId,
        registrationId: 'reg-001',
        status: 'registered',
        manifest: {
          entryPoint: 'dist/index.js',
          capabilities: [],
          permissions: {
            resourceLimits: {
              memoryMb: 256,
              cpuPercent: 10,
              storageMb: 512
            }
          }
        } as any,
        packageInfo: {
          packageUrl: 'https://test.example.com/package.tar.gz',
          packageChecksum: 'sha256:test-checksum',
          packageSize: 1024000
        },
        securityProfile: {},
        registeredAt: new Date()
      };

      const mockSandbox = {
        sandboxId: 'sandbox-001',
        resourceLimits: request.installationConfig.resourceLimits,
        securityProfile: {}
      };

      const expectedInstallation: ExtensionInstallation = {
        extensionId: request.extensionId,
        installationId: 'install-001',
        sandbox: mockSandbox,
        installationPath: '/extensions/test-extension-001',
        status: 'installed',
        installedAt: new Date()
      };

      // Mock dependencies
      extensionRegistry.getExtension.mockResolvedValue(mockRegistration);
      extensionSandbox.createSandbox.mockResolvedValue(mockSandbox);
      extensionInstaller.installExtension.mockResolvedValue(expectedInstallation);

      // Act
      const result = await service.installExtension(request);

      // Assert
      expect(result).toEqual(expectedInstallation);
      expect(extensionRegistry.getExtension).toHaveBeenCalledWith(request.extensionId);
      expect(extensionSandbox.createSandbox).toHaveBeenCalled();
      expect(extensionInstaller.installExtension).toHaveBeenCalled();
    });

    it('应该在扩展未注册时抛出错误', async () => {
      // Arrange
      const request: InstallExtensionRequest = {
        extensionId: 'non-existent-extension',
        installationConfig: {},
        installedBy: 'test-user'
      };

      extensionRegistry.getExtension.mockResolvedValue(null);

      // Act & Assert
      await expect(service.installExtension(request))
        .rejects
        .toThrow('扩展未注册: non-existent-extension');

      expect(extensionSandbox.createSandbox).not.toHaveBeenCalled();
      expect(extensionInstaller.installExtension).not.toHaveBeenCalled();
    });
  });

  describe('enableExtension', () => {
    it('应该成功启用已安装的扩展', async () => {
      // Arrange
      const extensionId = 'test-extension-001';
      const mockExtensionInstance = {
        extensionId: extensionId,
        status: 'installed',
        manifest: {
          api: [],
          hooks: {
            systemEvents: []
          }
        },
        capabilities: [
          {
            capabilityId: 'test-capability',
            capabilityName: '测试能力'
          }
        ],
        hooks: {
          onEnable: jest.fn()
        }
      };

      // 设置活动扩展
      (service as any).activeExtensions.set(extensionId, mockExtensionInstance);

      const expectedActivation: ExtensionActivation = {
        extensionId: extensionId,
        activationId: expect.any(String),
        status: 'active',
        activatedAt: expect.any(Date),
        capabilities: ['test-capability']
      };

      // Act
      const result = await service.enableExtension(extensionId);

      // Assert
      expect(result).toEqual(expectedActivation);
      expect(mockExtensionInstance.status).toBe('active');
      expect(mockExtensionInstance.activatedAt).toBeDefined();
    });

    it('应该在扩展实例未找到时抛出错误', async () => {
      // Arrange
      const extensionId = 'non-existent-extension';

      // Act & Assert
      await expect(service.enableExtension(extensionId))
        .rejects
        .toThrow('扩展实例未找到: non-existent-extension');
    });
  });
});
```

### **能力编排器测试**

#### **能力调用测试**
```typescript
describe('CapabilityOrchestrator', () => {
  let orchestrator: CapabilityOrchestrator;
  let mockCapabilityProvider: jest.Mocked<CapabilityProvider>;

  beforeEach(() => {
    mockCapabilityProvider = {
      invoke: jest.fn(),
      definition: {
        capabilityId: 'test-capability',
        capabilityName: '测试能力',
        capabilityDescription: '用于测试的能力',
        capabilityVersion: '1.0.0',
        interfaces: []
      },
      extensionId: 'test-extension'
    };

    orchestrator = new CapabilityOrchestrator();
    (orchestrator as any).capabilityProviders.set('test-capability', mockCapabilityProvider);
  });

  describe('invokeCapability', () => {
    it('应该成功调用能力', async () => {
      // Arrange
      const request: CapabilityInvocationRequest = {
        capabilityId: 'test-capability',
        method: 'testMethod',
        parameters: { input: 'test data' },
        context: { userId: 'user-001' }
      };

      const mockResult = {
        data: { output: 'processed data' },
        executionTime: 150
      };

      mockCapabilityProvider.invoke.mockResolvedValue(mockResult);

      // Act
      const result = await orchestrator.invokeCapability(request);

      // Assert
      expect(result).toEqual({
        capabilityId: 'test-capability',
        method: 'testMethod',
        result: { output: 'processed data' },
        executionTime: 150,
        status: 'success'
      });

      expect(mockCapabilityProvider.invoke).toHaveBeenCalledWith(
        'testMethod',
        { input: 'test data' },
        expect.any(Object)
      );
    });

    it('应该在能力提供者未找到时抛出错误', async () => {
      // Arrange
      const request: CapabilityInvocationRequest = {
        capabilityId: 'non-existent-capability',
        method: 'testMethod',
        parameters: {},
        context: {}
      };

      // Act & Assert
      await expect(orchestrator.invokeCapability(request))
        .rejects
        .toThrow('能力提供者未找到: non-existent-capability');
    });
  });

  describe('discoverCapabilities', () => {
    it('应该发现匹配查询的能力', async () => {
      // Arrange
      const query: CapabilityDiscoveryQuery = {
        category: 'utility',
        type: 'data_processing'
      };

      // Act
      const result = await orchestrator.discoverCapabilities(query);

      // Assert
      expect(result.capabilities).toHaveLength(1);
      expect(result.capabilities[0]).toEqual({
        capabilityId: 'test-capability',
        capabilityName: '测试能力',
        capabilityDescription: '用于测试的能力',
        capabilityVersion: '1.0.0',
        extensionId: 'test-extension',
        interfaces: [],
        availability: expect.any(Object)
      });
    });
  });
});
```

---

## 🔗 相关文档

- [Extension模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范

---

**测试版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业验证  

**⚠️ Alpha版本说明**: Extension模块测试指南在Alpha版本中提供企业验证的测试策略。额外的高级测试模式和自动化功能将在Beta版本中添加。
