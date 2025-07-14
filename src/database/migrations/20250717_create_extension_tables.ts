/**
 * Extension模块数据库迁移
 * 
 * @version v1.0.0
 * @created 2025-07-17T21:00:00+08:00
 * @compliance .cursor/rules/architecture.mdc - PostgreSQL数据库规范
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateExtensionTables20250717 implements MigrationInterface {
  name = 'CreateExtensionTables20250717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建扩展主表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_extensions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'extension_id',
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
            name: 'name',
            type: 'varchar',
            length: '64',
            isNullable: false
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'version',
            type: 'varchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['plugin', 'adapter', 'connector', 'middleware', 'hook', 'transformer'],
            isNullable: false
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['installed', 'active', 'inactive', 'disabled', 'error', 'updating', 'uninstalling'],
            default: "'installed'",
            isNullable: false
          },
          {
            name: 'compatibility',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'configuration',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'security',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'metadata',
            type: 'jsonb',
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

    // 创建扩展点表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_extension_points',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'point_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'extension_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['hook', 'filter', 'action', 'api_endpoint', 'event_listener'],
            isNullable: false
          },
          {
            name: 'target_module',
            type: 'enum',
            enum: ['context', 'plan', 'confirm', 'trace', 'role', 'extension', 'system'],
            isNullable: false
          },
          {
            name: 'event_name',
            type: 'varchar',
            length: '255',
            isNullable: true
          },
          {
            name: 'execution_order',
            type: 'int',
            isNullable: false
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: true,
            isNullable: false
          },
          {
            name: 'handler',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'conditions',
            type: 'jsonb',
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

    // 创建API扩展表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_api_extensions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'endpoint_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'extension_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'path',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'method',
            type: 'enum',
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'handler',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'middleware',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'authentication_required',
            type: 'boolean',
            default: true,
            isNullable: false
          },
          {
            name: 'required_permissions',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'rate_limit',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'request_schema',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'response_schema',
            type: 'jsonb',
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

    // 创建事件订阅表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_event_subscriptions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'subscription_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'extension_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'event_pattern',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'source_module',
            type: 'enum',
            enum: ['context', 'plan', 'confirm', 'trace', 'role', 'extension', 'system', '*'],
            isNullable: false
          },
          {
            name: 'handler',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'filter_conditions',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'delivery_guarantees',
            type: 'enum',
            enum: ['at_least_once', 'at_most_once', 'exactly_once'],
            default: "'at_least_once'",
            isNullable: false
          },
          {
            name: 'dead_letter_queue',
            type: 'boolean',
            default: false,
            isNullable: false
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

    // 创建生命周期表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_extension_lifecycles',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'extension_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'install_date',
            type: 'timestamp',
            isNullable: false
          },
          {
            name: 'activation_count',
            type: 'int',
            default: 0,
            isNullable: false
          },
          {
            name: 'error_count',
            type: 'int',
            default: 0,
            isNullable: false
          },
          {
            name: 'last_error',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'performance_metrics',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'health_check',
            type: 'jsonb',
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

    // 创建扩展依赖表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_extension_dependencies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'extension_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'dependency_extension_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'version_range',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'optional',
            type: 'boolean',
            default: false,
            isNullable: false
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          }
        ]
      }),
      true
    );

    // 创建扩展执行日志表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_extension_executions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'execution_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'extension_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'point_id',
            type: 'varchar',
            length: '100',
            isNullable: true
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
            isNullable: true
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'trace_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'start_time',
            type: 'timestamp',
            isNullable: false
          },
          {
            name: 'end_time',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'execution_time_ms',
            type: 'int',
            isNullable: true
          },
          {
            name: 'memory_usage_mb',
            type: 'float',
            isNullable: true
          },
          {
            name: 'success',
            type: 'boolean',
            isNullable: false
          },
          {
            name: 'parameters',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'result',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'error',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          }
        ]
      }),
      true
    );

    // 创建索引和外键
    await this.createIndexes(queryRunner);
    await this.createForeignKeys(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键
    await queryRunner.dropForeignKey('mplp_extension_points', 'FK_points_extension');
    await queryRunner.dropForeignKey('mplp_api_extensions', 'FK_api_extension');
    await queryRunner.dropForeignKey('mplp_event_subscriptions', 'FK_subscriptions_extension');
    await queryRunner.dropForeignKey('mplp_extension_lifecycles', 'FK_lifecycles_extension');
    await queryRunner.dropForeignKey('mplp_extension_dependencies', 'FK_dependencies_extension');
    await queryRunner.dropForeignKey('mplp_extension_executions', 'FK_executions_extension');
    await queryRunner.dropForeignKey('mplp_extension_executions', 'FK_executions_point');

    // 删除表
    await queryRunner.dropTable('mplp_extension_executions');
    await queryRunner.dropTable('mplp_extension_dependencies');
    await queryRunner.dropTable('mplp_extension_lifecycles');
    await queryRunner.dropTable('mplp_event_subscriptions');
    await queryRunner.dropTable('mplp_api_extensions');
    await queryRunner.dropTable('mplp_extension_points');
    await queryRunner.dropTable('mplp_extensions');
  }

  private async createIndexes(queryRunner: QueryRunner): Promise<void> {
    // 扩展表索引
    await queryRunner.createIndex('mplp_extensions', new TableIndex({
      name: 'IDX_extensions_context_id',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_extensions', new TableIndex({
      name: 'IDX_extensions_name',
      columnNames: ['name']
    }));
    await queryRunner.createIndex('mplp_extensions', new TableIndex({
      name: 'IDX_extensions_type',
      columnNames: ['type']
    }));
    await queryRunner.createIndex('mplp_extensions', new TableIndex({
      name: 'IDX_extensions_status',
      columnNames: ['status']
    }));
    await queryRunner.createIndex('mplp_extensions', new TableIndex({
      name: 'IDX_extensions_version',
      columnNames: ['version']
    }));

    // 扩展点表索引
    await queryRunner.createIndex('mplp_extension_points', new TableIndex({
      name: 'IDX_points_extension_id',
      columnNames: ['extension_id']
    }));
    await queryRunner.createIndex('mplp_extension_points', new TableIndex({
      name: 'IDX_points_type',
      columnNames: ['type']
    }));
    await queryRunner.createIndex('mplp_extension_points', new TableIndex({
      name: 'IDX_points_target_module',
      columnNames: ['target_module']
    }));
    await queryRunner.createIndex('mplp_extension_points', new TableIndex({
      name: 'IDX_points_execution_order',
      columnNames: ['execution_order']
    }));
    await queryRunner.createIndex('mplp_extension_points', new TableIndex({
      name: 'IDX_points_enabled',
      columnNames: ['enabled']
    }));

    // API扩展表索引
    await queryRunner.createIndex('mplp_api_extensions', new TableIndex({
      name: 'IDX_api_extension_id',
      columnNames: ['extension_id']
    }));
    await queryRunner.createIndex('mplp_api_extensions', new TableIndex({
      name: 'IDX_api_path',
      columnNames: ['path']
    }));
    await queryRunner.createIndex('mplp_api_extensions', new TableIndex({
      name: 'IDX_api_method',
      columnNames: ['method']
    }));
    await queryRunner.createIndex('mplp_api_extensions', new TableIndex({
      name: 'IDX_api_auth_required',
      columnNames: ['authentication_required']
    }));

    // 事件订阅表索引
    await queryRunner.createIndex('mplp_event_subscriptions', new TableIndex({
      name: 'IDX_subscriptions_extension_id',
      columnNames: ['extension_id']
    }));
    await queryRunner.createIndex('mplp_event_subscriptions', new TableIndex({
      name: 'IDX_subscriptions_source_module',
      columnNames: ['source_module']
    }));
    await queryRunner.createIndex('mplp_event_subscriptions', new TableIndex({
      name: 'IDX_subscriptions_event_pattern',
      columnNames: ['event_pattern']
    }));
    await queryRunner.createIndex('mplp_event_subscriptions', new TableIndex({
      name: 'IDX_subscriptions_delivery',
      columnNames: ['delivery_guarantees']
    }));

    // 生命周期表索引
    await queryRunner.createIndex('mplp_extension_lifecycles', new TableIndex({
      name: 'IDX_lifecycles_extension_id',
      columnNames: ['extension_id']
    }));
    await queryRunner.createIndex('mplp_extension_lifecycles', new TableIndex({
      name: 'IDX_lifecycles_install_date',
      columnNames: ['install_date']
    }));
    await queryRunner.createIndex('mplp_extension_lifecycles', new TableIndex({
      name: 'IDX_lifecycles_error_count',
      columnNames: ['error_count']
    }));

    // 扩展依赖表索引
    await queryRunner.createIndex('mplp_extension_dependencies', new TableIndex({
      name: 'IDX_dependencies_extension_id',
      columnNames: ['extension_id']
    }));
    await queryRunner.createIndex('mplp_extension_dependencies', new TableIndex({
      name: 'IDX_dependencies_dependency_id',
      columnNames: ['dependency_extension_id']
    }));
    await queryRunner.createIndex('mplp_extension_dependencies', new TableIndex({
      name: 'IDX_dependencies_optional',
      columnNames: ['optional']
    }));

    // 扩展执行日志表索引
    await queryRunner.createIndex('mplp_extension_executions', new TableIndex({
      name: 'IDX_executions_extension_id',
      columnNames: ['extension_id']
    }));
    await queryRunner.createIndex('mplp_extension_executions', new TableIndex({
      name: 'IDX_executions_point_id',
      columnNames: ['point_id']
    }));
    await queryRunner.createIndex('mplp_extension_executions', new TableIndex({
      name: 'IDX_executions_context_id',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_extension_executions', new TableIndex({
      name: 'IDX_executions_start_time',
      columnNames: ['start_time']
    }));
    await queryRunner.createIndex('mplp_extension_executions', new TableIndex({
      name: 'IDX_executions_success',
      columnNames: ['success']
    }));
    await queryRunner.createIndex('mplp_extension_executions', new TableIndex({
      name: 'IDX_executions_execution_time',
      columnNames: ['execution_time_ms']
    }));
  }

  private async createForeignKeys(queryRunner: QueryRunner): Promise<void> {
    // 扩展点表外键
    await queryRunner.createForeignKey('mplp_extension_points', new TableForeignKey({
      name: 'FK_points_extension',
      columnNames: ['extension_id'],
      referencedTableName: 'mplp_extensions',
      referencedColumnNames: ['extension_id'],
      onDelete: 'CASCADE'
    }));

    // API扩展表外键
    await queryRunner.createForeignKey('mplp_api_extensions', new TableForeignKey({
      name: 'FK_api_extension',
      columnNames: ['extension_id'],
      referencedTableName: 'mplp_extensions',
      referencedColumnNames: ['extension_id'],
      onDelete: 'CASCADE'
    }));

    // 事件订阅表外键
    await queryRunner.createForeignKey('mplp_event_subscriptions', new TableForeignKey({
      name: 'FK_subscriptions_extension',
      columnNames: ['extension_id'],
      referencedTableName: 'mplp_extensions',
      referencedColumnNames: ['extension_id'],
      onDelete: 'CASCADE'
    }));

    // 生命周期表外键
    await queryRunner.createForeignKey('mplp_extension_lifecycles', new TableForeignKey({
      name: 'FK_lifecycles_extension',
      columnNames: ['extension_id'],
      referencedTableName: 'mplp_extensions',
      referencedColumnNames: ['extension_id'],
      onDelete: 'CASCADE'
    }));

    // 扩展依赖表外键
    await queryRunner.createForeignKey('mplp_extension_dependencies', new TableForeignKey({
      name: 'FK_dependencies_extension',
      columnNames: ['extension_id'],
      referencedTableName: 'mplp_extensions',
      referencedColumnNames: ['extension_id'],
      onDelete: 'CASCADE'
    }));

    // 扩展执行日志表外键
    await queryRunner.createForeignKey('mplp_extension_executions', new TableForeignKey({
      name: 'FK_executions_extension',
      columnNames: ['extension_id'],
      referencedTableName: 'mplp_extensions',
      referencedColumnNames: ['extension_id'],
      onDelete: 'CASCADE'
    }));
    await queryRunner.createForeignKey('mplp_extension_executions', new TableForeignKey({
      name: 'FK_executions_point',
      columnNames: ['point_id'],
      referencedTableName: 'mplp_extension_points',
      referencedColumnNames: ['point_id'],
      onDelete: 'SET NULL'
    }));
  }
} 