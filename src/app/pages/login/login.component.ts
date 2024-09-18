import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from 'src/app/components/change-password/change-password.component';
import { ForgotPasswordComponent } from 'src/app/components/forgot-password/forgot-password.component';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  data:FormGroup
  constructor(private dialog:MatDialog,private route:Router, private authService:AuthService, private fb:FormBuilder, private snackBar:MatSnackBar) { }

  ngOnInit(): void {
    var connectbtn = document.getElementById('connect')

    this.data = this.fb.group({
      identifiant:['', Validators.required],
      password:['', Validators.required],
      remember:['']
    })
  }

  connectt(event){
    
    if (event.keyCode === 13 ){
      this.connect()
    }
  }
  connect(){
    
    this.authService.login(this.data.value).subscribe((res:any)=>{
      localStorage.setItem('token',res.token)
      localStorage.setItem('role',res.role)
      localStorage.setItem('user',res.user)
      localStorage.setItem('origins',res.origins)
      localStorage.setItem('organismes',res.organismes)
      localStorage.setItem('regions',res.regions)
      this.route.navigate(['home'])
    },(err)=>{
        if (err.status && err.status === 401) {
          let snackBarRef = this.snackBar.open('identifiant ou password incorrect ou encours de validation!', 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top'});
          snackBarRef.onAction().subscribe(()=>{
            snackBarRef.dismiss()
          })
        }
        else {
          let snackBarRef = this.snackBar.open('Erreur serveur ressayer plus tard!', 'OK', {duration:15000, horizontalPosition:'center', verticalPosition:'top'});
          snackBarRef.onAction().subscribe(()=>{
            snackBarRef.dismiss()
          })
        }
    })
    
  }

  changePassword(){
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      disableClose: true,
      data: {},
    });
    dialogRef.afterClosed().subscribe((e)=>{
      if (e){
      }
    })
  }
  forgotPassword(){
    const dialogRef = this.dialog.open(ForgotPasswordComponent, {
      disableClose: true,
      data: {},
    });
    dialogRef.afterClosed().subscribe((e)=>{
      if (e){
      }
    })
  }
}
