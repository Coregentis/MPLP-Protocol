/**
 * 修复 glob 和 minimatch 类型定义的错误
 * 这个文件解决了 node_modules/@types/glob/index.d.ts 和 node_modules/minimatch/dist/commonjs/ast.d.ts 的类型错误
 */

// 修复 glob 类型
declare module 'glob' {
  import * as minimatch from 'minimatch';
  import * as events from 'events';
  import * as fs from 'fs';

  function glob(pattern: string, options: glob.IOptions, cb: (err: Error | null, matches: string[]) => void): void;
  function glob(pattern: string, cb: (err: Error | null, matches: string[]) => void): void;
  
  namespace glob {
    function sync(pattern: string, options?: IOptions): string[];
    function hasMagic(pattern: string, options?: IOptions): boolean;
    
    interface IOptions {
      cwd?: string;
      root?: string;
      dot?: boolean;
      nomount?: boolean;
      mark?: boolean;
      nosort?: boolean;
      stat?: boolean;
      silent?: boolean;
      strict?: boolean;
      cache?: { [path: string]: boolean | 'DIR' | 'FILE' | ReadonlyArray<string> };
      statCache?: { [path: string]: fs.Stats | false };
      symlinks?: { [path: string]: boolean | undefined };
      sync?: boolean;
      nounique?: boolean;
      nonull?: boolean;
      debug?: boolean;
      nobrace?: boolean;
      noglobstar?: boolean;
      noext?: boolean;
      nocase?: boolean;
      matchBase?: boolean;
      nodir?: boolean;
      ignore?: string | ReadonlyArray<string>;
      follow?: boolean;
      realpath?: boolean;
      absolute?: boolean;
    }
    
    class Glob extends events.EventEmitter {
      constructor(pattern: string, options?: IOptions, cb?: (err: Error | null, matches: string[]) => void);
      pause(): void;
      resume(): void;
      abort(): void;
    }
  }
  
  export = glob;
}

// 修复 minimatch 类型
declare module 'minimatch/dist/commonjs/ast' {
  export interface AST {
    type: string;
    [key: string]: any;
  }
} 