/**
 * Context模块数据库迁移
 * 
 * @version v1.0.0
 * @created 2025-07-09T23:58:00+08:00
 * @compliance .cursor/rules/architecture.mdc - PostgreSQL数据库规范
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateContextTables20250709 implements MigrationInterface {
  name = 'CreateContextTables20250709';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建上下文主表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_contexts',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'context_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'agent_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            default: "''",
            isNullable: false
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'suspended', 'completed', 'terminated'],
            default: "'active'",
            isNullable: false
          },
          {
            name: 'lifecycle_stage',
            type: 'enum',
            enum: ['initializing', 'active', 'suspended', 'degraded', 'terminating', 'terminated'],
            default: "'initializing'",
            isNullable: false
          },
          {
            name: 'parent_context_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'session_data',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'tracepilot_context_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'total_operations',
            type: 'int',
            default: 0,
            isNullable: false
          },
          {
            name: 'total_state_changes',
            type: 'int',
            default: 0,
            isNullable: false
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false
          }
        ]
      }),
      true
    );

    // 创建共享状态表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_shared_states',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'context_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'state_key',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'state_value',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'data_type',
            type: 'enum',
            enum: ['string', 'number', 'boolean', 'object', 'array', 'binary', 'encrypted'],
            default: "'string'",
            isNullable: false
          },
          {
            name: 'access_level',
            type: 'enum',
            enum: ['public', 'private', 'protected'],
            default: "'public'",
            isNullable: false
          },
          {
            name: 'encryption_required',
            type: 'boolean',
            default: false,
            isNullable: false
          },
          {
            name: 'sync_priority',
            type: 'enum',
            enum: ['high', 'medium', 'low'],
            default: "'medium'",
            isNullable: false
          },
          {
            name: 'tags',
            type: 'jsonb',
            default: "'[]'",
            isNullable: false
          },
          {
            name: 'source_module',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false
          }
        ]
      }),
      true
    );

    // 创建会话表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_context_sessions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'context_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'agent_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'last_active_at',
            type: 'timestamp',
            isNullable: false
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'session_data',
            type: 'jsonb',
            default: "'{}'",
            isNullable: false
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false
          },
          {
            name: 'client_ip',
            type: 'varchar',
            length: '45',
            isNullable: true
          },
          {
            name: 'user_agent',
            type: 'varchar',
            length: '500',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false
          }
        ]
      }),
      true
    );

    // 创建索引
    await this.createIndexes(queryRunner);

    // 创建外键约束
    await this.createForeignKeys(queryRunner);

    // 创建触发器
    await this.createTriggers(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除触发器
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_context_updated_at ON mplp_contexts`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_shared_state_updated_at ON mplp_shared_states`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS update_session_updated_at ON mplp_context_sessions`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // 删除外键约束
    await queryRunner.dropForeignKey('mplp_shared_states', 'FK_shared_states_context');
    await queryRunner.dropForeignKey('mplp_context_sessions', 'FK_sessions_context');
    await queryRunner.dropForeignKey('mplp_contexts', 'FK_contexts_parent');

    // 删除表
    await queryRunner.dropTable('mplp_context_sessions');
    await queryRunner.dropTable('mplp_shared_states');
    await queryRunner.dropTable('mplp_contexts');
  }

  private async createIndexes(queryRunner: QueryRunner): Promise<void> {
    // Context表索引
    await queryRunner.createIndex('mplp_contexts', new TableIndex({
      name: 'IDX_contexts_context_id',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_contexts', new TableIndex({
      name: 'IDX_contexts_user_status',
      columnNames: ['user_id', 'status']
    }));
    await queryRunner.createIndex('mplp_contexts', new TableIndex({
      name: 'IDX_contexts_lifecycle_updated',
      columnNames: ['lifecycle_stage', 'updated_at']
    }));
    await queryRunner.createIndex('mplp_contexts', new TableIndex({
      name: 'IDX_contexts_parent',
      columnNames: ['parent_context_id']
    }));
    await queryRunner.createIndex('mplp_contexts', new TableIndex({
      name: 'IDX_contexts_created_at',
      columnNames: ['created_at']
    }));
    await queryRunner.createIndex('mplp_contexts', new TableIndex({
      name: 'IDX_contexts_expires_at',
      columnNames: ['expires_at']
    }));

    // SharedState表索引
    await queryRunner.createIndex('mplp_shared_states', new TableIndex({
      name: 'IDX_shared_states_context',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_shared_states', new TableIndex({
      name: 'IDX_shared_states_context_key',
      columnNames: ['context_id', 'state_key'],
      isUnique: true
    }));
    await queryRunner.createIndex('mplp_shared_states', new TableIndex({
      name: 'IDX_shared_states_access_level',
      columnNames: ['context_id', 'access_level']
    }));
    await queryRunner.createIndex('mplp_shared_states', new TableIndex({
      name: 'IDX_shared_states_sync_priority',
      columnNames: ['sync_priority', 'updated_at']
    }));
    await queryRunner.createIndex('mplp_shared_states', new TableIndex({
      name: 'IDX_shared_states_expires_at',
      columnNames: ['expires_at']
    }));

    // Session表索引
    await queryRunner.createIndex('mplp_context_sessions', new TableIndex({
      name: 'IDX_sessions_session_id',
      columnNames: ['session_id']
    }));
    await queryRunner.createIndex('mplp_context_sessions', new TableIndex({
      name: 'IDX_sessions_context',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_context_sessions', new TableIndex({
      name: 'IDX_sessions_user_expires',
      columnNames: ['user_id', 'expires_at']
    }));
    await queryRunner.createIndex('mplp_context_sessions', new TableIndex({
      name: 'IDX_sessions_agent_active',
      columnNames: ['agent_id', 'last_active_at']
    }));
    await queryRunner.createIndex('mplp_context_sessions', new TableIndex({
      name: 'IDX_sessions_is_active',
      columnNames: ['is_active']
    }));
  }

  private async createForeignKeys(queryRunner: QueryRunner): Promise<void> {
    // SharedState -> Context 外键
    await queryRunner.createForeignKey(
      'mplp_shared_states',
      new TableForeignKey({
        name: 'FK_shared_states_context',
        columnNames: ['context_id'],
        referencedTableName: 'mplp_contexts',
        referencedColumnNames: ['context_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    );

    // Session -> Context 外键
    await queryRunner.createForeignKey(
      'mplp_context_sessions',
      new TableForeignKey({
        name: 'FK_sessions_context',
        columnNames: ['context_id'],
        referencedTableName: 'mplp_contexts',
        referencedColumnNames: ['context_id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    );

    // Context -> Parent Context 自引用外键
    await queryRunner.createForeignKey(
      'mplp_contexts',
      new TableForeignKey({
        name: 'FK_contexts_parent',
        columnNames: ['parent_context_id'],
        referencedTableName: 'mplp_contexts',
        referencedColumnNames: ['context_id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      })
    );
  }

  private async createTriggers(queryRunner: QueryRunner): Promise<void> {
    // 创建通用的updated_at触发器函数
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Context表updated_at触发器
    await queryRunner.query(`
      CREATE TRIGGER update_context_updated_at
        BEFORE UPDATE ON mplp_contexts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // SharedState表updated_at触发器
    await queryRunner.query(`
      CREATE TRIGGER update_shared_state_updated_at
        BEFORE UPDATE ON mplp_shared_states
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Session表updated_at触发器
    await queryRunner.query(`
      CREATE TRIGGER update_session_updated_at
        BEFORE UPDATE ON mplp_context_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // 创建过期数据清理函数
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION cleanup_expired_contexts()
      RETURNS void AS $$
      BEGIN
        -- 清理过期的上下文
        UPDATE mplp_contexts 
        SET status = 'terminated', lifecycle_stage = 'terminated'
        WHERE expires_at < CURRENT_TIMESTAMP 
          AND status != 'terminated';

        -- 清理过期的共享状态
        DELETE FROM mplp_shared_states 
        WHERE expires_at < CURRENT_TIMESTAMP;

        -- 清理过期的会话
        UPDATE mplp_context_sessions 
        SET is_active = false
        WHERE expires_at < CURRENT_TIMESTAMP 
          AND is_active = true;
      END;
      $$ language 'plpgsql';
    `);
  }
} 