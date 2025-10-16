# MPLP Code Examples

> **🌐 Language Navigation**: [English](examples.md) | [中文](../../zh-CN/developers/examples.md)



**Multi-Agent Protocol Lifecycle Platform - Code Examples v1.0.0-alpha**

[![Examples](https://img.shields.io/badge/examples-Working%20Code-green.svg)](./README.md)
[![Runnable](https://img.shields.io/badge/runnable-Copy%20%26%20Paste-blue.svg)](./tutorials.md)
[![Use Cases](https://img.shields.io/badge/use%20cases-Real%20World-orange.svg)](./quick-start.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../zh-CN/developers/examples.md)

---

## 🎯 Examples Overview

This collection provides working code examples for common MPLP use cases, from simple single-module operations to complex multi-agent coordination scenarios. All examples are production-ready and include error handling, logging, and best practices.

### **Example Categories**
- **Simple Examples**: Basic single-module operations
- **Integration Examples**: Multi-module workflows and external integrations
- **Advanced Examples**: Complex multi-agent coordination and optimization
- **Production Examples**: Enterprise-grade implementations with full observability

### **How to Use Examples**
1. **Copy & Paste**: All examples are self-contained and runnable
2. **Modify & Extend**: Use as starting points for your own implementations
3. **Learn & Understand**: Study patterns and best practices
4. **Test & Validate**: Run examples to understand behavior

---

## 🚀 Simple Examples

### **Example 1: Basic Context Management**

#### **Context Creation and Retrieval**
```typescript
// examples/simple/context-management.ts
import { MPLPClient } from '@mplp/core';

async function contextManagementExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true } }
  });

  await client.initialize();

  try {
    // Create a context
    const context = await client.context.createContext({
      contextId: 'example-context-001',
      contextType: 'user_session',
      contextData: {
        userId: 'user-123',
        sessionId: 'session-456',
        preferences: {
          language: 'en',
          theme: 'dark',
          notifications: true
        },
        metadata: {
          userAgent: 'Mozilla/5.0...',
          ipAddress: '192.168.1.100',
          location: 'New York, NY'
        }
      },
      createdBy: 'example-app'
    });

    console.log('✅ Context created:', context.contextId);

    // Retrieve the context
    const retrievedContext = await client.context.getContext(context.contextId);
    console.log('📋 Retrieved context:', retrievedContext?.contextType);

    // Update context data
    const updatedContext = await client.context.updateContext(context.contextId, {
      contextData: {
        ...context.contextData,
        preferences: {
          ...context.contextData.preferences,
          theme: 'light' // User changed theme
        },
        lastActivity: new Date().toISOString()
      },
      updatedBy: 'example-app'
    });

    console.log('🔄 Context updated:', updatedContext.updatedAt);

    // Search contexts
    const searchResults = await client.context.searchContexts({
      contextType: 'user_session',
      limit: 10
    });

    console.log(`🔍 Found ${searchResults.totalCount} user sessions`);

  } catch (error) {
    console.error('❌ Context management failed:', error);
  }
}

// Run example
contextManagementExample();
```

### **Example 2: Simple Plan Execution**

#### **Sequential Workflow**
```typescript
// examples/simple/plan-execution.ts
import { MPLPClient } from '@mplp/core';

async function planExecutionExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true }, plan: { enabled: true } }
  });

  await client.initialize();

  try {
    // Create context for the workflow
    const context = await client.context.createContext({
      contextId: 'workflow-context-001',
      contextType: 'data_processing',
      contextData: {
        inputData: [1, 2, 3, 4, 5],
        processingType: 'mathematical_operations',
        expectedOutput: 'statistics'
      },
      createdBy: 'plan-example'
    });

    // Create a sequential plan
    const plan = await client.plan.createPlan({
      planId: 'math-processing-plan',
      contextId: context.contextId,
      planType: 'sequential_workflow',
      planSteps: [
        {
          stepId: 'validate-input',
          operation: 'validate_data',
          parameters: { 
            dataType: 'number_array',
            minLength: 1,
            maxLength: 1000
          },
          estimatedDuration: 10
        },
        {
          stepId: 'calculate-sum',
          operation: 'calculate_sum',
          parameters: { data: context.contextData.inputData },
          estimatedDuration: 5
        },
        {
          stepId: 'calculate-average',
          operation: 'calculate_average',
          parameters: { data: context.contextData.inputData },
          estimatedDuration: 5
        },
        {
          stepId: 'find-min-max',
          operation: 'find_min_max',
          parameters: { data: context.contextData.inputData },
          estimatedDuration: 5
        },
        {
          stepId: 'generate-report',
          operation: 'generate_statistics_report',
          parameters: { format: 'json' },
          estimatedDuration: 15
        }
      ],
      createdBy: 'plan-example'
    });

    console.log('📝 Plan created:', plan.planId);

    // Execute the plan
    const executionResult = await client.plan.executePlan(plan.planId, {
      executionMode: 'sequential',
      timeoutSeconds: 60
    });

    if (executionResult.executionStatus === 'completed') {
      console.log('✅ Plan executed successfully');
      console.log('📊 Results:', executionResult.executionResult);
      console.log(`⏱️ Total duration: ${executionResult.totalDuration}ms`);
      console.log(`📈 Success rate: ${executionResult.successRate * 100}%`);
    } else {
      console.log('❌ Plan execution failed:', executionResult.error);
    }

  } catch (error) {
    console.error('❌ Plan execution example failed:', error);
  }
}

// Run example
planExecutionExample();
```

### **Example 3: Role-Based Access Control**

#### **User and Role Management**
```typescript
// examples/simple/rbac-example.ts
import { MPLPClient } from '@mplp/core';

async function rbacExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { role: { enabled: true }, context: { enabled: true } }
  });

  await client.initialize();

  try {
    // Create roles
    const adminRole = await client.role.createRole({
      roleId: 'admin',
      roleName: 'Administrator',
      permissions: [
        'context:create',
        'context:read',
        'context:update',
        'context:delete',
        'plan:create',
        'plan:execute',
        'role:assign',
        'system:configure'
      ],
      createdBy: 'rbac-example'
    });

    const userRole = await client.role.createRole({
      roleId: 'user',
      roleName: 'Regular User',
      permissions: [
        'context:create:own',
        'context:read:own',
        'context:update:own',
        'plan:create:own',
        'plan:execute:own'
      ],
      createdBy: 'rbac-example'
    });

    console.log('👥 Roles created:', adminRole.roleId, userRole.roleId);

    // Create users and assign roles
    const adminUser = await client.role.createUser({
      userId: 'admin-001',
      username: 'admin',
      email: 'admin@example.com',
      roles: [adminRole.roleId],
      createdBy: 'rbac-example'
    });

    const regularUser = await client.role.createUser({
      userId: 'user-001',
      username: 'john_doe',
      email: 'john@example.com',
      roles: [userRole.roleId],
      createdBy: 'rbac-example'
    });

    console.log('👤 Users created:', adminUser.userId, regularUser.userId);

    // Test permissions
    const adminPermissions = await client.role.checkPermission({
      userId: adminUser.userId,
      permission: 'system:configure'
    });

    const userPermissions = await client.role.checkPermission({
      userId: regularUser.userId,
      permission: 'system:configure'
    });

    console.log('🔐 Admin can configure system:', adminPermissions.allowed);
    console.log('🔐 User can configure system:', userPermissions.allowed);

    // Create context with ownership
    const userContext = await client.context.createContext({
      contextId: 'user-owned-context',
      contextType: 'personal_workspace',
      contextData: { owner: regularUser.userId },
      createdBy: regularUser.userId
    });

    // Test access control
    const userCanRead = await client.role.checkPermission({
      userId: regularUser.userId,
      permission: 'context:read:own',
      resourceId: userContext.contextId,
      resourceOwner: regularUser.userId
    });

    console.log('📖 User can read own context:', userCanRead.allowed);

  } catch (error) {
    console.error('❌ RBAC example failed:', error);
  }
}

// Run example
rbacExample();
```

---

## 🔧 Integration Examples

### **Example 4: External API Integration**

#### **REST API Integration with Error Handling**
```typescript
// examples/integration/external-api.ts
import { MPLPClient } from '@mplp/core';
import axios from 'axios';

class ExternalAPIService {
  private client: MPLPClient;

  constructor(client: MPLPClient) {
    this.client = client;
  }

  async integrateWithWeatherAPI(city: string): Promise<any> {
    // Create integration context
    const context = await this.client.context.createContext({
      contextId: `weather-integration-${city}-${Date.now()}`,
      contextType: 'external_api_integration',
      contextData: {
        apiType: 'weather',
        city: city,
        integrationStarted: new Date().toISOString()
      },
      createdBy: 'weather-service'
    });

    // Create integration plan
    const plan = await this.client.plan.createPlan({
      planId: `weather-plan-${city}-${Date.now()}`,
      contextId: context.contextId,
      planType: 'external_integration',
      planSteps: [
        {
          stepId: 'validate-city',
          operation: 'validate_city_name',
          parameters: { city },
          estimatedDuration: 5
        },
        {
          stepId: 'fetch-weather',
          operation: 'fetch_weather_data',
          parameters: { 
            city,
            apiKey: process.env.WEATHER_API_KEY,
            units: 'metric'
          },
          estimatedDuration: 2000,
          retryPolicy: {
            maxRetries: 3,
            retryDelay: 1000,
            exponentialBackoff: true
          }
        },
        {
          stepId: 'process-data',
          operation: 'process_weather_data',
          parameters: { includeForcast: true },
          estimatedDuration: 100
        },
        {
          stepId: 'cache-result',
          operation: 'cache_weather_data',
          parameters: { ttl: 300 }, // 5 minutes
          estimatedDuration: 50
        }
      ],
      createdBy: 'weather-service'
    });

    // Execute with custom step implementations
    const result = await this.client.plan.executePlan(plan.planId, {
      stepImplementations: {
        'validate_city_name': async (params) => {
          if (!params.city || params.city.length < 2) {
            throw new Error('Invalid city name');
          }
          return { valid: true, normalizedCity: params.city.trim() };
        },
        
        'fetch_weather_data': async (params) => {
          try {
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather`,
              {
                params: {
                  q: params.city,
                  appid: params.apiKey,
                  units: params.units
                },
                timeout: 5000
              }
            );
            return response.data;
          } catch (error) {
            if (error.response?.status === 404) {
              throw new Error(`City not found: ${params.city}`);
            }
            throw new Error(`Weather API error: ${error.message}`);
          }
        },
        
        'process_weather_data': async (params, stepResult) => {
          const weatherData = stepResult.previousStepResults['fetch-weather'];
          return {
            city: weatherData.name,
            country: weatherData.sys.country,
            temperature: weatherData.main.temp,
            description: weatherData.weather[0].description,
            humidity: weatherData.main.humidity,
            windSpeed: weatherData.wind.speed,
            processedAt: new Date().toISOString()
          };
        },
        
        'cache_weather_data': async (params, stepResult) => {
          const processedData = stepResult.previousStepResults['process-data'];
          // Cache implementation would go here
          return { cached: true, cacheKey: `weather:${processedData.city}` };
        }
      }
    });

    if (result.executionStatus === 'completed') {
      console.log(`✅ Weather data fetched for ${city}`);
      return result.executionResult;
    } else {
      throw new Error(`Weather integration failed: ${result.error}`);
    }
  }
}

