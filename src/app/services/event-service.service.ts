import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventServiceService {

  private subject = new Subject<any>(); 

  sendClickEvent() {
    this.subject.next();
  } 

  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }
}
