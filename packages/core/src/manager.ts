import { Logger, teardownBufferingForConfig } from "./logger";
import { LoggerConfig } from "./types";

let globalConfig: LoggerConfig | null = null;
const loggers = new Map<string, Logger>();

export function configureOmniLog(config: LoggerConfig): void {
  if (!config.transports || config.transports.length === 0) {
    throw new Error("[OmniLog] configureOmniLog requires at least one transport");
  }

  teardownBufferingForConfig(globalConfig);
  globalConfig = config;
  loggers.clear();
}

export function getLogger(name: string = "root"): Logger {
  if (!globalConfig) {
    throw new Error("[OmniLog] configureOmniLog must be called before getLogger");
  }

  if (!loggers.has(name)) {
    loggers.set(name, new Logger(name, globalConfig));
  }

  const logger = loggers.get(name);
  if (!logger) {
    throw new Error(`[OmniLog] Failed to create logger for name ${name}`);
  }

  return logger;
}

export const OmniLog = {
  configure: configureOmniLog,
  getLogger,
  debug: (message: string, metadata?: Parameters<Logger["debug"]>[1]) =>
    getLogger("root").debug(message, metadata),
  info: (message: string, metadata?: Parameters<Logger["info"]>[1]) =>
    getLogger("root").info(message, metadata),
  warn: (message: string, metadata?: Parameters<Logger["warn"]>[1]) =>
    getLogger("root").warn(message, metadata),
  error: (message: string, metadata?: Parameters<Logger["error"]>[1]) =>
    getLogger("root").error(message, metadata),
};
