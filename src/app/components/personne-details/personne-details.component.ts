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
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-personne-details',
  templateUrl: './personne-details.component.html',
  styleUrls: ['./personne-details.component.scss'],
})
export class PersonneDetailsComponent implements OnInit {
  personne: any;
  niveaux = [{ code: "1006", titre: "Aucun Justif formalise" }, { code: "1002", titre: "Auto entrepreneur" }];
  formejuridiques = [{ code: "J", titre: "Entrepreneur individuel " }, { code: "C", titre: "Société en nom collectif" }]
  agences: any;
  isAlert: boolean = false;
  alert: any;
  // logs: any;

  statusTraitement = [
    // { statut: 'Refus par l\'agence' },
    { statut: 'Erronée' },
    { statut: 'Intéressé' },
    { statut: 'Non intéressé' },
    { statut: 'Injoignable' },
    { statut: 'Intéressé plustard' },
  ];
  qualification = [
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
    { statut: 'Contrat annulée' },
    { statut: 'Contrat consolidé' },
    { statut: 'Sans_feedback' },
  ];
  historyDisplayedColumns = ["valeurid", "resultatTraitement", "user", "codegestionnairecible", "entry_date", "qualification", "statuttraitement"]
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
  isIntressed: boolean = false;
  isPretDeb: boolean = false;
  isCIntressed: boolean;
  origine: any;
  regions: any;
  history: MatTableDataSource<any>;

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
    this.origine = datafromdialog.origine;
    this.regions = datafromdialog.regions;
    console.log("datenaissance", datafromdialog.personne.datenaissance);
    this.callServer
      .getAnomalies(datafromdialog.personne.valeurid)
      .subscribe((res) => {
        console.log(res);
      });
    console.log('this is queryParams', this.personne.datenaissance);
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
    console.log('this is datenaissance', this.personne.datenaissance);
    if (this.personne.daterendezvous) {
      if (this.personne.daterendezvous.length === 10) {
        this.personne.daterendezvous = new Date(this.personne.daterendezvous.split('/')[2] + "/" + this.personne.daterendezvous.split('/')[1] + "/" + this.personne.daterendezvous.split('/')[0])
      } else
        this.personne.daterendezvous = new Date(this.personne.daterendezvous);
    }
    if (this.personne.datenaissance) {
      if (this.personne.datenaissance.length === 10) {
        this.personne.datenaissance = new Date(this.personne.datenaissance.split('/')[2] + "/" + this.personne.datenaissance.split('/')[1] + "/" + this.personne.datenaissance.split('/')[0])
      } else if (this.personne.datenaissance.length === 19) {
        this.personne.datenaissance = new Date(this.personne.datenaissance);
      } else {
        this.personne.datenaissance = ""
      }
    }
    if (this.personne.dateexpiration) {
      if (this.personne.dateexpiration.length === 10) {
        this.personne.dateexpiration = new Date(this.personne.dateexpiration.split('/')[2] + "/" + this.personne.dateexpiration.split('/')[1] + "/" + this.personne.dateexpiration.split('/')[0])
      } else
        this.personne.dateexpiration = new Date(this.personne.dateexpiration);
    }

    console.log('this is date rendez vous', this.personne.daterendezvous);
    console.log(this.personne.qualification, this.personne.resultatTraitement);