async function externalAPIExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true }, plan: { enabled: true } }
  });

  await client.initialize();

  const weatherService = new ExternalAPIService(client);

  try {
    const weatherData = await weatherService.integrateWithWeatherAPI('London');
    console.log('🌤️ Weather data:', weatherData);
  } catch (error) {
    console.error('❌ Weather integration failed:', error);
  }
}

// Run example
externalAPIExample();
```

### **Example 5: Database Integration**

#### **Multi-Database Synchronization**
```typescript
// examples/integration/database-sync.ts
import { MPLPClient } from '@mplp/core';

interface DatabaseRecord {
  id: string;
  data: any;
  lastModified: Date;
  source: string;
}

class DatabaseSyncService {
  private client: MPLPClient;

  constructor(client: MPLPClient) {
    this.client = client;
  }

  async syncBetweenDatabases(
    sourceDB: string,
    targetDB: string,
    tableName: string
  ): Promise<void> {
    const syncId = `sync-${sourceDB}-${targetDB}-${Date.now()}`;
    
    // Create sync context
    const context = await this.client.context.createContext({
      contextId: syncId,
      contextType: 'database_synchronization',
      contextData: {
        sourceDB,
        targetDB,
        tableName,
        syncStarted: new Date().toISOString(),
        syncType: 'incremental'
      },
      createdBy: 'database-sync-service'
    });

    // Create sync plan
    const plan = await this.client.plan.createPlan({
      planId: `sync-plan-${syncId}`,
      contextId: context.contextId,
      planType: 'parallel_workflow',
      planSteps: [
        {
          stepId: 'fetch-source-data',
          operation: 'fetch_database_records',
          parameters: { database: sourceDB, table: tableName },
          estimatedDuration: 5000
        },
        {
          stepId: 'fetch-target-data',
          operation: 'fetch_database_records',
          parameters: { database: targetDB, table: tableName },
          estimatedDuration: 5000
        },
        {
          stepId: 'compare-data',
          operation: 'compare_database_records',
          parameters: { comparisonStrategy: 'timestamp' },
          estimatedDuration: 2000,
          dependencies: ['fetch-source-data', 'fetch-target-data']
        },
        {
          stepId: 'sync-changes',
          operation: 'apply_database_changes',
          parameters: { batchSize: 100 },
          estimatedDuration: 10000,
          dependencies: ['compare-data']
        },
        {
          stepId: 'verify-sync',
          operation: 'verify_synchronization',
          parameters: { verificationLevel: 'full' },
          estimatedDuration: 3000,
          dependencies: ['sync-changes']
        }
      ],
      createdBy: 'database-sync-service'
    });

    // Execute sync with monitoring
    const result = await this.client.plan.executePlan(plan.planId, {
      executionMode: 'dependency_aware',
      stepImplementations: {
        'fetch_database_records': async (params) => {
          // Mock database fetch
          console.log(`📊 Fetching records from ${params.database}.${params.table}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            records: Array.from({ length: 100 }, (_, i) => ({
              id: `record-${i}`,
              data: { value: Math.random() },
              lastModified: new Date(),
              source: params.database
            })),
            totalCount: 100
          };
        },
        
        'compare_database_records': async (params, stepResult) => {
          const sourceRecords = stepResult.previousStepResults['fetch-source-data'].records;
          const targetRecords = stepResult.previousStepResults['fetch-target-data'].records;
          
          console.log(`🔍 Comparing ${sourceRecords.length} source records with ${targetRecords.length} target records`);
          
          // Mock comparison logic
          const toInsert = sourceRecords.slice(0, 10);
          const toUpdate = sourceRecords.slice(10, 20);
          const toDelete = targetRecords.slice(90, 100);
          
          return {
            toInsert: toInsert.length,
            toUpdate: toUpdate.length,
            toDelete: toDelete.length,
            changes: { toInsert, toUpdate, toDelete }
          };
        },
        
        'apply_database_changes': async (params, stepResult) => {
          const changes = stepResult.previousStepResults['compare-data'].changes;
          
          console.log(`💾 Applying changes: ${changes.toInsert.length} inserts, ${changes.toUpdate.length} updates, ${changes.toDelete.length} deletes`);
          
          // Mock database operations
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          return {
            insertedRecords: changes.toInsert.length,
            updatedRecords: changes.toUpdate.length,
            deletedRecords: changes.toDelete.length,
            totalChanges: changes.toInsert.length + changes.toUpdate.length + changes.toDelete.length
          };
        },
        
        'verify_synchronization': async (params, stepResult) => {
          console.log('✅ Verifying synchronization...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            verified: true,
            recordCount: 100,
            checksumMatch: true,
            verificationTime: new Date().toISOString()
          };
        }
      }
    });

    if (result.executionStatus === 'completed') {
      console.log(`✅ Database sync completed: ${sourceDB} → ${targetDB}`);
      console.log('📊 Sync results:', result.executionResult);
    } else {
      throw new Error(`Database sync failed: ${result.error}`);
    }
  }
}

async function databaseSyncExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { context: { enabled: true }, plan: { enabled: true } }
  });

  await client.initialize();

  const syncService = new DatabaseSyncService(client);

  try {
    await syncService.syncBetweenDatabases('production-db', 'analytics-db', 'user_events');
    console.log('🎉 Database synchronization completed successfully');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
  }
}

// Run example
databaseSyncExample();
```

---

## 🎯 Advanced Examples

### **Example 6: Multi-Agent Coordination**

#### **Distributed Task Processing**
```typescript
// examples/advanced/multi-agent-coordination.ts
import { MPLPClient } from '@mplp/core';

interface Agent {
  agentId: string;
  agentType: 'processor' | 'validator' | 'reporter';
  capabilities: string[];
  status: 'idle' | 'busy' | 'offline';
  currentLoad: number;
}

class MultiAgentOrchestrator {
  private client: MPLPClient;
  private agents: Map<string, Agent> = new Map();

  constructor(client: MPLPClient) {
    this.client = client;
  }

  async registerAgent(agent: Agent): Promise<void> {
    const context = await this.client.context.createContext({
      contextId: `agent-${agent.agentId}`,
      contextType: 'agent_registration',
      contextData: {
        agentId: agent.agentId,
        agentType: agent.agentType,
        capabilities: agent.capabilities,
        registeredAt: new Date().toISOString()
      },
      createdBy: 'orchestrator'
    });

    this.agents.set(agent.agentId, agent);
    console.log(`🤖 Agent registered: ${agent.agentId} (${agent.agentType})`);
  }

  async processLargeDataset(dataset: any[]): Promise<any> {
    const jobId = `job-${Date.now()}`;
    
    // Create coordination context
    const context = await this.client.context.createContext({
      contextId: jobId,
      contextType: 'distributed_processing',
      contextData: {
        jobId,
        datasetSize: dataset.length,
        processingStarted: new Date().toISOString(),
        requiredAgentTypes: ['processor', 'validator', 'reporter']
      },
      createdBy: 'orchestrator'
    });

    // Find available agents
    const processors = Array.from(this.agents.values()).filter(
      a => a.agentType === 'processor' && a.status === 'idle'
    );
    const validators = Array.from(this.agents.values()).filter(
      a => a.agentType === 'validator' && a.status === 'idle'
    );
    const reporters = Array.from(this.agents.values()).filter(
      a => a.agentType === 'reporter' && a.status === 'idle'
    );

    if (processors.length === 0 || validators.length === 0 || reporters.length === 0) {
      throw new Error('Insufficient agents available for processing');
    }

    // Split dataset into chunks
    const chunkSize = Math.ceil(dataset.length / processors.length);
    const dataChunks = [];
    for (let i = 0; i < dataset.length; i += chunkSize) {
      dataChunks.push(dataset.slice(i, i + chunkSize));
    }

    // Create distributed processing plan
    const plan = await this.client.plan.createPlan({
      planId: `processing-plan-${jobId}`,
      contextId: context.contextId,
      planType: 'distributed_workflow',
      planSteps: [
        // Parallel processing steps
        ...dataChunks.map((chunk, index) => ({
          stepId: `process-chunk-${index}`,
          operation: 'process_data_chunk',
          parameters: { 
            chunkIndex: index,
            data: chunk,
            assignedAgent: processors[index % processors.length].agentId
          },
          estimatedDuration: 5000
        })),
        // Validation step (depends on all processing)
        {
          stepId: 'validate-results',
          operation: 'validate_processed_data',
          parameters: { 
            assignedAgent: validators[0].agentId,
            validationLevel: 'comprehensive'
          },
          estimatedDuration: 3000,
          dependencies: dataChunks.map((_, index) => `process-chunk-${index}`)
        },
        // Reporting step (depends on validation)
        {
          stepId: 'generate-report',
          operation: 'generate_processing_report',
          parameters: { 
            assignedAgent: reporters[0].agentId,
            reportFormat: 'detailed'
          },
          estimatedDuration: 2000,
          dependencies: ['validate-results']
        }
      ],
      createdBy: 'orchestrator'
    });

    // Execute distributed plan
    const result = await this.client.plan.executePlan(plan.planId, {
      executionMode: 'distributed',
      stepImplementations: {
        'process_data_chunk': async (params) => {
          console.log(`🔄 Agent ${params.assignedAgent} processing chunk ${params.chunkIndex}`);
          
          // Mark agent as busy
          const agent = this.agents.get(params.assignedAgent);
          if (agent) {
            agent.status = 'busy';
            agent.currentLoad += 1;
          }

          // Simulate processing
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Mark agent as idle
          if (agent) {
            agent.status = 'idle';
            agent.currentLoad -= 1;
          }

          return {
            chunkIndex: params.chunkIndex,
            processedRecords: params.data.length,
            processingTime: 2000,
            agentId: params.assignedAgent
          };
        },
        
        'validate_processed_data': async (params, stepResult) => {
          console.log(`✅ Agent ${params.assignedAgent} validating results`);
          
          const processedChunks = Object.values(stepResult.previousStepResults)
            .filter(result => result.chunkIndex !== undefined);
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          return {
            validatedChunks: processedChunks.length,
            totalRecords: processedChunks.reduce((sum, chunk) => sum + chunk.processedRecords, 0),
            validationPassed: true,
            agentId: params.assignedAgent
          };
        },
        
        'generate_processing_report': async (params, stepResult) => {
          console.log(`📋 Agent ${params.assignedAgent} generating report`);
          
          const validationResult = stepResult.previousStepResults['validate-results'];
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            reportId: `report-${jobId}`,
            totalRecords: validationResult.totalRecords,
            processingTime: Date.now() - new Date(context.contextData.processingStarted).getTime(),
            agentsUsed: {
              processors: processors.length,
              validators: 1,
              reporters: 1
            },
            reportGeneratedBy: params.assignedAgent,
            reportGeneratedAt: new Date().toISOString()
          };
        }
      }
    });

    if (result.executionStatus === 'completed') {
      console.log(`✅ Distributed processing completed for job: ${jobId}`);
      return result.executionResult;
    } else {
      throw new Error(`Distributed processing failed: ${result.error}`);
    }
  }
}

async function multiAgentExample() {
  const client = new MPLPClient({
    core: { protocolVersion: '1.0.0-alpha', environment: 'development' },
    modules: { 
      context: { enabled: true }, 
      plan: { enabled: true },
      trace: { enabled: true }
    }
  });

  await client.initialize();

  const orchestrator = new MultiAgentOrchestrator(client);

  // Register agents
  await orchestrator.registerAgent({
    agentId: 'processor-001',
    agentType: 'processor',
    capabilities: ['data_processing', 'mathematical_operations'],
    status: 'idle',
    currentLoad: 0
  });

  await orchestrator.registerAgent({
    agentId: 'processor-002',
    agentType: 'processor',
    capabilities: ['data_processing', 'text_analysis'],
    status: 'idle',
    currentLoad: 0
  });

  await orchestrator.registerAgent({
    agentId: 'validator-001',
    agentType: 'validator',
    capabilities: ['data_validation', 'quality_assurance'],
    status: 'idle',
    currentLoad: 0
  });

  await orchestrator.registerAgent({
    agentId: 'reporter-001',
    agentType: 'reporter',
    capabilities: ['report_generation', 'data_visualization'],
    status: 'idle',
    currentLoad: 0
  });

  try {
    // Process large dataset
    const dataset = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: Math.random() * 100,
      category: ['A', 'B', 'C'][i % 3]
    }));

    const result = await orchestrator.processLargeDataset(dataset);
    console.log('🎉 Multi-agent processing completed:', result);

  } catch (error) {
    console.error('❌ Multi-agent coordination failed:', error);
  }
}

// Run example
multiAgentExample();
```

---

## 🔗 Related Resources

- **[Developer Resources Overview](./README.md)** - Complete developer guide
- **[Quick Start Guide](./quick-start.md)** - Get started quickly
- **[Comprehensive Tutorials](./tutorials.md)** - Step-by-step learning
- **[SDK Documentation](./sdk.md)** - Language-specific guides
- **[Community Resources](./community-resources.md)** - Community support

---

**Examples Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025  
**Status**: Production Ready  

**⚠️ Alpha Notice**: These code examples provide production-ready implementations for MPLP v1.0 Alpha. Additional examples and use cases will be added in Beta release based on developer feedback and community contributions.
