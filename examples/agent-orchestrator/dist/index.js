"use strict";
/**
 * @fileoverview Agent Orchestrator - Main entry point
 * @version 1.1.0-beta
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowManager = exports.AgentManager = exports.ConfigManager = exports.AgentOrchestrator = void 0;
exports.createSampleConfig = createSampleConfig;
const AgentOrchestrator_1 = require("./core/AgentOrchestrator");
const ConfigManager_1 = require("./config/ConfigManager");
const core_1 = require("@mplp/core");
const types_1 = require("./types");
// Re-export main classes and types
var AgentOrchestrator_2 = require("./core/AgentOrchestrator");
Object.defineProperty(exports, "AgentOrchestrator", { enumerable: true, get: function () { return AgentOrchestrator_2.AgentOrchestrator; } });
var ConfigManager_2 = require("./config/ConfigManager");
Object.defineProperty(exports, "ConfigManager", { enumerable: true, get: function () { return ConfigManager_2.ConfigManager; } });
var AgentManager_1 = require("./agents/AgentManager");
Object.defineProperty(exports, "AgentManager", { enumerable: true, get: function () { return AgentManager_1.AgentManager; } });
var WorkflowManager_1 = require("./workflows/WorkflowManager");
Object.defineProperty(exports, "WorkflowManager", { enumerable: true, get: function () { return WorkflowManager_1.WorkflowManager; } });
__exportStar(require("./types"), exports);
/**
 * Main entry point for Agent Orchestrator
 */
async function main() {
    const logger = new core_1.Logger('AgentOrchestrator-Main');
    try {
        logger.info('🚀 Starting Agent Orchestrator...');
        // Create configuration manager
        const configManager = new ConfigManager_1.ConfigManager(logger);
        // Load configuration
        const config = await configManager.loadConfig();
        logger.info(`Configuration loaded: ${config.name} v${config.version}`);
        // Create and initialize orchestrator
        const orchestrator = new AgentOrchestrator_1.AgentOrchestrator(config);
        // Setup event listeners
        setupEventListeners(orchestrator, logger);
        // Initialize orchestrator
        await orchestrator.initialize();
        logger.info('✅ Agent Orchestrator initialized successfully');
        // Start orchestrator
        await orchestrator.start();
        logger.info('🎉 Agent Orchestrator started successfully');
        // Example: Execute sample workflow
        if (process.env.NODE_ENV === 'development') {
            await demonstrateFeatures(orchestrator, logger);
        }
        // Keep the process running
        process.on('SIGINT', async () => {
            logger.info('Received SIGINT, shutting down gracefully...');
            await orchestrator.stop();
            process.exit(0);
        });
        process.on('SIGTERM', async () => {
            logger.info('Received SIGTERM, shutting down gracefully...');
            await orchestrator.stop();
            process.exit(0);
        });
    }
    catch (error) {
        logger.error('❌ Failed to start Agent Orchestrator:', error);
        process.exit(1);
    }
}
/**
 * Setup event listeners for the orchestrator
 */
function setupEventListeners(orchestrator, logger) {
    orchestrator.on('initializing', () => {
        logger.info('🔄 Orchestrator is initializing...');
    });
    orchestrator.on('initialized', () => {
        logger.info('✅ Orchestrator initialized successfully');
    });
    orchestrator.on('starting', () => {
        logger.info('🔄 Orchestrator is starting...');
    });
    orchestrator.on('started', () => {
        logger.info('🎉 Orchestrator started successfully');
    });
    orchestrator.on('stopping', () => {
        logger.info('🔄 Orchestrator is stopping...');
    });
    orchestrator.on('stopped', () => {
        logger.info('⏹️ Orchestrator stopped successfully');
    });
    orchestrator.on('error', (error) => {
        logger.error('❌ Orchestrator error:', error);
    });
    orchestrator.on('configUpdated', (config) => {
        logger.info('🔧 Orchestrator configuration updated:', config.name);
    });
}
/**
 * Demonstrate orchestrator features (development mode only)
 */
