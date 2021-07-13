import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  login(credentials){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/login',credentials)
  }
  getToken(){
    return localStorage.getItem('token')
  }
}
