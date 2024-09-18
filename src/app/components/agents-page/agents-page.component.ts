import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CallServerService } from 'src/app/services/call-server.service';
import { PmDataNewService } from 'src/app/services/pmDataNew.service';
import { AgenceReorientationComponent } from '../agence-reorientation/agence-reorientation.component';

@Component({
  selector: 'app-agents-page',
  templateUrl: './agents-page.component.html',
  styleUrls: ['./agents-page.component.scss']
})
export class AgentsPageComponent implements OnInit {
  codegestionnaire: string;
  qualification: string;
  statusTraitement = [
    { statut: 'Injoignable' },
    { statut: 'Non éligible' },
    { statut: 'Réorientée' },
    { statut: 'Hors zone' },
    { statut: 'Plus intéressé' },
    { statut: 'Intéressé plustard' },
    { statut: 'Client non venu au RDV' },
    { statut: 'RDV confirmé' },
    { statut: 'Dossier en cours' },
    { statut: 'Prêt débloqué' },
    { statut: 'Prêt soldé' },
    { statut: 'Contrat annulé' },
    { statut: 'Contrat consolidé' }
  ];
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: any[];
  getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(cd => !cd.hide).map(cd => cd.def);
  }
  dataSource: MatTableDataSource<any>;
  display: string = 'none';
  pageSizeOptions = [5, 10, 15];
  codeagence: any;
  isHint = false;
  isAllerClicked = false;
  agences: any;
  villes: any;
  constructor(public dialog: MatDialog, private activatedRoute: ActivatedRoute, private callService: CallServerService, private newOrdersService: PmDataNewService, private activeroute: ActivatedRoute, private snackBar: MatSnackBar,) {
    this.callService.testConnection().subscribe((res) => {
    })
 
    this.activeroute.params.subscribe((res) => {
      this.codeagence = res.codeagence
    })


  }

  ngOnInit(): void {
  }
  openReorientedModal(personne) {
    if (personne.qualification === "Réorientée") {
      const dialogRef = this.dialog.open(AgenceReorientationComponent, {
        disableClose: true,
        data: {
          villes: this.villes,
          personne,
          rdv: false
        },

      });
      dialogRef.afterClosed().subscribe((e) => {
        if (e) {
          personne.ville = e.ville;
          personne.agence = e.agence.agence;
          personne.codeagence = e.agence.codeagence;
          let rdv = new Date(e.daterendezvous).toLocaleDateString('en-GB')

          personne.daterendezvous = rdv;
        }
      })
    }
    if (personne.qualification === "RDV confirmé") {
      const dialogRef = this.dialog.open(AgenceReorientationComponent, {
        disableClose: true,
        data: {
          villes: this.villes,
          personne,
          rdv: true
        },

      });
      dialogRef.afterClosed().subscribe((e) => {
        if (e) {
          let rdv = new Date(e.daterendezvous).toLocaleDateString('en-GB')

          personne.daterendezvous = rdv;
          // personne.agence = e.agence.agence;
          // personne.codeagence = e.agence.codeagence;
        }
      })
    }
  }

  getcodeagenes(ville) {
    this.callService.getAgences({ ville: ville }).subscribe((res: any) => {
      this.agences = res.results;
    })
  }
  enterKeyPressed(event) {

    if (event.keyCode === 13) {
      this.getDemandesPrequalifQualif();
    }
  }
  getDemandesPrequalifQualif() {
    this.isAllerClicked = true
    if (!this.codegestionnaire) {
      this.isHint = true
      this.isAllerClicked = false
      return;
    }
    else {
      let data = {
        codegestionnaire: this.codegestionnaire,
        codeagence: this.codeagence
      }
      this.newOrdersService.getDemandesPrequalifQualif(data).subscribe(
        (res: any) => {
          let personnes = res.results;
          this.villes = res.villes;
          this.agences = res.agences;
          personnes.forEach((p) => {
            if (!p.resultatTraitement) {
              p.resultatTraitement = 'nouvelle';
            }
          });
          this.displayedColumns = [
            'nom',
            'prenom',
            'cin',
            'telgsm',
            // 'ville',
            // 'agence',
            'codeagence',
            // 'agence_reorientation',
            'entry_date',
            'secteur',
            'montantdemande',
            'nbrappel',
            'resultatTraitement',
            'qualification',
            'statuttraitement',
            'montantdebloque',
            'options',
          ];
          setTimeout(() => {
            this.dataSource = new MatTableDataSource(personnes);
            this.display = 'initial';
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          }, 1995);
        },
        (err) => {
          this.dataSource = null
          this.isAllerClicked = false
          if (err.status === 500) {
            let snackBarRef = this.snackBar.open('une erreur est survenue, veuillez réessayer plustard', 'OK', { duration: 15000, horizontalPosition: 'center', verticalPosition: 'top' });
            snackBarRef.onAction().subscribe(() => {
              snackBarRef.dismiss()
            })
          } else if (err.status === 402) {
            let snackBarRef = this.snackBar.open('veuillez saisir une Matricule valide', 'OK', { duration: 15000, horizontalPosition: 'center', verticalPosition: 'top' });
            snackBarRef.onAction().subscribe(() => {
              snackBarRef.dismiss()
            })
          }
        }
      );
    }
  }

  validate(element) {
    if (!element.qualification || !this.codegestionnaire) {
      let snackBarRef = this.snackBar.open(
        'Veuillez remplir les champs obligatoires',
        'OK',
        {
          duration: 15000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        }
      );
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    } else {
      element.codegestionnairecible = this.codegestionnaire

      this.newOrdersService.setDemandesPrequalifQualif(element).subscribe((res) => {
        this.dataSource = null
        this.isAllerClicked = false
        this.getDemandesPrequalifQualif()
        let snackBarRef = this.snackBar.open(
          'mise à jour avec succès',
          'OK',
          {
            duration: 15000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: 'successClassSnack'
          }
        );
        snackBarRef.onAction().subscribe(() => {
          snackBarRef.dismiss();
        });

      }, (err) => {

        let snackBarRef = this.snackBar.open(
          'une erreur est survenue, veuillez réessayer plustard',
          'OK',
          {
            duration: 15000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          }
        );
        snackBarRef.onAction().subscribe(() => {
          snackBarRef.dismiss();
        });
      })
    }
  }

}
