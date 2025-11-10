# MPLP实现指南

> **🌐 语言导航**: [English](../../en/protocol-foundation/implementation-guide.md) | [中文](implementation-guide.md)



**MPLP协议实现的综合指南**

[![实现](https://img.shields.io/badge/implementation-Multi%20Language-blue.svg)](./protocol-specification.md)
[![指南](https://img.shields.io/badge/guide-Step%20by%20Step-green.svg)](./interoperability.md)
[![支持](https://img.shields.io/badge/support-Community-brightgreen.svg)](./compliance-testing.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/protocol-foundation/implementation-guide.md)

---

## 摘要

本综合实现指南提供了构建MPLP（多智能体协议生命周期平台）兼容实现的分步说明。它涵盖了架构模式、最佳实践、常见陷阱，并为不同编程语言和部署场景提供了实际示例。

---

## 1. 入门指南

### 1.1 **先决条件**

#### **技术要求**
- **编程语言**：支持的语言之一（JavaScript/TypeScript、Python、Java、Go、Rust）
- **JSON Schema**：了解JSON Schema Draft-07
- **HTTP/WebSocket**：了解Web协议
- **异步编程**：熟悉异步编程模式
- **测试**：具有单元测试和集成测试经验

#### **开发环境**
```bash
# 必需工具
- Git（版本控制）
- Docker（容器化）
- Node.js 16+（用于工具）
- 您选择的语言运行时

# MPLP开发工具
npm install -g @mplp/cli
npm install -g @mplp/test-runner
npm install -g @mplp/schema-validator
```

### 1.2 **架构概览**

#### **实现层级**
```
┌─────────────────────────────────────────────────────────────┐
│  应用层（您的实现）                                          │
├─────────────────────────────────────────────────────────────┤
│  MPLP客户端/服务器库                                        │
├─────────────────────────────────────────────────────────────┤
│  协议层（消息处理）                                          │
├─────────────────────────────────────────────────────────────┤
│  传输层（HTTP/WebSocket/gRPC）                              │
├─────────────────────────────────────────────────────────────┤
│  网络层（TCP/UDP）                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 核心实现模式

### 2.1 **消息处理模式**

#### **消息处理器接口**
```typescript
interface MessageProcessor {
  // 处理传入的协议消息
  processMessage(message: ProtocolMessage): Promise<ProtocolResponse>;
  
  // 验证消息格式
  validateMessage(message: unknown): ValidationResult;
  
  // 处理消息路由
  routeMessage(message: ProtocolMessage): Promise<void>;
}

class MPLPMessageProcessor implements MessageProcessor {
  private modules: Map<string, ModuleHandler> = new Map();
  private validator: SchemaValidator;
  
  constructor() {
    this.validator = new SchemaValidator();
    this.initializeModules();
  }
  
  async processMessage(message: ProtocolMessage): Promise<ProtocolResponse> {
    // 1. 验证消息格式
    const validation = this.validateMessage(message);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }
    
    // 2. 路由到适当的模块
    const module = this.modules.get(message.target.module);
    if (!module) {
      throw new ModuleNotFoundError(message.target.module);
    }
    
    // 3. 处理消息
    return await module.handle(message);
  }
  
  validateMessage(message: unknown): ValidationResult {
    return this.validator.validate(message, 'protocol-message');
  }
}
```

### 2.2 **模块实现模式**

#### **基础模块类**
```typescript
abstract class BaseModule {
  protected name: string;
  protected version: string;
  protected state: ModuleState = 'inactive';
  
  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }
  
  // 生命周期方法
  abstract initialize(): Promise<void>;
  abstract shutdown(): Promise<void>;
  
  // 核心操作
  abstract handle(message: ProtocolMessage): Promise<ProtocolResponse>;
  
  // 健康检查
  async healthCheck(): Promise<HealthStatus> {
    return {
      module: this.name,
      status: this.state,
      timestamp: new Date().toISOString()
    };
  }
  
  // 指标收集
  async getMetrics(): Promise<ModuleMetrics> {
    return {
      module: this.name,
      requests_total: this.requestCount,
      requests_per_second: this.calculateRPS(),
      average_response_time: this.averageResponseTime
    };
  }
}
```

#### **Context模块示例**
```typescript
class ContextModule extends BaseModule {
  private contexts: Map<string, Context> = new Map();
  private storage: StorageAdapter;
  
  constructor(storage: StorageAdapter) {
    super('context', '1.0.0-alpha');
    this.storage = storage;
  }
  
  async initialize(): Promise<void> {
    await this.storage.connect();
    this.state = 'active';
  }
  
  async handle(message: ProtocolMessage): Promise<ProtocolResponse> {
    const { operation, data } = message.payload;
    
    switch (operation) {
      case 'create':
        return await this.createContext(data);
      case 'get':
        return await this.getContext(data.id);
      case 'update':
        return await this.updateContext(data.id, data);
      case 'delete':
        return await this.deleteContext(data.id);
      case 'query':
        return await this.queryContexts(data.criteria);
      default:
        throw new UnsupportedOperationError(operation);
    }
  }
  
  private async createContext(data: any): Promise<ProtocolResponse> {
    const context = new Context({
      id: generateUUID(),
      name: data.name,
      type: data.type,
      metadata: data.metadata,
      state: 'inactive',
      created_at: new Date().toISOString()
    });
    
    await this.storage.save('contexts', context.id, context);
    this.contexts.set(context.id, context);
    
    return {
      status: 'success',
      data: context,
      metadata: { operation: 'create', module: 'context' }
    };
  }
}
```

---

## 3. 特定语言实现

### 3.1 **JavaScript/TypeScript实现**

#### **项目结构**
```
mplp-nodejs/
├── src/
│   ├── core/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── message-processor.ts
│   ├── modules/
│   │   ├── context/
│   │   ├── plan/
│   │   └── role/
│   ├── schemas/
│   │   └── *.json
│   └── utils/
├── tests/
├── package.json
└── tsconfig.json
```

#### **客户端实现**
```typescript
import { EventEmitter } from 'events';
import WebSocket from 'ws';

export class MPLPClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private endpoint: string;
  private version: string;
  private modules: string[];
  
  constructor(config: MPLPClientConfig) {
    super();
    this.endpoint = config.endpoint;
    this.version = config.version;
    this.modules = config.modules;
  }
  
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.endpoint);
      
      this.ws.on('open', () => {
        this.negotiateVersion();
        resolve();
      });
      
      this.ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      });
      
      this.ws.on('error', reject);
    });
  }
  
  async send(message: Partial<ProtocolMessage>): Promise<ProtocolResponse> {
    const fullMessage: ProtocolMessage = {
      protocol_version: this.version,
      message_id: generateUUID(),
      timestamp: new Date().toISOString(),
      message_type: 'request',
      correlation_id: generateUUID(),
      ...message
    };
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('请求超时'));
      }, 30000);
      
      this.once(`response:${fullMessage.correlation_id}`, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });
      
      this.ws?.send(JSON.stringify(fullMessage));
    });
  }
}
```

### 3.2 **Python实现**

#### **项目结构**
```
mplp-python/
├── mplp/
│   ├── __init__.py
│   ├── client.py
│   ├── server.py
│   ├── modules/
│   │   ├── __init__.py
│   │   ├── context.py
│   │   ├── plan.py
│   │   └── role.py
│   └── schemas/
├── tests/
├── setup.py
└── requirements.txt
```

#### **客户端实现**
```python
import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import websockets

