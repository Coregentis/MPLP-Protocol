# Extension Module - Examples and Tutorials

**Version**: v1.0.0
**Last Updated**: 2025-08-11 18:00:00
**Status**: L4 Intelligent Agent Operating System Production Ready ✅

---

## 📋 **Examples Overview**

This document provides comprehensive examples and tutorials for using the Extension Module in the MPLP L4 Intelligent Agent Operating System. Examples range from basic extension management to advanced MPLP ecosystem integration scenarios.

## 🚀 **Basic Extension Management Examples**

### Example 1: Creating and Activating an Extension

```typescript
import { ExtensionModule } from '@mplp/extension';

async function basicExtensionManagement() {
  // Initialize the Extension Module
  const extensionModule = await ExtensionModule.initialize({
    enableLogging: true,
    dataSource: dataSource
  });

  // Create a new extension
  const createResult = await extensionModule.extensionManagementService.createExtension({
    name: 'Code Quality Analyzer',
    version: '1.2.0',
    description: 'Analyzes code quality and provides improvement suggestions',
    author: 'Development Team',
    source: 'marketplace',
    config: {
      analysis_depth: 'comprehensive',
      languages: ['typescript', 'javascript', 'python'],
      auto_fix: false
    },
    dependencies: [
      { name: 'eslint', version: '^8.0.0' },
      { name: 'prettier', version: '^2.8.0' }
    ],
    permissions: ['code:read', 'code:analyze']
  });

  if (createResult.success) {
    console.log('Extension created:', createResult.data.extensionId);

    // Activate the extension
    const activateResult = await extensionModule.extensionManagementService
      .activateExtension(createResult.data.extensionId);

    if (activateResult.success) {
      console.log('Extension activated successfully');
    }
  }
}
```

### Example 2: Querying and Managing Extensions

```typescript
async function queryAndManageExtensions() {
  const extensionModule = await ExtensionModule.initialize();

  // Query extensions with filters
  const queryResult = await extensionModule.extensionManagementService.queryExtensions({
    status: 'active',
    source: 'marketplace',
    search: 'code',
    pagination: {
      page: 1,
      limit: 10
    },
    sort: {
      field: 'created_at',
      order: 'desc'
    }
  });

  if (queryResult.success) {
    console.log(`Found ${queryResult.data.extensions.length} extensions`);
    
    for (const extension of queryResult.data.extensions) {
      console.log(`- ${extension.name} (${extension.version}) - ${extension.status}`);
      
      // Get detailed extension information
      const detailResult = await extensionModule.extensionManagementService
        .getExtensionById(extension.extensionId);
      
      if (detailResult.success) {
        console.log(`  Dependencies: ${detailResult.data.dependencies.length}`);
        console.log(`  Permissions: ${detailResult.data.permissions.join(', ')}`);
      }
    }
  }
}
```

### Example 3: Extension Dependency Management

```typescript
async function manageDependencies() {
  const extensionModule = await ExtensionModule.initialize();

  // Create extension with complex dependencies
  const extensionData = {
    name: 'Advanced Workflow Engine',
    version: '2.0.0',
    source: 'git',
    dependencies: [
      { name: 'workflow-core', version: '^3.1.0' },
      { name: 'task-scheduler', version: '~2.5.0' },
      { name: 'notification-service', version: '^1.0.0', optional: true },
      { name: 'analytics-tracker', version: '^4.2.0', optional: true }
    ]
  };

  // Check dependency compatibility before creation
  const compatibilityResult = await extensionModule.extensionManagementService
    .checkDependencyCompatibility(extensionData.dependencies);

  if (compatibilityResult.success && compatibilityResult.data.isCompatible) {
    const createResult = await extensionModule.extensionManagementService
      .createExtension(extensionData);
    
    if (createResult.success) {
      console.log('Extension created with all dependencies resolved');
    }
  } else {
    console.log('Dependency conflicts detected:', compatibilityResult.data.conflicts);
  }
}
```

## 🤖 **MPLP Ecosystem Integration Examples**

### Example 4: AI-Driven Extension Recommendations

