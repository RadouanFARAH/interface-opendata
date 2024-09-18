import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CallServerService } from 'src/app/services/call-server.service';
import { DatabaseService } from 'src/app/services/database.service';
declare var window:any;
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  hide = true;
  data: FormGroup;
  organismes: any[]=[];
  agences: any[]=[];
  constructor(
    private fb: FormBuilder,
    private databaseService: DatabaseService,
    private callServer:CallServerService,
    private snackBar : MatSnackBar
  ) {

  }

  ngOnInit(): void {
    this.data = this.fb.group(
      {
        codeorganisme: ['', Validators.required],
        codeagence: ['', Validators.required],
        name: ['',Validators.required],
        email: ['', Validators.required],
        gsm: ['', Validators.required],
        password: ['', Validators.required],
        repassword: ['', Validators.required],
      },
      { validators: this.checkPasswords }
    );
  }
  ngAfterViewInit(){
    this.databaseService.getOrganismes().subscribe((res:any)=>{
      this.organismes = res
    }, err=>{console.log(err)})
  }
  checkPasswords(group: FormGroup) {
    // here we have the 'passwords' group
    const password = group.get('password').value;
    const repassword = group.get('repassword').value;
    return password === repassword ? null : { notSame: true };
  }

  onSubmit() {
    this.callServer.register(this.data.value).subscribe((res)=>{
      let snackBarRef = this.snackBar.open('Utilisateur enregistré en attente de validation!', 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top', panelClass:"successClassSnack"});
      snackBarRef.onAction().subscribe(()=>{
        snackBarRef.dismiss()
      })
      this.data.reset()
    }, err =>{
      if (err.status ===500){
        let snackBarRef = this.snackBar.open("Une Erreur s'est produite, veuillez réessayer plus tard!", 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top', panelClass:"failureClassSnack"});
        snackBarRef.onAction().subscribe(()=>{
          snackBarRef.dismiss()
        })
      } else{
        let snackBarRef = this.snackBar.open(err.error.msg, 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top', panelClass:"failureClassSnack"});
        snackBarRef.onAction().subscribe(()=>{
          snackBarRef.dismiss()
        })
      }
    })
  }

  changed() {
    this.agences = []
    let organisme = this.data.get('codeorganisme').value
    this.databaseService.getAgenceByOrganisme({organisme}).subscribe((res:any)=>{
      this.agences = res
    }, (err)=>{console.log(err)})
  }
}
