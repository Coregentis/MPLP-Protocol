@echo off
REM MPLP npm发布脚本 (Windows版本)
REM 基于SCTM+GLFB+ITCM+RBCT方法论
REM 版本: 1.0.0
REM 日期: 2025-10-17

setlocal enabledelayedexpansion

echo ========================================
echo MPLP npm发布脚本 (Windows)
echo ========================================
echo.

REM 检查是否在项目根目录
if not exist "package.json" (
    echo [错误] 未找到package.json文件
    echo [信息] 请在项目根目录运行此脚本
    exit /b 1
)

REM 获取包信息
for /f "tokens=*" %%i in ('node -p "require('./package.json').name"') do set PACKAGE_NAME=%%i
for /f "tokens=*" %%i in ('node -p "require('./package.json').version"') do set PACKAGE_VERSION=%%i

echo [信息] 包名: %PACKAGE_NAME%
echo [信息] 版本: %PACKAGE_VERSION%
echo.

REM ============================================
REM Phase 1: 发布前检查
REM ============================================
echo ========================================
echo Phase 1: 发布前检查
echo ========================================
echo.

REM 1.1 检查必要文件
echo [信息] 检查必要文件...
if not exist "README.md" (
    echo [错误] 缺少必要文件: README.md
    exit /b 1
)
if not exist "LICENSE" (
    echo [错误] 缺少必要文件: LICENSE
    exit /b 1
)
if not exist "CHANGELOG.md" (
    echo [错误] 缺少必要文件: CHANGELOG.md
    exit /b 1
)
echo [成功] 所有必要文件都存在
echo.

REM 1.2 检查dist目录
echo [信息] 检查dist目录...
if not exist "dist" (
    echo [错误] dist目录不存在
    echo [信息] 请先运行: npm run build
    exit /b 1
)
if not exist "dist\index.js" (
    echo [错误] dist目录不完整
    echo [信息] 请先运行: npm run build
    exit /b 1
)
if not exist "dist\index.d.ts" (
    echo [错误] dist目录不完整
    echo [信息] 请先运行: npm run build
    exit /b 1
)
echo [成功] dist目录完整
echo.

REM 1.3 检查npm登录状态
echo [信息] 检查npm登录状态...
npm whoami >nul 2>&1
if errorlevel 1 (
    echo [错误] 未登录npm
    echo [信息] 请先运行: npm login
    exit /b 1
)
for /f "tokens=*" %%i in ('npm whoami') do set NPM_USER=%%i
echo [成功] 已登录npm (用户: %NPM_USER%)
echo.

REM ============================================
REM Phase 2: 构建和测试
REM ============================================
echo ========================================
echo Phase 2: 构建和测试
echo ========================================
echo.

REM 2.1 清理旧的构建
echo [信息] 清理旧的构建...
call npm run clean
echo [成功] 清理完成
echo.

REM 2.2 安装依赖
echo [信息] 安装依赖...
call npm install
echo [成功] 依赖安装完成
echo.

REM 2.3 TypeScript类型检查
echo [信息] TypeScript类型检查...
call npm run typecheck
if errorlevel 1 (
    echo [错误] 类型检查失败
    exit /b 1
)
echo [成功] 类型检查通过
echo.

REM 2.4 运行测试
echo [信息] 运行测试...
call npm test
if errorlevel 1 (
    echo [错误] 测试失败
    exit /b 1
)
echo [成功] 所有测试通过
echo.

REM 2.5 构建项目
echo [信息] 构建项目...
call npm run build
if errorlevel 1 (
    echo [错误] 构建失败
    exit /b 1
)
echo [成功] 构建完成
echo.

REM ============================================
REM Phase 3: 打包测试
REM ============================================
echo ========================================
echo Phase 3: 打包测试
echo ========================================
echo.

REM 3.1 npm pack测试
echo [信息] 执行npm pack...
for /f "tokens=*" %%i in ('npm pack') do set PACK_FILE=%%i
echo [成功] 打包成功: %PACK_FILE%
echo.

