/**
 * @fileoverview Test command for running tests in MPLP projects
 * @version 1.1.0-beta
 * @based_on MPLP V1.0 Alpha测试模式
 */
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
/**
 * Test command for running tests in MPLP projects
 */
export declare class TestCommand extends BaseCommand {
    readonly name = "test";
    readonly description = "Run tests for the project";
    readonly aliases: string[];
    readonly arguments: {
        name: string;
        description: string;
        required: boolean;
    }[];
    readonly options: ({
        flags: string;
        description: string;
        defaultValue?: undefined;
        choices?: undefined;
    } | {
        flags: string;
        description: string;
        defaultValue: string;
        choices?: undefined;
    } | {
        flags: string;
        description: string;
        choices: string[];
        defaultValue: string;
    })[];
    readonly examples: string[];
    constructor(context: any);
    /**
     * Execute the test command
     */
    execute(args: CLICommandArgs): Promise<void>;
    /**
     * Validate we're in a project directory
     */
    private validateProjectDirectory;
    /**
     * Get test configuration
     */
    private getTestConfig;
    /**
     * Run tests
     */
    private runTests;
    /**
     * Show test configuration
     */
    private showTestConfiguration;
    /**
     * Build Jest command arguments
     */
    private buildJestArgs;
    /**
     * Find Jest executable
     */
    private findJestExecutable;
    /**
     * Run Jest with the specified arguments
     */
    private runJest;
}
//# sourceMappingURL=TestCommand.d.ts.map