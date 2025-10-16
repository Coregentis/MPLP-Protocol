# Network Module API Reference

> **🌐 Language Navigation**: [English](api-reference.md) | [中文](../../../zh-CN/modules/network/api-reference.md)



**Multi-Agent Protocol Lifecycle Platform - Network Module API Reference v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![Module](https://img.shields.io/badge/module-Network-cyan.svg)](./README.md)
[![Networking](https://img.shields.io/badge/networking-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/modules/network/api-reference.md)

---

## 🎯 API Overview

The Network Module provides comprehensive REST, GraphQL, and WebSocket APIs for enterprise-grade distributed communication, intelligent network orchestration, and multi-node coordination systems. All APIs follow MPLP protocol standards and provide advanced networking intelligence features.

### **API Endpoints Base URLs**
- **REST API**: `https://api.mplp.dev/v1/network`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/network`

### **Authentication**
All API endpoints require authentication using JWT Bearer tokens:
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API Reference

### **Network Management Endpoints**

#### **Create Network Topology**
```http
POST /api/v1/network/topologies
Content-Type: application/json
Authorization: Bearer <token>

{
  "topology_id": "topology-enterprise-mesh-001",
  "topology_name": "Enterprise Multi-Node Mesh Network",
  "topology_type": "distributed_mesh",
  "topology_category": "enterprise_infrastructure",
  "topology_description": "High-performance distributed mesh network for enterprise multi-agent communication with intelligent routing and fault tolerance",
  "network_nodes": [
    {
      "node_id": "node-primary-001",
      "node_type": "primary_coordinator",
      "node_role": "network_orchestrator",
      "node_name": "Primary Network Coordinator",
      "node_location": {
        "region": "us-east-1",
        "availability_zone": "us-east-1a",
        "data_center": "dc-primary-001",
        "geographic_location": {
          "latitude": 39.0458,
          "longitude": -76.6413,
          "city": "Baltimore",
          "country": "USA"
        }
      },
      "node_capabilities": [
        "network_orchestration",
        "traffic_routing",
        "load_balancing",
        "fault_detection",
        "performance_monitoring",
        "security_enforcement",
        "protocol_translation",
        "bandwidth_management"
      ],
      "network_interfaces": [
        {
          "interface_id": "eth0",
          "interface_type": "ethernet",
          "bandwidth_capacity": "10Gbps",
          "protocol_support": ["tcp", "udp", "http", "websocket", "grpc"],
          "security_features": ["tls_1.3", "ipsec", "vpn_support"],
          "qos_capabilities": ["traffic_shaping", "priority_queuing", "bandwidth_allocation"]
        },
        {
          "interface_id": "wlan0",
          "interface_type": "wireless",
          "bandwidth_capacity": "1Gbps",
          "protocol_support": ["tcp", "udp", "http", "websocket"],
          "security_features": ["wpa3", "enterprise_auth"],
          "mobility_support": true
        }
      ],
      "resource_allocation": {
        "cpu_cores": 16,
        "memory_gb": 64,
        "storage_gb": 1000,
        "network_bandwidth_gbps": 10,
        "concurrent_connections": 50000
      },
      "performance_metrics": {
        "latency_p95_ms": 5,
        "throughput_mbps": 8000,
        "availability_percentage": 99.99,
        "packet_loss_percentage": 0.001,
        "jitter_ms": 0.5
      }
    },
    {
      "node_id": "node-secondary-001",
      "node_type": "secondary_coordinator",
      "node_role": "backup_orchestrator",
      "node_name": "Secondary Network Coordinator",
      "node_location": {
        "region": "us-west-2",
        "availability_zone": "us-west-2b",
        "data_center": "dc-secondary-001",
        "geographic_location": {
          "latitude": 47.6062,
          "longitude": -122.3321,
          "city": "Seattle",
          "country": "USA"
        }
      },
      "node_capabilities": [
        "backup_orchestration",
        "failover_management",
        "traffic_routing",
        "load_balancing",
        "performance_monitoring",
        "disaster_recovery"
      ],
      "failover_configuration": {
        "failover_mode": "active_passive",
        "heartbeat_interval_ms": 1000,
        "failover_timeout_ms": 5000,
        "recovery_strategy": "automatic",
        "data_synchronization": "real_time"
      }
    },
    {
      "node_id": "node-edge-001",
      "node_type": "edge_node",
      "node_role": "regional_gateway",
      "node_name": "East Coast Edge Gateway",
      "node_location": {
        "region": "us-east-1",
        "availability_zone": "us-east-1c",
        "data_center": "dc-edge-001"
      },
      "node_capabilities": [
        "edge_processing",
        "local_caching",
        "protocol_optimization",
        "bandwidth_optimization",
        "latency_reduction"
      ],
      "edge_services": {
        "content_caching": true,
        "request_acceleration": true,
        "protocol_optimization": true,
        "local_processing": true,
        "offline_capability": true
      }
    }
  ],
  "network_configuration": {
    "routing_protocol": "intelligent_adaptive",
    "load_balancing_strategy": "weighted_round_robin",
    "fault_tolerance_level": "high",
    "security_level": "enterprise",
    "encryption_standard": "aes_256_gcm",
    "compression_enabled": true,
    "qos_enabled": true,
    "monitoring_enabled": true,
    "auto_scaling": true,
    "multi_path_routing": true,
    "traffic_engineering": true,
    "bandwidth_management": {
      "total_bandwidth_gbps": 100,
      "reserved_bandwidth_percentage": 20,
      "burst_capacity_percentage": 150,
      "traffic_prioritization": "application_aware"
    },
    "redundancy_configuration": {
      "redundancy_level": "n_plus_2",
      "backup_paths": 3,
      "failover_time_ms": 100,
      "recovery_time_objective_minutes": 5
    }
  },
  "intelligent_networking": {
    "ai_optimization": {
      "enabled": true,
      "optimization_algorithms": [
        "traffic_prediction",
        "route_optimization",
        "load_balancing_optimization",
        "bandwidth_allocation",
        "fault_prediction"
      ],
      "learning_enabled": true,
      "adaptation_frequency": "real_time",
      "optimization_goals": [
        "minimize_latency",
        "maximize_throughput",
        "ensure_reliability",
        "optimize_cost",
        "maintain_security"
      ]
    },
    "predictive_analytics": {
      "enabled": true,
      "prediction_types": [
        "traffic_forecasting",
        "capacity_planning",
        "failure_prediction",
        "performance_degradation",
        "security_threats"
      ],
      "prediction_horizon_hours": 24,
      "accuracy_threshold": 0.85,
      "alert_thresholds": {
        "capacity_utilization": 0.8,
        "latency_increase": 0.2,
        "error_rate_increase": 0.1
      }
    },
    "adaptive_routing": {
      "enabled": true,
      "routing_algorithms": [
        "shortest_path_first",
        "traffic_aware_routing",
        "congestion_avoidance",
        "quality_aware_routing"
      ],
      "adaptation_triggers": [
        "congestion_detected",
        "link_failure",
        "performance_degradation",
        "security_threat",
        "maintenance_window"
      ],
      "route_optimization_frequency": "continuous"
    }
  },
  "security_configuration": {
    "network_security": {
      "firewall_enabled": true,
      "intrusion_detection": true,
      "ddos_protection": true,
      "vpn_support": true,
      "zero_trust_architecture": true
    },
    "encryption_configuration": {
      "data_in_transit": "tls_1.3",
      "data_at_rest": "aes_256_gcm",
      "key_management": "enterprise_hsm",
      "certificate_management": "automated_renewal"
    },
    "access_control": {
      "authentication_required": true,
      "authorization_model": "rbac",
      "network_segmentation": true,
      "micro_segmentation": true
    }
  },
  "performance_targets": {
    "latency_p95_ms": 10,
    "throughput_gbps": 50,
    "availability_percentage": 99.99,
    "packet_loss_percentage": 0.001,
    "jitter_ms": 1.0,
    "connection_establishment_ms": 100,
    "failover_time_ms": 500
  },
  "monitoring_configuration": {
    "real_time_monitoring": true,
    "performance_metrics": [
      "latency",
      "throughput",
      "packet_loss",
      "jitter",
      "availability",
      "error_rates",
      "security_events"
    ],
    "alerting_enabled": true,
    "dashboard_enabled": true,
    "historical_data_retention_days": 90
  },
  "metadata": {
    "deployment_environment": "production",
    "business_criticality": "high",
    "compliance_requirements": ["sox", "pci_dss", "hipaa"],
    "tags": ["enterprise", "mesh", "high-availability", "intelligent"],
    "cost_center": "infrastructure",
    "project_code": "network-modernization-2025"
  }
}
```

**Response (201 Created):**
```json
{
  "topology_id": "topology-enterprise-mesh-001",
  "topology_name": "Enterprise Multi-Node Mesh Network",
  "topology_type": "distributed_mesh",
  "topology_status": "active",
  "created_at": "2025-09-03T10:00:00.000Z",
  "created_by": "network-admin-001",
  "network_nodes": [
    {
      "node_id": "node-primary-001",
      "node_status": "active",
      "node_health": "healthy",
      "current_load": 0.15,
      "connections_active": 1250,
      "performance_metrics": {
        "current_latency_ms": 3.2,
        "current_throughput_mbps": 2500,
        "cpu_utilization": 0.25,
        "memory_utilization": 0.30,
        "network_utilization": 0.31
      }
    },
    {
      "node_id": "node-secondary-001",
      "node_status": "standby",
      "node_health": "healthy",
      "failover_readiness": "ready",
      "sync_status": "synchronized",
      "last_heartbeat": "2025-09-03T10:00:00.000Z"
    },
    {
      "node_id": "node-edge-001",
      "node_status": "active",
      "node_health": "healthy",
      "edge_services_status": {
        "content_caching": "active",
        "request_acceleration": "active",
        "local_processing": "active"
      },
      "cache_hit_ratio": 0.85,
      "acceleration_improvement": 0.40
    }
  ],
  "network_topology": {
    "topology_graph": {
      "nodes": 3,
      "edges": 6,
      "connectivity": "full_mesh",
      "redundancy_paths": 3,
      "diameter": 2
    },
    "routing_table": {
      "total_routes": 15,
      "active_routes": 15,
      "backup_routes": 9,
      "load_balanced_routes": 6
    }
  },
  "intelligent_networking_status": {
    "ai_optimization": "active",
    "predictive_analytics": "active",
    "adaptive_routing": "active",
    "learning_models": {
      "traffic_prediction": "trained",
      "route_optimization": "training",
      "fault_prediction": "trained"
    }
  },
  "network_urls": {
    "management_dashboard": "https://network.mplp.dev/topology/topology-enterprise-mesh-001",
    "api_endpoint": "https://api.mplp.dev/v1/network/topology-enterprise-mesh-001",
    "websocket_endpoint": "wss://api.mplp.dev/ws/network/topology-enterprise-mesh-001",
    "monitoring_dashboard": "https://monitor.mplp.dev/network/topology-enterprise-mesh-001"
  },
  "network_services": {
    "intelligent_routing": "enabled",
    "load_balancing": "enabled",
    "fault_tolerance": "enabled",
    "security_enforcement": "enabled",
    "performance_optimization": "enabled",
    "predictive_maintenance": "enabled"
  },
  "initial_network_state": {
    "total_bandwidth_gbps": 100,
    "available_bandwidth_gbps": 85,
    "active_connections": 1250,
    "average_latency_ms": 3.2,
    "network_health_score": 0.98
  }
}
```

#### **Establish Network Connection**
```http
POST /api/v1/network/{topology_id}/connections
Content-Type: application/json
Authorization: Bearer <token>

{
  "connection_request": {
    "connection_id": "conn-agent-communication-001",
    "connection_type": "agent_to_agent",
    "connection_priority": "high",
    "source_node": {
      "node_id": "node-primary-001",
      "agent_id": "agent-coordinator-001",
      "service_port": 8080,
      "protocol": "grpc",
      "security_requirements": {
        "encryption": "tls_1.3",
        "authentication": "mutual_tls",
        "authorization": "rbac"
      }
    },
    "destination_node": {
      "node_id": "node-edge-001",
      "agent_id": "agent-processor-001",
      "service_port": 8081,
      "protocol": "grpc",
      "security_requirements": {
        "encryption": "tls_1.3",
        "authentication": "mutual_tls",
        "authorization": "rbac"
      }
    },
    "connection_requirements": {
      "bandwidth_mbps": 100,
      "latency_max_ms": 10,
      "reliability_percentage": 99.9,
      "jitter_max_ms": 2,
      "packet_loss_max_percentage": 0.01,
      "connection_persistence": "persistent",
      "failover_support": true,
      "load_balancing": true
    },
    "quality_of_service": {
      "traffic_class": "real_time",
      "priority_level": "high",
      "guaranteed_bandwidth": true,
      "latency_sensitive": true,
      "jitter_sensitive": true,
      "packet_loss_sensitive": true
    },
    "routing_preferences": {
      "routing_strategy": "shortest_path_with_qos",
      "path_diversity": true,
      "load_balancing_enabled": true,
      "congestion_avoidance": true,
      "adaptive_routing": true
    }
  }
}
```

**Response (201 Created):**
```json
{
  "connection_id": "conn-agent-communication-001",
  "topology_id": "topology-enterprise-mesh-001",
  "connection_type": "agent_to_agent",
  "connection_status": "established",
  "established_at": "2025-09-03T10:05:00.000Z",
  "connection_duration_ms": 250,
  "connection_details": {
    "source_endpoint": {
      "node_id": "node-primary-001",
      "ip_address": "10.0.1.10",
      "port": 8080,
      "protocol": "grpc",
      "security_status": "tls_1.3_active"
    },
    "destination_endpoint": {
      "node_id": "node-edge-001",
      "ip_address": "10.0.3.10",
      "port": 8081,
      "protocol": "grpc",
      "security_status": "tls_1.3_active"
    },
    "routing_path": [
      {
        "hop": 1,
        "node_id": "node-primary-001",
        "interface": "eth0",
        "next_hop": "10.0.2.1"
      },
      {
        "hop": 2,
        "node_id": "node-secondary-001",
        "interface": "eth1",
        "next_hop": "10.0.3.1"
      },
      {
        "hop": 3,
        "node_id": "node-edge-001",
        "interface": "eth0",
        "destination": true
      }
    ],
    "backup_paths": [
      {
        "path_id": "backup-path-001",
        "path_type": "direct",
        "path_cost": 15,
        "path_latency_ms": 8,
        "path_bandwidth_mbps": 1000
      }
    ]
  },
  "performance_metrics": {
    "established_latency_ms": 4.2,
    "available_bandwidth_mbps": 950,
    "path_mtu": 1500,
    "round_trip_time_ms": 8.4,
    "connection_quality_score": 0.96
  },
  "qos_allocation": {
    "allocated_bandwidth_mbps": 100,
    "guaranteed_latency_ms": 10,
    "priority_queue": "high_priority",
    "traffic_shaping": "enabled",
    "congestion_control": "active"
  },
  "security_status": {
    "encryption_active": true,
    "authentication_verified": true,
    "authorization_granted": true,
    "certificate_status": "valid",
    "security_score": 0.98
  },
  "monitoring_configuration": {
    "real_time_monitoring": true,
    "performance_tracking": true,
    "health_checks_enabled": true,
    "alert_thresholds": {
      "latency_threshold_ms": 15,
      "packet_loss_threshold": 0.02,
      "bandwidth_utilization_threshold": 0.9
    }
  },
  "connection_urls": {
    "monitoring_dashboard": "https://monitor.mplp.dev/connections/conn-agent-communication-001",
    "performance_metrics": "https://api.mplp.dev/v1/network/connections/conn-agent-communication-001/metrics",
    "health_status": "https://api.mplp.dev/v1/network/connections/conn-agent-communication-001/health"
  }
}
```

#### **Optimize Network Performance**
```http
POST /api/v1/network/{topology_id}/optimize
Content-Type: application/json
Authorization: Bearer <token>

{
  "optimization_request": {
    "optimization_type": "comprehensive_performance",
    "optimization_scope": "topology_wide",
    "optimization_goals": [
      "minimize_latency",
      "maximize_throughput",
      "improve_reliability",
      "optimize_resource_utilization",
      "enhance_security"
    ],
    "optimization_constraints": {
      "max_optimization_time_minutes": 30,
      "service_disruption_tolerance": "minimal",
      "budget_constraints": {
        "max_additional_cost_percentage": 10,
        "cost_optimization_priority": "medium"
      },
      "compliance_requirements": ["maintain_security_standards", "preserve_audit_trails"]
    },
    "optimization_parameters": {
      "traffic_analysis_window_hours": 24,
      "performance_baseline_days": 7,
      "optimization_algorithms": [
        "genetic_algorithm",
        "simulated_annealing",
        "machine_learning_optimization"
      ],
      "convergence_criteria": 0.95,
      "optimization_iterations": 1000
    }
  }
}
```

**Response (200 OK):**
```json
{
  "optimization_id": "opt-comprehensive-001",
  "topology_id": "topology-enterprise-mesh-001",
  "optimization_type": "comprehensive_performance",
  "optimization_status": "completed",
  "started_at": "2025-09-03T10:10:00.000Z",
  "completed_at": "2025-09-03T10:25:00.000Z",
  "optimization_duration_minutes": 15,
  "optimization_results": {
    "overall_improvement_percentage": 23.5,
    "optimization_confidence": 0.92,
    "performance_gains": {
      "latency_reduction_percentage": 18.2,
      "throughput_increase_percentage": 31.7,
      "reliability_improvement_percentage": 12.4,
      "resource_utilization_improvement_percentage": 27.8,
      "cost_efficiency_improvement_percentage": 15.3
    },
    "optimization_summary": "Comprehensive network optimization achieved significant performance improvements through intelligent routing reconfiguration, load balancing optimization, and resource reallocation"
  },
  "optimization_changes": {
    "routing_optimizations": [
      {
        "change_type": "route_reconfiguration",
        "affected_routes": 12,
        "improvement_description": "Optimized routing paths to reduce average latency by 18%",
        "performance_impact": {
          "latency_improvement_ms": 2.1,
          "throughput_improvement_mbps": 450,
          "reliability_improvement": 0.02
        }
      }
    ],
    "load_balancing_optimizations": [
      {
        "change_type": "load_balancer_reconfiguration",
        "affected_nodes": 3,
        "improvement_description": "Rebalanced traffic distribution to optimize resource utilization",
        "performance_impact": {
          "load_distribution_improvement": 0.15,
          "response_time_improvement_ms": 1.8,
          "capacity_utilization_improvement": 0.12
        }
      }
    ],
    "resource_optimizations": [
      {
        "change_type": "bandwidth_reallocation",
        "affected_connections": 8,
        "improvement_description": "Dynamically reallocated bandwidth based on traffic patterns",
        "performance_impact": {
          "bandwidth_efficiency_improvement": 0.22,
          "congestion_reduction": 0.35,
          "qos_improvement": 0.18
        }
      }
    ],
    "security_optimizations": [
      {
        "change_type": "encryption_optimization",
        "affected_connections": 15,
        "improvement_description": "Optimized encryption algorithms for better performance without compromising security",
        "performance_impact": {
          "encryption_overhead_reduction": 0.08,
          "security_score_maintenance": 0.98,
          "processing_efficiency_improvement": 0.14
        }
      }
    ]
  },
  "performance_comparison": {
    "before_optimization": {
      "average_latency_ms": 11.6,
      "total_throughput_gbps": 32.4,
      "availability_percentage": 99.91,
      "resource_utilization": 0.68,
      "cost_efficiency_score": 0.72
    },
    "after_optimization": {
      "average_latency_ms": 9.5,
      "total_throughput_gbps": 42.7,
      "availability_percentage": 99.95,
      "resource_utilization": 0.87,
      "cost_efficiency_score": 0.83
    },
    "improvement_metrics": {
      "latency_improvement_percentage": 18.1,
      "throughput_improvement_percentage": 31.8,
      "availability_improvement_percentage": 0.04,
      "resource_utilization_improvement_percentage": 27.9,
      "cost_efficiency_improvement_percentage": 15.3
    }
  },
  "predictive_analysis": {
    "future_performance_forecast": {
      "forecast_horizon_days": 30,
      "expected_performance_trend": "stable_with_growth",
      "capacity_planning_recommendations": [
        "Consider adding edge nodes in high-traffic regions",
        "Plan for 25% bandwidth increase in next quarter",
        "Implement predictive scaling for peak traffic periods"
      ]
    },
    "optimization_sustainability": {
      "optimization_durability_days": 45,
      "performance_degradation_rate": 0.02,
      "recommended_reoptimization_frequency": "monthly"
    }
  },
  "monitoring_recommendations": {
    "enhanced_monitoring": [
      "Enable real-time traffic analysis",
      "Implement predictive performance alerts",
      "Set up automated optimization triggers"
    ],
    "alert_configurations": [
      {
        "metric": "latency_increase",
        "threshold": "15% above baseline",
        "action": "trigger_route_optimization"
      },
      {
        "metric": "throughput_decrease",
        "threshold": "10% below baseline",
        "action": "investigate_bottlenecks"
      }
    ]
  }
}
```

---

## 🔍 GraphQL API Reference

### **Schema Definition**

```graphql
type NetworkTopology {
  topologyId: ID!
  topologyName: String!
  topologyType: TopologyType!
  topologyCategory: String!
  topologyDescription: String
  topologyStatus: TopologyStatus!
  createdAt: DateTime!
  createdBy: ID!
  updatedAt: DateTime!
  networkNodes: [NetworkNode!]!
  networkConfiguration: NetworkConfiguration!
  intelligentNetworking: IntelligentNetworking
  securityConfiguration: SecurityConfiguration
  performanceTargets: PerformanceTargets
  monitoringConfiguration: MonitoringConfiguration
  metadata: NetworkMetadata
}

type NetworkNode {
  nodeId: ID!
  nodeType: NodeType!
  nodeRole: String!
  nodeName: String!
  nodeStatus: NodeStatus!
  nodeLocation: NodeLocation!
  nodeCapabilities: [String!]!
  networkInterfaces: [NetworkInterface!]!
  resourceAllocation: ResourceAllocation
  performanceMetrics: NodePerformanceMetrics
  failoverConfiguration: FailoverConfiguration
  edgeServices: EdgeServices
}

type NetworkConnection {
  connectionId: ID!
  topologyId: ID!
  connectionType: ConnectionType!
  connectionStatus: ConnectionStatus!
  sourceEndpoint: NetworkEndpoint!
  destinationEndpoint: NetworkEndpoint!
  routingPath: [RoutingHop!]!
  backupPaths: [BackupPath!]
  performanceMetrics: ConnectionPerformanceMetrics
  qosAllocation: QoSAllocation
  securityStatus: ConnectionSecurityStatus
}

enum TopologyType {
  DISTRIBUTED_MESH
  HIERARCHICAL_TREE
  HYBRID_TOPOLOGY
  STAR_TOPOLOGY
  RING_TOPOLOGY
  BUS_TOPOLOGY
}

enum TopologyStatus {
  ACTIVE
  INACTIVE
  MAINTENANCE
  DEGRADED
  FAILED
}

enum NodeType {
  PRIMARY_COORDINATOR
  SECONDARY_COORDINATOR
  EDGE_NODE
  COMPUTE_NODE
  STORAGE_NODE
  GATEWAY_NODE
}

enum ConnectionType {
  AGENT_TO_AGENT
  SERVICE_TO_SERVICE
  NODE_TO_NODE
  EXTERNAL_CONNECTION
  BACKUP_CONNECTION
}
```

### **Query Operations**

#### **Get Network Topology with Nodes**
```graphql
query GetNetworkTopology($topologyId: ID!, $includeMetrics: Boolean = true) {
  networkTopology(topologyId: $topologyId) {
    topologyId
    topologyName
    topologyType
    topologyStatus
    createdAt
    networkNodes {
      nodeId
      nodeName
      nodeType
      nodeRole
      nodeStatus
      nodeLocation {
        region
        availabilityZone
        dataCenter
        geographicLocation {
          latitude
          longitude
          city
          country
        }
      }
      nodeCapabilities
      performanceMetrics @include(if: $includeMetrics) {
        currentLatencyMs
        currentThroughputMbps
        cpuUtilization
        memoryUtilization
        networkUtilization
      }
    }
    networkConfiguration {
      routingProtocol
      loadBalancingStrategy
      faultToleranceLevel
      securityLevel
      encryptionStandard
    }
    intelligentNetworking {
      aiOptimization {
        enabled
        optimizationAlgorithms
        learningEnabled
        optimizationGoals
      }
      predictiveAnalytics {
        enabled
        predictionTypes
        predictionHorizonHours
        accuracyThreshold
      }
    }
    performanceTargets @include(if: $includeMetrics) {
      latencyP95Ms
      throughputGbps
      availabilityPercentage
      packetLossPercentage
      jitterMs
    }
  }
}
```

### **Mutation Operations**

#### **Create Network Topology**
```graphql
mutation CreateNetworkTopology($input: CreateNetworkTopologyInput!) {
  createNetworkTopology(input: $input) {
    networkTopology {
      topologyId
      topologyName
      topologyType
      topologyStatus
      createdAt
      networkNodes {
        nodeId
        nodeStatus
        nodeHealth
        currentLoad
      }
      networkTopology {
        topologyGraph {
          nodes
          edges
          connectivity
          redundancyPaths
        }
      }
    }
  }
}
```

#### **Establish Network Connection**
```graphql
mutation EstablishNetworkConnection($input: NetworkConnectionInput!) {
  establishNetworkConnection(input: $input) {
    networkConnection {
      connectionId
      connectionStatus
      establishedAt
      connectionDurationMs
      routingPath {
        hop
        nodeId
        interface
        nextHop
      }
      performanceMetrics {
        establishedLatencyMs
        availableBandwidthMbps
        pathMtu
        roundTripTimeMs
      }
    }
  }
}
```

---

## 🔌 WebSocket API Reference

### **Real-time Network Monitoring**

```javascript
// Subscribe to network topology events
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-001',
  channel: 'network.topology-enterprise-mesh-001.events'
}));

