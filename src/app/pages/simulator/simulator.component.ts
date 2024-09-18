import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.scss']
})
export class SimulatorComponent implements OnInit {
  simulation = {
    duree: 12,
    montant: 10000
  };

  showBootstrapAlert() {
    this.showAlert = true;
  }

  closeAlert() {
    this.showAlert = false;
  }
  showAlert: boolean = false;
  echeancefin: any;
  public rows: any;
  constructor(public dialogRef: MatDialogRef<SimulatorComponent>,) { }

  ngOnInit(): void {
  }

  retour(){
    this.dialogRef.close();
  }
  simler(simulation:any) {
    if (simulation.montant >= 1000 && simulation.duree > 6) {
      var taux;
      if (simulation.montant >= 1000 && simulation.montant <= 7000) {
        taux = 24;
      } else if (simulation.montant >= 7001 && simulation.montant <= 15000) {
        taux = 22;
      } else if (simulation.montant >= 15001 && simulation.montant <= 30000) {
        taux = 21;
      } else if (simulation.montant >= 30001 && simulation.montant <= 48000) {
        taux = 18.5;
      }

      var val = taux / 1200;
      val = 1 + val;
      var k = 1;
      var n = simulation.duree;
      var val2 = 1 - Math.pow(val, -n);
      var montant = simulation.montant;
      var montant2 = simulation.montant;
      var val3 = (montant * taux) / 1200;
      this.echeancefin = val3 / val2;
      var list = [];
      for (var i = 0; i < simulation.duree; i++) {
        list[i] = {
          echeance: k,
          base: montant2,
          interet: (montant2 * taux) / 1200,
          annuite: val3 / val2,
          get amortissement() {
            return this.annuite - this.interet;
          },
          get valeurfinal() {
            return this.base - this.amortissement;
          },
        };
        montant2 = list[i].valeurfinal;
        k = k + 1;
      }

      var vals = Object.keys(list).map(function (key) {
        return list[key];
      });
      this.rows = vals;
    } else {
      this.showAlert = true;
    }
  }


  setbareme(simul:any, list:any) {
    let taux = list.tauxmin / 1000;
    let simlation = {
      montant: simul.montant,
      taux: taux,
      nbre: simul.duree,
    };
    this.simler(simlation);
  }

}
