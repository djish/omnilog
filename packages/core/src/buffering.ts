import { BufferingOptions, BufferStore, InMemoryBufferStore, LogEntry } from "./types";

export type FlushHandler = (entries: LogEntry[]) => Promise<void> | void;

const DEFAULT_MAX_BUFFER_SIZE = 100;
const DEFAULT_FLUSH_INTERVAL_MS = 2000;

export class BufferController {
  private readonly store: BufferStore;
  private readonly maxBufferSize: number;
  private readonly flushIntervalMs?: number;
  private buffer: LogEntry[] = [];
  private ready = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private flushPromise: Promise<void> | null = null;

  constructor(private readonly options: BufferingOptions, private readonly flushHandler: FlushHandler) {
    this.store = options.store ?? new InMemoryBufferStore();
    this.maxBufferSize = options.maxBufferSize ?? DEFAULT_MAX_BUFFER_SIZE;
    this.flushIntervalMs = options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS;

    if (this.flushIntervalMs && this.flushIntervalMs > 0) {
      this.timer = setInterval(() => {
        void this.flush();
      }, this.flushIntervalMs);
    }
  }

  async enqueue(entry: LogEntry): Promise<void> {
    await this.ensureReady();
    this.buffer.push(entry);
    await this.store.save(this.buffer);

    if (this.buffer.length >= this.maxBufferSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.flushPromise) {
      return this.flushPromise;
    }

    this.flushPromise = this.performFlush().finally(() => {
      this.flushPromise = null;
    });

    return this.flushPromise;
  }

  dispose(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    void this.flush();
  }

  private async performFlush(): Promise<void> {
    await this.ensureReady();

    if (!this.buffer.length) {
      return;
    }

    const entries = [...this.buffer];
    this.buffer = [];
    await this.store.clear();
    await Promise.resolve(this.flushHandler(entries));
  }

  private async ensureReady(): Promise<void> {
    if (this.ready) {
      return;
    }
    this.buffer = await this.store.load();
    this.ready = true;
  }
}
