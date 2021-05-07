import { Injectable, Injector } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http'
import {AuthService} from './auth.service'


@Injectable()
export class TokenInterceptorService implements HttpInterceptor  {
 
  constructor(private injector:Injector) { 
  }
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    let authService = this.injector.get(AuthService)
    var clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authService.getToken()}`
        }
      });
    return next.handle(clonedRequest)
  }
}
