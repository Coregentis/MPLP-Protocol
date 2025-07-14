/**
 * Trace模块数据库迁移
 * 
 * @version v1.0.0
 * @created 2025-07-17T20:30:00+08:00
 * @compliance .cursor/rules/architecture.mdc - PostgreSQL数据库规范
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateTraceTables20250717 implements MigrationInterface {
  name = 'CreateTraceTables20250717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建追踪主表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_traces',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'trace_id',
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
            name: 'plan_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'task_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'protocol_version',
            type: 'varchar',
            length: '20',
            isNullable: false
          },
          {
            name: 'trace_type',
            type: 'enum',
            enum: ['execution', 'monitoring', 'audit', 'performance', 'error', 'decision'],
            isNullable: false
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['debug', 'info', 'warn', 'error', 'critical'],
            default: "'info'",
            isNullable: false
          },
          {
            name: 'parent_trace_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'source',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: true
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'tags',
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
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          }
        ]
      }),
      true
    );

    // 创建事件表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_trace_events',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'event_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'trace_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['start', 'progress', 'checkpoint', 'completion', 'failure', 'timeout', 'interrupt'],
            isNullable: false
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
            isNullable: true
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['system', 'user', 'external', 'automatic'],
            isNullable: false
          },
          {
            name: 'source_component',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'source_module',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'source_function',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'source_line_number',
            type: 'int',
            isNullable: true
          },
          {
            name: 'data',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'duration_ms',
            type: 'int',
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

    // 创建性能指标表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_performance_metrics',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'trace_id',
            type: 'varchar',
            length: '100',
            isNullable: false
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
            name: 'duration_ms',
            type: 'int',
            isNullable: false
          },
          {
            name: 'cpu_time_ms',
            type: 'int',
            isNullable: true
          },
          {
            name: 'memory_peak_usage_mb',
            type: 'float',
            isNullable: true
          },
          {
            name: 'memory_average_usage_mb',
            type: 'float',
            isNullable: true
          },
          {
            name: 'memory_allocations',
            type: 'int',
            isNullable: true
          },
          {
            name: 'memory_deallocations',
            type: 'int',
            isNullable: true
          },
          {
            name: 'cpu_utilization_percent',
            type: 'float',
            isNullable: true
          },
          {
            name: 'cpu_instructions',
            type: 'bigint',
            isNullable: true
          },
          {
            name: 'cpu_cache_misses',
            type: 'int',
            isNullable: true
          },
          {
            name: 'network_bytes_sent',
            type: 'int',
            isNullable: true
          },
          {
            name: 'network_bytes_received',
            type: 'int',
            isNullable: true
          },
          {
            name: 'network_requests_count',
            type: 'int',
            isNullable: true
          },
          {
            name: 'network_error_count',
            type: 'int',
            isNullable: true
          },
          {
            name: 'storage_reads',
            type: 'int',
            isNullable: true
          },
          {
            name: 'storage_writes',
            type: 'int',
            isNullable: true
          },
          {
            name: 'storage_bytes_read',
            type: 'int',
            isNullable: true
          },
          {
            name: 'storage_bytes_written',
            type: 'int',
            isNullable: true
          },
          {
            name: 'custom_metrics',
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

    // 创建上下文快照表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_context_snapshots',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'trace_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'variables',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'environment_os',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'environment_platform',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'environment_runtime_version',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'environment_variables',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'call_stack',
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

    // 创建错误信息表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_error_information',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'trace_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'error_code',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: false
          },
          {
            name: 'error_type',
            type: 'enum',
            enum: ['system', 'business', 'validation', 'network', 'timeout', 'security'],
            isNullable: false
          },
          {
            name: 'stack_trace',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'recovery_actions',
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

    // 创建决策日志表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_decision_logs',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'trace_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'decision_point',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'options_considered',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'selected_option',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'decision_criteria',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'confidence_level',
            type: 'float',
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

    // 创建关联表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_trace_correlations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'correlation_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'trace_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'related_trace_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['causation', 'temporal', 'spatial', 'logical'],
            isNullable: false
          },
          {
            name: 'strength',
            type: 'float',
            isNullable: true
          },
          {
            name: 'description',
            type: 'text',
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
    await queryRunner.dropForeignKey('mplp_trace_events', 'FK_events_trace');
    await queryRunner.dropForeignKey('mplp_performance_metrics', 'FK_metrics_trace');
    await queryRunner.dropForeignKey('mplp_context_snapshots', 'FK_snapshots_trace');
    await queryRunner.dropForeignKey('mplp_error_information', 'FK_errors_trace');
    await queryRunner.dropForeignKey('mplp_decision_logs', 'FK_decisions_trace');
    await queryRunner.dropForeignKey('mplp_trace_correlations', 'FK_correlations_trace');
    await queryRunner.dropForeignKey('mplp_trace_correlations', 'FK_correlations_related_trace');

    // 删除表
    await queryRunner.dropTable('mplp_trace_correlations');
    await queryRunner.dropTable('mplp_decision_logs');
    await queryRunner.dropTable('mplp_error_information');
    await queryRunner.dropTable('mplp_context_snapshots');
    await queryRunner.dropTable('mplp_performance_metrics');
    await queryRunner.dropTable('mplp_trace_events');
    await queryRunner.dropTable('mplp_traces');
  }

  private async createIndexes(queryRunner: QueryRunner): Promise<void> {
    // 追踪表索引
    await queryRunner.createIndex('mplp_traces', new TableIndex({
      name: 'IDX_traces_context_id',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_traces', new TableIndex({
      name: 'IDX_traces_plan_id',
      columnNames: ['plan_id']
    }));
    await queryRunner.createIndex('mplp_traces', new TableIndex({
      name: 'IDX_traces_task_id',
      columnNames: ['task_id']
    }));
    await queryRunner.createIndex('mplp_traces', new TableIndex({
      name: 'IDX_traces_type',
      columnNames: ['trace_type']
    }));
    await queryRunner.createIndex('mplp_traces', new TableIndex({
      name: 'IDX_traces_severity',
      columnNames: ['severity']
    }));
    await queryRunner.createIndex('mplp_traces', new TableIndex({
      name: 'IDX_traces_timestamp',
      columnNames: ['timestamp']
    }));
    await queryRunner.createIndex('mplp_traces', new TableIndex({
      name: 'IDX_traces_parent',
      columnNames: ['parent_trace_id']
    }));

    // 事件表索引
    await queryRunner.createIndex('mplp_trace_events', new TableIndex({
      name: 'IDX_events_trace_id',
      columnNames: ['trace_id']
    }));
    await queryRunner.createIndex('mplp_trace_events', new TableIndex({
      name: 'IDX_events_type',
      columnNames: ['type']
    }));
    await queryRunner.createIndex('mplp_trace_events', new TableIndex({
      name: 'IDX_events_timestamp',
      columnNames: ['timestamp']
    }));
    await queryRunner.createIndex('mplp_trace_events', new TableIndex({
      name: 'IDX_events_category',
      columnNames: ['category']
    }));

    // 性能指标表索引
    await queryRunner.createIndex('mplp_performance_metrics', new TableIndex({
      name: 'IDX_metrics_trace_id',
      columnNames: ['trace_id']
    }));
    await queryRunner.createIndex('mplp_performance_metrics', new TableIndex({
      name: 'IDX_metrics_duration',
      columnNames: ['duration_ms']
    }));

    // 上下文快照表索引
    await queryRunner.createIndex('mplp_context_snapshots', new TableIndex({
      name: 'IDX_snapshots_trace_id',
      columnNames: ['trace_id']
    }));

    // 错误信息表索引
    await queryRunner.createIndex('mplp_error_information', new TableIndex({
      name: 'IDX_errors_trace_id',
      columnNames: ['trace_id']
    }));
    await queryRunner.createIndex('mplp_error_information', new TableIndex({
      name: 'IDX_errors_error_type',
      columnNames: ['error_type']
    }));
    await queryRunner.createIndex('mplp_error_information', new TableIndex({
      name: 'IDX_errors_error_code',
      columnNames: ['error_code']
    }));

    // 决策日志表索引
    await queryRunner.createIndex('mplp_decision_logs', new TableIndex({
      name: 'IDX_decisions_trace_id',
      columnNames: ['trace_id']
    }));

    // 关联表索引
    await queryRunner.createIndex('mplp_trace_correlations', new TableIndex({
      name: 'IDX_correlations_trace_id',
      columnNames: ['trace_id']
    }));
    await queryRunner.createIndex('mplp_trace_correlations', new TableIndex({
      name: 'IDX_correlations_related_trace_id',
      columnNames: ['related_trace_id']
    }));
    await queryRunner.createIndex('mplp_trace_correlations', new TableIndex({
      name: 'IDX_correlations_type',
      columnNames: ['type']
    }));
  }

  private async createForeignKeys(queryRunner: QueryRunner): Promise<void> {
    // 事件表外键
    await queryRunner.createForeignKey('mplp_trace_events', new TableForeignKey({
      name: 'FK_events_trace',
      columnNames: ['trace_id'],
      referencedTableName: 'mplp_traces',
      referencedColumnNames: ['trace_id'],
      onDelete: 'CASCADE'
    }));

    // 性能指标表外键
    await queryRunner.createForeignKey('mplp_performance_metrics', new TableForeignKey({
      name: 'FK_metrics_trace',
      columnNames: ['trace_id'],
      referencedTableName: 'mplp_traces',
      referencedColumnNames: ['trace_id'],
      onDelete: 'CASCADE'
    }));

    // 上下文快照表外键
    await queryRunner.createForeignKey('mplp_context_snapshots', new TableForeignKey({
      name: 'FK_snapshots_trace',
      columnNames: ['trace_id'],
      referencedTableName: 'mplp_traces',
      referencedColumnNames: ['trace_id'],
      onDelete: 'CASCADE'
    }));

    // 错误信息表外键
    await queryRunner.createForeignKey('mplp_error_information', new TableForeignKey({
      name: 'FK_errors_trace',
      columnNames: ['trace_id'],
      referencedTableName: 'mplp_traces',
      referencedColumnNames: ['trace_id'],
      onDelete: 'CASCADE'
    }));

    // 决策日志表外键
    await queryRunner.createForeignKey('mplp_decision_logs', new TableForeignKey({
      name: 'FK_decisions_trace',
      columnNames: ['trace_id'],
      referencedTableName: 'mplp_traces',
      referencedColumnNames: ['trace_id'],
      onDelete: 'CASCADE'
    }));

    // 关联表外键
    await queryRunner.createForeignKey('mplp_trace_correlations', new TableForeignKey({
      name: 'FK_correlations_trace',
      columnNames: ['trace_id'],
      referencedTableName: 'mplp_traces',
      referencedColumnNames: ['trace_id'],
      onDelete: 'CASCADE'
    }));
    await queryRunner.createForeignKey('mplp_trace_correlations', new TableForeignKey({
      name: 'FK_correlations_related_trace',
      columnNames: ['related_trace_id'],
      referencedTableName: 'mplp_traces',
      referencedColumnNames: ['trace_id'],
      onDelete: 'CASCADE'
    }));
  }
} 