// Receive network events
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'network_event') {
    console.log('Network event:', message.data);
  }
};
```

### **Real-time Performance Metrics**

```javascript
// Subscribe to performance metrics
ws.send(JSON.stringify({
  type: 'subscribe',
  id: 'sub-002',
  channel: 'network.topology-enterprise-mesh-001.metrics'
}));

// Receive performance updates
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'performance_metrics') {
    console.log('Performance metrics:', message.data);
  }
};
```

---

## 🔗 Related Documentation

- [Network Module Overview](./README.md) - Module overview and architecture
- [Protocol Specification](./protocol-specification.md) - Protocol specification
- [Implementation Guide](./implementation-guide.md) - Implementation guidelines
- [Configuration Guide](./configuration-guide.md) - Configuration options
- [Testing Guide](./testing-guide.md) - Testing strategies
- [Performance Guide](./performance-guide.md) - Performance optimization
- [Integration Examples](./integration-examples.md) - Integration examples

---

**API Version**: 1.0.0-alpha  
**Last Updated**: September 3, 2025  
**Next Review**: December 3, 2025  
**Status**: Enterprise Ready  

**⚠️ Alpha Notice**: The Network Module API provides enterprise-grade distributed communication capabilities in Alpha release. Additional AI-powered network orchestration and advanced multi-node coordination features will be added in Beta release while maintaining backward compatibility.
