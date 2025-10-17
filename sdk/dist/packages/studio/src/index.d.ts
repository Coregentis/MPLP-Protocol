/**
 * @fileoverview MPLP Studio - 可视化开发环境
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha架构
 */
export { MPLPEventManager, MPLPEvent, MPLPEventHandler, MPLPEventEmitter } from './core/MPLPEventManager';
export { StudioApplication } from './core/StudioApplication';
export { ProjectManager } from './project/ProjectManager';
export { WorkspaceManager } from './workspace/WorkspaceManager';
export type { StudioConfig, StudioState, StudioPreferences, IStudioManager, Project, ProjectMetadata, ProjectSettings, Agent, AgentConfig, Workflow, WorkflowStep, WorkflowTrigger, WorkflowConfig, Component, ComponentConfig, Connection, WorkspaceConfig, WorkspaceSettings, RecentFile, StudioEventType, StudioEventData } from './types/studio';
export declare const STUDIO_VERSION = "1.1.0-beta";
export declare const STUDIO_NAME = "MPLP Studio";
export declare const STUDIO_DESCRIPTION = "Visual Development Environment for MPLP";
import type { StudioConfig } from './types/studio';
export declare const DEFAULT_STUDIO_CONFIG: Partial<StudioConfig>;
/**
 * 创建Studio应用程序实例
 */
export declare function createStudioApplication(config?: Partial<StudioConfig>): any;
/**
 * 创建默认Studio配置
 */
export declare function createDefaultStudioConfig(overrides?: Partial<StudioConfig>): StudioConfig;
/**
 * 验证Studio配置
 */
export declare function validateStudioConfig(config: Partial<StudioConfig>): string[];
/**
 * 获取Studio信息
 */
export declare function getStudioInfo(): {
    name: string;
    version: string;
    description: string;
    basedOn: string;
    features: string[];
    status: {
        implemented: string[];
        inProgress: string[];
        planned: string[];
    };
};
export declare const STUDIO_MODULE_STATUS: {
    readonly core: {
        readonly eventManager: "completed";
        readonly studioApplication: "completed";
    };
    readonly managers: {
        readonly projectManager: "completed";
        readonly workspaceManager: "completed";
    };
    readonly types: {
        readonly studioTypes: "completed";
    };
    readonly builders: {
        readonly agentBuilder: "planned";
        readonly workflowDesigner: "planned";
        readonly componentLibrary: "planned";
    };
    readonly server: {
        readonly studioServer: "planned";
        readonly apiRoutes: "planned";
        readonly socketHandlers: "planned";
    };
    readonly ui: {
        readonly components: "planned";
        readonly layouts: "planned";
        readonly themes: "planned";
    };
    readonly tools: {
        readonly codeGenerator: "planned";
        readonly debugger: "planned";
        readonly profiler: "planned";
    };
};
declare const _default: {
    createStudioApplication: typeof createStudioApplication;
    createDefaultStudioConfig: typeof createDefaultStudioConfig;
    validateStudioConfig: typeof validateStudioConfig;
    getStudioInfo: typeof getStudioInfo;
    STUDIO_VERSION: string;
    STUDIO_NAME: string;
    STUDIO_DESCRIPTION: string;
    STUDIO_MODULE_STATUS: {
        readonly core: {
            readonly eventManager: "completed";
            readonly studioApplication: "completed";
        };
        readonly managers: {
            readonly projectManager: "completed";
            readonly workspaceManager: "completed";
        };
        readonly types: {
            readonly studioTypes: "completed";
        };
        readonly builders: {
            readonly agentBuilder: "planned";
            readonly workflowDesigner: "planned";
            readonly componentLibrary: "planned";
        };
        readonly server: {
            readonly studioServer: "planned";
            readonly apiRoutes: "planned";
            readonly socketHandlers: "planned";
        };
        readonly ui: {
            readonly components: "planned";
            readonly layouts: "planned";
            readonly themes: "planned";
        };
        readonly tools: {
            readonly codeGenerator: "planned";
            readonly debugger: "planned";
            readonly profiler: "planned";
        };
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map