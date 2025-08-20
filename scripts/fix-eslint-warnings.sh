#!/bin/bash

echo "批量修复Plan模块ESLint警告..."

# 修复execution-strategy.coordinator.ts中的case声明问题
echo "修复execution-strategy.coordinator.ts..."
sed -i 's/case ResourceType\.MEMORY:/case ResourceType.MEMORY: {/g' src/modules/plan/application/coordinators/execution-strategy.coordinator.ts
sed -i '/case ResourceType\.MEMORY: {/,/return memoryUtilization;/s/return memoryUtilization;/return memoryUtilization; }/g' src/modules/plan/application/coordinators/execution-strategy.coordinator.ts

# 修复failure-recovery.coordinator.ts中的未使用参数
echo "修复failure-recovery.coordinator.ts..."
sed -i 's/plan: Plan)/\_plan: Plan)/g' src/modules/plan/application/coordinators/failure-recovery.coordinator.ts
sed -i 's/failures: FailureType\[\]/\_failures: FailureType\[\]/g' src/modules/plan/application/coordinators/failure-recovery.coordinator.ts
sed -i 's/index: number/\_index: number/g' src/modules/plan/application/coordinators/failure-recovery.coordinator.ts

# 修复risk-assessment.coordinator.ts中的未使用参数
echo "修复risk-assessment.coordinator.ts..."
sed -i 's/plan: Plan)/\_plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts

echo "批量修复完成！"
