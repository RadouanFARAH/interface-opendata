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
  codegestionnaire:string;
  qualification:string;
  statusTraitement = [
    { statut: 'Injoignable' },
    { statut: 'Non éligible' },
    { statut: 'Réorientée' },
    { statut: 'Hors zone' },
    { statut: 'Plus intéressé' },
    { statut: 'Intéressé plustard' },
    { statut: 'Client non venu au RDV' },
    { statut: 'RDV confirmé' },
    { statut: 'Dossier en cours' },
    { statut: 'Prêt débloqué' },
    { statut: 'Prêt soldé' },
    { statut: 'Contrat annulée'},
    { statut: 'Contrat consolidé'}
  ]; 
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: any[];
  getDisplayedColumns(): string[] {
    return this.displayedColumns.filter(cd => !cd.hide).map(cd => cd.def);
 }
  dataSource: MatTableDataSource<any>;
  display: string='none';
  pageSizeOptions = [5, 10, 15];
  codeagence : any;
  isHint = false;
  isAllerClicked = false;
  agences:any;
  villes: any;
  constructor(public dialog: MatDialog,private activatedRoute: ActivatedRoute,private callService:CallServerService,private newOrdersService: PmDataNewService, private activeroute:ActivatedRoute,  private snackBar: MatSnackBar,) {
    this.callService.testConnection().subscribe((res)=>{
      console.log(res);
    })
    // this.callService.getVille().subscribe((res:any)=>{
    //   console.log(res);
    //   this.villes= res.villes.results;
    // })
    this.activeroute.params.subscribe((res)=>{
      this.codeagence = res.codeagence
    })
    // this.activatedRoute.data.subscribe((respp) => {
    //   console.log(respp);
      
    //   this.villes = respp.villes.results;
    // });

    // this.callService.getAgences({ville:'ALL'}).subscribe((res:any)=>{
    //   this.agences = res.results;
    // })
    
   }

  ngOnInit(): void {
  }
  openReorientedModal(personne){
    if (personne.qualification ==="Réorientée"){
      const dialogRef = this.dialog.open(AgenceReorientationComponent, {
        disableClose: true,
        data: {
          villes:this.villes,
          personne
        },
  
      });
      dialogRef.afterClosed().subscribe((e)=>{
        console.log("results after closing modal :",e);
        if (e){
          personne.ville = e.ville;
          personne.agence = e.agence.agence;
          personne.codeagence = e.agence.codeagence;
        }
      })
    }
  }
  getcodeagenes(ville){
    this.callService.getAgences({ville:ville}).subscribe((res:any)=>{
      this.agences = res.results;
    })
  }
  enterKeyPressed(event) {
    console.log('clicked',event, event.keyCode);
    
    if (event.keyCode === 13) {
       this.getDemandesPrequalifQualif();
    }
 }
  getDemandesPrequalifQualif() {
    this.isAllerClicked = true
    if (!this.codegestionnaire){
      this.isHint = true
      this.isAllerClicked = false
      return;
    }
    else {
      let data = {
        codegestionnaire: this.codegestionnaire,
        codeagence:this.codeagence
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
            let snackBarRef = this.snackBar.open('une erreur est survenue, veuillez réessayer plustard', 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top'});
            snackBarRef.onAction().subscribe(()=>{
              snackBarRef.dismiss()
            })
          } else if (err.status === 401) {
            let snackBarRef = this.snackBar.open('veuillez saisir une Matricule valide', 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top'});
            snackBarRef.onAction().subscribe(()=>{
              snackBarRef.dismiss()
            })
          }
        }
      );
    }
  }

  validate(element){
    if (!element.qualification || !this.codegestionnaire){
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
    }else {
      element.codegestionnairecible = this.codegestionnaire
      // element.qualification = this.qualification
      console.log("Qualification ....");
      
      this.newOrdersService.setDemandesPrequalifQualif(element).subscribe((res)=>{
      console.log("Qualification .... Réponse");

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
      }, (err)=>{
        console.log("Qualification erreur",err)

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
