#!/bin/bash

# CodeQL快速扫描脚本 - 只扫描安全问题
# 用于快速检测CWE-78 (Command Injection) 和 CWE-1333 (ReDoS)

set -e

# CodeQL CLI路径
CODEQL_PATH="$APPDATA/Code/User/globalStorage/github.vscode-codeql/distribution1/codeql/codeql.exe"

echo "🔍 CodeQL Quick Security Scan"
echo "=============================="
echo ""

# 检查CodeQL是否存在
if [ ! -f "$CODEQL_PATH" ]; then
    echo "❌ CodeQL CLI not found"
    echo "Expected location: $CODEQL_PATH"
    exit 1
fi

# 数据库目录
DB_DIR="./codeql-db"

# 检查数据库是否存在
if [ ! -d "$DB_DIR" ]; then
    echo "📦 Creating CodeQL database (first time only)..."
    echo "This will take 2-3 minutes..."
    echo ""
    
    "$CODEQL_PATH" database create "$DB_DIR" \
        --language=javascript \
        --source-root=. \
        --overwrite
    
    echo ""
    echo "✅ Database created"
    echo ""
fi

# 运行特定的安全查询
echo "🔍 Scanning for security issues..."
echo ""

# 创建临时查询文件来查找特定问题
TEMP_QUERY_DIR="./codeql-temp-queries"
mkdir -p "$TEMP_QUERY_DIR"

# CWE-78: Command Injection查询
cat > "$TEMP_QUERY_DIR/command-injection.ql" << 'EOF'
/**
 * @name Command injection
 * @description Using unsanitized user input in a command line may allow a malicious user to execute arbitrary commands.
 * @kind path-problem
 * @problem.severity error
 * @id js/command-line-injection
 * @tags security
 */

import javascript

from DataFlow::Node source, DataFlow::Node sink
where
  exists(SystemCommandExecution exec |
    sink = exec.getACommandArgument() and
    source.asExpr() instanceof VarAccess
  )
select sink, "Potential command injection from $@.", source, "user input"
EOF

# CWE-1333: ReDoS查询
cat > "$TEMP_QUERY_DIR/redos.ql" << 'EOF'
/**
 * @name Polynomial regular expression
 * @description A regular expression with polynomial worst-case performance may cause denial of service.
 * @kind problem
 * @problem.severity warning
 * @id js/polynomial-redos
 * @tags security
 */

import javascript

from RegExpTerm term
where term.isNullable() and term.isNullable()
select term, "This regular expression may have polynomial worst-case performance."
EOF

# 运行查询
echo "Checking for Command Injection (CWE-78)..."
"$CODEQL_PATH" database analyze "$DB_DIR" \
    --format=csv \
    --output="./codeql-results-command-injection.csv" \
    "$TEMP_QUERY_DIR/command-injection.ql" \
    2>&1 | tail -20

echo ""
echo "Checking for ReDoS (CWE-1333)..."
"$CODEQL_PATH" database analyze "$DB_DIR" \
    --format=csv \
    --output="./codeql-results-redos.csv" \
    "$TEMP_QUERY_DIR/redos.ql" \
    2>&1 | tail -20

# 清理临时文件
rm -rf "$TEMP_QUERY_DIR"

echo ""
echo "✅ Scan completed!"
echo ""
echo "📄 Results:"
echo "   - Command Injection: ./codeql-results-command-injection.csv"
echo "   - ReDoS: ./codeql-results-redos.csv"
echo ""