    if (this.personne.resultatTraitement === 'Intéressé') {
      console.log('intressed');
      this.isCIntressed = true;
    } else {
      console.log('not instressed');
      this.isCIntressed = false;
      // this.isIntressed = false;
    }
    if (this.personne.qualification === 'Prêt débloqué') {
      console.log('qualified to debloced');

      this.isPretDeb = true;
    } else {
      console.log('not qualified to debloced');

      this.isPretDeb = false;
    }
    this.form = this.fb.group({
      user: [this.personne.user],
      sendMe: [true],
      id: [this.personne.id],
      agence: [this.personne.agence],
      entry_date: [this.personne.entry_date],
      email: [this.personne.email],
      secteur: [this.personne.secteur],
      projet: [this.personne.projet],
      daterendezvous: [this.personne.daterendezvous],
      typeclient: [this.personne.typeclient],
      raisonsociale: [this.personne.raisonsociale],
      raisonsocialesuite: [this.personne.raisonsocialesuite],
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
      genre: [this.personne.genre],
      nom: [this.personne.nom],
      prenom: [this.personne.prenom],
      cin: [this.personne.cin],
      dateexpiration: [this.personne.dateexpiration],
      dateDeblocage: [this.personne.dateDeblocage],
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
      codeagence: [this.personne.origine = "AW" ? this.personne.codeagencecible : this.personne.codeagence],
      codegestionnaire: [this.personne.codegestionnaire],
      action: ['TEST'],
      canal: [this.origine == "RS" ? "107" : this.origine == "WB" ? "108" : this.origine == "AW" ? "115" : ""],
      codeagencecible: [this.personne.codeagencecible],
      codeorganisme: [this.origine == "RS" ? "RSS" : this.origine == "WB" ? "WEB" : this.origine == "AW" ? "AWB" : ""],
      origine: [this.origine],
      produit: [''],
      resultatTraitement: [this.personne.resultatTraitement],
      statuttraitement: [this.personne.statuttraitement],
      id_od: [this.personne.id],
      valeurid: [this.personne.valeurid],
      qualification: [this.personne.qualification],
      montantdebloque: [this.personne.montantdebloque],
    });
    this.form.valueChanges.subscribe((res) => {
      console.log(
        'form changed',
        this.form.value.qualification,
        this.form.value.resultatTraitement
      );

      let qualif = this.form.value.qualification;
      let trait = this.form.value.resultatTraitement;
      if (qualif === 'Prêt débloqué') {
        this.isPretDeb = true;
      } else {
        this.isPretDeb = false;
      }
      if (trait === 'Intéressé') {
        this.isIntressed = true;
      } else {
        this.isIntressed = false;
      }
    });
  }
  ngAfterViewInit() {
    let data2 = {
      valeurid: this.personne.valeurid
    }
    this.callServer.getHistory(data2).subscribe((res: any) => {

      this.history = new MatTableDataSource(res.result);


    })
    let data = {
      agence: this.personne.agence,
    };
    let dataville = {
      ville: this.personne.ville,
    };
    this.callServer.getAgences(dataville).subscribe(
      (resp: any) => {
        this.agences = resp.results;
        // this.callServer.getCodeAgence(data).subscribe(
        //   async (resp: any) => {
        //     this.villecodeagence =
        //       resp.results.length > 0 ? resp.results[0].codeagence : '';


        //     // this.personne.codepostal = codepostale[0].codePostale;
        //     //  this.personne.datecreation = this.personne.datecreation && new Date(this.personne.datecreation)
        //     //  this.personne.dateexpiration = this.personne.dateexpiration && new Date(this.personne.dateexpiration)
        //   },
        //   (err) => console.log(err)
        // );
      },
      (err) => console.log(err)
    );
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
    this.getCodePostal();

  }
  async getCodePostal() {
    console.log('getting code postale of :', this.personne.ville);
    let ville = this.personne.ville
    this.db.getCodePostaleByVille({ ville: ville }).subscribe((res: any) => {
      if (res.length > 0)
        this.form.patchValue({
          codepostal: res.codePostale,
        });
    }, err => console.log(err))
  }


  show() {
    console.log(this.form.value);
  }

  // getStatut(numtiers, codegestionnaire) {
  //   let data = {
  //     numTier: numtiers,
  //     codeGest: codegestionnaire,
  //   };
  //   this.callServer.getStatus(data).subscribe(
  //     (res: any) => {
  //       this.isAlert = true;
  //       this.alert = res.EMP.Demande[0].statut;
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }
  sendToEvolan() {
    let personne = this.form.value;
    console.log(personne);

    if (personne.datenaissance) {
      personne.datenaissance = moment(personne.datenaissance).format('DD/MM/YYYY')
    }
    if (personne.datecreation) {
      personne.datecreation = moment(personne.datecreation).format('DD/MM/YYYY')
    }
    if (personne.dateexpiration) {
      personne.dateexpiration = moment(personne.dateexpiration).format('DD/MM/YYYY')
    }
    if (personne.daterendezvous) {
      personne.daterendezvous = moment(personne.daterendezvous).format('DD/MM/YYYY')
    }
    if (personne.resultatTraitement) {
      if (personne.resultatTraitement === 'Intéressé') {
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
        console.log("situationfamiliale est:", personne.situationfamiliale, personne.situationfamiliale !== "C", personne.situationfamiliale !== "M", personne.situationfamiliale !== "C" || personne.situationfamiliale !== "M");

        if (personne.situationfamiliale !== "C" && personne.situationfamiliale !== "M") {
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
        if (personne.resultatTraitement === 'nouvelle') {
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
  retour(status): Promise<any> {
    let user = localStorage.getItem('role')
    if (!this.personne.valeurid) {
      let obj = {
        origine: this.origine,
        id: this.personne.id,
        user: user,
        nom: this.personne.nom,
        prenom: this.personne.prenom,
        telgsm: this.personne.telgsm,
        cin: this.personne.cin,
      };
      this.callServer.unlock(obj).subscribe((res) => {
        console.log('unlocked');
      }, (err) => {
        if (err.status && err.status === 505) {
          let snackBarRef = this.snackBar.open('unlock failed!', 'OK', { duration: 2000, horizontalPosition: 'center', verticalPosition: 'top' });
          snackBarRef.onAction().subscribe(() => {
            snackBarRef.dismiss()
          })
        }
      });
    }
    this.dialogRef.close(status);
    return new Promise((resolve, reject) => {
      resolve('');
    });
  }
  onNoClick(status): Promise<any> {
    this.dialogRef.close(status);
    return new Promise((resolve, reject) => {
      resolve('');
    });
  }
}
