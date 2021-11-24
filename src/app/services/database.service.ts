import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare var window: any;

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  public url=environment.url;
  constructor(private http: HttpClient) {
  }

  getOrganismes() {
    return this.http.get(`${this.url}/getListOrganisme`)
  }
  getAgenceByOrganisme(data) {
    return this.http.post(`${this.url}/getListAgenceByOrganisme`, data)
  }
  getCodePostaleByVille(data) {
  return this.http.post(`${this.url}/getCodePostaleByVille`, data)
  }
}
