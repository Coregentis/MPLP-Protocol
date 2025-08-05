/**
 * MPLP Network Service Tests
 * 
 * @version v1.0.0
 * @created 2025-08-02T02:15:00+08:00
 * @description Network服务的单元测试，基于实际实现编写
 */

import { NetworkService } from '../../../src/modules/network/application/services/network.service';
import { Network } from '../../../src/modules/network/domain/entities/network.entity';
import { NetworkRepository, NodeDiscoveryRepository, RoutingRepository } from '../../../src/modules/network/domain/repositories/network.repository';
import { IEventBus } from '../../../src/core/event-bus';
import { 
  CreateNetworkRequest, 
  UpdateNetworkRequest, 
  NetworkQueryParams,
  NodeDiscoveryRequest,
  NodeRegistrationRequest,
  RoutingRequest,
  AddNodeRequest,
  RemoveNodeRequest,
  UpdateNodeRequest,
  NetworkNode,
  NetworkTopology,
  DiscoveryMechanism,
  RoutingStrategy,
  NodeType,
  NodeStatus,
  NodeCapability,
  NodeAddress,
  RoutingResult
} from '../../../src/modules/network/types';

// Mock dependencies
const mockNetworkRepository: jest.Mocked<NetworkRepository> = {
  save: jest.fn(),
  findById: jest.fn(),
  findByContextId: jest.fn(),
  findByCreatedBy: jest.fn(),
  findByQuery: jest.fn(),
  exists: jest.fn(),
  delete: jest.fn(),
  deleteBatch: jest.fn(),
  updateStatus: jest.fn(),
  getStatistics: jest.fn()
};

const mockNodeDiscoveryRepository: jest.Mocked<NodeDiscoveryRepository> = {
  discoverNodes: jest.fn(),
  registerNode: jest.fn(),
  unregisterNode: jest.fn(),
  updateNodeStatus: jest.fn(),
  getNetworkNodes: jest.fn(),
  findNodesByType: jest.fn(),
  findNodesByCapability: jest.fn(),
  checkNodeHealth: jest.fn()
};

const mockRoutingRepository: jest.Mocked<RoutingRepository> = {
  calculateRoute: jest.fn(),
  getCachedRoute: jest.fn(),
  cacheRoute: jest.fn(),
  clearRouteCache: jest.fn(),
  updateTopology: jest.fn(),
  getTopology: jest.fn(),
  validateRoute: jest.fn()
};

const mockEventBus: jest.Mocked<IEventBus> = {
  publish: jest.fn<number, [string, any]>(),
  subscribe: jest.fn<string, [string, (data: any) => void | Promise<void>, any?]>(),
  unsubscribe: jest.fn<boolean, [string]>(),
  publishAsync: jest.fn<Promise<number>, [string, any]>(),
  clear: jest.fn<void, []>()
};

