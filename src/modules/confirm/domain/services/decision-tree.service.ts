/**
 * 决策树服务 - 智能决策支持
 * 
 * 功能：
 * - 决策树构建和管理
 * - 智能决策路径计算
 * - 决策历史分析
 * - 决策优化建议
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

import { Timestamp, Priority } from '../../types';
import { Logger } from '../../../../public/utils/logger';
import { Confirm } from '../entities/confirm.entity';
import {
  ConditionEngine,
  ConditionExpression,
  ConditionContext,
  ConditionResult,
  ConditionType,
  Operator
} from './condition-engine.service';

/**
 * 决策节点类型枚举
 */
export enum DecisionNodeType {
  ROOT = 'root',           // 根节点
  CONDITION = 'condition', // 条件节点
  ACTION = 'action',       // 动作节点
  LEAF = 'leaf'           // 叶子节点
}

/**
 * 决策动作枚举
 */
export enum DecisionAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  ESCALATE = 'escalate',
  DELEGATE = 'delegate',
  DEFER = 'defer',
  REQUEST_INFO = 'request_info'
}

/**
 * 决策节点接口
 */
export interface DecisionNode {
  id: string;
  type: DecisionNodeType;
  name: string;
  description?: string;
  
  // 条件节点属性
  condition?: ConditionExpression;
  
  // 动作节点属性
  action?: DecisionAction;
  actionParameters?: Record<string, unknown>;
  
  // 树结构
  parent?: string;
  children: string[];
  
  // 分支条件
  trueChild?: string;  // 条件为真时的子节点
  falseChild?: string; // 条件为假时的子节点
  
  // 权重和优先级
  weight: number;
  priority: number;
  
  // 统计信息
  executionCount: number;
  successCount: number;
  
  // 元数据
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 决策树接口
 */
export interface DecisionTree {
  id: string;
  name: string;
  description: string;
  version: string;
  
  // 树结构
  rootNodeId: string;
  nodes: Map<string, DecisionNode>;
  
  // 适用范围
  scope: {
    confirmationTypes?: string[];
    priorities?: Priority[];
    contexts?: string[];
    roles?: string[];
  };
  
  // 配置
  enabled: boolean;
  maxDepth: number;
  timeout: number; // 决策超时时间（毫秒）
  
  // 统计信息
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  
  // 元数据
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

/**
 * 决策路径接口
 */
export interface DecisionPath {
  treeId: string;
  treeName: string;
  path: DecisionPathStep[];
  finalDecision: DecisionAction;
  confidence: number;
  executionTime: number;
  timestamp: Timestamp;
}

/**
 * 决策路径步骤接口
 */
export interface DecisionPathStep {
  nodeId: string;
  nodeName: string;
  nodeType: DecisionNodeType;
  condition?: ConditionExpression;
  conditionResult?: ConditionResult;
  action?: DecisionAction;
  executionTime: number;
  metadata?: Record<string, unknown>;
}

/**
 * 决策结果接口
 */
export interface TreeDecisionResult {
  success: boolean;
  decision?: DecisionAction;
  confidence: number;
  path: DecisionPath;
  recommendations?: string[];
  alternativePaths?: DecisionPath[];
  error?: string;
}

/**
 * 决策树统计接口
 */
export interface DecisionTreeStatistics {
  treeId: string;
  treeName: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  averageConfidence: number;
  mostUsedPath: string[];
  leastUsedNodes: string[];
  optimizationSuggestions: string[];
  timestamp: Timestamp;
}

/**
 * 决策树服务接口
 */
export interface IDecisionTreeService {
  // 树管理
  createTree(tree: Omit<DecisionTree, 'nodes' | 'totalExecutions' | 'successRate' | 'averageExecutionTime'>): DecisionTree;
  updateTree(treeId: string, updates: Partial<DecisionTree>): void;
  deleteTree(treeId: string): void;
  getTree(treeId: string): DecisionTree | null;
  getTrees(): DecisionTree[];
  
  // 节点管理
  addNode(treeId: string, node: Omit<DecisionNode, 'executionCount' | 'successCount'>): void;
  updateNode(treeId: string, nodeId: string, updates: Partial<DecisionNode>): void;
  removeNode(treeId: string, nodeId: string): void;
  getNode(treeId: string, nodeId: string): DecisionNode | null;
  
  // 决策执行
  makeDecision(confirm: Confirm, context: ConditionContext): Promise<TreeDecisionResult>;
  executeTree(treeId: string, confirm: Confirm, context: ConditionContext): Promise<TreeDecisionResult>;
  
