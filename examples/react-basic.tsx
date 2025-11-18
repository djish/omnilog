import React, { useEffect } from "react";
import { OmniLog } from "@omnilog/core";
import { ConsoleTransport } from "@omnilog/transport-console";
import { LoggerProvider, useLogger } from "@omnilog/react";

OmniLog.configure({
  level: "info",
  env: "development",
  asyncMode: "background",
  transports: [
    new ConsoleTransport({
      useNativeConsoleMethods: true,
      prettyPrint: false,
    }),
  ],
  buffering: {
    enabled: false,
  },
});

const HomePage: React.FC = () => {
  const logger = useLogger("home-page");

  useEffect(() => {
    logger.info("Home page mounted", {
      meta: { path: "/home" },
    });
  }, [logger]);

  const handleClick = () => {
    logger.debug("Button clicked", {
      meta: { action: "button-click" },
    });
  };

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LoggerProvider loggerName="ui">
      <HomePage />
    </LoggerProvider>
  );
};

export default App;
