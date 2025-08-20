#!/bin/bash

# MPLP v1.0 架构完整性检查脚本
# 防止Confirm模块类似的架构缺失问题
# 基于: 系统性链式批判性思维+GLFB+统一方法论分析结果
# ==================================================

echo "🔍 MPLP v1.0 架构完整性检查"
echo "目标: 防止架构缺失，确保预留接口完整性"
echo "基于: Confirm模块架构缺失根本原因分析"
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

# 检查单个模块的架构完整性
check_module_architecture() {
    local module_name="$1"
    local service_file="src/modules/$module_name/application/services/$module_name-management.service.ts"
    
    echo ""
    echo "🔍 检查 $module_name 模块架构完整性..."
    echo "=================================================="
    
    if [ ! -f "$service_file" ]; then
        log_error "$module_name 模块管理服务文件不存在: $service_file"
        return 1
    fi
    
    # 1. 检查MPLP预留接口标记
    if ! grep -q "MPLP.*预留接口\|MPLP.*协调器预留接口" "$service_file"; then
        log_error "$module_name 模块缺少MPLP预留接口标记"
        return 1
    fi
    
    # 2. 检查必需的预留接口模式（更灵活的匹配）
    local required_interfaces=(
        "Coordination.*Permission"  # 权限验证接口
        "Coordination.*Context"     # 上下文获取接口
        "Coordination.*Metrics"     # 监控记录接口
        "Extension.*Coordination\|Coordination.*Extension" # 扩展协调接口
    )

    local missing_interfaces=0
    for interface_pattern in "${required_interfaces[@]}"; do
        if ! grep -q "$interface_pattern" "$service_file"; then
            log_warning "$module_name 模块可能缺少接口模式: $interface_pattern"
            missing_interfaces=$((missing_interfaces + 1))
        fi
    done
    
    # 3. 检查TODO标记数量
    local todo_count=$(grep -c "TODO.*等待CoreOrchestrator激活\|TODO.*CoreOrchestrator" "$service_file" 2>/dev/null || echo "0")
    if [ $todo_count -lt 4 ]; then
        log_warning "$module_name 模块TODO标记数量较少: $todo_count (建议≥8个)"
    else
        log_success "$module_name 模块发现 $todo_count 个预留接口TODO标记"
    fi
    
    # 4. 检查下划线前缀参数
    local underscore_params=$(grep -c "_userId\|_contextId\|_.*Id.*:" "$service_file" 2>/dev/null || echo "0")
    if [ $underscore_params -lt 4 ]; then
        log_warning "$module_name 模块下划线前缀参数较少: $underscore_params"
    else
        log_success "$module_name 模块使用下划线前缀参数: $underscore_params 个"
    fi
    
    # 5. 检查private方法
    local private_methods=$(grep -c "private async.*Coordination" "$service_file" 2>/dev/null || echo "0")
    if [ $private_methods -lt 4 ]; then
        log_warning "$module_name 模块私有协调方法较少: $private_methods"
    else
        log_success "$module_name 模块私有协调方法: $private_methods 个"
    fi
    
    # 总体评估
    if [ $missing_interfaces -eq 0 ] && [ $todo_count -ge 4 ]; then
        log_success "$module_name 模块架构完整性检查通过"
        return 0
    else
        log_error "$module_name 模块架构完整性检查失败"
        return 1
    fi
}

# 主检查流程
main() {
    local modules=("context" "plan" "confirm" "trace" "role" "extension")
    local total_modules=0
    local passed_modules=0
    local failed_modules=0
    
    echo "🎯 开始检查已完成的MPLP模块架构完整性..."
    
    for module in "${modules[@]}"; do
        total_modules=$((total_modules + 1))
        
        if check_module_architecture "$module"; then
            passed_modules=$((passed_modules + 1))
        else
            failed_modules=$((failed_modules + 1))
        fi
    done
    
    # 最终结果统计
    echo ""
    echo "=================================================="
    echo "📊 MPLP v1.0 架构完整性检查总结"
    echo "=================================================="
    echo "总模块数: $total_modules"
    echo "通过模块: $passed_modules"
    echo "失败模块: $failed_modules"
    echo "通过率: $(( passed_modules * 100 / total_modules ))%"
    
    if [ $failed_modules -eq 0 ]; then
        log_success "🎉 所有模块架构完整性检查通过！"
        echo "📈 MPLP v1.0 架构完整性评分: 100/100"
        exit 0
    else
        log_error "❌ 有 $failed_modules 个模块架构完整性检查失败"
        echo "📈 MPLP v1.0 架构完整性评分: $(( passed_modules * 100 / total_modules ))/100"
        echo ""
        echo "🔧 修复建议:"
        echo "1. 为失败的模块添加完整的MPLP预留接口"
        echo "2. 确保每个模块有8个预留接口（对应8个协作模块）"
        echo "3. 使用下划线前缀标记预留接口参数"
        echo "4. 添加TODO注释说明等待CoreOrchestrator激活"
        echo "5. 参考Plan模块的成功实现模式"
        exit 1
    fi
}

# 执行主流程
main "$@"
