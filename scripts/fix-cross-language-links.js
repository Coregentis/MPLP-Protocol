#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 修复跨语言文档链接，确保英文和中文文档之间的链接正确
 */

function fixCrossLanguageLinks() {
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
            
            // 修复中文文档中指向英文文档的错误路径
            // 模式1: ../../../../en/ -> ../../en/
            const pattern1 = /\]\(\.\.\/\.\.\/\.\.\/\.\.\/en\//g;
            if (pattern1.test(content)) {
                content = content.replace(pattern1, '](../../en/');
                modified = true;
            }
            
            // 模式2: ../../../en/ -> ../../en/ (在某些情况下)
            const pattern2 = /\]\(\.\.\/\.\.\/\.\.\/en\//g;
            if (pattern2.test(content)) {
                content = content.replace(pattern2, '](../../en/');
                modified = true;
            }
            
            // 修复英文文档中指向中文文档的错误路径
            // 模式3: ../../../../zh-CN/ -> ../../zh-CN/
            const pattern3 = /\]\(\.\.\/\.\.\/\.\.\/\.\.\/zh-CN\//g;
            if (pattern3.test(content)) {
                content = content.replace(pattern3, '](../../zh-CN/');
                modified = true;
            }
            
            // 模式4: ../../../zh-CN/ -> ../../zh-CN/ (在某些情况下)
            const pattern4 = /\]\(\.\.\/\.\.\/\.\.\/zh-CN\//g;
            if (pattern4.test(content)) {
                content = content.replace(pattern4, '](../../zh-CN/');
                modified = true;
            }
            
            // 修复平台适配器文档中的README链接
            // 模式5: ../README.md -> ../../README.md (对于平台适配器)
            if (filePath.includes('platform-adapters') && filePath.includes('README.md')) {
                const pattern5 = /\]\(\.\.\/README\.md\)/g;
                if (pattern5.test(content)) {
                    // 检查是否存在正确的路径
                    const correctPath = path.resolve(path.dirname(filePath), '../../README.md');
                    if (fs.existsSync(correctPath)) {
                        content = content.replace(pattern5, '](../../README.md)');
                        modified = true;
                    } else {
                        // 如果不存在，移除链接但保留文本
                        content = content.replace(/\[([^\]]+)\]\(\.\.\/README\.md\)/g, '$1');
                        modified = true;
                    }
                }
            }
            
            // 修复一些常见的缺失文件引用
            // 移除指向不存在文件的链接，但保留文本
            const missingFilePatterns = [
                /\[([^\]]+)\]\(\.\.\/protocol\/README\.md\)/g,
                /\[([^\]]+)\]\(\.\.\/architecture\/README\.md\)/g,
                /\[([^\]]+)\]\(\.\.\/api\/README\.md\)/g,
                /\[([^\]]+)\]\(\.\.\/examples\/README\.md\)/g,
                /\[([^\]]+)\]\(\.\.\/guides\/README\.md\)/g,
                /\[([^\]]+)\]\(\.\.\/tutorials\/[^)]+\)/g,
                /\[([^\]]+)\]\(\.\.\/best-practices\/[^)]+\)/g,
                /\[([^\]]+)\]\(\.\.\/api-reference\/[^)]+\)/g
            ];
            
            for (const pattern of missingFilePatterns) {
                if (pattern.test(content)) {
                    content = content.replace(pattern, '$1 (开发中)');
                    modified = true;
                }
            }
            
            // 修复邮件链接格式
            const emailPattern = /\]\(mailto:([^)]+)\)/g;
            if (emailPattern.test(content)) {
                content = content.replace(emailPattern, '](mailto:$1)');
                // 这个不算修改，只是确保格式正确
            }
            
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Fixed: ${filePath}`);
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    }
    
    console.log('🔧 开始修复跨语言链接...');
    processDirectory(docsDir);
    console.log('✅ 跨语言链接修复完成！');
}

// 运行修复
fixCrossLanguageLinks();