class MPLPClient:
    def __init__(self, endpoint: str, version: str, modules: list):
        self.endpoint = endpoint
        self.version = version
        self.modules = modules
        self.ws = None
        self.pending_requests = {}
    
    async def connect(self):
        self.ws = await websockets.connect(self.endpoint)
        await self.negotiate_version()
        
        # 启动消息处理器
        asyncio.create_task(self.message_handler())
    
    async def send(self, message: Dict[str, Any]) -> Dict[str, Any]:
        full_message = {
            'protocol_version': self.version,
            'message_id': str(uuid.uuid4()),
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'message_type': 'request',
            'correlation_id': str(uuid.uuid4()),
            **message
        }
        
        # 为响应创建future
        future = asyncio.Future()
        self.pending_requests[full_message['correlation_id']] = future
        
        # 发送消息
        await self.ws.send(json.dumps(full_message))
        
        # 等待响应并设置超时
        try:
            response = await asyncio.wait_for(future, timeout=30.0)
            return response
        except asyncio.TimeoutError:
            del self.pending_requests[full_message['correlation_id']]
            raise Exception('请求超时')
    
    async def message_handler(self):
        async for message in self.ws:
            data = json.loads(message)
            
            if data.get('message_type') == 'response':
                correlation_id = data.get('correlation_id')
                if correlation_id in self.pending_requests:
                    future = self.pending_requests.pop(correlation_id)
                    future.set_result(data)
