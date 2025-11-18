import { Injectable } from "@angular/core";
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Observable, finalize } from "rxjs";
import { LoggerService } from "./logger.service";

@Injectable()
export class LoggerHttpInterceptor implements HttpInterceptor {
  private readonly logger = this.loggerService.getLogger("http");

  constructor(private readonly loggerService: LoggerService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startedAt = performance.now();

    void this.logger.info("HTTP request", {
      meta: {
        method: req.method,
        url: req.urlWithParams,
      },
    });

    return next.handle(req).pipe(
      finalize(async () => {
        const duration = performance.now() - startedAt;
        // Ideally we would inspect response status, but finalize doesn't expose it directly.
        await this.logger.info("HTTP response", {
          meta: {
            method: req.method,
            url: req.urlWithParams,
            duration,
          },
        });
      })
    );
  }
}
