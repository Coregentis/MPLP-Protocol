# Basic Multi-Agent Coordination Example

**MPLP v1.0 Alpha - Beginner Example**

[![Difficulty](https://img.shields.io/badge/difficulty-Beginner-green.svg)](../README.md)
[![Runtime](https://img.shields.io/badge/runtime-Node.js%2018+-blue.svg)](../README.md)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](../../../LICENSE)

---

## 🎯 Overview

This example demonstrates the fundamental concepts of multi-agent coordination using MPLP v1.0 Alpha. You'll learn how to create contexts, register agents, distribute tasks, and collect results in a simple but realistic scenario.

### **Scenario: Document Processing Pipeline**

Imagine a document processing system where multiple agents work together to process a batch of documents:

1. **Coordinator Agent**: Manages the overall workflow and task distribution
2. **Parser Agents**: Extract text and metadata from documents
3. **Analyzer Agents**: Perform content analysis and classification
4. **Reporter Agent**: Aggregates results and generates reports

---

## 🏗️ Architecture

### **System Components**

```
┌─────────────────────────────────────────────────────────────┐
│                Document Processing System                   │
├─────────────────────────────────────────────────────────────┤
│  Application Layer                                          │
│  ├── DocumentProcessor (main orchestrator)                 │
│  ├── TaskDistributor (distributes work to agents)          │
│  └── ResultCollector (aggregates processing results)       │
├─────────────────────────────────────────────────────────────┤
│  Agent Layer                                               │
│  ├── CoordinatorAgent (workflow management)                │
│  ├── ParserAgent (document parsing)                        │
│  ├── AnalyzerAgent (content analysis)                      │
│  └── ReporterAgent (result reporting)                      │
├─────────────────────────────────────────────────────────────┤
│  MPLP L2 Coordination Layer                                │
│  ├── Context Module (execution context management)         │
│  ├── Plan Module (task planning and scheduling)            │
│  └── Role Module (agent role and permission management)    │
├─────────────────────────────────────────────────────────────┤
│  MPLP L1 Protocol Layer                                    │
│  ├── Schema Validation (data structure validation)         │
│  ├── Message Serialization (protocol message handling)     │
│  └── Cross-cutting Concerns (logging, error handling)      │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow**

```
Documents → Coordinator → Parser Agents → Analyzer Agents → Reporter → Results
     ↓           ↓              ↓              ↓            ↓         ↓
   Context    Task Plan    Parse Results   Analysis     Report    Final
  Creation   Generation      Storage       Results     Generation  Output
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18.x or higher
- npm 9.x or higher
- MPLP v1.0 Alpha installed

### **Installation and Setup**

```bash
# Navigate to the example directory
cd docs/examples/basic-coordination

# Install dependencies
npm install

# Run the example
npm start

# Run with debug logging
npm run start:debug

# Run tests
npm test
```

### **Expected Output**

```
🚀 Starting Document Processing Pipeline...

📋 Creating execution context...
✅ Context created: ctx-doc-processing-001

👥 Registering agents...
✅ Coordinator Agent registered: agent-coordinator-001
✅ Parser Agent registered: agent-parser-001
✅ Parser Agent registered: agent-parser-002
✅ Analyzer Agent registered: agent-analyzer-001
✅ Reporter Agent registered: agent-reporter-001

📄 Processing documents...
📝 Document 1: contract.pdf → Parser Agent 1
📝 Document 2: report.docx → Parser Agent 2
📝 Document 3: presentation.pptx → Parser Agent 1

⚡ Parsing completed, starting analysis...
🔍 Analysis results: 3 documents processed
📊 Classification: 1 contract, 1 report, 1 presentation

📈 Generating final report...
✅ Processing completed successfully!

📋 Results Summary:
- Total documents processed: 3
- Processing time: 2.3 seconds
- Success rate: 100%
- Agents utilized: 5
```

---

## 📁 Project Structure

```
basic-coordination/
├── src/
│   ├── agents/
│   │   ├── base-agent.ts           # Base agent implementation
│   │   ├── coordinator-agent.ts    # Workflow coordination
│   │   ├── parser-agent.ts         # Document parsing
│   │   ├── analyzer-agent.ts       # Content analysis
│   │   └── reporter-agent.ts       # Result reporting
│   ├── config/
│   │   ├── mplp-config.ts          # MPLP configuration
│   │   └── agent-config.ts         # Agent-specific configuration
│   ├── types/
│   │   ├── document.ts             # Document type definitions
│   │   ├── task.ts                 # Task type definitions
│   │   └── result.ts               # Result type definitions
│   ├── utils/
│   │   ├── logger.ts               # Logging utilities
│   │   └── helpers.ts              # Helper functions
│   └── main.ts                     # Main application entry point
├── tests/
│   ├── unit/
│   │   ├── agents/                 # Agent unit tests
│   │   └── utils/                  # Utility unit tests
│   ├── integration/
│   │   └── workflow.test.ts        # End-to-end workflow tests
│   └── fixtures/
│       └── sample-documents/       # Test documents
├── docs/
│   ├── ARCHITECTURE.md             # Detailed architecture
│   ├── API.md                      # API documentation
│   └── TROUBLESHOOTING.md          # Common issues
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── jest.config.js                  # Test configuration
└── README.md                       # This file
```

---

## 🔧 Configuration

### **MPLP Configuration**

```typescript
// src/config/mplp-config.ts
export const mplpConfig = {
  // Protocol Layer Configuration
  protocol: {
    version: '1.0.0-alpha',
    serialization: 'json',
    validation: 'strict',
    timeout: 30000
  },
  
  // Context Configuration
  context: {
    name: 'document-processing-pipeline',
    type: 'collaborative',
    maxParticipants: 10,
    persistenceLevel: 'session'
  },
  
  // Agent Configuration
  agents: {
    maxConcurrency: 5,
    retryAttempts: 3,
    healthCheckInterval: 10000
  },
  
  // Logging Configuration
  logging: {
    level: 'info',
    format: 'structured',
    includeTimestamp: true
  }
};
```

### **Agent Configuration**

```typescript
// src/config/agent-config.ts
export const agentConfig = {
  coordinator: {
    maxTasks: 100,
    batchSize: 10,
    schedulingStrategy: 'round-robin'
  },
  
  parser: {
    supportedFormats: ['pdf', 'docx', 'txt', 'pptx'],
    maxFileSize: '10MB',
    timeout: 15000
  },
  
  analyzer: {
    analysisTypes: ['classification', 'sentiment', 'keywords'],
    confidenceThreshold: 0.8,
    maxTextLength: 50000
  },
  
  reporter: {
    outputFormat: 'json',
    includeMetrics: true,
    templatePath: './templates/report.hbs'
  }
};
```

---

## 💻 Code Examples

### **Creating and Managing Context**

```typescript
// src/main.ts
import { ContextService, ContextConfig } from 'mplp';

async function createProcessingContext(): Promise<Context> {
  const contextService = new ContextService();
  
  const config: ContextConfig = {
    name: 'document-processing-pipeline',
    type: 'collaborative',
    maxParticipants: 10,
    metadata: {
      purpose: 'Document processing and analysis',
      owner: 'system',
      priority: 'normal'
    }
  };
  
  const context = await contextService.createContext(config);
  console.log(`✅ Context created: ${context.getId()}`);
  
  return context;
}
```

### **Agent Implementation**

```typescript
// src/agents/parser-agent.ts
import { BaseAgent, Task, TaskResult } from './base-agent';
import { Document, ParsedDocument } from '../types/document';

export class ParserAgent extends BaseAgent {
  constructor(id: string) {
    super(id, 'parser', ['pdf', 'docx', 'txt', 'pptx']);
  }
  
  async processTask(task: Task): Promise<TaskResult> {
    const document = task.data as Document;
    
    try {
      // Simulate document parsing
      const parsedContent = await this.parseDocument(document);
      
      return {
        success: true,
        data: parsedContent,
        metadata: {
          processingTime: Date.now() - task.startTime,
          agentId: this.id,
          documentType: document.type
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: {
          agentId: this.id,
          failureReason: 'parsing_error'
        }
      };
    }
  }
  
  private async parseDocument(document: Document): Promise<ParsedDocument> {
    // Simulate parsing delay
    await this.delay(Math.random() * 2000 + 1000);
    
    return {
      id: document.id,
      title: this.extractTitle(document),
      content: this.extractContent(document),
      metadata: {
        pageCount: Math.floor(Math.random() * 50) + 1,
        wordCount: Math.floor(Math.random() * 5000) + 100,
        language: 'en',
        extractedAt: new Date().toISOString()
      }
    };
  }
  
  private extractTitle(document: Document): string {
    // Simple title extraction simulation
    return document.filename.replace(/\.[^/.]+$/, "");
  }
  
  private extractContent(document: Document): string {
    // Simulate content extraction
    return `Extracted content from ${document.filename}...`;
  }
}
```

### **Task Distribution and Coordination**

```typescript
// src/agents/coordinator-agent.ts
import { BaseAgent, Task, TaskResult } from './base-agent';
import { Document } from '../types/document';

export class CoordinatorAgent extends BaseAgent {
  private taskQueue: Task[] = [];
  private results: TaskResult[] = [];
  
  constructor(id: string) {
    super(id, 'coordinator', ['workflow-management']);
  }
  
  async distributeDocuments(documents: Document[], agents: BaseAgent[]): Promise<void> {
    console.log(`📄 Distributing ${documents.length} documents to ${agents.length} agents...`);
    
    // Create tasks for each document
    const tasks = documents.map(doc => ({
      id: `task-${doc.id}`,
      type: 'parse',
      data: doc,
      startTime: Date.now(),
      priority: 'normal'
    }));
    
    // Distribute tasks using round-robin strategy
    for (let i = 0; i < tasks.length; i++) {
      const agent = agents[i % agents.length];
      const task = tasks[i];
      
      console.log(`📝 ${doc.filename} → ${agent.getRole()} ${agent.getId()}`);
      
      // Process task asynchronously
      this.processTaskAsync(agent, task);
    }
  }
  
  private async processTaskAsync(agent: BaseAgent, task: Task): Promise<void> {
    try {
      const result = await agent.processTask(task);
      this.results.push(result);
      
      if (result.success) {
        console.log(`✅ Task ${task.id} completed by ${agent.getId()}`);
      } else {
        console.log(`❌ Task ${task.id} failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`💥 Unexpected error processing task ${task.id}:`, error);
    }
  }
  
  getResults(): TaskResult[] {
    return [...this.results];
  }
  
  getCompletionRate(): number {
    const completed = this.results.filter(r => r.success).length;
    return this.results.length > 0 ? completed / this.results.length : 0;
  }
}
```

---

## 🧪 Testing

### **Running Tests**

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### **Test Examples**

```typescript
// tests/integration/workflow.test.ts
import { DocumentProcessor } from '../../src/main';
import { Document } from '../../src/types/document';

