/**
 * 条件表达式引擎 - 高级条件审批逻辑
 * 
 * 功能：
 * - 条件表达式解析和求值
 * - 复杂逻辑运算支持
 * - 上下文数据访问
 * - 函数和操作符扩展
 * 
 * @version 1.0.0
 * @created 2025-08-08
 */

// UUID and Timestamp types are imported but used in interfaces
import { Logger } from '../../../../public/utils/logger';
import { Confirm } from '../entities/confirm.entity';

/**
 * 条件表达式类型枚举
 */
export enum ConditionType {
  SIMPLE = 'simple',           // 简单比较：field == value
  COMPLEX = 'complex',         // 复杂表达式：(field1 > value1) AND (field2 == value2)
  FUNCTION = 'function',       // 函数调用：hasRole(user, 'admin')
  SCRIPT = 'script'           // 脚本表达式：JavaScript代码片段
}

/**
 * 操作符枚举
 */
export enum Operator {
  // 比较操作符
  EQUALS = '==',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  
  // 字符串操作符
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  MATCHES = 'matches',        // 正则表达式
  
  // 集合操作符
  IN = 'in',
  NOT_IN = 'notIn',
  
  // 逻辑操作符
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  
  // 存在性操作符
  EXISTS = 'exists',
  NOT_EXISTS = 'notExists'
}

/**
 * 条件表达式接口
 */
export interface ConditionExpression {
  id?: string;
  type: ConditionType;
  expression: string;
  description?: string;
  
  // 简单条件
  field?: string;
  operator?: Operator;
  value?: unknown;
  
  // 复杂条件
  left?: ConditionExpression;
  right?: ConditionExpression;
  logicalOperator?: Operator;
  
  // 函数条件
  functionName?: string;
  parameters?: unknown[];
  
  // 脚本条件
  script?: string;
  
  // 元数据
  metadata?: Record<string, unknown>;
}

/**
 * 条件求值上下文接口
 */
export interface ConditionContext {
  // 确认相关数据
  confirm: Confirm;
  
  // 上下文数据
  contextData?: Record<string, unknown>;
  
  // 计划数据
  planData?: Record<string, unknown>;
  
  // 用户数据
  userData?: Record<string, unknown>;
  
  // 系统数据
  systemData?: Record<string, unknown>;
  
  // 时间数据
  timeData: {
    now: Date;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
  };
  
  // 自定义变量
  variables?: Record<string, unknown>;
}

/**
 * 条件求值结果接口
 */
export interface ConditionResult {
  success: boolean;
  value: boolean;
  expression: string;
  evaluationTime: number;
  error?: string;
  details?: {
    steps: string[];
    intermediateResults: Record<string, unknown>;
  };
}

/**
 * 内置函数接口
 */
export interface BuiltinFunction {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
  handler: (context: ConditionContext, ...args: unknown[]) => unknown;
}

/**
 * 条件引擎接口
 */
export interface IConditionEngine {
  // 表达式求值
  evaluate(expression: ConditionExpression, context: ConditionContext): Promise<ConditionResult>;
  evaluateString(expression: string, context: ConditionContext): Promise<ConditionResult>;
  
  // 表达式解析
  parse(expression: string): ConditionExpression;
  validate(expression: ConditionExpression): { valid: boolean; errors: string[] };
  
  // 函数管理
  registerFunction(func: BuiltinFunction): void;
  unregisterFunction(name: string): void;
  getFunction(name: string): BuiltinFunction | null;
  
  // 批量求值
  evaluateBatch(expressions: ConditionExpression[], context: ConditionContext): Promise<ConditionResult[]>;
}

/**
 * 条件引擎实现
 */
export class ConditionEngine implements IConditionEngine {
  private logger: Logger;
  private functions: Map<string, BuiltinFunction> = new Map();

  constructor() {
    this.logger = new Logger('ConditionEngine');
    this.registerBuiltinFunctions();
  }

