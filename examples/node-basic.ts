import { OmniLog } from "@omnilog/core";
import { ConsoleTransport } from "@omnilog/transport-console";

async function main() {
  OmniLog.configure({
    level: "info",
    env: "development",
    asyncMode: "background",
    overrides: {
      auth: "debug",
    },
    transports: [
      new ConsoleTransport({
        useNativeConsoleMethods: true,
        prettyPrint: false,
      }),
    ],
    buffering: {
      enabled: false,
    },
    onError(error, entry, transportName) {
      console.error("[Demo] Transport error", transportName, error, entry);
    },
  });

  await OmniLog.info("Root logger ready");

  const authLogger = OmniLog.getLogger("auth");
  await authLogger.debug("Debug message visible because of override", {
    meta: { userId: 123 },
  });

  await authLogger.error("Error message", {
    error: {
      name: "ExampleError",
      message: "Something went wrong",
    },
  });

  const backgroundLogger = OmniLog.getLogger("background");
  backgroundLogger.info("This fires in background async mode");
}

main().catch((error) => {
  console.error("[Demo] Unhandled error", error);
});
