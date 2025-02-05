import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PmDataService implements Resolve<Object>{
  constructor(private http:HttpClient) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any[] | Observable<Object> | Promise<any[]> {
    return null
  }
}
