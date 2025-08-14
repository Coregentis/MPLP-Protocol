/**
 * MPLP Schema Validator Types
 *
 * @description 协议验证工具的类型定义
 * @version 1.1.0
 * @standardized MPLP协议验证工具标准化规范 v1.1.0
 * @updated 2025-08-14 - 添加企业级功能验证支持
 */

// ===== 基础类型定义 =====

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: ValidationMetadata;
}

export interface ValidationError {
  errorId: string;
  errorCode: string;
  errorType: 'syntax' | 'semantic' | 'compatibility' | 'reference' | 'enterprise' | 'naming';
  message: string;
  details: string;
  location: ErrorLocation;
  severity: 'error' | 'critical';
  suggestions: string[];
}

export interface ValidationWarning {
  warningId: string;
  warningCode: string;
  warningType: 'deprecation' | 'performance' | 'best_practice' | 'style' | 'enterprise' | 'specialization';
  message: string;
  details: string;
  location: ErrorLocation;
  severity: 'warning' | 'info';
  suggestions: string[];
}

export interface ErrorLocation {
  schemaFile: string;
  jsonPath: string;
  lineNumber?: number;
  columnNumber?: number;
  context: string;
}

export interface ValidationMetadata {
  validatorVersion: string;
  validationTimestamp: string;
  totalSchemasChecked: number;
  validationDurationMs: number;
  rulesApplied: string[];
}

// ===== Schema相关类型 =====

export interface SchemaInfo {
  schemaId: string;
  schemaName: string;
  schemaVersion: string;
  filePath: string;
  moduleType: ModuleType;
  dependencies: string[];
  size: number;
  lastModified: string;
}

export type ModuleType = 
  | 'core' | 'context' | 'plan' | 'confirm' | 'trace' | 'role' 
  | 'extension' | 'collab' | 'dialog' | 'network'
  | 'coordination' | 'orchestration' | 'transaction' 
  | 'eventBus' | 'stateSync' | 'protocolVersion' 
  | 'errorHandling' | 'security' | 'performance';

export interface SchemaCompatibilityMatrix {
  matrixVersion: string;
  compatibilityRules: CompatibilityRule[];
  lastUpdated: string;
}

export interface CompatibilityRule {
  sourceSchema: string;
  targetSchema: string;
  compatibilityLevel: 'compatible' | 'deprecated' | 'breaking' | 'experimental';
  requiredVersion: string;
  notes: string;
}

// ===== 验证器配置类型 =====

export interface ValidatorConfig {
  strictMode: boolean;
  enableWarnings: boolean;
  customRules: CustomRule[];
  ignoredSchemas: string[];
  outputFormat: 'json' | 'text' | 'junit' | 'html';
  verboseOutput: boolean;
  failOnWarnings: boolean;
}

export interface CustomRule {
  ruleId: string;
  ruleName: string;
  ruleType: 'syntax' | 'semantic' | 'compatibility' | 'style';
  enabled: boolean;
  severity: 'error' | 'warning' | 'info';
  configuration: Record<string, unknown>;
}

// ===== CLI相关类型 =====

export interface CliOptions {
  command: 'check-syntax' | 'check-compatibility' | 'validate' | 'generate-docs';
  schemaPath?: string;
  configPath?: string;
  outputPath?: string;
  format?: 'json' | 'text' | 'junit' | 'html';
  verbose?: boolean;
  strict?: boolean;
  fix?: boolean;
}

export interface CliResult {
  success: boolean;
  exitCode: number;
  message: string;
  results: ValidationResult[];
  summary: ValidationSummary;
}

export interface ValidationSummary {
  totalSchemas: number;
  validSchemas: number;
  invalidSchemas: number;
  totalErrors: number;
  totalWarnings: number;
  criticalErrors: number;
  executionTimeMs: number;
}

// ===== 数据验证类型 =====

export interface DataValidationRequest {
  schemaName: string;
  data: unknown;
  validationOptions: DataValidationOptions;
}

export interface DataValidationOptions {
  strictMode: boolean;
  allowAdditionalProperties: boolean;
  validateReferences: boolean;
  customValidators: Record<string, (value: unknown) => boolean>;
}

export interface DataValidationResult {
  isValid: boolean;
  validatedData: unknown;
  errors: DataValidationError[];
  warnings: DataValidationWarning[];
  metadata: DataValidationMetadata;
}

export interface DataValidationError {
  errorPath: string;
  errorMessage: string;
  expectedType: string;
  actualType: string;
  value: unknown;
  constraint: string;
}

export interface DataValidationWarning {
  warningPath: string;
  warningMessage: string;
  suggestion: string;
}

export interface DataValidationMetadata {
  schemaUsed: string;
  validationRules: number;
  validationTimeMs: number;
  dataSize: number;
}

// ===== 工厂和服务类型 =====

