# Agent Orchestrator - Enterprise Multi-Agent Orchestration Platform

[![Version](https://img.shields.io/badge/version-1.1.0--beta-blue.svg)](https://github.com/mplp/agent-orchestrator)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![MPLP SDK](https://img.shields.io/badge/MPLP%20SDK-v1.1.0--beta-orange.svg)](https://github.com/mplp/sdk)

Enterprise-grade multi-agent orchestration platform built with **MPLP SDK v1.1.0**. This example demonstrates advanced agent deployment, workflow orchestration, and system management capabilities using the MPLP (Multi-Agent Protocol Lifecycle Platform) framework.

## 🚀 Features

### 🤖 **Advanced Agent Management**
- **Multi-Strategy Deployment**: Single, Replicated, Distributed, Load-Balanced
- **Dynamic Scaling**: Horizontal and vertical scaling with predictive algorithms
- **Health Monitoring**: Comprehensive health checks and recovery mechanisms
- **Resource Management**: CPU, memory, storage, and network resource allocation
- **Dependency Management**: Agent dependency resolution and orchestration

### 🔄 **Intelligent Workflow Orchestration**
- **Multiple Execution Modes**: Sequential, Parallel, Conditional, Event-Driven
- **Advanced Triggers**: Manual, Scheduled, Event-based, Webhook triggers
- **Failure Handling**: Retry policies, circuit breakers, failover mechanisms
- **Real-time Monitoring**: Workflow execution tracking and performance metrics
- **Conditional Logic**: Complex workflow conditions and branching

### 📊 **Enterprise Monitoring & Analytics**
- **Real-time Metrics**: System performance, resource usage, and health metrics
- **Distributed Tracing**: End-to-end request tracing and performance analysis
- **Alerting System**: Configurable alerts with multiple notification channels
- **Audit Logging**: Comprehensive audit trails for compliance and debugging
- **Performance Analytics**: Throughput, latency, and error rate analysis

### 🛡️ **Security & Compliance**
- **Authentication**: Multi-provider authentication (Local, OAuth2, SAML, LDAP)
- **Authorization**: Role-based access control (RBAC) and attribute-based access control (ABAC)
- **Encryption**: Data encryption at rest, in transit, and in memory
- **Network Security**: Firewall rules, network segmentation, and secure communication
- **Audit & Compliance**: Comprehensive audit logging and compliance reporting

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **TypeScript**: >= 5.0.0

### **Install MPLP** ⚡

Before running this example, install MPLP:

```bash
# Install MPLP core package (Required)
npm install mplp@beta

# Verify installation
node -e "const mplp = require('mplp'); console.log('MPLP Version:', mplp.MPLP_VERSION);"
# Expected output: MPLP Version: 1.1.0
```

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/Coregentis/MPLP-Protocol.git
cd MPLP-Protocol/examples/agent-orchestrator

# Install dependencies (MPLP will be installed automatically)
npm install

# Build the project
npm run build
```

## 🚀 Quick Start

### 1. **Basic Usage**

```typescript
import { AgentOrchestrator, createSampleConfig } from '@mplp/agent-orchestrator';

// Create orchestrator with sample configuration
const config = createSampleConfig();
const orchestrator = new AgentOrchestrator(config);

// Initialize and start
await orchestrator.initialize();
await orchestrator.start();

// Execute a workflow
const executionId = await orchestrator.executeWorkflow('sample-workflow', {
  inputData: 'your data here',
  priority: 'high'
});

console.log(`Workflow executed: ${executionId}`);
```

### 2. **Advanced Configuration**

```typescript
import { 
  AgentOrchestrator, 
  AgentOrchestratorConfig,
  DeploymentStrategy,
  ExecutionMode 
} from '@mplp/agent-orchestrator';

const config: AgentOrchestratorConfig = {
  name: 'My Enterprise Orchestrator',
  version: '1.1.0',
  description: 'Custom enterprise orchestration platform',
  
  // Agent configurations
  agents: [
    {
      id: 'data-processor',
      name: 'Data Processing Agent',
      type: 'processor',
      strategy: DeploymentStrategy.REPLICATED,
      replicas: 3,
      config: {
        name: 'Data Processing Agent',
        capabilities: ['data_analysis', 'machine_learning', 'task_automation']
      },
      resources: {
        cpu: 2,
        memory: 1024,
        storage: 2048,
        network: {
          ports: [
            { name: 'http', port: 8080, protocol: 'http', exposed: true },
            { name: 'grpc', port: 9090, protocol: 'tcp', exposed: false }
          ],
          protocols: ['http', 'grpc'],
          security: {
            encryption: true,
            authentication: true,
            authorization: true,
            firewall: {
              enabled: true,
              rules: [
                {
                  name: 'allow-api',
                  action: 'allow',
                  source: '10.0.0.0/8',
                  destination: '0.0.0.0/0',
                  port: 8080,
                  protocol: 'tcp'
                }
              ]
            }
          }
        }
      },
      healthCheck: {
        enabled: true,
        interval: 30,
        timeout: 10,
        retries: 3,
        endpoint: '/health'
      },
      dependencies: []
    }
  ],
  
  // Workflow configurations
  workflows: [
    {
      id: 'ml-pipeline',
      name: 'Machine Learning Pipeline',
      description: 'End-to-end ML pipeline with data processing and model training',
      mode: ExecutionMode.SEQUENTIAL,
      steps: [
        {
          id: 'data-ingestion',
          name: 'Data Ingestion',
          agentId: 'data-processor',
          action: 'ingest',
          parameters: {
            source: 'data-lake',
            format: 'parquet',
            validation: true
          },
          timeout: 300,
          retries: 2,
          onSuccess: 'data-preprocessing',
          onFailure: 'handle-ingestion-error'
        },
        {
          id: 'data-preprocessing',
          name: 'Data Preprocessing',
          agentId: 'data-processor',
          action: 'preprocess',
          parameters: {
            cleanMissingValues: true,
            normalizeFeatures: true,
            splitRatio: 0.8
          },
          timeout: 600,
          retries: 3,
          onSuccess: 'model-training',
          onFailure: 'handle-preprocessing-error'
        },
        {
          id: 'model-training',
          name: 'Model Training',
          agentId: 'data-processor',
          action: 'train',
          parameters: {
            algorithm: 'random_forest',
            hyperparameters: {
              n_estimators: 100,
              max_depth: 10,
              random_state: 42
            }
          },
          timeout: 1800,
          retries: 1,
          onSuccess: 'model-evaluation',
          onFailure: 'handle-training-error'
        }
      ],
      triggers: [
        {
          id: 'scheduled-training',
          name: 'Daily Model Training',
          type: 'schedule',
          config: {
            schedule: '0 2 * * *' // Daily at 2 AM
          },
          enabled: true
        }
      ],
      conditions: [],
      timeout: 3600,
      retries: 1
    }
  ],
  
  // Orchestration settings
  orchestration: {
    maxConcurrentWorkflows: 10,
    maxConcurrentAgents: 50,
    resourceAllocation: {
      strategy: 'priority',
      priorities: {
        'critical': 100,
        'high': 75,
        'medium': 50,
        'low': 25
      },
      limits: {
        cpu: 32,
        memory: 65536,
        storage: 1048576,
        network: 10000
      }
    },
    failureHandling: {
      strategy: 'circuit_breaker',
      retryPolicy: {
        maxRetries: 5,
        backoffStrategy: 'exponential',
        baseDelay: 1000,
        maxDelay: 60000,
        jitter: true
      },
      circuitBreaker: {
        enabled: true,
        failureThreshold: 10,
        recoveryTimeout: 120000,
        halfOpenMaxCalls: 5
      },
      failover: {
        enabled: true,
        strategy: 'active_active',
        healthCheckInterval: 15000,
        switchoverTimeout: 5000
      }
    },
    communication: {
      protocol: 'grpc',
      serialization: 'protobuf',
      compression: true,
      encryption: true,
      messageQueue: {
        type: 'kafka',
        connection: {
          brokers: ['kafka-1:9092', 'kafka-2:9092', 'kafka-3:9092'],
          clientId: 'agent-orchestrator',
          ssl: true
        },
        topics: [
          {
            name: 'agent-events',
            partitions: 12,
            replication: 3,
            retention: 604800 // 7 days
          },
          {
            name: 'workflow-events',
            partitions: 6,
            replication: 3,
            retention: 259200 // 3 days
          }
        ]
      }
    }
  },
  
  // Monitoring configuration
  monitoring: {
    enabled: true,
    metrics: {
      enabled: true,
      interval: 30,
      retention: 604800, // 7 days
      exporters: [
        {
          type: 'prometheus',
          config: {
            port: 9090,
            path: '/metrics',
            labels: {
              service: 'agent-orchestrator',
              environment: 'production'
            }
          }
        },
        {
          type: 'datadog',
          config: {
            apiKey: process.env.DATADOG_API_KEY,
            tags: ['service:agent-orchestrator', 'env:production']
          }
        }
      ]
    },
    logging: {
      level: 'info',
      format: 'json',
      outputs: [
        {
          type: 'console',
          config: {
            colorize: false
          }
        },
        {
          type: 'file',
          config: {
            filename: '/var/log/agent-orchestrator/app.log',
            maxSize: 100,
            maxFiles: 10
          }
        },
        {
          type: 'elasticsearch',
          config: {
            host: 'elasticsearch:9200',
            index: 'agent-orchestrator-logs',
            type: 'log'
          }
        }
      ],
      rotation: {
        enabled: true,
        maxSize: 100,
        maxFiles: 30,
        maxAge: 30
      }
    },
    alerting: {
      enabled: true,
      rules: [
        {
          name: 'High Error Rate',
          condition: 'error_rate > 0.05',
          severity: 'critical',
          threshold: 0.05,
          duration: 300,
          channels: ['slack', 'email', 'pagerduty']
        },
        {
          name: 'High Memory Usage',
          condition: 'memory_usage > 0.85',
          severity: 'high',
          threshold: 0.85,
          duration: 600,
          channels: ['slack', 'email']
        },
        {
          name: 'Workflow Failure',
          condition: 'workflow_failure_count > 3',
          severity: 'medium',
          threshold: 3,
          duration: 1800,
          channels: ['slack']
        }
      ],
      channels: [
        {
          name: 'slack',
          type: 'slack',
          config: {
            webhook: process.env.SLACK_WEBHOOK_URL,
            channel: '#alerts',
            username: 'Agent Orchestrator'
          }
        },
        {
          name: 'email',
          type: 'email',
          config: {
            smtp: {
              host: 'smtp.company.com',
              port: 587,
              secure: false,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
              }
            },
            from: 'alerts@company.com',
            to: ['ops-team@company.com', 'dev-team@company.com']
          }
        },
        {
          name: 'pagerduty',
          type: 'webhook',
          config: {
            url: 'https://events.pagerduty.com/v2/enqueue',
            headers: {
              'Authorization': `Token token=${process.env.PAGERDUTY_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        }
      ]
    },
    tracing: {
      enabled: true,
      sampler: {
        type: 'probability',
        config: {
          probability: 0.1
        }
      },
      exporters: [
        {
          type: 'jaeger',
          config: {
            endpoint: 'http://jaeger:14268/api/traces',
            serviceName: 'agent-orchestrator'
          }
        }
      ]
    }
  },
  
  // Auto-scaling configuration
  scaling: {
    enabled: true,
    strategy: 'predictive',
    horizontal: {
      minReplicas: 2,
      maxReplicas: 20,
      targetCPU: 70,
      targetMemory: 80,
      scaleUpCooldown: 300,
      scaleDownCooldown: 900
    },
    vertical: {
      minCPU: 0.5,
      maxCPU: 8,
      minMemory: 512,
      maxMemory: 16384,
      scalingFactor: 2.0
    },
    predictive: {
      algorithm: 'neural_network',
      lookbackPeriod: 7200, // 2 hours
      forecastPeriod: 3600,  // 1 hour
      confidence: 0.85
    }
  },
  
  // Security configuration
  security: {
    authentication: {
      enabled: true,
      providers: [
        {
          name: 'oauth2',
          type: 'oauth2',
          config: {
            clientId: process.env.OAUTH2_CLIENT_ID,
            clientSecret: process.env.OAUTH2_CLIENT_SECRET,
            authorizationURL: 'https://auth.company.com/oauth2/authorize',
            tokenURL: 'https://auth.company.com/oauth2/token',
            scope: ['read', 'write', 'admin']
          }
        },
        {
          name: 'ldap',
          type: 'ldap',
          config: {
            url: 'ldap://ldap.company.com:389',
            bindDN: 'cn=admin,dc=company,dc=com',
            bindCredentials: process.env.LDAP_PASSWORD,
            searchBase: 'ou=users,dc=company,dc=com',
            searchFilter: '(uid={{username}})'
          }
        }
      ],
      tokenExpiry: 7200, // 2 hours
      refreshTokens: true
    },
    authorization: {
      enabled: true,
      model: 'rbac',
      roles: [
        {
          name: 'admin',
          permissions: ['*'],
          inherits: []
        },
        {
          name: 'operator',
          permissions: [
            'agents:read',
            'agents:deploy',
            'agents:scale',
            'workflows:read',
            'workflows:execute',
            'metrics:read'
          ],
          inherits: ['viewer']
        },
        {
          name: 'viewer',
          permissions: [
            'agents:read',
            'workflows:read',
            'metrics:read'
          ],
          inherits: []
        }
      ],
      policies: [
        {
          name: 'admin-full-access',
          effect: 'allow',
          actions: ['*'],
          resources: ['*'],
          conditions: [
            {
              field: 'user.role',
              operator: 'equals',
              value: 'admin'
            }
          ]
        },
        {
          name: 'operator-limited-access',
          effect: 'allow',
          actions: ['read', 'execute', 'deploy', 'scale'],
          resources: ['agents/*', 'workflows/*', 'metrics/*'],
          conditions: [
            {
              field: 'user.role',
              operator: 'equals',
              value: 'operator'
            }
          ]
        }
      ]
    },
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyManagement: {
        provider: 'aws_kms',
        rotation: true,
        rotationInterval: 86400 // Daily
      },
      dataEncryption: {
        atRest: true,
        inTransit: true,
        inMemory: true
      }
    },
    audit: {
      enabled: true,
      events: [
        'agent_deployed',
        'agent_scaled',
        'agent_stopped',
        'workflow_executed',
        'workflow_failed',
        'config_updated',
        'user_login',
        'user_logout',
        'permission_denied'
      ],
      storage: {
        type: 'elasticsearch',
        config: {
          host: 'elasticsearch:9200',
          index: 'agent-orchestrator-audit',
          type: 'audit'
        }
      },
      retention: 7776000 // 90 days
    }
  }
};

const orchestrator = new AgentOrchestrator(config);
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Clean build artifacts
npm run clean
```

## 📊 Monitoring & Metrics

The Agent Orchestrator provides comprehensive monitoring capabilities:

### **System Metrics**
- Agent deployment status and health
- Workflow execution statistics
- Resource utilization (CPU, memory, storage, network)
- Performance metrics (throughput, latency, error rates)

### **Custom Metrics**
```typescript
// Get real-time system metrics
const metrics = orchestrator.getMetrics();
console.log('System Status:', {
  totalAgents: metrics.agents.total,
  runningAgents: metrics.agents.running,
  activeWorkflows: metrics.workflows.running,
  systemUptime: metrics.performance.uptime,
  errorRate: metrics.performance.errorRate
});
```

### **Health Checks**
```typescript
// Check orchestrator health
const status = orchestrator.getStatus();
console.log('Orchestrator Status:', status);

// Get detailed health information
const health = await orchestrator.getHealthStatus();
console.log('Health Details:', health);
```

## 🔐 Security Features

### **Authentication & Authorization**
- Multi-provider authentication (OAuth2, SAML, LDAP, Local)
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- JWT token management with refresh tokens

### **Data Protection**
- End-to-end encryption
- Data encryption at rest and in transit
- Secure key management with rotation
- Network security with firewall rules

### **Audit & Compliance**
- Comprehensive audit logging
- Compliance reporting
- Security event monitoring
- Access control logging

## 🚀 Production Deployment

### **Docker Deployment**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY config/ ./config/

EXPOSE 8080 9090
CMD ["node", "dist/index.js"]
```

### **Kubernetes Deployment**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-orchestrator
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-orchestrator
  template:
    metadata:
      labels:
        app: agent-orchestrator
    spec:
      containers:
      - name: agent-orchestrator
        image: mplp/agent-orchestrator:1.1.0
        ports:
        - containerPort: 8080
        - containerPort: 9090
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_HOST
          value: "redis-service"
        - name: KAFKA_BROKERS
          value: "kafka-1:9092,kafka-2:9092,kafka-3:9092"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 📚 API Reference

### **Core Classes**

#### **AgentOrchestrator**
Main orchestrator class for managing agents and workflows.

```typescript
class AgentOrchestrator extends EventEmitter {
  constructor(config: AgentOrchestratorConfig)
  
  // Lifecycle methods
  async initialize(): Promise<void>
  async start(): Promise<void>
  async stop(): Promise<void>
  
  // Agent management
  async deployAgent(config: AgentDeploymentConfig): Promise<string>
  async scaleAgent(agentId: string, replicas: number): Promise<void>
  
  // Workflow management
  async executeWorkflow(workflowId: string, parameters?: Record<string, unknown>): Promise<string>
  
  // Status and metrics
  getStatus(): OrchestratorStatus
  getMetrics(): SystemMetrics
  getConfig(): AgentOrchestratorConfig
  
  // Configuration management
  async updateConfig(updates: Partial<AgentOrchestratorConfig>): Promise<void>
}
```

#### **ConfigManager**
Configuration management and validation.

```typescript
class ConfigManager {
  constructor(logger: Logger)
  
  async loadConfig(): Promise<AgentOrchestratorConfig>
  getConfig(): AgentOrchestratorConfig
  updateConfig(updates: Partial<AgentOrchestratorConfig>): void
}
```

#### **AgentManager**
Agent deployment and lifecycle management.

```typescript
class AgentManager {
  constructor(logger: Logger)
  
  async initialize(agentConfigs: AgentDeploymentConfig[]): Promise<void>
  async start(): Promise<void>
  async stop(): Promise<void>
  
  async deployAgent(config: AgentDeploymentConfig): Promise<string>
  async scaleAgent(agentId: string, replicas: number): Promise<void>
  
  getDeployment(agentId: string): AgentDeploymentConfig | undefined
  listDeployments(): AgentDeploymentConfig[]
}
```

#### **WorkflowManager**
Workflow execution and management.

```typescript
class WorkflowManager {
  constructor(logger: Logger)
  
  async initialize(workflowConfigs: WorkflowConfig[]): Promise<void>
  async start(): Promise<void>
  async stop(): Promise<void>
  
  async executeWorkflow(workflowId: string, parameters?: Record<string, unknown>): Promise<string>
  
  getExecutionStatus(executionId: string): unknown
  listWorkflows(): WorkflowConfig[]
  listExecutions(): unknown[]
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [https://docs.mplp.dev](https://docs.mplp.dev)
- **Issues**: [GitHub Issues](https://github.com/mplp/agent-orchestrator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mplp/agent-orchestrator/discussions)
- **Email**: support@mplp.dev

## 🙏 Acknowledgments

Built with ❤️ using:
- **MPLP SDK v1.1.0** - Multi-Agent Protocol Lifecycle Platform
- **TypeScript** - Type-safe JavaScript development
- **Node.js** - JavaScript runtime environment
- **Jest** - JavaScript testing framework

---

**Agent Orchestrator v1.1.0** - Enterprise Multi-Agent Orchestration Platform  
© 2025 MPLP Team. All rights reserved.
