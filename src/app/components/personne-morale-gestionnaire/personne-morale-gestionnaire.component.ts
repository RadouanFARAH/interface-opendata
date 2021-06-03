import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PmDataService } from 'src/app/services/pmData.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { DialogSecondComponent } from '../dialog-second/dialog-second.component';
import { CallServerService } from 'src/app/services/call-server.service';
import { ResultatTraitementComponent } from '../resultat-traitement/resultat-traitement.component';
import { PmDataNewService } from 'src/app/services/pmDataNew.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-personne-morale-gestionnaire',
  templateUrl: './personne-morale-gestionnaire.component.html',
  styleUrls: ['./personne-morale-gestionnaire.component.scss'],
})
export class PersonneMoraleGestionnaireComponent implements OnInit {
  source = [
    { value: 'prequalifier', viewValue: 'Demandes pré-qualifiées' },
    { value: 'nouvelle', viewValue: 'Nouvelles demandes' },
    { value: 'evolan', viewValue: 'Demandes traités par le réseaux' },
  ];
  // statustraitement = [
  //   { value: '', viewValue: 'Tous' },
  //   { viewValue: 'Hors zone agence', value: 'horszone' },
  //   { viewValue: 'Erronée', value: 'erronee' },
  //   { viewValue: 'Intéressé', value: 'interesse' },
  //   { viewValue: 'Non intéressé', value: 'noninteresse' },
  //   { viewValue: 'Non éligible', value: 'noneligible' },
  //   { viewValue: 'Injoignable', value: 'injoignable' },
  // ];
  status = [
    { value: '', viewValue: 'Tous' },
    { value: 'Demande débloquée', viewValue: 'Débloquée' },
    { value: 'Demande rejetée', viewValue: 'Rejetée' },
    { value: 'Demande annulée', viewValue: 'Annulée' },
  ];
  selectedValue: string = '';
  selectedValueSearch!: string;
  displayedColumns: string[] = [
    'nom',
    'prenom',
    'cin',
    'telgsm',
    'resultatTraitement',
    'options',
  ];
  dataSource: any;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  focused: boolean = false;
  agences: any;
  agent: any;
  sourceSelectedValue: any;
  statutSelectedValue: any;
  dataFromDialog: any;
  alert: any;
  isAlert: boolean = false;
  statusTraitement = [
    { statutC: '', statut: 'Tous' },
    { statutC: 'Hors zone agence', statut: 'Hors zone agence' },
    { statutC: 'Erronée', statut: 'Erronée' },
    { statutC: 'Intéressé', statut: 'Intéressé' },
    { statutC: 'Non intéressé', statut: 'Non intéressé' },
    { statutC: 'Non éligible', statut: 'Non éligible' },
    { statutC: 'Injoignable', statut: 'Injoignable' },
    { statutC: 'Intéressé plustard', statut: 'Intéressé plustard' },
  ];
  selectedStatut: any;
  demandesP: any;
  isSourceSelected = false;
  constructor(
    public callServer: CallServerService,
    public dialog: MatDialog,
    private PmDataService: PmDataService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private newOrdersService: PmDataNewService,
    private db:DatabaseService
  ) {
    // this.activatedRoute.data.subscribe((res) => {
    //   console.log(res);
    //   let data = res.codes.results
    //   console.log('this is the data :', data)
    // });
  }
  sourceChanged() {
    this.isSourceSelected = true;
    this.dataSource = null;
    if (this.sourceSelectedValue === 'nouvelle') {
      this.getNouvellesDemandes();
    } else if (this.sourceSelectedValue === 'prequalifier') {
      this.getDemandesPrequalifies();
    } else if (this.sourceSelectedValue === 'evolan') {
      this.getDemandesEvolan();
    }
  }

