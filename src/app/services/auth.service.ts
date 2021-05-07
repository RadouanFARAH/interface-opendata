import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  login(credentials){
    return this.http.post('https://localhost:3131/api/login',credentials)
  }
  getToken(){
    return localStorage.getItem('token')
  }
}
