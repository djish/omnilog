# OmniLog

> Reusable, cross-platform, pluggable logging framework for Node.js, browsers, and modern front-end frameworks.

![status](https://img.shields.io/badge/status-alpha-orange)
![build](https://img.shields.io/badge/build-npm%20workspaces-blue)
![license](https://img.shields.io/badge/license-MIT-green)

## Table of Contents

- [Why OmniLog?](#why-omnilog)
- [Features](#features)
- [Packages](#packages)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Transports](#transports)
- [Framework Integrations](#framework-integrations)
- [Buffering & Offline Support](#buffering--offline-support)
- [Examples](#examples)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Why OmniLog?

OmniLog gives teams a single logging API that works everywhere: Node.js, React, Angular, Express clients. It uses the same LogEntry schema everywhere so you can pipe logs into any transport and post-process them consistently.

## Features

- **Pluggable transports** â€“ console, file (with rotation), custom transports
- **Named logger registry** â€“ `OmniLog.getLogger("auth")`
- **Async modes** â€“ `sync`, `await`, `background`
- **Per-logger overrides** â€“ different log levels per namespace
- **Buffering** â€“ memory/localStorage stores with flush intervals
- **Framework addons** â€“ React hooks/context, Angular service & interceptor
- **Structured schema** â€“ consistent log payloads across languages/environments

## Packages

| Package | Description |
| --- | --- |
| `@omnilog/core` | Core logger, types, buffering, registry |
| `@omnilog/transport-console` | Console transport (Node + browser) |
| `@omnilog/transport-file` | File transport with rotation (Node only) |
| `@omnilog/react` | React `LoggerProvider` and `useLogger` hook |
| `@omnilog/angular` | Angular logger service + HTTP interceptor |

## Installation

```bash
npm install @omnilog/core
npm install @omnilog/transport-console    # console output
npm install @omnilog/transport-file       # file rotation (Node)
npm install @omnilog/react                # React integration
npm install @omnilog/angular              # Angular integration
```

## Quick Start

```ts
import { OmniLog } from "@omnilog/core";
import { ConsoleTransport } from "@omnilog/transport-console";

OmniLog.configure({
  level: "info",
  env: process.env.NODE_ENV,
  asyncMode: "background",
  transports: [
    new ConsoleTransport({ useNativeConsoleMethods: true }),
  ],
  overrides: {
    auth: "debug",
  },
});

// Root logger short-hands
OmniLog.info("Server booting");

// Named logger
const authLogger = OmniLog.getLogger("auth");
authLogger.debug("Login attempt", { meta: { userId: 42 } });
```

### Async Modes

```ts
OmniLog.configure({
  asyncMode: "await", // "sync" | "await" | "background"
  transports: [new ConsoleTransport()],
});

await OmniLog.info("This waits for transports to finish");
```

### Per-Logger Overrides

```ts
OmniLog.configure({
  level: "info",
  overrides: {
    auth: "debug",
    payments: "warn",
  },
  transports: [new ConsoleTransport()],
});
```

## Configuration

```ts
import { InMemoryBufferStore } from "@omnilog/core";

OmniLog.configure({
  level: "info",
  env: "production",
  asyncMode: "background",
  transports: [new ConsoleTransport()],
  overrides: {
    api: "debug",
  },
  buffering: {
    enabled: true,
    maxBufferSize: 100,
    flushIntervalMs: 2000,
    store: new InMemoryBufferStore(),
  },
  onError(error, entry, transportName) {
    console.error("[OmniLog] transport error", transportName, error, entry);
  },
});
```

## Transports

### Console Transport

```ts
import { ConsoleTransport } from "@omnilog/transport-console";

new ConsoleTransport({
  useNativeConsoleMethods: true,
  prettyPrint: false,
  formatter(entry) {
    return `${entry.level.toUpperCase()} :: ${entry.message}`;
  },
});
```

### File Transport (Node)

```ts
import { FileTransport } from "@omnilog/transport-file";
import { join } from "path";

new FileTransport({
  filePath: join(process.cwd(), "logs", "app.log"),
  rotateAfterBytes: 5_000_000, // default 5MB
  maxFiles: 5,
  encoding: "utf8",
});
```

**Rotation** â€“ `app.log` rolls to `app.log.1`, `app.log.2`, â€¦ up to `maxFiles`.

### Custom Transport

```ts
import { LogTransport, LogEntry } from "@omnilog/core";

class HttpTransport implements LogTransport {
  async log(entry: LogEntry): Promise<void> {
    await fetch("https://logging.service/bulk", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entry),
    });
  }
}
```

Use multiple transports at the same time:

```ts
OmniLog.configure({
  transports: [
    new ConsoleTransport(),
    new FileTransport({ filePath: "logs/app.log" }),
    new HttpTransport(),
  ],
});
```

## Framework Integrations

### React

```tsx
import { LoggerProvider, useLogger } from "@omnilog/react";

const App = () => (
  <LoggerProvider loggerName="ui">
    <HomePage />
  </LoggerProvider>
);

const HomePage = () => {
  const logger = useLogger("home-page");
  useEffect(() => {
    logger.info("Home page mounted");
  }, [logger]);
  return <button onClick={() => logger.debug("Clicked")}>Click</button>;
};
```

### Angular

```ts
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
    { provide: OMNILOG_ANGULAR_CONFIG, useValue: { defaultLoggerName: "ng-ui" } },
    { provide: HTTP_INTERCEPTORS, useClass: LoggerHttpInterceptor, multi: true },
  ],
})
export class AppModule {}
```

Use `LoggerService` inside components/services:

```ts
constructor(private readonly logger: LoggerService) {}

ngOnInit() {
  this.logger.info("Component ready");
}
```

## Buffering & Offline Support

```ts
import { InMemoryBufferStore } from "@omnilog/core";

OmniLog.configure({
  buffering: {
    enabled: true,
    maxBufferSize: 100,
    flushIntervalMs: 2000,
    store: new InMemoryBufferStore(),
  },
  transports: [new ConsoleTransport()],
});
```

**Stores**
- `InMemoryBufferStore` â€“ default, works everywhere
- `LocalStorageBufferStore` â€“ browser-only persistence (future)

## Examples

The `examples/` folder contains ready-to-run demos:

- `examples/node-basic.ts` â€“ core + console
- `examples/node-file.ts` â€“ file transport with rotation
- `examples/react-basic.tsx` â€“ React provider & hook
- `examples/angular-usage.md` â€“ Angular module wiring

Run Node examples with [tsx](https://github.com/esbuild-kit/tsx) or ts-node:

```bash
npx tsx examples/node-file.ts
```

## Development

```bash
# Install all dependencies
npm install

# Build everything
npm run build

# Build individual workspace packages
npm run build:core
npm run build:console
npm run build:file
npm run build:react
npm run build:angular
```

The monorepo uses npm workspaces (no lerna). All TypeScript configs extend `tsconfig.base.json`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on branching, code style, transports, and integrations.

## License

MIT Â© 2025 OmniLog contributors