```typescript
async function intelligentRecommendations() {
  const extensionModule = await ExtensionModule.initialize();

  // Get AI-driven extension recommendations
  const recommendationResult = await extensionModule.extensionManagementService
    .getIntelligentExtensionRecommendations({
      userId: 'user-dev-001',
      contextId: 'project-web-app',
      roleId: 'senior-developer',
      currentExtensions: ['code-formatter', 'git-integration'],
      requirements: [
        'code quality improvement',
        'automated testing',
        'performance optimization'
      ]
    });

  if (recommendationResult.success) {
    console.log('AI Recommendations:');
    
    for (const recommendation of recommendationResult.data.recommendations) {
      console.log(`\n📦 ${recommendation.name}`);
      console.log(`   Relevance: ${recommendation.relevanceScore}/100`);
      console.log(`   Benefits: ${recommendation.benefits.join(', ')}`);
      console.log(`   Complexity: ${recommendation.installationComplexity}`);
      
      // Auto-install high-relevance recommendations
      if (recommendation.relevanceScore > 85) {
        const installResult = await extensionModule.extensionManagementService
          .createExtension({
            name: recommendation.name,
            version: 'latest',
            source: 'marketplace'
          });
        
        if (installResult.success) {
          console.log(`   ✅ Auto-installed: ${recommendation.name}`);
        }
      }
    }
  }
}
```

### Example 5: Role-Based Extension Dynamic Loading

```typescript
async function roleBasedExtensionLoading() {
  const extensionModule = await ExtensionModule.initialize();

  // Simulate user role change
  const userRoleChange = {
    userId: 'user-123',
    previousRole: 'junior-developer',
    newRole: 'tech-lead',
    contextId: 'project-enterprise-app'
  };

  // Load extensions for new role
  const loadResult = await extensionModule.extensionManagementService
    .loadExtensionsForRole({
      userId: userRoleChange.userId,
      roleId: userRoleChange.newRole,
      contextId: userRoleChange.contextId,
      autoActivate: true
    });

  if (loadResult.success) {
    console.log('Role-based extensions loaded:');
    
    for (const extension of loadResult.data.loadedExtensions) {
      console.log(`- ${extension.name}: ${extension.reason}`);
    }

    // Unload extensions no longer needed
    const unloadResult = await extensionModule.extensionManagementService
      .unloadExtensionsForRole({
        userId: userRoleChange.userId,
        previousRoleId: userRoleChange.previousRole,
        newRoleId: userRoleChange.newRole
      });

    if (unloadResult.success) {
      console.log('Obsolete extensions unloaded:');
      for (const extension of unloadResult.data.unloadedExtensions) {
        console.log(`- ${extension.name}: ${extension.reason}`);
      }
    }
  }
}
```

### Example 6: Plan-Driven Extension Management

```typescript
async function planDrivenExtensionManagement() {
  const extensionModule = await ExtensionModule.initialize();

  // Manage extensions based on project plan
  const planData = {
    planId: 'plan-mobile-app-dev',
    currentPhase: 'development',
    nextPhase: 'testing',
    technologies: ['react-native', 'typescript', 'jest'],
    teamSize: 8,
    timeline: '3 months'
  };

  // Get extensions for current plan phase
  const phaseExtensionsResult = await extensionModule.extensionManagementService
    .getExtensionsForPlanPhase({
      planId: planData.planId,
      phase: planData.currentPhase,
      technologies: planData.technologies
    });

  if (phaseExtensionsResult.success) {
    console.log(`Extensions for ${planData.currentPhase} phase:`);
    
    for (const extension of phaseExtensionsResult.data.recommendedExtensions) {
      console.log(`- ${extension.name}: ${extension.justification}`);
      
      // Install phase-specific extensions
      const installResult = await extensionModule.extensionManagementService
        .createExtension({
          name: extension.name,
          version: extension.recommendedVersion,
          source: 'marketplace',
          config: extension.suggestedConfig
        });
      
      if (installResult.success) {
        await extensionModule.extensionManagementService
          .activateExtension(installResult.data.extensionId);
      }
    }
  }

  // Prepare for next phase
  const nextPhaseResult = await extensionModule.extensionManagementService
    .prepareExtensionsForNextPhase({
      planId: planData.planId,
      currentPhase: planData.currentPhase,
      nextPhase: planData.nextPhase
    });

  if (nextPhaseResult.success) {
    console.log(`Prepared ${nextPhaseResult.data.preparedExtensions.length} extensions for ${planData.nextPhase} phase`);
  }
}
```

