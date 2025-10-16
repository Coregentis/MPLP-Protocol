# Network模块API参考

> **🌐 语言导航**: [English](../../../en/modules/network/api-reference.md) | [中文](api-reference.md)



**多智能体协议生命周期平台 - Network模块API参考 v1.0.0-alpha**

[![API](https://img.shields.io/badge/API-REST%20%7C%20GraphQL%20%7C%20WebSocket-blue.svg)](./protocol-specification.md)
[![模块](https://img.shields.io/badge/module-Network-cyan.svg)](./README.md)
[![网络](https://img.shields.io/badge/networking-Enterprise%20Grade-green.svg)](./implementation-guide.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/network/api-reference.md)

---

## 🎯 API概览

Network模块提供全面的REST、GraphQL和WebSocket API，用于企业级分布式通信、智能网络编排和多节点协调系统。所有API遵循MPLP协议标准，并提供高级网络智能功能。

### **API端点基础URL**
- **REST API**: `https://api.mplp.dev/v1/network`
- **GraphQL API**: `https://api.mplp.dev/graphql`
- **WebSocket API**: `wss://api.mplp.dev/ws/network`

### **身份认证**
所有API端点都需要使用JWT Bearer令牌进行身份认证：
```http
Authorization: Bearer <jwt-token>
```

---

## 🔧 REST API参考

### **网络管理端点**

#### **创建网络拓扑**
```http
POST /api/v1/network/topologies
Content-Type: application/json
Authorization: Bearer <token>

{
  "topology_id": "topology-enterprise-mesh-001",
  "topology_name": "企业多节点网状网络",
  "topology_type": "distributed_mesh",
  "topology_category": "enterprise_infrastructure",
  "topology_description": "具有智能路由和容错功能的企业多智能体通信高性能分布式网状网络",
  "network_nodes": [
    {
      "node_id": "node-primary-001",
      "node_type": "primary_coordinator",
      "node_role": "network_orchestrator",
      "node_name": "主网络协调器",
      "node_location": {
        "region": "cn-east-1",
        "availability_zone": "cn-east-1a",
        "data_center": "dc-primary-001",
        "geographic_location": {
          "latitude": 39.9042,
          "longitude": 116.4074,
          "city": "北京",
          "country": "中国"
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
        "packet_loss_percentage": 0.01,
        "jitter_ms": 1
      }
    }
  ],
  "network_configuration": {
    "routing_algorithm": "adaptive_shortest_path",
    "load_balancing_strategy": "weighted_round_robin",
    "fault_tolerance_level": "high_availability",
    "security_level": "enterprise_grade",
    "performance_optimization": {
      "enable_caching": true,
      "enable_compression": true,
      "enable_multiplexing": true,
      "enable_flow_control": true
    },
    "monitoring_configuration": {
      "enable_real_time_monitoring": true,
      "metrics_collection_interval_seconds": 30,
      "alert_thresholds": {
        "latency_threshold_ms": 100,
        "throughput_threshold_mbps": 1000,
        "error_rate_threshold_percentage": 1,
        "availability_threshold_percentage": 99.9
      }
    }
  },
  "intelligent_networking": {
    "ai_optimization": {
      "enable_predictive_routing": true,
      "enable_adaptive_load_balancing": true,
      "enable_anomaly_detection": true,
      "machine_learning_models": [
        "traffic_prediction",
        "failure_prediction",
        "performance_optimization"
      ]
    },
    "auto_scaling": {
      "enable_auto_scaling": true,
      "scaling_metrics": ["cpu_utilization", "memory_utilization", "network_utilization"],
      "scale_up_threshold": 80,
      "scale_down_threshold": 30,
      "min_nodes": 3,
      "max_nodes": 100
    }
  },
  "created_by": "network-admin-001"
}
```

#### **响应示例**
```json
{
  "topology_id": "topology-enterprise-mesh-001",
  "topology_name": "企业多节点网状网络",
  "topology_status": "active",
  "creation_result": {
    "status": "success",
    "topology_created_at": "2025-09-03T10:00:00.000Z",
    "nodes_initialized": 1,
    "connections_established": 0,
    "routing_tables_configured": 1,
    "security_policies_applied": 1
  },
  "network_metrics": {
    "total_nodes": 1,
    "active_connections": 0,
    "network_latency_ms": 5,
    "network_throughput_mbps": 0,
    "network_availability_percentage": 100
  },
  "intelligent_features": {
    "ai_optimization_enabled": true,
    "predictive_models_loaded": 3,
    "auto_scaling_configured": true,
    "anomaly_detection_active": true
  }
}
```

#### **获取网络拓扑列表**
```http
GET /api/v1/network/topologies
Authorization: Bearer <token>

# 查询参数
?topology_type=distributed_mesh
&status=active
&created_by=network-admin-001
&limit=50
&offset=0
&sort_by=created_at
&sort_order=desc
```

#### **响应示例**
```json
{
  "topologies": [
    {
      "topology_id": "topology-enterprise-mesh-001",
      "topology_name": "企业多节点网状网络",
      "topology_type": "distributed_mesh",
      "topology_status": "active",
      "node_count": 5,
      "connection_count": 10,
      "created_at": "2025-09-03T10:00:00.000Z",
      "last_updated_at": "2025-09-03T10:30:00.000Z",
      "performance_summary": {
        "average_latency_ms": 8,
        "total_throughput_mbps": 5000,
        "availability_percentage": 99.95
      }
    }
  ],
  "pagination": {
    "total_count": 1,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

#### **获取特定网络拓扑详情**
```http
GET /api/v1/network/topologies/{topology_id}
Authorization: Bearer <token>
```

#### **更新网络拓扑**
```http
PUT /api/v1/network/topologies/{topology_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "topology_name": "更新的企业网状网络",
  "topology_description": "更新的网络描述",
  "network_configuration": {
    "routing_algorithm": "dynamic_shortest_path",
    "load_balancing_strategy": "least_connections"
  },
  "updated_by": "network-admin-001"
}
```

#### **删除网络拓扑**
```http
DELETE /api/v1/network/topologies/{topology_id}
Authorization: Bearer <token>
```

### **节点管理端点**

#### **添加网络节点**
```http
POST /api/v1/network/topologies/{topology_id}/nodes
Content-Type: application/json
Authorization: Bearer <token>

{
  "node_id": "node-worker-002",
  "node_type": "worker_node",
  "node_role": "message_processor",
  "node_name": "工作节点002",
  "node_location": {
    "region": "cn-south-1",
    "availability_zone": "cn-south-1b",
    "data_center": "dc-secondary-001"
  },
  "node_capabilities": [
    "message_processing",
    "data_storage",
    "computation"
  ],
  "resource_allocation": {
    "cpu_cores": 8,
    "memory_gb": 32,
    "storage_gb": 500,
    "network_bandwidth_gbps": 1
  },
  "added_by": "network-admin-001"
}
```

#### **获取节点列表**
```http
GET /api/v1/network/topologies/{topology_id}/nodes
Authorization: Bearer <token>
```

#### **获取特定节点详情**
```http
GET /api/v1/network/nodes/{node_id}
Authorization: Bearer <token>
```

#### **更新节点配置**
```http
PUT /api/v1/network/nodes/{node_id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "node_name": "更新的工作节点",
  "resource_allocation": {
    "cpu_cores": 12,
    "memory_gb": 48
  },
  "updated_by": "network-admin-001"
}
```

#### **移除网络节点**
```http
DELETE /api/v1/network/nodes/{node_id}
Authorization: Bearer <token>
```

### **消息传输端点**

#### **发送网络消息**
```http
POST /api/v1/network/messages/send
Content-Type: application/json
Authorization: Bearer <token>

{
  "message_id": "msg-001",
  "message_type": "data_transfer",
  "source_node_id": "node-primary-001",
  "target_node_id": "node-worker-002",
  "message_content": {
    "data_type": "json",
    "payload": {
      "task_id": "task-001",
      "task_data": "处理数据",
      "priority": "high"
    }
  },
  "delivery_options": {
    "delivery_mode": "reliable",
    "timeout_seconds": 30,
    "retry_attempts": 3,
    "compression_enabled": true
  },
  "sent_by": "system-001"
}
```

#### **广播消息**
```http
POST /api/v1/network/messages/broadcast
Content-Type: application/json
Authorization: Bearer <token>

{
  "message_id": "broadcast-001",
  "message_type": "system_announcement",
  "source_node_id": "node-primary-001",
  "target_nodes": ["node-worker-002", "node-worker-003"],
  "message_content": {
    "announcement_type": "maintenance",
    "message": "系统将在30分钟后进行维护",
    "scheduled_time": "2025-09-03T15:00:00.000Z"
  },
  "broadcast_options": {
    "delivery_mode": "best_effort",
    "parallel_delivery": true,
    "acknowledgment_required": true
  }
}
```

### **性能监控端点**

#### **获取网络性能指标**
```http
GET /api/v1/network/metrics/performance
Authorization: Bearer <token>

# 查询参数
?topology_id=topology-enterprise-mesh-001
&time_range=last_24_hours
&metrics=latency,throughput,availability
&aggregation=average
```

#### **响应示例**
```json
{
  "topology_id": "topology-enterprise-mesh-001",
  "time_range": {
    "start_time": "2025-09-02T10:00:00.000Z",
    "end_time": "2025-09-03T10:00:00.000Z"
  },
  "performance_metrics": {
    "latency": {
      "average_ms": 8.5,
      "p50_ms": 7,
      "p95_ms": 15,
      "p99_ms": 25
    },
    "throughput": {
      "average_mbps": 4500,
      "peak_mbps": 8000,
      "total_gb": 388.8
    },
    "availability": {
      "percentage": 99.95,
      "uptime_hours": 23.988,
      "downtime_minutes": 0.72
    },
    "error_rates": {
      "connection_errors": 0.01,
      "timeout_errors": 0.005,
      "protocol_errors": 0.001
    }
  }
}
```

---

## 🔗 相关文档

- [Network模块概览](./README.md) - 模块概览和架构
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [集成示例](./integration-examples.md) - 集成示例
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**API版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业级就绪  

**⚠️ Alpha版本说明**: Network模块API在Alpha版本中提供企业级网络管理功能。额外的高级API功能和优化将在Beta版本中添加。
