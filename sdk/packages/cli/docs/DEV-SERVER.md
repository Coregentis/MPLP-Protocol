# MPLP Development Server

The MPLP CLI includes a powerful development server that provides a modern development experience with hot reload, real-time logging, performance monitoring, and debugging tools.

## Overview

The development server is designed to accelerate your MPLP development workflow by providing:

- **Local Development Environment**: HTTP server with static file serving
- **Hot Reload**: Automatic browser refresh when files change
- **Real-time Logging**: Live log streaming with color-coded output
- **Performance Monitoring**: Memory, CPU, and build time metrics
- **Debug Tools Integration**: Built-in debugging support
- **Build Management**: Automatic TypeScript/JavaScript compilation
- **File Watching**: Intelligent file monitoring with glob patterns

## Quick Start

### Basic Usage

```bash
# Start development server on default port (3000)
mplp dev

# Start on custom port
mplp dev --port 8080

# Start on all interfaces
mplp dev --host 0.0.0.0

# Start without opening browser
mplp dev --no-open
```

### Advanced Usage

```bash
# Disable hot reload
mplp dev --no-hot-reload

# Disable real-time logs
mplp dev --no-logs

# Enable verbose logging
mplp dev --verbose

# Use custom configuration
mplp dev --config ./dev.config.js

# Run in production mode
mplp dev --env production
```

## Command Reference

### Basic Syntax

```bash
mplp dev [options]
mplp serve [options]        # Alias
mplp start [options]        # Alias
```

### Options

#### Server Options

- `-p, --port <port>`: Port to run the server on (default: 3000)
- `-h, --host <host>`: Host to bind the server to (default: localhost)
- `--no-open`: Do not open browser automatically

#### Feature Toggles

- `--no-hot-reload`: Disable hot reload functionality
- `--no-logs`: Disable real-time log viewing
- `--no-debug`: Disable debug tools integration
- `--no-metrics`: Disable performance monitoring

#### Configuration Options

- `--config <config>`: Path to custom development server configuration
- `--env <env>`: Environment to run in (default: development)

#### Output Options

- `--verbose`: Enable verbose logging
- `--quiet`: Suppress non-essential output

## Configuration

### Project Configuration

The development server looks for configuration files in the following order:

1. `mplp.dev.config.js`
2. `mplp.dev.config.json`
3. `.mplprc.js`
4. `.mplprc.json`

### Configuration File Example

```javascript
// mplp.dev.config.js
module.exports = {
  port: 3000,
  host: 'localhost',
  openBrowser: true,
  hotReload: true,
  enableLogs: true,
  enableDebug: true,
  enableMetrics: true,
  
  // Custom watch patterns
  watchPatterns: [
    'src/**/*.ts',
    'src/**/*.js',
    'src/**/*.json',
    'config/**/*.json'
  ],
  
  // Ignore patterns
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    '**/*.test.ts',
    'coverage/**'
  ],
  
  // Custom middleware
  middleware: [
    // Add custom Express middleware here
  ],
  
  // Custom routes
  routes: {
    '/api/custom': (req, res) => {
      res.json({ message: 'Custom API endpoint' });
    }
  }
};
```

### Environment Variables

The development server respects the following environment variables:

- `PORT`: Default port (overridden by --port)
- `HOST`: Default host (overridden by --host)
- `NODE_ENV`: Environment mode
- `DEBUG`: Enable debug output
- `VERBOSE`: Enable verbose logging
- `QUIET`: Suppress output

## Features

### Hot Reload

The hot reload system automatically refreshes your browser when files change:

- **File Watching**: Monitors source files using configurable glob patterns
- **Smart Refresh**: Only reloads when necessary files change
- **WebSocket Communication**: Real-time communication with browser
- **Debounced Updates**: Prevents excessive reloads during rapid changes

### Real-time Logging

The logging system provides comprehensive development feedback:

- **Color-coded Output**: Different colors for different log levels
- **Source Identification**: Shows which component generated each log
- **Live Streaming**: Logs appear in real-time in the browser
- **Filtering**: Filter logs by level, source, or time range

### Performance Monitoring

Built-in performance monitoring tracks:

