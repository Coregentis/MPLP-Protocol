# MPLP SDK Documentation

> **🌐 Language Navigation**: [English](sdk.md) | [中文](../../zh-CN/developers/sdk.md)



**Multi-Agent Protocol Lifecycle Platform - SDK Documentation v1.0.0-alpha**

[![SDK](https://img.shields.io/badge/sdk-Multi%20Language-green.svg)](./README.md)
[![Languages](https://img.shields.io/badge/languages-6%2B%20Supported-blue.svg)](../implementation/multi-language-support.md)
[![API](https://img.shields.io/badge/api-Type%20Safe-orange.svg)](./examples.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../zh-CN/developers/sdk.md)

---

## 🎯 SDK Overview

The MPLP SDK provides language-specific libraries and tools for building multi-agent systems with the Multi-Agent Protocol Lifecycle Platform. Each SDK maintains consistent APIs while leveraging language-specific features and conventions.

### **Supported Languages**
- **Primary SDKs**: TypeScript, Python, Java, Go
- **Secondary SDKs**: C#, Rust, PHP, Ruby
- **Community SDKs**: Kotlin, Swift, Dart, Scala

### **SDK Features**
- **Type Safety**: Full type definitions and compile-time validation
- **Protocol Compliance**: Automatic L1-L3 protocol compliance
- **Dual Naming Convention**: Seamless snake_case ↔ camelCase mapping
- **Error Handling**: Comprehensive error handling and recovery
- **Performance Optimization**: Language-specific optimizations
- **Testing Support**: Built-in testing utilities and mocks

---

## 📦 TypeScript SDK

### **Installation**
```bash
# Install core SDK
npm install @mplp/sdk-typescript

# Install specific modules
npm install @mplp/context @mplp/plan @mplp/role @mplp/confirm @mplp/trace

# Install development tools
npm install -D @mplp/dev-tools @mplp/testing
```

### **Basic Usage**
```typescript
// Basic TypeScript SDK usage
import { MPLPClient, MPLPConfiguration } from '@mplp/sdk-typescript';
import { ContextService, PlanService, RoleService } from '@mplp/sdk-typescript';

// Configuration
const config: MPLPConfiguration = {
  core: {
    protocolVersion: '1.0.0-alpha',
    environment: 'development',
    logLevel: 'info'
  },
  modules: {
    context: { enabled: true },
    plan: { enabled: true },
    role: { enabled: true },
    confirm: { enabled: true },
    trace: { enabled: true }
  },
  transport: {
    type: 'http',
    baseUrl: 'http://localhost:3000',
    timeout: 30000
  }
};

// Initialize client
const client = new MPLPClient(config);
await client.initialize();

// Use services
const contextService = client.getService<ContextService>('context');
const planService = client.getService<PlanService>('plan');
const roleService = client.getService<RoleService>('role');

// Create context
const context = await contextService.createContext({
  contextId: 'example-context',
  contextType: 'user_workflow',
  contextData: { userId: 'user-123', workflowType: 'onboarding' },
  createdBy: 'typescript-sdk'
});

// Create and execute plan
const plan = await planService.createPlan({
  planId: 'example-plan',
  contextId: context.contextId,
  planType: 'sequential_workflow',
  planSteps: [
    {
      stepId: 'step-001',
      operation: 'validate_user',
      parameters: { userId: 'user-123' },
      estimatedDuration: 1000
    },
    {
      stepId: 'step-002',
      operation: 'send_welcome_email',
      parameters: { template: 'welcome' },
      estimatedDuration: 2000
    }
  ],
  createdBy: 'typescript-sdk'
});

const result = await planService.executePlan(plan.planId);
console.log('Plan execution result:', result);
```

### **Advanced Features**
```typescript
// Advanced TypeScript SDK features
import { 
  MPLPClient, 
  ContextService, 
  PlanService,
  TraceService,
  EventEmitter,
  RetryPolicy,
  CircuitBreaker
} from '@mplp/sdk-typescript';

// Advanced configuration
const advancedConfig: MPLPConfiguration = {
  // ... basic config
  resilience: {
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      jitter: true
    },
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 30000,
      monitoringPeriod: 10000
    },
    timeout: {
      default: 30000,
      context: 10000,
      plan: 60000
    }
  },
  monitoring: {
    metrics: true,
    tracing: true,
    logging: {
      level: 'info',
      format: 'json',
      destination: 'console'
    }
  }
};

// Event-driven programming
class EventDrivenAgent {
  private client: MPLPClient;
  private eventEmitter: EventEmitter;

  constructor(config: MPLPConfiguration) {
    this.client = new MPLPClient(config);
    this.eventEmitter = this.client.getEventEmitter();
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // Context events
    this.eventEmitter.on('context.created', (event) => {
      console.log('Context created:', event.contextId);
    });

    this.eventEmitter.on('context.updated', (event) => {
      console.log('Context updated:', event.contextId);
    });

    // Plan events
    this.eventEmitter.on('plan.started', (event) => {
      console.log('Plan started:', event.planId);
    });

    this.eventEmitter.on('plan.completed', (event) => {
      console.log('Plan completed:', event.planId, event.result);
    });

    this.eventEmitter.on('plan.failed', (event) => {
      console.error('Plan failed:', event.planId, event.error);
    });

    // Step events
    this.eventEmitter.on('step.started', (event) => {
      console.log('Step started:', event.stepId);
    });

    this.eventEmitter.on('step.completed', (event) => {
      console.log('Step completed:', event.stepId);
    });
  }

  async processWorkflow(workflowData: any): Promise<any> {
    // Create context with event emission
    const context = await this.client.context.createContext({
      contextId: `workflow-${Date.now()}`,
      contextType: 'event_driven_workflow',
      contextData: workflowData,
      createdBy: 'event-driven-agent'
    });

    // Create plan with event emission
    const plan = await this.client.plan.createPlan({
      planId: `plan-${Date.now()}`,
      contextId: context.contextId,
      planType: 'event_driven',
      planSteps: this.generateSteps(workflowData),
      createdBy: 'event-driven-agent'
    });

    // Execute with automatic event emission
    return await this.client.plan.executePlan(plan.planId);
  }

  private generateSteps(workflowData: any): PlanStep[] {
    // Generate steps based on workflow data
    return [
      {
        stepId: 'validate-input',
        operation: 'validate_workflow_data',
        parameters: { data: workflowData },
        estimatedDuration: 500
      },
      {
        stepId: 'process-data',
        operation: 'process_workflow_data',
        parameters: { processingType: workflowData.type },
        estimatedDuration: 2000
      },
      {
        stepId: 'generate-output',
        operation: 'generate_workflow_output',
        parameters: { outputFormat: 'json' },
        estimatedDuration: 1000
      }
    ];
  }
}
```

---

## 🐍 Python SDK

### **Installation**
```bash
# Install core SDK
pip install mplp-sdk-python

# Install specific modules
pip install mplp-context mplp-plan mplp-role mplp-confirm mplp-trace

# Install development tools
pip install mplp-dev-tools mplp-testing
```

### **Basic Usage**
```python
# Basic Python SDK usage
from mplp_sdk import MPLPClient, MPLPConfiguration
from mplp_context import ContextService
from mplp_plan import PlanService
from mplp_role import RoleService
import asyncio

# Configuration
config = MPLPConfiguration(
    core={
        'protocol_version': '1.0.0-alpha',
        'environment': 'development',
        'log_level': 'info'
    },
    modules={
        'context': {'enabled': True},
        'plan': {'enabled': True},
        'role': {'enabled': True},
        'confirm': {'enabled': True},
        'trace': {'enabled': True}
    },
    transport={
        'type': 'http',
        'base_url': 'http://localhost:3000',
        'timeout': 30.0
    }
)

async def main():
    # Initialize client
    client = MPLPClient(config)
    await client.initialize()
    
    # Get services
    context_service = client.get_service('context')
    plan_service = client.get_service('plan')
    role_service = client.get_service('role')
    
    # Create context
    context = await context_service.create_context({
        'context_id': 'python-example-context',
        'context_type': 'data_processing',
        'context_data': {
            'input_file': 'data.csv',
            'processing_type': 'analysis',
            'output_format': 'json'
        },
        'created_by': 'python-sdk'
    })
    
    # Create plan
    plan = await plan_service.create_plan({
        'plan_id': 'python-example-plan',
        'context_id': context['context_id'],
        'plan_type': 'data_processing_workflow',
        'plan_steps': [
            {
                'step_id': 'load-data',
                'operation': 'load_csv_data',
                'parameters': {'file_path': 'data.csv'},
                'estimated_duration': 2000
            },
            {
                'step_id': 'analyze-data',
                'operation': 'perform_analysis',
                'parameters': {'analysis_type': 'statistical'},
                'estimated_duration': 5000
            },
            {
                'step_id': 'export-results',
                'operation': 'export_results',
                'parameters': {'format': 'json'},
                'estimated_duration': 1000
            }
        ],
        'created_by': 'python-sdk'
    })
    
    # Execute plan
    result = await plan_service.execute_plan(plan['plan_id'])
    print(f"Plan execution result: {result}")

# Run async main
if __name__ == "__main__":
    asyncio.run(main())
```

### **Advanced Features**
```python
# Advanced Python SDK features
from mplp_sdk import MPLPClient, EventHandler, RetryPolicy, CircuitBreaker
from typing import Dict, Any, List, Optional
import logging

class AdvancedPythonAgent:
    def __init__(self, config: MPLPConfiguration):
        self.client = MPLPClient(config)
        self.logger = logging.getLogger(__name__)
        self.setup_event_handlers()
    
    def setup_event_handlers(self):
        """Setup event handlers for various MPLP events"""
        
        @self.client.on('context.created')
        async def on_context_created(event: Dict[str, Any]):
            self.logger.info(f"Context created: {event['context_id']}")
        
        @self.client.on('plan.started')
        async def on_plan_started(event: Dict[str, Any]):
            self.logger.info(f"Plan started: {event['plan_id']}")
        
        @self.client.on('plan.completed')
        async def on_plan_completed(event: Dict[str, Any]):
            self.logger.info(f"Plan completed: {event['plan_id']}")
        
        @self.client.on('plan.failed')
        async def on_plan_failed(event: Dict[str, Any]):
            self.logger.error(f"Plan failed: {event['plan_id']} - {event['error']}")
    
    async def process_batch_data(self, data_batch: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Process a batch of data using MPLP workflow"""
        
        # Create context for batch processing
        context = await self.client.context.create_context({
            'context_id': f'batch-{len(data_batch)}-{int(time.time())}',
            'context_type': 'batch_processing',
            'context_data': {
                'batch_size': len(data_batch),
                'processing_started': datetime.utcnow().isoformat(),
                'data_types': list(set(item.get('type') for item in data_batch))
            },
            'created_by': 'advanced-python-agent'
        })
        
        # Create parallel processing plan
        plan_steps = []
        chunk_size = max(1, len(data_batch) // 4)  # Process in 4 chunks
        
        for i in range(0, len(data_batch), chunk_size):
            chunk = data_batch[i:i + chunk_size]
            plan_steps.append({
                'step_id': f'process-chunk-{i // chunk_size}',
                'operation': 'process_data_chunk',
                'parameters': {
                    'chunk_index': i // chunk_size,
                    'chunk_data': chunk,
                    'chunk_size': len(chunk)
                },
                'estimated_duration': len(chunk) * 100  # 100ms per item
            })
        
        # Add aggregation step
        plan_steps.append({
            'step_id': 'aggregate-results',
            'operation': 'aggregate_chunk_results',
            'parameters': {'aggregation_method': 'merge'},
            'estimated_duration': 1000,
            'dependencies': [f'process-chunk-{i}' for i in range(len(plan_steps))]
        })
        
        plan = await self.client.plan.create_plan({
            'plan_id': f'batch-plan-{context["context_id"]}',
            'context_id': context['context_id'],
            'plan_type': 'parallel_batch_processing',
            'plan_steps': plan_steps,
            'created_by': 'advanced-python-agent'
        })
        
        # Execute with custom step implementations
        result = await self.client.plan.execute_plan(
            plan['plan_id'],
            step_implementations={
                'process_data_chunk': self._process_chunk,
                'aggregate_chunk_results': self._aggregate_results
            }
        )
        
        return result
    
    async def _process_chunk(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Process a chunk of data"""
        chunk_data = parameters['chunk_data']
        chunk_index = parameters['chunk_index']
        
        # Simulate data processing
        processed_items = []
        for item in chunk_data:
            processed_item = {
                'id': item.get('id'),
                'processed_value': item.get('value', 0) * 2,
                'processing_timestamp': datetime.utcnow().isoformat(),
                'chunk_index': chunk_index
            }
            processed_items.append(processed_item)
        
        return {
            'chunk_index': chunk_index,
            'processed_items': processed_items,
            'processing_time': len(chunk_data) * 100
        }
    
    async def _aggregate_results(self, parameters: Dict[str, Any], step_result: Dict[str, Any]) -> Dict[str, Any]:
        """Aggregate results from all chunks"""
        chunk_results = [
            result for result in step_result['previous_step_results'].values()
            if 'chunk_index' in result
        ]
        
        all_processed_items = []
        total_processing_time = 0
        
        for chunk_result in chunk_results:
            all_processed_items.extend(chunk_result['processed_items'])
            total_processing_time += chunk_result['processing_time']
        
        return {
            'total_items': len(all_processed_items),
            'processed_items': all_processed_items,
            'total_processing_time': total_processing_time,
            'chunks_processed': len(chunk_results),
            'aggregation_completed': datetime.utcnow().isoformat()
        }
```

---

## ☕ Java SDK

### **Installation**
```xml
<!-- Maven dependency -->
<dependency>
    <groupId>dev.mplp</groupId>
    <artifactId>mplp-sdk-java</artifactId>
    <version>1.0.0-alpha</version>
</dependency>

<!-- Individual modules -->
<dependency>
    <groupId>dev.mplp</groupId>
    <artifactId>mplp-context</artifactId>
    <version>1.0.0-alpha</version>
</dependency>
<dependency>
    <groupId>dev.mplp</groupId>
    <artifactId>mplp-plan</artifactId>
    <version>1.0.0-alpha</version>
</dependency>
```

### **Basic Usage**
```java
// Basic Java SDK usage
import dev.mplp.sdk.MPLPClient;
import dev.mplp.sdk.MPLPConfiguration;
import dev.mplp.context.ContextService;
import dev.mplp.plan.PlanService;
import dev.mplp.role.RoleService;

import java.util.concurrent.CompletableFuture;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

public class BasicJavaExample {
    public static void main(String[] args) {
        // Configuration
        MPLPConfiguration config = MPLPConfiguration.builder()
            .core(CoreConfiguration.builder()
                .protocolVersion("1.0.0-alpha")
                .environment("development")
                .logLevel("info")
                .build())
            .modules(ModuleConfiguration.builder()
                .context(ModuleConfig.enabled())
                .plan(ModuleConfig.enabled())
                .role(ModuleConfig.enabled())
                .confirm(ModuleConfig.enabled())
                .trace(ModuleConfig.enabled())
                .build())
            .transport(TransportConfiguration.builder()
                .type("http")
                .baseUrl("http://localhost:3000")
                .timeout(30000)
                .build())
            .build();
        
        // Initialize client
        MPLPClient client = new MPLPClient(config);
        
        CompletableFuture.runAsync(() -> {
            try {
                client.initialize().get();
                
                // Get services
                ContextService contextService = client.getService(ContextService.class);
                PlanService planService = client.getService(PlanService.class);
                RoleService roleService = client.getService(RoleService.class);
                
                // Create context
                Map<String, Object> contextData = new HashMap<>();
                contextData.put("userId", "user-123");
                contextData.put("workflowType", "order_processing");
                
                CreateContextRequest contextRequest = CreateContextRequest.builder()
                    .contextId("java-example-context")
                    .contextType("order_workflow")
                    .contextData(contextData)
                    .createdBy("java-sdk")
                    .build();
                
                ContextEntity context = contextService.createContext(contextRequest).get();
                System.out.println("Context created: " + context.getContextId());
                
                // Create plan
                List<PlanStep> planSteps = new ArrayList<>();
                planSteps.add(PlanStep.builder()
                    .stepId("validate-order")
                    .operation("validate_order_data")
                    .parameters(Map.of("orderId", "order-123"))
                    .estimatedDuration(1000)
                    .build());
                
                planSteps.add(PlanStep.builder()
                    .stepId("process-payment")
                    .operation("process_payment")
                    .parameters(Map.of("amount", 99.99, "currency", "USD"))
                    .estimatedDuration(3000)
                    .build());
                
                planSteps.add(PlanStep.builder()
                    .stepId("fulfill-order")
                    .operation("fulfill_order")
                    .parameters(Map.of("fulfillmentType", "standard"))
                    .estimatedDuration(2000)
                    .build());
                
                CreatePlanRequest planRequest = CreatePlanRequest.builder()
                    .planId("java-example-plan")
                    .contextId(context.getContextId())
                    .planType("order_processing_workflow")
                    .planSteps(planSteps)
                    .createdBy("java-sdk")
                    .build();
                
                PlanEntity plan = planService.createPlan(planRequest).get();
                System.out.println("Plan created: " + plan.getPlanId());
                
                // Execute plan
                ExecutePlanRequest executeRequest = ExecutePlanRequest.builder()
                    .planId(plan.getPlanId())
                    .executionMode("sequential")
                    .timeoutSeconds(60)
                    .build();
                
                PlanExecutionResult result = planService.executePlan(executeRequest).get();
                System.out.println("Plan execution result: " + result.getExecutionStatus());
                
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).join();
    }
}
```

---

## 🐹 Go SDK

### **Installation**
```bash
# Install Go SDK
go get github.com/mplp/mplp-sdk-go

# Install specific modules
go get github.com/mplp/mplp-context-go
go get github.com/mplp/mplp-plan-go
go get github.com/mplp/mplp-role-go
```

### **Basic Usage**
```go
// Basic Go SDK usage
package main

import (
    "context"
    "fmt"
    "log"
    "time"
    
    "github.com/mplp/mplp-sdk-go/client"
    "github.com/mplp/mplp-sdk-go/config"
    "github.com/mplp/mplp-context-go"
    "github.com/mplp/mplp-plan-go"
    "github.com/mplp/mplp-role-go"
)

func main() {
    // Configuration
    cfg := &config.MPLPConfiguration{
        Core: config.CoreConfiguration{
            ProtocolVersion: "1.0.0-alpha",
            Environment:     "development",
            LogLevel:        "info",
        },
        Modules: config.ModuleConfiguration{
            Context: config.ModuleConfig{Enabled: true},
            Plan:    config.ModuleConfig{Enabled: true},
            Role:    config.ModuleConfig{Enabled: true},
            Confirm: config.ModuleConfig{Enabled: true},
            Trace:   config.ModuleConfig{Enabled: true},
        },
        Transport: config.TransportConfiguration{
            Type:    "http",
            BaseURL: "http://localhost:3000",
            Timeout: 30 * time.Second,
        },
    }
    
    // Initialize client
    mplpClient, err := client.NewMPLPClient(cfg)
    if err != nil {
        log.Fatalf("Failed to create MPLP client: %v", err)
    }
    
    ctx := context.Background()
    if err := mplpClient.Initialize(ctx); err != nil {
        log.Fatalf("Failed to initialize MPLP client: %v", err)
    }
    
    // Get services
    contextService := mplpClient.GetContextService()
    planService := mplpClient.GetPlanService()
    roleService := mplpClient.GetRoleService()
    
    // Create context
    contextReq := &mplpcontext.CreateContextRequest{
        ContextID:   "go-example-context",
        ContextType: "file_processing",
        ContextData: map[string]interface{}{
            "inputFile":     "data.txt",
            "outputFormat":  "json",
            "processingType": "text_analysis",
        },
        CreatedBy: "go-sdk",
    }
    
    contextEntity, err := contextService.CreateContext(ctx, contextReq)
    if err != nil {
        log.Fatalf("Failed to create context: %v", err)
    }
    fmt.Printf("Context created: %s\n", contextEntity.ContextID)
    
    // Create plan
    planSteps := []*mplpplan.PlanStep{
        {
            StepID:            "read-file",
            Operation:         "read_text_file",
            Parameters:        map[string]interface{}{"filePath": "data.txt"},
            EstimatedDuration: 1000,
        },
        {
            StepID:            "analyze-text",
            Operation:         "perform_text_analysis",
            Parameters:        map[string]interface{}{"analysisType": "sentiment"},
            EstimatedDuration: 5000,
        },
        {
            StepID:            "export-results",
            Operation:         "export_analysis_results",
            Parameters:        map[string]interface{}{"format": "json"},
            EstimatedDuration: 1000,
        },
    }
    
    planReq := &mplpplan.CreatePlanRequest{
        PlanID:      "go-example-plan",
        ContextID:   contextEntity.ContextID,
        PlanType:    "text_processing_workflow",
        PlanSteps:   planSteps,
        CreatedBy:   "go-sdk",
    }
    
    planEntity, err := planService.CreatePlan(ctx, planReq)
    if err != nil {
        log.Fatalf("Failed to create plan: %v", err)
    }
    fmt.Printf("Plan created: %s\n", planEntity.PlanID)
    
    // Execute plan
    executeReq := &mplpplan.ExecutePlanRequest{
        PlanID:         planEntity.PlanID,
        ExecutionMode:  "sequential",
        TimeoutSeconds: 60,
    }
    
    result, err := planService.ExecutePlan(ctx, executeReq)
    if err != nil {
        log.Fatalf("Failed to execute plan: %v", err)
    }
    fmt.Printf("Plan execution result: %s\n", result.ExecutionStatus)
}
```

---

## 🔗 Related Resources

- **[Developer Resources Overview](./README.md)** - Complete developer guide
- **[Quick Start Guide](./quick-start.md)** - Get started quickly
- **[Comprehensive Tutorials](./tutorials.md)** - Step-by-step learning
- **[Code Examples](./examples.md)** - Working code samples
- **[Development Tools](./tools.md)** - CLI tools and utilities

---

**SDK Documentation Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025  
**Status**: Multi-Language Ready  

**⚠️ Alpha Notice**: These SDKs provide comprehensive multi-language support for MPLP v1.0 Alpha. Additional language bindings and SDK features will be added in Beta release based on developer feedback and community contributions.
