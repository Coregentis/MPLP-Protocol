# MPLP CLI API Reference

## Core Classes

### CLIApplication

Main CLI application class that manages commands and execution.

```typescript
class CLIApplication {
  constructor(config: CLIConfig)
  
  // Run the CLI application
  async run(argv?: string[]): Promise<void>
  
  // Get CLI context
  getContext(): CLIContext
  
  // Get registered commands
  getCommands(): Map<string, CLICommand>
  
  // Add a command dynamically
  addCommand(command: CLICommand): void
  
  // Remove a command
  removeCommand(name: string): boolean
}
```

### BaseCommand

Abstract base class for CLI commands.

```typescript
abstract class BaseCommand implements CLICommand {
  abstract readonly name: string
  abstract readonly description: string
  readonly aliases?: string[]
  readonly options?: CLIOption[]
  readonly arguments?: CLIArgument[]
  readonly examples?: string[]
  
  abstract execute(args: CLICommandArgs): Promise<void>
  
  // Protected helper methods
  protected validate(args: CLICommandArgs): void
  protected getOption<T>(args: CLICommandArgs, name: string, defaultValue?: T): T
  protected getArgument(args: CLICommandArgs, index: number, defaultValue?: string): string
  protected hasOption(args: CLICommandArgs, name: string): boolean
  protected startSpinner(message: string): void
  protected succeedSpinner(message?: string): void
  protected failSpinner(message?: string): void
  protected async confirm(message: string, defaultValue?: boolean): Promise<boolean>
  protected async prompt(message: string, defaultValue?: string): Promise<string>
  protected async select(message: string, choices: string[], defaultValue?: string): Promise<string>
}
```

### Logger

CLI logging utility with colored output.

```typescript
class Logger implements CLILogger {
  info(message: string, ...args: unknown[]): void
  warn(message: string, ...args: unknown[]): void
  error(message: string, ...args: unknown[]): void
  success(message: string, ...args: unknown[]): void
  debug(message: string, ...args: unknown[]): void
  log(message: string, ...args: unknown[]): void
  
  // Formatting methods
  header(message: string): void
  subheader(message: string): void
  list(items: string[], bullet?: string): void
  table(data: Record<string, string>, indent?: number): void
  code(code: string, language?: string): void
  command(command: string, description?: string): void
  banner(message: string, width?: number): void
}
```

### Spinner

CLI spinner utility for progress indication.

```typescript
class Spinner implements CLISpinner {
  start(text?: string): void
  stop(): void
  succeed(text?: string): void
  fail(text?: string): void
  warn(text?: string): void
  info(text?: string): void
  
  get text(): string
  set text(value: string)
  get isSpinning(): boolean
  
  // Static factory methods
  static createProgress(steps: string[]): ProgressSpinner
  static createMultiLine(): MultiLineSpinner
}
```

## Commands

### InitCommand

Creates new MPLP projects from templates.

```typescript
class InitCommand extends BaseCommand {
  readonly name = 'init'
  readonly description = 'Create a new MPLP project'
  readonly aliases = ['create', 'new']
  
  async execute(args: CLICommandArgs): Promise<void>
}
```

**Arguments:**
- `project-name` (optional) - Name of the project to create

**Options:**
- `-t, --template <template>` - Project template (basic, advanced, enterprise)
- `-d, --directory <directory>` - Target directory
- `--description <description>` - Project description
- `--author <author>` - Project author
- `--license <license>` - Project license
- `--no-git` - Skip Git repository initialization
- `--no-install` - Skip dependency installation
- `--typescript` - Use TypeScript template
- `--eslint` - Include ESLint configuration
- `--prettier` - Include Prettier configuration

### HelpCommand

Displays help information for commands.

```typescript
class HelpCommand extends BaseCommand {
  readonly name = 'help'
  readonly description = 'Display help information for commands'
  readonly aliases = ['h']
  
  async execute(args: CLICommandArgs): Promise<void>
}
```

**Arguments:**
- `command` (optional) - Command to show help for

**Options:**
- `-a, --all` - Show help for all commands

### InfoCommand

Displays project and environment information.

