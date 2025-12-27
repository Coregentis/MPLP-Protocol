export interface FsStorageConfig {
    baseDir: string;
}
export declare class JsonFsStorage {
    private readonly config;
    constructor(config: FsStorageConfig);
    private filePath;
    write<T>(key: string, value: T): Promise<void>;
    read<T>(key: string): Promise<T | null>;
}
