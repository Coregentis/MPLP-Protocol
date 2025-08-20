#!/bin/bash

echo "精确修复Plan模块ESLint警告..."

# 恢复failure-recovery.coordinator.ts中被错误修改的参数名
echo "恢复failure-recovery.coordinator.ts中使用的plan参数..."

# 恢复所有使用plan变量的方法参数
sed -i 's/private async detectFailures(_plan: Plan)/private async detectFailures(plan: Plan)/g' src/modules/plan/application/coordinators/failure-recovery.coordinator.ts
sed -i 's/private detectTaskFailures(_plan: Plan)/private detectTaskFailures(plan: Plan)/g' src/modules/plan/application/coordinators/failure-recovery.coordinator.ts
sed -i 's/private detectResourceShortages(_plan: Plan)/private detectResourceShortages(plan: Plan)/g' src/modules/plan/application/coordinators/failure-recovery.coordinator.ts
sed -i 's/private detectDependencyFailures(_plan: Plan)/private detectDependencyFailures(plan: Plan)/g' src/modules/plan/application/coordinators/failure-recovery.coordinator.ts
sed -i 's/private detectTimelineFailures(_plan: Plan)/private detectTimelineFailures(plan: Plan)/g' src/modules/plan/application/coordinators/failure-recovery.coordinator.ts
sed -i 's/private detectQualityFailures(_plan: Plan)/private detectQualityFailures(plan: Plan)/g' src/modules/plan/application/coordinators/failure-recovery.coordinator.ts

# 恢复risk-assessment.coordinator.ts中使用的plan参数
echo "恢复risk-assessment.coordinator.ts中使用的plan参数..."
sed -i 's/private calculateRiskScore(_plan: Plan)/private calculateRiskScore(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts

# 只对真正未使用的参数添加下划线前缀
echo "修复真正未使用的参数..."
# 这些方法确实不使用plan参数，保持_plan
# generateTaskFailureStrategies, generateResourceFailureStrategies等

echo "精确修复完成！"
