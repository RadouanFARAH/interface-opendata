import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CallServerService } from 'src/app/services/call-server.service';
import { PmDataNewService } from 'src/app/services/pmDataNew.service';
import { PersonneDetailsComponent } from '../personne-details/personne-details.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ChangeDetectorRef } from '@angular/core';

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-personne-morale-gestionnaire',
  templateUrl: './personne-morale-gestionnaire.component.html',
  styleUrls: ['./personne-morale-gestionnaire.component.scss'],
})
export class PersonneMoraleGestionnaireComponent implements OnInit {
  display = 'none';
  source = [
    { value: 'nouvelle', viewValue: 'Nouvelles demandes' },
    { value: 'prequalifier', viewValue: 'Demandes pré-qualifiées' },
    { value: 'qualifier', viewValue: 'Demandes qualifiées' },
    { value: 'evolan', viewValue: 'Status des contrats' },
  ];

  status = [
    { value: '', viewValue: 'Tous' },
    { value: 'Demande débloquée', viewValue: 'Demande débloquée' },
    { value: 'Demande validée', viewValue: 'Demande validée' },
    { value: 'Demande saisie', viewValue: 'Demande saisie' },
    { value: 'Demande envoyée', viewValue: 'Envoyée à EVOLAN' },
    { value: 'Demande rejetée', viewValue: 'Demande rejetée' },
    { value: 'Demande annulée', viewValue: 'Demande annulée' },
  ];
  selectedValue: string = '';
  statusQualifications = [
    { statutC: '', statut: 'Tous' },
    { statutC: 'Injoignable', statut: 'Injoignable' },
    { statutC: 'Non éligible', statut: 'Non éligible' },
    { statutC: 'Réorientée', statut: 'Réorientée' },
    { statutC: 'Hors zone', statut: 'Hors zone' },
    { statutC: 'Plus intéressé', statut: 'Plus intéressé' },
    { statutC: 'Intéressé plustard', statut: 'Intéressé plustard' },
    { statutC: 'RDV confirmé', statut: 'RDV confirmé' },
    { statutC: 'Dossier en cours', statut: 'Dossier en cours' },
    { statutC: 'Prêt débloqué', statut: 'Prêt débloqué' },
    { statutC: 'Contrat annulée', statut: 'Contrat annulée' },
    { statutC: 'Client actif', statut: 'Client actif' },
    { statutC: 'Sans_feedback', statut: 'Sans_feedback' },
  ];
  statutQualifierSelectedValue: string;
  selectedValueSearch!: string;
  displayedColumns: string[] = [
    'valeurid',
    'nom',
    'prenom',
    'cin',
    'telgsm',
    'ville',
    'agence',
    'codeagence',
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
  selectedCINValue = '';
  dataSource: MatTableDataSource<any>;
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
    { statutC: 'Erronée', statut: 'Erronée' },
    { statutC: 'Injoignable', statut: 'Injoignable' },
    { statutC: 'Non éligible', statut: 'Non éligible' },
    { statutC: "Refus par l'agence", statut: "Refus par l'agence" },
    { statutC: 'Non intéressé', statut: 'Non intéressé' },
    { statutC: 'Intéressé plustard', statut: 'Intéressé plustard' },
    { statutC: 'Intéressé', statut: 'Intéressé' },
    { statutC: 'Doublant', statut: 'Doublant' },
  ];
  selectedStatut: any;
  demandesP: any;
  isSourceSelected = false;
  villes: any;
  form2: FormGroup;
  dataSourceToFilter: MatTableDataSource<any>;
  isBO: boolean;
  offset:number=0;
  dataLength: number;
  pageSizeOptions = [5, 10, 15]
  constructor(
    private cdr: ChangeDetectorRef,
    public callServer: CallServerService,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private newOrdersService: PmDataNewService,
    private dateadapter: DateAdapter<Date>
  ) {
    let role = localStorage.getItem('role');
    if (role === 'BO') {
      this.isBO = true;
    }
    this.dateadapter.setLocale('en-GB');
    this.activatedRoute.data.subscribe((respp) => {
      this.villes = respp.villes.results;
    });
    // this.activatedRoute.queryParams.subscribe((res) => {
    //   this.sourceSelectedValue = res.source;
    //   const pageIndex = res.pageIndex;
    //   this.dataSource = null;
    //   if (this.sourceSelectedValue === 'nouvelle') {
    //     this.isSourceSelected = true;
    //     this.getNouvellesDemandes(pageIndex);
    //   } else if (this.sourceSelectedValue === 'prequalifier') {
    //     this.isSourceSelected = true;
    //     this.getDemandesPrequalifies(pageIndex);
    //   } else if (this.sourceSelectedValue === 'evolan') {
    //     this.isSourceSelected = true;
    //     this.getDemandesEvolan(pageIndex);
    //   }
    // });
  }
  Previous(){
    console.log('the offset is :',this.offset);
    
    if (this.dataLength < 10 || this.offset === 0) return;
    else {
      this.offset = this.offset - 10;
      this.sourceChanged();
    }
    
  }
  Next(){
    if (this.dataLength < 10) return;
    else {
      this.offset = this.offset + 10;
      this.sourceChanged();
    }
  }
  notifydsdr() {
    this.callServer.notifydrds().subscribe((res) => {
      console.log('done');
    });
  }
  rappelerdsdr() {
    this.callServer.rappelerdsdr().subscribe((res) => {
      console.log('done');
    });
  }

