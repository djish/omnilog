import React, { createContext, useContext, useMemo } from "react";
import { Logger, getLogger } from "@omnilog/core";

const LoggerContext = createContext<Logger | null>(null);

export interface LoggerProviderProps {
  loggerName?: string;
  children: React.ReactNode;
}

export const LoggerProvider: React.FC<LoggerProviderProps> = ({
  loggerName = "ui",
  children,
}) => {
  const logger = useMemo(() => getLogger(loggerName), [loggerName]);

  return (
    <LoggerContext.Provider value={logger}>
      {children}
    </LoggerContext.Provider>
  );
};

export function useLogger(name?: string): Logger {
  const ctxLogger = useContext(LoggerContext);

  return useMemo(() => {
    if (name) {
      return getLogger(name);
    }
    if (!ctxLogger) {
      return getLogger("ui");
    }
    return ctxLogger;
  }, [name, ctxLogger]);
}
