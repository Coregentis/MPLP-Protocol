# Context Module

## 📋 Overview

The Context Module is responsible for managing project contexts and their lifecycle within the MPLP ecosystem. It provides comprehensive context creation, management, and state tracking capabilities using Domain-Driven Design (DDD) architecture.

## 🏗️ Architecture

### DDD Layer Structure

```
src/modules/context/
├── api/                    # API Layer
│   ├── controllers/        # REST controllers
│   │   └── context.controller.ts
│   └── dto/               # Data transfer objects
├── application/           # Application Layer
│   ├── services/          # Application services
│   │   └── context-management.service.ts
│   ├── commands/          # Command handlers
│   │   └── create-context.command.ts
│   └── queries/           # Query handlers
│       └── get-context-by-id.query.ts
├── domain/                # Domain Layer
│   ├── entities/          # Domain entities
│   │   └── context.entity.ts
│   ├── repositories/      # Repository interfaces
│   │   └── context-repository.interface.ts
│   └── services/          # Domain services
│       └── context-validation.service.ts
├── infrastructure/        # Infrastructure Layer
│   └── repositories/      # Repository implementations
│       └── context.repository.ts
├── module.ts             # Module integration
├── index.ts              # Public exports
└── types.ts              # Type definitions
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { initializeContextModule } from 'mplp';

// Initialize the module
const contextModule = await initializeContextModule();

// Create a new context
const result = await contextModule.contextManagementService.createContext({
  name: 'My Project Context',
  description: 'A sample project context',
  metadata: {
    project_type: 'web_application',
    priority: 'high'
  }
});

if (result.success) {
  console.log('Context created:', result.data.context_id);
}
```

## 📖 API Reference

### Context Management Service

#### createContext()

Creates a new project context.

```typescript
async createContext(request: CreateContextRequest): Promise<OperationResult<Context>>
```

**Parameters:**
```typescript
interface CreateContextRequest {
  name: string;
  description?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  parent_context_id?: UUID;
}
```

#### getContextById()

Retrieves a context by its ID.

```typescript
async getContextById(contextId: UUID): Promise<OperationResult<Context>>
```

#### updateContext()

Updates an existing context.

```typescript
async updateContext(contextId: UUID, updates: Partial<UpdateContextRequest>): Promise<OperationResult<Context>>
```

#### queryContexts()

Queries contexts with filtering and pagination.

```typescript
async queryContexts(
  filter: ContextFilter,
  pagination?: PaginationOptions
): Promise<OperationResult<PaginatedResult<Context>>>
```

## 🎯 Domain Model

### Context Entity

The core domain entity representing a project context.

```typescript
class Context {
  // Properties
  context_id: UUID;
  name: string;
  description?: string;
  status: ContextStatus;
  metadata: Record<string, any>;
  tags: string[];
  created_at: Timestamp;
  updated_at: Timestamp;

  // Business Methods
  activate(): void;
  deactivate(): void;
  archive(): void;
  addTag(tag: string): void;
  removeTag(tag: string): void;
  updateMetadata(key: string, value: any): void;
}
```

### Context Status

```typescript
type ContextStatus =
  | 'draft'      // Initial state
  | 'active'     // Currently active
  | 'inactive'   // Temporarily inactive
  | 'completed'  // Successfully completed
  | 'archived'   // Archived for reference
  | 'cancelled'; // Cancelled/aborted
```

## 🔧 Configuration

### Module Options

```typescript
interface ContextModuleOptions {
  dataSource?: DataSource;           // Database connection
  enableCaching?: boolean;           // Enable result caching
  enableValidation?: boolean;        // Enable input validation
  enableAuditLogging?: boolean;      // Enable audit trail
  maxContextsPerUser?: number;       // Limit contexts per user
}
```

## 📊 Events

The Context Module emits domain events for integration with other modules:

```typescript
interface ContextCreatedEvent {
  event_type: 'context_created';
  context_id: UUID;
  context_name: string;
  created_by: string;
  timestamp: Timestamp;
}

interface ContextStatusChangedEvent {
  event_type: 'context_status_changed';
  context_id: UUID;
  old_status: ContextStatus;
  new_status: ContextStatus;
  changed_by: string;
  timestamp: Timestamp;
}
```

## 🧪 Testing

### Unit Tests

```typescript
import { Context } from '../domain/entities/context.entity';

describe('Context Entity', () => {
  test('should create valid context', () => {
    const context = new Context(
      'ctx-123',
      'Test Context',
      'active',
      new Date().toISOString(),
      new Date().toISOString()
    );

    expect(context.context_id).toBe('ctx-123');
    expect(context.name).toBe('Test Context');
    expect(context.status).toBe('active');
  });
});
```

## 🔗 Integration

### With Other Modules

The Context Module integrates seamlessly with other MPLP modules:

- **Plan Module**: Contexts serve as the foundation for planning
- **Trace Module**: Context events are automatically traced
- **Role Module**: Context access is controlled by roles
- **Extension Module**: Context lifecycle can be extended

---

The Context Module provides a robust foundation for managing project contexts with full lifecycle support, comprehensive validation, and seamless integration with the broader MPLP ecosystem.