REM 3.2 检查包大小
for %%A in ("%PACK_FILE%") do set PACK_SIZE=%%~zA
set /a PACK_SIZE_MB=%PACK_SIZE% / 1048576
echo [信息] 包大小: %PACK_SIZE_MB% MB
echo.

REM ============================================
REM Phase 4: 本地安装测试
REM ============================================
echo ========================================
echo Phase 4: 本地安装测试
echo ========================================
echo.

REM 4.1 创建测试目录
set TEST_DIR=test-npm-install-%RANDOM%
echo [信息] 创建测试目录: %TEST_DIR%
mkdir "%TEST_DIR%"
cd "%TEST_DIR%"

REM 4.2 初始化测试项目
echo [信息] 初始化测试项目...
call npm init -y >nul

REM 4.3 安装本地包
echo [信息] 安装本地包...
call npm install "..\%PACK_FILE%"
if errorlevel 1 (
    cd ..
    rmdir /s /q "%TEST_DIR%"
    echo [错误] 本地安装失败
    exit /b 1
)
echo [成功] 本地安装成功
echo.

REM 4.4 测试导入
echo [信息] 测试导入...
echo const mplp = require('mplp'); > test.js
echo console.log('MPLP Version:', mplp.MPLP_VERSION); >> test.js
echo console.log('MPLP Info:', mplp.MPLP_INFO); >> test.js
echo console.log('✅ 导入测试成功'); >> test.js

node test.js
if errorlevel 1 (
    cd ..
    rmdir /s /q "%TEST_DIR%"
    echo [错误] 导入测试失败
    exit /b 1
)
echo [成功] 导入测试通过
echo.

REM 4.5 清理测试目录
cd ..
rmdir /s /q "%TEST_DIR%"
echo [成功] 测试目录已清理
echo.

REM ============================================
REM Phase 5: 发布确认
REM ============================================
echo ========================================
echo Phase 5: 发布确认
echo ========================================
echo.

echo [信息] 即将发布到npm registry:
echo.
echo   包名: %PACKAGE_NAME%
echo   版本: %PACKAGE_VERSION%
echo   用户: %NPM_USER%
echo   标签: beta
echo.

set /p CONFIRM="确认发布？(y/n) "
if /i not "%CONFIRM%"=="y" (
    echo [错误] 发布已取消
    del "%PACK_FILE%"
    exit /b 1
)
echo.

REM ============================================
REM Phase 6: 发布到npm
REM ============================================
echo ========================================
echo Phase 6: 发布到npm
echo ========================================
echo.

REM 6.1 发布（beta标签）
echo [信息] 发布到npm (beta标签)...
call npm publish --tag beta
if errorlevel 1 (
    echo [错误] 发布失败
    del "%PACK_FILE%"
    exit /b 1
)
echo [成功] 发布成功！
echo.

REM 6.2 清理打包文件
del "%PACK_FILE%"

REM ============================================
REM Phase 7: 发布后验证
REM ============================================
echo ========================================
echo Phase 7: 发布后验证
echo ========================================
echo.

REM 7.1 等待npm registry更新
echo [信息] 等待npm registry更新...
timeout /t 5 /nobreak >nul

REM 7.2 检查npm registry
echo [信息] 检查npm registry...
call npm view "%PACKAGE_NAME%@%PACKAGE_VERSION%" version
echo [成功] 版本已在npm registry上
echo.

REM 7.3 检查包页面
echo [信息] npm包页面: https://www.npmjs.com/package/%PACKAGE_NAME%
echo.

REM ============================================
REM 完成
REM ============================================
echo ========================================
echo 发布完成！
echo ========================================
echo.

echo [成功] MPLP %PACKAGE_VERSION% 已成功发布到npm！
echo.
echo [信息] 用户现在可以通过以下命令安装:
echo.
echo   npm install %PACKAGE_NAME%@beta
echo.
echo [信息] 或者安装最新版本:
echo.
echo   npm install %PACKAGE_NAME%
echo.
echo [信息] 下一步:
echo   1. 在新目录测试远程安装
echo   2. 更新GitHub Release
echo   3. 更新文档
echo   4. 通知社区
echo.

echo [成功] 🎉 恭喜！npm发布流程圆满完成！

endlocal

