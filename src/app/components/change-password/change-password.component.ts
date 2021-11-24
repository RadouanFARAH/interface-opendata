import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CallServerService } from 'src/app/services/call-server.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  identifiant:string;
  password:string;
  oldpassword:string;
  passwordHint: boolean;
  oldpasswordHint: boolean;
  identifiantHint: boolean;
  constructor(private router:Router,private matDialogRef:MatDialogRef<ChangePasswordComponent>, private callServer:CallServerService, private snackBar:MatSnackBar) { }

  ngOnInit(): void {
  }
  annuler(){
    this.matDialogRef.close()
  }
  validate(){
    if (!this.identifiant){
      this.identifiantHint=true;
      setTimeout(()=>{
        this.identifiantHint=false
      }, 3000)
      return;
    }
    if (!this.password){
      this.passwordHint = true;
      setTimeout(()=>{
        this.passwordHint=false
      }, 3000)
      return;
    }
    if (!this.oldpassword){
      this.oldpasswordHint = true;
      setTimeout(()=>{
        this.oldpasswordHint=false
      }, 3000)
      return;
    }
    let data={
      password:this.password,
      oldpassword:this.oldpassword,
      identifiant:this.identifiant
    }
    this.callServer.changePassword(data).subscribe((res)=>{
      let snackBarRef = this.snackBar.open('Mot de passe modifié avec succés.', 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top', panelClass:"successClassSnack"});
      snackBarRef.onAction().subscribe(()=>{
        snackBarRef.dismiss()
      })
      this.matDialogRef.close()
    }, (err)=>{
      if (err.status == 416){
        let snackBarRef = this.snackBar.open(err.error.msg, 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top', panelClass:"failureClassSnack"});
        snackBarRef.onAction().subscribe(()=>{
          snackBarRef.dismiss()
        })
      }else if (err.status == 417){
        let snackBarRef = this.snackBar.open(err.error.msg, 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top', panelClass:"failureClassSnack"});
        snackBarRef.onAction().subscribe(()=>{
          snackBarRef.dismiss()
        })
      }else if (err.status == 400){
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
