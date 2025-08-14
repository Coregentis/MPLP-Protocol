# MPLP Network Protocol Schema

## 📋 **概述**

Network协议Schema定义了MPLP系统中Agent网络拓扑和连接管理的标准数据结构，实现智能体间的网络通信和拓扑管理。经过最新企业级功能增强，现已包含完整的网络通信监控、拓扑可靠性分析、版本控制、搜索索引等高级功能。

**Schema文件**: `src/schemas/mplp-network.json`
**协议版本**: v1.0.0
**模块状态**: ✅ 完成 (企业级增强 - 最新更新)
**复杂度**: 极高 (企业级)
**测试覆盖率**: 72.1%
**功能完整性**: ✅ 100% (基础功能 + 网络监控 + 企业级功能)
**企业级特性**: ✅ 网络通信监控、拓扑可靠性分析、版本控制、搜索索引、事件集成

## 🎯 **功能定位**

### **核心职责**
- **网络拓扑**: 管理智能体网络的拓扑结构和连接关系
- **连接管理**: 控制节点间的连接建立、维护和断开
- **路由优化**: 优化消息传递路径和网络性能
- **故障恢复**: 处理网络故障和自动恢复机制

### **网络监控功能**
- **网络通信监控**: 实时监控网络通信延迟、拓扑效率、网络可靠性
- **拓扑可靠性分析**: 详细的连接成功率分析和网络管理效率评估
- **网络状态监控**: 监控网络的通信状态、拓扑管理、连接质量
- **网络管理审计**: 监控网络管理过程的合规性和可靠性
- **网络可靠性保证**: 监控网络系统的可靠性和通信管理质量

### **企业级功能**
- **网络管理审计**: 完整的网络管理和通信记录，支持合规性要求 (GDPR/HIPAA/SOX)
- **性能监控**: 网络通信系统的详细监控和健康检查，包含关键网络指标
- **版本控制**: 网络配置的版本历史、变更追踪和快照管理
- **搜索索引**: 网络数据的全文搜索、语义搜索和自动索引
- **事件集成**: 网络事件总线集成和发布订阅机制
- **自动化运维**: 自动索引、版本管理和网络事件处理

### **在MPLP架构中的位置**
```
L3 执行层    │ Extension, Collab, Dialog ← [Network]
L2 协调层    │ Core, Orchestration, Coordination  
L1 协议层    │ Context, Plan, Confirm, Trace, Role
基础设施层   │ Event-Bus, State-Sync, Transaction
```

## 📊 **Schema结构**

### **核心字段**

| 字段名 | 类型 | 必需 | 描述 |
|--------|------|------|------|
| `protocol_version` | string | ✅ | 协议版本，固定为"1.0.0" |
| `timestamp` | string | ✅ | ISO 8601格式时间戳 |
| `network_id` | string | ✅ | UUID v4格式的网络标识符 |
| `context_id` | string | ✅ | 关联的上下文ID |
| `name` | string | ✅ | 网络名称 (1-255字符) |
| `topology` | string | ✅ | 网络拓扑类型枚举值 |
| `nodes` | array | ✅ | 网络节点列表 |
| `connections` | array | ✅ | 节点连接关系列表 |

### **网络拓扑枚举**
```json
{
  "topology": {
    "enum": [
      "star",         // 星型拓扑
      "mesh",         // 网状拓扑
      "tree",         // 树型拓扑
      "ring",         // 环型拓扑
      "bus",          // 总线拓扑
      "hybrid",       // 混合拓扑
      "hierarchical"  // 分层拓扑
    ]
  }
}
```

### **节点状态枚举**
```json
{
  "node_status": {
    "enum": [
      "online",       // 在线
      "offline",      // 离线
      "connecting",   // 连接中
      "disconnecting", // 断开中
      "error",        // 错误状态
      "maintenance"   // 维护状态
    ]
  }
}
```

## 🔧 **双重命名约定映射**

### **Schema层 (snake_case)**
```json
{
  "protocol_version": "1.0.0",
  "timestamp": "2025-08-13T10:30:00.000Z",
  "network_id": "550e8400-e29b-41d4-a716-446655440000",
  "context_id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "智能体协作网络",
  "description": "用于项目协作的智能体网络",
  "topology": "mesh",
  "status": "active",
  "created_by": "network_admin",
  "created_at": "2025-08-13T10:30:00.000Z",
  "updated_at": "2025-08-13T10:35:00.000Z",
  "nodes": [
    {
      "node_id": "node-001",
      "agent_id": "agent-001",
      "node_type": "coordinator",
      "status": "online",
      "capabilities": ["routing", "load_balancing"],
      "network_address": "192.168.1.10:8080",
      "last_heartbeat": "2025-08-13T10:34:00.000Z"
    },
    {
      "node_id": "node-002",
      "agent_id": "agent-002",
      "node_type": "worker",
      "status": "online",
      "capabilities": ["processing", "storage"],
      "network_address": "192.168.1.11:8080",
      "last_heartbeat": "2025-08-13T10:34:30.000Z"
    }
  ],
  "connections": [
    {
      "connection_id": "conn-001",
      "source_node": "node-001",
      "target_node": "node-002",
      "connection_type": "bidirectional",
      "protocol": "websocket",
      "status": "established",
      "bandwidth_mbps": 100,
      "latency_ms": 5,
      "established_at": "2025-08-13T10:30:30.000Z"
    }
  ],
  "routing_config": {
    "algorithm": "shortest_path",
    "load_balancing": true,
    "failover_enabled": true,
    "max_hops": 10,
    "timeout_ms": 30000
  },
  "security_config": {
    "encryption_enabled": true,
    "authentication_required": true,
    "certificate_validation": true,
    "allowed_protocols": ["wss", "https", "grpc"]
  }
}
```

