import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DateAdapter } from '@angular/material/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CallServerService } from 'src/app/services/call-server.service';
import { DialogSecondComponent } from '../dialog-second/dialog-second.component';
import { DialogComponent } from '../dialog/dialog.component';
import { ResultatTraitementComponent } from '../resultat-traitement/resultat-traitement.component';
import * as moment from 'moment/moment';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-personne-details',
  templateUrl: './personne-details.component.html',
  styleUrls: ['./personne-details.component.scss'],
})
export class PersonneDetailsComponent implements OnInit {
  personne: any;
  // personneREC = {
  // typeclient: "M",
  // raisonsociale: "WhoAmI",
  // raisonsocialesuite: "",
  // ice: "3003003033",
  // rcommerce: "3003003033",
  // nifiscale: "3003003033",
  // numpattente: "3003003033",
  // datecreation: "04/04/2006",
  // ribentreprise: "350810000000000057561622",
  // formejuridique: "B",
  // telbureau: "0667647353",
  // adresseentreprise: "rue avenue ville pays",
  // rueentreprise: "rue",
  // quartierentreprise: "quartier",
  // codepostaleentreprise: "10000",
  // villeentreprise: "ville",
  // genre: "M.",
  // nom: "Radouan",
  // prenom: "FARAH",
  // cin: "TH2021",
  // dateexpiration: "01/01/2025",
  // adresse: "rue avenue ville pays",
  // rue: "rue",
  // quartier: "quartier",
  // codepostal: "10000",
  // ville: "ville",
  // teldomicile: "0638373737",
  // telgsm: "0638373734",
  // telprofessionnel: "0638373737",
  // datenaissance: "01/01/1995",
  // situationfamiliale: "M",
  // numrib: "350810000000000057561622",
  // niveauformalisme: 1001,
  // montantdemande: "10000",
  // nombreecheance: "12",
  // codeagence: "0002",
  // codegestionnaire: "AWB",
  // action: "REC"
  // }
  agences: any;
  isAlert: boolean = false;
  alert: any;
  // logs: any;

