# Network Module Integration Examples

**Multi-Agent Protocol Lifecycle Platform - Network Module Integration Examples v1.0.0-alpha**

[![Integration](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![Examples](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![Networking](https://img.shields.io/badge/networking-Best%20Practices-orange.svg)](./api-reference.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../../zh-CN/modules/network/integration-examples.md)

---

## 🎯 Integration Overview

This document provides comprehensive integration examples for the Network Module, demonstrating real-world enterprise distributed communication scenarios, cross-module network integration patterns, and best practices for building comprehensive networking systems with MPLP Network Module.

### **Integration Scenarios**
- **Enterprise Distributed Communication Platform**: Complete network management with AI orchestration
- **Multi-Node Coordination System**: Scalable network topology and connection infrastructure
- **Cross-Module Integration**: Integration with Context, Plan, Dialog, and Collab modules
- **Real-Time Network Hub**: High-performance network orchestration and optimization
- **AI-Powered Network Ecosystem**: Machine learning-enhanced network management
- **Global Network Infrastructure**: Multi-region distributed communication system

---

## 🚀 Basic Integration Examples

### **1. Enterprise Distributed Communication Platform**

#### **Express.js with Comprehensive Network Management**
```typescript
import express from 'express';
import { NetworkModule } from '@mplp/network';
import { EnterpriseNetworkManager } from '@mplp/network/services';
import { NetworkMiddleware } from '@mplp/network/middleware';
import { IntelligentNetworkingService } from '@mplp/network/ai';

// Initialize Express application
const app = express();
app.use(express.json());

// Initialize Network Module with enterprise features
const networkModule = new NetworkModule({
  topologyManagement: {
    backend: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      ssl: true
    },
    topologySettings: {
      maxConcurrentTopologies: 1000,
      maxNodesPerTopology: 10000,
      defaultTopologyTimeoutHours: 24,
      nodeBatchSize: 100
    }
  },
  distributedCommunication: {
    protocols: {
      tcp: {
        enabled: true,
        portRange: '8000-8999',
        keepAlive: true,
        noDelay: true,
        bufferSize: 65536
      },
      udp: {
        enabled: true,
        portRange: '9000-9999',
        bufferSize: 65536,
        multicastSupport: true
      },
      http: {
        enabled: true,
        port: process.env.HTTP_PORT || 3000,
        httpsEnabled: true,
        http2Enabled: true,
        compression: true
      },
      websocket: {
        enabled: true,
        port: process.env.WS_PORT || 3001,
        maxConnections: 10000,
        heartbeatIntervalMs: 30000
      },
      grpc: {
        enabled: true,
        port: process.env.GRPC_PORT || 50051,
        maxMessageSize: 4194304,
        keepaliveTimeMs: 30000
      }
    },
    connectionManagement: {
      maxConcurrentConnections: 50000,
      connectionTimeoutMs: 30000,
      idleTimeoutMs: 300000,
      retryAttempts: 3,
      retryDelayMs: 1000,
      connectionPooling: true,
      poolSize: 1000
    },
    messageRouting: {
      routingAlgorithm: 'intelligent_adaptive',
      loadBalancingStrategy: 'least_connections',
      failoverEnabled: true,
      circuitBreakerEnabled: true,
      rateLimitingEnabled: true
    }
  },
  intelligentNetworking: {
    aiOptimization: {
      enabled: true,
      aiBackend: 'openai',
      connection: {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.3
      },
      optimizationAlgorithms: [
        'traffic_prediction',
        'route_optimization',
        'load_balancing_optimization',
        'bandwidth_allocation',
        'fault_prediction',
        'security_optimization'
      ],
      learningEnabled: true,
      adaptationFrequency: 'real_time',
      optimizationGoals: [
        'minimize_latency',
        'maximize_throughput',
        'ensure_reliability',
        'optimize_cost',
        'maintain_security',
        'improve_user_experience'
      ]
    },
    predictiveAnalytics: {
      enabled: true,
      predictionTypes: [
        'traffic_forecasting',
        'capacity_planning',
        'failure_prediction',
        'performance_degradation',
        'security_threats',
        'resource_demand'
      ],
      predictionHorizonHours: 24,
      accuracyThreshold: 0.85,
      modelUpdateFrequency: 'daily',
      alertThresholds: {
        capacityUtilization: 0.8,
        latencyIncrease: 0.2,
        errorRateIncrease: 0.1,
        securityThreatProbability: 0.7
      }
    },
    adaptiveRouting: {
      enabled: true,
      routingAlgorithms: [
        'shortest_path_first',
        'traffic_aware_routing',
        'congestion_avoidance',
        'quality_aware_routing',
        'cost_aware_routing'
      ],
      adaptationTriggers: [
        'congestion_detected',
        'link_failure',
        'performance_degradation',
        'security_threat',
        'maintenance_window',
        'cost_optimization'
      ],
      routeOptimizationFrequency: 'continuous',
      pathDiversityEnabled: true,
      multipathRouting: true
    }
  },
  performanceOptimization: {
    loadBalancing: {
      enabled: true,
      algorithms: [
        'round_robin',
        'least_connections',
        'weighted_round_robin',
        'ip_hash',
        'least_response_time'
      ],
      healthChecks: {
        enabled: true,
        intervalMs: 10000,
        timeoutMs: 5000,
        failureThreshold: 3
      },
      sessionPersistence: true,
      stickySessions: false
    },
    trafficEngineering: {
      enabled: true,
      qosEnabled: true,
      trafficShaping: true,
      bandwidthManagement: true,
      qosClasses: {
        realTime: {
          priority: 1,
          guaranteedBandwidth: true,
          maxLatencyMs: 10,
          maxJitterMs: 2
        },
        interactive: {
          priority: 2,
          guaranteedBandwidth: false,
          maxLatencyMs: 50,
          maxJitterMs: 10
        },
        bulk: {
          priority: 3,
          guaranteedBandwidth: false,
          maxLatencyMs: 1000,
          bestEffort: true
        }
      }
    },
    caching: {
      enabled: true,
      cacheTypes: [
        'routing_cache',
        'dns_cache',
        'connection_cache',
        'performance_cache'
      ],
      cacheSettings: {
        routingCacheTtlSeconds: 300,
        dnsCacheTtlSeconds: 3600,
        connectionCacheTtlSeconds: 1800,
        performanceCacheTtlSeconds: 60
      }
    }
  },
  security: {
    networkSecurity: {
      firewallEnabled: true,
      intrusionDetection: true,
      ddosProtection: true,
      vpnSupport: true,
      zeroTrustArchitecture: true,
      firewallRules: [
        {
          rule: 'allow_internal_communication',
          source: '10.0.0.0/8',
          destination: '10.0.0.0/8',
          ports: 'all'
        },
        {
          rule: 'allow_https_inbound',
          source: '0.0.0.0/0',
          destination: 'any',
          ports: '443'
        },
        {
          rule: 'deny_all_default',
          source: 'any',
          destination: 'any',
          action: 'deny'
        }
      ]
    },
    encryption: {
      dataInTransit: 'tls_1.3',
      dataAtRest: 'aes_256_gcm',
      keyManagement: 'enterprise_hsm',
      certificateManagement: 'automated_renewal',
      tlsConfiguration: {
        minVersion: '1.2',
        preferredVersion: '1.3',
        cipherSuites: [
          'TLS_AES_256_GCM_SHA384',
          'TLS_CHACHA20_POLY1305_SHA256',
          'TLS_AES_128_GCM_SHA256'
        ]
      }
    },
    accessControl: {
      authenticationRequired: true,
      authorizationModel: 'rbac',
      networkSegmentation: true,
      microSegmentation: true,
      rbacRoles: {
        networkAdmin: {
          permissions: [
            'topology_management',
            'node_management',
            'security_configuration',
            'performance_monitoring'
          ]
        },
        networkOperator: {
          permissions: [
            'connection_management',
            'performance_monitoring',
            'basic_troubleshooting'
          ]
        },
        networkViewer: {
          permissions: [
            'read_only_access',
            'performance_viewing'
          ]
        }
      }
    }
  },
  monitoring: {
    metrics: {
      enabled: true,
      backend: 'prometheus',
      endpoint: '/metrics',
      port: 9090,
      collectionIntervalMs: 15000,
      networkMetrics: [
        'topology_health_score',
        'node_availability_percentage',
        'connection_success_rate',
        'average_latency_ms',
        'throughput_mbps',
        'packet_loss_percentage',
        'jitter_ms',
        'bandwidth_utilization',
        'security_events_count'
      ]
    },
    performanceMonitoring: {
      enabled: true,
      realTimeMonitoring: true,
      historicalDataRetentionDays: 90,
      performanceThresholds: {
        latencyWarningMs: 50,
        latencyCriticalMs: 100,
        throughputWarningMbps: 100,
        packetLossWarningPercentage: 0.1,
        packetLossCriticalPercentage: 1.0
      }
    },
    alerting: {
      enabled: true,
      alertChannels: ['email', 'slack', 'pagerduty', 'webhook'],
      alertRules: [
        {
          name: 'high_latency',
          condition: 'avg_latency_ms > 100',
          severity: 'warning',
          duration: '5m'
        },
        {
          name: 'node_failure',
          condition: 'node_availability < 0.95',
          severity: 'critical',
          duration: '1m'
        },
        {
          name: 'security_threat',
          condition: 'security_events_rate > 10',
          severity: 'critical',
          duration: '30s'
        }
      ]
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: 'json',
      output: 'stdout',
      networkLogging: {
        connectionEvents: true,
        routingDecisions: true,
        performanceEvents: true,
        securityEvents: true,
        optimizationEvents: true
      }
    },
    tracing: {
      enabled: true,
      backend: 'jaeger',
      endpoint: process.env.JAEGER_ENDPOINT,
      samplingRate: 0.1
    }
  }
});

const networkManager = networkModule.getNetworkManager();
const intelligentNetworkingService = networkModule.getIntelligentNetworkingService();
const networkMiddleware = new NetworkMiddleware(networkModule);

// Apply network middleware
app.use(networkMiddleware.validateNetworkAccess());
app.use(networkMiddleware.trackNetworkUsage());

// Network topology management endpoints
app.post('/network/topologies', async (req, res) => {
  try {
    const networkTopology = await networkManager.createNetworkTopology({
      topologyId: req.body.topology_id,
      topologyName: req.body.topology_name,
      topologyType: req.body.topology_type,
      topologyCategory: req.body.topology_category,
      topologyDescription: req.body.topology_description,
      networkNodes: req.body.network_nodes,
      networkConfiguration: req.body.network_configuration,
      intelligentNetworking: req.body.intelligent_networking,
      securityConfiguration: req.body.security_configuration,
      performanceTargets: req.body.performance_targets,
      monitoringConfiguration: req.body.monitoring_configuration,
      metadata: req.body.metadata,
      createdBy: req.user.id
    });

    res.status(201).json({
      topology_id: networkTopology.topologyId,
      topology_name: networkTopology.topologyName,
      topology_status: networkTopology.topologyStatus,
      created_at: networkTopology.createdAt,
      network_nodes: networkTopology.networkNodes.map(node => ({
        node_id: node.nodeId,
        node_name: node.nodeName,
        node_type: node.nodeType,
        node_role: node.nodeRole,
        node_status: node.nodeStatus,
        node_health: node.nodeHealth,
        current_load: node.currentLoad,
        performance_metrics: {
          current_latency_ms: node.performanceMetrics?.currentLatencyMs,
          current_throughput_mbps: node.performanceMetrics?.currentThroughputMbps,
          cpu_utilization: node.performanceMetrics?.cpuUtilization,
          memory_utilization: node.performanceMetrics?.memoryUtilization,
          network_utilization: node.performanceMetrics?.networkUtilization
        }
      })),
      network_topology: {
        topology_graph: {
          nodes: networkTopology.topologyStructure?.topologyGraph?.nodes,
          edges: networkTopology.topologyStructure?.topologyGraph?.edges,
          connectivity: networkTopology.topologyStructure?.topologyGraph?.connectivity,
          redundancy_paths: networkTopology.topologyStructure?.topologyGraph?.redundancyPaths,
          diameter: networkTopology.topologyStructure?.topologyGraph?.diameter
        },
        routing_table: {
          total_routes: networkTopology.routingTable?.totalRoutes,
          active_routes: networkTopology.routingTable?.activeRoutes,
          backup_routes: networkTopology.routingTable?.backupRoutes,
          load_balanced_routes: networkTopology.routingTable?.loadBalancedRoutes
        }
      },
      intelligent_networking_status: {
        ai_optimization: networkTopology.intelligentNetworking?.aiOptimization?.enabled ? 'active' : 'inactive',
        predictive_analytics: networkTopology.intelligentNetworking?.predictiveAnalytics?.enabled ? 'active' : 'inactive',
        adaptive_routing: networkTopology.intelligentNetworking?.adaptiveRouting?.enabled ? 'active' : 'inactive',
        learning_models: {
          traffic_prediction: 'trained',
          route_optimization: 'training',
          fault_prediction: 'trained'
        }
      },
      network_urls: {
        management_dashboard: `https://network.mplp.dev/topology/${networkTopology.topologyId}`,
        api_endpoint: `https://api.mplp.dev/v1/network/${networkTopology.topologyId}`,
        websocket_endpoint: `wss://api.mplp.dev/ws/network/${networkTopology.topologyId}`,
        monitoring_dashboard: `https://monitor.mplp.dev/network/${networkTopology.topologyId}`
      },
      network_services: {
        intelligent_routing: 'enabled',
        load_balancing: 'enabled',
        fault_tolerance: 'enabled',
        security_enforcement: 'enabled',
        performance_optimization: 'enabled',
        predictive_maintenance: 'enabled'
      },
      initial_network_state: {
        total_bandwidth_gbps: networkTopology.networkConfiguration?.bandwidthManagement?.totalBandwidthGbps,
        available_bandwidth_gbps: networkTopology.initialNetworkState?.availableBandwidthGbps,
        active_connections: networkTopology.initialNetworkState?.activeConnections,
        average_latency_ms: networkTopology.initialNetworkState?.averageLatencyMs,
        network_health_score: networkTopology.initialNetworkState?.networkHealthScore
      }
    });

  } catch (error) {
    res.status(400).json({
      error: 'Network topology creation failed',
      message: error.message,
      details: error.details
    });
  }
});

