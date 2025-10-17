export type TransactionStatus = 'active' | 'committed' | 'aborted' | 'preparing' | 'prepared';
export interface TransactionOperation {
    id: string;
    module: string;
    operation: string;
    parameters: Record<string, unknown>;
    compensationOperation?: string;
    compensationParameters?: Record<string, unknown>;
}
export interface Transaction {
    id: string;
    status: TransactionStatus;
    operations: TransactionOperation[];
    startTime: string;
    endTime?: string;
    timeout?: number;
}
export declare class MLPPTransactionManager {
    private transactions;
    beginTransaction(_timeout?: number): Promise<string>;
    addOperation(_transactionId: string, _operation: Omit<TransactionOperation, 'id'>): Promise<boolean>;
    commitTransaction(_transactionId: string): Promise<boolean>;
    rollbackTransaction(_transactionId: string): Promise<boolean>;
    abortTransaction(_transactionId: string): Promise<boolean>;
    getTransaction(_transactionId: string): Transaction | null;
    healthCheck(): Promise<boolean>;
}
//# sourceMappingURL=transaction-manager.d.ts.map