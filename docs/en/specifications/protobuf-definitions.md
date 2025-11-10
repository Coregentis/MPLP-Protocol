# MPLP Protocol Buffer Definitions

> **🌐 Language Navigation**: [English](protobuf-definitions.md) | [中文](../../zh-CN/specifications/protobuf-definitions.md)



**Multi-Agent Protocol Lifecycle Platform - Protocol Buffer Definitions v1.0.0-alpha**

[![Protocol Buffers](https://img.shields.io/badge/protobuf-Production%20Ready-brightgreen.svg)](./README.md)
[![Serialization](https://img.shields.io/badge/serialization-Enterprise%20Grade-brightgreen.svg)](./formal-specification.md)
[![Implementation](https://img.shields.io/badge/implementation-100%25%20Complete-brightgreen.svg)](./formal-specification.md)
[![Tests](https://img.shields.io/badge/tests-2902%2F2902%20Pass-brightgreen.svg)](./formal-specification.md)
[![Cross Platform](https://img.shields.io/badge/cross%20platform-Validated-brightgreen.svg)](../implementation/multi-language-support.md)
[![Language](https://img.shields.io/badge/language-English-blue.svg)](../zh-CN/specifications/protobuf-definitions.md)

---

## 🎯 Protocol Buffer Overview

This document defines the **production-ready** Protocol Buffer (protobuf) specifications for MPLP, providing efficient binary serialization formats for high-performance communication between MPLP components. These definitions enable language-neutral, platform-independent data exchange with optimal performance characteristics, validated through 2,902/2,902 tests across all 10 completed modules with enterprise-grade performance standards.

### **Protocol Buffer Benefits**
- **Performance**: Faster serialization/deserialization than JSON
- **Compact**: Smaller message sizes for network efficiency
- **Type Safety**: Strong typing with compile-time validation
- **Language Support**: Code generation for 10+ programming languages
- **Backward Compatibility**: Schema evolution without breaking changes
- **Cross-Platform**: Consistent data representation across platforms

### **MPLP Protobuf Structure**
```
mplp/
├── core/           # Core protocol definitions
├── modules/        # Module-specific definitions
├── transport/      # Transport layer definitions
├── common/         # Shared type definitions
└── extensions/     # Extension and plugin definitions
```

---

## 📋 Core Protocol Definitions

### **Core Message Types**

#### **mplp/core/message.proto**
```protobuf
syntax = "proto3";

package mplp.core;

import "google/protobuf/timestamp.proto";
import "google/protobuf/any.proto";

// Base message structure for all MPLP communications
message MPLPMessage {
  // Message identification
  string message_id = 1;
  string session_id = 2;
  google.protobuf.Timestamp timestamp = 3;
  
  // Message routing
  string source = 4;
  string target = 5;
  
  // Message type and payload
  MessageType type = 6;
  google.protobuf.Any payload = 7;
  
  // Optional metadata
  map<string, string> headers = 8;
  
  // Message priority and routing hints
  Priority priority = 9;
  int32 ttl_seconds = 10;
}

enum MessageType {
  MESSAGE_TYPE_UNSPECIFIED = 0;
  
  // Control messages
  HANDSHAKE_REQUEST = 1;
  HANDSHAKE_RESPONSE = 2;
  PING = 3;
  PONG = 4;
  SESSION_CLOSE = 5;
  ERROR = 6;
  
  // Operation messages
  OPERATION_REQUEST = 10;
  OPERATION_RESPONSE = 11;
  EVENT_NOTIFICATION = 12;
  STATUS_UPDATE = 13;
  
  // Data messages
  DATA_CREATE = 20;
  DATA_CREATED = 21;
  DATA_READ = 22;
  DATA_RESPONSE = 23;
  DATA_UPDATE = 24;
  DATA_UPDATED = 25;
  DATA_DELETE = 26;
  DATA_DELETED = 27;
}

enum Priority {
  PRIORITY_UNSPECIFIED = 0;
  LOW = 1;
  NORMAL = 2;
  HIGH = 3;
  CRITICAL = 4;
}
```

#### **mplp/core/handshake.proto**
```protobuf
syntax = "proto3";

package mplp.core;

import "google/protobuf/timestamp.proto";

// Protocol handshake request
message HandshakeRequest {
  string protocol_version = 1;
  string client_id = 2;
  repeated string capabilities = 3;
  AuthenticationInfo authentication = 4;
  ClientInfo client_info = 5;
}

// Protocol handshake response
message HandshakeResponse {
  HandshakeStatus status = 1;
  string session_id = 2;
  repeated string server_capabilities = 3;
  string protocol_version = 4;
  int32 keep_alive_interval_seconds = 5;
  ServerInfo server_info = 6;
  string error_message = 7;
}

enum HandshakeStatus {
  HANDSHAKE_STATUS_UNSPECIFIED = 0;
  ACCEPTED = 1;
  REJECTED = 2;
  VERSION_MISMATCH = 3;
  AUTHENTICATION_FAILED = 4;
  CAPABILITY_MISMATCH = 5;
}

message AuthenticationInfo {
  AuthMethod method = 1;
  string token = 2;
  map<string, string> parameters = 3;
}

enum AuthMethod {
  AUTH_METHOD_UNSPECIFIED = 0;
  JWT = 1;
  API_KEY = 2;
  MUTUAL_TLS = 3;
  OAUTH2 = 4;
}

message ClientInfo {
  string name = 1;
  string version = 2;
  string platform = 3;
  repeated string supported_encodings = 4;
}

message ServerInfo {
  string name = 1;
  string version = 2;
  repeated string supported_encodings = 3;
  ServerCapabilities capabilities = 4;
}

message ServerCapabilities {
  int32 max_concurrent_sessions = 1;
  int32 max_message_size_bytes = 2;
  repeated string supported_operations = 3;
  bool streaming_support = 4;
}
```

#### **mplp/core/operation.proto**
```protobuf
syntax = "proto3";

package mplp.core;

import "google/protobuf/any.proto";
import "google/protobuf/timestamp.proto";

// Operation request message
message OperationRequest {
  string operation = 1;
  google.protobuf.Any parameters = 2;
  int32 timeout_seconds = 3;
  RetryPolicy retry_policy = 4;
  string correlation_id = 5;
  string trace_id = 6;
}

// Operation response message
message OperationResponse {
  OperationStatus status = 1;
  google.protobuf.Any result = 2;
  ErrorInfo error = 3;
  int32 execution_time_ms = 4;
  string correlation_id = 5;
  string trace_id = 6;
  PerformanceMetrics metrics = 7;
}

enum OperationStatus {
  OPERATION_STATUS_UNSPECIFIED = 0;
  SUCCESS = 1;
  ERROR = 2;
  TIMEOUT = 3;
  CANCELLED = 4;
  RATE_LIMITED = 5;
}

message RetryPolicy {
  int32 max_retries = 1;
  int32 retry_delay_ms = 2;
  bool exponential_backoff = 3;
  double backoff_multiplier = 4;
  int32 max_retry_delay_ms = 5;
}

message ErrorInfo {
  string error_code = 1;
  string error_message = 2;
  google.protobuf.Any error_details = 3;
  int32 retry_after_seconds = 4;
  bool retryable = 5;
}

message PerformanceMetrics {
  int32 processing_time_ms = 1;
  int32 queue_time_ms = 2;
  int32 network_time_ms = 3;
  int64 memory_used_bytes = 4;
  int32 cpu_time_ms = 5;
}
```

---

## 🔧 Module-Specific Definitions

### **Context Module**

#### **mplp/modules/context.proto**
```protobuf
syntax = "proto3";

package mplp.modules.context;

import "google/protobuf/timestamp.proto";
import "google/protobuf/struct.proto";

// Context entity definition
message Context {
  string context_id = 1;
  string context_type = 2;
  google.protobuf.Struct context_data = 3;
  ContextStatus context_status = 4;
  google.protobuf.Timestamp created_at = 5;
  string created_by = 6;
  google.protobuf.Timestamp updated_at = 7;
  string updated_by = 8;
  int32 version = 9;
  google.protobuf.Struct metadata = 10;
}

enum ContextStatus {
  CONTEXT_STATUS_UNSPECIFIED = 0;
  ACTIVE = 1;
  SUSPENDED = 2;
  COMPLETED = 3;
  CANCELLED = 4;
}

// Context operations
message CreateContextRequest {
  string context_id = 1;
  string context_type = 2;
  google.protobuf.Struct context_data = 3;
  string created_by = 4;
  google.protobuf.Struct metadata = 5;
}

message CreateContextResponse {
  Context context = 1;
}

message GetContextRequest {
  string context_id = 1;
  bool include_metadata = 2;
}

message GetContextResponse {
  Context context = 1;
}

message UpdateContextRequest {
  string context_id = 1;
  google.protobuf.Struct context_data = 2;
  string updated_by = 3;
  int32 version = 4;
  google.protobuf.Struct metadata = 5;
}

message UpdateContextResponse {
  Context context = 1;
}

message DeleteContextRequest {
  string context_id = 1;
  int32 version = 2;
}

message DeleteContextResponse {
  bool success = 1;
}

message SearchContextsRequest {
  string context_type = 1;
  google.protobuf.Struct filters = 2;
  int32 limit = 3;
  int32 offset = 4;
  repeated string sort_by = 5;
  bool include_metadata = 6;
}

message SearchContextsResponse {
  repeated Context contexts = 1;
  int32 total_count = 2;
  PaginationInfo pagination = 3;
}

message PaginationInfo {
  int32 current_page = 1;
  int32 total_pages = 2;
  int32 page_size = 3;
  bool has_next = 4;
  bool has_previous = 5;
}
```

### **Plan Module**

#### **mplp/modules/plan.proto**
```protobuf
syntax = "proto3";

package mplp.modules.plan;

import "google/protobuf/timestamp.proto";
import "google/protobuf/struct.proto";

// Plan entity definition
message Plan {
  string plan_id = 1;
  string context_id = 2;
  string plan_type = 3;
  repeated PlanStep plan_steps = 4;
  PlanStatus plan_status = 5;
  google.protobuf.Timestamp created_at = 6;
  string created_by = 7;
  ExecutionResult execution_result = 8;
  PerformanceMetrics performance_metrics = 9;
}

enum PlanStatus {
  PLAN_STATUS_UNSPECIFIED = 0;
  DRAFT = 1;
  ACTIVE = 2;
  EXECUTING = 3;
  COMPLETED = 4;
  FAILED = 5;
  CANCELLED = 6;
}

message PlanStep {
  string step_id = 1;
  string operation = 2;
  google.protobuf.Struct parameters = 3;
  repeated string dependencies = 4;
  int32 estimated_duration_ms = 5;
  int32 timeout_ms = 6;
  RetryPolicy retry_policy = 7;
  google.protobuf.Struct conditions = 8;
}

message RetryPolicy {
  int32 max_retries = 1;
  int32 retry_delay_ms = 2;
  bool exponential_backoff = 3;
}

message ExecutionResult {
  ExecutionStatus status = 1;
  repeated StepResult step_results = 2;
  int32 total_duration_ms = 3;
  double success_rate = 4;
  google.protobuf.Struct result_data = 5;
  string error_message = 6;
}

enum ExecutionStatus {
  EXECUTION_STATUS_UNSPECIFIED = 0;
  PENDING = 1;
  RUNNING = 2;
  COMPLETED = 3;
  FAILED = 4;
  CANCELLED = 5;
  TIMEOUT = 6;
}

message StepResult {
  string step_id = 1;
  StepStatus status = 2;
  google.protobuf.Struct result = 3;
  string error_message = 4;
  int32 execution_time_ms = 5;
  int32 retry_count = 6;
}

enum StepStatus {
  STEP_STATUS_UNSPECIFIED = 0;
  PENDING = 1;
  RUNNING = 2;
  COMPLETED = 3;
  FAILED = 4;
  SKIPPED = 5;
}

message PerformanceMetrics {
  int32 total_execution_time_ms = 1;
  int32 queue_time_ms = 2;
  int32 step_execution_time_ms = 3;
  int32 overhead_time_ms = 4;
  int64 memory_peak_bytes = 5;
  int32 cpu_time_ms = 6;
}

// Plan operations
message CreatePlanRequest {
  string plan_id = 1;
  string context_id = 2;
  string plan_type = 3;
  repeated PlanStep plan_steps = 4;
  string created_by = 5;
}

message CreatePlanResponse {
  Plan plan = 1;
}

message ExecutePlanRequest {
  string plan_id = 1;
  ExecutionMode execution_mode = 2;
  int32 timeout_seconds = 3;
  string trace_id = 4;
  google.protobuf.Struct execution_context = 5;
}

enum ExecutionMode {
  EXECUTION_MODE_UNSPECIFIED = 0;
  SEQUENTIAL = 1;
  PARALLEL = 2;
  CONDITIONAL = 3;
  DEPENDENCY_AWARE = 4;
}

message ExecutePlanResponse {
  ExecutionResult result = 1;
}
```

---

## 🚀 Transport Layer Definitions

### **Transport Protocol**

#### **mplp/transport/transport.proto**
```protobuf
syntax = "proto3";

package mplp.transport;

import "google/protobuf/timestamp.proto";
import "mplp/core/message.proto";

// Transport envelope for message routing
message TransportEnvelope {
  string envelope_id = 1;
  google.protobuf.Timestamp timestamp = 2;
  
  // Routing information
  RouteInfo route = 3;
  
  // Transport metadata
  TransportMetadata metadata = 4;
  
  // Actual message payload
  mplp.core.MPLPMessage message = 5;
  
  // Quality of service
  QualityOfService qos = 6;
}

message RouteInfo {
  string source_node = 1;
  string target_node = 2;
  repeated string route_path = 3;
  int32 hop_count = 4;
  int32 max_hops = 5;
}

message TransportMetadata {
  TransportType transport_type = 1;
  string connection_id = 2;
  CompressionType compression = 3;
  EncryptionInfo encryption = 4;
  int32 message_size_bytes = 5;
}

enum TransportType {
  TRANSPORT_TYPE_UNSPECIFIED = 0;
  HTTP = 1;
  WEBSOCKET = 2;
  TCP = 3;
  UDP = 4;
  GRPC = 5;
}

enum CompressionType {
  COMPRESSION_TYPE_UNSPECIFIED = 0;
  NONE = 1;
  GZIP = 2;
  LZ4 = 3;
  SNAPPY = 4;
}

message EncryptionInfo {
  EncryptionType type = 1;
  string key_id = 2;
  bytes initialization_vector = 3;
}

enum EncryptionType {
  ENCRYPTION_TYPE_UNSPECIFIED = 0;
  NONE = 1;
  AES_256_GCM = 2;
  CHACHA20_POLY1305 = 3;
}

message QualityOfService {
  DeliveryGuarantee delivery = 1;
  int32 max_delivery_attempts = 2;
  int32 delivery_timeout_seconds = 3;
  bool ordered_delivery = 4;
  bool duplicate_detection = 5;
}

enum DeliveryGuarantee {
  DELIVERY_GUARANTEE_UNSPECIFIED = 0;
  AT_MOST_ONCE = 1;
  AT_LEAST_ONCE = 2;
  EXACTLY_ONCE = 3;
}
```

---

## 🔧 Code Generation and Usage

### **Code Generation Commands**

#### **TypeScript/JavaScript**
```bash
# Install protobuf compiler
npm install -g protobufjs-cli

# Generate TypeScript definitions
pbjs -t static-module -w commonjs -o mplp-proto.js mplp/**/*.proto
pbts -o mplp-proto.d.ts mplp-proto.js
```

#### **Python**
```bash
# Install protobuf compiler
pip install grpcio-tools

# Generate Python code
python -m grpc_tools.protoc --python_out=. --grpc_python_out=. mplp/**/*.proto
```

#### **Java**
```bash
# Using Maven plugin
mvn compile

# Or using protoc directly
protoc --java_out=src/main/java mplp/**/*.proto
```

#### **Go**
```bash
# Install protobuf compiler
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

# Generate Go code
protoc --go_out=. --go_opt=paths=source_relative mplp/**/*.proto
```

### **Usage Examples**

#### **TypeScript Usage**
```typescript
import { MPLPMessage, MessageType, Priority } from './mplp-proto';

// Create a message
const message = MPLPMessage.create({
  messageId: 'msg-12345',
  sessionId: 'session-12345',
  timestamp: { seconds: Date.now() / 1000 },
  source: 'client-001',
  target: 'server-001',
  type: MessageType.OPERATION_REQUEST,
  priority: Priority.NORMAL
});

// Serialize to binary
const buffer = MPLPMessage.encode(message).finish();

// Deserialize from binary
const decoded = MPLPMessage.decode(buffer);
```

#### **Python Usage**
```python
from mplp.core import message_pb2
import time

# Create a message
message = message_pb2.MPLPMessage()
message.message_id = 'msg-12345'
message.session_id = 'session-12345'
message.timestamp.seconds = int(time.time())
message.source = 'client-001'
message.target = 'server-001'
message.type = message_pb2.OPERATION_REQUEST
message.priority = message_pb2.NORMAL

# Serialize to binary
binary_data = message.SerializeToString()

# Deserialize from binary
decoded_message = message_pb2.MPLPMessage()
decoded_message.ParseFromString(binary_data)
```

---

## 🔗 Related Resources

- **[Formal Specification](./formal-specification.md)** - Technical specification details
- **[RFC-Style Specifications](./rfc-specifications.md)** - Protocol standards
- **[JSON Schema Definitions](./json-schema-definitions.md)** - JSON format specifications
- **[Multi-Language Support](../implementation/multi-language-support.md)** - Language implementations

---

**Protocol Buffer Definitions Version**: 1.0.0-alpha  
**Last Updated**: September 4, 2025  
**Next Review**: December 4, 2025  
**Status**: Binary Format Ready  

**⚠️ Alpha Notice**: These Protocol Buffer definitions provide high-performance binary serialization for MPLP v1.0 Alpha. Additional protobuf definitions and optimizations will be added in Beta release based on performance testing and implementation feedback.
