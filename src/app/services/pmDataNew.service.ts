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
  //   return this.http.post('https://intranet.alamana.org.ma:3132/api/nouvellesdemandes',{})
  // }
   getNouvellesDemandes(offset){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/nouvellesdemandes', {offset})
  }
  getDemandesEvolan(offset){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/demandesRS', {offset})
  }
  getDemandesQualifier(offset){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/demandesqualifer', {offset})
  }
  getDemandesPrequalifies(offset){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/demandesPrequalifies', {offset})
  }
  getDemandesPrequalifQualif(data){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/getDemandesPrequalifQualif', data)
  }
  setDemandesPrequalifQualif(data){
    console.log(data)
    return this.http.post('https://intranet.alamana.org.ma:3132/api/setDemandesPrequalifQualif', data)
  }
}
