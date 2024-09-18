import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { EventServiceService } from 'src/app/services/event-service.service';
import { MatDialog } from '@angular/material/dialog';
import { SimulatorComponent } from 'src/app/pages/simulator/simulator.component';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {
  isHandset$ = false;
  role: string;
  isBO: boolean;
  isAGENT: boolean;
  isCLIENT: boolean;
  isHome: boolean = true;
  user: string;
  constructor(
    private breakpointObserver: BreakpointObserver,
    private route: Router,
    private location: Location,
    private activeRoute: ActivatedRoute,
    private sharedService:EventServiceService,
    public dialog: MatDialog,
  ) {
    this.isHome = this.route.url !== '/home';
    this.role = localStorage.getItem('role');
    this.user = localStorage.getItem('user');
    this.isBO = this.role === 'BO';
    this.isAGENT = this.role === 'AGENT';
    this.isCLIENT = this.role === 'CLIENT';
    
  }
  setLoan() {
    this.sharedService.sendClickEvent();
  } 
  simulate(){
    const dialogRef = this.dialog.open(SimulatorComponent, {
      width: "60vw",
      height:"fit-content",
      disableClose: true,
    });
  }

  back(): void {
    if (this.route.url.startsWith('/home/details')) {
      this.activeRoute.queryParams.subscribe((res) => {

        this.route.routeReuseStrategy.shouldReuseRoute = () => false;
        this.route
          .navigate(['home/pmg'], {
            queryParams: { source: res.source, pageIndex: res.pageIndex },
          })
          .then(() => (this.route.onSameUrlNavigation = 'reload'));
      });
    }
    if (this.route.url.startsWith('/home/pmg')) {
      this.route.routeReuseStrategy.shouldReuseRoute = () => false;
      this.route
        .navigate(['home'])
        .then(() => (this.route.onSameUrlNavigation = 'reload'));
    }
  }
  async logout() {
    await localStorage.clear();
    setTimeout(() => {
      this.route.navigate(['login']);
    }, 1000);
  }



}
