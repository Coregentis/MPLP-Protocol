# Extension Module Integration Examples

**Multi-Agent Protocol Lifecycle Platform - Extension Module Integration Examples v1.0.0-alpha**

[![Integration](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![Examples](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![Extensions](https://img.shields.io/badge/extensions-Best%20Practices-orange.svg)](./api-reference.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/extension/integration-examples.md)

---

## 🎯 Integration Overview

This document provides comprehensive integration examples for the Extension Module, demonstrating real-world enterprise extension management scenarios, cross-module capability integration patterns, and best practices for building comprehensive extensibility systems with MPLP Extension Module.

### **Integration Scenarios**
- **Enterprise Extension Platform**: Complete extension management with AI capabilities
- **Multi-Tenant Extension System**: Scalable multi-organization extension hosting
- **Cross-Module Integration**: Integration with Context, Plan, Confirm, and Trace modules
- **Real-Time Capability Platform**: High-performance capability orchestration
- **AI-Powered Extension Ecosystem**: Machine learning-enhanced extension management
- **Secure Extension Marketplace**: Enterprise-grade extension distribution and security

---

## 🚀 Basic Integration Examples

### **1. Enterprise Extension Platform**

#### **Express.js with Comprehensive Extension Management**
```typescript
import express from 'express';
import { ExtensionModule } from '@mplp/extension';
import { EnterpriseExtensionManager } from '@mplp/extension/services';
import { ExtensionMiddleware } from '@mplp/extension/middleware';
import { CapabilityOrchestrator } from '@mplp/extension/orchestrators';

// Initialize Express application
const app = express();
app.use(express.json());

// Initialize Extension Module with enterprise features
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
      securityPolicyEnforcement: true,
      trustedPublishers: ['mplp-official', 'verified-partners']
    }
  },
  monitoring: {
    metrics: {
      enabled: true,
      backend: 'prometheus',
      endpoint: '/metrics'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json'
    },
    tracing: {
      enabled: true,
      backend: 'jaeger',
      endpoint: process.env.JAEGER_ENDPOINT
    }
  }
});

const extensionManager = extensionModule.getExtensionManager();
const capabilityOrchestrator = extensionModule.getCapabilityOrchestrator();
const extensionMiddleware = new ExtensionMiddleware(extensionModule);

// Apply extension middleware
app.use(extensionMiddleware.validateExtensionAccess());
app.use(extensionMiddleware.trackExtensionUsage());

// Extension management endpoints
app.post('/extensions', async (req, res) => {
  try {
    const registration = await extensionManager.registerExtension({
      extensionId: req.body.extension_id,
      extensionName: req.body.extension_name,
      extensionVersion: req.body.extension_version,
      extensionType: req.body.extension_type,
      extensionCategory: req.body.extension_category,
      extensionDescription: req.body.extension_description,
      extensionManifest: req.body.extension_manifest,
      installationPackage: req.body.installation_package,
      lifecycleHooks: req.body.lifecycle_hooks
    });

    res.status(201).json({
      extension_id: registration.extensionId,
      registration_status: registration.registrationStatus,
      validation_results: registration.validationResults,
      assigned_resources: registration.assignedResources,
      next_steps: registration.nextSteps
    });

  } catch (error) {
    res.status(400).json({
      error: 'Extension registration failed',
      message: error.message,
      details: error.details
    });
  }
});

app.post('/extensions/:extensionId/install', async (req, res) => {
  try {
    const installation = await extensionManager.installExtension(
      req.params.extensionId,
      {
        installationOptions: req.body.installation_options,
        configuration: req.body.configuration,
        deploymentTarget: req.body.deployment_target
      }
    );

    res.json({
      installation_id: installation.installationId,
      installation_status: installation.installationStatus,
      installation_progress: installation.installationProgress,
      resource_allocation: installation.resourceAllocation,
      monitoring: installation.monitoring
    });

  } catch (error) {
    res.status(500).json({
      error: 'Extension installation failed',
      message: error.message,
      extension_id: req.params.extensionId
    });
  }
});

app.post('/extensions/:extensionId/activate', async (req, res) => {
  try {
    const activation = await extensionManager.activateExtension(
      req.params.extensionId,
      {
        activationOptions: req.body.activation_options,
        integrationTargets: req.body.integration_targets,
        runtimeConfiguration: req.body.runtime_configuration
      }
    );

    res.json({
      activation_id: activation.activationId,
      activation_status: activation.activationStatus,
      extension_status: activation.extensionStatus,
      runtime_info: activation.runtimeInfo,
      registered_capabilities: activation.registeredCapabilities,
      active_integrations: activation.activeIntegrations,
      monitoring: activation.monitoring
    });

  } catch (error) {
    res.status(500).json({
      error: 'Extension activation failed',
      message: error.message,
      extension_id: req.params.extensionId
    });
  }
});

// Capability invocation endpoint
app.post('/extensions/:extensionId/capabilities/:capabilityId/invoke', async (req, res) => {
  try {
    const result = await capabilityOrchestrator.invokeCapability({
      extensionId: req.params.extensionId,
      capabilityId: req.params.capabilityId,
      method: req.body.method,
      parameters: req.body.parameters,
      invocationContext: {
        executionId: req.headers['x-execution-id'] || generateExecutionId(),
        userId: req.user?.id,
        sessionId: req.sessionID,
        correlationId: req.headers['x-correlation-id'],
        requestId: req.headers['x-request-id']
      },
      options: {
        timeoutMs: req.body.timeout_ms || 30000,
        cacheEnabled: req.body.cache_result !== false,
        traceExecution: req.body.trace_execution !== false
      }
    });

    res.json({
      capability_id: result.capabilityId,
      method: result.method,
      execution_id: result.executionId,
      execution_status: result.executionStatus,
      execution_time_ms: result.executionTimeMs,
      result: result.result,
      trace_info: result.traceInfo,
      cache_info: result.cacheInfo
    });

  } catch (error) {
    res.status(500).json({
      error: 'Capability invocation failed',
      message: error.message,
      extension_id: req.params.extensionId,
      capability_id: req.params.capabilityId
    });
  }
});

// Extension marketplace endpoints
app.get('/marketplace/extensions', async (req, res) => {
  try {
    const extensions = await getMarketplaceExtensions({
      category: req.query.category,
      type: req.query.type,
      search: req.query.search,
      sort: req.query.sort || 'popularity',
      page: parseInt(req.query.page || '1'),
      limit: parseInt(req.query.limit || '20')
    });

    res.json({
      extensions: extensions.items,
      pagination: {
        page: extensions.page,
        limit: extensions.limit,
        total: extensions.total,
        pages: extensions.pages
      },
      filters: extensions.availableFilters
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch marketplace extensions',
      message: error.message
    });
  }
});

// AI-powered extension recommendations
app.get('/extensions/recommendations', async (req, res) => {
  try {
    const recommendations = await generateExtensionRecommendations({
      userId: req.user?.id,
      currentExtensions: req.query.current_extensions?.split(','),
      workflowTypes: req.query.workflow_types?.split(','),
      industryVertical: req.query.industry,
      useCase: req.query.use_case,
      maxRecommendations: parseInt(req.query.limit || '10')
    });

    res.json({
      recommendations: recommendations.map(rec => ({
        extension_id: rec.extensionId,
        extension_name: rec.extensionName,
        extension_description: rec.extensionDescription,
        recommendation_score: rec.score,
        recommendation_reason: rec.reason,
        compatibility_score: rec.compatibilityScore,
        estimated_value: rec.estimatedValue,
        installation_complexity: rec.installationComplexity
      })),
      recommendation_metadata: {
        algorithm_version: recommendations.algorithmVersion,
        confidence_score: recommendations.overallConfidence,
        generated_at: recommendations.generatedAt
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate extension recommendations',
      message: error.message
    });
  }
});

// Extension analytics and insights
app.get('/extensions/analytics', async (req, res) => {
  try {
    const analytics = await generateExtensionAnalytics({
      timeRange: req.query.time_range || '30d',
      extensionIds: req.query.extension_ids?.split(','),
      metrics: req.query.metrics?.split(',') || ['usage', 'performance', 'errors'],
      granularity: req.query.granularity || 'daily'
    });

    res.json({
      analytics: {
        usage_metrics: analytics.usageMetrics,
        performance_metrics: analytics.performanceMetrics,
        error_metrics: analytics.errorMetrics,
        capability_metrics: analytics.capabilityMetrics,
        resource_utilization: analytics.resourceUtilization
      },
      insights: {
        top_performing_extensions: analytics.topPerformingExtensions,
        underutilized_extensions: analytics.underutilizedExtensions,
        performance_bottlenecks: analytics.performanceBottlenecks,
        optimization_opportunities: analytics.optimizationOpportunities
      },
      trends: {
        usage_trends: analytics.usageTrends,
        performance_trends: analytics.performanceTrends,
        adoption_trends: analytics.adoptionTrends
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate extension analytics',
      message: error.message
    });
  }
});

// Helper functions
async function getMarketplaceExtensions(filters: MarketplaceFilters): Promise<MarketplaceResponse> {
  // Implementation for fetching marketplace extensions
  const query = buildMarketplaceQuery(filters);
  const results = await extensionModule.getMarketplaceService().search(query);
  
  return {
    items: results.extensions.map(ext => ({
      extensionId: ext.extension_id,
      extensionName: ext.extension_name,
      extensionDescription: ext.extension_description,
      extensionVersion: ext.latest_version,
      extensionType: ext.extension_type,
      extensionCategory: ext.extension_category,
      publisher: ext.publisher,
      rating: ext.average_rating,
      downloads: ext.download_count,
      lastUpdated: ext.last_updated,
      verified: ext.verified_publisher,
      pricing: ext.pricing_model,
      capabilities: ext.capabilities.map(cap => ({
        capabilityId: cap.capability_id,
        capabilityName: cap.capability_name,
        capabilityDescription: cap.capability_description
      }))
    })),
    page: results.pagination.page,
    limit: results.pagination.limit,
    total: results.pagination.total,
    pages: Math.ceil(results.pagination.total / results.pagination.limit),
    availableFilters: results.filters
  };
}

async function generateExtensionRecommendations(params: RecommendationParams): Promise<ExtensionRecommendation[]> {
  // AI-powered recommendation engine
  const userProfile = await buildUserProfile(params.userId);
  const contextAnalysis = await analyzeUserContext({
    currentExtensions: params.currentExtensions,
    workflowTypes: params.workflowTypes,
    industryVertical: params.industryVertical,
    useCase: params.useCase
  });
  
  const recommendations = await extensionModule.getRecommendationEngine().generateRecommendations({
    userProfile: userProfile,
    contextAnalysis: contextAnalysis,
    maxRecommendations: params.maxRecommendations,
    diversityFactor: 0.3,
    noveltyFactor: 0.2
  });
  
  return recommendations.map(rec => ({
    extensionId: rec.extension_id,
    extensionName: rec.extension_name,
    extensionDescription: rec.extension_description,
    score: rec.recommendation_score,
    reason: rec.recommendation_reasoning,
    compatibilityScore: rec.compatibility_analysis.score,
    estimatedValue: rec.value_estimation,
    installationComplexity: rec.installation_complexity,
    algorithmVersion: rec.algorithm_version,
    overallConfidence: rec.confidence_score,
    generatedAt: new Date()
  }));
}

async function generateExtensionAnalytics(params: AnalyticsParams): Promise<ExtensionAnalytics> {
  // Comprehensive analytics generation
  const metricsCollector = extensionModule.getMetricsCollector();
  const analyticsEngine = extensionModule.getAnalyticsEngine();
  
  const [usageMetrics, performanceMetrics, errorMetrics] = await Promise.all([
    metricsCollector.getUsageMetrics(params),
    metricsCollector.getPerformanceMetrics(params),
    metricsCollector.getErrorMetrics(params)
  ]);
  
  const insights = await analyticsEngine.generateInsights({
    usageMetrics,
    performanceMetrics,
    errorMetrics,
    timeRange: params.timeRange
  });
  
  const trends = await analyticsEngine.analyzeTrends({
    metrics: { usageMetrics, performanceMetrics, errorMetrics },
    timeRange: params.timeRange,
    granularity: params.granularity
  });
  
  return {
    usageMetrics,
    performanceMetrics,
    errorMetrics,
    capabilityMetrics: await metricsCollector.getCapabilityMetrics(params),
    resourceUtilization: await metricsCollector.getResourceUtilization(params),
    topPerformingExtensions: insights.topPerformers,
    underutilizedExtensions: insights.underutilized,
    performanceBottlenecks: insights.bottlenecks,
    optimizationOpportunities: insights.optimizations,
    usageTrends: trends.usage,
    performanceTrends: trends.performance,
    adoptionTrends: trends.adoption
  };
}

// WebSocket for real-time extension updates
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Client connected for real-time extension updates');

  socket.on('subscribe_extension_events', (data) => {
    const { extensionIds, eventTypes } = data;
    
    // Subscribe to extension lifecycle events
    extensionModule.subscribeToExtensionEvents({
      extensionIds: extensionIds || ['all'],
      eventTypes: eventTypes || ['registration', 'installation', 'activation', 'deactivation'],
      callback: (event) => {
        socket.emit('extension_event', {
          event_type: event.eventType,
          extension_id: event.extensionId,
          event_data: event.eventData,
          timestamp: event.timestamp
        });
      }
    });
  });

  socket.on('subscribe_capability_events', (data) => {
    const { capabilityIds, eventTypes } = data;
    
    // Subscribe to capability invocation events
    extensionModule.subscribeToCapabilityEvents({
      capabilityIds: capabilityIds || ['all'],
      eventTypes: eventTypes || ['invocation', 'success', 'error'],
      callback: (event) => {
        socket.emit('capability_event', {
          event_type: event.eventType,
          capability_id: event.capabilityId,
          extension_id: event.extensionId,
          event_data: event.eventData,
          timestamp: event.timestamp
        });
      }
    });
  });

  socket.on('subscribe_performance_metrics', (data) => {
    const { extensionIds, metrics } = data;
    
    // Subscribe to real-time performance metrics
    extensionModule.subscribeToPerformanceMetrics({
      extensionIds: extensionIds || ['all'],
      metrics: metrics || ['cpu_usage', 'memory_usage', 'invocation_rate', 'error_rate'],
      updateInterval: 5000, // 5 seconds
      callback: (metricsUpdate) => {
        socket.emit('performance_metrics', {
          extension_id: metricsUpdate.extensionId,
          metrics: metricsUpdate.metrics,
          timestamp: metricsUpdate.timestamp
        });
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from extension monitoring');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Enterprise Extension Platform running on port ${PORT}`);
  console.log(`Extension API: http://localhost:${PORT}/extensions`);
  console.log(`Marketplace: http://localhost:${PORT}/marketplace/extensions`);
  console.log(`Metrics endpoint: http://localhost:${PORT}/metrics`);
});
```

---

## 🔗 Cross-Module Integration Examples

### **1. Extension + Context + Plan + Confirm Integration**

#### **Comprehensive Multi-Module Extension Integration**
```typescript
import { ExtensionService } from '@mplp/extension';
import { ContextService } from '@mplp/context';
import { PlanService } from '@mplp/plan';
import { ConfirmService } from '@mplp/confirm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ComprehensiveExtensionIntegrationService {
  constructor(
    private readonly extensionService: ExtensionService,
    private readonly contextService: ContextService,
    private readonly planService: PlanService,
    private readonly confirmService: ConfirmService,
    private readonly eventEmitter: EventEmitter2
  ) {
    this.setupCrossModuleIntegration();
  }

  async createExtensionEnhancedWorkflow(request: ExtensionEnhancedWorkflowRequest): Promise<ExtensionEnhancedWorkflow> {
    // 1. Create context with extension capabilities
    const enhancedContext = await this.contextService.createContext({
      name: `Extension-Enhanced Workflow: ${request.workflowName}`,
      type: 'extension_enhanced_workflow',
      configuration: {
        maxParticipants: request.maxParticipants || 100,
        extensionIntegration: true,
        aiCapabilities: request.aiCapabilities || [],
        customCapabilities: request.customCapabilities || [],
        extensionSandboxing: true,
        capabilityOrchestration: {
          enabled: true,
          loadBalancing: 'round_robin',
          circuitBreaker: true,
          caching: true
        }
      },
      metadata: {
        tags: ['workflow', 'extension-enhanced', 'ai-powered'],
        category: 'enhanced-workflow-execution',
        priority: request.priority || 'high',
        extensionMetadata: {
          requiredCapabilities: request.requiredCapabilities,
          optionalCapabilities: request.optionalCapabilities,
          extensionConstraints: request.extensionConstraints
        }
      },
      createdBy: request.requestedBy
    });

    // 2. Discover and register required extensions
    const requiredExtensions = await this.discoverRequiredExtensions({
      requiredCapabilities: request.requiredCapabilities,
      workflowType: request.workflowType,
      contextId: enhancedContext.contextId
    });

    const registeredExtensions = await this.registerWorkflowExtensions({
      extensions: requiredExtensions,
      contextId: enhancedContext.contextId,
      workflowRequirements: request.workflowRequirements
    });

    // 3. Create extension-enhanced execution plan
    const enhancedPlan = await this.planService.generatePlan({
      name: `${request.workflowName} - Extension-Enhanced Execution Plan`,
      contextId: enhancedContext.contextId,
      objectives: [
        {
          objective: 'Execute Workflow with Extension Capabilities',
          description: 'Execute workflow leveraging registered extension capabilities for enhanced functionality',
          priority: 'critical',
          extensionIntegration: {
            enabled: true,
            requiredCapabilities: request.requiredCapabilities,
            capabilityOrchestration: 'intelligent',
            failoverStrategy: 'graceful_degradation'
          },
          aiEnhancement: {
            enabled: request.aiCapabilities.length > 0,
            capabilities: request.aiCapabilities,
            intelligentRouting: true,
            adaptiveBehavior: true
          }
        },
        ...request.workflowObjectives.map(obj => ({
          ...obj,
          extensionIntegration: {
            enabled: true,
            capabilityMapping: this.mapObjectiveToCapabilities(obj, registeredExtensions),
            performanceTargets: obj.performanceTargets
          }
        }))
      ],
      planningStrategy: {
        algorithm: 'extension_enhanced_planning',
        optimizationGoals: [
          'maximize_capability_utilization',
          'minimize_extension_overhead',
          'ensure_capability_availability',
          'optimize_resource_allocation'
        ],
        extensionConstraints: {
          maxExtensionsPerObjective: 5,
          capabilityTimeout: 30000,
          resourceLimits: request.resourceLimits,
          securityPolicies: request.securityPolicies
        }
      },
      executionPreferences: {
        extensionOrchestration: 'intelligent',
        capabilityLoadBalancing: true,
        failoverEnabled: true,
        performanceOptimization: true
      }
    });

    // 4. Set up extension-enhanced approval workflows
    const enhancedApprovals = await this.setupExtensionEnhancedApprovals({
      contextId: enhancedContext.contextId,
      planId: enhancedPlan.planId,
      workflowType: request.workflowType,
      approvalRequirements: request.approvalRequirements,
      extensionEnhancements: {
        aiDecisionSupport: request.aiCapabilities.includes('decision_support'),
        riskAnalysis: request.aiCapabilities.includes('risk_analysis'),
        documentAnalysis: request.aiCapabilities.includes('document_analysis'),
        complianceChecking: request.aiCapabilities.includes('compliance_checking')
      }
    });

    // 5. Configure comprehensive extension monitoring
    const extensionMonitoring = await this.setupExtensionMonitoring({
      contextId: enhancedContext.contextId,
      planId: enhancedPlan.planId,
      extensionIds: registeredExtensions.map(ext => ext.extensionId),
      approvalIds: enhancedApprovals.map(app => app.approvalId),
      monitoringConfiguration: {
        extensionPerformance: {
          enabled: true,
          metricsCollection: 'comprehensive',
          performanceThresholds: request.performanceThresholds,
          alerting: 'intelligent'
        },
        capabilityMonitoring: {
          enabled: true,
          invocationTracking: true,
          performanceAnalysis: true,
          errorTracking: true
        },
        resourceMonitoring: {
          enabled: true,
          sandboxMonitoring: true,
          resourceUtilization: true,
          costTracking: true
        }
      }
    });

    const enhancedWorkflow: ExtensionEnhancedWorkflow = {
      workflowId: this.generateWorkflowId(),
      workflowName: request.workflowName,
      workflowType: request.workflowType,
      contextId: enhancedContext.contextId,
      planId: enhancedPlan.planId,
      registeredExtensions: registeredExtensions,
      approvalIds: enhancedApprovals.map(app => app.approvalId),
      extensionConfiguration: {
        capabilityOrchestration: 'intelligent',
        loadBalancing: 'adaptive',
        circuitBreaker: true,
        caching: true,
        monitoring: 'comprehensive'
      },
      aiEnhancements: {
        enabled: request.aiCapabilities.length > 0,
        capabilities: request.aiCapabilities,
        intelligentRouting: true,
        adaptiveBehavior: true,
        learningEnabled: true
      },
      performanceTargets: request.performanceTargets,
      executionStatus: 'initialized',
      extensionStatus: {
        registeredExtensions: registeredExtensions.length,
        activeExtensions: 0,
        availableCapabilities: this.countAvailableCapabilities(registeredExtensions),
        monitoringActive: true
      },
      createdAt: new Date(),
      requestedBy: request.requestedBy
    };

    // 6. Emit extension-enhanced workflow creation event
    await this.eventEmitter.emitAsync('extension.enhanced.workflow.created', {
      workflowId: enhancedWorkflow.workflowId,
      workflowName: request.workflowName,
      contextId: enhancedContext.contextId,
      planId: enhancedPlan.planId,
      extensionCount: registeredExtensions.length,
      capabilityCount: this.countAvailableCapabilities(registeredExtensions),
      aiEnhanced: request.aiCapabilities.length > 0,
      createdBy: request.requestedBy,
      timestamp: new Date().toISOString()
    });

    return enhancedWorkflow;
  }

  private setupCrossModuleIntegration(): void {
    // Monitor context lifecycle events for extension integration
    this.eventEmitter.on('context.lifecycle.event', async (event) => {
      await this.handleContextLifecycleEvent(event);
    });

    // Monitor plan execution events for capability orchestration
    this.eventEmitter.on('plan.execution.event', async (event) => {
      await this.handlePlanExecutionEvent(event);
    });

    // Monitor approval workflow events for AI enhancement
    this.eventEmitter.on('confirm.workflow.event', async (event) => {
      await this.handleApprovalWorkflowEvent(event);
    });

    // Monitor extension events for cross-module coordination
    this.eventEmitter.on('extension.lifecycle.event', async (event) => {
      await this.handleExtensionLifecycleEvent(event);
    });
  }

  private async handleContextLifecycleEvent(event: ContextLifecycleEvent): Promise<void> {
    // Coordinate extension capabilities with context changes
    if (event.extensionIntegration?.enabled) {
      await this.coordinateExtensionsWithContext({
        contextId: event.contextId,
        lifecycleStage: event.lifecycleStage,
        extensionIds: event.extensionIntegration.extensionIds,
        capabilityRequirements: event.extensionIntegration.capabilityRequirements
      });
    }
  }

  private async handlePlanExecutionEvent(event: PlanExecutionEvent): Promise<void> {
    // Orchestrate extension capabilities for plan execution
    if (event.extensionIntegration?.enabled) {
      await this.orchestrateCapabilitiesForPlan({
        planId: event.planId,
        objectiveId: event.objectiveId,
        executionStage: event.executionStage,
        requiredCapabilities: event.extensionIntegration.requiredCapabilities,
        performanceTargets: event.extensionIntegration.performanceTargets
      });
    }
  }

  private async handleApprovalWorkflowEvent(event: ApprovalWorkflowEvent): Promise<void> {
    // Enhance approval workflows with AI capabilities
    if (event.aiEnhancement?.enabled) {
      await this.enhanceApprovalWithAI({
        approvalId: event.approvalId,
        workflowStage: event.workflowStage,
        aiCapabilities: event.aiEnhancement.capabilities,
        decisionContext: event.decisionContext
      });
    }
  }
}
```

---

## 🔗 Related Documentation

- [Extension Module Overview](./README.md) - Module overview and architecture
- [API Reference](./api-reference.md) - Complete API documentation
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization

---

**Integration Examples Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Examples**: Enterprise Ready  

**⚠️ Alpha Notice**: These integration examples showcase enterprise-grade extension management capabilities in Alpha release. Additional AI-powered extension orchestration examples and advanced cross-module integration patterns will be added based on community feedback and real-world usage in Beta release.
