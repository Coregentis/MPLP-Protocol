/**
 * @fileoverview Studio Types - 基于MPLP V1.0 Alpha架构
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha协议和架构标准
 */

import { MPLPEventEmitter } from '../core/MPLPEventManager';

/**
 * Studio配置 - 基于MPLP V1.0 Alpha配置模式
 */
export interface StudioConfig {
  version: string;
  environment: 'development' | 'production' | 'test';
  server: {
    port: number;
    host: string;
    cors: {
      enabled: boolean;
      origins: string[];
    };
  };
  workspace: {
    defaultPath: string;
    maxRecentFiles: number;
    autoSave: boolean;
    autoSaveInterval: number;
  };
  project: {
    defaultTemplate: string;
    maxProjects: number;
    backupEnabled: boolean;
    backupInterval: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file: string;
    console: boolean;
  };
  performance: {
    enableMetrics: boolean;
    metricsInterval: number;
    maxMemoryUsage: number;
  };
}

/**
 * Studio状态 - 基于MPLP V1.0 Alpha状态管理模式
 */
export interface StudioState {
  isRunning: boolean;
  isInitialized: boolean;
  currentProject: Project | null;
  currentWorkspace: WorkspaceConfig | null;
  openProjects: Project[];
  recentFiles: string[];
  preferences: StudioPreferences;
  performance: {
    memoryUsage: number;
    cpuUsage: number;
    uptime: number;
  };
}

/**
 * Studio偏好设置
 */
export interface StudioPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  showMinimap: boolean;
  autoComplete: boolean;
  livePreview: boolean;
}

/**
 * 项目定义 - 基于MPLP V1.0 Alpha项目结构
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  template: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: ProjectMetadata;
  agents: Agent[];
  workflows: Workflow[];
  settings: ProjectSettings;
}

/**
 * 项目元数据
 */
export interface ProjectMetadata {
  author: string;
  tags: string[];
  category: string;
  license: string;
  repository?: string;
  documentation?: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

/**
 * 项目设置
 */
export interface ProjectSettings {
  buildTarget: 'node' | 'browser' | 'both';
  typescript: boolean;
  testing: {
    framework: 'jest' | 'mocha' | 'vitest';
    coverage: boolean;
    e2e: boolean;
  };
  linting: {
    enabled: boolean;
    rules: string;
  };
  formatting: {
    enabled: boolean;
    config: string;
  };
}

/**
 * Agent定义 - 基于MPLP V1.0 Alpha Agent架构
 */
export interface Agent {
  id: string;
  name: string;
  description?: string;
  type: 'simple' | 'complex' | 'coordinator';
  capabilities: string[];
  platforms: string[];
  config: AgentConfig;
  components: string[];
  status: 'draft' | 'active' | 'inactive' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Agent配置
 */
export interface AgentConfig {
  type?: 'simple' | 'complex' | 'coordinator';
  description?: string;
  capabilities?: string[];
  platforms?: string[];
  settings?: Record<string, any>;
  triggers?: string[];
  actions?: string[];
  maxConcurrency?: number;
  timeout?: number;
  retries?: number;
  errorHandling?: 'stop' | 'continue' | 'retry';
  logging?: {
    enabled: boolean;
    level: string;
  };
  monitoring?: {
    enabled: boolean;
    metrics: string[];
  };
}

/**
 * 工作流定义 - 基于MPLP V1.0 Alpha工作流架构
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  agents: string[];
  steps: string[];
  triggers: string[];
  config: WorkflowConfig;
  status: 'draft' | 'active' | 'inactive' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 工作流步骤
 */
export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'parallel' | 'loop';
  position: {
    x: number;
    y: number;
  };
  connections: {
    inputs: string[];
    outputs: string[];
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  config: Record<string, any>;
}

/**
 * 工作流触发器
 */
export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'scheduled' | 'event' | 'webhook';
  config: Record<string, any>;
  enabled: boolean;
}

/**
 * 工作流配置
 */
export interface WorkflowConfig {
  description?: string;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoff: 'linear' | 'exponential';
  };
  errorHandling?: 'stop' | 'continue' | 'rollback';
  parallel?: boolean;
  maxExecutionTime?: number;
  maxRetries?: number;
  notifications?: {
    onSuccess: boolean;
    onFailure: boolean;
    channels: string[];
  };
}

/**
 * 组件定义 - 基于MPLP V1.0 Alpha组件架构
 */
export interface Component {
  id: string;
  name: string;
  type: 'input' | 'output' | 'processor' | 'connector';
  category: string;
  description?: string;
  config: ComponentConfig;
  position: {
    x: number;
    y: number;
  };
  connections: Connection[];
}

/**
 * 组件配置
 */
export interface ComponentConfig {
  properties: Record<string, any>;
  validation: {
    required: string[];
    schema: Record<string, any>;
  };
  ui: {
    icon: string;
    color: string;
    size: 'small' | 'medium' | 'large';
  };
}

/**
 * 连接定义
 */
export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  sourcePort: string;
  targetPort: string;
  type: 'data' | 'control' | 'event';
}

/**
 * 工作空间配置 - 基于MPLP V1.0 Alpha工作空间模式
 */
export interface WorkspaceConfig {
  name: string;
  path: string;
  projects: string[];
  settings: WorkspaceSettings;
  recentFiles: RecentFile[];
  bookmarks: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 工作空间设置
 */
export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  showMinimap: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

/**
 * 最近文件
 */
export interface RecentFile {
  path: string;
  name: string;
  type: 'project' | 'agent' | 'workflow' | 'component';
  lastOpened: Date;
}

/**
 * Studio事件类型 - 基于MPLP V1.0 Alpha事件标准
 */
export type StudioEventType =
  | 'initialized'
  | 'shutdown'
  | 'error'
  | 'projectCreated'
  | 'projectOpened'
  | 'projectClosed'
  | 'projectSaved'
  | 'projectDeleted'
  | 'projectSwitched'
  | 'allProjectsSaved'
  | 'workspaceChanged'
  | 'workspaceCreated'
  | 'workspaceOpened'
  | 'workspaceSaved'
  | 'agentCreated'
  | 'agentUpdated'
  | 'agentDeleted'
  | 'workflowCreated'
  | 'workflowUpdated'
  | 'workflowDeleted'
  | 'componentAdded'
  | 'componentRemoved'
  | 'componentUpdated'
  | 'configUpdated'
  | 'stateChanged'
  | 'preferencesUpdated';

/**
 * Studio事件数据
 */
export interface StudioEventData {
  type: StudioEventType;
  timestamp: Date;
  source: string;
  data: Record<string, any>;
}

/**
 * Studio管理器接口 - 基于MPLP V1.0 Alpha管理器模式
 */
export interface IStudioManager extends MPLPEventEmitter {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getStatus(): string;
}