## 🏢 **Enterprise-Grade Features Examples**

### Example 7: Enterprise Approval Workflow

```typescript
async function enterpriseApprovalWorkflow() {
  const extensionModule = await ExtensionModule.initialize();

  // Request approval for enterprise extension
  const approvalRequest = {
    extensionName: 'Enterprise Security Scanner',
    version: '2.1.0',
    requestedBy: 'user-security-lead',
    businessJustification: 'Required for SOC2 compliance and security auditing',
    urgency: 'high' as const,
    estimatedCost: 5000,
    affectedSystems: ['production', 'staging']
  };

  // Submit approval request
  const requestResult = await extensionModule.extensionManagementService
    .requestExtensionApproval(approvalRequest);

  if (requestResult.success) {
    const approvalId = requestResult.data.approvalId;
    console.log(`Approval request submitted: ${approvalId}`);

    // Monitor approval status
    const statusCheck = setInterval(async () => {
      const statusResult = await extensionModule.extensionManagementService
        .checkApprovalStatus(approvalId);

      if (statusResult.success) {
        const status = statusResult.data.status;
        console.log(`Approval status: ${status}`);

        if (status === 'approved') {
          clearInterval(statusCheck);
          
          // Proceed with installation
          const installResult = await extensionModule.extensionManagementService
            .createExtension({
              name: approvalRequest.extensionName,
              version: approvalRequest.version,
              source: 'marketplace',
              approvalId: approvalId
            });

          if (installResult.success) {
            console.log('Extension installed after approval');
          }
        } else if (status === 'rejected') {
          clearInterval(statusCheck);
          console.log('Extension approval rejected');
        }
      }
    }, 30000); // Check every 30 seconds
  }
}
```

### Example 8: Security Audit and Compliance

```typescript
async function securityAuditExample() {
  const extensionModule = await ExtensionModule.initialize();

  const extensionId = 'ext-security-scanner-123';

  // Perform comprehensive security audit
  const auditResult = await extensionModule.extensionManagementService
    .performSecurityAudit({
      extensionId: extensionId,
      auditLevel: 'comprehensive',
      standards: ['SOC2', 'ISO27001', 'GDPR', 'HIPAA'],
      includeRecommendations: true,
      scanDependencies: true
    });

  if (auditResult.success) {
    const audit = auditResult.data;
    console.log(`Security Score: ${audit.securityScore}/100`);
    
    // Handle vulnerabilities
    if (audit.vulnerabilities.length > 0) {
      console.log('\n🚨 Security Vulnerabilities:');
      
      for (const vuln of audit.vulnerabilities) {
        console.log(`- ${vuln.severity.toUpperCase()}: ${vuln.description}`);
        console.log(`  Remediation: ${vuln.remediation}`);
        
        // Auto-fix critical vulnerabilities
        if (vuln.severity === 'critical' && vuln.autoFixAvailable) {
          const fixResult = await extensionModule.extensionManagementService
            .applySecurityFix({
              extensionId: extensionId,
              vulnerabilityId: vuln.id,
              autoApprove: false
            });
          
          if (fixResult.success) {
            console.log(`  ✅ Auto-fix applied for ${vuln.id}`);
          }
        }
      }
    }

    // Check compliance status
    console.log('\n📋 Compliance Status:');
    for (const [standard, status] of Object.entries(audit.complianceStatus)) {
      console.log(`- ${standard}: ${status.compliant ? '✅' : '❌'} ${status.score}%`);
    }

    // Generate compliance report
    const reportResult = await extensionModule.extensionManagementService
      .generateComplianceReport({
        extensionId: extensionId,
        auditId: audit.auditId,
        format: 'pdf',
        includeRemediation: true
      });

    if (reportResult.success) {
      console.log(`Compliance report generated: ${reportResult.data.reportUrl}`);
    }
  }
}
```

### Example 9: Performance Monitoring and Optimization

