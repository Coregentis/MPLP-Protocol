/**
 * @fileoverview Protocol Inspector - Inspect MPLP protocol messages
 * @version 1.1.0-beta
 * @author MPLP Team
 */

import { MPLPEventManager } from '../utils/MPLPEventManager';
import { DebugConfig, ProtocolInspectionData } from '../types/debug';

/**
 * Protocol inspector for inspecting MPLP protocol messages
 */
export class ProtocolInspector {
  private eventManager: MPLPEventManager;
  private config: DebugConfig;
  private inspectedMessages: ProtocolInspectionData[] = [];
  private isActive = false;
  private readonly maxMessages = 1000;

  constructor(config: DebugConfig) {
    this.eventManager = new MPLPEventManager();
    this.config = config;
  }

  // EventEmitter兼容方法 - 基于MPLP V1.0 Alpha架构
  public on(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.on(event, listener);
    return this;
  }

  public emit(event: string, ...args: any[]): boolean {
    return this.eventManager.emit(event, ...args);
  }

  public off(event: string, listener: (...args: any[]) => void): this {
    this.eventManager.off(event, listener);
    return this;
  }

  public removeAllListeners(event?: string): this {
    this.eventManager.removeAllListeners(event);
    return this;
  }

  /**
   * Start protocol inspection
   */
  async start(): Promise<void> {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.emit('started');
  }

  /**
   * Stop protocol inspection
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    this.inspectedMessages = [];
    this.isActive = false;
    this.emit('stopped');
  }

  /**
   * Inspect protocol message
   */
  inspectMessage(data: Omit<ProtocolInspectionData, 'timestamp'>): void {
    if (!this.isActive) {
      return;
    }

    const inspectionData: ProtocolInspectionData = {
      ...data,
      timestamp: new Date()
    };

    this.inspectedMessages.push(inspectionData);

    // Keep only the most recent messages
    if (this.inspectedMessages.length > this.maxMessages) {
      this.inspectedMessages = this.inspectedMessages.slice(-this.maxMessages);
    }

    this.emit('messageInspected', inspectionData);
  }

  /**
   * Get all inspected messages
   */
  getAllMessages(): ProtocolInspectionData[] {
    return [...this.inspectedMessages];
  }

  /**
   * Get messages by type
   */
  getMessagesByType(messageType: string): ProtocolInspectionData[] {
    return this.inspectedMessages.filter(msg => msg.messageType === messageType);
  }

  /**
   * Get messages by source
   */
  getMessagesBySource(source: string): ProtocolInspectionData[] {
    return this.inspectedMessages.filter(msg => msg.source === source);
  }

  /**
   * Get messages by destination
   */
  getMessagesByDestination(destination: string): ProtocolInspectionData[] {
    return this.inspectedMessages.filter(msg => msg.destination === destination);
  }

  /**
   * Get messages in time range
   */
  getMessagesInTimeRange(startTime: Date, endTime: Date): ProtocolInspectionData[] {
    return this.inspectedMessages.filter(msg => 
      msg.timestamp >= startTime && msg.timestamp <= endTime
    );
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.inspectedMessages = [];
    this.emit('messagesCleared');
  }

  /**
   * Get debugging statistics
   */
  getStatistics(): any {
    const messageTypes = new Map<string, number>();
    const sources = new Map<string, number>();
    const destinations = new Map<string, number>();

    this.inspectedMessages.forEach(msg => {
      messageTypes.set(msg.messageType, (messageTypes.get(msg.messageType) || 0) + 1);
      sources.set(msg.source, (sources.get(msg.source) || 0) + 1);
      destinations.set(msg.destination, (destinations.get(msg.destination) || 0) + 1);
    });

    return {
      isActive: this.isActive,
      totalMessages: this.inspectedMessages.length,
      messageTypes: Object.fromEntries(messageTypes),
      sources: Object.fromEntries(sources),
      destinations: Object.fromEntries(destinations),
      timeRange: this.getTimeRange()
    };
  }

  /**
   * Get time range of messages
   */
  private getTimeRange(): { start?: Date; end?: Date } {
    if (this.inspectedMessages.length === 0) {
      return {};
    }

    const timestamps = this.inspectedMessages.map(msg => msg.timestamp);
    return {
      start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
      end: new Date(Math.max(...timestamps.map(t => t.getTime())))
    };
  }
}
