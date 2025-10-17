#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 为缺少语言导航的文件添加标准化的多语言导航
 */

function addLanguageNavigation() {
    const docsDir = path.join(__dirname, '..', 'docs');
    let addedCount = 0;
    let skippedCount = 0;
    
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
            
            // 检查是否已经有语言导航
            if (content.includes('🌐 语言导航') || content.includes('🌐 Language Navigation')) {
                skippedCount++;
                return;
            }
            
            // 确定文件的语言和对应的另一种语言文件路径
            const relativePath = path.relative(docsDir, filePath);
            let languageNav = '';
            
            if (relativePath.startsWith('en\\') || relativePath.startsWith('en/')) {
                // 英文文件，添加指向中文的导航
                const chinesePath = relativePath.replace(/^en[\\\/]/, 'zh-CN/').replace(/\\/g, '/');
                const chineseFilePath = path.join(docsDir, chinesePath);
                
                if (fs.existsSync(chineseFilePath)) {
                    languageNav = `> **🌐 Language Navigation**: [English](${relativePath.replace(/\\/g, '/')}) | [中文](../${chinesePath})`;
                } else {
                    languageNav = `> **🌐 Language Navigation**: [English](${relativePath.replace(/\\/g, '/')}) | 中文 (开发中)`;
                }
            } else if (relativePath.startsWith('zh-CN\\') || relativePath.startsWith('zh-CN/')) {
                // 中文文件，添加指向英文的导航
                const englishPath = relativePath.replace(/^zh-CN[\\\/]/, 'en/').replace(/\\/g, '/');
                const englishFilePath = path.join(docsDir, englishPath);
                
                if (fs.existsSync(englishFilePath)) {
                    languageNav = `> **🌐 语言导航**: [English](../${englishPath}) | [中文](${relativePath.replace(/\\/g, '/')})`;
                } else {
                    languageNav = `> **🌐 语言导航**: English (开发中) | [中文](${relativePath.replace(/\\/g, '/')})`;
                }
            } else {
                // 根目录文件，添加通用导航
                languageNav = `> **🌐 Language Navigation**: [English](en/README.md) | [中文](zh-CN/README.md)`;
            }
            
            if (languageNav) {
                // 在文件开头添加语言导航（在标题后）
                const lines = content.split('\n');
                let insertIndex = 0;
                
                // 找到第一个标题后的位置
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith('#')) {
                        insertIndex = i + 1;
                        break;
                    }
                }
                
                // 如果没有找到标题，在文件开头插入
                if (insertIndex === 0) {
                    insertIndex = 0;
                }
                
                // 插入语言导航
                lines.splice(insertIndex, 0, '', languageNav, '');
                
                const newContent = lines.join('\n');
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`✅ Added navigation: ${filePath}`);
                addedCount++;
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
        }
    }
    
    console.log('🔧 开始添加语言导航...');
    processDirectory(docsDir);
    console.log(`✅ 语言导航添加完成！添加了 ${addedCount} 个文件，跳过了 ${skippedCount} 个已有导航的文件。`);
}

// 运行添加
addLanguageNavigation();
