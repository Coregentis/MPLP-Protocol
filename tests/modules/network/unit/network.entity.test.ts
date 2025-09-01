/**
 * Network实体单元测试
 * 
 * @description 基于实际接口的NetworkEntity测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { NetworkEntity, NetworkNode, NetworkEdge } from '../../../../src/modules/network/domain/entities/network.entity';
import { NetworkTestFactory } from '../factories/network-test.factory';

describe('NetworkEntity测试', () => {
  describe('网络实体创建', () => {
    it('应该成功创建网络实体', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();

      // 🎬 Act
      const entity = NetworkTestFactory.createNetworkEntity(entityData);

      // ✅ Assert
      expect(entity).toBeDefined();
      expect(entity.networkId).toBe(entityData.networkId);
      expect(entity.name).toBe(entityData.name);
      expect(entity.topology).toBe(entityData.topology);
      expect(entity.contextId).toBe(entityData.contextId);
    });

    it('应该正确设置网络节点', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData({
        nodes: [
          NetworkTestFactory.createNetworkNodeEntityData({ nodeType: 'coordinator' }),
          NetworkTestFactory.createNetworkNodeEntityData({ nodeType: 'worker' })
        ]
      });

      // 🎬 Act
      const entity = NetworkTestFactory.createNetworkEntity(entityData);

      // ✅ Assert
      expect(entity.nodes).toHaveLength(2);
      expect(entity.nodes[0].nodeType).toBe('coordinator');
      expect(entity.nodes[1].nodeType).toBe('worker');
    });

    it('应该正确设置网络边缘连接', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();

      // 🎬 Act
      const entity = NetworkTestFactory.createNetworkEntity(entityData);

      // ✅ Assert
      expect(entity.edges).toBeDefined();
      expect(Array.isArray(entity.edges)).toBe(true);
    });
  });

  describe('节点管理功能', () => {
    let entity: NetworkEntity;

    beforeEach(() => {
      const entityData = NetworkTestFactory.createNetworkEntityData();
      entity = NetworkTestFactory.createNetworkEntity(entityData);
    });

    it('应该成功添加节点', () => {
      // 📋 Arrange
      const initialNodeCount = entity.nodes.length;
      const newNodeData = NetworkTestFactory.createNetworkNodeEntityData({
        nodeType: 'gateway',
        agentId: 'new-agent-001'
      });
      const newNode = new NetworkNode(
        newNodeData.nodeId,
        newNodeData.agentId,
        newNodeData.nodeType as any,
        newNodeData.status as any,
        newNodeData.capabilities as any[],
        newNodeData.address as any,
        newNodeData.metadata
      );

      // 🎬 Act
      entity.addNode(newNode);

      // ✅ Assert
      expect(entity.nodes).toHaveLength(initialNodeCount + 1);
      const addedNode = entity.getNode(newNode.nodeId);
      expect(addedNode).toBeDefined();
      expect(addedNode!.agentId).toBe('new-agent-001');
      expect(addedNode!.nodeType).toBe('gateway');
    });

    it('应该防止添加重复节点', () => {
      // 📋 Arrange
      const existingNode = entity.nodes[0];
      const initialNodeCount = entity.nodes.length;

      // 🎬 Act
      entity.addNode(existingNode);

      // ✅ Assert
      expect(entity.nodes).toHaveLength(initialNodeCount);
    });

    it('应该成功移除节点', () => {
      // 📋 Arrange
      const nodeToRemove = entity.nodes[0];
      const initialNodeCount = entity.nodes.length;

      // 🎬 Act
      const removed = entity.removeNode(nodeToRemove.nodeId);

      // ✅ Assert
      expect(removed).toBe(true);
      expect(entity.nodes).toHaveLength(initialNodeCount - 1);
      const removedNode = entity.getNode(nodeToRemove.nodeId);
      expect(removedNode).toBeUndefined();
    });

    it('应该在节点不存在时返回false', () => {
      // 🎬 Act
      const removed = entity.removeNode('non-existent-node-id');

      // ✅ Assert
      expect(removed).toBe(false);
    });

    it('应该正确获取在线节点', () => {
      // 📋 Arrange
      // 设置一些节点为在线状态
      entity.nodes[0].updateStatus('online');
      entity.nodes[1].updateStatus('offline');

      // 🎬 Act
      const onlineNodes = entity.getOnlineNodes();

      // ✅ Assert
      expect(onlineNodes).toHaveLength(1);
      expect(onlineNodes[0].status).toBe('online');
    });
  });

  describe('边缘连接管理功能', () => {
    let entity: NetworkEntity;

    beforeEach(() => {
      const entityData = NetworkTestFactory.createNetworkEntityData();
      entity = NetworkTestFactory.createNetworkEntity(entityData);
    });

    it('应该成功添加边缘连接', () => {
      // 📋 Arrange
      const initialEdgeCount = entity.edges.length;
      const edgeData = NetworkTestFactory.createNetworkEdgeEntityData({
        sourceNodeId: entity.nodes[0].nodeId,
        targetNodeId: entity.nodes[1].nodeId
      });
      const newEdge = new NetworkEdge(
        edgeData.edgeId,
        edgeData.sourceNodeId,
        edgeData.targetNodeId,
        edgeData.edgeType,
        edgeData.direction as any,
        edgeData.status,
        edgeData.weight,
        edgeData.metadata
      );

      // 🎬 Act
      entity.addEdge(newEdge);

      // ✅ Assert
      expect(entity.edges).toHaveLength(initialEdgeCount + 1);
      const addedEdge = entity.edges.find(e => e.edgeId === newEdge.edgeId);
      expect(addedEdge).toBeDefined();
    });

    it('应该防止添加重复边缘连接', () => {
      // 📋 Arrange
      const existingEdge = entity.edges[0];
      const initialEdgeCount = entity.edges.length;

      // 🎬 Act
      entity.addEdge(existingEdge);

      // ✅ Assert
      expect(entity.edges).toHaveLength(initialEdgeCount);
    });

    it('应该成功移除边缘连接', () => {
      // 📋 Arrange
      const edgeToRemove = entity.edges[0];
      const initialEdgeCount = entity.edges.length;

      // 🎬 Act
      const removed = entity.removeEdge(edgeToRemove.edgeId);

      // ✅ Assert
      expect(removed).toBe(true);
      expect(entity.edges).toHaveLength(initialEdgeCount - 1);
      const removedEdge = entity.edges.find(e => e.edgeId === edgeToRemove.edgeId);
      expect(removedEdge).toBeUndefined();
    });
  });

  describe('网络状态管理', () => {
    let entity: NetworkEntity;

    beforeEach(() => {
      const entityData = NetworkTestFactory.createNetworkEntityData();
      entity = NetworkTestFactory.createNetworkEntity(entityData);
    });

    it('应该成功更新网络状态', () => {
      // 📋 Arrange
      const initialAuditCount = entity.auditTrail.length;

      // 🎬 Act
      entity.updateStatus('active');

      // ✅ Assert
      expect(entity.status).toBe('active');
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.auditTrail.length).toBe(initialAuditCount + 1);
      
      const lastAuditEntry = entity.auditTrail[entity.auditTrail.length - 1];
      expect(lastAuditEntry.action).toBe('status_changed');
    });
  });

  describe('网络统计功能', () => {
    let entity: NetworkEntity;

    beforeEach(() => {
      const entityData = NetworkTestFactory.createNetworkEntityData();
      entity = NetworkTestFactory.createNetworkEntity(entityData);
      
      // 设置一些节点为在线状态
      entity.nodes[0].updateStatus('online');
      entity.nodes[1].updateStatus('offline');
      
      // 设置一些边缘为活跃状态
      if (entity.edges.length > 0) {
        entity.edges[0].updateStatus('active');
      }
    });

    it('应该返回正确的网络统计信息', () => {
      // 🎬 Act
      const stats = entity.getNetworkStats();

      // ✅ Assert
      expect(stats).toBeDefined();
      expect(stats.totalNodes).toBe(entity.nodes.length);
      expect(stats.onlineNodes).toBe(1); // 只有一个节点在线
      expect(stats.totalEdges).toBe(entity.edges.length);
      expect(typeof stats.topologyEfficiency).toBe('number');
      expect(stats.topologyEfficiency).toBeGreaterThanOrEqual(0);
      expect(stats.topologyEfficiency).toBeLessThanOrEqual(1);
    });

    it('应该正确计算拓扑效率', () => {
      // 🎬 Act
      const stats = entity.getNetworkStats();

      // ✅ Assert
      // 拓扑效率应该基于活跃连接数和节点数的比例
      const expectedEfficiency = entity.nodes.length > 0 
        ? Math.min(stats.activeEdges / Math.max(entity.nodes.length - 1, 1), 1.0)
        : 0;
      expect(stats.topologyEfficiency).toBe(expectedEfficiency);
    });
  });

  describe('网络健康检查', () => {
    it('应该在有在线节点和活跃连接时返回健康状态', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();
      const entity = NetworkTestFactory.createNetworkEntity(entityData);
      
      // 设置网络为活跃状态
      entity.updateStatus('active');
      entity.nodes[0].updateStatus('online');
      if (entity.edges.length > 0) {
        entity.edges[0].updateStatus('active');
      }

      // 🎬 Act
      const isHealthy = entity.isHealthy();

      // ✅ Assert
      expect(isHealthy).toBe(true);
    });

    it('应该在没有在线节点时返回不健康状态', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();
      const entity = NetworkTestFactory.createNetworkEntity(entityData);
      
      // 设置所有节点为离线状态
      entity.nodes.forEach(node => node.updateStatus('offline'));

      // 🎬 Act
      const isHealthy = entity.isHealthy();

      // ✅ Assert
      expect(isHealthy).toBe(false);
    });

    it('应该在网络状态不是active时返回不健康状态', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();
      const entity = NetworkTestFactory.createNetworkEntity(entityData);
      
      // 设置网络为非活跃状态
      entity.updateStatus('inactive');
      entity.nodes[0].updateStatus('online');

      // 🎬 Act
      const isHealthy = entity.isHealthy();

      // ✅ Assert
      expect(isHealthy).toBe(false);
    });
  });

  describe('节点邻居查找', () => {
    let entity: NetworkEntity;

    beforeEach(() => {
      const entityData = NetworkTestFactory.createNetworkEntityData();
      entity = NetworkTestFactory.createNetworkEntity(entityData);
    });

    it('应该正确找到节点的邻居', () => {
      // 📋 Arrange
      const sourceNode = entity.nodes[0];
      const targetNode = entity.nodes[1];
      
      // 添加一个双向连接
      const edgeData = NetworkTestFactory.createNetworkEdgeEntityData({
        sourceNodeId: sourceNode.nodeId,
        targetNodeId: targetNode.nodeId,
        direction: 'bidirectional'
      });
      const edge = new NetworkEdge(
        edgeData.edgeId,
        edgeData.sourceNodeId,
        edgeData.targetNodeId,
        edgeData.edgeType,
        'bidirectional',
        'active',
        edgeData.weight,
        edgeData.metadata
      );
      entity.addEdge(edge);

      // 🎬 Act
      const neighbors = entity.getNodeNeighbors(sourceNode.nodeId);

      // ✅ Assert
      expect(neighbors).toHaveLength(1);
      expect(neighbors[0].nodeId).toBe(targetNode.nodeId);
    });

    it('应该只返回活跃连接的邻居', () => {
      // 📋 Arrange
      const sourceNode = entity.nodes[0];
      const targetNode = entity.nodes[1];
      
      // 添加一个非活跃连接
      const edgeData = NetworkTestFactory.createNetworkEdgeEntityData({
        sourceNodeId: sourceNode.nodeId,
        targetNodeId: targetNode.nodeId,
        status: 'inactive'
      });
      const edge = new NetworkEdge(
        edgeData.edgeId,
        edgeData.sourceNodeId,
        edgeData.targetNodeId,
        edgeData.edgeType,
        'bidirectional',
        'inactive',
        edgeData.weight,
        edgeData.metadata
      );
      entity.addEdge(edge);

      // 🎬 Act
      const neighbors = entity.getNodeNeighbors(sourceNode.nodeId);

      // ✅ Assert
      expect(neighbors).toHaveLength(0);
    });
  });
});
