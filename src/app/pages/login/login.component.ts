import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  hide = true;
  data:FormGroup
  constructor(private route:Router, private authService:AuthService, private fb:FormBuilder, private snackBar:MatSnackBar) { }

  ngOnInit(): void {
    this.data = this.fb.group({
      identifiant:['', Validators.required],
      password:['', Validators.required],
      remember:['']
    })
  }

  connectt(event){
    console.log(event.keyCode );
    
    if (event.keyCode === 13 ){
      console.log('enter');
      this.connect()
    }
  }
  connect(){
    console.log('connected')
    this.authService.login(this.data.value).subscribe((res:any)=>{
      localStorage.setItem('token',res.token)
      localStorage.setItem('role',res.role)
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
}
