import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {
  // isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  //   .pipe(
  //     map(result => result.matches),
  //     shareReplay()
  //   );
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
    private activeRoute: ActivatedRoute
  ) {
    this.isHome = this.route.url !== '/home';
    this.role = localStorage.getItem('role');
    this.user = localStorage.getItem('user');
    console.log('isBO: ', this.role === 'BO');
    this.isBO = this.role === 'BO';
    this.isAGENT = this.role === 'AGENT';
    this.isCLIENT = this.role === 'CLIENT';
  }

  back(): void {
    if (this.route.url.startsWith('/home/details')) {
      this.activeRoute.queryParams.subscribe((res) => {

        this.route.routeReuseStrategy.shouldReuseRoute = () => false;
        this.route
          .navigate(['home/pmg'], {
            queryParams: { source: res.source, pageIndex:res.pageIndex },
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
    console.log('cleared');
    setTimeout(() => {
      this.route.navigate(['login']);
    }, 1000);
  }
}
