import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DateAdapter } from '@angular/material/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CallServerService } from 'src/app/services/call-server.service';
import * as moment from 'moment/moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-personne-details',
  templateUrl: './personne-details.component.html',
  styleUrls: ['./personne-details.component.scss'],
})
export class PersonneDetailsComponent implements OnInit {
  personne = {
    numtiers:'',
    typeclient: '',
    raisonsociale: '',
    raisonsocialesuite: '',
    ice: '',
    rcommerce: '',
    nifiscale: '',
    numpattente: '',
    ribentreprise: '',
    formejuridique: '',
    telbureau: '',
    adresseentreprise: '',
    rueentreprise: '',
    quartierentreprise: '',
    codepostaleentreprise: '',
    villeentreprise: '',
    genre: '',
    nom: '',
    prenom: '',
    cin: '',
    adresse: '',
    rue: '',
    quartier: '',
    codepostal: '',
    ville: '',
    teldomicile: '',
    telgsm: '',
    telprofessionnel: '',
    situationfamiliale: '',
    numrib: '',
    niveauformalisme: '',
    montantdemande: '',
    montantdebloque: '',
    nombreecheance: '',
    codeagence: '',
    codegestionnaire: '',
    action: '',
    agence: '',
    emailcs: '',
    entry_date: '',
    email: '',
    secteur: '',
    projet: '',
    resultatTraitement: '',
    id: '',
    valeurid: '',
    gsmca: '',
    datenaissance: null,
    datecreation: null,
    dateexpiration: null,
    daterendezvous: null,
    qualification:''
  };
  agences: any;
  isAlert: boolean = false;
  alert: any;
  // logs: any;

  statusTraitement = [
    { statut: 'Refus par l\'agence' },
    { statut: 'Doublant' },
    { statut: 'Erronée' },
    { statut: 'Intéressé' },
    { statut: 'Non intéressé' },
    { statut: 'Non éligible' },
    { statut: 'Injoignable' },
    { statut: 'Intéressé plustard' },
  ];
  qualification = [
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
    { statut: 'Contrat annulée'},
    { statut: 'Client actif' },
    { statut: 'Sans_feedback' }
  ];
  url: any;
  urlca: any;
  url2: 'sip:0618265025';
  form: FormGroup;
  HintNom: string;
  isHintNom: boolean = false;
  HintNomAR: string;
  isHintNomAR: boolean = false;
  HintPrenom: string;
  isHintPrenom: boolean = false;
  HintPrenomAR: string;
  isHintPrenomAR: boolean = false;
  HintCIN: string;
  isHintCIN: boolean = false;
  HintSituationFamiliale: string;
  isHintSituationFamiliale: boolean = false;
  HintAdresse: string;
  isHintAdresse: boolean = false;
  HintAdresseAR: string;
  isHintAdresseAR: boolean = false;
  HintVille: string;
  isHintVille: boolean = false;
  HintVilleAR: string;
  isHintVilleAR: boolean = false;
  HintStatutTraitement: string;
  isHintStatutTraitement: boolean = false;
  HintGenre: string;
  isHintGenre: boolean = false;
  isHintCodeAgence: boolean = false;
  HintCodeAgence: string;
  villes: any;
  villecodeagence: any;
  isSettingEnded: boolean = false;
  // codeagence: any;
  isIntressed:boolean = false;
  isPretDeb: boolean = false;
  isCIntressed: boolean;

