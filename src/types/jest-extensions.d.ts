/**
 * Jest类型扩展定义
 * 
 * 为Jest提供额外的类型支持，特别是针对TypeORM和数据库相关的模拟
 * 
 * @version v1.2.0
 * @created 2025-08-21T10:00:00+08:00
 * @updated 2025-09-09T12:00:00+08:00
 */

// 扩展Jest命名空间
declare namespace jest {
  // 扩展MockedFunction类型，添加对TypeORM Repository的支持
  interface MockedFunction<T extends (...args: any[]) => any> {
    mockResolvedValueOnce<U>(value: U): this;
    mockRejectedValueOnce(value: any): this;
    mockResolvedValue<U>(value: U): this;
    mockRejectedValue(value: any): this;
    mockImplementation(fn?: (...args: any[]) => any): this;
    mockReturnThis(): this;
    mockReturnValue(value: any): this;
    mockReturnValueOnce(value: any): this;
  }

  // 扩展Mock类型，添加对TypeORM Repository的支持
  interface Mock<T = any, Y extends any[] = any[]> {
    mockReturnValueOnce(value: T): this;
    mockResolvedValueOnce<U>(value: U): this;
    mockRejectedValueOnce(value: any): this;
    mockResolvedValue<U>(value: U): this;
    mockRejectedValue(value: any): this;
    mockImplementation(fn?: (...args: any[]) => any): this;
    mockReturnThis(): this;
    mockReturnValue(value: any): this;
  }
  
  // 扩展Mocked类型，使其更加灵活
  type Mocked<T> = {
    [P in keyof T]: T[P] extends (...args: infer A) => infer R
      ? MockedFunction<(...args: A) => R>
      : T[P];
  } & T;
}

// 为TypeORM Repository和QueryBuilder添加类型定义
declare module 'typeorm' {
  interface Repository<Entity> {
    manager: {
      connection: {
        getMetadata: (entity: any) => {
          name: string;
          tableName: string;
          columns: { propertyName: string; databaseName: string }[];
        };
      };
    };
  }

  interface SelectQueryBuilder<Entity> {
    where(condition: string, parameters?: any): this;
    andWhere(condition: string, parameters?: any): this;
    orWhere(condition: string, parameters?: any): this;
    orderBy(sort: string, order?: 'ASC' | 'DESC', nulls?: 'NULLS FIRST' | 'NULLS LAST'): this;
    addOrderBy(sort: string, order?: 'ASC' | 'DESC', nulls?: 'NULLS FIRST' | 'NULLS LAST'): this;
    skip(skip: number): this;
    take(take: number): this;
    leftJoinAndSelect(property: string, alias: string): this;
    innerJoinAndSelect(property: string, alias: string): this;
    getOne(): Promise<Entity | null>;
    getMany(): Promise<Entity[]>;
    getManyAndCount(): Promise<[Entity[], number]>;
    getCount(): Promise<number>;
  }
}

// 扩展Express类型，使其与我们的模拟对象兼容
declare module 'express' {
  interface Request {
    session?: Record<string, any>;
  }
  
  interface Response {
    status(code: number): this;
    json(body: any): this;
    send(body: any): this;
    end(): this;
    setHeader(name: string, value: string): this;
    cookie(name: string, value: any, options?: any): this;
    clearCookie(name: string, options?: any): this;
    redirect(url: string): this;
    render(view: string, options?: any): this;
    locals: any;
  }
  
  interface NextFunction {
    (err?: any): void;
  }
} 