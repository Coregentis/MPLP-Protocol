/**
 * @fileoverview UI Components - 用户界面组件库
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha UI设计模式
 */

// ===== 核心UI组件 =====
export { Canvas } from './Canvas';
export { Toolbar } from './Toolbar';
export { Sidebar } from './Sidebar';
export { PropertiesPanel } from './PropertiesPanel';
export { ThemeManager } from './ThemeManager';

// ===== 类型定义导出 =====
export type {
  // Canvas相关类型
  CanvasElement,
  CanvasConfig
} from './Canvas';

export type {
  // Toolbar相关类型
  ToolbarButton,
  ToolbarGroup,
  ToolbarConfig
} from './Toolbar';

export type {
  // Sidebar相关类型
  SidebarPanel,
  SidebarConfig
} from './Sidebar';

export type {
  // PropertiesPanel相关类型
  PropertyField,
  PropertyGroup,
  PropertiesPanelConfig
} from './PropertiesPanel';

export type {
  // ThemeManager相关类型
  Theme,
  ThemeManagerConfig
} from './ThemeManager';

// ===== UI组件工厂函数 =====
import { Canvas } from './Canvas';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { PropertiesPanel } from './PropertiesPanel';
import { ThemeManager } from './ThemeManager';
import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig } from '../types/studio';

/**
 * UI组件集合接口
 */
export interface UIComponents {
  canvas: Canvas;
  toolbar: Toolbar;
  leftSidebar: Sidebar;
  rightSidebar: Sidebar;
  propertiesPanel: PropertiesPanel;
  themeManager: ThemeManager;
}

/**
 * UI组件配置接口
 */
export interface UIComponentsConfig {
  canvas?: {
    width?: number;
    height?: number;
    showGrid?: boolean;
    snapToGrid?: boolean;
  };
  toolbar?: {
    position?: 'top' | 'bottom';
    showLabels?: boolean;
    showTooltips?: boolean;
  };
  leftSidebar?: {
    width?: number;
    collapsible?: boolean;
    resizable?: boolean;
  };
  rightSidebar?: {
    width?: number;
    collapsible?: boolean;
    resizable?: boolean;
  };
  propertiesPanel?: {
    width?: number;
    showDescriptions?: boolean;
    showValidationErrors?: boolean;
  };
  themeManager?: {
    defaultTheme?: string;
    autoDetectSystemTheme?: boolean;
    persistThemeChoice?: boolean;
  };
}

/**
 * 创建完整的UI组件集合
 * 
 * @param config - Studio配置
 * @param eventManager - 事件管理器
 * @param uiConfig - UI组件配置
 * @returns UI组件集合
 */
export function createUIComponents(
  config: StudioConfig,
  eventManager: MPLPEventManager,
  uiConfig: UIComponentsConfig = {}
): UIComponents {
  // 创建Canvas组件
  const canvas = new Canvas(config, eventManager);
  if (uiConfig.canvas) {
    canvas.updateCanvasConfig(uiConfig.canvas);
  }

  // 创建Toolbar组件
  const toolbar = new Toolbar(config, eventManager);
  if (uiConfig.toolbar) {
    toolbar.updateToolbarConfig(uiConfig.toolbar);
  }

  // 创建左侧边栏
  const leftSidebar = new Sidebar(config, eventManager, 'left');
  if (uiConfig.leftSidebar) {
    leftSidebar.updateSidebarConfig(uiConfig.leftSidebar);
  }

  // 创建右侧边栏
  const rightSidebar = new Sidebar(config, eventManager, 'right');
  if (uiConfig.rightSidebar) {
    rightSidebar.updateSidebarConfig(uiConfig.rightSidebar);
  }

  // 创建属性面板
  const propertiesPanel = new PropertiesPanel(config, eventManager);
  if (uiConfig.propertiesPanel) {
    propertiesPanel.updatePanelConfig(uiConfig.propertiesPanel);
  }

  // 创建主题管理器
  const themeManager = new ThemeManager(config, eventManager);
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
export async function initializeUIComponents(components: UIComponents): Promise<void> {
  try {
    // 按顺序初始化组件
    await components.themeManager.initialize(); // 首先初始化主题管理器
    await components.toolbar.initialize();
    await components.leftSidebar.initialize();
    await components.rightSidebar.initialize();
    await components.propertiesPanel.initialize();
    await components.canvas.initialize(); // 最后初始化Canvas
    
    console.log('✅ All UI components initialized successfully');
  } catch (error) {
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
export async function shutdownUIComponents(components: UIComponents): Promise<void> {
  try {
    // 按相反顺序关闭组件
    await components.canvas.shutdown();
    await components.propertiesPanel.shutdown();
    await components.rightSidebar.shutdown();
    await components.leftSidebar.shutdown();
    await components.toolbar.shutdown();
    await components.themeManager.shutdown();
    
    console.log('✅ All UI components shut down successfully');
  } catch (error) {
    console.error('❌ Failed to shutdown UI components:', error);
    throw error;
  }
}

/**
 * 设置UI组件之间的事件连接
 * 
 * @param components - UI组件集合
 */
export function setupUIComponentConnections(components: UIComponents): void {
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
export async function createCompleteUISystem(
  config: StudioConfig,
  eventManager: MPLPEventManager,
  uiConfig: UIComponentsConfig = {}
): Promise<UIComponents> {
  // 创建UI组件
  const components = createUIComponents(config, eventManager, uiConfig);
  
  // 设置组件连接
  setupUIComponentConnections(components);
  
  // 初始化所有组件
  await initializeUIComponents(components);
  
  return components;
}

// ===== 版本信息 =====
export const UI_VERSION = '1.1.0-beta';
export const UI_NAME = 'MPLP Studio UI Components';
export const UI_DESCRIPTION = 'Complete UI component library for MPLP Studio';

// ===== 组件状态信息 =====
export const UI_COMPONENT_STATUS = {
  canvas: 'completed',
  toolbar: 'completed', 
  sidebar: 'completed',
  propertiesPanel: 'completed',
  themeManager: 'completed',
  overall: '100% completed'
} as const;