- **Server Uptime**: How long the server has been running
- **Request Count**: Number of HTTP requests served
- **Error Count**: Number of errors encountered
- **Build Time**: Time taken for each build
- **Memory Usage**: Current memory consumption
- **CPU Usage**: Current CPU utilization

### Build Management

Automatic build system supports:

- **TypeScript**: Automatic compilation with error reporting
- **JavaScript**: File copying and processing
- **Static Assets**: Copying from public directory
- **Error Handling**: Detailed error messages with file locations
- **Incremental Builds**: Only rebuild changed files

### File Watching

Intelligent file monitoring features:

- **Glob Patterns**: Support for complex file patterns
- **Ignore Patterns**: Exclude files from watching
- **Recursive Watching**: Monitor entire directory trees
- **Debouncing**: Prevent excessive events from rapid changes
- **Cross-platform**: Works on Windows, macOS, and Linux

## Development Dashboard

The development server includes a built-in dashboard accessible at the server root:

### Dashboard Features

- **Server Status**: Current server state and configuration
- **Real-time Metrics**: Live performance statistics
- **Connected Clients**: Number of active WebSocket connections
- **Build Status**: Latest build results and errors
- **Auto-refresh**: Dashboard updates automatically every 5 seconds

### API Endpoints

The server exposes several API endpoints:

- `GET /api/status`: Server status and metrics
- `POST /api/build`: Trigger manual build
- `GET /ws`: WebSocket endpoint for real-time updates

## Interactive Commands

While the development server is running, you can use these keyboard shortcuts:

- **Ctrl+C**: Stop the development server
- **r + Enter**: Restart the server
- **o + Enter**: Open in browser
- **h + Enter**: Show help

## Troubleshooting

### Common Issues

**"Port already in use"**
- Change the port: `mplp dev --port 8080`
- Kill the process using the port
- Check for other development servers

**"Not in a project directory"**
- Ensure you're in the root of an MPLP project
- Check that `package.json` exists
- Verify MPLP dependencies are installed

**"Build failed"**
- Check TypeScript compilation errors
- Verify all dependencies are installed
- Check file permissions

**Hot reload not working**
- Ensure WebSocket connection is established
- Check browser console for errors
- Verify file watching is working

### Debug Mode

Enable debug mode for detailed troubleshooting:

```bash
mplp dev --verbose --debug
```

This will show:
- Detailed file watching events
- Build process information
- WebSocket connection status
- Performance metrics

### Log Files

Development server logs are available:
- Console output (real-time)
- Browser developer tools (WebSocket messages)
- Custom log files (if configured)

## Best Practices

### Project Structure

Organize your project for optimal development server performance:

```
my-mplp-project/
├── src/                    # Source files (watched)
│   ├── agents/
│   ├── workflows/
│   └── config/
├── public/                 # Static assets
│   ├── index.html
│   └── assets/
├── dist/                   # Build output (ignored)
├── node_modules/           # Dependencies (ignored)
├── package.json
└── mplp.dev.config.js     # Dev server config
```

### Performance Tips

1. **Optimize Watch Patterns**: Only watch necessary files
2. **Use Ignore Patterns**: Exclude large directories like `node_modules`
3. **Enable Caching**: Use build caching for faster rebuilds
4. **Limit Concurrent Builds**: Avoid triggering multiple builds simultaneously

### Development Workflow

1. Start the development server: `mplp dev`
2. Open your browser to the provided URL
3. Make changes to your source files
4. Watch for automatic reloads and build feedback
5. Use the dashboard to monitor performance
6. Check logs for any issues

## Integration

### CI/CD Integration

The development server can be used in CI/CD pipelines:

```bash
# Start server in background for testing
mplp dev --no-open --quiet &
DEV_SERVER_PID=$!

# Run tests against development server
npm test

# Stop development server
kill $DEV_SERVER_PID
```

### Docker Integration

Run the development server in Docker:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npx", "mplp", "dev", "--host", "0.0.0.0"]
```

### IDE Integration

Most IDEs work seamlessly with the development server:
- **VS Code**: Use the integrated terminal
- **WebStorm**: Configure as a Node.js run configuration
- **Vim/Neovim**: Use terminal integration

## Examples

See [EXAMPLES.md](./EXAMPLES.md) for comprehensive usage examples and common development patterns.
