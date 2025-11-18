import { BufferingOptions, LogEntry } from "./types";
export type FlushHandler = (entries: LogEntry[]) => Promise<void> | void;
export declare class BufferController {
    private readonly options;
    private readonly flushHandler;
    private readonly store;
    private readonly maxBufferSize;
    private readonly flushIntervalMs?;
    private buffer;
    private ready;
    private timer;
    private flushPromise;
    constructor(options: BufferingOptions, flushHandler: FlushHandler);
    enqueue(entry: LogEntry): Promise<void>;
    flush(): Promise<void>;
    dispose(): void;
    private performFlush;
    private ensureReady;
}