app.post('/network/:topologyId/connections', async (req, res) => {
  try {
    const result = await networkManager.establishNetworkConnection(
      req.params.topologyId,
      {
        connectionId: req.body.connection_request.connection_id,
        connectionType: req.body.connection_request.connection_type,
        connectionPriority: req.body.connection_request.connection_priority,
        sourceNode: req.body.connection_request.source_node,
        destinationNode: req.body.connection_request.destination_node,
        connectionRequirements: req.body.connection_request.connection_requirements,
        qualityOfService: req.body.connection_request.quality_of_service,
        routingPreferences: req.body.connection_request.routing_preferences,
        startTime: new Date()
      }
    );

    res.status(201).json({
      connection_id: result.connectionId,
      topology_id: result.topologyId,
      connection_type: result.connectionType,
      connection_status: result.connectionStatus,
      established_at: result.establishedAt,
      connection_duration_ms: result.connectionDurationMs,
      connection_details: {
        source_endpoint: {
          node_id: result.connection.sourceEndpoint.nodeId,
          ip_address: result.connection.sourceEndpoint.ipAddress,
          port: result.connection.sourceEndpoint.port,
          protocol: result.connection.sourceEndpoint.protocol,
          security_status: result.connection.sourceEndpoint.securityStatus
        },
        destination_endpoint: {
          node_id: result.connection.destinationEndpoint.nodeId,
          ip_address: result.connection.destinationEndpoint.ipAddress,
          port: result.connection.destinationEndpoint.port,
          protocol: result.connection.destinationEndpoint.protocol,
          security_status: result.connection.destinationEndpoint.securityStatus
        },
        routing_path: result.routingPath.routingHops.map(hop => ({
          hop: hop.hop,
          node_id: hop.nodeId,
          interface: hop.interface,
          next_hop: hop.nextHop,
          destination: hop.destination
        })),
        backup_paths: result.connection.backupPaths?.map(path => ({
          path_id: path.pathId,
          path_type: path.pathType,
          path_cost: path.pathCost,
          path_latency_ms: path.pathLatencyMs,
          path_bandwidth_mbps: path.pathBandwidthMbps
        }))
      },
      performance_metrics: {
        established_latency_ms: result.performanceMetrics.establishedLatencyMs,
        available_bandwidth_mbps: result.performanceMetrics.availableBandwidthMbps,
        path_mtu: result.performanceMetrics.pathMtu,
        round_trip_time_ms: result.performanceMetrics.roundTripTimeMs,
        connection_quality_score: result.performanceMetrics.connectionQualityScore
      },
      qos_allocation: {
        allocated_bandwidth_mbps: result.qosConfiguration.allocatedBandwidthMbps,
        guaranteed_latency_ms: result.qosConfiguration.guaranteedLatencyMs,
        priority_queue: result.qosConfiguration.priorityQueue,
        traffic_shaping: result.qosConfiguration.trafficShaping,
        congestion_control: result.qosConfiguration.congestionControl
      },
      security_status: {
        encryption_active: result.securityConfiguration.encryptionActive,
        authentication_verified: result.securityConfiguration.authenticationVerified,
        authorization_granted: result.securityConfiguration.authorizationGranted,
        certificate_status: result.securityConfiguration.certificateStatus,
        security_score: result.securityConfiguration.securityScore
      },
      monitoring_configuration: {
        real_time_monitoring: result.monitoringConfiguration?.realTimeMonitoring,
        performance_tracking: result.monitoringConfiguration?.performanceTracking,
        health_checks_enabled: result.monitoringConfiguration?.healthChecksEnabled,
        alert_thresholds: result.monitoringConfiguration?.alertThresholds
      },
      connection_urls: {
        monitoring_dashboard: `https://monitor.mplp.dev/connections/${result.connectionId}`,
        performance_metrics: `https://api.mplp.dev/v1/network/connections/${result.connectionId}/metrics`,
        health_status: `https://api.mplp.dev/v1/network/connections/${result.connectionId}/health`
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Network connection establishment failed',
      message: error.message,
      topology_id: req.params.topologyId
    });
  }
});

// AI-powered network optimization endpoint
app.post('/network/:topologyId/optimize', async (req, res) => {
  try {
    const result = await networkManager.optimizeNetworkPerformance(
      req.params.topologyId,
      {
        optimizationType: req.body.optimization_request.optimization_type,
        optimizationScope: req.body.optimization_request.optimization_scope,
        optimizationGoals: req.body.optimization_request.optimization_goals,
        optimizationConstraints: req.body.optimization_request.optimization_constraints,
        optimizationParameters: req.body.optimization_request.optimization_parameters,
        startTime: new Date()
      }
    );

    res.json({
      optimization_id: result.optimizationId,
      topology_id: result.topologyId,
      optimization_type: result.optimizationType,
      optimization_status: result.optimizationStatus,
      started_at: result.startedAt,
      completed_at: result.completedAt,
      optimization_duration_minutes: result.optimizationDurationMinutes,
      optimization_results: {
        overall_improvement_percentage: result.optimizationResults.overallImprovementPercentage,
        optimization_confidence: result.optimizationResults.optimizationConfidence,
        performance_gains: {
          latency_reduction_percentage: result.optimizationResults.performanceGains.latencyReductionPercentage,
          throughput_increase_percentage: result.optimizationResults.performanceGains.throughputIncreasePercentage,
          reliability_improvement_percentage: result.optimizationResults.performanceGains.reliabilityImprovementPercentage,
          resource_utilization_improvement_percentage: result.optimizationResults.performanceGains.resourceUtilizationImprovementPercentage,
          cost_efficiency_improvement_percentage: result.optimizationResults.performanceGains.costEfficiencyImprovementPercentage
        },
        optimization_summary: result.optimizationResults.optimizationSummary
      },
      optimization_changes: {
        routing_optimizations: result.optimizationChanges.routingOptimizations.map(change => ({
          change_type: change.changeType,
          affected_routes: change.affectedRoutes,
          improvement_description: change.improvementDescription,
          performance_impact: {
            latency_improvement_ms: change.performanceImpact.latencyImprovementMs,
            throughput_improvement_mbps: change.performanceImpact.throughputImprovementMbps,
            reliability_improvement: change.performanceImpact.reliabilityImprovement
          }
        })),
        load_balancing_optimizations: result.optimizationChanges.loadBalancingOptimizations.map(change => ({
          change_type: change.changeType,
          affected_nodes: change.affectedNodes,
          improvement_description: change.improvementDescription,
          performance_impact: {
            load_distribution_improvement: change.performanceImpact.loadDistributionImprovement,
            response_time_improvement_ms: change.performanceImpact.responseTimeImprovementMs,
            capacity_utilization_improvement: change.performanceImpact.capacityUtilizationImprovement
          }
        })),
        resource_optimizations: result.optimizationChanges.resourceOptimizations.map(change => ({
          change_type: change.changeType,
          affected_connections: change.affectedConnections,
          improvement_description: change.improvementDescription,
          performance_impact: {
            bandwidth_efficiency_improvement: change.performanceImpact.bandwidthEfficiencyImprovement,
            congestion_reduction: change.performanceImpact.congestionReduction,
            qos_improvement: change.performanceImpact.qosImprovement
          }
        })),
        security_optimizations: result.optimizationChanges.securityOptimizations.map(change => ({
          change_type: change.changeType,
          affected_connections: change.affectedConnections,
          improvement_description: change.improvementDescription,
          performance_impact: {
            encryption_overhead_reduction: change.performanceImpact.encryptionOverheadReduction,
            security_score_maintenance: change.performanceImpact.securityScoreMaintenance,
            processing_efficiency_improvement: change.performanceImpact.processingEfficiencyImprovement
          }
        }))
      },
      performance_comparison: {
        before_optimization: {
          average_latency_ms: result.performanceComparison.beforeOptimization.averageLatencyMs,
          total_throughput_gbps: result.performanceComparison.beforeOptimization.totalThroughputGbps,
          availability_percentage: result.performanceComparison.beforeOptimization.availabilityPercentage,
          resource_utilization: result.performanceComparison.beforeOptimization.resourceUtilization,
          cost_efficiency_score: result.performanceComparison.beforeOptimization.costEfficiencyScore
        },
        after_optimization: {
          average_latency_ms: result.performanceComparison.afterOptimization.averageLatencyMs,
          total_throughput_gbps: result.performanceComparison.afterOptimization.totalThroughputGbps,
          availability_percentage: result.performanceComparison.afterOptimization.availabilityPercentage,
          resource_utilization: result.performanceComparison.afterOptimization.resourceUtilization,
          cost_efficiency_score: result.performanceComparison.afterOptimization.costEfficiencyScore
        },
        improvement_metrics: {
          latency_improvement_percentage: result.performanceComparison.improvementMetrics.latencyImprovementPercentage,
          throughput_improvement_percentage: result.performanceComparison.improvementMetrics.throughputImprovementPercentage,
          availability_improvement_percentage: result.performanceComparison.improvementMetrics.availabilityImprovementPercentage,
          resource_utilization_improvement_percentage: result.performanceComparison.improvementMetrics.resourceUtilizationImprovementPercentage,
          cost_efficiency_improvement_percentage: result.performanceComparison.improvementMetrics.costEfficiencyImprovementPercentage
        }
      },
      predictive_analysis: {
        future_performance_forecast: {
          forecast_horizon_days: result.predictiveAnalysis.futurePerformanceForecast.forecastHorizonDays,
          expected_performance_trend: result.predictiveAnalysis.futurePerformanceForecast.expectedPerformanceTrend,
          capacity_planning_recommendations: result.predictiveAnalysis.futurePerformanceForecast.capacityPlanningRecommendations
        },
        optimization_sustainability: {
          optimization_durability_days: result.predictiveAnalysis.optimizationSustainability.optimizationDurabilityDays,
          performance_degradation_rate: result.predictiveAnalysis.optimizationSustainability.performanceDegradationRate,
          recommended_reoptimization_frequency: result.predictiveAnalysis.optimizationSustainability.recommendedReoptimizationFrequency
        }
      },
      monitoring_recommendations: {
        enhanced_monitoring: result.monitoringRecommendations.enhancedMonitoring,
        alert_configurations: result.monitoringRecommendations.alertConfigurations.map(config => ({
          metric: config.metric,
          threshold: config.threshold,
          action: config.action
        }))
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Network optimization failed',
      message: error.message,
      topology_id: req.params.topologyId
    });
  }
});

// Real-time network analytics
app.get('/network/:topologyId/analytics', async (req, res) => {
  try {
    const analytics = await generateNetworkAnalytics({
      topologyId: req.params.topologyId,
      timeRange: req.query.time_range || '24h',
      metrics: req.query.metrics?.split(',') || ['topology', 'connections', 'performance', 'security'],
      granularity: req.query.granularity || 'hourly'
    });

    res.json({
      topology_id: req.params.topologyId,
      analytics: {
        topology_metrics: analytics.topologyMetrics,
        connection_metrics: analytics.connectionMetrics,
        performance_metrics: analytics.performanceMetrics,
        security_metrics: analytics.securityMetrics,
        node_metrics: analytics.nodeMetrics
      },
      insights: {
        network_health: analytics.networkHealth,
        topology_trends: analytics.topologyTrends,
        performance_trends: analytics.performanceTrends,
        connection_patterns: analytics.connectionPatterns,
        security_patterns: analytics.securityPatterns
      },
      recommendations: {
        topology_improvements: analytics.topologyImprovements,
        performance_optimizations: analytics.performanceOptimizations,
        connection_enhancements: analytics.connectionEnhancements,
        security_enhancements: analytics.securityEnhancements
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate network analytics',
      message: error.message
    });
  }
});

// Helper functions
async function generateNetworkAnalytics(params: NetworkAnalyticsParams): Promise<NetworkAnalytics> {
  // Implementation for comprehensive network analytics
  const analyticsEngine = networkModule.getAnalyticsEngine();
  const metricsCollector = networkModule.getMetricsCollector();
  
  const [topologyMetrics, connectionMetrics, performanceMetrics, securityMetrics] = await Promise.all([
    metricsCollector.getTopologyMetrics(params),
    metricsCollector.getConnectionMetrics(params),
    metricsCollector.getPerformanceMetrics(params),
    metricsCollector.getSecurityMetrics(params)
  ]);
  
  const insights = await analyticsEngine.generateInsights({
    topologyId: params.topologyId,
    metrics: { topologyMetrics, connectionMetrics, performanceMetrics, securityMetrics },
    timeRange: params.timeRange
  });
  
  const recommendations = await analyticsEngine.generateRecommendations({
    topologyId: params.topologyId,
    insights: insights,
    nodeProfiles: await getNodeProfiles(params.topologyId)
  });
  
  return {
    topologyMetrics,
    connectionMetrics,
    performanceMetrics,
    securityMetrics,
    nodeMetrics: await metricsCollector.getNodeMetrics(params),
    networkHealth: insights.networkHealth,
    topologyTrends: insights.topologyTrends,
    performanceTrends: insights.performanceTrends,
    connectionPatterns: insights.connectionPatterns,
    securityPatterns: insights.securityPatterns,
    topologyImprovements: recommendations.topologyImprovements,
    performanceOptimizations: recommendations.performanceOptimizations,
    connectionEnhancements: recommendations.connectionEnhancements,
    securityEnhancements: recommendations.securityEnhancements
  };
}

// WebSocket for real-time network updates
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Client connected for real-time network updates');

  socket.on('join_topology', (data) => {
    const { topologyId, nodeId } = data;
    
    // Join topology room
    socket.join(`topology-${topologyId}`);
    
    // Subscribe to network events
    networkModule.subscribeToNetworkEvents({
      topologyId: topologyId,
      nodeId: nodeId,
      eventTypes: ['connection_established', 'node_status_changed', 'optimization_completed', 'security_event'],
      callback: (event) => {
        socket.to(`topology-${topologyId}`).emit('network_event', {
          event_type: event.eventType,
          topology_id: event.topologyId,
          event_data: event.eventData,
          timestamp: event.timestamp
        });
      }
    });
  });

  socket.on('subscribe_performance_updates', (data) => {
    const { topologyId } = data;
    
    // Subscribe to real-time performance updates
    networkModule.subscribeToPerformanceUpdates({
      topologyId: topologyId,
      updateTypes: ['latency_metrics', 'throughput_metrics', 'availability_metrics'],
      callback: (update) => {
        socket.emit('performance_update', {
          topology_id: topologyId,
          update_type: update.updateType,
          update_data: update.data,
          timestamp: update.timestamp
        });
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from network monitoring');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Enterprise Distributed Communication Platform running on port ${PORT}`);
  console.log(`Network API: http://localhost:${PORT}/network`);
  console.log(`WebSocket: ws://localhost:${PORT}/ws/network`);
  console.log(`Metrics endpoint: http://localhost:${PORT}/metrics`);
});
```

---

## 🔗 Related Documentation

- [Network Module Overview](./README.md) - Module overview and architecture
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

**⚠️ Alpha Notice**: These integration examples showcase enterprise-grade distributed communication capabilities in Alpha release. Additional AI-powered network orchestration examples and advanced multi-node coordination integration patterns will be added based on community feedback and real-world usage in Beta release.