```typescript
async function performanceMonitoringExample() {
  const extensionModule = await ExtensionModule.initialize();

  const extensionId = 'ext-workflow-engine-456';

  // Set up performance monitoring
  const monitoringResult = await extensionModule.extensionManagementService
    .setupPerformanceMonitoring({
      extensionId: extensionId,
      metrics: ['cpu_usage', 'memory_usage', 'execution_time', 'throughput'],
      alertThresholds: {
        cpu_usage: 80,
        memory_usage: 90,
        execution_time: 5000, // 5 seconds
        error_rate: 5 // 5%
      },
      reportingInterval: '5m'
    });

  if (monitoringResult.success) {
    console.log('Performance monitoring enabled');

    // Get current performance metrics
    const metricsResult = await extensionModule.extensionManagementService
      .getPerformanceMetrics({
        extensionId: extensionId,
        period: '24h',
        aggregation: 'avg'
      });

    if (metricsResult.success) {
      const metrics = metricsResult.data;
      console.log('\n📊 Performance Metrics (24h average):');
      console.log(`- CPU Usage: ${metrics.cpuUsage}%`);
      console.log(`- Memory Usage: ${metrics.memoryUsage}MB`);
      console.log(`- Avg Execution Time: ${metrics.executionTime}ms`);
      console.log(`- Throughput: ${metrics.throughput} ops/sec`);

      // Get optimization recommendations
      const optimizationResult = await extensionModule.extensionManagementService
        .getOptimizationRecommendations({
          extensionId: extensionId,
          metrics: metrics,
          targetPerformance: {
            cpu_usage: 60,
            memory_usage: 512,
            execution_time: 2000
          }
        });

      if (optimizationResult.success) {
        console.log('\n🚀 Optimization Recommendations:');
        for (const recommendation of optimizationResult.data.recommendations) {
          console.log(`- ${recommendation.type}: ${recommendation.description}`);
          console.log(`  Expected improvement: ${recommendation.expectedImprovement}`);
          
          // Apply automatic optimizations
          if (recommendation.canAutoApply) {
            const applyResult = await extensionModule.extensionManagementService
              .applyOptimization({
                extensionId: extensionId,
                optimizationId: recommendation.id,
                testFirst: true
              });
            
            if (applyResult.success) {
              console.log(`  ✅ Applied: ${recommendation.type}`);
            }
          }
        }
      }
    }
  }
}
```

## 🌐 **Distributed Network Support Examples**

### Example 10: Network Extension Distribution

```typescript
async function networkExtensionDistribution() {
  const extensionModule = await ExtensionModule.initialize();

  const extensionId = 'ext-ai-assistant-789';

  // Analyze network topology
  const topologyResult = await extensionModule.extensionManagementService
    .analyzeNetworkTopology();

  if (topologyResult.success) {
    const topology = topologyResult.data;
    console.log(`Network has ${topology.totalAgents} agents across ${topology.regions.length} regions`);

    // Plan extension distribution
    const distributionPlan = await extensionModule.extensionManagementService
      .planExtensionDistribution({
        extensionId: extensionId,
        targetAgents: topology.agents.map(agent => agent.id),
        strategy: 'progressive',
        constraints: {
          maxConcurrentDeployments: 5,
          regionPriority: ['us-east', 'eu-west', 'asia-pacific'],
          requireHealthCheck: true,
          rollbackOnFailure: true
        }
      });

    if (distributionPlan.success) {
      console.log('Distribution plan created:');
      console.log(`- Total phases: ${distributionPlan.data.phases.length}`);
      console.log(`- Estimated duration: ${distributionPlan.data.estimatedDuration}`);

      // Execute progressive distribution
      const distributionResult = await extensionModule.extensionManagementService
        .executeProgressiveDistribution({
          planId: distributionPlan.data.planId,
          monitorHealth: true,
          autoRollback: true
        });

      if (distributionResult.success) {
        const deploymentId = distributionResult.data.deploymentId;
        
        // Monitor distribution progress
        const progressMonitor = setInterval(async () => {
          const progressResult = await extensionModule.extensionManagementService
            .getDistributionProgress(deploymentId);

          if (progressResult.success) {
            const progress = progressResult.data;
            console.log(`Distribution progress: ${progress.completedAgents}/${progress.totalAgents} agents`);
            
            if (progress.status === 'completed') {
              clearInterval(progressMonitor);
              console.log('✅ Distribution completed successfully');
            } else if (progress.status === 'failed') {
              clearInterval(progressMonitor);
              console.log('❌ Distribution failed, initiating rollback');
              
              // Automatic rollback
              await extensionModule.extensionManagementService
                .rollbackDistribution(deploymentId);
            }
          }
        }, 10000); // Check every 10 seconds
      }
    }
  }
}
```

