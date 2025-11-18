import { InMemoryBufferStore } from "./types";
const DEFAULT_MAX_BUFFER_SIZE = 100;
const DEFAULT_FLUSH_INTERVAL_MS = 2000;
export class BufferController {
    constructor(options, flushHandler) {
        this.options = options;
        this.flushHandler = flushHandler;
        this.buffer = [];
        this.ready = false;
        this.timer = null;
        this.flushPromise = null;
        this.store = options.store ?? new InMemoryBufferStore();
        this.maxBufferSize = options.maxBufferSize ?? DEFAULT_MAX_BUFFER_SIZE;
        this.flushIntervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;
        if (this.flushIntervalMs && this.flushIntervalMs > 0) {
            this.timer = setInterval(() => {
                void this.flush();
            }, this.flushIntervalMs);
        }
    }
    async enqueue(entry) {
        await this.ensureReady();
        this.buffer.push(entry);
        await this.store.save(this.buffer);
        if (this.buffer.length >= this.maxBufferSize) {
            await this.flush();
        }
    }
    async flush() {
        if (this.flushPromise) {
            return this.flushPromise;
        }
        this.flushPromise = this.performFlush().finally(() => {
            this.flushPromise = null;
        });
        return this.flushPromise;
    }
    dispose() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        void this.flush();
    }
    async performFlush() {
        await this.ensureReady();
        if (!this.buffer.length) {
            return;
        }
        const entries = [...this.buffer];
        this.buffer = [];
        await this.store.clear();
        await Promise.resolve(this.flushHandler(entries));
    }
    async ensureReady() {
        if (this.ready) {
            return;
        }
        this.buffer = await this.store.load();
        this.ready = true;
    }
}
//# sourceMappingURL=buffering.js.map