  constructor(
    public dialogRef: MatDialogRef<PersonneDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public datafromdialog,
    private router: Router,
    private snackBar: MatSnackBar,
    public callServer: CallServerService,
    public dialog: MatDialog,
    private dateadapter: DateAdapter<Date>,
    private activeRoute: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private db: DatabaseService
  ) {
    setTimeout(() => {
      this.isSettingEnded = true;
    }, 2000);
    this.dateadapter.setLocale('en-GB'); // dd/MM/YYYY
    this.villes = datafromdialog.villes;
    this.personne = datafromdialog.personne;
    this.getCodePostal();
    console.log('this is queryParams', this.personne);
    this.url = this.sanitizer.bypassSecurityTrustUrl(
      `sip:${this.personne.telgsm}`
    );
    this.urlca = this.sanitizer.bypassSecurityTrustUrl(
      `sip:${this.personne.gsmca}`
    );
  }
  getcodeagenes() {
    let data = {
      ville: this.form.value.ville,
    };
    this.callServer.getAgences(data).subscribe(
      (resp: any) => {
        this.agences = resp.results;
      },
      (err) => console.log(err)
    );
  }
  ngOnInit(): void {

    console.log('this is date rendez vous', this.personne.daterendezvous);
    if (this.personne.daterendezvous) {
      this.personne.daterendezvous = new Date(this.personne.daterendezvous);
    } 
    if (this.personne.datenaissance) {
      this.personne.datenaissance = new Date(this.personne.datenaissance);
    } 
    if (this.personne.dateexpiration) {
      this.personne.dateexpiration = new Date(this.personne.dateexpiration);
    } 
    console.log('this is date rendez vous', this.personne.daterendezvous);
    console.log(this.personne.qualification,this.personne.resultatTraitement );
    
    if (this.personne.resultatTraitement==="Intéressé"){
      console.log('intressed');
      this.isCIntressed = true;
    }else{
      console.log('not instressed');
      this.isCIntressed = false;
      // this.isIntressed = false;
    }
    if (this.personne.qualification === 'Prêt débloqué'){
      console.log('qualified to debloced');
      
      this.isPretDeb = true;
    }else{
      console.log('not qualified to debloced');
      
      this.isPretDeb = false;
    }
    this.form = this.fb.group({
      agence: [this.personne.agence],
      entry_date: [this.personne.entry_date],
      email: [this.personne.email],
      secteur: [this.personne.secteur],
      projet: [this.personne.projet],
      daterendezvous: [this.personne.daterendezvous],
      typeclient: ['P'],
      raisonsociale: [this.personne.raisonsociale],
      raisonsocialesuite: [''],
      ice: [this.personne.ice],
      rcommerce: [this.personne.rcommerce],
      nifiscale: [this.personne.nifiscale],
      numpattente: [this.personne.numpattente],
      datecreation: [this.personne.datecreation],
      ribentreprise: [this.personne.ribentreprise],
      formejuridique: [this.personne.formejuridique],
      telbureau: [this.personne.telbureau],
      adresseentreprise: [this.personne.adresseentreprise],
      rueentreprise: [this.personne.rueentreprise],
      quartierentreprise: [this.personne.quartierentreprise],
      codepostaleentreprise: [this.personne.codepostaleentreprise],
      villeentreprise: [this.personne.villeentreprise],
      genre: ['M.'],
      nom: [this.personne.nom],
      prenom: [this.personne.prenom],
      cin: [this.personne.cin],
      dateexpiration: [this.personne.dateexpiration],
      adresse: [this.personne.adresse],
      rue: [this.personne.rue],
      quartier: [this.personne.quartier],
      codepostal: [this.personne.codepostal],
      ville: [
        this.personne.ville.charAt(0).toUpperCase() +
          this.personne.ville.slice(1),
      ],
      teldomicile: [this.personne.teldomicile],
      telgsm: [this.personne.telgsm],
      telprofessionnel: [this.personne.telprofessionnel],
      datenaissance: [this.personne.datenaissance],
      situationfamiliale: [this.personne.situationfamiliale],
      numrib: [this.personne.numrib],
      niveauformalisme: ['1006'],
      montantdemande: [this.personne.montantdemande],
      nombreecheance: [this.personne.nombreecheance],
      codeagence: [this.personne.codeagence],
      codegestionnaire: ['RSS'],
      action: ['TEST'],
      canal: ['107'],
      codeagencecible: [''],
      codeorganisme: ['RS'],
      origine: ['RS'],
      produit: [''],
      statutTraitement: [this.personne.resultatTraitement],
      id_od: [this.personne.id],
      valeurid: [this.personne.valeurid],
      qualification:[this.personne.qualification],
      montantdebloque:[this.personne.montantdebloque]
    });
    this.form.valueChanges.subscribe((res)=>{
      console.log('form changed', this.form.value.qualification, this.form.value.statutTraitement);
      
      let qualif = this.form.value.qualification
      let trait = this.form.value.statutTraitement
      if (qualif === 'Prêt débloqué'){
        this.isPretDeb = true
      }else{
        this.isPretDeb = false
      }
      if (trait === 'Intéressé'){
        this.isIntressed = true
      }else{
        this.isIntressed=false
      }
    })
  }
  ngAfterViewInit() {

    let data = {
      agence: this.personne.agence,
    };
    let dataville = {
      ville: this.personne.ville,
    };
    this.callServer.getAgences(dataville).subscribe(
      (resp: any) => {
        this.agences = resp.results;
        this.callServer.getCodeAgence(data).subscribe(
          async (resp: any) => {
            this.villecodeagence =
              resp.results.length > 0 ? resp.results[0].codeagence : '';

            if (this.personne.datenaissance) {
              this.form.patchValue({
                datenaissance: new Date(this.personne.datenaissance),
              });
            }
            if (this.personne.datecreation) {
              this.form.patchValue({
                datecreation: new Date(this.personne.datecreation),
              });
            }
            if (this.personne.dateexpiration) {
              this.form.patchValue({
                dateexpiration: new Date(this.personne.dateexpiration),
              });
            }
            // this.personne.codepostal = codepostale[0].codePostale;
            //  this.personne.datecreation = this.personne.datecreation && new Date(this.personne.datecreation)
            //  this.personne.dateexpiration = this.personne.dateexpiration && new Date(this.personne.dateexpiration)
          },
          (err) => console.log(err)
        );
      },
      (err) => console.log(err)
    );
  }
  async getCodePostal() {
    console.log('getting code postale of :', this.personne.ville);
    let codepostale: any;
    if (this.personne.ville)
      codepostale = await this.db.getCodePostaleByVille(this.personne.ville);
    console.log(codepostale);
    if (codepostale && codepostale.length > 0)
      this.form.patchValue({
        codepostal: codepostale[0].codePostale,
      });
  }
  show() {
    console.log(this.form.value);
  }

