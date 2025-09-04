# Network API 参考

**分布式通信和服务发现 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Network%20模块-blue.svg)](../modules/network/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--network.json-green.svg)](../schemas/README.md)
[![状态](https://img.shields.io/badge/status-企业级-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![测试](https://img.shields.io/badge/tests-190%2F190%20通过-green.svg)](../modules/network/testing-guide.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/api-reference/network-api.md)

---

## 🎯 概述

Network API为多智能体系统提供全面的分布式通信和服务发现功能。它支持网络拓扑管理、消息路由、故障恢复和企业级分布式通信基础设施。此API基于MPLP v1.0 Alpha的实际实现。

## 📦 导入

```typescript
import { 
  NetworkController,
  NetworkManagementService,
  CreateNetworkDto,
  UpdateNetworkDto,
  NetworkResponseDto
} from 'mplp/modules/network';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const networkModule = mplp.getModule('network');
```

## 🏗️ 核心接口

### **NetworkResponseDto** (响应接口)

```typescript
interface NetworkResponseDto {
  // 基础协议字段
  protocolVersion: string;        // 协议版本 "1.0.0"
  timestamp: string;              // ISO 8601时间戳
  networkId: string;              // 唯一网络标识符
  contextId: string;              // 关联的上下文ID
  name: string;                   // 网络名称
  status: NetworkStatus;          // 网络状态
  topology: NetworkTopology;      // 网络拓扑
  
  // 网络节点和连接
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  
  // 通信协议
  protocols: CommunicationProtocol[];
  messageRouting: MessageRoutingConfig;
  
  // 服务发现
  services: NetworkService[];
  serviceRegistry: ServiceRegistryConfig;
  
  // 容错机制
  faultTolerance: FaultToleranceConfig;
  healthMonitoring: HealthMonitoringConfig;
  
  // 性能指标
  performanceMetrics: NetworkMetrics;
  
  // 元数据
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateNetworkDto** (创建请求接口)

```typescript
interface CreateNetworkDto {
  contextId: string;              // 必需：关联的上下文ID
  name: string;                   // 必需：网络名称
  topology: NetworkTopology;      // 必需：网络拓扑
  
  // 初始节点
  nodes?: Array<{
    nodeId: string;
    type: NodeType;
    address: string;
    capabilities: string[];
  }>;
  
  // 配置
  configuration?: NetworkConfiguration;
  
  // 协议
  protocols?: CommunicationProtocol[];
  
  // 元数据
  metadata?: Record<string, any>;
}
```

## 🔧 核心枚举类型

### **NetworkStatus** (网络状态)

```typescript
enum NetworkStatus {
  INITIALIZING = 'initializing',  // 初始化网络
  ACTIVE = 'active',              // 活跃网络
  DEGRADED = 'degraded',          // 性能降级
  MAINTENANCE = 'maintenance',    // 维护中
  FAILED = 'failed',              // 网络故障
  SHUTDOWN = 'shutdown'           // 已关闭
}
```

### **NetworkTopology** (网络拓扑)

```typescript
enum NetworkTopology {
  STAR = 'star',                  // 星型拓扑
  MESH = 'mesh',                  // 网状拓扑
  RING = 'ring',                  // 环型拓扑
  TREE = 'tree',                  // 树型拓扑
  HYBRID = 'hybrid',              // 混合拓扑
  P2P = 'p2p'                     // 点对点拓扑
}
```

### **NodeType** (节点类型)

```typescript
enum NodeType {
  COORDINATOR = 'coordinator',    // 协调节点
  WORKER = 'worker',              // 工作节点
  GATEWAY = 'gateway',            // 网关节点
  RELAY = 'relay',                // 中继节点
  MONITOR = 'monitor'             // 监控节点
}
```

## 🎮 控制器API

### **NetworkController**

主要的REST API控制器，提供HTTP端点访问。

#### **创建网络**
```typescript
async createNetwork(dto: CreateNetworkDto): Promise<NetworkOperationResult>
```

**HTTP端点**: `POST /api/networks`

**请求示例**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "name": "多智能体通信网络",
  "topology": "mesh",
  "nodes": [
    {
      "nodeId": "coordinator-001",
      "type": "coordinator",
      "address": "tcp://192.168.1.100:8080",
      "capabilities": ["coordination", "load_balancing", "monitoring"]
    },
    {
      "nodeId": "worker-001",
      "type": "worker",
      "address": "tcp://192.168.1.101:8080",
      "capabilities": ["task_processing", "data_analysis"]
    },
    {
      "nodeId": "worker-002",
      "type": "worker",
      "address": "tcp://192.168.1.102:8080",
      "capabilities": ["task_processing", "machine_learning"]
    }
  ],
  "configuration": {
    "maxConnections": 100,
    "connectionTimeout": 30000,
    "heartbeatInterval": 5000,
    "retryAttempts": 3
  },
  "protocols": [
    {
      "name": "MPLP-TCP",
      "version": "1.0",
      "port": 8080,
      "encryption": true
    }
  ]
}
```

#### **加入网络**
```typescript
async joinNetwork(networkId: string, nodeInfo: JoinNetworkDto): Promise<NetworkOperationResult>
```

**HTTP端点**: `POST /api/networks/{networkId}/join`

#### **离开网络**
```typescript
async leaveNetwork(networkId: string, nodeId: string): Promise<NetworkOperationResult>
```

**HTTP端点**: `POST /api/networks/{networkId}/leave`

#### **发送消息**
```typescript
async sendMessage(networkId: string, message: NetworkMessageDto): Promise<NetworkOperationResult>
```

**HTTP端点**: `POST /api/networks/{networkId}/messages`

#### **发现服务**
```typescript
async discoverServices(networkId: string, query: ServiceDiscoveryQuery): Promise<ServiceDiscoveryResult>
```

**HTTP端点**: `GET /api/networks/{networkId}/services`

#### **注册服务**
```typescript
async registerService(networkId: string, service: ServiceRegistrationDto): Promise<NetworkOperationResult>
```

**HTTP端点**: `POST /api/networks/{networkId}/services/register`

#### **获取网络状态**
```typescript
async getNetworkStatus(networkId: string): Promise<NetworkStatusDto>
```

**HTTP端点**: `GET /api/networks/{networkId}/status`

#### **获取网络拓扑**
```typescript
async getNetworkTopology(networkId: string): Promise<NetworkTopologyDto>
```

**HTTP端点**: `GET /api/networks/{networkId}/topology`

## 🔧 服务层API

### **NetworkManagementService**

核心业务逻辑服务，提供网络管理功能。

#### **主要方法**

```typescript
class NetworkManagementService {
  // 基础CRUD操作
  async createNetwork(request: CreateNetworkRequest): Promise<NetworkEntity>;
  async getNetworkById(networkId: string): Promise<NetworkEntity | null>;
  async updateNetwork(networkId: string, request: UpdateNetworkRequest): Promise<NetworkEntity>;
  async deleteNetwork(networkId: string): Promise<boolean>;
  
  // 节点管理
  async addNode(networkId: string, node: NetworkNode): Promise<NetworkEntity>;
  async removeNode(networkId: string, nodeId: string): Promise<NetworkEntity>;
  async updateNodeStatus(networkId: string, nodeId: string, status: NodeStatus): Promise<NetworkEntity>;
  
  // 连接管理
  async establishConnection(networkId: string, connection: NetworkConnection): Promise<ConnectionResult>;
  async terminateConnection(networkId: string, connectionId: string): Promise<NetworkEntity>;
  async getConnectionStatus(networkId: string, connectionId: string): Promise<ConnectionStatus>;
  
  // 消息路由
  async routeMessage(networkId: string, message: NetworkMessage): Promise<RoutingResult>;
  async broadcastMessage(networkId: string, message: NetworkMessage): Promise<BroadcastResult>;
  async multicastMessage(networkId: string, message: NetworkMessage, targets: string[]): Promise<MulticastResult>;
  
  // 服务发现
  async registerService(networkId: string, service: NetworkService): Promise<ServiceRegistrationResult>;
  async unregisterService(networkId: string, serviceId: string): Promise<NetworkEntity>;
  async discoverServices(networkId: string, query: ServiceQuery): Promise<ServiceDiscoveryResult>;
  
  // 容错处理
  async detectFailures(networkId: string): Promise<FailureDetectionResult>;
  async handleFailure(networkId: string, failureId: string, recovery: FailureRecovery): Promise<RecoveryResult>;
  
  // 分析和监控
  async getNetworkMetrics(networkId: string): Promise<NetworkMetrics>;
  async getNetworkHealth(networkId: string): Promise<NetworkHealth>;
}
```

## 📊 数据结构

### **NetworkNode** (网络节点)

```typescript
interface NetworkNode {
  nodeId: string;                 // 节点标识符
  type: NodeType;                 // 节点类型
  address: string;                // 节点地址
  status: NodeStatus;             // 节点状态
  capabilities: string[];         // 节点能力
  resources: NodeResources;       // 可用资源
  connections: string[];          // 连接的节点ID
  lastHeartbeat: Date;            // 最后心跳时间戳
}
```

### **NetworkConnection** (网络连接)

```typescript
interface NetworkConnection {
  connectionId: string;           // 连接标识符
  sourceNodeId: string;           // 源节点ID
  targetNodeId: string;           // 目标节点ID
  protocol: string;               // 通信协议
  status: ConnectionStatus;       // 连接状态
  quality: ConnectionQuality;     // 连接质量指标
  establishedAt: Date;            // 连接建立时间
  lastActivity: Date;             // 最后活动时间戳
}
```

### **NetworkMessage** (网络消息)

```typescript
interface NetworkMessage {
  messageId: string;              // 消息标识符
  senderId: string;               // 发送者节点ID
  recipientId?: string;           // 接收者节点ID（广播时可选）
  messageType: MessageType;       // 消息类型
  payload: any;                   // 消息载荷
  priority: MessagePriority;      // 消息优先级
  timestamp: Date;                // 消息时间戳
  ttl?: number;                   // 生存时间（秒）
  routing?: RoutingInfo;          // 路由信息
}
```

### **NetworkService** (网络服务)

```typescript
interface NetworkService {
  serviceId: string;              // 服务标识符
  name: string;                   // 服务名称
  version: string;                // 服务版本
  providerId: string;             // 提供者节点ID
  endpoints: ServiceEndpoint[];   // 服务端点
  capabilities: string[];         // 服务能力
  status: ServiceStatus;          // 服务状态
  registeredAt: Date;             // 注册时间戳
  metadata?: Record<string, any>; // 服务元数据
}
```

---

## 🔗 相关文档

- **[实现指南](../modules/network/implementation-guide.md)**: 详细实现说明
- **[配置指南](../modules/network/configuration-guide.md)**: 配置选项参考
- **[集成示例](../modules/network/integration-examples.md)**: 实际使用示例
- **[协议规范](../modules/network/protocol-specification.md)**: 底层协议规范

---

**最后更新**: 2025年9月4日  
**API版本**: v1.0.0  
**状态**: 企业级生产就绪  
**语言**: 简体中文