describe('NetworkService', () => {
  let networkService: NetworkService;
  let validCreateRequest: CreateNetworkRequest;
  let mockNetwork: Network;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    networkService = new NetworkService(
      mockNetworkRepository,
      mockNodeDiscoveryRepository,
      mockRoutingRepository,
      mockEventBus
    );

    validCreateRequest = {
      context_id: 'test-context-001',
      name: 'Test Network',
      description: 'A test network for unit testing',
      topology: 'mesh' as NetworkTopology,
      nodes: [
        {
          agent_id: 'agent-001',
          node_type: 'coordinator' as NodeType,
          status: 'active' as NodeStatus,
          capabilities: ['network', 'coordination'] as NodeCapability[],
          address: {
            host: '192.168.1.100',
            port: 8080,
            protocol: 'http'
          } as NodeAddress
        },
        {
          agent_id: 'agent-002',
          node_type: 'worker' as NodeType,
          status: 'active' as NodeStatus,
          capabilities: ['compute'] as NodeCapability[],
          address: {
            host: '192.168.1.101',
            port: 8080,
            protocol: 'http'
          } as NodeAddress
        }
      ],
      discovery_mechanism: {
        type: 'broadcast',
        interval: 30000,
        timeout: 5000,
        retry_count: 3,
        discovery_ports: [8080],
        multicast_address: '224.0.0.1'
      } as DiscoveryMechanism,
      routing_strategy: {
        algorithm: 'shortest_path',
        load_balancing: {
          method: 'round_robin'
        }
      } as RoutingStrategy,
      metadata: {
        test: true,
        environment: 'unit-test'
      }
    };

    mockNetwork = new Network({
      network_id: 'test-network-001',
      context_id: validCreateRequest.context_id,
      name: validCreateRequest.name,
      description: validCreateRequest.description,
      topology: validCreateRequest.topology,
      nodes: validCreateRequest.nodes.map(n => ({
        ...n,
        node_id: `node-${n.agent_id}`
      })),
      discovery_mechanism: validCreateRequest.discovery_mechanism,
      routing_strategy: validCreateRequest.routing_strategy,
      created_by: validCreateRequest.context_id,
      metadata: validCreateRequest.metadata
    });
  });

  describe('createNetwork', () => {
    it('should create network successfully', async () => {
      mockNetworkRepository.save.mockResolvedValue();
      mockNodeDiscoveryRepository.registerNode.mockResolvedValue();

      const result = await networkService.createNetwork(validCreateRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.network_id).toBeDefined();
      expect(result.data?.name).toBe(validCreateRequest.name);
      expect(result.data?.nodes).toHaveLength(2);
      expect(mockNetworkRepository.save).toHaveBeenCalledTimes(1);
      expect(mockNodeDiscoveryRepository.registerNode).toHaveBeenCalledTimes(2);
      expect(mockEventBus.publish).toHaveBeenCalledWith('network_created', expect.any(Object));
    });

    it('should return error for invalid request', async () => {
      const invalidRequest = {
        ...validCreateRequest,
        name: '' // 空名称
      };

      const result = await networkService.createNetwork(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('name是必需的');
      expect(mockNetworkRepository.save).not.toHaveBeenCalled();
    });

    it('should return error when nodes less than 1', async () => {
      const invalidRequest = {
        ...validCreateRequest,
        nodes: [] // 没有节点
      };

      const result = await networkService.createNetwork(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('网络至少需要1个节点才能启动');
      expect(mockNetworkRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository save error', async () => {
      mockNetworkRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await networkService.createNetwork(validCreateRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
  });

  describe('getNetwork', () => {
    it('should get network successfully', async () => {
      mockNetworkRepository.findById.mockResolvedValue(mockNetwork);

      const result = await networkService.getNetwork('test-network-001');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.network_id).toBe('test-network-001');
      expect(mockNetworkRepository.findById).toHaveBeenCalledWith('test-network-001');
    });

    it('should return error when network not found', async () => {
      mockNetworkRepository.findById.mockResolvedValue(null);

      const result = await networkService.getNetwork('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('网络不存在');
    });

    it('should handle repository error', async () => {
      mockNetworkRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await networkService.getNetwork('test-network-001');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });

  describe('updateNetwork', () => {
    const updateRequest: UpdateNetworkRequest = {
      network_id: 'test-network-001',
      name: 'Updated Network Name',
      description: 'Updated description'
    };

    it('should update network successfully', async () => {
      mockNetworkRepository.findById.mockResolvedValue(mockNetwork);
      mockNetworkRepository.save.mockResolvedValue();

      const result = await networkService.updateNetwork(updateRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockNetworkRepository.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith('network_updated', expect.any(Object));
    });

    it('should return error when network not found', async () => {
      mockNetworkRepository.findById.mockResolvedValue(null);

      const result = await networkService.updateNetwork(updateRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('网络不存在');
      expect(mockNetworkRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteNetwork', () => {
    it('should delete network successfully', async () => {
      mockNetworkRepository.findById.mockResolvedValue(mockNetwork);
      mockNetworkRepository.delete.mockResolvedValue();

      const result = await networkService.deleteNetwork('test-network-001');

      expect(result.success).toBe(true);
      expect(mockNetworkRepository.delete).toHaveBeenCalledWith('test-network-001');
    });

    it('should return error when network not found', async () => {
      mockNetworkRepository.findById.mockResolvedValue(null);

      const result = await networkService.deleteNetwork('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('网络不存在');
      expect(mockNetworkRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('discoverNodes', () => {
    const discoveryRequest: NodeDiscoveryRequest = {
      network_id: 'test-network-001',
      node_type: 'worker',
      capabilities: ['compute'],
      timeout: 5000
    };

    it('should discover nodes successfully', async () => {
      const discoveredNodes: NetworkNode[] = [
        {
          node_id: 'discovered-node-001',
          agent_id: 'discovered-agent-001',
          node_type: 'worker' as NodeType,
          status: 'active' as NodeStatus,
          capabilities: ['compute'] as NodeCapability[],
          address: {
            host: '192.168.1.102',
            port: 8080,
            protocol: 'http'
          } as NodeAddress
        }
      ];

      mockNodeDiscoveryRepository.discoverNodes.mockResolvedValue(discoveredNodes);

      const result = await networkService.discoverNodes(discoveryRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(mockNodeDiscoveryRepository.discoverNodes).toHaveBeenCalledWith(discoveryRequest);
    });

    it('should handle discovery error', async () => {
      mockNodeDiscoveryRepository.discoverNodes.mockRejectedValue(new Error('Discovery failed'));

      const result = await networkService.discoverNodes(discoveryRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Discovery failed');
    });
  });

  describe('registerNode', () => {
    const registrationRequest: NodeRegistrationRequest = {
      network_id: 'test-network-001',
      agent_id: 'agent-003',
      node_type: 'worker' as NodeType,
      capabilities: ['compute'] as NodeCapability[],
      address: {
        host: '192.168.1.103',
        port: 8080,
        protocol: 'http'
      } as NodeAddress
    };

    it('should register node successfully', async () => {
      mockNetworkRepository.findById.mockResolvedValue(mockNetwork);
      mockNetworkRepository.save.mockResolvedValue();
      mockNodeDiscoveryRepository.registerNode.mockResolvedValue();

      const result = await networkService.registerNode(registrationRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockNetworkRepository.save).toHaveBeenCalledTimes(1);
      expect(mockNodeDiscoveryRepository.registerNode).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publish).toHaveBeenCalledWith('node_registered', expect.any(Object));
    });

    it('should return error when network not found', async () => {
      mockNetworkRepository.findById.mockResolvedValue(null);

      const result = await networkService.registerNode(registrationRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('网络不存在');
      expect(mockNetworkRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('calculateRoute', () => {
    const routingRequest: RoutingRequest = {
      network_id: 'test-network-001',
      source_node_id: 'node-001',
      target_node_id: 'node-002',
      requirements: {
        max_latency: 100,
        min_bandwidth: 1000,
        reliability: 0.99,
        security: true
      }
    };

    const mockRoutingResult: RoutingResult = {
      path: ['node-001', 'node-002'],
      estimated_latency: 10,
      estimated_cost: 1.0,
      reliability: 0.95,
      alternative_paths: []
    };

    it('should calculate route successfully', async () => {
      mockRoutingRepository.getCachedRoute.mockResolvedValue(null);
      mockRoutingRepository.calculateRoute.mockResolvedValue(mockRoutingResult);
      mockRoutingRepository.cacheRoute.mockResolvedValue();

      const result = await networkService.calculateRoute(routingRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoutingResult);
      expect(mockRoutingRepository.calculateRoute).toHaveBeenCalledWith(routingRequest);
      expect(mockRoutingRepository.cacheRoute).toHaveBeenCalledWith(routingRequest, mockRoutingResult);
      expect(mockEventBus.publish).toHaveBeenCalledWith('route_calculated', expect.any(Object));
    });

    it('should use cached route when available', async () => {
      mockRoutingRepository.getCachedRoute.mockResolvedValue(mockRoutingResult);

      const result = await networkService.calculateRoute(routingRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockRoutingResult);
      expect(mockRoutingRepository.calculateRoute).not.toHaveBeenCalled();
      expect(mockRoutingRepository.cacheRoute).not.toHaveBeenCalled();
    });

    it('should handle routing calculation error', async () => {
      mockRoutingRepository.getCachedRoute.mockResolvedValue(null);
      mockRoutingRepository.calculateRoute.mockRejectedValue(new Error('Routing failed'));

      const result = await networkService.calculateRoute(routingRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Routing failed');
    });
  });

  describe('listNetworks', () => {
    const queryParams: NetworkQueryParams = {
      context_id: 'test-context-001',
      limit: 10,
      offset: 0
    };

    it('should list networks successfully', async () => {
      const mockNetworks = [mockNetwork];
      mockNetworkRepository.findByQuery.mockResolvedValue({
        networks: mockNetworks,
        total: 1
      });

      const result = await networkService.listNetworks(queryParams);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.networks).toHaveLength(1);
      expect(result.data?.total).toBe(1);
      expect(mockNetworkRepository.findByQuery).toHaveBeenCalledWith(queryParams);
    });

    it('should handle repository error', async () => {
      mockNetworkRepository.findByQuery.mockRejectedValue(new Error('Database error'));

      const result = await networkService.listNetworks(queryParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
});
