"use strict";
/**
 * @fileoverview UI Components - 用户界面组件库
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha UI设计模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI_COMPONENT_STATUS = exports.UI_DESCRIPTION = exports.UI_NAME = exports.UI_VERSION = exports.ThemeManager = exports.PropertiesPanel = exports.Sidebar = exports.Toolbar = exports.Canvas = void 0;
exports.createUIComponents = createUIComponents;
exports.initializeUIComponents = initializeUIComponents;
exports.shutdownUIComponents = shutdownUIComponents;
exports.setupUIComponentConnections = setupUIComponentConnections;
exports.createCompleteUISystem = createCompleteUISystem;
// ===== 核心UI组件 =====
var Canvas_1 = require("./Canvas");
Object.defineProperty(exports, "Canvas", { enumerable: true, get: function () { return Canvas_1.Canvas; } });
var Toolbar_1 = require("./Toolbar");
Object.defineProperty(exports, "Toolbar", { enumerable: true, get: function () { return Toolbar_1.Toolbar; } });
var Sidebar_1 = require("./Sidebar");
Object.defineProperty(exports, "Sidebar", { enumerable: true, get: function () { return Sidebar_1.Sidebar; } });
var PropertiesPanel_1 = require("./PropertiesPanel");
Object.defineProperty(exports, "PropertiesPanel", { enumerable: true, get: function () { return PropertiesPanel_1.PropertiesPanel; } });
var ThemeManager_1 = require("./ThemeManager");
Object.defineProperty(exports, "ThemeManager", { enumerable: true, get: function () { return ThemeManager_1.ThemeManager; } });
// ===== UI组件工厂函数 =====
const Canvas_2 = require("./Canvas");
const Toolbar_2 = require("./Toolbar");
const Sidebar_2 = require("./Sidebar");
const PropertiesPanel_2 = require("./PropertiesPanel");
const ThemeManager_2 = require("./ThemeManager");
/**
 * 创建完整的UI组件集合
 *
 * @param config - Studio配置
 * @param eventManager - 事件管理器
 * @param uiConfig - UI组件配置
 * @returns UI组件集合
 */
function createUIComponents(config, eventManager, uiConfig = {}) {
    // 创建Canvas组件
    const canvas = new Canvas_2.Canvas(config, eventManager);
    if (uiConfig.canvas) {
        canvas.updateCanvasConfig(uiConfig.canvas);
    }
    // 创建Toolbar组件
    const toolbar = new Toolbar_2.Toolbar(config, eventManager);
    if (uiConfig.toolbar) {
        toolbar.updateToolbarConfig(uiConfig.toolbar);
    }
    // 创建左侧边栏
    const leftSidebar = new Sidebar_2.Sidebar(config, eventManager, 'left');
    if (uiConfig.leftSidebar) {
        leftSidebar.updateSidebarConfig(uiConfig.leftSidebar);
    }
    // 创建右侧边栏
    const rightSidebar = new Sidebar_2.Sidebar(config, eventManager, 'right');
    if (uiConfig.rightSidebar) {
        rightSidebar.updateSidebarConfig(uiConfig.rightSidebar);
    }
    // 创建属性面板
    const propertiesPanel = new PropertiesPanel_2.PropertiesPanel(config, eventManager);
    if (uiConfig.propertiesPanel) {
        propertiesPanel.updatePanelConfig(uiConfig.propertiesPanel);
    }
    // 创建主题管理器
    const themeManager = new ThemeManager_2.ThemeManager(config, eventManager);
    if (uiConfig.themeManager) {
        themeManager.updateThemeConfig(uiConfig.themeManager);
    }
    return {
        canvas,
        toolbar,
        leftSidebar,
        rightSidebar,
        propertiesPanel,
        themeManager
    };
}
/**
 * 初始化所有UI组件
 *
 * @param components - UI组件集合
 * @returns Promise<void>
 */
async function initializeUIComponents(components) {
    try {
        // 按顺序初始化组件
        await components.themeManager.initialize(); // 首先初始化主题管理器
        await components.toolbar.initialize();
        await components.leftSidebar.initialize();
        await components.rightSidebar.initialize();
        await components.propertiesPanel.initialize();
        await components.canvas.initialize(); // 最后初始化Canvas
        console.log('✅ All UI components initialized successfully');
    }
    catch (error) {
        console.error('❌ Failed to initialize UI components:', error);
        throw error;
    }
}
/**
 * 关闭所有UI组件
 *
 * @param components - UI组件集合
 * @returns Promise<void>
 */
async function shutdownUIComponents(components) {
    try {
        // 按相反顺序关闭组件
        await components.canvas.shutdown();
        await components.propertiesPanel.shutdown();
        await components.rightSidebar.shutdown();
        await components.leftSidebar.shutdown();
        await components.toolbar.shutdown();
        await components.themeManager.shutdown();
        console.log('✅ All UI components shut down successfully');
    }
    catch (error) {
        console.error('❌ Failed to shutdown UI components:', error);
        throw error;
    }
}
/**
 * 设置UI组件之间的事件连接
 *
 * @param components - UI组件集合
 */
function setupUIComponentConnections(components) {
    // Canvas和PropertiesPanel的连接
    components.canvas.on('canvas:elementSelected', (data) => {
        components.propertiesPanel.setTarget(data);
    });
    components.canvas.on('canvas:selectionCleared', () => {
        components.propertiesPanel.setTarget(null);
    });
    // Toolbar和其他组件的连接
    components.toolbar.on('toolbar:buttonClicked', (data) => {
        switch (data.action) {
            case 'view:zoom-in':
                const currentConfig = components.canvas.getCanvasConfig();
                components.canvas.updateCanvasConfig({
                    zoom: Math.min(currentConfig.maxZoom, currentConfig.zoom * 1.2)
                });
                break;
            case 'view:zoom-out':
                const currentConfig2 = components.canvas.getCanvasConfig();
                components.canvas.updateCanvasConfig({
                    zoom: Math.max(currentConfig2.minZoom, currentConfig2.zoom / 1.2)
                });
                break;
            case 'view:fit-to-screen':
                components.canvas.updateCanvasConfig({ zoom: 1.0 });
                break;
            // 可以添加更多工具栏操作
        }
    });
    // 主题管理器和其他组件的连接
    components.themeManager.on('theme:themeChanged', (data) => {
        // 通知所有组件主题已变化
        console.log(`Theme changed to: ${data.currentTheme}`);
    });
    console.log('✅ UI component connections established');
}
/**
 * 创建完整的UI系统
 *
 * @param config - Studio配置
 * @param eventManager - 事件管理器
 * @param uiConfig - UI组件配置
 * @returns Promise<UIComponents>
 */
async function createCompleteUISystem(config, eventManager, uiConfig = {}) {
    // 创建UI组件
    const components = createUIComponents(config, eventManager, uiConfig);
    // 设置组件连接
    setupUIComponentConnections(components);
    // 初始化所有组件
    await initializeUIComponents(components);
    return components;
}
// ===== 版本信息 =====
exports.UI_VERSION = '1.1.0-beta';
exports.UI_NAME = 'MPLP Studio UI Components';
exports.UI_DESCRIPTION = 'Complete UI component library for MPLP Studio';
// ===== 组件状态信息 =====
exports.UI_COMPONENT_STATUS = {
    canvas: 'completed',
    toolbar: 'completed',
    sidebar: 'completed',
    propertiesPanel: 'completed',
    themeManager: 'completed',
    overall: '100% completed'
};
//# sourceMappingURL=index.js.map