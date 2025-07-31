/**
 * 测试模拟工厂
 * 
 * 提供类型安全的模拟对象创建函数，支持TypeORM实体和查询构建器
 * 
 * @version v1.0.1
 * @created 2025-08-21T10:00:00+08:00
 * @updated 2025-08-24T15:30:00+08:00
 */

import { Repository, SelectQueryBuilder } from 'typeorm';

// 声明EntityManager类型，避免导入问题
type EntityManager = {
  transaction: (...args: any[]) => Promise<any>;
  query: (...args: any[]) => Promise<any>;
  save: (...args: any[]) => Promise<any>;
  update: (...args: any[]) => Promise<any>;
  delete: (...args: any[]) => Promise<any>;
  find: (...args: any[]) => Promise<any>;
  findOne: (...args: any[]) => Promise<any>;
  count: (...args: any[]) => Promise<any>;
  createQueryBuilder: (...args: any[]) => any;
  getRepository: (...args: any[]) => Repository<any>;
};

/**
 * 创建类型安全的模拟对象
 */
export function createTypedMock<T extends Record<string, any>>(implementation?: Partial<T>): jest.Mocked<T> {
  return { ...implementation } as unknown as jest.Mocked<T>;
}

/**
 * 创建模拟的TypeORM Repository
 */
export function createMockRepository<T extends Record<string, any>>(): jest.Mocked<Repository<T>> {
  // 创建模拟的查询构建器
  const mockQueryBuilder = createMockQueryBuilder<T>();
  
  // 创建模拟的Repository
  const mock = {
    findOne: jest.fn(),
    find: jest.fn(),
    findBy: jest.fn(),
    findOneBy: jest.fn(),
    findAndCount: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    softDelete: jest.fn(),
    recover: jest.fn(),
    count: jest.fn(),
    countBy: jest.fn(),
    exist: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    manager: {
      connection: {
        getMetadata: jest.fn().mockReturnValue({
          name: 'TestEntity',
          tableName: 'test_entity',
          columns: []
        })
      }
    },
    metadata: {
      name: 'TestEntity',
      tableName: 'test_entity',
      columns: []
    },
    getById: jest.fn(),
    query: jest.fn()
  };
  
  return mock as unknown as jest.Mocked<Repository<T>>;
}

/**
 * 创建模拟的TypeORM QueryBuilder
 */
export function createMockQueryBuilder<T extends Record<string, any>>(): jest.Mocked<SelectQueryBuilder<T>> {
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    execute: jest.fn()
  };

  return mockQueryBuilder as unknown as jest.Mocked<SelectQueryBuilder<T>>;
}

/**
 * 创建模拟的TypeORM EntityManager
 */
export function createMockEntityManager(): jest.Mocked<EntityManager> {
  const mockQueryBuilder = createMockQueryBuilder();
  
  const defaultMethods = {
    transaction: jest.fn(),
    query: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    getRepository: jest.fn().mockImplementation((entity) => createMockRepository())
  };

  return defaultMethods as unknown as jest.Mocked<EntityManager>;
}

/**
 * 创建模拟的确认适配器
 */
export function createMockConfirmAdapter() {
  return {
    getAdapterInfo: jest.fn().mockReturnValue({
      type: 'test',
      version: '1.0.0',
      capabilities: ['sync', 'query', 'metrics']
    }),
    syncConfirmation: jest.fn(),
    getConfirmation: jest.fn(),
    findConfirmations: jest.fn(),
    submitDecision: jest.fn(),
    getApprovalWorkflowStatus: jest.fn(),
    escalateConfirmation: jest.fn(),
    cancelConfirmation: jest.fn(),
    addComment: jest.fn(),
    getConfirmationHistory: jest.fn(),
    getConfirmMetrics: jest.fn(),
    checkHealth: jest.fn(),
    validateConfirmation: jest.fn()
  };
}

/**
 * 创建模拟的Logger
 */
export function createMockLogger() {
  return {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  };
} 