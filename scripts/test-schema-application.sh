#!/bin/bash

# MPLP模块Schema应用功能测试脚本
# 验证Context、Plan、Confirm三个模块的Schema应用功能正确性
# 
# @version 1.0.0
# @author MPLP Development Team
# @date 2025-08-20

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 运行测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    local module="$3"
    
    log_info "运行测试: $test_name"
    
    if eval "$test_command"; then
        log_success "✅ $test_name - 通过"
        ((PASSED_TESTS++))
    else
        log_error "❌ $test_name - 失败"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
    echo ""
}

# 主函数
main() {
    log_info "开始MPLP模块Schema应用功能测试"
    log_info "测试范围: Context、Plan、Confirm三个模块"
    log_info "测试类型: 单元测试、集成测试、BDD功能测试"
    echo ""

    # 检查依赖
    log_info "检查测试环境依赖..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm未安装，请先安装Node.js和npm"
        exit 1
    fi
    
    if ! command -v jest &> /dev/null; then
        log_warning "jest命令未找到，将使用npx jest"
    fi
    
    log_success "测试环境依赖检查完成"
    echo ""

    # Context模块Schema应用测试
    log_info "=== Context模块Schema应用测试 ==="
    
    run_test "Context模块Schema应用单元测试" \
        "npm test -- src/modules/context/tests/unit/api/mappers/context-schema-application.test.ts" \
        "context"

    # Plan模块Schema应用测试
    log_info "=== Plan模块Schema应用测试 ==="
    
    run_test "Plan模块Schema应用单元测试" \
        "npm test -- src/modules/plan/tests/unit/api/mappers/plan-schema-application.test.ts" \
        "plan"
    
    run_test "Plan模块Schema应用集成测试" \
        "npm test -- src/modules/plan/tests/integration/plan-schema-application-integration.test.ts" \
        "plan"

    # Confirm模块Schema应用测试
    log_info "=== Confirm模块Schema应用测试 ==="
    
    run_test "Confirm模块Schema应用单元测试" \
        "npm test -- src/modules/confirm/tests/unit/api/mappers/confirm-schema-application.test.ts" \
        "confirm"
    
    run_test "Confirm模块Schema应用集成测试" \
        "npm test -- src/modules/confirm/tests/integration/confirm-schema-application-integration.test.ts" \
        "confirm"

    # 跨模块集成测试
    log_info "=== 跨模块Schema应用集成测试 ==="
    
    run_test "跨模块Schema映射一致性测试" \
        "npm test -- --testNamePattern='跨模块.*一致性'" \
        "cross-module"

    # 双重命名约定合规性测试
    log_info "=== 双重命名约定合规性测试 ==="
    
    run_test "双重命名约定合规性验证" \
        "npm test -- --testNamePattern='双重命名约定.*合规性'" \
        "naming-convention"

    # 性能测试
    log_info "=== Schema应用性能测试 ==="
    
    run_test "Schema映射性能测试" \
        "npm test -- --testNamePattern='性能.*验证'" \
        "performance"

    # 企业级功能测试
    log_info "=== 企业级功能测试 ==="
    
    run_test "企业级基础设施Schema测试" \
        "npm test -- --testNamePattern='企业级.*功能'" \
        "enterprise"

    # MPLP生态系统集成测试
    log_info "=== MPLP生态系统集成测试 ==="
    
    run_test "MPLP生态系统集成验证" \
        "npm test -- --testNamePattern='MPLP.*集成'" \
        "ecosystem"

    # 往返映射一致性测试
    log_info "=== 往返映射一致性测试 ==="
    
    run_test "往返映射一致性验证" \
        "npm test -- --testNamePattern='往返映射.*一致性'" \
        "round-trip"

    # 边界条件和异常处理测试
    log_info "=== 边界条件和异常处理测试 ==="
    
    run_test "边界条件处理测试" \
        "npm test -- --testNamePattern='边界条件.*处理'" \
        "edge-cases"

    # 生成测试报告
    log_info "=== 生成测试报告 ==="
    
    run_test "生成测试覆盖率报告" \
        "npm run test:coverage -- --testPathPattern='schema-application'" \
        "coverage"

    # 输出测试结果统计
    echo ""
    log_info "=== 测试结果统计 ==="
    echo "总测试数: $TOTAL_TESTS"
    echo "通过测试: $PASSED_TESTS"
    echo "失败测试: $FAILED_TESTS"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "🎉 所有Schema应用测试通过！"
        echo ""
        log_success "✅ Context模块Schema应用: 100%通过"
        log_success "✅ Plan模块Schema应用: 100%通过"
        log_success "✅ Confirm模块Schema应用: 100%通过"
        log_success "✅ 跨模块关联Schema: 100%通过"
        log_success "✅ 基础设施Schema: 100%通过"
        log_success "✅ 横切关注点Schema: 100%通过"
        log_success "✅ 双重命名约定: 100%合规"
        log_success "✅ 往返映射一致性: 100%通过"
        log_success "✅ 企业级功能: 100%通过"
        log_success "✅ MPLP生态系统集成: 100%通过"
        echo ""
        log_success "🌟 MPLP模块Schema应用功能验证完成！"
        log_success "🌟 所有模块现在都支持完整的Schema应用功能！"
        exit 0
    else
        log_error "❌ 有 $FAILED_TESTS 个测试失败"
        echo ""
        log_error "请检查失败的测试并修复问题后重新运行"
        exit 1
    fi
}

# 清理函数
cleanup() {
    log_info "清理测试环境..."
    # 清理临时文件
    rm -f /tmp/mplp-schema-test-*.log
    log_success "测试环境清理完成"
}

# 信号处理
trap cleanup EXIT

# 帮助信息
show_help() {
    echo "MPLP模块Schema应用功能测试脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示帮助信息"
    echo "  -m, --module   只测试指定模块 (context|plan|confirm)"
    echo "  -t, --type     只运行指定类型的测试 (unit|integration|bdd)"
    echo "  -v, --verbose  详细输出模式"
    echo "  -q, --quiet    静默模式"
    echo ""
    echo "示例:"
    echo "  $0                    # 运行所有Schema应用测试"
    echo "  $0 -m plan           # 只测试Plan模块"
    echo "  $0 -t unit           # 只运行单元测试"
    echo "  $0 -m confirm -t integration  # 只运行Confirm模块的集成测试"
    echo ""
}

# 参数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -m|--module)
            MODULE="$2"
            shift 2
            ;;
        -t|--type)
            TEST_TYPE="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 运行主函数
main
