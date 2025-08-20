#!/bin/bash

# MPLP v1.0 全模块质量门禁验证
# 📊 质量标准: 100%完美质量标准
# 基于: 系统性链式批判性思维+GLFB+统一方法论+plan-confirm-trace-delivery流程
# ==================================================

echo "🔍 MPLP v1.0 全模块质量门禁验证"
echo "📊 质量标准: 100%完美质量标准"
echo "基于: 系统性链式批判性思维+GLFB+统一方法论+plan-confirm-trace-delivery流程"
echo "=================================================="

# 设置错误处理
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "[INFO] $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING] ⚠️ $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] ❌ $1${NC}"
}

# 验证结果统计
TOTAL_MODULES=0
PASSED_MODULES=0
FAILED_MODULES=0

# 模块验证函数
validate_module() {
    local module_name="$1"
    local script_path="$2"
    
    TOTAL_MODULES=$((TOTAL_MODULES + 1))
    
    echo ""
    echo "🔍 验证 $module_name 模块..."
    echo "=================================================="
    
    if [ -f "$script_path" ]; then
        if bash "$script_path"; then
            log_success "$module_name 模块质量门禁验证通过"
            PASSED_MODULES=$((PASSED_MODULES + 1))
        else
            log_error "$module_name 模块质量门禁验证失败"
            FAILED_MODULES=$((FAILED_MODULES + 1))
        fi
    else
        log_warning "$module_name 模块质量门禁脚本不存在: $script_path"
        FAILED_MODULES=$((FAILED_MODULES + 1))
    fi
}

# 验证已完成的模块
echo "🎯 验证已完成的MPLP模块..."

# 1. Context模块验证
validate_module "Context" "quality/scripts/modules/context/validate-context-module.sh"

# 2. Plan模块验证
validate_module "Plan" "quality/scripts/modules/plan/validate-plan-module-new.sh"

# 3. Confirm模块验证
validate_module "Confirm" "quality/scripts/modules/confirm/validate-confirm-module.sh"

# 最终结果统计
echo ""
echo "=================================================="
echo "📊 MPLP v1.0 全模块质量门禁验证总结"
echo "=================================================="
echo "总模块数: $TOTAL_MODULES"
echo "通过模块: $PASSED_MODULES"
echo "失败模块: $FAILED_MODULES"
echo "通过率: $(( PASSED_MODULES * 100 / TOTAL_MODULES ))%"

if [ $FAILED_MODULES -eq 0 ]; then
    log_success "🎉 所有模块质量门禁验证通过！"
    echo "📈 MPLP v1.0 质量评分: 100/100"
    exit 0
else
    log_error "❌ 有 $FAILED_MODULES 个模块质量门禁验证失败"
    echo "📈 MPLP v1.0 质量评分: $(( PASSED_MODULES * 100 / TOTAL_MODULES ))/100"
    exit 1
fi
