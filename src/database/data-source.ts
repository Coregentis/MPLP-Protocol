/**
 * MPLP数据库数据源配置
 * 
 * @version v1.0.0
 * @created 2025-07-10T00:00:00+08:00
 * @updated 2025-07-17T21:30:00+08:00
 * @compliance .cursor/rules/architecture.mdc - PostgreSQL数据库规范
 */

import { DataSource } from 'typeorm';
import { config } from '@/config';
import { logger } from '@/utils/logger';

// 导入所有实体
import { ContextEntity } from '@/modules/context/entities/context.entity';
import { ContextStateAuditEntity } from '@/modules/context/entities/shared-state.entity';
import { ContextSessionEntity } from '@/modules/context/entities/context-session.entity';

// 导入迁移文件
import { CreateContextTables20250709 } from './migrations/20250709_create_context_tables';
import { CreatePlanTables20250717 } from './migrations/20250717_create_plan_tables';
import { CreateRoleTables20250717 } from './migrations/20250717_create_role_tables';
import { CreateConfirmTables20250717 } from './migrations/20250717_create_confirm_tables';
import { CreateTraceTables20250717 } from './migrations/20250717_create_trace_tables';
import { CreateExtensionTables20250717 } from './migrations/20250717_create_extension_tables';

/**
 * TypeORM数据源配置
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  
  // 连接池配置
  poolSize: 20,
  connectTimeoutMS: 30000,
  extra: {
    connectionLimit: 20,
    acquireTimeout: 30000,
    timeout: 30000
  },
  
  // SSL配置 (从环境变量读取)
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : undefined,
  
  // 实体配置
  entities: [
    // Context模块实体
    ContextEntity,
    ContextStateAuditEntity,
    ContextSessionEntity,
    
    // 后续会添加其他模块的实体
    // PlanEntity,
    // ConfirmEntity,
    // TraceEntity,
    // RoleEntity,
    // ExtensionEntity
  ],
  
  // 迁移配置
  migrations: [
    CreateContextTables20250709,
    CreatePlanTables20250717,
    CreateRoleTables20250717,
    CreateConfirmTables20250717,
    CreateTraceTables20250717,
    CreateExtensionTables20250717
  ],
  
  // 订阅者配置
  subscribers: [
    'src/database/subscribers/*.ts'
  ],
  
  // 开发环境配置
  synchronize: config.app.environment === 'development', // 生产环境应该为false
  logging: config.app.environment === 'development' ? ['query', 'error'] : ['error'],
  logger: 'advanced-console',
  
  // 缓存配置
  cache: config.redis ? {
    type: 'redis' as const,
    options: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: parseInt(process.env.REDIS_DB || '1', 10)
    },
    duration: 30000 // 30秒缓存
  } : false,
  
  // 命名策略
  namingStrategy: undefined,
  
  // 其他配置
  dropSchema: false,
  migrationsRun: config.app.environment === 'production',
  migrationsTableName: 'mplp_migrations',
  metadataTableName: 'mplp_typeorm_metadata'
});

/**
 * 初始化数据库连接
 */
export async function initializeDatabase(): Promise<DataSource> {
  try {
    logger.info('🗄️  正在初始化数据库连接...', {
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      ssl: process.env.DB_SSL === 'true'
    });

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    logger.info('✅ 数据库连接初始化成功', {
      entities: AppDataSource.entityMetadatas.map(meta => meta.name),
      poolSize: AppDataSource.options.poolSize,
      cache: !!AppDataSource.options.cache
    });

    // 运行迁移（生产环境）
    if (config.app.environment === 'production') {
      logger.info('🔄 正在运行数据库迁移...');
      await AppDataSource.runMigrations();
      logger.info('✅ 数据库迁移完成');
    }

    return AppDataSource;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    
    logger.error('❌ 数据库连接初始化失败', {
      error: errorMessage,
      host: config.database.host,
      port: config.database.port,
      database: config.database.database
    });

    throw new Error(`Database initialization failed: ${errorMessage}`);
  }
}

/**
 * 优雅关闭数据库连接
 */
export async function closeDatabase(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('✅ 数据库连接已优雅关闭');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('❌ 数据库连接关闭失败', { error: errorMessage });
    throw error;
  }
}

/**
 * 数据库健康检查
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  status: Record<string, any>;
}> {
  const status: Record<string, any> = {
    connected: false,
    poolActive: 0,
    poolIdle: 0,
    entities: 0,
    migrations: 0
  };

  try {
    if (!AppDataSource.isInitialized) {
      return { healthy: false, status: { ...status, error: 'Database not initialized' } };
    }

    // 检查连接状态
    status.connected = AppDataSource.isInitialized;

    // 检查连接池状态
    try {
      if ((AppDataSource.driver as any).master) {
        const pool = ((AppDataSource.driver as any).master as any).pool;
        status.poolActive = pool?.activeConnections || 0;
        status.poolIdle = pool?.idleConnections || 0;
      }
    } catch (poolError) {
      // 连接池信息获取失败，不影响整体健康检查
      status.poolInfo = 'unavailable';
    }

    // 检查实体数量
    status.entities = AppDataSource.entityMetadatas.length;

    // 检查迁移状态
    try {
      const migrations = await AppDataSource.showMigrations();
      status.migrations = Array.isArray(migrations) ? migrations.length : 0;
    } catch (migrationError) {
      status.migrations = 0;
    }

    // 执行简单查询测试连接
    await AppDataSource.query('SELECT 1');

    return { healthy: true, status };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    status.error = errorMessage;
    
    logger.warn('数据库健康检查失败', { error: errorMessage });
    
    return { healthy: false, status };
  }
} 