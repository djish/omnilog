import { InjectionToken } from "@angular/core";

export interface AngularLoggerConfig {
  defaultLoggerName?: string;
}

export const OMNILOG_ANGULAR_CONFIG = new InjectionToken<AngularLoggerConfig>(
  "OMNILOG_ANGULAR_CONFIG",
  {
    providedIn: "root",
    factory: () => ({ defaultLoggerName: "ng" }),
  }
);
