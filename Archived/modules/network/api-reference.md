# Network模块API参考文档

## 📋 **模块概述**

Network模块是MPLP v1.0多智能体协议生命周期平台的核心网络通信模块，提供智能路由、拓扑管理、负载均衡和分布式协作功能。

### **模块信息**
- **模块名称**: Network
- **版本**: 1.0.0
- **层级**: L2协调层
- **状态**: ✅ **企业级标准达成** (100%完成)
- **架构**: 统一DDD分层架构 + L3管理器注入模式
- **测试状态**: 190/190测试通过，100%通过率

## 🔧 **核心API接口**

### **NetworkProtocol**

网络协议的主要接口，实现IMLPPProtocol标准。

#### **executeOperation(request: MLPPRequest): Promise<MLPPResponse>**

执行网络协议操作的核心方法。

**支持的操作**:

**核心管理操作**:
- `create_network`: 创建网络
- `update_network`: 更新网络
- `delete_network`: 删除网络
- `add_node`: 添加节点
- `remove_node`: 移除节点
- `add_edge`: 添加边缘连接
- `remove_edge`: 移除边缘连接
- `update_node_status`: 更新节点状态
- `get_network_stats`: 获取网络统计
- `check_network_health`: 检查网络健康
- `optimize_topology`: 拓扑优化
- `discover_nodes`: 节点发现
- `route_message`: 消息路由

**企业级分析操作**:
- `analyze_network`: 网络分析
- `generate_health_report`: 生成健康报告

**企业级监控操作**:
- `get_realtime_metrics`: 获取实时监控指标
- `get_monitoring_dashboard`: 获取监控仪表板
- `start_monitoring`: 开始监控

**企业级安全操作**:
- `perform_threat_detection`: 执行威胁检测
- `perform_security_audit`: 执行安全审计
- `get_security_dashboard`: 获取安全仪表板

**请求格式**:
```typescript
interface MLPPRequest {
  protocolVersion: string;
  timestamp: string;
  requestId: string;
  operation: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
```

**响应格式**:
```typescript
interface MLPPResponse {
  protocolVersion: string;
  timestamp: string;
  requestId: string;
  status: 'success' | 'error' | 'pending';
  result?: Record<string, unknown>;
  error?: string | ErrorObject;
  metadata?: Record<string, unknown>;
}
```

#### **getProtocolMetadata(): ProtocolMetadata**

获取协议元数据信息。

**返回值**:
```typescript
interface ProtocolMetadata {
  name: 'network';
  version: '1.0.0';
  description: '网络通信和分布式协作模块';
  capabilities: string[];
  dependencies: string[];
  supportedOperations: string[];
}
```

#### **healthCheck(): Promise<HealthStatus>**

执行健康检查。

**返回值**:
```typescript
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  details: Record<string, unknown>;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
  }>;
}
```

## 🏗️ **DDD架构层API**

### **API层**

#### **NetworkController**

网络控制器，处理HTTP请求和响应。

**主要方法**:
- `createNetwork(req, res)`: 创建网络端点
- `getNetwork(req, res)`: 获取网络端点
- `updateNetwork(req, res)`: 更新网络端点
- `deleteNetwork(req, res)`: 删除网络端点
- `listNetworks(req, res)`: 列出网络端点

#### **NetworkMapper**

网络数据映射器，处理Schema-TypeScript双重命名约定。

**主要方法**:
- `toSchema(entity)`: Entity转Schema
- `fromSchema(schema)`: Schema转Entity
- `toDTO(entity)`: Entity转DTO
- `validateSchema(data)`: Schema验证

### **应用层**

#### **NetworkManagementService**

网络管理服务，实现核心业务逻辑。

**主要方法**:
- `createNetwork(data)`: 创建网络
- `getNetworkById(id)`: 根据ID获取网络
- `updateNetwork(id, data)`: 更新网络
- `deleteNetwork(id)`: 删除网络
- `addNodeToNetwork(networkId, nodeData)`: 添加节点
- `removeNodeFromNetwork(networkId, nodeId)`: 移除节点
- `getNetworkStatistics(networkId)`: 获取网络统计