async function demonstrateFeatures(orchestrator, logger) {
    try {
        logger.info('🎭 Demonstrating Agent Orchestrator features...');
        // Wait a moment for orchestrator to fully start
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Get orchestrator status
        const status = orchestrator.getStatus();
        logger.info(`📊 Orchestrator Status: ${status}`);
        // Get system metrics
        const metrics = orchestrator.getMetrics();
        logger.info('📈 System Metrics:', {
            agents: metrics.agents,
            workflows: metrics.workflows,
            uptime: metrics.performance.uptime
        });
        // Execute sample workflow
        logger.info('🚀 Executing sample workflow...');
        const executionId = await orchestrator.executeWorkflow('data-processing-workflow', {
            inputData: 'sample data for processing',
            priority: 'high'
        });
        logger.info(`✅ Workflow executed successfully: ${executionId}`);
        // Deploy additional agent
        logger.info('📦 Deploying additional agent...');
        const newAgentConfig = {
            id: 'demo-agent',
            name: 'Demo Agent',
            type: 'demo',
            strategy: types_1.DeploymentStrategy.SINGLE,
            replicas: 1,
            config: {
                name: 'Demo Agent',
                capabilities: ['task_automation']
            },
            resources: {
                cpu: 0.5,
                memory: 256,
                storage: 512,
                network: {
                    ports: [{ name: 'http', port: 8082, protocol: 'http', exposed: true }],
                    protocols: ['http'],
                    security: {
                        encryption: false,
                        authentication: false,
                        authorization: false,
                        firewall: { enabled: false, rules: [] }
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
        };
        const agentId = await orchestrator.deployAgent(newAgentConfig);
        logger.info(`✅ Agent deployed successfully: ${agentId}`);
        // Scale existing agent
        logger.info('📈 Scaling existing agent...');
        await orchestrator.scaleAgent('data-processor-agent', 3);
        logger.info('✅ Agent scaled successfully');
        // Get updated metrics
        const updatedMetrics = orchestrator.getMetrics();
        logger.info('📊 Updated System Metrics:', {
            totalAgents: updatedMetrics.agents.total,
            runningAgents: updatedMetrics.agents.running,
            totalWorkflows: updatedMetrics.workflows.total
        });
        logger.info('🎉 Feature demonstration completed successfully');
    }
    catch (error) {
        logger.error('❌ Failed to demonstrate features:', error);
    }
}
/**
 * Create a sample configuration for testing
 */
function createSampleConfig() {
    return {
        name: 'MPLP Agent Orchestrator',
        version: '1.1.0-beta',
        description: 'Enterprise multi-agent orchestration platform built with MPLP SDK',
        agents: [
            {
                id: 'sample-agent-1',
                name: 'Sample Processing Agent',
                type: 'processor',
                strategy: types_1.DeploymentStrategy.REPLICATED,
                replicas: 2,
                config: {
                    name: 'Sample Processing Agent',
                    capabilities: ['data_analysis', 'task_automation']
                },
                resources: {
                    cpu: 1,
                    memory: 512,
                    storage: 1024,
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
                                        name: 'allow-http',
                                        action: 'allow',
                                        source: '0.0.0.0/0',
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
        workflows: [
            {
                id: 'sample-workflow',
                name: 'Sample Data Processing Workflow',
                description: 'A sample workflow demonstrating multi-step data processing',
                mode: types_1.ExecutionMode.SEQUENTIAL,
                steps: [
                    {
                        id: 'validate-input',
                        name: 'Validate Input Data',
                        agentId: 'sample-agent-1',
                        action: 'validate',
                        parameters: {
                            schema: 'input-schema-v1',
                            strict: true
                        },
                        timeout: 30,
                        retries: 2,
                        onSuccess: 'process-data',
                        onFailure: 'handle-validation-error'
                    },
                    {
                        id: 'process-data',
                        name: 'Process Data',
                        agentId: 'sample-agent-1',
                        action: 'process',
                        parameters: {
                            algorithm: 'standard',
                            parallel: true
                        },
                        timeout: 120,
                        retries: 3,
                        onSuccess: 'generate-report',
                        onFailure: 'handle-processing-error'
                    },
                    {
                        id: 'generate-report',
                        name: 'Generate Report',
                        agentId: 'sample-agent-1',
                        action: 'report',
                        parameters: {
                            format: 'json',
                            includeMetrics: true
                        },
                        timeout: 60,
                        retries: 1
                    }
                ],
                triggers: [
                    {
                        id: 'manual-trigger',
                        name: 'Manual Execution',
                        type: 'manual',
                        config: {},
                        enabled: true
                    },
                    {
                        id: 'scheduled-trigger',
                        name: 'Daily Processing',
                        type: 'schedule',
                        config: {
                            schedule: '0 2 * * *' // Daily at 2 AM
                        },
                        enabled: false
                    }
                ],
                conditions: [],
                timeout: 300,
                retries: 1
            }
        ],
        orchestration: {
            maxConcurrentWorkflows: 5,
            maxConcurrentAgents: 10,
            resourceAllocation: {
                strategy: 'fair',
                priorities: {
                    'high': 10,
                    'medium': 5,
                    'low': 1
                },
                limits: {
                    cpu: 8,
                    memory: 16384,
                    storage: 102400,
                    network: 1000
                }
            },
            failureHandling: {
                strategy: 'retry',
                retryPolicy: {
                    maxRetries: 3,
                    backoffStrategy: 'exponential',
                    baseDelay: 1000,
                    maxDelay: 30000,
                    jitter: true
                },
                circuitBreaker: {
                    enabled: true,
                    failureThreshold: 5,
                    recoveryTimeout: 60000,
                    halfOpenMaxCalls: 3
                },
                failover: {
                    enabled: false,
                    strategy: 'active_passive',
                    healthCheckInterval: 30000,
                    switchoverTimeout: 10000
                }
            },
            communication: {
                protocol: 'http',
                serialization: 'json',
                compression: true,
                encryption: true,
                messageQueue: {
                    type: 'redis',
                    connection: {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: parseInt(process.env.REDIS_PORT || '6379')
                    },
                    topics: [
                        {
                            name: 'orchestrator-events',
                            partitions: 3,
                            replication: 1,
                            retention: 86400
                        }
                    ]
                }
            }
        },
        monitoring: {
            enabled: true,
            metrics: {
                enabled: true,
                interval: 60,
                retention: 86400,
                exporters: []
            },
            logging: {
                level: 'info',
                format: 'json',
                outputs: [
                    {
                        type: 'console',
                        config: {}
                    }
                ],
                rotation: {
                    enabled: false,
                    maxSize: 100,
                    maxFiles: 10,
                    maxAge: 7
                }
            },
            alerting: {
                enabled: false,
                rules: [],
                channels: []
            },
            tracing: {
                enabled: false,
                sampler: {
                    type: 'never',
                    config: {}
                },
                exporters: []
            }
        },
        scaling: {
            enabled: false,
            strategy: 'manual',
            horizontal: {
                minReplicas: 1,
                maxReplicas: 5,
                targetCPU: 70,
                targetMemory: 80,
                scaleUpCooldown: 300,
                scaleDownCooldown: 600
            },
            vertical: {
                minCPU: 0.1,
                maxCPU: 2,
                minMemory: 128,
                maxMemory: 2048,
                scalingFactor: 1.5
            },
            predictive: {
                algorithm: 'linear_regression',
                lookbackPeriod: 3600,
                forecastPeriod: 1800,
                confidence: 0.8
            }
        },
        security: {
            authentication: {
                enabled: false,
                providers: [],
                tokenExpiry: 3600,
                refreshTokens: false
            },
            authorization: {
                enabled: false,
                model: 'rbac',
                roles: [],
                policies: []
            },
            encryption: {
                enabled: false,
                algorithm: 'AES-256-GCM',
                keyManagement: {
                    provider: 'local',
                    rotation: false,
                    rotationInterval: 86400
                },
                dataEncryption: {
                    atRest: false,
                    inTransit: false,
                    inMemory: false
                }
            },
            audit: {
                enabled: false,
                events: [],
                storage: {
                    type: 'file',
                    config: {}
                },
                retention: 2592000
            }
        }
    };
}
// Start the application if this file is run directly
if (require.main === module) {
    main().catch(console.error);
}
// Default export
exports.default = AgentOrchestrator_1.AgentOrchestrator;
//# sourceMappingURL=index.js.map