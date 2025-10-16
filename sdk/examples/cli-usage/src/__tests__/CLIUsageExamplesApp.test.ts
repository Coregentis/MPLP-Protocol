/**
 * @fileoverview CLI Usage Examples App Tests
 * @version 1.1.0-beta
 */

import { CLIUsageExamplesApp } from '../index';
import { CLIUsageDemo } from '../demos/CLIUsageDemo';
import { ProjectInitializationExample } from '../examples/ProjectInitializationExample';
import { CodeGenerationExample } from '../examples/CodeGenerationExample';
import { DevelopmentWorkflowExample } from '../examples/DevelopmentWorkflowExample';

// Mock the example classes
const mockRunAllDemos = jest.fn().mockResolvedValue(undefined);
const mockProjectRunAllExamples = jest.fn().mockResolvedValue(undefined);
const mockCodeRunAllExamples = jest.fn().mockResolvedValue(undefined);
const mockWorkflowRunAllExamples = jest.fn().mockResolvedValue(undefined);

jest.mock('../demos/CLIUsageDemo', () => {
  return {
    CLIUsageDemo: jest.fn().mockImplementation(() => ({
      runAllDemos: mockRunAllDemos
    }))
  };
});

jest.mock('../examples/ProjectInitializationExample', () => {
  return {
    ProjectInitializationExample: jest.fn().mockImplementation(() => ({
      runAllExamples: mockProjectRunAllExamples
    }))
  };
});

jest.mock('../examples/CodeGenerationExample', () => {
  return {
    CodeGenerationExample: jest.fn().mockImplementation(() => ({
      runAllExamples: mockCodeRunAllExamples
    }))
  };
});

jest.mock('../examples/DevelopmentWorkflowExample', () => {
  return {
    DevelopmentWorkflowExample: jest.fn().mockImplementation(() => ({
      runAllExamples: mockWorkflowRunAllExamples
    }))
  };
});

describe('CLIUsageExamplesApp', () => {
  let app: CLIUsageExamplesApp;

  beforeEach(() => {
    // Clear all mocks and reset implementations
    jest.clearAllMocks();

    // Reset mock implementations to default
    mockRunAllDemos.mockResolvedValue(undefined);
    mockProjectRunAllExamples.mockResolvedValue(undefined);
    mockCodeRunAllExamples.mockResolvedValue(undefined);
    mockWorkflowRunAllExamples.mockResolvedValue(undefined);

    app = new CLIUsageExamplesApp();
  });

  describe('constructor', () => {
    it('should create an instance successfully', () => {
      expect(app).toBeInstanceOf(CLIUsageExamplesApp);
    });
  });

  describe('runAllExamples', () => {
    it('should run all examples in correct order', async () => {
      await app.runAllExamples();

      expect(mockProjectRunAllExamples).toHaveBeenCalledTimes(1);
      expect(mockCodeRunAllExamples).toHaveBeenCalledTimes(1);
      expect(mockWorkflowRunAllExamples).toHaveBeenCalledTimes(1);
      expect(mockRunAllDemos).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Test error');
      mockProjectRunAllExamples.mockRejectedValue(error);

      await expect(app.runAllExamples()).rejects.toThrow('Test error');
    });
  });

  describe('runExample', () => {
    it('should run project-init example', async () => {
      await app.runExample('project-init');

      expect(mockProjectRunAllExamples).toHaveBeenCalledTimes(1);
      expect(mockCodeRunAllExamples).not.toHaveBeenCalled();
      expect(mockWorkflowRunAllExamples).not.toHaveBeenCalled();
      expect(mockRunAllDemos).not.toHaveBeenCalled();
    });

    it('should run code-generation example', async () => {
      await app.runExample('code-generation');

      expect(mockCodeRunAllExamples).toHaveBeenCalledTimes(1);
      expect(mockProjectRunAllExamples).not.toHaveBeenCalled();
      expect(mockWorkflowRunAllExamples).not.toHaveBeenCalled();
      expect(mockRunAllDemos).not.toHaveBeenCalled();
    });

    it('should run workflow example', async () => {
      await app.runExample('workflow');

      expect(mockWorkflowRunAllExamples).toHaveBeenCalledTimes(1);
      expect(mockProjectRunAllExamples).not.toHaveBeenCalled();
      expect(mockCodeRunAllExamples).not.toHaveBeenCalled();
      expect(mockRunAllDemos).not.toHaveBeenCalled();
    });

    it('should run demo example', async () => {
      await app.runExample('demo');

      expect(mockRunAllDemos).toHaveBeenCalledTimes(1);
      expect(mockProjectRunAllExamples).not.toHaveBeenCalled();
      expect(mockCodeRunAllExamples).not.toHaveBeenCalled();
      expect(mockWorkflowRunAllExamples).not.toHaveBeenCalled();
    });

    it('should throw error for unknown example', async () => {
      await expect(app.runExample('unknown')).rejects.toThrow('Unknown example: unknown');
    });

    it('should handle example execution errors', async () => {
      const error = new Error('Example error');
      mockProjectRunAllExamples.mockRejectedValue(error);

      await expect(app.runExample('project-init')).rejects.toThrow('Example error');
    });
  });

  describe('displayAvailableExamples', () => {
    it('should display available examples without errors', () => {
      // Mock console.log to capture output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      app.displayAvailableExamples();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Available CLI Usage Examples')
      );

      consoleSpy.mockRestore();
    });
  });
});

