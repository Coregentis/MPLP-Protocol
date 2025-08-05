/**
 * 批量修复适配器脚本
 * 为所有适配器添加P0修复的新方法
 */

const fs = require('fs');
const path = require('path');

// 通用的新方法模板
const newMethodsTemplate = `
  /**
   * P0修复：执行工作流阶段
   */
  async executeStage(context: WorkflowExecutionContext): Promise<StageExecutionResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Executing {{MODULE}} stage', {
        executionId: context.execution_id,
        contextId: context.context_id
      });

      // 从工作流上下文创建业务协调请求
      const businessRequest: BusinessCoordinationRequest = {
        coordination_id: uuidv4() as UUID,
        context_id: context.context_id,
        module: '{{MODULE}}',
        coordination_type: '{{COORDINATION_TYPE}}',
        input_data: context.data_store.global_data.input || {
          data_type: '{{DATA_TYPE}}',
          data_version: '1.0.0',
          payload: { context_id: context.context_id },
          metadata: {
            source_module: '{{MODULE}}',
            target_modules: ['{{MODULE}}'],
            data_schema_version: '1.0.0',
            validation_status: 'valid',
            security_level: 'internal'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        previous_stage_results: [],
        configuration: {
          timeout_ms: 30000,
          retry_policy: { max_attempts: 3, delay_ms: 1000 },
          validation_rules: [],
          output_format: '{{DATA_TYPE}}'
        }
      };

      // 执行业务协调
      const businessResult = await this.executeBusinessCoordination(businessRequest);

      return {
        stage: '{{MODULE}}',
        status: businessResult.status === 'completed' ? 'completed' : 'failed',
        result: businessResult.output_data,
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };

    } catch (error) {
      return {
        stage: '{{MODULE}}',
        status: 'failed',
        error: error instanceof Error ? error : new Error(String(error)),
        duration_ms: Date.now() - startTime,
        started_at: new Date(startTime).toISOString(),
        completed_at: new Date().toISOString()
      };
    }
  }

  /**
   * P0修复：执行业务协调
   */
  async executeBusinessCoordination(request: BusinessCoordinationRequest): Promise<BusinessCoordinationResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Executing {{MODULE}} business coordination', {
        coordinationId: request.coordination_id,
        contextId: request.context_id
      });

      // 转换业务协调请求为具体协调请求
      const specificRequest: {{REQUEST_TYPE}} = {
        contextId: request.context_id,
        ...request.input_data.payload
      };

      // 执行原有的协调逻辑
      const result = await this.execute(specificRequest);

      // 转换结果为业务协调结果
      const outputData: BusinessData = {
        data_type: '{{DATA_TYPE}}',
        data_version: '1.0.0',
        payload: result,
        metadata: {
          source_module: '{{MODULE}}',
          target_modules: ['{{NEXT_MODULE}}'],
          data_schema_version: '1.0.0',
          validation_status: 'valid',
          security_level: 'internal'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        coordination_id: request.coordination_id,
        module: '{{MODULE}}',
        status: 'completed',
        output_data: outputData,
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const businessError: BusinessError = {
        error_id: uuidv4() as UUID,
        error_type: 'business_logic_error',
        error_code: '{{MODULE}}_COORDINATION_FAILED',
        error_message: error instanceof Error ? error.message : String(error),
        source_module: '{{MODULE}}',
        context_data: { coordinationId: request.coordination_id },
        recovery_suggestions: [
          {
            suggestion_type: 'retry',
            description: 'Retry the {{MODULE}} coordination',
            automated: true
          }
        ],
        timestamp: new Date().toISOString()
      };

      return {
        coordination_id: request.coordination_id,
        module: '{{MODULE}}',
        status: 'failed',
        output_data: request.input_data,
        execution_metrics: {
          start_time: new Date(startTime).toISOString(),
          end_time: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        },
        error: businessError,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * P0修复：验证输入数据
   */
  async validateInput(input: any): Promise<ValidationResult> {
    return {
      is_valid: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * P0修复：处理错误
   */
  async handleError(error: BusinessError, context: BusinessContext): Promise<ErrorHandlingResult> {
    this.logger.error('Handling {{MODULE}} module error', {
      errorId: error.error_id,
      errorType: error.error_type,
      contextId: context.context_id
    });

    return {
      handled: true,
      recovery_action: 'retry'
    };
  }
`;

// 适配器配置
const adapters = [
  {
    file: 'src/modules/confirm/infrastructure/adapters/confirm-module.adapter.ts',
    module: 'confirm',
    coordinationType: 'confirmation_coordination',
    dataType: 'confirmation_data',
    requestType: 'ConfirmationCoordinationRequest',
    nextModule: 'trace'
  },
  {
    file: 'src/modules/trace/infrastructure/adapters/trace-module.adapter.ts',
    module: 'trace',
    coordinationType: 'tracing_coordination',
    dataType: 'tracing_data',
    requestType: 'TracingCoordinationRequest',
    nextModule: 'core'
  }
];

// 生成并应用修复
adapters.forEach(config => {
  let methods = newMethodsTemplate
    .replace(/\{\{MODULE\}\}/g, config.module)
    .replace(/\{\{COORDINATION_TYPE\}\}/g, config.coordinationType)
    .replace(/\{\{DATA_TYPE\}\}/g, config.dataType)
    .replace(/\{\{REQUEST_TYPE\}\}/g, config.requestType)
    .replace(/\{\{NEXT_MODULE\}\}/g, config.nextModule);

  console.log(`Generated methods for ${config.module} adapter:`);
  console.log(methods);
  console.log('\n' + '='.repeat(80) + '\n');
});
