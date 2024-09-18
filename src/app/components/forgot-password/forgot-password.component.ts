import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CallServerService } from 'src/app/services/call-server.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  email:string;
  emailHint: boolean;


  constructor(private router:Router,private matDialogRef:MatDialogRef<ForgotPasswordComponent>, private callServer:CallServerService, private snackBar:MatSnackBar) { }

  ngOnInit(): void {
  }

  annuler(){
    this.matDialogRef.close()
  }
  validate(){
    if (!this.email){
      this.emailHint=true;
      setTimeout(()=>{
        this.emailHint=false
      }, 3000)
      return;
    }
    let data={
      email:this.email
    }
    this.callServer.forgotPassword(data).subscribe((res)=>{
      let snackBarRef = this.snackBar.open('un nouveau mot de passe a été envoyé à votre adresse email.', 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top', panelClass:"successClassSnack"});
      snackBarRef.onAction().subscribe(()=>{
        snackBarRef.dismiss()
      })
      this.matDialogRef.close()
    }, (err)=>{
      if (err.status == 404){
        let snackBarRef = this.snackBar.open(err.error.msg, 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top', panelClass:"failureClassSnack"});
        snackBarRef.onAction().subscribe(()=>{
          snackBarRef.dismiss()
        })
      }else { 
        let snackBarRef = this.snackBar.open('Un problème est survenu, réessayez plus tard.', 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top', panelClass:"failureClassSnack"});
        snackBarRef.onAction().subscribe(()=>{
          snackBarRef.dismiss()
        })
      }
    })
  }

}
