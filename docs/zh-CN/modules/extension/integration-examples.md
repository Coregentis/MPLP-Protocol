# Extension模块集成示例

> **🌐 语言导航**: [English](../../../en/modules/extension/integration-examples.md) | [中文](integration-examples.md)



**多智能体协议生命周期平台 - Extension模块集成示例 v1.0.0-alpha**

[![集成](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![示例](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![扩展](https://img.shields.io/badge/extensions-Best%20Practices-orange.svg)](./api-reference.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/extension/integration-examples.md)

---

## 🎯 集成概览

本文档提供Extension模块的全面集成示例，展示真实世界的企业扩展管理场景、跨模块能力集成模式，以及使用MPLP Extension模块构建综合可扩展性系统的最佳实践。

### **集成场景**
- **企业扩展平台**: 具有AI能力的完整扩展管理
- **多租户扩展系统**: 可扩展的多组织扩展托管
- **跨模块集成**: 与Context、Plan、Confirm和Trace模块的集成
- **实时能力平台**: 高性能能力编排
- **AI驱动的扩展生态系统**: 机器学习增强的扩展管理
- **安全扩展市场**: 企业级扩展分发和安全

---

## 🚀 基础集成示例

### **1. 企业扩展平台**

#### **Express.js与全面扩展管理**
```typescript
import express from 'express';
import { ExtensionModule } from '@mplp/extension';
import { EnterpriseExtensionManager } from '@mplp/extension/services';
import { ExtensionMiddleware } from '@mplp/extension/middleware';
import { CapabilityOrchestrator } from '@mplp/extension/orchestrators';

// 初始化Express应用
const app = express();
app.use(express.json());

// 初始化具有企业功能的Extension模块
const extensionModule = new ExtensionModule({
  extensionRegistry: {
    backend: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: true
    },
    validation: {
      strictMode: true,
      validateSecurity: true,
      validateCompatibility: true,
      validatePackageIntegrity: true
    }
  },
  extensionSandbox: {
    sandboxType: 'container',
    containerSandbox: {
      runtime: 'containerd',
      imageBase: 'mplp/extension-sandbox:1.0.0-alpha',
      defaultLimits: {
        cpu: '2000m',
        memory: '4Gi',
        storage: '20Gi'
      },
      security: {
        runAsNonRoot: true,
        readOnlyRootFilesystem: true,
        dropCapabilities: ['ALL'],
        seccompProfile: 'runtime/default'
      }
    }
  },
  capabilityOrchestration: {
    orchestrator: {
      maxConcurrentInvocations: 1000,
      invocationTimeout: 30000,
      enableCaching: true,
      enableTracing: true
    },
    loadBalancing: {
      strategy: 'least_connections',
      healthCheckEnabled: true,
      circuitBreakerEnabled: true
    }
  },
  security: {
    authentication: {
      required: true,
      methods: ['jwt'],
      jwtSecret: process.env.JWT_SECRET
    },
    extensionSecurity: {
      codeSigningRequired: true,
      vulnerabilityScanning: true,
      sandboxIsolation: true,
      resourceLimits: {
        memory: '1Gi',
        cpu: '1000m',
        storage: '10Gi'
      }
    }
  }
});

// 获取Extension服务实例
const extensionManager = extensionModule.getExtensionManager();
const capabilityOrchestrator = extensionModule.getCapabilityOrchestrator();

// 应用Extension中间件
app.use('/api/extensions', ExtensionMiddleware.authenticate());
app.use('/api/extensions', ExtensionMiddleware.rateLimit({
  maxRequestsPerMinute: 100,
  maxInstallationsPerHour: 10
}));

// 注册企业扩展
app.post('/api/extensions/register', async (req, res) => {
  try {
    const registration = await extensionManager.registerExtension({
      extensionId: req.body.extensionId,
      extensionName: req.body.extensionName,
      extensionVersion: req.body.extensionVersion,
      extensionType: req.body.extensionType,
      extensionCategory: req.body.extensionCategory,
      extensionDescription: req.body.extensionDescription,
      extensionManifest: {
        entryPoint: req.body.manifest.entryPoint,
        mainClass: req.body.manifest.mainClass,
        configurationSchema: req.body.manifest.configurationSchema,
        capabilities: req.body.manifest.capabilities,
        permissions: {
          systemAccess: req.body.manifest.permissions.systemAccess,
          networkAccess: req.body.manifest.permissions.networkAccess,
          dataAccess: req.body.manifest.permissions.dataAccess,
          resourceLimits: {
            memoryMb: req.body.manifest.permissions.resourceLimits.memoryMb,
            cpuPercent: req.body.manifest.permissions.resourceLimits.cpuPercent,
            storageMb: req.body.manifest.permissions.resourceLimits.storageMb
          }
        },
        hooks: {
          lifecycle: req.body.manifest.hooks.lifecycle,
          systemEvents: req.body.manifest.hooks.systemEvents
        },
        dependencies: req.body.manifest.dependencies
      },
      installationPackage: {
        packageUrl: req.body.package.packageUrl,
        packageChecksum: req.body.package.packageChecksum,
        packageSize: req.body.package.packageSize
      },
      registeredBy: req.user.id
    });

    res.status(201).json({
      extensionId: registration.extensionId,
      registrationId: registration.registrationId,
      status: registration.status,
      validationResults: registration.validationResults,
      capabilities: registration.capabilities.map(cap => ({
        capabilityId: cap.capabilityId,
        capabilityName: cap.capabilityName,
        interfaces: cap.interfaces
      })),
      registeredAt: registration.registeredAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 安装扩展
app.post('/api/extensions/:extensionId/install', async (req, res) => {
  try {
    const installation = await extensionManager.installExtension({
      extensionId: req.params.extensionId,
      installationConfig: {
        autoStart: req.body.autoStart || false,
        enableOnInstall: req.body.enableOnInstall || false,
        configuration: req.body.configuration || {},
        resourceLimits: req.body.resourceLimits
      },
      installationOptions: {
        forceReinstall: req.body.forceReinstall || false,
        skipDependencies: req.body.skipDependencies || false,
        backupExisting: req.body.backupExisting || true
      },
      installedBy: req.user.id
    });

    res.status(201).json({
      extensionId: installation.extensionId,
      installationId: installation.installationId,
      status: installation.status,
      sandboxInfo: {
        sandboxId: installation.sandbox.sandboxId,
        resourceLimits: installation.sandbox.resourceLimits,
        securityProfile: installation.sandbox.securityProfile
      },
      installedAt: installation.installedAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 调用扩展能力
app.post('/api/extensions/:extensionId/capabilities/:capabilityId/invoke', async (req, res) => {
  try {
    const result = await capabilityOrchestrator.invokeCapability({
      capabilityId: `${req.params.extensionId}:${req.params.capabilityId}`,
      method: req.body.method,
      parameters: req.body.parameters,
      context: {
        userId: req.user.id,
        sessionId: req.sessionId,
        requestId: req.headers['x-request-id']
      },
      options: {
        timeout: req.body.timeout || 30000,
        retryAttempts: req.body.retryAttempts || 3,
        enableCaching: req.body.enableCaching !== false
      }
    });

    res.json({
      capabilityId: result.capabilityId,
      method: result.method,
      result: result.result,
      executionTime: result.executionTime,
      status: result.status,
      metadata: {
        cached: result.cached || false,
        retryCount: result.retryCount || 0,
        resourceUsage: result.resourceUsage
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取扩展能力列表
app.get('/api/extensions/capabilities', async (req, res) => {
  try {
    const capabilities = await capabilityOrchestrator.discoverCapabilities({
      category: req.query.category,
      type: req.query.type,
      tags: req.query.tags ? req.query.tags.split(',') : undefined,
      availability: req.query.availability || 'available'
    });

    res.json({
      capabilities: capabilities.capabilities.map(cap => ({
        capabilityId: cap.capabilityId,
        capabilityName: cap.capabilityName,
        capabilityDescription: cap.capabilityDescription,
        extensionId: cap.extensionId,
        interfaces: cap.interfaces,
        availability: cap.availability,
        performanceMetrics: {
          averageResponseTime: cap.performanceMetrics?.averageResponseTime,
          successRate: cap.performanceMetrics?.successRate,
          throughput: cap.performanceMetrics?.throughput
        }
      })),
      totalCount: capabilities.totalCount,
      query: capabilities.query
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **2. 跨模块集成示例**

#### **与Context模块集成**
```typescript
import { ContextModule } from '@mplp/context';
import { ExtensionModule } from '@mplp/extension';
import { EventEmitter2 } from '@nestjs/event-emitter';

// 初始化模块
const contextModule = new ContextModule(contextConfig);
const extensionModule = new ExtensionModule(extensionConfig);
const eventEmitter = new EventEmitter2();

// 设置跨模块事件监听
contextModule.on('context.created', async (event) => {
  console.log('上下文创建事件:', event);
  
  // 触发上下文感知扩展
  const contextAwareExtensions = await extensionModule.getCapabilityOrchestrator()
    .discoverCapabilities({
      category: 'context_processing',
      tags: ['context_aware']
    });

  for (const capability of contextAwareExtensions.capabilities) {
    try {
      await extensionModule.getCapabilityOrchestrator().invokeCapability({
        capabilityId: capability.capabilityId,
        method: 'onContextCreated',
        parameters: {
          contextId: event.contextId,
          contextType: event.contextType,
          contextData: event.contextData
        },
        context: {
          eventType: 'context.created',
          timestamp: event.timestamp
        }
      });
    } catch (error) {
      console.error(`上下文感知扩展调用失败: ${capability.capabilityId}`, error);
    }
  }
});

extensionModule.on('extension.installed', async (event) => {
  console.log('扩展安装事件:', event);
  
  // 为新安装的扩展提供上下文访问
  if (event.extensionCapabilities.includes('context_access')) {
    await contextModule.grantContextAccess({
      extensionId: event.extensionId,
      accessLevel: 'read',
      contextTypes: ['user', 'session', 'global']
    });
  }
});
```

#### **与Plan模块集成**
```typescript
import { PlanModule } from '@mplp/plan';

// 初始化Plan模块
const planModule = new PlanModule(planConfig);

// 扩展Plan服务以支持扩展集成
class ExtensionIntegratedPlanService extends PlanManager {
  constructor(
    planRepository: PlanRepository,
    private extensionModule: ExtensionModule
  ) {
    super(planRepository);
  }

  async createPlanWithExtensions(request: CreatePlanWithExtensionsRequest): Promise<PlanSession> {
    // 创建基础计划
    const plan = await this.createPlan({
      planName: request.planName,
      planType: request.planType,
      objectives: request.objectives,
      createdBy: request.createdBy
    });

    // 发现计划相关扩展
    const planningExtensions = await this.extensionModule.getCapabilityOrchestrator()
      .discoverCapabilities({
        category: 'planning',
        type: 'plan_automation',
        availability: 'available'
      });

    // 为计划启用相关扩展
    for (const capability of planningExtensions.capabilities) {
      try {
        await this.extensionModule.getCapabilityOrchestrator().invokeCapability({
          capabilityId: capability.capabilityId,
          method: 'enhancePlan',
          parameters: {
            planId: plan.planId,
            planType: request.planType,
            objectives: request.objectives,
            enhancementOptions: request.extensionOptions
          }
        });
      } catch (error) {
        console.error(`计划增强扩展调用失败: ${capability.capabilityId}`, error);
      }
    }

    return plan;
  }

  async executePlanWithAI(planId: string): Promise<PlanExecutionResult> {
    // 获取AI规划扩展
    const aiPlanners = await this.extensionModule.getCapabilityOrchestrator()
      .discoverCapabilities({
        category: 'ai_planning',
        tags: ['automated_planning', 'optimization']
      });

    if (aiPlanners.capabilities.length === 0) {
      throw new Error('未找到AI规划扩展');
    }

    // 使用最佳AI规划扩展
    const bestPlanner = aiPlanners.capabilities[0]; // 可以基于性能指标选择
    
    const result = await this.extensionModule.getCapabilityOrchestrator().invokeCapability({
      capabilityId: bestPlanner.capabilityId,
      method: 'optimizePlan',
      parameters: {
        planId: planId,
        optimizationCriteria: ['time', 'resources', 'risk'],
        constraints: await this.getPlanConstraints(planId)
      }
    });

    // 应用AI优化建议
    if (result.result.optimizations) {
      await this.applyPlanOptimizations(planId, result.result.optimizations);
    }

    return {
      planId: planId,
      executionStatus: 'optimized',
      aiEnhancements: result.result,
      executionTime: result.executionTime
    };
  }
}
```

### **3. 安全扩展市场集成**

#### **企业扩展市场实施**
```typescript
import { ExtensionMarketplace } from '@mplp/extension/marketplace';
import { SecurityScanner } from '@mplp/extension/security';

// 企业扩展市场服务
class EnterpriseExtensionMarketplace {
  constructor(
    private extensionModule: ExtensionModule,
    private securityScanner: SecurityScanner
  ) {}

  async publishExtension(request: PublishExtensionRequest): Promise<PublishResult> {
    // 安全扫描
    const securityScan = await this.securityScanner.scanExtension({
      extensionPackage: request.extensionPackage,
      scanDepth: 'comprehensive',
      includeVulnerabilityCheck: true,
      includeLicenseCheck: true,
      includeCodeQualityCheck: true
    });

    if (!securityScan.approved) {
      throw new SecurityError(`扩展安全扫描失败: ${securityScan.issues.join(', ')}`);
    }

    // 代码签名验证
    const signatureVerification = await this.verifyCodeSignature(request.extensionPackage);
    if (!signatureVerification.valid) {
      throw new SecurityError('扩展代码签名验证失败');
    }

    // 发布到市场
    const publication = await this.extensionModule.getMarketplace().publishExtension({
      extensionId: request.extensionId,
      extensionPackage: request.extensionPackage,
      marketingInfo: request.marketingInfo,
      pricingInfo: request.pricingInfo,
      securityProfile: securityScan.securityProfile,
      publishedBy: request.publishedBy
    });

    return {
      extensionId: publication.extensionId,
      publicationId: publication.publicationId,
      marketplaceUrl: publication.marketplaceUrl,
      status: 'published',
      securityRating: securityScan.securityRating,
      publishedAt: publication.publishedAt
    };
  }

  async installFromMarketplace(request: MarketplaceInstallRequest): Promise<InstallationResult> {
    // 从市场获取扩展信息
    const extensionInfo = await this.extensionModule.getMarketplace()
      .getExtensionInfo(request.extensionId);

    // 验证许可和权限
    await this.validateLicenseAndPermissions(extensionInfo, request.userId);

    // 下载和验证扩展包
    const extensionPackage = await this.downloadAndVerifyExtension(extensionInfo);

    // 安装扩展
    const installation = await this.extensionModule.getExtensionManager()
      .installExtension({
        extensionId: request.extensionId,
        installationConfig: request.installationConfig,
        installedBy: request.userId
      });

    // 记录市场安装
    await this.recordMarketplaceInstallation({
      extensionId: request.extensionId,
      userId: request.userId,
      installationId: installation.installationId,
      source: 'marketplace'
    });

    return installation;
  }
}
```

---

## 🔗 相关文档

- [Extension模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**集成版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业就绪  

**⚠️ Alpha版本说明**: Extension模块集成示例在Alpha版本中提供企业就绪的集成模式。额外的高级集成模式和最佳实践将在Beta版本中添加。
