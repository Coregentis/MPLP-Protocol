/**
 * Confirm模块Schema-TypeScript映射器
 * 
 * 实现MPLP双重命名约定：
 * - Schema层：snake_case
 * - TypeScript层：camelCase
 * 
 * @version 1.0.0
 * @created 2025-08-09
 */

import { Confirm } from '../../domain/entities/confirm.entity';

/**
 * Confirm Schema接口 (snake_case)
 */
export interface ConfirmSchema {
  confirm_id: string;
  context_id: string;
  plan_id?: string;
  protocol_version: string;
  confirmation_type: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  subject: {
    title: string;
    description: string;
    rationale?: string;
  };
  requester: {
    id: string;
    name: string;
    role: string;
  };
  approval_workflow: {
    steps: Array<{
      step_id: string;
      approver: string;
      status: string;
    }>;
  };
  decision?: {
    result: string;
    reason?: string;
    decided_by: string;
    decided_at: string;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Confirm TypeScript数据接口 (camelCase)
 */
export interface ConfirmEntityData {
  confirmId: string;
  contextId: string;
  planId?: string;
  protocolVersion: string;
  confirmationType: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  subject: {
    title: string;
    description: string;
    rationale?: string;
  };
  requester: {
    id: string;
    name: string;
    role: string;
  };
  approvalWorkflow: {
    steps: Array<{
      stepId: string;
      approver: string;
      status: string;
    }>;
  };
  decision?: {
    result: string;
    reason?: string;
    decidedBy: string;
    decidedAt: Date;
  };
  metadata?: Record<string, unknown>;
}

/**
 * Confirm映射器
 */
export class ConfirmMapper {
  /**
   * TypeScript实体 → Schema格式 (camelCase → snake_case)
   */
  static toSchema(entity: Confirm): ConfirmSchema {
    const schema: ConfirmSchema = {
      confirm_id: entity.confirmId,
      context_id: entity.contextId,
      plan_id: entity.planId,
      protocol_version: entity.protocolVersion,
      confirmation_type: entity.confirmationType,
      status: entity.status,
      priority: entity.priority,
      created_at: typeof entity.createdAt === 'string' ? entity.createdAt : (entity.createdAt as Date).toISOString(),
      updated_at: typeof entity.updatedAt === 'string' ? entity.updatedAt : (entity.updatedAt as Date).toISOString(),
      expires_at: entity.expiresAt ? (typeof entity.expiresAt === 'string' ? entity.expiresAt : (entity.expiresAt as Date).toISOString()) : undefined,
      subject: {
        title: entity.subject.title,
        description: entity.subject.description
      },
      requester: {
        id: entity.requester.userId,
        name: entity.requester.name,
        role: entity.requester.role
      },
      approval_workflow: {
        steps: []
      }
    };

    // 映射decision
    if (entity.decision) {
      schema.decision = {
        result: entity.decision.type,
        reason: entity.decision.comment || '',
        decided_by: entity.decision.approverId,
        decided_at: typeof entity.decision.timestamp === 'string' ? entity.decision.timestamp : (entity.decision.timestamp as Date).toISOString()
      };
    }

    // 映射metadata
    if (entity.metadata) {
      schema.metadata = entity.metadata as Record<string, unknown>;
    }

    return schema;
  }

  /**
   * Schema格式 → TypeScript数据 (snake_case → camelCase)
   */
  static fromSchema(schema: ConfirmSchema): ConfirmEntityData {
    const data: ConfirmEntityData = {
      confirmId: schema.confirm_id,
      contextId: schema.context_id,
      planId: schema.plan_id,
      protocolVersion: schema.protocol_version,
      confirmationType: schema.confirmation_type,
      status: schema.status,
      priority: schema.priority,
      createdAt: new Date(schema.created_at),
      updatedAt: new Date(schema.updated_at),
      expiresAt: schema.expires_at ? new Date(schema.expires_at) : undefined,
      subject: {
        title: schema.subject.title,
        description: schema.subject.description
      },
      requester: {
        id: schema.requester.id,
        name: schema.requester.name,
        role: schema.requester.role
      },
      approvalWorkflow: {
        steps: schema.approval_workflow.steps.map(step => ({
          stepId: step.step_id,
          approver: step.approver,
          status: step.status
        }))
      }
    };

    // 映射decision
    if (schema.decision) {
      data.decision = {
        result: schema.decision.result,
        reason: schema.decision.reason,
        decidedBy: schema.decision.decided_by,
        decidedAt: new Date(schema.decision.decided_at)
      };
    }

    // 映射metadata
    if (schema.metadata) {
      data.metadata = schema.metadata;
    }

    return data;
  }

  /**
   * 验证Schema格式数据
   */
  static validateSchema(data: unknown): data is ConfirmSchema {
    if (!data || typeof data !== 'object') return false;

    const obj = data as Record<string, unknown>;

    return (
      typeof obj.confirm_id === 'string' &&
      typeof obj.context_id === 'string' &&
      typeof obj.protocol_version === 'string' &&
      typeof obj.confirmation_type === 'string' &&
      typeof obj.status === 'string' &&
      typeof obj.priority === 'string' &&
      typeof obj.created_at === 'string' &&
      typeof obj.updated_at === 'string' &&
      typeof obj.subject === 'object' &&
      typeof obj.requester === 'object' &&
      typeof obj.approval_workflow === 'object'
    );
  }

  /**
   * 批量转换：TypeScript实体数组 → Schema数组
   */
  static toSchemaArray(entities: Confirm[]): ConfirmSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换：Schema数组 → TypeScript数据数组
   */
  static fromSchemaArray(schemas: ConfirmSchema[]): ConfirmEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }
}
