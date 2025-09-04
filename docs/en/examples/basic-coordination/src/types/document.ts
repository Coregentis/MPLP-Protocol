/**
 * Type definitions for document processing example
 * 
 * This file contains all the TypeScript interfaces and types
 * used throughout the document processing pipeline.
 */

/**
 * Represents a document to be processed
 */
export interface Document {
  /** Unique document identifier */
  id: string;
  
  /** Original filename */
  filename: string;
  
  /** Document type/format */
  type: 'pdf' | 'docx' | 'txt' | 'pptx' | 'xlsx' | 'unknown';
  
  /** File size in bytes */
  size: number;
  
  /** File path or URL */
  path: string;
  
  /** Additional metadata */
  metadata?: {
    uploadedAt?: string;
    source?: string;
    tags?: string[];
    priority?: 'low' | 'normal' | 'high';
    [key: string]: any;
  };
}

/**
 * Represents a parsed document with extracted content
 */
export interface ParsedDocument {
  /** Original document ID */
  id: string;
  
  /** Extracted title */
  title: string;
  
  /** Extracted text content */
  content: string;
  
  /** Parsing metadata */
  metadata: {
    /** Number of pages */
    pageCount: number;
    
    /** Word count */
    wordCount: number;
    
    /** Detected language */
    language: string;
    
    /** Extraction timestamp */
    extractedAt: string;
    
    /** Parser version */
    parserVersion?: string;
    
    /** Confidence score */
    confidence?: number;
  };
}

/**
 * Represents analysis results for a document
 */
export interface AnalysisResult {
  /** Document ID */
  documentId: string;
  
  /** Document classification */
  classification: {
    /** Primary category */
    category: string;
    
    /** Confidence score (0-1) */
    confidence: number;
    
    /** Subcategories */
    subcategories?: string[];
  };
  
  /** Sentiment analysis */
  sentiment?: {
    /** Overall sentiment */
    overall: 'positive' | 'negative' | 'neutral';
    
    /** Sentiment score (-1 to 1) */
    score: number;
    
    /** Confidence level */
    confidence: number;
  };
  
  /** Extracted keywords */
  keywords: Array<{
    /** Keyword text */
    text: string;
    
    /** Relevance score */
    relevance: number;
    
    /** Frequency count */
    frequency: number;
  }>;
  
  /** Named entities */
  entities?: Array<{
    /** Entity text */
    text: string;
    
    /** Entity type */
    type: 'person' | 'organization' | 'location' | 'date' | 'other';
    
    /** Confidence score */
    confidence: number;
  }>;
  
  /** Analysis metadata */
  metadata: {
    /** Analysis timestamp */
    analyzedAt: string;
    
    /** Analyzer version */
    analyzerVersion: string;
    
    /** Processing time in milliseconds */
    processingTimeMs: number;
  };
}

/**
 * Represents a task to be processed by an agent
 */
export interface Task {
  /** Unique task identifier */
  id: string;
  
  /** Task type */
  type: 'parse' | 'analyze' | 'report' | 'custom';
  
  /** Task data payload */
  data: any;
  
  /** Task start time */
  startTime: number;
  
  /** Task priority */
  priority: 'low' | 'normal' | 'high';
  
  /** Task metadata */
  metadata?: {
    /** Assigned agent ID */
    assignedTo?: string;
    
    /** Task dependencies */
    dependencies?: string[];
    
    /** Timeout in milliseconds */
    timeoutMs?: number;
    
    /** Retry count */
    retryCount?: number;
    
    /** Maximum retries */
    maxRetries?: number;
  };
}

/**
 * Represents the result of a task execution
 */
export interface TaskResult {
  /** Task ID */
  taskId?: string;
  
  /** Success flag */
  success: boolean;
  
  /** Result data (if successful) */
  data?: any;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Result metadata */
  metadata: {
    /** Processing agent ID */
    agentId: string;
    
    /** Processing time in milliseconds */
    processingTime?: number;
    
    /** Completion timestamp */
    completedAt?: string;
    
    /** Failure reason (if failed) */
    failureReason?: string;
    
    /** Additional metrics */
    metrics?: {
      memoryUsed?: number;
      cpuTime?: number;
      [key: string]: any;
    };
  };
}

/**
 * Represents the final processing result
 */
export interface ProcessingResult {
  /** Total number of documents processed */
  totalDocuments: number;
  
  /** Number of successfully processed documents */
  successfulDocuments: number;
  
  /** Number of failed documents */
  failedDocuments: number;
  
  /** Overall success rate (0-1) */
  successRate: number;
  
  /** Total processing time in milliseconds */
  processingTimeMs: number;
  
  /** Number of agents utilized */
  agentsUtilized: number;
  
  /** Detailed results for each document */
  documentResults: Array<{
    /** Document ID */
    documentId: string;
    
    /** Processing status */
    status: 'success' | 'failed' | 'skipped';
    
    /** Parsed document (if successful) */
    parsedDocument?: ParsedDocument;
    
    /** Analysis result (if successful) */
    analysisResult?: AnalysisResult;
    
    /** Error details (if failed) */
    error?: {
      message: string;
      code: string;
      stage: 'parsing' | 'analysis' | 'reporting';
    };
    
    /** Processing metrics */
    metrics: {
      /** Total processing time */
      totalTimeMs: number;
      
      /** Parsing time */
      parseTimeMs?: number;
      
      /** Analysis time */
      analysisTimeMs?: number;
      
      /** Memory usage */
      memoryUsed?: number;
    };
  }>;
  
  /** Overall processing metrics */
  overallMetrics: {
    /** Average processing time per document */
    avgProcessingTimeMs: number;
    
    /** Peak memory usage */
    peakMemoryUsage: number;
    
    /** Total CPU time */
    totalCpuTimeMs: number;
    
    /** Throughput (documents per second) */
    throughput: number;
  };
  
  /** Processing summary */
  summary: {
    /** Most common document type */
    mostCommonType: string;
    
    /** Most common classification */
    mostCommonClassification: string;
    
    /** Average confidence score */
    avgConfidenceScore: number;
    
    /** Top keywords across all documents */
    topKeywords: Array<{
      text: string;
      frequency: number;
    }>;
  };
  
  /** Report generation timestamp */
  generatedAt: string;
  
  /** Report version */
  reportVersion: string;
}

/**
 * Agent capability definition
 */
export interface AgentCapability {
  /** Capability name */
  name: string;
  
  /** Capability version */
  version: string;
  
  /** Supported operations */
  operations: string[];
  
  /** Performance characteristics */
  performance?: {
    /** Average processing time */
    avgProcessingTimeMs: number;
    
    /** Maximum throughput */
    maxThroughput: number;
    
    /** Memory requirements */
    memoryRequirementMB: number;
  };
}

/**
 * Agent status information
 */
export interface AgentStatus {
  /** Agent ID */
  agentId: string;
  
  /** Current status */
  status: 'idle' | 'busy' | 'error' | 'offline';
  
  /** Current task count */
  currentTasks: number;
  
  /** Maximum concurrent tasks */
  maxTasks: number;
  
  /** Last heartbeat timestamp */
  lastHeartbeat: string;
  
  /** Performance metrics */
  metrics: {
    /** Total tasks processed */
    totalTasksProcessed: number;
    
    /** Success rate */
    successRate: number;
    
    /** Average processing time */
    avgProcessingTimeMs: number;
    
    /** Current memory usage */
    memoryUsageMB: number;
    
    /** CPU utilization percentage */
    cpuUtilization: number;
  };
}
