import { BufferController } from "./buffering";
import {
  LogEntry,
  LogLevel,
  LoggerConfig,
  LogMetadata,
} from "./types";
import { generateLogId } from "./utils/id";

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const bufferControllers = new WeakMap<LoggerConfig, BufferController>();

export class Logger {
  private readonly bufferController: BufferController | null;

  constructor(private readonly name: string, private readonly config: LoggerConfig) {
    this.bufferController = getOrCreateBufferController(config);
  }

  debug(message: string, metadata?: LogMetadata): Promise<void> {
    return this.logInternal("debug", message, metadata);
  }

  info(message: string, metadata?: LogMetadata): Promise<void> {
    return this.logInternal("info", message, metadata);
  }

  warn(message: string, metadata?: LogMetadata): Promise<void> {
    return this.logInternal("warn", message, metadata);
  }

  error(message: string, metadata?: LogMetadata): Promise<void> {
    return this.logInternal("error", message, metadata);
  }

  private async logInternal(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata
  ): Promise<void> {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.createEntry(level, message, metadata);

    if (this.bufferController) {
      await this.bufferController.enqueue(entry);
      return;
    }

    await dispatchWithMode(this.config, entry);
  }

  private shouldLog(level: LogLevel): boolean {
    const overrideLevel = this.config.overrides?.[this.name] ?? this.config.level;
    return levelPriority[level] >= levelPriority[overrideLevel];
  }

  private createEntry(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata
  ): LogEntry {
    return {
      id: generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      loggerName: this.name,
      env: metadata?.env ?? this.config.env,
      tags: metadata?.tags,
      context: metadata?.context,
      meta: metadata?.meta,
      error: metadata?.error,
      correlationId: metadata?.correlationId,
    };
  }
}

function getOrCreateBufferController(config: LoggerConfig): BufferController | null {
  if (!config.buffering?.enabled) {
    return null;
  }

  let controller = bufferControllers.get(config);
  if (!controller) {
    controller = new BufferController(config.buffering, async (entries) => {
      for (const entry of entries) {
        await dispatchEntry(config, entry);
      }
    });
    bufferControllers.set(config, controller);
  }
  return controller;
}

async function dispatchWithMode(config: LoggerConfig, entry: LogEntry): Promise<void> {
  const asyncMode = config.asyncMode ?? "background";
  const performDispatch = () => dispatchEntry(config, entry);

  if (asyncMode === "background") {
    void performDispatch();
    return;
  }

  await performDispatch();
}

async function dispatchEntry(config: LoggerConfig, entry: LogEntry): Promise<void> {
  if (!config.transports.length) {
    return;
  }

  for (const transport of config.transports) {
    try {
      await Promise.resolve(transport.log(entry));
    } catch (error) {
      handleTransportError(config, error, entry, transport.constructor?.name ?? "UnknownTransport");
    }
  }
}

function handleTransportError(
  config: LoggerConfig,
  error: unknown,
  entry: LogEntry,
  transportName: string
): void {
  if (config.onError) {
    config.onError(error, entry, transportName);
    return;
  }

  // eslint-disable-next-line no-console
  console.error(`[OmniLog] transport error in ${transportName}`, error);
}

export function teardownBufferingForConfig(config: LoggerConfig | null): void {
  if (!config) {
    return;
  }

  const controller = bufferControllers.get(config);
  if (controller) {
    controller.dispose();
    bufferControllers.delete(config);
  }
}
