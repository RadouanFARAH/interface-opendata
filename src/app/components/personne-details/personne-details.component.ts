import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  niveaux = [{ code: "1001", titre: "INSCRIT AU REGISTRE DE COMMERCE" },
  { code: "1002", titre: "Auto Entrepreneur" },
  { code: "1003", titre: "Assujiti Taxe PRO" },
  { code: "1004", titre: "Inscrit Registre PRO" },
  { code: "1005", titre: "Agrement Pro" },
  { code: "1006", titre: "Aucun Justif Formalisme" }];

  formejuridiques = [{ code: "B", titre: "Entrepreneur individuel" },
  { code: "C", titre: "Société en nom collectif" },
  { code: "D", titre: "Société en commandite simple" },
  { code: "E", titre: "Association ou sté en participation" },
  { code: "F", titre: "Société anonyme" },
  { code: "G", titre: "Société en commandite par action" },
  { code: "H", titre: "Société à responsabilté limitée" },
  { code: "I", titre: "S.A.R.L. d'associé unique" },
  { code: "J", titre: "Société coopérative" },
  { code: "K", titre: "Société civile" },
  { code: "M", titre: "Société de fait " }]
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
  genres = [{ code: "M.", view: "Homme" }, { code: "MME", view: "Femme" }];
  situations = [{ code: "M", view: "Marié" }, { code: "C", view: "Célibataire" }]
  historyDisplayedColumns = ["resultatTraitement", "user", "codegestionnairecible", "entry_date", "statuttraitement"]
  annomalieDisplayedColumns = ["champ", "anomalie"]
  url: any;
  urlca: any;
  url2: 'sip:0618265025';
  form: FormGroup;
  HintNom: string;
  HintNomAR: string;
  isHintNomAR: boolean = false;
  isHintNom: boolean = false;
  isHintPrenom: boolean = false;
  isHintPrenomAR: boolean = false;
  isHintCIN: boolean = false;
  isHintSituationFamiliale: boolean = false;
  isHintAdresse: boolean = false;
  isHintAdresseAR: boolean = false;
  isHintVille: boolean = false;
  isHintVilleAR: boolean = false;
  isHintStatutTraitement: boolean = false;
  isHintGenre: boolean = false;
  isHintCodeAgence: boolean = false;
  isHintdatenaissance: boolean;
  isHintdatecreation: boolean;
  isHintformejuridique: boolean;
  isHintadresseentreprise: boolean;
  isHintadresseentrepriseAR: boolean;
  isHintraisonsociale: boolean;
  isHinttelgsm: boolean;
  isHintRC: boolean;
  isHintRIB: boolean;
  isHintICE: boolean;

  Hintadresseentreprise: string;


  isSettingEnded: boolean = false;

  HintPrenom: string;
  HintPrenomAR: string;
  HintCIN: string;
  HintSituationFamiliale: string;
  HintAdresse: string;
  HintAdresseAR: string;
  HintVille: string;
  HintVilleAR: string;
  HintStatutTraitement: string;
  HintGenre: string;
  HintCodeAgence: string;
  villes: any;
  villecodeagence: any;
  // codeagence: any;
  isIntressed: boolean = false;
  isPretDeb: boolean = false;
  isCIntressed: boolean;
  origine: any;
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
  user: string;
  Hintdatenaissance: string;
  Hintdatecreation: string;
  Hintformejuridique: string;
  HintRIB: string;
  HintRC: string;
  HintICE: string;
  source: any;




  HintadresseentrepriseAR: string;
  Hintraisonsociale: string;
  Hinttelgsm: string;

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
    }, 1000);
    this.dateadapter.setLocale('en-GB'); // dd/MM/YYYY
    this.villes = datafromdialog.villes;
    this.personne = datafromdialog.personne;

    if (!this.personne) {
      this.personne = {};
      // this.personne.resultatTraitement = 'nouvelle';
      this.personne.creation = 'YES'
      this.personne.typeclient = 'P'
    }
    const organismes = localStorage.getItem('organismes')
    this.source = JSON.parse(organismes)
    let origins = localStorage.getItem('origins')
    let origin = origins.split(',')[0]
    this.origine = datafromdialog.origine ? datafromdialog.origine : origin;
    this.regions = datafromdialog.regions;
    this.url = this.sanitizer.bypassSecurityTrustUrl(
      `sip:${this.personne ? this.personne.telgsm : null}`
    );
    this.urlca = this.sanitizer.bypassSecurityTrustUrl(
      `sip:${this.personne ? this.personne.gsmca : null}`
    );
    let data_to_send = {
      source: datafromdialog.source,
      cin: datafromdialog.personne ? datafromdialog.personne.cin : null,
      valeurid: datafromdialog.personne ? datafromdialog.personne.valeurid : null,
      telgsm: datafromdialog.personne ? datafromdialog.personne.telgsm : null,
      nom: datafromdialog.personne ? datafromdialog.personne.nom : null,
      prenom: datafromdialog.personne ? datafromdialog.personne.prenom : null,
      typeclient: datafromdialog.personne ? datafromdialog.personne.typeclient : 'P'
    }
    if (this.datafromdialog.personne) {
      this.callServer.checkExistants(data_to_send).subscribe((obj: any) => {
        if (obj.length > 0) {
          this.messageExistant = `Ce prospect possède déja une demande encours avec le statut : ${obj[0].statuttraitement} daté en ${obj[0].entry_date} (${obj[0].user})`
          if (datafromdialog.personne?.resultatTraitement === 'Injoignable') {
            this.callServer.updateResultatTraitement(data_to_send).subscribe((obj: any) => {
              this.onNoClick(this.datafromdialog.source).then(() => { })
            }, (err) => {
              console.log(err);
            })
          }
        }
      })
    }
    this.role = localStorage.getItem('role');
    if (this.role.startsWith("AGT")) {
      this.isAgent = true;
    }
    this.origins = localStorage.getItem('origins');
    if (this.origins.includes("RIFSO")) {
      this.isRIFSO = true
    }
  }
  getcodeagenesP(typeclient) {
    if (typeclient === 'P') {
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
          if (this.form.value.codeagence) {
            let adressePart = this.agences.filter(el => el.codeagence == this.form.value.codeagence)
            this.adresse = adressePart[0].adresse
          }

        },
        (err) => console.log(err)
      );
    } else {

    }

  }
  getcodeagenesM(typeclient) {
    if (typeclient === 'P') {

    } else {
      this.adresse = ''
      let data = {
        ville: this.form.value.villeentreprise,
      };
      this.callServer.getAgences(data).subscribe(
        (resp: any) => {
          this.agences = resp.results;
          if (data.ville.toUpperCase() === "RABAT" && !this.isRIFSO) {
            this.agences = this.agences.filter(agence => agence.codeagence !== "SG");
          }
          let adressePart = this.agences.filter(el => el.codeagence == this.form.value.codeagence)
          this.adresse = adressePart[0].adresse
        },
        (err) => console.log(err)
      );
    }
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

    if (this.personne && !this.isEmpty(this.personne)) {
      if (this.personne?.daterendezvous) {
        if (this.personne?.daterendezvous.length === 10) {
          this.personne.daterendezvous = new Date(this.personne?.daterendezvous.split('/')[2] + "/" + this.personne?.daterendezvous.split('/')[1] + "/" + this.personne?.daterendezvous.split('/')[0])
        } else
          this.personne.daterendezvous = new Date(this.personne?.daterendezvous);
      }
      if (this.personne.datenaissance) {
        if (this.personne?.datenaissance.length === 10) {
          this.personne.datenaissance = new Date(this.personne?.datenaissance.split('/')[2] + "/" + this.personne?.datenaissance.split('/')[1] + "/" + this.personne?.datenaissance.split('/')[0])
        } else if (this.personne?.datenaissance.length === 19) {
          this.personne.datenaissance = new Date(this.personne?.datenaissance);
        } else {
          this.personne.datenaissance = ""
        }
      }
      if (this.personne.datecreation) {
        if (this.personne?.datecreation.length === 10) {
          this.personne.datecreation = new Date(this.personne?.datecreation.split('/')[2] + "/" + this.personne?.datecreation.split('/')[1] + "/" + this.personne?.datecreation.split('/')[0])
        } else if (this.personne?.datecreation.length === 19) {
          this.personne.datecreation = new Date(this.personne?.datecreation);
        } else {
          this.personne.datecreation = ""
        }
      }
      if (this.personne?.dateexpiration) {
        if (this.personne?.dateexpiration.length === 10) {
          this.personne.dateexpiration = new Date(this.personne?.dateexpiration.split('/')[2] + "/" + this.personne?.dateexpiration.split('/')[1] + "/" + this.personne?.dateexpiration.split('/')[0])
        } else
          this.personne.dateexpiration = new Date(this.personne?.dateexpiration);
      }

      if (this.personne?.resultatTraitement === 'Intéressé') {
        this.isCIntressed = true;
      } else {
        this.isCIntressed = false;
        // this.isIntressed = false;
      }
      if (this.personne?.qualification === 'Prêt débloqué') {

        this.isPretDeb = true;
      } else {

        this.isPretDeb = false;
      }
      if (this.personne?.montantdemande) {
        this.personne.montantdemande = this.personne?.montantdemande.replace(/[\u0600-\u06FF]/g, "").trim()
        this.personne.montantdemande = this.personne?.montantdemande.replace(/[^0-9]/g, "").trim()
      }

      let codeagence = this.personne?.origine == "AW" ? this.personne?.codeagencecible : this.personne?.codeagence;
      let ville = this.personne.ville ? this.personne.ville.charAt(0).toUpperCase() + this.personne.ville.slice(1).toLowerCase() : '';
      console.log("ville :",ville);
      
      let codeorganisme = this.origine == "RS" ? "AAA" : this.origine == "WB" ? "AAA" : this.origine == "AW" ? "AWB" : "";
      let canal = this.origine == "RS" ? "107" : this.origine == "WB" ? "108" : this.origine == "AW" ? "115" : ""

      this.form = this.fb.group({
        user: [this.personne?.user],
        sendMe: [true],
        id: [this.personne?.id],
        agence: [this.personne?.agence],
        entry_date: [this.personne?.entry_date],
        email: [this.personne?.email],
        secteur: [this.personne?.secteur],
        projet: [this.personne?.projet],
        daterendezvous: [this.personne?.daterendezvous],
        typeclient: [this.personne?.typeclient],
        raisonsociale: [this.personne?.raisonsociale],
        raisonsocialesuite: [this.personne?.raisonsocialesuite],
        ice: [this.personne.ice],
        rcommerce: [this.personne.rcommerce],
        nifiscale: [this.personne?.nifiscale],
        numpattente: [this.personne?.numpattente],
        datecreation: [this.personne?.datecreation],
        ribentreprise: [this.personne?.ribentreprise],
        formejuridique: [this.personne?.formejuridique],
        telbureau: [this.personne?.telgsm],
        adresseentreprise: [this.personne?.adresseentreprise],
        rueentreprise: [this.personne?.rueentreprise],
        quartierentreprise: [this.personne?.quartierentreprise],
        codepostaleentreprise: [this.personne?.codepostaleentreprise],
        villeentreprise: [this.personne?.villeentreprise],
        genre: [this.personne?.genre],
        nom: [this.personne?.nom],
        prenom: [this.personne?.prenom],
        cin: [this.personne?.cin],
        dateexpiration: [this.personne?.dateexpiration],
        dateDeblocage: [this.personne?.dateDeblocage],
        adresse: [this.personne?.adresse],
        rue: [this.personne?.rue],
        quartier: [this.personne?.quartier],
        codepostal: [this.personne?.codepostal],
        ville: [ville],
        teldomicile: [this.personne?.telgsm],
        telgsm: [this.personne?.telgsm],
        telprofessionnel: [this.personne?.telgsm],
        datenaissance: [this.personne?.datenaissance],
        situationfamiliale: [this.personne?.situationfamiliale],
        numrib: [this.personne?.numrib],
        niveauformalisme: [this.personne?.niveauformalisme],
        partfemme: [this.personne?.partfemme],
        montantdemande: [this.personne?.montantdemande],
        nombreecheance: [this.personne?.nombreecheance],
        codeagence: [codeagence],
        codegestionnaire: [this.personne?.codegestionnaire],
        action: ['TEST'],
        canal: [canal],
        codeagencecible: [this.personne?.codeagencecible],
        codeorganisme: [codeorganisme],
        origine: [this.origine],
        produit: [this.personne?.produit],
        // resultatTraitement: new FormControl({value: this.personne.resultatTraitement, disabled: this.isCIntressed}),
        resultatTraitement: [this.personne.resultatTraitement],
        statuttraitement: [this.personne?.statuttraitement],
        id_od: [this.personne?.id],
        valeurid: [this.personne?.valeurid],
        qualification: [this.personne?.qualification],
        montantdebloque: [this.personne?.montantdebloque],
        codeTribunal: [this.personne?.montantdebloque],
        utm_source: [this.personne?.utm_source],
        utm_produit: [this.personne?.utm_produit],
        ref_campagne: [this.personne?.ref_campagne],
        // *********************Champs pour RIFSO *************
        //************************************************************************/
        codeActivite: [this.personne?.codeActivite],
        typeLocal: [this.personne?.typeLocal],
        effectif: [this.personne?.effectif],
        dateFinPrlvmt: [this.personne?.dateFinPrlvmt],
        DateRealisation: [this.personne?.DateRealisation],
        chiffreAffaire: [this.personne?.chiffreAffaire],
        numeroContract: [this.personne?.numeroContract],
        //************************************************************************/
      });
    } else {
      this.user = localStorage.getItem('user');
      this.form = this.fb.group({
        user: [this.user],
        sendMe: [true],
        id: [null],
        agence: [''],
        entry_date: [null],
        email: [''],
        secteur: [''],
        projet: [''],
        daterendezvous: [null],
        typeclient: ['P'],
        raisonsociale: [''],
        raisonsocialesuite: [''],
        ice: [''],
        rcommerce: [''],
        nifiscale: [''],
        numpattente: [''],
        datecreation: [null],
        ribentreprise: [null],
        formejuridique: [''],
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
        canal: [canal],
        codeagencecible: [null],
        codeorganisme: [codeorganisme],
        origine: [this.origine],
        produit: [null],
        resultatTraitement: ["Intéressé"],
        statuttraitement: [null],
        id_od: [null],
        valeurid: [null],
        qualification: [null],
        montantdebloque: [null],
        codeTribunal: [null],
        utm_source: [null],
        utm_produit: [null],
        ref_campagne: [null],
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
    }

    this.form.valueChanges.subscribe((res) => {

      console.log("l'origine est :", this.origine);

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
  typeclientChanged() {
    this.personne.typeclient = this.form.value.typeclient
    this.agences = []
    this.villes = this.datafromdialog.villes;
    this.form.patchValue({
      ville: '',
    });
  }
  agenceChange() {
    let agence = this.form.controls['codeagence'].value
    let adressePart = this.agences.filter(el => el.codeagence == agence)
    this.adresse = adressePart[0].adresse
  }
  isEmpty = (obj) => {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  }
  ngAfterViewInit() {
    let data2 = {
      valeurid: this.personne ? this.personne.valeurid : null
    }
    this.callServer.getHistory(data2).subscribe((res: any) => {
      this.history = new MatTableDataSource(res.result);
    })
    this.callServer.getAnomalies(this.datafromdialog.personne?.valeurid).subscribe((res: any) => {
      this.annomalies = new MatTableDataSource(res)
    });
    let data = {
      agence: this.personne ? this.personne.agence : null,
    };
    let dataville = {
      ville: this.personne ? this.personne.ville : "ALL",
    };
    this.callServer.getAgences(dataville).subscribe(
      (resp: any) => {
        this.agences = resp.results;
      },
      (err) => console.log(err)
    );
    if (this.personne && !this.isEmpty(this.personne)) {
      if (this.personne?.datenaissance) {
        this.form.patchValue({
          datenaissance: new Date(this.personne?.datenaissance),
        });
      }
      if (this.personne?.datecreation) {
        this.form.patchValue({
          datecreation: new Date(this.personne?.datecreation),
        });
      }
      if (this.personne?.dateexpiration) {
        this.form.patchValue({
          dateexpiration: new Date(this.personne?.dateexpiration),
        });
      }
    }

    this.getCodePostal();

  }

  preventCaracters(event) {

    let regex = /[0-9]/g;
    var k;
    k = event.key;  //         k = event.keyCode;  (Both can be used)
    let isNumeric = regex.test(k);
    return isNumeric
  }
  async getCodePostal() {
    let ville = this.personne ? this.personne.ville : null
    this.db.getCodePostaleByVille({ ville: ville }).subscribe((res: any) => {
      if (res.length > 0)
        this.form.patchValue({
          codepostal: res.codePostale,
        });
    }, err => console.log(err))
  }




  sendToEvolan() {
    let personne = this.form.value;

    this.isHintNomAR = false;
    this.isHintNom = false;
    this.isHintPrenom = false;
    this.isHintPrenomAR = false;
    this.isHintCIN = false;
    this.isHintSituationFamiliale = false;
    this.isHintAdresse = false;
    this.isHintAdresseAR = false;
    this.isHintVille = false;
    this.isHintVilleAR = false;
    this.isHintStatutTraitement = false;
    this.isHintGenre = false;
    this.isHintCodeAgence = false;
    this.isHintdatenaissance = false;
    this.isHintdatecreation = false;
    this.isHintformejuridique = false;
    this.isHintadresseentreprise = false;
    this.isHintadresseentrepriseAR = false;
    this.isHintraisonsociale = false;
    this.isHinttelgsm = false;
    this.isHintRC = false;
    this.isHintRIB = false;
    this.isHintICE = false;

    personne.montantdemande
    if (personne?.datenaissance) {
      personne.datenaissance = moment(personne?.datenaissance).format('DD/MM/YYYY')
    }
    if (personne?.datecreation) {
      personne.datecreation = moment(personne?.datecreation).format('DD/MM/YYYY')
    }
    if (personne?.dateexpiration) {
      personne.dateexpiration = moment(personne?.dateexpiration).format('DD/MM/YYYY')
    }
    if (personne?.daterendezvous) {
      personne.daterendezvous = moment(personne?.daterendezvous).format('DD/MM/YYYY')
    }
    var count_errors = 0
    console.log("personne?.resultatTraitement :", personne.resultatTraitement);

    if (personne?.resultatTraitement) {

      if (personne?.resultatTraitement === 'Intéressé') {
        personne.action = 'REC';
        var arabicCharUnicodeRange = /[\u0600-\u06FF]/;
        if (!personne?.nom) {
          this.HintNom = 'le nom est obligatoire';
          this.isHintNom = true;
          count_errors++;
        } else if (
          arabicCharUnicodeRange.test(
            String.fromCharCode(personne?.nom.charCodeAt(0))
          )
        ) {
          this.HintNomAR = 'le nom doit être en francais';
          this.isHintNomAR = true;
          count_errors++;
        }
        if (!personne?.prenom) {
          this.HintPrenom = 'le prenom est obligatoire';
          this.isHintPrenom = true;
          count_errors++;

        } else if (
          arabicCharUnicodeRange.test(
            String.fromCharCode(personne?.prenom.charCodeAt(0))
          )
        ) {
          this.HintPrenomAR = 'le prenom doit être en francais';
          this.isHintPrenomAR = true;
          count_errors++;
        }
        if (!personne?.genre) {
          this.HintGenre = 'le genre est obligatoire';
          this.isHintGenre = true;
          count_errors++;
        }
        if (!personne?.cin) {
          this.HintCIN = 'le cin est obligatoire';
          this.isHintCIN = true;
          count_errors++;
        }
        if (personne.typeclient == "M" && !personne.formejuridique) {
          this.Hintformejuridique = 'forme juridique est obligatoire';
          this.isHintformejuridique = true;
          count_errors++;
        }
        if (personne.origine!="AW" && personne.typeclient == "M" && !personne.rcommerce) {
          this.HintRC = 'RC est obligatoire';
          this.isHintRC = true;
          count_errors++;
        }
        // if (personne.typeclient =="M" && !personne.ice) {
        //   this.HintICE = 'ICE est obligatoire';
        //   this.isHintICE = true;
        //   return;
        // }
        // if (personne.typeclient == "M" && !personne.ribentreprise) {
        //   this.HintRIB = 'Numéro RIB est obligatoire';
        //   this.isHintRIB = true;
        //   return;
        // }
        if (personne.typeclient == "M" && !personne.datecreation) {
          this.Hintdatecreation = 'date creation est obligatoire';
          this.isHintdatecreation = true;
          count_errors++;
        }
        if (personne.typeclient == "M" && !personne.raisonsociale) {
          this.Hintraisonsociale = 'raison sociale est obligatoire';
          this.isHintraisonsociale = true;
          count_errors++;
        }
        if (personne.typeclient == "M" && !personne.adresseentreprise) {
          this.Hintadresseentreprise = "l'adresse est obligatoire";
          this.isHintadresseentreprise = true;
          count_errors++;

        } else if (personne.adresseentreprise &&
          arabicCharUnicodeRange.test(
            String.fromCharCode(personne?.adresseentreprise.charCodeAt(0))
          )
        ) {
          this.HintadresseentrepriseAR = "l'adresse doit être en francais";
          this.isHintadresseentrepriseAR = true;
          count_errors++;

        }
        if (personne?.situationfamiliale !== "C" && personne?.situationfamiliale !== "M") {
          this.HintSituationFamiliale =
            'la situation familiale est obligatoire';
          this.isHintSituationFamiliale = true;
          count_errors++;
        }
        if (!personne?.codeagence) {
          this.HintCodeAgence = "l'Agence est obligatoire";
          this.isHintCodeAgence = true;
          count_errors++;
        }
        if (!personne?.telgsm) {
          this.Hinttelgsm = "Téléphone est obligatoire";
          this.isHinttelgsm = true;
          count_errors++;
        }
        if (!personne?.adresse) {
          this.HintAdresse = "l'adresse est obligatoire";
          this.isHintAdresse = true;
          count_errors++;
        } else if (
          arabicCharUnicodeRange.test(
            String.fromCharCode(personne?.adresse.charCodeAt(0))
          )
        ) {
          this.HintAdresseAR = "l'adresse doit être en francais";
          this.isHintAdresseAR = true;
          count_errors++;
        }
        if (!personne?.ville) {
          this.HintVille = 'la ville est obligatoire';
          this.isHintVille = true;
          count_errors++;
        } else if (
          arabicCharUnicodeRange.test(
            String.fromCharCode(personne?.ville.charCodeAt(0))
          )
        ) {
          this.HintVilleAR = 'la ville doit être en francais';
          this.isHintVilleAR = true;
          count_errors++;
        }
        this.isSettingEnded = false;
        console.log("count errors 1 :", count_errors);

        if (count_errors != 0) {
          this.isSettingEnded = true;
          return;
        } else {
          this.callServer.sendToEvolan(personne).subscribe(
            (res: any) => {
              this.isSettingEnded = true;

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
                    an.anomalie,
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
        }
      } else {
        console.log("count errors 2 :", count_errors);

        if (personne?.resultatTraitement === 'nouvelle') {
          this.HintStatutTraitement = 'le resultat de traitement est obligatoire';
          this.isHintStatutTraitement = true;
        } else {
        personne.action = 'TEST';
        this.isSettingEnded = false;
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
      console.log("count errors 3 :", count_errors);

      this.HintStatutTraitement = 'resultat de traitement est obligatoire';
      this.isHintStatutTraitement = true;
    }
  }
  changeQualification() {
    let trait = this.form.value.resultatTraitement;
    if (trait === 'Intéressé') {
      this.form.patchValue({
        qualification: "Sans_feedback"
      });
    }
  }
  retour(status): Promise<any> {
    let user = localStorage.getItem('role')
    if (!this.personne.creation && !this.personne.valeurid) {
      let obj = {
        origine: this.origine,
        id: this.personne?.id,
        user: user,
        nom: this.personne?.nom,
        prenom: this.personne?.prenom,
        telgsm: this.personne?.telgsm,
        cin: this.personne?.cin,
      };
      this.callServer.unlock(obj).subscribe((res) => {
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
