import { OmniLog } from "@omnilog/core";
import { ConsoleTransport } from "@omnilog/transport-console";
import { FileTransport } from "@omnilog/transport-file";
import { join } from "path";

async function main() {
  OmniLog.configure({
    level: "info",
    env: "development",
    asyncMode: "await",
    transports: [
      new ConsoleTransport({
        useNativeConsoleMethods: true,
      }),
      new FileTransport({
        filePath: join(process.cwd(), "logs", "app.log"),
        rotateAfterBytes: 1_000_000, // 1MB for demo
        maxFiles: 5,
      }),
    ],
    buffering: {
      enabled: false,
    },
  });

  await OmniLog.info("Application started with file transport");

  const logger = OmniLog.getLogger("file-demo");

  for (let i = 0; i < 10; i++) {
    await logger.info(`Log entry ${i}`, {
      meta: { iteration: i, timestamp: Date.now() },
    });
  }

  await logger.warn("This is a warning message");
  await logger.error("This is an error message", {
    error: {
      name: "ExampleError",
      message: "Something went wrong",
      stack: "Error: Something went wrong\n    at main()",
    },
  });

  await OmniLog.info("File transport demo completed");
}

main().catch((error) => {
  console.error("[Demo] Unhandled error", error);
  process.exit(1);
});