  getStatut(numtiers, codegestionnaire) {
    let data = {
      numTier: numtiers,
      codeGest: codegestionnaire,
    };
    this.callServer.getStatus(data).subscribe(
      (res: any) => {
        this.isAlert = true;
        this.alert = res.EMP.Demande[0].statut;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  sendToEvolan() {
    let personne = this.form.value;
    if (personne.datenaissance) {
      personne.datenaissance = moment(personne.datenaissance).format('L');
    }
    if (personne.datecreation) {
      personne.datecreation = moment(personne.datecreation).format('L');
    }
    if (personne.dateexpiration) {
      personne.dateexpiration = moment(personne.dateexpiration).format('L');
    }
    if (personne.daterendezvous) {
      personne.daterendezvous = moment(personne.daterendezvous).format('L');
    }
    if (personne.statutTraitement) {
      if (personne.statutTraitement === 'Intéressé') {
        personne.action = 'REC';
        var arabicCharUnicodeRange = /[\u0600-\u06FF]/;
        if (!personne.nom) {
          console.log('le nom est obligatoire');
          this.HintNom = 'le nom est obligatoire';
          this.isHintNom = true;
          return;
        } else if (
          arabicCharUnicodeRange.test(
            String.fromCharCode(personne.nom.charCodeAt(0))
          )
        ) {
          this.HintNomAR = 'le nom doit être en francais';
          this.isHintNomAR = true;
          return;
        }
        if (!personne.prenom) {
          this.HintPrenom = 'le prenom est obligatoire';
          this.isHintPrenom = true;
          return;
        } else if (
          arabicCharUnicodeRange.test(
            String.fromCharCode(personne.prenom.charCodeAt(0))
          )
        ) {
          this.HintPrenomAR = 'le prenom doit être en francais';
          this.isHintPrenomAR = true;
          return;
        }
        if (!personne.genre) {
          this.HintGenre = 'le genre est obligatoire';
          this.isHintGenre = true;
          return;
        }
        if (!personne.cin) {
          this.HintCIN = 'le cin est obligatoire';
          this.isHintCIN = true;
          return;
        }
        if (!personne.situationfamiliale) {
          this.HintSituationFamiliale =
            'la situation familiale est obligatoire';
          this.isHintSituationFamiliale = true;
          return;
        }
        if (!personne.codeagence) {
          this.HintCodeAgence = "l'Agence est obligatoire";
          this.isHintCodeAgence = true;
          return;
        }
        if (!personne.adresse) {
          this.HintAdresse = "l'adresse est obligatoire";
          this.isHintAdresse = true;
          return;
        } else if (
          arabicCharUnicodeRange.test(
            String.fromCharCode(personne.adresse.charCodeAt(0))
          )
        ) {
          this.HintAdresseAR = "l'adresse doit être en francais";
          this.isHintAdresseAR = true;
          return;
        }
        if (!personne.ville) {
          this.HintVille = 'la ville est obligatoire';
          this.isHintVille = true;
          return;
        } else if (
          arabicCharUnicodeRange.test(
            String.fromCharCode(personne.ville.charCodeAt(0))
          )
        ) {
          this.HintVilleAR = 'la ville doit être en francais';
          this.isHintVilleAR = true;
          return;
        }
        this.isSettingEnded = false;
        console.log('recording...');
        this.callServer.sendToEvolan(personne).subscribe(
          (res: any) => {
            this.onNoClick(this.datafromdialog.source).then(() => {
              window.location.reload()
              let snackBarRef = this.snackBar.open(
                'Demande enregistrer avec ID :' + res.msg,
                'OK',
                {
                  duration: 15000,
                  horizontalPosition: 'center',
                  verticalPosition: 'bottom',
                  panelClass: 'successClassSnack',
                }
              );
              snackBarRef.onAction().subscribe(() => {
                snackBarRef.dismiss();
              });
            });
          },
          (err) => {
            if (err.status === 500) {
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
            } else {
              this.isSettingEnded = true;

              err.error.forEach((an) => {
                let snackBarRef = this.snackBar.open(
                  an.champ + an.anomalie,
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
              });
            }
          }
        );
      } else {
        if (personne.statutTraitement === 'nouvelle') {
          console.log('please insert a status');
          this.HintStatutTraitement = 'le statut de traitement est obligatoire';
          this.isHintStatutTraitement = true;
        } else {
          personne.action = 'TEST';
          this.isSettingEnded = false;
          console.log('recording...');
          this.callServer.sendToEvolan(personne).subscribe(
            (res: any) => {
              this.onNoClick(this.datafromdialog.source).then(() => {
                window.location.reload()
                let snackBarRef = this.snackBar.open(
                  'Demande enregistrer avec ID :' + res.msg,
                  'OK',
                  {
                    duration: 15000,
                    horizontalPosition: 'center',
                    verticalPosition: 'bottom',
                    panelClass: 'successClassSnack',
                  }
                );
                snackBarRef.onAction().subscribe(() => {
                  snackBarRef.dismiss();
                });
              });
            },
            (err) => {
              this.isSettingEnded = true;
              err.error.forEach((an) => {
                let snackBarRef = this.snackBar.open(
                  an.champ + an.anomalie,
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
              });
            }
          );
        }
      }
    } else {
      console.log('please insert a status');
      this.HintStatutTraitement = 'le statut de traitement est obligatoire';
      this.isHintStatutTraitement = true;
    }
  }
  onNoClick(status): Promise<any> {
    this.dialogRef.close(status);
    return new Promise((resolve, reject) => {
      resolve('');
    });
  }
}
