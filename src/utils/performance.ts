/**
 * MPLP v1.0 性能监控工具
 * 
 * @version v1.0.0
 * @compliance .cursor/rules/performance-standards.mdc - 性能监控标准
 */

export class PerformanceMonitor {
  static measure(operationName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value;
      
      descriptor.value = async function (...args: any[]) {
        const startTime = performance.now();
        try {
          const result = await method.apply(this, args);
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          console.log(`Performance [${operationName}]: ${duration.toFixed(2)}ms`);
          
          return result;
        } catch (error) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          console.error(`Performance [${operationName}] FAILED: ${duration.toFixed(2)}ms`, error);
          throw error;
        }
      };
      
      return descriptor;
    };
  }
} 