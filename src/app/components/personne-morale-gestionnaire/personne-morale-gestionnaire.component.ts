import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgenceDataService } from 'src/app/services/agenceData.service';

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
  source = [{ value: 'FX', viewValue: 'Depuis Fichier Excel' }];

  nature = [
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
    { value: 'Demande soldée', viewValue: 'Demande soldée' },
    { value: 'Demande consolidée', viewValue: 'Demande consolidée' },
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
    { statutC: 'Prêt soldé', statut: 'Prêt soldé' },
    { statutC: 'Contrat annulée', statut: 'Contrat annulée' },
    { statutC: 'Contrat consolidé', statut: 'Contrat consolidé' },
    { statutC: 'Client actif', statut: 'Client actif' },
    { statutC: 'Sans_feedback', statut: 'Sans_feedback' },
  ];
  statutQualifierSelectedValue: string;
  selectedValueSearch!: string;
  displayedColumns: string[] = [
    'valeurid',
    'nom',
    
    'cin',
    'telgsm',
    'ville',
    'agence',
    'codeagence',
    'entry_date',
    'dateDeblocage',
    
    'montantdemande',
    'nbrappel',
    'resultatTraitement',
    'qualification',
    'statuttraitement',
    'montantdebloque',
    'delay_trait',
    'options',
  ];
  selectedCINValue = '';
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  focused: boolean = false;
  agences: any;
  agent: any;
  natureSelectedValue: any;
  sourceSelectedValue: any;
  statutSelectedValue: any;
  dataFromDialog: any;
  alert: any;
  isAlert: boolean = false;
  resultatTraitement = [
    { statutC: '', statut: 'Tous' },
    { statutC: 'Erronée', statut: 'Erronée' },
    { statutC: 'Injoignable', statut: 'Injoignable' },
    // { statutC: "Refus par l'agence", statut: "Refus par l'agence" },
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
  offset: number = 0;
  dataLength: number;
  pageSizeOptions = [2, 5, 10];
  pagination: number = 10;
  pageNumber: number = 0;
  btn: string = '';
  nbr: number;
  @ViewChild('exporter') exporter: ElementRef;
  S_selected: boolean = false;
  sourceChange: boolean;
  origine: string;
  isNatureSelected: boolean = false;
  total: any;
  FX_selected: boolean;
  user: string;
  regions: string;
  origins: string;
  role: string;
  constructor(
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public callServer: CallServerService,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private newOrdersService: PmDataNewService,
    private dateadapter: DateAdapter<Date>,
    private agenceDataService:AgenceDataService
  ) {

    this.role = localStorage.getItem('role');
    this.user = localStorage.getItem('user');
    this.origins = localStorage.getItem('origins');
    this.regions = localStorage.getItem('regions');

    if (this.role === 'BO') {
      this.isBO = true;
    }

    // if (this.role.startsWith("AGT")) this.nature.unshift()
    if (this.origins.includes("WB")) this.source.unshift({ value: 'WB', viewValue: 'Depuis le Site Web' })
    if (this.origins.includes("RS")) this.source.unshift({ value: 'RS', viewValue: 'Depuis les réseaux sociaux' })
    if (this.origins.includes("AW")) this.source.unshift({ value: 'AW', viewValue: 'Depuis Attijari' })
    this.dateadapter.setLocale('en-GB');

    this.agenceDataService.geVilles().subscribe((respp:any) => {
      this.villes = respp.results;
    });

  }
  fileUploaded(e) {
    console.log(e);
  }
  Previous() {
    console.log('the offset is :', this.offset);

    if (this.offset === 0) return;
    else {
      this.offset = this.offset - this.pagination;
      this.pageNumber = Math.floor(this.offset / this.pagination);
      this.navigationChanged();
    }
  }

  Next() {
    console.log('the offset is :', this.offset);

    if (this.dataLength < this.pagination) return;
    else {
      this.offset = this.offset + this.pagination;
      this.pageNumber = Math.floor(this.offset / this.pagination);
      this.navigationChanged();
    }
  }
  sourceChanged() {
    this.sourceChange = true;
    this.pageNumber = 0;
    this.isSourceSelected = true;
    this.dataSource = null;
    this.natureSelectedValue = '';
    this.isNatureSelected = false;
    this.selectedCINValue = '';
    this.selectedValue = '';
    this.statutSelectedValue = '';
    this.statutQualifierSelectedValue = '';

    this.form2.patchValue({
      fromDate: null,
      toDate: null,
    });
    this.FX_selected = false;
    this.S_selected = false;
    this.offset = 0;
    if (this.sourceSelectedValue === 'WB') {
      this.origine = 'WB';
      this.S_selected = true;

      // this.getDemanedWeb()
    } else if (this.sourceSelectedValue === 'RS') {
      this.origine = 'RS';

      this.S_selected = true;
    } else if (this.sourceSelectedValue === 'AW') {
      this.origine = 'AW';

      this.S_selected = true;
    }
    else if (this.sourceSelectedValue === 'FX') {
      this.FX_selected = true;
    }
  }
  arrayBuffer: any;
  file: File;
  incomingfile(e) {
    this.file = e.target.files[0];
    let size = e.target.files[0].size
    console.log(Math.floor(size / 1024));

    console.log(this.file);
    if (this.file.name.split('.')[1] !== 'xlsx') {
      let snackBarRef = this.snackBar.open('Pas un fichier Excel!', 'OK', {
        duration: 15000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      snackBarRef.onAction().subscribe(() => {
        snackBarRef.dismiss();
      });
    } else {
      let formData = new FormData()
      formData.append('file', this.file);
      this.callServer.uploadFile(formData).subscribe((res) => {
        console.log('done')
      }, (err) => {
        console.log(err);
      })

    }
  }
  navigationChanged() {
    let source = this.natureSelectedValue;
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
      role: this.role,
      user: this.user,
      origins: this.origins,
      regions: this.regions,
      origine: this.origine,
      act: this.btn,
      mot_cle,
      statut_dem,
      resultat_prequalif,
      resultat_qualif,
      fromDate,
      toDate,
    };
    console.log('natureChanged', this.offset);
    this.isSourceSelected = true;
    this.dataSource = null;

    const offset = this.offset;
    if (this.natureSelectedValue === 'nouvelle') {
      this.getNouvellesDemandes(offset, changesObject);
    } else if (this.natureSelectedValue === 'prequalifier') {
      this.getDemandesPrequalifies(offset, changesObject);
    } else if (this.natureSelectedValue === 'evolan') {
      this.getDemandesEvolan(offset, changesObject);
    } else if (this.natureSelectedValue === 'qualifier') {
      this.getDemandesQualifier(offset, changesObject);
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
  MAJdemandeSorts2() {
    this.callServer.MAJdemandeSorts2().subscribe((res) => {
      console.log('done');
    });
  }
  natureChanged() {
    this.pageNumber = 0;
    this.isSourceSelected = true;
    this.isNatureSelected = true;
    this.dataSource = null;
    this.selectedCINValue = '';
    this.selectedValue = '';
    this.statutSelectedValue = '';
    this.statutQualifierSelectedValue = '';
    this.form2.patchValue({
      fromDate: null,
      toDate: null,
    });
    this.offset = 0;
    const offset = this.offset;
    let source = this.natureSelectedValue;
    let mot_cle = '';
    let statut_dem = '';
    let resultat_prequalif = '';
    let resultat_qualif = '';
    let fromDate = new Date('01/01/1970');
    let toDate = new Date('01/01/2050');

    const changesObject = {
      role: this.role,
      user: this.user,
      origins: this.origins,
      regions: this.regions,
      origine: this.origine,
      act: this.btn,
      mot_cle,
      statut_dem,
      resultat_prequalif,
      resultat_qualif,
      fromDate,
      toDate,
    };
    console.log('natureChanged', this.offset, changesObject);
    if (this.natureSelectedValue === 'nouvelle' && this.origine !== "AW") {
      this.getNouvellesDemandes(offset, changesObject);
    } else if (this.natureSelectedValue === 'prequalifier') {
      this.getDemandesPrequalifies(offset, changesObject);
    } else if (this.natureSelectedValue === 'evolan') {
      this.getDemandesEvolan(offset, changesObject);
    } else if (this.natureSelectedValue === 'qualifier') {
      this.getDemandesQualifier(offset, changesObject);
    } else {
      this.dataSource = new MatTableDataSource([]);
      this.displayedColumns = []
      this.cdr.detectChanges();
      this.display = 'initial';
    }
  }


  public exportAsExcelFile(): void {
    console.log(this.natureSelectedValue);

    if (this.natureSelectedValue === 'prequalifier') {
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
        this.saveAsExcelFile(excelBuffer, 'demandes_pré-qualifiées');
      });
    }
    if (this.natureSelectedValue === 'qualifier') {
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
        this.saveAsExcelFile(excelBuffer, 'demandes_qualifiées');
      });
    }
  }

  public exportDataAsExcelFile(): void {
    console.log(this.natureSelectedValue);
    let source = this.natureSelectedValue;
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
      role: this.role,
      user: this.user,
      origins: this.origins,
      regions: this.regions,
      origine: this.origine,
      act: this.btn,
      mot_cle,
      statut_dem,
      resultat_prequalif,
      resultat_qualif,
      fromDate,
      toDate,
    };

    if (this.natureSelectedValue === 'prequalifier') {
      this.callServer
        .getDataStatsPreQualif(changesObject)
        .subscribe((res: any) => {
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
          this.saveAsExcelFile(excelBuffer, 'demandes_pré-qualifiées');
        });
    }

    if (this.natureSelectedValue === 'qualifier') {
      this.callServer
        .getDataStatsQualif(changesObject)
        .subscribe((res: any) => {
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
          this.saveAsExcelFile(excelBuffer, 'demandes_qualifées');
        });
    }

    if (this.natureSelectedValue === 'nouvelle') {
      this.callServer
        .getDataStatsNouvelle(changesObject)
        .subscribe((res: any) => {
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
          this.saveAsExcelFile(excelBuffer, 'nouvelle_demandes');
        });
    }

    if (this.natureSelectedValue === 'evolan') {
      this.callServer
        .getDataStatsEvolan(changesObject)
        .subscribe((res: any) => {
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
          this.saveAsExcelFile(excelBuffer, 'demandes_envoyées_evolan');
        });
    }
  }

  private saveAsExcelFile(buffer: any, name: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      'reporting' +
      '_' +
      name +
      '_' +
      new Date().toLocaleDateString() +
      EXCEL_EXTENSION
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

  getNouvellesDemandes(offset, changesObject) {
    this.newOrdersService.getNouvellesDemandes(offset, changesObject).subscribe(
      (res: any) => {
        let personnes = res.results;


        this.displayedColumns = [
          'valeurid',
          'nom',
          
          'cin',
          'telgsm',
          'ville',
          'agence',
          'codeagence',
          'entry_date',
          'dateDeblocage',
          
          'montantdemande',
          'nbrappel',
          'resultatTraitement',
          'statuttraitement',
          'montantdebloque',
          'delay_trait',
          'options',
        ];

        this.dataLength = personnes.length;
        while (this.dataLength === 0 && this.offset != 0) {
          this.Previous();
        }
        this.dataSource = new MatTableDataSource(personnes);
        this.total =
          this.dataSource.data.length > 0 ? this.dataSource.data[0].nbr : 0;
        if (this.dataSource.data.length > 0) {
          if (this.dataSource.data[0].nbr % 10 !== 0) {
            this.nbr = Math.floor(this.dataSource.data[0].nbr / 10) + 1;
          } else {
            this.nbr = Math.floor(this.dataSource.data[0].nbr / 10);
          }
        }
        this.dataSourceToFilter = new MatTableDataSource(personnes);
        this.cdr.detectChanges();
        this.display = 'initial';
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (err) => (this.dataSource = null)
    );
  }

  getDemandesPrequalifies(offset, changesObject) {
    this.newOrdersService
      .getDemandesPrequalifies(offset, changesObject)
      .subscribe(
        (res: any) => {
          let personnes = res.msg;
          personnes.forEach((p) => {
            if (p.resultatTraitement==='Intéressé' && (!p.statuttraitement.endsWith('bloquée') && p.statuttraitement !=='Demande rejetée')){
              p.isSomethingElse = true
              console.log(p.resultatTraitement, p.statuttraitement);
              
            }
            if (p.dateupdate) {
              
              let dateupdate = new Date(p.dateupdate);
              let dateinsert = new Date(p.dateinsert);
              let dateDiff = Math.floor(
                -(dateinsert.getTime() - dateupdate.getTime()) /
                (1000 * 60 * 60 * 24)
              ); // in days
              p.delay_trait = dateDiff;
              let dateNow: any = new Date();
              let dateUpdate: any = new Date(p.dateupdate);
              let diffTime = Math.abs(dateNow - dateUpdate);
              let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays > 10) {
                p.en_retard = true
              }
            }
          });
          this.displayedColumns = [
            'valeurid',
            'nom',
            
            'cin',
            'telgsm',
            'ville',

            'agence',
            'codeagence',
            'emaildr',
            'emailds',
            'entry_date',
            'dateDeblocage',
            'dateinsert',
            
            'montantdemande',
            'nbrappel',
            'resultatTraitement',
            'qualification',
            'statuttraitement',
            'montantdebloque',
            'user',
            'delay_trait',
            'options',
          ];

          this.dataLength = personnes.length;
          while (this.dataLength === 0 && this.offset != 0) {
            this.Previous();
          }

          this.dataSource = new MatTableDataSource(personnes);
          this.total =
            this.dataSource.data.length > 0 ? this.dataSource.data[0].nbr : 0;
          if (this.dataSource.data.length > 0) {
            if (this.dataSource.data[0].nbr % 10 !== 0) {
              this.nbr = Math.floor(this.dataSource.data[0].nbr / 10) + 1;
            } else {
              this.nbr = Math.floor(this.dataSource.data[0].nbr / 10);
            }
          }

          this.dataSourceToFilter = new MatTableDataSource(personnes);
          this.cdr.detectChanges();
          this.display = 'initial';
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        },
        (err) => (this.dataSource = null)
      );
  }
  getDemandesQualifier(offset, changesObject) {
    this.newOrdersService.getDemandesQualifier(offset, changesObject).subscribe(
      (res: any) => {
        let personnes = res.results;
        personnes.forEach((p) => {
          if (p.resultatTraitement==='Intéressé' && (!p.statuttraitement.endsWith('bloquée') && p.statuttraitement !=='Demande rejetée')){
            p.isSomethingElse = true
            console.log(p.resultatTraitement, p.statuttraitement);
            
          }
          if (p.dateupdate) {
            
            let dateupdate = new Date(p.dateupdate);
            let dateinsert = new Date(p.dateinsert);
            let dateDiff = Math.floor(
              -(dateinsert.getTime() - dateupdate.getTime()) /
              (1000 * 60 * 60 * 24)
            ); // in days
            p.delay_trait = dateDiff;
          }
        });

        this.displayedColumns = [
          'valeurid',
          'nom',
          
          'cin',
          'telgsm',
          'ville',
          'agence',
          'codeagence',
          'emaildr',
          'emailds',
          'entry_date',
          'dateDeblocage',
          
          'montantdemande',
          'nbrappel',
          'resultatTraitement',
          'qualification',
          'statuttraitement',
          'montantdebloque',
          'user',
          'delay_trait',
          'options',
        ];

        this.dataLength = personnes.length;
        while (this.dataLength === 0 && this.offset != 0) {
          this.Previous();
        }
        this.dataSource = new MatTableDataSource(personnes);
        this.total =
          this.dataSource.data.length > 0 ? this.dataSource.data[0].nbr : 0;
        if (this.dataSource.data.length > 0) {
          if (this.dataSource.data[0].nbr % 10 !== 0) {
            this.nbr = Math.floor(this.dataSource.data[0].nbr / 10) + 1;
          } else {
            this.nbr = Math.floor(this.dataSource.data[0].nbr / 10);
          }
        }
        this.dataSourceToFilter = new MatTableDataSource(personnes);
        this.cdr.detectChanges();
        this.display = 'initial';
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (err) => (this.dataSource = null)
    );
  }
  getDemandesEvolan(offset, changesObject) {
    this.newOrdersService.getDemandesEvolan(offset, changesObject).subscribe(
      (res: any) => {
        let personnes = res.results;
        personnes.forEach((p) => {
          if (p.resultatTraitement==='Intéressé' && (!p.statuttraitement.endsWith('bloquée') && p.statuttraitement !=='Demande rejetée')){
            p.isSomethingElse = true
            console.log(p.resultatTraitement, p.statuttraitement);
            
          }
          if (p.dateupdate) {
            
            let dateupdate = new Date(p.dateupdate);
            let dateinsert = new Date(p.dateinsert);
            let dateDiff = Math.floor(
              -(dateinsert.getTime() - dateupdate.getTime()) /
              (1000 * 60 * 60 * 24)
            ); // in days
            p.delay_trait = dateDiff;
          }
        });

        this.displayedColumns = [
          'valeurid',
          'nom',
          
          'cin',
          'telgsm',
          'ville',
          'agence',
          'codeagence',
          'emaildr',
          'emailds',
          'entry_date',
          'dateDeblocage',
          
          'montantdemande',
          'nbrappel',
          'resultatTraitement',
          'qualification',
          'statuttraitement',
          'montantdebloque',
          'delay_trait',
          'options',
        ];

        this.dataLength = personnes.length;
        while (this.dataLength === 0 && this.offset != 0) {
          this.Previous();
        }
        this.dataSource = new MatTableDataSource(personnes);
        this.total =
          this.dataSource.data.length > 0 ? this.dataSource.data[0].nbr : 0;
        if (this.dataSource.data.length > 0) {
          if (this.dataSource.data[0].nbr % 10 !== 0) {
            this.nbr = Math.floor(this.dataSource.data[0].nbr / 10) + 1;
          } else {
            this.nbr = Math.floor(this.dataSource.data[0].nbr / 10);
          }
        }

        this.dataSourceToFilter = new MatTableDataSource(personnes);
        this.cdr.detectChanges();
        this.display = 'initial';
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      (err) => (this.dataSource = null)
    );
  }


  ngAfterViewInit() {

  }

  onChangeAll(btn) {
    this.pageNumber = 0;
    this.btn = btn;
    let act = this.btn;
    let source = this.natureSelectedValue;
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
      role: this.role,
      user: this.user,
      origins: this.origins,
      regions: this.regions,
      origine: this.origine,
      act: this.btn,
      mot_cle,
      statut_dem,
      resultat_prequalif,
      resultat_qualif,
      fromDate,
      toDate,
    };
    console.log(changesObject);
    this.offset = 0;
    const offset = this.offset;
    if (this.natureSelectedValue === 'nouvelle') {
      this.getNouvellesDemandes(offset, changesObject);
    } else if (this.natureSelectedValue === 'prequalifier') {
      this.getDemandesPrequalifies(offset, changesObject);
    } else if (this.natureSelectedValue === 'evolan') {
      this.getDemandesEvolan(offset, changesObject);
    } else if (this.natureSelectedValue === 'qualifier') {
      this.getDemandesQualifier(offset, changesObject);
    }
  }

  makeItFocused(e: any) {
    this.focused = e.tab.isActive;
  }

  send(personne): void {
    console.log('hola', personne.datenaissance);
    if (this.natureSelectedValue === 'nouvelle') {
      // check if locked
      let user = localStorage.getItem('role');
      let obj = {
        id: personne.id,
        user: user,
        nom: personne.nom,
        prenom: personne.prenom,
        telgsm: personne.telgsm,
        cin: personne.cin,
        origine: this.origine
      };
      this.callServer.lock(obj).subscribe(
        (res) => {
          console.log('hola', personne.datenaissance);
          const dialogRef = this.dialog.open(PersonneDetailsComponent, {
            width: "80vw",
            disableClose: true,
            data: {
              villes: this.villes,
              personne,
              source: this.natureSelectedValue,
              origine: this.origine,
              regions: this.regions
            },
          });

          dialogRef.afterClosed().subscribe((result) => {
            this.navigationChanged();
            console.log('The dialog was closed', result);
            if (result === 'nouvelle') {
              this.dataSource.data = this.dataSourceToFilter.data.filter(
                (e) => e.id != personne.id
              );
              this.dataSourceToFilter.data =
                this.dataSourceToFilter.data.filter((e) => e.id != personne.id);
            }
          });
        },
        (err) => {
          if (err.status && err.status === 505) {
            let snackBarRef = this.snackBar.open('lock failed!', 'OK', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            snackBarRef.onAction().subscribe(() => {
              snackBarRef.dismiss();
            });
          }
        }
      );
    } else {
      const dialogRef = this.dialog.open(PersonneDetailsComponent, {
        width: "80vw",
        disableClose: true,
        data: {
          villes: this.villes,
          personne,
          source: this.natureSelectedValue,
          origine: this.origine,
          regions: this.regions
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.navigationChanged();
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
  }

  // getStatut(numtiers, codegestionnaire) {
  //   let data = {
  //     numTier: numtiers,
  //     codeGest: codegestionnaire,
  //   };
  //   this.callServer.getStatus(data).subscribe(
  //     (res: any) => {
  //       console.log(res);
  //       this.isAlert = true;
  //       this.alert = res.EMP.Demande[0].statut;
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }
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
