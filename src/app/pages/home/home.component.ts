import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public isMenuOpen: boolean = false;
  constructor(private route:Router) { }

  ngOnInit(): void {
  }


  logout(){
    this.route.navigate(['login'])
  }
}