  /**
   * 求值条件表达式
   */
  async evaluate(expression: ConditionExpression, context: ConditionContext): Promise<ConditionResult> {
    const startTime = Date.now();
    const steps: string[] = [];
    const intermediateResults: Record<string, unknown> = {};

    try {
      steps.push(`开始求值表达式: ${expression.expression || expression.type}`);
      
      let result: boolean;
      
      switch (expression.type) {
        case ConditionType.SIMPLE:
          result = await this.evaluateSimple(expression, context, steps, intermediateResults);
          break;
        case ConditionType.COMPLEX:
          result = await this.evaluateComplex(expression, context, steps, intermediateResults);
          break;
        case ConditionType.FUNCTION:
          result = await this.evaluateFunction(expression, context, steps, intermediateResults);
          break;
        case ConditionType.SCRIPT:
          result = await this.evaluateScript(expression, context, steps, intermediateResults);
          break;
        default:
          throw new Error(`Unsupported condition type: ${expression.type}`);
      }

      const evaluationTime = Date.now() - startTime;
      steps.push(`求值完成，结果: ${result}, 耗时: ${evaluationTime}ms`);

      return {
        success: true,
        value: result,
        expression: expression.expression || `${expression.type} condition`,
        evaluationTime,
        details: {
          steps,
          intermediateResults
        }
      };

    } catch (error) {
      const evaluationTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      steps.push(`求值失败: ${errorMessage}`);
      
      this.logger.error('Condition evaluation failed', {
        expression: expression.expression,
        error: errorMessage,
        evaluationTime
      });

      return {
        success: false,
        value: false,
        expression: expression.expression || `${expression.type} condition`,
        evaluationTime,
        error: errorMessage,
        details: {
          steps,
          intermediateResults
        }
      };
    }
  }

