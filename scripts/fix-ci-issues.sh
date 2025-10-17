#!/bin/bash

# MPLP CI/CD Issues Fix Script
# 修复所有CI/CD检查失败的问题

set -e

echo "🔧 MPLP CI/CD Issues Fix Script"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 修复npm安全漏洞
echo -e "${YELLOW}1️⃣  Fixing npm security vulnerabilities...${NC}"
echo ""

echo "Current vulnerabilities:"
npm audit --json | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const meta = data.metadata.vulnerabilities;
console.log('  Critical:', meta.critical);
console.log('  High:', meta.high);
console.log('  Moderate:', meta.moderate);
console.log('  Low:', meta.low);
console.log('  Total:', meta.total);
" || true

echo ""
echo "Attempting automatic fix..."
npm audit fix || echo -e "${YELLOW}⚠️  Some vulnerabilities cannot be auto-fixed${NC}"

echo ""
echo "Attempting force fix (may introduce breaking changes)..."
read -p "Do you want to force fix? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    npm audit fix --force || echo -e "${YELLOW}⚠️  Force fix completed with warnings${NC}"
fi

# 2. 更新有漏洞的包
echo ""
echo -e "${YELLOW}2️⃣  Updating vulnerable packages...${NC}"
echo ""

# 更新validator (moderate vulnerability)
echo "Updating validator..."
npm update validator || true

# 更新express-validator
echo "Updating express-validator..."
npm update express-validator || true

# 更新puppeteer相关包 (high vulnerabilities)
echo "Updating puppeteer packages..."
npm update puppeteer puppeteer-core @puppeteer/browsers || true

# 3. 检查Mapper validation
echo ""
echo -e "${YELLOW}3️⃣  Checking Mapper validation...${NC}"
echo ""

if npm run validate:mapping; then
    echo -e "${GREEN}✅ Mapper validation passed${NC}"
else
    echo -e "${RED}❌ Mapper validation failed${NC}"
    echo "This may require manual investigation"
fi

# 4. 运行完整测试
echo ""
echo -e "${YELLOW}4️⃣  Running full test suite...${NC}"
echo ""

if npm test; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo "Please review test failures"
fi

# 5. 最终安全审计报告
echo ""
echo -e "${YELLOW}5️⃣  Final security audit report...${NC}"
echo ""

npm audit --json | node -e "
const data = JSON.parse(require('fs').readFileSync(0, 'utf-8'));
const meta = data.metadata.vulnerabilities;
console.log('Final vulnerability count:');
console.log('  Critical:', meta.critical);
console.log('  High:', meta.high);
console.log('  Moderate:', meta.moderate);
console.log('  Low:', meta.low);
console.log('  Total:', meta.total);

if (meta.critical > 0 || meta.high > 0) {
    console.log('');
    console.log('⚠️  WARNING: Critical or High vulnerabilities still exist!');
    console.log('Please review manually:');
    console.log('  npm audit');
    process.exit(1);
} else if (meta.moderate > 0) {
    console.log('');
    console.log('⚠️  Moderate vulnerabilities exist but may be acceptable');
    process.exit(0);
} else {
    console.log('');
    console.log('✅ No critical or high vulnerabilities!');
    process.exit(0);
}
" || true

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}CI/CD Fix Script Completed!${NC}"
echo -e "${GREEN}================================${NC}"

