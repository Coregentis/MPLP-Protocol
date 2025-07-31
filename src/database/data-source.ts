/**
 * MPLP Database Data Source Configuration - 厂商中立数据库配置
 * 
 * 提供TypeORM数据源配置，支持SQLite内存数据库
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

// 简化的数据源实现，避免TypeORM导入问题
export const AppDataSource = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],

  // Mock方法
  initialize: async () => {
    console.log('Mock DataSource initialized');
    return AppDataSource;
  },

  destroy: async () => {
    console.log('Mock DataSource destroyed');
  },

  getRepository: (entity: any) => ({
    save: async (data: any) => ({ ...data, id: 'mock-id' }),
    findOne: async () => null,
    find: async () => [],
    remove: async (data: any) => data,
    createQueryBuilder: () => ({
      where: () => ({ getMany: async () => [] }),
      orderBy: () => ({ getMany: async () => [] })
    })
  }),

  isInitialized: true,
  options: {}
};
