#!/bin/bash

echo "批量修复ResourceRequirement字段名错误..."

# 修复所有协调器文件中的字段名错误
COORDINATOR_FILES=(
    "src/modules/plan/application/coordinators/risk-assessment.coordinator.ts"
    "src/modules/plan/application/coordinators/task-planning.coordinator.ts"
    "src/modules/plan/application/coordinators/execution-strategy.coordinator.ts"
    "src/modules/plan/application/coordinators/dependency-management.coordinator.ts"
    "src/modules/plan/application/coordinators/failure-recovery.coordinator.ts"
)

for file in "${COORDINATOR_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "修复文件: $file"
        
        # 修复 resource_type -> type
        sed -i 's/\.resource_type/\.type/g' "$file"
        sed -i 's/resource_type:/type:/g' "$file"
        
        # 修复 amount -> quantity  
        sed -i 's/\.amount/\.quantity/g' "$file"
        sed -i 's/amount:/quantity:/g' "$file"
        
        # 修复 unit 字段（ResourceRequirement没有unit字段）
        sed -i 's/\.unit/\.type/g' "$file"
        
        echo "  - 完成修复: $file"
    else
        echo "  - 文件不存在: $file"
    fi
done

echo "批量修复完成！"
