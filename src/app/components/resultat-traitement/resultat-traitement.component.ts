import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


@Component({
  selector: 'app-resultat-traitement',
  templateUrl: './resultat-traitement.component.html',
  styleUrls: ['./resultat-traitement.component.scss']
})
export class ResultatTraitementComponent implements OnInit {
  data:any;
  selectedStatus:string
  constructor(
    public dialogRef: MatDialogRef<ResultatTraitementComponent>,
    @Inject(MAT_DIALOG_DATA) public status) {
      this.data = status
    }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
