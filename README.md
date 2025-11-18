# OmniLog

A reusable, cross-platform, pluggable logging framework designed for Node.js, React, Angular.

## Features

- 🎯 **Pluggable Transports** - Console, File, and custom transports
- 📝 **Named Logger Registry** - Organize logs by module/feature (`getLogger("auth")`)
- ⚡ **Async Modes** - Sync, await, or background (fire-and-forget)
- 💾 **Buffering & Batching** - Offline-friendly with in-memory or localStorage stores
- 🔧 **Global Config with Overrides** - Set defaults, override per-logger
- 🌐 **Cross-Platform** - Works in Node.js and browsers
- ⚛️ **Framework Integrations** - React hooks, Angular services, Express middleware
- 📊 **Structured Logging** - Consistent schema across all transports

## Installation

```bash
npm install @omnilog/core
npm install @omnilog/transport-console    # For console output
npm install @omnilog/transport-file       # For file logging (Node.js only)
npm install @omnilog/react                 # For React integration
npm install @omnilog/angular               # For Angular integration
```

## Quick Start

### Basic Usage (Node.js / Browser)

```typescript
import { OmniLog } from "@omnilog/core";
import { ConsoleTransport } from "@omnilog/transport-console";

// Configure once at app startup
OmniLog.configure({
  level: "info",
  env: "development",
  asyncMode: "background",
  transports: [
    new ConsoleTransport({
      useNativeConsoleMethods: true,
    }),
  ],
});

// Use the root logger
OmniLog.info("Application started");

// Create named loggers
const authLogger = OmniLog.getLogger("auth");
authLogger.debug("Login attempt", { meta: { userId: 123 } });
authLogger.error("Login failed", {
  error: {
    name: "AuthError",
    message: "Invalid credentials",
  },
});
```

## Core Concepts

### Log Levels

OmniLog supports four log levels (in order of severity):

- `debug` - Detailed diagnostic information
- `info` - General informational messages
- `warn` - Warning messages
- `error` - Error messages

### Named Loggers

Create loggers for different parts of your application:

```typescript
const dbLogger = OmniLog.getLogger("database");
const apiLogger = OmniLog.getLogger("api");
const uiLogger = OmniLog.getLogger("ui");
```

### Per-Logger Overrides

Override log levels for specific loggers:

```typescript
OmniLog.configure({
  level: "info", // Default level
  overrides: {
    auth: "debug",    // auth logger shows debug+
    payments: "warn", // payments logger shows warn+
  },
  transports: [new ConsoleTransport()],
});
```

### Async Modes

Control how logging behaves:

- `"sync"` - Blocking, waits for all transports
- `"await"` - Returns a promise you can await
- `"background"` - Fire-and-forget (default)

```typescript
OmniLog.configure({
  asyncMode: "await", // Now you can await
  transports: [new ConsoleTransport()],
});

await OmniLog.info("This waits for completion");
```

## Transports

Transports are pluggable output handlers. You can use multiple transports simultaneously.

### Console Transport

Outputs logs to the console (browser or Node.js):

```typescript
import { ConsoleTransport } from "@omnilog/transport-console";

new ConsoleTransport({
  useNativeConsoleMethods: true, // Use console.debug/info/warn/error
  prettyPrint: false,            // Pretty print full entry object
})
```

**Options:**
- `useNativeConsoleMethods?: boolean` - Map to console.debug/info/warn/error (default: `true`)
- `prettyPrint?: boolean` - Print full entry object (default: `false`)
- `formatter?: (entry: LogEntry) => unknown` - Custom formatter function

### File Transport

Writes logs to files with automatic rotation (Node.js only):

```typescript
import { FileTransport } from "@omnilog/transport-file";
import { join } from "path";

new FileTransport({
  filePath: join(process.cwd(), "logs", "app.log"),
  rotateAfterBytes: 5_000_000, // 5MB (default)
  maxFiles: 5,                 // Keep 5 rotated files (default)
  encoding: "utf8",            // File encoding (default)
})
```

**Features:**
- Automatic directory creation
- Size-based rotation (rolling rename: `app.log` → `app.log.1` → `app.log.2`)
- Sequential writes to prevent corruption
- Configurable rotation threshold and max files

**Options:**
- `filePath: string` - **Required** - Path to log file
- `rotateAfterBytes?: number` - Rotate when file exceeds this size (default: `5_000_000`)
- `maxFiles?: number` - Maximum rotated files to keep (default: `5`)
- `encoding?: BufferEncoding` - File encoding (default: `"utf8"`)

### Custom Transport

Implement the `LogTransport` interface:

```typescript
import { LogEntry, LogTransport } from "@omnilog/core";

class MyCustomTransport implements LogTransport {
  async log(entry: LogEntry): Promise<void> {
    // Send to your logging service
    await fetch("https://api.logs.com/ingest", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  }
}

OmniLog.configure({
  transports: [new MyCustomTransport()],
});
```

### Multiple Transports

Use multiple transports simultaneously:

```typescript
OmniLog.configure({
  transports: [
    new ConsoleTransport(), // Console output
    new FileTransport({ filePath: "logs/app.log" }), // File output
    new MyCustomTransport(), // Custom service
  ],
});
```

## Framework Integrations

### React

Use the `LoggerProvider` and `useLogger` hook:

```typescript
import { LoggerProvider, useLogger } from "@omnilog/react";

function App() {
  return (
    <LoggerProvider loggerName="ui">
      <MyComponent />
    </LoggerProvider>
  );
}

function MyComponent() {
  const logger = useLogger("home-page");

  useEffect(() => {
    logger.info("Component mounted");
  }, [logger]);

  return <div>Hello</div>;
}
```

