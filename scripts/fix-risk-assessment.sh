#!/bin/bash

echo "修复risk-assessment.coordinator.ts中的参数名..."

# 修复所有使用plan变量的方法参数
sed -i 's/private identifyTechnicalRisks(_plan: Plan)/private identifyTechnicalRisks(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts
sed -i 's/private identifyResourceRisks(_plan: Plan)/private identifyResourceRisks(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts
sed -i 's/private identifyScheduleRisks(_plan: Plan)/private identifyScheduleRisks(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts
sed -i 's/private identifyDependencyRisks(_plan: Plan)/private identifyDependencyRisks(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts
sed -i 's/private identifyQualityRisks(_plan: Plan)/private identifyQualityRisks(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts
sed -i 's/private identifySecurityRisks(_plan: Plan)/private identifySecurityRisks(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts
sed -i 's/private identifyComplianceRisks(_plan: Plan)/private identifyComplianceRisks(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts
sed -i 's/private identifyOperationalRisks(_plan: Plan)/private identifyOperationalRisks(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts
sed -i 's/private estimateMemoryUsage(_plan: Plan)/private estimateMemoryUsage(plan: Plan)/g' src/modules/plan/application/coordinators/risk-assessment.coordinator.ts

echo "修复完成！"
