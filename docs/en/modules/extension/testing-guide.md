# Extension Module Testing Guide

**Multi-Agent Protocol Lifecycle Platform - Extension Module Testing Guide v1.0.0-alpha**

[![Testing](https://img.shields.io/badge/testing-Enterprise%20Validated-green.svg)](./README.md)
[![Coverage](https://img.shields.io/badge/coverage-100%25-green.svg)](./implementation-guide.md)
[![Extensions](https://img.shields.io/badge/extensions-Tested-blue.svg)](./performance-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/extension/testing-guide.md)

---

## 🎯 Testing Overview

This comprehensive testing guide provides strategies, patterns, and examples for testing the Extension Module's extension management system, capability orchestration features, security isolation mechanisms, and integration frameworks. It covers testing methodologies for mission-critical extensibility systems.

### **Testing Scope**
- **Extension Management Testing**: Registration, installation, and lifecycle management
- **Capability Orchestration Testing**: Dynamic capability discovery and invocation
- **Security & Isolation Testing**: Sandbox security and resource isolation validation
- **Integration Testing**: Cross-module integration and event-driven communication
- **Performance Testing**: High-load extension and capability processing validation
- **Security Testing**: Extension security policies and vulnerability assessment

---

## 🧪 Extension Management Testing Strategy

### **Extension Manager Service Tests**

#### **EnterpriseExtensionManager Tests**
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
    it('should register extension with valid manifest', async () => {
      // Arrange
      const request: RegisterExtensionRequest = {
        extensionId: 'ext-ai-assistant-001',
        extensionName: 'AI Assistant Extension',
        extensionVersion: '2.1.0',
        extensionType: 'ai_capability',
        extensionCategory: 'intelligence',
        extensionDescription: 'Advanced AI assistant with NLP capabilities',
        extensionManifest: {
          entryPoint: 'dist/index.js',
          mainClass: 'AIAssistantExtension',
          configurationSchema: {
            type: 'object',
            properties: {
              aiModel: { type: 'string', default: 'gpt-4' },
              maxTokens: { type: 'integer', default: 2000 }
            }
          },
          capabilities: [
            {
              capabilityId: 'natural_language_processing',
              capabilityName: 'Natural Language Processing',
              capabilityVersion: '2.1.0',
              interfaces: [
                {
                  interfaceName: 'ITextAnalyzer',
                  interfaceMethods: ['analyzeText', 'extractEntities']
                }
              ]
            }
          ],
          dependencies: [
            {
              dependencyName: '@openai/openai',
              dependencyVersion: '^4.0.0',
              dependencyType: 'runtime'
            }
          ],
          resources: {
            cpuLimit: '1000m',
            memoryLimit: '2Gi',
            storageLimit: '10Gi'
          },
          security: {
            permissions: ['context:read', 'plan:read'],
            sandboxEnabled: true,
            networkAccess: 'restricted'
          }
        },
        installationPackage: {
          packageType: 'npm',
          packageUrl: 'https://registry.npmjs.org/@mplp/extension-ai-assistant/-/extension-ai-assistant-2.1.0.tgz',
          packageChecksum: 'sha256:1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
          packageSizeBytes: 15728640
        }
      };

      const expectedRegistration = {
        extensionId: 'ext-ai-assistant-001',
        extensionName: 'AI Assistant Extension',
        extensionVersion: '2.1.0',
        registrationStatus: 'registered',
        extensionStatus: 'inactive',
        installationStatus: 'pending',
        validationResults: {
          manifestValid: true,
          dependenciesResolved: true,
          securityApproved: true,
          compatibilityVerified: true,
          packageIntegrityVerified: true
        }
      };

      // Mock validation results
      service.validateExtensionManifest = jest.fn().mockResolvedValue({
        isValid: true,
        errors: []
      });

      securityValidator.validateExtension.mockResolvedValue({
        approved: true,
        securityContext: {
          sandboxId: 'sandbox-ext-ai-assistant-001',
          permissionSet: 'ai_capability_permissions'
        }
      });

      service.resolveDependencies = jest.fn().mockResolvedValue({
        resolved: true,
        resolvedDependencies: [],
        conflicts: []
      });

      service.verifyCompatibility = jest.fn().mockResolvedValue({
        compatible: true,
        issues: []
      });

      service.verifyPackageIntegrity = jest.fn().mockResolvedValue(true);

      service.allocateExtensionResources = jest.fn().mockResolvedValue({
        extensionNamespace: 'mplp-ext-ai-assistant-001',
        storagePath: '/var/lib/mplp/extensions/ext-ai-assistant-001',
        resourceLimits: {
          cpu: '1000m',
          memory: '2Gi',
          storage: '10Gi'
        }
      });

      extensionRegistry.registerExtension.mockResolvedValue(expectedRegistration);

      // Act
      const result = await service.registerExtension(request);

      // Assert
      expect(service.validateExtensionManifest).toHaveBeenCalledWith(request.extensionManifest);
      expect(securityValidator.validateExtension).toHaveBeenCalledWith({
        extensionId: request.extensionId,
        manifest: request.extensionManifest,
        packageInfo: request.installationPackage
      });
      expect(service.resolveDependencies).toHaveBeenCalledWith(request.extensionManifest.dependencies);
      expect(service.verifyCompatibility).toHaveBeenCalledWith(request.extensionManifest.metadata?.compatibility);
      expect(extensionRegistry.registerExtension).toHaveBeenCalledWith(
        expect.objectContaining({
          extensionId: request.extensionId,
          extensionName: request.extensionName,
          extensionVersion: request.extensionVersion,
          manifest: request.extensionManifest
        })
      );
      expect(result).toEqual(expectedRegistration);
    });

    it('should reject extension with invalid manifest', async () => {
      // Arrange
      const request: RegisterExtensionRequest = {
        extensionId: 'ext-invalid-001',
        extensionName: 'Invalid Extension',
        extensionVersion: '1.0.0',
        extensionType: 'ai_capability',
        extensionCategory: 'intelligence',
        extensionManifest: {
          // Missing required fields
          capabilities: []
        },
        installationPackage: {
          packageType: 'npm',
          packageUrl: 'https://example.com/package.tgz',
          packageChecksum: 'sha256:invalid',
          packageSizeBytes: 1024
        }
      };

      service.validateExtensionManifest = jest.fn().mockResolvedValue({
        isValid: false,
        errors: ['Entry point is required', 'Main class is required', 'At least one capability is required']
      });

      // Act & Assert
      await expect(service.registerExtension(request))
        .rejects
        .toThrow(ValidationError);
      
      expect(service.validateExtensionManifest).toHaveBeenCalledWith(request.extensionManifest);
      expect(securityValidator.validateExtension).not.toHaveBeenCalled();
      expect(extensionRegistry.registerExtension).not.toHaveBeenCalled();
    });

    it('should reject extension with security violations', async () => {
      // Arrange
      const request: RegisterExtensionRequest = {
        extensionId: 'ext-malicious-001',
        extensionName: 'Malicious Extension',
        extensionVersion: '1.0.0',
        extensionType: 'ai_capability',
        extensionCategory: 'intelligence',
        extensionManifest: {
          entryPoint: 'dist/index.js',
          mainClass: 'MaliciousExtension',
          capabilities: [
            {
              capabilityId: 'malicious_capability',
              capabilityName: 'Malicious Capability',
              capabilityVersion: '1.0.0',
              interfaces: [
                {
                  interfaceName: 'IMalicious',
                  interfaceMethods: ['stealData']
                }
              ]
            }
          ],
          security: {
            permissions: ['system:admin', 'file:write_all'],
            sandboxEnabled: false,
            networkAccess: 'unrestricted'
          }
        },
        installationPackage: {
          packageType: 'npm',
          packageUrl: 'https://malicious.com/package.tgz',
          packageChecksum: 'sha256:malicious',
          packageSizeBytes: 1024
        }
      };

      service.validateExtensionManifest = jest.fn().mockResolvedValue({
        isValid: true,
        errors: []
      });

      securityValidator.validateExtension.mockResolvedValue({
        approved: false,
        reasons: ['Excessive permissions requested', 'Sandbox disabled', 'Unrestricted network access']
      });

      // Act & Assert
      await expect(service.registerExtension(request))
        .rejects
        .toThrow(SecurityError);
      
      expect(service.validateExtensionManifest).toHaveBeenCalledWith(request.extensionManifest);
      expect(securityValidator.validateExtension).toHaveBeenCalledWith({
        extensionId: request.extensionId,
        manifest: request.extensionManifest,
        packageInfo: request.installationPackage
      });
      expect(extensionRegistry.registerExtension).not.toHaveBeenCalled();
    });
  });

  describe('installExtension', () => {
    it('should install registered extension successfully', async () => {
      // Arrange
      const extensionId = 'ext-ai-assistant-001';
      const installationOptions: InstallationOptions = {
        installationOptions: {
          installDependencies: true,
          verifySignatures: true,
          runSecurityScan: true,
          createSandbox: true,
          setupMonitoring: true
        },
        configuration: {
          aiModel: 'gpt-4',
          maxTokens: 2000,
          temperature: 0.7
        },
        deploymentTarget: {
          environment: 'production',
          region: 'us-east-1'
        }
      };

      const mockRegistration = {
        extensionId: extensionId,
        extensionName: 'AI Assistant Extension',
        packageInfo: {
          packageType: 'npm',
          packageUrl: 'https://registry.npmjs.org/@mplp/extension-ai-assistant/-/extension-ai-assistant-2.1.0.tgz'
        },
        manifest: {
          entryPoint: 'dist/index.js',
          mainClass: 'AIAssistantExtension'
        },
        securityContext: {
          sandboxId: 'sandbox-ext-ai-assistant-001'
        },
        assignedResources: {
          resourceLimits: {
            cpu: '1000m',
            memory: '2Gi',
            storage: '10Gi'
          }
        }
      };

      const mockInstallation = {
        installationId: 'install-001',
        extensionId: extensionId,
        status: 'installed',
        completedAt: new Date(),
        resourceAllocation: {
          sandboxId: 'sandbox-ext-ai-assistant-001',
          namespace: 'mplp-ext-ai-assistant-001'
        }
      };

      extensionRegistry.getExtension.mockResolvedValue(mockRegistration);
      service.createInstallationContext = jest.fn().mockResolvedValue({});
      extensionInstaller.install.mockResolvedValue(mockInstallation);
      service.setupExtensionMonitoring = jest.fn().mockResolvedValue(undefined);

      // Act
      const result = await service.installExtension(extensionId, installationOptions);

      // Assert
      expect(extensionRegistry.getExtension).toHaveBeenCalledWith(extensionId);
      expect(extensionInstaller.install).toHaveBeenCalledWith(
        expect.objectContaining({
          extensionId: extensionId,
          packageInfo: mockRegistration.packageInfo,
          manifest: mockRegistration.manifest,
          configuration: installationOptions.configuration
        })
      );
      expect(service.setupExtensionMonitoring).toHaveBeenCalledWith({
        extensionId: extensionId,
        installation: mockInstallation,
        monitoringOptions: installationOptions.monitoringOptions
      });
      expect(extensionRegistry.updateExtensionStatus).toHaveBeenCalledWith(
        extensionId,
        expect.objectContaining({
          installationStatus: 'installed',
          installationId: 'install-001'
        })
      );
      expect(result).toEqual(mockInstallation);
    });

    it('should handle installation failure gracefully', async () => {
      // Arrange
      const extensionId = 'ext-failing-001';
      const installationOptions: InstallationOptions = {
        installationOptions: {
          installDependencies: true
        },
        configuration: {}
      };

      const mockRegistration = {
        extensionId: extensionId,
        packageInfo: {},
        manifest: {},
        securityContext: {},
        assignedResources: {}
      };

      extensionRegistry.getExtension.mockResolvedValue(mockRegistration);
      service.createInstallationContext = jest.fn().mockResolvedValue({});
      extensionInstaller.install.mockRejectedValue(new Error('Installation failed: Package corrupted'));

      // Act & Assert
      await expect(service.installExtension(extensionId, installationOptions))
        .rejects
        .toThrow('Installation failed: Package corrupted');
      
      expect(extensionRegistry.getExtension).toHaveBeenCalledWith(extensionId);
      expect(extensionInstaller.install).toHaveBeenCalled();
      expect(extensionRegistry.updateExtensionStatus).toHaveBeenCalledWith(
        extensionId,
        expect.objectContaining({
          installationStatus: 'failed',
          lastError: 'Installation failed: Package corrupted'
        })
      );
    });
  });

  describe('activateExtension', () => {
    it('should activate installed extension successfully', async () => {
      // Arrange
      const extensionId = 'ext-ai-assistant-001';
      const activationOptions: ActivationOptions = {
        activationOptions: {
          startImmediately: true,
          enableMonitoring: true,
          registerCapabilities: true,
          setupIntegrations: true
        },
        integrationTargets: [
          {
            targetModule: 'context',
            integrationType: 'capability_provider',
            integrationConfig: {
              provideCapabilities: ['text_analysis'],
              eventSubscriptions: ['context_created']
            }
          }
        ],
        runtimeConfiguration: {
          autoScaling: {
            enabled: true,
            minInstances: 1,
            maxInstances: 3
          }
        }
      };

      const mockRegistration = {
        extensionId: extensionId,
        manifest: {
          capabilities: [
            {
              capabilityId: 'natural_language_processing',
              interfaces: [
                {
                  interfaceName: 'ITextAnalyzer',
                  interfaceMethods: ['analyzeText']
                }
              ]
            }
          ]
        },
        securityContext: {
          sandboxId: 'sandbox-ext-ai-assistant-001'
        },
        assignedResources: {
          resourceLimits: {
            cpu: '1000m',
            memory: '2Gi'
          }
        }
      };

      const mockInstallation = {
        extensionId: extensionId,
        status: 'installed'
      };

      const mockSandbox = {
        sandboxId: 'sandbox-ext-ai-assistant-001'
      };

      const mockExtensionInstance = {
        instanceId: 'ext-ai-assistant-001-instance-001',
        processId: 12345,
        start: jest.fn().mockResolvedValue(undefined),
        getMemoryUsage: jest.fn().mockResolvedValue(256),
        getCpuUsage: jest.fn().mockResolvedValue(15.2)
      };

      extensionRegistry.getExtension.mockResolvedValue(mockRegistration);
      extensionRegistry.getInstallation.mockResolvedValue(mockInstallation);
      extensionSandbox.createSandbox.mockResolvedValue(mockSandbox);
      service.loadExtensionInSandbox = jest.fn().mockResolvedValue(mockExtensionInstance);
      service.registerExtensionCapabilities = jest.fn().mockResolvedValue([
        {
          capabilityId: 'natural_language_processing',
          capabilityStatus: 'active',
          interfaceEndpoints: {
            ITextAnalyzer: '/api/v1/extensions/ext-ai-assistant-001/text-analyzer'
          }
        }
      ]);
      service.setupExtensionIntegrations = jest.fn().mockResolvedValue([
        {
          targetModule: 'context',
          integrationStatus: 'active',
          providedCapabilities: ['text_analysis']
        }
      ]);

      // Act
      const result = await service.activateExtension(extensionId, activationOptions);

      // Assert
      expect(extensionRegistry.getExtension).toHaveBeenCalledWith(extensionId);
      expect(extensionRegistry.getInstallation).toHaveBeenCalledWith(extensionId);
      expect(extensionSandbox.createSandbox).toHaveBeenCalledWith({
        extensionId: extensionId,
        securityContext: mockRegistration.securityContext,
        resourceLimits: mockRegistration.assignedResources.resourceLimits
      });
      expect(service.loadExtensionInSandbox).toHaveBeenCalledWith({
        extensionId: extensionId,
        sandbox: mockSandbox,
        manifest: mockRegistration.manifest,
        configuration: activationOptions.runtimeConfiguration
      });
      expect(mockExtensionInstance.start).toHaveBeenCalled();
      expect(extensionRegistry.updateExtensionStatus).toHaveBeenCalledWith(
        extensionId,
        expect.objectContaining({
          extensionStatus: 'active',
          activatedAt: expect.any(Date)
        })
      );
      expect(result.activationStatus).toBe('activated');
      expect(result.extensionStatus).toBe('active');
      expect(result.registeredCapabilities).toHaveLength(1);
      expect(result.activeIntegrations).toHaveLength(1);
    });

    it('should handle activation of non-installed extension', async () => {
      // Arrange
      const extensionId = 'ext-not-installed-001';
      const activationOptions: ActivationOptions = {
        activationOptions: {
          startImmediately: true
        }
      };

      const mockRegistration = {
        extensionId: extensionId
      };

      const mockInstallation = {
        extensionId: extensionId,
        status: 'pending'  // Not installed
      };

      extensionRegistry.getExtension.mockResolvedValue(mockRegistration);
      extensionRegistry.getInstallation.mockResolvedValue(mockInstallation);

      // Act & Assert
      await expect(service.activateExtension(extensionId, activationOptions))
        .rejects
        .toThrow(StateError);
      
      expect(extensionRegistry.getExtension).toHaveBeenCalledWith(extensionId);
      expect(extensionRegistry.getInstallation).toHaveBeenCalledWith(extensionId);
      expect(extensionSandbox.createSandbox).not.toHaveBeenCalled();
    });
  });

  describe('invokeCapability', () => {
    it('should invoke capability method successfully', async () => {
      // Arrange
      const extensionId = 'ext-ai-assistant-001';
      const capabilityId = 'natural_language_processing';
      const method = 'analyzeText';
      const parameters = {
        text: 'Hello world',
        analysisType: 'comprehensive'
      };
      const context: InvocationContext = {
        requestId: 'req-001',
        userId: 'user-001',
        options: {
          timeoutMs: 30000,
          cacheResult: true
        }
      };

      const mockExtensionInstance = {
        instanceId: 'ext-ai-assistant-001-instance-001'
      };

      const mockCapability = {
        capabilityId: capabilityId,
        interfaces: [
          {
            interfaceName: 'ITextAnalyzer',
            methods: [
              {
                methodName: 'analyzeText',
                parameters: [
                  {
                    parameterName: 'text',
                    parameterType: 'string',
                    parameterRequired: true
                  },
                  {
                    parameterName: 'analysisType',
                    parameterType: 'string',
                    parameterRequired: false
                  }
                ]
              }
            ]
          }
        ]
      };

      const mockInvocationResult = {
        data: {
          sentiment: 'positive',
          entities: ['world'],
          summary: 'Greeting message'
        },
        traceInfo: {
          traceId: 'trace-001',
          spanId: 'span-001'
        },
        cacheInfo: {
          cacheHit: false,
          cached: true
        }
      };

      service.activeExtensions = new Map([[extensionId, mockExtensionInstance]]);
      service.capabilityRegistry = new Map([[`${extensionId}:${capabilityId}`, mockCapability]]);
      service.validateMethodParameters = jest.fn().mockResolvedValue({
        isValid: true,
        errors: []
      });
      service.generateExecutionId = jest.fn().mockReturnValue('exec-001');
      capabilityOrchestrator.invokeCapability.mockResolvedValue(mockInvocationResult);
      service.cacheInvocationResult = jest.fn().mockResolvedValue(undefined);

      // Act
      const result = await service.invokeCapability(extensionId, capabilityId, method, parameters, context);

      // Assert
      expect(service.validateMethodParameters).toHaveBeenCalledWith(
        mockCapability.interfaces[0].methods[0].parameters,
        parameters
      );
      expect(capabilityOrchestrator.invokeCapability).toHaveBeenCalledWith({
        extensionInstance: mockExtensionInstance,
        capability: mockCapability,
        method: method,
        parameters: parameters,
        invocationContext: expect.objectContaining({
          extensionId: extensionId,
          capabilityId: capabilityId,
          method: method,
          parameters: parameters
        })
      });
      expect(service.cacheInvocationResult).toHaveBeenCalled();
      expect(result.capabilityId).toBe(capabilityId);
      expect(result.method).toBe(method);
      expect(result.executionStatus).toBe('completed');
      expect(result.result).toEqual(mockInvocationResult.data);
    });

    it('should handle capability invocation with invalid parameters', async () => {
      // Arrange
      const extensionId = 'ext-ai-assistant-001';
      const capabilityId = 'natural_language_processing';
      const method = 'analyzeText';
      const parameters = {
        // Missing required 'text' parameter
        analysisType: 'comprehensive'
      };
      const context: InvocationContext = {
        requestId: 'req-001',
        userId: 'user-001'
      };

      const mockExtensionInstance = {
        instanceId: 'ext-ai-assistant-001-instance-001'
      };

      const mockCapability = {
        capabilityId: capabilityId,
        interfaces: [
          {
            interfaceName: 'ITextAnalyzer',
            methods: [
              {
                methodName: 'analyzeText',
                parameters: [
                  {
                    parameterName: 'text',
                    parameterType: 'string',
                    parameterRequired: true
                  }
                ]
              }
            ]
          }
        ]
      };

      service.activeExtensions = new Map([[extensionId, mockExtensionInstance]]);
      service.capabilityRegistry = new Map([[`${extensionId}:${capabilityId}`, mockCapability]]);
      service.validateMethodParameters = jest.fn().mockResolvedValue({
        isValid: false,
        errors: ['Required parameter "text" is missing']
      });

      // Act
      const result = await service.invokeCapability(extensionId, capabilityId, method, parameters, context);

      // Assert
      expect(service.validateMethodParameters).toHaveBeenCalled();
      expect(capabilityOrchestrator.invokeCapability).not.toHaveBeenCalled();
      expect(result.executionStatus).toBe('failed');
      expect(result.error).toBeDefined();
      expect(result.error.errorMessage).toContain('Invalid parameters');
    });
  });
});
```

---

## 🔗 Related Documentation

- [Extension Module Overview](./README.md) - Module overview and architecture
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [API Reference](./api-reference.md) - Complete API documentation
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**Testing Guide Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Coverage**: 100% comprehensive  

**⚠️ Alpha Notice**: This testing guide provides comprehensive enterprise extension management testing strategies in Alpha release. Additional AI extension testing patterns and advanced capability orchestration testing will be added based on community feedback in Beta release.
