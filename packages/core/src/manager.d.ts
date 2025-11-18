import { Logger } from "./logger";
import { LoggerConfig } from "./types";
export declare function configureOmniLog(config: LoggerConfig): void;
export declare function getLogger(name?: string): Logger;
export declare const OmniLog: {
    configure: typeof configureOmniLog;
    getLogger: typeof getLogger;
    debug: (message: string, metadata?: Parameters<Logger["debug"]>[1]) => Promise<void>;
    info: (message: string, metadata?: Parameters<Logger["info"]>[1]) => Promise<void>;
    warn: (message: string, metadata?: Parameters<Logger["warn"]>[1]) => Promise<void>;
    error: (message: string, metadata?: Parameters<Logger["error"]>[1]) => Promise<void>;
};