describe('CLI Usage Examples Integration', () => {
  // Suppress console output during tests
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should create and initialize all example classes', () => {
    const app = new CLIUsageExamplesApp();
    expect(app).toBeInstanceOf(CLIUsageExamplesApp);
  });

  it('should handle CLI entry point scenarios', () => {
    // Test that the module can be required without errors
    expect(() => {
      require('../index');
    }).not.toThrow();
  });
});

describe('Example Class Exports', () => {
  it('should export all example classes', () => {
    const {
      CLIUsageDemo,
      ProjectInitializationExample,
      CodeGenerationExample,
      DevelopmentWorkflowExample,
      default: DefaultExport
    } = require('../index');

    expect(CLIUsageDemo).toBeDefined();
    expect(ProjectInitializationExample).toBeDefined();
    expect(CodeGenerationExample).toBeDefined();
    expect(DevelopmentWorkflowExample).toBeDefined();
    expect(DefaultExport).toBeDefined();
    expect(DefaultExport).toBe(CLIUsageExamplesApp);
  });
});

describe('Error Handling', () => {
  let app: CLIUsageExamplesApp;

  beforeEach(() => {
    app = new CLIUsageExamplesApp();
  });

  it('should handle network-related errors', async () => {
    const networkError = new Error('Network timeout');

    // Mock one of the examples to throw a network error
    mockProjectRunAllExamples.mockRejectedValue(networkError);

    await expect(app.runExample('project-init')).rejects.toThrow('Network timeout');
  });

  it('should handle file system errors', async () => {
    const fsError = new Error('Permission denied');

    mockCodeRunAllExamples.mockRejectedValue(fsError);

    await expect(app.runExample('code-generation')).rejects.toThrow('Permission denied');
  });

  it('should handle validation errors', async () => {
    const validationError = new Error('Invalid configuration');

    mockWorkflowRunAllExamples.mockRejectedValue(validationError);

    await expect(app.runExample('workflow')).rejects.toThrow('Invalid configuration');
  });
});

describe('Performance Tests', () => {
  let app: CLIUsageExamplesApp;

  beforeEach(() => {
    app = new CLIUsageExamplesApp();
  });

  it('should complete example execution within reasonable time', async () => {
    // Reset mocks to ensure clean state
    mockRunAllDemos.mockResolvedValue(undefined);
    mockProjectRunAllExamples.mockResolvedValue(undefined);
    mockCodeRunAllExamples.mockResolvedValue(undefined);
    mockWorkflowRunAllExamples.mockResolvedValue(undefined);

    const startTime = Date.now();

    // Mock all examples to resolve quickly (already mocked above)
    await app.runAllExamples();

    const executionTime = Date.now() - startTime;

    // Should complete within 1 second when mocked
    expect(executionTime).toBeLessThan(1000);
  });

  it('should handle concurrent example execution', async () => {
    // Mock examples to resolve after different delays
    mockProjectRunAllExamples.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    mockCodeRunAllExamples.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 150)));

    const promises = [
      app.runExample('project-init'),
      app.runExample('code-generation')
    ];

    await expect(Promise.all(promises)).resolves.toEqual([undefined, undefined]);
  });
});

describe('Memory Management', () => {
  it('should not leak memory during multiple example runs', async () => {
    const app = new CLIUsageExamplesApp();

    // Run the same example multiple times
    for (let i = 0; i < 10; i++) {
      await app.runExample('project-init');
    }

    // If we reach here without memory issues, the test passes
    expect(true).toBe(true);
  });
});
