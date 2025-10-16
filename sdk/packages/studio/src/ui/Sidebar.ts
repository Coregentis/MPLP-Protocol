/**
 * @fileoverview Sidebar - 侧边栏组件
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha侧边栏设计模式
 */

import { MPLPEventManager } from '../core/MPLPEventManager';
import { StudioConfig, IStudioManager } from '../types/studio';

/**
 * 侧边栏面板接口
 */
export interface SidebarPanel {
  id: string;
  title: string;
  icon: string;
  content: string | HTMLElement;
  active: boolean;
  visible: boolean;
  resizable: boolean;
  collapsible: boolean;
  position: number; // 排序位置
  minHeight?: number;
  maxHeight?: number;
  defaultHeight?: number;
}

/**
 * 侧边栏配置接口
 */
export interface SidebarConfig {
  position: 'left' | 'right';
  width: number;
  minWidth: number;
  maxWidth: number;
  backgroundColor: string;
  borderColor: string;
  collapsible: boolean;
  resizable: boolean;
  showTabs: boolean;
  tabHeight: number;
  panelSpacing: number;
}

/**
 * Sidebar组件 - 基于MPLP V1.0 Alpha侧边栏设计模式
 * 提供可定制的侧边栏和面板管理功能
 */
export class Sidebar implements IStudioManager {
  private eventManager: MPLPEventManager;
  private config: StudioConfig;
  private _isInitialized = false;
  
  // 侧边栏状态
  private sidebarConfig: SidebarConfig;
  private panels = new Map<string, SidebarPanel>();
  private activePanel: string | null = null;
  private isCollapsed = false;
  
  // DOM元素
  private sidebarContainer: HTMLElement | null = null;
  private sidebarElement: HTMLElement | null = null;
  private tabsContainer: HTMLElement | null = null;
  private contentContainer: HTMLElement | null = null;
  private resizeHandle: HTMLElement | null = null;

  constructor(config: StudioConfig, eventManager: MPLPEventManager, position: 'left' | 'right' = 'left') {
    this.config = config;
    this.eventManager = eventManager;
    
    // 初始化侧边栏配置
    this.sidebarConfig = {
      position,
      width: 280,
      minWidth: 200,
      maxWidth: 600,
      backgroundColor: '#f8f9fa',
      borderColor: '#dee2e6',
      collapsible: true,
      resizable: true,
      showTabs: true,
      tabHeight: 40,
      panelSpacing: 8
    };
    
    // 初始化默认面板
    this.initializeDefaultPanels();
  }

  // ===== IStudioManager接口实现 =====

  /**
   * 获取状态
   */
  public getStatus(): string {
    return this._isInitialized ? 'initialized' : 'not_initialized';
  }

