import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CallServerService {

  constructor(private http:HttpClient) { }
  setAgence(data){
    return this.http.post('https://192.168.140.30:3132/api/setAgence',data)
  }
  setAgenceEtAgent(data){
    return this.http.post('https://192.168.140.30:3132/api/setAgenceEtAgent',data)
  }
  getStatus(data){
    return this.http.post('http://localhost:3737/users/getStatut',data)
  }
  sendToEvolan(data){
    return this.http.post('https://192.168.140.30:3132/api/ajouterPersonnePhysiqueRS',data)
  }
  updatePersonne(data){
    return this.http.post('https://192.168.140.30:3132/api/updatePersonne',data)
  }
  setResutlatTraitement(data){
    return this.http.post('https://192.168.140.30:3132/api/setResultatTraitement', data)
  }
  getAgences(data){
    return this.http.post('https://192.168.140.30:3132/api/getAgencesRS', data)
  }
  getCodeAgence(data){
    return this.http.post('https://192.168.140.30:3132/api/getCodeAgence', data)
  }
  getCodePostalParVille(data){
    return this.http.post('https://192.168.140.30:3132/api/getCodePostalParVille', data)
  }
  // getLogs(data){
  //   return this.http.post('https://192.168.140.30:3132/api/getLogs',data)
  // }
}
