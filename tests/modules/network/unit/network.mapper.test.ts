/**
 * Network映射器单元测试
 * 
 * @description 基于双重命名约定的NetworkMapper测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { NetworkMapper, NetworkSchema } from '../../../../src/modules/network/api/mappers/network.mapper';
import { NetworkEntity } from '../../../../src/modules/network/domain/entities/network.entity';
import { NetworkTestFactory } from '../factories/network-test.factory';

describe('NetworkMapper测试', () => {
  describe('Schema验证功能', () => {
    it('应该验证有效的Schema数据', () => {
      // 📋 Arrange
      const validSchema = NetworkTestFactory.createNetworkSchemaData();

      // 🎬 Act
      const isValid = NetworkMapper.validateSchema(validSchema);

      // ✅ Assert
      expect(isValid).toBe(true);
    });

    it('应该拒绝无效的Schema数据', () => {
      // 📋 Arrange
      const invalidSchema = {
        // 缺少必需字段
        name: 'Test Network'
      };

      // 🎬 Act
      const isValid = NetworkMapper.validateSchema(invalidSchema);

      // ✅ Assert
      expect(isValid).toBe(false);
    });

    it('应该拒绝null或undefined数据', () => {
      // 🎬 Act & Assert
      expect(NetworkMapper.validateSchema(null)).toBe(false);
      expect(NetworkMapper.validateSchema(undefined)).toBe(false);
      expect(NetworkMapper.validateSchema('string')).toBe(false);
      expect(NetworkMapper.validateSchema(123)).toBe(false);
    });

    it('应该验证Schema必需字段', () => {
      // 📋 Arrange
      const schemaWithMissingFields = {
        network_id: 'test-id',
        // 缺少其他必需字段
      };

      // 🎬 Act
      const isValid = NetworkMapper.validateSchema(schemaWithMissingFields);

      // ✅ Assert
      expect(isValid).toBe(false);
    });
  });

  describe('Entity到Schema转换', () => {
    it('应该正确转换Entity到Schema格式', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();
      const entity = NetworkTestFactory.createNetworkEntity(entityData);

      // 🎬 Act
      const schema = NetworkMapper.toSchema(entity);

      // ✅ Assert
      expect(schema).toBeDefined();
      
      // 验证基本字段映射 (camelCase -> snake_case)
      expect(schema.network_id).toBe(entity.networkId);
      expect(schema.protocol_version).toBe(entity.protocolVersion);
      expect(schema.context_id).toBe(entity.contextId);
      expect(schema.created_at).toBe(entity.createdAt.toISOString());
      expect(schema.created_by).toBe(entity.createdBy);
      
      // 验证复杂字段映射
      expect(schema.nodes).toBeDefined();
      expect(Array.isArray(schema.nodes)).toBe(true);
      expect(schema.nodes.length).toBe(entity.nodes.length);
      
      // 验证节点字段映射
      if (schema.nodes.length > 0) {
        const schemaNode = schema.nodes[0];
        const entityNode = entity.nodes[0];
        expect(schemaNode.node_id).toBe(entityNode.nodeId);
        expect(schemaNode.agent_id).toBe(entityNode.agentId);
        expect(schemaNode.node_type).toBe(entityNode.nodeType);
      }
    });

    it('应该正确处理可选字段', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData({
        description: 'Test description',
        updatedAt: new Date()
      });
      const entity = NetworkTestFactory.createNetworkEntity(entityData);

      // 🎬 Act
      const schema = NetworkMapper.toSchema(entity);

      // ✅ Assert
      expect(schema.description).toBe(entity.description);
      expect(schema.updated_at).toBe(entity.updatedAt?.toISOString());
    });

    it('应该正确转换嵌套对象', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();
      const entity = NetworkTestFactory.createNetworkEntity(entityData);

      // 🎬 Act
      const schema = NetworkMapper.toSchema(entity);

      // ✅ Assert
      expect(schema.discovery_mechanism).toBeDefined();
      expect(schema.discovery_mechanism.type).toBe(entity.discoveryMechanism.type);
      expect(schema.discovery_mechanism.enabled).toBe(entity.discoveryMechanism.enabled);
      
      expect(schema.routing_strategy).toBeDefined();
      expect(schema.routing_strategy.algorithm).toBe(entity.routingStrategy.algorithm);
      expect(schema.routing_strategy.load_balancing).toBe(entity.routingStrategy.loadBalancing);
    });

    it('应该正确转换数组字段', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();
      const entity = NetworkTestFactory.createNetworkEntity(entityData);

      // 🎬 Act
      const schema = NetworkMapper.toSchema(entity);

      // ✅ Assert
      expect(schema.audit_trail).toBeDefined();
      expect(Array.isArray(schema.audit_trail)).toBe(true);
      expect(schema.audit_trail.length).toBe(entity.auditTrail.length);
      
      expect(schema.version_history).toBeDefined();
      expect(Array.isArray(schema.version_history)).toBe(true);
      expect(schema.version_history.length).toBe(entity.versionHistory.length);
    });
  });

  describe('Schema到Entity转换', () => {
    it('应该正确转换Schema到Entity格式', () => {
      // 📋 Arrange
      const schema = NetworkTestFactory.createNetworkSchemaData();

      // 🎬 Act
      const entity = NetworkMapper.fromSchema(schema);

      // ✅ Assert
      expect(entity).toBeDefined();
      expect(entity).toBeInstanceOf(NetworkEntity);

      // 验证基本字段映射 (snake_case -> camelCase)
      expect(entity.networkId).toBe(schema.network_id);
      expect(entity.protocolVersion).toBe(schema.protocol_version);
      expect(entity.contextId).toBe(schema.context_id);
      expect(entity.createdBy).toBe(schema.created_by);

      // 验证日期转换
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.createdAt.toISOString()).toBe(schema.created_at);
      expect(entity.timestamp).toBeInstanceOf(Date);
      expect(entity.timestamp.toISOString()).toBe(schema.timestamp);
    });

    it('应该正确转换节点数组', () => {
      // 📋 Arrange
      const schema = NetworkTestFactory.createNetworkSchema();

      // 🎬 Act
      const entity = NetworkMapper.fromSchema(schema);

      // ✅ Assert
      expect(entity.nodes).toBeDefined();
      expect(Array.isArray(entity.nodes)).toBe(true);
      expect(entity.nodes.length).toBe(schema.nodes.length);
      
      if (entity.nodes.length > 0 && schema.nodes.length > 0) {
        const entityNode = entity.nodes[0];
        const schemaNode = schema.nodes[0];
        
        expect(entityNode.nodeId).toBe(schemaNode.node_id);
        expect(entityNode.agentId).toBe(schemaNode.agent_id);
        expect(entityNode.nodeType).toBe(schemaNode.node_type);
        expect(entityNode.status).toBe(schemaNode.status);
      }
    });

    it('应该正确转换边缘连接数组', () => {
      // 📋 Arrange
      const schema = NetworkTestFactory.createNetworkSchema();

      // 🎬 Act
      const entity = NetworkMapper.fromSchema(schema);

      // ✅ Assert
      expect(entity.edges).toBeDefined();
      expect(Array.isArray(entity.edges)).toBe(true);
      
      if (schema.edges && schema.edges.length > 0) {
        expect(entity.edges.length).toBe(schema.edges.length);
        
        const entityEdge = entity.edges[0];
        const schemaEdge = schema.edges[0];
        
        expect(entityEdge.edgeId).toBe(schemaEdge.edge_id);
        expect(entityEdge.sourceNodeId).toBe(schemaEdge.source_node_id);
        expect(entityEdge.targetNodeId).toBe(schemaEdge.target_node_id);
        expect(entityEdge.edgeType).toBe(schemaEdge.edge_type);
        expect(entityEdge.direction).toBe(schemaEdge.direction);
      }
    });

    it('应该正确处理可选字段', () => {
      // 📋 Arrange
      const schema = NetworkTestFactory.createNetworkSchema({
        description: 'Test description',
        updated_at: new Date().toISOString()
      });

      // 🎬 Act
      const entity = NetworkMapper.fromSchema(schema);

      // ✅ Assert
      expect(entity.description).toBe(schema.description);
      if (schema.updated_at) {
        expect(entity.updatedAt).toBeInstanceOf(Date);
        expect(entity.updatedAt!.toISOString()).toBe(schema.updated_at);
      }
    });
  });

  describe('Entity到DTO转换', () => {
    it('应该正确转换Entity到DTO格式', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();
      const entity = NetworkTestFactory.createNetworkEntity(entityData);

      // 🎬 Act
      const dto = NetworkMapper.toDto(entity);

      // ✅ Assert
      expect(dto).toBeDefined();
      
      // 验证基本字段映射 (保持camelCase)
      expect(dto.networkId).toBe(entity.networkId);
      expect(dto.protocolVersion).toBe(entity.protocolVersion);
      expect(dto.contextId).toBe(entity.contextId);
      expect(dto.name).toBe(entity.name);
      expect(dto.topology).toBe(entity.topology);
      expect(dto.status).toBe(entity.status);
      expect(dto.createdBy).toBe(entity.createdBy);
      
      // 验证日期字段转换为ISO字符串
      expect(dto.createdAt).toBe(entity.createdAt.toISOString());
      expect(dto.timestamp).toBe(entity.timestamp.toISOString());
      
      // 验证数组字段
      expect(dto.nodes).toBeDefined();
      expect(Array.isArray(dto.nodes)).toBe(true);
      expect(dto.nodes.length).toBe(entity.nodes.length);
      
      expect(dto.edges).toBeDefined();
      expect(Array.isArray(dto.edges)).toBe(true);
      expect(dto.edges.length).toBe(entity.edges.length);
    });

    it('应该正确转换节点DTO', () => {
      // 📋 Arrange
      const entityData = NetworkTestFactory.createNetworkEntityData();
      const entity = NetworkTestFactory.createNetworkEntity(entityData);

      // 🎬 Act
      const dto = NetworkMapper.toDto(entity);

      // ✅ Assert
      if (dto.nodes.length > 0 && entity.nodes.length > 0) {
        const nodeDto = dto.nodes[0];
        const nodeEntity = entity.nodes[0];
        
        expect(nodeDto.nodeId).toBe(nodeEntity.nodeId);
        expect(nodeDto.agentId).toBe(nodeEntity.agentId);
        expect(nodeDto.nodeType).toBe(nodeEntity.nodeType);
        expect(nodeDto.status).toBe(nodeEntity.status);
        expect(nodeDto.capabilities).toEqual(nodeEntity.capabilities);
        expect(nodeDto.metadata).toEqual(nodeEntity.metadata);
      }
    });
  });

  describe('批量转换功能', () => {
    it('应该正确批量转换Entity到Schema', () => {
      // 📋 Arrange
      const entities = [
        NetworkTestFactory.createNetworkEntity(),
        NetworkTestFactory.createNetworkEntity(),
        NetworkTestFactory.createNetworkEntity()
      ];

      // 🎬 Act
      const schemas = NetworkMapper.toSchemaArray(entities);

      // ✅ Assert
      expect(schemas).toBeDefined();
      expect(Array.isArray(schemas)).toBe(true);
      expect(schemas.length).toBe(entities.length);
      
      schemas.forEach((schema, index) => {
        expect(schema.network_id).toBe(entities[index].networkId);
        expect(schema.name).toBe(entities[index].name);
      });
    });

    it('应该正确批量转换Schema到Entity', () => {
      // 📋 Arrange
      const schemas = [
        NetworkTestFactory.createNetworkSchema(),
        NetworkTestFactory.createNetworkSchema(),
        NetworkTestFactory.createNetworkSchema()
      ];

      // 🎬 Act
      const entities = NetworkMapper.fromSchemaArray(schemas);

      // ✅ Assert
      expect(entities).toBeDefined();
      expect(Array.isArray(entities)).toBe(true);
      expect(entities.length).toBe(schemas.length);
      
      entities.forEach((entity, index) => {
        expect(entity.networkId).toBe(schemas[index].network_id);
        expect(entity.name).toBe(schemas[index].name);
        expect(entity).toBeInstanceOf(NetworkEntity);
      });
    });

    it('应该正确批量转换Entity到DTO', () => {
      // 📋 Arrange
      const entities = [
        NetworkTestFactory.createNetworkEntity(),
        NetworkTestFactory.createNetworkEntity(),
        NetworkTestFactory.createNetworkEntity()
      ];

      // 🎬 Act
      const dtos = NetworkMapper.toDtoArray(entities);

      // ✅ Assert
      expect(dtos).toBeDefined();
      expect(Array.isArray(dtos)).toBe(true);
      expect(dtos.length).toBe(entities.length);
      
      dtos.forEach((dto, index) => {
        expect(dto.networkId).toBe(entities[index].networkId);
        expect(dto.name).toBe(entities[index].name);
      });
    });
  });

  describe('双向转换一致性', () => {
    it('应该保持Entity->Schema->Entity转换的一致性', () => {
      // 📋 Arrange
      const originalEntity = NetworkTestFactory.createNetworkEntity();

      // 🎬 Act
      const schema = NetworkMapper.toSchema(originalEntity);
      const convertedEntity = NetworkMapper.fromSchema(schema);

      // ✅ Assert
      expect(convertedEntity.networkId).toBe(originalEntity.networkId);
      expect(convertedEntity.name).toBe(originalEntity.name);
      expect(convertedEntity.topology).toBe(originalEntity.topology);
      expect(convertedEntity.contextId).toBe(originalEntity.contextId);
      expect(convertedEntity.status).toBe(originalEntity.status);
      expect(convertedEntity.createdBy).toBe(originalEntity.createdBy);
      
      // 验证日期字段
      expect(convertedEntity.createdAt.getTime()).toBe(originalEntity.createdAt.getTime());
      expect(convertedEntity.timestamp.getTime()).toBe(originalEntity.timestamp.getTime());
      
      // 验证节点数量
      expect(convertedEntity.nodes.length).toBe(originalEntity.nodes.length);
      expect(convertedEntity.edges.length).toBe(originalEntity.edges.length);
    });

    it('应该保持Schema->Entity->Schema转换的一致性', () => {
      // 📋 Arrange
      const originalSchema = NetworkTestFactory.createNetworkSchemaData();

      // 🎬 Act
      const entity = NetworkMapper.fromSchema(originalSchema);
      const convertedSchema = NetworkMapper.toSchema(entity);

      // ✅ Assert
      expect(convertedSchema.network_id).toBe(originalSchema.network_id);
      expect(convertedSchema.name).toBe(originalSchema.name);
      expect(convertedSchema.topology).toBe(originalSchema.topology);
      expect(convertedSchema.context_id).toBe(originalSchema.context_id);
      expect(convertedSchema.status).toBe(originalSchema.status);
      expect(convertedSchema.created_by).toBe(originalSchema.created_by);
      expect(convertedSchema.created_at).toBe(originalSchema.created_at);
      expect(convertedSchema.timestamp).toBe(originalSchema.timestamp);
      
      // 验证数组长度
      expect(convertedSchema.nodes.length).toBe(originalSchema.nodes.length);
      if (originalSchema.edges) {
        expect(convertedSchema.edges?.length).toBe(originalSchema.edges.length);
      }
    });
  });
});
