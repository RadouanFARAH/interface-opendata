import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PmDataNewService
//  implements Resolve<Object>
 {
  public url=environment.url;
  constructor(private http:HttpClient) { }
  // resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any[] | Observable<Object> | Promise<any[]> {
  //   return this.http.post(`${this.url}/nouvellesdemandes',{})
  // }

  getNouvellesDemandes(offset,searchobj){
    return this.http.post(`${this.url}/nouvellesdemandes`, {...{offset}, ...searchobj})
  }
  getDemandesEvolan(offset,searchobj){
    return this.http.post(`${this.url}/demandesRS`, {...{offset}, ...searchobj})
  }
  getDemandesQualifier(offset, searchobj){
    return this.http.post(`${this.url}/demandesqualifer`, {...{offset}, ...searchobj})
  }
  getDemandesPrequalifies(offset, searchobj){
    return this.http.post(`${this.url}/demandesPrequalifies`, {...{offset}, ...searchobj})
  }

  getDemandesPrequalifQualif(data){
    return this.http.post(`${this.url}/getDemandesPrequalifQualif`, data)
  }
  setDemandesPrequalifQualif(data){
    return this.http.post(`${this.url}/setDemandesPrequalifQualif`, data)
  }
}
