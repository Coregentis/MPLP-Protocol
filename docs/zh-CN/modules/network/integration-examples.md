# Network模块集成示例

> **🌐 语言导航**: [English](../../../en/modules/network/integration-examples.md) | [中文](integration-examples.md)



**多智能体协议生命周期平台 - Network模块集成示例 v1.0.0-alpha**

[![集成](https://img.shields.io/badge/integration-Enterprise%20Ready-green.svg)](./README.md)
[![示例](https://img.shields.io/badge/examples-Production%20Ready-blue.svg)](./implementation-guide.md)
[![网络](https://img.shields.io/badge/networking-Best%20Practices-orange.svg)](./api-reference.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/modules/network/integration-examples.md)

---

## 🎯 集成概览

本文档提供Network模块的全面集成示例，展示真实世界的企业分布式通信场景、跨模块网络集成模式，以及使用MPLP Network模块构建综合网络系统的最佳实践。

### **集成场景**
- **企业分布式通信平台**: 具有AI编排的完整网络管理
- **多节点协调系统**: 可扩展的网络拓扑和连接基础设施
- **跨模块集成**: 与Context、Plan、Dialog和Collab模块的集成
- **实时网络中心**: 高性能网络编排和优化
- **AI驱动的网络生态系统**: 机器学习增强的网络管理
- **全球网络基础设施**: 多区域分布式通信系统

---

## 🚀 基础集成示例

### **1. 企业分布式通信平台**

#### **Express.js与全面网络管理**
```typescript
import express from 'express';
import { NetworkModule } from '@mplp/network';
import { EnterpriseNetworkManager } from '@mplp/network/services';
import { NetworkMiddleware } from '@mplp/network/middleware';
import { IntelligentNetworkingService } from '@mplp/network/ai';

// 初始化Express应用
const app = express();
app.use(express.json());

// 初始化具有企业功能的Network模块
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
      retryDelayMs: 1000
    }
  },
  intelligentNetworking: {
    aiOptimization: {
      enabled: true,
      predictiveRouting: true,
      adaptiveLoadBalancing: true,
      anomalyDetection: true,
      mlModels: {
        trafficPrediction: {
          enabled: true,
          modelPath: process.env.ML_MODELS_PATH + '/traffic_prediction.pkl',
          updateIntervalHours: 24
        },
        failurePrediction: {
          enabled: true,
          modelPath: process.env.ML_MODELS_PATH + '/failure_prediction.pkl',
          predictionWindowHours: 4
        }
      }
    },
    autoScaling: {
      enabled: true,
      scalingMetrics: ['cpu_utilization', 'memory_utilization', 'network_utilization'],
      scaleUpThreshold: 80,
      scaleDownThreshold: 30,
      minNodes: 3,
      maxNodes: 100
    }
  },
  security: {
    networkSecurity: {
      encryptionEnabled: true,
      tlsVersion: '1.3',
      certificateValidation: true
    },
    authentication: {
      enabled: true,
      authMethod: 'jwt',
      jwtSecret: process.env.JWT_SECRET,
      tokenExpiryHours: 24
    },
    accessControl: {
      enabled: true,
      defaultPolicy: 'deny',
      rbacEnabled: true
    }
  }
});

// 获取Network服务实例
const networkManager = networkModule.getNetworkManager();
const intelligentNetworking = networkModule.getIntelligentNetworkingService();

// 应用Network中间件
app.use('/api/network', NetworkMiddleware.authenticate());
app.use('/api/network', NetworkMiddleware.rateLimit({
  maxRequestsPerMinute: 1000,
  maxTopologiesPerHour: 100
}));

// 创建企业网络拓扑
app.post('/api/network/topologies', async (req, res) => {
  try {
    const topology = await networkManager.createNetworkTopology({
      topologyId: req.body.topologyId,
      topologyName: req.body.topologyName,
      topologyType: req.body.topologyType,
      topologyCategory: req.body.topologyCategory,
      topologyDescription: req.body.topologyDescription,
      networkNodes: req.body.networkNodes.map(node => ({
        nodeId: node.nodeId,
        nodeType: node.nodeType,
        nodeRole: node.nodeRole,
        nodeName: node.nodeName,
        nodeLocation: {
          region: node.location.region,
          availabilityZone: node.location.availabilityZone,
          dataCenter: node.location.dataCenter,
          geographicLocation: node.location.geographicLocation
        },
        nodeCapabilities: node.capabilities,
        networkInterfaces: node.interfaces.map(iface => ({
          interfaceId: iface.interfaceId,
          interfaceType: iface.interfaceType,
          bandwidthCapacity: iface.bandwidthCapacity,
          protocolSupport: iface.protocolSupport,
          securityFeatures: iface.securityFeatures
        })),
        resourceAllocation: {
          cpuCores: node.resources.cpuCores,
          memoryGb: node.resources.memoryGb,
          storageGb: node.resources.storageGb,
          networkBandwidthGbps: node.resources.networkBandwidthGbps
        }
      })),
      networkConfiguration: {
        routingAlgorithm: req.body.configuration.routingAlgorithm,
        loadBalancingStrategy: req.body.configuration.loadBalancingStrategy,
        faultToleranceLevel: req.body.configuration.faultToleranceLevel,
        securityLevel: req.body.configuration.securityLevel,
        performanceOptimization: req.body.configuration.performanceOptimization
      },
      intelligentNetworking: {
        aiOptimization: {
          enablePredictiveRouting: req.body.intelligentNetworking.enablePredictiveRouting,
          enableAdaptiveLoadBalancing: req.body.intelligentNetworking.enableAdaptiveLoadBalancing,
          enableAnomalyDetection: req.body.intelligentNetworking.enableAnomalyDetection
        },
        autoScaling: req.body.intelligentNetworking.autoScaling
      },
      createdBy: req.user.id
    });

    res.status(201).json({
      topologyId: topology.topologyId,
      topologyName: topology.topologyName,
      topologyStatus: topology.status,
      nodeCount: topology.networkNodes.length,
      connectionCount: topology.connections?.length || 0,
      intelligentFeatures: {
        aiOptimizationEnabled: topology.intelligentNetworking.aiOptimization.enabled,
        autoScalingEnabled: topology.intelligentNetworking.autoScaling.enabled,
        predictiveModelsLoaded: topology.intelligentNetworking.mlModels?.length || 0
      },
      createdAt: topology.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 添加网络节点
app.post('/api/network/topologies/:topologyId/nodes', async (req, res) => {
  try {
    const node = await networkManager.addNetworkNode({
      topologyId: req.params.topologyId,
      nodeId: req.body.nodeId,
      nodeType: req.body.nodeType,
      nodeRole: req.body.nodeRole,
      nodeConfiguration: {
        nodeName: req.body.nodeName,
        nodeLocation: req.body.nodeLocation,
        nodeCapabilities: req.body.nodeCapabilities,
        networkInterfaces: req.body.networkInterfaces,
        resourceAllocation: req.body.resourceAllocation
      },
      addedBy: req.user.id
    });

    res.status(201).json({
      nodeId: node.nodeId,
      nodeType: node.nodeType,
      nodeStatus: node.status,
      connectionCount: node.connections?.length || 0,
      performanceMetrics: {
        latency: node.performanceMetrics?.latency,
        throughput: node.performanceMetrics?.throughput,
        availability: node.performanceMetrics?.availability
      },
      addedAt: node.addedAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 发送网络消息
app.post('/api/network/messages/send', async (req, res) => {
  try {
    const result = await networkManager.sendMessage({
      messageId: req.body.messageId,
      messageType: req.body.messageType,
      sourceNodeId: req.body.sourceNodeId,
      targetNodeId: req.body.targetNodeId,
      messageContent: req.body.messageContent,
      deliveryOptions: {
        deliveryMode: req.body.deliveryOptions?.deliveryMode || 'reliable',
        timeoutSeconds: req.body.deliveryOptions?.timeoutSeconds || 30,
        retryAttempts: req.body.deliveryOptions?.retryAttempts || 3,
        compressionEnabled: req.body.deliveryOptions?.compressionEnabled || true
      },
      sentBy: req.user.id
    });

    res.json({
      messageId: result.messageId,
      deliveryStatus: result.status,
      routingPath: result.routingPath,
      deliveryTime: result.deliveryTime,
      networkMetrics: {
        latency: result.networkMetrics.latency,
        throughput: result.networkMetrics.throughput,
        hopCount: result.networkMetrics.hopCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取网络性能指标
app.get('/api/network/metrics/performance', async (req, res) => {
  try {
    const metrics = await networkManager.getPerformanceMetrics({
      topologyId: req.query.topologyId,
      timeRange: req.query.timeRange || 'last_24_hours',
      metrics: req.query.metrics ? req.query.metrics.split(',') : ['latency', 'throughput', 'availability'],
      aggregation: req.query.aggregation || 'average'
    });

    res.json({
      topologyId: metrics.topologyId,
      timeRange: metrics.timeRange,
      performanceMetrics: {
        latency: {
          average: metrics.latency.average,
          p50: metrics.latency.p50,
          p95: metrics.latency.p95,
          p99: metrics.latency.p99
        },
        throughput: {
          average: metrics.throughput.average,
          peak: metrics.throughput.peak,
          total: metrics.throughput.total
        },
        availability: {
          percentage: metrics.availability.percentage,
          uptime: metrics.availability.uptime,
          downtime: metrics.availability.downtime
        },
        errorRates: {
          connectionErrors: metrics.errorRates.connectionErrors,
          timeoutErrors: metrics.errorRates.timeoutErrors,
          protocolErrors: metrics.errorRates.protocolErrors
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### **2. 跨模块集成示例**

#### **与Context模块集成**
```typescript
import { ContextModule } from '@mplp/context';
import { NetworkModule } from '@mplp/network';
import { EventEmitter2 } from '@nestjs/event-emitter';

// 初始化模块
const contextModule = new ContextModule(contextConfig);
const networkModule = new NetworkModule(networkConfig);
const eventEmitter = new EventEmitter2();

// 设置跨模块事件监听
contextModule.on('context.created', async (event) => {
  console.log('上下文创建事件:', event);
  
  // 为新上下文建立网络连接
  const networkTopology = await networkModule.getNetworkManager()
    .getTopologyForContext(event.contextId);

  if (networkTopology) {
    // 为上下文参与者建立网络连接
    for (const participant of event.participants) {
      await networkModule.getNetworkManager().establishConnection({
        sourceNodeId: event.contextId,
        targetNodeId: participant.participantId,
        connectionType: 'context_communication',
        priority: 'high'
      });
    }
  }
});

networkModule.on('topology.created', async (event) => {
  console.log('网络拓扑创建事件:', event);
  
  // 为新拓扑创建上下文
  await contextModule.createContext({
    contextId: `network-${event.topologyId}`,
    contextType: 'network_topology',
    contextData: {
      topologyId: event.topologyId,
      nodeCount: event.nodeCount,
      networkType: event.topologyType
    },
    createdBy: event.createdBy
  });
});
```

#### **与Dialog模块集成**
```typescript
import { DialogModule } from '@mplp/dialog';

// 初始化Dialog模块
const dialogModule = new DialogModule(dialogConfig);

// 扩展Dialog服务以支持网络集成
class NetworkIntegratedDialogService extends DialogManager {
  constructor(
    dialogRepository: DialogRepository,
    private networkModule: NetworkModule
  ) {
    super(dialogRepository);
  }

  async createDistributedDialog(request: CreateDistributedDialogRequest): Promise<DialogSession> {
    // 创建基础对话
    const dialog = await this.createDialog({
      dialogName: request.dialogName,
      dialogType: request.dialogType,
      participants: request.participants,
      createdBy: request.createdBy
    });

    // 为对话参与者建立网络拓扑
    const networkTopology = await this.networkModule.getNetworkManager()
      .createNetworkTopology({
        topologyId: `dialog-${dialog.dialogId}`,
        topologyName: `对话网络 - ${request.dialogName}`,
        topologyType: 'star',
        networkNodes: request.participants.map(participant => ({
          nodeId: participant.participantId,
          nodeType: 'dialog_participant',
          nodeRole: participant.role,
          nodeName: participant.name,
          nodeCapabilities: ['message_processing', 'dialog_management']
        })),
        createdBy: request.createdBy
      });

    // 启用实时消息传递
    await this.enableRealtimeMessaging(dialog.dialogId, networkTopology.topologyId);

    return dialog;
  }

  async sendDistributedMessage(dialogId: string, message: DialogMessage): Promise<MessageDeliveryResult> {
    // 获取对话的网络拓扑
    const networkTopology = await this.networkModule.getNetworkManager()
      .getTopologyByDialogId(dialogId);

    if (!networkTopology) {
      throw new Error(`对话网络拓扑未找到: ${dialogId}`);
    }

    // 通过网络发送消息
    const deliveryResult = await this.networkModule.getNetworkManager()
      .broadcastMessage({
        messageId: message.messageId,
        messageType: 'dialog_message',
        sourceNodeId: message.senderId,
        targetNodes: message.recipients.map(r => r.participantId),
        messageContent: {
          dialogId: dialogId,
          messageContent: message.content,
          messageType: message.messageType,
          timestamp: message.timestamp
        },
        deliveryOptions: {
          deliveryMode: 'reliable',
          acknowledgmentRequired: true,
          timeoutSeconds: 30
        }
      });

    return {
      messageId: message.messageId,
      deliveryStatus: deliveryResult.status,
      deliveredTo: deliveryResult.successfulDeliveries,
      failedDeliveries: deliveryResult.failedDeliveries,
      networkMetrics: deliveryResult.networkMetrics
    };
  }
}
```

---

## 🔗 相关文档

- [Network模块概览](./README.md) - 模块概览和架构
- [API参考](./api-reference.md) - API参考文档
- [配置指南](./configuration-guide.md) - 配置选项详解
- [实施指南](./implementation-guide.md) - 实施指南
- [性能指南](./performance-guide.md) - 性能优化
- [协议规范](./protocol-specification.md) - 协议规范
- [测试指南](./testing-guide.md) - 测试策略

---

**集成版本**: 1.0.0-alpha  
**最后更新**: 2025年9月3日  
**下次审查**: 2025年12月3日  
**状态**: 企业就绪  

**⚠️ Alpha版本说明**: Network模块集成示例在Alpha版本中提供企业就绪的集成模式。额外的高级集成模式和最佳实践将在Beta版本中添加。
