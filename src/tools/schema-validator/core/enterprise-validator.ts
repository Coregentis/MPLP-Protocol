/**
 * MPLP Schema Enterprise Feature Validator
 * 
 * @description 企业级功能验证器实现
 * @version 1.1.0
 * @created 2025-08-14
 * @updated 基于MPLP v1.0企业级增强成功实践
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  EnterpriseFeatureValidationResult,
  EnterpriseFeatureIssue,
  SpecializationIssue,
  EnterpriseFeatureSummary,
  EnterpriseFeatureName,
  EnterpriseFeatureDefinition,
  EnterpriseValidationRule,
  SpecializationValidationResult,
  SpecializationDetail
} from '../types';

export class EnterpriseFeatureValidator {
  private readonly enterpriseFeatures: EnterpriseFeatureDefinition[] = [
    {
      name: 'audit_trail',
      requiredFields: ['enabled', 'retention_days', 'audit_events', 'compliance_settings'],
      requiredStructure: {
        enabled: 'boolean',
        retention_days: 'integer',
        audit_events: 'array',
        compliance_settings: 'object'
      },
      specializationFields: ['[module]_operation', '[module]_details', '[module]_audit_level', '[module]_data_logging'],
      validationRules: [
        {
          ruleName: 'retention_days_range',
          ruleType: 'field_type',
          fieldPath: 'audit_trail.retention_days',
          expectedValue: { minimum: 1, maximum: 2555 },
          errorMessage: 'retention_days must be between 1 and 2555',
          severity: 'error'
        },
        {
          ruleName: 'gdpr_compliance',
          ruleType: 'required_field',
          fieldPath: 'audit_trail.compliance_settings.gdpr_enabled',
          errorMessage: 'GDPR compliance setting is required',
          severity: 'error'
        }
      ]
    },
    {
      name: 'performance_metrics',
      requiredFields: ['enabled', 'collection_interval_seconds', 'metrics', 'health_status', 'alerting'],
      requiredStructure: {
        enabled: 'boolean',
        collection_interval_seconds: 'integer',
        metrics: 'object',
        health_status: 'object',
        alerting: 'object'
      },
      specializationFields: ['[module]_[specialization]_latency_ms', '[module]_[specialization]_efficiency_score'],
      validationRules: [
        {
          ruleName: 'collection_interval_range',
          ruleType: 'field_type',
          fieldPath: 'performance_metrics.collection_interval_seconds',
          expectedValue: { minimum: 10, maximum: 3600 },
          errorMessage: 'collection_interval_seconds must be between 10 and 3600',
          severity: 'error'
        }
      ]
    },
    {
      name: 'monitoring_integration',
      requiredFields: ['enabled', 'supported_providers'],
      requiredStructure: {
        enabled: 'boolean',
        supported_providers: 'array'
      },
      specializationFields: [],
      validationRules: [
        {
          ruleName: 'supported_providers_required',
          ruleType: 'required_field',
          fieldPath: 'monitoring_integration.supported_providers',
          errorMessage: 'supported_providers array is required',
          severity: 'error'
        }
      ]
    },
    {
      name: 'version_history',
      requiredFields: ['enabled', 'max_versions'],
      requiredStructure: {
        enabled: 'boolean',
        max_versions: 'integer'
      },
      specializationFields: [],
      validationRules: [
        {
          ruleName: 'max_versions_standard',
          ruleType: 'field_type',
          fieldPath: 'version_history.max_versions',
          expectedValue: 50,
          errorMessage: 'max_versions should be 50 for standard compliance',
          severity: 'warning'
        }
      ]
    },
    {
      name: 'search_metadata',
      requiredFields: ['enabled', 'indexing_strategy'],
      requiredStructure: {
        enabled: 'boolean',
        indexing_strategy: 'string'
      },
      specializationFields: [],
      validationRules: []
    },
    {
      name: 'event_integration',
      requiredFields: ['enabled'],
      requiredStructure: {
        enabled: 'boolean'
      },
      specializationFields: [],
      validationRules: []
    }
  ];

  /**
   * 验证Schema的企业级功能完整性
   */
  async validateEnterpriseFeatures(schemaPath: string): Promise<EnterpriseFeatureValidationResult> {
    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaContent);
      
      const missingFeatures: string[] = [];
      const incompleteFeatures: EnterpriseFeatureIssue[] = [];
      const specializationIssues: SpecializationIssue[] = [];

      // 检查每个企业级功能
      for (const feature of this.enterpriseFeatures) {
        const featureResult = this.validateSingleFeature(schema, feature);
        
        if (!featureResult.exists) {
          missingFeatures.push(feature.name);
        } else if (!featureResult.isComplete) {
          incompleteFeatures.push(...featureResult.issues);
        }

        // 检查专业化特色
        const specializationResult = this.validateSpecialization(schema, feature, schemaPath);
        if (specializationResult.issues.length > 0) {
          specializationIssues.push(...specializationResult.issues);
        }
      }

      const summary: EnterpriseFeatureSummary = {
        totalFeatures: this.enterpriseFeatures.length,
        compliantFeatures: this.enterpriseFeatures.length - missingFeatures.length - incompleteFeatures.length,
        missingFeatures: missingFeatures.length,
        incompleteFeatures: incompleteFeatures.length,
        compliancePercentage: ((this.enterpriseFeatures.length - missingFeatures.length) / this.enterpriseFeatures.length) * 100,
        specializationScore: this.calculateSpecializationScore(specializationIssues)
      };

      return {
        isCompliant: missingFeatures.length === 0 && incompleteFeatures.length === 0,
        missingFeatures,
        incompleteFeatures,
        specializationIssues,
        summary
      };

    } catch (error) {
      throw new Error(`Failed to validate enterprise features: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 验证单个企业级功能
   */
  private validateSingleFeature(schema: any, feature: EnterpriseFeatureDefinition): {
    exists: boolean;
    isComplete: boolean;
    issues: EnterpriseFeatureIssue[];
  } {
    const issues: EnterpriseFeatureIssue[] = [];
    
    // 检查功能是否存在
    if (!schema.properties || !schema.properties[feature.name]) {
      return { exists: false, isComplete: false, issues: [] };
    }

    const featureSchema = schema.properties[feature.name];

    // 检查必需字段
    for (const requiredField of feature.requiredFields) {
      if (!featureSchema.properties || !featureSchema.properties[requiredField]) {
        issues.push({
          featureName: feature.name,
          issueType: 'missing_field',
          fieldPath: `${feature.name}.${requiredField}`,
          expectedValue: 'required field',
          actualValue: 'missing',
          severity: 'error',
          suggestion: `Add required field '${requiredField}' to ${feature.name}`
        });
      }
    }

    // 应用验证规则
    for (const rule of feature.validationRules) {
      const ruleResult = this.applyValidationRule(schema, rule);
      if (!ruleResult.isValid) {
        issues.push({
          featureName: feature.name,
          issueType: 'invalid_structure',
          fieldPath: rule.fieldPath,
          expectedValue: rule.expectedValue,
          actualValue: ruleResult.actualValue,
          severity: rule.severity,
          suggestion: rule.errorMessage
        });
      }
    }

    return {
      exists: true,
      isComplete: issues.length === 0,
      issues
    };
  }

  /**
   * 验证专业化特色
   */
  private validateSpecialization(schema: any, feature: EnterpriseFeatureDefinition, schemaPath: string): {
    issues: SpecializationIssue[];
  } {
    const issues: SpecializationIssue[] = [];
    const moduleName = this.extractModuleName(schemaPath);

    // 检查专业化字段
    if (feature.name === 'audit_trail') {
      // 检查主properties中的专业化字段
      const mainProperties = schema.properties;

      // 检查专业化操作字段
      const expectedOperationField = `${moduleName}_operation`;
      if (!mainProperties[expectedOperationField]) {
        issues.push({
          moduleName,
          issueType: 'missing_specialization',
          description: `Missing specialized operation field for ${moduleName} module`,
          expectedPattern: expectedOperationField,
          actualPattern: 'generic operation field',
          suggestions: [`Add '${expectedOperationField}' field to main properties`]
        });
      }

      // 检查专业化详情字段
      const expectedDetailsField = `${moduleName}_details`;
      if (!mainProperties[expectedDetailsField]) {
        issues.push({
          moduleName,
          issueType: 'missing_specialization',
          description: `Missing specialized details field for ${moduleName} module`,
          expectedPattern: expectedDetailsField,
          actualPattern: 'generic details field',
          suggestions: [`Add '${expectedDetailsField}' field to main properties`]
        });
      }
    }

    // 检查性能指标专业化
    if (feature.name === 'performance_metrics') {
      const performanceMetrics = schema.properties?.performance_metrics;
      if (performanceMetrics?.properties?.metrics?.properties) {
        const metricsProperties = performanceMetrics.properties.metrics.properties;
        
        // 检查是否有专业化指标
        const hasSpecializedMetrics = Object.keys(metricsProperties).some(key => 
          key.includes(`${moduleName}_`) || key.includes('_latency_ms') || key.includes('_efficiency_score')
        );

        if (!hasSpecializedMetrics) {
          issues.push({
            moduleName,
            issueType: 'missing_specialization',
            description: `Missing specialized performance metrics for ${moduleName} module`,
            expectedPattern: `${moduleName}_[specialization]_latency_ms, ${moduleName}_[specialization]_efficiency_score`,
            actualPattern: 'generic metrics only',
            suggestions: [
              `Add specialized latency metric: ${moduleName}_[specialization]_latency_ms`,
              `Add specialized efficiency metric: ${moduleName}_[specialization]_efficiency_score`
            ]
          });
        }
      }
    }

    return { issues };
  }

  /**
   * 应用验证规则
   */
  private applyValidationRule(schema: any, rule: EnterpriseValidationRule): {
    isValid: boolean;
    actualValue: any;
  } {
    const fieldPath = rule.fieldPath.split('.');
    let current = schema.properties;

    // 导航到字段位置
    for (const segment of fieldPath) {
      if (!current || !current[segment]) {
        return { isValid: false, actualValue: 'missing' };
      }
      current = current[segment].properties || current[segment];
    }

    // 应用验证逻辑
    if (rule.validationFunction) {
      return {
        isValid: rule.validationFunction(current, schema),
        actualValue: current
      };
    }

    // 默认验证逻辑
    if (rule.expectedValue !== undefined) {
      if (typeof rule.expectedValue === 'object' && rule.expectedValue.minimum !== undefined) {
        const value = current.minimum || current.value;
        return {
          isValid: value >= rule.expectedValue.minimum && value <= rule.expectedValue.maximum,
          actualValue: value
        };
      }
      
      return {
        isValid: current === rule.expectedValue || current.value === rule.expectedValue || current.default === rule.expectedValue,
        actualValue: current.value || current.default || current
      };
    }

    return { isValid: true, actualValue: current };
  }

  /**
   * 计算专业化评分
   */
  private calculateSpecializationScore(issues: SpecializationIssue[]): number {
    const maxScore = 100;
    const penaltyPerIssue = 10;
    return Math.max(0, maxScore - (issues.length * penaltyPerIssue));
  }

  /**
   * 从文件路径提取模块名称
   */
  private extractModuleName(schemaPath: string): string {
    const fileName = path.basename(schemaPath, '.json');
    return fileName.replace('mplp-', '').replace('-', '_');
  }
}
