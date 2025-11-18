import { Inject, Injectable, Optional } from "@angular/core";
import { Logger, getLogger } from "@omnilog/core";
import { AngularLoggerConfig, OMNILOG_ANGULAR_CONFIG } from "./tokens";

@Injectable({ providedIn: "root" })
export class LoggerService {
  private readonly defaultLoggerName: string;

  constructor(
    @Optional()
    @Inject(OMNILOG_ANGULAR_CONFIG)
    config?: AngularLoggerConfig
  ) {
    this.defaultLoggerName = config?.defaultLoggerName ?? "ng";
  }

  getLogger(name?: string): Logger {
    return getLogger(name ?? this.defaultLoggerName);
  }

  debug(message: string, meta?: Parameters<Logger["debug"]>[1]): void {
    void this.getLogger().debug(message, meta);
  }

  info(message: string, meta?: Parameters<Logger["info"]>[1]): void {
    void this.getLogger().info(message, meta);
  }

  warn(message: string, meta?: Parameters<Logger["warn"]>[1]): void {
    void this.getLogger().warn(message, meta);
  }

  error(message: string, meta?: Parameters<Logger["error"]>[1]): void {
    void this.getLogger().error(message, meta);
  }
}
