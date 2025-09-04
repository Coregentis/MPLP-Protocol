# Network API Reference

**Distributed Communication and Service Discovery - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Network%20Module-blue.svg)](../modules/network/README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--network.json-green.svg)](../schemas/README.md)
[![Status](https://img.shields.io/badge/status-Enterprise%20Grade-green.svg)](../../../ALPHA-RELEASE-NOTES.md)
[![Tests](https://img.shields.io/badge/tests-190%2F190%20passing-green.svg)](../modules/network/testing-guide.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../../zh-CN/api-reference/network-api.md)

---

## 🎯 Overview

The Network API provides comprehensive distributed communication and service discovery capabilities for multi-agent systems. It enables network topology management, message routing, fault recovery, and enterprise-grade distributed communication infrastructure. This API is based on the actual implementation in MPLP v1.0 Alpha.

## 📦 Import

```typescript
import { 
  NetworkController,
  NetworkManagementService,
  CreateNetworkDto,
  UpdateNetworkDto,
  NetworkResponseDto
} from 'mplp/modules/network';

// Or use the module interface
import { MPLP } from 'mplp';
const mplp = new MPLP();
const networkModule = mplp.getModule('network');
```

## 🏗️ Core Interfaces

### **NetworkResponseDto** (Response Interface)

```typescript
interface NetworkResponseDto {
  // Basic protocol fields
  protocolVersion: string;        // Protocol version "1.0.0"
  timestamp: string;              // ISO 8601 timestamp
  networkId: string;              // Unique network identifier
  contextId: string;              // Associated context ID
  name: string;                   // Network name
  status: NetworkStatus;          // Network status
  topology: NetworkTopology;      // Network topology
  
  // Network nodes and connections
  nodes: NetworkNode[];
  connections: NetworkConnection[];
  
  // Communication protocols
  protocols: CommunicationProtocol[];
  messageRouting: MessageRoutingConfig;
  
  // Service discovery
  services: NetworkService[];
  serviceRegistry: ServiceRegistryConfig;
  
  // Fault tolerance
  faultTolerance: FaultToleranceConfig;
  healthMonitoring: HealthMonitoringConfig;
  
  // Performance metrics
  performanceMetrics: NetworkMetrics;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

### **CreateNetworkDto** (Create Request Interface)

```typescript
interface CreateNetworkDto {
  contextId: string;              // Required: Associated context ID
  name: string;                   // Required: Network name
  topology: NetworkTopology;      // Required: Network topology
  
  // Initial nodes
  nodes?: Array<{
    nodeId: string;
    type: NodeType;
    address: string;
    capabilities: string[];
  }>;
  
  // Configuration
  configuration?: NetworkConfiguration;
  
  // Protocols
  protocols?: CommunicationProtocol[];
  
  // Metadata
  metadata?: Record<string, any>;
}
```

## 🔧 Core Enums

### **NetworkStatus** (Network Status)

```typescript
enum NetworkStatus {
  INITIALIZING = 'initializing',  // Initializing network
  ACTIVE = 'active',              // Active network
  DEGRADED = 'degraded',          // Degraded performance
  MAINTENANCE = 'maintenance',    // Under maintenance
  FAILED = 'failed',              // Network failure
  SHUTDOWN = 'shutdown'           // Shutdown
}
```

### **NetworkTopology** (Network Topology)

```typescript
enum NetworkTopology {
  STAR = 'star',                  // Star topology
  MESH = 'mesh',                  // Mesh topology
  RING = 'ring',                  // Ring topology
  TREE = 'tree',                  // Tree topology
  HYBRID = 'hybrid',              // Hybrid topology
  P2P = 'p2p'                     // Peer-to-peer topology
}
```

### **NodeType** (Node Type)

```typescript
enum NodeType {
  COORDINATOR = 'coordinator',    // Coordinator node
  WORKER = 'worker',              // Worker node
  GATEWAY = 'gateway',            // Gateway node
  RELAY = 'relay',                // Relay node
  MONITOR = 'monitor'             // Monitor node
}
```

## 🎮 Controller API

### **NetworkController**

Main REST API controller providing HTTP endpoint access.

#### **Create Network**
```typescript
async createNetwork(dto: CreateNetworkDto): Promise<NetworkOperationResult>
```

**HTTP Endpoint**: `POST /api/networks`

**Request Example**:
```json
{
  "contextId": "ctx-12345678-abcd-efgh",
  "name": "Multi-Agent Communication Network",
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

#### **Join Network**
```typescript
async joinNetwork(networkId: string, nodeInfo: JoinNetworkDto): Promise<NetworkOperationResult>
```

**HTTP Endpoint**: `POST /api/networks/{networkId}/join`

#### **Leave Network**
```typescript
async leaveNetwork(networkId: string, nodeId: string): Promise<NetworkOperationResult>
```

**HTTP Endpoint**: `POST /api/networks/{networkId}/leave`

#### **Send Message**
```typescript
async sendMessage(networkId: string, message: NetworkMessageDto): Promise<NetworkOperationResult>
```

**HTTP Endpoint**: `POST /api/networks/{networkId}/messages`

#### **Discover Services**
```typescript
async discoverServices(networkId: string, query: ServiceDiscoveryQuery): Promise<ServiceDiscoveryResult>
```

**HTTP Endpoint**: `GET /api/networks/{networkId}/services`

#### **Register Service**
```typescript
async registerService(networkId: string, service: ServiceRegistrationDto): Promise<NetworkOperationResult>
```

**HTTP Endpoint**: `POST /api/networks/{networkId}/services/register`

#### **Get Network Status**
```typescript
async getNetworkStatus(networkId: string): Promise<NetworkStatusDto>
```

**HTTP Endpoint**: `GET /api/networks/{networkId}/status`

#### **Get Network Topology**
```typescript
async getNetworkTopology(networkId: string): Promise<NetworkTopologyDto>
```

**HTTP Endpoint**: `GET /api/networks/{networkId}/topology`

## 🔧 Service Layer API

### **NetworkManagementService**

Core business logic service providing network management functionality.

#### **Main Methods**

```typescript
class NetworkManagementService {
  // Basic CRUD operations
  async createNetwork(request: CreateNetworkRequest): Promise<NetworkEntity>;
  async getNetworkById(networkId: string): Promise<NetworkEntity | null>;
  async updateNetwork(networkId: string, request: UpdateNetworkRequest): Promise<NetworkEntity>;
  async deleteNetwork(networkId: string): Promise<boolean>;
  
  // Node management
  async addNode(networkId: string, node: NetworkNode): Promise<NetworkEntity>;
  async removeNode(networkId: string, nodeId: string): Promise<NetworkEntity>;
  async updateNodeStatus(networkId: string, nodeId: string, status: NodeStatus): Promise<NetworkEntity>;
  
  // Connection management
  async establishConnection(networkId: string, connection: NetworkConnection): Promise<ConnectionResult>;
  async terminateConnection(networkId: string, connectionId: string): Promise<NetworkEntity>;
  async getConnectionStatus(networkId: string, connectionId: string): Promise<ConnectionStatus>;
  
  // Message routing
  async routeMessage(networkId: string, message: NetworkMessage): Promise<RoutingResult>;
  async broadcastMessage(networkId: string, message: NetworkMessage): Promise<BroadcastResult>;
  async multicastMessage(networkId: string, message: NetworkMessage, targets: string[]): Promise<MulticastResult>;
  
  // Service discovery
  async registerService(networkId: string, service: NetworkService): Promise<ServiceRegistrationResult>;
  async unregisterService(networkId: string, serviceId: string): Promise<NetworkEntity>;
  async discoverServices(networkId: string, query: ServiceQuery): Promise<ServiceDiscoveryResult>;
  
  // Fault tolerance
  async detectFailures(networkId: string): Promise<FailureDetectionResult>;
  async handleFailure(networkId: string, failureId: string, recovery: FailureRecovery): Promise<RecoveryResult>;
  
  // Analytics and monitoring
  async getNetworkMetrics(networkId: string): Promise<NetworkMetrics>;
  async getNetworkHealth(networkId: string): Promise<NetworkHealth>;
}
```

## 📊 Data Structures

### **NetworkNode** (Network Node)

```typescript
interface NetworkNode {
  nodeId: string;                 // Node identifier
  type: NodeType;                 // Node type
  address: string;                // Node address
  status: NodeStatus;             // Node status
  capabilities: string[];         // Node capabilities
  resources: NodeResources;       // Available resources
  connections: string[];          // Connected node IDs
  lastHeartbeat: Date;            // Last heartbeat timestamp
}
```

### **NetworkConnection** (Network Connection)

```typescript
interface NetworkConnection {
  connectionId: string;           // Connection identifier
  sourceNodeId: string;           // Source node ID
  targetNodeId: string;           // Target node ID
  protocol: string;               // Communication protocol
  status: ConnectionStatus;       // Connection status
  quality: ConnectionQuality;     // Connection quality metrics
  establishedAt: Date;            // Connection establishment time
  lastActivity: Date;             // Last activity timestamp
}
```

### **NetworkMessage** (Network Message)

```typescript
interface NetworkMessage {
  messageId: string;              // Message identifier
  senderId: string;               // Sender node ID
  recipientId?: string;           // Recipient node ID (optional for broadcast)
  messageType: MessageType;       // Message type
  payload: any;                   // Message payload
  priority: MessagePriority;      // Message priority
  timestamp: Date;                // Message timestamp
  ttl?: number;                   // Time to live (seconds)
  routing?: RoutingInfo;          // Routing information
}
```

### **NetworkService** (Network Service)

```typescript
interface NetworkService {
  serviceId: string;              // Service identifier
  name: string;                   // Service name
  version: string;                // Service version
  providerId: string;             // Provider node ID
  endpoints: ServiceEndpoint[];   // Service endpoints
  capabilities: string[];         // Service capabilities
  status: ServiceStatus;          // Service status
  registeredAt: Date;             // Registration timestamp
  metadata?: Record<string, any>; // Service metadata
}
```

---

## 🔗 Related Documentation

- **[Implementation Guide](../modules/network/implementation-guide.md)**: Detailed implementation instructions
- **[Configuration Guide](../modules/network/configuration-guide.md)**: Configuration options reference
- **[Integration Examples](../modules/network/integration-examples.md)**: Real-world usage examples
- **[Protocol Specification](../modules/network/protocol-specification.md)**: Underlying protocol specification

---

**Last Updated**: September 4, 2025  
**API Version**: v1.0.0  
**Status**: Enterprise Grade Production Ready  
**Language**: English