  getDemandesEvolan() {
    this.newOrdersService.getDemandesEvolan().subscribe(
      (res: any) => {
        console.log(res.ville);
        let personnes = res.results;
        this.displayedColumns = [
          'nom',
          'prenom',
          'cin',
          'telgsm',
          'statuttraitement',
          'options',
        ];
        this.dataSource = new MatTableDataSource(personnes);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (err) => (this.dataSource = null)
    );
  }
  ngOnInit(): void {}
  reloadComponent() {
    let currentUrl = this.route.url;
    this.route.routeReuseStrategy.shouldReuseRoute = () => false;
    this.route.onSameUrlNavigation = 'reload';
    this.route.navigate([currentUrl]);
  }
  pageSizeOptions = [5, 10, 15];
  getNouvellesDemandes() {
    this.newOrdersService.getNouvellesDemandes().subscribe(
      (res: any) => {
        let personnes = res.results;
        console.log(personnes)
        personnes.forEach((p) => {
          if (!p.resultatTraitement) {
            p.resultatTraitement = 'nouvelle';
          }
          p.entry_date = new Date(p.entry_date)
        });
        personnes.forEach((p) => {
          this.db.getCodePostaleByVille(p.ville).then((row)=>{
            p.codePostal = row[0].codePostale
          })
        });
        this.displayedColumns = [
          'nom',
          'prenom',
          'cin',
          'telgsm',
          'montantdemande',
          'email',
          'secteur',
          // 'projet',
          'agence',
          'code_agence',
          'entry_date',
          'options',
        ];
        setTimeout(() => {
          this.dataSource = new MatTableDataSource(personnes);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }, 1995);
      },
      (err) => (this.dataSource = null)
    );
  }
  getDemandesPrequalifies() {
    this.newOrdersService.getDemandesPrequalifies().subscribe(
      (res: any) => {
        console.log(res);
        let personnes = res.msg;
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
          'resultatTraitement',
          'nbrappel',
          'options',
        ];
        this.dataSource = new MatTableDataSource(personnes);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (err) => (this.dataSource = null)
    );
  }

  openDialog(valeurid): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: { agences: this.agences },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result) {
        let data = {
          codeagencecible: result,
          valeurid,
        };
        this.callServer.setAgence(data).subscribe(
          (res) => {
            console.log(res);
          },
          (err) => {
            if (err.status === 441) {
              this.reloadComponent();
            }
          }
        );
      }
    });
  }
  openDialogSecond(valeurid): void {
    const dialogRef = this.dialog.open(DialogSecondComponent, {
      width: '350px',
      data: { agences: this.agences },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      this.dataFromDialog = result;
      console.log(result);
      if (result.selectedAgence && result.selectedAgent) {
        let data = {
          codeagencecible: result.selectedAgence,
          valeurid,
          codegestionnairecible: result.selectedAgent,
        };
        this.callServer.setAgenceEtAgent(data).subscribe(
          (res) => {
            console.log(res);
          },
          (err) => {
            if (err.status === 443) {
              this.reloadComponent();
            } else alert('error');
          }
        );
      }
    });
  }
  openDialogResultatTraitement(valeurid): void {
    const dialogRef = this.dialog.open(ResultatTraitementComponent, {
      width: '350px',
      data: this.statusTraitement,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      this.selectedStatut = result;
      let data = {
        resultatTraitement: result,
        valeurid,
      };
      this.callServer.setResutlatTraitement(data).subscribe(
        (res) => {
          this.reloadComponent();
          console.log(res);
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  ngAfterViewInit() {
    // this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator;
  }

  onChange() {
    console.log(this.selectedValue);
    this.dataSource.filter = this.selectedValue.trim().toLowerCase();
  }
  onChangeSource() {
    console.log(this.selectedValue);
    this.dataSource.filter = this.sourceSelectedValue.trim().toLowerCase();
  }

  onChangeStatut() {
    console.log(this.selectedValue);
    this.dataSource.filter = this.statutSelectedValue.trim().toLowerCase();
  }

  makeItFocused(e: any) {
    this.focused = e.tab.isActive;
  }
  keyDownFunction(event: any) {
    if (event.keyCode == 13) {
      this.searchByCode();
    }
  }

  searchByCode() {
    console.log(this.selectedValueSearch);
  }
  send(personne) {
    console.log(personne);
    this.route.navigate(['home/details'], { queryParams: personne });
  }

  getStatut(numtiers, codegestionnaire) {
    let data = {
      numTier: numtiers,
      codeGest: codegestionnaire,
    };
    this.callServer.getStatus(data).subscribe(
      (res: any) => {
        console.log(res);
        this.isAlert = true;
        this.alert = res.EMP.Demande[0].statut;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  sendToEvolan(personne) {
    this.callServer.sendToEvolan(personne).subscribe(
      (res: any) => {
        let body = {
          data: res,
          valeurid: personne.valeurid,
        };
        console.log('body to send', body);
        // this.callServer.updatePersonne(body).subscribe(
        //   (res) => {
        //     console.log(res);
        //     this.reloadComponent();
        //   },
        //   (err) => {
        //     console.log('error from 3131', err);
        //   }
        // );
      },
      (err) => {
        console.log('error from 3737', err);
      }
    );
  }
}