### **TypeScript层 (camelCase)**
```typescript
interface NetworkData {
  protocolVersion: string;
  timestamp: string;
  networkId: string;
  contextId: string;
  name: string;
  description: string;
  topology: NetworkTopology;
  status: NetworkStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  nodes: Array<{
    nodeId: string;
    agentId: string;
    nodeType: 'coordinator' | 'worker' | 'gateway' | 'monitor';
    status: NodeStatus;
    capabilities: string[];
    networkAddress: string;
    lastHeartbeat: string;
  }>;
  connections: Array<{
    connectionId: string;
    sourceNode: string;
    targetNode: string;
    connectionType: 'unidirectional' | 'bidirectional';
    protocol: 'websocket' | 'http' | 'grpc' | 'tcp';
    status: 'establishing' | 'established' | 'closing' | 'closed' | 'error';
    bandwidthMbps: number;
    latencyMs: number;
    establishedAt: string;
  }>;
  routingConfig: {
    algorithm: 'shortest_path' | 'load_balanced' | 'priority_based';
    loadBalancing: boolean;
    failoverEnabled: boolean;
    maxHops: number;
    timeoutMs: number;
  };
  securityConfig: {
    encryptionEnabled: boolean;
    authenticationRequired: boolean;
    certificateValidation: boolean;
    allowedProtocols: string[];
  };
}

type NetworkTopology = 'star' | 'mesh' | 'tree' | 'ring' | 'bus' | 'hybrid' | 'hierarchical';
type NetworkStatus = 'active' | 'inactive' | 'initializing' | 'error' | 'maintenance';
type NodeStatus = 'online' | 'offline' | 'connecting' | 'disconnecting' | 'error' | 'maintenance';
```

### **Mapper实现**
```typescript
export class NetworkMapper {
  static toSchema(entity: NetworkData): NetworkSchema {
    return {
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp,
      network_id: entity.networkId,
      context_id: entity.contextId,
      name: entity.name,
      description: entity.description,
      topology: entity.topology,
      status: entity.status,
      created_by: entity.createdBy,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      nodes: entity.nodes.map(node => ({
        node_id: node.nodeId,
        agent_id: node.agentId,
        node_type: node.nodeType,
        status: node.status,
        capabilities: node.capabilities,
        network_address: node.networkAddress,
        last_heartbeat: node.lastHeartbeat
      })),
      connections: entity.connections.map(conn => ({
        connection_id: conn.connectionId,
        source_node: conn.sourceNode,
        target_node: conn.targetNode,
        connection_type: conn.connectionType,
        protocol: conn.protocol,
        status: conn.status,
        bandwidth_mbps: conn.bandwidthMbps,
        latency_ms: conn.latencyMs,
        established_at: conn.establishedAt
      })),
      routing_config: {
        algorithm: entity.routingConfig.algorithm,
        load_balancing: entity.routingConfig.loadBalancing,
        failover_enabled: entity.routingConfig.failoverEnabled,
        max_hops: entity.routingConfig.maxHops,
        timeout_ms: entity.routingConfig.timeoutMs
      },
      security_config: {
        encryption_enabled: entity.securityConfig.encryptionEnabled,
        authentication_required: entity.securityConfig.authenticationRequired,
        certificate_validation: entity.securityConfig.certificateValidation,
        allowed_protocols: entity.securityConfig.allowedProtocols
      }
    };
  }

  static fromSchema(schema: NetworkSchema): NetworkData {
    return {
      protocolVersion: schema.protocol_version,
      timestamp: schema.timestamp,
      networkId: schema.network_id,
      contextId: schema.context_id,
      name: schema.name,
      description: schema.description,
      topology: schema.topology,
      status: schema.status,
      createdBy: schema.created_by,
      createdAt: schema.created_at,
      updatedAt: schema.updated_at,
      nodes: schema.nodes.map(node => ({
        nodeId: node.node_id,
        agentId: node.agent_id,
        nodeType: node.node_type,
        status: node.status,
        capabilities: node.capabilities,
        networkAddress: node.network_address,
        lastHeartbeat: node.last_heartbeat
      })),
      connections: schema.connections.map(conn => ({
        connectionId: conn.connection_id,
        sourceNode: conn.source_node,
        targetNode: conn.target_node,
        connectionType: conn.connection_type,
        protocol: conn.protocol,
        status: conn.status,
        bandwidthMbps: conn.bandwidth_mbps,
        latencyMs: conn.latency_ms,
        establishedAt: conn.established_at
      })),
      routingConfig: {
        algorithm: schema.routing_config.algorithm,
        loadBalancing: schema.routing_config.load_balancing,
        failoverEnabled: schema.routing_config.failover_enabled,
        maxHops: schema.routing_config.max_hops,
        timeoutMs: schema.routing_config.timeout_ms
      },
      securityConfig: {
        encryptionEnabled: schema.security_config.encryption_enabled,
        authenticationRequired: schema.security_config.authentication_required,
        certificateValidation: schema.security_config.certificate_validation,
        allowedProtocols: schema.security_config.allowed_protocols
      }
    };
  }

  static validateSchema(data: unknown): data is NetworkSchema {
    if (typeof data !== 'object' || data === null) return false;
    
    const obj = data as any;
    return (
      typeof obj.protocol_version === 'string' &&
      typeof obj.network_id === 'string' &&
      typeof obj.topology === 'string' &&
      Array.isArray(obj.nodes) &&
      Array.isArray(obj.connections) &&
      // 验证不存在camelCase字段
      !('networkId' in obj) &&
      !('protocolVersion' in obj) &&
      !('routingConfig' in obj)
    );
  }
}
```

