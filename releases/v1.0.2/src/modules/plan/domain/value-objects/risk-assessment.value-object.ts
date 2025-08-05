/**
 * RiskAssessment值对象
 * 
 * 表示计划的风险评估，包含整体风险级别、风险列表和最后评估时间
 * 
 * @version v1.0.0
 * @created 2025-07-26T18:50:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { UUID, Timestamp, RiskLevel, RiskCategory, RiskStatus } from '../../../shared/types';

/**
 * 风险对象
 */
export interface Risk {
  risk_id: UUID;
  name: string;
  description: string;
  category: RiskCategory;
  likelihood: number; // 0-1
  impact: number; // 0-1
  risk_level: RiskLevel;
  status: RiskStatus;
  mitigation_strategy?: string;
  related_tasks?: UUID[];
}

/**
 * 风险评估值对象
 */
export interface RiskAssessment {
  overall_risk_level: RiskLevel;
  risks: Risk[];
  last_assessed: Timestamp;
}

/**
 * 创建风险对象
 */
export function createRisk(params: {
  risk_id: UUID;
  name: string;
  description: string;
  category: RiskCategory;
  likelihood: number;
  impact: number;
  status?: RiskStatus;
  mitigation_strategy?: string;
  related_tasks?: UUID[];
}): Risk {
  // 计算风险级别
  const riskScore = params.likelihood * params.impact;
  let riskLevel: RiskLevel = 'low';
  
  if (riskScore >= 0.7) {
    riskLevel = 'critical';
  } else if (riskScore >= 0.5) {
    riskLevel = 'high';
  } else if (riskScore >= 0.3) {
    riskLevel = 'medium';
  }
  
  return {
    risk_id: params.risk_id,
    name: params.name,
    description: params.description,
    category: params.category,
    likelihood: params.likelihood,
    impact: params.impact,
    risk_level: riskLevel,
    status: params.status || 'identified',
    mitigation_strategy: params.mitigation_strategy,
    related_tasks: params.related_tasks
  };
}

/**
 * 创建RiskAssessment值对象
 */
export function createRiskAssessment(params: {
  risks: Risk[];
  last_assessed?: Timestamp;
}): RiskAssessment {
  // 计算整体风险级别
  const overallRiskLevel = calculateOverallRiskLevel(params.risks);
  
  return {
    overall_risk_level: overallRiskLevel,
    risks: params.risks,
    last_assessed: params.last_assessed || new Date().toISOString()
  };
}

/**
 * 计算整体风险级别
 * @param risks 风险列表
 * @returns 整体风险级别
 */
export function calculateOverallRiskLevel(risks: Risk[]): RiskLevel {
  if (risks.length === 0) {
    return 'low';
  }
  
  // 检查是否有关键风险
  if (risks.some(risk => risk.risk_level === 'critical')) {
    return 'critical';
  }
  
  // 检查是否有高风险
  if (risks.some(risk => risk.risk_level === 'high')) {
    return 'high';
  }
  
  // 检查是否有中等风险
  if (risks.some(risk => risk.risk_level === 'medium')) {
    return 'medium';
  }
  
  // 默认为低风险
  return 'low';
}

/**
 * 添加风险到评估
 * @param assessment 风险评估
 * @param risk 风险
 * @returns 更新后的风险评估
 */
export function addRisk(assessment: RiskAssessment, risk: Risk): RiskAssessment {
  const updatedRisks = [...assessment.risks, risk];
  const overallRiskLevel = calculateOverallRiskLevel(updatedRisks);
  
  return {
    overall_risk_level: overallRiskLevel,
    risks: updatedRisks,
    last_assessed: new Date().toISOString()
  };
}

/**
 * 更新风险状态
 * @param assessment 风险评估
 * @param riskId 风险ID
 * @param newStatus 新状态
 * @returns 更新后的风险评估
 */
export function updateRiskStatus(
  assessment: RiskAssessment,
  riskId: UUID,
  newStatus: RiskStatus
): RiskAssessment {
  const updatedRisks = assessment.risks.map(risk => 
    risk.risk_id === riskId ? { ...risk, status: newStatus } : risk
  );
  
  return {
    ...assessment,
    risks: updatedRisks,
    last_assessed: new Date().toISOString()
  };
}

/**
 * 添加风险缓解策略
 * @param assessment 风险评估
 * @param riskId 风险ID
 * @param strategy 缓解策略
 * @returns 更新后的风险评估
 */
export function addMitigationStrategy(
  assessment: RiskAssessment,
  riskId: UUID,
  strategy: string
): RiskAssessment {
  const updatedRisks = assessment.risks.map(risk => 
    risk.risk_id === riskId ? { ...risk, mitigation_strategy: strategy } : risk
  );
  
  return {
    ...assessment,
    risks: updatedRisks,
    last_assessed: new Date().toISOString()
  };
}

/**
 * 获取特定类别的风险
 * @param assessment 风险评估
 * @param category 风险类别
 * @returns 风险列表
 */
export function getRisksByCategory(assessment: RiskAssessment, category: RiskCategory): Risk[] {
  return assessment.risks.filter(risk => risk.category === category);
}

/**
 * 获取特定级别的风险
 * @param assessment 风险评估
 * @param level 风险级别
 * @returns 风险列表
 */
export function getRisksByLevel(assessment: RiskAssessment, level: RiskLevel): Risk[] {
  return assessment.risks.filter(risk => risk.risk_level === level);
}

/**
 * 获取特定状态的风险
 * @param assessment 风险评估
 * @param status 风险状态
 * @returns 风险列表
 */
export function getRisksByStatus(assessment: RiskAssessment, status: RiskStatus): Risk[] {
  return assessment.risks.filter(risk => risk.status === status);
}

/**
 * 获取与特定任务相关的风险
 * @param assessment 风险评估
 * @param taskId 任务ID
 * @returns 风险列表
 */
export function getRisksForTask(assessment: RiskAssessment, taskId: UUID): Risk[] {
  return assessment.risks.filter(risk => 
    risk.related_tasks && risk.related_tasks.includes(taskId)
  );
} 