```

### 3.3 **Java实现**

#### **项目结构**
```
mplp-java/
├── src/main/java/org/mplp/
│   ├── client/
│   │   └── MPLPClient.java
│   ├── server/
│   │   └── MPLPServer.java
│   ├── modules/
│   │   ├── ContextModule.java
│   │   ├── PlanModule.java
│   │   └── RoleModule.java
│   └── core/
├── src/main/resources/
│   └── schemas/
├── src/test/java/
└── pom.xml
```

#### **客户端实现**
```java
package org.mplp.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;

public class MPLPClient extends WebSocketClient {
    private final String version;
    private final List<String> modules;
    private final ObjectMapper objectMapper;
    private final Map<String, CompletableFuture<ProtocolResponse>> pendingRequests;
    
    public MPLPClient(URI serverUri, String version, List<String> modules) {
        super(serverUri);
        this.version = version;
        this.modules = modules;
        this.objectMapper = new ObjectMapper();
        this.pendingRequests = new ConcurrentHashMap<>();
    }
    
    @Override
    public void onOpen(ServerHandshake handshake) {
        negotiateVersion();
    }
    
    @Override
    public void onMessage(String message) {
        try {
            ProtocolMessage protocolMessage = objectMapper.readValue(message, ProtocolMessage.class);
            handleMessage(protocolMessage);
        } catch (Exception e) {
            // 处理解析错误
        }
    }
    
    public CompletableFuture<ProtocolResponse> send(ProtocolMessage message) {
        String correlationId = UUID.randomUUID().toString();
        message.setCorrelationId(correlationId);
        message.setProtocolVersion(version);
        message.setMessageId(UUID.randomUUID().toString());
        message.setTimestamp(Instant.now().toString());
        
        CompletableFuture<ProtocolResponse> future = new CompletableFuture<>();
        pendingRequests.put(correlationId, future);
        
        try {
            String json = objectMapper.writeValueAsString(message);
            send(json);
        } catch (Exception e) {
            future.completeExceptionally(e);
        }
        
        return future;
    }
}
```

---

## 4. 存储和持久化

### 4.1 **存储适配器模式**

#### **存储接口**
```typescript
interface StorageAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  save(collection: string, id: string, data: any): Promise<void>;
  get(collection: string, id: string): Promise<any>;
  update(collection: string, id: string, data: any): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  query(collection: string, criteria: any): Promise<any[]>;
  
  // 事务支持
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
```

#### **MongoDB适配器示例**
```typescript
import { MongoClient, Db, Collection } from 'mongodb';

class MongoStorageAdapter implements StorageAdapter {
  private client: MongoClient;
  private db: Db;
  
  constructor(connectionString: string, dbName: string) {
    this.client = new MongoClient(connectionString);
    this.db = this.client.db(dbName);
  }
  
  async connect(): Promise<void> {
    await this.client.connect();
  }
  
  async save(collection: string, id: string, data: any): Promise<void> {
    const coll = this.db.collection(collection);
    await coll.insertOne({ _id: id, ...data });
  }
  
  async get(collection: string, id: string): Promise<any> {
    const coll = this.db.collection(collection);
    const doc = await coll.findOne({ _id: id });
    return doc ? { id: doc._id, ...doc } : null;
  }
  
  async query(collection: string, criteria: any): Promise<any[]> {
    const coll = this.db.collection(collection);
    const cursor = coll.find(criteria);
    return await cursor.toArray();
  }
}
```

### 4.2 **用于测试的内存适配器**

```typescript
class MemoryStorageAdapter implements StorageAdapter {
  private data: Map<string, Map<string, any>> = new Map();
  
  async connect(): Promise<void> {
    // 内存存储无需操作
  }
  
  async save(collection: string, id: string, data: any): Promise<void> {
    if (!this.data.has(collection)) {
      this.data.set(collection, new Map());
    }
    this.data.get(collection)!.set(id, { ...data });
  }
  
  async get(collection: string, id: string): Promise<any> {
    const coll = this.data.get(collection);
    return coll ? coll.get(id) : null;
  }
  
  async query(collection: string, criteria: any): Promise<any[]> {
    const coll = this.data.get(collection);
    if (!coll) return [];
    
    const results = [];
    for (const [id, doc] of coll.entries()) {
      if (this.matchesCriteria(doc, criteria)) {
        results.push({ id, ...doc });
      }
    }
    return results;
  }
  
  private matchesCriteria(doc: any, criteria: any): boolean {
    for (const [key, value] of Object.entries(criteria)) {
      if (doc[key] !== value) return false;
    }
    return true;
  }
}
```

---

## 5. 安全实现

### 5.1 **身份验证中间件**

#### **JWT身份验证**
```typescript
import jwt from 'jsonwebtoken';

interface AuthConfig {
  secret: string;
  algorithm: string;
  expiresIn: string;
}