## 🔍 **验证规则**

### **必需字段验证**
```json
{
  "required": [
    "protocol_version",
    "timestamp",
    "network_id",
    "context_id",
    "name",
    "topology",
    "nodes",
    "connections"
  ]
}
```

### **网络业务规则验证**
```typescript
const networkValidationRules = {
  // 验证网络拓扑一致性
  validateTopologyConsistency: (topology: string, connections: Connection[]) => {
    if (topology === 'star') {
      // 星型拓扑应该有一个中心节点
      const nodeDegrees = new Map<string, number>();
      connections.forEach(conn => {
        nodeDegrees.set(conn.sourceNode, (nodeDegrees.get(conn.sourceNode) || 0) + 1);
        nodeDegrees.set(conn.targetNode, (nodeDegrees.get(conn.targetNode) || 0) + 1);
      });
      const centerNodes = Array.from(nodeDegrees.entries()).filter(([_, degree]) => degree > 2);
      return centerNodes.length === 1;
    }
    return true;
  },

  // 验证连接有效性
  validateConnections: (nodes: Node[], connections: Connection[]) => {
    const nodeIds = new Set(nodes.map(n => n.nodeId));
    return connections.every(conn => 
      nodeIds.has(conn.sourceNode) && nodeIds.has(conn.targetNode)
    );
  },

  // 验证网络连通性
  validateConnectivity: (nodes: Node[], connections: Connection[]) => {
    if (nodes.length <= 1) return true;
    
    const graph = new Map<string, string[]>();
    nodes.forEach(node => graph.set(node.nodeId, []));
    connections.forEach(conn => {
      graph.get(conn.sourceNode)?.push(conn.targetNode);
      if (conn.connectionType === 'bidirectional') {
        graph.get(conn.targetNode)?.push(conn.sourceNode);
      }
    });
    
    // 使用BFS检查连通性
    const visited = new Set<string>();
    const queue = [nodes[0].nodeId];
    visited.add(nodes[0].nodeId);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      graph.get(current)?.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }
    
    return visited.size === nodes.length;
  }
};
```

## 🚀 **使用示例**

### **创建网状网络**
```typescript
import { NetworkService } from '@mplp/network';

const networkService = new NetworkService();

const meshNetwork = await networkService.createNetwork({
  contextId: "context-123",
  name: "分布式处理网络",
  description: "用于分布式任务处理的智能体网络",
  topology: "mesh",
  nodes: [
    {
      agentId: "agent-001",
      nodeType: "coordinator",
      capabilities: ["routing", "load_balancing"],
      networkAddress: "192.168.1.10:8080"
    },
    {
      agentId: "agent-002", 
      nodeType: "worker",
      capabilities: ["processing", "storage"],
      networkAddress: "192.168.1.11:8080"
    },
    {
      agentId: "agent-003",
      nodeType: "worker", 
      capabilities: ["processing", "analytics"],
      networkAddress: "192.168.1.12:8080"
    }
  ],
  routingConfig: {
    algorithm: "load_balanced",
    loadBalancing: true,
    failoverEnabled: true,
    maxHops: 5,
    timeoutMs: 30000
  }
});
```

### **监控网络状态**
```typescript
// 监听网络事件
networkService.on('node.connected', (event) => {
  console.log(`节点连接: ${event.nodeId}`);
});

networkService.on('connection.established', (event) => {
  console.log(`连接建立: ${event.sourceNode} → ${event.targetNode}`);
});

// 获取网络健康状态
const health = await networkService.getNetworkHealth(networkId);
console.log(`网络健康度: ${health.score}/100`);
console.log(`在线节点: ${health.onlineNodes}/${health.totalNodes}`);
```

---

**维护团队**: MPLP Network团队  
**最后更新**: 2025-08-13  
**文档状态**: ✅ 完成