  notifyDPRM() {
    console.log('done1');
    this.callServer.notifyDPRM().subscribe((res) => {
      console.log('done2');
    });
  }
  MAJdemandeSorts() {
    this.callServer.MAJdemandeSorts().subscribe((res) => {
      console.log('done');
    });
  }
  sourceChanged() {
    this.isSourceSelected = true;
    this.dataSource = null;
    this.selectedCINValue = '';
    this.selectedValue = '';
    this.statutSelectedValue = '';
    this.statutQualifierSelectedValue = '';
    this.form2.patchValue({
      fromDate: null,
      toDate: null,
    });
    const offset = this.offset;
    if (this.sourceSelectedValue === 'nouvelle') {
      this.getNouvellesDemandes(offset);
    } else if (this.sourceSelectedValue === 'prequalifier') {
      this.getDemandesPrequalifies(offset);
    } else if (this.sourceSelectedValue === 'evolan') {
      this.getDemandesEvolan(offset);
    } else if (this.sourceSelectedValue === 'qualifier') {
      this.getDemandesQualifier(offset);
    }
  }
  public exportAsExcelFile(): void {
    console.log(this.sourceSelectedValue);

    if (this.sourceSelectedValue === 'prequalifier') {
      this.callServer.getStatsPreQualif().subscribe((res: any) => {
        let data = res.resultat;
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const workbook: XLSX.WorkBook = {
          Sheets: { data: worksheet },
          SheetNames: ['data'],
        };
        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        this.saveAsExcelFile(excelBuffer);
      });
    }
    if (this.sourceSelectedValue === 'qualifier') {
      this.callServer.getStatsQualif().subscribe((res: any) => {
        let data = res.resultat;
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const workbook: XLSX.WorkBook = {
          Sheets: { data: worksheet },
          SheetNames: ['data'],
        };
        const excelBuffer: any = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        });
        this.saveAsExcelFile(excelBuffer);
      });
    }
  }
  private saveAsExcelFile(buffer: any): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      'reporting' + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }
  getDemandesQualifier(offset) {
    this.newOrdersService.getDemandesQualifier(offset).subscribe(
      (res: any) => {
        let personnes = res.results;
        this.displayedColumns = [
          'valeurid',
          'nom',
          'prenom',
          'cin',
          'telgsm',
          'ville',
          'agence',
          'codeagence',
          'emaildr',
          'emailds',
          'entry_date',
          'secteur',
          'montantdemande',
          'nbrappel',
          'resultatTraitement',
          'qualification',
          'statuttraitement',
          'montantdebloque',
          'user',
          'options',
        ];
        setTimeout(() => {
          this.dataLength = personnes.length;
          this.dataSource = new MatTableDataSource(personnes);
          this.dataSourceToFilter = new MatTableDataSource(personnes);
          this.cdr.detectChanges();
          this.display = 'initial';
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }, 1995);
      },
      (err) => (this.dataSource = null)
    );
  }
  getDemandesEvolan(offset) {
    this.newOrdersService.getDemandesEvolan(offset).subscribe(
      (res: any) => {
        let personnes = res.results;
        this.displayedColumns = [
          'valeurid',
          'nom',
          'prenom',
          'cin',
          'telgsm',
          'ville',
          'agence',
          'codeagence',
          'emaildr',
          'emailds',
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
          this.dataLength = personnes.length;
          this.dataSource = new MatTableDataSource(personnes);
          this.dataSourceToFilter = new MatTableDataSource(personnes);
          this.cdr.detectChanges();
          this.display = 'initial';
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }, 1995);
      },
      (err) => (this.dataSource = null)
    );
  }
  ngOnInit(): void {
    this.form2 = new FormGroup({
      fromDate: new FormControl(null, { validators: [Validators.required] }),
      toDate: new FormControl(null, { validators: [Validators.required] }),
    });
  }

  reloadComponent() {
    let currentUrl = this.route.url;
    this.route.routeReuseStrategy.shouldReuseRoute = () => false;
    this.route.onSameUrlNavigation = 'reload';
    this.route.navigate([currentUrl]);
  }
  getNouvellesDemandes(offset) {
    this.newOrdersService.getNouvellesDemandes(offset).subscribe(
      (res: any) => {
        let personnes = res.results;
        this.displayedColumns = [
          'valeurid',
          'nom',
          'prenom',
          'cin',
          'telgsm',
          'ville',
          'agence',
          'codeagence',
          'entry_date',
          'secteur',
          'montantdemande',
          'nbrappel',
          'resultatTraitement',
          'statuttraitement',
          'montantdebloque',
          'options',
        ];
        setTimeout(() => {
          this.dataLength = personnes.length;
          this.dataSource = new MatTableDataSource(personnes);
          this.dataSourceToFilter = new MatTableDataSource(personnes);
          this.cdr.detectChanges();
          this.display = 'initial';
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }, 1995);
      },
      (err) => (this.dataSource = null)
    );
  }
  getDemandesPrequalifies(offset) {
    this.newOrdersService.getDemandesPrequalifies(offset).subscribe(
      (res: any) => {
        let personnes = res.msg;
        personnes.forEach((p) => {
          if (p.entry_date) {
            let dateNow = new Date();
            let dateEntred = new Date(
              p.entry_date.split(' ')[0].replace(/-/g, '/')
            );
            let dateDiff = Math.floor(
              (dateNow.getTime() - dateEntred.getTime()) / (1000 * 60 * 60 * 24)
            ); // in days
            let isOutDated: boolean =
              p.resultatTraitement === 'Intéressé' &&
              !p.qualification &&
              dateDiff > 7;
            p.outdated = isOutDated;
          }
        });
        this.displayedColumns = [
          'valeurid',
          'nom',
          'prenom',
          'cin',
          'telgsm',
          'ville',
          'agence',
          'codeagence',
          'emaildr',
          'emailds',
          'entry_date',
          'dateinsert',
          'secteur',
          'montantdemande',
          'nbrappel',
          'resultatTraitement',
          'qualification',
          'statuttraitement',
          'montantdebloque',
          'user',
          'options',
        ];
        setTimeout(() => {
          this.dataLength = personnes.length;
          this.dataSource = new MatTableDataSource(personnes);
          this.dataSourceToFilter = new MatTableDataSource(personnes);
          this.cdr.detectChanges();
          this.display = 'initial';
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        }, 1995);
      },
      (err) => (this.dataSource = null)
    );
  }

  ngAfterViewInit() {
    // setTimeout(()=>{
    //   this.dataSource.sort = this.sort;
    //   this.dataSource.paginator = this.paginator;
    // })
  }

  onChangeAll(btn) {
    let source = this.sourceSelectedValue;
    let mot_cle = this.selectedCINValue ? this.selectedCINValue : '';
    let statut_dem = this.selectedValue ? this.selectedValue : '';
    let resultat_prequalif = this.statutSelectedValue
      ? this.statutSelectedValue
      : '';
    let resultat_qualif = this.statutQualifierSelectedValue
      ? this.statutQualifierSelectedValue
      : '';
    let fromDate = this.form2.value.fromDate
      ? this.form2.value.fromDate
      : new Date('01/01/1970');
    let toDate = this.form2.value.toDate
      ? this.form2.value.toDate
      : new Date('01/01/2050');

    const changesObject = {
      mot_cle,
      statut_dem,
      resultat_prequalif,
      resultat_qualif,
      fromDate,
      toDate,
    };
    console.log(changesObject);
    if (source === 'nouvelle') {
      this.dataSource.data = this.dataSourceToFilter.data.filter(function (e) {
        return (
          new Date(
            btn === 'dem'
              ? e.entry_date
              : btn === 'trait'
              ? e.dateinsert
              : e.entry_date
          ) >= fromDate &&
          new Date(
            btn === 'dem'
              ? e.entry_date
              : btn === 'trait'
              ? e.dateinsert
              : e.entry_date
          ) <= toDate &&
          (e.nom.toLowerCase().includes(mot_cle.toLowerCase()) ||
            e.prenom.toLowerCase().includes(mot_cle.toLowerCase()) ||
            e.cin.toLowerCase().includes(mot_cle.toLowerCase()))
        );
      });
    }
    if (source === 'prequalifier') {
      console.log(source);

      this.dataSource.data = this.dataSourceToFilter.data.filter(function (e) {
        return (
          new Date(
            btn === 'dem'
              ? e.entry_date
              : btn === 'trait'
              ? e.dateinsert
              : e.entry_date
          ) >= fromDate &&
          new Date(
            btn === 'dem'
              ? e.entry_date
              : btn === 'trait'
              ? e.dateinsert
              : e.entry_date
          ) <= toDate &&
          (e.nom.toLowerCase().includes(mot_cle.toLowerCase()) ||
            e.prenom.toLowerCase().includes(mot_cle.toLowerCase()) ||
            e.cin.toLowerCase().includes(mot_cle.toLowerCase()) ||
            new Date(e.dateinsert).toLocaleString().includes(mot_cle)) &&
          ((resultat_prequalif === 'Intéressé' &&
            e.resultatTraitement === resultat_prequalif) ||
            (resultat_prequalif !== 'Intéressé' &&
              e.resultatTraitement.includes(resultat_prequalif)))
        );
      });
    }
    if (source === 'qualifier') {
      this.dataSource.data = this.dataSourceToFilter.data.filter(function (e) {
        return (
          new Date(
            btn === 'dem'
              ? e.entry_date
              : btn === 'trait'
              ? e.dateinsert
              : e.entry_date
          ) >= fromDate &&
          new Date(
            btn === 'dem'
              ? e.entry_date
              : btn === 'trait'
              ? e.dateinsert
              : e.entry_date
          ) <= toDate &&
          (e.nom.toLowerCase().includes(mot_cle.toLowerCase()) ||
            e.prenom.toLowerCase().includes(mot_cle.toLowerCase()) ||
            e.cin.toLowerCase().includes(mot_cle.toLowerCase())) &&
          e.qualification.includes(resultat_qualif)
        );
      });
    }
    if (source === 'evolan') {
      this.dataSource.data = this.dataSourceToFilter.data.filter(function (e) {
        return (
          new Date(
            btn === 'dem'
              ? e.entry_date
              : btn === 'trait'
              ? e.dateinsert
              : e.entry_date
          ) >= fromDate &&
          new Date(
            btn === 'dem'
              ? e.entry_date
              : btn === 'trait'
              ? e.dateinsert
              : e.entry_date
          ) <= toDate &&
          (e.nom.toLowerCase().includes(mot_cle.toLowerCase()) ||
            e.prenom.toLowerCase().includes(mot_cle.toLowerCase()) ||
            e.cin.toLowerCase().includes(mot_cle.toLowerCase())) &&
          e.statuttraitement.includes(statut_dem)
        );
      });
    }
  }

  makeItFocused(e: any) {
    this.focused = e.tab.isActive;
  }

  send(personne): void {
    console.log(personne);

    const dialogRef = this.dialog.open(PersonneDetailsComponent, {
      data: { villes: this.villes, personne, source: this.sourceSelectedValue },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed', result);
      if (result === 'nouvelle') {
        this.dataSource.data = this.dataSourceToFilter.data.filter(
          (e) => e.id != personne.id
        );
        this.dataSourceToFilter.data = this.dataSourceToFilter.data.filter(
          (e) => e.id != personne.id
        );
      }
    });
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
      },
      (err) => {
        console.log('error from 3737', err);
      }
    );
  }
}
