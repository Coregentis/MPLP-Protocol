/**
 * 快速修复路径脚本
 */

const fs = require('fs');
const path = require('path');

function getAllTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixPaths() {
  const srcDir = path.join(__dirname, 'src');
  const tsFiles = getAllTsFiles(srcDir);
  
  const pathRules = [
    // 修复所有public路径
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/public\/shared\/types['"]/g, to: "from '../../../shared/types'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/public\/shared\/types['"]/g, to: "from '../../../shared/types'" },
    { from: /from ['"]\.\.\/\.\.\/public\/shared\/types['"]/g, to: "from '../../shared/types'" },
    { from: /from ['"]\.\.\/public\/shared\/types['"]/g, to: "from '../shared/types'" },
    
    // 修复特定类型文件路径
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/public\/shared\/types\/([\w-]+)['"]/g, to: "from '../../../shared/types'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/public\/shared\/types\/([\w-]+)['"]/g, to: "from '../../../shared/types'" },
    { from: /from ['"]\.\.\/\.\.\/public\/shared\/types\/([\w-]+)['"]/g, to: "from '../../shared/types'" },
    { from: /from ['"]\.\.\/public\/shared\/types\/([\w-]+)['"]/g, to: "from '../shared/types'" },
    
    // 修复Logger路径
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/public\/utils\/logger['"]/g, to: "from '../../../utils/logger'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/public\/utils\/logger['"]/g, to: "from '../../../utils/logger'" },
    { from: /from ['"]\.\.\/\.\.\/public\/utils\/logger['"]/g, to: "from '../../utils/logger'" },
    { from: /from ['"]\.\.\/public\/utils\/logger['"]/g, to: "from '../utils/logger'" },
    
    // 修复types路径
    { from: /from ['"]\.\.\/\.\.\/\.\.\/types['"]/g, to: "from '../../../shared/types'" },
    { from: /from ['"]\.\.\/\.\.\/types['"]/g, to: "from '../../shared/types'" },
    { from: /from ['"]\.\.\/types['"]/g, to: "from '../shared/types'" },
    
    // 修复export路径
    { from: /export \* from ['"]\.\.\/\.\.\/public\/shared\/types\/([\w-]+)['"]/g, to: "export * from '../shared/types'" },
    { from: /export \* from ['"]\.\.\/public\/shared\/types\/([\w-]+)['"]/g, to: "export * from '../shared/types'" }
  ];
  
  let totalFixed = 0;
  
  for (const file of tsFiles) {
    let content = fs.readFileSync(file, 'utf-8');
    let modified = false;
    
    for (const rule of pathRules) {
      if (rule.from.test(content)) {
        content = content.replace(rule.from, rule.to);
        modified = true;
        totalFixed++;
      }
    }
    
    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`✓ 修复: ${path.relative(__dirname, file)}`);
    }
  }
  
  console.log(`\n总共修复了 ${totalFixed} 个路径引用`);
}

fixPaths();
