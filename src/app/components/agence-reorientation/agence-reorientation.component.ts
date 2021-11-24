import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CallServerService } from 'src/app/services/call-server.service';

@Component({
  selector: 'app-agence-reorientation',
  templateUrl: './agence-reorientation.component.html',
  styleUrls: ['./agence-reorientation.component.scss']
})
export class AgenceReorientationComponent implements OnInit {
  agences: any;
  agence: any;
  ville: any;
  agenceHint = false;
  villeHint = false;
  constructor(private callService: CallServerService, private matdiagRef: MatDialogRef<AgenceReorientationComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    let ville = data.personne.ville

    console.log("ville from opening modal :", ville, data);

    this.callService.getAgences({ ville: ville }).subscribe((res: any) => {
      this.agences = res.results;
    })
  }

  ngOnInit(): void {
  }

  annuler(){
    this.matdiagRef.close()
  }
  validate() {
    if (!this.ville) {
      this.villeHint  = true
      return
    }
    if (!this.agence) {
      this.agenceHint  = true
      return
    }
    this.matdiagRef.close({ agence: this.agence, ville: this.ville })
  }

  getcodeagences() {
    console.log("ville from changing it :", this.ville);

    this.callService.getAgences({ ville: this.ville }).subscribe((res: any) => {
      this.agences = res.results;
    })
  }
}
