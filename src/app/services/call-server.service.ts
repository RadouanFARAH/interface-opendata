import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CallServerService {
  public url=environment.url;
  constructor(private http:HttpClient) { }
  setAgence(data){
    return this.http.post(`${this.url}/setAgence`,data)
  }
  getHistory(data){
    return this.http.post(`${this.url}/getHistory`,data)
  }
  changePassword(data){
    return this.http.post(`${this.url}/changePassword`,data)
  }
  setAgenceEtAgent(data){
    return this.http.post(`${this.url}/setAgenceEtAgent`,data)
  }
  
  // getStatus(data){
  //   return this.http.post(`http://192.168.150.40:3737/users/getStatut`,data)
  // }
  register(data){
    return this.http.post(`${this.url}/register`,data)
  }
  
  getStatsQualif(){
    return this.http.get(`${this.url}/statsQualif`)
  }
  getStatsPreQualif(){
    return this.http.get(`${this.url}/statsPreQualif`)
  }


  getDataStatsQualif(data){
    return this.http.post(`${this.url}/dataStatsQualif`, data)
  }
  getDataStatsPreQualif(data){
    return this.http.post(`${this.url}/dataStatsPreQualif`, data)
  }
  getDataStatsEvolan(data){
    return this.http.post(`${this.url}/dataStatsEvolan`, data)
  }
  getDataStatsNouvelle(data){
    return this.http.post(`${this.url}/dataStatsNouvelle`, data)
  }



  sendToEvolan(data){
    if (data.typeclient === "M") {
      return this.http.post(`${this.url}/ajouterPersonneMoraleRS`,data)

    } else {
      return this.http.post(`${this.url}/ajouterPersonnePhysiqueRS`,data)
    }
  }


  updatePersonne(data){
    return this.http.post(`${this.url}/updatePersonne`,data)
  }
  setResutlatTraitement(data){
    return this.http.post(`${this.url}/setResultatTraitement`, data)
  }
  getAgences(data){
    return this.http.post(`${this.url}/getAgencesRS`, data)
  }

  getAnomalies(valeurid){
    return this.http.post(`${this.url}/getAnomalies`, {valeurid})
  }


  lock(data){
    return this.http.post(`${this.url}/verouiller`,data)
  }
  unlock(data){
    return this.http.post(`${this.url}/deverouiller`,data)
  }
  // verify(data){
  //   return this.http.post(`${this.url}/verify`,data)
  // }
  uploadFile(data){
    let headers = new HttpHeaders()
    headers.set(`Accept`,`application/json`);
    headers.delete(`Content-Type`);
    return this.http.post("/uploaddata",data, {headers})
  }
  getVille(){
    return this.http.get(`${this.url}/getListVilles`)
  }
  notifydrds(){
    return this.http.get(`${this.url}/notifydrds`)
  }
  rappelerdsdr(){
    return this.http.get(`${this.url}/rappelerdsdr`)
  }
  testConnection(){
    return this.http.get(`${this.url}/testConnection`)
  }

  notifyDPRM(){
    console.log(`done3`);
    
    return this.http.get(`${this.url}/notifyDPRM`)
  }
  MAJdemandeSorts2(){
    return this.http.get(`${this.url}/MAJdemandeSorts2`)
  }
  getCodeAgence(data){
    return this.http.post(`${this.url}/getCodeAgence`, data)
  }
  getCodePostalParVille(data){
    return this.http.post(`${this.url}/getCodePostalParVille`, data)
  }
  // getLogs(data){
  //   return this.http.post(`${this.url}/getLogs`,data)
  // }
}
