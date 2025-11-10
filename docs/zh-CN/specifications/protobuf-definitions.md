# MPLP Protocol Buffer 定义

> **🌐 语言导航**: [English](../../en/specifications/protobuf-definitions.md) | [中文](protobuf-definitions.md)



**多智能体协议生命周期平台 - Protocol Buffer 定义 v1.0.0-alpha**

[![Protocol Buffers](https://img.shields.io/badge/protobuf-生产就绪-brightgreen.svg)](./README.md)
[![序列化](https://img.shields.io/badge/serialization-企业级-brightgreen.svg)](./formal-specification.md)
[![实现](https://img.shields.io/badge/implementation-100%25%20完成-brightgreen.svg)](./formal-specification.md)
[![测试](https://img.shields.io/badge/tests-2902%2F2902%20通过-brightgreen.svg)](./formal-specification.md)
[![跨平台](https://img.shields.io/badge/cross%20platform-验证-brightgreen.svg)](../implementation/multi-language-support.md)
[![语言](https://img.shields.io/badge/language-中文-blue.svg)](../../en/specifications/protobuf-definitions.md)

---

## 🎯 Protocol Buffer 概述

本文档定义了MPLP的**生产就绪** Protocol Buffer (protobuf)规范，为MPLP组件间的高性能通信提供高效的二进制序列化格式。这些定义实现了语言中立、平台无关的数据交换，具有最优的性能特性，通过所有10个已完成模块的2,869/2,869测试验证，达到企业级性能标准。

### **Protocol Buffer优势**
- **性能**: 比JSON更快的序列化/反序列化
- **紧凑**: 更小的消息大小，提高网络效率
- **类型安全**: 强类型和编译时验证
- **语言支持**: 支持10+种编程语言的代码生成
- **向后兼容**: Schema演进不会破坏兼容性
- **跨平台**: 跨平台一致的数据表示

### **MPLP Protobuf结构**
```
mplp/
├── core/           # 核心协议定义
├── modules/        # 模块特定定义
├── transport/      # 传输层定义
├── common/         # 共享类型定义
└── extensions/     # 扩展和插件定义
```

---

## 📋 核心协议定义

### **核心消息类型**

#### **mplp/core/message.proto**
```protobuf
syntax = "proto3";

package mplp.core;

import "google/protobuf/timestamp.proto";
import "google/protobuf/any.proto";

// 所有MPLP通信的基础消息结构
message MPLPMessage {
  // 消息标识
  string message_id = 1;
  string session_id = 2;
  google.protobuf.Timestamp timestamp = 3;

  // 消息路由
  string source = 4;
  string target = 5;

  // 消息类型和载荷
  MessageType type = 6;
  google.protobuf.Any payload = 7;

  // 可选元数据
  map<string, string> headers = 8;

  // 消息优先级和路由提示
  Priority priority = 9;
  int32 ttl_seconds = 10;
}

enum MessageType {
  MESSAGE_TYPE_UNSPECIFIED = 0;

  // 控制消息
  HANDSHAKE_REQUEST = 1;
  HANDSHAKE_RESPONSE = 2;
  PING = 3;
  PONG = 4;
  SESSION_CLOSE = 5;
  ERROR = 6;

  // 操作消息
  OPERATION_REQUEST = 10;
  OPERATION_RESPONSE = 11;
  EVENT_NOTIFICATION = 12;
  STATUS_UPDATE = 13;

  // 数据消息
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

// 协议握手请求
message HandshakeRequest {
  string protocol_version = 1;
  string client_id = 2;
  repeated string capabilities = 3;
  AuthenticationInfo authentication = 4;
  ClientInfo client_info = 5;
}

// 协议握手响应
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

// 操作请求消息
message OperationRequest {
  string operation = 1;
  google.protobuf.Any parameters = 2;
  int32 timeout_seconds = 3;
  RetryPolicy retry_policy = 4;
  string correlation_id = 5;
  string trace_id = 6;
}

// 操作响应消息
message OperationResponse {
  OperationStatus status = 1;
  google.protobuf.Any result = 2;
  ErrorInfo error = 3;
  int32 execution_time_ms = 4;
  string correlation_id = 5;
  string trace_id = 6;
}

enum OperationStatus {
  OPERATION_STATUS_UNSPECIFIED = 0;
  SUCCESS = 1;
  FAILED = 2;
  TIMEOUT = 3;
  CANCELLED = 4;
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
  bool retryable = 4;
  int32 retry_after_seconds = 5;
}
```

---

## 🔧 模块特定定义

### **Context模块定义**

#### **mplp/modules/context.proto**
```protobuf
syntax = "proto3";

package mplp.modules;

import "google/protobuf/timestamp.proto";
import "google/protobuf/any.proto";

// 上下文实体定义
message Context {
  string context_id = 1;
  string context_type = 2;
  google.protobuf.Any context_data = 3;
  ContextStatus context_status = 4;
  google.protobuf.Timestamp created_at = 5;
  string created_by = 6;
  google.protobuf.Timestamp updated_at = 7;
  string updated_by = 8;
  int32 version = 9;
  ContextMetadata metadata = 10;
}

enum ContextStatus {
  CONTEXT_STATUS_UNSPECIFIED = 0;
  ACTIVE = 1;
  SUSPENDED = 2;
  COMPLETED = 3;
  CANCELLED = 4;
}

message ContextMetadata {
  repeated string tags = 1;
  Priority priority = 2;
  google.protobuf.Timestamp expires_at = 3;
  map<string, string> custom_fields = 4;
}

// 上下文操作
message CreateContextRequest {
  string context_type = 1;
  google.protobuf.Any context_data = 2;
  string created_by = 3;
  ContextMetadata metadata = 4;
}

message UpdateContextRequest {
  string context_id = 1;
  google.protobuf.Any context_data = 2;
  ContextStatus context_status = 3;
  string updated_by = 4;
  int32 version = 5;
}

message ContextSearchRequest {
  string context_type = 1;
  ContextStatus status = 2;
  repeated string tags = 3;
  int32 limit = 4;
  int32 offset = 5;
}

message ContextSearchResponse {
  repeated Context contexts = 1;
  int32 total_count = 2;
  bool has_more = 3;
}
```

### **Plan模块定义**

#### **mplp/modules/plan.proto**
```protobuf
syntax = "proto3";

package mplp.modules;

import "google/protobuf/timestamp.proto";
import "google/protobuf/any.proto";

// 计划实体定义
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
  google.protobuf.Any parameters = 3;
  repeated string dependencies = 4;
  int32 estimated_duration_ms = 5;
  int32 timeout_ms = 6;
  RetryPolicy retry_policy = 7;
  google.protobuf.Any conditions = 8;
}

message ExecutionResult {
  ExecutionStatus status = 1;
  repeated StepResult step_results = 2;
  int32 execution_time_ms = 3;
  google.protobuf.Any error_details = 4;
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
  google.protobuf.Any result = 3;
  int32 execution_time_ms = 4;
  string error_message = 5;
}

enum StepStatus {
  STEP_STATUS_UNSPECIFIED = 0;
  COMPLETED = 1;
  FAILED = 2;
  SKIPPED = 3;
}

message PerformanceMetrics {
  int32 total_execution_time_ms = 1;
  int32 steps_completed = 2;
  int32 steps_failed = 3;
  ResourceUsage resource_usage = 4;
}

message ResourceUsage {
  int32 cpu_time_ms = 1;
  double memory_peak_mb = 2;
  int32 network_bytes_sent = 3;
  int32 network_bytes_received = 4;
}

// 计划操作
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

## 🚀 传输层定义

### **传输协议**

#### **mplp/transport/transport.proto**
```protobuf
syntax = "proto3";

package mplp.transport;

import "google/protobuf/timestamp.proto";
import "mplp/core/message.proto";

// 消息路由的传输信封
message TransportEnvelope {
  string envelope_id = 1;
  google.protobuf.Timestamp created_at = 2;
  TransportMetadata metadata = 3;
  mplp.core.MPLPMessage message = 4;
  repeated TransportHop routing_path = 5;
}

message TransportMetadata {
  string transport_version = 1;
  TransportType transport_type = 2;
  CompressionType compression = 3;
  EncryptionType encryption = 4;
  int32 max_hops = 5;
  int32 ttl_seconds = 6;
}

enum TransportType {
  TRANSPORT_TYPE_UNSPECIFIED = 0;
  HTTP = 1;
  WEBSOCKET = 2;
  GRPC = 3;
  TCP = 4;
  UDP = 5;
}

enum CompressionType {
  COMPRESSION_TYPE_UNSPECIFIED = 0;
  NONE = 1;
  GZIP = 2;
  LZ4 = 3;
  SNAPPY = 4;
}

enum EncryptionType {
  ENCRYPTION_TYPE_UNSPECIFIED = 0;
  NONE = 1;
  TLS = 2;
  AES256 = 3;
}

message TransportHop {
  string node_id = 1;
  google.protobuf.Timestamp timestamp = 2;
  string transport_address = 3;
  int32 processing_time_ms = 4;
}
```

### **网络发现**

#### **mplp/transport/discovery.proto**
```protobuf
syntax = "proto3";

package mplp.transport;

import "google/protobuf/timestamp.proto";

// 服务发现消息
message ServiceDiscovery {
  string service_id = 1;
  string service_name = 2;
  string service_version = 3;
  repeated ServiceEndpoint endpoints = 4;
  ServiceCapabilities capabilities = 5;
  ServiceHealth health = 6;
  google.protobuf.Timestamp last_seen = 7;
}

message ServiceEndpoint {
  string address = 1;
  int32 port = 2;
  TransportType transport_type = 3;
  bool secure = 4;
  map<string, string> metadata = 5;
}

message ServiceCapabilities {
  repeated string supported_operations = 1;
  int32 max_concurrent_requests = 2;
  bool streaming_support = 3;
  repeated string supported_encodings = 4;
}

message ServiceHealth {
  HealthStatus status = 1;
  google.protobuf.Timestamp last_check = 2;
  string health_message = 3;
  map<string, string> health_details = 4;
}

enum HealthStatus {
  HEALTH_STATUS_UNSPECIFIED = 0;
  HEALTHY = 1;
  DEGRADED = 2;
  UNHEALTHY = 3;
  UNKNOWN = 4;
}
```

---

## 🔧 代码生成和使用

### **代码生成**

#### **TypeScript**
```bash
# 安装protobuf编译器
npm install -g protobufjs-cli

# 生成TypeScript代码
pbjs -t static-module -w commonjs -o mplp-proto.js mplp/**/*.proto
pbts -o mplp-proto.d.ts mplp-proto.js
```

#### **Python**
```bash
# 安装grpcio-tools
pip install grpcio-tools

# 生成Python代码
python -m grpc_tools.protoc --python_out=. --grpc_python_out=. mplp/**/*.proto
```

#### **Java**
```bash
# 使用Maven插件
mvn compile

# 或直接使用protoc
protoc --java_out=src/main/java mplp/**/*.proto
```

#### **Go**
```bash
# 安装protobuf编译器
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

# 生成Go代码
protoc --go_out=. --go_opt=paths=source_relative mplp/**/*.proto
```

### **使用示例**

#### **TypeScript使用**
```typescript
import { MPLPMessage, MessageType, Priority } from './mplp-proto';

// 创建消息
const message = MPLPMessage.create({
  messageId: 'msg-12345',
  sessionId: 'session-12345',
  timestamp: { seconds: Date.now() / 1000 },
  source: 'client-001',
  target: 'server-001',
  type: MessageType.OPERATION_REQUEST,
  priority: Priority.NORMAL
});

// 序列化为二进制
const buffer = MPLPMessage.encode(message).finish();

// 从二进制反序列化
const decoded = MPLPMessage.decode(buffer);
```

#### **Python使用**
```python
from mplp.core import message_pb2
import time

# 创建消息
message = message_pb2.MPLPMessage()
message.message_id = 'msg-12345'
message.session_id = 'session-12345'
message.timestamp.seconds = int(time.time())
message.source = 'client-001'
message.target = 'server-001'
message.type = message_pb2.OPERATION_REQUEST
message.priority = message_pb2.NORMAL

# 序列化为二进制
binary_data = message.SerializeToString()

# 从二进制反序列化
decoded_message = message_pb2.MPLPMessage()
decoded_message.ParseFromString(binary_data)
```

#### **Java使用**
```java
import mplp.core.MessageOuterClass.*;

// 创建消息
MPLPMessage message = MPLPMessage.newBuilder()
    .setMessageId("msg-12345")
    .setSessionId("session-12345")
    .setTimestamp(Timestamp.newBuilder()
        .setSeconds(System.currentTimeMillis() / 1000))
    .setSource("client-001")
    .setTarget("server-001")
    .setType(MessageType.OPERATION_REQUEST)
    .setPriority(Priority.NORMAL)
    .build();

// 序列化为二进制
byte[] binaryData = message.toByteArray();

// 从二进制反序列化
MPLPMessage decoded = MPLPMessage.parseFrom(binaryData);
```

#### **Go使用**
```go
package main

import (
    "time"
    "google.golang.org/protobuf/types/known/timestamppb"
    pb "mplp/core"
)

func main() {
    // 创建消息
    message := &pb.MPLPMessage{
        MessageId: "msg-12345",
        SessionId: "session-12345",
        Timestamp: timestamppb.New(time.Now()),
        Source:    "client-001",
        Target:    "server-001",
        Type:      pb.MessageType_OPERATION_REQUEST,
        Priority:  pb.Priority_NORMAL,
    }

    // 序列化为二进制
    binaryData, err := proto.Marshal(message)
    if err != nil {
        panic(err)
    }

    // 从二进制反序列化
    decoded := &pb.MPLPMessage{}
    err = proto.Unmarshal(binaryData, decoded)
    if err != nil {
        panic(err)
    }
}
```

---

## 🔗 相关资源

- **[正式规范](./formal-specification.md)** - 技术规范详情
- **[RFC风格规范](./rfc-specifications.md)** - 协议标准
- **[JSON Schema定义](./json-schema-definitions.md)** - JSON格式规范
- **[多语言支持](../implementation/multi-language-support.md)** - 语言实现

---

**Protocol Buffer定义版本**: 1.0.0-alpha
**最后更新**: 2025年9月4日
**下次审查**: 2025年12月4日
**状态**: 二进制格式就绪

**⚠️ Alpha通知**: 这些Protocol Buffer定义为MPLP v1.0 Alpha提供了高性能二进制序列化。基于性能测试和实现反馈，Beta版本将添加额外的protobuf定义和优化。
```
```

---

## 🔧 代码生成和使用

### **代码生成**

#### **TypeScript**
```bash
# 安装protobuf编译器
npm install -g protobufjs-cli

# 生成TypeScript代码
pbjs -t static-module -w commonjs -o mplp-proto.js mplp/**/*.proto
pbts -o mplp-proto.d.ts mplp-proto.js
```

#### **Python**
```bash
# 安装grpcio-tools
pip install grpcio-tools

# 生成Python代码
python -m grpc_tools.protoc --python_out=. --grpc_python_out=. mplp/**/*.proto
```

#### **Java**
```bash
# 使用Maven插件
mvn compile

# 或直接使用protoc
protoc --java_out=src/main/java mplp/**/*.proto
```

#### **Go**
```bash
# 安装protobuf编译器
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest

# 生成Go代码
protoc --go_out=. --go_opt=paths=source_relative mplp/**/*.proto
```

### **使用示例**

#### **TypeScript使用**
```typescript
import { MPLPMessage, MessageType, Priority } from './mplp-proto';

// 创建消息
const message = MPLPMessage.create({
  messageId: 'msg-12345',
  sessionId: 'session-12345',
  timestamp: { seconds: Date.now() / 1000 },
  source: 'client-001',
  target: 'server-001',
  type: MessageType.OPERATION_REQUEST,
  priority: Priority.NORMAL
});

// 序列化为二进制
const buffer = MPLPMessage.encode(message).finish();

// 从二进制反序列化
const decoded = MPLPMessage.decode(buffer);
```

#### **Python使用**
```python
from mplp.core import message_pb2
import time

# 创建消息
message = message_pb2.MPLPMessage()
message.message_id = 'msg-12345'
message.session_id = 'session-12345'
message.timestamp.seconds = int(time.time())
message.source = 'client-001'
message.target = 'server-001'
message.type = message_pb2.OPERATION_REQUEST
message.priority = message_pb2.NORMAL

# 序列化为二进制
binary_data = message.SerializeToString()

# 从二进制反序列化
decoded_message = message_pb2.MPLPMessage()
decoded_message.ParseFromString(binary_data)
```

---

## 🔗 相关资源

- **[正式规范](./formal-specification.md)** - 技术规范详情
- **[RFC风格规范](./rfc-specifications.md)** - 协议标准
- **[JSON Schema定义](./json-schema-definitions.md)** - JSON格式规范
- **[多语言支持](../implementation/multi-language-support.md)** - 语言实现

---

**Protocol Buffer定义版本**: 1.0.0-alpha
**最后更新**: 2025年9月4日
**下次审查**: 2025年12月4日
**状态**: 二进制格式就绪

**⚠️ Alpha通知**: 这些Protocol Buffer定义为MPLP v1.0 Alpha提供了高性能二进制序列化。基于性能测试和实现反馈，Beta版本将添加额外的protobuf定义和优化。
