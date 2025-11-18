# Angular Integration Example

```ts
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { LoggerService, LoggerHttpInterceptor, OMNILOG_ANGULAR_CONFIG } from "@omnilog/angular";

@NgModule({
  providers: [
    LoggerService,
    {
      provide: OMNILOG_ANGULAR_CONFIG,
      useValue: { defaultLoggerName: "ng-ui" },
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggerHttpInterceptor,
      multi: true,
    },
  ],
})
export class AppModule {}
```