**API:**
- `<LoggerProvider loggerName?: string>` - Provides a logger to child components
- `useLogger(name?: string)` - Returns a logger (uses context if no name provided)

### Angular

Use the `LoggerService` and optional `LoggerHttpInterceptor`:

```typescript
import { NgModule } from "@angular/core";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import {
  LoggerService,
  LoggerHttpInterceptor,
  OMNILOG_ANGULAR_CONFIG,
} from "@omnilog/angular";

@NgModule({
  providers: [
    LoggerService,
    {
      provide: OMNILOG_ANGULAR_CONFIG,
      useValue: { defaultLoggerName: "ng-ui" },
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggerHttpInterceptor,
      multi: true,
    },
  ],
})
export class AppModule {}
```

**Usage in Components:**

```typescript
import { Component } from "@angular/core";
import { LoggerService } from "@omnilog/angular";

@Component({ /* ... */ })
export class MyComponent {
  constructor(private logger: LoggerService) {}

  ngOnInit() {
    this.logger.info("Component initialized");
  }

  handleClick() {
    this.logger.debug("Button clicked", {
      meta: { action: "click" },
    });
  }
}
```

**API:**
- `LoggerService` - Injectable service with `getLogger(name?)` and convenience methods
- `LoggerHttpInterceptor` - Logs HTTP requests/responses with duration
- `OMNILOG_ANGULAR_CONFIG` - Injection token for configuration

## Configuration

### Full Configuration Options

```typescript
OmniLog.configure({
  // Required
  transports: [new ConsoleTransport()],

  // Logging
  level: "info", // Default log level
  env: "development", // Environment name
  asyncMode: "background", // "sync" | "await" | "background"

  // Per-logger overrides
  overrides: {
    auth: "debug",
    payments: "warn",
  },

  // Buffering (optional)
  buffering: {
    enabled: true,
    maxBufferSize: 100,
    flushIntervalMs: 2000,
    store: new InMemoryBufferStore(), // or LocalStorageBufferStore
  },

  // Error handling
  onError(error, entry, transportName) {
    console.error("Transport error:", transportName, error);
  },
});
```

### Buffering

Buffer logs for offline scenarios or batching:

```typescript
import { InMemoryBufferStore } from "@omnilog/core";

OmniLog.configure({
  buffering: {
    enabled: true,
    maxBufferSize: 100,        // Flush when buffer exceeds this
    flushIntervalMs: 2000,     // Periodic flush interval
    store: new InMemoryBufferStore(), // Storage implementation
  },
  transports: [new ConsoleTransport()],
});
```

**Buffer Stores:**
- `InMemoryBufferStore` - In-memory storage (Node.js & browser)
- `LocalStorageBufferStore` - Browser localStorage (browser only)

## Log Entry Schema

All logs follow a consistent schema:

```typescript
interface LogEntry {
  id: string;                    // Unique log ID
  timestamp: string;              // ISO 8601 timestamp
  level: "debug" | "info" | "warn" | "error";
  message: string;                // Log message
  loggerName: string;             // Logger name
  tags?: string[];                // Optional tags
  context?: Record<string, unknown>; // Contextual data
  meta?: Record<string, unknown>;   // Additional metadata
  error?: {                       // Error information
    name?: string;
    message?: string;
    stack?: string;
  };
  env?: string;                  // Environment name
  correlationId?: string;         // Request correlation ID
}
```

## Examples

### Node.js with File Logging

```typescript
import { OmniLog } from "@omnilog/core";
import { ConsoleTransport } from "@omnilog/transport-console";
import { FileTransport } from "@omnilog/transport-file";
import { join } from "path";

OmniLog.configure({
  level: "info",
  asyncMode: "await",
  transports: [
    new ConsoleTransport(),
    new FileTransport({
      filePath: join(process.cwd(), "logs", "app.log"),
      rotateAfterBytes: 1_000_000, // 1MB
      maxFiles: 5,
    }),
  ],
});

const logger = OmniLog.getLogger("server");
await logger.info("Server started", { meta: { port: 3000 } });
```

### React with Context

```typescript
import { LoggerProvider, useLogger } from "@omnilog/react";

function App() {
  return (
    <LoggerProvider loggerName="app">
      <HomePage />
    </LoggerProvider>
  );
}

function HomePage() {
  const logger = useLogger("home");

  useEffect(() => {
    logger.info("Page loaded");
  }, [logger]);

  return <div>Home</div>;
}
```

### Error Logging

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error("Operation failed", {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    meta: {
      operation: "riskyOperation",
      userId: 123,
    },
  });
}
```

### Structured Logging

```typescript
logger.info("User action", {
  tags: ["user", "action"],
  context: {
    userId: 123,
    sessionId: "abc-123",
  },
  meta: {
    action: "click",
    target: "button",
    timestamp: Date.now(),
  },
  correlationId: "req-456",
});
```

## Package Structure

```
omnilog/
├── packages/
│   ├── core/                    # @omnilog/core
│   ├── transport-console/       # @omnilog/transport-console
│   ├── transport-file/          # @omnilog/transport-file
│   ├── react/                   # @omnilog/react
│   └── angular/                 # @omnilog/angular
└── examples/                    # Usage examples
```

## Development

```bash
# Build all packages
npm run build

# Build specific package
npm run build:core
npm run build:console
npm run build:file
npm run build:react
npm run build:angular
```

## License

MIT

## Contributing

Contributions welcome! Please see the contributing guidelines.

