import { DialogEntity } from '../../domain/entities/dialog.entity';
import { DialogRepository } from '../../domain/repositories/dialog.repository';
import { type UUID } from '../../types';
export declare class DialogAdapter implements DialogRepository {
    readonly name = "dialog";
    readonly version = "1.0.0";
    private _initialized;
    private _dialogStorage;
    save(dialog: DialogEntity): Promise<DialogEntity>;
    findById(id: UUID): Promise<DialogEntity | null>;
    findByName(_name: string): Promise<DialogEntity[]>;
    findByParticipant(_participantId: string): Promise<DialogEntity[]>;
    findAll(limit?: number, offset?: number): Promise<DialogEntity[]>;
    update(_id: UUID, _dialog: DialogEntity): Promise<DialogEntity>;
    delete(id: UUID): Promise<void>;
    exists(_id: UUID): Promise<boolean>;
    count(): Promise<number>;
    search(_criteria: unknown): Promise<DialogEntity[]>;
    findActiveDialogs(): Promise<DialogEntity[]>;
    findByCapability(_capabilityType: string): Promise<DialogEntity[]>;
    integrateMessageQueue(queueConfig: unknown): Promise<void>;
    integrateCacheSystem(cacheConfig: unknown): Promise<void>;
    integrateSearchEngine(_searchConfig: unknown): Promise<void>;
    integrateMonitoringSystem(monitoringConfig: unknown): Promise<void>;
    integrateLoggingSystem(_loggingConfig: unknown): Promise<void>;
    integrateSecuritySystem(_securityConfig: unknown): Promise<void>;
    integrateNotificationSystem(_notificationConfig: unknown): Promise<void>;
    integrateFileStorageSystem(_storageConfig: unknown): Promise<void>;
    integrateAIServices(_aiConfig: unknown): Promise<void>;
    integrateDatabaseSystem(_dbConfig: unknown): Promise<void>;
    initialize(_config?: unknown): Promise<void>;
    healthCheck(): Promise<unknown>;
    shutdown(): Promise<void>;
    reconfigure(_newConfig: unknown): Promise<void>;
    isInitialized(): boolean;
    publishDialogEvent(_eventType: string, _eventData: unknown): Promise<void>;
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        adapter: {
            initialized: boolean;
            name: string;
            version: string;
        };
    }>;
    getStatistics(): Promise<{
        adapter: {
            eventBusConnected: boolean;
            coordinatorRegistered: boolean;
            totalDialogs: number;
            activeConnections: number;
        };
    }>;
    getModuleInterfaceStatus(): {
        context: string;
        plan: string;
        role: string;
        confirm: string;
        trace: string;
        extension: string;
        core: string;
        collab: string;
        network: string;
    };
    private handleDialogEvent;
    private syncDialogState;
    private warmupDialogCache;
    private setupDialogMetrics;
    private setupDialogLogging;
    private setupDialogTracing;
    private onDialogCreated;
    private onDialogUpdated;
    private onDialogCompleted;
    private onDialogError;
}
//# sourceMappingURL=dialog.adapter.d.ts.map