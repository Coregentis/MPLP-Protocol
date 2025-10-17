"use strict";
/**
 * @fileoverview MPLP Studio - 可视化开发环境
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STUDIO_MODULE_STATUS = exports.DEFAULT_STUDIO_CONFIG = exports.STUDIO_DESCRIPTION = exports.STUDIO_NAME = exports.STUDIO_VERSION = exports.WorkspaceManager = exports.ProjectManager = exports.StudioApplication = exports.MPLPEventManager = void 0;
exports.createStudioApplication = createStudioApplication;
exports.createDefaultStudioConfig = createDefaultStudioConfig;
exports.validateStudioConfig = validateStudioConfig;
exports.getStudioInfo = getStudioInfo;
// ===== 核心组件 - 已实现 =====
var MPLPEventManager_1 = require("./core/MPLPEventManager");
Object.defineProperty(exports, "MPLPEventManager", { enumerable: true, get: function () { return MPLPEventManager_1.MPLPEventManager; } });
var StudioApplication_1 = require("./core/StudioApplication");
Object.defineProperty(exports, "StudioApplication", { enumerable: true, get: function () { return StudioApplication_1.StudioApplication; } });
// ===== 管理器组件 - 已实现 =====
var ProjectManager_1 = require("./project/ProjectManager");
Object.defineProperty(exports, "ProjectManager", { enumerable: true, get: function () { return ProjectManager_1.ProjectManager; } });
var WorkspaceManager_1 = require("./workspace/WorkspaceManager");
Object.defineProperty(exports, "WorkspaceManager", { enumerable: true, get: function () { return WorkspaceManager_1.WorkspaceManager; } });
// ===== 版本信息 =====
exports.STUDIO_VERSION = '1.1.0-beta';
exports.STUDIO_NAME = 'MPLP Studio';
exports.STUDIO_DESCRIPTION = 'Visual Development Environment for MPLP';
exports.DEFAULT_STUDIO_CONFIG = {
    version: '1.1.0-beta',
    environment: 'development',
    server: {
        port: 3000,
        host: 'localhost',
        cors: {
            enabled: true,
            origins: ['http://localhost:3000']
        }
    },
    workspace: {
        defaultPath: './workspace',
        maxRecentFiles: 10,
        autoSave: true,
        autoSaveInterval: 30000
    },
    project: {
        defaultTemplate: 'basic',
        maxProjects: 50,
        backupEnabled: true,
        backupInterval: 300000
    },
    logging: {
        level: 'info',
        file: 'studio.log',
        console: true
    },
    performance: {
        enableMetrics: true,
        metricsInterval: 60000,
        maxMemoryUsage: 512 * 1024 * 1024 // 512MB
    }
};
// ===== 工厂函数 =====
/**
 * 创建Studio应用程序实例
 */
function createStudioApplication(config) {
    const { StudioApplication } = require('./core/StudioApplication');
    return new StudioApplication(config);
}
/**
 * 创建默认Studio配置
 */
function createDefaultStudioConfig(overrides) {
    return {
        ...exports.DEFAULT_STUDIO_CONFIG,
        ...overrides
    };
}
// ===== 实用工具 =====
/**
 * 验证Studio配置
 */
function validateStudioConfig(config) {
    const errors = [];
    if (config.server?.port && (config.server.port < 1 || config.server.port > 65535)) {
        errors.push('Server port must be between 1 and 65535');
    }
    if (config.workspace?.maxRecentFiles && config.workspace.maxRecentFiles < 1) {
        errors.push('Max recent files must be at least 1');
    }
    if (config.project?.maxProjects && config.project.maxProjects < 1) {
        errors.push('Max projects must be at least 1');
    }
    if (config.performance?.maxMemoryUsage && config.performance.maxMemoryUsage < 1024 * 1024) {
        errors.push('Max memory usage must be at least 1MB');
    }
    return errors;
}
/**
 * 获取Studio信息
 */
function getStudioInfo() {
    return {
        name: exports.STUDIO_NAME,
        version: exports.STUDIO_VERSION,
        description: exports.STUDIO_DESCRIPTION,
        basedOn: 'MPLP V1.0 Alpha',
        features: [
            'Visual Agent Builder',
            'Workflow Designer',
            'Project Management',
            'Workspace Management',
            'Real-time Collaboration',
            'Code Generation',
            'Debugging Tools',
            'Performance Monitoring'
        ],
        status: {
            implemented: [
                'Core Event System',
                'Studio Application',
                'Project Manager',
                'Workspace Manager',
                'Type Definitions'
            ],
            inProgress: [
                'Visual Builders',
                'Server Components',
                'UI Components'
            ],
            planned: [
                'Code Generation',
                'Debugging Tools',
                'Performance Monitoring',
                'Real-time Collaboration'
            ]
        }
    };
}
// ===== 模块状态 =====
exports.STUDIO_MODULE_STATUS = {
    core: {
        eventManager: 'completed',
        studioApplication: 'completed'
    },
    managers: {
        projectManager: 'completed',
        workspaceManager: 'completed'
    },
    types: {
        studioTypes: 'completed'
    },
    builders: {
        agentBuilder: 'planned',
        workflowDesigner: 'planned',
        componentLibrary: 'planned'
    },
    server: {
        studioServer: 'planned',
        apiRoutes: 'planned',
        socketHandlers: 'planned'
    },
    ui: {
        components: 'planned',
        layouts: 'planned',
        themes: 'planned'
    },
    tools: {
        codeGenerator: 'planned',
        debugger: 'planned',
        profiler: 'planned'
    }
};
// ===== 默认导出 =====
exports.default = {
    createStudioApplication,
    createDefaultStudioConfig,
    validateStudioConfig,
    getStudioInfo,
    STUDIO_VERSION: exports.STUDIO_VERSION,
    STUDIO_NAME: exports.STUDIO_NAME,
    STUDIO_DESCRIPTION: exports.STUDIO_DESCRIPTION,
    STUDIO_MODULE_STATUS: exports.STUDIO_MODULE_STATUS
};
//# sourceMappingURL=index.js.map