class JWTAuthenticator {
  private config: AuthConfig;
  
  constructor(config: AuthConfig) {
    this.config = config;
  }
  
  generateToken(payload: any): string {
    return jwt.sign(payload, this.config.secret, {
      algorithm: this.config.algorithm as any,
      expiresIn: this.config.expiresIn
    });
  }
  
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.config.secret);
    } catch (error) {
      throw new AuthenticationError('无效令牌');
    }
  }
  
  middleware() {
    return (message: ProtocolMessage, next: Function) => {
      const authHeader = message.headers?.authorization;
      if (!authHeader) {
        throw new AuthenticationError('缺少授权头');
      }
      
      const token = authHeader.replace('Bearer ', '');
      const payload = this.verifyToken(token);
      
      message.auth = payload;
      next();
    };
  }
}
```

### 5.2 **基于角色的授权**

```typescript
interface Permission {
  module: string;
  action: string;
}

class RBACAuthorizer {
  private roles: Map<string, Permission[]> = new Map();
  
  defineRole(roleName: string, permissions: Permission[]): void {
    this.roles.set(roleName, permissions);
  }
  
  authorize(userRoles: string[], requiredPermission: Permission): boolean {
    for (const role of userRoles) {
      const permissions = this.roles.get(role);
      if (permissions) {
        const hasPermission = permissions.some(p => 
          p.module === requiredPermission.module && 
          (p.action === requiredPermission.action || p.action === '*')
        );
        if (hasPermission) return true;
      }
    }
    return false;
  }
  
  middleware() {
    return (message: ProtocolMessage, next: Function) => {
      const requiredPermission = {
        module: message.target.module,
        action: message.payload.operation
      };
      
      const userRoles = message.auth?.roles || [];
      
      if (!this.authorize(userRoles, requiredPermission)) {
        throw new AuthorizationError('权限不足');
      }
      
      next();
    };
  }
}
```

---

## 6. 测试实现

### 6.1 **单元测试框架**

#### **模块测试示例**
```typescript
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { ContextModule } from '../src/modules/context';
import { MemoryStorageAdapter } from '../src/storage/memory';

describe('Context模块', () => {
  let contextModule: ContextModule;
  let storage: MemoryStorageAdapter;
  
  beforeEach(async () => {
    storage = new MemoryStorageAdapter();
    contextModule = new ContextModule(storage);
    await contextModule.initialize();
  });
  
  afterEach(async () => {
    await contextModule.shutdown();
  });
  
  test('应该成功创建context', async () => {
    const message = {
      protocol_version: '1.0.0-alpha',
      message_id: 'test-msg-1',
      timestamp: new Date().toISOString(),
      source: { agent_id: 'test-agent', module: 'test' },
      target: { agent_id: 'context-agent', module: 'context' },
      message_type: 'request' as const,
      payload: {
        operation: 'create',
        data: {
          name: 'test-context',
          type: 'collaborative',
          metadata: { project: 'test' }
        }
      },
      correlation_id: 'test-corr-1'
    };
    
    const response = await contextModule.handle(message);
    
    expect(response.status).toBe('success');
    expect(response.data.name).toBe('test-context');
    expect(response.data.id).toBeDefined();
  });
  
  test('应该处理无效操作', async () => {
    const message = {
      // ... 消息结构
      payload: {
        operation: 'invalid-operation',
        data: {}
      }
    };
    
    await expect(contextModule.handle(message))
      .rejects.toThrow('不支持的操作');
  });
});
```

### 6.2 **集成测试**

```typescript
describe('MPLP集成测试', () => {
  let server: MPLPServer;
  let client: MPLPClient;
  
  beforeAll(async () => {
    server = new MPLPServer({
      port: 8080,
      modules: ['context', 'plan', 'role']
    });
    await server.start();
    
    client = new MPLPClient({
      endpoint: 'ws://localhost:8080',
      version: '1.0.0-alpha',
      modules: ['context', 'plan', 'role']
    });
    await client.connect();
  });
  
  afterAll(async () => {
    await client.disconnect();
    await server.stop();
  });
  
  test('端到端context工作流', async () => {
    // 创建context
    const createResponse = await client.send({
      target: { agent_id: 'server', module: 'context' },
      payload: {
        operation: 'create',
        data: { name: 'e2e-test-context' }
      }
    });
    
    expect(createResponse.status).toBe('success');
    const contextId = createResponse.data.id;
    
    // 获取context
    const getResponse = await client.send({
      target: { agent_id: 'server', module: 'context' },
      payload: {
        operation: 'get',
        data: { id: contextId }
      }
    });
    
    expect(getResponse.status).toBe('success');
    expect(getResponse.data.name).toBe('e2e-test-context');
  });
});
```

---

## 7. 部署和运维

### 7.1 **Docker部署**

#### **Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制包文件
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY dist/ ./dist/
COPY schemas/ ./schemas/

# 创建非root用户
RUN addgroup -g 1001 -S mplp && \
    adduser -S mplp -u 1001

USER mplp

EXPOSE 8080

CMD ["node", "dist/server.js"]
```