  /**
   * 初始化
   */
  public async initialize(): Promise<void> {
    if (this._isInitialized) {
      return;
    }

    try {
      // 创建侧边栏DOM结构
      this.createSidebarDOM();
      
      // 设置事件监听器
      this.setupEventListeners();
      
      // 渲染侧边栏
      this.render();
      
      // 激活第一个面板
      const firstPanel = Array.from(this.panels.values()).find(p => p.visible);
      if (firstPanel) {
        this.setActivePanel(firstPanel.id);
      }
      
      this._isInitialized = true;
      this.emitEvent('sidebarInitialized', { 
        sidebarId: `${this.sidebarConfig.position}-sidebar`,
        config: this.sidebarConfig 
      });
      
    } catch (error) {
      throw new Error(`Failed to initialize Sidebar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 关闭
   */
  public async shutdown(): Promise<void> {
    if (!this._isInitialized) {
      return;
    }

    try {
      // 清理事件监听器
      this.removeEventListeners();
      
      // 清理DOM元素
      if (this.sidebarContainer && this.sidebarContainer.parentNode) {
        this.sidebarContainer.parentNode.removeChild(this.sidebarContainer);
      }
      
      this._isInitialized = false;
      this.emitEvent('sidebarShutdown', { sidebarId: `${this.sidebarConfig.position}-sidebar` });
      
    } catch (error) {
      throw new Error(`Failed to shutdown Sidebar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===== EventEmitter接口实现 =====

  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  // ===== 私有辅助方法 =====

  /**
   * 发射事件
   */
  private emitEvent(eventType: string, data: any): void {
    this.eventManager.emit(`sidebar:${eventType}`, data);
  }

  /**
   * 初始化默认面板
   */
  private initializeDefaultPanels(): void {
    const defaultPanels: SidebarPanel[] = [
      {
        id: 'project-explorer',
        title: 'Project Explorer',
        icon: '📁',
        content: this.createProjectExplorerContent(),
        active: false,
        visible: true,
        resizable: true,
        collapsible: true,
        position: 1,
        defaultHeight: 300
      },
      {
        id: 'component-library',
        title: 'Component Library',
        icon: '🧩',
        content: this.createComponentLibraryContent(),
        active: false,
        visible: true,
        resizable: true,
        collapsible: true,
        position: 2,
        defaultHeight: 400
      },
      {
        id: 'properties',
        title: 'Properties',
        icon: '⚙️',
        content: this.createPropertiesContent(),
        active: false,
        visible: true,
        resizable: true,
        collapsible: true,
        position: 3,
        defaultHeight: 250
      },
      {
        id: 'outline',
        title: 'Outline',
        icon: '📋',
        content: this.createOutlineContent(),
        active: false,
        visible: true,
        resizable: true,
        collapsible: true,
        position: 4,
        defaultHeight: 200
      }
    ];

    defaultPanels.forEach(panel => {
      this.panels.set(panel.id, panel);
    });
  }

  /**
   * 创建项目浏览器内容
   */
  private createProjectExplorerContent(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'project-explorer-content';
    container.style.cssText = `
      padding: 12px;
      height: 100%;
      overflow-y: auto;
    `;

    // 创建项目树
    const tree = document.createElement('div');
    tree.className = 'project-tree';
    
    const projectItems = [
      { name: 'My Project', type: 'project', level: 0, expanded: true },
      { name: 'src', type: 'folder', level: 1, expanded: true },
      { name: 'agents', type: 'folder', level: 2, expanded: false },
      { name: 'workflows', type: 'folder', level: 2, expanded: false },
      { name: 'components', type: 'folder', level: 2, expanded: false },
      { name: 'config', type: 'folder', level: 1, expanded: false },
      { name: 'docs', type: 'folder', level: 1, expanded: false }
    ];

    projectItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'project-tree-item';
      itemElement.style.cssText = `
        display: flex;
        align-items: center;
        padding: 4px 8px;
        margin-left: ${item.level * 16}px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
        color: #495057;
      `;

      const icon = item.type === 'project' ? '📁' : item.type === 'folder' ? '📂' : '📄';
      itemElement.innerHTML = `${icon} ${item.name}`;

      itemElement.addEventListener('mouseenter', () => {
        itemElement.style.backgroundColor = '#e9ecef';
      });

      itemElement.addEventListener('mouseleave', () => {
        itemElement.style.backgroundColor = 'transparent';
      });

      tree.appendChild(itemElement);
    });

    container.appendChild(tree);
    return container;
  }

  /**
   * 创建组件库内容
   */
  private createComponentLibraryContent(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'component-library-content';
    container.style.cssText = `
      padding: 12px;
      height: 100%;
      overflow-y: auto;
    `;

    // 创建搜索框
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.placeholder = 'Search components...';
    searchBox.style.cssText = `
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
      margin-bottom: 12px;
    `;

    // 创建组件分类
    const categories = [
      { name: 'Inputs', components: ['Text Input', 'Number Input', 'Date Picker'] },
      { name: 'Processors', components: ['Data Filter', 'Transformer', 'Validator'] },
      { name: 'Outputs', components: ['Display', 'Chart', 'Export'] },
      { name: 'AI Components', components: ['LLM Processor', 'ML Model', 'NLP Analyzer'] }
    ];

    categories.forEach(category => {
      const categoryElement = document.createElement('div');
      categoryElement.className = 'component-category';
      categoryElement.style.cssText = `
        margin-bottom: 16px;
      `;

      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'category-header';
      categoryHeader.style.cssText = `
        font-weight: 600;
        font-size: 14px;
        color: #495057;
        margin-bottom: 8px;
        padding: 4px 0;
        border-bottom: 1px solid #e9ecef;
      `;
      categoryHeader.textContent = category.name;

      const componentsList = document.createElement('div');
      componentsList.className = 'components-list';

      category.components.forEach(component => {
        const componentElement = document.createElement('div');
        componentElement.className = 'component-item';
        componentElement.style.cssText = `
          padding: 6px 8px;
          margin: 2px 0;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          color: #6c757d;
          border: 1px solid transparent;
        `;
        componentElement.textContent = component;

        componentElement.addEventListener('mouseenter', () => {
          componentElement.style.backgroundColor = '#e3f2fd';
          componentElement.style.borderColor = '#2196f3';
        });

        componentElement.addEventListener('mouseleave', () => {
          componentElement.style.backgroundColor = 'transparent';
          componentElement.style.borderColor = 'transparent';
        });

        componentsList.appendChild(componentElement);
      });

      categoryElement.appendChild(categoryHeader);
      categoryElement.appendChild(componentsList);
      container.appendChild(categoryElement);
    });

    container.insertBefore(searchBox, container.firstChild);
    return container;
  }

  /**
   * 创建属性面板内容
   */
  private createPropertiesContent(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'properties-content';
    container.style.cssText = `
      padding: 12px;
      height: 100%;
      overflow-y: auto;
    `;

    const noSelectionMessage = document.createElement('div');
    noSelectionMessage.style.cssText = `
      text-align: center;
      color: #6c757d;
      font-size: 14px;
      margin-top: 40px;
    `;
    noSelectionMessage.textContent = 'Select an element to view properties';

    container.appendChild(noSelectionMessage);
    return container;
  }

  /**
   * 创建大纲内容
   */
  private createOutlineContent(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'outline-content';
    container.style.cssText = `
      padding: 12px;
      height: 100%;
      overflow-y: auto;
    `;

    const outlineItems = [
      { name: 'Main Workflow', type: 'workflow', level: 0 },
      { name: 'Input Agent', type: 'agent', level: 1 },
      { name: 'Processing Agent', type: 'agent', level: 1 },
      { name: 'Output Agent', type: 'agent', level: 1 },
      { name: 'Error Handler', type: 'component', level: 1 }
    ];

    outlineItems.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = 'outline-item';
      itemElement.style.cssText = `
        display: flex;
        align-items: center;
        padding: 4px 8px;
        margin-left: ${item.level * 16}px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
        color: #495057;
      `;

      const icon = item.type === 'workflow' ? '🔄' : item.type === 'agent' ? '🤖' : '🧩';
      itemElement.innerHTML = `${icon} ${item.name}`;

      itemElement.addEventListener('mouseenter', () => {
        itemElement.style.backgroundColor = '#e9ecef';
      });

      itemElement.addEventListener('mouseleave', () => {
        itemElement.style.backgroundColor = 'transparent';
      });

      container.appendChild(itemElement);
    });