describe('Document Processing Workflow', () => {
  let processor: DocumentProcessor;
  
  beforeEach(() => {
    processor = new DocumentProcessor();
  });
  
  test('should process documents successfully', async () => {
    // Arrange
    const documents: Document[] = [
      { id: '1', filename: 'test1.pdf', type: 'pdf', size: 1024 },
      { id: '2', filename: 'test2.docx', type: 'docx', size: 2048 }
    ];
    
    // Act
    const results = await processor.processDocuments(documents);
    
    // Assert
    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
    expect(processor.getCompletionRate()).toBe(1.0);
  });
  
  test('should handle processing errors gracefully', async () => {
    // Arrange
    const invalidDocument: Document = {
      id: '3',
      filename: 'invalid.xyz',
      type: 'unknown',
      size: 0
    };
    
    // Act
    const results = await processor.processDocuments([invalidDocument]);
    
    // Assert
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toBeDefined();
  });
});
```

---

## 🔍 Key Learning Points

### **1. Context Management**
- How to create and configure execution contexts
- Managing context lifecycle and cleanup
- Context-specific configuration and metadata

### **2. Agent Coordination**
- Implementing different agent types with specific capabilities
- Task distribution strategies (round-robin, load-based, capability-based)
- Inter-agent communication and result aggregation

### **3. Error Handling**
- Graceful error handling and recovery mechanisms
- Retry strategies and failure isolation
- Comprehensive logging and monitoring

### **4. MPLP Protocol Usage**
- L1 Protocol Layer: Schema validation and message serialization
- L2 Coordination Layer: Context, Plan, and Role module integration
- L3 Execution Layer: Workflow orchestration and monitoring

### **5. Performance Considerations**
- Asynchronous task processing and parallel execution
- Resource management and memory optimization
- Performance monitoring and metrics collection

---

## 🚀 Next Steps

### **Extend This Example**
1. **Add More Agent Types**: Implement additional specialized agents
2. **Enhance Error Handling**: Add more sophisticated retry and recovery logic
3. **Implement Caching**: Add result caching for improved performance
4. **Add Monitoring**: Integrate comprehensive monitoring and alerting
5. **Scale Horizontally**: Distribute agents across multiple processes

### **Explore Other Examples**
- [Collaborative Planning](../collaborative-planning/) - Advanced planning and coordination
- [Enterprise Workflow](../enterprise-workflow/) - Production-ready deployment
- [Real-time Communication](../realtime-communication/) - Event-driven architecture
- [Custom Extensions](../custom-extensions/) - Building custom MPLP extensions

### **Learn More**
- [MPLP Architecture Guide](../../architecture/architecture-overview.md)
- [API Reference](../../api-reference/)
- [Best Practices](../../guides/best-practices.md)
- [Performance Tuning](../../guides/performance-tuning.md)

---

**Example Version**: 1.0  
**Last Updated**: September 3, 2025  
**Compatibility**: MPLP v1.0 Alpha  
**Difficulty**: Beginner  

**⚠️ Alpha Notice**: This example demonstrates core MPLP concepts and may be updated as the platform evolves. Check the documentation for the latest features and best practices.
