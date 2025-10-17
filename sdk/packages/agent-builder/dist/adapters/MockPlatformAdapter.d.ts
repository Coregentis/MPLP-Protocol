/**
 * @fileoverview Mock Platform Adapter for testing and examples
 * @version 1.1.0-beta
 */
import { PlatformConfig } from '../types';
import { BasePlatformAdapter } from './BasePlatformAdapter';
/**
 * Mock platform adapter for testing and demonstration purposes
 */
export declare class MockPlatformAdapter extends BasePlatformAdapter {
    readonly name: string;
    readonly version: string;
    private _simulateLatency;
    private _simulateErrors;
    private _connectionDelay;
    private _messageDelay;
    private _errorRate;
    private _messageHistory;
    /**
     * Validate adapter configuration
     */
    protected _validateConfig(config: PlatformConfig): Promise<void>;
    /**
     * Initialize adapter with configuration
     */
    protected _doInitialize(config: PlatformConfig): Promise<void>;
    /**
     * Connect to the platform
     */
    protected _doConnect(): Promise<void>;
    /**
     * Disconnect from the platform
     */
    protected _doDisconnect(): Promise<void>;
    /**
     * Send a message through the platform
     */
    protected _doSendMessage(message: unknown): Promise<void>;
    /**
     * Cleanup implementation-specific resources
     */
    protected _doDestroy(): Promise<void>;
    /**
     * Get message history (for testing)
     */
    getMessageHistory(): unknown[];
    /**
     * Clear message history (for testing)
     */
    clearMessageHistory(): void;
    /**
     * Simulate receiving a message (for testing)
     */
    simulateIncomingMessage(message: unknown): void;
    /**
     * Get adapter statistics (for testing)
     */
    getStats(): {
        messagesSent: number;
        messagesReceived: number;
        errorCount: number;
        uptime?: number | undefined;
    };
    /**
     * Configure error simulation (for testing)
     */
    setErrorRate(rate: number): void;
    /**
     * Configure latency simulation (for testing)
     */
    setLatencyConfig(connectionDelay: number, messageDelay: number): void;
    /**
     * Enable/disable error simulation (for testing)
     */
    setErrorSimulation(enabled: boolean): void;
    /**
     * Enable/disable latency simulation (for testing)
     */
    setLatencySimulation(enabled: boolean): void;
}
//# sourceMappingURL=MockPlatformAdapter.d.ts.map