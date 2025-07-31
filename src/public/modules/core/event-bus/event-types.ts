/**
 * 事件类型定义
 * 
 * 定义系统中使用的所有事件类型
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

export enum EventType {
  // 依赖分析事件
  DEPENDENCY_ANALYSIS_STARTED = 'dependency_analysis_started',
  DEPENDENCY_ANALYSIS_COMPLETED = 'dependency_analysis_completed',
  DEPENDENCY_ANALYSIS_FAILED = 'dependency_analysis_failed',
  
  // 依赖图生成事件
  DEPENDENCY_GRAPH_GENERATED = 'dependency_graph_generated',
  DEPENDENCY_GRAPH_VALIDATION_COMPLETED = 'dependency_graph_validation_completed',
  
  // 模块事件
  MODULE_LOADED = 'module_loaded',
  MODULE_UNLOADED = 'module_unloaded',
  MODULE_ERROR = 'module_error',
  
  // 架构验证事件
  ARCHITECTURE_VALIDATION_STARTED = 'architecture_validation_started',
  ARCHITECTURE_VALIDATION_COMPLETED = 'architecture_validation_completed',
  
  // 测试事件
  TEST_STARTED = 'test_started',
  TEST_COMPLETED = 'test_completed',
  TEST_FAILED = 'test_failed',
  
  // 性能事件
  PERFORMANCE_METRIC_RECORDED = 'performance_metric_recorded',
  PERFORMANCE_THRESHOLD_EXCEEDED = 'performance_threshold_exceeded'
}

export interface DependencyAnalysisStartedEventData {
  analysisId: string;
  rootDir: string;
  timestamp: string;
}

export interface DependencyAnalysisCompletedEventData {
  analysisId: string;
  nodeCount: number;
  relationCount: number;
  duration: number;
  timestamp: string;
}

export interface DependencyGraphGeneratedEventData {
  graphId: string;
  nodeCount: number;
  relationCount: number;
  isValid: boolean;
  timestamp: string;
}

export interface ModuleLoadedEventData {
  moduleName: string;
  version: string;
  timestamp: string;
}

export interface PerformanceMetricEventData {
  metricName: string;
  value: number;
  unit: string;
  timestamp: string;
  context?: Record<string, any>;
}
