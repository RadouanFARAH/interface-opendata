import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CallServerService {

  constructor(private http:HttpClient) { }
  setAgence(data){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/setAgence',data)
  }
  setAgenceEtAgent(data){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/setAgenceEtAgent',data)
  }
  getStatus(data){
    return this.http.post('http://opendata.alamana.org.ma:3737/users/getStatut',data)
  }
  getStatsQualif(){
    return this.http.get('https://intranet.alamana.org.ma:3132/api/statsQualif')
  }
  getStatsPreQualif(){
    return this.http.get('https://intranet.alamana.org.ma:3132/api/statsPreQualif')
  }
  sendToEvolan(data){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/ajouterPersonnePhysiqueRS',data)
  }
  updatePersonne(data){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/updatePersonne',data)
  }
  setResutlatTraitement(data){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/setResultatTraitement', data)
  }
  getAgences(data){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/getAgencesRS', data)
  }
  notifydrds(){
    return this.http.get('https://intranet.alamana.org.ma:3132/api/notifydrds')
  }
  rappelerdsdr(){
    return this.http.get('https://intranet.alamana.org.ma:3132/api/rappelerdsdr')
  }

  notifyDPRM(){
    console.log('done3');
    
    return this.http.get('https://intranet.alamana.org.ma:3132/api/notifyDPRM')
  }
  MAJdemandeSorts(){
    return this.http.get('https://intranet.alamana.org.ma:3132/api/MAJdemandeSorts')
  }
  getCodeAgence(data){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/getCodeAgence', data)
  }
  getCodePostalParVille(data){
    return this.http.post('https://intranet.alamana.org.ma:3132/api/getCodePostalParVille', data)
  }
  // getLogs(data){
  //   return this.http.post('https://intranet.alamana.org.ma:3132/api/getLogs',data)
  // }
}
