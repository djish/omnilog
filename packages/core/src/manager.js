import { Logger, teardownBufferingForConfig } from "./logger";
let globalConfig = null;
const loggers = new Map();
export function configureOmniLog(config) {
    if (!config.transports || config.transports.length === 0) {
        throw new Error("[OmniLog] configureOmniLog requires at least one transport");
    }
    teardownBufferingForConfig(globalConfig);
    globalConfig = config;
    loggers.clear();
}
export function getLogger(name = "root") {
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
    debug: (message, metadata) => getLogger("root").debug(message, metadata),
    info: (message, metadata) => getLogger("root").info(message, metadata),
    warn: (message, metadata) => getLogger("root").warn(message, metadata),
    error: (message, metadata) => getLogger("root").error(message, metadata),
};
//# sourceMappingURL=manager.js.map