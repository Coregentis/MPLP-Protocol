/**
 * @fileoverview Protocol Inspector - Inspect MPLP protocol messages
 * @version 1.1.0-beta
 * @author MPLP Team
 */
import { EventEmitter } from 'events';
import { DebugConfig, ProtocolInspectionData } from '../types/debug';
/**
 * Protocol inspector for inspecting MPLP protocol messages
 */
export declare class ProtocolInspector extends EventEmitter {
    private config;
    private inspectedMessages;
    private isActive;
    private readonly maxMessages;
    constructor(config: DebugConfig);
    /**
     * Start protocol inspection
     */
    start(): Promise<void>;
    /**
     * Stop protocol inspection
     */
    stop(): Promise<void>;
    /**
     * Inspect protocol message
     */
    inspectMessage(data: Omit<ProtocolInspectionData, 'timestamp'>): void;
    /**
     * Get all inspected messages
     */
    getAllMessages(): ProtocolInspectionData[];
    /**
     * Get messages by type
     */
    getMessagesByType(messageType: string): ProtocolInspectionData[];
    /**
     * Get messages by source
     */
    getMessagesBySource(source: string): ProtocolInspectionData[];
    /**
     * Get messages by destination
     */
    getMessagesByDestination(destination: string): ProtocolInspectionData[];
    /**
     * Get messages in time range
     */
    getMessagesInTimeRange(startTime: Date, endTime: Date): ProtocolInspectionData[];
    /**
     * Clear all messages
     */
    clearMessages(): void;
    /**
     * Get debugging statistics
     */
    getStatistics(): any;
    /**
     * Get time range of messages
     */
    private getTimeRange;
}
//# sourceMappingURL=ProtocolInspector.d.ts.map