  /**
   * 求值字符串表达式
   */
  async evaluateString(expression: string, context: ConditionContext): Promise<ConditionResult> {
    try {
      const parsed = this.parse(expression);
      return this.evaluate(parsed, context);
    } catch (error) {
      return {
        success: false,
        value: false,
        expression,
        evaluationTime: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 解析表达式字符串
   */
  parse(expression: string): ConditionExpression {
    // 简化的解析器实现
    // 在实际项目中，这里应该使用更完善的解析器（如ANTLR）
    
    expression = expression.trim();
    
    // 检测函数调用
    const functionMatch = expression.match(/^(\w+)\s*\((.*)\)$/);
    if (functionMatch) {
      const [, functionName, paramStr] = functionMatch;
      const parameters = this.parseParameters(paramStr);
      
      return {
        type: ConditionType.FUNCTION,
        expression,
        functionName,
        parameters
      };
    }
    
    // 检测复杂表达式（包含逻辑操作符）
    if (expression.includes(' AND ') || expression.includes(' OR ')) {
      return this.parseComplexExpression(expression);
    }
    
    // 检测简单比较表达式
    const simpleMatch = expression.match(/^(\w+(?:\.\w+)*)\s*(==|!=|>=|<=|>|<|contains|startsWith|endsWith|in|notIn)\s*(.+)$/);
    if (simpleMatch) {
      const [, field, operator, valueStr] = simpleMatch;
      const value = this.parseValue(valueStr);
      
      return {
        type: ConditionType.SIMPLE,
        expression,
        field,
        operator: operator as Operator,
        value
      };
    }
    
    // 默认作为脚本处理
    return {
      type: ConditionType.SCRIPT,
      expression,
      script: expression
    };
  }

  /**
   * 验证表达式
   */
  validate(expression: ConditionExpression): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证表达式类型
    if (!Object.values(ConditionType).includes(expression.type)) {
      errors.push(`Invalid condition type: ${expression.type}`);
    }

    // 根据类型验证具体字段
    switch (expression.type) {
      case ConditionType.SIMPLE:
        if (!expression.field) {
          errors.push('Simple condition requires field');
        }
        if (!expression.operator) {
          errors.push('Simple condition requires operator');
        }
        if (expression.value === undefined) {
          errors.push('Simple condition requires value');
        }
        break;

      case ConditionType.COMPLEX:
        if (!expression.left || !expression.right) {
          errors.push('Complex condition requires left and right expressions');
        }
        if (!expression.logicalOperator) {
          errors.push('Complex condition requires logical operator');
        }
        break;

      case ConditionType.FUNCTION:
        if (!expression.functionName) {
          errors.push('Function condition requires function name');
        } else if (!this.functions.has(expression.functionName)) {
          errors.push(`Unknown function: ${expression.functionName}`);
        }
        break;

      case ConditionType.SCRIPT:
        if (!expression.script) {
          errors.push('Script condition requires script content');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 注册函数
   */
  registerFunction(func: BuiltinFunction): void {
    this.functions.set(func.name, func);
    this.logger.info('Function registered', {
      name: func.name,
      description: func.description
    });
  }

  /**
   * 注销函数
   */
  unregisterFunction(name: string): void {
    if (this.functions.delete(name)) {
      this.logger.info('Function unregistered', { name });
    }
  }

  /**
   * 获取函数
   */
  getFunction(name: string): BuiltinFunction | null {
    return this.functions.get(name) || null;
  }

  /**
   * 批量求值
   */
  async evaluateBatch(expressions: ConditionExpression[], context: ConditionContext): Promise<ConditionResult[]> {
    const results: ConditionResult[] = [];
    
    for (const expression of expressions) {
      try {
        const result = await this.evaluate(expression, context);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          value: false,
          expression: expression.expression || `${expression.type} condition`,
          evaluationTime: 0,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }

  /**
   * 求值简单条件
   */
  private async evaluateSimple(
    expression: ConditionExpression,
    context: ConditionContext,
    steps: string[],
    intermediateResults: Record<string, unknown>
  ): Promise<boolean> {
    if (!expression.field || !expression.operator || expression.value === undefined) {
      throw new Error('Invalid simple condition: missing field, operator, or value');
    }

    const fieldValue = this.getFieldValue(expression.field, context);
    const expectedValue = expression.value;
    
    steps.push(`获取字段值: ${expression.field} = ${JSON.stringify(fieldValue)}`);
    steps.push(`期望值: ${JSON.stringify(expectedValue)}`);
    
    intermediateResults[expression.field] = fieldValue;
    intermediateResults.expectedValue = expectedValue;

    const result = this.compareValues(fieldValue, expression.operator, expectedValue);
    
    steps.push(`比较结果: ${fieldValue} ${expression.operator} ${expectedValue} = ${result}`);
    
    return result;
  }

  /**
   * 求值复杂条件
   */
  private async evaluateComplex(
    expression: ConditionExpression,
    context: ConditionContext,
    steps: string[],
    intermediateResults: Record<string, unknown>
  ): Promise<boolean> {
    if (!expression.left || !expression.right || !expression.logicalOperator) {
      throw new Error('Invalid complex condition: missing left, right, or logical operator');
    }

    steps.push(`求值左侧表达式`);
    const leftResult = await this.evaluate(expression.left, context);
    
    steps.push(`左侧结果: ${leftResult.value}`);
    intermediateResults.leftResult = leftResult.value;

    // 短路求值
    if (expression.logicalOperator === Operator.AND && !leftResult.value) {
      steps.push(`短路求值: AND操作左侧为false，直接返回false`);
      return false;
    }
    
    if (expression.logicalOperator === Operator.OR && leftResult.value) {
      steps.push(`短路求值: OR操作左侧为true，直接返回true`);
      return true;
    }

    steps.push(`求值右侧表达式`);
    const rightResult = await this.evaluate(expression.right, context);
    
    steps.push(`右侧结果: ${rightResult.value}`);
    intermediateResults.rightResult = rightResult.value;

    let result: boolean;
    switch (expression.logicalOperator) {
      case Operator.AND:
        result = leftResult.value && rightResult.value;
        break;
      case Operator.OR:
        result = leftResult.value || rightResult.value;
        break;
      default:
        throw new Error(`Unsupported logical operator: ${expression.logicalOperator}`);
    }

    steps.push(`逻辑运算结果: ${leftResult.value} ${expression.logicalOperator} ${rightResult.value} = ${result}`);
    
    return result;
  }

  /**
   * 求值函数条件
   */
  private async evaluateFunction(
    expression: ConditionExpression,
    context: ConditionContext,
    steps: string[],
    intermediateResults: Record<string, unknown>
  ): Promise<boolean> {
    if (!expression.functionName) {
      throw new Error('Invalid function condition: missing function name');
    }

    const func = this.functions.get(expression.functionName);
    if (!func) {
      throw new Error(`Unknown function: ${expression.functionName}`);
    }

    const parameters = expression.parameters || [];
    steps.push(`调用函数: ${expression.functionName}(${parameters.map(p => JSON.stringify(p)).join(', ')})`);
    
    intermediateResults.functionName = expression.functionName;
    intermediateResults.parameters = parameters;

    const result = func.handler(context, ...parameters);
    const booleanResult = Boolean(result);
    
    steps.push(`函数返回值: ${JSON.stringify(result)} -> ${booleanResult}`);
    intermediateResults.functionResult = result;
    
    return booleanResult;
  }

  /**
   * 求值脚本条件
   */
  private async evaluateScript(
    expression: ConditionExpression,
    context: ConditionContext,
    steps: string[],
    intermediateResults: Record<string, unknown>
  ): Promise<boolean> {
    if (!expression.script) {
      throw new Error('Invalid script condition: missing script content');
    }

    steps.push(`执行脚本: ${expression.script}`);
    
    // 创建安全的执行环境
    const scriptContext = {
      confirm: context.confirm,
      contextData: context.contextData,
      planData: context.planData,
      userData: context.userData,
      systemData: context.systemData,
      timeData: context.timeData,
      variables: context.variables,
      // 添加一些实用函数
      hasRole: (role: string) => context.confirm.requester.role === role,
      isExpired: () => {
        if (!context.timeData.expiresAt) return false;
        return context.timeData.now > context.timeData.expiresAt;
      },
      daysSince: (date: Date) => {
        return Math.floor((context.timeData.now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      }
    };

    try {
      // 注意：在生产环境中，应该使用更安全的脚本执行环境
      // 这里使用简化的实现
      const func = new Function('context', `with(context) { return ${expression.script}; }`);
      const result = func(scriptContext);
      const booleanResult = Boolean(result);
      
      steps.push(`脚本执行结果: ${JSON.stringify(result)} -> ${booleanResult}`);
      intermediateResults.scriptResult = result;
      
      return booleanResult;
    } catch (error) {
      steps.push(`脚本执行失败: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Script execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 获取字段值
   */
  private getFieldValue(field: string, context: ConditionContext): unknown {
    const parts = field.split('.');
    let current: unknown = context;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * 比较值
   */
  private compareValues(left: unknown, operator: Operator, right: unknown): boolean {
    switch (operator) {
      case Operator.EQUALS:
        return left === right;
      case Operator.NOT_EQUALS:
        return left !== right;
      case Operator.GREATER_THAN:
        return Number(left) > Number(right);
      case Operator.GREATER_THAN_OR_EQUAL:
        return Number(left) >= Number(right);
      case Operator.LESS_THAN:
        return Number(left) < Number(right);
      case Operator.LESS_THAN_OR_EQUAL:
        return Number(left) <= Number(right);
      case Operator.CONTAINS:
        return String(left).includes(String(right));
      case Operator.STARTS_WITH:
        return String(left).startsWith(String(right));
      case Operator.ENDS_WITH:
        return String(left).endsWith(String(right));
      case Operator.MATCHES:
        return new RegExp(String(right)).test(String(left));
      case Operator.IN:
        return Array.isArray(right) && right.includes(left);
      case Operator.NOT_IN:
        return Array.isArray(right) && !right.includes(left);
      case Operator.EXISTS:
        return left !== undefined && left !== null;
      case Operator.NOT_EXISTS:
        return left === undefined || left === null;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  /**
   * 解析参数
   */
  private parseParameters(paramStr: string): unknown[] {
    if (!paramStr.trim()) {
      return [];
    }

    // 简化的参数解析
    return paramStr.split(',').map(param => this.parseValue(param.trim()));
  }

  /**
   * 解析值
   */
  private parseValue(valueStr: string): unknown {
    valueStr = valueStr.trim();

    // 字符串
    if ((valueStr.startsWith('"') && valueStr.endsWith('"')) ||
        (valueStr.startsWith("'") && valueStr.endsWith("'"))) {
      return valueStr.slice(1, -1);
    }

    // 数字
    if (/^-?\d+(\.\d+)?$/.test(valueStr)) {
      return Number(valueStr);
    }

    // 布尔值
    if (valueStr === 'true') return true;
    if (valueStr === 'false') return false;

    // null
    if (valueStr === 'null') return null;

    // 数组
    if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
      const arrayStr = valueStr.slice(1, -1);
      if (!arrayStr.trim()) return [];
      return arrayStr.split(',').map(item => this.parseValue(item.trim()));
    }

    // 默认作为字符串
    return valueStr;
  }

  /**
   * 解析复杂表达式
   */
  private parseComplexExpression(expression: string): ConditionExpression {
    // 简化的复杂表达式解析
    // 在实际项目中，这里应该使用更完善的解析器
    
    let logicalOperator: Operator;
    let splitIndex: number;
    
    if (expression.includes(' AND ')) {
      logicalOperator = Operator.AND;
      splitIndex = expression.indexOf(' AND ');
    } else if (expression.includes(' OR ')) {
      logicalOperator = Operator.OR;
      splitIndex = expression.indexOf(' OR ');
    } else {
      throw new Error('Invalid complex expression: no logical operator found');
    }
    
    const leftExpr = expression.substring(0, splitIndex).trim();
    const rightExpr = expression.substring(splitIndex + (logicalOperator === Operator.AND ? 5 : 4)).trim();
    
    return {
      type: ConditionType.COMPLEX,
      expression,
      left: this.parse(leftExpr),
      right: this.parse(rightExpr),
      logicalOperator
    };
  }

  /**
   * 注册内置函数
   */
  private registerBuiltinFunctions(): void {
    // 角色检查函数
    this.registerFunction({
      name: 'hasRole',
      description: '检查用户是否具有指定角色',
      parameters: [
        { name: 'role', type: 'string', required: true, description: '角色名称' }
      ],
      handler: (context: ConditionContext, ...args: unknown[]) => {
        const role = args[0] as string;
        return context.confirm.requester.role === role;
      }
    });

    // 优先级检查函数
    this.registerFunction({
      name: 'hasPriority',
      description: '检查确认是否具有指定优先级',
      parameters: [
        { name: 'priority', type: 'string', required: true, description: '优先级' }
      ],
      handler: (context: ConditionContext, ...args: unknown[]) => {
        const priority = args[0] as string;
        return context.confirm.priority === priority;
      }
    });

    // 时间检查函数
    this.registerFunction({
      name: 'isExpired',
      description: '检查确认是否已过期',
      parameters: [],
      handler: (context: ConditionContext) => {
        if (!context.timeData.expiresAt) return false;
        return context.timeData.now > context.timeData.expiresAt;
      }
    });

    // 工作时间检查函数
    this.registerFunction({
      name: 'isWorkingHours',
      description: '检查当前是否为工作时间',
      parameters: [],
      handler: (context: ConditionContext) => {
        const hour = context.timeData.now.getHours();
        const day = context.timeData.now.getDay();
        return day >= 1 && day <= 5 && hour >= 9 && hour < 18; // 周一到周五，9-18点
      }
    });

    // 天数计算函数
    this.registerFunction({
      name: 'daysSince',
      description: '计算距离指定日期的天数',
      parameters: [
        { name: 'date', type: 'string', required: true, description: '日期字符串' }
      ],
      handler: (context: ConditionContext, ...args: unknown[]) => {
        const dateStr = args[0] as string;
        const date = new Date(dateStr);
        return Math.floor((context.timeData.now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      }
    });

    this.logger.info('Builtin functions registered', {
      count: this.functions.size,
      functions: Array.from(this.functions.keys())
    });
  }
}

/**
 * 条件构建器 - 帮助构建复杂条件表达式
 */
export class ConditionBuilder {
  private expression: ConditionExpression;

  constructor() {
    this.expression = {
      type: ConditionType.SIMPLE,
      expression: ''
    };
  }

  /**
   * 创建简单条件
   */
  static field(field: string): ConditionBuilder {
    const builder = new ConditionBuilder();
    builder.expression.field = field;
    return builder;
  }

  /**
   * 创建函数条件
   */
  static func(functionName: string, ...parameters: unknown[]): ConditionBuilder {
    const builder = new ConditionBuilder();
    builder.expression.type = ConditionType.FUNCTION;
    builder.expression.functionName = functionName;
    builder.expression.parameters = parameters;
    builder.expression.expression = `${functionName}(${parameters.map(p => JSON.stringify(p)).join(', ')})`;
    return builder;
  }

  /**
   * 设置操作符和值
   */
  equals(value: unknown): ConditionBuilder {
    this.expression.operator = Operator.EQUALS;
    this.expression.value = value;
    this.updateExpression();
    return this;
  }

  notEquals(value: unknown): ConditionBuilder {
    this.expression.operator = Operator.NOT_EQUALS;
    this.expression.value = value;
    this.updateExpression();
    return this;
  }

  greaterThan(value: unknown): ConditionBuilder {
    this.expression.operator = Operator.GREATER_THAN;
    this.expression.value = value;
    this.updateExpression();
    return this;
  }

  lessThan(value: unknown): ConditionBuilder {
    this.expression.operator = Operator.LESS_THAN;
    this.expression.value = value;
    this.updateExpression();
    return this;
  }

  contains(value: string): ConditionBuilder {
    this.expression.operator = Operator.CONTAINS;
    this.expression.value = value;
    this.updateExpression();
    return this;
  }

  in(values: unknown[]): ConditionBuilder {
    this.expression.operator = Operator.IN;
    this.expression.value = values;
    this.updateExpression();
    return this;
  }

  /**
   * 逻辑组合
   */
  and(other: ConditionBuilder): ConditionBuilder {
    const builder = new ConditionBuilder();
    builder.expression = {
      type: ConditionType.COMPLEX,
      expression: `(${this.expression.expression}) AND (${other.expression.expression})`,
      left: this.expression,
      right: other.expression,
      logicalOperator: Operator.AND
    };
    return builder;
  }

  or(other: ConditionBuilder): ConditionBuilder {
    const builder = new ConditionBuilder();
    builder.expression = {
      type: ConditionType.COMPLEX,
      expression: `(${this.expression.expression}) OR (${other.expression.expression})`,
      left: this.expression,
      right: other.expression,
      logicalOperator: Operator.OR
    };
    return builder;
  }

  /**
   * 构建表达式
   */
  build(): ConditionExpression {
    return { ...this.expression };
  }

  /**
   * 更新表达式字符串
   */
  private updateExpression(): void {
    if (this.expression.field && this.expression.operator && this.expression.value !== undefined) {
      this.expression.expression = `${this.expression.field} ${this.expression.operator} ${JSON.stringify(this.expression.value)}`;
    }
  }
}
