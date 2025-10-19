/**
 * MPLP事务管理器
 *
 * @description L3层统一事务管理，提供分布式事务和一致性保证
 * @version 1.0.0
 * @integration 与所有10个模块统一集成
 */
/**
 * 事务状态枚举
 */
export type TransactionStatus = 'active' | 'committed' | 'aborted' | 'preparing' | 'prepared';
/**
 * 事务操作接口
 */
export interface TransactionOperation {
    id: string;
    module: string;
    operation: string;
    parameters: Record<string, unknown>;
    compensationOperation?: string;
    compensationParameters?: Record<string, unknown>;
}
/**
 * 事务接口
 */
export interface Transaction {
    id: string;
    status: TransactionStatus;
    operations: TransactionOperation[];
    startTime: string;
    endTime?: string;
    timeout?: number;
}
/**
 * MPLP事务管理器
 *
 * @description 统一的事务管理实现，等待CoreOrchestrator激活
 */
export declare class MLPPTransactionManager {
    private transactions;
    /**
     * 开始新事务
     */
    beginTransaction(_timeout?: number): Promise<string>;
    /**
     * 添加事务操作
     */
    addOperation(_transactionId: string, _operation: Omit<TransactionOperation, 'id'>): Promise<boolean>;
    /**
     * 提交事务
     */
    commitTransaction(_transactionId: string): Promise<boolean>;
    /**
     * 回滚事务
     */
    rollbackTransaction(_transactionId: string): Promise<boolean>;
    /**
     * 中止事务
     */
    abortTransaction(_transactionId: string): Promise<boolean>;
    /**
     * 获取事务状态
     */
    getTransaction(_transactionId: string): Transaction | null;
    /**
     * 健康检查
     */
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=transaction-manager.d.ts.map