/**
 * Confirm模块数据库迁移
 * 
 * @version v1.0.0
 * @created 2025-07-17T20:00:00+08:00
 * @compliance .cursor/rules/architecture.mdc - PostgreSQL数据库规范
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateConfirmTables20250717 implements MigrationInterface {
  name = 'CreateConfirmTables20250717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建确认主表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_confirmations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'confirm_id',
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
            name: 'confirmation_type',
            type: 'enum',
            enum: ['plan_approval', 'task_approval', 'milestone_confirmation', 'risk_acceptance', 'resource_allocation', 'emergency_approval'],
            isNullable: false
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'in_review', 'approved', 'rejected', 'cancelled', 'expired'],
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
            name: 'requester',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'subject',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'risk_assessment',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'notification_settings',
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
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true
          }
        ]
      }),
      true
    );

    // 创建审批工作流表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_approval_workflows',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'workflow_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'confirm_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'workflow_type',
            type: 'enum',
            enum: ['single_approver', 'sequential', 'parallel', 'consensus', 'escalation'],
            isNullable: false
          },
          {
            name: 'current_step',
            type: 'int',
            isNullable: true
          },
          {
            name: 'total_steps',
            type: 'int',
            isNullable: false
          },
          {
            name: 'completed_steps',
            type: 'int',
            default: 0,
            isNullable: false
          },
          {
            name: 'rejected_steps',
            type: 'int',
            default: 0,
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

    // 创建审批步骤表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_approval_steps',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'step_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'workflow_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'step_order',
            type: 'int',
            isNullable: false
          },
          {
            name: 'approver',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'approval_criteria',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected', 'delegated', 'skipped'],
            default: "'pending'",
            isNullable: false
          },
          {
            name: 'decision',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'timeout_duration',
            type: 'int',
            isNullable: true
          },
          {
            name: 'timeout_unit',
            type: 'enum',
            enum: ['minutes', 'hours', 'days'],
            isNullable: true
          },
          {
            name: 'timeout_action',
            type: 'enum',
            enum: ['auto_approve', 'auto_reject', 'escalate', 'extend'],
            isNullable: true
          },
          {
            name: 'timeout_at',
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

    // 创建升级规则表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_escalation_rules',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'rule_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'workflow_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'trigger',
            type: 'enum',
            enum: ['timeout', 'rejection', 'manual', 'system'],
            isNullable: false
          },
          {
            name: 'escalate_to',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'notification_delay',
            type: 'int',
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

    // 创建审计跟踪表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_audit_trails',
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
            name: 'confirm_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'event_type',
            type: 'enum',
            enum: ['created', 'updated', 'approved', 'rejected', 'escalated', 'cancelled', 'timeout'],
            isNullable: false
          },
          {
            name: 'actor',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'changes',
            type: 'jsonb',
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

    // 创建附件表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_confirm_attachments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'file_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'confirm_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'size',
            type: 'int',
            isNullable: false
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true
          },
          {
            name: 'storage_path',
            type: 'varchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'uploaded_by',
            type: 'varchar',
            length: '100',
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

    // 创建索引和外键
    await this.createIndexes(queryRunner);
    await this.createForeignKeys(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键
    await queryRunner.dropForeignKey('mplp_approval_workflows', 'FK_workflows_confirmation');
    await queryRunner.dropForeignKey('mplp_approval_steps', 'FK_steps_workflow');
    await queryRunner.dropForeignKey('mplp_escalation_rules', 'FK_rules_workflow');
    await queryRunner.dropForeignKey('mplp_audit_trails', 'FK_audit_confirmation');
    await queryRunner.dropForeignKey('mplp_confirm_attachments', 'FK_attachments_confirmation');

    // 删除表
    await queryRunner.dropTable('mplp_confirm_attachments');
    await queryRunner.dropTable('mplp_audit_trails');
    await queryRunner.dropTable('mplp_escalation_rules');
    await queryRunner.dropTable('mplp_approval_steps');
    await queryRunner.dropTable('mplp_approval_workflows');
    await queryRunner.dropTable('mplp_confirmations');
  }

  private async createIndexes(queryRunner: QueryRunner): Promise<void> {
    // 确认表索引
    await queryRunner.createIndex('mplp_confirmations', new TableIndex({
      name: 'IDX_confirmations_context_id',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_confirmations', new TableIndex({
      name: 'IDX_confirmations_plan_id',
      columnNames: ['plan_id']
    }));
    await queryRunner.createIndex('mplp_confirmations', new TableIndex({
      name: 'IDX_confirmations_type',
      columnNames: ['confirmation_type']
    }));
    await queryRunner.createIndex('mplp_confirmations', new TableIndex({
      name: 'IDX_confirmations_status',
      columnNames: ['status']
    }));
    await queryRunner.createIndex('mplp_confirmations', new TableIndex({
      name: 'IDX_confirmations_priority',
      columnNames: ['priority']
    }));
    await queryRunner.createIndex('mplp_confirmations', new TableIndex({
      name: 'IDX_confirmations_expires_at',
      columnNames: ['expires_at']
    }));

    // 审批工作流表索引
    await queryRunner.createIndex('mplp_approval_workflows', new TableIndex({
      name: 'IDX_workflows_confirm_id',
      columnNames: ['confirm_id']
    }));
    await queryRunner.createIndex('mplp_approval_workflows', new TableIndex({
      name: 'IDX_workflows_type',
      columnNames: ['workflow_type']
    }));

    // 审批步骤表索引
    await queryRunner.createIndex('mplp_approval_steps', new TableIndex({
      name: 'IDX_steps_workflow_id',
      columnNames: ['workflow_id']
    }));
    await queryRunner.createIndex('mplp_approval_steps', new TableIndex({
      name: 'IDX_steps_order',
      columnNames: ['step_order']
    }));
    await queryRunner.createIndex('mplp_approval_steps', new TableIndex({
      name: 'IDX_steps_status',
      columnNames: ['status']
    }));
    await queryRunner.createIndex('mplp_approval_steps', new TableIndex({
      name: 'IDX_steps_timeout_at',
      columnNames: ['timeout_at']
    }));

    // 升级规则表索引
    await queryRunner.createIndex('mplp_escalation_rules', new TableIndex({
      name: 'IDX_rules_workflow_id',
      columnNames: ['workflow_id']
    }));
    await queryRunner.createIndex('mplp_escalation_rules', new TableIndex({
      name: 'IDX_rules_trigger',
      columnNames: ['trigger']
    }));

    // 审计跟踪表索引
    await queryRunner.createIndex('mplp_audit_trails', new TableIndex({
      name: 'IDX_audit_confirm_id',
      columnNames: ['confirm_id']
    }));
    await queryRunner.createIndex('mplp_audit_trails', new TableIndex({
      name: 'IDX_audit_event_type',
      columnNames: ['event_type']
    }));
    await queryRunner.createIndex('mplp_audit_trails', new TableIndex({
      name: 'IDX_audit_timestamp',
      columnNames: ['timestamp']
    }));

    // 附件表索引
    await queryRunner.createIndex('mplp_confirm_attachments', new TableIndex({
      name: 'IDX_attachments_confirm_id',
      columnNames: ['confirm_id']
    }));
    await queryRunner.createIndex('mplp_confirm_attachments', new TableIndex({
      name: 'IDX_attachments_mime_type',
      columnNames: ['mime_type']
    }));
  }

  private async createForeignKeys(queryRunner: QueryRunner): Promise<void> {
    // 审批工作流表外键
    await queryRunner.createForeignKey('mplp_approval_workflows', new TableForeignKey({
      name: 'FK_workflows_confirmation',
      columnNames: ['confirm_id'],
      referencedTableName: 'mplp_confirmations',
      referencedColumnNames: ['confirm_id'],
      onDelete: 'CASCADE'
    }));

    // 审批步骤表外键
    await queryRunner.createForeignKey('mplp_approval_steps', new TableForeignKey({
      name: 'FK_steps_workflow',
      columnNames: ['workflow_id'],
      referencedTableName: 'mplp_approval_workflows',
      referencedColumnNames: ['workflow_id'],
      onDelete: 'CASCADE'
    }));

    // 升级规则表外键
    await queryRunner.createForeignKey('mplp_escalation_rules', new TableForeignKey({
      name: 'FK_rules_workflow',
      columnNames: ['workflow_id'],
      referencedTableName: 'mplp_approval_workflows',
      referencedColumnNames: ['workflow_id'],
      onDelete: 'CASCADE'
    }));

    // 审计跟踪表外键
    await queryRunner.createForeignKey('mplp_audit_trails', new TableForeignKey({
      name: 'FK_audit_confirmation',
      columnNames: ['confirm_id'],
      referencedTableName: 'mplp_confirmations',
      referencedColumnNames: ['confirm_id'],
      onDelete: 'CASCADE'
    }));

    // 附件表外键
    await queryRunner.createForeignKey('mplp_confirm_attachments', new TableForeignKey({
      name: 'FK_attachments_confirmation',
      columnNames: ['confirm_id'],
      referencedTableName: 'mplp_confirmations',
      referencedColumnNames: ['confirm_id'],
      onDelete: 'CASCADE'
    }));
  }
} 