import { Injectable } from '@angular/core';
import { JwtHelperService } from "@auth0/angular-jwt";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { isJwtExpired } from 'jwt-check-expiration';
 
@Injectable({
  providedIn: 'root',
})
export class TokenGuard implements CanActivate {
  constructor(private authService: AuthService, private route: Router) {}
  tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
      let token = this.authService.getToken();
      const helper = new JwtHelperService();
      const isExpired = helper.isTokenExpired(token) ||isJwtExpired(token) || this.tokenExpired(token) ;
  
      if (token && !isExpired) {
        return true;
      } else {
        this.route.navigate(['login']);
        return false;
      }
  }
}
