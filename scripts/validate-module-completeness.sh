#!/bin/bash

# 企业级模块完整性验证脚本
# 用途：验证模块是否达到企业级标准，避免Trace模块的问题重现
# 版本：1.0.0
# 作者：MPLP开发团队

set -e

MODULE_NAME=$1
REFERENCE_MODULE=${2:-"context"}

if [ -z "$MODULE_NAME" ]; then
    echo "❌ 错误：请提供模块名称"
    echo "用法: $0 <模块名> [参考模块]"
    echo "示例: $0 trace context"
    exit 1
fi

echo "🔍 开始验证模块完整性: $MODULE_NAME"
echo "📋 参考企业级标准: $REFERENCE_MODULE"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 验证结果统计
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# 检查函数
check_component() {
    local component_path=$1
    local component_name=$2
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -e "$component_path" ]; then
        echo -e "✅ ${GREEN}$component_name${NC}: 存在"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "❌ ${RED}$component_name${NC}: 缺失 - $component_path"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# 1. 架构组件完整性检查
echo -e "\n📁 ${YELLOW}1. 架构组件完整性检查${NC}"
echo "--------------------------------"

# Domain层检查
check_component "src/modules/$MODULE_NAME/domain/entities/$MODULE_NAME.entity.ts" "Domain Entity"
check_component "src/modules/$MODULE_NAME/domain/services" "Domain Services目录"
check_component "src/modules/$MODULE_NAME/domain/repositories" "Domain Repositories目录"

# API层检查
check_component "src/modules/$MODULE_NAME/api/controllers/$MODULE_NAME.controller.ts" "API Controller"
check_component "src/modules/$MODULE_NAME/api/dto/$MODULE_NAME.dto.ts" "API DTO"
check_component "src/modules/$MODULE_NAME/api/mappers" "API Mappers目录"

# Application层检查
check_component "src/modules/$MODULE_NAME/application/services" "Application Services目录"

# Infrastructure层检查
check_component "src/modules/$MODULE_NAME/infrastructure/repositories" "Infrastructure Repositories目录"
check_component "src/modules/$MODULE_NAME/infrastructure/adapters" "Infrastructure Adapters目录"

# 模块集成检查
check_component "src/modules/$MODULE_NAME/module.ts" "Module定义文件"
check_component "src/modules/$MODULE_NAME/index.ts" "Module导出文件"
check_component "src/modules/$MODULE_NAME/types.ts" "Module类型定义"

# 2. 文档套件完整性检查（8文件标准）
echo -e "\n📚 ${YELLOW}2. 文档套件完整性检查${NC}"
echo "--------------------------------"

DOC_FILES=(
    "README.md"
    "api-reference.md"
    "architecture-guide.md"
    "testing-guide.md"
    "quality-report.md"
    "schema-reference.md"
    "field-mapping.md"
    "completion-report.md"
)

for doc_file in "${DOC_FILES[@]}"; do
    check_component "docs/modules/$MODULE_NAME/$doc_file" "文档: $doc_file"
done

# 3. 测试完整性检查
echo -e "\n🧪 ${YELLOW}3. 测试完整性检查${NC}"
echo "--------------------------------"

check_component "tests/modules/$MODULE_NAME" "测试目录"
check_component "tests/modules/$MODULE_NAME/unit" "单元测试目录"
check_component "tests/modules/$MODULE_NAME/functional" "功能测试目录"

# 4. Schema完整性检查
echo -e "\n📋 ${YELLOW}4. Schema完整性检查${NC}"
echo "--------------------------------"

check_component "src/schemas/core-modules/mplp-$MODULE_NAME.json" "Schema定义文件"

# 5. 与参考模块对比检查
echo -e "\n🔄 ${YELLOW}5. 与参考模块对比检查${NC}"
echo "--------------------------------"

if [ -d "src/modules/$REFERENCE_MODULE" ]; then
    echo "📊 对比参考模块: $REFERENCE_MODULE"
    
    # 检查目录结构一致性
    REF_DIRS=$(find "src/modules/$REFERENCE_MODULE" -type d | sed "s|src/modules/$REFERENCE_MODULE|src/modules/$MODULE_NAME|g")
    for dir in $REF_DIRS; do
        if [ "$dir" != "src/modules/$MODULE_NAME" ]; then
            check_component "$dir" "目录结构: $(basename $dir)"
        fi
    done
else
    echo -e "⚠️ ${YELLOW}警告${NC}: 参考模块 $REFERENCE_MODULE 不存在，跳过对比检查"
fi

# 6. 生成验证报告
echo -e "\n📊 ${YELLOW}验证结果统计${NC}"
echo "=================================="
echo "总检查项: $TOTAL_CHECKS"
echo -e "通过检查: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "失败检查: ${RED}$FAILED_CHECKS${NC}"

PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
echo "通过率: $PASS_RATE%"

# 7. 结果判定
echo -e "\n🎯 ${YELLOW}企业级标准判定${NC}"
echo "=================================="

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "🎉 ${GREEN}恭喜！模块 $MODULE_NAME 达到企业级完整性标准${NC}"
    echo -e "✅ ${GREEN}所有组件完整，可以继续质量验证${NC}"
    exit 0
else
    echo -e "❌ ${RED}模块 $MODULE_NAME 未达到企业级标准${NC}"
    echo -e "🔧 ${YELLOW}需要补全 $FAILED_CHECKS 个缺失组件${NC}"
    echo ""
    echo "建议操作："
    echo "1. 补全上述缺失的组件"
    echo "2. 参考 $REFERENCE_MODULE 模块的实现"
    echo "3. 重新运行此验证脚本"
    echo "4. 确保通过率达到100%"
    exit 1
fi