#### **Docker Compose**
```yaml
version: '3.8'

services:
  mplp-server:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - MPLP_VERSION=1.0.0-alpha
      - MPLP_MODULES=context,plan,role,confirm
      - DATABASE_URL=mongodb://mongo:27017/mplp
    depends_on:
      - mongo
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  mongo:
    image: mongo:5.0
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
```

---

## 8. 最佳实践和常见陷阱

### 8.1 **最佳实践**

#### **错误处理**
```typescript
// 好的做法：结构化错误处理
class MPLPError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'MPLPError';
  }
}

class ValidationError extends MPLPError {
  constructor(errors: any[]) {
    super('验证失败', 'VALIDATION_ERROR', 400, errors);
  }
}

// 使用方法
try {
  await processMessage(message);
} catch (error) {
  if (error instanceof ValidationError) {
    return {
      status: 'error',
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    };
  }
  throw error;
}
```

#### **资源管理**
```typescript
// 好的做法：适当的资源清理
class MPLPServer {
  private connections: Set<WebSocket> = new Set();
  private modules: Map<string, BaseModule> = new Map();
  
  async shutdown(): Promise<void> {
    // 关闭所有连接
    for (const ws of this.connections) {
      ws.close();
    }
    this.connections.clear();
    
    // 关闭所有模块
    for (const [name, module] of this.modules) {
      try {
        await module.shutdown();
      } catch (error) {
        logger.error(`关闭模块${name}失败`, error);
      }
    }
    
    // 关闭数据库连接
    await this.storage.disconnect();
  }
}
```

### 8.2 **常见陷阱**

#### **避免这些错误**

```typescript
// 错误做法：阻塞操作
async function processMessage(message: ProtocolMessage) {
  // 不要这样做 - 阻塞事件循环
  const result = fs.readFileSync('large-file.json');
  return result;
}

// 正确做法：非阻塞操作
async function processMessage(message: ProtocolMessage) {
  const result = await fs.promises.readFile('large-file.json');
  return result;
}

// 错误做法：没有超时处理
async function sendRequest(message: ProtocolMessage) {
  // 这可能会永远挂起
  return await client.send(message);
}

// 正确做法：带超时
async function sendRequest(message: ProtocolMessage) {
  const timeout = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('超时')), 30000)
  );
  
  return await Promise.race([
    client.send(message),
    timeout
  ]);
}

// 错误做法：内存泄漏
class MessageProcessor {
  private cache = new Map(); // 永远不会清理
  
  process(message: ProtocolMessage) {
    this.cache.set(message.message_id, message);
    // 缓存无限增长
  }
}

// 正确做法：有界缓存
class MessageProcessor {
  private cache = new LRUCache({ max: 1000, ttl: 300000 });
  
  process(message: ProtocolMessage) {
    this.cache.set(message.message_id, message);
  }
}
```

---

## 9. 社区和支持

### 9.1 **获取帮助**

#### **资源**
- **文档**：[https://docs.mplp.org](https://docs.mplp.org)
- **GitHub问题**：[https://github.com/Coregentis/MPLP-Protocol/issues](https://github.com/Coregentis/MPLP-Protocol/issues)
- **社区论坛**：[https://community.mplp.org](https://community.mplp.org)
- **Discord**：[https://discord.gg/mplp](https://discord.gg/mplp)

#### **贡献**
- **代码贡献**：遵循贡献指南
- **错误报告**：使用问题模板
- **功能请求**：在GitHub讨论中讨论
- **文档**：帮助改进文档

### 9.2 **实现检查清单**

#### **上线前**
- [ ] 所有合规性测试通过
- [ ] 安全审计完成
- [ ] 性能基准达标
- [ ] 监控和警报配置完成
- [ ] 备份和恢复程序测试完成
- [ ] 文档更新完成
- [ ] 团队培训完成

---

**文档版本**：1.0  
**最后更新**：2025年9月3日  
**下次审查**：2025年12月3日  
**实现支持**：MPLP核心团队  
**语言**：简体中文

**⚠️ Alpha版本说明**：实现模式和最佳实践可能会根据社区反馈和实际使用经验进行演进。
