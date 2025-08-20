#!/bin/bash

# Plan模块BDD验证脚本
# 基于MPLP智能体构建框架协议标准
# 
# @version 1.0.0
# @created 2025-08-17
# @based_on Context模块BDD成功经验

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# 日志函数
log_header() {
    echo -e "\n${BOLD}${BLUE}============================================================${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}============================================================${NC}\n"
}

log_success() {
    echo -e "✅ ${GREEN}$1${NC}"
}

log_error() {
    echo -e "❌ ${RED}$1${NC}"
}

log_warning() {
    echo -e "⚠️  ${YELLOW}$1${NC}"
}

log_info() {
    echo -e "ℹ️  ${BLUE}$1${NC}"
}

# 验证配置
PLAN_BDD_DIR="tests/bdd/plan"
FEATURES_DIR="$PLAN_BDD_DIR/features"
STEP_DEFINITIONS_DIR="$PLAN_BDD_DIR/step-definitions"
REPORTS_DIR="$PLAN_BDD_DIR/reports"

# 计数器
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# 检查函数
check_item() {
    local description="$1"
    local command="$2"
    local expected_result="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if eval "$command"; then
        if [ -n "$expected_result" ]; then
            local actual_result=$(eval "$command")
            if [ "$actual_result" = "$expected_result" ]; then
                log_success "$description"
                PASSED_CHECKS=$((PASSED_CHECKS + 1))
                return 0
            else
                log_error "$description (期望: $expected_result, 实际: $actual_result)"
                FAILED_CHECKS=$((FAILED_CHECKS + 1))
                return 1
            fi
        else
            log_success "$description"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        fi
    else
        log_error "$description"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        return 1
    fi
}

# 主验证函数
main() {
    log_header "Plan模块BDD验证脚本"
    log_info "基于MPLP智能体构建框架协议标准"
    log_info "目标：达到Context模块BDD标准（39个场景，327个步骤）"
    
    # 1. 检查BDD目录结构
    log_header "1. BDD目录结构验证"
    check_item "BDD根目录存在" "[ -d '$PLAN_BDD_DIR' ]"
    check_item "特性文件目录存在" "[ -d '$FEATURES_DIR' ]"
    check_item "步骤定义目录存在" "[ -d '$STEP_DEFINITIONS_DIR' ]"
    check_item "报告目录存在" "[ -d '$REPORTS_DIR' ]"
    
    # 2. 检查配置文件
    log_header "2. BDD配置文件验证"
    check_item "Cucumber配置文件存在" "[ -f '$PLAN_BDD_DIR/cucumber.config.js' ]"
    check_item "BDD测试运行脚本存在" "[ -f '$PLAN_BDD_DIR/run-bdd-tests.js' ]"
    
    # 3. 检查特性文件
    log_header "3. BDD特性文件验证"
    local feature_files=(
        "task-planning-coordination.feature"
        "dependency-management-coordination.feature"
        "execution-strategy-coordination.feature"
        "risk-assessment-coordination.feature"
        "failure-recovery-coordination.feature"
        "mplp-coordinator-integration.feature"
    )
    
    for feature_file in "${feature_files[@]}"; do
        check_item "特性文件存在: $feature_file" "[ -f '$FEATURES_DIR/$feature_file' ]"
    done
    
    # 4. 检查步骤定义文件
    log_header "4. BDD步骤定义验证"
    check_item "主步骤定义文件存在" "[ -f '$STEP_DEFINITIONS_DIR/plan-steps.ts' ]"
    
    # 5. 统计BDD场景和步骤
    log_header "5. BDD场景和步骤统计"
    if [ -d "$FEATURES_DIR" ]; then
        local scenario_count=$(grep -r "Scenario:" "$FEATURES_DIR" | wc -l)
        local step_count=$(grep -r -E "(Given|When|Then|And|But)" "$FEATURES_DIR" | wc -l)
        
        log_info "发现场景数量: $scenario_count"
        log_info "发现步骤数量: $step_count"
        
        # 检查是否达到目标
        if [ "$scenario_count" -ge 42 ]; then
            log_success "场景数量达标 (≥42个场景)"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            log_warning "场景数量未达标 ($scenario_count/42)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
        
        if [ "$step_count" -ge 350 ]; then
            log_success "步骤数量达标 (≥350个步骤)"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            log_warning "步骤数量未达标 ($step_count/350)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
        
        TOTAL_CHECKS=$((TOTAL_CHECKS + 2))
    fi
    
    # 6. 检查依赖包
    log_header "6. BDD依赖包验证"
    check_item "Cucumber依赖包已安装" "npm list @cucumber/cucumber > /dev/null 2>&1"
    check_item "Chai断言库已安装" "npm list chai > /dev/null 2>&1"
    check_item "TypeScript已安装" "npm list typescript > /dev/null 2>&1"
    
    # 7. 运行BDD测试（如果请求）
    if [ "$1" = "--run-tests" ]; then
        log_header "7. 执行BDD测试"
        if [ -f "$PLAN_BDD_DIR/run-bdd-tests.js" ]; then
            log_info "开始执行Plan模块BDD测试..."
            if node "$PLAN_BDD_DIR/run-bdd-tests.js"; then
                log_success "BDD测试执行成功"
                PASSED_CHECKS=$((PASSED_CHECKS + 1))
            else
                log_error "BDD测试执行失败"
                FAILED_CHECKS=$((FAILED_CHECKS + 1))
            fi
            TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        else
            log_error "BDD测试运行脚本不存在"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
            TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        fi
    fi
    
    # 8. 生成验证报告
    log_header "8. 验证结果汇总"
    
    local success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    
    log_info "总检查项目: $TOTAL_CHECKS"
    log_info "通过项目: $PASSED_CHECKS"
    log_info "失败项目: $FAILED_CHECKS"
    log_info "成功率: ${success_rate}%"
    
    # 生成JSON报告
    local report_file="$REPORTS_DIR/bdd-validation-report.json"
    mkdir -p "$REPORTS_DIR"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "validation_type": "Plan模块BDD验证",
  "total_checks": $TOTAL_CHECKS,
  "passed_checks": $PASSED_CHECKS,
  "failed_checks": $FAILED_CHECKS,
  "success_rate": $success_rate,
  "target_scenarios": 42,
  "target_steps": 350,
  "actual_scenarios": ${scenario_count:-0},
  "actual_steps": ${step_count:-0},
  "bdd_infrastructure_complete": $([ $success_rate -ge 80 ] && echo "true" || echo "false")
}
EOF
    
    log_success "验证报告已生成: $report_file"
    
    # 最终结果
    if [ $success_rate -ge 90 ]; then
        log_header "🎉 Plan模块BDD验证通过！"
        log_success "BDD基础设施完整"
        log_success "准备执行BDD测试"
        exit 0
    elif [ $success_rate -ge 70 ]; then
        log_header "⚠️  Plan模块BDD验证部分通过"
        log_warning "BDD基础设施基本完整，但需要改进"
        exit 1
    else
        log_header "❌ Plan模块BDD验证失败"
        log_error "BDD基础设施不完整，需要修复"
        exit 2
    fi
}

# 执行主函数
main "$@"
