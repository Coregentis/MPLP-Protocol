#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 修复语言导航链接问题
 */

function fixLanguageNavigationLinks() {
    const docsDir = path.join(__dirname, '..', 'docs');
    let fixedCount = 0;
    let errorCount = 0;
    
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
            
            // 移除现有的错误语言导航
            const lines = content.split('\n');
            const newLines = [];
            let skipNext = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // 跳过错误的语言导航行
                if (line.includes('🌐 语言导航') || line.includes('🌐 Language Navigation')) {
                    modified = true;
                    // 跳过这行和可能的空行
                    if (i + 1 < lines.length && lines[i + 1].trim() === '') {
                        i++; // 跳过下一个空行
                    }
                    continue;
                }
                
                newLines.push(line);
            }
            
            if (modified) {
                // 重新生成正确的语言导航
                const relativePath = path.relative(docsDir, filePath).replace(/\\/g, '/');
                let languageNav = '';
                
                if (relativePath.startsWith('en/')) {
                    // 英文文件，添加指向中文的导航
                    const chinesePath = relativePath.replace(/^en\//, 'zh-CN/');
                    const chineseFilePath = path.join(docsDir, chinesePath);
                    
                    if (fs.existsSync(chineseFilePath)) {
                        // 计算从当前文件到中文文件的相对路径
                        const currentDir = path.dirname(filePath);
                        const relativeToChineseFile = path.relative(currentDir, chineseFilePath).replace(/\\/g, '/');
                        languageNav = `> **🌐 Language Navigation**: [English](${path.basename(filePath)}) | [中文](${relativeToChineseFile})`;
                    } else {
                        languageNav = `> **🌐 Language Navigation**: [English](${path.basename(filePath)}) | 中文 (开发中)`;
                    }
                } else if (relativePath.startsWith('zh-CN/')) {
                    // 中文文件，添加指向英文的导航
                    const englishPath = relativePath.replace(/^zh-CN\//, 'en/');
                    const englishFilePath = path.join(docsDir, englishPath);
                    
                    if (fs.existsSync(englishFilePath)) {
                        // 计算从当前文件到英文文件的相对路径
                        const currentDir = path.dirname(filePath);
                        const relativeToEnglishFile = path.relative(currentDir, englishFilePath).replace(/\\/g, '/');
                        languageNav = `> **🌐 语言导航**: [English](${relativeToEnglishFile}) | [中文](${path.basename(filePath)})`;
                    } else {
                        languageNav = `> **🌐 语言导航**: English (开发中) | [中文](${path.basename(filePath)})`;
                    }
                } else {
                    // 根目录文件，添加通用导航
                    const englishReadme = path.join(docsDir, 'en', 'README.md');
                    const chineseReadme = path.join(docsDir, 'zh-CN', 'README.md');
                    
                    if (fs.existsSync(englishReadme) && fs.existsSync(chineseReadme)) {
                        languageNav = `> **🌐 Language Navigation**: [English](en/README.md) | [中文](zh-CN/README.md)`;
                    }
                }
                
                if (languageNav) {
                    // 在第一个标题后插入语言导航
                    let insertIndex = 0;
                    for (let i = 0; i < newLines.length; i++) {
                        if (newLines[i].startsWith('#')) {
                            insertIndex = i + 1;
                            break;
                        }
                    }
                    
                    // 插入语言导航
                    newLines.splice(insertIndex, 0, '', languageNav, '');
                }
                
                const newContent = newLines.join('\n');
                fs.writeFileSync(filePath, newContent, 'utf8');
                console.log(`✅ Fixed navigation: ${filePath}`);
                fixedCount++;
            }
            
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
            errorCount++;
        }
    }
    
    console.log('🔧 开始修复语言导航链接...');
    processDirectory(docsDir);
    console.log(`✅ 语言导航链接修复完成！修复了 ${fixedCount} 个文件，错误 ${errorCount} 个文件。`);
}

// 运行修复
fixLanguageNavigationLinks();
