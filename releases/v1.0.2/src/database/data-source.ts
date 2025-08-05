/**
 * 数据源配置
 */
import { config } from '../config';

export class AppDataSource {
  private static instance: AppDataSource;

  static getInstance(): AppDataSource {
    if (!AppDataSource.instance) {
      AppDataSource.instance = new AppDataSource();
    }
    return AppDataSource.instance;
  }

  async initialize(): Promise<void> {
    console.log('Database initialized');
  }

  async destroy(): Promise<void> {
    console.log('Database connection closed');
  }
}

export default AppDataSource.getInstance();
