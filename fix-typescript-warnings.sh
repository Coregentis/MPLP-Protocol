#!/bin/bash

# 批量修复TypeScript警告的脚本
# 使用SCTM+GLFB+ITCM+RBCT方法论

echo "🔧 开始批量修复TypeScript警告..."

# 修复未使用的私有属性 (TS6138) - 添加_前缀
echo "📝 修复未使用的私有属性..."

# Role模块
sed -i 's/private readonly securityManager:/private readonly _securityManager:/g' src/modules/role/infrastructure/protocols/role.protocol.ts
sed -i 's/private readonly performanceMonitor:/private readonly _performanceMonitor:/g' src/modules/role/infrastructure/protocols/role.protocol.ts
sed -i 's/private readonly eventBusManager:/private readonly _eventBusManager:/g' src/modules/role/infrastructure/protocols/role.protocol.ts
sed -i 's/private readonly errorHandler:/private readonly _errorHandler:/g' src/modules/role/infrastructure/protocols/role.protocol.ts
sed -i 's/private readonly coordinationManager:/private readonly _coordinationManager:/g' src/modules/role/infrastructure/protocols/role.protocol.ts
sed -i 's/private readonly orchestrationManager:/private readonly _orchestrationManager:/g' src/modules/role/infrastructure/protocols/role.protocol.ts
sed -i 's/private readonly stateSyncManager:/private readonly _stateSyncManager:/g' src/modules/role/infrastructure/protocols/role.protocol.ts
sed -i 's/private readonly transactionManager:/private readonly _transactionManager:/g' src/modules/role/infrastructure/protocols/role.protocol.ts
sed -i 's/private readonly protocolVersionManager:/private readonly _protocolVersionManager:/g' src/modules/role/infrastructure/protocols/role.protocol.ts

# Confirm模块
sed -i 's/private readonly securityManager:/private readonly _securityManager:/g' src/modules/confirm/infrastructure/protocols/confirm.protocol.ts
sed -i 's/private readonly performanceMonitor:/private readonly _performanceMonitor:/g' src/modules/confirm/infrastructure/protocols/confirm.protocol.ts
sed -i 's/private readonly eventBusManager:/private readonly _eventBusManager:/g' src/modules/confirm/infrastructure/protocols/confirm.protocol.ts
sed -i 's/private readonly errorHandler:/private readonly _errorHandler:/g' src/modules/confirm/infrastructure/protocols/confirm.protocol.ts
sed -i 's/private readonly coordinationManager:/private readonly _coordinationManager:/g' src/modules/confirm/infrastructure/protocols/confirm.protocol.ts
sed -i 's/private readonly orchestrationManager:/private readonly _orchestrationManager:/g' src/modules/confirm/infrastructure/protocols/confirm.protocol.ts
sed -i 's/private readonly stateSyncManager:/private readonly _stateSyncManager:/g' src/modules/confirm/infrastructure/protocols/confirm.protocol.ts
sed -i 's/private readonly transactionManager:/private readonly _transactionManager:/g' src/modules/confirm/infrastructure/protocols/confirm.protocol.ts
sed -i 's/private readonly protocolVersionManager:/private readonly _protocolVersionManager:/g' src/modules/confirm/infrastructure/protocols/confirm.protocol.ts

# Collab模块
sed -i 's/private readonly securityManager:/private readonly _securityManager:/g' src/modules/collab/module.ts
sed -i 's/private readonly performanceMonitor:/private readonly _performanceMonitor:/g' src/modules/collab/module.ts
sed -i 's/private readonly eventBusManager:/private readonly _eventBusManager:/g' src/modules/collab/module.ts
sed -i 's/private readonly errorHandler:/private readonly _errorHandler:/g' src/modules/collab/module.ts
sed -i 's/private readonly coordinationManager:/private readonly _coordinationManager:/g' src/modules/collab/module.ts
sed -i 's/private readonly orchestrationManager:/private readonly _orchestrationManager:/g' src/modules/collab/module.ts
sed -i 's/private readonly stateSyncManager:/private readonly _stateSyncManager:/g' src/modules/collab/module.ts
sed -i 's/private readonly transactionManager:/private readonly _transactionManager:/g' src/modules/collab/module.ts
sed -i 's/private readonly protocolVersionManager:/private readonly _protocolVersionManager:/g' src/modules/collab/module.ts

# Core模块
sed -i 's/private readonly securityManager:/private readonly _securityManager:/g' src/modules/core/infrastructure/adapters/core-module.adapter.ts
sed -i 's/private readonly performanceMonitor:/private readonly _performanceMonitor:/g' src/modules/core/infrastructure/adapters/core-module.adapter.ts
sed -i 's/private readonly eventBusManager:/private readonly _eventBusManager:/g' src/modules/core/infrastructure/adapters/core-module.adapter.ts
sed -i 's/private readonly errorHandler:/private readonly _errorHandler:/g' src/modules/core/infrastructure/adapters/core-module.adapter.ts
sed -i 's/private readonly coordinationManager:/private readonly _coordinationManager:/g' src/modules/core/infrastructure/adapters/core-module.adapter.ts
sed -i 's/private readonly orchestrationManager:/private readonly _orchestrationManager:/g' src/modules/core/infrastructure/adapters/core-module.adapter.ts
sed -i 's/private readonly stateSyncManager:/private readonly _stateSyncManager:/g' src/modules/core/infrastructure/adapters/core-module.adapter.ts
sed -i 's/private readonly transactionManager:/private readonly _transactionManager:/g' src/modules/core/infrastructure/adapters/core-module.adapter.ts
sed -i 's/private readonly protocolVersionManager:/private readonly _protocolVersionManager:/g' src/modules/core/infrastructure/adapters/core-module.adapter.ts

echo "✅ TypeScript警告修复完成！"

