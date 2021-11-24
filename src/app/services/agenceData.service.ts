import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router'
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AgenceDataService {
  public url=environment.url;
  constructor(private http:HttpClient) { }
  geVilles() {
    return this.http.get(`${this.url}/getListVilles`)
  }
}
