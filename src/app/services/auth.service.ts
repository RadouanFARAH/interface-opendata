import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public url=environment.url;
  constructor(private http:HttpClient) { }

  login(credentials){
    return this.http.post(`${this.url}/login`,credentials)
  }
  getToken(){
    return localStorage.getItem('token')
  }
}
