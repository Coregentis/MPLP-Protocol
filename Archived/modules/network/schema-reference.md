# Network模块Schema参考文档

## 📋 **Schema概述**

**Schema文件**: `src/schemas/core-modules/mplp-network.json`  
**Schema版本**: JSON Schema Draft-07  
**协议版本**: MPLP v1.0.0  
**文件大小**: 902行  
**字段总数**: 19个顶级字段 + 100+子字段  

## 🏗️ **Schema结构**

### **基础信息**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://mplp.dev/schemas/v1.0/mplp-network.json",
  "title": "MPLP Network Protocol v1.0",
  "description": "Network模块协议Schema - Agent网络拓扑和连接管理",
  "type": "object"
}
```

### **通用定义 ($defs)**
```json
{
  "$defs": {
    "uuid": {
      "type": "string",
      "pattern": "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
      "description": "UUID v4格式的唯一标识符"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601格式的时间戳"
    },
    "version": {
      "type": "string",
      "pattern": "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
      "description": "语义化版本号 (SemVer)"
    },
    "entityStatus": {
      "type": "string",
      "enum": ["active", "inactive", "pending", "completed", "failed", "cancelled"],
      "description": "实体状态枚举"
    }
  }
}
```

## 🔧 **核心字段定义**

### **网络基础信息**
```json
{
  "network_id": {
    "$ref": "#/$defs/uuid",
    "description": "网络唯一标识符"
  },
  "protocol_version": {
    "type": "string",
    "const": "1.0.0",
    "description": "MPLP协议版本"
  },
  "timestamp": {
    "$ref": "#/$defs/timestamp",
    "description": "网络创建时间戳"
  },
  "context_id": {
    "$ref": "#/$defs/uuid",
    "description": "关联的上下文ID"
  },
  "name": {
    "type": "string",
    "minLength": 1,
    "maxLength": 255,
    "description": "网络名称"
  },
  "description": {
    "type": "string",
    "maxLength": 1024,
    "description": "网络描述"
  }
}
```

### **网络拓扑定义**
```json
{
  "topology": {
    "type": "string",
    "enum": ["star", "mesh", "tree", "ring", "bus", "hybrid", "hierarchical"],
    "description": "网络拓扑类型"
  }
}
```

### **节点数组定义**
```json
{
  "nodes": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "node_id": {
          "$ref": "#/$defs/uuid",
          "description": "节点唯一标识符"
        },
        "agent_id": {
          "$ref": "#/$defs/uuid",
          "description": "Agent唯一标识符"
        },
        "node_type": {
          "type": "string",
          "enum": ["coordinator", "worker", "gateway", "relay", "monitor", "backup"],
          "description": "节点类型"
        },
        "status": {
          "type": "string",
          "enum": ["online", "offline", "connecting", "disconnecting", "error", "maintenance"],
          "description": "节点状态"
        },
        "capabilities": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["compute", "storage", "network", "coordination", "monitoring", "security"]
          },
          "maxItems": 10,
          "description": "节点能力列表"
        },
        "address": {
          "type": "object",
          "properties": {
            "host": {
              "type": "string",
              "description": "主机地址"
            },
            "port": {
              "type": "number",
              "minimum": 1,
              "maximum": 65535,
              "description": "端口号"
            },
            "protocol": {
              "type": "string",
              "enum": ["http", "https", "ws", "wss", "tcp", "udp"],
              "description": "通信协议"
            }
          },
          "required": ["host", "port", "protocol"],
          "additionalProperties": false,
          "description": "节点地址信息"
        },
        "metadata": {
          "type": "object",
          "additionalProperties": true,
          "description": "节点元数据"
        }
      },
      "required": ["node_id", "agent_id", "node_type", "status"],
      "additionalProperties": false
    },
    "minItems": 1,
    "maxItems": 1000,
    "description": "网络节点列表"
  }
}
```

### **连接数组定义**
```json
{
  "edges": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "edge_id": {
          "$ref": "#/$defs/uuid",
          "description": "连接唯一标识符"
        },
        "source_node_id": {
          "$ref": "#/$defs/uuid",
          "description": "源节点ID"
        },
        "target_node_id": {
          "$ref": "#/$defs/uuid",
          "description": "目标节点ID"
        },
        "edge_type": {
          "type": "string",
          "enum": ["data", "control", "monitoring", "backup"],
          "description": "连接类型"
        },
        "direction": {
          "type": "string",
          "enum": ["unidirectional", "bidirectional"],
          "description": "连接方向"
        },
        "status": {
          "$ref": "#/$defs/entityStatus",
          "description": "连接状态"
        },
        "weight": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "连接权重"
        },
        "metadata": {
          "type": "object",
          "additionalProperties": true,
          "description": "连接元数据"
        }
      },
      "required": ["edge_id", "source_node_id", "target_node_id", "edge_type", "direction", "status"],
      "additionalProperties": false
    },
    "maxItems": 10000,
    "description": "网络连接列表"
  }
}
```

### **发现机制定义**
```json
{
  "discovery_mechanism": {
    "type": "object",
    "properties": {
      "type": {
        "type": "string",
        "enum": ["static", "dynamic", "hybrid", "dns", "registry", "broadcast"],
        "description": "发现机制类型"
      },
      "registry_config": {
        "type": "object",
        "properties": {
          "endpoint": {
            "type": "string",
            "format": "uri",
            "description": "注册中心端点"
          },
          "authentication": {
            "type": "boolean",
            "default": false,
            "description": "是否需要身份验证"
          },
          "refresh_interval": {
            "type": "number",
            "minimum": 1,
            "description": "刷新间隔(秒)"
          }
        },
        "additionalProperties": false,
        "description": "注册中心配置"
      }
    },
    "required": ["type"],
    "additionalProperties": false,
    "description": "节点发现机制"
  }
}
```

### **路由策略定义**
```json
{
  "routing_strategy": {
    "type": "object",
    "properties": {
      "algorithm": {
        "type": "string",
        "enum": ["shortest_path", "load_balanced", "priority_based", "custom"],
        "description": "路由算法"
      },
      "load_balancing": {
        "type": "object",
        "properties": {
          "method": {
            "type": "string",
            "enum": ["round_robin", "weighted", "least_connections", "random"],
            "description": "负载均衡方法"
          }
        },
        "additionalProperties": false,
        "description": "负载均衡配置"
      }
    },
    "required": ["algorithm"],
    "additionalProperties": false,
    "description": "路由策略"
  }
}
```

## 🏢 **企业级功能Schema**

### **审计追踪**
```json
{
  "audit_trail": {
    "type": "object",
    "properties": {
      "enabled": { "type": "boolean" },
      "retention_days": { "type": "integer", "minimum": 1, "maximum": 2555 },
      "audit_events": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "event_id": { "$ref": "#/$defs/uuid" },
            "event_type": {
              "type": "string",
              "enum": ["network_created", "network_updated", "node_joined", "node_left", "connection_established", "connection_lost", "routing_changed", "security_violation", "topology_updated"]
            },
            "timestamp": { "$ref": "#/$defs/timestamp" },
            "user_id": { "type": "string" },
            "user_role": { "type": "string" },
            "action": { "type": "string" },
            "resource": { "type": "string" }
          },
          "required": ["event_id", "event_type", "timestamp", "user_id", "action", "resource"]
        }
      },
      "compliance_settings": {
        "type": "object",
        "properties": {
          "gdpr_enabled": { "type": "boolean" },
          "hipaa_enabled": { "type": "boolean" },
          "sox_enabled": { "type": "boolean" },
          "network_audit_level": {
            "type": "string",
            "enum": ["basic", "detailed", "comprehensive"]
          }
        }
      }
    },
    "required": ["enabled", "retention_days"]
  }
}
```

### **监控集成**
```json
{
  "monitoring_integration": {
    "type": "object",
    "properties": {
      "enabled": { "type": "boolean" },
      "supported_providers": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["prometheus", "grafana", "datadog", "new_relic", "elastic_apm", "custom"]
        }
      },
      "integration_endpoints": {
        "type": "object",
        "properties": {
          "metrics_api": { "type": "string", "format": "uri" },
          "network_performance_api": { "type": "string", "format": "uri" },
          "traffic_analysis_api": { "type": "string", "format": "uri" },
          "connection_status_api": { "type": "string", "format": "uri" }
        }
      },
      "network_metrics": {
        "type": "object",
        "properties": {
          "track_network_performance": { "type": "boolean" },
          "track_traffic_flow": { "type": "boolean" },
          "track_connection_status": { "type": "boolean" },
          "track_security_events": { "type": "boolean" }
        }
      },
      "export_formats": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": ["prometheus", "opentelemetry", "custom"]
        }
      }
    },
    "required": ["enabled", "supported_providers"]
  }
}
```

### **性能指标**
```json
{
  "performance_metrics": {
    "type": "object",
    "properties": {
      "enabled": { "type": "boolean" },
      "collection_interval_seconds": { "type": "integer", "minimum": 10, "maximum": 3600 },
      "metrics": {
        "type": "object",
        "properties": {
          "network_communication_latency_ms": { "type": "number", "minimum": 0 },
          "network_topology_efficiency_score": { "type": "number", "minimum": 0, "maximum": 10 },
          "network_reliability_score": { "type": "number", "minimum": 0, "maximum": 10 },
          "connection_success_rate_percent": { "type": "number", "minimum": 0, "maximum": 100 },
          "network_management_efficiency_score": { "type": "number", "minimum": 0, "maximum": 10 },
          "active_connections_count": { "type": "integer", "minimum": 0 },
          "network_operations_per_second": { "type": "number", "minimum": 0 },
          "network_memory_usage_mb": { "type": "number", "minimum": 0 },
          "average_network_complexity_score": { "type": "number", "minimum": 0, "maximum": 10 }
        }
      },
      "health_status": {
        "type": "object",
        "properties": {
          "status": {
            "type": "string",
            "enum": ["healthy", "degraded", "unhealthy", "partitioned"]
          },
          "last_check": { "$ref": "#/$defs/timestamp" },
          "checks": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "check_name": { "type": "string" },
                "status": {
                  "type": "string",
                  "enum": ["pass", "fail", "warn"]
                },
                "message": { "type": "string" },
                "duration_ms": { "type": "number", "minimum": 0 }
              },
              "required": ["check_name", "status"]
            }
          }
        }
      },
      "alerting": {
        "type": "object",
        "properties": {
          "enabled": { "type": "boolean" },
          "thresholds": {
            "type": "object",
            "properties": {
              "max_network_communication_latency_ms": { "type": "number", "minimum": 0 },
              "min_network_topology_efficiency_score": { "type": "number", "minimum": 0, "maximum": 10 },
              "min_network_reliability_score": { "type": "number", "minimum": 0, "maximum": 10 },
              "min_connection_success_rate_percent": { "type": "number", "minimum": 0, "maximum": 100 },
              "min_network_management_efficiency_score": { "type": "number", "minimum": 0, "maximum": 10 }
            }
          },
          "notification_channels": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": ["email", "slack", "webhook", "sms", "pagerduty"]
            }
          }
        }
      }
    },
    "required": ["enabled", "collection_interval_seconds"]
  }
}
```

## 📊 **必需字段列表**

根据Schema定义，以下字段为必需字段：

```json
{
  "required": [
    "network_id",
    "protocol_version", 
    "timestamp",
    "context_id",
    "name",
    "topology",
    "nodes",
    "discovery_mechanism",
    "routing_strategy",
    "status",
    "created_at",
    "created_by",
    "audit_trail",
    "monitoring_integration",
    "performance_metrics",
    "version_history",
    "search_metadata",
    "network_operation",
    "event_integration"
  ]
}
```

## 🔍 **枚举值定义**

### **网络拓扑类型**
- `star`: 星型拓扑
- `mesh`: 网状拓扑
- `tree`: 树型拓扑
- `ring`: 环型拓扑
- `bus`: 总线拓扑
- `hybrid`: 混合拓扑
- `hierarchical`: 分层拓扑

### **节点类型**
- `coordinator`: 协调节点
- `worker`: 工作节点
- `gateway`: 网关节点
- `relay`: 中继节点
- `monitor`: 监控节点
- `backup`: 备份节点

### **节点状态**
- `online`: 在线
- `offline`: 离线
- `connecting`: 连接中
- `disconnecting`: 断开中
- `error`: 错误状态
- `maintenance`: 维护中

### **连接类型**
- `data`: 数据连接
- `control`: 控制连接
- `monitoring`: 监控连接
- `backup`: 备份连接

### **连接方向**
- `unidirectional`: 单向连接
- `bidirectional`: 双向连接

### **发现机制类型**
- `static`: 静态配置
- `dynamic`: 动态发现
- `hybrid`: 混合模式
- `dns`: DNS发现
- `registry`: 注册中心
- `broadcast`: 广播发现

### **路由算法**
- `shortest_path`: 最短路径
- `load_balanced`: 负载均衡
- `priority_based`: 基于优先级
- `custom`: 自定义算法

### **负载均衡方法**
- `round_robin`: 轮询
- `weighted`: 加权
- `least_connections`: 最少连接
- `random`: 随机

## ✅ **Schema验证**

### **验证规则**
1. **必需字段**: 所有required字段必须存在
2. **类型检查**: 字段类型必须匹配定义
3. **格式验证**: UUID、时间戳等格式必须正确
4. **枚举检查**: 枚举字段值必须在允许范围内
5. **约束验证**: 数值范围、字符串长度等约束

### **验证示例**
```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import networkSchema from '../schemas/core-modules/mplp-network.json';

const ajv = new Ajv();
addFormats(ajv);

const validate = ajv.compile(networkSchema);

function validateNetworkData(data: unknown): boolean {
  const valid = validate(data);
  if (!valid) {
    console.error('Validation errors:', validate.errors);
  }
  return valid;
}
```

## 🔄 **Schema版本管理**

### **版本信息**
- **当前版本**: v1.0.0
- **Schema Draft**: Draft-07
- **兼容性**: 向后兼容
- **更新策略**: 语义化版本控制

### **变更历史**
- **v1.0.0**: 初始版本，包含完整的网络管理功能

---

**Schema版本**: v1.0.0  
**最后更新**: 2025-01-27  
**维护状态**: 活跃开发中
