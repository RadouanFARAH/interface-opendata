import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

export interface Dossier {
  numTier: string;
  numDossier: number;
  nom: string;
  prenom: string;
  valeurID: number;
  nomErreur: number;
}

const ELEMENT_DATA: Dossier[] = [
  {
    numTier: '0001',
    numDossier: 1,
    nom: 'farah',
    prenom: 'radouan',
    valeurID: 110,
    nomErreur: 0,
  },
  {
    numTier: '0002',
    numDossier: 2,
    nom: 'baddou',
    prenom: 'ayoub',
    valeurID: 21,
    nomErreur: 5,
  },
  {
    numTier: '0003',
    numDossier: 3,
    nom: 'bouziane',
    prenom: 'ismail',
    valeurID: 134,
    nomErreur: 1,
  },
];
@Component({
  selector: 'app-personne-physique',
  templateUrl: './personne-physique.component.html',
  styleUrls: ['./personne-physique.component.scss'],
})
export class PersonnePhysiqueComponent implements OnInit {
  person!: FormGroup;
  hideRequiredControl = new FormControl(false);
  floatLabelControl = new FormControl('auto');
  status = [
    { value: '', viewValue: 'Tous' },
    { value: 'encours', viewValue: 'En Cours' },
    { value: 'valide', viewValue: 'Validé' },
    { value: 'rejete', viewValue: 'Rejeté' },
    { value: 'decaisse', viewValue: 'Decaissé' },
  ];
  genres = [
    { value: 'M.', viewValue: 'Monsieur' },
    { value: 'MME', viewValue: 'Madame' },
  ];
  formalismes = [
    {
      value: '1001',
      viewValue: 'INSCRIT AU REGISTRE DE COMMERCE',
    },
    {
      value: '1003',
      viewValue: 'ASSUJETTI A LA TAXE PROFESSIONNELLE',
    },
    {
      value: '1004',
      viewValue: 'INSCRIT DANS DES REGISTRES PROFESSIONNELS',
    },
    {
      value: '1005',
      viewValue: 'AGRÉMENT PROFESIONNEL',
    },
    {
      value: '1006',
      viewValue: 'AUCUN JUSTIF FORMALISE',
    },
    {
      value: '1002',
      viewValue: 'AUTO ENTREPRENEUR',
    },
  ];
  situations = [
    {
      value: 'C',
      viewValue: 'Célibataire',
    },
    {
      value: 'M',
      viewValue: 'Marié(e)',
    },
    {
      value: 'D',
      viewValue: 'Divorcé(e)',
    },
    {
      value: 'V',
      viewValue: 'Veuf(ve)',
    },
  ];
  selectedValue: string = '';
  selectedValueSearch!: string;
  displayedColumns: string[] = [
    'numTier',
    'numDossier',
    'nom',
    'prenom',
    'valeurID',
    'nomErreur',
  ];
  dataSource = new MatTableDataSource(ELEMENT_DATA);
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  focused: boolean = false;
  statutMessage: string = 'votre statut';
  uploadedFile: any;
  showSpinner: boolean = false;
  color: boolean;
  message: string;
  constructor(fb: FormBuilder) {
    this.person = fb.group({
      genre: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      cin: ['', Validators.required],
      dateExpiration: ['', Validators.required],
      adresse: ['', Validators.required],
      rue: ['', Validators.required],
      quartier: ['', Validators.required],
      ville: ['', Validators.required],
      codePostale: ['', Validators.required],
      teleDomicile: ['', Validators.required],
      teleGSM: ['', Validators.required],
      teleProfessionel: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      situationFamiliale: ['', Validators.required],
      rib: ['', [Validators.nullValidator, Validators.required]],
      niveauFormalisme: ['', Validators.required],
      montantDemande: ['', Validators.required],
      nombreEcheances: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

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
  registerPerson() {
    console.log(this.person.value);
  }
  keyDownFunction(event: any) {
    if (event.keyCode == 13) {
      this.searchByCode();
    }
  }

  searchByCode() {
    console.log(this.selectedValueSearch);
  }

  // showUploadedFile(){
  //   let item:string = this.uploadedFile
  //   var type = item.slice(item.lastIndexOf('.')+1);
  //   if (type !== 'csv') {
  //     alert('not a csv file')
  //   }
  // }

  uploadFile(e: any) {
    try {
      this.showSpinner = true;
      let item: string = this.uploadedFile;
      var type = item.slice(item.lastIndexOf('.') + 1);
      if (type === 'csv') {
        //do stuff
        let file = e.target.files[0];
  
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onloadend = () => {
          let resultedCSV: string | ArrayBuffer = reader.result;
          let arrayoflines = resultedCSV.toString();
          let AllLines = arrayoflines.split('\n');
          let headers = AllLines.shift().split(',');
          if (headers.length === 2) {
            //do stuff
            let DataLines = AllLines;
            let arr = [];
            for (let i = 0; i < DataLines.length; i++) {
              if (DataLines[i].split(',').length === 2) {
                //do stuff
                arr.push({
                  status: DataLines[i].split(',')[0],
                  valeurID: DataLines[i].split(',')[1],
                });
              } else {
                //do not do stuff
                this.showSpinner = false;
                this.message = "Votre fichier n'est pas valide";
                this.color = true;
                this.uploadedFile = ''
              }
            }
            this.showSpinner = false;
            this.message = 'Votre fichier est valide';
            this.color = false;
            this.uploadedFile = ''
            // do something with the array
          } else {
            //do not do stuff
            this.showSpinner = false;
            this.message = "Votre fichier n'est pas valide";
            this.color = true;
            this.uploadedFile = ''
          }
        };
      } else {
        //do not do stuff
        this.showSpinner = false;
        this.message = "Votre fichier n'est pas valide";
        this.color = true;
        this.uploadedFile = ''
      }
    } catch (e) {
      this.showSpinner = false;
      this.message = "Votre fichier n'est pas valide";
      this.color = true;
      this.uploadedFile = ''
    }
  }


  
}