```typescript
class InfoCommand extends BaseCommand {
  readonly name = 'info'
  readonly description = 'Display project and environment information'
  readonly aliases = ['i']
  
  async execute(args: CLICommandArgs): Promise<void>
}
```

**Options:**
- `--env` - Show environment information only
- `--project` - Show project information only
- `--json` - Output information in JSON format

## Utilities

### ProjectTemplateManager

Manages project templates and creation.

```typescript
class ProjectTemplateManager {
  // Create project from template
  async createProject(options: ProjectOptions, targetPath: string): Promise<void>
  
  // Check if template exists
  hasTemplate(name: string): boolean
  
  // Get available templates
  getAvailableTemplates(): string[]
  
  // Get template information
  getTemplate(name: string): ProjectTemplate | undefined
}
```

### PackageManagerDetector

Detects and manages package managers.

```typescript
class PackageManagerDetector {
  // Detect package manager from project directory
  async detect(projectPath: string): Promise<PackageManager>
  
  // Get recommended package manager
  async getRecommended(projectPath: string): Promise<{
    manager: PackageManager;
    reason: string;
  }>
  
  // Create package manager instance
  create(name: 'npm' | 'yarn' | 'pnpm'): PackageManager
}
```

### GitOperations

Git repository operations.

```typescript
class GitOperations implements IGitOperations {
  // Initialize Git repository
  async init(cwd: string): Promise<void>
  
  // Add files to staging
  async add(cwd: string, files: string[]): Promise<void>
  
  // Commit changes
  async commit(cwd: string, message: string): Promise<void>
  
  // Check if directory is Git repository
  isRepository(cwd: string): boolean
  
  // Get Git configuration
  async getConfig(key: string): Promise<string | undefined>
  
  // Get current branch
  async getCurrentBranch(cwd: string): Promise<string>
  
  // Get repository status
  async getStatus(cwd: string): Promise<{
    staged: string[];
    unstaged: string[];
    untracked: string[];
  }>
}
```

## Types

### Core Interfaces

```typescript
interface CLICommand {
  readonly name: string
  readonly description: string
  readonly aliases?: string[]
  readonly options?: CLIOption[]
  readonly arguments?: CLIArgument[]
  readonly examples?: string[]
  execute(args: CLICommandArgs): Promise<void>
}

interface CLIConfig {
  readonly name: string
  readonly version: string
  readonly description: string
  readonly commands: CLICommand[]
  readonly globalOptions?: CLIOption[]
}

interface CLIContext {
  readonly cwd: string
  readonly config: CLIConfig
  readonly logger: CLILogger
  readonly spinner: CLISpinner
}

interface ProjectOptions {
  readonly name: string
  readonly template: string
  readonly directory?: string
  readonly description?: string
  readonly author?: string
  readonly license?: string
  readonly git?: boolean
  readonly install?: boolean
  readonly typescript?: boolean
  readonly eslint?: boolean
  readonly prettier?: boolean
}
```

### Error Classes

```typescript
class CLIError extends Error {
  constructor(message: string, code?: string, exitCode?: number)
}

class CommandNotFoundError extends CLIError
class InvalidArgumentError extends CLIError
class ProjectCreationError extends CLIError
class TemplateNotFoundError extends CLIError
```

## Usage Examples

### Creating a Custom Command

```typescript
import { BaseCommand, CLICommandArgs } from '@mplp/cli';

class MyCommand extends BaseCommand {
  public readonly name = 'my-command';
  public readonly description = 'My custom command';
  
  public async execute(args: CLICommandArgs): Promise<void> {
    this.startSpinner('Processing...');
    
    try {
      // Command logic here
      this.succeedSpinner('Command completed successfully!');
    } catch (error) {
      this.failSpinner('Command failed');
      throw error;
    }
  }
}
```

### Using the CLI Programmatically

```typescript
import { CLIApplication, CLIConfig } from '@mplp/cli';

const config: CLIConfig = {
  name: 'my-cli',
  version: '1.0.0',
  description: 'My custom CLI',
  commands: [new MyCommand()]
};

const app = new CLIApplication(config);
await app.run();
```