## 💬 **Dialog-Driven Management Examples**

### Example 11: Natural Language Extension Management

```typescript
async function dialogDrivenManagement() {
  const extensionModule = await ExtensionModule.initialize();

  // Simulate natural language requests
  const dialogRequests = [
    'Install the latest code formatter extension for TypeScript',
    'Show me all active extensions related to testing',
    'Disable the performance monitor extension temporarily',
    'Recommend extensions for React development',
    'Update all extensions to their latest versions'
  ];

  for (const request of dialogRequests) {
    console.log(`\n🗣️ User: "${request}"`);
    
    const dialogResult = await extensionModule.extensionManagementService
      .processDialogRequest({
        userId: 'user-dev-002',
        message: request,
        contextId: 'project-react-app',
        conversationHistory: []
      });

    if (dialogResult.success) {
      const response = dialogResult.data;
      console.log(`🤖 Assistant: ${response.responseMessage}`);
      
      // Execute identified actions
      if (response.actions.length > 0) {
        console.log('Executing actions:');
        
        for (const action of response.actions) {
          console.log(`- ${action.type}: ${action.description}`);
          
          // Execute the action
          const actionResult = await extensionModule.extensionManagementService
            .executeDialogAction({
              actionId: action.id,
              parameters: action.parameters,
              userId: 'user-dev-002'
            });
          
          if (actionResult.success) {
            console.log(`  ✅ ${action.type} completed`);
          } else {
            console.log(`  ❌ ${action.type} failed: ${actionResult.error}`);
          }
        }
      }

      // Handle suggestions
      if (response.suggestedExtensions && response.suggestedExtensions.length > 0) {
        console.log('Suggested extensions:');
        for (const suggestion of response.suggestedExtensions) {
          console.log(`- ${suggestion.name}: ${suggestion.reason}`);
        }
      }
    }
  }
}
```

## 🔧 **Advanced Configuration Examples**

### Example 12: Custom Extension Development

```typescript
// Custom extension implementation
export class CustomWorkflowValidatorExtension {
  private config: any;

  constructor(config: any) {
    this.config = config;
  }

  // Extension lifecycle hooks
  async onInstall(): Promise<void> {
    console.log('Custom Workflow Validator installed');
    // Initialize extension resources
  }

  async onActivate(): Promise<void> {
    console.log('Custom Workflow Validator activated');
    // Start extension services
  }

  async onDeactivate(): Promise<void> {
    console.log('Custom Workflow Validator deactivated');
    // Stop extension services
  }

  async onUninstall(): Promise<void> {
    console.log('Custom Workflow Validator uninstalled');
    // Cleanup extension resources
  }

  // Custom validation logic
  async validateWorkflow(workflowData: any): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Custom validation rules
    if (workflowData.budget > this.config.maxBudget) {
      errors.push(`Budget ${workflowData.budget} exceeds maximum ${this.config.maxBudget}`);
    }

    if (workflowData.timeline < this.config.minTimeline) {
      warnings.push(`Timeline ${workflowData.timeline} is below recommended minimum ${this.config.minTimeline}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateValidationScore(workflowData)
    };
  }

  private calculateValidationScore(workflowData: any): number {
    // Custom scoring logic
    let score = 100;
    
    if (workflowData.budget > this.config.maxBudget * 0.8) {
      score -= 20;
    }
    
    if (workflowData.timeline < this.config.minTimeline * 1.2) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }
}

// Extension registration
async function registerCustomExtension() {
  const extensionModule = await ExtensionModule.initialize();

  const customExtension = await extensionModule.extensionManagementService
    .registerCustomExtension({
      name: 'Custom Workflow Validator',
      version: '1.0.0',
      implementation: CustomWorkflowValidatorExtension,
      config: {
        maxBudget: 100000,
        minTimeline: 30, // days
        strictMode: true
      },
      hooks: [
        {
          event: 'before_workflow_execution',
          handler: 'validateWorkflow',
          priority: 10
        }
      ]
    });

  if (customExtension.success) {
    console.log('Custom extension registered successfully');
  }
}
```

---

**Extension Module Examples** - Comprehensive examples for MPLP L4 Intelligent Agent Operating System ✨
