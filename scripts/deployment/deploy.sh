#!/bin/bash

# MPLP v1.0 Alpha 自动化部署脚本
# 支持Docker、Kubernetes、传统服务器等多种部署方式

set -e

# 脚本配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEPLOYMENT_TYPE=${1:-docker}
ENVIRONMENT=${2:-production}
VERSION=${3:-latest}

# 颜色输出
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

# 显示帮助信息
show_help() {
    cat << EOF
MPLP v1.0 Alpha 自动化部署脚本

用法:
    $0 [部署类型] [环境] [版本]

部署类型:
    docker      - Docker容器部署 (默认)
    k8s         - Kubernetes部署
    server      - 传统服务器部署
    cloud       - 云平台部署

环境:
    development - 开发环境
    staging     - 测试环境
    production  - 生产环境 (默认)

版本:
    latest      - 最新版本 (默认)
    v1.0.0      - 指定版本

示例:
    $0 docker production latest
    $0 k8s staging v1.0.0
    $0 server production

选项:
    -h, --help  显示帮助信息
    --dry-run   预览部署操作，不实际执行
    --force     强制部署，跳过确认
EOF
}

# 检查系统依赖
check_system_dependencies() {
    log_info "检查系统依赖..."
    
    local missing_deps=()
    
    # 检查基础工具
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    fi
    
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    fi
    
    # 根据部署类型检查特定依赖
    case $DEPLOYMENT_TYPE in
        docker)
            if ! command -v docker &> /dev/null; then
                missing_deps+=("docker")
            fi
            if ! command -v docker-compose &> /dev/null; then
                missing_deps+=("docker-compose")
            fi
            ;;
        k8s)
            if ! command -v kubectl &> /dev/null; then
                missing_deps+=("kubectl")
            fi
            if ! command -v helm &> /dev/null; then
                log_warning "Helm未安装，将使用kubectl部署"
            fi
            ;;
        server)
            if ! command -v node &> /dev/null; then
                missing_deps+=("nodejs")
            fi
            if ! command -v npm &> /dev/null; then
                missing_deps+=("npm")
            fi
            ;;
    esac
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "缺少以下依赖: ${missing_deps[*]}"
        log_info "请安装缺少的依赖后重试"
        exit 1
    fi
    
    log_success "系统依赖检查通过"
}

# 检查环境配置
check_environment_config() {
    log_info "检查环境配置..."
    
    local config_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    
    if [ ! -f "$config_file" ]; then
        log_warning "环境配置文件不存在: $config_file"
        
        # 复制示例配置
        local example_file="$PROJECT_ROOT/.env.example"
        if [ -f "$example_file" ]; then
            cp "$example_file" "$config_file"
            log_info "已创建配置文件: $config_file"
            log_warning "请编辑配置文件并重新运行部署脚本"
            exit 1
        else
            log_error "示例配置文件不存在: $example_file"
            exit 1
        fi
    fi
    
    # 检查关键配置项
    source "$config_file"
    
    local required_vars=("DATABASE_URL" "REDIS_URL")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "缺少以下必需的环境变量: ${missing_vars[*]}"
        log_info "请在 $config_file 中配置这些变量"
        exit 1
    fi
    
    log_success "环境配置检查通过"
}

# Docker部署
deploy_docker() {
    log_info "开始Docker部署..."
    
    cd "$PROJECT_ROOT"
    
    # 检查Docker Compose文件
    local compose_file="docker-compose.$ENVIRONMENT.yml"
    if [ ! -f "$compose_file" ]; then
        log_warning "Docker Compose文件不存在: $compose_file"
        compose_file="docker-compose.yml"
    fi
    
    if [ ! -f "$compose_file" ]; then
        log_error "找不到Docker Compose文件"
        exit 1
    fi
    
    # 拉取最新镜像
    log_info "拉取Docker镜像..."
    docker-compose -f "$compose_file" pull
    
    # 停止现有服务
    log_info "停止现有服务..."
    docker-compose -f "$compose_file" down
    
    # 启动服务
    log_info "启动MPLP服务..."
    docker-compose --env-file ".env.$ENVIRONMENT" -f "$compose_file" up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 验证部署
    verify_deployment
}

# Kubernetes部署
deploy_kubernetes() {
    log_info "开始Kubernetes部署..."
    
    local k8s_dir="$PROJECT_ROOT/k8s"
    
    if [ ! -d "$k8s_dir" ]; then
        log_error "Kubernetes配置目录不存在: $k8s_dir"
        exit 1
    fi
    
    cd "$k8s_dir"
    
    # 创建命名空间
    log_info "创建命名空间..."
    kubectl create namespace mplp --dry-run=client -o yaml | kubectl apply -f -
    
    # 应用配置
    log_info "应用Kubernetes配置..."
    
    # 按顺序应用配置文件
    local config_files=(
        "configmap.yaml"
        "secret.yaml"
        "postgres.yaml"
        "redis.yaml"
        "deployment.yaml"
        "service.yaml"
        "ingress.yaml"
    )
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            log_info "应用配置: $file"
            kubectl apply -f "$file" -n mplp
        else
            log_warning "配置文件不存在: $file"
        fi
    done
    
    # 等待部署完成
    log_info "等待部署完成..."
    kubectl rollout status deployment/mplp-app -n mplp --timeout=300s
    
    # 验证部署
    verify_k8s_deployment
}

