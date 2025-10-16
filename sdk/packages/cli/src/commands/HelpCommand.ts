/**
 * @fileoverview Help command for displaying CLI usage information
 */

import chalk from 'chalk';
import { BaseCommand } from './BaseCommand';
import { CLICommandArgs } from '../core/types';

/**
 * Help command for displaying CLI usage information
 */
export class HelpCommand extends BaseCommand {
  public readonly name = 'help';
  public readonly description = 'Display help information for commands';
  public readonly aliases = ['h'];
  
  public readonly arguments = [
    {
      name: 'command',
      description: 'Command to show help for',
      required: false
    }
  ];

  public readonly examples = [
    'mplp help',
    'mplp help init',
    'mplp help --all'
  ];

  public readonly options = [
    {
      flags: '-a, --all',
      description: 'Show help for all commands'
    }
  ];

  /**
   * Execute the help command
   */
  public async execute(args: CLICommandArgs): Promise<void> {
    const commandName = this.getArgument(args, 0);
    const showAll = this.hasOption(args, 'all');

    if (commandName) {
      await this.showCommandHelp(commandName);
    } else if (showAll) {
      await this.showAllCommandsHelp();
    } else {
      await this.showGeneralHelp();
    }
  }

  /**
   * Show help for a specific command
   */
  private async showCommandHelp(commandName: string): Promise<void> {
    // This would typically get the command from the CLI application
    // For now, we'll show a placeholder
    this.logger.header(`Help for command: ${commandName}`);
    this.logger.info(`Detailed help for '${commandName}' would be shown here.`);
    this.logger.info(`Run '${this.context.config.name} ${commandName} --help' for more information.`);
  }

  /**
   * Show help for all commands
   */
  private async showAllCommandsHelp(): Promise<void> {
    this.logger.banner('MPLP CLI - All Commands', 60);
    this.logger.newline();

    const commandGroups = [
      {
        title: 'Project Management',
        commands: [
          { name: 'init', description: 'Create a new MPLP project' },
          { name: 'build', description: 'Build the project' },
          { name: 'dev', description: 'Start development server' },
          { name: 'test', description: 'Run tests' }
        ]
      },
      {
        title: 'Code Generation',
        commands: [
          { name: 'generate', description: 'Generate code from templates' },
          { name: 'scaffold', description: 'Scaffold project structure' }
        ]
      },
      {
        title: 'Utilities',
        commands: [
          { name: 'info', description: 'Show project information' },
          { name: 'doctor', description: 'Check project health' },
          { name: 'help', description: 'Show help information' }
        ]
      }
    ];

    for (const group of commandGroups) {
      this.logger.subheader(group.title);
      for (const cmd of group.commands) {
        this.logger.log(`  ${chalk.cyan(cmd.name.padEnd(12))} ${cmd.description}`);
      }
      this.logger.newline();
    }

    this.logger.info(`Run '${this.context.config.name} help <command>' for detailed help on any command.`);
  }

  /**
   * Show general help
   */
  private async showGeneralHelp(): Promise<void> {
    this.logger.banner('MPLP CLI - Multi-Agent Protocol Lifecycle Platform', 70);
    this.logger.newline();

    this.logger.log(chalk.gray('A powerful command-line interface for building multi-agent systems'));
    this.logger.newline();

    // Usage
    this.logger.subheader('Usage');
    this.logger.command(`${this.context.config.name} <command> [options]`);
    this.logger.newline();

    // Common commands
    this.logger.subheader('Common Commands');
    const commonCommands = [
      { command: 'init [name]', description: 'Create a new MPLP project' },
      { command: 'generate <type>', description: 'Generate code from templates' },
      { command: 'dev', description: 'Start development server' },
      { command: 'build', description: 'Build the project for production' },
      { command: 'test', description: 'Run project tests' },
      { command: 'info', description: 'Show project information' }
    ];

    for (const cmd of commonCommands) {
      this.logger.log(`  ${chalk.cyan(cmd.command.padEnd(20))} ${cmd.description}`);
    }
    this.logger.newline();

    // Global options
    this.logger.subheader('Global Options');
    const globalOptions = [
      { option: '-h, --help', description: 'Show help information' },
      { option: '-v, --version', description: 'Show version number' },
      { option: '--verbose', description: 'Enable verbose output' },
      { option: '--quiet', description: 'Suppress output' },
      { option: '--debug', description: 'Enable debug mode' }
    ];

    for (const opt of globalOptions) {
      this.logger.log(`  ${chalk.yellow(opt.option.padEnd(20))} ${opt.description}`);
    }
    this.logger.newline();

    // Examples
    this.logger.subheader('Examples');
    const examples = [
      'mplp init my-agent --template advanced',
      'mplp generate agent --name GreetingAgent',
      'mplp generate workflow --name ProcessingWorkflow',
      'mplp dev --port 3000',
      'mplp build --production'
    ];

    this.logger.commands(examples.map(example => ({ command: example })));
    this.logger.newline();

    // Getting started
    this.logger.subheader('Getting Started');
    this.logger.log('1. Create a new project:');
    this.logger.command('mplp init my-first-agent');
    this.logger.newline();
    
    this.logger.log('2. Navigate to the project:');
    this.logger.command('cd my-first-agent');
    this.logger.newline();
    
    this.logger.log('3. Start development:');
    this.logger.command('mplp dev');
    this.logger.newline();

    // Resources
    this.logger.subheader('Resources');
    this.logger.list([
      `Documentation: ${chalk.blue('https://mplp.dev/docs')}`,
      `GitHub: ${chalk.blue('https://github.com/mplp-org/mplp')}`,
      `Discord: ${chalk.blue('https://discord.gg/mplp')}`,
      `Twitter: ${chalk.blue('https://twitter.com/mplp_dev')}`
    ]);
    this.logger.newline();

    // Footer
    this.logger.info(`For detailed help on any command, run: ${chalk.cyan(`${this.context.config.name} help <command>`)}`);
    this.logger.info(`For all available commands, run: ${chalk.cyan(`${this.context.config.name} help --all`)}`);
  }
}
