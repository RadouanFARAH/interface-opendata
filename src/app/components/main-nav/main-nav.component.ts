import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
  role: string;
  isBO:boolean ;
  isAGENT:boolean ;
  isCLIENT:boolean ;

  constructor(private breakpointObserver: BreakpointObserver, private route:Router) {
    
    this.role = localStorage.getItem('role')
    console.log('isBO: ',this.role==='BO')
    this.isBO =  this.role === 'BO'
    this.isAGENT = this.role === 'AGENT'
    this.isCLIENT = this.role === 'CLIENT'
  }


  logout(){
    this.route.navigate(['login'])
  }

}
