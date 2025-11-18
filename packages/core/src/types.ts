export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ErrorInfo {
  name?: string;
  message?: string;
  stack?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  loggerName: string;
  tags?: string[];
  context?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  error?: ErrorInfo;
  env?: string;
  correlationId?: string;
}

export interface LogMetadata {
  tags?: string[];
  context?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  error?: ErrorInfo;
  env?: string;
  correlationId?: string;
}

export interface LogTransport {
  log(entry: LogEntry): void | Promise<void>;
}

export interface BufferStore {
  load(): Promise<LogEntry[]>;
  save(entries: LogEntry[]): Promise<void>;
  clear(): Promise<void>;
}

export class InMemoryBufferStore implements BufferStore {
  private buffer: LogEntry[] = [];

  async load(): Promise<LogEntry[]> {
    return [...this.buffer];
  }

  async save(entries: LogEntry[]): Promise<void> {
    this.buffer = [...entries];
  }

  async clear(): Promise<void> {
    this.buffer = [];
  }
}

export interface BufferingOptions {
  enabled: boolean;
  maxBufferSize?: number;
  flushIntervalMs?: number;
  store?: BufferStore;
}

export type AsyncMode = "sync" | "await" | "background";

export type LoggerOverrides = Record<string, LogLevel>;

export interface LoggerConfig {
  level: LogLevel;
  asyncMode?: AsyncMode;
  env?: string;
  transports: LogTransport[];
  buffering?: BufferingOptions;
  overrides?: LoggerOverrides;
  onError?: (error: unknown, entry?: LogEntry, transportName?: string) => void;
}
