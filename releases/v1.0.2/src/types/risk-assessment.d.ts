/**
 * 风险评估类型声明
 * 
 * 此文件扩展了RiskAssessment接口，确保overall_risk_level属性不为undefined
 * 
 * @version v1.0.0
 * @created 2025-07-31T18:00:00+08:00
 */

import { RiskAssessment, RiskLevel } from '../modules/confirm/types';

declare module '../modules/confirm/types' {
  interface RiskAssessment {
    // 确保overall_risk_level属性不为undefined
    overall_risk_level: RiskLevel;
  }
} 