  // 路径分析
  findOptimalPath(treeId: string, confirm: Confirm, context: ConditionContext): Promise<DecisionPath[]>;
  analyzePath(path: DecisionPath): { efficiency: number; reliability: number; suggestions: string[] };
  
  // 统计分析
  getTreeStatistics(treeId: string): Promise<DecisionTreeStatistics>;
  optimizeTree(treeId: string): Promise<{ optimizations: string[]; estimatedImprovement: number }>;
}

/**
 * 决策树服务实现
 */
export class DecisionTreeService implements IDecisionTreeService {
  private logger: Logger;
  private conditionEngine: ConditionEngine;
  private trees: Map<string, DecisionTree> = new Map();

  constructor(conditionEngine: ConditionEngine) {
    this.logger = new Logger('DecisionTreeService');
    this.conditionEngine = conditionEngine;
    this.initializeDefaultTrees();
  }

  /**
   * 创建决策树
   */
  createTree(tree: Omit<DecisionTree, 'nodes' | 'totalExecutions' | 'successRate' | 'averageExecutionTime'>): DecisionTree {
    const newTree: DecisionTree = {
      ...tree,
      nodes: new Map(),
      totalExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.trees.set(newTree.id, newTree);
    
    this.logger.info('Decision tree created', {
      treeId: newTree.id,
      treeName: newTree.name,
      version: newTree.version
    });

    return newTree;
  }

  /**
   * 更新决策树
   */
  updateTree(treeId: string, updates: Partial<DecisionTree>): void {
    const tree = this.trees.get(treeId);
    if (!tree) {
      throw new Error(`Decision tree not found: ${treeId}`);
    }

    Object.assign(tree, updates, { updatedAt: new Date().toISOString() });
    
    this.logger.info('Decision tree updated', {
      treeId,
      updates: Object.keys(updates)
    });
  }

  /**
   * 删除决策树
   */
  deleteTree(treeId: string): void {
    if (this.trees.delete(treeId)) {
      this.logger.info('Decision tree deleted', { treeId });
    } else {
      this.logger.warn('Decision tree not found for deletion', { treeId });
    }
  }

  /**
   * 获取决策树
   */
  getTree(treeId: string): DecisionTree | null {
    return this.trees.get(treeId) || null;
  }

  /**
   * 获取所有决策树
   */
  getTrees(): DecisionTree[] {
    return Array.from(this.trees.values());
  }

  /**
   * 添加节点
   */
  addNode(treeId: string, node: Omit<DecisionNode, 'executionCount' | 'successCount'>): void {
    const tree = this.trees.get(treeId);
    if (!tree) {
      throw new Error(`Decision tree not found: ${treeId}`);
    }

    const newNode: DecisionNode = {
      ...node,
      executionCount: 0,
      successCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tree.nodes.set(node.id, newNode);
    tree.updatedAt = new Date().toISOString();

    this.logger.info('Decision node added', {
      treeId,
      nodeId: node.id,
      nodeType: node.type
    });
  }

  /**
   * 更新节点
   */
  updateNode(treeId: string, nodeId: string, updates: Partial<DecisionNode>): void {
    const tree = this.trees.get(treeId);
    if (!tree) {
      throw new Error(`Decision tree not found: ${treeId}`);
    }

    const node = tree.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Decision node not found: ${nodeId}`);
    }

    Object.assign(node, updates, { updatedAt: new Date().toISOString() });
    tree.updatedAt = new Date().toISOString();

    this.logger.info('Decision node updated', {
      treeId,
      nodeId,
      updates: Object.keys(updates)
    });
  }

  /**
   * 移除节点
   */
  removeNode(treeId: string, nodeId: string): void {
    const tree = this.trees.get(treeId);
    if (!tree) {
      throw new Error(`Decision tree not found: ${treeId}`);
    }

    if (tree.nodes.delete(nodeId)) {
      tree.updatedAt = new Date().toISOString();
      this.logger.info('Decision node removed', { treeId, nodeId });
    } else {
      this.logger.warn('Decision node not found for removal', { treeId, nodeId });
    }
  }

  /**
   * 获取节点
   */
  getNode(treeId: string, nodeId: string): DecisionNode | null {
    const tree = this.trees.get(treeId);
    if (!tree) {
      return null;
    }

    return tree.nodes.get(nodeId) || null;
  }

  /**
   * 做出决策
   */
  async makeDecision(confirm: Confirm, context: ConditionContext): Promise<TreeDecisionResult> {
    // 找到适用的决策树
    const applicableTrees = this.findApplicableTrees(confirm);
    
    if (applicableTrees.length === 0) {
      return {
        success: false,
        confidence: 0,
        path: {
          treeId: 'none',
          treeName: 'No applicable tree',
          path: [],
          finalDecision: DecisionAction.DEFER,
          confidence: 0,
          executionTime: 0,
          timestamp: new Date().toISOString()
        },
        error: 'No applicable decision tree found'
      };
    }

    // 使用第一个适用的树
    const tree = applicableTrees[0];
    return this.executeTree(tree.id, confirm, context);
  }

  /**
   * 执行决策树
   */
  async executeTree(treeId: string, confirm: Confirm, context: ConditionContext): Promise<TreeDecisionResult> {
    const startTime = Date.now();
    const tree = this.trees.get(treeId);
    
    if (!tree) {
      return {
        success: false,
        confidence: 0,
        path: {
          treeId,
          treeName: 'Unknown',
          path: [],
          finalDecision: DecisionAction.DEFER,
          confidence: 0,
          executionTime: 0,
          timestamp: new Date().toISOString()
        },
        error: `Decision tree not found: ${treeId}`
      };
    }

    if (!tree.enabled) {
      return {
        success: false,
        confidence: 0,
        path: {
          treeId,
          treeName: tree.name,
          path: [],
          finalDecision: DecisionAction.DEFER,
          confidence: 0,
          executionTime: 0,
          timestamp: new Date().toISOString()
        },
        error: 'Decision tree is disabled'
      };
    }

    try {
      const path = await this.traverseTree(tree, confirm, context);
      const executionTime = Date.now() - startTime;

      // 更新统计信息
      tree.totalExecutions++;
      tree.averageExecutionTime = (tree.averageExecutionTime * (tree.totalExecutions - 1) + executionTime) / tree.totalExecutions;

      const result: TreeDecisionResult = {
        success: true,
        decision: path.finalDecision,
        confidence: path.confidence,
        path,
        recommendations: this.generateRecommendations(path)
      };

      if (result.success) {
        tree.successRate = ((tree.successRate * (tree.totalExecutions - 1)) + 1) / tree.totalExecutions;
      }

      this.logger.info('Decision tree executed', {
        treeId,
        decision: result.decision,
        confidence: result.confidence,
        executionTime
      });

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      this.logger.error('Decision tree execution failed', {
        treeId,
        error: error instanceof Error ? error.message : String(error),
        executionTime
      });

      return {
        success: false,
        confidence: 0,
        path: {
          treeId,
          treeName: tree.name,
          path: [],
          finalDecision: DecisionAction.DEFER,
          confidence: 0,
          executionTime,
          timestamp: new Date().toISOString()
        },
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 查找最优路径
   */
  async findOptimalPath(treeId: string, confirm: Confirm, context: ConditionContext): Promise<DecisionPath[]> {
    const tree = this.trees.get(treeId);
    if (!tree) {
      return [];
    }

    // 简化实现：返回当前执行路径
    const result = await this.executeTree(treeId, confirm, context);
    return result.success ? [result.path] : [];
  }

  /**
   * 分析路径
   */
  analyzePath(path: DecisionPath): { efficiency: number; reliability: number; suggestions: string[] } {
    const efficiency = Math.max(0, 1 - (path.executionTime / 10000)); // 基于执行时间
    const reliability = path.confidence;
    const suggestions: string[] = [];

    if (path.executionTime > 5000) {
      suggestions.push('考虑优化条件检查以减少执行时间');
    }

    if (path.confidence < 0.8) {
      suggestions.push('考虑添加更多条件以提高决策置信度');
    }

    if (path.path.length > 10) {
      suggestions.push('决策路径过长，考虑简化决策树结构');
    }

    return { efficiency, reliability, suggestions };
  }

  /**
   * 获取树统计信息
   */
  async getTreeStatistics(treeId: string): Promise<DecisionTreeStatistics> {
    const tree = this.trees.get(treeId);
    if (!tree) {
      throw new Error(`Decision tree not found: ${treeId}`);
    }

    // 分析节点使用情况
    const nodeUsage = Array.from(tree.nodes.values())
      .map(node => ({ nodeId: node.id, executionCount: node.executionCount }))
      .sort((a, b) => b.executionCount - a.executionCount);

    const mostUsedPath = nodeUsage.slice(0, 5).map(n => n.nodeId);
    const leastUsedNodes = nodeUsage.slice(-3).map(n => n.nodeId);

    const optimizationSuggestions: string[] = [];
    if (tree.averageExecutionTime > 3000) {
      optimizationSuggestions.push('平均执行时间较长，考虑优化条件检查');
    }
    if (tree.successRate < 0.9) {
      optimizationSuggestions.push('成功率较低，考虑调整决策逻辑');
    }

    return {
      treeId,
      treeName: tree.name,
      totalExecutions: tree.totalExecutions,
      successfulExecutions: Math.floor(tree.totalExecutions * tree.successRate),
      failedExecutions: tree.totalExecutions - Math.floor(tree.totalExecutions * tree.successRate),
      averageExecutionTime: tree.averageExecutionTime,
      averageConfidence: this.calculateConfidence([], tree),
      mostUsedPath,
      leastUsedNodes,
      optimizationSuggestions,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 优化树
   */
  async optimizeTree(treeId: string): Promise<{ optimizations: string[]; estimatedImprovement: number }> {
    const tree = this.trees.get(treeId);
    if (!tree) {
      throw new Error(`Decision tree not found: ${treeId}`);
    }

    const optimizations: string[] = [];
    let estimatedImprovement = 0;

    // 分析未使用的节点
    const unusedNodes = Array.from(tree.nodes.values())
      .filter(node => node.executionCount === 0);

    if (unusedNodes.length > 0) {
      optimizations.push(`移除${unusedNodes.length}个未使用的节点`);
      estimatedImprovement += 0.1;
    }

    // 分析低效路径
    const lowEfficiencyNodes = Array.from(tree.nodes.values())
      .filter(node => node.executionCount > 0 && node.successCount / node.executionCount < 0.5);

    if (lowEfficiencyNodes.length > 0) {
      optimizations.push(`优化${lowEfficiencyNodes.length}个低效节点`);
      estimatedImprovement += 0.2;
    }

    // 分析深度过深的路径
    if (tree.maxDepth > 15) {
      optimizations.push('简化决策树结构，减少最大深度');
      estimatedImprovement += 0.15;
    }

    return { optimizations, estimatedImprovement };
  }

  /**
   * 遍历决策树
   */
  private async traverseTree(tree: DecisionTree, _confirm: Confirm, context: ConditionContext): Promise<DecisionPath> {
    const path: DecisionPathStep[] = [];
    let currentNodeId = tree.rootNodeId;
    let depth = 0;
    const startTime = Date.now();

    while (currentNodeId && depth < tree.maxDepth) {
      const node = tree.nodes.get(currentNodeId);
      if (!node) {
        throw new Error(`Node not found: ${currentNodeId}`);
      }

      const stepStartTime = Date.now();
      const step: DecisionPathStep = {
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        executionTime: 0
      };

      // 更新节点统计
      node.executionCount++;

      switch (node.type) {
        case DecisionNodeType.CONDITION: {
          if (!node.condition) {
            throw new Error(`Condition node ${node.id} missing condition`);
          }

          const conditionResult = await this.conditionEngine.evaluate(node.condition, context);
          step.condition = node.condition;
          step.conditionResult = conditionResult;

          if (conditionResult.success && conditionResult.value) {
            currentNodeId = node.trueChild || '';
            node.successCount++;
          } else {
            currentNodeId = node.falseChild || '';
          }
          break;
        }

        case DecisionNodeType.ACTION:
        case DecisionNodeType.LEAF: {
          step.action = node.action;
          step.executionTime = Date.now() - stepStartTime;
          path.push(step);

          const finalDecision = node.action || DecisionAction.DEFER;
          const confidence = this.calculateConfidence(path, tree);

          return {
            treeId: tree.id,
            treeName: tree.name,
            path,
            finalDecision,
            confidence,
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          };
        }

        default:
          currentNodeId = node.children[0] || '';
          break;
      }

      step.executionTime = Date.now() - stepStartTime;
      path.push(step);
      depth++;
    }

    // 如果到达最大深度或没有更多节点，返回默认决策
    return {
      treeId: tree.id,
      treeName: tree.name,
      path,
      finalDecision: DecisionAction.DEFER,
      confidence: 0.5,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(path: DecisionPathStep[], tree: DecisionTree): number {
    if (path.length === 0) {
      return 0.5;
    }

    // 基于路径中条件的成功率和节点的历史表现
    let totalConfidence = 0;
    let validSteps = 0;

    for (const step of path) {
      if (step.conditionResult) {
        totalConfidence += step.conditionResult.success ? 1 : 0;
        validSteps++;
      }

      const node = tree.nodes.get(step.nodeId);
      if (node && node.executionCount > 0) {
        const nodeReliability = node.successCount / node.executionCount;
        totalConfidence += nodeReliability;
        validSteps++;
      }
    }

    return validSteps > 0 ? totalConfidence / validSteps : 0.5;
  }

  /**
   * 查找适用的决策树
   */
  private findApplicableTrees(confirm: Confirm): DecisionTree[] {
    return Array.from(this.trees.values())
      .filter(tree => {
        if (!tree.enabled) {
          return false;
        }

        // 检查确认类型
        if (tree.scope.confirmationTypes && 
            !tree.scope.confirmationTypes.includes(confirm.confirmationType)) {
          return false;
        }

        // 检查优先级
        if (tree.scope.priorities && 
            !tree.scope.priorities.includes(confirm.priority as Priority)) {
          return false;
        }

        // 检查上下文
        if (tree.scope.contexts && 
            !tree.scope.contexts.includes(confirm.contextId)) {
          return false;
        }

        // 检查角色
        if (tree.scope.roles && 
            !tree.scope.roles.includes(confirm.requester.role)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.successRate - a.successRate); // 按成功率排序
  }

  /**
   * 生成建议
   */
  private generateRecommendations(path: DecisionPath): string[] {
    const recommendations: string[] = [];

    if (path.confidence < 0.7) {
      recommendations.push('决策置信度较低，建议人工复核');
    }

    if (path.executionTime > 5000) {
      recommendations.push('决策执行时间较长，可能需要优化');
    }

    if (path.path.length > 8) {
      recommendations.push('决策路径较复杂，考虑简化流程');
    }

    const failedConditions = path.path.filter(step => 
      step.conditionResult && (!step.conditionResult.success || !step.conditionResult.value)
    );

    if (failedConditions.length > 2) {
      recommendations.push('多个条件未满足，建议检查输入数据');
    }

    return recommendations;
  }

  /**
   * 初始化默认决策树
   */
  private initializeDefaultTrees(): void {
    // 创建简单的审批决策树
    const simpleApprovalTree = this.createTree({
      id: 'simple-approval-tree',
      name: '简单审批决策树',
      description: '基于优先级和角色的简单审批决策',
      version: '1.0.0',
      rootNodeId: 'root',
      scope: {},
      enabled: true,
      maxDepth: 10,
      timeout: 30000,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 添加根节点
    this.addNode(simpleApprovalTree.id, {
      id: 'root',
      type: DecisionNodeType.ROOT,
      name: '开始',
      parent: undefined,
      children: ['check-priority'],
      weight: 1,
      priority: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 添加优先级检查节点
    this.addNode(simpleApprovalTree.id, {
      id: 'check-priority',
      type: DecisionNodeType.CONDITION,
      name: '检查优先级',
      condition: {
        type: ConditionType.SIMPLE,
        expression: 'confirm.priority == "high"',
        field: 'confirm.priority',
        operator: Operator.EQUALS,
        value: 'high'
      },
      parent: 'root',
      children: ['auto-approve', 'check-role'],
      trueChild: 'auto-approve',
      falseChild: 'check-role',
      weight: 1,
      priority: 900,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 添加自动批准节点
    this.addNode(simpleApprovalTree.id, {
      id: 'auto-approve',
      type: DecisionNodeType.ACTION,
      name: '自动批准',
      action: DecisionAction.APPROVE,
      actionParameters: { reason: 'High priority auto-approval' },
      parent: 'check-priority',
      children: [],
      weight: 1,
      priority: 800,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 添加角色检查节点
    this.addNode(simpleApprovalTree.id, {
      id: 'check-role',
      type: DecisionNodeType.CONDITION,
      name: '检查角色',
      condition: {
        type: ConditionType.SIMPLE,
        expression: 'confirm.requester.role == "admin"',
        field: 'confirm.requester.role',
        operator: Operator.EQUALS,
        value: 'admin'
      },
      parent: 'check-priority',
      children: ['approve-admin', 'escalate'],
      trueChild: 'approve-admin',
      falseChild: 'escalate',
      weight: 1,
      priority: 700,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 添加管理员批准节点
    this.addNode(simpleApprovalTree.id, {
      id: 'approve-admin',
      type: DecisionNodeType.ACTION,
      name: '管理员批准',
      action: DecisionAction.APPROVE,
      actionParameters: { reason: 'Admin role approval' },
      parent: 'check-role',
      children: [],
      weight: 1,
      priority: 600,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 添加升级节点
    this.addNode(simpleApprovalTree.id, {
      id: 'escalate',
      type: DecisionNodeType.ACTION,
      name: '升级处理',
      action: DecisionAction.ESCALATE,
      actionParameters: { reason: 'Requires escalation' },
      parent: 'check-role',
      children: [],
      weight: 1,
      priority: 500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    this.logger.info('Default decision trees initialized', {
      treesCount: this.trees.size
    });
  }
}
