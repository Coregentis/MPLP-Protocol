/**
 * glob模块类型声明
 */
declare module 'glob' {
  export interface IOptions {
    cwd?: string;
    root?: string;
    dot?: boolean;
    nomount?: boolean;
    mark?: boolean;
    nosort?: boolean;
    stat?: boolean;
    silent?: boolean;
    strict?: boolean;
    cache?: object;
    statCache?: object;
    symlinks?: object;
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
    ignore?: string | string[];
    follow?: boolean;
    realpath?: boolean;
    absolute?: boolean;
    maxDepth?: number;
  }

  export function glob(pattern: string, options?: IOptions): Promise<string[]>;
  export function sync(pattern: string, options?: IOptions): string[];
  export function hasMagic(pattern: string, options?: IOptions): boolean;
  export function Glob(pattern: string, options?: IOptions): any;
} 