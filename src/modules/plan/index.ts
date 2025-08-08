/**
 * Plan模块入口
 *
 * 导出模块的公共API
 *
 * @version v2.0.0
 * @created 2025-07-26T19:55:00+08:00
 * @updated 2025-08-04 23:09
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

// API层
export * from './api/controllers/plan.controller';
export * from './api/dtos/plan.dto';

// 应用层
export * from './application/services/plan-management.service';
export * from './application/services/plan-execution.service';
export * from './application/commands/create-plan.command';
export * from './application/commands/update-plan.command';
export * from './application/commands/delete-plan.command';
export * from './application/queries/get-plan.query';
export * from './application/queries/get-plans.query';
export * from './application/queries/get-plan-by-id.query';

// 领域层
export * from './domain/entities/plan.entity';
export * from './domain/repositories/plan-repository.interface';
export * from './domain/services/plan-validation.service';
export * from './domain/services/plan-factory.service';
export * from './domain/value-objects/plan-task.value-object';
export * from './domain/value-objects/plan-dependency.value-object';
export * from './domain/value-objects/plan-configuration.value-object';
export * from './domain/value-objects/timeline.value-object';
export * from './domain/value-objects/plan-milestone.value-object';
export * from './domain/value-objects/risk-assessment.value-object';

// 基础设施层
export * from './infrastructure/repositories/plan-repository.impl';
export * from './infrastructure/persistence/plan.entity';
export * from './infrastructure/persistence/plan.mapper';

// ===== 适配器导出 =====
export { PlanModuleAdapter } from './infrastructure/adapters/plan-module.adapter';

/**
 * 初始化Plan模块
 */
export async function initializePlanModule(): Promise<void> {
  // 在这里可以添加模块初始化代码
  // 例如：设置依赖注入、初始化数据库连接等
}