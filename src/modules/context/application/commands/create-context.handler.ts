/**
 * CreateContext命令处理器
 * 
 * 处理创建Context的命令
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { ContextManagementService, ContextOperationResult } from '../../application/services/context-management.service';
import { CreateContextCommand } from './create-context.command';
import { Logger } from '../../../../public/utils/logger';

/**
 * CreateContext命令处理器
 */
export class CreateContextHandler {
  private readonly logger = new Logger('CreateContextHandler');
  
  /**
   * 构造函数
   */
  constructor(private readonly contextService: ContextManagementService) {}
  
  /**
   * 执行命令
   * @returns 操作结果，成功时包含新创建的Context ID
   */
  async execute(command: CreateContextCommand): Promise<ContextOperationResult> {
    this.logger.debug('Executing CreateContext command', { name: command.name });
    
    try {
      // 调用应用服务创建Context
      return await this.contextService.createContext({
        name: command.name,
        description: command.description,
        lifecycleStage: command.lifecycleStage,
        status: command.status,
        configuration: command.configuration,
        metadata: command.metadata
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('Error executing CreateContext command', error);
      throw new Error(`Failed to create context: ${errorMessage}`);
    }
  }
} 