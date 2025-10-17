#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 修复文档中的语言导航，移除不存在的日语/韩语链接
 */

function fixLanguageNavigation() {
    const docsDir = path.join(__dirname, '..', 'docs');
    
    // 递归处理所有markdown文件
    function processDirectory(dir) {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                processDirectory(filePath);
            } else if (file.endsWith('.md')) {
                processMarkdownFile(filePath);
            }
        }
    }
    
    function processMarkdownFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // 修复语言导航模式1: 完整的4语言导航
            const pattern1 = /> \*\*🌐 语言导航\*\*: \[English\]\([^)]+\) \| \[中文\]\([^)]+\) \| \[日本語\]\([^)]+\) \| \[한국어\]\([^)]+\)/g;
            if (pattern1.test(content)) {
                content = content.replace(pattern1, (match) => {
                    const englishMatch = match.match(/\[English\]\(([^)]+)\)/);
                    const chineseMatch = match.match(/\[中文\]\(([^)]+)\)/);
                    
                    if (englishMatch && chineseMatch) {
                        return `> **🌐 语言导航**: [English](${englishMatch[1]}) | [中文](${chineseMatch[1]})`;
                    }
                    return match;
                });
                modified = true;
            }
            
            // 修复语言导航模式2: 简化版本
            const pattern2 = /\[English\]\([^)]+\) \| \[中文\]\([^)]+\) \| \[日本語\]\([^)]+\) \| \[한국어\]\([^)]+\)/g;
            if (pattern2.test(content)) {
                content = content.replace(pattern2, (match) => {
                    const englishMatch = match.match(/\[English\]\(([^)]+)\)/);
                    const chineseMatch = match.match(/\[中文\]\(([^)]+)\)/);
                    
                    if (englishMatch && chineseMatch) {
                        return `[English](${englishMatch[1]}) | [中文](${chineseMatch[1]})`;
                    }
                    return match;
                });
                modified = true;
            }
            
            // 修复语言导航模式3: 表格中的链接
            const pattern3 = /\| \[日本語\]\([^)]+\) \|/g;
            if (pattern3.test(content)) {
                content = content.replace(pattern3, '| 準備中 |');
                modified = true;
            }
            
            const pattern4 = /\| \[한국어\]\([^)]+\) \|/g;
            if (pattern4.test(content)) {
                content = content.replace(pattern4, '| 준비 중 |');
                modified = true;
            }
            
            // 修复单独的日语/韩语链接引用
            const pattern5 = /\[日本語[^\]]*\]\([^)]+\)/g;
            if (pattern5.test(content)) {
                content = content.replace(pattern5, '日本語 (準備中)');
                modified = true;
            }
            
            const pattern6 = /\[한국어[^\]]*\]\([^)]+\)/g;
            if (pattern6.test(content)) {
                content = content.replace(pattern6, '한국어 (준비 중)');
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Fixed: ${filePath}`);
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    }
    
    console.log('🔧 开始修复语言导航...');
    processDirectory(docsDir);
    console.log('✅ 语言导航修复完成！');
}

// 运行修复
fixLanguageNavigation();