### **领域层**

#### **NetworkEntity**

网络实体，包含核心业务逻辑。

**主要属性**:
- `networkId`: 网络ID
- `name`: 网络名称
- `topology`: 网络拓扑
- `status`: 网络状态
- `nodes`: 节点列表
- `edges`: 边缘连接列表

**主要方法**:
- `addNode(node)`: 添加节点
- `removeNode(nodeId)`: 移除节点
- `addEdge(edge)`: 添加边缘连接
- `getStatistics()`: 获取统计信息
- `isHealthy()`: 健康检查

### **基础设施层**

#### **NetworkRepository**

网络仓储接口实现。

**主要方法**:
- `save(network)`: 保存网络
- `findById(id)`: 根据ID查找
- `findAll()`: 查找所有
- `delete(id)`: 删除网络
- `search(criteria)`: 搜索网络

## 🔌 **MPLP生态系统集成**

### **模块协作接口**

#### **与Context模块协作**
- `coordinateWithContext(contextId, operation)`: 上下文协作

#### **与Plan模块协作**
- `coordinateWithPlan(planId, config)`: 计划协作

#### **与Role模块协作**
- `coordinateWithRole(roleId, permissions)`: 角色协作

#### **与Trace模块协作**
- `coordinateWithTrace(traceId, operation)`: 追踪协作

### **CoreOrchestrator编排场景**

- `network_topology_optimization`: 网络拓扑优化
- `distributed_load_balancing`: 分布式负载均衡
- `fault_tolerance_management`: 故障容错管理

## 📊 **性能指标**

### **性能基准**
- API响应时间: P95 < 100ms, P99 < 200ms
- 协议解析性能: < 10ms
- 网络路由延迟: < 50ms
- 拓扑优化时间: < 5秒

### **容量限制**
- 最大网络数量: 10,000
- 每网络最大节点数: 1,000
- 最大并发连接: 10,000
- 最大消息吞吐量: 100,000/秒

## 🔒 **安全考虑**

### **访问控制**
- 基于角色的访问控制(RBAC)
- API密钥认证
- 请求速率限制

### **数据保护**
- 传输加密(TLS 1.3)
- 数据完整性验证
- 审计日志记录

## 📝 **使用示例**

### **创建网络**
```typescript
const request: MLPPRequest = {
  protocolVersion: '1.0.0',
  requestId: 'req-001',
  operation: 'createNetwork',
  payload: {
    name: 'My Network',
    topology: 'mesh',
    contextId: 'ctx-001'
  },
  timestamp: new Date().toISOString()
};

const response = await networkProtocol.executeOperation(request);
```

### **消息路由**
```typescript
const routingRequest: MLPPRequest = {
  protocolVersion: '1.0.0',
  requestId: 'req-002',
  operation: 'routeMessage',
  payload: {
    networkId: 'net-001',
    sourceNodeId: 'node-001',
    targetNodeId: 'node-002',
    message: { type: 'data', content: 'Hello' },
    routingStrategy: 'shortest_path'
  },
  timestamp: new Date().toISOString()
};

const routingResponse = await networkProtocol.executeOperation(routingRequest);
```

## 🚨 **错误处理**

### **常见错误码**
- `NETWORK_NOT_FOUND`: 网络不存在
- `NODE_NOT_FOUND`: 节点不存在
- `INVALID_TOPOLOGY`: 无效拓扑类型
- `CAPACITY_EXCEEDED`: 容量超限
- `ROUTING_FAILED`: 路由失败

### **错误响应格式**
```typescript
{
  status: 'error',
  error: {
    code: 'NETWORK_NOT_FOUND',
    message: '网络不存在',
    details: { networkId: 'net-001' }
  }
}
```

---

**文档版本**: 1.0.0  
**最后更新**: 2025-08-30  
**维护者**: MPLP Network Team
