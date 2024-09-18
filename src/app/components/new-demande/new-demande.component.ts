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
import { AgenceDataService } from 'src/app/services/agenceData.service';

@Component({
  selector: 'app-new-demande',
  templateUrl: './new-demande.component.html',
  styleUrls: ['./new-demande.component.scss']
})
export class NewDemandeComponent implements OnInit {
  personne: any;
  typeclient: any = "P";
  niveaux = [{ code: "1001", titre: "INSCRIT AU REGISTRE DE COMMERCE" }, { code: "1002", titre: "Auto Entrepreneur" }, { code: "1003", titre: "Assujiti Taxe PRO" }, { code: "1004", titre: "Inscrit Registre PRO" }, { code: "1005", titre: "Agrement Pro" }, { code: "1006", titre: "Aucun Justif Formalisme" }];
  formejuridiques = [{ code: "B", titre: "Entrepreneur individuel" }, { code: "C", titre: "Société en nom collectif" }, { code: "D", titre: "Société en commandite simple" }, { code: "E", titre: "Association ou sté en participation" }, { code: "F", titre: "Société anonyme" }, { code: "G", titre: "Société en commandite par action" }, { code: "H", titre: "Société à responsabilté limitée" }, { code: "I", titre: "S.A.R.L. d'associé unique" }, { code: "J", titre: "Société coopérative" }, { code: "K", titre: "Société civile" }, { code: "M", titre: "Société de fait" }]
  agences: any[];
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
    { statut: 'Contrat annulé' },
    { statut: 'Contrat consolidé' },
    { statut: 'Sans_feedback' },
  ];
  historyDisplayedColumns = ["valeurid", "resultatTraitement", "user", "codegestionnairecible", "entry_date", "qualification", "statuttraitement"]
  annomalieDisplayedColumns = ["champ", "anomalie"]
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
  origine: any = "AA";
  regions: any;
  history: MatTableDataSource<any>;
  adresse: string = "";
  annomalies: MatTableDataSource<any>;
  activities: any;
  messageExistant: string = '';
  role: string;
  isAgent: boolean;
  origins: string;
  isRIFSO: boolean;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    public callServer: CallServerService,
    public dialog: MatDialog,
    private dateadapter: DateAdapter<Date>,
    private activeRoute: ActivatedRoute,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private db: DatabaseService,
    private agenceDataService: AgenceDataService
  ) {
    this.dateadapter.setLocale('en-GB'); // dd/MM/YYYY
    this.agenceDataService.geVilles().subscribe((respp: any) => {
      this.villes = respp.results;
    });



    this.role = localStorage.getItem('role');
    if (this.role.startsWith("AGT")) {
      this.isAgent = true;
    }
    this.origins = localStorage.getItem('origins');

    if (this.origins.includes("RIFSO")) {
      this.isRIFSO = true
    }
  }
  getcodeagenes() {
    this.adresse = ''

    let data = {
      ville: this.form.value.ville,
    };
    this.callServer.getAgences(data).subscribe(
      (resp: any) => {
        this.agences = resp.results;
        if (data.ville.toUpperCase() === "RABAT" && !this.isRIFSO) {
          this.agences = this.agences.filter(agence => agence.codeagence !== "SG");
        }
      },
      (err) => console.log(err)
    );
  }

  getActivities() {
    this.callServer.getActivities().subscribe(
      (results: any) => {
        this.activities = results;
      },
      (err) => console.log(err)
    );
  }
  getSecteur() {
    let codeActivite = this.form.controls['codeActivite'].value
    let secteurPart = this.activities.filter(el => el.code == codeActivite)
    this.form.patchValue({
      secteur: secteurPart[0].secteur,
    });
  }
  ngOnInit(): void {
    this.getActivities()
    let codeorganisme = this.origine == "RS" ? "AAA" : this.origine == "WB" ? "AAA" : this.origine == "AW" ? "AWB" : "";
    let canal = this.origine == "RS" ? "107" : this.origine == "WB" ? "108" : this.origine == "AW" ? "115" : ""

    this.form = this.fb.group({
      user: [""],
      sendMe: [true],
      id: [null],
      agence: [""],
      entry_date: [null],
      email: [null],
      secteur: [null],
      projet: [null],
      daterendezvous: [null],
      typeclient: ["P"],
      raisonsociale: [null],
      raisonsocialesuite: [null],
      ice: [null],
      rcommerce: [null],
      nifiscale: [null],
      numpattente: [null],
      datecreation: [null],
      ribentreprise: [null],
      formejuridique: [null],
      telbureau: [null],
      adresseentreprise: [null],
      rueentreprise: [null],
      quartierentreprise: [null],
      codepostaleentreprise: [null],
      villeentreprise: [null],
      genre: [null],
      nom: [null],
      prenom: [null],
      cin: [null],
      dateexpiration: [null],
      dateDeblocage: [null],
      adresse: [null],
      rue: [null],
      quartier: [null],
      codepostal: [null],
      ville: [null],
      teldomicile: [null],
      telgsm: [null],
      telprofessionnel: [null],
      datenaissance: [null],
      situationfamiliale: [null],
      numrib: [null],
      niveauformalisme: [null],
      partfemme: [null],
      montantdemande: [null],
      nombreecheance: [null],
      codeagence: [null],
      codegestionnaire: [null],
      action: [null],
      canal: [null],
      codeagencecible: [null],
      codeorganisme: [null],
      origine: [null],
      produit: [null],
      resultatTraitement: [null],
      statuttraitement: [null],
      id_od: [null],
      valeurid: [null],
      qualification: [null],
      montantdebloque: [null],
      codeTribunal: [null],
      // *********************Champs pour RIFSO *************
      //************************************************************************/
      codeActivite: [null],
      typeLocal: [null],
      effectif: [null],
      dateFinPrlvmt: [null],
      DateRealisation: [null],
      chiffreAffaire: [null],
      numeroContract: [null],
      //************************************************************************/
    });
    this.form.valueChanges.subscribe((res) => {
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
  agenceChange() {
    let agence = this.form.controls['codeagence'].value
    let adressePart = this.agences.filter(el => el.codeagence == agence)
    this.adresse = adressePart[0].adresse
  }
  ngAfterViewInit() {
  }

  sendToEvolan() {
    let personne = this.form.value;
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

    personne.action = 'REC';
    var arabicCharUnicodeRange = /[\u0600-\u06FF]/;
    if (!personne.nom) {
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
    // this.callServer.nouvelle_demande(personne).subscribe(
    //   (res: any) => {
    //     let snackBarRef = this.snackBar.open(
    //       'Demande enregistrer avec ID :' + res.msg,
    //       'OK',
    //       {
    //         duration: 15000,
    //         horizontalPosition: 'center',
    //         verticalPosition: 'bottom',
    //         panelClass: 'successClassSnack',
    //       }
    //     );
    //     snackBarRef.onAction().subscribe(() => {
    //       snackBarRef.dismiss();
    //     });
    //   },
    //   (err) => {
    //     if (err.status === 500) {
    //       let snackBarRef = this.snackBar.open(
    //         'une erreur est survenue, veuillez réessayer plustard',
    //         'OK',
    //         {
    //           duration: 15000,
    //           horizontalPosition: 'center',
    //           verticalPosition: 'top',
    //         }
    //       );
    //       snackBarRef.onAction().subscribe(() => {
    //         snackBarRef.dismiss();
    //       });
    //     } else {
    //       this.isSettingEnded = true;
    //       console.log(err)
    //       err.error.forEach((an) => {
    //         let snackBarRef = this.snackBar.open(
    //           an.champ + an.anomalie,
    //           'OK',
    //           {
    //             duration: 15000,
    //             horizontalPosition: 'center',
    //             verticalPosition: 'top',
    //           }
    //         );
    //         snackBarRef.onAction().subscribe(() => {
    //           snackBarRef.dismiss();
    //         });
    //       });
    //     }
    //   }
    // );
  }
}
