/**
 * MPLP 厂商中立性验证测试
 * 
 * @version v1.0.0
 * @created 2025-07-12T23:00:00+08:00
 * @compliance .cursor/rules/architecture.mdc - 厂商中立原则（最高架构优先级）
 * @description 验证所有模块的实现符合厂商中立原则，确保不依赖于任何特定厂商或平台
 */

import fs from 'fs';
import path from 'path';

describe('MPLP厂商中立性验证', () => {
  // 定义厂商中立性规则
  const vendorNeutralRules = {
    // 禁止在核心代码中直接使用厂商特定的实现
    prohibitedVendorDirectImports: [
      'tracepilot-api',
      'coregentis-api',
      '@tracepilot/',
      '@coregentis/',
      'tracepilot-sdk',
      'coregentis-sdk'
    ],
    
    // 核心模块目录（不应包含厂商特定的实现）
    coreModules: [
      'src/modules/context',
      'src/modules/plan',
      'src/modules/confirm',
      'src/modules/trace',
      'src/modules/role',
      'src/interfaces'
    ],
    
    // 允许的厂商集成目录（应该存放厂商特定的适配器实现）
    vendorAdapterDirs: [
      'src/adapters',
      'src/mcp'
    ],
    
    // 厂商中立的适配器接口（核心模块应该只依赖这些接口）
    neutralInterfaces: [
      'ITraceAdapter',
      'IContextRepository',
      'IPlanRepository',
      'IConfirmRepository'
    ]
  };

  // 递归获取目录下所有TypeScript文件
  const getAllTypeScriptFiles = (dir: string): string[] => {
    let results: string[] = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        results = results.concat(getAllTypeScriptFiles(itemPath));
      } else if (itemPath.endsWith('.ts') && !itemPath.endsWith('.test.ts') && !itemPath.endsWith('.spec.ts')) {
        results.push(itemPath);
      }
    }
    
    return results;
  };

  // 读取文件内容
  const readFileContent = (filePath: string): string => {
    return fs.readFileSync(filePath, 'utf-8');
  };

  describe('核心模块厂商中立性', () => {
    let coreModuleFiles: string[] = [];
    
    // 获取所有核心模块文件
    vendorNeutralRules.coreModules.forEach(moduleDir => {
      if (fs.existsSync(moduleDir)) {
        coreModuleFiles = coreModuleFiles.concat(getAllTypeScriptFiles(moduleDir));
      }
    });

    test('核心模块不应直接导入厂商特定的包', () => {
      coreModuleFiles.forEach(file => {
        const content = readFileContent(file);
        const importLines = content.split('\n').filter(line => 
          line.trim().startsWith('import ') || line.trim().startsWith('require(')
        );
        
        for (const importLine of importLines) {
          vendorNeutralRules.prohibitedVendorDirectImports.forEach(vendorImport => {
            expect(importLine).not.toContain(vendorImport);
          });
        }
      });
    });
    
    test('核心模块不应使用厂商特定的类名或变量名', () => {
      coreModuleFiles.forEach(file => {
        const content = readFileContent(file);
        
        // 检查厂商特定的类名或变量名
        expect(content).not.toMatch(/\bTracePilot(?!Adapter)\b/);
        expect(content).not.toMatch(/\bCoregentis(?!Adapter)\b/);
        
        // 检查类定义中是否有厂商特定的实现
        const classDefinitions = content.match(/class\s+(\w+)/g) || [];
        classDefinitions.forEach(classDef => {
          expect(classDef).not.toMatch(/TracePilot(?!Adapter)/);
          expect(classDef).not.toMatch(/Coregentis(?!Adapter)/);
        });
      });
    });
    
    test('核心模块应只依赖中立接口，不应依赖具体实现', () => {
      coreModuleFiles.forEach(file => {
        const content = readFileContent(file);
        const classContent = content.split(/class\s+\w+/).slice(1);
        
        classContent.forEach(classBody => {
          // 查找私有属性声明
          const privateProps = classBody.match(/private\s+\w+\s*:\s*(\w+)/g) || [];
          
          privateProps.forEach(prop => {
            const typeName = prop.split(':')[1].trim();
            const isNeutralInterface = vendorNeutralRules.neutralInterfaces.some(
              iface => typeName.includes(iface)
            );
            const isVendorSpecific = typeName.includes('TracePilot') || 
                                   typeName.includes('Coregentis');
            
            // 如果是厂商特定类型，则必须是中立接口
            if (isVendorSpecific) {
              expect(isNeutralInterface).toBe(true);
            }
          });
        });
      });
    });
  });

  describe('适配器厂商中立性', () => {
    let adapterFiles: string[] = [];
    
    // 获取所有适配器文件
    vendorNeutralRules.vendorAdapterDirs.forEach(adapterDir => {
      if (fs.existsSync(adapterDir)) {
        adapterFiles = adapterFiles.concat(getAllTypeScriptFiles(adapterDir));
      }
    });

    test('厂商特定的适配器应实现中立接口', () => {
      adapterFiles.forEach(file => {
        const content = readFileContent(file);
        
        // 如果文件包含厂商特定的适配器
        if (
          content.includes('TracePilot') || 
          content.includes('Coregentis') ||
          file.includes('tracepilot') ||
          file.includes('coregentis')
        ) {
          // 确保实现了中立接口
          const hasInterface = vendorNeutralRules.neutralInterfaces.some(
            iface => content.includes(`implements ${iface}`)
          );
          
          expect(hasInterface).toBe(true);
        }
      });
    });
    
    test('适配器工厂应支持多个厂商实现', () => {
      const factoryFiles = adapterFiles.filter(file => file.includes('factory') || file.includes('Factory'));
      
      factoryFiles.forEach(file => {
        const content = readFileContent(file);
        
        // 适配器工厂不应硬编码单一厂商
        expect(content).not.toMatch(/return new TracePilot(?!Adapter)/);
        expect(content).not.toMatch(/return new Coregentis(?!Adapter)/);
        
        // 应该支持适配器类型选择或策略模式
        const hasFactoryLogic = 
          content.includes('switch') || 
          content.includes('if') || 
          content.includes('Map<') || 
          content.includes('Record<');
          
        expect(hasFactoryLogic).toBe(true);
      });
    });
  });

  describe('接口厂商中立性', () => {
    test('中立接口不应包含厂商特定的方法或类型', () => {
      const interfaceFiles = getAllTypeScriptFiles('src/interfaces');
      
      interfaceFiles.forEach(file => {
        const content = readFileContent(file);
        const interfaceDefinitions = content.split(/interface\s+\w+/).slice(1);
        
        interfaceDefinitions.forEach(interfaceDef => {
          // 检查方法名不应包含厂商特定的名称
          const methods = interfaceDef.match(/\w+\s*\([^)]*\)/g) || [];
          
          methods.forEach(method => {
            expect(method).not.toMatch(/tracepilot|coregentis/i);
          });
          
          // 检查属性名不应包含厂商特定的名称
          const props = interfaceDef.match(/\w+\s*:/g) || [];
          
          props.forEach(prop => {
            expect(prop).not.toMatch(/tracepilot|coregentis/i);
          });
        });
      });
    });
  });

  describe('测试厂商中立性', () => {
    test('测试应验证多个厂商适配器的兼容性', () => {
      // 查找所有适配器测试文件
      const testFiles = getAllTypeScriptFiles('tests')
        .filter(file => file.includes('adapter') || file.includes('integration'));
      
      // 至少应该有一个测试验证不同适配器实现的兼容性
      const hasAdapterCompatiblityTest = testFiles.some(file => {
        const content = readFileContent(file);
        return (
          content.includes('vendor-neutral') || 
          (content.includes('adapter') && content.includes('switch'))
        );
      });
      
      expect(hasAdapterCompatiblityTest).toBe(true);
    });
  });

  describe('配置厂商中立性', () => {
    test('配置应支持多个厂商适配器', () => {
      const configFiles = getAllTypeScriptFiles('src/config');
      
      configFiles.forEach(file => {
        const content = readFileContent(file);
        
        if (content.includes('adapter') || content.includes('provider')) {
          // 配置不应硬编码单一厂商
          expect(content).not.toMatch(/default[^=]*=\s*["']tracepilot["']/i);
          expect(content).not.toMatch(/default[^=]*=\s*["']coregentis["']/i);
          
          // 应该支持配置选择
          const hasConfigOption = 
            content.includes('process.env') || 
            content.includes('config.') || 
            content.includes('settings.');
            
          expect(hasConfigOption).toBe(true);
        }
      });
    });
  });
}); 