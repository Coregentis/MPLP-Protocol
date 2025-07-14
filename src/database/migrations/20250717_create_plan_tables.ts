/**
 * Plan模块数据库迁移
 * 
 * @version v1.0.0
 * @created 2025-07-17T19:00:00+08:00
 * @compliance .cursor/rules/architecture.mdc - PostgreSQL数据库规范
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePlanTables20250717 implements MigrationInterface {
  name = 'CreatePlanTables20250717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建计划主表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_plans',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'plan_id',
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
            length: '255',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed'],
            default: "'draft'",
            isNullable: false
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['critical', 'high', 'medium', 'low'],
            default: "'medium'",
            isNullable: false
          },
          {
            name: 'start_date',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'end_date',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'estimated_duration_value',
            type: 'int',
            isNullable: false
          },
          {
            name: 'estimated_duration_unit',
            type: 'enum',
            enum: ['minutes', 'hours', 'days', 'weeks', 'months'],
            default: "'days'",
            isNullable: false
          },
          {
            name: 'actual_duration_value',
            type: 'int',
            isNullable: true
          },
          {
            name: 'actual_duration_unit',
            type: 'enum',
            enum: ['minutes', 'hours', 'days', 'weeks', 'months'],
            isNullable: true
          },
          {
            name: 'optimization_strategy',
            type: 'enum',
            enum: ['time_optimal', 'resource_optimal', 'cost_optimal', 'quality_optimal', 'balanced'],
            isNullable: true
          },
          {
            name: 'optimization_constraints',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'optimization_parameters',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'risk_assessment',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'failure_resolver_config',
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

    // 创建任务表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_tasks',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'task_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'plan_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'parent_task_id',
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
            isNullable: true
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['atomic', 'composite', 'milestone', 'checkpoint'],
            default: "'atomic'",
            isNullable: false
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'ready', 'running', 'blocked', 'completed', 'failed', 'skipped'],
            default: "'pending'",
            isNullable: false
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['critical', 'high', 'medium', 'low'],
            default: "'medium'",
            isNullable: false
          },
          {
            name: 'assignee_user_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'assignee_role',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'assignee_team',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'estimated_effort_value',
            type: 'float',
            isNullable: true
          },
          {
            name: 'estimated_effort_unit',
            type: 'enum',
            enum: ['hours', 'days', 'story_points'],
            isNullable: true
          },
          {
            name: 'actual_effort_value',
            type: 'float',
            isNullable: true
          },
          {
            name: 'actual_effort_unit',
            type: 'enum',
            enum: ['hours', 'days', 'story_points'],
            isNullable: true
          },
          {
            name: 'resources_required',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'acceptance_criteria',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'progress_percentage',
            type: 'float',
            default: 0,
            isNullable: false
          },
          {
            name: 'actual_duration_minutes',
            type: 'int',
            isNullable: true
          },
          {
            name: 'error_message',
            type: 'text',
            isNullable: true
          },
          {
            name: 'result_data',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'execution_context',
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
            name: 'started_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true
          }
        ]
      }),
      true
    );

    // 创建依赖关系表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_task_dependencies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'dependency_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'source_task_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'target_task_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'dependency_type',
            type: 'enum',
            enum: ['finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish'],
            default: "'finish_to_start'",
            isNullable: false
          },
          {
            name: 'lag_value',
            type: 'int',
            isNullable: true
          },
          {
            name: 'lag_unit',
            type: 'enum',
            enum: ['minutes', 'hours', 'days', 'weeks', 'months'],
            isNullable: true
          },
          {
            name: 'criticality',
            type: 'enum',
            enum: ['blocking', 'important', 'nice_to_have'],
            default: "'blocking'",
            isNullable: false
          },
          {
            name: 'condition',
            type: 'text',
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

    // 创建里程碑表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_milestones',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'milestone_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'plan_id',
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
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'target_date',
            type: 'timestamp',
            isNullable: false
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['upcoming', 'at_risk', 'achieved', 'missed'],
            default: "'upcoming'",
            isNullable: false
          },
          {
            name: 'success_criteria',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'dependencies',
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

    // 创建故障解决器表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_failure_resolvers',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'resolver_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'plan_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'task_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: true,
            isNullable: false
          },
          {
            name: 'strategies',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'retry_config',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'rollback_config',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'manual_intervention_config',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'notification_channels',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'performance_thresholds',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'intelligent_diagnostics',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'vendor_integration',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'proactive_prevention',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'self_learning',
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

    // 创建故障记录表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_failures',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'failure_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'plan_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'task_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'failure_type',
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
            name: 'root_cause_analysis',
            type: 'text',
            isNullable: true
          },
          {
            name: 'recovery_strategy',
            type: 'enum',
            enum: ['retry', 'rollback', 'skip', 'manual_intervention'],
            isNullable: true
          },
          {
            name: 'recovery_attempts',
            type: 'int',
            default: 0,
            isNullable: false
          },
          {
            name: 'resolved',
            type: 'boolean',
            default: false,
            isNullable: false
          },
          {
            name: 'resolution_time',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'diagnostics_data',
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

    // 创建索引和外键
    await this.createIndexes(queryRunner);
    await this.createForeignKeys(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键
    await queryRunner.dropForeignKey('mplp_tasks', 'FK_tasks_plan');
    await queryRunner.dropForeignKey('mplp_tasks', 'FK_tasks_parent');
    await queryRunner.dropForeignKey('mplp_task_dependencies', 'FK_dependencies_source');
    await queryRunner.dropForeignKey('mplp_task_dependencies', 'FK_dependencies_target');
    await queryRunner.dropForeignKey('mplp_milestones', 'FK_milestones_plan');
    await queryRunner.dropForeignKey('mplp_failure_resolvers', 'FK_resolvers_plan');
    await queryRunner.dropForeignKey('mplp_failure_resolvers', 'FK_resolvers_task');
    await queryRunner.dropForeignKey('mplp_failures', 'FK_failures_plan');
    await queryRunner.dropForeignKey('mplp_failures', 'FK_failures_task');

    // 删除表
    await queryRunner.dropTable('mplp_failures');
    await queryRunner.dropTable('mplp_failure_resolvers');
    await queryRunner.dropTable('mplp_milestones');
    await queryRunner.dropTable('mplp_task_dependencies');
    await queryRunner.dropTable('mplp_tasks');
    await queryRunner.dropTable('mplp_plans');
  }

  private async createIndexes(queryRunner: QueryRunner): Promise<void> {
    // Plan表索引
    await queryRunner.createIndex('mplp_plans', new TableIndex({
      name: 'IDX_plans_context_id',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_plans', new TableIndex({
      name: 'IDX_plans_status',
      columnNames: ['status']
    }));
    await queryRunner.createIndex('mplp_plans', new TableIndex({
      name: 'IDX_plans_priority',
      columnNames: ['priority']
    }));

    // Task表索引
    await queryRunner.createIndex('mplp_tasks', new TableIndex({
      name: 'IDX_tasks_plan_id',
      columnNames: ['plan_id']
    }));
    await queryRunner.createIndex('mplp_tasks', new TableIndex({
      name: 'IDX_tasks_parent_id',
      columnNames: ['parent_task_id']
    }));
    await queryRunner.createIndex('mplp_tasks', new TableIndex({
      name: 'IDX_tasks_status',
      columnNames: ['status']
    }));
    await queryRunner.createIndex('mplp_tasks', new TableIndex({
      name: 'IDX_tasks_priority',
      columnNames: ['priority']
    }));
    await queryRunner.createIndex('mplp_tasks', new TableIndex({
      name: 'IDX_tasks_assignee',
      columnNames: ['assignee_user_id']
    }));

    // 依赖表索引
    await queryRunner.createIndex('mplp_task_dependencies', new TableIndex({
      name: 'IDX_dependencies_source',
      columnNames: ['source_task_id']
    }));
    await queryRunner.createIndex('mplp_task_dependencies', new TableIndex({
      name: 'IDX_dependencies_target',
      columnNames: ['target_task_id']
    }));
    await queryRunner.createIndex('mplp_task_dependencies', new TableIndex({
      name: 'IDX_dependencies_type',
      columnNames: ['dependency_type']
    }));

    // 里程碑表索引
    await queryRunner.createIndex('mplp_milestones', new TableIndex({
      name: 'IDX_milestones_plan_id',
      columnNames: ['plan_id']
    }));
    await queryRunner.createIndex('mplp_milestones', new TableIndex({
      name: 'IDX_milestones_status',
      columnNames: ['status']
    }));
    await queryRunner.createIndex('mplp_milestones', new TableIndex({
      name: 'IDX_milestones_target_date',
      columnNames: ['target_date']
    }));

    // 故障解决器表索引
    await queryRunner.createIndex('mplp_failure_resolvers', new TableIndex({
      name: 'IDX_resolvers_plan_id',
      columnNames: ['plan_id']
    }));
    await queryRunner.createIndex('mplp_failure_resolvers', new TableIndex({
      name: 'IDX_resolvers_task_id',
      columnNames: ['task_id']
    }));

    // 故障记录表索引
    await queryRunner.createIndex('mplp_failures', new TableIndex({
      name: 'IDX_failures_plan_id',
      columnNames: ['plan_id']
    }));
    await queryRunner.createIndex('mplp_failures', new TableIndex({
      name: 'IDX_failures_task_id',
      columnNames: ['task_id']
    }));
    await queryRunner.createIndex('mplp_failures', new TableIndex({
      name: 'IDX_failures_resolved',
      columnNames: ['resolved']
    }));
  }

  private async createForeignKeys(queryRunner: QueryRunner): Promise<void> {
    // 任务表外键
    await queryRunner.createForeignKey('mplp_tasks', new TableForeignKey({
      name: 'FK_tasks_plan',
      columnNames: ['plan_id'],
      referencedTableName: 'mplp_plans',
      referencedColumnNames: ['plan_id'],
      onDelete: 'CASCADE'
    }));
    await queryRunner.createForeignKey('mplp_tasks', new TableForeignKey({
      name: 'FK_tasks_parent',
      columnNames: ['parent_task_id'],
      referencedTableName: 'mplp_tasks',
      referencedColumnNames: ['task_id'],
      onDelete: 'SET NULL'
    }));

    // 依赖表外键
    await queryRunner.createForeignKey('mplp_task_dependencies', new TableForeignKey({
      name: 'FK_dependencies_source',
      columnNames: ['source_task_id'],
      referencedTableName: 'mplp_tasks',
      referencedColumnNames: ['task_id'],
      onDelete: 'CASCADE'
    }));
    await queryRunner.createForeignKey('mplp_task_dependencies', new TableForeignKey({
      name: 'FK_dependencies_target',
      columnNames: ['target_task_id'],
      referencedTableName: 'mplp_tasks',
      referencedColumnNames: ['task_id'],
      onDelete: 'CASCADE'
    }));

    // 里程碑表外键
    await queryRunner.createForeignKey('mplp_milestones', new TableForeignKey({
      name: 'FK_milestones_plan',
      columnNames: ['plan_id'],
      referencedTableName: 'mplp_plans',
      referencedColumnNames: ['plan_id'],
      onDelete: 'CASCADE'
    }));

    // 故障解决器表外键
    await queryRunner.createForeignKey('mplp_failure_resolvers', new TableForeignKey({
      name: 'FK_resolvers_plan',
      columnNames: ['plan_id'],
      referencedTableName: 'mplp_plans',
      referencedColumnNames: ['plan_id'],
      onDelete: 'CASCADE'
    }));
    await queryRunner.createForeignKey('mplp_failure_resolvers', new TableForeignKey({
      name: 'FK_resolvers_task',
      columnNames: ['task_id'],
      referencedTableName: 'mplp_tasks',
      referencedColumnNames: ['task_id'],
      onDelete: 'SET NULL'
    }));

    // 故障记录表外键
    await queryRunner.createForeignKey('mplp_failures', new TableForeignKey({
      name: 'FK_failures_plan',
      columnNames: ['plan_id'],
      referencedTableName: 'mplp_plans',
      referencedColumnNames: ['plan_id'],
      onDelete: 'CASCADE'
    }));
    await queryRunner.createForeignKey('mplp_failures', new TableForeignKey({
      name: 'FK_failures_task',
      columnNames: ['task_id'],
      referencedTableName: 'mplp_tasks',
      referencedColumnNames: ['task_id'],
      onDelete: 'CASCADE'
    }));
  }
} 