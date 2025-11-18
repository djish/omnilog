import { promises as fs } from "fs";
import { dirname, join } from "path";
import { LogEntry, LogTransport } from "@omnilog/core";

export interface FileTransportOptions {
  filePath: string;
  rotateAfterBytes?: number;
  maxFiles?: number;
  encoding?: BufferEncoding;
}

const DEFAULT_ROTATE_AFTER_BYTES = 5_000_000; // 5MB
const DEFAULT_MAX_FILES = 5;
const DEFAULT_ENCODING: BufferEncoding = "utf8";

export class FileTransport implements LogTransport {
  private readonly filePath: string;
  private readonly rotateAfterBytes: number;
  private readonly maxFiles: number;
  private readonly encoding: BufferEncoding;
  private writePromise: Promise<void> = Promise.resolve();

  constructor(options: FileTransportOptions) {
    if (!options.filePath) {
      throw new Error("[FileTransport] filePath is required");
    }

    this.filePath = options.filePath;
    this.rotateAfterBytes = options.rotateAfterBytes ?? DEFAULT_ROTATE_AFTER_BYTES;
    this.maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
    this.encoding = options.encoding ?? DEFAULT_ENCODING;
  }

  async log(entry: LogEntry): Promise<void> {
    const logLine = this.formatEntry(entry) + "\n";
    const logBytes = Buffer.byteLength(logLine, this.encoding);

    this.writePromise = this.writePromise.then(async () => {
      await this.ensureDirectory();
      await this.rotateIfNeeded(logBytes);
      await this.appendToFile(logLine);
    });

    await this.writePromise;
  }

  private formatEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp ?? new Date().toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const logger = entry.loggerName;
    const message = entry.message;

    const parts = [`[${timestamp}]`, `[${level}]`, `[${logger}]`, message];

    if (entry.meta || entry.context || entry.error) {
      const extra = JSON.stringify({
        meta: entry.meta,
        context: entry.context,
        error: entry.error,
        tags: entry.tags,
        correlationId: entry.correlationId,
      });
      parts.push(extra);
    }

    return parts.join(" ");
  }

  private async ensureDirectory(): Promise<void> {
    const dir = dirname(this.filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
    }
  }

  private async rotateIfNeeded(additionalBytes: number): Promise<void> {
    try {
      const stats = await fs.stat(this.filePath);
      const currentSize = stats.size;

      if (currentSize + additionalBytes > this.rotateAfterBytes) {
        await this.performRotation();
      }
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") {
        throw error;
      }
    }
  }

  private async performRotation(): Promise<void> {
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const source = this.getRotatedPath(i);
      const target = this.getRotatedPath(i + 1);

      try {
        await fs.rename(source, target);
      } catch (error) {
        const err = error as NodeJS.ErrnoException;
        if (err.code !== "ENOENT") {
          throw error;
        }
      }
    }

    const firstRotated = this.getRotatedPath(1);
    try {
      await fs.rename(this.filePath, firstRotated);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") {
        throw error;
      }
    }
  }

  private getRotatedPath(index: number): string {
    return `${this.filePath}.${index}`;
  }

  private async appendToFile(content: string): Promise<void> {
    await fs.appendFile(this.filePath, content, this.encoding);
  }
}