export interface SchemaValidatorFactory {
  createSyntaxValidator(): SyntaxValidator;
  createCompatibilityValidator(): CompatibilityValidator;
  createDataValidator(): DataValidator;
  createReportGenerator(): ReportGenerator;
}

export interface SyntaxValidator {
  validateSchema(schemaPath: string): Promise<ValidationResult>;
  validateAllSchemas(): Promise<ValidationResult[]>;
  validateSchemaContent(content: string, schemaName: string): Promise<ValidationResult>;
}

export interface CompatibilityValidator {
  checkCompatibility(sourceSchema: string, targetSchema: string): Promise<ValidationResult>;
  validateCompatibilityMatrix(): Promise<ValidationResult>;
  generateCompatibilityReport(): Promise<CompatibilityReport>;
}

export interface DataValidator {
  validateData(request: DataValidationRequest): Promise<DataValidationResult>;
  validateBatch(requests: DataValidationRequest[]): Promise<DataValidationResult[]>;
  createValidator(schemaName: string): (data: unknown) => DataValidationResult;
}

export interface ReportGenerator {
  generateTextReport(results: ValidationResult[]): string;
  generateJsonReport(results: ValidationResult[]): string;
  generateHtmlReport(results: ValidationResult[]): string;
  generateJunitReport(results: ValidationResult[]): string;
}

export interface CompatibilityReport {
  reportId: string;
  generatedAt: string;
  totalCompatibilityChecks: number;
  compatiblePairs: number;
  incompatiblePairs: number;
  deprecatedPairs: number;
  details: CompatibilityDetail[];
}

export interface CompatibilityDetail {
  sourceSchema: string;
  targetSchema: string;
  status: 'compatible' | 'incompatible' | 'deprecated' | 'unknown';
  issues: string[];
  recommendations: string[];
}

// ===== 企业级功能验证类型 =====

export interface EnterpriseFeatureValidationResult {
  isCompliant: boolean;
  missingFeatures: string[];
  incompleteFeatures: EnterpriseFeatureIssue[];
  specializationIssues: SpecializationIssue[];
  summary: EnterpriseFeatureSummary;
}

export interface EnterpriseFeatureIssue {
  featureName: string;
  issueType: 'missing_field' | 'invalid_type' | 'missing_enum' | 'invalid_structure';
  fieldPath: string;
  expectedValue: any;
  actualValue: any;
  severity: 'error' | 'warning';
  suggestion: string;
}

export interface SpecializationIssue {
  moduleName: string;
  issueType: 'missing_specialization' | 'generic_naming' | 'insufficient_events' | 'missing_metrics';
  description: string;
  expectedPattern: string;
  actualPattern: string;
  suggestions: string[];
}

export interface EnterpriseFeatureSummary {
  totalFeatures: number;
  compliantFeatures: number;
  missingFeatures: number;
  incompleteFeatures: number;
  compliancePercentage: number;
  specializationScore: number;
}

export type EnterpriseFeatureName =
  | 'audit_trail'
  | 'performance_metrics'
  | 'monitoring_integration'
  | 'version_history'
  | 'search_metadata'
  | 'event_integration';

export interface EnterpriseFeatureDefinition {
  name: EnterpriseFeatureName;
  requiredFields: string[];
  requiredStructure: Record<string, any>;
  specializationFields: string[];
  validationRules: EnterpriseValidationRule[];
}

export interface EnterpriseValidationRule {
  ruleName: string;
  ruleType: 'required_field' | 'field_type' | 'enum_values' | 'structure' | 'specialization';
  fieldPath: string;
  expectedValue?: any;
  validationFunction?: (value: any, context: any) => boolean;
  errorMessage: string;
  severity: 'error' | 'warning';
}

// ===== 双重命名约定验证类型 =====

export interface NamingConventionValidationResult {
  isCompliant: boolean;
  violations: NamingViolation[];
  summary: NamingConventionSummary;
}

export interface NamingViolation {
  fieldPath: string;
  fieldName: string;
  violationType: 'wrong_case' | 'mixed_convention' | 'invalid_pattern';
  expectedNaming: string;
  actualNaming: string;
  layer: 'schema' | 'typescript';
  severity: 'error' | 'warning';
  suggestion: string;
}

export interface NamingConventionSummary {
  totalFields: number;
  compliantFields: number;
  violationCount: number;
  compliancePercentage: number;
  layerCompliance: {
    schema: number;
    typescript: number;
  };
}

// ===== 专业化特色验证类型 =====

export interface SpecializationValidationResult {
  hasSpecialization: boolean;
  specializationScore: number;
  missingSpecializations: string[];
  specializationDetails: SpecializationDetail[];
  recommendations: string[];
}

export interface SpecializationDetail {
  category: 'events' | 'metrics' | 'fields' | 'health_status' | 'thresholds';
  hasSpecialization: boolean;
  specializationLevel: 'none' | 'basic' | 'advanced' | 'expert';
  examples: string[];
  suggestions: string[];
}
