import { LoggerConfig, LogMetadata } from "./types";
export declare class Logger {
    private readonly name;
    private readonly config;
    private readonly bufferController;
    constructor(name: string, config: LoggerConfig);
    debug(message: string, metadata?: LogMetadata): Promise<void>;
    info(message: string, metadata?: LogMetadata): Promise<void>;
    warn(message: string, metadata?: LogMetadata): Promise<void>;
    error(message: string, metadata?: LogMetadata): Promise<void>;
    private logInternal;
    private shouldLog;
    private createEntry;
}
export declare function teardownBufferingForConfig(config: LoggerConfig | null): void;
