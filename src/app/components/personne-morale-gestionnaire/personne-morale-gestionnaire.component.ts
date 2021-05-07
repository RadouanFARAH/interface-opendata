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


@Component({
  selector: 'app-personne-morale-gestionnaire',
  templateUrl: './personne-morale-gestionnaire.component.html',
  styleUrls: ['./personne-morale-gestionnaire.component.scss']
})
export class PersonneMoraleGestionnaireComponent implements OnInit {status = [
  { value: '', viewValue: 'Tous' },
  { value: 'encours', viewValue: 'En Cours' },
  { value: 'valide', viewValue: 'Validé' },
  { value: 'rejete', viewValue: 'Rejeté' },
  { value: 'decaisse', viewValue: 'Decaissé' },
];
selectedValue: string = '';
selectedValueSearch!: string;
displayedColumns: string[] = [
  'numtiers',
  'numerodossier',
  'resultatTraitement',
  'nom',
  'raisonsociale',
  'telgsm',
  'ice',
  'statuttraitement',
  'valeurid',
  'erreur',
  'options',
];
dataSource: any;
@ViewChild(MatSort) sort!: MatSort;
@ViewChild(MatPaginator) paginator!: MatPaginator;
focused: boolean = false;
agences: any;
agent: any;
selectedAgence: any;
dataFromDialog: any;
alert: any;
isAlert: boolean = false;
statusTraitement = [
  {statut:'Hors Zone'},
  {statut:'Erronée'}
]
  selectedStatut: any;
constructor(
  public callServer: CallServerService,
  public dialog: MatDialog,
  private PmDataService: PmDataService,
  private activatedRoute: ActivatedRoute,
  private route: Router
) {
  this.agences = this.activatedRoute.snapshot.data['agences'];
  this.activatedRoute.data.subscribe((res) => {
    let personnes = res.pms
    personnes.forEach(element => {
        element.erreur =  element.personneMoraleError && element.personneMoraleGarantError?2:(element.personneMoraleError&&!element.personneMoraleGarantError)||(!element.personneMoraleError&&element.personneMoraleGarantError)?1:0 
    });
    this.dataSource = new MatTableDataSource(personnes);
  });
}

ngOnInit(): void {}
reloadComponent() {
  let currentUrl = this.route.url;
  this.route.routeReuseStrategy.shouldReuseRoute = () => false;
  this.route.onSameUrlNavigation = 'reload';
  this.route.navigate([currentUrl]);
}

openDialog(valeurid): void {
  const dialogRef = this.dialog.open(DialogComponent, {
    width: '350px',
    data: { agences: this.agences },
  });

  dialogRef.afterClosed().subscribe((result) => {
    console.log('The dialog was closed');
    this.selectedAgence = result;
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
    console.log(result)
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
        }
        else alert('error')
      }
    );
  });
}
openDialogResultatTraitement(valeurid): void {
  const dialogRef = this.dialog.open(ResultatTraitementComponent, {
    width: '350px',
    data:this.statusTraitement,
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
          console.log(err)
      }
    );
  });
}

ngAfterViewInit() {
  this.dataSource.sort = this.sort;
  this.dataSource.paginator = this.paginator;
}

onChange() {
  console.log(this.selectedValue);
  this.dataSource.filter = this.selectedValue.trim().toLowerCase();
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
  this.route.navigate(['home/details'], { queryParams: personne });
}

getStatut(numtiers, codegestionnaire){
  let data = {
    numTier:numtiers,
    codeGest:codegestionnaire
  }
  this.callServer.getStatus(data).subscribe((res:any)=>{
    console.log(res)
    this.isAlert = true
    this.alert = res.EMP.Demande[0].statut
  },(err)=>{
    console.log(err)
  })
}
sendToEvolan(personne){
  this.callServer.sendToEvolan(personne).subscribe((res:any)=>{
    let body = {
      data:res,
      valeurid:personne.valeurid
    }
    console.log('body to send',body)
    this.callServer.updatePersonne(body).subscribe((res)=>{
      console.log(res)
      this.reloadComponent();
    }, (err)=>{
      console.log('error from 3131',err)
    })
  },(err)=>{
    console.log('error from 3737',err)
  })
}


}