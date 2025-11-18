import { BufferController } from "./buffering";
import { generateLogId } from "./utils/id";
const levelPriority = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};
const bufferControllers = new WeakMap();
export class Logger {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.bufferController = getOrCreateBufferController(config);
    }
    debug(message, metadata) {
        return this.logInternal("debug", message, metadata);
    }
    info(message, metadata) {
        return this.logInternal("info", message, metadata);
    }
    warn(message, metadata) {
        return this.logInternal("warn", message, metadata);
    }
    error(message, metadata) {
        return this.logInternal("error", message, metadata);
    }
    async logInternal(level, message, metadata) {
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
    shouldLog(level) {
        const overrideLevel = this.config.overrides?.[this.name] ?? this.config.level;
        return levelPriority[level] >= levelPriority[overrideLevel];
    }
    createEntry(level, message, metadata) {
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
function getOrCreateBufferController(config) {
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
async function dispatchWithMode(config, entry) {
    const asyncMode = config.asyncMode ?? "background";
    const performDispatch = () => dispatchEntry(config, entry);
    if (asyncMode === "background") {
        void performDispatch();
        return;
    }
    await performDispatch();
}
async function dispatchEntry(config, entry) {
    if (!config.transports.length) {
        return;
    }
    for (const transport of config.transports) {
        try {
            await Promise.resolve(transport.log(entry));
        }
        catch (error) {
            handleTransportError(config, error, entry, transport.constructor?.name ?? "UnknownTransport");
        }
    }
}
function handleTransportError(config, error, entry, transportName) {
    if (config.onError) {
        config.onError(error, entry, transportName);
        return;
    }
    // eslint-disable-next-line no-console
    console.error(`[OmniLog] transport error in ${transportName}`, error);
}
export function teardownBufferingForConfig(config) {
    if (!config) {
        return;
    }
    const controller = bufferControllers.get(config);
    if (controller) {
        controller.dispose();
        bufferControllers.delete(config);
    }
}
//# sourceMappingURL=logger.js.map