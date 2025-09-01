/**
 * Jest配置文件 - MPLP模块Schema应用功能测试
 * 专门用于测试Context、Plan、Confirm三个模块的Schema应用功能
 * 
 * @version 1.0.0
 * @author MPLP Development Team
 * @date 2025-08-20
 */

module.exports = {
  // 基础配置
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // 根目录
  rootDir: '.',
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*schema-application*.test.ts',
    '**/tests/**/*schema-application*.spec.ts'
  ],
  
  // 包含的测试路径
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // TypeScript配置
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  
  // 模块解析
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@schemas/(.*)$': '<rootDir>/src/schemas/$1'
  },
  
  // 文件扩展名
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json'
  ],
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  
  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/modules/*/api/mappers/*.mapper.ts',
    '!src/modules/*/api/mappers/*.d.ts',
    '!src/modules/*/tests/**',
    '!**/node_modules/**'
  ],
  
  // 覆盖率报告
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json'
  ],
  
  // 覆盖率输出目录
  coverageDirectory: 'coverage/schema-application',
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'src/modules/*/api/mappers/*.mapper.ts': {
      branches: 95,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  
  // 测试超时
  testTimeout: 30000,
  
  // 详细输出
  verbose: true,
  
  // 错误时停止
  bail: false,
  
  // 并行运行
  maxWorkers: '50%',
  
  // 缓存
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache/schema-application',
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // 测试结果处理器
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/schema-application/html-report',
        filename: 'schema-application-test-report.html',
        pageTitle: 'MPLP Schema应用功能测试报告',
        logoImgPath: undefined,
        hideIcon: false,
        expand: true,
        openReport: false,
        inlineSource: false
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage/schema-application',
        outputName: 'schema-application-junit.xml',
        suiteName: 'MPLP Schema应用功能测试',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],
  
  // 自定义匹配器
  setupFilesAfterEnv: [
    '<rootDir>/src/test-utils/schema-application-matchers.ts'
  ],
  
  // 测试环境变量
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // 清除模拟
  clearMocks: true,
  restoreMocks: true,
  
  // 错误处理
  errorOnDeprecated: true,
  
  // 测试序列化
  snapshotSerializers: [
    'jest-serializer-path'
  ],
  
  // 监视模式配置
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ],
  
  // 自定义测试环境
  testEnvironment: 'node',
  
  // 模块目录
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  
  // 忽略的模块路径
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // 转换忽略模式
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // 测试匹配
  testRegex: [
    '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$'
  ],
  
  // 项目配置
  projects: [
    {
      displayName: 'Context模块Schema应用测试',
      testMatch: ['<rootDir>/src/modules/context/tests/**/*schema-application*.test.ts']
    },
    {
      displayName: 'Plan模块Schema应用测试',
      testMatch: ['<rootDir>/src/modules/plan/tests/**/*schema-application*.test.ts']
    },
    {
      displayName: 'Confirm模块Schema应用测试',
      testMatch: ['<rootDir>/src/modules/confirm/tests/**/*schema-application*.test.ts']
    }
  ]
};
