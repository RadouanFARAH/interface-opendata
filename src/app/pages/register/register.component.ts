import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    private databaseService: DatabaseService
  ) {
  }

  ngOnInit(): void {
    this.data = this.fb.group(
      {
        organisme: ['', Validators.required],
        agence: ['', Validators.required],
        nom: [''],
        email: ['', Validators.required],
        password: ['', Validators.required],
        confirmedPassword: ['', Validators.required],
      },
      { validators: this.checkPasswords }
    );
  }
  ngAfterViewInit(){
    this.databaseService
    .getOrganismes()
    .then((res: any) => {
      if (window.openDatabase === undefined){
        this.organismes = res
      }else{
        for (let i = 0; i < res.rows.length; i++) {
          this.organismes.push(res.rows.item(i));
        }
      }
      console.log('result getting organismes', res);

    })
    .catch((error) => {
      console.log('error getting organismes', error);
    });
  }
  checkPasswords(group: FormGroup) {
    // here we have the 'passwords' group
    const password = group.get('password').value;
    const confirmedPassword = group.get('confirmedPassword').value;
    return password === confirmedPassword ? null : { notSame: true };
  }

  onSubmit() {
    console.log(this.data.hasError('notSame'));
  }

  changed() {
    this.agences = []
    let organisme = this.data.get('organisme').value
    this.databaseService
      .getAgenceByOrganisme(organisme)
      .then((res: any) => {
        if (window.openDatabase === undefined){
          this.agences = res
        }else{
          for (let i = 0; i < res.rows.length; i++) {
            this.agences.push(res.rows.item(i));
          }
        }
        console.log(`result of selecting ${organisme} :`,res)
      })
      .catch((error) => {
        console.log('error getting agences by organisme ', error);
      });
  }
}
