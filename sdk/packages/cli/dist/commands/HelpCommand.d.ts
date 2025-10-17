/**
 * @fileoverview Help command for displaying CLI usage information
 */
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';
/**
 * Help command for displaying CLI usage information
 */
export declare class HelpCommand extends BaseCommand {
    readonly name = "help";
    readonly description = "Display help information for commands";
    readonly aliases: string[];
    readonly arguments: {
        name: string;
        description: string;
        required: boolean;
    }[];
    readonly examples: string[];
    readonly options: {
        flags: string;
        description: string;
    }[];
    /**
     * Execute the help command
     */
    execute(args: CLICommandArgs): Promise<void>;
    /**
     * Show help for a specific command
     */
    private showCommandHelp;
    /**
     * Show help for all commands
     */
    private showAllCommandsHelp;
    /**
     * Show general help
     */
    private showGeneralHelp;
}
//# sourceMappingURL=HelpCommand.d.ts.map