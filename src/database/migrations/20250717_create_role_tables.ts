/**
 * Role模块数据库迁移
 * 
 * @version v1.0.0
 * @created 2025-07-17T19:30:00+08:00
 * @compliance .cursor/rules/architecture.mdc - PostgreSQL数据库规范
 */

import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRoleTables20250717 implements MigrationInterface {
  name = 'CreateRoleTables20250717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建角色主表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_roles',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'role_id',
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
            name: 'role_type',
            type: 'enum',
            enum: ['system', 'organizational', 'functional', 'project', 'temporary'],
            isNullable: false
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'deprecated', 'suspended'],
            default: "'active'",
            isNullable: false
          },
          {
            name: 'scope_level',
            type: 'enum',
            enum: ['global', 'organization', 'project', 'team', 'individual'],
            isNullable: false
          },
          {
            name: 'scope_context_ids',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'scope_plan_ids',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'resource_constraints',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'attributes',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'validation_rules',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'audit_settings',
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

    // 创建权限表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_permissions',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'permission_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'role_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'resource_type',
            type: 'enum',
            enum: ['context', 'plan', 'task', 'confirmation', 'trace', 'role', 'extension', 'system'],
            isNullable: false
          },
          {
            name: 'resource_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'actions',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'conditions',
            type: 'jsonb',
            isNullable: true
          },
          {
            name: 'grant_type',
            type: 'enum',
            enum: ['direct', 'inherited', 'delegated', 'temporary'],
            default: "'direct'",
            isNullable: false
          },
          {
            name: 'expiry',
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

    // 创建角色继承表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_role_inheritance',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'inheritance_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'role_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'parent_role_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'inheritance_type',
            type: 'enum',
            enum: ['full', 'partial', 'conditional'],
            default: "'full'",
            isNullable: false
          },
          {
            name: 'excluded_permissions',
            type: 'jsonb',
            isNullable: true
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

    // 创建角色委派表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_role_delegations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'delegation_id',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false
          },
          {
            name: 'role_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'delegated_to',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'permissions',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'start_time',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'end_time',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'suspended', 'revoked', 'expired'],
            default: "'active'",
            isNullable: false
          },
          {
            name: 'delegation_constraints',
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

    // 创建用户角色分配表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_user_role_assignments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'assignment_id',
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
            name: 'role_id',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'context_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'assigned_by',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'assigned_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'expires_at',
            type: 'timestamp',
            isNullable: true
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'suspended', 'expired', 'revoked'],
            default: "'active'",
            isNullable: false
          },
          {
            name: 'conditions',
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

    // 创建角色审计日志表
    await queryRunner.createTable(
      new Table({
        name: 'mplp_role_audit_logs',
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
            name: 'event_type',
            type: 'varchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'role_id',
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
            name: 'context_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'actor_id',
            type: 'varchar',
            length: '100',
            isNullable: true
          },
          {
            name: 'timestamp',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false
          },
          {
            name: 'details',
            type: 'jsonb',
            isNullable: false
          },
          {
            name: 'severity',
            type: 'enum',
            enum: ['warning', 'error', 'critical'],
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

    // 创建索引和外键
    await this.createIndexes(queryRunner);
    await this.createForeignKeys(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键
    await queryRunner.dropForeignKey('mplp_permissions', 'FK_permissions_role');
    await queryRunner.dropForeignKey('mplp_role_inheritance', 'FK_inheritance_role');
    await queryRunner.dropForeignKey('mplp_role_inheritance', 'FK_inheritance_parent_role');
    await queryRunner.dropForeignKey('mplp_role_delegations', 'FK_delegations_role');
    await queryRunner.dropForeignKey('mplp_user_role_assignments', 'FK_assignments_role');
    await queryRunner.dropForeignKey('mplp_role_audit_logs', 'FK_audit_logs_role');

    // 删除表
    await queryRunner.dropTable('mplp_role_audit_logs');
    await queryRunner.dropTable('mplp_user_role_assignments');
    await queryRunner.dropTable('mplp_role_delegations');
    await queryRunner.dropTable('mplp_role_inheritance');
    await queryRunner.dropTable('mplp_permissions');
    await queryRunner.dropTable('mplp_roles');
  }

  private async createIndexes(queryRunner: QueryRunner): Promise<void> {
    // 角色表索引
    await queryRunner.createIndex('mplp_roles', new TableIndex({
      name: 'IDX_roles_context_id',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_roles', new TableIndex({
      name: 'IDX_roles_name',
      columnNames: ['name']
    }));
    await queryRunner.createIndex('mplp_roles', new TableIndex({
      name: 'IDX_roles_status',
      columnNames: ['status']
    }));
    await queryRunner.createIndex('mplp_roles', new TableIndex({
      name: 'IDX_roles_type',
      columnNames: ['role_type']
    }));
    await queryRunner.createIndex('mplp_roles', new TableIndex({
      name: 'IDX_roles_scope',
      columnNames: ['scope_level']
    }));

    // 权限表索引
    await queryRunner.createIndex('mplp_permissions', new TableIndex({
      name: 'IDX_permissions_role_id',
      columnNames: ['role_id']
    }));
    await queryRunner.createIndex('mplp_permissions', new TableIndex({
      name: 'IDX_permissions_resource',
      columnNames: ['resource_type', 'resource_id']
    }));
    await queryRunner.createIndex('mplp_permissions', new TableIndex({
      name: 'IDX_permissions_grant_type',
      columnNames: ['grant_type']
    }));
    await queryRunner.createIndex('mplp_permissions', new TableIndex({
      name: 'IDX_permissions_expiry',
      columnNames: ['expiry']
    }));

    // 角色继承表索引
    await queryRunner.createIndex('mplp_role_inheritance', new TableIndex({
      name: 'IDX_inheritance_role_id',
      columnNames: ['role_id']
    }));
    await queryRunner.createIndex('mplp_role_inheritance', new TableIndex({
      name: 'IDX_inheritance_parent_role_id',
      columnNames: ['parent_role_id']
    }));
    await queryRunner.createIndex('mplp_role_inheritance', new TableIndex({
      name: 'IDX_inheritance_type',
      columnNames: ['inheritance_type']
    }));

    // 角色委派表索引
    await queryRunner.createIndex('mplp_role_delegations', new TableIndex({
      name: 'IDX_delegations_role_id',
      columnNames: ['role_id']
    }));
    await queryRunner.createIndex('mplp_role_delegations', new TableIndex({
      name: 'IDX_delegations_delegated_to',
      columnNames: ['delegated_to']
    }));
    await queryRunner.createIndex('mplp_role_delegations', new TableIndex({
      name: 'IDX_delegations_status',
      columnNames: ['status']
    }));
    await queryRunner.createIndex('mplp_role_delegations', new TableIndex({
      name: 'IDX_delegations_end_time',
      columnNames: ['end_time']
    }));

    // 用户角色分配表索引
    await queryRunner.createIndex('mplp_user_role_assignments', new TableIndex({
      name: 'IDX_assignments_user_id',
      columnNames: ['user_id']
    }));
    await queryRunner.createIndex('mplp_user_role_assignments', new TableIndex({
      name: 'IDX_assignments_role_id',
      columnNames: ['role_id']
    }));
    await queryRunner.createIndex('mplp_user_role_assignments', new TableIndex({
      name: 'IDX_assignments_context_id',
      columnNames: ['context_id']
    }));
    await queryRunner.createIndex('mplp_user_role_assignments', new TableIndex({
      name: 'IDX_assignments_status',
      columnNames: ['status']
    }));
    await queryRunner.createIndex('mplp_user_role_assignments', new TableIndex({
      name: 'IDX_assignments_expires_at',
      columnNames: ['expires_at']
    }));

    // 角色审计日志表索引
    await queryRunner.createIndex('mplp_role_audit_logs', new TableIndex({
      name: 'IDX_audit_logs_role_id',
      columnNames: ['role_id']
    }));
    await queryRunner.createIndex('mplp_role_audit_logs', new TableIndex({
      name: 'IDX_audit_logs_event_type',
      columnNames: ['event_type']
    }));
    await queryRunner.createIndex('mplp_role_audit_logs', new TableIndex({
      name: 'IDX_audit_logs_user_id',
      columnNames: ['user_id']
    }));
    await queryRunner.createIndex('mplp_role_audit_logs', new TableIndex({
      name: 'IDX_audit_logs_timestamp',
      columnNames: ['timestamp']
    }));
    await queryRunner.createIndex('mplp_role_audit_logs', new TableIndex({
      name: 'IDX_audit_logs_severity',
      columnNames: ['severity']
    }));
  }

  private async createForeignKeys(queryRunner: QueryRunner): Promise<void> {
    // 权限表外键
    await queryRunner.createForeignKey('mplp_permissions', new TableForeignKey({
      name: 'FK_permissions_role',
      columnNames: ['role_id'],
      referencedTableName: 'mplp_roles',
      referencedColumnNames: ['role_id'],
      onDelete: 'CASCADE'
    }));

    // 角色继承表外键
    await queryRunner.createForeignKey('mplp_role_inheritance', new TableForeignKey({
      name: 'FK_inheritance_role',
      columnNames: ['role_id'],
      referencedTableName: 'mplp_roles',
      referencedColumnNames: ['role_id'],
      onDelete: 'CASCADE'
    }));
    await queryRunner.createForeignKey('mplp_role_inheritance', new TableForeignKey({
      name: 'FK_inheritance_parent_role',
      columnNames: ['parent_role_id'],
      referencedTableName: 'mplp_roles',
      referencedColumnNames: ['role_id'],
      onDelete: 'CASCADE'
    }));

    // 角色委派表外键
    await queryRunner.createForeignKey('mplp_role_delegations', new TableForeignKey({
      name: 'FK_delegations_role',
      columnNames: ['role_id'],
      referencedTableName: 'mplp_roles',
      referencedColumnNames: ['role_id'],
      onDelete: 'CASCADE'
    }));

    // 用户角色分配表外键
    await queryRunner.createForeignKey('mplp_user_role_assignments', new TableForeignKey({
      name: 'FK_assignments_role',
      columnNames: ['role_id'],
      referencedTableName: 'mplp_roles',
      referencedColumnNames: ['role_id'],
      onDelete: 'CASCADE'
    }));

    // 角色审计日志表外键
    await queryRunner.createForeignKey('mplp_role_audit_logs', new TableForeignKey({
      name: 'FK_audit_logs_role',
      columnNames: ['role_id'],
      referencedTableName: 'mplp_roles',
      referencedColumnNames: ['role_id'],
      onDelete: 'CASCADE'
    }));
  }
} 