# 传统服务器部署
deploy_server() {
    log_info "开始传统服务器部署..."
    
    cd "$PROJECT_ROOT"
    
    # 安装依赖
    log_info "安装Node.js依赖..."
    npm ci --production
    
    # 构建项目
    log_info "构建项目..."
    npm run build
    
    # 数据库迁移
    log_info "执行数据库迁移..."
    npm run db:migrate
    
    # 停止现有服务
    if systemctl is-active --quiet mplp; then
        log_info "停止现有MPLP服务..."
        sudo systemctl stop mplp
    fi
    
    # 创建系统服务文件
    create_systemd_service
    
    # 启动服务
    log_info "启动MPLP服务..."
    sudo systemctl daemon-reload
    sudo systemctl enable mplp
    sudo systemctl start mplp
    
    # 验证部署
    verify_deployment
}

# 创建systemd服务文件
create_systemd_service() {
    log_info "创建systemd服务文件..."
    
    local service_file="/etc/systemd/system/mplp.service"
    local current_user=$(whoami)
    
    sudo tee "$service_file" > /dev/null << EOF
[Unit]
Description=MPLP v1.0 Alpha
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$current_user
WorkingDirectory=$PROJECT_ROOT
Environment=NODE_ENV=$ENVIRONMENT
EnvironmentFile=$PROJECT_ROOT/.env.$ENVIRONMENT
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=mplp

# 安全设置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$PROJECT_ROOT

[Install]
WantedBy=multi-user.target
EOF
    
    log_success "systemd服务文件已创建: $service_file"
}

# 验证部署
verify_deployment() {
    log_info "验证部署状态..."
    
    local health_url="http://localhost:3000/health"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f "$health_url" > /dev/null 2>&1; then
            log_success "MPLP服务部署成功！"
            log_info "健康检查URL: $health_url"
            
            # 显示服务信息
            show_service_info
            return 0
        fi
        
        log_info "等待服务启动... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    log_error "服务启动失败，请检查日志"
    show_logs
    exit 1
}

# 验证Kubernetes部署
verify_k8s_deployment() {
    log_info "验证Kubernetes部署状态..."
    
    # 检查Pod状态
    kubectl get pods -n mplp
    
    # 检查服务状态
    kubectl get services -n mplp
    
    # 获取服务URL
    local service_url=$(kubectl get ingress mplp-ingress -n mplp -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "localhost")
    
    log_success "Kubernetes部署完成！"
    log_info "服务URL: http://$service_url"
}

# 显示服务信息
show_service_info() {
    log_info "=== MPLP服务信息 ==="
    echo "部署类型: $DEPLOYMENT_TYPE"
    echo "环境: $ENVIRONMENT"
    echo "版本: $VERSION"
    echo "访问地址: http://localhost:3000"
    echo "健康检查: http://localhost:3000/health"
    echo "API文档: http://localhost:3000/api-docs"
    
    case $DEPLOYMENT_TYPE in
        docker)
            echo "Docker容器状态:"
            docker-compose ps
            ;;
        k8s)
            echo "Kubernetes资源状态:"
            kubectl get all -n mplp
            ;;
        server)
            echo "系统服务状态:"
            sudo systemctl status mplp --no-pager
            ;;
    esac
}

# 显示日志
show_logs() {
    log_info "=== 最近的服务日志 ==="
    
    case $DEPLOYMENT_TYPE in
        docker)
            docker-compose logs --tail=50 mplp-app
            ;;
        k8s)
            kubectl logs -n mplp -l app=mplp-app --tail=50
            ;;
        server)
            sudo journalctl -u mplp --no-pager --lines=50
            ;;
    esac
}

# 清理部署
cleanup_deployment() {
    log_info "清理部署资源..."
    
    case $DEPLOYMENT_TYPE in
        docker)
            docker-compose down -v
            docker system prune -f
            ;;
        k8s)
            kubectl delete namespace mplp
            ;;
        server)
            sudo systemctl stop mplp
            sudo systemctl disable mplp
            sudo rm -f /etc/systemd/system/mplp.service
            sudo systemctl daemon-reload
            ;;
    esac
    
    log_success "清理完成"
}

# 主执行函数
main() {
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --cleanup)
                cleanup_deployment
                exit 0
                ;;
            *)
                # 位置参数已在脚本开头处理
                shift
                ;;
        esac
    done
    
    # 显示部署信息
    log_info "=== MPLP v1.0 Alpha 部署脚本 ==="
    log_info "部署类型: $DEPLOYMENT_TYPE"
    log_info "环境: $ENVIRONMENT"
    log_info "版本: $VERSION"
    
    # 确认部署
    if [ "$FORCE" != "true" ] && [ "$DRY_RUN" != "true" ]; then
        echo -n "确认继续部署? (y/N): "
        read -r confirm
        if [[ ! $confirm =~ ^[Yy]$ ]]; then
            log_info "部署已取消"
            exit 0
        fi
    fi
    
    if [ "$DRY_RUN" = "true" ]; then
        log_info "预览模式，不会实际执行部署操作"
        return 0
    fi
    
    # 执行部署前检查
    check_system_dependencies
    check_environment_config
    
    # 根据部署类型执行部署
    case $DEPLOYMENT_TYPE in
        docker)
            deploy_docker
            ;;
        k8s|kubernetes)
            deploy_kubernetes
            ;;
        server|traditional)
            deploy_server
            ;;
        cloud)
            log_error "云平台部署需要额外配置，请参考部署指南"
            exit 1
            ;;
        *)
            log_error "不支持的部署类型: $DEPLOYMENT_TYPE"
            show_help
            exit 1
            ;;
    esac
    
    log_success "🎉 MPLP v1.0 Alpha部署完成！"
}

# 捕获中断信号
trap 'log_error "部署被中断"; exit 1' INT TERM

# 执行主函数
main "$@"
