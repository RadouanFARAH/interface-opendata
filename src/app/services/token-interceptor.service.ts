import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http'
import {AuthService} from './auth.service'
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';


@Injectable()
export class TokenInterceptorService implements HttpInterceptor  {
 
  constructor(private injector:Injector, private route: Router) { 
  }
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    let authService = this.injector.get(AuthService)
    var clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authService.getToken()}`
        }
      });
    return next.handle(clonedRequest).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.route.navigate(['login']);
      }
      return throwError(error);
    }));
  }
}