  statusTraitement = [
    { statut: 'Hors zone agence' },
    { statut: 'Erronée' },
    { statut: 'Intéressé' },
    { statut: 'Non intéressé' },
    { statut: 'Non éligible' },
    { statut: 'Injoignable' },
    { statut: 'Intéressé plustard'},
  ];
  url: any;
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
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    public callServer: CallServerService,
    public dialog: MatDialog,
    private dateadapter: DateAdapter<Date>,
    private activeRoute: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder // private server:CallServerService
  ) {
    setTimeout(() => {
      this.isSettingEnded = true
    }, 2000);
    this.dateadapter.setLocale('en-GB'); // dd/MM/YYYY
    this.activeRoute.data.subscribe((respp) => {
      this.villes = respp.villes.results;
      console.log(respp);
    });
    this.activeRoute.queryParams.subscribe((res) => {
      this.personne = res;
      let data = {
        agence: res.agence,
      };
      let dataville = {
        ville: res.ville,
      };
      this.callServer.getAgences(dataville).subscribe(
        (resp: any) => {
          this.agences = resp.results;
          console.log(this.agences);
          this.callServer.getCodeAgence(data).subscribe(
            (resp: any) => {
              console.log(resp.results);
              this.villecodeagence =
                resp.results.length > 0 ? resp.results[0].codeagence : '';
              let datenaissance;
              let datecreation;
              let dateexpiration;
              if (this.personne.datenaissance) {
                datenaissance = new Date(this.personne.datenaissance);
              }
              if (this.personne.datecreation) {
                datecreation = new Date(this.personne.datecreation);
              }
              if (this.personne.dateexpiration) {
                dateexpiration = new Date(this.personne.dateexpiration);
              }

              //  this.personne.datecreation = this.personne.datecreation && new Date(this.personne.datecreation)
              //  this.personne.dateexpiration = this.personne.dateexpiration && new Date(this.personne.dateexpiration)
              this.url = this.sanitizer.bypassSecurityTrustUrl(
                `sip:${this.personne.telgsm}`
              );
              console.log(this.personne.agence);
              console.log(this.personne.ville);
              console.log(this.personne.codePostal);

              this.form = this.fb.group({
                email:[this.personne.email],
                secteur:[this.personne.secteur],
                projet:[this.personne.projet],
                daterendezvous:[null],
                typeclient: ['P'],
                raisonsociale: [this.personne.raisonsociale],
                raisonsocialesuite: [''],
                ice: [this.personne.ice],
                rcommerce: [this.personne.rcommerce],
                nifiscale: [this.personne.nifiscale],
                numpattente: [this.personne.numpattente],
                datecreation: [datecreation],
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
                dateexpiration: [dateexpiration],
                adresse: [this.personne.adresse],
                rue: [this.personne.rue],
                quartier: [this.personne.quartier],
                codepostal: [this.personne.codePostal],
                ville: [res.ville],
                teldomicile: [this.personne.teldomicile],
                telgsm: [this.personne.telgsm],
                telprofessionnel: [this.personne.telprofessionnel],
                datenaissance: [datenaissance],
                situationfamiliale: [this.personne.situationfamiliale],
                numrib: [this.personne.numrib],
                niveauformalisme: ['1006'],
                montantdemande: [this.personne.montantdemande],
                nombreecheance: [this.personne.nombreecheance],
                codeagence: [this.villecodeagence],
                codegestionnaire: ['RSS'],
                action: ['TEST'],
                canal: ['106'],
                codeagencecible: [''],
                codeorganisme: ['RS'],
                origine: ['RS'],
                produit: [''],
                statutTraitement: [this.personne.resultatTraitement],
                id_od: [this.personne.id],
                valeurid:[this.personne.valeurid]
              });
            },
            (err) => console.log(err)
          );
        },
        (err) => console.log(err)
      );
    });
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
    // console.log(this.personne);
  }
  show() {
    console.log(this.form.value);
  }
  openDialog(valeurid): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '350px',
      data: { agences: this.agences },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
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
            alert('successfuly set');
          } else alert('error');
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
            alert('successfully set');
          } else alert('error');
        }
      );
    });
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
    console.log(personne);
    if (personne.datecreation) {
      personne.datecreation = moment(personne.datecreation).format('L');
    }
    if (personne.dateexpiration) {
      personne.dateexpiration = moment(personne.dateexpiration).format('L');
    }
    if (personne.datenaissance) {
      personne.datenaissance = moment(personne.datenaissance).format('L');
    }
    if (personne.statutTraitement) {
      if (personne.statutTraitement === 'Intéressé') {
        personne.action = 'REC';
        var arabicCharUnicodeRange = /[\u0600-\u06FF]/;
        console.log('rec');
        if (!personne.nom) {      
          this.HintNom = 'le nom est obligatoire';
          this.isHintNom = true;
        } else if (personne.nom){
          var key = personne.nom.charCodeAt(0);
          var str = String.fromCharCode(key);
          if ( arabicCharUnicodeRange.test(str) ){
            this.HintNomAR = 'le nom doit être en francais';
            this.isHintNomAR= true;
          }   
        } 
        else if (!personne.prenom) {
          console.log('rec');
          this.HintPrenom = 'le prenom est obligatoire';
          this.isHintPrenom = true;
        } else if (personne.prenom){
          var key = personne.prenom.charCodeAt(0);
          var str = String.fromCharCode(key);
          if ( arabicCharUnicodeRange.test(str) ){
            this.HintPrenomAR = 'le prenom doit être en francais';
            this.isHintPrenomAR= true;
          }  
        } 
        else if (!personne.genre) {
          console.log('rec');

          this.HintGenre = 'le genre est obligatoire';
          this.isHintGenre = true;
        } else if (!personne.cin) {
          console.log('rec');

          this.HintCIN = 'le cin est obligatoire';
          this.isHintCIN = true;
        } else if (!personne.situationfamiliale) {
          console.log('rec');

          this.HintSituationFamiliale =
            'la situation familiale est obligatoire';
          this.isHintSituationFamiliale = true;
        } else if (!personne.codeagence) {
          console.log('rec');
          this.HintCodeAgence = 'le Code Agence est obligatoire';
          this.isHintCodeAgence = true;
        } else if (!personne.adresse) {
          console.log('rec');
          this.HintAdresse = "l'adresse est obligatoire";
          this.isHintAdresse = true;
        }else if(personne.adresse){
          var key = personne.adresse.charCodeAt(0);
          var str = String.fromCharCode(key);
          if ( arabicCharUnicodeRange.test(str) ){
            this.HintAdresseAR = 'l\'adresse doit être en francais';
            this.isHintAdresseAR= true;
          }  
        } 
        else if (!personne.ville) {
          console.log('rec');
          this.HintVille = 'la ville est obligatoire';
          this.isHintVille = true;
        }else if(personne.ville){
          var key = personne.ville.charCodeAt(0);
          var str = String.fromCharCode(key);
          if ( arabicCharUnicodeRange.test(str) ){
            this.HintVilleAR = 'la ville doit être en francais';
            this.isHintVilleAR= true;
          }  
        } 
        else {
          console.log('rec');
    this.isSettingEnded = false;

          this.callServer.sendToEvolan(personne).subscribe(
            (res: any) => {
              this.router.navigate(['home']).then(() => {
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
      } else {
        if (personne.statutTraitement === 'nouvelle') {
          console.log('please insert a status');
          this.HintStatutTraitement = 'le statut de traitement est obligatoire';
          this.isHintStatutTraitement = true;
        } else {
          personne.action = 'TEST';
    this.isSettingEnded = false;

          this.callServer.sendToEvolan(personne).subscribe(
            (res: any) => {


              this.router.navigate(['home']).then(() => {
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

  openDialogResultatTraitement(valeurid): void {
    const dialogRef = this.dialog.open(ResultatTraitementComponent, {
      width: '350px',
      data: this.statusTraitement,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      let data = {
        resultatTraitement: result,
        valeurid,
      };
      this.callServer.setResutlatTraitement(data).subscribe(
        (res) => {
          this.alert('successfully sent');
        },
        (err) => {
          this.alert('error');
        }
      );
    });
  }
}
