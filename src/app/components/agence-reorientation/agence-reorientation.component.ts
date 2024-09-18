import { Component, Inject, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
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
  daterendezvous;
  dateHint: boolean;
  codeagence: any;
    constructor(private dateadapter: DateAdapter<Date>,private callService: CallServerService, private matdiagRef: MatDialogRef<AgenceReorientationComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    let ville = data.personne.ville
    this.ville=data.personne.ville
    this.codeagence=data.personne.codeagence
    this.dateadapter.setLocale('en-GB'); // dd/MM/YYYY


    this.callService.getAgencesExecpt({ ville: ville, except:this.codeagence }).subscribe((res: any) => {
      this.agences = res.results;
    })
  }

  ngOnInit(): void {
  }

  annuler(){
    this.matdiagRef.close()
  }
  validate() {
    if (!this.daterendezvous) {
      this.dateHint  = true
      return
    }
    if (!this.ville && !this.data.rdv) {
      this.villeHint  = true
      return
    }
    if (!this.agence && !this.data.rdv) {
      this.agenceHint  = true
      return
    }
    this.matdiagRef.close({ agence: this.agence, ville: this.ville, daterendezvous:this.daterendezvous })
  }

  getcodeagences() {

    this.callService.getAgencesExecpt({ ville: this.ville,except:this.codeagence }).subscribe((res: any) => {
      this.agences = res.results;
    })
  }
}
