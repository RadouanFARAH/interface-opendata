import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CallServerService {

  constructor(private http:HttpClient) { }
  setAgence(data){
    return this.http.post('https://localhost:3131/api/setAgence',data)
  }
  setAgenceEtAgent(data){
    return this.http.post('https://localhost:3131/api/setAgenceEtAgent',data)
  }
  getStatus(data){
    return this.http.post('http://localhost:3737/users/getStatut',data)
  }
  sendToEvolan(data){
    return this.http.post('http://localhost:3737/users/CreerTiers',data)
  }
  updatePersonne(data){
    return this.http.post('https://localhost:3131/api/updatePersonne',data)
  }
  setResutlatTraitement(data){
    return this.http.post('https://localhost:3131/api/setResultatTraitement', data)
  }
  // getLogs(data){
  //   return this.http.post('https://localhost:3131/api/getLogs',data)
  // }
}
