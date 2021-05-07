import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CallServerService } from 'src/app/services/call-server.service';

@Component({
  selector: 'app-personne-details',
  templateUrl: './personne-details.component.html',
  styleUrls: ['./personne-details.component.scss']
})
export class PersonneDetailsComponent implements OnInit {
  personne:any;
  // logs: any;
  constructor(
    private activeRoute: ActivatedRoute, 
    // private server:CallServerService
    ) {
    this.activeRoute.queryParams.subscribe(res=>{
      this.personne =res
      // let data = {
      //   valeurid:res.valeurid
      // }
      // console.log('data to send to getlogs', data)
      // this.server.getLogs(data).subscribe((res)=>{
      //   console.log(res)
      //   this.logs = res
      // }, (err)=>{
      //   console.log(err)
      // })
    })
   }
   ngOnInit(): void {
     console.log(this.personne)
   }
}
