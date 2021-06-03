import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PmDataNewService
//  implements Resolve<Object>
 {
  constructor(private http:HttpClient) { }
  // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any[] | Observable<Object> | Promise<any[]> {
  //   return this.http.post('https://192.168.140.30:3132/api/nouvellesdemandes',{})
  // }
   getNouvellesDemandes(){
    return this.http.post('https://192.168.140.30:3132/api/nouvellesdemandes', {})
  }
  getDemandesEvolan(){
    return this.http.post('https://192.168.140.30:3132/api/demandesRS', {})
  }
  getDemandesPrequalifies(){
    return this.http.post('https://192.168.140.30:3132/api/demandesPrequalifies', {})
  }
}
