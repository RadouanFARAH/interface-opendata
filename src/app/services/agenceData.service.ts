import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgenceDataService implements Resolve<Object>{
  constructor(private http:HttpClient) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any[] | Observable<Object> | Promise<any[]> {
    return this.http.get('https://localhost:3131/api/getListAgenceAAA')
  }
}
