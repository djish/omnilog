import { LogEntry, LogTransport } from "@omnilog/core";

export interface ConsoleTransportOptions {
  useNativeConsoleMethods?: boolean;
  prettyPrint?: boolean;
  formatter?: (entry: LogEntry) => unknown;
}

export class ConsoleTransport implements LogTransport {
  private readonly useNativeConsoleMethods: boolean;
  private readonly prettyPrint: boolean;
  private readonly formatter?: (entry: LogEntry) => unknown;

  constructor(options: ConsoleTransportOptions = {}) {
    this.useNativeConsoleMethods = options.useNativeConsoleMethods ?? true;
    this.prettyPrint = options.prettyPrint ?? false;
    this.formatter = options.formatter;
  }

  log(entry: LogEntry): void {
    const linePrefix = this.buildLinePrefix(entry);
    const payload = this.buildPayload(entry);

    if (this.useNativeConsoleMethods) {
      this.logWithNativeMethod(entry.level, linePrefix, payload);
    } else {
      // eslint-disable-next-line no-console
      console.log(linePrefix, payload);
    }
  }

  private buildLinePrefix(entry: LogEntry): string {
    const timestamp = entry.timestamp ?? new Date().toISOString();
    return `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.loggerName}]`;
  }

  private buildPayload(entry: LogEntry): unknown {
    if (this.formatter) {
      return this.formatter(entry);
    }

    if (this.prettyPrint) {
      return entry;
    }

    return {
      message: entry.message,
      context: entry.context,
      meta: entry.meta,
      error: entry.error,
      tags: entry.tags,
      env: entry.env,
      correlationId: entry.correlationId,
    };
  }

  private logWithNativeMethod(level: LogEntry["level"], prefix: string, payload: unknown): void {
    switch (level) {
      case "debug":
        // eslint-disable-next-line no-console
        console.debug(prefix, payload);
        break;
      case "info":
        // eslint-disable-next-line no-console
        console.info(prefix, payload);
        break;
      case "warn":
        // eslint-disable-next-line no-console
        console.warn(prefix, payload);
        break;
      case "error":
        // eslint-disable-next-line no-console
        console.error(prefix, payload);
        break;
      default:
        // eslint-disable-next-line no-console
        console.log(prefix, payload);
    }
  }
}
