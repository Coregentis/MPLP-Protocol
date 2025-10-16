/**
 * @fileoverview Test Platform Adapter - Production-grade test adapter for MPLP SDK
 * @version 1.1.0-beta
 */

import { BasePlatformAdapter } from './BasePlatformAdapter';
import { PlatformConfig } from '../types';
import { PlatformConnectionError, MessageSendError } from '../types/errors';
import { delay } from '../utils';

/**
 * Test platform adapter configuration
 */
export interface TestPlatformConfig extends PlatformConfig {
  /** Whether to simulate network latency */
  simulateLatency?: boolean;
  /** Whether to simulate random errors */
  simulateErrors?: boolean;
  /** Connection delay in milliseconds */
  connectionDelay?: number;
  /** Message sending delay in milliseconds */
  messageDelay?: number;
  /** Error probability (0-1) */
  errorProbability?: number;
  /** Maximum message size */
  maxMessageSize?: number;
}

/**
 * Production-grade test platform adapter for testing MPLP SDK functionality
 * 
 * This adapter provides a real implementation suitable for testing without mocking,
 * while maintaining enterprise-grade code quality and error handling.
 */
export class TestPlatformAdapter extends BasePlatformAdapter {
  public readonly name: string = 'test';
  public readonly version: string = '1.1.0-beta';

  private _testConfig?: TestPlatformConfig;
  private _messageHistory: Array<{ message: unknown; timestamp: Date }> = [];
  private _connectionAttempts: number = 0;
  private _isConnected: boolean = false;

  /**
   * Validate test platform configuration
   */
  protected async _validateConfig(config: PlatformConfig): Promise<void> {
    const testConfig = config as TestPlatformConfig;

    // Validate connection delay
    if (testConfig.connectionDelay !== undefined) {
      if (typeof testConfig.connectionDelay !== 'number' || testConfig.connectionDelay < 0) {
        throw new Error('connectionDelay must be a non-negative number');
      }
    }

    // Validate message delay
    if (testConfig.messageDelay !== undefined) {
      if (typeof testConfig.messageDelay !== 'number' || testConfig.messageDelay < 0) {
        throw new Error('messageDelay must be a non-negative number');
      }
    }

    // Validate error probability
    if (testConfig.errorProbability !== undefined) {
      if (typeof testConfig.errorProbability !== 'number' || 
          testConfig.errorProbability < 0 || 
          testConfig.errorProbability > 1) {
        throw new Error('errorProbability must be a number between 0 and 1');
      }
    }

    // Validate max message size
    if (testConfig.maxMessageSize !== undefined) {
      if (typeof testConfig.maxMessageSize !== 'number' || testConfig.maxMessageSize <= 0) {
        throw new Error('maxMessageSize must be a positive number');
      }
    }
  }

  /**
   * Initialize the test adapter
   */
  protected async _doInitialize(config: PlatformConfig): Promise<void> {
    this._testConfig = {
      simulateLatency: false,
      simulateErrors: false,
      connectionDelay: 10,
      messageDelay: 5,
      errorProbability: 0.1,
      maxMessageSize: 1024 * 1024, // 1MB
      ...config
    } as TestPlatformConfig;

    // Reset state
    this._messageHistory = [];
    this._connectionAttempts = 0;
    this._isConnected = false;

    // Emit initialization event
    this.emit('initialized', {
      platform: this.name,
      config: this._testConfig
    });
  }

  /**
   * Connect to the test platform
   */
  protected async _doConnect(): Promise<void> {
    this._connectionAttempts++;

    // Simulate connection delay
    if (this._testConfig?.simulateLatency && this._testConfig.connectionDelay) {
      await delay(this._testConfig.connectionDelay);
    }

    // Simulate connection errors
    if (this._testConfig?.simulateErrors && this._testConfig.errorProbability) {
      if (Math.random() < this._testConfig.errorProbability) {
        throw new PlatformConnectionError(
          `Simulated connection error (attempt ${this._connectionAttempts})`,
          { platform: this.name, attempt: this._connectionAttempts }
        );
      }
    }

    this._isConnected = true;
    this.emit('connected', {
      platform: this.name,
      attempt: this._connectionAttempts,
      timestamp: new Date()
    });
  }

  /**
   * Disconnect from the test platform
   */
  protected async _doDisconnect(): Promise<void> {
    this._isConnected = false;
    this.emit('disconnected', {
      platform: this.name,
      timestamp: new Date(),
      messagesSent: this._messageHistory.length
    });
  }

  /**
   * Send a message through the test platform
   */
  protected async _doSendMessage(message: unknown): Promise<void> {
    if (!this._isConnected) {
      throw new MessageSendError('Not connected to test platform', {
        platform: this.name,
        connected: this._isConnected
      });
    }

    // Validate message size
    const messageStr = JSON.stringify(message);
    if (this._testConfig?.maxMessageSize && messageStr.length > this._testConfig.maxMessageSize) {
      throw new MessageSendError(
        `Message size (${messageStr.length}) exceeds maximum (${this._testConfig.maxMessageSize})`,
        { platform: this.name, messageSize: messageStr.length, maxSize: this._testConfig.maxMessageSize }
      );
    }

    // Simulate message delay
    if (this._testConfig?.simulateLatency && this._testConfig.messageDelay) {
      await delay(this._testConfig.messageDelay);
    }

    // Simulate message errors
    if (this._testConfig?.simulateErrors && this._testConfig.errorProbability) {
      if (Math.random() < this._testConfig.errorProbability) {
        throw new MessageSendError('Simulated message send error', {
          platform: this.name,
          message: messageStr.substring(0, 100) // Log first 100 chars for debugging
        });
      }
    }

    // Store message in history
    this._messageHistory.push({
      message,
      timestamp: new Date()
    });

    // Emit message sent event
    this.emit('messageSent', {
      platform: this.name,
      messageId: `test-msg-${this._messageHistory.length}`,
      timestamp: new Date(),
      size: messageStr.length
    });
  }

  /**
   * Clean up test adapter resources
   */
  protected async _doDestroy(): Promise<void> {
    this._isConnected = false;
    this._messageHistory = [];
    this._connectionAttempts = 0;
    
    this.emit('destroyed', {
      platform: this.name,
      timestamp: new Date()
    });
  }

  // ===== Test-specific methods for verification =====

  /**
   * Get message history for testing purposes
   */
  public getMessageHistory(): Array<{ message: unknown; timestamp: Date }> {
    return [...this._messageHistory];
  }

  /**
   * Get connection attempts count
   */
  public getConnectionAttempts(): number {
    return this._connectionAttempts;
  }

  /**
   * Check if adapter is connected
   */
  public isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Get current configuration
   */
  public getConfig(): TestPlatformConfig | undefined {
    return this._testConfig ? { ...this._testConfig } : undefined;
  }

  /**
   * Reset adapter state for testing
   */
  public reset(): void {
    this._messageHistory = [];
    this._connectionAttempts = 0;
    this._isConnected = false;
  }

  /**
   * Simulate incoming message for testing purposes
   */
  public simulateIncomingMessage(message: unknown): void {
    if (!this._isConnected) {
      throw new Error('Cannot simulate message when not connected');
    }

    // Emit message received event
    this.emit('messageReceived', {
      platform: this.name,
      message,
      timestamp: new Date()
    });
  }
}