    return container;
  }

  /**
   * 创建侧边栏DOM结构
   */
  private createSidebarDOM(): void {
    // 创建容器
    this.sidebarContainer = document.createElement('div');
    this.sidebarContainer.className = 'mplp-sidebar-container';
    this.sidebarContainer.style.cssText = `
      position: relative;
      width: ${this.sidebarConfig.width}px;
      height: 100%;
      background-color: ${this.sidebarConfig.backgroundColor};
      border-${this.sidebarConfig.position === 'left' ? 'right' : 'left'}: 1px solid ${this.sidebarConfig.borderColor};
      display: flex;
      flex-direction: column;
      user-select: none;
    `;

    // 创建标签容器
    if (this.sidebarConfig.showTabs) {
      this.tabsContainer = document.createElement('div');
      this.tabsContainer.className = 'mplp-sidebar-tabs';
      this.tabsContainer.style.cssText = `
        display: flex;
        height: ${this.sidebarConfig.tabHeight}px;
        border-bottom: 1px solid ${this.sidebarConfig.borderColor};
        background-color: #ffffff;
      `;
      this.sidebarContainer.appendChild(this.tabsContainer);
    }

    // 创建内容容器
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'mplp-sidebar-content';
    this.contentContainer.style.cssText = `
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;
    this.sidebarContainer.appendChild(this.contentContainer);

    // 创建调整大小手柄
    if (this.sidebarConfig.resizable) {
      this.resizeHandle = document.createElement('div');
      this.resizeHandle.className = 'mplp-sidebar-resize-handle';
      this.resizeHandle.style.cssText = `
        position: absolute;
        top: 0;
        ${this.sidebarConfig.position === 'left' ? 'right' : 'left'}: -3px;
        width: 6px;
        height: 100%;
        cursor: ew-resize;
        background-color: transparent;
        z-index: 1000;
      `;
      this.sidebarContainer.appendChild(this.resizeHandle);
    }

    // 添加到页面（这里假设有一个目标容器）
    const targetContainer = document.getElementById(`studio-${this.sidebarConfig.position}-sidebar-container`) || document.body;
    targetContainer.appendChild(this.sidebarContainer);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 调整大小事件
    if (this.resizeHandle) {
      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      this.resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = this.sidebarConfig.width;
        document.body.style.cursor = 'ew-resize';
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const deltaX = this.sidebarConfig.position === 'left' ? 
          e.clientX - startX : startX - e.clientX;
        const newWidth = Math.max(
          this.sidebarConfig.minWidth,
          Math.min(this.sidebarConfig.maxWidth, startWidth + deltaX)
        );

        this.sidebarConfig.width = newWidth;
        if (this.sidebarContainer) {
          this.sidebarContainer.style.width = `${newWidth}px`;
        }
      });

      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false;
          document.body.style.cursor = '';
          this.emitEvent('resized', { width: this.sidebarConfig.width });
        }
      });
    }
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    // 事件监听器在document上，会在页面卸载时自动清理
  }

  /**
   * 渲染侧边栏
   */
  private render(): void {
    this.renderTabs();
    this.renderContent();
  }

  /**
   * 渲染标签
   */
  private renderTabs(): void {
    if (!this.tabsContainer) return;

    // 清空标签容器
    this.tabsContainer.innerHTML = '';

    // 按位置排序面板
    const sortedPanels = Array.from(this.panels.values())
      .filter(panel => panel.visible)
      .sort((a, b) => a.position - b.position);

    // 创建标签
    sortedPanels.forEach(panel => {
      const tabElement = document.createElement('div');
      tabElement.className = 'mplp-sidebar-tab';
      tabElement.style.cssText = `
        display: flex;
        align-items: center;
        padding: 0 12px;
        height: 100%;
        cursor: pointer;
        border-right: 1px solid ${this.sidebarConfig.borderColor};
        background-color: ${panel.active ? '#f8f9fa' : 'transparent'};
        color: ${panel.active ? '#495057' : '#6c757d'};
        font-size: 13px;
        transition: all 0.2s ease;
      `;

      tabElement.innerHTML = `${panel.icon} ${panel.title}`;

      // 添加点击事件
      tabElement.addEventListener('click', () => {
        this.setActivePanel(panel.id);
      });

      // 添加悬停效果
      tabElement.addEventListener('mouseenter', () => {
        if (!panel.active) {
          tabElement.style.backgroundColor = '#e9ecef';
        }
      });

      tabElement.addEventListener('mouseleave', () => {
        if (!panel.active) {
          tabElement.style.backgroundColor = 'transparent';
        }
      });

      if (this.tabsContainer) {
        this.tabsContainer.appendChild(tabElement);
      }
    });
  }

  /**
   * 渲染内容
   */
  private renderContent(): void {
    if (!this.contentContainer) return;

    // 清空内容容器
    this.contentContainer.innerHTML = '';

    // 显示活动面板内容
    if (this.activePanel) {
      const panel = this.panels.get(this.activePanel);
      if (panel) {
        const panelElement = document.createElement('div');
        panelElement.className = 'mplp-sidebar-panel';
        panelElement.style.cssText = `
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `;

        if (typeof panel.content === 'string') {
          panelElement.innerHTML = panel.content;
        } else {
          panelElement.appendChild(panel.content);
        }

        this.contentContainer.appendChild(panelElement);
      }
    }
  }

  // ===== 公共API方法 =====

  /**
   * 设置活动面板
   */
  public setActivePanel(panelId: string): void {
    // 取消所有面板的活动状态
    this.panels.forEach(panel => {
      panel.active = false;
    });

    // 设置新的活动面板
    const panel = this.panels.get(panelId);
    if (panel) {
      panel.active = true;
      this.activePanel = panelId;
      this.render();
      this.emitEvent('panelActivated', { panelId, panel });
    }
  }

  /**
   * 添加面板
   */
  public addPanel(panel: SidebarPanel): void {
    this.panels.set(panel.id, panel);
    this.render();
    this.emitEvent('panelAdded', { panelId: panel.id });
  }

  /**
   * 移除面板
   */
  public removePanel(panelId: string): void {
    if (this.panels.delete(panelId)) {
      if (this.activePanel === panelId) {
        // 激活第一个可见面板
        const firstPanel = Array.from(this.panels.values()).find(p => p.visible);
        if (firstPanel) {
          this.setActivePanel(firstPanel.id);
        } else {
          this.activePanel = null;
        }
      }
      this.render();
      this.emitEvent('panelRemoved', { panelId });
    }
  }

  /**
   * 切换折叠状态
   */
  public toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    if (this.sidebarContainer) {
      this.sidebarContainer.style.width = this.isCollapsed ? '0px' : `${this.sidebarConfig.width}px`;
    }
    this.emitEvent('collapseToggled', { collapsed: this.isCollapsed });
  }

  /**
   * 获取侧边栏配置
   */
  public getSidebarConfig(): SidebarConfig {
    return { ...this.sidebarConfig };
  }

  /**
   * 更新侧边栏配置
   */
  public updateSidebarConfig(updates: Partial<SidebarConfig>): void {
    this.sidebarConfig = { ...this.sidebarConfig, ...updates };
    this.render();
    this.emitEvent('configUpdated', { config: this.sidebarConfig });
  }

  /**
   * 获取所有面板
   */
  public getAllPanels(): SidebarPanel[] {
    return Array.from(this.panels.values());
  }

  /**
   * 获取活动面板
   */
  public getActivePanel(): SidebarPanel | null {
    return this.activePanel ? this.panels.get(this.activePanel) || null : null;
  }
}
